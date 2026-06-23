# Doc-4I_PassA_v1.0_FROZEN — Billing / Monetization Engine — Content Pass-A (FROZEN Consolidation)

| Freeze Metadata | Value |
|---|---|
| Status | **FROZEN** |
| Source | `Doc-4I_PassA_Content_v1.0` |
| Amendment | `Doc-4I_PassA_Patch_v1.0` (F4I-PA-M1, F4I-PA-M2 — applied inline below) |
| Freeze Authority | `Doc-4I_PassA_Freeze_Audit_v1.0` |
| Patch Verification | `Doc-4I_PassA_Patch_Verification_v1.0` — PASS |
| Board Status | **APPROVED FOR FREEZE** |
| Hard Review | `Doc-4I_PassA_Independent_Hard_Review_v1.0` — patched (F4I-PA-M1/M2 CLOSED) |
| Freeze References | Architecture · ADR · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4H (FROZEN) · `Doc-4I_Structure_v1.0` (FROZEN) |
| Consolidation rule | Source Pass-A body preserved; the two approved patch corrections (F4I-PA-M1 disambiguation notes; F4I-PA-M2 `expire_subscription` audit → `[ESC-BILL-AUDIT]` + A8 split) are applied inline. No ownership/BC/aggregate/event-ownership/moat/firewall change; A12 counts unchanged. |
| Sole authority for Pass-B | This frozen document. Not revisited, not redesigned, not reopened. |

---

# Doc-4I — Billing / Monetization Engine — API & Integration Contracts — Content Pass-A v1.0

| Field | Value |
|---|---|
| Document | Doc-4I — **Content Pass-A v1.0** — implementation-grade contract inventory + governance records for Module 7 — Billing / Monetization (`billing` schema, `billing_` namespace) |
| Status | **Pass-A — contract structure (inventory + governance records), pre-hardening.** Not structure design, not a freeze audit, not Pass-B. Next stage: Independent Hard Review → Pass-A Patch → Patch Verification → Pass-A FROZEN → Pass-B. |
| Structure authority | `Doc-4I_Structure_Proposal_v0.1` as amended by `Doc-4I_Structure_Patch_v1.0`, verified by `Doc-4I_Structure_Patch_Verification_v1.0`, **APPROVED FOR FREEZE** by `Doc-4I_Structure_Freeze_Audit_v1.0` (sole structure authority; **not revisited, not redesigned, not reopened**) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v1.0, Doc-4H v1.0 — all FROZEN |
| Contains | Pass-A depth: module/BC/aggregate overviews, **contract inventory only** (no 12-section per-contract hardening — that is Pass-B), event/dependency/permission/audit/POLICY inventories, moat + firewall validation, Pass-B planning matrix. |
| Audience | Doc-4I Pass-B authors; Claude Code / Cursor / OpenAI Codex / backend / frontend / QA |

**Family-map confirmation (recorded).** **Doc-4I = Billing (Module 7, `billing` schema)** — Doc-4A §1.3, Appendix B (`billing_` → Doc-4I), Doc-2 §0.3. No family-map conflict; no flag-and-halt.

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

To honor reference-never-restate (Doc-4A §0.3) and avoid duplication, the following apply to **every** contract; per-contract records cite specifics and reference these by pointer.

- **B.1 — Contract-ID & templates (Doc-4A §21).** Contract-ID `billing.<operation>.v1` (prefix = schema `billing`; Appendix B namespace `billing_`). Templates: **21.3 Query** (reads), **21.4 Command** (org-actor mutations/state-transitions), **21.5 System** (`Response: none` — System-actor metering/gateway-callback effects on Billing's own entities), **21.6 Admin** (platform-staff catalog/governance actions without active org context — plan/entitlement catalog). **Template 21.2 (Integration) is NOT instantiated by Billing's consumers** — per Doc-4A §4.4 the emitting module authors event production; Billing authors its own consumer/metering effects on its own entities (single-authorship). Billing **does** author the production of its own three §8 subscription events (it is their emitter). No template invented.
- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set User|Admin|System|AI Agent).** **User** (tenant member in a server-validated active-org context, §5.3 — subscription/credit/invoice/reward management for the org); **Admin** (platform-staff, no active org context, §5.6 — plan/entitlement **catalog** governance, platform-owned); **System** (metering writers — usage recording on consumed signals; gateway-callback payment-status writers). No actor category invented.
- **B.3 — Identifiers (Doc-4A §8; Doc-2 §0.1).** UUIDv7 is the only canonical machine ID; human-reference `INV-P-…` for platform invoices (Doc-2 §10.8, via Doc-4B). Cross-module references (`organization_id` incl. **Controlling Organization**, `acting_user_id`, `consuming_entity_id`, `quotation_id`/`rfq_id`, `vendor_lead_id`/`engagement_id`, `plan_id`, `entitlement_id`, `subscription_id`, `source_invoice_id`, `gateway_ref`, `referrer_organization_id`/`referred_organization_id`) are **bare UUIDs, service-validated, no cross-schema FK** (Doc-2 §0.3, §10.8).
- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR an active **Delegation Grant** (§6B). **Slugs only** (§6.2), from the Doc-2 §7 catalog; **no slug invented**. Billing **consumes** Identity's `check_permission` and org/membership/active-org + **Controlling Organization** resolution (Doc-4C, FROZEN). The Doc-2 §7 billing slugs are: **`can_view_billing`** (Owner, Delegate) and **`can_manage_billing`** (Owner). Platform-owned catalog management (plans/entitlements) and any metering/gateway-callback action without an enumerated §7 slug → **`[ESC-BILL-SLUG]`** (Doc-2 §7 additive; no slug invented). System-actor metering carries no tenant slug.
- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Doc-2 §9 enumerates a **Financial** domain ("platform invoice created, payment status change, refund, subscription purchase/renewal/cancel") and an **Organization** domain ("subscription change"); **no `billing`-schema audit domain per aggregate** is enumerated (usage recording, lead-credit movement, reward/referral crediting, plan/entitlement catalog changes are not separately listed). Every audited Billing mutation binds the **nearest enumerated §9 Financial/Organization action by pointer**; where a mutation lacks explicit §9 coverage it carries **`[ESC-BILL-AUDIT]`** (no audit action invented), written in-transaction via the Doc-4B mechanism. **Reads are not audited** (§17.1).
- **B.6 — Events (Doc-2 §8 via Doc-4B outbox-write/consume).** **Billing produces exactly three Doc-2 §8 domain events** — `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired` (producer `billing` / `subscriptions`, BC-BILL-2; single-authorship — Billing owns their production). Billing **consumes** upstream metered-action signals (the §8 `QuotationSubmitted` from RFQ → usage; the Operations lead-access and Marketplace advertising/microsite metering signals — carried as `[ESC-BILL-EVENT]`, no §8 emission event exists). Each consumer is idempotent (Doc-4A §16). **No event invented beyond the Doc-2 §8 billing catalog; events absent from Doc-2 §8 are not added.**
- **B.7 — Monetization neutrality & firewall (Doc-4A §4.4/§4B; Project Instructions; ADR).** Billing meters and charges; it owns **none** of vendor discovery/ranking/matching/routing/quotation-evaluation/supplier-selection/award (RFQ/Operations) and computes/owns **no** Trust/Performance/Verification/Governance score (Trust/Doc-4G). **A paid plan / entitlement / quota / lead credit never influences Trust, Verification, Eligibility, Routing fairness, or Matching confidence** — paid plans may influence only Visibility, Lead volume, Analytics, Advertising, and Microsite capabilities. Entitlement resolution is an enforcement read, never a routing/eligibility decision. **`billing.platform_invoices ≠ operations.trade_invoices` (FIXED)** — Billing owns no trade invoice, payment record, escrow, wallet, fund custody, or settlement.
- **B.8 — AI-agent source rule.** Every contract record states its **owning BC / aggregate / actor / permission-family / lifecycle / audit / event source** by pointer, so AI agents implement without architectural assumptions. Global constraints: consume frozen Doc-4B/Doc-4C services; honor the Doc-2 §3.8/§5.7/§10.8 lifecycles verbatim; meter/charge but never decide procurement/score; produce only the three §8 subscription events; never invent an entity/event/slug/audit-action/POLICY-key/template (escalate via DF / `[ESC-BILL-*]`).

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Purpose · Owning BC · Aggregate · Operation (template) · Actor · Permission family · Lifecycle impact · Audit · Events · Cross-Module · Sources.** Where several contracts share an aggregate, they are grouped; each still carries its own record. **This is inventory + governance depth only — no 12-section hardening (Pass-B).**

