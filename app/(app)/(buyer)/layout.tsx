// Buyer Workspace layout (Surface F · Doc-7F §4.1) — mounts the CANONICAL Platform Shell. The Buyer's
// bespoke shell (BuyerTopbar / BuyerSidebar / BuyerMobileNav) has been RETIRED in favour of <AppShell>:
// one shell, multiple workspaces. App Router composition only (REPOSITORY_STRUCTURE §8) — no business logic.
//
// [ESC-7G-A7] CO-MOUNT DEMO (Doc-7A R6 / Doc-7C SR3 "Hybrid mounts both"): the seed org is a HYBRID org
// (buys AND sells), so this route group mounts the SAME co-mounted `HYBRID_SHELL_VM` as the vendor
// (`/workspace`) layout — a Hybrid user crossing Buying↔Selling sees an IDENTICAL sidebar (no toggle,
// no swap). Only the topbar notification seed is buyer-local (the `/notifications` page reads the same
// seed). Single-surface (buyer-only / vendor-only) mounting is exercised by the exported *_ONLY_NAV
// fixtures. PRESENTATION ONLY: identity/participation are a fixture until the Doc-7C context layer is
// wired (`get_active_context`, SR3 — PARKED); no client-supplied org id is ever trusted (Inv #5).
import type { ReactNode } from "react";
import { AppShell, type ShellViewModel } from "../_components/shell";
import { HYBRID_SHELL_VM } from "../_components/hybrid/hybrid-shell-vm";
import { NOTIFICATIONS, UNREAD_COUNT } from "./notifications/notifications-seed";

const BUYER_SHELL_VM: ShellViewModel = {
  ...HYBRID_SHELL_VM,
  // BX-04: the SAME seed the full `/notifications` page reads, so the topbar bell dropdown and the
  // full page stay a single source. Buyer-local because that seed lives in this route group.
  notifications: NOTIFICATIONS,
  unreadCount: UNREAD_COUNT,
};

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={BUYER_SHELL_VM}>{children}</AppShell>;
}
