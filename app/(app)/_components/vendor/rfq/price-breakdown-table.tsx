// S4 Quote Authoring · Section 1 — PRICE BREAKDOWN (companion §13.1). Renders the line-item table that
// composes the frozen `price_breakdown` jsonb (required). The line-item sub-fields (#, Description, Qty,
// Unit, Amount) and the Subtotal/VAT/TOTAL rows are a COMPANION presentation shape over that jsonb —
// the jsonb internal schema is dev-doc (Doc-4E Part4), not a frozen column set. Amounts are BDT via the
// kit CurrencyDisplay (locale-threaded). The VAT toggle + computed totals are presentation-only here:
// no live recompute (no client state), all inputs disabled, "+ Add line" disabled. RSC-friendly.
import { Plus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { EmptyState } from "@/frontend/components/empty-state";
import type { PriceBreakdownLine } from "./types";

export interface PriceBreakdownTableProps {
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
}

export function PriceBreakdownTable({
  lines,
  currency = "BDT",
  subtotal,
}: PriceBreakdownTableProps) {
  const hasLines = lines && lines.length > 0;

  return (
    <div className="space-y-4">
      {hasLines ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">Price breakdown</caption>
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  #
                </th>
                <th scope="col" className="px-3 py-2 text-left font-medium">
                  Description
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Qty
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Unit ({currency})
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines!.map((line, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2 text-foreground">{line.description ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{line.qty ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {typeof line.unit_amount === "number" ? (
                      <CurrencyDisplay amount={line.unit_amount} currency={currency} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {typeof line.amount === "number" ? (
                      <CurrencyDisplay amount={line.amount} currency={currency} />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No line items yet"
          description="Add the items, quantities and unit prices that make up your quotation."
        />
      )}

      <Button type="button" variant="outline" size="sm" disabled>
        <Plus aria-hidden="true" className="size-4" /> Add line
      </Button>

      <dl className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">
            {typeof subtotal === "number" ? (
              <CurrencyDisplay amount={subtotal} currency={currency} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">VAT</dt>
          <dd
            role="radiogroup"
            aria-label="VAT mode"
            className="flex items-center gap-3 text-muted-foreground"
          >
            <span className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="vat-mode"
                value="inclusive"
                disabled
                aria-label="VAT inclusive"
              />{" "}
              inclusive
            </span>
            <span className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="vat-mode"
                value="exclusive"
                disabled
                aria-label="VAT exclusive"
              />{" "}
              exclusive
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between font-medium text-foreground">
          <dt>Total</dt>
          <dd className="tabular-nums text-muted-foreground">—</dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Totals and VAT calculate in the integration phase.
      </p>
    </div>
  );
}
