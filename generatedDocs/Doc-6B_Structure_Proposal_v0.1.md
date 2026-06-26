# Doc-6B — M0 Platform Core (`core`) Schema Realization — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review applied** (0 BLOCKER/MAJOR/MINOR/NITPICK — clean; §Review Disposition). Freeze-ready → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-6B artifact) |
| Module | **Module 0 — Platform Core / Shared Kernel** (`core` schema; the infra-only shared kernel — audit, outbox, ID/human-ref sequences, config, feature flags). **Infra-only: no business aggregate** (Doc-2 §2 "no aggregates, by rule") |
| Realizes | **Doc-2 §10.1** (the `core` blueprint) — **5 platform-owned tables**: `audit_records` · `outbox_events` · `id_sequences` · `system_configuration` · `feature_flags` (Doc-2 §2/§3.1/§8/§9/§0.1) — as physical PostgreSQL/Prisma schema, **against the frozen `Doc-6A` conventions** |
| Authority | **`Doc-6A_SERIES_FROZEN_v1.0` governs this document** (the DB metastandard — Appendix A is the freeze gate); **Doc-2 v1.0.3 is the binding *what*-authority**; `Doc-4B` (M0 contract owner — consumed); `Doc-3 §12` POLICY keys |
| Precedent (informational, not authority) | The Doc-5 per-module structure-proposal house style; force derives from `Doc-6A §1/§13/Appendix A`, never from Doc-5 |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ POLICY patch v1.0 `core.*`), Doc-4A v1.0, Doc-4B v1.0 (FROZEN — M0 contracts, consumed), Doc-6A v1.0 (FROZEN — DB metastandard) |
| Contains | Structure only — section map, the 5-table partition, proposed ratified realization decisions (CR-set), the Appendix-A applicability map, carried dependencies. **No DDL, Prisma models, migration scripts, index lists, or RLS bodies** — those land in the Doc-6B content passes |
| Audience | Architecture Board · DDD/Security Architect · Doc-6B content authors (human + AI) · AI Coding Supervisor · backend, DBA |
| Module note | `core` is the **DR-6-CORE** dependency every other module schema references by pointer (ID/outbox/audit/config). Doc-6B realizes the tables; the **transactional-outbox-write** and **audit-write** are cross-cutting **Doc-4B obligations** other modules declare against M0 — realized as code, referenced here, never re-authored per module |

Two governing rules shape the document:

1. **Realize, never re-decide.** Doc-2 §10.1 fixed *what* `core` persists (5 tables, columns, lifecycles — FROZEN); Doc-6A fixed *how* a Doc-2 table becomes physical schema (FROZEN). Doc-6B realizes the `core` tables and re-decides nothing. Coins no table, column, state, event, audit-action, or POLICY key.
2. **Conformance is an obligation.** Doc-6B passes the **Doc-6A Appendix A** (`CHK-6-xxx`) checklist before freeze, attesting PASS / N/A-with-reason per check.

## Decisions proposed for ratification at structure freeze (CR-set)

