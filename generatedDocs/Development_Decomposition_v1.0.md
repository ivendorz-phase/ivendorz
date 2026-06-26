# iVendorz — Development Decomposition

| Field | Value |
|---|---|
| **Document type** | Non-authoritative orientation document (Implementation Planning) |
| **Date** | 2026-06-26 |
| **Version** | v1.0 |
| **Change control** | Additive patches only. On any conflict, the **FROZEN corpus wins** and this document is patched to match. |
| **Conforms to** | `Master_System_Architecture_v1.0_FINAL` → `ADR_Compendium_v1` → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A…4M → Doc-5A…5K → Doc-6A…6K → Doc-7A…7H → Doc-8A…8G (all FROZEN) |
| **Conflict rule** | **FLAG-AND-HALT** — cite both sources, escalate to the Board for a human-approved additive patch; never resolve locally. |
| **Authority** | Below rank 1 (see `00_AUTHORITY_MAP.md`). Decomposes the frozen corpus into buildable work; **decides nothing the corpus has not already decided.** |

> This document is the bridge between the frozen design corpus and the first line of application
> code. It **translates** — it does not design. It coins no architecture, API, schema, UI,
> event, permission, route, module, state, or contract. Every work item traces by pointer to a
> frozen authority. Where the corpus is silent on something code needs, this document raises an
> `[ESC-*]` marker rather than inventing.

---

## §1. Executive Overview

### 1.1 Purpose

The iVendorz architecture, realization, and verification corpus is **COMPLETE/FROZEN**: Doc-2
(domain), Doc-3 (RFQ/operational spec), Doc-4A…4M (module contracts + state/event/integration
authorities), Doc-5A…5K (API realization), Doc-6A…6K (database realization), Doc-7A…7H (frontend
realization), and Doc-8A…8G (test & conformance realization). The corpus's own declared next
phase is **Development Decomposition → Build Roadmap → Implementation (Code)**. No application
code exists yet; it is gated by the frozen Doc-8 conformance fabric.

This document is the **Development Decomposition** — the first of those three steps. It converts
the frozen *what* and *how* into an executable *work breakdown*: engineering streams, per-module
work packages, a dependency-ordered build sequence, parallelization, and acceptance gates.

### 1.2 Scope

**In scope:** decomposition of already-frozen work into epics, work packages, build order, and
gates; identification of which frozen document governs each piece of work.

**Explicitly out of scope:** any (re)design of architecture, API surface, database schema,
frontend surface, events, permissions, routes, modules, state machines, or contracts. Those are
frozen. This document references them; it never restates or alters them. It also fixes **no dates
and no effort estimates** — sequencing is expressed as dependency order only, consistent with the
corpus's roadmap discipline.

### 1.3 Inputs (by pointer)

- **Design authority:** `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`,
  `Doc-2_Domain_Model_And_Database_Blueprint` (v1.0.3), `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification` (v1.0.2).
- **Contract authority:** Doc-4A (API metastandard) + Doc-4B…4M (modules, plus Doc-4J event
  catalog, Doc-4L event-flow map, Doc-4M state machines).
- **Realization contracts (the build targets):** Doc-5A…5K (API), Doc-6A…6K (DB), Doc-7A…7H (FE).
- **Verification fabric (the merge gate):** Doc-8A…8G (metastandard + harness + 5 discipline suites).
- **Engineering reference:** `REPOSITORY_STRUCTURE.md` (constitution), `CLAUDE.md` (guardrails),
  `IMPLEMENTATION_START_HERE.md` (reading order / pre-PR checklist), `project_details.md`.

### 1.4 Outputs

A set of **engineering streams** (§2), **per-module work packages** under two uniform templates
(§3), **cross-cutting work packages** (§4), a **repository bootstrap** wave (§5), a **walking
skeleton** (§6), **implementation waves** (§7) with a **parallelization plan** (§8),
**acceptance gates** (§9), an engineering **risk register** with build-time rollback (§10), and
dependency-ordered **milestones** (§11).

### 1.5 Principles (binding on every work package)

1. **The 10 Golden Rules** (CLAUDE.md §6) and **12 Core Invariants** (CLAUDE.md §5) hold at every
   stage; no work package may violate one.
