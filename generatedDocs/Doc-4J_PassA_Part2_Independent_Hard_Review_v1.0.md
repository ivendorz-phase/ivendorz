# Doc-4J_PassA_Part2_Independent_Hard_Review_v1.0 — Architecture Board Hard Review (Module 8 — Admin Operations — Pass-A Part 2)

| Field | Value |
|---|---|
| Document | Doc-4J_PassA_Part2_Independent_Hard_Review_v1.0 |
| Nature | **Independent Architecture Board Hard Review — Pass-A Content.** Defect Discovery Review. Not a Patch Review, Patch Verification, Freeze Audit, Architecture Redesign, or Structure Review. |
| Document Reviewed | `Doc-4J_PassA_Part2_Content_v1.0` |
| Part Scope | BC-ADM-4 Data Import · BC-ADM-5 Verification Workflow · BC-ADM-6 Vendor Outreach |
| Authority (precedence) | Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4I (FROZEN) · Doc-4J_Structure_FROZEN_v1.0 (FROZEN) · Doc-4J_PassA_Part1_Content_v1.0 · Doc-4J_PassA_Part2_Content_v1.0. Conflict rule: FLAG-AND-HALT. |
| Standing constraints | No slug invented · No structural change · No ownership change · No lifecycle change · No event invented · No redesign · No new BCs · No new aggregates · No reopening frozen decisions |

---

## Architecture Board Assessment

### Document Reviewed: `Doc-4J_PassA_Part2_Content_v1.0`

---

## Executive Verdict

```
BLOCKER   = 0
MAJOR     = 0
MINOR     = 1  (F4J-PA2-M1)
NITPICK   = 0

Status: PASS WITH PATCH
```

The document is structurally compliant, governance-sound, and well-authored at Pass-A depth across all three BCs. The brief-vs-frozen-lifecycle reconciliation is handled correctly and explicitly. The trust firewall is precisely maintained in BC-ADM-5 (VO DecisionRef pattern; decision stored via Trust service; Admin owns only the workflow task). The procurement moat is intact across all three BCs. The dependency surface correctly excludes the non-existent `DR-ADM-COMM` marker with an explicit rationale. Event governance is clean: all three Part-2 BCs produce no §8 event, stated definitively. The `[ESC-ADM-SLUG]` and `[ESC-ADM-AUDIT]` marker usage is appropriate and corpus-grounded for BC-ADM-4 and BC-ADM-6.

One MINOR finding (F4J-PA2-M1): the three BC-ADM-5 per-contract records (`queue_verification_task.v1`, `assign_verification_task.v1`, `decide_verification_task.v1`) present dual audit options — "§9 Admin by pointer / `[ESC-ADM-AUDIT]`" — rather than a single definitive binding. Additionally, `queue_verification_task.v1` specifically names "suggestion decisions" as the "nearest domain" §9 pointer, which is not a sound anchor for a verification-task workflow action. The J-A5 consolidation table resolves correctly to `[ESC-ADM-AUDIT]` as the single binding, but it is inconsistent with the three per-contract records. This is the same structural defect as F4J-PA1-N1 (resolved in Part 1 patch) and requires the same fix: remove the dual-option and the stretch-pointer from all three BC-ADM-5 contract records.

---

## What Was Done Well

**Brief-vs-frozen reconciliation.** The opening preamble explicitly records four reconciliation decisions: Import Job `queued → processing → completed / failed` (not `queued → running → ...`), Verification Task `queued → in_review → decided` (not `pending → approved → rejected`), Outreach Campaign `draft → running → completed` (not `draft → active → completed/cancelled`), and `DR-ADM-COMM` not used (not in the frozen structure). Each reconciliation states which authority governs. The J-A9 AI-agent notes explicitly forbid the discarded state names ("No state invented; no `cancelled`/`pending`/`running`(import)/`active`(outreach) state exists"). This is disciplined authorship.

