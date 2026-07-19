# Escalation + Implementation Plan — "Invite-to-Register" Referral (Growth Hub / Reward Center)

**Status:** PLAN + ESCALATION DRAFT v1.0 — **gated on the Human Architecture Board.** NOT applied;
no frozen doc edited; no contract coined; no code written. Owner directed (2026-07-18): activate the
referral system in the *invite-a-new-business* sense, and **plan it, don't build it**.
**Surface:** `/account/rewards` (labelled "Referral", P-ACC-22 · Doc-7E). FE is presentation-only today.
**Proposed ESC handle:** `ESC-BILL-REFERRAL-INVITE` *(pending registration — see §8; sweep the
Authority Map at registration per the "esc_registry can be stale" rule).*

> **UPDATE 2026-07-18 — Board RULED.** Direction = *Invite New Business*; ownership = M1 (invite/token/
> attribution) · M7 (reward, unchanged) · M6 (delivery); milestone = Doc-3 POLICY; **plan only, do not
> build.** This packet's "which model / where" fork is decided. The full contract-level plan is
> `Referral_Growth_System_Implementation_Plan_v1.0.md` — read that for the build spec.

---

## 1. The ask, and why it is blocked

The owner wants the mockup's product model: **invite other procurement professionals; when a business
they represent *registers and verifies*, the referrer earns reward points.** That is an
*invite-to-register* referral.

The frozen referral contract does **not** implement that model. `billing.track_referral.v1`
(BC-BILL-6, Doc-4I §HB-6.2) takes **`referred_organization_id`** and its stage-7 REFERENCE check
requires that id to **resolve to an organization that already exists** (§HB-6.2:478). It is an
**org→org** referral between two *existing* platform tenants — there is **no referral code, no email
invite, and no attribution-on-registration** anywhere in the frozen corpus (verified: zero hits for
"referral code / registration attribution / external invite" across the real Doc-2 / Doc-4C / Doc-4I
content, 2026-07-18).

So "activate" as the owner means it is an **architecture change** (new/extended contracts spanning
modules), not an FE toggle. Under CLAUDE.md §8, AI **may not** coin contracts/entities or change
ownership boundaries; architecture-affecting artifacts require **human approval**. Hence this packet.

## 2. Frozen baseline (what already exists — cited, not restated)

| Piece | Frozen state | Pointer |
|---|---|---|
| Referral lifecycle | `referrals` machine `pending → qualified → rewarded`; append-only reward ledger | Doc-4I §HB-6.2 / H.5 |
| Create a referral | `track_referral` — org self-initiates; needs a **resolvable** `referred_organization_id`; `can_manage_billing`; dup referrer→referred → `BUSINESS` | Doc-4I §HB-6.2 |
| Advance a referral | `advance_referral` — **System** branch advances on qualification/reward milestone | Doc-4I §HB-6.2 |
| Pay the reward | `credit_reward` — **separate** movement on `rewarded`; value is a POLICY key | Doc-4I §HB-6.1 · `[ESC-BILL-POLICY]` |
| Read balance / list | `get_reward_balance` (points) · `list_referrals` (`{referral_id, referred_organization_id, state}`) | Doc-4I §HB-6.3 |
| New-org onboarding | No signup/provision **wire** contract; user + Personal Org + Owner membership are materialized **out-of-band** by M1 lazy-provisioning (`ensureProvisioned`) on first authenticated request | **`ESC-7-API-SIGNUP`** (registry) · Doc-7C §3.2 / Doc-7E §2 |
| Invite a non-account party | **Unrealizable today** — `invite_member` identifies an invitee by `email`, but `memberships.user_id` is `NOT NULL`; **no pending-user / invitation-token entity is frozen** | **`ESC-IDN-INVITE-ACCOUNT`** 🟠 OPEN · Doc-4C §C6 vs Doc-6C §3.3 |
| Invite an external party to the platform | Established as **unmodeled**, resolved via a Board packet + additive patch spanning M2/M8/M6 | **`ESC-VENDIR-INVITE`** (precedent) |

