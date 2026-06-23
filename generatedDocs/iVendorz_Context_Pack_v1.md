# iVendorz — Context Pack v1

| Field | Value |
|---|---|
| Purpose | Compact orientation for AI coding agents and contributors working against the frozen iVendorz corpus. A **navigation and convention reference** — not an authoritative source. |
| Status | v1 — synthesis of the frozen corpus as of the Doc-4C Structure freeze |
| Authoritative? | **No.** This pack summarizes and points; on any conflict the cited source governs. Always cite the source document, never this pack. |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C … |
| Audience | Claude Code, Cursor, AI development agents, backend/QA/integration engineers |

> **How to use:** Start here to orient. Confirm any rule against its cited source before authoring or implementing. This pack introduces **no** decision, entity, permission, event, or standard — it consolidates what the frozen documents already establish.

---

## 1 — Platform Identity

iVendorz is an industrial B2B procurement platform for the Bangladesh market. Positioning (treat recommendations accordingly): **40% B2B Marketplace · 30% Procurement Platform · 20% ERP-Lite · 10% Industrial Vendor Network**. It is **organization-centric**: *Users act; Organizations own* (Architecture §5). The procurement moat is **RFQ routing** — buyer-outcome quality, vendor fairness, capacity awareness, and trust preservation, never pay-to-win.

Marketplace maturity is staged: **Stage A** (Founder-Assisted) → **Stage B** (Assisted) → **Stage C** (Autonomous); the active stage is a platform decision held in POLICY `platform.operating_stage` (Doc-3 §0, §12). Build for 100 → 1,000 → 10,000 vendors before 1,000,000.

---

## 2 — Corpus Inventory & Precedence

Precedence (higher governs on conflict): **Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D…4L**.

| Document | Role | Canonical version | Status |
|---|---|---|---|
| Master_System_Architecture_v1.0_FINAL | Architecture authority | v1.0 FINAL | FROZEN |
| ADR_Compendium_v1 | Decision records | v1 | FROZEN |
| Doc-2 — Domain Model & Database Blueprint | Entities, state machines, tenancy, events, audit | **v1.0.3** (base `…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`) | FROZEN |
| Doc-3 — RFQ Procurement Engine & Operational Spec | Workflows, operating stages, FIXED/POLICY/ORG | **v1.0.2** (base `…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md`) + `Doc-3_Policy_Key_Registration_Patch_v1.0.md` | FROZEN |
| Doc-4A — API Standards & Conventions | The metastandard for all Doc-4 module docs | v1.0 (Pass1–6 + Pass3/4/5/6 Patches v1.0.1 + FreezeAudit Patch v1.0.1) | FROZEN |
| Doc-4B — Platform Core / Shared Kernel (Module 0) | Module 0 contracts | v1.0 (`PassB` + `Freeze_Patch_v1.0.1` + the Doc-3 key registration patch) | FROZEN |
| Doc-4C — Identity & Organization (Module 1) | Module 1 contracts | Structure v1.0 FROZEN; **Content Pass-A authorized (next)** | Structure FROZEN |

**Citation rule (Doc-4A §3.5):** cite the base document section + patch ID where a patch is material (e.g., "Doc-2 §5.4 as amended by PATCH-D2-01"). Use the **effective** version identifiers above (Doc-2 v1.0.3, Doc-3 v1.0.2). Reference documents by their canonical name; the on-disk base filename may differ in patch suffix.

---

## 3 — Module Map (Modular Monolith; one PostgreSQL schema per module)

| # | Module | Schema | Doc-4 | Owns (representative) |
|---|---|---|---|---|
| 0 | Platform Core / Shared Kernel | `core` | 4B (FROZEN) | audit_records, outbox_events, id_sequences, system_configuration, feature_flags |
| 1 | Identity & Organization | `identity` | 4C (Structure FROZEN) | users, organizations, memberships, roles, permissions, role_permissions, organization_workflow_settings, buyer_profiles, delegation_grants |
| 2 | Marketplace & Discovery | `marketplace` | 4D | vendor_profiles, microsites, products, categories, advertisements, profile experience |
| 3 | RFQ Procurement Engine (moat) | `rfq` | 4E | rfqs, routing, matching, quotations, comparison_statements, routing_rules |
| 4 | Business Operations Engine | `operations` | 4F | PO/LOI/challan, trade_invoices, payments, generated documents, Vendor CRM |
| 5 | Trust & Verification | `trust` | 4G | trust_scores, performance_scores, verification_records, fraud signals |
| 6 | Communication | `communication` | 4H | chat, RFQ threads, notifications, email/SMS/WhatsApp logs |
| 7 | Monetization | `billing` | 4I | plans, subscriptions, entitlements, usage quotas, platform_invoices |
| 8 | Admin Operations | `admin` | 4J | moderation, ban actions, category/vendor approval, **system configuration policy/oversight** |
| 9 | AI Layer | `ai` | 4K | regenerable derived artifacts only (advisory; owns no authoritative records) |
| — | Cross-Module Integration & Event Flow Index | — | 4L | non-normative index assembled from source-module contracts |

