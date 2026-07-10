"use client";

// Password-reset request form — P-AUTH-04 (Doc-7E §2). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only; it performs NO mutation
// and sends NO email (Supabase Auth recovery is not wired in this build). GOVERNANCE — non-disclosure
// (Doc-7A §4.3/§8): a valid submit ALWAYS resolves to the SAME uniform confirmation, never revealing
// whether the address is registered (no account-existence side-channel). Composes the shared kit
// (FormField / Input / Button).
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";

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
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-success-subtle px-4 py-5 text-center">
          <MailCheck aria-hidden="true" className="size-6 text-iv-success-muted" />
          <h2 className="text-base font-semibold text-iv-ink-heading">Check your email</h2>
          <p className="text-sm text-muted-foreground" role="status">
            If an account exists for <span className="font-medium text-foreground">{sentTo}</span>,
            we’ve sent a link to reset your password. The link expires shortly.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Didn’t get it? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setEmail("");
            }}
            className="rounded-sm font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            try a different email
          </button>
          .
        </p>

        {/* Honest interim — email delivery is not wired in this presentation build. */}
        <p className="text-xs text-muted-foreground">
          Email delivery isn’t wired in this preview — nothing was sent.
        </p>

        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField
        id="reset-email"
        label="Email"
        required
        description="We’ll send the reset link to this address."
        error={error}
      >
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com.bd"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>

      <Button type="submit" className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
