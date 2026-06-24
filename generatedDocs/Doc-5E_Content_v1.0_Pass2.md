# Doc-5E — RFQ Procurement Engine (M3 `rfq`) API Realization — Content v1.0, Pass 2 (§4–§7)

| Field | Value |
|---|---|
| Document | Doc-5E — RFQ Procurement Engine (Module 3) — API Realization |
| Pass | 2 of 3 — Sections §4, §5, §6, §7 (the 30 caller-facing endpoints) |
| Status | ACTIVE — Content Pass 2 of 3; §4–§7. Independent Hard Reviews applied: round-1 (MAJOR-01 freeze fence; MIN-01/02/03; NP-01/02); round-2 (m-01 concurrency token; m-02 §0.4 bases; m-03 first-open transition; NP-01 CONFLICT class; NP-02 two-phase note). 0 open BLOCKER/MAJOR/MINOR |
| Structure | Conforms to `Doc-5E_Structure_v1.0_FROZEN.md` |
| Realizes | The 30 caller-facing M3 endpoints on HTTP (method/path per §5.2/§5.3, state machine, idempotency/concurrency, error-status set, audit, non-disclosure) |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5E Content Pass-1 (§0–§3 + inventory; PATCH-01/02 applied) |
| Contains | The §5.7 realization of each caller-facing surface. No contract bodies, representations, error codes, POLICY keys, audit actions, or Doc-3 rules restated; the engine, internal legs, integrations, and events are §8 (Pass-3) |
| Audience | Architecture / API Governance Boards · Doc-5E authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4E fixed the contracts; Doc-3 owns the procurement logic (by pointer); Doc-4M owns the state machines; Doc-5A fixed the wire mechanics. §4–§7 realize the **wire face** per Doc-5A §5/§6/§7/§9 and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, and state edges are bound **by pointer, never restated**. The §3 cross-cutting model (authz/context/non-disclosure) governs every endpoint here. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9`; `Doc-4E §E4–§E8`; `Doc-4M`; `Doc-3` (by pointer); §3 (this document).

---

## §4 — RFQ Authoring & Lifecycle Surface Realization

### 4.1 Endpoint Realization (per §5.2/§5.3; inventory §2.2)
- Methods: `create_rfq` → `POST /rfq/rfqs` (`201`+`Location`); `update_rfq` → `PATCH /rfq/rfqs/{id}` (versioned edit, no state transition); `submit_rfq`/`approve_rfq`/`reject_internal_rfq`/`cancel_rfq` → `POST …/{command}` (state commands); `moderate_rfq` → `POST …/moderate_rfq` (Admin, no org context); `reissue_rfq` → `POST …/{id}/reissue_rfq` (§4.6); reads → `GET` (`get_rfq`, `list_rfqs` buyer-org-scoped, `get_rfq_version` nested).
- **[Realization convention §0.4] — `get_rfq_version` nested path (`/rfqs/{id}/versions/{version_id}`):** Doc-5A §5.3 is **silent on nested sub-resource addressing** (its three patterns are collection / item / command-action only). Per §0.4: the parent RFQ `{id}` is the structural scope anchor; `{version_id}` is the direct identifier of the version sub-item; no §5.3 pattern addresses a child item under a parent item. Contradicts nothing upstream.
- Inputs per §5.4: `{id}`=`UUIDv7` in path; Request-Contract fields in body; **no** prohibited input (actor/org-selection/authz/state/attribution never a field — `Doc-4A §9.7`). *Inventory realization ordering is non-authoritative.*
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4E §E4`.

### 4.2 RFQ State Machine (§5.4 — Doc-4M authoritative)
- The RFQ machine (`draft → [pending_internal_approval] → submitted → under_review → matching → vendors_notified → quotations_received → buyer_reviewing → shortlisted → closed_won | closed_lost`, plus patched `under_review → draft` moderation-reject, `matching → expired` coverage-exhausted, multi-source `→ expired`, `any active → cancelled`) is realized as **legal transitions only** — each caller transition is its named command; **no transition invented** (`Doc-4M`; `Doc-4A §13`). The downstream `matching → vendors_notified` / expiry edges are owned by **System workers (§8)**, observed via reads (no caller `202`). Illegal transition → `STATE` → `409`.
- `moderate_rfq` realizes the moderation gate + reject edge; the **moderation decision authority is Admin's** (DE-5) — RFQ reflects it. Version immutability once quoted and `estimated_value`-required-at-submission are `BUSINESS` guards bound by pointer (`Doc-4E §E4`; Doc-3 §1).
- **Binds:** `Doc-4M` (§5.4 + patched edges); `Doc-4A §13`; `Doc-4E §E4`.

