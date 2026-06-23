# Doc-4M_Independent_Hard_Review_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4M_Independent_Hard_Review_v1.0` |
| Nature | **Independent Hard Review.** Structure review only. Not a redesign, new authoring pass, state redesign, transition redesign, or ownership reallocation. |
| Document Under Review | `Doc-4M_Structure_Proposal_v0.1` |
| Review Objective | Determine whether Doc-4M State Machine Contracts is ready for Structure Freeze and subsequent Single-Pass Content Authoring |
| Corpus Authority (precedence) | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN) |
| Conflict Rule | FLAG-AND-HALT |
| Review Model | Claude Sonnet 4.6 |

---

## Executive Verdict

```
BLOCKER: 0   MAJOR: 0   MINOR: 2   NITPICK: 3
```

**Status: APPROVE WITH STRUCTURE PATCH**

---

## Findings

---

**Finding ID:** F4M-SR-01
**Severity:** MINOR
**Affected Section:** M3 — State Machine Inventory

**Issue:** Three Marketplace entities — `Category Assignment`, `Product`, `Microsite` — are cited with `Doc-2 §3 (status)` as their Reference Source, indicating their state is defined as a status enum in the entity table definition rather than as a named state machine in `Doc-2 §5`. This is accurate but structurally ambiguous: M3's column header is "State Machine Inventory" and its section heading says "canonical lifecycle in the frozen corpus," which implies a §5 state machine. An AI agent reading M3 could treat the §3 enum-based entities as structurally equivalent to the §5-defined ones and attempt to derive lifecycle contracts from them as if a full transition graph existed. The same applies to `Custom Domain`, `Vendor Lead`, `Private Vendor Record`, `Platform Invoice`, `RFQ Invitation`, `Membership`, and other entities that cite `Doc-2 §3` rather than a §5 entry.

**Impact:** An AI coding agent could look up `Product` in M4, see state `draft / published / unpublished`, find no `§5` citation, and attempt to infer transition guards from the status field definition alone, effectively implementing lifecycle behavior not specified in any state-transition contract. Risk of invented transitions.

**Required Resolution:** Add a footer note to M3 (and carry it to M4) distinguishing between (a) entities with a named Doc-2 §5 state machine (full transition graph + guards in corpus) and (b) entities with a Doc-2 §3 status enum only (no authoritative transition graph beyond the field definition — transition guards must be sought in the owning Doc-4 module contract, or do not exist). A one-line annotation per category is sufficient; the list itself does not change.

---

**Finding ID:** F4M-SR-02
**Severity:** MINOR
**Affected Section:** M3 — State Machine Inventory (row: `Trust / Performance Score`)

**Issue:** `Trust / Performance Score` is listed in M3 with Reference Source `Doc-2 §8 (score events); Doc-4G (FROZEN)`. Score events in Doc-2 §8 are event ownership markers, not a state machine. Trust/Performance Score is a derived aggregate — it has no lifecycle states (no `active/expired/suspended`); it is computed/updated from constituent events. Listing it in M3 alongside entities with genuine lifecycle state machines (Organization, RFQ, Subscription) is structurally misleading: it implies a state machine exists when none is defined in the frozen corpus. Doc-4K's AI artifacts are correctly annotated as "cache lifecycle, not a business state machine" — Trust/Performance Score warrants the same treatment, but receives none.

**Impact:** An AI agent reading M3 could attempt to locate or implement a Trust/Performance Score state machine that does not exist, or could conflate score-update events with state transitions, leading to incorrect lifecycle implementation.

**Required Resolution:** Either (a) move Trust/Performance Score to a dedicated M3 sub-section for "derived/computed values without a lifecycle state machine" (parallel to the AI artifacts footnote treatment), or (b) add an inline parenthetical identical in form to the AI artifacts footnote: "(score-update events only; no lifecycle state machine — derived aggregate, not a stateful entity)". Do not remove it from M3; it is a legitimate corpus entity. Do not add any state to M4 for it.

