# iVendorz — Context Pack v2

| Field | Value |
|---|---|
| Purpose | Compact orientation for AI coding agents and contributors working against the frozen iVendorz corpus. A **navigation and convention reference** — not an authoritative source. |
| Status | v2 — synthesis of the frozen corpus as of the **Doc-4D Structure freeze** (supersedes Context Pack v1, which was synthesized at the Doc-4C Structure freeze). |
| Authoritative? | **No.** This pack summarizes and points; on any conflict the cited source governs. Always cite the source document, never this pack. |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E…4L … |
| Audience | Claude Code, Cursor, AI development agents, backend/QA/integration engineers |

> **How to use:** Start here to orient. Confirm any rule against its cited source before authoring or implementing. This pack introduces **no** decision, entity, permission, event, or standard — it consolidates what the frozen documents already establish. **What changed since v1:** Doc-4C (Identity & Organization) is now **FROZEN v1.0** (content); Doc-4D (Marketplace & Discovery) **Structure is FROZEN v1.0** (content Pass-A authorized next); the carried-dependency register now spans DC-1…DC-5 + ESC-IDN-* (Doc-4C) and DD-1…DD-7 + ESC-MKT-AUDIT (Doc-4D).

---

## 1 — Platform Identity

iVendorz is an industrial B2B procurement platform for the Bangladesh market. Positioning: **40% B2B Marketplace · 30% Procurement Platform · 20% ERP-Lite · 10% Industrial Vendor Network**. It is **organization-centric**: *Users act; Organizations own* (Architecture §5). The procurement moat is **RFQ routing** — buyer-outcome quality, vendor fairness, capacity awareness, and trust preservation, never pay-to-win.

Marketplace maturity is staged: **Stage A** (Founder-Assisted) → **Stage B** (Assisted) → **Stage C** (Autonomous); the active stage is a platform decision held in POLICY `platform.operating_stage` (Doc-3 §0, §12). Build for 100 → 1,000 → 10,000 vendors before 1,000,000.

---

## 2 — Corpus Inventory & Precedence

Precedence (higher governs on conflict): **Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E…4L**.

| Document | Role | Canonical version | Status |
|---|---|---|---|
| Master_System_Architecture_v1.0_FINAL | Architecture authority | v1.0 FINAL | FROZEN |
| ADR_Compendium_v1 | Decision records | v1 | FROZEN |
| Doc-2 — Domain Model & Database Blueprint | Entities, state machines, tenancy, events, audit | **v1.0.3** (base `…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`) | FROZEN |
| Doc-3 — RFQ Procurement Engine & Operational Spec | Workflows, operating stages, FIXED/POLICY/ORG | **v1.0.2** (+ `Doc-3_Policy_Key_Registration_Patch_v1.0.md`) | FROZEN |
| Doc-4A — API Standards & Conventions | The metastandard for all Doc-4 module docs | v1.0 (Pass1–6 + patches + FreezeAudit Patch v1.0.1) | FROZEN |
| Doc-4B — Platform Core / Shared Kernel (Module 0) | Module 0 contracts | v1.0 (`PassB` + `Freeze_Patch_v1.0.1` + Doc-3 key registration) | **FROZEN** |
| Doc-4C — Identity & Organization (Module 1) | Module 1 contracts | **v1.0** (`Content_PassB` + `PassB_Patch_v1.0.1`) | **FROZEN** |
| Doc-4D — Marketplace & Discovery (Module 2) | Module 2 **structure** | Structure **v1.0 FROZEN** (`Structure_Proposal_v0.1` + `Structure_Patch_v0.1.1`) | **Structure FROZEN; Content Pass-A authorized (next)** |

**Citation rule (Doc-4A §3.5):** cite the base document section + patch ID where a patch is material. Use **effective** version identifiers (Doc-2 v1.0.3, Doc-3 v1.0.2). For frozen Doc-4 modules, the canonical artifact is the content/structure as amended by its freeze patch (e.g., Doc-4C = PassB + PassB Patch v1.0.1; Doc-4D Structure = Proposal v0.1 + Structure Patch v0.1.1).

---

## 3 — Module Map (Modular Monolith; one PostgreSQL schema per module)

