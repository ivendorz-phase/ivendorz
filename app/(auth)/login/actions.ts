"use server";

// Auth-entry server action (Doc-7E §2 / ER2) — Supabase Auth sign-in (authentication ONLY,
// Doc-7C §3.1). No `create_user` wire contract is coined (Doc-7E §2 / [ESC-7-API-SIGNUP]): the
// user record + Personal Organization + Owner membership are materialized OUT-OF-BAND by the M1
// lazy-provisioning command, invoked through the `ensureProvisioned` hook at the request-composition
// edge (WP-1.4 / `src/server/context`/`guards`), not here. This action owns sign-in + redirect only.

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/auth";

/** Outcome surfaced to the login form on a sign-in failure (success redirects, so returns nothing). */
export interface LoginActionState {
  error: string | null;
}

/**
 * Sign in with email + password via Supabase Auth. On success the cookie-bound session is set by the
 * server client and the user is redirected into the authenticated group (the active-org context +
 * first-login provisioning are resolved by the authenticated-group composition layer — Doc-7C §3.2).
 */
export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (email.length === 0 || password.length === 0) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error !== null) {
    // Uniform, non-disclosing message (never reveal whether the email exists — Doc-7A §4.3 posture).
    return { error: "Invalid email or password." };
  }

  // Authentication established; hand off to the workspace-entry route (`/dashboard`), which resolves
  // the active-org context — first-login provisioning via `ensureProvisioned` + the default
  // co-mounted lens — and redirects to the right dashboard. This action owns sign-in + redirect only;
  // the composition edge owns provisioning (Doc-7C §3.2).
  redirect("/dashboard");
}
