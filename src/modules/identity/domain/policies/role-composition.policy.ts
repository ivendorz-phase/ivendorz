// M1 domain (PRIVATE) — the role-bundle COMPOSITION policy: the pure guards deciding whether a
// requested slug set may compose a tenant custom role, and whether a role NAME is admissible. Pure
// decision functions over already-resolved inputs (the permission catalog space-map, the requested
// slugs, the name) — NO I/O, NO governance signal. The application command does the reads and hands
// them here; this decides. It CONSUMES the ratified ownership-class set from the delegation-grant
// policy (the DC-CR7 precedent — coined once, in ONE place); it does not re-declare it.
//
// The binding rules (Doc-4C §C7 · Doc-2 §7 · Invariant #2), bound by pointer, never redefined:
//   1. ⊆ THE ASSIGNABLE TENANT CATALOG (Doc-4C §C7 REFERENCE "each permission_slug ∈ §7 catalog";
//      §6.4 "unknown slug, never invented"). The assignable set for a TENANT custom bundle is the
//      TENANT-space slugs. A slug the platform catalog does not carry is `unknown`.
//   2. NEVER A STAFF-SPACE SLUG (Invariant #2 — Platform Participation ≠ Org Role; the staff space
//      is a SEPARATE namespace, Doc-2 §7 "Platform-staff slugs (separate space)"; RV-0147 B8). A
//      `staff_*` slug is never assignable to an org role — the WRITE-side realization of the
//      resolution-side firewall (`resolveGrantedTenantSlugs` already filters staff out; the seed's
//      Invariant #2 hard guard is "ZERO staff-space slugs mapped to any bundle").
//   3. NEVER AN OWNERSHIP-CLASS SLUG (Doc-2 §7 "Ownership transfer / org delete / verification
//      submission | Owner-only"; the DC-CR7 delegation precedent, Doc-2 §5.10 "never cover
//      ownership-class actions"). Ownership-class slugs ARE valid tenant slugs, but they are Owner-only
//      — RESERVED to the system Owner bundle. Composing one into a CUSTOM role would let a non-Owner
//      hold an Owner-only power (`transfer_ownership` is gated by the `can_transfer_ownership` slug —
//      see `transfer-ownership.command.ts`), breaching "Owner-only". So they are not part of the
//      tenant-assignable-to-custom-role catalog.
//
// The three rejections are surfaced by the COMMAND to their frozen §C7 error codes (this policy only
// discriminates the REASON, for the audit + the RV-0147 discriminating tests):
//   `unknown` / `staff_space` / `ownership_class` → the caller maps all three to the frozen REFERENCE
//   `identity_permission_slug_unknown` (422) — byte-identical on the wire (the RV-0147 widening/
//   forgery-reject idiom + non-disclosure: a staff/ownership-class slug is treated exactly like a
//   typo, so the org-role surface never confirms a staff slug nor flags an ownership-class slug as
//   "special"). The POLICY keeps the reasons distinct so the tests prove each guard independently.

import { OWNERSHIP_CLASS_SLUGS } from "./delegation-grant.policy";

/** The permission-catalog space of a slug (Doc-2 §7): `tenant` (`can_*`) vs `staff` (`staff_*`) — Inv #2. */
export type PermissionSpace = "tenant" | "staff";

/**
 * Why a requested slug is NOT assignable to a tenant custom role — an internal, discriminated reason
 * the command maps to the frozen Doc-4C §C7 register (never leaked verbatim beyond that mapping). The
 * three map to the SAME frozen REFERENCE code (`identity_permission_slug_unknown`, byte-identical) —
 * kept distinct HERE so the RV-0147 discriminating tests prove each guard rejects independently.
 */
export type SlugRejectReason =
  | "unknown" //         a slug ∉ Doc-2 §7 catalog (§6.4 conformance gap — never a runtime grant).
  | "staff_space" //     a `staff_*` slug (rule 2 / Invariant #2) — the separate-namespace firewall.
  | "ownership_class"; // an Owner-only slug (rule 3 / DC-CR7) — reserved to the system Owner bundle.

export type SlugSetValidation =
  | { ok: true }
  | { ok: false; reason: SlugRejectReason; slug: string };

/**
 * Validate a requested slug set for TENANT custom-role composition (Doc-4C §C7 `create_role` /
 * `set_role_permissions` — the `permission_slugs` initial bundle and the `add_slugs` legs). Evaluated
 * in the frozen order so the most specific failure surfaces first, PER slug:
 *   unknown (REFERENCE) → staff_space (Invariant #2 firewall) → ownership_class (DC-CR7).
 * The order matches the delegation `validatePermissionSetForIssue` policy (the DC-CR7 sibling).
 *
 * An EMPTY set is admissible here (a role may carry no slugs — an empty initial bundle, or a compose
 * that only REMOVES). The command owns any "at least one add/remove" SYNTAX rule per contract.
 *
 * @param requestedSlugs      the caller's slug set (`permission_slugs` / `add_slugs`).
 * @param catalogSpaceBySlug  the Doc-2 §7 catalog: slug → space (absent ⇒ `unknown`).
 */
export function validateAssignableSlugs(
  requestedSlugs: readonly string[],
  catalogSpaceBySlug: ReadonlyMap<string, PermissionSpace>,
): SlugSetValidation {
  for (const slug of requestedSlugs) {
    const space = catalogSpaceBySlug.get(slug);
    // (a) ⊆ CATALOG (rule 1) — the slug must exist in the Doc-2 §7 catalog (§6.4; never invented).
    if (space === undefined) {
      return { ok: false, reason: "unknown", slug };
    }
    // (b) STAFF-SPACE FIREWALL (rule 2 / Invariant #2) — a staff slug is never assignable to an org role.
    if (space === "staff") {
      return { ok: false, reason: "staff_space", slug };
    }
    // (c) OWNERSHIP-CLASS BLOCK (rule 3 / DC-CR7) — even a held Owner-only tenant slug is not composable
    //     into a CUSTOM role (reserved to the system Owner bundle). Consumes the ratified set (one owner).
    if (OWNERSHIP_CLASS_SLUGS.has(slug)) {
      return { ok: false, reason: "ownership_class", slug };
    }
  }
  return { ok: true };
}

/**
 * The four reserved system-bundle names (Doc-2 §7 / Doc-6C §5.2 seed — Owner/Director/Manager/Officer,
 * `organization_id IS NULL`, `is_system_bundle = true`). A CUSTOM role may not take one of these names
 * (Doc-4C §C7 create BUSINESS "not a reserved system-bundle name") — otherwise a tenant "Owner" role
 * would shadow the system Owner bundle (the DB `roles_org_name_live_uq` index does NOT catch it: it is
 * scoped `organization_id IS NOT NULL`, so a per-org "Owner" does not collide with the NULL-org seed).
 * Bound by pointer to the frozen seed identities — coined nowhere.
 */
export const RESERVED_SYSTEM_BUNDLE_NAMES: ReadonlySet<string> = new Set([
  "owner",
  "director",
  "manager",
  "officer",
]);

/**
 * Whether a proposed role name collides with a reserved system-bundle name (Doc-4C §C7 create/update
 * BUSINESS). Case-insensitive: a lower/upper-case variant ("owner", "OWNER") would still shadow the
 * seed for a reader, so all casings are reserved [judgment call — the display-label safety reading].
 */
export function isReservedSystemBundleName(name: string): boolean {
  return RESERVED_SYSTEM_BUNDLE_NAMES.has(name.trim().toLowerCase());
}
