# Doc-4D — Content Pass-A Patch v1.0.1 (Marketplace & Discovery — Hard Review Resolution)

| Field | Value |
|---|---|
| Patch ID | Doc-4D-PassA-Patch-v1.0.1 |
| Applies To | `Doc-4D_Content_v1.0_PassA.md` (Module 2 — Marketplace & Discovery) |
| Produces | Doc-4D Content v1.0 Pass-A **as amended** — Pass-A approval candidate |
| Patch Authority | Architecture Board Directive — approved `Doc-4D_PassA_Hard_Review_Report_v1.0.md` findings **M-01, m-01, m-02** + optional **N-01** |
| Patch Type | **Additive governance patch only.** Adds one dependency marker (DD-8) + one conditional placeholder contract, corrects section numbering to the frozen structure, adds two clarifying annotations. **No content rewrite, no redesign, no Pass-B detail.** |
| Coining guarantee | **No entity, event, permission slug, audit action, POLICY key, template, lifecycle state, or state-machine transition invented.** DD-8 carries the missing-event gap; the placeholder contract is **non-implementable until DD-8 resolves**. Corpus conflicts carried, not resolved locally. |
| Conforms To | Architecture FINAL, ADRs v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN (all FROZEN) |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D Structure → Doc-4D Pass-A → Hard Review Report v1.0 |
| Status | **APPROVED — additive Pass-A patch** |

---

## 1 — Patch Summary

This patch applies the Architecture Board–approved Hard Review findings to `Doc-4D_Content_v1.0_PassA.md` as targeted, additive amendments, each quoting the exact base text. **M-01** raises **DD-8 — Vendor Ban-Lift Event Gap** (Doc-2 §5.3 declares `banned → active` but Doc-2 §8 declares no `VendorBanLifted` event) and adds the conditional, non-implementable placeholder `marketplace.reflect_vendor_ban_lift.v1` carrying `[DD-8]` — no event coined, no local resolution. **m-01** corrects the duplicate `§D6`/`§D7` headers to a single frozen-conformant `§D6` (Discovery) and a single `§D7` (Catalog Curation & Vendor Lifecycle Workflow) with `###` subsections, updating §D3 and Appendix B. **m-02** annotates the §D11 "seed" audit action as Admin-authored (Marketplace does not originate seed audit writes). **N-01** (optional) adds a one-line note that `VendorVerified` legitimately drives multiple Marketplace consumers (Pass-B defines subscription behavior). Nothing is resolved locally; DD-1…DD-7 and `[ESC-MKT-AUDIT]` are preserved; no ownership/authority/lifecycle/event change.

---

## 2 — Finding Resolution Mapping

| Finding | Severity | Amendments | Resolution |
|---|---|---|---|
| **M-01** — Ban-lift lifecycle coverage gap | MAJOR | REP-1 (§D0), INS-1 (§D8 placeholder), REP-4 (§D9), REP-5 (§D9 markers), REP-6 (§D11), REP-7 (Appendix A), INS-3 + REP-9 (Appendix C) | DD-8 raised + carried to the Doc-2 §8 channel; `marketplace.reflect_vendor_ban_lift.v1` added as a conditional, non-implementable placeholder `[DD-8]`. No `VendorBanLifted` invented; not resolved locally. |
| **m-01** — Structure numbering conformance | MINOR | INS-2 (§D7 consolidated header), REP-3a–f (headers), REP-2 (§D3), REP-8 (Appendix B) | One `§D6` (Discovery, Visibility & Participation Model) + one `§D7` (Catalog Curation & Vendor Lifecycle Workflow Model) with `###` subsections (§D7.1–§D7.5). References, §D3 preamble, and Appendix B realigned. Content/ownership/inventory unchanged. |
| **m-02** — Seed audit ownership clarification | MINOR | REP-6 (§D11) | "seed" annotated as Admin (Module 8 import job)-authored; Marketplace does not originate seed audit writes; listing retained for Doc-2 §9 completeness. Ownership unmoved; audit references unchanged. |
| **N-01** — `VendorVerified` dual-consumer | NITPICK (optional) | REP-4 (§D9) | Note added: `VendorVerified` legitimately drives multiple Marketplace consumers; Pass-B defines subscription behavior. Event flow unchanged. |

---

## 3 — Exact Insertions

