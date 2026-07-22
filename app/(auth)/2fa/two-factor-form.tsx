"use client";

// Two-factor challenge form — P-AUTH-06 (Doc-7E §2). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is FORMAT-only UX (the code and the
// MFA challenge are SERVER-authoritative); it performs NO verification and completes NO sign-in —
// a well-formed code shows an honest interim. Owns the screen heading so it can swap the whole panel
// to the outcome. Supports the authenticator (TOTP) code — entered via the 6-box OtpInput — and a
// typed backup recovery code. Composes the shared kit (AuthField / Input / Button) + (auth) helpers.
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { AuthField } from "../_components/auth-field";
import { AuthIconBadge } from "../_components/auth-icon-badge";
import { AuthResultPanel } from "../_components/auth-result-panel";
import { OtpInput } from "../_components/otp-input";

const TOTP_LENGTH = 6;
const MIN_BACKUP = 8;
// A wired build shows the signing-in user's own address; here it is presentation seed.
const ACCOUNT_EMAIL = "anisur@padmavalve.com.bd";

export function TwoFactorForm({ preview }: { preview?: "loading" | "error" | "interim" }) {
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(preview === "interim");
  // Loading is a DEV/QA preview only — there is no real async verify in this presentation build.
  const loading = preview === "loading";
  // A server-rejected code renders a uniform, non-format error (DEV/QA preview).
  const serverError = preview === "error";

  function switchMode(next: "totp" | "backup") {
    setMode(next);
    setCode("");
    setError(undefined);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim();
    if (mode === "totp" && value.length < TOTP_LENGTH) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (mode === "backup" && value.length < MIN_BACKUP) {
      setError("Enter a valid backup code.");
      return;
    }
    setError(undefined);
    // Presentation-only: nothing is verified (the server owns the real challenge) — honest interim.
    setDone(true);
  }

  if (done) {
    return (
      <AuthResultPanel
        tone="success"
        icon={<ShieldCheck />}
        title="Identity confirmed"
        description="You’re all set. Taking you to your sourcing dashboard."
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Continue</Link>
          </Button>
        }
        note="Two-factor verification isn’t wired in this preview — nothing was verified."
      />
    );
  }

  const isTotp = mode === "totp";

  return (
    <div>
      <AuthIconBadge>
        <ShieldCheck />
      </AuthIconBadge>

      <div className="mb-6">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">
          Two-factor authentication
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {isTotp ? (
            <>
              Enter the 6-digit code from your authenticator app to finish signing in as{" "}
              <span className="font-medium text-foreground">{ACCOUNT_EMAIL}</span>.
            </>
          ) : (
            <>Enter one of the backup codes you saved when you set up 2FA.</>
          )}
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate aria-busy={loading} className="space-y-4">
        {serverError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>That code isn’t valid or has expired. Please try again.</p>
          </div>
        ) : null}

        {isTotp ? (
          <div className="space-y-2">
            <OtpInput value={code} onChange={setCode} disabled={loading} label="Digit" autoFocus />
            <p className="text-xs text-muted-foreground">Codes refresh every 30 seconds.</p>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <label className="flex cursor-pointer items-center gap-2.5 pt-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                className="size-4 rounded border-input accent-iv-navy-600"
              />
              Trust this device for 30 days
            </label>
          </div>
        ) : (
          <AuthField
            id="backup-code"
            label="Backup code"
            icon={<KeyRound />}
            required
            error={error}
          >
            <Input
              name="code"
              type="text"
              autoComplete="one-time-code"
              maxLength={32}
              disabled={loading}
              placeholder="xxxx-xxxx"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </AuthField>
        )}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              {isTotp ? "Verify & sign in" : "Verify"}
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {isTotp ? "Can’t use your app?" : "Have your device back?"}
        </p>
        <button
          type="button"
          onClick={() => switchMode(isTotp ? "backup" : "totp")}
          className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm font-semibold text-iv-ink-heading transition-colors hover:border-iv-navy-400 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isTotp ? (
            <KeyRound aria-hidden="true" className="size-[18px] text-muted-foreground" />
          ) : (
            <ShieldCheck aria-hidden="true" className="size-[18px] text-muted-foreground" />
          )}
          {isTotp ? "Use a backup recovery code" : "Use your authenticator app"}
          <ChevronRight aria-hidden="true" className="ml-auto size-4 text-muted-foreground" />
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign in with a different account
        </Link>
      </p>
    </div>
  );
}
