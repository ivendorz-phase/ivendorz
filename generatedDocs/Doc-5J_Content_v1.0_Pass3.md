# Doc-5J — Admin Operations (M8 `admin`) API Realization — Content v1.0 Pass-3

| Field | Value |
|---|---|
| Document | Doc-5J Content v1.0 Pass-3 |
| Status | **CONTENT IN PROGRESS — Pass-3 (§7 · §8 · §9 · §10 · §11 · Appendix A)** |
| Builds on | `Doc-5J_Content_v1.0_Pass1.md` (§0–§3) + `…Pass2.md` (§4–§6) |
| Conforms to | `Doc-5J_Structure_v1.0_FROZEN.md`; `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4J_FROZEN_v1.0` BC-ADM-4/5/6 + §H |

> §3 binds (Pass-1): §3.8 error map, §3.9 envelope, §3.6 read scopes (Staff-Internal), §3.7 bound-slugs. Each Response shows the `<representation>` in the §3.9 envelope; error tables list only contract-raisable classes (`DEPENDENCY 503`/`SYSTEM 500` universal). Fields trace to `Doc-4J` BC-ADM-x verbatim; **list `filter` allowlists are the Doc-4J "admin search view" read-model dimensions**; any field not pinned in Doc-4J carries `[ESC-ADM-FIELD]` (never coined). `reference_id` top-level on every body (C-05, §4).

---

## §7 — Data Import Surface Realization (BC-ADM-4, 4 caller-facing)

### §7.1 Section Purpose & Wire Constraints

BC-ADM-4 owns `import_jobs` (+ child `import_rows`); machine `queued → processing → completed / failed` (forward-only). **R10 create-then-poll:** `submit_import_job` synchronously creates the job (`state=queued`, lean `201`); the System `process_import_job` advances it **out-of-wire** (§10/R1); the caller polls `get_import_job`. Import-seed entities are written **via the Marketplace service** inside `process_import_job` (out-of-wire; AF-1/R5 — Marketplace owns them). Bound slug `[ESC-ADM-SLUG]` (no §7 import slug — Doc-4J §H.3). Audit = §9 "import job execution"; **No Event**.

### §7.2 Import Command

#### `admin.submit_import_job.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/import-jobs` |
| Actor · Slug | Admin · `[ESC-ADM-SLUG]` (platform scope) |
| Success | `201 Created` (+ `Location`) — create-then-poll (R10) |
| Idempotency | `Idempotency-Key` required; keyed on (`job_type`,`file_ref`) → one job |
| Audit | §9 "import job execution" by pointer (`entity_type=import_jobs`) |
| Events | None |

**Request body:**
```json
{
  "job_type": "enum<categories|vendor_seed> (required; Doc-4J BC-ADM-4)",
  "file_ref": "string (required; storage ref — DR-ADM-PC)"
}
```

**Response `201`** — `{ "job_id": "uuid", "state": "queued" }`. **`201` justification (R10):** the frozen `Doc-4J` BC-ADM-4 `submit_import_job` response is a **synchronous resource** (`job_id`, `state=queued`, `reference_id`) → lean `201` created-queued (not `202`, which applies only when no synchronous resource is modeled). Advance is out-of-wire; poll `get_import_job`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `job_type` not in enum; `file_ref` missing |
| `AUTHORIZATION` | `403` | lacks the import staff slug (`[ESC-ADM-SLUG]`) |
| `REFERENCE` | `422` | `file_ref` does not resolve at storage (definitive) |

### §7.3 Import Reads (Staff-Internal)

#### `admin.get_import_job.v1` · `admin.list_import_jobs.v1` · `admin.list_import_rows.v1`

| Field | Value |
|---|---|
| Method · Path | `GET /admin/import-jobs/{job_id}` · `GET /admin/import-jobs` · `GET /admin/import-jobs/{job_id}/rows` |
| Actor · Slug | Admin · `[ESC-ADM-SLUG]` |
| Disclosure | **Staff-Internal**; cross-scope → `404` |
| Pagination | `page_size`+`cursor` (list_jobs: `filter {job_type?, state?}`; list_rows: scoped to `job_id`) |
| Audit / Events | Not audited / None |

