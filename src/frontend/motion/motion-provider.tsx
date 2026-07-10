"use client";

// MotionProvider (Motion Standard §2) — mounted ONCE in the root layout. Provides:
// - LazyMotion (strict): all motion components must use `m.*`; a full `motion.*` import throws.
//   Features (domAnimation) load through a dynamic import, keeping the initial chunk lean.
// - MotionConfig reducedMotion="user": transform animation is disabled for users with
//   prefers-reduced-motion (opacity fades remain — the intended enterprise fallback).
// The CSS layer's reduced-motion guard lives in globals.css.
import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
