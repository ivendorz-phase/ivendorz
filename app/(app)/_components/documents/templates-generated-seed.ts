// Documents shared home — FE-DOC-03 shared seed (P-DOC-03..06). ONE fixture set for BOTH mounts
// (`/buy/documents/*` + `/sell/documents/*` — the WBS "byte-identical via the shared home + shared
// seed.ts" rule): templates and generated documents are TENANT-OWNED rows (Doc-2 §6 — the active
// org's own), so unlike the hubs' counterparty-flipped engagement fixtures the SAME own-org seed is
// honest on either mount. PRESENTATION ONLY — unwired reads (`ops.list/get_template.v1`,
// `ops.list/get_generated_document.v1`, Doc-4F §F7.5). The row seeds are EMPTY (owner directive
// 2026-07-17: no demo data — a wired read or the empty state); this module now carries the frozen
// vocabulary, view-model types, and label maps only. Row shapes stay so wiring drops in unchanged.
//
// FROZEN VOCABULARY (bound by pointer, never extended):
//  • `format` = the Doc-2 §10.5 FIXED FIVE-format enum `challan|bill|letterhead|quotation|wcc`
//    (Doc-4F §F7.1 verbatim — deliberately NO "po" template format).
//  • template status machine = Doc-2 §5.9 `draft → active → archived` (+ `archived → active`
//    reactivate; `active → active` new-version edit edge via §F7.2).
//  • `template_versions` are IMMUTABLE (Inv #8) — the chain only appends.
//  • `generated_documents` fields per Doc-2:787 (`human_ref DOC-…`, `doc_kind`, `version_no`,
//    `storage_ref`, `generated_by`, `generation_job_id`) + §F7.5 read projection
//    (`template_version_id`, `source_entity_id`). `doc_kind` is an AS-PROJECTED STRING on the wire
//    (§F7.3), NOT an enum — labels via the hubs' label-map convention.
//  • Generated-document refs reuse the established `DOC-2026-…` fixture universe (the hubs'
//    `ENG-2026-000124` family) so the same artifact never appears under two identities.

import type { DocumentArtifactView } from "./document-actions";

/** Doc-2 §10.5 fixed five-format enum — Doc-4F §F7.1 verbatim; never extended. */
export const TEMPLATE_FORMATS = ["challan", "bill", "letterhead", "quotation", "wcc"] as const;
export type TemplateFormat = (typeof TEMPLATE_FORMATS)[number];

/** Display labels for the five frozen formats (labels only — the enum is the authority). */
export const TEMPLATE_FORMAT_LABEL: Record<TemplateFormat, string> = {
  challan: "Challan",
  bill: "Bill",
  letterhead: "Letterhead",
  quotation: "Quotation",
  wcc: "Work Completion Certificate",
};

/** Doc-2 §5.9 Document Template machine states. */
export const TEMPLATE_STATUSES = ["draft", "active", "archived"] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export const TEMPLATE_STATUS_META: Record<
  TemplateStatus,
  { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" | "brand" }
> = {
  draft: { label: "Draft", tone: "neutral" },
  active: { label: "Active", tone: "success" },
  archived: { label: "Archived", tone: "warning" },
};

/** Immutable `template_versions` row (Doc-2 §10.5 — `version_no`; layout/brand jsonb not projected). */
export interface TemplateVersionVM {
  templateVersionId: string;
  versionNo: number;
  addedAt: string;
}

/** `document_templates` row per Doc-2:785 (`format, name, status, current_version_no`). */
export interface DocumentTemplateVM {
  documentTemplateId: string;
  format: TemplateFormat;
  name: string;
  status: TemplateStatus;
  currentVersionNo: number;
  versions: TemplateVersionVM[];
}

/** EMPTY until `ops.list_template.v1` is wired (owner directive 2026-07-17: no demo data — a wired
 *  read or the empty state). Both mounts render `TemplatesView`'s "No document templates yet". */
export const SEED_TEMPLATES: DocumentTemplateVM[] = [];

export function getSeedTemplate(id: string): DocumentTemplateVM | undefined {
  return SEED_TEMPLATES.find((t) => t.documentTemplateId === id);
}

/** `generated_documents` read projection (Doc-2:787 + Doc-4F §F7.5). */
export interface GeneratedDocumentDetailVM {
  generatedDocumentId: string;
  humanRef: string;
  /** AS-PROJECTED string (§F7.3) — never an invented enum. */
  docKind: string;
  versionNo: number;
  /** Bare storage reference — the artifact is retrieved via Doc-4B (DF-8), never an in-row blob. */
  storageRef: string;
  /** Nullable — a generated document may outlive its template version linkage (Doc-2:787). */
  templateVersionId?: string;
  /** The template-version chain rendered for context when the linkage resolves in-seed. */
  templateId?: string;
  /** rfq / quotation / engagement-doc source reference (bare UUID on the wire). */
  sourceEntityId?: string;
  /** Engagement id when the source resolves to an engagement (deep-linkable on both mounts). */
  sourceEngagementId?: string;
  /** Display ref for the source (established fixture universe). */
  sourceRef?: string;
  generatedAt: string;
  /** Counterparty grant currently active (§F7.4) — presentation flag for the sharing panel. */
  sharedWithCounterparty: boolean;
  artifact: DocumentArtifactView;
}

/** EMPTY until `ops.list_generated_document.v1` is wired (same no-demo-data posture as
 *  `SEED_TEMPLATES`); both mounts render `GeneratedDocumentsView`'s "No generated documents yet". */
export const SEED_GENERATED_DOCUMENTS: GeneratedDocumentDetailVM[] = [];

export function getSeedGeneratedDocument(id: string): GeneratedDocumentDetailVM | undefined {
  return SEED_GENERATED_DOCUMENTS.find((d) => d.generatedDocumentId === id);
}

/** Display labels for AS-PROJECTED `doc_kind` strings (the hubs' label-map convention). */
export const GENERATED_KIND_LABEL: Record<string, string> = {
  po: "Purchase Order",
  quotation: "Quotation",
  challan: "Challan",
  letterhead: "Letterhead",
  wcc: "Work Completion Certificate",
  bill: "Bill",
};

export function generatedKindLabel(docKind: string): string {
  return GENERATED_KIND_LABEL[docKind] ?? docKind;
}
