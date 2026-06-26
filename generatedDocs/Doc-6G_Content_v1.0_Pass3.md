# Doc-6G — M5 Trust (`trust`) Schema Realization — Content v1.0 **Pass-3** (§3.4 Fraud · §3.5 Reviews · §4–§8 · Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (1 BLOCKER + 2 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §3.4–§3.5 + §4–§8 + Appendix A (37/37). Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | **Fraud** (`fraud_signals`) · **Reviews** (`public_reviews` post-award + moderation + feeds performance · `admin_ratings` internal-only); §4 state · §5 firewalls · §6 indexing · §7 migration · §8 + Appendix A |
| Authority | `Doc-2 §6/§8/§10.6` (the *what*); `Doc-6A` (Appendix A gate); `Doc-6B §4` (consumed); `Doc-4G/4L/4M`; `Doc-3 v1.3`; `Doc-5G` |
| Coins | **Nothing.** Columns verbatim Doc-2 §10.6; `fraud`/`public_review` state sets verbatim; `signal_type`/`severity`/`subject_type` = text (Doc-2 enumerates no values). Carried: `[ESC-TRUST-AUDIT]` |
| DDL note | PostgreSQL 15+; Prisma `@@schema("trust")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §3.4 — `trust.fraud_signals` (platform-internal; polymorphic subject)
Realizes Doc-2 §10.6. Polymorphic `subject_id`+`subject_type`; `reported_by` (M1); `state`; **NO SD**; platform-internal.

```sql
CREATE TYPE trust.fraud_signal_state AS ENUM ('open','reviewed','actioned','dismissed');  -- [Doc-2 §10.6 binding]

CREATE TABLE trust.fraud_signals (
  id uuid NOT NULL, subject_id uuid NOT NULL, subject_type text NOT NULL,  -- [Doc-2 §10.6] polymorphic (no enumerated set → text [§2.5])
  reported_by uuid,                                          -- [Doc-2 §10.6] bare UUID → M1
  signal_type text NOT NULL,                                 -- [Doc-2 §10.6] (no values declared → text)
  severity text NOT NULL,                                    -- [Doc-2 §10.6] (no values declared → text)
  state trust.fraud_signal_state NOT NULL DEFAULT 'open',    -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid,
  CONSTRAINT fraud_signals_pkey PRIMARY KEY (id)
);
CREATE INDEX fraud_signals_subject_idx ON trust.fraud_signals (subject_type, subject_id);  -- [§2.5]
CREATE INDEX fraud_signals_open_idx ON trust.fraud_signals (state) WHERE state IN ('open','reviewed');  -- [§2.5] work queue
```
- **Platform-internal (TR-CR1):** admin/System; fraud revocation may drive `verification_records→revoked` (service). **RLS:** admin all (§3.x). **Prisma [§2.5]:** `FraudSignal`, enum `FraudSignalState`.

## §3.5 — Reviews

### §3.5.1 `trust.admin_ratings` (**internal only — never public, never tenant-visible**)
Realizes Doc-2 §10.6. `vendor_profile_id`/`rated_by` (M2/M1); YES SD; **strictly platform-staff**.

```sql
CREATE TABLE trust.admin_ratings (
  id uuid NOT NULL, vendor_profile_id uuid NOT NULL, rated_by uuid,  -- [Doc-2 §10.6] bare UUID → M2/M1 (staff)
  score numeric, comment text,                               -- [Doc-2 §10.6] internal rating
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,
  CONSTRAINT admin_ratings_pkey PRIMARY KEY (id)
);
```
- **Internal only (TR-CR8):** **never public, never tenant-visible** — `admin_ratings` has **only** a platform-staff policy; no vendor, no public, no author read. (The internal analog of M4's blacklist privacy.) **RLS:** staff-only (§3.x). **Prisma [§2.5]:** `AdminRating`.

### §3.5.2 `trust.public_reviews` (post-award; moderation; public when published; feeds performance)
Realizes Doc-2 §10.6. `vendor_profile_id`/`author_organization_id`/`engagement_id` (M2/M1/M4 bare UUID); `rating 1–5`; `status` moderation; YES SD (removed=hidden); **post-award only**.

```sql
CREATE TYPE trust.public_review_status AS ENUM ('submitted','approved','published','rejected','removed');  -- [Doc-2 §10.6 binding]

