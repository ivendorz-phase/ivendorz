# Doc-5F — Business Operations (M4 `operations`) API Realization — Content v1.0, Pass 3 (§6–§10 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5F — Business Operations (Module 4) — API Realization |
| Pass | 3 of 3 — §6 (Vendor Lead Pipeline), §7 (Document Templates & Generated Documents), §8 (Finance Records), §9 (Out-of-Wire Boundary), §10 (Conformance & Carried Items) + Appendix A (Conformance Attestation). Completes Doc-5F content. |
| Status | ACTIVE — Content Pass 3 of 3; §6–§10 + Appendix A. Conforms to `Doc-5F_Structure_v1.0_FROZEN.md`. Builds on Pass-1 (§0–§3) + Pass-2 (§4–§5). **Resolves the Pass-2-carried MINOR-02:** `[ESC-OPS-AUDIT]` is dispositioned in §10.3 by an explicit governance note (interim by-pointer binding per the frozen Doc-4F PassB handling) — conforming to the Structure FROZEN *Open Carried Items* ruling (`[ESC-OPS-AUDIT]` **Freeze gate? No**), not by inventing a Doc-2 §9 action. `[ESC-OPS-POLICY]` pre-cleared by `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations`. **0 open BLOCKER/MAJOR/MINOR.** Doc-5F content complete — ready for the **Freeze Readiness Audit**. |
| Realizes | The 19 §6/§7/§8 caller-facing M4 endpoints on HTTP + the §9 out-of-wire boundary (4 contracts) + the §10 conformance attestation |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5F Content Pass-1 (§0–§3 + inventory) + Pass-2 (§4–§5) |
| Contains | The §5.7 realization of each §6–§8 caller-facing surface; the §9 out-of-wire boundary statement; the §10 attestation + carried-item register; Appendix A per-band conformance evidence. No contract bodies, representations, error codes, POLICY keys, audit actions, events, or Doc-4F rules restated |
| Audience | Architecture / API Governance Boards · Doc-5F authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4F fixed the contracts (PassB BC-OPS-3/4/5 FROZEN); Doc-2 §3.5/§5.9/§10.5 own the state edges (Doc-4M = cross-module state-map index); Doc-5A fixed the wire mechanics. §6–§8 realize the **wire face** per Doc-5A §5/§6/§7/§9/§10 and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, state edges, and events are bound **by pointer, never restated**. The §3 cross-cutting model governs every endpoint here; **every read declares its disclosure scope and every command its actor side** (§3 binding rules); **R5 non-disclosure is load-bearing** (lead surface never leaks routing/competitor; buyer-CRM never disclosed); **R8 money-boundary** (finance = records, not rails). Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9/§10/§11`, Appendix A/B.1; `Doc-4F §F6/§F7/§F8` (PassB Part-3/4/5 FROZEN); `Doc-2 §3.5/§5.9/§10.5/§10.11` (edges) + `Doc-4M` (index); §3 (this document).

---

## §6 — Vendor Lead Pipeline Surface Realization (BC-OPS-3)

### 6.1 Endpoint Realization (§5.2/§5.3; inventory §2.4)
- Methods (all **User(vendor)**): `update_lead_stage` → `POST /operations/leads/{id}/update_lead_stage` (state command); `add_lead_activity` → `POST /operations/leads/{id}/activities` (append child — `lead_activities` append-only, `201` — §2.6 [realization convention §0.4]); reads → `GET` (`get_lead`, `list_leads`).
- Inputs per §5.4: `{id}` = `vendor_lead_id` `UUIDv7` in path; Request-Contract fields in body (`update_lead_stage`: `expected_stage`/`target_stage`/`value_estimate?`/`next_action_at?`; `add_lead_activity`: `activity_jsonb`, `actor_user_id` captured server-side — never a wire input, `Doc-4A §9.7`).
- **The lead-creating contract `create_lead_on_invitation` (← `VendorInvited`) is out-of-wire §9/R7** — the only creator; no caller create-lead endpoint exists (a vendor never self-creates a lead).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4F §F6.2/§F6.3`.

