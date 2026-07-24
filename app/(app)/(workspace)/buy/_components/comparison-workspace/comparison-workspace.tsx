"use client";

// Comparison Workspace — CLIENT ROOT (the compare-route surface). Composes the regions under a URL-driven
// `Compare | Document preview` mode switch (controlled kit Tabs — the mode is safe URL state, §2.11A.13, so
// it is deep-linkable and reachable by keyboard shortcut). Consumes the already-initialized provider (the
// gating `ComparisonWorkspaceInitializer` runs first). Selection changes flow from the tray (user-driven URL
// sync); the document preview reflects the current selection + the buyer's private edits.
//
// Section anchors (`cw-overview` / `cw-matrix` / `cw-line-items` / `cw-commercial` / `cw-evaluation`) back the
// section navigator (§2.11A.3); `scroll-mt-24` clears the sticky nav.

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";
import { ComparisonDocument } from "../comparison-document";
import { RfqContextHeader } from "./rfq-context-header";
import { QuotationTray } from "./quotation-tray";
import { ComparisonReadinessStrip } from "./comparison-readiness-strip";
import { ComparisonSectionNav } from "./comparison-section-nav";
import { VendorComparisonMatrix } from "./vendor-comparison-matrix";
import { CommercialTermsSummary } from "./commercial-terms-summary";
import { EvaluationPanel } from "./evaluation-panel";
import { DocumentCompletenessPanel } from "./document-completeness-panel";
import { SessionToolbar } from "./session-toolbar";
import { LeaveGuard } from "./leave-guard";
import { useComparisonWorkspace } from "./comparison-workspace-state";
import { useWorkspaceView, type WorkspaceMode } from "./workspace-url-state";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function ComparisonWorkspace({ data }: { data: ComparisonWorkspaceData }) {
  const { selectedQuotationIds } = useComparisonWorkspace();
  const { mode, setMode } = useWorkspaceView();
  const sel = selectedQuotationIds.map((id) => `sel=${encodeURIComponent(id)}`).join("&");
  const printableHref = `/buy/rfqs/${data.rfqId}/comparative-statement${sel ? `?${sel}` : ""}`;

  return (
    <>
      <LeaveGuard />
      <RfqContextHeader data={data} quotationCount={data.traySuppliers.length} />
      <Tabs value={mode} onValueChange={(v) => setMode(v as WorkspaceMode)} className="mt-4 w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Comparison view">
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="document">Document preview</TabsTrigger>
          </TabsList>
          <SessionToolbar printableHref={printableHref} />
        </div>

        <TabsContent value="compare" className="mt-4">
          <div className="flex flex-col gap-4">
            <ComparisonSectionNav />
            <section id="cw-overview" className="flex scroll-mt-24 flex-col gap-4">
              <QuotationTray data={data} />
              <ComparisonReadinessStrip data={data} />
            </section>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-4 xl:col-span-2">
                <VendorComparisonMatrix data={data} />
                <div id="cw-commercial" className="scroll-mt-24">
                  <CommercialTermsSummary data={data} />
                </div>
              </div>
              <div id="cw-evaluation" className="scroll-mt-24 xl:col-span-1">
                <EvaluationPanel data={data} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="document" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                On-screen preview of the Comparative Statement (Draft). Print from the printable
                document.
              </p>
              <Button asChild variant="secondary" size="sm">
                <Link href={printableHref}>
                  <FileText aria-hidden /> Open printable document
                </Link>
              </Button>
            </div>
            <DocumentCompletenessPanel data={data} />
            <ComparisonDocument data={data} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
