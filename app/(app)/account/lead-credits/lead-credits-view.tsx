"use client";

// Lead credits — P-ACC-19 (Doc-7E · T-LISTING). Client Component holding only ephemeral filter state
// (Doc-7C §2.3). PRESENTATION-ONLY: reads and mutates nothing.
//
// FIELD DISCIPLINE (invent nothing):
//  • Balance maps to the frozen `get_lead_balance`; rows map to `list_lead_transactions` (BC-BILL-4,
//    Doc-4I). The balance is a NUMERIC credit count (Invariant #10 — never a plan-name check). Shortfall
//    credits follow Doc-3 §6 (leads.credit_value / lead-guarantee shortfall).
//  • `credit_lead_account` is a gated command (admin / permitted by a wired read) — no buyer mutation
//    affordance is offered here.
//  • Lead packages are the platform's OWN revenue (M7) — the platform never handles buyer↔vendor money.
//  • Deltas carry an explicit +/- sign (never colour alone) and tabular numerals.
import { useMemo, useState } from "react";
import { Coins, Search } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";

const BALANCE = 320;

type TxType = "package_credit" | "shortfall_credit" | "lead_unlocked";

interface Tx {
  id: string;
  date: string;
  type: TxType;
  delta: number; // signed
  balance: number; // running balance after this transaction
}

// Presentation seed (a wired build resolves these from list_lead_transactions). Newest first.
const TRANSACTIONS: Tx[] = [
  { id: "t1", date: "15 Jul 2026", type: "lead_unlocked", delta: -2, balance: 320 },
  { id: "t2", date: "10 Jul 2026", type: "lead_unlocked", delta: -3, balance: 322 },
  { id: "t3", date: "05 Jul 2026", type: "shortfall_credit", delta: 5, balance: 325 },
  { id: "t4", date: "01 Jul 2026", type: "package_credit", delta: 300, balance: 320 },
  { id: "t5", date: "20 Jun 2026", type: "lead_unlocked", delta: -8, balance: 20 },
];

const TYPE_META: Record<TxType, { label: string; tone: StatusTone }> = {
  package_credit: { label: "Package credit", tone: "success" },
  shortfall_credit: { label: "Shortfall credit", tone: "info" },
  lead_unlocked: { label: "Lead unlocked", tone: "neutral" },
};

const TYPE_OPTIONS: Array<TxType | "all"> = [
  "all",
  "package_credit",
  "shortfall_credit",
  "lead_unlocked",
];

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LeadCreditsView() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TxType | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRANSACTIONS.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (
        q &&
        !TYPE_META[t.type].label.toLowerCase().includes(q) &&
        !t.date.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [query, type]);

  return (
    <div className="space-y-6">
      {/* Balance stat-card. */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-iv-brand-50 text-iv-brand-600">
            <Coins aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="text-3xl font-bold tabular-nums text-foreground">{BALANCE}</p>
            <p className="text-sm text-muted-foreground">lead credits available</p>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="pl-9"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="filter-type">
            Filter by type
          </label>
          <select
            id="filter-type"
            className={selectClass}
            value={type}
            onChange={(e) => setType(e.target.value as TxType | "all")}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All types" : TYPE_META[t].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Coins aria-hidden="true" />}
          title="No lead transactions"
          description="Credits you buy or use will appear here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <caption className="sr-only">Lead credit transactions</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Change
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{t.date}</td>
                    <td className="px-4 py-3">
                      <StatusChip label={TYPE_META[t.type].label} tone={TYPE_META[t.type].tone} />
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right tabular-nums font-medium",
                        t.delta >= 0 ? "text-iv-success-muted" : "text-foreground",
                      )}
                    >
                      {t.delta >= 0 ? `+${t.delta}` : t.delta}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {t.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PaginationControl hasMore={false} hasPrevious={false} />

      <p className="text-xs text-muted-foreground">
        Credits are added when you buy a lead package or receive a lead-guarantee shortfall credit.
        Lead packages are billed by iVendorz.
      </p>
    </div>
  );
}
