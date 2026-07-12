// Password-reset confirm route (`/reset-password`) — P-AUTH-05 (Auth template · Doc-7E §2). The screen
// reached from the emailed recovery link, where the user sets a NEW password. Binds Supabase Auth
// recovery (authentication only, Doc-7C §3.1). Unauthenticated; no active-org context, no session held
// (Doc-7C §2.1). Composes the shared split-screen `AuthShell` (redesigned 2026-07-12 to the kit).
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
import { Button } from "@/frontend/primitives/button";
import { AuthShell } from "../_components/auth-shell";
import { AuthResultPanel } from "../_components/auth-result-panel";
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
    <AuthShell
      aside={{
        headline: "Choose a strong new password.",
        subcopy:
          "Almost there. Set a fresh password and you’ll be back to sourcing from verified suppliers in seconds.",
        points: [
          "Passwords are stored encrypted, never in plain text",
          "All other active sessions are signed out",
          "Your RFQs and shortlists stay exactly where they were",
        ],
        footNote:
          "Reset links are single-use and expire shortly — a safeguard that reveals nothing about your account.",
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

      {invalid ? (
        // Uniform, non-disclosing outcome for a server-rejected (invalid/expired) link — reveals
        // nothing about whether an account or email exists (Doc-7A §4.3/§8).
        <AuthResultPanel
          tone="warning"
          icon={<ShieldAlert />}
          title="This reset link is invalid or has expired"
          description="For your security, reset links work once and expire after a short time. Request a new one to continue."
          action={
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/forgot-password">Request a new link</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <ResetPasswordForm
          preview={preview === "loading" || preview === "interim" ? preview : undefined}
        />
      )}
    </AuthShell>
  );
}
