// P-BUY-RFQ — category picker option source.
//
// THE READ CONTRACT IS FROZEN AND EXISTS: `marketplace.list_categories.v1`
// (`GET /marketplace/categories`, public, cursor-paginated — Doc-4D PassA; Doc-5D Pass1 #18).
// The picker is therefore NOT blocked on governance. What is missing is DATA: the 794-node taxonomy
// is gated on human P1 seeding approval, so this file supplies a small ILLUSTRATIVE stand-in until
// the route reads the real contract at wiring (Wave 4, PARKED).
//
// This is a seam, not a model: the shape below is exactly `ComboboxOption`, so swapping in the real
// read is a data change, not a component change. It coins no taxonomy — these labels are placeholder
// presentation, never a claim about the frozen tree, and nothing selects on them.
//
// `categoryId` is an OPAQUE id at every layer above this file (Doc-4E §E4.1 — a Marketplace UUID,
// service-validated, no cross-schema FK, never re-modelled here). The `path` is display only.

import type { ComboboxOption } from "@/frontend/primitives/combobox";

/** Illustrative until P1 seeding lands. Ids are placeholders, deliberately not UUID-shaped. */
export const CATEGORY_OPTIONS: ComboboxOption[] = [
  {
    value: "placeholder-ms-plate",
    label: "Mild steel plate",
    description: "Mechanical › Steel & Metals",
    group: "Mechanical",
  },
  {
    value: "placeholder-ss-pipe",
    label: "Stainless steel pipe",
    description: "Mechanical › Steel & Metals",
    group: "Mechanical",
  },
  {
    value: "placeholder-bearings",
    label: "Bearings & bushings",
    description: "Mechanical › Rotating Equipment",
    group: "Mechanical",
  },
  {
    value: "placeholder-pumps",
    label: "Centrifugal pumps",
    description: "Mechanical › Rotating Equipment",
    group: "Mechanical",
  },
  {
    value: "placeholder-boilers",
    label: "Industrial boilers",
    description: "Mechanical › Thermal Systems",
    group: "Mechanical",
  },
  {
    value: "placeholder-cables",
    label: "Power cables (LV/MV)",
    description: "Electrical › Cabling",
    group: "Electrical",
  },
  {
    value: "placeholder-vfd",
    label: "Variable frequency drives",
    description: "Electrical › Drives & Control",
    group: "Electrical",
  },
  {
    value: "placeholder-transformers",
    label: "Distribution transformers",
    description: "Electrical › Power Distribution",
    group: "Electrical",
  },
  {
    value: "placeholder-switchgear",
    label: "LT switchgear panels",
    description: "Electrical › Power Distribution",
    group: "Electrical",
  },
  {
    value: "placeholder-chillers",
    label: "Water-cooled chillers",
    description: "HVAC & Utilities › Cooling",
    group: "HVAC & Utilities",
  },
  {
    value: "placeholder-compressors",
    label: "Air compressors",
    description: "HVAC & Utilities › Compressed Air",
    group: "HVAC & Utilities",
  },
  {
    value: "placeholder-ducting",
    label: "Ducting fabrication",
    description: "HVAC & Utilities › Air Distribution",
    group: "HVAC & Utilities",
  },
  {
    value: "placeholder-erection",
    label: "Erection & installation",
    description: "Services › Site Works",
    group: "Services",
  },
  {
    value: "placeholder-amc",
    label: "Annual maintenance contract",
    description: "Services › Maintenance",
    group: "Services",
  },
  {
    value: "placeholder-consultancy",
    label: "Design & engineering consultancy",
    description: "Services › Engineering",
    group: "Services",
  },
];

/** Display path for a chosen category — label plus its group trail. Display only, never an id. */
export function categoryDisplayPath(option: ComboboxOption | null | undefined) {
  if (!option) return "";
  return option.description ? `${option.description} › ${option.label}` : option.label;
}
