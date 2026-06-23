# Doc-4I_FROZEN_v1.0 — Billing / Monetization — API & Integration Contracts — Module (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** |
| Version | v1.0 |
| Module | Doc-4I |
| Module Name | Billing / Monetization |
| Schema | `billing` |
| Namespace | `billing_` |
| Governance base | `Doc-4I_PassA_v1.0_FROZEN` (FROZEN) |
| Implementation base | `Doc-4I_PassB_Part1_v1.0_FROZEN` (BC-BILL-1/2/3) + `Doc-4I_PassB_Part2_v1.0_FROZEN` (BC-BILL-4/5/6) — both FROZEN, folded inline |
| Structure authority | `Doc-4I_Structure_v1.0` (FROZEN) |
| Consolidation | `Doc-4I_Module_Consolidation_Review_v1.0` (PASS · BLOCKER=0 · MAJOR=0 · MINOR=0 · NITPICK=1 — F4I-CONS-N1, non-blocking, folded into the colophon below) |
| Freeze authority | `Doc-4I_Final_Freeze_Audit_v1.0` (FINAL FREEZE APPROVED) |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4H v1.0, Doc-4I_Structure_v1.0, Doc-4I_PassA_v1.0_FROZEN — all FROZEN |
| Scope | All six bounded contexts: BC-BILL-1 Plans & Entitlements · BC-BILL-2 Subscriptions · BC-BILL-3 Usage & Quota · BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals |
| Totals | **32 contract-IDs · 7 aggregates · 6 bounded contexts** (Part 1: 18 — BC-BILL-1: 8, BC-BILL-2: 7, BC-BILL-3: 3; Part 2: 14 — BC-BILL-4: 4, BC-BILL-5: 5, BC-BILL-6: 5) |
| Authoritative module specification | Module 7 — Billing / Monetization — implementation-grade, frozen |
| Conflict rule | FLAG-AND-HALT (no local resolution). |

> **Mechanical-merge note.** This module FROZEN document inlines the two frozen Pass-B Part bodies — `Doc-4I_PassB_Part1_v1.0_FROZEN` (BC-BILL-1/2/3) and `Doc-4I_PassB_Part2_v1.0_FROZEN` (BC-BILL-4/5/6) — each byte-faithful (Pass-B content with its Part patch already folded inline). No contract, aggregate, state, transition, slug, event, audit action, POLICY key, or template was created or changed at module consolidation. The one Consolidation NITPICK (F4I-CONS-N1) is an orientation enhancement, recorded as the module signal-consumption map in the colophon; it changes no contract. Per-Part review/finding/draft commentary is not carried.

---

## Module Invariants (Module 7 — held across all six BCs)

- **Disjoint ownership (One Entity = One Owner).** BC-BILL-1 Plan + Entitlement · BC-BILL-2 Subscription (sole subscription + entitlement-resolution authority) · BC-BILL-3 Usage Ledger · BC-BILL-4 Lead Credit Account · BC-BILL-5 Platform Invoice · BC-BILL-6 Reward Account. No shared, duplicate, or leaked ownership.
- **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED).** BC-BILL-5 owns only platform-fee invoices and payment-gateway records — no trade invoice, escrow, wallet, fund custody, or settlement.
- **Events (Doc-2 §8).** The module emits exactly three §8 events, all **BC-BILL-2's**: `SubscriptionPurchased` · `SubscriptionRenewed` · `SubscriptionExpired` (single-authorship, Doc-4A §4.4). `QuotationSubmitted` is RFQ-owned / Billing-consumed. BC-BILL-1/3/4/5/6 emit no §8 event; lead-access (DF-BILL-4) and advertising/microsite (DF-BILL-2) metering signals are consumed via `[ESC-BILL-EVENT]` (no §8 emission event).
- **Procurement moat (held).** No plan, subscription, usage, lead-credit, invoice, reward, or referral action influences matching / routing / ranking / supplier-selection / award / procurement-eligibility. Credits and rewards are commercial/promotional balances, never procurement standing.
- **Trust firewall (held).** No BC computes, owns, or modifies any Trust / Performance / Verification / Governance score. Billing meters and charges; it never decides procurement and never gates trust/verification/eligibility/routing/matching.
- **Carried markers (additive; resolved only in the owning document):** `[ESC-BILL-AUDIT]` (Doc-2 §9 additive) · `[ESC-BILL-SLUG]` (Doc-2 §7 additive) · `[ESC-BILL-POLICY]` (Doc-3 §12.2 additive) · `[ESC-BILL-EVENT]` (Doc-2 §8 additive). Frozen slugs: `can_view_billing`, `can_manage_billing` (Doc-2 §7).

---

# Doc-4I — Billing / Monetization Engine — Pass-B (Hardening) Part 1 v1.0 — BC-BILL-1 / BC-BILL-2 / BC-BILL-3

| Field | Value |
|---|---|
| Document | Doc-4I — **Pass-B Part 1 v1.0** — Module 7 Billing (`billing` schema, `billing_` namespace) |
| Part scope | **BC-BILL-1 Plans & Entitlements · BC-BILL-2 Subscriptions · BC-BILL-3 Usage & Quota** — the frozen Pass-A §A4.1/§A4.2/§A4.3 contracts, hardened to implementation grade. |
| Status | **FROZEN** — Pass-B Part 1 (BC-BILL-1/2/3), base body + `Doc-4I_PassB_Part1_Patch_v1.0` folded inline (per `Doc-4I_PassB_Part1_v1.0_FROZEN`). Implementation-grade; not reopened, not redesigned. |
| Contract authority | `Doc-4I_PassA_Content_v1.0` (FROZEN; sole contract authority; **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4I_Structure_v1.0` (FROZEN) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4H v1.0, Doc-4I_Structure_v1.0, Doc-4I_PassA_Content_v1.0 — all FROZEN |
| Part scope (this Part) | **BC-BILL-1:** `create_plan` · `update_plan` · `retire_plan` · `bundle_plan_entitlement` · `create_entitlement` · `update_entitlement` · `get_plan` · `list_plans`. **BC-BILL-2:** `purchase_subscription` · `cancel_subscription` · `renew_subscription` · `expire_subscription` · `resolve_entitlements` · `get_subscription` · `list_subscription_events`. **BC-BILL-3:** `record_usage` · `enforce_quota` · `get_usage`. |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 1).** Convert the frozen Pass-A BC-BILL-1/2/3 contracts into **implementation-grade** contracts: field-level inputs/outputs, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization, processing, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), idempotency, dependencies. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. **Monetization neutrality** is preserved: Billing meters/charges, **never decides** procurement (no matching/routing/ranking/supplier-selection/award/eligibility) and computes/owns **no** Trust/Performance/Verification/Governance score. **Ownership is disjoint and frozen: BC-BILL-1 owns Plan + Entitlement only; BC-BILL-2 owns Subscription only; BC-BILL-3 owns Usage Ledger only** — no shared, duplicate, or leaked ownership. Carried markers **DF-BILL-1…8** and **`[ESC-BILL-AUDIT]`, `[ESC-BILL-POLICY]`, `[ESC-BILL-SLUG]`, `[ESC-BILL-EVENT]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt**.

**Authority separation (frozen; not merged).** **BC-BILL-1 = entitlement authority** (defines `entitlements` + `plan_entitlements`). **BC-BILL-2 = subscription authority** (sole owner of the §5.7 lifecycle — purchase/renew/cancel/expire — and the **entitlement-resolution authority** that resolves per-org effective entitlements from the `active` subscription + the BC-BILL-1 bundle). **BC-BILL-3 = quota enforcement authority** (meters usage; enforces entitlement-bounded quotas). BC-BILL-3 **consumes** entitlement truth from BC-BILL-2 (intra-module read; read-binding `[ESC-BILL-POLICY]`) but **does not resolve entitlement authority** and **does not define entitlements** (that is BC-BILL-2 / BC-BILL-1 respectively). Responsibilities are not merged; authority is not reinterpreted.

**Recorded reconciliation — Part-1 inventory (no Flag-and-Halt breach; frozen Pass-A governs; user-confirmed).** The authoring brief's per-BC lists differed from the frozen Pass-A inventory; the **frozen authority** `Doc-4I_PassA_Content_v1.0` §A4.1/§A4.2/§A4.3 governs and is hardened here:
- **BC-BILL-1** — brief omitted `retire_plan` / `bundle_plan_entitlement` and added `get_entitlement` / `list_entitlements`. Frozen set governs: `retire_plan` and `bundle_plan_entitlement` **are** hardened (they exist in frozen Pass-A); `get_entitlement` / `list_entitlements` are **not** authored — the read pair `get_plan` / `list_plans` ("Plan/Entitlement Reads") already serves entitlement definitions (frozen §A4.1). No contract invented; none omitted.
- **BC-BILL-2** — brief renamed `resolve_entitlements` → "resolve_subscription_entitlements" and `list_subscription_events` → "list_subscriptions". Frozen IDs govern: **`billing.resolve_entitlements.v1`** and **`billing.list_subscription_events.v1`** are hardened under their frozen names (no rename; the read is over `subscription_events`, the frozen child entity).
- **BC-BILL-3** — brief renamed `enforce_quota` → "evaluate_quota" and `get_usage` → "get_usage_ledger", and added "get_quota_status" / "list_usage_records". Frozen IDs govern: **`billing.enforce_quota.v1`**, **`billing.get_usage.v1`**, **`billing.record_usage.v1`** are hardened under their frozen names; "get_quota_status" / "list_usage_records" are **not** authored (no such frozen contract-ID — quota status is the `enforce_quota` / `get_usage` surface; authoring them would invent contracts).

No contract invented, none omitted, none renamed from the frozen Pass-A set. *(Confirmed with the user before authoring.)*

---

## §H — Part-1 Hardening Conventions (stated once; bound by pointer per contract)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage. Each Validation row names **Authority · Validation · Failure Class**. **Query contracts: Stage 8 BUSINESS present** — where no business rule applies, stated exactly `n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract`.
- **H.2 — Field types.** `uuid` (UUIDv7), `enum<…>` (fixed by the cited Doc-2 source), `string`, `numeric`, `bool`, `jsonb`, `timestamptz`. **Required** = present and non-null (absence → SYNTAX, Doc-4A §9). Nullable stated per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check (Membership + Slug + Scope) OR §6B delegation. Slugs only, from Doc-2 §7; **no slug invented**. Enforcement Identity `check_permission` (Doc-4C). Doc-2 §7 billing slugs: **`can_view_billing`** (Owner, Delegate), **`can_manage_billing`** (Owner). Platform-owned catalog management (BC-BILL-1) and any unenumerated action → **`[ESC-BILL-SLUG]`**. System-actor metering/period-end carries no slug. Usage attribution + subscription scope anchor on the **Controlling Organization** (Identity-resolved, DF-BILL-1).
- **H.4 — Error model (Doc-4A §12).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`; codes `billing_<domain>_<code>`. **`REFERENCE` (definitive negative, `retryable:false`) ≠ `DEPENDENCY` (transient, `retryable:true`)**; **`STATE` (illegal-from-state) ≠ `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4).
- **H.5 — State machines (Doc-2 §3.8/§5.7/§10.8; Doc-4A §13).** **BC-BILL-1:** `plans` `draft → active → retired`; `entitlements`/`plan_entitlements` simple. **BC-BILL-2:** `subscriptions` **§5.7** `pending_payment → active → expired` (+ `active` cancel sets `auto_renew=false`, runs to period end; `active` period-end renew → `active`; `expired` repurchase → `pending_payment`); `subscription_events` append-only. **BC-BILL-3:** `usage_ledger` append-only (no status machine). Every transition cites source/target/forbidden states (others → `STATE`); optimistic concurrency lost race → `CONFLICT`. **No edge added or modified.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the §9 action, actor attribution, object scope, in-transaction timing. Reads not audited (§17.1). Doc-2 §9 **Financial** enumerates "platform invoice created, payment status change, refund, subscription purchase/renewal/cancel" and **Organization** "subscription change"; **subscription expiry, plan/entitlement catalog, and usage recording are not separately enumerated** → those carry **`[ESC-BILL-AUDIT]`** (nearest §9 action by pointer; no action invented), exactly as frozen in Pass-A §A8 (incl. the F4I-PA-M2 expiry correction).
- **H.7 — Events (Doc-2 §8).** **BC-BILL-2 emits exactly three Doc-2 §8 events** — `SubscriptionPurchased` / `SubscriptionRenewed` / `SubscriptionExpired` (single-authorship producer; consumed by Communication for fan-out, DF-BILL-6). **BC-BILL-1 emits/consumes none.** **BC-BILL-3 consumes** `QuotationSubmitted` (RFQ-owned — DF-BILL-3; `source=rfq_response`) and the lead-access / advertising-microsite signals (`[ESC-BILL-EVENT]`; no §8 emission event); **emits none**. Where a contract emits nothing, **No Event** is the binding (valid). No event coined; no event ownership transferred (`QuotationSubmitted` stays RFQ-owned). No 21.2 integration contract authored.
- **H.8 — Idempotency (Doc-4A §14).** Mutations carry `Idempotency: required` + dedup window (`[ESC-BILL-POLICY]`; no `billing` key registered — no key invented). `record_usage` is idempotent on the metered-action unit (event id / `source` + period). Append-only ledgers: replay within window → one row, no duplicate audit. Queries (21.3) `Idempotency: not-applicable` (§14.1).
- **H.9 — Ownership & boundary (Doc-2 §2/§10.8; Doc-4A §4.1).** **BC-BILL-1 owns Plan (`plans`+`plan_entitlements`) + Entitlement (`entitlements`) only; BC-BILL-2 owns Subscription (`subscriptions`+`subscription_events`) only; BC-BILL-3 owns Usage Ledger (`usage_ledger`) only.** No shared/duplicate/leaked ownership. **Moat:** quota enforcement is an entitlement check, **never routing/eligibility authority**; subscription status is **never supplier-selection authority**. **Firewall:** no BC computes/owns/modifies any Trust/Performance/Verification/Governance score. **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED)** — not in this Part's scope; asserted module-wide.
- **H.10 — Field source (Doc-2 §10.8 / §5.7).** `plans`: `name`,`billing_cycle enum<monthly|annual>`,`price`,`currency`,`is_active`; status `draft|active|retired`. `entitlements`: `slug UNIQUE`,`type enum<boolean|numeric|enum>`,`default_value`. `plan_entitlements`: PK(`plan_id`,`entitlement_id`),`value_jsonb`. `subscriptions`: `→plans`,`organization_id`,`state(§5.7)`,`period_start`,`period_end`,`auto_renew`; partial UNIQUE(`organization_id`) WHERE state='active'. `subscription_events`: append-only purchase/renew/expire/cancel rows. `usage_ledger`: `→entitlements`,`organization_id`(Controlling Org),`acting_user_id`,`consuming_entity_id`,`quota_key`,`amount`,`period`,`source(rfq_response/lead_access/ad_launch)`.

