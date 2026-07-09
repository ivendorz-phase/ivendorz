// M1 application (PRIVATE) — `identity.activate_membership.v1` (Doc-4C §C6 · 21.5 System). The out-of-wire
// System worker that activates a `pending` membership on the verification-complete signal (`pending → active`).
//
// SYSTEM ACTOR (FIXED; §17.3) — not user-invocable (§13). TRIGGER: the infrastructure account-verification-
// complete signal (DC-4) — NOT a Doc-2 §8 event (no identity emitter; [DC-1]) and NOT a user command
// (Doc-4C §C6). The DC-4 signal source is an infra boundary; the Inngest consumer
// (`inngest/functions/activate-membership.ts`) is its seam. This command is invoked with the target
// membership id; it opens its OWN transaction and sets `app.is_platform_staff = 'true'` TRANSACTION-LOCAL
// (the M0 outbox-worker pattern) so the memberships-write RLS + the audit `WITH CHECK` System/staff leg both
// admit the write. The GUC never leaks past the transaction.
//
// EDGE: Doc-2 §5.2 `pending → active` ONLY (the literal "verification complete" edge; §13). A membership
// already `active` is the IDEMPOTENT no-op (Doc-4C §C6 §B.6 — "a membership already `active` is not
// re-activated"): no write, no audit. Any other source state is an illegal edge (STATE) — no write, no audit.
//
// BUSINESS precondition (Doc-4C §C6): verification-complete AND the org/user are not suspended. The DC-4
// signal IS the verification-complete fact; this command additionally re-checks that the owning org and the
// bound user are `active` (organization/user participation) before activating.
//
// AUDIT: `membership_activated`, actor_type `system`, bound BY POINTER via `[ESC-IDN-AUDIT]` to the Doc-2 §9
// "Organization" membership-activation family (Doc-4C §C6 — no separately enumerated "membership activate"
// action). ATOMIC with the state write (same tx). Zero §8 events ([DC-1]).

import { prisma } from "@/shared/db";
import type { AppendAuditRecord } from "@/modules/core/contracts";
import {
  loadMembershipForActivation,
  transitionMembershipState,
} from "../../infrastructure/data/membership-lifecycle.repository";
import { assertMembershipTransition } from "../../domain/state-machines/membership.state-machine";
import { organizationParticipatesInAccessFormula } from "../../domain/policies/membership-participation.policy";
import { MEMBERSHIP_ENTITY_TYPE, MembershipAuditAction } from "../../domain/audit-actions";
import type { ActivateMembershipInput, ActivateMembershipResult } from "../../contracts/types";

export interface ActivateMembershipDeps {
  appendAuditRecord: AppendAuditRecord;
}

/**
 * Activate a `pending` membership (Doc-4C §C6 `activate_membership`). Opens its own System transaction; the
 * state write + audit append are atomic. Returns a discriminated outcome (System workers do not surface a
 * user response — this shape is for the Inngest seam + tests). Only `activated: true` performs a write.
 */
export async function activateMembershipCommand(
  input: ActivateMembershipInput,
  deps: ActivateMembershipDeps,
): Promise<ActivateMembershipResult> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    const membership = await loadMembershipForActivation(input.membershipId, tx);
    if (membership === null) return { activated: false, reason: "not_found" };

    // IDEMPOTENT — already active ⇒ no-op (no write, no audit; §B.6 platform-scope idempotency).
    if (membership.state === "active") return { activated: false, reason: "already_active" };

    // STATE — `activate_membership` operates on the `pending → active` edge ONLY (Doc-4C §C6 "literal edge
    // only"). A `suspended` membership is reinstated via a DIFFERENT operation (`set_membership_status`,
    // W2-IDN-6.2) — its `suspended → active` edge is legal on the machine but is NOT this System edge — so the
    // gate is source-state `pending`, not general machine legality. Any non-`pending` source ⇒ illegal here.
    if (membership.state !== "pending") return { activated: false, reason: "illegal_state" };

    // BUSINESS precondition — org/user not suspended (Doc-4C §C6). Fail-closed on any non-active org/user.
    if (
      !organizationParticipatesInAccessFormula(membership.orgStatus) ||
      membership.userStatus !== "active"
    ) {
      return { activated: false, reason: "precondition" };
    }

    // Assert the literal `pending → active` edge on the machine BEFORE the write.
    assertMembershipTransition("pending", "active");

    // WRITE — compare-and-set on `pending`; a concurrent activation ⇒ 0 rows ⇒ idempotent no-op.
    const write = await transitionMembershipState(
      { id: membership.id, from: "pending", to: "active", actorUserId: null },
      tx,
    );
    if (write === null) return { activated: false, reason: "already_active" };

    // AUDIT — atomic with the write (SAME tx). System attribution; `organization_id` = the membership's org.
    await deps.appendAuditRecord(
      {
        actorId: null,
        actorType: "system",
        organizationId: membership.organizationId,
        entityType: MEMBERSHIP_ENTITY_TYPE,
        entityId: membership.id,
        action: MembershipAuditAction.ACTIVATED,
        oldValue: write.oldValue,
        newValue: write.newValue,
      },
      tx,
    );

    return { activated: true };
  });
}
