# Doc-5I — Monetization / Billing (M7) — Content Pass-2 Independent Hard Review v1.0

| Field | Value |
|---|---|
| Reviews | `Doc-5I_Content_v1.0_Pass2.md` (§4 BC-BILL-1 · §5 BC-BILL-2 · §6 BC-BILL-3 — 13 contracts) |
| Stance | Independent board-level adversarial review. No rubber-stamp. Every status / error class / param / envelope checked against the frozen Doc-5A wire grammar, not against Pass-1 prose |
| Authority checked against | `Doc-5A_Content_v1.0_Pass3.md` §5.5/§5.6/§6.2 · `Doc-5A_Content_v1.0_Pass5.md` §8.5 · `Doc-5A_Content_v1.0_Pass11.md` CHK-5A-070/071/121 · `Doc-4A §9.6/§9.7/§12.2` · `Doc-5I_Structure_v1.0_FROZEN.md` |
| Verdict | **REJECT — re-patch required before Pass-3.** Multiple anti-invention / status-remap BLOCKERs |
| Findings | **5 BLOCKER · 4 MAJOR · 4 MINOR · 3 NITPICK** |

> **Headline:** Pass-2's wire bodies are well-structured but were authored against an **assumed** HTTP error/envelope grammar rather than the frozen Doc-5A one. The frozen closed error-class set (`Doc-4A §12.2` / `Doc-5A §6.2`) and the response envelope (`Doc-5A §5.6`) are both violated. These are `CHK-5A-121` (anti-invention) and "MUST NOT map an error class to a different status" (`Doc-5A §6.2`) failures — hard freeze gates, not stylistic. Same defects are partly inherited from Pass-1 §3 (disclosed below).

---

## BLOCKERS (freeze-gate; must fix before Pass-3)

### B-01 — `400 BAD_REQUEST` is an invented error class
**Where:** `create_plan`, `update_plan` error tables (`| 400 | BAD_REQUEST | Malformed body / wrong type |`).
**Authority:** `Doc-5A §6.2` closed class set (`Doc-4A §12.2`): `VALIDATION · AUTHORIZATION · NOT_FOUND · STATE · CONFLICT · REFERENCE · BUSINESS · QUOTA · RATE_LIMITED · ASYNC_PENDING · DEPENDENCY · SYSTEM`. **There is no `BAD_REQUEST` class.** `CHK-5A-121` (B): "No new … error class … coined." Malformed/syntactically-wrong body = the **`VALIDATION`** class (SYNTAX category, `Doc-4A §11.2`) → `400`.
**Fix:** delete every `BAD_REQUEST` row; fold into `400 VALIDATION` (`field_errors` present; SYNTAX may aggregate per §6.5).

### B-02 — `422 VALIDATION` mis-maps a frozen class to the wrong status
**Where:** every `| 422 | VALIDATION | … |` row (create_plan, update_plan, bundle_plan_entitlement, create_entitlement, update_entitlement, purchase_subscription, get_usage).
**Authority:** `Doc-5A §6.2`: **`VALIDATION → 400 Bad Request`** (not 422). `422` is reserved for `REFERENCE` and `BUSINESS` only. `Doc-5A §6.2`: "A module document **MUST NOT** map an error class to a different status." This is a hard remap violation.
**Fix:** all `422 VALIDATION` → **`400 VALIDATION`**. Where the rejection is actually a *business-rule* failure (e.g. `billing_cycle` not offered by the plan; future `period`), classify as **`422 BUSINESS`**; where it is a missing/expired cross-reference, **`422 REFERENCE`** — but plain field/enum/format failures are `400 VALIDATION`.

### B-03 — Page-size hardcoded as literals + wrong parameter name
**Where:** every list — `| limit | integer | 20 | Max … 100 |`, `| limit | … 50 | … 200 |`.
**Authority:** `Doc-5A §8.5` + `CHK-5A-071` (M): "Page-size bound referenced by **POLICY key**, never a literal." `CHK-5A-070` (B) + `Doc-4A §9.6`: the two pagination params are **`page_size`** and **`cursor`** — `limit` is not a frozen grammar name. Over-max `page_size` → `400 VALIDATION` (SYNTAX), never silent clamp.
**Fix:** rename `limit` → `page_size`; replace `20/50/100/200` literals with the `[ESC-BILL-POLICY]` page-size key by pointer (min/max/default referenced, never embedded); state over-max → `400 VALIDATION`. This is exactly the carried `[ESC-BILL-POLICY]` item (structure Carried-Items: "dedup / period-transition / retry / rate / **page**") — it must be referenced, not resolved with invented numbers.

