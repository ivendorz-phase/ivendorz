// Documents shared home — FE-DOC-03 shared PAGE BUILDERS (P-DOC-03..06). The four route mounts per
// workspace (`/buy/documents/{templates,generated}/…` + `/sell/…`) are THIN — each passes its
// `basePath` + raw `searchParams`/`params` here, so both mounts stay byte-identical by
// construction (the WBS "byte-identical via the shared home + shared seed.ts" rule). Allowlisted
// URL params only (the P-BUY-19 pattern — anything unrecognized collapses to All, never an error).
// Unknown ids collapse to the route's not-found boundary (H.9 — absence, never a distinct denial).

import { notFound } from "next/navigation";
import {
  SEED_TEMPLATES,
  SEED_GENERATED_DOCUMENTS,
  TEMPLATE_FORMATS,
  TEMPLATE_STATUSES,
  getSeedTemplate,
  getSeedGeneratedDocument,
  type TemplateFormat,
  type TemplateStatus,
} from "./templates-generated-seed";
import { TemplatesView, TemplateDetailView } from "./templates-view";
import { GeneratedDocumentsView, GeneratedDocumentDetailView } from "./generated-documents-view";

export async function renderTemplatesPage(
  basePath: string,
  searchParams: Promise<{ format?: string; status?: string }>,
) {
  const sp = await searchParams;
  const activeFormat = TEMPLATE_FORMATS.includes(sp.format as TemplateFormat)
    ? (sp.format as TemplateFormat)
    : undefined;
  const activeStatus = TEMPLATE_STATUSES.includes(sp.status as TemplateStatus)
    ? (sp.status as TemplateStatus)
    : undefined;
  let templates = SEED_TEMPLATES;
  if (activeFormat) templates = templates.filter((t) => t.format === activeFormat);
  if (activeStatus) templates = templates.filter((t) => t.status === activeStatus);
  return (
    <TemplatesView
      basePath={basePath}
      templates={templates}
      activeFormat={activeFormat}
      activeStatus={activeStatus}
    />
  );
}

export async function renderTemplateDetailPage(
  basePath: string,
  params: Promise<{ templateId: string }>,
) {
  const { templateId } = await params;
  const template = getSeedTemplate(templateId);
  if (!template) notFound();
  return <TemplateDetailView basePath={basePath} template={template} />;
}

export async function renderGeneratedDocumentsPage(
  basePath: string,
  searchParams: Promise<{ kind?: string }>,
) {
  const sp = await searchParams;
  // Kind chips derive from the LOADED rows only (as-projected strings — no invented taxonomy).
  const kinds = [...new Set(SEED_GENERATED_DOCUMENTS.map((d) => d.docKind))];
  const activeKind = kinds.includes(sp.kind ?? "") ? sp.kind : undefined;
  const documents = activeKind
    ? SEED_GENERATED_DOCUMENTS.filter((d) => d.docKind === activeKind)
    : SEED_GENERATED_DOCUMENTS;
  return (
    <GeneratedDocumentsView
      basePath={basePath}
      documents={documents}
      kinds={kinds}
      activeKind={activeKind}
    />
  );
}

export async function renderGeneratedDocumentDetailPage(
  basePath: string,
  params: Promise<{ documentId: string }>,
) {
  const { documentId } = await params;
  const document = getSeedGeneratedDocument(documentId);
  if (!document) notFound();
  return <GeneratedDocumentDetailView basePath={basePath} document={document} />;
}