2. **One Module, One Owner** (Invariant #7): a work package builds inside exactly one module;
   cross-module work happens only through `contracts/`.
3. **Reference-never-restate:** a work package binds frozen entities/slugs/events/audit-actions/
   POLICY-keys by pointer, never by copy.
4. **Realize-never-redecide:** Doc-4x fixed *what*, Doc-5/6/7A fixed *how*; code realizes — it
   never re-decides.
5. **Doc-8 gates merge:** a work package is not "done" until its required Doc-8 conformance bands
   are green (§9). The conformance fabric is **necessary-not-sufficient** and **never weakened**;
   a red test is a code defect or a corpus defect (`[ESC-8-CORPUS]`), never a reason to relax the
   assertion.

---

## §2. Engineering Streams (Execution Streams)

Work is organized into parallel execution streams. A stream is a discipline lane, not a module;
a single module's build touches several streams. Each stream names the frozen documents that
govern it.

| Stream | What it builds | Governing frozen docs |
|---|---|---|
| **Platform / Infra** | Supabase project, environments, secrets, Vercel, Inngest wiring, CI | CLAUDE.md §2 (stack); REPOSITORY_STRUCTURE.md §2/§7; Doc-8B (harness/CI) |
| **Backend** | Per-module `domain/` + `application/` + `api/` + `infrastructure/events` | Doc-4B…4M (what) + Doc-5B…5K (how, on HTTP) |
| **Database** | Prisma `multiSchema` (one namespace per module), migrations, RLS, seeds | Doc-2 §10; Doc-6A (metastandard) + Doc-6B…6K (per-module schemas) |
| **Frontend** | Next.js App Router surfaces, design system, app shell, data layer | Doc-7A…7H |
| **Testing** | Conformance suites (contract, persistence/RLS, domain/invariant, event-flow, FE/E2E) | Doc-8A…8G |
| **DevOps / CI** | Merge-gate pipeline, generated-contracts-registry build, boundary lint | REPOSITORY_STRUCTURE.md §10; Doc-8B (CI merge-gate) |
| **AI (M9)** | Regenerable derived-artifact cache + advisory reads | Doc-4K; Doc-5K; Doc-6K; CLAUDE.md §5 (Invariant #12) |
| **Documentation** | Module READMEs, runbooks, API/usage notes (non-authoritative) | This document; IMPLEMENTATION_START_HERE.md |

### 2.1 Build-ownership model

Extending **One Module, One Owner** (Invariant #7 / Golden Rule #2) to execution:

- **Every work package SHALL have exactly one build owner.** No shared ownership.
- **Ownership transfers only after the package passes its acceptance gate** (§9) — a half-built
  package is not handed off.
- This is the **execution/build owner** — *who builds the package*. It **never re-assigns the
  immutable frozen domain ownership** of a module (the schema/contract owner). Domain ownership is
  fixed by the corpus; build ownership is an organizing convenience for the implementation phase
  and changes nothing architectural.

---

## §3. Module Decomposition (M0–M9)

Two uniform templates apply to every module before any per-module breakdown. They exist so that
"a work package" and "done" mean the same thing across all ten modules.

### 3.1 Work Package (WP) template — every WP SHALL contain

| Field | Meaning |
|---|---|
| **Objective** | The single buildable outcome. |
| **Frozen authority** | The governing Doc-x pointer (Doc-4/5/6/7 section). |
| **Inputs** | Upstream contracts/schemas/events this WP consumes (by pointer). |
| **Outputs** | What it produces (tables, contracts, handlers, components, suites). |
| **Dependencies** | The WPs/modules that must be gated-green first. |
| **Files expected** | Paths in the canonical nested-DDD shape (REPOSITORY_STRUCTURE.md §3). |
| **Acceptance gate** | The Doc-8 bands + CI status that must be green (§9). |
| **Required Doc-8 suites** | Which of Doc-8C…8G assert this WP. |
| **Done criteria** | Build Artifact Checklist complete (§3.2) + zero outstanding `[ESC-*]`. |
| **Build owner** | The single execution owner (§2.1). |

### 3.2 Build Artifact Checklist — each module SHALL deliver (per its shape-exception)

Derived from the canonical nested-DDD shape (REPOSITORY_STRUCTURE.md §3) + Doc-6 (DB) + Doc-8
(tests). It invents nothing.

1. **Prisma schema** for the module's own namespace (Doc-6x; one namespace per module, Doc-6A R3(b)).
2. **Forward-only migrations + seed** (Doc-6A §11 expand-contract; module POLICY/role/permission seeds).
3. **`contracts/`** — `services.ts` · `events.ts` · `types.ts` · `index.ts` (the only importable surface).
4. **`domain/`** — aggregates/entities/value-objects/policies/state-machines (conform to Doc-4M).
5. **`application/`** — commands/queries/workflows (orchestration only, owns no state).
6. **`infrastructure/`** — `data/` (own-schema Prisma) · `read-models/` (disposable) · `events/`
   (M0 outbox emitters + idempotent consumers) · `search/` (own aggregates, FTS).
7. **`api/`** — route handlers / server actions realizing the module's Doc-5x wired surface.
8. **The module's Doc-8 suites** — the applicable bands (§9), authored against frozen oracles.
9. **Module documentation** — README + usage notes (non-authoritative).

**Shape-exceptions (REPOSITORY_STRUCTURE.md §3):** **M0 (`core`)** is infrastructure-only — no
business `domain/`. **M9 (`ai`)** uses `domain/` only for regenerable derived-artifact models and
owns no authoritative aggregate. Unused layers need not exist.

### 3.3 Per-module breakdown

Each module's work follows the WP order `contracts/` → `domain/` → `application/` → `infrastructure/`
→ `api/`, then its FE legs (Doc-7) and test suites (Doc-8). Table counts and special properties
are stated by pointer to the frozen Doc-6x / Doc-5x; nothing below is a new design decision.

#### M0 — `core` (Platform Core / Shared Kernel) · Doc-4B · Doc-5B · Doc-6B
- **Dependencies:** none (the foundation).
- **Owns:** 5 platform tables (`audit_records`/`outbox_events`/`id_sequences`/`system_configuration`/
  `feature_flags`; Doc-6B). Transactional outbox; audit-write; UUIDv7 + `human_ref` allocator
  (SECURITY DEFINER, never-reused); POLICY read; feature flags.
- **Work packages:** schema + CR4′ column-scoped immutability triggers (Doc-6B) → human-ref
  allocator → outbox writer + observer hook → audit writer → config/flag services → out-of-wire
  service boundary (Doc-5B R1 precedent; not a public HTTP surface).
- **Shape-exception:** infra-only (no business `domain/`).
- **Acceptance gate:** Doc-8D persistence/immutability (CR4′) + Doc-8B harness outbox observer.
- **Definition of Done:** Build Artifact Checklist (minus business domain) + 18 `core.*` POLICY
  keys seeded (Doc-3 v1.0) + zero `[ESC-*]`.

#### M1 — `identity` · Doc-4C · Doc-5C (42) · Doc-6C
- **Dependencies:** M0.
- **Owns:** 9 tables (users/organizations/memberships/roles/permissions/role_permissions/
  organization_workflow_settings/buyer_profiles/delegation_grants; Doc-6C). First real org-anchor
  RLS (all 9 explicit). `check_permission`, server-resolved active-org, dual-party delegation.
- **Work packages:** schema + RLS (org-anchor) → role/permission catalog seed (45 slugs + 4
  bundles, Doc-2 §7 / Doc-6C) → `check_permission` + active-org resolution → delegation grants
  (controlling/representative party; refresh-on-revocation) → 3 state machines (Doc-4M) → Doc-5C
  wired API.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS (org-anchor positive/negative/cross-tenant) +
  Doc-8E identity invariants (Invariant #2 two role dimensions, Invariant #5 users-act/orgs-own).
- **Definition of Done:** checklist + 7 `identity.*` POLICY keys (Doc-3 v1.9) + zero `[ESC-*]`.

#### M2 — `marketplace` · Doc-4D · Doc-5D (71) · Doc-6D
- **Dependencies:** M0, M1. Consumes M5 events (tier/verification/score bands) as an idempotent
  consumer; supplies the `vendor_matching_attributes` read-model that M3 reads via service.
- **Owns:** 21 tables / 8 aggregates (Doc-6D). First public/anonymous tri-actor RLS
  (Public/User/Admin); capability matrix (4 booleans, Invariant #1); visibility-scope = publish-state;
  score firewall (no score column; bands reflected, never calculated); first real FTS; versioned
  `spec_documents`; 4-level admin-governed category tree.
- **Work packages:** schema + tri-actor RLS + FTS → capability matrix + two-dimension role
  (Doc-4D §5.3) + visibility/publish state (§5.8) → `financial_tier_history` exclusive-writer-as-
  consumer (append-only; Trust never writes) → `vendor_matching_attributes` derived read-model
  (admin-only; served to M3 via service) → category tree + ad references (M7 by reference) →
  Doc-5D wired API.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS (tri-actor incl. public/anonymous) + Doc-8E
  score-firewall (band reflected, never computed) + Invariant #1/#9 (capability matrix; Content ≠
  Presentation).
- **Definition of Done:** checklist + 2 `marketplace.*` POLICY keys (Doc-3 v1.2) + carried
  `[ESC-6-DD7]`/`[ESC-MKT-AUDIT]`/`[ESC-6-SCHEMA-SHOWCASE]` resolved or on named channel.

#### M3 — `rfq` (the moat) · Doc-4E · Doc-5E (38) · Doc-6E
- **Dependencies:** M0, M1, **M2** (matching attributes), **M5** (trust/verified-tier/performance
  gate+score inputs), **M7** (quota). Reads M4 CRM status for routing via service (private exclusion).
- **Owns:** 12 tables / 5 groupings (Doc-6E). First dual-sided buyer+vendor grant-row RLS
  (materialized `rfq_invitation_grantees`/`rfq_document_grants`/`quotation_visibility` anchors;
  refresh-on-revocation; never cross-schema traversal). **Blacklist undetectable** — first in-scope
  CHK-6-022 byte-equivalence (gate-excluded vendors never written to `matching_results`;
  `rfq_routing_log` aggregate-only; matching/log/comparison buyer-side-only). RFQ §5.4 (13 states)
  + Quotation §5.5 (6) state machines. The matching/routing engine is **out-of-wire** (System
  workers; Doc-5E R1) — buyers never invite; invitations are engine-generated.
- **Work packages:** schema + dual-sided grant-row RLS → RFQ control plane state machine (Doc-4M)
  → matching pipeline (reads M2 attributes via service; gate-excluded never persisted) → routing
  governance (aggregate-only log; reads M4 CRM status, M5 signals, M7 quota) → quotation
  management (one-active partial-unique; `rfq_versions.is_immutable`-once-quoted) → evaluation/
  comparison/award (buyer-side-only) → Doc-5E wired API + out-of-wire engine workers.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS dual-sided + **CHK-8-024 byte-equivalence
  (blacklist-undetectable)** + Doc-8E moat as governed property (no signal dominates; AI never
  ranks-to-winner; no auto-decision) + Doc-4M state coverage.
- **Definition of Done:** checklist + `rfq.*` POLICY keys (Doc-3 v1.1) + carried `[ESC-RFQ-AUDIT]`/
  `[ESC-RFQ-SCHEMA-RULES]` resolved or on named channel.

#### M4 — `operations` · Doc-4F · Doc-5F (50) · Doc-6F
- **Dependencies:** M0, M1, **M3** (consumes `RFQClosedWon` → engagements; `VendorInvited` →
  vendor leads). Emits events consumed by M5/M6.
- **Owns:** 19 tables / 6 groupings (Doc-6F). **The blacklist's owning side** (`buyer_vendor_statuses`
  + private CRM strictly `organization_id`-tenant — no vendor, no admin-all; served to M3 via CRM
  service only; non-disclosure byte-equivalence in-scope CHK-6-022). Two-sided engagement party-column
  RLS (`active_org IN (buyer_organization_id, vendor_controlling_org_id)`). **Money-record boundary —
  no funds custody** (`trade_invoices ≠ billing.platform_invoices`; no balance/gateway/escrow; money
  facts immutable). Governance signal #5 (Buyer Vendor Status) never mutates platform scores.
- **Work packages:** schema + two-sided party-column RLS → buyer-private CRM (`buyer_vendor_statuses`;
  blacklist owner; CRM service to M3) → procurement engagements (idempotent `RFQClosedWon` consumer)
  → vendor lead pipeline (idempotent `VendorInvited` consumer) → post-award documents (versioned;
  column-scoped immutability) → finance records (`trade_invoices`; immutable money facts) → Doc-5F
  wired API.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS two-sided + **#11 byte-equivalence
  (buyer-private blacklist-undetectable; the defining target for CHK-6-022/CHK-8-024 on the owning
  side)** + Doc-8E money-boundary + signal-#5-non-mutation + Doc-8F event consumers.
- **Definition of Done:** checklist + `operations.*` POLICY keys (Doc-3 v1.4) + carried
  `[ESC-OPS-AUDIT]` on named channel.

#### M5 — `trust` · Doc-4G · Doc-5G (40) · Doc-6G
- **Dependencies:** M0, M1. Consumes M4 performance inputs; M2 declared tier. Emits
  `VendorTierChanged`/`VendorVerified`/`TrustScoreUpdated` (consumed by M2). Buildable in parallel
  with M2 (async event-decoupled — no synchronous cycle).
- **Owns:** 11 tables / 5 groupings (Doc-6G). **The governance-signal owner — the firewall's
  authoritative side** (Trust/Performance/verified-Tier/Capacity computed independently; no
  cross-score column/FK; Buyer Vendor Status never enters). **Scores System-written, never
  hand-edited** (System owner-role / SECURITY DEFINER only). Public band = M2 reflection (no public
  raw-score read). **Admin decides, Trust owns** (verification).
- **Work packages:** schema + RLS → independent score computations (firewall: no cross-score
  mutation; no signal dominates) → `verified_financial_tiers` (emits `VendorTierChanged`) →
  idempotent `performance_inputs` (M4 consumer) → `public_reviews` (post-award/published) +
  `admin_ratings` (staff-only) → Doc-5G wired API (System-written scores; public-band reflection only).
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS + Doc-8E **firewall (two assertion shapes:
  non-cross-mutation + non-dominance)** + System-actor-only score writes + Doc-8F `VendorTierChanged`
  fan-out.
- **Definition of Done:** checklist + `trust.*` POLICY keys (Doc-3 v1.3) + carried `[ESC-TRUST-AUDIT]`
  on named channel. (No `human_ref` — CHK-6-002 N/A.)

#### M6 — `communication` · Doc-4H · Doc-5H (23) · Doc-6H
- **Dependencies:** M0, M1. **Consumes only** (M0 outbox events → notifications/delivery logs);
  emits nothing (Doc-4E §E0 DE-6). Buildable standalone early; consumer wiring exercised when
  producers (M3/M4/M5/M7) land.
- **Owns:** 9 tables / 4 groupings (Doc-6H). **Delivery-only** (transmits, owns no business
  content). Participant-grant RLS (`thread_participants` simple anchor). Append-only System-written
  delivery logs (email/sms/whatsapp; column-scoped status). Realtime-backed messages. Schema name
  is **`communication`** (the earlier `comms` slip is patched; Doc-6H / CLAUDE.md §3).
- **Work packages:** schema + participant-grant RLS → threads/messages (Realtime) → notifications
  (M0-event consumer) → delivery logs (append-only; System-written) → org+staff support tickets →
  Doc-5H wired API.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS (participant-grant) + Doc-8F event-consumer
  locality (delivery-only; authors no business content).
- **Definition of Done:** checklist + `communication.*` POLICY keys (Doc-3 v1.5) + carried
  `[ESC-COMM-AUDIT]` on named channel.

#### M7 — `billing` · Doc-4I (+ ActivatePlan additive) · Doc-5I (33) · Doc-6I
- **Dependencies:** M0, M1. Provides quotation-submission quota to M3 via service (Doc-4E §E0 DE-7).
- **Owns:** 13 tables / 6 groupings (Doc-6I). **The platform's OWN revenue** (`platform_invoices`
  `INV-P-…` via gateway; **`≠ operations.trade_invoices`** — no `operations` FK). **The billing
  firewall** (no billing state gates trust/eligibility/routing/matching). **Entitlements
  (boolean/numeric/enum), never plan-name** (Financial Tier ≠ Subscription Plan). Subscription §5.7
  + one-active partial-unique; emits `SubscriptionPurchased`/`SubscriptionRenewed`/`SubscriptionExpired`.
  `record_payment` = gateway callback (not a §8 event).
- **Work packages:** schema + RLS → plans/entitlements catalog (incl. additive `activate_plan`;
  entitlement resolution as internal service) → subscriptions (state §5.7; 3 §8 events) → platform
  invoices/payments (gateway; append-only ledgers; column-scoped) → quota service to M3 →
  Doc-5I wired API.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS + immutability (append-only ledgers) + Doc-8E
  **billing firewall (no billing state gates any procurement/trust decision)** + Invariant #10
  (Financial Tier ≠ Subscription Plan) + Doc-8F subscription events.
- **Definition of Done:** checklist + `billing.*` POLICY keys (Doc-3 v1.6) + carried `[ESC-BILL-AUDIT]`
  on named channel.

#### M8 — `admin` · Doc-4J (authoritative event catalog) · Doc-5J (34) · Doc-6J
- **Dependencies:** M0, M1, and the modules it governs (M2/M3/M5/M4). Decision authority; acts ON
  targets by ID; **no active-org** (Admin-only surface).
- **Owns:** 10 tables / 5 groupings (Doc-6J). **"Admin decides, owning module owns"** (M8 writes no
  owning-module authoritative table — ban→M2, verification→M5, link→M4, import→M2 via event/service).
  The ban authority (`ban_actions` emits **`VendorBanned`**). `link_suggestions` never vendor-visible
  (CHK-6-022 in-scope). Append-only `import_rows`.
- **Work packages:** schema + RLS (Admin-only; staff roles) → ban actions (emits `VendorBanned`) →
  verification tasks (decision → M5 owns) → link suggestions (never vendor-visible) → import rows
  (append-only; → M2 via service) → Doc-5J wired API.
- **Acceptance gate:** Doc-8C contract + Doc-8D RLS (Admin-only; link non-disclosure) + Doc-8E
  Admin-decides/owning-module-owns (no owning-module table write) + Doc-8F `VendorBanned` +
  owning-module-emits framing.
- **Definition of Done:** checklist + `admin.*` POLICY keys (Doc-3 v1.7) + carried `[ESC-ADMIN-AUDIT]`/
  `[ESC-ADMIN-SCHEMA-OUTREACH]` on named channel. (No event coined; no `human_ref`.)

#### M9 — `ai` (reserved, advisory) · Doc-4K · Doc-5K (16) · Doc-6K
- **Dependencies:** reads all (via contracts); writes only `ai.*`; emits no §8 event; gates nothing.
- **Owns:** 4 cache tables / one grouping (Doc-6K). **"AI suggests; modules decide"** (Invariant
  #12 — owns no authoritative data; never source of truth; no score). **The sole `ai.*` TTL
  hard-delete exception** (Doc-6A R7 — `expires_at`; hard-DELETE permitted; no soft-delete, no
  immutability; CHK-6-033 the active PASS). Requesting-org RLS.
- **Work packages:** 4 cache tables + requesting-org RLS + TTL hard-delete (R7 exception) →
  regenerable derived-artifact models (`domain/` derived-only) → advisory read services →
  Doc-5K wired reads (User read-only; AI-Agent/System out-of-wire).
- **Acceptance gate:** Doc-8C contract + Doc-8D persistence (CHK-6-033 TTL hard-delete PASS) +
  Doc-8E Invariant #12 (advisory; never authoritative; never ranks-to-winner).
- **Definition of Done:** checklist (derived-artifact shape-exception) + `ai.*` POLICY keys
  (Doc-3 v1.8) + carried `[ESC-AI-AUDIT]` on named channel.

---

## §4. Cross-cutting Work

Concerns that span modules. Each is a work package that **points at its frozen owner** and
introduces no new mechanism.

| Concern | Owner / pointer | Work package |
|---|---|---|
| **Authentication** | Supabase Auth (CLAUDE.md §2; Doc-5A §7.1 Bearer carriage) | Auth integration in `src/server/auth/`; authentication only (no session logic in contracts). |
| **Authorization** | M1 `check_permission` (Doc-4C); app-layer (Master Arch §13) | `src/server/authz/` + guards; 3-layer server check; RLS is backstop, not the model. |
| **Org context** | M1 server-resolved active-org (Invariant #5) | `src/server/context/`; client-supplied org ID never trusted. |
| **Events + Outbox** | M0 transactional outbox (Doc-2 §8; Doc-4B; Doc-4L); dispatch via **Inngest** (CLAUDE.md §2; REPOSITORY_STRUCTURE.md §7) | Business write + event insert in one transaction; idempotent consumers; thin payloads (IDs + meta). |
| **Search** | Per-module FTS (Doc-6D first real FTS) | Each module indexes only its own aggregates (REPOSITORY_STRUCTURE.md §3). |
| **Notifications** | M6 delivery-only (Doc-4H) | Fan-out as M0-event consumer; owns no business content. |
| **Observability / Audit** | M0 `audit_records` (Doc-4B); PostHog (CLAUDE.md §2) | Every mutation → exactly one audit record (Doc-4A §17); analytics wrapper in `src/shared/telemetry/`. |
| **Feature flags + Config** | M0 `feature_flags`/`system_configuration` (Doc-4B); POLICY keys (Doc-3 §12) | Config/flag reads via M0 contracts; new surfaces behind flags. |
| **Deployment** | Vercel (CLAUDE.md §2) | Local/Preview/Staging/Production; protected `main`. |
| **CI merge-gate** | Doc-8B harness | Vitest + Playwright + TS-native SQL; boundary lint; merge-gate green required. |
| **Security** | Master Arch §16; non-disclosure (Invariant #11) | RLS backstop + blacklist/exclusion undetectable on the wire (Doc-5A §6.3/§8.7). |
| **Migration** | Doc-6A §11 | Forward-only / expand-contract; no down-migration; additive (no column drop in same PR as code). |
| **Seed data** | Doc-3 POLICY v1.0–v1.8/v1.9; Doc-6C role/permission seed | POLICY keys per namespace + 45-slug/4-bundle role catalog (Doc-2 §7). |

### 4.1 Generated-code policy (binding; CLAUDE.md §10, REPOSITORY_STRUCTURE.md §2/§5/§10)

The **Prisma client** and **`generated-contracts-registry/`** are GENERATED artifacts —
**gitignored, regenerated by tooling, never hand-edited**. A manual edit to a generated path is a
CI-failing violation, not a code change.

---

## §5. Repository Bootstrap (Wave 0)

Everything before feature work, from `REPOSITORY_STRUCTURE.md` + Doc-6A + Doc-8B. No business
logic; the spine only.

- **Next.js 15 App Router** scaffold; route groups `(public)`/`(auth)`/`(app)`/`(admin)` +
  `app/api/` thin entry points (REPOSITORY_STRUCTURE.md §8).
- **Nested-DDD module skeleton** for all ten modules (`contracts/`/`domain/`/`application/`/
  `infrastructure/`/`api/` + `<module>.module.ts`); cross-cutting `src/shared/` + `src/server/`
  (REPOSITORY_STRUCTURE.md §3/§5).
- **Prisma `multiSchema`** — 10 schema namespaces (one per module; Doc-6A R3(b)); schema-scoped
  client accessors.
- **`generated-contracts-registry/`** — generated, gitignored (REPOSITORY_STRUCTURE.md §2/§5).
- **Inngest wiring** (`inngest/`) — job functions consuming the M0 outbox (REPOSITORY_STRUCTURE.md §7).
- **Tooling** — Node ≥ 20 LTS, TypeScript ≥ 5.x; lint (import-boundary lint, REPOSITORY_STRUCTURE.md §10),
  format, git hooks.
- **Test toolchain** — **Vitest + Playwright + @axe-core/playwright + TS-native transactional SQL**
  (the frozen `[ESC-8-TOOLING]` resolution, Doc-8B D1; pgTAP not selected).
- **Supabase project / env / secrets** — env vars only; secrets never in code/commits/logs.
- **CI merge-gate** — Doc-8B harness wired as the merge gate; boundary lint + no-cross-schema-FK
  migration check (REPOSITORY_STRUCTURE.md §10).

**Exit:** repo green — skeleton compiles, 10 schemas migrate clean, harness runs, CI gate active.

---

## §6. Walking Skeleton

One minimal **real** end-to-end slice on the M0+M1 foundation, exercising the full
contract/DB/FE/test/deploy spine with frozen contracts — nothing mocked-as-truth.

```
Supabase Auth login
  → server-resolved active org (src/server/context)
  → one wired Doc-5C identity read API (e.g. a single read contract)
  → one identity table (standard columns + org-anchor RLS, Doc-6C)
  → one Doc-7E UI screen (account/identity shell)
  → one Doc-8 integration test (Doc-8B harness + outbox observer)
  → one Vercel deploy
```

**Justification:** M0/M1 are the universal prerequisites for every other module; this slice
proves auth + the tenant boundary + the contract/DB/FE/test/deploy spine end-to-end before any
feature work.

**No-mock rule (Doc-8 Band I, observe-never-author):** every domain/data/contract path in the
skeleton is **real**. Only infrastructure boundaries (Inngest/Storage/Realtime/Resend/PostHog/AI)
may be mocked, and only where genuinely unavailable.

**Exit:** the slice is deployed and its integration test is green in CI.

---

## §7. Implementation Waves

Derived strictly from the frozen dependency graph (§7.1). No dates; order only.

- **Wave 0 — Foundation tooling.** Repository Bootstrap (§5) + Doc-8B harness. *(Gate: repo green.)*
- **Wave 1 — Platform + Identity (serial M0 → M1).** M0 `core` (outbox/audit/`id_sequences`/
  `human_ref`/config/POLICY/flags) → M1 `identity` (users/orgs/memberships/roles/`check_permission`/
  delegation). Foundation for all; the Walking Skeleton (§6) completes here. *(Gate: M0, then M1.)*
- **Wave 2 — Independent domains (parallel).** M2 `marketplace` · M5 `trust` · M6 `communication`
  · M7 `billing`. Mutually independent at module level; M2↔M5 exchange events via **idempotent
  consumers** (async — no synchronous cycle). *(Gate: each module independently.)*
- **Wave 3 — The moat + post-award + admin.** M3 `rfq` (reads M2 matching-attributes / M5 signals /
  M7 quota / M4 CRM via service) → then **M4 `operations`** (consumes `RFQClosedWon`/`VendorInvited`)
  and **M8 `admin`** (decision authority; emits `VendorBanned`). *(Gate: M3, then M4 + M8.)*
- **Wave 4 — Advisory.** M9 `ai` (reads all; writes only `ai.*`; emits nothing; blocks nothing).

### 7.1 Frozen dependency graph (the spine — all cited; zero invention)

| Edge | Type | Source |
|---|---|---|
| M0 → all (M1–M9) | infra: audit/outbox/id-gen/POLICY/flags | Doc-4E §E0 DE-8; Doc-2 §8 (outbox) |
| M1 → all (M2–M9) | `check_permission` / org+membership / delegation | Doc-4E §E0 DE-1 |
| M2 → M3, M7, M9 | `vendor_matching_attributes` read-model + profiles | Doc-4E §E0 DE-2; Doc-2 §8 |
| M3 → M4, M6, M7 | `RFQClosedWon`/`VendorInvited`/`QuotationSubmitted`/`RFQMatched`/`RFQRouted` | Doc-2 §8; Doc-4M |
| M4 → M5, M6 | `DeliveryRecorded`/`EngagementCompleted`/`BuyerFeedbackRecorded` | Doc-2 §8 |
| M5 → M2, M3, M7 | `VendorTierChanged`/`VendorVerified`/`TrustScoreUpdated` (async; M2 consumes) | Doc-2 §8 |
| M7 → M3 | service: quotation-submission quota | Doc-4E §E0 DE-7 |
| M8 → M2, M3, M5 | `VendorBanned` + decision authority | Doc-2 §8; Doc-4E §E0 DE-5 |
| M6 → (none) | consumes only; emits nothing | Doc-4E §E0 DE-6 |
| M9 → (none) | reads all; emits nothing; advisory (Invariant #12) | Doc-2 §8 (no `ai.*` emitter); Doc-4K |

**Firewall guards asserted in every wave (never violated):** governance signals firewalled
(Invariant #6); billing firewall (no billing state gates trust/eligibility/routing/matching);
blacklist undetectable / non-disclosure (Invariant #11); Admin-decides–owning-module-owns;
AI-suggests–modules-decide (Invariant #12); money-record boundary (no funds custody;
`trade_invoices ≠ platform_invoices`).

---

## §8. Parallelization Plan

**Can run together:**
- Wave 2 modules M2 / M5 / M6 / M7 (mutually module-independent; event-decoupled).
- Per-module FE (Doc-7) + Test (Doc-8) tracks alongside that module's backend, once its frozen
  contracts are the oracle (they already are — Doc-5/6/7 frozen).

**Cannot run together:**
- M0 → M1 (serial; M1 needs M0 infra).
- M3 after M2 + M5 + M7 (matching attributes + signals + quota).
- M4 after M3 (consumes RFQ events).

**Critical path:** the moat chain **M0 → M1 → M2/M5 → M3 → M4**.

**Merge points:** the end of each wave is a **green Doc-8 gate** (§9). A wave does not close
until its modules' required conformance bands are green in CI.

---

## §9. Acceptance Gates

A work package / wave closes only when all of the following are green. NITPICKs (review-method
tier) are deferrable; correctness gates are not.

### 9.1 Required Doc-8 suites (band map; Doc-8A Appendix A, 39 `CHK-8-xxx` / bands A–I)

| Suite | Bands | Asserts |
|---|---|---|
| **Doc-8C** Contract & API | A + B | Envelope (Doc-5A §5.6; 204 exempt) · pagination (§8) · error class+status (§6.2) · idempotency · prohibited fields (Doc-4A §9.7) · actor-scope/field-trace. Wired-only. |
| **Doc-8D** Persistence/Migration/RLS | A + C | Schema constraints · immutability (CR4′; `ai.*` sole exception) · migration · **RLS gate `CHK-8-024` (MANDATORY): positive / negative / cross-tenant / #11 byte-equivalence** · cross-module integrity. **Defining suite for #8 + #11.** |
| **Doc-8E** Domain/Invariant/Firewall/State | A + D + E | 12 invariants · firewall (non-cross-mutation + non-dominance) · moat (governed property) · Doc-4M edge coverage. References #8/#11 (8D-defined). |
| **Doc-8F** Integration/Event-Flow | A + F | Cross-module boundary · write-plus-emit atomicity (outbox observer) · payload/dispatch/fan-out (⊆ Doc-4J; Doc-4L granularity) · consumer-effect locality. |
| **Doc-8G** Frontend/E2E | A + G | Component · a11y (WCAG-AA via axe) · visual regression · e2e (journeys invoke only frozen Doc-5) · currency · UI non-disclosure (`CHK-8-065`). |
| **Doc-8B** Harness | H + I | Realized for all suites (runner, ephemeral DB, fixtures, seeded clock, outbox observer, CI merge-gate). |

### 9.2 Required CI status
CI merge-gate green (Doc-8B). A **skipped / `.only` / deleted** test is a **red** gate, not a pass
(never-weaken; necessary-not-sufficient).

### 9.3 Required reviews
AI Coding Supervisor **or** human review for all AI-generated code; **architecture-affecting
changes require human approval** (CLAUDE.md §8) — code review alone is insufficient.

### 9.4 Definition of Ready (a WP may start when)
Governing frozen contracts identified · all dependencies gated green · WP template (§3.1) fully
filled · build owner assigned (§2.1).

### 9.5 Definition of Done (a WP/wave closes when)
Required Appendix-A bands attested + Build Artifact Checklist (§3.2) complete + **zero outstanding
`[ESC-*]` markers** (mirrors corpus freeze discipline — green tests alone are not "done") +
pre-PR checklist (IMPLEMENTATION_START_HERE.md) satisfied.

---

## §10. Risks (engineering only)

No architecture-redesign risks exist — the architecture is frozen. These are build-execution risks.

| Risk | Mitigation |
|---|---|
| Event-consumer idempotency across Wave 2 (M2↔M5; M4/M6 consumers) | Idempotent consumers + Doc-8F write-plus-emit atomicity (outbox observer); replay-safe. |
| RLS byte-equivalence regressions (blacklist/exclusion detectable) | Doc-8D `CHK-8-024` mandatory gate on every RLS change; #11 defining target (M4/M3). |
| Migration ordering across module-owned schemas | Doc-6A §11 forward-only/expand-contract; no cross-schema FK; migration check in CI. |
| Outbox atomicity (write without event, or vice-versa) | Business write + event insert in one transaction (Doc-2 §8); Doc-8B outbox observer + savepoint. |
| Generated-registry / Prisma-client drift | Generated paths gitignored + regenerated; manual edit = CI-failing (§4.1). |
| Harness flakiness undermining the gate | Deterministic harness (seeded clock, transaction-rollback isolation, dual ID mechanisms; Doc-8B). |

### 10.1 Implementation Rollback Strategy (build-time, not runtime)

If a wave fails its gate, the **restore unit is the wave's merge set**: git-revert the wave's
app-code merges to the **last green wave boundary**. Because frozen migrations are
**forward-only / expand-contract** (Doc-6A §11), a bad schema change is undone by a **compensating
forward migration**, never a down-migration. Each wave boundary is a **tagged known-good restore
point**.

---

## §11. Milestones (Implementation Milestones)

Dependency-ordered; no dates.

1. **Bootstrap green** — repo scaffold + 10 schemas migrate + harness + CI gate active (§5).
2. **Walking Skeleton deployed** — real M0+M1 auth→org→API→DB→UI→test→deploy slice green (§6).
3. **M0 / M1 gated** — `core` + `identity` pass their bands (Wave 1).
4. **Wave 2 modules gated** — `marketplace` · `trust` · `communication` · `billing` pass.
5. **Moat gated** — `rfq` (M3) passes, incl. dual-sided RLS + blacklist-undetectable byte-equivalence.
6. **Post-award + Admin gated** — `operations` (M4) + `admin` (M8) pass.
7. **Advisory gated** — `ai` (M9) passes (TTL hard-delete; advisory; never authoritative).
8. **Full Doc-8 fabric executing** — all suites run + merge-gate every PR; the authored-not-run
   conformance fabric is now live.

**After this document:** the **Build Roadmap** (the corpus's next declared step) sequences these
milestones into executable engineering work; then **Implementation (Code)** begins, gated by the
Doc-8 fabric.

---

## Sources (by Authority Order rank; pointers, never restated)

1. `Master_System_Architecture_v1.0_FINAL.md` (rank 0 — CANONICAL)
2. `ADR_Compendium_v1.md` (rank 1)
3. `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` (+ `Doc-2_Patch_v1.0.3.md`) — §8 events, §10 schema
4. `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` (+ patches; POLICY v1.0–v1.9)
5. `Doc-4A_Structure_v1.0_FROZEN.md` — API metastandard
6. `Doc-4E_Structure_v1.0_FROZEN.md` — §E0 DE-1…DE-8 dependency facts
7. `Doc-4J_FROZEN_v1.0.md` — authoritative event catalog · `Doc-4L_FROZEN_v1.0.md` — event-flow map · `Doc-4M_FROZEN_v1.0.md` — state machines
8. `Doc-5A_SERIES_FROZEN_v1.0.md` … `Doc-5K_SERIES_FROZEN_v1.0.md` — API realization (contract counts)
9. `Doc-6A_SERIES_FROZEN_v1.0.md` … `Doc-6K_SERIES_FROZEN_v1.0.md` — DB realization (table counts, RLS, R7/R8/§11)
10. `Doc-7_SERIES_FROZEN_v1.0.md` (`Doc-7A`…`Doc-7H`) — frontend realization
11. `Doc-8A_SERIES_FROZEN_v1.0.md` … `Doc-8G_SERIES_FROZEN_v1.0.md` — test & conformance (Appendix A bands/checks)
12. `REPOSITORY_STRUCTURE.md` · `CLAUDE.md` · `IMPLEMENTATION_START_HERE.md` · `project_details.md` (non-authoritative orientation)

---

*Non-authoritative orientation document (Implementation Planning). Derived from the frozen corpus;
on any conflict the frozen document wins and this file is patched to match. Decomposes only —
coins no architecture, API, schema, UI, event, permission, route, module, state, or contract.*
