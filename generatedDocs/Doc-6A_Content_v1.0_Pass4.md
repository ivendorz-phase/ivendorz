# Doc-6A — Database Realization Metastandard — Content v1.0 **Pass-4** (Appendix B + Appendix A Band J)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-4 (additive) — Independent Hard Review applied** (0 BLOCKER/MAJOR + 2 MINOR FIXED + 2 NITPICK no-action; §Review Disposition). Adds **Appendix B (Global Conventions Registry)** + **Appendix A Band J**. Realizes the "Global Registry" recommendation **inside** Doc-6A (no separate document). Next: Content Hard Review → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes (structure) | Consolidation appendix over the frozen `Doc-6A_Structure_v1.0_FROZEN` §3/§5/§6/§7/§10/§11 conventions; extends Appendix A (`CHK-6-xxx`) with one band |
| Authority | `Doc-2 v1.0.3` (the *what*-authority); the existing Doc-6A Pass-1/2/3 conventions; `Doc-5A` (shape precedent — registry pattern, not authority) |
| Coins | **Nothing.** Every Appendix-B row is either a **Doc-2 pointer** (a binding, realized verbatim) or a **§2.5-attributed Doc-6 realization choice** (a physical *how*). No domain element introduced |
| Discipline | **Reference-never-restate** — Appendix B *consolidates pointers* to the §3/§5/§6/§7/§10/§11 bodies; it does not re-author them. **One Module One Owner** — B.3 shared enums are limited to the M0-owned cross-cutting set; module enums stay module-owned |

> **Why this exists.** The Board recommendation ("a shared Doc-6 Global Registry — the DB equivalent of Doc-5A; modules realize, never invent") is **already the Doc-6A design**. Doc-6A *is* that registry. Pass-4 closes the one residual gap the recommendation surfaced: several conventions (Prisma/PG types, naming, the base model, the cross-cutting enums) were **scattered or thin** across §2.3/§3/§5/§6/§10. Appendix B **consolidates** them into one normative reference every Doc-6B…6K extends — so no module invents a parallel convention. Done now (content phase, pre-freeze) it freezes as part of Doc-6A; no frozen doc is reopened, no new document is spawned.

---

## Appendix B — Global Conventions Registry *(consolidation; authors no table)*

One place a per-module author (human or AI) looks to inherit every cross-cutting persistence convention. Each row is tagged **[Doc-2 binding]** (realized verbatim from the cited anchor) or **[§2.5 choice]** (a Doc-6 physical realization decision — binding on Doc-6B…6K, no Doc-2 authority, revisable by an additive Doc-6 patch).

### B.1 Base model (the canonical column set every model extends)

Consolidates §3.1/§3.3 (no restatement — the rules live there). Every table is composed from these tuples; a per-module model **extends** this base, never redefining it.

| Element | Columns | Applies to | Source |
|---|---|---|---|
| Identity | `id` (UUIDv7, M0 ID service) | all | §3.1 — **[Doc-2 §0.1 binding]** |
| Human reference | `human_ref` | only where Doc-2 §0.1 mandates | §3.2 — **[Doc-2 §0.1 binding]** |
| Timestamps | `created_at`, `updated_at` | all | §3.3 — **[Doc-2 §0.2 binding]** |
| Actor stamps | `created_by`, `updated_by` (+ domain `*_by`) | where Doc-2 declares an actor | §3.3 — **[Doc-2 §0.2 binding]** |
| Tenant boundary | `organization_id` | every tenant-owned table | §3.3 / §4.2 — **[Doc-2 §6 binding]** |
| Soft delete | `deleted_at`, `deleted_by`, `delete_reason` (never `is_deleted`) | every soft-deletable table | §3.3 — **[Doc-2 §0.2 binding]** |

### B.2 Common Prisma / PostgreSQL type catalog

Consolidates the physical type mappings used in §2.3/§3.6 snippets. The *logical* requirement is the Doc-2 binding; the *physical type* is the §2.5 choice.

