# Doc-4D Content Pass-B Hard Review Report v1.0

**Documents Under Review:**
- `Doc-4D_Content_v1.0_PassB.md` (Master/Index)
- `Doc-4D_Content_v1.0_PassB_VendorProfile.md` (Part A)
- `Doc-4D_Content_v1.0_PassB_CatalogProductSpec.md` (Part B)
- `Doc-4D_Content_v1.0_PassB_ProfileExperience.md` (Part C)
- `Doc-4D_Content_v1.0_PassB_AdvertisingFavorites.md` (Part D)
- `Doc-4D_Content_v1.0_PassB_Discovery.md` (Part E)

**Review Objective:** Determine whether Doc-4D Content Pass-B is ready for Pass-B Approval or requires a Pass-B Patch
**Review Type:** Independent Architecture Hard Review — Production-Grade Scrutiny (11 Domains)
**Review Posture:** Defect hunting only. No feature expansion. No architecture redesign. No ownership reallocation. No module boundary changes.
**Corpus Precedence (Authoritative):** Architecture → ADRs → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B v1.0 → Doc-4C v1.0 → Doc-4D_Structure_v1.0_FROZEN → Doc-4D_Content_v1.0_PassA (as amended by Patch v1.0.1 — APPROVED)
**Reviewer:** Independent Architecture Board
**Date:** 2026-06-16

---

## Executive Summary

Doc-4D Content Pass-B presents a hardened, well-disciplined contract package for Module 2 (Marketplace & Discovery). Cross-cutting conventions (§B.1–§B.12) are correctly applied throughout all five Part files: no POLICY/Rate-Limit stages appear in any validation matrix (CHK-215 is not triggered); no entity, event, permission slug, audit action, POLICY key, or template is invented; DD-1 through DD-8 are correctly carried; the governance firewall (§B.11), single-authorship rule (§4.4), and `[ESC-MKT-AUDIT]` escalation pattern are uniformly applied; and all Pass-A-patched findings (M-01, m-01, m-02, N-01) are closed and correctly carried.

