// Authenticated-group ROUTE GUARD (Architecture Board ruling 2026-07-15 #4 — "layout approach; do
// NOT introduce middleware"). This is the defense-in-depth gate in front of every `(app)` surface:
// `(workspace)` (`/buy/*` + `/sell/*`), `/account/*`, and `/admin/*`.
//
// WHY A LAYOUT, NOT MIDDLEWARE: `middleware.ts` would be a NEW ROOT FILE, which REPOSITORY_STRUCTURE
// §10 gates behind Board approval. A route-group layout is ordinary App Router composition
// (REPOSITORY_STRUCTURE §8) and needs no root-file exception. Public marketing (`app/(public)/*`) and
// the auth screens (`app/(auth)/*`) live in SIBLING groups, so this guard cannot reach them — their
// static rendering and SEO are untouched (Board #4: "avoid affecting SEO/public pages").
//
// SCOPE — AUTHENTICATION ONLY, never authorization:
//   This layout answers "is there a session?" and nothing else. It does NOT resolve the active org,
//   does NOT check a permission, and does NOT provision. Authorization stays where it is authoritative
//   — the API edge (`src/server/authz` → M1 `check_permission`) with RLS as the backstop. Re-deriving
//   any of that here would be the forbidden shadow check, and active-org resolution specifically is
//   M1-owned under the standing Flag-and-Halt (`[ESC-W1-CONTEXT-RESOLVE]`; Board ruling #5 — "no
//   application-edge workaround"). This guard is therefore ADDITIVE: it removes no server-side check.
//
// DEFENSE-IN-DEPTH, NOT THE PRIMARY GATE: every `(app)` surface is presentation-only today and reads
// fixtures, and the one API-wired surface (`/account` buyer profile) already resolves the session
// server-side while `/api/identity/*` independently enforces its own 401. This layout closes the
// structural gap that each FUTURE wired page must otherwise remember to close for itself.

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { resolveSupabaseSession } from "@/server/auth";

/**
 * Whether the Board-preserved clickable-demo workflow is active (Board #4: "demo/prototype mode must
 * continue to function; preserve the approved clickable demo workflow"). The `(app)` tree is
 * presentation-only, and the FE teams + owner review it without a Supabase session.
 *
 * FAIL-SAFE: the bypass is honored ONLY outside a real production deployment. A demo flag that
 * disables authentication is itself a liability, so a stray `IVENDORZ_DEMO_MODE=1` in the production
 * environment must NOT be able to unlock the authenticated tree — there, the guard always enforces.
 * Local dev and Vercel preview deployments (`VERCEL_ENV` = `development`/`preview`, or unset) honor it.
 *
 * Server-only by design: NOT a `NEXT_PUBLIC_*` var, so it is never in the browser bundle and can
 * never be flipped from the client.
 */
function isDemoModeActive(): boolean {
  return process.env.IVENDORZ_DEMO_MODE === "1" && process.env.VERCEL_ENV !== "production";
}

/**
 * Guard + pass-through for the authenticated group. Renders no chrome of its own — each surface keeps
 * its own shell (`(workspace)`, `/admin`, `/account` mount their own layouts beneath this one).
 *
 * An unauthenticated request is redirected to the login screen rather than rendering the shell.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isDemoModeActive()) {
    const session = await resolveSupabaseSession();
    if (session === null) {
      redirect("/login");
    }
  }

  return <>{children}</>;
}