**Key insight — the reward engine is already complete.** M7's `track_referral → advance_referral →
credit_reward` fully covers the *reward* lifecycle **once the referred org exists**. The entire gap is
on the **M1 invite + registration-attribution** side: how a not-yet-existing business gets invited,
and how its eventual registration is attributed back to the referrer. That gap is the same
pending-user/token gap already registered as `ESC-IDN-INVITE-ACCOUNT`.

## 3. The gap, precisely

Three missing links, none in M7:
1. **An external referral invitation** (email/contact + a token/code) for a party who has **no account
   yet** — the `ESC-IDN-INVITE-ACCOUNT` pending-user/token entity, in a referral flavour.
2. **Registration attribution** — when the invited party registers a **new** organization (through the
   out-of-band provisioning path, `ESC-7-API-SIGNUP`), the new org must be linked to the referrer.
3. **An event seam** — attribution → M7 `track_referral`, so M7 (not M1) creates the `referrals` row
   for the now-resolvable `referred_organization_id`. Respects One-Module-One-Owner: modules talk by
   **event**, never cross-table.

## 4. Proposed architecture (DRAFT for the Board — not applied, nothing coined)

The referral **record** is created **at registration, not at invite.** This is deliberate: it keeps
the frozen `track_referral` REFERENCE precondition intact (`referred_organization_id` resolves), and
puts the pre-registration "pending invite" state on the **M1 invite-token**, never on a `referrals`
row pointing at a non-existent org.

```
[Referrer, can_manage_billing]
   └─(1) create Referral Invitation (email/contact + token)      ── M1 (NEW: token/pending entity)
         │                                                          reuse the ESC-IDN-INVITE-ACCOUNT model
   └─(2) deliver invite                                           ── M6 (delivery-only)
[Invited party clicks link, registers a NEW org]
   └─(3) provisioning carries the token; on org creation,        ── M1 (attribution on the ensureProvisioned path)
         emit e.g. `OrganizationProvisionedViaReferral`(§8 event)
[M7 consumes the event]
   └─(4) track_referral(referred_organization_id = new org)      ── M7 FROZEN — referral enters `pending`
   └─(5) advance_referral → `qualified` on verification milestone ── M7 FROZEN (System branch)
   └─(6) advance_referral → `rewarded` + credit_reward           ── M7 FROZEN — points to the referrer
