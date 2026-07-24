// P-BUY-RFQ (P-BUY-07) Phase 2 — GATED SEAMS for the New-RFQ client surface.
//
// This module is the single place where the two Wave-4-parked seams are named, so the client
// surface never hardcodes a policy value or an inlined category list. Nothing here is a frozen
// contract value — it is the FE-side placeholder that the server-provided value replaces at wiring.
//
//  1. POLICY `rfq.min_scope_chars` — the written-scope minimum for the `no_formal_spec` conditional
//     rule (Doc-3 §1.2). Server-provided at wiring; the FE must NOT hardcode `200` inline. It is
//     exported ONCE here and threaded through as a prop (`page.tsx` → `RfqDraftForm`) so the wiring
//     swap is a single edit.
//  2. Category taxonomy read — the frozen read contract is `marketplace.list_categories.v1`
//     (Doc-4D PassA, public, cursor-paginated). The 794-node tree is NOT seeded (P1 gated), so the
//     picker runs on this STUB adapter. Coins nothing — the ids/paths are illustrative demo data.

/** POLICY `rfq.min_scope_chars` seam — start value 200 (Doc-3 §1.2 `[start: 200]`). SERVER-PROVIDED
 *  at wiring; the client receives it as a prop and never reads this constant directly in a field. */
export const RFQ_MIN_SCOPE_CHARS = 200;

/** One selectable category (the picker's opaque value + display label + tree path for context). */
export interface CategoryOption {
  /** Maps to `category_id` at wiring (opaque). Illustrative ids here — not real category ids. */
  id: string;
  label: string;
  /** The tree path shown for disambiguation (e.g. "Mechanical › Steel & Metals › Mild steel plate"). */
  path: string;
}

/** A grouped block of category options (the `marketplace.list_categories.v1` read is grouped by root). */
export interface CategoryGroup {
  group: string;
  items: CategoryOption[];
}

/** Data-fetch phase for the picker — the combobox renders a distinct surface per phase. Until the
 *  read is wired the stub resolves synchronously, so only `data` (and its empty result) is reachable
 *  on this page; `loading`/`error` are implemented by the kit primitive and surface once the async
 *  `marketplace.list_categories.v1` read replaces the stub. */
export type CategoryLoadStatus = "loading" | "data" | "error";

/** STUB category data — illustrative only (P1 seeding gated). The live picker reads
 *  `marketplace.list_categories.v1`; this list coins nothing. */
export const STUB_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: "Mechanical",
    items: [
      {
        id: "c-ms-plate",
        label: "Mild steel plate",
        path: "Mechanical › Steel & Metals › Mild steel plate",
      },
      {
        id: "c-ss-pipe",
        label: "Stainless steel pipe",
        path: "Mechanical › Steel & Metals › Stainless steel pipe",
      },
      {
        id: "c-bearing",
        label: "Bearings & bushings",
        path: "Mechanical › Rotating Equipment › Bearings & bushings",
      },
      {
        id: "c-pump",
        label: "Centrifugal pumps",
        path: "Mechanical › Rotating Equipment › Centrifugal pumps",
      },
      {
        id: "c-boiler",
        label: "Industrial boilers",
        path: "Mechanical › Thermal Systems › Industrial boilers",
      },
    ],
  },
  {
    group: "Electrical",
    items: [
      {
        id: "c-cable",
        label: "Power cables (LV/MV)",
        path: "Electrical › Cabling › Power cables (LV/MV)",
      },
      {
        id: "c-vfd",
        label: "Variable frequency drives",
        path: "Electrical › Drives & Control › Variable frequency drives",
      },
      {
        id: "c-trafo",
        label: "Distribution transformers",
        path: "Electrical › Power Distribution › Distribution transformers",
      },
      {
        id: "c-panel",
        label: "LT switchgear panels",
        path: "Electrical › Power Distribution › LT switchgear panels",
      },
    ],
  },
  {
    group: "HVAC & Utilities",
    items: [
      {
        id: "c-chiller",
        label: "Water-cooled chillers",
        path: "HVAC & Utilities › Cooling › Water-cooled chillers",
      },
      {
        id: "c-comp",
        label: "Air compressors",
        path: "HVAC & Utilities › Compressed Air › Air compressors",
      },
      {
        id: "c-duct",
        label: "Ducting fabrication",
        path: "HVAC & Utilities › Air Distribution › Ducting fabrication",
      },
    ],
  },
  {
    group: "Services",
    items: [
      {
        id: "c-erect",
        label: "Erection & installation",
        path: "Services › Site Works › Erection & installation",
      },
      {
        id: "c-amc",
        label: "Annual maintenance contract",
        path: "Services › Maintenance › Annual maintenance contract",
      },
      {
        id: "c-design",
        label: "Design & engineering consultancy",
        path: "Services › Engineering › Design & engineering consultancy",
      },
    ],
  },
];

/** Look up a category's tree path by id (for the canvas echo + review document). */
export function categoryPathById(id?: string): string {
  if (!id) return "";
  for (const grp of STUB_CATEGORY_GROUPS) {
    const hit = grp.items.find((it) => it.id === id);
    if (hit) return hit.path;
  }
  return "";
}
