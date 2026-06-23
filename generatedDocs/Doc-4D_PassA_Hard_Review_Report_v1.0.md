# Doc-4D Content Pass-A Hard Review Report v1.0

**Document Under Review:** `Doc-4D_Content_v1.0_PassA.md`
**Review Objective:** Determine whether Doc-4D Content Pass-A is ready for Pass-A Approval / Pass-B Authoring or requires a Patch before Pass-B
**Review Type:** Independent Architecture Hard Review — Production-Grade Scrutiny
**Review Posture:** Defect hunting only. No feature expansion. No architecture redesign. No ownership reallocation. No module boundary changes.
**Corpus Precedence:** Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D Structure FROZEN
**Reviewer:** Independent Architecture Board
**Date:** 2026-06-16

---

## Executive Summary

Doc-4D Content Pass-A presents a well-structured contract inventory for Module 2 (Marketplace & Discovery) with strong corpus compliance across ownership integrity, DDD boundaries, authorization declarations, event governance, integration surface, dependency markers, and AI-agent safety constraints. Cross-cutting conventions (§B), the governance firewall (B.7), single-authorship enforcement (§D8), DD-1 through DD-7 carriage, and the `[ESC-MKT-AUDIT]` escalation pattern are all correctly applied. No entity, event, slug, audit action, POLICY key, or template is invented; all bindings are by pointer.

Two defects require a patch before Pass-B authoring can proceed safely:

1. **MAJOR (M-01):** The `banned → active` (ban-lift) lifecycle transition of `vendor_profiles.status` has no consumer contract and no escalation marker. Doc-2 §5.3 declares the `banned ─lift─▶ active` edge; Doc-2 §8 declares no `VendorBanLifted` event; `reflect_vendor_ban.v1` covers only `active → banned`. The lift leg is silently unaddressed — creating an unresolvable implementation gap.

2. **MINOR (m-01):** Section header numbers are duplicated — three `##§D6` headers and three `##§D7` headers appear in the content, whereas the frozen structure defines exactly one §D6 (Discovery) and one §D7 (Catalog Curation & Vendor Lifecycle Workflow). Appendix B propagates the same mislabeling. AI agents and engineers navigating by section reference will be misdirected.

One additional MINOR finding (m-02) identifies an audit ownership ambiguity for the "seed" action in §D11 that Pass-B should resolve with a clarifying annotation. One NITPICK (N-01) identifies a dual-subscription ambiguity for `VendorVerified` that Pass-B should resolve in its integration contract detail.

**Pass-A Readiness Decision: APPROVE WITH PATCH REQUIRED — Pass-A Approval: NO (YES after Patch)**

---

## Findings Table

### MAJOR

---

