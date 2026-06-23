# Doc-4G Pass-A — Independent Architecture Board Hard Review
**Document ID:** Doc-4G_PassA_Independent_Hard_Review_v0.1
**Review Date:** 2026-06-18
**Status:** FINAL

| Field | Value |
|---|---|
| Document Under Review | `Doc-4G_PassA_Content_v1.0` — Module 5 Trust & Verification, Pass-A Contract Inventory |
| Structure Baseline | `Doc-4G_Structure_v1.0_FROZEN` (Structure Proposal v0.1 + Patch v0.1) |
| Module | Module 5 — Trust & Verification (`trust` schema, `trust_` namespace) |
| Reviewers | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · Principal Platform Architect · AI-Agent Governance Auditor |
| Authoritative Corpus | Architecture (FROZEN), ADR (FROZEN), Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4F v1.0 (all FROZEN), Doc-4G Structure v1.0 (FROZEN) |
| Review Posture | Defect-discovery only. Not a redesign exercise. Reviewed only against the authoritative corpus. |

---

## Executive Summary

**APPROVED WITH PATCH REQUIRED — 0 BLOCKER · 1 MAJOR · 2 MINOR · 1 NITPICK**

Doc-4G Pass-A is substantively well-formed. The contract inventory is complete across all five bounded contexts and all seven aggregates. The trust firewall is intact: scores are System-actor-only, auto-calculated, and Financial Tier/Buyer-Vendor-Status/paid plans are explicitly excluded from all score paths. The procurement moat is preserved: Trust publishes signals without making procurement decisions. The intra-module seams (BC-TRUST-2 read-only inputs, BC-TRUST-3 sole writer, BC-TRUST-5 ingestion-service invocation) are correctly and explicitly stated. Event ownership is correct; audit references are bound to Doc-2 §9 by pointer; POLICY keys are never coined. The dual Buyer-Feedback path (Path A Operations event / Path B published review) is properly distinguished.

One MAJOR defect requires a patch before Pass-B authoring proceeds: `can_submit_verification` is used throughout the document as a Doc-2 §7 slug but is not present in the §B.4 confirmed slug set, and no `[ESC-TRUST-SLUG]` is carried for it — creating an authorization-integrity inconsistency. Two MINOR defects complete the required patch scope: a dependency misassignment (DG-1 cited where DG-5 is correct) in one contract, and an unconfirmed staff permission reference (`staff_super_admin`) not covered by the slug escalation pattern. One NITPICK on event-emission chain attribution is noted.

---

## Architecture Defects

---

### F4G-PA-MA1

**Severity:** MAJOR

**Location:** §B.4 (cross-cutting authorization convention); `trust.request_verification.v1` §G4; §G11 (Authorization Surface consolidation); Appendix D (Permissions binding row)

**Issue:**

`can_submit_verification` is used in `trust.request_verification.v1` (Permission References), cited in §G11 as a confirmed Doc-2 §7 slug, and listed in Appendix D under the permissions binding row — but it is **not present in §B.4's confirmed Doc-2 §7 Trust slug set**. §B.4 states: "The Doc-2 §7 Trust slugs are `staff_can_verify` (Verification Admin), `staff_can_ban` (ban/fraud), `can_submit_review` (buyer post-award review; engagement required)." Three slugs are named. `can_submit_verification` is absent.

This creates a cross-document inconsistency with two possible interpretations:

- **Option A:** `can_submit_verification` is a confirmed Doc-2 §7 slug and §B.4 is simply incomplete (the slug was omitted from the enumeration). Correct action: add it to §B.4.
- **Option B:** `can_submit_verification` is not yet confirmed as a Doc-2 §7 slug. Correct action: carry `[ESC-TRUST-SLUG]` at `trust.request_verification.v1` and §G11.

Under neither option is the current state correct. The authorization pattern for tenant write actions requires that every permission slug either (a) appear in the §B.4 confirmed Doc-2 §7 set or (b) carry `[ESC-TRUST-SLUG]` with explicit escalation to the Doc-2 §7 additive channel. `can_submit_verification` currently satisfies neither condition.

**Governance Impact:**

Pass-B authors and AI coding agents implementing `trust.request_verification.v1` will implement the authorization check against `can_submit_verification`. If that slug does not exist in the Doc-2 §7 catalog, the implementation will reference a non-existent slug — an authorization gap. If it does exist, §B.4 is wrong and any future reviewer will flag it again. Either way, the inconsistency must be resolved before Pass-B instantiates the validation contract.

**Required Fix:**

Determine the correct option and apply one of:

- **Option A:** Add `can_submit_verification` (with its owner/role scope, per Doc-2 §7 format) to §B.4's confirmed Trust slug list. Remove any `[ESC-TRUST-SLUG]` candidate note if present. Confirm in §G11.
- **Option B:** Carry `[ESC-TRUST-SLUG]` at `trust.request_verification.v1` Permission References and §G11, annotated as "verification-submission tenant slug not separately enumerated in §7 — escalated to Doc-2 §7 additive channel." Update Appendix D to reflect the escalation.

