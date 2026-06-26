# Doc-6J — M8 Admin (`admin`) Schema Realization — Content v1.0 **Pass-3** (§4 State · §5 Firewalls · §6 Indexing · §7 Migration · §8 + Appendix A)

| Field | Value |
|---|---|
| Status | **CONTENT Pass-3 (FINAL) — Independent Hard Review applied** (0 BLOCKER + 1 MAJOR + 2 MINOR + 1 NITPICK dispositioned; §Review Disposition). Completes §4–§8 + Appendix A (37/37). Next: Content Hard Review (cross-pass) → Content Freeze Audit |
| Date | 2026-06-26 |
| Realizes | the **§4 state-machine** consolidation (M8 = authoritative event catalog; `ban_actions` → `VendorBanned`); the **§5 firewalls** (Admin-decides/owning-module-owns; link non-disclosure); §6 indexing; §7 migration; §8 + Appendix A. *(All 10 tables realized in Pass-1/2.)* |
| Authority | `Doc-2 §8/§10.9` (the *what*); `Doc-6A` (Appendix A gate); `Doc-6B §4` (consumed); `Doc-4J` (authoritative event catalog); `Doc-4L/4M`; `Doc-3 v1.7`; `Doc-5J` |
| Coins | **Nothing.** Carried: `[ESC-ADMIN-AUDIT]` (M8 owns the §9 catalog), `[ESC-ADMIN-SCHEMA-OUTREACH]` (outreach columns) |
| DDL note | PostgreSQL 15+; Prisma `@@schema("admin")`. **[Doc-2 binding]** / **[§2.5 choice]** |

---

## §4 — State Machine Realization
| Machine | Table | Owner |
|---|---|---|
| `moderation_cases.state` (open/approved/rejected/escalated) | Pass-1 | staff service |
| `ban_actions.state` (active/lifted/expired) | Pass-1 | staff service; **emits `VendorBanned`** |
| `category_suggestions.state` · `missing_vendor_suggestions.state` · `link_suggestions.state` | Pass-1 | staff service (link confirm → M4) |
| `import_jobs.state` (queued/processing/completed/failed) | Pass-2 | import worker |
| `verification_tasks.state` (queued/in_review/decided) | Pass-2 | staff service; `decided` ↔ M5 `trust.verification_decisions` |

**Transition = outbox (Doc-2 §8); M8 = the authoritative event catalog (Doc-4J):** a ban writes `ban_actions` + a `core.outbox_events` **`VendorBanned`** (Doc-5J's single §8 event) in one txn → **M2 reflects** `vendor_profiles.status=banned` + **M3 routing excludes**. Event slugs are defined by **Doc-4J (the authoritative catalog)**; **none coined**. Admin-action audit binds to the Doc-4J §9 catalog (`[ESC-ADMIN-AUDIT]`).

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/TRUST)
Bare-UUID + service + event. **Admin-decides/owning-module-owns:** M8 emits the decision event + holds the work-item; the authoritative record is the owning module's — **ban → M2** (`VendorBanned`), **verification decision → M5** (`trust.verification_decisions`), **link confirm → M4** (`operations.private_vendor_records` via Operations service), **category/vendor import → M2**. M8 **writes no owning-module authoritative table**. **`link_suggestions` never vendor-visible** (A-03). No cross-module write of an owning-module authoritative table; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4J`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H) for Doc-5J lists; subject indexes (moderation/ban); work-queue `state` partials (moderation/import/verification-task); `import_rows(import_job_id)`; `link_suggestions(private_vendor_record_id)`; partial `WHERE deleted_at IS NULL` (outreach); page-size via `admin.*` POLICY. **Deps:** `Doc-5J`; `Doc-6A §10/§12`; `Doc-3 v1.7`.

## §7 — POLICY & Forward-Only Migration
**POLICY = Doc-3 v1.7 (CLEARED):** 2 `admin.*` keys in `core.system_configuration`; M8 reads, coins none.
**Forward-only order:** (assume core…billing migrated) `CREATE SCHEMA admin` → enums → moderation_cases → ban_actions → category_suggestions → missing_vendor_suggestions → link_suggestions → import_jobs → import_rows → verification_tasks → outreach_campaigns → outreach_contacts → indexes → triggers (immutability: ban_actions/import_rows/verification_tasks) → RLS → seeds (none owned by M8). Forward-only, idempotent.

## §8 — Conformance & Carried Items
Coins nothing; every element traces to Doc-2 §10.9 or a §2.5 attribution. Carried: **`[ESC-ADMIN-AUDIT]`** (admin audit actions — M8 owns the Doc-4J §9 catalog; bind there) · **`[ESC-ADMIN-SCHEMA-OUTREACH]`** (outreach columns — Doc-4J/Doc-5J DTO) · DD-MKT/OPS/TRUST · Admin-decides/owning-module-owns + link non-disclosure (realized). `[ESC-6-POLICY]` **CLEARED**.

## Appendix A — Doc-6J Conformance Attestation (Doc-6A `CHK-6-001…093`, 37 checks)

