"use client";

// Comparison Workspace — GATING INITIALIZER (the two-stage reconciliation step, §2.3.1).
//
// The shared `(comparison)` route-group layout mounts the provider UNINITIALIZED — a layout does not
// receive the leaf `searchParams` nor the disclosed quotation set. Each leaf PAGE (which does) resolves
// the disclosed set + parses its own `?sel=` and wraps its surface in this component, supplying the
// idempotent `initializeWorkspace(...)` payload. This gates provider-dependent rendering until
// `didInitialize` is true so a cold entry on EITHER route never shows an incorrect first render or a
// state flicker. On a warm compare ⇄ statement navigation the provider is already initialized, so this
// is an immediate pass-through that never resets buyer-authored edits.

import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/frontend/primitives/skeleton";
import { useComparisonWorkspace, type InitializeInput } from "./comparison-workspace-state";

function InitGate() {
  // Calm silhouette while the one-time reconcile completes (a single client tick post-hydration).
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Preparing the comparison workspace…</span>
      <Skeleton className="h-7 w-72" />
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-80 w-full xl:col-span-2" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export function ComparisonWorkspaceInitializer({
  input,
  children,
}: {
  input: InitializeInput;
  children: ReactNode;
}) {
  const { initializeWorkspace, didInitialize } = useComparisonWorkspace();

  useEffect(() => {
    // Runs once on mount with the entry render's payload (the requested `?sel=` + disclosed set).
    // `initializeWorkspace` is idempotent, so a later mount on the sibling route is a safe no-op.
    initializeWorkspace(input);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!didInitialize) return <InitGate />;
  return <>{children}</>;
}
