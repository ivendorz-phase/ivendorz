# Doc-4D — Structure Patch v0.1.1 (Marketplace & Discovery — Hard Review Resolution)

| Field | Value |
|---|---|
| Patch ID | Doc-4D-Structure-Patch-v0.1.1 |
| Applies To | `Doc-4D_Structure_Proposal_v0.1.md` (Module 2 — Marketplace & Discovery) |
| Produces | Doc-4D Structure Proposal v0.1 **as amended** — Structure-Freeze candidate |
| Patch Authority | Architecture Board Directive — approved `Doc-4D_Structure_Hard_Review_Report_v1.0.md` findings **M-01, m-01, m-02, m-03** + optional cleanup **N-01, N-02** |
| Patch Type | **Additive governance patch only.** Adds one dependency marker (DD-7), one named escalation marker (`[ESC-MKT-AUDIT]`), three clarifying annotations/prohibitions, and two cleanup edits. **No structure redesign; no section added or removed; no ownership moved.** |
| Coining guarantee | **No entity, event, permission slug, audit action, POLICY key, or contract invented.** DD-7 carries a pre-existing Doc-2 tension; `[ESC-MKT-AUDIT]` carries an audit-enumeration gap; both routed to named channels, **neither resolved here**. Corpus conflicts are carried, not resolved locally. |
| Conforms To | Architecture FINAL, ADRs v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0 (all FROZEN) |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D Structure Proposal v0.1 → Hard Review Report v1.0 |
| Status | **APPROVED — additive structure patch** |

---

## 1 — Purpose

This patch applies the Architecture Board–approved Hard Review findings to `Doc-4D_Structure_Proposal_v0.1.md` as **targeted, additive amendments**, each quoting the exact existing text it replaces or extends. It carries a newly surfaced pre-existing Doc-2 ownership tension as dependency marker **DD-7** (M-01); clarifies that the `claimed → verified` transition is Trust-event-driven and Marketplace-reflected, bound to DD-1 (m-01); adds an explicit single-authorship prohibition on Marketplace authoring notification contracts (m-02); establishes the named **`[ESC-MKT-AUDIT]`** escalation marker with its known candidate gaps (m-03); and applies two cleanup edits (N-01 adaptation-note removal; N-02 event-consumption separation). Nothing is resolved locally and nothing is invented — DD-7 and `[ESC-MKT-AUDIT]` are carried to their named channels. The structure remains approved in principle; no section is redesigned, added, removed, or re-owned.

---

## 2 — Findings Addressed

| Finding | Severity | Patch Item | Resolution summary |
|---|---|---|---|
| **M-01** | MAJOR | PATCH-4D-S-01 (A–B) | Add **DD-7** (`vendor_claim_records` tenancy-class ambiguity: §6 platform-owned vs. §3.3/§10.3 Marketplace child) to the §D0 register and reference it inline in §D2. Carried; not resolved. |
| **m-01** | MINOR | PATCH-4D-S-02 | In §D4, annotate `claimed → verified` as **Trust-event-driven** (idempotent consumer of `VendorVerified`; Marketplace reflects, does not decide), bound to **DD-1**. No state-machine change. |
| **m-02** | MINOR | PATCH-4D-S-03 (A–B) | In §D8, add explicit prohibition: **Marketplace MUST NOT author notification/Communication contracts**; it emits events; Communication owns fan-out + integrations (single-authorship). |
| **m-03** | MINOR | PATCH-4D-S-04 (A–C) | Establish named **`[ESC-MKT-AUDIT]`** marker in §D0/§D11/Appendix C, seeded with the known candidate gaps (advertisement review lifecycle; advertisement approval/rejection; product publish/unpublish). No audit action invented. |
| **N-01** | NITPICK | PATCH-4D-S-05 (A–B) | Remove the parenthetical adaptation notes in §D4 and §D5 preambles (the §D0 family-map note suffices). |
| **N-02** | NITPICK | PATCH-4D-S-06 | In §D9, separate `VendorVerified` (claim-status update) from `TrustScoreUpdated`/`PerformanceScoreUpdated` (attribute rebuild) in the consumed-events description. |

---

## 3 — Patch Instructions

> Convention: each amendment quotes the **Existing Text** verbatim from `Doc-4D_Structure_Proposal_v0.1.md` and gives the **Amendment Text** (replacement) or the **Insert/Delete** directive. Section anchors are the base document's.

### PATCH-4D-S-01 — M-01: carry `vendor_claim_records` tenancy ambiguity as DD-7

**PATCH-4D-S-01-A** — §D0 freeze-gate register: **insert** DD-7 immediately **after** the DD-6 bullet.

