# Doc-2 — Additive Patch v1.0.11 (PATCH-D2-10) — Growth Hub Domain Additions

| Field | Value |
|---|---|
| **Status** | **PROPOSED** — gated on per-patch Review-A → Review-B → Board fold (implementation governance). Additive; patches the **effective Doc-2 = v1.0.10** (base v1.0.2 + folded patches v1.0.3–v1.0.10) **without editing it in place** (the `Doc-2_Patch_v1.0.6/v1.0.8` mechanism). |
| **Renumber note** | **Two renumbers.** (1) *On branch:* authored as v1.0.9 / PATCH-D2-08, then renumbered to **v1.0.10 / PATCH-D2-09** (2026-07-19); (2) *reconcile to `main`* (2026-07-23, D2-09 forward-PR): renumbered to **v1.0.11 / PATCH-D2-10** per Scheme B: the parallel governance train folded the **Vendor-Buyer-Relationship** patch as `Doc-2_Patch_v1.0.10_VendorBuyerRelationship.md` / PATCH-D2-08 (commit `573a349`), consuming both the number and the patch ID **and** the §7 count transition (tenant 36→37, total 45→46 — now this patch's baseline). Board re-verifies the number at the atomic fold (the Doc-3 v1.13→v1.12 contingency's Doc-2 analog). |
| **Date** | 2026-07-19 |
| **Kind** | Additive only — **2 entities** (§10.2), **2 state machines** (§5), **1 tenant permission slug** (§7), **2 §8 events**, **2 §9 audit actions**. Coins exactly these; changes/removes nothing existing. |
| **Authority** | Growth Hub Architecture (**FROZEN** 2026-07-19, `GrowthHub_P0_Additive_Patch_Set` v1.4 §A); Board ratifications Q-13/Q-14/Q-15/Q-16 + GI-1/2/3; the additive channels Doc-2 §5/§7/§8/§9/§10.2; Inv #5 (Users act, Orgs own) · #7 (one module, one owner) · #8 (nothing hard-deleted) · #11 (private exclusion). Mechanism precedents: `Doc-2_Patch_v1.0.6` (adds a column), `Doc-2_Patch_v1.0.8` (adds slugs, count overlay). |
| **Linked set (atomic)** | Doc-3 `…v1.12_GrowthHub` (renumbered from the packet's v1.13 — collision) · Doc-4C `…v1.0.3` · Doc-4H `GrowthDelivery_v1.0.1` · Doc-4I `GrowthReferral_v1.0.1` · Doc-4J `…v1.0.1` · Doc-4L `…v1.0.1` · Doc-5C `…v1.0.1` · **Doc-6C `…v1.0.4`** (realizes §10.2 + the §7 count overlay) · Doc-7E `…v1.0.2`. A partial fold dangles references. |
| **Coins** | Entities `identity.growth_invitations`, `identity.invitation_conversions` · states `issued/expired/revoked`, `started/registered` · slug `can_manage_growth_invites` · events `InvitationIssued`, `InvitationConverted` · audit actions `growth_invitation_created`, `invitation_converted`. **No** ADR/ownership/firewall/money-boundary change. |

---

## §1 — Entities added (§3.2 Entity Catalog + §10.2 Database Blueprint)

**§3.2 — `identity` Entity Catalog** (append to the Module-1 block; `| Entity | Purpose | Tenant Scope | Lifecycle |`):

| Entity | Purpose | Tenant Scope | Lifecycle |
|---|---|---|---|
| growth_invitations | Growth Hub invitation **artifact** — a referrer org invites a *new* business to register (targeted email/SMS/WhatsApp, or open link/QR), carrying a hashed token + campaign key | tenant-owned (referrer org) | §5.11 Growth Invitation |
| invitation_conversions | One row per **registered org attributed** to a growth invitation — the attribution source of truth (supports open multi-redemption) | tenant-owned (referrer org) | §5.12 Invitation Conversion |

**§10.2 — `identity` Database Blueprint** (append to the identity blueprint block; the frozen 6-column form
`| Table | FK | Ref | Tenant | SD | Notes / Key attributes |` — Review-A MAJOR-1):

| Table | FK | Ref | Tenant | SD | Notes / Key attributes |
|---|---|---|---|---|---|
| identity.growth_invitations | → organizations (in-module) | — | referrer_organization_id | YES | `campaign_key(text), recipient_type(email/sms/whatsapp/link/qr), recipient_identifier(text NULL — targeted only; confined GI-3), token_hash(text — hash only), max_redemptions(int NULL), redemption_count(int DEFAULT 0 — GI-1 atomic gate), state(issued/expired/revoked), expires_at`; immutable at-create: referrer_organization_id, campaign_key, recipient_type, recipient_identifier, token_hash, max_redemptions (GI-2) |
| identity.invitation_conversions | → growth_invitations, → organizations (in-module) | — | referrer_organization_id | NO (append-only, Inv #8) | `referred_organization_id(NULL→set), state(started/registered), started_at, registered_at`; **no campaign_key** (derived); single-use via the GI-1 atomic UPDATE on the invitation row (no cross-table index) |

**Ownership & boundary (Inv #7).** Both are **M1-owned**, in the `identity` schema. All references are
**intra-schema** (`referrer_organization_id`, `referred_organization_id`, `growth_invitation_id` →
`identity.organizations` / `identity.growth_invitations`) — **no cross-schema FK** (§10 no-FK rule). The
`referrals` reward entity stays **M7-owned** (`billing`, §10.8) and is **untouched**; M1↔M7 communicate by
event only (`InvitationConverted`, §4).

**Tenant-owned RLS list (§ hard-tenancy).** Add `growth_invitations`, `invitation_conversions` to the
**Tenant-owned (RLS: `organization_id`/`referrer_organization_id` = active org)** enumeration. Two
service-role read paths are the *only* non-referrer access: the anonymous token-resolve read (public-safe
columns) and the M6-scoped delivery-payload read (Doc-4C `resolve_invitation_delivery_payload`, Doc-6C RLS).

**Canonical field source (the *what*; Doc-6C realizes the *how*).**

- **`growth_invitations`** — `id (uuid PK, UUIDv7)` · `referrer_organization_id (uuid, tenant anchor)` ·
  `campaign_key (text — an open, contract-validated identifier; NOT a DB enum; MVP value `referral`)` ·
  `recipient_type (enum email|sms|whatsapp|link|qr)` · `recipient_identifier (text, nullable — targeted
  only; **confined**, GI-3)` · `token_hash (text — hash only; the raw token is never stored)` ·
  `max_redemptions (int, nullable — 1 targeted / NULL open)` · `redemption_count (int, default 0 — the
  atomic capacity gate, GI-1)` · `state (enum, §5.11)` · `expires_at (timestamptz — from POLICY
  `identity.growth_invite_token_ttl`)` · standard audit + soft-delete (`created_by/at`, `updated_by/at`,
  `deleted_*`). **Immutable `at-create`:** `referrer_organization_id`, `campaign_key`, `recipient_type`,
  `recipient_identifier`, `token_hash`, `max_redemptions` (GI-2).
- **`invitation_conversions`** — `id (uuid PK)` · `growth_invitation_id (uuid → growth_invitations)` ·
  `referrer_organization_id (uuid — denormalized tenant anchor)` · `referred_organization_id (uuid,
  nullable→set at attribution → identity.organizations)` · `state (enum, §5.12)` ·
  `started_at`/`registered_at (timestamptz)` · `created_*`. **Append-only** — nothing hard-deleted (Inv #8);
  **no soft-delete, no `campaign_key`** (derived via `growth_invitation_id`). Capacity is **not** a
  cross-table index (Postgres cannot reference `growth_invitations.max_redemptions` from a conversions
  index) — it is the GI-1 atomic UPDATE on the invitation row.

---

## §2 — §5 (State Machines) — two machines added

### 5.11 Growth Invitation

```
issued ──expire (TTL lapse; System)──▶ expired      (terminal)
issued ──revoke (referrer/staff)─────▶ revoked      (terminal)
```

`issued` is the only live state — a targeted invitation awaiting delivery/redemption, or an open link/QR
awaiting redemptions. `expired`/`revoked` are terminal; a live invitation past `expires_at` is swept to
`expired` (the GI-1 guard also rejects `expires_at ≤ now()` in-band). Soft delete is orthogonal.
Per-redemption progress lives on **§5.12**, not here (an open code has many conversions).

### 5.12 Invitation Conversion

```
started ──org minted + attribution bound (same provisioning txn)──▶ registered   (terminal)
```

`started` = the token was redeemed / the landing was reached; `registered` = the invitee's first org was
minted and attribution bound **inside the `provisionIdentity` transaction** (Q-14). `registered` emits
`InvitationConverted` (§4). Append-only; no reversal (a bad attribution is corrected by a new audited row,
never a mutation — Inv #8). The referral reward machine (`referrals pending→qualified→rewarded`, §10.8) is
**downstream in M7** and is **not** part of this machine (composition, not extension — Q-8/Q-13).

---

## §3 — §7 (Permission Mapping) — one tenant slug added

Appended to the §7 slug table (same `| Entity / Action Area | Permission Slugs |` format):

| Entity / Action Area | Permission Slugs (indicative defaults: O=Owner, D=Director, M=Manager, F=Officer) |
|---|---|
| Growth Hub invitation (create / manage growth invitations) | `can_manage_growth_invites` (O,D,M) |

**Count overlay:** tenant slug catalog **37 → 38**; total catalog **46 → 47** (staff unchanged at 9) — the
**v1.0.10 baseline** (the folded Vendor-Buyer-Relationship patch already took tenant 36→37 / total 45→46;
renumber note above). Realized by `Doc-6C_…v1.0.4` (the count-overlay pattern of `Doc-6C_Patch_v1.0.1/.3`;
its assertion re-bases the same way — 46→47). A dedicated slug (Growth ≠ Billing — Q-2): server
authorization is in the M1 application layer; UI gating is UX-only (Doc-7E §7.2).

---

## §4 — §8 (Event Ownership Mapping) — first `identity` producer row added (2 events)

Adds the **first Doc-2 §8 identity-producer row** (M1 previously emitted no §8 event — DC-1 channel,
`Doc-4C:822`). Same `| Emitting Module | Entity | Events |` format; outbox rule (business write + event
insert in one txn) applies:

| Emitting Module | Entity | Events |
|---|---|---|
| identity | growth_invitations | `InvitationIssued` — fires **only** on `create_invitation` for a **targeted** `recipient_type` (email/sms/whatsapp); **never** for open link/qr (no delivery). Thin payload: `{event_id, occurred_at, growth_invitation_id, recipient_type, delivery_reference_id}` — **no raw token, no recipient_identifier** (Doc-4A §16.5 thin-payload / GI-3) |
| identity | invitation_conversions | `InvitationConverted` — fires on conversion `→ registered` (attribution bound). Payload `{event_id, occurred_at, conversion_id, growth_invitation_id, campaign_key, recipient_type, referrer_organization_id, referred_organization_id}` — **no recipient_identifier** (GI-3) |

**Primary consumers (added to the §8 consumers paragraph):** `InvitationIssued` → **Communication (M6)**
delivery to the external recipient (targeted only; M6 fetches recipient + a one-time signed URL via
`identity.resolve_invitation_delivery_payload`, never from the event). `InvitationConverted` → **Billing
(M7)** `track_referral` under its additive System event-create branch (Doc-4I; `actor_type=System`,
idempotent on `event_id`) → referral `pending`; and (later, P4) → **Admin/analytics (M8)** observe-only
projection. Consumers are idempotent (`event_id`); single-authorship (M1 authors production + delivery
contracts; consumers own their effects — the `VendorBanned` model).

---

## §5 — §9 (Audit Mapping) — Organization domain extended (2 actions)

The **Organization** domain row is extended (business semantics only; no wire tokens — those are pinned in
`Doc-4C_…v1.0.3`, the `buyer_profile` linked-pair precedent). **Extend the EFFECTIVE v1.0.10 row** — content-
identical to the effective v1.0.8 row (it already carries the `Doc-2_Patch_v1.0.4` buyer-profile actions —
Review-A MAJOR-2, do NOT revert to the base row; the folded v1.0.10 VBR patch **appended a separate Buyer
Relationships domain row** and left the Organization row untouched):

> Organization | create, membership invite/accept/suspend/remove, role/permission change, ownership
> change/succession, workflow settings change, subscription change, **buyer profile create, buyer profile
> update**, soft delete/restore**, growth invitation created, invitation converted (referral attribution)**.

`growth_invitation_created.new_value` **excludes `recipient_identifier`** (GI-3) — it records the
campaign/recipient-**type** + the invitation id, never the invitee contact. The event-driven M7 referral
create audits under `actor_type=System` (Q-15 guard). Reads are not audited (§17.1). Where §9 has no
near-enough enumerated action, the interim `[ESC-IDN-AUDIT]` marker carries (no action invented) — the
Doc-4C patch resolves the wire token.

---

## §6 — Compatibility, invariants & migration posture

- **Purely additive.** No existing entity, state, transition, slug, event, or audit action is changed or
  removed. The frozen M7 `referrals pending→qualified→rewarded` machine (§10.8) is **not edited** (Q-8).
- **M1's first §8 events** — additive under the DC-1 identity-event-addition channel; the M0 transactional
  outbox already exists; no rank-0 Master edit required (§15.3 grows under the owning module; Doc-4J is the
  authoritative catalog).
- **No cross-schema FK** (§10 no-FK rule): all references are intra-`identity` or bare-UUID cross-module
  (M7 stores `referred_organization_id` as a bare UUID, its frozen pattern).
- **Firewall / money boundary / privacy held:** reward points remain a promotional entitlement, never a
  governance signal (Firewall §4); no escrow/wallet/settlement (§1 money boundary); the referred org is an
  opaque UUID in a referrer's list (non-disclosure; the frozen `list_referrals` output shape); the invitee
  contact is confined (GI-3).
- **Migration (realized in Doc-6C):** two new tables + three enums, forward-only, zero backfill (no rows
  exist); no lock on existing tables; reversible by drop pre-data.

---

## §7 — Carried realization (this patch coins the *what*; siblings realize the *how*)

`Doc-6C_…v1.0.4` (DDL, RLS, the GI-2 immutability trigger, the §7 count overlay) · `Doc-4C_…v1.0.3` (the 3
contracts + `provisionIdentity` attribution extension + the §9 audit-token realization) · `Doc-4J_…v1.0.1`
(event catalog) · `Doc-4L_…v1.0.1` (flow + L3 permission row) · `Doc-3_…v1.12_GrowthHub` (the 7
`identity.*` keys — `growth_invite_*` TTL/dedup/quota/resolve-rate-limit/delivery-URL-TTL + the campaign
registry — and the 2 `billing.*` referral keys) · `Doc-4H`/`Doc-4I` (M6 delivery / M7 System branch) ·
`Doc-5C_…v1.0.1` (API rows) · `Doc-7E_…v1.0.2` (Growth Hub surface).

**⚠ Un-executed 5.11 transitions (flagged — coined here, execution follows additively; Final-Gate
L3-M1):** the machine's two outbound edges have **no executing contract in this set**: **`revoke`**
(`issued → revoked`, referrer/staff actor — the frozen membership-invitation `revoke_invitation.v1`
serves a DIFFERENT aggregate and cannot be reused) is a **flagged follow-up additive Doc-4C 21.4
command** (+ its Doc-5C wire row + Doc-7E affordance — the same future-pair channel as the funnel
reads); **`expire`** (System sweep) is the `Doc-6C_…v1.0.4` §7 flagged follow-up (cadence key +
executor). Every revocation/expiry **consequence** is realized now (resolve `valid=false`, M6 never
retries, GI-1 rejects non-`issued`); only the two initiating executors follow. Not fold-blocking —
routed, named channels.

*Additive Doc-2 patch — coins two entities, two state machines, one tenant slug, two §8 events, two §9
audit actions; verbatim to the Growth Hub FROZEN architecture (v1.4 §A). PROPOSED — awaiting per-patch
Review-A → Review-B → Board fold. Edits no frozen base text; carried alongside the effective Doc-2 v1.0.10. Changes
no ADR, ownership boundary, governance signal, firewall, or money boundary. Any change requires Board
approval.*
