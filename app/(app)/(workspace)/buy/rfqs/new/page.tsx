// P-BUY-RFQ Buyer RFQ-create route (Doc-7F · `T-WIZARD`, P-BUY-07). A Next.js SERVER COMPONENT in the
// `(app)/(workspace)` group (App Router composition only — REPOSITORY_STRUCTURE §8): no business logic.
//
// D1 (owner-ruled 2026-07-24): the server shell seeds a BLANK draft and hands the single client form
// surface (`RfqDraftForm`) the server-provided seam value. NO PRODUCTION WRITES this milestone: the
// audit-backed `rfq.create_rfq.v1` / `rfq.update_rfq.v1` / `rfq.submit_rfq.v1` writes (Doc-4E
// §E4.1/§E4.2/§E4.3) are PARKED behind the Wave-4 write-wiring milestone; spec-document upload is
// capped by `[ESC-7-API/upload]`; category data runs on a stub adapter (P1 seeding gated). The browser
// never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 / Doc-7C SR3).
//
// The POLICY `rfq.min_scope_chars` value is SERVER-PROVIDED here (from the seam constant today; the
// real server value replaces it at wiring — a single-line swap), never hardcoded inside a field.

import { RfqDraftForm } from "../../_components/rfq-create/rfq-draft-form";
import { RFQ_MIN_SCOPE_CHARS } from "../../_components/rfq-create/rfq-draft-seams";

export const metadata = {
  title: "Create RFQ",
};

export default async function BuyerRfqCreatePage({
  searchParams,
}: {
  // `?simulate=save-fail` arms the simulated Save to resolve to its FAILURE state (no server; a
  // server-driven demo seam so the state matrix is reachable without any client-only chrome).
  searchParams: Promise<{ simulate?: string }>;
}) {
  const sp = await searchParams;
  return (
    <RfqDraftForm
      minScopeChars={RFQ_MIN_SCOPE_CHARS}
      simulateSaveFailure={sp?.simulate === "save-fail"}
    />
  );
}
