# Doc-4B — Pass-A Review Resolution Patch v1.0.1

| Field | Value |
|---|---|
| Patch ID | Doc-4B-PassA-Patch-v1.0.1 |
| Applies To | `Doc-4B_Content_v1.0_PassA.md` |
| Patch Authority | `Doc-4B_PassA_Independent_Architecture_Review_v1.0.md` — in-document findings B-01 (PA-B01), m-01 (PA-m01), m-02 (PA-m02), m-03 (PA-m03); governance/upstream findings PA-M1, PA-M2, PA-M3, PA-M4, PA-M5 routed |
| Patch Type | Pass-A review resolution — targeted contract corrections + governance routing. **No redesign, no new entities/events/permissions/templates, no ownership or Family-Map change, Doc-4A not reopened.** |
| Corpus Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A (FROZEN) → Doc-4B Structure (FROZEN) → Doc-4B Content Pass-A → This Patch |
| Family Map | **Unchanged** — Doc-4B = Platform Core / Shared Kernel (Module 0); Doc-4C = Identity & Organization (Module 1) |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN: Pass1–Pass6 + Pass3 Patch v1.0.1 + Pass4 Patch v1.0.1 + Pass5 Patch v1.0.1 + Pass6 Patch v1.0.1 + FreezeAudit Patch v1.0.1) |
| Status | **DOC-4B PASS-A REVIEW FINDINGS RESOLVED (in-document); upstream/governance items routed** |

---

## §2 — Patch Authority

This patch is issued by the iVendorz Architecture Board on completion of the Independent Architecture Review of `Doc-4B_Content_v1.0_PassA.md` (decision: **APPROVE WITH PATCHES**; 3 BLOCKER, 3 MAJOR, 5 MINOR, 2 NITPICK).

It performs two functions:

1. **Resolves the in-document mandatory findings** — PA-B01 (BLOCKER) and PA-m01 / PA-m02 / PA-m03 (MINOR) — through targeted contract corrections.
2. **Routes the governance and upstream findings** — PA-M1, PA-M2, PA-M4, PA-M5, and the carried upstream dependency PA-M3 — in §5 (Board Decision Routing), **without resolving them by invention or interim architecture** (Doc-4A §0.6).

No finding is resolved by architecture change. Doc-4A is not reopened; no entity, aggregate, event, workflow, state machine, permission, or template is created; ownership and the Family Map are unchanged. **Formula-versioning ownership remains with Trust (`trust.trust_scores.trust_formula_version`, Doc-2 §10.6) — it is not moved into Module 0.**

---

## §3 — Scope Statement

This patch modifies the following locations in `Doc-4B_Content_v1.0_PassA.md` only:

| Location | Change | Finding |
|---|---|---|
| §A8 `core.admin_update_config_value.v1` — Request Contract | Remove `formula_version_bump`; add service-side responsibility note | PA-B01 |
| §A8 `core.admin_update_config_value.v1` — Response Contract | Add `formula_version_bumped` (visibility field) | PA-B01 |
| §A4 `core.audit_correlation_lookup.v1` — after Required Permissions | Add `Firewall-Compliance Declaration` (identical to sibling) | PA-m01 |
| §A4 `core.audit_record_query.v1` & `core.audit_correlation_lookup.v1` — Audit Requirements | Add `Access-Flagging` declaration (middleware responsibility) | PA-m02 |
| §A4 `core.audit_correlation_lookup.v1`; §A5 `core.admin_redact_audit_field.v1`; §A8 `core.admin_update_config_value.v1`; §A9 `core.admin_set_feature_flag.v1` — after Audit Requirements | Add `Entitlement References` / `Entitlements: none` | PA-m03 |

No other content is modified. Governance/upstream findings are **routed** in §5, not patched into contracts. NITPICKs n-01 and n-02 are out of the approved patch scope (addressed in §6.3).

---

## §4 — Patch Entries

---

### PATCH-PA-01 — Resolve PA-B01: formula versioning is service-determined, not caller-supplied

| Field | Value |
|---|---|
| Patch ID | PATCH-PA-01 |
| Finding Reference | PA-B01 (review B-01, **BLOCKER**) |
| Affected Contract | `core.admin_update_config_value.v1` (§A8 — Group 5) |

**Issue:**

