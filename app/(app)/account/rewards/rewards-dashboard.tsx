// Growth Hub dashboard — the wired `/account/rewards` surface (Doc-7E_GrowthHub_Patch_v1.0.1
// §2(a) — the ER6 Rewards row extended; visual precursor = the P-ACC-22 presentation build, §4).
// SERVER COMPONENT: a pure function of the server-resolved DATA the page loads via
// `loadActiveOrgGrowthHub` (Doc-7C server-side data layer) — no fetching here, no client state.
//
// WIRED READS ONLY (VX-03 wired-read-or-placeholder; Doc-7E v1.0.1 §2(a)):
//  • `get_reward_balance` → `balance` (reward POINTS — an entitlement perk, never money/BDT).
//  • `list_referrals` → items `{ referralId, referredOrganizationId, state }`; the referred org is
//    an OPAQUE ref and `state` is the frozen `pending → qualified → rewarded` machine. The hero
//    counts are DERIVED from this list, so they can never disagree with the table; when the
//    bounded server walk was truncated, counts render as lower bounds ("N+") — never fabricated.
//
// FUNNEL HONESTY (§2(a) re-map): Sent (= invitation `issued`) · Accepted (= conversion `started`)
// · Registered (= conversion `registered`) have NO wired read (`Doc-5C v1.0.1` §6 seam) —
// **the tiles are NOT rendered** (`[ESC-7-API]`, §5; no placeholder figures, no fabricated
// counts). They mount only when the future additive Doc-4C+Doc-5C read pair lands. A single
// figure-free footnote discloses the deferral honestly.
//
// CTA (§B8 mandate): "Invite a business" — the create-invitation flow (`invite-business.tsx`
// client island), mounted ONLY for holders of `can_manage_growth_invites` (§3 — UX gating; the M1
// app layer enforces).
import { Info, Sparkles } from "lucide-react";
import type { ReferralItem } from "@/modules/billing/contracts";
import { InviteBusinessDialog } from "./invite-business";
import { ReferralHistory } from "./referral-history";

export interface RewardsDashboardData {
  /** `get_reward_balance` — reward POINTS (0 when the org has no account yet). */
  balance: number;
  /** `list_referrals` — the referrer org's referrals, newest first. */
  referrals: ReferralItem[];
  /** True iff more referrals exist beyond the server's bounded walk — counts are lower bounds. */
  referralsTruncated: boolean;
  /** Doc-7E v1.0.1 §3 — UX gating only for the CTA (the server enforces on the write path). */
  canManageGrowthInvites: boolean;
}

/** Hero stats — derived from the WIRED data only (no invented totals, no rank, no percentile).
 *  A truncated walk renders "N+" (a true lower bound), never a fabricated exact figure. */
function heroStats(data: RewardsDashboardData) {
  const suffix = data.referralsTruncated ? "+" : "";
  const count = (state: ReferralItem["state"]) =>
    data.referrals.filter((r) => r.state === state).length;
  return [
    { label: "Reward points", value: data.balance.toLocaleString("en-US"), accent: true },
    { label: "Total referrals", value: `${data.referrals.length}${suffix}` },
    { label: "Qualified", value: `${count("qualified")}${suffix}` },
    { label: "Rewarded", value: `${count("rewarded")}${suffix}` },
  ];
}

/**
 * Navy promo hero — a permanently-navy brand surface (the ratified navy palette; reads identically
 * in light/dark because it is always dark). Server-render-friendly: no hooks here — the CTA is the
 * client island, mounted only for §3 slug holders.
 */
function ReferralHero({ data }: { data: RewardsDashboardData }) {
  const stats = heroStats(data);
  return (
    <section className="overflow-hidden rounded-xl bg-gradient-to-br from-iv-navy-800 via-iv-navy-900 to-iv-navy-950 shadow-iv-md">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-0">
        {/* Left — the pitch + the §B8 CTA (slug-gated UX; the M1 app layer enforces). */}
        <div className="flex flex-col items-start lg:pr-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-widest text-iv-amber-400">
            <Sparkles aria-hidden className="size-3.5" />
            Network growth rewards
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
            Invite a business,
            <br />
            earn reward points
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Invite other businesses to iVendorz. When an organization you invite registers and
            reaches the qualification milestone, you earn reward points toward premium sourcing
            services.
          </p>
          {data.canManageGrowthInvites ? <InviteBusinessDialog /> : null}
        </div>

        {/* Right — 2×2 stat band over the WIRED reads, divided by hairlines. White on navy; the
            balance is the amber hero figure. */}
        <dl className="grid grid-cols-2 self-stretch lg:border-l lg:border-white/10">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={[
                "flex flex-col justify-center px-2 py-4 sm:px-6 sm:py-6",
                i % 2 === 1 ? "border-l border-white/10" : "",
                i >= 2 ? "border-t border-white/10" : "",
              ].join(" ")}
            >
              <dd
                className={[
                  "text-3xl font-bold tabular-nums sm:text-4xl",
                  s.accent ? "text-iv-amber-400" : "text-white",
                ].join(" ")}
              >
                {s.value}
              </dd>
              <dt className="mt-1 text-2xs font-semibold uppercase tracking-widest text-white/50">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function RewardsDashboard({ data }: { data: RewardsDashboardData }) {
  return (
    <div className="max-w-5xl space-y-6">
      <ReferralHero data={data} />

      <ReferralHistory referrals={data.referrals} />

      {/* True foot notes — the privacy fact (opaque refs), the honest funnel deferral
          ([ESC-7-API] — figure-free, tiles unmounted), and the moat fact (Doc-4I H.9). */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Referrals are shown by their organization reference — display names aren’t part of this
          list.
        </p>
        <p className="text-xs text-muted-foreground">
          Invitation stages (Sent · Accepted · Registered) aren’t shown yet — they’ll appear here
          once their data feed lands.
        </p>
        <div className="flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>
            Reward points are a loyalty perk. They never affect RFQ matching, routing, or awards.
          </p>
        </div>
      </div>
    </div>
  );
}
