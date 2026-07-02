// Suggestion triage — presentation SEED (P-ADM-27 · Doc-7H · J-ADM-07 · `decide_category_suggestion` /
// `triage/close_missing_vendor_suggestion`). A curated mock of the BC-ADM-3 triage queue standing in for the
// unwired read — NOT data, coins nothing. Covers TWO suggestion roots (link_suggestions is a separate,
// non-disclosure surface → P-ADM-28): `category_suggestions` (state submitted→approved/rejected) and
// `missing_vendor_suggestions` (state submitted→triaged→closed) — the frozen lifecycles (Doc-4J H.5). Decisions
// are owned by BC-ADM-3 Admin (R5): category via `decide_category_suggestion` (`staff_can_manage_categories`),
// missing-vendor via `triage/close_missing_vendor_suggestion` (`[ESC-ADM-SLUG]`). NON-DISCLOSURE (§7.5):
// suggestion reads are platform-staff-only (an unauthorized read collapses to NOT_FOUND). Fields bind to frozen
// BC-ADM-3 attributes (Doc-4J:136–166: suggested_by org ref, vendor_name, contact_hint, state). No fabricated
// total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

export type SuggestionKind = "category" | "missing_vendor";

// Union of the two roots' frozen states (Doc-4J H.5).
export type SuggestionStatus = "submitted" | "approved" | "rejected" | "triaged" | "closed";

export interface SuggestionVM {
  id: string;
  kind: SuggestionKind;
  /** Category: the proposed category name. Missing-vendor: the suggested `vendor_name`. */
  summary: string;
  /** Category: parent hint. Missing-vendor: `contact_hint` (optional). */
  detail?: string;
  /** Resolved name of the suggesting org (`suggested_by_organization_id`) — staff-only display. */
  suggestedBy: string;
  submitted: string;
  status: SuggestionStatus;
}

export const SUGGESTION_STATUS_META: Record<SuggestionStatus, { label: string; tone: StatusTone }> =
  {
    submitted: { label: "Submitted", tone: "warning" },
    approved: { label: "Approved", tone: "success" },
    rejected: { label: "Rejected", tone: "neutral" },
    triaged: { label: "Triaged", tone: "info" },
    closed: { label: "Closed", tone: "neutral" },
  };

export const SUGGESTION_KIND_LABEL: Record<SuggestionKind, string> = {
  category: "Category",
  missing_vendor: "Missing vendor",
};

export const SUGGESTIONS: SuggestionVM[] = [
  {
    id: "cs-00231",
    kind: "category",
    summary: "Hydraulic Power Units",
    detail: "In Fabrication & Machining",
    suggestedBy: "Rupsha Engineering Works",
    submitted: "3h ago",
    status: "submitted",
  },
  {
    id: "cs-00229",
    kind: "category",
    summary: "Marine Coatings",
    detail: "In Safety & PPE",
    suggestedBy: "Sundarban Safety",
    submitted: "1d ago",
    status: "submitted",
  },
  {
    id: "mv-00118",
    kind: "missing_vendor",
    summary: "Jamuna Machine Tools",
    detail: "Contact: sales@jamuna-tools.example",
    suggestedBy: "Delta Fabrication Ltd.",
    submitted: "5h ago",
    status: "submitted",
  },
  {
    id: "mv-00115",
    kind: "missing_vendor",
    summary: "Karnaphuli Fabricators",
    detail: "Contact: +8801XXXXXXXXX",
    suggestedBy: "Meghna Industrial Buyers",
    submitted: "2d ago",
    status: "triaged",
  },
  {
    id: "cs-00224",
    kind: "category",
    summary: "Solar Inverters",
    detail: "In Electrical & Drives",
    suggestedBy: "Green Power Solutions",
    submitted: "3d ago",
    status: "approved",
  },
  {
    id: "mv-00109",
    kind: "missing_vendor",
    summary: "Shitalakshya Steel",
    detail: "Contact hint not provided",
    suggestedBy: "Padma Procurement Cell",
    submitted: "4d ago",
    status: "closed",
  },
  {
    id: "cs-00220",
    kind: "category",
    summary: "Duplicate of Lubricants",
    detail: "In Lubricants",
    suggestedBy: "Padma Lubricants",
    submitted: "5d ago",
    status: "rejected",
  },
];

// Disabled affordances = the frozen decision edges for each root (Doc-4J H.5); the module owns the effect (R5).
export function suggestionActions(s: SuggestionVM): string[] {
  if (s.kind === "category") {
    return s.status === "submitted" ? ["Approve", "Reject"] : [];
  }
  // missing_vendor
  if (s.status === "submitted") return ["Triage"];
  if (s.status === "triaged") return ["Close"];
  return [];
}
