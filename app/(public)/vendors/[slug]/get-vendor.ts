// Shared vendor loader for the multi-page microsite (M2.7 · realizes ADR-022 / Doc-7D §10.4). Every page
// resolves its OWN data (Board ruling: data load is per-page, not centralized in the layout) — but they all
// go through this ONE helper so the published-only 404 is byte-equivalent on every route (Invariant #11, no
// divergence). `getVendorOr404` throws Next's `notFound()` for an unknown / unpublished / banned vendor; the
// non-throwing `getPublicVendorProfile` stays the read for `generateMetadata` (which must not 404). When the
// public read is wired, request-level memoization dedups the repeated resolve across layout + page.
import { notFound } from "next/navigation";
import {
  getPublicVendorProfile,
  type PublicVendorProfileVM,
} from "../../_components/discovery/seed";

/** Resolve a vendor's public profile or render the byte-equivalent 404. Used by the route-group layout (for
 *  chrome) and by every page (for its own content) — one 404 gate, identical semantics everywhere. */
export function getVendorOr404(slug: string): PublicVendorProfileVM {
  const profile = getPublicVendorProfile(slug);
  if (!profile) notFound();
  return profile;
}
