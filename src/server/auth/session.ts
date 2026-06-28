// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — the live Supabase session → `AuthSession`
// resolver. Authentication ONLY (CLAUDE.md §2): it reads the cookie-bound Supabase user and distills
// it to the auth-boundary linkage (`auth_user_id` + email) the rest of the app consumes — never a
// secret, never an authorization assertion (Doc-5C §3.1 / CHK-5A-060).
//
// BUILD-LOCAL-PARK-DEPLOY: the live cookie round-trip is the production path; it is INJECTED into the
// route handler core (`src/server/identity`) as the default `resolveSession`, so the handler is fully
// testable with a test-scoped seeded session WITHOUT a live Supabase round-trip (WP-1.5). `next/headers`
// (via `createSupabaseServerClient`) is only touched on the live path — never in unit/integration tests.

import { createSupabaseServerClient } from "./server";
import type { AuthSession } from "./provisioning";

/**
 * Resolve the authenticated subject from the cookie-bound Supabase session, or `null` when no valid
 * session is present (→ the handler returns `401`). Authentication only — no authorization is derived here.
 */
export async function resolveSupabaseSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    return null;
  }

  return { authUserId: user.id, email: user.email ?? null };
}
