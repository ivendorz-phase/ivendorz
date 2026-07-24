// My Vendor Directory — Products & Services + category matching (spec §5 "Core Products &
// Services"; owner directive D5). PRESENTATION-ONLY.
//
// TWO SOURCES, ONE PRESENTATION (D5):
//   • Marketplace (linked) vendor → offerings are READ from the M2 public profile at display time
//     (`marketplace.get_public_vendor_profile` / `search_catalog`, Doc-4D §B) and NEVER copied into
//     the private record. Modelled here by `MARKETPLACE_OFFERINGS` keyed by profile slug — the M2
//     read stand-in.
//   • Private (unlinked) vendor → up to `MAX_OFFERINGS` (10) BUYER-MAINTAINED offerings. Each is
//     either category-MATCHED (a buyer-confirmed active M2 category) or TEXT-ONLY (buyer-private
//     description, no system-category identity).
//
// CATEGORY PERSISTENCE BOUNDARY (BINDING — D5 / `ESC-VENDIR-FIELDS` R5): the taxonomy is READ from
// M2 (`marketplace.list_categories.v1`, Doc-4D §D7) and confirmed matches drive PRESENTATION +
// save-eligibility ONLY. NO M2 category id is persisted in M4 (the `details_jsonb` envelope does not
// authorize a cross-module category reference); category matching is prototype-only until the Board
// rules the persistence shape. M2 owns the taxonomy — M4 never duplicates category records or coins
// a cross-module FK. Buyer-private throughout (Inv #11); "frequently used" is an org-private
// convenience signal, NEVER a ranking/discovery input (§4B firewall).

/** One node of the M2 category taxonomy (read via `marketplace.list_categories.v1`; ≤4 levels, Doc-2 §10.3). */
export interface CategoryNode {
  /** M2 category id — DISPLAY/match only; never persisted in M4 (D5 boundary). */
  id: string;
  name: string;
  /** Parent category id, or `null` at the root. */
  parentId: string | null;
}

/**
 * A PRESENTATION SUBSET of the active M2 taxonomy, aligned to the marketplace fixtures' categories so
 * suggestions land. At wiring this is the `marketplace.list_categories.v1` read (active nodes only).
 */
export const CATEGORY_TAXONOMY: readonly CategoryNode[] = [
  { id: "cat-valves", name: "Valves & Fittings", parentId: null },
  { id: "cat-gate-valves", name: "Gate & Globe Valves", parentId: "cat-valves" },
  { id: "cat-control-valves", name: "Control Valves", parentId: "cat-valves" },
  { id: "cat-flanges", name: "Flanges & Pipe Fittings", parentId: "cat-valves" },
  { id: "cat-pumps", name: "Pumps & Motors", parentId: null },
  { id: "cat-centrifugal", name: "Centrifugal Pumps", parentId: "cat-pumps" },
  { id: "cat-motors", name: "Motors & Rewinding", parentId: "cat-pumps" },
  { id: "cat-steel", name: "Steel & Metals", parentId: null },
  { id: "cat-ms-plate", name: "MS Plate & Sections", parentId: "cat-steel" },
  { id: "cat-stainless", name: "Stainless Steel", parentId: "cat-steel" },
  { id: "cat-electrical", name: "Electrical & Drives", parentId: null },
  { id: "cat-switchgear", name: "Switchgear & Protection", parentId: "cat-electrical" },
  { id: "cat-vfd", name: "VFD & Drives", parentId: "cat-electrical" },
  { id: "cat-fabrication", name: "Fabrication & Machining", parentId: null },
  { id: "cat-structural", name: "Structural Fabrication", parentId: "cat-fabrication" },
  { id: "cat-machining", name: "Precision Machining", parentId: "cat-fabrication" },
  { id: "cat-tank", name: "Tank & Vessel Fabrication", parentId: "cat-fabrication" },
  { id: "cat-safety", name: "Safety & PPE", parentId: null },
  { id: "cat-fire", name: "Fire & Safety", parentId: "cat-safety" },
  { id: "cat-ppe", name: "Personal Protective Equipment", parentId: "cat-safety" },
  { id: "cat-gaskets", name: "Gaskets & Seals", parentId: null },
  { id: "cat-bearings", name: "Bearings & Power Transmission", parentId: null },
  { id: "cat-chemicals", name: "Industrial Chemicals", parentId: null },
];

