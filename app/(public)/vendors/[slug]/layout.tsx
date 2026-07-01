import type { ReactNode } from "react";
import { VendorMicrositeLayout } from "../../_components/microsite";
import { getVendorOr404 } from "./get-vendor";

// Vendor microsite route-group LAYOUT (M2.7 · realizes ADR-022 / Doc-7D §10.3). Renders the persistent
// vendor chrome (breadcrumb → brand header → sticky route nav → {active page} → CTA band) once, shared across
// all seven pages. Per Doc-7D §10.4 the layout resolves the profile for CHROME ONLY (so the header/nav render
// the vendor identity and an unknown vendor 404s cleanly rather than showing blank chrome); each PAGE resolves
// its own data independently via the same `getVendorOr404` gate (identical byte-equivalent 404 — Invariant #11).
const AUTH_HREF = "/login";

export default async function VendorMicrositeRouteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getVendorOr404(slug);
  return (
    <VendorMicrositeLayout profile={profile} authHref={AUTH_HREF}>
      {children}
    </VendorMicrositeLayout>
  );
}
