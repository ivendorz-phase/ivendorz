// M1 application (PRIVATE) — `identity.expire_delegation_grant.v1` (Doc-4C §C9 · 21.5 System). The
// out-of-wire System sweep that expires delegation grants whose validity window has lapsed.
//
// SYSTEM ACTOR (FIXED; §17.3) — not user-invocable. Follows the M0 outbox-worker System pattern: opens its
// OWN transaction and sets `app.is_platform_staff = 'true'` TRANSACTION-LOCAL, so the `delegation_grants`
// `_controlling_update` RLS (`… OR staff`) admits the write AND the audit `WITH CHECK` System/staff leg
// (`… OR is_platform_staff IS TRUE`) admits the append. The GUC never leaks past the transaction.
//
// EDGE: Doc-2 §5.10 `active → expired` ONLY (literal edge). `suspended`-at-`valid_to`-lapse is UNSPECIFIED
// and carried on `[ESC-IDN-DELEG-EXPIRY]` — the sweep NEVER touches `suspended` grants (the repository
// `active`-only filter enforces it, and the state machine has NO `suspended → expired` edge). IDEMPOTENT:
// the `active`-only source filter is the guard — a terminal grant is never re-expired.
//
// AUDIT: `delegation_grant_expired`, actor_type `system`, bound BY POINTER to the Doc-2 §9 delegation
// revoke/expiry family via `[ESC-IDN-AUDIT]` (delegation expiry not separately enumerated). One audit row
// per expired grant, ATOMIC with its status write (same tx). Zero §8 events ([DC-1]).
//
// REFRESH-ON-EXPIRY: the injected `DelegationRefreshPort` is invoked per expired grant AFTER commit — the
// same M3 teardown seam as revocation; the default is a genuine NO-OP (calls no M3, emits no event).
//
// POLICY (bound BY POINTER, never a literal): the sweep cadence is `identity.delegation_expiry_sweep_cadence`
// (consumed at the Inngest registration seam — `inngest/functions/expire-delegation-grants.ts`); the
// per-command idempotency window is `identity.command_dedup_window`; the create-time validity default is
// `identity.delegation_validity_default` (consumed by `create_delegation_grant`). The sweep itself needs no
// POLICY value at runtime — it acts on each grant's OWN `valid_to` column vs `now`.

import { prisma } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  findExpirableDelegationGrants,
  transitionDelegationGrantStatus,
  type ExpirableDelegationGrantRow,
} from "../../infrastructure/data/delegation-grant.repository";
import { assertTransition } from "../../domain/state-machines/delegation-grant.state-machine";
import {
  DELEGATION_GRANT_ENTITY_TYPE,
  DelegationGrantAuditAction,
} from "../../domain/audit-actions";
import type { DelegationRefreshPort, ExpireDelegationGrantsResult } from "../../contracts/types";

const DEFAULT_BATCH_SIZE = 100 as const;

/** The no-op default refresh seam — calls no M3, emits no event ([DC-1]); the seam exists to be invoked. */
const NOOP_REFRESH: DelegationRefreshPort = async () => {};

export interface ExpireDelegationGrantsDeps {
  appendAuditRecord: AppendAuditRecord;
  /** The M3 teardown seam (per expired grant). Omitted ⇒ the NO-OP default. */
  refreshPort?: DelegationRefreshPort;
  /** Injectable clock for deterministic sweep tests (defaults to `new Date()`). */
  now?: () => Date;
  /** Cap on grants expired per pass. */
  batchSize?: number;
}

/**
 * The System expiry sweep pass. Expires every `active` grant whose `valid_to` has lapsed, each write +
 * audit atomic; invokes the refresh seam per expired grant after commit. Returns the count expired.
 */
export async function expireDelegationGrantsCommand(
  deps: ExpireDelegationGrantsDeps,
): Promise<ExpireDelegationGrantsResult> {
  const now = deps.now?.() ?? new Date();
  const batchSize = deps.batchSize ?? DEFAULT_BATCH_SIZE;

  // One System transaction for the pass (staff GUC set transaction-local — the M0 worker pattern).
  const expiredGrants: ExpirableDelegationGrantRow[] = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const candidates = await findExpirableDelegationGrants(now, batchSize, tx);
    const expired: ExpirableDelegationGrantRow[] = [];

    for (const grant of candidates) {
      // STATE — assert the literal `active → expired` edge on the machine before the write.
      assertTransition("active", "expired");

      // WRITE — compare-and-set on `active`; a concurrent transition ⇒ 0 rows ⇒ skip (idempotent).
      const write = await transitionDelegationGrantStatus(
        { id: grant.id, from: "active", to: "expired", actorUserId: null },
        tx,
      );
      if (write === null) continue;

      // AUDIT — atomic with the write (SAME tx). System attribution (`actor_type = system`, no actor id);
      // `organization_id` = the grant's controlling org (business context; admitted via the staff leg).
      await deps.appendAuditRecord(
        {
          actorId: null,
          actorType: "system",
          organizationId: grant.controllingOrganizationId,
          entityType: DELEGATION_GRANT_ENTITY_TYPE,
          entityId: grant.id,
          action: DelegationGrantAuditAction.EXPIRED,
          oldValue: write.oldValue,
          newValue: write.newValue,
        },
        tx,
      );

      expired.push(grant);
    }

    return expired;
  });

  // Refresh-on-expiry seam — after commit, per expired grant. Default no-op ([DC-1]).
  const refresh = deps.refreshPort ?? NOOP_REFRESH;
  for (const grant of expiredGrants) {
    await refresh({
      delegationGrantId: grant.id,
      vendorProfileId: grant.vendorProfileId,
      representativeOrganizationId: grant.representativeOrganizationId,
    });
  }

  return { expired: expiredGrants.length };
}