### 6.2 Lead Machine (Doc-2 §3.5 — Doc-4M index)
- Realized as **legal transitions only**: `update_lead_stage` drives the frozen `vendor_leads` machine **`received → quoted → negotiation → won | lost → follow_up`** (`Doc-2 §3.5`; `Doc-4F §F6.2` H.5) — **no candidate state invented** (the `assigned`/`viewed`/`contacted`/`responded`/`converted`/`rejected`/`expired` set is explicitly absent — H.5). Illegal source → `STATE` → `409` (lifecycle legality checked first); then optimistic-concurrency `expected_stage` mismatch → `CONFLICT` → `409`. `lead_activities` is **append-only — no lifecycle**; an activity may be logged in any stage (`Doc-4F §F6.3`).
- **`won`/`lost` here is the vendor's private pipeline outcome, never the RFQ award decision** (RFQ owns award — DF-3); the lead `stage` is vendor-private CRM and **is not a governance signal** (§4B firewall — R6).
- **Binds:** `Doc-2 §3.5`; `Doc-4M`; `Doc-4F §F6.2/§F6.3`.

### 6.3 Actor-Side (Vendor-side only), Disclosure & Non-Disclosure (R5/H.9)
- **Actor side = Vendor only** (per the §3 per-command actor-side rule; `Doc-4F §F6` H.3 "BC-OPS-3 is vendor-side only"): both commands are scoped to the lead's **vendor `controlling_organization_id`**. **§6B delegation is eligible** for a vendor representative org acting for a vendor profile it does not control (`Doc-4F §F6.2/§F6.3` "Delegation eligible"); slug `can_manage_leads` (Doc-2 §7).
- **Disclosure scope = `Vendor-Counterparty`** (§3.5; vendor-controlling-org-private — the symmetric analog of `Buyer-Org-Private`): `get_lead` / `list_leads` return **only** the active vendor controlling org's own leads (RLS-scoped). A non-owned reference collapses to a uniform **`NOT_FOUND`** (status/body/timing identical to absent — no side-channel, H.9). `list_leads` enumerates only the caller's own leads — never another vendor's.
- **Non-disclosure (R5 — load-bearing on this surface):** the lead carries `rfq_id`/`invitation_id`/`vendor_profile_id` as **bare UUIDs** and is **not a window into RFQ-owned data** (DF-3). A vendor **cannot infer hidden routing decisions, competitor existence/count, ranking/matching signals, deferral, or any other invited vendor** through the lead surface (`Doc-2 §10.11`; `Doc-4A §7.5`; H.9) — the lead exists only at invitation `delivered` (undelivered `selected`/`deferred` leave no trace). No RFQ detail beyond the vendor's own grant is read here.
- **Binds:** `Doc-5A §6.3/§7.5`; `Doc-4A §6B/§7.5`; `Doc-2 §10.11`; `Doc-4F §F6` H.3/H.9; §3.4/§3.5.

### 6.4 Idempotency, Error & Audit (no events — R10/H.7)
- Mutations `Idempotency: required` → **`Idempotency-Key`** (`operations.idempotency_dedup_window` — Doc-3 §12.2, **registered via Patch v1.4**); replay within window → cached original, **no duplicate audit** (`Doc-5A §9.7`). `update_lead_stage` optimistic concurrency (`expected_stage`); stale → `CONFLICT` → `409`. Error per `Doc-5A §6.2` (by pointer; codes `Doc-4F §F6`, `ops_`): `VALIDATION`→400, `AUTHORIZATION`→403 (else `404` collapse — §6.3/R5), `NOT_FOUND`→404, `STATE`→409, `CONFLICT`→409, `SYSTEM`→500. Top-level `reference_id` on every body-bearing response (§4.4).
- **Emits no domain event** (H.7 — every lead mutation is state + audit only). Mutations **audited** via Doc-4B `core.append_audit_record.v1`; Doc-2 §9 enumerates no `vendor_leads`/`lead_activities` action → **every** §6 mutation carries **`[ESC-OPS-AUDIT]`** (nearest §9 action by pointer; never invented — §10.3). `list_leads` cursor-paginated (`operations.list_page_size_max`; no offset — `CHK-5A-070/071`); reads bind `can_manage_leads` (no separate read slug — `[ESC-OPS-SLUG]` only if later required, H.3).
- **Binds:** `Doc-5A §6/§9`; `Doc-4F §F6`; Doc-2 §7/§9; `operations.*` (Patch v1.4), `[ESC-OPS-AUDIT]`, `[ESC-OPS-SLUG]`.

