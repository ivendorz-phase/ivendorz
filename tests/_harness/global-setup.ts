import { applyMigrations, hasTestDatabase, ensureRestrictedRlsRole } from "./db";
import { loadTestDbEnv } from "./env";

// Vitest global setup (Doc-8B §3) — ephemeral test-DB bootstrap, run once before the suite.
//
// (0) Load the DB connection env from `.env.local`/`.env` for local dev (CI injects it directly; the
//     loader never overrides an already-set var — §env). Vitest does not auto-load a project dotfile.
// (1) When a test DB is configured, apply the realized migration set (`core` + `identity` —
//     Doc-6B/6C). This is no longer a no-op: the realized tables/RLS now exist (Wave 1).
// (2) Provision the dedicated NON-privileged RLS role used by the Band-C / `CHK-8-024` byte-equivalence
//     gate (Doc-8B §5). The local/CI connection role is `postgres` (SUPERUSER + table owner) which
//     BYPASSES RLS — a CHK-8-024 assertion on it would be vacuous. The restricted role does NOT bypass
//     RLS, so the gate proves the policy actually enforces (no false-pass). Idempotent.
//
// Without a DB, DB-dependent suites are inactive — the harness foundation still runs (the runner + the
// hermetic mock boundary need no database).
export default async function setup(): Promise<void> {
  loadTestDbEnv();
  if (hasTestDatabase()) {
    await applyMigrations();
    await ensureRestrictedRlsRole();
  } else {
    console.log(
      "[harness] DATABASE_URL not set — DB-dependent suites inactive; runner + mock-boundary foundation active.",
    );
  }
}
