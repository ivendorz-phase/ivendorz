// Link triage — presentation SEED (P-ADM-28 · Doc-7H · J-ADM-07 · `confirm/dismiss_link_suggestion`). A curated
// mock of the BC-ADM-3 link-candidate queue standing in for the unwired read — NOT data, coins nothing. A
// link_suggestion connects a PUBLIC `vendor_profile` to a BUYER'S PRIVATE CRM record (`private_vendor_record`).
// NON-DISCLOSURE (Doc-4J:132/186, §7.5; Invariant #11 — private exclusion stays private): link content is
// NEVER vendor- or buyer-visible; this surface is PLATFORM-STAFF-ONLY, and an unauthorized read collapses to
// NOT_FOUND. So the private side is shown ONLY as an OPAQUE reference — the buyer identity and any private
// notes are never exposed. Frozen `link_suggestions` fields (Doc-4J:160–166): `match_basis<email|phone|
// trade_license>`, `confidence`, `state<suggested|confirmed|dismissed>`. Decisions
// (`confirm/dismiss_link_suggestion`, `[ESC-ADM-SLUG]`) are owned by BC-ADM-3 Admin (R5); confirm writes the
// link on the private record via the Operations service (DR-ADM-OPS). No fabricated total (GI-03).
import type { StatusTone } from "@/frontend/components/status-chip";

// Frozen `link_suggestions` state (Doc-4J H.5).
export type LinkStatus = "suggested" | "confirmed" | "dismissed";
// Frozen `link_suggestions.match_basis` (Doc-4J:163).
export type MatchBasis = "email" | "phone" | "trade_license";

export interface LinkSuggestionVM {
  id: string;
  /** Public vendor profile being matched (public info). */
  vendorProfileName: string;
  /** Opaque `private_vendor_record_id` — staff-only reference; buyer/notes NEVER exposed (non-disclosure). */
  privateRecordRef: string;
  matchBasis: MatchBasis;
  /** `link_suggestions.confidence` (numeric) — the match-candidate confidence. */
  confidence: number;
  status: LinkStatus;
}

export const LINK_STATUS_META: Record<LinkStatus, { label: string; tone: StatusTone }> = {
  suggested: { label: "Suggested", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  dismissed: { label: "Dismissed", tone: "neutral" },
};

export const MATCH_BASIS_LABEL: Record<MatchBasis, string> = {
  email: "Email",
  phone: "Phone",
  trade_license: "Trade license",
};

export const LINK_SUGGESTIONS: LinkSuggestionVM[] = [
  {
    id: "ls-00341",
    vendorProfileName: "Rupsha Engineering Works",
    privateRecordRef: "pvr-9f2c1a7e",
    matchBasis: "trade_license",
    confidence: 94,
    status: "suggested",
  },
  {
    id: "ls-00338",
    vendorProfileName: "Bay Valves & Controls",
    privateRecordRef: "pvr-3b6d8e40",
    matchBasis: "email",
    confidence: 88,
    status: "suggested",
  },
  {
    id: "ls-00335",
    vendorProfileName: "Meghna Bearings",
    privateRecordRef: "pvr-c1e93a54",
    matchBasis: "phone",
    confidence: 72,
    status: "suggested",
  },
  {
    id: "ls-00329",
    vendorProfileName: "Green Power Solutions",
    privateRecordRef: "pvr-7d40b2f1",
    matchBasis: "trade_license",
    confidence: 91,
    status: "confirmed",
  },
  {
    id: "ls-00322",
    vendorProfileName: "Titas Instrumentation",
    privateRecordRef: "pvr-a58f0c93",
    matchBasis: "email",
    confidence: 61,
    status: "dismissed",
  },
];

// Disabled affordances = the frozen edges (suggested → confirmed/dismissed); the module owns the effect (R5).
export function linkActions(s: LinkSuggestionVM): string[] {
  return s.status === "suggested" ? ["Confirm", "Dismiss"] : [];
}
