// Shared Framer Motion variants (Motion Standard §2). Surfaces import these — a surface-local
// variant duplicating one of these is a Review-A duplication finding. All variants animate
// opacity/transform ONLY (GPU-composited; Motion Standard §4).
import type { Variants } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from "./tokens";

/** Plain opacity entrance — 200ms easeOut. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE.out },
  },
};

/** Fade + 6px rise — the standard card/section entrance. */
export const fadeInRise: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE.out },
  },
};

/** Fade + scale from 0.98 — anchored panels (menus, popovers) on client surfaces. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION_DURATION.fast, ease: MOTION_EASE.out },
  },
};

/**
 * Parent orchestrator for staggered children. Deliberately carries NO `staggerChildren`:
 * per-item delay is computed in `staggerItem` from the child's `custom` index so the 200ms
 * cap holds by construction (§4.4; RV-0154 F5) — `staggerChildren` cannot be capped.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {},
};

/**
 * Child of `staggerContainer` — the standard entrance with a capped per-index delay.
 * Pass the item's index via the motion `custom` prop (see `StaggerItem`).
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION.base,
      ease: MOTION_EASE.out,
      delay: Math.min(index * MOTION_STAGGER.step, MOTION_STAGGER.cap),
    },
  }),
};
