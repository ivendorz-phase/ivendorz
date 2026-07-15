// Public marketing footer (Doc-7D Public chrome). Static, anonymous, Server Component.
//
// ── 2026-07-16 · REBUILT AGAINST THE "iVendorz Public Pages" REFERENCE ────────────────────────────
// (design project `14497856-6435-433d-b191-2a32431d642b`, `iVendorz Public Pages.dc.html`). Ported
// composition: a 4-column top band (brand + blurb, then three link columns) over a bottom bar
// carrying the copyright + the three legal links. Standard: `docs/frontend/architecture/
// visual_reference_implementation.md` §2 — copy the composition; implement the platform.
//
// WHAT THIS FIXES (the reason the rebuild is more than cosmetic): every link in the previous footer
// was hardcoded `href="/"` — 12 dead links that silently dead-ended on the homepage — and a third of
// its labels (Careers · API · Security · Help center · Procurement guides) had no destination in this
// codebase at all. The reference's own link set maps 1:1 onto routes that ALL exist today, so this
// version has no placeholder hrefs and invents no destination. `LINK_COLUMNS` below is therefore a
// route-truth table: every href must resolve to a real `app/(public)` route — if a future label has
// no route, it does not go in this footer.
//
// DELIBERATE DIVERGENCES FROM THE REFERENCE:
//  • Its social row (LinkedIn · X · Email) is DROPPED. The reference points all three at its own
//    `#/contact` because it is a prototype; this repo has no social handle, no account URL and no
//    contact address anywhere. Rendering a LinkedIn glyph that navigates to /contact would fabricate
//    a social presence that does not exist (GI-03 — never a decorative affordance standing in for a
//    real one). Add them when real URLs exist, not before.
//  • Its brand mark is an inline text lockup (`[icon] iVendorz`); we render the official kit
//    `BrandLogo` (the SVG SSoT — never re-drawn or substituted).
//  • Its blurb ("The B2B sourcing marketplace connecting procurement teams with verified industrial
//    vendors across Bangladesh") is NOT used: "B2B sourcing marketplace" is ~40% of what this product
//    is (CLAUDE.md §1 — marketplace + RFQ procurement + ERP-lite ops + vendor CRM), so it would
//    misposition the platform in its most-repeated surface. The slot keeps the already-approved
//    positioning line from the About page instead.
import * as React from "react";
import Link from "next/link";
import { Separator } from "@/frontend/primitives/separator";
import { BrandLogo } from "@/frontend/brand";
import { Container } from "@/frontend/components/container";

/** Footer link columns. EVERY href is a real, existing `app/(public)` route — no placeholders, no
 *  invented destinations (see this file's header). Grouping + order follow the reference. */
const LINK_COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/marketplace", label: "Marketplace" },
      { href: "/categories", label: "Categories" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/for-buyers", label: "For buyers" },
      { href: "/for-vendors", label: "For vendors" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Guides" },
      { href: "/trust", label: "Trust & safety" },
      { href: "/compare", label: "Compare" },
      { href: "/legal/terms", label: "Legal" },
    ],
  },
];

/** Bottom-bar legal links — the three `(public)/legal` routes. */
const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/confidentiality-charter", label: "Charter" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      {/* Shares the page-content Container — footer columns align to the body grid. The full-bleed
          bg-card band stays on the <footer> element itself. */}
      <Container className="py-12">
        {/* Top band — brand + blurb take a wider first track (the reference's 4-col proportion),
            then the three link columns. */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BrandLogo height={28} />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-iv-ink-secondary">
              The industrial procurement operating system for Bangladesh — connecting factories,
              plants and EPC contractors with verified suppliers, from RFQ to award to delivery.
            </p>
          </div>

          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-iv-ink-heading-strong">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-iv-ink-secondary transition-colors hover:text-iv-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom bar — copyright + legal links. The reference's social cluster is deliberately
            absent (see header). */}
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>© iVendorz — Industrial Procurement OS for Bangladesh.</p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-sm transition-colors hover:text-iv-ink-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
