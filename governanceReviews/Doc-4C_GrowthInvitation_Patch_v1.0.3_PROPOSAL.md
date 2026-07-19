# Doc-4C — Additive Patch v1.0.3 (Growth Invitation Contracts) — M1 Identity

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold. Additive; extends frozen `Doc-4C` (Structure v1.0 + Content Pass-B) **without editing it in place** (the `Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2` mechanism). |
| **Date** | 2026-07-19 · **Kind** Additive — new **§C13** (3 contracts) + a behavioral extension of `provisionIdentity` + the **§C12.7** outbox-consumption flip + the §9 audit-token realization. Coins no error class; codes register within the existing `identity_` prefix. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19) §A.4; Board Q-2/Q-14/Q-15/Q-16 + GI-1/2/3; the linked `Doc-2_Patch_v1.0.9` (entities/states/slug/events/audit — the *what*); Doc-4A §21 contract grammar; the frozen `Doc-4C §B.1–B.10` cross-cutting defaults; the public-actor precedent `marketplace.get_public_product_detail.v1`; DC-1 (identity-event-addition channel, `Doc-4C:822`). |
| **Depends on** | `Doc-2_Patch_v1.0.9` (entities/slug/events/audit), `Doc-3_…v1.13` (the `[DC-5]` POLICY keys), `Doc-6C_…v1.0.4` (schema). Atomic fold. |

Contracts follow the frozen **§B.1 grammar** and the **§B cross-cutting defaults** (cited "(§B default)", not repeated).

---

## §C13 — Growth Invitation Contracts (`growth_invitations`, `invitation_conversions`)

#### `identity.create_invitation.v1` — Create Growth Invitation · 21.4 Command · Actor: User

