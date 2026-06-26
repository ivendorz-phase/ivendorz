# Doc-6B — M0 Platform Core (`core`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `core` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6B_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 0 findings; authoring history retained there). Certified by `Doc-6B_Structure_Freeze_Audit_v1.0.md` |
| Module | **Module 0 — Platform Core / Shared Kernel** (`core` schema; infra-only shared kernel — audit, outbox, ID/human-ref sequences, config, feature flags). **No business aggregate** (Doc-2 §2, "by rule") |
| Realizes | **Doc-2 §10.1** — 5 platform-owned tables (`audit_records` · `outbox_events` · `id_sequences` · `system_configuration` · `feature_flags`) as physical PostgreSQL/Prisma schema, against the frozen `Doc-6A` conventions |
| Authority | **`Doc-6A_SERIES_FROZEN_v1.0` governs** (Appendix A = freeze gate); **Doc-2 v1.0.3 = binding *what*-authority**; `Doc-4B` (M0 contracts, consumed); `Doc-3 §12` + Patch v1.0 (`core.*` POLICY) |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ POLICY v1.0), Doc-4A v1.0, Doc-4B v1.0 (FROZEN), Doc-6A v1.0 (FROZEN) |
| Contains | Structure only — section map, the 5-table partition, ratified realization decisions (CR-set), the Appendix-A applicability map, carried dependencies. No DDL/Prisma/migration/index/RLS bodies (content passes) |
| Audience | Architecture Board · DDD/Security Architect · Doc-6B content authors (human + AI) · AI Coding Supervisor · backend, DBA |
| Module note | `core` is **DR-6-CORE** — referenced by every other module schema (ID/outbox/audit/config). Doc-6B realizes the tables; the transactional-outbox-write and audit-write are cross-cutting **Doc-4B obligations** (code), referenced not re-authored |

Two governing rules:

1. **Realize, never re-decide.** Doc-2 §10.1 fixed *what* `core` persists (5 tables — FROZEN); Doc-6A fixed *how* (FROZEN). Doc-6B realizes; coins nothing.
2. **Conformance is an obligation.** Doc-6B passes Doc-6A Appendix A (`CHK-6-xxx`) before content freeze (PASS / N/A-with-reason per check).

## Decisions ratified at structure freeze (CR-set)

- **CR1 — Five platform-owned tables only; infra-only, no aggregate.** Exactly the Doc-2 §10.1 set; no state machine (Doc-2 §2 "by rule"). A sixth table is non-conformant.
- **CR2 — Platform-owned; no org RLS anchor.** All five platform-owned (Doc-2 §6). No `core` table carries `organization_id` as an RLS anchor; `audit_records.organization_id` is a polymorphic audit-context **reference column** (Doc-2 §9), not a tenant anchor. Audit RLS = platform-staff scope; materialized-grantee / non-disclosure machinery **N/A**. Authorization app-layer (Doc-6A §4.5).
- **CR3 — Doc-2-noted PK exceptions.** Doc-2 §10.1 legend = "PK: all tables `id UUIDv7` unless noted." Noted: `audit_records` PK = `audit_id` (time-ordered UUIDv7 — Doc-2 §9/§10.1); `id_sequences` PK = composite `(entity_type, year)` (Doc-2 §10.1). Realized verbatim — Doc-2 binding over the Doc-6A §3.1 generic `id`-default; not a coinage. Other three use `id UUIDv7`.
- **CR4 — Append-only; NOT soft-deletable (Doc-2 §10.1 SD=NO).** `audit_records` + `outbox_events` append-only (INSERT-only; UPDATE/DELETE trigger-blocked — Doc-6A §6.4). All five SD=NO → no soft-delete tuple, no partial-unique-live index (Doc-6A §3.3/§3.5 N/A). Audit redaction = new audit event (Doc-2 §9), never in-place; an archive flag (not delete) governs audit retention; outbox archives after dispatch.
- **CR5 — `outbox_events.status` is a status column, NOT a Doc-2 §5 state machine** (Doc-4B Structure Patch F-03). Enumerated `pending|dispatched|archived` + CHECK (Doc-6A §5.4); the transactional write+emit rule (Doc-6A §7.1) is load-bearing; dispatch/retry/archival bounded by `core.outbox_dispatch_*`/`core.outbox_archive_*` POLICY keys.
- **CR6 — `id_sequences` = the human-reference generator (Doc-2 §0.1/§10.11).** Composite PK `(entity_type, year)`; columns `entity_type, year, next_value`; row-locked, gap-tolerant, never-reused allocation (Doc-6A §5.6); produces `human_ref` `TYPE-YEAR-XXXXX` (Doc-6A §3.2). UUIDv7 machine-ID service (Doc-4B §8) is separate.
- **CR7 — `system_configuration` = POLICY store; seed the registered `core.*` keys (Doc-3 v1.0).** Columns `key, value_jsonb, value_type, updated_by`; seeds the **18 registered `core.*` keys** by pointer, none coined, no value invented (Doc-6A §9); changes audited; read via M0 config service (Doc-4B §18); reference form `core.system_configuration.core.<key>` (Doc-4A §18.2).
- **CR8 — `feature_flags` = rollout control with a firewall (Doc-4B §B9).** Columns `flag_key, enabled, scope_jsonb`; flag eval gates feature visibility/rollout **ONLY** — never trust/verification/eligibility/routing fairness/matching confidence; evaluation is code (M0 service).
- **CR9 — `core` is consumed, not coupled (DR-6-CORE).** Doc-6B realizes the 5 tables; the cross-cutting obligations other modules declare against M0 (audit-write Doc-4B §17, transactional-outbox-write §16.2, UUIDv7+human-ref §8, POLICY §18, flag eval) are Doc-4B contracts realized as code, referenced by pointer. Other Doc-6x reference `core.*` by bare UUID; never re-author (One Module, One Owner).
- **CR10 — Audit partitioning (a §2.5 realization choice).** `audit_records` partitioned by month (time-ordered UUIDv7 PK — Doc-2 §10.1 note). Partition strategy + naming = Doc-6 realization choices (Doc-6A §2.5); the immutability/append-only behavior is the Doc-2 binding.

