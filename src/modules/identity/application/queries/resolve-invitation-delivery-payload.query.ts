// M1 application (PRIVATE) — `identity.resolve_invitation_delivery_payload.v1` (Doc-4C v1.0.3
// §C13 · 21.3-with-response). P1 Growth Hub core slice; COMPLETED by W3-COMM-GRW-1 (B2-2 — the
// P1 Board carry: the secure delivery store landed with the M6 consumer).
//
// AUDIENCE — INTERNAL-SERVICE, M6 SOLE CALLER (binding; the frozen §C3 `get_membership` fence
// precedent): NO wire row exists or may be added (Doc-5C v1.0.1 §4 — out-of-wire set 7 → 8;
// packet §B6 "System-internal, no public REST row"); consumption is in-process/service-lane only,
// by the M6 `InvitationIssued` consumer (`comm.dispatch_invitation_delivery.v1`, Doc-4H
// GrowthDelivery Patch v1.0.1 §HB-3.6) and its §2 retry guard. Never user-invocable, never public.
//
// GI-3 EXCEPTION (the ONLY one): this contract is the SOLE path sanctioned to surface
// `recipient_identifier` + a token-bearing URL to M6, transiently, delivery-only (Doc-6C v1.0.4
// §5, the second sanctioned cross-tenant read path). It runs in its own transaction under the
// transaction-local staff-GUC service context (the resolve-token idiom); the app-layer column
// allow-list is the binding.
//
// SECURE-STORE REALIZATION (B2-2 — rides the Doc-6C v1.0.4 §5 `[ESC-6-API]` store-shape marker;
// semantics pinned by §C13 + Doc-3 v1.14 key 6): after the definitive liveness checks pass, the
// stored token CIPHERTEXT (`invitation_delivery_secrets` — written by `create_invitation` in the
// issuing txn; AES-256-GCM, key from env, never logged) is decrypted JUST-IN-TIME, a fresh
// ONE-TIME URL nonce is minted (`invitation_delivery_url_nonces`; TTL =
// `identity.growth_invite_delivery_url_ttl`, the seeded 15m POLICY key — read via
// `core.config_value_query.v1`, NEVER a literal), and the SHORT-LIVED/ONE-TIME
// `signed_invitation_url` is built against the Lane-A `/invite?token=…` ingress. EVERY resolve
// mints a FRESH URL (the §2 retry rule: the stale one is never re-sent). The raw token appears
// ONLY inside the returned URL — never logged, never in an error, never persisted in plaintext.
// [Operational-state note: the nonce mint is a §10.3-class OPERATIONAL write inside this 21.3
// read (the CHK-6-072 idempotency-store class — regenerable service state, never a Doc-2
// aggregate); the read stays audit-free/event-free per §17.1.]
//
// ERROR SPLIT (the Doc-4H F-1/F-2 seam reconciliation, §B.5 REFERENCE ≠ DEPENDENCY): unknown or
// malformed `delivery_reference_id`, or an invitation that is not live (`revoked`/`expired`) or
// not targeted → the DEFINITIVE `identity_growth_invite_delivery_not_resolvable` (REFERENCE,
// retryable:false — M6 classifies permanent failure and NEVER re-queues). The transient
// `identity_growth_invite_delivery_unavailable` (DEPENDENCY, retryable:true) marks a resolvable
// reference the service cannot currently serve — here: a pre-store P1 row with no persisted
// secret, an absent/malformed store key, or an undecryptable ciphertext (all service-side
// conditions outside the reconciled definitive register; none discloses token material).

import { configValueQuery, type ConfigValueQuery } from "@/modules/core/contracts";
import { prisma } from "../../../../shared/db";
import { UUID_PATTERN } from "../commands/_validation";
import { policyDurationToMs } from "../../domain/value-objects/policy-duration";
import {
  decryptInvitationToken,
  DeliveryStoreKeyUnavailableError,
} from "../../infrastructure/security/invitation-delivery-cipher";
import { buildSignedInvitationUrl } from "../../infrastructure/security/signed-invitation-url";
import {
  loadDeliverySecret,
  mintUrlNonce,
} from "../../infrastructure/data/invitation-delivery-store.repository";
import type {
  GrowthRecipientTypeValue,
  ResolveInvitationDeliveryPayloadInput,
  ResolveInvitationDeliveryPayloadOutcome,
} from "../../contracts/types";

// Doc-4C v1.0.3 §C13 delivery register (frozen codes — bound by pointer, never coined).
const NOT_RESOLVABLE_CODE = "identity_growth_invite_delivery_not_resolvable";
const UNAVAILABLE_CODE = "identity_growth_invite_delivery_unavailable";

/** The Doc-3 v1.14 key 6 reference form (Doc-4A §18.2; seeded 15m by `identity_growth_hub`). */
export const GROWTH_INVITE_DELIVERY_URL_TTL_KEY =
  "core.system_configuration.identity.growth_invite_delivery_url_ttl" as const;

