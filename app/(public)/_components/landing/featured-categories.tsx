// SEC-CATEGORY + SEC-INDUSTRY — Featured Categories grid + Industry Explorer entry (landing_page_spec
// §4 · Doc-7D). PRESENTATION-ONLY Server Component. Interim per [ESC-7-API-CATNAV]: the full anonymous
// taxonomy tree is blocked, so the featured selection is a CURATED STATIC SEED and each tile/entry
// navigates into a `search_catalog` facet view (/marketplace · /categories, activated in M2.2). No
// taxonomy tree or product counts are fabricated here (GI-03/GI-12).
import Link from "next/link";
import {
  Gauge,
  Layers,
  Zap,
  Cog,
  HardHat,
  FlaskConical,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { LandingSection } from "./landing-section";
import { CategoryTile, type CategoryVM } from "../discovery";

// Curated static seed (editorial featured selection — [ESC-7-API-CATNAV] interim). Counts omitted:
// no public facet-aggregate read is wired, and a count must never be client-computed.
const FEATURED_CATEGORIES: CategoryVM[] = [
  { slug: "valves-fittings", name: "Valves & Fittings", icon: Gauge },
  { slug: "steel-metals", name: "Steel & Metals", icon: Layers },
  { slug: "electrical-drives", name: "Electrical & Drives", icon: Zap },
  { slug: "pumps-motors", name: "Pumps & Motors", icon: Cog },
  { slug: "safety-ppe", name: "Safety & PPE", icon: HardHat },
  { slug: "chemicals", name: "Chemicals", icon: FlaskConical },
];

export function FeaturedCategories() {
  return (
    <LandingSection
      id="sec-category"
      title="Browse industrial categories"
      description="Source across the industrial taxonomy — from valves and steel to electrical drives, pumps, and safety."
      viewAllHref="/categories"
      viewAllLabel="All categories"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FEATURED_CATEGORIES.map((category) => (
          <CategoryTile key={category.slug} category={category} />
        ))}
      </div>

      {/* SEC-INDUSTRY — Industry Explorer entry; opens the full Industrial Category Explorer (M2.2). */}
      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-iv-navy-50/40 p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-iv-navy-100 text-iv-navy-700">
            <LayoutGrid aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-iv-ink-heading">
              Explore the full category tree
            </p>
            <p className="text-xs text-muted-foreground">
              Drill through industries, categories, and specialisations to find the right suppliers.
            </p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm" className="gap-1.5">
          <Link href="/categories">
            Open category explorer
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </Card>
    </LandingSection>
  );
}
