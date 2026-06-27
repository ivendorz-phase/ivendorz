import type { ReactNode } from "react";

/**
 * (auth) route group — Supabase Auth screens (authentication only).
 * Realized per Doc-7E; composition only (REPOSITORY_STRUCTURE §8).
 */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
