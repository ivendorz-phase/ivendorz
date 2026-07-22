"use client";

// Email-verification code view — P-AUTH-08 (Doc-7E §2). Client Component holding only ephemeral view
// state (Doc-7C §2.3). PRESENTATION-ONLY: it performs NO mutation and verifies/sends NOTHING (Supabase
// Auth confirmation is not wired in this build) — a well-formed code shows an honest interim, and
// "Resend" starts a cooldown but sends nothing. Owns the screen heading so it can swap the whole panel
// to the outcome. Composes the shared kit (Button) + the (auth) helpers (OtpInput / AuthIconBadge /
// AuthResultPanel). The address is realistic MOCK seed (a wired build shows the user's pending address).
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/frontend/primitives/button";
import { AuthIconBadge } from "../_components/auth-icon-badge";
import { AuthResultPanel } from "../_components/auth-result-panel";
import { OtpInput } from "../_components/otp-input";

// A wired build shows the signed-in user's own pending address; here it is presentation seed.
const PENDING_EMAIL = "anisur@padmavalve.com.bd";
const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export function EmailVerificationView({ preview }: { preview?: "loading" }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);
  // Loading is a DEV/QA preview only — there is no real async verify in this presentation build.
  const loading = preview === "loading";

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length < CODE_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError(undefined);
    // Presentation-only: nothing is verified (the server owns the real confirmation) — honest interim.
    setDone(true);
  }

  function resend() {
    if (cooldown > 0) return;
    setCooldown(RESEND_SECONDS);
    setResent(true);
  }

  if (done) {
    return (
      <AuthResultPanel
        tone="success"
        icon={<CheckCircle2 />}
        title="Email verified"
        description="Your account is confirmed. Let’s finish setting up your workspace so you can start sourcing."
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/org-setup">Continue</Link>
          </Button>
        }
        note="Email verification isn’t wired in this preview — nothing was verified."
      />
    );
  }

  return (
    <div>
      <AuthIconBadge>
        <Mail />
      </AuthIconBadge>

      <div className="mb-6">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">
          Verify your email
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{PENDING_EMAIL}</span>. Enter it below to
          confirm your account.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate aria-busy={loading} className="space-y-2">
        <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
        <p className="text-xs text-muted-foreground">Tip: you can paste the whole code at once.</p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="mt-3 w-full gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              Verify email
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground" role="status">
        {cooldown > 0 ? (
          <>
            Resend available in{" "}
            <span className="font-semibold tabular-nums text-foreground">{cooldown}s</span>
          </>
        ) : (
          <>
            {resent ? "Code re-sent (preview — nothing was sent). " : "Didn’t get a code? "}
            <button
              type="button"
              onClick={resend}
              className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Resend
            </button>
          </>
        )}
      </p>

      <p className="mt-3 text-center text-sm text-muted-foreground">
        Wrong address?{" "}
        <Link
          href="/signup"
          className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Go back
        </Link>
      </p>
    </div>
  );
}
