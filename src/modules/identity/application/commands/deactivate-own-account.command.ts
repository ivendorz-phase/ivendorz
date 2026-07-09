// M1 application (PRIVATE) — `identity.deactivate_own_account.v1` (Doc-4C §C4 PassB:201–213;
// Doc-5C §4.1 row 3: `POST /identity/users/{id}/deactivate_own_account` · 200). W2-IDN-6.1.
//
// Depart + ANONYMIZE (the §14.3 / Architecture §14.3 compliance-redaction model — irreversible;
// implemented via the redaction path, never a hard delete). Frozen validation chain (§C4):
//   SYNTAX (confirmation true) → CONTEXT (authenticated self — upstream) → STATE
//   (`active|suspended → soft-deleted`, via the IDN-5 user state machine — CONSUMED, never rebuilt)
//   → BUSINESS (Last Owner Protection §5.5) → POLICY (none).
//
// TRANSACTION & RLS CONTEXT (frozen mechanism — Doc-6C §6.2a): this command opens its OWN
// interactive transaction and sets `app.user_id` + `app.is_platform_staff = 'true'`
// TRANSACTION-LOCAL — the authored `identity.users` RLS line "(INSERT at provisioning /
// DELETE-anonymize = System/staff)" names the staff GUC leg as THE mechanism for exactly this
// write (the WP-1.3 provisioning precedent). It is required because departure spans MULTIPLE orgs
// (the per-org Last-Owner facts + the in-module membership consequences) — a single-org tenant
// context cannot see or write them. The GUC is a MECHANISM, not attribution: the audit rows are
// attributed to the acting USER (`actor_type = 'user'`), never System (packet acceptance:
// "System never attributed for these caller-driven writes").
//
// SERIALIZATION (RV-0150 T6-F1 contract): the Last-Owner facts are resolved via
// `resolveOwnerRemovalFacts` (which locks the org's active-Owner rows FOR UPDATE) INSIDE this same
// transaction that applies the guarded write — a concurrent Owner-disabling mutation serializes.
//
// IN-MODULE MEMBERSHIP CONSEQUENCES (§C4 State Effects; builder judgment, documented): the
// departing user's live memberships with a LEGAL `→ removed` edge (`active|suspended|invited`,
// Doc-2 §5.2) transition to `removed` — the §5.2 "remove" semantics of leaving every org — each
// audited with the ENUMERATED §9 "membership remove" action (`membership_removed`), attributed to
// the departing user. `pending` rows have NO legal edge to `removed` (Doc-2 §5.2) and are left in
// place fail-closed: their activation precondition ("user not suspended/soft-deleted", Doc-4C §C6)
// can never pass for a departed user. Cross-module effects: NONE authored — [DC-1]; no event.
//
// AUDIT PAYLOAD IS REDACTION-SAFE: old/new carry the STATUS transition + the anonymized FIELD NAMES
// only — never the personal values (writing them into the immutable ledger would defeat the
// anonymization this action performs; Doc-2 §9 preamble redaction rule).

import { prisma } from "../../../../shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  anonymizeAndSoftDeleteUser,
  listLiveMembershipsForUser,
  loadUserAccountRow,
  USER_ANONYMIZATION_FIELDS,
} from "../../infrastructure/data/user-account.repository";
import { transitionMembershipState } from "../../infrastructure/data/membership-lifecycle.repository";
import { resolveOwnerRemovalFacts } from "../../infrastructure/data/membership-lifecycle.repository";
import { evaluateLastOwnerProtection } from "../../domain/policies/last-owner-protection.policy";
import { canTransitionUser } from "../../domain/state-machines/user.state-machine";
import {
  canTransitionMembership,
  type MembershipState,
} from "../../domain/state-machines/membership.state-machine";
import {
  MEMBERSHIP_ENTITY_TYPE,
  MembershipAuditAction,
  USER_ENTITY_TYPE,
  UserAccountAuditAction,
} from "../../domain/audit-actions";
import type { DeactivateOwnAccountInput, DeactivateOwnAccountOutcome } from "../../contracts/types";

