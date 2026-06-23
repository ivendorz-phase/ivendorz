# Doc-4I — Billing / Monetization Engine — Pass-B (Hardening) Part 2 v1.0 — BC-BILL-4 / BC-BILL-5 / BC-BILL-6

| Field | Value |
|---|---|
| Document | Doc-4I — **Pass-B Part 2 v1.0** — Module 7 Billing (`billing` schema, `billing_` namespace) |
| Part scope | **BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals** — the frozen Pass-A §A4.4/§A4.5/§A4.6 contracts, hardened to implementation grade. |
| Status | **Pass-B Part 2 draft — implementation-grade contract specification for BC-BILL-4/5/6.** Independently reviewable. Suitable for Hard Review → Patch → Patch Verification → Freeze Audit. |
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
| 7 REFERENCE | Doc-4A §4.5 | `invoice_id` resolves | `REFERENCE` / `DEPENDENCY` |
| 8 BUSINESS | Doc-2 §10.8 | status transition is a platform-fee state change; no procurement decision (moat) | — |
| 9 POLICY | Doc-3 §12.2 | overdue dunning window → `[ESC-BILL-POLICY]` | — |

**7. Processing** — transition `platform_invoices.status` under optimistic concurrency (`expected_status`); append the status change. One transaction with the audit write. The paid branch is typically driven by `record_payment` success (§HB-5.3).

**8. Events** — **No Event** (H.7).

**9. Audit** — Trigger: invoice status change · owner Billing · **§9 Financial ("payment status change") by pointer** · `entity_type=platform_invoices`, `entity_id`, attribution `User`/`System`, via Doc-4B (in-transaction).

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
| 3 AUTHZ | Doc-2 §7 | track: `can_manage_billing`; advance System branch: System authority (no slug) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | track: `referrer_organization_id` is the actor's Controlling Org (else `NOT_FOUND`); advance: the referral's referrer org scope | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | representative-org grant if present (org branch); else n/a | — |
| 6 STATE | Doc-2 §10.8 | track: new referral enters `pending`; advance: `pending → qualified → rewarded` (forbidden source → `STATE`); `expected_state` mismatch → `CONFLICT` | `STATE` / `CONFLICT` |
| 7 REFERENCE | Doc-4A §4.5 | `referred_organization_id` resolves (track); `referral_id` resolves (advance) | `REFERENCE` / `DEPENDENCY` |
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
