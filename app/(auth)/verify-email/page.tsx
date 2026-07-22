// Email-verification route (`/verify-email`) — P-AUTH-08 (Auth template · Doc-7E §2). The post-signup
// "verify your email" screen (and the link-landing outcome). Binds Supabase Auth email confirmation
// (authentication only, Doc-7C §3.1). Unauthenticated; no active-org context, no session held
// (Doc-7C §2.1). Composes the shared split-screen `AuthShell` (redesigned 2026-07-12 to the kit).
//
// PRESENTATION-ONLY: composes the Doc-7B kit and sends/verifies NOTHING. GOVERNANCE:
//  • The confirmation token/code is SERVER-AUTHORITATIVE — the page never validates or trusts it.
//  • NON-DISCLOSURE (Doc-7A §4.3/§8): an invalid/expired link resolves to a UNIFORM notice with no
//    account-existence signal.
//  • The `?state=` preview (pending/verified/invalid/loading) is a DEV/QA harness — honored ONLY
//    outside production (mirrors Search / P-AUTH-05/06/07).
// The screen now uses a 6-digit CODE entry (the redesign reference), not a "click the link" display;
// the interaction is presentation-only either way (Supabase owns the real confirmation).
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/frontend/brand";
import { Button } from "@/frontend/primitives/button";
import { AuthShell } from "../_components/auth-shell";
import { AuthResultPanel } from "../_components/auth-result-panel";
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
    <AuthShell
      aside={{
        headline: "One quick check before you start.",
        subcopy:
          "Verifying your email keeps your account secure and makes sure vendor quotes reach the right inbox.",
        points: ["Confirms you own the address", "Unlocks RFQ posting", "Takes less than a minute"],
        footNote:
          "Default-private by design — your sourcing activity is visible only to you and the vendors you invite.",
      }}
    >
      {/* Top bar — mobile brand (the aside is hidden below lg). */}
      <div className="mb-8 flex items-center">
        <Link
          href="/"
          className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:hidden"
        >
          <BrandLogo height={30} />
        </Link>
      </div>

      {verified ? (
        <AuthResultPanel
          tone="success"
          icon={<CheckCircle2 />}
          title="Email verified"
          description="You’re all set — sign in to finish setting up your account."
          action={
            <Button asChild size="lg" className="w-full">
              <Link href="/login">Continue to sign in</Link>
            </Button>
          }
        />
      ) : invalid ? (
        // Uniform, non-disclosing outcome for a server-rejected (invalid/expired) link.
        <AuthResultPanel
          tone="warning"
          icon={<ShieldAlert />}
          title="This verification link is invalid or has expired"
          description="For your security, verification links expire after a short time. Sign in to request a new one."
          action={
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          }
        />
      ) : (
        <EmailVerificationView preview={raw === "loading" ? "loading" : undefined} />
      )}
    </AuthShell>
  );
}