**INS-1 — §D8: conditional ban-lift placeholder contract (M-01).** Insert the following record immediately **after** the `marketplace.reflect_vendor_ban.v1` record (after its *Sources* line; before the section `---`).

- *Anchor (Existing Text — unchanged; last line of the `reflect_vendor_ban.v1` record):*
  > `- *Sources:* ownership Doc-2 §3.3; authority §5.2 / DD-3; lifecycle §5.3; audit §9; event §8 (Admin emitter).`
- *Insert immediately after the anchor:*
  > ``#### `marketplace.reflect_vendor_ban_lift.v1` — Reflect Vendor Ban-Lift *(conditional placeholder — **[DD-8]**; non-implementable until resolved)* · 21.5 System · Actor: System``
  >
  > `- *Capability:* on a future Admin ban-lift event, set the vendor-profile status `banned → active` (parallel to `reflect_vendor_ban.v1`). **Blocked: Doc-2 §8 declares no `VendorBanLifted` event — [DD-8]; this contract is non-implementable until that event is declared (or the Doc-2 custodian confirms the lift is an Admin direct-write to `vendor_profiles.status`). No event coined; no lifecycle state invented; no local resolution.**`
  > `- *Owned entity:* `vendor_profiles` (status dimension) · *Authority:* System; platform scope; not user-invocable. · *Lifecycle:* Doc-2 §5.3 status `banned → active` (lift; literal edge — no edge invented). · *Audit:* would bind Doc-2 §9 Vendor-profile "ban/lift" (lift direction) by pointer, attribution system — **carrier pending [DD-8]**. · *Events:* would consume a future Admin ban-lift event — **none exists in Doc-2 §8 ([DD-8])**. · *Integration:* **consume** (delivery contract would be Admin's per §4.4); contingent on DD-8.`
  > `- *Sources:* ownership Doc-2 §3.3; authority §5.2 / DD-3 / **[DD-8]**; lifecycle §5.3; audit §9; event §8 (**[DD-8]** — no lift event).`

**INS-2 — §D7: consolidated section header (m-01).** Insert the following **before** the current `## §D7 — Catalog & Taxonomy …` header (which REP-3a demotes to `### §D7.1`).

- *Anchor (Existing Text — the header being demoted by REP-3a):*
  > ``## §D7 — Catalog & Taxonomy (`categories`, `category_assignments`)``
- *Insert immediately before the anchor:*
  > `## §D7 — Catalog Curation & Vendor Lifecycle Workflow Model`
  >
  > `*Single frozen-structure section (Doc-4D §D7). The areas below are `###` subsections (§D7.1–§D7.5); content, ownership, and contract inventory are unchanged from Pass-A.*`

**INS-3 — Appendix C: DD-8 dependency entry (M-01).** Insert the following bullet immediately **after** the DD-7 bullet and **before** the `[ESC-MKT-AUDIT]` bullet.

- *Anchor (Existing Text — the DD-7 bullet):*
  > `- **DD-7** — `vendor_claim_records` tenancy (Doc-2 §6 platform-owned vs §3.3/§10.3 Marketplace child). Channel: Doc-2 §6/§3.3 reconciliation; mutation ownership not finalized.`
- *Insert immediately after the anchor:*
  > `- **DD-8** — **Vendor Ban-Lift Event Gap.** Doc-2 §5.3 declares the `banned ─lift─▶ active` transition, but Doc-2 §8 declares **no `VendorBanLifted` event** (only `VendorBanned`). Marketplace cannot reflect the ban-lift and **cannot resolve this locally**. Channel: **Doc-2 §8 additive** (Admin declares the lift event) — or Doc-2 custodian confirmation that the lift is an Admin direct-write. Carrier: `marketplace.reflect_vendor_ban_lift.v1` (conditional placeholder, **non-implementable until DD-8 resolves**). No event coined; no lifecycle state invented.`

---

## 4 — Exact Replacements

**REP-1 — §D0 carried-markers (M-01).** Add DD-8 to the inline marker list.

- *Existing Text (fragment):*
  > `DD-7 (`vendor_claim_records` tenancy — Doc-2 §6/§3.3 reconciliation), `[ESC-MKT-AUDIT]` (audit-action gaps — Doc-2 §9 additive).`
