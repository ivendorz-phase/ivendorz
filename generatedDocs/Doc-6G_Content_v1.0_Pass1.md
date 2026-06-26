# Doc-6G — M5 Trust (`trust`) Schema Realization — Content v1.0 **Pass-1** (§0–§2 · §3.1 Verification)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-1 — Independent Hard Review applied** (1 BLOCKER + 3 MAJOR + 2 MINOR dispositioned; §Review Disposition). Realizes §0–§2 + §3.1. Next: Pass-2 |
| Date | 2026-06-26 |
| Realizes | the **Verification grouping** — `verification_records` (§5.6) + `verification_decisions` (Admin-decides/Trust-owns) + `verified_financial_tiers` (System-written; emits `VendorTierChanged`). The **System-actor-write firewall model** |
| Authority | `Doc-2 §5.6/§6/§10.6` (the *what*); `Doc-6A` (the *how*); `Doc-6B §4` (consumed); `Doc-6D` (M2 reflects bands); `Doc-4G` (M5 ownership); `Doc-3 v1.3` (`trust.*` POLICY) |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.6; `verification_*`/`verified_tier_status` sets verbatim; **no human_ref** (none in §10.6); physical specifics §2.5-tagged |
| DDL note | PostgreSQL 15+; Prisma `@@schema("trust")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §0 — Document Control, Precedence & Conformance Obligation
Doc-6G realizes Doc-2 §10.6 against frozen Doc-6A; passes Doc-6A Appendix A; realize-never-redecide; flag-and-halt. `[ESC-6-POLICY]` **CLEARED** (Doc-3 v1.3 — 2 `trust.*` keys). Carried into content: `[ESC-TRUST-AUDIT]` (Pass-3). Coins nothing.

## §1 — Scope & the `trust` Table Partition (Pass-1 slice)
Pass-1 realizes the **Verification grouping** (§3.1) + the cross-cutting **firewall + System-actor-write RLS model** (§2). **Deferred:** Trust + Performance scores → Pass-2; Fraud + Reviews + §4–§8 + Appendix A → Pass-3.

## §2 — Tenancy, Firewall & System-Actor RLS Model *(the load-bearing section)*

### §2.1 The classes
| Class | Tables | Read | Write |
|---|---|---|---|
| **Platform-internal** | verification_records, verification_decisions, fraud_signals, admin_ratings, scores/histories/inputs | admin (`app.is_platform_staff`) / System | admin (verification) **OR** System-only (scores/verified-tier) |
| **System-only write** | `verified_financial_tiers`, `trust_scores`, `performance_scores`, all histories | admin | **System scoring service only** — no in-band policy |
| **Author/public** | `public_reviews` | public when `published` | author org |

### §2.2 System-actor-write (Invariant #6 — scores never hand-edited)
Score-class tables (`verified_financial_tiers` here; `trust_scores`/`performance_scores` Pass-2) are written **only** by the System scoring/verification service — realized as **functions/connections owned by the schema-owner role** (or `SECURITY DEFINER`), which **bypass RLS**. **No `CREATE POLICY ... FOR INSERT/UPDATE/DELETE` is granted to any app/admin role** → there is **no in-band write path**; an admin cannot hand-edit a score (the Invariant-#6 binding). `created_by`/`updated_by` carry the **System actor** id (Doc-6B B.3 `actor_type`). The mechanism (owner-role bypass) = **[§2.5]**; "scores auto-calculated under System, never hand-edited" = **[Doc-2 §6 / Invariant #6 binding]**.

### §2.3 The firewall + the public band (Invariant #6 — binding)
No M5 table has a column **computed from another platform score**, and **no cross-score FK** exists — the four signals are independent. **Buyer Vendor Status (M4) never enters** any M5 table or computation. The **public band is M2's reflected read-model** (`vendor_matching_attributes.trust_band`/`performance_band`, event-driven) — there is **no public read policy on any raw `trust` score table**; the raw 0–100 score never leaves M5. RLS = backstop; authz app-layer (Doc-4G). Tests = Doc-8.

---

## §3.1 — The Verification grouping

### §3.1.1 `trust.verification_records` (§5.6; polymorphic subject; platform-internal)
Realizes Doc-2 §10.6 + §5.6. Polymorphic `subject_id`+`subject_type` (bare UUID + discriminator, no FK); `evidence_document_refs[]` bare-UUID array; **NO SD**.

```sql
CREATE TYPE trust.verification_subject_type AS ENUM ('vendor_profile','organization','capacity','declared_tier');  -- [Doc-2 §10.6 binding]
CREATE TYPE trust.verification_type AS ENUM ('contact','business','factory','organization','tier','capacity');     -- [Doc-2 §10.6 binding]
CREATE TYPE trust.verification_state AS ENUM ('requested','in_review','approved','rejected','expired','revoked');   -- [Doc-2 §5.6 binding]