The review finds **one MAJOR defect** (M-01: microsite state machine edge `published → draft` invented in Part C, contradicting Doc-2 §3.3's `draft → published → unpublished` unidirectional machine) and **three MINOR defects** (m-01: `create_category.v1`/`update_category.v1` bound to the wrong Doc-2 §9 audit action; m-02: `assign_category.v1` response/state ambiguity on `proposed→active` transition; m-03: combined contract blocks suppress individual Pass-A Contract-IDs per §B.1 presentation requirement). Two NITPICK findings are also raised. No BLOCKER findings are identified.

**Pass-B Decision: APPROVE WITH PATCH REQUIRED — Pass-B Approval: NO (YES after Patch)**

---

## Findings Table

### MAJOR

---

**Finding ID:** M-01
**Severity:** MAJOR
**Affected Contract:** `marketplace.publish_microsite.v1` / `marketplace.unpublish_microsite.v1` (Part C, `publish_microsite.v1 · unpublish_microsite.v1` combined block)
**Corpus Citation:** Doc-2 §3.3 table (`microsites` state machine: `draft → published → unpublished` — strictly unidirectional forward edges only); Doc-4A §13 (Lifecycle Integrity: legal transitions must map precisely to corpus state machines; no edge may be invented or implied)
**Issue:** The Validation Matrix for `publish_microsite.v1` / `unpublish_microsite.v1` declares the state machine as `draft ↔ published → unpublished`. The `↔` bidirectional operator between `draft` and `published` implies a `published → draft` reverse edge. Doc-2 §3.3 declares the microsite state machine as `draft → published → unpublished` — strictly unidirectional. No `published → draft` edge exists in the corpus. The State Effects block propagates the same error: it states `Doc-2 §3.3 draft ↔ published → unpublished`, which is not the Doc-2 §3.3 state machine.

This notation appears in Part C at both the Validation Matrix stage declaration and the State Effects line for the combined `publish_microsite.v1 · unpublish_microsite.v1` block. It was not present in Pass-A (Pass-A described the lifecycle in prose as `publish` and `unpublish` without a state diagram literal) and is not covered by Patch v1.0.1.

**Risk:** An implementor reading this contract will implement a `published → draft` transition in the microsite state machine. That edge does not exist in Doc-2 §3.3. The production microsite schema would expose a transition path that the platform design does not sanction, creating a state-reachability defect: a published microsite could be silently rolled back to draft, bypassing any audit or re-publish gate. If the intent was "unpublish returns to draft rather than `unpublished`," that requires a Doc-2 §3.3 additive — not a Pass-B notation change.
**Recommended Resolution:** Correct the state machine notation in the Validation Matrix STATE stage and State Effects to the corpus-literal `draft → published → unpublished` (unidirectional). The unpublish command drives `published → unpublished`; the publish command drives `draft → published`. There is no `published → draft` edge in the corpus. If a `published → draft` edge is needed, it must be raised as a Doc-2 §3.3 additive through the proper channel — not authored in Pass-B.

---

### MINOR

---

**Finding ID:** m-01
**Severity:** MINOR
**Affected Contracts:** `marketplace.create_category.v1` (Part B), `marketplace.update_category.v1` (Part B)
**Corpus Citation:** Doc-2 §9 Admin audit action enumeration: "ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss" — `category approve/delete` is the sole category-domain Admin audit action; no `category create` or `category edit` action is enumerated. Doc-4A §17.2 (audit action must be the nearest confirmed Doc-2 §9 action; if no enumerated action exists, `[ESC-MKT-AUDIT]` must be carried with escalation marker)
**Issue:** Both `create_category.v1` and `update_category.v1` bind their Audit blocks to Doc-2 §9 Admin "category approve/delete." This is not correct:
- `create_category.v1` creates a category at `draft` status — it does not approve or delete a category. The `draft → active` (approve) transition is performed by `set_category_status.v1`, which correctly binds to "category approve/delete."
- `update_category.v1` edits name/slug attributes of an existing category — it also does not approve or delete.

Doc-2 §9 enumerates no "category create" or "category edit" Admin audit action. Binding `create_category.v1` and `update_category.v1` to "category approve/delete" is an incorrect audit-action attribution that will write misleading audit records: a `CREATE` action will be audited as "category approve/delete" and an `UPDATE` (rename/slug) will likewise be audited as "category approve/delete," making audit queries for approval decisions untrustworthy.

**Risk:** Audit records for category create and category edit will carry the audit action label "category approve/delete," polluting compliance queries that distinguish creation from approval. Forensic audit trails for category governance decisions (DD-4) will be corrupted. `set_category_status.v1` also uses this action — after the defect, the action will cover three distinct operations (create, edit, approve/retire), making it unfit for purpose as a governance audit signal.
**Recommended Resolution:** For `create_category.v1` and `update_category.v1`, replace the "category approve/delete" binding with `[ESC-MKT-AUDIT]` (Doc-2 §9 does not enumerate a "category create" or "category edit" action; nearest by pointer; channel Doc-2 §9 additive). `set_category_status.v1` already carries "category approve/delete" correctly for the `draft→active` (approve) and `active→retired` (delete/retire) transitions; do not change it.

---

**Finding ID:** m-02
**Severity:** MINOR
**Affected Contract:** `marketplace.assign_category.v1` (Part B)
**Corpus Citation:** Doc-2 §3.3 table (`category_assignments` state machine: `proposed → active → removed`); Doc-2 §10.3 (`category_assignments` schema: `status(proposed/active/removed)`); Doc-4A §12.3 (Response Contract must reflect actual post-command state)
**Issue:** The `assign_category.v1` Response Contract declares `status : enum(=proposed|active)` — implying the assignment may be created in either `proposed` or `active` state. The State Effects block declares `Doc-2 §3.3 proposed → active` — implying the full transition always completes within the command (lands at `active`). The two declarations are inconsistent:

- If the assignment always lands `active`, the Response `status` should be `enum(=active)` (deterministic, not conditional).
- If the assignment may land at `proposed` (e.g., pending some approval gate), then the State Effects `proposed → active` overstates the transition, and no governance condition for remaining at `proposed` is specified anywhere in the contract.

Doc-2 §3.3 defines the transition as `proposed → active → removed` without specifying an approval gate — suggesting the command drives the full `proposed → active` transition automatically (i.e., no separate approval step). If that is the intent, the response must be `enum(=active)`. If `proposed` is an intermediate rest state pending an unstated gate, that gate must be documented.

**Risk:** Implementation ambiguity: half of all engineers reading this will implement the assignment as always `active`; the other half will implement it as conditionally `proposed`. The resulting data state will be non-deterministic depending on which engineer writes the handler. If `proposed` is ever stored as the final state with no transition trigger, affected vendor profiles will be excluded from category-based discovery filtering indefinitely.
**Recommended Resolution:** Clarify the State Effects and Response Contract to be consistent. If the command always drives `proposed → active` (the likely intent given Doc-2 §3.3's lack of an approval gate), then: State Effects = `proposed → active` (as now), Response `status : enum(=active)` (deterministic). If a `proposed` rest state is intended, define the transition trigger and add it to the contract (or raise a DD for the missing governance rule).

---

**Finding ID:** m-03
**Severity:** MINOR
**Affected Contracts:** All combined contract blocks across Parts A–E (see Issue for enumeration)
**Corpus Citation:** `Doc-4D_Content_v1.0_PassB.md` §B.1 ("Each contract presents: Header (Contract-ID, Operation Title, Template, Actor); Authorization; Firewall; Request Contract; Response Contract; Validation Matrix; Error Register; State Effects; Idempotency; Audit; Events; Integration; Reference Validation; AI-Agent Notes"); Doc-4A §4.3 (each Contract-ID is a unique addressable unit of the integration surface); Doc-4D_Structure_v1.0_FROZEN (contract inventory identifies each contract individually by Contract-ID)
**Issue:** Pass-B groups multiple distinct Pass-A Contract-IDs into single hardened blocks in several places. The affected groupings:

- Part A: `create_vendor_profile.v1` is standalone (correct); all others appear to be individual — no cross-contract grouping here.
- Part B: `create_category.v1` and `update_category.v1` combined into one block. `update_category_assignment.v1` and `remove_category_assignment.v1` combined into one block. `create_product.v1` and `update_product.v1` combined. `create_spec_library_entry.v1` and `update_spec_library_entry.v1` combined. `add_spec_document.v1` and `supersede_spec_document.v1` combined.
- Part C: `create_microsite.v1` and `update_microsite.v1` combined. `publish_microsite.v1` and `unpublish_microsite.v1` combined. `update_profile_sections.v1`, `update_branding_assets.v1`, and `update_seo_settings.v1` combined. `publish_profile.v1` and `unpublish_profile.v1` combined. `create_custom_domain.v1`, `confirm_custom_domain_verification.v1`, `activate_custom_domain.v1`, and `release_custom_domain.v1` combined. `create_showcase_project.v1`, `update_showcase_project.v1`, and `publish_showcase_project.v1` combined.
- Part D: `get_advertisement.v1` and `list_advertisements.v1` combined. `add_catalog_favorite.v1` and `remove_catalog_favorite.v1` combined.
- Part E: `search_catalog.v1`, `list_vendor_directory.v1`, and `get_public_vendor_profile.v1` combined.

§B.1 states "Each contract presents: Header (Contract-ID…)." The grouped blocks present a joint Header identifying multiple Contract-IDs simultaneously without distinct per-contract sections, making it impossible to address a single contract's definition by Contract-ID — the fundamental unit of the integration surface per Doc-4A §4.3.

This is a **presentation conformance defect**, not a semantic one: the substantive hardening applied to combined blocks is correct and complete. However, the §B.1 requirement is that each Contract-ID be individually addressable with its own Header block.

**Risk:** An AI agent or engineer locating a specific Contract-ID (e.g., `create_custom_domain.v1`) will find it embedded in a 4-contract combined block. Per-contract governance lookups (rate-limit attribution, error class, state effects, idempotency key) cannot be cleanly isolated for code-generation or compliance review. Doc-4E and downstream modules consuming these contracts by Contract-ID will have no canonical single-contract reference.
**Recommended Resolution:** Split each combined block into per-Contract-ID sections, with individual Headers per §B.1. Where contracts share authorization, firewall, or validation matrix structure, cross-reference the sibling contract's shared block rather than re-duplicating — but each Contract-ID must have a distinct section beginning with its Header. For purely read/query operation pairs (e.g., `get` + `list`), a note that "the following two read operations share authorization and query semantics; per-Contract-ID error registers below" is acceptable, as long as each still opens with its own Header.

---

### NITPICK

---

**Finding ID:** N-01
**Severity:** NITPICK
**Affected Contracts:** `marketplace.sync_verified_financial_tier.v1` (Part A), `marketplace.reflect_verified_claim_status.v1` (Part A), `marketplace.reflect_vendor_ban.v1` (Part E)
**Corpus Citation:** Doc-4A §B.4 canonical validation order (SYNTAX→CONTEXT→AUTHZ→SCOPE→DELEGATION→STATE→REFERENCE→BUSINESS→POLICY; REFERENCE is stage 7); §B.4 note ("inapplicable stages omitted — never reordered")
**Issue:** The three 21.5 System contracts listed above omit the REFERENCE stage from their Validation Matrix declarations. All three perform `vendor_profile_id` existence checks, but those checks are declared in a separate "Reference Validation (§B.10)" block rather than in the Validation Matrix as a REFERENCE stage. The REFERENCE stage exists in the canonical nine-category order specifically to declare existence validation; omitting it from the matrix and relocating it to a downstream block departs from the canonical stage presentation for the contracts that use it.

The omission is consistent across all three System contracts and does not affect the substantive validation performed (the §B.10 block does declare the existence check). It is a presentation inconsistency against the canonical stage order, not a safety defect.

**Risk:** Minor: AI agents parsing validation matrices for REFERENCE-stage outputs (e.g., to confirm which contracts validate `vendor_profile_id` existence before state transitions) will not find the REFERENCE stage in the matrix for these three contracts. Low implementation risk given the §B.10 block redundancy.
**Recommended Resolution:** Add `REFERENCE (vendor_profile_id exists)` as a stage in the Validation Matrix for each of the three 21.5 System contracts, positioned between CONTEXT and STATE (or between CONTEXT and BUSINESS for those without STATE). The §B.10 block may remain as supplementary documentation. Alternatively, codify that 21.5 System contracts carry reference validation exclusively in §B.10 (not in the matrix) and document this as a System-contract exception in §B.4.

---

**Finding ID:** N-02
**Severity:** NITPICK
**Affected Contract:** `marketplace.create_category.v1` (Part B, AI-Agent Notes)
**Corpus Citation:** Doc-4D_Structure_v1.0_FROZEN §D13 (AI-Agent Implementation Safety); Doc-4A §20 (AI-agent notes must name the boundary)
**Issue:** The `create_category.v1` AI-Agent Notes state "do not couple category create to vendor assignment." This is correct guidance but under-specified: an AI agent could read this as meaning only "do not call `assign_category.v1` from within the `create_category.v1` command handler" — without understanding the broader DD-4 separation (category creation and approval is Admin governance; vendor category assignment is a separate controlling-org action). The note does not name the corpus sections bounding the separation.
**Risk:** Very low. The contract's Authorization block already enforces the boundary via slug and actor-type. The AI-Agent Notes omission cannot produce an unsafe implementation; it may only produce a less-informed one.
**Recommended Resolution:** Extend the note to: "do not couple category create to vendor assignment (DD-4 — category governance is platform-staff; category assignment is controlling-org via `assign_category.v1`; these are separate contracts with separate authorization chains)."

---

## Architecture Integrity Scorecard

| Domain | Rating | Basis |
|---|---|---|
| **Ownership Integrity** | PASS | All ~70 contracts correctly owned by Module 2; no cross-module entity authored; non-owned entities referenced by UUID only with explicit `DD-n` or service-validation notation; `financial_tier_history` exclusive-writer firewall enforced; `ban_actions` correctly flagged as Admin-owned (DD-3). |
| **Authority / DDD Integrity** | PASS | Marketplace bounded context respected throughout; no RFQ/procurement/matching logic authored (DD-2); `vendor_matching_attributes` correctly modeled as a projection; `TrustIndicators` as read-through (DD-1); no eligibility/ranking/selection logic present; no paid-plan gating of trust/matching signals (§4B/§B.11 firewall). |
| **Event Governance** | PASS | All emitted events corpus-confirmed against Doc-2 §8; all consumed events attributed to their authoring module; no events coined; N-01 (dual `VendorVerified` consumer) correctly resolved with independent-subscription notation (Part A + Part E); `VendorBanLifted` correctly not coined (DD-8); single-authorship (§4.4) enforced. |
| **Authorization Governance** | PASS | Three-layer check (active membership + permission slug + resource scope) + §6B delegation correctly applied; Admin 21.6 contracts use §5.6 (no active org context); `staff_can_ban` / `staff_can_manage_categories` / `staff_super_admin` all corpus-confirmed against Doc-2 §7; no shadow auth; no slug invented. |
| **Audit Governance** | CONCERN | M-01 (microsite state machine `↔` notation — not an audit finding) does not affect audit. However, m-01 binds `create_category.v1` and `update_category.v1` to the wrong Doc-2 §9 action ("category approve/delete" applied to create/edit operations). Audit records for these two contracts will carry an incorrect action label, corrupting category governance audit queries. Remaining audit bindings are correct; `[ESC-MKT-AUDIT]` correctly carried where §9 does not enumerate an action. |
| **Discovery Governance** | PASS | Non-disclosure invariant (§7.5) enforced; soft-deleted/retired/banned exclusion (§0.2) enforced across all discovery reads; public surfaces expose public-only projections; `TrustIndicators` surfaced as Trust read-model (DD-1); no private-CRM/Buyer-Vendor-Status facts exposed; published/unpublished state gates enforced. |
| **Validation Integrity** | PASS | Canonical nine-category order (§B.4) maintained throughout; no POLICY stages present — CHK-215/Rate-Limit blocks are not triggered; inapplicable stages correctly omitted (not reordered); N-01 notes a presentational REFERENCE-stage omission in three 21.5 System contracts (low risk, covered by §B.10 blocks). |
| **AI-Agent Safety** | CONCERN | M-01 microsite `↔` notation introduces an invented state edge that an AI code-generator will implement (`published → draft` path not in corpus). m-01 incorrect audit-action binding will produce incorrect AI-generated audit writes for category create/edit. m-03 combined blocks suppress per-Contract-ID addressability, reducing precision of AI-driven contract lookups. DD-8 placeholder (`reflect_vendor_ban_lift.v1`) correctly hardened with "DO NOT implement" guard. |

---

## Pass-B Decision

**APPROVE WITH PATCH REQUIRED**

### Pass-B Approval: NO

**Justification:** Doc-4D Content Pass-B demonstrates strong corpus compliance and correctly closes all Pass-A patch findings. The package is substantively correct in ownership, event governance, authorization, discovery governance, and validation ordering. No BLOCKER-severity defects are identified; the Rate-Limit/CHK-215 BLOCKER does not apply (no POLICY stages are present).

However, the package cannot be approved as-is due to M-01: the `draft ↔ published → unpublished` notation in `publish_microsite.v1` / `unpublish_microsite.v1` invents a `published → draft` edge that does not exist in Doc-2 §3.3. This is a state-machine correctness defect introduced in Pass-B (not present in Pass-A) that would cause an implementor to build a non-corpus transition path. Left unpatched, production code will expose an unauthorized microsite state rollback to `draft` — a lifecycle integrity violation.

The three MINOR findings (m-01, m-02, m-03) are correctable without structural change and must be resolved before implementation-grade approval. After patch, the package is approvable.

---

## Pass-B Patch Entry Conditions

The following must be satisfied before Pass-B is approved:

1. **[Required — M-01]** Correct the `publish_microsite.v1` / `unpublish_microsite.v1` Validation Matrix STATE declaration and State Effects to the corpus-literal `draft → published → unpublished` (unidirectional). Remove the `↔` bidirectional operator. The `publish` command drives `draft → published`; the `unpublish` command drives `published → unpublished`. No `published → draft` edge may be declared without a Doc-2 §3.3 additive.

2. **[Required — m-01]** Replace the Audit binding in `create_category.v1` and `update_category.v1` from "category approve/delete" to `[ESC-MKT-AUDIT]` with a Doc-2 §9 additive channel annotation. `set_category_status.v1` retains "category approve/delete" unchanged.

3. **[Required — m-02]** Reconcile `assign_category.v1` Response `status` and State Effects. If the command drives the full `proposed → active` transition automatically (consistent with Doc-2 §3.3 having no approval gate), set Response `status : enum(=active)`. If a `proposed` rest state is intended, declare the governance condition that keeps an assignment at `proposed` and specify the transition trigger.

4. **[Required — m-03]** Split all combined contract blocks into per-Contract-ID sections, each opening with its own Header per §B.1. Cross-references between sibling contracts with shared structure are permitted; individually addressable sections per Contract-ID are required.

5. **[Recommended — N-01]** Add a REFERENCE stage to the Validation Matrix of `sync_verified_financial_tier.v1`, `reflect_verified_claim_status.v1`, and `reflect_vendor_ban.v1`, or codify the System-contract REFERENCE-in-§B.10 exception in §B.4 as a named rule.

6. **[Recommended — N-02]** Extend the `create_category.v1` AI-Agent Notes to name the DD-4 corpus boundary for the category-create / vendor-assignment separation.

---

*End of Doc-4D Content Pass-B Hard Review Report v1.0.*
*Review scope: 11 domains — Pass-A Conformance, Contract Completeness, Ownership Integrity, DD Boundary Integrity, Discovery Boundary Integrity, Event Governance Integrity, Authorization Integrity, Audit Integrity, Validation Integrity, Error Governance Integrity, AI-Agent Safety.*
*All six Pass-B files read in full. Corpus searches confirmed: no Category 9 (POLICY) stages in any contract's validation matrix (CHK-215 / Rate-Limit BLOCKER not triggered). Doc-2 §3.3, §7, §8, §9; Doc-4A §4.3/§4.4/§B.4/§13/§17; Doc-4D_Structure_v1.0_FROZEN; Doc-4D_Content_v1.0_PassA (as amended); Doc-4D_PassA_Patch_v1.0.1; Doc-4D_PassA_Patch_Verification_Report_v1.0 — all consulted.*
