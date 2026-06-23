# Doc-4K_PassB_Patch_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4K_PassB_Patch_v1.0` |
| Nature | **Correction patch.** NOT a redesign, re-authoring pass, structure revision, governance revision, or Board reassessment. |
| Patch target | `Doc-4K_PassB_Content_v1.0` |
| Finding source | `Doc-4K_PassB_Independent_Hard_Review_v1.0` (Claude Sonnet 4.6) + Architecture Board Assessment of that review |
| Board disposition applied | ACCEPT REVIEW · F4K-PB-01 ACCEPT (MINOR, patch required) · F4K-PB-02 ACCEPT (MINOR, patch required) · F4K-PB-03/04/05 ACCEPT (NITPICK) |
| Authority | Doc-4A v1.0 (FROZEN) governs. On any conflict: **FLAG-AND-HALT**. |
| Corpus precedence | Master Arch v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4J (FROZEN) → Doc-4K_Structure_FROZEN_v1.0 → Doc-4K_PassA_Content_v1.0 → Doc-4K_PassA_Independent_Hard_Review_v1.0 → Doc-4K_PassA_Board_Disposition_v1.0 → Doc-4K_PassB_Content_v1.0 |
| Patch scope | **Mandatory:** F4K-PB-01, F4K-PB-02. **Optional (incorporated):** F4K-PB-03, F4K-PB-04. **Optional (advisory only, not applied):** F4K-PB-05. No other finding patched. No self-generated finding. |

---

## Patch Decisions Record

**F4K-PB-02 behavior selection (Board: "a single behavior must be chosen and applied consistently across all four BCs").** Selected behavior: **Explicit 403 + `found:false`**. Permission/tenancy denial returns a 403-class error via the existing error-matrix rows (unchanged); a successful, entitled lookup of a non-existent or swept `id` returns `200 { found:false, <artifact>:null }`. The payload `null` therefore means **not-found only** — never permission-denied. This is the smallest correction: it retains every existing 403 matrix row, changes only the ambiguous response-schema comment, and adds one explicit not-found row per `get_*` matrix. No authorization architecture, DF-AI-1, permission, moat, or firewall rule is altered. (Rationale: the `get_*` family already issues explicit 403s for tenancy `E-AI-x-010` and `check_permission` `E-AI-x-012`; collapsing to uniform 200+null would have required demoting those rows — a larger change the Board did not direct. The non-disclosure obscurity pattern remains where Pass-B already placed it: the `list_*` family's empty-list rows, which are out of this finding's scope and untouched.)

**Storage model (F4K-PB-01).** No storage change. `result_jsonb jsonb` remains the sole stored column for Score/Basis; VO-1/VO-2 remain JSON-path projections specified in §K5-VO (which already states "stored in `result_jsonb`" and "nested within `result_jsonb`; not a top-level column"). The patch removes only the two registry rows that mis-presented those projections as columns.

---

# Mandatory Corrections

---

## Patch Item 1 — F4K-PB-01

**Severity:** MINOR · **Board:** ACCEPT · **Action:** Pass-B Patch Required
**Location:** `B-AI-1-1 ai.generate_recommendation.v1` — §(3) Field Registry — `ai.recommendations`

### Original Text

```
| `result_jsonb` | jsonb | No | AI derivation | Recommendation payload incl. Score + Basis (VO-1, VO-2); structure is model-version-dependent |
| `result_jsonb->>'score'` | numeric(5,4) | No | AI derivation | VO-1 Score; 0.0000–1.0000 |
| `result_jsonb->>'basis'` | varchar(1000) | No | AI derivation | VO-2 Basis; ≤ 1000 chars |
| `model_version` | varchar(64) | No | AI runtime | Model/version identifier for provenance |
```

### Patched Text

```
| `result_jsonb` | jsonb | No | AI derivation | Recommendation payload. Contains the Score (VO-1) and Basis (VO-2) value objects as JSON-path projections (`result_jsonb->>'score'`, `result_jsonb->>'basis'`); see §K5-VO for their specification. Not separate columns. Structure is model-version-dependent. |
| `model_version` | varchar(64) | No | AI runtime | Model/version identifier for provenance |
```

