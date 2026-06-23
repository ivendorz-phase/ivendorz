# Doc-4C Content v1.0 Pass-A — Independent Architecture Hard Review

| Field | Value |
|---|---|
| Document Under Review | Doc-4C_Content_v1.0_PassA.md |
| Review Type | Independent Architecture Hard Review |
| Reviewer Roles | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Architecture Auditor |
| Corpus Authority | Architecture FINAL · ADRs v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A v1.0 · Doc-4B v1.0 · Doc-4C Structure v1.0 FROZEN |
| Review Posture | Hard Review · Defect Hunting · No Feature Expansion · No Architecture Redesign |
| Date | 2026-06-14 |

---

## §1 — Executive Summary

Doc-4C Content v1.0 Pass-A is a well-structured, architecturally disciplined document. Its boundary declarations, template assignments, DDD integrity, DC-1–DC-4 handling, and governance-signal firewall are all sound. The document correctly abstains from inventing entities, events, slugs, and POLICY keys, and its escalation-marker framework (ESC-IDN-SLUG, ESC-IDN-AUDIT, DC-1–DC-5) is properly deployed.

However, the review identifies **four defects** that require resolution before Pass-B may begin:

**Two MAJOR defects** in audit binding integrity: (1) `[ESC-IDN-AUDIT]` is materially incomplete — four contracts carry audit bindings to Doc-2 §9 actions that do not exist in that section, yet are not listed in the escalation marker's affects scope, leaving them silently unescalated; (2) `reinstate_delegation_grant` and `expire_delegation_grant` claim audit actions from Doc-2 §9 that are not enumerated there, neither escalated nor acknowledged.

**One MAJOR defect** in actor-type conformance: `identity.activate_membership.v1` declares `Actor: System or User context` — a compound actor that violates the Doc-4A §5.2 closed actor-type set and leaves the authorization path unresolved for Pass-B implementers.

**One MINOR defect** in state-machine coverage: `identity.expire_delegation_grant.v1` does not address the `suspended → expired` transition gap — Doc-2 §5.10 only permits `active → expired`, but a suspended grant can pass `valid_to` with no declared outcome, creating a silent implementation ambiguity.

No BLOCKER defects were found. No module boundary violations, no ownership leakage, no invented entities or events, no governance-signal contamination. The document is approvable for Pass-B with a targeted patch resolving the four findings below.

---

## §2 — Findings Table

### MAJOR

---

### Finding ID: M-01
**Severity:** MAJOR
**Affected Section:** §C6 (`identity.activate_membership.v1`), §C12.1, Appendix A §C6 row
**Corpus Citation:** Doc-4A §5.2 (closed actor-type set: User | Admin | System | AI Agent); Doc-4A §21 (Template 21.4 Actor-Types field); Doc-4A Pass-2 §5 ("Every contract MUST declare which actor types may invoke it")

**Issue:**
`identity.activate_membership.v1` declares `Actor: System or User context (per verification source; DC-4 boundary)`. This is a compound actor declaration. Doc-4A §5.2 defines a closed four-value set — `User | Admin | System | AI Agent` — with no provision for compound or conditional entries. A contract has exactly one actor type; which actor type applies determines the authorization path (Doc-4A §6 three-layer check for User; §5.6 + staff slug for Admin; Phase-2 worker rules for System).

The DC-4 boundary (Supabase Auth infrastructure) does not justify a dual-actor contract: DC-4 defers the authentication mechanism, not the contract's actor identity. If the transition is effected by an infrastructure callback, the actor is System (a Phase-2-class worker); if by user self-service, the actor is User. These are structurally different contracts — one would be Template 21.5 System (no org context, `Response: none`, `Correlation: phase2-origin`), the other Template 21.4 User (active org context, slug check). Merging them produces unresolvable authorization ambiguity for Pass-B implementers and violates Doc-4A §5.2.

**Risk:** Pass-B implementers — Claude Code, Cursor, backend engineers — cannot determine the authorization path, template fields, or audit attribution model. A System-actor implementation will lack user context; a User-actor implementation will lack the infrastructure trigger boundary. Either implementation path produces a nonconforming contract.

**Recommended Resolution:** Split into two contracts or designate one authoritative actor:

- **Option A (two contracts):** `identity.activate_membership.v1` (Template 21.4, Actor: User — for user-initiated path) + `identity.activate_membership_system.v1` (Template 21.5, Actor: System — for infrastructure-triggered path), with DC-4 governing which path applies at runtime. Raise as an escalation marker.
- **Option B (single System actor):** Designate the `pending → active` transition as System-actor only (Template 21.5, infrastructure-triggered callback), and remove the User actor path, noting that the user has no self-service path for this transition. Raise DC-4 resolution requirement accordingly.

