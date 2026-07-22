// Vendor Company Profile presentation components (Team 3, Milestone 2 — S1–S5).
//
// Presentation-only, reusable, route-group-agnostic; composes the FROZEN Doc-7B kit only. Typed props
// bind ONLY real frozen fields (Doc-2 §10.3 / Doc-6D / Doc-6G) — zero contract invention. Blocked
// signals (Trust/Performance score) render as neutral placeholders; the Financial Tier (A–E) and
// verification status are real chips. Wired to live Doc-5D reads in the integration phase.
export { ProfileOverview, type ProfileOverviewProps } from "./profile-overview";
export { IdentityGeographyForm, type IdentityGeographyFormProps } from "./identity-geography-form";
export {
  CapabilitiesCapacityForm,
  type CapabilitiesCapacityFormProps,
} from "./capabilities-capacity-form";
export { FinancialTierPanel, type FinancialTierPanelProps } from "./financial-tier-panel";
export { CategoriesPanel, type CategoriesPanelProps } from "./categories-panel";
export { CompanyProfileTabs, type CompanyProfileTabsProps } from "./company-profile-tabs";

// CapabilityMatrix promoted to the shared kit (landing_page_spec §1.5 — owner-of-record = Doc-7B kit);
// re-exported here so existing Vendor-workspace imports keep their barrel entry point.
export {
  CapabilityMatrix,
  type CapabilityMatrixProps,
} from "@/frontend/components/capability-matrix";
export { TierChip, type TierChipProps } from "./tier-chip";
export { TierHistoryList, type TierHistoryListProps } from "./tier-history-list";
export {
  CategoryAssignmentList,
  type CategoryAssignmentListProps,
} from "./category-assignment-list";
export { VerifiedMarker, type VerifiedMarkerProps } from "./verified-marker";
export {
  VENDOR_TYPE_PRESETS,
  vendorTypePresetLabel,
  type VendorTypePreset,
} from "./vendor-type-presets";
export { MatchingContextBanner, type MatchingContextBannerProps } from "./matching-context-banner";
export { GovernanceBandsPlaceholder } from "./governance-bands-placeholder";
// PresentationFormNote + DescriptionList promoted to vendor/shared (Milestone 8) — import from there.

export type {
  FinancialTier,
  ClaimStatus,
  VerificationStatus,
  CategoryAssignmentStatus,
  CategoryLevel,
  CapabilityFlags,
  VendorProfileView,
  CapacityProfileView,
  CategoryAssignmentView,
  CategoryOption,
  TierHistoryEntry,
} from "./types";
