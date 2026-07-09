// App-layer §B.6 command-dedup composition helper (W2-IDN-6.5; REPOSITORY_STRUCTURE §5 `src/server`).
// The wire compositions wrap each §B.6-governed mutation with the M1 replay store (consumed ONLY via
// `@/modules/identity/contracts` — the store is M1-owned; this file holds no storage logic):
//
//   1. REQUIRE the `Idempotency-Key` header (Doc-5C §4.3: mandatory on every `identity` mutation;
//      Doc-5A §9.2 header carriage). The thin route entry parses it (`parseIdempotencyKey`); the
//      composition maps an ABSENT/over-bound key (`null`) to the domain's SYNTAX `VALIDATION` 400.
//   2. LOOK UP the scope in the store BEFORE executing — a within-window hit is the Doc-5A §9.3 safe
//      replay: the STORED result, the SAME status, the SAME ORIGINAL `reference_id`, NO re-execution
//      (no second audit row, no second side effect — the §14.3 joint rule).
//   3. PERSIST a SUCCESSFUL execution's wire response — on the SAME transaction executor as the
//      business write wherever the composition owns the transaction (atomicity of cache-write with
//      side effect); success-only (errors are never cached — §9.6 re-read-retry must stay live).
//
// TRI-STATE key discrimination [logged judgment call]: `string` = wire-supplied key (dedup active) ·
// `null` = the wire said ABSENT/invalid (→ 400, the mandatory-header rule) · `undefined` = the
// transport never supplied the concept (in-process/composition callers outside the HTTP wire — §B.6
// governs the WIRE legs; dedup inactive). Production routes always pass `string | null`.

import type { WireResponse } from "@/shared/http";
import { configValueQuery } from "@/modules/core/contracts";
import {
  findCommandDedupRecord,
  persistCommandDedupRecord,
  type CommandDedupScope,
  type StoredCommandResponse,
} from "@/modules/identity/contracts";
import type { DbExecutor } from "@/shared/db";

/** The tri-state wire key (see header): `string` active · `null` absent (400) · `undefined` off-wire. */
export type WireIdempotencyKey = string | null | undefined;

/** Rehydrate a stored §B.6 record as the replayed wire response (Doc-5A §9.3 — verbatim replay:
 *  stored body incl. the ORIGINAL `reference_id`, stored status, stored infra headers). */
export function storedToWire<T>(stored: StoredCommandResponse): WireResponse<T> {
  return {
    status: stored.status,
    // The stored body IS the originally-serialized §5.6/§6.1 envelope (persisted by `wireToStored`
    // below) — the cast rehydrates what this composition itself stored; nothing is reshaped.
    body: stored.body as WireResponse<T>["body"],
    ...(stored.headers !== undefined ? { headers: stored.headers } : {}),
  };
}

/** Serialize a wire response for the §B.6 store (status + envelope + standard infra headers). */
export function wireToStored<T>(wire: WireResponse<T>): StoredCommandResponse {
  return {
    status: wire.status,
    body: wire.body,
    ...(wire.headers !== undefined ? { headers: wire.headers } : {}),
  };
}

/** Build the replay scope (the §7.5 poisoning guard — contract × actor × org context × key). */
export function dedupScope(
  contractId: string,
  actorUserId: string,
  organizationId: string | null,
  idempotencyKey: string,
): CommandDedupScope {
  return { contractId, actorUserId, organizationId, idempotencyKey };
}

/**
 * §B.6 replay lookup, production-wired: the M1 store read with the concrete M0
 * `core.config_value_query.v1` bound for the `[DC-5]` window resolution (never a literal). Returns
 * the REPLAYED wire response (stored result · same status · same ORIGINAL `reference_id`) or `null`
 * (execute fresh). Run on the composition's transaction executor where one exists.
 */
export async function findStoredReplay<T>(
  scope: CommandDedupScope,
  windowPolicyKey: string,
  db?: DbExecutor,
): Promise<WireResponse<T> | null> {
  const stored = await findCommandDedupRecord(scope, windowPolicyKey, { configValueQuery }, db);
  return stored === null ? null : storedToWire<T>(stored);
}

/**
 * §B.6 persist, production-wired — store a SUCCESSFUL (2xx) execution's wire response, on the SAME
 * transaction executor as the business write wherever the composition owns the transaction (the
 * §14.3 joint no-duplicate rule). Non-2xx responses are NEVER cached (success-only caching — the
 * §9.6 re-read-retry flow stays live); callers may gate on their own `outcome.ok` equivalently.
 */
export async function persistWireReplay<T>(
  scope: CommandDedupScope,
  wire: WireResponse<T>,
  db?: DbExecutor,
): Promise<void> {
  if (wire.status < 200 || wire.status >= 300) return;
  await persistCommandDedupRecord(scope, wireToStored(wire), db);
}