The Request Contract exposes `formula_version_bump : boolean : optional : default false`, placing on the API caller the responsibility to know which POLICY keys affect scoring and to assert the formula-version increment per write. This contradicts Doc-3 §12.4 ("versioned **where it affects scoring** (`formula_version` bump)") — scoring relevance is a **property of the registered key** (Doc-3 §12.2), determinable service-side, not a runtime caller assertion. The `default false` path silently skips the increment for scoring-affecting keys, breaking the frozen explainability requirement (Doc-3: "any change to bands or weights increments the version"). Further, `formula_version` lives on `trust.trust_scores` (Doc-2 §10.6) — **not** owned by Module 0 — and `core.system_configuration` (Doc-2 §10.1: `key, value_jsonb, value_type, updated_by`) has no `formula_version` column.

**Correction:**

(1) In the Request Contract, **remove**:

```
formula_version_bump : boolean : optional : default false; true where the key affects scoring
                                             and Doc-3 §12.4 requires a formula_version increment
                                             (by pointer)
```

(2) In its place, **add the service-side responsibility note**:

```
(Doc-3 §12.4 requires a formula_version increment for POLICY keys that affect scoring. Scoring
relevance is determined SERVICE-SIDE from the key's metadata in the Doc-3 §12.2 registry — it is
NOT a caller-supplied parameter. The service MUST determine whether the changed key is a
scoring-formula input and, if so, trigger the formula_version increment in the Trust module
(trust.trust_scores.trust_formula_version, Doc-2 §10.6) through the integration single-authorship
channel (domain event or service call), authored in the Doc-4G/Doc-4E integration contracts per
Doc-4A §4. Formula-version ownership remains with Trust; Module 0 neither owns nor mutates it.)
```

(3) In the Response Contract, **add** (visibility for the ops dashboard, Doc-3 §12.4):

```
formula_version_bumped : boolean : conditional (key is scoring-relevant) : true if the service
                                   determined this change triggered a Trust formula_version increment
                                   per Doc-3 §12.4; absent when the key is not scoring-relevant
```

This establishes, normatively: **scoring relevance = determined from POLICY metadata (Doc-3 §12.2)**; **formula-version increment = determined by service logic, never caller-supplied**; **formula ownership stays in Trust (Doc-2 §10.6), not Module 0**; strict conformance to **Doc-3 §12.4** preserved.

**Rationale:**

Removes a client-responsibility mis-assignment and a default-false failure path that would silently break scoring explainability and mislead AI coding agents. It moves no ownership: the increment is triggered through the §4 integration channel into Trust, which retains the `formula_version` column. The added response field gives the Admin/ops dashboard the §12.4-required visibility without making the caller the authority. No new entity, event, or column is created here; the Trust-side integration is declared later in Doc-4G/Doc-4E.

---

### PATCH-PA-02 — Resolve PA-m01: add the missing Firewall-Compliance Declaration

| Field | Value |
|---|---|
| Patch ID | PATCH-PA-02 |
| Finding Reference | PA-m01 (review m-01, MINOR) |
| Affected Contract | `core.audit_correlation_lookup.v1` (§A4 — Group 1) |

**Issue:**

The sibling `core.audit_record_query.v1` carries a `Firewall-Compliance Declaration`; the correlation lookup omits it, despite identical firewall properties (same template 21.6, same actor, same entity `core.audit_records`, same §7.5 disclosure obligations). The omission could be read by an AI agent as "no firewall obligations," which is incorrect (Doc-4A §4B).

**Correction:**

In `core.audit_correlation_lookup.v1`, immediately after `### Required Permissions`, **add** (identical values to the sibling query):

```
### Firewall-Compliance Declaration
Signals-Read:        none-as-input (audit records may contain historical governance-signal values
                     as recorded facts; surfaced to compliance only per §7.5; never used as a
                     computation input — identical to core.audit_record_query.v1)
Signals-Written:     none
Mutation-Inputs:     none
Monetization-Inputs: none
Routing-Impact:      none
Disclosure:          audit content to platform-compliance / Super Admin audience only; §7.5 compliant
```

**Rationale:**

Editorial consistency across sibling contracts; no semantic change. The declaration states facts already true of the contract (no signal is read-as-input, written, or routed; disclosure is compliance-only). Satisfies the Doc-4A §4B per-endpoint declaration obligation.

---

### PATCH-PA-03 — Resolve PA-m02: declare the Super-Admin access-flagging mechanism on audit reads

| Field | Value |
|---|---|
| Patch ID | PATCH-PA-03 |
| Finding Reference | PA-m02 (review m-02, MINOR) |
| Affected Contracts | `core.audit_record_query.v1`, `core.audit_correlation_lookup.v1` (§A4 — Group 1) |

**Issue:**

