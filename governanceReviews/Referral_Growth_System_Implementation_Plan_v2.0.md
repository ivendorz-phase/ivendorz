# Implementation Plan — **Growth Hub** (Invitation Engine + Campaigns) v2.0

**Status:** IMPLEMENTATION PLAN v2.0 — **approved in principle by the Board (2026-07-18)**; revised per the
Board's four refinements + a fifth (**Growth Analytics**, §7A, added 2026-07-18). Build still gated on final
approval of the contract set + the open questions (§10).
NOT applied · no frozen doc edited · no production code · nothing coined as final. **Supersedes**
`Referral_Growth_System_Implementation_Plan_v1.0.md` (which the Board reviewed).

> **P0 STARTED 2026-07-18 — Board froze this plan as the baseline and authorized P0 (docs only).** The additive
> patch set is drafted in `GrowthHub_P0_Additive_Patch_Set_PROPOSAL_v1.0.md` (8 linked patches: Doc-2/3/4C/4J/4L/5C/6C/7E).
**Proposed umbrella ESC handle:** `ESC-GROWTH-INVITE` *(subsumes the earlier `ESC-BILL-REFERRAL-INVITE`;
raised, not self-registered).* **Prerequisite:** `ESC-IDN-INVITE-ACCOUNT` (no pending-user/token entity frozen).

---

## 0. Board feedback folded in (v1.0 → v2.0)

| # | Board refinement | How v2.0 applies it | Governance guard I added |
|---|---|---|---|
| 1 | Generalize **Referral → Growth Hub**; Referral = one campaign type | §3.1 campaign model; the invitation engine is generic, Referral is campaign #1 | **No new module** — Growth Hub = a surface + M1 engine + a campaign discriminator + Doc-3 rules |
| 2 | **Channel-agnostic** (not email) | §3.2 `recipient_type ∈ {EMAIL,PHONE,WHATSAPP,LINK,QR}` + open vs targeted; M6 delivers | LINK/QR are **open, multi-redemption** → invitation-vs-conversion split (§3.3) |
| 3 | **Expand the lifecycle** (8 stages) | §3.4 mapped onto existing states/signals | **Frozen M7 `pending→qualified→rewarded` machine is NOT expanded** — granularity by composition; machine-expansion flagged as the alternative (§3.4, Q-8) |
| 4 | **Campaign-neutral event name** | `InvitationConverted` (was `InvitedOrganizationRegistered`) | payload carries `campaign_type` so one event serves all campaigns |
| 5 | **Growth Analytics** (analytics, not workflow/rewards) | §7A — a read-model/projection over growth events, **outside M1/M7**, LATER phase | **projection not truth · event-fed not cross-table · observe-only (never feeds workflow) · staff-scoped · no new module** |

Still honors every principle: One-Module-One-Owner · no cross-module FK · contracts/events-only · no
AI-invented architecture outside Board approval · no new module boundary.

## 1. The reframe — Growth Hub, not a Referral feature

**Growth Hub** = a reusable **invitation engine** (M1) + **campaigns** (parameterization) + **rewards** (M7) +
**delivery** (M6). It is a *product surface and a set of contracts*, **not a new module** — it lives inside
the frozen M1/M6/M7 ownership exactly as the Board ruled. "Referral" is the first campaign type; "Refer a
Vendor / Buyer", "Invite a Factory / Importer / EPC / Consultant", "Seasonal", "Partner", "Trade-Fair / QR"
are additional campaign types that reuse the same engine and change only the campaign RULES.

## 2. Current state (verified 2026-07-18 — unchanged from v1.0, in brief)

Reward engine is essentially built (M7 `referrals` + reward ledger + reads on `wave/3-billing`,
`20260712100000_billing_rewards`; `track_referral`/`advance_referral`/`credit_reward` frozen, Doc-4I §HB-6).
Attribution hook = `ensureProvisioned → create-organization.command` (emits **no** §8 event today; no module
publishes one yet). M0 outbox exists. The whole build is **M1** (generic invitation + attribution) + **one
campaign-neutral event** + **multi-channel M6 delivery**.

## 3. Generalized architecture

