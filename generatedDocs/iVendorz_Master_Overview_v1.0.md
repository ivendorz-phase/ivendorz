# iVendorz — Master Project Overview

> **Tagline:** *The Industrial Procurement Operating System for Bangladesh — governed
> RFQ matching that delivers the right lead to the right vendor at the right scale.*

**Version:** 1.4
**Classification:** **Non-authoritative orientation document.** Summarizes the frozen
corpus; never overrides it. Updated through **additive patch only**. "Skill-Ready" =
suitable as AI bootstrap/skill context, **not** a frozen architecture artifact.
**Change control:** additive patches only; on any conflict the referenced frozen document
wins and this doc is patched to match.
**Date:** 2026-06-22
**Purpose:** Single-source onboarding and reference document. Consolidates the
architecture, domain model, module map, governance invariants, document-production
methodology, and current build state. Read this first; then drill into the specific
frozen documents it references.

---

## 0. How to Use This Document

This is the **map**, not the territory. Authoritative detail lives in the frozen
corpus (Doc-2, Doc-3, Doc-4A…4E, the ADR Compendium, and the Master System
Architecture). When this overview and a frozen document disagree, **the frozen
document wins** — and this overview should be patched to match.

Reading order for a new contributor:
1. This document (orientation).
2. `Master_System_Architecture_v1.0_FINAL.md` (the why).
3. `ADR_Compendium_v1.md` (the decisions).
4. `Doc-2_Domain_Model_And_Database_Blueprint` (the data).
5. `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification` (the moat workflow).
6. `Doc-4A` (API metastandard) → then the per-module contract docs `Doc-4B…4M`
   (B=M0 … K=M9, L=Integration Index, M=State Machine Contracts).

---

## 1. What iVendorz Is

**iVendorz is the Industrial Procurement Operating System for Bangladesh** — a
multi-tenant SaaS platform serving industrial buyers (factories, plants, EPC
contractors, procurement teams) and the vendors who supply them.

**Product blend:**

| Share | Capability |
|------:|------------|
| 40% | B2B industrial marketplace (verified vendor directory, microsites, discovery) |
| 30% | Procurement platform (structured RFQ → quotation → award) |
| 20% | ERP-lite operations (post-award documents, finance records) |
| 10% | Professional vendor network (vendor identity, CRM, reputation) |

**Core flow:** Buyer posts a structured RFQ → platform routes it to capability-matched
verified vendors → vendors submit priced quotations → buyer compares and awards →
both parties execute the post-award commercial workflow (LOI, PO, delivery challan,
trade invoice, payment records, work-completion certificates) inside the platform.

**What the platform does NOT do:** it never handles buyer↔vendor transaction money —
no escrow, no wallet, no settlement. It earns only its **own** revenue: subscriptions,
lead packages, advertising, microsite fees, platform service fees. (Escrow is
*deferred, not rejected* — the schema captures commercial intelligence so a future
financial-services module can be added without core redesign.)

**Defensibility / moat:**
- The **RFQ procurement engine** — a governed, capability-aware matching and routing
  system that delivers the right lead to the right vendor at the right scale.
- The **post-award document workflow + vendor CRM** — retention moat; buyers keep
  their commercial history and private vendor intelligence on-platform.

**Market & scaling strategy:** Bangladesh industrial sector. Build to optimize for
**100 → 1,000 → 10,000** vendors *before* worrying about 1,000,000.

---

## 2. Architecture at a Glance

**Style:** Serverless **Modular Monolith**. One Next.js deployable, internally divided
into **10 strictly bounded modules**. Domain-Driven Design. Multi-tenant,
**default-private** (the Organization is the tenant boundary). TypeScript end-to-end.
Fewest moving parts; managed/serverless infrastructure over self-hosted.

### 2.1 Tech Stack