---

## A1 — Module Overview

- **Purpose:** Establish Doc-4I as the contract document for **Module 7 — Billing / Monetization only**, the platform-revenue and entitlement layer (`billing` schema, `billing_` namespace). Carry platform revenue, subscriptions, plan management, entitlements, usage metering, quota enforcement, lead credits, platform invoices, rewards, and referrals — **without owning buyer↔vendor commerce**.
- **Responsibilities:** Plans, Entitlements, Subscriptions, Usage metering, Quota enforcement, Lead Credits, Platform Invoices (fees owed to iVendorz), Platform Payments, Rewards, Referrals (the seven Module-7 aggregates: Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account).
- **Ownership:** the `billing` schema; emits its three §8 subscription events; usage attribution always anchors on the **Controlling Organization** (Doc-2 §2; regardless of acting representative).
- **Exclusions:** buyer↔vendor commerce — **trade invoices** (`operations.trade_invoices`, Operations/Doc-4F; **`≠ billing.platform_invoices`, FIXED**), payment records, procurement finance, escrow, wallet, fund custody, settlement; any Trust/Performance/Verification/Governance score (Trust/Doc-4G); any procurement decision (matching/routing/ranking/evaluation/selection/award — RFQ/Operations); any module other than Module 7.

---

## A2 — Bounded Context Overview

Per the frozen structure (`Doc-4I_Structure_v1.0` §I3/§I4) — 6 bounded contexts owning 7 aggregates, each aggregate in exactly one context.

| Bounded context | Purpose | Owned aggregate(s) | Pass-A contract section |
|---|---|---|---|
| **BC-BILL-1 — Plans & Entitlements** | platform-owned commercial plan catalog + entitlement definitions | Plan (`plans` + `plan_entitlements`), Entitlement (`entitlements`) | **A4.1** |
| **BC-BILL-2 — Subscriptions** | per-org subscription lifecycle; entitlement-resolution source of truth; sole §8 subscription-event producer | Subscription (`subscriptions` + `subscription_events`) | **A4.2** |
| **BC-BILL-3 — Usage & Quota** | append-only usage metering + entitlement-bounded quota enforcement | Usage Ledger (`usage_ledger`) | **A4.3** |
| **BC-BILL-4 — Lead Credits** | lead-credit balances + append-only movements | Lead Credit Account (`lead_credit_accounts` + `lead_credit_transactions`) | **A4.4** |
| **BC-BILL-5 — Platform Invoicing & Payments** | platform invoices (fees owed to iVendorz) + gateway payment records | Platform Invoice (`platform_invoices` + `platform_payments`) | **A4.5** |
| **BC-BILL-6 — Rewards & Referrals** | bonus-point ledger + referral tracking | Reward Account (`reward_accounts` + `reward_transactions`, `referrals`) | **A4.6** |

