// M1 application (PRIVATE) — `identity.create_delegation_grant.v1` (Doc-4C §C9). Issue a delegation grant
// from the controlling org (= active org) to a representative org over a controlled vendor profile.
//
// ORCHESTRATION ONLY (owns no state): validate → authorize → resolve refs → write → append audit, ALL on
// the SAME caller-supplied RLS-scoped transaction executor (the D7 canonical audited-write pattern —
// Command → appendAuditRecord() → Repository → Transaction). The command knows the audit OBLIGATION but
// neither the SQL (repository) nor the audit MECHANISM (M0 `core.append_audit_record.v1` facade).
//
// THE TWO INVARIANTS (CTO gate), guaranteed by sharing ONE transaction (`db`, RLS-scoped by
// `withActiveOrgContext` with the controlling org as `app.active_org`):
//   • No business write without an audit row (audit appended in the same tx; a throw rolls the write back).
//   • No audit row without a successful write (audit follows the write in the same tx; any failure rolls both).
//
// AUDIT ACTION: `delegation_grant_issued` — the M1 constant bound BY POINTER to Doc-2 §9 "Vendor profile"
// "delegation grant issue" (Doc-4C §C9). Zero §8 events (M1 frozen truth; [DC-1]).
//
// Validation order is Doc-4C §C9 VERBATIM: SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → REFERENCE → BUSINESS.

import { prisma, type DbExecutor } from "@/shared/db";
import type { AppendAuditRecord, ConfigValueQuery } from "@/modules/core/contracts";
import { buildUserAuditInput } from "./_audit";
import {
  findActiveMembership,
  resolveGrantedTenantSlugs,
} from "../../infrastructure/data/authz.repository";
import {
  findPermissionSpaces,
  insertActiveDelegationGrant,
  isActiveOrganization,
  resolveOrgHeldTenantSlugs,
} from "../../infrastructure/data/delegation-grant.repository";
import {
  isValidityWindowSane,
  validatePermissionSetForIssue,
} from "../../domain/policies/delegation-grant.policy";
import { assertTransition } from "../../domain/state-machines/delegation-grant.state-machine";
import { policyDurationToMs } from "../../domain/value-objects/policy-duration";
import {
  DELEGATION_GRANT_ENTITY_TYPE,
  DelegationGrantAuditAction,
} from "../../domain/audit-actions";
import type {
  CreateDelegationGrantInput,
  CreateDelegationGrantOutcome,
  DelegationGrantError,
  VendorProfileControlReader,
} from "../../contracts/types";

/** The controlling-org authority slug (Doc-2 §7 "Delegation grants (issue/revoke)": `can_manage_delegations`, O,D). */
const CAN_MANAGE_DELEGATIONS = "can_manage_delegations" as const;

/** `identity.delegation_validity_default` POLICY key (Doc-3 v1.9; reference form per Doc-4A §18.2). Read via
 *  `core.config_value_query.v1` when the caller omits `valid_to` — NEVER a hardcoded window literal. */
const DELEGATION_VALIDITY_DEFAULT_KEY =
  "core.system_configuration.identity.delegation_validity_default" as const;

// Doc-4C §C9 error register (frozen codes; bound by pointer, never coined).
const CODE = {
  INVALID_INPUT: "identity_delegation_invalid_input",
  FORBIDDEN: "identity_delegation_forbidden",
  NOT_CONTROLLER: "identity_delegation_not_controller",
  ORG_NOT_FOUND: "identity_org_not_found",
  VENDOR_REF_INVALID: "identity_delegation_vendor_ref_invalid",
  SLUG_UNKNOWN: "identity_permission_slug_unknown",
  OWNERSHIP_BLOCK: "identity_delegation_ownership_class_block",
} as const;

/** Server-resolved request context (from the active-org guard — never client input). The active org IS
 *  the controlling org (Doc-4C §C9 Scope = controlling org). */