---

## §7 — Document Templates & Generated Documents Surface Realization (BC-OPS-4)

### 7.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
- Methods (all **User**, own-org): `create_template` → `POST /operations/templates` (`201`+`Location`); `add_template_version` → `POST /operations/templates/{id}/versions` (append immutable child, `201` — §2.6); `activate_template` / `archive_template` / `reactivate_template` → `POST /operations/templates/{id}/{command}` (state commands); `grant_generated_document` / `revoke_generated_document_grant` → `POST /operations/generated_documents/{id}/{command}` (grant commands); reads → `GET` (`get_template`, `list_templates`, `get_generated_document`, `list_generated_documents`).
- **The generating contract `generate_document` (async engine job) is out-of-wire §9/R9** — enqueued by a user action (per `Doc-4F §F7.3`), idempotent on `generation_job_id`; no caller generate endpoint exists.
- **Binds:** `Doc-5A §5.2/§5.3/§10`; `Doc-4F §F7.1/§F7.2/§F7.4`.

### 7.2 Template Machine (Doc-2 §5.9 — Doc-4M index) & Immutable Versions
- Realized as **legal transitions only** (Doc-2 §5.9, verbatim): create enters **`draft`**; `activate_template` `draft → active`; `archive_template` `active → archived`; `reactivate_template` `archived → active`; `add_template_version` rides the **`active → active`** edit edge (parent must be `active`). Illegal source → `STATE` → `409` (e.g. `draft → archived` direct, or versioning a non-`active` template); stale `expected_status`/`expected_template_status` → `CONFLICT` → `409`.
- **`template_versions` are immutable** (`Doc-2 §5.9` "Never overwritten"): a new version is appended as `version_no+1`; any request that targets/overwrites an existing version → `BUSINESS` → `422` (`Doc-4F §F7.2` immutable-version guard). Generated documents **record the `template_version` used** (§5.9).
- **Binds:** `Doc-2 §5.9/§10.5` (authoritative edges); `Doc-4M`; `Doc-4F §F7.1/§F7.2`.

### 7.3 Async Generated Documents (R9) & the Document-Grant Model
- **R9 (async, Doc-5A §10):** the user action enqueues the out-of-wire `generate_document` job (§9), returning **`202`** (accepted-then-processing — engagement-document issue/revise in §5.3; any other generation enqueue likewise). The status-resource Query **`get_generated_document` is the canonical Doc-5A §10 polling resource and source of truth** (Structure FROZEN R9), returning **`ASYNC_PENDING`** while the file is pending and **never a fabricated outcome** (`Doc-5A §10.2/§10.3`; `CHK-5A-090/-092`); generated documents hold a **`storage_ref` only** (Doc-4B storage, DF-8 — never an in-row blob).
- **Document-grant model (the sole sharing channel):** `grant_generated_document` / `revoke_generated_document_grant` toggle counterparty visibility — a shared generated document is visible to the **owning org + granted counterparty only**, never broader; revoke removes counterparty visibility (`Doc-4F §F7.4`; `Doc-2 §10.5`). Cross-counterparty access is **explicit grant, never implicit disclosure** (R9). The Operations grant is **distinct from RFQ's `rfq_document_grant`** (RFQ-owned — DF-3). Grant/revoke is idempotent (grant→granted, revoke→revoked; replay returns current state).
- **Binds:** `Doc-5A §10`; `Doc-4A §15`; `Doc-4F §F7.3/§F7.4`; `Doc-2 §10.5`; structure R9.

### 7.4 Actor-Side (Either, own-org), Disclosure & Delegation
- **Actor side = Either** (per the §3 per-command actor-side rule): BC-OPS-4 is **org-internal — `User` (owning org member)**, applicable to a buyer org or a vendor org symmetrically (`Doc-4F §F7` H.3 "scope = the owning organization"); no buyer/vendor asymmetry. **§6B delegation is NOT eligible** (`Doc-4F §F7.1/§F7.2/§F7.4/§F7.5` "Delegation not eligible — own-org template management / generated-document sharing; no representative-org scenario"). Slugs: `can_manage_templates` (templates) and `can_create_documents` (generated-document creation/sharing) — Doc-2 §7.
- **Disclosure scope:**
  - **Templates** (`get_template` / `list_templates`) → **`Buyer-Org-Private` / `Vendor-Counterparty`** per the owning side (controlling-org-private, structure §7) — templates are **own-org only**; slug `can_manage_templates`.
  - **Generated documents** (`get_generated_document` / `list_generated_documents`) → **`Shared-Engagement` (grant-scoped)**: visible to the **owning org + granted counterparty only** (the grant is the only widening, never broader); slug `can_create_documents` **or** an active counterparty grant. A non-owned / non-granted reference collapses to **`NOT_FOUND`** (H.9). `list_*` enumerate only the caller's own rows plus generated documents granted to it.
