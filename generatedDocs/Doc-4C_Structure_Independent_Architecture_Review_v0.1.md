# Doc-4C Structure — Independent Architecture Review v0.1

| Field | Value |
|---|---|
| Review ID | Doc-4C-Structure-Review-v0.1 |
| Document Under Review | `Doc-4C_Structure_Proposal_v0.1.md` — Identity & Organization (Module 1) |
| Review Type | Independent Architecture Structure Review — Phase-1 Freeze Readiness |
| Review Posture | Defect-finding only. Structure reviewed as it will be consumed by Claude Code, Cursor, backend engineers, QA engineers, AI coding agents. |
| Reviewer Role | Independent — not the document's author |
| Authoritative Corpus | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B_Content_v1.0_PassB.md (APPROVE WITH FREEZE PATCH) |
| Review Domains | 7 (Family Map Conformance, Module Boundary Integrity, Structure Completeness, Identity Governance, Cross-Module Dependency Integrity, AI-Agent Authoring Safety, Structure Freeze Readiness) |
| Severity Scale | BLOCKER / MAJOR / MINOR / NITPICK |
| Scope Constraint | Structure freeze readiness only. Do not evaluate feature completeness, content-pass requirements, or future capabilities. |

---

## §1 — Review Constraints (Binding)

This review operates under the following mandatory constraints:

- **You are NOT the author of this document.**
- **Do NOT propose new features. Do NOT invent entities. Do NOT invent permissions. Do NOT invent events. Do NOT invent workflows. Do NOT redesign architecture.**
- **Do not redesign architecture. Do not propose new modules. Do not propose new bounded contexts.**
- **Be ruthless, skeptical, and implementation-focused. Do not praise the document.**
- **Act as if this structure will be consumed by Claude Code to author production contracts and any ambiguity may become technical debt.**
- **RFQ Routing is the platform moat. Paid plans must never influence: Trust, Verification, Eligibility, Routing fairness, Matching confidence.**
- **Never bypass tenancy rules for convenience. Never recommend cross-tenant shortcuts.**
- **One Entity = One Owner. One Aggregate = One Root. One Business Truth = One Source.**

---

## §2 — Corpus Consulted

| Document | Version Consulted | Status |
|---|---|---|
| Master_System_Architecture_v1.0_FINAL.md | v1.0 FINAL | FROZEN |
| ADR_Compendium_v1.md | v1.0 | FROZEN |
| Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md | v1.0.3 (base v1.0.2 + Doc-2_Patch_v1.0.3) | FROZEN |
| Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md | v1.0.2 (base v1.0.1 + Doc-3_Patch_v1.0.2) | FROZEN |
| Doc-4A (all passes, patches, FreezeAudit) | v1.0 FROZEN | FROZEN |
| Doc-4B_Content_v1.0_PassB.md | v1.0 PassB | APPROVE WITH FREEZE PATCH (not yet frozen) |
| Doc-4B_PassA_Patch_v1.0.1.md | v1.0.1 | Integrated into PassB |
| Doc-4B_PassA_Consistency_Patch_v1.0.2.md | v1.0.2 | Integrated into PassB |
| Doc-4B_PassB_Hard_Review_v1.0.md | v1.0 | Output of prior independent review |

**Cross-reference used during review:** Doc-2 §3.2 (entity catalog), §5.1 (Organization state machine), §5.2 (Membership state machine), §5.10 (Delegation Grant state machine), §6 (Multi-Tenancy Mapping), §7 (Permission Mapping), §8 (Event Ownership Mapping), §9 (Audit Mapping), §10.2 (Database Blueprint — identity schema).

---

## §3 — Document Summary (for context only; not endorsement)

`Doc-4C_Structure_Proposal_v0.1.md` is the Phase-1 structure proposal for Module 1 (Identity & Organization). It defines the section map, template bindings, appendix structure, and open structural dependencies for the planned content passes. It contains no contracts, endpoints, or payloads. Key structural claims:

- 9 owned entities: `users`, `organizations`, `memberships`, `roles`, `permissions`, `role_permissions`, `organization_workflow_settings`, `buyer_profiles`, `delegation_grants`
- Template selections: 21.3 Query, 21.4 Command, 21.6 Admin, 21.2 Integration, 21.5 System
- 5 open structural dependencies (DC-1 through DC-5)
- 12 sections (§C0–§C12) + 4 Appendices (A–D)
- Claims conformance to: Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 FROZEN, **Doc-4B v1.0 (FROZEN)**
- Claims D-1 composition convention is "Board-APPROVED for Doc-4B; reused here"

