# Growth Hub P2 — Three-Lane Implementation Routing

**Status:** Living (mutable) · non-authoritative under the frozen corpus · coins nothing
**Authority:** Growth Hub 10-patch folded set (`GrowthHub_P0_Additive_Patch_Set` v1.4, Board
resolution 2026-07-19 — corpus copies in `generatedDocs/`, Authority Map set row). Implementation =
**AUTHORIZED** by that resolution. This document only *routes* the authorized work to branches;
every rule below binds a folded document by pointer. On any conflict the folded document wins.
**Routing ruling:** owner directive 2026-07-21 — three-lane model (A = identity branch now;
B = consumers on their owning wave branches; C = integration/assembly branch, verification only).

---

## Lane A — `fe/account-referral-nav` (M1 + platform-neutral) — ✅ GATED + COMMITTED `d3e1b8c`

P1 core committed at `22a6b7e`; migration applied to the dev DB. Slice A gate closed
**BLOCKER 0 · MAJOR 0 · MINOR 0** after one fix pass (`L-A2-MAJOR-1`: transport network I/O moved
out of the interactive transaction — per-row CAS marks/bumps in short txs; legacy no-transport path
byte-identical). OBS recorded: the transport-path run audit is no longer atomic with per-row
advances (structurally forced; disclosed in-file). 15/15 targeted tests green.

| # | Item | Binds |
|---|---|---|
| P2-A1 | Outbox consumer-transport leg (injected transport, send-then-mark, at-least-once, `outbox/<EventName>` namespace) | Doc-4B outbox ownership; Doc-4A §16 |
| P2-A2 | `/invite` public landing + HttpOnly token carriage (URL-redacting ingress; uniform invalid) | `Doc-5C_GrowthInvitation_Patch_v1.0.1` row 37; `Doc-7E_GrowthHub_Patch_v1.0.1` |
| P2-A3 | `ensureProvisioned` attribution ingress (token + dep injection into `provisionIdentity` §PROV-EXT) | `Doc-4C_GrowthInvitation_Patch_v1.0.3` §PROV-EXT |
| P2-A4 | Tests: attribution · producer/transport · anti-oracle | Doc-8 lineage; tests-alongside rule |

**Excluded from Lane A (owner-ruled):** M7 consumer · M6 consumer · secure delivery store ·
rewards funnel reads · any billing/communication module code.

---

## Lane B-1 — M7 `InvitationConverted` consumer — branch `wave/3-billing` — ✅ GATED + COMMITTED `b5527ae`

Gate closed **0·0·0**. §16.7 posture declared: definitive → terminal skip (returned outcome,
durable in the Inngest run output, not audited — the M0 dead-letter precedent); transient → retry.
Idempotency = the `(referrer, referred)` pair natural key (no schema change) + the consumer
concurrency key serializing racing first deliveries (OBS: no DB unique constraint — disclosed).
5/5 targeted tests green.

**WP handle:** `W3-BILL-GRW-1` (organizing convenience only). **Spec authority:**
`generatedDocs/Doc-4I_GrowthReferral_Patch_v1.0.1.md` (read it verbatim before coding — this
section is a work order, not a restatement).

**Scope** — register M7's consumer for the M1-owned `InvitationConverted` event and realize the
**System event-create branch** of the existing `billing.track_referral.v1` (one contract-ID,
actor-branched — F4I-PA-M1; no new contract-ID).

1. **Trigger:** Inngest function subscribed to the Lane-A transport name **`outbox/InvitationConverted`**
   (payload = the Doc-2 §4-amended event payload; `event_id` carried in the envelope). Flow row =
   Doc-4L L9-2. Consumer wiring is implementation scope per patch §5.
2. **Q-15 guards (all four, binding):**
   - *Consumer-only caller* — the branch is reachable only from this registered consumer; no user,
     org, or API invocation path; Doc-5C has no row for it.
   - *Args from the event* — `referrer_organization_id` / `referred_organization_id` taken from the
     payload, **no caller override**; `source_event_id = event_id` (required on this branch only).
   - *Idempotent on `event_id`* — duplicate delivery → same result, **one** `referrals` row, no
     duplicate audit (frozen §HB-6.1/H.8 windowed replay; beyond the window the duplicate
     referrer→referred pair resolves as idempotent success returning the existing referral — safe as
     a natural key on this branch only, per patch §1 stage-8; **no `billing` schema change**, no
     persisted event-id column).
   - *Audit* — frozen §HB-6.2 §9 binding unchanged: `[ESC-BILL-AUDIT]` nearest-by-pointer,
     `entity_type=referrals`, in-transaction via Doc-4B, **System actor** (DB label
     `core.ActorType 'system'` — set-wide casing pin, Doc-4J fold-note).
