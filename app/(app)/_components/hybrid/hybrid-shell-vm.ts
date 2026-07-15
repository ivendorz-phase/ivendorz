// Hybrid Workspace — DEMO seam + ShellViewModel for the canonical Platform Shell ([ESC-7G-A7]
// realization of Doc-7A R6 / Doc-7C SR3 "Hybrid mounts both"). A Hybrid org (buys AND sells) sees ONE
// sidebar co-mounting BOTH surface sets, grouped-not-merged (Invariant #2) — never a toggle, never a
// cross-route swap (the re-routing toggle was rejected: `vendor_planning_and_design.md:97`).
//
// SEAM ROLE (this file stands in for the SR3 Identity/context layer, which is PARKED): it resolves
// participation → the surface groups to mount, and applies the co-mount TAGGING/ORDERING/Trust-
// isolation. The generic shell then only concatenates+renders via `composeNav` (app/(app)/_components/
// shell/hybrid-nav.ts) — the shell never derives or interprets participation.
//
// PRESENTATION FIXTURE ONLY. Production participation + the navigable surface set come from Identity
// Context (SR3 — `get_active_context`, participation + role + entitlement; Inv #5/#10), never hardcoded.
// No client-supplied org is trusted (Inv #5).
//
// CO-MOUNT IA — A7.4 RESOLVED (owner-RULED 2026-07-15). The co-mount shows the two ROLE workspaces
// (Buying, Selling) + the ACCOUNT surface + the terminal read-only Trust group.
//
// The A7 packet expressly RESERVED this: "A7.4 — Surface-specific vs shared groups… Which are
// surface-specific vs shared (mount once / live in Account Surface E)? … **Board to confirm the
// split**", and this file's earlier note recorded the un-confirmed recommendation ("this fixture picks
// a sensible split") — cross-cutting ORG-LEVEL concerns reached via the user menu, not the sidebar.
// The owner has now confirmed a DIFFERENT split: Account is a co-mounted, foldable block in the SAME
// sidebar, so one surface is open and the rest are folded to a one-click header — every dashboard
// alike. The user menu keeps its `/account` link; this only stops that click from swapping the whole
// sidebar out for a different one.
//
// This stays inside the ruled A7R envelope rather than reopening it:
//  • SD-1/SD-5 — Account never removes Buying/Selling from `nav`; they fold to a one-click header.
//    Nothing is partitioned, so frozen Doc-7A §4.2 ("does not partition users into mutually exclusive
//    apps") is untouched — and note §4.2 is scoped to Buyer and Vendor, and never names Account.
//  • SD-6 — Trust is in neither surface list and stays TERMINAL (composed last), drawn in full always.
//  • The participation CONTROL stays role-only: Account is NOT a participation (frozen Doc-7C §4.3
//    composes the navigable surface set from participation + org role; every user has Account under
//    every participation), so it folds without becoming a third segment. See `types.ts` →
//    `foldableSurfaces`.
//
// Nav DATA ownership is unchanged: each surface's nav model owns its own sections (`BUYER_NAV`,
// `VENDOR_NAV`, `ACCOUNT_NAV`); this seam only selects, tags, orders and composes them — and owns the
// resulting ShellViewModels, which is why `accountShellVm` lives here beside `HYBRID_SHELL_VM` rather
// than in the account nav model (the `buyer-nav-model` shape: data there, VM here).
import { BUYER_NAV, BUYER_QUICK_CREATE } from "../../(workspace)/buy/_components/buyer-nav-model";
import { ACCOUNT_NAV, ACCOUNT_QUICK_BAR } from "../../account/overview/account-nav-model";
import { VENDOR_NAV, VENDOR_QUICK_BAR, VENDOR_QUICK_CREATE } from "../vendor/vendor-shell-vm";
import { composeNav } from "../shell/hybrid-nav";
import type {
  BreadcrumbItem,
  NavItem,
  NavSection,
  PlatformParticipation,
  QuickCreateItem,
  ShellViewModel,
  SurfaceSwitchItem,
} from "../shell";

/** Seam transform — TAG every section of one co-mounted surface so the shell can bracket them under
 *  a single strong header (`NavSection.surface`). Tagging is the seam's job by the stated boundary
 *  (`hybrid-nav.ts`: "Identity/seam validates·selects·tags·orders; presentation concatenates·
 *  renders") — the shell renders the tag verbatim and never derives participation from it.
 *
 *  WHY (the defect this fixes): before tagging, a Hybrid org's sidebar rendered NINE equal-weight
 *  sections — `Buying · Procurement · Marketplace · Communication · Analytics · Selling · … · Trust`
 *  — each with an identical divider and an identical muted uppercase label. Nothing expressed that
 *  Procurement/Marketplace/Communication/Analytics live INSIDE Buying, so "grouped, not merged"
 *  (Invariant #2 / [ESC-7G-A7]) was true in the data and illegible on screen. The tag restores the
 *  hierarchy WITHOUT a toggle or a cross-route swap: both surfaces stay mounted and every route stays
 *  reachable, exactly as Doc-7A R6 §4.2 ("a surface is a capability, not an exclusive app") requires.
 *
 *  Returns NEW sections — never mutates the source. */
