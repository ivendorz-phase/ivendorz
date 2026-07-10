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
//   (d) exactly 7 `identity.*` keys exist (no extra coined, none missing);
//   (e) each seeded value equals its Doc-3 v1.9 §3 registered ("Proposed start value") — RV-0160 B-F1
//       value-conformance pin, so a value-drift (e.g. 24h→48h) can no longer ship green.
//
// Boundary-legal: imports only `@/modules/core/contracts` (the M0 read service), the M1 contract
// surface, the M1 domain value-object under test, and `src/shared/*`. The 7 key NAMES and their
// registered VALUES below are transcribed verbatim from Doc-3 v1.9 §3 (a test cannot read the frozen
// doc at runtime) — nothing coined; on any drift the frozen doc wins.

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

/**
 * The Doc-3 v1.9 §3 registered VALUE for each of the 7 keys — the "Proposed start value" column
 * (Board-confirmed §3.1), transcribed verbatim from the frozen doc as the canonical `value_jsonb`
 * duration string. A test cannot read the doc at runtime, so these are the frozen expectation encoded
 * (RV-0160 B-F1). The `Record<…keys…>` type forces this map to cover EXACTLY the 7 registered keys —
 * a missing/extra key is a compile error (fix-forward-sweeps-the-class). Nothing coined.
 */
const DOC3_REGISTERED_VALUES: Record<(typeof REGISTERED_IDENTITY_KEYS)[number], string> = {
  "identity.command_dedup_window": "24h", // Doc-3 v1.9 §3 row 1 — Proposed start value **24h**
  "identity.user_update_dedup_window": "24h", // Doc-3 v1.9 §3 row 2 — Proposed start value **24h**
  "identity.membership_invite_dedup_window": "24h", // Doc-3 v1.9 §3 row 3 — Proposed start value **24h**
  "identity.membership_invite_expiry_window": "14d", // Doc-3 v1.9 §3 row 4 — Proposed start value **14d**
  "identity.delegation_validity_default": "365d", // Doc-3 v1.9 §3 row 5 — Proposed start value **365d**
  "identity.delegation_expiry_sweep_cadence": "1h", // Doc-3 v1.9 §3 row 6 — Proposed start value **1h**
  "identity.ownership_succession_reminder_cadence": "7d", // Doc-3 v1.9 §3 row 7 — Proposed start value **7d**
};

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

  it("each identity.* key's seeded value equals its Doc-3 v1.9 §3 registered value (all 7 pinned)", async () => {
    // VALUE conformance (RV-0160 B-F1): the sibling assertions pin PRESENCE, `value_type` and
    // interpretability, but not the registered VALUE — so a value-drift (e.g. seeding `48h` where Doc-3
    // v1.9 §3 registers `24h`) would ship green. Pin every one of the 7 to its §3 registered value.
    for (const registeredKey of REGISTERED_IDENTITY_KEYS) {
      const expected = DOC3_REGISTERED_VALUES[registeredKey];

      // (a) the value the migration actually persisted into `core.system_configuration` …
      const row = await prisma.systemConfiguration.findUnique({
        where: { key: registeredKey },
        select: { valueJsonb: true },
      });
      expect(row, `seed row missing for ${registeredKey}`).not.toBeNull();
      expect(
        row!.valueJsonb,
        `${registeredKey}: seeded value must equal its Doc-3 v1.9 §3 registered value`,
      ).toEqual(expected);

      // (b) … and the value the M0 read service resolves both equal the frozen registered value.
      const result = await configValueQuery({ key: REF + registeredKey });
      expect(
        result.value,
        `${registeredKey}: resolved value must equal its Doc-3 v1.9 §3 registered value`,
      ).toEqual(expected);
    }
  });
});