| # | Module | Schema | Doc-4 | Owns (representative) | Doc-4 status |
|---|---|---|---|---|---|
| 0 | Platform Core / Shared Kernel | `core` | 4B | audit_records, outbox_events, id_sequences, system_configuration, feature_flags | **FROZEN** |
| 1 | Identity & Organization | `identity` | 4C | users, organizations, memberships, roles, permissions, role_permissions, organization_workflow_settings, buyer_profiles, delegation_grants | **FROZEN** |
| 2 | Marketplace & Discovery | `marketplace` | 4D | vendor_profiles, microsites, products, categories, advertisements, profile experience, spec library, catalog favorites | **Structure FROZEN** |
| 3 | RFQ Procurement Engine (moat) | `rfq` | 4E | rfqs, routing, matching, quotations, comparison_statements, routing_rules | Not started |
| 4 | Business Operations Engine | `operations` | 4F | PO/LOI/challan, trade_invoices, payments, generated documents, Vendor CRM | Not started |
| 5 | Trust & Verification | `trust` | 4G | trust_scores, performance_scores, verification_records, fraud signals | Not started |
| 6 | Communication | `communication` | 4H | chat, RFQ threads, notifications, email/SMS/WhatsApp logs | Not started |
| 7 | Monetization | `billing` | 4I | plans, subscriptions, entitlements, usage quotas, platform_invoices | Not started |
| 8 | Admin Operations | `admin` | 4J | moderation, ban actions, category/vendor approval, system configuration policy/oversight | Not started |
| 9 | AI Layer | `ai` | 4K | regenerable derived artifacts only (advisory; owns no authoritative records) | Not started |
| — | Cross-Module Integration & Event Flow Index | — | 4L | non-normative index assembled from source-module contracts | Not started |

Cross-module communication only via **Services, Events, Public Contracts** (no direct table access; no cross-module FKs; cross-module refs are bare UUIDv7, service-validated).

---

## 4 — Core Invariants (non-negotiable)

- **One Entity = One Owner · One Aggregate = One Root · One Business Truth = One Source.** Only the owning module exposes contracts over its entities and may transition their state (Doc-4A §4.1, §13.4).
- **Users act; Organizations own.** Active organization context is **server-validated**, never client-asserted (Architecture §5; Doc-4A §5.3). Solo Trader Rule: every user has ≥1 organization.
- **Governance-signal firewalls (FIXED).** The five signals — Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer Vendor Status — are independent with fixed owners. No contract may let one mutate another; paid plans/entitlements/config never gate trust, verification, eligibility, routing fairness, or matching confidence (Architecture §1.5; Doc-3 §12.1; Doc-4A §4B, §18.3).
- **Non-disclosure indistinguishability (FIXED).** Blacklist/exclusion/private-CRM/Buyer-Vendor-Status facts must be undetectable across every channel — responses, errors, counts, ordering, timing, events, notifications (Doc-4A §7.5; Doc-3 §12.1).
- **FIXED / POLICY / ORG (Doc-3 §12; Doc-4A §18).** FIXED = code/CI-enforced invariant. POLICY = platform-tunable value in `core.system_configuration`, referenced **by key, never by value**. ORG = per-organization setting (Identity-owned) within POLICY bounds.
- **Reference-never-restate (Doc-4A §0.3).** Bind catalogs (permissions §7, events §8, audit §9, POLICY keys Doc-3 §12.2, state machines §5) by pointer; never copy them.
- **Flag-and-halt (Doc-4A §0.6).** On any conflict with a higher/frozen document, halt, record both citations, escalate. **Never invent** an entity, slug, event, POLICY key, audit action, or template. *(Demonstrated in this corpus: the Doc-4B/Doc-4C and Doc-4D family-map label-slip conflicts were both halted and Board-reconciled, never worked around.)*
- **Identifiers.** UUIDv7 is the only canonical machine ID; `human_ref` is display/lookup convenience (year-scoped, gap-tolerant, never reused). Generated by Module 0 (Doc-4A §8; Architecture §17.2).
- **Transactional outbox.** Business write + event insert in one transaction; at-least-once delivery; consumers idempotent; thin payloads (Architecture §15; Doc-4A §16).
- **Audit is immutable and never bypassed.** Append-only; the only mutation is compliance redaction (itself audited). Audit ≠ events (Architecture §14; Doc-4A §17).
- **Authentication = Supabase Auth only.** Authorization, membership, org context, and identity records are Identity's (Module 1); the auth flow itself is infrastructure (Doc-4A §5).

---

## 5 — Doc-4A Contract Standards — Quick Reference

**Templates (Doc-4A §21):** 21.1 Endpoint (base) · 21.2 Integration (event-driven; authored once by the source module) · 21.3 Query · 21.4 Command · 21.5 System Actor (Phase-2; `Response: none`) · 21.6 Admin (no active org context, §5.6). Every Response Contract includes `reference_id : uuid : always` (§22.1 C-05 / P6-B01); 21.5 is exempt.

