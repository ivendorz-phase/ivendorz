// VendorMicrositeHeader (M2.5) — the slim vendor brand bar at the top of the microsite content. This is
// the "vendor-branded presentation" the frozen architecture allows (Doc-7D §4: branding presentation,
// not a chrome replacement) — it sits BELOW the platform public shell header (SiteHeader), never
// replaces it. Persistent vendor identity: logo (avatar/initials) + name + the binary Verified badge +
// the primary anonymous intent. `id="vendor-top"` is the "Home" anchor target for the section nav.
// Reuses the kit; imports nothing from the Vendor workspace. Presentation-only; RSC-friendly.
import Link from "next/link";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { vendorInitials } from "@/frontend/components/vendor-card";
import { VendorVerifiedBadge } from "./vendor-verified-badge";
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface VendorMicrositeHeaderProps {
  profile: PublicVendorProfileVM;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
}

export function VendorMicrositeHeader({ profile, authHref }: VendorMicrositeHeaderProps) {
  return (
    <div
      id="vendor-top"
      className="flex scroll-mt-16 items-center justify-between gap-3 border-b border-border pb-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9 rounded-md">
          <AvatarFallback className="rounded-md text-sm">
            {vendorInitials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-semibold text-iv-ink-heading">
            {profile.name}
          </span>
          <VendorVerifiedBadge verified={profile.verified} />
        </div>
      </div>
      <Button asChild size="sm" className="hidden shrink-0 sm:inline-flex">
        <Link href={authHref}>Request quote</Link>
      </Button>
    </div>
  );
}