**Trust firewall precision (BC-ADM-5).** The "Admin decides workflow; Trust stores the decision" seam is the most critical governance boundary in Part 2. It is stated in five locations: J5A-1 overview, J5A-2 aggregate definition, `decide_verification_task.v1`, J-A7, and J-A9. The VO DecisionRef (`verification_record_id`) is correctly identified as a pointer, not an ownership claim. "The approve/reject decision content lives in `trust.verification_decisions` (Trust-owned)" is stated in the aggregate definition itself — the correct structural location. No verification-record ownership, no score, no governance/performance/trust score leaked into Admin.

**Import seeding discipline (BC-ADM-4).** "Imports via the owning modules' services; creates no Marketplace entity directly." The service-mediated write is stated in the overview (J4A-1), the contract record (`process_import_job.v1`), and the J-A7 dependency surface. The pattern is consistent with the "Admin decides; the owning module stores" principle established in Part 1.

**`DR-ADM-COMM` handling.** The non-existent dependency marker is dismissed in four locations (preamble reconciliation, J6A-1 overview, J-A7, Appendix B) with the explicit corpus basis: the frozen structure enumerates no such marker. The correct response (not used; frozen markers only) is applied exactly.

**BC-ADM-6 audit consistency.** All BC-ADM-6 mutations carry `[ESC-ADM-AUDIT]` with consistent wording and no dual-option — a single definitive binding from per-contract record through J-A5.

**Event governance.** J-A6 is definitive: "Produced: NONE." The distinction between the §8 event domain and the Trust verification-request service signal (which feeds the verification queue but is not a §8 event) is correctly drawn: "The verification queue may be fed by a Trust verification-request service signal (DR-ADM-TRUST), not a §8 event." No event coined. `[ESC-ADM-EVENT]` correctly reserved.

**Error model cross-module distinction.** J-A8 correctly distinguishes `REFERENCE` (definitive negative — the `verification_record_id` at Trust is not found) from `DEPENDENCY` (transient — the Trust service is unavailable). This is a non-trivial distinction that is easy to conflate and is correctly stated at Pass-A level.

**B-section pointer pattern.** Part 2 correctly inherits the §B cross-cutting conventions from Part 1 by pointer, without restating them. This is the correct multi-part authoring pattern. ✓

---

## Findings

### BLOCKER
None.

### MAJOR
None.

### MINOR

#### F4J-PA2-M1 (MINOR)

**Section:** J5A-3 — Contract Inventory (BC-ADM-5): `admin.queue_verification_task.v1`, `admin.assign_verification_task.v1`, `admin.decide_verification_task.v1`

**Finding:** All three BC-ADM-5 contracts present a dual audit binding rather than a single definitive one:

- `queue_verification_task.v1`: "§9 Admin ('suggestion decisions' nearest domain) by pointer / **`[ESC-ADM-AUDIT]`** if verification-task workflow is not separately enumerated in §9."
- `assign_verification_task.v1`: "§9 Admin by pointer / `[ESC-ADM-AUDIT]` (as above; no action invented)."
- `decide_verification_task.v1`: "§9 Admin by pointer / `[ESC-ADM-AUDIT]` (no action invented)."

The J-A5 consolidation table correctly resolves to `[ESC-ADM-AUDIT]` as the single binding ("verification-task workflow not separately §9-enumerated; nearest by pointer; no action invented"). But the three per-contract records are inconsistent with J-A5 — they leave the binding as a binary choice.

There is an additional defect in `queue_verification_task.v1` specifically: it names "suggestion decisions" as the "nearest domain" §9 pointer. The Doc-2 §9 Admin domain "suggestion decisions" covers the suggestion approval/rejection/triage workflow (BC-ADM-3 Suggestions). A verification-task queue event is categorically distinct from a suggestion decision. If a Pass-B author or AI-agent selects the "§9 by pointer" option and anchors to "suggestion decisions," they will apply an incorrect audit action to the verification-task workflow. This stretch-pointer is not a sound anchor and must be removed.