3. **Effect:** insert `referrals` at **`pending`** — the frozen stage-6 entry state. The machine
   `pending → qualified → rewarded` is untouched; qualification stays milestone-driven via
   `advance_referral`; reward stays `credit_reward` on `rewarded`. *Early attribution ≠ early
   reward* (Q-14).
4. **Failure-mode declaration (Doc-4A §16.7)** — retry/DLQ/skip-with-audit is deferred-to-implementation
   by patch §5: the implementer **must declare** the chosen posture in the WP record; the Board may
   impose symmetry with the M6 sibling's classification (definitive → terminal, transient → retry).
5. **Boundaries:** org resolution rides the frozen DF-BILL-1 Identity seam — never an M1 table;
   Q-3 (self-referral) stays open — do not foreclose it; no governance signal read or written.
6. **Tests alongside:** replay-idempotency (same `event_id` → one row, one audit) · beyond-window
   pair-rule · `pending` insert shape · System-actor audit record · REFERENCE failure posture.

**Not in this WP:** funnel/read-pair contracts (`[ESC-7-API]`, Board-gated) · any M1 code · any
reward-machine change.

---

## Lane B-2 — M6 `InvitationIssued` consumer + secure delivery store — ✅ GATED + COMMITTED `3c47c1f` on `wave/3-communication-growth`

Branch = `wave/3-communication` + the two identity commits cherry-picked (baseline for the M1-owned
store code). Gate closed **0·0·0** with four recorded carries: (1) signed-URL one-time/TTL
enforcement at the `/invite` ingress = Lane C wiring (`redeemSignedInvitationUrl` primitive built +
tested here); (2) provider send rides inside the dispatch tx and rows never advance past `queued`
until the frozen `update_delivery_status`/callback WP lands (restructure then); (3) interim
`[ESC-COMM-AUDIT]` action strings (`invitation_delivery_dispatched`/`delivery_retried`) pending a
Doc-4H audit-token ratification; (4) **`GROWTH_INVITE_DELIVERY_STORE_KEY` must be provisioned per
environment** — targeted `create_invitation` fails closed without it. Also realized: the BC-COMM-3
channel-log schema slice (Doc-6H §3.3 verbatim) and the M0 `ReadOutboxEvent` contract (the Doc-4H §2
outbox-payload re-read, contracts-only). 11/11 targeted tests green.

**WP handle:** `W3-COMM-GRW-1`. **Spec authority:** `generatedDocs/Doc-4H_GrowthDelivery_Patch_v1.0.1.md`
(§HB-3.6 is the full 12-section contract — read verbatim) + `Doc-4C_GrowthInvitation_Patch_v1.0.3`
§C13 (the delivery-payload contract and the secure-store semantics).

**Scope** — realize `comm.dispatch_invitation_delivery.v1` (BC-COMM-3's fifth contract, added
additively), the §2 retry guard, the external delivery adapter, and the **M1-side secure delivery
store** whose completion the Board carried into this lane.

1. **Trigger:** Inngest function on **`outbox/InvitationIssued`** (Doc-4L L9-1). Thin payload —
   the event carries **no raw token and no `recipient_identifier`**; the only M1 handle is
   `delivery_reference_id`.
2. **Dispatch path (§HB-3.6):** resolve `identity.resolve_invitation_delivery_payload.v1`
   (internal-service, **M6 sole caller**) just-in-time → `{recipient_type, recipient_identifier,
   signed_invitation_url}`; create the channel-log row (`email_logs`/`sms_logs`/`whatsapp_logs` by
   the 1:1 `recipient_type`→`channel` map) at **`queued`** with `source_event_id = event_id`;
   downstream advancement is exclusively the frozen `update_delivery_status`/`retry_delivery`
   machinery. Template selection = infra-owned provider configuration; no template coined.
3. **Error boundary:** definitive `identity_growth_invite_delivery_not_resolvable`
   (unknown/`revoked`/`expired`) → **terminal, no dispatch, no row, never retried**; transient
   `identity_growth_invite_delivery_unavailable` or provider outage → `DEPENDENCY`, retryable under
   the frozen `[ESC-COMM-POLICY]` budget. Never merged.
