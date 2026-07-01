// Email-verification route (`/verify-email`) — P-AUTH-08 (Auth template · Doc-7E §2). The post-signup
// "verify your email" screen (and the link-landing outcome). Binds Supabase Auth email confirmation
// (authentication only, Doc-7C §3.1). Unauthenticated shell; no active-org context, no session held
// (Doc-7C §2.1). Self-contained centered layout — does NOT add an `(auth)/layout.tsx`.
//
// PRESENTATION-ONLY: composes the Doc-7B kit and sends/verifies NOTHING. GOVERNANCE:
//  • The confirmation token is SERVER-AUTHORITATIVE — the page never validates or trusts it.
//  • NON-DISCLOSURE (Doc-7A §4.3/§8): an invalid/expired link resolves to a UNIFORM notice with no
//    account-existence signal.
//  • The `?state=` preview (pending/verified/invalid/loading) is a DEV/QA harness — honored ONLY
//    outside production (mirrors Search / P-AUTH-05/06/07).
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { Button } from "@/frontend/primitives/button";
import { EmailVerificationView } from "./email-verification-view";

export const metadata: Metadata = {
  title: "Verify your email — iVendorz",
  description: "Confirm your email address to finish setting up your iVendorz account.",
};

type SearchParams = { state?: string };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  // DEV/QA-only preview harness — never honored in production.
  const raw = process.env.NODE_ENV !== "production" ? sp.state : undefined;
  const verified = raw === "verified";
  const invalid = raw === "invalid";

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
          {verified ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-success-subtle px-4 py-5 text-center">
                <CheckCircle2 aria-hidden="true" className="size-6 text-iv-success-muted" />
                <h1 className="text-lg font-semibold text-iv-ink-heading">
                  Your email is verified
                </h1>
                <p className="text-sm text-muted-foreground">
                  You’re all set — sign in to continue setting up your account.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Continue to sign in</Link>
              </Button>
            </div>
          ) : invalid ? (
            // Uniform, non-disclosing outcome for a server-rejected (invalid/expired) link.
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-warning-subtle px-4 py-5 text-center">
                <ShieldAlert aria-hidden="true" className="size-6 text-iv-warning-muted" />
                <h1 className="text-lg font-semibold text-iv-ink-heading">
                  This verification link is invalid or has expired
                </h1>
                <p className="text-sm text-muted-foreground">
                  For your security, verification links expire after a short time. Sign in to
                  request a new one.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <EmailVerificationView preview={raw === "loading" ? "loading" : undefined} />
          )}
        </Card>
      </div>
    </main>
  );
}
