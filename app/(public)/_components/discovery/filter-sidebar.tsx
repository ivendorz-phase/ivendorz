// FilterSidebar — vendor-directory filters (landing_page_spec §5 / Doc-7D). PRESENTATION-ONLY: the
// controls are uncontrolled native checkboxes with NO wiring (the canonical kit controls
// [ESC-7B-SWITCH]/[ESC-7B-SELECT] are pending; live faceting wires to `search_catalog` facets in a
// later wave). A Server Component — labels WRAP their input (no ids), so the sidebar can be rendered
// more than once across breakpoints without duplicate-id collisions.
//
// GOVERNANCE: facets are presentation over the contract facet set — they imply no matching/ranking
// (GI-04) and expose no buyer-private / exclusion signal (Invariant #11; GI-12). The "Apply"/"Clear"
// buttons are inert affordances until the facet read is wired.
import type { ReactNode } from "react";
import { Button } from "@/frontend/primitives/button";
import { Separator } from "@/frontend/primitives/separator";
import { CAPABILITY_FACETS, FEATURED_CATEGORIES } from "./seed";

function FacetCheckbox({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-foreground">
      <input
        type="checkbox"
        className="size-4 shrink-0 rounded accent-iv-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

function FacetGroup({ heading, children }: { heading: string; children: ReactNode }) {
  // <fieldset>/<legend> exposes the group name to AT (WCAG 1.3.1) so the Category vs Capability checkbox
  // sets are distinguishable; the legend keeps the existing uppercase styling. min-w-0 defeats the
  // fieldset min-content default so labels can still truncate.
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="mb-1.5 p-0 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {heading}
      </legend>
      {children}
    </fieldset>
  );
}

export interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  // Presentation only — native uncontrolled form; no submission wiring (the facet read wires later).
  return (
    <form aria-label="Filter vendors" className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-iv-ink-heading">Filters</h2>
        <Button type="reset" variant="ghost" size="sm" className="h-auto px-1.5 py-0.5 text-xs">
          Clear
        </Button>
      </div>

      <Separator className="my-3" />

      <div className="flex flex-col gap-4">
        <FacetGroup heading="Category">
          {FEATURED_CATEGORIES.map((c) => (
            <FacetCheckbox key={c.slug} label={c.name} />
          ))}
        </FacetGroup>

        <FacetGroup heading="Capability">
          {CAPABILITY_FACETS.map((f) => (
            <FacetCheckbox key={f.key} label={f.label} />
          ))}
        </FacetGroup>

        <FacetGroup heading="Verification">
          <FacetCheckbox label="Verified only" />
        </FacetGroup>
      </div>

      <Separator className="my-3" />

      <Button type="submit" size="sm" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}
