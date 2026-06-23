# Independent Architecture Review — Doc-4A Content v1.0, Pass 5 (§18–§21, Appendices A–C)

**Reviewer roles:** Principal Enterprise Architect · Principal API Governance Architect · Principal Contract Governance Architect · Principal AI-Agent Systems Reviewer · Principal Documentation Architect · Principal Conformance Framework Reviewer  
**Corpus consulted:** Master_System_Architecture_v1.0_FINAL.md; ADR_Compendium_v1.md; Doc-2 v1.0.3 (incl. Doc2_Patch_v1.0.2 + Doc-2_Patch_v1.0.3); Doc-3 v1.0.2 (Doc-3_Patch_v1.0.2); Doc-4A Pass 1 (§0–§3, FROZEN), Pass 2 (§4–§8, FROZEN), Pass 3 (§9–§12, FROZEN, Patch v1.0.1 applied), Pass 4 (§13–§17, FROZEN, Patch v1.0.1 applied)  
**Review scope:** §18 Policy/Configuration/Entitlement Binding Standard; §18B Operating Stage Standard; §19 Rate Limiting & Quota Standard; §20 Contract Versioning & Evolution Standard; §21 Canonical Contract Templates; Appendix A Conformance Checklist; Appendix B Error Catalog & Namespace Registry; Appendix C Authoring Checklist  
**Not reviewed:** structure, completeness, new features, or anything outside the eight sections above  
**Reviewer status:** Independent — not the author of the reviewed document

---

## Review Summary

Pass 5 is the strongest and most complete pass in the series. The FIXED/POLICY/ORG trichotomy (§18), the operating-stage model (§18B), the quota-vs-throughput distinction (§19), and the contract evolution classification table (§20) are precise and consistent with the frozen corpus. The template set (§21) is substantially complete and resolves the principal multi-entity State Machine Effects gap (Pass 4 F-001), the Privacy-Review grammar gap (Pass 4 F-009), the phase2-origin Correlation gap (Pass 4 F-014), and the Phase-2 navigation pointer ambiguity (Pass 4 F-007).

The independent review identifies **1 BLOCKER, 5 MAJORs, 7 MINORs, and 3 NITPICKs.** The BLOCKER is a forward reference in normative text (§21) to six conformance checks — CHK-231 through CHK-236 — that do not exist in Appendix A. Every AI agent and human reviewer directed to run these checks will hit an unresolvable reference. This is an editorial gap, not a design failure, and it is easily patched. Of the five MAJORs, three are template-layer defects: Template 21.6 (Admin) is missing its Events Produced section; the Rate Limit block grammar is stated differently in §19.3 and Template 21.1; and the §18.5 FIXED-rule declaration grammar is scoped only to the BUSINESS validation category, leaving FIXED rules that arise in categories V1–V7 without a declaration pattern. The remaining two MAJORs address: (1) an unresolved carry-forward from Pass 4's F-015 — Appendix A has no check distinguishing business-critical audit scope from operational write side effects; and (2) the §19.4 QUOTA-error disclosure rule for delegated operations, which creates a protected-fact obligation that has no corresponding template annotation to guide AI agents.

---

## Section A — Entitlement Standard Review (§18)

### Review Summary

§18 is well-constructed. The FIXED/POLICY/ORG trichotomy table is complete and unambiguous. The entitlement MAY/MUST-NOT gate lists correctly encode ADR-011 and Doc-3 §12.1 invariants. The POLICY key referencing format is canonical. Three gaps were identified.

---

**F-001 | MAJOR | §18.5 — FIXED Rule Declaration Grammar Is Scoped Only to BUSINESS Category (V8); No Pattern for FIXED Rules in Categories V1–V7**

**Description:** §18.5 defines the FIXED rule declaration grammar as:

```
V<n> : BUSINESS : <condition — FIXED per Doc-3 §12.1 by pointer; no POLICY override> : Doc-3 §12.1 : BUSINESS
```

This grammar canonically positions FIXED invariants in the V8/BUSINESS validation category. However, several Doc-3 §12.1 FIXED rules arise in other categories:

- **Non-disclosure indistinguishability** (Doc-3 §12.1; §7.5): manifest at V4/SCOPE — blacklisted or excluded vendors produce the same NOT_FOUND response as vendors that never matched. This is a SCOPE-layer enforcement, not a BUSINESS rule.
- **Blacklist floor** (Doc-3 §12.1): manifest at V4/SCOPE — absolute gate, not a business-corpus rule.
- **System-actor exclusivity for certain transitions** (§13.5): manifest at V2/CONTEXT — only the System actor may drive Phase-2 transitions.
- **No-fabricated-activity** (Doc-3 §12.1 §15.4): this one correctly sits at V8/BUSINESS.

An AI agent following §18.5 literally will attempt to place ALL FIXED invariants in V8/BUSINESS, violating the §11.2 category-order rule (SCOPE must precede BUSINESS). Alternatively, the agent will split the rule — placing the BUSINESS-category form at V8 and creating a separate V4 line with no "no POLICY override" annotation, leaving the FIXED status of the V4 enforcement invisible.

**Risk:** Non-disclosure FIXED rules authored by AI agents into wrong validation categories, breaking the §11.2 category order. Or: FIXED rules placed at V4/SCOPE without the canonical annotation, making them indistinguishable from POLICY-tunable SCOPE rules during Appendix A review.

**Recommended change:** Amend §18.5 to read: "FIXED rules must be declared in their correct validation category per §11.2 (not forced into V8/BUSINESS). In every applicable category, the constraint field carries the FIXED annotation: `FIXED per Doc-3 §12.1 <subsection pointer>; no POLICY override`. The V8/BUSINESS grammar shown above is the canonical form for FIXED rules that arise at the business-logic layer; the same pattern applies in any category. Example for V4/SCOPE: `V4 : SCOPE : <blacklist floor — FIXED per Doc-3 §12.1; no override> : Doc-3 §12.1 : NOT_FOUND | AUTHORIZATION`."

