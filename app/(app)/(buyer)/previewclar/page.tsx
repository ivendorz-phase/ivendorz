// THROWAWAY preview for P-BUY-16 clarifications validation (render + axe). Deleted after.
import { ClarificationsView } from "../_components/clarifications";

export default async function PreviewClar({
  searchParams,
}: {
  searchParams: Promise<{ nf?: string }>;
}) {
  const sp = await searchParams;
  return <ClarificationsView data={sp.nf ? null : { rfqId: "r-1", humanRef: "RFQ-2026-000123" }} />;
}