| Logical (Doc-2) | Physical PG | Prisma | Tag |
|---|---|---|---|
| UUIDv7 identifier | `uuid` | `String @db.Uuid` | **[§2.5 choice]** (UUIDv7 = §3.1 binding) |
| Timestamp | `timestamptz` | `DateTime @db.Timestamptz` | **[§2.5 choice]** |
| Monetary amount | `NUMERIC(p,s)` | `Decimal @db.Decimal(p,s)` | **[§2.5 choice]** (NUMERIC+currency = Doc-2 §0.4 binding) |
| Currency | `char(3)` | `String @db.Char(3)` | **[§2.5 choice]** (ISO-4217; default `'BDT'` = Doc-2 §0.4 binding) |
| Structured payload | `jsonb` | `Json @db.JsonB` | **[§2.5 choice]** (non-relational only — §3.7) |
| Human reference | `text` | `String` | **[§2.5 choice]** (format `TYPE-YEAR-XXXXX` = §3.2 binding) |
| Enumerated state | `text` + CHECK *or* PG `enum` | `enum` / `String` | **[§2.5 choice]** (CHECK preferred — §5.4; values = Doc-2 binding) |

(`p,s` precision/scale per Doc-2 §10.x — not a global default.)

### B.3 Shared-enum catalog *(ownership-safe — cross-cutting only)*

**Binding ownership rule:** only **genuinely cross-cutting** enums are shared, and they are **M0/`core`-owned** (realized in Doc-6B). **Every module-specific enum stays module-owned** (Doc-2 §3/§5; One Module One Owner) — the registry **forbids** centralizing a module's own enum here.

| Shared enum | Values | Owner | Source |
|---|---|---|---|
| `actor_type` | `User\|Admin\|System\|AI Agent` | M0 `core` | Doc-2 §9 — **[Doc-2 binding]** (used by audit §8.1, System-actor score writes §6.4) |
| `currency` (supported set) | per Doc-2 §0.4, default `'BDT'` | M0 `core` | Doc-2 §0.4 — **[Doc-2 binding]** |
| outbox `status` | `pending → dispatched → archived` | M0 `core` | §7.2 / Doc-2 §10.1 — **[Doc-2 binding]** (M0-owned outbox; not a module enum) |

Anything not in this table (RFQ states, quotation states, subscription states, claim states, visibility, …) is **module-owned**, realized in that module's Doc-6x against Doc-2 §3/§5 — **never lifted into B.3**.

### B.4 Naming-convention registry

Consolidates the naming patterns scattered across §3.5/§5.2/§6.3/§10.1. **All names are §2.5 realization choices** (the *behaviors* they name are Doc-2 bindings — cited). `<schema>` = canonical namespace (R3a); `<table>`/`<cols>` lower_snake_case.

| Object | Pattern | Behavior source |
|---|---|---|
| Primary key | `<table>_pkey` (PG default) | §3.1 — **[Doc-2 §0.1]** |
| Partial-unique (live) | `<table>_<cols>_live_uq` | §3.5 — **[Doc-2 §0.2/§10.11]** |
| Plain unique | `<table>_<cols>_uq` | §5 integrity / §2.5 (unique sets declared per Doc-2 §10.x) |
| Sort/cursor index | `<table>_<sortcol>_id_idx` | §10.1 — consistency w/ **Doc-5A §8** |
| General index | `<table>_<cols>_idx` | §10.6 |
| FTS index | `<table>_fts_gin` | §10.4 |
| Intra-schema FK | `<child>_<parent>_fk` | §5.2 — **[Doc-2 §4]** (same-schema only — §5.3) |
| CHECK constraint | `<table>_<col>_chk` | §5.4 |
| Immutability trigger | `<table>_block_mutation_when_bound` | §6.3 — **[Doc-2 §5]** |
| Append-only trigger | `<table>_block_mutation` | §6.4 — **[Doc-2 §0.2/§5]** |
| Shared trigger function | `core.raise_immutable_violation()` | §6.3 (realized in Doc-6B) |
| Human-ref sequence | via `core.id_sequences` (row-locked) | §3.2 — **[Doc-2 §0.1]** |

