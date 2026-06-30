// Category Tile — SEC-CATEGORY (landing_page_spec §4 · Doc-7D). PRESENTATION-ONLY, anonymous. A pure
// Server Component: an industrial glyph + name link into the marketplace (facet-scoped).
//
// GOVERNANCE (landing_page_spec §4):
//  • Interim per [ESC-7-API-CATNAV] — full anonymous taxonomy tree is blocked; the featured selection
//    is a curated/static seed and a tile navigates to a `search_catalog` facet view (/marketplace?…).
//  • Single-line label with ellipsis truncation (full name via title); a default industrial glyph
//    renders when a node has no icon. Product counts are OMITTED unless a contract facet supplies them
//    (never client-computed — GI-03/GI-12). Link carries icon + text (never icon/colour alone).
import Link from "next/link";
import { Card } from "@/frontend/primitives/card";
import type { CategoryVM } from "./view-models";

export interface CategoryTileProps {
  category: CategoryVM;
  className?: string;
}

export function CategoryTile({ category, className }: CategoryTileProps) {
  const Icon = category.icon;
  return (
    <Link
      href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card
        className={`flex h-full items-center gap-3 p-4 transition-colors group-hover:border-iv-brand-200 group-hover:bg-iv-brand-50/40 ${className ?? ""}`}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-sm font-semibold text-iv-ink-heading"
            title={category.name}
          >
            {category.name}
          </span>
          {typeof category.count === "number" ? (
            <span className="block text-xs text-muted-foreground">{category.count} listings</span>
          ) : null}
        </span>
      </Card>
    </Link>
  );
}
