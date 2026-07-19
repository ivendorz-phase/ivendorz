// Shared Buyer+Vendor workspace layout — ONE application shell driven by a WORKSPACE CONTEXT
// (owner-directed "Workspace Switching & Unified Navigation Refactor", 2026-07-18). A Hybrid user
// crossing Buying↔Selling never remounts the shell; the active workspace (context) selects which
// single-surface nav the one shared sidebar renders, and the top-right Workspace Switcher sets it.
//
// SUPERSEDES the prior [ESC-7G-A7R] REALIZATION (co-mount BOTH surfaces in one sidebar + a sidebar
// lens control) with a different but equally frozen-conformant one: single-workspace sidebar + a
// top-right switcher that keeps both workspaces one click away. This stays within frozen Doc-7A R6
// §4.2 (verbatim: "a surface is a route-group/capability, NOT a per-user exclusive app: one user …
// MAY MOUNT Buyer AND Vendor workspaces … the App Shell composes the navigable surface set from
// platform participation + org role") — both workspaces stay REACHABLE; R6 never mandated rendering
// both in the sidebar at once. It is a UI lens only, never an authz claim (R7 — the server
// re-validates). See `_components/workspace/workspace-context.tsx` for the full governance note.
//
// App Router composition only (REPOSITORY_STRUCTURE §8). Admin (`/admin`) and Account (`/account`)
// keep their own layouts OUTSIDE this group. Identity/participation are a neutral presentation fixture
// until the Doc-7C context layer (SR3, get_active_context) is wired; no client-supplied org is trusted.
import type { ReactNode } from "react";
import { WorkspaceProvider } from "../_components/workspace/workspace-context";
import { WorkspaceShell } from "../_components/workspace/workspace-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
