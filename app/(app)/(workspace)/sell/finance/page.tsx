// P-VND-27 Finance / payments — vendor (FE-VEN-08 tracked remainder · T-LISTING · J-SUP-07 ·
// screen_specifications §P-VND-27). PRESENTATION ONLY: a READ-ONLY view of money-related RECORDS —
// the platform NEVER holds, transfers, or settles funds (DF-6 / R8; copy must never imply
// settlement).
//
// TWO frozen record families, kept visually separate (they are SEPARATE aggregates — Doc-4F):
//  §1 Payment records RECEIVED (BC-OPS-2 `payment_records`, engagement children): buyer-recorded
//     off-platform payments on this vendor's engagements. There is NO frozen cross-engagement
//     payment list read — this section is a presentation COMPOSITION over the engagement-scoped
//     reads (the P-DOC-01 composition precedent), each row deep-linking its owning engagement.
//     The vendor VIEWS ONLY — confirm is the buyer's affordance; no action renders here.
//     `payment_records` carry NO human_ref (none is coined).
//  §2 Finance records (BC-OPS-5 `finance_records`, `ops.list_finance_records.v1`): org-internal
//     structured-text entries — `record_type enum<tax|ait|payment|expense>` (frozen four, Doc-2
//     §10.5), `period`, `amount`, `currency`, `note`. SIMPLE aggregate — no state machine, no
//     status. Create/update (`ops.create/update_finance_record.v1`) are BC-OPS-5 commands —
//     RENDERED BUT DISABLED. Both sections render their EMPTY state until the reads are wired
//     (owner directive 2026-07-17: no demo data).
//
// URL PARAM: `?type=` — allowlisted over the frozen four record types (anything else ⇒ All).
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Money, Ref, formatDate, type MoneyValue } from "@/frontend/components/format";
import { PageHeader } from "../../../_components/shell";
import { DashboardSection } from "../../../_components/vendor/dashboard/dashboard-section";
import { MoneyBoundaryBanner, PaymentStatusChip } from "../../../_components/vendor/engagements";
import type { PaymentRecordStatus } from "../../../_components/vendor/engagements";

export const metadata: Metadata = { title: "Finance" };

const BASE = "/sell/finance";

// Frozen `record_type` enum (Doc-2 §10.5) — the only four finance-record kinds.
const RECORD_TYPES = ["tax", "ait", "payment", "expense"] as const;
type RecordType = (typeof RECORD_TYPES)[number];
const RECORD_TYPE_LABEL: Record<RecordType, string> = {
  tax: "Tax",
  ait: "AIT",
  payment: "Payment",
  expense: "Expense",
};

interface ReceivedPaymentRow {
  id: string;
  engagementId: string;
  engagementRef: string;
  amount: MoneyValue;
  paidAt: string;
  methodNote?: string;
  status: PaymentRecordStatus;
}

// §1 rows — EMPTY until the engagement-scoped payment reads are wired (owner directive 2026-07-17:
// no demo data — a wired read or the empty state, never fabricated rows/amounts).
const RECEIVED_PAYMENTS: ReceivedPaymentRow[] = [];

interface FinanceRecordRow {
  id: string;
  recordType: RecordType;
  period: string;
  amount: MoneyValue;
  note?: string;
}

// §2 rows — EMPTY until `ops.list_finance_records.v1` (BC-OPS-5) is wired; same no-demo-data
// posture as §1.
const FINANCE_RECORDS: FinanceRecordRow[] = [];

export default async function VendorFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = RECORD_TYPES.includes(type as RecordType) ? (type as RecordType) : undefined;
  const records = activeType
    ? FINANCE_RECORDS.filter((r) => r.recordType === activeType)
    : FINANCE_RECORDS;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Money-related records for your organization — payments received on engagements and internal finance entries. Records only: the platform never holds or settles funds."
      />

      <MoneyBoundaryBanner />

      <DashboardSection
        title="Payments received"
        description="Off-platform payments the buyer recorded on your engagements. Confirmation is the buyer's action — this view is read-only."
      >
        {RECEIVED_PAYMENTS.length === 0 ? (
          <EmptyState title="No payment records." />
        ) : (
          <ul className="divide-y divide-border">
            {RECEIVED_PAYMENTS.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-2 py-3">
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/sell/engagements/${p.engagementId}`}
                    className="block truncate text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {p.engagementRef}
                  </Link>
                  {p.methodNote ? (
                    <span className="block text-xs text-muted-foreground">{p.methodNote}</span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(p.paidAt)}</span>
                <span className="text-sm font-medium text-foreground" data-numeric>
                  <Money value={p.amount} />
                </span>
                <PaymentStatusChip status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <DashboardSection
        title="Finance records"
        description="Internal structured entries — tax, AIT, payment, and expense notes for your own bookkeeping. No funds move on the platform."
        action={
          // Disabled — `ops.create_finance_record.v1` is a BC-OPS-5 command (unwired; presentation only).
          <Button size="sm" disabled>
            New record
          </Button>
        }
      >
        <div
          className="mb-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by record type"
        >
          <Button asChild size="sm" variant={!activeType ? "secondary" : "ghost"}>
            <Link href={BASE} aria-current={!activeType ? "page" : undefined}>
              All
            </Link>
          </Button>
          {RECORD_TYPES.map((rt) => (
            <Button key={rt} asChild size="sm" variant={activeType === rt ? "secondary" : "ghost"}>
              <Link
                href={`${BASE}?type=${rt}`}
                aria-current={activeType === rt ? "page" : undefined}
              >
                {RECORD_TYPE_LABEL[rt]}
              </Link>
            </Button>
          ))}
        </div>
        {records.length === 0 ? (
          <EmptyState
            title={
              activeType ? "No finance records match the current filter" : "No finance records yet"
            }
            action={
              activeType ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={BASE}>Clear filter</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {records.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-2 py-3">
                <span className="w-20 shrink-0 text-sm font-medium text-foreground">
                  {RECORD_TYPE_LABEL[r.recordType]}
                </span>
                <Ref>{r.period}</Ref>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {r.note ?? "—"}
                </span>
                <span className="text-sm font-medium text-foreground" data-numeric>
                  <Money value={r.amount} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}