- **Binds:** `Doc-4F §F7` H.3/H.9; `Doc-2 §6/§7/§10.5`; `Doc-4A §6B/§7.5`; §3.4/§3.5.

### 7.5 Idempotency, Error & Audit (no events — H.7)
- Mutations `Idempotency: required` (`operations.idempotency_dedup_window`); replay → cached original, **no duplicate audit** (`Doc-5A §9.7`); template lifecycle optimistic on `expected_status`; stale → `CONFLICT` → `409`. Error per `Doc-5A §6.2` (by pointer; codes `Doc-4F §F7`, `ops_`): `VALIDATION`→400, `AUTHORIZATION`→403 (else `404` collapse), `NOT_FOUND`→404, `STATE`→409, `CONFLICT`→409, `BUSINESS`→422 (immutable-version overwrite / illegal grant target), `REFERENCE`→422 (definitive — counterparty does not resolve), `DEPENDENCY`→503 (transient storage/Identity/Doc-4B, `retryable: true` — kept distinct from `REFERENCE`, H.4). Top-level `reference_id` (§4.4).
- **Emits no domain event** (H.7). Audit binds **Doc-2 §9 Documents directly** for the enumerated actions — "template create/activate/archive", "template … new version", "generated document creation" (the generation job, §9) — via Doc-4B `core.append_audit_record.v1`. The **`generated_documents` counterparty grant** is not separately enumerated for the Operations side (§9 names the RFQ-side `rfq_document_grant`) → it carries **`[ESC-OPS-AUDIT]`** (nearest §9 Documents grant action by pointer; never invented — §10.3). `list_*` cursor-paginated (`operations.list_page_size_max`; `CHK-5A-070/071`); no separate read slug (`[ESC-OPS-SLUG]` only if later required).
- **Binds:** `Doc-5A §6/§9`; `Doc-4F §F7`; Doc-2 §7/§9; `operations.*` (Patch v1.4), `[ESC-OPS-AUDIT]`, `[ESC-OPS-SLUG]`.

---

## §8 — Finance Records Surface Realization (BC-OPS-5)

### 8.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
- Methods (all **User**, own-org): `create_finance_record` → `POST /operations/finance_records` (`201`+`Location`); `update_finance_record` → `PATCH /operations/finance_records/{id}` (partial update — **no state command**, `finance_records` has no lifecycle); reads → `GET` (`get_finance_record`, `list_finance_records`).
- Inputs per §5.4: create body = `record_type`/`period`/`amount`/`currency?`/`note?`; update body = `expected_revision` + editable fields. **`record_type` is set at create and structurally excluded from the update schema** — a supplied `record_type` on update is an unknown field → SYNTAX `VALIDATION` → `400` (`Doc-4F §F8.1` immutability by schema exclusion).
- **Binds:** `Doc-5A §5.2/§5.3`; `Doc-4F §F8.1`.

### 8.2 No Lifecycle; `record_type` Immutable (Doc-2 §3.5 "simple")
- `finance_records` is **simple — no state machine** (`Doc-2 §3.5`; `Doc-4F §F8` H.5): mutations declare `State-Machine-Effects: none`; **no `STATE` failure arises**. `update_finance_record` is optimistic-concurrency only — `expected_revision` mismatch → `CONFLICT` → `409` (kept **distinct from `STATE`**, H.4). `record_type` is the **fixed four-value enum `{tax, ait, payment, expense}`**, set at create, never extended.
- **Binds:** `Doc-2 §3.5/§10.5`; `Doc-4F §F8.1` H.5.