/** The definitive not-resolvable outcome (REFERENCE, retryable:false — M6 never re-queues). */
function notResolvable(): ResolveInvitationDeliveryPayloadOutcome {
  return {
    ok: false,
    error: {
      errorClass: "REFERENCE",
      errorCode: NOT_RESOLVABLE_CODE,
      message: "The delivery reference does not resolve to a deliverable invitation.",
    },
  };
}

/** The transient unavailable outcome (DEPENDENCY, retryable:true — M6 may retry under budget). */
function unavailable(): ResolveInvitationDeliveryPayloadOutcome {
  return {
    ok: false,
    error: {
      errorClass: "DEPENDENCY",
      errorCode: UNAVAILABLE_CODE,
      message: "The delivery payload service is not currently able to serve this reference.",
    },
  };
}

/** Injected M0 POLICY read (defaults to the concrete `core.config_value_query.v1`). */
export interface ResolveInvitationDeliveryPayloadDeps {
  configValueQuery: ConfigValueQuery;
}

/**
 * Resolve a `delivery_reference_id` (from the `InvitationIssued` event) to the transient delivery
 * payload `{recipient_type, recipient_identifier, signed_invitation_url}` (Doc-4C v1.0.3 §C13).
 * The definitive liveness checks gate; a fresh short-lived/one-time signed URL is minted per call.
 */
export async function resolveInvitationDeliveryPayload(
  input: ResolveInvitationDeliveryPayloadInput,
  deps: ResolveInvitationDeliveryPayloadDeps = { configValueQuery },
  db: typeof prisma = prisma,
): Promise<ResolveInvitationDeliveryPayloadOutcome> {
  // Malformed/non-UUID ref → the in-register DEFINITIVE not-resolvable (L2-MINOR-1 ruling): a
  // garbage reference is definitively unresolvable — M6 must never re-queue it.
  if (
    typeof input.deliveryReferenceId !== "string" ||
    !UUID_PATTERN.test(input.deliveryReferenceId)
  ) {
    return notResolvable();
  }

  return db.$transaction(async (tx) => {
    // Service-lane context — transaction-local ONLY (never leaks past this tx).
    await tx.$executeRaw`SELECT set_config('app.is_platform_staff', 'true', true)`;

    // The §10.3-class store row + the invitation's liveness columns (the allow-list: recipient
    // type/identifier + state/expires_at — nothing broader; Doc-6C v1.0.4 §5).
    const ref = await tx.invitationDeliveryRef.findUnique({
      where: { deliveryReferenceId: input.deliveryReferenceId },
      select: {
        growthInvitation: {
          select: {
            state: true,
            expiresAt: true,
            recipientType: true,
            recipientIdentifier: true,
            deletedAt: true,
          },
        },
      },
    });

    const invitation = ref?.growthInvitation ?? null;
    const live =
      invitation !== null &&
      invitation.deletedAt === null &&
      invitation.state === "issued" &&
      invitation.expiresAt.getTime() > Date.now();

    // DEFINITIVE checks: unknown ref, non-live, or not targeted → not-resolvable (never re-queue).
    // (Redemption CAPACITY is deliberately NOT a resolve predicate — an exhausted-but-live
    // targeted invitation still resolves; GI-1 gates at redemption, Doc-4H §2.)
    if (ref === null || !live || invitation.recipientIdentifier === null) {
      return notResolvable();
    }

    // SECURE-STORE leg (B2-2): recover the raw token ONLY for URL minting.
    const secret = await loadDeliverySecret(input.deliveryReferenceId, tx);
    if (secret === null) {
      // A resolvable reference with no persisted secret (pre-store P1 residue) — TRANSIENT.
      return unavailable();
    }
    let rawToken: string | null;
    try {
      rawToken = decryptInvitationToken(secret.tokenCiphertext, secret.tokenNonce);
    } catch (e) {
      if (e instanceof DeliveryStoreKeyUnavailableError) return unavailable();
      throw e;
    }
    if (rawToken === null) return unavailable();

    // The POLICY-bound URL TTL (Doc-3 v1.14 key 6 — read live, never a literal; Doc-4A §18.2).
    const ttlMs = policyDurationToMs(
      (await deps.configValueQuery({ key: GROWTH_INVITE_DELIVERY_URL_TTL_KEY }, tx)).value,
      "identity.growth_invite_delivery_url_ttl",
    );
    const expiresAt = new Date(Date.now() + ttlMs);

    // Mint the ONE-TIME nonce (fresh per resolve — the stale URL is never re-sent, Doc-4H §2)
    // and build the signed URL against the Lane-A `/invite?token=…` ingress.
    const nonceId = await mintUrlNonce(
      { deliveryReferenceId: input.deliveryReferenceId, expiresAt },
      tx,
    );
    const signedInvitationUrl = buildSignedInvitationUrl({
      rawToken,
      nonceId,
      expiresEpochSeconds: Math.floor(expiresAt.getTime() / 1000),
    });

    return {
      ok: true,
      result: {
        recipientType: invitation.recipientType as GrowthRecipientTypeValue,
        recipientIdentifier: invitation.recipientIdentifier,
        signedInvitationUrl,
      },
    };
  });
}
