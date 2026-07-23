"use client";

// Comparison Workspace — CLIENT ROOT (the compare-route surface). Composes the regions under a
// `Compare | Document preview` mode switch (`BuyerWorkspaceTabs`). Consumes the already-initialized
// provider (the gating `ComparisonWorkspaceInitializer` runs first). Selection changes flow from the
// tray (user-driven URL sync); the document reflects the current selection + the buyer's private edits.

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { BuyerWorkspaceTabs } from "../buyer-workspace-tabs";
import { ComparisonDocument } from "../comparison-document";
import { RfqContextHeader } from "./rfq-context-header";
import { QuotationTray } from "./quotation-tray";
import { VendorComparisonMatrix } from "./vendor-comparison-matrix";
import { CommercialTermsSummary } from "./commercial-terms-summary";
import { EvaluationPanel } from "./evaluation-panel";
import { useComparisonWorkspace } from "./comparison-workspace-state";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function ComparisonWorkspace({ data }: { data: ComparisonWorkspaceData }) {
  const { selectedQuotationIds } = useComparisonWorkspace();
  const sel = selectedQuotationIds.map((id) => `sel=${encodeURIComponent(id)}`).join("&");
  const printableHref = `/buy/rfqs/${data.rfqId}/comparative-statement${sel ? `?${sel}` : ""}`;

  const tabs = [
    {
      value: "compare",
      label: "Compare",
      content: (
        <div className="flex flex-col gap-4">
          <QuotationTray data={data} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="flex min-w-0 flex-col gap-4 xl:col-span-2">
              <VendorComparisonMatrix data={data} />
              <CommercialTermsSummary data={data} />
            </div>
            <div className="xl:col-span-1">
              <EvaluationPanel data={data} />
            </div>
          </div>
        </div>
      ),
    },
    {
      value: "document",
      label: "Document preview",
      content: (
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
          <ComparisonDocument data={data} />
        </div>
      ),
    },
  ];

  return (
    <>
      <RfqContextHeader data={data} quotationCount={data.traySuppliers.length} />
      <BuyerWorkspaceTabs tabs={tabs} defaultValue="compare" ariaLabel="Comparison view" />
    </>
  );
}