---

## §4 — Verification Against Authoritative Corpus

The following claims in Doc-4C were verified against the corpus before the review was written.

### §4.1 — Entity Catalog Verification

Doc-4C §C1 lists 9 owned entities. Cross-referenced against Doc-2 §3.2 and §10.2:

| Doc-4C Claim | Doc-2 §3.2 Confirmation | Result |
|---|---|---|
| `users` | PLATFORM-OWNED ✓ | PASS |
| `organizations` | TENANT ROOT ✓ | PASS |
| `memberships` | TENANT-OWNED ✓ | PASS |
| `roles` | TENANT-OWNED ✓ | PASS |
| `permissions` | PLATFORM-OWNED ✓ | PASS |
| `role_permissions` | TENANT-OWNED ✓ | PASS |
| `organization_workflow_settings` | TENANT-OWNED ✓ | PASS |
| `buyer_profiles` | TENANT-OWNED ✓ | PASS |
| `delegation_grants` | SHARED (dual-party) ✓ | PASS |

**All 9 entities confirmed.** Count matches Doc-2 §3.2. No entity invented or claimed from another module.

### §4.2 — State Machine Binding Verification

| Doc-4C Claim | Doc-2 Source | Verification |
|---|---|---|
| Organization state machine: §5.1 | Doc-2 §5.1 confirmed: `active ⇄ suspended; soft_deleted; restore` | PASS |
| Membership state machine: §5.2 | Doc-2 §5.2 confirmed: `invited → pending → active; active ⇄ suspended; → removed terminal; invited → expire/revoke → removed` | PASS |
| Delegation Grant state machine: §5.10 | Doc-2 §5.10 confirmed: `draft → active; active ⇄ suspended; active\|suspended → revoked (terminal); active → expired (terminal)` | PASS |
| Organization cascade on soft-delete | Doc-2 §5.1 line 476 confirmed: memberships → soft-deleted; vendor profile → suspended; RFQs → archived; quotations → preserved | PASS |
| Delegation grant revocation teardown | Doc-2 §5.10 line 590 confirmed: removes derived `rfq_invitation_grantees` rows and visibility records | PASS |

**All state machine bindings correct.** No transition invented.

### §4.3 — Event Ownership Verification

Doc-4C §C12 claims: "Module 1 produces no domain events (Doc-2 §8 designates no `identity` emitter)."

Cross-referenced against Doc-2 §8 (Event Ownership Mapping, lines 651–674):

**Emitting modules listed in Doc-2 §8:** `rfq`, `marketplace`, `operations`, `trust`, `admin`, `billing`.

**`identity` is not listed as an emitting module.** The claim is correct.

Doc-2 §5 (state machine conventions, line 465): "transitions are service-mediated, emit audit records, and (where listed in §8) emit domain events." This confirms that identity state transitions produce audit records but no domain events — consistent with §C12.

### §4.4 — Governance Status Cross-Reference

| Doc-4C Claim | Authoritative Source | Actual Status | Match? |
|---|---|---|---|
| "Doc-4B v1.0 (FROZEN)" | Doc-4B_PassB_Hard_Review_v1.0.md | APPROVE WITH FREEZE PATCH | **NO** |
| "D-1 composition convention (Board-APPROVED for Doc-4B)" | Doc-4B PassB §B2 Governance Tracking | BOARD DECISION PENDING | **NO** |

**Two governance claims are factually incorrect.** Both will generate findings.

---

## §5 — Review Findings

### Domain 1 — Family Map Conformance

**Objective:** Verify Doc-4C is correctly positioned within the Doc-4A §1.3 family map and that its conformance chain is accurate.

**Analysis:**

Doc-4C §C0 correctly names itself as Module 1 — Identity & Organization. Doc-4A §1.3 maps Doc-4C = Identity & Organization (Module 1). Family map assignment is correct.

Precedence chain stated in §C0: Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C. This is the correct chain per project governance.

**FINDING C4C-M01 — MAJOR:**

**Location:** Doc-4C header table, line 9 (`Conforms To`) and Appendix D (`Version identifiers canonical`).

**Claim:** `"Doc-4B v1.0 (FROZEN — Platform Core / Shared Kernel)"`