**Patch Rationale.** Removes `result_jsonb->>'score'` and `result_jsonb->>'basis'` as independent field-registry rows. They are JSON-path projections within `result_jsonb`, not storage columns; listing them as rows with their own type annotations (`numeric(5,4)`, `varchar(1000)`) could lead an AI coding agent to generate top-level `score`/`basis` columns, contradicting §K5-VO ("stored in `result_jsonb`"). The retained `result_jsonb` row now points to §K5-VO for the Score/Basis projection spec. VO-1 and VO-2 remain fully specified in §K5-VO (unchanged). No column added or removed from storage; storage model, VO definitions, and ownership unchanged. Per finding "Required Correction" verbatim: "Remove `result_jsonb->>'score'` and `result_jsonb->>'basis'` as independent field registry rows. The `result_jsonb jsonb` column entry should reference §K5-VO."

### Consequential consistency edit (same contract, §(3) trailing note)

The post-table note in §(3) is retained and lightly extended so the registry-to-VO pointer is explicit. This is part of the same finding's required correction (registry references §K5-VO), not a new change.

**Original Text**

```
No additional columns invented. `entity_ref_type` values are pointers to upstream module enumerations (Doc-4D/4E); no new discriminator value coined here.
```

**Patched Text**

```
No additional columns invented. Score (VO-1) and Basis (VO-2) are projections within `result_jsonb`, specified in §K5-VO — not separate columns. `entity_ref_type` values are pointers to upstream module enumerations (Doc-4D/4E); no new discriminator value coined here.
```

**Patch Rationale.** Reinforces, in prose, that the two value objects are projections rather than columns, closing the conflation the finding identified. No new content beyond the registry/VO relationship already specified in §B.15 and §K5-VO.

---

## Patch Item 2 — F4K-PB-02

**Severity:** MINOR · **Board:** ACCEPT · **Action:** Pass-B Patch Required
**Location:** all four `get_*` contracts — `B-AI-1-2`, `B-AI-2-2`, `B-AI-3-2`, `B-AI-4-2` — §(11) Response Schema and §(12) Error Matrix
**Behavior applied:** Explicit 403 + `found:false` (null = not-found only) — consistently across all four BCs.

### 2a — `B-AI-1-2 ai.get_recommendation.v1` §(11) Response Schema

**Original Text**

```
ai.get_recommendation.v1 — Response
  found: boolean
  recommendation: RecommendationDetail | null  // null if not found or permission denied
```

**Patched Text**

```
ai.get_recommendation.v1 — Response
  found: boolean   // true when an entitled artifact is returned; false when no matching row exists for this id within the caller's org
  recommendation: RecommendationDetail | null  // populated when found = true; null only when found = false (not-found). Permission/tenancy denial does NOT return this success shape — it returns a 403-class error (see §(12) E-AI-1-010, E-AI-1-012).
```

**Patch Rationale.** Removes the conflation flagged by the finding: the prior comment said `null` covered both not-found and permission-denied, while the error matrix issued 403 for permission-denied. Per the selected behavior, `null` now means not-found only; permission/tenancy denial is exclusively the 403 path. Response schema and error matrix can no longer be read as conflicting. No new field; `found`/`recommendation` shape unchanged.

### 2a — `B-AI-1-2` §(12) Error Matrix

**Original Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-1-010` | PERMISSION | `subject_org_id` does not match the row's `subject_org_id` (tenancy violation) | Return 403-class; do not return artifact |
| `E-AI-1-011` | VALIDATION | `recommendation_id` missing or malformed | Return 400-class |
| `E-AI-1-012` | PERMISSION | `check_permission` denied for the requesting org on the underlying entity | Return 403-class |
| `E-AI-1-013` | SYSTEM | Database read failure | Return 5xx-class; retry eligible |
```

**Patched Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-1-010` | PERMISSION | `subject_org_id` does not match the row's `subject_org_id` (tenancy violation) | Return 403-class; do not return artifact |
| `E-AI-1-011` | VALIDATION | `recommendation_id` missing or malformed | Return 400-class |
| `E-AI-1-012` | PERMISSION | `check_permission` denied for the requesting org on the underlying entity | Return 403-class |
| `E-AI-1-013` | SYSTEM | Database read failure | Return 5xx-class; retry eligible |
| `E-AI-1-014` | NOT_FOUND | No `ai.recommendations` row matches `recommendation_id` within the caller's `subject_org_id` (and tenancy/permission checks passed) | Return 200-class success with `{ found: false, recommendation: null }`; not an error response |
```