### 8.3 Actor-Side (Either, own-org), Disclosure & Money Boundary (R8)
- **Actor side = Either** (per the §3 per-command actor-side rule): BC-OPS-5 is **org-internal — `User` (owning org member)**, applicable to a buyer org or vendor org symmetrically (`Doc-4F §F8` H.3 "scope = the owning organization"); slug `can_manage_finance_records`. **§6B delegation is NOT eligible** ("own-org finance records; no representative-org scenario", `Doc-4F §F8.1`).
- **Disclosure scope = `Buyer-Org-Private` / `Vendor-Counterparty`** per the owning side (controlling-org-private, structure §8): `get_finance_record` / `list_finance_records` return **only** the active org's own records (RLS-scoped); non-owned → **`NOT_FOUND`** collapse (H.9); `list_*` never enumerates cross-tenant rows.
- **Money boundary (R8 — records, not rails):** a finance record is **structured text only — no funds movement, no file uploads** (`Doc-2 §10.5`). It is **not** a `billing.platform_invoice` (DF-6), **not** a BC-OPS-2 `trade_invoice`/`payment_record`, and references no Billing/RFQ entity — an org-internal finance text entry. A funds/file-upload attempt → `BUSINESS` → `422`. **Flag-and-halt if a settlement/transfer surface is proposed.** BC-OPS-5 may *read* Trust outputs but **computes/mutates no Trust score** (DF-4 — R6).
- **Binds:** `Doc-4F §F8` H.3/H.9; `Doc-2 §6/§10.5`; `Doc-4A §6B/§7.5`; DF-6; structure R8; §3.4/§3.5.

### 8.4 Idempotency, Error & Audit (no events — H.7)
- Mutations `Idempotency: required` (`operations.idempotency_dedup_window`); replay → cached original, **no duplicate audit** (`Doc-5A §9.7`); update optimistic on `expected_revision`; stale → `CONFLICT` → `409`. Business-duplicate (two distinct keys creating the same record) is **permitted** — Doc-2 §10.5 places no uniqueness constraint; never `CONFLICT` for business-uniqueness (`Doc-4A §14.6`). Error per `Doc-5A §6.2` (by pointer; codes `Doc-4F §F8`, `ops_`): `VALIDATION`→400, `AUTHORIZATION`→403 (else `404` collapse), `NOT_FOUND`→404, `CONFLICT`→409, `BUSINESS`→422 (`record_type` mutation / funds / file-upload attempt), `DEPENDENCY`→503 (transient Doc-4B). Top-level `reference_id` (§4.4).
- **Emits no domain event and consumes none** (H.7). Mutations audited via Doc-4B; Doc-2 §9 Financial enumerates no `finance_records` action → **every** §8 mutation carries **`[ESC-OPS-AUDIT]`** (nearest §9 Financial action by pointer; never invented — §10.3). `list_finance_records` cursor-paginated (`operations.list_page_size_max`; `CHK-5A-070/071`); no separate read slug (`[ESC-OPS-SLUG]` only if later required).
- **Binds:** `Doc-5A §6/§9`; `Doc-4F §F8`; Doc-2 §7/§9; `operations.*` (Patch v1.4), `[ESC-OPS-AUDIT]`, `[ESC-OPS-SLUG]`.

---

## §9 — Out-of-Wire Boundary (System event consumers · async doc-gen job · internal-service CRM read)

The **4 out-of-wire contracts have no HTTP wire in any protocol — no REST, no SSE, no WebSocket, no Webhook, no GraphQL** (`Doc-5A §1.3/§11`; structure R1). They are in-process services / background workers / event consumers driven by the M0 outbox or another module's transaction; implementation is code / Doc-6. **Flag-and-halt if any wire surface in any protocol is proposed for them.**