**Actual Status:** Doc-4B received the decision **APPROVE WITH FREEZE PATCH** (Doc-4B_PassB_Hard_Review_v1.0.md). Required freeze patches (FP-01 through FP-03) have not yet been applied. Doc-4B is NOT frozen.

**Impact:** Doc-4C is declaring conformance to a frozen corpus document that does not yet exist. The freeze patches for Doc-4B include:
- **FP-01**: Clarification of the `admin_update_config_value.v1` formula-trigger mechanism — changes a contract that Doc-4C references by pointer (§C0, §C1, Appendix B).
- **FP-02**: Addition of Compliance-Basis fields to 2 Doc-4B contracts.
- **FP-03**: Correction of an idempotency note.

If these patches alter any Doc-4B service contract that Doc-4C references, the conformance pointer in Doc-4C will be stale from the moment Doc-4B is actually frozen. Pass-A authors who read Doc-4C's "FROZEN" claim will treat the current Pass-B content as authoritative, which it is not yet.

**Severity:** MAJOR. Does not block content authoring in isolation, but creates a false conformance baseline that propagates into Pass-A contracts.

**Required Patch SP-01:** Replace `"Doc-4B v1.0 (FROZEN — Platform Core / Shared Kernel)"` with `"Doc-4B v1.0 (APPROVE WITH FREEZE PATCH — freeze pending; this conformance claim must be updated to FROZEN upon Doc-4B freeze; no Doc-4B freeze patch is expected to alter Module 1 structure)"`. Also update the Appendix D version identifier accordingly.

---

**No other Family Map Conformance findings.**

Domain 1 Assessment: **1 MAJOR (C4C-M01). No blocker.**

---

### Domain 2 — Module Boundary Integrity

**Objective:** Verify that Doc-4C claims ownership of only the 9 Module 1 entities, correctly references (not claims) non-owned entities, and does not introduce cross-module ownership violations.

**Analysis:**

**Owned entities (§C1):** All 9 confirmed against Doc-2 §3.2. No Module 2–9 entity claimed.

**Not-owned, correctly referenced:**
- `vendor_profiles` → Module 2 (Marketplace) — referenced by pointer ✓
- `verification_records` → Module 5 / Trust — referenced by pointer ✓ (DC-2 flags the boundary explicitly)
- `subscriptions` / entitlements → Module 7 — referenced by pointer ✓
- `rfqs` / `quotations` → Modules 3/2 — referenced by pointer ✓
- `core.*` infrastructure → Module 0 / Doc-4B — consumed by pointer ✓

**Cross-module cascade (§C5, §C9):** Correctly flagged as integration dependencies (DC-1) with options presented, no unilateral decision made. The structure document does not invent cross-module writes.

**Tenancy classes:** All entities carry correct tenancy class from Doc-2 §6 per §C1 description. The `delegation_grants` shared-tenancy (dual-party) is correctly called out in §C9.

**One Entity = One Owner rule:** Not violated. No entity is dual-claimed.

Domain 2 Assessment: **No findings. CLEAN.**

---

### Domain 3 — Structure Completeness

**Objective:** Verify that the proposed section map covers all 9 Module 1 entities, all required cross-cutting declarations, and all appendices needed for Pass-A authoring.

**Analysis:**

| Section | Covers | Complete? |
|---|---|---|
| §C0 | Document control, precedence, conformance | Yes |
| §C1 | Module scope, 9 entities, authentication boundary | Yes |
| §C2 | Template binding, D-1, error namespace | Yes (with finding) |
| §C3 | Shared identity services (Get User, Get Org, Get Membership, Check Permission) | Yes (with finding) |
| §C4 | `users` entity contracts | Yes |
| §C5 | `organizations` entity contracts | Yes |
| §C6 | `memberships` entity contracts | Yes |
| §C7 | `roles`, `role_permissions`, `permissions` contracts | Yes |
| §C8 | Authorization + active-org context (Check Permission resolution) | Yes |
| §C9 | `delegation_grants` contracts | Yes |
| §C10 | `buyer_profiles` contracts | Yes |
| §C11 | `organization_workflow_settings` contracts | Yes |
| §C12 | Cross-cutting declarations (actor model, tenancy, audit, events, error namespace, firewall) | Yes |
| Appendix A | Contract inventory skeleton (authoring worklist) | Yes |
| Appendix B | Doc-4A + Doc-4B conformance binding map | Yes |
| Appendix C | Open structural dependencies (DC-1 through DC-5) | Yes |
| Appendix D | Cross-reference index | Yes |