- *Amendment Text:*
  > `DD-7 (`vendor_claim_records` tenancy — Doc-2 §6/§3.3 reconciliation), **DD-8 (vendor ban-lift event gap — Doc-2 §8 additive; raised by the Pass-A Hard Review)**, `[ESC-MKT-AUDIT]` (audit-action gaps — Doc-2 §9 additive).`

**REP-2 — §D3 preamble (m-01).** Realign the bounded-context references to the corrected numbering.

- *Existing Text:*
  > `Contract records below are grouped by the frozen structure's bounded contexts: **Vendor Profile & Identity-Anchor** (§D4/§D5 — profile, claim, ownership, capacity, declared tier), **Catalog & Taxonomy** (§D7 — categories, assignments), **Product & Specification** (§D7 — products, spec library), **Profile Experience & Presentation** (§D6 — microsites, sections, branding, SEO, custom domains, showcase), **Advertising** (§D7 — advertisements), **Discovery & Read-Model** (§D6 — search/directory/public reads, `vendor_matching_attributes` exposure). All contexts are within Marketplace; cross-module interactions are §D8. *Source:* frozen Doc-4D structure §D3.`
- *Amendment Text:*
  > `Contract records below are grouped under the frozen structure's two domain sections: **§D4/§D5 — Vendor Profile & Identity-Anchor** (profile, claim, ownership, capacity, declared tier); **§D7 — Catalog Curation & Vendor Lifecycle Workflow Model** with subsections **§D7.1 Catalog & Taxonomy**, **§D7.2 Product & Specification**, **§D7.3 Profile Experience & Presentation** (microsites, sections, branding, SEO, custom domains, showcase), **§D7.4 Advertising**, **§D7.5 Catalog Favorites**; and **§D6 — Discovery, Visibility & Participation Model** (search/directory/public reads, `vendor_matching_attributes` exposure). All contexts are within Marketplace; cross-module interactions are §D8. *Source:* frozen Doc-4D structure §D3/§D6/§D7.`

**REP-3a — §D7.1 header (m-01).**
- *Existing:* ``## §D7 — Catalog & Taxonomy (`categories`, `category_assignments`)``
- *Amendment:* ``### §D7.1 — Catalog & Taxonomy (`categories`, `category_assignments`)``

**REP-3b — §D7.2 header (m-01).**
- *Existing:* ``## §D7 — Product & Specification (`products`, `product_spec_links`, `spec_library_entries`, `spec_documents`)``
- *Amendment:* ``### §D7.2 — Product & Specification (`products`, `product_spec_links`, `spec_library_entries`, `spec_documents`)``

**REP-3c — §D7.3 header (m-01).**
- *Existing:* ``## §D6 — Profile Experience & Presentation (`microsites`, `profile_sections`, `branding_assets`, `seo_settings`, `showcase_projects`, `custom_domains`)``
- *Amendment:* ``### §D7.3 — Profile Experience & Presentation (`microsites`, `profile_sections`, `branding_assets`, `seo_settings`, `showcase_projects`, `custom_domains`)``

**REP-3d — §D7.4 header (m-01).**
- *Existing:* ``## §D7 — Advertising (`advertisements`)``
- *Amendment:* ``### §D7.4 — Advertising (`advertisements`)``

**REP-3e — §D7.5 header (m-01).**
- *Existing:* ``## §D6 — Catalog Favorites (`catalog_favorites`)``
- *Amendment:* ``### §D7.5 — Catalog Favorites (`catalog_favorites`)``

**REP-3f — §D6 header (m-01).** Relabel the Discovery block to the single frozen `§D6` name.
- *Existing:* ``## §D6 — Discovery, Visibility & Read-Model (`vendor_matching_attributes`, public reads)``
- *Amendment:* ``## §D6 — Discovery, Visibility & Participation Model (`vendor_matching_attributes`, public reads)``

*(Body-order note: after INS-2/REP-3, the consolidated `§D7` block — §D7.1–§D7.5 — precedes the `§D6` Discovery block in body order. Section numbers are now **unique and frozen-conformant**, resolving the duplicate-header navigation hazard. A non-substantive editorial reflow to sequence §D6 before §D7 may be applied at Pass-A-closure integration; no content, ownership, or inventory change.)*

