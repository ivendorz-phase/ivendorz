// Buyer Workspace — work-queue widget (P-BUY-01 "needs your action" queues, Doc-7F §9.1).
//
// A BUYER-SCOPED, read-only compact table composed from the existing Doc-7B kit `Card` + `EmptyState`.
// This is NOT the shared Doc-7B `data-table` primitive (cursor pagination / density / sort) — that
// remains a Doc-7B-owner item (§11.3); this is a dashboard-scoped mini-table for the at-a-glance queues.
// Pure function of props (Server Component, no hooks/fetch). It RE-QUERIES nothing and RE-RANKS nothing:
// it renders the rows in the order the caller supplies (the governed contract order — never re-ranked,
// GI-04 / R6).
//
// GOVERNANCE: `total`/count renders ONLY when the caller passes one (a client-computed total could leak
// an exclusion count — GI-12; Inv #11). The empty copy must never imply exclusion. Status cells use the
// kit `StatusChip` (text + tone, never colour alone — GI-06).
//
// A11y: a semantic `<table>` with a `<caption>` (the queue title), `scope="col"` headers, and a single
// section heading; numeric columns are right-aligned with `tabular-nums`.

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { cn } from "@/frontend/lib/cn";

export interface QueueColumn<T> {
  /** Stable column key. */
  key: string;
  /** Column header text. */
  header: string;
  /** Cell renderer — pure presentation of the already-resolved row. */
  render: (row: T) => React.ReactNode;
  /** Right-align (for amounts/dates). Adds `tabular-nums`. */
  numeric?: boolean;
  /** Hide below `sm` to keep the queue scannable on mobile. */
  hideOnMobile?: boolean;
}

export interface WorkQueueCardProps<T> {
  /** Queue title (rendered as the card title AND the table caption). */
  title: string;
  columns: QueueColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Empty-state copy (must never imply exclusion). */
  emptyMessage: string;
  /** Optional "view all" destination (opaque-id route). */
  viewAllHref?: string;
  /** Optional contract-provided total; rendered only if supplied (GI-12). */
  total?: number;
  /** Optional per-row destination (opaque-id route) — makes the row's ref keyboard-navigable. */
  getRowHref?: (row: T) => string | undefined;
}

export function WorkQueueCard<T>({
  title,
  columns,
  rows,
  getRowKey,
  emptyMessage,
  viewAllHref,
  total,
  getRowHref,
}: WorkQueueCardProps<T>) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 p-4">
        <CardTitle className="text-sm font-semibold">
          {title}
          {typeof total === "number" ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">{total}</span>
          ) : null}
        </CardTitle>
        {viewAllHref ? (
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link href={viewAllHref}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState title={emptyMessage} className="py-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-t border-border text-sm">
              <caption className="sr-only">{title}</caption>
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
        )}
      </CardContent>
    </Card>
  );
}
