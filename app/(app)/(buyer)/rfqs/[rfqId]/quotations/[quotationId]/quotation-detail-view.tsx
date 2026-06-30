// P-BUY-14 Buyer Quotation detail (`T-DETAILS`, Doc-7F §3.1/§4.2 · planning → PI §13). One DISCLOSED
// quotation, in full, read-only. PRESENTATION-ONLY: a pure function of its view-model (Server Component;
// no hooks/fetch/mutation — Content ≠ Presentation, Inv #9). The route page resolves the quotation via
// the wired `rfq.get_quotation.v1` (Doc-4E §E7.5, GI-02) — PARKED until the M3 backend lands (Wave 4).
//
// REUSE: the canonical platform-shell `PageHeader` + `Breadcrumbs`; the shared buyer `DescriptionList`,
// `DataListTable` (price lines), `ActivityTimeline` (version history), and `Money`/`Ref`/`formatDate`/
// `formatInstant`; the kit `Card`/`StatusChip`/`EmptyState`/`FileLink`. NO new shared component is coined.
//
// GOVERNANCE (load-bearing):
//  • READ-ONLY — there is NO Compare / Select-winner / Award / Reject / Shortlist / Clarify affordance
//    here. Those are later, audit-gated milestones (R6 / Inv #12); this surface decides and mutates nothing.
//  • VISIBILITY-GATED — `get_quotation` collapses an out-of-`quotation_visibility` id to NOT_FOUND
//    server-side (§7.5). `data === null` renders a byte-identical not-found (no copy/layout/timing tell;
//    Inv #11 / GI-12). The not-found breadcrumb shows only the `RFQs` ancestor — never a leaf ref.
//  • SEALED-UNTIL-CLOSE — when `sealedUntilClose` (Doc-3 §10.1 / §12.2 `abuse.sealed_until_close`, server
//    POLICY), the buyer projection omits price + protected commercial terms; the UI EXPLAINS the redaction
//    ("sealed until window close") so an absent price never reads as the vendor under-quoting.
//  • NON-PENALIZING — `not_selected`/`withdrawn` render uniformly via `quotationStateDisplay` (Doc-3
//    §8.3/§9.5); a vendor never learns it "lost". Versions are immutable (Inv #8) — the timeline is history.

import Link from "next/link";
import { FileText, Lock, Paperclip } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { FileLink } from "@/frontend/components/file-link";
import { PageHeader, Breadcrumbs } from "../../../../../_components/shell";
import { ActivityTimeline } from "../../../../_components/activity-timeline";
import { DataListTable, type DataColumn } from "../../../../_components/data-list-table";
import { DescriptionList, type DescriptionItem } from "../../../../_components/description-list";
import { Money, Ref, formatDate, formatInstant } from "../../../../_components/format";
import { quotationStateDisplay } from "../../../../_components/state-display";
import type {
  QuotationDetailData,
  QuotationPriceLine,
  QuotationPricing,
  QuotationTermRow,
  QuotationAttachment,
} from "../../../../_components/quotation-view-models";

/** A neutral, EXPLAINED notice for fields the server sealed until the quotation window closes (anti-farming,
 *  Doc-3 §10.1). It frames the absence as a deliberate, time-bound redaction — never a vendor deficiency. */
function SealedNotice() {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
      <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <p>
        Pricing and protected commercial terms are sealed until the quotation window closes. They
        become visible once the window has closed.
      </p>
    </div>
  );
}

/** Inline sealed marker for a single value cell (e.g. the headline amount in the summary). */
function SealedInline() {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
      <Lock aria-hidden className="size-3.5" />
      Sealed until close
    </span>
  );
}

const PRICE_COLUMNS: DataColumn<QuotationPriceLine>[] = [
  {
    key: "item",
    header: "Item",
    render: (l) => (
      <span className="flex flex-col">
        <span className="truncate text-foreground">{l.label}</span>
        {l.note ? <span className="text-xs text-muted-foreground">{l.note}</span> : null}
      </span>
    ),
  },
  { key: "amount", header: "Amount", numeric: true, render: (l) => <Money value={l.amount} /> },
];

/** Price breakdown (`price_breakdown` projection). Sealed-aware; the total is the CONTRACT figure, never
 *  client-summed (R7 firewall / GI-12). */
function PricingCard({ pricing, sealed }: { pricing?: QuotationPricing | null; sealed?: boolean }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Price breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sealed ? (
          <div className="p-4">
            <SealedNotice />
          </div>
        ) : !pricing || pricing.lines.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No pricing provided" className="py-8" />
          </div>
        ) : (
          <>
            <DataListTable
              caption="Price breakdown"
              columns={PRICE_COLUMNS}
              rows={pricing.lines}
              getRowKey={(l) => l.label}
              emptyState={
                <div className="p-4">
                  <EmptyState title="No pricing provided" className="py-8" />
                </div>
              }
            />
            {pricing.total ? (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  <Money value={pricing.total} />
                </span>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Shared "terms" card — a titled `DescriptionList` of generic label/value rows, with a non-penalizing
 *  empty state. Backs the Delivery / Warranty / Compliance sections (one renderer, no divergence). */
function TermsCard({
  title,
  rows,
  emptyTitle,
}: {
  title: string;
  rows?: QuotationTermRow[];
  emptyTitle: string;
}) {
  const items: DescriptionItem[] = (rows ?? []).map((r) => ({ label: r.label, value: r.value }));
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} className="py-8" />
        ) : (
          <DescriptionList items={items} />
        )}
      </CardContent>
    </Card>
  );
}