| Band | Check | Verdict | Evidence |
|---|---|---|---|
| **A** | 001 | PASS | every table `id uuid` PK |
| | 002 | **N/A** | **no `human_ref`** — Doc-2 §10.9 declares none |
| | 003 | PASS | timestamps; append-only `import_rows` omits `updated_at` |
| | 004 | PASS | SD tuple only on outreach; moderation/ban/suggestions/import/verification correctly no SD |
| | 005 | PASS | work-queue partial indexes; `link_suggestions` state-partial |
| **B** | 010 | PASS | physical `admin` namespace; one Prisma `@@schema` |
| | 011 | PASS | **no cross-schema FK** — subjects/orgs/users/category/vendor/record/claim all bare UUID |
| | 012 | PASS | refs entity-named, service-validated, orphan-scan |
| | 013 | PASS | no cross-schema JOIN/traversal |
| **C** | 020 | PASS | RLS on every table; platform-staff/org-suggestion anchors server-set, fail-closed |
| | 021 | PASS | polymorphic subject by discriminator; org-suggestion anchor |
| | 022 | **PASS — IN-SCOPE** | **`link_suggestions` never vendor-visible** (A-03; staff-only); the ban's public effect = M2's banner, not a public `ban_actions` read |
| | 023 | PASS | authz app-layer (Doc-4J); RLS = backstop |
| **D** | 030 | PASS | no hard-DELETE of authoritative rows |
| | 031 | PASS | append-only `import_rows`; column-scoped `ban_actions`/`verification_tasks` identity |
| | 032 | PASS | status-tracked under staff/service; no derived-cache hard-delete |
| | 033 | **N/A** | no `ai.*` cache |
| **E** | 040 | PASS | ban/moderation transitions + outbox (§4) |
| | 041 | PASS | **M8 = the authoritative event catalog** (Doc-4J); `VendorBanned` (Doc-5J single §8 event); none coined |
| | 042 | PASS | audit via `core.audit_records` |
| | 043 | **PASS-with-carry** | admin audit actions bind to the Doc-4J §9 catalog (`[ESC-ADMIN-AUDIT]`) |
| **F** | 050 | **N/A** | no monetary column in `admin` |
| **G** | 060 | PASS | reads `core.system_configuration`; 2 `admin.*` keys (Doc-3 v1.7) |
| | 061 | PASS | page-size/idempotency from POLICY, never literals |
| | 062 | **N/A** | no role seed in M8 |
| **H** | 070 | PASS | Doc-5J reads/lists persistable (moderation, bans, suggestions, import, tasks, outreach) |
| | 071 | PASS | composite sort-key/work-queue indexes (§6) |
| | 072 | PASS | idempotency persisted; `admin.idempotency_dedup_window` |
| | 073 | PASS | no non-persistable Doc-5J surface |
| **I** | 080 | PASS | nothing coined; every element traces to Doc-2 §10.9; outreach not invented (`[ESC-ADMIN-SCHEMA-OUTREACH]`) |
| | 081 | PASS | physical specifics §2.5-attributed (text subject_type/outcome, content_jsonb, work-queue partials) |
| | 082 | PASS | `[ESC-ADMIN-AUDIT]`/`[ESC-ADMIN-SCHEMA-OUTREACH]` via named channels |
| | 083 | PASS | no Doc-2 decision re-opened; owning-module boundary held |
| **J** | 090 | PASS | extends B.1 base + B.2 types |
| | 091 | PASS | coins no shared enum; reuses B.3 (`actor_type`/outbox `status`); M8 enums module-owned |
| | 092 | PASS | B.4 naming followed |
| | 093 | PASS | B.5 conventions realized |

**37/37 — 0 FAIL.** N/A: 002 (no human_ref), 033 (no ai), 050 (no money), 062 (no role seed). PASS-with-carry: 043. **CHK-6-022 in-scope PASS** (`link_suggestions` never-vendor-visible).

---

## Review Disposition (Independent Hard Review — Pass-3)

Reviewer: independent. Verified CORRECT: the §4 outbox/`VendorBanned`, the §5 owning-module firewall, the 37/37 Appendix A (4 justified N/A + 022 in-scope), M8 = authoritative catalog, coin-nothing.

| Finding | Sev | Disposition |
|---|---|---|
| **CAT-043** `[ESC-ADMIN-AUDIT]` as a gap vs M8 owning the catalog | MAJOR | **CLARIFIED** — M8 **is** the authoritative event catalog (Doc-4J); admin-action audit binds **there**, not a coined action; CHK-6-043 = PASS-with-carry (bind, not invent). |
| **BAN-EVT** `VendorBanned` single event | MINOR | **CONFIRMED** — Doc-5J: the single M8 §8 event; M2/M3 consume; none coined. |
| **LINK-022** `link_suggestions` byte-equivalence in-scope | MINOR | **CONFIRMED** — staff-only; no vendor surface; CHK-6-022 in-scope PASS. |
| **OUT-CARRY** outreach underspecification | NIT | **CONFIRMED carried** — `[ESC-ADMIN-SCHEMA-OUTREACH]`. |

**Net:** 0 BLOCKER; 1 MAJOR (043 catalog clarification) + 2 MINOR + 1 NIT confirmed. 37/37 Appendix A; owning-module + link non-disclosure intact. 0 open BLOCKER/MAJOR/MINOR.

---

*End of Doc-6J Content Pass-3 (FINAL) — Independent Hard Review applied; 0 open BLOCKER/MAJOR/MINOR. Completes the `admin` realization: the §4 state consolidation (M8 = authoritative event catalog; `ban_actions` → `VendorBanned`), the §5 firewalls (Admin-decides/owning-module-owns; `link_suggestions` never vendor-visible), §6 indexing, §7 forward-only migration, and §8 + Appendix A (37/37, 0 FAIL; CHK-6-022 in-scope; 4 justified N/A). Coins nothing; carried `[ESC-ADMIN-AUDIT]` + `[ESC-ADMIN-SCHEMA-OUTREACH]`. Next: Content Hard Review (cross-pass) → Content Freeze Audit → `Doc-6J_SERIES_FROZEN`.*
