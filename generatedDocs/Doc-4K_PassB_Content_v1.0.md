# Doc-4K — AI Layer — API & Integration Contracts — Content Pass-B v1.0

| Field | Value |
|---|---|
| Document | Doc-4K — **Content Pass-B v1.0** — hardened contract specifications for Module 9 — AI Layer (`ai` schema, `ai_` namespace), bounded contexts **BC-AI-1 / BC-AI-2 / BC-AI-3 / BC-AI-4** |
| Lifecycle stage | **Pass-B** — 12-section per-contract hardening (field registries, value objects, read models, idempotency, concurrency, retention, indexes, request/response/error matrices, contract precision). **Baseline:** `Doc-4K_PassA_Content_v1.0` + `Doc-4K_PassA_Independent_Hard_Review_v1.0` + `Doc-4K_PassA_Board_Disposition_v1.0`. |
| Structure authority | `Doc-4K_Structure_FROZEN_v1.0` (FROZEN; sole structure authority — not revisited, not redesigned, not reopened) |
| Authority | Doc-4A v1.0 (FROZEN) governs this document. On any conflict: **FLAG-AND-HALT**. |
| Conforms To | Master Architecture v1.0 FINAL (§16, §18 incl. Invariant 12), ADR Compendium v1, Doc-2 v1.0.3 (§2/§3.10/§9/§10.10), Doc-3 v1.0.2, Doc-4A–4J v1.0, Doc-4K_Structure_FROZEN_v1.0, Doc-4K_PassA_Content_v1.0 — all FROZEN |
| Frozen Board decisions applied | **Q1** four BCs. **Q2** Matching-Assist → BC-AI-1 (advisory-only; RFQ owns the decision). **Q3** Pull / Derive On Demand — no event-consumption contract authored. |
| Board Pass-B directives | **K-PA-HR-01 (binding):** each BC's `get_*` and `list_*` are split into two separate hardened contracts (16 total from 12 Pass-A entries). **[ESC-AI-POLICY]** TTL/retention surfaced here per Doc-3 §12.2 additive (key carried; not coined). **Value objects** BC-AI-1 Score · Basis specified (Doc-2 §2). |
| Contract count | **16** — 4 × generate (21.4/21.5) + 4 × get (21.3) + 4 × list (21.3) + 4 × expire (21.5) |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA / Solution Architects — implementation-ready at Pass-B depth |

**Pass-B mission.** Harden every Module-9 contract to 12-section depth: field registries, value-object specs (BC-AI-1 Score/Basis), read models, idempotency keys, concurrency strategy, retention windows, index strategy, request schema, response schema, and error matrix. Apply K-PA-HR-01 split (separate `get_*` / `list_*` per BC). Carry all `[ESC-AI-*]` markers. Do not coin any slug, event, audit action, or POLICY key. Do not redesign Module 9. On any corpus conflict: **FLAG-AND-HALT**.

---

## §B — Pass-B Cross-Cutting Conventions (inherited from Pass-A; additions noted)

All Pass-A §B conventions (B.1–B.9) apply without modification. Pass-B additions:

- **B.10 — Idempotency.** All `generate_*` (21.4 Command / 21.5 System) contracts are idempotent on `(subject_org_id, entity_ref_id, model_version)`: a re-run with the same key upserts the existing row rather than inserting a duplicate. Idempotency key = `ai_idempotency_key` = UUIDv7 per-request (Doc-4B UUIDv7 service); stored on the artifact; duplicate detection window = TTL of the artifact.

- **B.11 — Concurrency.** All `generate_*` contracts use **last-writer-wins optimistic upsert** on the artifact row (no version-lock required — artifacts are regenerable, non-authoritative). Concurrent regenerations of the same artifact key are safe: the later write replaces the earlier; no business-invariant is violated.

- **B.12 — Retention & TTL.** Cache TTL / `expires_at` window values are runtime-tunable POLICY values (Doc-3 §12.2). **No POLICY key is coined here** (`[ESC-AI-POLICY]`); Pass-B surfaces the placeholder `policy.ai.<bc>.ttl_seconds` per BC as the additive-channel carry. Hard delete on expiry (cache semantics, Doc-2 §10.10). Retention = TTL only (no audit-retention obligation on derived cache rows — the audit record of the generation action is retained per `core.audit_records` policy, owned by Platform Core/Doc-4B).

- **B.13 — Indexes.** Minimum required index per artifact table: `(subject_org_id, expires_at)` for expiry-sweep queries; `(subject_org_id, entity_ref_id)` for point-lookup (get) and filtered listing (list); `(expires_at)` partial index for the cache-maintenance sweep. Additional indexes are implementation detail (Pass-C / dev doc).

- **B.14 — Error classification.** All contracts use a three-tier error model: **VALIDATION** (client input malformed; 4xx-class), **PERMISSION** (entitlement check failed; 403-class), **SYSTEM** (infrastructure/derivation failure; 5xx-class). AI-derivation model failure is SYSTEM. Corpus-absent error action codes carry `[ESC-AI-AUDIT]`.

- **B.15 — Value objects (BC-AI-1 only).** Doc-2 §2 enumerates two value objects on the Recommendation aggregate: **Score** (numeric confidence value; range 0.0–1.0; immutable per generation; stored in `result_jsonb`) and **Basis** (explanation string; human-readable derivation rationale; immutable per generation; stored in `result_jsonb`). These are specified in §K5-VO below and referenced in BC-AI-1 field registry. No value object is enumerated for BC-AI-2, BC-AI-3, or BC-AI-4 in Doc-2 §2; none is invented here.

---

## §K5-VO — Value Object Specifications (BC-AI-1 only)

*Doc-2 §2 enumerates Score and Basis on the Recommendation aggregate. Specified here as required by Pass-B.*

### VO-1: Score

| Property | Value |
|---|---|
| Name | `Score` |
| Owning Aggregate | Recommendation (`ai.recommendations`) |
| Owning BC | BC-AI-1 |
| Corpus anchor | Doc-2 §2 |
| Type | Numeric (decimal) |
| Range | 0.0 – 1.0 (inclusive) |
| Precision | 4 decimal places (stored) |
| Immutability | Immutable per generation instance; a regeneration produces a new Score (new row / upserted row) |
| Storage | `result_jsonb->>'score'` (nested within `result_jsonb`; not a top-level column) |
| Null permitted | No (must be present on every generated Recommendation) |
| Semantics | Advisory confidence value; non-authoritative; higher value = higher model confidence in the recommendation. Does not encode procurement decision or eligibility. Does not derive from or encode a Trust/Performance/Verification/Governance score (firewall). |
| Validation | 0.0 ≤ score ≤ 1.0; type: numeric; must be present on `generate_recommendation` completion |

### VO-2: Basis

| Property | Value |
|---|---|
| Name | `Basis` |
| Owning Aggregate | Recommendation (`ai.recommendations`) |
| Owning BC | BC-AI-1 |
| Corpus anchor | Doc-2 §2 |
| Type | String |
| Max length | 1000 characters (stored) |
| Immutability | Immutable per generation instance |
| Storage | `result_jsonb->>'basis'` (nested within `result_jsonb`) |
| Null permitted | No (must be present; may be a system-generated default if the model provides no explanation) |
| Semantics | Human-readable derivation rationale for the Recommendation. Advisory-only. Surfaced to the consuming UI/RFQ surface as non-authoritative context. Must not encode eligibility, Trust score, or routing decision. |
| Validation | String; length ≤ 1000; must be present on `generate_recommendation` completion |

