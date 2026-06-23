# Doc-4D Structure Proposal — Independent Architecture Board Hard Review Report v1.0

## Review Metadata

| Field | Value |
|---|---|
| Review Type | Independent Architecture Hard Review — Structure Readiness |
| Subject | `Doc-4D_Structure_Proposal_v0.1.md` |
| Review Gate | Structure Freeze |
| Corpus Baseline | Master_System_Architecture_v1.0_FINAL.md (FROZEN) · ADR_Compendium_v1.md (FROZEN) · Doc-2 v1.0.3 (FROZEN) · Doc-3 v1.0.2 (FROZEN) · Doc-4A v1.0 (FROZEN) · Doc-4B v1.0 (FROZEN) · Doc-4C v1.0 (FROZEN) |
| Reviewer Roles | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Virtual CTO · Principal API Governance Reviewer · AI-Agent Architecture Auditor |
| Corpus Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D |
| Review Posture | Structure-only · Defect-hunting · No feature expansion · No architecture redesign |

---

## Executive Summary

Doc-4D Structure Proposal v0.1 is a well-disciplined structural blueprint. The family-map conflict (RFQ label slip) is correctly identified and resolved. The section architecture is logical, the DD-1…DD-6 dependency markers are substantively correct, and the integration, authorization, audit, and AI-agent constraint surfaces are properly bounded. The proposal correctly refuses to author any contract, event, permission slug, or audit action. Ownership exclusion lists are nearly complete and corpus-consistent.

The review identifies **1 MAJOR**, **3 MINOR**, and **2 NITPICK** findings. No BLOCKER-severity defect was found.

The single MAJOR finding concerns a pre-existing Doc-2 internal corpus tension that the structure proposal silently inherits: `vendor_claim_records` is listed as a Marketplace-owned child aggregate in §D2 (consistent with its `marketplace.` schema placement in Doc-2 §10), but Doc-2 §6 explicitly designates it as **platform-owned**. The structure must not resolve this tension — it must carry it as a dependency marker (DD-1 or a new DD-7) so content authors know it is open. The current draft exposes content authors to authoring ownership-dependent contracts over an entity whose tenancy class is not settled by this structure.

The three MINOR findings cover: (a) a claim-lifecycle authority ambiguity in §D4 (the `claimed → verified` transition authority is not bounded against Trust ownership), (b) a missing explicit statement in §D8 that the Communication module authors the integration side of all Marketplace-triggered notification fan-outs, and (c) the `[ESC-MKT-*]` escalation pattern referenced in §D11 without a named anchor or minimum set.

The two NITPICK findings are cosmetic/consistency issues: an unnamed title inconsistency in §D4 and §D5 preambles relative to the frozen Doc-4B/Doc-4C structural conventions, and a minor ambiguity in §D9 event listing regarding `VendorVerified` consumption authority direction.

**With the MAJOR and MINOR findings addressed by a Structure Patch, Doc-4D can proceed to Structure Freeze.**

---

## Findings Table

### MAJOR Findings

---

**Finding M-01**

| Field | Detail |
|---|---|
| Finding ID | M-01 |
| Severity | MAJOR |
| Affected Section | §D2 (Ownership Model) |
| Corpus Citation | Doc-2 §6 tenancy table (line 602: `vendor_claim_records` listed in the **platform-owned** column); Doc-2 §10.3 schema table (line 733: `marketplace.vendor_claim_records`); Doc-2 §3.3 aggregate table (lists `vendor_claim_records` as a child of the Vendor Profile aggregate) |

**Issue:** A pre-existing Doc-2 internal corpus tension exists regarding the ownership of `vendor_claim_records`:

- Doc-2 §6 tenancy table explicitly designates `vendor_claim_records` as **platform-owned** (alongside `vendor_ownership_history`, `financial_tier_history`, all `core.*`, all `trust.*`, and all `admin.*` entities).
- Doc-2 §10.3 schema table places the entity in the `marketplace.` schema as `marketplace.vendor_claim_records`.
- Doc-2 §3.3 aggregate model lists `vendor_claim_records` as a child of the Vendor Profile aggregate, implying Marketplace ownership.

