# Doc-6K — M9 AI (`ai`) Schema Realization — Content v1.0 **Pass-2** (§4 Lifecycle · §5 Firewalls · §6 Indexing · §7 Migration · §8 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 (FINAL) — Independent Hard Review applied** (0 BLOCKER + 1 MAJOR + 2 MINOR dispositioned; §Review Disposition). Completes §4–§8 + Appendix A (37/37). Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | the **§4 lifecycle** (generate→serve→expire→regenerate; no state machine/§8 event); the **§5 firewalls** (AI-suggests/modules-decide); §6 indexing; §7 migration; §8 + Appendix A. *(All 4 tables realized in Pass-1.)* |
| Authority | `Doc-2 §10.10` (the *what*); `Doc-6A §6.5` (Appendix A + R7 exception); `Doc-4K`/`Doc-5K`; `Doc-3 v1.8`; `Doc-5K` (Doc-5 cross-check) |
| Coins | **Nothing.** Carried: `[ESC-AI-AUDIT]` |
| DDL note | PostgreSQL 15+; Prisma `@@schema("ai")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §4 — State / Lifecycle Realization
**No state machine, no §8 event** (advisory-only — Doc-5K: M9 emits no §8 event, owns no score). The cache lifecycle:
**generate** (System AI worker writes the row + `model_version`/`generated_at`/`expires_at`) → **serve** (advisory, via the M9 read service — `resolve`/`recommend` etc., Doc-5K out-of-wire) → **expire** (System TTL sweep **hard-DELETEs** rows where `expires_at < now()`, bounded by `ai.<bc>.ttl_seconds`, Doc-3 v1.8) → **regenerate** (re-INSERT/UPSERT). No transition writes a `core.outbox_events` row (M9 emits no event); the AI worker is idempotent on `(requesting_organization_id, subject_type, subject_id, model_version)` (dedup via `ai.idempotency_dedup_window`). **Deps:** `Doc-2 §10.10`; `Doc-5K`; `Doc-6A §6.5/§9`.

## §5 — Cross-Module Reads & Firewalls (DD-ALL)
Bare-UUID + service. **AI suggests; modules decide (Invariant #12):** M9 **reads subjects from many modules by UUID** (vendor/org/rfq etc.) to generate the cache; **suggests advisory via service; never decides/owns/writes** any module's authoritative record. **No §8 event; no score** (the governance signals are M5's — firewall). The result is **never read as authority** — a business module consumes `result_jsonb` advisory and decides. No cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§10.10`; `Doc-4K`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for the Doc-5K read surface; `(requesting_organization_id, subject_type, subject_id)` lookup; `(expires_at)` for the TTL hard-delete sweep; page-size via `ai.list_page_size_max`. **No partial-`deleted_at`** (no SD — hard-delete cache). **Deps:** `Doc-5K`; `Doc-6A §10/§12`; `Doc-3 v1.8`.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.8 (CLEARED):** 6 `ai.*` keys in `core.system_configuration` (`list_page_size_max`, `idempotency_dedup_window`, + 4 per-BC `ttl_seconds`); M9 reads, coins none.
**Forward-only order:** (assume core…admin migrated) `CREATE SCHEMA ai` → recommendations → predictions → classification_results → similar_vendor_results → indexes → RLS → seeds (none). **No immutability triggers** (cache). Forward-only, idempotent.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to Doc-2 §10.10 or a §2.5 attribution. Carried: **`[ESC-AI-AUDIT]`** (AI-result audit actions vs Doc-2 §9 — bind nearest by pointer) · DD-ALL · AI-suggests/modules-decide + the R7 hard-delete exception (realized). `[ESC-6-POLICY]` **CLEARED**.