- **CR1 — Five platform-owned tables only; infra-only, no business aggregate.** Doc-6B realizes exactly the Doc-2 §10.1 set: `core.audit_records`, `core.outbox_events`, `core.id_sequences`, `core.system_configuration`, `core.feature_flags` (Doc-2 §2/§3.1). **No aggregate, no state machine** (Doc-2 §2 "by rule"). Any sixth table is non-conformant — flag-and-halt.
- **CR2 — Platform-owned tenancy; no org RLS anchor (Doc-2 §6).** All five are **platform-owned** (Doc-2 §6 platform-owned class). **No `core` table carries `organization_id` as an RLS tenant anchor.** `core.audit_records.organization_id` is a **polymorphic audit-context reference column** (Doc-2 §9), **not** a tenant anchor — audit RLS is platform-staff-scoped, never org-scoped (Doc-6A §4.1 platform-owned posture; the materialized-grantee / non-disclosure machinery §4.3/§4.4 is **N/A** to `core`). Authorization remains app-layer (Doc-6A §4.5).
- **CR3 — Doc-2-noted PK exceptions (realize Doc-2, not the generic default).** Doc-2 §10.1 legend = "PK: all tables `id UUIDv7` **unless noted**." Two `core` tables are noted: **`audit_records` PK = `audit_id`** (a time-ordered UUIDv7 — Doc-2 §9/§10.1) and **`id_sequences` PK = composite `(entity_type, year)`** (Doc-2 §10.1). Doc-6B realizes these Doc-2-noted PKs verbatim; this is Doc-2 binding overriding the Doc-6A §3.1 generic `id`-default — **not** a coinage (Doc-6A §0.2 realize-never-redecide; Doc-2 is the *what*-authority). The other three tables use `id UUIDv7` (Doc-6A §3.1).
- **CR4 — Append-only immutability; NOT soft-deletable (Doc-2 §10.1 SD=NO).** `audit_records` and `outbox_events` are **append-only** (INSERT-only; UPDATE/DELETE trigger-blocked — Doc-6A §6.4). All five tables are **SD=NO** in Doc-2 §10.1 → they carry **no soft-delete tuple** and **no partial-unique-live index** (the Doc-6A §3.3/§3.5 soft-delete machinery is **N/A** here — these are not soft-deletable). `audit_records` redaction is a **new audit event** (Doc-2 §9), never in-place; an "archive" flag (not a delete) governs audit retention; `outbox_events` archives after dispatch.
- **CR5 — `outbox_events.status` is a status column, NOT a Doc-2 §5 state machine (Doc-4B Structure Patch F-03).** Realized as enumerated values `pending|dispatched|archived` + CHECK (Doc-6A §5.4), **not** a state-machine transition trigger. The **transactional write+emit** rule (business write + outbox insert, one transaction — Doc-6A §7.1) is the load-bearing contract; dispatch/retry/backoff is code (Inngest), bounded by the registered `core.outbox_dispatch_*` POLICY keys.
- **CR6 — `id_sequences` = the human-reference generator (Doc-2 §0.1/§10.11).** Composite PK `(entity_type, year)`; columns `entity_type, year, next_value`; **row-locked allocation** (`SELECT … FOR UPDATE` / advisory lock — Doc-6A §5.6), **gap-tolerant, never reused** (Doc-2 §10.11). Produces `human_ref` (`TYPE-YEAR-XXXXX`) for the whole platform — the realization of Doc-6A §3.2.
- **CR7 — `system_configuration` = the POLICY store; seed the registered `core.*` keys (Doc-3 v1.0).** Columns `key, value_jsonb, value_type, updated_by` (Doc-2 §10.1). Seeds the **18 registered `core.*` POLICY keys** from `Doc-3_Policy_Key_Registration_Patch_v1.0` (audit/outbox/config/flag keys) — **by pointer, no key coined, no default value invented** (Doc-6A §9; the patch is authority). Config changes are audited (Doc-2 §3.1). Read by all modules via the M0 config service (Doc-4B §18).
- **CR8 — `feature_flags` = rollout control with a firewall (Doc-4B §B9).** Columns `flag_key, enabled, scope_jsonb` (Doc-2 §10.1). Flag evaluation **gates feature visibility / rollout ONLY** — it **MUST NOT gate trust, verification, eligibility, routing fairness, or matching confidence** (Doc-4B §B9 firewall). Realized as a keyed store; evaluation is code (M0 service).
- **CR9 — `core` is consumed, not coupled (DR-6-CORE).** Doc-6B realizes the 5 tables; the **cross-cutting obligations** other modules declare against M0 — the audit-write (Doc-4B §17), the transactional-outbox-write (§16.2), UUIDv7 + human-ref allocation (§8), POLICY resolution (§18), flag evaluation — are **Doc-4B contracts/obligations**, realized as code and referenced by pointer. Other Doc-6x **reference** `core.*` by bare UUID; they never re-author it (One Module, One Owner).
- **CR10 — Audit partitioning (a §2.5 realization choice).** `audit_records` is **partitioned by month** (time-ordered UUIDv7 PK — Doc-2 §10.1 note). Partitioning strategy + partition naming are **Doc-6 realization choices** (Doc-6A §2.5), realizing the Doc-2-noted intent; the immutability/append-only behavior is the Doc-2 binding.