/** Delivery terms (`delivery_terms` projection). */
function DeliveryCard({ rows }: { rows?: QuotationTermRow[] }) {
  return <TermsCard title="Delivery terms" rows={rows} emptyTitle="No delivery terms provided" />;
}

/** Warranty (`warranty_terms` projection — nullable in the contract, 0..1). */
function WarrantyCard({ rows }: { rows?: QuotationTermRow[] }) {
  return <TermsCard title="Warranty" rows={rows} emptyTitle="No warranty terms provided" />;
}

/** Specification compliance (`spec_compliance_declaration` projection — the technical/compliance content,
 *  Doc-3 §8.1). There is no separate frozen `commercial_terms`/`technical_notes` field; this is it. */
function ComplianceCard({ rows }: { rows?: QuotationTermRow[] }) {
  return (
    <TermsCard
      title="Specification compliance"
      rows={rows}
      emptyTitle="No compliance declaration provided"
    />
  );
}

/** Attachments (`attachments_refs` resolved to signed URLs by the surface — the kit embeds no blob). A
 *  descriptor without an `href` renders as a non-interactive row (never a fabricated link). */
function AttachmentList({ attachments }: { attachments?: QuotationAttachment[] }) {
  const files = attachments ?? [];
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Attachments</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {files.length === 0 ? (
          <EmptyState title="No attachments" className="py-8" />
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <li key={f.id}>
                {f.href ? (
                  <FileLink
                    href={f.href}
                    name={f.name}
                    sizeLabel={f.sizeLabel}
                    className="w-full"
                  />
                ) : (
                  <span className="inline-flex w-full items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                    <Paperclip aria-hidden className="size-4 shrink-0" />
                    <span className="truncate">{f.name}</span>
                    {f.sizeLabel ? <span className="shrink-0 text-xs">{f.sizeLabel}</span> : null}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/** The right-rail quotation summary — the "header"/"status ribbon" facts: vendor · status · version ·
 *  headline amount (sealed-aware) · validity · received. Reuses the shared `DescriptionList`. */
function SummaryCard({ data }: { data: QuotationDetailData }) {
  const status = quotationStateDisplay(data.state);
  const items: DescriptionItem[] = [
    { label: "Vendor", value: data.vendorName },
    { label: "Status", value: <StatusChip label={status.label} tone={status.tone} /> },
    ...(typeof data.versionNo === "number"
      ? [{ label: "Version", value: data.versionNo } satisfies DescriptionItem]
      : []),
    {
      label: "Quoted amount",
      value:
        data.sealedUntilClose && !data.amount ? <SealedInline /> : <Money value={data.amount} />,
    },
    { label: "Valid until", value: data.validUntil ? formatDate(data.validUntil) : "—" },
    { label: "Received", value: data.submittedAt ? formatInstant(data.submittedAt) : "—" },
  ];
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-semibold">Quotation summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <DescriptionList items={items} />
      </CardContent>
    </Card>
  );
}

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). The breadcrumb shows only the `RFQs`
 *  ancestor — never a leaf ref (or the parent RFQ) that would imply the quotation/RFQ exists. */
function NotFoundState() {
  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs items={[{ label: "RFQs", href: "/rfqs" }]} className="mb-4" />
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Quotation not found"
        description="This quotation doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </div>
  );
}

export function QuotationDetailView({ data }: { data: QuotationDetailData | null }) {
  if (data === null) {
    return <NotFoundState />;
  }

  const status = quotationStateDisplay(data.state);

  return (
    <div className="mx-auto max-w-[var(--iv-content-max)] p-4 sm:p-6">
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: "RFQ", href: `/rfqs/${data.rfqId}` },
          { label: data.humanRef },
        ]}
        className="mb-4"
      />
      <PageHeader
        title={data.vendorName}
        meta={
          <>
            <Ref>{data.humanRef}</Ref>
            <StatusChip label={status.label} tone={status.tone} />
            {typeof data.versionNo === "number" ? (
              <span className="text-xs text-muted-foreground">Version {data.versionNo}</span>
            ) : null}
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <PricingCard pricing={data.pricing} sealed={data.sealedUntilClose} />
          <DeliveryCard rows={data.delivery} />
          <WarrantyCard rows={data.warranty} />
          <ComplianceCard rows={data.compliance} />
          <AttachmentList attachments={data.attachments} />
        </div>
        <div className="flex flex-col gap-4">
          <SummaryCard data={data} />
          <ActivityTimeline
            entries={data.history ?? []}
            title="Timeline"
            emptyLabel="No version history yet"
          />
        </div>
      </div>
    </div>
  );
}
