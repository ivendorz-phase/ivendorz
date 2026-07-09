// App-layer COMPOSITIONS for the three §C9 lifecycle state commands (W2-IDN-6.5; Doc-5C §5.1 —
// each a named `POST` sub-resource on the item, success `200`):
//   `identity.suspend_delegation_grant.v1`   — `active → suspended`
//   `identity.reinstate_delegation_grant.v1` — `suspended → active` (window open — `Doc-2_Patch_v1.0.7` rule 3)
//   `identity.revoke_delegation_grant.v1`    — `active|suspended → revoked` (terminal)
//
// All three share ONE composition shape (the commands own the frozen §C9 validation order + the D7
// audited write; dual-party authority is IDN-4-realized — wired, never re-derived):
//   session → 401 · Idempotency-Key REQUIRED (Doc-5C §4.3) → 400 · provision · `withActiveOrg`
//   (controlling org = active org) → §B.6 replay lookup → command → wire map → §B.6 persist
//   (success-only, same tx — the §14.3 joint rule).
//
// The revoke wire face strips `updated_at` (the frozen §C9 revoke response omits it). The M3
// refresh-on-revocation teardown stays the injected NO-OP seam ([DC-1] — NOT this WP's to wire).
// Zero §8 events. Window POLICY: `identity.command_dedup_window` (unseeded until W2-IDN-7).

import { ensureProvisioned, type AuthSession } from "@/server/auth";
import { withActiveOrg } from "@/server/context";
import { appendAuditRecord } from "@/modules/core/contracts";
import {
  COMMAND_DEDUP_WINDOW_KEY,
  delegationInvalidInput,
  mapDelegationGrantLifecycle,
  mapRevokeDelegationGrant,
  reinstateDelegationGrant,
  revokeDelegationGrant,
  suspendDelegationGrant,
  type DelegationGrantLifecycleInput,
  type DelegationGrantLifecycleOutcome,
  type DelegationGrantLifecycleResult,
  type RevokeDelegationGrantWireResult,
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

/** Dependencies for a delegation lifecycle composition (uniform across the three commands). */
export interface DelegationGrantLifecycleHandlerDeps {
  resolveSession: ResolveSession;
  ensureProvisioned: typeof ensureProvisioned;
  /** The wire `Idempotency-Key` (tri-state — see `command-dedup.ts`). Routes always pass string|null. */
  idempotencyKey: WireIdempotencyKey;
  /** Caller IP for the audit (Doc-2 §9; redaction-aware). Optional. */
  ipAddress?: string | null;
  /** Caller user-agent for the audit (Doc-2 §9; redaction-aware). Optional. */
  userAgent?: string | null;
}

type LifecycleCommand = (
  input: DelegationGrantLifecycleInput,
  ctx: {
    userId: string;
    activeOrgId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
  deps: { appendAuditRecord: typeof appendAuditRecord },
  db: Parameters<Parameters<typeof withActiveOrg>[1]>[0],
) => Promise<DelegationGrantLifecycleOutcome>;

/** The one shared lifecycle composition (see header). `mapper` fixes the contract's wire face. */
async function handleLifecycle<T>(
  contractId: string,
  command: LifecycleCommand,
  mapper: (outcome: DelegationGrantLifecycleOutcome | null) => WireResponse<T>,
  input: DelegationGrantLifecycleInput,
  deps: DelegationGrantLifecycleHandlerDeps,
): Promise<WireResponse<T>> {
  const session = await deps.resolveSession();
  if (session === null) {
    return authChallengeResponse();
  }

  if (deps.idempotencyKey === null) {
    return delegationInvalidInput("Idempotency-Key header is required.");
  }
  const key = deps.idempotencyKey;

  await deps.ensureProvisioned(session);

  const ran = await withActiveOrg(session, async (tx, context) => {
    if (key !== undefined) {
      const replay = await findStoredReplay<T>(
        dedupScope(contractId, context.userId, context.activeOrgId, key),
        COMMAND_DEDUP_WINDOW_KEY,
        tx,
      );
      if (replay !== null) {
        return replay;
      }
    }

    const outcome = await command(
      input,
      {
        userId: context.userId,
        activeOrgId: context.activeOrgId,
        ipAddress: deps.ipAddress ?? null,
        userAgent: deps.userAgent ?? null,
      },
      { appendAuditRecord },
      tx,
    );
    const wire = mapper(outcome);

    if (outcome.ok && key !== undefined) {
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

/** The HTTP face for `POST /identity/delegation_grants/{id}/suspend_delegation_grant` (`200`). */
export async function handleSuspendDelegationGrant(
  input: DelegationGrantLifecycleInput,
  deps: DelegationGrantLifecycleHandlerDeps,
): Promise<WireResponse<DelegationGrantLifecycleResult>> {
  return handleLifecycle(
    "identity.suspend_delegation_grant.v1",
    (i, c, d, tx) => suspendDelegationGrant(i, c, d, tx),
    mapDelegationGrantLifecycle,
    input,
    deps,
  );
}

/** The HTTP face for `POST /identity/delegation_grants/{id}/reinstate_delegation_grant` (`200`) —
 *  contract #25, REAL since W2-IDN-6.5 (`Doc-2_Patch_v1.0.7`; reject-expired inside the §C9 register). */
export async function handleReinstateDelegationGrant(
  input: DelegationGrantLifecycleInput,
  deps: DelegationGrantLifecycleHandlerDeps,
): Promise<WireResponse<DelegationGrantLifecycleResult>> {
  return handleLifecycle(
    "identity.reinstate_delegation_grant.v1",
    (i, c, d, tx) =>
      reinstateDelegationGrant(
        { delegationGrantId: i.delegationGrantId, updatedAt: i.updatedAt },
        c,
        d,
        tx,
      ),
    mapDelegationGrantLifecycle,
    input,
    deps,
  );
}

/** The HTTP face for `POST /identity/delegation_grants/{id}/revoke_delegation_grant` (`200`; the
 *  frozen revoke response — no `updated_at`). The M3 teardown seam stays the [DC-1] no-op default. */
export async function handleRevokeDelegationGrant(
  input: DelegationGrantLifecycleInput,
  deps: DelegationGrantLifecycleHandlerDeps,
): Promise<WireResponse<RevokeDelegationGrantWireResult>> {
  return handleLifecycle(
    "identity.revoke_delegation_grant.v1",
    (i, c, d, tx) => revokeDelegationGrant(i, c, d, tx),
    mapRevokeDelegationGrant,
    input,
    deps,
  );
}