| Concern | Technology | Role |
|---------|-----------|------|
| Frontend | Next.js App Router + React + Tailwind + shadcn/ui | SSR/SSG for SEO; one stack public + app |
| Backend | Next.js route handlers (primary) + server actions where ergonomic (secondary) — TypeScript | Same codebase; route-handler-driven, server actions secondary; logic in module folders |
| Database | Supabase PostgreSQL | System of record; one schema per module |
| ORM | Prisma | Single source of data truth |
| Auth | Supabase Auth | Authentication only (login, sessions, OTP) |
| Storage | Supabase Storage | Files, images, generated documents |
| Realtime | Supabase Realtime | In-platform chat, live notifications |
| Async jobs | Inngest | Matching, routing, notifications, doc generation, imports |
| Hosting | Vercel | Single deploy |
| Email | Resend | Transactional email |
| Analytics | PostHog | Funnels (acquisition → RFQ → quotation → won) |
| Search | Postgres full-text (now); Meilisearch (future ADR) | FTS covers current scale |
| AI | Claude + OpenAI APIs (future activation) | RFQ structuring, matching assist, quote comparison |

**Baseline runtime versions:** Node ≥ 20 LTS · TypeScript ≥ 5.x · Next.js 15 (App
Router). Versions are baselines; exact pins live in `package.json` once code exists.

### 2.2 Cross-Cutting Decisions

- **Authorization in the app layer.** Supabase RLS is a defense-in-depth backstop,
  **not** the authorization model.
- **Identifiers:** UUIDv7 for all machine IDs; separate human-friendly references
  (e.g. `ORG-2026-000001`, `RFQ-2026-000123`) generated by Module 0, year-scoped,
  never reused.
- **Multi-currency-ready:** BDT is the current currency; every value field stores
  currency explicitly so multi-currency can be added without redesign.
- **Event delivery via transactional outbox** (Module 0) → Inngest consumers.

---

## 3. The 10 Modules

Communication between modules is by **services, events, and public contracts only** —
no cross-module table access, no cross-module foreign keys. One module, one owner.

**Module Owner** = the DB schema and contract document that exclusively own each module.

| # | Module | Owner (schema · doc) | Owns (summary) | Role |
|---|--------|----------------------|----------------|------|
| **M0** | Platform Core / Shared Kernel | `core` · Doc-4B | audit records, outbox events, ID generation, system configuration, feature flags | Infrastructure only — never business logic |
| **M1** | Identity & Organization | `identity` · Doc-4C | users, organizations, memberships, roles, permissions, delegation | "Users act; Organizations own" |
| **M2** | Marketplace & Discovery | `marketplace` · Doc-4D | vendor profiles, microsites, products, projects, categories, ads, favorites, presentation | Engine 1 — Acquisition (SEO-first) |
| **M3** | RFQ Procurement Engine | `rfq` · Doc-4E | RFQs, routing, matching, sorting, invitations, quotations, comparison | Engine 2 — Core moat |
| **M4** | Business Operations | `operations` · Doc-4F | post-award docs (LOI/PO/challan/invoice/payment/WCC), finance records, Vendor CRM | Engine 3 — Retention |
| **M5** | Trust & Verification | `trust` · Doc-4G | trust scores, performance scores, verification records, fraud signals | Governance source of truth |
| **M6** | Communication | `comms` · Doc-4H | chat, RFQ threads, notifications, email/SMS/WhatsApp logs | Delivery only |
| **M7** | Monetization | `billing` · Doc-4I | plans, subscriptions, entitlements, usage quotas, lead credits, platform invoices | Commercial layer |
| **M8** | Admin Operations | `admin` · Doc-4J | moderation, bans, category approval, vendor approval, import, config policy | Internal operations |
| **M9** | AI Layer (reserved) | `ai` · Doc-4K | only regenerable derived artifacts (recommendations, predictions, classifications) | "AI suggests; modules decide" |

### 3.1 Module Notes Worth Knowing

- **M1:** every user belongs to ≥1 organization (Solo Trader auto-creates a Personal
  Org). Organizations may be Buyer, Vendor, or Hybrid simultaneously. Membership state
  machine: Invited → Pending → Active → Suspended → Removed.
- **M2:** owns *presentation* (themes/layouts/branding/SEO/custom domains) separate
  from *business data*. May **read** trust scores but never calculate them. Owns no
  RFQs/quotations/subscriptions.
