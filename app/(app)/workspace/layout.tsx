// Vendor Workspace layout — mounts the CANONICAL Platform Shell (one shell, multiple workspaces). The
// vendor's bespoke shell (VendorWorkspaceShell + topbar / sidebar-nav / mobile-nav / bottom-bar /
// breadcrumbs / shell-slots) has been RETIRED in favour of <AppShell>: workspaces contribute only a
// ViewModel + content. App Router composition only (REPOSITORY_STRUCTURE §8) — no business logic.
//
// [ESC-7G-A7] (pending the human Architecture Board) freezes the `(vendor)` route-group name + the
// Hybrid "mount-both" IA. To keep moving WITHOUT pre-deciding A7 — and to avoid a URL collision with the
// `(buyer)` group at `/dashboard` — the Vendor Workspace stays on the disposable `/workspace/*` segment.
// Only the nav-href prefix (VENDOR_SHELL_VM `BASE`) carries it; the shell is route-group-agnostic, so A7
// ratification is a one-line change. PRESENTATION ONLY — identity is a neutral placeholder until wired.
import type { ReactNode } from "react";
import { AppShell } from "../_components/shell";
import { VENDOR_SHELL_VM } from "../_components/vendor/vendor-shell-vm";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppShell vm={VENDOR_SHELL_VM}>{children}</AppShell>;
}
