# Doc-4J_PassA_Part1_Independent_Hard_Review_v1.0 — Architecture Board Hard Review (Module 8 — Admin Operations — Pass-A Part 1)

| Field | Value |
|---|---|
| Document | Doc-4J_PassA_Part1_Independent_Hard_Review_v1.0 |
| Nature | **Independent Architecture Board Hard Review — Pass-A Content.** Defect Discovery Review. Not a Patch Review, Patch Verification, Freeze Audit, Architecture Redesign, or Structure Review. |
| Document Reviewed | `Doc-4J_PassA_Part1_Content_v1.0` |
| Part Scope | BC-ADM-1 Moderation · BC-ADM-2 Enforcement · BC-ADM-3 Suggestions |
| Authority (precedence) | Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4I (FROZEN) · Doc-4J_Structure_FROZEN_v1.0 (FROZEN) · Doc-4J_PassA_Part1_Content_v1.0. Conflict rule: FLAG-AND-HALT. |
| Standing constraints | No slug invented · No structural change · No ownership change · No lifecycle change · No event invented · No redesign · No new BCs · No new aggregates · No reopening frozen decisions |

---

## Architecture Board Assessment

### Document Reviewed: `Doc-4J_PassA_Part1_Content_v1.0`

---

## Executive Verdict

```
BLOCKER   = 0
MAJOR     = 0
MINOR     = 1  (F4J-PA1-M1)
NITPICK   = 1  (F4J-PA1-N1)

Status: PASS WITH PATCH
```

The document is structurally compliant, governance-sound, and well-authored for Pass-A depth. All three BCs are correctly decomposed against the frozen structure. Ownership, authorization, audit, event governance, dependency, procurement moat, trust firewall, error model, and AI-agent notes are all correctly stated. The Suggestion aggregate's three-root co-location is enforced and consistently applied. `VendorBanned` single-authorship is intact. All cross-module writes are correctly routed via the owning module's service.

One MINOR finding (F4J-PA1-M1): the `ban_actions` state machine is stated inconsistently between the aggregate definition (J2A-2: `active → lifted → expired`, implying expiry only from `lifted`) and the `expire_ban.v1` contract (which allows `→ expired` from both `active` and `lifted`). This lifecycle inconsistency must be resolved before Pass-B to prevent incorrect state-machine implementation.

One NITPICK (F4J-PA1-N1): `expire_ban.v1` audit presents two options ("ban issue/lift" by pointer OR `[ESC-ADM-AUDIT]`) without resolving which applies. The audit binding must be stated definitively at Pass-A — either the §9 "ban issue/lift" domain covers expiry or it does not.

---

## What Was Done Well

**Structure compliance throughout.** Every contract in Part 1 lands in the correct BC, on the correct aggregate, with the correct template, actor, and permission family. No drift from `Doc-4J_Structure_FROZEN_v1.0`. The three-root Suggestion co-location is correctly stated and enforced in both J3A-1 and J3A-2.

**Authorization precision (§J12 patch fully applied).** The structure patch resolution (Option B) is correctly propagated: `staff_can_manage_categories` is scoped to `decide_category_suggestion.v1` and category reads ONLY; missing-vendor and link-candidate decisions and reads carry `[ESC-ADM-SLUG]` with the corpus basis stated inline ("Doc-2 §7 enumerates no platform-staff slug for missing-vendor triage / link-candidate confirmation"). The `staff_super_admin` override is correctly noted as the flagged fallback. No slug invented.

**`VendorBanned` governance.** `issue_ban.v1` is the sole emitter; single-authorship (Doc-4A §4.4) is stated explicitly ("Admin authors production/delivery"). Downstream consumers (Marketplace reflect, Communication, Trust Protection) are identified as owning their own effects. `lift_ban.v1` correctly emits no event (DD-8 carried on Marketplace side). `expire_ban.v1` correctly emits no event. The event table (J-A6) contains exactly one row.

