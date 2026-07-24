// My Vendor Directory — PRESENTATION-ONLY FIXTURES (the single fixture module for the milestone).
//
// Every fixture + selector is shaped EXACTLY like the frozen reads it stands in for —
// `ops.list_private_vendors.v1` (the 4-field projection), `ops.get_private_vendor.v1`,
// `ops.get_buyer_supplier_relationship.v1` (Doc-4F §F4.9 via `crm-*-view-models.ts`) — so
// Phase-B wiring swaps SELECTOR BODIES ONLY; no view changes shape. ZERO network/API calls.
//
// FIXTURES CARRY SHAPE, NOT CLAIMS (reference-fidelity directive): fictional Bangladeshi
// industrial company names, `.example` reserved-TLD domains, placeholder phone numbers — and NO
// invented stats, counts, or traction figures anywhere.
//
// MARKETPLACE ALIGNMENT (critical): every marketplace profile below reuses a slug/identity that
// already exists in the discover surface's mock catalog (`buy/discover/page.tsx` MOCK_VENDORS,
// itself aligned to the public seed `app/(public)/_components/discovery/seed.ts`), so
// `/vendors/[slug]` deep links resolve instead of 404ing. No second fictional catalog.
//
// GOVERNANCE: everything here is BUYER-PRIVATE (Inv #11 / spec §11) — statuses, notes, ratings,
// tags, and the blacklist never leave the owning buyer org; nothing is ever vendor-facing.

import type { VendorCardVM } from "@/frontend/components/vendor-card";
import type { BuyerVendorStatus } from "../view-models";
import type { CrmListData, PrivateVendorListItem } from "../crm-list-view-models";
import type {
  BuyerVendorStatusHistoryEntry,
  DirectoryChip,
  DirectoryView,
  MarketplaceClaimState,
  VendorDirectoryDetailData,
  VendorDirectoryRow,
} from "./vendor-directory-view-models";
import { deriveVendorOrigin } from "./vendor-directory-view-models";

/**
 * One full private-vendor record fixture — the `ops.get_private_vendor.v1` projection (record +
 * notes + ratings) plus the jsonb-shaped `details` extras (R5 interim). Relationship data
 * (status/favorite/history) deliberately lives in `RELATIONSHIPS` (a SEPARATE frozen read);
 * the linked-profile block lives in `MARKETPLACE_PROFILES` (an M2 read) — mirroring the
 * three-read composition the Phase-B data layer performs.
 */
export type PrivateVendorRecordFixture = Omit<
  VendorDirectoryDetailData,
  "currentStatus" | "isFavorite" | "statusHistory" | "linkedProfile"
>;

/**
 * The buyer org's private vendor records (`operations.private_vendor_records`, BC-OPS-1).
 * Coverage matrix (all exercised): linked+verified+approved+favorite (pv_01) · linked+claimed/
 * unverified (pv_02) · linked+blacklisted (pv_03) · `suggested` link (pv_04 — drives the §7
 * detail link panel) · plain private with stage/tags/last-contact (pv_05) · archived private
 * (pv_06) · archived marketplace-linked (pv_07) · linked with `currentStatus` none (pv_08).
 */
