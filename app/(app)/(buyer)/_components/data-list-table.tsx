// Buyer Workspace — DataListTable: a BUYER-SCOPED, read-only, generic listing table (Tier-2 per the
// Shared Platform Component Registry). The single table implementation reused by the dashboard work
// queues (P-BUY-01) and the RFQ list (P-BUY-06) — so the two never diverge. Pure function of props
// (Server Component, no hooks/fetch). It RE-QUERIES nothing and RE-RANKS nothing: rows render in the
// caller-supplied (governed contract) order — never re-ranked (GI-04 / R6).
//
// REGISTRY NOTE: Doc-7F §11.3 lists `data-table` as a Doc-7B (Tier-0) item not yet on disk. This is the
// buyer-scoped realization; it is an explicit Doc-7B promotion candidate — when a second workspace needs
// a listing table, promote via the registry §4 (kit owner + Board), never fork a second copy.
//
// GOVERNANCE: the empty node is caller-supplied and must never imply exclusion (GI-12; Inv #11). A
// `total`/count is the caller's responsibility and is rendered only when the contract provides one.
//
// A11y: semantic `<table>` with an sr-only `<caption>`, `scope="col"` headers; numeric columns are
// right-aligned with `tabular-nums`; the first column links the row to its detail (opaque-id route).

import * as React from "react";
import Link from "next/link";
import { cn } from "@/frontend/lib/cn";

export interface DataColumn<T> {
  /** Stable column key. */
  key: string;
  /** Column header text. */
  header: string;
  /** Cell renderer — pure presentation of the already-resolved row. */
  render: (row: T) => React.ReactNode;
  /** Right-align (for amounts/dates). Adds `tabular-nums`. */
  numeric?: boolean;
  /** Hide below `sm` to keep the table scannable on mobile. */
  hideOnMobile?: boolean;
}

export interface DataListTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Accessible caption (sr-only) — describes the table for screen readers. */
  caption: string;
  /** Rendered in place of the table when there are no rows (must never imply exclusion). */
  emptyState: React.ReactNode;
  /** Optional per-row destination (opaque-id route) — links the first cell. */
  getRowHref?: (row: T) => string | undefined;
  className?: string;
}

export function DataListTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  emptyState,
  getRowHref,
  className,
}: DataListTableProps<T>) {
  if (rows.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-t border-border text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground",
                  col.numeric && "text-right",
                  col.hideOnMobile && "hidden sm:table-cell",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = getRowHref?.(row);
            return (
              <tr
                key={getRowKey(row)}
                className="border-b border-border last:border-0 hover:bg-accent/60"
              >
                {columns.map((col, colIndex) => {
                  const content = col.render(row);
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-2.5 align-middle text-foreground",
                        col.numeric && "text-right tabular-nums",
                        col.hideOnMobile && "hidden sm:table-cell",
                      )}
                    >
                      {/* First column links the row to its detail (opaque-id route) when provided. */}
                      {colIndex === 0 && href ? (
                        <Link
                          href={href}
                          className="font-medium text-foreground underline-offset-2 hover:underline"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
