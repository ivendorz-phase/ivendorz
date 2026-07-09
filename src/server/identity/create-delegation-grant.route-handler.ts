// App-layer COMPOSITION for `identity.create_delegation_grant.v1` (W2-IDN-6.5; Doc-5C §5.1 —
// `POST /identity/delegation_grants` · `201` + `Location`). Issue a delegation grant from the
// CONTROLLING org (= the server-resolved active org) to a representative org over a controlled
// vendor profile (Doc-4C §C9; the §6B dual-party authority is IDN-4-realized in the command —
// wired here, never re-derived).
//
// Composition (the D7 audited-write shape + the §B.6 replay wrap):
//   1. Resolve session → `401` when unauthenticated (DC-4 pre-contract boundary).
//   2. Idempotency-Key REQUIRED (Doc-5C §4.3; §9.2 header carriage) — absent/over-bound → the §C9
//      SYNTAX `400` (`identity_delegation_invalid_input`).
//   3. `ensureProvisioned(session)` (house standard).
//   4. `withActiveOrg(session, tx => …)` — the active org IS the controlling org (Invariant #5;
//      unresolved context → the §6.6 `404` collapse). INSIDE the one transaction: §B.6 replay
//      lookup (hit → the stored response, NO re-execution) → the M1 command (validate → authorize →
//      write → audit, atomic) → wire mapping → §B.6 persist of a SUCCESSFUL response (same tx —
//      the §14.3 joint rule holds by construction).
//
// The M2 Vendor Service port (`vendorProfileControlReader`) is INJECTABLE; the production default is
// ABSENT ⇒ the command FAILS CLOSED (`not_found` — M2 is not built in Wave 2; the DC-3 resolver
// posture). Window POLICY: `identity.command_dedup_window` (unseeded until W2-IDN-7 — real read,
// never a literal). Zero §8 events ([DC-1]).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord, configValueQuery } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  createDelegationGrant,
  delegationInvalidInput,
  mapCreateDelegationGrant,
  type CreateDelegationGrantInput,
  type CreateDelegationGrantResult,
  type VendorProfileControlReader,
} from "@/modules/identity/contracts";
import { authChallengeResponse, type WireResponse } from "@/shared/http";
import {
  dedupScope,
  findStoredReplay,
  persistWireReplay,
  type WireIdempotencyKey,
} from "./command-dedup";

/** Resolve the authenticated Supabase subject, or `null` when unauthenticated (injectable). */
export type ResolveSession = () => Promise<AuthSession | null>;

/** Dependencies for the create-grant composition. All injectable (defaults bind production wiring). */
export interface CreateDelegationGrantHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — see `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey: WireIdempotencyKey;
  /** The M2 Vendor Service port (read-validation only). Omitted ⇒ the command fails closed. */
  vendorProfileControlReader?: VendorProfileControlReader;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

const CONTRACT_ID = "identity.create_delegation_grant.v1" as const;

/**
 * The HTTP face for `POST /identity/delegation_grants`. Returns `201` + `Location` (§5.6 envelope) ·
 * `401` auth-boundary · `400`/`403`/`404`/`422` (§C9 register) · the §9.3 stored replay on a
 * within-window same-key re-submission.
 */
export async function handleCreateDelegationGrant(
  input: CreateDelegationGrantInput,
  deps: CreateDelegationGrantHandlerDeps,
): Promise<WireResponse<CreateDelegationGrantResult>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  // §B.6 mandatory-key SYNTAX leg (Doc-5C §4.3) — before any semantic processing.
  if (deps.idempotencyKey === null) {
    return delegationInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    // §B.6 replay lookup (within-window same-key → the stored response; NO re-execution).
    if (key !== undefined) {
      const replay = await findStoredReplay<CreateDelegationGrantResult>(
        dedupScope(CONTRACT_ID, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await createDelegationGrant(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      {
        appendAuditRecord,
        configValueQuery,
        ...(deps.vendorProfileControlReader !== undefined
          ? { vendorProfileControlReader: deps.vendorProfileControlReader }
          : {}),
      },
      tx,
    );
    const wire = mapCreateDelegationGrant(outcome);

    // §B.6 persist — SUCCESS-ONLY, same tx as the audited write (the §14.3 joint rule).
    if (outcome.ok && key !== undefined) {
      await persistWireReplay(
        dedupScope(CONTRACT_ID, context.userId, context.activeOrgId, key),
        wire,
        tx,
      );
    }
    return wire;
  });

  // Unresolved active-org context (no user / no active membership) → the §6.6 `404` collapse.
  if (!ran.resolved) {
    return mapCreateDelegationGrant(null);
  }
  return ran.value;
}
