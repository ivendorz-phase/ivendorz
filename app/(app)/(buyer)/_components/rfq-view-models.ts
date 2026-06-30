// Buyer Workspace — RFQ list (P-BUY-06) + RFQ detail (P-BUY-08) PRESENTATION VIEW-MODELS.
//
// Presentation shapes the server layer (Doc-7C SR5, GI-02) MAPS the wired Doc-5E reads (`list_rfqs`,
// `get_rfq`) onto when backend wiring lands (Wave 4; PARKED today). They are NOT the frozen Doc-5E DTOs
// and they coin nothing: the `RfqState` lifecycle union is the verbatim frozen Doc-4M set (imported from
// `view-models.ts`); the content fields below map by intent to `get_rfq` fields and are all OPTIONAL so
// the not-found/empty render needs no fabricated value. Exact DTO field names bind at wiring.
//
// SCOPE: presentation only — no fetch, no mutation, no business logic (Content ≠ Presentation, Inv #9).

import type { RfqState, MoneyValue, ActivityEntry } from "./view-models";

/** One RFQ row in the P-BUY-06 list. `humanRef` is a display label; routes carry the opaque `id`. */
export interface RfqListItem {
  id: string;
  humanRef: string;
  title: string;
  state: RfqState;
  /** Budget/estimate the contract carries on the RFQ. */
  value?: MoneyValue;
  /** Category label, if the contract provides one (display only). */
  category?: string;
  /** ISO-8601 last-updated instant, formatted at the render site. */
  updatedAt: string;
}

/**
 * The P-BUY-06 list view-model. `null` drives the first-run empty state (the "Create RFQ" CTA per the
 * §II.6 contract-empty row). Cursor pagination only (GI-03) — `nextCursor` is opaque; offset/page-number
 * pagers are forbidden. `total` renders only if the contract provides it (GI-12).
 */
export interface RfqListData {
  items: RfqListItem[];
  /** Opaque forward cursor (GI-03); absent/null ⇒ last page. */
  nextCursor?: string | null;
  /** Contract-provided total (optional; never client-computed). */
  total?: number;
}

/**
 * A Doc-4M-permitted RFQ lifecycle action for the P-BUY-08 toolbar. The SERVER derives the permitted set
 * (GI-10 — "offer only permitted transitions"); the presentation renders them and decides nothing. These
 * are buyer-driven RFQ-lifecycle transitions only (`submit_rfq` / `cancel_rfq` / `reissue_rfq`). NOTE:
 * the underlying writes are audit-backed and PARKED behind `ESC-W2-AUDIT-RLS` + the write-wiring
 * milestone — this milestone renders the affordances (presentation), it does not wire the write.
 */
export interface RfqLifecycleAction {
  /** Frozen buyer command bound by pointer (Doc-5E) — never a coined slug. */
  key: "submit_rfq" | "cancel_rfq" | "reissue_rfq";
  /** Display label derived by the surface from the command. */
  label: string;
  /** Presentation emphasis: `primary` for the state's main action, `danger` for cancel. */
  emphasis?: "primary" | "danger" | "default";
}

/**
 * The P-BUY-08 detail view-model. `null` drives the not-found ≡ genuine-absence state (GI-12; byte-
 * identical to a real 404 — no copy/layout/timing tell). Content fields are optional and map by intent
 * to `get_rfq`. The `lifecycle` timeline is the read-only Doc-4M/audit history; `permittedActions` is the
 * server-derived GI-10 set (presentation renders, never decides).
 */
export interface RfqDetailData {
  id: string;
  humanRef: string;
  title: string;
  state: RfqState;
  value?: MoneyValue;
  /** RFQ scope/spec summary the contract carries (display only). */
  summary?: string;
  category?: string;
  /** Delivery location label (display only). */
  deliveryLocation?: string;
  /** ISO-8601 "needed by" date, formatted at the render site. */
  neededBy?: string;
  createdAt: string;
  updatedAt: string;
  /** Read-only lifecycle/audit timeline (reuses the shared ActivityEntry shape). */
  lifecycle: ActivityEntry[];
  /** Doc-4M-permitted buyer actions for the current state (GI-10; server-derived). */
  permittedActions: RfqLifecycleAction[];
}
