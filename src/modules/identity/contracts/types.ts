// Public DTOs / IDs for module "identity" (cross-module surface). DTOs/IDs only — domain
// value-objects stay private. Realized per the module's Doc-5C / Doc-6C contracts.
//
// Reference-never-restate: field names/semantics are owned by Doc-2 §10.2 (the buyer_profiles
// column set) and the read shape by Doc-5C §6.1/§6.3 (`identity.get_buyer_profile.v1`); bound by
// pointer, never re-authored here. WP-1.2 realizes the buyer-profile read DTO + outcome; WP-1.3
// adds the first-login provisioning DTOs.

/**
 * The `identity.buyer_profiles` read projection (Doc-2 §10.2 column set; Doc-6C §3.8).
 * Owning-org / active-org singleton (one per org — `buyer_profiles_org_live_uq`). The jsonb
 * columns carry IDs/values only (Doc-6A §12); their internal shape is owned by Doc-2 §10.2 and
 * left opaque (`unknown`) here — Doc-5C representation is bound by pointer, not coined.
 */
export interface BuyerProfileView {
  /** PK (UUIDv7) of the buyer_profile row. */
  id: string;
  /** Owning organization (the active-org / tenant anchor — Doc-2 §6). */
  organizationId: string;
  /** Buyer industry (Doc-2 §10.2); nullable. */
  industry: string | null;
  /** Factory info (Doc-2 §10.2); jsonb, shape owned upstream. */
  factoryInfo: unknown;
  /** Delivery locations (Doc-2 §10.2); jsonb, shape owned upstream. */
  deliveryLocations: unknown;
  /** Procurement preferences (Doc-2 §10.2); jsonb, shape owned upstream. */
  procurementPreferences: unknown;
}

/**
 * Outcome of `identity.get_buyer_profile.v1` (Doc-5C §6.1 row 33; §6.3 non-disclosure).
 * Active-org singleton read scoped by RLS (`app.active_org`). When the active org has no
 * buyer_profile — or the target is cross-tenant — the read collapses to `not-found`
 * (Doc-5C §6.3: cross-tenant reads collapse to `404`, indistinguishable from genuine absence).
 * Doc-5C realizes the wire `404`; the in-process query surfaces the same fact as `found: false`.
 */
export type GetBuyerProfileResult = { found: true; profile: BuyerProfileView } | { found: false };

/**
 * Input to lazy first-login identity provisioning (WP-1.3) — the authenticated Supabase subject.
 *
 * Provisioning is OUT-OF-BAND (Doc-7E §2 / `[ESC-7-API-SIGNUP]`): signup coins NO `create_user`
 * wire contract; M1 materializes the identity (user + Personal Organization + Owner membership) on
 * first authenticated login. `authUserId` is the Supabase `auth.users` id — the infra auth-boundary
 * linkage (Doc-6C §3.1 / DC-4); the credential/secret never reaches M1.
 */
export interface ProvisionIdentityInput {
  /** The Supabase `auth.users` id linking the session to the `identity.users` record (Doc-6C §3.1). */
  authUserId: string;
  /** The subject's email (auth-managed identifier; persisted on `identity.users` per Doc-2 §10.2). */
  email?: string | null;
}

/**
 * Outcome of provisioning — the resolved identity (created or pre-existing).
 * `created = false` ⇒ idempotent no-op (the identity already existed); the ids reflect the
 * authoritative existing rows.
 */
export interface ProvisionIdentityResult {
  /** True when this call materialized the identity; false on the idempotent path. */
  created: boolean;
  /** The `identity.users` id (UUIDv7). */
  userId: string;
  /** The Personal Organization id (UUIDv7), or null if not resolvable on the idempotent path. */
  organizationId: string | null;
  /** The org `human_ref` (`ORG-YYYY-NNNNNN`), or null if not resolvable on the idempotent path. */
  organizationHumanRef: string | null;
  /** The founding Owner membership id (UUIDv7), or null if not resolvable on the idempotent path. */
  ownerMembershipId: string | null;
}
