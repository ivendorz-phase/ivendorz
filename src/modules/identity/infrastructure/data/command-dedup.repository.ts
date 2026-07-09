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
//   • CONCURRENT SAME-KEY overlap is assigned by the corpus to the CONCURRENCY model, not this
//     store (Doc-5A §9.4 row 3: "Concurrent submission (overlapping in-flight on one resource) —
//     handled by the concurrency model (§9.5)"); the commands' CAS legs own that race.
//
// The upsert is raw SQL on M1's OWN table because the scope key is a `UNIQUE NULLS NOT DISTINCT`
// constraint Prisma cannot express (house pattern; NOT cross-schema SQL).

import { prisma, Prisma, type DbExecutor } from "../../../../shared/db";
import { uuidv7 } from "../../../../shared/ids";
import type { ConfigValueQuery } from "@/modules/core/contracts";
import type { CommandDedupScope, StoredCommandResponse } from "../../contracts/types";

/**
 * Parse a `[DC-5]` duration POLICY value → milliseconds. The SAME registered `<int><unit>` notation
 * interpreter as `create-delegation-grant.command.ts`'s `durationToMs` (a plain integer = seconds);
 * kept as a PRIVATE copy here because the durationToMs CANONICALIZATION is a W2-IDN-7 carry (the 6.5
 * packet: "durationToMs canonicalization binds IDN-7") — unification lands there, never ad-hoc here.
 * Throws on an unparseable value (no invented fallback window).
 */
function windowToMs(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value * 1000;
  if (typeof value === "string") {
    const m = /^(\d+)\s*([smhd])$/.exec(value.trim());
    if (m !== null) {
      const n = Number(m[1]);
      const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
        m[2] as "s" | "m" | "h" | "d"
      ];
      return n * unitMs;
    }
  }
  throw new Error(
    "command-dedup window POLICY value is not an interpretable duration (W2-IDN-7 seed).",
  );
}

export interface FindCommandDedupDeps {
  /** `core.config_value_query.v1` — resolves the `[DC-5]` window key (never a literal). */
  configValueQuery: ConfigValueQuery;
  /** Injectable clock (deterministic window tests). Default `new Date()`. */
  now?: () => Date;
}

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

  // Window check — the `[DC-5]` POLICY duration, resolved at lookup time on the SAME executor.
  const cfg = await deps.configValueQuery({ key: windowPolicyKey }, db);
  const windowMs = windowToMs(cfg.value);
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
 * Persist (upsert) the stored response for `scope` — called ONLY after a SUCCESSFUL execution, on
 * the SAME transaction executor as the business write wherever the composition owns the transaction
 * (the §14.3 joint rule: a replay must find the cache IFF the side effect committed). The upsert
 * overwrites a post-window row in place (bounded operational update; `executed_at` re-anchors).
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