**REP-4 — §D9 consumed events (M-01 + N-01).**
- *Existing Text:*
  > `- **Consumed (Doc-2 §8, emitted by other modules; delivery authored by emitter per §4.4):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated` (Trust); `VendorBanned` (Admin).`
- *Amendment Text:*
  > `- **Consumed (Doc-2 §8, emitted by other modules; delivery authored by emitter per §4.4):** `VendorVerified`, `VendorTierChanged[verified]`, `TrustScoreUpdated`, `PerformanceScoreUpdated` (Trust); `VendorBanned` (Admin). **Ban-lift (`banned → active`, Doc-2 §5.3) has no consumer — Doc-2 §8 declares no `VendorBanLifted` event ([DD-8]); `marketplace.reflect_vendor_ban_lift.v1` is the conditional placeholder, non-implementable until DD-8 resolves.** *(N-01: `VendorVerified` legitimately drives multiple Marketplace consumers — `reflect_verified_claim_status` and `rebuild_vendor_matching_attributes`; Pass-B defines the subscription behavior. Event flow unchanged.)*`

**REP-5 — §D9 carried-markers (M-01).**
- *Existing Text:*
  > `- **Carried markers (verbatim):** DD-1…DD-7, `[ESC-MKT-AUDIT]` — none resolved. *Source:* Doc-2 §8; Doc-4A §16; Doc-4B outbox-write.`
- *Amendment Text:*
  > `- **Carried markers:** DD-1…DD-7 (verbatim from the frozen structure) + **DD-8 (newly raised — Pass-A Hard Review; Doc-2 §8 channel)**, `[ESC-MKT-AUDIT]` — none resolved. *Source:* Doc-2 §8; Doc-4A §16; Doc-4B outbox-write.`

**REP-6 — §D11 audit surface (m-02 + M-01).** Annotate "seed" (Admin-authored) and the ban-lift carrier gap.
- *Existing Text:*
  > `- **Bound (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`):** Vendor-profile domain (create, seed, claim, verify, suspend, ban/lift, tier change [declared + verified], category change, capability/override change, ownership transfer) and Profile-experience domain (theme/layout/section/branding/SEO/domain changes, publish/unpublish); spec/document new revision (documents domain).`
- *Amendment Text:*
  > `- **Bound (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`):** Vendor-profile domain (create, **seed** [— **seed audit records are authored by Admin (Module 8 import job — `import_jobs`/`import_rows`, Doc-4J); Marketplace does not originate seed audit writes; listed here for Doc-2 §9 domain completeness only**], claim, verify, suspend, **ban/lift** [— the **ban** direction is `reflect_vendor_ban.v1`; the **lift** direction (`banned → active`) has **no Marketplace carrier until [DD-8]** resolves — `marketplace.reflect_vendor_ban_lift.v1` is the conditional placeholder], tier change [declared + verified], category change, capability/override change, ownership transfer) and Profile-experience domain (theme/layout/section/branding/SEO/domain changes, publish/unpublish); spec/document new revision (documents domain).`

**REP-7 — Appendix A event-consumers row (M-01).**
- *Existing Text:*
  > `| Event consumers | reflect_vendor_ban (+ sync_verified_financial_tier, reflect_verified_claim_status, rebuild_vendor_matching_attributes above) | 21.5 System | System | DD-1, DD-3 |`
- *Amendment Text:*
  > `| Event consumers | reflect_vendor_ban, **reflect_vendor_ban_lift** *(conditional placeholder — [DD-8])* (+ sync_verified_financial_tier, reflect_verified_claim_status, rebuild_vendor_matching_attributes above) | 21.5 System | System | DD-1, DD-3, **DD-8** |`

**REP-8 — Appendix B binding rows (m-01).** Collapse the four mislabeled `§D6`/`§D7` rows to two frozen-conformant rows.
- *Existing Text (four consecutive rows):*
  > `| §D7 (catalog/product/spec) | §6, §13, §17 | Doc-4B audit/outbox | Doc-2 §3.3/§7/§8/§9; DD-4 |`
  > `| §D6 (profile experience/domains/showcase) | §6, §13, §17, §18 | Doc-4B audit/outbox/POLICY/flags; Billing (DD-5) | Doc-2 §3.3/§7/§8/§9 |`
  > `| §D7 (advertising) | §5.6, §6, §13, §17 | Doc-4B audit/outbox; Billing (DD-5) | Doc-2 §5.8/§7/§8/§9; `[ESC-MKT-AUDIT]` |`
  > `| §D6 (discovery/read-model) | §7/§7.5, §22.3 | Doc-4B (consume); RFQ expose (DD-2) | Doc-2 §3.3/§10.3 |`
- *Amendment Text (two rows):*
  > `| §D7 — Catalog Curation & Vendor Lifecycle Workflow (§D7.1 catalog · §D7.2 product/spec · §D7.3 profile experience/domains/showcase · §D7.4 advertising · §D7.5 favorites) | §5.6, §6/§6B, §13, §17, §18, §4B | Doc-4B audit/outbox/POLICY/flags; Billing (DD-5) | Doc-2 §3.3/§5.8/§7/§8/§9/§10.3; DD-4; `[ESC-MKT-AUDIT]` |`
  > `| §D6 — Discovery, Visibility & Participation | §7/§7.5, §22.3 | Doc-4B (consume); RFQ expose (DD-2) | Doc-2 §3.3/§10.3 |`

**REP-9 — Appendix C intro (M-01).** Note DD-8 is newly raised (DD-1…DD-7 remain unchanged from the frozen structure).
- *Existing Text:*
  > `Carried **verbatim** from `Doc-4D_Structure_v1.0_FROZEN.md` §D0/Appendix C. Pass-A **does not resolve, redesign around, or invent workarounds** for any of these.`
- *Amendment Text:*
  > `DD-1…DD-7 are carried **verbatim** from `Doc-4D_Structure_v1.0_FROZEN.md` §D0/Appendix C; **DD-8 is newly raised by the Pass-A Hard Review** (M-01) and routed to the Doc-2 §8 channel. Pass-A (as amended) **does not resolve, redesign around, or invent workarounds** for any of these.`

---

## 5 — Preservation Validation

| Property | Status | Note |
|---|---|---|
| No ownership changes | **Preserved** | DD-8 carries the gap; the placeholder writes only Marketplace's `vendor_profiles.status` (already Marketplace-owned); m-02 confirms seed-audit ownership is Admin's (unmoved). |
| No authority changes | **Preserved** | No slug added/changed; placeholder is System actor (existing). |
| No entity additions | **Preserved** | No entity; references existing `vendor_profiles`. |
| No event additions | **Preserved** | `VendorBanLifted` is **not** coined — DD-8 carries the missing event to the Doc-2 §8 channel; placeholder is non-implementable until then. |
| No permission additions | **Preserved** | None. |
| No audit-action additions | **Preserved** | "ban/lift" already exists in Doc-2 §9; no action coined; m-02 annotates "seed" authorship only. |
| No POLICY-key additions | **Preserved** | None. |
| No template additions | **Preserved** | 21.5 System (existing) for the placeholder. |
| No lifecycle modifications | **Preserved** | `banned → active` is the **literal** Doc-2 §5.3 edge; no edge added or modified. |
| No state-machine modifications | **Preserved** | Doc-2 §5.3/§5.8 untouched. |
| No module-boundary modifications | **Preserved** | Ban decision = Admin (DD-3); lift event = Admin (DD-8); Marketplace reflects only. |
| DD-1 … DD-7 preserved | **Preserved** | Unchanged; DD-8 appended (newly raised), not a modification of DD-1…DD-7. |
| `[ESC-MKT-AUDIT]` preserved | **Preserved** | Unchanged. |
| Frozen ownership / authority rules | **Preserved** | All by pointer; single-authorship intact; one owner per capability. |
| Structure numbering conformance | **Resolved (m-01)** | One §D6 + one §D7 (with §D7.1–§D7.5 subsections); §D3 + Appendix B realigned; content/inventory unchanged. |
| Corpus conflicts not resolved locally | **Preserved** | DD-8 (Doc-2 §8) and the §6/§3.3 DD-7 tension routed to their channels; nothing resolved here. |

---

*End of Doc-4D Content Pass-A Patch v1.0.1 — additive resolution of approved Hard Review findings M-01, m-01, m-02 + optional N-01. DD-8 raised and carried (Doc-2 §8 channel); `marketplace.reflect_vendor_ban_lift.v1` added as a conditional, non-implementable placeholder; §D6/§D7 numbering made frozen-conformant; seed-audit authorship annotated. No `VendorBanLifted` or any entity/event/slug/audit-action/POLICY-key/template/lifecycle invented; DD-1…DD-7 and `[ESC-MKT-AUDIT]` preserved; no ownership, authority, or boundary change.*
