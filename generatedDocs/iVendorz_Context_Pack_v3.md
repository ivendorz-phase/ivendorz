# iVendorz — Context Pack v3

| Field | Value |
|---|---|
| Purpose | Compact orientation for AI coding agents and contributors working against the frozen iVendorz corpus. A **navigation and convention reference** — not an authoritative source. |
| Status | v3 — synthesis as of the **Doc-4D freeze** (supersedes Context Pack v2 @ Doc-4D Structure freeze; v1 @ Doc-4C Structure freeze). |
| Authoritative? | **No.** Summarizes and points; on conflict the cited source governs. Cite the source document, never this pack. |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E…4L … |
| Audience | Claude Code, Cursor, AI development agents, backend/QA/integration engineers |

> **How to use:** Orient here; confirm any rule against its cited source before authoring/implementing. This pack introduces **no** decision/entity/permission/event/standard. **What changed since v2:** **Doc-4D (Marketplace & Discovery, Module 2) is FROZEN v1.0** — full package (Structure + Pass-A + Pass-B, each amended by its patch). The carried-dependency register adds **DD-1…DD-8** + **`[ESC-MKT-AUDIT]`** (Doc-4D). Next module: **Doc-4E (RFQ Procurement Engine, Module 3)**.

---

## 1 — Platform Identity

Industrial B2B procurement platform, Bangladesh market. Positioning: **40% B2B Marketplace · 30% Procurement · 20% ERP-Lite · 10% Industrial Vendor Network**. Organization-centric: *Users act; Organizations own* (Architecture §5). Procurement moat = **RFQ routing** (buyer-outcome quality, vendor fairness, capacity awareness, trust preservation; never pay-to-win). Maturity staged Stage A → B → C (POLICY `platform.operating_stage`). Build for 100 → 1,000 → 10,000 vendors before 1,000,000.

---

## 2 — Corpus Inventory & Precedence

Precedence (higher governs): **Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D → Doc-4E…4L**.

| Document | Role | Version | Status |
|---|---|---|---|
| Master_System_Architecture_v1.0_FINAL | Architecture authority | v1.0 FINAL | FROZEN |
| ADR_Compendium_v1 | Decision records | v1 | FROZEN |
| Doc-2 — Domain Model & DB Blueprint | Entities, state machines, tenancy, events, audit | **v1.0.3** | FROZEN |
| Doc-3 — RFQ Procurement Engine & Operational Spec | Workflows, stages, FIXED/POLICY/ORG | **v1.0.2** (+ Policy-Key-Reg Patch v1.0) | FROZEN |
| Doc-4A — API Standards & Conventions | Metastandard for all Doc-4 | v1.0 (Pass1–6 + patches + FreezeAudit v1.0.1) | FROZEN |
| Doc-4B — Platform Core / Shared Kernel (M0) | Module 0 contracts | v1.0 (PassB + Freeze Patch v1.0.1) | **FROZEN** |
| Doc-4C — Identity & Organization (M1) | Module 1 contracts | v1.0 (PassB + PassB Patch v1.0.1) | **FROZEN** |
| Doc-4D — Marketplace & Discovery (M2) | Module 2 contracts | v1.0 (Structure FROZEN + Pass-A+Patch v1.0.1 + Pass-B[master+Parts A–E]+Patch v1.0.1) | **FROZEN** |

**Citation rule (Doc-4A §3.5):** cite base § + patch ID. Effective: Doc-2 v1.0.3, Doc-3 v1.0.2. Frozen Doc-4 module = content/structure **as amended by its freeze/approval patch** (e.g., Doc-4D = Structure_v1.0_FROZEN + Pass-A(+Patch v1.0.1) + Pass-B[master+Parts A–E](+Patch v1.0.1)). **Doc-4D Pass-B is a split pack:** master/index (§B conventions + §D0–§D13 consolidations + appendices) + five Part files (A VendorProfile · B CatalogProductSpec · C ProfileExperience · D AdvertisingFavorites · E Discovery).

---

## 3 — Module Map (Modular Monolith; one PostgreSQL schema per module)