All 9 entities have a dedicated section. No entity is missing. §C12 provides cross-cutting declarations. Appendix C correctly surfaces 5 structural dependencies (DC-1: cascade ownership MAJOR; DC-2: verification boundary MAJOR; DC-3: admin slugs carry-forward; DC-4: auth boundary NITPICK; DC-5: POLICY key registration MAJOR).

**Self-review table (lines 148–163):** All rows marked PASS. However, the self-review does not catch C4C-M01 (Doc-4B FROZEN status) or C4C-M02 (D-1 Board-APPROVED status). See Finding C4C-n01.

Domain 3 Assessment: **No BLOCKER, no MAJOR. Minor issues noted under Domains 4 and 6.**

---

### Domain 4 — Identity Governance

**Objective:** Verify that Doc-4C correctly governs the platform's identity and authorization model — D-1 composition convention status, template selections, permission slug handling, and authorization-model binding.

**Analysis:**

**Authorization model binding (§C8):** Correctly binds to Doc-4A §5/§6/§6B three-layer check. Does not redefine. ✓

**Permission slugs:** §C7 correctly states roles are bundles and authorization checks use slugs only (Doc-4A §6.2); the slug catalog is owned by Doc-2 §7 and is never extended by Doc-4C. ✓

**Authentication boundary (§C1, §C4, DC-4):** Correctly states Supabase Auth performs authentication only; Doc-4C owns the user identity record and post-authentication authorization context. ✓

**D-1 Composition Convention Status:**

**FINDING C4C-M02 — MAJOR:**

**Location:** §C2, line 38: `"the D-1 composition convention (Board-APPROVED for Doc-4B; reused here — 21.3/21.4 with Audience: internal-service, no new template)"`

**Claim:** D-1 is Board-APPROVED.

**Actual Status:** Cross-referenced against Doc-4B_Content_v1.0_PassB.md §B2 (Governance Tracking):

> D-1 — Template Composition Convention (internal-service calls): **BOARD DECISION PENDING** — "Not a freeze gate for Doc-4B; Doc-4B may proceed with D-1 convention, with understanding that a Board ruling to change it would require content rework."

D-1 has **never been resolved by the Board**. It is `BOARD DECISION PENDING` in every Doc-4B governance document (Pass-A, Patch v1.0.1, Pass-B). It was explicitly carried forward as unresolved.

**Impact:** Doc-4C §C2 propagates a false governance signal to Pass-A authors. Authors will use D-1 composition for internal services (most critically, Check Permission in §C3/§C8) under the belief that this convention is Board-approved, when it is not. If the Board subsequently rejects or modifies D-1 (e.g., requires a distinct Template 21.X for internal services, or prohibits non-recursion composition), all contracts authored under the false "Board-APPROVED" premise require rework.

This is a materially different risk posture from what Doc-4C declares. The Doc-4B precedent was explicitly set as "proceed at risk, Board ruling pending, rework accepted if overruled." Doc-4C must carry the same risk posture, not present it as resolved.

**Severity:** MAJOR. False governance citation. Propagates into Pass-A authoring decisions.

**Required Patch SP-02:** Replace `"Board-APPROVED for Doc-4B; reused here"` with `"BOARD DECISION PENDING (same unresolved status as Doc-4B D-1); reused at the same risk posture as Doc-4B — content-phase authors may use this convention with the understanding that a Board ruling to change it would require rework."` Add a cross-reference to Doc-4B §B2 D-1 entry.

---

**Template Selection — Template 21.2 Conditionality:**

**FINDING C4C-m02 — MINOR:**

**Location:** §C2 (line 38) and governing rule §3 (line 18): `"21.2 Integration (cross-module integrations Identity is the source of, per §4.4)"`

**Observation:** Template 21.2 (Integration) is listed as an applicable template without conditioning it on DC-1 (Board decision pending). The need for any Template 21.2 contracts authored by Module 1 is entirely dependent on DC-1 resolution:

- If DC-1 → service-call integrations (recommended path in Appendix C): Integration contracts may be authored using Template 21.2 for the outbound cascade calls.
- If DC-1 → Doc-2 §8 identity event addition: Integration contracts would use Template 21.2 for event-driven flows.
- If the Board resolves DC-1 in a way that assigns cascade responsibility to the target modules rather than Identity: Module 1 authors **zero Template 21.2 contracts** and the template listing is misleading.