- **M3:** the RFQ is a state machine (see §5). Owns the routing pipeline. Reads
  buyer-vendor status from M4 via service; reads trust/tier from M5; never owns scores.
- **M4:** Vendor CRM holds **private** buyer intelligence — including buyer-defined
  vendor status (Approved/Conditional/Blacklisted) keyed `(buyer_org_id,
  vendor_profile_id, status)`, visible only to that buyer.
- **M5:** Admin Operations may approve/reject verification, but **Trust stores the
  records** — Admin decides, Trust owns.
- **M7:** uses an **entitlement system** (boolean / numeric / enum), never plan-name
  checks. Subscriptions owned by Organizations only. Platform invoices ≠ trade invoices
  (M4).
- **M9:** owns no authoritative records; consumes data via APIs only; may not train
  public models on private RFQ content.

---

## 4. Governance Signals (Firewalled)

Five **independent** governance dimensions. They must never cross-contaminate.

| Signal | Question | Owner | Scope |
|--------|----------|-------|-------|
| **Trust Score** (0–100) | Can they be trusted? | M5 | Platform-wide |
| **Capacity Profile** | Can they execute the work? | M2 data / M5 verification | Platform-wide |
| **Financial Tier** (A–E) | What project size should they receive? | M5 | Platform-wide |
| **Performance Score** (0–100) | How well do they actually perform? | M5 | Platform-wide |
| **Buyer Vendor Status** | Does *this buyer* want them? | M4 (CRM) | Private to one buyer |

**Firewall rules (binding everywhere):**
- Financial Tier must **never** raise Trust Score (large ≠ trustworthy).
- Financial Tier does **not** affect Performance Score.
- Buyer Approved/Blacklisted status must **never** mutate platform-wide scores.
- Secondary trust signals must never dominate trust calculation.
- No single governance signal may dominate a matching decision.

### 4.1 Financial Tier Framework (BDT)

| Tier | Project Value | Typical Vendor |
|------|---------------|----------------|
| A | 0 – 5 Lac | Retail supplier, small service provider |
| B | 5 – 25 Lac | Importer, small contractor |
| C | 25 Lac – 1 Crore | Engineering firm, fabricator, medium manufacturer |
| D | 1 – 5 Crore | Large EPC, major manufacturer |
| E | 5 Crore+ | Enterprise / national supplier |

**Tier = Claim; Capacity = Evidence.** Capacity contradicting the declared tier reduces
matching confidence. Stage 1 = vendor-declared tier; Stage 2 = platform-verified tier.
Matching rule: vendor eligible when RFQ value ≤ vendor tier ceiling.

### 4.2 Vendor Capability Matrix (four flags, never a type)

`can_supply` · `can_service` · `can_fabricate` · `can_consult`. Six preset types
(Consultant, MRO / Retail Supplier, Importer / Equipment Seller, Manufacturer / Workshop,
Engineering Firm, Service Provider) seed the flags; vendors may override. RFQ carries
`work_nature`; vendor flags must **cover** it. A supply-only RFQ never reaches a pure
consultant. *(Mirror of the re-frozen Architecture §Invariant 1 register per AMD-MA-VTP-1;
non-authoritative — the Master register governs on any divergence.)*

---

## 5. RFQ Lifecycle & Routing Pipeline (the moat)

> **State Machine Contract Authority:** all lifecycle/state definitions below are
> summaries. The authoritative state-machine contracts live in **Doc-4M**; on any
> conflict, Doc-4M wins.

### 5.1 RFQ State Machine

```
draft → pending_internal_approval (optional, per org) → submitted → under_review
      → matching → vendors_notified → quotations_received → buyer_reviewing
      → shortlisted → closed_won | closed_lost
      (cancelled reachable from any active state)
```

**Version immutability:** once any quotation is submitted against RFQ v1, v1 becomes
immutable; changes create v2/v3/v4. Each quotation records which RFQ version it answered.

### 5.2 Five-Step Routing Pipeline (deterministic — order matters)

