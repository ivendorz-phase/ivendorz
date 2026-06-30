// Vendor Card — SEC-SUPPLIERS / vendor directory (landing_page_spec §5 · Doc-7D). PRESENTATION-ONLY,
// anonymous, Public projection. A pure Server Component (no hooks, no fetch): renders the VendorCardVM
// the surface supplies and invents nothing.
//
// GOVERNANCE (landing_page_spec §5 / §0.2):
//  • Capability = the four-flag MATRIX (Invariant #1) via the shared kit CapabilityMatrix (compact),
//    absent flags shown OFF, never hidden — never a composite label.
//  • The only public trust signal is the binary "Verified" badge (M5 public projection). An absent
//    badge is ABSENCE, not a "pending"/"unverified" state. No trust SCORE (numeric/band) is rendered
//    here — that rides the M5 embedded trust-badge (Doc-5G), pending [ESC-7G-SCORE-DISPLAY].
//  • Published-only Public projection — no buyer-private field exists; an excluded vendor is byte-
//    identical to any other (Invariant #11; GI-12). Missing logo → identity fallback (no broken image).
import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { Badge } from "@/frontend/primitives/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/frontend/primitives/avatar";
import { CapabilityMatrix } from "@/frontend/components/capability-matrix";
import { cn } from "@/frontend/lib/cn";
import { vendorInitials, type VendorCardVM } from "./view-models";

export interface VendorCardProps {
  vendor: VendorCardVM;
  /**
   * Action slot (N2). When omitted, the card renders the default "View profile" link to the public
   * microsite. The card makes NO assumption about which action belongs here — callers inject their own
   * (e.g. Compare, Add to RFQ) so the card stays generic across directory / search / showcase surfaces.
   */
  action?: ReactNode;
  className?: string;
}

export function VendorCard({ vendor, action, className }: VendorCardProps) {
  return (
    <Card className={cn("flex h-full flex-col p-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar className="size-10 rounded-md">
          {vendor.logoUrl ? <AvatarImage src={vendor.logoUrl} alt="" /> : null}
          <AvatarFallback className="rounded-md text-2xs">
            {vendorInitials(vendor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-iv-ink-heading" title={vendor.name}>
            {vendor.name}
          </h3>
          <p className="truncate text-sm text-iv-navy-700">{vendor.category}</p>
        </div>
        {vendor.verified ? (
          <Badge variant="success" className="shrink-0 gap-1">
            <ShieldCheck aria-hidden="true" className="size-3" />
            Verified
          </Badge>
        ) : null}
      </div>

      {vendor.location ? (
        <p className="mt-2 text-xs text-muted-foreground">{vendor.location}</p>
      ) : null}

      {/* Four-flag capability matrix (Invariant #1) — shared kit component, compact card variant. */}
      <div className="mt-3">
        <CapabilityMatrix variant="compact" flags={vendor.capability} />
      </div>

      <div className="mt-auto pt-4">
        {action ?? (
          <Button asChild variant="outline" size="sm" className="w-full">
            {/* Default action → /vendors/{slug}: the public microsite (P-PUB-13, M2.4). Anonymous read. */}
            <Link href={`/vendors/${vendor.slug}`}>
              View profile
              <span className="sr-only"> — {vendor.name}</span>
            </Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