The structure proposal (§D2) carries the Doc-2 §3.3 aggregate reading without acknowledgment of the §6 platform-owned designation, listing `vendor_claim_records` in the **Owned aggregates** enumeration under the Vendor Profile heading. This is not a defect introduced by the structure — the tension is pre-existing in Doc-2 — but silently inheriting the §3.3 reading without flagging the §6 conflict creates a concrete risk: content authors will author `vendor_claim_records` write/mutate contracts as Marketplace-owned, potentially violating the §6 platform-ownership designation.

The structure must not resolve this tension (that is a Doc-2 §6 / §3.3 patch channel), but it must **carry it as an open dependency marker** so content passes are blocked from assuming ownership until the corpus is reconciled. The current DD-1…DD-6 set does not include this tension.

**Risk:** Content-pass authors inheriting this structure will author Marketplace mutation contracts over `vendor_claim_records` treating it as Marketplace-owned (consistent with §D2's inherited §3.3 reading). If Doc-2 §6's platform-owned designation is authoritative, those contracts will be incorrectly owned — a module-boundary violation. Even if §6 eventually defers to §10.3 (Marketplace schema = Marketplace-owned), the ambiguity must be surfaced and resolved through the named Doc-2 patch channel before contracts are authored, not after.

**Recommended Resolution:** Add a new dependency marker **DD-7** to §D0:

> **DD-7 — `vendor_claim_records` tenancy class ambiguity.** Doc-2 §6 designates `vendor_claim_records` as platform-owned; Doc-2 §10.3 places it in the `marketplace.` schema and Doc-2 §3.3 lists it as a Vendor Profile child aggregate. This is a Doc-2 internal tension. **Channel:** Doc-2 §6/§3.3 reconciliation patch. **Interim stance:** §D2 lists `vendor_claim_records` as a Vendor Profile child aggregate per §3.3/§10.3; content-pass mutation contracts over `vendor_claim_records` are **not finalized** until DD-7 is resolved.

Reference DD-7 in §D2 inline beside the `vendor_claim_records` listing. No ownership decision is made in the structure; the marker carries the open question to the named channel.

---

### MINOR Findings

---

**Finding m-01**

| Field | Detail |
|---|---|
| Finding ID | m-01 |
| Severity | MINOR |
| Affected Section | §D4 (Vendor Profile & Catalog Lifecycle Model) |
| Corpus Citation | Doc-2 §5.3 (Vendor Profile CLAIM machine: `claimed ──verification passed──▶ verified`); Doc-2 §5.6 (Verification machine — Trust-owned); Doc-2 §9 audit domain (Vendor profile: "verify" is a Marketplace audit action); DD-1 |

**Issue:** §D4 lists the claim dimension transition `claimed → verified` among the Vendor Profile lifecycles Marketplace structures. This transition appears in the literal Doc-2 §5.3 machine and is therefore correctly cited. However, the structure does not clearly articulate **which actor/module triggers the `claimed → verified` write**:

- The `verified` state on the claim dimension results from the Trust verification workflow (`VendorVerified` event, Doc-2 §8) — a Trust-initiated signal.
- The claim record (`vendor_claim_records`, which itself is subject to DD-7 above) holds the `claimed` state; the `verified` status may be written as an idempotent consumer of `VendorVerified` by Marketplace (analogous to how `financial_tier_history` is written exclusively by Marketplace as a consumer of `VendorTierChanged[verified]` — Doc-2 §10.3).
- However, the structure does not state this consumer pattern for the `claimed → verified` edge. It says only "(claim requires a controlling org; suspend/ban are platform-governance — DD-3)" for the authority annotation, leaving the `claimed → verified` trigger ownership implicit.

Without explicit authority annotation on this specific transition, a content-pass author may author a Marketplace-initiated command contract that *decides* verification (authoring the Trust decision), rather than a Marketplace-side consumer contract that *reflects* it.

**Risk:** AI-agent or human authors of Pass-A may author a `marketplace.verify_vendor_profile.v1` command that performs or decides the verification transition rather than consuming the `VendorVerified` event from Trust. This would be a boundary violation (Trust owns verification decisions — DD-1). The risk is non-trivial because the §5.3 claim machine presents the `claimed → verified` edge as part of Marketplace's lifecycle without a clear actor/authority annotation.

**Recommended Resolution:** In §D4, under the Vendor Profile lifecycle description, add an explicit annotation on the `claimed → verified` transition: state that this transition is **Trust-event-driven** — Marketplace updates the claim status as an idempotent consumer of the `VendorVerified` event (Doc-2 §8; Trust emitter); Marketplace **does not decide verification** (carried under DD-1). This is structurally analogous to the correctly stated `financial_tier_history` exclusive-writer pattern already in §D2/§D9.

---

**Finding m-02**

| Field | Detail |
|---|---|
| Finding ID | m-02 |
| Severity | MINOR |
| Affected Section | §D8 (Integration Surface) |
| Corpus Citation | Doc-4A §4.4 (single-authorship of integration contracts; the module producing the trigger emits; the integration-target module authors the inbound handler); Doc-2 §8 (event ownership map) |

**Issue:** §D8 states for Communication (Doc-4H): "Marketplace events trigger notification dispatch (Communication authors the integration per §4.4)." This attribution is correct and follows Doc-4A §4.4. However, the section does not state the converse obligation explicitly: **Marketplace does not author any Communication/notification contract**. The structure also does not enumerate *which* Marketplace events trigger Communication fan-out (other than the general statement), leaving content-pass authors without a clear boundary on which events Marketplace emits for Communication consumption vs. which are consumed purely by Trust, RFQ, or Analytics.

More specifically: `VendorClaimed` and `VendorOwnershipTransferred` are emitted by Marketplace (Doc-2 §8). Their Communication-side fan-out is not listed. The integration map is stated at the module level but lacks per-event direction clarity for the Communication leg, making it ambiguous whether content authors should expect Communication-side templates for these events or not.

**Risk:** Content-pass authors may interpret the absence of explicit Communication fan-out for specific Marketplace events as permission to author notification-dispatch logic inside Marketplace contracts (rather than emitting and letting Communication consume). This creates shadow notification logic and violates single-authorship.

**Recommended Resolution:** In §D8 under the Communication entry: (1) add "Marketplace MUST NOT author any notification-dispatch or Communication contract; the outbox event is the only authored product of a Marketplace state change that crosses to Communication;" (2) list by name which emitted Marketplace events have a Communication consumption leg (at minimum: `VendorClaimed`, `VendorSuspended`, `VendorOwnershipTransferred`, `ProfilePublished` — confirm against Doc-2 §8 at content authoring). Pending Doc-2 §8 confirmation of the full list, carry as a note that Communication fan-out is Communication-authored for every event Marketplace emits via the outbox.

---

**Finding m-03**

| Field | Detail |
|---|---|
| Finding ID | m-03 |
| Severity | MINOR |
| Affected Section | §D11 (Audit Surface) |
| Corpus Citation | Doc-4C §C1 analogue: `[ESC-IDN-AUDIT]` pattern established and operationalized; Doc-2 §9 audit domains; Doc-4A §17 |

**Issue:** §D11 states: "any Marketplace mutation whose audit action is not separately enumerated in Doc-2 §9 is flagged for a Doc-2 §9 additive (escalation marker, analogous to the Identity `[ESC-IDN-AUDIT]` pattern) — identified at content authoring, never invented." This is the correct posture.

However, the structure does not establish a **named escalation marker** for Marketplace audit gaps (the analogous `[ESC-MKT-AUDIT]` marker), nor does it identify a minimum set of audit actions it already suspects will be unenumerated based on the Doc-2 §9 review. The Doc-4C structure established these markers explicitly in its §C0 freeze-gate register (PATCH-4C-PA-02 later expanded them), enabling content authors to carry them consistently from the first content pass.

Two concrete gaps are already identifiable from the corpus at structure time:

1. **Advertisement submission/review/approval/rejection:** Doc-2 §9 Vendor profile domain lists "ban/lift" and "tier change" but does not separately enumerate advertisement lifecycle audit actions. The §5.8 machine has `pending_review → rejected` and `pending_review → approve` transitions that will need audit actions.

2. **Product publish/unpublish:** Doc-2 §9 Vendor profile domain does not separately enumerate product lifecycle audit actions; the Profile experience domain covers theme/layout/section/branding/SEO/domain but not product-level publish events.

Without naming the marker and seeding the known gaps, content-pass authors may: (a) invent audit action names for these transitions, or (b) bind them to the nearest §9 action without flagging the gap — both violating the no-invention rule.

**Risk:** Content authors will encounter audit-action gaps on the advertisement and product lifecycles and will have no structural anchor to carry the escalation correctly. The risk of ad-hoc audit-action invention is non-trivial, especially for AI-agent authors who will look for a named escalation pattern to follow.

**Recommended Resolution:** In §D11 (and §D0's freeze-gate dependency register), establish the named marker **`[ESC-MKT-AUDIT]`** with the same structure as `[ESC-IDN-AUDIT]`: "any Marketplace mutation whose audit action is not separately enumerated in Doc-2 §9; interim: bind nearest §9 action by pointer; **no audit action invented**; channel: Doc-2 §9 additive." Seed the known suspects: advertisement lifecycle transitions and product publish/unpublish. Content passes carry and expand the marker.

---

### NITPICK Findings

---

**Finding N-01**

| Field | Detail |
|---|---|
| Finding ID | N-01 |
| Severity | NITPICK |
| Affected Section | §D4 and §D5 section preambles |
| Corpus Citation | Doc-4B/Doc-4C structure conventions (no adaptation preamble required) |

**Issue:** §D4 and §D5 each open with a parenthetical adaptation note explaining how the section maps from the authoring request's original section names ("RFQ Lifecycle Model" → Marketplace lifecycle, "Procurement Authority Model" → Profile ownership model). While editorially helpful during the initial draft, these preambles will be unnecessarily confusing once the document is frozen — a frozen structure should read on its own authority without referencing the label-slip authoring request. The adaptation notes appear normative to a reader who has not seen the authoring request.

**Risk:** Future content-pass authors or AI agents reading the frozen structure will encounter references to "the request's 'RFQ Lifecycle Model'" and may interpret this as an RFQ scope signal, potentially introducing scope confusion in Pass-A authoring.

**Recommended Resolution:** Remove or convert the parenthetical adaptation notes in §D4 and §D5 to a simple non-normative footnote, or remove them entirely. The section titles stand on their own; the family-map reconciliation note in §D0 is sufficient.

---

**Finding N-02**

| Field | Detail |
|---|---|
| Finding ID | N-02 |
| Severity | NITPICK |
| Affected Section | §D9 (Event & Dependency Map) |
| Corpus Citation | Doc-2 §8 (event ownership: `VendorVerified` emitter is Trust; Marketplace is consumer) |

**Issue:** §D9 lists under "Consumed events": "`VendorVerified`, `TrustScoreUpdated`/`PerformanceScoreUpdated` (→ rebuild `vendor_matching_attributes`)." This is correct. However, `VendorVerified` and `TrustScoreUpdated`/`PerformanceScoreUpdated` serve different rebuild purposes:

- `VendorVerified` → updates the claim dimension `claimed → verified` status on the Vendor Profile (the same edge flagged in m-01).
- `TrustScoreUpdated`/`PerformanceScoreUpdated` → rebuilds `vendor_matching_attributes`.

The current wording groups them together under the single attribution "→ rebuild `vendor_matching_attributes`," which is accurate for the score events but potentially misleading for `VendorVerified` (whose primary effect is the claim-state update, not the attribute rebuild — though a secondary attribute rebuild may follow). This minor conflation could mislead content authors about what `VendorVerified` consumption writes.

**Risk:** Negligible — cosmetic only. A content author may expect `VendorVerified` to write only `vendor_matching_attributes` (the stated target) when it should also update the `vendor_claim_records` / profile claim status (which is unmentioned). This is a minor ambiguity, not a structural gap.

**Recommended Resolution:** Separate the consumed-event descriptions: `VendorVerified` → "(→ update claim status `claimed → verified`; trigger matching-attribute rebuild)"; `TrustScoreUpdated`/`PerformanceScoreUpdated` → "(→ rebuild `vendor_matching_attributes`)".

---

## Architecture Integrity Assessment

| Domain | Rating | Evidence |
|---|---|---|
| **Ownership Integrity** | **CONCERN** | Overall ownership model is correct and the not-owned exclusion list is comprehensive. One pre-existing Doc-2 corpus tension (M-01: `vendor_claim_records` §6 platform-owned vs. §3.3/§10.3 Marketplace child aggregate) is inherited silently rather than carried as a DD marker. Resolution: add DD-7 as recommended. All other entities correctly assigned: `verification_records`, `trust_scores`, `performance_scores`, `verified_financial_tiers`, `ban_actions`, `rfqs`, `quotations`, `private_vendor_records`, `buyer_supplier_relationships`, `delegation_grants`, `subscriptions`, `entitlements`, `platform_invoices`, `core.*` — all correctly excluded from Marketplace ownership. |
| **Authority Integrity** | **CONCERN** | Publication, catalog, and discovery authority are correctly scoped. The `claimed → verified` transition authority is not annotated in §D4 (m-01) — the structure leaves implicit whether Marketplace authors this as a command or as a Trust-event consumer. This creates future content-authoring authority ambiguity on a Trust-decision boundary. All other authority demarcations (verification decisions → Trust, ban decisions → Admin, category approval → Admin, entitlement gating → Billing) are correctly bounded. |
| **DDD Integrity** | **PASS** | Six bounded contexts in §D3 are well-delineated and internally coherent. No context boundary leak detected. Discovery/matching is correctly placed in a read-model context that consumes but does not own the routing engine. Vendor Master Identity is correctly treated as a logical concept (not re-modeled as an entity per Architecture Patch v1.0.1 PATCH-05). Aggregate boundaries in §D2 match Doc-2 §3.3/§2 exactly (save the M-01 tension). No capability duplication detected. |
| **Integration Integrity** | **CONCERN** | Most integration surfaces are correctly bounded: consume-only from Identity/Trust/Billing; expose read-model to RFQ; reflect Admin ban/category decisions; Platform Core consumed by pointer. Communication fan-out authorship is correctly attributed to Communication (Doc-4A §4.4) but lacks per-event clarity and an explicit "Marketplace does not author notification contracts" prohibition (m-02). Template 21.2 correctly not instantiated in the structure. No integration ownership transfer detected. |
| **Event Governance Integrity** | **PASS** | Emitted events in §D9 are correctly restricted to the Doc-2 §8 Marketplace event catalog: `VendorClaimed`, `VendorSuspended`, `VendorTierChanged[declared]`, profile experience events (`ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`), `VendorOwnershipTransferred`. No event invented. Consumed events correctly include `VendorTierChanged[verified]` (Trust), `VendorVerified` (Trust), `TrustScoreUpdated`/`PerformanceScoreUpdated` (Trust), `VendorBanned` (Admin). Outbox mechanism correctly delegated to Doc-4B (consumed). No event-invention path opened. |
| **Authorization Integrity** | **PASS** | Identity remains the authorization root. `check_permission` consumption model is correctly stated in §D5 and §D10. The §6B delegation grant path is correctly consumed from Doc-4C; no shadow delegation contract authored. Permission slugs in §D10 are the exact Doc-2 §7 corpus: `can_manage_vendor_profile`, `can_publish_profile`, `can_manage_products`, `can_manage_ads`, `can_upload_spec_documents`, `staff_can_manage_categories`, `staff_can_ban`. No slug invented. Three-layer check (Membership + Slug + Resource Scope OR delegation grant) correctly bound. |
| **Audit Integrity** | **CONCERN** | Audit-write mechanism correctly delegated to Doc-4B `core.append_audit_record.v1` (consumed, never re-implemented). Doc-2 §9 Vendor profile and Profile experience audit domains correctly identified. However, no named `[ESC-MKT-AUDIT]` marker established (m-03); the structure defers audit-gap identification entirely to content authoring without seeding the known suspects (advertisement lifecycle, product publish events). This is a structural omission analogous to the `[ESC-IDN-AUDIT]` gap that was later caught and patched in Doc-4C Pass-A. |
| **AI-Agent Safety** | **CONCERN** | §D12 is substantively strong: the ownership protections, ambiguity-prevention rules, and the consumption model are clearly stated. DD markers prevent invention across all six dependency boundary areas. However, three structural ambiguities remain that content-pass AI agents will encounter: (1) `vendor_claim_records` tenancy class (M-01) — an AI agent will assume Marketplace ownership per §D2 and author mutation contracts; (2) `claimed → verified` transition authority (m-01) — an AI agent may author a Marketplace command for this Trust-driven edge; (3) absence of a named audit-escalation marker pattern (m-03) — AI agents authoring Pass-A contracts for advertisement/product mutations will lack a structural anchor for unenumerated §9 audit actions. These are addressable with the Patch; they do not individually constitute BLOCKER-level risk because the DD system and §D12's general no-invention rule provide a partial backstop. |

---

## Family Map Compliance Assessment (Domain 1)

**PASS.** Doc-4D = Marketplace & Discovery (Module 2) is confirmed by Doc-4A §1.3 and Appendix B (`marketplace_` namespace). The family-map conflict (authoring request labeled this as RFQ/Procurement Engine) is correctly identified, escalated, and resolved per §0.6 flag-and-halt. Doc-4E = RFQ Procurement Engine (Module 3) is correctly preserved as unaffected. The RFQ namespace (`rfq_`) is correctly absent from this document. No residual RFQ ownership leakage detected — §D6's note that "the matching/routing *engine* context belongs to RFQ (Doc-4E), not here (DD-2)" and §D3's exclusion of the matching/routing computation context from Marketplace's bounded contexts are both correct.

---

## Structure Completeness Assessment (Domain 2)

**PASS.** The section map (§D0–§D13) covers all required content domains for future Pass-A and Pass-B authoring: governance/scope (§D0), mission (§D1), ownership (§D2), bounded contexts (§D3), lifecycle (§D4), authority (§D5), discovery (§D6), workflow (§D7), integration (§D8), events/dependencies (§D9), authorization (§D10), audit (§D11), AI-agent constraints (§D12), and appendices (§D13). No major structural section is missing. The four planned appendices (Contract Inventory skeleton, Conformance Binding Map, Carried Markers, Cross-Reference Index) parallel the frozen Doc-4C structure correctly. Section ordering is logical. No duplicate responsibility sections detected. No misplaced content domains detected.

---

## Lifecycle Integrity Assessment (Domain 6)

**PASS with notation.** Lifecycle state machines in §D4 bind correctly to the literal Doc-2 §5.3 (Vendor Profile — two orthogonal dimensions: claim and status) and §5.8 (Advertisement — ASSUMPTION A-07 minimal machine) edges. Terminals (`retired`, `removed`, `released`, `completed`, `banned` with lift, `rejected`) are identified. The notation that "verified-tier state and the verification machine (§5.6) are Trust-owned" in the excluded scope is correct. No transition invented. The `claimed → verified` authority annotation gap (m-01) is a content-scope ambiguity, not a lifecycle invention — the edge itself is correctly cited from §5.3. `vendor_claim_records` lifecycle (`seeded → invited → claimed`) correctly cited from Doc-2 §6. The Advertisement state machine correctly carries the ASSUMPTION A-07 tag.

---

## Dependency & Escalation Integrity Assessment (Domain 11)

| Marker | Validity | Status |
|---|---|---|
| **DD-1** (Vendor verification boundary — Trust) | Valid: Trust owns verification records/decisions (§5.6; Doc-2 §9); Marketplace submits/consumes | Correctly carried; channel named |
| **DD-2** (Matching/routing engine — RFQ) | Valid: `vendor_matching_attributes` is the read-model surface; matching logic is RFQ/Doc-4E (Doc-3 §3/§6) | Correctly carried; channel named |
| **DD-3** (Ban authority — Admin) | Valid: `ban_actions` are Admin-owned (Doc-2 §8: `VendorBanned` emitter = admin); Marketplace reflects | Correctly carried; channel named |
| **DD-4** (Category approval — Admin) | Valid: `staff_can_manage_categories` (Doc-2 §7); category entity is Marketplace-owned; approval governance is Admin | Correctly carried; channel named |
| **DD-5** (Entitlement gating — Billing) | Valid: advertisement purchase = `billing.platform_invoice` (Doc-2 §5.8); custom domains are entitlement-gated | Correctly carried; channel named |
| **DD-6** (`marketplace.*` POLICY key registration) | Valid: Doc-3 §12.2 has no `marketplace.*` block; POLICY keys referenced by name only | Correctly carried; channel named |
| **DD-7** | **ABSENT** — M-01 gap | Must be added: `vendor_claim_records` tenancy ambiguity |

No DD marker is silently resolved. No DD marker is bypassed. Escalation handling posture is correct: "carried — not resolved here" across all six existing markers.

---

## Structure Readiness Decision

**APPROVE WITH PATCH REQUIRED**

---

## Final Answer

**Can Doc-4D Structure Proposal proceed to Structure Freeze?**

**NO — not in current form. YES after Patch.**

**Justification:**

The structure is architecturally sound in its family-map compliance, DDD integrity, lifecycle binding, event governance, authorization model, and section completeness. All six existing DD dependency markers are valid and correctly carried. The governance, exclusion, and no-invention disciplines are correctly applied throughout.

However, three issues require a targeted Structure Patch before freeze:

**M-01 (MAJOR):** A pre-existing Doc-2 corpus tension (`vendor_claim_records` platform-owned per §6 vs. Marketplace child aggregate per §3.3/§10.3) is silently inherited by §D2 without a dependency marker. Content-pass authors will assume Marketplace mutation ownership over this entity based on §D2's inherited §3.3 reading, which may later conflict with the §6 platform-owned designation when it is reconciled through the Doc-2 patch channel. A new marker DD-7 must be added to §D0 and referenced in §D2.

**m-01 (MINOR):** The `claimed → verified` transition in §D4 lacks an authority annotation distinguishing Trust-event-driven (consumer pattern) from Marketplace-commanded. On the Trust verification boundary (DD-1), this ambiguity is consequential: a content author or AI agent may author a Marketplace verification command that decides (rather than reflects) the transition.

**m-03 (MINOR):** No named `[ESC-MKT-AUDIT]` marker is established in §D0/§D11 despite the structure explicitly anticipating audit-action gaps. The known suspects (advertisement lifecycle, product publish/unpublish) are identifiable from the corpus now. Without a named marker seeded in the structure, content authors lack a structural anchor for the no-invention escalation pattern when they encounter these gaps at Pass-A time.

**m-02 (MINOR)** is addressable in the same patch: add a single explicit prohibition line and per-event Communication fan-out note in §D8.

**N-01 and N-02 (NITPICK)** may be resolved in the same patch or deferred to the Board's discretion.

The patch is narrow and additive — no section is redesigned, no entity is invented, no authority boundary is moved. With these four items resolved, the structure becomes a sound, complete, and unambiguous blueprint for Doc-4D Pass-A and Pass-B authoring.

---

*End of Doc-4D Structure Proposal Independent Architecture Board Hard Review Report v1.0 — 0 BLOCKER · 1 MAJOR · 3 MINOR · 2 NITPICK. Structure Readiness Decision: APPROVE WITH PATCH REQUIRED. Structure Freeze: NO (YES after Patch).*
