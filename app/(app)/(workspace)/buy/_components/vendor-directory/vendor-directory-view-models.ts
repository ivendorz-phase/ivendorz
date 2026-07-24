// My Vendor Directory (BUYER_VENDOR_DIRECTORY_SPEC_v1.0 §2–§7; re-home of P-BUY-26/27) — the
// COMPOSED directory view-models. PRESENTATION-ONLY.
//
// The frozen-projection VMs stay UNTOUCHED where they live: `PrivateVendorListItem`
// (`crm-list-view-models.ts` — the `ops.list_private_vendors.v1` 4-field projection) and
// `VendorCrmDetailData` (`crm-detail-view-models.ts` — `ops.get_private_vendor.v1` +
// `ops.get_buyer_supplier_relationship.v1`). The frozen state unions stay in `view-models.ts`
// (whose header forbids non-frozen states). Everything in THIS module that is not a frozen
// projection is exactly one of two things:
//   • DERIVED — computed presentation-side from frozen fields (e.g. `VendorOrigin` from
//     `link_status`, spec §3), never persisted; or
//   • jsonb-shaped — persisted inside `details_jsonb` per the BINDING `ESC-VENDIR-FIELDS` R5
//     interim ruling (esc_registry.md: "Form fields beyond the frozen set persist via
//     details_jsonb (no coined columns)"). These are NOT frozen columns and must NEVER be added
//     to the frozen unions/projections in `view-models.ts` / the CRM view-model files.
//
// GOVERNANCE (load-bearing): the whole Directory is BUYER-PRIVATE (Inv #11 / spec §11) — nothing
// here is ever vendor-facing or cross-buyer; `currentStatus`/blacklist render buyer-side only.

import type { VendorCardVM } from "@/frontend/components/vendor-card";
import type {
  PrivateVendorLinkStatus,
  PrivateVendorState,
  BuyerVendorStatus,
} from "../view-models";
import type { VendorCrmDetailData } from "../crm-detail-view-models";

/**
 * Vendor origin — DERIVED, spec §3 (owner-ruled "no new enum" — NO type enum exists in the
 * corpus): Marketplace = `link_status = linked`; Private = `link_status ∈ {none, suggested}`.
 * Named for SOURCE, not trust level (spec §3). Never persisted; recomputed from `link_status`.
 */
export type VendorOrigin = "marketplace" | "private";

/** Derive the presentation origin from the frozen `link_status` (spec §3 rule, verbatim). */
export function deriveVendorOrigin(linkStatus: PrivateVendorLinkStatus): VendorOrigin {
  return linkStatus === "linked" ? "marketplace" : "private";
}

/**
 * Engagement stage — a NEW jsonb-shaped PRESENTATION concept (persists via `details_jsonb`,
 * R5 interim; registered as a first-class-promotion candidate on the `ESC-VENDIR-FIELDS` item-1
 * basket). LOUD DISCLAIMERS:
 *   • ≠ the frozen `BuyerVendorStatus` (`approved | conditional | blacklisted | none`) — the
 *     stage is a working pipeline note, never an approval signal;
 *   • ≠ the frozen record lifecycle (`active | archived`) — UI "Inactive" == frozen `archived`;
 *     the owner ruled there is NO third lifecycle state (spec §4);
 *   • never enters `state-display.ts` (its header forbids non-frozen states) — it renders via
 *     `directory-display.ts` outline badges instead.
 */
export type EngagementStage = "new" | "contacted" | "quoted_before" | "working";

/**
 * Claim state of a LINKED marketplace profile — from the M2 public profile fixture (spec §3:
 * "verification badge from the linked profile's claim state"). Displayed, never computed here
 * (M5/M2 own it); a presentation echo of the public claim lifecycle, not a coined enum.
 */
export type MarketplaceClaimState = "verified" | "claimed" | "unclaimed";

/**
 * Extra private-record fields — ALL jsonb-shaped: persisted inside `details_jsonb` per the
 * BINDING `ESC-VENDIR-FIELDS` R5 interim ruling (spec §6 GATED-ON-R5.1 rows). No coined columns;
 * every field optional (the frozen request schema is never narrowed, spec §6).
 */
