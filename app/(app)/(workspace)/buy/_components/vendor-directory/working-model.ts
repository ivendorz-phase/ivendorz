// My Vendor Directory — the flat WORKING model the client workspace holds and mutates for the
// prototype's live UX (star / archive / create), plus the SERVER-SIDE composition that builds it and
// the pure filter/sort helpers. PRESENTATION-ONLY.
//
// COMPOSITION SEAM (integrate-not-mock): `buildDirectorySnapshot()` composes the three frozen reads a
// linked record spans — `ops.list_private_vendors.v1` + `ops.get_private_vendor.v1` +
// `ops.get_buyer_supplier_relationship.v1` (Doc-4F §F4.9), plus the M2 public-profile read and the
// D5 offerings — into one serializable snapshot. Today the reads are fixtures (parked, Wave 5); at
// wiring ONLY this function's body changes. The client never re-reads fixtures — it works over the
// passed snapshot, so live favourite/archive/create are honest presentation state (reset on reload;
// persistence is PARKED — `ops.set_vendor_favorite.v1` / `archive_private_vendor.v1` /
// `create_private_vendor.v1`, never claimed as written).
//
// D1(a) (BINDING): only a LINKED record carries ⭐ Preferred / buyer status — the frozen favourite &
// status contracts key on a marketplace `vendor_profile_id`. `canBePreferred` gates that everywhere.

import type {
  BuyerVendorStatus,
  PrivateVendorLinkStatus,
  PrivateVendorState,
  PrivateVendorSource,
} from "../view-models";
import type { PrivateVendorNoteItem, PrivateVendorRatingItem } from "../crm-detail-view-models";
import type {
  BuyerVendorStatusHistoryEntry,
  DirectoryChip,
  DirectoryView,
  MarketplaceClaimState,
  PrivateVendorDetailsExtras,
  VendorOrigin,
} from "./vendor-directory-view-models";
import { deriveVendorOrigin } from "./vendor-directory-view-models";
import {
  PRIVATE_VENDOR_RECORDS,
  RELATIONSHIPS,
  MARKETPLACE_PROFILES,
  getLinkedMarketplaceProfile,
} from "./fixtures";
import { getMarketplaceOfferings, getPrivateOfferings } from "./offerings";

/** A resolved reference to a linked/suggested M2 public profile (displayed, never copied into M4). */
export interface DirectoryProfileRef {
  slug: string;
  name: string;
  category: string;
  location?: string;
  verified?: boolean;
  claimState: MarketplaceClaimState;
}

/** One offering in the working model. `source` drives provenance: profile (M2) vs buyer-maintained. */
export interface DirectoryOffering {
  id: string;
  label: string;
  /** Confirmed/assigned M2 category id — display only; never persisted in M4 (D5 boundary). */
  categoryId?: string;
  /** Buyer "keep as text only" — no system category. */
  textOnly?: boolean;
}

/**
 * The flat, serializable working vendor. Merges the frozen list projection + relationship + derived
 * origin + linked M2 profile + private-record detail + D5 offerings into one object the client can
 * filter, sort, and mutate. Everything is BUYER-PRIVATE (Inv #11).
 */
export interface DirectoryWorkingVendor {
  // ── frozen list projection (ops.list_private_vendors.v1) ──
  id: string;
  name: string;
  linkStatus: PrivateVendorLinkStatus;
  state: PrivateVendorState;
  source: PrivateVendorSource;
  // ── derived (spec §3) ──
  origin: VendorOrigin;
  // ── relationship (ops.get_buyer_supplier_relationship.v1; linked only) ──
  /** `is_favorite` (frozen `vendor_favorites`) — the ⭐ Preferred flag. `false` when unlinked. */
  isFavorite: boolean;
  /** `current_status` — buyer-private CRM status. `none` when unlinked/unset. */
  currentStatus: BuyerVendorStatus;
  /** Append-only status history (Inv #8). Empty when unlinked. */
  statusHistory: BuyerVendorStatusHistoryEntry[];
  // ── linked M2 public profile (displayed, never copied) ──
  linkedProfile?: DirectoryProfileRef;
  /** Present only for `suggested` records — drives the detail link panel (spec §7). */
  suggestedProfile?: DirectoryProfileRef;
  // ── private-record detail (ops.get_private_vendor.v1) ──
  email?: string;
  phone?: string;
  details?: PrivateVendorDetailsExtras;
  notes: PrivateVendorNoteItem[];
  ratings: PrivateVendorRatingItem[];
  // ── products & services (D5) ──
  offerings: DirectoryOffering[];
  /** `marketplace` → composed from the M2 profile (read-only); `buyer` → buyer-maintained (≤10). */
  offeringSource: "marketplace" | "buyer";
  // ── sort input ──
  /** Latest buyer-side touch (ISO), for the "Recently used" sort leg. */
  recencyAt?: string;
  // ── presentation permission stubs (frozen slugs; real gates wire later) ──
  canManagePrivateVendors: boolean;
  canManageVendorStatus: boolean;
}