---

**F-002 | MINOR | §18.3 — "Access to Non-Disclosure Obligations" Entitlement Exclusion Is Ambiguous**

**Description:** The final bullet in §18.3's MUST-NOT gate list reads: "Access to the platform's non-disclosure obligations (§7.5)." Non-disclosure obligations are platform invariants (FIXED, not conditional on entitlement). The phrasing "access to non-disclosure obligations" could be read as: (a) an entitlement gate controls whether the platform applies non-disclosure rules (the intended meaning: it must not), or (b) there is a feature called "access to non-disclosure" that entitlements control.

**Risk:** An AI agent parsing the entitlement exclusion list might generate a contract that gates non-disclosure application behind an entitlement check, reading the item as naming a gateable feature rather than a non-gateable invariant.

**Recommended change:** Rephrase to: "Non-disclosure obligations (§7.5) — entitlement gates MUST NOT alter whether the platform applies non-disclosure rules; they apply identically regardless of entitlement status."

---

**F-003 | MINOR | §18.4 — ORG Setting References Have No Grammar Block**

**Description:** §18.2 defines POLICY key referencing with a canonical grammar block (`core.system_configuration.<domain>.<key_name>`). §18.3 defines entitlement referencing with a grammar block (`Entitlement-Gate: <entitlement_key> via Monetization service (Doc-4I)`). §18.4 describes ORG setting references with three prose obligations (declare the setting name, whether it is POLICY-bounded, and the absent-value read behavior) but provides no grammar block. AI agents have no canonical form for ORG setting declarations and will invent varied formats across Doc-4B–4N.

**Risk:** Non-uniform ORG setting declarations across module contracts; Appendix A has no CHK item checking ORG setting declaration format.

**Recommended change:** Add a grammar block to §18.4:

```
ORG-Setting:   <setting_name> via <owning_module> configuration contract (by pointer)
Bounded-By:    core.system_configuration.<ceiling_key> | unbounded — <corpus basis>
Absent-Value:  core.system_configuration.<default_key> | <fixed default value — FIXED, cite basis>
```

---

## Section B — Operating Stage Standard Review (§18B)

### Review Summary

§18B is well-designed. The invariant in §18B.3 — that human-assisted Stage A operations apply all platform FIXED rules identically — is critical and clearly stated. The stage_b+ shorthand is useful. One typographic error in the grammar block and one governance gap were identified.

---

**F-004 | MINOR | §18B.2 — Typographic Error in Stage-Availability Grammar: `stage_c` Appears Twice**

**Description:** The Stage-Availability grammar line reads:

```
Stage-Availability: all | stage_a | stage_b | stage_c | stage_b+ | stage_c
```

`stage_c` appears twice — once as a standalone option and once at the end after `stage_b+`. This is clearly a typographic error (the correct set is `all | stage_a | stage_b | stage_c | stage_b+`). However, an AI agent parsing the grammar literally could interpret the trailing `stage_c` as a sixth option separate from the earlier `stage_c`, or read `stage_b+ | stage_c` as a compound option.

**Risk:** AI agents producing Stage-Availability declarations with unexpected values, or treating `stage_b+` and the trailing `stage_c` as distinct alternatives rather than recognizing `stage_b+` as the shorthand for `stage_b` and `stage_c`.

**Recommended change:** Remove the trailing `| stage_c`. Correct grammar: `Stage-Availability: all | stage_a | stage_b | stage_c | stage_b+`.

---

**F-005 | MINOR | §18B.4 — No Stage-Transition Event Specified**

**Description:** §18B.4 defines stage transitions as platform-operator-driven configuration deployments updating `platform.operating_stage`. The standard correctly prohibits tenant-triggered or Admin-triggered stage transitions. However, it does not specify whether the platform emits an observable event when the operating stage changes. Contracts with `Stage-Availability` declarations conditional on the stage value need to react to stage changes (e.g., activating or deactivating contract surfaces). Without a declared stage-transition event, module contracts cannot express consuming behavior.

**Risk:** Stage transitions produce no traceable event chain. Module contracts that activate at stage_b cannot declare a consuming trigger. The event catalog binding required by Doc-2 §8 (and enforced by CHK-171) has no entry for this transition.

**Recommended change:** Add to §18B.4: "Stage transitions MUST emit a platform-level event per the transactional outbox pattern (§16.2). The event name, payload, and emitting module are declared in Doc-2 §8 by the Platform Core module (Doc-4B). No module contract may coin this event; they consume it by pointer per the Events Consumed grammar (§16.3)." If no Doc-2 §8 event currently exists for stage transitions, a Doc-2 patch is required before any module contract can declare Stage-Availability that reacts to the transition.

---

## Section C — Rate Limiting Standard Review (§19)

### Review Summary

§19 correctly distinguishes quota from throughput, ties error classes to limit types, and handles delegation attribution cleanly. One format inconsistency between §19.3 and Template 21.1 is a MAJOR finding because it will produce mixed contract formats across all module documents.

---

**F-006 | MAJOR | §19.3 vs Template 21.1 — Rate Limit Block Grammar Is Stated Inconsistently**

**Description:** §19.3 defines the Rate Limit declaration grammar with a `Rate-Limit:` wrapper label followed by indented sub-fields:

```
Rate-Limit:
  V<n>-Type:      quota | throughput
  Policy-Key:     core.system_configuration.<key>
  Attribution:    organization | delegation-controlling-organization | platform
  Reset-Interval: core.system_configuration.<reset_key> | not-applicable
  Error-Class:    QUOTA | RATE_LIMITED
```

