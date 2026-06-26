# Doc-6J — M8 Admin Operations (`admin`) Schema Realization — Canonical Structure v1.0 (FROZEN)

| Field | Value |
|---|---|
| Status | **FROZEN** — canonical Table of Contents + ratified decisions for the `admin` schema realization |
| Freeze Date | 2026-06-26 |
| Supersedes | `Doc-6J_Structure_Proposal_v0.1.md` (effective v0.2 — Independent Hard Review applied, 2 MAJOR + 2 MINOR + 1 NIT; history retained there). Certified by `Doc-6J_Structure_Freeze_Audit_v1.0.md` |
| Module | **M8 — Admin Operations** (`admin` schema). **The authoritative event catalog (Doc-4J).** **"Admin decides, owning module owns."** **`link_suggestions` never vendor-visible** |
| Realizes | **Doc-2 §10.9** — **10 tables / 5 groupings** as PostgreSQL DDL + Prisma + RLS, against frozen **Doc-6A** |
| Authority | **Doc-6A_SERIES_FROZEN_v1.0 governs** (Appendix A gate); **Doc-2 v1.0.3 = binding *what*-authority**; Doc-4J (M8 contracts + authoritative event catalog, consumed); Doc-3 v1.7 (`admin.*` POLICY — registered, 2 keys); Doc-6B (`core`); Doc-6C/6D/6F/6G (UUID + event); Doc-4L/4M |
| Conforms To | Master Architecture, ADR, Doc-2 v1.0.3, Doc-3 v1.0.2 (+ v1.7), Doc-4A v1.0, Doc-4J v1.0 (FROZEN), Doc-4L/4M, Doc-6A…6I v1.0 (FROZEN) |
| Contains | Structure only — section map, 10-table partition, ratified decisions (AD-CR1–CR12), Admin-decides/owning-module-owns model, ban authority + never-vendor-visible link_suggestions, state machines, carried DD, Appendix-A map. No DDL/Prisma/RLS bodies (content passes) |
| Module note | **Admin decides, owning module owns:** M8 holds the **admin work-item + emits the decision event**; the authoritative record is the owning module's — ban (`ban_actions` emits **`VendorBanned`** → M2/M3); verification-task (decision in `trust.verification_decisions`, M5); link-suggestion (confirm → `operations.private_vendor_records`, M4 — A-03). **`link_suggestions` never vendor-visible.** RLS = backstop |

Two governing rules: **(1) Realize, never re-decide** (Doc-2 §10.9 = *what*, FROZEN; Doc-6A = *how*; coin nothing). **(2) Conformance is an obligation** (pass Doc-6A Appendix A; clear `[ESC-6-*]` via named channels).

## Decisions ratified at structure freeze (AD-CR-set)

