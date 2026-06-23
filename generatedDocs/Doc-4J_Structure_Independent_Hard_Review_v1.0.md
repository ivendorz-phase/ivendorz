# Doc-4J_Structure_Independent_Hard_Review_v1.0 — Architecture Board Hard Review (Module 8 — Admin Operations — Structure Proposal)

| Field | Value |
|---|---|
| Document | Doc-4J_Structure_Independent_Hard_Review_v1.0 |
| Nature | **Independent Architecture Board Hard Review — Structure Proposal.** Defect Discovery Review. Not a Pass-A Review, Pass-B Review, Patch Review, Patch Verification, Freeze Audit, or Architecture Redesign. |
| Document Reviewed | `Doc-4J_Structure_Proposal_v0.1` |
| Module | Doc-4J — Module 8 Admin Operations (`admin` schema, `admin_` namespace) |
| Authority (precedence) | Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4I (FROZEN) · Doc-4J_Structure_Proposal_v0.1. Conflict rule: FLAG-AND-HALT. |
| Standing constraints | No slug invented · No structural change · No ownership change · No lifecycle change · No event invented · No redesign · No new BCs · No new aggregates · Review posture only |

---

## Architecture Board Assessment

### Document Reviewed: `Doc-4J_Structure_Proposal_v0.1`

---

## Executive Verdict

```
BLOCKER   = 0
MAJOR     = 0
MINOR     = 1  (F4J-MA-M1)
NITPICK   = 1  (F4J-MA-N1)

Status: PASS WITH PATCH
```

The structure proposal is architecturally sound, DDD-compliant, governance-compliant, and ownership-safe. Family-map reconciliation is correctly recorded and resolved. All six BCs are properly decomposed with disjoint ownership. All six Doc-2 §2 Module-8 aggregates are assigned to exactly one context. The trust firewall, procurement moat, and non-disclosure constraints are explicitly stated and structurally enforced. `VendorBanned` is correctly scoped as Admin's sole §8 event. All dependency seams (DR-ADM-1/MKT/RFQ/OPS/TRUST/PC) are named with direction and channel pattern. Escalation markers follow established corpus precedent.

One MINOR finding (F4J-MA-M1): the `[ESC-ADM-SLUG]` treatment in §J12 for BC-ADM-3 (Suggestions) does not definitively state whether `staff_can_manage_categories` covers all three Suggestion roots or only the category-suggestion root — leaving the link-candidate and missing-vendor authorization surface underspecified at structure level. This must be resolved before Pass-A to ensure deterministic authorization placement in the three Suggestion contracts.

One NITPICK (F4J-MA-N1): §J3/§J5 correctly co-locate the Suggestion aggregate's three roots in BC-ADM-3 but do not add an explicit Pass-A authoring note that the three roots must not be split into separate BCs at content-authoring time.

---

## What Was Done Well

**Family-map reconciliation.** The authoring brief titled the document "Module 8 — Event Contracts" — a direct conflict with the frozen Doc-4A §1.3 family map (Doc-4J = Admin Operations) and Doc-4A §4.4 single-authorship (event ownership per producing module). The document correctly identifies this conflict, applies FLAG-AND-HALT, records the resolution, and authors the document as Doc-4J = Admin Operations with no event re-ownership. The precise resolution pattern (Doc-4L identified as the non-normative cross-module event-flow index; events owned per producing module; no event reinvented) is correct and corpus-consistent.

**Trust firewall precision.** The "Admin decides workflow; Trust stores the decision and any score" seam (BC-ADM-5 / DR-ADM-TRUST) is the most critical governance boundary in the module. The structure states it in five distinct locations (preamble, §J7, §J8, §J9, §J15) with the `DecisionRef (verification_record_id)` value object explicitly identified as a pointer VO — not an ownership claim. This is the correct implementation of the firewall at structure level.

**Procurement moat.** All six BCs are individually assessed for moat compliance in §J7. The ban decision (BC-ADM-2) is correctly characterized as a governance exclusion, not a procurement ranking signal. The verification decision (BC-ADM-5) correctly routes its outcome through Trust rather than Admin. No BC in the module makes a matching/routing/ranking/supplier-selection/award decision.

