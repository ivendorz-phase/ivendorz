// Rewards & referrals dashboard — P-ACC-22 (Doc-7E · T-DASHBOARD). SERVER COMPONENT (read-only).
// PRESENTATION-ONLY.
//
// ── REFERENCE-DRIVEN LAYOUT (owner-supplied "Reward Center / Growth Hub" mockup, 2026-07-18) ──────────
// Rebuilt to the reference's composition — a navy promo hero (eyebrow · headline · sub · CTA · stat
// band) over a filterable referral-history card — under the repo standard for reference use
// (`docs/frontend/architecture/visual_reference_implementation.md` §2: "copy the composition; implement
// the platform") and the owner's standing ruling (match the visual hierarchy/spacing/proportions; do
// NOT invent data or metrics; where a reference widget is not backed by our domain model, substitute a
// semantically-equivalent, data-backed component of the same footprint — "keep the footprint, drop the
// fabricated payload"). The owner's directive here was explicit: keep only legitimate ITEMS; the layout
// is free to change. Divergences from the mockup are enumerated below; the row model's divergences live
// in `referral-history.tsx`.
//
// FIELD DISCIPLINE (invent nothing) — the two frozen reads this surface is allowed (BC-BILL-6, Doc-4I
// §HB-6.3) are the ONLY sources:
//  • `get_reward_balance` → `{ balance : numeric }`. Rewards are POINTS (an entitlement, Inv #10), not a
//    currency — no BDT, and the mockup's "Sourcing Credits / 4,000 Credits Earned / 500 PTS" wording is
//    normalized to "reward points".
//  • `list_referrals` → items EXACTLY `{ referral_id, referred_organization_id, state }` (§HB-6.3:1324);
//    the referred org is an OPAQUE ref and `state` is the frozen §HB-6.2 machine (pending → qualified →
//    rewarded). No display name, per-referral reward, or date is projected, so none is shown.
//  • Rewards/referrals are a loyalty program — they NEVER affect procurement matching, routing, or
//    standing (the moat; Doc-4I H.9).
//
// MOCKUP WIDGETS THAT ARE NOT REPRODUCED, AND WHY:
//  1. "Top 5% · Network Rank" — a percentile/ranking with NO backing read anywhere; a fabricated
//     traction claim. DROPPED (no substitute — a rank is a concept, not a fixture value for a real
//     field). The 4th hero stat is instead a true state-count ("Qualified").
//  2. "12 Total Referrals / 08 Verified Accounts" — the mockup's counts contradict its own 3 rows. The
//     hero stats are DERIVED from the actual list (total = list length; Qualified/Rewarded = state
//     counts), so they can never disagree with the table. "Verified" is not a referral state → the
//     terminal-state tile is labelled by the frozen state, "Rewarded".
//  3. "IVZ-BUY-DHAKA-2026" referral code + COPY — there is NO referral-code field or read in the corpus;
//     a referral is org→org, keyed on `referred_organization_id` (§HB-6.2), not a shareable code. The
//     code chip is DROPPED rather than fabricated.
//  4. "INVITE NOW" → the hero CTA maps to the REAL frozen capability `track_referral` ("org self-
//     initiates a referral", §HB-6.2) and is labelled for it ("Refer an organization"). It is an
//     affordance only — this surface stays read-only (no mutation is wired here), exactly as the page
//     charter states; it fabricates nothing.
//  5. "Credit processing may take up to 48 hours after … level 2 business verification" — a specific
//     SLA + a coined verification tier, both `[ESC-BILL-POLICY]` territory we do not know. DROPPED in
//     favour of the true moat/privacy notes retained at the foot.
import { Info, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { ReferralHistory, type Referral } from "./referral-history";

// Presentation seed — a wired build resolves BALANCE from `get_reward_balance` and REFERRALS from
// `list_referrals` (opaque refs + frozen state only). BALANCE is an independent seed, NOT derived from a
// per-referral rate (that rate is unknown to us — a `[ESC-BILL-POLICY]` key), so nothing implies "N
// rewarded × X points".
const BALANCE = 900;

const REFERRALS: Referral[] = [
  {
    referralId: "ref_01",
    referredOrgRef: "0192f0c1-7c3d-7e21-e001-0000000000e1",
    state: "rewarded",
  },
  {
    referralId: "ref_02",
    referredOrgRef: "0192f0c1-7c3d-7e21-e002-0000000000e2",
    state: "rewarded",
  },
  {
    referralId: "ref_03",
    referredOrgRef: "0192f0c1-7c3d-7e21-e003-0000000000e3",
    state: "qualified",
  },
  {
    referralId: "ref_04",
    referredOrgRef: "0192f0c1-7c3d-7e21-e004-0000000000e4",
    state: "pending",
  },
  {
    referralId: "ref_05",
    referredOrgRef: "0192f0c1-7c3d-7e21-e005-0000000000e5",
    state: "pending",
  },
];

// Hero stats — presentation figures over the seed above (a wired build reads BALANCE from
// get_reward_balance and the counts from the rendered referral list). No invented totals, no rank, no
// percentile (see this file's header, items 1–2); the hero is labelled "sample" below so the figures
// are never mistaken for a live balance.
function heroStats() {
  const total = REFERRALS.length;
  const qualified = REFERRALS.filter((r) => r.state === "qualified").length;
  const rewarded = REFERRALS.filter((r) => r.state === "rewarded").length;
  return [
    { label: "Reward points", value: BALANCE.toLocaleString("en-US"), accent: true },
    { label: "Total referrals", value: String(total) },
    { label: "Qualified", value: String(qualified) },
    { label: "Rewarded", value: String(rewarded) },
  ];
}

/**
 * Navy promo hero — the mockup's "Reward Center" band. A permanently-navy brand surface (the ratified
 * navy palette; it reads identically in light/dark because it is always dark, like `AuthBrandAside`).
 * Server-render-friendly: no hooks, no clipboard (the code chip is dropped), the CTA is a plain Button.
 */
function ReferralHero() {
  const stats = heroStats();
  return (
    <section className="overflow-hidden rounded-xl bg-gradient-to-br from-iv-navy-800 via-iv-navy-900 to-iv-navy-950 shadow-iv-md">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-0">
        {/* Left — the pitch + the one real affordance. */}
        <div className="flex flex-col items-start lg:pr-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold uppercase tracking-widest text-iv-amber-400">
            <Sparkles aria-hidden className="size-3.5" />
            Network growth rewards
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
            Refer a colleague,
            <br />
            earn reward points
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Invite other procurement teams to iVendorz. When an organization you refer completes
            verification, you earn reward points toward premium sourcing services.
          </p>
          <Button variant="amber" size="lg" className="mt-6 gap-2">
            <UserPlus aria-hidden />
            Refer an organization
          </Button>
          <p className="mt-4 text-2xs text-white/40">
            Sample data — your live balance and referrals appear here once the read path is wired.
          </p>
        </div>

        {/* Right — 2×2 stat band, divided by hairlines like the mockup. White on navy; the balance is
            the amber hero figure. `lg:border-l` sets it off from the pitch column on wide screens. */}
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

export function RewardsDashboard() {
  return (
    <div className="max-w-5xl space-y-6">
      <ReferralHero />

      <ReferralHistory referrals={REFERRALS} />

      {/* True foot notes — the privacy fact (opaque refs) and the moat fact (H.9). These replace the
          mockup's fabricated 48h/"level 2 verification" SLA. */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Referrals are shown by their organization reference — display names aren’t part of this
          list.
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
