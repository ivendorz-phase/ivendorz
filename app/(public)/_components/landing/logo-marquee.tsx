"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Client logo marquee — "Trusted by procurement teams at …"
//
// Renders REAL, permissioned client logos from `CLIENT_LOGOS`. That array is EMPTY until clients
// upload their logos, so the strip currently shows neutral PLACEHOLDER slots — obviously-empty
// boxes, NOT fabricated company names/logos (GI-03: no invented social proof). To go live: drop the
// permissioned logo files into `public/clients/` and add `{ name, src }` entries below; the marquee
// then renders them automatically (and the placeholders disappear).
//
// Motion (EXPERIMENTAL marketing prototype): continuous horizontal auto-slide via `useMarquee`;
// pause on hover + focus; STOP entirely under prefers-reduced-motion (viewport becomes horizontally
// scrollable); GPU `transform` only; `?motion=force` previews on a reduced-motion machine.
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { Container } from "@/frontend/components/container";
import { useForcePreview, useMarquee } from "./marketing-motion";

interface ClientLogo {
  /** Company name — becomes the logo's alt text. */
  name: string;
  /** Path under /public, e.g. "/clients/acme.svg". Monochrome/transparent preferred. */
  src: string;
}

// Fill ONLY with real, permissioned client logos (files in public/clients/). Empty ⇒ placeholder slots.
const CLIENT_LOGOS: readonly ClientLogo[] = [];

const PLACEHOLDER_SLOTS = 6;
const H_MASK = "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)";

export function LogoMarquee() {
  const forcePreview = useForcePreview();
  // Horizontal strip — a touch quicker than the vertical RFQ ticker (wider travel).
  const { viewportRef, trackRef, reduced, pause, resume } = useMarquee("x", 40, forcePreview);

  const hasLogos = CLIENT_LOGOS.length > 0;
  const base: readonly (ClientLogo | null)[] = hasLogos
    ? CLIENT_LOGOS
    : Array.from({ length: PLACEHOLDER_SLOTS }, () => null);
  // Duplicate for a seamless loop; under reduced-motion render a single scrollable set.
  const items = reduced ? base : [...base, ...base];

  return (
    <section className="border-y border-iv-light-border bg-white">
      <Container className="flex items-center gap-6 py-5">
        <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-wider text-iv-ink-muted sm:inline">
          Trusted by procurement teams at
        </span>
        <div
          ref={viewportRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocusCapture={pause}
          onBlurCapture={resume}
          className={cn("relative min-w-0 flex-1", reduced ? "overflow-x-auto" : "overflow-hidden")}
          style={reduced ? undefined : { WebkitMaskImage: H_MASK, maskImage: H_MASK }}
        >
          <div ref={trackRef} className="flex w-max items-center gap-8">
            {items.map((logo, i) =>
              logo ? (
                <span
                  key={`${logo.name}-${i}`}
                  className="inline-flex shrink-0 items-center"
                  title={logo.name}
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={120}
                    height={36}
                    className="h-9 w-auto object-contain opacity-80"
                  />
                </span>
              ) : (
                // Placeholder slot — decorative, clearly empty (awaiting a real permissioned logo).
                <span
                  key={`placeholder-${i}`}
                  aria-hidden="true"
                  className="inline-flex h-10 w-32 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-iv-light-border bg-iv-light-muted text-iv-ink-muted"
                >
                  <ImageIcon className="size-4" />
                  <span className="text-xs font-medium">Logo</span>
                </span>
              ),
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
