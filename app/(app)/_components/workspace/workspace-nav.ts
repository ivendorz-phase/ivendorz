// Workspace → ShellViewModel mapping (owner-directed refactor, 2026-07-18). `getWorkspaceVm(workspace)`
// is the ONE place navigation is generated from the active workspace — no per-workspace conditions
// scattered through the shell. Each workspace renders its OWN single-surface nav (the vendor/buyer nav
// models, every leaf a REAL existing route), with NO `surfaces`/`foldableSurfaces` → the shared Sidebar
// renders one workspace with no lens control and no co-mount fold (it already supports single-surface
// navs). Both workspaces stay REACHABLE via the top-right switcher, conformant with frozen Doc-7A R6
// §4.2 (see workspace-context.tsx).
//
// PRESENTATION FIXTURE ONLY: identity/participation are neutral placeholders (owner directive
// 2026-07-17: no demo data) until the Doc-7C context layer (SR3, get_active_context) is wired; no
// client-supplied org is trusted (Inv #5). `participation` drives the switcher variant (hybrid/vendor →
// both workspaces; buyer → buyer + a Become-a-Vendor upgrade), never authorization (R7 — server
// re-validates).
import {
  BUYER_NAV,
  BUYER_QUICK_BAR,
  BUYER_QUICK_CREATE,
} from "../../(workspace)/buy/_components/buyer-nav-model";
import { VENDOR_NAV, VENDOR_QUICK_BAR, VENDOR_QUICK_CREATE } from "../vendor/vendor-shell-vm";
import type { ShellIdentity, ShellViewModel } from "../shell";
import type { Workspace } from "./workspace-context";

/** Neutral identity — no fabricated person/org (VX-03). `participation: "hybrid"` is the structural
 *  flag that a vendor org may switch to either workspace; production resolves it server-side (SR3). */
const NEUTRAL_IDENTITY: ShellIdentity = {
  user: { name: "Your account", email: "" },
  activeOrg: { id: "active", name: "Active organization", participation: "hybrid" },
  organizations: [{ id: "active", name: "Active organization", participation: "hybrid" }],
};

/** The active workspace's nav sections — the owner's `getNavigation(workspace)`. */
export function getWorkspaceNav(workspace: Workspace) {
  return workspace === "seller" ? VENDOR_NAV : BUYER_NAV;
}

/** Build the single-workspace ShellViewModel for the active workspace. No `surfaces` ⇒ no lens
 *  control, no fold; the Sidebar renders exactly this workspace's nav. */
export function getWorkspaceVm(workspace: Workspace): ShellViewModel {
  if (workspace === "seller") {
    return {
      identity: NEUTRAL_IDENTITY,
      nav: VENDOR_NAV,
      quickCreate: VENDOR_QUICK_CREATE,
      quickBar: VENDOR_QUICK_BAR,
      search: { placeholder: "Search products, leads, inquiries…", href: "/sell/company/products" },
    };
  }
  return {
    identity: NEUTRAL_IDENTITY,
    nav: BUYER_NAV,
    quickCreate: BUYER_QUICK_CREATE,
    quickBar: BUYER_QUICK_BAR,
    search: { placeholder: "Search RFQs, vendors, products…", href: "/buy/discover" },
  };
}