---

## §K6-B — Hardened Contract Specifications

Per-contract 12-section hardening. Sections per contract: (1) Identity (2) Purpose (3) Field Registry (4) Value Objects (5) Read Model (6) Idempotency (7) Concurrency (8) Retention & TTL (9) Index Strategy (10) Request Schema (11) Response Schema (12) Error Matrix.

---

### BC-AI-1 — Recommendation

---

#### CONTRACT B-AI-1-1: `ai.generate_recommendation.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.generate_recommendation.v1` |
| Owning BC | BC-AI-1 — Recommendation |
| Aggregate | Recommendation (`ai.recommendations`) |
| Operation template | 21.4 Command (AI Agent advisory generation) / 21.5 System (scheduled derivation) |
| Actor | AI Agent (on-demand) · System (scheduled/triggered) |
| Pass-A governance | §K6 `ai.generate_recommendation.v1` (inherited; not restated) |

**(2) Purpose**

Derive or re-derive a non-authoritative Recommendation artifact (including the Matching-Assist Confidence Artifact, Q2) for a requesting organization from entitled upstream data. Writes/refreshes `ai.recommendations`. Advisory-only; AI suggests; RFQ decides. Master Architecture §18 Invariant 12 applies: AI-Agent actor writes only `ai.*`.

**(3) Field Registry — `ai.recommendations`**

| Field | Type | Null | Source | Notes |
|---|---|---|---|---|
| `id` | UUIDv7 | No | Platform Core DF-AI-6 | Primary key; time-sortable |
| `subject_org_id` | UUIDv7 | No | Identity DF-AI-1 | Requesting/subject organization |
| `entity_ref_id` | UUIDv7 | No | Caller-supplied | UUID of the entity being recommended for/against (RFQ id, vendor id, etc.) |
| `entity_ref_type` | varchar(64) | No | Caller-supplied | Discriminator: `rfq`, `vendor`, `quotation` (values from upstream module — not coined here) |
| `result_jsonb` | jsonb | No | AI derivation | Recommendation payload incl. Score + Basis (VO-1, VO-2); structure is model-version-dependent |
| `result_jsonb->>'score'` | numeric(5,4) | No | AI derivation | VO-1 Score; 0.0000–1.0000 |
| `result_jsonb->>'basis'` | varchar(1000) | No | AI derivation | VO-2 Basis; ≤ 1000 chars |
| `model_version` | varchar(64) | No | AI runtime | Model/version identifier for provenance |
| `generated_at` | timestamptz | No | System clock | Generation timestamp |
| `expires_at` | timestamptz | No | `generated_at + policy.ai.rec.ttl_seconds` | Cache expiry; `[ESC-AI-POLICY]` |
| `ai_idempotency_key` | UUIDv7 | No | Caller / System | Per-request idempotency key (B.10) |
| `actor_type` | varchar(32) | No | Runtime | `ai_agent` or `system` (Doc-2 §9) |

No additional columns invented. `entity_ref_type` values are pointers to upstream module enumerations (Doc-4D/4E); no new discriminator value coined here.

**(4) Value Objects**

Score (VO-1) and Basis (VO-2) — see §K5-VO. Both stored in `result_jsonb`; both required; both immutable per generation.

**(5) Read Model**

Not applicable — this contract writes. The read models for Recommendation artifacts are specified in B-AI-1-2 (get) and B-AI-1-3 (list).

**(6) Idempotency**

- **Key:** `(subject_org_id, entity_ref_id, model_version)` — uniqueness anchor for upsert.
- **Per-request key:** `ai_idempotency_key` (UUIDv7) stored on row; caller may supply; System generates if absent.
- **Behavior:** upsert semantics — if a row with matching `(subject_org_id, entity_ref_id, model_version)` exists, refresh `result_jsonb`, `generated_at`, `expires_at`, `ai_idempotency_key`; do not insert duplicate. Generation under a different `model_version` creates a new row (model upgrade path).
- **Duplicate window:** TTL of the artifact (i.e., `expires_at`; expired rows are not considered for deduplication — regeneration after expiry is a fresh insert/upsert).

**(7) Concurrency**

Last-writer-wins optimistic upsert (B.11). No version-lock. Concurrent regenerations of the same `(subject_org_id, entity_ref_id, model_version)` key are safe — the later write prevails; no business-invariant violated (artifact is regenerable, non-authoritative). Database upsert is atomic (`INSERT ... ON CONFLICT DO UPDATE`).

**(8) Retention & TTL**

- `expires_at = generated_at + policy.ai.rec.ttl_seconds` (`[ESC-AI-POLICY]` — key not coined; additive channel Doc-3 §12.2).
- Hard delete permitted on expiry (cache semantics, Doc-2 §10.10); executed by `ai.expire_recommendations.v1`.
- No business-retention obligation on the artifact row itself.
- Audit record of the generation action is retained per `core.audit_records` policy (Platform Core, Doc-4B — not governed here).

**(9) Index Strategy**

| Index | Columns | Purpose |
|---|---|---|
| `ai_rec_org_entity_idx` | `(subject_org_id, entity_ref_id)` | Point-lookup for get; filtered listing |
| `ai_rec_org_expires_idx` | `(subject_org_id, expires_at)` | Expiry sweep (org-scoped) |
| `ai_rec_expires_idx` | `(expires_at)` WHERE `expires_at < now()` | Global cache-maintenance sweep |
| `ai_rec_model_idx` | `(subject_org_id, entity_ref_id, model_version)` UNIQUE | Idempotency key enforcement |

**(10) Request Schema**

```
ai.generate_recommendation.v1 — Request
  subject_org_id:    UUIDv7   required  // requesting organization
  entity_ref_id:     UUIDv7   required  // entity to derive recommendation for
  entity_ref_type:   string   required  // upstream discriminator (rfq | vendor | quotation)
  model_version:     string   optional  // target model version; defaults to current active version
  ai_idempotency_key: UUIDv7  optional  // per-request idempotency; generated if absent
  force_refresh:     boolean  optional  // if true, bypass TTL check and regenerate regardless of expires_at
```

**(11) Response Schema**

```
ai.generate_recommendation.v1 — Response (21.4 Command acknowledgement)
  recommendation_id:  UUIDv7   // id of the upserted ai.recommendations row
  subject_org_id:     UUIDv7
  entity_ref_id:      UUIDv7
  model_version:      string
  generated_at:       timestamptz
  expires_at:         timestamptz
  ai_idempotency_key: UUIDv7
  status:             string   // "generated" | "refreshed"

// 21.5 System variant: Response: none (job acknowledgement only)
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-1-001` | PERMISSION | `check_permission` returned denied for `subject_org_id` on `entity_ref_id` | Reject; return 403-class; do not derive |
| `E-AI-1-002` | VALIDATION | `subject_org_id` or `entity_ref_id` missing or malformed (not UUIDv7) | Reject; return 400-class |
| `E-AI-1-003` | VALIDATION | `entity_ref_type` is absent or not a recognized upstream discriminator | Reject; return 400-class; `entity_ref_type` values governed by upstream modules |
| `E-AI-1-004` | SYSTEM | AI model derivation failure (model error / timeout) | Return 5xx-class; do not write partial row; caller may retry; `[ESC-AI-AUDIT]` |
| `E-AI-1-005` | SYSTEM | Upstream data read failure (DF-AI-2/3/4/5 Query unavailable) | Return 5xx-class; do not write; retry eligible |
| `E-AI-1-006` | SYSTEM | Audit write failure (`core.append_audit_record`) | Return 5xx-class; roll back artifact write (audit in-transaction, Doc-4B) |

