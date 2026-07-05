// S4 Quote Authoring — SUCCESS screen after Confirm & Submit (owner-directed Vendor Quotation
// Submission workflow integration). Presentation-only: the bid reference/total/VAT status/contact
// person shown here come from the query string the client-local submit handler in QuotationBuilder
// appended when navigating — there is no `rfq.submit_quotation.v1` call yet, and nothing is persisted
// server-side. Editing is not offered from this screen (Doc-4M: submitted is sealed at version 1;
// revision is a separate, buyer-gated action surfaced from "Your quotation" on the RFQ detail, not
// from here). Download PDF / Share offer are presentation-only stubs — PDF generation and sharing are
// explicitly out of scope for this build.
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader } from "../../../../../_components/shell";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Quotation submitted" };

export default async function QuotationSubmittedPage({
  params,
  searchParams,
}: {
  params: Promise<{ rfqId: string }>;
  searchParams: Promise<{ ref?: string; total?: string; vat?: string; contact?: string }>;
}) {
  const { rfqId } = await params;
  const { ref, total, vat, contact } = await searchParams;
  const totalAmount = total ? Number(total) : undefined;
  const submittedAtLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "RFQs & Quotations", href: "/workspace/rfqs" },
          { label: "RFQ detail", href: `/workspace/rfqs/${rfqId}` },
          { label: "Quotation submitted" },
        ]}
        className="mb-4"
      />
      <PageHeader
        title="Quotation submitted successfully"
        description="Presentation only — this confirms the mock submission you just walked through; nothing has been sent to the buyer yet."
      />

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 aria-hidden="true" className="size-8 shrink-0 text-iv-success-base" />
            <p className="text-sm text-muted-foreground">
              Your quotation is sealed at version 1. You can revise it (a new version, no quota) or
              withdraw it before award from the RFQ detail page.
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Bid reference
              </dt>
              <dd className="font-mono text-sm text-foreground">{ref ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Submission date
              </dt>
              <dd className="text-sm text-foreground">{submittedAtLabel}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Grand total
              </dt>
              <dd className="text-sm font-medium tabular-nums text-foreground">
                {typeof totalAmount === "number" ? (
                  <CurrencyDisplay amount={totalAmount} currency="BDT" />
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                VAT status
              </dt>
              <dd className="text-sm text-foreground">{vat ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Contact person
              </dt>
              <dd className="text-sm text-foreground">
                {contact && contact !== "" ? contact : "—"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" disabled>
              Download PDF
            </Button>
            <Button type="button" variant="outline" disabled>
              Share offer
            </Button>
            <Button asChild>
              <Link href="/workspace">Back to dashboard</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Download PDF and Share offer are presentation-only in this build — PDF generation and
            sharing connect in a later integration phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
