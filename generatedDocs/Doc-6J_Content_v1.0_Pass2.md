# Doc-6J — M8 Admin (`admin`) Schema Realization — Content v1.0 **Pass-2** (§3.3 Import · §3.4 Verification Tasks · §3.5 Outreach)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-2 — Independent Hard Review applied** (0 BLOCKER + 3 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §3.3 + §3.4 + §3.5. Next: Pass-3 |
| Date | 2026-06-26 |
| Realizes | **Import** (`import_jobs` + `import_rows` append-only) + **Verification Tasks** (`verification_tasks` — M8 work-item; decision in M5) + **Outreach** (`outreach_campaigns` + `outreach_contacts`) |
| Authority | `Doc-2 §10.9` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (consumed); `Doc-6G` (M5 verification decision); `Doc-4J` (M8 ownership); `Doc-3 v1.7` |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.9; `import_job_type`/`import_state`/`verification_task_state` sets verbatim; row-outcome = text (Doc-2 enumerates none). Carried: `[ESC-ADMIN-SCHEMA-OUTREACH]` (underspecified outreach columns) |
| DDL note | PostgreSQL 15+; Prisma `@@schema("admin")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.3 — Import

### §3.3.1 `admin.import_jobs` (job_type; state) · §3.3.2 `admin.import_rows` (append-only outcome)
Realizes Doc-2 §10.9. `import_jobs` `job_type(categories/vendor_seed)`; `import_rows` per-row outcome (`created_entity_id` → owning module); **NO SD; rows append-only**.

```sql
CREATE TYPE admin.import_job_type AS ENUM ('categories','vendor_seed');                -- [Doc-2 §10.9 binding]
CREATE TYPE admin.import_state AS ENUM ('queued','processing','completed','failed');   -- [Doc-2 §10.9 binding]

CREATE TABLE admin.import_jobs (
  id uuid NOT NULL, initiated_by uuid,                       -- [Doc-2 §10.9] bare UUID → M1 (staff)
  job_type admin.import_job_type NOT NULL,                   -- [Doc-2 §10.9]
  file_ref text,                                             -- [Doc-2 §10.9]
  state admin.import_state NOT NULL DEFAULT 'queued',        -- [Doc-2 §10.9]
  stats_jsonb jsonb,                                         -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT import_jobs_pkey PRIMARY KEY (id)
);
CREATE INDEX import_jobs_state_idx ON admin.import_jobs (state) WHERE state IN ('queued','processing');  -- [§2.5] work queue

CREATE TABLE admin.import_rows (
  id uuid NOT NULL, import_job_id uuid NOT NULL,             -- [Doc-6A §5.2] in-module FK
  created_entity_id uuid,                                    -- [Doc-2 §10.9] bare UUID → owning module (the created category/vendor)
  outcome text NOT NULL,                                     -- [Doc-2 §10.9] per-row outcome (no enumerated set → text [§2.5])
  errors_jsonb jsonb,                                        -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,  -- [Doc-2 §10.9] (NO SD — append-only)
  CONSTRAINT import_rows_pkey PRIMARY KEY (id),
  CONSTRAINT import_rows_job_fk FOREIGN KEY (import_job_id) REFERENCES admin.import_jobs(id)
);
CREATE INDEX import_rows_job_idx ON admin.import_rows (import_job_id);  -- [§2.5]
CREATE TRIGGER import_rows_immutable BEFORE UPDATE OR DELETE ON admin.import_rows FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','import_job_id','created_entity_id','outcome','errors_jsonb','created_at','created_by');  -- [Doc-6B §4] append-only
```
- **Import → owning module (AD-CR9):** the import **creates entities in the owning module via service** (categories → M2; vendor seed → M2); `created_entity_id` is a bare UUID to the created row; M8 records the per-row outcome (append-only). **RLS:** staff-only (§3.x). **Prisma [§2.5]:** `ImportJob`/`ImportRow`, enums.

## §3.4 — `admin.verification_tasks` (M8 work-item; decision in M5)
Realizes Doc-2 §10.9. `verification_record_id` → M5; `assigned_to` → M1; `state(queued/in_review/decided)`; **NO SD**. **The decision content lives in `trust.verification_decisions` (M5).**

```sql
CREATE TYPE admin.verification_task_state AS ENUM ('queued','in_review','decided');  -- [Doc-2 §10.9 binding]

