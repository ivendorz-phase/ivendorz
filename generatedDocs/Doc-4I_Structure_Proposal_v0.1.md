# Doc-4I — Billing / Monetization Engine — API & Integration Contracts — Structure Proposal v0.1

| Field | Value |
|---|---|
| Document | Doc-4I — **Structure Proposal v0.1** — canonical Table of Contents proposal for Module 7 — Billing / Monetization (`billing` schema, `billing_` namespace) — the **platform-revenue & entitlement layer** |
| Status | **Structure Proposal — pre-freeze.** Defines the complete Module-7 structure (bounded contexts, aggregates, events, dependencies, maps) before contract authoring. **Not Pass-A; not Pass-B.** Next stage: Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A. |
| Module | Module 7 — Billing / Monetization (`billing` schema) — platform revenue, subscriptions, plan management, entitlements, usage metering, quota enforcement; owns no buyer↔vendor commerce |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v1.0, Doc-4H v1.0 — all FROZEN |
| Family-map basis | Doc-4A §1.3: **Doc-4I = Billing (Module 7)**; Appendix B namespace `billing_` (billing) |
| Contains | Structure only — section, bounded-context purpose/ownership/aggregates/services/dependencies, maps. **No contracts, commands, queries, payloads, API definitions, validation matrices, state-machine details, audit actions, or events beyond the structure-level production/consumption maps.** |
| Audience | Doc-4I content-pass authors; Claude Code / Cursor / OpenAI Codex / backend / frontend / QA / AI coding agents |

**Family-map confirmation (recorded).** **Doc-4I = Billing (Module 7, `billing` schema)** — confirmed against Doc-4A §1.3, Doc-4A Appendix B (`billing_` → Doc-4I), Doc-2 §0.3 (`billing` = Module 7), and Context Pack §3 (Module 7, `billing`). No family-map conflict; no flag-and-halt.

**Three governing rules shape this document** (inherited from Doc-4A §0.3; Doc-4D/4E/4F/4G/4H precedent):

1. **Reference, never restate (Doc-4A §0.3).** Entity definitions (Doc-2 §2/§3.8), state machines (Doc-2 §3.8/§5.7/§10.8 lifecycles), permission slugs (Doc-2 §7), events (Doc-2 §8), audit actions (Doc-2 §9), and POLICY keys (Doc-3 §12.2) have owners; Doc-4I binds to them by pointer and copies none. This is a **structure** document — it names the section homes for those bindings; the content passes instantiate them.
2. **Consume frozen lower layers; redefine nothing.** Doc-4I consumes Doc-4A standards and the frozen services of **Doc-4B Platform Core** (audit-write, outbox-write, UUIDv7 + human-reference, POLICY, feature flags, payment-gateway infra backing), **Doc-4C Identity** (org/membership/user resolution, `check_permission`, the **Controlling Organization** resolution that all usage/billing attribution anchors on), and the upstream modules whose actions drive metering — **Doc-4D Marketplace** (advertising/microsite purchases), **Doc-4E RFQ** (quotation-response metering), **Doc-4F Operations** (lead access), **Doc-4H Communication** (subscription/invoice notification fan-out, consumer-side) — all by pointer.
3. **Structure only.** This document maps sections and bounded contexts; it instantiates no contract, command, query, payload, validation, state-machine detail, or audit action. Those are the content passes' work, authored against this structure once frozen.

**Monetization boundary (the revenue seam — moat + firewall preserved).** Module 7 is the **platform-revenue and entitlement layer**: it owns plans, subscriptions, entitlements, usage metering, quota enforcement, lead credits, **platform invoices** (fees owed to iVendorz), platform-payment gateway records, rewards, and referrals. **Module 7 owns NONE of buyer↔vendor commerce:** trade invoices, payment records, procurement finance, escrow, wallet, fund custody, and settlement are **NOT** Billing — `operations.trade_invoices` is **owned by Operations (Doc-4F)** and is **`≠ billing.platform_invoices`** (Doc-2 §10.8, FIXED). **Trade Invoice ≠ Platform Invoice — this distinction is FIXED and may not be reinterpreted.** Per the **procurement-moat rule** (Project Instructions; ADR): a **paid plan / entitlement / quota / lead credit MUST NEVER influence Trust, Verification, Eligibility, Routing fairness, or Matching confidence** — paid plans may influence only Visibility, Lead volume, Analytics, Advertising, and Microsite capabilities. Per the **trust firewall**: Billing **computes/owns no** Trust / Performance / Verification / Governance score (Trust / Doc-4G). Entitlement resolution is an **enforcement** read (does this org hold quota/feature X), never a routing/eligibility decision. Where a metering or commercial value is configurable, Billing references the POLICY key by name and never hardcodes it (Doc-3 §12.2 / `[ESC-BILL-POLICY]`).

---

## §I1 — Module Overview

- **Purpose:** Establish Doc-4I as the contract document for **Module 7 — Billing / Monetization only**, the platform-revenue and entitlement layer. State the schema (`billing`), the namespace (`billing_`), the precedence chain (Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E → Doc-4F → Doc-4G → Doc-4H → Doc-4I), and the monetization boundary (platform revenue owned; buyer↔vendor commerce excluded).
- **Expected content scope:** Module identity (monetization layer of iVendorz); the `billing` schema and `billing_` namespace; the position in the module map (sells metered/high-intent leads and subscriptions, meters usage attributed to the Controlling Organization, enforces quotas/entitlements, issues platform invoices, runs rewards/referrals); the structure-only nature of this document; the conformed frozen corpus versions; the single-authorship rule (Billing authors its own §8 subscription-event production; Communication authors notification fan-out).
- **Owned aggregates (Doc-2 §2, Module 7):** Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account.
- **Dependencies:** Doc-4A §0/§1.3/§4.4/Appendix B; Doc-2 §0.3, §2 (Module 7), §5.7 (Subscription — ASSUMPTION A-06); Architecture §16 (module map), ADR (module ownership); ASSUMPTION A-11 (Basic entitlement profile when no active subscription).
- **Excluded scope:** No buyer↔vendor commerce (trade invoices, payment records, escrow, wallet, fund custody, settlement — Operations/Doc-4F + elsewhere); no Trust/Performance/Verification/Governance score; no module other than Module 7; **Trade Invoice ≠ Platform Invoice (FIXED).**

