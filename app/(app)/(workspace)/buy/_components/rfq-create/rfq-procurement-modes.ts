// P-BUY-RFQ (P-BUY-07) Phase 2 — Procurement-Mode → work_nature crosswalk (Zone 1).
//
// The nine buyer-facing Procurement-Mode labels are a PRESENTATION mapping onto the frozen
// `work_nature[]` capability set (Inv #1). Source: `RFQ-CREATION-BUSINESS-MODEL.md` §2 — a DRAFT v1.0
// non-authoritative companion (OPEN item 2: Board confirmation of surfacing these labels is still
// pending). This crosswalk COINS NOTHING: every entry resolves to a subset of the frozen enum
// {supply, service, fabricate, consult}; the label is disposable presentation, `work_nature[]` is the
// stored value.

import type { WorkNature } from "./rfq-form-models";

export interface ProcurementMode {
  /** Presentation key (not a frozen value). */
  key: string;
  /** Buyer-facing label (illustrative — RFQ-CREATION-BUSINESS-MODEL.md §2, DRAFT). */
  label: string;
  /** The frozen `work_nature[]` this label maps onto (1..4, no duplicates). */
  workNature: WorkNature[];
}

export const PROCUREMENT_MODES: ProcurementMode[] = [
  { key: "supply", label: "Supply", workNature: ["supply"] },
  { key: "supply_inst", label: "Supply + Installation", workNature: ["supply", "service"] },
  { key: "supply_comm", label: "Supply + Commissioning", workNature: ["supply", "service"] },
  { key: "fabrication", label: "Fabrication", workNature: ["fabricate"] },
  { key: "fab_inst", label: "Fabrication + Install", workNature: ["fabricate", "service"] },
  { key: "turnkey", label: "Turnkey EPC", workNature: ["supply", "fabricate", "service"] },
  { key: "consultancy", label: "Consultancy", workNature: ["consult"] },
  { key: "maintenance", label: "Maintenance contract", workNature: ["service"] },
  { key: "amc", label: "Annual service (AMC)", workNature: ["service"] },
];