- *Anchor (Existing Text — unchanged):*
  > `- **DD-6 — \`marketplace.*\` POLICY key registration.** Marketplace runtime tunables (e.g., category-tree limits, assignment caps, ad-placement caps, domain-verification windows, profile-experience limits) may require POLICY keys; Doc-3 §12.2 has no dedicated \`marketplace.*\` block. **Channel:** Doc-3 §12.2 additive registration (the channel used for the Doc-4B \`core.*\` and the anticipated \`identity.*\` blocks); reference intended keys by name, never invent (Doc-4A §18.2).`
- *Insert immediately after the anchor:*
  > `- **DD-7 — \`vendor_claim_records\` tenancy-class ambiguity.** Doc-2 §6 designates \`vendor_claim_records\` as **platform-owned**; Doc-2 §10.3 places it in the \`marketplace.\` schema and Doc-2 §3.3 lists it as a Vendor Profile child aggregate. This is a **pre-existing Doc-2 internal tension** (not introduced by Doc-4D). **Channel:** Doc-2 §6 / §3.3 reconciliation patch. **Interim stance:** §D2 lists \`vendor_claim_records\` as a Vendor Profile child aggregate per §3.3/§10.3; content-pass mutation contracts over \`vendor_claim_records\` are **not finalized** until DD-7 is resolved. **No ownership decision is made here** (carried, not resolved — §0.6).`
- *Rationale:* Surfaces the §6-vs-§3.3/§10.3 tension as a carried marker so content authors do not assume Marketplace mutation ownership before the corpus is reconciled. No owner chosen; routed to the Doc-2 patch channel.

**PATCH-4D-S-01-B** — §D2 Owned-aggregates: reference DD-7 inline beside `vendor_claim_records`.

- *Existing Text:*
  > `  - **Owned aggregates (Doc-2 §2):** Vendor Profile (\`vendor_profiles\` + children: \`vendor_capacity_profiles\`, \`declared_financial_tiers\`, \`financial_tier_history\`, \`category_assignments\`, \`vendor_matching_attributes\`, \`vendor_ownership_history\`, \`vendor_claim_records\`, \`profile_sections\`, \`branding_assets\`, \`seo_settings\`, \`custom_domains\`), Category, Product (+\`product_spec_links\`), Specification Library Entry (+\`spec_documents\`), Microsite, Advertisement, Showcase Project, Catalog Favorite.`
- *Amendment Text:*
  > `  - **Owned aggregates (Doc-2 §2):** Vendor Profile (\`vendor_profiles\` + children: \`vendor_capacity_profiles\`, \`declared_financial_tiers\`, \`financial_tier_history\`, \`category_assignments\`, \`vendor_matching_attributes\`, \`vendor_ownership_history\`, \`vendor_claim_records\` (**tenancy-class ambiguity — DD-7; ownership not finalized**), \`profile_sections\`, \`branding_assets\`, \`seo_settings\`, \`custom_domains\`), Category, Product (+\`product_spec_links\`), Specification Library Entry (+\`spec_documents\`), Microsite, Advertisement, Showcase Project, Catalog Favorite.`
- *Rationale:* Inline marker per the review's recommendation; the §3.3/§10.3 child-aggregate reading is retained as the interim listing, explicitly flagged as not-finalized pending DD-7. No ownership moved.

### PATCH-4D-S-02 — m-01: annotate `claimed → verified` authority in §D4

- *Existing Text:*
  > `  - **Vendor Profile (Doc-2 §5.3)** — the two orthogonal dimensions: **claim** (\`seeded → invited → claimed → verified\`; direct registration creates \`claimed\`) and **operational status** (\`active ⇄ suspended\`; \`active → banned → active\`). Authority/actor per transition (claim requires a controlling org; suspend/ban are platform-governance — DD-3); the **ownership-transfer → Trust Protection Workflow** trigger (trust freeze → compliance review → reactivation) bound by pointer (DD-1).`
- *Amendment Text:*
  > `  - **Vendor Profile (Doc-2 §5.3)** — the two orthogonal dimensions: **claim** (\`seeded → invited → claimed → verified\`; direct registration creates \`claimed\`) and **operational status** (\`active ⇄ suspended\`; \`active → banned → active\`). Authority/actor per transition (claim requires a controlling org; suspend/ban are platform-governance — DD-3). The **\`claimed → verified\` transition is Trust-event-driven**: Marketplace updates the claim status as an **idempotent consumer of the \`VendorVerified\` event** (Doc-2 §8; Trust emitter) and **reflects — never decides — verification** (bound to **DD-1**); this mirrors the \`financial_tier_history\` exclusive-writer-as-consumer pattern (§D9). **No \`§5.3\` edge is added or modified.** The **ownership-transfer → Trust Protection Workflow** trigger (trust freeze → compliance review → reactivation) is bound by pointer (DD-1).`
