// Buyer Workspace — Quotations-awaiting-review card (P-BUY-01, `T-DASHBOARD`).
//
// ADDED 2026-07-15 by the reference-driven dashboard revision (owner-directed against the "Vendor
// Dashboard Overview" design project's `Buying Overview` screen). It realizes that screen's primary
// left-column card: a leading chip, a title + mono metadata line, and a right-aligned two-button
// action pair per row.
//
// A BUYER-SCOPED presentation composition of the existing kit `Card` + `StatusChip` + `Button` — NOT a
// new shared kit primitive and NOT a design-token change. Pure function of props (Server Component; no
// hooks/fetch — Content ≠ Presentation, Inv #9).
//
// ── TWO DELIBERATE DIVERGENCES FROM THE REFERENCE (both rank-0, do not "fix" them back) ────────────
//
//  1. THE REFERENCE'S ROW ACTIONS ARE `[Compare]` + a PRIMARY `[Award]`; THIS CARD SHIPS `[View]` +
//     `[Compare]`, BOTH PLAIN NAVIGATION. Doc-7F (FROZEN) is explicit: "The UI — and the AI advisory
//     panel — NEVER auto-recommend, auto-rank-to-winner, auto-select, or present a 'recommended
//     winner'" and "No surface gates or pre-selects the award" (`Doc-5E R6`; `Doc-3 §9.1` FIXED;
//     Invariant #12); `award_rfq` is a deliberate, UNRANKED buyer choice made against the comparison
//     statement, which is decision support. A one-click primary "Award" sitting on a dashboard row —
//     beside a competing quotation on the same RFQ, above the fold, with no comparison statement in
//     view — pre-selects the award outside its decision-support surface. `[Compare]` routes INTO that
//     surface (`/buy/rfqs/{rfqId}/compare`), which is the R6-conformant affordance for the same intent.
//     (Separately: this page is presentation-only — no command is wired here at all.)
//
//  2. THE REFERENCE TITLES THIS CARD "Decisions waiting" AND BADGES IT "5" (3 approvals + 2 quotes).
//     Neither is backable. There is NO approval-queue read: `BuyerDashboardKpis` projects only
//     `awaitingMyApprovalCount` (a COUNT), so the reference's three APPROVAL rows have no row-shaped
//     source and would have to be invented (GR#8). Approvals are therefore surfaced where they ARE
//     backed — the priority banner + the "Awaiting my approval" KPI tile, both routing to P-BUY-12.
//     A card titled "Decisions waiting" that then silently omitted 3 pending approvals would UNDERSTATE
//     the buyer's real queue, so the title states exactly what the rows are. The "5" badge is dropped
//     twice over: it is a client-computed aggregate over two partial queues (R7).
//
// The reference's leading mono "QUOTE" chip — a constant on every row, since every row is a quotation —
// is realized instead as the quotation's REAL lifecycle state (`quotationStateDisplay`, frozen Doc-4M):
// same slot, same weight, real data rather than a redundant literal.
//
// GOVERNANCE: rows are a disclosed contract read supplied by the caller, rendered in the supplied order
// — never re-sorted or re-ranked here (GI-04/R6; ordering by price would itself imply a recommendation).
// No CRM/blacklist signal is rendered (Inv #11) — the read does not project one.

import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { formatDate, Money } from "./format";
import { quotationStateDisplay } from "./state-display";
import type { QuotationQueueRow } from "./view-models";

export function DecisionsWaitingCard({
  quotations,
  viewAllHref,
}: {
  quotations: QuotationQueueRow[];
  viewAllHref?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-sm font-semibold">Quotations awaiting review</CardTitle>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="rounded-sm text-xs text-iv-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Review queue
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {quotations.length === 0 ? (
          <EmptyState title="No quotations awaiting review" className="py-8" />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {quotations.map((q) => {
              const state = quotationStateDisplay(q.state);
              return (
                <li
                  key={q.id}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <StatusChip
                    label={state.label}
                    tone={state.tone}
                    className="shrink-0 self-start"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5 sm:flex-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {q.vendorName}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-1.5 text-xs tabular-nums text-muted-foreground">
                      {q.amount ? <Money value={q.amount} /> : null}
                      {q.amount && q.validUntil ? <span aria-hidden>·</span> : null}
                      {q.validUntil ? <span>Valid to {formatDate(q.validUntil)}</span> : null}
                    </span>
                  </div>
                  {/* Both actions are NAVIGATION into an existing route — never a command (see header). */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/buy/rfqs/${q.rfqId}/quotations/${q.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/buy/rfqs/${q.rfqId}/compare`}>Compare</Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