**Six-dependency seam clarity (DR-ADM-*).** The dependency map (§J8/§J15) names counterpart module, referenced entities, write channel, and moat/firewall assertion per seam. The "write-via-service" pattern for Marketplace (category approval + import seeding) and Operations (link columns) is correctly established — Admin does not write foreign schemas directly. The Communication dependency is correctly absent (Admin emits via outbox/DR-ADM-PC; Communication consumes the event independently).

**Escalation marker governance.** All four ESC-ADM-* markers follow the established corpus pattern (`[ESC-BILL-*]`, `[ESC-OPS-*]` precedent). No marker invented. The carried markers (DC-3, DD-3, DD-4, DF-5) are acknowledged with a resolution path (additive contract + named Doc-2 channel; frozen source not reopened) — the correct approach.

**Single-authorship and event discipline.** Admin produces exactly `VendorBanned` (Doc-2 §8 admin producer row; BC-ADM-2). No other event is asserted. Future events and required-but-absent consumption seams carry `[ESC-ADM-EVENT]`. The downstream consumers (Trust freeze, Communication notification) own their own effects — not re-authored.

**Suggestion aggregate multi-root corpus citation.** The three-root Suggestion aggregate is cited to Doc-2 §2 ("Suggestion — AR each") with a recorded reconciliation note, not invented or split. The co-location in BC-ADM-3 is mandated by corpus and correctly applied.

**AI-agent safety section (§J16).** The dedicated machine-readable constraint section follows the pattern established in Doc-4F/4G/4H/4I. Ownership restrictions are enumerated ("Admin MUST NEVER" list); the five distinct constraints are each stated explicitly. Audience annotation (Claude Code / Cursor / OpenAI Codex) is consistent with prior modules.

---

## Findings

### BLOCKER
None.

### MAJOR
None.

### MINOR

#### F4J-MA-M1 (MINOR)

**Section:** §J12 — Permission Surface Map

**Finding:** §J12 maps `staff_can_manage_categories` to BC-ADM-3 (Suggestions) and adds the note that "link/missing-vendor decisions bind the nearest applicable staff slug, or carry `[ESC-ADM-SLUG]` if no §7 staff slug enumerates the action." This leaves the authorization surface for BC-ADM-3 in one of two indeterminate states:

- **State A:** `staff_can_manage_categories` covers all three Suggestion roots (category, missing-vendor, and link-candidate decisions). In this case no `[ESC-ADM-SLUG]` is needed for BC-ADM-3, and the Pass-A author binds all three Suggestion contracts to the same slug.
- **State B:** `staff_can_manage_categories` covers only the category-suggestion root; link-candidate and missing-vendor decisions require a distinct §7 slug that does not yet exist (or a super-admin override). In this case `[ESC-ADM-SLUG]` applies to the link/missing-vendor contracts and the Pass-A author must carry the marker for two of the three Suggestion contracts.

The structure document does not resolve which state is correct. This is not merely a Pass-A detail — the structure-level permission-surface map (§J12) is the machine-readable authority for content-pass authoring. An AI-agent reading §J12 cannot determine whether to bind one slug or two for BC-ADM-3, or which Suggestion contracts carry `[ESC-ADM-SLUG]`.

Note: the existing Doc-2 §7 platform-staff slug space lists `staff_can_manage_categories`. Whether this slug is scoped to category-catalog management only or also covers operational decisions about missing-vendor suggestions and link candidates is a corpus question (Doc-2 §7 is the authority). The structure document must state the answer — not defer it — because the permission surface drives the authorization columns of every BC-ADM-3 contract at Pass-A.

**Impact:** BC-ADM-3 Pass-A authoring is underspecified. The content author will either guess (applying `staff_can_manage_categories` to all three) or halt and seek clarification. An AI-agent will apply the wrong authorization to at least one Suggestion contract or carry `[ESC-ADM-SLUG]` where a named slug exists — introducing an authorization gap or an unneeded marker.

