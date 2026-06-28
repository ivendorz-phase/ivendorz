import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Harness env bootstrap (Doc-8B §3 — the ephemeral test-DB connection comes from env). Vitest does
// NOT auto-load a project `.env*`; the local ephemeral-DB credentials live in `.env.local`
// (gitignored — CLAUDE.md §2 / .gitignore `!.env.example`). CI injects `DATABASE_URL`/`DIRECT_URL`
// as service-container env. This loader fills `process.env` from the dotfiles ONLY for keys that are
// not already set (CI/explicit env always wins) — it never overrides, never logs a value, and is a
// no-op when the file is absent. It loads ONLY the two DB connection keys the harness needs
// (`DATABASE_URL`, `DIRECT_URL`); any other dotfile key is ignored (no secret-of-record is widened).
//
// This is harness wiring (the test-DB connection seam), not application config and not a domain change.

const DB_ENV_KEYS = ["DATABASE_URL", "DIRECT_URL"] as const;

/** Minimal `KEY="value"` / `KEY=value` dotfile parser — handles the two DB keys only; no expansion. */
function parseDotenv(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/**
 * Load the DB connection env from `.env.local` then `.env` (first file wins per key), filling ONLY the
 * keys not already present in `process.env`. CI/explicit env is never overridden. No-op when neither
 * dotfile exists. Returns whether a usable `DATABASE_URL` is now present.
 *
 * NOTE: Vitest runs each test file in its OWN worker, which does NOT inherit `process.env` mutations
 * made in `globalSetup`. So this is invoked BOTH from `globalSetup` (for the migrate/role bootstrap)
 * AND as a top-level import side-effect (below) so every worker that imports the harness has the DB
 * env BEFORE the shared Prisma client first connects.
 */
export function loadTestDbEnv(cwd: string = process.cwd()): boolean {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(cwd, file);
    if (!existsSync(path)) continue;
    const parsed = parseDotenv(readFileSync(path, "utf8"));
    for (const key of DB_ENV_KEYS) {
      if (process.env[key] === undefined && parsed[key] !== undefined) {
        process.env[key] = parsed[key];
      }
    }
  }
  // DIRECT_URL falls back to DATABASE_URL (the local single-DB setup — see .env.example).
  if (process.env.DIRECT_URL === undefined && process.env.DATABASE_URL !== undefined) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
  return Boolean(process.env.DATABASE_URL);
}

// Top-level import side-effect: load the DB env eagerly so a per-file worker has it before the shared
// Prisma client (imported transitively by the harness/tests) first reads `DATABASE_URL` at connect time.
loadTestDbEnv();