**Response `200`** — job detail / job list / row view (the polled status resource is source of truth — R10), §3.9 envelope.

**Errors:** `AUTHORIZATION 403`; `NOT_FOUND 404` (`job_id` absent/cross-scope); list adds `VALIDATION 400`.

---

## §8 — Verification Workflow Surface Realization (BC-ADM-5, 5 caller-facing)

### §8.1 Section Purpose & Wire Constraints

BC-ADM-5 owns `verification_tasks` (**workflow only**; `queued → in_review → decided`). **Firewall (AF-3/R8):** `verification_tasks ≠ trust.verification_records` / `≠ trust.verification_decisions` — **Admin owns the workflow; Trust stores the decision content and any score.** `queue_verification_task` is dual-template — only the **Admin caller leg** realized; the System auto-queue leg is out-of-wire (§10). `decide_verification_task` records the decision **via the Trust service** (out-of-wire §10/R5/R8). Bound slug `staff_can_verify` (all 5). Audit = **`[ESC-ADM-AUDIT]`** (workflow not separately §9-enumerated — nearest by pointer, no action invented); **No Event**.

### §8.2 Verification Commands

#### `admin.queue_verification_task.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/verification-tasks` |
| Actor · Slug | Admin · `staff_can_verify` |
| Success | `201 Created` (+ `Location`) · Idempotency required (keyed on `verification_record_id`) · Audit `[ESC-ADM-AUDIT]` · No Event |

**Request body:** `{ "verification_record_id": "uuid (required; Trust ref — DR-ADM-TRUST)" }` (System auto-queue variant out-of-wire §10).

**Response `201`** — `{ "task_id": "uuid", "state": "queued" }`.

**Errors:** `VALIDATION 400`; `AUTHORIZATION 403`; `REFERENCE 422` (`verification_record_id` does not resolve at Trust).

---

#### `admin.assign_verification_task.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/verification-tasks/{task_id}/assign-verification-task` |
| Actor · Slug | Admin · `staff_can_verify` · `200 OK` · Idempotency required · Audit `[ESC-ADM-AUDIT]` · No Event |

**Request body:** `{ "assigned_to": "uuid (required; Identity ref)", "expected_state": "enum<queued> (required; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "task_id": "uuid", "state": "in_review" }`.

**Errors:** `NOT_FOUND 404`; `STATE 409` (not `queued`); `CONFLICT 409`; `REFERENCE 422` (`assigned_to` at Identity).

---

#### `admin.decide_verification_task.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/verification-tasks/{task_id}/decide-verification-task` |
| Actor · Slug | Admin · `staff_can_verify` · `200 OK` · Idempotency required (terminal-idempotent; no second Trust write) · Audit `[ESC-ADM-AUDIT]` (workflow transition; the decision **content** is audited by Trust where Trust stores it) · No Event |

**Request body:** `{ "decision": "(required; passed to Trust — NOT stored here)", "expected_state": "enum<in_review> (required; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "task_id": "uuid", "state": "decided" }`.

> The decision is **recorded via the Trust service** (out-of-wire §10/R5/R8; Trust stores the record/decision and any score — firewall AF-3). M8 stores no verification record and computes no score.

**Errors:** `NOT_FOUND 404`; `STATE 409` (not `in_review`); `CONFLICT 409`; `DEPENDENCY 503` (Trust service transient — distinct from `REFERENCE`).

### §8.3 Verification Reads (Staff-Internal)

#### `admin.get_verification_task.v1` · `admin.list_verification_tasks.v1`

| Field | Value |
|---|---|
| Method · Path | `GET /admin/verification-tasks/{task_id}` · `GET /admin/verification-tasks` |
| Actor · Slug | Admin · `staff_can_verify` |
| Disclosure | **Staff-Internal**; cross-scope → `404` |
| Pagination | `page_size`+`cursor`; `filter {state?, assigned_to?}` |
| Audit / Events | Not audited / None |

**Response `200`** — detail (workflow + the `verification_record_id` reference; decision content read from Trust, not stored here) / list view, §3.9 envelope.

**Errors:** `AUTHORIZATION 403`; `NOT_FOUND 404`; list adds `VALIDATION 400`.