| # | Module | Schema | Doc-4 | Owns (representative) | Doc-4 status |
|---|---|---|---|---|---|
| 0 | Platform Core / Shared Kernel | `core` | 4B | audit_records, outbox_events, id_sequences, system_configuration, feature_flags | **FROZEN** |
| 1 | Identity & Organization | `identity` | 4C | users, organizations, memberships, roles, permissions, role_permissions, organization_workflow_settings, buyer_profiles, delegation_grants | **FROZEN** |
| 2 | Marketplace & Discovery | `marketplace` | 4D | vendor_profiles (+capacity/tier/history/claim/ownership/profile-experience/custom_domains), categories, products, spec library, microsites, advertisements, showcase, catalog_favorites, vendor_matching_attributes | **FROZEN** |
| 3 | RFQ Procurement Engine (moat) | `rfq` | 4E | rfqs, routing, matching, quotations, comparison_statements, routing_rules | **Authorized next** |
| 4 | Business Operations Engine | `operations` | 4F | PO/LOI/challan, trade_invoices, payments, generated documents, Vendor CRM | Not started |
| 5 | Trust & Verification | `trust` | 4G | trust_scores, performance_scores, verification_records, verified_financial_tiers, fraud signals | Not started |
| 6 | Communication | `communication` | 4H | chat, RFQ threads, notifications, email/SMS/WhatsApp logs | Not started |
| 7 | Monetization | `billing` | 4I | plans, subscriptions, entitlements, usage quotas, platform_invoices | Not started |
| 8 | Admin Operations | `admin` | 4J | moderation, ban_actions, category/vendor approval, import jobs, system config oversight | Not started |
| 9 | AI Layer | `ai` | 4K | regenerable derived artifacts (advisory; owns no authoritative records) | Not started |
| — | Cross-Module Integration & Event Flow Index | — | 4L | non-normative index | Not started |

Cross-module only via **Services, Events, Public Contracts** (no direct table access; no cross-module FKs; refs are bare UUIDv7, service-validated).

---

## 4 — Core Invariants (non-negotiable)