### 4.3 Idempotency & Concurrency (§9)
- Every §4 command declares `Idempotency: required` → **`Idempotency-Key` mandatory** (`Doc-5A §9`); replay within the POLICY-keyed dedup window (`rfq.*` key, **`[ESC-RFQ-POLICY]`** — by name; **not finalized until registered in Doc-3 §12.2**) returns the cached original — same result, no duplicate audit record (`Doc-5A §9.7`). `update_rfq` (versioned edit) uses **optimistic concurrency** (`Concurrency: optimistic`) on domain token `expected_version_no` (`Doc-4E §E4.2`); the concurrency-precondition wire carriage (HTTP header vs body field) is owned by **Doc-5A §9** (to be authored in Pass-3); stale token → `CONFLICT` → `409`.
- **Binds:** `Doc-5A §9`; `Doc-4E §E4`; `[ESC-RFQ-POLICY]`.

### 4.4 Error-Status Set (§6)
- Classes map per **`Doc-5A §6.2`**; codes owned by the `Doc-4E §E4` error registers (`rfq_` namespace, `Doc-4A Appendix B.2`) — **by pointer, not restated**: `VALIDATION`→`400`, `AUTHORIZATION`→`403` (else `404` collapse, §4.5/R5), `NOT_FOUND`→`404`, `STATE`→`409` (illegal transition), `CONFLICT`→`409` (stale concurrency token — carriage per Doc-5A §9), `REFERENCE`→`422`, `BUSINESS`→`422` (Last-Owner-style guards, version immutability, `estimated_value` required). Clients branch on `error_class`/`error_code`, never status alone.
- **Binds:** `Doc-5A §6.2`; `Doc-4E §E4`.

### 4.5 Authorization, Non-Disclosure & Audit
- Buyer commands carry the server-validated `Iv-Active-Organization` (§3.3, buyer controlling org); `moderate_rfq` is **Admin, no org context** (`staff_can_moderate_rfq`, §3.5). Authorization server-side (§3.5); no slug a wire input.
- **Non-disclosure (R5):** `list_rfqs` is buyer-org-scoped — **no public board**; a non-entitled RFQ read collapses to `404` (§3.6).
- Mutations **audited** via Doc-4B `core.append_audit_record.v1` (`Doc-4E §E12`; Doc-2 §9 by pointer); the **moderation-reject** edge carries **`[ESC-RFQ-AUDIT]`** (nearest §9 action, never invented). Emitted events (`RFQCreated`/`RFQSubmitted`/`RFQApproved`) are §8 (outbox), not a wire field.
- **Binds:** `Doc-5A §6.3/§7`; `Doc-4E §E11/§E12`; Doc-2 §7/§9.

### 4.6 `reissue_rfq` Realization Convention (§0.4)
- `reissue_rfq` produces a **new RFQ aggregate** (with `reissued_from`) but is addressed as a **named command on the source RFQ** (`POST /rfq/rfqs/{id}/reissue_rfq`, `201`). `Doc-5A §5.2` maps create→`POST` collection but is **silent on create-via-source-command**; per §0.4 the named-command-on-source form is adopted for semantic clarity (the source `{id}` is intrinsic to the operation). *Alternative (`POST /rfq/rfqs` with `source_rfq_id` in body) considered and not adopted — historical only.* **The source RFQ remains unchanged — no state transition is applied to the source aggregate** (`reissued_from` is set on the new RFQ only); the new RFQ enters at `draft`.
- **Binds:** `Doc-5A §5.2/§5.5`, §0.4; `Doc-4E §E4.7`.

---

## §5 — Quotation & Invitation-Response Surface Realization

