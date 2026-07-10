// M1 infrastructure (PRIVATE) — the §B.6 command-dedup / Idempotency-Key replay store over
// `identity.command_dedup` (W2-IDN-6.5). M1 reading/writing its OWN schema (allowed); the wire
// compositions consume this ONLY via the M1 contracts facade.
//
// FROZEN GROUNDING (see the `identity_command_dedup` migration header for the full anchor set):
// Doc-4C §B.6 (replay → cached response; no duplicate audit/side effect — the §14.3 joint rule) ·
// Doc-6A §10.3 (dedicated dedup table per the owning-module design; window = POLICY key, never a
// literal) · Doc-6C §6.1:95 (the owning-module design adoption) · Doc-5A §9.3 (the stored result +
// status + ORIGINAL reference_id are what a safe replay returns; mechanism/layer/window are
// development-document concerns — this realization).
//
// SEMANTICS (each a logged W2-IDN-6.5 judgment call — report §8):
//   • SUCCESS-ONLY caching: only a 2xx execution is stored. Errors are NEVER cached — caching a 409
//     would break the frozen §9.6 re-read-retry flow (Doc-4A §14.7: `Idempotency: required` carries
//     `CONFLICT: retryable: true` — a retry with the SAME key after a re-read MUST be able to
//     succeed), and a failed request produced no side effect, so re-execution is §14.3-safe.
//   • WINDOW: `[DC-5]` POLICY key (per contract — `identity.command_dedup_window` /
//     `identity.user_update_dedup_window`, Doc-3 v1.9) read via `core.config_value_query.v1` at
//     lookup time — never a literal; UNSEEDED until W2-IDN-7 (the IDN-4 posture: real key read,
//     test-scoped seed, no fallback — an unseeded key FAILS the read loudly).
//   • POST-WINDOW: a stale row is OVERWRITTEN by the next execution (upsert on the scope key) —
//     Doc-5A §9.4 asserts no post-window outcome; the overwrite is a bounded operational update of a
//     non-authoritative cache.
//   • CONCURRENT SAME-KEY overlap: for mutations WITH a CAS/state-machine leg the corpus assigns
//     the overlap to the CONCURRENCY model (Doc-5A §9.4 row 3) and those legs own it. For CREATE
//     (no CAS leg, no uniqueness guard) the Doc-4A §14.3 IN-FLIGHT protection (Pass4:159 —
//     "duplicate business outcomes … are prohibited under all timing conditions (completed,
//     in-progress, or concurrent)") is realized by the PRE-EXECUTION CLAIM
//     (`claimCommandDedupRecord`, RV-0153 F2): the composition claims the scope key BEFORE running
//     the command; a concurrent same-key contender BLOCKS on the uncommitted claim's unique-index
//     entry (PostgreSQL speculative-insertion wait), LOSES once the winner commits, and returns the
//     winner's stored §9.3 payload — its own business logic never begins. The claim rides the SAME
//     transaction as the business write, so a failed/aborted winner releases the key automatically
//     (crash-safe rollback; no wedged key), and an error OUTCOME releases it explicitly
//     (`releaseCommandDedupRecord`) so errors are never cached and never block a retry.
//
// The upsert/claim is raw SQL on M1's OWN table because the scope key is a `UNIQUE NULLS NOT
// DISTINCT` constraint Prisma cannot express (house pattern; NOT cross-schema SQL).