Template 21.1 (the normative authoring template) shows the Rate Limits section as:

```
### Rate Limits [OMIT-IF-NONE]
Rate-Limits: none
[OR:]
V<n>-Type:      quota | throughput
Policy-Key:     core.system_configuration.<key>
...
[Repeat block for each V<n> limit rule]
```

The template shows the "empty" case as `Rate-Limits: none` (plural) and the populated case with bare field names — no `Rate-Limit:` wrapper. §19.3 uses singular `Rate-Limit:` as a parent-block label. The section standard (§19.3) and the template (21.1) are inconsistent in two ways: the presence/absence of the wrapper label, and singular (`Rate-Limit:`) vs plural (`Rate-Limits:`).

An AI agent filling in Template 21.1 will use the bare-field format. An AI agent following §19.3 will use the wrapper format. Appendix A has no CHK item specifying which format is canonical. Cross-document review will encounter two conformant-looking but differently-structured Rate Limits sections.

**Risk:** Non-uniform Rate Limit blocks across all Doc-4B–4N contracts; format ambiguity in automated conformance tooling.

**Recommended change:** Align §19.3 to match Template 21.1's format exactly. The template format is the operative standard because contracts are authored against templates. If the `Rate-Limit:` wrapper label is desired for per-block clarity, add it to Template 21.1 explicitly. Either way, one canonical format must be chosen and declared in both §19.3 and the templates. Add CHK-215-level note specifying the canonical format.

---

**F-007 | MINOR | §19.4 — QUOTA Error Disclosure Rule for Delegated Operations Has No Template Annotation**

**Description:** §19.4 establishes a specific disclosure rule for QUOTA errors in delegated contexts: the Controlling Organization's quota state MAY be disclosed to the Controlling Organization; the representative MUST NOT see it unless their grants authorize it. CHK-132 correctly flags "QUOTA error reveals exhausted party only to entitled parties" as a BLOCKER check.

However, neither Template 21.1 nor Template 21.4 contains any annotation in their Rate Limits sections directing AI agents to add a corresponding Error-Boundary entry for QUOTA errors in delegated contracts. The Error-Boundary template block shows only V4 and V5 examples with a generic "[One line per failure point with protected-fact exposure]" instruction. An AI agent authoring a delegated contract with a V9/QUOTA rule would fill in the Rate Limits section and might not recognize the V9 QUOTA failure as a "protected-fact exposure" case requiring an Error-Boundary entry, especially since QUOTA errors are categorically different from resource-existence protected-fact cases.

**Risk:** AI-authored delegation-eligible contracts pass the Rate Limits template fill without declaring an Error-Boundary entry for V9/QUOTA, producing conforming-looking contracts that fail CHK-132 at review.

**Recommended change:** Add an annotation to the Rate Limits section in Templates 21.1, 21.4, and 21.5: "[For delegation-eligible contracts with quota-type limits: add a V<n> QUOTA line to Error Boundary declaring quota-party disclosure per §19.4]". Additionally, add to the Error-Boundary block: `V<n> : QUOTA — controlling-org quota disclosed per §19.4; representative not entitled unless grant authorizes  [if Delegation: eligible and V<n>-Type: quota]`.

---

## Section D — Contract Evolution Standard Review (§20)

### Review Summary

§20 is the clearest and most complete section in Pass 5. The contract-vs-domain-change distinction, the breaking-change classification table, and the deprecation pattern are all precisely specified. Two minor gaps were identified.

---

**F-008 | MINOR | §20.2 — Change Classification Table Has No Row for "New Entitlement Key"**

**Description:** §20.2's change classification table covers "new POLICY key" (Domain change → Doc-3 §12 patch first) but has no row for "new entitlement key." Entitlement keys are referenced in contracts via the `Entitlement-Gate: <key> via Monetization service` grammar (§18.3). When an AI agent authors a contract that needs a new entitlement key, the table provides no classification guidance. The self-review (P5-m3) accepted this gap on the grounds that entitlement key registration belongs in Doc-4I — but the acceptance defers the problem without resolving it for AI agents operating in the interim.

**Risk:** AI agents authoring contracts with new entitlement keys will either invent the key inline (nonconforming per §18.3 and CHK-201) or find no process guidance in §20.2 and halt with an escalation (correct, but not guided by the table).

**Recommended change:** Add a row to the §20.2 table: `New entitlement key | Domain change | N/A — Monetization service (Doc-4I) entitlement catalog patch first | Post-patch contract update`. This makes the escalation path explicit rather than implied.

---

**F-009 | MINOR | §20.4 — Deprecation Pattern Applies Only to Deployed Contracts; No Guidance for Draft/Approved Status**

**Description:** §20.4's deprecation mechanics (Deprecated-At, Removal-Window, Successor fields) assume a contract that has been deployed to callers. Template 21.1 Header includes `Status: draft | approved | deprecated` as valid status values. However, §20.4 provides no process for transitioning a `draft` or `approved` contract to `deprecated`, nor for removing a never-frozen contract. Can a draft contract be removed without a breaking-change declaration? Can a draft with active review be deprecated and what is the Removal-Window for an undeployed contract?

**Risk:** AI agents encountering a draft contract that should be removed have no §20.4 process to follow, potentially treating it as requiring the full Removal-Window migration cycle intended for production-deployed contracts.

**Recommended change:** Add a note to §20.4: "The deprecation pattern applies to contracts at Status: approved or deployed. A contract at Status: draft that has not been frozen may be removed via a Doc-4 patch with no Removal-Window requirement, provided no module document in any frozen Doc-4B–4N document references it by Contract-ID."

---

