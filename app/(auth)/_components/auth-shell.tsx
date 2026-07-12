// Auth shell — the split-screen frame shared by ALL (auth) screens (Login · Signup · Forgot/Reset
// password · Verify email · 2FA · Accept invitation · Org setup). PURE SERVER COMPONENT. Two columns
// on `lg` (brand aside · form panel); on mobile the aside drops and the form panel centers on its
// own. Intentionally NOT an `(auth)/layout.tsx` — each screen passes its OWN aside copy, so the
// frame is composed per page rather than imposed by a group layout.
import type { ReactNode } from "react";
import { cn } from "@/frontend/lib/cn";
import { AuthBrandAside, type AuthBrandAsideProps } from "./auth-brand-aside";

interface AuthShellProps {
  /** Content of the shared dark brand aside. */
  aside: AuthBrandAsideProps;
  /** Widen the form panel (`max-w-lg`) for multi-column content (e.g. the org-setup wizard). */
  wide?: boolean;
  /** The form panel (top bar + heading + form). */
  children: ReactNode;
}

export function AuthShell({ aside, wide, children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <AuthBrandAside {...aside} />
      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className={cn("w-full", wide ? "max-w-lg" : "max-w-md")}>{children}</div>
      </section>
    </main>
  );
}
