// Buyer Workspace — Engagement Pipeline card (P-BUY-01 procurement widget, FE-BUY-08, Doc-7F §9.1
// `T-DASHBOARD`). The identical shape and governance posture as `SourcingPipelineCard` (BX-01/RV-0070) —
// a second lifecycle-funnel widget, this one over the post-award engagement lifecycle. Kept as a separate
// component (2 instances doesn't meet the "rule of three" for a shared generic card) rather than modifying
// the already-approved `SourcingPipelineCard`.
//
// A BUYER-SCOPED presentation composition of the existing kit `Card` + `StatusChip` — NOT a new shared kit
// primitive and NOT a design-token change (the frozen kit/tokens are untouched). Pure function of props
// (Server Component; no hooks/fetch — Content ≠ Presentation, Inv #9).
//
// GOVERNANCE: the stage counts are WIRED aggregate reads supplied by the caller — never client-computed
// (R7 firewall) and never re-ranked (rendered in the caller/contract order, GI-04). Counts carry NO
// excluded/blacklist figure (Inv #11); this is an observe-only funnel — it decides/recommends nothing (R6).
//
// 2026-07-15 (reference-driven dashboard revision): unchanged in title/caption/mapping; the funnel MARKUP
// now comes from the shared `PipelineFunnelCard` (see that file's header — the two funnels still stay
// distinct named surfaces; only the duplicated bar markup was lifted out).

import { PipelineFunnelCard } from "./pipeline-funnel-card";
import { engagementStateDisplay } from "./state-display";
import type { EngagementPipelineStage } from "./view-models";

export function EngagementPipelineCard({
  stages,
  viewAllHref,
}: {
  stages: EngagementPipelineStage[];
  viewAllHref?: string;
}) {
  return (
    <PipelineFunnelCard
      title="Engagement pipeline"
      viewAllHref={viewAllHref}
      viewAllLabel="All engagements"
      caption="Your post-award engagements across their lifecycle."
      // Stages are mapped in the supplied (contract) order — never re-sorted here (GI-04).
      stages={stages.map((stage) => {
        const s = engagementStateDisplay(stage.state);
        return { key: stage.state, label: s.label, tone: s.tone, count: stage.count };
      })}
    />
  );
}