**Required action:** In §J12, state definitively one of:
- (a) `staff_can_manage_categories` covers all three Suggestion roots (category, missing-vendor, and link-candidate decisions) — cite the Doc-2 §7 scope; no `[ESC-ADM-SLUG]` needed for BC-ADM-3 beyond any actions genuinely unenumerated.
- (b) `staff_can_manage_categories` covers only category-suggestion decisions; link-candidate and missing-vendor decisions carry `[ESC-ADM-SLUG]` (Doc-2 §7 additive) — cite the basis for this scope boundary.
No slug may be invented. If (b), the `[ESC-ADM-SLUG]` assignment in §J12 should name which specific Suggestion contracts carry the marker. Wording only; no structural change.

---

### NITPICK

#### F4J-MA-N1 (NITPICK)

**Section:** §J3 / §J5 — Bounded Context Landscape / Aggregate Inventory

**Finding:** The Suggestion aggregate's three-root co-location in BC-ADM-3 is correctly stated and corpus-cited (Doc-2 §2 "AR each"). However, the document does not include an explicit Pass-A authoring note that the three roots — despite having different lifecycles (`submitted→approved/rejected`; `submitted→triaged→closed`; `suggested→confirmed/dismissed`) and different dependency sets (Marketplace; neither; Operations) — must remain co-located in BC-ADM-3 and must not be split into separate bounded contexts at content-authoring time.

An AI-agent reading §J3 will observe three roots with distinct lifecycles and distinct external writes and may infer (incorrectly) that they should be in three separate BCs. The corpus reconciliation note in §J3 addresses this risk but only in the context of the original brief's event-contract framing — not as a general content-authoring guard.

**Impact:** A content-pass author or AI coding agent might reasonably propose splitting the three Suggestion roots into BC-ADM-3a / BC-ADM-3b / BC-ADM-3c. This would require a structural revision at Pass-A, disrupting contract numbering and the aggregate ownership ledger.

**Required action:** Add one sentence to §J3 or §J5 (whichever is the canonical structure-level authority for BC-ADM-3) explicitly stating: "The three Suggestion roots remain co-located in BC-ADM-3 at all pass stages — they must not be split into separate bounded contexts even though they carry distinct lifecycles and dependency sets; the co-location is mandated by Doc-2 §2 (one Suggestion aggregate, three ARs)." No structural change; wording only.

---

## Governance Assessment

### Family Map Compliance — PASS

Doc-4J = Admin Operations (Module 8, `admin` schema, `admin_` namespace) confirmed against Doc-4A §1.3, Doc-4A Appendix B, Doc-2 §0.3, and Program Roadmap §3.5. Family-map reconciliation correctly recorded: authoring brief conflict (titled "Event Contracts") identified, FLAG-AND-HALT applied, resolved as Admin Operations with no event re-ownership. Doc-4L correctly identified as the non-normative cross-module event-flow index. No hidden Event Contract scope; no Doc-4L leakage.

### Bounded Context Design — PASS

Six BCs (BC-ADM-1 Moderation through BC-ADM-6 Vendor Outreach) correctly decomposed from the six Doc-2 §2 Module-8 aggregates. Each BC has one named aggregate, one named purpose, one set of named services, and one dependency set. No overlap; no missing governance area; no aggregate fragmentation. The Suggestion aggregate's three-root co-location in BC-ADM-3 is corpus-mandated and correctly applied. Pass-A authoring orientation gap noted (F4J-MA-N1 — NITPICK; does not block).

### Ownership Integrity — PASS

All six Doc-2 §2 Module-8 aggregates assigned to exactly one BC (§J5/§J9). No aggregate split across BCs. No aggregate from another module pulled into Admin. Not-owned references correctly identified: `trust.verification_records`, `operations.private_vendor_records`, Marketplace catalog, `core.*` stores explicitly excluded from Admin ownership. `DecisionRef (verification_record_id)` correctly typed as pointer VO only. One aggregate = one owner module-wide.

### Dependency Integrity — PASS

Six DR-ADM-* seams (Identity, Marketplace, RFQ, Operations, Trust, Platform Core) all present with named counterpart, referenced entities, direction, and channel pattern. No required dependency missing (Doc-4H Billing correctly absent — no Admin/Billing seam). No dependency ownership drift. "Write-via-service" channel correctly established for Marketplace and Operations foreign writes. `REFERENCE ≠ DEPENDENCY` separation deferred to Pass-A (correct — not a structure-level concern). DR-ADM-PC system_configuration authority seam consistent with Doc-4B PA-E2. Communication correctly absent (Admin emits via outbox/DR-ADM-PC; no direct call).