CREATE TABLE trust.verification_records (
  id uuid NOT NULL,                                            -- [Doc-6A §3.1] PK UUIDv7
  subject_id uuid NOT NULL,                                   -- [Doc-2 §10.6] polymorphic — bare UUID (vendor_profile→M2 / organization→M1 / capacity→M2 / declared_tier→M2)
  subject_type trust.verification_subject_type NOT NULL,      -- [Doc-2 §10.6] discriminator
  verification_type trust.verification_type NOT NULL,         -- [Doc-2 §10.6]
  state trust.verification_state NOT NULL DEFAULT 'requested', -- [Doc-2 §5.6]
  evidence_document_refs uuid[] NOT NULL DEFAULT '{}',        -- [Doc-2 §10.6] bare-UUID array → storage/M2 (no FK)
  requested_by uuid,                                          -- [Doc-2 §10.6] bare UUID → M1
  expires_at timestamptz,                                     -- [Doc-2 §10.6] periodic review / document expiry
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                           -- [Doc-2 §0.2] (NO SD)
  CONSTRAINT verification_records_pkey PRIMARY KEY (id)
);
CREATE INDEX verification_records_subject_idx ON trust.verification_records (subject_type, subject_id);  -- [§2.5]
CREATE INDEX verification_records_state_idx ON trust.verification_records (state) WHERE state IN ('requested','in_review');  -- [§2.5] work queue

-- subject/type/requested_by immutable; only state/expires_at change (column-scoped):
CREATE TRIGGER verification_records_immutable BEFORE UPDATE OR DELETE ON trust.verification_records FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','subject_id','subject_type','verification_type','requested_by','created_at','created_by');  -- [Doc-6B §4] state/expires_at/evidence mutable
```
- **§5.6 (TR-CR6):** `requested→in_review→approved/rejected`; `in_review→requested` (request more info); `approved→expired` (review lapse/doc expiry); `approved→revoked` (fraud/compliance). Service/event. Approval of a vendor-profile/contact verification emits **`VendorVerified`** (→ M2 claim_state `verified`, Doc-6D §3.1.1). **Subject visibility to the vendor** is via M2's reflected `verified_fields_jsonb` (Doc-6D), not a direct `trust` read (TR-HR-4). **RLS:** platform-internal (admin/System) — §3.x. **Prisma [§2.5]:** `VerificationRecord`, enums.

### §3.1.2 `trust.verification_decisions` (append-only; Admin decides, Trust owns)
Realizes Doc-2 §10.6. In-module FK → `verification_records`; `decided_by` staff (M1); `verification_task_id` → M8 (`admin.verification_tasks` — **Admin decides**); **NO SD append-only**.

```sql
CREATE TYPE trust.verification_decision AS ENUM ('approve','reject','confirm','downgrade','request_info');  -- [Doc-2 §10.6 binding]