function tagSurface(sections: NavSection[], surface: string): NavSection[] {
  return sections.map((section) => ({ ...section, surface }));
}

/** Seam transform — rename a leaf within a section. Returns a NEW section; never mutates the source.
 *
 *  Used to disambiguate the co-mounted OVERVIEW leaves: both surfaces ship a leaf labelled
 *  "Dashboard", and side by side in one sidebar that is unreadable ("which of these two am I on?").
 *  `composeNav` deliberately PERMITS duplicate leaf labels under distinct sections, so nothing catches
 *  this — but a user cannot resolve it either. Renaming is strictly a CO-MOUNT concern: a buyer-only
 *  or vendor-only nav's plain "Dashboard" is correct and must not change (the "change canonical only
 *  when beneficial in every context" rule), so it lives HERE, not as a `BUYER_NAV`/`VENDOR_NAV` edit. */
function relabelItem(section: NavSection, from: string, to: string): NavSection {
  return {
    ...section,
    items: section.items.map((item) => (item.label === from ? { ...item, label: to } : item)),
  };
}

/** Seam transform — drop a section's own heading where the surface header now carries it (Trust),
 *  so the block does not render the same word twice. Returns a NEW section. */
function dropSectionLabel(section: NavSection): NavSection {
  const next = { ...section };
  delete next.label;
  return next;
}

const pickById = (nav: NavSection[], ids: string[]): NavSection[] =>
  nav.filter((section) => ids.includes(section.id));

/** Buying surface groups — the buyer's overview + its own surface-specific groups, all tagged
 *  "Buying". Org/Account groups are omitted (shared → Account surface; see header). */
function buyingGroups(): NavSection[] {
  return tagSurface(
    pickById(BUYER_NAV, [
      "overview",
      "procurement",
      "marketplace",
      "communication",
      "analytics",
    ]).map((section) =>
      section.id === "overview" ? relabelItem(section, "Dashboard", "Buying overview") : section,
    ),
    "Buying",
  );
}

/**
 * Leaves the co-mount re-homes into `Selling › Communication`, in render order. Both are the vendor's
 * OWN surface-specific comms; neither is org-level.
 */
const SELLING_COMMUNICATION_LEAVES = ["Buyer Inquiries", "Notifications"];

/** Seam helper — collect VENDOR_NAV leaves by label, in the order named. Returns fresh copies. */
function vendorLeaves(labels: readonly string[]): NavItem[] {
  const all = VENDOR_NAV.flatMap((section) => section.items);
  return labels
    .map((label) => all.find((item) => item.label === label))
    .filter((item): item is NavItem => Boolean(item))
    .map((item) => ({ ...item }));
}

/** Seam transform — drop leaves that the co-mount has re-homed elsewhere. Returns a NEW section. */
function withoutLeaves(section: NavSection, labels: readonly string[]): NavSection {
  return { ...section, items: section.items.filter((item) => !labels.includes(item.label)) };
}

/**
 * Selling surface groups — the vendor's primary leaves + showcase/docs groups + its OWN Communication
 * group, all tagged "Selling".
 *
 * PER-SURFACE COMMUNICATION (owner-ruled 2026-07-15). This realizes A7's expressly reserved IA
 * question — "which groups are surface-specific vs shared" (see this file's header) — and fixes a real
 * defect it left behind: the seam dropped VENDOR_NAV's `standing` section wholesale to keep ORG-LEVEL
 * concerns (Billing & Plan / Team / Settings) out of the surfaces, since those belong to the Account
 * surface. But `standing` also carried the vendor's OWN `Notifications`, so a Hybrid org lost
 * `/sell/notifications` entirely — it appeared in no nav, while `/buy/notifications` did. Only the
 * surface-specific leaves cross over here; the org-level ones stay in Account, exactly as before.
 *
 * `Buyer Inquiries` is re-homed out of `primary` for symmetry with `Buying › Communication`
 * (Messages + Notifications): it is the vendor's buyer-facing message inbox, i.e. communication.
 * Both moves are CO-MOUNT-only — vendor-only rendering keeps VENDOR_NAV exactly as authored (the
 * "change canonical only when beneficial in every context" rule).
 */
