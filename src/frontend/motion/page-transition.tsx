"use client";

// PageTransition (Motion Standard §3) — the route-change entrance. Mounted per route group
// (`app/(public|app|auth)/template.tsx`) BELOW the group shell, so chrome never remounts and
// only page content animates. The m.div is keyed on the pathname: Next 15 does NOT remount a
// template on navigations that stay inside its route group (RV-0154 F-B1, empirically proven),
// so the key — not template remount semantics — is what replays the entrance on every route
// change. Search-param-only changes deliberately do not animate (usePathname excludes query).
//
// LCP guard: the VERY FIRST paint (SSR/hard load) renders children statically — an
// initial-opacity-0 wrapper would hide server-rendered content until hydration and regress
// LCP. `hasHydrated` is false on the server and during hydration's first render (markup
// agrees); only client-side navigations animate.
import * as React from "react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { MOTION_DURATION, MOTION_EASE } from "./tokens";

let hasHydrated = false;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The hard-load pathname, or null once any navigation has happened (or for instances mounted
  // after hydration, e.g. a cross-group template remount — those are navigations by definition).
  const initialPathnameRef = React.useRef<string | null>(hasHydrated ? null : pathname);
  if (initialPathnameRef.current !== null && pathname !== initialPathnameRef.current) {
    // One-way latch, cleared during render (idempotent): after the first navigation, every
    // route — including a return to the hard-load path — gets the entrance.
    initialPathnameRef.current = null;
  }
  React.useEffect(() => {
    hasHydrated = true;
  }, []);

  if (pathname === initialPathnameRef.current) {
    return <>{children}</>;
  }

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.base, ease: MOTION_EASE.out }}
    >
      {children}
    </m.div>
  );
}