(All `<table>_…` names are within the table's own schema; **no name implies a cross-schema object** — §5.3.)

### B.5 Pointers (consolidated, not restated)

| Convention | Lives in |
|---|---|
| Multi-schema ownership (physical schema = canonical namespace; one Prisma namespace/module) | §1.2 / §2.2 / R3a/R3b |
| Cross-module relation rule (bare UUID, no cross-schema FK, service-validate, orphan-scan) | §5.3 / §5.5 |
| Migration strategy (forward-only, per-module, expand-contract, non-destructive, codegen→gitignored registry) | §11 |
| Tenancy / RLS-as-backstop / non-disclosure | §4 |
| Outbox transactional write+emit · audit immutability | §7 / §8 |
| Doc-5 consistency (cursor-index, page-size/idempotency via POLICY key) | §10 |

---

## Appendix A — Band J (additive; appends to the Pass-3 checklist)

### Band J — Global-registry conformance (Appendix B)
- **CHK-6-090** every model **extends the B.1 base model** (standard columns) + uses the **B.2 type catalog**; the module invents **no parallel base-model or type convention**.
- **CHK-6-091** the module **coins no shared enum**; it reuses the B.3 cross-cutting set (`actor_type`, `currency`, outbox `status`) by pointer and keeps its **own** enums module-owned (no module enum lifted into B.3 — One Module One Owner).
- **CHK-6-092** every index / constraint / trigger / function / sequence name follows the **B.4 naming registry**; no ad-hoc naming.
- **CHK-6-093** the module realizes the B.5-pointed conventions (multi-schema ownership, cross-module-by-UUID, migration discipline) as written — inventing no local variant.

*(Band J appends; existing IDs `CHK-6-001…083` unchanged — append-never-renumber, per `Doc-5A_Content_v1.0_Pass11 §A.0`. Bands now 10: A–J; checks 33 → 37.)*

---

## Review Disposition (Independent Hard Review — Pass-4)

Reviewer: independent (Architecture Board / DDD / Security). Verified: actor_type values verbatim (Doc-2 §9), outbox `status` verbatim (Doc-2 §10.1), 26/27 B-rows correctly traced, B.3 One-Module-One-Owner intact (no module enum centralized; outbox status correctly M0-infra), reference-never-restate held, Band J check-IDs unique + each backed, **33→37 checks / 9→10 bands math correct**. 0 BLOCKER/MAJOR; no coined element; no cross-schema object implied.

| Finding | Sev | Disposition |
|---|---|---|
| **FND-4-001** B.4 plain-unique `_uq` sourced to §5.4 (which is CHECK, not unique-naming) | MINOR | **FIXED** — re-sourced to "§5 integrity / §2.5 (unique sets declared per Doc-2 §10.x)"; the `_uq` name is a §2.5 naming choice, unique behavior is per-module Doc-2 §10.x. |
| **FND-4-002** actor_type pipe spacing differs from Doc-2 verbatim | MINOR | **FIXED** — normalized to `User\|Admin\|System\|AI Agent` (no spaces), matching Doc-2 §9. |
| **FND-4-003** "33→37 / 9→10" math | NIT | **NO ACTION** — reviewer verified correct. |
| **FND-4-004** `Doc-5A_Content_v1.0_Pass11 §A.0` cite | NIT | **NO ACTION** — file/anchor confirmed present earlier this session. |

---

*End of Doc-6A Content Pass-4 (Appendix B + Appendix A Band J) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Additive consolidation realizing the "Global Registry" recommendation inside Doc-6A — no separate document, no frozen doc reopened. Coins nothing; every entry a Doc-2 binding or a §2.5-attributed choice; shared enums limited to the M0-owned cross-cutting set (One Module One Owner intact). Next: Content Hard Review (full §0–§13 + Appendix A/B) → Content Freeze Audit → `Doc-6A_SERIES_FROZEN` → Doc-6B (M0 `core`).*
