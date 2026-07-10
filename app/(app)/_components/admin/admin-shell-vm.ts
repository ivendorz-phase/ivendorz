// Admin Console — the ShellViewModel for the canonical Platform Shell (Doc-7H IA · one shell, multiple
// workspaces). PRESENTATION nav structure only (the shell's own NavSection / NavItem with serializable icon
// KEYS resolved by the shell NAV_ICONS registry). The authoritative navigable set is derived SERVER-SIDE from
// the platform-staff role (Inv #2 "staff") + entitlement; this static config is the presentation default until
// that gating is wired. Admin has NO active organization (Doc-7H) — `identity` here is a NEUTRAL platform-staff
// placeholder, never a tenant org (Inv #5). Every item points at an Admin console route; the OWNING module owns
// each effect (R5) — the dashboard itself invokes nothing. Reuses only existing NAV_ICONS keys (no shell edit).
import type { NavItem, NavSection, QuickCreateItem, ShellViewModel } from "../shell";

// Admin console mount segment (Doc-7H · no active-org, no `/dashboard` collision with the buyer group). Kept
// as a plain neutral segment — the disposable-prefix precedent set by the Vendor Workspace (`/workspace`).
const BASE = "/admin";

/** Admin primary navigation (Doc-7H · page_inventory §8): the 29-page console grouped for the sidebar. */
export const ADMIN_NAV: NavSection[] = [
  { id: "overview", items: [{ label: "Dashboard", href: BASE, icon: "dashboard" }] },
  {
    id: "moderation",
    label: "Moderation",
    items: [
      { label: "Moderation queue", href: `${BASE}/moderation`, icon: "approvals" },
      { label: "RFQ moderation", href: `${BASE}/rfq-moderation`, icon: "rfqs" },
    ],
  },
  {
    id: "trust",
    label: "Trust & approval",
    items: [
      { label: "Vendor approval", href: `${BASE}/vendor-approval`, icon: "vendors" },
      { label: "Verification", href: `${BASE}/verification`, icon: "trust" },
      { label: "Bans", href: `${BASE}/bans`, icon: "org" },
    ],
  },
  {
    id: "catalog",
    label: "Catalog & ads",
    items: [
      { label: "Categories", href: `${BASE}/categories`, icon: "categories" },
      { label: "Ad review", href: `${BASE}/ads`, icon: "advertising" },
    ],
  },
  {
    id: "engine",
    label: "Engine",
    items: [
      { label: "Routing rules", href: `${BASE}/routing`, icon: "pipeline" },
      { label: "Matching results", href: `${BASE}/matching`, icon: "rfqs" },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [
      { label: "Import jobs", href: `${BASE}/imports`, icon: "orders" },
      { label: "Outreach", href: `${BASE}/outreach`, icon: "leads" },
    ],
  },
  {
    id: "commerce",
    label: "Commerce & identity",
    items: [
      { label: "Plans", href: `${BASE}/plans`, icon: "billing" },
      { label: "Entitlements", href: `${BASE}/entitlements`, icon: "settings" },
      { label: "Organizations", href: `${BASE}/identity/orgs`, icon: "org" },
      { label: "Users", href: `${BASE}/identity/users`, icon: "team" },
    ],
  },
];

/** Admin `+ Create` actions — each maps to a wired Admin command when wired (owning module owns the effect). */
export const ADMIN_QUICK_CREATE: QuickCreateItem[] = [
  { label: "New category", href: `${BASE}/categories`, icon: "categories" },
  { label: "New import job", href: `${BASE}/imports`, icon: "orders" },
];

/** Mobile quick-bar — a thumb-reach SUBSET (admin is desktop-first, page_inventory §13.7; parity only). */
export const ADMIN_QUICK_BAR: NavItem[] = [
  { label: "Home", href: BASE, icon: "dashboard" },
  { label: "Moderation", href: `${BASE}/moderation`, icon: "approvals" },
  { label: "Approval", href: `${BASE}/vendor-approval`, icon: "vendors" },
  { label: "Verify", href: `${BASE}/verification`, icon: "trust" },
];

export const ADMIN_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: "Platform staff", email: "" },
    activeOrg: { id: "platform", name: "Platform Administration", participation: "staff" },
    organizations: [{ id: "platform", name: "Platform Administration", participation: "staff" }],
  },
  nav: ADMIN_NAV,
  quickCreate: ADMIN_QUICK_CREATE,
  quickBar: ADMIN_QUICK_BAR,
};
