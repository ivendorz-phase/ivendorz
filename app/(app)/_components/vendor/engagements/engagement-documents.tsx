// E3 Engagement document set (companion §13.3, the Documents tab of E2). Groups SIX presentation tabs
// over THREE distinct frozen aggregates: the four versioned engagement-document kinds (loi/po/challan/
// wcc — `engagement_document_kind`), plus `trade_invoices` and `payment_records` (separate aggregates
// with their own status machines — NOT document-kind values).
//
// ENUMERATION IS BUILD-BLOCKED [ESC-7G-ENG-03]: no `list_engagement_documents` contract exists, so the
// per-kind record set is shown escalation-gated (genuine-empty + a pending note), never a fabricated
// list. Reconciliation is a DERIVED off-platform composition (M-1, no stat-tile). The MONEY-BOUNDARY
// banner is persistent (NIT-C8). Issue/record/confirm actions (the E5 sheets) are disabled in the
// presentation phase; rendering a record never gates on its async PDF artifact (M-3). The doc-kind tabs
// compose the shared WorkspaceTabs infrastructure (Milestone 8) — byte-identical render. RSC-friendly.
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { WorkspaceTabs, type WorkspaceTab } from "../shared";
import { MoneyBoundaryBanner } from "./money-boundary-banner";
import { ReconciliationSummary } from "./reconciliation-summary";
import { DOC_KIND_LABEL } from "./document-status-chip";
import type { EngagementDocumentKind, ReconciliationView } from "./types";

const DOC_KINDS: EngagementDocumentKind[] = ["loi", "po", "challan", "wcc"];

function GatedSection({ label, action }: { label: string; action: string }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Button type="button" variant="outline" size="sm" disabled>
          {action}
        </Button>
      </div>
      <EmptyState
        title={`No ${label.toLowerCase()} yet`}
        description="Documents for this engagement appear here once issued. The document list connects when the enumeration contract is confirmed."
      />
    </div>
  );
}

const PAYMENT_PANEL = (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">Payment records</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled>
          Record payment
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          Confirm payment
        </Button>
      </div>
    </div>
    <EmptyState
      title="No payment records yet"
      description="Records of off-platform payments appear here. The list connects when the enumeration contract is confirmed."
    />
  </div>
);

export interface EngagementDocumentsProps {
  reconciliation?: ReconciliationView;
}

export function EngagementDocuments({ reconciliation }: EngagementDocumentsProps) {
  const tabs: WorkspaceTab[] = [
    ...DOC_KINDS.map((kind) => ({
      value: kind,
      label: DOC_KIND_LABEL[kind],
      content: (
        <GatedSection
          label={`${DOC_KIND_LABEL[kind]} documents`}
          action={`Issue ${DOC_KIND_LABEL[kind]}`}
        />
      ),
    })),
    {
      value: "trade_invoice",
      label: "Trade Invoice",
      content: <GatedSection label="Trade invoices" action="Issue trade invoice" />,
    },
    { value: "payment", label: "Payment", content: PAYMENT_PANEL },
  ];

  return (
    <div className="space-y-4">
      <MoneyBoundaryBanner />
      <ReconciliationSummary reconciliation={reconciliation} />
      <WorkspaceTabs ariaLabel="Document types and records" tabs={tabs} />
    </div>
  );
}