---

## §9 — Vendor Outreach Surface Realization (BC-ADM-6, 7 caller-facing)

### §9.1 Section Purpose & Wire Constraints

BC-ADM-6 owns `outreach_campaigns` (+ child contacts); machine `draft → running → completed`. **Moat (AF-2/R7): informational acquisition only — no matching / routing / ranking / supplier-selection / award / eligibility.** `run`/`complete` are **plain state commands (`200`), NOT async** (no 21.5 System contract — excluded from R10). Bound slug `[ESC-ADM-SLUG]` (no §7 outreach slug). Audit = **`[ESC-ADM-AUDIT]`** (outreach not §9-enumerated); **No Event**.

### §9.2 Outreach Commands

#### `admin.create_outreach_campaign.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/outreach-campaigns` · Admin · `[ESC-ADM-SLUG]` · `201 Created` (+ `Location`) · Idempotency required · Audit `[ESC-ADM-AUDIT]` · No Event |

**Request body:** `{ "...": "campaign attributes per Doc-4J BC-ADM-6 PassB field registry — `[ESC-ADM-FIELD]` pending exact fields; not coined here" }`

**Response `201`** — `{ "campaign_id": "uuid", "state": "draft" }`.

**Errors:** `VALIDATION 400`; `AUTHORIZATION 403`.

---

#### `admin.run_outreach_campaign.v1` · `admin.complete_outreach_campaign.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/outreach-campaigns/{campaign_id}/run-outreach-campaign` (`draft → running`) · `POST …/complete-outreach-campaign` (`running → completed`) · Admin · `[ESC-ADM-SLUG]` · `200 OK` · Idempotency required (terminal-idempotent) · Audit `[ESC-ADM-AUDIT]` · No Event |

**Request body:** `{ "expected_state": "enum (required; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "campaign_id": "uuid", "state": "running | completed" }`.

> **Not async** — plain state commands, optimistic concurrency (excluded from R10). Informational only — no procurement (moat AF-2).

**Errors:** `NOT_FOUND 404`; `STATE 409` (forbidden source); `CONFLICT 409`.

---

#### `admin.add_outreach_contact.v1` · `admin.update_outreach_contact.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/outreach-campaigns/{campaign_id}/contacts` (append child → `201`) · `POST …/contacts/{contact_id}/update-outreach-contact` (`200`) · Admin · `[ESC-ADM-SLUG]` · Idempotency required (`add` keyed on (`campaign_id`,target) → no duplicate) · Audit `[ESC-ADM-AUDIT]` · No Event |

**Request body:** `{ "vendor_*_id": "uuid (required; Marketplace target — Doc-4J BC-ADM-6 `vendor_*_id`; exact field per Doc-4J PassB, `[ESC-ADM-FIELD]`; DR-ADM-MKT)", "...": "contact fields" }` (add) / contact field updates (update).

**Response** — `201` `{ "contact_id": "uuid" }` (add) / `200` `{ "contact_id": "uuid" }` (update).

**Errors:** `NOT_FOUND 404` (campaign/contact); `STATE 409` (campaign `completed` — no new/changed contacts); `REFERENCE 422` (Marketplace target does not resolve).

### §9.3 Outreach Reads (Staff-Internal)

#### `admin.get_outreach_campaign.v1` · `admin.list_outreach_campaigns.v1`

| Field | Value |
|---|---|
| Method · Path | `GET /admin/outreach-campaigns/{campaign_id}` · `GET /admin/outreach-campaigns` |
| Actor · Slug | Admin · `[ESC-ADM-SLUG]` |
| Disclosure | **Staff-Internal**; cross-scope → `404` |
| Pagination | `page_size`+`cursor`; `filter {state?}` |
| Audit / Events | Not audited / None |

**Response `200`** — campaign detail (+ contacts) / list view, §3.9 envelope.

**Errors:** `AUTHORIZATION 403`; `NOT_FOUND 404`; list adds `VALIDATION 400`.

---

## §10 — Out-of-Wire Boundary (R1)

**No caller wire in ANY protocol — no REST, SSE, WebSocket, Webhook, GraphQL. Flag-and-Halt if any wire is proposed. Implementation = code / Doc-6.** Instantiates no §5.7 template.

