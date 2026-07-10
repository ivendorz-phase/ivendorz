// Route-group template — App Router composition only (REPOSITORY_STRUCTURE §8). Sits BELOW
// the (public) shell layout so chrome never remounts; the pathname-keyed PageTransition
// animates page content on client navigations only (Motion Standard §3; RV-0154 F-B1).
import type { ReactNode } from "react";
import { PageTransition } from "@/frontend/motion";

export default function Template({ children }: Readonly<{ children: ReactNode }>) {
  return <PageTransition>{children}</PageTransition>;
}