## Section E — Templates Review (§21) — HIGHEST PRIORITY

### Review Summary

The six templates are the primary deliverable of Pass 5 and the primary interface for AI agents authoring module contracts. The critical Pass 4 gaps — multi-entity State Machine Effects format (F-001), Privacy-Review field in Events Produced (F-009), and phase2-origin Correlation (F-014) — are all correctly resolved in the templates. Template 21.5 (System Actor) is particularly well-constructed, with all four Phase-2 mandatory fields pre-declared as FIXED. Three MAJOR and two MINOR template gaps were identified.

---

**F-010 | BLOCKER | §21 Normative Text + Appendix A — CHK-231 Through CHK-236 Referenced in §21 but Do Not Exist in Appendix A**

**Description:** The §21 section opening states: "Deviation from a template's field set, field order, or fill grammar is a conformance failure (Appendix A, CHK-231 through CHK-236)."

Appendix A's highest-numbered check is CHK-223 (Contract Evolution group). There is no conformance check group for Template Conformance, and CHK-231 through CHK-236 are not defined anywhere in Appendix A.

This is a broken normative reference in Pass 5's most critical section. Every AI agent and human reviewer executing the conformance checklist against a Doc-4B–4N contract will encounter this reference and find nothing. The template conformance checks — verifying field presence, field order, and fill grammar against each applicable template — are described as machine-executable (per the Appendix A introduction) but the actual check criteria have not been written.

**Risk:** Template conformance cannot be mechanically verified. CHK-231 through CHK-236 are the primary backstop against AI agents producing structurally non-conforming contracts. Without these checks, a contract that uses the wrong template, omits mandatory sections, or inverts field order passes Appendix A without challenge.

**Recommended change:** Add a "Template Conformance" section to Appendix A, defining at minimum:

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-231 | Applicable template selected per §21 selection guide | §21 | B |
| CHK-232 | All mandatory sections present per applicable template (no section omitted without [OMIT-IF-NONE] annotation) | §21 | B |
| CHK-233 | Section order matches template (no reordering of sections) | §21 | M |
| CHK-234 | Pre-declared FIXED fields not overridden (Actor-Types: System in 21.5; Idempotency: not-applicable in 21.3; State-Machine-Effects: none in 21.3) | §21 | B |
| CHK-235 | Specialization constraints not removed (21.3–21.6 inherit all 21.1 MUST obligations not explicitly overridden) | §21 | B |
| CHK-236 | Fill grammar for each field matches the template grammar block (no free-text substitutions for structured grammar fields) | §21 | M |

---

**F-011 | MAJOR | Template 21.6 (Admin Contract) — Events Produced Section Missing**

**Description:** Template 21.6 (Admin Contract) is a specialization of Template 21.1. Its section order is: Header, Required Permissions, Firewall-Compliance Declaration [CONDITIONAL], Request Contract [as 21.1], Response Contract [as 21.1], Validation Rules, Error Behavior [as 21.1], State Machine Effects, Idempotency, Audit Requirements, Operating Stage [CONDITIONAL], Rate Limits [OMIT-IF-NONE].

There is no `### Events Produced` section. Admin mutations produce events — for example, moderation decisions produce state-transition events (e.g., an Admin moderation action on an RFQ triggers the `under_review → draft` or `under_review → matching` transition with corresponding events per Doc-2 §8 and Doc-3 Patch D3-04). CHK-170 states: "Events-Produced field present (or 'none') — absence is nonconforming for mutating contracts" [B].

Template 21.4 (Command) explicitly requires Events Produced with the annotation: "← MANDATORY; populate or declare 'none'". Template 21.6 provides no equivalent. AI agents authoring Admin contracts using Template 21.6 will produce contracts with no Events Produced declaration, which are structurally nonconforming per CHK-170 but the template provided no signal that this section is required.

**Risk:** All Admin mutation contracts authored by AI agents against Template 21.6 will fail CHK-170. Moderation, verification, and admin override events will not be declared in Admin contracts.

**Recommended change:** Add to Template 21.6, between Idempotency and Audit Requirements:

```
### Events Produced                                  ← MANDATORY for Admin mutations; populate or declare "none"
Events-Produced: none
[OR — for Admin contracts that trigger state transitions with corpus-defined events:]
Event:          <event_name — per Doc-2 §8; never coined here>
Version:        <integer ≥ 1>
Trigger:        <Admin action in this contract causing emission>
Payload:        <field : type : always|conditional : source pointer — thin per §16.5>
Outbox:         yes
Source-Ref:     Doc-2 §8.<event_entry> [as amended by <PATCH-ID> per §3.5]
Privacy-Review: §7.5 compliant
[Repeat Event block for each event produced]
```

---

**F-012 | MAJOR | Template 21.6 (Admin Contract) — Concurrency and Async Declaration Sections Absent Without Explanation**

**Description:** Template 21.6 transitions directly from Idempotency to Audit Requirements, with no Concurrency or Async Declaration section. Template 21.4 (Command) explicitly requires both for applicable Admin-equivalent mutations.

- **Concurrency:** Admin contracts that update entities (e.g., admin updating a vendor profile, admin overriding a trust score) face concurrent update scenarios. Template 21.4 requires `Concurrency: optimistic | none — <justification>` for update commands. Template 21.6 provides no guidance, meaning AI agents will produce Admin update contracts without concurrency declarations.
- **Async Declaration:** Admin contracts may trigger Phase-2 work (e.g., an Admin moderation approval triggers the §15 matching async pipeline). Template 21.4 provides the Async Declaration grammar. Template 21.6 does not.

This is separate from F-011 (Events Produced); this finding covers the workflow-critical sections that govern execution semantics.

