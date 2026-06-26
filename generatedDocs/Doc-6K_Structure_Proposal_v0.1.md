# Doc-6K — M9 AI Layer (`ai`) Schema Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1 → effective v0.2** — Independent Hard Review applied (1 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). For Structure Freeze Audit → FROZEN |
| Module | **M9 — AI Layer (reserved)** (`ai` schema). **"AI suggests; modules decide"** (Invariant #12) — regenerable derived artifacts only; **owns no authoritative data; never source of truth**. The **sole `ai.*` TTL hard-delete exception** (Doc-6A R7). The **FINAL** Doc-6 module |
| Realizes | **Doc-2 §10.10** — **4 tables** (one grouping) as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4K (M9 contracts, consumed); Doc-3 v1.0.2 **+ v1.8 (`ai.*` POLICY — registered, 6 keys incl. 4 per-BC `ttl_seconds`)**; Doc-5K (advisory-only; no score/§8 event); Doc-6B (`core`); Doc-6C…6J (UUID); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.8), Doc-4A v1.0, Doc-4K v1.0 (FROZEN), Doc-4L/4M, Doc-6A…6J v1.0 (FROZEN) |
| Contains | Structure only — section map, 4-table partition, ratified decisions (AI-CR1–CR8), the TTL-hard-delete + AI-suggests model, requesting-org RLS, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **AI suggests; modules decide (Invariant #12):** M9 owns **no authoritative data** — only **regenerable derived artifacts**; **never source of truth**. **The sole `ai.*` TTL hard-delete exception (Doc-6A R7 / CHK-6-033):** these are **caches** (`expires_at`); **hard-DELETE is permitted** (TTL eviction + regeneration) — the **only** module where hard-delete is allowed; **no soft-delete**. Advisory-only: **no §8 event, no score** (Doc-5K). Reads honor the requesting org's access. RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.10 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions proposed at structure freeze (AI-CR-set)

- **AI-CR1 — 4 tables, one grouping (Doc-2 §10.10), coin nothing.** `recommendations` · `predictions` · `classification_results` · `similar_vendor_results` — **structurally identical**: `subject_id`/`requesting_organization_id` + entity refs; `result_jsonb`/`model_version`/`generated_at`/`expires_at`. A 5th is non-conformant.
- **AI-CR2 — AI suggests; modules decide (Invariant #12).** M9 owns **no authoritative data** — only **regenerable derived artifacts**; **never source of truth**. A business module **consumes the suggestion advisory via service**, then decides; it never reads `ai.*` as authority. M9 holds no business state.
- **AI-CR3 — The sole `ai.*` TTL hard-delete exception (Doc-6A R7; CHK-6-033).** The 4 tables are **caches** with `expires_at`; **hard-DELETE is permitted** (TTL eviction + regeneration). This is the **enumerated R7 exception** — the **only** module where a hard-delete is allowed. **No soft-delete tuple** (regenerable, not retained); a TTL sweep (System) deletes expired rows; the `ai.<bc>.ttl_seconds` POLICY keys (Doc-3 v1.8) drive eviction per bounded context.
- **AI-CR4 — Requesting-org scoped RLS.** `requesting_organization_id = active_org` (the org that requested the result reads it) + admin/System. **Reads honor the requesting org's access** — the result was **generated over data the org could see** (a generation-time guarantee); the RLS anchors on `requesting_organization_id`. No public surface.
- **AI-CR5 — Advisory-only: no §8 event, no score, no state machine, no `human_ref`, no money (Doc-5K).** M9 emits **no §8 event** and owns **no score** (the governance signals are M5's); the tables are flat cache rows (no lifecycle state machine). **System-written** (AI workers generate); regenerable.
- **AI-CR6 — Polymorphic subject/entity refs (bare UUID, no FK).** `subject_id` + entity refs (vendor_profile/org/rfq etc.) bare UUID → various modules; `requesting_organization_id` → M1; no FK; service-validated.
- **AI-CR7 — POLICY: registered (Doc-3 v1.8); `[ESC-6-POLICY]` CLEARED.** 6 `ai.*` keys (`list_page_size_max`, `idempotency_dedup_window`, + 4 per-BC `ttl_seconds`: `recommendation`/`prediction`/`classification`/`similar_vendors`) — read from `core.system_configuration`, never literals.
- **AI-CR8 — Regenerable projection (not immutable, not soft-deleted).** `result_jsonb`/`model_version`/`generated_at` = a snapshot; regeneration = hard-DELETE + re-INSERT (or UPSERT). **Not immutable** (no immutability trigger), **not soft-deleted** (no SD tuple) — the R7 cache exception. Carried: DD-ALL (reads subjects from many modules by UUID), **`[ESC-AI-AUDIT]`** (AI-result audit vs Doc-2 §9 — confirm at content).

## The `ai` schema partition (the structural spine)

| Doc-2 §10.10 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `recommendations` | AI cache | `requesting_organization_id` | **hard-delete (TTL cache)** | — | §3.1 |
| `predictions` | ↳ | `requesting_organization_id` | **hard-delete (TTL cache)** | — | §3.1 |
| `classification_results` | ↳ | `requesting_organization_id` | **hard-delete (TTL cache)** | — | §3.1 |
| `similar_vendor_results` | ↳ | `requesting_organization_id` | **hard-delete (TTL cache)** | — | §3.1 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4K → Doc-6A → Doc-6B…6J → **Doc-6K** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-ALL, `[ESC-AI-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.8). **Deps:** `Doc-6A §0/§6.5/§13`; `Doc-2 §10.10`; `Doc-4K`; `Doc-5K`.

## §1 — Scope & the `ai` Table Partition
Governs 4 cache tables / not (the authoritative records of every other module — M9 reads subjects by UUID, suggests advisory, never decides/owns). AI-suggests/modules-decide; the TTL hard-delete exception. **Deps:** `Doc-2 §2/§10.10`; `Doc-4K`; `Doc-6A §1/§6.5`.

## §2 — Tenancy, TTL-Hard-Delete & RLS Model *(load-bearing — the R7 exception)*
**Requesting-org scoped** (`requesting_organization_id = active_org` + admin/System); reads honor the requesting org's access (generation-time). **The sole `ai.*` TTL hard-delete exception (Doc-6A R7 / §6.5):** caches with `expires_at`; hard-DELETE permitted (TTL sweep + regeneration); **no soft-delete**; **never source of truth** (Invariant #12). RLS = backstop; authz app-layer (Doc-4K). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.10`; `Doc-6A §4/§6.5`; `Doc-4K`.

## §3 — Per-Aggregate Realization
§3.1 the 4 cache tables (identical shape: subject + requesting-org + `result_jsonb`/`model_version`/`generated_at`/`expires_at`; requesting-org RLS; hard-delete TTL; regenerable; never source of truth). **Deps:** `Doc-2 §10.10`; `Doc-4K`; `Doc-5K`; `Doc-6A §3/§6.5`.

## §4 — State / Lifecycle Realization
**No state machine, no §8 event** (advisory-only — Doc-5K). Lifecycle = generate (System) → serve (advisory, via service) → **expire (TTL hard-DELETE)** → regenerate. The TTL sweep is a System job bounded by `ai.<bc>.ttl_seconds` (Doc-3 v1.8). **Deps:** `Doc-2 §10.10`; `Doc-5K`; `Doc-6A §6.5/§9`.

## §5 — Cross-Module Reads & Firewalls (DD-ALL)
Bare-UUID + service: M9 **reads subjects from many modules by UUID** (vendor/org/rfq etc.) to generate suggestions; **suggests advisory via service; never decides/owns** (Invariant #12). No §8 event; no score; no authoritative write to any module. No cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§10.10`; `Doc-4K`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5K lists; `(requesting_organization_id, subject_id)` lookup; `(expires_at)` for the TTL sweep; page-size via `ai.*` POLICY. No partial-`deleted_at` (no SD — hard-delete cache). **Deps:** `Doc-5K`; `Doc-6A §10/§12`; `Doc-3 v1.8`.

## §7 — POLICY & Migration
Forward-only migration (schema → recommendations → predictions → classification_results → similar_vendor_results → indexes → RLS; **no immutability triggers** — cache); POLICY = Doc-3 v1.8 (CLEARED, 6 keys). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.8`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (**Band D CHK-6-033 = the sole hard-delete exception realized here**; Band C requesting-org RLS; CHK-6-002 N/A no human_ref; CHK-6-041 N/A no §8 event); carried register (DD-ALL, `[ESC-AI-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-5K`.

## Appendix A — Doc-6K Conformance Attestation map (Doc-6A `CHK-6-001…093`)
Highlights: **CHK-6-033 PASS — the enumerated `ai.*` TTL hard-delete exception** (the only PASS-not-N/A across all modules; hard-delete realized + bounded by Doc-5K R7 / `ai.<bc>.ttl_seconds`) · Band C PASS (requesting-org RLS; never source of truth) · **CHK-6-004 N/A** (no soft-delete — cache) · **CHK-6-002 N/A** (no human_ref) · **CHK-6-041 N/A** (no §8 event — advisory) · **CHK-6-050 N/A** (no money) · CHK-6-030/031/032 **N/A-by-shape** (no authoritative/versioned/history rows — regenerable cache). **Deps:** `Doc-6A Appendix A / §6.5`; `Doc-5K`.

---

## Open Carried Items
| ID | Item | Doc-6K handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-API | core consumed / Doc-5K persistable | by pointer / Band H | No |
| DD-ALL | reads subjects from many modules by UUID | bare UUID + service; advisory; never decides | No |
| **AI suggests; modules decide (Invariant #12)** | M9 owns no authoritative data; never source of truth | regenerable cache; advisory via service | **Load-bearing** |
| **The sole `ai.*` TTL hard-delete exception (R7)** | hard-delete permitted; no SD | CHK-6-033 PASS (the only PASS-not-N/A); TTL sweep | **Load-bearing** |
| **`[ESC-AI-AUDIT]`** | AI-result audit vs Doc-2 §9 | bind nearest §9 by pointer | No (content: bind) |
| `[ESC-6-POLICY]` | `ai.*` keys | **CLEARED** — Doc-3 v1.8 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5K gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`ai` table · the authoritative records of every other module · M9 owning/deciding business state · coining any element · a cross-schema FK · cross-schema RLS traversal · **M9 as a source of truth** · a soft-delete column on a cache table · a §8 event / a score from M9 · DDL/Prisma/migration bodies (content passes).

---

## Review Disposition (Independent Hard Review — Structure)

Reviewer: independent. Field-traced to Doc-2 §10.10 / Doc-6A §6.5 / Doc-5K. Verified CORRECT: 4-table set (identical shape), `result_jsonb`/`model_version`/`generated_at`/`expires_at` columns, hard-delete-allowed (cache), regenerable/never-source-of-truth, requesting-org scope, the 6 `ai.*` keys (Doc-3 v1.8), no human_ref/no §8 event/no money, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **R7-EXCEPTION** the TTL-hard-delete-as-the-sole-R7-exception not made explicit (risk of treating ai.* like every other no-hard-delete module) | MAJOR | **FIXED** — AI-CR3/§2/§8: `ai.*` is **the enumerated R7 hard-delete exception** (CHK-6-033 PASS, the only PASS-not-N/A); no soft-delete; TTL sweep + regeneration. |
| **SOURCE-TRUTH** "never source of truth" / Invariant #12 stated weakly | MINOR | **FIXED** — AI-CR2/§5: M9 owns no authoritative data; suggests advisory via service; modules decide; never read as authority. |
| **NA-SHAPE** the many N/A checks (002/004/030/031/032/041/050) | MINOR | **CONFIRMED justified** — no human_ref / no soft-delete / no authoritative-immutable / no versioned / no history / no §8 event / no money — all by the regenerable-cache shape; CHK-6-033 is the active PASS. |
| **AI-AUDIT** AI-result audit vs §9 | NIT | **CONFIRMED carried** — `[ESC-AI-AUDIT]`. |

**Net:** 1 MAJOR (the R7 exception explicit) + 2 MINOR + 1 NIT fixed/confirmed. The R7-exception + never-source-of-truth findings are load-bearing — M9 is the unique hard-delete cache that decides nothing. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6K Structure Proposal v0.1 (effective v0.2 — Independent Hard Review applied). For Structure Freeze Audit → FROZEN. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6K realizes the 4 `ai` cache tables verbatim from Doc-2 §10.10 against frozen Doc-6A — AI suggests, modules decide (owns no authoritative data; never source of truth); the sole `ai.*` TTL hard-delete exception (CHK-6-033 PASS); coins nothing. **The FINAL Doc-6 module.** Next: Structure Freeze Audit.*
