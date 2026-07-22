// Password-reset request route (`/forgot-password`) — P-AUTH-04 (Auth template · Doc-7E §2). Binds
// Supabase Auth password recovery (authentication only, Doc-7C §3.1). Unauthenticated; no active-org
// context, no session held (Doc-7C §2.1). Composes the shared split-screen `AuthShell` (dark brand
// aside + form panel) — the same frame as Login/Signup, redesigned 2026-07-12 to the iVendorz-kit.
//
// PRESENTATION-ONLY: composes the Doc-7B kit and sends NO recovery email. GOVERNANCE — non-disclosure
// (Doc-7A §4.3/§8): the confirmation is UNIFORM ("if an account exists…") and never reveals whether an
// email is registered; the request form always resolves to the same state regardless of input. The
// separate "set a new password" screen (from the emailed link) is P-AUTH-05. Aside copy is
// capability-true only — no fabricated metrics or named testimonials (honest-numbers precedent).
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { AuthShell } from "../_components/auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password — iVendorz",
  description: "Request a link to reset your iVendorz account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      aside={{
        headline: "Locked out? We’ll get you back in.",
        subcopy:
          "Enter the email tied to your account and we’ll send a secure, single-use link to reset your password.",
        points: [
          "Encrypted, single-use reset links",
          "Your RFQs and shortlists stay private",
          "Links expire after 30 minutes",
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

      <ForgotPasswordForm />
    </AuthShell>
  );
}