export interface CreateDelegationGrantContext {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Injected ports/services. `vendorProfileControlReader` fails closed to `not_found` when omitted. */
export interface CreateDelegationGrantDeps {
  appendAuditRecord: AppendAuditRecord;
  /** `core.config_value_query.v1` — reads `identity.delegation_validity_default` when `valid_to` is omitted. */
  configValueQuery: ConfigValueQuery;
  /** M2 Vendor Service port (read-validation only). Omitted ⇒ fail-closed (`not_found`). */
  vendorProfileControlReader?: VendorProfileControlReader;
}

const err = (
  errorClass: DelegationGrantError["errorClass"],
  errorCode: string,
  message: string,
): CreateDelegationGrantOutcome => ({ ok: false, error: { errorClass, errorCode, message } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Issue a delegation grant (Doc-4C §C9). Must be invoked INSIDE `withActiveOrgContext` with the CONTROLLING
 * org as `app.active_org` — `db` carries the GUCs the `delegation_grants` `_controlling_insert` RLS and the
 * audit `WITH CHECK` both read; the audit is atomic with the insert (same `tx`).
 */
export async function createDelegationGrantCommand(
  input: CreateDelegationGrantInput,
  ctx: CreateDelegationGrantContext,
  deps: CreateDelegationGrantDeps,
  db: DbExecutor = prisma,
): Promise<CreateDelegationGrantOutcome> {
  // (1) SYNTAX (Doc-4C §C9) — uuids well-formed; permission_set a non-empty array; window sane.
  if (!UUID_RE.test(input.representativeOrganizationId) || !UUID_RE.test(input.vendorProfileId)) {
    return err("VALIDATION", CODE.INVALID_INPUT, "representative/vendor id must be a uuid.");
  }
  if (
    !Array.isArray(input.permissionSet) ||
    input.permissionSet.some((s) => typeof s !== "string")
  ) {
    return err(
      "VALIDATION",
      CODE.INVALID_INPUT,
      "permission_set must be an array of slug strings.",
    );
  }
  const validFrom = input.validFrom ?? new Date();
  const suppliedValidTo = input.validTo ?? null;
  if (!isValidityWindowSane(validFrom, suppliedValidTo)) {
    return err("VALIDATION", CODE.INVALID_INPUT, "valid_to must be after valid_from.");
  }

  // (2) CONTEXT is enforced upstream (active-org guard set `app.active_org` = the controlling org).

  // (3) AUTHZ — the acting user holds `can_manage_delegations` in the controlling org (active membership +
  //     org-anchored granted slugs; RV-0146 resolution). No membership / slug not held ⇒ forbidden.
  const membership = await findActiveMembership(ctx.userId, ctx.activeOrgId, db);
  const actingUserSlugs =
    membership === null
      ? new Set<string>()
      : await resolveGrantedTenantSlugs(membership.roleId, ctx.activeOrgId, db);
  if (!actingUserSlugs.has(CAN_MANAGE_DELEGATIONS)) {
    return err("AUTHORIZATION", CODE.FORBIDDEN, "Not permitted to manage delegations.");
  }

  // (4) SCOPE + REFERENCE (vendor profile) — via the injected M2 Vendor Service port (read-validation only).
  const control = deps.vendorProfileControlReader
    ? await deps.vendorProfileControlReader(input.vendorProfileId, ctx.activeOrgId)
    : "not_found"; // fail-closed when the M2 port is absent.
  if (control === "not_found") {
    return err("REFERENCE", CODE.VENDOR_REF_INVALID, "vendor profile not found.");
  }
  if (control === "not_controller") {
    return err(
      "AUTHORIZATION",
      CODE.NOT_CONTROLLER,
      "active org does not control this vendor profile.",
    );
  }

  // (5a) DELEGATION (§6B eligibility) — the representative is a DISTINCT active org (Doc-4C §C9 matrix
  //      PassB:581 places this at DELEGATION, after AUTHZ/SCOPE). In-register VALIDATION code (the class
  //      question is carried to the wire-face WP per RV-0149 NIT-5); only the STAGE ORDER is aligned here.
  if (input.representativeOrganizationId === ctx.activeOrgId) {
    return err(
      "VALIDATION",
      CODE.INVALID_INPUT,
      "representative org must differ from the controlling org.",
    );
  }

  // (5b) REFERENCE (representative org) — must be a live, active organization.
  if (!(await isActiveOrganization(input.representativeOrganizationId, db))) {
    return err("REFERENCE", CODE.ORG_NOT_FOUND, "representative organization not found.");
  }

  // (6) REFERENCE + BUSINESS (permission_set) — catalog lookup + the ⊆-held / staff-space / ownership-class
  //     guards (domain policy). Maps each rejection reason to the frozen §C9 register.
  const catalog = await findPermissionSpaces(input.permissionSet, db);
  const orgHeld = await resolveOrgHeldTenantSlugs(ctx.activeOrgId, db);
  const setCheck = validatePermissionSetForIssue(input.permissionSet, catalog, orgHeld);
  if (!setCheck.ok) {
    switch (setCheck.reason) {
      case "empty":
        return err("VALIDATION", CODE.INVALID_INPUT, "permission_set is required.");
      case "unknown_slug":
        return err("REFERENCE", CODE.SLUG_UNKNOWN, `unknown permission slug: ${setCheck.slug}.`);
      case "staff_space":
        return err("AUTHORIZATION", CODE.FORBIDDEN, "a staff-space slug is not delegable.");
      case "ownership_class":
        return err("BUSINESS", CODE.OWNERSHIP_BLOCK, "an ownership-class slug is not delegable.");
      case "not_held":
        return err("AUTHORIZATION", CODE.FORBIDDEN, "the org does not hold a requested slug.");
    }
  }

  // Resolve `valid_to`: caller-supplied, else the POLICY default (never a literal). Same tx (`db`).
  let validTo = suppliedValidTo;
  if (validTo === null && input.validTo === undefined) {
    const cfg = await deps.configValueQuery({ key: DELEGATION_VALIDITY_DEFAULT_KEY }, db);
    validTo = new Date(
      validFrom.getTime() + policyDurationToMs(cfg.value, "identity.delegation_validity_default"),
    );
  }

  // (7) STATE — assert the Doc-2 §5.10 `draft → active` issue edge on the machine BEFORE the write.
  assertTransition("draft", "active");

  // (8) WRITE — the repository owns the `delegation_grants` insert (born active); returns the audit field set.
  const write = await insertActiveDelegationGrant(
    {
      controllingOrganizationId: ctx.activeOrgId,
      representativeOrganizationId: input.representativeOrganizationId,
      vendorProfileId: input.vendorProfileId,
      permissionSet: input.permissionSet,
      validFrom,
      validTo,
      grantedBy: ctx.userId,
      actorUserId: ctx.userId,
    },
    db,
  );

  // (9) AUDIT — atomic with the write (SAME tx `db`), via the M0 facade ONLY. Canonical `delegation_grant_
  //     issued` action; a throw here rolls the insert back (Invariant 1).
  await deps.appendAuditRecord(
    buildUserAuditInput(ctx, {
      organizationId: ctx.activeOrgId,
      entityType: DELEGATION_GRANT_ENTITY_TYPE,
      entityId: write.id,
      action: DelegationGrantAuditAction.ISSUED,
      oldValue: null,
      newValue: write.newValue,
    }),
    db,
  );

  return { ok: true, result: { delegationGrantId: write.id, status: write.status } };
}
