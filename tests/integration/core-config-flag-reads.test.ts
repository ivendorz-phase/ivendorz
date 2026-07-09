import "../_harness/env"; // load the ephemeral test-DB env per worker (Doc-8B §3) before Prisma connects.
import { afterAll, describe, expect, it } from "vitest";
import { configValueQuery, featureFlagEvaluate, CoreServiceError } from "@/modules/core/contracts";
import { prisma, type Prisma } from "../../src/shared/db";
import { uuidv7 } from "../../src/shared/ids";

// W2-CORE-1 — 8B harness band: the two M0 read services against the REAL seeded `core` schema
// (Doc-4B §B8 `core.config_value_query.v1` · §B9 `core.feature_flag_evaluate.v1`; Doc-6B §3.4/§3.5).
// Boundary-legal: imports only `@/modules/core/contracts` + `src/shared/*` — never a module internal.
//
// NO LITERAL POLICY VALUES: the config assertions compare the service result against the ROW the
// seed migration wrote (read back via the same-module Prisma model) — values are never restated
// here (Doc-4A §18.2; the migration transcribed them verbatim from Doc-3 v1.0).
//
// The 18 registered `core.*` key NAMES below are transcribed from Doc-6B §5.2 (which binds Doc-3
// v1.0 §3 by pointer) — names only, no values; nothing coined.
//
// Flag fixtures: `core.feature_flags` is mutable configuration (SD=NO; DELETE permitted for admin
// ops — Doc-6B Appendix A CHK-6-030), so fixtures use a fresh run-scoped key prefix and are
// deleted in the FILE-scoped afterAll below (RV-0143: sweeps by the stable `test.w2core1.` base
// prefix, so rows leaked by earlier runs are removed too). `core.system_configuration` is likewise
// mutable-config under CHK-6-030; the executor-participation proofs create rows ONLY inside a
// deliberately rolled-back transaction (they never commit), and the afterAll additionally sweeps
// the config test-key prefix as belt-and-braces. Superuser test connection bypasses the
// platform-staff RLS backstop — the same posture every existing M0 suite runs under (RLS is
// defense-in-depth, not the model).

/** The Doc-4A §18.2 reference-form prefix (namespace pointer, not a POLICY value). */
const REF = "core.system_configuration.";

/** The 18 registered `core.*` POLICY keys — Doc-6B §5.2 (by pointer to Doc-3 v1.0 §3). */
const REGISTERED_CORE_KEYS = [
  "core.audit_query_page_size_max",
  "core.audit_query_rate_window",
  "core.audit_query_rate_reset",
  "core.audit_lookup_rate_window",
  "core.audit_lookup_rate_reset",
  "core.audit_redactable_fields_max",
  "core.audit_redaction_reason_min_chars",
  "core.redaction_dedup_window",
  "core.outbox_dispatch_max_attempts",
  "core.outbox_dispatch_backoff",
  "core.outbox_dispatch_dedup_window",
  "core.outbox_dlq_policy",
  "core.outbox_archive_retention",
  "core.outbox_archive_dedup_window",
  "core.config_change_reason_min_chars",
  "core.config_change_dedup_window",
  "core.flag_change_reason_min_chars",
  "core.flag_change_dedup_window",
] as const;

/** Stable fixture base prefix — the file-scoped afterAll sweeps `core.feature_flags` by THIS. */
const FLAG_BASE_PREFIX = "test.w2core1.";

/** Run-scoped flag-key prefix so parallel/re-runs never collide; swept by the file-scoped afterAll. */
const FLAG_PREFIX = `${FLAG_BASE_PREFIX}${uuidv7()}.`;

/**
 * Stable config test-key domain (snake_case per the Doc-3 §12.2 registered-key shape, so the
 * reference form passes §B8 V1 syntax). Rows under it are created ONLY inside rolled-back
 * transactions; the afterAll sweep is belt-and-braces (`system_configuration` = CHK-6-030
 * mutable-config).
 */
const CONFIG_TEST_KEY_PREFIX = "test_w2core1.";

/** Sentinel thrown to force transaction rollback in the executor-participation proofs. */
class RollbackSentinel extends Error {}

// FILE-scoped so it fires after BOTH suites — the flag fixtures are seeded in the second describe,
// and a suite-scoped afterAll in the first describe provably ran before any fixture existed
// (RV-0143 MINOR). Deleting by the stable base prefixes also sweeps previously leaked fixture rows.
afterAll(async () => {
  await prisma.featureFlag.deleteMany({ where: { flagKey: { startsWith: FLAG_BASE_PREFIX } } });
  await prisma.systemConfiguration.deleteMany({
    where: { key: { startsWith: CONFIG_TEST_KEY_PREFIX } },
  });
  await prisma.$disconnect();
});

