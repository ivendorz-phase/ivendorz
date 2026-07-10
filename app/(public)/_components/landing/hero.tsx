import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { CommandCenter } from "./command-center";
import { RfqPreviewBoard } from "./rfq-preview-board";

// Landing Hero — SEC-HERO (landing_page_spec.md §3 · Doc-7D Public surface). The Hero shell itself is a
// SERVER COMPONENT (static marketing copy). Two-column first viewport: value proposition (left) + an
// illustrative RFQ preview board (right — a client island whose slow auto-scroll runs under the
// owner-authorized motion_standard.md §7 marketing ambient-motion exception; no fabricated counts, no
// live RFQ read; see rfq-preview-board.tsx governance). First-viewport hydration is therefore the RFQ
// ticker + the Command Center (§2, below both columns). Exactly one <h1> for the page. The decorative
// blueprint motif is aria-hidden and encodes no data (DP §4.5). Conversion CTAs route to `(auth)`
// (Doc-7D PR5); browse CTAs stay anonymous/public.
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Decorative blueprint / technical line-art motif — restrained, brand-neutral, never data (DP §4.5). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--iv-border) 1px, transparent 1px), linear-gradient(90deg, var(--iv-border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          // The mask consumes only the alpha channel — #000 is a mask alpha, not a theme colour.
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 25%, transparent 75%)",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 25%, transparent 75%)",
          opacity: 0.5,
        }}
      />

      <div className="relative mx-auto w-full max-w-[var(--iv-content-max)] px-4 pt-20 sm:px-6 lg:px-8 sm:pt-24">
        {/* Two-column hero: value proposition (left) + illustrative RFQ preview board (right).
            Stacks on mobile (text first, board second); side-by-side from lg. */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-iv-ink-heading sm:text-5xl">
              The Industrial Procurement HUB for Bangladesh
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-iv-ink-secondary lg:mx-0">
              Source, compare, and award — from RFQ to delivery — with verified suppliers.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="gap-2">
                <Link href="/login">
                  Get started <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/marketplace">Explore the marketplace</Link>
              </Button>
            </div>
          </div>

          {/* Right column — illustrative RFQ ticker (client island, §7 ambient-motion exception). */}
          <div className="w-full">
            <RfqPreviewBoard />
          </div>
        </div>

        {/* Hero showcase band — spans under both columns. Decorative on-brand placeholder (aria-hidden,
            encodes no data — DP §4.5); swap /public/hero/hero-band.svg for a real industrial photo and
            give it descriptive alt text when the asset lands. */}
        <div className="mt-10 overflow-hidden rounded-xl border border-border shadow-iv-md sm:mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG; next/image
              yields no optimization for inline SVG and would require dangerouslyAllowSVG. */}
          <img
            src="/hero/hero-band.svg"
            alt=""
            aria-hidden="true"
            className="aspect-[1600/420] w-full object-cover"
          />
        </div>

        {/* The signature centerpiece — the only interactive island in the first viewport (spec §2/§3). */}
        <div className="mt-12 pb-16 sm:mt-14 sm:pb-20">
          <CommandCenter />
        </div>
      </div>
    </section>
  );
}