---

#### CONTRACT B-AI-1-2: `ai.get_recommendation.v1`

*K-PA-HR-01 applied: split from combined Pass-A read entry.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.get_recommendation.v1` |
| Owning BC | BC-AI-1 — Recommendation |
| Aggregate | Recommendation (`ai.recommendations`) |
| Operation template | 21.3 Query |
| Actor | User (active org context) · System (entitled consumer) |
| Pass-A governance | Derived from `ai.get_recommendation.v1 · ai.list_recommendations.v1` entry (§K6); split per K-PA-HR-01 |

**(2) Purpose**

Return a single Recommendation artifact by `recommendation_id` for the requesting organization. Single-ID point-lookup; scoped to `subject_org_id`. Reads the matching-assist confidence artifact for consumption by the entitled RFQ surface (DF-AI-3, advisory-only).

**(3) Field Registry**

Same source table `ai.recommendations`. Read model field set in (5) below.

**(4) Value Objects**

Score (VO-1) and Basis (VO-2) included in response (read from `result_jsonb`).

**(5) Read Model**

```
RecommendationDetail
  recommendation_id:  UUIDv7
  subject_org_id:     UUIDv7
  entity_ref_id:      UUIDv7
  entity_ref_type:    string
  score:              numeric(5,4)   // VO-1, from result_jsonb
  basis:              string         // VO-2, from result_jsonb
  model_version:      string
  generated_at:       timestamptz
  expires_at:         timestamptz
  is_expired:         boolean        // computed: expires_at < now()
```

`result_jsonb` is not surfaced raw; Score and Basis are projected as typed fields.

**(6) Idempotency**

Reads are inherently idempotent. No idempotency key required.

**(7) Concurrency**

Read-only; no concurrency control required. Snapshot read (default transaction isolation).

**(8) Retention & TTL**

Expired rows (`expires_at < now()`) may be returned with `is_expired: true` until the expiry sweep deletes them. Callers should treat expired artifacts as stale and trigger regeneration if needed. Reads do not extend TTL.

**(9) Index Strategy**

Uses `ai_rec_org_entity_idx` on `(subject_org_id, entity_ref_id)` for point-lookup by entity, and primary key index on `id` for direct `recommendation_id` lookup.

**(10) Request Schema**

```
ai.get_recommendation.v1 — Request
  recommendation_id:  UUIDv7   required  // primary key of ai.recommendations
  subject_org_id:     UUIDv7   required  // must match row's subject_org_id (tenancy gate)
```

**(11) Response Schema**

```
ai.get_recommendation.v1 — Response
  found: boolean
  recommendation: RecommendationDetail | null  // null if not found or permission denied
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-1-010` | PERMISSION | `subject_org_id` does not match the row's `subject_org_id` (tenancy violation) | Return 403-class; do not return artifact |
| `E-AI-1-011` | VALIDATION | `recommendation_id` missing or malformed | Return 400-class |
| `E-AI-1-012` | PERMISSION | `check_permission` denied for the requesting org on the underlying entity | Return 403-class |
| `E-AI-1-013` | SYSTEM | Database read failure | Return 5xx-class; retry eligible |

---

#### CONTRACT B-AI-1-3: `ai.list_recommendations.v1`

*K-PA-HR-01 applied: split from combined Pass-A read entry.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.list_recommendations.v1` |
| Owning BC | BC-AI-1 — Recommendation |
| Aggregate | Recommendation (`ai.recommendations`) |
| Operation template | 21.3 Query |
| Actor | User (active org context) · System (entitled consumer) |
| Pass-A governance | Derived from `ai.get_recommendation.v1 · ai.list_recommendations.v1` entry (§K6); split per K-PA-HR-01 |

**(2) Purpose**

Return a paginated collection of Recommendation artifacts for the requesting organization, optionally filtered by `entity_ref_type` or `entity_ref_id`. Supports consuming surfaces (e.g., RFQ dashboard listing matching-assist suggestions).

**(3) Field Registry**

Same source table `ai.recommendations`. Read model field set in (5) below.

**(4) Value Objects**

Score (VO-1) and Basis (VO-2) included in each item (projected from `result_jsonb`).

**(5) Read Model**

```
RecommendationSummary  // per-item in collection
  recommendation_id:  UUIDv7
  entity_ref_id:      UUIDv7
  entity_ref_type:    string
  score:              numeric(5,4)   // VO-1
  basis:              string         // VO-2
  model_version:      string
  generated_at:       timestamptz
  expires_at:         timestamptz
  is_expired:         boolean

RecommendationListResponse
  items:              RecommendationSummary[]
  total_count:        integer        // total matching rows (pre-pagination)
  page_cursor:        string | null  // opaque cursor for next page; null if last page
  page_size:          integer        // items returned in this page
```

**(6) Idempotency**

Reads are inherently idempotent. No idempotency key required.

**(7) Concurrency**

Read-only; no concurrency control required. Cursor-based pagination is stable within a snapshot: `page_cursor` encodes `(generated_at DESC, id)` for deterministic ordering.

**(8) Retention & TTL**

Expired artifacts may appear in listing results with `is_expired: true` until swept. Default listing excludes expired rows (filter `expires_at >= now()`) unless caller sets `include_expired: true`.

**(9) Index Strategy**

Uses `ai_rec_org_entity_idx` on `(subject_org_id, entity_ref_id)` for filtered listing; `ai_rec_org_expires_idx` on `(subject_org_id, expires_at)` for TTL-filtered listing.

**(10) Request Schema**

```
ai.list_recommendations.v1 — Request
  subject_org_id:    UUIDv7   required  // tenancy gate
  entity_ref_id:     UUIDv7   optional  // filter to a specific entity
  entity_ref_type:   string   optional  // filter to a specific type
  include_expired:   boolean  optional  // default false; if true, include rows where expires_at < now()
  page_size:         integer  optional  // default 20; max 100
  page_cursor:       string   optional  // opaque cursor from prior response; absent for first page
```

**(11) Response Schema**

```
ai.list_recommendations.v1 — Response
  items:           RecommendationSummary[]
  total_count:     integer
  page_cursor:     string | null
  page_size:       integer
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-1-020` | PERMISSION | `check_permission` denied for requesting org | Return 403-class; return empty list (do not leak existence) |
| `E-AI-1-021` | VALIDATION | `subject_org_id` missing or malformed | Return 400-class |
| `E-AI-1-022` | VALIDATION | `page_size` out of range (< 1 or > 100) | Return 400-class |
| `E-AI-1-023` | VALIDATION | `page_cursor` malformed or expired | Return 400-class; caller must restart from page 1 |
| `E-AI-1-024` | SYSTEM | Database read failure | Return 5xx-class; retry eligible |

---

