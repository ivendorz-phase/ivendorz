# Doc-5J — Admin Operations (M8 `admin`) API Realization — Content v1.0 Pass-1

| Field | Value |
|---|---|
| Document | Doc-5J Content v1.0 Pass-1 |
| Status | **CONTENT IN PROGRESS — Pass-1 (§0–§3 + §2 inventory)** |
| Pass-1 scope | §0 Document Control · §1 Scope & Partition · §2 Realized Endpoint Inventory (32 caller tokens) · §3 Cross-Cutting Platform-Staff Wire Model (incl. §3.8 error map + §3.9 envelope) |
| Conforms to | `Doc-5J_Structure_v1.0_FROZEN.md` (partition + R1–R10 authoritative); `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4J_FROZEN_v1.0` (§H + BC-ADM-1…6) |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A` (FROZEN) governs |
| Pass-2 / Pass-3 | Pass-2 = §4 (BC-ADM-1) · §5 (BC-ADM-2) · §6 (BC-ADM-3); Pass-3 = §7 (BC-ADM-4) · §8 (BC-ADM-5) · §9 (BC-ADM-6) · §10 Out-of-Wire · §11 Conformance · Appendix A |

> **Realize, never re-decide.** Doc-4J fixed M8's 34 contracts (FROZEN); Doc-5A fixed the wire mechanics. Doc-5J realizes the **32 caller-facing** tokens; the 2 System workers + all internal legs are out-of-wire (§10/R1). Every field/slug/machine/audit/event traces verbatim to `Doc-4J §H`/BC-ADM-x. Doc-5J coins nothing.

---

## §0 — Document Control, Precedence & Conformance Obligation

- **Precedence:** … → `Doc-4A` → **`Doc-4B`** (Core consumed) → **`Doc-4C`** (Identity consumed) → `Doc-4J` → `Doc-5A` → **Doc-5J** → Code. Doc-5J conforms to Doc-5A in full and passes the Doc-5A **Appendix A** (`CHK-5A-xxx`) checklist before content freeze.
- **Disciplines:** realize-never-redecide · reference-never-restate · **flag-and-halt** on any frozen-corpus conflict (cite both sources; escalate; never resolve locally).
- **Two content-freeze obligations stated up front:**
  1. **`reference_id` (C-05):** every body-bearing response carries a top-level `reference_id` (`Doc-4A §22.1 C-05`; `PATCH-D4A-C05-204` — `204` exempt). Nominated declaration point = §4 (cross-cutting to §5–§9), realized via §3.9.
  2. **`[ESC-ADM-POLICY]` content-freeze gate (`CHK-5A-121`):** the wire-referenced POLICY keys (idempotency dedup-window, list page-size) are registered via an additive `Doc-3 §12.2` `admin.*` patch (precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2 / `trust.*` v1.3 / `operations.*` v1.4 / `communication.*` v1.5 / `billing.*` v1.6 → **`admin.*` v1.7**, the next free number; Doc-4A §18.2). Content-pass flag: confirm `admin.*` vs the named `moderation.*` set (`Doc-4J §H.8`/Appendix B) **in the patch, not here**.
- **Doc-5J coins** no endpoint, status, header, error class, permission slug, POLICY key, audit action, or event.

---

## §1 — Scope, Audience & M8 Surface Partition

**Doc-5J governs:** the M8 **caller-facing HTTP surface — platform-staff Admin only.** It does **not** govern: another module's surface (cross-module → that module's Doc-5x), the 2 System workers, or any internal/write-via-service/event-consumer leg (§10/R1).

**§1.x dependency boundary.** M8 realizes only M8 surfaces. Cross-module effects are consumed/effected **via in-process service, never realized** here (Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Operations → Doc-5F, Trust → Doc-5G, Billing → Doc-5I, Communication → Doc-5H). Carried by pointer (none resolved here): **DR-ADM-1 / DR-ADM-MKT / DR-ADM-RFQ / DR-ADM-OPS / DR-ADM-TRUST / DR-ADM-PC** + `[ESC-ADM-SLUG]` / `[ESC-ADM-AUDIT]` / `[ESC-ADM-POLICY]` / `[ESC-ADM-EVENT]`. **`DR-ADM-COMM` does not exist** in the frozen corpus.

**Cross-module trace (O-01):** the `link_suggestions` **entity** is Admin-owned (BC-ADM-3) — reciprocal of M4 **DF-5**; `confirm_link_suggestion` writes the link **columns** on `operations.private_vendor_records` via the Operations service (DR-ADM-OPS/A-03, out-of-wire §10), while M4's tenant-side `confirm_vendor_link` writes its own row — same private record, different actor/side, no conflict.

**Partition (authoritative = `Doc-5J_Structure_v1.0_FROZEN.md`):** 34 Doc-4J tokens = **32 caller-facing** (§4–§9) + **2 out-of-wire** (§10). §4(5) · §5(4) · §6(7) · §7(4) · §8(5) · §9(7) = 32; §10 = `expire_ban` + `process_import_job`.

---

## §2 — Realized Endpoint Inventory (32 caller-facing)

Route prefix `admin` (R3; `Doc-5A App B.1`). Method = `Doc-5A §5.2`; path = `§5.3`; success = `§5.5`. **Actor = platform-staff Admin throughout; no active-org column (R2); disclosure = `Staff-Internal` for every read.** Tokens verbatim from `Doc-4J` PassB. **Inventory ordering is non-authoritative — the partition table wins on any conflict.** `[ESC-ADM-SLUG]` is the carried marker (12 of 32 rows), never a coined slug.

| # | Contract token | Method · Path | Bound slug | Success |
|---|---|---|---|---|
| **BC-ADM-1 — Moderation (§4)** ||||
| 1 | `admin.create_moderation_case.v1` | `POST /admin/moderation-cases` | `staff_can_moderate_rfq` | `201` |
| 2 | `admin.assign_moderation_case.v1` | `POST /admin/moderation-cases/{case_id}/assign-moderation-case` | `staff_can_moderate_rfq` | `200` |
| 3 | `admin.decide_moderation_case.v1` | `POST /admin/moderation-cases/{case_id}/decide-moderation-case` | `staff_can_moderate_rfq` | `200` |
| 4 | `admin.get_moderation_case.v1` | `GET /admin/moderation-cases/{case_id}` | `staff_can_moderate_rfq` | `200` |
| 5 | `admin.list_moderation_cases.v1` | `GET /admin/moderation-cases` | `staff_can_moderate_rfq` | `200` |
| **BC-ADM-2 — Enforcement (§5)** ||||
| 6 | `admin.issue_ban.v1` | `POST /admin/ban-actions` | `staff_can_ban` | `201` |
| 7 | `admin.lift_ban.v1` | `POST /admin/ban-actions/{ban_id}/lift-ban` | `staff_can_ban` | `200` |
| 8 | `admin.get_ban_action.v1` | `GET /admin/ban-actions/{ban_id}` | `staff_can_ban` | `200` |
| 9 | `admin.list_ban_actions.v1` | `GET /admin/ban-actions` | `staff_can_ban` | `200` |
| **BC-ADM-3 — Suggestions (§6)** ||||
| 10 | `admin.decide_category_suggestion.v1` | `POST /admin/suggestions/{suggestion_id}/decide-category-suggestion` | `staff_can_manage_categories` | `200` |
| 11 | `admin.triage_missing_vendor_suggestion.v1` | `POST /admin/suggestions/{suggestion_id}/triage-missing-vendor-suggestion` | `[ESC-ADM-SLUG]` | `200` |
| 12 | `admin.close_missing_vendor_suggestion.v1` | `POST /admin/suggestions/{suggestion_id}/close-missing-vendor-suggestion` | `[ESC-ADM-SLUG]` | `200` |
| 13 | `admin.confirm_link_suggestion.v1` | `POST /admin/suggestions/{suggestion_id}/confirm-link-suggestion` | `[ESC-ADM-SLUG]` | `200` |
| 14 | `admin.dismiss_link_suggestion.v1` | `POST /admin/suggestions/{suggestion_id}/dismiss-link-suggestion` | `[ESC-ADM-SLUG]` | `200` |
| 15 | `admin.get_suggestion.v1` | `GET /admin/suggestions/{suggestion_id}` (`root` discriminator) | per-root (`staff_can_manage_categories` / `[ESC-ADM-SLUG]`) | `200` |
| 16 | `admin.list_suggestions.v1` | `GET /admin/suggestions` (`root` filter) | per-root (as above) | `200` |
| **BC-ADM-4 — Data Import (§7)** ||||
| 17 | `admin.submit_import_job.v1` | `POST /admin/import-jobs` | `[ESC-ADM-SLUG]` | `201` (create-then-poll, R10) |
| 18 | `admin.get_import_job.v1` | `GET /admin/import-jobs/{job_id}` | `[ESC-ADM-SLUG]` | `200` |
| 19 | `admin.list_import_jobs.v1` | `GET /admin/import-jobs` | `[ESC-ADM-SLUG]` | `200` |
| 20 | `admin.list_import_rows.v1` | `GET /admin/import-jobs/{job_id}/rows` | `[ESC-ADM-SLUG]` | `200` |
| **BC-ADM-5 — Verification Workflow (§8)** ||||
| 21 | `admin.queue_verification_task.v1` | `POST /admin/verification-tasks` | `staff_can_verify` | `201` |
| 22 | `admin.assign_verification_task.v1` | `POST /admin/verification-tasks/{task_id}/assign-verification-task` | `staff_can_verify` | `200` |
| 23 | `admin.decide_verification_task.v1` | `POST /admin/verification-tasks/{task_id}/decide-verification-task` | `staff_can_verify` | `200` |
| 24 | `admin.get_verification_task.v1` | `GET /admin/verification-tasks/{task_id}` | `staff_can_verify` | `200` |
| 25 | `admin.list_verification_tasks.v1` | `GET /admin/verification-tasks` | `staff_can_verify` | `200` |
| **BC-ADM-6 — Vendor Outreach (§9)** ||||
| 26 | `admin.create_outreach_campaign.v1` | `POST /admin/outreach-campaigns` | `[ESC-ADM-SLUG]` | `201` |
| 27 | `admin.run_outreach_campaign.v1` | `POST /admin/outreach-campaigns/{campaign_id}/run-outreach-campaign` | `[ESC-ADM-SLUG]` | `200` |
| 28 | `admin.complete_outreach_campaign.v1` | `POST /admin/outreach-campaigns/{campaign_id}/complete-outreach-campaign` | `[ESC-ADM-SLUG]` | `200` |
| 29 | `admin.add_outreach_contact.v1` | `POST /admin/outreach-campaigns/{campaign_id}/contacts` | `[ESC-ADM-SLUG]` | `201` |
| 30 | `admin.update_outreach_contact.v1` | `POST /admin/outreach-campaigns/{campaign_id}/contacts/{contact_id}/update-outreach-contact` | `[ESC-ADM-SLUG]` | `200` |
| 31 | `admin.get_outreach_campaign.v1` | `GET /admin/outreach-campaigns/{campaign_id}` | `[ESC-ADM-SLUG]` | `200` |
| 32 | `admin.list_outreach_campaigns.v1` | `GET /admin/outreach-campaigns` | `[ESC-ADM-SLUG]` | `200` |

**Count:** §4(5) + §5(4) + §6(7) + §7(4) + §8(5) + §9(7) = **32 caller-facing** ✓. Out-of-wire (§10): `admin.expire_ban.v1`, `admin.process_import_job.v1`. **Total 34** ✓.

> **R10:** `submit_import_job` synchronously creates the `import_jobs` resource (`job_id`, `state=queued`) → lean **`201`**; the System `process_import_job` advances it out-of-wire (§10); caller polls `get_import_job`. **`run`/`complete_outreach_campaign` are plain `200` state commands — NOT async** (BC-ADM-6 has no 21.5 System contract).

---

## §3 — Cross-Cutting Platform-Staff Actor, Authorization & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*

### §3.1 Actor Model (R2)

| Actor | Status |
|---|---|
| **Platform-staff Admin** | The **only** wire actor (Doc-4J §H.3; `Doc-4A §5.6`). Server-determined; **no field/header asserts it** (`Doc-4A §9.7`). |
| Tenant User | **None** — M8 has no tenant-User surface. |
| Public / Anonymous | **None** — no public surface. |
| System | **Out-of-wire** (R1; §10) — `expire_ban`, `process_import_job`, dual-template auto-queue legs. |

- **No `Iv-Active-Organization`** — platform-staff actions are **not org-scoped** (R2); the active-org header is not carried.
- **Stage-5 DELEGATION is n/a throughout** — no representative-org scenario (Doc-4J §H.3).
- `Authorization` bearer = authentication only.

### §3.2 Authorization Wire Model

**Identity `check_permission` is the sole authorization authority for all M8 surfaces. No parallel, shadow, or caller-supplied authorization path** (`Doc-4A §5.3/§5.6/§6`). Platform-staff **three-layer check** — active-staff **Membership + Permission Slug + Resource Scope** — resolved server-side via Identity (`Doc-4C §C3/§C8`).

```
check_permission({
  actor_id:  <resolved from bearer — Identity sub, platform-staff>
  org_id:    <none — platform-staff, no active-org context (R2)>
  resource:  'admin'
  action:    <staff slug — see §3.7 per-command bound-slug register>
}) → { permitted: boolean }
```

If `permitted = false` → `403` (error_class **`AUTHORIZATION`**, §3.8; never `404` for command denial; the `404` collapse is the read-side non-disclosure pattern of §3.5).

**Frozen platform-staff slugs (Doc-2 §7; Doc-4J §H.3 — no slug invented):** `staff_can_moderate_rfq` (BC-ADM-1), `staff_can_ban` (BC-ADM-2), `staff_can_manage_categories` (BC-ADM-3 **category-suggestion decisions ONLY**), `staff_can_verify` (BC-ADM-5). `[ESC-ADM-SLUG]` carried for missing-vendor + link decisions (BC-ADM-3), import (BC-ADM-4), outreach (BC-ADM-6). **`staff_super_admin`** = the audited-and-flagged override.

### §3.3 Firewall & Boundary Wire Constraints (binding; each a Flag-and-Halt trigger)

| ID | Wire rule | Authority |
|---|---|---|
| **AF-1 (R5)** | **Admin decides; the owning module owns.** M8 writes **only** its own aggregates (`moderation_cases`, `ban_actions`, `category/missing_vendor/link_suggestions`, `import_jobs`, `verification_tasks`, `outreach_campaigns`). Every synchronous cross-module effect of an Admin decision = an **in-process service call to the owning module** (out-of-wire §10). **No cross-module table write, no cross-module FK, no Admin HTTP surface for another module's data; no owning-module domain bypass** (Invariant #7 / Red Flag #8; `Doc-4A §5.3/§4.3`) |
| **AF-2 (R7)** | **Procurement moat — Admin governs, does not procure.** No matching / routing / ranking / supplier-selection / award / eligibility surface (RFQ — Doc-4E). Vendor outreach (BC-ADM-6) is **informational acquisition only** (Doc-4J §H.7) |
| **AF-3 (R8)** | **Trust / governance-signal firewall.** M8 computes/owns/stores **no** trust/performance/verification/financial-tier score. `verification_tasks ≠ trust.verification_records` / `≠ trust.verification_decisions` — Admin owns the workflow, Trust owns the decision + any score (DR-ADM-TRUST) |
| **AF-4 (R9)** | **Single event.** Only `admin.issue_ban.v1` emits a Doc-2 §8 event — **`VendorBanned`** (BC-ADM-2; M0 outbox). BC-ADM-1/3/4/5/6 emit **No Event**. No event coined; consumers (Marketplace reflect / Communication notify / Trust Protection freeze) own their effects |

### §3.4 State Machine Authorities (8 machines; `Doc-2 §3.9/§10.9`; `Doc-4M` = index only)

**Edges sourced from frozen Doc-2 §3.9 (Doc-4J §H.5). No edge added or modified. Illegal transition → `409 STATE`; lost optimistic-concurrency race (`expected_state` mismatch) → `409 CONFLICT`.**

| Aggregate (BC) | Machine |
|---|---|
| `moderation_cases` (1) | `open → approved / rejected / escalated` |
| `ban_actions` (2) | `active → lifted → expired` (expiry **only from `lifted`**; System `expire_ban` §10) |
| `category_suggestions` (3) | `submitted → approved / rejected` |
| `missing_vendor_suggestions` (3) | `submitted → triaged → closed` |
| `link_suggestions` (3) | `suggested → confirmed / dismissed` |
| `import_jobs` (4) | `queued → processing → completed / failed` (forward-only; `process_import_job` §10) |
| `verification_tasks` (5) | `queued → in_review → decided` |
| `outreach_campaigns` (6) | `draft → running → completed` |

### §3.5 Non-Disclosure Wire Model (R6; `Doc-4A §7.5`; `Doc-4J §H.4`)

Every M8 read is **Staff-Internal**. (i) Structurally there is **no tenant/public wire** (R2) — staff-internal content (esp. `link_suggestions`) cannot leak through an M8 tenant surface (none exists). (ii) On M8's own wire, an **unauthorized / cross-scope staff read collapses to `404 NOT_FOUND`** — no side-channel.

| Scenario | Response (class §3.8) |
|---|---|
| Resource resolves, staff authorized | `200 OK` |
| Resource does not exist | `404 NOT_FOUND` |
| Resource exists, staff not authorized to view it | `404 NOT_FOUND` (NOT `403`) |
| Requesting actor lacks the read slug entirely | `403 AUTHORIZATION` |

> The vendor-facing side of a link (where one exists) is owned/realized by the owning module (Operations/Marketplace), never here.

### §3.6 Per-Read Disclosure-Scope Register (binding) — all `Staff-Internal`

**Every read in §4–§9 declares `Staff-Internal` (the only caller disclosure scope; `Internal-Service` is out-of-wire §10 only). Ambiguity = content blocker.**

| Read | Scope |
|---|---|
| `get_moderation_case` · `list_moderation_cases` | Staff-Internal |
| `get_ban_action` · `list_ban_actions` | Staff-Internal |
| `get_suggestion` · `list_suggestions` | Staff-Internal (link reads never vendor-served — R6) |
| `get_import_job` · `list_import_jobs` · `list_import_rows` | Staff-Internal |
| `get_verification_task` · `list_verification_tasks` | Staff-Internal |
| `get_outreach_campaign` · `list_outreach_campaigns` | Staff-Internal |

(13 reads.)

### §3.7 Per-Command Bound-Slug Register (binding; the M8 analog of the per-command actor-side rule)

**Every command in §4–§9 declares exactly one bound platform-staff slug (frozen four / `staff_super_admin` override / `[ESC-ADM-SLUG]`). Undeclared/ambiguous = content blocker.**

| Command | Bound slug |
|---|---|
| `create_moderation_case` · `assign_moderation_case` · `decide_moderation_case` | `staff_can_moderate_rfq` |
| `issue_ban` · `lift_ban` | `staff_can_ban` |
| `decide_category_suggestion` | `staff_can_manage_categories` (category decisions ONLY) |
| `triage_missing_vendor_suggestion` · `close_missing_vendor_suggestion` · `confirm_link_suggestion` · `dismiss_link_suggestion` | `[ESC-ADM-SLUG]` |
| `submit_import_job` | `[ESC-ADM-SLUG]` |
| `queue_verification_task` · `assign_verification_task` · `decide_verification_task` | `staff_can_verify` |
| `create_outreach_campaign` · `run_outreach_campaign` · `complete_outreach_campaign` · `add_outreach_contact` · `update_outreach_contact` | `[ESC-ADM-SLUG]` |

**Command count:** 3 + 2 + 1 + 4 + 1 + 3 + 5 = **19 commands** ✓ (+ 13 reads = 32). `staff_super_admin` is a flagged override on any command (Doc-2 §7; audited).

### §3.8 Error-Class → HTTP Status (canonical; binds §4–§9)

**Doc-5J coins no error class / status. Closed set + status owned by `Doc-5A §6.2` (`Doc-4A §12.2`; `Doc-4J §H.4`). MUST NOT remap or return a class outside the set.**

| `error_class` | Status | M8 usage |
|---|---|---|
| `VALIDATION` | `400` | Malformed body / wrong type / enum / blank; undeclared `filter`/`sort`; `page_size` over POLICY max (SYNTAX) |
| `AUTHORIZATION` | `403` | `check_permission` denied (no slug / not platform-staff) |
| `NOT_FOUND` | `404` | Resource absent; unauthorized/cross-scope staff read collapse (§3.5) |
| `STATE` | `409` | Illegal state-machine transition (§3.4) |
| `CONFLICT` | `409` | `expected_state` mismatch (lost optimistic-concurrency race) |
| `REFERENCE` | `422` | A supplied cross-module reference does not resolve (definitive; `retryable:false`) |
| `BUSINESS` | `422` | A cited M8 business rule rejected the operation |
| `DEPENDENCY` | `503` | An owning service transiently unavailable (`retryable:true`) |
| `SYSTEM` | `500` | Unexpected (`retryable:true`) |

> Branch on `error_class`/`error_code`, never status alone (`Doc-4A §12.3`). Error codes `admin_<domain>_<code>` (`Doc-4J §H.4`). `DEPENDENCY`/`SYSTEM` apply universally and are not repeated per-contract. `RATE_LIMITED (429)` / `QUOTA (403)` / `ASYNC_PENDING` are defined upstream but **not used by M8 today**. **`REFERENCE`≠`DEPENDENCY`; `STATE`≠`CONFLICT`** — never merged.

### §3.9 Response Envelope & Pagination (canonical; binds §4–§9)

**Owned by `Doc-5A §5.5/§5.6/§8` (`Doc-4A §10.1–§10.5/§9.6/§22.1 C-05`). Restated once; not repeated per contract.**

- **Single-entity success** (`200`/`201`): `{ "result": <representation>, "reference_id": "<uuidv7>" }`; `201` also carries a `Location` header.
- **List success** (`200`): `{ "items": [ … ], "page_info": { "next_cursor": "<opaque>|null", "has_more": <bool>, "total_count": <int, optional> }, "reference_id": "<uuidv7>" }`.
- **Error**: `{ "error": { "error_class", "error_code", "message", "field_errors"(VALIDATION only), "retryable" }, "reference_id": "<uuidv7>" }`.
- **`reference_id`** top-level on **every** response (`Doc-4A §22.1 C-05`; `PATCH-D4A-C05-204` — `204` exempt). Reserved key — no representation field may be named `reference_id`.
- **Pagination** (`Doc-5A §8`; `Doc-4A §9.6`): cursor-based only; params **`page_size`** + **`cursor`**; `page_size` bounds referenced by the `[ESC-ADM-POLICY]` page key, **never a literal**; over-max → `400 VALIDATION`. Filter/sort via the declared allowlist grammar; undeclared field → `400 VALIDATION`.
- **Prohibited request fields** (`Doc-4A §9.7`; forbidden in path/query/body/header): attribution, tenant-selection, **actor assertion** (no field asserts platform-staff — server-determined, R2), authorization, lifecycle-state (use `expected_state` concurrency assertion, not a target-state flag), POLICY-override, soft-delete, `human_ref`-as-reference.
- **Idempotency** (`Doc-4J §H.8`): every command carries `Idempotency-Key` (required); dedup window = `[ESC-ADM-POLICY]` (never a literal). **Concurrency** (`§H.9`): state transitions use `expected_state` → lost race `409 CONFLICT`.

> In §4–§9, each **Response** block shows only the `<representation>` carried inside the §3.9 envelope; each **error table** lists only the classes that contract can raise (`Doc-5A §5.7`).

---

*Pass-1 complete. §0–§3 + §2 inventory (32 caller tokens) authored, field-traced to `Doc-4J §H`/BC-ADM-1…6. §3 binding registers locked: §3.6 (13 read scopes, all Staff-Internal) + §3.7 (19 command bound-slugs) + §3.8 error map + §3.9 envelope. Pass-2 covers §4 (BC-ADM-1) · §5 (BC-ADM-2) · §6 (BC-ADM-3).*
