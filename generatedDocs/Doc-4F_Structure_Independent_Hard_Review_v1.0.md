# Doc-4F Structure — Independent Hard Review
**Document ID:** Doc-4F_Structure_Independent_Hard_Review_v1.0
**Review Date:** 2026-06-17
**Status:** FINAL

---

## Review Header

| Field | Value |
|---|---|
| Document Under Review | `Doc-4F_Structure_v1.0` |
| Module | Module 4 — Business Operations Engine (`operations` schema) |
| Operating Context | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor |
| Review Posture | Independent. Aggressive. Defects assumed until disproved. No authoring. No redesign. Structure only. |
| Authoritative Corpus | Master_System_Architecture_v1.0_FINAL; ADR_Compendium_v1.md; Doc-2 v1.0.3; Doc-3 v1.0.2; Doc-4A/4B/4C/4D/4E v1.0 — all FROZEN |
| Special Focus | BC-OPS-1 Buyer Private CRM · BC-OPS-2 Engagement & Commercial Documents · BC-OPS-3 Vendor Lead Pipeline; ownership leakage; aggregate overlap; procurement-decision leakage; vendor-data leakage; trust-score leakage |

---

## Executive Verdict

**APPROVE WITH PATCH**

Doc-4F_Structure_v1.0 is architecturally sound. Post-award ownership seam is correctly placed. All seven Module-4 aggregates map to exactly one BC-OPS context. Cross-module dependencies DF-1…DF-8 are explicitly directional. Procurement moat, vendor-data boundary, and trust boundary are upheld. The CRM read-service seam to RFQ routing is correctly identified and non-disclosure-governed. Escalation markers are correctly pattern-matched.

Two MINOR findings require patch before freeze:

- **F4F-M1 (MINOR):** §F10 lists `VendorInvited` as consumed by BC-OPS-3 but does not acknowledge Communication as a co-consumer per Doc-2 §8 — ambiguity in event consumption statement.
- **F4F-M2 (MINOR):** §F12 `[ESC-OPS-AUDIT]` candidate gap list omits the `Buyer CRM` audit domain coverage — `vendor status set/changed/cleared` is in Doc-2 §9 but §F12 does not confirm it, leaving a gap-resolution path unspecified for content passes.

One NITPICK:

- **F4F-N1 (NITPICK):** §F5 names seven aggregates but §F3/§F15 count "5 bounded contexts owning 7 aggregates" with no explicit note that BC-OPS-4 holds two aggregates (Document Template + Generated Document) — minor count ambiguity for content-pass readers.

No BLOCKERs. No MAJORs.

Open findings at review: **0B · 0MA · 2M · 1N**

---

## Findings

---

### F4F-M1
**Severity:** MINOR
**Location:** §F10 — Event Consumption Map, `VendorInvited` entry
**Description:**
§F10 states `VendorInvited` (producer: RFQ / Doc-4E) → BC-OPS-3 creates `vendor_leads`. Doc-2 §8 primary consumers for `VendorInvited` are: "Communication dispatch (notification fan-out: in-app/email/SMS/WhatsApp per org notification rules), vendor_leads creation (operations)" — two consumers. §F10 records only the Operations leg; Communication's consumption leg is silently absent. A content-pass author reading §F10 alone will not see Communication as co-consumer and may fail to wire the DF-7 relationship correctly for this event. The structure document must reflect the full consumption picture for each event it discusses.

**Corpus Reference:** Doc-2 §8 primary consumers row for `VendorInvited`; DF-7 (§F7).

**Required Fix:** §F10 `VendorInvited` entry: add that Communication (Doc-4H) is also a primary consumer per Doc-2 §8 (notification dispatch); BC-OPS-3 creates `vendor_leads` and Communication fans out — both legs must be named. Ownership direction: RFQ owns the event; Operations owns the lead effect; Communication owns the notification fan-out (DF-7). A note that the two consumption legs are independent and idempotent is sufficient.

---

