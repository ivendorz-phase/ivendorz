// P-BUY-RFQ — option lists + wizard steps for the RFQ create form. FROZEN enums are reproduced VERBATIM
// (Doc-4E §E4.1 / Doc-2 §10.4) with presentation labels; DEV-DOC/presentation lists (units, conditions,
// incoterms, …) are real-world option sets the surface serializes into `scope_text`/`content_jsonb` — they
// coin no FROZEN contract enum. Presentation-only.

import type { WorkNature, RoutingMode, FinancialTier } from "./rfq-form-models";

export interface Option<T extends string = string> {
  value: T;
  label: string;
  /** Optional helper shown under the option (e.g. routing-mode breadth). */
  hint?: string;
}

// ── FROZEN (verbatim) ────────────────────────────────────────────────────────────────────────────────

/** `work_nature` ⊆ {supply,service,fabricate,consult} (Inv #1 capability matrix; pick 1..4). */
export const WORK_NATURE_OPTIONS: Option<WorkNature>[] = [
  { value: "supply", label: "Supply", hint: "Provide / deliver goods" },
  { value: "service", label: "Service", hint: "Perform a service" },
  { value: "fabricate", label: "Fabricate", hint: "Build / fabricate to spec" },
  { value: "consult", label: "Consult", hint: "Advisory / consulting" },
];

/** `routing_mode` — buyer sets the breadth; the governed engine still matches/routes (R6). */
export const ROUTING_MODE_OPTIONS: Option<RoutingMode>[] = [
  {
    value: "approved_only",
    label: "Approved vendors only",
    hint: "Route only to your approved vendors",
  },
  {
    value: "approved_conditional",
    label: "Approved + conditional",
    hint: "Approved vendors plus conditional matches",
  },
  {
    value: "approved_open",
    label: "Approved + open",
    hint: "Approved vendors plus the open network",
  },
  { value: "open_market", label: "Open market", hint: "Route across the whole verified network" },
];

/** Frozen Financial Tier A–E (capability tier, NOT a subscription plan — Inv #10). A preference hint only. */
export const FINANCIAL_TIER_OPTIONS: Option<FinancialTier>[] = [
  { value: "A", label: "Tier A" },
  { value: "B", label: "Tier B" },
  { value: "C", label: "Tier C" },
  { value: "D", label: "Tier D" },
  { value: "E", label: "Tier E" },
];

// ── DEV-DOC / presentation lists (real-world option sets; not frozen contract enums) ──────────────────

/** Units of measure — presentation list (serialized into the dev-doc content). */
export const UNIT_OPTIONS: Option[] = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "ton", label: "Metric tons (t)" },
  { value: "m", label: "Metres (m)" },
  { value: "sqm", label: "Square metres (m²)" },
  { value: "litre", label: "Litres (L)" },
  { value: "set", label: "Sets" },
  { value: "lot", label: "Lot" },
];

/** Product condition — presentation list. */
export const CONDITION_OPTIONS: Option[] = [
  { value: "new", label: "New" },
  { value: "refurbished", label: "Refurbished" },
  { value: "used", label: "Used" },
];

/** Incoterms® 2020 — the real international standard set (not invented). */
export const INCOTERM_OPTIONS: Option[] = [
  { value: "EXW", label: "EXW — Ex Works" },
  { value: "FCA", label: "FCA — Free Carrier" },
  { value: "CPT", label: "CPT — Carriage Paid To" },
  { value: "CIP", label: "CIP — Carriage & Insurance Paid To" },
  { value: "DAP", label: "DAP — Delivered At Place" },
  { value: "DPU", label: "DPU — Delivered At Place Unloaded" },
  { value: "DDP", label: "DDP — Delivered Duty Paid" },
  { value: "FOB", label: "FOB — Free On Board" },
  { value: "CFR", label: "CFR — Cost & Freight" },
  { value: "CIF", label: "CIF — Cost, Insurance & Freight" },
];

/**
 * Payment PREFERENCE — presentation list. NOTE (R8 firewall): the platform NEVER handles buyer↔vendor money
 * (no escrow/wallet/settlement). This is a stated preference only — it moves no funds and gates nothing.
 */
export const PAYMENT_OPTIONS: Option[] = [
  { value: "advance", label: "Advance payment" },
  { value: "on_delivery", label: "Payment on delivery" },
  { value: "lc", label: "Letter of credit (LC)" },
  { value: "credit_30", label: "Credit — 30 days" },
  { value: "credit_60", label: "Credit — 60 days" },
];

/** Tax handling preference — presentation list. */
export const TAX_OPTIONS: Option[] = [
  { value: "inclusive", label: "Price inclusive of tax" },
  { value: "exclusive", label: "Price exclusive of tax" },
  { value: "exempt", label: "Tax exempt" },
];

/** Vendor type preference — presentation list (a routing/preference hint, not a matching weight). */
export const VENDOR_TYPE_OPTIONS: Option[] = [
  { value: "any", label: "Any" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "importer", label: "Importer" },
  { value: "distributor", label: "Distributor" },
];

// ── Wizard steps (the progress indicator) ────────────────────────────────────────────────────────────

export interface WizardStep {
  key: string;
  label: string;
}

export const RFQ_WIZARD_STEPS: WizardStep[] = [
  { key: "requirement", label: "Requirement" },
  { key: "technical", label: "Technical" },
  { key: "attachments", label: "Attachments" },
  { key: "logistics", label: "Logistics" },
  { key: "vendors", label: "Vendor preferences" },
  { key: "review", label: "Review" },
];
