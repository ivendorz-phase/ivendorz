// Account & Identity navigation CONFIG (Doc-7E · IA §4) for the canonical Platform Shell. PRESENTATION
// nav structure only, in the shell's own types (NavSection / NavItem) with serializable icon KEYS
// resolved by NAV_ICONS. The authoritative navigable set is derived SERVER-SIDE from the resolved
// participation + org role, gated by entitlement/permission via WIRED CONTRACTS — never name-strings
// (Inv #10); hiding a link is convenience only (the server re-validates). Static default until wired.
//
// Destinations map to the Account & Identity pages (page_inventory §12 nav): Overview → P-ACC-01,
// Organization → P-ACC-04, Members → P-ACC-06, Roles → P-ACC-08, Delegation → P-ACC-11, Billing →
// P-ACC-16, Workflow → P-ACC-13. Those sub-pages are not built yet (they 404 until they land —
// overview-first, the accepted "dashboard-first sub-routes" pattern); "Profile" → the existing /account.
import type { NavItem, NavSection } from "../../_components/shell";

export const ACCOUNT_NAV: NavSection[] = [
  {
    id: "account",
    items: [
      { label: "Overview", href: "/account/overview", icon: "account" },
      { label: "Profile", href: "/account/profile", icon: "settings" },
    ],
  },
  {
    id: "organization",
    label: "Organization",
    items: [
      { label: "Organization", href: "/account/organization", icon: "company" },
      { label: "Members", href: "/account/members", icon: "members" },
      { label: "Roles", href: "/account/roles", icon: "roles" },
      { label: "Delegation", href: "/account/delegation", icon: "delegation" },
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    items: [{ label: "Plans & billing", href: "/account/billing", icon: "billing" }],
  },
  {
    id: "settings",
    label: "Settings",
    items: [{ label: "Workflow", href: "/account/settings", icon: "settings" }],
  },
];

/** Mobile quick-bar — a thumb-reach SUBSET of the Account nav. */
export const ACCOUNT_QUICK_BAR: NavItem[] = [
  { label: "Overview", href: "/account/overview", icon: "account" },
  { label: "Organization", href: "/account/organization", icon: "company" },
  { label: "Members", href: "/account/members", icon: "members" },
  { label: "Billing", href: "/account/billing", icon: "billing" },
];