**Audit surface.** J-A5 is a comprehensive consolidation. Every mutation maps to a named Doc-2 §9 Admin action by pointer. Reads are correctly excluded (§17.1). `staff_super_admin` actions are additionally flagged. No audit action invented.

**Non-disclosure consistency.** Link-suggestion content is stated as never vendor-visible in five distinct locations (J3A-1 overview, `confirm_link_suggestion.v1`, `get_suggestion.v1`/`list_suggestions.v1`, B.7, J-A8, J-A9). The protected-fact collapse (`NOT_FOUND` on unauthorized read) is correctly noted in J-A8.

**Cross-module write discipline.** Category approval writes via the Marketplace service (not a direct `marketplace.*` write). Link confirmation writes via the Operations service (ASSUMPTION A-03; not a direct `operations.*` write). Ban references the vendor profile by UUID — it does not write the vendor's status; the status reflection is Marketplace's consumer effect (DD-3). All three cross-module writes follow the "Admin decides; the owning module stores" seam.

**B-section cross-cutting conventions.** The eight B-section conventions (B.1–B.8) are correctly stated and consistently applied across all per-contract records. The template taxonomy (21.6 Admin, 21.3 Query, 21.5 System, 21.2 Integration limited to `VendorBanned` delivery) is correct and follows Doc-4A §21 precedent. No template invented.

**Error model groundwork.** J-A8 correctly establishes the `REFERENCE ≠ DEPENDENCY`, `STATE ≠ CONFLICT`, `NOT_FOUND` protected-fact, and non-disclosure collapse rules at Pass-A level, with hardened per-stage registers deferred to Pass-B — the correct depth.

---

## Findings

### BLOCKER
None.

### MAJOR
None.

### MINOR

#### F4J-PA1-M1 (MINOR)

**Section:** J2A-2 (Aggregate Definition — Ban Action) and `admin.expire_ban.v1` (J2A-3 Contract Inventory, BC-ADM-2)

**Finding:** The `ban_actions` state machine is stated inconsistently across two locations:

- **J2A-2** (aggregate definition): `active → lifted → expired` — this linear chain implies that a ban must be lifted before it can be expired; expiry from `active` directly is not shown.
- **`expire_ban.v1`** (contract): "→ expired (Doc-2 §3.9)" with the System expiry job description implying expiry from either `active` or `lifted`, and the J-A5 audit table similarly covering both cases without distinguishing the source state.

These two representations are contradictory. The corpus authority is Doc-2 §3.9, which is the frozen lifecycle source. The freeze is not available to resolve here, but the two within-document states cannot both be correct: either (a) expiry can fire directly from `active` (time-based ban window expires without staff lifting it first) — in which case J2A-2 must show `active → expired` as a valid transition alongside `active → lifted → expired`; or (b) expiry only fires from `lifted` (staff must lift first, then a job marks it expired) — in which case `expire_ban.v1` must restrict its scope to `lifted → expired`.

This is not an architectural question; it is a lifecycle consistency question internal to the document that must be resolved against Doc-2 §3.9 before Pass-B authors the 12-section hardening, where the state machine is the authority for Stage-6 validation logic.

**Impact:** A Pass-B author or AI-agent reading J2A-2 and `expire_ban.v1` will encounter two different lifecycle definitions for the same aggregate. Any implementation that depends on the `active → expired` path will be undetermined — it may be written incorrectly (e.g., rejecting a System expiry call on an active ban) or the state-machine validation at Stage 6 will be wrong in one of the two representations.

**Required action:** Resolve the `ban_actions` state machine against Doc-2 §3.9. Choose exactly one:
- **(a)** If Doc-2 §3.9 allows `active → expired` directly (time-window expiry fires regardless of lift): update J2A-2 to state `active → lifted / expired`; `lifted → expired`; note the expiry path in `expire_ban.v1` as covering both source states.
- **(b)** If Doc-2 §3.9 requires `lifted` before `expired` (lift-then-expire workflow): update `expire_ban.v1` to restrict the transition to `lifted → expired` only; the System job only runs on lifted bans. Wording only; no structural change, no new aggregate, no new event.