---

**Finding ID:** F4M-SR-03
**Severity:** NITPICK
**Affected Section:** M5 — Transition Authority Matrix (row: `Custom Domain` `pending → verified → active`)

**Issue:** The M5 row for `Custom Domain` shows `pending → verified → active` as the To State in a single row. This conflates two distinct transitions (`pending → verified` and `verified → active`) into one cell. Every other M5 row uses the one-transition-per-row pattern (`From State` / `To State`). The conflation is cosmetically inconsistent and creates a minor navigation problem: an AI agent counting "trigger authority" per transition would read one trigger for two transitions, which could be misread as both transitions sharing the same single trigger (or as a single atomic two-hop, which is not standard DDD lifecycle modeling).

**Impact:** Minor navigation ambiguity. Low-risk but inconsistent with the one-transition-per-row discipline established in the rest of M5 and in Doc-4A's state-transition contract template.

**Required Resolution:** Split into two rows: `pending → verified` and `verified → active`, each with its own Trigger Authority cell. Trigger authority may be the same for both if that is what the corpus states (Doc-2 §3; Doc-4D); the split is structural, not a change to the cited authority.

---

**Finding ID:** F4M-SR-04
**Severity:** NITPICK
**Affected Section:** M3 — State Machine Inventory (row: `Ban Action`)

**Issue:** `Ban Action` is listed as an entity in M3 with Owner BC = `Ban` and Reference Source = `Doc-2 §8 (VendorBanned); Doc-4J (FROZEN)`. However, a "ban action" is not a stateful entity with a lifecycle — it is an event/command that drives the `Vendor Profile → banned` transition (already documented in M5 and M6-4). There is no `ban_actions` table or lifecycle state machine in the frozen corpus; the ban is represented as an event (`VendorBanned`) and a permission (`staff_can_ban`). Listing `Ban Action` as a lifecycle entity in M3 is structurally misleading alongside entities like `RFQ` or `Subscription` that have genuine multi-state lifecycles.

**Impact:** Navigational confusion. An AI agent could attempt to locate a `ban_actions` state machine or aggregate that does not exist. Low-risk because M5/M6 correctly locate the transition in `Vendor Profile → banned`, but M3's inventory row creates an orphaned pointer.

**Required Resolution:** Remove `Ban Action` from M3 (it has no lifecycle state machine). Its authoritative representation is in M5 (`Vendor Profile → banned` row) and M6-4 (`Admin → Marketplace` seam). Optionally add a footer note in M3 clarifying that Admin ban is represented as a `Vendor Profile` transition (M5) and a cross-module seam (M6-4), not as a separate entity lifecycle.

---

**Finding ID:** F4M-SR-05
**Severity:** NITPICK
**Affected Section:** M5 — Transition Authority Matrix (general)

**Issue:** M5's section header explicitly states "Pass-A will enumerate the full transition set per entity; this proposal scaffolds the matrix shape with the canonical anchors." This is appropriate for a structure proposal. However, the matrix currently contains only a partial selection of entities (RFQ, RFQ Invitation, Quotation, Vendor Profile, Verified Financial Tier, Verification Record, Engagement, Subscription, Custom Domain). Entities with Doc-2 §5 state machines — Organization, Membership, Delegation Grant, Advertisement, Document Template — have no M5 rows at all. An AI agent consuming the structure proposal (before Pass-A) could infer that only the listed entities have transitions, suppressing correct lookup for the unlisted ones.

**Impact:** Low-risk at structure proposal stage (disclaimer is present). Mitigation needed to ensure the disclaimer is prominent enough that the structure freeze does not lock in a misreading of M5 coverage as exhaustive.

**Required Resolution:** Strengthen the M5 section header disclaimer to explicitly name it as a "representative sample, not exhaustive — Pass-A will populate all M3-enumerated entities." The words "representative sample" or equivalent should appear in the header so that both human readers and AI agents cannot mistake the partial set for the complete transition inventory.

