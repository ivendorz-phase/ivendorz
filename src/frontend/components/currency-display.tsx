// App component: CurrencyDisplay (Doc-7B §7.3 / Doc-2 §0.4). Presentation-only. Renders the
// `{amount, currency}` pair the contract carries on the value field. Currency is a PROP, default
// BDT — never hardcoded/assumed at any call site. Tabular numerals for column alignment.
import * as React from "react";
import { cn } from "../lib/cn";

export interface CurrencyDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Amount as provided by the contract field. */
  amount: number;
  /** ISO 4217 code carried by the SAME value field (Doc-2 §0.4). Defaults BDT — not hardcoded elsewhere. */
  currency?: string;
  /** Optional locale for grouping/format; defaults en-BD. */
  locale?: string;
}

export function CurrencyDisplay({
  amount,
  currency = "BDT",
  locale = "en-BD",
  className,
  ...props
}: CurrencyDisplayProps) {
  // Whole amounts render with NO fraction digits (owner directive 2026-07-17: values must not carry a
  // trailing ".00"); genuinely fractional amounts keep 2 decimals so no precision is dropped.
  const fractionOpts = Number.isInteger(amount)
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : {};
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...fractionOpts,
    }).format(amount);
  } catch {
    // Unknown currency code → render the raw pair rather than throw (still no fabrication).
    formatted = `${currency} ${new Intl.NumberFormat(locale, fractionOpts).format(amount)}`;
  }
  return (
    <span data-type="amount" data-numeric className={cn("tabular-nums", className)} {...props}>
      {formatted}
    </span>
  );
}
