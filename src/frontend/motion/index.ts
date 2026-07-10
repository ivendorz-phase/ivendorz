// iVendorz Motion vocabulary — docs/frontend/design-system/motion_standard.md is the standard.
// DELIBERATELY NOT re-exported from the main `src/frontend` barrel: framer-motion must never
// ride into a chunk through a broad `@/frontend` import (the RV-0126 barrel-leak lesson).
// Import from `@/frontend/motion` explicitly.
export { MOTION_DURATION, MOTION_EASE, MOTION_TRANSITION } from "./tokens";
export { fadeIn, fadeInRise, scaleIn, staggerContainer, staggerItem } from "./variants";
export { MotionProvider } from "./motion-provider";
export { PageTransition } from "./page-transition";
export { FadeIn, Stagger, StaggerItem } from "./entrance";
export type { FadeInProps, StaggerProps } from "./entrance";
