# Doc-4I_PassA_Independent_Hard_Review_v1.0 — Architecture Board Independent Hard Review (Module 7 — Billing / Monetization — Content Pass-A)

| Field | Value |
|---|---|
| Document | Doc-4I_PassA_Independent_Hard_Review_v1.0 — Independent Architecture Board Hard Review |
| Document Under Review | `Doc-4I_PassA_Content_v1.0` |
| Review Objective | Determine whether the Pass-A contract inventory for Module 7 — Billing / Monetization is ready to proceed toward Pass-A Freeze without modification. Defect Discovery Review. |
| Nature | Hard review. Not a patch review, not a consolidation review, not a freeze audit, not Pass-B. |
| Structure authority | `Doc-4I_Structure_Proposal_v0.1` as amended by `Doc-4I_Structure_Patch_v1.0`, verified by `Doc-4I_Structure_Patch_Verification_v1.0`, APPROVED FOR FREEZE by `Doc-4I_Structure_Freeze_Audit_v1.0` |
| Authority (precedence) | Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A (FROZEN) · Doc-4B (FROZEN) · Doc-4C (FROZEN) · Doc-4D (FROZEN) · Doc-4E (FROZEN) · Doc-4F (FROZEN) · Doc-4G (FROZEN) · Doc-4H (FROZEN) · Doc-4I_Structure_v1.0 (FROZEN) · Doc-4I_PassA_Content_v1.0 (under review). On conflict: **FLAG-AND-HALT** (no conflict requiring halt encountered). |
| Review constraints | Review only. No redesign. No new BCs. No new aggregates. No frozen ownership modified. No procurement moat modified. No trust firewall modified. |
| Severity vocabulary | BLOCKER · MAJOR · MINOR · NITPICK |

---

## Architecture Board — Independent Hard Review

### Executive Verdict — **PASS WITH PATCH**

`Doc-4I_PassA_Content_v1.0` is substantively correct and structurally faithful to the frozen structure. Ownership is clean across all six BCs and seven aggregates. Authorization is correct — no slug invented, all unknown permissions escalated via `[ESC-BILL-SLUG]`. Events are correct — three produced (BC-BILL-2, single-authorship), three consumption seams correctly anchored (one named §8, two `[ESC-BILL-EVENT]`). Lifecycle, dependencies, procurement moat, and Trust firewall are all preserved without exception. The Pass-B planning matrix is sensibly sequenced. Two MINOR findings require a targeted patch before Pass-A freeze: one affecting the audit binding of `billing.expire_subscription.v1` (misidentified §9 anchor); one affecting the dual-template / dual-actor presentation in six contract entries (Pass-B authoring ambiguity). No BLOCKER. No MAJOR.

---

## Domain Assessments

### 1 — Ownership Correctness — PASS

All sections verified against the frozen structure (Doc-4I_Structure_v1.0, as patched):

- A1 Module Overview: `billing` schema / Module 7 / 7 aggregates enumerated. Matches frozen §I1/§I17. ✓
- A2 BC Overview: 6 BCs × 7 aggregates (BC-BILL-1 holds two, consistently with the patched F4I-N1 parenthetical). Contract section pointers (A4.1–A4.6) accurate. ✓
- A3 Aggregate Catalog: All 7 aggregates, each to exactly one BC, root tables named, lifecycle summaries cited by pointer to Doc-2 §3.8/§5.7/§10.8 without extension. `operations.trade_invoices` explicitly excluded. Value objects (EntitlementType, BillingCycle, QuotaKey, GatewayRef) correctly annotated as VOs, not separate aggregates. ✓
- A4.1–A4.6 contract records: every contract-ID attributed to the correct owning BC and the correct aggregate. No ownership drift. No cross-BC aggregate ownership claimed. `billing.resolve_entitlements.v1` (BC-BILL-2) and `billing.enforce_quota.v1` (BC-BILL-3) correctly note intra-module **reads** of the other's context — these are reads, not ownership claims. ✓
- A12 Pass-B matrix: one BC per Part, correctly mapped. ✓

**No ownership finding.**

---

