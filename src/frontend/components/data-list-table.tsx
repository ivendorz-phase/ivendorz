// Doc-7B kit — DataListTable: a generic, read-only listing table (promoted from the buyer-scoped
// realization per the Shared Platform Component Registry §4.2 CTO override — 2026-07-03). Pure function
// of props (Server Component, no hooks/fetch). It RE-QUERIES nothing and RE-RANKS nothing: rows render in
// the caller-supplied (governed contract) order — never re-ranked (GI-04 / R6).
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
  /**
   * Let this column absorb the flexible width and TRUNCATE its content instead of forcing the table
   * wider than its container (an auto-layout table otherwise sizes a column to its content's
   * min-content — a long unbroken title then overflows a narrow track). Opt-in: applies `w-full` to
   * the cell so this column claims the space the other (content-sized) columns leave, and its own
   * content truncates within that. The cell's content must use `truncate` (with `min-w-0` on any flex
   * wrapper) for the ellipsis. Off by default — existing columns are unaffected.
   */
  truncate?: boolean;
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
  /**
   * Pin the first column during horizontal scroll (e.g. a comparison matrix's attribute-label column, or a
   * wide listing's identity column). Off by default — existing consumers are unaffected.
   */
  stickyFirstColumn?: boolean;
  /**
   * Render the first column's cells as `<th scope="row">` (row headers) instead of `<td>` — for matrix/
   * comparison tables where each row is a named attribute, so AT associates each cell with its row + column
   * header. Off by default. Not combined with `getRowHref` (a row header is a link).
   */
  rowHeaderFirstColumn?: boolean;
  /**
   * Optional per-COLUMN class hook (keyed by `column.key`), applied to that column's header AND every body
   * cell — e.g. a comparison matrix emphasising/subduing a focused vendor column. Purely presentational and
   * opt-in (returns `undefined` → no change); it never re-orders or re-ranks (R6 / GI-04). Off by default.
   */
  columnClassName?: (colKey: string) => string | undefined;
  /**
   * Optional per-ROW class hook, applied to the `<tr>` — e.g. a collapsible matrix styling a group-header
   * row distinctly from data rows. Purely presentational and opt-in; it changes no data. Off by default.
   */
  getRowClassName?: (row: T) => string | undefined;
  className?: string;
}

export function DataListTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  emptyState,
  getRowHref,
  stickyFirstColumn,
  rowHeaderFirstColumn,
  columnClassName,
  getRowClassName,
  className,
}: DataListTableProps<T>) {
  if (rows.length === 0) {
    return <>{emptyState}</>;
  }
  return (
    // When the first column is sticky the table is meant to scroll horizontally (e.g. the comparison
    // matrix on narrow screens). A static table has no focusable child to carry arrow-key scroll, so the
    // scroll region itself is made keyboard-focusable + labelled (WCAG 2.1.1 / 1.4.10). Gated on
    // `stickyFirstColumn` so the non-scrolling listings gain no spurious focus stop. The `caption` is
    // reused as the accessible label (no new copy). Sticky cells use `z-10` — sufficient because this
    // table has no vertical-sticky header, and the scroll region is its own stacking context (well below
    // the shell chrome). If a sticky header row is ever added, the corner cell needs a higher z.
    <div
      className={cn("overflow-x-auto", className)}
      {...(stickyFirstColumn ? { tabIndex: 0, role: "group", "aria-label": caption } : {})}
    >
      <table className="w-full border-t border-border text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, colIndex) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-2 text-left text-2xs font-semibold uppercase tracking-wide text-muted-foreground",
                  col.numeric && "text-right",
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.truncate && "w-full max-w-0",
                  stickyFirstColumn &&
                    colIndex === 0 &&
                    "sticky left-0 z-10 border-r border-border bg-card",
                  columnClassName?.(col.key),
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {/* iv-stagger-fade: Motion Standard row entrance — fade only (a translate would break
            the sticky first column); CSS-only, stays a Server Component. */}
        <tbody className="iv-stagger-fade">
          {rows.map((row) => {
            const href = getRowHref?.(row);
            return (
              <tr
                key={getRowKey(row)}
                className={cn(
                  "group border-b border-border last:border-0 hover:bg-accent/60",
                  getRowClassName?.(row),
                )}
              >
                {columns.map((col, colIndex) => {
                  const content = col.render(row);
                  const isFirst = colIndex === 0;
                  const sticky = stickyFirstColumn && isFirst;
                  // Matrix/comparison first column → a real row header (scope="row") for cell association.
                  if (rowHeaderFirstColumn && isFirst) {
                    return (
                      <th
                        key={col.key}
                        scope="row"
                        className={cn(
                          "px-4 py-2.5 text-left align-middle font-medium text-foreground",
                          col.hideOnMobile && "hidden sm:table-cell",
                          // Opaque bg occludes content scrolling beneath; right border delineates the frozen
                          // edge; `group-hover` keeps the sticky cell in sync with the row hover (solid, so it
                          // stays opaque during horizontal scroll).
                          sticky &&
                            "sticky left-0 z-10 border-r border-border bg-card group-hover:bg-accent",
                          columnClassName?.(col.key),
                        )}
                      >
                        {content}
                      </th>
                    );
                  }
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-2.5 align-middle text-foreground",
                        col.numeric && "text-right tabular-nums",
                        col.hideOnMobile && "hidden sm:table-cell",
                        col.truncate && "w-full max-w-0",
                        sticky &&
                          "sticky left-0 z-10 border-r border-border bg-card group-hover:bg-accent",
                        columnClassName?.(col.key),
                      )}
                    >
                      {/* First column links the row to its detail (opaque-id route) when provided.
                          A truncate column's link becomes a block min-w-0 box so its content can
                          ellipsis instead of forcing the cell wide. */}
                      {isFirst && href ? (
                        <Link
                          href={href}
                          className={cn(
                            "font-medium text-foreground underline-offset-2 hover:underline",
                            col.truncate && "block min-w-0",
                          )}
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
