"use client";

// Email-verification "check your inbox" view — P-AUTH-08 (Doc-7E §2). Client Component holding only
// ephemeral view state (Doc-7C §2.3). PRESENTATION-ONLY: it performs NO mutation and sends NO email
// (Supabase Auth confirmation is not wired in this build) — "Resend" shows an honest inline note and
// sends nothing. Composes the shared kit (Button). The address is realistic MOCK seed.
import { useState } from "react";
import Link from "next/link";
import { Info, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/frontend/primitives/button";

// A wired build shows the signed-in user's own pending address; here it is presentation seed.
const PENDING_EMAIL = "anisur@padmavalve.com.bd";

export function EmailVerificationView({ preview }: { preview?: "loading" }) {
  const [resent, setResent] = useState(false);
  // Loading is a DEV/QA preview only — there is no real async resend in this presentation build.
  const loading = preview === "loading";

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-lg bg-iv-brand-50 text-iv-brand-700"
        >
          <MailCheck className="size-7" />
        </span>
        <h1 className="text-xl font-bold tracking-tight text-iv-ink-heading">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We’ve sent a verification link to{" "}
          <span className="font-medium text-foreground">{PENDING_EMAIL}</span>. Open it to activate
          your account.
        </p>
      </div>

      {resent ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-md border border-border bg-iv-info-subtle px-3 py-2 text-sm text-iv-info-muted"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>A new verification link is on its way. (Preview — nothing was sent.)</p>
        </div>
      ) : null}

      <Button type="button" className="w-full" disabled={loading} onClick={() => setResent(true)}>
        {loading ? (
          <>
            <Loader2 aria-hidden="true" className="animate-spin" />
            Sending…
          </>
        ) : (
          "Resend verification email"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Wrong address or already verified?{" "}
        <Link
          href="/login"
          className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