**Per-contract record shape (Pass-B).** 12 sections: **1 Contract Header · 2 Purpose · 3 Authority · 4 Preconditions · 5 Inputs · 6 Validation · 7 Processing · 8 Events · 9 Audit · 10 Outputs · 11 Errors · 12 Dependencies.**

---

# BC-BILL-1 — Plans & Entitlements (Plan, Entitlement aggregates)

## §HB-1.1 — `billing.create_plan.v1` · `billing.update_plan.v1` · `billing.retire_plan.v1` — Plan Catalog

**1. Contract Header** — Contract IDs `billing.create_plan.v1`, `billing.update_plan.v1`, `billing.retire_plan.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan** (`plans`) · Operation **21.6 Admin** · Actor **Admin** (platform-staff, §5.6).

**2. Purpose** — Create a plan at `draft` / update plan marketing configuration / retire (`active`|`draft` → `retired`). Platform-owned marketing configuration; confers no entitlement until bundled (§HB-1.2); resolves no org state.

**3. Authority** — Catalog-management — **`[ESC-BILL-SLUG]`** (no Doc-2 §7 catalog slug; no slug invented). Enforcement Identity `check_permission` (platform-staff). Not delegation-eligible.

**4. Preconditions** — Actor platform-staff (Admin). update/retire: `plan_id` exists. retire: plan is `active`/`draft` (`retired` terminal).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `plan_id` | `uuid` | yes (update/retire) | Doc-2 §10.8 | target plan |
| `name` | `string` | yes (create) | Doc-2 §10.8 | display name |
| `billing_cycle` | `enum<monthly\|annual>` | yes (create) | Doc-2 §10.8 | fixed enum |
| `price` | `numeric` | yes (create) | Doc-2 §10.8 | ≥ 0 |
| `currency` | `string` | yes (create) | Doc-2 §10.8 | ISO currency |
| `is_active` | `bool` | no | Doc-2 §10.8 | marketing-visibility flag |
| `expected_status` | `enum<draft\|active\|retired>` | yes (update/retire) | Doc-4A §14 | optimistic-concurrency assertion |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `billing_cycle` ∈ enum; `price` ≥ 0; `plan_id` uuid (update/retire) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.6 | actor is platform-staff (Admin); valid platform context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog-management authority — `[ESC-BILL-SLUG]` (no slug invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog platform-owned; no tenant org scope) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible | — |
| 6 STATE | Doc-2 §3.8 | create → `draft`; update from `draft`/`active`; retire `active`/`draft` → `retired` (forbidden from `retired` → `STATE`); `expected_status` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | update/retire: `plan_id` resolves | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2 | plan config carries no procurement/business decision (moat); no rule beyond state/scope | — |
| 9 POLICY | Doc-3 §12.2 | none (retirement guard window, if later required → `[ESC-BILL-POLICY]`) | — |

**7. Processing** — create: insert `plans` at `draft`. update: mutate marketing fields under optimistic concurrency. retire: `→ retired` (terminal). One transaction with the audit write; no entitlement bundle altered here.

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: plan create/update/retire · owner Billing · **`[ESC-BILL-AUDIT]`** (no §9 catalog action; nearest by pointer; no action invented) · `entity_type=plans`, `entity_id`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `plan_id : uuid`, `status : enum<draft|active|retired>`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | not platform-staff / `[ESC-BILL-SLUG]` fails | false |
| `STATE` | illegal transition (retire a `retired` plan) | false |
| `CONFLICT` | optimistic-concurrency lost race | false |
| `REFERENCE` | `plan_id` does not resolve (definitive) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary (§12.4):** `STATE` ≠ `CONFLICT`; `REFERENCE` ≠ `DEPENDENCY` — never merged.

**12. Dependencies** — **Admin (DF-BILL-7):** catalog governance (carried). **Platform Core (DF-BILL-8):** audit-write, UUIDv7, POLICY. **No subscription/usage/invoice/reward dependency; no procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-1.2 — `billing.bundle_plan_entitlement.v1` — Plan→Entitlement Bundle

**1. Contract Header** — Contract ID `billing.bundle_plan_entitlement.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan** (`plan_entitlements`) · Operation **21.6 Admin** · Actor **Admin** (§5.6).

**2. Purpose** — Map a plan to its entitlement bundle (`plan_entitlements`; PK `plan_id`+`entitlement_id`; `value_jsonb`). Definition only; resolves no org state.

**3. Authority** — Catalog-management — **`[ESC-BILL-SLUG]`** (no §7 slug; no slug invented). Identity `check_permission` (platform-staff). Not delegation-eligible.

**4. Preconditions** — Actor platform-staff. `plan_id` and `entitlement_id` exist (BC-BILL-1 catalog).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `plan_id` | `uuid` | yes | Doc-2 §10.8 | PK; resolves to `plans` |
| `entitlement_id` | `uuid` | yes | Doc-2 §10.8 | PK; resolves to `entitlements` |
| `value_jsonb` | `jsonb` | yes | Doc-2 §10.8 | bundle value (presence/shape only) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; ids uuid; `value_jsonb` present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.6 | actor platform-staff (Admin) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog authority — `[ESC-BILL-SLUG]` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a | — |
| 6 STATE | Doc-2 §3.8 | `plan_entitlements` simple (mapping); duplicate PK idempotent, not a new row | — |
| 7 REFERENCE | Doc-4A §4.5 | `plan_id` and `entitlement_id` both resolve in catalog | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2 | bundle definition carries no procurement decision (moat) | — |
| 9 POLICY | Doc-3 §12.2 | none | — |

**7. Processing** — upsert `plan_entitlements` (PK; `value_jsonb`) in one transaction with the audit write.

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: bundle change · owner Billing · **`[ESC-BILL-AUDIT]`** · `entity_type=plan_entitlements`, `entity_id` (PK), via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `plan_id : uuid`, `entitlement_id : uuid`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | not platform-staff / `[ESC-BILL-SLUG]` fails | false |
| `REFERENCE` | `plan_id`/`entitlement_id` does not resolve (definitive) | false |
| `DEPENDENCY` | Doc-4B/Identity transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Platform Core (DF-BILL-8):** audit-write, UUIDv7. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-1.3 — `billing.create_entitlement.v1` · `billing.update_entitlement.v1` — Entitlement Catalog

**1. Contract Header** — Contract IDs `billing.create_entitlement.v1`, `billing.update_entitlement.v1` · Owning BC **BC-BILL-1** · Aggregate **Entitlement** (`entitlements`) · Operation **21.6 Admin** · Actor **Admin** (§5.6).

**2. Purpose** — Define / update an entitlement slug (`slug UNIQUE`; `type` boolean/numeric/enum; `default_value`). **Entitlement definition only — BC-BILL-1 is the entitlement authority; per-org resolution is BC-BILL-2's.**

**3. Authority** — Catalog-management — **`[ESC-BILL-SLUG]`** (no §7 slug; no slug invented). Identity `check_permission` (platform-staff). Not delegation-eligible.

**4. Preconditions** — Actor platform-staff. update: `entitlement_id` exists. `slug` unique across catalog.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `entitlement_id` | `uuid` | yes (update) | Doc-2 §10.8 | target entitlement |
| `slug` | `string` | yes (create) | Doc-2 §10.8 | **UNIQUE** |
| `type` | `enum<boolean\|numeric\|enum>` | yes (create) | Doc-2 §10.8 | fixed enum |
| `default_value` | `jsonb` | no | Doc-2 §10.8 | default per type (presence/shape only) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `type` ∈ enum; `entitlement_id` uuid (update) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.6 | actor platform-staff (Admin) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog authority — `[ESC-BILL-SLUG]` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform scope (catalog) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a | — |
| 6 STATE | Doc-2 §3.8 | `entitlements` simple (catalog); update optimistic → `CONFLICT` on lost race | `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | update: `entitlement_id` resolves | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2 | `slug` UNIQUE (duplicate → `BUSINESS`); definition carries no procurement decision (moat) | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2 | none | — |

**7. Processing** — create: insert `entitlements` (enforce `slug` UNIQUE). update: mutate `type`/`default_value` under optimistic concurrency. One transaction with the audit write.

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: entitlement create/update · owner Billing · **`[ESC-BILL-AUDIT]`** · `entity_type=entitlements`, `entity_id`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `entitlement_id : uuid`, `slug : string`, `type : enum<boolean|numeric|enum>`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure | false |
| `AUTHORIZATION` | not platform-staff / `[ESC-BILL-SLUG]` fails | false |
| `BUSINESS` | `slug` not unique (duplicate catalog slug) | false |
| `CONFLICT` | optimistic-concurrency lost race (update) | false |
| `REFERENCE` | `entitlement_id` does not resolve (update; definitive) | false |
| `DEPENDENCY` | Doc-4B/Identity transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `BUSINESS` (duplicate slug) ≠ `VALIDATION`; `STATE`/`CONFLICT` separated; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Platform Core (DF-BILL-8):** audit-write, UUIDv7. **No subscription/quota dependency; no procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-1.4 — `billing.get_plan.v1` · `billing.list_plans.v1` — Plan / Entitlement Reads

**1. Contract Header** — Contract IDs `billing.get_plan.v1`, `billing.list_plans.v1` · Owning BC **BC-BILL-1** · Aggregate **Plan / Entitlement** · Operation **21.3 Query** · Actor **User / Admin**.

**2. Purpose** — Read the public plan catalog + entitlement definitions (for plan selection). Serves both plan-catalog and entitlement-definition reads (frozen §A4.1 "Plan/Entitlement Reads"). Resolves no org-specific entitlement (that is BC-BILL-2).

**3. Authority** — Catalog is **platform-owned, public-readable for plan selection**; no distinct §7 read slug → **`[ESC-BILL-SLUG]`** if later required (no slug invented).

**4. Preconditions** — Valid caller context; catalog public-readable.

**5. Inputs** — *`get_plan`:* `plan_id : uuid (required)`. *`list_plans`:* `filter : object{ billing_cycle?, is_active?, status? } (optional; allowlisted, §9.6)`; `page_size : numeric (optional; `[ESC-BILL-POLICY]`)`; `page_token : string (optional; §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter fields; `plan_id` uuid (get) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | valid caller context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | catalog read — public for plan selection (`[ESC-BILL-SLUG]` if later required) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | catalog platform-owned (no tenant scoping) | — |
| 5 DELEGATION | Doc-4A §6B | n/a (read) | — |
| 6 STATE | Doc-2 §3.8 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | get: `plan_id` resolves else `NOT_FOUND` | `NOT_FOUND` |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — get: fetch `plans` (+ `plan_entitlements`/entitlement definitions) by `plan_id`. list: enumerate with allowlisted filters + pagination. Read-only.

**8. Events** — **No Event** (reads emit/consume none).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** *`get_plan`:* `plan : object{ plan_id, name, billing_cycle, price, currency, status, is_active, entitlements:list<object{ entitlement_id, slug, type, value }> }`, `reference_id`. *`list_plans`:* `items : list<object{ plan_id, name, billing_cycle, price, currency, status }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter; `page_size` out of bound) | false |
| `NOT_FOUND` | `plan_id` does not resolve (get) | false |
| `DEPENDENCY` | Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** non-existent `plan_id` → `NOT_FOUND` (public catalog); `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Platform Core (DF-BILL-8):** read infrastructure, POLICY (page-size). **No ownership transfer; no procurement decision (moat); no Trust score (firewall).**

---

# BC-BILL-2 — Subscriptions (Subscription aggregate) — sole subscription + entitlement-resolution authority

## §HB-2.1 — `billing.purchase_subscription.v1` — Purchase Subscription

**1. Contract Header** — Contract ID `billing.purchase_subscription.v1` · Owning BC **BC-BILL-2** · Aggregate **Subscription** (`subscriptions`) · Operation **21.4 Command** · Actor **User** (Owner).

**2. Purpose** — Purchase a subscription for the active org (→ `pending_payment`; on payment confirmation → `active`). BC-BILL-2 is sole subscription authority.

**3. Authority** — **`can_manage_billing`** (Owner; Doc-2 §7). Enforcement Identity `check_permission` (Doc-4C); Controlling-Org resolution (DF-BILL-1). Delegation per §6B only if a representative-org grant applies (else not).

**4. Preconditions** — Active org context; `can_manage_billing`; the target `plan_id` exists and is `active`; partial UNIQUE(`organization_id`) WHERE state='active' enforced (no second active subscription).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `plan_id` | `uuid` | yes | Doc-2 §10.8 | resolves to an `active` `plans` row (BC-BILL-1) |
| `auto_renew` | `bool` | no | Doc-2 §10.8 | default true |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `plan_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_manage_billing` (Owner) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | scope = the actor's Controlling Organization (subscription is the org's own) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | representative-org grant honored if present; else n/a | — |
| 6 STATE | Doc-2 §5.7 | no `active` subscription exists for the org (partial UNIQUE WHERE state='active'); new row enters `pending_payment`; a concurrent second purchase finds an existing `active` subscription → `STATE` (illegal-from-state; no optimistic-concurrency assertion token, so no `CONFLICT`) | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | `plan_id` resolves to an `active` plan (BC-BILL-1) | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-3; Doc-2 §5.7 | purchase confers entitlements only via the plan bundle (BC-BILL-1); no procurement/eligibility decision (moat) | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2 | none (renewal lead time/dedup → `[ESC-BILL-POLICY]`) | — |

