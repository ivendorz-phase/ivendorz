"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, MapPin, ArrowRight, Send, Pause, Play } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { Badge } from "@/frontend/primitives/badge";
import { cn } from "@/frontend/lib/cn";

// Landing RFQ Preview Board — the hero's right column (landing_page_spec.md §3 · Doc-7D Public surface).
//
// GOVERNANCE — this is an ILLUSTRATIVE MARKETING PREVIEW, not live data (owner-approved 2026-07-10):
//   • Binds NO Doc-5 contract and fetches nothing. The anonymous Public surface exposes only the three
//     frozen reads (search_catalog / list_vendor_directory / get_public_vendor_profile, BC-MKT-6 §8) —
//     there is NO public RFQ-list contract, and RFQs are M3 buyer records, so these rows are a CURATED
//     STATIC SEED clearly framed as examples (never a live/browsable RFQ feed). All rows are "open"
//     (not-closed) to match the requested "last 10 open RFQs" motif — presentation only.
//   • Shows NO fabricated count. The mockup's "TOTAL ACTIVE 12,543" is a qualitative "Preview" chip —
//     no client-computed / fabricated numbers (spec §2.3g; SC GI-03/GI-12; ER ESC-7-API/stats).
//   • Performs NO mutation. "Reply" and "Post Your RFQ" are authenticated intents → route to `(auth)`
//     (Doc-7D PR5; Doc-7E owns the auth action; §0.2 constraint 1 / CHK-7-011).
//
// MOTION — the upward auto-scroll runs under the owner-authorized **motion_standard.md §7 Landing Page
// Ambient Motion Exception** (public marketing surface only). It meets all §7 conditions: slow/linear
// (animate-iv-marquee-up, GPU translateY — §7.1/§7.7); pauses on hover, keyboard focus AND touch
// (§7.2/§7.3/§7.4); a visible Pause/Play control is always available (§7.6); disabled + list becomes
// manually scrollable under prefers-reduced-motion (§7.5); no flash/bounce (§7.8). This is a CLIENT
// island — a deliberate, exception-sanctioned exception to the hero's "only the Command Center
// hydrates" note (hero.tsx §3). REUSE: composes the frozen Doc-7B kit (Button · Badge).

const AUTH_HREF = "/login"; // `(auth)` entry — Doc-7E owns the auth action (Doc-7D PR5).

type StatusVariant = React.ComponentProps<typeof Badge>["variant"];

interface SampleRfq {
  /** Presentation tag only — deliberately NOT the real year-scoped ref format (RFQ-2026-000123). */
  tag: string;
  title: string;
  location: string;
  category: string;
  status: { label: string; variant: StatusVariant };
}

// Curated static seed — 10 illustrative, Bangladesh-localized examples, all OPEN (not-closed). Never a
// live feed. Categories echo the marketplace seed's popular terms for a coherent story (no data claim).
const SAMPLE_RFQS: readonly SampleRfq[] = [
  {
    tag: "RFQ",
    title: "CNC Machining Service (Aluminum 6061)",
    location: "Dhaka, BD",
    category: "Manufacturing",
    status: { label: "Urgent", variant: "danger" },
  },
  {
    tag: "RFQ",
    title: "Hydraulic Pumps — 500HP Series",
    location: "Chattogram, BD",
    category: "Heavy Machinery",
    status: { label: "Open", variant: "success" },
  },
  {
    tag: "RFQ",
    title: "Boiler Feed-Water Treatment Plant",
    location: "Narayanganj, BD",
    category: "Process Plant",
    status: { label: "Open", variant: "success" },
  },
  {
    tag: "RFQ",
    title: "MS Plate 12mm — 40 Ton Supply",
    location: "Dhaka, BD",
    category: "Raw Materials",
    status: { label: "Urgent", variant: "danger" },
  },
  {
    tag: "RFQ",
    title: "VFD Drives 75kW — Line Retrofit",
    location: "Gazipur, BD",
    category: "Automation",
    status: { label: "Open", variant: "success" },
  },
  {
    tag: "RFQ",
    title: "Industrial PPE — Quarterly Bulk",
    location: "Khulna, BD",
    category: "Safety",
    status: { label: "Open", variant: "success" },
  },
  {
    tag: "RFQ",
    title: "Ball Valves DN200 (Carbon Steel)",
    location: "Bogura, BD",
    category: "Piping & Fittings",
    status: { label: "Open", variant: "success" },
  },
  {
    tag: "RFQ",
    title: "Diesel Generator 250kVA",
    location: "Sylhet, BD",
    category: "Power Systems",
    status: { label: "Urgent", variant: "danger" },
  },
  {
    tag: "RFQ",
    title: "Conveyor Belt System (Garments)",
    location: "Ashulia, BD",
    category: "Material Handling",
    status: { label: "Open", variant: "success" },
  },
  {
    tag: "RFQ",
    title: "Screw Air Compressor 55kW",
    location: "Cumilla, BD",
    category: "Utilities",
    status: { label: "Open", variant: "success" },
  },
];