This is the same structural defect as F4J-PA1-N1 (`expire_ban.v1` audit dual-option with a stretch-pointer to "ban issue/lift") — the pattern that was accepted and resolved in the Part 1 patch. The J-A5 consolidation has already made the correct decision; the per-contract records must be brought into alignment.

**Impact:** Three BC-ADM-5 contracts are ambiguous as to their audit binding. A Pass-B author or AI-agent must decide between two options — one of which ("suggestion decisions" pointer) is factually inapplicable to verification-task workflow. The dual-option forces an audit-governance decision onto the implementor that Pass-A should have resolved. If "suggestion decisions" is selected, the verification-task audit trail will be bound to the wrong §9 action.

**Required action:** In all three BC-ADM-5 per-contract records, replace the dual-option audit wording with the single definitive binding that J-A5 already states:

- Remove the "§9 Admin ('suggestion decisions' nearest domain) by pointer / `[ESC-ADM-AUDIT]` if..." pattern.
- Replace with: **`[ESC-ADM-AUDIT]`** (Doc-2 §9 Admin does not separately enumerate verification-task workflow; nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented).
- Apply consistently to all three contracts: `queue_verification_task.v1`, `assign_verification_task.v1`, `decide_verification_task.v1`.
- J-A5 requires no change (it already states the correct single binding).

Wording only; no structural change, no new audit action, no ownership change.

---

### NITPICK
None.

---

## Governance Assessment

### Structure Compliance — PASS
BC-ADM-4/5/6 all present in correct BCs with correct aggregates. Dependency placement (DR-ADM-1/MKT/TRUST/PC for Part 2; DR-ADM-RFQ/OPS correctly absent; `DR-ADM-COMM` correctly non-existent and unused) is exact. Authorization surface matches §J12 frozen structure (post-patch). No structure drift.

### Ownership Integrity — PASS
`import_jobs`+`import_rows` → BC-ADM-4; `verification_tasks` → BC-ADM-5; `outreach_campaigns`+`outreach_contacts` → BC-ADM-6. All cross-module entities (seeded Marketplace entities, Trust verification records/decisions, Marketplace outreach targets) referenced by UUID only, never owned. Write-via-service discipline: import seeds via Marketplace service; verification decision via Trust service; outreach writes Admin records only. No ownership leakage.

### Authorization Integrity — PASS
Doc-2 §7 sole authority. `staff_can_verify` (BC-ADM-5, named §7 slug). `[ESC-ADM-SLUG]` (BC-ADM-4/6 — no §7 slug for import or outreach; corpus basis stated). No slug invented. System actor for processing/auto-queue jobs. `staff_super_admin` flagged override preserved. Verification Admins hold no finance slugs (separation stated). No authorization leakage.

### Audit Integrity — PASS (with F4J-PA2-M1 per-contract inconsistency)
J-A5 consolidation is correct: "import job execution" (§9 named pointer, BC-ADM-4); `[ESC-ADM-AUDIT]` (BC-ADM-5/6, not §9-enumerated). No audit action invented. Reads not audited (§17.1). BC-ADM-6 per-contract audit is definitive and consistent. BC-ADM-5 per-contract audit is dual-option and contains a stretch-pointer (F4J-PA2-M1 — MINOR; requires patch; does not block at J-A5 level but creates per-contract inconsistency).

### Dependency Integrity — PASS
All four active Part-2 DR-ADM-* seams (DR-ADM-1/MKT/TRUST/PC) correctly placed and directioned. DR-ADM-RFQ/OPS correctly absent. `DR-ADM-COMM` correctly non-existent and excluded with explicit corpus basis. No ownership transfer in any direction. Write-via-service pattern correctly applied. No dependency marker invented.

### Event Governance — PASS
BC-ADM-4/5/6 produce no §8 events — stated definitively in J-A6. `VendorBanned` (BC-ADM-2, Part 1) not re-authored here. The verification-queue Trust service signal correctly distinguished from a §8 event. No event coined. `[ESC-ADM-EVENT]` correctly reserved.

