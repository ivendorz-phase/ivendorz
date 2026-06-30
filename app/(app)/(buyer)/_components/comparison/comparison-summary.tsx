// P-BUY-15 — comparison SUMMARY band. Descriptive context for the matrix (how many quotations are being
// compared + the immutable statement stamp). PRESENTATION-ONLY: it states a count of DISCLOSED quotations
// (never a withheld/excluded count — Inv #11/GI-12) and carries NO winner/recommendation/ranking (R6). The
// "not ranked" note reinforces to the buyer that order is the System's, not a preference.

import { Card, CardContent } from "@/frontend/primitives/card";
import { formatInstant } from "../format";
import type { ComparisonData } from "./comparison-view-models";

export function ComparisonSummary({ data }: { data: ComparisonData }) {
  const n = data.suppliers.length;
  const stamp = [
    typeof data.versionNo === "number" ? `Version ${data.versionNo}` : null,
    data.generatedAt ? `Generated ${formatInstant(data.generatedAt)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 p-4">
        <p className="text-sm text-foreground">
          Comparing <span className="font-semibold">{n}</span>{" "}
          {n === 1 ? "quotation" : "quotations"} side by side.{" "}
          <span className="text-muted-foreground">Shown in the order provided — not ranked.</span>
        </p>
        {stamp ? <span className="text-xs text-muted-foreground">{stamp}</span> : null}
      </CardContent>
    </Card>
  );
}
