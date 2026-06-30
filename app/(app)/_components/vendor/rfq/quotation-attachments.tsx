// S4 Quote Authoring · Section 5 — ATTACHMENTS (companion §13.1). Binds the frozen field by its exact
// name `attachments_refs : uuid[]` (optional, 0..N [m-2]). Files are file_ref-only — links to Supabase
// Storage, never blobs through the API (§7.6). Upload is DEFERRED in this milestone (Submit would be
// gated on every upload being committed [N-Q3]); the add control is disabled with an honest note.
// Presentation-only; RSC-friendly.
import { Paperclip } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { FileLink } from "@/frontend/components/file-link";
import type { FileRefView } from "./types";

export interface QuotationAttachmentsProps {
  attachments?: FileRefView[];
}

export function QuotationAttachments({ attachments }: QuotationAttachmentsProps) {
  const files = (attachments ?? []).filter((file) => file.href);

  return (
    <div className="space-y-4">
      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={file.href} className="flex items-center gap-2">
              <Paperclip aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              <FileLink href={file.href as string} name={file.name ?? `Attachment ${index + 1}`} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          <Paperclip aria-hidden="true" className="size-4 shrink-0" /> No attachments added
        </div>
      )}
      <Button type="button" variant="outline" size="sm" disabled>
        Add attachment
      </Button>
      <p className="text-xs text-muted-foreground">
        Uploads connect in the integration phase. Submitting requires every attachment to be
        uploaded first.
      </p>
    </div>
  );
}