**Responsibilities + dependencies (per BC):**
- **BC-BILL-1** — catalog management (plan create/activate/retire; entitlement-catalog definition; plan→entitlement bundling). *Dependencies:* Platform Core (audit/POLICY — DF-BILL-8); Admin catalog governance (DF-BILL-7, carried). **Platform-owned catalog; resolves no org-specific state.**
- **BC-BILL-2** — subscription lifecycle (purchase/cancel/renew/expire/repurchase per §5.7); **entitlement-resolution authority** (resolves from the `active` subscription + BC-BILL-1 bundle; Basic profile otherwise — A-11); emits the three §8 events. *Dependencies:* Identity (org/Controlling-Org resolution, `check_permission` — DF-BILL-1); Platform Core (audit/outbox/POLICY — DF-BILL-8); Communication (consumes the events for fan-out — DF-BILL-6, consumer-side).
- **BC-BILL-3** — usage recording (System metering on consumed signals; `source` ∈ rfq_response/lead_access/ad_launch; attribution to the Controlling Org) + quota inquiry + entitlement-bounded enforcement. **Entitlement-read seam:** reads resolved entitlement truth from **BC-BILL-2 (authority)** by an intra-module read at enforcement time (holds/owns/resolves no entitlement; read-binding carried as `[ESC-BILL-POLICY]`). *Dependencies:* Identity (Controlling-Org — DF-BILL-1); RFQ (`QuotationSubmitted` — DF-BILL-3); Operations (lead-access — DF-BILL-4); Marketplace (advertising/microsite — DF-BILL-2); Platform Core (POLICY/audit — DF-BILL-8).
- **BC-BILL-4** — lead-credit credit/debit (append-only transactions; e.g., shortfall credit per Doc-3 §6 `leads.credit_value`) + balance read. *Dependencies:* Identity (org — DF-BILL-1); Platform Core (audit/POLICY — DF-BILL-8).
- **BC-BILL-5** — platform-invoice issue + status transition (`issued→paid/overdue/void`); payment-record capture + gateway-callback status (`initiated→succeeded/failed/refunded`). *Dependencies:* Identity (debtor org — DF-BILL-1); Platform Core (audit, payment-gateway infra, POLICY — DF-BILL-8); Communication (invoice notifications — DF-BILL-6, consumer-side). **Platform invoices only; `≠ trade_invoices` (FIXED).**
- **BC-BILL-6** — reward-point credit (profile completion/reviews/completions) + referral tracking (`pending→qualified→rewarded`) + balance read. *Dependencies:* Identity (org — DF-BILL-1); Platform Core (audit/POLICY — DF-BILL-8).

---

## A3 — Aggregate Catalog

Per the frozen structure §I5 (Doc-2 §2, Module 7) — 7 aggregates, each in exactly one BC; **no ownership change**. *(Lifecycle summary only — no state-machine depth; Pass-B.)*

| Aggregate | Owner BC | Purpose | Lifecycle summary (Doc-2 §3.8/§5.7/§10.8) | Authority |
|---|---|---|---|---|
| **Plan** — root `plans`; child `plan_entitlements` | BC-BILL-1 | commercial plan catalog (marketing configuration) | `draft → active → retired` | platform-owned (Doc-2 §2/§3.8) |
| **Entitlement** — root `entitlements` (catalog); VO EntitlementType (boolean/numeric/enum) | BC-BILL-1 | entitlement slug catalog + bundle definitions | simple (catalog; no status machine) | platform-owned (Doc-2 §2/§3.8) |
| **Subscription** — root `subscriptions`; child `subscription_events`; VO BillingCycle | BC-BILL-2 | per-org subscription; entitlement-resolution source of truth | `pending_payment → active → expired` (+ renew/cancel/repurchase, §5.7); `subscription_events` append-only | tenant-owned (org); §8 producer (Doc-2 §2/§5.7) |
| **Usage Ledger** — root `usage_ledger` (append-only); VO QuotaKey | BC-BILL-3 | quota consumption, attributed to the Controlling Organization | append-only | tenant-owned (consuming/Controlling Org) (Doc-2 §2/§3.8) |
| **Lead Credit Account** — root `lead_credit_accounts`; child `lead_credit_transactions` | BC-BILL-4 | lead-credit balances + movements | account balance head (mutable); transactions append-only | tenant-owned (Doc-2 §2/§3.8) |
| **Platform Invoice** — root `platform_invoices`; child `platform_payments`; VO GatewayRef | BC-BILL-5 | fees owed to iVendorz + gateway payment records | invoice `issued → paid/overdue/void`; payment `initiated → succeeded/failed/refunded` | tenant-owned (debtor org) + platform (Doc-2 §2/§3.8) |
| **Reward Account** — root `reward_accounts`; children `reward_transactions`, `referrals` | BC-BILL-6 | bonus points + referral tracking | account balance head (mutable); transactions append-only; referral `pending → qualified → rewarded` | tenant-owned (Doc-2 §2/§3.8) |

**No aggregate added beyond the Doc-2 §2 Module-7 set; no aggregate in two contexts; `operations.trade_invoices` is Operations-owned (`≠ platform_invoices`, FIXED), not a Module-7 aggregate.**

---

## A4 — Contract Inventory

Candidate contracts required for Pass-B, **inventory only** — no hardening, no 12-section records. Derived from the frozen structure (6 BCs / 7 aggregates) and the Doc-2 §3.8/§5.7/§10.8 lifecycles. Operation template + actor + permission family by pointer (§B).

### A4.1 — BC-BILL-1 Plans & Entitlements (Plan, Entitlement aggregates)

> Binds Doc-2 §3.8/§10.8 (`plans`/`plan_entitlements`/`entitlements`). **Platform-owned catalog** (Admin actor; no enumerated §7 tenant slug → `[ESC-BILL-SLUG]`).

#### `billing.create_plan.v1` · `billing.update_plan.v1` · `billing.retire_plan.v1` — Plan Catalog · 21.6 Admin · Actor: Admin
- **Purpose:** create / update / retire a commercial plan (marketing configuration: name, billing_cycle, price, currency). **Owning BC:** BC-BILL-1. **Aggregate:** Plan (`plans`). **Permission family:** platform-staff catalog management — no enumerated §7 slug → **`[ESC-BILL-SLUG]`** (no slug invented). **Lifecycle:** `plans` `draft → active → retired` (Doc-2 §3.8). **Audit:** `[ESC-BILL-AUDIT]` (nearest §9 by pointer; catalog change not separately enumerated). **Events:** none emitted; none consumed. **Cross-Module:** Admin governance (DF-BILL-7); Platform Core (DF-BILL-8). **Sources:** Doc-2 §3.8/§10.8.