**Patch Rationale.** Adds the explicit not-found outcome as its own matrix row so the `200 + {found:false, null}` path is documented alongside the 403 denial paths and cannot be confused with them. The NOT_FOUND tier is a documentation row describing a success response (not a 4xx/5xx error); it does not introduce a new error class into B.14's three-tier model — it records the not-found success outcome the response schema already implies via `found:boolean`. Tenancy (`E-AI-1-010`) and permission (`E-AI-1-012`) precedence is preserved: NOT_FOUND applies only after those checks pass.

### 2b — `B-AI-2-2 ai.get_prediction.v1` §(11) Response Schema

**Original Text**

```
ai.get_prediction.v1 — Response
  found:       boolean
  prediction:  PredictionDetail | null
```

**Patched Text**

```
ai.get_prediction.v1 — Response
  found:       boolean   // true when an entitled artifact is returned; false when no matching row exists for this id within the caller's org
  prediction:  PredictionDetail | null  // populated when found = true; null only when found = false (not-found). Permission/tenancy denial returns a 403-class error (see §(12) E-AI-2-010, E-AI-2-012), not this success shape.
```

**Patch Rationale.** Same correction as 2a, applied for consistency across the `get_*` family. `null` = not-found only; denial = 403. Shape unchanged.

### 2b — `B-AI-2-2` §(12) Error Matrix

**Original Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-2-010` | PERMISSION | Tenancy mismatch (`subject_org_id` ≠ row's) | 403-class |
| `E-AI-2-011` | VALIDATION | `prediction_id` malformed | 400-class |
| `E-AI-2-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-2-013` | SYSTEM | Database read failure | 5xx-class; retry eligible |
```

**Patched Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-2-010` | PERMISSION | Tenancy mismatch (`subject_org_id` ≠ row's) | 403-class |
| `E-AI-2-011` | VALIDATION | `prediction_id` malformed | 400-class |
| `E-AI-2-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-2-013` | SYSTEM | Database read failure | 5xx-class; retry eligible |
| `E-AI-2-014` | NOT_FOUND | No `ai.predictions` row matches `prediction_id` within the caller's `subject_org_id` (tenancy/permission passed) | Return 200-class success with `{ found: false, prediction: null }`; not an error response |
```

**Patch Rationale.** Consistent not-found row for BC-AI-2, matching 2a. Denial precedence preserved.

### 2c — `B-AI-3-2 ai.get_classification.v1` §(11) Response Schema

**Original Text**

```
ai.get_classification.v1 — Response
  found:          boolean
  classification: ClassificationDetail | null
```

**Patched Text**

```
ai.get_classification.v1 — Response
  found:          boolean   // true when an entitled artifact is returned; false when no matching row exists for this id within the caller's org
  classification: ClassificationDetail | null  // populated when found = true; null only when found = false (not-found). Permission/tenancy denial returns a 403-class error (see §(12) E-AI-3-010, E-AI-3-012), not this success shape.
```

**Patch Rationale.** Same correction, applied for BC-AI-3 consistency. `null` = not-found only; denial = 403.

### 2c — `B-AI-3-2` §(12) Error Matrix

**Original Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-3-010` | PERMISSION | Tenancy mismatch | 403-class |
| `E-AI-3-011` | VALIDATION | `classification_id` malformed | 400-class |
| `E-AI-3-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-3-013` | SYSTEM | Database read failure | 5xx-class |
```

**Patched Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-3-010` | PERMISSION | Tenancy mismatch | 403-class |
| `E-AI-3-011` | VALIDATION | `classification_id` malformed | 400-class |
| `E-AI-3-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-3-013` | SYSTEM | Database read failure | 5xx-class |
| `E-AI-3-014` | NOT_FOUND | No `ai.classification_results` row matches `classification_id` within the caller's `subject_org_id` (tenancy/permission passed) | Return 200-class success with `{ found: false, classification: null }`; not an error response |
```

**Patch Rationale.** Consistent not-found row for BC-AI-3.

### 2d — `B-AI-4-2 ai.get_similar_vendors.v1` §(11) Response Schema

**Original Text**

```
ai.get_similar_vendors.v1 — Response
  found:               boolean
  similar_vendor_result: SimilarVendorDetail | null
```

**Patched Text**

