# Doc-4F_PassB_Part3_Hard_Review_v1.0
# Independent Architecture Board Hard Review — BC-OPS-3 Vendor Lead Pipeline

| Field | Value |
|---|---|
| Document Under Review | `Doc-4F_PassB_Part3_BC-OPS-3_Vendor_Lead_Pipeline_v1.0.md` |
| Review Pass | Pass-B Part 3 Hard Review |
| Review Date | 2026-06-18 |
| Reviewers | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor |
| Posture | Adversarial — assume defects exist; attempt to break the document |
| Authority | Frozen corpus only: Architecture v1.0, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F Structure FROZEN, Pass-A FROZEN, Parts 1–2 FROZEN |

---

## 1. Executive Verdict

**PASS WITH PATCH**

BC-OPS-3 is structurally sound. Aggregate boundary, ownership, event model, and non-disclosure invariant are correctly expressed. No BLOCKER-grade defect found. Two MAJOR defects requiring patch before freeze: (1) the `delivered-invitation precondition` check in §F6.1 Validation Matrix is mis-staged — placed at stage 8 BUSINESS but contains no actual business-rule check, creating a false no-op gate; (2) the §F6.3 `add_lead_activity` contract omits a stage-6 STATE check on the parent lead's current stage — an activity can be appended to a `won`/`lost` terminal lead without restriction, which may violate downstream semantics and is unaddressed. Four MINOR defects. No NITPICK suppressed.

---

## 2. Architecture Defects (AD)

---

### AD-01 · MAJOR

**Finding ID:** AD-01
**Severity:** MAJOR
**Location:** §F6.1 Validation Matrix, stage 8 BUSINESS row

**Issue:**
Stage 8 BUSINESS row reads:

> "`VendorInvited` fires only at invitation `delivered`; undelivered (`selected`/`deferred`) never create a lead — (guaranteed by the event; no local re-check beyond the event identity)"

The stage 8 row asserts no actual business-rule check is applied — it states the precondition is "guaranteed by the event." This is incorrect governance. Doc-4A §11.2 stage-8 BUSINESS exists precisely to enforce rules the system must validate locally; delegating the check entirely to the emitter violates the contract's own defensive posture and Doc-4A §11.2's requirement that each stage either applies its rule or is omitted. A stage row that declares "no local re-check" is a null check — it should be absent rather than stated as a non-check, because a null stage row creates a false implementation signal that stage 8 was considered and deliberately bypassed, when in fact no defensive rule runs.

Furthermore: the document records a `delivered-invitation precondition` as a stage-8 check with failure outcome `—`. A stage with failure outcome `—` is not a check — it is noise. Doc-4A §11.2: "Failure terminates at the first failing stage." A stage that cannot fail is not a validation stage.

**Governance Impact:**
Doc-4A §11.2 closed validation order. Stage rows with null failure outcomes violate the intent of the matrix as a defensive engineering artifact. AI agents implementing from this contract will see a stage-8 row and infer a check exists; the check is a no-op, creating ambiguity.

**Required Fix:**
Remove the stage-8 BUSINESS row from §F6.1 entirely and add a prose note: "Stage 8 BUSINESS: no local precondition check — the `VendorInvited` event is only produced by RFQ at invitation `delivered` (Doc-2 §8 / Doc-4E); the event identity dedup at stage 6 STATE is the sole local guard." Do not list a stage row with failure outcome `—`.

---

### AD-02 · MAJOR

**Finding ID:** AD-02
**Severity:** MAJOR
**Location:** §F6.3 Validation Matrix, stage 6 STATE (absent)

**Issue:**
`ops.add_lead_activity.v1` is an append-only write to `lead_activities`. The contract performs no stage-6 STATE check on the **parent lead's current stage**. The lead machine is `received → quoted → negotiation → won | lost → follow_up`. The stages `won` and `lost` are terminal-path stages (the machine has no explicit terminal designation in Doc-2 §3.5 beyond `follow_up` as a possible continuation). However, `follow_up` is also reachable. The contract permits activity logging at any lead stage including `won`/`lost`, with no corpus authority cited for this permissibility.

Doc-4A §11.2 stage 6 STATE applies to any write that may be conditioned on owning-aggregate state. The contract skips stage 6 entirely (only stages 1–5 SYNTAX/CONTEXT/AUTHZ/SCOPE/DELEGATION and stage 7 REFERENCE appear). The absence of a stage-6 STATE row for a command that writes to a child of a staged aggregate is a defect: either (a) the corpus permits activity append at any parent stage — in which case stage 6 must appear with `n/a — append permitted at all parent stages (Doc-2 §3.5 / §10.5)` and the authority cited, or (b) append is restricted to non-terminal stages — in which case the missing STATE check is a functional defect.