import { prisma, Prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { ConfigValueQuery } from "@/modules/core/contracts";
import { policyDurationToMs } from "../../domain/value-objects/policy-duration";
import type { CommandDedupScope, StoredCommandResponse } from "../../contracts/types";

// The `[DC-5]` window duration is interpreted by the canonical `policyDurationToMs`
// (`domain/value-objects/policy-duration.ts`) — the single source unifying the former three byte-identical
// copies (W2-IDN-7 canonicalization; RV-0153 OBS-Δ3). The `"command-dedup window POLICY"` context label
// preserves this call site's original throw message verbatim.

export interface FindCommandDedupDeps {
  /** `core.config_value_query.v1` — resolves the `[DC-5]` window key (never a literal). */
  configValueQuery: ConfigValueQuery;
  /** Injectable clock (deterministic window tests). Default `new Date()`. */
  now?: () => Date;
}

/**
 * The PENDING-claim sentinel `response_status` (RV-0153 F2). Never a real HTTP status. A claim row
 * carries it between `claimCommandDedupRecord` and the completing `persistCommandDedupRecord` /
 * releasing `releaseCommandDedupRecord` — all inside ONE transaction, so a COMMITTED pending row is
 * unreachable by construction (rollback or explicit release cleans it); the lookup still skips it
 * defensively (a pending row is never a replayable response).
 */
const CLAIM_PENDING_STATUS = 0;

/**
 * Look up the stored response for `scope` WITHIN the POLICY window (Doc-4C §B.6 safe replay).
 * Returns `null` when no row exists or the row is post-window (the next execution overwrites it).
 *
 * @param windowPolicyKey the FULL Doc-4A §18.2 reference form (e.g.
 *   `core.system_configuration.identity.command_dedup_window`).
 */
export async function findCommandDedupRecord(
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db: DbExecutor = prisma,
): Promise<StoredCommandResponse | null> {
  const row = await db.commandDedup.findFirst({
    where: {
      contractId: scope.contractId,
      actorUserId: scope.actorUserId,
      organizationId: scope.organizationId, // null matches the org-less scope rows exactly
      idempotencyKey: scope.idempotencyKey,
    },
    select: {
      responseStatus: true,
      responseBody: true,
      responseHeaders: true,
      executedAt: true,
    },
  });
  if (row === null) return null;
  if (row.responseStatus === CLAIM_PENDING_STATUS) {
    return null; // a pending claim is never a replayable response (defensive — see the sentinel doc).
  }

  // Window check — the `[DC-5]` POLICY duration, resolved at lookup time on the SAME executor.
  const cfg = await deps.configValueQuery({ key: windowPolicyKey }, db);
  const windowMs = policyDurationToMs(cfg.value, "command-dedup window POLICY");
  const now = deps.now?.() ?? new Date();
  if (row.executedAt.getTime() + windowMs <= now.getTime()) {
    return null; // post-window — Doc-5A §9.4 asserts no outcome; the caller re-executes.
  }

  return {
    status: row.responseStatus,
    body: row.responseBody,
    headers:
      row.responseHeaders === null
        ? undefined
        : (row.responseHeaders as Record<string, string> | undefined),
  };
}

/**
 * CLAIM the scope key BEFORE executing a command (the Doc-4A §14.3 in-flight protection —
 * RV-0153 F2; used by the create leg, which has no CAS/machine coverage). Must run on the SAME
 * transaction executor the business write will use. Semantics:
 *   - No row for the scope key → a PENDING claim row is inserted (uncommitted until the tx
 *     commits) → `"claimed"`; the caller executes and completes the row via
 *     `persistCommandDedupRecord` (or releases it on an error outcome).
 *   - A CONCURRENT uncommitted claim/record holds the unique-index entry → this INSERT BLOCKS
 *     (speculative-insertion wait) until that transaction resolves: winner committed → the
 *     conditional reclaim below evaluates against a fresh within-window row → 0 rows → `"lost"`
 *     (the caller re-reads and returns the winner's stored §9.3 payload — its business logic
 *     never begins); winner aborted → the insert lands → `"claimed"`.
 *   - A committed row already exists: within-window → `"lost"`; POST-window → the row is RECLAIMED
 *     in place (reset to pending, `executed_at` re-anchored — the §9.4 post-window re-execution).
 */
export async function claimCommandDedupRecord(
  scope: CommandDedupScope,
  windowPolicyKey: string,
  deps: FindCommandDedupDeps,
  db: DbExecutor = prisma,
): Promise<"claimed" | "lost"> {
  const cfg = await deps.configValueQuery({ key: windowPolicyKey }, db);
  const windowSeconds = policyDurationToMs(cfg.value, "command-dedup window POLICY") / 1000;
  const affected = await db.$executeRaw(Prisma.sql`
    INSERT INTO "identity"."command_dedup"
      ("id", "contract_id", "actor_user_id", "organization_id", "idempotency_key",
       "response_status", "response_body", "response_headers", "executed_at", "created_at", "updated_at")
    VALUES
      (${uuidv7()}::uuid, ${scope.contractId}, ${scope.actorUserId}::uuid,
       ${scope.organizationId}::uuid, ${scope.idempotencyKey},
       ${CLAIM_PENDING_STATUS}, 'null'::jsonb, NULL, now(), now(), now())
    ON CONFLICT ("contract_id", "actor_user_id", "organization_id", "idempotency_key")
    DO UPDATE SET
      "response_status"  = ${CLAIM_PENDING_STATUS},
      "response_body"    = 'null'::jsonb,
      "response_headers" = NULL,
      "executed_at"      = now(),
      "updated_at"       = now()
    WHERE "command_dedup"."executed_at" + make_interval(secs => ${windowSeconds}::float8) <= now()
  `);
  return affected === 1 ? "claimed" : "lost";
}

/**
 * RELEASE an unconsumed claim (error OUTCOME — the command returned `ok: false` without throwing,
 * so the surrounding transaction will COMMIT). Deleting the pending row keeps two frozen rules
 * true: errors are never cached (§9.6 retry stays live) and the key is never wedged for the window.
 * A THROWN failure needs no release — the transaction rollback removes the claim.
 */
export async function releaseCommandDedupRecord(
  scope: CommandDedupScope,
  db: DbExecutor = prisma,
): Promise<void> {
  await db.commandDedup.deleteMany({
    where: {
      contractId: scope.contractId,
      actorUserId: scope.actorUserId,
      organizationId: scope.organizationId,
      idempotencyKey: scope.idempotencyKey,
      responseStatus: CLAIM_PENDING_STATUS, // only ever the pending claim — never a completed record
    },
  });
}

/**
 * Persist (upsert) the stored response for `scope` — called ONLY after a SUCCESSFUL execution, on
 * the SAME transaction executor as the business write wherever the composition owns the transaction
 * (the §14.3 joint rule: a replay must find the cache IFF the side effect committed). The upsert
 * completes this transaction's own PENDING claim in place where one exists (the create leg), and
 * overwrites a post-window row (bounded operational update; `executed_at` re-anchors).
 */
export async function persistCommandDedupRecord(
  scope: CommandDedupScope,
  stored: StoredCommandResponse,
  db: DbExecutor = prisma,
): Promise<void> {
  const bodyJson = JSON.stringify(stored.body ?? null);
  const headersJson = stored.headers !== undefined ? JSON.stringify(stored.headers) : null;
  // Raw upsert against M1's OWN `identity.command_dedup` (the NULLS-NOT-DISTINCT scope key is not
  // Prisma-expressible). Parameterized throughout — never string-interpolated values.
  await db.$executeRaw(Prisma.sql`
    INSERT INTO "identity"."command_dedup"
      ("id", "contract_id", "actor_user_id", "organization_id", "idempotency_key",
       "response_status", "response_body", "response_headers", "executed_at", "created_at", "updated_at")
    VALUES
      (${uuidv7()}::uuid, ${scope.contractId}, ${scope.actorUserId}::uuid,
       ${scope.organizationId}::uuid, ${scope.idempotencyKey},
       ${stored.status}, ${bodyJson}::jsonb, ${headersJson}::jsonb, now(), now(), now())
    ON CONFLICT ("contract_id", "actor_user_id", "organization_id", "idempotency_key")
    DO UPDATE SET
      "response_status"  = EXCLUDED."response_status",
      "response_body"    = EXCLUDED."response_body",
      "response_headers" = EXCLUDED."response_headers",
      "executed_at"      = now(),
      "updated_at"       = now()
  `);
}
