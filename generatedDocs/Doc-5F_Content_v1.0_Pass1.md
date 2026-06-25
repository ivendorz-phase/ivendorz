# Doc-5F — Business Operations (M4 `operations`) API Realization — Content v1.0, Pass 1 (§0–§3)

| Field | Value |
|---|---|
| Document | Doc-5F — Business Operations (Module 4) — API Realization |
| Pass | 1 of 3 — §0, §1, §2 (the 46-endpoint caller-facing inventory) and §3 (cross-cutting wire model) |
| Status | ACTIVE — Content Pass 1 of 3; §0–§3. **Independent Hard Review applied (Pass-1):** MINOR-01 §2.6 cursor-pagination statement added for 6 list reads; MINOR-02 §3.5 exactly-one + mutually-exclusive scope declaration added; MINOR-03 §2.6 `[realization convention §0.4]` added to append-child resolution; O-01 §3.5 per-command actor-side rule (M-01) added; O-02 §2.1 entity list extended; NP-01 §2 header inventory-completeness clause added; NP-02 §0.3 Pass-1 scope binding sentence added; NP-03 §2.6 archive citation clarified; MINOR (from MAJOR-01) §2.6/row 27 `get_engagement_document` vs `get_generated_document` role clarified per R9; MINOR (from user MINOR-01) §3.5 Internal-Service fence added; O-03 §2.6 `Either` confirm-risk note added; NP (from MINOR-03) §2.1 `ASYNC_PENDING` body-state clarification added; NP (from NP-02) colophon BLOCKER detail removed to status header. **BLOCKER-01 RESOLVED (conformed to Structure FROZEN §3 — no architecture change):** the non-conformant labels `Vendor-Org-Private` / `Org-Owned` were corrected to the frozen four — §6 lead reads → `Vendor-Counterparty` (vendor-controlling-org scope, structure §6); §7/§8 org-owned reads → `Buyer-Org-Private` / `Vendor-Counterparty` per owning side (controlling-org scope, structure §7/§8); §3.5 enumeration bound to the frozen `Buyer-Org-Private / Vendor-Counterparty / Shared-Engagement / Internal-Service`, no label coined. **0 open BLOCKER/MAJOR/MINOR.** `[ESC-OPS-POLICY]` content-freeze gate **pre-cleared** by `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` (keys registered ahead of content). Pass-1 finalized — ready for Pass-2 |
| Module | Module 4 — Business Operations Engine (`operations` schema; the post-award ERP-Lite layer) |
| Realizes | `Doc-4F` (M4 contracts, FROZEN — 50 contracts: 46 caller-facing + 4 out-of-wire) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4F v1.0, Doc-4M v1.0, Doc-5A v1.0 (all FROZEN) |
| Contains | Document control + scope/surface-partition + the **46-endpoint** caller-facing inventory + the §3 cross-cutting two-sided-actor / non-disclosure **wire model** (mechanism only). No §5.7 template instantiation (Pass-2/3), no out-of-wire realization detail (§9, Pass-3), no schemas, no Doc-4F contract body restated |
| Audience | Architecture / API Governance Boards · Doc-5F content authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4F fixed *what* each M4 contract declares (FROZEN); Doc-5A fixed *how* a contract becomes HTTP. Pass-1 fixes Doc-5F's precedence/scope, the **caller-facing endpoint inventory** (method, path, actor side, active-org, success, disclosure-scope) for the **46** caller-facing M4 endpoints, and the **§3 cross-cutting wire model** §4–§8 depend on. It instantiates no full endpoint template (§4–§8), realizes no out-of-wire mechanism (§9), and coins no endpoint/status/header/error-class/slug/POLICY key/event. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §0/§1/§5/§6.3/§7/§10` · `Doc-4F §F0/§F4–§F8`, Appendix · `Doc-4C §C3/§C8` (consumed) · Appendix B.1 (`operations`).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
- Doc-5F sits one realization level below Doc-5A (`Doc-5A §0.1`):
  ```
  Master → ADR → Doc-2 · Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4F → Doc-5A → Doc-5F → Code
  ```