Neither option is resolved. The contract is silent.

**Governance Impact:**
Doc-4A §11.2 stage 6 STATE. Doc-2 §3.5/§10.5 append-only annotation does not address parent-stage restrictions; the contract must bind to the corpus or carry a FLAG-AND-HALT.

**Required Fix:**
Add a stage-6 STATE row to §F6.3 Validation Matrix: if Doc-2 §10.5 is silent on parent-stage restriction for `lead_activities` append, row must read: "Stage 6 STATE: parent lead stage — Doc-2 §10.5 `lead_activities` append-only; no parent-stage restriction stated in corpus; append permitted at all parent stages [FLAG-AND-HALT: Doc-2 §10.5 does not address parent-stage guard for append; if a restriction exists it must be added to Doc-2 §10.5 before freeze]." Do not silently omit stage 6.

---

## 3. Implementation Risks (IR)

---

### IR-01 · MINOR

**Finding ID:** IR-01
**Severity:** MINOR
**Location:** §F6.1 Validation Matrix, stage 2 CONTEXT row

**Issue:**
Stage 2 CONTEXT row for `ops.create_lead_on_invitation.v1` specifies failure outcome `AUTHORIZATION` for "actor is not System." Doc-4A §11.2 stage 2 is CONTEXT, not AUTHZ. For a System-actor consumer, stage 2 CONTEXT validates that the inbound call originates from the expected Phase-2 consumer mechanism (outbox delivery, Doc-4A §15.5) — the correct failure for a non-System actor reaching a Phase-2-only endpoint is `AUTHORIZATION` by §12 convention. This is consistent with the FROZEN Part-2 P-03 pattern. No corpus conflict — `AUTHORIZATION` at stage 2 for actor-type mismatch on a System-only contract is correct per Doc-4A §12.

**However:** the stage 2 row cites `Doc-4A §5.2/§15.5` as source authority. Doc-4A §5.2 enumerates actor types; §15.5 governs Phase-2 consumer attribution. The stage-2 CONTEXT check for a System consumer should be `§15.5` (Phase-2 delivery validation), not `§5.2` (actor-type enumeration — that is a §3 AUTHZ concern). The citation is partially wrong and will mislead implementers.

**Governance Impact:**
Doc-4A §11.2 stage-authority binding. Incorrect citation at stage 2 creates implementation ambiguity.

**Required Fix:**
Stage 2 CONTEXT row source authority: change `Doc-4A §5.2/§15.5` → `Doc-4A §15.5` (Phase-2 consumer origin). Move any `§5.2` actor-type check to stage 3 AUTHZ if a distinct actor-type check is needed, or remove the `§5.2` citation from stage 2 entirely.

---

### IR-02 · MINOR

**Finding ID:** IR-02
**Severity:** MINOR
**Location:** §F6.2 Validation Matrix, stage 6 STATE, concurrency row

**Issue:**
Two checks are placed in the same stage-6 STATE row:
1. Legal transition check (`target_stage` reachable from current)
2. Concurrency assertion check (`expected_stage` = current stage)

The matrix groups both under "6 STATE / concurrency." Doc-4A §11.2 stage 6 STATE covers state-machine enforcement; Doc-4A §14 covers concurrency / optimistic locking. These are distinct validation rules with distinct failure outcomes (`STATE` vs. `CONFLICT`). They belong in separate rows to ensure implementers apply them in the correct physical order and generate the correct error class per triggering condition.

The FROZEN Part-1 precedent (BC-OPS-1) maintained separate STATE and CONFLICT rows. Merging them under one row violates the precedent and creates ambiguity about order of evaluation (state-machine legality must be checked before the optimistic-lock assertion, since a stale assertion with an illegal target would produce the wrong error if evaluated in the wrong order).

**Governance Impact:**
Doc-4A §11.2/§14 row-order discipline. FROZEN Part-1 precedent.

**Required Fix:**
Split into two rows: (a) Stage 6 STATE: `target_stage` reachable per Doc-2 §3.5 machine → `STATE`. (b) Stage 6 CONCURRENCY (Doc-4A §14): `expected_stage` = current stage → `CONFLICT`. Physical order: transition legality check first, then concurrency assertion.

---

