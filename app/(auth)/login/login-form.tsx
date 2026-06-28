"use client";

// Login form (Doc-7E §2 / ER2) — the auth-entry sign-in control. Client Component holding only
// ephemeral form state (Doc-7C §2.3); the mutation runs through the `loginAction` server action.
// Minimal shell (the Doc-7B kit + full styling land with the Doc-7E content passes).

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "./actions";

const INITIAL_STATE: LoginActionState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} aria-describedby={state.error ? "login-error" : undefined}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error ? (
        <p id="login-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
