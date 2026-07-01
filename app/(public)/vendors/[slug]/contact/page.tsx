import type { Metadata } from "next";
import {
  CompanyContact,
  VendorPageHeading,
  VendorSection,
  getCompanyContent,
} from "../../../_components/microsite";
import { getPublicVendorProfile } from "../../../_components/discovery/seed";
import { getVendorOr404 } from "../get-vendor";

// Vendor Microsite — CONTACT page (M2.7 · ADR-022 / Doc-7D §10). Address + business hours (editorial, open);
// phone/email/website are platform-mediated ("Sign in to view" — the lead model, avoids fabricating details);
// decorative map placeholder; Send-RFQ / Request-callback → (auth); Visit-marketplace-profile → public nav.
// Presentation-only — no form submission, no mutation.
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
    title: `Contact · ${profile.name} · iVendorz`,
    description: `Get in touch with ${profile.name} on iVendorz.`,
  };
}

export default async function VendorContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  const content = getCompanyContent(profile);

  return (
    <>
      <VendorPageHeading title="Contact" subtitle={profile.name} />

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
    </>
  );
}
