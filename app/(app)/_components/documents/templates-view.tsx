// Documents shared home — P-DOC-03 Document templates LIST (FE-DOC-03 · T-LISTING · page_inventory
// §8A). Pure function of props (Server Component; no hooks) rendered BYTE-IDENTICALLY on both
// mounts (`/buy/documents/templates` + `/sell/documents/templates`) — the mount passes only its
// `basePath`. Binds `ops.list_templates.v1` (Doc-4F §F7.5) by intent — UNWIRED; the shared seed
// stands in. Templates are OWN-ORG rows (Doc-2 §6): no counterparty, no cross-org row, no count.
//
// GOVERNANCE:
//  • `format` chips = the FIXED FIVE-format enum verbatim (Doc-4F §F7.1 — no PO template, ever).
//  • status chips = the Doc-2 §5.9 machine states verbatim.
//  • "New template" (`ops.create_template.v1`) is RENDERED BUT DISABLED — commands are owned by
//    BC-OPS-4; presentation invokes nothing (the console-wide disabled-honest convention).
//  • Row-list composition via kit primitives (the FE-SH-01 kit-primitive-rows fallback, documented
//    in the vendor hub) — no table element, no new primitive, no duplicated workspace table.

import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { Ref, formatDate } from "@/frontend/components/format";
import { PageHeader } from "../shell";
import { DocumentCollection } from "./document-collection";
import { documentIcon } from "./document-icon-map";
import {
  TEMPLATE_FORMATS,
  TEMPLATE_FORMAT_LABEL,
  TEMPLATE_STATUSES,
  TEMPLATE_STATUS_META,
  type DocumentTemplateVM,
  type TemplateFormat,
  type TemplateStatus,
} from "./templates-generated-seed";

export interface TemplatesViewProps {
  /** Workspace mount (`/buy` | `/sell`) — the ONLY thing that differs between the two mounts. */
  basePath: string;
  templates: DocumentTemplateVM[];
  activeFormat?: TemplateFormat;
  activeStatus?: TemplateStatus;
}

