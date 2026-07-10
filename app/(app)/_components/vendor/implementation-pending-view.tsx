// Vendor Workspace — a nav destination reserved but not yet built (VX-01). Mirrors the buyer
// track's own `ImplementationPendingView` ((buyer)/_components/implementation-pending-view.tsx)
// byte-for-byte — a vendor-local copy, not a cross-workspace import (workspace-boundary discipline:
// vendor never imports `(buyer)/*`). Used for nav leaves the VX-01 mockup calls for that have no
// backing read/write contract in the frozen corpus yet — scaffolded honestly, never a fabricated
// page with invented data.
import type { ReactNode } from "react";
import { Breadcrumbs, PageHeader, type BreadcrumbItem } from "../shell";
import { EmptyState } from "@/frontend/components/empty-state";

export interface ImplementationPendingViewProps {
  /** Full trail incl. the current (last) page — the shell `Breadcrumbs` convention. */
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: string;
  icon: ReactNode;
}

export function ImplementationPendingView({
  breadcrumb,
  title,
  description,
  icon,
}: ImplementationPendingViewProps) {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumb} className="mb-4" />
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Implementation pending"
        description="This page is reserved in the navigation but not yet built — the underlying read/write contract for this surface isn't in the frozen corpus yet. It will be populated in a future milestone."
        className="py-16"
      />
    </div>
  );
}
