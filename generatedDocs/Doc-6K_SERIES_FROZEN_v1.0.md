# Doc-6K — M9 AI Layer (`ai`) Schema Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6K Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | **M9 — AI Layer (reserved)** (`ai` schema) — **"AI suggests; modules decide"** (Invariant #12); regenerable derived artifacts only; **owns no authoritative data; never source of truth**. The **sole `ai.*` TTL hard-delete exception** (Doc-6A R7). **The FINAL Doc-6 module** |
| Realizes | **Doc-2 §10.10** — **4 tables** (one grouping) as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A 37/37 + §6.5 the R7 exception); **Doc-2 v1.0.3 = binding *what*-authority**; consistent-with Doc-5K (advisory-only); consumes Doc-6B (`core`) + Doc-6C…6J (UUID) |
| Freeze evidence | `Doc-6K_Content_Freeze_Audit_v1.0.md` — PASS; 0 open BLOCKER/MAJOR/MINOR; 7 phases PASS. Cross-pass `Doc-6K_Content_Hard_Review_v1.0.md` — 0 BLOCKER/MAJOR; R7 exception + never-source-of-truth verified |

---

## Effective set (the authoritative Doc-6K)

| Artifact | Role |
|---|---|
| `Doc-6K_Structure_v1.0_FROZEN.md` | Frozen structure — AI-CR1–CR8, 4-table partition, TTL-hard-delete + AI-suggests model, requesting-org RLS, Appendix-A map |
| `Doc-6K_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6K_Content_v1.0_Pass1.md` | §0–§2 TTL-hard-delete model · the 4 AI-cache tables (no SD, no immutability; requesting-org RLS) |
| `Doc-6K_Content_v1.0_Pass2.md` | §4 lifecycle (generate→serve→expire→regenerate) · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A (37/37; CHK-6-033 the active PASS) |
| `Doc-6K_Content_Hard_Review_v1.0.md` | Cross-pass review — 0 BLOCKER/MAJOR; R7 exception + never-source-of-truth verified; 1 OBSERVATION by-design |
| `Doc-6K_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

---

## What Doc-6K realizes (the `ai` schema)

- **4 tables, one grouping** (Doc-2 §10.10), columns verbatim: `recommendations`/`predictions`/`classification_results`/`similar_vendor_results` — identical (subject + `requesting_organization_id` + `result_jsonb`/`model_version`/`generated_at`/`expires_at`).
- **AI suggests; modules decide (Invariant #12)** — M9 owns **no authoritative data**; **never source of truth**; emits **no §8 event**, owns **no score**; `result_jsonb` consumed **advisory via service** — never read as authority.
- **The sole `ai.*` TTL hard-delete exception (Doc-6A R7/§6.5; CHK-6-033)** — caches with `expires_at`; **hard-DELETE permitted** (System TTL sweep + regeneration); **no soft-delete tuple, no immutability trigger** — the only schema in the program that hard-deletes; **CHK-6-033 is the one active PASS** (every other module N/A's it).
- **Requesting-org scoped RLS** — `requesting_organization_id = active_org` (+ admin/System); reads honor the requesting org's access; no public surface; System-written (AI worker; idempotent on `(requesting_org, subject_type, subject_id, model_version)`).
- **No `human_ref`, no money, no state machine, no versioned/history rows** (all N/A-by-shape); cross-module = bare UUID; coins nothing. TTL bounded by `ai.<bc>.ttl_seconds` (Doc-3 v1.8, 6 `ai.*` keys).

## Carried items

`DR-6-CORE` (consumed) · `DR-6-API` (Doc-5K Band H) · DD-ALL (reads subjects by UUID) · **AI-suggests/modules-decide** (realized — never source of truth) · **The sole `ai.*` TTL hard-delete exception** (realized — CHK-6-033 the active PASS) · **`[ESC-AI-AUDIT]`** (AI-result audit vs Doc-2 §9 — bind nearest by pointer) · `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.8). Carry-forward to **Doc-8**: RLS positive/negative/cross-tenant + the TTL-hard-delete + never-source-of-truth tests (Doc-6A §11.5) — schema satisfiable.

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 MAJOR — the R7 exception explicit) → v0.2 → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1/2 each per-pass-reviewed (no-SD-on-cache, no-immutability, never-source-of-truth, CHK-6-033 active-PASS) · **cross-pass Content Hard Review** (0 BLOCKER/MAJOR — R7 exception + never-source-of-truth verified; 1 OBSERVATION by-design) · Content Freeze Audit (PASS).

---

*Doc-6K (M9 `ai` schema) is FROZEN. Realizes Doc-2 §10.10's 4 cache tables on PostgreSQL/Supabase + Prisma `multiSchema` against frozen Doc-6A — AI suggests, modules decide (owns no authoritative data; never source of truth); the sole `ai.*` TTL hard-delete exception (CHK-6-033 the active PASS; no SD, no immutability); coins nothing. Carried: AI-suggests/modules-decide + the R7 exception (realized) + `[ESC-AI-AUDIT]`. On any conflict with Doc-2/Doc-6A or the frozen corpus, the frozen corpus wins; flag-and-halt. **The FINAL Doc-6 module — its freeze completes the Doc-6 Database Realization program (Doc-6A + Doc-6B…6K, M0–M9, all FROZEN).***
