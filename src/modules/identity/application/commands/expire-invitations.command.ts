// M1 application (PRIVATE) — `identity.expire_invitation.v1` (Doc-4C §C6 · 21.5 System). The out-of-wire
// System sweep that expires `invited` memberships whose invite window has lapsed (`invited → removed`).
//
// SYSTEM ACTOR (FIXED; §17.3) — not user-invocable. Follows the M0 outbox-worker System pattern: opens its
// OWN transaction and sets `app.is_platform_staff = 'true'` TRANSACTION-LOCAL, so the memberships-write RLS
// (`… OR staff`) admits the write AND the audit `WITH CHECK` System/staff leg admits the append. The GUC
// never leaks past the transaction.
//
// EDGE: Doc-2 §5.2 `invited ──expire/revoke──▶ removed` (the expire leg). IDEMPOTENT: the `state = 'invited'`
// -only source filter is the guard — a removed invitation is never re-expired (a lost compare-and-set race is
// a 0-row no-op).
//
// WINDOW (POLICY, bound BY POINTER — never a literal): the invite lifetime is
// `identity.membership_invite_expiry_window` (Doc-4C §C6 Timer window `[DC-5]`), read via
// `core.config_value_query.v1`. The key is UNSEEDED until W2-IDN-7 — this command reads the REAL key and
// derives the cutoff from it; it NEVER falls back to a hardcoded window (the delegation validity-default
// precedent). An unparseable/absent value throws rather than inventing a window.
//
// AUDIT: `membership_removed`, actor_type `system`, bound to the ENUMERATED Doc-2 §9 "Organization"
// "membership remove" action (Doc-4C §C6 `expire_invitation` Audit). One audit row per expired invitation,
// ATOMIC with its state write (same tx). Zero §8 events (M1 frozen truth; [DC-1]).

import { prisma } from "@/shared/db";
import type { AppendAuditRecord, ConfigValueQuery } from "@/modules/core/contracts";
import {
  findExpirableInvitations,
  transitionMembershipState,
  type ExpirableInvitationRow,
} from "../../infrastructure/data/membership-lifecycle.repository";
import { assertMembershipTransition } from "../../domain/state-machines/membership.state-machine";
import { MEMBERSHIP_ENTITY_TYPE, MembershipAuditAction } from "../../domain/audit-actions";
import { policyDurationToMs } from "../../domain/value-objects/policy-duration";
import type { ExpireInvitationsResult } from "../../contracts/types";

const DEFAULT_BATCH_SIZE = 100 as const;

/** `identity.membership_invite_expiry_window` POLICY key (Doc-4C §C6 `[DC-5]`; reference form per Doc-4A
 *  §18.2). Read via `core.config_value_query.v1` — NEVER a hardcoded window literal. Seeded W2-IDN-7. */
const MEMBERSHIP_INVITE_EXPIRY_WINDOW_KEY =
  "core.system_configuration.identity.membership_invite_expiry_window" as const;

export interface ExpireInvitationsDeps {
  appendAuditRecord: AppendAuditRecord;
  /** `core.config_value_query.v1` — reads `identity.membership_invite_expiry_window` (the invite lifetime). */
  configValueQuery: ConfigValueQuery;
  /** Injectable clock for deterministic sweep tests (defaults to `new Date()`). */
  now?: () => Date;
  /** Cap on invitations expired per pass. */
  batchSize?: number;
}

/**
 * The System invite-expiry sweep pass. Expires every `invited` membership whose `created_at` precedes the
 * window cutoff (`now − membership_invite_expiry_window`), each write + audit atomic. Returns the count
 * expired. Reads the window POLICY inside the pass transaction — never a literal.
 */
export async function expireInvitationsCommand(
  deps: ExpireInvitationsDeps,
): Promise<ExpireInvitationsResult> {
  const now = deps.now?.() ?? new Date();
  const batchSize = deps.batchSize ?? DEFAULT_BATCH_SIZE;

  const expired: ExpirableInvitationRow[] = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // WINDOW — read the REAL POLICY value; derive the cutoff. Never a hardcoded window (an absent/unparseable
    // value throws → the sweep aborts rather than expiring on an invented window).
    const cfg = await deps.configValueQuery({ key: MEMBERSHIP_INVITE_EXPIRY_WINDOW_KEY }, tx);
    const cutoff = new Date(
      now.getTime() - policyDurationToMs(cfg.value, "identity.membership_invite_expiry_window"),
    );

    const candidates = await findExpirableInvitations(cutoff, batchSize, tx);
    const swept: ExpirableInvitationRow[] = [];

    for (const invitation of candidates) {
      // STATE — assert the Doc-2 §5.2 `invited → removed` (expire) edge on the machine before the write.
      assertMembershipTransition("invited", "removed");

      // WRITE — compare-and-set on `invited`; a concurrent transition ⇒ 0 rows ⇒ skip (idempotent).
      const write = await transitionMembershipState(
        { id: invitation.id, from: "invited", to: "removed", actorUserId: null },
        tx,
      );
      if (write === null) continue;

      // AUDIT — atomic with the write (SAME tx). System attribution (`actor_type = system`, no actor id);
      // `organization_id` = the invitation's org (business context; admitted via the staff leg).
      await deps.appendAuditRecord(
        {
          actorId: null,
          actorType: "system",
          organizationId: invitation.organizationId,
          entityType: MEMBERSHIP_ENTITY_TYPE,
          entityId: invitation.id,
          action: MembershipAuditAction.REMOVED,
          oldValue: write.oldValue,
          newValue: write.newValue,
        },
        tx,
      );

      swept.push(invitation);
    }

    return swept;
  });

  return { expired: expired.length };
}