- Doc-5F **MUST NOT** override, reinterpret, or weaken any higher document; on conflict the higher prevails and Doc-5F is patched (flag-and-halt, `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-5A §0.1`.

### 0.2 Scope of Authority
- Doc-5F governs **how the FROZEN Doc-4F contracts of Module 4 are realized as concrete HTTP APIs** — the wire layer only (two-sided tenant User).
- It does **not** govern: *what* a contract declares (Doc-4F/Doc-4A); the state machines (Doc-2 §3.5/§5.9/§10.5 edges + Doc-4M index); matching/award (RFQ/Doc-4E — DF-3); any trust/performance/verification/tier signal (Trust/Doc-4G — DF-4; Operations stores none); any Admin decision (Doc-4J — DF-5); any Billing/settlement/funds movement (Doc-4I — DF-6; records-not-rails — R8); notification dispatch (Communication/Doc-4H — DF-7); persistence (Doc-6); or the M4 System/internal mechanisms with no wire (§9).
- **Binds:** `Doc-5A §0.2`; `Doc-4F §F0`.

### 0.3 Conformance Obligation
- Before freeze, Doc-5F **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) in full. It coins **no** endpoint, status, header, error class, slug, POLICY key, or event (`CHK-5A-121/154`; `Doc-4A §6.4/§16.4`).
- **Two content-freeze obligations:**
  - **`reference_id` (C-05):** every body-bearing response carries a top-level `reference_id` (`Doc-4A §22.1 C-05`; `204` exempt per `PATCH-D4A-C05-204`, ratified 2026-06-24); **nominated declaration point = §4** (Pass-2), cross-cutting §5–§8 (`CHK-5A-042` [B]).
  - **`[ESC-OPS-POLICY]` — PRE-CLEARED:** the `operations.*` wire keys (`operations.idempotency_dedup_window`, `operations.list_page_size_max`) are **already registered in Doc-3 §12.2** via the approved `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations` (the `operations` namespace was created ahead of content). `CHK-5A-121/071` pass unconditionally at the Freeze Audit.
- **Pass-1 scope (binding):** Pass-1 realizes only the 46-endpoint caller-facing surface inventory and the §3 cross-cutting wire model mechanism; no §5.7 endpoint template is instantiated and no §9 out-of-wire mechanism is realized in this pass.
- **Binds:** `Doc-5A §0.5`, Appendix A; `Doc-4A §18.2/§22.1`; `PATCH-D4A-C05-204`; `Doc-3_Policy_Key_Registration_Patch_v1.4_Operations`.

### 0.4 Realize-Never-Redecide & Realization-Authority Rule
- Each realized point binds its Doc-4F / Doc-5A / corpus owner by pointer; no copy, paraphrase-with-change, or re-decide. **Transport-level silence** (Doc-5A §5.3 silent on nested / child / sub-collection addressing) → a `[realization convention]` contradicting nothing upstream.
- **Realization-authority rule (binding):** where a method/path realization depends on **contract authority** (create-vs-command, soft-delete-vs-state, async-vs-sync, cardinality), it is **resolved only from a frozen Doc-4F source (`State Effects` / Request Schema / State Machine)** — if it cannot be resolved from a frozen source, **FLAG-AND-HALT; do not choose a convention.** The Pass-1 §2 method/path set is **single-source binding on Pass-2/3**.
- **Binds:** `Doc-5A §0.3`; `Doc-4F` PassB.

---

## §1 — Scope, Audience & M4 Surface Partition

### 1.1 What Doc-5F Governs
- Doc-5F is the **HTTP realization of Module 4's caller-facing contracts** — buyer-private CRM, post-award engagements & commercial documents, vendor lead pipeline, document templates & generated documents, finance records. No other module's surface.
- Actors (R2): **two-sided tenant User** — **User(buyer)** and **User(vendor)**, both server-validated active-org context. **No Admin (21.6) surface. No public/anonymous surface. System** out-of-wire (§9).
- **Binds:** `Doc-5A §1`, §7; Doc-4F §F4.

### 1.2 M4 Surface Partition
The 50 Doc-4F contracts partition by wire-realizability (structure R1) — **46 caller-facing**, **4 out-of-wire**:

| Doc-4F contracts | Doc-5F treatment |
|---|---|
| BC-OPS-1 buyer-CRM commands + private reads · BC-OPS-2 engagement/commercial-doc commands + shared reads · BC-OPS-3 lead commands + reads · BC-OPS-4 template/generated-doc commands + reads + grant model · BC-OPS-5 finance commands + reads | **Caller-facing HTTP** — realized here (inventory §2; full template §4–§8) |
| `create_engagement_on_award` (← `RFQClosedWon`), `create_lead_on_invitation` (← `VendorInvited`), `generate_document` (async job), `read_crm_status_for_routing` (internal-service, RFQ-routing) | **Out-of-wire** — no HTTP surface (§9); code / Doc-6 |