#### CONTRACT B-AI-1-4: `ai.expire_recommendations.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.expire_recommendations.v1` |
| Owning BC | BC-AI-1 — Recommendation |
| Aggregate | Recommendation (`ai.recommendations`) |
| Operation template | 21.5 System |
| Actor | System (cache-maintenance job) |
| Pass-A governance | §K6 `ai.expire_recommendations.v1` (inherited) |

**(2) Purpose**

Invalidate and hard-delete expired or stale `ai.recommendations` rows (cache maintenance). Triggered by a scheduled job; sweeps all rows where `expires_at < now()`. Hard delete is permitted (cache semantics, Doc-2 §10.10).

**(3) Field Registry**

Operates on `ai.recommendations`. No new fields written; rows are deleted.

**(4) Value Objects**

Not applicable — deletion contract; VOs are not read or written.

**(5) Read Model**

Not applicable — no data returned (21.5 System; `Response: none`).

**(6) Idempotency**

Idempotent by nature: sweeping and deleting rows where `expires_at < now()` is safe to run multiple times; re-runs delete only what remains expired.

**(7) Concurrency**

Batch delete with a row-level lock per deleted row (database default). Concurrent regeneration of an artifact that is simultaneously being expired is safe: the regeneration upserts a new/refreshed row; the expiry sweep deletes only rows where `expires_at < now()`, which the refreshed row will not satisfy if the regeneration succeeded.

**(8) Retention & TTL**

Deletes all rows where `expires_at < now()`. No soft-delete. Batch size configurable (implementation detail). Run cadence: `[ESC-AI-POLICY]` (Doc-3 §12.2 additive; no key coined).

**(9) Index Strategy**

Uses `ai_rec_expires_idx` partial index on `(expires_at)` WHERE `expires_at < now()` for efficient sweep.

**(10) Request Schema**

```
ai.expire_recommendations.v1 — Request (System job trigger)
  batch_size:    integer  optional  // max rows to delete per run; default implementation-defined
  dry_run:       boolean  optional  // if true, count but do not delete (for monitoring)
```

**(11) Response Schema**

```
21.5 System — Response: none
// Job completion acknowledged by job scheduler; no payload returned to caller.
// Monitoring: rows_deleted count emitted to job telemetry (implementation detail).
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-1-030` | SYSTEM | Database delete failure (deadlock / connection loss) | Log; retry on next job cycle; `[ESC-AI-AUDIT]` |
| `E-AI-1-031` | SYSTEM | Audit write failure for deletion event | Log; do not suppress deletion; flag for manual reconciliation |

---

### BC-AI-2 — Prediction

---

#### CONTRACT B-AI-2-1: `ai.generate_prediction.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.generate_prediction.v1` |
| Owning BC | BC-AI-2 — Prediction |
| Aggregate | Prediction (`ai.predictions`) |
| Operation template | 21.4 Command / 21.5 System |
| Actor | AI Agent / System |

**(2) Purpose**

Derive a non-authoritative predictive artifact for a requesting organization from entitled upstream data. Writes/refreshes `ai.predictions`. Advisory-only; no procurement decision.

**(3) Field Registry — `ai.predictions`**

| Field | Type | Null | Source | Notes |
|---|---|---|---|---|
| `id` | UUIDv7 | No | Platform Core | Primary key |
| `subject_org_id` | UUIDv7 | No | Identity | Requesting organization |
| `entity_ref_id` | UUIDv7 | No | Caller | Entity being predicted for |
| `entity_ref_type` | varchar(64) | No | Caller | Upstream discriminator |
| `result_jsonb` | jsonb | No | AI derivation | Prediction payload; structure model-version-dependent |
| `model_version` | varchar(64) | No | AI runtime | Provenance |
| `generated_at` | timestamptz | No | System clock | |
| `expires_at` | timestamptz | No | `generated_at + policy.ai.pred.ttl_seconds` | `[ESC-AI-POLICY]` |
| `ai_idempotency_key` | UUIDv7 | No | Caller / System | |
| `actor_type` | varchar(32) | No | Runtime | `ai_agent` or `system` |

**(4) Value Objects**

None enumerated in Doc-2 §2 for BC-AI-2. None invented.

**(5) Read Model**

Not applicable — write contract. Read models in B-AI-2-2 and B-AI-2-3.

**(6) Idempotency**

Key: `(subject_org_id, entity_ref_id, model_version)`. Upsert semantics identical to B-AI-1-1. Unique index enforces key.

**(7) Concurrency**

Last-writer-wins optimistic upsert (B.11). Safe for concurrent regeneration.

**(8) Retention & TTL**

`expires_at = generated_at + policy.ai.pred.ttl_seconds` (`[ESC-AI-POLICY]`). Hard delete on expiry by `ai.expire_predictions.v1`.

**(9) Index Strategy**

| Index | Columns | Purpose |
|---|---|---|
| `ai_pred_org_entity_idx` | `(subject_org_id, entity_ref_id)` | Point-lookup and filtered listing |
| `ai_pred_org_expires_idx` | `(subject_org_id, expires_at)` | Expiry sweep (org-scoped) |
| `ai_pred_expires_idx` | `(expires_at)` WHERE `expires_at < now()` | Global cache-maintenance sweep |
| `ai_pred_model_idx` | `(subject_org_id, entity_ref_id, model_version)` UNIQUE | Idempotency |

**(10) Request Schema**

```
ai.generate_prediction.v1 — Request
  subject_org_id:     UUIDv7   required
  entity_ref_id:      UUIDv7   required
  entity_ref_type:    string   required
  model_version:      string   optional
  ai_idempotency_key: UUIDv7   optional
  force_refresh:      boolean  optional
```

**(11) Response Schema**

```
ai.generate_prediction.v1 — Response
  prediction_id:      UUIDv7
  subject_org_id:     UUIDv7
  entity_ref_id:      UUIDv7
  model_version:      string
  generated_at:       timestamptz
  expires_at:         timestamptz
  ai_idempotency_key: UUIDv7
  status:             string   // "generated" | "refreshed"
// 21.5 System: Response: none
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-2-001` | PERMISSION | `check_permission` denied | Reject; 403-class |
| `E-AI-2-002` | VALIDATION | `subject_org_id` or `entity_ref_id` malformed | Reject; 400-class |
| `E-AI-2-003` | VALIDATION | `entity_ref_type` absent or unrecognized | Reject; 400-class |
| `E-AI-2-004` | SYSTEM | Model derivation failure | 5xx-class; no partial write; `[ESC-AI-AUDIT]` |
| `E-AI-2-005` | SYSTEM | Upstream data read failure | 5xx-class; retry eligible |
| `E-AI-2-006` | SYSTEM | Audit write failure | 5xx-class; roll back |

---

#### CONTRACT B-AI-2-2: `ai.get_prediction.v1`

*K-PA-HR-01 applied.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.get_prediction.v1` |
| Owning BC | BC-AI-2 — Prediction |
| Aggregate | Prediction (`ai.predictions`) |
| Operation template | 21.3 Query |
| Actor | User / System |

**(2) Purpose**

Return a single Prediction artifact by `prediction_id` for the requesting organization.

**(3) Field Registry**

Source: `ai.predictions`. Read model fields in (5).

**(4) Value Objects**

None for BC-AI-2.

**(5) Read Model**

```
PredictionDetail
  prediction_id:   UUIDv7
  subject_org_id:  UUIDv7
  entity_ref_id:   UUIDv7
  entity_ref_type: string
  result_jsonb:    jsonb        // returned as opaque payload; structure model-version-dependent
  model_version:   string
  generated_at:    timestamptz
  expires_at:      timestamptz
  is_expired:      boolean