## The `core` schema partition (the structural spine)

> **5 Doc-2 §10.1 tables**, each realized in exactly one §3.x section. All platform-owned; none soft-deletable; no business aggregate; no Doc-2 §5 state machine.

| Doc-2 §10.1 table | PK | Columns (verbatim, Doc-2) | SD | Tenancy | Lifecycle | Doc-6B § |
|---|---|---|---|---|---|---|
| `core.audit_records` | `audit_id` (UUIDv7, time-ordered) | `audit_id, actor_id, actor_type[User\|Admin\|System\|AI Agent], organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent` (§9) | NO (append-only; archive flag) | platform-owned | append-only, never deleted | **§3.1** |
| `core.outbox_events` | `id` (UUIDv7) | `event_name, event_version, payload_jsonb, status, dispatched_at, attempts` (+ std cols) | NO (archived after dispatch) | platform-owned | `pending→dispatched→archived` (status col, not §5 machine) | **§3.2** |
| `core.id_sequences` | `(entity_type, year)` composite | `entity_type, year, next_value` | NO | platform-owned | simple | **§3.3** |
| `core.system_configuration` | `id` (UUIDv7) | `key, value_jsonb, value_type, updated_by` | NO | platform-owned | simple (changes audited) | **§3.4** |
| `core.feature_flags` | `id` (UUIDv7) | `flag_key, enabled, scope_jsonb` | NO | platform-owned | simple | **§3.5** |

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-6B's precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4B → **Doc-6A → Doc-6B** → Code; Doc-6B consumes Doc-4B + is gated by Doc-6A Appendix A); realize-never-redecide; conform to Doc-6A in full + pass Appendix A; flag-and-halt. State the two freeze obligations: pass Appendix A (`CHK-6-xxx`) and clear any `[ESC-6-*]` via its named channel.
- **Dependencies:** `Doc-6A §0/§13`; `Doc-2 §10.1`. **Detail:** short, normative.

## §1 — Scope & the `core` Table Partition
- **Purpose:** what Doc-6B governs (the 5 `core` tables) and not (no other schema; the Doc-4B *contracts/obligations* are referenced, not re-authored — CR9); carry the partition table; register carried dependencies (DR-6-CORE consumed-by-all; `[ESC-6-*]` if any). State the infra-only / no-aggregate / no-state-machine facts (Doc-2 §2).
- **Dependencies:** `Doc-2 §2/§3.1/§10.1`; `Doc-6A §1`. **Detail:** scope + partition.

## §2 — Schema, Tenancy & Immutability Posture *(mechanism only)*
- **Purpose:** declare the `core`-wide posture: physical schema = `core` (Doc-6A R3a); **platform-owned, no org RLS anchor** (CR2 — audit `organization_id` is a reference column, not an anchor; non-disclosure/grantee machinery N/A); **append-only / not-soft-deletable** (CR4 — no soft-delete tuple, no partial-unique-live index); the Doc-2-noted PK exceptions (CR3); RLS posture = platform-staff scope (app-layer authz, RLS backstop — Doc-6A §4.5). State which Doc-6A bands are **N/A** to `core` (tenancy org-anchor, materialized grantees, non-disclosure byte-equivalence, soft-delete, multi-currency).
- **Dependencies:** `Doc-2 §6/§9/§10.1`; `Doc-6A §3/§4/§6`. **Detail:** posture declaration; N/A-band map.

