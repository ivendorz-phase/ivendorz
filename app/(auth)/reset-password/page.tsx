// Password-reset confirm route (`/reset-password`) — P-AUTH-05 (Auth template · Doc-7E §2). The screen
// reached from the emailed recovery link, where the user sets a NEW password. Binds Supabase Auth
// recovery (authentication only, Doc-7C §3.1). Unauthenticated shell; no active-org context, no session
// held (Doc-7C §2.1). Self-contained centered layout — does NOT add an `(auth)/layout.tsx`.
//
// PRESENTATION-ONLY: composes the Doc-7B kit and sets NO password. GOVERNANCE:
//  • The recovery token/link is SERVER-AUTHORITATIVE — client-side checks are UX only; the page never
//    validates or trusts a token, and never reveals whether one maps to an account.
//  • NON-DISCLOSURE (Doc-7A §4.3/§8): an invalid/expired link resolves to a UNIFORM notice that leaks
//    no account-existence signal (no "this email/account…" wording).
//  • The `?state=` preview (form/loading/invalid/interim) is a DEV/QA harness — honored ONLY outside
//    production, so a real visitor is never shown a fabricated system state (mirrors the Search screen).
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password — iVendorz",
  description: "Choose a new password for your iVendorz account.",
};

type SearchParams = { state?: string };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // DEV/QA-only preview harness — never honored in production (no fabricated state to a real visitor).
  const preview = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const invalid = preview === "invalid";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <BrandLogo height={36} />
          </Link>
        </div>

        <Card className="p-6 shadow-iv-md sm:p-8">
          {invalid ? (
            // Uniform, non-disclosing outcome for a server-rejected (invalid/expired) link — reveals
            // nothing about whether an account or email exists (Doc-7A §4.3/§8).
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-warning-subtle px-4 py-5 text-center">
                <ShieldAlert aria-hidden="true" className="size-6 text-iv-warning-muted" />
                <h1 className="text-lg font-semibold text-iv-ink-heading">
                  This reset link is invalid or has expired
                </h1>
                <p className="text-sm text-muted-foreground">
                  For your security, reset links work once and expire after a short time. Request a
                  new one to continue.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/forgot-password">Request a new link</Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/login"
                  className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
                  Set a new password
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a new password for your account. Make it strong and unique.
                </p>
              </div>
              <ResetPasswordForm
                preview={preview === "loading" || preview === "interim" ? preview : undefined}
              />
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