export const PRIVATE_VENDOR_RECORDS: readonly PrivateVendorRecordFixture[] = [
  {
    id: "pv_01",
    name: "Padma Valve & Fittings Ltd.",
    email: "sales@padmavalve.example",
    phone: "+880 1700-000201",
    source: "manual",
    linkStatus: "linked",
    state: "active",
    notes: [
      {
        id: "pvn_01",
        note: "Primary source for gate valves and flanged fittings. Confirm stock with Mahmudul before issuing a PO.",
      },
    ],
    ratings: [
      { id: "pvr_01", score: 5, comment: "Reliable quality; test certificates always complete." },
    ],
    details: {
      contactPerson: "Mahmudul Hasan",
      designation: "Senior Sales Manager",
      whatsapp: "+880 1700-000201",
      website: "https://padmavalve.example",
      address: "Plot 12, Tejgaon I/A",
      city: "Dhaka",
      district: "Dhaka",
      engagementStage: "working",
      lastContactDate: "2026-07-08",
    },
  },
  {
    id: "pv_02",
    name: "Jamuna Electrical & Drives",
    email: "info@jamunadrives.example",
    phone: "+880 1700-000202",
    source: "manual",
    linkStatus: "linked",
    state: "active",
    notes: [
      {
        id: "pvn_02",
        note: "Quoted on the conveyor drive package; ask for itemized commissioning scope next time.",
      },
    ],
    ratings: [{ id: "pvr_02", score: 3 }],
    details: {
      contactPerson: "Farid Ahmed",
      designation: "Director (Sales)",
      city: "Dhaka",
      district: "Gazipur",
      engagementStage: "quoted_before",
      procurementTags: ["Under Evaluation"],
      lastContactDate: "2026-06-24",
    },
  },
  {
    id: "pv_03",
    name: "Bengal Steel Industries",
    email: "orders@bengalsteel.example",
    phone: "+880 1700-000203",
    source: "manual",
    linkStatus: "linked",
    state: "active",
    notes: [
      {
        id: "pvn_03",
        note: "Do not include in new RFQs until the delivery dispute on our last order is resolved.",
      },
    ],
    ratings: [],
    details: {
      contactPerson: "Shafiqul Bari",
      designation: "Commercial Manager",
      city: "Chattogram",
      district: "Chattogram",
      lastContactDate: "2026-05-30",
    },
  },
  {
    // `link_status = suggested` — drives the §7 detail LINK PANEL ("This vendor may have joined
    // iVendorz — review & link"). Nothing auto-links; suggestion provenance is never vendor-exposed.
    id: "pv_04",
    name: "Meghna Pumps & Motors",
    email: "service@meghnapumps.example",
    phone: "+880 1700-000204",
    source: "excel",
    linkStatus: "suggested",
    state: "active",
    notes: [],
    ratings: [],
    details: {
      contactPerson: "Rokeya Sultana",
      designation: "Service Coordinator",
      city: "Narayanganj",
      district: "Narayanganj",
      businessDescription:
        "Pump supplier used by the plant maintenance team for spares and rewinding.",
      engagementStage: "contacted",
      lastContactDate: "2026-06-10",
    },
  },
  {
    // Plain PRIVATE record exercising the full jsonb-shaped extras set (stage/tags/last-contact).
    id: "pv_05",
    name: "Rupsha Gasket & Seals",
    email: "rupsha.seals@example.com",
    phone: "+880 1700-000205",
    source: "manual",
    linkStatus: "none",
    state: "active",
    notes: [
      {
        id: "pvn_05",
        note: "Cuts non-standard spiral-wound gaskets to drawing; lead time quoted per order.",
      },
    ],
    ratings: [
      {
        id: "pvr_05",
        score: 4,
        comment: "Good workmanship on custom sizes; follow up on packing.",
      },
    ],
    details: {
      contactPerson: "Nazmul Karim",
      designation: "Proprietor",
      whatsapp: "+880 1700-000205",
      address: "45/2 Khulna Shipyard Road",
      city: "Khulna",
      district: "Khulna",
      businessDescription: "Workshop supplier of gaskets, seals and rubber-lined parts.",
      // GATED-R5.2 — rendered as presentation labels, NEVER persisted until the Board ruling.
      categories: ["Gaskets & Seals", "Rubber & Polymer Parts"],
      engagementStage: "contacted",
      procurementTags: ["Backup Vendor"],
      lastContactDate: "2026-07-02",
    },
  },
  {
    // Archived PRIVATE record — UI "Inactive" == frozen `archived`; no third lifecycle state.
    id: "pv_06",
    name: "Dhaleshwari Insulation Works",
    email: "dhaleshwari.works@example.com",
    source: "email_list",
    linkStatus: "none",
    state: "archived",
    notes: [
      { id: "pvn_06", note: "Workshop relocated; contact details no longer valid. Archived." },
    ],
    ratings: [],
    details: {
      city: "Munshiganj",
      district: "Munshiganj",
      businessDescription: "Thermal insulation and cladding subcontractor.",
    },
  },
  {
    // Archived MARKETPLACE-LINKED record — Archived view contains BOTH origins (owner ruling, spec §4).
    id: "pv_07",
    name: "Titas Fabrication Works",
    email: "workshop@titasfab.example",
    phone: "+880 1700-000207",
    source: "manual",
    linkStatus: "linked",
    state: "archived",
    notes: [
      { id: "pvn_07", note: "Framework expired; archive until the next fabrication tender cycle." },
    ],
    ratings: [{ id: "pvr_07", score: 4 }],
    details: {
      contactPerson: "Anwar Hossain",
      designation: "Works Manager",
      city: "Gazipur",
      district: "Gazipur",
      lastContactDate: "2026-03-19",
    },
  },
  {
    // Linked record with NO open CRM status (`current_status = none`) — the read returns `none`.
    id: "pv_08",
    name: "Surma Safety Solutions",
    email: "hello@surmasafety.example",
    phone: "+880 1700-000208",
    source: "manual",
    linkStatus: "linked",
    state: "active",
    notes: [],
    ratings: [],
    details: {
      contactPerson: "Tanvir Chowdhury",
      designation: "Key Account Executive",
      city: "Sylhet",
      district: "Sylhet",
      engagementStage: "new",
    },
  },
];