---

## Domain Assessments

**Domain 1 — Consolidation Scope Integrity: PASS.** No new state, transition, workflow, or business rule introduced. Every cell a pointer. M9 governs well. Non-normative posture maintained.

**Domain 2 — Reference-Never-Restate Compliance: PASS.** No state definition, transition rule, event contract, or workflow map duplicated. No permission logic restated. Doc-4A §0.3 discipline intact throughout M3–M8.

**Domain 3 — State Authority Integrity: PASS (with F4M-SR-02 MINOR).** One entity → one state authority in all rows except the Trust/Performance Score structural ambiguity. No duplicate state ownership. No state ownership leakage.

**Domain 4 — Transition Authority Integrity: PASS (with F4M-SR-03 NITPICK).** One transition → one trigger authority throughout, except the conflated Custom Domain row. No ambiguous trigger authority elsewhere.

**Domain 5 — Cross-Module Dependency Integrity: PASS.** M6 seven seams all correctly represented. Admin vs Domain boundaries intact (M6-4/M6-5). Billing vs Identity (M6-6). RFQ vs Operations (M6-1/M6-2). Trust vs Marketplace (M6-3/M6-7). Single-authorship principle honored: emitter owns the event, consumer authors its handler. No transition created.

**Domain 6 — Escalation Marker Integrity: PASS.** Five markers carried verbatim (A-06, A-07, PATCH-02, `[ESC-AI-EVENT]`, module-level carry note). None resolved, renamed, or invented. Source-native format note present.

**Domain 7 — AI-Agent Consumption Safety: CONDITIONAL PASS (F4M-SR-01 MINOR is the primary risk).** M8 eight rules are well-formed and comprehensive. Terminal-states rule (Rule 6) explicit. The §3-vs-§5 ambiguity in M3/M4 is the primary AI-agent safety concern — an agent could attempt to derive transition contracts from status-enum rows. F4M-SR-02 (score entity) is secondary. Both addressed by patch; M8 itself is structurally sound.

**Domain 8 — Structure Completeness: PASS (with F4M-SR-04/F4M-SR-05 NITPICK).** M1–M9 skeleton complete and well-formed. No critical section missing. The `Ban Action` orphan and the M5 partial-coverage disclaimer are addressable by minor wording corrections. No structural gap that prevents Pass-A from completing the full enumeration.

**Domain 9 — Freeze Readiness: CONDITIONAL — pending two MINOR patches.**

---

## Final Recommendation

**APPROVE WITH STRUCTURE PATCH**

Two MINOR findings (F4M-SR-01, F4M-SR-02) require patch before structure freeze. Both are annotation/classification defects — no row deleted from M3, no state added, no transition added, no ownership changed. Three NITPICK findings (F4M-SR-03, F4M-SR-04, F4M-SR-05) are recommended for co-resolution in the same patch cycle. All five are precision/navigation corrections; none require structure redesign.

---

*End of Doc-4M_Independent_Hard_Review_v1.0. Independent hard review of Doc-4M_Structure_Proposal_v0.1. Review Model: Claude Sonnet 4.6. Corpus authority: Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN). Verdict: BLOCKER=0 · MAJOR=0 · MINOR=2 · NITPICK=3. Status: APPROVE WITH STRUCTURE PATCH. Findings: F4M-SR-01 (MINOR — M3 §3-vs-§5 entity classification ambiguity); F4M-SR-02 (MINOR — Trust/Performance Score misclassified as stateful entity); F4M-SR-03 (NITPICK — Custom Domain two-hop conflated in single M5 row); F4M-SR-04 (NITPICK — Ban Action listed as lifecycle entity in M3); F4M-SR-05 (NITPICK — M5 partial coverage disclaimer insufficiently prominent). Final Recommendation: APPROVE WITH STRUCTURE PATCH.*
