// P-BUY-RFQ (RFQ create · P-BUY-07) — the SERVER SHELL. It resolves what the server owns and hands
// it to one client authoring surface; it holds no draft state itself (Content ≠ Presentation, Inv #9).
//
// SHAPE (owner ruling D1, 2026-07-24): gated Zone 1 → anchored single canvas → review-and-submit.
// The old nine-card single scroll and the classic `T-WIZARD` stepper are both superseded; the
// `T-WIZARD` entry in `buyer_planning_and_design.md` is REFINED by D1 (guided authoring, visible
// progress, sticky actions, per-section error navigation — delivered as a gate plus a rail).
//
// PRESENTATION-ONLY: the audit-backed `rfq.create_rfq.v1` / `rfq.update_rfq.v1` / `rfq.submit_rfq.v1`
// writes (Doc-4E §E4.1/§E4.2/§E4.3) are NOT wired — the GI-02 server data layer and the write-wiring
// milestone are PARKED (Wave 4). Spec-document upload is capped by `[ESC-7-API/upload]`. The browser
// never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { RfqAuthoringSurface } from "./rfq-authoring-surface";
import type { RfqCreateData } from "./rfq-form-models";

/**
 * POLICY `rfq.min_scope_chars` (Doc-3 §12.2, *[start: 200]*) — the minimum written scope when the
 * buyer sets `no_formal_spec`. It is a CONFIGURABLE POLICY value, so the FE must never hardcode it
 * in a component: it is resolved here, at the server seam, and threaded down as a prop. At wiring
 * this reads the real POLICY through the server data layer instead of the start value.
 */
const MIN_SCOPE_CHARS_START_VALUE = 200;

export function RfqCreateView({ data }: { data: RfqCreateData }) {
  return <RfqAuthoringSurface data={data} minScopeChars={MIN_SCOPE_CHARS_START_VALUE} />;
}
