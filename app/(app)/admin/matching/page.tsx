// P-ADM-21 Matching results — internal (Doc-7H · Details · `rfq.get_matching_results.v1` · J-ADM). PRESENTATION
// ONLY: the INTERNAL matching explainability surface. `matching_results` are owned by RFQ/Module 3 (BC-2),
// DERIVED/REGENERABLE — the explainability surface, never the source of truth for any vendor signal. The read is
// INTERNAL-SERVICE / ADMIN only, NEVER tenant-vendor exposed (non-disclosure §7.5). MOAT: this is NOT a
// buyer/vendor-facing ranking — no award, winner, or selection is decided here; RFQ owns matching. Results are
// per-RFQ (`get_matching_results` reads one RFQ) — the page is RFQ-scoped via `?rfq=<id>` (no invented
// cross-RFQ list). Breakdown factors are the engine's per-factor confidence CONTRIBUTIONS (scoring inputs),
// NOT the underlying Trust/Performance scores (firewall). Only vendors that passed EVERY gate appear —
// exclusions are silent/absent, so nothing leaks (Invariant #11). Read-only; no action. Reuses PageHeader +
// shared AdminQueueTable + kit.
import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { EmptyState } from "@/frontend/components/empty-state";
import { PageHeader } from "../../_components/shell";
import { AdminQueueTable, type AdminQueueColumn } from "../../_components/admin/admin-queue-table";
import {
  MATCHING_RFQS,
  BREAKDOWN_FACTORS,
  getMatchingResult,
  type MatchingRowVM,
} from "../../_components/admin/matching/matching-seed";

export const metadata: Metadata = { title: "Matching results · Admin" };

const BASE = "/admin/matching";

const COLUMNS: AdminQueueColumn<MatchingRowVM>[] = [
  {
    key: "vendor",
    header: "Vendor",
    cell: (r) => (
      <>
        <div className="font-medium text-foreground">{r.vendorName}</div>
        <div className="font-mono text-2xs text-muted-foreground">{r.vendorRef}</div>
      </>
    ),
  },
  {
    key: "confidence",
    header: "Confidence",
    className: "whitespace-nowrap",
    cell: (r) => <span className="font-medium text-foreground">{r.confidence}</span>,
  },
  {
    key: "breakdown",
    header: "Breakdown (confidence contribution)",
    cell: (r) => (
      <div className="flex flex-wrap gap-1.5">
        {BREAKDOWN_FACTORS.map((f) => (
          <span
            key={f.key}
            className="rounded bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground"
          >
            {f.label} {r.breakdown[f.key]}
          </span>
        ))}
      </div>
    ),
  },
];

export default async function MatchingResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ rfq?: string }>;
}) {
  const { rfq } = await searchParams;
  const result = rfq ? getMatchingResult(rfq) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matching results"
        description="Internal matching diagnostics for one RFQ. This is an explainability surface — not a buyer- or vendor-facing ranking, and no award or selection is decided here."
      />

      <Card className="border-dashed p-4">
        <div className="flex items-start gap-3">
          <Target aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-foreground">Internal-service view</p>
            <p className="text-muted-foreground">
              Matching results are derived by the RFQ engine and never exposed to vendors. Breakdown
              values are the engine’s per-factor confidence contributions — not the underlying Trust
              or Performance scores. Only vendors that passed every gate appear.
            </p>
          </div>
        </div>
      </Card>

      {/* RFQ picker — get_matching_results reads a single RFQ. */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Select an RFQ">
        {MATCHING_RFQS.map((r) => {
          const isActive = r.id === rfq;
          return (
            <Button key={r.id} asChild size="sm" variant={isActive ? "secondary" : "ghost"}>
              <Link href={`${BASE}?rfq=${r.id}`} aria-current={isActive ? "page" : undefined}>
                {r.ref}
              </Link>
            </Button>
          );
        })}
      </div>

      {!result ? (
        <EmptyState
          icon={<Target aria-hidden="true" />}
          title="Select an RFQ"
          description="Choose an RFQ above to view its internal matching results."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{result.rfqRef}</span>
            <span className="text-muted-foreground">{result.subject}</span>
            <Badge variant="neutral">{result.formulaVersion}</Badge>
          </div>
          <AdminQueueTable
            columns={COLUMNS}
            rows={result.rows}
            rowKey={(r) => r.vendorRef}
            caption="Internal matching results for the selected RFQ"
            minWidthClassName="min-w-[52rem]"
          />
        </div>
      )}
    </div>
  );
}
