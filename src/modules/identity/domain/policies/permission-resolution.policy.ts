// M1 domain (PRIVATE) — the authorization RESOLUTION policy. This is the platform's authorization
// truth: it OWNS the three-layer access formula (Doc-4A §6.1) and the §6B delegated-access check.
// It is a PURE decision function over already-resolved inputs (membership state, the org-anchored
// granted-slug set, the permission's space, the delegation grant, the vendor-profile state) — it
// performs NO I/O and reads NO governance signal (Doc-4C §C3 firewall default). The application query
// (`check-permission.query.ts`) does the reads and hands them here; this module decides.
//
// Reference-never-restate: the access formula and the five delegated-access conditions are frozen in
// Doc-4A §6.1 / §6B.2 (bound below by VERBATIM transcription, per the WP acceptance criteria); this
// policy realizes them, it does not redefine them (Doc-4C §C3: "implements … does not redefine").

/** The authorization decision (Doc-4C §C3 `check_permission` response — `decision`). */
export type PermissionDecision = "allow" | "deny";

/** Which path granted, for auditability (Doc-4C §C3 response — `satisfied_by`). Never leaks a deny reason
 *  beyond scope on the wire; `denyReason` below is an INTERNAL (internal-service audience) diagnostic that
 *  the wire mapper (W2-IDN-6) collapses per §7.5. */
export type SatisfiedBy = "membership" | "delegation" | "none";

/**
 * Diagnostic cause of a `deny` — internal-service only (never a wire disclosure; §7.5 collapse is the
 * wire mapper's job). Lets the app layer distinguish the §6.4 conformance gap (`unknown_slug` →
 * `identity_permission_slug_unknown`, REFERENCE) from a genuine, uniform deny.
 */
export type DenyReason =
  | "unknown_slug" // §6.4 / Doc-4C §C3 error register: slug ∉ Doc-2 §7 catalog — a conformance gap, NEVER a runtime grant.
  | "staff_space_firewall" // RV-0147: a staff-space slug never resolves through org-role membership.
  | "no_active_membership" // §6.1 layer-1: no ACTIVE membership in the active organization.
  | "slug_not_held" // §6.1 layer-2: the org-anchored role composition does not grant the slug.
  | "delegation_denied"; // §6B.2: one or more of the five delegated-access conditions failed.

export type PermissionResolution =
  | { decision: "allow"; satisfiedBy: "membership" | "delegation" }
  | { decision: "deny"; satisfiedBy: "none"; denyReason: DenyReason };

const allow = (satisfiedBy: "membership" | "delegation"): PermissionResolution => ({
  decision: "allow",
  satisfiedBy,
});
const deny = (denyReason: DenyReason): PermissionResolution => ({
  decision: "deny",
  satisfiedBy: "none",
  denyReason,
});

/** The permission-catalog fact the policy needs (Doc-2 §7): does the slug exist, and in which space. */
export interface PermissionCatalogEntry {
  slug: string;
  /** `tenant` = organization space (`can_*`); `staff` = platform space (`staff_*`) — Invariant #2. */
  space: "tenant" | "staff";
}

/**
 * The active-membership fact (Doc-4A §6.1 layer 1). `null` ⇒ the acting user holds NO active membership
 * in the (representative/active) organization — layer 1 fails closed.
 */
export interface ActiveMembershipFact {
  membershipId: string;
  roleId: string;
}

/**
 * An active delegation grant held by the representative organization on the target vendor profile
 * (Doc-4A §6B.2 condition 3), already resolved to the invocation time (validity window + status). The
 * repository pre-filters `status = active` and the validity window; the policy re-affirms membership of
 * the slug in the grant's `permission_set` and the vendor-profile anchor (condition 4).
 */
