// Kit motion tokens (Motion Standard §1 — docs/frontend/design-system/motion_standard.md).
// The ONLY numeric motion values for Framer Motion work; mirrors the CSS layer
// (--iv-duration-* / --iv-ease-* in globals.css) so both layers move identically.
import type { Transition } from "framer-motion";

/** Durations in seconds (Framer Motion convention). The 150–250ms band is binding. */
export const MOTION_DURATION = {
  /** Micro-interactions — hover/tap feedback, menus. */
  fast: 0.15,
  /** Standard entrances — cards, rows, page transitions. */
  base: 0.2,
  /** Large surfaces — drawers, sheets. */
  slow: 0.25,
} as const;

/** Easing curves — identical to --iv-ease-out / --iv-ease-in-out. Never use spring/bounce. */
export const MOTION_EASE: Record<"out" | "inOut", [number, number, number, number]> = {
  out: [0, 0, 0.2, 1],
  inOut: [0.4, 0, 0.2, 1],
};

/** The default transition — 200ms easeOut. Reach for this before composing a custom one. */
export const MOTION_TRANSITION: Transition = {
  duration: MOTION_DURATION.base,
  ease: MOTION_EASE.out,
};
