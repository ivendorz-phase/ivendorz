// P-BUY-01 Buyer Dashboard route (Doc-7F §9.1 · `T-DASHBOARD`). A Next.js SERVER COMPONENT in the
// `(app)/(buyer)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// PRESENTATION-ONLY (this milestone): the buyer dashboard binds M3/M4 reads that are NOT wired today
// (the GI-02 server data layer is PARKED until the M3/M4 backends land — Wave 4/5). So the page renders
// the spec's FIRST-RUN state (`data={null}` → single "Create RFQ" CTA, §9.1); no data is fabricated.
//
// WIRING SEAM (later milestone, when the typed Doc-5 client + active-org boundary exist): resolve the
// view-model SERVER-SIDE here via the wired reads — dashboard KPI reads · `list_rfqs` · `list_quotations_for_rfq`
// · `list_engagements` · audit-activity read — and stream each widget behind its own Suspense boundary
// (`<Suspense fallback={<WorkQueueSkeleton/>}>`), with a scoped `error-state` per widget (§9.1 / GI-05).
// The browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

import { BuyerDashboardView } from "./dashboard-view";

export const metadata = {
  title: "Dashboard",
};

export default function BuyerDashboardPage() {
  // No wired reads yet (PARKED) → render the first-run presentation. Wiring fills `data` later.
  return <BuyerDashboardView data={null} />;
}