One option only. No slug invented.

---

### F4G-PA-M1

**Severity:** MINOR

**Location:** `trust.set_admin_rating.v1` §G8 — Permission References

**Issue:**

`trust.set_admin_rating.v1` Permission References states: "Doc-2 §7 platform-staff (`staff_can_verify`/`staff_super_admin` per role seed); dedicated admin-rating slug → `[ESC-TRUST-SLUG]`."

`staff_super_admin` is not present in §B.4's confirmed Doc-2 §7 staff-slug set. §B.4 confirms two platform-staff slugs: `staff_can_verify` and `staff_can_ban`. `staff_super_admin` is neither listed nor confirmed against Doc-2 §7. The phrase "per role seed" suggests it may be a role-level seed assignment rather than a §7 authorization slug — but this is ambiguous. The document does carry `[ESC-TRUST-SLUG]` for a "dedicated admin-rating slug," but that marker is scoped to the hypothetical dedicated slug, not to `staff_super_admin` itself.

Under the §B.4 authorization convention, every named slug must be in the confirmed §7 set or individually carry `[ESC-TRUST-SLUG]`. `staff_super_admin` is currently unconfirmed and uncovered by the specific escalation marker.

**Governance Impact:**

Pass-B authors may implement an authorization check against `staff_super_admin`. If that slug is not in the Doc-2 §7 catalog, the implementation references a non-existent slug — an authorization gap at admin-rating mutation. Lower impact than F4G-PA-MA1 because admin ratings are internal-only and the `staff_can_verify` fallback provides partial coverage, but the unconfirmed slug reference is still a governance defect.

**Required Fix:**

Either (a) add `staff_super_admin` to §B.4's confirmed Doc-2 §7 staff-slug set (if it is a genuine §7 slug), or (b) extend the `[ESC-TRUST-SLUG]` carrier at `trust.set_admin_rating.v1` to explicitly cover `staff_super_admin` as an unconfirmed slug: "Doc-2 §7 platform-staff (`staff_can_verify`); `staff_super_admin` (per role seed) and dedicated admin-rating slug → `[ESC-TRUST-SLUG]` (neither confirmed in §7 — escalated to Doc-2 §7 additive channel)." No slug invented.

---

### F4G-PA-M2

**Severity:** MINOR

**Location:** `trust.assign_verification.v1` §G4 — Dependency References

**Issue:**

`trust.assign_verification.v1` Dependency References states: "DG-1 (staff identity, `verification_tasks` admin ref — Admin/Doc-4J relationship via §10.6 `verification_task_id`)."

This is a misassignment. DG-1 is the **Identity** boundary (Doc-4C — `organizations`/`memberships`/`check_permission`/`staff_*` slugs). The `verification_task_id` reference and the Admin task queue (`verification_tasks`) belong to the **Admin** module boundary, which is **DG-5** (Doc-4J). The parenthetical "Admin/Doc-4J relationship" correctly identifies the counterparty as Admin, but the DG marker cited (DG-1) is wrong — it points to Identity, not Admin.

**Governance Impact:**

AI coding agents and Pass-B authors reading the Dependency References for `trust.assign_verification.v1` will derive their cross-module service calls from the DG markers. DG-1 points to Identity; DG-5 points to Admin. An agent implementing `trust.assign_verification.v1` that follows DG-1 will look for the `verification_tasks` reference in Identity's service surface (Doc-4C) — it will not find it there. The admin task queue is Doc-4J territory. The misassignment will produce incorrect service wiring at Pass-B.

**Required Fix:**

In `trust.assign_verification.v1` Dependency References, split the DG reference: retain **DG-1** for staff identity resolution (`check_permission`, staff membership) and add **DG-5** for the `verification_task_id` / admin task queue reference (Admin/Doc-4J, §10.6). The corrected entry: "DG-1 (Identity — staff identity, `check_permission`, staff membership); DG-5 (Admin/Doc-4J — `verification_task_id` admin task queue reference, read — task queue is referenced, not owned); DG-8 (audit)."

---

## Implementation Risks

---

### F4G-PA-N1

**Severity:** NITPICK

**Location:** `trust.freeze_trust_score.v1`/`trust.reactivate_trust_score.v1` §G5 — Event References; `trust.freeze_performance_score.v1`/`trust.reactivate_performance_score.v1` §G6 — Event References; §G10 Event & Dependency Map

**Issue:**

`trust.freeze_trust_score.v1`/`trust.reactivate_trust_score.v1` states in Event References: "`TrustScoreUpdated` (Doc-2 §8) on freeze-state change (band publication suppressed while frozen) via outbox-write."

`trust.freeze_performance_score.v1`/`trust.reactivate_performance_score.v1` states: "`PerformanceFrozen` (Doc-2 §8 — `trust.performance_scores`) on freeze; `PerformanceScoreUpdated` on reactivation-driven change, via outbox-write."

The §G10 Event Map assigns:
- `TrustScoreUpdated` emitting contract: `trust.compute_trust_score.v1` / BC-TRUST-2
- `PerformanceScoreUpdated` emitting contract: `trust.compute_performance_score.v1` / BC-TRUST-3

