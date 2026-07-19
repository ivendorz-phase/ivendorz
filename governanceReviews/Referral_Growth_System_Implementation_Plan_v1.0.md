# Implementation Plan — Referral → Invite-to-Register **Growth System** (v1.0)

> **SUPERSEDED 2026-07-18 by `Referral_Growth_System_Implementation_Plan_v2.0.md`.** The Board approved this
> plan in principle and directed four refinements (generalize to a **Growth Hub** with Referral as one campaign
> type; channel-agnostic recipient model; expanded 8-stage lifecycle; campaign-neutral event name). v2.0 folds
> them in. Read v2.0 for the current build spec; this doc is the reviewed record.

**Status:** IMPLEMENTATION PLAN v1.0 — **direction & ownership Board-RULED (2026-07-18); build gated on
final Board approval of the contract set below.** NOT applied · no frozen doc edited · no production code
written · nothing coined as final. Supersedes the "which model / where" questions in
`Referral_Invite_To_Register_Escalation_and_Plan_v1.0.md` (that packet's fork is now decided).
**Proposed ESC handle:** `ESC-BILL-REFERRAL-INVITE` *(raised, not self-registered — sweep the Authority
Map at registration).* **Likely prerequisite:** `ESC-IDN-INVITE-ACCOUNT` (no pending-user/token entity is frozen).

---

## 0. What the Board ruled (recorded)

- **Direction:** *Invite New Business* (invite-to-register growth), NOT *refer existing organization*.
- **Ownership:** **M1 Identity** owns invitation · token/code · link/QR · registration attribution ·
  token validation · org-creation attribution. **M7 Billing** owns referral lifecycle · qualification ·
  reward calc · reward ledger · points · history. **M6 Communication** owns delivery only. Billing never
  owns invitation/registration; Communication holds no business logic.
- **Qualification milestone** (verification / subscription / first RFQ / …) is a **Doc-3 POLICY** decision,
  never hardcoded.
- **Now:** prepare the plan only; do not implement; do not touch frozen docs; wait for approval.

This plan honors all four stated principles (One-Module-One-Owner · no cross-module FK · contracts/events-only
communication · no AI-invented architecture outside Board approval).

## 1. Current state (verified 2026-07-18, so the plan builds on facts)

| Area | State | Evidence |
|---|---|---|
| M7 reward substrate | `reward_accounts` · `reward_transactions` (append-only) · `referrals` (`pending→qualified→rewarded`) tables + reads `get_reward_balance` / `list_referrals` **exist** | `wave/3-billing` migration `20260712100000_billing_rewards` |
| M7 referral writes | route `POST /billing/referrals` → `handleTrackReferral`; `advance-referral`, `credit-reward` routes present. Migration note says writes were a "next slice" — **completeness to be confirmed** on the branch | `wave/3-billing:app/api/billing/referrals/*` |
| **`referrals.referred_organization_id`** | **NULLABLE** in the frozen schema (`uuid,` — no `NOT NULL`) | migration §3.6.3 — *see the Model-A/B fork in §4* |
| Org provisioning (attribution hook) | `ensureProvisioned(session)` → M1 `provisionIdentity` → `create-organization.command` mints org + founding Owner + audit in ONE txn. **Emits no §8 event today** ("Events: none [DC-1]") | `src/server/auth/provisioning.ts`, `create-organization.command.ts` |
| Event infrastructure | M0 transactional **outbox** exists (`drain-outbox.service.ts`); every module's `contracts/events.ts` is empty — **no module publishes a §8 event yet** | `src/modules/core/infrastructure/events/*` |
| Signup / new-account invite | No client signup/`create_user` wire contract (out-of-band lazy-provisioning); no pending-user/invitation-token entity is frozen | `ESC-7-API-SIGNUP`, `ESC-IDN-INVITE-ACCOUNT` |

**Consequence:** the reward *engine* is essentially in place (M7). The build is almost entirely **M1**
(external invitation + token + attribution) plus **one new cross-module event** and **thin M6 delivery**.

## 2. Target architecture — the seam & the state-ownership split

```
[Referrer · can_manage_billing]
  (1) create Referral Invitation (email/contact) → issue token/link/QR    ─ M1  (NEW entity+contract)
  (2) deliver invite                                                      ─ M6  (delivery-only)
[Invitee] opens link → registers account → creates NEW org
  (3) ensureProvisioned/create-organization carries the token;
      on org mint (same txn) → bind attribution + append outbox event
      InvitedOrganizationRegistered{invitation_id, referrer_org, new_org} ─ M1  (NEW event, via M0 outbox)
[M7 consumes the event]
  (4) track_referral(referred_organization_id = new_org)  → referral `pending`   ─ M7  (frozen)
  (5) advance_referral → `qualified`  when the POLICY milestone is met            ─ M7  (frozen, System)
  (6) advance_referral → `rewarded` + credit_reward → points to referrer         ─ M7  (frozen)
```

**State ownership (as the Board split it):** *Invitation* states (`pending → registered → expired`) live
on the **M1** invitation entity, pre-registration. *Referral/reward* states (`pending → qualified →
rewarded`) live on the **M7** `referrals` row, post-registration. They meet exactly once — at the
attribution event. No row is shared; no FK crosses the schema boundary (M7 stores the org id as a bare UUID,
the frozen pattern).

## 3. The one real design fork for the Board (Model A vs B)

Because `referrals.referred_organization_id` is **nullable** in the frozen schema, there are two valid
placements of the `referrals` row:

- **Model A — referral created at REGISTRATION (recommended).** Pre-registration invite state lives only
  on the M1 invitation. At attribution, M7 calls the **frozen** `track_referral` (referred org now resolves
  — stage-7 REFERENCE satisfied). **Zero M7 contract change.** Simplest; keeps `referrals` rows always
  pointing at a real org.
- **Model B — referral created at INVITE (`referred_organization_id = NULL`), bound at registration.**
  Leverages the nullable column, so a "pending referral" is visible in M7 from invite time. But the frozen
  `track_referral` REFERENCE check requires a resolvable id, so this needs a **Doc-4I ruling / additive
  contract** (a null-referred create + a later bind/advance). More moving parts in M7.

**Recommendation: Model A** — it delivers the same Growth Dashboard (pending invites are counted from the
M1 invitation entity, §8) with no change to M7's frozen contracts. Model B is offered only because the
nullable column suggests Doc-2 may have anticipated it; the Board rules.

## 4. Required architecture changes — by module (all ADDITIVE; drafted, not applied)

### M1 Identity (the bulk of the work)
- **NEW entity `identity.referral_invitations`** — `{ id, referrer_organization_id, invited_email (or contact),
  invited_company_name?, token_hash, state pending|registered|expired, expires_at, created_by, … , SD }`.
  This is the `ESC-IDN-INVITE-ACCOUNT` pending/token gap in a referral flavour.
- **NEW contract `identity.create_referral_invitation.v1`** (Command) — referrer-scoped; issues the
  token/link/QR; delivery handed to M6. Permission: **Board Q — `can_manage_billing` vs a new invite slug**.
- **NEW contract `identity.resolve_referral_token.v1`** (Query) — validate a token at landing (unauth-safe;
  returns only public-safe framing, never the referrer's identity unless Board rules disclosure).
- **Attribution binding** inside the existing `create-organization.command` txn — if a valid referral token
  is present at first-org creation, bind `referral_invitations.state → registered` and append the outbox event
  **in the same transaction** (atomicity; the existing single-txn pattern).
- **NEW §8 event `InvitedOrganizationRegistered`** — M1's *first* published event; carries
  `{ referral_invitation_id, referrer_organization_id, referred_organization_id, occurred_at }`. Via the M0 outbox.

### M7 Billing (Model A → NO contract change)
- Add a **consumer** (Inngest) of `InvitedOrganizationRegistered` → call frozen `track_referral`
  (referrer = event's referrer org; referred = new org). Then the frozen `advance_referral` (System) drives
  `qualified`/`rewarded` on the POLICY milestone, and `credit_reward` pays the referrer.
- **Dependency:** confirm/complete the M7 referral-**write** slice on `wave/3-billing` (route exists; writes
  were flagged "next slice").

### M6 Communication (delivery-only)
- Add invite delivery (Inngest → Resend / SMS / WhatsApp) triggered by `create_referral_invitation`. No
  referral logic; delivery + logs only (the frozen M6 charter).

### M0 / M8 / Doc-3
- **M0:** no change — the outbox already exists; M1 appends to it.
- **M8 / Doc-4J:** register `InvitedOrganizationRegistered` in the **authoritative event catalog** (Doc-4J)
  + the cross-module flow map (Doc-4L).
- **Doc-3 POLICY (no values in code/ADR):** qualification-milestone key (verification | subscription | first_RFQ | …),
  reward-value key (already `[ESC-BILL-POLICY]`), invite-quota / anti-abuse key, token TTL key.

## 5. New contracts & events (the explicit list the Board asked for)

| # | Kind | Name (proposed) | Owner | Op | Notes |
|---|---|---|---|---|---|
| 1 | Entity | `identity.referral_invitations` | M1 | — | token/pending model; SD; per-org |
| 2 | Contract | `identity.create_referral_invitation.v1` | M1 | Command | referrer-scoped; permission = Board Q |
| 3 | Contract | `identity.resolve_referral_token.v1` | M1 | Query | landing-time validation; privacy-safe |
| 4 | Behaviour | attribution bind in `create-organization` | M1 | Command (extend) | same-txn; no new create contract |
| 5 | Event | `InvitedOrganizationRegistered` | M1 → M7 | §8 | M1's first event; via M0 outbox |
| 6 | Consumer | `track_referral` subscriber | M7 | Job | **frozen contract**, no change (Model A) |
| 7 | Job | invite delivery | M6 | Job | delivery-only |
| — | POLICY keys | milestone · reward-value · quota · TTL | Doc-3 | — | values never in ADR/contract text |

## 6. Frozen-doc additive patches this will require (authored + Board-approved LATER; not now)

Doc-2 (§3/§5/§10 — new invitation entity + state + the §8 event) · Doc-4C (M1 contracts 2–4) ·
Doc-4J (event catalog registration) · Doc-4L (flow map) · Doc-3 (POLICY keys) · Doc-6C (M1 schema realization
of `referral_invitations`) · Doc-5C (M1 API rows) · Doc-7E (the FE surface) · **Doc-4I only if Model B**.
Each is an **additive patch PROPOSAL** to be drafted and ratified per the normal freeze pipeline — this plan
edits none of them.

## 7. Growth Dashboard — metric sourcing (the Board's 8 tiles)

| Tile | Source | Clean? |
|---|---|---|
| Total invitations | M1 `referral_invitations` count | own-data count ✓ |
| Pending invitations | M1 invitations `state=pending` | ✓ |
| Registered businesses | M1 invitations `state=registered` | ✓ |
| Verified businesses | M7 referrals `state=qualified` (verification = the POLICY milestone) | ✓ |
| Qualified referrals | M7 referrals `state=qualified` | ✓ |
| Reward points earned | M7 `get_reward_balance` | ✓ |
| Pending rewards | M7 referrals not yet `rewarded` | derived ✓ |
| Referral history | M7 `list_referrals` — **opaque org ref + frozen state only** | Inv #11 ✓ |

All figures are the referrer's **own** data (safe counts), never a matched/excluded universe. History stays
opaque-ref (no company display names — `list_referrals` projects none). No public surface; account-scoped.

## 8. Roadmap (executes only after Board approval of §4–5)

- **P0 — Contracts & patches (docs, Board):** draft the additive patch proposals (§6); Board ratifies; resolve
  `ESC-IDN-INVITE-ACCOUNT`; register `ESC-BILL-REFERRAL-INVITE` + the event in Doc-4J. Rule Model A/B + §9 Qs.
- **P1 — M1 backend (Identity wave):** `referral_invitations` migration + entity; `create_referral_invitation` +
  `resolve_referral_token`; attribution bind in `create-organization`; publish `InvitedOrganizationRegistered`.
- **P2 — M6 delivery + M7 consumer:** M6 invite delivery job; M7 subscriber → `track_referral`; confirm the M7
  referral-write slice; wire `advance_referral`/`credit_reward` on the POLICY milestone.
- **P3 — FE Growth Dashboard (`/account/rewards`):** relabel CTA "Refer an organization" → **"Invite a business"**;
  invitation dialog (email/contact) → `create_referral_invitation`; landing page for the token; wire the 8 tiles
  to real reads (replace the seed); `can_manage_billing`-gated; pending-invitation view from M1.
- **Gates each phase:** `/ivendorz-security` (org context · permission slug · privacy Inv #11 · money-boundary ·
  no cross-module FK · event-only seam · no hardcoded milestone) → Review-A → Review-B → Board. Backend lands on
  the **identity/billing wave branches**; `fe/account-referral-nav` stays presentation-only until Wave-3 integration.

## 9. Open Board sub-questions (for ratification — Raise ≠ Accept)

- **Q-1 Model A vs B** (§3) — recommend A.
- **Q-2 Permission** — `can_manage_billing` vs a new referral-invite slug.
- **Q-3 Attribution integrity** — first-touch vs last-touch; self-referral + dup-org guard (extends the frozen
  `track_referral` `BUSINESS` dup rule to the invite stage).
- **Q-4 Privacy** — does the invitee learn the referrer's identity? (history stays opaque-ref regardless).
- **Q-5 Token form** — link vs code vs QR (all three can share one token; QR encodes the link).
- **Q-6 Milestone** — which Doc-3 milestone qualifies (verification | subscription | first RFQ), and whether it's
  configurable per campaign.
- **Q-7 Money boundary** — confirm reward points remain a loyalty entitlement (never buyer↔vendor money, never
  procurement standing — Doc-4I H.9 / CLAUDE.md §1). Plan asserts this; coins no exception.

## 10. Boundary — un-built pending approval (CLAUDE.md §8 / Red-Flag Checklist)

No entity/contract/event/slug/POLICY key is coined; no frozen doc edited; no ESC self-registered; no
cross-module FK/table access; no production code. On approval, §8 proceeds on the correct wave branches under
the full review pipeline.