1. **Buyer Filter** — routing mode + blacklist floor; a binary gate, applied FIRST.
2. **Category Match** — primary categories 100%, secondary 40%.
3. **Verification Eligibility + Probation Pool** — default 80/20 verified/new split.
4. **Financial Tier Eligibility** — RFQ value ≤ vendor tier ceiling.
5. **Matching Confidence scoring** — Tier + Capacity + Performance + Trust; no single
   signal dominates.

**Routing modes:** Approved Only · Approved+Conditional · Approved+Open Market ·
Open Market (default).

**Non-disclosure invariant (blacklist):** a vendor must **never** detect they were
blacklisted. No notification, no lead record, no analytics trace, no error, no
"not eligible" state — silent absence, indistinguishable from an ordinary non-match.
Enforced at routing (auditable), never at presentation. Buyer filter applies *before*
probation injection; blacklist never crosses tenant boundary.

---

## 6. Vendor Identity & Ownership

- **Vendor Profile** = durable marketplace identity with exactly **one Controlling
  Organization** (legal/operational owner) at a time.
- **Authorized Representatives** (0..N orgs) hold scoped Delegation Grants — may submit
  quotations and manage leads; may never transfer ownership, change subscription, delete
  the profile, or modify verification.
- **One vendor = one active quotation per RFQ.** Another representative may replace a
  draft, create a revision, or withdraw — never produce a second active quote.
- **Quota attribution:** all usage charged to the Controlling Organization, regardless
  of which representative acted. *Representatives act; owners pay.*
- **Trust Score is attached to the Vendor Profile** and survives ownership change.
- **Ownership Transfer Trust Protection:** Transfer Requested → Approved → Trust Freeze
  → Compliance Review → Reactivation — prevents trust laundering. Permanent ownership
  history retained.
- **Claim lifecycle:** seeded → invited → claimed → verified. **Visibility scopes:**
  `buyer_private` | `public`. A buyer's private vendor record may *link* to a public
  record without merging; private notes/ratings/history stay private forever.

---

## 7. Core Invariants (12)

1. Vendor capability is a **matrix** (four flags), not a label.
2. Two independent role dimensions: Platform Participation (Buyer/Vendor/Hybrid/Staff)
   ≠ Organization Role (Owner/Director/Manager/Officer).
3. Vendor records carry a claim lifecycle + visibility scope.
4. RFQ is a state machine with a control plane (lifecycle / routing / throttling /
   sorting / scoring).
5. **Users act; Organizations own** (every user ≥1 org; every business record in an
   org; server-validated active org context — client-supplied org ID never trusted).
6. Governance signals are firewalled (five independent, no cross-mutation).
7. One module, one owner (no cross-table access; references by ID only).
8. Nothing authoritative is overwritten or hard-deleted (versioned docs, soft-deleted
   records, immutable audit, IDs never reused).
9. Content ≠ Presentation.
10. Two distinct "tiers": Financial Tier (capability) ≠ Subscription Plan (commercial).
11. Private exclusion stays private, forever (blacklist undetectable).
12. AI suggests; business modules decide.

---

## 8. Persistence, Audit & Events

- **Soft delete everywhere** for critical records: `deleted_at`, `deleted_by`,
  `delete_reason`; partial unique indexes `UNIQUE … WHERE deleted_at IS NULL`. Restore
  supported; reused unique values get regenerated, original history preserved.
- **Audit** (immutable, M0): `audit_id, actor_id, actor_type, organization_id,
  entity_type, entity_id, action, old_value, new_value, timestamp, ip_address,
  user_agent`. Actor types: User · Admin · System · AI Agent. Redaction is itself
  audited. **Audit answers "what happened"; events answer "what should happen next" —
  separate systems.**
- **Document versioning:** never overwrite; v1→v2→v3 with a required change note; the
  active revision is always marked.
- **Transactional outbox:** business record + event written in the **same transaction**;
  dispatcher delivers async (Inngest). Thin payloads (IDs + minimal metadata);
  consumers must be idempotent. Event names are versioned.
- **Event catalog (illustrative sample only — authoritative catalog = Doc-4J; cross-
  module event-flow map = Doc-4L):** RFQCreated/Submitted/Approved/ClosedWon/ClosedLost;
  VendorClaimed/Verified/Suspended/Banned/TierChanged; TrustScoreUpdated /
  PerformanceScoreUpdated / PerformanceFrozen; Profile/Microsite events.