---

## §I2 — Business Objectives

- **Purpose:** State, once, the business purpose and strategic role of Module 7 within the platform positioning (40% B2B marketplace / 30% procurement / 20% ERP-lite / 10% industrial network — Project Instructions).
- **Expected content scope:** The monetization objectives the module serves — **plan management** (commercial plan catalog: marketing configuration, billing cycle, price), **subscriptions** (per-organization subscription lifecycle, entitlement source of truth), **entitlements** (boolean/numeric/enum entitlement catalog resolved from the active subscription; Basic profile otherwise — Assumption A-11), **usage metering** (quota consumption recorded append-only, **always attributed to the Controlling Organization** regardless of acting representative), **quota enforcement** (entitlement-bounded gating of metered actions), **lead credits** (lead-credit balances + movements; shortfall crediting per Doc-3 §6 commercial policy), **platform invoicing** (fees owed to iVendorz: subscription / lead_package / advertising / microsite / service — distinct from trade invoices), **platform payments** (gateway records: sslcommerz/bkash/nagad/bank), **rewards/referrals** (bonus points + referral tracking). Strategic role: the revenue engine that funds the marketplace while **never** distorting procurement fairness (paid plans influence visibility/lead-volume/analytics/advertising/microsite only — never trust/verification/eligibility/routing/matching). Maturity staging (Stage A→C) as it affects monetization aggressiveness (POLICY-gated, never tenant-set).
- **Dependencies:** Architecture (platform identity, monetization positioning); Project Instructions (paid-plan influence boundary); Doc-3 §6 (lead guarantees / shortfall credit — `leads.credit_value`); Doc-2 §2 (Module 7 aggregates), §5.7 (Subscription).
- **Excluded scope:** No procurement-decision logic; no re-derivation of architecture; no operating-number hardcoding (POLICY by key); no pay-to-win routing.

---

## §I3 — Bounded Context Landscape

- **Purpose:** Enumerate the bounded contexts **within** Module 7, each mapped to one or more owned aggregates; every planned contract lands in exactly one context (no aggregate in two contexts).
- **Expected content scope (candidate contexts, derived from the Doc-2 §2 Module-7 aggregates):**
  - **BC-BILL-1 — Plans & Entitlements** (Plan + Entitlement aggregates): the platform-owned commercial **Plan** catalog (`plans` + `plan_entitlements`) and the **Entitlement** slug catalog (`entitlements`; boolean/numeric/enum) — the entitlement bundle definitions.
  - **BC-BILL-2 — Subscriptions** (Subscription aggregate): per-organization `subscriptions` (+`subscription_events`) with the §5.7 lifecycle; the entitlement-resolution source of truth; **the sole producer of the Doc-2 §8 subscription events.**
  - **BC-BILL-3 — Usage & Quota** (Usage Ledger aggregate): append-only `usage_ledger` quota consumption (attributed to the Controlling Organization) and entitlement-bounded quota enforcement.
  - **BC-BILL-4 — Lead Credits** (Lead Credit Account aggregate): `lead_credit_accounts` (+`lead_credit_transactions`) — lead-credit balances and append-only movements.
  - **BC-BILL-5 — Platform Invoicing & Payments** (Platform Invoice aggregate): `platform_invoices` (fees owed to iVendorz) (+`platform_payments` gateway records) — **platform invoices only; never trade invoices.**
  - **BC-BILL-6 — Rewards & Referrals** (Reward Account aggregate): `reward_accounts` (+`reward_transactions`, `referrals`) — bonus points and referral tracking/rewards.
- **Dependencies:** Doc-2 §2 (Module 7 aggregates), §3.8 (entities); Doc-4D §D3 / Doc-4E §E3 / Doc-4F §F3 / Doc-4G §G3 / Doc-4H §H3 (within-module context precedent).
- **Excluded scope:** No cross-module context ownership; no aggregate split across contexts; no trade-finance/escrow/wallet context (not Module 7).

> **Recorded reconciliation — Platform Invoice vs Trade Invoice (no Flag-and-Halt; frozen authority governs).** The Module-7 scope names "Platform Invoices." The frozen corpus fixes **two distinct invoice entities in two distinct modules:** `billing.platform_invoices` (fees owed **to iVendorz**; `human_ref INV-P-…`; purpose subscription/lead_package/advertising/microsite/service — **Module 7**, Doc-2 §10.8) and `operations.trade_invoices` (buyer↔vendor commerce; `human_ref INV-…`; **Module 4 / Operations**, Doc-2 §10.8, explicitly **`≠ billing.platform_invoices`**). BC-BILL-5 owns **only** the platform invoice; trade invoices, payment records, escrow, wallet, fund custody, and settlement are **out of Module 7**. No invoice-ownership merge; the FIXED distinction governs.

---

## §I4 — Context Responsibilities