§C12 correctly states `Events-Produced: none` as default and flags DC-1 as unresolved. But §C2 lists Template 21.2 as unconditionally applicable, creating an inconsistency within the structure document.

A Pass-A author reading §C2 first may attempt to scope 21.2 contracts before DC-1 is resolved, which is premature.

**Severity:** MINOR. DC-1 is already correctly flagged as MAJOR in Appendix C; the §C2 omission of conditionality is an internal consistency gap, not a structural defect.

**Required Patch SP-03:** Add to the Template 21.2 entry in §C2: `"(conditionally applicable — zero 21.2 contracts authored until DC-1 is resolved by the Board; see Appendix C DC-1)"`.

---

Domain 4 Assessment: **1 MAJOR (C4C-M02), 1 MINOR (C4C-m02). No blocker.**

---

### Domain 5 — Cross-Module Dependency Integrity

**Objective:** Verify that all cross-module dependencies are correctly identified, sourced to the authoritative corpus, and routed for decision rather than invented.

**Analysis:**

**DC-1 — Cross-module cascade (MAJOR):** Correctly identified. Sources (Doc-2 §5.1 cascade, Doc-2 §5.10 teardown) verified against corpus. Two options presented (service-call integration vs. Doc-2 §8 event addition). Decision deferred to Board. No cross-module write invented by Doc-4C. ✓

**DC-2 — Verification ownership (MAJOR):** Correctly identifies that `verification_records` are owned by Trust (Module 5). Correctly routes to Board: identity authors the trigger-side contract; Trust authors the verification contract. No ownership violation. ✓

**DC-3 — Admin slugs (CARRY FORWARD):** Correctly carries forward D-2 decision (`staff_super_admin` as interim; least-privilege slugs pending Doc-2 §7 patch). Consistent with Doc-4B handling. ✓

**DC-4 — Authentication boundary (NITPICK/clarification):** Correctly states Supabase Auth is infrastructure. Recorded to prevent content-phase authors from authoring auth-flow contracts in Doc-4C. ✓

**DC-5 — `identity.*` POLICY key registration (MAJOR):** Correctly mirrors Doc-4B PA-M3. Required keys identified (membership-invite expiry window §5.2, delegation-grant validity defaults §5.10, succession-reminder cadence §5.5, idempotency dedup windows). Correctly routed to Doc-3 §12.2 additive patch via the same channel as Doc-4B `core.*` keys. ✓

**Cross-module UUID reference discipline:** §C1 explicitly states what is not owned and must be referenced by UUID only. No cross-module foreign key implied. ✓

**No invented cross-module event, permission, or entity detected.** The document routes all dependency decisions to the Board without inventing workarounds — correct posture per Doc-4A §0.6.

Domain 5 Assessment: **No findings. All 5 dependencies correctly identified, sourced, and routed. CLEAN.**

---

### Domain 6 — AI-Agent Authoring Safety

**Objective:** Verify that the structure document is safe for consumption by Claude Code, Cursor, and AI coding agents as the basis for Pass-A contract authoring — that ambiguities will not produce contract defects.

**Analysis:**

**Section-to-template mapping:** Each section has a clear template assignment. §C2 provides the template selection table. §C3 states template 21.3 for shared identity services. §C4 states 21.3/21.4. §C5/§C6/§C7/§C9/§C10/§C11 each carry template identifiers. ✓

**State machine pointers:** All sections that cover stateful entities point to the exact Doc-2 subsection (§5.1, §5.2, §5.10). No ambiguity about which machine governs which entity. ✓

**Audit binding (§C12):** States that audit records use the Doc-4B `core.append_audit_record` mechanism, bound to Doc-2 §9 Organization domain. Clear. ✓

**Events posture (§C12):** `Events-Produced: none` as default. No invented events. Cascade flagged as DC-1. This is the correct posture and will not cause AI agents to invent events. ✓

**Firewall declaration (§C12):** States "identity contracts touch no governance signal (§4B), so the Firewall-Compliance Declaration is `none` unless a contract reads a signal via its owner." This is a conditionally qualified statement ("unless"). AI agents may apply the unconditional default and miss the exception case. However, Module 1 entities do not ordinarily read Trust Score, Performance Score, Financial Tier, or Capacity Profile — the exception is unlikely. Acceptable as-is.

**FINDING C4C-m01 — MINOR:**

**Location:** §C3, line 43–48.

