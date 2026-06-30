import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen, PackageOpen } from "lucide-react";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Card } from "@/frontend/primitives/card";
import { ProductCard } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { EmptyState } from "@/frontend/components/empty-state";
import {
  CapabilitySection,
  CertificationGrid,
  CompanyGallery,
  CompanyOverview,
  CompanyStatistics,
  CompanyTimeline,
  IndustryGrid,
  ManagementMessage,
  MissionVision,
  VendorHero,
  VendorMicrositeLayout,
  VendorSection,
  getCompanyContent,
} from "../../_components/microsite";
import { getPublicVendorProfile, getPublicVendorProducts } from "../../_components/discovery/seed";
import { productDetailHref } from "../../_components/product-detail";

// P-PUB-13 Public Vendor Profile / microsite (Doc-7D §4 · M2.5 foundation + M2.6 company-website content).
// PRESENTATION & COMPOSITION ONLY: anonymous, read-only, binds NO Doc-5 contract. The PUBLIC projection
// of a vendor (Content ≠ Presentation, Inv #9), rendered as a SINGLE page of sections (the frozen
// microsite model — one page, layout_template + profile_sections, atomic publish; NOT multi-page). The
// /vendors/[slug]/{about,industries,capabilities,certifications,products,projects,contact} URLs exist
// only as thin redirect stubs back to this page's section anchors (owner-approved Hybrid). Composes the
// shared kit + the sibling microsite components ONLY — it imports nothing from the Vendor workspace.
//
// GOVERNANCE:
//  • Published-only · byte-equivalent 404 — unknown/draft/unpublished/banned → `notFound()` (Invariant #11).
//  • Capability = the four-flag MATRIX (Invariant #1, via CapabilitySection). The only trust signal is
//    the binary "Verified" badge — NO trust/performance score, NO financial tier, NO turnover, NO
//    verification workflow (Doc-5G R10; certifications are SELF-DECLARED company info, never the badge).
//  • Anonymous intents (Request quote / Contact) route to `(auth)` — never a mutation here.
//  • Company-website content (overview/mission/vision/values/history/management/industries/certifications/
//    stats/gallery) is EDITORIAL presentation stand-in (getCompanyContent) — no frozen field, coins
//    nothing (mirrors the discovery PROFILE_EXTRAS seed). Products = vendor-scoped PUBLISHED catalog
//    ([ESC-7-API-PRODDETAIL]). Projects (frozen showcase_projects) is unwired → honest genuine-empty.
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

  // Vendor-scoped PUBLISHED catalog + editorial company-website content (presentation stand-ins).
  const products = getPublicVendorProducts(slug);
  const content = getCompanyContent(profile);

  return (
    <VendorMicrositeLayout profile={profile} authHref={AUTH_HREF}>
      <VendorHero profile={profile} authHref={AUTH_HREF} />

      <VendorSection id="about" title="About">
        <CompanyOverview
          overview={content.overview}
          businessOverview={content.businessOverview}
          facilities={content.facilities}
        />
      </VendorSection>

      <VendorSection id="statistics" title="At a glance">
        <CompanyStatistics stats={content.stats} />
      </VendorSection>

      <VendorSection id="mission" title="Mission & vision">
        <MissionVision mission={content.mission} vision={content.vision} values={content.values} />
      </VendorSection>

      <VendorSection id="capabilities" title="Capabilities">
        <div className="flex flex-col gap-5">
          <CapabilitySection
            capabilityFlags={profile.capability}
            capabilities={content.capabilities}
          />
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

      <VendorSection
        id="industries"
        title="Industries served"
        description="Sectors this supplier serves."
      >
        <IndustryGrid industries={content.industries} />
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
        {/* showcase_projects is a frozen M2 entity but is not embedded in the public read / not wired —
            honest genuine-empty placeholder, no fabricated projects. */}
        <EmptyState
          icon={<FolderOpen aria-hidden="true" />}
          title="No projects published yet"
          description="This supplier’s project portfolio appears here when published."
        />
      </VendorSection>

      <VendorSection id="gallery" title="Gallery">
        <CompanyGallery gallery={content.gallery} />
      </VendorSection>

      <VendorSection id="history" title="Company history">
        <CompanyTimeline entries={content.history} />
      </VendorSection>

      <VendorSection id="management" title="Message from management">
        <ManagementMessage management={content.management} />
      </VendorSection>

      <VendorSection
        id="certifications"
        title="Certifications & licenses"
        description="Standards and registrations declared by this supplier."
      >
        <CertificationGrid certifications={content.certifications} />
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