CREATE TABLE trust.verification_decisions (
  id uuid NOT NULL, verification_record_id uuid NOT NULL,     -- [Doc-6A §5.2] in-module FK
  decided_by uuid,                                            -- [Doc-2 §10.6] bare UUID → M1 (staff user)
  verification_task_id uuid,                                  -- [Doc-2 §10.6] bare UUID → M8 (admin.verification_tasks — the decision origin)
  decision trust.verification_decision NOT NULL,             -- [Doc-2 §10.6]
  reason text,                                               -- [Doc-2 §10.6]
  decided_at timestamptz NOT NULL DEFAULT now(),             -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), created_by uuid,
  CONSTRAINT verification_decisions_pkey PRIMARY KEY (id),
  CONSTRAINT verification_decisions_record_fk FOREIGN KEY (verification_record_id) REFERENCES trust.verification_records(id)
);
CREATE TRIGGER verification_decisions_immutable BEFORE UPDATE OR DELETE ON trust.verification_decisions FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation(
    'id','verification_record_id','decided_by','verification_task_id','decision','reason','decided_at','created_at','created_by');  -- [Doc-6B §4] full append-only
```
- **Admin decides, Trust owns (TR-CR6):** the **decision is made by Admin** (M8 `verification_tasks`, `verification_task_id` references it); **Trust stores** the authoritative decision record + drives the `verification_records.state`. **RLS:** platform-internal (§3.x). **Prisma [§2.5]:** `VerificationDecision`, enum.

### §3.1.3 `trust.verified_financial_tiers` (System-written; emits `VendorTierChanged`)
Realizes Doc-2 §10.6. `vendor_profile_id` bare UUID → M2 (UNIQUE partial); `status`; 24-month review; **NO SD status-tracked**; **System-written**. `Declared`-only = **absence** of a row.

```sql
CREATE TYPE trust.financial_tier AS ENUM ('A','B','C','D','E');  -- [Doc-2 §10.6 `tier(A–E)`] module-owned (NOT a cross-schema ref to marketplace.financial_tier)
CREATE TYPE trust.verified_tier_status AS ENUM ('pending_verification','verified','suspended','expired');  -- [Doc-2 §10.6 binding]