export interface DelegationGrantFact {
  /** The vendor profile the grant names — condition 4 anchor (must equal the target profile). */
  vendorProfileId: string;
  /** The grant's delegated slug set (`permission_set`, Doc-2 §10.2) — condition 3. */
  permissionSet: readonly string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// The three-layer membership path (Doc-4A §6.1). VERBATIM (transcribed for realization fidelity):
//
//   Active Membership (in the active organization)
//   + Permission Slug(s) (held by the user in that organization)
//   + Resource Ownership / Scope (the resource belongs to, or is granted to, that organization)
//         OR
//   Active Delegation Grant path (§6B)
//   = Access
//
// `grantedSlugs` is the ORG-ANCHORED resolution (RV-0146): the caller resolves `role_permissions`
// anchored on the member's bound `role_id` AND (`organization_id = active_org` OR the NULL system-bundle
// leg) — NEVER by `role_id` alone — and filtered to TENANT space. A forged row pairing another org's
// role_id, or anchored to a different org, therefore never enters this set. The policy trusts that anchor.
// ─────────────────────────────────────────────────────────────────────────────

export interface MembershipPathInput {
  /** The catalog entry for the requested slug (`null` ⇒ unknown slug — §6.4 conformance gap). */
  permission: PermissionCatalogEntry | null;
  /** The acting user's ACTIVE membership in the active org (`null` ⇒ no active membership). */
  membership: ActiveMembershipFact | null;
  /** The ORG-ANCHORED, TENANT-space slug set the member holds in the active org (RV-0146 resolution). */
  grantedSlugs: ReadonlySet<string>;
}

/**
 * Resolve the pure three-layer membership path for `slug` (Doc-4A §6.1). Ordered so the two binding
 * firewalls fail closed BEFORE any grant lookup can matter:
 *   1. Unknown slug ⇒ deny (`unknown_slug`) — §6.4: an unknown slug is never a runtime grant.
 *   2. STAFF-SPACE FIREWALL (RV-0147): a `staff_*` slug NEVER resolves through org-role membership —
 *      staff capability derives only from the platform-staff channel (not this org-context path),
 *      regardless of what `role_permissions` rows exist. ⇒ deny (`staff_space_firewall`).
 *   3. Layer 1: no active membership ⇒ deny (`no_active_membership`).
 *   4. Layer 2 (+ layer 3 via the org-anchored set): slug ∈ grantedSlugs ⇒ allow(membership); else deny.
 */
export function resolveMembershipPath(input: MembershipPathInput): PermissionResolution {
  const { permission, membership, grantedSlugs } = input;

  if (permission === null) return deny("unknown_slug");
  if (permission.space === "staff") return deny("staff_space_firewall");
  if (membership === null) return deny("no_active_membership");

  return grantedSlugs.has(permission.slug) ? allow("membership") : deny("slug_not_held");
}

// ─────────────────────────────────────────────────────────────────────────────
// The §6B delegated-access check (Doc-4A §6B.2). The five conditions, VERBATIM:
//
//   A delegated invocation MUST satisfy ALL of the following — the grant does not replace the acting
//   user's own authorization inside the representative organization:
//   1. The acting user holds an active membership in the representative organization (the active context).
//   2. The acting user holds the required slug within the representative organization.
//   3. The representative organization holds an active Delegation Grant on the target vendor profile whose
//      permission_set includes that slug, and whose validity window covers the invocation time, and whose
//      status is active (Doc-2 §5.10).
//   4. The operation's resource scope resolves against the vendor profile named by the grant — never
//      against the representative organization's own records, and never against any other vendor profile.
//   5. The target vendor profile is itself in a state permitting the operation (per its lifecycle,
//      Doc-2 §5): an active grant MUST NOT authorize operations on a suspended or banned vendor profile
//      beyond what the profile's own state permits. A delegation grant never overrides profile state.
//
// "A grant conveys exactly the slugs in its permission_set; nothing is inherited from the controlling
// organization's roles, bundles, or entitlements." (Doc-4A §6B.2)
// ─────────────────────────────────────────────────────────────────────────────

export interface DelegatedAccessInput {
  /** Catalog entry for the requested slug (`null` ⇒ unknown — §6.4). */
  permission: PermissionCatalogEntry | null;
  /** The target vendor profile the delegated operation acts upon (condition 4 anchor). */
  targetVendorProfileId: string;
  /** Condition 1: the acting user's ACTIVE membership in the representative (active) org. */
  membership: ActiveMembershipFact | null;
  /** Condition 2: the org-anchored TENANT-space slug set the user holds in the representative org. */
  grantedSlugs: ReadonlySet<string>;
  /** Condition 3: the active, in-window delegation grant on the target profile (`null` ⇒ none). */
  grant: DelegationGrantFact | null;
  /**
   * Condition 5: whether the target vendor profile's OWN state permits the operation (resolved via the
   * M2 Vendor Service, injected as a port — never a cross-module import). Fail-closed: when the profile
   * state cannot be affirmatively resolved, the caller passes `false`.
   */
  profileStatePermits: boolean;
}

/**
 * Resolve the §6B delegated-access path. ALL five conditions must hold; any failure ⇒ deny
 * (`delegation_denied`, uniform). The staff-space firewall applies here too: a `staff_*` slug is never
 * delegable through org membership (§6B never widens the staff space).
 */
export function resolveDelegatedAccess(input: DelegatedAccessInput): PermissionResolution {
  const {
    permission,
    targetVendorProfileId,
    membership,
    grantedSlugs,
    grant,
    profileStatePermits,
  } = input;

  if (permission === null) return deny("unknown_slug");
  if (permission.space === "staff") return deny("staff_space_firewall");

  // Condition 1 — active membership in the representative organization.
  if (membership === null) return deny("delegation_denied");
  // Condition 2 — the acting user holds the slug in the representative org (NO inheritance from the grant).
  if (!grantedSlugs.has(permission.slug)) return deny("delegation_denied");
  // Condition 3 — an active, in-window grant whose permission_set includes the slug.
  if (grant === null || !grant.permissionSet.includes(permission.slug)) {
    return deny("delegation_denied");
  }
  // Condition 4 — scope resolves against the vendor profile NAMED BY THE GRANT (never another profile).
  if (grant.vendorProfileId !== targetVendorProfileId) return deny("delegation_denied");
  // Condition 5 — the target vendor profile's own state permits the operation (a grant never overrides it).
  if (!profileStatePermits) return deny("delegation_denied");

  return allow("delegation");
}
