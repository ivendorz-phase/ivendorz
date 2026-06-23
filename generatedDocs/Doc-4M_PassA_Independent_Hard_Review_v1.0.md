# Doc-4M_PassA_Independent_Hard_Review_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4M_PassA_Independent_Hard_Review_v1.0` |
| Nature | **Independent Hard Review.** Content review only. Not a redesign, state redesign, transition redesign, structure review, or scope expansion. |
| Document Under Review | `Doc-4M_PassA_Content_v1.0` |
| Review Objective | Determine whether Doc-4M State Machine Contracts is ready for Pass-A Approval and subsequent Pass-A Patch Authoring if required |
| Corpus Authority (precedence) | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN) → Doc-4M_Structure_FROZEN_v1.0 → Doc-4M_PassA_Content_v1.0 |
| Conflict Rule | FLAG-AND-HALT |
| Review Model | Claude Sonnet 4.6 |

---

## Executive Verdict

```
BLOCKER: 0   MAJOR: 0   MINOR: 2   NITPICK: 2
```

**Status: APPROVE WITH PATCH**

---

## Findings

---

**Finding ID:** F4M-PA-01
**Severity:** MINOR
**Affected Section:** M5 — Organization transitions (From State: `unverified`)

**Issue:** The Organization M5 block uses `unverified (claim pending)` as a From State for the first transition. Doc-2 §5.1 defines the Organization state machine with a claim dimension; the state label `unverified` is not a canonical Doc-2 §5.1 state string. The claim dimension states in Doc-2 §5.1 are named per the claim-lifecycle pattern (consistent with `seeded/invited/claimed/verified` for Vendor Profile in Doc-2 §5.3), not `unverified`. Using a non-canonical state string in M5's From State column violates the pointer discipline: an AI agent reading `unverified` would have no matching state key in Doc-2 §5.1 to look up. The parenthetical `(claim pending)` further suggests this is an inference rather than a verbatim §5.1 state name.

**Impact:** AI-agent state lookup failure. An engineer or coding agent using M5 to navigate to Doc-2 §5.1 would search for `unverified` and find no match, or would infer its meaning from the parenthetical rather than the authoritative source. Navigational misdirection; possible state invention downstream.

**Required Resolution:** Replace `unverified (claim pending)` with the verbatim Doc-2 §5.1 From State for that transition (the canonical pre-claim state name per the organization claim-lifecycle definition). If Doc-2 §5.1 uses a "per source" pointer for this dimension (as M4 does — "per Doc-2 §5.1 (claim/operational dimensions)"), the M5 From State cell should match that pointer pattern rather than naming a non-canonical state string. Do not invent a state; use the corpus-stated name or defer to "per Doc-2 §5.1" if no single state name is enumerated.

---

**Finding ID:** F4M-PA-02
**Severity:** MINOR
**Affected Section:** M5 — Vendor Profile transition: `claimed → verified`

**Issue:** The Vendor Profile M5 row for `claimed → verified` lists Trigger Authority as "Trust verification decision (Doc-4G)" and Reference Source as `Doc-2 §5.3; Doc-4G → Doc-4D (FROZEN) — see M6`. This is accurate for the cross-module seam — Trust drives the verification decision, Marketplace reflects the `verified` claim status. However, M6 contains no seam row for this specific dependency (Verification → Marketplace claim status). The seven M6 seams cover: RFQ → Operations (M6-1), RFQ → Operations/Communication (M6-2), Verification → Marketplace tier history (M6-3), Admin → Marketplace ban (M6-4), Admin → Trust verification (M6-5), Billing → Identity (M6-6), Marketplace → Trust ownership transfer (M6-7). The `claimed → verified` Vendor Profile transition is a cross-module seam (Trust drives it; Marketplace reflects it in the claim dimension) but has no M6 row. The "see M6" pointer in M5 is therefore a dangling reference — it points to M6, but M6 has no row for this dependency.