Do not invent the resolution. Surface as an escalation marker routed to the DC-4 channel for Board decision on which path(s) are intended.

---

### Finding ID: M-02
**Severity:** MAJOR
**Affected Section:** §C12.3, Appendix C §C.2 (`[ESC-IDN-AUDIT]`), and the following contracts: `identity.activate_membership.v1` (§C6), `identity.set_membership_status.v1` (§C6, reinstate path), `identity.reinstate_delegation_grant.v1` (§C9), `identity.expire_delegation_grant.v1` (§C9)
**Corpus Citation:** Doc-2 §9 Organization domain ("membership invite/accept/suspend/remove"); Doc-2 §9 Vendor profile domain ("delegation grant issue/suspend/revoke"); Doc-4A §17 ("The `action` field MUST be verbatim from Doc-2 §9 — never coined in Doc-4"); Doc-4A Appendix A CHK-H-22 ("The audit action exists in Doc-2 §9. If mutating: Audit-Required is yes")

**Issue:**
`[ESC-IDN-AUDIT]` is the document's mechanism for flagging audit actions absent from Doc-2 §9. Its `Affects:` list in Appendix C §C.2 names: `set_user_account_status`, `deactivate_own_account`, `set_organization_status`, `update_user_2fa_settings`, `upsert_buyer_profile`. These are correctly identified.

However, four additional contracts claim audit bindings to Doc-2 §9 actions that do not appear in that section, and are **not listed in the ESC-IDN-AUDIT affects scope**:

1. **`identity.activate_membership.v1`** — claims `Doc-2 §9 Organization "membership activation"`. Doc-2 §9 enumerates: `membership invite/accept/suspend/remove`. The action `activation` does not appear.
2. **`identity.set_membership_status.v1`** (reinstate path) — claims `Doc-2 §9 Organization "membership suspend"`. For the suspend direction this is correct. For the reinstate (`suspended → active`) direction, the audit action `membership reinstate` does not appear in Doc-2 §9. The contract covers both directions under a single audit binding, but only one direction has a named §9 action.
3. **`identity.reinstate_delegation_grant.v1`** — claims `Doc-2 §9 Vendor profile "delegation suspend/reinstate pair"`. Doc-2 §9 enumerates: `delegation grant issue/suspend/revoke`. The action `reinstate` does not appear.
4. **`identity.expire_delegation_grant.v1`** — claims `Doc-2 §9 Vendor profile "delegation revoke/expiry family"`. The action `expiry` (as distinct from `revoke`) does not appear in Doc-2 §9.

`§C12.3` restates the Doc-2 §9 list correctly and then says `[ESC-IDN-AUDIT]` covers the gaps — but the gap list does not cover these four cases. The contracts therefore carry audit bindings that reference non-existent Doc-2 §9 actions, unescalated. Per Doc-4A §17, the audit action field must be verbatim from Doc-2 §9; per Doc-4A §0.6, a gap must be escalated, never papered over.

**Risk:** Pass-B implementers will attempt to write audit records using action strings (`membership activation`, `membership reinstate`, `delegation reinstate`, `delegation expiry`) that have no authoritative definition in Doc-2 §9. This either forces them to invent action names (a FIXED violation) or creates inconsistent audit records across the platform. The Doc-2 §9 additive patch required by DC-5/ESC-IDN-AUDIT must cover these actions or they cannot be implemented correctly.

**Recommended Resolution:** Expand `[ESC-IDN-AUDIT]` in Appendix C §C.2 to add all four affected contracts to the `Affects:` list, with the specific missing action strings called out. The interim binding for each:
- `activate_membership` → nearest §9 action = `membership accept` (closest lifecycle parallel; pending for Doc-2 §9 additive)
- `set_membership_status` (reinstate path) → nearest §9 action = `membership suspend` is already bound for the suspend direction; the reinstate direction needs `membership reinstate` added to the Doc-2 §9 additive scope
- `reinstate_delegation_grant` → nearest §9 action = `delegation grant suspend` (the inverse direction; pending additive for `delegation grant reinstate`)
- `expire_delegation_grant` → nearest §9 action = `delegation grant revoke` (functionally closest terminal action; pending additive for `delegation grant expiry`)

No audit action is invented here. The Doc-2 §9 additive patch scope (through the ESC-IDN-AUDIT channel) must be extended to cover all nine missing actions: the five already identified plus the four found here.

---

### MINOR

---

### Finding ID: m-01
**Severity:** MINOR
**Affected Section:** §C9 (`identity.expire_delegation_grant.v1`)
**Corpus Citation:** Doc-2 §5.10 (`active ──valid_to passes──▶ **expired**`; `active|suspended ──revoke──▶ **revoked**`); Doc-4A §13.2 ("Pre-states: list of legal pre-states, verbatim from Doc-2 §5")