/**
 * Relationship fixture — the `ops.get_buyer_supplier_relationship.v1` projection
 * (`current_status`, `is_favorite`) plus an append-only-shaped status history (spec §7 —
 * NO verified frozen history projection exists; shape to be CONFIRMED AT WIRING).
 * BUYER-PRIVATE (Inv #11): a relationship exists only for LINKED records.
 */
export interface RelationshipFixture {
  currentStatus: BuyerVendorStatus;
  isFavorite: boolean;
  /** Append-only shaped (Inv #8 — history is never overwritten); newest entry = current status. */
  statusHistory: BuyerVendorStatusHistoryEntry[];
}

/** Keyed by `private_vendor_record_id` — linked records only (unlinked records have no relationship). */
export const RELATIONSHIPS: Readonly<Record<string, RelationshipFixture>> = {
  pv_01: {
    currentStatus: "approved",
    isFavorite: true,
    statusHistory: [{ id: "bvs_01", status: "approved", at: "2026-04-18T11:20:00+06:00" }],
  },
  pv_02: {
    currentStatus: "conditional",
    isFavorite: false,
    statusHistory: [
      { id: "bvs_02a", status: "approved", at: "2026-03-05T09:40:00+06:00" },
      { id: "bvs_02b", status: "conditional", at: "2026-05-12T15:05:00+06:00" },
    ],
  },
  pv_03: {
    currentStatus: "blacklisted",
    isFavorite: false,
    statusHistory: [
      { id: "bvs_03a", status: "approved", at: "2026-02-11T10:00:00+06:00" },
      { id: "bvs_03b", status: "blacklisted", at: "2026-06-02T16:45:00+06:00" },
    ],
  },
  pv_07: {
    currentStatus: "approved",
    isFavorite: false,
    statusHistory: [{ id: "bvs_07", status: "approved", at: "2026-01-20T14:10:00+06:00" }],
  },
  pv_08: {
    currentStatus: "none",
    isFavorite: false,
    statusHistory: [],
  },
};

/** A marketplace profile fixture — the kit `VendorCardVM` + the profile's claim state (spec §3). */
export interface MarketplaceProfileFixture extends VendorCardVM {
  /** Claim lifecycle of the PUBLIC profile (M2/M5 owned; displayed, never computed here). */
  claimState: MarketplaceClaimState;
}

/**
 * M2 public-profile fixtures — the linked/suggested records' profiles + 3 extra UNLINKED
 * marketplace vendors for Add-Vendor unified-search hits. Identities/capabilities are copied
 * VERBATIM from `buy/discover/page.tsx` MOCK_VENDORS (aligned to the public seed) so every
 * `/vendors/[slug]` deep link resolves. Capability = the 4-flag matrix (Inv #1); trust = the
 * binary `verified` only (no score, [ESC-7G-SCORE-DISPLAY]).
 */
