// Product Card — SEC-PRODUCTS / catalog results (landing_page_spec §6 · Doc-7D). PRESENTATION-ONLY,
// anonymous, Public projection. A pure Server Component: renders the ProductCardVM the surface supplies.
//
// GOVERNANCE (landing_page_spec §6):
//  • Interim per [ESC-7-API-PRODDETAIL] — there is NO standalone anonymous product-detail page. The
//    whole card opens the result IN CONTEXT: the supplier's public microsite (/vendors/{slug}).
//  • Price is the {amount, currency} pair the field carries, rendered via the kit CurrencyDisplay
//    (default BDT, never hardcoded). Absent price → "On request" — never a fabricated number (GI-08).
//  • "Popular" selection is curated/facet-backed, never labelled "Recommended" (no computed signal).
// The product image is a decorative tile background (no <img> element); missing image → glyph placeholder.
import Link from "next/link";
import { Package } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { cn } from "@/frontend/lib/cn";
import type { ProductCardVM } from "./view-models";

export interface ProductCardProps {
  product: ProductCardVM;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Card className={cn("flex h-full flex-col overflow-hidden p-0", className)}>
      <Link
        href={`/vendors/${product.vendorSlug}`}
        className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Decorative product image (background — no <img>); glyph placeholder when absent. */}
        <div
          aria-hidden="true"
          className="flex aspect-[4/3] w-full items-center justify-center border-b border-border bg-muted bg-cover bg-center text-muted-foreground"
          style={product.imageUrl ? { backgroundImage: `url("${product.imageUrl}")` } : undefined}
        >
          {product.imageUrl ? null : <Package className="size-8" />}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-iv-ink-heading">{product.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {product.vendorName}
            {product.category ? ` · ${product.category}` : null}
          </p>
          {product.spec ? (
            <p className="truncate text-xs text-muted-foreground">{product.spec}</p>
          ) : null}
          <div className="mt-auto pt-2 text-sm font-semibold text-foreground">
            {product.price ? (
              <CurrencyDisplay amount={product.price.amount} currency={product.price.currency} />
            ) : (
              <span className="font-medium text-muted-foreground">On request</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