- **Purpose:** For each BC-BILL context, fix its responsibilities, internal ownership boundary, and the lifecycles it drives (by pointer to Doc-2 §3.8/§5.7) — so content passes place each contract unambiguously.
- **Expected content scope (per context — purpose · ownership · aggregate list · service list · dependencies):**
  - **BC-BILL-1 Plans & Entitlements** — *purpose:* maintain the commercial plan catalog + entitlement definitions; *ownership:* `plans` (+`plan_entitlements`), `entitlements`; *services:* plan create/activate/retire (marketing configuration), entitlement catalog management, plan→entitlement bundling; *dependencies:* Platform Core (audit, POLICY — DH-BILL-8); Admin (plan/catalog governance, if any — DH-BILL-7). **Platform-owned catalog; defines entitlement bundles, resolves no org-specific state.**
  - **BC-BILL-2 Subscriptions** — *purpose:* own the per-org subscription lifecycle and serve as the entitlement-resolution source of truth; *ownership:* `subscriptions` (+`subscription_events`); *services:* purchase/activate, cancel (auto_renew=false, runs to period end), renew, expire, repurchase (§5.7 machine); entitlement resolution from the `active` subscription (Basic profile otherwise — A-11); **emits `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` (Doc-2 §8) — single-authorship producer**; *dependencies:* Identity (org/Controlling-Org resolution, `check_permission` — DH-BILL-1), Platform Core (audit/outbox/POLICY — DH-BILL-8), Communication (consumes the subscription events for notification fan-out — DH-BILL-6, consumer-side). **Owns the subscription truth; emits its own events; makes no procurement decision.**
  - **BC-BILL-3 Usage & Quota** — *purpose:* meter quota consumption and enforce entitlement-bounded quotas; *ownership:* `usage_ledger` (append-only); *services:* usage recording (`quota_key`, `amount`, `period`, `source` ∈ rfq_response/lead_access/ad_launch), **attribution always to the Controlling Organization** (regardless of acting representative), quota-balance read, entitlement-bounded enforcement; *dependencies:* Identity (Controlling-Org resolution — DH-BILL-1), RFQ (`QuotationSubmitted` quotation-response metering — DH-BILL-3), Operations (lead-access metering — DH-BILL-4), Marketplace (advertising/microsite metering — DH-BILL-2), Platform Core (POLICY, audit — DH-BILL-8). **Records and enforces usage; a quota gate is an entitlement check, never a routing/eligibility decision (moat).**
  - **BC-BILL-4 Lead Credits** — *purpose:* maintain lead-credit balances and movements; *ownership:* `lead_credit_accounts` (+`lead_credit_transactions`); *services:* credit/debit transaction append (e.g., shortfall credit per Doc-3 §6 `leads.credit_value`), balance read; *dependencies:* Identity (org resolution — DH-BILL-1), Platform Core (audit/POLICY — DH-BILL-8); credit sources may reference a `source_invoice_id` (platform invoice). **Append-only ledger; balances are commercial credit, never procurement standing.**
  - **BC-BILL-5 Platform Invoicing & Payments** — *purpose:* issue platform invoices (fees owed to iVendorz) and record gateway payments; *ownership:* `platform_invoices` (+`platform_payments`); *services:* invoice issue (purpose ∈ subscription/lead_package/advertising/microsite/service), status transition (issued→paid/overdue/void), payment-record capture (gateway ∈ sslcommerz/bkash/nagad/bank; status initiated→succeeded/failed/refunded); *dependencies:* Identity (debtor org resolution — DH-BILL-1), Platform Core (audit, payment-gateway infra backing, POLICY — DH-BILL-8), Communication (invoice notifications — DH-BILL-6, consumer-side). **Platform invoices only; `≠ trade_invoices` (FIXED); owns no buyer↔vendor settlement.**
  - **BC-BILL-6 Rewards & Referrals** — *purpose:* track bonus points and referral rewards; *ownership:* `reward_accounts` (+`reward_transactions`, `referrals`); *services:* reward point credit (profile completion / reviews / completions), referral tracking (pending→qualified→rewarded), balance read; *dependencies:* Identity (org resolution — DH-BILL-1), Platform Core (audit/POLICY — DH-BILL-8). **Append-only reward ledger + referral tracking; bonus points are promotional, never procurement standing.**
- **Dependencies:** Doc-2 §3.8 (entity lifecycles), §5.7 (Subscription machine), §10.8 (blueprint); Doc-4A §4.4 (single-authorship); Doc-3 §6 (lead-credit commercial policy); ASSUMPTION A-06, A-11.
- **Excluded scope:** No procurement decision/score/award; no trade-finance/escrow/wallet/settlement; no paid-plan gating of trust/eligibility/routing.

---

## §I5 — Aggregate Inventory

- **Purpose:** Enumerate the seven Module-7 aggregates (Doc-2 §2), each assigned to exactly one bounded context — the machine-readable ownership ledger for content passes.
- **Expected content scope (aggregate → root → children/value-objects → owning BC-BILL, by pointer to Doc-2 §2/§3.8):**
  - **Plan** — root `plans`; child `plan_entitlements`; (marketing configuration) → **BC-BILL-1**.
  - **Entitlement** — root `entitlements` (catalog); VO EntitlementType (boolean/numeric/enum) → **BC-BILL-1**.
  - **Subscription** — root `subscriptions`; child `subscription_events`; VO BillingCycle → **BC-BILL-2**.
  - **Usage Ledger** — root `usage_ledger` (append-only); VO QuotaKey → **BC-BILL-3**.
  - **Lead Credit Account** — root `lead_credit_accounts`; child `lead_credit_transactions` → **BC-BILL-4**.
  - **Platform Invoice** — root `platform_invoices`; child `platform_payments`; VO GatewayRef → **BC-BILL-5**.
  - **Reward Account** — root `reward_accounts`; children `reward_transactions`, `referrals` → **BC-BILL-6**.
- **Dependencies:** Doc-2 §2 (Module 7 aggregate design), §3.8 (entity catalog), §10.8 (`billing` blueprint).
- **Excluded scope:** **No aggregate belongs to more than one context**; no aggregate added beyond the Doc-2 §2 Module-7 set (no trade-invoice / escrow / wallet aggregate); no aggregate from another module.

---

## §I6 — Domain Service Inventory

- **Purpose:** Name the structure-level domain services per context (the service *surfaces*, not contracts) — so content passes know where each capability lands without inventing service names.
- **Expected content scope (service surface → owning BC-BILL; capability-level only, no contract IDs):** plan-catalog + entitlement-definition service (BC-BILL-1); subscription-lifecycle + entitlement-resolution + subscription-event-production service (BC-BILL-2); usage-metering + quota-enforcement service (BC-BILL-3); lead-credit-ledger service (BC-BILL-4); platform-invoice + platform-payment service (BC-BILL-5); reward-ledger + referral-tracking service (BC-BILL-6). Each service consumes the frozen Doc-4B (audit/outbox/human-ref/POLICY/gateway-infra) and Doc-4C (`check_permission`, Controlling-Org resolution) services by pointer; **subscription-event production** is authored here per single-authorship (Billing owns its subscription events; Communication authors the notification fan-out effect).
- **Dependencies:** Doc-2 §3.8 (capabilities implied by entities); Doc-4B/Doc-4C (consumed services); Doc-4A §4.4/§16; Architecture §16.
- **Excluded scope:** No command/query/contract instantiated (content-pass work); no service that performs a procurement/routing/matching/award decision or computes a Trust score; no shadow authorization/audit path; no trade-invoice/settlement service.