- **Section ownership (structure § column) is authoritative; §2 grouping is informational.** Partition verified: §4(14)+§5(13)+§6(4)+§7(11)+§8(4)=46; §9=4; **section counts reconcile to the global 46+4=50**.
- **Binds:** `Doc-5F_Structure_v1.0_FROZEN` (partition); Doc-4F PassB; `Doc-5A §1.3`.

### 1.3 Dependency Boundary
- **M4 realizes only M4 surfaces.** Cross-module realization belongs to the owning module's Doc-5x (Identity → Doc-5C; Marketplace → Doc-5D; RFQ → Doc-5E; Trust → Doc-5G; Billing → Doc-5I; Admin → Doc-5J). **M4 consumes, never realizes, those surfaces.** Identity `check_permission`/org-context + §6B delegation consumed in-process (`Doc-4C §C3/§C8`); the RFQ award/invitation seam is **inbound event consumption** (out-of-wire, §9); cross-module events emit to the M0 outbox (R10).
- **Binds:** `Doc-5A §1`; structure §1.x.

### 1.4 Audience & Carried Items
- **Audience:** Architecture / API Governance Boards; Doc-5F authors (human + AI); AI Coding Supervisor; backend, QA.
- **Carried (Doc-4F Appendix — by pointer; resolved only via named channels):** **DF-1** Identity · **DF-2** Marketplace (`vendor_profile_id` refs) · **DF-3** RFQ (CRM read-service + award/invitation consumers, out-of-wire) · **DF-4** Trust (emits perf inputs, stores no signal) · **DF-5** Admin (link-suggestion decision) · **DF-6** Billing (money boundary — records, not rails) · **DF-7** Communication (notification fan-out) · **DF-8** Platform Core · `[ESC-OPS-SLUG]` (Doc-2 §7) · `[ESC-OPS-AUDIT]` (Doc-2 §9) · `[ESC-OPS-POLICY]` (**pre-cleared** — Patch v1.4 registered the `operations.*` keys).
- **Binds:** Doc-4F §F0, Appendix; Doc-2 §7/§8/§9; Doc-3 §12.2.

---

## §2 — Realized Endpoint Inventory

> **Inventory completeness is authoritative** — every M4 caller-facing endpoint must appear in this inventory; no endpoint may be added to §4–§8 unless first inventoried here. **Inventory order conveys no dependency, execution, or lifecycle order** — descriptive aggregation; the §4–§8 contract sections remain authoritative. Section ownership (the structure partition table) is authoritative; on conflict the partition table wins. **The disclosure-scope column (reads) and actor-side column (commands) declared here are normative and binding (§3): a later section MAY narrow but MUST NEVER widen a read's disclosure scope or broaden a command's actor side.** *[§2.6 exception — M-02 resolution]:* a §5.7-block correction backed by a **per-command frozen Doc-4F `Actor` / `Scope` field citation** supersedes a tentative Pass-1 assignment — consistent with §2.6 ("definitive actor side in §5.7 block against Doc-4F"). The `MUST NEVER widen` rule governs arbitrary widening without Doc-4F backing. Pass-2 §5.4 applies this exception for `issue_trade_invoice` / `record_payment` / `confirm_payment` (Pass-1: Vendor/Buyer/Vendor; corrected to Either party per `Doc-4F §F5.5 / §F5.6` Actor: `User (party)`, Scope: party org).*

