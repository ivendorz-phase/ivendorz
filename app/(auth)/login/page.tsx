// Login route (`/login`) — the auth-entry screen in the (auth) route group (Doc-7C §2.1; Doc-7E
// §2 / ER2). Unauthenticated; no active-org context (Doc-7C §2.1). RSC shell composing the shared
// split-screen auth frame + the client sign-in form. Authentication via Supabase Auth ONLY
// (Doc-7C §3.1); no `create_user` coined (Doc-7E §2 / [ESC-7-API-SIGNUP]). Redesigned 2026-07-12 to
// the iVendorz-kit split layout (dark brand aside + form panel) — honest, capability-true copy only.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { resolveSupabaseSession } from "@/server/auth";
import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — iVendorz",
  description: "Sign in to iVendorz — source from verified industrial suppliers across Bangladesh.",
};

// Per-request: reads the session to bounce already-authenticated users into their workspace.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ signed_out?: string }>;
}) {
  // Already signed in ⇒ there is nothing to sign in to. Send them to their workspace (the entry route
  // resolves the default lens). This runs before render, so no login form flashes.
  const session = await resolveSupabaseSession();
  if (session !== null) {
    redirect("/dashboard");
  }

  // Set by the `/logout` route on a successful sign-out (`?signed_out=1`) — a one-shot confirmation.
  const { signed_out: signedOutParam } = await searchParams;
  const signedOut = signedOutParam === "1";

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

      {signedOut ? (
        <div
          role="status"
          className="mb-6 flex items-start gap-2 rounded-md border border-iv-success-muted/25 bg-iv-success-subtle px-3 py-2.5 text-sm text-iv-success-muted"
        >
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>You have been signed out. Sign in again to return to your workspace.</p>
        </div>
      ) : null}

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
