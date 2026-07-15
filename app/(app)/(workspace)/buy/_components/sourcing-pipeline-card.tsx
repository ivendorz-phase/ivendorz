// Buyer Workspace — Sourcing Pipeline card (P-BUY-01 procurement widget, Doc-7F §9.1 `T-DASHBOARD`).
//
// A BUYER-SCOPED presentation composition of the existing kit `Card` + `StatusChip` — NOT a new shared kit
// primitive and NOT a design-token change (the frozen kit/tokens are untouched). Pure function of props
// (Server Component; no hooks/fetch — Content ≠ Presentation, Inv #9).
//
// GOVERNANCE: the stage counts are WIRED aggregate reads supplied by the caller — never client-computed
// (R7 firewall) and never re-ranked (rendered in the caller/contract order, GI-04). Counts carry NO
// excluded/blacklist figure (Inv #11); this is an observe-only funnel — it decides/recommends nothing (R6).
//
// 2026-07-15 (reference-driven dashboard revision): this card's own state→display mapping, title and
// caption are unchanged; only its funnel MARKUP moved to the shared `PipelineFunnelCard` (a proportional
// segmented bar + legend), which the ported "Buying Overview" composition needs in order to render in the
// narrow right column. This surface stays a distinct named component — the "2 instances doesn't meet the
// rule of three" note below still holds for the two funnels themselves.

import { PipelineFunnelCard } from "./pipeline-funnel-card";
import { rfqStateDisplay } from "./state-display";
import type { RfqPipelineStage } from "./view-models";

export function SourcingPipelineCard({
  stages,
  viewAllHref,
}: {
  stages: RfqPipelineStage[];
  viewAllHref?: string;
}) {
  return (
    <PipelineFunnelCard
      title="Sourcing pipeline"
      viewAllHref={viewAllHref}
      viewAllLabel="All RFQs"
      caption="Your requests for quotation across their lifecycle."
      // Stages are mapped in the supplied (contract) order — never re-sorted here (GI-04).
      stages={stages.map((stage) => {
        const s = rfqStateDisplay(stage.state);
        return { key: stage.state, label: s.label, tone: s.tone, count: stage.count };
      })}
    />
  );
}