#### `billing.bundle_plan_entitlement.v1` — Plan→Entitlement Bundle · 21.6 Admin · Actor: Admin
- **Purpose:** map a plan to its entitlement bundle (`plan_entitlements`; `value_jsonb`). **Owning BC:** BC-BILL-1. **Aggregate:** Plan (`plan_entitlements`). **Permission family:** `[ESC-BILL-SLUG]`. **Lifecycle:** `plan_entitlements` simple (mapping). **Audit:** `[ESC-BILL-AUDIT]`. **Events:** none. **Cross-Module:** Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.create_entitlement.v1` · `billing.update_entitlement.v1` — Entitlement Catalog · 21.6 Admin · Actor: Admin
- **Purpose:** define / update an entitlement slug (boolean/numeric/enum; `slug UNIQUE`, `default_value`). **Owning BC:** BC-BILL-1. **Aggregate:** Entitlement (`entitlements`). **Permission family:** `[ESC-BILL-SLUG]`. **Lifecycle:** simple (catalog). **Audit:** `[ESC-BILL-AUDIT]`. **Events:** none. **Cross-Module:** Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.get_plan.v1` · `billing.list_plans.v1` — Plan/Entitlement Reads · 21.3 Query · Actor: User / Admin
- **Purpose:** read the public plan catalog / entitlement definitions (plan selection). **Owning BC:** BC-BILL-1. **Aggregate:** Plan / Entitlement. **Permission family:** catalog is platform-owned, public-readable for plan selection (`[ESC-BILL-SLUG]` if a distinct read slug is later required). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8.

### A4.2 — BC-BILL-2 Subscriptions (Subscription aggregate)

> Binds Doc-2 §5.7 (Subscription machine; A-06), §3.8/§10.8 (`subscriptions`/`subscription_events`), §8 (the three producer events). **Entitlement-resolution authority.**

#### `billing.purchase_subscription.v1` — Purchase Subscription · 21.4 Command · Actor: User
- **Purpose:** purchase a subscription for the active org (→ `pending_payment`; on payment confirmation → `active`). **Owning BC:** BC-BILL-2. **Aggregate:** Subscription (`subscriptions`). **Permission family:** `can_manage_billing` (Owner; Doc-2 §7). **Lifecycle:** `pending_payment → active` (Doc-2 §5.7); appends a `subscription_events` row. **Audit:** §9 Financial/Organization ("subscription purchase") by pointer. **Events:** **emits `SubscriptionPurchased`** (B.6; single-authorship). **Cross-Module:** Identity (Controlling-Org, `check_permission` — DF-BILL-1); Platform Core (outbox/audit — DF-BILL-8); Communication consumes the event (DF-BILL-6). **Sources:** Doc-2 §5.7/§8/§10.8.

#### `billing.cancel_subscription.v1` — Cancel Subscription · 21.4 Command · Actor: User
- **Purpose:** cancel (Owner only; sets `auto_renew=false`; runs to period end — no immediate state change). **Owning BC:** BC-BILL-2. **Aggregate:** Subscription. **Permission family:** `can_manage_billing`. **Lifecycle:** `active` (auto_renew=false) per Doc-2 §5.7; `subscription_events` append. **Audit:** §9 ("subscription cancel") by pointer. **Events:** none at cancel (expiry event fires at period end). **Cross-Module:** Identity (DF-BILL-1); Platform Core (DF-BILL-8). **Sources:** Doc-2 §5.7.

#### `billing.renew_subscription.v1` · `billing.expire_subscription.v1` — Subscription Period Transition · 21.5 System · Actor: System
- **Purpose:** at period end — renew (`auto_renew` + payment ok → `active`, `SubscriptionRenewed`) or expire (`auto_renew=false` or payment failure → `expired`, `SubscriptionExpired`). **Owning BC:** BC-BILL-2. **Aggregate:** Subscription. **Permission family:** none (System; period-end job). **Lifecycle:** `active → active` (renew) / `active → expired` (Doc-2 §5.7); `subscription_events` append. **Audit:** renew → §9 Financial ("subscription renewal") by pointer; **expire → `[ESC-BILL-AUDIT]`** (subscription expiry is **not** separately enumerated in Doc-2 §9 Financial — "subscription purchase/renewal/cancel" enumerated; expiry is not — nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented). *(F4I-PA-M2)* **Events:** **emits `SubscriptionRenewed` / `SubscriptionExpired`** (B.6). **Cross-Module:** Platform Core (outbox/audit — DF-BILL-8); Communication consumes (DF-BILL-6). **Sources:** Doc-2 §5.7/§8.

#### `billing.resolve_entitlements.v1` — Resolve Entitlements · 21.3 Query · Actor: User / System
- **Purpose:** resolve the org's effective entitlements from the `active` subscription + BC-BILL-1 bundle (Basic profile otherwise — A-11); the **entitlement-resolution authority** read consumed intra-module by BC-BILL-3 enforcement. **Owning BC:** BC-BILL-2. **Aggregate:** Subscription (+ BC-BILL-1 Entitlement catalog, read). **Permission family:** `can_view_billing` (org self) / System (intra-module enforcement read). **Lifecycle:** none (read). **Audit:** none (read). **Events:** none. **Cross-Module:** Identity (Controlling-Org — DF-BILL-1); intra-module read seam → BC-BILL-3 (read-binding `[ESC-BILL-POLICY]`). **Sources:** Doc-2 §5.7 (A-11); frozen structure §I4 (F4I-MA1 seam).

#### `billing.get_subscription.v1` · `billing.list_subscription_events.v1` — Subscription Reads · 21.3 Query · Actor: User
- **Purpose:** read the org's subscription head / its event history. **Owning BC:** BC-BILL-2. **Aggregate:** Subscription. **Permission family:** `can_view_billing` (Owner, Delegate). **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DF-BILL-1). **Sources:** Doc-2 §10.8.

### A4.3 — BC-BILL-3 Usage & Quota (Usage Ledger aggregate)

> Binds Doc-2 §10.8 (`usage_ledger`; `source` ∈ rfq_response/lead_access/ad_launch; attribution to Controlling Org). **Reads entitlement truth from BC-BILL-2 (authority) — intra-module seam; read-binding `[ESC-BILL-POLICY]`.**

