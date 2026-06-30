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
