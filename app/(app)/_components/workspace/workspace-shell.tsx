"use client";

// WorkspaceShell — the client bridge that turns the active workspace (context) into the ShellViewModel
// the shared AppShell renders (owner-directed refactor, 2026-07-18). ONE shell, one sidebar, one
// header; only the workspace context + generated navigation change. Reads the workspace from context,
// builds the single-workspace VM, and injects the top-right Workspace Switcher as the shell's
// user-menu slot (hiding the separate left org-switcher — its org identity now lives in the switcher).
//
// The page `children` are passed straight through as a prop, so route pages stay server-rendered even
// though this bridge is a Client Component (it must be — the active workspace is client state).
import type { ReactNode } from "react";
import { AppShell } from "../shell/app-shell";
import { getWorkspaceVm } from "./workspace-nav";
import { useWorkspace } from "./workspace-context";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { WorkspaceSidebarHeader } from "./workspace-sidebar-header";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const { workspace } = useWorkspace();
  const vm = getWorkspaceVm(workspace);
  const participation = vm.identity.activeOrg.participation ?? "hybrid";

  return (
    <AppShell
      vm={vm}
      // Hide the standalone left org-switcher — org identity is carried by the switcher on the right.
      orgSwitcherSlot={<></>}
      userMenuSlot={<WorkspaceSwitcher identity={vm.identity} participation={participation} />}
      // Passive workspace identity strip above the sidebar nav (not a switcher).
      sidebarHeader={<WorkspaceSidebarHeader />}
    >
      {children}
    </AppShell>
  );
}
