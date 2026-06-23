# iVendorz — Program Status & Authoring Roadmap

**Companion to `iVendorz_Context_Pack_v5.md`.** This is the detailed per-module ledger and the live work queue. Read both into a fresh chat to resume.

---

## 1. Frozen baseline

| Layer | Status |
|---|---|
| Master Architecture (FINAL) | **FROZEN** |
| ADR Compendium v1 | **FROZEN** |
| Doc-2 Domain Model & DB Blueprint v1.0.3 | **FROZEN** |
| Doc-3 RFQ Procurement & Operational Spec v1.0.2 | **FROZEN** |
| Doc-4A Contract grammar / standards | **FROZEN** |

---

## 2. Module-contract ledger (Doc-4B → Doc-4L)

| Module | Doc | Schema | Status | Notes |
|---|---|---|---|---|
| 0 — Platform Core | Doc-4B | `core` | **FROZEN** | audit/outbox/UUIDv7/POLICY/flags/config store |
| 1 — Identity & Organization | Doc-4C | `identity` | **FROZEN** | org/membership/user/`check_permission`/delegation/staff slug space |
| 2 — Marketplace & Discovery | Doc-4D | `marketplace` | **FROZEN** | vendor profiles, categories, microsites, advertising; reflects `VendorBanned` (DD-3) |
| 3 — RFQ Procurement Engine | Doc-4E | `rfq` | **FROZEN** | RFQ lifecycle, matching, routing, quotations, award (the moat) |
| 4 — Business Operations | Doc-4F | `operations` | **FROZEN** | private CRM, engagements, trade invoices (`≠` platform invoices), documents, finance records |
| 5 — Trust & Verification | Doc-4G | `trust` | **FROZEN** | verification records/decisions, trust/performance/governance scores (the firewall owner) |
| 6 — Communication | Doc-4H | `communication` | **FROZEN** | threads, notifications, delivery tracking, support; emits no §8 event (fan-out consumer) |
| 7 — Monetization / Billing | Doc-4I | `billing` | **FROZEN — `Doc-4I_FROZEN_v1.0` generated** | plans, subscriptions, entitlements, usage/quota, lead credits, platform invoices, rewards/referrals; emits `SubscriptionPurchased`/`Renewed`/`Expired` |
| 8 — Admin Operations | Doc-4J | `admin` | **FROZEN — `Doc-4J_FROZEN_v1.0` generated** | moderation, ban (emits `VendorBanned` — sole Admin §8 event), suggestions (3 roots), import, verification workflow, outreach; "Admin decides; owning module stores" |
| 9 — AI Layer | Doc-4K | `ai` | **FROZEN — `Doc-4K_FROZEN_v1.0` generated** | derived/regenerable/disposable artifacts; owns no authoritative record; 4 BCs · 4 aggregates · 16 contracts; Q1/Q2/Q3 carried; F4K-PB-05 deferred to Consolidation |
| — Cross-Module Integration & Event-Flow Index | Doc-4L | — | **NOT STARTED** | **non-normative** index; defines nothing; assembled from source-module contracts |

---

## 3. CLOSED THREAD A — Doc-4I Pass-B Part 2 (Billing BC-BILL-4/5/6) — RESOLVED 2026-06-19

**Status: CLOSED.** Module 7 is fully FROZEN on disk. `Doc-4I_PassB_Part2_v1.0_FROZEN.md` and `Doc-4I_FROZEN_v1.0.md` were generated (mechanical merge: base bodies byte-faithful + patches folded inline; Module Invariants + Freeze Certificate added). The remaining steps below are retained as the completed record.

**Scope:** BC-BILL-4 Lead Credits · BC-BILL-5 Platform Invoicing & Payments · BC-BILL-6 Rewards & Referrals (14 frozen Pass-A contract-IDs). `billing.platform_invoices ≠ operations.trade_invoices` (FIXED).

**On disk:**
- `Doc-4I_PassB_Part2_BC-BILL-4_5_6_v1.0.md` — content (hardened)
- `Doc-4I_PassB_Part2_Independent_Hard_Review_v1.0.md` — Hard Review (findings F4I-PB2-M1, M2, N1)
- `Doc-4I_PassB_Part2_Patch_v1.0.md` — patch (all 3 findings resolved: M1 advance_referral User-advance → `can_manage_billing`; M2 update_invoice_status + advance_referral Stage-7 User→NOT_FOUND / System→REFERENCE; N1 update_invoice_status audit → `[ESC-BILL-AUDIT]`)
- `Doc-4I_PassB_Part2_Patch_Verification_v1.0.md`
- `Doc-4I_PassB_Part2_Freeze_Audit_v1.0.md`

**Completed steps (all DONE):**
1. ✅ `Doc-4I_PassB_Part2_Freeze_Audit_v1.0` verdict = APPROVE FOR FREEZE.
2. ✅ Generated `Doc-4I_PassB_Part2_v1.0_FROZEN` (base body + patch folded inline).
3. ✅ Module-7 Consolidation Review (all 6 BC-BILL parts complete: Part 1 BC-BILL-1/2/3 FROZEN + Part 2 BC-BILL-4/5/6) — PASS, 1 non-blocking NITPICK F4I-CONS-N1.
4. ✅ `Doc-4I_Final_Freeze_Audit_v1.0` → **Module-7 FROZEN** (`Doc-4I_FROZEN_v1.0` generated).

