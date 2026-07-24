// Comparison Workspace — SERVER host (route composition + absence branches). Renders the Breadcrumbs
// (always visible, even during the initializer's gate) and wraps the client workspace in the gating
// `ComparisonWorkspaceInitializer`. Absence states are static (no provider needed): `null` → the
// byte-identical genuine-absence not-found (Inv #11 / GI-12); an empty disclosed set → "awaiting
// responses" (never implies exclusion).

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { Breadcrumbs } from "../../../../_components/shell";
import { ComparisonWorkspaceInitializer } from "./comparison-workspace-initializer";
import { ComparisonWorkspace } from "./comparison-workspace";
import { toInitializeInput, type ComparisonWorkspaceData } from "./workspace-view-models";

/** Not-found ≡ genuine absence (byte-identical; Inv #11 / GI-12). Breadcrumb shows only the RFQs ancestor. */
export function ComparisonNotFound() {
  return (
    <>
      <Breadcrumbs items={[{ label: "RFQs", href: "/buy/rfqs" }]} className="mb-4" />
      <h1 className="sr-only">Comparison not found</h1>
      <EmptyState
        icon={<FileText aria-hidden />}
        title="Comparison not found"
        description="This comparison doesn't exist or isn't available."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/buy/rfqs">Back to RFQs</Link>
          </Button>
        }
        className="py-16"
      />
    </>
  );
}

/** Visibility-gated empty — reads as "awaiting responses", never implies a vendor was excluded (Inv #11). */
export function ComparisonAwaiting({ humanRef, rfqId }: { humanRef?: string; rfqId: string }) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/buy/rfqs" },
          { label: humanRef ?? "RFQ", href: `/buy/rfqs/${rfqId}` },
          { label: "Comparison" },
        ]}
        className="mb-4"
      />
      <h1 className="sr-only">Supplier comparison</h1>
      <EmptyState
        title="No quotations yet"
        description="Awaiting vendor responses to this RFQ."
        className="py-16"
      />
    </>
  );
}

export function ComparisonWorkspaceView({ data }: { data: ComparisonWorkspaceData }) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "RFQs", href: "/buy/rfqs" },
          { label: data.humanRef ?? "RFQ", href: `/buy/rfqs/${data.rfqId}` },
          { label: "Comparison" },
        ]}
        className="mb-4"
      />
      <ComparisonWorkspaceInitializer input={toInitializeInput(data)}>
        <ComparisonWorkspace data={data} />
      </ComparisonWorkspaceInitializer>
    </>
  );
}