## Appendix A — Doc-6K Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | 001 | PASS | every table `id uuid` PK (UUIDv7) |
| | 002 | **N/A** | **no `human_ref`** — Doc-2 §10.10 declares none |
| | 003 | PASS | `generated_at`/`created_at` present (no `updated_at` — regenerated, not mutated) |
| | 004 | **N/A** | **no soft-delete** — hard-delete cache (the R7 exception) |
| | 005 | **N/A** | no soft-deletable unique (no SD); idempotency dedup is a worker concern |
| **B** | 010 | PASS | physical `ai` namespace; one Prisma `@@schema("ai")` |
| | 011 | PASS | **no cross-schema FK** — subject/entity/requesting-org all bare UUID |
| | 012 | PASS | refs entity-named, service-validated, orphan-scan |
| | 013 | PASS | no cross-schema JOIN/traversal |
| **C** | 020 | PASS | RLS on every table; requesting-org anchor server-set, fail-closed; no public surface |
| | 021 | PASS | polymorphic subject by discriminator; requesting-org anchor |
| | 022 | PASS | non-disclosure N/A-by-shape; reads honor requesting org's access; no leak |
| | 023 | PASS | authz app-layer (Doc-4K); RLS = backstop |
| **D** | 030 | **N/A-by-shape** | no authoritative/soft-deletable row (cache) |
| | 031 | **N/A-by-shape** | no versioned table (regenerable snapshot) |
| | 032 | **N/A-by-shape** | no history/score row (M9 owns no score) |
| | 033 | **PASS — THE EXCEPTION** | **the sole `ai.*` TTL hard-delete** (Doc-5K R7 / `ai.<bc>.ttl_seconds`); enumerated, no other schema — the only **active PASS** for this check across the whole Doc-6 program |
| **E** | 040 | **N/A** | no state-transition emitter (no §8 event) |
| | 041 | **N/A** | **no event coined / emitted** — advisory-only (Doc-5K) |
| | 042 | PASS | any AI-result audit via `core.audit_records` (`[ESC-AI-AUDIT]` for the action set) |
| | 043 | **PASS-with-carry** | `[ESC-AI-AUDIT]` (bind nearest §9 by pointer) |
| **F** | 050 | **N/A** | no monetary column in `ai` |
| **G** | 060 | PASS | reads `core.system_configuration`; 6 `ai.*` keys (Doc-3 v1.8) |
| | 061 | PASS | page-size + TTL windows from POLICY, never literals |
| | 062 | **N/A** | no role seed in M9 |
| **H** | 070 | PASS | the Doc-5K read surface is persistable (the 4 caches) |
| | 071 | PASS | composite sort-key + expiry indexes (§6) |
| | 072 | PASS | idempotency-dedup is a worker concern; `ai.idempotency_dedup_window` |
| | 073 | PASS | no non-persistable Doc-5K surface |
| **I** | 080 | PASS | nothing coined; every element traces to Doc-2 §10.10 |
| | 081 | PASS | physical specifics §2.5-attributed (text subject_type, expiry index, no-SD/no-immutability) |
| | 082 | PASS | `[ESC-AI-AUDIT]` via named channel |
| | 083 | PASS | no Doc-2 decision re-opened; never-source-of-truth held |
| **J** | 090 | PASS | extends B.1 base (minus SD — the cache exception) + B.2 types |
| | 091 | PASS | coins no shared enum; reuses B.3 (`actor_type`); no module enum |
| | 092 | PASS | B.4 naming followed |
| | 093 | PASS | B.5 conventions realized |

**37/37 — 0 FAIL.** **CHK-6-033 = the active PASS (the enumerated `ai.*` hard-delete exception — the one check that is a PASS *only* in M9).** N/A (by the regenerable-cache shape): 002 (no human_ref), 004/005 (no SD), 030/031/032 (no authoritative/versioned/history), 040/041 (no §8 event), 050 (no money), 062 (no role seed) — each justified. PASS-with-carry: 043.

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: no state machine / no §8 event (advisory), the TTL-sweep lifecycle, the 37/37 Appendix A (CHK-6-033 the active PASS + the justified N/A set), never-source-of-truth, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **033-ACTIVE** CHK-6-033 must be the **active PASS** here (not N/A) — the enumerated exception | MAJOR | **CONFIRMED** — §8/App A: CHK-6-033 PASS (the sole hard-delete), realized + bounded by `ai.<bc>.ttl_seconds`; the one check that is a PASS only in M9. |
| **NA-JUSTIFIED** the large N/A set | MINOR | **CONFIRMED** — each N/A traces to the regenerable-cache shape (no SD/human_ref/§8/money/versioned/history); not gaps. |
| **AI-AUDIT** AI-result audit | MINOR | **CONFIRMED carried** — `[ESC-AI-AUDIT]`; CHK-6-043 PASS-with-carry. |

**Net:** 0 BLOCKER; 1 MAJOR (CHK-6-033 active-PASS confirmation) + 2 MINOR confirmed. 37/37 Appendix A; the R7 exception is the headline; never-source-of-truth intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6K Content Pass-2 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `ai` realization: the §4 cache lifecycle (generate→serve→expire→regenerate; no state machine / no §8 event), the §5 firewalls (AI-suggests/modules-decide; never source of truth; no event/score), §6 indexing, §7 forward-only migration (no immutability triggers — cache), and §8 + Appendix A (37/37, 0 FAIL — **CHK-6-033 = the active hard-delete-exception PASS**; the rest N/A-by-shape, justified). Coins nothing; carried `[ESC-AI-AUDIT]`. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6K_SERIES_FROZEN` → **Doc-6 Database program COMPLETE.***
