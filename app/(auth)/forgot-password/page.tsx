// Password-reset request route (`/forgot-password`) — P-AUTH-04 (Auth template · Doc-7E §2). Binds
// Supabase Auth password recovery (authentication only, Doc-7C §3.1). Unauthenticated; no active-org
// context, no session held (Doc-7C §2.1). Self-contained centered layout — does NOT add an
// `(auth)/layout.tsx` (that would alter the sibling Login/Signup pages).
//
// PRESENTATION-ONLY: composes the Doc-7B kit and sends NO recovery email. GOVERNANCE — non-disclosure
// (Doc-7A §4.3/§8): the confirmation is UNIFORM ("if an account exists…") and never reveals whether an
// email is registered; the request form always resolves to the same state regardless of input. The
// separate "set a new password" screen (from the emailed link) is P-AUTH-05.
import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/frontend/brand";
import { Card } from "@/frontend/primitives/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password — iVendorz",
  description: "Request a link to reset your iVendorz account password.",
};

export default function ForgotPasswordPage() {
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-iv-ink-heading">
              Reset your password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the email for your account and we’ll send a link to reset your password.
            </p>
          </div>

          <ForgotPasswordForm />
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/login"
            className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
