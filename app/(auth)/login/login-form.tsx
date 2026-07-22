"use client";

// Login form (Doc-7E §2 / ER2) — the auth-entry sign-in control. Client Component holding only
// ephemeral form state (Doc-7C §2.3: the password-visibility toggle); the mutation runs through the
// `loginAction` server action (Supabase Auth sign-in). Composes the shared kit (AuthField / Input /
// Button) + the (auth) presentational helpers. Non-disclosing on failure — the action returns a
// uniform "Invalid email or password" (Doc-7A §4.3), surfaced here as an inline alert.
import { useActionState, useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, TriangleAlert } from "lucide-react";
import { Input } from "@/frontend/primitives/input";
import { Button } from "@/frontend/primitives/button";
import { AuthField } from "../_components/auth-field";
import { PasswordToggle } from "../_components/password-toggle";
import { loginAction, type LoginActionState } from "./actions";

const INITIAL_STATE: LoginActionState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={formAction}
      aria-describedby={state.error ? "login-error" : undefined}
      className="space-y-4"
    >
      {state.error ? (
        <div
          id="login-error"
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <AuthField id="email" label="Work email" icon={<Mail />}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
      </AuthField>

      <AuthField
        id="password"
        label="Password"
        icon={<Lock />}
        labelAside={
          <Link
            href="/forgot-password"
            className="rounded-sm text-[12.5px] font-medium text-iv-navy-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Forgot password?
          </Link>
        }
        trailing={
          <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
        }
      >
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          required
        />
      </AuthField>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={pending}>
        {pending ? (
          "Signing in…"
        ) : (
          <>
            Sign in
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
