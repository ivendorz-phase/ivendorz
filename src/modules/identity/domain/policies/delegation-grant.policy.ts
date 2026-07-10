// M1 domain (PRIVATE) — the delegation-grant ISSUE policy: the pure guards that decide whether a
// requested `permission_set` may be delegated, and whether a validity window is sane. Pure decision
// functions over already-resolved inputs (the permission catalog, the controlling org's held-slug set) —
// NO I/O, NO governance signal. The application command does the reads and hands them here; this decides.
//
// The three binding rules (Doc-4A §6B / Doc-2 §5.10 / Doc-4C §C9), bound by pointer, never redefined:
//   1. `permission_set_jsonb ⊆ the granting (controlling) org's actually-held tenant slugs` — a grant
//      DELEGATES authority; it never CREATES it (Doc-2 §5.10 "Grants delegate authority; they do not
//      create it"). An org cannot delegate a slug it does not itself hold. This is RV-0146 T6-OBS-1's
//      delegation leg (binding).
//   2. NEVER a staff-space slug (Invariant #2 — Platform Participation ≠ Org Role; the staff space is a
//      SEPARATE namespace). A `staff_*` slug is never delegable through the org (tenant) channel.
//   3. NEVER an ownership-class slug (Doc-2 §5.10 guard "never cover ownership-class actions"; Doc-4C
//      §C9 `identity_delegation_ownership_class_block`). Ownership-class = the Doc-2 §7 Owner-only row.

/**
 * The ownership-class (Owner-only, NEVER-delegable) slugs — bound by pointer to the Doc-2 §7 "Ownership
 * transfer / org delete / verification submission" Owner-only row. These are the actions a delegation
 * grant may never cover (Doc-2 §5.10 guard); coined nowhere — transcribed from Doc-2 §7.
 */
export const OWNERSHIP_CLASS_SLUGS: ReadonlySet<string> = new Set([
  "can_transfer_ownership",
  "can_delete_organization",
  "can_submit_verification",
]);

/** The permission-catalog space of a slug (Doc-2 §7): `tenant` (`can_*`) vs `staff` (`staff_*`) — Inv #2. */
export type PermissionSpace = "tenant" | "staff";

/** Why a `permission_set` was rejected — an internal, discriminated reason the command maps to the frozen
 *  Doc-4C §C9 error register (never leaked verbatim beyond that mapping). */
export type PermissionSetRejectReason =
  | "empty" //          the set is empty — `permission_set` is required (Doc-4C §C9).
  | "unknown_slug" //   a slug ∉ Doc-2 §7 catalog → REFERENCE `identity_permission_slug_unknown`.
  | "staff_space" //    a `staff_*` slug (rule 2) → the tenant-channel firewall; AUTHORIZATION.
  | "ownership_class" //an Owner-only slug (rule 3) → BUSINESS `identity_delegation_ownership_class_block`.
  | "not_held"; //      a tenant slug the controlling org does NOT hold (rule 1) → AUTHORIZATION.

export type PermissionSetValidation =
  | { ok: true }
  | { ok: false; reason: PermissionSetRejectReason; slug: string };

/**
 * Validate a requested `permission_set` for delegation issuance (Doc-4C §C9 create Validation Matrix).
 * Evaluated in the frozen order so the most specific failure surfaces first, per slug:
 *   empty → unknown_slug (REFERENCE) → staff_space (firewall) → ownership_class (BUSINESS) → not_held.
 *
 * @param requestedSlugs      the caller's `permission_set` (JSONB array of slugs, Doc-2 §2).
 * @param catalogSpaceBySlug  the Doc-2 §7 catalog: slug → space (absent ⇒ unknown slug).
 * @param orgHeldTenantSlugs  the controlling org's actually-held TENANT slugs (rule 1 anchor).
 */
export function validatePermissionSetForIssue(
  requestedSlugs: readonly string[],
  catalogSpaceBySlug: ReadonlyMap<string, PermissionSpace>,
  orgHeldTenantSlugs: ReadonlySet<string>,
): PermissionSetValidation {
  if (requestedSlugs.length === 0) {
    return { ok: false, reason: "empty", slug: "" };
  }

  for (const slug of requestedSlugs) {
    const space = catalogSpaceBySlug.get(slug);
    // (a) REFERENCE — the slug must exist in the Doc-2 §7 catalog (§6.4 conformance gap, never a grant).
    if (space === undefined) {
      return { ok: false, reason: "unknown_slug", slug };
    }
    // (b) STAFF-SPACE FIREWALL (rule 2 / Inv #2) — a staff slug is never delegable via the org channel.
    if (space === "staff") {
      return { ok: false, reason: "staff_space", slug };
    }
    // (c) OWNERSHIP-CLASS BLOCK (rule 3 / Doc-2 §5.10 guard) — even a held Owner-only slug is undelegable.
    if (OWNERSHIP_CLASS_SLUGS.has(slug)) {
      return { ok: false, reason: "ownership_class", slug };
    }
    // (d) SUBSET-OF-HELD (rule 1) — the controlling org must itself hold the tenant slug it delegates.
    if (!orgHeldTenantSlugs.has(slug)) {
      return { ok: false, reason: "not_held", slug };
    }
  }

  return { ok: true };
}

/**
 * Validity-window sanity (Doc-4C §C9 create SYNTAX: `valid_from < valid_to`). Mirrors the DB CHECK
 * `delegation_grants_validity_chk (valid_to IS NULL OR valid_to > valid_from)` (Doc-6C §3.9) — the
 * service validates BEFORE hitting it so a bad window is a clean VALIDATION error, not a DB constraint
 * violation. A NULL `validTo` (open-ended / no-expiry) is sane.
 */
export function isValidityWindowSane(validFrom: Date, validTo: Date | null): boolean {
  if (validTo === null) return true;
  return validTo.getTime() > validFrom.getTime();
}