### 5.1 Endpoint Realization (§5.2/§5.3; inventory §2.3)
- `submit_quotation` → `POST /rfq/quotations` (`201`); `revise_quotation` → `PATCH /rfq/quotations/{id}` (new version, `submitted → submitted`, no state change); `withdraw_quotation` → `POST …/withdraw_quotation` (state); `request_late_extension` → `POST /rfq/rfqs/{id}/request_late_extension` (acts on the RFQ window); `respond_to_invitation` → `POST /rfq/rfq_invitations/{id}/respond_to_invitation` (accept / formal decline); reads → `GET` (`get_quotation`, `list_quotations_for_rfq` nested), `quotation_visibility`-gated.
- **[Realization convention §0.4] — `list_quotations_for_rfq` nested path (`/rfqs/{id}/quotations`):** Doc-5A §5.3 is **silent on nested sub-collection addressing**. Per §0.4: the RFQ `{id}` is the structural scope anchor for the quotation list; `quotation_visibility` gating makes the RFQ identity intrinsic to the query; no §5.3 pattern addresses a child collection scoped by a parent item. Contradicts nothing upstream.
- **`request_late_extension` two-phase design note (Doc-4E §E7.4):** Single endpoint, dual actor. **Phase 1 — Vendor request:** vendor invokes with `rfq_id`+`invitation_id`, `buyer_decision` null — records the request only; no window change. **Phase 2 — Buyer approval/denial:** RFQ-owning buyer invokes with `buyer_decision: approve|deny` — `approve` reopens the window for ALL un-responded invitees (no per-vendor private windows, Doc-3 §8.5 FIXED); synchronous response `window_state: enum<reopened|denied>`. **No separate `approve_late_extension` contract exists** — both phases use this endpoint.
- **Binds:** `Doc-5A §5.2/§5.3/§5.4`; `Doc-4E §E6/§E7`.

### 5.2 Quotation & Invitation Machines (§5.5 — Doc-4M)
- Quotation (`draft → submitted`; `submitted → submitted` revise/new-version; `→ withdrawn`/`→ selected`/`→ not_selected`/`→ expired`; `draft → discard`) and invitation (`delivered → accepted | declined | expired`) lifecycles realized as **legal transitions only** (`Doc-4M`; `Doc-4A §13`); illegal → `STATE` → `409`. `submit_quotation` also **owns `vendors_notified → quotations_received`** on the RFQ on the first quotation (same transaction, `Doc-4E §E7`). A formal **decline** is recorded on `rfq_invitations` (`declined`), **not** a quotation state. **One active quotation per vendor per RFQ** (partial unique index — `CONFLICT`; Doc-4E Part 4 H.4).
- **Binds:** `Doc-4M` (§5.5 + invitation); `Doc-4E §E6/§E7`; Doc-3 §8.

### 5.3 Representative Action & Three-Instrument Quota (R7)
- Vendor representative action resolves via §6B delegation **server-side in `check_permission`** (§3.4) — no wire input. `submit_quotation` **consumes the quotation-submission quota on the controlling org** per the **three-instrument accounting identity** (entitlement ≠ delivery ≠ quotation-quota; no single event consumes more than one — `Doc-3 §4.1.1`); the quota is **read** from Billing (DE-7) and consumed at submission, **never a ledger Doc-5E owns**. **Quota consumption is authoritative in Billing; RFQ consumes the capability but does not own the ledger** (DE-7). **Payment never influences matching** (firewall, R7). Vendor-house quotation conflicts surface inside the vendor org, **never to the buyer** (R5).
- **Binds:** `Doc-3 §4.1.1/§2.8`; `Doc-4A §4B`; DE-7 (read, §8); §3.4.

### 5.4 Idempotency, Concurrency, Error & Audit
- Mutations `Idempotency: required` (`Idempotency-Key`; `[ESC-RFQ-POLICY]` dedup window); `revise_quotation` uses optimistic concurrency on domain token `expected_version_no` (`Doc-4E §E7.2`); concurrency-precondition wire carriage owned by **Doc-5A §9** (to be authored). Error classes per `Doc-5A §6.2` (adding `STATE`→`409`); codes owned by `Doc-4E §E6/§E7` registers (`rfq_`). Audited via `core.append_audit_record.v1`; emitted events (`QuotationSubmitted`/`QuotationWithdrawn`) are §8. `respond_to_invitation` emits `InvitationAccepted`/`InvitationDeclined` audit (§8).
- **Binds:** `Doc-5A §6/§9`; `Doc-4E §E6/§E7/§E12`; `[ESC-RFQ-POLICY]`.

---

## §6 — Buyer Evaluation, Comparison & Closure Surface Realization