**7. Processing** — insert `subscriptions` at `pending_payment` (`plan_id`,`organization_id`=Controlling Org,`auto_renew`,`period_*`); append `subscription_events` (purchase); on payment confirmation transition → `active` (the confirmation path emits the event). One transaction with the audit + outbox write.

**8. Events** — **Emits `SubscriptionPurchased`** (Doc-2 §8; BC-BILL-2-owned, single-authorship) on purchase/activation; consumed by Communication (DF-BILL-6). Consumes none.

**9. Audit** — Trigger: subscription purchase · owner Billing · **§9 Financial/Organization ("subscription purchase") by pointer** · `entity_type=subscriptions`, `entity_id`, attribution `User`, `organization_id`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `subscription_id : uuid`, `status : enum<pending_payment|active|expired>`, `plan_id : uuid`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `plan_id`) | false |
| `AUTHORIZATION` | actor/context/slug/scope fail (member without `can_manage_billing`) | false |
| `STATE` | an `active` subscription already exists (partial UNIQUE) | false |
| `REFERENCE` | `plan_id` does not resolve / not `active` (definitive) | false |
| `BUSINESS` | plan not purchasable per Doc-3 commercial rule | false |
| `DEPENDENCY` | Identity/Doc-4B/payment service transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `STATE` (already-active) ≠ `CONFLICT` (lost race); `REFERENCE` (plan not found) ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** outbox (event), audit, UUIDv7. **Communication (DF-BILL-6):** consumes the event (Billing authors no notification). **BC-BILL-1:** `plan_id` reference (read; entitlement bundle owned by BC-BILL-1). **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-2.2 — `billing.cancel_subscription.v1` — Cancel Subscription

**1. Contract Header** — Contract ID `billing.cancel_subscription.v1` · Owning BC **BC-BILL-2** · Aggregate **Subscription** (`subscriptions`) · Operation **21.4 Command** · Actor **User** (Owner).

**2. Purpose** — Cancel (Owner only; sets `auto_renew=false`; subscription runs to period end — no immediate state change). BC-BILL-2 sole authority.

**3. Authority** — **`can_manage_billing`** (Owner; Doc-2 §7). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — Active org context; `can_manage_billing`; the org has an `active` subscription.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `subscription_id` | `uuid` | yes | Doc-2 §10.8 | the org's `active` subscription |
| `expected_status` | `enum<active>` | yes | Doc-4A §14 | optimistic-concurrency assertion |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `subscription_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_manage_billing` (Owner) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | the subscription belongs to the actor's Controlling Org (else `NOT_FOUND`) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §5.7 | subscription is `active` (sets `auto_renew=false`; no state change); forbidden otherwise → `STATE`; `expected_status` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5; §7.5 | `subscription_id` resolves within the actor's Controlling Org (user-scoped; protected-fact collapse) | `NOT_FOUND` / `DEPENDENCY` |
| 8 BUSINESS | Doc-2 §5.7 | cancel sets `auto_renew=false` only; runs to period end; no procurement decision (moat) | — |
| 9 POLICY | Doc-3 §12.2 | none | — |

**7. Processing** — set `auto_renew=false` on the `active` subscription (state unchanged); append `subscription_events` (cancel). One transaction with the audit write. Expiry (and its event) fires later at period end (§HB-2.3).

**8. Events** — **No Event** at cancel (the expiry event fires at period end — §HB-2.3). Consumes none.

**9. Audit** — Trigger: subscription cancel · owner Billing · **§9 ("subscription cancel") by pointer** · `entity_type=subscriptions`, `entity_id`, attribution `User`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `subscription_id : uuid`, `status : enum<active> (auto_renew=false)`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `subscription_id`) | false |
| `AUTHORIZATION` | context/slug fail (member without `can_manage_billing`) | false |
| `NOT_FOUND` | subscription not in the actor's Controlling Org (protected-fact collapse) | false |
| `STATE` | subscription not `active` (cancel illegal) | false |
| `CONFLICT` | optimistic-concurrency lost race | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org subscription → `NOT_FOUND`; `STATE` ≠ `CONFLICT`; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** audit, UUIDv7. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-2.3 — `billing.renew_subscription.v1` · `billing.expire_subscription.v1` — Subscription Period Transition

**1. Contract Header** — Contract IDs `billing.renew_subscription.v1`, `billing.expire_subscription.v1` · Owning BC **BC-BILL-2** · Aggregate **Subscription** (`subscriptions`) · Operation **21.5 System** · Actor **System** (period-end job).

**2. Purpose** — At period end: renew (`auto_renew` + payment ok → `active`, emits `SubscriptionRenewed`) or expire (`auto_renew=false` or payment failure → `expired`, emits `SubscriptionExpired`). BC-BILL-2 sole authority.

**3. Authority** — none (System; period-end job; no active org context — Doc-4A §5.2/§15.5). No slug.

**4. Preconditions** — A subscription at `active` reaching period end; payment outcome known (renew vs expire branch).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `subscription_id` | `uuid` | yes | Doc-2 §10.8 | the subscription at period end |
| `expected_status` | `enum<active>` | yes | Doc-4A §14 | optimistic-concurrency assertion |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `subscription_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2 | System actor; no active org context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-4A §15.5 | System job authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform/System scope on the subscription row | — |
| 5 DELEGATION | Doc-4A §6B | n/a (System) | — |
| 6 STATE | Doc-2 §5.7 | renew: `active` → `active` (auto_renew + payment ok); expire: `active` → `expired` (auto_renew=false or payment failure); forbidden source → `STATE`; `expected_status` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | `subscription_id` resolves | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-2 §5.7 | renew/expire branch per `auto_renew` + payment outcome; no procurement decision (moat) | — |
| 9 POLICY | Doc-3 §12.2 | none (payment-retry/grace window → `[ESC-BILL-POLICY]`) | — |

**7. Processing** — renew: transition `active → active`, advance `period_*`, append `subscription_events` (renew). expire: transition `active → expired`, append `subscription_events` (expire). One transaction with the audit + outbox write.

**8. Events** — **Emits `SubscriptionRenewed`** (renew branch) / **`SubscriptionExpired`** (expire branch) (Doc-2 §8; BC-BILL-2-owned, single-authorship); consumed by Communication (DF-BILL-6). Consumes none.

**9. Audit** — Trigger: subscription period transition · owner Billing · **renew → §9 Financial ("subscription renewal") by pointer; expire → `[ESC-BILL-AUDIT]`** (subscription expiry not separately enumerated in Doc-2 §9 Financial — "subscription purchase/renewal/cancel" enumerated; expiry is not — nearest §9 action by pointer; §9 additive; no action invented — frozen Pass-A F4I-PA-M2) · `entity_type=subscriptions`, `entity_id`, attribution `System`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `subscription_id : uuid`, `status : enum<active|expired>`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `subscription_id`) | false |
| `STATE` | subscription not `active` at transition (illegal from-state) | false |
| `CONFLICT` | optimistic-concurrency lost race (`expected_status` mismatch) | false |
| `REFERENCE` | `subscription_id` does not resolve (definitive) | false |
| `DEPENDENCY` | Doc-4B/payment service transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `STATE` (illegal from-state) ≠ `CONFLICT` (lost race); `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Platform Core (DF-BILL-8):** outbox (events), audit, UUIDv7. **Communication (DF-BILL-6):** consumes the events. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-2.4 — `billing.resolve_entitlements.v1` — Resolve Entitlements (entitlement-resolution authority)

**1. Contract Header** — Contract ID `billing.resolve_entitlements.v1` · Owning BC **BC-BILL-2** · Aggregate **Subscription** (+ BC-BILL-1 Entitlement catalog, read) · Operation **21.3 Query** · Actor **User / System**.

**2. Purpose** — Resolve the org's **effective entitlements** from the `active` subscription + the BC-BILL-1 plan bundle (Basic profile otherwise — A-11). **BC-BILL-2 is the entitlement-resolution authority**; this read is consumed intra-module by BC-BILL-3 quota enforcement. BC-BILL-3 consumes this truth but does **not** resolve it.

**3. Authority** — **`can_view_billing`** (org self) / **System** (intra-module enforcement read). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — Active org context (User) or System enforcement context; the org's subscription state is determinable (active or Basic-profile fallback).

**5. Inputs** — `organization_id : uuid (required; Controlling Org)`; `entitlement_slug : string (optional; resolve a single entitlement)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `organization_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User (active org) or System | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | `can_view_billing` (org self) / System enforcement read | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `organization_id` is the actor's Controlling Org (User) else `NOT_FOUND`; System resolves the enforcement-target org | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §5.7 | none (read); resolution reads the current subscription state (active → plan entitlements; else Basic profile, A-11) | — |
| 7 REFERENCE | Doc-4A §4.5 | the BC-BILL-1 entitlement catalog resolves (read) | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-3 §12.2 | the enforcement-read binding (sync vs cache) is carried `[ESC-BILL-POLICY]` (F4I-MA1) | — |

**7. Processing** — read the org's `active` subscription → its `plan_id` → the BC-BILL-1 `plan_entitlements` bundle + `entitlements` definitions; if no `active` subscription, return the Basic entitlement profile (A-11). Read-only; resolves no other BC's state.

**8. Events** — **No Event** (read).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** `organization_id : uuid`, `entitlements : list<object{ slug, type, value }>`, `source : enum<active_subscription|basic_profile>`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `organization_id`) | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | `organization_id` not the actor's Controlling Org (protected-fact collapse) | false |
| `REFERENCE` | the entitlement catalog does not resolve (definitive) | false |
| `DEPENDENCY` | Identity/BC-BILL-1 read transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org resolve → `NOT_FOUND`; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **BC-BILL-1:** entitlement catalog + plan bundle (read; definitions owned by BC-BILL-1). **Consumed by BC-BILL-3** (intra-module enforcement read; read-binding `[ESC-BILL-POLICY]`). **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-2.5 — `billing.get_subscription.v1` · `billing.list_subscription_events.v1` — Subscription Reads

**1. Contract Header** — Contract IDs `billing.get_subscription.v1`, `billing.list_subscription_events.v1` · Owning BC **BC-BILL-2** · Aggregate **Subscription** · Operation **21.3 Query** · Actor **User** (Owner, Delegate).

**2. Purpose** — Read the org's subscription head / its `subscription_events` history. *(Reconciliation: the frozen contract-ID is `list_subscription_events` — over the `subscription_events` child entity — not the brief's "list_subscriptions".)*

**3. Authority** — **`can_view_billing`** (Owner, Delegate; Doc-2 §7). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — Active org context; `can_view_billing`.

