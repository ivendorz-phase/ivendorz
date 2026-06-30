// Public DTOs / IDs for module "marketplace" (cross-module surface). DTOs/IDs only — domain value-objects
// stay private. Realized per the module's Doc-4D contracts (PassB Discovery) + Doc-6D §3.1 (vendor_profiles)
// + Doc-2 §10.3 (column set) — bound by pointer, never re-authored.
//
// SCOPE (D7-follow-on, M2 public-read slice 1): the PUBLIC vendor-profile read
// (`marketplace.get_public_vendor_profile.v1`). This is the platform's first PUBLIC (anonymous) read surface
// — no auth, no active-org/tenant context; visibility is publish-state RLS (Doc-6D MK-CR2/MK-CR3:
// published + active + non-soft-deleted + non-banned). The CORE profile is realized first; the rich
// published children (microsite / profile sections / branding / SEO / showcase projects / advertisements)
// and the Trust read-model `trust_indicators` (DD-1 — Marketplace READS Trust signals, never calculates
// them — CLAUDE.md §3/§4) are OPTIONAL on the frozen contract and are added in follow-on slices.

/**
 * The four-flag capability MATRIX (Invariant #1 / Doc-6D MK-CR4) — never a single label.
 * Verbatim columns on `vendor_profiles` (Doc-2 §10.3).
 */
export interface VendorCapabilityFlags {
  canSupply: boolean;
  canService: boolean;
  canFabricate: boolean;
  canConsult: boolean;
}

/** Vendor geography (Doc-2 §10.3 hard attributes; Bangladesh administrative hierarchy). All nullable. */
export interface VendorGeography {
  country: string | null;
  division: string | null;
  district: string | null;
  industrialZone: string | null;
}

/** A category a vendor is assigned to (Doc-6D MK-CR8 — platform-owned 4-level tree; public-read). */
export interface VendorCategoryRef {
  categoryId: string;
  name: string;
  /** Parent in the ≤4-level tree (`parent_id` self-FK); null at level 1 (Doc-6D MK-CR8). */
  parentCategoryId: string | null;
}

/**
 * The PUBLIC vendor-profile projection (Doc-4D `get_public_vendor_profile.v1`; Doc-2 §10.3 column set). The
 * CORE published view — what the Public Experience renders for a vendor. The `claim_state`/`status` model is
 * NOT exposed (a returned public profile is, by the publish-state RLS, an active published one — non-disclosure,
 * Doc-6D R9): absent / soft-deleted / banned / unpublished all collapse to `found: false`.
 *
 * Marketplace-owned fields only. `declaredTier` is the **declared** financial tier (Doc-6D MK-CR5/DD-1) — NOT
 * the Trust-verified tier; Marketplace never calculates a governance signal.
 */
export interface PublicVendorProfileView {
  /** PK (UUIDv7) of the vendor_profiles row. */
  vendorProfileId: string;
  /** Year-scoped human reference `VENDOR-YYYY-NNNNNN` (Doc-6D MK-CR11; display-only). */
  humanRef: string;
  /** Vendor display name. */
  name: string;
  /** Vendor-type preset (manufacturer | service_provider | trader | other); nullable. */
  vendorTypePreset: string | null;
  /** The four-flag capability matrix (Invariant #1). */
  capabilityFlags: VendorCapabilityFlags;
  /** Hard-attribute geography (Doc-2 §10.3). */
  geography: VendorGeography;
  /** Declared financial tier `A`–`E` (Marketplace-owned declared tier — NOT the Trust-verified tier; DD-1). Nullable. */
  declaredTier: string | null;
  /** Active category assignments (Doc-6D MK-CR8; `status='active'` only). */
  categories: VendorCategoryRef[];
}

/**
 * Outcome of `marketplace.get_public_vendor_profile.v1`. Non-disclosure (Doc-6D R9 / Doc-5A §6.6): an absent,
 * soft-deleted, banned, or unpublished profile all collapse to the SAME `found: false` (the wire `404` —
 * indistinguishable; never leaks which).
 */
export type GetPublicVendorProfileResult =
  { found: true; profile: PublicVendorProfileView } | { found: false };

/**
 * Lookup key for `get_public_vendor_profile` — EXACTLY ONE of `vendorProfileId` (UUIDv7) or `humanRef`
 * (`VENDOR-YYYY-NNNNNN`). Both-or-neither is a VALIDATION error (Doc-4D §C SYNTAX). Public input only —
 * no org/tenant context (this is an anonymous public read).
 */
export interface GetPublicVendorProfileKey {
  vendorProfileId?: string;
  humanRef?: string;
}
