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

import { authChallengeResponse, type WireResponse } from "@/shared/http";
import { configValueQuery } from "@/modules/core/contracts";
import {
  claimCommandDedupRecord,
  COMMAND_DEDUP_WINDOW_KEY,
  findCommandDedupRecord,
  persistCommandDedupRecord,
  releaseCommandDedupRecord,
  type CommandDedupScope,
  type StoredCommandResponse,
} from "@/modules/identity/contracts";
import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
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

/**
 * §B.6 pre-execution CLAIM, production-wired (Doc-4A §14.3 in-flight protection — RV-0153 F2).
 * Used by the CREATE leg (no CAS/machine coverage): claim the scope key on the business
 * transaction BEFORE running the command. `"claimed"` → execute, then `persistWireReplay`
 * (completes the claim) or `releaseStoredClaim` (error outcome). `"lost"` → a concurrent or
 * committed within-window execution owns the key: re-read via `findStoredReplay` and return the
 * winner's stored §9.3 payload — the caller's business logic MUST NOT begin.
 */
export async function claimStoredReplay(
  scope: CommandDedupScope,
  windowPolicyKey: string,
  db?: DbExecutor,
): Promise<"claimed" | "lost"> {
  return claimCommandDedupRecord(scope, windowPolicyKey, { configValueQuery }, db);
}

/**
 * §B.6 claim release, production-wired — for an ERROR OUTCOME after a successful claim (the
 * transaction will still COMMIT, so the pending claim must not survive: errors are never cached
 * and the key must not wedge). A THROWN failure needs no release (transaction rollback).
 */
