"use client";

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENTAL — Marketing Motion  (PROTOTYPE · NOT part of the design system)
//
// Scope: PUBLIC landing / marketing surfaces ONLY. This module deliberately DEVIATES
// from docs/frontend/design-system/motion_standard.md §1 — which caps entrances at
// 150–250 ms / ≤8 px and forbids anything > 300 ms or any infinite loop — in order to
// trial a slower, larger "brand" motion feel that suits a marketing page. It is
// page-local ON PURPOSE. It does NOT import from, re-export, or modify
// `src/frontend/motion` or any shared motion utility. Zero impact on the enterprise
// motion system.
//
// Lifecycle: prototype → validate in the real product (feel, perf, a11y, consistency)
// → ONLY IF it proves out, promote into `motion_standard.md` as a "Marketing Motion"
// section + shared `MOTION_MARKETING` tokens. Until then every deviation here is
// INTENTIONAL and scoped — a reviewer should read it as an approved experiment, not
// as drift or a §1 violation (owner-approved 2026-07-12; Prototype → Validate →
// Standardize).
//
// Non-negotiables honored even in the prototype:
//   • LCP-safe — above-the-fold / first-viewport content is NEVER wrapped in a reveal;
//     it renders static on load. Reveal choreography is for BELOW-the-fold only.
//   • prefers-reduced-motion — reveals render at their final visible state (no
//     transform); any auto-play STOPS entirely, never merely slows.
//   • No meaning is ever encoded only in motion — content is fully readable static
//     (SSR / no-JS renders the final state).
// ─────────────────────────────────────────────────────────────────────────────

import * as React from "react";
import { cn } from "@/frontend/lib/cn";

/** Experimental marketing-motion tokens (deviate from the enterprise §1 caps — see header). */
export const MARKETING_MOTION = {
  /** Reveal duration, ms. Enterprise cap is 250 ms; marketing trial band = 300–500 ms. */
  revealDurationMs: 450,
  /** Reveal rise distance, px. Enterprise cap is 8 px; marketing trial band = 12–16 px. */
  revealDistancePx: 16,
  /** easeOut-expo — decisive settle, no bounce/overshoot (§1 still forbids overshoot). */
  revealEasing: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Per-child stagger step / hard cap, ms. */
  staggerStepMs: 60,
  staggerCapMs: 240,
  /** Continuous marquee speed, px/s — VALIDATED 2026-07-12 (hero RFQ ticker; owner-approved feel). */
  marqueeSpeedPxPerSec: 22,
} as const;

/**
 * matchMedia-backed reduced-motion preference. SSR-safe: reports `false` until mounted,
 * but consumers must gate the *hidden* start-state on mount anyway (see `MarketingReveal`)
 * so no-JS / SSR always paints the final visible state.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Prototype-only preview override — `?motion=force` in the URL bypasses reduced-motion so a motion
 * can be evaluated on a machine whose OS requests reduced motion. NEVER the production default; the
 * real page always respects the OS setting. SSR-safe (reads the URL after mount).
 */
export function useForcePreview(): boolean {
  const [force, setForce] = React.useState(false);
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("motion") === "force") setForce(true);
  }, []);
  return force;
}

/**
 * Bounded auto-play marquee (EXPERIMENTAL — marketing prototype). Drives a duplicated track by
 * `transform` (GPU-only) via requestAnimationFrame. Honors the non-negotiables:
 *   • `pause()` / `resume()` — wire to hover (mouseenter/leave) AND focus (focus/blur) so the loop
 *     is never "attention-seeking" and any focused/hovered content can be read.
 *   • prefers-reduced-motion → the loop never starts and any transform is cleared (STOPS entirely,
 *     never merely slows); the consumer should make the viewport scrollable so every row stays
 *     reachable without motion.
 * The track MUST contain its children duplicated exactly once (…items, …items) so the half-extent
 * wrap is seamless. Returns refs + controls; the consumer owns the viewport's overflow/mask.
 */
export function useMarquee(axis: "x" | "y" = "y", speedPxPerSec = 22, forcePreview = false) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const pausedRef = React.useRef(false);
  // `forcePreview` is a PROTOTYPE-ONLY escape hatch (`?motion=force`) so the motion can be evaluated
  // on a machine whose OS requests reduced motion. Production never sets it — the OS setting wins.
  const reduced = usePrefersReducedMotion() && !forcePreview;

  React.useEffect(() => {
    const track = trackRef.current;
    if (reduced) {
      if (track) track.style.transform = ""; // reduced-motion → static, no residual offset
      return;
    }
    if (!track) return;
    let raf = 0;
    let last: number | null = null;
    let pos = 0;
    const tick = (t: number) => {
      if (last === null) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (!pausedRef.current) {
        const extent = axis === "y" ? track.scrollHeight / 2 : track.scrollWidth / 2;
        if (extent > 0) {
          pos = (pos + speedPxPerSec * dt) % extent;
          track.style.transform = axis === "y" ? `translateY(${-pos}px)` : `translateX(${-pos}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, axis, speedPxPerSec]);

  const pause = React.useCallback(() => {
    pausedRef.current = true;
  }, []);
  const resume = React.useCallback(() => {
    pausedRef.current = false;
  }, []);

  return { viewportRef, trackRef, reduced, pause, resume };
}

export interface MarketingRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Element to render (default `div`). */
  as?: React.ElementType;
  /** Extra entrance delay, ms (clamped to the stagger cap). */
  delayMs?: number;
}

/**
 * One-shot reveal-on-scroll for BELOW-the-fold marketing sections. GPU-only
 * (opacity + transform). Never use above the fold (LCP). SSR/no-JS/reduced-motion all
 * render the final visible state; motion only kicks in after mount when allowed.
 */
export function MarketingReveal({ children, className, as, delayMs = 0 }: MarketingRevealProps) {
  const Tag = (as ?? "div") as React.ElementType;
  const ref = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    // Motion is only ARMED after mount and when the user allows it; until then the node
    // stays at its final visible state (SSR / no-JS / reduced-motion safe).
    if (!mounted || reduced) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect(); // one-shot
        }
      },
      { threshold: 0.14 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [mounted, reduced]);

  const armed = mounted && !reduced;
  const visible = !armed || inView;
  const delay = Math.min(delayMs, MARKETING_MOTION.staggerCapMs);

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${MARKETING_MOTION.revealDistancePx}px)`,
        transition: armed
          ? `opacity ${MARKETING_MOTION.revealDurationMs}ms ${MARKETING_MOTION.revealEasing} ${delay}ms, transform ${MARKETING_MOTION.revealDurationMs}ms ${MARKETING_MOTION.revealEasing} ${delay}ms`
          : undefined,
        willChange: armed && !inView ? "opacity, transform" : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
