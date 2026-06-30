// Reconciliation summary (companion §13.3 M-1). A DERIVED display composition of the vendor's OWN
// off-platform records — Invoiced · Recorded · Confirmed · Outstanding — explicitly labelled "derived,
// off-platform records". It is NOT a count contract and NOT a stat-tile (Invariant 11): plain numeric
// text composed from already-read documents, never a wired aggregate. Renders nothing until values are
// provided. Presentation-only; RSC-friendly.
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import type { ReconciliationView } from "./types";

export interface ReconciliationSummaryProps {
  reconciliation?: ReconciliationView;
}

function Amount({ value, currency }: { value?: number; currency: string }) {
  return typeof value === "number" ? (
    <CurrencyDisplay amount={value} currency={currency} />
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

export function ReconciliationSummary({ reconciliation }: ReconciliationSummaryProps) {
  const currency = reconciliation?.currency ?? "BDT";

  return (
    <div className="rounded-md border border-border p-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Reconciliation
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
        <span>
          <span className="text-muted-foreground">Invoiced </span>
          <Amount value={reconciliation?.invoiced} currency={currency} />
        </span>
        <span>
          <span className="text-muted-foreground">Recorded </span>
          <Amount value={reconciliation?.recorded} currency={currency} />
        </span>
        <span>
          <span className="text-muted-foreground">Confirmed </span>
          <Amount value={reconciliation?.confirmed} currency={currency} />
        </span>
        <span>
          <span className="text-muted-foreground">Outstanding </span>
          <Amount value={reconciliation?.outstanding} currency={currency} />
        </span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Derived from your own records — off-platform payments, not settlement.
      </p>
    </div>
  );
}