**Impact:** An AI agent following "see M6" to find the authoritative cross-module contract for this transition would find no matching M6 row. The dependency is real and frozen (Doc-4G → Doc-4D seam); the omission leaves the seam undocumented in M6. Engineers implementing the `claimed → verified` transition may not recognize it as a cross-module seam and could implement it as a single-module write.

**Required Resolution:** Add an M6 seam row for the Trust → Marketplace claim-status seam: Verification approval (Doc-4G) drives the Vendor Profile `claimed → verified` claim-dimension state change in Marketplace (Doc-4D). Alternatively, if this seam is already fully captured by M6-5 (Admin → Trust) and M6-3 (Verification → Marketplace tier), remove the "see M6" pointer from the M5 row and point directly to Doc-4G + Doc-4D only. Do not invent a new event; the reference sources (Doc-4G → Doc-4D) are already cited.

---

**Finding ID:** F4M-PA-03
**Severity:** NITPICK
**Affected Section:** M5 — Subscription rows: `active → active`

**Issue:** Two Subscription rows have identical From State (`active`) and To State (`active`): one for cancel-flag (`auto_renew=false`) and one for renewal. A state machine row where From State = To State is not a transition in the DDD sense — it is a data mutation on an active record. Doc-2 §5.7 (A-06) explicitly names cancel as "active + auto_renew=false" (a flag on the active state, not a state change), and renewal as "still active" (same state). Representing these as M5 transition rows introduces a structural inconsistency: M5's purpose is "Allowed Transition → Trigger Authority," and a same-state row implies a permitted transition that does not change state. An AI agent reading two `active → active` rows could interpret them as legitimate state transitions and generate no-op state-change code.

**Impact:** Low-risk but structurally imprecise. The A-06 assumption marker in M7 already signals that the Subscription state machine is minimal; restating the `active → active` flag-change and renewal as transition rows potentially misleads AI agents about what a "transition" means for this entity. The events (`SubscriptionRenewed`) are correctly cited but the same-state row form is unusual.

**Required Resolution:** Either (a) add an inline parenthetical to both rows making explicit that these are not state-change transitions ("flag mutation, no state change" / "renewal, state unchanged"), or (b) move these two entries to an M5 footer note under Subscription (as "intra-state lifecycle events, not state transitions — per A-06") rather than as table rows. No new state or event introduced in either case.

---

**Finding ID:** F4M-PA-04
**Severity:** NITPICK
**Affected Section:** M5 — Engagement From State `(created)`

**Issue:** The Engagement M5 first row uses `(created)` in the From State column, parenthesized to signal it is not an actual state. This is accurate (Engagement is created directly into `active` via `RFQClosedWon`; there is no prior Engagement state), but the `(created)` label is a non-canonical, non-state string in a column whose discipline requires either a canonical state name or a "per source" pointer. Other entities that begin from a non-state starting point (e.g., AI Derived Artifact uses `(absent)`) use the same parenthetical pattern — so the inconsistency is not unique to Engagement, but `(absent)` for AI artifacts is marginally clearer in intent (the artifact simply does not exist yet). For Engagement, `(created)` could be misread by an AI agent as an `Engagement.state = 'created'` enum value.

**Impact:** Very low. The Trigger Authority and Reference Source are correct. Risk is limited to an AI agent inserting a spurious `created` state into the Engagement aggregate. Parenthetical form partially mitigates this.

**Required Resolution:** Replace `(created)` with a form that cannot be misread as a state name, e.g., `—` (no prior state; created directly into active) or `(none — created by RFQClosedWon)`. The cell should make unambiguous that no `created` state exists in the corpus. No state introduced.

---

## Domain Assessments

**Domain 1 — Consolidation Integrity: PASS.** No new state, transition, workflow, ownership, or event introduced. Every cell a pointer. M9 governance notes intact. Two M5 Subscription `active → active` rows (F4M-PA-03) are the only structural imprecision; they reference existing A-06 events correctly.

**Domain 2 — Canonical Lifecycle Coverage: PASS.** All 23 M3 entities covered in M5. No entity omitted. No entity invented. No entity renamed. Advertisement correctly deferred to A-07 per the escalation marker. AI artifacts correctly scoped to cache lifecycle only.