---

## 9. Authorization & Multi-Tenancy

- **Tenant boundary = Organization.** Default-private: everything private unless granted
  (grant tables: `rfq_recipients`, `quotation_visibility`, `thread_participants`) or
  public by design.
- **3-layer authorization:** `Membership + Permission + Resource Scope = Access`
  **OR** `Active Delegation Grant = Access`.
- **Permission slugs, not role names:** check `can_create_rfq`, never `role == "Manager"`.
- **Roles are bundles:** Owner (all) · Director (RFQ/financial approval, user mgmt) ·
  Manager (RFQ + vendor mgmt) · Officer (RFQ creation, quotation).
- **Platform staff roles** are separate: Support Admin, Verification Admin, Super Admin.

---

## 10. Document-Production Methodology

The corpus is built with a **staged-freeze, precedence-chain discipline**. Structure is
frozen *before* content is authored, so every content pass works against a locked
blueprint.

```
Structure Proposal → Hard / Independent Architecture Review → Structure Patch
   → Structure FROZEN
   → Content Pass-A → Hard Review → Pass-A Patch → Patch Verification → Approved
   → Content Pass-B (hardening) → Hard Review → Pass-B Patch → Patch Verification
   → Freeze Audit → FROZEN
```

Rules:
- A module may freeze only with **no open BLOCKER / MAJOR / MINOR**; NITPICKs are
  deferrable and carried forward.
- Each step is a **separate deliverable**.
- **Carried dependencies** (gaps found in a frozen module) are resolved **additively** —
  never by reopening a frozen document.

---

## 11. Document Map & Current State

| Doc | Subject | Status |
|-----|---------|--------|
| Master System Architecture | The "why" — style, stack, principles | FINAL |
| ADR Compendium | ~20 consolidated architecture decisions | v1 frozen |
| **Doc-2** | Domain Model, Entity Model & Database Blueprint | FROZEN (v1.0.3) |
| **Doc-3** | RFQ Procurement Engine & Operational Specification | FROZEN (v1.0.2) |
| **Doc-4A** | API Standards & Conventions (metastandard for all module contracts) | FROZEN |
| **Doc-4B** | M0 Platform Core / Shared Kernel — API & Integration Contracts | FROZEN |
| **Doc-4C** | M1 Identity & Organization — API & Integration Contracts | FROZEN |
| **Doc-4D** | M2 Marketplace & Discovery — API & Integration Contracts | FROZEN |
| **Doc-4E** | M3 RFQ Procurement Engine — API & Integration Contracts | FROZEN |
| **Doc-4F** | M4 Business Operations — API & Integration Contracts | FROZEN |
| **Doc-4G** | M5 Trust & Verification — API & Integration Contracts | FROZEN |
| **Doc-4H** | M6 Communication — API & Integration Contracts | FROZEN |
| **Doc-4I** | M7 Monetization — API & Integration Contracts | FROZEN |
| **Doc-4J** | M8 Admin Operations — API & Integration Contracts (authoritative event catalog) | FROZEN |
| **Doc-4K** | M9 AI Layer — API & Integration Contracts | FROZEN |
| **Doc-4L** | Cross-module Integration Index / event-flow map | FROZEN |
| **Doc-4M** | State Machine Contracts (authoritative lifecycle/state authority) | FROZEN |

**Overall state:** the **architecture program is COMPLETE**. The full Doc-4 series
(Doc-4A → Doc-4M) is ratified and **FROZEN**. The corpus is the authoritative blueprint
an implementation team (human + AI agents) builds against, with module boundaries
enforced in CI and the 12 invariants treated as unbreakable constraints. The project has
moved from the design phase into **Implementation Governance** (see §12).

### 11.1 Open Carried Dependencies (non-blocking, additive)

> **Status:** historical record only. These were boundary clarifications captured during
> module freezes and are **already resolved** in the now-frozen owning modules. They are
> **not implementation blockers** — listed for traceability.

