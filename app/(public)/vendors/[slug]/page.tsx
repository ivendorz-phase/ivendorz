import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Factory, FolderOpen, PackageOpen } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Card, CardContent } from "@/frontend/primitives/card";
import { CapabilityMatrix } from "@/frontend/components/capability-matrix";
import { ProductCard } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { EmptyState } from "@/frontend/components/empty-state";
import { VendorHero, VendorMicrositeLayout, VendorSection } from "../../_components/microsite";
import { getPublicVendorProfile, getPublicVendorProducts } from "../../_components/discovery/seed";
import { productDetailHref } from "../../_components/product-detail";

// P-PUB-13 Public Vendor Profile / microsite (Doc-7D §4 · M2.5 foundation). PRESENTATION & COMPOSITION
// ONLY: anonymous, read-only, binds NO Doc-5 contract. The PUBLIC projection of a vendor (Content ≠
// Presentation, Inv #9): renders published M2 content as a SINGLE page composed of sections (the frozen
// microsite model — one page, layout_template + profile_sections, atomic publish; NOT multi-page). The
// /vendors/[slug]/{about,products,projects,contact} URLs exist only as thin redirect stubs back to this
// page's section anchors (owner-approved Hybrid; see the M2.5 Flag-and-Halt). Composes the shared kit +
// the sibling microsite components ONLY — it imports nothing from the Vendor workspace (`(app)`).
//
// GOVERNANCE:
//  • Published-only · byte-equivalent 404 — an unknown / draft / unpublished / soft-deleted / banned /
//    buyer-blacklisted vendor renders `notFound()`, byte-identical to genuine absence (Invariant #11).
//  • Capability = the four-flag MATRIX (Invariant #1). The only trust signal is the binary "Verified"
//    badge (absence = no badge, never "pending"). Trust/performance BAND, financial TIER, capacity/
//    turnover are DEFERRED — [ESC-7G-SCORE-DISPLAY] (human Board); never a numeric score (Doc-5G R10).
//  • Anonymous intents (Request quote / Contact) are CTAs that route to `(auth)` — never a mutation here.
//  • Products are the vendor-scoped PUBLISHED catalog; a card opens the in-search product detail
//    ([ESC-7-API-PRODDETAIL] — no standalone anonymous product page). Projects (frozen showcase_projects)
//    and industries are not wired/frozen-on-the-profile → honest genuine-empty placeholders (no fabrication).
const AUTH_HREF = "/login";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) return { title: "Vendor · iVendorz" };
  return {
    title: `${profile.name} · iVendorz`,
    description: profile.about ?? `${profile.name} — ${profile.category} on iVendorz.`,
  };
}

export default async function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) notFound();

  // Vendor-scoped PUBLISHED catalog (public projection accessor — symmetric with the profile read).
  const products = getPublicVendorProducts(slug);

  return (
    <VendorMicrositeLayout profile={profile} authHref={AUTH_HREF}>
      <VendorHero profile={profile} authHref={AUTH_HREF} />

      <VendorSection id="about" title="About">
        {profile.about ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-foreground">{profile.about}</p>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No company overview yet"
            description="This supplier hasn’t published an about section."
          />
        )}
      </VendorSection>

      <VendorSection
        id="products"
        title="Products"
        description="Published products from this supplier."
      >
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
            <ProductCard key={product.id} product={product} href={productDetailHref(product.id)} />
          ))}
        </ResultsGrid>
      </VendorSection>

      <VendorSection
        id="projects"
        title="Projects"
        description="Selected work this supplier has delivered."
      >
        {/* showcase_projects is a frozen M2 entity but is not embedded in the public profile read and is
            not wired — honest genuine-empty placeholder, no fabricated projects. */}
        <EmptyState
          icon={<FolderOpen aria-hidden="true" />}
          title="No projects published yet"
          description="This supplier’s project portfolio appears here when published."
        />
      </VendorSection>

      <VendorSection id="capabilities" title="Capabilities">
        <div className="flex flex-col gap-5">
          <CapabilityMatrix flags={profile.capability} />
          {profile.categories && profile.categories.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Categories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.categories.map((category) => (
                  <Badge key={category} variant="neutral">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </VendorSection>

      <VendorSection id="industries" title="Industries served">
        {/* No "industries served" field exists in the frozen public profile projection — placeholder
            only (no fabrication). See the M2.5 Flag-and-Halt note. */}
        <EmptyState
          icon={<Factory aria-hidden="true" />}
          title="Industries served"
          description="The sectors this supplier serves appear here as part of its published microsite."
        />
      </VendorSection>

      <VendorSection
        id="contact"
        title="Get in touch"
        description="Start a conversation with this supplier on iVendorz."
      >
        <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Send a quote request or contact {profile.name} — you’ll be asked to sign in.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild>
              <Link href={AUTH_HREF}>Request quote</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={AUTH_HREF}>Contact</Link>
            </Button>
          </div>
        </Card>
      </VendorSection>
    </VendorMicrositeLayout>
  );
}
