// Temporary, A7-NEUTRAL mount for the Vendor Workspace (presentation phase).
//
// [ESC-7G-A7] (BLOCKER, pending the human Architecture Board) freezes the design-introduced
// `(vendor)` route-group name and the Hybrid "mount-both" IA. To keep parallel FE work moving
// WITHOUT pre-deciding A7 — and to avoid a URL collision with Team 2's `(buyer)` group at
// `/dashboard` — the Vendor Workspace mounts under a disposable real segment `/workspace/*`. The
// shell + nav are route-group-agnostic; the `basePath` prop makes this temporary prefix the ONLY
// thing that changes when A7 is ratified (rename/rehome the segment, drop `basePath`).
//
// Presentation-only: no data, no backend, no permission logic. The shell-owned org switcher,
// notification center and user menu render as placeholders (Doc-7C SR3/SR6; GR12).
import type { ReactNode } from "react";
import { VendorWorkspaceShell } from "../_components/vendor";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <VendorWorkspaceShell basePath="/workspace">{children}</VendorWorkspaceShell>;
}
