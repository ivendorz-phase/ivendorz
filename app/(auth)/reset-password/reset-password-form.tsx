"use client";

// Password-reset confirm form — P-AUTH-05 (Doc-7E §2). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only (the recovery token and
// the password policy are SERVER-authoritative); it performs NO mutation and sets NO password —
// completing the form shows an honest interim and changes nothing. Owns the screen's heading so it can
// swap the whole panel to the outcome. Composes the shared kit (AuthField / Input / Button) + the
// (auth) helpers (PasswordToggle / PasswordStrength / PasswordRequirements).
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { AuthField } from "../_components/auth-field";
import { AuthIconBadge } from "../_components/auth-icon-badge";
import { AuthResultPanel } from "../_components/auth-result-panel";
import { PasswordToggle } from "../_components/password-toggle";
import { PasswordStrength } from "../_components/password-strength";
import { PasswordRequirements } from "../_components/password-requirements";

const MIN_PASSWORD = 8;

interface FieldErrors {
  password?: string;
  confirm?: string;
}

export function ResetPasswordForm({ preview }: { preview?: "loading" | "interim" }) {
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [shown, setShown] = useState({ password: false, confirm: false });
  const [done, setDone] = useState(preview === "interim");
  // Loading is a DEV/QA preview only — there is no real async submit in this presentation build.
  const loading = preview === "loading";

  function set<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: FieldErrors = {};
    if (values.password.length < MIN_PASSWORD)
      next.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (values.confirm !== values.password) next.confirm = "Passwords do not match.";
    setErrors(next);
    // Presentation-only: nothing is set (the server owns the real reset) — show the honest interim.
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <AuthResultPanel
        tone="success"
        icon={<CheckCircle2 />}
        title="Password updated"
        description="Your password has been changed and all other sessions have been signed out for your security."
        action={
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        }
        note="Setting a new password isn’t wired in this preview — nothing was changed."
      />
    );
  }

  return (
    <div>
      <AuthIconBadge>
        <Lock />
      </AuthIconBadge>

      <div className="mb-6">
        <h1 className="text-[1.7rem] font-extrabold tracking-tight text-iv-ink-heading">
          Set a new password
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Choose a new password for your account. Make it strong and something you haven’t used
          before.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate aria-busy={loading} className="space-y-4">
        <AuthField
          id="new-password"
          label="New password"
          icon={<Lock />}
          required
          error={errors.password}
          trailing={
            <PasswordToggle
              shown={shown.password}
              onToggle={() => setShown((s) => ({ ...s, password: !s.password }))}
            />
          }
        >
          <Input
            name="password"
            type={shown.password ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={loading}
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </AuthField>

        <PasswordStrength value={values.password} />

        <AuthField
          id="confirm-password"
          label="Confirm password"
          icon={<Lock />}
          required
          error={errors.confirm}
          trailing={
            <PasswordToggle
              shown={shown.confirm}
              onToggle={() => setShown((s) => ({ ...s, confirm: !s.confirm }))}
            />
          }
        >
          <Input
            name="confirm"
            type={shown.confirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={loading}
            value={values.confirm}
            onChange={(e) => set("confirm", e.target.value)}
          />
        </AuthField>

        <div className="pt-1">
          <PasswordRequirements value={values.password} />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Resetting…
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
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