**Observation:** §C3 describes four shared identity services — Get User, Get Organization, Get Membership, Check Permission — and states each uses "template (21.3)." §C2 states that internal services use the D-1 composition convention (21.3/21.4 with `Audience: internal-service`). However, §C3 does not identify *which* of the four services are public-facing (standard Template 21.3) vs. internal-service-only (Template 21.3 with D-1 composition / `Audience: internal-service`).

**Check Permission is almost certainly internal-service-only.** No external consumer (browser client, public API consumer) would call a raw permission-check endpoint; it is consumed by other modules' services during request authorization. A Pass-A author or AI agent reading §C3 who does not independently determine the audience distinction may author Check Permission as a standard 21.3 contract, omitting the D-1 `Audience: internal-service` designation. This would propagate a template-shape error into the Pass-A content — exactly the type of defect AI coding agents cannot self-correct.

**Severity:** MINOR. The §C2 D-1 binding is already noted; the gap is the missing per-service audience designation in §C3.

**Required Patch SP-04:** In §C3, for each of the four services, state the intended audience:
- Get User → public-facing (21.3 standard)
- Get Organization → public-facing (21.3 standard)
- Get Membership → public-facing (21.3 standard; or internal-only — to confirm)
- Check Permission → **internal-service** (21.3 with D-1 composition, `Audience: internal-service`)

Note: if D-1 remains BOARD DECISION PENDING (per C4C-M02 patch), the audience designation stands but must carry the same risk qualifier.

---

**Self-Review Table — AI-Safety Gap:**

**FINDING C4C-n01 — NITPICK:**

**Location:** Self-review table, lines 148–163.

**Observation:** The self-review marks all 13 criteria as PASS. Two governance status errors (C4C-M01, C4C-M02) are not caught by the self-review. Specifically, the criterion "No frozen document modified; Doc-4A standards and Doc-4B Platform Core responsibilities untouched" passes without noting that the Doc-4B "FROZEN" claim in the header is incorrect.

A self-review that declares all-PASS while containing two governance-citation errors provides false assurance to Pass-A authors who may rely on it without independent review.

**Severity:** NITPICK. The self-review did not cause the errors; it failed to catch them. The independent review catches them.

---

Domain 6 Assessment: **1 MINOR (C4C-m01), 1 NITPICK (C4C-n01). No blocker.**

---

### Domain 7 — Structure Freeze Readiness

**Objective:** Adjudicate whether the 5 open structural dependencies (DC-1 through DC-5) constitute freeze blockers or carry-forward items. Deliver the final freeze decision.

**Analysis:**

| Dependency | Severity in Doc-4C | Freeze Blocker? | Adjudication |
|---|---|---|---|
| **DC-1** — cascade without identity event | MAJOR | **NO** | Correctly identified; two options presented; no workaround invented; Board decision required but does not prevent structure freeze — it gates *content authoring of cascade integration contracts only*, not the overall structure. Structure freeze may proceed with DC-1 unresolved; Pass-A authoring of §C5/§C9 cascade contracts must hold until DC-1 is decided. |
| **DC-2** — verification ownership boundary | MAJOR | **NO** | Identity-side trigger vs. Trust-side verification contract is correctly split. Doc-4C correctly does not claim `verification_records`. The boundary decision is a clarification needed before §C5 verification-submission contracts are authored; does not block structure freeze. |
| **DC-3** — admin slugs | CARRY FORWARD | **NO** | Consistent with Board D-2 decision and Doc-4B precedent. `staff_super_admin` as interim is acceptable. No freeze gate. |
| **DC-4** — authentication boundary | NITPICK | **NO** | Informational recording only. |
| **DC-5** — `identity.*` POLICY key registration | MAJOR | **NO** | Mirrors Doc-4B PA-M3. Correctly routed to Doc-3 §12.2 additive patch. Keys must be registered before corresponding contracts are frozen, not before structure freeze. No structure freeze gate — same disposition as PA-M3 in Doc-4B. |

**Freeze gate findings (C4C-M01, C4C-M02):**

- **C4C-M01** (MAJOR — Doc-4B FROZEN claim): Does not block structure freeze. The error is a documentation-accuracy issue in the conformance header. Required patch SP-01 is a single-field update. Structure is otherwise sound.

- **C4C-M02** (MAJOR — D-1 Board-APPROVED claim): Does not block structure freeze per se, but the incorrect governance citation propagates a false signal into Pass-A authoring. Required patch SP-02 is a wording update. No structural redesign required.

