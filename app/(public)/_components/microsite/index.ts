// Public Vendor Microsite foundation (M2.5) — presentation-only components for the single-page,
// anonymous vendor microsite at /vendors/[slug] (P-PUB-13 · Doc-7D §4). The frozen architecture models
// the microsite as ONE page composed of sections inside the (public) shell — there are no sub-routes and
// no per-vendor route chrome; the vendor "navigation" is in-page section anchors and the header/footer
// are vendor-branded CONTENT bands, never a chrome replacement (see the Flag-and-Halt in the M2.5
// report). Reuses the shared kit + the public discovery seed ONLY; imports nothing from the Vendor
// workspace (`app/(app)`). Binds no Doc-5 contract; fabricates no field.
export { VendorMicrositeLayout, type VendorMicrositeLayoutProps } from "./vendor-microsite-layout";
export { VendorMicrositeHeader, type VendorMicrositeHeaderProps } from "./vendor-microsite-header";
export { VendorMicrositeNavigation } from "./vendor-microsite-navigation";
export { VendorMicrositeFooter, type VendorMicrositeFooterProps } from "./vendor-microsite-footer";
export { VendorHero, type VendorHeroProps } from "./vendor-hero";
export { VendorSection, type VendorSectionProps } from "./vendor-section";
export { VendorBreadcrumb, type VendorBreadcrumbProps } from "./vendor-breadcrumb";
export { VendorVerifiedBadge } from "./vendor-verified-badge";

// ── Company-website content (M2.6) — reusable, presentation-only, editorial stand-in (coins nothing). ──
export { CompanyOverview, type CompanyOverviewProps } from "./company-overview";
export { MissionVision, type MissionVisionProps } from "./mission-vision";
export { ManagementMessage, type ManagementMessageProps } from "./management-message";
export { CapabilitySection, type CapabilitySectionProps } from "./capability-section";
export { IndustryGrid, type IndustryGridProps } from "./industry-grid";
export { CertificationGrid, type CertificationGridProps } from "./certification-grid";
export { CompanyGallery, type CompanyGalleryProps } from "./company-gallery";
export { CompanyStatistics, type CompanyStatisticsProps } from "./company-statistics";
export { CompanyTimeline, type CompanyTimelineProps } from "./company-timeline";
export {
  getCompanyContent,
  type VendorCompanyContentVM,
  type CompanyValueVM,
  type CompanyTimelineEntryVM,
  type ManagementMessageVM,
  type CompanyStatVM,
  type CertificationVM,
  type CapabilityAreaVM,
  type GalleryItemVM,
} from "./company-content-seed";
