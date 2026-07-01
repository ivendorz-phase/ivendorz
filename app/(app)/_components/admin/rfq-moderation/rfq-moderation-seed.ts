// RFQ moderation — presentation SEED (P-ADM-04 · Doc-7H · `moderate_rfq`). Curated, realistic industrial RFQs
// standing in for the wired moderation read (not wired yet) — NOT data, coins nothing. Admin is platform-scope
// (Doc-7H). The status encodes the frozen effect: PASS sends an RFQ to matching, REJECT returns it to the buyer
// as a DRAFT — Admin decides, M3 (the owning module) owns the effect (R5). No governance signal; no fabricated
// total.
import type { StatusTone } from "@/frontend/components/status-chip";

export type RfqModerationStatus = "pending" | "passed" | "rejected";

export interface RfqModerationVM {
  id: string;
  /** Human RFQ ref (year-scoped). */
  ref: string;
  buyerOrg: string;
  category: string;
  /** Short line-items summary. */
  summary: string;
  /** Relative submitted-age label (editorial). */
  submitted: string;
  status: RfqModerationStatus;
}

/** Presentation tone per moderation status — the label states the effect (pass→matching / reject→draft). */
export const RFQ_MODERATION_STATUS_META: Record<
  RfqModerationStatus,
  { label: string; tone: StatusTone }
> = {
  pending: { label: "Pending review", tone: "warning" },
  passed: { label: "Passed to matching", tone: "success" },
  rejected: { label: "Returned to draft", tone: "neutral" },
};

export const RFQ_MODERATION_CASES: RfqModerationVM[] = [
  {
    id: "rfq-000318",
    ref: "RFQ-2026-000318",
    buyerOrg: "Meghna Foods Ltd.",
    category: "Pumps & Motors",
    summary: "Boiler feed pumps ×4 · 15HP",
    submitted: "1h ago",
    status: "pending",
  },
  {
    id: "rfq-000317",
    ref: "RFQ-2026-000317",
    buyerOrg: "Padma Textiles",
    category: "Steel & Metals",
    summary: "MS plate 10mm · 20 ton",
    submitted: "3h ago",
    status: "pending",
  },
  {
    id: "rfq-000316",
    ref: "RFQ-2026-000316",
    buyerOrg: "Bengal Pharma",
    category: "Valves & Fittings",
    summary: "Hygienic valves DN50 · lot",
    submitted: "6h ago",
    status: "pending",
  },
  {
    id: "rfq-000314",
    ref: "RFQ-2026-000314",
    buyerOrg: "Karnaphuli Cement",
    category: "Bearings & Power Transmission",
    summary: "Kiln support bearings",
    submitted: "1d ago",
    status: "passed",
  },
  {
    id: "rfq-000312",
    ref: "RFQ-2026-000312",
    buyerOrg: "Jamuna Power",
    category: "Electrical & Drives",
    summary: "VFD 75kW ×2",
    submitted: "1d ago",
    status: "pending",
  },
  {
    id: "rfq-000309",
    ref: "RFQ-2026-000309",
    buyerOrg: "Surma Beverages",
    category: "Safety & PPE",
    summary: "Safety helmets · 500 pcs",
    submitted: "2d ago",
    status: "rejected",
  },
  {
    id: "rfq-000305",
    ref: "RFQ-2026-000305",
    buyerOrg: "Titas Gas",
    category: "Fabrication & Machining",
    summary: "Custom skid fabrication",
    submitted: "3d ago",
    status: "passed",
  },
  {
    id: "rfq-000301",
    ref: "RFQ-2026-000301",
    buyerOrg: "Dhaka WASA",
    category: "Pumps & Motors",
    summary: "Submersible pumps 30HP ×3",
    submitted: "4d ago",
    status: "pending",
  },
];
