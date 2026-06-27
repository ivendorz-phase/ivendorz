import type { ReactNode } from "react";

/**
 * (app) route group — authenticated buyer/vendor application.
 * Server-resolved active-org boundary is realized per Doc-7C; composition only.
 */
export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