**Authorization (§6 / §6B):** three-layer check — active **Membership + Permission Slug + Resource Scope**, OR an active **Delegation Grant**. Slugs only (`can_*` org space, `staff_*` platform space); never role or plan names. Identity's `check_permission` (Doc-4C §C3/§C8) is the **single authoritative resolution** — no module implements a shadow check.

**Validation order (§11.2):** SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REFERENCE → BUSINESS → POLICY.

**Error model (§12):** closed class set — VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Codes namespaced `<module_prefix>_<domain>_<code>`. Protected-fact failures collapse to NOT_FOUND.

**Rate limits (§19.3 / CHK-215):** every contract with a Category 9 POLICY limit rule carries a Rate-Limit block (V-Type, Policy-Key, Attribution, Reset-Interval, Error-Class).

**Idempotency (§14):** mutating ops declare `Idempotency: required` + dedup window (POLICY key); replay → same result, no duplicate audit record, no duplicate event.

**Module prefixes / namespaces (Appendix B):** `core_` (4B), `identity_` (4C), `marketplace_` (4D), `rfq_` (4E), `ops_` (4F), `trust_` (4G), `comm_` (4H), `billing_` (4I), `admin_` (4J), `ai_` (4K). POLICY keys `core.system_configuration.<domain>.<key>`.

---

## 6 — Current Build Status

| Layer | State |
|---|---|
| Architecture, ADRs, Doc-2, Doc-3 | FROZEN |
| Doc-4A (standards) | FROZEN |
| Doc-4B (Module 0 — Platform Core) | **FROZEN v1.0** (PassB + Freeze Patch v1.0.1 + Doc-3 key registration) |
| Doc-4C (Module 1 — Identity) | **FROZEN v1.0** (Content PassB + PassB Patch v1.0.1; Freeze Audit passed) |
| Doc-4D (Module 2 — Marketplace) | **Structure FROZEN v1.0** (Structure Proposal v0.1 + Structure Patch v0.1.1; Structure Freeze Gate passed) — **Content Pass-A authorized (next)** |
| Doc-4E … Doc-4L | Not started (sequence per Doc-4A §1.3 family map: 4E RFQ, 4F Operations, 4G Trust, 4H Communication, 4I Billing, 4J Admin, 4K AI, 4L Integration Index) |

**Authoring sequence (per-document lifecycle):** Structure Proposal → Independent Hard Review → Structure Patch → **Structure FROZEN** → Content Pass-A → Review → Pass-A Patch → **Pass-A CLOSED** → Content Pass-B (hardening) → Hard Review → Pass-B Patch → Patch Verification → **Freeze Audit → FROZEN**. Doc-4B and Doc-4C have completed the full lifecycle; Doc-4D has completed Structure freeze and enters Content Pass-A.

---

## 7 — Open Governance & Carried Dependencies

Resolved/closed governance (no longer open): Doc-4B lineage **D-1** (composition convention, applied), **D-2** (least-privilege slugs carry-forward principle), **D-4** (config governance boundary), **D-5** (outbox audit granularity), **PA-M3** (Module 0 `core.*` POLICY keys — registered via `Doc-3_Policy_Key_Registration_Patch_v1.0`).

**Carried freeze-gate dependencies & escalation markers (open; carried in the FROZEN modules; resolved only through named channels — additive, do not reopen the frozen module):**