## §3 — Per-Table Realization

### §3.1 — `core.audit_records`
- **Purpose:** realize the immutable audit stream — PK `audit_id` (UUIDv7, time-ordered — CR3); the §9 column set verbatim (incl. `actor_type` enum from Appendix B.3 / Doc-2 §9, `organization_id` reference column); **append-only** (INSERT-only; UPDATE/DELETE trigger-blocked — Doc-6A §6.4); **redaction = new audit event** (Doc-2 §9), never in-place; **no blobs** — document versions by ID (Doc-2 §9 / Doc-6A §12); **monthly partitioning** (CR10); indexes for the audit-read/correlation contracts (Doc-4B §17; bounded by `core.audit_query_*` POLICY keys). The audit-write itself is a Doc-4B obligation other modules invoke (CR9).
- **Dependencies:** `Doc-2 §9/§10.1`; `Doc-4B §17`; `Doc-6A §6.4/§8/§12`; `Doc-3 v1.0` (audit POLICY keys). **Detail:** table + immutability + partition realization.

### §3.2 — `core.outbox_events`
- **Purpose:** realize the transactional outbox — PK `id` (UUIDv7); columns `event_name, event_version, payload_jsonb, status, dispatched_at, attempts` + standard columns (Doc-6A §7.2 full set); `status` enum + CHECK `pending|dispatched|archived` (CR5, **not** a §5 machine); **append-only** (archived after dispatch); the **transactional write+emit** contract (Doc-6A §7.1); a `(status, created_at)` dispatcher-poll index (Doc-6A §10); dispatch/retry/archival bounded by `core.outbox_dispatch_*` / `core.outbox_archive_*` POLICY keys (Doc-3 v1.0). No event coined (Doc-2 §8 / Doc-4J catalog / Doc-4L flow).
- **Dependencies:** `Doc-2 §8/§10.1`; `Doc-4B §16.2`; `Doc-6A §7/§10`; `Doc-3 v1.0` (outbox POLICY keys). **Detail:** outbox table + transactional contract.

### §3.3 — `core.id_sequences`
- **Purpose:** realize the human-reference generator — composite PK `(entity_type, year)` (CR3); columns `entity_type, year, next_value`; **row-locked, gap-tolerant, never-reused** allocation (CR6; Doc-6A §5.6 / Doc-2 §10.11); produces `human_ref` `TYPE-YEAR-XXXXX` (Doc-6A §3.2). The UUIDv7 ID service (Doc-4B §8) is the separate machine-ID source; this table is only the human-ref counter.
- **Dependencies:** `Doc-2 §0.1/§10.1/§10.11`; `Doc-4B §8`; `Doc-6A §3.2/§5.6`. **Detail:** sequence table + concurrency realization.

### §3.4 — `core.system_configuration`
- **Purpose:** realize the POLICY store — PK `id` (UUIDv7); columns `key, value_jsonb, value_type, updated_by`; **seed the 18 registered `core.*` keys** (Doc-3 v1.0 — CR7) by pointer, no key/value coined; config changes audited (Doc-2 §3.1); read by all modules via the M0 config service (Doc-4B §18); the reference form `core.system_configuration.core.<key>` (Doc-4A §18.2). Idempotent forward-only seed migration (Doc-6A §9.5/§11.3).
- **Dependencies:** `Doc-2 §10.1`; `Doc-3 §12` + Patch v1.0; `Doc-4B §18`; `Doc-6A §9/§11.3`. **Detail:** config table + seed realization.

### §3.5 — `core.feature_flags`
- **Purpose:** realize rollout control — PK `id` (UUIDv7); columns `flag_key, enabled, scope_jsonb`; the **flag firewall** (CR8 — visibility/rollout only; never trust/verification/eligibility/routing/matching — Doc-4B §B9); evaluation is code (M0 service); flag changes audited + bounded by `core.flag_change_*` POLICY keys.
- **Dependencies:** `Doc-2 §10.1`; `Doc-4B §B9`; `Doc-3 v1.0` (flag POLICY keys). **Detail:** flag table + firewall.

