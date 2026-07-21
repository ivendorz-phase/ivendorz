// Rewards / referrals route (`/account/rewards`) — the Growth Hub surface (P-ACC-22 · Doc-7E ·
// Doc-7E_GrowthHub_Patch_v1.0.1 §2(a), the §B8 mandate). A SERVER COMPONENT in the Doc-7C `(app)`
// route group; ROUTING + COMPOSITION ONLY (REPOSITORY_STRUCTURE §8). Mounted in the canonical
// Platform Shell by the co-located layout.
//
// WIRED (Doc-7C server-side data layer): the page resolves the Growth Hub DATA via the server
// composition (`src/server/billing` — session → ensureProvisioned → withActiveOrg →
// `can_view_billing` → `get_reward_balance` + `list_referrals`, BC-BILL-6), NOT a client
// self-fetch. Org = the SERVER-VALIDATED active org (Invariant #5 — no client org id).
//
// BOUNDARY (REPOSITORY_STRUCTURE §9): imports `src/server/*` + module `contracts/` types +
// sibling `app/` presentation only — never a module internal.
import { ensureProvisioned, resolveSupabaseSession } from "@/server/auth";
import { loadActiveOrgGrowthHub } from "@/server/billing";
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

// Per-request server render (the reads depend on the session + server-resolved active-org context).
export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const outcome = await loadActiveOrgGrowthHub({
    resolveSession: resolveSupabaseSession,
    ensureProvisioned,
  });

  return (
    <>
      <PageHeader
        title="Referral"
        description="Your reward points and the organizations you've referred."
      />
      {!outcome.authenticated ? (
        <UnauthenticatedState />
      ) : outcome.access === "unavailable" ? (
        <UnavailableState />
      ) : (
        <RewardsDashboard
          data={{
            balance: outcome.balance,
            referrals: outcome.referrals,
            referralsTruncated: outcome.referralsTruncated,
            canManageGrowthInvites: outcome.canManageGrowthInvites,
          }}
        />
      )}
    </>
  );
}

/** No session — the `(auth)` login affordance (Doc-7C owns the auth boundary). */
function UnauthenticatedState() {
  return (
    <div className="max-w-5xl rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-base font-medium text-foreground">Sign in to view your referrals</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Your reward points and referral history are shown for your signed-in organization.
      </p>
      <p className="mt-4">
        <a
          href="/login"
          className="inline-block rounded-md bg-iv-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-iv-navy-800"
        >
          Go to sign in
        </a>
      </p>
    </div>
  );
}

/** No active-org context OR `can_view_billing` denied — COLLAPSED server-side to ONE state (the
 *  same collapse the HTTP faces make); rendered identically, no distinction leaked. */
function UnavailableState() {
  return (
    <div className="max-w-5xl rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-base font-medium text-foreground">Referral rewards aren’t available</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Viewing reward points and referrals requires billing view access in your active
        organization.
      </p>
    </div>
  );
}
