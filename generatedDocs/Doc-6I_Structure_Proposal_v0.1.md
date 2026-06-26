# Doc-6I — M7 Monetization / Billing (`billing`) Schema Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1 → effective v0.2** — Independent Hard Review applied (2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). For Structure Freeze Audit → FROZEN |
| Module | **M7 — Monetization / Billing** (`billing` schema). The **platform's OWN revenue** (`platform_invoices ≠ operations.trade_invoices`); the **billing firewall** (no billing state gates trust/eligibility/routing/matching); **entitlements (boolean/numeric/enum), never plan-name checks** (Financial Tier ≠ Subscription Plan) |
| Realizes | **Doc-2 §10.8** — **13 tables / 6 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4I (M7 contracts, consumed) **+ `Doc-4I_ActivatePlan_Additive_Patch_v1.0`**; Doc-3 v1.0.2 **+ v1.6 (`billing.*` POLICY — registered, 2 keys)**; Doc-6B (`core`); Doc-6C/6D (UUID); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.6), Doc-4A v1.0, Doc-4I v1.0 (FROZEN), Doc-4L/4M, Doc-6A…6H v1.0 (FROZEN) |
| Contains | Structure only — section map, 13-table partition, ratified decisions (BL-CR1–CR12), entitlement model, the billing firewall, the platform-revenue boundary, §5.7 machine, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Platform's own revenue:** M7 charges **its own customers** (subscriptions, lead packages, ads, microsite, service) via `platform_payments` (gateway) — **this IS platform money**, distinct from the **buyer↔vendor TRADE** money the platform never touches (M4). **`platform_invoices ≠ operations.trade_invoices`** (firewall). **Billing firewall (Invariant #6/#10):** no billing state gates trust/eligibility/routing/matching; **entitlements**, never plan-name; **Financial Tier (M5) ≠ Subscription Plan (M7)**. RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.8 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed at structure freeze (BL-CR-set)

