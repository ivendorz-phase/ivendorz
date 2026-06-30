// VendorHero (M2.5 microsite) — the above-the-fold identity band. Renders the PUBLIC vendor projection
// only (Content ≠ Presentation, Inv #9): logo (avatar/initials fallback — no fabricated logo image),
// name, the binary Verified badge, primary category, location, the published "about" as a short
// description, and the two anonymous intents (Request quote / Contact) which route to `(auth)` — never a
// mutation here (Doc-7D §5). Reuses the kit (Avatar/Card/Button) + the shared `vendorInitials`; imports
// nothing from the Vendor workspace. Presentation-only; RSC-friendly.
import Link from "next/link";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { vendorInitials } from "@/frontend/components/vendor-card";
import { VendorVerifiedBadge } from "./vendor-verified-badge";
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface VendorHeroProps {
  profile: PublicVendorProfileVM;
  /** Anonymous-intent destination — routes to `(auth)`, never mutates. */
  authHref: string;
}

export function VendorHero({ profile, authHref }: VendorHeroProps) {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-16 rounded-lg sm:size-20">
            <AvatarFallback className="rounded-lg text-lg sm:text-xl">
              {vendorInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
                {profile.name}
              </h1>
              <VendorVerifiedBadge verified={profile.verified} />
            </div>
            <p className="mt-1 text-sm font-medium text-iv-navy-700">{profile.category}</p>
            {profile.location ? (
              <p className="text-sm text-muted-foreground">{profile.location}</p>
            ) : null}
            {profile.about ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground">
                {profile.about}
              </p>
            ) : null}
          </div>
        </div>

        {/* Anonymous intents → (auth); never mutate here (Doc-7D §5). */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild>
            <Link href={authHref}>Request quote</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={authHref}>Contact</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
