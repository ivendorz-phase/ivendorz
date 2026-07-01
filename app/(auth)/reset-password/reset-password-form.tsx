"use client";

// Password-reset confirm form — P-AUTH-05 (Doc-7E §2). Client Component holding only ephemeral form
// state (Doc-7C §2.3). PRESENTATION-ONLY: client-side validation is UX only (the recovery token and
// the password policy are SERVER-authoritative); it performs NO mutation and sets NO password —
// completing the form shows an honest interim and changes nothing. Composes the shared kit
// (FormField / Input / Button).
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Info, Loader2, ShieldCheck } from "lucide-react";
import { FormField } from "@/frontend/components/form-field";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";

const MIN_PASSWORD = 8;

interface FieldErrors {
  password?: string;
  confirm?: string;
}

export function ResetPasswordForm({ preview }: { preview?: "loading" | "interim" }) {
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
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
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-iv-info-subtle px-4 py-5 text-center">
          <ShieldCheck aria-hidden="true" className="size-6 text-iv-info-muted" />
          <h2 className="text-base font-semibold text-iv-ink-heading">Almost there</h2>
          <p className="text-sm text-iv-info-muted" role="status">
            Setting a new password is coming online soon — you’ll be able to finish here shortly.
            Nothing was changed.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={loading} className="space-y-4">
      <FormField
        id="new-password"
        label="New password"
        required
        description={`Use at least ${MIN_PASSWORD} characters.`}
        error={errors.password}
      >
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          disabled={loading}
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
        />
      </FormField>

      <FormField id="confirm-password" label="Confirm new password" required error={errors.confirm}>
        <Input
          name="confirm"
          type="password"
          autoComplete="new-password"
          disabled={loading}
          value={values.confirm}
          onChange={(e) => set("confirm", e.target.value)}
        />
      </FormField>

      {/* Reinforces the server-authoritative, single-use token posture — no account-existence signal. */}
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>For your security, this link works once and expires shortly.</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
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
  );
}