- **Doc-4C (Identity):** DC-1 cross-module event cascade; DC-2 verification ownership
  (Trust boundary); DC-3 governance Admin slugs; DC-4 auth boundary = Supabase Auth;
  DC-5 `identity.*` POLICY keys; plus tenant org-admin slug / audit-action / delegation-
  expiry escalations.
- **Doc-4D (Marketplace):** DD-1 verification = M5; DD-2 matching/routing = M3
  (Marketplace owns read-model only); DD-3 vendor ban = M8; DD-4 category approval = M8;
  DD-5 ad/custom-domain entitlement = M7; DD-6 `marketplace.*` POLICY keys;
  DD-7 `vendor_claim_records` tenancy reconciliation; DD-8 vendor ban-lift event missing;
  plus marketplace audit-action escalation.

### 11.2 Maturity Stages (POLICY `platform.operating_stage`)

- **Stage A (MVP):** ~100-vendor beta, RFQ workflow, declared tiers, basic trust,
  limited monetization.
- **Stage B:** ~1,000 vendors, verified tiers, enhanced trust + full freeze workflow,
  performance scoring.
- **Stage C:** 10,000+ vendors, advanced matching, AI assist, enterprise tools,
  comprehensive analytics.

---

## 12. Current Program Phase

**Architecture Program:** COMPLETED.

**Current Phase:** Implementation Governance.

**Next Authorized Work:**

- **Doc-5** — API Contracts
- **Doc-6** — Database Contracts
- **Doc-7** — Frontend Contracts
- **Doc-8** — Test Specifications

**Current Active Deliverable:** Doc-5A — API Standards.

**Target:** AI-Assisted Development.

The design corpus is frozen. Work now moves from *authoring architecture* to
*producing implementation contracts and code* that conform to that frozen architecture.
Carried dependencies are resolved additively — never by reopening a frozen document.

---

## 13. AI Agent Governance

**AI agents MAY:**

- Generate code
- Generate tests
- Generate documentation
- Generate migration plans

**AI agents may NOT:**

- Modify architecture
- Modify ADRs
- Create new modules
- Change ownership boundaries
- Change governance invariants

Architecture documents are **authoritative**. Implementation must conform.

**Approval path — all AI-generated code requires, before merge:**

- **AI Coding Supervisor** review, **OR**
- **Human** review.

No AI-generated code merges unreviewed.

**Architecture-affecting artifacts require HUMAN approval** — code review alone is
insufficient. Any AI-generated artifact that touches architecture, an ADR, a module
ownership boundary, a governance invariant, or a frozen contract must be approved by a
human before acceptance. AI Coding Supervisor sign-off does **not** substitute here.

---

## 14. Required AI Skills

**Governance:**
- Virtual CTO
- Enterprise Architect
- DDD Architect
- API Governance Board

**Engineering:**
- Backend Architect
- Database Architect
- Frontend Architect
- DevOps Architect
- Security Architect
- QA Architect

**Product:**
- Product Manager
- Procurement Domain Expert
- Marketplace Strategist

**AI:**
- AI Coding Supervisor
- Claude Reviewer
- Technical Writer

### 14.1 Authority Order

When authorities conflict, the higher rank decides. **Architecture is supreme — no
skill, including the Virtual CTO, may override the frozen corpus or ADRs:**

0. **Frozen Architecture Corpus** (Doc-2, Doc-3, Doc-4A…4M, Master Architecture)
1. **ADR Compendium**
2. Virtual CTO
3. Enterprise Architect
4. DDD Architect
5. API Governance Board
6. Security Architect
7. Engineering Skills
8. Product Skills
9. AI Skills

A lower-authority skill may advise but never overrides a higher one. Ranks 0–1 are
**immutable to all skills**: the CTO and every skill below it operate *within* the frozen
architecture, never above it. Changing rank 0 or 1 requires an additive architecture
patch with human approval — never a skill decision.

---

## 15. Golden Rules

1. Users Act, Organizations Own
2. One Module, One Owner
3. Governance Signals Are Firewalled
4. Content ≠ Presentation
5. Private Exclusion Stays Private
6. AI Suggests, Modules Decide
7. No Architecture Redesign
8. No Scope Expansion
9. No Feature Creep
10. Frozen Documents Are Authoritative

