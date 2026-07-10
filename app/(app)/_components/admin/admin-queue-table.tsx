// AdminQueueTable — shared admin console queue table (extracted at the 2nd admin queue per the RV-0006/RV-0008
// OBS). Presentation-only, RSC, GENERIC over the row type: the surface supplies typed columns (header + a
// `cell(row)` renderer + optional cell classes) and rows. ONE responsive enterprise table for every admin
// worklist (moderation, RFQ moderation, bans, approvals, verification…). Horizontal scroll on narrow viewports
// (admin is desktop-first, page_inventory §13.7). Renders no governance signal and fabricates no total — the
// surface owns the data + the row actions (R5). Reuses the kit Card.
import type { ReactNode } from "react";
import { Card } from "@/frontend/primitives/card";
import { cn } from "@/frontend/lib/cn";

export interface AdminQueueColumn<T> {
  /** Stable column key. */
  key: string;
  /** Header label; when `srHeader`, it is visually hidden (e.g. an actions column). */
  header: string;
  srHeader?: boolean;
  /** Cell content for a row. */
  cell: (row: T) => ReactNode;
  /** Extra classes on the CELL (`<td>`) only — e.g. "whitespace-nowrap", "font-mono", "text-right". */
  className?: string;
  /** Extra classes on the HEADER (`<th>`) only — kept separate so cell classes never leak onto headers. */
  headerClassName?: string;
}

export interface AdminQueueTableProps<T> {
  columns: AdminQueueColumn<T>[];
  rows: T[];
  /** Stable key per row. */
  rowKey: (row: T) => string;
  /** Accessible caption (visually hidden). */
  caption: string;
  /** Min table width before horizontal scroll kicks in. */
  minWidthClassName?: string;
}

export function AdminQueueTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  minWidthClassName = "min-w-[56rem]",
}: AdminQueueTableProps<T>) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-sm", minWidthClassName)}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("px-4 py-3 font-medium", col.headerClassName)}
                >
                  {col.srHeader ? <span className="sr-only">{col.header}</span> : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-border last:border-0 hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