/** D1(a): only a LINKED record can hold ⭐ Preferred / buyer status. */
export function canBePreferred(vendor: DirectoryWorkingVendor): boolean {
  return vendor.linkStatus === "linked";
}

function toProfileRef(
  profile: ReturnType<typeof getLinkedMarketplaceProfile>,
): DirectoryProfileRef | undefined {
  if (!profile) return undefined;
  return {
    slug: profile.slug,
    name: profile.name,
    category: profile.category,
    location: profile.location,
    verified: profile.verified,
    claimState: profile.claimState,
  };
}

function latestTouch(
  details: PrivateVendorDetailsExtras | undefined,
  history: readonly BuyerVendorStatusHistoryEntry[],
): string | undefined {
  const candidates: string[] = [];
  if (details?.lastContactDate) candidates.push(details.lastContactDate);
  for (const entry of history) candidates.push(entry.at);
  if (candidates.length === 0) return undefined;
  return candidates.reduce((latest, current) =>
    Date.parse(current) > Date.parse(latest) ? current : latest,
  );
}

/**
 * SERVER composition seam — build the full working snapshot from the frozen-read stand-ins. Replace
 * the fixture reads here at wiring; the client and the views never change shape.
 */
export function buildDirectorySnapshot(): DirectoryWorkingVendor[] {
  return PRIVATE_VENDOR_RECORDS.map((record) => {
    const relationship = RELATIONSHIPS[record.id];
    const origin = deriveVendorOrigin(record.linkStatus);
    const profile = getLinkedMarketplaceProfile(record.id);
    const linkedProfile = record.linkStatus === "linked" ? toProfileRef(profile) : undefined;
    const suggestedProfile = record.linkStatus === "suggested" ? toProfileRef(profile) : undefined;
    const statusHistory = relationship?.statusHistory ?? [];

    const offerings: DirectoryOffering[] =
      origin === "marketplace"
        ? getMarketplaceOfferings(linkedProfile?.slug).map((offering, index) => ({
            id: `${record.id}_mp_${index}`,
            label: offering.label,
            categoryId: offering.categoryId,
          }))
        : getPrivateOfferings(record.id).map((offering) => ({
            id: offering.id,
            label: offering.label,
            categoryId: offering.categoryId,
            textOnly: offering.textOnly,
          }));

    return {
      id: record.id,
      name: record.name,
      linkStatus: record.linkStatus,
      state: record.state,
      source: record.source,
      origin,
      isFavorite: relationship?.isFavorite ?? false,
      currentStatus: relationship?.currentStatus ?? "none",
      statusHistory,
      linkedProfile,
      suggestedProfile,
      email: record.email,
      phone: record.phone,
      details: record.details,
      notes: [...record.notes],
      ratings: [...record.ratings],
      offerings,
      offeringSource: origin === "marketplace" ? "marketplace" : "buyer",
      recencyAt: latestTouch(record.details, statusHistory),
      canManagePrivateVendors: true,
      canManageVendorStatus: true,
    } satisfies DirectoryWorkingVendor;
  });
}

// ─────────────────────────────── create / save (Add-Vendor journeys) ───────────────────────────────

/**
 * Journey A input — CREATE a private vendor (`ops.create_private_vendor.v1`; `source` per origin).
 * Buyer-maintained offerings ride the record; confirmed category ids are DISPLAY-only (D5 boundary).
 */
export interface CreatePrivateVendorInput {
  name: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  designation?: string;
  whatsapp?: string;
  website?: string;
  city?: string;
  notes?: string;
  offerings: DirectoryOffering[];
  /** `manual` for the single form; `excel` for a pasted row (frozen `source` enum). */
  source?: PrivateVendorSource;
  /** Optional buyer note as the first record note. */
  noteText?: string;
}

/** Build a working vendor for a newly CREATED private record (unlinked → cannot be preferred, D1(a)). */
export function buildPrivateWorkingVendor(
  id: string,
  input: CreatePrivateVendorInput,
): DirectoryWorkingVendor {
  return {
    id,
    name: input.name.trim(),
    linkStatus: "none",
    state: "active",
    source: input.source ?? "manual",
    origin: "private",
    isFavorite: false,
    currentStatus: "none",
    statusHistory: [],
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    details: {
      contactPerson: input.contactPerson?.trim() || undefined,
      designation: input.designation?.trim() || undefined,
      whatsapp: input.whatsapp?.trim() || undefined,
      website: input.website?.trim() || undefined,
      city: input.city?.trim() || undefined,
      businessDescription: input.notes?.trim() || undefined,
    },
    notes: input.noteText?.trim() ? [{ id: `${id}_n0`, note: input.noteText.trim() }] : [],
    ratings: [],
    offerings: input.offerings,
    offeringSource: "buyer",
    recencyAt: undefined,
    canManagePrivateVendors: true,
    canManageVendorStatus: true,
  };
}

/** Journey B input — SAVE a marketplace vendor (the friendly label for `ops.set_vendor_favorite.v1`). */
export interface SaveMarketplaceInput {
  slug: string;
  name: string;
  category: string;
  location?: string;
  verified?: boolean;
  claimState: MarketplaceClaimState;
  /** When the buyer chose ⭐ Preferred on save (default true — "Save vendor" == mark preferred). */
  preferred?: boolean;
}