```

**(6) Idempotency**

Inherently idempotent (read).

**(7) Concurrency**

Read-only; snapshot read.

**(8) Retention & TTL**

Expired rows returned with `is_expired: true` until swept.

**(9) Index Strategy**

Primary key on `id`; `ai_pred_org_entity_idx` for entity-scoped lookup.

**(10) Request Schema**

```
ai.get_prediction.v1 — Request
  prediction_id:   UUIDv7   required
  subject_org_id:  UUIDv7   required
```

**(11) Response Schema**

```
ai.get_prediction.v1 — Response
  found:       boolean
  prediction:  PredictionDetail | null
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-2-010` | PERMISSION | Tenancy mismatch (`subject_org_id` ≠ row's) | 403-class |
| `E-AI-2-011` | VALIDATION | `prediction_id` malformed | 400-class |
| `E-AI-2-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-2-013` | SYSTEM | Database read failure | 5xx-class; retry eligible |

---

#### CONTRACT B-AI-2-3: `ai.list_predictions.v1`

*K-PA-HR-01 applied.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.list_predictions.v1` |
| Owning BC | BC-AI-2 — Prediction |
| Aggregate | Prediction (`ai.predictions`) |
| Operation template | 21.3 Query |
| Actor | User / System |

**(2) Purpose**

Return a paginated collection of Prediction artifacts for the requesting organization.

**(3) Field Registry**

Source: `ai.predictions`.

**(4) Value Objects**

None for BC-AI-2.

**(5) Read Model**

```
PredictionSummary
  prediction_id:   UUIDv7
  entity_ref_id:   UUIDv7
  entity_ref_type: string
  model_version:   string
  generated_at:    timestamptz
  expires_at:      timestamptz
  is_expired:      boolean
  // result_jsonb omitted from list response for payload efficiency;
  // callers use get_prediction to retrieve full payload

PredictionListResponse
  items:       PredictionSummary[]
  total_count: integer
  page_cursor: string | null
  page_size:   integer
```

**(6) Idempotency**

Inherently idempotent (read).

**(7) Concurrency**

Read-only; cursor-based pagination stable within snapshot; cursor encodes `(generated_at DESC, id)`.

**(8) Retention & TTL**

Default excludes expired rows; `include_expired: true` to include.

**(9) Index Strategy**

`ai_pred_org_entity_idx`; `ai_pred_org_expires_idx`.

**(10) Request Schema**

```
ai.list_predictions.v1 — Request
  subject_org_id:  UUIDv7   required
  entity_ref_id:   UUIDv7   optional
  entity_ref_type: string   optional
  include_expired: boolean  optional  // default false
  page_size:       integer  optional  // default 20; max 100
  page_cursor:     string   optional
```

**(11) Response Schema**

```
ai.list_predictions.v1 — Response
  items:       PredictionSummary[]
  total_count: integer
  page_cursor: string | null
  page_size:   integer
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-2-020` | PERMISSION | `check_permission` denied | 403-class; empty list |
| `E-AI-2-021` | VALIDATION | `subject_org_id` malformed | 400-class |
| `E-AI-2-022` | VALIDATION | `page_size` out of range | 400-class |
| `E-AI-2-023` | VALIDATION | `page_cursor` malformed | 400-class |
| `E-AI-2-024` | SYSTEM | Database read failure | 5xx-class |

---

#### CONTRACT B-AI-2-4: `ai.expire_predictions.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.expire_predictions.v1` |
| Owning BC | BC-AI-2 — Prediction |
| Aggregate | Prediction (`ai.predictions`) |
| Operation template | 21.5 System |
| Actor | System |

**(2) Purpose**

Invalidate and hard-delete expired `ai.predictions` rows (cache maintenance).

**(3–5) Field Registry / Value Objects / Read Model**

Operates on `ai.predictions`; deletes rows; no read model; no VOs.

**(6) Idempotency**

Idempotent (sweep of expired rows safe to repeat).

**(7) Concurrency**

Row-level lock on deleted rows; concurrent regeneration safe (same logic as B-AI-1-4).

**(8) Retention & TTL**

Deletes rows where `expires_at < now()`.

**(9) Index Strategy**

`ai_pred_expires_idx` partial index `(expires_at)` WHERE `expires_at < now()`.

**(10) Request Schema**

```
ai.expire_predictions.v1 — Request
  batch_size: integer  optional
  dry_run:    boolean  optional
```

**(11) Response Schema**

```
21.5 System — Response: none
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-2-030` | SYSTEM | Database delete failure | Log; retry next cycle; `[ESC-AI-AUDIT]` |
| `E-AI-2-031` | SYSTEM | Audit write failure | Log; do not suppress deletion |

---

### BC-AI-3 — Classification Result

---

#### CONTRACT B-AI-3-1: `ai.generate_classification.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.generate_classification.v1` |
| Owning BC | BC-AI-3 — Classification Result |
| Aggregate | Classification Result (`ai.classification_results`) |
| Operation template | 21.4 Command / 21.5 System |
| Actor | AI Agent / System |

**(2) Purpose**

Derive a non-authoritative category/classification output (RFQ-structuring / category-assist support) for a requesting organization. Writes/refreshes `ai.classification_results`. The authoritative category remains Marketplace's; the authoritative RFQ remains RFQ's. This artifact is advisory support only.

**(3) Field Registry — `ai.classification_results`**

| Field | Type | Null | Source | Notes |
|---|---|---|---|---|
| `id` | UUIDv7 | No | Platform Core | Primary key |
| `subject_org_id` | UUIDv7 | No | Identity | Requesting organization |
| `entity_ref_id` | UUIDv7 | No | Caller | Entity being classified (rfq_id, item_id, etc.) |
| `entity_ref_type` | varchar(64) | No | Caller | Upstream discriminator |
| `result_jsonb` | jsonb | No | AI derivation | Classification payload; structure model-version-dependent |
| `model_version` | varchar(64) | No | AI runtime | Provenance |
| `generated_at` | timestamptz | No | System clock | |
| `expires_at` | timestamptz | No | `generated_at + policy.ai.cls.ttl_seconds` | `[ESC-AI-POLICY]` |
| `ai_idempotency_key` | UUIDv7 | No | Caller / System | |
| `actor_type` | varchar(32) | No | Runtime | `ai_agent` or `system` |

**(4) Value Objects**

None enumerated in Doc-2 §2 for BC-AI-3. None invented.

**(5) Read Model**

Not applicable — write contract.

**(6) Idempotency**

Key: `(subject_org_id, entity_ref_id, model_version)`. Upsert semantics identical to B-AI-1-1.

**(7) Concurrency**

Last-writer-wins optimistic upsert (B.11).

**(8) Retention & TTL**

`expires_at = generated_at + policy.ai.cls.ttl_seconds` (`[ESC-AI-POLICY]`). Hard delete by `ai.expire_classifications.v1`.

**(9) Index Strategy**

