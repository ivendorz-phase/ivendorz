// E4 Engagement document detail (companion §13.3 → .../documents/[documentId]). Read =
// `ops.get_engagement_document.v1` + `ops.get_generated_document.v1`. Shows the ACTIVE revision plus the
// IMMUTABLE superseded chain (Invariant 8 / [ESC-7B-VERSION-LIST]): each revision is a new version_no;
// nothing is overwritten or hard-deleted. The rendered artifact is a file-link (storage_ref, file_ref
// only — never a blob); ASYNC_PENDING shows "generating…" without gating the record (M-3). "Share with
// buyer" is grant/revoke to the engagement counterparty ONLY (no free-text picker; "confirm intentional
// visibility change" [NIT-C7]). Revise opens the E5 sheet with a mandatory revision_reason [NIT-C9]. All
// actions disabled in the presentation phase. Presentation-only; RSC-friendly.
import { FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { StatusChip } from "@/frontend/components/status-chip";
import { FileLink } from "@/frontend/components/file-link";
import { EmptyState } from "@/frontend/components/empty-state";
import { DOC_KIND_LABEL } from "./document-status-chip";
import { PresentationFormNote } from "../company/presentation-form-note";
import type { EngagementDocumentView } from "./types";

export interface EngagementDocumentDetailProps {
  /** The active revision + the full immutable chain (current first). */
  versions?: EngagementDocumentView[];
}

export function EngagementDocumentDetail({ versions }: EngagementDocumentDetailProps) {
  const active = versions?.find((v) => v.is_active_revision !== false) ?? versions?.[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">
            {active?.kind ? DOC_KIND_LABEL[active.kind] : "Document"}
            {active?.human_ref ? ` · ${active.human_ref}` : ""}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled>
              Share with buyer
            </Button>
            <Button type="button" variant="outline" size="sm" disabled>
              Revise
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {active?.artifact?.href ? (
            <FileLink
              href={active.artifact.href}
              name={active.artifact.name ?? "Rendered document"}
            />
          ) : active?.artifact?.is_pending ? (
            <p className="text-sm text-muted-foreground">
              Document issued — the rendered PDF is still generating. You can leave; it will appear
              here.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No rendered document linked yet.</p>
          )}
          <p className="text-xs text-muted-foreground">
            Sharing grants visibility to the buyer on this engagement only — it never copies or
            transfers the document.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Version history</CardTitle>
        </CardHeader>
        <CardContent>
          {versions && versions.length > 0 ? (
            <ol className="space-y-2">
              {versions.map((version) => {
                const superseded = version.is_active_revision === false;
                return (
                  <li
                    key={version.id}
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                  >
                    <FileText
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        v{version.version_no}
                        {version.revision_reason ? ` · ${version.revision_reason}` : ""}
                      </p>
                      {version.issued_at ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {version.issued_at}
                        </p>
                      ) : null}
                    </div>
                    <StatusChip
                      tone={superseded ? "neutral" : "info"}
                      label={superseded ? "Superseded" : "Current"}
                    />
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState
              title="No versions yet"
              description="Each revision is kept as a new version — earlier versions are never overwritten or deleted."
            />
          )}
          <PresentationFormNote className="mt-4 text-xs text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