| Contract | Template | Trigger / nature | Realization (out-of-wire) |
|---|---|---|---|
| `ops.create_engagement_on_award.v1` | 21.5 System | consumes RFQ **`RFQClosedWon`** | the **only** creator of an `engagements` row (post-award seam — R7/DF-3); idempotent on the inbound event identity; writes the engagement at its entry state; emits no caller response. RFQ owns the award (Doc-4E) — no matching/award authored here. |
| `ops.create_lead_on_invitation.v1` | 21.5 System | consumes RFQ **`VendorInvited`** (fires only at invitation `delivered`) | the **only** creator of a `vendor_leads` row (entry `received` — §6.2); idempotent on `invitation_id`; **independently co-consumed by Communication** for fan-out (DF-7 — the two consumers are independent). Undelivered `selected`/`deferred` create no lead (non-disclosure — §6.3/H.9). |
| `ops.generate_document.v1` | 21.5 System | async template-engine job, enqueued by a user action (§5.3/§7.3 → `202`) | idempotent on **`generation_job_id`** (no duplicate-generation); writes one `generated_documents` row (`human_ref DOC-…` + `storage_ref` + recorded `template_version`); `get_generated_document` is the §10 polling source of truth (R9). No caller wire — the enqueue rides §5/§7. |
| `ops.read_crm_status_for_routing.v1` | 21.3 internal-service | RFQ-routing-consumed CRM-status read (DF-3) | the **sole sanctioned egress** of buyer-CRM status (R5) — engineered so a blacklist/exclusion is **indistinguishable from a non-match** (`Doc-4A §7.5`; `Doc-2 §10.11`); accessed via the `operations/contracts/` service interface only, **never a tenant wire, never a direct table/cross-schema read** (§3.5 Internal-Service fence). The **highest-stakes application of R1/R5** in this module. |

- **Binds:** `Doc-4F §F4.x` (CRM read-service), `§F5.x`/`§F6.1`/`§F7.3` (consumers/job), Appendix (DF-3/DF-7); `Doc-5A §1.3/§11`; structure §9/R1/R5/R7/R9.

---

## §10 — Conformance & Carried Items

### 10.1 Conformance Statement
- Doc-5F passes the Doc-5A **Appendix A** checklist (Appendix A below) in full before freeze. It coins **no** endpoint, status, header, error class, permission slug, POLICY key, audit action, or event (`CHK-5A-121/123/154`; `Doc-4A §6.4/§16.4/§18.2`). Every realized point binds its Doc-4F / Doc-5A / corpus owner **by pointer**.

### 10.2 `[ESC-OPS-POLICY]` — RESOLVED (content-freeze gate cleared)
- The `operations.*` wire keys (`operations.idempotency_dedup_window` *[24h]*, `operations.list_page_size_max` *[100]*) are **registered in Doc-3 §12.2** via the approved `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` (the `operations` POLICY namespace was created ahead of content; precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2 / `trust.*` v1.3). **`CHK-5A-121/071` pass unconditionally.** No key invented (every Doc-4F PassB reference carried the `[ESC-OPS-POLICY]` marker; this Doc-5F binds the now-registered keys by pointer).

### 10.3 `[ESC-OPS-AUDIT]` — carried by pointer (governance note; **not a content-freeze gate**)
- **Disposition (resolves Pass-2 MINOR-02).** Per the Structure FROZEN *Open Carried Items* table, **`[ESC-OPS-AUDIT]` is `Freeze gate? No`** — it is a carried interim binding, not a content-freeze gate (only `[ESC-OPS-POLICY]` is a content gate, now resolved §10.2). Doc-2 §9 enumerates no separate action for `vendor_leads`/`lead_activities` (§6), the `generated_documents` **counterparty grant** (§7.4 — §9 names only the RFQ-side `rfq_document_grant`), or `finance_records` (§8). For these, Doc-5F **binds the nearest existing Doc-2 §9 domain action by pointer** (§9 Documents grant for the doc-grant; nearest §9 Financial for finance) — the **exact, sanctioned interim handling frozen in Doc-4F PassB** (Part-3/4/5 Appendix A/B), resolved only via the additive Doc-2 §9 channel, **never invented here** (`Doc-4A §16.4`). The enumerated §9 Documents actions (template lifecycle/new-version/generated-document creation) bind **directly** (§7.5).
- **Why this conforms (not a redecision):** realizing the interim by-pointer binding is exactly the frozen Doc-4F handling; Doc-5F neither invents a §9 action nor reopens the carried marker. A future additive Doc-2 §9 registration would tighten the binding without changing any Doc-5F wire surface. This is the governance note Pass-2 MINOR-02 required; the marker travels unresolved-by-design, consistent with the structure.

