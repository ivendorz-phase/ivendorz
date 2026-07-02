// P-BUY-13 Buyer "Routing log / invitations" route (Doc-7F · `T-LISTING`; IA sub-route of the RFQ detail).
// A Next.js SERVER COMPONENT in the `(app)/(buyer)` group (App Router composition only —
// REPOSITORY_STRUCTURE §8): no business logic. The dynamic segment is the OPAQUE RFQ id (Inv #5).
//
// PRESENTATION-ONLY (this milestone): the §E6.7 reads (`get_routing_log` + `list_invitations`,
// `can_view_rfq`/`can_view_all_rfqs`) are NOT wired (PARKED — Wave 4). A non-visible RFQ collapses to
// NOT_FOUND server-side (§7.5) → `data={null}` (byte-identical not-found). The browser never calls a Doc-5
// contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3). The seed is a fixture only.
//
// NON-DISCLOSURE: the fixture mirrors the frozen projections exactly — routing rows carry only
// {routing_mode, executed_at}; invitations carry only {state, delivered_at, responded_at} (NO vendor). Only
// delivered-onward invitation states appear (deferral invisible to the buyer, Doc-3 §4.2).

import { RoutingInvitationsView } from "./routing-view";
import type { RoutingInvitationsData } from "../../../_components/routing-view-models";

export const metadata = {
  title: "RFQ routing & invitations",
};

// Presentation fixture — two routing waves and three delivered-onward invitations. `id` is threaded from
// the route segment at render time (Inv #5). Replaced by the mapped §E6.7 projections at wiring.
const SEED: Omit<RoutingInvitationsData, "id"> = {
  humanRef: "RFQ-2026-000123",
  state: "vendors_notified",
  routingLog: [
    { routingMode: "approved_only", executedAt: "2026-06-28T09:15:00+06:00" },
    { routingMode: "approved_conditional", executedAt: "2026-06-30T14:40:00+06:00" },
  ],
  routingNextCursor: null,
  invitations: [
    {
      state: "accepted",
      deliveredAt: "2026-06-28T09:20:00+06:00",
      respondedAt: "2026-06-29T11:05:00+06:00",
    },
    {
      state: "declined",
      deliveredAt: "2026-06-28T09:20:00+06:00",
      respondedAt: "2026-06-28T16:30:00+06:00",
    },
    { state: "delivered", deliveredAt: "2026-06-30T14:45:00+06:00" },
  ],
  invitationsNextCursor: null,
};

export default async function BuyerRfqRoutingPage({
  params,
}: {
  params: Promise<{ rfqId: string }>;
}) {
  const { rfqId } = await params;
  // Thread the opaque route id into the fixture so outbound links stay coherent (matches close-lost/versions).
  const data: RoutingInvitationsData = { id: rfqId, ...SEED };
  return <RoutingInvitationsView data={data} />;
}