### Event Governance — PASS

Admin produces exactly one Doc-2 §8 event: `VendorBanned` (BC-ADM-2; `ban_actions`; single-authorship per Doc-4A §4.4; Doc-2 §8 admin producer row). No event coined. No other BC in Module 8 emits a §8 event. Event consumption deferred to content authoring (correct); `[ESC-ADM-EVENT]` reserved for required-but-absent seams. Downstream consumers (Trust, Communication) own their own effects — not re-authored. Doc-4L scope correctly excluded. Single-authorship intact.

### Procurement Moat — PASS

Module-wide moat stated in five locations. All six BCs individually assessed. No BC makes a matching/routing/ranking/supplier-selection/award decision. Ban (BC-ADM-2) = governance exclusion, not ranking signal. Verification decision (BC-ADM-5) routes through Trust, not Admin. Category approval (BC-ADM-3) = catalog governance, not procurement eligibility gate. Import seeding (BC-ADM-4) = supply-side catalog enrichment, not buyer-to-vendor matching. Outreach (BC-ADM-6) = acquisition CRM, not procurement ranking. Moat intact.

### Trust Firewall — PASS

`verification_tasks` (Admin-owned) correctly separated from `trust.verification_records` (Trust-owned). Decision recording path: via Trust service (Admin calls Trust; Trust writes its own store). Admin computes/owns no score. `VendorBanned` is an event — what Trust does with it (freeze workflow, score adjustment) is Trust's domain. `DecisionRef (verification_record_id)` is a pointer VO. Firewall stated in five distinct locations. Intact.

### AI-Agent Readiness — PASS (with F4J-MA-M1 resolved)

All BCs have deterministic aggregate placement. All aggregates have deterministic BC placement. All six dependency seams have deterministic direction and channel. All state machines inventoried with lifecycle pointers. §J16 dedicated AI-agent safety section enumerates ownership restrictions and governance-only responsibilities explicitly. The single MINOR (F4J-MA-M1 — BC-ADM-3 authorization surface underspecified) creates a determinism gap in §J12 for the Suggestion contracts. Once patched, the structure is fully deterministic and implementation-ready for AI-agent-assisted Pass-A authoring.

---

## Final Architecture Board Verdict

```
Current State:
  BLOCKER = 0
  MAJOR   = 0
  MINOR   = 1  (F4J-MA-M1 — BC-ADM-3 authorization surface underspecified in §J12)
  NITPICK = 1  (F4J-MA-N1 — BC-ADM-3 three-root co-location guard absent in §J3/§J5)

Recommendation: PASS WITH PATCH
```

**Can this structure proceed to `Doc-4J_Structure_Patch_v1.0`?**

**YES**

**Justification.** The structure proposal is architecturally sound, governance-compliant, and DDD-compliant. Family-map reconciliation is correctly recorded and resolved. All six BCs are properly decomposed with disjoint ownership. The trust firewall, procurement moat, and non-disclosure constraints are structurally enforced. The one MINOR finding (F4J-MA-M1) requires a single §J12 text clarification to determine whether `staff_can_manage_categories` covers all three Suggestion roots or only the category-suggestion root — it does not require a structural redesign, a new BC, or a new aggregate. The NITPICK (F4J-MA-N1) requires one sentence in §J3 or §J5 guarding against three-root BC split at Pass-A. Both corrections are minimal and do not affect any other section. Required path: **Structure Patch → Structure Patch Verification → Doc-4J_Structure_FROZEN_v1.0 → Pass-A.**

---

*End of Doc-4J_Structure_Independent_Hard_Review_v1.0. Structure Proposal Hard Review — Module 8 Admin Operations. Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 (F4J-MA-M1: BC-ADM-3 authorization surface underspecified in §J12) · NITPICK = 1 (F4J-MA-N1: three-root co-location guard absent in §J3/§J5). Status: PASS WITH PATCH. Required path: Structure Patch → Structure Patch Verification → Doc-4J_Structure_FROZEN_v1.0 → Pass-A. Corpus authority: Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4I (FROZEN).*