### 10.4 `[ESC-OPS-SLUG]` — carried by pointer
- No M4 action lacks a Doc-2 §7 slug on the **command** surface (all bind existing `can_manage_*`/`can_create_*`/`can_record_*`/`can_approve_*` slugs — Doc-4F B.4). The **read** surfaces bind the owning command slug (`can_manage_leads`, `can_manage_templates`/`can_create_documents`, `can_manage_finance_records`); `[ESC-OPS-SLUG]` is carried **only** against a future distinct read slug — none invented (`CHK-5A-154`).

### 10.5 `reference_id` (C-05) — satisfied
- Every body-bearing Doc-5F response carries a **top-level `reference_id`** (UUIDv7) — declared §4.4 (nominated point), cross-cutting §5–§8; `204` exempt (`PATCH-D4A-C05-204`). `CHK-5A-042` [B] passes (Appendix A).

### 10.6 Carried-item register (Doc-4F Appendix — by pointer; resolved only via named channels)
| ID | Item | Doc-5F handling | Freeze gate? |
|---|---|---|---|
| DF-1…DF-8 | Identity / Marketplace / RFQ / Trust / Admin / Billing / Communication / Platform Core | Consumed or out-of-wire per §1.4 / §9; no cross-module surface realized | No |
| `[ESC-OPS-SLUG]` | possible future distinct read slug | nearest existing slug by pointer (§10.4); Doc-2 §7 additive channel | No |
| `[ESC-OPS-AUDIT]` | lead / doc-grant / finance-record actions not separately enumerated in Doc-2 §9 | nearest §9 action by pointer (§10.3); Doc-2 §9 additive channel | **No** (structure ruling) |
| `[ESC-OPS-POLICY]` | `operations.*` dedup-window / list page-size keys | **RESOLVED** — registered via Patch v1.4 (§10.2) | **Cleared** |

---

## Appendix A — Doc-5F Conformance Attestation

Per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M4 surface (the freeze evidence). Severity: **[B]** blocker · **[M]** major · **[m]** minor. All bands **PASS**.

| Band | Check(s) | Result | Evidence |
|---|---|---|---|
| **Method mapping** | `CHK-5A-031` [B], `-032`, `-033` | PASS | Creates → `POST` collection `201` (`create_private_vendor`/`issue_trade_invoice`/`record_payment`/`create_template`/`add_*_version`/`add_*_note`/`add_lead_activity`/`create_finance_record`); partial update → `PATCH` (`update_private_vendor`/`update_finance_record`); state/domain/grant commands → `POST` named; reads → `GET`; **no `PUT`** (§2.1, §4.1, §5.1, §6.1, §7.1, §8.1). |
| **Created-resource carriage** | `CHK-5A-035` [m] | PASS | Every `201` carries `Location` (§4.1, §5.1, §7.1, §8.1). |
| **Path grammar** | `CHK-5A-051`, `-052` | PASS | `/operations/{resource-plural}[/{id}][/{command}]`; prefix `operations` (App B.1), never the `ops.` token stem (R3); resources plural [realization convention] (§2.1). |
| **`reference_id` (C-05)** | `CHK-5A-042` [B] | PASS | Top-level on every body-bearing response; `204` exempt; never nested in `error` (§4.4, §10.5). |
| **Error mapping** | `CHK-5A-061`, `-062`, `-063` | PASS | `Doc-5A §6.2` class→status by pointer; `REFERENCE` (definitive, 422) vs `DEPENDENCY` (transient, 503) distinct; `STATE` (409) vs `CONFLICT` (409, concurrency) distinct (§5.5, §6.4, §7.5, §8.4; H.4). |
| **Identity / context / authz carriage** | `CHK-5A-072`, `-073`, `-074` | PASS | `Authorization` = auth only; `Iv-Active-Organization` server-validated, never client-trusted; `check_permission` sole authority, no shadow path; slugs never wire inputs (§3.1–§3.4). |
| **Actor-side & disclosure declaration** | structure §3 M-01 (binding) | PASS | Every command declares exactly one actor side (Buyer/Vendor/Either); every read exactly one of the frozen four disclosure scopes; narrow-never-widen / never-broaden (§4–§8). |
| **Async** | `CHK-5A-090`, `-092` | PASS | `issue/revise_engagement_document` → `202`; `get_generated_document` = source of truth, `ASYNC_PENDING` while pending, never fabricated (§5.3, §7.3). |
| **Idempotency** | `CHK-5A-093` (§9.7) | PASS | All mutations `Idempotency: required`; replay → cached original, no duplicate audit, no re-emitted outbox event; `operations.idempotency_dedup_window` (§4.5, §5.5, §6.4, §7.5, §8.4). |
| **Pagination** | `CHK-5A-070` [B], `-071` [M] | PASS | All 6 list reads cursor-only (no offset); `operations.list_page_size_max` registered (§2.6, §10.2). |
| **Events / outbox** | `CHK-5A-103` | PASS | BC-OPS-2 perf-input events → M0 outbox, Doc-2 §8 by pointer (§5.5); BC-OPS-3/4/5 emit none (§6.4, §7.5, §8.4); no caller webhook/push. |
| **Anti-invention** | `CHK-5A-121` [B], `-123`, `-154` | PASS | No endpoint/status/header/error-class/slug/POLICY-key/audit-action/event coined; `[ESC-OPS-*]` markers bound by pointer (§10.2–§10.4). |
| **Non-disclosure (M4-unique, load-bearing — R5)** | structure Appendix A band | PASS | **No buyer-vendor-status or buyer-private CRM fact is surfaced on any tenant wire** (§4.3); the **lead surface leaks no routing/competitor/ranking/deferral** (§6.3/H.9); the **blacklist-indistinguishable-from-non-match** property holds; the CRM-status egress (`read_crm_status_for_routing`) is **out-of-wire only** (§9). Protected-fact reads collapse to uniform `NOT_FOUND` (no timing side-channel). No status event emitted. |
| **Money boundary (R8)** | structure Appendix A band | PASS | **No trade-invoice / payment / finance surface exposes a funds-movement, escrow, settlement, or payment-gateway operation** (§5.3, §8.3); `operations.trade_invoices`/`payment_records`/`finance_records` ≠ `billing.platform_invoices` (DF-6); all realized as record/document state transitions only. |
| **Out-of-wire (R1)** | structure §9 band | PASS | The 4 out-of-wire contracts have **no wire in any protocol** (§9); flag-and-halt armed. |

