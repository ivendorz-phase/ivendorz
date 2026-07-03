// Doc-7B kit — comparison EMPTY state. Promoted from the buyer-scoped `P-BUY-15` realization (Shared
// Platform Component Registry §4.2 CTO override — 2026-07-03). VISIBILITY-GATED: an empty comparison reads
// as "awaiting responses" and must NEVER imply a vendor was excluded/deferred (Inv #11 / GI-12). Reuses the
// kit `EmptyState`.

import { EmptyState } from "@/frontend/components/empty-state";

export function ComparisonEmpty() {
  return (
    <EmptyState
      title="No quotations to compare yet"
      description="Awaiting vendor responses to this RFQ. The comparison appears once quotations are received."
      className="py-12"
    />
  );
}
