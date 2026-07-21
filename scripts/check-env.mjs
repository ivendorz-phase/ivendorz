#!/usr/bin/env node
// Environment-contract check — asserts the RUNTIME-REQUIRED env vars are present (and, where the
// code imposes a shape, well-formed) BEFORE the app first needs them, so a missing/malformed
// value fails visibly and deterministically at a gate instead of at the first user action.
//
// Motivating case (M1 · W3-COMM-GRW-1 B2-2): `GROWTH_INVITE_DELIVERY_STORE_KEY` encrypts the
// invitation token at rest. Absent/malformed, a TARGETED `create_invitation` throws inside the
// issuing transaction — the whole create rolls back and no invitation is issued. That is a
// release-readiness prerequisite, not a cosmetic note (see .env.example).
//
// NEVER PRINTS A VALUE. Output is variable NAMES + pass/fail only.
//
// Usage:  node scripts/check-env.mjs [--mode=local|production]
//   local       (default) — what a dev machine / CI runner must have to run the app + tests.
//   production  — adds the deploy-time secrets that only a real environment provisions.
// `--mode=production` is implied when VERCEL_ENV=production.
//
// Reads `.env.local` then `.env` (if present) WITHOUT overriding real process env — mirroring how
// Next.js resolves them locally; on CI/hosting the values come from process env alone.
// Exit 0 = contract satisfied (warnings never fail), exit 1 = missing/malformed required var(s).

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ── env-file loading (names into process.env; values are never echoed) ──────────────────
function loadEnvFile(name) {
  const file = join(ROOT, name);
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    // Comment lines never match (a leading `#` is not a valid name start).
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key] !== undefined) continue; // real env always wins
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

// ── mode ───────────────────────────────────────────────────────────────────────────────
const modeArg = process.argv.find((a) => a.startsWith("--mode="))?.slice("--mode=".length);
const MODE = modeArg ?? (process.env.VERCEL_ENV === "production" ? "production" : "local");
if (MODE !== "local" && MODE !== "production") {
  console.error(`ENV CHECK FAILED — unknown --mode=${MODE} (expected "local" or "production").`);
  process.exit(1);
}

// ── validators (shape only — a validator NEVER receives its value into output) ──────────
// Mirrors `storeKey()` in src/modules/identity/infrastructure/security/invitation-delivery-cipher.ts
// EXACTLY: 64 hex chars, else base64 that decodes to exactly 32 bytes. Keep the two in step —
// this check exists to predict that function's outcome, not to impose a second rule.
function isThirtyTwoByteKey(value) {
  if (/^[0-9a-fA-F]{64}$/.test(value)) return true;
  return Buffer.from(value, "base64").length === 32;
}

// ── the contract ───────────────────────────────────────────────────────────────────────
// Conservative by design: `required` lists only vars WITHOUT which the app is wrong in the mode
// being checked. Everything else is a warning, so a dev-machine run never emits production noise.
const REQUIRED = [
  { name: "DATABASE_URL", why: "Prisma runtime connection" },
  { name: "DIRECT_URL", why: "Prisma migrations (non-pooler connection)" },
  {
    name: "GROWTH_INVITE_DELIVERY_STORE_KEY",
    why: "M1 invitation delivery store; absent/malformed ⇒ targeted create_invitation fails closed",
    validate: isThirtyTwoByteKey,
    expected: "32 bytes as 64 hex chars or base64 (openssl rand -hex 32)",
  },
];

const REQUIRED_PRODUCTION = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", why: "Supabase auth client" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", why: "Supabase auth client" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", why: "privileged server operations" },
  { name: "INNGEST_SIGNING_KEY", why: "verifies Inngest request signatures" },
];

// Present-in-.env.example but not fatal: absence degrades a feature, it does not make the app wrong.
const OPTIONAL = [
  "INNGEST_EVENT_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
];

const contract = MODE === "production" ? [...REQUIRED, ...REQUIRED_PRODUCTION] : REQUIRED;
const violations = [];

for (const { name, why, validate, expected } of contract) {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    violations.push(`${name} — MISSING (${why})`);
    continue;
  }
  if (validate && !validate(value)) {
    violations.push(`${name} — MALFORMED (expected ${expected}) (${why})`);
  }
}

const missingOptional = OPTIONAL.filter((n) => !process.env[n]);
if (missingOptional.length > 0) {
  console.log(
    `env check: ${missingOptional.length} optional var(s) unset — ${missingOptional.join(", ")}`,
  );
}

if (violations.length > 0) {
  console.error(`ENV CHECK FAILED (mode=${MODE}) — ${violations.length} problem(s):`);
  for (const v of violations) console.error(`  - ${v}`);
  console.error("Set them in .env.local (local) or the hosting secret store — see .env.example.");
  process.exit(1);
}

console.log(
  `ENV CHECK PASSED (mode=${MODE}) — ${contract.length} required var(s) present and well-formed.`,
);
process.exit(0);
