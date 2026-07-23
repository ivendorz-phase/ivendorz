// My Vendor Directory — Products & Services (owner directive D5). PRESENTATION-ONLY, server-render-
// friendly (no hooks — a pure function of props).
//
// ONE shared presentation for both vendor kinds:
//   • Marketplace (linked): offerings are COMPOSED FROM THE M2 PUBLIC PROFILE at read time — read-only,
//     header "Products & Services · Source: Vendor profile" (never "Core" without an authoritative M2
//     core flag, MINOR-3), a link to the full public portfolio. NEVER copied into the private record
//     (Content ≠ Presentation, Inv #9).
//   • Private (buyer-maintained): header "Core Products & Services" (the buyer curates the ≤10 list),
//     each offering CATEGORY-MATCHED (confirmed) or TEXT-ONLY. Confirmed category ids are DISPLAY only —
//     no M2 category id is persisted in M4 (D5 boundary; `ESC-VENDIR-FIELDS` R5).
// Provenance is always visible: Vendor profile · Buyer maintained · Text only.

import Link from "next/link";
import { ExternalLink, Info, Package } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { EmptyState } from "@/frontend/components/empty-state";
import { cn } from "@/frontend/lib/cn";
import { categoryName, MAX_OFFERINGS } from "./offerings";
import type { DirectoryOffering } from "./working-model";

export interface ProductsServicesProps {
  offerings: readonly DirectoryOffering[];
  source: "marketplace" | "buyer";
  /** Linked profile slug — enables the "View full public portfolio" link (marketplace source only). */
  profileSlug?: string;
}

function OfferingProvenance({
  source,
  offering,
}: {
  source: "marketplace" | "buyer";
  offering: DirectoryOffering;
}) {
  if (source === "marketplace") {
    return <Badge variant="brand">Vendor profile</Badge>;
  }
  if (offering.textOnly) {
    return (
      <Badge variant="neutral" className="bg-transparent">
        Text only
      </Badge>
    );
  }
  return <Badge variant="neutral">Buyer maintained</Badge>;
}

export function ProductsServices({ offerings, source, profileSlug }: ProductsServicesProps) {
  const isMarketplace = source === "marketplace";
  const over = offerings.length > MAX_OFFERINGS;

  return (
    <section aria-label="Products and services" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            {isMarketplace ? "Products & Services" : "Core Products & Services"}
          </h3>
          {isMarketplace ? (
            <p className="text-xs text-muted-foreground">Source: Vendor profile</p>
          ) : null}
        </div>
        <span
          className={cn(
            "rounded-full bg-muted px-2 py-0.5 text-2xs font-semibold tabular-nums",
            over ? "bg-iv-danger-subtle text-iv-danger-muted" : "text-muted-foreground",
          )}
        >
          {offerings.length} of {MAX_OFFERINGS}
        </span>
      </div>

      {offerings.length === 0 ? (
        <EmptyState
          icon={<Package aria-hidden />}
          title="No products or services recorded"
          className="py-8"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {offerings.map((offering, index) => {
            const category = categoryName(offering.categoryId);
            const excess = over && index >= MAX_OFFERINGS;
            return (
              <li
                key={offering.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2",
                  excess && "border-iv-danger-base bg-iv-danger-subtle",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{offering.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {offering.textOnly ? (
                      <span>Descriptive · no system category</span>
                    ) : category ? (
                      <span className="text-iv-navy-700">{category}</span>
                    ) : (
                      <span>—</span>
                    )}
                  </p>
                </div>
                <OfferingProvenance source={source} offering={offering} />
              </li>
            );
          })}
        </ul>
      )}

      {isMarketplace && profileSlug ? (
        <Link
          href={`/vendors/${profileSlug}`}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-iv-navy-700 hover:underline"
        >
          View full public portfolio
          <ExternalLink aria-hidden className="size-3.5" />
        </Link>
      ) : null}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {isMarketplace
          ? "Composed from the current marketplace profile at read time — never copied into your private record."
          : "Category matching is presentation-only: no marketplace category id is stored on the private record (gated, ESC-VENDIR-FIELDS R5)."}
      </p>
    </section>
  );
}