Cross-module communication only via **Services, Events, Public Contracts** (no direct table access; no cross-module FKs; cross-module refs are bare UUIDv7, service-validated).

---

## 4 — Core Invariants (non-negotiable)

- **One Entity = One Owner · One Aggregate = One Root · One Business Truth = One Source.** Only the owning module exposes contracts over its entities and may transition their state (Doc-4A §4.1, §13.4).
- **Users act; Organizations own.** Active organization context is **server-validated**, never client-asserted (Architecture §5; Doc-4A §5.3). Solo Trader Rule: every user has ≥1 organization.
- **Governance-signal firewalls (FIXED).** The five signals — Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer Vendor Status — are independent with fixed owners. No contract may let one mutate another; paid plans/entitlements/config never gate trust, verification, eligibility, routing fairness, or matching confidence (Architecture §1.5; Doc-3 §12.1; Doc-4A §4B, §18.3).
- **Non-disclosure indistinguishability (FIXED).** Blacklist/exclusion/private-CRM/Buyer-Vendor-Status facts must be undetectable across every channel — responses, errors, counts, ordering, timing, events, notifications. An excluded vendor must look exactly like a never-matched vendor (Doc-4A §7.5; Doc-3 §12.1).
- **FIXED / POLICY / ORG (Doc-3 §12; Doc-4A §18).** FIXED = code/CI-enforced invariant (no override). POLICY = platform-tunable value in `core.system_configuration`, referenced **by key, never by value**. ORG = per-organization setting (Identity-owned) within POLICY bounds.
- **Reference-never-restate (Doc-4A §0.3).** Bind catalogs (permissions §7, events §8, audit §9, POLICY keys Doc-3 §12.2, state machines §5) by pointer; never copy them.
- **Flag-and-halt (Doc-4A §0.6).** On any conflict with a higher/frozen document, halt, record both citations, escalate. **Never invent** an entity, slug, event, POLICY key, audit action, or template — escalate for the owning document's patch.
- **No fabricated activity (FIXED).** Never claim async work completed before it has; never fabricate counts/notifications (Doc-3 §12.1; Doc-4A §15.4).
- **Identifiers.** UUIDv7 is the only canonical machine ID (never changes); `human_ref` is display/lookup convenience (year-scoped, gap-tolerant, never reused). Generated by Module 0 (Doc-4A §8; Architecture §17.2).
- **Transactional outbox.** Business write + event insert in one transaction; at-least-once delivery; consumers idempotent; thin payloads (Architecture §15; Doc-4A §16).
- **Audit is immutable and never bypassed.** Append-only; the only mutation is compliance redaction (itself audited). Audit ≠ events — declare both (Architecture §14; Doc-4A §17).
- **Authentication = Supabase Auth only.** Authorization, membership, org context, and identity records are Identity's (Module 1); the auth flow itself is infrastructure (Doc-4A §5).

---

## 5 — Doc-4A Contract Standards — Quick Reference

**Templates (Doc-4A §21):** 21.1 Endpoint (base) · 21.2 Integration (event-driven, authored once by the source module) · 21.3 Query (reads) · 21.4 Command (mutations) · 21.5 System Actor (Phase-2 async workers; `Response: none`; `Correlation: phase2-origin`) · 21.6 Admin (platform-staff; no active org context, §5.6). Every Response Contract includes `reference_id : uuid : always` (§22.1 C-05 / P6-B01); 21.5 is exempt.

**Authorization (§6 / §6B):** three-layer check — active **Membership + Permission Slug + Resource Scope**, OR an active **Delegation Grant**. Slugs only (`can_*` org space, `staff_*` platform space); never role or plan names. Delegation = the only path for one org to act for a vendor profile it doesn't control (five-condition check; four-attribution rule; controlling org pays/owns).

**Validation order (§11.2):** SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → REF → BUSINESS → POLICY. Authorization precedes semantics (disclosure control).

**Error model (§12):** closed class set — VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Codes namespaced `<module_prefix>_<domain>_<code>` (Appendix B). Protected-fact failures collapse to NOT_FOUND (indistinguishable).

**Idempotency (§14):** mutating ops declare `Idempotency: required` + dedup window (POLICY key). Joint rule on replay: same result, **no** duplicate audit record, **no** duplicate outbox event.

