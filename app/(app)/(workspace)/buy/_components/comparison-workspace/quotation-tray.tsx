"use client";

// Comparison Workspace — region ② QUOTATION TRAY. The selectable 2–5 vendor set (the frozen W-1 CS
// vendor set). Renders every DISCLOSED quotation in SYSTEM order (never re-ordered/sorted — R6/GI-04);
// the buyer picks 2–5. On toggle it updates the provider AND mirrors the selection to `?sel=` so the
// SERVER recomputes the subset's arithmetic (R7) — the URL write is USER-DRIVEN (this handler), never a
// mount effect. Nothing private is serialized — only `sel`.

import { usePathname, useRouter } from "next/navigation";
import { Money } from "@/frontend/components/format";
import { StatusChip } from "@/frontend/components/status-chip";
import { CheckboxRow } from "../form-controls";
import { quotationStateDisplay } from "../state-display";
import { MAX_COMPARE, MIN_COMPARE } from "./selection";
import { useComparisonWorkspace } from "./comparison-workspace-state";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function QuotationTray({ data }: { data: ComparisonWorkspaceData }) {
  const { selectedQuotationIds, setSelection } = useComparisonWorkspace();
  const router = useRouter();
  const pathname = usePathname();

  const selected = new Set(selectedQuotationIds);
  const systemOrder = data.traySuppliers.map((s) => s.quotationId);
  const count = selected.size;

  function commit(next: Set<string>) {
    const ordered = systemOrder.filter((id) => next.has(id));
    setSelection(ordered);
    const params = new URLSearchParams();
    ordered.forEach((id) => params.append("sel", id));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      if (next.size <= MIN_COMPARE) return; // keep the minimum comparable set
      next.delete(id);
    } else {
      if (next.size >= MAX_COMPARE) return; // cap the comparison width
      next.add(id);
    }
    commit(next);
  }

  const atMin = count <= MIN_COMPARE;
  const atMax = count >= MAX_COMPARE;

  return (
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-sm font-medium text-foreground">
        Select {MIN_COMPARE}–{MAX_COMPARE} quotations to compare
      </legend>
      <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
        {count} of {MAX_COMPARE} selected · minimum {MIN_COMPARE}
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        role="group"
        aria-label="Disclosed quotations"
      >
        {data.traySuppliers.map((supplier) => {
          const isChecked = selected.has(supplier.quotationId);
          // Blocking encodes the 2–5 bound: a checked row is locked at the minimum; an unchecked row is
          // locked at the maximum. Disabled rows carry the reason for AT.
          const blocked = isChecked ? atMin : atMax;
          const state = quotationStateDisplay(supplier.state);
          return (
            <div
              key={supplier.quotationId}
              className="min-w-[13rem] shrink-0 rounded-md border border-border bg-background p-3 aria-disabled:opacity-70"
              aria-disabled={blocked || undefined}
            >
              <CheckboxRow
                id={`cmp-sel-${supplier.quotationId}`}
                checked={isChecked}
                disabled={blocked}
                onChange={() => toggle(supplier.quotationId)}
                label={
                  <span className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{supplier.vendorName}</span>
                    <span className="text-sm text-muted-foreground">
                      <Money value={supplier.amount} />
                    </span>
                    <StatusChip label={state.label} tone={state.tone} />
                  </span>
                }
              />
              {blocked ? (
                <p className="mt-2 text-2xs text-muted-foreground">
                  {isChecked
                    ? `Keep at least ${MIN_COMPARE} to compare`
                    : `Up to ${MAX_COMPARE} at a time`}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
