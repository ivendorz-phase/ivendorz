// Rewards & referrals dashboard — P-ACC-22 (Doc-7E · T-DASHBOARD). SERVER COMPONENT (read-only).
// PRESENTATION-ONLY.
//
// FIELD DISCIPLINE (invent nothing):
//  • Balance maps to the frozen `get_reward_balance` → `{ balance : numeric }` (BC-BILL-6, Doc-4I
//    §HB-6.3). Rewards are POINTS (credit_reward = reward points), not a currency — no BDT is shown, and
//    the balance is a numeric entitlement (Invariant #10).
//  • Referrals map to `list_referrals` items — EXACTLY `{ referral_id, referred_organization_id, state }`
//    (§HB-6.3:1324). No date, no reward amount, and no organization display name are projected, so none
//    is coined: the referred org is shown as an OPAQUE ref and only the frozen `state` is displayed.
//  • Referral `state` is the frozen §HB-6.2 machine: pending → qualified → rewarded.
//  • Rewards/referrals are a loyalty program — they never affect procurement matching, routing, or
//    standing (the moat; Doc-4I H.9).
import { Gift, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip, type StatusTone } from "@/frontend/components/status-chip";
import { EmptyState } from "@/frontend/components/empty-state";

const BALANCE = 450;

type ReferralState = "pending" | "qualified" | "rewarded";

interface Referral {
  referralId: string;
  referredOrgRef: string; // referred_organization_id (opaque)
  state: ReferralState;
}

// Presentation seed (a wired build resolves these from list_referrals — opaque refs + frozen state only).
const REFERRALS: Referral[] = [
  {
    referralId: "ref_01",
    referredOrgRef: "0192f0c1-7c3d-7e21-e001-0000000000e1",
    state: "rewarded",
  },
  {
    referralId: "ref_02",
    referredOrgRef: "0192f0c1-7c3d-7e21-e002-0000000000e2",
    state: "qualified",
  },
  {
    referralId: "ref_03",
    referredOrgRef: "0192f0c1-7c3d-7e21-e003-0000000000e3",
    state: "pending",
  },
];

const STATE_META: Record<ReferralState, { label: string; tone: StatusTone }> = {
  pending: { label: "Pending", tone: "info" },
  qualified: { label: "Qualified", tone: "warning" },
  rewarded: { label: "Rewarded", tone: "success" },
};

export function RewardsDashboard() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Reward balance. */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-iv-brand-50 text-iv-brand-600">
            <Gift aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="text-3xl font-bold tabular-nums text-foreground">{BALANCE}</p>
            <p className="text-sm text-muted-foreground">reward points</p>
          </div>
        </CardContent>
      </Card>

      {/* Referrals. */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-base">
            Referrals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {REFERRALS.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<Gift aria-hidden="true" />}
                title="No referrals yet"
                description="Organizations you refer to iVendorz will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <caption className="sr-only">Referrals</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">
                      Referred organization
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REFERRALS.map((r) => (
                    <tr
                      key={r.referralId}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {r.referredOrgRef}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip
                          label={STATE_META[r.state].label}
                          tone={STATE_META[r.state].tone}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Referrals are shown by their organization reference — display names aren’t part of this
        list.
      </p>

      <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Reward points are a loyalty perk. They never affect RFQ matching, routing, or awards.</p>
      </div>
    </div>
  );
}