### 6.1 Endpoint Realization (§5.2/§5.3; inventory §2.4)
- `shortlist_quotation`, `manage_clarification`, `invoke_best_and_final`, `award_rfq` (→ `closed_won`), `close_lost_rfq` (→ `closed_lost`) → `POST /rfq/rfqs/{id}/{command}` (buyer state/domain commands); `get_comparison_statement` → `GET /rfq/rfqs/{id}/comparison_statement` (singleton segment, §2.5).
- **[Realization convention §0.4] — `get_comparison_statement` singleton path (`/rfqs/{id}/comparison_statement`):** Doc-5A §5.3 specifies `{resource-plural}` but is **silent on singleton sub-resources with no independent identity** (the comparison statement has no own `{id}` — it is scoped entirely by the parent RFQ; `version_no` is an optional query param, not a path identifier). Per §0.4: singular segment adopted for one-per-RFQ cardinality clarity; the RFQ `{id}` is the sole addressing anchor. Contradicts nothing upstream.
- **Binds:** `Doc-5A §5.2/§5.3`; `Doc-4E §E8`.

### 6.2 No-Auto-Decision (R6) & Comparison Read
- **The platform never auto-recommends or auto-selects a winner** (`Doc-3 §9.1` FIXED). The comparison statement is **decision support, never auto-decision** (generated by the §8 System worker `generate_comparison_statement`, read via `get_comparison_statement`); **award is an explicit buyer command** (`award_rfq`). No auto-award, auto-rank-to-winner, or recommendation endpoint exists or may be added (R6). **Comparison statement generation remains §8 engine work** (`generate_comparison_statement`, System); §6 realizes only the buyer command surface + the read. `award_rfq` guard: `selected_quotation_id` MUST be in the persisted shortlist set (`BUSINESS`, same-transaction check — `Doc-4E §E8.4`).
- **Binds:** `Doc-3 §9.1/§9.4`; `Doc-4E §E8`; R6.

### 6.3 Closure Machine & Out-of-Wire Hand-offs
- Closure edges (`shortlisted → closed_won`; selected `submitted → selected`, others `→ not_selected`; `shortlisted → closed_lost`) realized as legal transitions (`Doc-4M`). **Award → engagement hand-off is Operations-owned** (DE-4, via emitted `RFQClosedWon`, §8); **loss notification + the clarification/best-and-final thread channel are Communication-owned** (DE-6, emitted events only — §6 authors no notification/thread contract). Loss feedback is **banded, never exact** (R5; Doc-3 §9.5).
- **`get_comparison_statement` first-open state side effect (`Doc-4E §E8.6 §6`):** On the buyer's **first open**, if RFQ state = `quotations_received`, `get_comparison_statement` drives **`quotations_received → buyer_reviewing`** (Doc-2 §5.4) **synchronously within the same transaction as the read** (read + conditional state write committed atomically). Subsequent opens perform no transition (state-guarded idempotent). **No event emitted; no additional contract; no background job** — in-transaction side effect of this read only. The transition is audited via the lifecycle; the read itself is not audited (Doc-4A §17.1).
- **Binds:** `Doc-4M`; `Doc-4E §E8`; DE-4/DE-6 (§8); Doc-3 §9.4/§9.5.

### 6.4 Idempotency, Error & Audit
- Mutations `Idempotency: required` (`[ESC-RFQ-POLICY]` dedup); error per `Doc-5A §6.2` (codes `Doc-4E §E8`, `rfq_`); audited via `core.append_audit_record.v1` (RFQ "shortlist"/"close won/lost"; Quotation "select"/"reject"); clarification orchestration carries `[ESC-RFQ-AUDIT]` (nearest §9). Emitted `RFQClosedWon`/`RFQClosedLost`/`QuotationSelected` are §8.
- **Binds:** `Doc-5A §6/§9`; `Doc-4E §E8/§E12`.

---

## §7 — Routing Governance & Engine/Routing Reads Surface Realization

### 7.1 Endpoint Realization (§5.2/§5.3; inventory §2.4)
- `assist_routing` → `POST /rfq/rfqs/{id}/assist_routing` (Admin, Stage-gated); `manage_routing_rule` → §7.2; reads → `GET` (`get_matching_results` Admin caller leg → `…/rfqs/{id}/matching_results`; `get_routing_log` → `…/rfqs/{id}/routing_log`; `get_invitation` → `/rfq/rfq_invitations/{id}`; `list_invitations` → `…/rfqs/{id}/invitations` nested). Admin commands carry **no org context** (§3.3).
- **[Realization convention §0.4] — `list_invitations` nested path (`/rfqs/{id}/invitations`):** Doc-5A §5.3 is **silent on nested sub-collection addressing**. Per §0.4: the RFQ `{id}` is the structural scope anchor for the invitation list; grantee access is per-RFQ (bound by `rfq_invitation_grantees`), making the RFQ identity intrinsic to the query; no §5.3 pattern addresses a child collection scoped by a parent item. Contradicts nothing upstream.
- **Binds:** `Doc-5A §5.2/§5.3/§7`; `Doc-4E §E5/§E6`.