**5. Inputs** — *`get_subscription`:* (no input — the actor's Controlling-Org subscription) or `subscription_id : uuid (optional)`. *`list_subscription_events`:* `subscription_id : uuid (required)`; `page_size : numeric (optional; `[ESC-BILL-POLICY]`)`; `page_token : string (optional; §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `subscription_id` uuid where supplied | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_view_billing` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the subscription belongs to the actor's Controlling Org (else `NOT_FOUND`) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §5.7 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | `subscription_id` resolves (else `NOT_FOUND`) | `NOT_FOUND` |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — get: fetch the org's `subscriptions` head. list: enumerate `subscription_events` for the subscription with pagination. Read-only; scoped to the Controlling Org.

**8. Events** — **No Event** (read).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** *`get_subscription`:* `subscription : object{ subscription_id, plan_id, status, period_start, period_end, auto_renew }`, `reference_id`. *`list_subscription_events`:* `items : list<object{ event_type, occurred_at }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `subscription_id`; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without `can_view_billing`) | false |
| `NOT_FOUND` | subscription not in the actor's Controlling Org (protected-fact collapse) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org subscription → `NOT_FOUND` (never confirm existence to a non-owner).

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** read infrastructure, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

# BC-BILL-3 — Usage & Quota (Usage Ledger aggregate) — quota enforcement authority

## §HB-3.1 — `billing.record_usage.v1` — Record Usage

**1. Contract Header** — Contract ID `billing.record_usage.v1` · Owning BC **BC-BILL-3** · Aggregate **Usage Ledger** (`usage_ledger`) · Operation **21.5 System** · Actor **System** (metering).

**2. Purpose** — On a consumed metered-action signal, append a `usage_ledger` row (`quota_key`, `amount`, `period`, `source`); attribution **always to the Controlling Organization** (regardless of acting representative).

**3. Authority** — none (System metering; no active org context). No slug.

**4. Preconditions** — A consumed metered-action signal (event id present); the Controlling Org is resolvable (DF-BILL-1).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `organization_id` | `uuid` | yes | Doc-2 §10.8 | **Controlling Organization** (attribution anchor) |
| `acting_user_id` | `uuid` | no | Doc-2 §10.8 | acting representative (nullable) |
| `consuming_entity_id` | `uuid` | no | Doc-2 §10.8 | the consuming entity (e.g., vendor profile) |
| `quota_key` | `string` | yes | Doc-2 §10.8 | the metered quota key |
| `amount` | `numeric` | yes | Doc-2 §10.8 | consumption amount |
| `period` | `string` | yes | Doc-2 §10.8 | metering period |
| `source` | `enum<rfq_response\|lead_access\|ad_launch>` | yes | Doc-2 §10.8 | metered-action source |
| `source_event_id` | `uuid` | yes | Doc-4A §16 | the consumed event id (idempotency key) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `source` ∈ enum; `amount` numeric; `source_event_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2 | System actor; no active org context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-4A §15.5 | System metering authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | attribution to the Controlling Organization (Identity-resolved — DF-BILL-1) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a (System; attribution to controlling org regardless of acting representative) | — |
| 6 STATE | Doc-2 §10.8 | `usage_ledger` append-only (no status machine) | — |
| 7 REFERENCE | Doc-4A §4.5 | Controlling Org resolves (DF-BILL-1). `quota_key` is a free-form `string` at metering time (H.10; Doc-2 §10.8 — `usage_ledger.quota_key` is not a foreign key and no record-time entitlement lookup is specified); entitlement binding for `quota_key` is evaluated only at `billing.enforce_quota.v1` (§HB-3.2), not here | `REFERENCE` (Controlling-Org definitive negative) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §11.2; Doc-2 §10.8 | usage recording is observability/metering only — **never a procurement/eligibility/routing decision (moat)** | — |
| 9 POLICY | Doc-3 §12.2 | metering window/dedup → `[ESC-BILL-POLICY]` | — |

**7. Processing** — append one `usage_ledger` row attributed to the Controlling Org; idempotent on `source_event_id` (+ `source` + period). One transaction with the audit write. Records the fact; takes no enforcement action here.

**8. Events** — **Consumes** `QuotationSubmitted` (RFQ-owned — DF-BILL-3; `source=rfq_response`); **consumes** the lead-access (Operations — DF-BILL-4) and advertising/microsite (Marketplace — DF-BILL-2) signals (`[ESC-BILL-EVENT]`; no §8 emission event). Idempotent (Doc-4A §16). **Emits none.** `QuotationSubmitted` stays RFQ-owned (no event ownership transfer).

**9. Audit** — Trigger: usage recording · owner Billing · **`[ESC-BILL-AUDIT]`** (usage recording not separately §9-enumerated; nearest by pointer; no action invented) · `entity_type=usage_ledger`, `entity_id`, attribution `System`, `organization_id` (Controlling Org), via Doc-4B (in-transaction).

**10. Outputs** — **`Response: none`** (21.5 System). On success the `usage_ledger` row exists; failures surface to the calling job per Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `source`/`amount`/`source_event_id`) | false |
| `REFERENCE` | `quota_key`/Controlling Org does not resolve (definitive) | false |
| `DEPENDENCY` | RFQ/Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `REFERENCE` (quota_key/org not found) ≠ `DEPENDENCY` (transient). Replay on the same `source_event_id` → one row, no duplicate audit (idempotent).

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org resolution. **RFQ (DF-BILL-3):** `QuotationSubmitted` (consumed; RFQ-owned). **Operations (DF-BILL-4) / Marketplace (DF-BILL-2):** lead-access / advertising-microsite signals (`[ESC-BILL-EVENT]`). **Platform Core (DF-BILL-8):** audit, UUIDv7. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-3.2 — `billing.enforce_quota.v1` — Enforce Quota

**1. Contract Header** — Contract ID `billing.enforce_quota.v1` · Owning BC **BC-BILL-3** · Aggregate **Usage Ledger** (read) + BC-BILL-2 entitlement (read) · Operation **21.3 Query** · Actor **User / System**.

**2. Purpose** — Evaluate whether a metered action is within the org's **entitlement-bounded quota** — an entitlement check. **Never a routing/eligibility/supplier-selection decision (moat).** Reads resolved entitlement from **BC-BILL-2** (`billing.resolve_entitlements.v1`) intra-module + the org's `usage_ledger` balance. **BC-BILL-3 is the quota enforcement authority; it consumes entitlement truth but does not resolve it.**

**3. Authority** — **`can_view_billing`** (org self) / **System** (enforcement at the metered action). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — Active org context (User) or System enforcement context; the entitlement-resolution read (BC-BILL-2) is available.

