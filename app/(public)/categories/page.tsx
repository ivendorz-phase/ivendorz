import type { Metadata } from "next";
import Link from "next/link";
import { Package, Wrench, Hammer, MessageSquare } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { CategoryTile } from "@/frontend/components/category-tile";
import { SearchBar } from "@/frontend/components/search-bar";
import { LandingSection } from "@/frontend/components/landing-section";
import { CATEGORY_GROUPS, FEATURED_CATEGORIES } from "../_components/discovery/seed";
import { SupplierShowcase } from "../_components/landing/supplier-showcase";
import { PopularProducts } from "../_components/landing/popular-products";

// P-PUB-07 Categories index (Doc-7D Public surface · landing_page_spec §4; FE-PUB-02 delta). PRESENTATION
// & COMPOSITION ONLY: anonymous, read-only, binds NO Doc-5 contract. Composes the M2.1 CategoryTile (no
// new card type) into an industry-grouped navigation tree, plus a curated "Popular categories" strip, a
// capability-browse section, and the Verified-Suppliers / Popular-Products showcases (all reused kit
// sections — zero duplicate components).
//
// GOVERNANCE: interim per [ESC-7-API-CATNAV] — the full anonymous taxonomy tree is blocked, so the tree
// is a CURATED navigation seed (industries are wayfinding only, NOT a coined corpus taxonomy). Tiles link
// into the real P-PUB-08 category page (/marketplace/category/[slug], FE-PUB-04 delta) — a `search_catalog`
// category-facet read stand-in over the same curated seed. The capability cards below stay a SEPARATE
// honest-interim posture (`/marketplace?capability=…`, not yet consumed by any page — out of FE-PUB-04's
// scope, no search-API change made here). No counts are fabricated (GI-03). "Popular categories" is an
// EDITORIAL curated subset (`FEATURED_CATEGORIES`), never a computed rank (GI-04) — same seed the landing
// page and /marketplace already use, so the "popular" set is consistent site-wide.
const CAPABILITY_CARDS = [
  { key: "can_supply", label: "Supply", description: "Sell or supply goods", icon: Package },
  { key: "can_service", label: "Service", description: "Provide services", icon: Wrench },
  { key: "can_fabricate", label: "Fabricate", description: "Custom fabrication", icon: Hammer },
  {
    key: "can_consult",
    label: "Consult",
    description: "Consulting / advisory",
    icon: MessageSquare,
  },
] as const;
export const metadata: Metadata = {
  title: "Categories · iVendorz",
  description:
    "Browse industrial categories — mechanical, metals, electrical, process, and safety.",
};

export default function CategoriesPage() {
  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
            Browse by category
          </h1>
          <p className="mt-2 max-w-2xl text-iv-ink-secondary">
            Browse industrial categories and jump straight to the suppliers and products you need.
          </p>
          <div className="mt-5 max-w-2xl">
            <SearchBar action="/search" />
          </div>
        </div>
      </section>

      <LandingSection
        id="sec-popular-categories"
        title="Popular categories"
        description="A quick shortlist of frequently sourced categories."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FEATURED_CATEGORIES.map((category) => (
            <CategoryTile
              key={category.slug}
              category={category}
              href={`/marketplace/category/${encodeURIComponent(category.slug)}`}
            />
          ))}
        </div>
      </LandingSection>

      <LandingSection
        id="sec-capability"
        title="Browse by capability"
        description="Every supplier's capability is shown as four independent flags — supply, service, fabrication, and consulting are never combined into one label."
      >
        <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CAPABILITY_CARDS.map((cap) => {
            const Icon = cap.icon;
            return (
              <li key={cap.key}>
                <Link
                  href={`/marketplace?capability=${cap.key}`}
                  className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="flex h-full flex-col gap-2 p-4 transition-colors group-hover:border-iv-brand-200 group-hover:bg-iv-brand-50/40">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-iv-navy-50 text-iv-navy-700">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="text-sm font-semibold text-iv-ink-heading">{cap.label}</span>
                    <span className="text-xs text-muted-foreground">{cap.description}</span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </LandingSection>

      <section
        aria-labelledby="category-tree-heading"
        className="border-b border-border py-12 sm:py-16"
      >
        <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 sm:px-6">
          <h2 id="category-tree-heading" className="sr-only">
            Category navigation
          </h2>
          <div className="flex flex-col gap-10">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.industry}>
                <h3 className="mb-4 text-lg font-semibold tracking-tight text-iv-ink-heading">
                  {group.industry}
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {group.categories.map((category) => (
                    <CategoryTile
                      key={category.slug}
                      category={category}
                      href={`/marketplace/category/${encodeURIComponent(category.slug)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor grouping — verified suppliers across these categories (reuses the showcase section). */}
      <SupplierShowcase />

      {/* Featured products across these categories (reuses the showcase section — no new card type). */}
      <PopularProducts />
    </>
  );
}
