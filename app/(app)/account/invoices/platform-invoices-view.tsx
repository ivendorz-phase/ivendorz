"use client";

// Platform invoices — P-ACC-20 (Doc-7E · T-LISTING). Client Component holding only ephemeral filter
// state (Doc-7C §2.3). PRESENTATION-ONLY: reads and mutates nothing.
//
// FIELD DISCIPLINE (invent nothing) — corrected per RV-0076:
//  • Rows map to the frozen `list_platform_invoices` projection (BC-BILL-5, Doc-4I §HB-5.4):
//    `{ invoice_id, human_ref, purpose, amount, currency, status }`. The displayed REFERENCE is the
//    projected `human_ref` (`INV-P-…`, Doc-2:831) — a display label, mono; the opaque `invoice_id` keys
//    the detail route only. (Earlier build wrongly hid human_ref behind the opaque id — human_ref IS
//    projected.)
//  • `purpose` is the frozen enum <subscription | lead_package | advertising | microsite | service>
//    (Doc-2 §10.8). There is NO date field in the list projection — none is fabricated.
//  • Amounts show the invoice's own currency (multi-currency-ready; BDT here), tabular.
//  • These are PLATFORM-FEE invoices (iVendorz billing the org) — NOT trade invoices between buyer and
//    vendor (`platform_invoices ≠ operations.trade_invoices`, Doc-4I FIXED; R8/DF-6). No escrow, wallet,
//    or settlement.
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, Search } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Input } from "@/frontend/primitives/input";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import { PaginationControl } from "@/frontend/components/pagination-control";

type InvoiceStatus = "paid" | "issued" | "overdue" | "void";
type Purpose = "subscription" | "lead_package" | "advertising" | "microsite" | "service";

interface Invoice {
  invoiceId: string; // opaque platform_invoice_id (route key only)
  humanRef: string; // projected human_ref (INV-P-…) — the display reference
  purpose: Purpose;
  amount: number;
  currency: string;
  status: InvoiceStatus;
}

// Presentation seed (a wired build resolves these from list_platform_invoices).
const INVOICES: Invoice[] = [
  {
    invoiceId: "0192f0b1-7c3d-7e21-d001-0000000000d1",
    humanRef: "INV-P-2026-000042",
    purpose: "subscription",
    amount: 8000,
    currency: "BDT",
    status: "paid",
  },
  {
    invoiceId: "0192f0b1-7c3d-7e21-d002-0000000000d2",
    humanRef: "INV-P-2026-000051",
    purpose: "advertising",
    amount: 2500,
    currency: "BDT",
    status: "issued",
  },
  {
    invoiceId: "0192f0b1-7c3d-7e21-d003-0000000000d3",
    humanRef: "INV-P-2026-000038",
    purpose: "lead_package",
    amount: 3000,
    currency: "BDT",
    status: "paid",
  },
  {
    invoiceId: "0192f0b1-7c3d-7e21-d004-0000000000d4",
    humanRef: "INV-P-2026-000029",
    purpose: "subscription",
    amount: 8000,
    currency: "BDT",
    status: "paid",
  },
  {
    invoiceId: "0192f0b1-7c3d-7e21-d005-0000000000d5",
    humanRef: "INV-P-2026-000020",
    purpose: "subscription",
    amount: 8000,
    currency: "BDT",
    status: "overdue",
  },
];

const STATUS_META: Record<InvoiceStatus, { label: string; tone: StatusTone }> = {
  paid: { label: "Paid", tone: "success" },
  issued: { label: "Issued", tone: "info" },
  overdue: { label: "Overdue", tone: "warning" },
  void: { label: "Void", tone: "neutral" },
};

// Display labels for the frozen `purpose` enum (Doc-2 §10.8) — labels only, values are the frozen enum.
const PURPOSE_LABEL: Record<Purpose, string> = {
  subscription: "Subscription",
  lead_package: "Lead package",
  advertising: "Advertising",
  microsite: "Microsite",
  service: "Service",
};

const STATUS_OPTIONS: Array<InvoiceStatus | "all"> = ["all", "paid", "issued", "overdue", "void"];

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formatAmount(n: number): string {
  return n.toLocaleString("en-US");
}

export function PlatformInvoicesView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INVOICES.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (
        q &&
        !inv.humanRef.toLowerCase().includes(q) &&
        !PURPOSE_LABEL[inv.purpose].toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [query, status]);

  return (
    <div className="space-y-4">
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
            placeholder="Search invoices"
            aria-label="Search invoices"
            className="pl-9"
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="filter-status">
            Filter by status
          </label>
          <select
            id="filter-status"
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | "all")}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText aria-hidden="true" />}
          title="No invoices"
          description="Your iVendorz platform invoices will appear here."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-sm">
              <caption className="sr-only">Platform invoices</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Purpose
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.invoiceId}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs text-foreground">{inv.humanRef}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {PURPOSE_LABEL[inv.purpose]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground">
                      {inv.currency} {formatAmount(inv.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip
                        label={STATUS_META[inv.status].label}
                        tone={STATUS_META[inv.status].tone}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/account/invoices/${inv.invoiceId}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Open
                        <ChevronRight aria-hidden="true" className="size-4" />
                      </Link>
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
        These are iVendorz platform invoices (plan, lead packages, and ads). They aren’t trade
        invoices between you and vendors.
      </p>
    </div>
  );
}
