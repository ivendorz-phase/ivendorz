// Rewards / referrals route (`/account/rewards`) — P-ACC-22 (Doc-7E · T-DASHBOARD; page_inventory §13). A
// SERVER COMPONENT in the Doc-7C `(app)` route group; ROUTING + COMPOSITION ONLY. Mounted in the
// canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: shows the reward balance + referrals via the frozen reads `get_reward_balance` +
// `list_referrals` (BC-BILL-6, Doc-4I §HB-6.3) — reads; no mutation. The shell owns the `<main>`
// container + the page `<h1>` (PageHeader).
import { PageHeader } from "../../_components/shell/page-header";
import { RewardsDashboard } from "./rewards-dashboard";

export const metadata = {
  title: "Rewards & referrals — iVendorz",
};

export default function RewardsPage() {
  return (
    <>
      <PageHeader
        title="Rewards & referrals"
        description="Your reward points and the organizations you've referred."
      />
      <RewardsDashboard />
    </>
  );
}