**Billing facts to preserve:** events produced = `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired` (BC-BILL-2 only); `QuotationSubmitted` RFQ-owned/Billing-consumed; lead-access + advertising/microsite metering = `[ESC-BILL-EVENT]` (no §8 emission event); slugs `can_view_billing`/`can_manage_billing` + `[ESC-BILL-SLUG]`; F4I-PA-M1 (six actor-branched contracts = one ID each) + F4I-PA-M2 (expiry → `[ESC-BILL-AUDIT]`) carried from Pass-A.

---

## 4. CLOSED THREAD B — Doc-4K AI Layer (Module 9) — FROZEN 2026-06-20

**Status: CLOSED — Module 9 FROZEN.** `Doc-4K_FROZEN_v1.0` generated. Full chain complete: Structure FROZEN → Pass-A Content → Pass-A Hard Review (0/0/0/1) → Pass-A Board Disposition (ACCEPT; K-PA-HR-01 DEFER → resolved by Pass-B get/list split) → Pass-B Content → Pass-B Hard Review (0/0/2/3) → Pass-B Patch → Patch Verification (PATCH VERIFIED 0/0/0/0) → Final Freeze Audit (FREEZE APPROVED; 11/11 PASS). Frozen scope: 4 BCs · 4 derived aggregates · 16 contracts (4 generate + 4 get + 4 list + 4 expire). Board Q1=4 BCs, Q2=matching-assist home BC-AI-1 (RFQ decides), Q3=pull/derive-on-demand (zero §8 events). Master §18 Invariant 12 confirmed throughout. Deferred: F4K-PB-05 (NITPICK, per-contract ESC-marker depth) → Consolidation, no freeze impact.

**All nine Doc-4 modules (Module 0–9) FROZEN. The Doc-4 per-module contract series is complete.**

**Next action:** Doc-4L (non-normative Cross-Module Integration & Event-Flow Index) + Cross-Document Final Audit → Doc-4 Program Consolidation → Development Readiness & Build Decomposition.

**Frozen Module-9 anchors to pin (Doc-2 §2 / §3.10 / §10.10):**
- **4 aggregates (all derived AR; one per BC candidate):** Recommendation (`recommendations`), Prediction (`predictions`), Classification Result (`classification_results`), Similar Vendor Result (`similar_vendor_results`).
- **Lifecycle:** all **regenerable / disposable** — "derived only; regenerable, never authoritative"; **hard delete permitted (cache semantics)**; may be truncated and rebuilt at any time without business impact.
- **Ownership:** AI owns **only derived artifacts** — **no authoritative record, no business truth.** Consumes upstream module data (read-models / by reference) to produce advisory outputs; writes only its own `ai.*` tables.
- **Events:** expected **produces none, consumes none** in Doc-2 §8 (advisory/derived) — confirm against §8; coin nothing; carry an `[ESC-AI-EVENT]`-style marker only if a genuine gap appears.
- **Authorization / Audit / POLICY:** likely no dedicated `ai.*` §7 slug / §9 audit domain / §12.2 POLICY namespace — use escalation markers (`[ESC-AI-SLUG]` / `[ESC-AI-AUDIT]` / `[ESC-AI-POLICY]`) where the corpus is silent; invent nothing.
- **Moat + firewall (full):** AI is **advisory only** — it makes no procurement decision (no matching/routing/ranking/supplier-selection/award/eligibility) and owns/computes no Trust/Performance/Verification/Governance score; its outputs are non-authoritative suggestions.

**Structure deliverables (per the brief):** Module Identity · Bounded Context Inventory · Aggregate Inventory · Ownership Rules · Dependency Model (markers/direction/purpose/protected facts) · Event Governance · Authorization Surface · Lifecycle Registry (high-level only) · AI-Agent Governance. **Prohibited:** field registries, value objects, read models, idempotency, concurrency, retention, indexes, API contracts, error matrices (later phases).

**Then:** Independent Hard Review → Structure Patch → Patch Verification → Structure FROZEN → Pass-A → Pass-B → Consolidation → Final Freeze (the standard lifecycle).

---

## 5. After Doc-4K

- **Doc-4L — Cross-Module Integration & Event-Flow Index** (non-normative): assemble the per-module event production/consumption + service seams across the whole corpus. Introduces nothing new; MUST NOT be cited as a contract source.
- Then: Development Decomposition → Build Roadmap → Implementation.

---

## 6. Verification discipline reminder (every deliverable)

Run a bash verification pass before presenting: inventory ⊆ frozen; lifecycles verbatim; events per §8 (zero coined); slugs ⊆ §7 (zero invented); audit per §9 by pointer or module ESC-marker; dependency markers correct (no invented marker); REFERENCE≠DEPENDENCY / STATE≠CONFLICT; moat + firewall asserted; document-scope respected (structure-only / Pass-A-depth / Pass-B-hardening); no stray finding/draft tokens. Include a verification task in the TaskCreate list. End with a Sources list.
