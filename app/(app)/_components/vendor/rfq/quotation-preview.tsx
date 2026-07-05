// S4 Quote Authoring · Section 6 — PREVIEW (companion §13.1, skippable). A read-only, OWN-DATA-ONLY
// summary of the quotation the vendor is composing — never a competitor count, identity, or rank
// (ND-2/ND-3). Renders the price breakdown read-only plus the entered terms. Presentation-only;
// RSC-friendly.
import { PriceBreakdownTable } from "./price-breakdown-table";
import type { PriceBreakdownLine } from "./types";

export interface QuotationPreviewProps {
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  deliveryTerms?: string;
  warrantyTerms?: string;
  specComplianceDeclaration?: string;
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
  currency,
  subtotal,
  deliveryTerms,
  warrantyTerms,
  specComplianceDeclaration,
}: QuotationPreviewProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        A read-only preview of your quotation. This is your own offer — nothing about other vendors
        is shown.
      </p>
      <PriceBreakdownTable lines={lines} currency={currency} subtotal={subtotal} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PreviewBlock label="Delivery terms" value={deliveryTerms} />
        <PreviewBlock label="Warranty terms" value={warrantyTerms} />
        <PreviewBlock label="Specification compliance" value={specComplianceDeclaration} />
      </div>
    </div>
  );
}
