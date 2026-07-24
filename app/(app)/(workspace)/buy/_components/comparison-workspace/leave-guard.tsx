"use client";

// Comparison Workspace — BOUNDED leave guard (§2.11A.8, owner MAJOR-2). The promise never exceeds what can
// be reliably intercepted:
//  • Refresh / tab-close / hard navigation while dirty → the native `beforeunload` prompt (below).
//  • Compare ⇄ Comparative Statement → deliberately NOT guarded (both routes share the provider, §2.3.1; no
//    state is lost) — that navigation stays inside the `(comparison)` group and is a mode switch, not a leave.
//  • Reset actions → separately confirmed (§2.11A.9), not a leave.
//  • Browser Back/Forward and shell controls OUTSIDE the workspace → out of scope. The App Router exposes no
//    supported navigation-guard hook (verified — none exists in this repo), so we do NOT claim universal SPA
//    interception and never monkey-patch the router, the History API, or global anchor behavior.
//
// The panel copy states honestly that private edits are not saved and are lost on refresh/leave.

import { useEffect } from "react";
import { useComparisonWorkspace } from "./comparison-workspace-state";

export function LeaveGuard() {
  const { dirty } = useComparisonWorkspace();
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      // Standard cross-browser dance: preventDefault + assign returnValue to trigger the native prompt.
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return null;
}
