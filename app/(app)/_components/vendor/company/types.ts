// Typed presentation props for the Vendor Company Profile (Milestone 2, S1–S5).
//
// ZERO CONTRACT INVENTION: every field below is a REAL frozen column/enum from Doc-2 §10.3 /
// Doc-6D §3.1.1–§3.1.4 (marketplace) and Doc-6G §3.1.3 (M5 verified tier). These are display props,
// not contract DTOs — the integration phase maps the wired Doc-5D reads onto them. All optional:
// the presentation phase has no data, so screens render their genuine-empty / first-run states.
//
// NOTE (flagged, not invented): the planning companion's S2/S3 wireframes list extra fields
// (incorporation date, registration number, HQ coordinates, operating regions, factory sites,
// "monthly output", "workforce") that are NOT in the frozen Doc-2 §10.3 schema. Per authority order
// (frozen DB wins over the non-authoritative companion) and the no-invention rule, those are OMITTED
// here and recorded as a companion↔corpus reconciliation item — never fabricated.

/** Declared/verified financial tier (Doc-2 §10.3 `tier` enum). */
export type FinancialTier = "A" | "B" | "C" | "D" | "E";

/** Vendor claim lifecycle (Doc-6D `vendor_claim_records`). */
export type ClaimStatus = "seeded" | "invited" | "claimed" | "verified";

/** Public verification projection shown to the vendor (own-org, no fraud/risk detail). */
export type VerificationStatus = "verified" | "pending" | "rejected";

/** Category assignment status (Doc-2 §10.3 `category_assignments.status` enum). */
export type CategoryAssignmentStatus = "proposed" | "active" | "removed";

/** Category assignment level (Doc-2 §10.3 `category_assignments.level` enum). */
export type CategoryLevel = "primary" | "secondary";

/** The four INDEPENDENT capability flags (Invariant 1 / DP7 — a matrix, never a label). */
export interface CapabilityFlags {
  can_supply: boolean;
  can_service: boolean;
  can_fabricate: boolean;
  can_consult: boolean;
}

/** `marketplace.vendor_profiles` (Doc-6D §3.1.1) — identity + geography + capability + standing. */
export interface VendorProfileView {
  human_ref?: string;
  name?: string;
  slug?: string;
  vendor_type_preset?: string;
  country?: string;
  division?: string;
  district?: string;
  industrial_zone?: string;
  capability?: CapabilityFlags;
  claim_status?: ClaimStatus;
  verification_status?: VerificationStatus;
  /** Vendor-declared tier (M2-owned, editable). */
  declared_tier?: FinancialTier;
  /** Trust-verified tier (M5-owned, READ-ONLY to the vendor — firewall). */
  verified_tier?: FinancialTier;
}

/** `marketplace.vendor_capacity_profiles` (Doc-6D §3.1.2). Ranges are text bucket labels. */
export interface CapacityProfileView {
  max_project_value?: number;
  /** ISO 4217 carried by the same value field (Doc-2 §0.4); default BDT. */
  max_project_value_currency?: string;
  max_monthly_rfq_capacity?: number;
  employee_count_range?: string;
  factory_size_range?: string;
  annual_turnover_range?: string;
  /** Names of capacity fields Trust verified (reflects `verified_fields_jsonb`; M2 read-only). */
  verified_fields?: string[];
}

/** `marketplace.category_assignments` (Doc-6D §3.1.4) joined to category name/description. */
export interface CategoryAssignmentView {
  category_id: string;
  name?: string;
  description?: string;
  level?: CategoryLevel;
  is_specialized?: boolean;
  status: CategoryAssignmentStatus;
}

/** A selectable category from `list_categories.v1` (read). */
export interface CategoryOption {
  category_id: string;
  name: string;
  description?: string;
}

/** Append-only entry from `marketplace.financial_tier_history` (Invariant 8 — immutable). */
export interface TierHistoryEntry {
  /** Display timestamp (formatted upstream). */
  at?: string;
  /** "You" for declared changes, "Trust" for verified changes. */
  actor?: string;
  tier: FinancialTier;
  change_type: "declared" | "verified";
}