const CATEGORY_BY_ID: ReadonlyMap<string, CategoryNode> = new Map(
  CATEGORY_TAXONOMY.map((node) => [node.id, node]),
);

/** Resolve a category id to its display name (or `undefined` for an unknown id). */
export function categoryName(id: string | undefined): string | undefined {
  return id ? CATEGORY_BY_ID.get(id)?.name : undefined;
}

/** Root categories, in taxonomy order. */
export function rootCategories(): CategoryNode[] {
  return CATEGORY_TAXONOMY.filter((node) => node.parentId === null);
}

/** Children of a category, in taxonomy order. */
export function categoryChildren(parentId: string): CategoryNode[] {
  return CATEGORY_TAXONOMY.filter((node) => node.parentId === parentId);
}

/**
 * "Frequently used by this organization" — an ORG-PRIVATE convenience list (D5 UX-9). It is NEVER a
 * ranking, discovery, or public-taxonomy input (§4B firewall). No governed source exists yet; this
 * is a presentation-local stand-in, resolution deferred to wiring.
 */
export const ORG_FREQUENT_CATEGORY_IDS: readonly string[] = [
  "cat-centrifugal",
  "cat-gate-valves",
  "cat-switchgear",
  "cat-structural",
];

/** Confidence band for a suggested category match (D5 UX-1). */
export type CategoryConfidence = "high" | "possible" | "none";

/**
 * SUGGEST a category from free text (D5 — "the system suggests; the buyer confirms"). A deterministic
 * token-overlap heuristic over the active taxonomy; it NEVER auto-binds (the caller must confirm).
 * At wiring, richer matching may run server-side, but the confirm-before-bind rule is invariant.
 */
