// P-BUY-21 Buyer Letter of intent — view-model. PRESENTATION-ONLY.
//
// A Letter of Intent is a versioned CHILD DOCUMENT of a Procurement Engagement — the same
// `engagement_documents` family as the PO (Doc-4F §F5.4 / Doc-2 §3.5/§10.5). It is ISSUED via
// `ops.issue_engagement_document.v1` with `doc_kind = loi` (§F5.4) and READ via
// `ops.get_engagement_document.v1` (§F5.8). This view-model grounds STRICTLY in those frozen
// contracts and coins nothing the reads do not return (Content ≠ Presentation, Inv #9).
//
// `ops.get_engagement_document.v1` projects (Doc-4F §F5.8 Response Schema):
//   document : { document_id, doc_kind, human_ref, version_no, is_active_revision, storage_ref }
// This view-model carries ONLY those fields:
//   • `document_id`  → `id` (OPAQUE routing id, Inv #5).
//   • `doc_kind`     → pinned to `"loi"` (this page only ever renders an LOI; the enum is frozen §F5.8).
//   • `human_ref`    → `humanRef` ("DOC-…" year-scoped display label; routes use the opaque id).
//   • `version_no`   → `versionNo` (Inv #8 — versioned document; issue = v1, revise appends).
//   • `is_active_revision` → `isActiveRevision` (which revision is the live one; prior versions retained).
//   • `storage_ref`  → `storageRef` (OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only).
//
// DELIBERATELY NOT MODELLED:
//   • The LOI BODY (`content_jsonb`) — its shape is "dev-doc scope" (§F5.4 request), NOT a frozen
//     projection field on the read. No LOI terms / commitments text is coined here.
//   • ANY approval flag — the validation matrix's distinct approval slug (`can_approve_po`) applies to
//     `doc_kind = po` financial approval ONLY; NO LOI approval slug exists in the frozen contract.
//     Modelling one would coin an authorization concept, so the LOI view carries no approval affordance
//     at all (this is the one deliberate divergence from `purchase-order-view-models.ts`).
//   • An enumerated LIST of an engagement's documents — no `list_engagement_documents` read exists
//     (`ESC-7G-ENG-03`); a specific LOI is reachable only by its own `document_id`, never discovered here.
//
// GOVERNANCE:
//   • VERSIONED / IMMUTABLE (Inv #8 / Doc-2 §10.5): an LOI is never overwritten; `revision_reason` is
//     mandatory on revise; superseded versions are retained. This view models the ACTIVE revision.
//   • MONEY BOUNDARY (DF-6 / R8): an LOI is a RECORD only — the platform never holds/moves funds. No
//     pay/settle/escrow affordance exists anywhere on this page.
//   • PARTY-SCOPED (Doc-4F §F5.8 V4 / H.9): a non-party caller collapses to NOT_FOUND, rendered
//     BYTE-IDENTICAL to genuine absence (Inv #11 / GI-12) via `notFound()`. `document_id` is OPAQUE (Inv #5).

/** The `doc_kind` this page renders — pinned to the frozen enum value (Doc-4F §F5.8: loi|po|challan|wcc|…). */
export type LoiDocumentKind = "loi";

export interface LetterOfIntentData {
  /** `engagement_id` — the parent engagement (OPAQUE; the route ancestor for breadcrumbs/back). Inv #5. */
  engagementId: string;
  /** `human_ref` of the parent engagement — a display label for the breadcrumb only (routes use the id). */
  engagementRef?: string;
  /** `document_id` — the LOI's OPAQUE routing id (Inv #5). */
  id: string;
  /** `doc_kind` — pinned "loi" (frozen §F5.8 enum). */
  docKind: LoiDocumentKind;
  /** `human_ref` — year-scoped display ref (e.g. `DOC-2026-000066`). Display-only. */
  humanRef: string;
  /** `version_no` — the ACTIVE revision's version (Inv #8 — versioned; issue = 1, revise appends). */
  versionNo: number;
  /** `is_active_revision` — whether this is the live revision (prior versions retained, never deleted). */
  isActiveRevision: boolean;
  /** `storage_ref` — OPAQUE ref to the BC-OPS-4-rendered artifact; a file-link only (never inlined here). */
  storageRef?: string;
}