## §4 — Cross-Cutting `core` Realization *(mechanism only)*
- **Purpose:** the realization rules spanning the 5 tables: append-only trigger pattern (Doc-6A §6.4 — `core.raise_immutable_violation()` realized here, the shared function Doc-6A §6.3 referenced from every module); the M0-owned standard columns; the consumed-by-all obligations (CR9 — audit-write / outbox-write / ID+human-ref / POLICY / flag are Doc-4B contracts realized as code); the integrity orphan-scan job home (Doc-6A §5.5 — `core` hosts no cross-module FK, but the scan that reconciles every module's bare-UUID refs is M0-adjacent infra). No cross-schema FK; no out-of-DB artifact as a table (Doc-6A §12).
- **Dependencies:** `Doc-6A §5.5/§6.3/§6.4`; `Doc-4B §16/§17/§18`. **Detail:** cross-table realization rules.

## §5 — POLICY Seed & Migration
- **Purpose:** the forward-only seed of the 18 registered `core.*` keys (CR7); the `core` schema's structural migration (the 5 tables + the shared `core.raise_immutable_violation()` function + audit partitioning) — forward-only, non-destructive (Doc-6A §11); codegen → gitignored registry (Doc-6A §11.4). Seeds bind to Doc-3 v1.0 / Doc-2 §7 (no role seed here — roles are `identity`/Doc-6C); none invented.
- **Dependencies:** `Doc-6A §11`; `Doc-3 v1.0`. **Detail:** migration + seed plan.

## §6 — Conformance & Carried Items
- **Purpose:** Doc-6B's attestation map against **Doc-6A Appendix A** (which of the 37 `CHK-6-xxx` apply, which are **N/A-with-reason** — the tenancy-org-anchor / materialized-grantee / non-disclosure / soft-delete / multi-currency checks are N/A to platform-owned infra-only `core`); the carried register; statement that Doc-6B coins nothing. Note: `[ESC-6-POLICY]` for `core` is **already cleared** (Doc-3 v1.0 registered the 18 keys) — no new policy gate.
- **Dependencies:** `Doc-6A Appendix A`; `Doc-2 §10.1`. **Detail:** attestation map + carried register.

## Appendix A — Doc-6B Conformance Attestation (Doc-6A `CHK-6-xxx`)
- **Purpose:** per-check PASS / N/A-with-reason against the 10 bands. Expected `core`-specific dispositions: **Band A** standard-column (PASS, with the CR3 Doc-2-noted PK exceptions documented) · **Band B** schema-isolation (PASS — no cross-schema FK; `core` is the referenced owner) · **Band C** tenancy/RLS (**mostly N/A** — platform-owned, no org anchor; RLS = platform-staff backstop) · **Band D** immutability (PASS — append-only triggers; ai-cache exception N/A) · **Band E** outbox/audit (PASS — the core realization of both) · **Band F** multi-currency (**N/A** — no monetary column in `core`) · **Band G** POLICY/seed (PASS — 18 `core.*` keys seeded) · **Band H** Doc-5 consistency (PASS — realizes Doc-5B's reads: audit query/correlation, config/flag reads — persistable; bounded by `core.*` page-size/rate keys) · **Band I** realize-never-redecide (PASS — 5 tables, nothing coined) · **Band J** global-registry (PASS — extends Appendix B base model + type catalog + naming; `actor_type` shared enum reused).
- **Dependencies:** `Doc-6A Appendix A`; `Doc-5B` (the M0 API surface to persist). **Detail:** attestation table (content pass).

---

## Open Carried Items

| ID | Item | Doc-6B handling | Freeze gate? |
|---|---|---|---|
| **DR-6-CORE** | `core` owns audit/outbox/id/config/flags; consumed by all modules | **Realized here** (the owner); other Doc-6x reference by pointer | **No** (this doc resolves it) |
| **DR-6-API** | Doc-5B (M0 API) must be persistable | Band H cross-check (audit/config/flag reads); no gap expected | No |
| `[ESC-6-POLICY]` (core) | `core.*` POLICY keys | **Already cleared** — Doc-3 v1.0 registered 18 `core.*` keys; seed by pointer | **No** |
| `[ESC-6-SCHEMA]` | Any `core` physical need with no Doc-2 §10.1 source | None expected; if any → additive Doc-2 patch (human-approved); never invented | Possible (none expected) |

## Fences / Out of scope

Authoring any non-`core` table (other Doc-6x) · the Doc-4B *contracts/obligations* themselves (audit-write/outbox-write/ID/POLICY/flag logic = code, referenced) · coining any table/column/state/event/audit-action/POLICY-key · changing any Doc-2 declaration · giving `core` an organization_id RLS anchor (it is platform-owned — CR2) · soft-deleting an append-only stream (CR4) · letting a feature flag gate trust/verification/eligibility/routing/matching (CR8) · any cross-schema FK · DDL/Prisma/migration bodies (content passes).

---

## Provenance & next steps

- **Provenance:** first Doc-6B artifact. Grounded in Doc-2 §10.1 (the 5-table `core` blueprint, the *what*), Doc-6A (the *how*, FROZEN), Doc-4B (M0 ownership/obligations, consumed). No frozen doc edited; nothing coined.
- **Status:** **PROPOSAL v0.1 — pre-review.** CR-set CR1–CR10; partition = 5 platform-owned tables; section map §0–§6 + Appendix A.
- **Next:** Independent Hard Review (v0.1 → v0.2) → Structure Freeze Audit → `Doc-6B_Structure_v1.0_FROZEN` → content passes (per-table DDL/Prisma + the seed) → Content Freeze Audit → `Doc-6B_SERIES_FROZEN`.

## Review Disposition (Independent Hard Review — Structure v0.1 → v0.2)

Reviewer: independent (Architecture Board / DDD / Security). **0 BLOCKER · 0 MAJOR · 0 MINOR · 0 NITPICK** — no defects, no fixes. Clean result follows from field-tracing the structure to Doc-2 §10.1 from the start (the Doc-5J precedent). Anchors verified CORRECT: the 5-table set (Doc-2 §10.1 l.703–711); all column lists verbatim (audit §9 l.679; outbox/id_seq/config/flags §10.1 l.708–711); both Doc-2-noted PK exceptions (CR3 — `audit_id`, composite `(entity_type, year)`); platform-owned tenancy + audit `organization_id` = reference column not anchor (CR2; Doc-2 §6 l.602); append-only/SD=NO (CR4); outbox status ≠ §5 machine (CR5; Doc-4B Structure Patch F-03 / PATCH-4BS-03); 18 registered `core.*` POLICY keys + already-cleared (CR7; Doc-3 v1.0 §3); feature-flag firewall (CR8; Doc-4B §B9); Band-H persistability of Doc-5B reads; full conform-to-Doc-6A (CR10 partitioning = §2.5 choice). Observation resolved: core's **18 domain-specific** POLICY keys (not the generic 2-key shape) are correct — Doc-6A §9 mandates seeding the *actual registered* keys; no Doc-6A conflict. **Verdict: APPROVE to Structure Freeze Audit.**

---

*End of Doc-6B Canonical Structure **Proposal v0.2** — structure only; Independent Hard Review applied (0 findings — freeze-ready). On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6B realizes the 5 `core` tables verbatim from Doc-2 §10.1 against the frozen Doc-6A conventions; coins nothing. Platform-owned, append-only, infra-only; the DR-6-CORE foundation every module references.*