| Marker | Module | Topic | Channel |
|---|---|---|---|
| **DC-1** | Doc-4C | Identity cross-module cascade has no `identity` §8 event (org soft-delete cascade; delegation revoke/expiry teardown) | Board: service-call integration (§4.2/§4.4) or Doc-2 §8 event addition |
| **DC-2** | Doc-4C | Organization/vendor verification ownership = Trust (`verification_records`) | Confirm identity-side submission boundary vs. Trust contract |
| **DC-3** | Doc-4C | Platform-governance Admin slugs bind to `staff_super_admin` interim | Doc-2 §7 additive (least-privilege `staff_*`) |
| **DC-4** | Doc-4C | Authentication boundary = Supabase Auth only (infra) | Stable boundary (infra, not a Doc-4C contract) |
| **DC-5** | Doc-4C | `identity.*` POLICY key block absent in Doc-3 §12.2 | Doc-3 §12.2 additive registration |
| **ESC-IDN-SLUG** | Doc-4C | Tenant org-administration slugs absent from Doc-2 §7 minimal set | Doc-2 §7 additive |
| **ESC-IDN-AUDIT** | Doc-4C | Identity audit actions not separately enumerated in Doc-2 §9 | Doc-2 §9 additive |
| **ESC-IDN-DELEG-EXPIRY** | Doc-4C | Doc-2 §5.10 `suspended`-at-validity-expiry disposition unspecified | Doc-2 §5.10 change management |
| **DD-1** | Doc-4D | Vendor verification ownership = Trust (Module 5) | Confirm submission/consumption boundary vs. Trust contract |
| **DD-2** | Doc-4D | Matching/routing **logic** = RFQ (Module 3); Marketplace owns the `vendor_matching_attributes` read-model | Read-model exposed by service; no matching logic in Doc-4D |
| **DD-3** | Doc-4D | Vendor ban = Admin (`ban_actions`, `VendorBanned`); Marketplace reflects `banned` status | Admin-owned; Marketplace consumes |
| **DD-4** | Doc-4D | Category approval = Admin staff (`staff_can_manage_categories`); category entity is Marketplace-owned | Confirm category-lifecycle approval boundary |
| **DD-5** | Doc-4D | Advertisement/custom-domain entitlement gating = Billing (Module 7) | Entitlement checks consumed from Billing |
| **DD-6** | Doc-4D | `marketplace.*` POLICY key block absent in Doc-3 §12.2 | Doc-3 §12.2 additive registration |
| **DD-7** | Doc-4D | `vendor_claim_records` tenancy: Doc-2 §6 platform-owned vs. §3.3/§10.3 Marketplace child | Doc-2 §6/§3.3 reconciliation patch |
| **ESC-MKT-AUDIT** | Doc-4D | Marketplace audit actions not enumerated in Doc-2 §9 (ad lifecycle; product publish/unpublish) | Doc-2 §9 additive |

**Pattern:** carried freeze-gate dependencies are compatible with a frozen module (the module freezes with them documented and routed); their resolution is an **additive patch to the owning document** (Doc-2 §/Doc-3 §12.2/Board) that does **not** reopen the frozen module — as established by the Doc-3 `core.*` registration that satisfied Doc-4B without reopening it.

---

## 8 — Authoring & Freeze Workflow

Per-document lifecycle (governance-disciplined):

```
Structure Proposal  →  Independent Architecture Review  →  Structure Patch  →  Structure FROZEN
Content Pass-A (Pass 1–3 maturity: contract structure)  →  Review  →  Pass-A Patch  →  Pass-A CLOSED
Content Pass-B (Pass 4–5 maturity: hardening — payloads/validation/errors/idempotency)  →  Hard Review  →  Pass-B Patch  →  Patch Verification  →  Freeze Audit  →  Content FROZEN
```

Findings are classified **BLOCKER / MAJOR / MINOR / NITPICK**. A document may freeze with **no open BLOCKER or MAJOR**; MINOR/NITPICK may be deferred at Board discretion. Upstream-dependency items (unregistered POLICY keys, missing audit actions, tenancy tensions) are resolved by **additive patches to the owning document** (Doc-2/Doc-3), carried as DC-/DD-/ESC- markers until then — never resolved locally, never invented. Reviews are independent; the author flags and routes.

---

## 9 — AI-Agent Do / Don't

**DO:** bind to frozen sources by pointer; use the canonical templates and the validation order; declare audit + events + idempotency + rate-limits on mutations; cite effective versions + patch IDs; consume `check_permission` and Module 0 services rather than re-deriving; surface open dependencies inline (DC-/DD-/ESC-); flag-and-halt + escalate on conflict.

**DON'T:** redesign architecture; reopen frozen documents; create or rename entities, aggregates, permissions, events, audit actions, workflows, state machines, or templates; move ownership or module boundaries; alter the Family Map; resolve a carried dependency by invention or local choice; place business logic in Module 0; let a paid plan/config/flag touch trust/eligibility/routing/matching; expose a protected fact through any channel; implement a shadow authorization/notification/matching path in a consuming module.

---

*iVendorz Context Pack v2 — navigation and convention reference only; not authoritative. On any conflict, the cited frozen source governs. No decision, entity, permission, event, POLICY key, or standard is introduced by this pack. Current frozen line: Doc-4A, Doc-4B, Doc-4C (v1.0); Doc-4D Structure (v1.0). Next: Doc-4D Content Pass-A.*