---

## §I7 — Monetization Authority Matrix

- **Purpose:** State, explicitly, what Billing **decides/produces/consumes**, and the interaction boundary with each adjacent module — the structure-level guarantee that Billing funds the marketplace without distorting procurement fairness.
- **Expected content scope:**
  - **Billing-owned decisions (revenue/entitlement only):** plan activation/retirement; subscription purchase/cancel/renew/expire; entitlement resolution from the active subscription; usage recording + quota enforcement (entitlement-bounded gating of metered actions); lead-credit credit/debit; platform-invoice issue + status transition; platform-payment capture; reward/referral crediting. **Each is a revenue/entitlement decision — none is a Trust/Verification/Eligibility/Routing/Matching decision.**
  - **Billing-produced outputs:** **Doc-2 §8 events — `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired` (producer: Billing / `subscriptions`, BC-BILL-2)**; plus `platform_invoices`, `platform_payments`, `usage_ledger` rows, `lead_credit_transactions`, `reward_transactions`, `referrals` (Billing-owned entities, not domain events). **No event beyond the three §8 subscription events is produced; none coined** *(any future Billing-emitted event = Doc-2 §8 additive `[ESC-BILL-EVENT]`)*.
  - **Billing-consumed inputs (usage-driving triggers; by pointer to Doc-2 §8 + §10.8 `usage_ledger.source`):** the upstream actions that drive metering — quotation-response (`QuotationSubmitted`, RFQ / Doc-4E → `usage_ledger.source=rfq_response`), lead access (Operations / Doc-4F → `source=lead_access`), advertising/microsite launch (Marketplace / Doc-4D → `source=ad_launch`). Billing **consumes** these as metering inputs; **owns the usage/quota effect only** (single-authorship — the producing module owns its event). Plus Identity Controlling-Org resolution (read).
  - **Interaction boundaries (counterpart → boundary rule):** **Identity (Doc-4C)** — consume org/Controlling-Org/membership resolution, `check_permission`; author none. **RFQ/Operations/Marketplace** — consume their metered-action signals for usage/quota; **make no procurement/routing decision**; reference their entities by UUID only. **Communication (Doc-4H)** — Billing emits its §8 subscription events; Communication consumes them for fan-out (Billing authors no notification). **Trust (Doc-4G)** — Billing computes/owns no score; **a paid plan never gates trust/verification/eligibility (firewall).** **The procurement decision/score remains its owner's**; Billing meters and charges.
  - **Billing MUST NEVER:** influence Trust, Verification, Eligibility, Routing fairness, or Matching confidence via any plan/entitlement/quota/credit (moat); compute/own a Trust/Performance/Verification/Governance score (firewall); own a trade invoice, payment record, escrow, wallet, fund custody, or settlement (Operations + elsewhere). **A paid plan influences only Visibility, Lead volume, Analytics, Advertising, Microsite capabilities.**
  - *(**Single-authorship asymmetry vs Doc-4H:** Communication produces no §8 event (consumer/fan-out layer); **Billing IS a §8 producer** for its three subscription events. Both rules are the same Doc-4A §4.4 principle — each module owns its own event production; Communication owns only the fan-out effect.)*