**5. Inputs** — `organization_id : uuid (required; Controlling Org)`; `quota_key : string (required)`; `requested_amount : numeric (optional; default 1)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `organization_id` uuid; `quota_key` present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User (active org) or System | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | `can_view_billing` (org self) / System enforcement | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `organization_id` is the actor's Controlling Org (User) else `NOT_FOUND`; System resolves the enforcement-target org | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §10.8 | none (read/decision over append-only `usage_ledger`) | — |
| 7 REFERENCE | Doc-4A §4.5 | the BC-BILL-2 entitlement resolution + `usage_ledger` balance resolve | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-4A §11.2; Doc-2 §10.8 | within-quota = `requested_amount` ≤ (entitlement limit − recorded usage) → allow; over → `QUOTA`; **this is an entitlement check, never routing/eligibility (moat)** | `QUOTA` |
| 9 POLICY | Doc-3 §12.2 | quota window/reset → `[ESC-BILL-POLICY]`; entitlement-read binding `[ESC-BILL-POLICY]` (F4I-MA1) | — |

**7. Processing** — resolve entitlement (BC-BILL-2 read) + sum `usage_ledger` for the `quota_key`/period; return allow/deny (within entitlement-bounded limit). Read/decision only; no state change; **takes no routing/eligibility action.**

**8. Events** — **No Event** (read/decision).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** `allowed : bool`, `quota_key : string`, `limit : numeric`, `used : numeric`, `remaining : numeric`, `reference_id`. **Failure:** Doc-4A §12 envelope. `QUOTA` is returned when `requested_amount` exceeds the entitlement-bounded quota (see Section 11).

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `organization_id`/`quota_key`) | false |
| `AUTHORIZATION` | context/slug fail | false |
| `NOT_FOUND` | `organization_id` not the actor's Controlling Org (protected-fact collapse) | false |
| `QUOTA` | requested amount exceeds the entitlement-bounded quota | false |
| `REFERENCE` | entitlement resolution / usage balance does not resolve (definitive) | false |
| `DEPENDENCY` | BC-BILL-2 read / Identity / Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `QUOTA` (over budget) ≠ `RATE_LIMITED`; `REFERENCE` ≠ `DEPENDENCY`; cross-org → `NOT_FOUND`. **Quota denial is never an eligibility/routing signal (moat).**

**12. Dependencies** — **BC-BILL-2 (`resolve_entitlements`):** entitlement truth (intra-module read; authority stays BC-BILL-2; read-binding `[ESC-BILL-POLICY]`). **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **No procurement/routing decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-3.3 — `billing.get_usage.v1` — Quota Inquiry

**1. Contract Header** — Contract ID `billing.get_usage.v1` · Owning BC **BC-BILL-3** · Aggregate **Usage Ledger** · Operation **21.3 Query** · Actor **User**.

**2. Purpose** — Read the org's usage/quota balance for a `quota_key`/period. *(Reconciliation: the frozen contract-ID is `get_usage` — not the brief's "get_usage_ledger"/"get_quota_status"/"list_usage_records"; this single read serves the org's usage/quota balance.)*

**3. Authority** — **`can_view_billing`**; recipient-scoped (Controlling Org). Identity `check_permission` (DF-BILL-1).

**4. Preconditions** — Active org context; `can_view_billing`.

**5. Inputs** — `organization_id : uuid (required; Controlling Org)`; `quota_key : string (optional)`; `period : string (optional)`; `page_size : numeric (optional; `[ESC-BILL-POLICY]`)`; `page_token : string (optional; §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `organization_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_view_billing` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `organization_id` is the actor's Controlling Org (else `NOT_FOUND`) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §10.8 | none (read over append-only `usage_ledger`) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — sum/enumerate `usage_ledger` rows for the Controlling Org by `quota_key`/period with pagination. Read-only.

**8. Events** — **No Event** (read).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** `items : list<object{ quota_key, amount, period, source }>`, `totals : object{ quota_key, used }`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (`page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without `can_view_billing`) | false |
| `NOT_FOUND` | `organization_id` not the actor's Controlling Org (protected-fact collapse) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org usage → `NOT_FOUND`; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** read infrastructure, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## Appendix A — BC-BILL-1/2/3 Part-1 Contract Register (Pass-B)

| § | Contract-ID | Operation | Owning BC | Aggregate | Actor | Permission | Emits event | Audit |
|---|---|---|---|---|---|---|---|---|
| §HB-1.1 | `create_plan` · `update_plan` · `retire_plan` | 21.6 Admin | BC-BILL-1 | Plan (`plans`) | Admin | `[ESC-BILL-SLUG]` | No Event | `[ESC-BILL-AUDIT]` |
| §HB-1.2 | `bundle_plan_entitlement` | 21.6 Admin | BC-BILL-1 | Plan (`plan_entitlements`) | Admin | `[ESC-BILL-SLUG]` | No Event | `[ESC-BILL-AUDIT]` |
| §HB-1.3 | `create_entitlement` · `update_entitlement` | 21.6 Admin | BC-BILL-1 | Entitlement (`entitlements`) | Admin | `[ESC-BILL-SLUG]` | No Event | `[ESC-BILL-AUDIT]` |
| §HB-1.4 | `get_plan` · `list_plans` | 21.3 Query | BC-BILL-1 | Plan / Entitlement | User / Admin | `[ESC-BILL-SLUG]` (public read) | No Event | none (read) |
| §HB-2.1 | `purchase_subscription` | 21.4 Command | BC-BILL-2 | Subscription | User | `can_manage_billing` | **`SubscriptionPurchased`** | §9 Financial (pointer) |
| §HB-2.2 | `cancel_subscription` | 21.4 Command | BC-BILL-2 | Subscription | User | `can_manage_billing` | No Event | §9 (pointer) |
| §HB-2.3 | `renew_subscription` · `expire_subscription` | 21.5 System | BC-BILL-2 | Subscription | System | none (System) | **`SubscriptionRenewed` / `SubscriptionExpired`** | renew §9 / expire `[ESC-BILL-AUDIT]` |
| §HB-2.4 | `resolve_entitlements` | 21.3 Query | BC-BILL-2 | Subscription (+BC-BILL-1 read) | User / System | `can_view_billing` / System | No Event | none (read) |
| §HB-2.5 | `get_subscription` · `list_subscription_events` | 21.3 Query | BC-BILL-2 | Subscription | User | `can_view_billing` | No Event | none (read) |
| §HB-3.1 | `record_usage` | 21.5 System | BC-BILL-3 | Usage Ledger | System | none (System) | consumes `QuotationSubmitted` (+`[ESC-BILL-EVENT]`); emits none | `[ESC-BILL-AUDIT]` |
| §HB-3.2 | `enforce_quota` | 21.3 Query | BC-BILL-3 | Usage Ledger (+BC-BILL-2 read) | User / System | `can_view_billing` / System | No Event | none (read) |
| §HB-3.3 | `get_usage` | 21.3 Query | BC-BILL-3 | Usage Ledger | User | `can_view_billing` | No Event | none (read) |

**Part-1 invariants (held):** the hardened contracts are the verbatim frozen Pass-A §A4.1/§A4.2/§A4.3 set — **18 contract-IDs** (BC-BILL-1: 8; BC-BILL-2: 7; BC-BILL-3: 3); no contract added/renamed/omitted (brief's `get_entitlement`/`list_entitlements`/`get_quota_status`/`list_usage_records`/`get_usage_ledger`/`evaluate_quota`/`resolve_subscription_entitlements`/`list_subscriptions` are **not** frozen contract-IDs and are not authored — reconciliation above). **Ownership is disjoint:** BC-BILL-1 owns **Plan + Entitlement only**; BC-BILL-2 owns **Subscription only**; BC-BILL-3 owns **Usage Ledger only** — no shared, duplicate, or leaked ownership. **Authority is not merged:** BC-BILL-1 = entitlement authority; BC-BILL-2 = subscription + entitlement-resolution authority; BC-BILL-3 = quota enforcement authority (consumes entitlement truth, resolves none). **Events:** BC-BILL-2 emits exactly `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` (Billing-owned, single-authorship); `QuotationSubmitted` is RFQ-owned, BC-BILL-3-consumed; no event coined; no event ownership transferred. Every mutation binds `[ESC-BILL-AUDIT]` or a named §9 action by pointer (no audit action invented; incl. the F4I-PA-M2 expiry correction). Lifecycles verbatim Doc-2 §3.8/§5.7/§10.8. `STATE ≠ CONFLICT` and `REFERENCE ≠ DEPENDENCY` separated throughout. **Procurement moat held** — quota enforcement is an entitlement check, never routing/eligibility/supplier-selection; subscription status is never supplier-selection authority. **Trust firewall held** — no BC computes/owns/modifies any Trust/Performance/Verification/Governance score. **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 1; unchanged)

- **DF-BILL-1** (Identity — Controlling-Org/`check_permission`), **DF-BILL-2** (Marketplace — ad/microsite metering signal, `[ESC-BILL-EVENT]`), **DF-BILL-3** (RFQ — `QuotationSubmitted` consumed, RFQ-owned), **DF-BILL-4** (Operations — lead-access metering signal, `[ESC-BILL-EVENT]`), **DF-BILL-6** (Communication — consumes the three subscription events), **DF-BILL-7** (Admin — catalog governance, carried), **DF-BILL-8** (Platform Core — audit/outbox/UUIDv7/POLICY). *(DF-BILL-5 Trust appears only as the firewall negative-assertion — no score.)*
- **`[ESC-BILL-AUDIT]`** (Doc-2 §9 additive) — plan/entitlement catalog mutations, subscription expiry, usage recording (no enumerated §9 action; nearest by pointer; no action invented).
- **`[ESC-BILL-SLUG]`** (Doc-2 §7 additive) — the platform-owned catalog (BC-BILL-1); Doc-2 §7 enumerates no catalog-management/read slug; carried; no slug invented.
- **`[ESC-BILL-POLICY]`** (Doc-3 §12.2 additive) — dedup/page-size/metering-window/quota-reset/renewal-lead-time keys + the entitlement enforcement-read binding (F4I-MA1); no `billing` POLICY namespace registered; no key invented.
- **`[ESC-BILL-EVENT]`** (Doc-2 §8 additive) — the lead-access and advertising/microsite metering signals (no §8 emission event); carried; no event coined.

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4I — Pass-B (Hardening) Part 1 v1.0 — BC-BILL-1 / BC-BILL-2 / BC-BILL-3. Authored against `Doc-4I_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4I_Structure_v1.0` (FROZEN). Hardens the frozen Pass-A §A4.1/§A4.2/§A4.3 set — 18 contract-IDs (BC-BILL-1: create/update/retire_plan, bundle_plan_entitlement, create/update_entitlement, get_plan/list_plans; BC-BILL-2: purchase/cancel/renew/expire_subscription, resolve_entitlements, get_subscription/list_subscription_events; BC-BILL-3: record_usage, enforce_quota, get_usage) — to implementation grade (field-level inputs/outputs, Doc-4A §11.2 nine-stage validation, processing, audit bindings, event bindings, error registers with §12.4 boundaries + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency, dependencies) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. Ownership is disjoint and frozen (BC-BILL-1 Plan+Entitlement; BC-BILL-2 Subscription; BC-BILL-3 Usage Ledger — no leakage); authority is not merged (entitlement / subscription+resolution / quota-enforcement); BC-BILL-2 emits the three subscription events (single-authorship), `QuotationSubmitted` stays RFQ-owned and BC-BILL-3-consumed; lifecycles are verbatim Doc-2 §3.8/§5.7/§10.8; every mutation carries `[ESC-BILL-AUDIT]` or a named §9 action by pointer (no action invented); the procurement moat (quota is an entitlement check, never routing/eligibility/supplier-selection; subscription status never supplier-selection authority) and the trust firewall (no score owned/computed/modified) are preserved; Billing meters/charges, never decides; nothing invented. Reconciliation: the brief's renamed/added/omitted contract-IDs were reconciled to the frozen Pass-A 18-ID set per the user's confirmation — frozen Pass-A governs. Carried markers DF-BILL-1…8, `[ESC-BILL-AUDIT]`/`[ESC-BILL-SLUG]`/`[ESC-BILL-POLICY]`/`[ESC-BILL-EVENT]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*

---

# Doc-4I — Billing / Monetization Engine — Pass-B (Hardening) Part 2 v1.0 — BC-BILL-4 / BC-BILL-5 / BC-BILL-6

| Field | Value |
|---|---|
| Document | Doc-4I — **Pass-B Part 2 v1.0** — Module 7 Billing (`billing` schema, `billing_` namespace) |
| Part scope | **BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals** — the frozen Pass-A §A4.4/§A4.5/§A4.6 contracts, hardened to implementation grade. |
| Status | **FROZEN** — Pass-B Part 2 (BC-BILL-4/5/6), base body + `Doc-4I_PassB_Part2_Patch_v1.0` folded inline. Implementation-grade; not reopened, not redesigned. |
| Contract authority | `Doc-4I_PassA_Content_v1.0` (FROZEN; sole contract authority; **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4I_Structure_v1.0` (FROZEN) |
| Prior frozen Part | `Doc-4I_PassB_Part1_v1.0_FROZEN` (BC-BILL-1/2/3) — **FROZEN; not reopened** |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4H v1.0, Doc-4I_Structure_v1.0, Doc-4I_PassA_Content_v1.0, Doc-4I_PassB_Part1_v1.0_FROZEN — all FROZEN |
| Part scope (this Part) | **BC-BILL-4:** `credit_lead_account` · `debit_lead_account` · `get_lead_balance` · `list_lead_transactions`. **BC-BILL-5:** `issue_platform_invoice` · `update_invoice_status` · `record_payment` · `get_platform_invoice` · `list_platform_invoices`. **BC-BILL-6:** `credit_reward` · `track_referral` · `advance_referral` · `get_reward_balance` · `list_referrals`. |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 2).** Convert the frozen Pass-A BC-BILL-4/5/6 contracts into **implementation-grade** contracts: field-level inputs/outputs, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization, processing, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), idempotency, dependencies. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. **Monetization neutrality** is preserved: Billing meters/charges, **never decides** procurement (no matching/routing/ranking/supplier-selection/award/eligibility) and computes/owns **no** Trust/Performance/Verification/Governance score. **Ownership is disjoint and frozen: BC-BILL-4 owns Lead Credit Account only; BC-BILL-5 owns Platform Invoice only; BC-BILL-6 owns Reward Account only** — no shared, duplicate, or leaked ownership. **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED)** — BC-BILL-5 owns no trade invoice, payment record, escrow, wallet, fund custody, or settlement. Carried markers **DF-BILL-1, DF-BILL-2, DF-BILL-4, DF-BILL-8** (the BC-BILL-4/5/6 seams) and **`[ESC-BILL-AUDIT]`, `[ESC-BILL-POLICY]`, `[ESC-BILL-SLUG]`, `[ESC-BILL-EVENT]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt**.

**Actor-branch carry (frozen Pass-A F4I-PA-M1).** The contracts `credit_lead_account`, `debit_lead_account`, `issue_platform_invoice`, `update_invoice_status`, `credit_reward`, `track_referral` are each **one contract-ID with actor-branched authorization** (a single 12-section Pass-B record per Doc-4A §21, with actor-specific authorization branches — org `can_manage_billing` and/or System), exactly as fixed by the frozen Pass-A patch. **Not split into separate contract-IDs.**

---

## §H — Part-2 Hardening Conventions (stated once; bound by pointer per contract)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage. Each Validation row names **Authority · Validation · Failure Class**. **Query contracts: Stage 8 BUSINESS present** — where no business rule applies, stated exactly `n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract`.
- **H.2 — Field types.** `uuid` (UUIDv7), `enum<…>` (fixed by the cited Doc-2 source), `string`, `numeric`, `bool`, `jsonb`, `timestamptz`. **Required** = present and non-null (absence → SYNTAX, Doc-4A §9). Nullable stated per field.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check (Membership + Slug + Scope) OR §6B delegation. Slugs only, from Doc-2 §7; **no slug invented**. Enforcement Identity `check_permission` (Doc-4C). Doc-2 §7 billing slugs: **`can_view_billing`** (Owner, Delegate), **`can_manage_billing`** (Owner). System-actor effects (metering-driven credit/debit, gateway callback, milestone reward) carry no slug. Any org action without an enumerated §7 slug (e.g., reward redemption) → **`[ESC-BILL-SLUG]`** (no slug invented). All org-scoped resources anchor on the **Controlling Organization** (Identity-resolved, DF-BILL-1).
- **H.4 — Error model (Doc-4A §12).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope `error_class, error_code, message, field_errors, retryable, reference_id`; codes `billing_<domain>_<code>`. **`REFERENCE` (definitive negative, `retryable:false`) ≠ `DEPENDENCY` (transient, `retryable:true`)**; **`STATE` (illegal-from-state) ≠ `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4). A user-scoped resource that does not resolve collapses to **`NOT_FOUND`** (protected-fact, §7.5/§12.4) — not `REFERENCE`. `CONFLICT` only where an `expected_status`/row-version assertion token exists on the input.
- **H.5 — State machines (Doc-2 §3.8/§10.8; Doc-4A §13).** **BC-BILL-4:** `lead_credit_accounts` balance head (mutable); `lead_credit_transactions` **append-only**. **BC-BILL-5:** `platform_invoices` `issued → paid | overdue | void`; `platform_payments` `initiated → succeeded | failed | refunded`. **BC-BILL-6:** `reward_accounts` balance head (mutable); `reward_transactions` **append-only**; `referrals` `pending → qualified → rewarded`. Every transition cites source/target/forbidden states (others → `STATE`); a state-transition contract with an `expected_status` token → lost race `CONFLICT`. **No edge added or modified.**
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the §9 action, actor attribution, object scope, in-transaction timing. Reads not audited (§17.1). Doc-2 §9 **Financial** enumerates "platform invoice created, payment status change, refund …" → **BC-BILL-5** invoice/payment mutations bind the named §9 Financial action by pointer. **Lead-credit movement and reward/referral movement are not separately §9-enumerated** → those carry **`[ESC-BILL-AUDIT]`** (nearest §9 action by pointer; no action invented), exactly as frozen in Pass-A §A8.
- **H.7 — Events (Doc-2 §8).** **BC-BILL-4/5/6 emit NO Doc-2 §8 domain event** (the three Billing §8 events `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` are **BC-BILL-2's**, frozen in Part 1 — not here). **BC-BILL-4** consumes the lead-access metering signal (Operations — DF-BILL-4; `[ESC-BILL-EVENT]`; no §8 emission event). **BC-BILL-5** consumes the advertising/microsite metering signal (Marketplace — DF-BILL-2; `[ESC-BILL-EVENT]`) for ad/microsite invoices. **BC-BILL-6** consumes only internal milestone triggers (no §8 reward event exists). Where a contract emits nothing, **No Event** is the binding (valid). No event coined; no event ownership transferred. No 21.2 integration contract authored.
- **H.8 — Idempotency (Doc-4A §14).** Mutations carry `Idempotency: required` + dedup window (`[ESC-BILL-POLICY]`; no `billing` key registered — no key invented). Append-only ledgers (`lead_credit_transactions`, `reward_transactions`) are idempotent on the movement unit (event id / `source_invoice_id` + amount key); `record_payment` idempotent on `(invoice, gateway_ref, target_status)`. Replay within window → one row/transition, no duplicate audit. Queries (21.3) `Idempotency: not-applicable` (§14.1).
- **H.9 — Ownership & boundary (Doc-2 §2/§10.8; Doc-4A §4.1).** **BC-BILL-4 owns Lead Credit Account (`lead_credit_accounts`+`lead_credit_transactions`) only; BC-BILL-5 owns Platform Invoice (`platform_invoices`+`platform_payments`) only; BC-BILL-6 owns Reward Account (`reward_accounts`+`reward_transactions`+`referrals`) only.** No shared/duplicate/leaked ownership. **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED)** — BC-BILL-5 owns no trade invoice/payment-record/escrow/wallet/fund-custody/settlement. **Moat:** no lead-credit/invoice/reward action influences matching/routing/ranking/supplier-selection/award/eligibility; lead credits/rewards are commercial/promotional balances, **never procurement standing**. **Firewall:** no BC computes/owns/modifies any Trust/Performance/Verification/Governance score.
- **H.10 — Field source (Doc-2 §10.8).** `lead_credit_accounts`: `organization_id` (UNIQUE partial), balance head. `lead_credit_transactions`: `→ lead_credit_accounts`, `source_invoice_id`, credit/debit rows (append-only). `platform_invoices`: `→ subscriptions (nullable)`, `organization_id`, `human_ref INV-P-…`, `amount`, `currency`, `status(issued/paid/overdue/void)`, `purpose(subscription/lead_package/advertising/microsite/service)`. `platform_payments`: `→ platform_invoices`, `gateway_ref`, `gateway(sslcommerz/bkash/nagad/bank)`, `status(initiated/succeeded/failed/refunded)`. `reward_accounts`: `organization_id`, points balance head. `reward_transactions`: `→ reward_accounts`, append-only. `referrals`: `referrer_organization_id`, `referred_organization_id`, `state(pending/qualified/rewarded)`.

**Per-contract record shape (Pass-B).** 12 sections: **1 Contract Header · 2 Purpose · 3 Authority · 4 Preconditions · 5 Inputs · 6 Validation · 7 Processing · 8 Events · 9 Audit · 10 Outputs · 11 Errors · 12 Dependencies.**

---

# BC-BILL-4 — Lead Credits (Lead Credit Account aggregate)

## §HB-4.1 — `billing.credit_lead_account.v1` · `billing.debit_lead_account.v1` — Lead-Credit Movement

**1. Contract Header** — Contract IDs `billing.credit_lead_account.v1`, `billing.debit_lead_account.v1` (each one contract-ID, actor-branched — F4I-PA-M1) · Owning BC **BC-BILL-4** · Aggregate **Lead Credit Account** (`lead_credit_transactions`) · Operation **21.4 Command / 21.5 System** · Actor **User / System**.

**2. Purpose** — Append a credit (shortfall credit per Doc-3 §6 `leads.credit_value`; or org purchase) or a debit (lead consumption) transaction; update the balance head. Append-only ledger; lead credits are commercial balance, **never procurement standing**.

**3. Authority** — **`can_manage_billing`** (Owner; org purchase branch) / **System** (shortfall-credit, lead-consumption-debit branch; no slug). Enforcement Identity `check_permission` (Doc-4C); Controlling-Org (DF-BILL-1).

**4. Preconditions** — credit (org branch): active org context + `can_manage_billing`. System branch: a metering/shortfall signal. The org's `lead_credit_accounts` head exists (or is created on first movement). debit: sufficient balance (or recorded as overdraft per commercial rule — `BUSINESS`).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `organization_id` | `uuid` | yes | Doc-2 §10.8 | Controlling Organization (UNIQUE-partial account anchor) |
| `direction` | `enum<credit\|debit>` | yes | Doc-2 §10.8 | selects the contract branch |
| `amount` | `numeric` | yes | Doc-2 §10.8 | > 0 |
| `source_invoice_id` | `uuid` | no | Doc-2 §10.8 | links a credit to a platform invoice (BC-BILL-5; nullable) |
| `source_event_id` | `uuid` | conditional (System branch) | Doc-4A §16 | metering/shortfall event id (idempotency key) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `direction` ∈ enum; `amount` > 0; ids uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | org branch: User + active org context; System branch: System actor (no org context) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | org branch: `can_manage_billing` (Owner); System branch: System metering authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `lead_credit_accounts` is the actor's Controlling Org (org branch; else `NOT_FOUND`); System resolves the target Controlling Org | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present (org branch); else n/a | — |
| 6 STATE | Doc-2 §10.8 | `lead_credit_transactions` append-only (no status machine); balance head updated atomically | — |
| 7 REFERENCE | Doc-4A §4.5 | `source_invoice_id` (if present) resolves to a BC-BILL-5 invoice; Controlling Org resolves (DF-BILL-1) | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-3 §6; Doc-2 §10.8 | debit within available balance (overdraft per commercial rule → `BUSINESS`); credit per `leads.credit_value` or purchase; **no procurement/eligibility decision (moat)** | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2; §6 | shortfall credit value = `leads.credit_value` (named key); dedup window `[ESC-BILL-POLICY]` | — |

**7. Processing** — append one `lead_credit_transactions` row (credit or debit; optional `source_invoice_id`) and update the `lead_credit_accounts` balance head atomically; idempotent on `source_event_id` (System branch). One transaction with the audit write.

**8. Events** — **Consumes** the lead-access metering signal (Operations — DF-BILL-4; `[ESC-BILL-EVENT]`; no §8 emission event) on the System debit branch; idempotent (Doc-4A §16). **Emits none.**

**9. Audit** — Trigger: lead-credit credit / debit · owner Billing · **`[ESC-BILL-AUDIT]`** (lead-credit movement not separately §9-enumerated; nearest by pointer; no action invented) · `entity_type=lead_credit_transactions`, `entity_id`, attribution `User`/`System`, `organization_id` (Controlling Org), via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `transaction_id : uuid`, `organization_id : uuid`, `direction : enum<credit|debit>`, `amount : numeric`, `balance : numeric`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `direction`/`amount`) | false |
| `AUTHORIZATION` | org branch: member without `can_manage_billing` | false |
| `NOT_FOUND` | the `lead_credit_accounts` is not the actor's Controlling Org (protected-fact collapse) | false |
| `REFERENCE` | `source_invoice_id` / Controlling Org does not resolve (definitive) | false |
| `BUSINESS` | debit exceeds available balance (no overdraft allowed per commercial rule) | false |
| `DEPENDENCY` | Operations/Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary (§12.4):** cross-org account → `NOT_FOUND`; `REFERENCE` (invoice/org not found) ≠ `DEPENDENCY` (transient); `BUSINESS` (insufficient balance) ≠ `VALIDATION`. Replay on the same `source_event_id` → one row, no duplicate audit.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Operations (DF-BILL-4):** lead-access metering signal (`[ESC-BILL-EVENT]`). **BC-BILL-5:** `source_invoice_id` reference (read; invoice owned by BC-BILL-5). **Platform Core (DF-BILL-8):** audit, UUIDv7, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-4.2 — `billing.get_lead_balance.v1` · `billing.list_lead_transactions.v1` — Lead-Credit Reads

**1. Contract Header** — Contract IDs `billing.get_lead_balance.v1`, `billing.list_lead_transactions.v1` · Owning BC **BC-BILL-4** · Aggregate **Lead Credit Account** · Operation **21.3 Query** · Actor **User**.

**2. Purpose** — Read the org's lead-credit balance / transaction history.

**3. Authority** — **`can_view_billing`** (Owner, Delegate; Doc-2 §7); recipient-scoped (Controlling Org). Identity `check_permission` (DF-BILL-1).

**4. Preconditions** — Active org context; `can_view_billing`.

**5. Inputs** — *`get_lead_balance`:* `organization_id : uuid (required; Controlling Org)`. *`list_lead_transactions`:* `organization_id : uuid (required)`; `page_size : numeric (optional; `[ESC-BILL-POLICY]`)`; `page_token : string (optional; §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `organization_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_view_billing` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `organization_id` is the actor's Controlling Org (else `NOT_FOUND`) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §10.8 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — get: read the `lead_credit_accounts` balance head for the Controlling Org. list: enumerate `lead_credit_transactions` with pagination. Read-only; scoped to the Controlling Org.

**8. Events** — **No Event** (read).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** *`get_lead_balance`:* `organization_id : uuid`, `balance : numeric`, `reference_id`. *`list_lead_transactions`:* `items : list<object{ transaction_id, direction, amount, source_invoice_id, occurred_at }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (`page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without `can_view_billing`) | false |
| `NOT_FOUND` | `organization_id` not the actor's Controlling Org (protected-fact collapse) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org balance → `NOT_FOUND`; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** read infrastructure, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

# BC-BILL-5 — Platform Invoicing & Payments (Platform Invoice aggregate) — platform invoices only; ≠ trade invoices (FIXED)

## §HB-5.1 — `billing.issue_platform_invoice.v1` — Issue Platform Invoice

**1. Contract Header** — Contract ID `billing.issue_platform_invoice.v1` (one contract-ID, actor-branched — F4I-PA-M1) · Owning BC **BC-BILL-5** · Aggregate **Platform Invoice** (`platform_invoices`) · Operation **21.4 Command** · Actor **User / System**.

**2. Purpose** — Issue a platform invoice (fees owed to iVendorz; purpose ∈ subscription/lead_package/advertising/microsite/service) at `issued`. **Platform invoice only — `≠ operations.trade_invoices` (FIXED).**

**3. Authority** — **`can_manage_billing`** (org self-serve branch; Owner) / **System** (subscription/ad/microsite-driven issue branch; no slug). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — org branch: active org context + `can_manage_billing`. System branch: a billing trigger (subscription/ad/microsite). The debtor `organization_id` resolves.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `organization_id` | `uuid` | yes | Doc-2 §10.8 | debtor org (Controlling Org) |
| `purpose` | `enum<subscription\|lead_package\|advertising\|microsite\|service>` | yes | Doc-2 §10.8 | fixed enum |
| `amount` | `numeric` | yes | Doc-2 §10.8 | > 0 |
| `currency` | `string` | yes | Doc-2 §10.8 | ISO currency |
| `subscription_id` | `uuid` | no | Doc-2 §10.8 | nullable link (`→ subscriptions`; purpose=subscription) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `purpose` ∈ enum; `amount` > 0; `currency` ISO | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | org branch: User + active org; System branch: System actor | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | org branch: `can_manage_billing`; System branch: System authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | the debtor `organization_id` is the actor's Controlling Org (org branch); System resolves the target debtor | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present (org branch); else n/a | — |
| 6 STATE | Doc-2 §3.8/§10.8 | new invoice enters `issued` (no prior state) | — |
| 7 REFERENCE | Doc-4A §4.5 | debtor `organization_id` resolves; `subscription_id` (if present) resolves to a BC-BILL-2 subscription | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-2 §10.8 | invoice is a platform fee (purpose enum); **never a trade invoice (`≠ operations.trade_invoices`, FIXED)**; no procurement decision (moat) | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2 | none (lead_package pricing, if configurable → `[ESC-BILL-POLICY]`) | — |

**7. Processing** — insert `platform_invoices` at `issued` (`organization_id`, `purpose`, `amount`, `currency`, optional `subscription_id`; `human_ref INV-P-…` via Doc-4B). On the advertising/microsite branch the Marketplace metering signal is the trigger. One transaction with the audit write.

**8. Events** — **Consumes** the advertising/microsite metering signal (Marketplace — DF-BILL-2; `[ESC-BILL-EVENT]`) for ad/microsite invoices. **Emits none.**

**9. Audit** — Trigger: platform invoice created · owner Billing · **§9 Financial ("platform invoice created") by pointer** · `entity_type=platform_invoices`, `entity_id`, attribution `User`/`System`, `organization_id`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `invoice_id : uuid`, `human_ref : string (INV-P-…)`, `status : enum<issued|paid|overdue|void> = issued`, `amount : numeric`, `currency : string`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `purpose`/`amount`/`currency`) | false |
| `AUTHORIZATION` | org branch: member without `can_manage_billing` | false |
| `NOT_FOUND` | debtor org not the actor's Controlling Org (protected-fact collapse) | false |
| `REFERENCE` | debtor org / `subscription_id` does not resolve (definitive) | false |
| `BUSINESS` | invoice would violate the platform-fee scope (e.g., misclassified as trade) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org debtor → `NOT_FOUND`; `REFERENCE` ≠ `DEPENDENCY`; the platform/trade boundary is FIXED (BUSINESS guard).

**12. Dependencies** — **Identity (DF-BILL-1):** debtor Controlling-Org/`check_permission`. **Marketplace (DF-BILL-2):** advertising/microsite metering signal (`[ESC-BILL-EVENT]`). **BC-BILL-2:** `subscription_id` reference (read). **Platform Core (DF-BILL-8):** human-ref `INV-P-…`, audit, UUIDv7. **No procurement decision (moat); no Trust score (firewall); no trade-invoice ownership; no ownership transfer.**

---

## §HB-5.2 — `billing.update_invoice_status.v1` — Update Invoice Status

**1. Contract Header** — Contract ID `billing.update_invoice_status.v1` (one contract-ID, actor-branched — F4I-PA-M1) · Owning BC **BC-BILL-5** · Aggregate **Platform Invoice** (`platform_invoices`) · Operation **21.4 Command / 21.5 System** · Actor **User / System**.

**2. Purpose** — Transition invoice status (`issued → paid | overdue | void`). org branch: void; System branch: paid (on payment success) / overdue (on dunning window).

**3. Authority** — **`can_manage_billing`** (void branch; Owner) / **System** (paid/overdue branch; no slug). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — The target `invoice_id` exists and is `issued` (terminal `paid`/`void`; `overdue` may → `paid`/`void`). org void branch: active org context + `can_manage_billing`.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `invoice_id` | `uuid` | yes | Doc-2 §10.8 | target platform invoice |
| `target_status` | `enum<paid\|overdue\|void>` | yes | Doc-2 §10.8 | transition target |
| `expected_status` | `enum<issued\|overdue>` | yes | Doc-4A §14 | optimistic-concurrency assertion |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `invoice_id` uuid; `target_status` ∈ enum | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | void branch: User + active org; paid/overdue branch: System | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | void branch: `can_manage_billing`; System branch: System authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the invoice's debtor is the actor's Controlling Org (void branch; else `NOT_FOUND`); System scope on the row | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present (void branch); else n/a | — |
| 6 STATE | Doc-2 §10.8 | `issued → paid/overdue/void`; `overdue → paid/void`; forbidden from terminal `paid`/`void` → `STATE`; `expected_status` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5; §7.5 | `invoice_id` resolves — **User (void) branch:** the invoice is the debtor org's own resource (user-scoped; protected-fact collapse) → `NOT_FOUND`; **System (paid/overdue) branch:** platform-scope lookup → `REFERENCE` (definitive) / `DEPENDENCY` (transient) | `NOT_FOUND` (User branch) / `REFERENCE` / `DEPENDENCY` (System branch) |
| 8 BUSINESS | Doc-2 §10.8 | status transition is a platform-fee state change; no procurement decision (moat) | — |
| 9 POLICY | Doc-3 §12.2 | overdue dunning window → `[ESC-BILL-POLICY]` | — |

**7. Processing** — transition `platform_invoices.status` under optimistic concurrency (`expected_status`); append the status change. One transaction with the audit write. The paid branch is typically driven by `record_payment` success (§HB-5.3).

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: invoice status change · owner Billing · **`[ESC-BILL-AUDIT]`** (invoice-level status change is not separately enumerated in Doc-2 §9 Financial — "platform invoice created" / "payment status change" enumerated; invoice status transition is not — nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented) · `entity_type=platform_invoices`, `entity_id`, attribution `User`/`System`, via Doc-4B (in-transaction). *(§HB-5.3 `record_payment.v1` retains §9 Financial "payment status change" for `platform_payments` records — unchanged.)*

**10. Outputs** — **Success:** `invoice_id : uuid`, `status : enum<issued|paid|overdue|void>`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `target_status`) | false |
| `AUTHORIZATION` | void branch: member without `can_manage_billing` | false |
| `NOT_FOUND` | invoice debtor not the actor's Controlling Org (void branch; protected-fact collapse) | false |
| `STATE` | illegal transition (e.g., from terminal `paid`/`void`) | false |
| `CONFLICT` | optimistic-concurrency lost race (`expected_status` mismatch) | false |
| `REFERENCE` | `invoice_id` does not resolve (definitive) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `STATE` (illegal transition) ≠ `CONFLICT` (lost race); `REFERENCE` (invoice not found) ≠ `DEPENDENCY`; cross-org void → `NOT_FOUND`.

**12. Dependencies** — **Identity (DF-BILL-1):** debtor Controlling-Org/`check_permission` (void branch). **Platform Core (DF-BILL-8):** audit, UUIDv7, POLICY (dunning). **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-5.3 — `billing.record_payment.v1` — Record Payment (gateway callback)

**1. Contract Header** — Contract ID `billing.record_payment.v1` · Owning BC **BC-BILL-5** · Aggregate **Platform Invoice** (`platform_payments`) · Operation **21.5 System** · Actor **System** (gateway callback).

**2. Purpose** — On a gateway callback, write/transition a `platform_payments` record (`initiated → succeeded | failed | refunded`; `gateway_ref`). Drives the related invoice's `paid` transition (§HB-5.2) on success.

**3. Authority** — none (System; gateway callback; no active org context). No slug.

**4. Preconditions** — A gateway callback for a known `platform_payments` record / `invoice_id`; `gateway_ref` present.

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `invoice_id` | `uuid` | yes | Doc-2 §10.8 | the invoice being paid |
| `gateway` | `enum<sslcommerz\|bkash\|nagad\|bank>` | yes | Doc-2 §10.8 | fixed enum |
| `gateway_ref` | `string` | yes | Doc-2 §10.8 | provider reference (idempotency key) |
| `target_status` | `enum<succeeded\|failed\|refunded>` | yes | Doc-2 §10.8 | transition target |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `gateway` ∈ enum; `target_status` ∈ enum; `gateway_ref` present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2 | System actor; no active org context | `AUTHORIZATION` |
| 3 AUTHZ | Doc-4A §15.5 | System gateway-callback authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | platform/System scope on the payment row | — |
| 5 DELEGATION | Doc-4A §6B | n/a (System) | — |
| 6 STATE | Doc-2 §10.8 | `initiated → succeeded/failed/refunded`; `succeeded → refunded`; forbidden source → `STATE`; idempotent repeat callback = no-op | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | `invoice_id` resolves to a BC-BILL-5 invoice | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-2 §10.8 | payment outcome recording; no procurement decision (moat) | — |
| 9 POLICY | Doc-3 §12.2 | payment-retry/refund window → `[ESC-BILL-POLICY]` | — |

**7. Processing** — write/transition the `platform_payments` row (`gateway`, `gateway_ref`, `target_status`); idempotent on `(invoice_id, gateway_ref, target_status)`; on `succeeded`, drive the invoice `→ paid` (§HB-5.2). One transaction with the audit write.

**8. Events** — **No Event** (H.7 — gateway callback is an infra signal, not a Doc-2 §8 event).

**9. Audit** — Trigger: payment status change / refund · owner Billing · **§9 Financial ("payment status change" / "refund") by pointer** · `entity_type=platform_payments`, `entity_id`, attribution `System`, via Doc-4B (in-transaction).

**10. Outputs** — **`Response: none`** (21.5 System). On success the `platform_payments` row reflects the outcome; failures surface to the calling/gateway handler per Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `gateway`/`target_status`/`gateway_ref`) | false |
| `STATE` | illegal payment transition (e.g., from a terminal state) | false |
| `REFERENCE` | `invoice_id` does not resolve (definitive) | false |
| `DEPENDENCY` | gateway/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `STATE` (illegal transition) ≠ `CONFLICT`; `REFERENCE` (invoice not found) ≠ `DEPENDENCY` (gateway transient). Replay on the same `gateway_ref` → no duplicate payment row / audit.

