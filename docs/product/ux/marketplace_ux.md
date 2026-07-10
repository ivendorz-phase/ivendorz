# iVendorz — Marketplace UX Specification (Actor Journeys)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.2** — Marketplace UX / Journeys (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29
**Wave:** 0E — Marketplace UX Specification
**Companions:** [`design_philosophy.md`](../../frontend/design-system/design_philosophy.md) · [`information_architecture.md`](../information-architecture/information_architecture.md) · [`ux_patterns.md`](ux_patterns.md)
**Revision v0.2:** added a one-page Visual Journey Map + intent ("emotion") arcs (§1.3), **Journey IDs**
(`J-GST`/`J-BUY`/`J-PROC`/`J-VND`/`J-SUP`/`J-ADM`) with per-step IDs, per-journey **Success criteria**,
and a reserved **Future Journey Extensions** appendix (§12).

---

## 0. Precedence & Authority (read first)

A **non-authoritative companion**. It documents **end-to-end actor journeys** by composing the surfaces
(IA), patterns (UX), and state machines (Doc-4M) already defined — it **coins no architecture, route,
contract, state, transition, permission, event, or journey step that isn't bound to a wired contract**.
It sits **below** the frozen Doc-7 program and conforms upward.

```
Master Architecture → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                  ▲ state machines                                    ▲ this doc conforms upward
```

- Journeys traverse the surfaces in [`information_architecture.md`](../information-architecture/information_architecture.md) §6,
  use the patterns in [`ux_patterns.md`](ux_patterns.md) §2–§9, and follow the state machines in
  `ux_patterns.md` §8 (Doc-4M). **Every step binds a wired Doc-5 contract**; gaps are flagged
  `[ESC-7-*]` (§11) — never invented.
- **Journey IDs** (`J-*`) introduced in §1.3/§2–§7 are **document-internal reference handles only**
  (for ADR / cross-doc citation) — they coin no architecture.
- **On any conflict, the frozen corpus wins and this doc is corrected** (CLAUDE.md §7, §11).

> **Scope of Wave 0E:** *what each actor does, in order, to get value* — the click-path at the
> **journey/step** level. Exhaustive page enumeration is **Wave 0F**; pixel screens are **0H**. A
> **specification, not code.**

---

## 1. Purpose & Scope

iVendorz is ~40% **marketplace** and ~60% **structured procurement + post-award ops**. This document
threads both into coherent journeys per actor, so that when pages (0F) and screens (0H) are designed,
each already has a known place in a known path.

### 1.1 The six journeys (and how they relate)

The six named journeys split into **identity/presence journeys** (onboarding + building a presence) and
**operational journeys** (the recurring transaction loop), plus the **guest funnel** and **governance**:

| ID | Journey | Actor | Nature | Primary surface(s) |
|---|---|---|---|---|
| **J-GST** | Guest | Anonymous | Discover → convert | Public (7D) → Auth (7E) |
| **J-BUY** | Buyer | Buyer org | Identity / presence / setup | Account (7E) + Buyer (7F) |
| **J-PROC** | Procurement | Buyer org | Operational loop (the core) | Buyer (7F) |
| **J-VND** | Vendor | Vendor org | Identity / presence | Account (7E) + Vendor (7G) |
| **J-SUP** | Supplier | Vendor org | Operational loop (selling) | Vendor (7G) |
| **J-ADM** | Admin | Staff | Governance | Admin (7H) |

