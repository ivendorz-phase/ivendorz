# Doc-6K — M9 AI (`ai`) Schema Realization — **Content Hard Review v1.0** (cross-pass)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** — independent of the pass authors |
| Target | `Doc-6K_Content_v1.0_Pass1/2.md` (4 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the integration-seam gate (the R7 hard-delete exception end-to-end, never-source-of-truth, requesting-org RLS, the justified N/A set) |
| Basis | `Doc-2 v1.0.3 §10.10`; `Doc-6A §6.5` (the R7 exception); Doc-4K/Doc-5K (advisory-only); Doc-3 v1.8 |
| Verdict | **0 BLOCKER + 0 MAJOR; 1 OBSERVATION confirmed.** The R7 hard-delete exception + never-source-of-truth verified. **Ready for Content Freeze Audit.** |

---

## 1 — Coverage (4/4)
Pass-1: `recommendations` · `predictions` · `classification_results` · `similar_vendor_results` (4) · Pass-2: §4–§8 + Appendix A (0 tables). **Total 4 = Doc-2 §10.10 exactly.** No 5th; none missing. **PASS.**

## 2 — Headline verifications
- **The sole `ai.*` TTL hard-delete exception (Doc-6A R7/§6.5; CHK-6-033):** all 4 tables carry **no soft-delete tuple** and **no immutability trigger**; the System TTL sweep hard-DELETEs `WHERE expires_at < now()` (bounded by `ai.<bc>.ttl_seconds`); regeneration re-INSERTs. **Verified: M9 is the only schema in the whole Doc-6 program that hard-deletes — CHK-6-033 is the one active PASS for this check.** PASS.
- **AI suggests; modules decide (Invariant #12):** M9 owns no authoritative data, emits **no §8 event**, owns **no score**, writes **no module's authoritative record**; `result_jsonb` is consumed **advisory via service** — never read as authority. PASS.
- **Requesting-org RLS:** all 4 anchor on `requesting_organization_id = active_org` (+ admin/System); reads honor the requesting org's access; no public surface. PASS.

## 3 — Cross-pass integration checks (PASS)
| Seam | Result |
|---|---|
| **No SD / no immutability vs the rest of Doc-6** | the R7 exception correctly inverts the program-wide no-hard-delete rule; intentional, enumerated (Doc-6A §6.5) | PASS |
| **No event coined / emitted** | advisory-only (Doc-5K); CHK-6-040/041 N/A | PASS |
| **No human_ref / no money / no versioned / no history** | all N/A-by-shape, justified | PASS |
| **Identical-shape tables** | the 4 tables share one DDL pattern + 2 indexes; one requesting-org RLS policy each | PASS |
| **Coin-nothing** | nothing coined; `subject_type` text; `[ESC-AI-AUDIT]` carried | PASS |
| **Appendix A** | 37/37; **CHK-6-033 the active PASS**; the N/A set justified; 043 PASS-with-carry | PASS |

## 4 — Observation (1; confirmed-by-design)
### OBSERVATION HR-K1 — the large N/A set is correct, not a coverage gap
M9 N/A's CHK-6-002/004/005/030/031/032/040/041/050/062 — more N/A than any module. **Confirmed correct:** each traces to the **regenerable-cache shape** (no human_ref, no soft-delete, no authoritative/versioned/history rows, no §8 event, no money, no role seed). The **single active distinguishing check is CHK-6-033** (the hard-delete exception) — exactly the inverse of every other module. No change.

## 5 — Decision
**0 BLOCKER, 0 MAJOR; 1 OBSERVATION by-design.** The two load-bearing properties — the sole `ai.*` TTL hard-delete exception and AI-suggests/modules-decide (never source of truth) — are verified. Coverage 4/4; CHK-6-033 the active PASS; the N/A set justified by the cache shape.

**Authorized next step:** **Content Freeze Audit** → `Doc-6K_SERIES_FROZEN_v1.0` → fold corpus → **Doc-6 Database program COMPLETE.** **Carried:** `[ESC-AI-AUDIT]`.

---

*End of Doc-6K Content Hard Review v1.0 (cross-pass). 0 BLOCKER/MAJOR; the R7 hard-delete exception + never-source-of-truth verified; coverage 4/4; CHK-6-033 the active PASS. 1 OBSERVATION by-design. On any conflict, Doc-2 and Doc-6A win; flag-and-halt. Next: Content Freeze Audit → `Doc-6K_SERIES_FROZEN` → Doc-6 COMPLETE.*
