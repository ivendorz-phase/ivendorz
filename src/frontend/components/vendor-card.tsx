// VendorCard (Doc-7B kit, App tier — landing_page_spec §5; promoted from the Public surface after M2.2
// validated its API). PRESENTATION-ONLY, route-agnostic vendor card: a pure Server Component rendering
// the VendorCardVM the surface supplies. ONE canonical implementation shared across every surface —
// differences are expressed via props/slots (href, action), NEVER by forking a Public/Shared variant.
//
// GOVERNANCE: capability = the four-flag MATRIX (Invariant #1) via the shared CapabilityMatrix (compact),
// absent flags shown OFF; the only trust signal is the binary "Verified" badge (M5 public projection,
// absence = no badge, never a "pending" state) — NO numeric/band trust SCORE ([ESC-7G-SCORE-DISPLAY]).
// The VM carries no buyer-private field, so an excluded vendor is byte-identical to any other (Inv #11).
// The optional `businessType` badge is M2's `vendor_type_preset` — a UI PRESET LABEL for display/search,
// NEVER the capability source of truth (the matrix stays authoritative; Doc-6D MK-CR4). `topProducts` is
// an OPTIONAL richer-card slot (M2 catalog names) — absent on lean grids; it never stands in for the matrix.
// `saveSlot`/`action` are route-agnostic interaction slots; auth-gated affordances route to `(auth)`.
import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CapabilityMatrix, type CapabilityFlags } from "./capability-matrix";
import { Card } from "../primitives/card";
import { Button } from "../primitives/button";
import { Badge } from "../primitives/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../primitives/avatar";
import { cn } from "../lib/cn";

/** Vendor directory / showcase card data — a presentation VM, NOT a contract DTO. */
export interface VendorCardVM {
  /** Vendor identity slug (the surface builds the destination href from it). */
  slug: string;
  name: string;
  category: string;
  location?: string;
  /** Verification status (M5 public projection). true → "Verified" badge; absence = no badge. */
  verified?: boolean;
  /** Four-flag capability matrix (Invariant #1) — a matrix, never a label. Absent flags render OFF. */
  capability?: Partial<CapabilityFlags>;
  /** Resolved logo URL; missing → identity fallback (no broken image). */
  logoUrl?: string;
  /** Business-type preset label (M2 `vendor_type_preset`) — a UI/discovery PRESET label, NOT the
   *  capability source of truth (Invariant #1 / Doc-6D MK-CR4). Optional; absence = no badge. The frozen
   *  value SET is a pending additive patch (Doc-4D VendorTypePreset PROPOSAL), so it renders as a plain
   *  presentation label, never a coined enum. */
  businessType?: string;
  /** Up to a few representative product names (M2 catalog) — an OPTIONAL richer-card slot. Lean grids
   *  omit it (matrix only); present cards render a short "Main products" list. Never a capability. */
  topProducts?: readonly string[];
}

/** Two-letter identity initials for the logo fallback (no broken image). */
export function vendorInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export interface VendorCardProps {
  vendor: VendorCardVM;
  /** Destination for the default "View profile" action — surface-supplied (route-agnostic). */
  href?: string;
  /** Footer action slot — overrides the default "View profile". Pass a dual-CTA node (e.g. View
   *  profile + Send RFQ) here; the card asserts no specific action of its own. */
  action?: ReactNode;
  /** Header affordance rendered top-right (e.g. a Save/bookmark control). Auth-gated actions route
   *  to `(auth)` on the anonymous surface — the card only positions the slot, asserts no behavior. */
  saveSlot?: ReactNode;
  className?: string;
}

export function VendorCard({ vendor, href, action, saveSlot, className }: VendorCardProps) {
  const products = vendor.topProducts?.slice(0, 3) ?? [];
  return (
    <Card className={cn("flex h-full flex-col p-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar className="size-11 rounded-lg">
          {vendor.logoUrl ? <AvatarImage src={vendor.logoUrl} alt="" /> : null}
          <AvatarFallback className="rounded-lg bg-iv-brand-600 text-sm font-bold text-white">
            {vendorInitials(vendor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3
            className="line-clamp-2 text-base font-semibold leading-snug text-iv-ink-heading"
            title={vendor.name}
          >
            {vendor.name}
          </h3>
          <p className="truncate text-sm text-iv-navy-700">{vendor.category}</p>
        </div>
        {saveSlot ? <div className="-mr-1 -mt-1 shrink-0">{saveSlot}</div> : null}
      </div>

      {vendor.verified || vendor.businessType || vendor.location ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {vendor.verified ? (
            <Badge variant="success" className="gap-1">
              <ShieldCheck aria-hidden="true" className="size-3" />
              Verified
            </Badge>
          ) : null}
          {vendor.businessType ? (
            <Badge variant="brand" className="normal-case tracking-normal">
              {vendor.businessType}
            </Badge>
          ) : null}
          {vendor.location ? (
            <span className="text-xs text-muted-foreground">{vendor.location}</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3">
        <CapabilityMatrix variant="compact" flags={vendor.capability} />
      </div>

      {products.length > 0 ? (
        <div className="mt-3">
          <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
            Main products
          </p>
          <ul className="mt-1.5 space-y-1">
            {products.map((product) => (
              <li key={product} className="flex items-center gap-2 text-sm text-iv-ink-heading">
                <span
                  aria-hidden="true"
                  className="size-1 shrink-0 rounded-full bg-muted-foreground/50"
                />
                <span className="truncate" title={product}>
                  {product}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {action ? (
        <div className="mt-auto pt-4">{action}</div>
      ) : href ? (
        <div className="mt-auto pt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={href}>
              View profile
              <span className="sr-only"> — {vendor.name}</span>
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