---

## Appendix A — Repository Structure (planned)

Single Next.js modular-monolith repo. One folder per bounded module; no cross-module imports.

```
ivendorz/
├─ app/                      # Next.js App Router (public site + authed app)
├─ src/
│  └─ modules/
│     ├─ core/               # M0  Platform Core / Shared Kernel
│     ├─ identity/           # M1  Identity & Organization
│     ├─ marketplace/        # M2  Marketplace & Discovery
│     ├─ rfq/                # M3  RFQ Procurement Engine
│     ├─ operations/         # M4  Business Operations + CRM
│     ├─ trust/              # M5  Trust & Verification
│     ├─ comms/              # M6  Communication
│     ├─ billing/            # M7  Monetization
│     ├─ admin/              # M8  Admin Operations
│     └─ ai/                 # M9  AI Layer (reserved)
├─ prisma/                   # schema (planned: one namespace per module — see note)
├─ inngest/                  # async jobs (matching, routing, notifications, imports)
├─ generatedDocs/            # frozen architecture corpus (this document lives here)
└─ package.json
```

Each module folder contains `contracts/` (public service + event interfaces), `services/`,
`data/` (Prisma access), and `events/`. Only `contracts/` may be imported by other modules.

> **Note:** this repository layout — including the "one Prisma schema namespace per
> module" convention — is **planned implementation structure**, not an established
> architecture rule. The frozen corpus mandates "one schema per module" at the database
> level (Doc-2); the Prisma namespace strategy is an implementation choice to be ratified
> in Doc-6 (Database Contracts) and may change without affecting the architecture.

---

## Appendix B — Glossary

- **RFQ** — Request For Quotation; the structured buyer demand that drives the engine.
- **Controlling Organization** — the single org that legally/operationally owns a Vendor Profile.
- **Authorized Representative** — an org with a scoped Delegation Grant to act for a vendor.
- **Financial Tier (A–E)** — capability claim sizing which RFQ values a vendor may receive.
- **Capacity Profile** — evidence of execution ability (contradicting tier lowers match confidence).
- **Trust Score / Performance Score** — platform-wide governance signals owned by M5.
- **Buyer Vendor Status** — private per-buyer judgement (Approved/Conditional/Blacklisted), owned by M4 CRM.
- **Probation Pool** — new/unverified vendors injected into routing (default 80/20 split).
- **Routing Mode** — buyer-selected gate (Approved Only … Open Market) applied first in the pipeline.
- **Entitlement** — boolean/numeric/enum capability granted by a subscription (never a plan-name check).
- **Transactional Outbox** — atomic business-record + event write, delivered async by M0.
- **Carried Dependency** — a boundary gap recorded at freeze, resolved additively (never reopens a frozen doc).
- **FROZEN** — a ratified document; authoritative; changed only by additive patch.

---

## Appendix C — Acronyms

ADR — Architecture Decision Record · API — Application Programming Interface ·
BDT — Bangladeshi Taka · BIN/TIN — Business/Tax Identification Number ·
CRM — Customer Relationship Management · DDD — Domain-Driven Design ·
EPC — Engineering, Procurement & Construction · FTS — Full-Text Search ·
LOI — Letter Of Intent · MRO — Maintenance, Repair & Operations · PO — Purchase Order ·
QA/QC — Quality Assurance / Quality Control · RFQ — Request For Quotation ·
RLS — Row-Level Security · SaaS — Software as a Service · SEO — Search Engine Optimization ·
SSR/SSG — Server-Side Rendering / Static Site Generation · UUID — Universally Unique Identifier ·
WCC — Work Completion Certificate.

---

## Appendix D — Bounded-Context Diagram (reference)

A formal bounded-context / event-flow diagram is maintained in **Doc-4L (Integration
Index)**. Textual relationship summary:

```
M1 Identity ──(org context)──> all modules
M2 Marketplace ──(vendor read-model)──> M3 RFQ
M3 RFQ ──(reads status)──> M4 CRM ; ──(reads tier/trust)──> M5 Trust
M3 RFQ ──(award)──> M4 Operations
M5 Trust ──(scores)──> M2, M3 (read-only)
M7 Billing ──(entitlements)──> M2, M3
M8 Admin ──(approvals/bans/categories)──> M2, M5
M6 Comms <──(notify events)── all modules
M0 Core: audit + outbox + IDs + config underpin everything
```