/**
 * Build a working vendor for a SAVED marketplace vendor — one action (`set_vendor_favorite`) that
 * creates/reuses the relationship and (default) sets the favourite. Offerings are READ from the M2
 * profile (never copied). No duplicate private record and no M2 content is copied into M4 (D5/MINOR-2).
 */
export function buildMarketplaceWorkingVendor(
  id: string,
  input: SaveMarketplaceInput,
): DirectoryWorkingVendor {
  return {
    id,
    name: input.name,
    linkStatus: "linked",
    state: "active",
    source: "manual",
    origin: "marketplace",
    isFavorite: input.preferred ?? true,
    currentStatus: "none",
    statusHistory: [],
    linkedProfile: {
      slug: input.slug,
      name: input.name,
      category: input.category,
      location: input.location,
      verified: input.verified,
      claimState: input.claimState,
    },
    notes: [],
    ratings: [],
    offerings: getMarketplaceOfferings(input.slug).map((offering, index) => ({
      id: `${id}_mp_${index}`,
      label: offering.label,
      categoryId: offering.categoryId,
    })),
    offeringSource: "marketplace",
    recencyAt: undefined,
    canManagePrivateVendors: true,
    canManageVendorStatus: true,
  };
}

/** A marketplace vendor available to SAVE from Add-Vendor search (not yet in the directory). */
export interface MarketplaceSearchVendor {
  slug: string;
  name: string;
  category: string;
  location?: string;
  verified?: boolean;
  claimState: MarketplaceClaimState;
}

/** The marketplace search corpus (M2 `search_catalog` stand-in) for the Add-Vendor unified search. */
export function buildMarketplaceSearchCorpus(): MarketplaceSearchVendor[] {
  return MARKETPLACE_PROFILES.map((profile) => ({
    slug: profile.slug,
    name: profile.name,
    category: profile.category,
    location: profile.location,
    verified: profile.verified,
    claimState: profile.claimState,
  }));
}

// ─────────────────────────────── pure filter / sort (client-usable) ───────────────────────────────

/** Is this vendor in the given nav view? Archived rows appear ONLY in `archived` (spec §4). */
export function isInView(vendor: DirectoryWorkingVendor, view: DirectoryView): boolean {
  if (view === "archived") return vendor.state === "archived";
  if (vendor.state === "archived") return false;
  switch (view) {
    case "all":
      return true;
    case "marketplace":
      return vendor.origin === "marketplace";
    case "private":
      return vendor.origin === "private";
    case "preferred":
      return vendor.isFavorite;
  }
}

function matchesChip(vendor: DirectoryWorkingVendor, chip: DirectoryChip): boolean {
  switch (chip) {
    case "verified":
      return vendor.linkedProfile?.claimState === "verified";
    case "claimed":
      return vendor.linkedProfile?.claimState === "claimed";
    case "blacklisted":
      return vendor.currentStatus === "blacklisted";
    case "archived":
      return vendor.state === "archived";
  }
}

/**
 * Owner-ruled default sort (spec §4): ⭐ Preferred → Recently used → Marketplace → Private → name.
 * "Recently used" uses buyer-side timestamps only. Pure — the view renders this order, never re-ranks.
 */
export function sortDirectory(a: DirectoryWorkingVendor, b: DirectoryWorkingVendor): number {
  const favorite = Number(b.isFavorite) - Number(a.isFavorite);
  if (favorite !== 0) return favorite;
  const recency =
    (b.recencyAt ? Date.parse(b.recencyAt) : 0) - (a.recencyAt ? Date.parse(a.recencyAt) : 0);
  if (recency !== 0) return recency;
  if (a.origin !== b.origin) return a.origin === "marketplace" ? -1 : 1;
  return a.name.localeCompare(b.name);
}

/** Filter to a view + AND-narrow by chips, then apply the default sort. Pure (client + server safe). */
export function selectDirectoryRows(
  vendors: readonly DirectoryWorkingVendor[],
  view: DirectoryView,
  chips: readonly DirectoryChip[],
): DirectoryWorkingVendor[] {
  return vendors
    .filter((vendor) => isInView(vendor, view))
    .filter((vendor) => chips.every((chip) => matchesChip(vendor, chip)))
    .sort(sortDirectory);
}

/** Per-view counts for the nav tabs (archived excluded from active views by `isInView`). */
export function viewCounts(
  vendors: readonly DirectoryWorkingVendor[],
): Record<DirectoryView, number> {
  return {
    all: vendors.filter((vendor) => isInView(vendor, "all")).length,
    marketplace: vendors.filter((vendor) => isInView(vendor, "marketplace")).length,
    private: vendors.filter((vendor) => isInView(vendor, "private")).length,
    preferred: vendors.filter((vendor) => isInView(vendor, "preferred")).length,
    archived: vendors.filter((vendor) => isInView(vendor, "archived")).length,
  };
}
