// Documents shared home — P-DOC-05 Generated documents LIST + P-DOC-06 detail (FE-DOC-03 ·
// page_inventory §8A). Pure functions of props (Server Components) rendered BYTE-IDENTICALLY on
// both mounts — the mount passes only its `basePath`. Bind `ops.list_generated_documents.v1` /
// `ops.get_generated_document.v1` (Doc-4F §F7.5) by intent — UNWIRED; the shared seed stands in.
//
// GOVERNANCE:
//  • `DOC-…` human refs; the artifact is a STORAGE REF retrieved via Doc-4B (DF-8) — never an
//    in-row blob; ASYNC generation renders the pending note (never a fabricated link).
//  • Visibility = owning org + granted counterparty ONLY (Doc-2 §10.5); the counterparty grant
//    panel renders `ops.grant/revoke_generated_document.v1` (§F7.4) DISABLED (BC-OPS-4 commands).
//  • `doc_kind` is an AS-PROJECTED string (§F7.3) — labels via the shared label map, no enum coined.
//  • No fabricated totals (GI-03); kind chips derive from the LOADED rows only.

import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { EmptyState } from "@/frontend/components/empty-state";
import { StatusChip } from "@/frontend/components/status-chip";
import { Ref, formatDate } from "@/frontend/components/format";
import { PageHeader } from "../shell";
import { DocumentCollection } from "./document-collection";
import { DocumentActions } from "./document-actions";
import { documentIcon } from "./document-icon-map";
import { generatedKindLabel, type GeneratedDocumentDetailVM } from "./templates-generated-seed";

export interface GeneratedDocumentsViewProps {
  basePath: string;
  documents: GeneratedDocumentDetailVM[];
  /** Kind chips offered — derived by the mount from the LOADED seed rows (no invented taxonomy). */
  kinds: string[];
  activeKind?: string;
}

export function GeneratedDocumentsView({
  basePath,
  documents,
  kinds,
  activeKind,
}: GeneratedDocumentsViewProps) {
  const listBase = `${basePath}/documents/generated`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generated documents"
        description="Documents produced by the template engine for your organization — stored artifacts referenced by storage ref, visible to the owning organization and a granted counterparty only."
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by kind">
        <Button asChild size="sm" variant={!activeKind ? "secondary" : "ghost"}>
          <Link href={listBase} aria-current={!activeKind ? "page" : undefined}>
            All kinds
          </Link>
        </Button>
        {kinds.map((k) => (
          <Button key={k} asChild size="sm" variant={activeKind === k ? "secondary" : "ghost"}>
            <Link
              href={`${listBase}?kind=${k}`}
              aria-current={activeKind === k ? "page" : undefined}
            >
              {generatedKindLabel(k)}
            </Link>
          </Button>
        ))}
      </div>

      <DocumentCollection
        id="generated-documents"
        title="Generated documents"
        description="Versioned outputs — a regenerated document is a new version; prior versions are retained."
      >
        {documents.length === 0 ? (
          activeKind ? (
            <EmptyState
              title="No documents match the current filter"
              description="Clear the kind filter to see every generated document."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href={listBase}>Clear filter</Link>
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No generated documents yet"
              description="Documents appear here once the template engine generates them from your procurement records."
            />
          )
        ) : (
          <ul className="divide-y divide-border">
            {documents.map((d) => {
              const Icon = documentIcon(d.docKind);
              return (
                <li
                  key={d.generatedDocumentId}
                  className="flex flex-wrap items-center gap-3 px-2 py-3"
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`${listBase}/${d.generatedDocumentId}`}
                      className="block truncate text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {d.humanRef}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {generatedKindLabel(d.docKind)}
                      {d.sourceRef ? <> · {d.sourceRef}</> : null}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground" data-numeric>
                    v{d.versionNo}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {formatDate(d.generatedAt)}
                  </span>
                  <DocumentActions documentName={d.humanRef} artifact={d.artifact} />
                </li>
              );
            })}
          </ul>
        )}
      </DocumentCollection>
    </div>
  );
}

export interface GeneratedDocumentDetailViewProps {
  basePath: string;
  document: GeneratedDocumentDetailVM;
}

// P-DOC-06 Generated document detail (T-DETAILS): the §F7.5 read projection + the §F7.4
// counterparty-grant panel (grant/revoke rendered DISABLED — BC-OPS-4 commands, unwired).
export function GeneratedDocumentDetailView({
  basePath,
  document,
}: GeneratedDocumentDetailViewProps) {
  const listBase = `${basePath}/documents/generated`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={document.humanRef}
        description={`${generatedKindLabel(document.docKind)} — generated document. Versioned: a regeneration produces a new version; prior versions are retained.`}
        meta={
          <>
            <Ref>{document.generatedDocumentId}</Ref>
            <StatusChip
              label={document.artifact.isPending ? "Generating" : "Generated"}
              tone={document.artifact.isPending ? "info" : "success"}
            />
          </>
        }
        actions={<DocumentActions documentName={document.humanRef} artifact={document.artifact} />}
      />

      <DocumentCollection id="generated-summary" title="Document">
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Kind</dt>
            <dd className="mt-0.5 text-foreground">{generatedKindLabel(document.docKind)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Version</dt>
            <dd className="mt-0.5 text-foreground" data-numeric>
              v{document.versionNo}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Generated</dt>
            <dd className="mt-0.5 text-foreground">{formatDate(document.generatedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Storage ref</dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-muted-foreground">
              {document.storageRef}
            </dd>
          </div>
          {document.templateVersionId ? (
            <div>
              <dt className="text-xs text-muted-foreground">Template version used</dt>
              <dd className="mt-0.5">
                {document.templateId ? (
                  <Link
                    href={`${basePath}/documents/templates/${document.templateId}`}
                    className="font-mono text-xs text-foreground hover:underline"
                  >
                    {document.templateVersionId}
                  </Link>
                ) : (
                  <Ref>{document.templateVersionId}</Ref>
                )}
              </dd>
            </div>
          ) : null}
          {document.sourceRef ? (
            <div>
              <dt className="text-xs text-muted-foreground">Source</dt>
              <dd className="mt-0.5">
                {document.sourceEngagementId ? (
                  <Link
                    href={`${basePath}/engagements/${document.sourceEngagementId}`}
                    className="text-sm text-foreground hover:underline"
                  >
                    {document.sourceRef}
                  </Link>
                ) : (
                  <Ref>{document.sourceRef}</Ref>
                )}
              </dd>
            </div>
          ) : null}
        </dl>
      </DocumentCollection>

      <DocumentCollection
        id="generated-sharing"
        title="Counterparty sharing"
        description="A generated document is visible to your organization and, when granted, the engagement counterparty — no one else."
        toolbar={
          // Disabled — `ops.grant/revoke_generated_document.v1` are BC-OPS-4 commands (unwired).
          document.sharedWithCounterparty ? (
            <Button size="sm" variant="outline" disabled>
              Revoke access
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              Grant access
            </Button>
          )
        }
      >
        <p className="text-sm text-muted-foreground">
          {document.sharedWithCounterparty
            ? "Shared with the counterparty — an active grant is in place."
            : "Not currently shared — no active counterparty grant."}
        </p>
      </DocumentCollection>

      <div>
        <Button asChild size="sm" variant="ghost">
          <Link href={listBase}>← All generated documents</Link>
        </Button>
      </div>
    </div>
  );
}