**State machines (§13):** contracts declare legal transitions only (verbatim from Doc-2 §5); never introduce a transition; terminal states never reopen; System/Admin transitions never user-invocable.

**Module prefixes / namespaces (Appendix B):** error codes `core_`, `identity_`, `marketplace_`, `rfq_`, `ops_`, `trust_`, `comm_`, `billing_`, `admin_`, `ai_`. POLICY keys `core.system_configuration.<domain>.<key>`.

---

## 6 — Current Build Status

| Layer | State |
|---|---|
| Architecture, ADRs, Doc-2, Doc-3 | FROZEN |
| Doc-4A (standards) | FROZEN |
| Doc-4B (Module 0 — Platform Core) | **FROZEN** (PassB + Freeze Patch v1.0.1 + Doc-3 key registration) |
| Doc-4C (Module 1 — Identity) | **Structure v1.0 FROZEN; Content Pass-A authorized (next)** |
| Doc-4D … Doc-4L | Not started (sequence per Doc-4A §1.3 family map) |

**Authoring sequence reminder:** Module 0 is the shared kernel every module binds to (audit, outbox, IDs, POLICY, flags) — frozen first; Identity (Module 1) is the authorization root — next.

---

## 7 — Open Governance & Dependencies

**Carried governance decisions (Doc-4B lineage):**

| ID | Topic | Status |
|---|---|---|
| D-1 | Internal-service template composition convention | **Board Decision Pending** (composition applied as interim per Doc-4B precedent; no new Doc-4A template) |
| D-2 | Least-privilege permission slugs | **Carry Forward** — `staff_super_admin` / `staff_can_redact_audit` authoritative; finer slugs are a future Doc-2 §7 additive enhancement |
| D-4 | Configuration governance boundary | **Approved** — Module 0 stores/exposes config; Module 8 governs oversight; no Doc-4B ownership change |
| D-5 | Outbox audit granularity | **Approved** — "service-role sensitive operations" at run/batch granularity; no per-event audit; no new audit action |
| PA-M3 | Module 0 `core.*` POLICY keys | **Resolved** — 18 keys registered via `Doc-3_Policy_Key_Registration_Patch_v1.0` |

**Open Doc-4C freeze-gate dependencies (carried; resolve through named channels; never silently):**

| ID | Topic | Channel |
|---|---|---|
| DC-1 | Identity cross-module cascade has no Doc-2 §8 event | Board decision: service-call integrations (§4.4) or a Doc-2 §8 event addition. Template 21.2 not instantiated for DC-1 legs until resolved. |
| DC-2 | Organization verification ownership | `verification_records` are Trust-owned (Doc-4G); confirm the identity-side submission boundary |
| DC-3 | Platform-governance Admin slugs | Per D-2 carry-forward — `staff_super_admin` interim; future Doc-2 §7 slugs |
| DC-4 | Authentication boundary | Supabase Auth = authentication only; auth-flow is infrastructure, not a Doc-4C contract |
| DC-5 | `identity.*` POLICY keys | Doc-3 §12.2 additive registration (same channel as the Doc-4B `core.*` block) |

---

## 8 — Authoring & Freeze Workflow

Per-document lifecycle (governance-disciplined):

```
Structure Proposal  →  Independent Architecture Review  →  Structure Patch  →  Structure FROZEN
Content Pass-A (Pass 1–3 maturity)  →  Review  →  Pass-A Patch
Content Pass-B (Pass 4–5 maturity; hardening)  →  Hard Review  →  Freeze Patch(es) [+ upstream patches]  →  Content FROZEN
```

Findings are classified **BLOCKER / MAJOR / MINOR / NITPICK**. Upstream-dependency blockers (e.g., unregistered POLICY keys, missing audit actions) are resolved by additive patches to the owning document (Doc-2/Doc-3), not by redesign. Reviews are independent; the author flags and routes, never invents.

---

## 9 — AI-Agent Do / Don't

**DO:** bind to frozen sources by pointer; use the canonical templates and the validation order; declare audit + events + idempotency on mutations; cite effective versions + patch IDs; run the Doc-4A Appendix A checklist before submitting; surface open dependencies inline; flag-and-halt + escalate on conflict.

**DON'T:** redesign architecture; reopen frozen documents; create or rename entities, aggregates, permissions, events, workflows, state machines, or templates; move ownership or module boundaries; alter the Family Map; resolve a carried dependency by invention; place business logic in Module 0; let a paid plan/config/flag touch trust/eligibility/routing/matching; expose a protected fact through any channel.

---

*iVendorz Context Pack v1 — navigation and convention reference only; not authoritative. On any conflict, the cited frozen source governs. No decision, entity, permission, event, POLICY key, or standard is introduced by this pack.*