### IR-03 · MINOR

**Finding ID:** IR-03
**Severity:** MINOR
**Location:** §F6.4 Validation Matrix, stage 4 SCOPE row — `list_leads`

**Issue:**
Stage 4 SCOPE row for `ops.list_leads.v1` reads: "the target lead(s) belong to the active vendor controlling org." For a list/query contract, "target lead(s)" does not exist as a pre-scope reference — the RLS WHERE clause is the scope enforcement mechanism, not a row-level target check. The row conflates the RLS enforcement pattern (all rows filtered to caller's `controlling_organization_id`) with the per-row scope check that applies only to `get_lead` (single-row lookup).

For `list_leads`, stage 4 SCOPE should read: "query is scoped to the active org's `controlling_organization_id` via RLS (Doc-4A §7.3; Doc-2 §6); no cross-tenant row can appear in results" — failure: `NOT_FOUND` (no results, not `AUTHORIZATION`, consistent with H.9 collapse).

The current wording implies a per-row target check against a pre-identified set, which is not the correct list-query pattern.

**Governance Impact:**
Doc-4A §7.3/§7.5 disclosure boundary. Incorrect description could cause implementers to apply wrong filtering logic.

**Required Fix:**
Split the §F6.4 Validation Matrix into two sub-matrices (one for `get_lead`, one for `list_leads`) or annotate stage 4 SCOPE distinctly per contract: `get_lead` = per-row target check; `list_leads` = RLS WHERE clause scoped to active org's `controlling_organization_id`.

---

### IR-04 · MINOR

**Finding ID:** IR-04
**Severity:** MINOR
**Location:** §F6.1 §9 Error Register Note (idempotent no-op prose)

**Issue:**
The §F6.1 Error Register note reads:

> "No `CONFLICT` on the per-invitation uniqueness path: a replayed `VendorInvited` for an existing `invitation_id` is an **idempotent no-op** (dedup on event identity, Doc-4A §16.7), never `CONFLICT`"

This is correct. However, the note is placed in the Error Register section (§9) rather than in the Idempotency Rules section (§10), where it belongs as an idempotency specification. §9 governs failure outcomes; a no-op that produces no error is not an error-register entry. Placing a no-error behavioral specification in §9 creates the false impression that the Error Register is incomplete (reviewers scanning §9 for error coverage will not find the no-op documented there; it appears only as a parenthetical).

Additionally, the Validation Matrix stage-6 STATE row states "idempotent no-op (no error)" as the failure outcome for the duplicate `invitation_id` case. The correct failure outcome column value is `n/a — idempotent no-op` (no error class), not an unclassed string. The FROZEN Part-2 precedent used `—` for non-applicable failure outcomes.

**Governance Impact:**
Doc-4A §12/§14 section discipline. Misplaced idempotency specification creates review noise.

**Required Fix:**
Move the no-op specification to §F6.1 §10 Idempotency Rules (where it is already partially restated). In §9 Error Register, the note is redundant — remove it from §9. In the Validation Matrix stage-6 row, change failure outcome from `idempotent no-op (no error)` to `—` (no error, per FROZEN Part-2 precedent).

---

## 4. Regression Audit

| Check | Area | Status | Notes |
|---|---|---|---|
| Aggregate boundary: one aggregate (Vendor Lead = `vendor_leads` + `lead_activities`) | BC-OPS-3 ownership | PASS | Appendix A confirms; no foreign-aggregate mutation |
| No domain event emitted | Event governance | PASS | H.7 / Appendix A / Appendix B; Doc-2 §8 / Pass-A §F11 |
| `VendorInvited` consumed only at `delivered` | Non-disclosure | PASS | §F6.1 §8 / §12 AI notes; `selected`/`deferred` explicitly excluded |
| Lead created only once per `invitation_id` (idempotent) | Idempotency | PASS | §F6.1 §10 — dedup on event identity |
| Communication co-consumer independence | Single-authorship | PASS | H.7 / §F6.1 §8 / §F6.1 §11 — independently authored, no dependency |
| Lead machine verbatim: `received → quoted → negotiation → won\|lost → follow_up` | State machine | PASS | H.5 / §F6.2 §6; no invented stage |
| Non-disclosure: vendor cannot infer routing/competitor/ranking | Non-disclosure | PASS | H.9 / §F6.4 §9 Error Boundary; `rfq_id`/`invitation_id` bare UUIDs |
| `can_manage_leads` only slug; no slug invented | Authorization | PASS | H.3 / all contracts; `[ESC-OPS-SLUG]` correctly carried |
| RFQ/Marketplace owned by UUID reference only | Boundary | PASS | H.9 / H.10 / §F6.1 §11 |
| Every mutation carries `[ESC-OPS-AUDIT]` | Audit | PASS | H.6 / all mutation contracts |
| No `operations` POLICY keys invented; `[ESC-OPS-POLICY]` carried | Policy | PASS | H.8 / Appendix B |
| REFERENCE vs. DEPENDENCY kept distinct | Error model | PASS | H.4 / §F6.1 §9 |
| No actor type invented beyond Doc-4A §5.2 | Actor governance | PASS | Only `System` and `User` used |
| `won`/`lost` lead outcome ≠ RFQ award | Boundary / AI-agent | PASS | §F6.2 §12 AI notes explicitly state this |
| Validation matrix stages in physical §11.2 order | Stage discipline | PASS (with IR-02) | Stage-2 citation error (IR-01); merged STATE/CONCURRENCY row (IR-02) |
| Delegation eligible for `can_manage_leads` | Delegation | PASS | H.3 / §F6.2–§F6.4 §5 matrices |
| No Pass-A decision modified | Governance | PASS | §F6 contracts match Pass-A §F6 intent; Appendix A invariants confirmed |

---

## 5. AI-Agent Readiness

**Verdict: CONDITIONAL PASS** (resolve AD-01, AD-02 before agent implementation begins)

**Defects affecting agent behavior:**

- **AD-01 (null stage-8 BUSINESS row):** An agent implementing from the Validation Matrix will see a stage-8 row and implement a no-op guard that adds latency with no defensive value. Worse, agents may interpret the "guaranteed by the event" prose as a directive to trust the event without any local defensive pattern — creating a brittle consumer if event schema evolves. Remove the row.

- **AD-02 (missing STATE check for activity append):** An agent implementing `ops.add_lead_activity.v1` will permit activity logging on any parent lead stage, including edge cases that may be semantically invalid. The document provides no guidance. Without a stage-6 row (even if `n/a`), the agent has no corpus anchor for this decision.

**Items correctly expressed for agent consumption:**

- `won`/`lost` = vendor CRM outcome only, NOT RFQ award — explicitly stated in §F6.2 §12 AI notes. Critical for preventing agents from conflating lead pipeline with RFQ award decisions.
- Non-disclosure invariant expressed in §F6.4 §9 Error Boundary and §12 AI notes — agents will not resolve RFQ routing details through the lead surface.
- Idempotency on `invitation_id` clearly specified — agents will not create duplicate leads on replay.
- Communication co-consumer independence clearly stated — agents will not insert ordering dependency between BC-OPS-3 and Communication.
- `rfq_id`/`invitation_id`/`vendor_profile_id` as bare UUIDs with explicit "not a window into RFQ data" — prevents agents from treating the lead as a proxy for RFQ queries.

---

## 6. Final Assessment

| Severity | Count | Finding IDs |
|---|---|---|
| BLOCKER | 0 | — |
| MAJOR | 2 | AD-01, AD-02 |
| MINOR | 4 | IR-01, IR-02, IR-03, IR-04 |
| NITPICK | 0 | — |

---

## 7. Final Decision

**PASS WITH PATCH**

BC-OPS-3 passes Hard Review subject to patch. Aggregate boundary, event model, non-disclosure invariant, delegation model, error model (REFERENCE/DEPENDENCY separation), and carried escalation markers are correct. Two MAJOR findings (AD-01, AD-02) must be resolved before freeze. Four MINOR findings (IR-01–IR-04) must be resolved in the same patch pass. No BLOCKER; no corpus escalation required.

**BC-OPS-3 freeze is BLOCKED** pending patch application, patch verification, and freeze audit.

---

## 8. Next Recommended Artifact

`Doc-4F_PassB_Part3_Patch_v1.0` — Patch register for AD-01, AD-02, IR-01, IR-02, IR-03, IR-04 (6 patch actions P-01–P-06). After patch: `Doc-4F_PassB_Part3_Patch_Verification_v1.0` → `Doc-4F_PassB_Part3_Freeze_Audit_v1.0` → BC-OPS-3 FROZEN.

---

*End of Doc-4F_PassB_Part3_Hard_Review_v1.0. Produced by Architecture Board Hard Review under adversarial posture against frozen corpus only. No redesign performed; no corpus decisions modified. All findings cite frozen authority.*
