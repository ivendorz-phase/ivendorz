// Vendor Workspace — Dashboard "Recent documents" panel (VX-02, owner-directed dashboard layout
// revision 2026-07-15). Pure presentation over caller-supplied rows — invents nothing. The dashboard
// page supplies an explicitly-labelled presentation-fixture SEED until `ops.list_generated_documents.v1`
// (M4 BC-OPS-4) is wired; genuine-empty renders the canonical kit EmptyState, never a placeholder row.
//
// COLUMN MODEL — every column is a name from the documents shared home's own column spec
// (`_components/documents/document-table-spec.ts`), rendered over the fields `GeneratedDocumentRow`
// actually projects (`../documents/documents-hub-view-models.ts`):
//   kind · ref (+ source) · counterparty · direction · issued_at
// The reference mockup's AMOUNT and STATUS columns are deliberately absent: BC-OPS-4 projects
// neither on a generated-document row, and coining either would be a fabricated figure/state. The
// spec's own `status`/`direction` slot is filled by the real derived `direction`, and `amount` is
// replaced by the real `counterparty` column — both are spec-named columns, so the reference's
// five-column footprint is preserved without inventing a field.
//
// SHARED VOCABULARY, NOT A SECOND DIALECT (this panel renders the same rows the hub does, so it must
// render them the same way — `../documents/documents-hub-view.tsx` is the reference surface):
//  • Kind iconography resolves through the shared `documentIcon()` map — the SSoT; that file states
//    an inline per-surface lucide pick for a document kind is a review finding.
//  • Kind LABEL is `generatedDocKindLabel()` verbatim, never a coined short form. It renders beside
//    the ref (as the hub pairs them) rather than inside the narrow leading column, because the real
//    labels ("Work Completion Certificate") do not fit a chip and must not be truncated into
//    nonsense. The leading column is the tinted kind ICON, which holds the reference's colour and
//    footprint in that slot; the label is carried for assistive tech via sr-only + title.
//  • Direction renders as a NEUTRAL `StatusChip` — identical to the hub's own treatment. The tone
//    is deliberately flat: direction is a derived grouping cue, not a state worth colour-coding.
//
// COUNTERPARTY IS AN OPAQUE REF, BY INTENT: `counterparty_ref` carries no name on M4 reads and this
// component NEVER coins one (see the field's own comment). It renders the ref verbatim, mono — the
// reference's "Party" name line has no backing and is not simulated.
//
// ORDER IS THE CALLER'S: rows render in the order supplied. The documents default sort
// (`DOCUMENTS_DEFAULT_SORT` — `issued_at` desc) is a READ-side contract; this component never
// re-sorts client-side. Responsive folding follows `DOCUMENTS_MOBILE_HIDDEN_COLUMNS` (counterparty +
// issued_at fold; kind/ref/direction always visible).
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { cn } from "@/frontend/lib/cn";
import { documentIcon } from "../../documents";
import {
  generatedDocKindLabel,
  type GeneratedDocumentRow,
  type DocumentDirection,
} from "../documents/documents-hub-view-models";

/** Presentation tint per AS-PROJECTED `doc_kind` string — colour only; asserts nothing about the
 *  document's state. Unknown kinds fall back to neutral (the kind string is open per Doc-4F §F7.3,
 *  so this map must never be read as an enumeration of the value set). */
const KIND_TINT: Record<string, string> = {
  quotation: "bg-iv-info-subtle text-iv-info-muted",
  po: "bg-iv-brand-50 text-iv-brand-600",
  challan: "bg-iv-warning-subtle text-iv-warning-muted",
  bill: "bg-iv-success-subtle text-iv-success-muted",
  wcc: "bg-muted text-muted-foreground",
  letterhead: "bg-muted text-muted-foreground",
};

const DEFAULT_KIND_TINT = "bg-muted text-muted-foreground";

/** Direction is a derived GROUPING CUE, never a coined status enum (see the view-models header). */
const DIRECTION_LABEL: Record<DocumentDirection, string> = {
  sent: "Sent",
  received: "Received",
};

/** Shared 5-column track — folds to kind/ref/direction at narrow widths per the spec. */
const ROW_GRID =
  "grid grid-cols-[36px_1fr_96px] items-center gap-x-3 sm:grid-cols-[36px_1.4fr_1fr_96px_92px]";

export interface RecentDocumentsCardProps {
  rows: GeneratedDocumentRow[];
  /** Href for the "View all" affordance — the real documents hub. */
  viewAllHref?: string;
}

function RowShell({
  href,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!href) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function RecentDocumentsCard({
  rows,
  viewAllHref = "/sell/documents",
}: RecentDocumentsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5">
        <h2 className="text-base font-semibold leading-none tracking-tight">Recent documents</h2>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-iv-brand-600 hover:underline"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {rows.length === 0 ? (
          <EmptyState title="No documents issued yet" className="py-10" />
        ) : (
          <>
            <div
              className={cn(
                ROW_GRID,
                "border-y border-border bg-muted/40 px-5 py-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground",
              )}
            >
              <span aria-hidden />
              <span>No. / Source</span>
              <span className="hidden sm:block">Counterparty</span>
              <span>Direction</span>
              <span className="hidden text-right sm:block">Issued</span>
            </div>

            <ul className="divide-y divide-border">
              {rows.map((row) => {
                const Icon = documentIcon(row.doc_kind);
                const kindLabel = generatedDocKindLabel(row.doc_kind);
                return (
                  <li key={row.id}>
                    <RowShell
                      href={
                        row.source_engagement_id
                          ? `/sell/engagements/${row.source_engagement_id}`
                          : undefined
                      }
                      className={cn(ROW_GRID, "px-5 py-3 transition-colors hover:bg-muted/50")}
                    >
                      <span
                        title={kindLabel}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-md",
                          KIND_TINT[row.doc_kind] ?? DEFAULT_KIND_TINT,
                        )}
                      >
                        <Icon aria-hidden className="size-4" />
                        <span className="sr-only">{kindLabel}</span>
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate font-mono text-xs font-semibold text-iv-brand-600">
                          {row.human_ref}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {kindLabel}
                          {row.source_ref ? ` · ${row.source_ref}` : ""}
                        </span>
                      </span>

                      {/* Opaque ref — never a name (see header). */}
                      <span className="hidden min-w-0 sm:block">
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {row.counterparty_ref ?? "—"}
                        </span>
                      </span>

                      <span className="min-w-0">
                        <StatusChip label={DIRECTION_LABEL[row.direction]} tone="neutral" />
                      </span>

                      <span className="hidden truncate text-right text-xs text-muted-foreground sm:block">
                        {row.issued_at}
                      </span>
                    </RowShell>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
