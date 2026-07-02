// Account overview route (`/account/overview`) — P-ACC-01 (Doc-7E · T-DASHBOARD; page_inventory §13.4).
// A Next.js SERVER COMPONENT in the Doc-7C `(app)` route group; `app/` does ROUTING + COMPOSITION ONLY
// (REPOSITORY_STRUCTURE §8). Mounted inside the canonical Platform Shell by the co-located layout.
//
// PRESENTATION ONLY: reads-only at-a-glance account hub. It binds NO contract and calls NO auth/data
// stack — the identity/usage shown are presentation seed (a wired build resolves them server-side via
// get_active_context + M7 entitlement reads). The shell owns the `<main>` container + the page `<h1>`
// via PageHeader; this page renders only the header + content, never its own max-width wrapper.
import { PageHeader } from "../../_components/shell/page-header";
import { AccountOverviewView } from "./account-overview-view";

export const metadata = {
  title: "Account overview — iVendorz",
};

export default function AccountOverviewPage() {
  return (
    <>
      <PageHeader
        title="Account overview"
        description="Your account, organization, and settings at a glance."
      />
      <AccountOverviewView />
    </>
  );
}