- **BL-CR1 — 13 tables / 6 groupings (Doc-2 §10.8), coin nothing.** Plans & Entitlements (`plans`+`entitlements`+`plan_entitlements`) · Subscriptions (`subscriptions`+`subscription_events`) · Usage (`usage_ledger`) · Lead Credits (`lead_credit_accounts`+`lead_credit_transactions`) · Platform Invoicing (`platform_invoices`+`platform_payments`) · Rewards/Referrals (`reward_accounts`+`reward_transactions`+`referrals`). *(reward acc/tx = 2 tables.)* A 14th is non-conformant.
- **BL-CR2 — The platform's OWN revenue (`platform_invoices ≠ operations.trade_invoices`).** M7 charges **its own customers** (subscriptions/lead-packages/advertising/microsite/service); `platform_payments` = the **gateway** (sslcommerz/bkash/nagad/bank) collecting **platform** revenue. **This is platform money — distinct from buyer↔vendor TRADE money** (M4, which the platform never holds). **No FK to `operations`**; the two invoice tables are firewalled.
- **BL-CR3 — The billing firewall (Invariant #6/#10; Doc-5I R5).** **No billing state gates trust/eligibility/routing/matching.** A subscription/payment/quota state **never** affects a procurement decision; no M3/M5 read of a `billing` column. Billing is commercial, isolated.
- **BL-CR4 — Entitlements, never plan-name checks (Invariant #10).** The app resolves **entitlements** (`type boolean/numeric/enum` + `value_jsonb`) via an internal service (`resolve_entitlements`), **never** "if plan == X". **Financial Tier (M5 capability) ≠ Subscription Plan (M7 commercial)** — firewall. `entitlements.slug` UNIQUE.
- **BL-CR5 — Subscription §5.7 + one-active partial-unique.** `subscriptions.state` §5.7 (A-06: `pending_payment/active/expired`); **`partial UNIQUE(organization_id) WHERE state='active'`** (one active sub per org). Entitlements resolve **only** from an `active` subscription (else the Basic profile — A-11); `auto_renew`; `period_start/end`.
- **BL-CR6 — Usage/quota (`usage_ledger`).** Append-only; **attribution always to the Controlling Org**; `quota_key`/`amount`/`period`/`source(rfq_response/lead_access/ad_launch)`; `acting_user_id`/`consuming_entity_id`; `enforce_quota` internal service. **Never a procurement decision** (firewall).
- **BL-CR7 — Lead credits.** `lead_credit_accounts` (balance head; `organization_id` UNIQUE partial) + `lead_credit_transactions` (credit/debit, append-only; `source_invoice_id` → `platform_invoices`).
- **BL-CR8 — Platform invoicing.** `platform_invoices` (`human_ref INV-P-…`; `amount`+`currency`; `status(issued/paid/overdue/void)`; `purpose(subscription/lead_package/advertising/microsite/service)`; → `subscriptions` nullable) + `platform_payments` (`gateway`; `status(initiated/succeeded/failed/refunded)`; **`record_payment` = gateway callback, NOT a §8 event** — Doc-5I R8). Ad-invoice referenced by M2 `advertisements.platform_invoice_id` (DD-MKT; M2 holds the bare UUID).
- **BL-CR9 — Subscription events.** `subscription_events` append-only (purchase/renew/expire/cancel rows); **only the subscription lifecycle emits the 3 §8 events** (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` — Doc-5I R9); none coined.
- **BL-CR10 — Rewards/Referrals.** `reward_accounts` (points balance — **points, not money**) + `reward_transactions` (append-only); `referrals` `state(pending/qualified/rewarded)`.
- **BL-CR11 — POLICY: registered (Doc-3 v1.6); `[ESC-6-POLICY]` CLEARED.** 2 `billing.*` keys; read from `core.system_configuration`. **`human_ref` carrier = `platform_invoices` only** (`INV-P-…` via `core.allocate_human_ref`).
- **BL-CR12 — Append-only + status-tracked + indexing.** Ledgers/events/transactions append-only (immutable); invoices/payments status-tracked (column-scoped); `subscriptions`/`lead_credit_accounts` partial-uniques; cursor indexes. Carried: DD-MKT (ad invoice), DD-CORE (subscription events), **`[ESC-BILL-AUDIT]`** (billing audit actions vs Doc-2 §9 — confirm at content).

## The `billing` schema partition (the structural spine)

| Doc-2 §10.8 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `plans` | Plans & Entitlements | platform catalog; public-read | YES (retire) | `is_active` | §3.1 |
| `entitlements` · `plan_entitlements` | ↳ | platform catalog | NO | — | §3.1 |
| `subscriptions` | Subscriptions | `organization_id` | YES | **§5.7** | §3.2 |
| `subscription_events` | ↳ | `organization_id` | NO (append-only) | event rows | §3.2 |
| `usage_ledger` | Usage | controlling `organization_id` | NO (append-only) | — | §3.3 |
| `lead_credit_accounts` | Lead Credits | `organization_id` (UNIQUE partial) | YES | balance | §3.4 |
| `lead_credit_transactions` | ↳ | `organization_id` | NO (append-only) | credit/debit | §3.4 |
| `platform_invoices` | Platform Invoicing | `organization_id` + platform | NO | `status` | §3.5 |
| `platform_payments` | ↳ | `organization_id` + platform (gateway) | NO | `status` | §3.5 |
| `reward_accounts` | Rewards/Referrals | `organization_id` | YES | balance | §3.6 |
| `reward_transactions` | ↳ | `organization_id` | NO (append-only) | credit/debit | §3.6 |
| `referrals` | ↳ | referrer `organization_id` | NO | `state` | §3.6 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4I → Doc-6A → Doc-6B…6H → **Doc-6I** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-MKT/CORE, `[ESC-BILL-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.6). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.8`; `Doc-4I`.

## §1 — Scope & the `billing` Table Partition
Governs 13 tables / not (procurement/trust/trade money = M3/M5/M4; ad placement = M2 — by UUID/event/service). The platform-revenue boundary, the billing firewall, entitlements-not-plan. **Deps:** `Doc-2 §2/§10.8`; `Doc-4I`; `Doc-6A §1`.

## §2 — Tenancy, Firewall & RLS Model *(load-bearing)*
Classes: **platform catalog** (`plans`/`entitlements`/`plan_entitlements` — public-read, admin-write); **org-tenant** (subscriptions/usage/lead-credits/invoices/payments/rewards/referrals — `organization_id`). **Billing firewall (#6/#10):** no billing state read by M3/M5; entitlements not plan-name; Financial Tier ≠ Subscription Plan. **Platform-revenue boundary:** `platform_invoices ≠ operations.trade_invoices`; the gateway collects platform money only. RLS = backstop; authz app-layer (Doc-4I). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.8`; `Doc-6A §4`; `Doc-4I`.

## §3 — Per-Aggregate Realization
§3.1 Plans & Entitlements (catalog; entitlement type/value; `activate_plan` Doc-4I patch) · §3.2 Subscriptions (§5.7; one-active partial-unique; events emit 3 §8) · §3.3 Usage (append-only; controlling-org attribution; enforce_quota) · §3.4 Lead Credits (account+transactions) · §3.5 Platform Invoicing (INV-P-…; gateway payments; record_payment = callback) · §3.6 Rewards/Referrals (points; referral state). **Deps:** `Doc-2 §5.7/§10.8`; `Doc-4I`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization (Doc-2 §5.7)
`subscriptions.state` §5.7 (pending_payment/active/expired) · `platform_invoices.status` · `platform_payments.status` · `referrals.state`; enum + CHECK; service transitions; subscription lifecycle emits the 3 §8 events (Doc-5I R9); `record_payment` = gateway callback (not a §8 event — R8); transitions → `core.outbox_events` per Doc-2 §8. **Deps:** `Doc-2 §5.7/§8/§10.8`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/CORE)
Bare-UUID + service + event: M2 ad placement holds `platform_invoice_id` (DD-MKT; M2's bare UUID); subscription events → consumers. **Billing firewall:** no billing state gates trust/eligibility/routing/matching; entitlements via `resolve_entitlements` (internal service, never a procurement decision); **platform money ≠ trade money** (no `operations` link). No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4I`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5I lists; `subscriptions` one-active partial-unique; `lead_credit_accounts` partial-unique; `usage_ledger(organization_id, quota_key, period)`; `platform_invoices(organization_id, status)`; partial `WHERE deleted_at IS NULL` (SD tables); page-size via `billing.*` POLICY. **Deps:** `Doc-5I`; `Doc-6A §10/§12`; `Doc-3 v1.6`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → plans → entitlements → plan_entitlements → subscriptions → subscription_events → usage_ledger → lead_credit_accounts → lead_credit_transactions → platform_invoices → platform_payments → reward_accounts → reward_transactions → referrals → indexes → triggers → RLS); POLICY = Doc-3 v1.6 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.6`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C catalog/org-tenant + billing firewall; Band D append-only ledgers/events; Band F amount+currency on monetary tables; CHK-6-002 `platform_invoices` human_ref only); carried register (DD-MKT/CORE, `[ESC-BILL-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.8`.

## Appendix A — Doc-6I Conformance Attestation map (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (platform catalog public-read; org-tenant; **billing firewall** — no billing state gates procurement; CHK-6-020/023) · Band D PASS (append-only ledgers/events/transactions; invoices/payments column-scoped) · Band E PASS (CHK-6-040 subscription/invoice transitions+outbox; CHK-6-041 3 subscription §8 events; `record_payment`=callback; `[ESC-BILL-AUDIT]`) · Band F PASS (CHK-6-050 plans/usage/invoices/payments amount+currency; rewards = points not money) · CHK-6-002 PASS (`platform_invoices` `INV-P-…` only) · CHK-6-005 PASS (subscription/lead-account partial-uniques; entitlement slug UNIQUE). **Deps:** `Doc-6A Appendix A`; `Doc-5I`.

---

## Open Carried Items
| ID | Item | Doc-6I handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5I persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-CORE | ad invoice (M2 holds UUID) / subscription events | bare UUID + event | No |
| **Billing firewall (#6/#10)** | no billing state gates procurement; entitlements not plan; Tier ≠ Plan | no M3/M5 billing read; entitlement service | **Load-bearing** |
| **Platform-revenue boundary** | `platform_invoices ≠ trade_invoices`; gateway = platform money only | no `operations` link; trade money untouched | **Load-bearing** |
| **`[ESC-BILL-AUDIT]`** | billing audit actions vs Doc-2 §9 | bind nearest §9 by pointer | No (content: bind) |
| `[ESC-6-POLICY]` | `billing.*` keys | **CLEARED** — Doc-3 v1.6 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5I gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`billing` table · procurement/matching (M3) · trust/scores (M5) · buyer↔vendor TRADE money (M4) · ad placement (M2) · coining any element · a cross-schema FK · cross-schema RLS traversal · **a billing state gating a procurement/trust decision** · **`platform_invoices` linked to `operations.trade_invoices`** · **a plan-name check** (entitlements only) · DDL/Prisma/migration bodies (content passes).

---

## Review Disposition (Independent Hard Review — Structure)

Reviewer: independent. Field-traced to Doc-2 §10.8/§5.7. Verified CORRECT: 13-table set (reward acc/tx = 2), §5.7 state set verbatim, invoice/payment/referral/entitlement-type/billing-cycle/gateway/purpose/source sets verbatim, subscription one-active partial-unique, the `≠ trade_invoices` firewall, the 2 `billing.*` keys (Doc-3 v1.6), `human_ref` = platform_invoices only, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **PLAT-MONEY** the platform-revenue vs buyer↔vendor-money distinction under-specified (risk of conflating M7 gateway with the no-custody rule) | MAJOR | **FIXED** — BL-CR2/§2: M7 collects **its own** subscription/ad revenue (gateway = platform money); the **trade** money (M4) is the untouched buyer↔vendor flow; `platform_invoices ≠ trade_invoices` (no link). |
| **FIREWALL** the billing firewall (no billing state gates procurement) stated weakly | MAJOR | **FIXED** — BL-CR3/§5: binding — no M3/M5 read of a billing column; entitlements not plan-name; Financial Tier ≠ Subscription Plan. |
| **ENT-PLAN** entitlement-vs-plan-name could be read as advisory | MINOR | **FIXED** — BL-CR4: `resolve_entitlements` (boolean/numeric/enum), never a plan-name check (Invariant #10). |
| **PAY-EVENT** `record_payment` event status | MINOR | **CONFIRMED** — gateway callback, **not** a §8 event (Doc-5I R8); only the 3 subscription events are §8 (R9). |
| **BILL-AUDIT** billing audit actions vs §9 | NIT | **CONFIRMED carried** — `[ESC-BILL-AUDIT]`. |

**Net:** 2 MAJOR (platform-revenue boundary, billing firewall) + 2 MINOR + 1 NIT fixed/confirmed. The platform-revenue + firewall findings are load-bearing — M7 is commercial, isolated from procurement; its money is its own, never the trade flow. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6I Structure Proposal v0.1 (effective v0.2 — Independent Hard Review applied). For Structure Freeze Audit → FROZEN. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6I realizes the 13 `billing` tables verbatim from Doc-2 §10.8 against frozen Doc-6A — the platform's own revenue (`platform_invoices ≠ trade_invoices`); the billing firewall (no billing state gates procurement); entitlements never plan-name; coins nothing. Next: Structure Freeze Audit.*