The freeze/reactivate contracts thus claim to emit events whose canonical emitter, per §G10, is the compute contract. The intended mechanism is almost certainly: freeze/reactivate changes state → triggers recompute → compute contract emits the event. Claiming direct emission in the freeze/reactivate contract creates a minor ambiguity: which contract is the actual outbox-write call site for these events?

**Governance Impact:**

Low — the intent is clear from context. However a Pass-B author implementing `trust.freeze_trust_score.v1` may place an outbox-write for `TrustScoreUpdated` inside the freeze handler rather than ensuring the compute contract handles it, potentially creating two emission sites for the same event on a freeze+recompute cycle.

**Required Fix (optional at author's discretion, recommended):**

In the freeze/reactivate Event References, replace direct emission claims with a chain reference: "on freeze/reactivate state change, **triggers `trust.compute_trust_score.v1`** which emits `TrustScoreUpdated` (Doc-2 §8) — the compute contract is the outbox-write call site." For `PerformanceFrozen` specifically (emitted directly by the freeze contract), no change needed — that event's §G10 emitter is the freeze contract itself. Only `TrustScoreUpdated` and `PerformanceScoreUpdated` need the chain clarification.

---

## Domain Verdicts

| # | Domain | Verdict | Findings |
|---|---|---|---|
| 1 | Structure Conformance | PASS | — |
| 2 | Contract Inventory Completeness | PASS with F4G-PA-MA1 | F4G-PA-MA1 (authorization-slug inventory incomplete) |
| 3 | Aggregate Ownership Integrity | PASS | — |
| 4 | Trust Firewall Integrity | PASS | — |
| 5 | Procurement Moat Integrity | PASS | — |
| 6 | Permission Integrity | PASS with F4G-PA-MA1, F4G-PA-M1 | F4G-PA-MA1 (can_submit_verification unconfirmed); F4G-PA-M1 (staff_super_admin unconfirmed) |
| 7 | Event Integrity | PASS with F4G-PA-N1 | F4G-PA-N1 (freeze/reactivate emission-chain attribution) |
| 8 | Audit Integrity | PASS | — |
| 9 | Policy Integrity | PASS | — |
| 10 | Dependency Integrity | PASS with F4G-PA-M2 | F4G-PA-M2 (DG-1 cited; DG-5 required for admin task queue ref) |
| 11 | Command/Query Discipline | PASS | — |
| 12 | AI-Agent Determinism | PASS with F4G-PA-M2 | F4G-PA-M2 (wrong DG marker will misdirect agent service wiring) |
| 13 | Cross-Module Integrity | PASS with F4G-PA-M2 | F4G-PA-M2 |

---

## Final Verdict

| | |
|---|---|
| Open BLOCKER | 0 |
| Open MAJOR | 1 (F4G-PA-MA1) |
| Open MINOR | 2 (F4G-PA-M1, F4G-PA-M2) |
| Open NITPICK | 1 (F4G-PA-N1) |

**Review Decision:** APPROVED WITH PATCH REQUIRED

---

## Approval Question

**Can this document proceed directly to `Doc-4G_PassB_Authoring`?**

**NO**

**Justification:** F4G-PA-MA1 is a MAJOR authorization-integrity defect: `can_submit_verification` is used as a Doc-2 §7 slug across §B.4, `trust.request_verification.v1`, §G11, and Appendix D without being listed in the §B.4 confirmed slug set, and without the `[ESC-TRUST-SLUG]` escalation pattern. Pass-B authors will implement the authorization check for the tenant verification-submission path against this slug; if the slug is unconfirmed, the resulting implementation wires an authorization check against a non-existent permission entry. This must be resolved at Pass-A before Pass-B instantiates validation matrices and error codes against the authorization surface.

F4G-PA-M1 and F4G-PA-M2 are MINOR but are clean two-line fixes that should accompany the patch. F4G-PA-N1 is a NITPICK and is optional at the patch author's discretion.

Required patch scope before Pass-B:

- **F4G-PA-MA1 (required):** Resolve `can_submit_verification` — either add to §B.4 confirmed set (Option A) or carry `[ESC-TRUST-SLUG]` (Option B). One option only.
- **F4G-PA-M1 (required):** Resolve `staff_super_admin` in `trust.set_admin_rating.v1` — either confirm in §B.4 or extend `[ESC-TRUST-SLUG]` scope to cover it.
- **F4G-PA-M2 (required):** Correct `trust.assign_verification.v1` Dependency References — add DG-5 for the admin task queue reference; retain DG-1 only for staff identity.
- **F4G-PA-N1 (optional):** Clarify freeze/reactivate event-emission chain in §G5/§G6.

---

*End of Doc-4G_PassA_Independent_Hard_Review_v0.1. Review Decision: APPROVED WITH PATCH REQUIRED. 0 BLOCKER · 1 MAJOR · 2 MINOR · 1 NITPICK. Document may not proceed to Pass-B until the patch is applied and verified.*