```
ai.get_similar_vendors.v1 — Response
  found:               boolean   // true when an entitled artifact is returned; false when no matching row exists for this id within the caller's org
  similar_vendor_result: SimilarVendorDetail | null  // populated when found = true; null only when found = false (not-found). Permission/tenancy denial returns a 403-class error (see §(12) E-AI-4-010, E-AI-4-012), not this success shape.
```

**Patch Rationale.** Same correction, applied for BC-AI-4 consistency. `null` = not-found only; denial = 403.

### 2d — `B-AI-4-2` §(12) Error Matrix

**Original Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-4-010` | PERMISSION | Tenancy mismatch | 403-class |
| `E-AI-4-011` | VALIDATION | `similar_vendor_result_id` malformed | 400-class |
| `E-AI-4-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-4-013` | SYSTEM | Database read failure | 5xx-class |
```

**Patched Text**

```
| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-4-010` | PERMISSION | Tenancy mismatch | 403-class |
| `E-AI-4-011` | VALIDATION | `similar_vendor_result_id` malformed | 400-class |
| `E-AI-4-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-4-013` | SYSTEM | Database read failure | 5xx-class |
| `E-AI-4-014` | NOT_FOUND | No `ai.similar_vendor_results` row matches `similar_vendor_result_id` within the caller's `subject_org_id` (tenancy/permission passed) | Return 200-class success with `{ found: false, similar_vendor_result: null }`; not an error response |
```

**Patch Rationale.** Consistent not-found row for BC-AI-4. The behavior is now identical across all four `get_*` contracts: 403 for tenancy/permission denial, `200 {found:false, null}` for not-found, no overlap between the two. F4K-PB-02 resolved.

---

# Optional Cleanups

*Board: F4K-PB-03 and F4K-PB-04 are NITPICK — "may be resolved during patch." Applied below because each is a one-line, non-invasive completeness edit. F4K-PB-05 (NITPICK, "no action required for freeze") is recorded as advisory only and not applied — see note at end.*

---

## Patch Item 3 — F4K-PB-03 (optional, applied)

**Severity:** NITPICK · **Board:** ACCEPT (may resolve at patch)
**Location:** `B-AI-2-4`, `B-AI-3-4`, `B-AI-4-4` — combined §(3–5) block

### 3a — `B-AI-2-4 ai.expire_predictions.v1` §(3–5)

**Original Text**

```
**(3–5) Field Registry / Value Objects / Read Model**

Operates on `ai.predictions`; deletes rows; no read model; no VOs.
```

**Patched Text**

```
**(3–5) Field Registry / Value Objects / Read Model**

**(3) Field Registry:** Operates on target table `ai.predictions`. No new fields written; rows matching `expires_at < now()` are hard-deleted. **(4) Value Objects:** Not applicable — deletion contract. **(5) Read Model:** Not applicable — no data returned (21.5 System; `Response: none`).
```

**Patch Rationale.** Names the target table explicitly in §(3) and the sweep predicate, matching the B-AI-1-4 pattern ("Operates on `ai.recommendations`. No new fields written; rows are deleted"). Sections (4)/(5) stated as Not applicable. No storage, ownership, or behavior change.

### 3b — `B-AI-3-4 ai.expire_classifications.v1` §(3–5)

**Original Text**

```
**(3–5) Field Registry / Value Objects / Read Model**

Operates on `ai.classification_results`; deletes rows; no read model; no VOs.
```

**Patched Text**

```
**(3–5) Field Registry / Value Objects / Read Model**

**(3) Field Registry:** Operates on target table `ai.classification_results`. No new fields written; rows matching `expires_at < now()` are hard-deleted. **(4) Value Objects:** Not applicable — deletion contract. **(5) Read Model:** Not applicable — no data returned (21.5 System; `Response: none`).
```

**Patch Rationale.** Same completeness edit for BC-AI-3. No behavior change.

### 3c — `B-AI-4-4 ai.expire_similar_vendors.v1` §(3–5)

**Original Text**

```
**(3–5) Field Registry / Value Objects / Read Model**

Operates on `ai.similar_vendor_results`; deletes rows; no read model; no VOs.
```

**Patched Text**

```
**(3–5) Field Registry / Value Objects / Read Model**

