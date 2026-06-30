// CompanyGallery (M2.6) — the company photo gallery sections (Factory / Workshop / Machinery / …). The
// public profile read carries NO gallery image URLs (the frozen branding_assets "gallery" asset is not
// wired here), so this renders labelled DECORATIVE placeholder tiles — NO fabricated <img> sources
// (mirrors the product-detail decorative-tile pattern). Presentation-only; genuine-empty when absent.
// Reuses the kit; RSC-friendly.
import { Image as ImageIcon } from "lucide-react";
import type { GalleryItemVM } from "./company-content-seed";

export interface CompanyGalleryProps {
  gallery?: GalleryItemVM[];
}

export function CompanyGallery({ gallery }: CompanyGalleryProps) {
  if (!gallery || gallery.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {gallery.map((item) => (
        <li key={item.label}>
          {/* Decorative placeholder — no fabricated image source. */}
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted text-muted-foreground">
            <ImageIcon aria-hidden="true" className="size-6" />
            <span className="text-xs font-medium text-foreground">{item.label}</span>
            {item.caption ? (
              <span className="px-2 text-center text-2xs">{item.caption}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