### B-04 — `org_id` query param on `get_usage` is a prohibited tenant-selection field
**Where:** `get_usage` query table — `| org_id | UUIDv7 | Admin only — read any org's usage |`.
**Authority:** `Doc-4A §9.7` (prohibited request fields, forbidden in path/query/body/header alike): **tenant-selection** fields are prohibited. Invariant #5 / `Doc-4A §5.3`: "client-supplied org ID never trusted." A caller-supplied `org_id` that selects the tenant is precisely the prohibited pattern.
**Fix:** remove `org_id`. Admin's "reads any org" (structure §3 cross-cutting grant) must be realized through a **server-side** mechanism — the platform-staff predicate operating on the server-validated `Iv-Active-Organization` context, or a distinct admin surface — never a request-supplied tenant key. This also fixes the matching `403`/`404` rows that referenced `org_id`. **Flag-and-halt:** the concrete admin cross-org-read mechanism for org-singleton reads (usage, lead-account, reward-account) is undefined in the frozen structure — escalate the mechanism rather than invent a param (see m-04).

### B-05 — `is_active` in `update_plan` body is a prohibited lifecycle-state field
**Where:** `update_plan` request body — `"is_active": "boolean … true drives draft → active"`.
**Authority:** `Doc-4A §9.7`: **lifecycle-state** fields are prohibited request fields. A state-machine edge (`draft → active`, `Doc-2 §3.8`) **MUST NOT** be driven by a body flag on a generic update; state transitions are explicit commands (`Doc-5A §5.2/§5.3` command-slug grammar). The structure (R7) attributes the terminal edge to `retire_plan` but **does not** name a contract for `draft → active`, and Doc-4I BC-BILL-1 lists only `create/update/retire_plan` + entitlement commands.
**Fix:** remove `is_active` from the body. **Flag-and-halt and escalate:** which Doc-4I BC-BILL-1 contract realizes the `draft → active` activation edge? If Doc-4I §HB-1.x designates `update_plan` as the publish path, the edge must still be realized without a lifecycle field (e.g. server-derived on a declared publish semantics) — but this cannot be silently decided here. Verify against `Doc-4I §HB-1.2/§HB-1.3` verbatim; do not coin an activation flag.

---

## MAJOR

### M-01 — `FORBIDDEN` used as the error_class token; frozen class is `AUTHORIZATION`
**Where:** every `| 403 | FORBIDDEN | … |` row across §4–§6.
**Authority:** `Doc-5A §6.2`: the class at `403` is **`AUTHORIZATION`** (and `QUOTA`). `FORBIDDEN` is the HTTP reason-phrase, not the `error_class`. Clients MUST branch on `error_class` (`Doc-4A §12.3`); a Code column reading `FORBIDDEN` mislabels the closed-set token.
**Fix:** Code column → **`AUTHORIZATION`** at `403`. (Status reason-phrase may appear in prose, but the error-table "Code" column is the `error_class`.) Note: this is inherited from Pass-1 §3 — fix once in §3 and apply.

### M-02 — Single-resource success envelope missing (`result` + `reference_id`)
**Where:** every `Response 200/201` body in Pass-2 returns a **bare entity object**.
**Authority:** `Doc-5A §5.6`: single-entity success = **`{ "result": <representation>, "reference_id": <uuidv7> }`**; `reference_id` is top-level on **every** response (`Doc-4A §22.1 C-05`); `201` additionally carries a `Location` header (§5.5). Pass-2 omits the `result` wrapper, the top-level `reference_id`, and the `201` `Location` header.
**Fix:** wrap all success bodies as `{ "result": {…}, "reference_id": "<uuidv7>" }`; add `Location` to the two `201`s (create_plan, create_entitlement, purchase_subscription). Either restate the envelope once in §3/§4.1 and show representations only, or apply per-contract — but the wire shape must be correct.

