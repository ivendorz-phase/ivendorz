// App component: FileLink (Doc-7B BR10 / Doc-2 §9). Presentation-only. Renders a link to a file
// the surface already resolved from a `file_ref` (e.g. a Supabase Storage signed URL). The kit
// embeds NO binary/blob — only the link + label.
import * as React from "react";
import { Download, Paperclip } from "lucide-react";
import { cn } from "../lib/cn";

export interface FileLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Resolved href for the file_ref (a signed URL the surface obtained). */
  href: string;
  /** File display name. */
  name: string;
  /** Optional human-readable size label (e.g. "1.2 MB") — purely presentational. */
  sizeLabel?: string;
}

export function FileLink({ href, name, sizeLabel, className, ...props }: FileLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent",
        className,
      )}
      {...props}
    >
      <Paperclip className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
      {sizeLabel ? (
        <span className="shrink-0 text-xs text-muted-foreground">{sizeLabel}</span>
      ) : null}
      <Download className="ml-auto size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}
