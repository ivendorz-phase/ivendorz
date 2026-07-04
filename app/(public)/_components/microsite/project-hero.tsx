// ProjectHero (FE-PUB-11) — the above-the-fold media block for a project detail page: a large
// DECORATIVE hero tile (no fabricated <img> source — companion §6.9 R4; real vendor-uploaded photos
// render here once the asset pipeline is wired) with an optional caption chip, and a horizontal
// strip of decorative gallery tiles beneath it. Mirrors the presentation discipline of `VendorHero`
// and `CompanyGallery` (placeholder-tile-first, no fabricated media). Presentation-only; RSC-friendly.
import { Image as ImageIcon, Play } from "lucide-react";
import { cn } from "@/frontend/lib/cn";

export interface ProjectHeroProps {
  /** Decorative caption chip overlaid on the hero tile (e.g. "Precision Welding"). */
  caption?: string;
  /** Decorative gallery-tile captions (no fabricated image sources). */
  galleryLabels?: string[];
}

export function ProjectHero({ caption, galleryLabels }: ProjectHeroProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Hero tile — decorative placeholder until the vendor-asset pipeline is wired (R4). */}
      <div className="relative flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
        <ImageIcon aria-hidden="true" className="size-10" />
        {caption ? (
          // Solid navy (not a translucent overlay) so white text clears WCAG-AA AND axe can resolve
          // the background reliably (a semi-transparent bg over the light tile mis-reads as low-contrast).
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-iv-navy-900 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            <ImageIcon aria-hidden="true" className="size-3.5" />
            {caption}
          </span>
        ) : null}
      </div>

      {galleryLabels && galleryLabels.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Project gallery">
          {galleryLabels.map((label, index) => (
            <li key={label} className="shrink-0">
              <div
                className={cn(
                  "flex aspect-[4/3] w-28 flex-col items-center justify-center gap-1 rounded-md border bg-muted px-1 text-center text-muted-foreground",
                  index === 0 ? "border-iv-navy-700" : "border-border",
                )}
              >
                {index === 0 ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <ImageIcon aria-hidden="true" className="size-4" />
                )}
                <span className="line-clamp-2 text-[11px] font-medium text-foreground">
                  {label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-xs text-muted-foreground">Project media is provided by the supplier.</p>
    </div>
  );
}