### 3.1 Campaign model (the generalization)
A **campaign** parameterizes an invitation. Minimal, additive shape:
- **`campaign_type`** — a discriminator carried on every invitation (`referral` is #1). New types are new
  enum values / POLICY rows, **never** new code paths or modules.
- **Campaign RULES = Doc-3 POLICY** (already policy-driven): the qualifying milestone, the reward value, the
  invite quota, the token TTL, the active window — keyed by `campaign_type`. **No value in ADR/contract text.**
- **Audience** ("a Factory", "an Importer", "an EPC", "a Consultant") is expressed **only** through existing
  dimensions — vendor **capability matrix** (`can_supply/can_service/can_fabricate/can_consult`, **Inv #1**)
  and **participation** (Buyer/Vendor/Hybrid, **Inv #2**). **No new participant label is coined** (Inv #1 bars
  vendor "types"; a campaign targets a *capability/participation profile*, not a coined label).
- **Open Q-9 (§10):** does a campaign need a *configured registry* (name/window/rules an admin creates), and
  if so who owns it — **M8 config** (admin ops) or a POLICY-backed catalog? v2.0 ships the **discriminator +
  Doc-3 POLICY** path (no registry) as the MVP; the registry is a Board question, **not** a new module.

### 3.2 Channel-agnostic recipient model
Replace `invited_email` with a generic pair on the M1 invitation:
```
recipient_type       ∈ { EMAIL, PHONE, WHATSAPP, LINK, QR, … }   -- extensible
recipient_identifier   string | null      -- the address for TARGETED types; NULL for open LINK/QR
```
- **Targeted** (EMAIL/PHONE/WHATSAPP): one recipient, single conversion; **M6 decides delivery** (Resend / SMS
  / WhatsApp — the frozen M6 delivery-only charter).
- **Open** (LINK/QR): no bound recipient, **many** redemptions; QR simply encodes the LINK. Sharing is the
  referrer's action; delivery may not involve M6 at all.
M6 gains no business logic — it only maps `recipient_type` → a delivery channel.

### 3.3 The seam (updated — invitation vs conversion; campaign-neutral event)
```
[Referrer · permission per Q-2, scoped by campaign]
  (1) create Invitation(campaign_type, recipient_type, recipient_identifier?) → token/link/QR   ─ M1
  (2) deliver (targeted only)                                                                   ─ M6
[Invitee] opens link/redeems token → registers account → creates NEW org
  (3) on org mint, attribution binds a CONVERSION row (referrer, referred, campaign_type)       ─ M1
      and appends outbox event  InvitationConverted{…, campaign_type}                            ─ M1 (via M0)
[M7 consumes]
  (4) track_referral(referred_organization_id = new org)  → referral `pending`                  ─ M7 (frozen)
  (5) advance_referral → `qualified`  when the campaign's POLICY milestone is met                ─ M7 (frozen)
  (6) advance_referral → `rewarded` + credit_reward → points to referrer                        ─ M7 (frozen)
```
**Invitation vs conversion (handles open LINK/QR):** the **invitation** is the issued artifact (targeted or
open); a **conversion** is one registered org attributed to it. Targeted invites cap at 1 conversion; open
codes allow many. **Every conversion emits one `InvitationConverted`** → one M7 referral. This is what makes
LINK/QR (refinement #2) work without special-casing.

### 3.4 The 8-stage lifecycle — mapped WITHOUT changing the frozen M7 machine (governance-critical)
The Board's expanded lifecycle is realized by **composing** existing states/signals across owners. **No new
M7 referral state is coined** (that machine is frozen — Doc-2 §3.8/§10.8 / Doc-4I H.5):

| Board stage | Backed by | Owner | State / signal |
|---|---|---|---|
| Invitation Sent | invitation created (+ M6 dispatch for targeted) | M1 | invitation `sent` (NEW entity — additive) |
| Invitation Accepted | token opened / redeemed | M1 | invitation `accepted` |
| Account Created | Supabase auth user exists (out-of-band) | M1 seam | auth fact (`ESC-7-API-SIGNUP`) — no own state |
| Organization Created | new org minted → attribution → event | M1 | conversion row + emit `InvitationConverted` |
| Verification Completed | M5 verification / the campaign's POLICY milestone | **M5 signal → M7** | milestone INPUT, **not** a referral state |
| Qualification Achieved | frozen `advance_referral → qualified` | M7 | referral `qualified` |
| Reward Approved | frozen `advance_referral → rewarded` | M7 | referral `rewarded` |
| Reward Credited | frozen `credit_reward` ledger write | M7 | `reward_transactions` row |

Only NEW states are on the **M1 invitation** entity (`sent → accepted → converted | expired | revoked`) — and
that entity is itself new/additive, so **no frozen machine changes.** **Q-8 (§10):** if the Board wants literal
new *referral* states in M7 (e.g. a distinct `reward_approved` before `rewarded`), that is a change to the
**frozen** Doc-2/Doc-4I state machine — a Flag-and-Halt item requiring an additive frozen patch, **not** a
plan-level decision. v2.0 recommends the composition above (no frozen change).

## 4. Module changes (all ADDITIVE; drafted, not applied)

- **M1 Identity (bulk):** NEW `identity.growth_invitations` (campaign_type, recipient_type/_identifier, token,
  max_redemptions, window, state `sent→accepted→converted|expired|revoked`, SD) + NEW
  `identity.invitation_conversions` (referrer_org, referred_org, campaign_type, occurred_at). Contracts:
  `create_invitation`, `resolve_invitation_token`, and attribution-bind inside `create-organization` (same txn).
  Publishes `InvitationConverted` per conversion via the M0 outbox — **M1's first §8 event.**
- **M7 Billing (Model A → NO contract change):** an Inngest consumer of `InvitationConverted` → frozen
  `track_referral`; then frozen `advance_referral`/`credit_reward` on the POLICY milestone. **Dependency:**
  confirm/complete the M7 referral-**write** slice on `wave/3-billing`.
- **M6 Communication:** multi-channel delivery for targeted invites (`recipient_type` → channel); delivery + logs
  only. No campaign/referral logic.
- **M0 / M8 / Doc-3:** M0 outbox unchanged; **Doc-4J** registers `InvitationConverted` (authoritative catalog) +
  **Doc-4L** flow map; **Doc-3 POLICY** holds per-campaign milestone / reward-value / quota / TTL keys.

## 5. New contracts & events (revised, campaign-neutral)

| # | Kind | Name (proposed) | Owner | Op | Notes |
|---|---|---|---|---|---|
| 1 | Entity | `identity.growth_invitations` | M1 | — | campaign_type + channel-agnostic recipient; targeted or open |
| 2 | Entity | `identity.invitation_conversions` | M1 | — | one per attributed org (supports open multi-redemption) |
| 3 | Contract | `identity.create_invitation.v1` | M1 | Command | campaign-scoped; permission per Q-2 |
| 4 | Contract | `identity.resolve_invitation_token.v1` | M1 | Query | landing-time; privacy-safe (Q-4) |
| 5 | Behaviour | attribution bind in `create-organization` | M1 | Command (extend) | same-txn; no new create contract |
| 6 | Event | `InvitationConverted` | M1 → M7 (+future) | §8 | campaign-neutral; carries `campaign_type` |
| 7 | Consumer | `track_referral` subscriber | M7 | Job | **frozen contract**, no change (Model A) |
| 8 | Job | multi-channel delivery | M6 | Job | delivery-only |
| — | POLICY keys | per-campaign milestone · reward-value · quota · TTL | Doc-3 | — | values never in ADR/contract text |

## 6. Frozen-doc additive patches required LATER (Board-approved; none edited now)

Doc-2 (§3/§5/§10 — invitation + conversion entities, invitation states, the §8 event) · Doc-4C (M1 contracts
3–5) · Doc-4J (event catalog) · Doc-4L (flow map) · Doc-3 (per-campaign POLICY keys) · Doc-6C (M1 schema
realization) · Doc-5C (M1 API rows) · Doc-7E (the Growth Hub surface) · **Doc-4I only if Model B / Q-8 machine-
expansion.** Each is an additive patch PROPOSAL through the normal freeze pipeline.

## 7. Growth Hub dashboard (campaign-filterable)

The Board's 8 tiles, now with a **campaign filter** and a **conversion funnel** (Sent → Accepted → Converted →
Qualified → Rewarded):

| Tile | Source | Owner |
|---|---|---|
| Total invitations | `growth_invitations` count | M1 |
| Pending invitations | invitations `state ∈ {sent, accepted}` | M1 |
| Registered businesses | `invitation_conversions` count | M1 |
| Verified businesses | referrals `state=qualified` (verification = the POLICY milestone) | M7 |
| Qualified referrals | referrals `state=qualified` | M7 |
| Reward points earned | `get_reward_balance` | M7 |
| Pending rewards | referrals not yet `rewarded` | M7 |
| Referral history | `list_referrals` — **opaque org ref + frozen state only** | M7 |

All are the referrer's **own** data (safe counts), never a matched/excluded universe; history stays opaque-ref
(Inv #11). Account-scoped, not public. Campaign filter reads the `campaign_type` discriminator.

## 7A. Growth Analytics — a SEPARATE bounded concern (projection, not workflow) · LATER

Board refinement #5: campaign **analytics** (acceptance/conversion/verification rates, cost per qualified
referral, best campaign, top referrers, top channels, best-performing industries) is **analytics, not
workflow, and not rewards.** It is deliberately kept **out of M1 and M7** and lands in a **later phase.**

**What it is (architecturally):** a **read-model / projection** over the growth **events** — never a source of
truth, never cross-module table access, never an FK into M1/M7/M2 (the frozen read-model rule). The analytics
owner **subscribes to events** (`InvitationConverted` + invitation/referral state changes) and builds its own
projection in its own schema, correlating by id there. That is the only boundary-legal way to compute
cross-entity metrics.

**Two audiences, two scopes:**
- **Referrer (own-data)** — "my acceptance/conversion/verification rate", "my top channel": derivations over the
  referrer's OWN invitations/conversions, shown in the Growth Hub dashboard (§7). No new owner.
- **Platform / marketing staff (cross-tenant)** — best campaign, top referrers, top channels, best industries,
  cost per qualified: **aggregate, staff-scoped**, in an admin analytics surface. **Recommended owner: M8 Admin
  Operations** (staff reporting) — Board to ratify (Q-11); PostHog (the stack's analytics tool) is a
  complementary, non-authoritative funnel view, not the home for business metrics like cost-per-qualified.

**Metric → dimension → source (all via events, not joins):**
| Metric | Formula | Dimension (must ride the event) | Scope |
|---|---|---|---|
| Invitation acceptance rate | accepted / sent | invitation state (M1) | own + staff |
| Registration conversion rate | converted / sent | M1 conversion | own + staff |
| Verification rate | qualified / converted | M7 `qualified` × M1 conversion | own + staff |
| Cost per qualified referral | reward **points** credited / qualified | M7 credit (POINTS — Q-12) | staff |
| Best-performing campaign | rank by conversion/qualified | `campaign_type` on the event | staff |
| Top referrers | rank orgs by qualified | referrer_org (aggregate, staff-only) | staff |
| Top channels (WhatsApp/QR/Email) | group by channel | `recipient_type` on the event | own + staff |
| Best-performing industries | group by referred-org industry | industry via an **M2 category read-model/event** correlation, never an FK | staff |

**Design implication (feeds §3.3):** the growth events must **carry the analytics dimensions**
(`campaign_type`, `recipient_type`/channel) so the projection needs no cross-module join. Industry is obtained
by correlating `referred_organization_id` against an **M2-published** category read-model/event — never a
`marketplace` FK.

**Analytics-specific governance guards:**
- **Projection, not truth** — disposable; rebuildable from events; never authoritative.
- **Observe-only firewall** — analytics NEVER feeds back into matching/routing/rewards/workflow (the moat); it
  is marketing intelligence, not a control signal.
- **Inv #11 / privacy** — platform-wide views are staff-scoped and aggregate; no private CRM / exclusion data.
- **Money boundary** — "cost per qualified" is in reward **points** (Q-12); points are not money. Any BDT
  marketing spend is external (finance/PostHog), never conflated with points.
- **No new module** — the analytics read-model lives inside its ratified owner (recommended M8), not a new
  "Analytics module."

**Timing:** **P4 — LATER, non-blocking.** The invitation+reward engine (P0–P3) ships first; once the events
flow, the projection is added on top. Building analytics early would couple it to an unstable event shape.

## 8. Roadmap (executes only after approval of §4–5 + §10)

- **P0 — Contracts & patches (docs, Board):** draft additive proposals (§6); ratify; resolve
  `ESC-IDN-INVITE-ACCOUNT`; register `ESC-GROWTH-INVITE` + `InvitationConverted` in Doc-4J; rule Q-1…Q-9.
- **P1 — M1 engine:** `growth_invitations` + `invitation_conversions` migration; `create_invitation` +
  `resolve_invitation_token`; attribution bind; publish `InvitationConverted`. Ship **`referral` campaign first**.
- **P2 — M6 multi-channel delivery + M7 consumer:** channel delivery; M7 subscriber → `track_referral`; confirm
  the M7 write slice; wire `advance_referral`/`credit_reward` on the POLICY milestone.
- **P3 — FE Growth Hub (`/account/rewards`):** surface becomes campaign-aware; CTA "Invite a business"; invite
  dialog (channel-agnostic) → `create_invitation`; token landing page; the 8 tiles wired to real reads;
  permission-gated; conversion funnel.
- **Platform-ready:** because the engine is campaign-parameterized, "Refer a Vendor / Partner / Trade-Fair / QR"
  ship later as **new campaign types + Doc-3 rules only** — no new contracts, events, or modules.
- **P4 — Growth Analytics (LATER · non-blocking · §7A):** once the growth events flow, add the analytics
  projection under its ratified owner (recommended M8) — staff cross-tenant metrics + the referrer's own funnel.
  Sequenced last on purpose: it consumes a stable event shape, and it is observe-only (never gates the engine).
- **Gates each phase:** `/ivendorz-security` (org context · permission · privacy Inv #11 · money-boundary · no
  cross-module FK · event-only seam · no hardcoded milestone · **no coined participant label**, Inv #1/#2) →
  Review-A → Review-B → Board. Backend on the identity/billing wave branches; this FE branch stays presentation-only.

## 9. Governance guardrails re-affirmed under the generalization

- **No new module** — Growth Hub is M1 engine + M7 reward + M6 delivery + Doc-3 rules + a surface.
- **Frozen M7 machine intact** — `pending→qualified→rewarded` unchanged (composition, not expansion; Q-8).
- **Inv #1/#2** — campaign audience uses the capability matrix + participation, never a coined vendor/participant type.
- **Inv #11 / firewall** — history opaque-ref; rewards never a governance signal; no exclusion figure.
- **Money boundary** — reward points stay a loyalty entitlement (never buyer↔vendor money, never procurement standing).
- **Reference-never-restate / POLICY altitude** — no frozen value copied; POLICY values live in Doc-3, never ADR/code.
- **Analytics = observe-only projection** (§7A) — event-fed, never cross-module tables/FK; never a source of truth;
  never feeds workflow/matching/rewards; staff-scoped for cross-tenant; not a new module.

## 10. Open Board questions (for ratification — Raise ≠ Accept)

Q-1 Model A vs B (recommend A) · Q-2 permission (`can_manage_billing` vs a new invite slug) · Q-3 attribution
integrity (first/last-touch; self-referral + dup-org guard) · Q-4 privacy (does the invitee learn the referrer?)
· Q-5 token form (link/code/QR — one token, QR encodes the link) · Q-6 which Doc-3 milestone qualifies (per
campaign) · Q-7 money boundary (confirm) · **Q-8 compose vs expand the frozen M7 machine** (recommend compose) ·
**Q-9 campaign registry** (none / M8 config / POLICY catalog — recommend discriminator+POLICY MVP) · Q-10 event
name ratify (`InvitationConverted` vs `OrganizationRegisteredFromInvitation`) · **Q-11 Growth Analytics owner**
(M8 admin read-model / a dedicated reporting concern / PostHog for telemetry — recommend M8 for business
metrics) · **Q-12 "cost" definition** (reward **points** per qualified — recommended, money-boundary-safe — vs
external BDT marketing spend, which stays out of the points system).

## 11. Boundary — un-built pending approval (CLAUDE.md §8 / Red-Flag Checklist)

No entity/contract/event/slug/POLICY key coined; no frozen doc edited; no ESC self-registered; no cross-module
FK/table access; no production code; no new module. On approval, §8 proceeds on the correct wave branches under
the full review pipeline.
