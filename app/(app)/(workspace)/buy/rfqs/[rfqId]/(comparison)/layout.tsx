// (comparison) route group — the SHARED boundary of `/compare` and `/comparative-statement`. A route
// group adds NO URL segment, so both routes keep their frozen paths exactly. This layout is a SERVER
// Component: it resolves the opaque `rfqId` and mounts the CLIENT `ComparisonWorkspaceStateProvider`
// (`key={rfqId}`) once, shared by both routes — so navigating compare ⇄ comparative-statement preserves
// the buyer's session-local selection/evaluation/purpose/signatory state (only an `rfqId` change
// remounts it). The provider is the narrow client boundary; everything else stays server-rendered.

import type { ReactNode } from "react";
import { ComparisonWorkspaceStateProvider } from "../../../_components/comparison-workspace";

export default async function ComparisonGroupLayout({
  params,
  children,
}: {
  params: Promise<{ rfqId: string }>;
  children: ReactNode;
}) {
  const { rfqId } = await params;
  return (
    <ComparisonWorkspaceStateProvider key={rfqId} rfqId={rfqId}>
      {children}
    </ComparisonWorkspaceStateProvider>
  );
}