**12. Dependencies** — **Platform Core (DF-BILL-8):** payment-gateway infra, audit, UUIDv7, POLICY. **BC-BILL-5 (`update_invoice_status`):** drives the invoice `→ paid` on success (intra-BC). **No procurement decision (moat); no Trust score (firewall); no trade-settlement ownership; no ownership transfer.**

---

## §HB-5.4 — `billing.get_platform_invoice.v1` · `billing.list_platform_invoices.v1` — Invoice Reads

**1. Contract Header** — Contract IDs `billing.get_platform_invoice.v1`, `billing.list_platform_invoices.v1` · Owning BC **BC-BILL-5** · Aggregate **Platform Invoice** · Operation **21.3 Query** · Actor **User**.

**2. Purpose** — Read the debtor org's platform invoice(s) + payment status.

**3. Authority** — **`can_view_billing`** (debtor org view; Doc-2 §7). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — Active org context; `can_view_billing`.

**5. Inputs** — *`get_platform_invoice`:* `invoice_id : uuid (required)`. *`list_platform_invoices`:* `organization_id : uuid (required; debtor Controlling Org)`; `filter : object{ status?, purpose? } (optional; allowlisted, §9.6)`; `page_size : numeric (optional; `[ESC-BILL-POLICY]`)`; `page_token : string (optional; §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; `invoice_id` uuid (get); only allowlisted filter fields | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_view_billing` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the invoice debtor is the actor's Controlling Org (else `NOT_FOUND`) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §10.8 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | get: `invoice_id` resolves (else `NOT_FOUND`) | `NOT_FOUND` |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — get: fetch `platform_invoices` (+ `platform_payments` status) by `invoice_id`, scoped to the debtor org. list: enumerate the debtor org's invoices with allowlisted filters + pagination. Read-only.