**Risk:** AI-authored Admin update contracts will lack concurrency tokens, making them vulnerable to lost-update bugs on concurrent admin actions. Admin contracts triggering async Phase-2 work will not declare Phase-2 navigation pointers.

**Recommended change:** Add to Template 21.6, after the Idempotency section and before Events Produced (proposed in F-011):

```
### Concurrency [CONDITIONAL — Admin update commands that modify versioned entities]
Concurrency: optimistic
Token:       updated_at | <named field>
[OR where justified:]
Concurrency: none — <documented justification per §14.5>

### Async Declaration [CONDITIONAL — Admin commands that trigger Phase-2 work]
Execution: sync
[OR:]
Execution:    async
Phase-1:      <validation categories satisfied; state reached; events emitted; audit recorded>
Phase-2:      <navigation pointer — owning module; triggering event per Doc-2 §8;
               State Machine Effects, Audit Requirements, and Events Produced for Phase-2
               work declared in Phase-2 module's own System-actor contract>
Observation:  <Query contract name | push channel POLICY key | poll interval POLICY key>
```

---

**F-013 | MINOR | Template 21.3 (Query Contract) — V4 SCOPE Error Class Pre-Resolved to NOT_FOUND Only Without Explanation**

**Description:** In Template 21.1, V4/SCOPE maps to `NOT_FOUND | AUTHORIZATION` — the Error-Boundary block resolves which class applies per §11.2's dual-class mapping rule. In Template 21.3 (Query), V4 is pre-resolved to `NOT_FOUND` only:

```
V4 : SCOPE : [resource scoped to active org or grant-accessible] : §7.3 : NOT_FOUND
```

The Error Boundary also shows only `V4: NOT_FOUND | collapse-rule` with no AUTHORIZATION option. This pre-resolution is probably correct for queries (scope failure on a read is always treated as NOT_FOUND to prevent existence inference), but §11.2 defines the dual-class mapping as the base rule for Category 4. The template overrides this without an explanatory annotation.

**Risk:** AI agents authoring a query where the resource genuinely exists but the requester lacks read access (a legitimate AUTHORIZATION scenario) will produce NOT_FOUND per the template — which may be correct for non-disclosure reasons but should be a conscious authoring decision, not a silent default.

**Recommended change:** Add annotation to the Template 21.3 V4 line: `V4 : SCOPE : [resource scoped to active org or grant-accessible] : §7.3 : NOT_FOUND  ← query scope failures always NOT_FOUND (§7.5 non-disclosure; existence inference prevention)`.

---

**F-014 | MINOR | Multi-Entity State Machine Effects Block Uses `#` Markdown Heading Syntax Not Defined in §3.3 Grammar Notation**

**Description:** Template 21.1's State Machine Effects grammar uses `# <entity name>` as a separator between multi-entity blocks:

```
[Additional entity blocks for multi-entity aggregates, ordered root-first, each preceded by # <entity name>]
```

This resolves Pass 4's F-001 (multi-entity format undefined). However, `#` is markdown heading syntax. §3.3 defines the contract grammar notation standard, and the templates appear inside markdown code fences where `#` would be interpreted as a comment or heading depending on the parser. The notation is not defined in §3.3 as a grammar construct.

**Risk:** AI agents trained to produce the grammar notation from §3.3 may use different separators (e.g., `---`, blank line, or a `[2]` numeric prefix as recommended by the Pass 4 F-001 fix). Appendix A CHK-139 requires the correct ordering but does not specify the `#` separator format. The format is not machine-verifiable because it is not in the grammar notation standard.

**Recommended change:** Add to §3.3 (or §13.2 as a grammar extension) a formal definition of the multi-entity block separator: "Within a State Machine Effects block, multiple entity sub-blocks are separated by a labeled block header using the `# <entity name>` notation, where `<entity name>` is the entity's canonical name per §3.1. This notation is grammar, not markdown — parsers treat it as a label prefix." Update CHK-139 to reference the `# <entity name>` format explicitly.

---

## Section F — Appendix A Conformance Checklist Review — CRITICAL

### Review Summary

Appendix A is comprehensive — 96 checks covering all eight pass standards is the correct depth for a platform intended to govern AI-generated contracts over years. The Pass 4 Patch v1.0.1 additions (CHK-155, CHK-161, CHK-173, CHK-190, CHK-192) are correctly incorporated. The BLOCKER gap (CHK-231–236) is already identified in F-010. Two additional coverage gaps were found.

---

**F-015 | MAJOR | Appendix A — No Check Distinguishing Business-Critical Audit Scope from Operational Write Side Effects (Pass 4 F-015 Unresolved)**

**Description:** This finding was raised as MAJOR in the independent Pass 4 review and was not addressed in Pass 4 Patch v1.0.1, nor is it addressed in Pass 5.

CHK-186 states: "Audit Requirements field present in all mutating contracts — absence is nonconforming" [B]. CHK-188 states: "Mutation-Scope lists every entity type the contract modifies" [B]. Together, these require a full Doc-2 §9 business audit entry for every contract that modifies any entity — including contracts whose only write side effect is an operational field update such as `last_accessed_at`, view counters, or session telemetry.

Doc-2 §9 defines the audit scope as business-critical actions. Applying §17's full audit grammar to operational telemetry writes contradicts Doc-2 §9's scope and creates an unbounded audit log growth obligation that will be rejected in practice — but silently, because contracts will simply omit the operational write from Mutation-Scope rather than flag the conflict.

**Risk:** AI agents will either (a) declare full audit for `last_accessed_at`-type writes (incorrect, inflates audit log), or (b) omit operational writes from Mutation-Scope (incorrect, fails CHK-188), or (c) skip the audit declaration for contracts that have only operational writes (incorrect, fails CHK-186). None of the three options is correct because the standard provides no distinction.