- **Dependencies:** Doc-4A §4.4 (single-authorship), §4B (firewall / paid-plan boundary); Doc-2 §8 (event ownership — billing producer row), §10.8 (`usage_ledger.source`); Project Instructions (paid-plan influence boundary); ADR (moat).
- **Excluded scope:** No procurement/routing/matching/award decision absorbed; no Trust score computed/owned; no trade-finance ownership; no notification authored (Communication's effect).

---

## §I8 — External Dependency Map

- **Purpose:** State every cross-module dependency explicitly, with direction and consumption pattern (per Doc-4A §4 single-authorship, §4.4 integration) — the structure-level seam list the content passes bind to. Carried dependency markers **DF-BILL-* identified structurally — carried, not resolved here; analogous to Doc-4F `DF-*` / Doc-4G `DG-*` / Doc-4H `DH-*`.**
  - **DF-BILL-1 — Identity boundary.** `organizations`/`memberships`/`users`/`check_permission` and the **Controlling Organization** resolution (the anchor for all usage/billing attribution) are Identity's (Doc-4C, FROZEN). Billing consumes org/user/membership/active-org + Controlling-Org resolution and `check_permission` by pointer; authors/owns none. **Channel:** consume Doc-4C. **Direction:** consume + read-model.
  - **DF-BILL-2 — Marketplace boundary.** Marketplace (Doc-4D, FROZEN) drives **advertising/microsite** purchases (the `usage_ledger.source=ad_launch` metering input; platform-invoice purpose advertising/microsite). Billing **consumes** the metered-action signal for usage/invoicing; references vendor/profile context by UUID; owns no vendor data. **Channel:** consume (metering input). **Direction:** consume.
  - **DF-BILL-3 — RFQ boundary (a moat seam).** RFQ (Doc-4E, FROZEN) emits `QuotationSubmitted` — the quotation-response metering input (`usage_ledger.source=rfq_response`; Doc-2 §8 "QuotationSubmitted → … usage ledger"). Billing **consumes** it as a metering input and **records usage / enforces quota**; it makes **no procurement, matching, routing, or award decision** and **the quota gate never alters routing/eligibility** (moat). **Channel:** consume event (metering input); no RFQ decision. **Direction:** consume.
  - **DF-BILL-4 — Operations boundary.** Operations (Doc-4F, FROZEN) drives **lead access** (the `usage_ledger.source=lead_access` metering input; `VendorInvited`→vendor_leads in Operations). Billing **consumes** the lead-access signal for usage/lead-credit/invoicing; owns no Operations entity; **`operations.trade_invoices` stays Operations' (≠ platform invoice, FIXED).** **Channel:** consume (metering input). **Direction:** consume.
  - **DF-BILL-5 — Trust boundary (the firewall seam).** Trust (Doc-4G, FROZEN) owns all Trust/Performance/Verification/Governance scores. Billing **computes/owns no score** and **no plan/entitlement/quota/credit may influence trust/verification/eligibility** (firewall). Billing holds **no active coupling** to Trust beyond this negative assertion. **Channel:** firewall — no score, no influence. **Direction:** none (negative-asserted).
  - **DF-BILL-6 — Communication boundary.** Communication (Doc-4H, FROZEN) **consumes** Billing's §8 subscription events (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`) for notification fan-out. Billing **emits** these events (single-authorship producer) and **authors no notification**; Billing consumes no Communication entity. **Channel:** emit events (consumed by Communication). **Direction:** emit.
  - **DF-BILL-7 — Admin boundary.** Admin (Doc-4J) governs platform configuration / plan-catalog governance / dunning operations as applicable. Billing **references** Admin-governed configuration by pointer; the moderation/governance decision is Admin's; **carried as a structural seam pending Doc-4J** (FLAG-AND-HALT if a required Admin binding is absent at content time). **Channel:** reference / consume configuration. **Direction:** consume (carried).
  - **DF-BILL-8 — Platform Core boundary.** All `core.*` services (audit-write, outbox-write/dispatch, UUIDv7 + human-reference (`INV-P-…`), POLICY, feature flags, **payment-gateway infrastructure backing**) are Platform Core's (Doc-4B, FROZEN). Billing consumes them by pointer; re-implements none. **Channel:** consume Doc-4B services. **Direction:** consume.
- **Dependencies:** Doc-4A §4/§4.4/§16; Doc-2 §8 (event ownership), §10.8 (`usage_ledger.source`, invoice purpose); Doc-4B/4C/4D/4E/4F/4G/4H (consumed/adjacent, FROZEN); Doc-4J (Admin — carried).
- **Excluded scope:** No ownership transfer in any direction; no dependency resolved here (carried as `DF-BILL-*`); no integration contract authored on another module's behalf (single-authorship); structure only.

---

## §I9 — Ownership Matrix

- **Purpose:** Fix the machine-readable ownership ledger — every Module-7 aggregate/entity to its owning BC-BILL, and every not-owned reference to its owning module — so no hidden, shared, or duplicate ownership survives into Pass-A.
- **Expected content scope:**
  - **Owned (Billing / `billing` schema), by Doc-2 §2/§3.8/§10.8 — one owning BC-BILL each:** `plans`(+`plan_entitlements`), `entitlements` → BC-BILL-1; `subscriptions`(+`subscription_events`) → BC-BILL-2; `usage_ledger` → BC-BILL-3; `lead_credit_accounts`(+`lead_credit_transactions`) → BC-BILL-4; `platform_invoices`(+`platform_payments`) → BC-BILL-5; `reward_accounts`(+`reward_transactions`, `referrals`) → BC-BILL-6.
  - **NOT owned (reference by UUID / service / event only):** Identity entities + `check_permission` + Controlling-Org resolution (Doc-4C — DF-BILL-1); Marketplace vendor/advertising/microsite data (Doc-4D — DF-BILL-2); `rfqs`/`quotations`/matching/award (Doc-4E — DF-BILL-3); `engagements`/**`trade_invoices`**/`payment_records`/post-award commerce (Doc-4F — DF-BILL-4); `trust.*` scores/verification (Doc-4G — DF-BILL-5); Communication entities (Doc-4H — DF-BILL-6); `admin.*`/governance (Doc-4J — DF-BILL-7); all `core.*` (Doc-4B — DF-BILL-8).
  - **Tenancy class (Doc-2 §6/§10.8, by pointer):** `plans`/`entitlements`/`plan_entitlements`/`subscription_events`/`platform_payments` are **platform-owned**; `subscriptions`/`usage_ledger`/`lead_credit_accounts`(+tx)/`reward_accounts`(+tx)/`referrals` are **tenant-owned** (RLS `organization_id = active org`; usage attributed to the Controlling Org); `platform_invoices` are **tenant-owned (debtor org view) + platform**.
- **Dependencies:** Doc-2 §2, §3.8, §6, §10.8; ASSUMPTION A-06, A-11.
- **Excluded scope:** **No shared ownership across BCs, no duplicate ownership, no hidden ownership**; no aggregate in two contexts; every ownership claim justified by a Doc-2 pointer; **no trade-invoice ownership (Operations).**

---

## §I10 — Event Production Map

- **Purpose:** Structure the events Module 7 **produces** (Doc-2 §8, by pointer) — at structure level only.
- **Expected content scope:** **Billing produces exactly three Doc-2 §8 domain events, all from BC-BILL-2 Subscriptions (producer `billing` / `subscriptions`):** **`SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired`** (Doc-2 §8 catalog row — billing | subscriptions). Per single-authorship (Doc-4A §4.4), Billing owns the production of these subscription events; downstream consumers (Communication fan-out per Doc-2 §8 "subscription events → entitlement cache refresh" and notification dispatch) own their own effects. **No other Billing event exists in Doc-2 §8** — invoice/usage/credit/reward state changes are Billing-owned entity transitions, **not** §8 domain events. *(If a Billing-emitted domain event beyond the three is ever required, it is a Doc-2 §8 additive carried under `[ESC-BILL-EVENT]` — none exists today; no event coined.)*
- **Dependencies:** Doc-2 §8 (event ownership map — billing producer row); Doc-4A §4.4/§16; Doc-4B outbox (consumed for emission).
- **Excluded scope:** **No event coined beyond the Doc-2 §8 billing catalog**; Billing authors no other module's event production; invoice/usage/reward changes are not §8 events.

---

## §I11 — Event Consumption Map

- **Purpose:** Structure the events / signals Module 7 **consumes** (Doc-2 §8 + §10.8 metering sources, by pointer) — producer, consuming context, ownership direction — at structure level only; consumers are idempotent (Doc-4A §16).
- **Expected content scope (consumed signal → producing module → consuming BC-BILL):**
  - **`QuotationSubmitted`** (producer: RFQ / Doc-4E) → **BC-BILL-3 Usage & Quota** records quotation-response usage (`usage_ledger.source=rfq_response`; Doc-2 §8 "QuotationSubmitted → … usage ledger"). Idempotent consumer (Doc-4A §16); Billing owns only the usage effect (single-authorship).
  - **Lead-access signal** (producer: Operations / Doc-4F; lead access on `vendor_leads`) → **BC-BILL-3** (and **BC-BILL-4** lead-credit movement) records lead-access usage (`usage_ledger.source=lead_access`). Ownership direction: Operations owns the lead-access action; Billing owns the usage/credit effect.
  - **Advertising / microsite launch signal** (producer: Marketplace / Doc-4D) → **BC-BILL-3** records ad/microsite usage (`usage_ledger.source=ad_launch`) and **BC-BILL-5** issues the platform invoice (purpose advertising/microsite). Marketplace owns the launch action; Billing owns the usage/invoice effect.
  - **Identity Controlling-Org resolution** (Doc-4C / DF-BILL-1) — consumed read-only to anchor usage attribution; not a §8 event.
  - Ownership direction for every row: the **producing module owns the event/action**; **Billing owns the metering/invoicing/credit effect only** (its own idempotent consumer — Doc-4A §16). The precise per-signal metering matrix (which signal → which `quota_key`/`source`/amount) binds to Doc-2 §8 + §10.8 + the entitlement catalog at content authoring. **These are the Doc-2 §8 / §10.8 authoritative signals — none invented; signals absent from the frozen corpus are not added.**
  - *(Structure-level note — confirmed at content authoring against Doc-2 §8/§10.8:)* whether a given upstream action is delivered as a Doc-2 §8 event or a synchronous service signal binds to the frozen catalog; **no event coined**, no consumer logic authored for another module's effect. Any required-but-absent metering trigger carries **`[ESC-BILL-EVENT]`** (FLAG-AND-HALT — Doc-2 §8 additive channel).
- **Dependencies:** Doc-2 §8 (event catalog + primary consumers — "QuotationSubmitted → usage ledger", "subscription events → entitlement cache refresh"); Doc-2 §10.8 (`usage_ledger.source` ∈ rfq_response/lead_access/ad_launch); Doc-4A §16 (idempotent consumer), §4.4 (single-authorship); Doc-4B outbox (consumed).
- **Excluded scope:** **No event invented**; no consumer logic for events owned by other modules beyond Billing's own metering/invoicing/credit effect; the metered action is the emitter's, the usage effect is Billing's (§4.4).

---

## §I12 — Permission Surface Map

- **Purpose:** Identify the high-level permission **families** the module's contracts will bind (Doc-2 §7, by pointer) — **not** endpoint permissions (Pass-A work).
- **Expected content scope (permission family → applicable BC-BILL; by pointer to Doc-2 §7):**
  - **Billing & subscription family — `can_view_billing`** (Owner, Delegate; Doc-2 §7) and **`can_manage_billing`** (Owner; Doc-2 §7) → BC-BILL-2 Subscriptions, BC-BILL-4 Lead Credits, BC-BILL-5 Platform Invoicing, BC-BILL-6 Rewards & Referrals (org-side view/management of subscription, credits, invoices, rewards).
  - **Plan/entitlement catalog management** — platform-staff / Admin-governed (the `plans`/`entitlements` catalog is **platform-owned**, not a tenant action); no tenant slug enumerated for catalog management → if a content pass finds a required catalog-management action lacks a §7 slug, carry **`[ESC-BILL-SLUG]`** (Doc-2 §7 additive; **no slug invented**) → BC-BILL-1.
  - **Usage recording / quota enforcement = system-actor** (metering is written by the System actor on consumed signals; no tenant slug); quota **read** is recipient-scoped (`can_view_billing`) → BC-BILL-3.
  - **Platform-payment status / gateway callbacks = system-actor** (gateway callback writes `platform_payments` under the System actor; no tenant slug) → BC-BILL-5.
  - Any required billing action without a Doc-2 §7 slug (e.g., a distinct lead-purchase or reward-redemption slug) carries **`[ESC-BILL-SLUG]`** — **no slug invented.**
- **Dependencies:** Doc-2 §7 (`can_view_billing`, `can_manage_billing`); Doc-4A §6/§6B; Doc-4C (`check_permission`).
- **Excluded scope:** **No endpoint permission defined** (Pass-A); no slug invented; no role bundle authored (Identity-seeded).

---

## §I13 — State Machine Inventory

- **Purpose:** Inventory all Billing-owned state machines (Doc-2 §3.8/§5.7/§10.8 lifecycles, by pointer) — **inventory only**, no contract or transition detail (Pass-A/Pass-B work).
- **Expected content scope (machine → owning aggregate/BC-BILL → source pointer):**
  - **Plan** — `plans`: `draft → active → retired` — BC-BILL-1 (Doc-2 §3.8).
  - **Entitlement** — `entitlements`: **simple** (catalog; no status machine) — BC-BILL-1 (Doc-2 §3.8).
  - **Plan Entitlement** — `plan_entitlements`: **simple** (mapping) — BC-BILL-1 (Doc-2 §3.8).
  - **Subscription** — `subscriptions`: **§5.7 machine** `pending_payment → active → expired` (+ `active` cancel sets auto_renew=false → runs to period end; `active` period-end renew → `active`; `expired` repurchase → `pending_payment`) — BC-BILL-2 (Doc-2 §5.7 / ASSUMPTION A-06).
  - **Subscription Event** — `subscription_events`: **append-only** (purchase/renew/expire/cancel rows) — BC-BILL-2 (Doc-2 §3.8/§10.8).
  - **Usage Ledger** — `usage_ledger`: **append-only** — BC-BILL-3 (Doc-2 §3.8/§10.8).
  - **Lead Credit Account** — `lead_credit_accounts`: balance head (mutable); `lead_credit_transactions`: **append-only** — BC-BILL-4 (Doc-2 §3.8/§10.8).
  - **Platform Invoice** — `platform_invoices`: `issued → paid | overdue | void` — BC-BILL-5 (Doc-2 §3.8/§10.8).
  - **Platform Payment** — `platform_payments`: `initiated → succeeded | failed | refunded` — BC-BILL-5 (Doc-2 §3.8/§10.8).
  - **Reward Account** — `reward_accounts`: balance head (mutable); `reward_transactions`: **append-only** — BC-BILL-6 (Doc-2 §3.8/§10.8).
  - **Referral** — `referrals`: `pending → qualified → rewarded` — BC-BILL-6 (Doc-2 §3.8/§10.8).
- **Dependencies:** Doc-2 §3.8/§5.7/§10.8 (lifecycles); Doc-4A §13 (state-machine standard, applied at Pass-A).
- **Excluded scope:** **No transition contract instantiated** (inventory only); no state/transition invented; the machines are exactly the Doc-2 §3.8/§5.7/§10.8 set.

---

## §I14 — Escalation Inventory

- **Purpose:** Carry the structurally-identified escalation markers (`ESC-BILL-*` / `DF-BILL-*`) for gaps where the frozen corpus may lack a Module-7 binding — carried, never resolved here; analogous to Doc-4F `[ESC-OPS-*]` / Doc-4G `[ESC-TRUST-*]` / Doc-4H `[ESC-COMM-*]`.
- **Expected content scope:**
  - **`[ESC-BILL-AUDIT]`** — **Doc-2 §9 enumerates a "Financial" audit domain** ("platform invoice created, payment status change, refund, subscription purchase/renewal/cancel") and an "Organization" domain ("subscription change"), but **no `billing`-schema-specific audit domain per aggregate** (usage-ledger recording, lead-credit movement, reward/referral crediting, plan/entitlement catalog changes are not separately enumerated). Any Billing mutation discovered during Pass-A lacking explicit Doc-2 §9 coverage MUST carry the marker and bind the **nearest enumerated §9 Financial/Organization action by pointer** (interim) pending the Doc-2 §9 additive channel; **no audit action invented.** (Audit coverage for usage/credit/reward/catalog mutations is the principal Module-7 audit escalation.)
  - **`[ESC-BILL-POLICY]`** — **Doc-3 §12.2 registers no `billing.*` / `subscription.*` / `usage.*` POLICY namespace** (the §12.2 domains are `rfq.*`, `moderation.*`, `matching.*`, …, `leads.*`; the only billing-adjacent key is `leads.credit_value`, Doc-3 §6). Any Billing runtime tunable requiring a POLICY key absent from Doc-3 §12.2 (e.g., dunning/overdue window, grace period, quota reset period, payment-retry backoff, subscription renewal lead time) MUST reference an existing key by name where one applies (`leads.credit_value` for shortfall credit) or carry the marker — **never invent the key in Doc-4I.** **Channel:** Doc-3 §12.2 additive.
  - **`[ESC-BILL-SLUG]`** — Billing uses Doc-2 §7 `can_view_billing`/`can_manage_billing`; if a content pass finds a required action lacks a §7 slug (e.g., a distinct plan-catalog-management, lead-purchase, or reward-redemption slug), carry the marker — **no slug invented.** **Channel:** Doc-2 §7 additive.
  - **`[ESC-BILL-EVENT]`** — Billing produces exactly the three Doc-2 §8 subscription events today; if a Billing-emitted domain event beyond these is ever required (or a required metering trigger is absent from Doc-2 §8/§10.8), carry the marker to the Doc-2 §8 additive channel — **never coin an event in Doc-4I.**
- **Dependencies:** Doc-2 §7/§8/§9 (slug/event/audit catalogs); Doc-3 §12.2 (POLICY), §6 (`leads.credit_value`); Doc-4A §6.4/§16.4/§17 (no-invention rules); Doc-4F/4G/4H escalation-marker precedent.
- **Excluded scope:** No marker resolved here (carried only); no entity/slug/event/audit-action/POLICY-key invented; markers route to their owning-document channels.

---

## §I15 — Cross-Module Reference Inventory

- **Purpose:** State, per counterpart module, the references Billing holds (by UUID/service/event) and the boundary direction — the structure-level guarantee that no frozen ownership leaks into or out of Billing, with **no ownership transfer**.
- **Expected content scope (counterpart → reference → boundary rule, binding DF-BILL-1…DF-BILL-8):**
  - **Identity (Doc-4C, FROZEN) — DF-BILL-1:** reference `organization_id`/`user_id`/Controlling-Org `organization_id`; consume `check_permission` + Controlling-Org resolution; author/own none. **Usage attribution always anchors on the Controlling Organization.**
  - **Marketplace (Doc-4D, FROZEN) — DF-BILL-2:** reference vendor/profile/advertising/microsite context by UUID for invoice/usage; consume the ad/microsite metering signal; own no vendor data.
  - **RFQ (Doc-4E, FROZEN) — DF-BILL-3:** reference `quotation_id`/`rfq_id` as the metering context; consume `QuotationSubmitted` for usage; **make no procurement/matching/award decision; no quota gate alters routing/eligibility (moat).**
  - **Operations (Doc-4F, FROZEN) — DF-BILL-4:** reference `vendor_lead_id`/`engagement_id` as the lead-access/usage context; consume the lead-access signal; **own no `trade_invoices` / payment_records (≠ platform invoice, FIXED).**
  - **Trust (Doc-4G, FROZEN) — DF-BILL-5:** **no reference, no coupling** beyond the firewall negative-assertion — Billing computes/owns no score and no plan/entitlement/quota influences trust/verification/eligibility.
  - **Communication (Doc-4H, FROZEN) — DF-BILL-6:** **emit** `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` for Communication fan-out; reference no Communication entity; author no notification.
  - **Admin (Doc-4J) — DF-BILL-7:** reference Admin-governed plan-catalog/governance/dunning configuration by pointer; the governance decision is Admin's; **carried pending Doc-4J.**
  - **Platform Core (Doc-4B, FROZEN) — DF-BILL-8:** consume audit/outbox/UUIDv7+human-ref(`INV-P-…`)/POLICY/flags/payment-gateway infra backing.
- **Dependencies:** Doc-4A §4 (module ownership), §4.4 (single-authorship); Doc-2 §8 (events), §6 (tenancy), §10.8 (refs, `≠ trade_invoices`); Doc-4B/4C/4D/4E/4F/4G/4H (FROZEN); Doc-4J (carried).
- **Excluded scope:** No ownership crosses a boundary; no shared ownership; the procurement moat and trust firewall are preserved — Billing meters/charges, never owns the procurement decision/score/vendor-data/trade-finance.

---

## §I16 — AI-Agent Safety Notes

- **Purpose:** Structure the cross-cutting constraints that keep AI-assisted implementation of Module 7 unambiguous and monetization-safe — machine-readable boundaries enabling Pass-A authoring without reinterpretation.
- **Expected content scope:** **Authority boundaries** — Billing owns only the revenue/entitlement artifacts (Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account), each aggregate in exactly one BC-BILL (§I5/§I9); the procurement decision/score remains its owner's; every responsibility/aggregate has an explicit owner. **Revenue/entitlement-only responsibilities** — entitlement resolution is an enforcement read from the active subscription (Basic profile otherwise — A-11); usage is **always attributed to the Controlling Organization** regardless of acting representative; a quota gate is an entitlement check, **never** a routing/eligibility decision. **Ownership restrictions** — Billing **never** influences Trust/Verification/Eligibility/Routing fairness/Matching confidence via any plan/entitlement/quota/credit (moat — paid plans touch only Visibility/Lead volume/Analytics/Advertising/Microsite); it computes/owns **no Doc-2 §8 score** (firewall); it owns **no trade invoice / payment record / escrow / wallet / fund custody / settlement** (`operations.trade_invoices` ≠ `billing.platform_invoices`, FIXED). **Billing-governance rules** — Billing **produces exactly three Doc-2 §8 subscription events** (`SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`) and **owns their production** (single-authorship §4.4); it consumes upstream metered-action signals idempotently (Doc-4A §16) and authors no notification (Communication's effect); no event/slug/audit-action/POLICY-key invention — escalate via `ESC-BILL-*` (§I14). Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §4.1 (one owner), §4.4 (single-authorship), §4B (firewall / paid-plan boundary); Doc-2 §8; Project Instructions (paid-plan influence boundary); ASSUMPTION A-06, A-11.
- **Excluded scope:** No implementation code; no architectural assumption (all bindings by pointer); no resolution of `DF-BILL-*`/`ESC-BILL-*` markers.

