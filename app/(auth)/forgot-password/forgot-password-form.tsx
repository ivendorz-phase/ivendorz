"use client";

// Password-reset request form — P-AUTH-04 (Doc-7E §2). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only; it performs NO mutation
// and sends NO email (Supabase Auth recovery is not wired in this build). GOVERNANCE — non-disclosure
// (Doc-7A §4.3/§8): a valid submit ALWAYS resolves to the SAME uniform confirmation, never revealing
// whether the address is registered (no account-existence side-channel). Owns the screen's heading so
// it can swap the whole panel to the "check your inbox" outcome (mirrors the reference). Composes the
// shared kit (AuthField / Input / Button) + the (auth) presentational helpers.
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, MailCheck, Send } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { AuthField } from "../_components/auth-field";
import { AuthIconBadge } from "../_components/auth-icon-badge";
import { AuthResultPanel } from "../_components/auth-result-panel";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (value.length === 0) {
      setError("Enter your email.");
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    // Non-disclosure: resolve to the uniform confirmation for ANY valid-format email — existence is
    // never checked or revealed. Presentation-only: nothing is actually sent.
    setSentTo(value);
  }

  if (sentTo) {
    return (
      <AuthResultPanel
        tone="success"
        icon={<MailCheck />}
        title="Check your inbox"
        description={
          <>
            If an account exists for <span className="font-medium text-foreground">{sentTo}</span>,
            we’ve sent a link to reset your password. It expires in 30 minutes — remember to check
            your spam folder.
          </>
        }
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        }
        note={
          <>
            Didn’t get it?{" "}
            <button
              type="button"
              onClick={() => {
                setSentTo(null);
                setEmail("");
              }}
              className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try a different email
            </button>
            . Email delivery isn’t wired in this preview — nothing was sent.
          </>
        }
      />
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-muted-foreground hover:text-iv-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to sign in
      </Link>

      <AuthIconBadge>
        <Lock />
      </AuthIconBadge>

      <div className="mb-6">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          No problem. Enter the email tied to your account and we’ll send you a link to reset it.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <AuthField id="reset-email" label="Work email" icon={<Mail />} error={error} required>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com.bd"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>

        <Button type="submit" size="lg" className="w-full gap-2">
          Send reset link
          <Send aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
