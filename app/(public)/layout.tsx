import type { ReactNode } from "react";

/**
 * (public) route group — SSR/SSG marketplace + microsites (SEO-first).
 * Composition only; business logic lives in modules (REPOSITORY_STRUCTURE §8).
 */
export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