export function TemplatesView({
  basePath,
  templates,
  activeFormat,
  activeStatus,
}: TemplatesViewProps) {
  const listBase = `${basePath}/documents/templates`;
  const chipHref = (format?: TemplateFormat, status?: TemplateStatus) => {
    const params = new URLSearchParams();
    if (format) params.set("format", format);
    if (status) params.set("status", status);
    const qs = params.toString();
    return qs ? `${listBase}?${qs}` : listBase;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document templates"
        description="Your organization's branded templates for generated documents — five fixed formats. New versions are added to a template; prior versions are always retained."
        actions={
          // Disabled — `ops.create_template.v1` is a BC-OPS-4 command (unwired; presentation only).
          <Button size="sm" disabled>
            New template
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by format">
        <Button asChild size="sm" variant={!activeFormat ? "secondary" : "ghost"}>
          <Link
            href={chipHref(undefined, activeStatus)}
            aria-current={!activeFormat ? "page" : undefined}
          >
            All formats
          </Link>
        </Button>
        {TEMPLATE_FORMATS.map((f) => (
          <Button key={f} asChild size="sm" variant={activeFormat === f ? "secondary" : "ghost"}>
            <Link
              href={chipHref(f, activeStatus)}
              aria-current={activeFormat === f ? "page" : undefined}
            >
              {TEMPLATE_FORMAT_LABEL[f]}
            </Link>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
        <Button asChild size="sm" variant={!activeStatus ? "secondary" : "ghost"}>
          <Link
            href={chipHref(activeFormat, undefined)}
            aria-current={!activeStatus ? "page" : undefined}
          >
            All statuses
          </Link>
        </Button>
        {TEMPLATE_STATUSES.map((s) => (
          <Button key={s} asChild size="sm" variant={activeStatus === s ? "secondary" : "ghost"}>
            <Link
              href={chipHref(activeFormat, s)}
              aria-current={activeStatus === s ? "page" : undefined}
            >
              {TEMPLATE_STATUS_META[s].label}
            </Link>
          </Button>
        ))}
      </div>

      <DocumentCollection
        id="templates"
        title="Templates"
        description="Own-organization templates only. Statuses follow the frozen template lifecycle: Draft → Active → Archived (an archived template can be reactivated)."
      >
        {templates.length === 0 ? (
          activeFormat || activeStatus ? (
            <EmptyState
              title="No templates match the current filters"
              description="Clear the format or status filter to see every template."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href={listBase}>Clear filters</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No document templates yet"
              description="Templates define the branded layout used when documents are generated."
            />
          )
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((t) => {
              const Icon = documentIcon(t.format);
              const meta = TEMPLATE_STATUS_META[t.status];
              return (
                <li key={t.documentTemplateId}>
                  <Link
                    href={`${listBase}/${t.documentTemplateId}`}
                    className="flex flex-wrap items-center gap-3 rounded-md px-2 py-3 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {t.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {TEMPLATE_FORMAT_LABEL[t.format]}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground" data-numeric>
                      v{t.currentVersionNo}
                    </span>
                    <StatusChip label={meta.label} tone={meta.tone} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </DocumentCollection>
    </div>
  );
}

export interface TemplateDetailViewProps {
  basePath: string;
  template: DocumentTemplateVM;
}

// P-DOC-04 Template detail & versions (T-DETAILS). The IMMUTABLE `template_versions` chain
// (Inv #8) newest-first; lifecycle affordances render ONLY the single next legal §5.9 edge
// (the FE-VEN-08 single-next-legal-edge convention) and are DISABLED — `ops.activate/archive/
// reactivate_template.v1` + `ops.add_template_version.v1` are BC-OPS-4 commands (unwired).
export function TemplateDetailView({ basePath, template }: TemplateDetailViewProps) {
  const listBase = `${basePath}/documents/templates`;
  const meta = TEMPLATE_STATUS_META[template.status];
  // Single next legal edge (Doc-2 §5.9): draft → Activate · active → Archive · archived → Reactivate.
  const nextEdgeLabel =
    template.status === "draft"
      ? "Activate"
      : template.status === "active"
        ? "Archive"
        : "Reactivate";
  const versions = [...template.versions].sort((a, b) => b.versionNo - a.versionNo);

  return (
    <div className="space-y-6">
      <PageHeader
        title={template.name}
        description={`${TEMPLATE_FORMAT_LABEL[template.format]} template — versions are immutable; an edit adds a new version and prior versions are retained.`}
        meta={
          <>
            <Ref>{template.documentTemplateId}</Ref>
            <StatusChip label={meta.label} tone={meta.tone} />
          </>
        }
        actions={
          <>
            {/* Disabled — `ops.add_template_version.v1` (legal on an active template only). */}
            {template.status === "active" ? (
              <Button size="sm" variant="outline" disabled>
                Add version
              </Button>
            ) : null}
            {/* Disabled — the single next legal §5.9 lifecycle edge (BC-OPS-4 command). */}
            <Button size="sm" disabled>
              {nextEdgeLabel}
            </Button>
          </>
        }
      />

      <DocumentCollection
        id="template-summary"
        title="Template"
        description="Own-organization template record."
      >
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Format</dt>
            <dd className="mt-0.5 text-foreground">{TEMPLATE_FORMAT_LABEL[template.format]}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-0.5">
              <StatusChip label={meta.label} tone={meta.tone} />
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Current version</dt>
            <dd className="mt-0.5 text-foreground" data-numeric>
              v{template.currentVersionNo}
            </dd>
          </div>
        </dl>
      </DocumentCollection>

      <DocumentCollection
        id="template-versions"
        title="Version history"
        description="Immutable revision chain — versions are only ever appended, never overwritten. Generated documents record the exact version they used."
      >
        <ul className="divide-y divide-border">
          {versions.map((ver) => (
            <li key={ver.templateVersionId} className="flex flex-wrap items-center gap-3 px-2 py-3">
              <span className="text-sm font-medium text-foreground" data-numeric>
                v{ver.versionNo}
              </span>
              <Ref>{ver.templateVersionId}</Ref>
              <span className="ml-auto text-xs text-muted-foreground">
                Added {formatDate(ver.addedAt)}
              </span>
              {ver.versionNo === template.currentVersionNo ? (
                <StatusChip label="Current" tone="info" />
              ) : (
                <StatusChip label="Retained" tone="neutral" />
              )}
            </li>
          ))}
        </ul>
      </DocumentCollection>

      <div>
        <Button asChild size="sm" variant="ghost">
          <Link href={listBase}>← All templates</Link>
        </Button>
      </div>
    </div>
  );
}