4. **Retry guard (patch §2):** before any invitation-origin re-dispatch (rows identified by
   `source_event_id`; `delivery_reference_id` recovered from the **persisted M0 outbox payload**,
   never a new column, never an M1 table), re-resolve the delivery payload: live → fresh signed URL
   (the stale one is never re-sent); not-live → record stays `failed`, no re-queue. Exhausted-but-live
   still resolves (GI-1 gates at redemption).
5. **Secure delivery store (M1-owned, coordinated here — the P1 Board carry):** P1 strict-conformance
   left `resolve_invitation_delivery_payload` returning transient `delivery_unavailable` because no
   token material may persist without the §C13 secure store. This WP completes it: token
   **ciphertext + nonce, 15-minute TTL** per the Doc-3 v1.14 key, minting the short-lived/one-time
   `signed_invitation_url`. The code is **M1-owned** and lives in `src/modules/identity/` even when
   authored on this branch — ownership is not rewritten by branch routing; Lane C merges it home.
6. **GI-3 confinement (patch §5):** `recipient_identifier` exists transiently and lands **only** in
   the channel-log `recipient_ref`; never in audit, events, analytics, or any other surface. The
   signed URL is consumed at send time and never persisted. Invitation state is never cached.
7. **Idempotency:** consumer-idempotent on `event_id` — no duplicate row, audit, or provider send;
   composes with the frozen fan-out-unit key (`event_id` + `recipient_identifier` + channel).
8. **Audit:** `[ESC-COMM-AUDIT]` nearest-by-pointer, System actor, `entity_type=<channel>_logs`,
   in-transaction; the record carries **no** `recipient_identifier` and no signed URL.
9. **Tests alongside:** thin-payload consumption · queued-row shape + `source_event_id` ·
   definitive-vs-transient split · retry-guard terminal path (revoked/expired) · fresh-URL-on-retry ·
   `event_id` dedup · GI-3 (no address/URL outside `recipient_ref`).

**Not in this WP:** BC-COMM-2 (no notification exists for an external invitee — patch §3(b)) · any
change to the frozen four Part-3 contracts · `link`/`qr` handling (the event never fires for them).

---

## Lane C — Integration branch — ✅ COMPLETE on `growth/integration` (2026-07-21)

Commits: merges `8c9fe76` (wave/3-billing) + `319d7fd` (wave/3-communication-growth) →
`bb61a77` (ingress signed-URL redemption + growth-e2e-flow.test.ts) → `6a4c1e3`
(`/account/rewards` wired to `get_reward_balance`/`list_referrals`; funnel tiles not rendered per
the folded Doc-7E §2(a) verbatim pin; slug-gated "Invite a business" P0 create flow). Gates all
**0·0·0**; 42/42 + 4/4 targeted suites; zero non-contracts cross-module imports; turbopack prod
build 148/148 (canonical webpack build blocked by the pre-existing Windows EPERM — CI is the
authoritative oracle). Merge catch of record: Lane A and `wave/3-billing` carried independent
`core.write_outbox_event.v1` realizations — resolved as a semantic union (envelope stamping through
the SECURITY DEFINER admission fn). NEW BOARD ITEM: the comm branch's corpus copy
`Doc-2_Patch_v1.0.9.md` (support-ticket audit actions) collides with the main line's v1.0.9 (VBR) —
renumber + Authority-Map registration + esc_registry cite refresh required; content preserved at
`wave/3-communication-growth:generatedDocs/Doc-2_Patch_v1.0.9.md`. Original sequence (executed):

1. Create the integration branch from the agreed merge baseline (Board/owner picks the baseline).
2. Merge M1 (Lane A), M7 (B-1), M6 (B-2) **without rewriting module ownership** — the B-2
   identity-owned store merges back under `src/modules/identity/`.
3. Run migrations + generated-client checks (`prisma migrate deploy` · registry client generate).
4. End-to-end event + attribution tests: issue → deliver → land → register → convert →
   `InvitationConverted` → referral `pending`.
5. Wire only the frontend reads whose backing contracts now exist (rewards funnel reads stay
   blocked until the M7 merge is verified; `[ESC-7-API]` read-pair remains Board-gated).
6. Final cross-module conformance gate (CLAUDE.md §13; CI is the build oracle).

**No M6/M7 business logic is implemented on the integration branch.** It proves the contracts and
events compose; it authors nothing.

---

## Blocked-until list (standing)

- Rewards-page funnel reads — blocked on B-1 merge + verification (and `[ESC-7-API]` for the
  funnel read pair).
- Secure-delivery completion of the P1 transient posture — blocked on B-2.
- ESC-GROWTH-INVITE registry entry · rate-limit code registration · outbox INSERT-policy
  escalation — Board items, unchanged by this routing.