Both reads declare `Audit-Required: no` (correct — a pure read produces no business audit record, §17.1), but neither declares how the Doc-2 §9 "Super Admin access (flagged)" obligation is satisfied. An AI agent implementing the endpoint would skip audit creation and, finding no flagging instruction, silently omit the required access flagging.

**Correction:**

In the `### Audit Requirements` block of **both** read contracts, **replace** the single `Audit-Required: no` line and its inline note **with**:

```
Audit-Required: no    ← no business audit record is produced by this read endpoint (§17.1)
Access-Flagging: yes  ← Doc-2 §9 (Platform) "Super Admin access (flagged)" is satisfied by the API
                        middleware/gateway layer, which records access when a staff_super_admin token
                        is used — independently of this contract, BEFORE this endpoint executes.
                        This is an infrastructure obligation (operational), distinct from a
                        contract-level business Audit Requirements declaration (§17.1 operational-vs-
                        business distinction). No new audit event or action is introduced — the
                        "Super Admin access (flagged)" action already exists in Doc-2 §9.
```

**Rationale:**

Makes the flagging responsibility explicit and locates it correctly (middleware, not the contract), closing the silent-gap risk for AI agents. It introduces **no new audit event and no new action** — "Super Admin access (flagged)" is an existing Doc-2 §9 Platform action — and preserves the §17.1 distinction between operational flagging and business audit.

---

### PATCH-PA-04 — Resolve PA-m03: complete template conformance with `Entitlements: none`

| Field | Value |
|---|---|
| Patch ID | PATCH-PA-04 |
| Finding Reference | PA-m03 (review m-03, MINOR) |
| Affected Contracts | `core.audit_correlation_lookup.v1` (§A4), `core.admin_redact_audit_field.v1` (§A5), `core.admin_update_config_value.v1` (§A8), `core.admin_set_feature_flag.v1` (§A9) |

**Issue:**

Template 21.1/21.6 includes an `Entitlement References` field. `core.audit_record_query.v1` declares it (`Entitlements: none`); the four contracts above omit the section, creating incomplete template adherence that the Doc-4A Appendix A checklist (CHK items) flags.

**Correction:**

In each of the four contracts, immediately after `### Audit Requirements` and before `### Operating Stage`, **add**:

```
### Entitlement References
Entitlements: none    ← Module 0 platform-infrastructure access is permission-slug-controlled only;
                        not entitlement-gated (Doc-4A §18.3 — entitlements never gate infrastructure,
                        trust, eligibility, routing, or verification)
```

**Rationale:**

Editorial template completeness; no behavioral change. `Entitlements: none` is the correct and only valid value for Module 0 (infrastructure is never entitlement-gated, §18.3). Brings all five Admin contracts to uniform template conformance.

---

## §5 — Board Decision Routing

The following findings are **not resolved by this patch**. They are routed for Board decision or upstream patch. No interim architecture is invented (Doc-4A §0.6); the Pass-A contracts remain conformant under their documented interim bindings.

### D-1 — Template Composition Convention (PA-M1)

**Status: `BOARD DECISION REQUIRED`**

The internal infrastructure primitives (`core.allocate_human_reference`, `core.append_audit_record`, `core.write_outbox_event`) and runtime reads (`core.config_value_query`, `core.feature_flag_evaluate`) are composed from Templates 21.3/21.4 with explicit non-recursion annotations (frozen structure D-1 Option b). The composition is architecturally sound but produces template friction (21.4 mandates audit/event declarations that infrastructure primitives must declare `none`/`n/a`). **Decision:** (a) ratify the D-1 Option b composition convention — endorsing the non-recursion annotations (and the `Audience: internal-service` marker, NITPICK n-02) as the canonical pattern for infrastructure primitives across Doc-4C…4K; **or** (b) accelerate the deferred Internal Service Contract template via a Doc-4A patch. *Routed, not resolved.*

### D-2 — Permission Granularity (PA-M2)

**Status: `UPSTREAM DOC-2 PATCH REQUIRED`**

Audit read, system-configuration change, and feature-flag management bind to the existing `staff_super_admin` (valid; not invented). For least privilege, a Doc-2 §7 additive patch should introduce `staff_can_read_audit`, `staff_can_manage_system_configuration`, and `staff_can_manage_feature_flags`. **Not a freeze-blocker** — `staff_super_admin` governs in the interim; the contracts are correct as written. *Routed for a Doc-2 §7 additive patch.*

### D-4 — Configuration Governance Boundary (PA-M4)

**Status: `BOARD DECISION REQUIRED`**

