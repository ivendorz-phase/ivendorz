# Doc-5J — Admin Operations (M8 `admin`) API Realization — Content v1.0 Pass-2

| Field | Value |
|---|---|
| Document | Doc-5J Content v1.0 Pass-2 |
| Status | **CONTENT IN PROGRESS — Pass-2 (§4 BC-ADM-1 · §5 BC-ADM-2 · §6 BC-ADM-3)** |
| Builds on | `Doc-5J_Content_v1.0_Pass1.md` (§0–§3 binding registers — §3.6/§3.7/§3.8/§3.9) |
| Conforms to | `Doc-5J_Structure_v1.0_FROZEN.md`; `Doc-5A_SERIES_FROZEN_v1.0`; `Doc-4J_FROZEN_v1.0` BC-ADM-1/2/3 + §H |
| Pass-3 | §7 BC-ADM-4 · §8 BC-ADM-5 · §9 BC-ADM-6 · §10 Out-of-Wire · §11 Conformance · Appendix A |

> §3 binds all sections (Pass-1): actor §3.1 (platform-staff only, no active-org); `check_permission` §3.2; firewalls §3.3 (AF-1 admin-decides/owning-owns · AF-2 moat · AF-3 Trust · AF-4 single-event); machines §3.4; non-disclosure `404` §3.5; read scopes §3.6; bound-slugs §3.7; error map §3.8; envelope §3.9. Each Response shows the `<representation>` carried in the §3.9 envelope; error tables list only contract-raisable classes (`DEPENDENCY 503`/`SYSTEM 500` universal, not repeated). All fields trace to `Doc-4J` BC-ADM-x verbatim; **list `filter` allowlists are the Doc-4J BC-ADM-x "admin search view" read-model dimensions** (not coined). Any field not pinned in Doc-4J carries `[ESC-ADM-FIELD]` (resolved against the Doc-4J PassB field registry; never coined here).

---

## §4 — Moderation Surface Realization (BC-ADM-1, 5 caller-facing)

### §4.1 Section Purpose & Wire Constraints

BC-ADM-1 owns `moderation_cases` (`open → approved / rejected / escalated`). `create_moderation_case` is **dual-template** — only the **Admin caller leg** is realized; the System auto-queue leg (from RFQ pipeline events) is out-of-wire (§10/R1). The moderation **decision feeds the Doc-3 RFQ pipeline, which consumes the case state — with NO M8 cross-module write and NO event** (R7/AF-2; the RFQ is a bare-UUID subject, DR-ADM-RFQ, never owned here). Bound slug `staff_can_moderate_rfq` (all 5). Audit = §9 "moderation decisions" by pointer; **No Event** (AF-4).

> **`reference_id` (C-05) nominated declaration point.** Per `Doc-4A §22.1 C-05` (+ `PATCH-D4A-C05-204`; `CHK-5A-042`), every body-bearing response across §4–§9 carries a top-level `reference_id` — declared here once (§3.9), not repeated per contract.

### §4.2 Moderation Commands

#### `admin.create_moderation_case.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/moderation-cases` |
| Actor · Slug | Admin · `staff_can_moderate_rfq` (platform scope; no active-org) |
| Success | `201 Created` (+ `Location`) |
| Idempotency | `Idempotency-Key` required; keyed on (`subject_id`,`subject_type`) within dedup window (`[ESC-ADM-POLICY]`) → one case |
| Audit | §9 "moderation decisions" by pointer (`entity_type=moderation_cases`) |
| Events | None (AF-4) |

**Request body:**
```json
{
  "subject_id":   "uuid — the RFQ/subject under moderation (required; bare cross-module ref — DR-ADM-RFQ)",
  "subject_type": "enum (required; Doc-4J BC-ADM-1)"
}
```
> The System auto-queue variant (carrying the pipeline source) is **out-of-wire** (§10) — not a caller field.