async function seedFlag(
  name: string,
  enabled: boolean,
  scopeJsonb?: Record<string, unknown> | number,
): Promise<string> {
  const flagKey = FLAG_PREFIX + name;
  await prisma.featureFlag.create({
    data: {
      id: uuidv7(),
      flagKey,
      enabled,
      ...(scopeJsonb !== undefined ? { scopeJsonb: scopeJsonb as Prisma.InputJsonValue } : {}),
    },
  });
  return flagKey;
}

describe("W2-CORE-1 core.config_value_query.v1 (Doc-4B §B8 / Doc-6B §3.4)", () => {
  it("resolves all 18 registered core.* POLICY keys, each equal to its seeded row (value + value_type)", async () => {
    for (const registeredKey of REGISTERED_CORE_KEYS) {
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

  it("returns EXACTLY the Doc-4B §B8 output surface (value + value_type; no row internals)", async () => {
    const result = await configValueQuery({ key: REF + REGISTERED_CORE_KEYS[0] });
    expect(Object.keys(result).sort()).toEqual(["value", "valueType"]);
  });

  it("rejects a well-formed but unregistered key → core_config_key_not_found (REFERENCE)", async () => {
    let caught: unknown;
    try {
      await configValueQuery({ key: `${REF}core.not_a_registered_key` });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(CoreServiceError);
    expect((caught as CoreServiceError).code).toBe("core_config_key_not_found");
  });

  it("PROVES executor participation: reads a tx-created UNCOMMITTED config row through the supplied tx, then rolls back (RV-0143 B-1)", async () => {
    // Load-bearing discrimination: the row below exists ONLY inside the open transaction. Under
    // READ COMMITTED a NON-participating implementation (reading via the shared client) cannot
    // see it and deterministically throws `core_config_key_not_found`; only a read that runs on
    // the caller-supplied executor resolves it. The sentinel throw rolls the row back — it never
    // commits (`system_configuration` mutation is CHK-6-030-permitted mutable-config).
    // Run-scoped key_name (hex-only suffix keeps the §B8 V1 snake_case shape) — no unique-index
    // contention between parallel runs even while the probe tx is open.
    const registeredKey = `${CONFIG_TEST_KEY_PREFIX}executor_probe_${uuidv7().replace(/-/g, "")}`;
    let inTxResult: { value: unknown; valueType: string } | undefined;

    let caught: unknown;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.systemConfiguration.create({
          data: {
            id: uuidv7(),
            key: registeredKey,
            valueJsonb: 7, // arbitrary probe value — a TEST fixture, not a POLICY value
            valueType: "integer", // an existing Doc-3 value_type token; nothing coined
          },
        });
        inTxResult = await configValueQuery({ key: REF + registeredKey }, tx);
        throw new RollbackSentinel("roll back the probe row");
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(RollbackSentinel);
    // The tx-supplied read saw the uncommitted row → the executor was genuinely used.
    expect(inTxResult).toEqual({ value: 7, valueType: "integer" });
    // Rollback proof: the row never committed.
    const after = await prisma.systemConfiguration.findUnique({ where: { key: registeredKey } });
    expect(after).toBeNull();
  });
});

describe("W2-CORE-1 core.feature_flag_evaluate.v1 (Doc-4B §B9 / Doc-6B §3.5 — firewalled, fail-safe)", () => {
  it("unknown flag_key resolves DISABLED, not an error (fail-safe — Doc-4B §B9 V8)", async () => {
    const result = await featureFlagEvaluate({ flagKey: `${FLAG_PREFIX}never_created` });
    expect(result).toEqual({ enabled: false });
  });

  it("global flag (scope_jsonb NULL): enabled=true resolves true; enabled=false resolves false", async () => {
    const onKey = await seedFlag("global_on", true);
    const offKey = await seedFlag("global_off", false);
    expect(await featureFlagEvaluate({ flagKey: onKey })).toEqual({ enabled: true });
    expect(await featureFlagEvaluate({ flagKey: offKey })).toEqual({ enabled: false });
    // A supplied scope does not narrow a global grant.
    expect(
      await featureFlagEvaluate({ flagKey: onKey, scope: { organization_id: uuidv7() } }),
    ).toEqual({ enabled: true });
  });

  it("scoped flag resolves true ONLY for a matching evaluation scope (containment; never broader)", async () => {
    const orgId = uuidv7();
    const otherOrgId = uuidv7();
    const scopedKey = await seedFlag("org_scoped", true, { organization_id: orgId });

    // Matching scope → enabled.
    expect(
      await featureFlagEvaluate({ flagKey: scopedKey, scope: { organization_id: orgId } }),
    ).toEqual({ enabled: true });
    // Extra supplied keys are fine — the STORED constraints govern.
    expect(
      await featureFlagEvaluate({
        flagKey: scopedKey,
        scope: { organization_id: orgId, environment: "test" },
      }),
    ).toEqual({ enabled: true });
    // Mismatched org → disabled (fail-safe).
    expect(
      await featureFlagEvaluate({ flagKey: scopedKey, scope: { organization_id: otherOrgId } }),
    ).toEqual({ enabled: false });
    // No scope supplied against a scoped grant → disabled (fail-safe).
    expect(await featureFlagEvaluate({ flagKey: scopedKey })).toEqual({ enabled: false });
  });

  it("an uninterpretable stored scope resolves DISABLED (fail-safe — never broader than the store legibly grants)", async () => {
    // e.g. a bare number where a constraint object is expected (rollout spec not yet corpus-defined).
    const oddKey = await seedFlag("odd_scope", true, 50);
    expect(
      await featureFlagEvaluate({ flagKey: oddKey, scope: { organization_id: uuidv7() } }),
    ).toEqual({ enabled: false });
    expect(await featureFlagEvaluate({ flagKey: oddKey })).toEqual({ enabled: false });
  });

  it("discloses EXACTLY the resolved boolean — no scope_jsonb / row internals (Doc-6B §3.5 posture)", async () => {
    const key = await seedFlag("disclosure_shape", true, { organization_id: uuidv7() });
    const result = await featureFlagEvaluate({ flagKey: key });
    expect(Object.keys(result)).toEqual(["enabled"]);
  });

  it("stored scope {} resolves ENABLED everywhere — vacuous constraint set (RV-0143 B-2)", async () => {
    // Semantics pinned: an EMPTY constraint object imposes zero constraints, so `every` over its
    // entries is vacuously true — `{}` grants globally, exactly like a NULL/absent scope. This is
    // still fail-safe-consistent: nothing resolves BROADER than the store declares (it declares
    // no constraints).
    const key = await seedFlag("empty_scope", true, {});
    expect(await featureFlagEvaluate({ flagKey: key })).toEqual({ enabled: true });
    expect(
      await featureFlagEvaluate({ flagKey: key, scope: { organization_id: uuidv7() } }),
    ).toEqual({ enabled: true });
  });

  it("array + nested-object constraint values match structurally, mismatch fail-safe (RV-0143 B-2 — jsonEquals branches)", async () => {
    const key = await seedFlag("structured_scope", true, {
      regions: ["dhaka", "chattogram"],
      cohort: { name: "internal" },
    });
    // Structurally equal array (order-sensitive) + nested object → enabled.
    expect(
      await featureFlagEvaluate({
        flagKey: key,
        scope: { regions: ["dhaka", "chattogram"], cohort: { name: "internal" } },
      }),
    ).toEqual({ enabled: true });
    // Nested-object value mismatch → disabled (fail-safe).
    expect(
      await featureFlagEvaluate({
        flagKey: key,
        scope: { regions: ["dhaka", "chattogram"], cohort: { name: "external" } },
      }),
    ).toEqual({ enabled: false });
  });

  it("PROVES executor participation: evaluates a tx-created UNCOMMITTED flag row through the supplied tx, then rolls back (RV-0143 B-1)", async () => {
    // Load-bearing discrimination: the flag row exists ONLY inside the open transaction. Under
    // READ COMMITTED a NON-participating implementation (reading via the shared client) cannot
    // see it and — by the §B9 V8 fail-safe — deterministically returns `{enabled: false}`; only
    // a read on the caller-supplied executor resolves `{enabled: true}`. The sentinel throw rolls
    // the row back — it never commits (`feature_flags` mutation is CHK-6-030-permitted).
    const flagKey = `${FLAG_PREFIX}tx_uncommitted`;
    let inTxResult: { enabled: boolean } | undefined;

    let caught: unknown;
    try {
      await prisma.$transaction(async (tx) => {
        await tx.featureFlag.create({ data: { id: uuidv7(), flagKey, enabled: true } });
        inTxResult = await featureFlagEvaluate({ flagKey }, tx);
        throw new RollbackSentinel("roll back the probe row");
      });
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeInstanceOf(RollbackSentinel);
    // The tx-supplied read saw the uncommitted row → the executor was genuinely used.
    expect(inTxResult).toEqual({ enabled: true });
    // Rollback proof: the row never committed; the shared-client read fail-safes to disabled.
    expect(await featureFlagEvaluate({ flagKey })).toEqual({ enabled: false });
    expect(await prisma.featureFlag.findUnique({ where: { flagKey } })).toBeNull();
  });
});