---

### NITPICK

#### F4J-PA1-N1 (NITPICK)

**Section:** `admin.expire_ban.v1` (J2A-3 Contract Inventory, BC-ADM-2) and J-A5 (Audit Surface)

**Finding:** The `admin.expire_ban.v1` audit binding is presented as a binary choice: "§9 Admin ('ban issue/lift' — expiry by pointer) / `[ESC-ADM-AUDIT]` if expiry is not covered by the §9 enumeration." The J-A5 consolidation table echoes this as "(or `[ESC-ADM-AUDIT]` if expiry unenumerated; no action invented)." This leaves the binding unresolved: the Pass-B author must make an audit-governance decision (whether "ban issue/lift" is broad enough to cover expiry) that should have been made at Pass-A.

The pattern established in Doc-4I Part 1 (F4I-PA-M2 resolution — `expire_subscription.v1` audit → `[ESC-BILL-AUDIT]` because expiry was genuinely not enumerated in the §9 Financial domain under "purchase/renewal/cancel") provides precedent: if "ban issue/lift" is the exact §9 enumeration and "ban expiry" is not listed under that domain, then `[ESC-ADM-AUDIT]` is the correct binding, not the "ban issue/lift" pointer.

**Impact:** Minor orientation gap. The Pass-B author or AI-agent must resolve an audit-governance question that Pass-A should have resolved. The risk is low (either binding is corpus-safe; the worst outcome is an `[ESC-ADM-AUDIT]` marker where a named §9 pointer would have sufficed, or vice versa).

**Required action:** State the binding definitively in `expire_ban.v1` and in J-A5. Either:
- (a) "§9 Admin ('ban issue/lift') covers expiry — bind by pointer" (if the §9 Admin domain language is broad enough to encompass the full ban-lifecycle event).
- (b) "`[ESC-ADM-AUDIT]`" — if "ban expiry" is not separately enumerated under the Doc-2 §9 Admin domain's 'ban issue/lift' label. Consistent with the Doc-4I `[ESC-BILL-AUDIT]` precedent for subscription expiry. No audit action invented.

---

## Governance Assessment

### Structure Compliance — PASS
All six BCs from the frozen structure assigned; Part 1 correctly scopes BC-ADM-1/2/3 with BC-ADM-4/5/6 deferred to Part 2. All three BCs placed on their correct aggregates. All dependency seams (DR-ADM-1/RFQ/MKT/OPS/PC) placed correctly. Authorization surface matches §J12 post-patch exactly. No structure drift.

### Ownership Integrity — PASS
`moderation_cases` → BC-ADM-1; `ban_actions` → BC-ADM-2; `category_suggestions`/`missing_vendor_suggestions`/`link_suggestions` → BC-ADM-3 (one Suggestion aggregate, one BC, no split). All cross-module entities referenced by UUID only (no ownership). Write-via-service discipline: category write → Marketplace service; link-column write → Operations service; ban-action record → Admin schema only. No ownership leakage.

### Authorization Integrity — PASS
Doc-2 §7 sole authority. `staff_can_moderate_rfq` (BC-ADM-1), `staff_can_ban` (BC-ADM-2), `staff_can_manage_categories` (BC-ADM-3 category-suggestion contracts and reads ONLY). `[ESC-ADM-SLUG]` for BC-ADM-3 missing-vendor and link contracts — correctly applied with Doc-2 §7 basis stated. No slug invented. Three-layer authorization check (Membership + Slug + Resource Scope) stated in B.4. `staff_super_admin` flagged override preserved. No authorization leakage.

### Audit Integrity — PASS
J-A5 audit surface maps every mutation to a named Doc-2 §9 Admin action. Reads correctly excluded (§17.1). `staff_super_admin` actions additionally flagged. No audit action invented. Ban-expiry audit ambiguity noted (F4J-PA1-N1 — NITPICK; requires definiteness at Pass-A but does not block).