export interface PrivateVendorDetailsExtras {
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  contactPerson?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  designation?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  whatsapp?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  website?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  address?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  city?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  district?: string;
  /** GATED-ON-R5.1 — interim `details_jsonb`. */
  businessDescription?: string;
  /**
   * GATED-ON-R5.2 — category refs on private records are Board-gated. RENDERED (presentation
   * labels) but NEVER PERSISTED until the R5.2 ruling; carried here only so the form/detail can
   * preview the affordance honestly.
   */
  categories?: string[];
  /** jsonb-shaped (R5 interim; `ESC-VENDIR-FIELDS` item-1 promotion candidate). */
  engagementStage?: EngagementStage;
  /**
   * Custom procurement tags — jsonb-shaped (R5 interim; item-1 promotion candidate).
   * ⭐ Preferred = frozen `vendor_favorites`; Approved/Blacklisted = frozen
   * `buyer_vendor_statuses` — those are NEVER modeled as tags (see `directory-display.ts`).
   */
  procurementTags?: string[];
  /** Last contact date (ISO string) — jsonb-shaped (R5 interim; item-1 promotion candidate). */
  lastContactDate?: string;
}

/**
 * One COMPOSED Directory list row (spec §4 "All Vendors" table). Richer than the frozen
 * `ops.list_private_vendors.v1` 4-field projection — the extra groups compose from the
 * relationship read / linked M2 profile / `details_jsonb`, which is the Phase-B DATA LAYER's
 * job (flagged for wiring); the view renders supplied rows and computes nothing.
 */
export interface VendorDirectoryRow {
  // ── Frozen list read (`ops.list_private_vendors.v1` 4-field projection) ──
  /** `private_vendor_record_id` — opaque routing id (Inv #5). */
  id: string;
  /** `name` — buyer-entered vendor name (display). */
  name: string;
  /** `link_status` — private↔public link state. NOT an approval status. */
  linkStatus: PrivateVendorLinkStatus;
  /** `state` — record lifecycle (`active | archived`); UI "Inactive" == `archived`. */
  state: PrivateVendorState;
  // ── DERIVED (presentation-side, spec §3) ──
  /** Origin badge value — derived from `link_status`; never persisted. */
  origin: VendorOrigin;
  // ── Relationship read (`ops.get_buyer_supplier_relationship.v1`; linked records only) ──
  /** `is_favorite` (frozen `vendor_favorites`) — the ⭐ Preferred flag; buyer-private. */
  isFavorite?: boolean;
  /** `current_status` — BUYER-PRIVATE CRM status (Inv #11); renders buyer-side only. */
  currentStatus?: BuyerVendorStatus;
  // ── Linked M2 public profile (DISPLAYED, never copied into private-record fields) ──
  /** Binary verified badge from the linked profile (M5 public projection; absence = no badge). */
  verified?: boolean;
  /** The linked profile's claim state (drives the Verified/Claimed filter chips, spec §4). */
  claimState?: MarketplaceClaimState;
  // ── `details_jsonb` (R5 interim ruling — jsonb-shaped, never frozen columns) ──
  engagementStage?: EngagementStage;
  /** ISO string. */
  lastContactDate?: string;
}

/**
 * One append-only buyer-vendor status history entry (spec §7 "Status history — append-only —
 * history is never overwritten"; Inv #8).
 */
export interface BuyerVendorStatusHistoryEntry {
  /** Opaque entry id (Inv #5). */
  id: string;
  status: BuyerVendorStatus;
  /** ISO-8601 instant, formatted at the render site. */
  at: string;
}

/**
 * The COMPOSED Directory detail view-model (spec §7). Extends the frozen-projection
 * `VendorCrmDetailData` (untouched) with the jsonb-shaped extras and the display-only
 * composition blocks.
 */
export interface VendorDirectoryDetailData extends VendorCrmDetailData {
  /** `details_jsonb` extras (R5 interim ruling — jsonb-shaped). */
  details?: PrivateVendorDetailsExtras;
  /**
   * Append-only status history (spec §7). NO VERIFIED FROZEN HISTORY PROJECTION exists on the
   * relationship read — this shape is presentation-assumed and must be CONFIRMED AT WIRING.
   */
  statusHistory?: BuyerVendorStatusHistoryEntry[];
  /**
   * The linked M2 public profile block — LIVE platform data DISPLAYED alongside the private
   * record (link-not-merge, ADR-003 pointer via spec §2), NEVER copied into private-record
   * fields. Present only when `link_status = linked` (or, for the §7 link panel preview, when
   * a suggestion targets a profile).
   */
  linkedProfile?: VendorCardVM;
}

/**
 * Directory navigation views (spec §4 IA, owner-ruled). "Pending Invitation" is GATED-ON-R4
 * (`ESC-VENDIR-INVITE`) and is deliberately ABSENT from this union until ruled.
 */
export type DirectoryView = "all" | "marketplace" | "private" | "preferred" | "archived";

/**
 * Finer-status FILTER CHIPS (spec §4) — table filter chips, NEVER navigation items. The
 * Blacklisted chip is buyer-side only (buyer-private data; Invariant #11 is a vendor-facing
 * rule and is unaffected).
 */
export type DirectoryChip = "verified" | "claimed" | "blacklisted" | "archived";