**Recommended change:** Add to Appendix A:

| ID | Criterion | Source | Sev |
|---|---|---|---|
| CHK-195 | Mutation-Scope distinguishes business-critical writes (Doc-2 §9 actions) from operational write side effects (telemetry, counters, access timestamps) — operational writes MUST NOT trigger Doc-2 §9 audit obligations | §17.1; Doc-2 §9 | B |
| CHK-196 | Contracts whose only write side effect is operational (no Doc-2 §9 action triggered) declare Audit-Required: no with stated operational-write justification | §17.1; Doc-2 §9 | M |

Also amend §17.1 to add: "Write side effects that are exclusively operational in nature (e.g., `last_accessed_at` updates, view counters, telemetry fields) do not trigger the §17.2 audit declaration obligation. The contract MUST identify which writes are business-critical (per Doc-2 §9) and which are operational, and declare Audit-Required accordingly."

---

**F-016 | MINOR | Appendix A — CHK-139 (Multi-Entity Aggregate Ordering) Does Not Specify the `#` Block Separator Format**

**Description:** CHK-139 states: "Multi-entity aggregate: one block per entity, ordered aggregate-root-first" [M]. This check verifies ordering but does not reference the `# <entity name>` separator format established in Template 21.1. A conformance tool checking CHK-139 can verify count and ordering but cannot verify format (whether the separator is `#`, `---`, a blank line, or a numeric prefix).

**Risk:** Template format inconsistency across module documents; the conformance check is incomplete without format verification.

**Recommended change:** Update CHK-139 to: "Multi-entity aggregate: one block per entity, ordered aggregate-root-first, each block preceded by `# <entity name>` separator per §13.2 and Template 21.1 grammar" [M].

---

## Section G — Appendix B Error Catalog Review

### Review Summary

Appendix B is well-executed. The twelve-class set is stable and correct. The QUOTA/RATE_LIMITED enforcement distinction box is precise and directly testable. The B.2–B.4 namespace registries provide the right scope for their respective concerns. One MINOR and one NITPICK were identified.

---

**F-017 | MINOR | §B.2 — Module Named "Monetization" Uses Prefix `billing_`; Naming Inconsistency Will Produce AI-Agent Errors**