### M-03 — List success envelope wrong shape
**Where:** `list_plans`, `list_subscription_events`, and `get_usage` (`entries`) responses use `{ "items": […], "next_cursor": … }`.
**Authority:** `Doc-5A §5.6` / §8 / `Doc-4A §10.3`: list success = **`{ "items": [...], "page_info": { "next_cursor", "has_more", "total_count"? }, "reference_id": <uuidv7> }`**. Pass-2 hoists `next_cursor` to top level, drops `page_info`, `has_more`, and `reference_id`.
**Fix:** rewrap under `page_info`; add `has_more` + top-level `reference_id`. For `get_usage`, the `entries` array is a list payload → same `page_info` rule (and `totals` is an additional contract field, allowed if Doc-4I declares it — see M-04).

### M-04 — Response/request fields not traced to Doc-4I PassB declarations
**Where:** invented field names appear without a Doc-4I anchor: `plan_snapshot`, `entitlement_count`, `entitlements[]` inline shape (§4); `plan_snapshot.entitlements`, `event_type` enum (`purchased|activated|cancelled|renewed|expired`), `actor` (§5); `totals{rfq_response,lead_access,ad_launch}`, `source` enum, `unit_cost`, `reference_id` *as a usage-entry field* (§6).
**Authority:** `Doc-5A §5` (Pass3 line 110): "realization fields **MUST NOT** introduce any input … absent from the abstract contract; they bind transport only … escalated, never invented." Response representations are owned by the module's canonical representation **by reference** (`Doc-4A §10.1/§10.2`), not reshaped in Doc-5I.
**Fix:** trace every request/response field to its `Doc-4I §HB-1.x/2.x/3.x` field declaration; cite the anchor or mark `[ESC-BILL-FIELD]` and flag-and-halt. Naming a usage-entry field `reference_id` is especially dangerous — `reference_id` is the reserved top-level envelope key (`Doc-4A §22.1 C-05`); rename the entry's source pointer (e.g. `source_ref`) to avoid envelope collision.

---

## MINOR

### m-01 — `human_ref` prefixes `PLAN-2026-…` / `SUB-2026-…` coined
Human-ref format + per-record prefix is M0 ID-gen territory (`RFQ-2026-…` precedent). Verify `PLAN-`/`SUB-` against the frozen ID-gen/human-ref registry (Doc-2 / Doc-4B / Doc-4I); if unregistered, mark `[ESC-BILL-…]` and flag-and-halt — do not coin a ref prefix.

### m-02 — `Idempotency-Key` stated "required" on all commands; dedup window unbound
Verify "required vs supported" against `Doc-5A §9` (idempotency realization). The dedup-window value is a `[ESC-BILL-POLICY]` key — reference by pointer, never imply a fixed window. Cite §9, not just "Doc-5A §9 (header)".

### m-03 — List filters carried as bare params instead of `filter` grammar
`list_plans` `state`, `get_usage` `period` are carried as standalone query params. `Doc-5A §8` / `Doc-4A §9.6`: filtering is the **`filter`** parameter grammar over a declared allowlist; filtering on an undeclared field → `400 VALIDATION`. State the filter dimension as a declared allowlist member under `filter`, not an ad-hoc param.

### m-04 — Admin cross-org-read mechanism undefined for org-singletons (depends on B-04)
After removing `org_id` (B-04), the structure §3 "Admin reads any org" grant has **no realized mechanism** for the ID-less singleton reads (`get_usage`; and Pass-3 `get_lead_balance`, `get_reward_balance`). This is a genuine gap in the frozen structure §3, not a Pass-2 authoring slip. Escalate: define the admin singleton-read mechanism once (server-side context switch / dedicated admin route) and apply uniformly in Pass-3. Until defined, mark provisional and flag-and-halt.

---

## NITPICK

### n-01 — Money representation inconsistent + wrong BDT subunit
`create_plan.price_amount` = "smallest currency unit" (good, currency-agnostic) but `get_usage.unit_cost` = "**BDT paise**" — BDT's subunit is **poisha**, not paise (INR), and hardcoding `BDT` conflicts with "currency stored per value field" (multi-currency-ready, CLAUDE.md §2). Use "smallest unit of the stored currency" uniformly; carry `currency` beside any minor-unit amount.

