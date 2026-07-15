// Account & Identity navigation CONFIG (Doc-7E · IA §4) for the canonical Platform Shell. PRESENTATION
// nav structure only, in the shell's own types (NavSection / NavItem) with serializable icon KEYS
// resolved by NAV_ICONS. The authoritative navigable set is derived SERVER-SIDE from the resolved
// participation + org role, gated by entitlement/permission via WIRED CONTRACTS — never name-strings
// (Inv #10); hiding a link is convenience only (the server re-validates). Static default until wired.
//
// Destinations map to the Account & Identity pages (page_inventory §12 nav): Overview → P-ACC-01,
// Profile → P-ACC-02, Organization → P-ACC-04, Members → P-ACC-06, Roles → P-ACC-08, Delegation →
// P-ACC-11, Billing → P-ACC-16, Workflow → P-ACC-13. The bare `/account` buyer-profile page
// (P-ACC-14) carries NO nav item — it is reached via the user menu and the overview's "Edit profile"
// link, so no sidebar entry highlights there.
//
// DATA ONLY — this file owns the Account surface's nav sections and nothing else. The ShellViewModel
// that renders them (`accountShellVm`) lives in the co-mount seam
// (`app/(app)/_components/hybrid/hybrid-shell-vm.ts`), because since A7.4 (owner-RULED 2026-07-15)
// `/account/*` renders the SAME co-mounted nav as the workspaces, with Account simply folded open —
// composing that is the seam's job, not this model's. Same shape as `buyer-nav-model.ts`: nav data
// here, VM in the seam. Importing the seam from here would close an import cycle (the seam reads
// `ACCOUNT_NAV` below), so this file must stay free of shell-VM concerns.
import type { NavItem, NavSection } from "../../_components/shell";

export const ACCOUNT_NAV: NavSection[] = [
  {
    id: "account",
    items: [
      { label: "Overview", href: "/account/overview", icon: "account" },
      { label: "Profile", href: "/account/profile", icon: "settings" },
      { label: "Security", href: "/account/security", icon: "security" },
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
