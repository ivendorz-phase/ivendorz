import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { PublicPageHead } from "../_components/public-page-head";
import { PricingPlans } from "./pricing-plans";
import { Container } from "@/frontend/components/container";

// Public pricing route (`/pricing`) — P-PUB-04 (Doc-7D Public surface · T-STATIC · TB-NONE;
// screen_specifications §P-PUB-04, journey J-GST-01). A SERVER COMPONENT mounted in the Doc-7C
// `(public)` shell (layout.tsx adds header + footer). ROUTING + COMPOSITION ONLY.
//
// SCOPE: PRESENTATION & COMPOSITION ONLY — anonymous, static/SSG-friendly + SEO-indexable, binds NO Doc-5
// contract and fabricates no data. Markets the plans (the `list_plans` public marketing read) to drive
// sign-up; the interactive billing-cycle toggle + cards live in the `PricingPlans` client island. Features
// are marketed as entitlement VALUES, never gated by plan name (Invariant #10), and no plan influences RFQ
// matching, routing, or award (Doc-3 §11.8 — the moat). This page owns the single `<h1>`.
export const metadata = {
  title: "Pricing & plans — iVendorz",
  description:
    "Simple, transparent plans for industrial procurement teams in Bangladesh. Source, compare, and award with verified suppliers.",
};

export default function PricingPage() {
  return (
    <>
      {/* Marketing header. */}
      {/* Page head — the shared `.pghead`. The reference's own pricing screen opens with a plain
          centered header instead of the band; this page takes the band anyway so all 20 public pages
          open identically — an inconsistent chrome on one page would read as a defect, and
          `visual_reference_implementation.md` §4 puts consistency with the sibling surfaces above
          fidelity to a single reference screen. Copy unchanged. */}
      <PublicPageHead
        eyebrow="Pricing & plans"
        crumbs={[{ label: "Pricing" }]}
        title="Simple, transparent pricing"
        description="Pick the plan that fits your procurement team. Every plan runs the full RFQ-to-award workflow — plans only set your platform features and quotas."
      />

      {/* Plans. */}
      <section className="bg-muted/30">
        <Container className="py-14">
          <PricingPlans />

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
            Plans set your platform features and quotas. They never affect RFQ matching, routing, or
            awards — sourcing is governed the same way on every plan.
          </p>
        </Container>
      </section>

      {/* Closing CTA → sign-up. */}
      <section className="border-t border-border bg-background">
        <Container className="py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-iv-ink-heading sm:text-3xl">
            Ready to source with confidence?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-iv-ink-secondary">
            Create an account to start your first RFQ and invite verified suppliers.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/marketplace">Explore the marketplace</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
