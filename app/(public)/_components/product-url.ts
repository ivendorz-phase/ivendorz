// Product URL Builder (FE-PUB-05, ADR-025 Decision 3/7 — Marketplace Public URL Law realizes the
// canonical product URL; Doc-4D v1.0.3 / Doc-5D v1.0.1's `canonical_url` field is what this builder
// emits). The ONE place any emitter obtains a product profile URL — direct route-string
// concatenation anywhere else is the exact defect the Builder Rule (ADR-025 Decision 7, generalizing
// ADR-024 §6) exists to prevent.
//
// Canonical grammar (ADR-025 Decision 3/8): `/marketplace/product/{name-slug}-{uuid}` — an apex
// marketplace host route, never a vendor-host route (Decision 4's no-vendor-host-detail invariant).
// The UUID tail is the SOLE resolution key (Decision 2 — opaque IDs); the `{name-slug}` prefix is
// presentation-only, derived at render from the product name, never persisted, never authoritative.
// A stale/absent/wrong slug prefix — or a bare-UUID request with no prefix at all — 301-redirects to
// the current canonical (Decision 5 / Doc-5D patch conformance row F-2); this is the id-only leg
// resolving via redirect, never a second canonical.
export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_LENGTH = 36;

/** The canonical product URL builder — every emitter must call this, never concatenate. */
export function productHref(product: { id: string; name: string }): string {
  return `/marketplace/product/${slugifyProductName(product.name)}-${product.id}`;
}

/**
 * Resolve a route `[slug]` param into its id-anchored parts. `id` is the trailing UUID (the only
 * thing that resolves the product); `namePrefix` is whatever preceded it, stripped of its
 * separating dash (empty string for a bare-UUID request). Returns `null` if no valid UUID tail is
 * present at all (a malformed param, not a stale-slug case).
 */
export function parseProductSlugParam(
  slugParam: string,
): { id: string; namePrefix: string } | null {
  if (slugParam.length < UUID_LENGTH) return null;
  const id = slugParam.slice(-UUID_LENGTH);
  if (!UUID_RE.test(id)) return null;
  const namePrefix = slugParam.slice(0, -UUID_LENGTH).replace(/-+$/, "");
  return { id, namePrefix };
}
