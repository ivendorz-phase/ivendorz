# iVendorZ Context Pack v4
**For:** New chat sessions picking up Doc-4F work
**Date:** 2026-06-17
**Replaces:** Context Pack v3 (Module 3 era)

---

## 1. Platform Identity

iVendorZ = Bangladesh B2B industrial procurement platform.
Positioning: **40% B2B Marketplace · 30% Procurement · 20% ERP-Lite · 10% Industrial Vendor Network**

Maturity stages: Stage A (Founder Assisted) → Stage B (Assisted) → Stage C (Autonomous). Do not assume enterprise-scale liquidity.

---

## 2. Frozen Corpus — Complete State as of 2026-06-17

| Document | Version | Status |
|---|---|---|
| Master_System_Architecture_v1.0_FINAL.md | v1.0 | FROZEN |
| ADR_Compendium_v1.md | v1.0 | FROZEN |
| Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md + Doc-2_Patch_v1.0.3.md | v1.0.3 | FROZEN |
| Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md + Doc-3_Patch_v1.0.2.md | v1.0.2 | FROZEN |
| Doc-4A API Standards | v1.0 | FROZEN |
| Doc-4B Platform Core | v1.0 | FROZEN |
| Doc-4C Identity | v1.0 | FROZEN |
| Doc-4D Marketplace (Module 2) | v1.0 | FROZEN |
| Doc-4E RFQ Procurement Engine (Module 3) | v1.0 | FROZEN — all 5 Pass-B parts frozen |
| Module 0 (Platform Core) | — | FROZEN |
| Module 1 (Identity) | — | FROZEN |
| Module 2 (Marketplace) | — | FROZEN |
| Module 3 (RFQ Procurement Engine) | — | FROZEN |

**Conflict precedence:** Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4F onward.

**Flag-and-halt rule (Doc-4A §0.6):** On any conflict with a frozen document — halt, cite, escalate. Never silently override.

**Reference-never-restate (Doc-4A §0.3):** Bind to frozen corpus by pointer; never re-derive or copy entity definitions, state machines, slugs, events, or audit actions.

---

## 3. Current Authorized Work

**Module 4 — Business Operations Engine (`operations` schema, `ops_` namespace)**

Lifecycle: **Structure Authoring → Independent Hard Review → Structure Patch → Structure FROZEN → Pass-A → Pass-B → Freeze Audit**

Current position: **Structure Patch** — `Doc-4F_Structure_v1.0` has been independently reviewed (`Doc-4F_Structure_Independent_Hard_Review_v1.0`); patch (`Doc-4F_Structure_Patch_v1.0`) is the next step.

After Doc-4F: Doc-4G (Trust), Doc-4H (Communication), Doc-4I (Billing), Doc-4J (Admin), Doc-4K (Analytics/AI).

---

## 4. Module 4 Architecture — Key Facts

### 4.1 The Post-Award Seam

Module 4 owns **only post-procurement business execution**. It begins after `RFQClosedWon`.

Module 4 owns **none** of:
- RFQs, quotations, matching, routing, ranking, supplier selection, award decisions → **Doc-4E (FROZEN)**
- Vendor profiles/attributes/discovery → **Doc-4D (FROZEN)**
- Trust/performance/verification scores → **Doc-4G (not yet authored)**
- Organizations/memberships/delegation → **Doc-4C (FROZEN)**

### 4.2 Five Bounded Contexts