### 7.2 `manage_routing_rule` Per-Variant Realization (§0.4 / m-01)
- `Doc-4E §E6.6` declares **one contract** with `operation: enum<create | update | set_status>` and a nullable `rule_id` (null = create). `Doc-5A §5.2` is **silent on a multi-operation single contract**; per §0.4 the realization splits by operation **variant**:

  | Variant | Method · Path | Success |
  |---|---|---|
  | `create` (`rule_id` null) | `POST /rfq/routing_rules` | `201` (+`Location`) |
  | `update` / `set_status` (`rule_id` set) | `POST /rfq/routing_rules/{id}/manage_routing_rule` | `200` |

  Both are the same Doc-4E contract (`rfq.manage_routing_rule.v1`); the split is a transport-addressing disambiguation, **not** a new contract (count unchanged). No path collision — `manage_routing_rule` is the only `routing_rules` contract. `routing_rules` is platform-owned (Admin); `[ESC-RFQ-SLUG]` admin slug + `[ESC-RFQ-POLICY]` keys bound by pointer.
- **Freeze fence (MAJOR-01):** this realization **preserves the single Doc-4E contract**. The transport split introduces **no additional contract, permission, audit action, state machine, or authority** — only addressing differs. Contract count remains 38 (`CHK-5A-132`/§9 attestation).
- **Binds:** `Doc-5A §5.2/§5.5`, §0.4; `Doc-4E §E6.6`.

### 7.3 Observability Reads & Non-Disclosure (R5)
- `get_matching_results` (Admin caller leg; **internal-service leg is §8** — dual-path rule), `get_routing_log`, `get_invitation`, `list_invitations` realize read access to the engine's **derived/explainability** artifacts. **Non-disclosure applies equally to matching results, routing logs, counts, aggregates, and explanatory surfaces (§3.6)** — no gated-out/blacklisted/deferred vendor and no protected-fact reason is exposed; a non-entitled read collapses to `404`. The matching/routing **engine** these reads observe is §8 (out-of-wire). **Matching results are observational only and cannot be used to influence or bypass engine decisions** — reads expose derived artifacts, never a control surface (moat boundary). `assist_routing` operates within the **forbidden-actions wall** (Doc-3 §3.6) — annotates `rfq_routing_log`, may queue candidates that the pipeline **re-gates**, never bypasses a gate.
- **Binds:** `Doc-5A §6.3/§7`; `Doc-4E §E5/§E6`; `Doc-3 §3.6`; `Doc-2 §10.11`.

### 7.4 Idempotency, Error & Audit
- `assist_routing`/`manage_routing_rule` `Idempotency: required` (`[ESC-RFQ-POLICY]`); reads are safe `GET` (no idempotency/concurrency carriage). Error per `Doc-5A §6.2` (codes `Doc-4E §E5/§E6`, `rfq_`); `assist_routing` audited "routing run (+rationale)" with `[ESC-RFQ-AUDIT]`; `manage_routing_rule` audited as Platform "system_configuration change". Reads not audited (`Doc-4A §17.1`).
- **Binds:** `Doc-5A §6/§9`; `Doc-4E §E5/§E6/§E12`.

---

*End of Doc-5E Content v1.0, Pass 2 (§4–§7). The 30 caller-facing M3 endpoints realized per the §5.2 method mapping (creates `POST`/`201`, versioned edits `PATCH`, state/domain commands `POST` named, reads `GET`; `reissue_rfq` and `manage_routing_rule` per §0.4 conventions, the latter per-variant resolving m-01; nested sub-resource and singleton paths per §0.4 per §4.1/§5.1/§6.1/§7.1); state machines bound to Doc-4M (including `get_comparison_statement` first-open `quotations_received → buyer_reviewing` per §6.3); optimistic-concurrency wire carriage deferred to Doc-5A §9; idempotency/error/audit by pointer; the R5 non-disclosure invariant and R6 no-auto-decision realized; representations/codes/POLICY keys/audit actions/Doc-3 rules not restated; the engine, internal legs, integrations, and emitted events are §8. Nothing coined. §8 (out-of-wire) + §9 (conformance) + Appendix A follow in Pass-3, conforming to `Doc-5E_Structure_v1.0_FROZEN.md`.*