- **AD-CR1 — 10 tables / 5 groupings (Doc-2 §10.9), coin nothing.** Moderation & Bans (`moderation_cases`+`ban_actions`) · Suggestions (`category_suggestions`+`missing_vendor_suggestions`+`link_suggestions`) · Import (`import_jobs`+`import_rows`) · Verification Tasks (`verification_tasks`) · Outreach (`outreach_campaigns`+`outreach_contacts`). *(outreach = 2.)* An 11th is non-conformant.
- **AD-CR2 — Admin decides, owning module owns.** M8 holds the **admin work-item + emits the decision event**; the authoritative record lives in the owning module — never duplicated/overridden in `admin`. Ban → M2; verification decision → M5; link confirm → M4; category → M2.
- **AD-CR3 — The ban authority (`ban_actions`).** Polymorphic `subject_id`+`subject_type(vendor_profile/organization)`; `scope`/`reason`/`public_banner BOOL`/`state(active/lifted/expired)`. **Emits `VendorBanned`** (Doc-5J single §8 event) → M2 `vendor_profiles.status=banned` + M3 routing excludes (structural — Invariant #11). `public_banner` → M2's reflected banner; the `ban_action` record is admin-only.
- **AD-CR4 — `link_suggestions` never vendor-visible (A-03).** `private_vendor_record_id`(→M4) + `vendor_profile_id`(→M2) + `match_basis(email/phone/trade_license)`/`confidence`/`state(suggested/confirmed/dismissed)`; **confirmation writes the link columns on `operations.private_vendor_records` via the Operations service** (linking never moves/exposes private data). **Strictly platform-staff.**
- **AD-CR5 — Platform-internal RLS + org-suggestion read.** Moderation/ban/import/verification-tasks/link-suggestions/outreach = platform-staff only; `category_suggestions`/`missing_vendor_suggestions` (`suggested_by_organization_id`) = suggesting org + staff.
- **AD-CR6 — Polymorphic subjects (bare UUID + type, no FK).** `moderation_cases`/`ban_actions` `subject_id`+`subject_type` — bare-UUID + discriminator, no FK.
- **AD-CR7 — State machines.** `moderation_cases.state`(open/approved/rejected/escalated) · `ban_actions.state`(active/lifted/expired) · `category_suggestions.state`(submitted/approved/rejected) · `missing_vendor_suggestions.state`(submitted/triaged/closed) · `link_suggestions.state`(suggested/confirmed/dismissed) · `import_jobs.state`(queued/processing/completed/failed) · `verification_tasks.state`(queued/in_review/decided); enum + CHECK.
- **AD-CR8 — Cross-module bare-UUID + events; in-module FKs.** Bare UUID (subjects/orgs/users/category/vendor/private-record/verification-record/created-entity/claim-record); in-module FKs: `import_rows`→`import_jobs`; `outreach_contacts`→`outreach_campaigns`.
- **AD-CR9 — Import.** `job_type(categories/vendor_seed)`; `import_rows` per-row outcome + errors (`created_entity_id` → owning module via service).
- **AD-CR10 — POLICY: registered (Doc-3 v1.7); `[ESC-6-POLICY]` CLEARED.** 2 `admin.*` keys. **No `human_ref`** (CHK-6-002 N/A).
- **AD-CR11 — Verification tasks (M8/M5 boundary).** `verification_tasks` = the Admin work-item (`verification_record_id`→M5, `assigned_to`, `state`); **decision content in `trust.verification_decisions` (M5)** (`verification_task_id` ref — Doc-6G §3.1.2). M8 owns the queue; M5 owns the decision.
- **AD-CR12 — Append-only where applicable; indexing.** `import_rows` append-only; status-tracked records column-scoped (identity/subject frozen); outreach SD; cursor indexes. Carried: DD-MKT/OPS/TRUST, **`[ESC-ADMIN-AUDIT]`**.

## The `admin` schema partition (the structural spine)

| Doc-2 §10.9 table | Grouping | Tenancy / visibility | SD | State | §3.x |
|---|---|---|---|---|---|
| `moderation_cases` | Moderation & Bans | platform-staff | NO | `state` | §3.1 |
| `ban_actions` | ↳ | platform-staff (banner flag → M2 public) | NO | `state` | §3.1 |
| `category_suggestions` | Suggestions | suggesting org + staff | NO | `state` | §3.2 |
| `missing_vendor_suggestions` | ↳ | suggesting org + staff | NO | `state` | §3.2 |
| `link_suggestions` | ↳ | **platform-staff only — never vendor-visible** | NO | `state` | §3.2 |
| `import_jobs` | Import | platform-staff | NO | `state` | §3.3 |
| `import_rows` | ↳ | platform-staff | NO (append-only) | outcome | §3.3 |
| `verification_tasks` | Verification Tasks | platform-staff | NO | `state` | §3.4 |
| `outreach_campaigns`·`outreach_contacts` | Outreach | platform-staff | YES | — | §3.5 |

---

## §0 — Document Control, Precedence & Conformance Obligation
Precedence (Doc-2 · Doc-3 → Doc-4A → Doc-4J → Doc-6A → Doc-6B…6I → **Doc-6J** → Code); realize-never-redecide; pass Doc-6A Appendix A; flag-and-halt. Carried: DD-MKT/OPS/TRUST, `[ESC-ADMIN-AUDIT]`; `[ESC-6-POLICY]` CLEARED (v1.7). **Deps:** `Doc-6A §0/§13`; `Doc-2 §10.9`; `Doc-4J`.

## §1 — Scope & the `admin` Table Partition
Governs 10 tables / not (authoritative vendor/trust/operations records = M2/M5/M4). Admin-decides/owning-module-owns; ban authority; never-vendor-visible link_suggestions. **Deps:** `Doc-2 §2/§10.9`; `Doc-4J`; `Doc-6A §1`.

## §2 — Tenancy & RLS Model *(load-bearing)*
Classes: platform-staff only (moderation/ban/import/verification-tasks/link-suggestions/outreach); org-suggestion (`category_suggestions`/`missing_vendor_suggestions` — suggesting org + staff). `link_suggestions` never vendor-visible (A-03). Ban's public effect = M2's reflected banner. RLS = backstop; authz app-layer (Doc-4J). Tests = Doc-8. **Deps:** `Doc-2 §6/§10.9/§10.11`; `Doc-6A §4`; `Doc-4J`.

## §3 — Per-Aggregate Realization
§3.1 Moderation & Bans (ban_actions emits `VendorBanned`) · §3.2 Suggestions (category/missing-vendor org-readable; link_suggestions staff-only → M4 confirm) · §3.3 Import (jobs + append-only rows) · §3.4 Verification Tasks (M8 work-item; M5 decision) · §3.5 Outreach. **Deps:** `Doc-2 §10.9`; `Doc-4J`; `Doc-6A §3/§5/§6`; `Doc-6B §3.3/§4`.

## §4 — State Machine Realization
The AD-CR7 machines; enum + CHECK; service transitions; `ban_actions` emits `VendorBanned`; `verification_tasks decided` ↔ M5; transitions → `core.outbox_events` per Doc-2 §8 (M8 = authoritative catalog). **Deps:** `Doc-2 §8/§10.9`; `Doc-4J`; `Doc-4L`; `Doc-4M`; `Doc-6A §5.4/§6/§7`.

## §5 — Cross-Module Reads & Firewalls (DD-MKT/OPS/TRUST)
Bare-UUID + service + event: M8 emits `VendorBanned`; owns no authoritative vendor/trust/ops record; verification decision → M5; link confirm → M4; import → owning module. `link_suggestions` never vendor-visible. No cross-module write of an owning-module authoritative table; no cross-schema FK/JOIN/traversal. **Deps:** `Doc-2 §0.3/§8`; `Doc-4J`; `Doc-4L`; `Doc-6A §5`.

## §6 — Indexing & Performance
Cursor sort-key indexes (Band H); subject indexes; work-queue `state` partials; `import_rows(import_job_id)`; partial `WHERE deleted_at IS NULL` (outreach); page-size via `admin.*` POLICY. **Deps:** `Doc-5J`; `Doc-6A §10/§12`; `Doc-3 v1.7`.

## §7 — POLICY & Migration
Forward-only migration (schema → enums → moderation_cases → ban_actions → category_suggestions → missing_vendor_suggestions → link_suggestions → import_jobs → import_rows → verification_tasks → outreach_campaigns → outreach_contacts → indexes → triggers → RLS); POLICY = Doc-3 v1.7 (CLEARED). **Deps:** `Doc-6A §9/§10/§11`; `Doc-3 v1.7`.

## §8 — Conformance & Carried Items
Appendix-A attestation map (Band C platform-staff/org-suggestion + never-vendor-visible link_suggestions; Band D append-only import_rows; Band E ban/moderation outbox + `VendorBanned`; CHK-6-002 N/A); carried register (DD-MKT/OPS/TRUST, `[ESC-ADMIN-AUDIT]`); coins nothing; `[ESC-6-POLICY]` cleared. **Deps:** `Doc-6A Appendix A`; `Doc-2 §10.9`.

## Appendix A — Doc-6J Conformance Attestation (Doc-6A `CHK-6-001…093`)
Highlights: **Band C PASS** (platform-staff RLS; org-suggestion read; **link_suggestions never vendor-visible** — CHK-6-022 in-scope) · Band D PASS (append-only import_rows; column-scoped ban identity) · Band E PASS (CHK-6-040/041; `VendorBanned`; M8 = authoritative catalog; `[ESC-ADMIN-AUDIT]` at 043) · **CHK-6-002 N/A** (no human_ref) · CHK-6-050 N/A (no money) · CHK-6-005 PASS (work-queue partials). **Deps:** `Doc-6A Appendix A`; `Doc-5J`.

---

## Open Carried Items
| ID | Item | Doc-6J handling | Freeze gate? |
|---|---|---|---|
| DR-6-CORE / DR-6-STATE / DR-6-API | core consumed / machines / Doc-5J persistable | by pointer / enum+CHECK+service-event / Band H | No |
| DD-MKT / DD-OPS / DD-TRUST | ban/category (M2) / link confirm (M4) / verification (M5) | emit/consume events; service; owning module owns | No |
| **Admin-decides/owning-module-owns** | M8 owns no authoritative record | work-item + decision event only | **Load-bearing** |
| **`link_suggestions` never vendor-visible** | A-03 | staff-only RLS; confirm via M4 service | **Load-bearing (in-scope CHK-6-022)** |
| **`[ESC-ADMIN-AUDIT]`** | admin audit actions (M8 owns the §9 catalog) | bind/define per Doc-4J §9 at content | No (content) |
| `[ESC-6-POLICY]` | `admin.*` keys | **CLEARED** — Doc-3 v1.7 | No |
| `[ESC-6-SCHEMA]`/`[ESC-6-API]` | physical/Doc-5J gap | none expected | Possible (none expected) |

## Fences / Out of scope
Any non-`admin` table · the authoritative vendor/trust/operations records (M2/M5/M4) · coining any element · a cross-schema FK · cross-schema RLS traversal · **M8 owning/overriding an owning-module authoritative record** · **a vendor-visible `link_suggestions` surface** · DDL/Prisma/migration bodies (content passes).

---

*End of Doc-6J Canonical Structure v1.0 (FROZEN). Frozen 2026-06-26; supersedes the Proposal (v0.2, 2 MAJOR + 2 MINOR + 1 NIT applied); certified by `Doc-6J_Structure_Freeze_Audit_v1.0.md`. On any conflict, Doc-2 (the *what*-authority) and Doc-6A (the *how*) win; flag-and-halt. Doc-6J realizes the 10 `admin` tables verbatim from Doc-2 §10.9 against frozen Doc-6A — the authoritative event catalog; Admin decides, owning module owns; the ban authority (emits VendorBanned); never-vendor-visible link_suggestions; coins nothing. Carried: Admin-decides/owning-module-owns + link non-disclosure (load-bearing) + `[ESC-ADMIN-AUDIT]`. Next: content passes → Content Hard Review → Content Freeze Audit → `Doc-6J_SERIES_FROZEN`.*