**Issue:**
Doc-2 §5.10 defines expiry as `active ──valid_to passes──▶ **expired**`. The pre-state for expiry is explicitly `active`. The machine does not show `suspended → expired`.

`identity.expire_delegation_grant.v1` declares `State: Doc-2 §5.10 active → expired (terminal)` — correctly citing only `active` as the pre-state.

However, there is no handling specified for the scenario where a delegation grant is in `suspended` state when `valid_to` passes. Doc-2 §5.10 is silent on this case — it defines `suspended → active` (reinstate) and `active|suspended → revoked` (revoke), but not `suspended → expired`. The contract correctly limits pre-state to `active`, but offers no marker or escalation for what occurs when a suspended grant passes its `valid_to`.

This gap is an implementation ambiguity: a suspended grant past its `valid_to` has no defined terminal outcome in the state machine. Pass-B implementers will face a choice (ignore, auto-revoke, force-expire) with no corpus basis for any option.

**Risk:** Silent implementation divergence between handling of `active → expired` (correctly handled) and `suspended-past-valid_to` (undefined). An inconsistency here could leave stale suspended grants in a non-terminal limbo state with no cleanup path, or cause implementers to invent a transition.

**Recommended Resolution:** Add an escalation marker (`[ESC-DG-EXPIRE]` or extend DC-1 scope) noting that Doc-2 §5.10 does not define the `suspended → expired` path. Route to the Board for a Doc-2 §5.10 additive clarification (either: `active|suspended ──valid_to passes──▶ expired`, or a statement that suspended grants remain suspended past expiry until explicitly revoked). Do not invent the resolution.

---

### Finding ID: m-02
**Severity:** MINOR
**Affected Section:** §C9 (`identity.expire_delegation_grant.v1`), Appendix C §C.3
**Corpus Citation:** Doc-4A §18.2 (POLICY key referencing rules); Doc-4A §22.3 Rule R-04 (POLICY key gap handling)

**Issue:**
`identity.expire_delegation_grant.v1` declares `Timer window: core.system_configuration.identity.delegation_validity_default / expiry sweep cadence [DC-5]`. Two distinct POLICY values are referenced using one key name with a slash notation:

- `identity.delegation_validity_default` — the default grant validity span (registered in Appendix C §C.3, consumed by `create_delegation_grant`)
- an unnamed "expiry sweep cadence" key — the system timer interval for checking `valid_to` passages

These are semantically distinct: `delegation_validity_default` governs the duration set at issuance; the expiry sweep cadence governs the timer worker's execution frequency. They are different operational parameters and must be separate POLICY keys. Currently only one (`identity.delegation_validity_default`) is enumerated in C.3; the sweep cadence key is referenced in the contract body but absent from C.3.

Per Doc-4A §18.2, every tunable limit must reference a named POLICY key. The omission of the sweep cadence key from the C.3 enumeration leaves a DC-5 gap within the DC-5 resolution mechanism itself.

**Risk:** At DC-5 patch time, the Doc-3 §12.2 additive will not include the sweep cadence key because it is not enumerated in C.3. The `expire_delegation_grant` System timer contract will then have an unresolved POLICY binding at freeze. Low operational risk now; structural risk to DC-5 patch completeness.

**Recommended Resolution:** Add a second POLICY key to Appendix C §C.3: `identity.delegation_expiry_sweep_cadence` (or equivalent), with purpose "timer worker sweep cadence for `active → expired` delegation grant expiry check", referenced by `expire_delegation_grant`. Update the contract's timer-window declaration to reference both keys distinctly.

---

## §3 — Architecture Risk Assessment

