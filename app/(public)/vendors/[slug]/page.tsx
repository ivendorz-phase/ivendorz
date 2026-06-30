import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/frontend/primitives/badge";
import {
  CapabilitySection,
  CertificationGrid,
  CompanyContact,
  CompanyFaq,
  CompanyGallery,
  CompanyOverview,
  CompanyStatistics,
  CompanyTimeline,
  DownloadCenter,
  IndustryGrid,
  ManagementMessage,
  MissionVision,
  ProductShowcase,
  ProjectShowcase,
  VendorHero,
  VendorMicrositeLayout,
  VendorSection,
  WhyChooseUs,
  getCompanyContent,
} from "../../_components/microsite";
import { getPublicVendorProfile, getPublicVendorProducts } from "../../_components/discovery/seed";

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
//  • Anonymous intents (Request quote / Contact / Send RFQ) route to `(auth)` — never a mutation here;
//    direct-contact channels are platform-mediated (sign-in gated — the lead model).
//  • Company-website content (overview/mission/vision/values/why/history/management/industries/
//    certifications/stats/gallery/projects/downloads/faq/contact) is EDITORIAL presentation stand-in
//    (getCompanyContent) — no frozen field, coins nothing (mirrors the discovery PROFILE_EXTRAS seed).
//    Products = vendor-scoped PUBLISHED catalog ([ESC-7-API-PRODDETAIL]). Projects stand in for the frozen
//    `showcase_projects` (unwired) with sector/role "client" descriptors only; downloads are disabled (no
//    fabricated file); gallery/map are decorative placeholders (no fabricated image source).
const AUTH_HREF = "/login";
const MARKETPLACE_HREF = "/marketplace";

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

      <VendorSection id="about" title="Overview">
        <CompanyOverview
          overview={content.overview}
          businessOverview={content.businessOverview}
          facilities={content.facilities}
        />
      </VendorSection>

      <VendorSection id="mission" title="Mission & vision">
        <MissionVision mission={content.mission} vision={content.vision} values={content.values} />
      </VendorSection>

      <VendorSection id="why" title="Why choose us" description="What sets this supplier apart.">
        <WhyChooseUs items={content.whyChooseUs} />
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
        <ProductShowcase products={products} authHref={AUTH_HREF} />
      </VendorSection>

      <VendorSection
        id="projects"
        title="Projects"
        description="Selected work this supplier has delivered."
      >
        <ProjectShowcase projects={content.projects} />
      </VendorSection>

      <VendorSection id="gallery" title="Factory & gallery">
        <CompanyGallery gallery={content.gallery} />
      </VendorSection>

      <VendorSection id="statistics" title="At a glance">
        <CompanyStatistics stats={content.stats} />
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

      <VendorSection id="downloads" title="Downloads">
        <DownloadCenter downloads={content.downloads} />
      </VendorSection>

      <VendorSection id="faq" title="Frequently asked questions">
        <CompanyFaq items={content.faq} />
      </VendorSection>

      <VendorSection
        id="contact"
        title="Get in touch"
        description="Start a conversation with this supplier on iVendorz."
      >
        <CompanyContact
          vendorName={profile.name}
          contact={content.contact}
          authHref={AUTH_HREF}
          marketplaceHref={MARKETPLACE_HREF}
        />
      </VendorSection>
    </VendorMicrositeLayout>
  );
}
