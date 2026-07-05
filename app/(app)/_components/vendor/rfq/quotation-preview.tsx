// S4 Quote Authoring · Section 6 — PREVIEW (companion §13.1, skippable). A read-only, OWN-DATA-ONLY
// summary of the quotation the vendor is composing — never a competitor count, identity, or rank
// (ND-2/ND-3). Renders the price breakdown read-only plus the entered terms. Presentation-only;
// RSC-friendly.
//
// vatRate/aitExclude/contactPerson below mirror the price-breakdown-table.tsx mock — a disclosed,
// client-side-only VAT/AIT presentation, not a frozen field.
import { PriceBreakdownTable, computeVatTotals, type MockVatRate } from "./price-breakdown-table";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import type { PriceBreakdownLine } from "./types";

export interface QuotationPreviewProps {
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
  vatRate?: MockVatRate | null;
  aitExclude?: boolean;
  contactPerson?: string;
}

function PreviewBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground">
        {value && value !== "" ? (
          value
        ) : (
          <span className="text-muted-foreground">Not provided yet</span>
        )}
      </p>
    </div>
  );
}

export function QuotationPreview({
  lines,
  currency = "BDT",
  subtotal,
  deliveryTerms,
  warrantyTerms,
  specComplianceDeclaration,
  vatRate = null,
  aitExclude = false,
  contactPerson,
}: QuotationPreviewProps) {
  const totals = computeVatTotals(lines, vatRate, aitExclude);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        A read-only preview of your quotation. This is your own offer — nothing about other vendors
        is shown.
      </p>
      <PriceBreakdownTable
        lines={lines}
        currency={currency}
        subtotal={subtotal ?? totals.subtotal}
        vatRate={vatRate}
      />
      <dl className="grid gap-2 rounded-md border border-border p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">VAT</dt>
          <dd className="tabular-nums">
            <CurrencyDisplay amount={totals.vat} currency={currency} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Grand total
          </dt>
          <dd className="font-medium tabular-nums">
            <CurrencyDisplay amount={totals.total} currency={currency} />
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contact person
          </dt>
          <dd>{contactPerson && contactPerson !== "" ? contactPerson : "Not provided yet"}</dd>
        </div>
      </dl>
      <div className="grid gap-4 sm:grid-cols-2">
        <PreviewBlock label="Delivery terms" value={deliveryTerms} />
        <PreviewBlock label="Warranty terms" value={warrantyTerms} />
        <PreviewBlock label="Specification compliance" value={specComplianceDeclaration} />
      </div>
    </div>
  );
}