CREATE TABLE trust.public_reviews (
  id uuid NOT NULL,
  vendor_profile_id uuid NOT NULL,                           -- [Doc-2 §10.6] bare UUID → M2
  author_organization_id uuid NOT NULL,                      -- [Doc-2 §10.6] bare UUID → M1 (the buyer author — RLS write anchor)
  engagement_id uuid NOT NULL,                               -- [Doc-2 §10.6] bare UUID → M4 (post-award gate — required, service-validated)
  rating smallint NOT NULL,                                  -- [Doc-2 §10.6] 1–5
  body text,                                                 -- [Doc-2 §10.6]
  status trust.public_review_status NOT NULL DEFAULT 'submitted',  -- [Doc-2 §10.6]
  moderated_by uuid, moderated_at timestamptz,               -- [Doc-2 §10.6]
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, deleted_at timestamptz, deleted_by uuid, delete_reason text,  -- [Doc-2 §10.6] SD removed=hidden
  CONSTRAINT public_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT public_reviews_rating_chk CHECK (rating BETWEEN 1 AND 5),  -- [Doc-2 §10.6]
  CONSTRAINT public_reviews_engagement_uq UNIQUE (engagement_id, author_organization_id)  -- [§2.5] one review per engagement per author
);
CREATE INDEX public_reviews_vendor_published_idx ON trust.public_reviews (vendor_profile_id) WHERE status = 'published' AND deleted_at IS NULL;  -- [§2.5] M2 service read
```
- **Post-award only + feeds performance (TR-CR8):** `engagement_id` required (service-validates the post-award engagement); `submitted→approved→published` (moderation) / `rejected`/`removed`. A **`published`** review feeds a `feedback` `performance_input` (Buyer Feedback) **within Trust** (a same-module service write, not a cross-module event). **Marketplace displays via service** — M2 reads published reviews through a service call, **never** a cross-schema table read. **RLS:** author write + public-read-when-published + staff moderate (§3.x). **Prisma [§2.5]:** `PublicReview`, enum `PublicReviewStatus`.

## §3.x — Consolidated RLS DDL (Pass-3)
```sql
-- fraud_signals: admin/System only
ALTER TABLE trust.fraud_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY fraud_signals_admin ON trust.fraud_signals FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- admin_ratings: STRICTLY platform-staff — never public, never tenant (no other policy)
ALTER TABLE trust.admin_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_ratings_staff ON trust.admin_ratings FOR ALL
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE)
  WITH CHECK (current_setting('app.is_platform_staff', true)::boolean IS TRUE);

-- public_reviews: author org write | public read when published | staff moderate
ALTER TABLE trust.public_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_reviews_public_read ON trust.public_reviews FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY public_reviews_author ON trust.public_reviews FOR ALL
  USING (author_organization_id = current_setting('app.active_org', true)::uuid)
  WITH CHECK (author_organization_id = current_setting('app.active_org', true)::uuid);
CREATE POLICY public_reviews_staff ON trust.public_reviews FOR ALL          -- moderation (status/moderated_by)
  USING (current_setting('app.is_platform_staff', true)::boolean IS TRUE);
