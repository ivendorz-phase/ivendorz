// DownloadCenter (M2.6) — the supplier's downloadable documents (company profile, catalog, brochure,
// certificates, datasheets) as a presentation list. The documents are NOT wired (no file storage in this
// presentation surface), so every action is DISABLED — no fabricated file, no fabricated URL. The list of
// document KINDS is editorial (no frozen field; coins nothing). Presentation-only; genuine-empty when
// absent. Reuses the kit (Card/Button); RSC-friendly.
import { Download, FileText } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import type { DownloadItemVM } from "./company-content-seed";

export interface DownloadCenterProps {
  downloads?: DownloadItemVM[];
}

export function DownloadCenter({ downloads }: DownloadCenterProps) {
  if (!downloads || downloads.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {downloads.map((item) => (
          <li key={item.label}>
            <Card className="h-full">
              <CardContent className="flex items-start gap-3 pt-6">
                <FileText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-iv-navy-700" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                    {item.fileType ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        {item.fileType}
                      </span>
                    ) : null}
                  </p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  ) : null}
                  <div className="mt-3">
                    {/* Disabled — documents are not wired yet (no fabricated file). */}
                    <Button size="sm" variant="outline" disabled>
                      <Download aria-hidden="true" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Documents will be available here.</p>
    </div>
  );
}
