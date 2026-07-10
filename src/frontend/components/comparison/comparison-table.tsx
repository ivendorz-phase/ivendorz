// Doc-7B kit — the comparison MATRIX. Promoted from the buyer-scoped `P-BUY-15` realization (Shared
// Platform Component Registry §4.2 CTO override — 2026-07-03). REUSES the shared `DataListTable` (no
// second table primitive is coined): rows = the descriptive ATTRIBUTES, columns = the SUPPLIERS (in System
// order), the first column a sticky `<th scope="row">` attribute label. The buyer scans a row to compare
// one attribute across suppliers. PRESENTATION-ONLY; the order is the System's and is never re-sorted/
// re-ranked here (R6 / GI-04).

import { Card, CardContent } from "@/frontend/primitives/card";
import { DataListTable } from "@/frontend/components/data-list-table";
import { buildComparisonColumns } from "./comparison-column";
import { COMPARISON_ATTRIBUTES } from "./comparison-row";
import type { ComparisonSupplier } from "./comparison-view-models";

export function ComparisonTable({ suppliers }: { suppliers: ComparisonSupplier[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <DataListTable
          caption="Quotation comparison — each row is an attribute; each column a supplier, in the order the system provided (not ranked)."
          columns={buildComparisonColumns(suppliers)}
          rows={COMPARISON_ATTRIBUTES}
          getRowKey={(attr) => attr.key}
          stickyFirstColumn
          rowHeaderFirstColumn
          emptyState={null}
        />
      </CardContent>
    </Card>
  );
}
