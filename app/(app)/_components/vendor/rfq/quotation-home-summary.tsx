// S1 Quotation Home header band (companion §6.2) — "self-only counters + quota + needs-response".
// The pipeline COUNTERS are held behind [ESC-7-API] #1 (no frozen vendor received-only count read
// exists; vendor-leg reads are cursor lists only). Per GR11 (denominator law) we render NO fabricated
// counts — only the quota meter (Doc-5I) and a non-numeric "needs response" framing. Presentation-only;
// RSC-friendly.
import { QuotaMeter } from "./quota-meter";
import type { QuotaView } from "./types";

export interface QuotationHomeSummaryProps {
  quota?: QuotaView;
}

export function QuotationHomeSummary({ quota }: QuotationHomeSummaryProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Invitations that need a response appear at the top of your inbox below.
      </p>
      <QuotaMeter quota={quota} />
    </div>
  );
}