```

## §4 — State Machine Realization
| Machine | Table | Owner |
|---|---|---|
| `verification_records.state` §5.6 | Pass-1 | service/admin; approval emits `VendorVerified` |
| `verified_financial_tiers.status` | Pass-1 | System; change emits `VendorTierChanged` (→ M2) |
| `trust_scores`/`performance_scores.freeze_state` | Pass-2 | System; freeze reflected to M2 band |
| `fraud_signals.state` (open/reviewed/actioned/dismissed) | §3.4 | admin/System |
| `public_reviews.status` (submitted/approved/published/rejected/removed) | §3.5 | author + staff moderation; `published`→ feedback input |

**Transition = outbox (Doc-2 §8):** emitter transitions write the row + `core.outbox_events` in one txn; slugs bound to Doc-2 §8/Doc-4L (`VendorVerified`/`VendorTierChanged` + score-band reflection); none coined. **Scores are System-written** (no hand-edit). `[ESC-TRUST-AUDIT]` for score/verification audit actions.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/ADMIN)
Bare-UUID + service + event. **M5 emits** `VendorVerified` (→ M2 claim_state) + `VendorTierChanged` (→ M2 `financial_tier_history`) + score-band reflection (→ M2 `vendor_matching_attributes`). **M5 consumes** M4 Operations events into `performance_inputs` (idempotent); M8 verification-task decisions. **Firewall (#6):** no platform score reads/derives from another; **Buyer Vendor Status (M4) never enters**; scores System-written; the public band is M2's reflected read-model (no public `trust` score read). `public_reviews` displayed by M2 via service (never table access). No cross-module write; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4G`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5G lists; `UNIQUE(vendor_profile_id)` scores; `verified_financial_tiers` partial-unique; `performance_inputs` dedup-unique + `(vendor_profile_id, input_type, occurred_at)`; subject indexes (verification/fraud); `public_reviews` published index (M2 service read); partial `WHERE deleted_at IS NULL` (SD: `admin_ratings`/`public_reviews`); page-size via `trust.*` POLICY. **Deps:** `Doc-5G`; `Doc-6A §10/§12`; `Doc-3 v1.3`.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.3 (CLEARED):** 2 `trust.*` keys in `core.system_configuration`; M5 reads, coins none.
**Forward-only order:** (assume core/identity/marketplace/rfq/operations migrated) `CREATE SCHEMA trust` → enums → verification_records → verification_decisions → verified_financial_tiers → trust_scores → trust_score_history → performance_scores → performance_score_history → performance_inputs → fraud_signals → admin_ratings → public_reviews → indexes → triggers (immutability) → RLS → seeds (none owned by M5). Forward-only, idempotent.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to Doc-2 §10.6 or a §2.5 attribution. Carried: **`[ESC-TRUST-AUDIT]`** (score/verification audit actions — bind nearest Doc-2 §9 by pointer) · DD-MKT/OPS/ADMIN · Invariant #6 firewall (realized). `[ESC-6-POLICY]` **CLEARED**.

## Appendix A — Doc-6G Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | 001 | PASS | every table `id uuid` PK |
| | 002 | **N/A** | **no `human_ref`** — Doc-2 §10.6 declares none for `trust` |
| | 003 | PASS | timestamps; append-only tables omit `updated_at` |
| | 004 | PASS | SD tuple only on `admin_ratings`/`public_reviews`; scores/history/inputs/verification correctly no SD |
| | 005 | PASS | `UNIQUE(vendor_profile_id)` scores; `verified_financial_tiers` partial-unique; `performance_inputs` dedup; `public_reviews(engagement,author)` |
| **B** | 010 | PASS | physical `trust` namespace; one Prisma `@@schema` |
| | 011 | PASS | **no cross-schema FK** — vendor/org/engagement/source/task all bare UUID |
| | 012 | PASS | refs entity-named, service-validated, orphan-scan |
| | 013 | PASS | no cross-schema JOIN/traversal |
| **C** | 020 | PASS | RLS on every table; platform-internal/author/public anchors server-set, fail-closed |
| | 021 | PASS | author anchor (`public_reviews`); polymorphic subject by discriminator |
| | 022 | **PASS — IN-SCOPE** | `admin_ratings` **never public/tenant** (staff-only); raw scores never public (band = M2 reflection); non-disclosure of internal signals |
| | 023 | PASS | authz app-layer (Doc-4G); RLS = backstop; **scores System-write only (no in-band write policy)** |
| **D** | 030 | PASS | no hard-DELETE of authoritative rows |
| | 031 | PASS | append-only histories/`performance_inputs`/`verification_decisions`; column-scoped `verification_records` |
| | 032 | PASS | **scores under the System actor** (no hand-edit); snapshots append-only |
| | 033 | **N/A** | no `ai.*` cache |
| **E** | 040 | PASS | verification/tier/score transitions + outbox (§4) |
| | 041 | PASS | no event coined; `VendorVerified`/`VendorTierChanged`/band-reflection bound Doc-2 §8/4L; M4 inputs consumed |
| | 042 | PASS | audit via `core.audit_records` |
| | 043 | **PASS-with-carry** | score/verification audit gap = **`[ESC-TRUST-AUDIT]`** |
| **F** | 050 | **N/A** | no monetary column in `trust` (tier = enum, score = 0–100, rating = 1–5) |
| **G** | 060 | PASS | reads `core.system_configuration`; 2 `trust.*` keys (Doc-3 v1.3) |
| | 061 | PASS | page-size/idempotency from POLICY, never literals |
| | 062 | **N/A** | no role seed in M5 |
| **H** | 070 | PASS | Doc-5G reads/lists persistable (scores, verification, reviews, fraud) |
| | 071 | PASS | composite sort-key indexes (§6) |
| | 072 | PASS | idempotency persisted (`performance_inputs` dedup-unique; `trust.idempotency_dedup_window`) |
| | 073 | PASS | no non-persistable Doc-5G surface |
| **I** | 080 | PASS | nothing coined; every element traces to Doc-2 §10.6 |
| | 081 | PASS | physical specifics §2.5-attributed (System-actor-write, text band/level/signal_type, dedup index) |
| | 082 | PASS | `[ESC-TRUST-AUDIT]` via named channel |
| | 083 | PASS | no Doc-2 decision re-opened; firewall not weakened |
| **J** | 090 | PASS | extends B.1 base + B.2 types |
| | 091 | PASS | coins no shared enum; reuses B.3 (`actor_type`/outbox `status`); M5 enums (incl. own `trust.financial_tier`) module-owned |
| | 092 | PASS | B.4 naming followed |
| | 093 | PASS | B.5 conventions realized |

