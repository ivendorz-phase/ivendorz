"use client";

// Comparison Workspace — region ④ COMMERCIAL TERMS SUMMARY. Per-vendor totals + terms over the selected
// subset. Every figure is ADAPTER-COMPUTED (R7) — this component only places `computed.*`. The lowest grand
// total is disclosed as an ARITHMETIC fact (a neutral tag + a legend), NEVER a recommendation or a winner cue
// (R6). Qualitative terms (delivery/warranty/validity) stay qualitative. Per-Vendor focus (§2.11A.5)
// emphasises one card; row tooltips (§2.11A.14) explain each figure — the lowest tip repeats the
// non-recommendation rule.

import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { TooltipProvider } from "@/frontend/primitives/tooltip";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { Money, formatDate } from "@/frontend/components/format";
import { SealedMarker } from "@/frontend/components/sealed-marker";
import { cn } from "@/frontend/lib/cn";
import type { ComparisonSupplier } from "@/frontend/components/comparison";
import { useWorkspaceView } from "./workspace-url-state";
import { RowTip, LOWEST_TIP } from "./matrix-support";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

function TermRow({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        {label}
        {tip ? <RowTip text={tip} label={label} /> : null}
      </span>
      <span className="text-right text-foreground">{children}</span>
    </div>
  );
}

export function CommercialTermsSummary({ data }: { data: ComparisonWorkspaceData }) {
  const { statement, selectedSuppliers, currency } = data;
  const { computed } = statement;
  const { focusedVendor } = useWorkspaceView();
  const supplierByQuotation = new Map<string, ComparisonSupplier>(
    selectedSuppliers.map((s) => [s.quotationId, s]),
  );

  return (
    <TooltipProvider>
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
              // SEALED-UNTIL-CLOSE (Doc-3 §10.1): the server withheld this vendor's price, so there is
              // no disclosed total to show. Render the seal — never a 0 (the platform money rule), and
              // never a "Lowest total" cue, which on an undisclosed figure would read as the lowest
              // possible bid. We do NOT recompute a corrected lowest here (that is adapter work, R7);
              // we only withhold a cue whose underlying value is not disclosed.
              const isSealed = Boolean(supplier?.sealed);
              const isLowest = vi === computed.lowestVendorIdx && !isSealed;
              const isFocused = focusedVendor === vendor.quotationId;
              const isSubdued = Boolean(focusedVendor) && !isFocused;
              return (
                <div
                  key={vendor.quotationId}
                  className={cn(
                    "flex flex-col gap-3 rounded-md border border-border bg-background p-4 transition-opacity",
                    isFocused && "ring-2 ring-ring",
                    isSubdued && "opacity-55",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-foreground">{vendor.vendorName}</span>
                    {isLowest ? (
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="success" title="Lowest grand total (arithmetic)">
                          Lowest total
                        </Badge>
                        <RowTip text={LOWEST_TIP} label="Lowest total" />
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <span className="block text-2xs uppercase tracking-wide text-muted-foreground">
                      Grand total
                    </span>
                    {isSealed ? (
                      <SealedMarker />
                    ) : computed.grandTotals[vi] ? (
                      <CurrencyDisplay
                        amount={computed.grandTotals[vi].amount}
                        currency={computed.grandTotals[vi].currency ?? currency}
                        className="text-lg font-semibold text-foreground"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">— No value supplied</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                    <TermRow label="Subtotal">
                      {isSealed ? <SealedMarker /> : <Money value={computed.subTotals[vi]} />}
                    </TermRow>
                    <TermRow
                      label={`VAT (${computed.vatRatePct}%)`}
                      tip="Value-added tax computed on the subtotal by the server."
                    >
                      {isSealed ? <SealedMarker /> : <Money value={computed.vatAmounts[vi]} />}
                    </TermRow>
                    <TermRow label="Delivery" tip="The vendor's stated delivery period.">
                      {vendor.deliveryOffer ?? supplier?.delivery ?? "—"}
                    </TermRow>
                    <TermRow label="Warranty">{supplier?.warranty ?? "—"}</TermRow>
                    <TermRow
                      label="Valid until"
                      tip="The date until which this quotation remains valid."
                    >
                      {supplier?.validUntil ? formatDate(supplier.validUntil) : "—"}
                    </TermRow>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