| Item | Class | Nature (Doc-4J) |
|---|---|---|
| `admin.expire_ban.v1` | System worker (21.5) | `ban_actions` expiry timer (`lifted → expired`); audit `[ESC-ADM-AUDIT]`; idempotent |
| `admin.process_import_job.v1` | System worker (21.5) | advances `import_jobs` `queued → processing → completed / failed`; idempotent on `job_id`; **import-seed entities written via Marketplace service** (AF-1/R5); `Response: none` |
| `create_moderation_case` / `queue_verification_task` — **System auto-queue legs** | dual-template System leg | only the Admin caller leg is wired (§4/§8); the System auto-queue from RFQ/verification-request events is in-process |
| **write-via-service legs** | in-process service (R5) | `decide_verification_task` → Trust · `decide_category_suggestion`(approve) → Marketplace catalog · `confirm_link_suggestion` → Operations link-columns — **Admin decides, owning module owns; no domain bypass** (AF-1/Red Flag #8) |
| **`VendorBanned` delivery + `reflect_vendor_ban`** | outbox + event-consumer | `VendorBanned` outbox delivery (Admin authors — `Doc-4A §4.4`; M0 outbox) + the Marketplace `reflect_vendor_ban` **consumer effect** (DD-3) — **NOT a write-via-service call**; consumers own their effects |

> The write-via-service legs being out-of-wire is the highest-stakes application of R1/R5 — **no owning-module domain is bypassed** and no cross-module table is written from an M8 surface.

---

## §11 — Conformance & Carried Items

### §11.1 Conformance Attestation (vs `Doc-5A` Appendix A — the freeze gate)

| Band | Result | Evidence |
|---|---|---|
| Anti-invention (`CHK-5A-121`) | **PASS** | No endpoint/status/header/error-class/slug/POLICY-key/audit-action/event coined; tokens + slugs + machines + audit verbatim from Doc-4J |
| Path grammar (`Doc-5A §5.2/§5.3`) | **PASS** | creates → `POST /resource` → `201` (incl. `submit_import_job` R10, `add_outreach_contact` child); commands → `POST /resource/{id}/{slug}` → `200`; reads → `GET` → `200`; version = header |
| Error map (`Doc-5A §6.2`) | **PASS** | §3.8 table; `VALIDATION`=400, `AUTHORIZATION`=403, `STATE`/`CONFLICT`=409, `REFERENCE`/`BUSINESS`=422, `DEPENDENCY`=503, `SYSTEM`=500; `REFERENCE`≠`DEPENDENCY`, `STATE`≠`CONFLICT` |
| Envelope (`Doc-5A §5.6`) | **PASS** | §3.9 `{result|items, page_info, reference_id}`; top-level `reference_id` (C-05; `204` exempt); `201` `Location` |
| Pagination (`CHK-5A-070/071`) | **PASS** | `page_size`+`cursor`; bounds via `[ESC-ADM-POLICY]`, never literal |
| Prohibited request fields (`Doc-4A §9.7`) | **PASS** | no actor-assertion (platform-staff server-determined, R2); no tenant-selection/active-org; no lifecycle-state body flag (`expected_state` = concurrency assertion) |
| **Admin-decides / owning-module-owns** (R5; M8-unique) | **PASS** | M8 writes only `admin.*`; every cross-module effect = in-process service leg (§10); no cross-module table write/FK; no domain bypass (Red Flag #8) |
| **Trust / score firewall** (R8; M8-unique) | **PASS** | `verification_tasks ≠ trust.verification_records`; no trust/performance/verification/tier score on any wire |
| **Procurement moat** (R7; M8-unique) | **PASS** | no matching/routing/ranking/selection/award/eligibility surface; outreach informational only |
| **Non-disclosure** (R6; M8-unique) | **PASS** | every read Staff-Internal; link content never vendor-visible; unauthorized/cross-scope → `404` collapse |
| **Single-event** (R9; M8-unique) | **PASS** | only `issue_ban` emits `VendorBanned` (M0 outbox); BC-ADM-1/3/4/5/6 emit No Event |

### §11.2 Carried-Items Register (resolved only via named channels — never here)

| ID | Channel | Freeze gate? |
|---|---|---|
| DR-ADM-1 (Identity) · DR-ADM-MKT (Marketplace) · DR-ADM-RFQ · DR-ADM-OPS (Operations) · DR-ADM-TRUST · DR-ADM-PC (Platform Core) | Per `Doc-4J` Appendix B; consumed / by-pointer; no surface realized (**`DR-ADM-COMM` does not exist**) | No |
| `[ESC-ADM-SLUG]` | Doc-2 §7 additive (missing-vendor + link + import + outreach); interim nearest `staff_can_*`; no slug invented | No |
| `[ESC-ADM-AUDIT]` | Doc-2 §9 additive (ban expiry, verification-task workflow, outreach); nearest action by pointer | No |
| `[ESC-ADM-EVENT]` | Doc-2 §8 additive; `VendorBanned` sole Admin event; none coined | No |
| `[ESC-ADM-FIELD]` | Doc-4J PassB field registry — request fields not pinned in Doc-4J (`issue_ban.scope`, `create_outreach_campaign` attributes, `add_outreach_contact` `vendor_*_id`); resolved against Doc-4J, never coined | No (tracked) |
| `[ESC-ADM-POLICY]` | Doc-3 §12.2 additive — `admin.*` dedup-window + list-page-size keys; **next free patch = `v1.7`** (v1.0–v1.6 taken; confirm `admin.*` vs the named `moderation.*` set per `Doc-4J §H.8`/App B) | **YES — `CHK-5A-121` content-freeze gate** |

> Doc-5J coins nothing. The single content-freeze gate is `[ESC-ADM-POLICY]` (the `admin.*` Doc-3 v1.7 registration) — to be applied before the Content Freeze Audit certifies (precedent: every prior module cleared its `[ESC-*-POLICY]` via a Doc-3 patch).

---

## Appendix A — Doc-5J Conformance Attestation (Pass-3 closure)

Per-band attestation recorded in §11.1 (attestations only — no normative behavior; binding rules live §0–§10). M8-unique bands — **Admin-decides/owning-module-owns · Trust/score firewall · procurement-moat · non-disclosure · single-event** — all **PASS**.

**Partition closure:** 32 caller-facing realized (§4:5 · §5:4 · §6:7 · §7:4 · §8:5 · §9:7) + 2 out-of-wire declared (§10: `expire_ban`, `process_import_job`) = **34 Doc-4J tokens** — each assigned exactly once; partition per `Doc-5J_Structure_v1.0_FROZEN.md`.

**Content-freeze gate:** `[ESC-ADM-POLICY]` `admin.*` v1.7 registration (Doc-3 §12.2). All other carried items non-gating. A Content Freeze Audit follows once the gate is dispositioned.

---

*Content Independent Hard Review v1.0 patch applied: m-01 (`vendor_ref_id`→Doc-4J `vendor_*_id`/`[ESC-ADM-FIELD]`), m-02 (`submit_import_job` `201` justified by quoted Doc-4J response shape), n-01 (filter allowlists = Doc-4J read-model dimensions, noted Pass-2/3), n-02 (`create_outreach_campaign` attributes → `[ESC-ADM-FIELD]`), n-03 (`issue_ban.scope` → `[ESC-ADM-FIELD]`). New marker `[ESC-ADM-FIELD]` registered (§11.2). 0 BLOCKER/MAJOR. Sole content-freeze gate: `[ESC-ADM-POLICY]` → Doc-3 `admin.*` v1.7.*

*Pass-3 complete. §7 (4) + §8 (5) + §9 (7) + §10 (2 out-of-wire + internal legs) + §11 + Appendix A authored — fields/outputs/errors traced to `Doc-4J` BC-ADM-4/5/6 verbatim; reads Staff-Internal; dual-template + write-via-service + event-consumer legs out-of-wire (§10/R1/R5). Doc-5J content (§0–§11 + Appendix A) fully drafted across Pass-1/2/3. Next: Doc-5J Content Independent Hard Review → patch → (Doc-3 `admin.*` v1.7) → Content Freeze Audit → freeze → corpus-fold.*