| Index | Columns | Purpose |
|---|---|---|
| `ai_cls_org_entity_idx` | `(subject_org_id, entity_ref_id)` | Point-lookup and listing |
| `ai_cls_org_expires_idx` | `(subject_org_id, expires_at)` | Expiry sweep |
| `ai_cls_expires_idx` | `(expires_at)` WHERE `expires_at < now()` | Global sweep |
| `ai_cls_model_idx` | `(subject_org_id, entity_ref_id, model_version)` UNIQUE | Idempotency |

**(10) Request Schema**

```
ai.generate_classification.v1 — Request
  subject_org_id:     UUIDv7   required
  entity_ref_id:      UUIDv7   required
  entity_ref_type:    string   required
  model_version:      string   optional
  ai_idempotency_key: UUIDv7   optional
  force_refresh:      boolean  optional
```

**(11) Response Schema**

```
ai.generate_classification.v1 — Response
  classification_id:  UUIDv7
  subject_org_id:     UUIDv7
  entity_ref_id:      UUIDv7
  model_version:      string
  generated_at:       timestamptz
  expires_at:         timestamptz
  ai_idempotency_key: UUIDv7
  status:             string   // "generated" | "refreshed"
// 21.5 System: Response: none
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-3-001` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-3-002` | VALIDATION | `subject_org_id` or `entity_ref_id` malformed | 400-class |
| `E-AI-3-003` | VALIDATION | `entity_ref_type` absent or unrecognized | 400-class |
| `E-AI-3-004` | SYSTEM | Model derivation failure | 5xx-class; no partial write; `[ESC-AI-AUDIT]` |
| `E-AI-3-005` | SYSTEM | Upstream data read failure | 5xx-class; retry eligible |
| `E-AI-3-006` | SYSTEM | Audit write failure | 5xx-class; roll back |

---

#### CONTRACT B-AI-3-2: `ai.get_classification.v1`

*K-PA-HR-01 applied.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.get_classification.v1` |
| Owning BC | BC-AI-3 — Classification Result |
| Aggregate | Classification Result (`ai.classification_results`) |
| Operation template | 21.3 Query |
| Actor | User / System |

**(2) Purpose**

Return a single Classification Result artifact by `classification_id` for the requesting organization. Consumed by Marketplace/RFQ surfaces as non-authoritative category support (DF-AI-2/3).

**(3) Field Registry**

Source: `ai.classification_results`.

**(4) Value Objects**

None for BC-AI-3.

**(5) Read Model**

```
ClassificationDetail
  classification_id: UUIDv7
  subject_org_id:    UUIDv7
  entity_ref_id:     UUIDv7
  entity_ref_type:   string
  result_jsonb:      jsonb        // opaque classification payload
  model_version:     string
  generated_at:      timestamptz
  expires_at:        timestamptz
  is_expired:        boolean
```

**(6) Idempotency**

Inherently idempotent (read).

**(7) Concurrency**

Read-only; snapshot read.

**(8) Retention & TTL**

Expired rows returned with `is_expired: true` until swept.

**(9) Index Strategy**

Primary key on `id`; `ai_cls_org_entity_idx`.

**(10) Request Schema**

```
ai.get_classification.v1 — Request
  classification_id: UUIDv7   required
  subject_org_id:    UUIDv7   required
```

**(11) Response Schema**

```
ai.get_classification.v1 — Response
  found:          boolean
  classification: ClassificationDetail | null
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-3-010` | PERMISSION | Tenancy mismatch | 403-class |
| `E-AI-3-011` | VALIDATION | `classification_id` malformed | 400-class |
| `E-AI-3-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-3-013` | SYSTEM | Database read failure | 5xx-class |

---

#### CONTRACT B-AI-3-3: `ai.list_classifications.v1`

*K-PA-HR-01 applied.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.list_classifications.v1` |
| Owning BC | BC-AI-3 — Classification Result |
| Aggregate | Classification Result (`ai.classification_results`) |
| Operation template | 21.3 Query |
| Actor | User / System |

**(2) Purpose**

Return a paginated collection of Classification Result artifacts for the requesting organization. Supports RFQ-structuring and category-assist surfaces (non-authoritative).

**(3) Field Registry**

Source: `ai.classification_results`.

**(4) Value Objects**

None for BC-AI-3.

**(5) Read Model**

```
ClassificationSummary
  classification_id: UUIDv7
  entity_ref_id:     UUIDv7
  entity_ref_type:   string
  model_version:     string
  generated_at:      timestamptz
  expires_at:        timestamptz
  is_expired:        boolean
  // result_jsonb omitted from list; use get_classification for full payload

ClassificationListResponse
  items:       ClassificationSummary[]
  total_count: integer
  page_cursor: string | null
  page_size:   integer
```

**(6) Idempotency**

Inherently idempotent (read).

**(7) Concurrency**

Read-only; cursor encodes `(generated_at DESC, id)`.

**(8) Retention & TTL**

Default excludes expired rows; `include_expired: true` to include.

**(9) Index Strategy**

`ai_cls_org_entity_idx`; `ai_cls_org_expires_idx`.

**(10) Request Schema**

```
ai.list_classifications.v1 — Request
  subject_org_id:  UUIDv7   required
  entity_ref_id:   UUIDv7   optional
  entity_ref_type: string   optional
  include_expired: boolean  optional
  page_size:       integer  optional  // default 20; max 100
  page_cursor:     string   optional
```

**(11) Response Schema**

```
ai.list_classifications.v1 — Response
  items:       ClassificationSummary[]
  total_count: integer
  page_cursor: string | null
  page_size:   integer
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-3-020` | PERMISSION | `check_permission` denied | 403-class; empty list |
| `E-AI-3-021` | VALIDATION | `subject_org_id` malformed | 400-class |
| `E-AI-3-022` | VALIDATION | `page_size` out of range | 400-class |
| `E-AI-3-023` | VALIDATION | `page_cursor` malformed | 400-class |
| `E-AI-3-024` | SYSTEM | Database read failure | 5xx-class |

---

#### CONTRACT B-AI-3-4: `ai.expire_classifications.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.expire_classifications.v1` |
| Owning BC | BC-AI-3 — Classification Result |
| Aggregate | Classification Result (`ai.classification_results`) |
| Operation template | 21.5 System |
| Actor | System |

**(2) Purpose**

Invalidate and hard-delete expired `ai.classification_results` rows (cache maintenance).

**(3–5) Field Registry / Value Objects / Read Model**

Operates on `ai.classification_results`; deletes rows; no read model; no VOs.

**(6) Idempotency**

Idempotent (sweep of expired rows safe to repeat).

**(7) Concurrency**

Row-level lock; concurrent regeneration safe.

**(8) Retention & TTL**

Deletes rows where `expires_at < now()`.

**(9) Index Strategy**

`ai_cls_expires_idx` partial index `(expires_at)` WHERE `expires_at < now()`.

**(10) Request Schema**

```
ai.expire_classifications.v1 — Request
  batch_size: integer  optional
  dry_run:    boolean  optional
