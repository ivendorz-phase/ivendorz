// Comparison Workspace — region ③′ COMPARISON READINESS STRIP (§2.11A.1). A compact, FACT-ONLY summary of
// the current selection, derived entirely from the disclosed view-model. It scores nothing, ranks nothing,
// and makes no quality judgement — every number is a plain count of already-disclosed data (governance
// envelope). Pure presentation (no hooks); re-renders with `data` when the server re-resolves the selection.
//
// Honest-derivation note: the frozen disclosed view-model carries no structured "technical deviation" signal
// (that lives only in the buyer's own private assessment), so — unlike the demo prototype — this strip does
// NOT show a fabricated deviations count. It shows the facts the disclosed data actually supports.

import { isCommerciallyIncomplete } from "./matrix-model";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function ComparisonReadinessStrip({ data }: { data: ComparisonWorkspaceData }) {
  const vendors = data.selectedSuppliers.length;
  const items = data.statement.computed.totalItems || data.statement.items.length;
  const sealedValues = data.statement.items.reduce(
    (total, item) => total + item.cells.filter((c) => c.sealed).length,
    0,
  );
  const incomplete = data.selectedSuppliers.filter(isCommerciallyIncomplete).length;

  const facts: { value: number; label: string }[] = [
    { value: vendors, label: vendors === 1 ? "Vendor selected" : "Vendors selected" },
    { value: items, label: items === 1 ? "RFQ item" : "RFQ items" },
    { value: sealedValues, label: sealedValues === 1 ? "sealed value" : "sealed values" },
    {
      value: incomplete,
      label: `${incomplete === 1 ? "quotation" : "quotations"} with incomplete commercial terms`,
    },
  ];

  return (
    <section
      aria-label="Comparison readiness"
      className="rounded-lg border border-border bg-muted/40 px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          Comparison readiness
        </span>
        {facts.map((fact) => (
          <span key={fact.label} className="flex items-baseline gap-1.5 text-sm">
            <span className="font-semibold tabular-nums text-foreground">{fact.value}</span>
            <span className="text-muted-foreground">{fact.label}</span>
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-2xs text-muted-foreground">
        Counts of already-disclosed data — not a score, ranking, or quality judgement.
      </p>
    </section>
  );
}