### n-02 — Verify cited anchors exist verbatim
`Doc-5A §17.1` ("reads not audited"), `Doc-4I §H.7` (cancel emits no event), `Doc-2 §3.8` (plan edges), `Doc-4I §HB-5.2` (invoice state). Grep each before content freeze; the review confirmed §6.2/§5.6/§8.5 but did not re-confirm §17.1.

### n-03 — `event_type: activated` implies a record_payment-driven history row
`list_subscription_events` enumerates `activated` — fine, but ensure it is sourced from the `record_payment` (§10/R8) transition, not implied to be a §5 caller event; add the pointer so it is not read as a caller-emitted event (R9 firewall: only 3 §8 events).

---

## Cross-pass disclosure (honesty)

B-02 (`422 VALIDATION`) and M-01 (`403 FORBIDDEN` as class) are **partly inherited from Pass-1 §3.4/§3.5** (e.g. Pass-1 line 285 `422 VALIDATION`, line 300 `403 FORBIDDEN`). The Pass-1 hard review did **not** check the §3 status/class tokens against the frozen `Doc-5A §6.2` table — that was a gap in that review, now caught. The fix should land **once in §3** (define the error-class→status table by pointer to `Doc-5A §6.2`) and propagate, rather than per-contract patching. Recommend a small §3 patch to Pass-1 alongside the Pass-2 re-patch so both passes share one correct taxonomy.

---

## What is correct (no change)

- Path grammar: creates → `POST /resource` → `201`; commands → `POST /resource/{id}/{command-slug}` → `200`; reads → `GET /resource/{id}` → `200`. All conform to `Doc-5A §5.2/§5.3/§5.5`.
- `409 STATE` (illegal transition) and `409 CONFLICT` (lost race / dup non-idempotent) — **correct** per `Doc-5A §6.2` and structure R7.
- `404 NOT_FOUND` non-disclosure collapse on Own-Org cross-tenant reads — correct (§6.3 / §3.5).
- R9 event attribution: `purchase_subscription` → `SubscriptionPurchased` only; `cancel_subscription` emits none; renew/expire in §10. Correct.
- R7 subscription machine prose: `pending_payment` at create; `record_payment` drives `→ active`; cancel sets `auto_renew=false`, state stays `active`. Correct and consistent with FROZEN structure.
- R6 fence (`platform_invoices ≠ trade_invoices`) and R5 firewall language in §6.1. Correct.
- Out-of-wire pointers (`record_usage`, `enforce_quota` → §10) with flag-and-halt. Correct.

---

## Required actions before Pass-3

1. **B-01/B-02/M-01:** adopt the `Doc-5A §6.2` table verbatim — `VALIDATION→400`, `AUTHORIZATION→403`, `NOT_FOUND→404`, `STATE/CONFLICT→409`, `REFERENCE/BUSINESS→422`, `QUOTA→403`. Delete `BAD_REQUEST`. Reclassify each error row. Land the canonical table once in §3.
2. **B-03/M-03:** `page_size`+`cursor` grammar; `page_info{next_cursor,has_more,total_count?}`; page-size bound via `[ESC-BILL-POLICY]` key, never literals.
3. **B-04/m-04:** remove `org_id`; escalate the admin singleton-read mechanism; apply uniformly.
4. **B-05:** remove `is_active` body flag; escalate the `draft→active` activation contract against Doc-4I §HB-1.x.
5. **M-02:** `{ "result": …, "reference_id" }` envelope + `Location` on `201`s.
6. **M-04:** trace all fields to Doc-4I PassB; rename the usage-entry `reference_id` field; `[ESC-BILL-FIELD]` + flag-and-halt on any gap.
7. **MINOR/NITPICK:** human-ref prefixes, idempotency wording, filter grammar, money units, anchor verification.

**Re-review after patch (focused re-check of the 5 BLOCKERs + M-02/M-03) before §7–§11 authoring begins.**

---

*Independent review. The path/status/state-machine spine is sound; the error-class taxonomy and response envelope are not yet Doc-5A-conformant. None of the findings touch the frozen structure's partition, R-list, or firewall — they are wire-grammar conformance, fixable additively in the content pass.*
