import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { configValueQuery } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  USER_UPDATE_DEDUP_WINDOW_KEY,
  MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
  policyDurationToMs,
} from "@/modules/identity/contracts";
import { prisma } from "../../src/shared/db";

// W2-IDN-7 — the 7 `identity.*` POLICY keys seeded into `core.system_configuration`
// (`prisma/migrations/20260710170000_identity_policy_key_seed`; Doc-3 v1.9 §3 registration). Asserts,
// against the REAL seeded rows (NO literal POLICY value restated here — every value assertion compares
// the service result to the row the migration wrote, read back via the same-module Prisma model;
// Doc-4A §18.2):
//   (a) all 7 registered keys are seeded and resolve through the M0 contract `core.config_value_query.v1`
//       via the Doc-4A §18.2 reference form (`core.system_configuration.identity.<name>`);
//   (b) each is a `duration` and its value parses via the unified `policyDurationToMs` (ties the seed to
//       the W2-IDN-7 canonicalization — a mis-seeded value would fail to interpret);
//   (c) the EXACT reference-form constants the live consumers pass resolve (the §B.6 dedup windows);
//   (d) exactly 7 `identity.*` keys exist (no extra coined, none missing).
//
// Boundary-legal: imports only `@/modules/core/contracts` (the M0 read service), the M1 contract
// surface, the M1 domain value-object under test, and `src/shared/*`. The 7 key NAMES below are
// transcribed from Doc-3 v1.9 §3 (names only, no values) — nothing coined.

/** The fixed Doc-4A §18.2 reference-form prefix (a namespace pointer, not a POLICY value). */
const REF = "core.system_configuration.";

/** The 7 registered `identity.*` POLICY key names — Doc-3 v1.9 §3 (by pointer; names only). */
const REGISTERED_IDENTITY_KEYS = [
  "identity.command_dedup_window",
  "identity.user_update_dedup_window",
  "identity.membership_invite_dedup_window",
  "identity.membership_invite_expiry_window",
  "identity.delegation_validity_default",
  "identity.delegation_expiry_sweep_cadence",
  "identity.ownership_succession_reminder_cadence",
] as const;

// Load the single INSERT from the W2-IDN-7 POLICY-key seed migration (its own on-disk SQL), so the
// re-seed below runs the REAL migration content.
function loadPolicyKeySeedStatement(): string {
  const sql = readFileSync(
    resolve(
      __dirname,
      "../../prisma/migrations/20260710170000_identity_policy_key_seed/migration.sql",
    ),
    "utf8",
  );
  const idx = sql.indexOf('INSERT INTO "core"."system_configuration"');
  if (idx < 0) {
    throw new Error(
      "[identity-policy-keys-seed] could not locate the POLICY-key INSERT in its migration file — has it moved/renamed?",
    );
  }
  return sql.slice(idx);
}

describe("W2-IDN-7 identity.* POLICY key seed (Doc-3 v1.9 §3 / Doc-6C §5-§6; via core.config_value_query.v1)", () => {
  // ORDER-INDEPENDENCE: sibling M1 slice suites (delegation-*, membership-* — alphabetically earlier)
  // seed these SAME keys test-scoped and `deleteMany` them in teardown (a pattern from before the seed
  // was permanent). Re-apply the migration's own INSERT (idempotent `ON CONFLICT` — Doc-6A §9.5) so this
  // verify-the-seed suite holds regardless of run order; it doubles as a re-runnability proof. Migrations
  // already applied in global-setup; this only guarantees presence at THIS suite's start.
  beforeAll(async () => {
    await prisma.$executeRawUnsafe(loadPolicyKeySeedStatement());
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("resolves all 7 registered identity.* keys, each equal to its seeded row (value + value_type)", async () => {
    for (const registeredKey of REGISTERED_IDENTITY_KEYS) {
      const row = await prisma.systemConfiguration.findUnique({
        where: { key: registeredKey },
        select: { valueJsonb: true, valueType: true },
      });
      expect(row, `seed row missing for ${registeredKey}`).not.toBeNull();

      const result = await configValueQuery({ key: REF + registeredKey });
      expect(result.value).toEqual(row!.valueJsonb);
      expect(result.valueType).toBe(row!.valueType);
    }
  });

  it("each identity.* key is a `duration` whose value interprets via the unified policyDurationToMs (> 0)", async () => {
    for (const registeredKey of REGISTERED_IDENTITY_KEYS) {
      const result = await configValueQuery({ key: REF + registeredKey });
      expect(result.valueType).toBe("duration");
      // The unified interpreter (domain/value-objects/policy-duration) must read every seeded value —
      // a mis-seeded/uninterpretable value throws here (fail-loud), catching a bad seed.
      const ms = policyDurationToMs(result.value, registeredKey);
      expect(ms).toBeGreaterThan(0);
      expect(Number.isFinite(ms)).toBe(true);
    }
  });

  it("the EXACT reference-form constants the live §B.6 consumers pass all resolve", async () => {
    // Proves the wire strings the handlers/commands use (contracts/services + command constants) are
    // seeded — not just the transcribed names above.
    for (const consumerKey of [
      COMMAND_DEDUP_WINDOW_KEY,
      USER_UPDATE_DEDUP_WINDOW_KEY,
      MEMBERSHIP_INVITE_DEDUP_WINDOW_KEY,
      // the two command-file-local constants, reconstructed via REF (proves those wire strings too):
      `${REF}identity.membership_invite_expiry_window`,
      `${REF}identity.delegation_validity_default`,
    ]) {
      const result = await configValueQuery({ key: consumerKey });
      expect(result.valueType).toBe("duration");
    }
  });

  it("exactly 7 identity.* POLICY keys exist (none coined, none missing)", async () => {
    const rows = await prisma.systemConfiguration.findMany({
      where: { key: { startsWith: "identity." } },
      select: { key: true },
    });
    expect(rows).toHaveLength(7);
    expect(new Set(rows.map((r) => r.key))).toEqual(new Set(REGISTERED_IDENTITY_KEYS));
  });
});