## The `core` schema partition (the structural spine)

| Doc-2 §10.1 table | PK | Columns (verbatim, Doc-2) | SD | Tenancy | Lifecycle | Doc-6B § |
|---|---|---|---|---|---|---|
| `core.audit_records` | `audit_id` (UUIDv7, time-ordered) | `audit_id, actor_id, actor_type[User\|Admin\|System\|AI Agent], organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent` (§9) | NO (append-only; archive flag) | platform-owned | append-only, never deleted | **§3.1** |
| `core.outbox_events` | `id` (UUIDv7) | `event_name, event_version, payload_jsonb, status, dispatched_at, attempts` (+ std cols) | NO (archived after dispatch) | platform-owned | `pending→dispatched→archived` (status col, not §5 machine) | **§3.2** |
| `core.id_sequences` | `(entity_type, year)` composite | `entity_type, year, next_value` | NO | platform-owned | simple | **§3.3** |
| `core.system_configuration` | `id` (UUIDv7) | `key, value_jsonb, value_type, updated_by` | NO | platform-owned | simple (changes audited) | **§3.4** |
| `core.feature_flags` | `id` (UUIDv7) | `flag_key, enabled, scope_jsonb` | NO | platform-owned | simple | **§3.5** |

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4B → **Doc-6A → Doc-6B** → Code); realize-never-redecide; conform to Doc-6A + pass Appendix A; flag-and-halt; the two freeze obligations.
- **Dependencies:** `Doc-6A §0/§13`; `Doc-2 §10.1`. **Detail:** short, normative.

## §1 — Scope & the `core` Table Partition
- **Purpose:** what Doc-6B governs (5 `core` tables) and not (Doc-4B obligations referenced, not re-authored — CR9); the partition table; carried dependencies (DR-6-CORE consumed-by-all); the infra-only / no-aggregate / no-state-machine facts (Doc-2 §2).
- **Dependencies:** `Doc-2 §2/§3.1/§10.1`; `Doc-6A §1`. **Detail:** scope + partition.

## §2 — Schema, Tenancy & Immutability Posture *(mechanism only)*
- **Purpose:** the `core`-wide posture — physical schema = `core` (Doc-6A R3a); platform-owned, no org RLS anchor (CR2); append-only / not-soft-deletable (CR4); Doc-2-noted PK exceptions (CR3); RLS = platform-staff backstop (Doc-6A §4.5); the **N/A-band map** (tenancy org-anchor, materialized grantees, non-disclosure byte-equivalence, soft-delete, multi-currency).
- **Dependencies:** `Doc-2 §6/§9/§10.1`; `Doc-6A §3/§4/§6`. **Detail:** posture + N/A map.

## §3 — Per-Table Realization
### §3.1 — `core.audit_records`
- **Purpose:** the immutable audit stream — PK `audit_id` (UUIDv7, time-ordered); §9 columns verbatim (incl. `actor_type` Appendix B.3 enum, `organization_id` reference column); append-only (Doc-6A §6.4); redaction = new event (Doc-2 §9); no blobs (Doc-6A §12); monthly partitioning (CR10); read/correlation indexes bounded by `core.audit_query_*` keys; audit-write is a Doc-4B §17 obligation (CR9).
- **Dependencies:** `Doc-2 §9/§10.1`; `Doc-4B §17`; `Doc-6A §6.4/§8/§12`; `Doc-3 v1.0`. **Detail:** table + immutability + partition.

### §3.2 — `core.outbox_events`
- **Purpose:** the transactional outbox — PK `id`; columns + std columns (Doc-6A §7.2); `status` enum+CHECK (CR5); append-only; transactional write+emit (Doc-6A §7.1); `(status, created_at)` dispatcher index (Doc-6A §10); dispatch/retry/archival bounded by `core.outbox_*` keys; no event coined.
- **Dependencies:** `Doc-2 §8/§10.1`; `Doc-4B §16.2`; `Doc-6A §7/§10`; `Doc-3 v1.0`. **Detail:** outbox table + transactional contract.

