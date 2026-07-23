"use client";

// Comparison Workspace — region ② QUOTATION TRAY. The selectable 2–5 vendor set (the frozen W-1 CS vendor
// set). Renders every DISCLOSED quotation in SYSTEM order (never re-ordered/sorted — R6/GI-04); the buyer
// picks 2–5. On toggle it updates the provider AND mirrors the selection to `?sel=` (preserving the other
// safe view state) so the SERVER recomputes the subset's arithmetic (R7) — the URL write is USER-DRIVEN
// (this handler), never a mount effect. Nothing private is serialized — only `sel`.
//
// Rich cards (§2.11A.10): name · quoted total · delivery · validity · state · sealed indicator — but NO
// lowest/best/recommended cue in the tray (the lowest fact lives only in the matrix + terms). Deselecting a
// vendor that has session-local evaluation confirms first (§2.11A.11); the quotation itself is never changed.

import { Money, formatDate } from "@/frontend/components/format";
import { StatusChip } from "@/frontend/components/status-chip";
import { SealedMarker } from "@/frontend/components/sealed-marker";
import { CheckboxRow } from "../form-controls";
import { quotationStateDisplay } from "../state-display";
import { MAX_COMPARE, MIN_COMPARE } from "./selection";
import { useComparisonWorkspace } from "./comparison-workspace-state";
import { useWorkspaceView } from "./workspace-url-state";
import { useConfirmDialog } from "./confirm-dialog";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function QuotationTray({ data }: { data: ComparisonWorkspaceData }) {
  const { selectedQuotationIds, setSelection, evaluation } = useComparisonWorkspace();
  const { setSel } = useWorkspaceView();
  const { confirm, dialogNode } = useConfirmDialog();

  const selected = new Set(selectedQuotationIds);
  const systemOrder = data.traySuppliers.map((s) => s.quotationId);
  const count = selected.size;

  function commit(next: Set<string>) {
    const ordered = systemOrder.filter((id) => next.has(id));
    setSelection(ordered);
    setSel(ordered);
  }

  /** Does this vendor hold buyer-authored session content that a removal would drop? */
  function hasSessionEval(id: string): boolean {
    const entry = evaluation.byQuotation[id];
    const hasNote = Boolean(
      entry && (entry.compliance !== "unset" || (entry.technical ?? "").trim().length > 0),
    );
    return hasNote || evaluation.recommendedQuotationId === id;
  }

  function remove(id: string) {
    const next = new Set(selected);
    next.delete(id);
    commit(next); // setSelection reconciles-on-deselect: the vendor's private entry is dropped
  }

  function toggle(id: string) {
    if (selected.has(id)) {
      if (count <= MIN_COMPARE) return; // keep the minimum comparable set
      if (hasSessionEval(id)) {
        const supplier = data.traySuppliers.find((s) => s.quotationId === id);
        confirm({
          title: `Remove ${supplier?.vendorName ?? "this vendor"} from this comparison?`,
          description:
            "Its private session evaluation will be removed. The Vendor quotation itself will not be changed.",
          confirmLabel: "Remove from comparison",
          cancelLabel: "Keep vendor",
          danger: true,
          onConfirm: () => remove(id),
        });
        return;
      }
      remove(id);
    } else {
      if (count >= MAX_COMPARE) return; // cap the comparison width
      const next = new Set(selected);
      next.add(id);
      commit(next);
    }
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
              className="min-w-[14rem] shrink-0 rounded-md border border-border bg-background p-3 aria-disabled:opacity-70"
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
                      {supplier.sealed ? <SealedMarker /> : <Money value={supplier.amount} />}
                    </span>
                    {supplier.delivery || supplier.validUntil ? (
                      <span className="flex flex-wrap gap-x-1.5 text-2xs text-muted-foreground">
                        {supplier.delivery ? <span>{supplier.delivery}</span> : null}
                        {supplier.delivery && supplier.validUntil ? (
                          <span aria-hidden>·</span>
                        ) : null}
                        {supplier.validUntil ? (
                          <span>valid to {formatDate(supplier.validUntil)}</span>
                        ) : null}
                      </span>
                    ) : null}
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
      {dialogNode}
    </fieldset>
  );
}
