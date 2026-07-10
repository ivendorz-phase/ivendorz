// RFQ WORKFLOW — Adapter seam (THE swap point).
//
// Every RFQ workflow page imports `rfqWorkflowData` from here and nowhere else. Today it is the
// mock adapter (presentation phase). AT WIRING (Wave 4): replace the assignment below with the
// GI-02 server data layer (own-org scoped `list_rfqs`/`get_rfq`/… resolvers mapping frozen Doc-5E
// DTOs onto the presentation view-models) — pages and views do not change. Server Components only:
// the browser never calls a Doc-5 contract and never sets `Iv-Active-Organization` (Inv #5 /
// Doc-7C SR3).

import type { RfqWorkflowData } from "./types";
import { mockRfqWorkflowData } from "./mock";

export type { RfqWorkflowData, BuyerRfqWorkflowReads, VendorRfqWorkflowReads } from "./types";

/** The active workflow data source — mock today, the wired server layer at Wave 4. */
export const rfqWorkflowData: RfqWorkflowData = mockRfqWorkflowData;