Doc-2 §16.2 assigns "system configuration policy" to Module 8 (Admin Operations / Doc-4J); the frozen Doc-4B structure §7.2 places the configuration-change contract in Doc-4B (Module 0). **Decision:** confirm either (a) Doc-4B owns the change contract end-to-end (Module 8 governs through the `staff_*` slug + audit trail; no separate Doc-4J contract), **or** (b) "Module 8 decides; Module 0 stores" — Doc-4J authors the governance/ratification layer and Doc-4B authors the atomic write, interacting via service call or event. No ownership is moved by this patch. *Routed, not resolved.*

### D-5 — Outbox Audit Granularity (PA-M5)

**Status: `BOARD DECISION REQUIRED`**

The outbox dispatcher/archiver bind `Action-Ref` to the generic Doc-2 §9 "service-role sensitive operations" at dispatch-run/batch granularity. **Decision:** (A) treat outbox delivery as operational telemetry (`Audit-Required: no`) — requires a Doc-4A clarification reconciling with Template 21.5's mandatory-audit; (B) keep the generic interim action at run granularity + a Doc-4A clarification; or (C) add dedicated Doc-2 §9 actions (e.g., `outbox_dispatch_run`, `outbox_archive_run`). Per-event audit is rejected as recursive (auditing the delivery of audit events); per-run is operationally correct. Interim binding remains conformant pending the decision. *Routed, not resolved.*

### Carried upstream dependency — PA-M3 (Infrastructure POLICY Key Registration)

**Status: `UPSTREAM DOC-3 §12.2 PATCH REQUIRED`**

All `core.system_configuration.core.*` keys referenced by Pass-A (audit pagination/rate/dedup; outbox dispatch/retry/DLQ/archive; config/flag change reason-min & dedup windows — the `[PA-E1]` markers) are **absent from the Doc-3 §12.2 inventory**. Per Doc-4A §18.2, keys must be registered before the referencing contracts can freeze; inventing them is forbidden (correctly not done). The Pass-A contracts are **structurally correct** — they cite the intended key names with `[PA-E1]` markers. **Resolution:** an additive Doc-3 §12.2 patch registering the `core.system_configuration.core.*` key block (no change to existing keys). *Routed; freeze of the affected contracts is gated on this patch. Not a board decision — a board-authorized Doc-3 patch.*

---

## §6 — Impact Analysis

### 6.1 Architecture Integrity

| Invariant | Affected? | Assessment |
|---|---|---|
| One Entity = One Owner | No | No entity ownership changed |
| Module boundary integrity | No | Only Module 0 contracts touched; PA-B01 correction **removes** an implied Module-0→Trust formula trigger, strengthening the boundary |
| Ownership integrity | No | Formula-version ownership stays in Trust (Doc-2 §10.6); config-governance ownership routed (D-4), not moved |
| Family Map (Doc-4A §1.3) | No | Unchanged |
| State machines (Doc-2 §5) | No | None touched; `State-Machine-Effects: none` preserved |
| Events (Doc-2 §8) | No | No event coined; PA-B01 references the §4 integration channel for the Trust bump, defined later in Doc-4G/Doc-4E — not here |
| Permissions (Doc-2 §7) | No | No slug coined; D-2 routed |
| Templates (Doc-4A §21) | No | No template created; PA-m01/m03 complete existing-template fields |
| Audit actions (Doc-2 §9) | No | No action coined; PA-m02 binds to the existing "Super Admin access (flagged)" |
| Doc-4A corpus | No | Not reopened |

### 6.2 Finding Disposition Summary

| Finding | Severity | Disposition in this patch |
|---|---|---|
| PA-B01 (B-01) | BLOCKER | **Resolved** (PATCH-PA-01) |
| PA-m01 (m-01) | MINOR | **Resolved** (PATCH-PA-02) |
| PA-m02 (m-02) | MINOR | **Resolved** (PATCH-PA-03) |
| PA-m03 (m-03) | MINOR | **Resolved** (PATCH-PA-04) |
| PA-M1 | MAJOR | **Routed** — D-1 (Board decision) |
| PA-M2 | MAJOR | **Routed** — D-2 (Doc-2 §7 patch) |
| PA-M3 | BLOCKER | **Routed** — upstream Doc-3 §12.2 patch |
| PA-M4 | MAJOR | **Routed** — D-4 (Board decision) |
| PA-M5 | BLOCKER | **Routed** — D-5 (Board decision) |

### 6.3 NITPICKs (out of approved patch scope — noted)

