import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilterSidebar } from "@/frontend/components/filter-sidebar";
import { VendorCard } from "@/frontend/components/vendor-card";
import { ProductCard } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { PaginationControl } from "@/frontend/components/pagination-control";
import { cn } from "@/frontend/lib/cn";
import {
  VENDORS,
  PRODUCTS,
  CATEGORY_GROUPS,
  VENDOR_FACETS,
} from "../../../_components/discovery/seed";
import { productDetailHref } from "../../../_components/product-detail";

// P-PUB-08 Category page (Doc-7D Public surface · FE-PUB-04). PRESENTATION & COMPOSITION ONLY: anonymous,
// read-only, binds NO Doc-5 contract. Drill-down from a category tile (/categories, /marketplace) into the
// vendors and products carrying that category — an exact-match read over the same curated discovery seed
// used by /search and /vendors, standing in for a `search_catalog` category-facet read under the
// registered interim [ESC-7-API-CATNAV] (disclosed in-page, honest not-yet-wired note). Reuses the M2.1 kit
// (VendorCard/ProductCard/FilterSidebar/ResultsGrid/PaginationControl) — no new card type, no new
// primitive, no kit/token change. An unknown slug 404s byte-identically (Invariant #11).
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.categories);

function findCategory(slug: string) {
  return ALL_CATEGORIES.find((c) => c.slug === slug);
}

type SearchParams = { tab?: string };

const TABS = [
  { key: "vendors", label: "Vendors" },
  { key: "products", label: "Products" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return { title: "Category · iVendorz" };
  return {
    title: `${category.name} · iVendorz`,
    description: `Browse ${category.name} suppliers and products on iVendorz.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const activeTab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : "vendors";

  // INTERIM stand-in for a `search_catalog` category-facet read: an exact-match filter over the curated
  // seed (not a substring search — the category is already selected). Replaced wholesale when wired.
  const vendors = VENDORS.filter((v) => v.category === category.name);
  const products = PRODUCTS.filter((p) => p.category === category.name);

  const tabHref = (tab: string) => `/marketplace/category/${slug}?tab=${tab}`;

  return (
    <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">
          <Link href="/marketplace" className="rounded-sm hover:text-foreground hover:underline">
            Marketplace
          </Link>
          {" / "}
          <Link href="/categories" className="rounded-sm hover:text-foreground hover:underline">
            Categories
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-iv-ink-secondary">
          Verified suppliers and products in {category.name}.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Live catalog search is coming soon — showing example listings for this category.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-20">
            <FilterSidebar facets={VENDOR_FACETS} label="Filter category results" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <nav
            aria-label="Result type"
            className="mb-4 inline-flex h-9 items-center justify-center gap-1 rounded-md bg-muted p-1"
          >
            {TABS.map((t) => {
              const active = t.key === activeTab;
              return (
                <Link
                  key={t.key}
                  href={tabHref(t.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-card text-foreground shadow-iv-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {activeTab === "vendors" ? (
            <ResultsGrid
              count={vendors.length}
              columnsClassName="grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              footer={<PaginationControl hasMore hasPrevious={false} />}
            >
              {vendors.map((v) => (
                <VendorCard key={v.slug} vendor={v} href={`/vendors/${v.slug}`} />
              ))}
            </ResultsGrid>
          ) : (
            <ResultsGrid
              count={products.length}
              columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              footer={<PaginationControl hasMore hasPrevious={false} />}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} href={productDetailHref(p.id)} />
              ))}
            </ResultsGrid>
          )}
        </div>
      </div>
    </div>
  );
}