#### `billing.record_usage.v1` — Record Usage · 21.5 System · Actor: System
- **Purpose:** on a consumed metered-action signal, append a `usage_ledger` row (`quota_key`, `amount`, `period`, `source`); attribution **always to the Controlling Organization** (regardless of acting representative). **Owning BC:** BC-BILL-3. **Aggregate:** Usage Ledger (`usage_ledger`). **Permission family:** none (System metering). **Lifecycle:** append-only (Doc-2 §10.8). **Audit:** `[ESC-BILL-AUDIT]` (usage recording not separately §9-enumerated). **Events:** **consumes** `QuotationSubmitted` (RFQ — DF-BILL-3; `source=rfq_response`); **consumes** the lead-access (Operations — DF-BILL-4; `source=lead_access`) and advertising/microsite (Marketplace — DF-BILL-2; `source=ad_launch`) signals — the latter two carried as **`[ESC-BILL-EVENT]`** (no §8 emission event); idempotent (Doc-4A §16). Emits none. **Cross-Module:** Identity (Controlling-Org — DF-BILL-1); RFQ/Operations/Marketplace (metering inputs); Platform Core (DF-BILL-8). **Sources:** Doc-2 §8/§10.8.

#### `billing.enforce_quota.v1` — Enforce Quota · 21.3 Query · Actor: User / System
- **Purpose:** evaluate whether a metered action is within the org's entitlement-bounded quota (an entitlement check; **never a routing/eligibility decision** — moat). Reads resolved entitlement from **BC-BILL-2** (`billing.resolve_entitlements.v1`) intra-module + the org's `usage_ledger` balance. **Owning BC:** BC-BILL-3. **Aggregate:** Usage Ledger (read) + BC-BILL-2 entitlement (read). **Permission family:** `can_view_billing` (org self) / System (enforcement at the metered action). **Lifecycle:** none (read/decision). **Audit:** none (read). **Events:** none. **Cross-Module:** BC-BILL-2 entitlement read (intra-module; `[ESC-BILL-POLICY]`); Identity (Controlling-Org — DF-BILL-1). **Sources:** frozen structure §I4 (F4I-MA1); Doc-2 §10.8.

#### `billing.get_usage.v1` — Quota Inquiry · 21.3 Query · Actor: User
- **Purpose:** read the org's usage/quota balance for a `quota_key`/period. **Owning BC:** BC-BILL-3. **Aggregate:** Usage Ledger. **Permission family:** `can_view_billing`; recipient-scoped (Controlling Org). **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DF-BILL-1). **Sources:** Doc-2 §10.8.

### A4.4 — BC-BILL-4 Lead Credits (Lead Credit Account aggregate)

> Binds Doc-2 §10.8 (`lead_credit_accounts`/`lead_credit_transactions`; `source_invoice_id`). Shortfall crediting references Doc-3 §6 `leads.credit_value`.

#### `billing.credit_lead_account.v1` · `billing.debit_lead_account.v1` — Lead-Credit Movement · 21.4 Command / 21.5 System · Actor: User / System *(F4I-PA-M1: each of `credit_lead_account.v1` and `debit_lead_account.v1` is one contract-ID, actor-branched — single 12-section Pass-B record per Doc-4A §21; not split; A12 count unchanged.)*
- **Purpose:** append a credit (e.g., shortfall credit per `leads.credit_value`; purchase) or debit (lead consumption) transaction; update the balance head. **Owning BC:** BC-BILL-4. **Aggregate:** Lead Credit Account (`lead_credit_transactions`). **Permission family:** `can_manage_billing` (org purchase) / System (shortfall credit, lead-consumption debit). **Lifecycle:** transactions append-only; balance head mutable (Doc-2 §10.8). **Audit:** `[ESC-BILL-AUDIT]` (lead-credit movement not separately §9-enumerated). **Events:** consumes the lead-access signal (Operations — DF-BILL-4; `[ESC-BILL-EVENT]`); emits none. **Cross-Module:** Identity (DF-BILL-1); may reference `source_invoice_id` (BC-BILL-5); Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8; Doc-3 §6 (`leads.credit_value`).

#### `billing.get_lead_balance.v1` · `billing.list_lead_transactions.v1` — Lead-Credit Reads · 21.3 Query · Actor: User
- **Purpose:** read the org's lead-credit balance / transaction history. **Owning BC:** BC-BILL-4. **Aggregate:** Lead Credit Account. **Permission family:** `can_view_billing`. **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DF-BILL-1). **Sources:** Doc-2 §10.8.

### A4.5 — BC-BILL-5 Platform Invoicing & Payments (Platform Invoice aggregate)

> Binds Doc-2 §10.8 (`platform_invoices`/`platform_payments`; `human_ref INV-P-…`; purpose subscription/lead_package/advertising/microsite/service; gateway sslcommerz/bkash/nagad/bank). **Platform invoices only; `≠ trade_invoices` (FIXED).**

