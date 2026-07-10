// ProjectVendorSummaryCard (FE-PUB-11) — the "Executed by" card on a project detail page. A project
// always resolves back to the vendor that delivered it (never an anonymous/standalone case study), so
// this compact card names the vendor, shows ONLY the binary Verified badge (companion §6.9 R1 — NO
// tier/rank badge; public surfaces are trust-firewalled, Inv #6 / R6), renders the vendor's 4-flag
// capability matrix (Invariant #1, reuses the frozen kit component), optional category tags, and a
// link back to the vendor's microsite home. Presentation-only; reuses the kit + shared microsite
// atoms; imports nothing from the Vendor workspace. RSC-friendly.
import Link from "next/link";
import { Card, CardContent } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { CapabilityMatrix } from "@/frontend/components/capability-matrix";
import { VendorVerifiedBadge } from "./vendor-verified-badge";
import type { PublicVendorProfileVM } from "../discovery/seed";

export interface ProjectVendorSummaryCardProps {
  profile: PublicVendorProfileVM;
  /** Vendor microsite home href (built via the canonical vendor URL builder by the caller). */
  vendorHomeHref: string;
  /** Optional category tags for the project (labels only — no facet read, no count). */
  tags?: string[];
  /** Small uppercase eyebrow label (e.g. "Executed by"). */
  eyebrow?: string;
}

export function ProjectVendorSummaryCard({
  profile,
  vendorHomeHref,
  tags,
  eyebrow = "Executed by",
}: ProjectVendorSummaryCardProps) {
  return (
    <Card className="border-l-4 border-l-iv-navy-700">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </p>
            <Link
              href={vendorHomeHref}
              className="mt-1 block truncate text-base font-semibold text-iv-ink-heading hover:underline"
            >
              {profile.name}
            </Link>
          </div>
          {/* Binary Verified only — never a tier/rank badge (§6.9 R1). */}
          <VendorVerifiedBadge verified={profile.verified} />
        </div>

        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {profile.capability ? <CapabilityMatrix flags={profile.capability} /> : null}

        <Link
          href={vendorHomeHref}
          className="text-sm font-medium text-iv-brand-600 underline-offset-2 hover:underline"
        >
          View vendor profile →
        </Link>
      </CardContent>
    </Card>
  );
}