**Recommendation:** Both MAJORs require patch before structure freeze is declared. Patches SP-01 through SP-04 are all documentation-level corrections. No section of the document requires redesign.

---

## §6 — Findings Summary

| ID | Severity | Domain | Location | Issue |
|---|---|---|---|---|
| **C4C-M01** | **MAJOR** | Family Map Conformance / Freeze Readiness | Header, Conforms To, line 9; Appendix D | Claims "Doc-4B v1.0 (FROZEN)" — Doc-4B is APPROVE WITH FREEZE PATCH, not yet frozen |
| **C4C-M02** | **MAJOR** | Identity Governance / AI-Agent Safety | §C2, line 38 | Claims D-1 composition convention is "Board-APPROVED for Doc-4B" — D-1 is BOARD DECISION PENDING in all Doc-4B governance documents |
| **C4C-m01** | MINOR | AI-Agent Authoring Safety | §C3, lines 43–48 | Does not distinguish public-facing vs. internal-service audience for shared identity services; Check Permission audience is unspecified, risking wrong template shape in Pass-A |
| **C4C-m02** | MINOR | Identity Governance / AI-Agent Safety | §C2, line 18 and line 38 | Template 21.2 listed as unconditionally applicable; should be conditioned on DC-1 Board resolution |
| **C4C-n01** | NITPICK | AI-Agent Authoring Safety | Self-review table, lines 148–163 | Self-review declares all-PASS without catching C4C-M01 or C4C-M02 |
| **C4C-n02** | NITPICK | Family Map Conformance | Appendix D, version identifiers | Cites "Doc-4B v1.0" without status qualifier; should note pending freeze patch |

**Finding count:** 0 BLOCKER | 2 MAJOR | 2 MINOR | 2 NITPICK

---

## §7 — Required Structure Patches

The following patches must be applied to `Doc-4C_Structure_Proposal_v0.1.md` before the structure may be declared frozen.

### SP-01 (resolves C4C-M01) — Correct Doc-4B Conformance Status

**Location:** Header Conforms To field, line 9; Appendix D version identifier line.

**Change:**

Replace:
```
Doc-4B v1.0 (FROZEN — Platform Core / Shared Kernel)
```

With:
```
Doc-4B v1.0 (APPROVE WITH FREEZE PATCH — freeze pending; update this field to FROZEN upon Doc-4B official freeze; no Doc-4B freeze patch is expected to alter Module 1 structure)
```

In Appendix D, update the Doc-4B version identifier similarly.

---

### SP-02 (resolves C4C-M02) — Correct D-1 Governance Status

**Location:** §C2, line 38.

**Change:**

Replace:
```
D-1 composition convention (Board-APPROVED for Doc-4B; reused here — 21.3/21.4 with Audience: internal-service, no new template)
```

With:
```
D-1 composition convention (BOARD DECISION PENDING — same unresolved status as Doc-4B D-1, per Doc-4B PassB §B2 Governance Tracking; reused here at the identical risk posture: content-phase authors may use this convention with the understanding that a Board ruling to change it requires rework; no new template invented)
```

---

### SP-03 (resolves C4C-m02) — Condition Template 21.2 on DC-1

**Location:** §C2, Template 21.2 entry; and governing rule §3 preamble (line 18).

**Change:**

To the 21.2 entry in §C2, append:
```
(conditionally applicable — no 21.2 contracts authored until DC-1 is resolved; see Appendix C DC-1)
```

In §3 governing rules, update the template list to read:
```
21.3 Query, 21.4 Command, 21.6 Admin, 21.2 Integration (conditional — DC-1), 21.5 System (where a Phase-2 worker applies)
```

---

### SP-04 (resolves C4C-m01) — Specify Audience for §C3 Services

**Location:** §C3, per-service description.

**Change:** For each of the four shared identity services, add an `Audience:` designation:

- **Get User:** `Audience: [to confirm at content pass — public-facing or internal]`
- **Get Organization:** `Audience: [to confirm at content pass — public-facing or internal]`
- **Get Membership:** `Audience: [to confirm at content pass — public-facing or internal]`
- **Check Permission:** `Audience: internal-service — Template 21.3 with D-1 composition (Audience: internal-service); not a public-facing contract`

---

## §8 — Freeze Gate Adjudication

