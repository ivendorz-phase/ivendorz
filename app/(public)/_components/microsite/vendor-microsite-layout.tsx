// VendorMicrositeLayout (M2.5) — the per-vendor content FRAME for the single-page microsite. It mounts
// INSIDE the (public) shell (which already supplies SiteHeader + SiteFooter, Doc-7C) and composes the
// vendor-branded presentation around the page sections: breadcrumb → brand header → sticky section nav →
// {sections} → closing CTA band. It is presentation only — no chrome replacement, no data fetching here
// (the route owner supplies `profile`). Reuses the kit + sibling microsite components; imports nothing
// from the Vendor workspace. RSC-friendly (the only client piece is the nav's mobile drawer).
import type { ReactNode } from "react";
import { VendorBreadcrumb } from "./vendor-breadcrumb";
import { VendorMicrositeHeader } from "./vendor-microsite-header";
import { VendorMicrositeNavigation } from "./vendor-microsite-navigation";
import { VendorMicrositeFooter } from "./vendor-microsite-footer";
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface VendorMicrositeLayoutProps {
  profile: PublicVendorProfileVM;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
  /** The composed page sections (Hero + VendorSection blocks). */
  children: ReactNode;
}

export function VendorMicrositeLayout({ profile, authHref, children }: VendorMicrositeLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-8 sm:px-6">
      <VendorBreadcrumb name={profile.name} />
      <div className="mt-4">
        <VendorMicrositeHeader profile={profile} authHref={authHref} />
      </div>
      <VendorMicrositeNavigation />
      <div className="mt-8 flex flex-col gap-12">{children}</div>
      <div className="mt-12">
        <VendorMicrositeFooter profile={profile} authHref={authHref} />
      </div>
    </div>
  );
}