> **Design note (interpretation):** *Buyer* and *Vendor* are the **onboarding + presence** journeys;
> *Procurement* and *Supplier* are the **operational loops** that recur afterward. A **Hybrid** org
> runs both the Procurement and Supplier loops under **one active org** (Invariant #2; Doc-7C §4).

### 1.2 Journey notation

Each journey is a **staged path**: `Step → goal → key actions (pattern / wired contract) → resulting
state → governance`, with a per-journey **intent arc** and **success criteria**. The **cross-journey
rails** (§8) apply to every step.

### 1.3 Visual Journey Map (one page)

**Buyer side — discover to delivered:**

```
 [J-GST] Guest ─convert─▶ [J-BUY] Buyer setup ─▶ [J-PROC] Procurement ─▶ Award ─▶ Post-award ─▶ Closed
   discover                 org · team · workflow     RFQ → match → quotes → compare        engagement → WCC
   intent: Curiosity ▶ Discovery ▶ Evaluation ▶ Trust ▶ Need ▶ Confidence ▶ Comparison ▶ Decision ▶ Audit
```

**Vendor side — claim to completed:**

```
 [J-GST] Guest ─convert─▶ [J-VND] Vendor setup ─▶ [J-SUP] Supplier ─▶ Award ─▶ Delivery ─▶ Completed
   discover                 profile · microsite        invited → quote          challan → invoice → payment
   intent: Curiosity ▶ Identity ▶ Presence ▶ Credibility ▶ Invitation ▶ Opportunity ▶ Competition ▶ Award ▶ Payment
```

**Governance overlay:** [J-ADM] Admin oversees all journeys, acting **ON targets by ID** (no active-org).

**Intent ("emotion") arcs — consolidated:**

| Journey | Intent arc |
|---|---|
| **J-GST** Guest | Curiosity → Discovery → Evaluation → Trust → Commitment |
| **J-BUY** Buyer | Onboarding → Configuration → Readiness |
| **J-PROC** Procurement | **Need → Confidence → Comparison → Decision → Audit** |
| **J-VND** Vendor | Identity → Presence → Credibility → Visibility |
| **J-SUP** Supplier | **Invitation → Opportunity → Competition → Award → Payment** |
| **J-ADM** Admin | Signal → Review → Decision → Enforcement → Record |

---

## 2. Guest Journey — `J-GST` (anonymous → conversion)

**Intent arc:** Curiosity → Discovery → Evaluation → Trust → Commitment.
**Goal:** let an anonymous industrial buyer discover capability and convert — without ever exposing
private or unpublished data.

```
Land → Explore taxonomy → Search / filter → View vendor profile/microsite → Compare → Convert
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| **J-GST-01** | Land | Marketing home, SEO landing | Public, published-only |
| **J-GST-02** | Explore | Industrial Category Explorer (UX §3.2 · `search_catalog` facets) | ⚠ full tree gated `[ESC-7-API-CATNAV]` — facets only |
| **J-GST-03** | Search / filter | Industrial search (UX §7.4 · `search_catalog`); directory (`list_vendor_directory`) | Presentation; **never re-ranks M3** |
| **J-GST-04** | View | Vendor profile / microsite (`get_public_vendor_profile`) + trust badge (read-only, M5) | Published projection; **no draft leaks**; trust displayed never computed |
| **J-GST-05** | Compare | Public compare (UX §7.5) | Ungoverned side-by-side; **implies no matching/recommendation** |
| **J-GST-06** | Convert | CTAs → `(auth)`: sign up · claim vendor · start RFQ · favorite | Hands off to J-BUY / J-VND (auth required) |

**Governance rails:** the public surface has **zero concept of buyer-private status** (Invariant #11);
no RFQ board for guests (Doc-3 §5.1). Gaps: `[ESC-7-API-PRODDETAIL]`, `[ESC-7-API-ADS]` (§11).
**Success:** ✔ converted to an authenticated session (org created / vendor claimed / RFQ started);
✔ no private or unpublished data ever exposed.

---

## 3. Buyer Journey — `J-BUY` (onboarding & presence)

**Intent arc:** Onboarding → Configuration → Readiness.
**Goal:** stand up a buyer organization and team so the Procurement loop (J-PROC) can run.

```
Sign up → create org → set buyer profile + workflow → invite team / roles → (enter J-PROC)
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| **J-BUY-01** | Sign up | Auth-entry (Supabase Auth) | Authenticated session |
| **J-BUY-02** | Create org | `create_organization` (Doc-5C §C5) | **Every user ≥1 org**; *Users act, Organizations own* (Invariant #5) |
| **J-BUY-03** | Active context | Server resolves active-org (Doc-7C §4) | `Iv-Active-Organization` **server-validated, never client-trusted** |
| **J-BUY-04** | Buyer profile / workflow | Settings (UX §5.1 · `upsert_buyer_profile`, `update_workflow_settings`) | Sets the **approval chain** + **award threshold** used in J-PROC |
| **J-BUY-05** | Team & roles | Members (`invite_member`, `accept_invitation`); Roles (`create_role`, `set_role_permissions`) | Two role dimensions (Invariant #2); permissions by reference (Invariant #10) |
| **J-BUY-06** | Billing (optional) | Plans / subscription (`purchase_subscription`) | **Entitlements**, never plan-name checks; **no plan gates matching/award** (Doc-3 §11.8) |

**Governance rails:** active-org server-resolved; gating reads wired contracts, never name-strings. A
**Hybrid** org also runs J-VND under the same org.
**Success:** ✔ organization created + active-org resolved; ✔ team + roles configured; ✔ approval
chain / award threshold set; ✔ ready to author RFQs.

---

## 4. Procurement Journey — `J-PROC` (the core operational loop)

**Intent arc:** Need → Confidence → Comparison → Decision → Audit.
**Goal:** go from a need to an awarded vendor and a completed engagement — the moat. Bound to the
**RFQ state machine** (`ux_patterns.md` §8.1, Doc-4M).

```
Discover → Author RFQ (wizard) → Internal approval → [System: moderate → match → route] →
Quotations arrive → Compare → Shortlist → Award → Post-award ops → Close
```

| ID | Step | Actions (pattern · contract) | RFQ state (Doc-4M) | Governance |
|---|---|---|---|---|
| **J-PROC-01** | Discover | Discovery (UX §7 · `search_catalog`, `list_vendor_directory`); favorites (`add_catalog_favorite`) | — | Presentation; never re-ranks M3 |
| **J-PROC-02** | Author | RFQ wizard (UX §5.1 · `create_rfq` → `update_rfq`) | `draft` | Resumable draft via contract |
| **J-PROC-03** | Submit | `submit_rfq` | `draft → pending_internal_approval` *or* `submitted` | Self-approve path if `can_approve_rfq` |
| **J-PROC-04** | Internal approval | `approve_rfq` / `reject_internal_rfq` (UX §8.2) | `pending_internal_approval → submitted` / `→ draft` | **No auto-approve timeout** (Doc-3 §1.2) |
| **J-PROC-05** | Moderation | *System / Admin* `moderate_rfq` | `submitted → under_review → matching` (or → `draft`) | Demand-side quality gate |
| **J-PROC-06** | Match & route | *System* matching pipeline + routing wave | `matching → vendors_notified` | **Engine owns invitations**; gate-before-score; **no plan gates** |
| **J-PROC-07** | Observe | Routing log / invitations (`get_routing_log`, `list_invitations`) | `vendors_notified` | **Deferral invisible to buyer** (Doc-3 §4.2) |
| **J-PROC-08** | Receive quotes | Quotation reads (`get_quotation`, `list_quotations_for_rfq`) | `→ quotations_received` | Visibility-gated; vendor isolation |
| **J-PROC-09** | Compare | Comparison (UX §2.7 · `get_comparison_statement`) | `→ buyer_reviewing` | **Read-only, System-generated, never recommends a winner** (R6) |
| **J-PROC-10** | Clarify | `manage_clarification` (+ M6 thread) | `buyer_reviewing` | — |
| **J-PROC-11** | Shortlist | `shortlist_quotation` | `→ shortlisted` | `can_approve_vendor_selection` |
| **J-PROC-12** | Award | `award_rfq` (UX §8.4) | `shortlisted → closed_won` | **Explicit, unranked, 1:1, never auto-recommended**; **award-threshold approval** (Doc-3 §9.4) |
| **J-PROC-12b** | Or close lost | `close_lost_rfq` | `→ closed_lost` | Uniform closure; non-penalizing |
| **J-PROC-13** | Post-award ops | PO / payment / challan / invoice / WCC (UX §8.5) | engagement `open → in_delivery → completed → closed` | **Records only — platform never settles money** (R8 / DF-6) |
| **J-PROC-14** | CRM (private) | `get/update_crm_status`, `add_crm_note`, `set_approved`, `set_blacklist` | — | **Buyer-private — never leaks** (Invariant #11) |

**Governance rails (moat):** no AI/UI/comparison recommends-to-winner or auto-selects (R6); payment/
entitlement never influences matching/selection (R7); split sourcing = `reissue_rfq`, never multi-award.
**Success:** ✔ RFQ `closed_won` (or cleanly `closed_lost`); ✔ engagement created (`open`);
✔ immutable audit recorded.

---

## 5. Vendor Journey — `J-VND` (onboarding & presence)

**Intent arc:** Identity → Presence → Credibility → Visibility.
**Goal:** establish a discoverable vendor presence and the signals buyers trust.

```
Sign up / claim → profile + capacity + declared tier → microsite → catalog & products → categories →
advertising → verification (Admin/Trust) → discoverable
```

| ID | Step | Actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| **J-VND-01** | Claim / create | `claim_vendor_profile` / `create_vendor_profile` | Claim lifecycle + visibility scope (Invariant #3) |
| **J-VND-02** | Profile & capacity | `update_vendor_profile`, `upsert_vendor_capacity_profile`, `set_declared_financial_tier` | **Declared** tier ≠ **verified** tier (M5 verifies); capability = **4-flag matrix** (Invariant #1) |
| **J-VND-03** | Microsite | `publish_* / unpublish_*` (draft/published) | **No draft leaks publicly**; same M2 content read-only on Public (7D) |
| **J-VND-04** | Catalog & products | `create_product`, `update_product`, `set_product_status`, spec library/docs | **Versioned**, never overwritten (Invariant #8) |
| **J-VND-05** | Categories | `assign_category` (`list_categories`) | Categories **Admin-governed** (M8) — vendor assigns, never defines |
| **J-VND-06** | Advertising | `create_advertisement`, `submit_advertisement` | **Admin reviews** (`review_advertisement`) before publish |
| **J-VND-07** | Verification / trust | reads: `get_trust_score`, `get_performance_score`, `get_verified_tier` | **Read-only** — vendor never mutates; *Admin decides, Trust owns* |

**Governance rails:** trust/performance/tier are **displayed, never computed** by the vendor (firewall
§4). A **Hybrid** org also runs J-PROC.
**Success:** ✔ profile **published** (discoverable on Public); ✔ catalog + categories set;
✔ trust/verification signals visible (read-only).

---

## 6. Supplier Journey — `J-SUP` (operational selling loop)

**Intent arc:** Invitation → Opportunity → Competition → Award → Payment.
**Goal:** win and fulfill business. Bound to the **quotation** + **post-award** state machines
(`ux_patterns.md` §8.3/§8.5, Doc-4M).

```
Receive invitation → Respond → Quote (versioned) → Win / Lose → Fulfil (deliver → invoice → payment → WCC)
```

| ID | Step | Actions (pattern · contract) | State (Doc-4M) | Governance |
|---|---|---|---|---|
| **J-SUP-01** | Invitation | Inbox (`get_invitation`, `list_invitations`) | invitation `delivered` | **Received-only**; lead auto-created by System |
| **J-SUP-02** | Respond | `respond_to_invitation` (accept/decline) | — | Decline = **no penalty** |
| **J-SUP-03** | Quote | `submit_quotation` → `revise_quotation` (new version) | `draft → submitted → submitted (vN)` | **Versioned** (Invariant #8); visibility-gated |
| **J-SUP-04** | Withdraw / extend | `withdraw_quotation`, `request_late_extension` | `→ withdrawn` | Withdraw = **zero performance penalty** (Doc-3 §5.4) |
| **J-SUP-05** | Outcome | (buyer awards/closes) | `→ selected` / `→ not_selected` / `→ expired` | **Byte-equivalence** — never sees competitor data, exclusion reason, or RFQs-not-invited-to (Invariant #11 / CHK-7-040) |
| **J-SUP-06** | Lead pipeline | `update_lead_stage`, `add_lead_activity` | — | Received-only |
| **J-SUP-07** | Fulfil | `upload_delivery_challan`, `record_delivery`, `issue_trade_invoice`, finance reads | engagement `in_delivery → completed`; trade invoice `issued → paid` | **Records only, no funds movement** (DF-6); WCC = proof-of-work (Trust input) |

**Governance rails (load-bearing):** the **byte-equivalence** firewall is absolute — a
blacklisted/excluded vendor's entire experience is identical to a non-matched vendor's. Win-rate
denominator = *received invitations*, never all-matchable RFQs.
**Success:** ✔ quotation `selected`; ✔ engagement fulfilled (`completed`/`closed`); ✔ WCC issued +
payment `confirmed` (records only, no funds moved).

---

## 7. Admin Journey — `J-ADM` (governance)

**Intent arc:** Signal → Review → Decision → Enforcement → Record.
**Goal:** keep the marketplace trustworthy. Admin **acts ON targets by ID, never AS an org**.

```
Triage queue → Moderate / verify → Approve (vendor / category / ad) → Enforce (ban) → Operate (import / outreach / rules)
```

| ID | Step | Actions (pattern · contract) | Governance |
|---|---|---|---|
| **J-ADM-01** | Moderation | `create/assign/decide_moderation_case` (BC-ADM-1); `moderate_rfq` | Demand/supply quality gate |
| **J-ADM-02** | Verification | `queue/assign/decide_verification_task` (BC-ADM-5 → M5) | **M8 queues; M5 owns the score** (firewall) |
| **J-ADM-03** | Approvals | `set_vendor_profile_status`, `create/update_category`, `set_category_status`, `review_advertisement` | Category taxonomy Admin-governed |
| **J-ADM-04** | Enforcement | `issue_ban`, `lift_ban` (emits `VendorBanned`) | Owning module executes the effect |
| **J-ADM-05** | Operations | `submit_import_job` (async), outreach, `manage_routing_rule` / `assist_routing` (Stage-gated) | Import processing System out-of-wire |
| **J-ADM-06** | Plans / identity ops | `activate_plan`, `suspend/reinstate_organization|user` | Catalog/identity admin |
| **J-ADM-07** | Staff triage | suggestion / link triage (BC-ADM-3) | **Non-disclosure** (staff-internal) |

**Governance rails (R5):** the console **invokes** wired Admin commands; the **owning module owns** the
data/decision/effect. Admin **never** writes Trust/Performance/Tier scores (firewall), **never** makes
matching/award decisions, and **never** bypasses a module's domain.
**Success:** ✔ case / verification **decided**; ✔ effect executed by the owning module; ✔ immutable
audit recorded.

---

## 8. Cross-journey Rails (governance that spans every journey)

1. **Users act; Organizations own** — every user ≥1 org; active-org **server-validated, never
   client-trusted** (Invariant #5; Doc-7C §4).
2. **Non-disclosure / byte-equivalence** — no journey step reveals an excluded/blacklisted/buyer-private
   signal; excluded ≡ non-matched everywhere (Invariant #11; CHK-7-040/041).
3. **Governance signals firewalled** — trust/performance/tier displayed, never computed in-journey; no
   plan gates matching/award (Doc-3 §11.8; §4 Governance Signals).
4. **AI suggests; modules decide** — no journey uses AI to recommend-to-winner, auto-select, or execute
   (Invariant #12; R6) (`ux_patterns.md` §5.5).
5. **Content ≠ Presentation** — discovery search/sort is presentation, **never re-ranks M3** (Doc-7A §6).
6. **Money boundary** — the platform **records** post-award documents, **never settles** buyer↔vendor
   money (R8 / DF-6).
7. **State-machine fidelity** — journeys offer only Doc-4M-permitted transitions; invent no state/edge.
8. **Currency per field** — `{amount, currency}`, BDT default, never hardcoded (Doc-2 §0.4).

---

## 9. Journey → Surface · Pattern · Contract matrix

| Journey | Surface(s) | Key patterns (UX) | Anchor contracts |
|---|---|---|---|
| **J-GST** Guest | 7D → 7E | §3.2, §7, §2.1–2.3, §7.5 | `search_catalog`, `list_vendor_directory`, `get_public_vendor_profile` |
| **J-BUY** Buyer | 7E (+7F) | §5.1 (wizard/forms) | `create_organization`, `invite_member`, `upsert_buyer_profile` |
| **J-PROC** Procurement | 7F | §5.1, §2.7, §8.1/8.2/8.4/8.5 | `create_rfq`…`award_rfq`, `get_comparison_statement`, `issue_po` |
| **J-VND** Vendor | 7E (+7G) | §5.1, §6.1 | `claim_vendor_profile`, `publish_*`, `create_product`, `assign_category` |
| **J-SUP** Supplier | 7G | §8.3/8.5, §2.6 | `respond_to_invitation`, `submit_quotation`, `issue_trade_invoice` |
| **J-ADM** Admin | 7H | §2.6, §5.2, §8.5 | `decide_moderation_case`, `decide_verification_task`, `submit_import_job` |

---

## 10. Handoff to Next Waves

| Wave | Builds on these journeys |
|---|---|
| **0F — Page Inventory** | Each journey **step** (`J-*-NN`) expands into the concrete pages that realize it (~120–180) |
| **0G — Templates** | Steps map to page templates (`design_philosophy.md` §6) |
| **0H — Screen Design** | Screens realize each step — consistent because the path + intent are fixed here |

---

## 11. Governance Alignment & Precedence

Constraints honored **by pointer** (reference-never-restate):

| Constraint | Source | Where honored |
|---|---|---|
| Users act / Organizations own; active-org server-resolved | Invariant #5 / Doc-7C §4 | §3, §8 |
| Non-disclosure / byte-equivalence | Invariant #11 / CHK-7-040/041 | §2, §4, §6, §8 |
| Governance signals firewalled; no plan gates | §4 Governance Signals / Doc-3 §11.8 | §4, §5, §8 |
| RFQ / quotation / post-award state machines | Doc-4M / Doc-4E / Doc-4F | §4, §6 |
| Award explicit, unranked, 1:1; reissue not multi-award | Doc-2 §5.4 / Doc-3 §9.1 / R6 | §4 |
| Comparison read-only, System-generated, non-recommending | Doc-7F §6 / R6 | §4 |
| AI suggests; modules decide | Invariant #12 / GR #6 | §4, §8, §12 |
| Content ≠ Presentation; never re-rank M3 | Doc-7A §6 / GR #4 | §2, §4, §8 |
| Money boundary (records only) | R8 / DF-6 | §4, §6 |
| Engine owns invitations; deferral invisible; no public RFQ board | Doc-3 §3–§5 | §4, §6 |
| Versioned/immutable docs & catalog | Invariant #8 | §5, §6 |
| Declared tier ≠ verified; Admin decides, Trust owns | §4 / Invariant | §5, §7 |
| Admin-decides / owning-module-owns; no active-org | R5 / Doc-7C §4 | §7 |
| Currency per field, BDT default | Doc-2 §0.4 | §4, §6, §8 |

### `[ESC-7-*]` register

Inherits the registers from [`ux_patterns.md`](ux_patterns.md) §12 and
[`information_architecture.md`](../information-architecture/information_architecture.md) §10 — `[ESC-7-API-CATNAV]`,
`[ESC-7-API-PRODDETAIL]`, `[ESC-7-API-ADS]`, `[ESC-7-API]` (upload/export/related), `[ESC-7-AI]`. No new
gaps coined here.

---

## 12. Appendix — Future Journey Extensions (reserved)

> **Reserved placeholders, not current scope.** Each item below is a *future* journey extension; **none
> is designed or coined here.** Each requires its **own additive architecture / contract decision**,
> escalated via the named channel (CLAUDE.md §11) — and remains subject to the cross-journey rails (§8).
> Listed only to keep future additions organized.

| Ref | Future extension | Governance note (when activated) |
|---|---|---|
| **FX-AI** | AI Procurement Assistant | M9 / `Doc-5K`; **AI suggests, modules decide** (Invariant #12); non-recommending (R6); future-activation; `[ESC-7-AI]` |
| **FX-ERP** | ERP integration (buyer/vendor systems) | External integration; needs additive contracts + architecture approval; escalate — never coined in a companion doc |
| **FX-EMAIL** | Email-only supplier participation | Comms-mediated (M6); would need new contracts/flows; respects byte-equivalence + visibility |
| **FX-API** | Procurement API (external/partner) | A Doc-4A/Doc-5 surface extension; architecture decision; escalate |
| **FX-MOBILE** | Mobile-first / native buyer app | Beyond the responsive web shell (IA §7); native shell is a future program |
| **FX-EXTAPPR** | External approval workflow | Extends internal approval (§4 J-PROC-04); third-party integration; escalate |

---

*This document is non-authoritative. It describes actor journeys across the marketplace. It operates
under the frozen corpus authority order (CLAUDE.md §7) and the Doc-7 precedence chain (§0); it
introduces no architecture change and coins no state, transition, contract, or permission. On any
conflict, the frozen document wins and this file is patched to match.*