### Dependency Integrity — PASS
All five Part-1 DR-ADM-* seams (DR-ADM-1/RFQ/MKT/OPS/PC) correctly placed and directioned. DR-ADM-TRUST correctly absent (BC-ADM-5 is Part 2). No ownership transfer in any direction. Write-via-service pattern correctly applied for all cross-module writes. No dependency invented.

### Event Governance — PASS
`VendorBanned` is Admin's sole §8 event; sole producer is BC-ADM-2 / `issue_ban.v1`; single-authorship (Doc-4A §4.4). J-A6 event table contains exactly one row. No event emitted at lift or expiry. Downstream consumers identified as owning their effects. No event coined. `[ESC-ADM-EVENT]` correctly reserved.

### Procurement Moat — PASS
All BC-ADM-1/2/3 contracts reviewed. No contract makes a matching/routing/ranking/supplier-selection/award/procurement-eligibility decision. Moderation decisions are content governance; ban is a governance exclusion; category decisions are catalog governance; suggestion decisions are operational triage and data enrichment. Link-column write enriches private vendor data for Admin's internal mapping — it does not direct procurement matching. Moat intact.

### Trust Firewall — PASS
BC-ADM-5 (Verification Workflow) is Part 2 and not present. All Part-1 BCs: no Trust/Performance/Verification/Governance score computed or owned. Ban's downstream effect on Trust (Trust Protection freeze on `VendorBanned`) is Trust's consumer action, not Admin's. Firewall intact.

### Error Model — PASS
`REFERENCE ≠ DEPENDENCY` and `STATE ≠ CONFLICT` stated at Pass-A level. Protected-fact collapse (`NOT_FOUND`) correctly applied to platform-staff-scoped records. Non-disclosure collapse for link-suggestion reads stated. Hardened per-stage error registers deferred to Pass-B (correct depth). No error model ambiguity introduced.

### AI-Agent Readiness — PASS (pending F4J-PA1-M1)
J-A9 AI-agent notes enumerate all ownership restrictions, authorization patterns, event governance, procurement moat, trust firewall, and non-disclosure constraints explicitly. BC/aggregate/authorization/dependency placement all deterministic. The single determinism gap is the ban-expiry state machine inconsistency (F4J-PA1-M1) — once resolved, the module is fully implementation-ready for AI-agent-assisted Pass-B authoring.

---

## Final Architecture Board Verdict

```
Current State:
  BLOCKER = 0
  MAJOR   = 0
  MINOR   = 1  (F4J-PA1-M1 — ban_actions state machine inconsistency between J2A-2 and expire_ban.v1)
  NITPICK = 1  (F4J-PA1-N1 — expire_ban.v1 audit binding unresolved / dual-option)

Recommendation: PASS WITH PATCH
```

**Can this document proceed to `Doc-4J_PassA_Part1_Patch_v1.0`?**

**YES**

**Justification.** The document is well-authored at Pass-A depth. All governance domains pass except for one MINOR lifecycle inconsistency (F4J-PA1-M1 — the `ban_actions` state machine contradicts itself between J2A-2 and `expire_ban.v1` on whether `active → expired` is a valid transition) and one NITPICK audit-binding ambiguity (F4J-PA1-N1 — `expire_ban.v1` audit presents two options without resolution). Both corrections are isolated to BC-ADM-2 and require only wording changes, not structural redesign. Required path: **Patch → Patch Verification → (Part 2) → Pass-A FROZEN → Pass-B.**

---

*End of Doc-4J_PassA_Part1_Independent_Hard_Review_v1.0. Pass-A Part 1 Hard Review — BC-ADM-1/2/3. Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 (F4J-PA1-M1: ban_actions state machine inconsistency) · NITPICK = 1 (F4J-PA1-N1: expire_ban.v1 audit binding unresolved). Status: PASS WITH PATCH. Required path: Patch → Patch Verification → Part 2 → Pass-A FROZEN → Pass-B. Corpus authority: Architecture/ADRs · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A–4I (FROZEN) · Doc-4J_Structure_FROZEN_v1.0 (FROZEN).*
