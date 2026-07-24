// My Vendor Directory — display mapping for the DERIVED / jsonb-shaped presentation concepts.
//
// Deliberately SEPARATE from `../state-display.ts`, whose header forbids any non-frozen state
// from entering it. Nothing in this module is a frozen Doc-4M / Doc-2 §3.5 state — everything
// here is either DERIVED (origin) or jsonb-shaped per the `ESC-VENDIR-FIELDS` R5 interim ruling
// (see `vendor-directory-view-models.ts`).
//
// ENCODING RULE (keeps the governance distinction VISIBLE in the UI): frozen statuses
// (link status, buyer-vendor status, lifecycle) render via the kit `StatusChip` with labels from
// `../state-display.ts`; the jsonb-shaped stage/tags in THIS module render via outline `Badge`
// only — a frozen status never shares a visual treatment with a jsonb-shaped presentation note.

import type {
  DirectoryChip,
  DirectoryView,
  EngagementStage,
  VendorOrigin,
} from "./vendor-directory-view-models";

/** Engagement stage → label (jsonb-shaped, R5 interim; renders as an outline Badge, never a StatusChip). */
export const engagementStageDisplay: Record<EngagementStage, { label: string }> = {
  new: { label: "New" },
  contacted: { label: "Contacted" },
  quoted_before: { label: "Quoted Before" },
  working: { label: "Working" },
};

/** Vendor origin → badge label (DERIVED from `link_status`, spec §3 — source, not trust level). */
export const originDisplay: Record<VendorOrigin, { label: string }> = {
  marketplace: { label: "Marketplace" },
  private: { label: "Private" },
};

/**
 * Suggested CUSTOM procurement tags — jsonb-shaped free-text tags (R5 interim ruling).
 * DELIBERATELY EXCLUDED from suggestions, forever: ⭐ Preferred (frozen `vendor_favorites`) and
 * Approved / Conditional / Blacklisted (frozen `buyer_vendor_statuses`) are FROZEN concepts with
 * their own contracts and affordances — they are NEVER offered or accepted as tags.
 */
export const SUGGESTED_PROCUREMENT_TAGS: readonly string[] = ["Backup Vendor", "Under Evaluation"];

/**
 * Directory navigation views (spec §4 IA, owner-ruled order). The ⭐ on "Preferred Vendors"
 * renders as a lucide `Star` icon at the view layer, not as label text. "Pending Invitation"
 * (GATED-ON-R4, `ESC-VENDIR-INVITE`) is absent until ruled.
 */
export const DIRECTORY_VIEWS: ReadonlyArray<{ value: DirectoryView; label: string }> = [
  { value: "all", label: "All Vendors" },
  { value: "marketplace", label: "Marketplace Vendors" },
  { value: "private", label: "Private Vendors" },
  { value: "preferred", label: "Preferred Vendors" },
  { value: "archived", label: "Archived" },
];

/**
 * Finer-status chips (spec §4) — TABLE FILTER CHIPS, NEVER NAVIGATION ITEMS. The Blacklisted
 * chip renders buyer-side only (buyer-private `buyer_vendor_statuses` data; Invariant #11 is a
 * vendor-facing rule and is unaffected — nothing here is ever vendor-visible, spec §11).
 */
export const DIRECTORY_CHIPS: ReadonlyArray<{ value: DirectoryChip; label: string }> = [
  { value: "verified", label: "Verified" },
  { value: "claimed", label: "Claimed" },
  { value: "blacklisted", label: "Blacklisted" },
  { value: "archived", label: "Archived" },
];
