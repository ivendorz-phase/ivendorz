"use client";

// S4 Quote Authoring · Section 1 — PRICE BREAKDOWN (companion §13.1). Renders the line-item table that
// composes the frozen `price_breakdown` jsonb (required). The line-item sub-fields (#, Description, Qty,
// Unit, Amount) and the Subtotal row are a COMPANION presentation shape over that jsonb — the jsonb
// internal schema is dev-doc (Doc-4E Part4), not a frozen column set. Amounts are BDT via the kit
// CurrencyDisplay (locale-threaded).
//
// VAT RATE (7.5/10/15%) and AIT are NOT frozen concepts (Doc-2/Doc-4E are silent on Bangladesh VAT/AIT
// taxation — same gap as the Mushok Challan placeholder, ESC-OPS-DOC-MUSHOK doctrine: disclose, never
// invent). `MockVatRate`/`aitExclude` below are a clearly-labelled, client-side-only presentation mock —
// they are NOT added to the frozen `PriceBreakdownLine` shape and are never sent anywhere. When
// `editable` is false (the default), the table renders exactly as before: read-only, no live recompute.
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Input } from "@/frontend/primitives/input";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { EmptyState } from "@/frontend/components/empty-state";
import type { PriceBreakdownLine } from "./types";

/** Presentation-only mock — not a frozen VAT/AIT concept. See file header. */
export type MockVatRate = "7.5" | "10" | "15";

export function computeVatTotals(
  lines: PriceBreakdownLine[] | undefined,
  vatRate: MockVatRate | null,
  aitExclude: boolean,
) {
  const subtotal = (lines ?? []).reduce(
    (sum, line) => sum + (typeof line.amount === "number" ? line.amount : 0),
    0,
  );
  const rate = vatRate ? Number(vatRate) / 100 : 0;
  const vatBase = aitExclude ? subtotal * 0.95 : subtotal;
  const vat = vatRate ? Math.round(vatBase * rate) : 0;
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

export interface PriceBreakdownTableProps {
  lines?: PriceBreakdownLine[];
  currency?: string;
  subtotal?: number;
  /** Enables live editing + the VAT/AIT mock. Defaults to the original read-only presentation. */
  editable?: boolean;
  onLinesChange?: (lines: PriceBreakdownLine[]) => void;
  vatRate?: MockVatRate | null;
  onVatRateChange?: (rate: MockVatRate) => void;
  aitExclude?: boolean;
  onAitExcludeChange?: (value: boolean) => void;
}

export function PriceBreakdownTable({
  lines,
  currency = "BDT",
  subtotal,
  editable = false,
  onLinesChange,
  vatRate = null,
  onVatRateChange,
  aitExclude = false,
  onAitExcludeChange,
}: PriceBreakdownTableProps) {
  const hasLines = lines && lines.length > 0;
  const totals = editable ? computeVatTotals(lines, vatRate, aitExclude) : null;
  const displaySubtotal = editable ? totals!.subtotal : subtotal;

  function updateLine(index: number, patch: Partial<PriceBreakdownLine>) {
    if (!onLinesChange) return;
    const next = (lines ?? []).map((line, i) => {
      if (i !== index) return line;
      const merged = { ...line, ...patch };
      const qty = typeof merged.qty === "number" ? merged.qty : 0;
      const unitAmount = typeof merged.unit_amount === "number" ? merged.unit_amount : 0;
      return { ...merged, amount: qty * unitAmount };
    });
    onLinesChange(next);
  }

  function addLine() {
    onLinesChange?.([...(lines ?? []), { description: "", qty: 1, unit_amount: 0, amount: 0 }]);
  }

  function removeLine(index: number) {
    onLinesChange?.((lines ?? []).filter((_, i) => i !== index));
  }

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
                {editable ? <th scope="col" className="px-3 py-2" /> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines!.map((line, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2 text-foreground">
                    {editable ? (
                      <Input
                        aria-label={`Line ${index + 1} description`}
                        value={line.description ?? ""}
                        onChange={(e) => updateLine(index, { description: e.target.value })}
                        className="h-8"
                      />
                    ) : (
                      (line.description ?? "—")
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {editable ? (
                      <Input
                        type="number"
                        min={0}
                        aria-label={`Line ${index + 1} quantity`}
                        value={line.qty ?? ""}
                        onChange={(e) =>
                          updateLine(index, {
                            qty: e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                        className="h-8 text-right"
                      />
                    ) : (
                      (line.qty ?? "—")
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {editable ? (
                      <Input
                        type="number"
                        min={0}
                        aria-label={`Line ${index + 1} unit rate`}
                        value={line.unit_amount ?? ""}
                        onChange={(e) =>
                          updateLine(index, {
                            unit_amount: e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                        className="h-8 text-right"
                      />
                    ) : typeof line.unit_amount === "number" ? (
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
                  {editable ? (
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove line ${index + 1}`}
                        onClick={() => removeLine(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  ) : null}
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

      <Button type="button" variant="outline" size="sm" onClick={addLine} disabled={!editable}>
        <Plus aria-hidden="true" className="size-4" /> Add line
      </Button>

      <dl className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">
            {typeof displaySubtotal === "number" ? (
              <CurrencyDisplay amount={displaySubtotal} currency={currency} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">VAT rate</dt>
          {editable ? (
            <dd
              role="radiogroup"
              aria-label="VAT rate"
              className="flex flex-wrap items-center gap-3"
            >
              {(["7.5", "10", "15"] as MockVatRate[]).map((rate) => (
                <label key={rate} className="inline-flex items-center gap-1 text-foreground">
                  <input
                    type="radio"
                    name="vat-rate"
                    value={rate}
                    checked={vatRate === rate}
                    onChange={() => onVatRateChange?.(rate)}
                  />
                  {rate}%
                </label>
              ))}
            </dd>
          ) : (
            <dd className="text-muted-foreground">{vatRate ? `${vatRate}%` : "—"}</dd>
          )}
        </div>
        {editable ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">AIT</dt>
            <dd>
              <label className="inline-flex items-center gap-2 text-foreground">
                <input
                  type="checkbox"
                  checked={aitExclude}
                  onChange={(e) => onAitExcludeChange?.(e.target.checked)}
                />
                Exclude AIT from VAT base
              </label>
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">VAT</dt>
          <dd className="tabular-nums">
            {editable && totals ? (
              <CurrencyDisplay amount={totals.vat} currency={currency} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
        <div className="flex items-center justify-between font-medium text-foreground">
          <dt>Grand total</dt>
          <dd className="tabular-nums">
            {editable && totals ? (
              <CurrencyDisplay amount={totals.total} currency={currency} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        {editable
          ? "VAT rate and AIT are a presentation-only mock — Bangladesh VAT/AIT taxation is not yet modeled in the frozen corpus. Select a VAT rate before previewing."
          : "Totals and VAT calculate in the integration phase."}
      </p>
    </div>
  );
}
