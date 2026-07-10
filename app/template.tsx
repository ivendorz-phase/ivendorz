// Root template — App Router composition only (REPOSITORY_STRUCTURE §8). Remounts on every
// navigation, keying the standard page-transition entrance (Motion Standard §3; the initial
// SSR paint renders statically — see PageTransition).
import type { ReactNode } from "react";
import { PageTransition } from "@/frontend/motion";

export default function Template({ children }: Readonly<{ children: ReactNode }>) {
  return <PageTransition>{children}</PageTransition>;
}