**Finding ID:** M-01
**Severity:** MAJOR
**Affected Section:** §D8 (`reflect_vendor_ban.v1`), §D9, §D11
**Corpus Citation:** Doc-2 §5.3 (`banned ─lift─▶ active`); Doc-2 §8 (event catalog — `admin | ban_actions | VendorBanned` only, no `VendorBanLifted` declared); Doc-2 §9 (Vendor profile: "ban/lift" is an audited action in both directions); Doc-4A §13 (all legal transitions must be covered)
**Issue:** The `vendor_profiles.status` dimension has two transitions involving the `banned` state: `active → banned` (covered by `reflect_vendor_ban.v1` consuming Admin's `VendorBanned`) and `banned → active` (lift — not covered by any contract). Doc-2 §5.3 explicitly shows `banned ──lift──▶ active`. Doc-2 §8 declares only `VendorBanned` from Admin; there is no `VendorBanLifted` event. As a result, the lift leg of the §5.3 machine is silently unaddressed: no consumer contract exists for Marketplace to reflect the lift, no event exists for it to consume, and no DD or ESC escalation marker is raised to flag the gap. The §D11 audit surface lists "ban/lift" as bound but only the ban direction has a corresponding contract. `ban_actions.state` transitions to `lifted` in Admin's domain, but Marketplace's `vendor_profiles.status` has no mechanism to return to `active`.
**Risk:** Production implementation gap. After a ban is lifted by Admin, `vendor_profiles.status` in Marketplace's projection will remain permanently `banned`. Vendor cannot be reinstated, cannot be discovered in public search, cannot receive RFQ invitations (the `vendor_matching_attributes` rebuild excludes banned profiles). The lift action is also audited in Doc-2 §9 under "ban/lift" — the audit record for the Marketplace-side lift reflection has no contract home.
**Recommended Resolution:** Add a `DD-8` (or extend `DD-3` scope) marker in §D0 and Appendix C flagging the missing `VendorBanLifted` event in Doc-2 §8. Define a `marketplace.reflect_vendor_ban_lift.v1` (21.5 System) consumer contract in §D8 contingent on Admin emitting a `VendorBanLifted` event — parallel to `reflect_vendor_ban.v1`. Update §D9 consumed-events list and §D11 audit surface to include the lift-consumer leg. Channel: Doc-2 §8 additive (Admin must declare the lift event). Do not resolve locally; carry as a named freeze-gate dependency.

---

### MINOR

---

**Finding ID:** m-01
**Severity:** MINOR
**Affected Section:** Section headers §D6 (lines 201, 267, 278), §D7 (lines 147, 171, 238); Appendix B (lines 381–384); §D3 preamble (line 56)
**Corpus Citation:** `Doc-4D_Structure_v1.0_FROZEN.md` §D6 ("Discovery, Visibility & Participation Model" — single section), §D7 ("Catalog Curation & Vendor Lifecycle Workflow Model" — single section); Doc-4A §0.6 (frozen structure must not be silently departed from)
**Issue:** The frozen structure defines exactly one §D6 and one §D7, each with a specific purpose. In Doc-4D Pass-A content:
- Three `##§D6` headings appear: (a) "Profile Experience & Presentation" (line 201), (b) "Catalog Favorites" (line 267), (c) "Discovery, Visibility & Read-Model" (line 278). Only (c) is the correct §D6.
- Three `##§D7` headings appear: (a) "Catalog & Taxonomy" (line 147), (b) "Product & Specification" (line 171), (c) "Advertising" (line 238). None maps cleanly to the frozen §D7 label.
The frozen §D7 ("Catalog Curation & Vendor Lifecycle Workflow Model") encompasses all these areas as sub-topics within a single section, not as three separate §D7 sections. Appendix B (Conformance Binding Map) propagates the same error with entries `§D7 (catalog/product/spec)`, `§D7 (advertising)`, `§D6 (profile experience/domains/showcase)`, and `§D6 (discovery/read-model)` — four entries where only two section numbers exist. The §D3 preamble (line 56) further replicates the mislabeling by grouping "Catalog & Taxonomy (§D7)" and "Advertising (§D7)" as if they were separate §D7 sections.
**Risk:** AI agents (Claude Code, Cursor) and engineers using section cross-references will be routed to the wrong header. A query for "§D6 profile experience contracts" will match line 201 instead of the correct frozen-structure §D6 (Discovery). Appendix B's binding table will produce incorrect governance lookups. This is an implementation navigation hazard at scale.
**Recommended Resolution:** Renumber the content section headers to match the frozen structure: assign a single `##§D6` to the Discovery/Read-Model block, and collapse Catalog & Taxonomy, Product & Specification, Advertising, Profile Experience, Catalog Favorites, and Custom Domains under a single `##§D7` with sub-headings (e.g., `###` level) per area. Update Appendix B binding table rows accordingly. Update the §D3 bounded-context preamble references to match.

---

**Finding ID:** m-02
**Severity:** MINOR
**Affected Section:** §D11 (Audit Surface, line 341)
**Corpus Citation:** Doc-2 §9 Vendor profile: "create, seed, claim, verify, suspend, ban/lift, tier change (declared + verified), category change, capability/override change, ownership transfer"; Doc-2 §3.3 (`vendor_claim_records` — platform-owned; seeding = Admin/Module 8 import job); Doc-4A §17 (audit — one owner per audit action)
**Issue:** §D11's bound audit surface lists "seed" as a Vendor-profile audit action bound via Doc-4B `core.append_audit_record.v1`, but Doc-4D passes have no Marketplace-owned seed contract (seeding is Admin/Module 8, via `import_jobs`/`import_rows` — Doc-4J). The listing of "seed" in Marketplace's §D11 audit surface without a carrier contract or an explicit authorship annotation creates ambiguity: does Marketplace write the "seed" audit record, or does Admin? If an implementor assigns the audit write to Marketplace, they will author an audit record for an action Marketplace does not perform.
**Risk:** An AI agent or backend engineer reading §D11 could incorrectly implement a `core.append_audit_record.v1` call for the seed action within Marketplace code. The actual seed audit record should be written by Admin (Module 8) when the import job creates the seeded `vendor_claim_records` row.
**Recommended Resolution:** Annotate the "seed" entry in §D11 with an explicit note: "seed audit record is authored by Admin (Module 8 import job) — not a Marketplace-side write; listed here for domain completeness per Doc-2 §9." Alternatively, exclude "seed" from the Marketplace §D11 bound list and note that it is covered by Doc-4J.

---

### NITPICK

---

**Finding ID:** N-01
**Severity:** NITPICK
**Affected Section:** `marketplace.rebuild_vendor_matching_attributes.v1` (line 296); `marketplace.reflect_verified_claim_status.v1` (line 142)
**Corpus Citation:** Doc-4A §16 (events — idempotent consumer pattern); Doc-2 §8 (`VendorVerified` — single event, single emitter)
**Issue:** Both `reflect_verified_claim_status.v1` and `rebuild_vendor_matching_attributes.v1` list `VendorVerified` (Trust) as a consumed event. This implies two independent consumers of the same event within Marketplace, which is architecturally valid but creates an implementation ambiguity at Pass-A: it is unclear whether (a) both are separate outbox-message subscribers (two subscriptions), or (b) `reflect_verified_claim_status` executes first and internally triggers the attribute rebuild as a side-effect (one subscription, chained). Pass-A does not require implementation detail, but this ambiguity — if carried into Pass-B — will produce inconsistent outbox-subscription designs across contract authors.
**Risk:** Dual-subscription confusion at Pass-B; risk of one leg being omitted if an implementor assumes the other handles it.
**Recommended Resolution:** In Pass-B, `rebuild_vendor_matching_attributes.v1` should clarify whether `VendorVerified` triggers it as a direct subscription or whether the rebuild is dispatched internally after `reflect_verified_claim_status.v1` completes. One sentence in the Pass-B integration block is sufficient.

---

## Architecture Risk Assessment

| Domain | Rating | Basis |
|---|---|---|
| Ownership Integrity | PASS | All ~21 marketplace entities correctly owned; no cross-module entity authored; non-owned entities explicitly listed with UUID-only reference; `financial_tier_history` exclusive-writer firewall correctly enforced. |
| DDD Integrity | PASS | Marketplace bounded contexts respected; no RFQ/procurement/matching logic authored; one entity = one owner enforced throughout; `vendor_matching_attributes` correctly modeled as a projection, not a decision surface. |
| Authorization Integrity | PASS | Three-layer check + §6B delegation consumed from Doc-4C; all Doc-2 §7 slugs correctly bound; `staff_super_admin` corpus-confirmed; no shadow auth; Admin 21.6 contracts use §5.6 (no active org context). |
| Audit Integrity | CONCERN | §D11 lists "seed" without authorship disambiguation (m-02); both directions of ban/lift are listed as bound but only one direction has a carrier contract (M-01). |
| Event Governance | CONCERN | `VendorBanned` consumed (lift not covered — M-01); dual `VendorVerified` subscription ambiguity (N-01); emitted events all corpus-confirmed against Doc-2 §8; no events coined. |
| Integration Integrity | PASS | Single-authorship enforced; Communication boundary correctly held; Billing/RFQ/Trust/Admin all consume or expose by pointer; no Template 21.2 instantiated. |
| AI-Agent Safety | CONCERN | Section mislabeling (m-01) creates navigation hazard for AI-assisted implementation; "seed" audit ambiguity (m-02) creates incorrect audit-write risk; ban-lift gap (M-01) creates silent lifecycle state trap. |

---

## Pass-A Readiness Decision

**APPROVE WITH PATCH REQUIRED**

### Pass-A Approval: NO

**Justification:** Doc-4D Content Pass-A cannot advance to Pass-B authoring in its current form. The `banned → active` (ban-lift) lifecycle transition has no consumer contract, no event anchor, and no escalation marker — a silent lifecycle coverage gap that would produce an unrecoverable `vendor_profiles.status = banned` state in Marketplace's projection after Admin lifts a ban. This is a production correctness defect, not a Pass-B concern. The section header mislabeling (m-01) is a structural conformance violation against the frozen structure that will cause navigational errors in AI-assisted implementation if carried into Pass-B; it must be corrected at Pass-A to ensure the correct structure is the implementation reference.

Both M-01 and m-01 are correctable without structural redesign; the content remains high-quality and corpus-compliant in all other domains. After patch application, Pass-A may be approved.

---

## Pass-B Entry Conditions

The following must be satisfied before Pass-B authoring begins:

1. **[Required — M-01]** Either:
   (a) A named escalation marker (DD-8 or extended DD-3 scope) is added to §D0 and Appendix C identifying the missing `VendorBanLifted` event in Doc-2 §8 as an unresolved dependency, AND a `marketplace.reflect_vendor_ban_lift.v1` (21.5 System, conditional on the event being declared) is added to §D8; OR
   (b) Confirmation from the Doc-2 custodian that the `banned → active` lift is an Admin direct-write to `vendor_profiles.status` (not a Marketplace-reflected consumer event), with appropriate authority annotation added to the relevant contracts and §D10.
   The gap must not be silently carried into Pass-B.

2. **[Required — m-01]** Section headers §D6 and §D7 are renumbered to match the frozen structure (one §D6 = Discovery; one §D7 = Catalog Curation & Vendor Lifecycle Workflow, with sub-headers for sub-areas). Appendix B binding table and §D3 preamble references updated to match.

3. **[Recommended — m-02]** §D11 seed-audit annotation added, disambiguating authorship.

4. **[Pass-B guidance — N-01]** The `VendorVerified` dual-consumer ambiguity is resolved in Pass-B integration contract detail for `rebuild_vendor_matching_attributes.v1`.

---

*End of Doc-4D Content Pass-A Hard Review Report v1.0.*
*Review scope: 13 domains — Structure Conformance, Marketplace Ownership Integrity, RFQ Boundary Protection, Trust Boundary Protection, Identity Boundary Protection, DDD Integrity, Lifecycle Integrity, Authorization Integrity, Audit Integrity, Event Governance Integrity, Integration Integrity, Dependency Integrity, AI-Agent Implementation Safety.*
*Corpus references verified: Doc-2 §3.3/§5.3/§5.8/§6/§7/§8/§9/§10.3; Doc-4A §6/§6B/§13/§16/§17; Doc-4D_Structure_v1.0_FROZEN.md §D0–§D13.*
