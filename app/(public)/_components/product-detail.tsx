// P-PUB-11 Product Detail (Doc-7D §2.3 · M2.5). PRESENTATION & COMPOSITION ONLY: anonymous, read-only,
// binds NO Doc-5 contract. THE in-search-context product detail — there is NO standalone anonymous
// product page ([ESC-7-API-PRODDETAIL]: `get_product` is a User query, not a Public one; a Public
// projection is unfrozen and may NOT be invented). Per Doc-7D's interim realization, "product
// information renders ONLY from `search_catalog` Public results" — so this is the focused presentation
// of ONE search result, rendered inside `/search`, never a deep `/products/[id]` route.
//
// GOVERNANCE:
//  • PUBLIC projection only (Doc-5D R5/R9): published listing fields only — NO draft content, NO internal
//    metrics (matching/ranking are RFQ-owned), NO buyer-private / CRM / blacklist / banned facts.
//  • FABRICATES NO FIELDS — the public product field schema is unfrozen (Doc-4D names only
//    name/description/images; the read response is undocumented). This shows EXACTLY the fields the
//    search result already carries (name · vendor · category · spec · price · image) and HONESTLY
//    discloses that richer detail awaits the catalog read; it coins no field, spec, MOQ, or lead time.
//  • Route-agnostic — every destination (`vendorHref`, `backHref`, `authHref`, related `href`) is
//    supplied by the route owner; this component only renders links, never builds them. Anonymous
//    intents (Request quote) route to `(auth)`, never a mutation here.
//  • Reuses the shared kit ONLY (kit primitives + components — e.g. Card / Button / Separator /
//    CurrencyDisplay / ResultsGrid / ProductCard); imports nothing from the Vendor workspace.
import Link from "next/link";
import { ArrowLeft, Info, Package, Store } from "lucide-react";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Separator } from "@/frontend/primitives/separator";
import { CurrencyDisplay } from "@/frontend/components/currency-display";
import { ProductCard, type ProductCardVM } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";

/**
 * Canonical link to the in-search-context product detail (single source of truth for the route shape —
 * there is no `/products/[id]`). `q` is carried so "Back to results" returns to the same search.
 */
export function productDetailHref(id: string, opts?: { q?: string }): string {
  const params = new URLSearchParams();
  if (opts?.q) params.set("q", opts.q);
  params.set("product", id);
  return `/search?${params.toString()}`;
}

export interface ProductDetailProps {
  product: ProductCardVM;
  /** The supplier microsite (`/vendors/[slug]`) — route-owner supplied. */
  vendorHref: string;
  /** Return to the search results that this detail was opened from. */
  backHref: string;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
  /** Other PUBLISHED products from the same supplier (each with its own detail href). May be empty. */
  related: { product: ProductCardVM; href: string }[];
}

export function ProductDetail({
  product,
  vendorHref,
  backHref,
  authHref,
  related,
}: ProductDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="-mx-1.5 inline-flex items-center gap-1 self-start rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to results
      </Link>

      <Card>
        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[minmax(0,18rem)_1fr]">
          {/* Decorative product tile (no <img>; mirrors the card's tile, larger) — glyph when imageless. */}
          <div
            aria-hidden="true"
            className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-border bg-muted bg-cover bg-center text-muted-foreground"
            style={product.imageUrl ? { backgroundImage: `url("${product.imageUrl}")` } : undefined}
          >
            {product.imageUrl ? null : <Package className="size-10" />}
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
                {product.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <Link
                  href={vendorHref}
                  className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {product.vendorName}
                </Link>
                {product.category ? ` · ${product.category}` : null}
              </p>
            </div>

            {product.spec ? <p className="text-sm text-foreground">{product.spec}</p> : null}

            <div className="text-xl font-semibold text-foreground">
              {product.price ? (
                <CurrencyDisplay amount={product.price.amount} currency={product.price.currency} />
              ) : (
                <span className="text-base font-medium text-muted-foreground">On request</span>
              )}
            </div>

            {/* Anonymous intents → (auth) / supplier microsite; never a mutation here (Doc-7D §5). */}
            <div className="mt-1 flex flex-wrap gap-2">
              <Button asChild>
                <Link href={authHref}>Request quote</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={vendorHref}>
                  <Store aria-hidden="true" />
                  View supplier
                </Link>
              </Button>
            </div>

            {/* Honest interim disclosure — the deep catalog read is not yet wired ([ESC-7-API-PRODDETAIL]).
                Deliberately does NOT enumerate specific future fields (the public product projection is
                unfrozen); no field is fabricated; this reflects only the supplier's published listing. */}
            <div className="mt-2 flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-base">
              <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>
                More product details are coming soon. The information shown reflects this supplier’s
                published listing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {related.length > 0 ? (
        <section aria-labelledby="more-from-supplier">
          <Separator className="mb-6" />
          <h2 id="more-from-supplier" className="mb-3 text-base font-semibold text-iv-ink-heading">
            More from {product.vendorName}
          </h2>
          <ResultsGrid
            count={related.length}
            columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {related.map(({ product: rp, href }) => (
              <ProductCard key={rp.id} product={rp} href={href} />
            ))}
          </ResultsGrid>
        </section>
      ) : null}
    </div>
  );
}