```

Steps **4–6 are 100% frozen M7** and need no change. Steps **1–3 are the additive work**, and land
where invite-to-platform already lives per the `ESC-VENDIR-INVITE` precedent.

## 5. Ownership + additive surface the Board would need to rule (by pointer — nothing drafted as final)

| Piece | Candidate owner | Note |
|---|---|---|
| Referral Invitation entity (email/contact + token + `pending → registered → expired`) | **M1 Identity** | the `ESC-IDN-INVITE-ACCOUNT` token/pending-user model, in a referral flavour; NOT a `referrals` row |
| `create_referral_invitation` submit + `referrer_organization_id` attribution | **M1** | gated on `can_manage_billing` (or a new invite slug — Board Q-2) |
| Registration-attribution hook on provisioning | **M1** | on `ensureProvisioned`, bind the token → new org; respects `ESC-7-API-SIGNUP` (still no client signup contract) |
| `OrganizationProvisionedViaReferral` §8 event | **M1 emits → M7 consumes** | new event → **authoritative catalog is Doc-4J** (M8); Board to coin |
| `track_referral` from the event | **M7 Billing** | FROZEN; called under System at attribution |
| Invite delivery | **M6 Communication** | delivery-only; no content ownership |
| Reward value / qualification window / anti-abuse quota | POLICY | already `[ESC-BILL-POLICY]` — no key in ADR/contract text (Doc-3 owns) |

## 6. Board sub-questions (Raise ≠ Accept — these are for the Board to rule, not resolved here)

- **Q-1 (entity reuse):** Does the referral invitation reuse / generalise the `ESC-IDN-INVITE-ACCOUNT`
  pending-user-or-token entity, or is it a sibling "referral invitation" AR? (Resolving `ESC-IDN-INVITE-ACCOUNT`
  may be a prerequisite either way.)
- **Q-2 (permission):** `can_manage_billing` (referral = a billing/reward concern) vs a new invite slug.
- **Q-3 (attribution integrity):** first-touch vs last-touch; self-referral and dup-org guards
  (extends the frozen `track_referral` `BUSINESS` dup rule to the invite stage).
- **Q-4 (privacy / Inv #11):** what, if anything, the invited party learns about the referrer; the
  referral list stays **opaque-ref only** (`list_referrals` projects no display name) regardless.
- **Q-5 (abuse/quota):** POLICY-owned limit per org per period (Doc-3).
- **Q-6 (money boundary):** confirm reward points stay a loyalty entitlement — never buyer↔vendor money,
  never procurement standing (the moat; Doc-4I H.9, CLAUDE.md §1). The proposal asserts this and coins
  no exception.

## 7. Conditional implementation plan — executes ONLY after the Board approves §4–5

**A. Backend (M1 additive + M6 wiring; M7 unchanged) — owned by the Identity/Billing waves, not this FE branch:**
1. M1: Referral Invitation entity + migration + `create_referral_invitation` command/route + token issuance.
2. M1: attribution on the provisioning path; emit `OrganizationProvisionedViaReferral`.
3. M6: invite delivery job (Inngest → Resend), delivery-only.
4. M7: subscribe to the event → `track_referral`; no contract change. Verify the existing
   `advance_referral`/`credit_reward` chain end-to-end.
5. `/ivendorz-security` gate (org context, `can_manage_billing`, privacy, cross-module boundary) + full
   Review-A → Review-B → Board pipeline. Migrations reviewed.

**B. Frontend (`/account/rewards`) — small, lands after A is available on an integrated branch:**
1. Re-label the hero CTA from "Refer an organization" to **"Invite a business"** and back it with a
   dialog (Doc-7B `Dialog`) collecting the invitee **email/contact** + optional company name → POST
   `create_referral_invitation`.
2. Success/pending/error states; empty + first-run; `can_manage_billing`-gated (hide/disable otherwise).
3. Replace the presentation seed: wire `get_reward_balance` (hero points) + `list_referrals` (history
   table) via the Doc-7C data layer — stats become real reads, still **opaque-ref + frozen-state only**.
4. History gains a "pending invitation" view fed by the M1 invitation state (pre-registration), distinct
   from the M7 `referrals` states (post-registration).
5. `/fe-checklist` + `/ivendorz-verify-fe`.

**Home:** backend belongs on the **billing/identity wave branches** (the M7 routes + `20260712140000`-era
billing migrations already live on `wave/3-billing`; M1 invite work is Identity's). This FE branch
(`fe/account-referral-nav`) stays **presentation-only** until Wave-3 integration merges it forward.
(`ESC-7-API-SIGNUP`, `ESC-IDN-INVITE-ACCOUNT` on that path.)

## 8. Boundary — what I will NOT do without human approval (CLAUDE.md §8, Red-Flag Checklist)

Coin any contract/entity/event/slug/POLICY key; edit a frozen doc; register `ESC-BILL-REFERRAL-INVITE`
in `esc_registry.md` (raised here, not self-accepted); create cross-module table access; or build any of
§7. On approval, §7 proceeds on the correct wave branches under the normal review pipeline.

---

### One-paragraph summary for the owner
Your mockup's "invite a business, earn points when they register" model is **not** what the frozen
system does — the frozen `track_referral` refers an **existing** org and there is no invite/code/attribution
primitive. The **reward half is already fully built (M7)**; the missing half is an **M1** external-invitation
token + registration-attribution seam, which is the same gap already open as `ESC-IDN-INVITE-ACCOUNT`, in
the same family as `ESC-VENDIR-INVITE`. That is an architecture change requiring **Board/human approval**
before any code. This doc is the escalation + the exact plan to run once approved.