### Procurement Moat — PASS
BC-ADM-4: catalog seeding via Marketplace service — supply-side enrichment, no procurement decision. BC-ADM-5: verification workflow — Admin manages queue; Trust stores outcome/score; no procurement-eligibility decision by Admin. BC-ADM-6: "informational acquisition only — never procurement routing" — stated in overview, contract records, and J-A9. Moat intact across all three BCs.

### Trust Firewall — PASS
BC-ADM-5: `verification_tasks` (Admin-owned workflow) correctly separated from `trust.verification_records`/`trust.verification_decisions` (Trust-owned). VO DecisionRef = pointer only. Decision recorded via Trust service (not direct write). Admin computes/owns no Trust/Performance/Verification/Governance score. Firewall stated in five distinct locations. BC-ADM-4/BC-ADM-6: no Trust interaction; DR-ADM-TRUST correctly absent. Firewall intact.

### Error Model — PASS
`REFERENCE ≠ DEPENDENCY` and `STATE ≠ CONFLICT` stated at Pass-A level. The cross-module reference distinction (`verification_record_id` not-found = `REFERENCE`; Trust service unavailable = `DEPENDENCY`) is correctly drawn. Protected-fact collapse (`NOT_FOUND` for platform-staff-scoped records) correctly stated. Hardened per-stage registers deferred to Pass-B (correct depth). No error model ambiguity.

### AI-Agent Readiness — PASS (pending F4J-PA2-M1 resolution)
J-A9 enumerates all ownership restrictions, forbidden state names, authorization patterns, event governance, procurement moat, trust firewall, and no-invention rule. Lifecycles are deterministic (all three stated; forbidden states explicitly named). Authorization is deterministic (`staff_can_verify` / `[ESC-ADM-SLUG]`). Dependency mapping is deterministic. The single ambiguity is the BC-ADM-5 per-contract dual audit binding (F4J-PA2-M1) — once resolved, Part 2 is fully implementation-ready for AI-agent-assisted Pass-B authoring.

---

## Final Architecture Board Verdict

```
Current State:
  BLOCKER = 0
  MAJOR   = 0
  MINOR   = 1  (F4J-PA2-M1 — BC-ADM-5 per-contract audit dual-option + stretch-pointer in queue_verification_task.v1)
  NITPICK = 0

Recommendation: PASS WITH PATCH
```

**Can this document proceed to `Doc-4J_PassA_Part2_Patch_v1.0`?**

**YES**

**Justification.** The document is governance-sound and well-authored at Pass-A depth. All three BCs are correctly decomposed against the frozen structure. All reconciliation decisions (lifecycle corrections, `DR-ADM-COMM` exclusion) are correctly applied with corpus basis. The trust firewall (BC-ADM-5), procurement moat (BC-ADM-6), event discipline (none produced), and dependency surface are all clean. The single MINOR finding (F4J-PA2-M1) affects only the three BC-ADM-5 per-contract audit fields and requires the same fix that resolved F4J-PA1-N1 in Part 1: remove the dual-option and the "suggestion decisions" stretch-pointer, apply the single `[ESC-ADM-AUDIT]` binding that J-A5 already states correctly. Two-sentence patch to three contracts; no structural change. Required path: **Patch → Patch Verification → Pass-A Consolidation Review → Pass-A FROZEN → Pass-B.**

---

*End of Doc-4J_PassA_Part2_Independent_Hard_Review_v1.0. Pass-A Part 2 Hard Review — BC-ADM-4/5/6. Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 (F4J-PA2-M1: BC-ADM-5 per-contract audit dual-option; `queue_verification_task.v1` stretch-pointer "suggestion decisions" removed; apply single `[ESC-ADM-AUDIT]` binding to all three verification-task contracts) · NITPICK = 0. Status: PASS WITH PATCH. Required path: Patch → Patch Verification → Pass-A Consolidation Review → Pass-A FROZEN → Pass-B. Corpus authority: Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4I (FROZEN) · Doc-4J_Structure_FROZEN_v1.0 (FROZEN) · Doc-4J_PassA_Part1_Content_v1.0.*