**Domain 3 — State Authority Integrity: PASS (with F4M-PA-01 MINOR).** One entity → one state authority throughout M3/M4. No ownership leakage. No duplicate. Organization From State `unverified` is the sole non-canonical state string; all other M4/M5 state strings are either verbatim Doc-2 §5 names or "per Doc-2 §x.x" pointers.

**Domain 4 — Transition Authority Integrity: PASS (with F4M-PA-02 MINOR, F4M-PA-03/04 NITPICK).** One transition → one trigger authority throughout, except the `active → active` same-state rows and the dangling "see M6" pointer. No duplicate trigger ownership; no ambiguous trigger authority in the standard (state-changing) rows.

**Domain 5 — Cross-Module Dependency Integrity: PASS (with F4M-PA-02 MINOR).** Seven M6 seams accurate and complete for the seams they document. The Trust → Marketplace claim-status seam (Vendor Profile `claimed → verified`) is the gap identified in F4M-PA-02; it is the sole omission.

**Domain 6 — Escalation Marker Integrity: PASS.** Five markers carried verbatim (A-06, A-07, PATCH-02, `[ESC-AI-EVENT]`, module-level carry). None resolved, renamed, or invented. Advertisement M5 row correctly points to A-07.

**Domain 7 — Reference-Never-Restate Compliance: PASS.** No state definition, transition rule, workflow map, event contract, or permission logic duplicated. Every cell a pointer. Trigger authority cells name the actor/contract only; guards and conditions explicitly deferred to Doc-3 and owning module contracts.

**Domain 8 — AI-Agent Consumption Safety: CONDITIONAL PASS (F4M-PA-01 primary risk).** M8 eight rules intact. The `unverified` non-canonical state string (F4M-PA-01) is the primary AI-safety concern — an agent searching Doc-2 §5.1 for `unverified` finds no match and may coin a state. The `(created)` Engagement From State (F4M-PA-04) is a secondary but minor risk. The `active → active` Subscription rows (F4M-PA-03) could mislead agents about what constitutes a transition for this entity.

**Domain 9 — Content Completeness: PASS.** M1–M9 fully populated. No orphan content. All M3-enumerated entities have M4 and M5 rows. Pass-A Validation table at end confirms consolidation discipline.

---

## Final Recommendation

**APPROVE WITH PATCH**

Two MINOR findings require patch before Pass-A approval. F4M-PA-01 (non-canonical Organization state string) and F4M-PA-02 (dangling "see M6" reference + missing M6 seam row) are navigation correctness issues that could cause AI agents to fail state lookups or miss a cross-module seam. Two NITPICK findings (F4M-PA-03, F4M-PA-04) are precision corrections recommended for co-resolution in the same patch. All four are pointer-precision defects; none require state, transition, ownership, or event invention.

---

*End of Doc-4M_PassA_Independent_Hard_Review_v1.0. Independent hard review of Doc-4M_PassA_Content_v1.0. Review Model: Claude Sonnet 4.6. Corpus authority: Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN) → Doc-4M_Structure_FROZEN_v1.0 → Doc-4M_PassA_Content_v1.0. Verdict: BLOCKER=0 · MAJOR=0 · MINOR=2 · NITPICK=2. Status: APPROVE WITH PATCH. Findings: F4M-PA-01 (MINOR — Organization M5 From State `unverified` non-canonical; not a Doc-2 §5.1 state string); F4M-PA-02 (MINOR — Vendor Profile `claimed → verified` M5 row carries dangling "see M6" pointer; no matching M6 seam row exists for Trust → Marketplace claim-status dependency); F4M-PA-03 (NITPICK — Subscription `active → active` same-state rows structurally imprecise; not transitions in DDD sense per A-06); F4M-PA-04 (NITPICK — Engagement From State `(created)` could be misread as state enum value `created`). Final Recommendation: APPROVE WITH PATCH.*
