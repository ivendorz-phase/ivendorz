import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, ChevronRight, PackageOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/primitives/card";
import { Badge } from "@/frontend/primitives/badge";
import { Button } from "@/frontend/primitives/button";
import { Avatar, AvatarFallback } from "@/frontend/primitives/avatar";
import { CapabilityMatrix } from "@/frontend/components/capability-matrix";
import { ProductCard } from "@/frontend/components/product-card";
import { ResultsGrid } from "@/frontend/components/results-grid";
import { EmptyState } from "@/frontend/components/empty-state";
import { vendorInitials } from "@/frontend/components/vendor-card";
import { getPublicVendorProfile, getPublicVendorProducts } from "../../_components/discovery/seed";

// P-PUB-13 Public Vendor Profile / microsite (Doc-7D §4). PRESENTATION & COMPOSITION ONLY: anonymous,
// read-only, binds NO Doc-5 contract. The PUBLIC projection of a vendor (Content ≠ Presentation, Inv #9):
// renders published M2 content; NO edit/workflow/CRM, NO internal state. Composes the shared kit ONLY —
// it imports nothing from the Vendor workspace (`(app)`), and reuses no workspace editor component.
//
// GOVERNANCE:
//  • Published-only · byte-equivalent 404 — an unknown / draft / unpublished / soft-deleted / banned /
//    buyer-blacklisted vendor renders `notFound()`, byte-identical to genuine absence (Invariant #11).
//  • Capability = the four-flag MATRIX (Invariant #1). The only trust signal shown is the binary
//    "Verified" badge (absence = no badge, never a "pending"/"unverified" state). Trust/performance BAND,
//    financial TIER band, and capacity/turnover are DEFERRED — they ride the M5 public trust badge +
//    [ESC-7G-SCORE-DISPLAY] (human Board) and a TierChip promotion; never a numeric score (Doc-5G R10).
//  • Anonymous intents (Request quote / Contact) are CTAs that route to `(auth)` — never a mutation here.
//  • Products are the vendor-scoped PUBLISHED catalog; a card opens the result in context (/search —
//    [ESC-7-API-PRODDETAIL], no standalone anonymous product page).
const AUTH_HREF = "/login";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) return { title: "Vendor · iVendorz" };
  return {
    title: `${profile.name} · iVendorz`,
    description: profile.about ?? `${profile.name} — ${profile.category} on iVendorz.`,
  };
}

export default async function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getPublicVendorProfile(slug);
  if (!profile) notFound();

  // Vendor-scoped PUBLISHED catalog (public projection accessor — symmetric with the profile read).
  const products = getPublicVendorProducts(slug);

  return (
    <div className="mx-auto w-full max-w-[var(--iv-content-max)] px-4 py-8 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/vendors" className="rounded-sm hover:text-foreground">
          Vendors
        </Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <span aria-current="page" className="truncate text-foreground">
          {profile.name}
        </span>
      </nav>

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 rounded-lg">
              <AvatarFallback className="rounded-lg text-base">
                {vendorInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-iv-ink-heading sm:text-4xl">
                  {profile.name}
                </h1>
                {profile.verified ? (
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck aria-hidden="true" className="size-3" />
                    Verified
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-iv-navy-700">{profile.category}</p>
              {profile.location ? (
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              ) : null}
            </div>
          </div>

          {/* Anonymous intents → (auth); never mutate here (Doc-7D §5). */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild>
              <Link href={AUTH_HREF}>Request quote</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={AUTH_HREF}>Contact</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {profile.about ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground">{profile.about}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsGrid
                count={products.length}
                columnsClassName="grid-cols-2 gap-3 sm:grid-cols-3"
                empty={
                  <EmptyState
                    icon={<PackageOpen aria-hidden="true" />}
                    title="No products listed yet"
                    description="This supplier hasn’t published any products."
                  />
                }
              >
                {products.map((product) => (
                  // [ESC-7-API-PRODDETAIL]: no anon product page — open the result in context (search).
                  <ProductCard
                    key={product.id}
                    product={product}
                    href={`/search?q=${encodeURIComponent(product.name)}`}
                  />
                ))}
              </ResultsGrid>
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <CapabilityMatrix flags={profile.capability} />
            </CardContent>
          </Card>

          {profile.categories && profile.categories.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {profile.categories.map((category) => (
                    <Badge key={category} variant="neutral">
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
