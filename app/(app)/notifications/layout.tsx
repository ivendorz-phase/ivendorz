// Notification center layout (P-SH-02 · Doc-7C Shared Authenticated Shell · SR6) — mounts the CANONICAL
// Platform Shell for the full-page notification center, scoped to `/notifications` ONLY. App Router
// composition only.
//
// PRESENTATION ONLY: identity/active-org is a presentation SEED (a wired build resolves it server-side via
// get_active_context — PARKED; Inv #5 client org id never trusted). The topbar NotificationCenter is fed
// the SAME seed as the full page (single source — notifications-seed.ts), so the bell count and the page
// stay consistent. The unread count is non-disclosure-safe (IA §4.2/§5.4).
//
// SHELL PLACEMENT (flagged for Team-4, as with P-SH-01): the authoritative nav model/URL for the shell-
// level notification center is not settled in the corpus (and `/account/notifications` is already the
// P-ACC-15 preferences page), so this full-page center mounts at top-level `/notifications` and reuses the
// existing ACCOUNT_NAV view-model (least-invention; no nav model coined) — an OBS, not resolved here.
import type { ReactNode } from "react";
import { AppShell, type ShellViewModel } from "../_components/shell";
import { ACCOUNT_NAV, ACCOUNT_QUICK_BAR } from "../account/overview/account-nav-model";
import { NOTIFICATIONS, UNREAD_COUNT } from "./notifications-seed";

const NOTIFICATIONS_SHELL_VM: ShellViewModel = {
  identity: {
    user: { name: "Anisur Rahman", email: "anisur@padmavalve.com.bd" },
    activeOrg: { id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" },
    organizations: [{ id: "active", name: "Padma Valve & Fittings Ltd.", participation: "hybrid" }],
  },
  nav: ACCOUNT_NAV,
  quickBar: ACCOUNT_QUICK_BAR,
  notifications: NOTIFICATIONS,
  unreadCount: UNREAD_COUNT,
  breadcrumb: [{ label: "Notifications" }],
};

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={NOTIFICATIONS_SHELL_VM}>{children}</AppShell>;
}
