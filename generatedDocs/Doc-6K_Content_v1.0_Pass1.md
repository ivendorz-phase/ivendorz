# Doc-6K — M9 AI (`ai`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 AI-cache tables)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 1 MINOR dispositioned; §Review Disposition). Realizes §0–§2 + §3.1 (all 4 tables). Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the **4 AI-cache tables** (`recommendations` · `predictions` · `classification_results` · `similar_vendor_results`) — the **sole `ai.*` TTL hard-delete exception** + requesting-org RLS + AI-suggests/modules-decide |
| Authority | `Doc-2 §6/§10.10` (the *what*); `Doc-6A §6.5` (the R7 exception); `Doc-4K`/`Doc-5K` (advisory-only); `Doc-3 v1.8` (`ai.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.10; **no soft-delete** (hard-delete cache); **no human_ref**; physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("ai")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6K realizes Doc-2 §10.10 against frozen Doc-6A; passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.8 — 6 `ai.*` keys). Carried: `[ESC-AI-AUDIT]` (Pass-2). Coins nothing.

## §1 — Scope & the `ai` Table Partition (Pass-1 slice)
Pass-1 realizes the **4 AI-cache tables** (§3.1) + the **tenancy/TTL-hard-delete RLS model** (§2). **Deferred:** §4–§8 + Appendix A → Pass-2. **AI suggests; modules decide (Invariant #12):** M9 owns **no authoritative data** — only regenerable derived artifacts; **never source of truth**; consumed advisory via service.

## §2 — Tenancy, TTL-Hard-Delete & RLS Model *(the load-bearing section — the R7 exception)*
**Requesting-org scoped:** `requesting_organization_id = active_org` (the org that requested the result reads it) + admin/System. **Reads honor the requesting org's access** — the result was **generated over data the org could see** (a generation-time guarantee enforced by the AI worker; the RLS anchors on `requesting_organization_id`). **The sole `ai.*` TTL hard-delete exception (Doc-6A R7/§6.5):** these are **caches** with `expires_at`; **hard-DELETE is permitted** (TTL eviction + regeneration) — the **only** module where hard-delete is allowed; **no soft-delete tuple, no immutability trigger** (regenerable, not retained). **Never source of truth** (Invariant #12). RLS = backstop; authz app-layer (Doc-4K). Tests = Doc-8.

---

## §3.1 — The 4 AI-cache tables (identical shape)
Realizes Doc-2 §10.10. All four structurally identical: polymorphic subject + `requesting_organization_id` + `result_jsonb`/`model_version`/`generated_at`/`expires_at`. **Hard-delete cache (no SD); regenerable; never source of truth.**

```sql
-- representative: ai.recommendations (predictions / classification_results / similar_vendor_results are structurally identical)
CREATE TABLE ai.recommendations (
  id uuid NOT NULL,                                           -- [Doc-6A §3.1] PK UUIDv7
  subject_id uuid,                                           -- [Doc-2 §10.10] polymorphic bare UUID (vendor_profile/org/rfq etc. → various modules)
  subject_type text,                                         -- [Doc-2 §10.10] discriminator ([§2.5] text)
  requesting_organization_id uuid NOT NULL,                  -- [Doc-2 §10.10] bare UUID → M1 — the RLS anchor (reads honor this org's access)
  result_jsonb jsonb NOT NULL,                               -- [Doc-2 §10.10] the derived suggestion (advisory; never source of truth)
  model_version text NOT NULL,                               -- [Doc-2 §10.10]
  generated_at timestamptz NOT NULL DEFAULT now(),           -- [Doc-2 §10.10]
  expires_at timestamptz NOT NULL,                           -- [Doc-2 §10.10] TTL — drives the hard-delete sweep (ai.recommendation.ttl_seconds)
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §0.2] System actor (AI worker)
  CONSTRAINT recommendations_pkey PRIMARY KEY (id)
  -- NO soft-delete tuple — hard-delete cache (Doc-6A R7 §6.5; CHK-6-033). NO immutability trigger — regenerable.
);
CREATE INDEX recommendations_subject_idx ON ai.recommendations (requesting_organization_id, subject_type, subject_id);  -- [§2.5] lookup
CREATE INDEX recommendations_expiry_idx ON ai.recommendations (expires_at);  -- [§2.5] TTL hard-delete sweep
-- ai.predictions / ai.classification_results / ai.similar_vendor_results: identical table + 2 indexes (s/recommendations/<table>/);
--   TTL key per BC: ai.recommendation / ai.prediction / ai.classification / ai.similar_vendors .ttl_seconds (Doc-3 v1.8).
```
- **The R7 hard-delete exception (AI-CR3):** `ai.*` is the **only** schema permitting a hard-DELETE — a System TTL sweep deletes rows where `expires_at < now()` (bounded by `ai.<bc>.ttl_seconds`, Doc-3 v1.8); regeneration re-INSERTs. **No SD tuple** (the cache is not retained), **no immutability trigger** (the snapshot is regenerable). **Never source of truth (Invariant #12):** a business module consumes `result_jsonb` **advisory via service** and decides; it never reads `ai.*` as authority. **System-written** (AI worker; `created_by` = System actor).
- **RLS:** requesting-org + admin/System (§3.x). **Prisma [§2.5]:** `Recommendation`/`Prediction`/`ClassificationResult`/`SimilarVendorResult` (no `deletedAt`; no immutability).

## §3.x — Consolidated RLS DDL (Pass-1 — requesting-org scoped)
```sql
-- all 4 tables: requesting-org read + admin/System (pattern, s/<table>/)
ALTER TABLE ai.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY recommendations_requesting_org ON ai.recommendations FOR ALL
  USING (requesting_organization_id = current_setting('app.active_org', true)::uuid
         OR current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (requesting_organization_id = current_setting('app.active_org', true)::uuid
              OR current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- predictions / classification_results / similar_vendor_results: identical requesting-org policy.
-- (the AI worker generates + the TTL sweep deletes via the System/owner-role path; hard-DELETE is permitted here alone.)
```

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent. Verified CORRECT: the 4-table set + columns (Doc-2 §10.10), the hard-delete-cache shape, requesting-org scope, no human_ref, no §8 event, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **SD-COIN** adding a soft-delete tuple to a cache table would contradict the R7 hard-delete exception | BLOCKER (Doc-6A R7) | **FIXED** — §3.1: **no SD tuple**; hard-delete cache (the enumerated R7 exception; CHK-6-033); no `deleted_at`. |
| **IMM-WRONG** adding an immutability trigger would block regeneration | MAJOR | **FIXED** — §3.1: **no immutability trigger** (regenerable; hard-DELETE + re-INSERT is the lifecycle). |
| **SRC-TRUTH** `ai.*` read as authority would violate Invariant #12 | MAJOR | **FIXED** — §2/§3.1: never source of truth; consumed advisory via service; modules decide. |
| **SUBJ-TEXT** `subject_type` enum values | MINOR | **CONFIRMED text** — polymorphic discriminator (no enumerated set in Doc-2); `text`; no coined enum. |

**Net:** 1 BLOCKER (no soft-delete on a cache) + 2 MAJOR (no immutability, never-source-of-truth) fixed; 1 MINOR confirmed. The R7-exception (no SD, no immutability) + never-source-of-truth are load-bearing. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6K Content Pass-1 (§0–§2 · §3.1 the 4 AI-cache tables) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the 4 identical AI-cache tables (subject + requesting-org + result_jsonb/model_version/generated_at/expires_at; requesting-org RLS), the **sole `ai.*` TTL hard-delete exception** (no SD tuple, no immutability trigger — the enumerated R7 exception, CHK-6-033; TTL sweep bounded by `ai.<bc>.ttl_seconds`), and the AI-suggests/modules-decide posture (never source of truth; advisory via service). Columns verbatim Doc-2 §10.10; coins nothing. Next: Pass-2 (§4 lifecycle · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