**37/37 — 0 FAIL.** N/A: 002 (no human_ref), 033 (no ai), 050 (no money), 062 (no role seed) — each justified by shape/ownership. PASS-with-carry: 043. **CHK-6-022 in-scope PASS** (internal-signal non-disclosure: admin_ratings staff-only; raw scores never public).

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent. Verified CORRECT: the 3-table set + columns (Doc-2 §10.6), `fraud`/`public_review` state sets verbatim, `rating 1–5` CHECK, post-award gate, `admin_ratings` internal-only, the 37/37 Appendix A (4 justified N/A), coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **AR-LEAK** `admin_ratings` left with any vendor/public/author/tenant policy would breach "never public, never tenant-visible" | BLOCKER (TR-CR8) | **FIXED** — §3.x: **only** a platform-staff policy; no vendor/public/author read. |
| **PR-POSTAWARD** `public_reviews` without a required `engagement_id` would allow non-post-award reviews | MAJOR | **FIXED** — `engagement_id NOT NULL` (service-validated post-award); `UNIQUE(engagement, author)`; `rating 1–5` CHECK. |
| **PR-FEED** published-review → performance link unclear (cross-module vs within-Trust) | MAJOR | **FIXED** — §3.5.2: a `published` review feeds a `feedback` `performance_input` **within Trust** (same-module service), **not** a cross-module event; M2 displays via service (never table read). |
| **FRAUD-TEXT** `signal_type`/`severity`/`subject_type` enum values not in Doc-2 | MINOR | **CONFIRMED text** — Doc-2 §10.6 names the columns, enumerates no values; `text` (no coined enum); §2.5. |
| **CHK-NA** the four N/A checks (002/033/050/062) | MINOR | **CONFIRMED justified** — no human_ref / no ai-cache / no money / no role-seed in `trust` (shape/ownership). |
| **PR-MOD** moderation write (status/moderated_by) by staff vs author write | NIT | **CONFIRMED** — author writes the review; staff-moderate via the staff policy (OR'd); `published` gate on public read. |

**Net:** 1 BLOCKER (admin_ratings leak) + 2 MAJOR (post-award gate, feed-within-Trust) fixed; 2 MINOR + 1 NIT confirmed. 37/37 Appendix A; firewall + internal-signal non-disclosure intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6G Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `trust` realization: platform-internal fraud signals, the internal-only admin ratings (staff-only — never public/tenant), the post-award public reviews (moderation; published-public; feeds `performance_inputs` within Trust; M2 displays via service), the §4 state consolidation (System-written scores; `VendorVerified`/`VendorTierChanged` emits), the §5 firewall (independent signals; Buyer Vendor Status never enters; public band = M2 reflection), §6 indexing, §7 forward-only migration, and §8 + Appendix A (37/37, 0 FAIL; CHK-6-022 in-scope; 4 justified N/A). Coins nothing; carried `[ESC-TRUST-AUDIT]`. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6G_SERIES_FROZEN`.*