```

**(11) Response Schema**

```
21.5 System — Response: none
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-3-030` | SYSTEM | Database delete failure | Log; retry next cycle; `[ESC-AI-AUDIT]` |
| `E-AI-3-031` | SYSTEM | Audit write failure | Log; do not suppress deletion |

---

### BC-AI-4 — Similar Vendor Result

---

#### CONTRACT B-AI-4-1: `ai.generate_similar_vendors.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.generate_similar_vendors.v1` |
| Owning BC | BC-AI-4 — Similar Vendor Result |
| Aggregate | Similar Vendor Result (`ai.similar_vendor_results`) |
| Operation template | 21.4 Command / 21.5 System |
| Actor | AI Agent / System |

**(2) Purpose**

Derive a non-authoritative similar-vendor / similarity-cache artifact for a requesting organization from entitled vendor data. Writes/refreshes `ai.similar_vendor_results`. Advisory-only; Marketplace owns vendor data and authority.

**(3) Field Registry — `ai.similar_vendor_results`**

| Field | Type | Null | Source | Notes |
|---|---|---|---|---|
| `id` | UUIDv7 | No | Platform Core | Primary key |
| `subject_org_id` | UUIDv7 | No | Identity | Requesting organization |
| `entity_ref_id` | UUIDv7 | No | Caller | Anchor vendor / entity UUID |
| `entity_ref_type` | varchar(64) | No | Caller | Upstream discriminator (e.g., `vendor`) |
| `result_jsonb` | jsonb | No | AI derivation | Similarity payload (list of similar vendor UUIDs + similarity signals); structure model-version-dependent |
| `model_version` | varchar(64) | No | AI runtime | Provenance |
| `generated_at` | timestamptz | No | System clock | |
| `expires_at` | timestamptz | No | `generated_at + policy.ai.sim.ttl_seconds` | `[ESC-AI-POLICY]` |
| `ai_idempotency_key` | UUIDv7 | No | Caller / System | |
| `actor_type` | varchar(32) | No | Runtime | `ai_agent` or `system` |

`result_jsonb` stores derived similarity result only (bare UUIDv7 references to similar vendors — not copies of vendor records; Doc-4A §4.3/§8.4). Marketplace owns the vendor records; AI references by UUID only.

**(4) Value Objects**

None enumerated in Doc-2 §2 for BC-AI-4. None invented.

**(5) Read Model**

Not applicable — write contract.

**(6) Idempotency**

Key: `(subject_org_id, entity_ref_id, model_version)`. Upsert semantics identical to B-AI-1-1.

**(7) Concurrency**

Last-writer-wins optimistic upsert (B.11).

**(8) Retention & TTL**

`expires_at = generated_at + policy.ai.sim.ttl_seconds` (`[ESC-AI-POLICY]`). Hard delete by `ai.expire_similar_vendors.v1`.

**(9) Index Strategy**

| Index | Columns | Purpose |
|---|---|---|
| `ai_sim_org_entity_idx` | `(subject_org_id, entity_ref_id)` | Point-lookup and listing |
| `ai_sim_org_expires_idx` | `(subject_org_id, expires_at)` | Expiry sweep |
| `ai_sim_expires_idx` | `(expires_at)` WHERE `expires_at < now()` | Global sweep |
| `ai_sim_model_idx` | `(subject_org_id, entity_ref_id, model_version)` UNIQUE | Idempotency |

**(10) Request Schema**

```
ai.generate_similar_vendors.v1 — Request
  subject_org_id:     UUIDv7   required
  entity_ref_id:      UUIDv7   required   // anchor vendor UUID
  entity_ref_type:    string   required   // e.g., "vendor"
  model_version:      string   optional
  ai_idempotency_key: UUIDv7   optional
  force_refresh:      boolean  optional
```

**(11) Response Schema**

```
ai.generate_similar_vendors.v1 — Response
  similar_vendor_result_id: UUIDv7
  subject_org_id:           UUIDv7
  entity_ref_id:            UUIDv7
  model_version:            string
  generated_at:             timestamptz
  expires_at:               timestamptz
  ai_idempotency_key:       UUIDv7
  status:                   string   // "generated" | "refreshed"
// 21.5 System: Response: none
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-4-001` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-4-002` | VALIDATION | `subject_org_id` or `entity_ref_id` malformed | 400-class |
| `E-AI-4-003` | VALIDATION | `entity_ref_type` absent or unrecognized | 400-class |
| `E-AI-4-004` | SYSTEM | Model derivation failure | 5xx-class; no partial write; `[ESC-AI-AUDIT]` |
| `E-AI-4-005` | SYSTEM | Upstream data read failure (DF-AI-2 Marketplace) | 5xx-class; retry eligible |
| `E-AI-4-006` | SYSTEM | Audit write failure | 5xx-class; roll back |

---

#### CONTRACT B-AI-4-2: `ai.get_similar_vendors.v1`

*K-PA-HR-01 applied.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.get_similar_vendors.v1` |
| Owning BC | BC-AI-4 — Similar Vendor Result |
| Aggregate | Similar Vendor Result (`ai.similar_vendor_results`) |
| Operation template | 21.3 Query |
| Actor | User / System |

**(2) Purpose**

Return a single Similar Vendor Result artifact by `similar_vendor_result_id` for the requesting organization.

**(3) Field Registry**

Source: `ai.similar_vendor_results`.

**(4) Value Objects**

None for BC-AI-4.

**(5) Read Model**

```
SimilarVendorDetail
  similar_vendor_result_id: UUIDv7
  subject_org_id:           UUIDv7
  entity_ref_id:            UUIDv7
  entity_ref_type:          string
  result_jsonb:             jsonb        // opaque similarity payload (bare UUID refs to similar vendors)
  model_version:            string
  generated_at:             timestamptz
  expires_at:               timestamptz
  is_expired:               boolean
```

**(6) Idempotency**

Inherently idempotent (read).

**(7) Concurrency**

Read-only; snapshot read.

**(8) Retention & TTL**

Expired rows returned with `is_expired: true` until swept.

**(9) Index Strategy**

Primary key on `id`; `ai_sim_org_entity_idx`.

**(10) Request Schema**

```
ai.get_similar_vendors.v1 — Request
  similar_vendor_result_id: UUIDv7   required
  subject_org_id:           UUIDv7   required
```

**(11) Response Schema**

```
ai.get_similar_vendors.v1 — Response
  found:               boolean
  similar_vendor_result: SimilarVendorDetail | null
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-4-010` | PERMISSION | Tenancy mismatch | 403-class |
| `E-AI-4-011` | VALIDATION | `similar_vendor_result_id` malformed | 400-class |
| `E-AI-4-012` | PERMISSION | `check_permission` denied | 403-class |
| `E-AI-4-013` | SYSTEM | Database read failure | 5xx-class |

---

#### CONTRACT B-AI-4-3: `ai.list_similar_vendors.v1`

*K-PA-HR-01 applied.*

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.list_similar_vendors.v1` |
| Owning BC | BC-AI-4 — Similar Vendor Result |
| Aggregate | Similar Vendor Result (`ai.similar_vendor_results`) |
| Operation template | 21.3 Query |
| Actor | User / System |

**(2) Purpose**

Return a paginated collection of Similar Vendor Result artifacts for the requesting organization, optionally filtered by anchor entity.

**(3) Field Registry**

Source: `ai.similar_vendor_results`.

**(4) Value Objects**

None for BC-AI-4.

**(5) Read Model**

```
SimilarVendorSummary
  similar_vendor_result_id: UUIDv7
  entity_ref_id:            UUIDv7
  entity_ref_type:          string
  model_version:            string
  generated_at:             timestamptz
  expires_at:               timestamptz
  is_expired:               boolean
  // result_jsonb omitted from list; use get_similar_vendors for full payload

SimilarVendorListResponse
  items:       SimilarVendorSummary[]
  total_count: integer
  page_cursor: string | null
  page_size:   integer
```