export function suggestCategory(text: string): {
  categoryId?: string;
  confidence: CategoryConfidence;
} {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
  let best: CategoryNode | undefined;
  let bestScore = 0;
  for (const node of CATEGORY_TAXONOMY) {
    const words = node.name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2);
    let score = 0;
    for (const token of tokens) {
      for (const word of words) {
        if (token === word) score += 3;
        else if (token.startsWith(word) || word.startsWith(token)) score += 2;
        else if (token.includes(word) || word.includes(token)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = node;
    }
  }
  const confidence: CategoryConfidence =
    bestScore >= 3 ? "high" : bestScore >= 2 ? "possible" : "none";
  return { categoryId: confidence === "none" ? undefined : best?.id, confidence };
}

/** Category-match confidence → presentation label (kit-neutral; the surface picks the tone). */
export const CATEGORY_CONFIDENCE_LABEL: Record<CategoryConfidence, string> = {
  high: "High-confidence match",
  possible: "Possible match",
  none: "No match",
};

/** The combined products + services ceiling for a private vendor (owner directive D5, rule 5). */
export const MAX_OFFERINGS = 10;

/**
 * One offering read from a LINKED vendor's M2 public profile (spec §5). DISPLAYED, never copied into
 * the private record. `categoryId` is the M2 profile's own category assignment (M2-owned).
 */
export interface MarketplaceOffering {
  label: string;
  categoryId?: string;
}

/** M2 public-profile offerings, keyed by profile slug — the `search_catalog`/profile read stand-in. */
export const MARKETPLACE_OFFERINGS: Readonly<Record<string, readonly MarketplaceOffering[]>> = {
  "padma-valve-fittings": [
    { label: "Gate & globe valves (cast steel)", categoryId: "cat-gate-valves" },
    { label: "Flanged pipe fittings", categoryId: "cat-flanges" },
    { label: "Valve refurbishment service", categoryId: "cat-valves" },
  ],
  "jamuna-electrical-drives": [
    { label: "VFDs & soft starters", categoryId: "cat-vfd" },
    { label: "Motor control panels", categoryId: "cat-switchgear" },
    { label: "Drive commissioning service", categoryId: "cat-electrical" },
  ],
  "bengal-steel-industries": [
    { label: "MS plate & structural sections", categoryId: "cat-ms-plate" },
    { label: "Stainless steel sheet (304/316)", categoryId: "cat-stainless" },
  ],
  "meghna-pumps-motors": [
    { label: "Centrifugal process pumps", categoryId: "cat-centrifugal" },
    { label: "Motor rewinding", categoryId: "cat-motors" },
    { label: "Pump spares", categoryId: "cat-pumps" },
  ],
  "surma-safety-solutions": [
    { label: "Fire hydrant systems", categoryId: "cat-fire" },
    { label: "PPE & safety consumables", categoryId: "cat-ppe" },
  ],
  "titas-fabrication-works": [
    { label: "Structural steel fabrication", categoryId: "cat-structural" },
    { label: "Precision machining", categoryId: "cat-machining" },
  ],
  "karnaphuli-chemicals": [{ label: "Industrial process chemicals", categoryId: "cat-chemicals" }],
  "shitalakshya-engineering": [
    { label: "Bearings & power transmission", categoryId: "cat-bearings" },
    { label: "Belt & chain drives", categoryId: "cat-bearings" },
  ],
};

/** Resolve a linked profile's displayed offerings (M2 read stand-in), capped at `MAX_OFFERINGS`. */
export function getMarketplaceOfferings(slug: string | undefined): readonly MarketplaceOffering[] {
  if (!slug) return [];
  return (MARKETPLACE_OFFERINGS[slug] ?? []).slice(0, MAX_OFFERINGS);
}

/**
 * One BUYER-MAINTAINED private offering (D5). `categoryId` is a CONFIRMED active M2 category (match is
 * prototype-only — never persisted in M4); `textOnly` marks a buyer description with no system category.
 */
export interface PrivateOffering {
  /** Opaque presentation id (Inv #5). */
  id: string;
  /** Buyer's original wording — always preserved (D5 UX-3). */
  label: string;
  /** Confirmed M2 category id — display/eligibility only; NEVER persisted in M4 (D5 boundary). */
  categoryId?: string;
  /** Buyer chose "keep as text only" — descriptive, does not satisfy the category requirement. */
  textOnly?: boolean;
}

/**
 * Buyer-maintained offerings for PRIVATE (unlinked) records, keyed by `private_vendor_record_id`. At
 * wiring the buyer-entered text rides `details_jsonb` (R5 interim); the confirmed category id does NOT
 * persist until the R5 ruling (D5 boundary).
 */
export const PRIVATE_OFFERINGS: Readonly<Record<string, readonly PrivateOffering[]>> = {
  // pv_04 (suggested link → private origin): buyer-maintained until confirmed-linked.
  pv_04: [
    { id: "off_0401", label: "Centrifugal pumps", categoryId: "cat-centrifugal" },
    { id: "off_0402", label: "Rewinding & repair (custom)", textOnly: true },
  ],
  // pv_05 Rupsha Gasket & Seals — confirmed matches + a text-only custom item.
  pv_05: [
    { id: "off_0501", label: "Spiral-wound gaskets", categoryId: "cat-gaskets" },
    { id: "off_0502", label: "Rubber-lined seals", categoryId: "cat-gaskets" },
    { id: "off_0503", label: "Cut-to-drawing custom sizes", textOnly: true },
  ],
  // pv_06 Dhaleshwari Insulation (archived private) — a single confirmed match.
  pv_06: [
    { id: "off_0601", label: "Thermal insulation & cladding", categoryId: "cat-fabrication" },
  ],
};

/** Buyer-maintained offerings for a private record, capped at `MAX_OFFERINGS`. */
export function getPrivateOfferings(recordId: string): readonly PrivateOffering[] {
  return (PRIVATE_OFFERINGS[recordId] ?? []).slice(0, MAX_OFFERINGS);
}

/**
 * SAVE-ELIGIBILITY for a private vendor (owner directive D5, rule 6 / minimum-save rule): a valid
 * company name AND at least one offering with a buyer-CONFIRMED system category. Text-only offerings
 * never satisfy the requirement. Over-limit is a blocker. Returns the reasons so the surface can
 * always explain a disabled Save (D5 UX-11). This is owner PRODUCT POLICY layered above the frozen
 * `ops.create_private_vendor.v1` (which requires only name + source) — recorded, not FE-invented.
 */
export function privateVendorSaveEligibility(
  name: string,
  offerings: readonly PrivateOffering[],
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!name.trim()) reasons.push("Company name is required.");
  if (!offerings.some((offering) => !offering.textOnly && offering.categoryId)) {
    reasons.push("Confirm at least one iVendorz system category.");
  }
  if (offerings.length > MAX_OFFERINGS) {
    reasons.push(`${offerings.length} products/services entered; the maximum is ${MAX_OFFERINGS}.`);
  }
  return { ok: reasons.length === 0, reasons };
}
