// Matching results — presentation SEED (P-ADM-21 · Doc-7H · J-ADM · `rfq.get_matching_results.v1`). A curated
// mock of the INTERNAL matching explainability surface standing in for the unwired read — NOT data, coins
// nothing. `matching_results` are OWNED BY RFQ/Module 3 (BC-2), DERIVED/REGENERABLE — the explainability
// surface, NEVER the source of truth for any vendor signal (tier/trust/performance live in their owning
// modules — DE-2/DE-3). Read is INTERNAL-SERVICE / ADMIN only, NEVER tenant-vendor exposed (non-disclosure
// §7.5). MOAT: this is not a buyer/vendor-facing ranking; no award, winner, or selection is decided here.
// Fields bind to the frozen `matching_results` (Doc-2 §10.4 / Doc-4E H.9): `confidence_score`,
// `breakdown_jsonb(tier/capacity/performance/trust/geography)`, `formula_version`. The breakdown values are the
// matching engine's per-factor CONFIDENCE CONTRIBUTIONS (scoring inputs), NOT the underlying Trust/Performance
// scores (firewall — signals are inputs, never mutated; no paid plan gates confidence). Only vendors that
// passed EVERY gate appear — gate-excluded vendors are absent by construction, so nothing leaks (Inv #11).

export interface MatchingBreakdown {
  tier: number;
  capacity: number;
  performance: number;
  trust: number;
  geography: number;
}

export interface MatchingRowVM {
  vendorName: string;
  /** Marketplace-owned vendor reference (`vendor_profile_id`) — display only. */
  vendorRef: string;
  /** `matching_results.confidence_score` (RFQ-derived, 0–100) — NOT a Trust/Performance score. */
  confidence: number;
  /** `matching_results.breakdown_jsonb` — per-factor confidence contribution (scoring inputs). */
  breakdown: MatchingBreakdown;
}

export interface MatchingResultVM {
  /** RFQ human ref (`rfqs.human_ref`, frozen). */
  rfqRef: string;
  subject: string;
  /** `matching_results.formula_version` — the bound scoring formula version. */
  formulaVersion: string;
  rows: MatchingRowVM[];
}

/** RFQ options for the picker (rfqs the admin can inspect matching results for). */
export const MATCHING_RFQS: { id: string; ref: string; subject: string }[] = [
  { id: "rfq-000188", ref: "RFQ-2026-000188", subject: "Hydraulic pumps — 50 units" },
  { id: "rfq-000181", ref: "RFQ-2026-000181", subject: "Control valves — DN80" },
];

const MATCHING_RESULTS: Record<string, MatchingResultVM> = {
  "rfq-000188": {
    rfqRef: "RFQ-2026-000188",
    subject: "Hydraulic pumps — 50 units",
    formulaVersion: "match-formula-v3",
    rows: [
      {
        vendorName: "Rupsha Engineering Works",
        vendorRef: "8c14a7e0-2b93-4d51-9f26-1a8043c2ef57",
        confidence: 88,
        breakdown: { tier: 82, capacity: 90, performance: 86, trust: 91, geography: 78 },
      },
      {
        vendorName: "Meghna Bearings",
        vendorRef: "3b6d8e40-72af-4c19-9d5a-8c02f1e4a760",
        confidence: 81,
        breakdown: { tier: 74, capacity: 88, performance: 79, trust: 83, geography: 82 },
      },
      {
        vendorName: "Green Power Solutions",
        vendorRef: "c1e93a54-0f27-4b6e-b8d1-5a9740c2ef38",
        confidence: 73,
        breakdown: { tier: 70, capacity: 68, performance: 75, trust: 76, geography: 80 },
      },
    ],
  },
  "rfq-000181": {
    rfqRef: "RFQ-2026-000181",
    subject: "Control valves — DN80",
    formulaVersion: "match-formula-v3",
    rows: [
      {
        vendorName: "Bay Valves & Controls",
        vendorRef: "7d40b2f1-6c8a-49e3-a217-0be5c93df184",
        confidence: 92,
        breakdown: { tier: 88, capacity: 94, performance: 90, trust: 93, geography: 89 },
      },
      {
        vendorName: "Titas Instrumentation",
        vendorRef: "a58f0c93-2e11-4d7b-9f60-84c31a2b7e05",
        confidence: 79,
        breakdown: { tier: 76, capacity: 80, performance: 78, trust: 82, geography: 74 },
      },
    ],
  },
};

/** Read one RFQ's matching results. Returns undefined for an unknown/absent id (Invariant #11 / §7.5). */
export function getMatchingResult(rfqId: string): MatchingResultVM | undefined {
  return MATCHING_RESULTS[rfqId];
}

export const BREAKDOWN_FACTORS: { key: keyof MatchingBreakdown; label: string }[] = [
  { key: "tier", label: "Tier" },
  { key: "capacity", label: "Capacity" },
  { key: "performance", label: "Performance" },
  { key: "trust", label: "Trust" },
  { key: "geography", label: "Geography" },
];
