import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ClipboardList } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Container } from "@/frontend/components/container";
import { RfqTickerDemo } from "./rfq-ticker-demo";

// Landing Hero — SEC-HERO (landing_page_spec.md §3 · Doc-7D Public surface). PURE SERVER COMPONENT:
// static marketing copy with NO client island — the first viewport carries zero hydration (spec §3
// rendering delta; LCP-safe). Exactly one <h1> for the page. Conversion CTAs route to `(auth)`
// (Doc-7D PR5); browse CTAs stay anonymous/public.
//
// 2026-07-12 redesign (iVendorz Kit landing mockup): a dark two-column band over an industrial photo —
// copy + CTAs on the left, a "Requested RFQs" live panel on the right. The mockup's panel shows
// fabricated live RFQ cards + a fake "12,543 active" count; those are NOT rendered — the surface
// fetches nothing here (Doc-7D §5.1) and never fabricates data/counts (GI-03/GI-12). Instead the panel
// ships a CLEARLY-LABELLED "Demo preview" ticker — owner-authorized prototype data (every row tagged
// "(Demo)") used only to validate the experimental Marketing Motion auto-play; it is NOT live data and
// is replaced by the wired M3 public-RFQ read before release (GI-03). The photo carries an
// intentionally light scrim (heavier at the text edge, lighter over the panel) so the image reads
// through. LCP: the copy column is static server-rendered; the panel embeds ONE client island (the
// demo ticker) — the LCP <h1> never waits on it.
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[56vh] items-center overflow-hidden text-white lg:min-h-[64vh]">
      {/* Industrial backdrop — decorative (empty alt); the <h1> carries the meaning. `priority` so it
          is the eagerly-loaded LCP image. */}
      <Image
        src="/hero/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {/* Scrim — lighter than the mockup so the photo shows through; 120° so the left (text) edge stays
          legible while the right (panel) edge reveals more image. aria-hidden, encodes no data. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(120deg, rgba(8,14,28,0.86) 0%, rgba(12,22,45,0.66) 46%, rgba(18,32,66,0.34) 100%)",
        }}
      />

      <Container className="grid w-full items-center gap-10 py-12 sm:py-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
        {/* ── Copy column ─────────────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-sm sm:text-5xl">
            The Industrial Procurement HUB for Bangladesh
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Source, compare, and award with verified suppliers, from RFQ to delivery.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Let&rsquo;s Start Procurement <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            {/* Ghost-on-dark: explicit light-on-transparent styling — this band is dark regardless of
                the app theme, so it opts out of the semantic button variants here. */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-white/25 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
            >
              <Link href="/marketplace">Explore the marketplace</Link>
            </Button>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/75">
            {["No fees to post", "Verified suppliers only", "Quotes as scheduled"].map((claim) => (
              <li key={claim} className="inline-flex items-center gap-2">
                <Check aria-hidden="true" className="size-4 text-iv-success-bright" />
                {claim}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Requested-RFQs panel — light floating card; DEMO-PREVIEW motion ticker ──────── */}
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white text-iv-ink shadow-iv-xl">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,var(--iv-navy-700),var(--iv-navy-900))] px-5 py-4 text-white">
            <span className="inline-flex items-center gap-2 text-base font-bold">
              <ClipboardList aria-hidden="true" className="size-5 text-white/85" />
              Requested RFQs
            </span>
            {/* Explicit prototype label — this panel is NOT live data (GI-03). */}
            <span className="rounded-full border border-white/30 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/80">
              Demo preview
            </span>
          </div>

          <RfqTickerDemo />

          <div className="border-t border-iv-light-border px-4 py-4">
            <Button asChild className="w-full gap-2">
              <Link href="/login">
                Post Your RFQ for free <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