### 2 — Authorization Correctness — PASS WITH MINOR FINDING

The three-layer authorization check (Membership + Permission Slug + Resource Scope, or Delegation Grant) is correctly described in §B.4 and consumed by every contract record.

**Slug mapping verified:**

| Slug | Space | Actor | Coverage in A4 |
|---|---|---|---|
| `can_view_billing` | tenant (Owner + Delegate) | User | all BC-BILL-2/3/4/5/6 reads ✓ |
| `can_manage_billing` | tenant (Owner) | User | subscription purchase/cancel, lead-credit purchase, invoice issue/void, referral create ✓ |
| System (no slug) | platform | System | metering, period-end, gateway callback, milestone credits ✓ |
| catalog (`[ESC-BILL-SLUG]`) | platform-staff | Admin | all BC-BILL-1 mutations ✓ |

All required `can_view_billing` / `can_manage_billing` appearances confirmed correct. No slug invented. `[ESC-BILL-SLUG]` correctly applied to BC-BILL-1 catalog mutations, `billing.get_plan.v1` / `list_plans.v1` (where a distinct public-read slug may be required), and `billing.credit_reward.v1` redemption path. ✓

**Template assignments verified:** 21.3 Query (all reads), 21.4 Command (org-actor mutations), 21.5 System (metering/period-end/gateway), 21.6 Admin (BC-BILL-1 catalog). Template 21.2 Integration correctly excluded from Billing's consumer effects (§B.1 — single-authorship; Billing authors its own three §8 event productions directly). ✓

**Dual-template ambiguity (→ F4I-PA-M1 — MINOR):** Six contract-ID entries in A4 carry dual template/actor designations ("21.4 Command / 21.5 System · Actor: User / System"):

| Contract-ID | Dual-template as written |
|---|---|
| `billing.credit_lead_account.v1` | 21.4 Command / 21.5 System |
| `billing.debit_lead_account.v1` | 21.4 Command / 21.5 System |
| `billing.issue_platform_invoice.v1` | 21.4 Command / 21.5 System |
| `billing.update_invoice_status.v1` | 21.4 Command / 21.5 System |
| `billing.credit_reward.v1` | 21.4 Command / 21.5 System |
| `billing.track_referral.v1` | 21.4 Command / 21.5 System |

Doc-4A §21 assigns one template per contract-ID. A Pass-B author reading a dual-template entry cannot determine whether: (a) the entry represents a single contract-ID that supports actor-branching within one contract (one 12-section Pass-B record), or (b) it should split into two contract-IDs at Pass-B authoring time (two 12-section records). This ambiguity propagates into the Pass-B planning matrix counts and the scope of every affected Part. The authorization values themselves are not wrong; the presentational ambiguity reduces Pass-B determinism. **→ F4I-PA-M1 (MINOR).**

---

### 3 — Aggregate Correctness — PASS

All 7 aggregates correctly bounded. Root tables named. No aggregate added beyond the Doc-2 §2 Module-7 set. No aggregate placed in two contexts. Lifecycle summaries cite Doc-2 §3.8/§5.7/§10.8 without extension. Value objects correctly annotated as VOs (not separate aggregates or tables). ✓

---

### 4 — Event Correctness — PASS

**Produced events (A5 + A4 contract records):**

| Event | Producer BC | Trigger contract | A4 record | A5 match |
|---|---|---|---|---|
| `SubscriptionPurchased` | BC-BILL-2 | `purchase_subscription.v1` | emits ✓ | ✓ |
| `SubscriptionRenewed` | BC-BILL-2 | `renew_subscription.v1` | emits ✓ | ✓ |
| `SubscriptionExpired` | BC-BILL-2 | `expire_subscription.v1` | emits ✓ | ✓ |

Single-authorship preserved (Doc-4A §4.4 — Billing authors its own §8 event production). Communication consumes for fan-out (DF-BILL-6, consumer-side). No event coined beyond the three. ✓

**Consumed signals (A5 + A4 contract records):**