export const MARKETPLACE_PROFILES: readonly MarketplaceProfileFixture[] = [
  {
    slug: "padma-valve-fittings",
    name: "Padma Valve & Fittings Ltd.",
    category: "Valves & Fittings",
    location: "Dhaka · Tejgaon I/A",
    verified: true,
    claimState: "verified",
    capability: { can_supply: true, can_service: true, can_fabricate: true, can_consult: false },
  },
  {
    slug: "bengal-steel-industries",
    name: "Bengal Steel Industries",
    category: "Steel & Metals",
    location: "Chattogram · Kalurghat",
    verified: true,
    claimState: "verified",
    capability: { can_supply: true, can_service: false, can_fabricate: true, can_consult: false },
  },
  {
    // Claimed but NOT verified — renders as absence of the Verified badge, never a "pending" state.
    slug: "jamuna-electrical-drives",
    name: "Jamuna Electrical & Drives",
    category: "Electrical & Drives",
    location: "Dhaka · Tongi",
    claimState: "claimed",
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: true },
  },
  {
    // pv_04's SUGGESTED link target — not yet linked (also an unlinked unified-search hit).
    slug: "meghna-pumps-motors",
    name: "Meghna Pumps & Motors",
    category: "Pumps & Motors",
    location: "Narayanganj · Fatullah",
    verified: true,
    claimState: "verified",
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: false },
  },
  {
    slug: "surma-safety-solutions",
    name: "Surma Safety Solutions",
    category: "Safety & PPE",
    location: "Sylhet · Khadimnagar",
    verified: true,
    claimState: "verified",
    capability: { can_supply: true, can_service: false, can_fabricate: false, can_consult: true },
  },
  {
    // Unlinked marketplace vendor — unified-search hit only.
    slug: "karnaphuli-chemicals",
    name: "Karnaphuli Chemicals Ltd.",
    category: "Chemicals",
    location: "Chattogram · Sitakunda",
    verified: true,
    claimState: "verified",
    capability: { can_supply: true, can_service: false, can_fabricate: false, can_consult: true },
  },
  {
    slug: "titas-fabrication-works",
    name: "Titas Fabrication Works",
    category: "Fabrication & Machining",
    location: "Gazipur · Tongi",
    verified: true,
    claimState: "verified",
    capability: { can_supply: false, can_service: true, can_fabricate: true, can_consult: false },
  },
  {
    // Unlinked marketplace vendor — unified-search hit only.
    slug: "shitalakshya-engineering",
    name: "Shitalakshya Engineering",
    category: "Bearings & Power Transmission",
    location: "Narayanganj · Siddhirganj",
    verified: true,
    claimState: "verified",
    capability: { can_supply: true, can_service: true, can_fabricate: false, can_consult: true },
  },
];

/**
 * Record → linked/suggested public profile slug. At wiring this is the record's
 * `linked_vendor_profile_id` (frozen `ops.get_private_vendor.v1` field) resolved through the
 * M2 public read; fixtures key by slug for the deep-link alignment above.
 */
const LINKED_PROFILE_SLUG: Readonly<Record<string, string>> = {
  pv_01: "padma-valve-fittings",
  pv_02: "jamuna-electrical-drives",
  pv_03: "bengal-steel-industries",
  pv_04: "meghna-pumps-motors", // suggested target — link panel preview, not yet linked
  pv_07: "titas-fabrication-works",
  pv_08: "surma-safety-solutions",
};

// ────────────────────────────── Selectors (frozen-read mirrors) ──────────────────────────────

/** Mirrors `ops.list_private_vendors.v1` (Doc-4F §F4.9) — the 4-field projection, contract order. */
export function listPrivateVendors(): CrmListData {
  return {
    items: PRIVATE_VENDOR_RECORDS.map(({ id, name, linkStatus, state }) => ({
      id,
      name,
      linkStatus,
      state,
    })),
  };
}

/**
 * Mirrors `ops.get_private_vendor.v1` (Doc-4F §F4.9) — record + notes + ratings (+ the
 * jsonb-shaped `details` extras riding `details_jsonb`, R5 interim). Relationship data and the
 * linked-profile block are DELIBERATELY absent — they are separate reads (`getRelationship`,
 * `getLinkedMarketplaceProfile`); the page layer composes. The `canManage*` flags are a
 * presentation-only permission stub (real gates = `can_manage_private_vendors` /
 * `can_manage_vendor_status`, distinct slugs, at wiring).
 */