**Description:** The B.2 namespace registry maps the Monetization module (Doc-4I) to prefix `billing_`. Throughout Doc-4A (all five passes), the module is consistently referred to as "Monetization" — in the module map, the entitlement gate grammar (`via Monetization service (Doc-4I)`), and the §21 template selection guide. The prefix `billing_` diverges from the module name convention (every other module's prefix is derived from its module name: `rfq_`, `trust_`, `comm_`, `identity_`, `marketplace_`, etc.).

**Risk:** AI agents authoring Doc-4I contracts will use `monetization_` as the prefix — deriving it from the module name per the evident convention — rather than the registered `billing_` prefix. The `billing_` registration will go unnoticed because it is only in B.2 and has no annotation explaining the intentional divergence.

**Recommended change:** Either: (a) change the module name to "Billing" (requires coordination with Master Architecture), or (b) add an annotation to the B.2 entry: `billing_ ← intentional; Monetization module uses billing_ prefix for historical/domain alignment reasons. AI agents MUST use billing_ not monetization_`.

---

**F-018 | NITPICK | §B.1 — CONFLICT Error Recovery Guidance Conflates Idempotency and Concurrency**

**Description:** The CONFLICT error's Recovery guidance reads: "Re-read entity for current concurrency token, then retry." This guidance is appropriate for stale-token concurrency failures (§14.5) but misleading for the second CONFLICT scenario listed in the same row: "non-idempotent duplicate submission." For idempotency-related CONFLICT (where the idempotency key has expired and a true retry is not safe), "re-read and retry" is the wrong recovery path — the client must determine whether the original operation committed before retrying. The conflation is a documentation concern, not a runtime issue (as CHK-131 correctly addresses the content of the CONFLICT response).

**Recommended change:** Split the Recovery guidance: "Stale-token case: re-read entity for current concurrency token, then retry. Duplicate submission case: check original operation status before retrying."

---

## Section H — Appendix C Authoring Checklist Review

### Review Summary

The 27-step checklist is thorough and correctly sequenced. The steps map directly to the platform's compliance requirements and are executable by AI agents. Two MINOR gaps were found.

---

**F-019 | MINOR | Appendix C Step 17 — Privacy Review Covers Events Produced Only; Events Consumed Privacy Obligations Not Addressed**

**Description:** Step 17 ("Privacy-Review completed") directs authors to review Events Produced payload fields against the §7.5 protected-fact list. However, §7.5 non-disclosure obligations apply equally to data flows in Events Consumed — a consuming module must not expose or persist protected facts received in consumed event payloads. A module that consumes an invitation-delivered event, for example, must not surface Buyer Vendor Status received in that payload, even if the emitting module correctly redacted it.

**Risk:** AI agents completing step 17 will declare Events Produced privacy as compliant but will not review Events Consumed payloads for re-disclosure risk.

**Recommended change:** Extend step 17 to: "Review every field in every **Events Produced** payload against the §7.5 protected-fact list. Then review every field in every **Events Consumed** payload: confirm the consuming module does not expose, re-emit, or persist any protected fact received in the consumed payload. In both cases, confirm `Privacy-Review: §7.5 compliant`."

---

**F-020 | MINOR | Appendix C — No Step Verifying ORG Setting Bound Declarations**

**Description:** §18.4 requires that ORG setting references in contracts declare: (1) the setting name by pointer, (2) whether bounded by a POLICY key, and (3) the absent-value behavior. Appendix C has no step checking these three obligations. Step 22 ("No hardcoded limits") covers POLICY keys but not ORG settings. Step 24 ("FIXED rules protected") covers invariants. ORG setting declarations fall between the two.

**Risk:** Contracts referencing ORG settings will miss the bounded-by and absent-value obligations without a checklist prompt.

**Recommended change:** Add to Section C.5: "**28. ORG setting declarations complete.** For every ORG setting referenced: confirm the declaration includes the setting name (by pointer), whether bounded by a POLICY key (cite the key), and the absent-value behavior (POLICY default key or FIXED default with basis). If the ORG setting has no POLICY ceiling/floor, confirm this is corpus-justified."

---

## Section I — AI-Agent Readiness Review

### Review Summary

The platform's use of Pass 5 as the governance layer for AI coding agents (Doc-4B–4K authoring) makes this the most consequential review dimension. The template set is largely AI-agent-ready. The BLOCKER (F-010: CHK-231–236 missing) is the primary AI-agent readiness failure. Beyond that, specific template authoring paths produce nonconforming output for Admin contracts (F-011, F-012) and delegated quota contracts (F-007).

**Adversarial template test — "Can an AI agent generate a non-conforming contract using the supplied templates?"**

| Template | Non-conformance path | Caught by |
|---|---|---|
| 21.1 (Base) | Include `total_count` without §7.5 compliance statement in Response Contract | CHK-062 [M] — not caught by template grammar |
| 21.3 (Query) | Override `State-Machine-Effects: none` pre-declaration | CHK-135 [B] — template annotation says MANDATORY/never overridden but grammar permits override |
| 21.4 (Command) | Omit Privacy-Review on a second emitted event (fill the block for the first, omit for the second) | CHK-173 [B] — template shows per-event block but agent may repeat without all fields |
| 21.5 (System Actor) | Declare `Correlation: reference_id` instead of `phase2-origin` | CHK-192 [B] — template annotation says MANDATORY but value is a selection option |
| 21.6 (Admin) | Produce no Events Produced section | NOT caught by Appendix A check for template selection (CHK-231–236 missing, F-010) |
| 21.2 (Integration) | Coin a new event name in the Event field | CHK-171 [B] — template instruction says "per Doc-2 §8" but no grammar enforcement |

**Template 21.6 (Admin) is the highest AI-agent risk:** the Events Produced omission (F-011) is not caught by any existing Appendix A check because CHK-231–236 are missing and CHK-170 would need to be applied against a template that provides no Events Produced section for AI agents to populate.

**No-fabricated-activity doctrine:** Appendix A CHK-164 ("No fabricated progress events") [B] and CHK-163 ("Phase-1 response does not fabricate Phase-2 completion") [B] are present and correctly cover the Doc-3 §12.1 FIXED doctrine in the conformance layer. Template 21.5 (System Actor) correctly requires `Execution: sync` within the Phase-2 worker (the worker is synchronous internally). The doctrine is well-protected.

**Delegation chain integrity:** The four-attribution chain (acting user, representative org, vendor profile, controlling organization) is correctly required in Template 21.1 Delegation Declaration and enforced by CHK-036 [B]. The quota attribution delegation rule (§19.4, CHK-216 [B]) is present. The QUOTA disclosure gap (F-007) is the only identified weakness in the delegation coverage.

---

## Cross-Pass Consistency Check

| Pass 4 Finding | Resolution Status in Pass 5 |
|---|---|
| F-001 (multi-entity State Machine Effects format) | RESOLVED — Template 21.1 uses `# <entity name>` separator with `[Additional entity blocks...]` instruction. Format not in §3.3 grammar standard (F-014 MINOR). |
| F-002 (§13.8 STATE error scope underspecified) | NOT addressed in Pass 5 — no template annotation or checklist step resolving "scope already permits reading that state." Remains open. |
| F-003 (NITPICK — `any non-corpus-terminal` basis citation) | RESOLVED — Template 21.1 Transition-Ref field format and CHK-138 [M] provide the citation path. |
| F-004 (in-flight idempotency race condition) | RESOLVED — CHK-155 [B] added; Appendix C step 25 added. |
| F-005 (§15.2/§15.5 Phase-2 contract identity) | RESOLVED — Template 21.1 Async Declaration Phase-2 field explicitly says "navigation pointer"; Template 21.5 is the standalone Phase-2 contract. |
| F-006 (§19.3 vs Template 21.1 format mismatch) | NEW MAJOR in this review (F-006). |
| F-007 (Phase-2 contract identity — redundant) | See F-005. |
| F-008 (§13.8 MINOR) | NOT addressed. |
| F-009 (Events Produced missing Privacy-Review field) | RESOLVED — CHK-173 [B] added; Template 21.1/21.5 include Privacy-Review field. |
| F-010 (§13.5 NITPICK — `Correlation: reference_id` vs `phase2-origin`) | Partially — CHK-192 [B] added, template annotation is present but not grammar-enforced (F-015 NITPICK in this review). |
| F-011 (§11.4 DELEGATION Case A/B) | RESOLVED — CHK-121 [B] added. |
| F-012 (§11.2 DELEGATION category contradiction) | Not a separate finding — covered by CHK-121 [B]. |
| F-013 (§12.1 timing path grammar gap) | RESOLVED — Template 21.1 Error Boundary includes `Timing-Uniformity: asserted | not-applicable`; CHK-056 [B] present. |
| F-014 (Correlation grammar gap — phase2-origin) | RESOLVED — `phase2-origin` added to Correlation closed set; CHK-189 [B], CHK-190 [B], CHK-192 [B] added. |
| F-015 (§17.1 full-audit overreach for operational writes) | UNRESOLVED — No Appendix A check distinguishes business-critical from operational writes (F-015 MAJOR in this review). |

---

## Findings Summary

| ID | Severity | Section | Description |
|---|---|---|---|
| F-010 | BLOCKER | §21 + Appendix A | CHK-231–CHK-236 referenced in §21 normative text; do not exist in Appendix A |
| F-001 | MAJOR | §18.5 | FIXED rule grammar scoped to BUSINESS category only; no pattern for FIXED rules in V1–V7 categories |
| F-006 | MAJOR | §19.3 + Template 21.1 | Rate Limit block grammar stated inconsistently (`Rate-Limit:` wrapper in §19.3 vs bare fields in Template 21.1) |
| F-011 | MAJOR | Template 21.6 | Events Produced section missing from Admin Contract template; all Admin mutation contracts will fail CHK-170 |
| F-012 | MAJOR | Template 21.6 | Concurrency and Async Declaration sections absent from Admin Contract template without explanation |
| F-015 | MAJOR | Appendix A | No check distinguishing business-critical audit scope from operational write side effects (Pass 4 F-015 unresolved) |
| F-002 | MINOR | §18.3 | "Access to non-disclosure obligations" entitlement exclusion is ambiguous; readable as naming a gateable feature |
| F-003 | MINOR | §18.4 | ORG setting references have no grammar block (§18.2 and §18.3 define grammar blocks; §18.4 does not) |
| F-004 | MINOR | §18B.2 | Typographic error: `stage_c` appears twice in Stage-Availability grammar |
| F-005 | MINOR | §18B.4 | No stage-transition event specified; consuming contracts cannot declare trigger for stage-activation behavior |
| F-007 | MINOR | §19.4 | QUOTA error disclosure rule for delegated operations has no template annotation; AI agents will miss Error-Boundary entry |
| F-008 | MINOR | §20.2 | Change classification table has no row for "new entitlement key" |
| F-009 | MINOR | §20.4 | Deprecation pattern provides no guidance for draft/approved (non-frozen) contracts |
| F-013 | MINOR | Template 21.3 | V4 SCOPE pre-resolved to NOT_FOUND only without annotation explaining the override of §11.2 dual-class rule |
| F-014 | MINOR | Template 21.1 + §13.2 | Multi-entity block `# <entity name>` separator uses markdown heading syntax not defined in §3.3 grammar notation |
| F-016 | MINOR | Appendix A | CHK-139 does not specify the `# <entity name>` block separator format |
| F-017 | MINOR | §B.2 | Monetization module prefix `billing_` diverges from module name; no annotation explaining intentional divergence |
| F-018 | NITPICK | §B.1 | CONFLICT error recovery guidance conflates idempotency failure and concurrency failure recovery paths |
| F-019 | MINOR | Appendix C | Step 17 privacy review covers Events Produced only; Events Consumed re-disclosure risk not addressed |
| F-020 | MINOR | Appendix C | No checklist step verifying ORG setting bound declarations (§18.4) |

**Total: 1 BLOCKER, 5 MAJORs, 12 MINORs, 1 NITPICK — 19 findings**

---

## Scores

| Dimension | Score | Notes |
|---|---|---|
| Standards Architecture | 87 / 100 | FIXED/POLICY/ORG model, quota/throughput distinction, and evolution table are precise. FIXED grammar category restriction (F-001) and Rate Limit inconsistency (F-006) are patchable. |
| Template Completeness | 71 / 100 | Templates 21.1–21.5 are substantially complete. Template 21.6 has three structural gaps (F-011, F-012). BLOCKER reference gap (F-010) is template-layer. |
| Appendix A Coverage | 78 / 100 | 96 checks is correct depth. BLOCKER CHK-231–236 missing (F-010). Business-critical audit scope gap (F-015) unresolved across two passes. |
| AI-Agent Readiness | 70 / 100 | Principal weakness: Template 21.6 will produce nonconforming Admin contracts; CHK-231–236 remove the primary template conformance check safety net. All other templates are AI-agent ready with known review catches. |

---

## Freeze Recommendation

**MINOR REVISION REQUIRED before freeze.**

The BLOCKER (F-010: CHK-231–236) is an editorial gap, not a design failure. It is patchable in a single Appendix A section addition. The five MAJORs are all patchable without structural change: F-011 and F-012 add sections to Template 21.6; F-001 adds language to §18.5; F-006 harmonizes one grammar format; F-015 adds two CHK items and one §17.1 clarification.

Pass 5 is architecturally sound. The FIXED/POLICY/ORG governance model, the stage-contract behavior standard, the evolution classification table, and the template set collectively form a coherent governance layer for the full Doc-4 series. The MAJORs are template and checklist defects, not design failures — they do not undermine the platform model.

**Recommended patch scope (Doc-4A Pass 5 Patch v1.0.1):**

1. Add Template Conformance section to Appendix A (CHK-231–CHK-236) — resolves F-010 BLOCKER
2. Add Events Produced, Concurrency, and Async Declaration sections to Template 21.6 — resolves F-011, F-012
3. Extend §18.5 to cover FIXED rule annotation in all validation categories, not only BUSINESS — resolves F-001
4. Harmonize Rate Limit block grammar between §19.3 and Template 21.1 — resolves F-006
5. Add CHK-195, CHK-196 to Appendix A distinguishing business-critical vs operational audit scope — resolves F-015
6. Correct `stage_c` typographic error in §18B.2 grammar — resolves F-004
7. Add ORG setting grammar block to §18.4 — resolves F-003

Findings F-002, F-005, F-007, F-008, F-009, F-013, F-014, F-016, F-017, F-019, F-020 are MINORs and the NITPICK — accept with recorded disposition or address in the same patch.

*Pass 5 review complete. On resolution of the above: Doc-4A is ready for Architecture Board freeze review of all five passes as a unit.*
