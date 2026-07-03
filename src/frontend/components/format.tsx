// Doc-7B kit — shared PRESENTATION FORMAT HELPERS. The single home for date/money/ref rendering, promoted
// from the buyer-scoped realization (Shared Platform Component Registry §4.2 CTO override — 2026-07-03) so
// formatting never diverges across workspaces. Pure presentation (Server Component / pure functions); no
// business logic, no fetch. Currency is always a PROP (BDT default at the kit level — GI-08 / Doc-2 §0.4),
// never assumed here.

import * as React from "react";
import { CurrencyDisplay } from "./currency-display";

export interface MoneyValue {
  amount: number;
  /** ISO 4217 code carried by the same contract value field; never assumed away from BDT elsewhere. */
  currency?: string;
}

/** Short date (medium, en-BD) — for table cells. Invalid input renders verbatim, never throws. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(d);
}

/** Date + time (medium/short, en-BD) — for activity/lifecycle timestamps. */
export function formatInstant(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/** Render a `{ amount, currency }` value (kit `CurrencyDisplay`, BDT default), or an em dash when absent. */
export function Money({ value }: { value?: MoneyValue }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <CurrencyDisplay amount={value.amount} currency={value.currency} />;
}

/** Monospaced, tabular human reference (e.g. `RFQ-2026-000123`) — a DISPLAY LABEL only; routes use the opaque id. */
export function Ref({ children }: { children: React.ReactNode }) {
  return (
    <span data-type="ref" className="font-mono text-xs text-muted-foreground">
      {children}
    </span>
  );
}
