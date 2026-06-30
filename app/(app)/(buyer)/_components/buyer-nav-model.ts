// Buyer Workspace — the role-scoped "Procurement" sidebar NAVIGATION MODEL (Doc-7F §4.1 / Doc-7C shell).
//
// This is PRESENTATION nav structure only. The authoritative navigable set is derived SERVER-SIDE from
// the resolved participation (Buyer/Hybrid) + org role, gated by entitlement/permission read via WIRED
// CONTRACTS — never name-strings (Inv #10). Hiding a link is convenience only; the server re-validates
// every action (Inv #7). This static model is the presentation default the shell renders until that
// server-derived gating is wired (GI-02; PARKED today).
//
// Route segments are illustrative routing vocabulary (Doc-7F §3.1 note); the authoritative topology is
// Doc-7C/Doc-7F and routes carry OPAQUE UUIDs. Items beyond `/dashboard` target later-milestone pages
// (P-BUY-02…27) not yet built — they resolve once their milestone lands (cf. the public shell precedent).
//
// LOAD-BEARING ABSENCE: there is NO "invite / dispatch vendor" item anywhere — the engine dispatches
// invitations; the buyer never does (R6; Pass-2 §4.2; carried `[ESC-7-7F-INVITE]`, §0.3). The CRM item is
// navigation into the buyer-private CRM section only; no CRM status/flag is represented here (Inv #11).

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Search,
  Star,
  FileText,
  CheckSquare,
  Briefcase,
  Users,
} from "lucide-react";

export interface BuyerNavItem {
  /** Display label (the Master Navigation Matrix label, Doc-7F §4.1). */
  label: string;
  /** Intended route (opaque-id topology; illustrative segment). */
  href: string;
  icon: LucideIcon;
  /** The P-BUY screen this item opens (documentation pointer; not rendered). */
  screen: string;
}

export interface BuyerNavGroup {
  /** Sidebar group heading (Doc-7F §4.1 sidebar groups). */
  heading: string;
  items: BuyerNavItem[];
}

/**
 * The Buyer left-nav, grouped exactly per Doc-7F §4.1:
 * Overview · Sourcing · RFQs · Operations · Private →
 * Dashboard · Discover · Favorites · RFQs · Approvals · Engagements · Vendor CRM.
 */
export const BUYER_NAV_GROUPS: readonly BuyerNavGroup[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, screen: "P-BUY-01" }],
  },
  {
    heading: "Sourcing",
    items: [
      { label: "Discover", href: "/discover", icon: Search, screen: "P-BUY-02" },
      { label: "Favorites", href: "/favorites", icon: Star, screen: "P-BUY-05" },
    ],
  },
  {
    heading: "RFQs",
    items: [
      { label: "RFQs", href: "/rfqs", icon: FileText, screen: "P-BUY-06" },
      { label: "Approvals", href: "/approvals", icon: CheckSquare, screen: "P-BUY-12" },
    ],
  },
  {
    heading: "Operations",
    items: [{ label: "Engagements", href: "/engagements", icon: Briefcase, screen: "P-BUY-19" }],
  },
  {
    heading: "Private",
    items: [{ label: "Vendor CRM", href: "/crm", icon: Users, screen: "P-BUY-26" }],
  },
] as const;