**Attestation result:** Doc-5F conforms to Doc-5A in full — **0 open BLOCKER/MAJOR/MINOR**; `[ESC-OPS-POLICY]` resolved (§10.2); `[ESC-OPS-AUDIT]`/`[ESC-OPS-SLUG]` carried by pointer per the frozen structure (not content gates, §10.3/§10.4). **Doc-5F content (§0–§10 + Appendix A) is complete and ready for the Freeze Readiness Audit.**

---

*End of Doc-5F Content v1.0, Pass 3 (§6–§10 + Appendix A). The 19 vendor-lead / template-and-generated-document / finance-record endpoints realized per the §5.2 method mapping (creates `POST`/`201`+`Location`, partial updates `PATCH`, state/domain/grant commands `POST` named, append children `POST` sub-collection `201`, reads `GET`); lead machine `received→quoted→negotiation→won|lost→follow_up` (Doc-2 §3.5, no state invented), template machine §5.9 `draft→active→archived`+`active→active`(new immutable version)+`archived→active`, `finance_records` simple/no-lifecycle with immutable `record_type`; §6 vendor-side-only (`Vendor-Counterparty`, §6B delegation eligible, non-disclosure H.9 — no routing/competitor leak); §7 own-org Either (delegation not eligible, templates own-org-only, generated docs `Shared-Engagement` grant-scoped, async `202` + `get_generated_document` source of truth, document-grant the sole sharing channel); §8 own-org Either (delegation not eligible, money-boundary R8 records-not-rails); §9 out-of-wire boundary (4 contracts — RFQ award/invitation consumers, async doc-gen job, the highest-stakes `read_crm_status_for_routing` CRM-status egress under R5); §10 conformance (`[ESC-OPS-POLICY]` resolved via Patch v1.4; `[ESC-OPS-AUDIT]`/`[ESC-OPS-SLUG]` carried by pointer per structure — Pass-2 MINOR-02 dispositioned by governance note, not invention); Appendix A all bands PASS incl. the M4-unique non-disclosure and money-boundary bands. Events → M0 outbox / Doc-2 §8 by pointer; representations/codes/POLICY keys/audit actions/state edges not restated; nothing coined. Doc-5F content complete — ready for the Freeze Readiness Audit, then `Doc-5F_SERIES_FROZEN_v1.0` + 4-tracker sync.*