| Context | Aggregates | Tenancy |
|---|---|---|
| BC-OPS-1 Buyer Private CRM | Private Vendor Record (`private_vendor_records` + notes/ratings), Buyer–Supplier Relationship (`buyer_supplier_relationships` + `buyer_vendor_statuses` + `vendor_favorites`) | tenant-owned, **never disclosed** |
| BC-OPS-2 Engagement & Commercial Documents | Procurement Engagement (`engagements` + `lois` + `purchase_orders` + `challans` + `trade_invoices` + `payment_records` + `work_completion_certificates`) | shared (parties) |
| BC-OPS-3 Vendor Lead Pipeline | Vendor Lead (`vendor_leads` + `lead_activities`) | tenant-owned (vendor's controlling org) |
| BC-OPS-4 Document Generation & Templates | Document Template (`document_templates` + `template_versions`), Generated Document (`generated_documents`) | tenant-owned (+ counterparty grant where shared) |
| BC-OPS-5 Finance Records | Finance Record (`finance_records`) | tenant-owned |

**7 aggregates total. Each aggregate in exactly one BC-OPS. No aggregate split across contexts.**

### 4.3 Cross-Module Dependencies (DF-1…DF-8)

| Marker | Counterpart | Direction | Rule |
|---|---|---|---|
| DF-1 | Identity (Doc-4C) | consume | org/membership/`check_permission`/delegation; author none |
| DF-2 | Marketplace (Doc-4D) | consume | read public vendor profile by UUID for linking; own/mutate no vendor data; link-not-merge (ADR-003) |
| DF-3 | RFQ (Doc-4E) | consume events | `RFQClosedWon` → BC-OPS-2 engagement creation; `VendorInvited` → BC-OPS-3 lead creation; own no RFQ/quotation; make no procurement decision |
| DF-4 | Trust (Doc-4G) | emit events | emit `DeliveryRecorded`/`WorkCompletionIssued`/`EngagementCompleted`/`DisputeRecorded`/`BuyerFeedbackRecorded`; Trust consumes as performance inputs; Ops computes no score |
| DF-5 | Admin (Doc-4J) | consume | link-suggestion candidates; confirmed link = Ops column write on `private_vendor_records` |
| DF-6 | Billing (Doc-4I) | separation | `trade_invoices`/`payment_records` are inter-party commerce records (≠ Billing platform invoices); no funds custody |
| DF-7 | Communication (Doc-4H) | emit events | Ops emits; Communication owns notification fan-out; Ops authors no notification contract |
| DF-8 | Platform Core (Doc-4B) | consume | audit-write, outbox-write, UUIDv7+human-ref, POLICY, feature flags, storage; re-implement none |

### 4.4 Events

**Consumed by Module 4:**
- `RFQClosedWon` (RFQ/Doc-4E) → BC-OPS-2 creates engagement
- `VendorInvited` (RFQ/Doc-4E) → BC-OPS-3 creates vendor lead (**only on invitation `delivered`** — undelivered invitations `selected`/`deferred` must never create leads or visibility)

**Produced by Module 4 (Doc-2 §8 operations row):**
`DeliveryRecorded`, `WorkCompletionIssued`, `EngagementCompleted`, `DisputeRecorded`, `BuyerFeedbackRecorded` — all emitted by BC-OPS-2, consumed by Trust into `performance_inputs`.

### 4.5 Permission Slugs (Doc-2 §7)

`can_manage_private_vendors`, `can_manage_vendor_status`, `can_manage_engagements`, `can_create_documents`, `can_approve_po`, `can_record_payments`, `can_approve_payment`, `can_manage_finance_records`, `can_manage_templates`, `can_manage_leads`

### 4.6 Escalation Markers

- `[ESC-OPS-AUDIT]` — Operations audit action not separately enumerated in Doc-2 §9; bind nearest §9 action by pointer; carry marker if absent; never invent
- `[ESC-OPS-POLICY]` — POLICY key absent from Doc-3 §12.2; carry marker; never invent
- `[ESC-OPS-SLUG]` — permission slug absent from Doc-2 §7; carry marker; never invent

### 4.7 Critical Non-Disclosure Rules

- `buyer_vendor_statuses` (`Approved/Conditional/Blacklisted`): served to RFQ routing **only via the BC-OPS-1 CRM read-service** under the non-disclosure invariant (Doc-4A §7.5). Blacklist exclusion is indistinguishable from non-match for vendors.
- `private_vendor_records` and all BC-OPS-1 data: **never disclosed** to any counterparty.
- `trade_invoices` ≠ Billing platform invoices.
- `payment_records` = records only; no funds movement; no funds custody.
- Claim lifecycle (marketplace vendor profile claim) does **not** apply to `private_vendor_records` (Architecture Patch v1.0.1 PATCH-02).
- Vendor Master Identity is a **logical concept**, not an entity (Architecture Patch v1.0.1 PATCH-05): realized by `vendor_profiles` + link column on `private_vendor_records` + `admin.link_suggestions`. Link-not-merge: linking never moves or exposes private data.

---

## 5. Doc-4F Structure Review — Summary of Findings

**Document reviewed:** `Doc-4F_Structure_v1.0.md`
**Review document:** `Doc-4F_Structure_Independent_Hard_Review_v1.0.md`
**Decision:** APPROVE WITH PATCH — **0B · 0MA · 2M · 1N**

### Open Findings (require patch)

**F4F-M1 (MINOR) — §F10 VendorInvited co-consumer gap**
§F10 records only BC-OPS-3 lead-creation leg for `VendorInvited`. Doc-2 §8 primary consumers lists Communication (Doc-4H) as co-consumer (notification dispatch). §F10 must add Communication as co-consumer; both legs must be named. Ownership direction: RFQ owns event; Ops owns lead effect; Communication owns fan-out (DF-7).

**F4F-M2 (MINOR) — §F12 [ESC-OPS-AUDIT] BC-OPS-1 gap ambiguity**
§F12 `[ESC-OPS-AUDIT]` candidate gap list does not confirm Doc-2 §9 Buyer CRM domain coverage for BC-OPS-1 (`vendor status set/changed/cleared` IS in §9 — confirmed). Residual gap candidates for BC-OPS-1 not listed: `private_vendor_record create/archive`, `private_vendor_note add/edit`, `private_vendor_rating add/edit` — none verbatim in §9, so these carry `[ESC-OPS-AUDIT]`. Must be explicit in §F12 to eliminate content-pass ambiguity.

**F4F-N1 (NITPICK) — §F3/§F15 BC-OPS-4 dual-aggregate count**
§F15 states "5 contexts, 7 aggregates" without noting BC-OPS-4 holds two aggregates (Document Template + Generated Document). Minor clarity fix.

### Structure Verdict: Structurally sound. Patch is additive only — no ownership boundary violations, no moat breach, no structural change needed.

---

## 6. Doc-4A Core Standards — Essential Reference Points

### Nine-Stage Validation (Doc-4A §11.2)

```
1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY
```
Never reorder. Stages 2–5 always before 6–9.

**21.5 System collapse:** For System contracts (no tenant), stages 2–5 collapse to single trigger-authenticity check.

### Contract Templates

- **21.5 System** — no tenant actor; trigger-authenticity only; Response: none
- **21.4 Command** — tenant mutation; full 9-stage validation
- **21.3 Query** — read; full 9-stage validation

### Error Model (Doc-4A §12) — Closed Class

`VALIDATION`, `AUTHORIZATION`, `NOT_FOUND`, `STATE`, `REFERENCE`, `BUSINESS`, `QUOTA`, `RATE_LIMITED`, `CONFLICT`, `ASYNC_PENDING`, `DEPENDENCY`, `SYSTEM`

### Non-Disclosure Invariant (Doc-4A §7.5)

`NOT_FOUND` / no-access are indistinguishable. Protected facts (blacklist, routing exclusion, Buyer Vendor Status, private CRM, grant state) → `NOT_FOUND` regardless of actual reason.

### Governance Signal Firewall (Doc-4A §4B)

Trust/Performance signals read-only, never mutated by consumers. No plan/entitlement gates eligibility, routing fairness, or selection.

### Single-Authorship (Doc-4A §4.4)

One entity = one owner. Cross-module refs are bare UUIDs, service-validated. An emitter owns its event; the consumer authors its own effect.

---

## 7. Module 3 Key Decisions (FROZEN — for reference only)

- **Decision-support never auto-decision (Doc-3 §9.1 FIXED):** Platform never auto-recommends or auto-picks a winner. Comparison statement is decision-support only.
- **Single-award invariant (Doc-2 §5.4 FIXED):** Exactly one `selected_quotation_id` → `closed_won`. Split needs = re-issue (BC-1), never multi-award.
- **Buyer-preference firewall (Doc-3 §7.5 FIXED):** Approved-vendor preference is buyer-scoped only — never crosses tenants, never feeds platform scores.
- **Shortlist governance:** `shortlist_quotation.v1` persists `shortlisted_quotation_ids`; `award_rfq.v1` verifies membership before award commit.
- **`quotations_received → buyer_reviewing`:** Owned by `get_comparison_statement.v1` on first buyer open; inline in same transaction; state-guarded.
- **`quotation_revised` trigger:** NOT a Doc-2 §8 event; internal application-layer trigger, synchronous in-process.
- **Engagement is Operations-owned (DF-3/DE-4):** Created off `RFQClosedWon`; RFQ never authors it.

---

## 8. Architecture Invariants

- One Entity = One Owner
- One Aggregate = One Root
- One Business Truth = One Source
- Never share ownership; never duplicate aggregates across contexts
- Never bypass tenancy rules (org boundaries, RLS, delegation)
- Routing moat: paid plans never influence trust/verification/eligibility/routing fairness/matching confidence
- No event invented outside Doc-2 §8
- No slug invented outside Doc-2 §7
- No audit action invented outside Doc-2 §9
- No POLICY key invented outside Doc-3 §12.2
- No state/transition invented outside Doc-2 §5.x

---

## 9. Next Steps (as of 2026-06-17)

1. **Doc-4F_Structure_Patch_v1.0** — close F4F-M1 and F4F-M2 (additive edits to §F10 and §F12)
2. **Doc-4F_Structure_Freeze_Audit_v1.0** — verify patch closes findings; authorize structure freeze
3. **Doc-4F_Structure_v1.0_FROZEN** — freeze the structure
4. **Doc-4F Pass-A** — author all Module 4 contracts against the frozen structure
5. Continue Doc-4G → Doc-4K in sequence

---

## 10. Key Files in Project Folder

| File | Purpose |
|---|---|
| `ivendorz_Project_Instructions.md` | **Authoritative project instructions — read first** |
| `Doc-4F_Structure_v1.0.md` | Document under current work |
| `Doc-4F_Structure_Independent_Hard_Review_v1.0.md` | Completed structure review |
| `Doc-4E_PassB_Part5_Freeze_Audit_v1.0.md` | Module 3 freeze audit (last completed major document) |
| `Doc-4E_PassB_Part5_v1.0_FROZEN.md` | Module 3 Part 5 frozen (if present) |
| `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` | Domain model + DB blueprint |
| `Doc-2_Patch_v1.0.3.md` | RFQ state machine additive patch |
| `Doc-4A_Content_v1.0_Pass6.md` | API standards (final pass, FROZEN) |
| `Doc-4E_PassA_v1.0_FROZEN.md` | Module 3 Pass-A frozen (key cross-module seam definitions) |

---

*Context Pack v4 — covers Module 4 start state. For Module 3 history see Context Pack v3 (archived). Read `ivendorz_Project_Instructions.md` first, then this pack, then the document under review.*
