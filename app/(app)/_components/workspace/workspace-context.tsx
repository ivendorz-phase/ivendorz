"use client";

// Workspace context — the single source of truth for the active workspace lens (owner-directed
// "Workspace Switching & Unified Navigation Refactor", 2026-07-18). ONE application shell whose
// sidebar/header/dashboard are driven by this context; the top-right Workspace Switcher sets it.
//
// GOVERNANCE — conformant with frozen Doc-7A R6 §4.2 (verbatim): "A surface is a route-group/
// capability, NOT a per-user exclusive app: one user under one active org MAY MOUNT Buyer AND Vendor
// workspaces where Platform Participation is Hybrid; the App Shell composes the navigable surface set
// from platform participation + org role." R6 requires both workspaces to be REACHABLE for a hybrid
// user — it does NOT mandate rendering both in the sidebar at once. This supersedes the prior
// [ESC-7G-A7R] REALIZATION (co-mount both surfaces in one sidebar + a sidebar lens control), an
// owner-ruled FE-IA choice, with a different but equally-conformant realization: a single-workspace
// sidebar + a top-right switcher that keeps both one click away. The FROZEN rule is unchanged.
//
// THIS IS A UI LENS, NOT AN AUTHZ CLAIM (R6/R7). The active workspace only picks which navigation to
// render; it is never sent to the server as authority, never gates a route, and the server re-validates
// every action. Persistence is a client convenience; the route is authoritative when it names a
// workspace (see the sync effect below), so a persisted value can never override where you actually are.
//
// FUTURE-PROOF: adding a workspace (e.g. a future Staff/Procurement lens) is one enum member + one
// WORKSPACE_REGISTRY entry — the shell, provider, and switcher read the registry generically and never
// branch on a specific workspace name.
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, type LucideIcon } from "lucide-react";

export type Workspace = "buyer" | "seller";

/** Per-workspace presentation config. Extend `Workspace` + add an entry here to add a workspace;
 *  nothing in the shell/provider/switcher/header branches on a specific workspace name. */
export interface WorkspaceConfig {
  /** Menu label for the switch entry, e.g. "Seller Dashboard". */
  label: string;
  /** Sidebar identity-header title, e.g. "Seller Workspace" (passive label, not a switch). */
  workspaceLabel: string;
  /** Organization ROLE subtitle shown under the org name — derived, never hardcoded at call sites. */
  subtitle: string;
  /** Workspace identity icon (sidebar header + switcher entry). */
  icon: LucideIcon;
  /** Overview route this workspace lands on. */
  dashboardHref: string;
  /** Route prefix that identifies this workspace (`/sell`, `/buy`). */
  prefix: string;
}

export const WORKSPACE_REGISTRY: Record<Workspace, WorkspaceConfig> = {
  seller: {
    label: "Seller Dashboard",
    workspaceLabel: "Seller Workspace",
    subtitle: "Vendor",
    icon: Home,
    dashboardHref: "/sell/dashboard",
    prefix: "/sell",
  },
  buyer: {
    label: "Buyer Dashboard",
    workspaceLabel: "Buyer Workspace",
    subtitle: "Buyer",
    icon: ShoppingBag,
    dashboardHref: "/buy/dashboard",
    prefix: "/buy",
  },
};

const WORKSPACE_ORDER: Workspace[] = ["seller", "buyer"];
const STORAGE_KEY = "iv:active-workspace";

/** The workspace a route belongs to, or `null` for a neutral route (e.g. `/account/*`). Pure —
 *  the registry prefixes are the only mapping, so it can never drift from the switcher. */
export function workspaceFromPath(pathname: string): Workspace | null {
  for (const ws of WORKSPACE_ORDER) {
    const { prefix } = WORKSPACE_REGISTRY[ws];
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return ws;
  }
  return null;
}

interface WorkspaceContextValue {
  workspace: Workspace;
  config: WorkspaceConfig;
  /** Switch the active workspace: update state → persist → navigate to that dashboard. */
  setWorkspace: (workspace: Workspace) => void;
  /** Every workspace, in display order — for the switcher to render without hardcoding names. */
  order: Workspace[];
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  defaultWorkspace = "seller",
}: {
  children: React.ReactNode;
  defaultWorkspace?: Workspace;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Provider is the SOURCE OF TRUTH. Initial value: if we opened directly on a workspace route, adopt
  // it (no hydration flash — the server rendered that workspace's nav too); otherwise the default.
  // A persisted value is applied in an effect (client-only, avoids SSR/localStorage mismatch).
  const [workspace, setWorkspaceState] = React.useState<Workspace>(
    () => workspaceFromPath(pathname) ?? defaultWorkspace,
  );

  // On first mount only, if we landed on a NEUTRAL route, restore the last-used workspace so the
  // shell reflects where the user last was rather than the bare default.
  React.useEffect(() => {
    if (workspaceFromPath(pathname) !== null) return; // route wins — nothing to restore
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "buyer" || stored === "seller") setWorkspaceState(stored);
    // Intentionally mount-only: later route changes are handled by the sync effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the provider SYNCHRONIZED with the route: navigating manually to `/sell/*` or `/buy/*` (a
  // deep link, a back button, an in-page link) adopts that workspace. The route is authoritative when
  // it names a workspace, so the lens can never lie about where you are; neutral routes leave it be.
  React.useEffect(() => {
    const fromRoute = workspaceFromPath(pathname);
    if (fromRoute && fromRoute !== workspace) setWorkspaceState(fromRoute);
  }, [pathname, workspace]);

  const setWorkspace = React.useCallback(
    (next: Workspace) => {
      setWorkspaceState(next);
      window.localStorage.setItem(STORAGE_KEY, next);
      router.push(WORKSPACE_REGISTRY[next].dashboardHref);
    },
    [router],
  );

  // Persist whenever the active workspace changes (including route-driven syncs), so a later neutral
  // landing restores the right one.
  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, workspace);
  }, [workspace]);

  const value = React.useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      config: WORKSPACE_REGISTRY[workspace],
      setWorkspace,
      order: WORKSPACE_ORDER,
    }),
    [workspace, setWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}