function sellingGroups(): NavSection[] {
  const surfaceGroups = pickById(VENDOR_NAV, ["primary", "showcase", "business-docs"]).map(
    (section) =>
      section.id === "primary"
        ? withoutLeaves(
            relabelItem(section, "Dashboard", "Selling overview"),
            SELLING_COMMUNICATION_LEAVES,
          )
        : section,
  );

  const communication: NavSection = {
    id: "selling-communication",
    label: "Communication",
    items: vendorLeaves(SELLING_COMMUNICATION_LEAVES),
  };

  return tagSurface([...surfaceGroups, communication], "Selling");
}

/**
 * Account (Surface E) groups — the org-level surface, tagged "Account" so the sidebar folds it exactly
 * like Buying/Selling (A7.4, owner-RULED 2026-07-15; see this file's header).
 *
 * Composed from `ACCOUNT_NAV` — the CANONICAL `/account/*` Surface E routes — and not from the
 * buyer-native `/buy/profile` · `/buy/settings` · `/buy/team` duplicates, nor from VENDOR_NAV's
 * `standing` (Billing & Plan / Team / Settings). Those exist for SINGLE-surface navs, where each
 * workspace keeps its concerns in its own shell; the co-mount already drops all of them (`buyingGroups`
 * picks neither BUYER_NAV's `organization` nor its `account` section, and `sellingGroups` takes only
 * the surface-specific leaves out of `standing` — SD-7). So one Account block replaces two dropped
 * halves rather than duplicating anything, and A7R SD-7's rationale — "correctly keeping org-level
 * Billing/Team/Settings in Account" — is preserved verbatim: they still live in Account. Account is
 * simply no longer OUT OF SIGHT while you are in a workspace.
 */
function accountGroups(): NavSection[] {
  return tagSurface(ACCOUNT_NAV, "Account");
}

/** Trust — the always-TERMINAL read-only surface (extracted into its own section in VENDOR_NAV).
 *  Tagged as its own co-mount surface so it reads as a peer of Buying/Selling and is never folded
 *  into an editable group; its section heading is dropped because the surface header now carries it. */
function trustGroups(): NavSection[] {
  return tagSurface(pickById(VENDOR_NAV, ["performance"]).map(dropSectionLabel), "Trust");
}

/**
 * Seam: participation → the ordered nav SEGMENTS to mount (stand-in for SR3). Hybrid → both role
 * workspaces + terminal Trust; vendor-only → the full vendor nav; buyer-only → the full buyer nav.
 * Never advertises a surface the org does not participate in.
 */
export function resolveMountedNavGroups(participation: PlatformParticipation): NavSection[][] {
  switch (participation) {
    case "hybrid":
      // ORDER IS THE CONTRACT (`hybrid-nav.ts`: "Ordering is honored BY POSITION… role groups first —
      // Buying, then Selling — then Trust always TERMINAL"). Account slots in BEFORE Trust, not after:
      // A7R SD-6 makes Trust the persistent TERMINAL group, so it must stay last. Account is the last
      // foldable block; Trust is the always-drawn floor beneath it.
      return [buyingGroups(), sellingGroups(), accountGroups(), trustGroups()];
    case "vendor":
      return [VENDOR_NAV];
    case "buyer":
    default:
      return [BUYER_NAV];
  }
}

/** Build a ShellViewModel `nav` for a participation by mounting (seam) then composing (shell). */
function composeNavFor(participation: PlatformParticipation): NavSection[] {
  return composeNav(...resolveMountedNavGroups(participation));
}

const vendorHref = (label: string, fallback: string): string =>
  VENDOR_QUICK_BAR.find((item) => item.label === label)?.href ?? fallback;

/** Mobile bottom-bar — a Hybrid thumb-reach SUBSET spanning BOTH surfaces (not a buyer-only or
 *  vendor-only bar). Final Hybrid quick-bar composition is an [ESC-7G-A7] IA question. */
export const HYBRID_QUICK_BAR: NavItem[] = [
  { label: "Buying", href: "/buy/dashboard", icon: "dashboard" },
  { label: "RFQs", href: "/buy/rfqs", icon: "rfqs" },
  { label: "Selling", href: vendorHref("Home", "/sell/dashboard"), icon: "showcase" },
  { label: "Trust", href: vendorHref("Trust", "/sell/trust"), icon: "trust" },
];