- **n-01** (`Correlation: both` on `Events-Produced: none` contracts): reviewed; **no change**. Per Doc-4A §17.7, `Correlation: both` denotes "reference_id **and** idempotency_key present in the audit record" — **not** "reference_id + phase2-origin." The redaction/config/flag contracts each carry both a `reference_id` and a required idempotency key, so `both` is the conformant value. (The finding rests on reading "both" as a Phase-2 linkage; §17.7 defines it otherwise.)
- **n-02** (`Audience: internal-service` marker): retained as an AI-agent-safety convention; its formalization is folded into the D-1 decision (ratify the convention, or define it when accelerating the Internal Service Template). No contract change.

### 6.4 Validation Self-Review (Board-required no-change checklist)

| Criterion | Result |
|---|---|
| No architecture changes introduced | PASS |
| No ownership changes introduced | PASS (formula ownership stays in Trust; config governance routed, not moved) |
| No module boundary changes introduced | PASS (PA-B01 strengthens the Module 0 boundary) |
| No new entities introduced | PASS |
| No new permissions introduced | PASS |
| No new events introduced | PASS |
| No new workflows introduced | PASS |
| No new state machines introduced | PASS |
| No new templates introduced | PASS |
| Doc-4A not reopened; Family Map unchanged | PASS |
| All mandatory review findings resolved (PA-B01, PA-m01, PA-m02, PA-m03) | PASS |
| Governance/upstream findings routed, not resolved by invention (PA-M1/M2/M3/M4/M5) | PASS |
| Formula versioning not moved into Module 0 | PASS |

---

## §7 — Pass-B Readiness Statement

Upon application of PATCH-PA-01 through PATCH-PA-04, the Architecture Board may find that:

1. The new in-document **BLOCKER (PA-B01)** is resolved — `formula_version_bump` is removed; formula versioning is service-determined from POLICY metadata and triggered into Trust via the §4 integration channel; a `formula_version_bumped` visibility field is added. Formula ownership remains with Trust.
2. All three **MINOR** findings (PA-m01, PA-m02, PA-m03) are resolved — firewall declaration consistency, Super-Admin access-flagging responsibility, and `Entitlements: none` template completeness.
3. The **MAJOR/upstream BLOCKER** findings are formally routed: D-1 (composition convention), D-2 (Doc-2 §7 least-privilege slugs), D-4 (config governance boundary), D-5 (outbox audit granularity), and PA-M3 (Doc-3 §12.2 key registration).

**Gate conditions for Doc-4B Pass-B authorization** (mirroring the review):

| # | Condition | Status after this patch |
|---|---|---|
| 1 | PA-B01 corrected in-document | **Done** (PATCH-PA-01) |
| 2 | PA-m01/m02/m03 corrected in-document | **Done** (PATCH-PA-02/03/04) |
| 3 | PA-M3 routed for a Doc-3 §12.2 additive patch | **Routed** (Board to authorize the patch) |
| 4 | PA-M5 Board adjudication (D-5) recorded | **Routed** (Board decision pending) |
| 5 | PA-M4 Board adjudication (D-4) recorded | **Routed** (Board decision pending) |
| 6 | PA-M1 Board adjudication (D-1) recorded | **Routed** (Board decision pending) |
| 7 | PA-M2 routed for a Doc-2 §7 additive patch (D-2) | **Routed** (interim `staff_super_admin` valid) |

**Recommended Board action:**

> **Doc-4B Pass-A — Review Findings Resolved.**
>
> Apply this patch (the corrected Pass-A = `Doc-4B_Content_v1.0_PassA.md` + this patch). Record the D-1, D-4, D-5 Board decisions and authorize the D-2 (Doc-2 §7) and PA-M3 (Doc-3 §12.2) additive patches at or before the Pass-A freeze gate.
>
> **Authorize `Doc-4B_Content_v1.0_PassB` authoring** against the corrected Pass-A — no further Pass-A review cycle is required. The routed governance/upstream items (D-1, D-2, D-4, D-5, PA-M3) are carried as Pass-gate conditions and resolved through their named channels; none blocks the start of Pass-B authoring except where a contract's freeze depends on it (PA-M3 key registration; D-5 audit-action decision).

---

*Doc-4B Pass-A Review Resolution Patch v1.0.1 — 1 BLOCKER (PA-B01) + 3 MINOR (PA-m01/02/03) resolved in-document; 2 BLOCKER (PA-M3, PA-M5) + 3 MAJOR (PA-M1, PA-M2, PA-M4) routed. No architecture, ownership, boundary, entity, permission, event, workflow, state-machine, or template change. Doc-4A not reopened; Family Map unchanged. Status: **PASS-A FINDINGS RESOLVED — PASS-B AUTHORIZED (subject to routed gate conditions)**.*
