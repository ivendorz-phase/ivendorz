"use client";

// Comparison Workspace — region ③ VENDOR COMPARISON MATRIX. Two read-only, purely DESCRIPTIVE views over
// the SELECTED subset (System order, never re-ranked — R6 / GI-04), built on the shared `DataListTable`
// primitive (no second table is coined):
//   • the grouped descriptive ATTRIBUTE matrix — collapsible groups (§2.11A.6), "Show differences only"
//     (§2.11A.2), honest absent-data states (§2.11A.4), and per-Vendor column focus (§2.11A.5);
//   • the indicative LINE-ITEM table — per-vendor unit prices; the arithmetic lowest is a disclosed FACT,
//     never a recommendation. Line-item DATA is mock until ESC-CS-LINEITEMS — labelled indicative.
//
// View state (differences-only, focused vendor) is safe URL state (§2.11A.13); collapse is local. None of it
// re-orders vendors, recomputes arithmetic (R7), or introduces a winner cue.

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { DataListTable, type DataColumn } from "@/frontend/components/data-list-table";
import { Money } from "@/frontend/components/format";
import { SealedMarker } from "@/frontend/components/sealed-marker";
import { TooltipProvider } from "@/frontend/primitives/tooltip";
import { cn } from "@/frontend/lib/cn";
import { CheckboxRow } from "../form-controls";
import type { CsLineItem, CsVendor } from "../comparative-statement/cs-view-models";
import type { ComparisonSupplier } from "@/frontend/components/comparison";
import { AbsentCell, MATRIX_ATTRS, MATRIX_GROUPS, type MatrixAttr } from "./matrix-model";
import { useWorkspaceView } from "./workspace-url-state";
import { RowTip, focusClass, LOWEST_TIP } from "./matrix-support";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

type MatrixRow =
  | { kind: "group"; key: string; groupKey: string; label: string; count: number }
  | { kind: "attr"; key: string; attr: MatrixAttr };

/** A vendor's cells all share the same disclosed value → the row is "identical" (differences-only hides it). */
function isDiffering(attr: MatrixAttr, suppliers: ComparisonSupplier[]): boolean {
  if (suppliers.length < 2) return true;
  const keys = new Set(suppliers.map((s) => attr.valueKey(s)));
  return keys.size > 1;
}

