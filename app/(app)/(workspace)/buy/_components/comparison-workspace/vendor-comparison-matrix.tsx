// Comparison Workspace — region ③ VENDOR COMPARISON MATRIX. Two read-only views over the SELECTED
// subset, both PURELY DESCRIPTIVE (System order, never re-ranked — R6/GI-04):
//   • the descriptive attribute matrix — the kit `ComparisonTable` (built on `DataListTable`; the only
//     table primitive — no second table is coined);
//   • the indicative line-item table — per-vendor unit prices, with the arithmetic lowest disclosed as a
//     fact (not a recommendation). Line-item DATA is mock until `ESC-CS-LINEITEMS` — labelled indicative.

import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { ComparisonTable } from "@/frontend/components/comparison";
import { DataListTable, type DataColumn } from "@/frontend/components/data-list-table";
import { Money } from "@/frontend/components/format";
import { SealedMarker } from "@/frontend/components/sealed-marker";
import { cn } from "@/frontend/lib/cn";
import type { CsLineItem, CsVendor } from "../comparative-statement/cs-view-models";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

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
      const isLowest = item.lowestVendorIdx?.includes(vi);
      return (
        <span
          className={cn(isLowest && "font-semibold text-iv-success-muted")}
          title={isLowest ? "Lowest quoted unit price for this item (arithmetic)" : undefined}
        >
          <Money value={cell?.unitPrice} />
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

export function VendorComparisonMatrix({ data }: { data: ComparisonWorkspaceData }) {
  const { selectedSuppliers, statement } = data;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Attribute comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ComparisonTable suppliers={selectedSuppliers} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle as="h2" className="text-base">
            Item-by-item pricing
          </CardTitle>
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
            emptyState={
              <div className="p-6 text-sm text-muted-foreground">No line items to compare yet.</div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
