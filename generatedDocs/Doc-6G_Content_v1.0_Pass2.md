# Doc-6G — M5 Trust (`trust`) Schema Realization — Content v1.0 **Pass-2** (§3.2 Trust Score · §3.3 Performance Score)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §3.2 + §3.3. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | **Trust Score** (`trust_scores` + `trust_score_history`) + **Performance Score** (`performance_scores` + `performance_score_history` + `performance_inputs`) — **System-written, never hand-edited**; the **firewall** (independent signals); the idempotent Operations input consumer |
| Authority | `Doc-2 §6/§8/§10.6` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (consumed); `Doc-6F` (Operations events → inputs); `Doc-4G` (M5 ownership); `Doc-3 v1.3` (`trust.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.6; `freeze_state`/`input_type`/`source_type` sets verbatim; `band`/`level` = text (Doc-2 enumerates no values); physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("trust")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.2 — Trust Score (System-written; freeze; history)

### §3.2.1 `trust.trust_scores` (head; `UNIQUE(vendor_profile_id)`; System-written)
Realizes Doc-2 §10.6. `vendor_profile_id` bare UUID → M2 (UNIQUE); `score 0–100`; `band`; `freeze_state`; **NO SD**; **System-written only**.

```sql
CREATE TYPE trust.score_freeze_state AS ENUM ('none','frozen');  -- [Doc-2 §10.6 binding]

CREATE TABLE trust.trust_scores (
  id uuid NOT NULL, vendor_profile_id uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  score smallint NOT NULL,                                    -- [Doc-2 §10.6] 0–100
  band text NOT NULL,                                         -- [Doc-2 §10.6] (no enum values declared → text [§2.5])
  trust_formula_version text NOT NULL,                        -- [Doc-2 §10.6]
  trust_score_updated_at timestamptz NOT NULL DEFAULT now(),  -- [Doc-2 §10.6]
  freeze_state trust.score_freeze_state NOT NULL DEFAULT 'none',  -- [Doc-2 §10.6]
  freeze_reason text, frozen_at timestamptz,                  -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                           -- [Doc-2 §0.2] = System actor (TR-CR3)
  CONSTRAINT trust_scores_pkey PRIMARY KEY (id),
  CONSTRAINT trust_scores_vendor_uq UNIQUE (vendor_profile_id),  -- [Doc-2 §10.6]
  CONSTRAINT trust_scores_range_chk CHECK (score BETWEEN 0 AND 100)  -- [Doc-2 §10.6 binding]
);
-- vendor_profile_id immutable; score/band/freeze updated by System (column-scoped):
CREATE TRIGGER trust_scores_immutable BEFORE UPDATE OR DELETE ON trust.trust_scores FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','vendor_profile_id','created_at','created_by');  -- [Doc-6B §4] identity frozen; DELETE blocked
```
- **System-written, never hand-edited (TR-CR3):** **no write policy** (§3.x) — the trust-scoring service (owner-role/`SECURITY DEFINER`) is the only writer. A score update **also appends a `trust_score_history` snapshot** in the **same txn**, and emits the band-reflection event (→ M2 `trust_band`). **Freeze:** `freeze_state='frozen'` → excluded from the M2 reflected band + matching. **Firewall:** **no column computed from Performance/Tier; no cross-score FK** (TR-CR4). **RLS:** admin read; System write (§3.x). **Prisma [§2.5]:** `TrustScore`, enum `ScoreFreezeState`.

### §3.2.2 `trust.trust_score_history` (append-only snapshots)
```sql
CREATE TABLE trust.trust_score_history (
  id uuid NOT NULL, trust_score_id uuid NOT NULL,             -- [Doc-6A §5.2] in-module FK
  vendor_profile_id uuid NOT NULL, score smallint NOT NULL, band text NOT NULL,  -- [Doc-2 §10.6] snapshot
  trust_formula_version text NOT NULL, snapshot_at timestamptz NOT NULL DEFAULT now(),  -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT trust_score_history_pkey PRIMARY KEY (id),
  CONSTRAINT trust_score_history_score_fk FOREIGN KEY (trust_score_id) REFERENCES trust.trust_scores(id),
  CONSTRAINT trust_score_history_range_chk CHECK (score BETWEEN 0 AND 100)
);
CREATE INDEX trust_score_history_vendor_idx ON trust.trust_score_history (vendor_profile_id, snapshot_at);  -- [§2.5]
CREATE TRIGGER trust_score_history_immutable BEFORE UPDATE OR DELETE ON trust.trust_score_history FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','trust_score_id','vendor_profile_id','score','band','trust_formula_version','snapshot_at','created_at','created_by');  -- [Doc-6B §4] append-only
```

## §3.3 — Performance Score (System-written; idempotent inputs; history)

### §3.3.1 `trust.performance_scores` (head; NULLABLE score = Not Rated; min-threshold gate)
Realizes Doc-2 §10.6. `vendor_profile_id` bare UUID → M2 (UNIQUE); `score 0–100 NULLABLE` (NULL = Not Rated); `components_jsonb` (6 weighted, renormalized); `min_threshold_met`; **NO SD**; **System-written**.

```sql
CREATE TABLE trust.performance_scores (
  id uuid NOT NULL, vendor_profile_id uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  score smallint,                                             -- [Doc-2 §10.6] 0–100 NULLABLE — NULL = Not Rated
  level text,                                                 -- [Doc-2 §10.6] (no enum values declared → text [§2.5])
  components_jsonb jsonb,                                     -- [Doc-2 §10.6] 6 weighted components (renormalized)
  performance_formula_version text NOT NULL,                 -- [Doc-2 §10.6]
  performance_score_updated_at timestamptz NOT NULL DEFAULT now(),  -- [Doc-2 §10.6]
  freeze_state trust.score_freeze_state NOT NULL DEFAULT 'none',  -- [Doc-2 §10.6]
  freeze_reason text, frozen_at timestamptz,
  min_threshold_met boolean NOT NULL DEFAULT false,          -- [Doc-2 §10.6] 5 responses OR 2 projects (gates score)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                           -- [Doc-2 §0.2] = System actor
  CONSTRAINT performance_scores_pkey PRIMARY KEY (id),
  CONSTRAINT performance_scores_vendor_uq UNIQUE (vendor_profile_id),
  CONSTRAINT performance_scores_range_chk CHECK (score IS NULL OR score BETWEEN 0 AND 100)  -- [Doc-2 §10.6]
);
CREATE TRIGGER performance_scores_immutable BEFORE UPDATE OR DELETE ON trust.performance_scores FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','vendor_profile_id','created_at','created_by');  -- [Doc-6B §4]
```
- **Not Rated (TR-CR7):** `score IS NULL` until `min_threshold_met` (5 responses OR 2 projects — service gate). **Firewall:** components are performance inputs only — **no Financial Tier, no Trust Score, no Buyer Vendor Status** in `components_jsonb` (TR-CR4). **System-written;** appends `performance_score_history` snapshot per update. **RLS:** admin read; System write (§3.x). **Prisma [§2.5]:** `PerformanceScore`.

### §3.3.2 `trust.performance_score_history` (append-only) · §3.3.3 `trust.performance_inputs` (idempotent Operations consumer)
```sql
CREATE TABLE trust.performance_score_history (
  id uuid NOT NULL, performance_score_id uuid NOT NULL, vendor_profile_id uuid NOT NULL,  -- [Doc-2 §10.6]
  score smallint, level text, performance_formula_version text NOT NULL, snapshot_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT performance_score_history_pkey PRIMARY KEY (id),
  CONSTRAINT performance_score_history_score_fk FOREIGN KEY (performance_score_id) REFERENCES trust.performance_scores(id),
  CONSTRAINT performance_score_history_range_chk CHECK (score IS NULL OR score BETWEEN 0 AND 100)
);
CREATE TRIGGER performance_score_history_immutable BEFORE UPDATE OR DELETE ON trust.performance_score_history FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','performance_score_id','vendor_profile_id','score','level','performance_formula_version','snapshot_at','created_at','created_by');  -- [Doc-6B §4]

CREATE TYPE trust.performance_input_type AS ENUM ('response','decline','non_response','delivery','feedback','dispute','completion');  -- [Doc-2 §10.6 binding]
CREATE TYPE trust.performance_source_type AS ENUM ('invitation','quotation','engagement','wcc');  -- [Doc-2 §10.6 binding]

CREATE TABLE trust.performance_inputs (
  id uuid NOT NULL, vendor_profile_id uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  source_entity_id uuid NOT NULL,                            -- [Doc-2 §10.6] polymorphic bare UUID (→ M3/M4)
  source_type trust.performance_source_type NOT NULL,        -- [Doc-2 §10.6] discriminator
  input_type trust.performance_input_type NOT NULL,          -- [Doc-2 §10.6]
  occurred_at timestamptz NOT NULL,                          -- [Doc-2 §10.6]
  value_jsonb jsonb,                                         -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §0.2] (NO SD — append-only; corrections = new rows, audited)
  CONSTRAINT performance_inputs_pkey PRIMARY KEY (id),
  CONSTRAINT performance_inputs_dedup_uq UNIQUE (source_type, source_entity_id, input_type)  -- [§2.5] idempotent consumer (one input per source+type)
);
CREATE INDEX performance_inputs_vendor_idx ON trust.performance_inputs (vendor_profile_id, input_type, occurred_at);  -- [§2.5]
CREATE TRIGGER performance_inputs_immutable BEFORE UPDATE OR DELETE ON trust.performance_inputs FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','vendor_profile_id','source_entity_id','source_type','input_type','occurred_at','value_jsonb','created_at','created_by');  -- [Doc-6B §4]
```
- **Idempotent Operations consumer (TR-CR7):** `delivery`/`feedback`/`dispute`/`completion` inputs are written by Trust as an **idempotent consumer** of the M4 events (`DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`); `UNIQUE(source_type, source_entity_id, input_type)` makes a replayed event a no-op. **Only delivered invitations** generate `response`/`non_response` (the M3 invitation-delivered fact, service-fed). **Corrections are audited new rows**, never edits (append-only). **`public_reviews` (Buyer Feedback) feed `feedback` inputs** within Trust (Pass-3). **RLS:** admin read; System write (§3.x). **Prisma [§2.5]:** `PerformanceScoreHistory`, `PerformanceInput`, enums.

## §3.x — Consolidated RLS DDL (Pass-2 — System-only writes; admin read)
```sql
-- trust_scores / trust_score_history / performance_scores / performance_score_history / performance_inputs:
-- admin READ only; NO write policy (System scoring service writes via owner-role/SECURITY DEFINER — TR-CR3). Pattern (s/<table>/):
ALTER TABLE trust.trust_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY trust_scores_read ON trust.trust_scores FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no FOR INSERT/UPDATE/DELETE policy on ANY of the five = no in-band write path; scores never hand-edited — Invariant #6.
--  trust_score_history / performance_scores / performance_score_history / performance_inputs: identical admin-read-only policy.
--  history/inputs UPDATE/DELETE also blocked by their immutability triggers.)
```
- **The public band is M2's reflection** (no public read here); **no write policy** on any score table = the System-actor-write firewall.

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: the 5-table set + columns (Doc-2 §10.6), `score 0–100` CHECK, performance `score` NULLABLE (Not Rated), `freeze_state`/`input_type`/`source_type` sets verbatim, the firewall (no cross-score column), idempotent inputs, append-only histories, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **SCORE-WRITE** any FOR INSERT/UPDATE/DELETE policy on a score table → hand-editable signal | BLOCKER (Invariant #6) | **FIXED** — §3.x: admin **read-only**; **no write policy** on all 5; System owner-role/`SECURITY DEFINER` writes; never hand-edited. |
| **FIREWALL** a `components_jsonb`/column carrying Financial Tier or Trust Score into Performance would breach the firewall | MAJOR (Invariant #6) | **FIXED** — §3.3.1: components are performance inputs only; **no Tier/Trust/Buyer-Status** column or FK; signals independent. |
| **INPUT-IDEM** `performance_inputs` could double-count on event replay | MAJOR | **FIXED** — `UNIQUE(source_type, source_entity_id, input_type)`; idempotent consumer (corrections = audited new rows). |
| **HIST-IMM** histories/inputs "append-only" without guards | MAJOR | **FIXED** — full append-only triggers via `core.raise_immutable_violation` (all cols); DELETE blocked. |
| **PERF-NULL** performance `score` NOT NULL would break Not-Rated | MINOR | **FIXED** — NULLABLE; `CHECK (score IS NULL OR 0–100)`; `min_threshold_met` gate. |
| **BAND-TEXT** `band`/`level` enum values not in Doc-2 | MINOR | **CONFIRMED text** — Doc-2 §10.6 names the columns but enumerates no values; realized as `text` (no coined enum); §2.5. |

**Net:** 1 BLOCKER (score hand-edit) + 3 MAJOR (firewall, idempotency, history immutability) fixed; 2 MINOR applied/confirmed. The score-write + firewall findings are load-bearing — Invariant #6's authoritative side. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6G Content Pass-2 (§3.2 Trust Score · §3.3 Performance Score) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the System-written Trust + Performance scores (no write policy = never hand-edited; freeze-state; per-update history snapshots; firewall — no cross-signal column/FU; Buyer Vendor Status never enters), the Not-Rated NULL gate (min-threshold), and the idempotent `performance_inputs` Operations consumer (UNIQUE dedup; append-only). Columns verbatim Doc-2 §10.6; states verbatim; `band`/`level` text; coins nothing. Next: Pass-3 (Fraud `fraud_signals` + Reviews `public_reviews`/`admin_ratings` + §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
