"use client";

// Referral history — the reference's "Referral History" card, implemented against our domain model
// (P-ACC-22 · Doc-7E · frozen `billing.list_referrals` BC-BILL-6, Doc-4I §HB-6.3).
//
// This is the ONE Client Component on the Referral surface, and only because the reference's
// PENDING/VERIFIED segmented control is a real, useful affordance: a client-side filter over the
// FROZEN referral state machine. It reuses the Doc-7B kit `Tabs` primitive for the segmented control
// (never a hand-rolled one — re-implementing a kit primitive is a duplication finding) and holds only
// ephemeral filter state; it fetches nothing and mutates nothing (Content ≠ Presentation, Inv #9).
//
// FIELD DISCIPLINE — the reference's row model is stripped to what `list_referrals` actually projects
// (`{ referral_id, referred_organization_id, state }`, §HB-6.3:1324). Every fabricated column is gone:
//  • "Professional Invited" (a person's name)  — NOT projected. Dropped.
//  • "Company Entity" (an org display NAME)     — NOT projected; only the OPAQUE org ref is. The
//     referred org is shown as its `referred_organization_id`, never a coined trade name.
//  • "Credits Issued · 500 PTS" (per-referral)  — NOT projected; the reward is a SEPARATE `credit_reward`
//     movement (§HB-6.1) whose value is a `[ESC-BILL-POLICY]` key, not a field on this row. Dropped.
//  • "2 DAYS AGO" (a relative date)             — NOT projected. Dropped.
//  • "FOLLOW UP" (a row action)                 — no backing contract. Dropped.
//  • The PENDING/VERIFIED toggle                — "verified" is not a referral state. The filter is keyed
//     on the FROZEN machine instead: pending → qualified → rewarded (§HB-6.2). No state is coined.
import * as React from "react";
import { Gift } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";

// The frozen §HB-6.2 machine — the only referral states there are.
export type ReferralState = "pending" | "qualified" | "rewarded";

export interface Referral {
  referralId: string;
  referredOrgRef: string; // referred_organization_id (opaque)
  state: ReferralState;
}

// state → presentation label + tone. The surface derives the label from the contract state; the chip
// invents none (Doc-7B BR3).
export const STATE_META: Record<ReferralState, { label: string; tone: StatusTone }> = {
  pending: { label: "Pending", tone: "info" },
  qualified: { label: "Qualified", tone: "warning" },
  rewarded: { label: "Rewarded", tone: "success" },
};

// Filter is "all" or one frozen state — ordered to follow the state machine's own progression.
type Filter = "all" | ReferralState;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "qualified", label: "Qualified" },
  { value: "rewarded", label: "Rewarded" },
];

export function ReferralHistory({ referrals }: { referrals: Referral[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const rows = filter === "all" ? referrals : referrals.filter((r) => r.state === filter);

  return (
    <div className="rounded-xl border border-border bg-card shadow-iv-xs">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Referral history</h2>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {rows.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<Gift aria-hidden="true" />}
            title={filter === "all" ? "No referrals yet" : `No ${filter} referrals`}
            description={
              filter === "all"
                ? "Organizations you refer to iVendorz will appear here."
                : "No referrals are at this stage right now."
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <caption className="sr-only">Referral history</caption>
            <thead>
              <tr className="border-b border-border text-left text-2xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">
                  Referred organization
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.referralId}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-5 py-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.referredOrgRef}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusChip label={STATE_META[r.state].label} tone={STATE_META[r.state].tone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