- *Rationale:* Bounds the `claimed → verified` authority so a content author cannot author a Marketplace command that *decides* verification; the edge itself (Doc-2 §5.3) is unchanged. Binds explicitly to DD-1; no lifecycle or state-machine modification.

### PATCH-4D-S-03 — m-02: notification single-authorship prohibition in §D8

**PATCH-4D-S-03-A** — replace the Communication clause within the §D8 Expected-content-scope paragraph.

- *Existing Text (substring within the §D8 scope paragraph):*
  > `**Communication (Doc-4H)** — Marketplace events trigger notification dispatch (Communication authors the integration per §4.4);`
- *Amendment Text:*
  > `**Communication (Doc-4H)** — Marketplace events trigger notification dispatch; **Communication owns notification fan-out and authors all notification/Communication integration contracts (Doc-4A §4.4). Marketplace MUST NOT author any notification-dispatch or Communication contract — the outbox event is the only authored product of a Marketplace state change that crosses to Communication (single-authorship preserved).** Per-event Communication-consumption legs (at minimum \`VendorClaimed\`, \`VendorSuspended\`, \`VendorOwnershipTransferred\`, \`ProfilePublished\` — confirmed against Doc-2 §8 at content authoring) are Communication-authored;`
- *Rationale:* Makes the single-authorship boundary explicit (Doc-4A §4.4) and forbids shadow notification logic in Marketplace contracts; adds per-event clarity for the Communication leg. No integration contract authored.

**PATCH-4D-S-03-B** — augment the §D8 Excluded scope.

- *Existing Text:*
  > `- **Excluded scope:** No ownership transfer in any direction; no integration contract authored (structure only); Communication/Trust/Billing/RFQ author their own side per single-authorship.`
- *Amendment Text:*
  > `- **Excluded scope:** No ownership transfer in any direction; no integration contract authored (structure only); Communication/Trust/Billing/RFQ author their own side per single-authorship. **Marketplace authors no notification-dispatch or Communication contract (m-02): emitting the outbox event is the boundary; Communication owns the fan-out.**`
- *Rationale:* Restates the prohibition in the excluded-scope home for "MUST NOT," reinforcing the boundary for content-pass authors.

### PATCH-4D-S-04 — m-03: establish the named `[ESC-MKT-AUDIT]` escalation marker

**PATCH-4D-S-04-A** — §D0 freeze-gate register: **insert** the `[ESC-MKT-AUDIT]` marker immediately **after** the DD-7 bullet (added by PATCH-4D-S-01-A).

- *Anchor (Existing Text — as amended by PATCH-4D-S-01-A; DD-7 bullet):*
  > `- **DD-7 — \`vendor_claim_records\` tenancy-class ambiguity.** … **No ownership decision is made here** (carried, not resolved — §0.6).`
- *Insert immediately after the DD-7 bullet:*
  > `- **\`[ESC-MKT-AUDIT]\` — Marketplace audit-action gaps not separately enumerated in Doc-2 §9.** Any Marketplace mutation whose audit action is not separately enumerated in the Doc-2 §9 Vendor-profile / Profile-experience domains. **Known candidate gaps (identifiable at structure time):** advertisement review lifecycle (submission/review), advertisement approval/rejection (§5.8 \`pending_review → scheduled\` / \`pending_review → rejected\`), and product publish/unpublish (\`draft → published → unpublished\`). **Interim:** bind the nearest enumerated §9 action by pointer; **no audit action invented**. **Channel:** Doc-2 §9 additive patch. Content passes carry and expand this marker (analogous to the Identity \`[ESC-IDN-AUDIT]\` pattern).`
- *Rationale:* Gives content authors a named structural anchor (matching the `[ESC-IDN-AUDIT]` precedent) and seeds the corpus-identifiable gaps, preventing ad-hoc audit-action invention. No audit action created; routed to the Doc-2 §9 channel.

**PATCH-4D-S-04-B** — §D11 Escalation points: name the marker and seed the gaps.

- *Existing Text:*
  > `**Escalation points:** any Marketplace mutation whose audit action is not separately enumerated in Doc-2 §9 is flagged for a Doc-2 §9 additive (escalation marker, analogous to the Identity \`[ESC-IDN-AUDIT]\` pattern) — identified at content authoring, never invented.`