---

## Appendix E — Document Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-22 | Initial synthesis from frozen corpus (12 sections). |
| 1.1 | 2026-06-22 | Status update: Doc-4 series complete/FROZEN. Added Current Program Phase, AI Agent Governance, Required AI Skills, Golden Rules. |
| 1.2 | 2026-06-22 | Board patch: expanded Doc-4F…4M map; code-approval path; skill Authority Order; module Owner column; runtime version baselines; state-machine + event-catalog authority pointers; carried-deps historical note; active deliverable; appendices A–F. |
| 1.3 | 2026-06-22 | Board patch 2: architecture supremacy in Authority Order (ranks 0–1 immutable); §0 reading path 4B…4M; human approval for architecture-affecting artifacts; Prisma layout marked planned; non-authoritative classification + change control; Appendix G governance/implementation pointers. |
| 1.4 | 2026-07-15 | Additive clarification patch (owner-approved): §2.1 Backend row clarified — Next.js route handlers are the primary execution model, server actions secondary (used where ergonomically appropriate); the application is route-handler-driven. No frozen document contradicted; refines, does not reword, the "route handlers + server actions" statement. |

---

## Appendix F — Contributor Onboarding Checklist

- [ ] Read this Master Overview end-to-end.
- [ ] Read Master System Architecture + ADR Compendium.
- [ ] Read Doc-2 (domain/DB) and Doc-3 (RFQ operations).
- [ ] Read Doc-4A (API metastandard) before any contract work.
- [ ] Read the contract doc for the module you will touch (Doc-4B…4M).
- [ ] Internalize the 12 Core Invariants (§7) and 10 Golden Rules (§15).
- [ ] Confirm scope sits inside one module; respect "One Module, One Owner".
- [ ] Route generated code through AI Coding Supervisor or human review before merge.
- [ ] Never modify a FROZEN document; propose additive patches instead.

---

## Appendix G — Governance & Implementation Pointers

- **NP-01 · Doc-5 Program:** the next program (Implementation Contracts) comprises
  Doc-5 API Contracts · Doc-6 Database Contracts · Doc-7 Frontend Contracts ·
  Doc-8 Test Specifications. Active deliverable: **Doc-5A — API Standards** (§12).
- **NP-02 · Implementation roadmap:** Stage A (MVP, ~100 vendors) → Stage B (~1,000) →
  Stage C (10,000+); see §11.2. Code work proceeds module-by-module behind the frozen
  contracts, gated by Implementation Governance (§12–13).
- **NP-03 · Source-of-truth hierarchy:**
  ```
  Frozen Architecture Corpus  (supreme)
        └─ ADR Compendium
              └─ Implementation Contracts (Doc-5…8)
                    └─ Code
                          └─ This Overview (non-authoritative mirror)
  ```
- **NP-04 · Event ownership:** authoritative event catalog = **Doc-4J**; cross-module
  event-flow map = **Doc-4L**; outbox mechanism owned by **M0** (§8).
- **NP-05 · Document classification:** Non-authoritative orientation / AI bootstrap
  context (see header). Not a frozen artifact.
- **NP-06 · Review cadence:** re-checked whenever a referenced frozen document is
  patched, and at each program transition (e.g. Doc-5…8 milestones). No fixed calendar.
- **NP-07 · AI model usage:** default to the latest, most capable Claude models for
  build/review work (e.g. Opus tier for architecture-sensitive review, Sonnet for bulk
  generation). Model choice is an implementation detail; it never grants authority above
  the corpus (§14.1).
- **NP-08 · Implementation status tracker:** architecture = COMPLETE/FROZEN;
  implementation contracts (Doc-5…8) = NOT STARTED; application code = NOT STARTED.
  Update this line as deliverables land.

---

*End of Master Overview v1.4. Non-authoritative — patch additively whenever a referenced
frozen document changes; it must never contradict the corpus it summarizes.*
