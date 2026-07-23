// Comparison Workspace — region ① RFQ CONTEXT HEADER. Pure presentation (no hooks) — the single page
// <h1> via the shell `PageHeader`, with the RFQ identity + a "Descriptive · not ranked" meta so the
// surface never reads as a ranking (R6). Rendered inside the client workspace root.

import { PageHeader } from "../../../../_components/shell";
import { Ref } from "@/frontend/components/format";
import type { ComparisonWorkspaceData } from "./workspace-view-models";

export function RfqContextHeader({
  data,
  quotationCount,
}: {
  data: ComparisonWorkspaceData;
  quotationCount: number;
}) {
  return (
    <PageHeader
      title="Supplier comparison"
      description={data.rfqTitle}
      meta={
        <>
          {data.humanRef ? <Ref>{data.humanRef}</Ref> : null}
          {data.project ? (
            <span className="text-xs text-muted-foreground">· {data.project}</span>
          ) : null}
          <span className="text-xs text-muted-foreground">· Currency {data.currency}</span>
          <span className="text-xs text-muted-foreground">
            · {quotationCount} {quotationCount === 1 ? "quotation" : "quotations"}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            · Descriptive · not ranked
          </span>
        </>
      }
    />
  );
}