#### `billing.issue_platform_invoice.v1` — Issue Platform Invoice · 21.4 Command · Actor: User / System *(F4I-PA-M1: one contract-ID, actor-branched — single Pass-B record per Doc-4A §21; org `can_manage_billing` / System branches; not split.)*
- **Purpose:** issue a platform invoice (fees owed to iVendorz; purpose ∈ subscription/lead_package/advertising/microsite/service) at `issued`. **Owning BC:** BC-BILL-5. **Aggregate:** Platform Invoice (`platform_invoices`). **Permission family:** `can_manage_billing` (org self-serve) / System (subscription/ad/microsite-driven issue). **Lifecycle:** `platform_invoices` → `issued` (Doc-2 §3.8/§10.8). **Audit:** §9 Financial ("platform invoice created") by pointer. **Events:** consumes the advertising/microsite signal (Marketplace — DF-BILL-2; `[ESC-BILL-EVENT]`) for ad/microsite invoices; emits none. **Cross-Module:** Identity (debtor org — DF-BILL-1); Platform Core (human-ref `INV-P-…`, audit — DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.update_invoice_status.v1` — Update Invoice Status · 21.4 Command / 21.5 System · Actor: User / System *(F4I-PA-M1: one contract-ID, actor-branched — single Pass-B record per Doc-4A §21; org void / System paid-overdue branches; not split.)*
- **Purpose:** transition invoice status (`issued → paid | overdue | void`). **Owning BC:** BC-BILL-5. **Aggregate:** Platform Invoice. **Permission family:** `can_manage_billing` (void) / System (paid on payment success, overdue on dunning window — `[ESC-BILL-POLICY]`). **Lifecycle:** `issued → paid/overdue/void` (Doc-2 §10.8). **Audit:** §9 Financial ("payment status change") by pointer. **Events:** none. **Cross-Module:** Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.record_payment.v1` — Record Payment (gateway callback) · 21.5 System · Actor: System
- **Purpose:** on a gateway callback, write/transition a `platform_payments` record (`initiated → succeeded | failed | refunded`; `gateway_ref`). **Owning BC:** BC-BILL-5. **Aggregate:** Platform Invoice (`platform_payments`). **Permission family:** none (System; gateway callback). **Lifecycle:** `initiated → succeeded/failed/refunded` (Doc-2 §10.8). **Audit:** §9 Financial ("payment status change" / "refund") by pointer. **Events:** none. **Cross-Module:** Platform Core (payment-gateway infra, audit — DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.get_platform_invoice.v1` · `billing.list_platform_invoices.v1` — Invoice Reads · 21.3 Query · Actor: User
- **Purpose:** read the debtor org's platform invoice(s) + payment status. **Owning BC:** BC-BILL-5. **Aggregate:** Platform Invoice. **Permission family:** `can_view_billing` (debtor org view). **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DF-BILL-1). **Sources:** Doc-2 §10.8.

### A4.6 — BC-BILL-6 Rewards & Referrals (Reward Account aggregate)

> Binds Doc-2 §10.8 (`reward_accounts`/`reward_transactions`/`referrals`).

#### `billing.credit_reward.v1` — Credit Reward Points · 21.4 Command / 21.5 System · Actor: User / System *(F4I-PA-M1: one contract-ID, actor-branched — single Pass-B record per Doc-4A §21; System milestone / org redemption branches; not split.)*
- **Purpose:** append a reward-point transaction (profile completion / reviews / completions); update the balance head. **Owning BC:** BC-BILL-6. **Aggregate:** Reward Account (`reward_transactions`). **Permission family:** System (event/milestone-driven) / `can_manage_billing` (redemption, if org-initiated — slug gap → `[ESC-BILL-SLUG]`). **Lifecycle:** transactions append-only; balance head mutable (Doc-2 §10.8). **Audit:** `[ESC-BILL-AUDIT]`. **Events:** none (milestone triggers are internal/consumed; no §8 reward event exists). **Cross-Module:** Identity (DF-BILL-1); Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.track_referral.v1` · `billing.advance_referral.v1` — Referral Tracking · 21.4 Command / 21.5 System · Actor: User / System *(F4I-PA-M1: each of `track_referral.v1` and `advance_referral.v1` is one contract-ID, actor-branched — single Pass-B record per Doc-4A §21; not split.)*
- **Purpose:** create a referral (`pending`) and advance it (`pending → qualified → rewarded`). **Owning BC:** BC-BILL-6. **Aggregate:** Reward Account (`referrals`). **Permission family:** `can_manage_billing` (org self) / System (qualification/reward milestone). **Lifecycle:** `referrals` `pending → qualified → rewarded` (Doc-2 §10.8). **Audit:** `[ESC-BILL-AUDIT]`. **Events:** none. **Cross-Module:** Identity (referrer/referred org — DF-BILL-1); Platform Core (DF-BILL-8). **Sources:** Doc-2 §10.8.

#### `billing.get_reward_balance.v1` · `billing.list_referrals.v1` — Reward/Referral Reads · 21.3 Query · Actor: User
- **Purpose:** read the org's reward balance / referral list. **Owning BC:** BC-BILL-6. **Aggregate:** Reward Account. **Permission family:** `can_view_billing`. **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Identity (DF-BILL-1). **Sources:** Doc-2 §10.8.

---

## A5 — Event Inventory (Pass-A consolidation)

**Produced (Doc-2 §8):** exactly three, all from BC-BILL-2 Subscriptions (producer `billing` / `subscriptions`; single-authorship — Doc-4A §4.4):

| Event | Producer BC | Trigger contract |
|---|---|---|
| `SubscriptionPurchased` | BC-BILL-2 | `billing.purchase_subscription.v1` |
| `SubscriptionRenewed` | BC-BILL-2 | `billing.renew_subscription.v1` |
| `SubscriptionExpired` | BC-BILL-2 | `billing.expire_subscription.v1` |

*(No other Billing event exists in Doc-2 §8 — invoice/usage/credit/reward state changes are Billing-owned entity transitions, not §8 domain events. If a Billing-emitted domain event beyond these is ever required: `[ESC-BILL-EVENT]` → Doc-2 §8 additive; none today; no event coined.)*

**Consumed (metered-action signals; idempotent — Doc-4A §16; → BC-BILL-3 usage / BC-BILL-4 credit / BC-BILL-5 invoice):**

| Signal | Producer (owner) | Anchor | Consuming BC |
|---|---|---|---|
| `QuotationSubmitted` | RFQ (Doc-4E) | **named Doc-2 §8 event** (`source=rfq_response`) | BC-BILL-3 |
| lead-access | Operations (Doc-4F) | **`[ESC-BILL-EVENT]`** — no §8 emission event (`source=lead_access`, Doc-2 §10.8 label) | BC-BILL-3, BC-BILL-4 |
| advertising/microsite launch | Marketplace (Doc-4D) | **`[ESC-BILL-EVENT]`** — no §8 emission event (`source=ad_launch`, Doc-2 §10.8 label) | BC-BILL-3, BC-BILL-5 |

**Event owner = the producing module** for every consumed row; **Billing owns the metering/invoicing/credit effect only.** No event invented; events absent from Doc-2 §8 are not added.

---

## A6 — Dependency Inventory (Pass-A consolidation)

Per the frozen structure §I8 — DF-BILL-1…8 carried; ownership unchanged.

| Marker | Owner (module) | Direction | Purpose |
|---|---|---|---|
| **DF-BILL-1** | Identity (Doc-4C, FROZEN) | consume + read-model | org/user/membership/active-org + **Controlling Organization** resolution, `check_permission` |
| **DF-BILL-2** | Marketplace (Doc-4D, FROZEN) | consume | advertising/microsite metering signal (`source=ad_launch`; `[ESC-BILL-EVENT]`); vendor data by UUID only |
| **DF-BILL-3** | RFQ (Doc-4E, FROZEN) | consume (event) | `QuotationSubmitted` metering input (`source=rfq_response`); **no procurement/matching/award decision; quota gate never alters routing/eligibility (moat)** |
| **DF-BILL-4** | Operations (Doc-4F, FROZEN) | consume | lead-access metering signal (`source=lead_access`; `[ESC-BILL-EVENT]`); **`operations.trade_invoices` stays Operations' (≠ platform invoice, FIXED)** |
| **DF-BILL-5** | Trust (Doc-4G, FROZEN) | none (negative-asserted) | **firewall** — Billing computes/owns no score; no plan/entitlement/quota influences trust/verification/eligibility |
| **DF-BILL-6** | Communication (Doc-4H, FROZEN) | emit | Billing emits the three §8 subscription events; Communication consumes for fan-out; Billing authors no notification |
| **DF-BILL-7** | Admin (Doc-4J) | consume / reference (carried) | plan-catalog/governance/dunning configuration; the governance decision is Admin's; **carried pending Doc-4J** (FLAG-AND-HALT if a required binding is absent at content time) |
| **DF-BILL-8** | Platform Core (Doc-4B, FROZEN) | consume | audit-write, outbox, UUIDv7 + human-ref (`INV-P-…`), POLICY, feature flags, **payment-gateway infra backing** |

**No ownership transfer in any direction; no dependency resolved here (carried as DF-BILL-*); no integration contract authored on an emitter's behalf (single-authorship).**

---

## A7 — Permission Dependency Inventory (Pass-A consolidation)

Three-layer check resolved via Identity `check_permission` (consumed; no shadow authorization). **Slugs (Doc-2 §7; none invented):**

| Permission family | Space | Actor | Contracts | Ownership boundary |
|---|---|---|---|---|
| `can_view_billing` | tenant (Owner, Delegate) | User | all BC-BILL-2/3/4/5/6 reads | org's own billing data only |
| `can_manage_billing` | tenant (Owner) | User | subscription purchase/cancel, lead-credit purchase, invoice issue/void, reward redemption, referral | org's own billing management only |
| (System) | platform (no active org) | System | metering (`record_usage`), period-end (`renew`/`expire`), gateway callback (`record_payment`), milestone credits | consumer/job effects on Billing's own entities only |
| catalog management (`[ESC-BILL-SLUG]`) | platform-staff | Admin | BC-BILL-1 plan/entitlement catalog | platform-owned catalog; **no §7 slug enumerated → `[ESC-BILL-SLUG]` (no slug invented)** |

Any required billing action without a Doc-2 §7 slug (distinct plan-catalog-management, lead-purchase, or reward-redemption slug) carries **`[ESC-BILL-SLUG]`** — **no slug invented**; **no role bundle authored** (Identity-seeded).

---

## A8 — Audit Dependency Inventory (Pass-A consolidation)

All audited mutations bind via Doc-4B `core.append_audit_record.v1` (in-transaction); reads not audited (§17.1). **Doc-2 §9 enumerates a Financial domain** (platform invoice created, payment status change, refund, subscription purchase/renewal/cancel) and an **Organization domain** (subscription change); usage/lead-credit/reward/referral/catalog mutations are **not separately enumerated** → **`[ESC-BILL-AUDIT]`** (nearest §9 action by pointer; no audit action invented).

| Contract group | Audit domain | Audit ownership | Audit requirement |
|---|---|---|---|
| Subscription purchase/cancel/renew (BC-BILL-2) | §9 **Financial** / **Organization** (by pointer) | Billing | yes (every mutation) |
| Subscription expire (BC-BILL-2) | **`[ESC-BILL-AUDIT]`** (expiry not enumerated in Doc-2 §9 Financial; nearest §9 action by pointer; §9 additive) *(F4I-PA-M2)* | Billing | yes |
| Platform invoice issue / status / payment / refund (BC-BILL-5) | §9 **Financial** (by pointer) | Billing | yes |
| Plan/entitlement catalog (BC-BILL-1) | `[ESC-BILL-AUDIT]` (§9 additive) | Billing | yes |
| Usage recording (BC-BILL-3) | `[ESC-BILL-AUDIT]` | Billing | yes |
| Lead-credit movement (BC-BILL-4) | `[ESC-BILL-AUDIT]` | Billing | yes |
| Reward/referral movement (BC-BILL-6) | `[ESC-BILL-AUDIT]` | Billing | yes |
| all reads | — | n/a | no (reads not audited, §17.1) |

---

## A9 — POLICY Dependency Inventory (Pass-A consolidation)

Per the frozen structure §I14 — **Doc-3 §12.2 registers no `billing.*`/`subscription.*`/`usage.*` POLICY namespace** (the only billing-adjacent key is Doc-3 §6 `leads.credit_value`). References only; **no key invented.**

| POLICY need | Binding |
|---|---|
| Lead shortfall credit value | **`leads.credit_value`** (Doc-3 §6 — named existing key) |
| Dunning / overdue window, grace period | **`[ESC-BILL-POLICY]`** (Doc-3 §12.2 additive — no key registered) |
| Quota reset period, usage window | **`[ESC-BILL-POLICY]`** |
| Subscription renewal lead time, payment-retry backoff | **`[ESC-BILL-POLICY]`** |
| Entitlement enforcement-read binding (F4I-MA1 seam: sync vs cache) | **`[ESC-BILL-POLICY]`** |

**Reference an existing key by name where one applies (`leads.credit_value`); otherwise carry `[ESC-BILL-POLICY]` — never invent the key in Doc-4I.**

---

## A10 — Procurement Moat Validation (Pass-A)

- Billing owns **none** of: vendor discovery, vendor ranking, matching, routing, quotation evaluation, supplier selection, award decisions (RFQ/Operations — DF-BILL-3/4). It references procurement context (`quotation_id`/`rfq_id`/`vendor_lead_id`) by UUID only, as a **metering input**, and makes no procurement decision.
- **No plan / subscription / credit / quota / entitlement may influence trust / verification / eligibility / routing / matching / ranking / supplier selection / awards.** A quota gate (`billing.enforce_quota.v1`) is an **entitlement check, never a routing/eligibility decision**. Paid plans may influence only **Visibility, Lead volume, Analytics, Advertising, Microsite capabilities** (Project Instructions; ADR).
- Entitlement resolution (`billing.resolve_entitlements.v1`) is an enforcement read consumed within Billing; it is never surfaced to RFQ matching/routing or to Trust. **Moat preserved on every contract surface.**

---

## A11 — Trust Firewall Validation (Pass-A)

- Billing **owns no** Trust / Verification / Performance / Governance score; **computes no** such score; **modifies no** such score (Trust/Doc-4G — DF-BILL-5, negative-asserted).
- No contract in A4.1–A4.6 reads, writes, derives, or references any `trust.*` score; subscription/entitlement state is never a trust/verification/eligibility input.
- A paid plan never gates a trust/verification/eligibility outcome. **Trust remains sole authority; firewall preserved on every contract surface.**

---

## A12 — Pass-B Planning Matrix (roadmap only — no Pass-B records)

Recommended Pass-B partitioning into logical reviewable batches (one BC per Part; ordered by dependency — catalog + subscription/entitlement authority first, since usage/quota enforcement reads the entitlement seam). **No Pass-B 12-section records authored here.**

| Pass-B Part | Bounded context | Contracts (candidate) | Rationale / sequencing |
|---|---|---|---|
| **Part 1** | BC-BILL-1 Plans & Entitlements | `create_plan`/`update_plan`/`retire_plan`, `bundle_plan_entitlement`, `create_entitlement`/`update_entitlement`, `get_plan`/`list_plans` | Catalog is the entitlement-definition root; harden first (Admin actor, `[ESC-BILL-SLUG]`). |
| **Part 2** | BC-BILL-2 Subscriptions | `purchase_subscription`, `cancel_subscription`, `renew_subscription`/`expire_subscription`, `resolve_entitlements`, `get_subscription`/`list_subscription_events` | Entitlement-resolution authority + the three §8 producer events; harden before Usage & Quota (which reads the entitlement seam — F4I-MA1). |
| **Part 3** | BC-BILL-3 Usage & Quota | `record_usage`, `enforce_quota`, `get_usage` | Depends on the Part-2 entitlement-read seam (`[ESC-BILL-POLICY]`) + consumed metering signals (`QuotationSubmitted` named; lead-access/ad-launch `[ESC-BILL-EVENT]`). |
| **Part 4** | BC-BILL-4 Lead Credits | `credit_lead_account`/`debit_lead_account`, `get_lead_balance`/`list_lead_transactions` | Append-only ledger; consumes lead-access signal (`[ESC-BILL-EVENT]`); references `source_invoice_id` (Part 5). |
| **Part 5** | BC-BILL-5 Platform Invoicing & Payments | `issue_platform_invoice`, `update_invoice_status`, `record_payment`, `get_platform_invoice`/`list_platform_invoices` | Platform invoices (`≠ trade_invoices`, FIXED) + gateway payments; §9 Financial audit; dunning `[ESC-BILL-POLICY]`. |
| **Part 6** | BC-BILL-6 Rewards & Referrals | `credit_reward`, `track_referral`/`advance_referral`, `get_reward_balance`/`list_referrals` | Promotional ledger + referral machine; lowest cross-dependency; harden last. |

**Module consolidation** (after all six Parts) → **Final Freeze Audit**, per the standard lifecycle.

---

*End of Doc-4I — Billing / Monetization Engine — Content Pass-A v1.0. Pass-A depth — module/BC/aggregate overviews, contract **inventory** (no 12-section hardening), event/dependency/permission/audit/POLICY inventories, moat + firewall validation, Pass-B planning matrix. Authored against the frozen structure (`Doc-4I_Structure_Proposal_v0.1` + `Doc-4I_Structure_Patch_v1.0`, APPROVED FOR FREEZE) and the frozen corpus (Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4H FROZEN). Module 7 (`billing` schema, `billing_` namespace) = 6 bounded contexts (BC-BILL-1…6) owning 7 aggregates (Doc-2 §2 — Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account), each in exactly one context; Trade Invoice is Operations-owned (`operations.trade_invoices ≠ billing.platform_invoices`, FIXED). Produced events: `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` (BC-BILL-2, single-authorship); consumed: `QuotationSubmitted` (named §8) + lead-access + advertising/microsite (`[ESC-BILL-EVENT]`). Dependencies DF-BILL-1…8; permissions `can_view_billing`/`can_manage_billing` (catalog `[ESC-BILL-SLUG]`); audit §9 Financial/Organization + `[ESC-BILL-AUDIT]`; POLICY `leads.credit_value` + `[ESC-BILL-POLICY]`. The procurement moat (paid plans never touch trust/verification/eligibility/routing/matching) and the trust firewall (no score owned/computed/modified) are preserved; Billing meters and charges, never decides; nothing invented. Authorized next stage after Hard Review → Pass-A Patch → Patch Verification: Doc-4I Pass-A FROZEN → Pass-B.*

---

## Freeze Approval (records consolidation)

```text
Status:            FROZEN
Source:            Doc-4I_PassA_Content_v1.0
Amendment:         Doc-4I_PassA_Patch_v1.0 (F4I-PA-M1, F4I-PA-M2 — applied inline)
Freeze Authority:  Doc-4I_PassA_Freeze_Audit_v1.0
Patch Verification: Doc-4I_PassA_Patch_Verification_v1.0 = PASS
Board Status:      APPROVED FOR FREEZE
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0
```

*Frozen consolidation of `Doc-4I_PassA_Content_v1.0` with `Doc-4I_PassA_Patch_v1.0` applied inline (F4I-PA-M1 dual-template disambiguation; F4I-PA-M2 `expire_subscription` audit → `[ESC-BILL-AUDIT]` + A8 split). No ownership/BC/aggregate/event-ownership/moat/firewall change; A12 counts unchanged. Sole contract authority for Doc-4I Pass-B.*