export async function releaseStoredClaim(scope: CommandDedupScope, db?: DbExecutor): Promise<void> {
  await releaseCommandDedupRecord(scope, db);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Tenant-write & tenant-create composition (W2 maintainability refactor 2A — EXTRACTION ONLY, no
// behaviour change). The active-org route handlers each hand-rolled BYTE-IDENTICAL compositions —
// the CAS-guarded write (`runTenantWrite`, replay-only) and the §14.3-claimed create
// (`runTenantCreate`, claim-guarded); both now live here once. The replay/claim/persist/transaction
// ordering below is behaviour-sensitive and is reproduced verbatim — do not reorder. (The
// organization CREATE is the one exception — a pre-membership bootstrap on a raw transaction, not an
// active-org create — and stays inline in its own handler.)
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/** The server-resolved tenant actor context a tenant-write command receives (Invariant #5 fields). */
export type TenantContext = {
  userId: string;
  activeOrgId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/** The RLS-scoped transaction executor `withActiveOrg` hands the command (the command's own tx). */
export type TenantTx = Parameters<Parameters<typeof withActiveOrg>[1]>[0];

/** Dependencies shared by every tenant-write composition — structurally the per-domain `*HandlerDeps`
 *  interfaces (each of which remains its own exported route-facing type). */
export interface TenantWriteDeps {
  resolveSession: () => Promise<AuthSession | null>;
  ensureProvisioned: typeof ensureProvisioned;
  idempotencyKey: WireIdempotencyKey;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * The shared active-org tenant-write composition (the 6.2/6.3/6.5 house shape): session → 401 ·
 * mandatory `Idempotency-Key` → 400 (the domain's own `invalidKey` token) · provision · `withActiveOrg`
 * (unresolved context → the mapper's §6.6 404 collapse) → §B.6 replay lookup → command → wire map →
 * §B.6 persist (SUCCESS-ONLY, on the SAME transaction as the audited write — the §14.3 joint rule).
 * NO claim leg: the caller's `updated_at` CAS / state machine is the single-execution guard (the create
 * path claims via `runTenantCreate`). `run` binds the command + input; `mapper(null)` fixes the 404 face.
 */
export async function runTenantWrite<TOutcome, TResult>(
  contractId: string,
  run: (ctx: TenantContext, tx: TenantTx) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  invalidKey: (message: string) => WireResponse<never>,
  deps: TenantWriteDeps,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return invalidKey("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    if (key !== undefined) {
      const replay = await findStoredReplay<TResult>(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await run(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      tx,
    );
    const wire = mapper(outcome);

    if (isOk(outcome) && key !== undefined) {
      // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
      await persistWireReplay(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        wire,
        tx,
      );
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapper(null); // §6.6 collapse (no user / no active membership).
  }
  return ran.value;
}

/**
 * The shared active-org tenant-CREATE composition (the 6.2/6.3/6.5 house shape for a create): session
 * → 401 · optional SYNTAX-FIRST leg (Doc-4A §11.2 fixed order — the handler-level validator, before
 * the key leg) · mandatory `Idempotency-Key` → 400 (the domain's own `invalidInput` token) · provision
 * · `withActiveOrg` (unresolved context → the mapper's §6.6 404 collapse) → §B.6 replay lookup → §14.3
 * CLAIM (a create has no CAS/machine leg, so the pre-execution claim is the single-execution guard —
 * RV-0153 F2) → command → wire map → §B.6 persist-on-success / release-on-error (both on the SAME
 * transaction as the audited write, the §14.3 joint rule). `windowKey` is the `[DC-5]` window POLICY key
 * (the invite create uses its own longer window); `validateSyntax` is omitted where the command owns
 * validation. Mirrors `runTenantWrite`; the ONLY delta is the claim leg + release-on-error.
 */
export async function runTenantCreate<TOutcome, TResult>(
  contractId: string,
  windowKey: string,
  run: (ctx: TenantContext, tx: TenantTx) => Promise<TOutcome>,
  mapper: (outcome: TOutcome | null) => WireResponse<TResult>,
  isOk: (outcome: TOutcome) => boolean,
  invalidInput: (message: string) => WireResponse<never>,
  deps: TenantWriteDeps,
  validateSyntax?: () => string | null,
): Promise<WireResponse<TResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // SYNTAX FIRST (Doc-4A §11.2 fixed order — the command re-runs the same exported validator; single
  // source, no re-derivation), then the §B.6 mandatory-key leg on the same category-1 slot.
  if (validateSyntax !== undefined) {
    const syntaxFailure = validateSyntax();
    if (syntaxFailure !== null) {
      return invalidInput(syntaxFailure);
    }
  }
  if (deps.idempotencyKey === null) {
    return invalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    const scope =
      key !== undefined
        ? dedupScope(contractId, context.userId, context.activeOrgId, key)
        : undefined;

    if (scope !== undefined) {
      // §B.6 replay lookup (within-window same-key → the stored response; NO re-execution).
      const replay = await findStoredReplay<TResult>(scope, windowKey, tx);
      if (replay !== null) {
        return replay;
      }

      // Doc-4A §14.3 IN-FLIGHT protection (RV-0153 F2): CLAIM the key BEFORE the command — the create
      // has no CAS/machine leg, so the claim is the single-execution guard; a concurrent same-key
      // contender blocks on this transaction's uncommitted claim, LOSES once it commits, and returns
      // the stored winner below.
      const claim = await claimStoredReplay(scope, windowKey, tx);
      if (claim === "lost") {
        const winner = await findStoredReplay<TResult>(scope, windowKey, tx);
        if (winner !== null) {
          return winner; // the §9.3 stored payload — this caller's business logic never began.
        }
        // Unreachable by construction (pending rows never commit — claim/complete/release share one
        // tx). Fail CLOSED rather than risk a second execution under one key (§14.3).
        throw new Error(
          "command-dedup: claim lost but no stored record resolved (unreachable; failing closed per Doc-4A §14.3).",
        );
      }
    }

    const outcome = await run(
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      tx,
    );
    const wire = mapper(outcome);

    if (scope !== undefined) {
      if (isOk(outcome)) {
        // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
        await persistWireReplay(scope, wire, tx);
      } else {
        // Error OUTCOME (the tx will commit): release the claim — errors are never cached and the key
        // never wedges (§9.6 retry stays live). A THROWN failure rolls the claim back.
        await releaseStoredClaim(scope, tx);
      }
    }
    return wire;
  });

  if (!ran.resolved) {
    return mapper(null); // §6.6 collapse (no user / no active membership).
  }
  return ran.value;
}