| Domain | Rating | Basis |
|---|---|---|
| **Boundary Integrity** | **PASS** | Nine-entity scope is correctly bounded. Not-owned table is complete and accurate. No cross-module table access, no cross-schema FK. Bare UUID refs correctly identified. DC-2 (verification ownership) correctly not authored. |
| **DDD Integrity** | **PASS** | One Entity = One Owner enforced throughout. Aggregate boundaries respected. No orphan entities. All nine owned entities have contracts. No contract authors another module's entity. |
| **Authorization Integrity** | **PASS** | Three-layer check correctly referenced via `check_permission.v1`. No shadow permission resolution path. Delegation §6B correctly consumed by pointer. Ownership-class actions correctly excluded from delegation eligibility. Active-org context correctly declared server-validated. Admin (21.6) and System (21.5) actor typing correctly applied except for M-01. |
| **Audit Integrity** | **CONCERN** | M-02: Four contracts claim Doc-2 §9 audit actions that do not exist in that section and are not captured in [ESC-IDN-AUDIT]. `§C12.3` summary is correct but [ESC-IDN-AUDIT] affects list is materially incomplete. Audit is never bypassed and is always written within the transaction — those structural properties are sound. The defect is in action-name authority, not in audit discipline. |
| **Integration Integrity** | **PASS** | DC-1 guardrail correctly applied. No Template 21.2 instantiated. No event invented. No cross-module leg authored without the DC-1 marker. invite_member notification correctly flagged as DC-1. restore_organization cascade correctly flagged as DC-1. |
| **AI-Agent Safety** | **CONCERN** | M-01: `activate_membership.v1` dual-actor declaration (`System or User`) is unresolvable by Claude Code or Cursor — the authorization path, template field set, and attribution model cannot be determined from the contract as written. All other contracts are AI-agent implementable. The 42-contract inventory, template assignments, slug bindings, and source pointers are sufficient for Pass-B hardening on the remaining 41 contracts. |

---

## §4 — Pass-A Readiness Decision

**APPROVE WITH PATCH REQUIRED**

The document is architecturally sound at the boundary, DDD, delegation, events, and POLICY firewall levels. It correctly handles all five freeze-gate dependencies and correctly raises and routes both escalation markers. The defects are audit-binding completeness (M-02, a documentation gap in the escalation marker scope) and actor-type conformance (M-01, an unresolvable ambiguity for implementers). These are resolvable by a targeted patch without structural change to the document.

---

## §5 — Pass-B Entry Conditions

The following actions are required before Pass-B authoring may begin. No Pass-B payload hardening, per-field validation, or error-code registration may proceed against an affected contract until its entry condition is resolved.

**Entry Condition 1 (from M-01):** `identity.activate_membership.v1` actor-type must be resolved to a single value from the Doc-4A §5.2 closed set. Resolution requires a Board decision (DC-4 channel) on whether the `pending → active` transition is System-actor (infrastructure-triggered, Template 21.5) or User-actor (self-service, Template 21.4), or whether two separate contracts are required. The resolution must be documented in a Pass-A patch and the contract reauthored with a single actor type before Pass-B touches §C6.

**Entry Condition 2 (from M-02):** `[ESC-IDN-AUDIT]` in Appendix C §C.2 must be patched to include all four additional affected contracts (`activate_membership`, `set_membership_status` reinstate path, `reinstate_delegation_grant`, `expire_delegation_grant`) with their missing action strings identified. The interim binding must be stated for each. The scope of the Doc-2 §9 additive patch (the ESC-IDN-AUDIT resolution channel) must be extended to cover all nine missing actions before any affected contract can be frozen. This patch does not block Pass-B from beginning on unaffected contracts.

**Entry Condition 3 (from m-01):** An escalation marker must be added for the `suspended → expired` gap in Doc-2 §5.10 as it affects `expire_delegation_grant`. This may be added to the Pass-A patch or as a note in the existing DC-1/DC-5 marker scope. It does not block Pass-B work on other §C9 contracts.

**Entry Condition 4 (from m-02):** Appendix C §C.3 must add `identity.delegation_expiry_sweep_cadence` (or equivalent) as a second distinct POLICY key for the `expire_delegation_grant` timer worker sweep interval, distinct from `identity.delegation_validity_default`. The contract's timer-window declaration must be updated to reference both keys. This must be resolved before the DC-5 Doc-3 §12.2 additive patch is submitted.

---

## §6 — Final Answer

**Can Doc-4C_Content_v1.0_PassA proceed to Pass-B?**

**NO — not in current form.**

A targeted patch resolving M-01 (actor-type conformance on `activate_membership`), M-02 (ESC-IDN-AUDIT scope extension), m-01 (suspended-grant expiry gap escalation), and m-02 (DC-5 key enumeration completeness) is required first.

Once that patch is applied and reviewed, Pass-A may be approved and Pass-B may begin. Pass-B may proceed immediately on all contracts not affected by Entry Conditions 1–4 (i.e., all contracts except `activate_membership.v1`, `set_membership_status.v1`, `reinstate_delegation_grant.v1`, and `expire_delegation_grant.v1`) only if the Board explicitly authorizes parallel progression — otherwise the patch should precede all Pass-B work.

The document is not rejected. It is a high-quality Pass-A artifact that correctly establishes Module 1's contract surface. The findings are narrow, well-bounded, and resolvable without structural redesign.

---

*End of Doc-4C Content v1.0 Pass-A — Independent Architecture Hard Review. Findings: 0 BLOCKER · 2 MAJOR · 2 MINOR · 0 NITPICK. Decision: APPROVE WITH PATCH REQUIRED.*