### 2.1 Namespace, Path Grammar & Method Mapping
- All M4 caller-facing endpoints live under the reserved **`operations`** route prefix (Appendix B.1; `Doc-2 §0.3`) and follow the §5.3 grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`. **Path grammar derives from the route prefix `operations`, never the `ops.` token stem** (R3). Resource segments are the owning entity tables (`private_vendors`, `engagements`, `engagement_documents`, `trade_invoices`, `payment_records`, `leads`, `templates`, `generated_documents`, `finance_records`, `buyer_supplier_relationships`, …), plural **[realization convention]**.
- **Method mapping (`Doc-5A §5.2`, strict — `CHK-5A-031` [B]):** create → `POST` collection (`201`+`Location`); partial non-state update → `PATCH` item; state-transition / domain command → `POST` named sub-resource; ADR-012 soft-delete → `DELETE` item; read → `GET`. No `PUT`. Command tokens are the **exact `ops.<operation>` names verbatim from the Doc-4F PassB blocks** — the command identifier, **not** a path segment.
- **Async (R9 — Doc-5A §10):** **M4 has a caller `202`.** `issue_engagement_document` / `revise_engagement_document` enqueue the out-of-wire `generate_document` job (§9) and return **`202`** (accepted-then-processing); the **status-resource Query `get_generated_document` is the source of truth**, returning **`ASYNC_PENDING`** while pending (`ASYNC_PENDING` is a response-body lifecycle state, not an HTTP status code) and never a fabricated outcome (`Doc-5A §10.2/§10.3`; `CHK-5A-090/-092`). All other commands commit synchronously (`200`/`201`).
- **Money boundary (R8):** `issue_trade_invoice` / `update_trade_invoice_status` / `record_payment` / `confirm_payment` are **document/record state transitions, never a funds-movement or settlement surface** (records, not rails — DF-6).
- **Binds:** `Doc-5A §5.2/§5.3/§10`, Appendix B.1; Doc-2 §0.3; Doc-4F PassB.

### 2.2 Inventory — §4 Buyer Private CRM (BC-OPS-1, 14)

| # | Doc-4F Contract-ID | Actor side | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 1 | `ops.create_private_vendor.v1` | Buyer | `POST /operations/private_vendors` | Y | `201` | — |
| 2 | `ops.update_private_vendor.v1` | Buyer | `PATCH /operations/private_vendors/{id}` | Y | `200` | — |
| 3 | `ops.archive_private_vendor.v1` | Buyer | `POST /operations/private_vendors/{id}/archive_private_vendor` *(state `active→archived` — §2.6)* | Y | `200` | — |
| 4 | `ops.add_private_vendor_note.v1` | Buyer | `POST /operations/private_vendors/{id}/notes` *(append child — §2.6)* | Y | `201` | — |
| 5 | `ops.set_private_vendor_rating.v1` | Buyer | `POST /operations/private_vendors/{id}/set_private_vendor_rating` *(upsert — §2.6)* | Y | `200` | — |
| 6 | `ops.set_buyer_vendor_status.v1` | Buyer | `POST /operations/private_vendors/{id}/set_buyer_vendor_status` *(append-only history — R5; never evented)* | Y | `200` | — |
| 7 | `ops.clear_buyer_vendor_status.v1` | Buyer | `POST /operations/private_vendors/{id}/clear_buyer_vendor_status` | Y | `200` | — |
| 8 | `ops.set_vendor_favorite.v1` | Buyer | `POST /operations/private_vendors/{id}/set_vendor_favorite` *(child command — §2.6)* | Y | `200` | — |
| 9 | `ops.clear_vendor_favorite.v1` | Buyer | `POST /operations/private_vendors/{id}/clear_vendor_favorite` | Y | `200` | — |
| 10 | `ops.confirm_vendor_link.v1` | Buyer | `POST /operations/private_vendors/{id}/confirm_vendor_link` *(tenant write; suggestion Admin-owned DF-5)* | Y | `200` | — |
| 11 | `ops.dismiss_vendor_link.v1` | Buyer | `POST /operations/private_vendors/{id}/dismiss_vendor_link` | Y | `200` | — |
| 12 | `ops.get_private_vendor.v1` | Buyer | `GET /operations/private_vendors/{id}` | Y | `200` | **Buyer-Org-Private** |
| 13 | `ops.list_private_vendors.v1` | Buyer | `GET /operations/private_vendors` | Y | `200` | **Buyer-Org-Private** |
| 14 | `ops.get_buyer_supplier_relationship.v1` | Buyer | `GET /operations/buyer_supplier_relationships/{id}` | Y | `200` | **Buyer-Org-Private** |

**Section count = 14** (§4 caller-facing).

### 2.3 Inventory — §5 Procurement Engagement & Commercial Documents (BC-OPS-2, 13)

| # | Doc-4F Contract-ID | Actor side | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 15 | `ops.update_engagement_status.v1` | Either | `POST /operations/engagements/{id}/update_engagement_status` | Y | `200` | — |
| 16 | `ops.close_engagement.v1` | Either | `POST /operations/engagements/{id}/close_engagement` | Y | `200` | — |
| 17 | `ops.record_delivery.v1` | Vendor/Either | `POST /operations/engagements/{id}/record_delivery` | Y | `200` | — |
| 18 | `ops.record_buyer_feedback.v1` | Buyer | `POST /operations/engagements/{id}/record_buyer_feedback` *(perf input → outbox R10)* | Y | `200` | — |
| 19 | `ops.issue_engagement_document.v1` | Either (party) | `POST /operations/engagements/{id}/engagement_documents` *(async gen — `202`/R9)* | Y | `202` | — |
| 20 | `ops.revise_engagement_document.v1` | Either (party) | `POST /operations/engagement_documents/{id}/revise_engagement_document` *(versioned; async gen — `202`/R9)* | Y | `202` | — |
| 21 | `ops.issue_trade_invoice.v1` | Vendor | `POST /operations/engagements/{id}/trade_invoices` *(record, not rail — R8)* | Y | `201` | — |
| 22 | `ops.update_trade_invoice_status.v1` | Either | `POST /operations/trade_invoices/{id}/update_trade_invoice_status` *(`issued→partially_paid→paid|disputed|cancelled`)* | Y | `200` | — |
| 23 | `ops.record_payment.v1` | Buyer | `POST /operations/trade_invoices/{id}/payments` *(bookkeeping record — R8)* | Y | `201` | — |
| 24 | `ops.confirm_payment.v1` | Vendor | `POST /operations/payment_records/{id}/confirm_payment` *(`recorded→confirmed`)* | Y | `200` | — |
| 25 | `ops.get_engagement.v1` | Either | `GET /operations/engagements/{id}` | Y | `200` | **Shared-Engagement** |
| 26 | `ops.list_engagements.v1` | Either | `GET /operations/engagements` | Y | `200` | **Shared-Engagement** *(party-scoped)* |
| 27 | `ops.get_engagement_document.v1` | Either | `GET /operations/engagement_documents/{id}` *(engagement-document request record — shows `ASYNC_PENDING` while generation is pending; `get_generated_document` is the canonical Doc-5A §10 polling resource per R9 — see §2.6)* | Y | `200` | **Shared-Engagement** |

**Section count = 13** (§5 caller-facing).

### 2.4 Inventory — §6 Vendor Lead Pipeline (BC-OPS-3, 4)

| # | Doc-4F Contract-ID | Actor side | Method · Path | Active-Org | Success | Disclosure |
|---|---|---|---|---|---|---|
| 28 | `ops.update_lead_stage.v1` | Vendor | `POST /operations/leads/{id}/update_lead_stage` *(`received→quoted→negotiation→won|lost→follow_up`)* | Y | `200` | — |
| 29 | `ops.add_lead_activity.v1` | Vendor | `POST /operations/leads/{id}/activities` *(append child — §2.6)* | Y | `201` | — |
| 30 | `ops.get_lead.v1` | Vendor | `GET /operations/leads/{id}` | Y | `200` | **Vendor-Counterparty** *(vendor-controlling-org scope — structure §6)* |
| 31 | `ops.list_leads.v1` | Vendor | `GET /operations/leads` | Y | `200` | **Vendor-Counterparty** *(vendor-controlling-org scope — structure §6)* |

**Section count = 4** (§6 caller-facing).

### 2.5 Inventory — §7 Templates & Generated Documents (BC-OPS-4, 11) · §8 Finance Records (BC-OPS-5, 4)

| # | Doc-4F Contract-ID | Actor side | Method · Path | Active-Org | Success | Disclosure | § |
|---|---|---|---|---|---|---|---|
| 32 | `ops.create_template.v1` | Either | `POST /operations/templates` | Y | `201` | — | §7 |
| 33 | `ops.add_template_version.v1` | Either | `POST /operations/templates/{id}/versions` *(immutable version — Doc-2 §5.9; §2.6)* | Y | `201` | — | §7 |
| 34 | `ops.activate_template.v1` | Either | `POST /operations/templates/{id}/activate_template` *(`draft→active`)* | Y | `200` | — | §7 |
| 35 | `ops.archive_template.v1` | Either | `POST /operations/templates/{id}/archive_template` *(`active→archived`)* | Y | `200` | — | §7 |
| 36 | `ops.reactivate_template.v1` | Either | `POST /operations/templates/{id}/reactivate_template` *(`archived→active`)* | Y | `200` | — | §7 |
| 37 | `ops.grant_generated_document.v1` | Either | `POST /operations/generated_documents/{id}/grant_generated_document` *(doc-grant model — R9)* | Y | `200` | — | §7 |
| 38 | `ops.revoke_generated_document_grant.v1` | Either | `POST /operations/generated_documents/{id}/revoke_generated_document_grant` | Y | `200` | — | §7 |
| 39 | `ops.get_template.v1` | Either | `GET /operations/templates/{id}` | Y | `200` | **Buyer-Org-Private / Vendor-Counterparty** *(controlling-org scope, per owning side — structure §7)* | §7 |
| 40 | `ops.list_templates.v1` | Either | `GET /operations/templates` | Y | `200` | **Buyer-Org-Private / Vendor-Counterparty** *(controlling-org scope, per owning side — structure §7)* | §7 |
| 41 | `ops.get_generated_document.v1` | Either | `GET /operations/generated_documents/{id}` *(async status resource — `ASYNC_PENDING`/R9)* | Y | `200` | **Shared-Engagement** *(grant-scoped)* | §7 |
| 42 | `ops.list_generated_documents.v1` | Either | `GET /operations/generated_documents` | Y | `200` | **Shared-Engagement** *(grant-scoped)* | §7 |
| 43 | `ops.create_finance_record.v1` | Either | `POST /operations/finance_records` *(record only — R8)* | Y | `201` | — | §8 |
| 44 | `ops.update_finance_record.v1` | Either | `PATCH /operations/finance_records/{id}` *(no lifecycle)* | Y | `200` | — | §8 |
| 45 | `ops.get_finance_record.v1` | Either | `GET /operations/finance_records/{id}` | Y | `200` | **Buyer-Org-Private / Vendor-Counterparty** *(controlling-org scope, per owning side — structure §8)* | §8 |
| 46 | `ops.list_finance_records.v1` | Either | `GET /operations/finance_records` | Y | `200` | **Buyer-Org-Private / Vendor-Counterparty** *(controlling-org scope, per owning side — structure §8)* | §8 |

**Section count = §7(11) + §8(4) = 15.**

**Global reconciliation:** §4(14) + §5(13) + §6(4) + §7(11) + §8(4) = **46 caller-facing**; + §9 out-of-wire = 4 → **50** (= Doc-4F PassB inventory). No duplication.

### 2.6 Inventory Notes — method resolutions (frozen-sourced)
- **Methods (§5.2):** create → `POST` collection (`201`); state/domain command → `POST` named; partial update → `PATCH`; append child → `POST` sub-collection (`201`); read → `GET`. **Async doc-issue → `POST` `202`** (R9/Doc-5A §10).
- **`archive_private_vendor` / `archive_template` → state command, not soft-delete.** **Resolved-from authority: `Doc-4F §F4.3` (CRM state machine, `active→archived` edge) / `Doc-4F §F7` (template `active→archived` edge)** — `archive` is the `active → archived` state edge (Doc-2 §3.5/§5.9), realized `POST` named (not ADR-012 `DELETE`); `archived → active` exists only for templates (`reactivate_template`), not for private vendors (no edge added — §F4.3).
- **Append children (`add_private_vendor_note`, `add_lead_activity`, `add_template_version`) → `POST` sub-collection `201` [realization convention §0.4]** (Doc-5A §5.3 silent on nested resource addressing; a new immutable child row; `add_template_version` versions are never overwritten — Doc-2 §5.9).
- **`set_*` commands (`set_private_vendor_rating`, `set_buyer_vendor_status`, `set_vendor_favorite`) → `POST` named** — `buyer_vendor_status` is **append-only history** (R5, never evented); `set_private_vendor_rating` is an upsert (one per record); `set/clear_vendor_favorite` are child commands on `vendor_favorites` (Doc-4F §F4.6). Exact upsert-vs-append cardinality confirmed against Doc-4F `State Effects` in the §4 content pass.
- **Async (R9):** `issue_engagement_document` / `revise_engagement_document` → `202` (enqueue `generate_document` §9); **`get_generated_document` is the canonical Doc-5A §10 polling resource and source of truth** (R9 — returns `ASYNC_PENDING` while pending, never a fabricated outcome); `get_engagement_document` is the engagement-document request record (also returns `ASYNC_PENDING` as a body-state field while the job runs — not the Doc-5A §10 polling designation). The exact enqueue command mapping is bound to `Doc-4F §F7.3` by pointer.
- **Pagination:** All 6 list reads (`list_private_vendors`, `list_engagements`, `list_leads`, `list_templates`, `list_generated_documents`, `list_finance_records`) use cursor-based pagination only — no offset (`CHK-5A-070` [B]); page-size bound via `operations.list_page_size_max` POLICY key (pre-registered, Patch v1.4 — `CHK-5A-071` [M]).
- **Active-Org:** **every** M4 op carries the server-validated `Iv-Active-Organization` (§3.3) — no Public, no Admin.
- **Actor side (§3 binding rule):** the Buyer / Vendor / Either tags above are the Pass-1 assignment; each command's **definitive** actor side is declared in its §5.7 block (content pass) against Doc-4F; an undeclared/ambiguous actor side is a content-authoring blocker. **`Either` assignments carry confirm-risk** — `narrow-never-widen` means if a command is actually Buyer-only or Vendor-only, Pass-2 must narrow it with a frozen Doc-4F `State Effects` citation; Pass-2 authors must confirm every `Either` command against Doc-4F before accepting the assignment. The **symmetric** case also applies: where Pass-1 assigned a specific side (Buyer/Vendor) but Doc-4F documents `User (party)` scope for that command, Pass-2 may correct to Either with a per-command frozen-source citation — see §2 `[§2.6 exception]` and Pass-2 §5.4 for `issue_trade_invoice` / `record_payment` / `confirm_payment`.
- **Binds:** `Doc-5A §5.1/§5.2/§5.5/§5.7/§10`, §7.3; Doc-4F §F4.3/§F4.6/§F5/§F7.

---

## §3 — Cross-Cutting Two-Sided Actor, Context & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*

> §3 realizes the **mechanism** every §4–§8 endpoint depends on; it binds `Doc-5A §7.1–§7.6` + §6.3 by pointer and states the M4-specific application. **Instantiates no endpoint.** Section-form authority = the frozen `Doc-5C §3` / `Doc-5D §3` precedent ([realization convention]).

### 3.1 Authentication Carriage (§7.1)
- Every M4 caller carries the **`Authorization`** bearer — **authentication only** (credential/session mechanics out of scope — Identity, DF-1). **No public/anonymous surface.** Actor type is server-determined (§3.2).
- **Binds:** `Doc-5A §7.1`; `Doc-4A §5.1`.

### 3.2 Actor-Type & Two-Sided Determination (§7.2) — R2
- M4 has **one actor class — the tenant User** — but **two-sided**: **buyer-side** vs **vendor-side**, determined **server-side** by the active org's role relative to the resource (buyer org = `buyer_organization_id`; vendor side = `controlling_organization_id`); no field/header asserts actor type or side (`Doc-5A §7.2`; `Doc-4A §9.7`). **No Admin (21.6) surface** — the link-suggestion *decision* is Admin's (DF-5); Operations only *confirms* a link as a tenant write.
- **Binds:** `Doc-5A §7.2`; `Doc-4A §5.2`; Doc-4F §F4.

### 3.3 Active-Organization Context (§7.3) — R2
- Every operation executes within a **server-validated active organization** carried in **`Iv-Active-Organization`** (org `UUIDv7`) — a **context selector, never a trusted assertion**. **Validation authority is M1 Identity** (`check_permission` / `Doc-4C §C8`) — the server validates the principal's active membership before any business processing (CONTEXT category, §3.7; `Doc-5A §7.3`; `Doc-4A §5.3`). Records owned by the active org (Invariant 5).
- **Binds:** `Doc-5A §7.3`; `Doc-4A §5.3/§9.7`; `Doc-4C §C8`; Doc-4F §F4.

### 3.4 Authorization Realization (§7.5) — single root + §6B delegation
- Authorization is **server-side** — three-layer check (active Membership + Permission Slug + Resource Scope) **OR** a **§6B delegation grant** (a representative org acting for a vendor it does not control) — resolved via Identity **`check_permission`** (consumed; `Doc-5A §7.5`; `Doc-4A §6.1/§6B`). **`check_permission` is the sole authorization authority consumed by M4; no parallel or shadow authorization path is permitted** (`Doc-4A §5.3/§6`). Slugs (the ten `can_manage_*`/`can_approve_*`/`can_record_*`, Doc-4F B.4) are **never** wire inputs (`Doc-4A §6.2`); gaps carry `[ESC-OPS-SLUG]` by pointer (R4, never invented).
- **Binds:** `Doc-5A §7.5`; `Doc-4A §6.1/§6.2/§6B/§9.7`; `Doc-4C §C3` (consumed root); Doc-2 §7.

### 3.5 Non-Disclosure Firewall (§6.3) — R5 (load-bearing)
- **Private Exclusion Stays Private (Invariant #11):** `buyer_vendor_statuses` (Approved / Conditional / **Blacklisted**) and all buyer-private CRM facts (records, notes, ratings, favorites, link status) are **tenant-owned and never disclosed** to the vendor or any other tenant. A protected-fact-gated or cross-org read collapses to a uniform **`NOT_FOUND`** identical in status, body, and timing to genuinely-absent (no side-channel). **No status event is emitted** (R5/R10). The **only** sanctioned egress of CRM status is the **out-of-wire** internal-service `read_crm_status_for_routing` (§9), engineered so a blacklist/exclusion is **indistinguishable from a non-match** (`Doc-4A §7.5`; `Doc-2 §10.11`).
- **Per-read disclosure-scope rule (binding):** every read declares **exactly one** disclosure scope from the **Structure FROZEN §3 enumeration — `Buyer-Org-Private` / `Vendor-Counterparty` / `Shared-Engagement` / `Internal-Service`** (the four authoritative labels; no other label may be coined) — in its §5.7 block; scopes are **mutually exclusive**; **narrow-never-widen** (a later pass MAY narrow but MUST NEVER widen the §2 inventory scope); undeclared = content blocker. **`Vendor-Counterparty`** is the vendor-side controlling-org-private scope (the symmetric analog of `Buyer-Org-Private`; structure §6 "vendor-controlling-org scope"); for an org-owned read whose owner may be either side (templates §7, finance §8), the realized scope is `Buyer-Org-Private` **or** `Vendor-Counterparty` per the owning side (controlling-org scope — structure §7/§8). **Internal-Service** is out-of-wire (§9) only.
- **Per-command actor-side rule (binding, Structure FROZEN §3 M-01):** every command in §4–§8 declares **exactly one** actor side (Buyer / Vendor / Either) in its §5.7 block — undeclared or ambiguous actor side = content-authoring blocker. The two rules are **symmetric** (read disclosure ↔ write actor side); §4–§8 content must satisfy both.
- **Internal-Service fence:** Internal-Service consumers (specifically `read_crm_status_for_routing`, §9 out-of-wire — the highest-stakes non-disclosure application in this module) access the `operations/contracts/` service interface only — no direct table or cross-schema access is implied or permitted (`Doc-4A §5.3`).
- **Binds:** `Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §10.11`; Doc-4F §F4.

### 3.6 Money & Governance-Signal Firewalls as Wire Constraints (R8/R6)
- **Money boundary (R8 — records, not rails):** the platform never handles buyer↔vendor transaction money. `trade_invoices` / `payment_records` / `finance_records` are **bookkeeping records** — `issue_trade_invoice` / `update_trade_invoice_status` / `record_payment` / `confirm_payment` realize **document/record state transitions, never a funds-movement, escrow, settlement, or payment-gateway operation** (`operations.trade_invoices` ≠ `billing.platform_invoices`, DF-6). Flag-and-halt on any transfer surface.
- **Governance-signal firewall (R6):** Operations **stores no trust/performance/verification/tier signal** and **no matching/eligibility** — it **emits performance *inputs* only** to the M0 outbox (the Doc-2 §8 event set, by pointer; R10). **Buyer Vendor Status is the private per-buyer signal and never mutates a platform-wide score.**
- **Binds:** `Doc-5A §6.3`; `Doc-4A §4B`; `Doc-2 §8`; Doc-4F §F5; structure R6/R8.

### 3.7 Context Validation Position (§7.6)
- Carried context validated in the fixed **CONTEXT category** of the universal order (`Doc-5A §7.6`; `Doc-4A §11.2`, position 2) — before AUTHZ/SCOPE/STATE/REF/BUSINESS and any semantic processing; Doc-5F maps the failure to its §6 status and **MUST NOT** reorder/merge/short-circuit (disclosure control — R5).
- **Binds:** `Doc-5A §7.6`; `Doc-4A §11.2`.

---

*End of Doc-5F Content v1.0, Pass 1 (§0–§3). Document control (with the `reference_id` obligation + the pre-cleared `[ESC-OPS-POLICY]` gate via Patch v1.4), scope/surface-partition (section counts reconcile to 50), the 46-entry caller-facing inventory (strict §5.2 methods — creates `POST`/`201`, updates `PATCH`, state/domain commands `POST` named, append children `POST` sub-collection `[realization convention §0.4]`, async doc-issue `POST` `202`, reads `GET`; `archive` = state command not soft-delete, resolved from Doc-4F §F4.3/§F7; cursor pagination on all 6 list reads, `operations.list_page_size_max` pre-registered; disclosure-scope + actor-side columns normative/binding, exactly-one/mutually-exclusive/narrow-never-widen/never-broaden; both rules symmetric per Structure FROZEN §3 M-01), and the §3 cross-cutting two-sided-actor / context / non-disclosure wire model (mechanism only — `check_permission` sole authority + §6B delegation; R5 load-bearing non-disclosure with `NOT_FOUND` collapse; R8 money-boundary records-not-rails; R6 governance-signal firewall). No §5.7 instantiation, no §9 realization, no schemas, no Doc-4F rule restated; M4 carries a caller `202` (R9 async doc-gen); nothing coined. **⚠ BLOCKER-01 OPEN — see status header.** §4 (CRM), §5 (engagements) follow in Pass-2; §6 (leads), §7 (templates/docs), §8 (finance), §9 (out-of-wire), §10 (conformance) + Appendix A in Pass-3, each conforming to `Doc-5F_Structure_v1.0_FROZEN.md`.*