function RfqCard({ rfq, duplicate }: { rfq: SampleRfq; duplicate?: boolean }) {
  return (
    <li
      // The duplicate set exists only to make the -50% loop seamless: hidden from assistive tech, and
      // removed under reduced-motion (where the first set is shown as a manually scrollable list).
      aria-hidden={duplicate}
      // Spacing via per-item margin (not the parent's flex gap) so the track height is EXACTLY 2× one
      // set — translateY(-50%) then lands seam-perfectly (a flex gap would leave a ~half-gap jump).
      className={cn(
        "mb-2.5 rounded-lg border border-border bg-card p-3 shadow-iv-sm",
        duplicate && "motion-reduce:hidden",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Badge variant="brand">{rfq.tag}</Badge>
        <Badge variant={rfq.status.variant}>{rfq.status.label}</Badge>
      </div>
      <p className="text-sm font-semibold text-iv-ink-heading">{rfq.title}</p>
      <p className="mt-1 inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
        <MapPin aria-hidden="true" className="size-3.5" />
        {rfq.location}
        <span aria-hidden="true" className="text-border">
          •
        </span>
        <span className="text-iv-amber-600">{rfq.category}</span>
      </p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-2.5 w-full gap-2"
        tabIndex={duplicate ? -1 : undefined}
      >
        <Link href={AUTH_HREF}>
          Reply to this Query <Send aria-hidden="true" className="size-3.5" />
        </Link>
      </Button>
    </li>
  );
}

export function RfqPreviewBoard() {
  // Auto-motion pauses while the user interacts (hover/focus/touch — §7.2/§7.3/§7.4) and while
  // explicitly paused via the control (§7.6). Both combine so a manual pause is never overridden.
  const [interacting, setInteracting] = React.useState(false);
  const [manuallyPaused, setManuallyPaused] = React.useState(false);
  const running = !interacting && !manuallyPaused;

  return (
    <aside
      aria-label="Requested RFQs — illustrative preview"
      className={cn(
        "mx-auto flex w-full max-w-[var(--iv-container-md)] flex-col",
        "rounded-xl border border-border bg-popover p-4 shadow-iv-lg sm:p-5 sm:shadow-iv-xl",
      )}
    >
      {/* Header — title · honest "Preview" chip · always-available Pause/Play control (§7.6) */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-wide text-iv-ink-heading">
          <Activity aria-hidden="true" className="size-4 text-iv-amber-600" />
          Requested RFQs
        </p>
        <div className="flex items-center gap-1.5">
          <Badge variant="neutral">Preview</Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={manuallyPaused}
            aria-label={manuallyPaused ? "Play the RFQ ticker" : "Pause the RFQ ticker"}
            onClick={() => setManuallyPaused((v) => !v)}
            className="h-7 w-7 p-0"
          >
            {manuallyPaused ? (
              <Play aria-hidden="true" className="size-3.5" />
            ) : (
              <Pause aria-hidden="true" className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Ticker viewport — fixed height + top/bottom fade mask; content scrolls upward. Under
          reduced-motion the animation is off and the list becomes manually scrollable (§7.5). */}
      <div
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={() => setInteracting(false)}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => setInteracting(false)}
        className={cn(
          "relative h-[21rem] overflow-hidden sm:h-[23rem]",
          "motion-reduce:overflow-y-auto",
          "[mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]",
          "[-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)]",
          "motion-reduce:[mask-image:none] motion-reduce:[-webkit-mask-image:none]",
        )}
      >
        <ul
          role="list"
          style={{ animationPlayState: running ? "running" : "paused" }}
          className="flex flex-col animate-iv-marquee-up motion-reduce:animate-none"
        >
          {SAMPLE_RFQS.map((rfq, i) => (
            <RfqCard key={`a-${i}`} rfq={rfq} />
          ))}
          {SAMPLE_RFQS.map((rfq, i) => (
            <RfqCard key={`b-${i}`} rfq={rfq} duplicate />
          ))}
        </ul>
      </div>

      {/* Footer — primary conversion CTA (routes to auth) + honesty caption */}
      <div className="mt-4 border-t border-border pt-3">
        <Button asChild size="lg" variant="amber" className="w-full gap-2">
          <Link href={AUTH_HREF}>
            Post Your RFQ — 100% Free <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <p className="mt-2 text-center text-2xs text-muted-foreground">
          Illustrative preview — sample open RFQs shown, not a live feed.
        </p>
      </div>
    </aside>
  );
}