CREATE TABLE trust.verified_financial_tiers (
  id uuid NOT NULL, vendor_profile_id uuid NOT NULL,          -- [Doc-2 §10.6] bare UUID → M2
  tier trust.financial_tier NOT NULL,                        -- [Doc-2 §10.6]
  status trust.verified_tier_status NOT NULL DEFAULT 'pending_verification',  -- [Doc-2 §10.6]
  verified_at timestamptz,                                    -- [Doc-2 §10.6]
  next_review_at timestamptz,                                 -- [Doc-2 §10.6] +24 months
  basis_jsonb jsonb,                                          -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,                           -- [Doc-2 §0.2] = System actor (TR-CR3)
  CONSTRAINT verified_financial_tiers_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX verified_financial_tiers_vendor_uq ON trust.verified_financial_tiers (vendor_profile_id);  -- [Doc-2 §10.6] one per vendor (UNIQUE partial — absence = Declared-only)
CREATE INDEX verified_financial_tiers_review_idx ON trust.verified_financial_tiers (next_review_at) WHERE status = 'verified';  -- [§2.5] 24-mo review sweep

-- identity frozen; status/tier/verified_at/next_review_at/basis mutable by System (column-scoped — consistent with trust_scores/performance_scores; HR-G1):
CREATE TRIGGER verified_financial_tiers_immutable BEFORE UPDATE OR DELETE ON trust.verified_financial_tiers FOR EACH ROW
  EXECUTE FUNCTION core.raise_immutable_violation('id','vendor_profile_id','created_at','created_by');  -- [Doc-6B §4] DELETE blocked
```
- **Emits `VendorTierChanged` (TR-CR6):** a `status`/`tier` change writes the row **+** a `core.outbox_events` `VendorTierChanged` in one txn → **M2 `financial_tier_history`** consumes it (exclusive-writer-as-consumer, Doc-6D §3.1.5). **System-written only** (TR-CR3): no admin/user write policy; the verification service (owner-role) writes. **`Declared`-only = absence** (one authoritative source — the M2 declared tier). **RLS:** admin read; System write (§3.x). **Prisma [§2.5]:** `VerifiedFinancialTier`, enums.

## §3.x — Consolidated RLS DDL (Pass-1 — platform-internal; System-only writes)
```sql
-- verification_records: admin read+write (verification lifecycle); System; NO public/vendor
ALTER TABLE trust.verification_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY verification_records_admin ON trust.verification_records FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- verification_decisions: admin insert + read (append-only; UPDATE/DELETE blocked by trigger)
ALTER TABLE trust.verification_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY verification_decisions_admin ON trust.verification_decisions FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- verified_financial_tiers: admin READ only; NO write policy (System scoring service writes via owner-role/SECURITY DEFINER — TR-CR3)
ALTER TABLE trust.verified_financial_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY verified_financial_tiers_read ON trust.verified_financial_tiers FOR SELECT
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
-- (no FOR INSERT/UPDATE/DELETE policy = no in-band write path; the verified tier is never hand-edited — Invariant #6.)
```
- **The deliberate absence of a write policy on `verified_financial_tiers`** is the RLS realization of "scores auto-calculated under the System actor, never hand-edited" (§2.2). The public band is M2's reflection — **no public read here**.

---

## Review Disposition (Independent Hard Review — Pass-1)

Reviewer: independent. Verified CORRECT: the 3-table set + columns (Doc-2 §10.6), §5.6 state set verbatim, verification-type/decision/tier-status sets verbatim, polymorphic subject, `Declared`-only = absence, the `VendorTierChanged` emit, no human_ref (CHK-6-002 N/A), coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **TIER-PUB** `verified_financial_tiers` left with a public read policy would leak the raw verified tier (should be M2-reflected band) | BLOCKER (Invariant #6 / TR-HR-1) | **FIXED** — §3.x: admin-read only; **no public read**; the public badge is M2's reflection. |
| **SCORE-EDIT** `verified_financial_tiers` writable by admin would allow hand-editing a signal | MAJOR (Invariant #6) | **FIXED** — §2.2/§3.x: **no write policy**; System scoring service (owner-role/`SECURITY DEFINER`) only; never hand-edited. |
| **TIER-ENUM** reusing `marketplace.financial_tier` would be a cross-schema enum reference | MAJOR | **FIXED** — module-owned `trust.financial_tier` (same A–E set; no cross-schema dependency; CHK-6-091). |
| **DEC-IMM** `verification_decisions` "append-only" without a guard | MAJOR | **FIXED** — full append-only trigger via `core.raise_immutable_violation` (all cols); DELETE blocked. |
| **VR-IMM** `verification_records` subject/type should be immutable; only state/expiry change | MINOR | **FIXED** — column-scoped trigger (subject/type/requested_by frozen; state/expires_at/evidence mutable). |
| **SUBJ-FK** polymorphic `subject_id` cross-entity FK | MINOR | **CONFIRMED bare-UUID** — discriminator `subject_type`; no FK; service-validated. |

**Net:** 1 BLOCKER (verified-tier public leak) + 3 MAJOR (hand-edit, cross-schema enum, decision immutability) fixed; 2 MINOR applied/confirmed. The verified-tier-public-leak + no-hand-edit findings are load-bearing — the firewall + System-actor-write. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6G Content Pass-1 (§0–§2 · §3.1 Verification) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Realizes the §5.6 verification record (polymorphic subject; Admin-decides/Trust-owns; column-scoped immutability), the append-only verification decisions, and the System-written verified financial tier (emits `VendorTierChanged`; `Declared`-only = absence; **no write policy = never hand-edited**; public band via M2 reflection). Columns verbatim Doc-2 §10.6; states verbatim; no human_ref; coins nothing. Next: Pass-2 (Trust Score + Performance Score — System-actor writes, the firewall, idempotent `performance_inputs`, history snapshots).*