/**
 * Hybrid participation LENS entries ([ESC-7G-A7R], Board-RULED 2026-07-15) — the two ROLE workspaces
 * a Hybrid user may foreground, in the SAME order the nav composes them (Buying, then Selling), so the
 * control and the sidebar never contradict each other. The design reference orders its own control
 * Selling-first; we follow OUR composed nav order instead — internal consistency beats fidelity to a
 * mockup's arbitrary ordering.
 *
 * `label` MUST equal the `tagSurface()` tag of the sections it foregrounds — that string is the join.
 *
 * TRUST IS DELIBERATELY ABSENT (SD-6): it is a terminal, read-only governance signal, not a role
 * workspace. Omitting it here is exactly what makes it render in full under EVERY lens — never
 * foregrounded, never hidden. Do not add it.
 *
 * This list NEVER gates anything (SD-3) and never shrinks `nav` (SD-1/SD-5): both surfaces stay
 * mounted under either lens, which is what keeps this conformant with Doc-7A R6 §4.2.
 */
export const HYBRID_SURFACES: SurfaceSwitchItem[] = [
  { label: "Buying", href: "/buy/dashboard", prefix: "/buy" },
  { label: "Selling", href: "/sell/dashboard", prefix: "/sell" },
];

/** The Account (Surface E) block. `label` MUST equal `accountGroups()`'s tag — that string is the join.
 *  `prefix` is `/account`, so every canonical Surface E route folds Account open and the workspaces
 *  closed, with no route→surface mapping anywhere in the shell (SD-2: derived, stored nowhere). */
const ACCOUNT_SURFACE: SurfaceSwitchItem = {
  label: "Account",
  href: "/account/overview",
  prefix: "/account",
};

/**
 * Everything that FOLDS by route — the two role workspaces PLUS Account. Superset of
 * `HYBRID_SURFACES`, which stays exactly as A7R ruled it and drives the participation CONTROL alone.
 *
 * Account is here and not there because it folds like a surface without BEING a participation
 * (frozen Doc-7C §4.3). Trust is in NEITHER, which is what keeps it drawn in full under every fold
 * (SD-6) — do not add it to either list.
 */
export const HYBRID_FOLDABLE_SURFACES: SurfaceSwitchItem[] = [...HYBRID_SURFACES, ACCOUNT_SURFACE];

/** Hybrid `+ Create` — both surfaces' create actions (buyer RFQ + vendor catalog/ad). */
const HYBRID_QUICK_CREATE: QuickCreateItem[] = [...BUYER_QUICK_CREATE, ...VENDOR_QUICK_CREATE];

/**
 * Hybrid demo VM — the SAME co-mounted nav is rendered from BOTH the buyer and vendor route-group
 * layouts (see their `layout.tsx`) so a Hybrid user crossing Buying↔Selling sees an IDENTICAL
 * sidebar: proof of "mount both" with no swap. `notifications`/`unreadCount` are deliberately unset
 * (Inv #11: no fabricated non-disclosure-unsafe count) — the topbar center owns real notifications.
 */
export const HYBRID_SHELL_VM: ShellViewModel = {
  identity: {
    // Presentation fixture only. Production identity/participation resolves server-side (SR3).
    user: { name: "Anisur Rahman", email: "anisur@padmavalve.com.bd" },
    activeOrg: { id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" },
    organizations: [{ id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" }],
  },
  nav: composeNavFor("hybrid"),
  surfaces: HYBRID_SURFACES,
  foldableSurfaces: HYBRID_FOLDABLE_SURFACES,
  quickCreate: HYBRID_QUICK_CREATE,
  quickBar: HYBRID_QUICK_BAR,
  search: { placeholder: "Search RFQs, vendors, products…", href: "/buy/discover" },
};

/**
 * The canonical Account-section ShellViewModel, shared by EVERY `/account/*` layout — only the
 * per-page breadcrumb differs.
 *
 * It is the WORKSPACE VM with an Account quick-bar, and that is the entire point of the A7.4 ruling:
 * `/account/*` renders the SAME composed nav as `/buy/*` and `/sell/*`, so clicking Account folds the
 * workspaces and opens Account instead of swapping the sidebar for a different one. Previously this
 * built a standalone Account-only nav, which is exactly the discontinuity the owner asked to remove
 * ("all the dashboards will be similar"). The fold needs no state here — it is a pure function of the
 * route (SD-2), so the same VM produces the right sidebar on every route it is mounted under.
 *
 * PRESENTATION SEED only (a wired build resolves identity/active-org server-side via
 * `get_active_context`, SR3 — PARKED); no client-supplied org id is trusted (Inv #5).
 */
export function accountShellVm(breadcrumb: BreadcrumbItem[]): ShellViewModel {
  return { ...HYBRID_SHELL_VM, quickBar: ACCOUNT_QUICK_BAR, breadcrumb };
}

/** Single-surface fixtures — prove participation-derived mounting (buyer-only → no Selling; vendor-
 *  only → no Buying). Presentation fixtures only (SR3 owns production participation). */
export const BUYER_ONLY_NAV: NavSection[] = composeNavFor("buyer");
export const VENDOR_ONLY_NAV: NavSection[] = composeNavFor("vendor");
