// P-BUY-15 — comparison COLUMN builder. Builds the `DataListTable` columns for the transposed comparison
// matrix: a sticky first column for the attribute LABEL (rendered as a row header by the table), then one
// column per SUPPLIER in the SYSTEM-supplied order. The order is the System's — this builder maps it
// 1:1 and NEVER re-orders/re-ranks the suppliers (R6 / GI-04). PRESENTATION-ONLY.

import type { DataColumn } from "../data-list-table";
import type { ComparisonSupplier } from "./comparison-view-models";
import type { ComparisonAttribute } from "./comparison-row";

/**
 * Columns for the matrix: `[attribute-label]` (sticky row-header column) + one column per supplier. Each
 * supplier column's cell renderer applies the attribute's `cell(supplier)` — so a row is one attribute
 * across every supplier. Supplier order is preserved verbatim from `suppliers` (never sorted).
 */
export function buildComparisonColumns(
  suppliers: ComparisonSupplier[],
): DataColumn<ComparisonAttribute>[] {
  const labelColumn: DataColumn<ComparisonAttribute> = {
    key: "__attribute",
    header: "Attribute",
    render: (attr) => attr.label,
  };
  const supplierColumns: DataColumn<ComparisonAttribute>[] = suppliers.map((s) => ({
    key: s.quotationId,
    header: s.vendorName,
    render: (attr) => attr.cell(s),
  }));
  return [labelColumn, ...supplierColumns];
}
