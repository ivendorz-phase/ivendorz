// Presentation view-models for the Public marketplace-discovery surface (Doc-7D · landing_page_spec
// §1.4/§1.5). These are NOT contract DTOs — they are typed presentation props the integration phase
// maps the wired anonymous Public reads onto: `search_catalog` · `list_vendor_directory` ·
// `get_public_vendor_profile` (BC-MKT-6 §8) + the public trust badge (Doc-5G). Zero contract invention.
//
// GOVERNANCE baked into the shapes (landing_page_spec §0.2):
//  • Published-only Public projection — there is NO buyer-private field here, so an excluded/blacklisted
//    vendor is byte-identical to any other (Invariant #11; GI-12). The surface cannot leak an exclusion
//    it never holds.
//  • Capability is the four-flag MATRIX (Invariant #1), never a label.
//  • Trust SCORE (numeric/band) is intentionally ABSENT — it rides the M5 embedded trust-badge
//    (Doc-5G public projection), pending [ESC-7G-SCORE-DISPLAY] / [ESC-7B-TRUSTSCORE]. The only public
//    trust signal carried here is the binary verification status (`verified`); absence = no badge,
//    never a fabricated "pending"/"unverified" state.
//
// GUARDRAIL (N4): these VMs stay PRESENTATION-ONLY. They must NOT evolve into shared business objects
// or contract DTOs. The wired phase MAPS the frozen public reads onto them — it never promotes them
// upward into a domain/contract type.
import type { LucideIcon } from "lucide-react";
import type { CapabilityFlags } from "@/frontend/components/capability-matrix";

/** A price pair carried by the value field (Doc-2 §0.4) — currency is a prop, default BDT, never assumed. */
export interface PriceVM {
  amount: number;
  currency?: string;
}

/** Vendor directory / showcase card (`list_vendor_directory` + `get_public_vendor_profile` projection). */
export interface VendorCardVM {
  /** Public profile slug → /vendors/{slug} (the public microsite, P-PUB-13). */
  slug: string;
  name: string;
  /** Primary category label (presentation text the contract carries). */
  category: string;
  /** Human-readable location (division / district / industrial zone, joined upstream). */
  location?: string;
  /** Verification status (M5 public projection). true → the public "Verified" signal; absence = no badge. */
  verified?: boolean;
  /** Four-flag capability matrix (Invariant #1) — a matrix, never a label. Absent flags render OFF. */
  capability?: Partial<CapabilityFlags>;
  /** Resolved logo URL (file_ref). Missing → identity fallback (no broken image). */
  logoUrl?: string;
}

/** Product result card (`search_catalog` projection — no standalone anon product page, ESC-7-API-PRODDETAIL). */
export interface ProductCardVM {
  id: string;
  name: string;
  /** Supplying vendor (name + public slug for the search-in-context destination). */
  vendorName: string;
  vendorSlug: string;
  category?: string;
  /** Key spec line (e.g. "DN100 · PN16 · CS body"). */
  spec?: string;
  /** Price pair if the contract carries one; absent → "On request" (never fabricated). */
  price?: PriceVM;
  /** Resolved image URL (file_ref); rendered as a decorative tile background. Missing → glyph placeholder. */
  imageUrl?: string;
}

/** Featured category tile (`search_catalog` facet — ESC-7-API-CATNAV interim; curated/static selection). */
export interface CategoryVM {
  slug: string;
  name: string;
  /** Industrial glyph (DP §10 set). Server→server, so the component type is passed directly (no RSC boundary). */
  icon: LucideIcon;
  /** Facet-derived count; omitted when no contract aggregate exists — never client-computed (GI-03/GI-12). */
  count?: number;
}

/** Two-letter identity initials for the logo fallback (no broken image — §5 card edge-cases). */
export function vendorInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