**8. Events** — **No Event** (read).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** *`get_platform_invoice`:* `invoice : object{ invoice_id, human_ref, organization_id, purpose, amount, currency, status, payments:list<object{ gateway, gateway_ref, status }> }`, `reference_id`. *`list_platform_invoices`:* `items : list<object{ invoice_id, human_ref, purpose, amount, currency, status }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without `can_view_billing`) | false |
| `NOT_FOUND` | invoice debtor not the actor's Controlling Org (protected-fact collapse) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org invoice → `NOT_FOUND`; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** debtor Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** read infrastructure, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

# BC-BILL-6 — Rewards & Referrals (Reward Account aggregate)

## §HB-6.1 — `billing.credit_reward.v1` — Credit Reward Points

**1. Contract Header** — Contract ID `billing.credit_reward.v1` (one contract-ID, actor-branched — F4I-PA-M1) · Owning BC **BC-BILL-6** · Aggregate **Reward Account** (`reward_transactions`) · Operation **21.4 Command / 21.5 System** · Actor **User / System**.

**2. Purpose** — Append a reward-point transaction (profile completion / reviews / completions — System milestone; or org redemption); update the balance head. Append-only ledger; reward points are promotional balance, **never procurement standing**.

**3. Authority** — **System** (event/milestone-driven credit branch; no slug) / **`can_manage_billing`** (org redemption branch, if org-initiated; where no enumerated §7 slug applies → **`[ESC-BILL-SLUG]`**; no slug invented). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — System branch: a milestone trigger (profile completion / review / completion). org redemption branch: active org context + the applicable slug. The org's `reward_accounts` head exists (or is created on first movement).

**5. Inputs**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `organization_id` | `uuid` | yes | Doc-2 §10.8 | Controlling Organization |
| `direction` | `enum<credit\|redeem>` | yes | Doc-2 §10.8 | selects the branch |
| `points` | `numeric` | yes | Doc-2 §10.8 | > 0 |
| `reason` | `enum<profile_completion\|review\|completion\|redemption>` | yes | Doc-2 §10.8 | reward reason |
| `source_event_id` | `uuid` | conditional (System branch) | Doc-4A §16 | milestone event id (idempotency key) |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `direction`/`reason` ∈ enum; `points` > 0 | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | System branch: System actor; org redemption branch: User + active org | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | System branch: System authority (no slug); org redemption branch: `can_manage_billing` / `[ESC-BILL-SLUG]` (no slug invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `reward_accounts` is the actor's Controlling Org (org branch; else `NOT_FOUND`); System resolves the target org | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present (org branch); else n/a | — |
| 6 STATE | Doc-2 §10.8 | `reward_transactions` append-only (no status machine); balance head updated atomically | — |
| 7 REFERENCE | Doc-4A §4.5 | Controlling Org resolves (DF-BILL-1) | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-2 §10.8 | redeem within available balance (insufficient → `BUSINESS`); **reward points are promotional, never procurement standing (moat)** | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2 | reward-point values / redemption rules → `[ESC-BILL-POLICY]`; dedup window `[ESC-BILL-POLICY]` | — |

**7. Processing** — append one `reward_transactions` row (credit or redeem) and update the `reward_accounts` balance head atomically; idempotent on `source_event_id` (System branch). One transaction with the audit write.

**8. Events** — **No Event** (H.7 — milestone triggers are internal/consumed; no §8 reward event exists; emits/consumes no Doc-2 §8 domain event).

**9. Audit** — Trigger: reward credit / redemption · owner Billing · **`[ESC-BILL-AUDIT]`** (reward movement not separately §9-enumerated; nearest by pointer; no action invented) · `entity_type=reward_transactions`, `entity_id`, attribution `User`/`System`, `organization_id`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `transaction_id : uuid`, `organization_id : uuid`, `direction : enum<credit|redeem>`, `points : numeric`, `balance : numeric`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `direction`/`reason`/`points`) | false |
| `AUTHORIZATION` | org branch: missing applicable slug (`[ESC-BILL-SLUG]`) | false |
| `NOT_FOUND` | the `reward_accounts` is not the actor's Controlling Org (protected-fact collapse) | false |
| `BUSINESS` | redeem exceeds available balance | false |
| `REFERENCE` | Controlling Org does not resolve (definitive) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org account → `NOT_FOUND`; `BUSINESS` (insufficient points) ≠ `VALIDATION`; `REFERENCE` ≠ `DEPENDENCY`. Replay on the same `source_event_id` → one row, no duplicate audit.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** audit, UUIDv7, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-6.2 — `billing.track_referral.v1` · `billing.advance_referral.v1` — Referral Tracking

**1. Contract Header** — Contract IDs `billing.track_referral.v1`, `billing.advance_referral.v1` (each one contract-ID, actor-branched — F4I-PA-M1) · Owning BC **BC-BILL-6** · Aggregate **Reward Account** (`referrals`) · Operation **21.4 Command / 21.5 System** · Actor **User / System**.

**2. Purpose** — Create a referral (`pending`) and advance it (`pending → qualified → rewarded`). org branch: org self-initiates a referral; System branch: qualification/reward milestone advances it.

**3. Authority** — **`can_manage_billing`** (org self branch; Owner) / **System** (qualification/reward-milestone branch; no slug). Identity `check_permission`; Controlling-Org (DF-BILL-1).

**4. Preconditions** — track: active org context + `can_manage_billing`; the `referrer_organization_id` is the actor's Controlling Org. advance: an existing referral at a valid source state.

**5. Inputs**

*`track_referral`:*

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `referrer_organization_id` | `uuid` | yes | Doc-2 §10.8 | the actor's Controlling Org |
| `referred_organization_id` | `uuid` | yes | Doc-2 §10.8 | the referred org (bare UUID) |

*`advance_referral`:*

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `referral_id` | `uuid` | yes | Doc-2 §10.8 | the referral to advance |
| `target_state` | `enum<qualified\|rewarded>` | yes | Doc-2 §10.8 | transition target |
| `expected_state` | `enum<pending\|qualified>` | yes | Doc-4A §14 | optimistic-concurrency assertion |

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; ids uuid; `target_state` ∈ enum (advance) | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | track: User + active org; advance: System (milestone) or User | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | track: `can_manage_billing`; advance User branch: `can_manage_billing` (the referrer org advances its own referral); advance System branch: System authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | track: `referrer_organization_id` is the actor's Controlling Org (else `NOT_FOUND`); advance: the referral's referrer org scope | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present (org branch); else n/a | — |
| 6 STATE | Doc-2 §10.8 | track: new referral enters `pending`; advance: `pending → qualified → rewarded` (forbidden source → `STATE`); `expected_state` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5; §7.5 | `referred_organization_id` resolves (track); `referral_id` resolves (advance) — **User branch:** `referral_id` is the referrer org's own resource (user-scoped; protected-fact collapse) → `NOT_FOUND`; **System branch:** platform-scope lookup → `REFERENCE` (definitive) / `DEPENDENCY` (transient) | `NOT_FOUND` (User branch) / `REFERENCE` / `DEPENDENCY` (System branch) |
| 8 BUSINESS | Doc-2 §10.8 | referral reward is promotional; no procurement decision (moat); duplicate referrer→referred pair per commercial rule → `BUSINESS` | `BUSINESS` |
| 9 POLICY | Doc-3 §12.2 | referral reward rules / qualification window → `[ESC-BILL-POLICY]` | — |

**7. Processing** — track: insert `referrals` at `pending` (`referrer_organization_id`, `referred_organization_id`). advance: transition `pending → qualified → rewarded` under optimistic concurrency (`expected_state`); on `rewarded`, the reward credit is a separate `credit_reward` movement (§HB-6.1). One transaction with the audit write.

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: referral create / advance · owner Billing · **`[ESC-BILL-AUDIT]`** (referral movement not separately §9-enumerated; nearest by pointer; no action invented) · `entity_type=referrals`, `entity_id`, attribution `User`/`System`, via Doc-4B (in-transaction).

**10. Outputs** — **Success:** `referral_id : uuid`, `state : enum<pending|qualified|rewarded>`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad ids / `target_state`) | false |
| `AUTHORIZATION` | track: member without `can_manage_billing` | false |
| `NOT_FOUND` | referrer org / referral not in the actor's scope (protected-fact collapse) | false |
| `STATE` | illegal referral transition (forbidden source) | false |
| `CONFLICT` | optimistic-concurrency lost race (`expected_state` mismatch) | false |
| `REFERENCE` | `referred_organization_id` / `referral_id` does not resolve (definitive) | false |
| `BUSINESS` | duplicate referrer→referred pair (per commercial rule) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** `STATE` (illegal transition) ≠ `CONFLICT` (lost race); `REFERENCE` (org/referral not found) ≠ `DEPENDENCY`; cross-org → `NOT_FOUND`.

**12. Dependencies** — **Identity (DF-BILL-1):** referrer/referred Controlling-Org/`check_permission`. **BC-BILL-6 (`credit_reward`):** the reward on `rewarded` is a separate movement (intra-BC). **Platform Core (DF-BILL-8):** audit, UUIDv7, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## §HB-6.3 — `billing.get_reward_balance.v1` · `billing.list_referrals.v1` — Reward / Referral Reads

**1. Contract Header** — Contract IDs `billing.get_reward_balance.v1`, `billing.list_referrals.v1` · Owning BC **BC-BILL-6** · Aggregate **Reward Account** · Operation **21.3 Query** · Actor **User**.

**2. Purpose** — Read the org's reward balance / referral list.

**3. Authority** — **`can_view_billing`** (Owner, Delegate; Doc-2 §7); recipient-scoped (Controlling Org). Identity `check_permission` (DF-BILL-1).

**4. Preconditions** — Active org context; `can_view_billing`.

**5. Inputs** — *`get_reward_balance`:* `organization_id : uuid (required; Controlling Org)`. *`list_referrals`:* `organization_id : uuid (required; referrer Controlling Org)`; `page_size : numeric (optional; `[ESC-BILL-POLICY]`)`; `page_token : string (optional; §22.3)`.

**6. Validation**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `organization_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_view_billing` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | the `organization_id` is the actor's Controlling Org (else `NOT_FOUND`) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present; else n/a | — |
| 6 STATE | Doc-2 §10.8 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-BILL-POLICY]`) | `VALIDATION` |