- *Amendment Text:*
  > `**Escalation points:** any Marketplace mutation whose audit action is not separately enumerated in Doc-2 §9 is carried under the named **\`[ESC-MKT-AUDIT]\`** marker (§D0 register; Appendix C; analogous to the Identity \`[ESC-IDN-AUDIT]\` pattern) — **interim:** bind the nearest §9 action by pointer; **no audit action invented**; **channel:** Doc-2 §9 additive. **Known candidate gaps identifiable now:** advertisement review lifecycle, advertisement approval/rejection (§5.8), and product publish/unpublish.`
- *Rationale:* Replaces the unnamed escalation posture with the named `[ESC-MKT-AUDIT]` marker and the seeded suspects, consistent with §D0.

**PATCH-4D-S-04-C** — §D13 Appendix C inventory: reference DD-7 and `[ESC-MKT-AUDIT]`.

- *Existing Text:*
  > `  - **Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers.** DD-1…DD-6 (+ any \`[ESC-MKT-*]\` raised at content authoring), with named resolution channels; carried, never silently resolved (§0.6).`
- *Amendment Text:*
  > `  - **Appendix C — Carried Freeze-Gate Dependencies & Escalation Markers.** DD-1…**DD-7** and the named **\`[ESC-MKT-AUDIT]\`** marker (+ any further \`[ESC-MKT-*]\` raised at content authoring), with named resolution channels; carried, never silently resolved (§0.6).`
- *Rationale:* Keeps the Appendix C inventory consistent with the DD-7 (M-01) and `[ESC-MKT-AUDIT]` (m-03) additions to §D0; no resolution implied.

### PATCH-4D-S-05 — N-01: remove §D4 / §D5 adaptation-note preambles

**PATCH-4D-S-05-A** — §D4: **delete** the parenthetical adaptation note.

- *Existing Text (delete this line):*
  > `*(Module-2 domain section — the Marketplace analogue of a lifecycle model; adapted from the request's "RFQ Lifecycle Model" to Marketplace ownership per the Board's family-map reconciliation.)*`
- *Amendment:* **Deleted.** (The §D4 title stands on its own; the §D0 family-map reconciliation note is sufficient.) No meaning change.
- *Rationale:* Removes a reference to the label-slip request that could read as an RFQ-scope signal in the frozen structure (N-01).

**PATCH-4D-S-05-B** — §D5: **delete** the parenthetical adaptation note.

- *Existing Text (delete this line):*
  > `*(Module-2 domain section — the Marketplace analogue of an authority model; adapted from "Procurement Authority Model".)*`
- *Amendment:* **Deleted.** No meaning change.
- *Rationale:* As PATCH-4D-S-05-A.

### PATCH-4D-S-06 — N-02: separate `VendorVerified` from score events in §D9

- *Existing Text (substring within the §D9 Consumed-events description):*
  > `\`VendorVerified\`, \`TrustScoreUpdated\`/\`PerformanceScoreUpdated\` (→ rebuild \`vendor_matching_attributes\`)`
- *Amendment Text:*
  > `\`VendorVerified\` (→ update claim status \`claimed → verified\` as an idempotent consumer — see §D4 / DD-1; then trigger matching-attribute rebuild), \`TrustScoreUpdated\`/\`PerformanceScoreUpdated\` (→ rebuild \`vendor_matching_attributes\`)`
- *Rationale:* Disambiguates the distinct consumption effects (`VendorVerified` → claim-status update; score events → attribute rebuild), consistent with the m-01 annotation. No event invented; consumption direction unchanged (Trust emits, Marketplace consumes).

---

## 4 — Corpus Impact

### 4.1 — Affected base-document locations (and nothing else)

| Base location | Patch item(s) | Nature |
|---|---|---|
| §D0 freeze-gate register | PATCH-4D-S-01-A, PATCH-4D-S-04-A | insert DD-7; insert `[ESC-MKT-AUDIT]` |
| §D2 Owned aggregates | PATCH-4D-S-01-B | inline DD-7 reference beside `vendor_claim_records` |
| §D4 Vendor Profile lifecycle + preamble | PATCH-4D-S-02, PATCH-4D-S-05-A | `claimed → verified` Trust-event annotation; delete adaptation note |
| §D5 preamble | PATCH-4D-S-05-B | delete adaptation note |
| §D8 scope + excluded scope | PATCH-4D-S-03-A/B | notification single-authorship prohibition |
| §D9 consumed events | PATCH-4D-S-06 | separate `VendorVerified` from score events |
| §D11 escalation points | PATCH-4D-S-04-B | name `[ESC-MKT-AUDIT]` + seed gaps |
| §D13 Appendix C inventory | PATCH-4D-S-04-C | reference DD-7 + `[ESC-MKT-AUDIT]` |