- **One Entity = One Owner · One Aggregate = One Root · One Business Truth = One Source** (Doc-4A §4.1, §13.4).
- **Users act; Organizations own.** Active-org context **server-validated** (Architecture §5; Doc-4A §5.3). Solo Trader: every user ≥1 org.
- **Governance-signal firewalls (FIXED).** Trust Score, Performance Score, Financial Tier, Capacity Profile, Buyer-Vendor Status — independent, fixed owners; no signal mutates another; paid plans/config never gate trust/verification/eligibility/routing/matching (Architecture §1.5; Doc-3 §12.1; Doc-4A §4B, §18.3). *(Marketplace owns the **declared** Financial Tier + projects trust/perf/verified bands into the `vendor_matching_attributes` read-model; verified tier is Trust's; Marketplace never computes matching — DD-2.)*
- **Non-disclosure indistinguishability (FIXED).** Blacklist/exclusion/private-CRM/Buyer-Vendor-Status facts undetectable across every channel (Doc-4A §7.5; Doc-3 §12.1).
- **FIXED / POLICY / ORG (Doc-3 §12; Doc-4A §18).** FIXED = code/CI invariant. POLICY = tunable in `core.system_configuration`, referenced **by key**. ORG = per-org setting within POLICY bounds.
- **Reference-never-restate (Doc-4A §0.3).** Bind catalogs (permissions §7, events §8, audit §9, POLICY §12.2, state machines §5) by pointer.
- **Flag-and-halt (Doc-4A §0.6).** On conflict with a higher/frozen doc: halt, record both citations, escalate. **Never invent.** *(Demonstrated: Doc-4B/4C and Doc-4D family-map label-slips halted + Board-reconciled; never worked around.)*
- **Identifiers.** UUIDv7 only canonical machine ID; `human_ref` display/lookup (year-scoped, gap-tolerant, never reused); generated by Module 0 (Doc-4A §8).
- **Transactional outbox.** Business write + event insert one transaction; at-least-once; consumers idempotent; thin payloads (Architecture §15; Doc-4A §16).
- **Audit immutable, never bypassed.** Append-only; only mutation = compliance redaction (audited). Audit ≠ events (Architecture §14; Doc-4A §17).
- **Authentication = Supabase Auth only.** Authorization/membership/org-context/identity records = Identity (M1); auth flow = infrastructure (Doc-4A §5).
- **Single-authorship (Doc-4A §4.4).** Event-delivery integration (21.2) authored by the **emitting** module; consumers handle their own effects. *(Marketplace emits; Communication authors notifications.)*

---

## 5 — Doc-4A Contract Standards — Quick Reference

**Templates (§21):** 21.1 Endpoint · 21.2 Integration (emitter-authored) · 21.3 Query · 21.4 Command · 21.5 System (`Response: none`) · 21.6 Admin (no active org context, §5.6). Every Response carries `reference_id : uuid : always` (§22.1 C-05/P6-B01); 21.5 exempt.

**Authorization (§6/§6B):** three-layer (active **Membership + Permission Slug + Resource Scope**) OR active **Delegation Grant**. Slugs only (`can_*`, `staff_*`); never role/plan names. Identity `check_permission` (Doc-4C §C3/§C8) = single authoritative resolution; no shadow checks.

**Validation order (§11.2):** SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION → STATE → **REFERENCE** → BUSINESS → POLICY. *(REFERENCE is stage 7 — after STATE; never reordered, §B.4.)*

**Error model (§12):** closed class set — VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Codes `<module_prefix>_<domain>_<code>`. Protected-fact failures → NOT_FOUND collapse.

**Rate limits (§19.3 / CHK-215):** Category 9 POLICY limit rule → Rate-Limit block. *(Doc-4D triggered none — no POLICY-limit stage.)*

**Idempotency (§14):** mutations `Idempotency: required` + dedup window (POLICY key); replay → same result, no dup audit, no dup event.

**Namespaces (Appendix B):** `core_` (4B), `identity_` (4C), `marketplace_` (4D), `rfq_` (4E), `ops_` (4F), `trust_` (4G), `comm_` (4H), `billing_` (4I), `admin_` (4J), `ai_` (4K). POLICY keys `core.system_configuration.<domain>.<key>`.

---

## 6 — Current Build Status

| Layer | State |
|---|---|
| Architecture, ADRs, Doc-2, Doc-3, Doc-4A | FROZEN |
| Doc-4B (M0 — Platform Core) | **FROZEN v1.0** |
| Doc-4C (M1 — Identity) | **FROZEN v1.0** |
| Doc-4D (M2 — Marketplace & Discovery) | **FROZEN v1.0** (Structure + Pass-A + Pass-B, each amended by patch; Freeze Audit: FREEZE WITH NITPICKS) |
| Doc-4E … Doc-4L | Not started — **Doc-4E (RFQ, M3) authorized next**, then 4F Operations, 4G Trust, 4H Communication, 4I Billing, 4J Admin, 4K AI, 4L Integration Index |

**Per-document lifecycle (proven across 4B/4C/4D):** Structure Proposal → Independent Hard Review → Structure Patch → **Structure FROZEN** → Content Pass-A → Review → Pass-A Patch → **Pass-A CLOSED/APPROVED** → Content Pass-B (hardening) → Hard Review → Pass-B Patch → Patch Verification → **Freeze Audit → FROZEN**. A module may freeze with **no open BLOCKER/MAJOR/MINOR**; NITPICK deferrable. Large modules may split Pass-B by area (Doc-4D: master + 5 Parts).

---

## 7 — Open Governance & Carried Dependencies

Resolved (no longer open): Doc-4B D-1/D-2/D-4/D-5, PA-M3 (`core.*` POLICY keys registered via `Doc-3_Policy_Key_Registration_Patch_v1.0`).

**Carried freeze-gate dependencies & escalation markers (open; carried in the FROZEN modules; resolved only via named channels — additive, do not reopen the frozen module):**

| Marker | Module | Topic | Channel |
|---|---|---|---|
| **DC-1** | 4C | Identity cross-module cascade has no `identity` event | Board (service-call §4.4 / Doc-2 §8 addition) |
| **DC-2** | 4C | Org/vendor verification = Trust | Trust submission boundary |
| **DC-3** | 4C | Platform-governance Admin slugs (`staff_super_admin` interim) | Doc-2 §7 additive |
| **DC-4** | 4C | Auth boundary = Supabase Auth (infra) | stable |
| **DC-5** | 4C | `identity.*` POLICY keys | Doc-3 §12.2 additive |
| **ESC-IDN-SLUG** | 4C | tenant org-admin slugs absent in §7 | Doc-2 §7 additive |
| **ESC-IDN-AUDIT** | 4C | identity audit actions not in §9 | Doc-2 §9 additive |
| **ESC-IDN-DELEG-EXPIRY** | 4C | §5.10 suspended-at-expiry disposition | Doc-2 §5.10 change mgmt |
| **DD-1** | 4D | vendor verification = Trust (M5) | Trust contract boundary |
| **DD-2** | 4D | matching/routing logic = RFQ (M3); Marketplace owns the read-model | read-model by service; no matching in 4D |
| **DD-3** | 4D | vendor ban = Admin (M8; `ban_actions`/`VendorBanned`) | Admin-owned decision |
| **DD-4** | 4D | category approval = Admin staff (`staff_can_manage_categories`) | category-lifecycle approval boundary |
| **DD-5** | 4D | ad/custom-domain entitlement = Billing (M7) | entitlement consumed from Billing |
| **DD-6** | 4D | `marketplace.*` POLICY keys | Doc-3 §12.2 additive |
| **DD-7** | 4D | `vendor_claim_records` tenancy (§6 platform vs §3.3/§10.3 marketplace) | Doc-2 §6/§3.3 reconciliation |
| **DD-8** | 4D | vendor ban-lift event gap (no `VendorBanLifted` in §8); `reflect_vendor_ban_lift.v1` non-implementable placeholder | Doc-2 §8 additive |
| **`[ESC-MKT-AUDIT]`** | 4D | marketplace audit actions not in §9 (ad lifecycle; product publish/unpublish; category create/edit) | Doc-2 §9 additive |

**Doc-4D editorial-integration notes (non-gating, carried at freeze):** (1) N-01 — reposition REFERENCE after STATE in `reflect_verified_claim_status.v1` + `reflect_vendor_ban.v1` (§B.4); (2) m-03 — apply per-Contract-ID section split (Pass-B Patch §5).

**Pattern:** carried dependencies are compatible with a frozen module; resolution is an **additive patch to the owning document** (Doc-2 §/Doc-3 §12.2/Board) that does **not** reopen the frozen module (as the Doc-3 `core.*` registration satisfied Doc-4B).

---

## 8 — AI-Agent Do / Don't

**DO:** bind to frozen sources by pointer; use canonical templates + validation order; declare audit + events + idempotency (+ rate-limits where a POLICY-limit applies); cite effective versions + patch IDs; consume `check_permission` + Module 0 services rather than re-deriving; surface open dependencies inline (DC-/DD-/ESC-); flag-and-halt + escalate on conflict.

**DON'T:** redesign architecture; reopen frozen documents; create/rename entities, aggregates, permissions, events, audit actions, workflows, state machines, or templates; move ownership or module boundaries; alter the Family Map; resolve a carried dependency by invention or local choice; place business logic in Module 0; let a paid plan/config/flag touch trust/eligibility/routing/matching; expose a protected fact; implement a shadow authorization/notification/matching path in a consuming module. *(Doc-4D specifics: never author RFQ matching/routing/ranking/selection — DD-2; never coin `VendorBanLifted` — DD-8; Trust decides / Marketplace reflects — DD-1; Marketplace emits / Communication authors notifications.)*

---

*iVendorz Context Pack v3 — navigation and convention reference only; not authoritative. On conflict, the cited frozen source governs. No decision/entity/permission/event/POLICY-key/standard introduced here. Frozen line: Doc-4A, Doc-4B, Doc-4C, Doc-4D (all v1.0). Next: Doc-4E Structure (RFQ Procurement Engine, Module 3).*