- **Authorization:** Membership active; **Slug `can_manage_growth_invites`** (Doc-2 §7, `Doc-2_Patch_v1.0.9`); Scope active-org (the referrer = the caller's active org); Delegation: not eligible. (§B.10)
- **Firewall:** §B.7 default (none) — a growth invite is **promotional**, never a governance signal (Firewall §4); it starts no reward here (reward is milestone-gated in M7).
- **Request Contract:** `campaign_key : string(slug) : required : REF → the registered campaign set (M0 config; MVP `referral`)` · `recipient_type : enum(email|sms|whatsapp|link|qr) : required` · `recipient_identifier : string : conditional : **required** iff `recipient_type ∈ {email,sms,whatsapp}` (targeted); **forbidden** for `link|qr` (open)`.
- **Response Contract:** `growth_invitation_id : uuid : always` · `state : enum : always` (= `issued`) · `token : string : always : the raw invite token/link — **returned ONCE**, never re-readable (only `token_hash` is stored; GI-2)` · `reference_id : uuid : always`.
- **Validation Matrix (§B.4):** SYNTAX (enum; slug shape; the `recipient_identifier` presence rule per `recipient_type` — required for targeted, forbidden for open) → CONTEXT (active-org) → AUTHZ (`can_manage_growth_invites`) → SCOPE (referrer = caller's active org) → **REFERENCE** (`campaign_key` resolves + is active in the M0-config registered set — the frozen `resolve_permission` "slug exists in §7 catalog → REFERENCE" precedent; Review-B MAJOR-2 — supersedes v1.4 A.4(1)'s loose "VALIDATION", conforming up to the frozen §B.4 grammar) → POLICY (invite quota `identity.growth_invite_quota_*`).
- **Error Register (§B.5):** `identity_growth_invite_invalid_input` (VALIDATION, no — bad enum / recipient-presence rule) · `identity_growth_invite_forbidden` (AUTHORIZATION, no) · `identity_growth_invite_campaign_unknown` (REFERENCE, no — `campaign_key` not in the registered set) · `identity_growth_invite_quota_exceeded` (QUOTA, no).
- **State Effects (§13):** creates `growth_invitations` at Doc-2 §5.11 `→ issued`; `token_hash` = hash(token); `redemption_count = 0`.
- **Idempotency (§B.6):** required; dedup `…identity.growth_invite_dedup_window` [DC-5].
- **Audit (§B.8):** yes; Domain Organization **"growth invitation created"** (§9; `Doc-2_Patch_v1.0.9 §5`); attribution standard (User); **`new_value` = `{campaign_key, recipient_type, state}` — EXCLUDES `recipient_identifier`** (GI-3); the invitation id is the audit `entity_id` (not `new_value`); Mutation-Scope `identity.growth_invitations`; Correlation both.
- **Events (§16):** **emits `InvitationIssued`** (Doc-2 §8) **iff `recipient_type` is targeted** (email/sms/whatsapp); **open link/qr emit none**. Thin payload `{event_id, occurred_at, growth_invitation_id, recipient_type, delivery_reference_id}` — **no raw token, no `recipient_identifier`** (§16.5 thin-payload / GI-3). Single-authorship: M1 authors production + the M6 delivery contract; M6 consumes.
- **Reference Validation (§B.9):** `campaign_key` against the M0-config registered campaign set (**M1 validates; M8 is not the validation/authorization owner** — Q-MINOR-3).
- **AI-Agent Notes:** return the raw `token` exactly once (store only `token_hash`; GI-2); `recipient_identifier` **required** for targeted, **forbidden** for open; **never** emit `InvitationIssued` for `link|qr`; the raw token + recipient **never** ride the event (GI-3 / §16.5) — M6 fetches them via `resolve_invitation_delivery_payload`; `campaign_key` is an open text key validated via M0 config (a new campaign = a POLICY row, not a schema migration).

#### `identity.resolve_invitation_token.v1` — Resolve Invitation Token · 21.3 Query · Actor: **Public**

- **Authorization:** **Public / anonymous** — no membership, no slug, no active-org context (the frozen `marketplace.get_public_product_detail.v1` public-actor precedent; M1's first Public contract). (§B.10)
- **Firewall:** §B.7 default (none); **non-disclosure** — public-safe framing only.
- **Request Contract:** `token : string : required : the raw invite token (from the link/QR)`.
- **Response Contract:** `valid : bool : always` (true **iff** the token resolves to a **live `issued`, non-expired, non-revoked** invitation) · `campaign_key : string : when valid` · `reference_id : uuid : always`. **No `invitation_state`** (Review-B MAJOR-3 — returning `expired|revoked` would be a state oracle); anything non-live is uniformly `valid=false`. **Never** the referrer org/identity (unless **Q-4** rules disclosure); **never** `recipient_identifier`.
- **Validation Matrix (queries: SYNTAX → CONTEXT → AUTHZ → SCOPE):** SYNTAX (token present) → CONTEXT (anonymous — no authenticated subject) → **AUTHZ (public)** (the `get_public_product_detail` public-actor stage — Review-A MAJOR-3) → SCOPE (resolve by `token_hash`; unknown/invalid/expired/revoked → `valid=false` with **uniform timing** — no existence oracle).
- **Error Register (§B.5):** none in the validation flow — an invalid token is `valid=false`, not an error (deliberately avoids a validity oracle). *(Rate-limit rejection is declared in the §19 block below, not the matrix.)*
- **Query semantics (§22.3):** read-only; `Cache-Control: no-store`.
- **Reference Validation (§B.9):** the `token → invitation` resolution folds into SCOPE (no external reference).
- **Rate Limiting (Doc-4A §19):** bound to `identity.growth_invite_resolve_rate_limit` (POLICY; the frozen `PublicReadRateLimit` precedent) — an unauth landing endpoint; on exceed → `RATE_LIMITED` (retryable), **kept out of the validation matrix** (§B.4; the frozen `get_public_product_detail` rate-limit-in-§19 pattern — Review-A MAJOR-3).
- **Idempotency (§B.6):** not-applicable (query). **Audit:** no (read; §17.1). **Events:** none.
- **AI-Agent Notes:** anonymous read; return only public-safe framing (**default anonymous** — never the referrer identity, Q-4); unknown/invalid/expired/revoked → `valid=false` with uniform timing (**no state oracle** — never return the specific non-live state); §19 rate-limited; the token is validated **server-side**, never client-trusted (the `accept_invitation` token precedent).

#### `identity.resolve_invitation_delivery_payload.v1` — Resolve Invitation Delivery Payload · 21.3 Query · Audience: **internal-service (M6)**

- **Authorization:** **Audience: internal-service** — the **sole caller is the M6 `InvitationIssued` consumer** (the frozen §C3 internal-service read pattern, e.g. `get_membership`); **not user-invocable, not public**; no slug; platform scope. (§B.10) *(Modeled as internal-service 21.3-with-response, not System/21.5 — the latter carries `Response: none`; Review-B MINOR — Board confirms the framing at fold.)*
- **Firewall:** §B.7 default (none).
- **Request Contract:** `delivery_reference_id : uuid : required : from the `InvitationIssued` event`.
- **Response Contract:** `recipient_type : enum : always` · `recipient_identifier : string : always` · `signed_invitation_url : string : always : a **short-lived, one-time, replay-guarded** link carrying the token` · `reference_id : uuid : always`. **This is the ONLY path that surfaces `recipient_identifier` + a token-bearing URL** — to M6, transiently, delivery-only (GI-3 exception).
- **Validation Matrix (queries):** SYNTAX (uuid) → CONTEXT (internal-service caller; M6) → AUTHZ (internal-service audience) → SCOPE (`delivery_reference_id` resolves to an `issued`, **non-expired, non-revoked**, targeted invitation; else nothing deliverable).
- **Error Register (§B.5):** `identity_growth_invite_delivery_unavailable` (DEPENDENCY, yes — revoked/expired/unknown → M6 suppresses delivery).
- **Query semantics (§22.3):** read-only; the `signed_invitation_url` TTL is POLICY-bound; single-use / replay-guarded.
- **Reference Validation (§B.9):** `delivery_reference_id → invitation` resolution folds into SCOPE.
- **Idempotency (§B.6):** not-applicable (query); the issued URL is one-time. **Audit:** no (read; §17.1). **Events:** none.
- **AI-Agent Notes:** **internal-service / M6-only** — never expose to a user/public caller; the sole path that returns `recipient_identifier` + a token URL (the GI-3 transient delivery exception); returns nothing deliverable for a `revoked`/`expired` invitation (M6 **must not** deliver — the suppression rule); the URL is short-lived + one-time (replay-guarded); this is what keeps the raw token **off** the persisted outbox event.

---

## §PROV-EXT — `provisionIdentity` attribution extension (Q-14, Board MAJOR-2 ruling)

**Not a new contract — an additive behavioral extension of the first-login provisioning command
`provisionIdentity`** (a **WP-1.3 implementation command** described by **Doc-7C §3.2** / Doc-7E §2 /
`[ESC-7-API-SIGNUP]` — provisioning is out-of-band, **not** a frozen Doc-4C wire contract; the wire-owning home
is **Doc-7C §3.2**, and a companion Doc-7C touch may be the formal fold site — Review-A/B OBS). It mints the user
+ Personal Org + founding Owner in **one transaction**. Attribution binds **here**, at the provisioning seam,
because a bare registrant's first org is minted **lazily by provisioning on first login, before
`create_organization` is ever reachable** — **not** because `create_organization` is restricted (the frozen §C5
contract explicitly *includes* the Solo-Trader Personal-Org auto-create, `Doc-4C PassA:193`; Review-B MAJOR-1).
`create_organization` (§C5) is untouched.

- **Ownership of the transaction (RULED):** the **`provisionIdentity` application service OWNS the single
  transaction**; attribution is an **in-txn internal step, never a separately-committed command**.
- **Additive input:** `referral_token : string : optional` — carried from the registration→provisioning flow
  (out-of-band, `[ESC-7-API-SIGNUP]`; the token is validated server-side, never client-trusted).
- **Behavior (same txn as the org mint), when a `referral_token` is present:**
  1. **GI-1 atomic capacity gate** on the invitation row:
     ```sql
     UPDATE identity.growth_invitations SET redemption_count = redemption_count + 1
      WHERE id = :invitation_id AND state = 'issued' AND expires_at > now()
        AND (max_redemptions IS NULL OR redemption_count < max_redemptions)
     RETURNING id;
     ```
  2. **0 rows** (expired / exhausted / revoked — the guard's own predicate) → **attribution does not bind;
     provisioning still commits** (never a registration failure).
  3. **1 row** → insert `invitation_conversions` (`started → registered`, `referred_organization_id` = the
     newly-minted first org, `registered_at` = now), and **append `InvitationConverted` to the M0 outbox**
     (`core.write_outbox_event.v1`).
- **Same-org / duplicate guard (Q-3, deferred — Review-B MINOR):** a self/duplicate-attribution guard (e.g. the
  registering auth-user is already a member of the referrer org) is an **attribution-integrity** concern owned by
  the open **Q-3** ruling — it is **not** the GI-1 "0 rows" path (the SQL performs no referrer/subject
  comparison). For a genuine first-org registrant the subject has no prior org, so the case is moot; the guard is
  specified when Q-3 is ruled.
- **Idempotency:** `provisionIdentity` is already idempotent (re-entry returns `created:false`); the append-only
  conversion + the atomic guard mean a re-provision **never double-binds** (a bound `registered` conversion +
  the incremented counter block a second bind).
- **Attribution:** the audit row is **User**-attributed (the WP-1.3 txn pattern); the downstream M7 referral
  create runs `actor_type=System` (Doc-4I; Q-15 guard).
- **Audit (§B.8):** Domain Organization **"invitation converted (referral attribution)"** (§9;
  `Doc-2_Patch_v1.0.9 §5`); attribution standard; Correlation both.
- **Events (§16):** **emits `InvitationConverted`** (Doc-2 §8). **Compatibility:** with no `referral_token`,
  `provisionIdentity` behaves **exactly as frozen** — the bind + event fire only on a valid live token (an
  additive optional field + a DC-1 behavioral extension; no breaking change).

---

## §C12.7-FLIP — Doc-4B consumption declaration (additive)

The frozen §C12.7 states: *"`core.write_outbox_event.v1` **not consumed** (no identity events)."* This patch
**additively flips** it:

> **§C12.7 (patched):** `core.write_outbox_event.v1` **CONSUMED** — `identity.create_invitation.v1` publishes
> `InvitationIssued` (targeted invites) and the `provisionIdentity` attribution extension publishes
> `InvitationConverted`, both via the M0 transactional outbox (business write + event insert in one txn). These
> are **M1's first Doc-2 §8 events** (the DC-1 channel is now exercised). All other §C12.7 consumptions
> (`append_audit_record`, `allocate_human_reference` [**`create_organization` only** — the growth entities
> carry **no `human_ref`**; Review-A/B MINOR], `config_value_query`, `feature_flag_evaluate`, UUIDv7 generation
> [every create]) are **unchanged**.

---

## §9 audit-token realization (the `buyer_profile` linked-pair pattern)

Pins the wire tokens for the Doc-2 §9 Organization additive (`Doc-2_Patch_v1.0.9 §5`):

| Action token | `entity_type` | `new_value` | Notes |
|---|---|---|---|
| `growth_invitation_created` | `growth_invitations` | `{campaign_key, recipient_type, state}` — **excludes `recipient_identifier`** (GI-3) | on `create_invitation` |
| `invitation_converted` | `invitation_conversions` | `{growth_invitation_id, referred_organization_id, state}` | on the attribution bind |

If the Doc-2 §9 additive is not folded in the same round, both carry the interim `[ESC-IDN-AUDIT]` (no action invented).

---

## Appendix A — Contract inventory rows added (§C13)

| §C | Contract-ID | Aggregate | Op | Actor | Notes |
|---|---|---|---|---|---|
| C13 | `identity.create_invitation.v1` | growth_invitations | 21.4 | User (`can_manage_growth_invites`) | DC-5 (dedup/quota/ttl); emits `InvitationIssued` (targeted) |
| C13 | `identity.resolve_invitation_token.v1` | growth_invitations | 21.3 | **Public** | rate-limited; `get_public_*` precedent |
| C13 | `identity.resolve_invitation_delivery_payload.v1` | growth_invitations | 21.3 | **internal-service** (M6) | the sole recipient/URL path (GI-3); 21.3-with-response, not System/21.5 |

Module-1 caller-facing contract count grows by **2** (create + resolve-token); the delivery-payload read is
**internal-service** (no public REST row — Doc-5C), matching its body (Audience: internal-service; 21.3-with-response,
**not** System/21.5 which carries `Response: none`). The `provisionIdentity` extension adds no new contract-ID.

---

## Compatibility, invariants & carried realization

- **Additive; no existing contract signature, error class, slug, or §B default changed.** `create_organization`
  (§C5) is **untouched** (attribution moved to `provisionIdentity`). New error codes register within the frozen
  `identity_` prefix under the **single** new domain segment **`growth_invite`** (matching the slug + POLICY keys;
  Review-A/B MINOR); **no new error class**.
- **Inv #5** (Users act, Orgs own) — the referrer is the server-validated active org; the client org id is never
  trusted. **Inv #7** — M1-owned; M1↔M7 by event only. **Inv #8** — conversions append-only. **Inv #11 /
  GI-3** — the referred org is opaque in a referrer's list; the invitee contact is confined (surfaced only via
  the internal-service/M6 delivery-payload read). **Firewall / money boundary** — a growth invite/referral is
  promotional, never a signal; no escrow/wallet.
- **Carried realization:** `Doc-6C_…v1.0.4` realizes the tables/RLS/immutability trigger + the two service-role
  read paths (public token-resolve + internal-service delivery-payload); `Doc-4H` binds the M6 delivery consumer;
  `Doc-4I` adds the M7 System event-create branch consuming
  `InvitationConverted`; `Doc-4J`/`Doc-4L` register the events/flow; `Doc-3_…v1.13` registers the `[DC-5]`
  POLICY keys (dedup/ttl/quota/resolve-rate-limit) that finalize these contracts.

*Additive Doc-4C patch — 3 new §C13 contracts + a `provisionIdentity` behavioral extension + the §C12.7 flip +
the §9 audit-token realization; verbatim to the Growth Hub FROZEN architecture (v1.4 §A.4). PROPOSED — awaiting
per-patch Review-A → Review-B → Board fold. Edits no frozen base text; coins no error class; changes no
ownership/firewall/money boundary. Any change requires Board approval.*
