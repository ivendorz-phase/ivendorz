"use client";

// Referral history — the Growth Hub "Referral history" card, wired to the frozen
// `billing.list_referrals` read (BC-BILL-6, Doc-4I §HB-6.3; Doc-7E_GrowthHub_Patch_v1.0.1 §1).
//
// This is a CLIENT component only for the segmented filter: a client-side filter over the FROZEN
// referral state machine (`pending → qualified → rewarded`). It reuses the Doc-7B kit `Tabs`
// primitive for the segmented control (never a hand-rolled one) and holds only ephemeral filter
// state; it fetches nothing and mutates nothing (Content ≠ Presentation, Inv #9). The rows are the
// WIRED `ReferralItem` DTOs the server page resolved — consumed by contract type, never re-shaped.
//
// FIELD DISCIPLINE — exactly what `list_referrals` projects: `{ referralId,
// referredOrganizationId, state }`. The referred org is an OPAQUE ref (never a display name —
// Doc-7E v1.0.1 §3 non-disclosure); a `null` ref (a referral whose referred org is not yet
// resolved) renders an explicit em-dash, never an invented placeholder id. No per-referral reward,
// no dates, no row actions — none are projected.
import * as React from "react";
import { Gift } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/primitives/tabs";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";
import type { ReferralItem, ReferralState } from "@/modules/billing/contracts";

// state → presentation label + tone. The surface derives the label from the contract state; the
// chip invents none (Doc-7B BR3).
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

export function ReferralHistory({ referrals }: { referrals: ReferralItem[] }) {
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
                    {r.referredOrganizationId !== null ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.referredOrganizationId}
                      </span>
                    ) : (
                      <span
                        aria-label="Referred organization not yet linked"
                        className="text-xs text-muted-foreground/70"
                      >
                        —
                      </span>
                    )}
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