**(3) Field Registry:** Operates on target table `ai.similar_vendor_results`. No new fields written; rows matching `expires_at < now()` are hard-deleted. **(4) Value Objects:** Not applicable — deletion contract. **(5) Read Model:** Not applicable — no data returned (21.5 System; `Response: none`).
```

**Patch Rationale.** Same completeness edit for BC-AI-4. No behavior change.

---

## Patch Item 4 — F4K-PB-04 (optional, applied)

**Severity:** NITPICK · **Board:** ACCEPT (may resolve at patch)
**Location:** `B-AI-1-2`, `B-AI-2-2`, `B-AI-3-2`, `B-AI-4-2` — §(9) Index Strategy
**Approach chosen (per finding's second option):** add a one-sentence note that the `id` primary-key index is implicit and its name is implementation-defined — consistent across all four `get_*`. (Chosen over adding a named index row, to avoid coining an index name not present in any `generate_*` index table.)

### 4a — `B-AI-1-2` §(9)

**Original Text**

```
Uses `ai_rec_org_entity_idx` on `(subject_org_id, entity_ref_id)` for point-lookup by entity, and primary key index on `id` for direct `recommendation_id` lookup.
```

**Patched Text**

```
Uses `ai_rec_org_entity_idx` on `(subject_org_id, entity_ref_id)` for point-lookup by entity, and the primary-key index on `id` for direct `recommendation_id` lookup. The `id` primary-key index is implicit (created with the primary key); its name is implementation-defined and is not enumerated in the `generate_*` index table.
```

**Patch Rationale.** Closes the completeness gap the finding noted (PK index named generically) without coining an index name. Consistent treatment to follow in the other three `get_*`. No index added; PK index is implicit in all mainstream databases.

### 4b — `B-AI-2-2` §(9)

**Original Text**

```
Primary key on `id`; `ai_pred_org_entity_idx` for entity-scoped lookup.
```

**Patched Text**

```
Primary-key index on `id` (implicit; name implementation-defined; not enumerated in the `generate_*` index table); `ai_pred_org_entity_idx` for entity-scoped lookup.
```

**Patch Rationale.** Consistent PK-index note for BC-AI-2.

### 4c — `B-AI-3-2` §(9)

**Original Text**

```
Primary key on `id`; `ai_cls_org_entity_idx`.
```

**Patched Text**

```
Primary-key index on `id` (implicit; name implementation-defined; not enumerated in the `generate_*` index table); `ai_cls_org_entity_idx` for entity-scoped lookup.
```

**Patch Rationale.** Consistent PK-index note for BC-AI-3.

### 4d — `B-AI-4-2` §(9)

**Original Text**

```
Primary key on `id`; `ai_sim_org_entity_idx`.
```

**Patched Text**

```
Primary-key index on `id` (implicit; name implementation-defined; not enumerated in the `generate_*` index table); `ai_sim_org_entity_idx` for entity-scoped lookup.
```

**Patch Rationale.** Consistent PK-index note for BC-AI-4. F4K-PB-04 resolved across all four `get_*`.

---

## Patch Item 5 — F4K-PB-05 (optional, NOT applied — advisory record only)

**Severity:** NITPICK · **Board:** ACCEPT — "No action required for freeze."

**Disposition: not applied in this patch.** The finding itself states the governance is preserved (`[ESC-AI-EVENT]`/`[ESC-AI-SLUG]` carried in §K17-B and inherited via §B; risk "Nil") and that the correction is "Advisory only … addressable in a Consolidation review pass." The Board concurred ("Optional. No action required for freeze."). Adding per-contract escalation-marker citations into every `generate_*` §(2)/§(10) is a stylistic depth change touching contract bodies that are otherwise correct; deferring it to the Consolidation pass keeps this patch minimal and avoids editing sections with no defect. Recorded here so the deferral is explicit and traceable. No success-criteria impact (F4K-PB-05 is not a freeze blocker).

---

## Patch Restrictions Honored

This patch does **not** modify any of the following (per the patch brief):

- **Frozen Board decisions Q1 / Q2 / Q3** — untouched. Four BCs; Matching-Assist → BC-AI-1 advisory (RFQ decides); pull/derive-on-demand (no event-consumption contract).
- **BC inventory · Aggregate inventory · Ownership matrix · Dependency inventory · Escalation inventory · Authorization model · Audit model · POLICY posture** — all unchanged.
- **No contract created, removed, or renamed.** Contract count remains **16** (4 generate + 4 get + 4 list + 4 expire). All 16 contract IDs unchanged.
- **No event introduced** (Doc-2 §8 untouched; zero AI events; Q3 intact).
- **No permission slug introduced** (`[ESC-AI-SLUG]` carried; `check_permission`/DF-AI-1 unchanged).
- **No POLICY key introduced** (`policy.ai.<bc>.ttl_seconds` placeholders remain `[ESC-AI-POLICY]`; nothing coined).
- **No new error class** in B.14's three-tier model. The `E-AI-x-014` rows document a **success** (`200 {found:false}`) outcome; the `NOT_FOUND` tier label denotes the not-found success path, not a fourth error tier. No error code renumbered or removed.
- **Storage model unchanged** (F4K-PB-01 removes mis-presented registry rows only; `result_jsonb` remains the sole stored column).
- **Authorization architecture, DF-AI-1, moat, firewall unchanged** (F4K-PB-02 keeps all 403 rows; denial precedence preserved).

---

## Change Inventory

| # | Finding | Severity | Class | Contract(s) | Section(s) | Nature |
|---|---|---|---|---|---|---|
| 1 | F4K-PB-01 | MINOR | Mandatory | B-AI-1-1 | §(3) | Remove 2 JSON-path rows; point `result_jsonb` to §K5-VO; extend trailing note |
| 2 | F4K-PB-02 | MINOR | Mandatory | B-AI-1-2, B-AI-2-2, B-AI-3-2, B-AI-4-2 | §(11), §(12) | Disambiguate response null (not-found only); add 1 NOT_FOUND success row per matrix |
| 3 | F4K-PB-03 | NITPICK | Optional (applied) | B-AI-2-4, B-AI-3-4, B-AI-4-4 | §(3–5) | Name target table + sweep predicate in §(3) |
| 4 | F4K-PB-04 | NITPICK | Optional (applied) | B-AI-1-2, B-AI-2-2, B-AI-3-2, B-AI-4-2 | §(9) | Note PK index is implicit / name implementation-defined |
| 5 | F4K-PB-05 | NITPICK | Optional (deferred) | — | — | Per-contract ESC-marker citation depth → deferred to Consolidation |

---

## Success Criteria Check (self-assessment; authoritative verification deferred to Patch Verification)

- ✅ F4K-PB-01 resolved — JSON-path projection rows removed; registry references §K5-VO.
- ✅ F4K-PB-02 resolved — single behavior (403 for denial / `200 {found:false,null}` for not-found) applied identically across all four `get_*`; response schema and error matrix no longer conflict.
- ✅ All frozen architecture preserved (Q1/Q2/Q3, BC/aggregate/ownership/dependency/escalation/authorization/audit/POLICY inventories).
- ✅ Moat integrity preserved (no procurement decision; AI suggests, RFQ decides).
- ✅ Firewall integrity preserved (no Trust/Performance/Verification/Governance score computed or owned).
- ✅ Ownership integrity preserved (AI writes only `ai.*`; no upstream ownership touched).

**Expected at Patch Verification:** BLOCKER = 0 · MAJOR = 0 · MINOR = 0.

**Next artifact:** `Doc-4K_PassB_Patch_Verification_v1.0`.

---

*End of Doc-4K_PassB_Patch_v1.0. Correction patch only. Mandatory: F4K-PB-01 (field-registry / JSON-path column conflation in B-AI-1-1) + F4K-PB-02 (`get_*` response shape — null vs 403, resolved as Explicit-403 + found:false across all four BCs). Optional applied: F4K-PB-03 (expire §(3) target-table naming) + F4K-PB-04 (`get_*` PK-index note). Optional deferred: F4K-PB-05 (per-contract ESC-marker depth → Consolidation). No contract / event / slug / POLICY key / aggregate / BC / ownership created, removed, or renamed. Q1/Q2/Q3 untouched. Moat + firewall intact. Corpus authority: Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A → Doc-4B–4J (FROZEN) → Doc-4K_Structure_FROZEN_v1.0 → Doc-4K_PassA_Content_v1.0 → Doc-4K_PassA_Independent_Hard_Review_v1.0 → Doc-4K_PassA_Board_Disposition_v1.0 → Doc-4K_PassB_Content_v1.0.*