function AttributeMatrix({ data }: { data: ComparisonWorkspaceData }) {
  const suppliers = data.selectedSuppliers;
  const { differencesOnly, setDifferencesOnly, focusedVendor, setFocusedVendor } =
    useWorkspaceView();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // A focused vendor that is no longer in the selection is ignored (emphasis simply clears).
  const focusValid = focusedVendor && suppliers.some((s) => s.quotationId === focusedVendor);

  const differing = useMemo(
    () => new Set(MATRIX_ATTRS.filter((a) => isDiffering(a, suppliers)).map((a) => a.key)),
    [suppliers],
  );
  const identicalHidden = differencesOnly ? MATRIX_ATTRS.length - differing.size : 0;

  const rows = useMemo<MatrixRow[]>(() => {
    const out: MatrixRow[] = [];
    for (const group of MATRIX_GROUPS) {
      const attrs = MATRIX_ATTRS.filter((a) => a.groupKey === group.key).filter(
        (a) => !differencesOnly || differing.has(a.key),
      );
      if (attrs.length === 0) continue; // differences-only emptied the whole group → hide its header too
      out.push({
        kind: "group",
        key: `g:${group.key}`,
        groupKey: group.key,
        label: group.label,
        count: attrs.length,
      });
      if (collapsed.has(group.key)) continue; // collapsed → header only
      for (const attr of attrs) out.push({ kind: "attr", key: `a:${attr.key}`, attr });
    }
    return out;
  }, [differencesOnly, differing, collapsed]);

  function toggleGroup(groupKey: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }

  const allCollapsed = collapsed.size >= MATRIX_GROUPS.length;

  const labelColumn: DataColumn<MatrixRow> = {
    key: "__label",
    header: "Comparison",
    render: (row) => {
      if (row.kind === "group") {
        const isCollapsed = collapsed.has(row.groupKey);
        return (
          <button
            type="button"
            onClick={() => toggleGroup(row.groupKey)}
            aria-expanded={!isCollapsed}
            className="-mx-1 flex items-center gap-1.5 rounded px-1 text-2xs font-semibold uppercase tracking-wide text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {isCollapsed ? (
              <ChevronRight aria-hidden className="size-3.5" />
            ) : (
              <ChevronDown aria-hidden className="size-3.5" />
            )}
            {row.label}
            {isCollapsed ? <span className="font-normal normal-case">({row.count})</span> : null}
          </button>
        );
      }
      return (
        <span className="inline-flex items-center gap-1">
          {row.attr.label}
          {row.attr.tip ? <RowTip text={row.attr.tip} label={row.attr.label} /> : null}
        </span>
      );
    },
  };
  const supplierColumns: DataColumn<MatrixRow>[] = suppliers.map((s) => ({
    key: s.quotationId,
    header: s.vendorName,
    render: (row) => (row.kind === "attr" ? row.attr.render(s) : null),
  }));
  const supplierKeys = new Set(suppliers.map((s) => s.quotationId));

  return (
    <Card id="cw-matrix" className="scroll-mt-24">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle as="h2" className="text-base">
            Attribute comparison
          </CardTitle>
          {differencesOnly && identicalHidden > 0 ? (
            <p className="text-2xs text-muted-foreground" aria-live="polite">
              Showing {differing.size} differing {differing.size === 1 ? "row" : "rows"} ·{" "}
              {identicalHidden} identical {identicalHidden === 1 ? "row" : "rows"} hidden
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Per-Vendor focus (§2.11A.5) — emphasis only; never sorts, re-orders, or ranks. */}
          <label className="flex items-center gap-1.5 text-2xs text-muted-foreground">
            <span className="font-medium">Focus</span>
            <select
              aria-label="Focus a vendor column"
              value={focusValid ? focusedVendor! : ""}
              onChange={(e) => setFocusedVendor(e.target.value || null)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All vendors</option>
              {suppliers.map((s) => (
                <option key={s.quotationId} value={s.quotationId}>
                  {s.vendorName}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              setCollapsed(allCollapsed ? new Set() : new Set(MATRIX_GROUPS.map((g) => g.key)))
            }
            className="text-2xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
          <CheckboxRow
            id="cw-diff-toggle"
            checked={differencesOnly}
            onChange={(e) => setDifferencesOnly(e.target.checked)}
            label={<span className="text-sm">Show differences only</span>}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataListTable
          caption="Quotation comparison — each row is an attribute; each column a supplier, in the order the system provided (not ranked)."
          columns={[labelColumn, ...supplierColumns]}
          rows={rows}
          getRowKey={(row) => row.key}
          stickyFirstColumn
          rowHeaderFirstColumn
          getRowClassName={(row) =>
            row.kind === "group" ? "bg-muted/50 hover:bg-muted/50" : undefined
          }
          columnClassName={(colKey) =>
            focusClass(colKey, focusValid ? focusedVendor : null, supplierKeys)
          }
          emptyState={
            <div className="p-6 text-sm text-muted-foreground">
              No attributes to compare for this selection.
            </div>
          }
        />
      </CardContent>
    </Card>
  );
}

function lineItemColumns(vendors: CsVendor[]): DataColumn<CsLineItem>[] {
  const fixed: DataColumn<CsLineItem>[] = [
    {
      key: "item",
      header: "Item",
      render: (item) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">
            {item.sl}. {item.description}
          </span>
          {item.specification ? (
            <span className="text-2xs text-muted-foreground">{item.specification}</span>
          ) : null}
        </span>
      ),
    },
    { key: "unit", header: "Unit", hideOnMobile: true, render: (item) => item.unit },
    {
      key: "qty",
      header: "Qty",
      numeric: true,
      render: (item) => item.quantity.toLocaleString("en-US"),
    },
  ];
  const vendorCols: DataColumn<CsLineItem>[] = vendors.map((vendor, vi) => ({
    key: `v-${vendor.quotationId}`,
    header: vendor.vendorName,
    numeric: true,
    render: (item) => {
      const cell = item.cells[vi];
      if (cell?.sealed) return <SealedMarker />;
      if (!cell?.unitPrice) return <AbsentCell />; // honest absence — never a fabricated 0
      const isLowest = item.lowestVendorIdx?.includes(vi);
      return (
        <span
          className={cn(isLowest && "font-semibold text-iv-success-muted")}
          title={isLowest ? "Lowest quoted unit price for this item (arithmetic)" : undefined}
        >
          <Money value={cell.unitPrice} />
        </span>
      );
    },
  }));
  return [
    ...fixed,
    ...vendorCols,
    {
      key: "lowest",
      header: "Lowest unit",
      numeric: true,
      render: (item) => <Money value={item.lowestUnitPrice} />,
    },
  ];
}

function LineItemTable({ data }: { data: ComparisonWorkspaceData }) {
  const { focusedVendor } = useWorkspaceView();
  const { statement } = data;
  const vendorKeys = new Set(statement.vendors.map((v) => `v-${v.quotationId}`));
  const focusedKey = focusedVendor ? `v-${focusedVendor}` : null;
  return (
    <Card id="cw-line-items" className="scroll-mt-24">
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <CardTitle as="h2" className="text-base">
            Item-by-item pricing
          </CardTitle>
          <RowTip text={LOWEST_TIP} label="Lowest unit price" />
        </div>
        <p className="text-2xs text-muted-foreground">
          Indicative — structured line-item data is pending schema ratification. Lowest unit price
          per item is an arithmetic identification, not a recommendation.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <DataListTable
          caption="Item-by-item unit prices per selected vendor, in the order the system provided (not ranked)."
          columns={lineItemColumns(statement.vendors)}
          rows={statement.items}
          getRowKey={(item) => String(item.sl)}
          stickyFirstColumn
          rowHeaderFirstColumn
          columnClassName={(colKey) => focusClass(colKey, focusedKey, vendorKeys)}
          emptyState={
            <div className="p-6 text-sm text-muted-foreground">No line items to compare yet.</div>
          }
        />
      </CardContent>
    </Card>
  );
}

export function VendorComparisonMatrix({ data }: { data: ComparisonWorkspaceData }) {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <AttributeMatrix data={data} />
        <LineItemTable data={data} />
      </div>
    </TooltipProvider>
  );
}
