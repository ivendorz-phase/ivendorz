"use client";

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENTAL — Demo Preview RFQ ticker (PROTOTYPE · NOT production content)
//
// Motion: CONTINUOUS vertical auto-slide (owner-chosen 2026-07-12) at the validated
// MARKETING_MOTION.marqueeSpeedPxPerSec (~22px/s). The stepped-rotation variant was
// evaluated and dropped.
//
// The data is OWNER-AUTHORIZED DEMO content — labelled "(Demo)" on every card AND behind a
// "Demo preview" panel badge — never presented as live marketplace data (GI-03). Replaced by
// the wired public-RFQ read (M3) before release.
//
// Non-negotiables honoured: pause on hover + focus; STOP entirely under prefers-reduced-motion
// (viewport becomes scrollable so every row stays reachable); content fully readable static;
// GPU `transform` only.
//
// PREVIEW override (prototype-only): `?motion=force` bypasses reduced-motion so the motion can be
// evaluated on a machine whose OS requests reduced motion. It NEVER ships as default behaviour —
// the real page always respects the OS setting.
// ─────────────────────────────────────────────────────────────────────────────

import { MapPin } from "lucide-react";
import { cn } from "@/frontend/lib/cn";
import { MARKETING_MOTION, useForcePreview, useMarquee } from "./marketing-motion";

type DemoStatus = "Open" | "Closes soon" | "Urgent";
interface DemoRfq {
  id: string;
  name: string;
  location: string;
  status: DemoStatus;
}

const DEMO_RFQS: readonly DemoRfq[] = [
  { id: "RFQ-001", name: "Stainless Steel Storage Tank", location: "Dhaka", status: "Closes soon" },
  { id: "RFQ-002", name: "Compressed Air Piping", location: "Gazipur", status: "Open" },
  { id: "RFQ-003", name: "Industrial Pump Supply", location: "Chattogram", status: "Closes soon" },
  { id: "RFQ-004", name: "Industrial Pump Supply", location: "Chattogram", status: "Urgent" },
  { id: "RFQ-005", name: "Industrial Pump Supply", location: "Chattogram", status: "Open" },
];

const STATUS_STYLE: Record<DemoStatus, string> = {
  Open: "text-iv-success-base",
  "Closes soon": "text-iv-warning-base",
  Urgent: "text-iv-danger-base",
};

const VIEWPORT_H = 300;
const MASK = "linear-gradient(180deg, transparent, #000 8%, #000 90%, transparent)";

function DemoCard({ rfq }: { rfq: DemoRfq }) {
  return (
    <article className="shrink-0 rounded-xl border border-iv-light-border bg-white p-3.5 shadow-iv-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-md bg-iv-navy-800 px-2 py-1 font-mono text-[11px] font-bold tracking-wide text-white">
          {rfq.id} <span className="text-white/60">(Demo)</span>
        </span>
        <span
          className={cn(
            "font-mono text-[10px] font-bold uppercase tracking-wider",
            STATUS_STYLE[rfq.status],
          )}
        >
          {rfq.status}
        </span>
      </div>
      <p className="mt-2 font-semibold text-iv-navy-700">{rfq.name}</p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-iv-ink-muted">
        <MapPin aria-hidden="true" className="size-3.5" />
        {rfq.location}
      </p>
    </article>
  );
}

export function RfqTickerDemo() {
  const forcePreview = useForcePreview();
  const { viewportRef, trackRef, reduced, pause, resume } = useMarquee(
    "y",
    MARKETING_MOTION.marqueeSpeedPxPerSec,
    forcePreview,
  );
  // Duplicate the set for a seamless loop; under reduced-motion render a single scrollable set.
  const rows = reduced ? DEMO_RFQS : [...DEMO_RFQS, ...DEMO_RFQS];

  return (
    <div
      ref={viewportRef}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className={cn("relative", reduced ? "overflow-y-auto" : "overflow-hidden")}
      style={
        reduced
          ? { height: VIEWPORT_H }
          : { height: VIEWPORT_H, WebkitMaskImage: MASK, maskImage: MASK }
      }
    >
      <div ref={trackRef} className="flex flex-col gap-3 px-4 py-3">
        {rows.map((r, i) => (
          <DemoCard key={`${r.id}-${i}`} rfq={r} />
        ))}
      </div>
    </div>
  );
}