No section is added or removed; §D1, §D3, §D6, §D7, §D10, §D12, and the appendices A/B/D inventory are unchanged. The section count (§D0–§D13) is unchanged.

### 4.2 — Markers added (carried, not resolved)

| Marker | Type | Channel | Resolved here? |
|---|---|---|---|
| **DD-7** | Dependency marker — `vendor_claim_records` tenancy ambiguity (Doc-2 §6 vs §3.3/§10.3) | Doc-2 §6/§3.3 reconciliation patch | **No** — carried |
| **`[ESC-MKT-AUDIT]`** | Escalation marker — Marketplace audit-action gaps (ad lifecycle; product publish/unpublish) | Doc-2 §9 additive patch | **No** — carried |

### 4.3 — Preservation validation

| Property | Status | Note |
|---|---|---|
| No structure redesign | **Preserved** | Only list-item insertions, inline annotations, a prohibition, and two cleanup edits. |
| No section added/removed | **Preserved** | §D0–§D13 intact; DD-7 / `[ESC-MKT-AUDIT]` are register list items, not sections. |
| No ownership moved | **Preserved** | DD-7 carries the tension without choosing an owner; §D2 keeps the interim §3.3/§10.3 reading, flagged. |
| No entity / event / permission / audit action / POLICY key / contract invented | **Preserved** | All references are to existing Doc-2 §5/§6/§8/§9/§10.3 items; markers carry gaps, never coin. |
| Corpus conflicts not resolved locally | **Preserved** | M-01's §6-vs-§3.3/§10.3 tension routed to the Doc-2 channel; m-03's audit gap routed to Doc-2 §9. |
| State machines (Doc-2 §5.3/§5.8) | **Preserved** | m-01 annotates authority on `claimed → verified`; no edge added or modified. |
| DD-1…DD-6 | **Preserved/unchanged** | DD-1 referenced (m-01) but unchanged; DD-2…DD-6 untouched. |
| Single-authorship (Doc-4A §4.4) | **Reinforced** | m-02 makes the Communication boundary explicit; no integration contract authored. |
| Family-map reconciliation (Doc-4D = Marketplace) | **Preserved** | N-01 removes only the request-reference preambles; the §D0 reconciliation note stands. |

---

## 5 — Governance Notes

- **Nothing invented; nothing resolved locally.** DD-7 and `[ESC-MKT-AUDIT]` are carried markers routed to their owning-document channels (Doc-2 §6/§3.3; Doc-2 §9). No owner is chosen for `vendor_claim_records`; no audit action is coined; no entity, event, permission slug, POLICY key, or contract is created.
- **Pre-existing tension acknowledged, not introduced.** The `vendor_claim_records` §6-vs-§3.3/§10.3 conflict exists in frozen Doc-2; this patch only surfaces it as DD-7 per flag-and-halt (§0.6), leaving resolution to the Doc-2 patch channel.
- **State-machine discipline.** The m-01 annotation bounds the *authority* of the `claimed → verified` edge (Trust-event-driven consumer); it does not add, remove, or modify any Doc-2 §5.3 transition.
- **Scope discipline.** Only the directive-listed findings (M-01, m-01, m-02, m-03) and the explicitly-authorized optional cleanups (N-01, N-02) are applied. No other section is touched; no new requirement is created.

---

## 6 — Approval Recommendation

**RECOMMEND APPROVAL — additive structure patch; Structure Freeze may proceed upon adoption.**

The one MAJOR (M-01) and three MINOR (m-01, m-02, m-03) findings that precluded Structure Freeze are resolved additively, and the two optional NITPICK cleanups (N-01, N-02) are applied. Each amendment cites the exact base text and carries (never resolves) the underlying corpus tensions through their named channels. No section is redesigned, added, removed, or re-owned; no entity, event, permission slug, audit action, POLICY key, or contract is invented; DD-1…DD-6 and the family-map reconciliation are preserved. Upon adoption, `Doc-4D_Structure_Proposal_v0.1.md` (as amended by this patch) is recommended to proceed to **Structure Freeze** (→ `Doc-4D_Structure_v1.0_FROZEN`), after which Doc-4D content passes may begin.

*End of Doc-4D Structure Patch v0.1.1 — additive resolution of approved Hard Review findings M-01, m-01, m-02, m-03 + cleanup N-01, N-02. DD-7 and `[ESC-MKT-AUDIT]` carried (not resolved); no frozen modification; nothing invented; no section or ownership change.*
