// Vendor Workspace navigation IA — the typed, presentation-only nav model.
//
// Realizes (never redesigns) the Vendor Workspace information architecture from the approved
// planning companion (vendor_planning_and_design.md §2.2–§2.3), which itself realizes FROZEN
// Doc-7G GR1–GR12 over the Doc-7C app shell. Five functional groups: Dashboard · Company
// (Content) · Presentation · Procurement · Standing & Account. The Content-vs-Presentation split
// (DP5 / Invariant 9) is kept legible by group order and labelling.
//
// Mount target is the FROZEN Doc-7C `(app)` route group (GR1, "Mounts (app)"). Route-group names
// are URL-invisible, so hrefs are bare URL paths (/dashboard, /company, …); routes are wired in a
// later milestone, once the roadmap reaches Wave 3.
//
// NOTE [ESC-7G-A7] (BLOCKER, awaiting human Architecture Board): the design-introduced `(vendor)`
// nested route-group name and the Hybrid "mount-both" IA realization are NOT ratified. This model
// is therefore route-group-AGNOSTIC — it lists vendor sections only and encodes NO Hybrid
// co-mount / re-routing decision. Hybrid composition is deferred to integration once A7 is ruled.
//
// Presentation-only: owns no data and performs NO permission logic. Nav visibility is gated
// server-side by org participation + permission slugs in the integration phase (Doc-7C SR3/SR4;
// Invariant 10) — surfaces receive the already-resolved set as props. This module coins nothing.
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  FolderTree,
  Globe,
  Handshake,
  House,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export interface VendorNavItem {
  /** Stable id (React key + active-match token). */
  id: string;
  /** User-facing label (English; i18n-keyed in the integration phase — [ESC-7B-I18N-HEADLINE]). */
  label: string;
  /** Destination URL path within the `(app)` group. Routes are wired in a later milestone. */
  href: string;
  /** Lucide icon component (presentation only). */
  icon: LucideIcon;
}

export interface VendorNavGroup {
  /** Stable id (React key). */
  id: string;
  /** Group header label; omitted for the primary (Dashboard) group, which has no header. */
  label?: string;
  items: VendorNavItem[];
}

/**
 * The Vendor Workspace primary navigation (companion §2.2). Order and grouping are authoritative
 * from the approved planning; labels are user-facing realizations (no internal jargon).
 */
export const VENDOR_NAV: VendorNavGroup[] = [
  {
    id: "primary",
    items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    // COMPANY (Content) — matching-relevant, M2-owned (DP5 / Invariant 9).
    id: "company",
    label: "Company",
    items: [
      { id: "company", label: "Company Profile", href: "/company", icon: Building2 },
      { id: "products", label: "Products", href: "/company/products", icon: Package },
      { id: "categories", label: "Categories", href: "/company/categories", icon: FolderTree },
    ],
  },
  {
    // PRESENTATION — microsite/branding; presentation only, never affects matching (DP5).
    id: "presentation",
    label: "Presentation",
    items: [
      { id: "microsite", label: "Microsite & Branding", href: "/microsite", icon: Globe },
      { id: "ads", label: "Advertising", href: "/microsite/ads", icon: Megaphone },
    ],
  },
  {
    // PROCUREMENT (the moat) — RFQ/quotation, leads, post-award.
    id: "procurement",
    label: "Procurement",
    items: [
      { id: "rfqs", label: "RFQs & Quotations", href: "/rfqs", icon: FileText },
      { id: "leads", label: "Leads & Pipeline", href: "/leads", icon: ClipboardList },
      { id: "engagements", label: "Engagements", href: "/engagements", icon: Handshake },
    ],
  },
  {
    id: "standing",
    label: "Standing & Account",
    items: [
      { id: "trust", label: "Trust & Verification", href: "/trust", icon: ShieldCheck },
      { id: "billing", label: "Billing & Plan", href: "/billing", icon: CreditCard },
      { id: "organization", label: "Team & Organization", href: "/organization", icon: Users },
      { id: "settings", label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/**
 * Mobile quick-bar (companion §2.5): 4 thumb-reach destinations (Home/RFQs/Company/Trust).
 * "Home" maps to the Dashboard. These are a SUBSET of VENDOR_NAV, not new destinations.
 */
export const VENDOR_QUICKBAR: VendorNavItem[] = [
  { id: "home", label: "Home", href: "/dashboard", icon: House },
  { id: "rfqs", label: "RFQs", href: "/rfqs", icon: FileText },
  { id: "company", label: "Company", href: "/company", icon: Building2 },
  { id: "trust", label: "Trust", href: "/trust", icon: ShieldCheck },
];

/**
 * Resolve which nav href is active for a given pathname: the longest item href that equals the
 * pathname or is one of its path-segment prefixes. Returns null when nothing matches (e.g. before
 * any vendor route exists). Pure; presentation-only.
 */
export function resolveActiveHref(pathname: string | null, hrefs: string[]): string | null {
  if (!pathname) return null;
  let best: string | null = null;
  for (const href of hrefs) {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (best === null || href.length > best.length)) {
      best = href;
    }
  }
  return best;
}