### F4F-M2
**Severity:** MINOR
**Location:** §F12 — Escalation Register, `[ESC-OPS-AUDIT]` entry
**Description:**
§F12 carries `[ESC-OPS-AUDIT]` with candidate gaps: finance-record actions, generated-document creation, template lifecycle — and directs content passes to confirm against Doc-2 §9 Documents domain. However, §F12 does not confirm the status of the `Buyer CRM` audit domain (Doc-2 §9: "vendor status set/changed/cleared — visible only to buyer org + platform compliance; never vendor-facing"). The Buyer CRM domain has explicit Doc-2 §9 coverage but §F12 omits it from both the gap list and the confirmed-covered list, leaving content-pass authors uncertain whether BC-OPS-1 mutations (status set/change/clear, private record create/archive, note/rating add) need `[ESC-OPS-AUDIT]` marker treatment or are already fully covered. Ambiguity of this kind produces inconsistent audit binding at content authoring.

**Corpus Reference:** Doc-2 §9 Buyer CRM row ("vendor status set/changed/cleared"); Doc-2 §9 Engagement row (open, status change, close; LOI/PO/challan/WCC issue + revision; dispute; feedback); Doc-4A §6.4/§17.

**Required Fix:** §F12 `[ESC-OPS-AUDIT]` candidate gap list: add an explicit confirmation that Doc-2 §9 Buyer CRM domain covers `vendor status set/changed/cleared` for BC-OPS-1, and that the residual gap candidates for BC-OPS-1 are `private_vendor_record create/archive`, `private_vendor_note add/edit`, `private_vendor_rating add/edit` — none of which appear verbatim in Doc-2 §9 — and thus these carry `[ESC-OPS-AUDIT]`. Content passes bind nearest §9 action by pointer; if absent, carry the marker. This eliminates the "already covered or not?" ambiguity for BC-OPS-1 mutations.

---

### F4F-N1
**Severity:** NITPICK
**Location:** §F3 / §F15 — Bounded Context Landscape / Structure Summary
**Description:**
§F15 states "5 bounded contexts owning 7 aggregates" without calling out that BC-OPS-4 uniquely holds two aggregates (Document Template + Generated Document). First-pass readers counting "5 contexts, 7 aggregates" may expect a uniform 1:1 or 2:1 distribution and be surprised. The §F5 inventory resolves this unambiguously, but a one-line note in §F3 BC-OPS-4 or §F15 would eliminate ambiguity at the summary level.

**Corpus Reference:** Doc-2 §2 Module 4 aggregate table.

**Required Fix:** §F3 BC-OPS-4 description or §F15 aggregate count statement: add "(2 aggregates: Document Template + Generated Document)" alongside the BC-OPS-4 entry. One line. No structural change.

---

## Ownership Analysis

### BC-OPS-1 Buyer Private CRM

`private_vendor_records` (+ `private_vendor_notes`, `private_vendor_ratings`): **correctly owned** by BC-OPS-1. Tenancy: tenant-owned, never disclosed. Confirmed against Doc-2 §3.5, §10.5.

`buyer_supplier_relationships` (+ `buyer_vendor_statuses`, `vendor_favorites`): **correctly owned** by BC-OPS-1. `buyer_vendor_statuses` served to RFQ routing **only** via CRM read-service under non-disclosure — confirmed against Doc-4E PassA FROZEN §DE-4 and Doc-4A §7.5. The CRM status read-service seam is not an invented integration: it is the documented integration point in the frozen corpus. Non-disclosure invariant (blacklist exclusion indistinguishable from non-match) is correctly inherited from Doc-4A §7.5.

**No ownership leakage found in BC-OPS-1.**

PATCH-02 (claim lifecycle does NOT apply to `private_vendor_records`): correctly cited. No claim-lifecycle contamination.

### BC-OPS-2 Engagement & Commercial Documents

`engagements` (+ `lois`, `purchase_orders`, `challans`, `trade_invoices`, `payment_records`, `work_completion_certificates`): **correctly owned** by BC-OPS-2. Confirmed against Doc-2 §2/§3.5/§10.5. Children list matches Doc-2 §2 exactly. Tenancy: shared (parties) per Doc-2 §6 — correct.

Post-award seam: engagement created on `RFQClosedWon` (DF-3). Operations does not own the RFQ or quotation. The engagement is created as Operations' own effect of a consumed event — single-authorship (Doc-4A §4.4) upheld.

`trade_invoices` vs `platform_invoices`: correctly separated. `trade_invoices` are inter-party commerce invoices, distinct from `platform_invoices` (Billing / Doc-4I — DF-6). The document is explicit and the boundary is clean.