---

## §I17 — Structure Summary

- **Purpose:** Close the structure with the section inventory and the freeze-readiness posture (no findings, no commentary — a structure ledger).
- **Expected content scope:** Module 7 — Billing / Monetization (`billing` schema, `billing_` namespace) decomposes into **6 bounded contexts** (BC-BILL-1 Plans & Entitlements · BC-BILL-2 Subscriptions · BC-BILL-3 Usage & Quota · BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals) owning **7 aggregates** (Doc-2 §2, Module 7 — Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account), each aggregate in exactly one context (Plan + Entitlement co-located in BC-BILL-1 as the catalog context; no aggregate split). **Trade Invoice is NOT a Module-7 aggregate** — `operations.trade_invoices` is Operations-owned and `≠ billing.platform_invoices` (FIXED). Cross-module dependencies **DF-BILL-1…DF-BILL-8** (Identity, Marketplace, RFQ, Operations, Trust, Communication, Admin, Platform Core) are explicit with direction + single-authorship side. **Produced events:** `SubscriptionPurchased`, `SubscriptionRenewed`, `SubscriptionExpired` (BC-BILL-2; Doc-2 §8 billing producer row — single-authorship). Consumed signals: `QuotationSubmitted` (RFQ → usage), lead-access (Operations → usage/credit), advertising/microsite launch (Marketplace → usage/invoice), Identity Controlling-Org resolution (read) → BC-BILL-3/4/5. State machines inventoried: Plan (`draft→active→retired`), Subscription (§5.7 `pending_payment→active→expired`+renew/cancel/repurchase), Platform Invoice (`issued→paid/overdue/void`), Platform Payment (`initiated→succeeded/failed/refunded`), Referral (`pending→qualified→rewarded`), plus append-only ledgers (usage_ledger, lead_credit_transactions, reward_transactions, subscription_events) and simple catalogs (entitlements, plan_entitlements). Escalation markers carried: `[ESC-BILL-AUDIT]`, `[ESC-BILL-POLICY]`, `[ESC-BILL-SLUG]`, `[ESC-BILL-EVENT]`. **The procurement moat** is preserved (no plan/entitlement/quota/credit influences trust/verification/eligibility/routing/matching; paid plans touch only visibility/lead-volume/analytics/advertising/microsite); the **trust firewall** is preserved (Billing computes/owns no Trust/Performance/Verification/Governance score); **Trade Invoice ≠ Platform Invoice** holds (no trade-finance/escrow/wallet/settlement ownership); DDD integrity holds (no boundary leakage; one aggregate per context); event integrity holds (exactly the three §8 subscription events produced; metering signals consumed idempotently; no event coined; single-authorship intact). Business authority for procurement/scoring remains with the originating modules; nothing invented. **Structure is ready for Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A authoring.**
- **Dependencies:** §I1–§I16; the frozen corpus.
- **Excluded scope:** No contract/command/query/payload/validation/state-machine-detail/audit-action instantiated; no review/commentary/roadmap.