export function getPrivateVendor(id: string): VendorDirectoryDetailData | undefined {
  const record = PRIVATE_VENDOR_RECORDS.find((r) => r.id === id);
  if (!record) return undefined;
  return { ...record, canManageVendorStatus: true, canManagePrivateVendors: true };
}

/**
 * Mirrors `ops.get_buyer_supplier_relationship.v1` (Doc-4F §F4.9) — present only for LINKED
 * records; an unlinked record has no relationship, hence no CRM status. BUYER-PRIVATE (Inv #11).
 */
export function getRelationship(id: string): RelationshipFixture | undefined {
  return RELATIONSHIPS[id];
}

/**
 * Presentation helper — resolves a record's linked/suggested M2 public profile block. At wiring
 * this is the M2 public profile read keyed by the record's `linked_vendor_profile_id`; platform
 * data is DISPLAYED, never copied into private-record fields (link-not-merge).
 */
export function getLinkedMarketplaceProfile(
  recordId: string,
): MarketplaceProfileFixture | undefined {
  const slug = LINKED_PROFILE_SLUG[recordId];
  if (!slug) return undefined;
  return MARKETPLACE_PROFILES.find((p) => p.slug === slug);
}

/** Unified Add-Vendor search result (spec §5 step 2) — both origins, labeled by origin badge. */
export interface UnifiedSearchResult {
  /** Marketplace hits (M2 public projection via the kit VendorCard VM + claim state). */
  marketplace: MarketplaceProfileFixture[];
  /** The buyer's OWN private records (frozen 4-field list projection) — duplicate-open path. */
  privateRecords: PrivateVendorListItem[];
}

/**
 * Presentation-side UNIFIED SEARCH (spec §5 step 2, owner-ruled): one query over marketplace
 * vendors AND the buyer's own private records. FLAGGED FOR WIRING: the frozen
 * `ops.list_private_vendors.v1` read has NO query filter (allowlisted `filter.link_status`
 * only) — the private leg here is presentation-side name/email/phone matching; the marketplace
 * leg composes M2's public `search_catalog`. The Phase-B data layer owns the real composition.
 */
export function searchUnified(q: string): UnifiedSearchResult {
  const query = q.trim().toLowerCase();
  if (!query) return { marketplace: [], privateRecords: [] };
  return {
    marketplace: MARKETPLACE_PROFILES.filter(
      (p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query),
    ),
    privateRecords: PRIVATE_VENDOR_RECORDS.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.email ?? "").toLowerCase().includes(query) ||
        (r.phone ?? "").toLowerCase().includes(query),
    ).map(({ id, name, linkStatus, state }) => ({ id, name, linkStatus, state })),
  };
}

/** Millisecond timestamp of the latest buyer-side touch, or undefined when none is recorded. */
function recencyOf(record: PrivateVendorRecordFixture, rel: RelationshipFixture | undefined) {
  let latest: number | undefined;
  const consider = (iso?: string) => {
    if (!iso) return;
    const t = Date.parse(iso);
    if (!Number.isNaN(t) && (latest === undefined || t > latest)) latest = t;
  };
  consider(record.details?.lastContactDate);
  for (const entry of rel?.statusHistory ?? []) consider(entry.at);
  return latest;
}

/**
 * Presentation-side composition of the Directory list (spec §4) implementing the OWNER-RULED
 * default sort: ⭐ Preferred → Recently Used → Marketplace → Private. "Recently Used" derives
 * from BUYER-SIDE data only (max of last-contact / status timestamps; the frozen note projection
 * carries NO timestamp, so the note leg of the ruling is FLAGGED FOR WIRING). Archived rows
 * appear ONLY in `view = "archived"` and are excluded everywhere else ("Inactive" == `archived`).
 * Chips apply as AND-narrowing filters. This composition/sort is the Phase-B DATA LAYER's job —
 * views render the supplied order and never re-rank.
 */