`payment_records`: records only, no funds movement — correctly stated.

Performance-input emission (DF-4): BC-OPS-2 emits engagement/document/dispute/feedback events; Trust authors its own consumer (single-authorship, DF-4). No trust score computation or storage in Operations.

**No ownership leakage found in BC-OPS-2.**

### BC-OPS-3 Vendor Lead Pipeline

`vendor_leads` (+ `lead_activities`): **correctly owned** by BC-OPS-3. Tenancy: tenant-owned (vendor's controlling org). Confirmed against Doc-2 §3.5/§10.5.

Lead creation: on `VendorInvited` (fires only on invitation `delivered` — undelivered invitations must not create leads or visibility; Doc-2 §8 explicitly states this). §F10 correctly inherits the delivery-only condition. The lead lifecycle (received → quoted → negotiation → won/lost → follow_up) matches Doc-2 §3.5.

**No ownership leakage found in BC-OPS-3. F4F-M1 noted (Communication co-consumer gap) — does not affect ownership.**

### BC-OPS-4 Document Generation & Templates

`document_templates` (+ `template_versions`), `generated_documents`: **correctly owned** by BC-OPS-4. State machine reference (§5.9 Document Template) correct. `generated_documents` counterparty-grant-sharable — consistent with Doc-2 §6 (tenant-owned + counterparty grant where shared).

### BC-OPS-5 Finance Records

`finance_records`: **correctly owned** by BC-OPS-5. Structured text records (TAX/AIT/payment/expense); no funds custody; no Billing overlap. Confirmed against Doc-2 §3.5/§10.5.

### Aggregate-to-Context Uniqueness

All seven Module-4 aggregates appear in exactly one BC-OPS context. No aggregate claimed by two contexts. No aggregate absent. No aggregate from another module introduced. Confirmed against Doc-2 §2 Module 4 table.

### Single-Authorship Compliance

All DF-* entries state direction + single-authorship side. No entity authored by two modules. Confirmed:
- RFQ emits `RFQClosedWon` / `VendorInvited`; Operations consumes and authors its own effects.
- Operations emits engagement events; Trust authors its own consumer.
- Communication owns notification fan-out; Operations emits only.
- Admin owns `link_suggestions`; Operations authors only the confirmed-link column write on its own `private_vendor_records`.

Single-authorship verdict: **CLEAN.**

---

## Procurement Moat Analysis

**RFQ/quotation/matching/award ownership:** §F1, §F7 (DF-3), §F8, §F13, §F14 all state Operations owns none of: RFQs, quotations, matching, routing, ranking, supplier selection, award decisions. These remain with Doc-4E (FROZEN). No procurement decision logic is described or implied in any section. **CLEAN.**

**Post-award seam (the moat boundary):** Module 4 begins at `RFQClosedWon`. The engagement is an execution container, not a procurement decision. The award has already been made in Doc-4E; Operations merely executes the outcome. **CLEAN.**

**CRM status feed to routing:** The `buyer_vendor_statuses` read-service to RFQ routing is a filter input (blacklist exclusion / Buyer Filter universe floor), not a procurement decision. RFQ makes the award; the CRM service merely provides an exclusion set. The non-disclosure invariant (Doc-4A §7.5) ensures the exclusion is invisible to vendors. This is the documented integration in Doc-4E PassA FROZEN (DE-4) — not an invented path. **CLEAN.**

**Governance signal firewall (Doc-4A §4B):** No plan/entitlement gate on any Operations service or boundary. Operations emits performance-input events; Trust computes scores. Operations never reads or mutates trust/performance scores. **CLEAN.**

**Vendor-data boundary:** Operations references `vendor_profile_id` by UUID for private↔public linking (DF-2). It never owns or mutates `vendor_profiles` or vendor attributes. Link-not-merge (ADR-003) is correctly stated. PATCH-05 (Vendor Master Identity = logical concept) correctly carried. **CLEAN.**

**Procurement moat verdict: CLEAN. No bypass path, no procurement-decision leakage, no vendor-data leakage, no trust-score leakage.**

---

## DDD Boundary Analysis

### Bounded Context Correctness

Five contexts, each mapping to a coherent business capability:
- BC-OPS-1: private CRM — buyer's private relationship management. Coherent.
- BC-OPS-2: post-award engagement + commercial document chain. Coherent.
- BC-OPS-3: vendor-side CRM pipeline. Coherent.
- BC-OPS-4: template management + generation. Coherent.
- BC-OPS-5: finance text records. Coherent.

No context overlap. No aggregate split across contexts. The separation of BC-OPS-4 (generation/templates) from BC-OPS-2 (engagement lifecycle) is correct DDD: template engine is a distinct subdomain from engagement execution. BC-OPS-5 Finance Records separated from BC-OPS-2 trade invoices is correct: finance records are tenant-scoped ledger entries; trade invoices are shared inter-party documents. **CLEAN.**

### Context Interactions (within Module 4)

§F9 names three internal interactions: BC-OPS-2 references BC-OPS-4 for document generation (engagement docs use `template_versions`); BC-OPS-1 references BC-OPS-2 outcomes for relationship history; BC-OPS-3 is informed by same RFQ events as BC-OPS-2. All interactions are by UUID reference within the schema; no aggregate crosses a context boundary. **CLEAN.**

### Aggregate Ownership Correctness

All seven aggregates from Doc-2 §2 Module 4 are present and correctly assigned. VO assignments match Doc-2 §2 exactly. Children lists match Doc-2 §2/§3.5 exactly. No aggregate added beyond Doc-2 §2.

**DDD boundary verdict: CLEAN.**

---

## Dependency Analysis

| Marker | Direction | Single-Authorship | Boundary Rule | Assessment |
|---|---|---|---|---|
| DF-1 Identity | consume org/membership/`check_permission`/delegation; author none | Identity authors; Ops consumes | **CLEAN** |
| DF-2 Marketplace | reference public vendor profile by UUID; own/mutate none | Marketplace authors profiles; Ops references | **CLEAN** |
| DF-3 RFQ | consume `RFQClosedWon`/`VendorInvited`; own no RFQ/quotation; make no procurement decision | RFQ emits; Ops authors its own effects | **CLEAN** |
| DF-4 Trust | emit engagement/document/dispute/feedback events; compute no score; own no trust entity | Ops emits; Trust authors consumer | **CLEAN** |
| DF-5 Admin | consume `link_suggestions`; confirmed link = Ops column write on own table | Admin authors `link_suggestions`; Ops writes confirmed link on its own `private_vendor_records` | **CLEAN** |
| DF-6 Billing | `trade_invoices`/`payment_records` are Ops-owned inter-party records; strict separation from Billing platform invoices | Ops authors trade invoices; Billing authors platform invoices | **CLEAN** |
| DF-7 Communication | emit events; Communication owns fan-out; no notification contract authored | Ops emits; Communication authors fan-out | **CLEAN** — F4F-M1 noted for §F10 incomplete co-consumer statement |
| DF-8 Platform Core | consume audit/outbox/UUIDv7/human-ref/POLICY/storage; re-implement none | Platform Core authors; Ops consumes | **CLEAN** |

All eight DF markers are directionally correct, single-authorship-compliant, and consistent with Doc-4A §4/§4.4.

**Dependency analysis verdict: CLEAN (F4F-M1 is a description gap, not a boundary violation).**

---

## AI-Agent Safety Analysis

§F14 covers the required AI-agent implementation constraints. Assessment:

**Ownership protection statements:** correct — names exactly what Operations must not own (RFQ/quotation/matching/routing/ranking/supplier-selection/award; vendor profiles/attributes; trust/performance scores). Agents implementing Module 4 cannot misread scope.

**Ambiguity prevention:** aggregate-to-context uniqueness (§F5/§F8) machine-readable. Non-disclosure invariant on BC-OPS-1/`buyer_vendor_statuses` explicitly named. `trade_invoices` ≠ Billing platform invoices distinction stated. `payment_records` = records only (no funds) stated. Escalation markers `ESC-OPS-*` (§F12) provide no-invention guardrails.

**Implementation constraint quality:** Frozen service consumption (Doc-4B/4C/4D/4E by pointer) required; no re-derivation. State machines bound to Doc-2 §3.5/§5.9 by pointer. Agents cannot invent lifecycle states.

**Gap:** §F14 does not name the `VendorInvited` delivery-only condition explicitly (the lead is created only on invitation `delivered`, not on `selected` or `deferred`). This condition is in Doc-2 §8 and §10.5 but is not surfaced in §F14's ambiguity-prevention guidance. An agent reading §F14 in isolation would not know that undelivered invitations must never create leads or vendor visibility. This is a secondary safety gap — the condition is in §F10 event consumption map and Doc-2 is authoritative — but §F14 is the AI-agent guidance section and the omission is notable.

**Assessment:** Minor gap. Not a separate finding (already covered by F4F-M1 context and §F10 describes the condition; §F14 directs agents to the frozen corpus). Board may wish to patch §F14 or accept that Doc-2 §8 + §F10 are sufficient.

**AI-Agent safety verdict: PASS with observation (VendorInvited delivery-only condition not surfaced in §F14 — carried as observation, not a separate finding).**

---

## Structure Freeze Readiness

| Area | Result | Notes |
|---|---|---|
| 1. Structure completeness | PASS | §F1–§F15 all present; purpose + expected content scope stated per section |
| 2. Bounded-context correctness | PASS | 5 BCs, coherent, non-overlapping |
| 3. Aggregate ownership correctness | PASS | 7 aggregates, one BC each, all Doc-2 §2 Module-4 aggregates present |
| 4. Cross-module ownership integrity | PASS | DF-1…DF-8 explicit, directional, single-authorship-compliant |
| 5. Procurement moat protection | PASS | No RFQ/quotation/matching/award ownership; post-award seam correct |
| 6. RFQ boundary integrity | PASS | DF-3 correct; consumes events only; no RFQ entity ownership |
| 7. Marketplace boundary integrity | PASS | DF-2 correct; link-not-merge; no vendor-data ownership |
| 8. Trust boundary integrity | PASS | DF-4 correct; emits inputs; computes no score |
| 9. Billing boundary integrity | PASS | DF-6 correct; trade invoices ≠ platform invoices |
| 10. Event ownership correctness | PASS (F4F-M1) | Produced events correct (5 BC-OPS-2 events per Doc-2 §8); consumed events correct ownership direction; F4F-M1 = incomplete co-consumer statement for `VendorInvited` in §F10 |
| 11. Dependency-map correctness | PASS | DF-1…DF-8 match frozen corpus; direction correct |
| 12. Escalation-marker correctness | PASS (F4F-M2) | `[ESC-OPS-AUDIT]`, `[ESC-OPS-POLICY]`, `[ESC-OPS-SLUG]` correctly patterned; F4F-M2 = BC-OPS-1 audit gap-resolution ambiguity |
| 13. DDD boundary integrity | PASS | No context overlap; no aggregate split; no cross-context ownership |
| 14. AI-agent implementation readiness | PASS | §F14 complete; observation on VendorInvited delivery-only condition not surfaced |
| 15. Single-authorship compliance | PASS | All DF markers single-authorship-compliant |
| 16. Aggregate-to-context uniqueness | PASS | Each aggregate in exactly one BC-OPS; verified against Doc-2 §2 |
| 17. Structure-freeze readiness | PATCH REQUIRED | 2 MINORs (F4F-M1, F4F-M2) require patch before freeze |

---

## Final Decision

**APPROVE WITH PATCH**

Doc-4F_Structure_v1.0 is structurally correct. No BLOCKER. No MAJOR. Two MINORs require patch:

- **F4F-M1:** §F10 `VendorInvited` entry — add Communication as co-consumer per Doc-2 §8.
- **F4F-M2:** §F12 `[ESC-OPS-AUDIT]` — clarify Doc-2 §9 Buyer CRM coverage and identify residual gap candidates for BC-OPS-1.

One NITPICK (F4F-N1) — BC-OPS-4 dual-aggregate count ambiguity — Board discretion.

Open: **0B · 0MA · 2M · 1N**

---

## Approval Question

**YES** — Doc-4F_Structure_v1.0 can proceed to `Doc-4F_Structure_Patch_v1.0`.

**Justification:** Both MINORs are description/completeness gaps — no ownership boundary is violated, no aggregate is mis-assigned, no moat is breached. The patch is additive (two entries expanded; no structural change). The document correctly bounds Module 4 post-award execution and is safe for structure patching prior to freeze.

---

*Review conducted under Doc-4A §0.6 (flag-and-halt), §0.3 (reference-never-restate). No corpus conflict encountered. No flag-and-halt triggered. Independent reviewer; no authoring.*