**(6) Idempotency**

Inherently idempotent (read).

**(7) Concurrency**

Read-only; cursor encodes `(generated_at DESC, id)`.

**(8) Retention & TTL**

Default excludes expired rows; `include_expired: true` to include.

**(9) Index Strategy**

`ai_sim_org_entity_idx`; `ai_sim_org_expires_idx`.

**(10) Request Schema**

```
ai.list_similar_vendors.v1 — Request
  subject_org_id:  UUIDv7   required
  entity_ref_id:   UUIDv7   optional
  entity_ref_type: string   optional
  include_expired: boolean  optional
  page_size:       integer  optional  // default 20; max 100
  page_cursor:     string   optional
```

**(11) Response Schema**

```
ai.list_similar_vendors.v1 — Response
  items:       SimilarVendorSummary[]
  total_count: integer
  page_cursor: string | null
  page_size:   integer
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-4-020` | PERMISSION | `check_permission` denied | 403-class; empty list |
| `E-AI-4-021` | VALIDATION | `subject_org_id` malformed | 400-class |
| `E-AI-4-022` | VALIDATION | `page_size` out of range | 400-class |
| `E-AI-4-023` | VALIDATION | `page_cursor` malformed | 400-class |
| `E-AI-4-024` | SYSTEM | Database read failure | 5xx-class |

---

#### CONTRACT B-AI-4-4: `ai.expire_similar_vendors.v1`

**(1) Identity**

| Property | Value |
|---|---|
| Contract ID | `ai.expire_similar_vendors.v1` |
| Owning BC | BC-AI-4 — Similar Vendor Result |
| Aggregate | Similar Vendor Result (`ai.similar_vendor_results`) |
| Operation template | 21.5 System |
| Actor | System |

**(2) Purpose**

Invalidate and hard-delete expired `ai.similar_vendor_results` rows (cache maintenance).

**(3–5) Field Registry / Value Objects / Read Model**

Operates on `ai.similar_vendor_results`; deletes rows; no read model; no VOs.

**(6) Idempotency**

Idempotent (sweep of expired rows safe to repeat).

**(7) Concurrency**

Row-level lock; concurrent regeneration safe.

**(8) Retention & TTL**

Deletes rows where `expires_at < now()`.

**(9) Index Strategy**

`ai_sim_expires_idx` partial index `(expires_at)` WHERE `expires_at < now()`.

**(10) Request Schema**

```
ai.expire_similar_vendors.v1 — Request
  batch_size: integer  optional
  dry_run:    boolean  optional
```

**(11) Response Schema**

```
21.5 System — Response: none
```

**(12) Error Matrix**

| Code | Tier | Condition | Action |
|---|---|---|---|
| `E-AI-4-030` | SYSTEM | Database delete failure | Log; retry next cycle; `[ESC-AI-AUDIT]` |
| `E-AI-4-031` | SYSTEM | Audit write failure | Log; do not suppress deletion |

---

## §K17-B — Pass-B Structure Summary

**Module 9 — AI Layer** · schema `ai` · namespace `ai_` · **4 bounded contexts** (BC-AI-1…4) ↔ **4 derived aggregates**, one-to-one.

**Contracts hardened (Pass-B): 16**

| BC | Contract | Template | Actor |
|---|---|---|---|
| BC-AI-1 | `ai.generate_recommendation.v1` | 21.4/21.5 | AI Agent / System |
| BC-AI-1 | `ai.get_recommendation.v1` | 21.3 | User / System |
| BC-AI-1 | `ai.list_recommendations.v1` | 21.3 | User / System |
| BC-AI-1 | `ai.expire_recommendations.v1` | 21.5 | System |
| BC-AI-2 | `ai.generate_prediction.v1` | 21.4/21.5 | AI Agent / System |
| BC-AI-2 | `ai.get_prediction.v1` | 21.3 | User / System |
| BC-AI-2 | `ai.list_predictions.v1` | 21.3 | User / System |
| BC-AI-2 | `ai.expire_predictions.v1` | 21.5 | System |
| BC-AI-3 | `ai.generate_classification.v1` | 21.4/21.5 | AI Agent / System |
| BC-AI-3 | `ai.get_classification.v1` | 21.3 | User / System |
| BC-AI-3 | `ai.list_classifications.v1` | 21.3 | User / System |
| BC-AI-3 | `ai.expire_classifications.v1` | 21.5 | System |
| BC-AI-4 | `ai.generate_similar_vendors.v1` | 21.4/21.5 | AI Agent / System |
| BC-AI-4 | `ai.get_similar_vendors.v1` | 21.3 | User / System |
| BC-AI-4 | `ai.list_similar_vendors.v1` | 21.3 | User / System |
| BC-AI-4 | `ai.expire_similar_vendors.v1` | 21.5 | System |

**K-PA-HR-01 resolved:** all four BC read surfaces split into independent `get_*` (single-ID point-lookup, typed read model, per-record error matrix, no pagination) and `list_*` (paginated collection, summary read model, filter parameters, collection-level error matrix) contracts.

**Value objects:** Score (VO-1) + Basis (VO-2) specified for BC-AI-1 (Doc-2 §2); none invented for BC-AI-2/3/4.

**Idempotency:** `(subject_org_id, entity_ref_id, model_version)` upsert key on all `generate_*`; unique index enforces.

**Concurrency:** last-writer-wins optimistic upsert on all `generate_*`; read-only snapshot on all `get_*`/`list_*`.

**Retention:** `expires_at = generated_at + policy.ai.<bc>.ttl_seconds` (`[ESC-AI-POLICY]` × 4 — keys not coined; additive channel Doc-3 §12.2).

**Escalation carried (all four):** `[ESC-AI-EVENT]` · `[ESC-AI-SLUG]` · `[ESC-AI-AUDIT]` · `[ESC-AI-POLICY]` — none resolved; none coined anything.

**Frozen Board decisions: unchanged.** Q1 (four BCs), Q2 (Matching-Assist → BC-AI-1; advisory-only; RFQ decides), Q3 (pull/derive-on-demand; no event-consumption contract). Moat and firewall intact. Master Architecture §18 Invariant 12 applied throughout.

Nothing invented. No slug, event, audit action, POLICY key, aggregate, BC, or ownership created.

---

*End of Doc-4K — AI Layer — Content Pass-B v1.0. 16 hardened contracts (4 generate + 4 get + 4 list + 4 expire) across BC-AI-1 Recommendation · BC-AI-2 Prediction · BC-AI-3 Classification Result · BC-AI-4 Similar Vendor Result. Pass-B board directives applied: K-PA-HR-01 `get`/`list` split (confirmed); VO-1 Score + VO-2 Basis specified (Doc-2 §2); 12-section hardening complete per contract. Baseline: Doc-4K_PassA_Content_v1.0 + Doc-4K_PassA_Independent_Hard_Review_v1.0 + Doc-4K_PassA_Board_Disposition_v1.0. Corpus authority: Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A → Doc-4B–4J (FROZEN) → Doc-4K_Structure_FROZEN_v1.0 → Doc-4K_PassA_Content_v1.0. Frozen decisions Q1/Q2/Q3 applied without modification. Moat + firewall intact. No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template created. Ready for Pass-B Independent Hard Review.*
