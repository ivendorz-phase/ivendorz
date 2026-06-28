// App-layer auth wiring (REPOSITORY_STRUCTURE §5) — Supabase Auth, authentication ONLY
// (CLAUDE.md §2). Authorization (check_permission, server-validated active-org context,
// org-scoped guards) is NOT here — it lives in src/server/authz + src/server/guards and
// lands with M1 (Wave 2).
//
// This module is the server-side surface (re-exports the cookie-bound server client + the
// first-login provisioning hook). Client Components import "@/server/auth/client" directly so they
// never pull next/headers.
export { createSupabaseServerClient } from "./server";
export { ensureProvisioned } from "./provisioning";
export type { AuthSession, EnsureProvisionedDeps, ProvisionIdentityResult } from "./provisioning";
export { resolveSupabaseSession } from "./session";