### §3.3 — `core.id_sequences`
- **Purpose:** the human-reference generator — composite PK `(entity_type, year)` (CR3); columns `entity_type, year, next_value`; row-locked, gap-tolerant, never-reused (CR6; Doc-6A §5.6); produces `human_ref` (Doc-6A §3.2).
- **Dependencies:** `Doc-2 §0.1/§10.1/§10.11`; `Doc-4B §8`; `Doc-6A §3.2/§5.6`. **Detail:** sequence table + concurrency.

### §3.4 — `core.system_configuration`
- **Purpose:** the POLICY store — PK `id`; columns `key, value_jsonb, value_type, updated_by`; seed the 18 `core.*` keys (Doc-3 v1.0 — CR7) by pointer; changes audited; read via M0 config service (Doc-4B §18); idempotent forward-only seed (Doc-6A §9.5/§11.3).
- **Dependencies:** `Doc-2 §10.1`; `Doc-3 §12` + v1.0; `Doc-4B §18`; `Doc-6A §9/§11.3`. **Detail:** config table + seed.

### §3.5 — `core.feature_flags`
- **Purpose:** rollout control — PK `id`; columns `flag_key, enabled, scope_jsonb`; the flag firewall (CR8 — visibility/rollout only; Doc-4B §B9); evaluation is code; flag changes audited + bounded by `core.flag_change_*` keys.
- **Dependencies:** `Doc-2 §10.1`; `Doc-4B §B9`; `Doc-3 v1.0`. **Detail:** flag table + firewall.

## §4 — Cross-Cutting `core` Realization *(mechanism only)*
- **Purpose:** rules spanning the 5 tables — append-only trigger pattern (Doc-6A §6.4; the shared `core.raise_immutable_violation()` function Doc-6A §6.3 realized here); M0-owned standard columns; the consumed-by-all obligations (CR9 = Doc-4B code, referenced); the orphan-scan integrity job home (Doc-6A §5.5); no cross-schema FK; no out-of-DB artifact as a table (Doc-6A §12).
- **Dependencies:** `Doc-6A §5.5/§6.3/§6.4`; `Doc-4B §16/§17/§18`. **Detail:** cross-table rules.

## §5 — POLICY Seed & Migration
- **Purpose:** forward-only seed of the 18 `core.*` keys (CR7); the `core` structural migration (5 tables + shared immutability function + audit partitioning) — forward-only, non-destructive (Doc-6A §11); codegen → gitignored registry (Doc-6A §11.4); no role seed here (roles = Doc-6C); none invented.
- **Dependencies:** `Doc-6A §11`; `Doc-3 v1.0`. **Detail:** migration + seed plan.

## §6 — Conformance & Carried Items
- **Purpose:** the attestation map against Doc-6A Appendix A (apply / N/A-with-reason); the carried register; Doc-6B coins nothing; `[ESC-6-POLICY]` (core) already cleared (Doc-3 v1.0).
- **Dependencies:** `Doc-6A Appendix A`; `Doc-2 §10.1`. **Detail:** attestation map + register.

## Appendix A — Doc-6B Conformance Attestation (Doc-6A `CHK-6-xxx`)
- **Purpose:** per-check PASS / N/A-with-reason. Expected: A PASS (CR3 PK exceptions) · B PASS · **C N/A** (platform-owned) · D PASS (append-only) · E PASS (outbox+audit core realization) · **F N/A** (no money) · G PASS (18 keys) · H PASS (Doc-5B reads) · I PASS · J PASS.
- **Dependencies:** `Doc-6A Appendix A`; `Doc-5B`. **Detail:** attestation table (content pass).

---

## Open Carried Items

| ID | Item | Doc-6B handling | Freeze gate? |
|---|---|---|---|
| **DR-6-CORE** | `core` owns audit/outbox/id/config/flags; consumed by all | **Realized here** (the owner) | No (resolved) |
| **DR-6-API** | Doc-5B persistable | Band H cross-check; no gap expected | No |
| `[ESC-6-POLICY]` (core) | `core.*` keys | **Already cleared** — Doc-3 v1.0 (18 keys) | No |
| `[ESC-6-SCHEMA]` | Any `core` need with no Doc-2 §10.1 source | None expected; additive Doc-2 patch if any | Possible (none expected) |

## Fences / Out of scope

Authoring any non-`core` table · the Doc-4B contracts/obligations themselves (code) · coining any table/column/state/event/audit-action/POLICY-key · changing any Doc-2 declaration · an org RLS anchor on platform-owned `core` (CR2) · soft-deleting an append-only stream (CR4) · a feature flag gating trust/verification/eligibility/routing/matching (CR8) · any cross-schema FK · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6B Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 0 findings); certified by `Doc-6B_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6B realizes the 5 `core` tables verbatim from Doc-2 §10.1 against the frozen Doc-6A conventions; platform-owned, append-only, infra-only; the DR-6-CORE foundation. Next: content passes (per-table DDL/Prisma + POLICY seed) → Content Freeze Audit → `Doc-6B_SERIES_FROZEN`.*