/** The server-resolved request context (from the composition edge — never client input). */
export interface DeactivateOwnAccountContext {
  /** The acting (= departing) `identity.users` id — the session subject (Invariant #5). */
  userId: string;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

/** Injected Module 0 contract service — the ONLY audit-write surface (D7 rule 4). */
export interface DeactivateOwnAccountDeps {
  /** `core.append_audit_record.v1` (Doc-4B §A10), injected by the contract TYPE. */
  appendAuditRecord: AppendAuditRecord;
}

// Doc-4C §C4 error register (frozen codes; bound by pointer, never coined).
const INVALID_INPUT_CODE = "identity_user_invalid_input";
const LAST_OWNER_BLOCK_CODE = "identity_user_last_owner_block";
const UPDATE_CONFLICT_CODE = "identity_user_update_conflict";
const NOT_FOUND_CODE = "identity_user_not_found"; // §6.6 collapse code (frozen §C4 user-domain code).

/** The recorded `delete_reason` for the departure tuple (a stable operational marker, not a coined
 *  business enum — Doc-2 §0.2 `delete_reason` is free text). */
const DEPARTURE_DELETE_REASON = "self-deactivation (Doc-4C §C4 departure/anonymization)";

/** RFC-4122 UUID shape for the path `{id}` (Doc-5A §5.4 — a malformed segment is SYNTAX, cat 1). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Deactivate (depart + anonymize) the session subject's account (Doc-4C §C4). Atomic: the status
 * write, the personal-field anonymization, the membership consequences, and EVERY audit row share
 * ONE transaction — any failure rolls all back (D7 rules 5).
 *
 * @param input the §C4 fields (`confirmation`, `updatedAt`).
 * @param ctx   the server-resolved context (`userId` = the departing session subject).
 * @param deps  the injected M0 `appendAuditRecord` contract service.
 */
export async function deactivateOwnAccountCommand(
  input: DeactivateOwnAccountInput,
  ctx: DeactivateOwnAccountContext,
  deps: DeactivateOwnAccountDeps,
  db: typeof prisma = prisma,
): Promise<DeactivateOwnAccountOutcome> {
  // (1) SYNTAX — the path `{id}` (uuid); `confirmation : boolean : required : explicit departure
  //     confirmation` must be literally `true`; `updated_at` required.
  if (typeof input.targetUserId !== "string" || !UUID_PATTERN.test(input.targetUserId)) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "id must be a UUID.",
      },
    };
  }
  if (input.confirmation !== true) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "confirmation must be explicitly true to depart.",
      },
    };
  }
  if (!(input.updatedAt instanceof Date) || Number.isNaN(input.updatedAt.getTime())) {
    return {
      ok: false,
      error: {
        errorClass: "VALIDATION",
        errorCode: INVALID_INPUT_CODE,
        message: "updated_at is required (If-Match) and must be a timestamp.",
      },
    };
  }

  // (2) CONTEXT/SCOPE — self-only (§C4). Foreign `{id}` ⇒ the §6.6 non-disclosure collapse.
  if (input.targetUserId !== ctx.userId) {
    return {
      ok: false,
      error: { errorClass: "NOT_FOUND", errorCode: NOT_FOUND_CODE, message: "Not found." },
    };
  }

  return db.$transaction(async (tx) => {
    // ── The frozen DELETE-anonymize context (Doc-6C §6.2a; see header). Transaction-local — never
    //    leaks past this tx. `app.user_id` keeps the self leg true for the users row itself.
    await tx.$executeRaw`SELECT set_config('app.user_id', ${ctx.userId}::text, true)`;
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // (3) Load the live row (absent/already-departed ⇒ non-disclosure collapse).
    const row = await loadUserAccountRow(ctx.userId, tx);
    if (row === null) {
      return {
        ok: false as const,
        error: {
          errorClass: "NOT_FOUND" as const,
          errorCode: NOT_FOUND_CODE,
          message: "Not found.",
        },
      };
    }

    // (4) STATE — the IDN-5 user machine is the single lifecycle authority (CONSUMED, never
    //     rebuilt): `active|suspended → soft_deleted` are the only legal departure edges.
    if (!canTransitionUser(row.status, "soft_deleted")) {
      return {
        ok: false as const,
        error: {
          errorClass: "CONFLICT" as const,
          errorCode: UPDATE_CONFLICT_CODE,
          message: "The account state does not permit departure.",
        },
      };
    }

    // (5) BUSINESS — Last Owner Protection (§5.5): the user must not be the SOLE active Owner of
    //     ANY org (succession first). Facts resolved per org INSIDE this same locking transaction
    //     (RV-0150 T6-F1 serialization contract — `resolveOwnerRemovalFacts` locks the org's
    //     active-Owner rows FOR UPDATE) and handed to the PURE policy, which decides.
    const memberships = await listLiveMembershipsForUser(ctx.userId, tx);
    for (const membership of memberships) {
      if (membership.state !== "active") continue; // only an ACTIVE membership can be an active Owner.
      const facts = await resolveOwnerRemovalFacts(
        membership.organizationId,
        membership.membershipId,
        tx,
      );
      if (evaluateLastOwnerProtection(facts).blocked) {
        return {
          ok: false as const,
          error: {
            errorClass: "BUSINESS" as const,
            errorCode: LAST_OWNER_BLOCK_CODE,
            message:
              "You are the sole active Owner of an organization; transfer ownership before departing.",
          },
        };
      }
    }

    // (6) WRITE — status → soft_deleted + the personal-field anonymization set, CAS on updated_at.
    const write = await anonymizeAndSoftDeleteUser(
      {
        userId: ctx.userId,
        expectedUpdatedAt: input.updatedAt,
        deleteReason: DEPARTURE_DELETE_REASON,
      },
      tx,
    );
    if (write.outcome !== "deactivated") {
      if (write.outcome === "not_found") {
        return {
          ok: false as const,
          error: {
            errorClass: "NOT_FOUND" as const,
            errorCode: NOT_FOUND_CODE,
            message: "Not found.",
          },
        };
      }
      return {
        ok: false as const,
        error: {
          errorClass: "CONFLICT" as const,
          errorCode: UPDATE_CONFLICT_CODE,
          message: "The user record was modified concurrently; reload and retry.",
        },
      };
    }

    // (7) IN-MODULE MEMBERSHIP CONSEQUENCES — legal `→ removed` edges only (Doc-2 §5.2 via the
    //     IDN-5 machine; see header). Each removal audited with the ENUMERATED §9 "membership
    //     remove" action, attributed to the departing USER — same transaction.
    for (const membership of memberships) {
      const from = membership.state as MembershipState;
      if (!canTransitionMembership(from, "removed")) continue; // `pending` etc. — no legal edge; left fail-closed.
      const moved = await transitionMembershipState(
        { id: membership.membershipId, from, to: "removed", actorUserId: ctx.userId },
        tx,
      );
      if (moved === null) continue; // concurrently moved on — the CAS is the guard; nothing to audit.
      await deps.appendAuditRecord(
        {
          actorId: ctx.userId,
          actorType: "user",
          organizationId: membership.organizationId,
          entityType: MEMBERSHIP_ENTITY_TYPE,
          entityId: membership.membershipId,
          action: MembershipAuditAction.REMOVED,
          oldValue: moved.oldValue,
          newValue: moved.newValue,
          ipAddress: ctx.ipAddress ?? null,
          userAgent: ctx.userAgent ?? null,
        },
        tx,
      );
    }

    // (8) AUDIT — the departure/anonymization record (atomic, same tx; D7). REDACTION-SAFE payload:
    //     status transition + anonymized FIELD NAMES only — never the personal values. The users
    //     record is platform-owned: `organization_id` is null (no org anchor — Doc-2 §9 CR2).
    await deps.appendAuditRecord(
      {
        actorId: ctx.userId,
        actorType: "user",
        organizationId: null,
        entityType: USER_ENTITY_TYPE,
        entityId: ctx.userId,
        action: UserAccountAuditAction.DEACTIVATED,
        oldValue: { status: write.previousStatus },
        newValue: { status: "soft_deleted", anonymized_fields: [...USER_ANONYMIZATION_FIELDS] },
        ipAddress: ctx.ipAddress ?? null,
        userAgent: ctx.userAgent ?? null,
      },
      tx,
    );

    return { ok: true as const, result: { userId: ctx.userId, status: "soft_deleted" as const } };
  });
}
