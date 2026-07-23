// Comparison Workspace — region ④ COMMERCIAL TERMS SUMMARY. Per-vendor totals + terms over the selected
// subset. Every figure is ADAPTER-COMPUTED (R7) — this component only places `computed.*`. The lowest
// grand total is disclosed as an ARITHMETIC fact (a neutral tag + a legend), NEVER a recommendation or a
// winner cue (R6). Qualitative terms (delivery/warranty/validity) stay qualitative.

import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { Money, formatDate } from "@/frontend/components/format";
import type { ComparisonSupplier } from "@/frontend/components/comparison";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

function TermRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function CommercialTermsSummary({ data }: { data: ComparisonWorkspaceData }) {
  const { statement, selectedSuppliers, currency } = data;
  const { computed } = statement;
  const supplierByQuotation = new Map<string, ComparisonSupplier>(
    selectedSuppliers.map((s) => [s.quotationId, s]),
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <CardTitle as="h2" className="text-base">
          Commercial summary
        </CardTitle>
        <p className="text-2xs text-muted-foreground">
          Lowest grand total is an arithmetic identification — not a recommendation.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {statement.vendors.map((vendor, vi) => {
            const supplier = supplierByQuotation.get(vendor.quotationId);
            const isLowest = vi === computed.lowestVendorIdx;
            return (
              <div
                key={vendor.quotationId}
                className="flex flex-col gap-3 rounded-md border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground">{vendor.vendorName}</span>
                  {isLowest ? (
                    <Badge variant="success" title="Lowest grand total (arithmetic)">
                      Lowest total
                    </Badge>
                  ) : null}
                </div>
                <div>
                  <span className="block text-2xs uppercase tracking-wide text-muted-foreground">
                    Grand total
                  </span>
                  <CurrencyDisplay
                    amount={computed.grandTotals[vi]?.amount ?? 0}
                    currency={computed.grandTotals[vi]?.currency ?? currency}
                    className="text-lg font-semibold text-foreground"
                  />
                </div>
                <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                  <TermRow label="Subtotal">
                    <Money value={computed.subTotals[vi]} />
                  </TermRow>
                  <TermRow label={`VAT (${computed.vatRatePct}%)`}>
                    <Money value={computed.vatAmounts[vi]} />
                  </TermRow>
                  <TermRow label="Delivery">
                    {vendor.deliveryOffer ?? supplier?.delivery ?? "—"}
                  </TermRow>
                  <TermRow label="Warranty">{supplier?.warranty ?? "—"}</TermRow>
                  <TermRow label="Valid until">
                    {supplier?.validUntil ? formatDate(supplier.validUntil) : "—"}
                  </TermRow>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
