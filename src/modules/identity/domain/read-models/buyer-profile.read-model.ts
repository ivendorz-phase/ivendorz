// M1 domain (PRIVATE) — the minimal `buyer_profile` read model for the owning-org read
// (Doc-6C §3.8 entity; Doc-5C §6.1/§6.3 `get_buyer_profile.v1`). A read projection of the
// authoritative `identity.buyer_profiles` row — NOT a source of truth (the table is). WP-1.2
// realizes only the read; mutation aggregates/invariants land with the M1 write surface (Wave-2).
//
// Reference-never-restate: the column set is owned by Doc-2 §10.2; this type binds it by shape.

/** The authoritative buyer_profile fields (Doc-2 §10.2 / Doc-6C §3.8), as read from the table. */
export interface BuyerProfileReadModel {
  /** PK (UUIDv7). */
  id: string;
  /** Owning organization — the tenant anchor (Doc-2 §6). */
  organizationId: string;
  /** Buyer industry; nullable (Doc-2 §10.2). */
  industry: string | null;
  /** Factory info jsonb (Doc-2 §10.2); shape owned upstream, opaque here. */
  factoryInfo: unknown;
  /** Delivery locations jsonb (Doc-2 §10.2); shape owned upstream, opaque here. */
  deliveryLocations: unknown;
  /** Procurement preferences jsonb (Doc-2 §10.2); shape owned upstream, opaque here. */
  procurementPreferences: unknown;
}