CREATE TABLE admin.verification_tasks (
  id uuid NOT NULL,
  verification_record_id uuid NOT NULL,                     -- [Doc-2 §10.9] bare UUID → M5 trust.verification_records
  assigned_to uuid,                                         -- [Doc-2 §10.9] bare UUID → M1 (staff)
  state admin.verification_task_state NOT NULL DEFAULT 'queued',  -- [Doc-2 §10.9]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), created_by uuid, updated_by uuid,
  CONSTRAINT verification_tasks_pkey PRIMARY KEY (id)
);
CREATE INDEX verification_tasks_queue_idx ON admin.verification_tasks (state, assigned_to) WHERE state IN ('queued','in_review');  -- [§2.5] work queue
-- verification_record_id frozen; only state/assignment mutable (column-scoped):
CREATE TRIGGER verification_tasks_immutable BEFORE UPDATE OR DELETE ON admin.verification_tasks FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','verification_record_id','created_at','created_by');  -- [Doc-6B §4]
```
- **M8/M5 boundary (AD-CR11):** `verification_tasks` is the **Admin work-item/queue**; **the authoritative decision lives in `trust.verification_decisions`** (M5; `verification_task_id` references this row — Doc-6G §3.1.2). M8 owns the assignment/state (`decided` when M5 records the decision); M8 writes no M5 table (Admin-decides/owning-module-owns). **RLS:** staff-only (§3.x). **Prisma [§2.5]:** `VerificationTask`, enum.

## §3.5 — Outreach (`outreach_campaigns` + `outreach_contacts`)
Realizes Doc-2 §10.9. Invite-outreach pipeline; `outreach_contacts` target `vendor_claim_record_id`/`vendor_profile_id` (→M2); YES SD. Doc-2 describes only "invite outreach pipeline".

> **`[ESC-ADMIN-SCHEMA-OUTREACH]` — carried (corpus underspecification).** Doc-2 §10.9 gives the outreach pair as "invite outreach pipeline" with **no column list**. Inventing a typed campaign/contact schema would **coin**. **Interim:** `name` + `content_jsonb` (campaign) + the Doc-2-named target refs (contact). The durable column set is bound by **Doc-4J/Doc-5J** or admin-runtime — never invented here.

```sql
CREATE TABLE admin.outreach_campaigns (
  id uuid NOT NULL, name text NOT NULL,                     -- [§2.5] operator label (interim)
  content_jsonb jsonb,                                      -- [§2.5 / ESC-ADMIN-SCHEMA-OUTREACH] campaign content until DTO pinned
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.9] SD
  CONSTRAINT outreach_campaigns_pkey PRIMARY KEY (id)
);

CREATE TABLE admin.outreach_contacts (
  id uuid NOT NULL, outreach_campaign_id uuid NOT NULL,     -- [Doc-6A §5.2] in-module FK
  vendor_claim_record_id uuid,                              -- [Doc-2 §10.9] bare UUID → M2 (target)
  vendor_profile_id uuid,                                   -- [Doc-2 §10.9] bare UUID → M2 (target)
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT outreach_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT outreach_contacts_campaign_fk FOREIGN KEY (outreach_campaign_id) REFERENCES admin.outreach_campaigns(id)
);
CREATE INDEX outreach_contacts_campaign_idx ON admin.outreach_contacts (outreach_campaign_id) WHERE deleted_at IS NULL;  -- [§2.5]
```
- **Anti-coining:** only `name`/`content_jsonb` + the Doc-2-named target refs are realized; typed campaign fields **deferred** (`[ESC-ADMIN-SCHEMA-OUTREACH]`). **RLS:** staff-only (§3.x). **Prisma [§2.5]:** `OutreachCampaign`/`OutreachContact`.

## §3.x — Consolidated RLS DDL (Pass-2 — staff-only)
```sql
-- import_jobs / import_rows / verification_tasks / outreach_campaigns / outreach_contacts: STAFF-ONLY (pattern, s/<table>/)
ALTER TABLE admin.import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY import_jobs_staff ON admin.import_jobs FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- import_rows (append-only via trigger) / verification_tasks / outreach_campaigns / outreach_contacts: same staff-only policy.
```

---

## Review Disposition (Independent Hard Review — Pass-2)

Reviewer: independent. Verified CORRECT: the 5-table set + columns (Doc-2 §10.9), `import_job_type`/`import_state`/`verification_task_state` sets verbatim, the M8/M5 verification boundary, append-only import_rows, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **VTASK-OWN** M8 storing the verification decision would violate owning-module-owns | MAJOR | **FIXED** — §3.4: `verification_tasks` = work-item/queue only; the decision is M5's `trust.verification_decisions`; M8 writes no M5 table. |
| **IR-IMM** `import_rows` "append-only" without a guard | MAJOR | **FIXED** — full append-only trigger via `core.raise_immutable_violation` (all cols); DELETE blocked. |
| **OUT-COIN** outreach typed schema would be invented (Doc-2 gives only "invite outreach pipeline") | MAJOR | **FIXED** — `content_jsonb` interim; **`[ESC-ADMIN-SCHEMA-OUTREACH]`** carried (bind via Doc-4J/Doc-5J or admin-runtime). |
| **ROW-TEXT** import-row `outcome` enum values not in Doc-2 | MINOR | **CONFIRMED text** — Doc-2 "per-row outcome" (no enumerated set); `text` (no coined enum). |
| **VTASK-IMM** `verification_tasks` identity immutability | MINOR | **CONFIRMED** — column-scoped (verification_record_id frozen; state/assignment mutable). |

**Net:** 0 BLOCKER; 3 MAJOR (verification owning-module, import_rows immutability, outreach anti-coining) fixed; 2 MINOR confirmed. M8/M5 boundary + append-only intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6J Content Pass-2 (§3.3 Import · §3.4 Verification Tasks · §3.5 Outreach) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the import jobs + append-only import rows (created entities in the owning module via service), the verification-task work-item (decision in M5 — Admin-decides/owning-module-owns), and the outreach pipeline (interim `content_jsonb` — `[ESC-ADMIN-SCHEMA-OUTREACH]` carried). Columns verbatim Doc-2 §10.9; states verbatim; coins nothing. Next: Pass-3 (§4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A).*
