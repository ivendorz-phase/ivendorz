import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { CommandCenter } from "./command-center";
import { RfqPreviewBoard } from "./rfq-preview-board";

// Landing Hero — SEC-HERO (landing_page_spec.md §3 · Doc-7D Public surface). Server Component shell
// (static marketing copy). Full-bleed dark industrial hero: a decorative background photo (aria-hidden,
// encodes no data — DP §4.5) under a navy legibility overlay, with a two-column first viewport —
// value proposition (left, light text) + the illustrative RFQ preview board (right, a client island
// whose slow auto-scroll runs under motion_standard.md §7). The Command Center (§2) floats below.
// Exactly one <h1>. Conversion CTAs route to `(auth)` (Doc-7D PR5); browse CTAs stay anonymous.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-iv-navy-950">
      {/* Full-bleed industrial background photo — decorative (DP §4.5), never data. Swap the asset at
          /public/hero/hero-bg.jpg to rebrand; alt="" is correct (the navy overlay guarantees contrast).
          next/image with `priority` optimizes + preloads this above-the-fold LCP asset. */}
      <Image
        src="/hero/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Navy legibility overlay — darker on the left where the copy sits (keeps text WCAG-AA over the photo). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,19,34,0.94) 0%, rgba(11,19,34,0.82) 42%, rgba(11,19,34,0.58) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[var(--iv-content-max)] px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        {/* Two-column hero: value proposition (left) + illustrative RFQ preview board (right).
            Stacks on mobile (text first, board second); side-by-side from lg. */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              The Industrial Procurement <span className="text-iv-amber-400">HUB</span> for
              Bangladesh
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80 lg:mx-0">
              Source, compare, and award — from RFQ to delivery — with verified suppliers.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" variant="amber" className="gap-2">
                <Link href="/login">
                  Get started <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/marketplace">Explore the marketplace</Link>
              </Button>
            </div>
          </div>

          {/* Right column — illustrative RFQ ticker (client island, §7 ambient-motion exception). */}
          <div className="w-full">
            <RfqPreviewBoard />
          </div>
        </div>

        {/* The signature Command Center (§2), floating below the hero copy. */}
        <div className="mt-12 pb-16 sm:mt-14 sm:pb-20">
          <CommandCenter />
        </div>
      </div>
    </section>
  );
}
