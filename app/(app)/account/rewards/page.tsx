// Rewards / referrals route (`/account/rewards`) — P-ACC-22 (Doc-7E · T-DASHBOARD; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: shows the reward balance + referrals via the frozen reads `get_reward_balance` +
// `list_referrals` (BC-BILL-6, Doc-4I §HB-6.3) — reads; no mutation. The shell owns the `<main>`
// container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { RewardsDashboard } from "./rewards-dashboard";

// LABEL SSoT: the destination is "Referral" everywhere a user can see it — sidebar leaf
// (`account-nav-model.ts`), breadcrumb leaf (`layout.tsx`), `<title>`, and this `<h1>`. The owner
// ruled the destination's name on 2026-07-17; the page follows the nav, not the reverse. P-ACC-22's
// inventory NAME stays "Rewards / referrals" in `page_inventory.md` §4/§13.4 — a document-internal
// handle ("Page IDs (`P-*`) and routes are document-internal handles", §0), never rendered.
export const metadata = {
  title: "Referral — iVendorz",
};

export default function RewardsPage() {
  return (
    <>
      <PageHeader
        title="Referral"
        description="Your reward points and the organizations you've referred."
      />
      <RewardsDashboard />
    </>
  );
}
