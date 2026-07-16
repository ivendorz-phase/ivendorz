// CompanyGallery (M2.6) — the company photo gallery sections (Factory / Workshop / Machinery / …). The
// public profile read carries NO gallery image URLs (the frozen branding_assets "gallery" asset is not
// wired here), so this renders labelled DECORATIVE placeholder tiles — NO fabricated <img> sources
// (mirrors the product-detail decorative-tile pattern). Presentation-only; genuine-empty when absent.
// Reuses the kit; RSC-friendly.
// 2026-07-16: the placeholder tile's markup moved to the shared `MediaPlaceholder` (this file was its
// first instance) — same frame, same tokens, same governance posture; only the duplication is gone.
import { MediaPlaceholder } from "../media-placeholder";
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
          <MediaPlaceholder className="aspect-[4/3]" label={item.label} caption={item.caption} />
        </li>
      ))}
    </ul>
  );
}
