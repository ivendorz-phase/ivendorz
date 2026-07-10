// Shared Framer Motion variants (Motion Standard §2). Surfaces import these — a surface-local
// variant duplicating one of these is a Review-A duplication finding. All variants animate
// opacity/transform ONLY (GPU-composited; Motion Standard §4).
import type { Variants } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE } from "./tokens";

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

/** Parent orchestrator for staggered children — 30ms step (cap list length; §4.4). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

/** Child of `staggerContainer` — same shape as the standard entrance. */
export const staggerItem: Variants = fadeInRise;