| Signal | Producer | Anchor | Consuming contracts | Consistent |
|---|---|---|---|---|
| `QuotationSubmitted` | RFQ (Doc-4E) | Named Doc-2 §8 event | `record_usage.v1` ✓ | A4/A5 match ✓ |
| lead-access | Operations (Doc-4F) | `[ESC-BILL-EVENT]` | `record_usage.v1`, `credit_lead_account.v1` / `debit_lead_account.v1` ✓ | A4/A5 match ✓ |
| advertising/microsite | Marketplace (Doc-4D) | `[ESC-BILL-EVENT]` | `record_usage.v1`, `issue_platform_invoice.v1` ✓ | A4/A5 match ✓ |

`cancel_subscription.v1` correctly emits no event (period-end expiry event fires separately at BC-BILL-2's System contract — correct per Doc-2 §5.7). ✓

No event invented. No cross-module event authored on behalf of another module. ✓

---

### 5 — Dependency Correctness — PASS

A6 Dependency Inventory (DF-BILL-1…8) verified against the frozen patched structure:

| Marker | A6 direction | A6 moat/firewall clause | A4 contract coverage | Assessment |
|---|---|---|---|---|
| DF-BILL-1 Identity | consume + read-model | Controlling-Org resolution ✓ | all BC-BILL-2/3/4/5/6 ✓ | ✓ |
| DF-BILL-2 Marketplace | consume | `[ESC-BILL-EVENT]` for ad_launch ✓ | BC-BILL-3 (record_usage), BC-BILL-5 (issue_invoice) ✓ | ✓ |
| DF-BILL-3 RFQ | consume (named §8 event) | moat clause: "quota gate never alters routing/eligibility" ✓ | BC-BILL-3 (record_usage) ✓ | ✓ |
| DF-BILL-4 Operations | consume | `[ESC-BILL-EVENT]` for lead_access; trade_invoice exclusion ✓ | BC-BILL-3 (record_usage), BC-BILL-4 (credit/debit) ✓ | ✓ |
| DF-BILL-5 Trust | none (negative-asserted) | firewall ✓ | A11 ✓ | ✓ |
| DF-BILL-6 Communication | emit | Billing authors its own §8 events; Communication consumes fan-out ✓ | BC-BILL-2 (purchase/renew/expire) ✓ | ✓ |
| DF-BILL-7 Admin | carried pending Doc-4J | FLAG-AND-HALT if absent at content time ✓ | BC-BILL-1 (catalog) ✓ | ✓ |
| DF-BILL-8 Platform Core | consume | audit, outbox, UUIDv7, human-ref, POLICY, gateway infra ✓ | all BCs ✓ | ✓ |

No ownership transfer. No dependency inversion. No circular dependency. ✓

---

### 6 — Lifecycle Correctness — PASS WITH MINOR FINDING

**A3 lifecycle summaries vs. Doc-2 §3.8/§5.7/§10.8:** All correct. See Domain 3.

**Contract-level lifecycle records verified:**

| Contract | Lifecycle record | Assessment |
|---|---|---|
| `purchase_subscription.v1` | `pending_payment → active` ✓ | ✓ |
| `cancel_subscription.v1` | `active` (auto_renew=false; no immediate state change) ✓ | ✓ |
| `renew_subscription.v1` | `active → active` (renewal) ✓ | ✓ |
| `expire_subscription.v1` | `active → expired` ✓ | ✓ |
| `issue_platform_invoice.v1` | `issued` ✓ | ✓ |
| `update_invoice_status.v1` | `issued → paid/overdue/void` ✓ | ✓ |
| `record_payment.v1` | `initiated → succeeded/failed/refunded` ✓ | ✓ |
| `advance_referral.v1` | `pending → qualified → rewarded` ✓ | ✓ |
| all reads | none (read) ✓ | ✓ |

**Audit binding for `billing.expire_subscription.v1` (→ F4I-PA-M2 — MINOR):**

A4.2 states the audit binding for `billing.expire_subscription.v1` as: **§9 Financial ("subscription renewal") by pointer.** The A8 Audit Dependency Inventory groups `renew_subscription` / `expire_subscription` together as "subscription purchase/cancel/renew/expire (BC-BILL-2) → §9 Financial/Organization (by pointer)."

B.5 recites the Doc-2 §9 Financial domain enumeration as: "platform invoice created, payment status change, refund, subscription purchase/renewal/cancel." **Subscription expiry is not enumerated in this list.** Mapping `billing.expire_subscription.v1` to the §9 "subscription renewal" action is a misidentification — renewal and expiry are distinct outcomes (renewal = `active → active`; expiry = `active → expired`). Where Doc-2 §9 does not enumerate a specific action, the correct binding is `[ESC-BILL-AUDIT]` (nearest §9 action by pointer; Doc-2 §9 additive — no audit action invented). The current audit record for `expire_subscription.v1` must be corrected to `[ESC-BILL-AUDIT]` (§9 does not enumerate "subscription expiry"; carried for Doc-2 §9 additive). The same correction applies to the A8 inventory row, which implicitly groups expiry under the §9 Financial domain without basis. **→ F4I-PA-M2 (MINOR).**

---

### 7 — Procurement Moat Protection — PASS

A10 Moat Validation confirmed at module level. B.7 carries the moat constraint on every contract by pointer. Contract-level verification:

- `billing.enforce_quota.v1`: "an entitlement check, never a routing/eligibility decision — moat" ✓
- `billing.resolve_entitlements.v1`: "never surfaced to RFQ matching/routing or to Trust" ✓
- `billing.record_usage.v1`: metering only, no procurement decision; `QuotationSubmitted` is a metering input, not a routing trigger ✓
- DF-BILL-3 moat clause: "quota gate never alters routing/eligibility" ✓
- A10 explicit: paid plans influence Visibility/Lead volume/Analytics/Advertising/Microsite only ✓

No contract makes any procurement decision. No quota or entitlement value reaches a routing/matching/eligibility surface. **Moat preserved on every surface.**

---

### 8 — Trust Firewall Protection — PASS

A11 Trust Firewall Validation confirmed at module level. DF-BILL-5 negative-asserted with no coupling. B.7 carries the firewall constraint. Contract-level verification:

- No contract in A4.1–A4.6 reads, writes, derives, or references any `trust.*` score ✓
- Subscription/entitlement state is not a trust/verification/eligibility input ✓
- No plan or entitlement value reaches the Trust surface ✓
- `billing.resolve_entitlements.v1` result consumed within Billing only (intra-module; not surfaced to Trust) ✓

**Firewall preserved on every surface.**

---

### 9 — AI-Agent Determinism — PASS WITH MINOR FINDING

§B.8 AI-Agent source rule applied per contract: every record states owning BC / aggregate / actor / permission-family / lifecycle / audit / event source. Escalation markers correctly flag residual unknowns rather than inventing values.

Determinism confirmed for:
- Ownership: every contract-ID attributed to one BC / one aggregate ✓
- Authorization: every contract-ID has a stated permission-family or System designation ✓
- Events: every produced/consumed event is named or escalated ✓
- Audit: every mutation has an audit binding (named §9 or `[ESC-BILL-AUDIT]`) — except the misidentification in `expire_subscription.v1` (F4I-PA-M2) ✓ on fix
- POLICY: all POLICY needs named (`leads.credit_value`) or escalated (`[ESC-BILL-POLICY]`) ✓

**Reduced determinism from dual-template entries (F4I-PA-M1):** A Pass-B author opening the document to implement BC-BILL-4 Part 4 will see `billing.credit_lead_account.v1` declared as "21.4 Command / 21.5 System · Actor: User / System." Without explicit guidance (one contract with actor-branching, or two contract-IDs), the author must guess. This is a structural determinism gap for the intended audience (Claude Code / Cursor / backend engineers). The F4I-PA-M1 MINOR patch is required before Pass-A freeze.

---

### 10 — Pass-B Readiness — PASS WITH MINOR FINDING

A12 Pass-B Planning Matrix assessed:

| Part | BC | Contracts listed | Sequencing rationale | Assessment |
|---|---|---|---|---|
| Part 1 | BC-BILL-1 Plans & Entitlements | 8 contracts | Catalog root — entitlement definitions before subscription/quota | ✓ |
| Part 2 | BC-BILL-2 Subscriptions | 5 contracts | Entitlement-resolution authority + §8 event producers — must precede Part 3 | ✓ |
| Part 3 | BC-BILL-3 Usage & Quota | 3 contracts | Reads entitlement seam from Part 2; F4I-MA1 resolved at Pass-A | ✓ |
| Part 4 | BC-BILL-4 Lead Credits | 3 contracts | Append-only ledger; `source_invoice_id` ref to Part 5 noted (no hard dependency — UUID ref) | ✓ |
| Part 5 | BC-BILL-5 Platform Invoicing & Payments | 5 contracts | §9 Financial audit; dunning `[ESC-BILL-POLICY]` | ✓ |
| Part 6 | BC-BILL-6 Rewards & Referrals | 5 contracts | Lowest cross-dependency | ✓ |
| Consolidation | all 6 Parts | — | Module consolidation → Final Freeze Audit ✓ | ✓ |

Sequencing is correct — the dependency chain (catalog → entitlement authority → quota enforcement → credits/invoicing → rewards) is honored. Module consolidation + Final Freeze Audit pathway is correctly noted.

**Pass-B readiness concern from F4I-PA-M1:** Contract counts in A12 may under-count if dual-template entries resolve to two contract-IDs at Pass-B time. For example, if `billing.credit_lead_account.v1` (credit: org-initiated = 21.4; credit: System shortfall = 21.5) resolves to two IDs, Part 4 grows from 3 contracts to 4. The planning matrix counts are correct only if all dual-template entries resolve to one contract with actor-branching. The patch must clarify this **per entry** before freeze so the matrix reflects the actual Pass-B scope.

---

## Findings

### Governance Defects

*(None.)*

### Implementation Risks

---

**F4I-PA-M1 — MINOR**

**Location:** A4.2 (`issue_platform_invoice.v1`, `update_invoice_status.v1`), A4.4 (`credit_lead_account.v1`, `debit_lead_account.v1`), A4.6 (`credit_reward.v1`, `track_referral.v1`)

**Explanation:** Six contract-ID entries carry dual template/actor designations ("21.4 Command / 21.5 System · Actor: User / System"). Doc-4A §21 assigns one template per contract-ID. The Pass-A entries do not state whether each dual-template entry represents: (a) a single contract-ID with actor-branching within one 12-section Pass-B record, or (b) a presentational shorthand for two distinct contract-IDs that must be split at Pass-B authoring time. Both resolutions are architecturally valid; the ambiguity is in the documentation, not the design.

**Impact:** Pass-B authors for Parts 2, 4, 5, and 6 cannot determine the correct number of 12-section records to produce, nor the correct Pass-B planning matrix scope. If entries are split, Part 4 gains at least 2 contracts (credit vs. debit each become 2), Part 5 gains 2 (issue vs. update each become 2), and Part 6 gains 2. This ambiguity propagates into the module consolidation contract count.

**Required Patch:** For each of the six affected entries, add one of the following clarifications:
- **(Single contract, actor-branching):** State "one contract-ID; actor-branched (§21 Doc-4A — single 12-section Pass-B record with actor-specific authorization branches)."
- **(Two contract-IDs, split at Pass-B):** Add the second contract-ID and record it as a separate entry in A4 (e.g., `billing.credit_lead_account.v1` for org-initiated / `billing.system_credit_lead_account.v1` for System shortfall), with A12 counts updated accordingly.

No redesign required. The authorization values are correct; only the contract-ID / template presentation requires disambiguation.

---

**F4I-PA-M2 — MINOR**

**Location:** A4.2 (`billing.expire_subscription.v1` — Audit field), A8 (Subscription row in audit inventory)

**Explanation:** `billing.expire_subscription.v1` carries the audit binding: "§9 Financial ('subscription renewal') by pointer." Doc-2 §9's enumerated Financial-domain actions (per B.5) are: "platform invoice created, payment status change, refund, subscription purchase/renewal/cancel." Subscription **expiry** is not enumerated. Expiry (`active → expired`) and renewal (`active → active`) are distinct transitions — mapping expiry to the "subscription renewal" §9 action is a misidentification. The A8 Audit Inventory groups "subscription purchase/cancel/renew/expire (BC-BILL-2)" as binding §9 Financial, which propagates the same error.

**Impact:** At Pass-B, the BC-BILL-2 Part-2 author writing the `expire_subscription.v1` 12-section record will inherit an incorrect §9 audit-action binding, potentially invoking the wrong §9 Financial action in-transaction or filing an audit record under the wrong domain key.

**Required Patch:**
1. A4.2 `billing.expire_subscription.v1` → change Audit field from "§9 Financial ('subscription renewal') by pointer" to: **"`[ESC-BILL-AUDIT]` (subscription expiry is not separately enumerated in Doc-2 §9 Financial domain — 'subscription purchase/renewal/cancel' enumerated; expiry is not — nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented)"**.
2. A8 subscription row → split the `renew_subscription` and `expire_subscription` entries: `renew_subscription.v1` → §9 Financial ("subscription renewal") by pointer; `expire_subscription.v1` → `[ESC-BILL-AUDIT]` (as above).

---

## Final Assessment

```
Open BLOCKER  = 0
Open MAJOR    = 0
Open MINOR    = 2  (F4I-PA-M1, F4I-PA-M2)
Open NITPICK  = 0
```

---

## Approval Question

**Can `Doc-4I_PassA_Content_v1.0` proceed directly to Pass-A Freeze?**

**NO — PASS WITH PATCH REQUIRED**

**Justification.** The document is substantively sound: all ownership, authorization, aggregate, event, dependency, lifecycle, moat, and firewall assessments pass. Two MINOR findings require a targeted patch before freeze. F4I-PA-M1 (dual-template ambiguity) will propagate unresolved into every affected Pass-B part and the module consolidation count if not clarified now. F4I-PA-M2 (expire_subscription audit misidentification) will produce an incorrect §9 audit binding in the BC-BILL-2 Pass-B record if not corrected. Both patches are narrow — no new contract-IDs need be invented, no redesign required — and are resolvable with inline clarifications in A4.2, A4.4, A4.6, and A8.

**Confirmed structurally sound (no revisitation required at patch time):**
- Module identity (`billing` schema, Module 7, `billing_` namespace)
- All 6 BC boundaries and responsibilities
- All 7 aggregate ownerships
- All three produced events and their single-authorship
- All consumed signal anchors (QuotationSubmitted named; lead-access and ad-launch `[ESC-BILL-EVENT]`)
- All eight DF-BILL dependency entries
- Permission inventory (`can_view_billing` / `can_manage_billing` / System / `[ESC-BILL-SLUG]`)
- Audit inventory (all §9 Financial/Organization bindings except `expire_subscription.v1`)
- POLICY inventory (`leads.credit_value` + `[ESC-BILL-POLICY]`)
- Procurement moat (A10) and Trust firewall (A11)
- Pass-B planning matrix structure and sequencing

**Recommended next artifact after patch:** `Doc-4I_PassA_Patch_v1.0` → `Doc-4I_PassA_Patch_Verification_v1.0` → `Doc-4I_PassA_Freeze_Audit_v1.0` → Pass-A FROZEN → Pass-B (Part 1 BC-BILL-1 first).

---

*End of Doc-4I_PassA_Independent_Hard_Review_v1.0. Independent hard review only — no redesign, no new BCs, no new aggregates, no reopening of frozen structure or frozen modules. Open BLOCKER = 0 · Open MAJOR = 0 · Open MINOR = 2 (F4I-PA-M1, F4I-PA-M2) · Open NITPICK = 0. Proceed to Pass-A Freeze directly: NO — patch required (A4.2, A4.4, A4.6, A8 only). Corpus at this verdict: Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A through Doc-4H (all FROZEN) · Doc-4I_Structure_v1.0 (FROZEN) · Doc-4I_PassA_Content_v1.0 (under review).*
