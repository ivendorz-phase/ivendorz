import type { ReactNode } from "react";

/**
 * (admin) route group — admin operations console (M8-facing).
 * Realized per Doc-7H; no active-org (acts on targets by ID); composition only.
 */
export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