export function composeDirectoryRows(
  view: DirectoryView,
  chips: readonly DirectoryChip[] = [],
): VendorDirectoryRow[] {
  const composed = PRIVATE_VENDOR_RECORDS.map((record) => {
    const rel = RELATIONSHIPS[record.id];
    const profile =
      record.linkStatus === "linked" ? getLinkedMarketplaceProfile(record.id) : undefined;
    const row: VendorDirectoryRow = {
      // frozen list read (4-field projection)
      id: record.id,
      name: record.name,
      linkStatus: record.linkStatus,
      state: record.state,
      // derived (spec §3)
      origin: deriveVendorOrigin(record.linkStatus),
      // relationship read (linked only; buyer-private)
      isFavorite: rel?.isFavorite,
      currentStatus: rel?.currentStatus,
      // linked M2 profile (displayed, never copied)
      verified: profile?.verified,
      claimState: profile?.claimState,
      // details_jsonb (R5 interim)
      engagementStage: record.details?.engagementStage,
      lastContactDate: record.details?.lastContactDate,
    };
    return { row, recency: recencyOf(record, rel) };
  });

  const inView = ({ row }: (typeof composed)[number]): boolean => {
    if (view === "archived") return row.state === "archived";
    if (row.state === "archived") return false;
    switch (view) {
      case "all":
        return true;
      case "marketplace":
        return row.origin === "marketplace";
      case "private":
        return row.origin === "private";
      case "preferred":
        return row.isFavorite === true;
    }
  };

  const matchesChip = (row: VendorDirectoryRow, chip: DirectoryChip): boolean => {
    switch (chip) {
      case "verified":
        return row.claimState === "verified";
      case "claimed":
        return row.claimState === "claimed";
      case "blacklisted":
        // Buyer-side only chip (Inv #11 is vendor-facing and unaffected — spec §4).
        return row.currentStatus === "blacklisted";
      case "archived":
        return row.state === "archived";
    }
  };

  return composed
    .filter(inView)
    .filter(({ row }) => chips.every((chip) => matchesChip(row, chip)))
    .sort((a, b) => {
      const fav = Number(b.row.isFavorite ?? false) - Number(a.row.isFavorite ?? false);
      if (fav !== 0) return fav;
      const recency = (b.recency ?? 0) - (a.recency ?? 0);
      if (recency !== 0) return recency;
      if (a.row.origin !== b.row.origin) return a.row.origin === "marketplace" ? -1 : 1;
      return a.row.name.localeCompare(b.row.name);
    })
    .map(({ row }) => row);
}

// ───────────────────────────── Add-Vendor import simulation ─────────────────────────────

/**
 * One canned "uploaded document" for the Add-Vendor import simulation. Models the Stream-2
 * extraction SUGGESTION — NON-AUTHORITATIVE (Inv #12: AI suggests, modules decide); the user
 * reviews, edits, and confirms EVERY field before anything persists. Upload purpose =
 * `vendor_directory_import` (Doc-4B patch PROPOSAL via `Doc-4F_VendorImport_Additive_Patch_
 * PROPOSAL.md`, packet R8). NO Evidence Snapshot is ever generated or rendered — snapshots are
 * M5-EXCLUSIVE per the ADR-026 proposal; the original is purged after save (bulk import/export
 * stays gated, `ESC-VENDIR-FIELDS` R5.5).
 */
export interface ImportSimulationFixture {
  id: string;
  filename: string;
  kind: "business_card" | "letterhead";
  /** Suggested §6 form-field pre-fill values — every field user-reviewable, none authoritative. */
  suggestion: Partial<{
    name: string;
    contactPerson: string;
    designation: string;
    phone: string;
    email: string;
    website: string;
    city: string;
    district: string;
  }>;
}

export const IMPORT_SIMULATION: readonly ImportSimulationFixture[] = [
  {
    id: "upl_01",
    filename: "visiting-card-rahim-industrial.jpg",
    kind: "business_card",
    suggestion: {
      name: "Rahim Industrial Traders",
      contactPerson: "Abdur Rahim",
      designation: "Proprietor",
      phone: "+880 1700-000301",
      email: "rahim.traders@example.com",
      city: "Dhaka",
      district: "Dhaka",
    },
  },
  {
    id: "upl_02",
    filename: "letterhead-kushiara-engineering.pdf",
    kind: "letterhead",
    suggestion: {
      name: "Kushiara Engineering Works",
      contactPerson: "Selina Akter",
      designation: "Managing Partner",
      email: "office@kushiara-eng.example",
      website: "https://kushiara-eng.example",
      city: "Sylhet",
      district: "Sylhet",
    },
  },
];
