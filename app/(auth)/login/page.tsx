// Login route (`/login`) — the auth-entry screen in the (auth) route group (Doc-7C §2.1; Doc-7E
// §2 / ER2). Unauthenticated; no active-org context (Doc-7C §2.1). RSC shell composing the shared
// split-screen auth frame + the client sign-in form. Authentication via Supabase Auth ONLY
// (Doc-7C §3.1); no `create_user` coined (Doc-7E §2 / [ESC-7-API-SIGNUP]). Redesigned 2026-07-12 to
// the iVendorz-kit split layout (dark brand aside + form panel) — honest, capability-true copy only.
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — iVendorz",
  description: "Sign in to iVendorz — source from verified industrial suppliers across Bangladesh.",
};

export default function LoginPage() {
  return (
    <AuthShell
      aside={{
        headline: "Welcome back to your sourcing hub.",
        subcopy:
          "Pick up where you left off — track live RFQs, compare quotes, and award contracts with verified suppliers.",
        points: [
          "Verified suppliers only",
          "Compare competing quotes in one place",
          "An immutable audit trail on every award",
        ],
        footNote:
          "Default-private by design — your sourcing activity is visible only to you and the vendors you invite.",
      }}
    >
      {/* Top bar — mobile brand (the aside is hidden below lg) + cross-link to signup. */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          <BrandLogo height={30} />
        </Link>
        <p className="ml-auto text-sm text-muted-foreground">
          New to iVendorz?{" "}
          <Link
            href="/signup"
            className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Create account
          </Link>
        </p>
      </div>

      <div className="mb-7">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Access your RFQs, quotes and supplier shortlists.
        </p>
      </div>

      <LoginForm />

      <p className="mt-7 text-center text-xs text-muted-foreground">
        Protected by verification &amp; an immutable audit trail.
      </p>
    </AuthShell>
  );
}