**7. Processing** — get: read the `reward_accounts` balance head for the Controlling Org. list: enumerate `referrals` for the referrer Controlling Org with pagination. Read-only; scoped to the Controlling Org.

**8. Events** — **No Event** (read).

**9. Audit** — **None** (reads not audited — §17.1).

**10. Outputs** — **Success:** *`get_reward_balance`:* `organization_id : uuid`, `balance : numeric`, `reference_id`. *`list_referrals`:* `items : list<object{ referral_id, referred_organization_id, state }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**11. Errors**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (`page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without `can_view_billing`) | false |
| `NOT_FOUND` | `organization_id` not the actor's Controlling Org (protected-fact collapse) | false |
| `DEPENDENCY` | Identity/Doc-4B transient | true |
| `SYSTEM` | unexpected | true |

**Error Boundary:** cross-org reward/referral → `NOT_FOUND`; `REFERENCE` ≠ `DEPENDENCY`.

**12. Dependencies** — **Identity (DF-BILL-1):** Controlling-Org/`check_permission`. **Platform Core (DF-BILL-8):** read infrastructure, POLICY. **No procurement decision (moat); no Trust score (firewall); no ownership transfer.**

---

## Appendix A — BC-BILL-4/5/6 Part-2 Contract Register (Pass-B)

| § | Contract-ID | Operation | Owning BC | Aggregate | Actor | Permission | Emits event | Audit |
|---|---|---|---|---|---|---|---|---|
| §HB-4.1 | `credit_lead_account` · `debit_lead_account` | 21.4 Command / 21.5 System | BC-BILL-4 | Lead Credit Account (`lead_credit_transactions`) | User / System | `can_manage_billing` / System | consumes lead-access (`[ESC-BILL-EVENT]`); emits none | `[ESC-BILL-AUDIT]` |
| §HB-4.2 | `get_lead_balance` · `list_lead_transactions` | 21.3 Query | BC-BILL-4 | Lead Credit Account | User | `can_view_billing` | No Event | none (read) |
| §HB-5.1 | `issue_platform_invoice` | 21.4 Command | BC-BILL-5 | Platform Invoice (`platform_invoices`) | User / System | `can_manage_billing` / System | consumes ad/microsite (`[ESC-BILL-EVENT]`); emits none | §9 Financial (pointer) |
| §HB-5.2 | `update_invoice_status` | 21.4 Command / 21.5 System | BC-BILL-5 | Platform Invoice | User / System | `can_manage_billing` / System | No Event | §9 Financial (pointer) |
| §HB-5.3 | `record_payment` | 21.5 System | BC-BILL-5 | Platform Invoice (`platform_payments`) | System | none (System) | No Event | §9 Financial (pointer) |
| §HB-5.4 | `get_platform_invoice` · `list_platform_invoices` | 21.3 Query | BC-BILL-5 | Platform Invoice | User | `can_view_billing` | No Event | none (read) |
| §HB-6.1 | `credit_reward` | 21.4 Command / 21.5 System | BC-BILL-6 | Reward Account (`reward_transactions`) | User / System | System / `can_manage_billing` (`[ESC-BILL-SLUG]`) | No Event | `[ESC-BILL-AUDIT]` |
| §HB-6.2 | `track_referral` · `advance_referral` | 21.4 Command / 21.5 System | BC-BILL-6 | Reward Account (`referrals`) | User / System | `can_manage_billing` / System | No Event | `[ESC-BILL-AUDIT]` |
| §HB-6.3 | `get_reward_balance` · `list_referrals` | 21.3 Query | BC-BILL-6 | Reward Account | User | `can_view_billing` | No Event | none (read) |

**Part-2 invariants (held):** the hardened contracts are the verbatim frozen Pass-A §A4.4/§A4.5/§A4.6 set — **14 contract-IDs** (BC-BILL-4: 4; BC-BILL-5: 5; BC-BILL-6: 5); no contract added/renamed/omitted; the six actor-branched contracts (`credit_lead_account`/`debit_lead_account`/`issue_platform_invoice`/`update_invoice_status`/`credit_reward`/`track_referral`) are one contract-ID each (F4I-PA-M1; not split). **Ownership is disjoint:** BC-BILL-4 owns **Lead Credit Account only**; BC-BILL-5 owns **Platform Invoice only**; BC-BILL-6 owns **Reward Account only** — no shared, duplicate, or leaked ownership. **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED)** — BC-BILL-5 owns no trade invoice/payment-record/escrow/wallet/fund-custody/settlement. **Events:** these three BCs emit **no** Doc-2 §8 event (the three subscription events are BC-BILL-2's, frozen in Part 1); BC-BILL-4 consumes the lead-access signal and BC-BILL-5 the advertising/microsite signal (`[ESC-BILL-EVENT]`; no §8 emission event); no event coined; no event ownership transferred. Every mutation binds `[ESC-BILL-AUDIT]` or a named §9 Financial action by pointer (no audit action invented). Lifecycles verbatim Doc-2 §3.8/§10.8 (`platform_invoices issued→paid/overdue/void`; `platform_payments initiated→succeeded/failed/refunded`; `referrals pending→qualified→rewarded`; lead-credit / reward transactions append-only). `STATE ≠ CONFLICT` and `REFERENCE ≠ DEPENDENCY` separated throughout; user-scoped resources collapse to `NOT_FOUND`. **Procurement moat held** — no lead-credit/invoice/reward action influences matching/routing/ranking/supplier-selection/award/eligibility; credits/rewards are commercial/promotional, never procurement standing. **Trust firewall held** — no BC computes/owns/modifies any Trust/Performance/Verification/Governance score. **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 2; unchanged)

- **DF-BILL-1** (Identity — Controlling-Org/`check_permission`), **DF-BILL-2** (Marketplace — ad/microsite metering signal, `[ESC-BILL-EVENT]`; BC-BILL-5), **DF-BILL-4** (Operations — lead-access metering signal, `[ESC-BILL-EVENT]`; BC-BILL-4), **DF-BILL-8** (Platform Core — audit/UUIDv7/POLICY/payment-gateway infra). *(DF-BILL-5 Trust appears only as the firewall negative-assertion — no score; DF-BILL-3 RFQ / DF-BILL-6 Communication / DF-BILL-7 Admin are not active seams for BC-BILL-4/5/6.)*
- **`[ESC-BILL-AUDIT]`** (Doc-2 §9 additive) — lead-credit movement, reward/referral movement (no enumerated §9 action; nearest by pointer; no action invented). *(BC-BILL-5 invoice/payment mutations bind the named §9 Financial action by pointer — not the marker.)*
- **`[ESC-BILL-SLUG]`** (Doc-2 §7 additive) — reward redemption where no enumerated §7 slug applies; carried; no slug invented.
- **`[ESC-BILL-POLICY]`** (Doc-3 §12.2 additive) — dedup/page-size/dunning-window/payment-retry/reward-value/referral-reward keys; `leads.credit_value` (Doc-3 §6) is the named key for lead shortfall credit; no `billing` POLICY namespace registered; no other key invented.
- **`[ESC-BILL-EVENT]`** (Doc-2 §8 additive) — the lead-access (BC-BILL-4) and advertising/microsite (BC-BILL-5) metering signals (no §8 emission event); carried; no event coined.

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4I — Pass-B (Hardening) Part 2 v1.0 — BC-BILL-4 / BC-BILL-5 / BC-BILL-6. Authored against `Doc-4I_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4I_Structure_v1.0` (FROZEN); the prior `Doc-4I_PassB_Part1_v1.0_FROZEN` (BC-BILL-1/2/3) is not reopened. Hardens the frozen Pass-A §A4.4/§A4.5/§A4.6 set — 14 contract-IDs (BC-BILL-4: credit/debit_lead_account, get_lead_balance/list_lead_transactions; BC-BILL-5: issue_platform_invoice, update_invoice_status, record_payment, get_platform_invoice/list_platform_invoices; BC-BILL-6: credit_reward, track_referral/advance_referral, get_reward_balance/list_referrals) — to implementation grade (field-level inputs/outputs, Doc-4A §11.2 nine-stage validation, processing, audit bindings, event bindings, error registers with §12.4 boundaries + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency, dependencies) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. Ownership is disjoint and frozen (BC-BILL-4 Lead Credit Account; BC-BILL-5 Platform Invoice; BC-BILL-6 Reward Account — no leakage); `billing.platform_invoices ≠ operations.trade_invoices` (FIXED); these three BCs emit no Doc-2 §8 event (the three subscription events are BC-BILL-2's); BC-BILL-4/5 consume the lead-access / advertising-microsite metering signals (`[ESC-BILL-EVENT]`); lifecycles are verbatim Doc-2 §3.8/§10.8; every mutation carries `[ESC-BILL-AUDIT]` or a named §9 Financial action by pointer (no action invented); the procurement moat (credits/rewards never procurement standing; no influence on matching/routing/ranking/supplier-selection/award/eligibility) and the trust firewall (no score owned/computed/modified) are preserved; Billing meters/charges, never decides; nothing invented. The six actor-branched contracts are one contract-ID each (frozen Pass-A F4I-PA-M1; not split). Carried markers DF-BILL-1/DF-BILL-2/DF-BILL-4/DF-BILL-8, `[ESC-BILL-AUDIT]`/`[ESC-BILL-SLUG]`/`[ESC-BILL-POLICY]`/`[ESC-BILL-EVENT]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN. With this Part frozen, Module-7 Billing Pass-B is contract-complete (all 6 BCs); proceed to Module Consolidation Review → Final Freeze Audit.*

---

## Module Colophon — Cross-BC Signal-Consumption Map (F4I-CONS-N1)

*The Module Consolidation Review (`Doc-4I_Module_Consolidation_Review_v1.0`) carried one NITPICK (F4I-CONS-N1): the module lacked an explicit module-level map of the dual-consumer metering signals. Each consuming contract already documents its own consumption in its Section 12 Dependencies; this map is an orientation aid only and changes no contract.*

| Metering signal | Source (marker) | Consumed by | Consumer purpose |
|---|---|---|---|
| Lead-access signal | Operations — DF-BILL-4 (`[ESC-BILL-EVENT]`) | BC-BILL-3 | observability (usage ledger) |
| Lead-access signal | Operations — DF-BILL-4 (`[ESC-BILL-EVENT]`) | BC-BILL-4 | commercial balance (lead-credit debit) |
| Advertising / microsite signal | Marketplace — DF-BILL-2 (`[ESC-BILL-EVENT]`) | BC-BILL-3 | observability (usage ledger) |
| Advertising / microsite signal | Marketplace — DF-BILL-2 (`[ESC-BILL-EVENT]`) | BC-BILL-5 | invoice issuance (ad/microsite platform invoice) |

No signal is ambiguous; no ownership is undefined; no authorization is missing. The map is non-normative — the authoritative binding for each consumption remains the consuming contract's Section 12.

---

## Freeze Certificate — Doc-4I_FROZEN_v1.0

```text
Document         : Doc-4I_FROZEN_v1.0
Module           : 7 — Billing / Monetization  (schema `billing`, namespace `billing_`)
Bounded contexts : BC-BILL-1 … BC-BILL-6  (6)
Aggregates       : 7   (Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account)
Contract-IDs     : 32  (Part 1: 18 — BC-BILL-1: 8, BC-BILL-2: 7, BC-BILL-3: 3; Part 2: 14 — BC-BILL-4: 4, BC-BILL-5: 5, BC-BILL-6: 5)
Governance base  : Doc-4I_PassA_v1.0_FROZEN
Implementation   : Doc-4I_PassB_Part1_v1.0_FROZEN + Doc-4I_PassB_Part2_v1.0_FROZEN  (both folded inline, byte-faithful)
Consolidation    : Doc-4I_Module_Consolidation_Review_v1.0  (PASS; F4I-CONS-N1 non-blocking → colophon map above)
Freeze authority : Doc-4I_Final_Freeze_Audit_v1.0  (FINAL FREEZE APPROVED)
Open findings    : BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0
§8 events        : SubscriptionPurchased / SubscriptionRenewed / SubscriptionExpired  (BC-BILL-2 only)
Invariants held  : disjoint ownership; platform_invoices ≠ trade_invoices (FIXED);
                   procurement moat held; trust firewall held; nothing invented.
Status           : FROZEN — 2026-06-19
```

*Doc-4I_FROZEN_v1.0 — authoritative frozen specification for Module 7 (Billing / Monetization). Governance base Doc-4I_PassA_v1.0_FROZEN; implementation base Doc-4I_PassB_Part1_v1.0_FROZEN + Doc-4I_PassB_Part2_v1.0_FROZEN folded inline; consolidated by Doc-4I_Module_Consolidation_Review_v1.0 (PASS); approved by Doc-4I_Final_Freeze_Audit_v1.0 (FINAL FREEZE APPROVED). FROZEN.*