---

*End of Doc-4I — Billing / Monetization Engine — Structure Proposal v0.1. Structure only — no contract, command, query, payload, validation matrix, state-machine detail, or audit action instantiated. Module 7 (`billing` schema, `billing_` namespace) decomposes into 6 bounded contexts (BC-BILL-1…6) owning 7 aggregates (Doc-2 §2 — Plan, Entitlement, Subscription, Usage Ledger, Lead Credit Account, Platform Invoice, Reward Account), each in exactly one context; Trade Invoice is Operations-owned (`operations.trade_invoices ≠ billing.platform_invoices`, FIXED), not a Module-7 aggregate. Cross-module dependencies DF-BILL-1…DF-BILL-8 explicit; produced events `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` (BC-BILL-2, single-authorship producer, Doc-2 §8); consumed signals `QuotationSubmitted` (RFQ→usage) + lead-access (Operations) + advertising/microsite (Marketplace) + Identity Controlling-Org resolution → BC-BILL-3/4/5; escalation markers `[ESC-BILL-AUDIT]`/`[ESC-BILL-POLICY]`/`[ESC-BILL-SLUG]`/`[ESC-BILL-EVENT]` carried. Bound by pointer to Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A/4B/4C/4D/4E/4F/4G/4H v1.0 (FROZEN); the procurement moat (paid plans never touch trust/verification/eligibility/routing/matching) and the trust firewall (no Trust/Performance/Verification/Governance score) preserved; Trade Invoice ≠ Platform Invoice (FIXED); business authority for procurement/scoring remains with the originating modules; nothing invented. Next: Independent Hard Review.*