| Gate Item | Type | Gate Status | Reasoning |
|---|---|---|---|
| C4C-M01 — Doc-4B status error | Documentation accuracy | **GATES FREEZE** | Requires SP-01 before freeze declaration |
| C4C-M02 — D-1 governance error | Governance citation | **GATES FREEZE** | Requires SP-02 before freeze declaration |
| C4C-m01 — §C3 audience unspecified | AI-agent safety | Does not gate freeze | SP-04 recommended before Pass-A authoring of §C3 contracts |
| C4C-m02 — Template 21.2 unconditional | Internal consistency | Does not gate freeze | SP-03 recommended before Pass-A authoring |
| DC-1 — cascade dependency | Structural dependency | Does not gate freeze | Gates Pass-A authoring of §C5/§C9 cascade contracts only |
| DC-2 — verification boundary | Structural dependency | Does not gate freeze | Gates §C5 verification-submission contracts only |
| DC-3 — admin slugs | Carry-forward | No gate | Board D-2 carry-forward |
| DC-4 — auth boundary | Clarification | No gate | Informational |
| DC-5 — POLICY key registration | Upstream dependency | Does not gate freeze | Gates corresponding contract freeze; mirrors Doc-4B PA-M3 |

**Structure Freeze is gated on SP-01 and SP-02 only.**

SP-03 and SP-04 are strongly recommended before Pass-A authoring commences, but do not technically prevent structure freeze.

---

## §9 — Final Decision

**APPROVE WITH STRUCTURE PATCH**

The structure of `Doc-4C_Structure_Proposal_v0.1.md` is architecturally sound:

- All 9 Module 1 entities are correctly identified, correctly owned, and correctly sourced to Doc-2 §3.2.
- All three state machine bindings (§5.1, §5.2, §5.10) are correct and verified against Doc-2.
- No entity, event, permission, transition, or workflow is invented.
- All cross-module dependencies are correctly identified and routed to the Board without workaround.
- The authorization model binding (Doc-4A §5/§6/§6B) is correct.
- The no-events posture is verified against Doc-2 §8.
- The authentication boundary is correctly drawn.

Two MAJORs (C4C-M01, C4C-M02) are factual errors in governance citations that do not require structural redesign. Both are correctable via single-field documentation patches (SP-01, SP-02).

**Can Doc-4C Structure be frozen and moved to Pass-A authoring?**

**NO — not in current form.**

**YES — after SP-01 and SP-02 are applied.**

SP-03 and SP-04 should be applied before Pass-A authoring of §C2 and §C3 contracts respectively to prevent downstream authoring errors. They are not formal freeze gates.

---

## §10 — Post-Freeze Advisory

The following items are not findings against the structure document but are recorded for the Board and for Pass-A authors.

**Advisory A:** DC-1 must be resolved by the Board before content-phase authoring of cascade integration contracts in §C5 (org soft-delete cascade) and §C9 (delegation grant revocation teardown). Attempting to author these contracts before DC-1 is resolved will produce incomplete or speculative contracts.

**Advisory B:** DC-5 (`identity.*` POLICY key registration) must be resolved via a Doc-3 §12.2 additive patch before any Doc-4C contract referencing an `identity.*` POLICY key can be frozen. The same mechanism used for the Doc-4B `core.*` PA-M3 resolution applies. Enumerate required keys at Pass-A authoring start.

**Advisory C:** D-1 remains BOARD DECISION PENDING across both Doc-4B and Doc-4C. The Board should resolve D-1 before Doc-4C content contracts using internal-service composition are frozen. A post-freeze D-1 ruling would require content rework across all D-1-composed contracts in both Doc-4B (if unfrozen) and Doc-4C.

**Advisory D:** Doc-4B must be officially frozen (freeze patches FP-01 through FP-03 applied) before Doc-4C Pass-A conformance can be updated to cite "Doc-4B v1.0 (FROZEN)." The SP-01 patch adds a placeholder; update it upon Doc-4B freeze.

---

*Doc-4C Structure Independent Architecture Review v0.1 — Findings: 0 BLOCKER, 2 MAJOR (C4C-M01, C4C-M02), 2 MINOR (C4C-m01, C4C-m02), 2 NITPICK (C4C-n01, C4C-n02). Decision: APPROVE WITH STRUCTURE PATCH. Freeze gated on SP-01 + SP-02. Post-freeze advisory items: DC-1 resolution before §C5/§C9 cascade contracts; DC-5 POLICY key registration before corresponding contract freeze; D-1 Board resolution before content-pass freeze; Doc-4B freeze update.*