**Response `201`** — `Doc-4J BC-ADM-1` output: `{ "case_id": "uuid", "state": "open" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `subject_id`/`subject_type` malformed |
| `AUTHORIZATION` | `403` | not platform-staff / lacks `staff_can_moderate_rfq` |
| `REFERENCE` | `422` | `subject_id` does not resolve at RFQ (definitive; ≠ `DEPENDENCY`) |

---

#### `admin.assign_moderation_case.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/moderation-cases/{case_id}/assign-moderation-case` |
| Actor · Slug | Admin · `staff_can_moderate_rfq` |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required; keyed on (`case_id`,target) |
| Audit | §9 "moderation decisions" by pointer |
| Events | None |

**Request body:** `{ "assigned_to": "uuid — platform-staff assignee (required; Identity ref)" }`

**Response `200`** — `{ "case_id": "uuid", "assigned_to": "uuid" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `NOT_FOUND` | `404` | `case_id` absent / not staff-visible (§3.5) |
| `STATE` | `409` | case not in an assignable state |
| `REFERENCE` | `422` | `assigned_to` does not resolve at Identity |

---

#### `admin.decide_moderation_case.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/moderation-cases/{case_id}/decide-moderation-case` |
| Actor · Slug | Admin · `staff_can_moderate_rfq` |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required; terminal-idempotent (re-deciding a decided case in-window = same result, no second transition/audit) |
| Audit | §9 "moderation decisions" by pointer |
| Events | None — decision is **consumed RFQ-side via the Doc-3 pipeline; no M8 write, no event** (R7/AF-2) |

**Request body:**
```json
{
  "decision":       "enum<approved|rejected|escalated> (required; Doc-4J BC-ADM-1)",
  "reason":         "text (required)",
  "expected_state": "enum (required; optimistic-concurrency assertion — Doc-4J §H.9; mismatch → 409 CONFLICT)"
}
```

**Response `200`** — `{ "case_id": "uuid", "state": "approved | rejected | escalated" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `decision` not in enum; `reason` blank |
| `NOT_FOUND` | `404` | `case_id` absent / not staff-visible |
| `STATE` | `409` | illegal from current state (forbidden source) |
| `CONFLICT` | `409` | `expected_state` mismatch (lost race) |

### §4.3 Moderation Reads (Staff-Internal)

#### `admin.get_moderation_case.v1` · `admin.list_moderation_cases.v1`

| Field | Value |
|---|---|
| Method · Path | `GET /admin/moderation-cases/{case_id}` · `GET /admin/moderation-cases` |
| Actor · Slug | Admin · `staff_can_moderate_rfq` |
| Disclosure | **Staff-Internal** (§3.6); unauthorized/cross-scope → `404` (§3.5) |
| Pagination (list) | `page_size`+`cursor`; `filter` allowlist `{ state?, subject_type?, assigned_to? }` (`Doc-4J` read models) |
| Audit / Events | Not audited (`Doc-5A §17.1`) / None |

**Response `200`** — detail view (full case + `reason`) / list view items `{ "case_id", "subject_type", "state", "assigned_to", "created_at" }` (the moderation queue), in the §3.9 envelope.

**Errors:** `AUTHORIZATION 403` (lacks slug); `NOT_FOUND 404` (absent/cross-scope); list adds `VALIDATION 400` (bad filter / `page_size`).

---

## §5 — Enforcement Surface Realization (BC-ADM-2, 4 caller-facing)

### §5.1 Section Purpose & Wire Constraints

BC-ADM-2 owns `ban_actions` (`active → lifted → expired`; expiry **only from `lifted`**, by the System `expire_ban` timer — out-of-wire §10). **Sole `VendorBanned` producer** (AF-4/R9): `issue_ban` emits `VendorBanned` to the M0 outbox (`Doc-4B`); the Marketplace ban-reflection is the **consumer's effect** (DR-ADM-MKT/DD-3) — never an M8 status write (AF-1/R5). Bound slug `staff_can_ban` (all 4). Audit = §9 "ban issue/lift" by pointer.

### §5.2 Enforcement Commands

#### `admin.issue_ban.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/ban-actions` |
| Actor · Slug | Admin · `staff_can_ban` (platform scope) |
| Success | `201 Created` (+ `Location`) |
| Idempotency | `Idempotency-Key` required; keyed on (`subject_id`,`subject_type`,active-ban) → one active ban + one `VendorBanned`, no duplicate event |
| Audit | §9 "ban issue/lift" by pointer (`entity_type=ban_actions`) |
| Events | **emits `VendorBanned`** (Doc-2 §8; single-authorship; M0 outbox `Doc-4B`; consumers Marketplace reflect / Communication notify / Trust Protection freeze — DD-3) |

**Request body:**
```json
{
  "subject_id":    "uuid (required; bare ref — Marketplace)",
  "subject_type":  "enum<vendor_profile|organization> (required; Doc-4J BC-ADM-2)",
  "scope":         "ban scope (required; type per Doc-4J BC-ADM-2 PassB field registry — `[ESC-ADM-FIELD]` pending exact type; not coined here)",
  "reason":        "text (required)",
  "public_banner": "bool (required)"
}
```

**Response `201`** — `{ "ban_id": "uuid", "state": "active" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `VALIDATION` | `400` | `subject_type` not in enum; required field missing |
| `AUTHORIZATION` | `403` | lacks `staff_can_ban` |
| `REFERENCE` | `422` | `subject_id` does not resolve at Marketplace (definitive) |

---

#### `admin.lift_ban.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/ban-actions/{ban_id}/lift-ban` |
| Actor · Slug | Admin · `staff_can_ban` |
| Success | `200 OK` |
| Idempotency | `Idempotency-Key` required; terminal-idempotent |
| Audit | §9 "ban issue/lift" by pointer |
| Events | **None** — lift-reflection is the Marketplace-side effect (DD-8), not an M8 event (AF-4) |

**Request body:** `{ "expected_state": "enum<active> (required; concurrency assertion; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "ban_id": "uuid", "state": "lifted" }`.

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `NOT_FOUND` | `404` | `ban_id` absent / not staff-visible |
| `STATE` | `409` | not `active` (e.g. already `lifted`/`expired`) |
| `CONFLICT` | `409` | `expected_state` mismatch |

### §5.3 Enforcement Reads (Staff-Internal)

#### `admin.get_ban_action.v1` · `admin.list_ban_actions.v1`

| Field | Value |
|---|---|
| Method · Path | `GET /admin/ban-actions/{ban_id}` · `GET /admin/ban-actions` |
| Actor · Slug | Admin · `staff_can_ban` |
| Disclosure | **Staff-Internal**; cross-scope → `404` |
| Pagination (list) | `page_size`+`cursor`; `filter` allowlist `{ state?, subject_type? }` |
| Audit / Events | Not audited / None |

**Response `200`** — detail / list view (§3.9 envelope).

**Errors:** `AUTHORIZATION 403`; `NOT_FOUND 404`; list adds `VALIDATION 400`.

---

## §6 — Suggestions Surface Realization (BC-ADM-3, 7 caller-facing)

### §6.1 Section Purpose & Wire Constraints

BC-ADM-3 owns the **Suggestion** aggregate — **three roots, one aggregate, no split** (`Doc-2 §2`): `category_suggestions` (`submitted → approved / rejected`), `missing_vendor_suggestions` (`submitted → triaged → closed`), `link_suggestions` (`suggested → confirmed / dismissed`). **Per-root bound slug:** category decisions → `staff_can_manage_categories` (**category-suggestion decisions ONLY**); missing-vendor + link decisions → `[ESC-ADM-SLUG]`. **Cross-module effects are out-of-wire (AF-1/R5):** approved category written **via Marketplace** catalog service (DR-ADM-MKT/DD-4); confirmed link columns written **via Operations** (DR-ADM-OPS/A-03). **Non-disclosure (R6/AF):** `link_suggestion` content is **never vendor-visible** — every read is Staff-Internal with `404` collapse. Audit = §9 "category approve/delete" / "suggestion decisions" / "link confirm/dismiss" by pointer; **No Event**.

### §6.2 Suggestion Commands

#### `admin.decide_category_suggestion.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/suggestions/{suggestion_id}/decide-category-suggestion` |
| Actor · Slug | Admin · `staff_can_manage_categories` (category decisions ONLY) |
| Success | `200 OK` · Idempotency required (terminal-idempotent) · Audit §9 "category approve/delete" / "suggestion decisions" · No Event |

**Request body:** `{ "decision": "enum<approved|rejected> (required)", "expected_state": "enum (required; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "suggestion_id": "uuid", "state": "approved | rejected" }`.

> On `approved`, the category is written **via the Marketplace service** (out-of-wire §10/R5; Marketplace owns the category catalog — never an M8 write).

**Errors:**

| Class (§3.8) | Status | When |
|---|---|---|
| `NOT_FOUND` | `404` | `suggestion_id` absent / not staff-visible |
| `STATE` | `409` | not `submitted` |
| `CONFLICT` | `409` | `expected_state` mismatch |
| `REFERENCE` | `422` | (on approve) category target does not resolve at Marketplace |

---

#### `admin.triage_missing_vendor_suggestion.v1` · `admin.close_missing_vendor_suggestion.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/suggestions/{suggestion_id}/triage-missing-vendor-suggestion` (`submitted → triaged`) · `POST …/close-missing-vendor-suggestion` (`triaged → closed`) |
| Actor · Slug | Admin · `[ESC-ADM-SLUG]` |
| Success | `200 OK` · Idempotency required · Audit §9 "suggestion decisions" · No Event |

**Request body:** `{ "expected_state": "enum (required; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "suggestion_id": "uuid", "state": "triaged | closed" }`.

**Errors:** `NOT_FOUND 404`; `STATE 409` (forbidden source); `CONFLICT 409`.

---

#### `admin.confirm_link_suggestion.v1` · `admin.dismiss_link_suggestion.v1`

| Field | Value |
|---|---|
| Method · Path | `POST /admin/suggestions/{suggestion_id}/confirm-link-suggestion` (`suggested → confirmed`) · `POST …/dismiss-link-suggestion` (`suggested → dismissed`) |
| Actor · Slug | Admin · `[ESC-ADM-SLUG]` (link decisions; staff-only) |
| Success | `200 OK` · Idempotency required (confirm re-applied = no-op, no duplicate Operations link-write) · Audit §9 "link confirm/dismiss" · No Event |

**Request body:** `{ "expected_state": "enum<suggested> (required; mismatch → 409 CONFLICT)" }`

**Response `200`** — `{ "suggestion_id": "uuid", "state": "confirmed | dismissed" }`.

> On `confirmed`, the link **columns** on `operations.private_vendor_records` are written **via the Operations service** (out-of-wire §10/R5; A-03). **Link content is never vendor-visible** (R6). The tenant-side `confirm_vendor_link` (M4) writes its own row — different actor/side, no conflict.

**Errors:** `NOT_FOUND 404` (absent/cross-scope — non-disclosure); `STATE 409`; `CONFLICT 409`; `REFERENCE 422` (on confirm, Operations target does not resolve).

### §6.3 Suggestion Reads (Staff-Internal; per-root)

#### `admin.get_suggestion.v1` · `admin.list_suggestions.v1`

| Field | Value |
|---|---|
| Method · Path | `GET /admin/suggestions/{suggestion_id}` (`root` discriminator) · `GET /admin/suggestions` (`root` filter) |
| Actor · Slug | **Per-root** — `staff_can_manage_categories` (category root) / `[ESC-ADM-SLUG]` (missing-vendor, link roots). A missing/ambiguous root-slug binding = content blocker (§3.7) |
| Disclosure | **Staff-Internal**; **link reads never served to a vendor** (R6); cross-scope → `404` |
| Pagination (list) | `page_size`+`cursor`; `filter` allowlist includes the `root` discriminator + per-root state |
| Audit / Events | Not audited / None |

**Response `200`** — per-root detail / list view (§3.9 envelope). The `root` discriminator selects the representation; representations are the Doc-4J BC-ADM-3 read-model views by reference.

**Errors:** `AUTHORIZATION 403` (lacks the per-root slug); `NOT_FOUND 404` (absent/cross-scope/non-disclosure); list adds `VALIDATION 400` (undeclared filter / `page_size` / unknown `root`).

---

*Pass-2 complete. §4 (5: 3 commands + 2 reads) · §5 (4: 2 commands + 2 reads) · §6 (7: 5 commands + 2 reads) = 16 contracts realized, field-traced to `Doc-4J` BC-ADM-1/2/3. `VendorBanned` is the sole event (§5 `issue_ban`); all cross-module writes (category→Marketplace, link→Operations) are out-of-wire service legs (§10/R5); link non-disclosure enforced (§6). Pass-3 covers §7 (BC-ADM-4) · §8 (BC-ADM-5) · §9 (BC-ADM-6) · §10 · §11 · Appendix A.*
