"use client";

// PageTransition (Motion Standard §3) — the route-change entrance, wired via app/template.tsx
// (the template remounts on every navigation, which is what keys the animation).
//
// LCP guard: the VERY FIRST paint (SSR/hard load) renders children statically — an
// initial-opacity-0 wrapper would hide server-rendered content until hydration and regress LCP.
// Only client-side navigations animate. The module-level flag is false on the server and on the
// first client render (so SSR and hydration markup agree); every template remount after that is
// a navigation.
import * as React from "react";
import { m } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE } from "./tokens";

let hasNavigated = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isInitialLoad] = React.useState(() => !hasNavigated);
  React.useEffect(() => {
    hasNavigated = true;
  }, []);

  if (isInitialLoad) {
    return <>{children}</>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE.out }}
    >
      {children}
    </m.div>
  );
}
