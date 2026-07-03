// ProductShowcase (M2.6) — the supplier's PUBLISHED catalog as a presentation showcase: a category
// summary + the anonymous quotation intent + a (disabled) catalog download, above the product grid.
// Products come from the vendor-scoped public read (the seed); each card opens the real standalone
// product detail page (FE-PUB-05, `ESC-7-API-PRODDETAIL` resolved 2026-07-03, RV-0130). The
// "Download catalog" action is DISABLED (no fabricated file). Anonymous intents route to `(auth)`,
// never a mutation here. Presentation-only. Reuses the shared kit + the canonical product URL
// builder ONLY; imports nothing from the Vendor workspace. RSC-friendly.
import Link from "next/link";
import { Download, PackageOpen } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { ProductCard, type ProductCardVM } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { EmptyState } from "@/frontend/components/empty-state";
import { productHref } from "../product-url";

export interface ProductShowcaseProps {
  products: ProductCardVM[];
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
}

export function ProductShowcase({ products, authHref }: ProductShowcaseProps) {
  // Distinct categories present in the published catalog — labels only (no facet read / no count).
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
  );

  return (
    <div className="flex flex-col gap-4">
      {(categories.length > 0 || products.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Badge key={category} variant="neutral">
                {category}
              </Badge>
            ))}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={authHref}>Request quotation</Link>
            </Button>
            {/* Disabled until the catalog file is wired — no fabricated download. */}
            <Button size="sm" variant="outline" disabled>
              <Download aria-hidden="true" />
              Download catalog
            </Button>
          </div>
        </div>
      )}

      <ResultsGrid
        count={products.length}
        columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        empty={
          <EmptyState
            icon={<PackageOpen aria-hidden="true" />}
            title="No products listed yet"
            description="This supplier hasn’t published any products."
          />
        }
      >
        {products.map((product) => (
          // [ESC-7-API-PRODDETAIL]: no anon product page — open the in-search product detail.
          <ProductCard key={product.id} product={product} href={productHref(product)} />
        ))}
      </ResultsGrid>
    </div>
  );
}
