# Doc-4M_FROZEN_v1.0 — State Machine Contracts

| Field | Value |
|---|---|
| Document | `Doc-4M_FROZEN_v1.0` — State Machine Contracts |
| Status | **FROZEN** |
| Freeze Date | 2026-06-20 |
| Freeze Authority | Doc-4M_Final_Freeze_Audit_v1.0 — FREEZE APPROVED (BLOCKER=0 · MAJOR=0 · MINOR=0 · NITPICK=0) |
| Board Assessment | APPROVE WITH PATCH — F4M-PA-01/02 mandatory, F4M-PA-03/04 recommended; all four ACCEPTED |
| Nature | **Consolidation document.** Non-normative. Creates no state, transition, workflow, business rule, ownership, or event. Consolidates lifecycle authority already defined in the frozen corpus, by reference only. |
| Discipline | **Reference-never-restate** (Doc-4A §0.3). Every cell is a pointer to an authoritative source; no state definition, transition rule, event contract, workflow map, or permission logic is duplicated. |
| Authority | Master Architecture (FROZEN) → ADR Compendium (FROZEN) → Doc-2 v1.0.3 (FROZEN) → Doc-3 v1.0.2 (FROZEN) → Doc-4A v1.0 (FROZEN) → Doc-4B–4L (FROZEN) → `Doc-4M_Structure_FROZEN_v1.0` → `Doc-4M_PassA_Content_v1.0`. On any conflict: **FLAG-AND-HALT**. |
| Lifecycle source of truth | **Doc-2 §5 — State Machines** (canonical state/transition home) + **Doc-3** (operational transition semantics, RFQ §1). Owner-BC attribution by pointer to each module's frozen Doc-4 document. |
| Structure corrections applied | P-4M-01 (M3+M4 §5-vs-§3 classification footers) · P-4M-02 (Trust/Performance Score derived-aggregate annotation) · P-4M-03 (Custom Domain two-row split) · P-4M-04 (Ban Action removed from inventory; footer note) · P-4M-05 (M5 disclaimer strengthened) |
| Pass-A corrections applied | P-4M-PA-01 (Organization M5 From State → corpus-compliant pointer) · P-4M-PA-02 (M6-8 Trust→Marketplace claim-status seam added; M5 pointer sharpened to M6-8) · P-4M-PA-03 (Subscription `active→active` rows annotated as flag mutation / renewal event) · P-4M-PA-04 (Engagement From State `(created)` → `—`; M5 pointer sharpened to M6-1) |
| Lineage | `Doc-4M_Structure_Proposal_v0.1` → `Doc-4M_Structure_Patch_v1.0` → `Doc-4M_Structure_FROZEN_v1.0` → `Doc-4M_PassA_Content_v1.0` → `Doc-4M_PassA_Independent_Hard_Review_v1.0` (APPROVE WITH PATCH) → Board Assessment (APPROVE WITH PATCH) → `Doc-4M_PassA_Patch_v1.0` → `Doc-4M_PassA_Patch_Verification_v1.0` (PATCH VERIFIED) → `Doc-4M_Final_Freeze_Audit_v1.0` (FREEZE APPROVED) → **`Doc-4M_FROZEN_v1.0`** |

**Freeze certificate.** This document is the authoritative frozen consolidation index for the iVendorZ State Machine Contracts. It supersedes all prior Doc-4M drafts, proposals, patches, and pass documents. The content is locked. No state, transition, workflow, business rule, ownership, or event is introduced. On any apparent conflict with a frozen corpus source, the frozen source governs — this index is corrected, never the frozen corpus.

**Companion to Doc-4L.** Doc-4L consolidates *permission* authority; Doc-4M consolidates *lifecycle* authority. Same discipline (non-normative, reference-never-restate), same corpus precedence. Where Doc-4L answers "who may act," Doc-4M answers "what state, what transition, whose trigger."

---

## M1 — Purpose

**Objective.** Provide a single lookup surface that resolves, for any entity with a lifecycle defined in the frozen corpus:

```
Entity → State → Allowed Transition → Trigger → Owner BC → Reference Source
```

so that Backend Engineers, Frontend Engineers, QA Engineers, Claude Code, Cursor, and other AI coding agents can implement lifecycle behavior consistently **without searching ten module documents and Doc-2/Doc-3 for the authoritative state machine**.

**Authority and limits.** This document is a navigational index over frozen material. It is **non-normative**: it defines nothing, owns nothing, and may not be cited as a contract source. Where this index and any frozen source appear to disagree, the frozen source governs and the discrepancy is escalated (FLAG-AND-HALT) — this index is corrected, never the frozen corpus. The canonical state machines remain **Doc-2 §5**; operational transition semantics remain **Doc-3**; ownership remains each module's frozen Doc-4 document.

**What this document does not do.** It does not define states, define transitions, restate transition rules/guards, specify event contracts, draw workflow maps, or restate permission logic. Those live in the authoritative sources to which every row points.

---

## M2 — Authority Chain

Frozen sources governing lifecycle authority, in precedence order (highest first). All state/transition attribution in M3–M6 resolves through this chain.

| Precedence | Source | Role in lifecycle authority |
|---|---|---|
| 1 | Master System Architecture v1.0 FINAL (FROZEN) | Aggregate/ownership model; actor types; event-driven synchronization principle |
| 2 | ADR Compendium v1 (FROZEN) | Lifecycle and ownership decisions of record (e.g., claim-lifecycle scope, PATCH-02) |
| 3 | Doc-2 v1.0.3 (FROZEN) | **§5 State Machines — canonical state/transition home;** §3 status enums; §8 event ownership |
| 4 | Doc-3 v1.0.2 (FROZEN) | Operational transition semantics (RFQ §1; eligibility/probation/suspension); validity clock; reopening rules |
| 5 | Doc-4A v1.0 (FROZEN) | Contract grammar: state-transition contract template (21.4), single-authorship (§4), reference-never-restate (§0.3) |
| 6 | Doc-4B–4L (FROZEN) | Per-module owner-BC attribution and the state-transition contracts that own each transition |

**Module → frozen-document index (owner-BC reference targets for M3–M5):**

| Module | Schema | Frozen Doc-4 reference |
|---|---|---|
| 0 — Platform Core | `core` | Doc-4B (FROZEN) |
| 1 — Identity & Organization | `identity` | Doc-4C (FROZEN) |
| 2 — Marketplace & Discovery | `marketplace` | Doc-4D (FROZEN) |
| 3 — RFQ Procurement Engine | `rfq` | Doc-4E (FROZEN) |
| 4 — Business Operations | `operations` | Doc-4F (FROZEN) |
| 5 — Trust & Verification | `trust` | Doc-4G (FROZEN) |
| 6 — Communication | `communication` | Doc-4H (FROZEN) |
| 7 — Monetization / Billing | `billing` | Doc-4I (FROZEN) |
| 8 — Admin Operations | `admin` | Doc-4J (FROZEN) |
| 9 — AI Layer | `ai` | Doc-4K (FROZEN) |
| — Permission Authority Matrix | — | Doc-4L (FROZEN; permission companion) |

---

## M3 — State Machine Inventory

**Inventory only. No state definitions.** Each entity with a canonical lifecycle in the frozen corpus, with its Owner Module/BC and the authoritative source of its state machine. (States/transitions appear in M4/M5 as pointers; full definitions live in the Reference Source.)

| Entity | Owner Module | Owner BC | Reference Source |
|---|---|---|---|
| Organization | 1 — Identity | Organization | Doc-2 §5.1; Doc-4C (FROZEN) |
| Membership | 1 — Identity | Membership | Doc-2 §5.2; Doc-4C (FROZEN) |
| Delegation Grant | 1 — Identity | Delegation | Doc-2 §5.10; Doc-4C (FROZEN) |
| Vendor Profile | 2 — Marketplace | Vendor profile | Doc-2 §5.3; Doc-4D (FROZEN) |
| Category Assignment | 2 — Marketplace | Categories | Doc-2 §3 (`category_assignments` status); Doc-4D (FROZEN) |
| Product | 2 — Marketplace | Products / catalog | Doc-2 §3 (`products` status); Doc-4D (FROZEN) |
| Microsite | 2 — Marketplace | Profile experience | Doc-2 §3 (`microsites` status); Doc-4D (FROZEN) |
| Custom Domain | 2 — Marketplace | Profile experience | Doc-2 §3 (`custom_domains` status); Doc-4D (FROZEN) |
| Advertisement | 2 — Marketplace | Advertising | Doc-2 §5.8 (A-07); Doc-4D (FROZEN) |
| RFQ | 3 — RFQ | RFQ lifecycle | Doc-2 §5.4; Doc-3 §1; Doc-4E (FROZEN) |
| RFQ Invitation | 3 — RFQ | Invitation lifecycle | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| Quotation | 3 — RFQ | Quotation | Doc-2 §5.5; Doc-4E (FROZEN) |
| Engagement | 4 — Business Operations | BC-OPS-2 Engagement & Commercial Documents | Doc-2 §3.5 / §10.5 (engagement status); Doc-4F (FROZEN) |
| Private Vendor Record | 4 — Business Operations | BC-OPS-1 Buyer Private CRM | Doc-2 §3 (`private_vendor_records` active/archived); Doc-4F (FROZEN) |
| Vendor Lead | 4 — Business Operations | BC-OPS-3 Vendor Lead Pipeline | Doc-2 §3 (`vendor_leads`); Doc-4F (FROZEN) |
| Document Template | 4 — Business Operations | BC-OPS-4 Document Generation & Templates | Doc-2 §5.9; Doc-4F (FROZEN) |
| Verification Record | 5 — Trust & Verification | Verification | Doc-2 §5.6; Doc-4G (FROZEN) |
| Verified Financial Tier | 5 — Trust & Verification | Trust tier | Doc-2 §3 (`verified_financial_tiers` status); Doc-4G (FROZEN) |
| Trust / Performance Score | 5 — Trust & Verification | Scoring | Doc-2 §8 (score events); Doc-4G (FROZEN) — score-update events only; no lifecycle state machine; derived aggregate, not a stateful entity |
| Support Ticket | 6 — Communication | Support | Doc-4H (FROZEN); Doc-2 §3 (`support_tickets`) |
| Subscription | 7 — Billing | BC-BILL-* | Doc-2 §5.7 (A-06); Doc-4I (FROZEN) |
| Platform Invoice | 7 — Billing | BC-BILL-* | Doc-2 §3 (`platform_invoices`); Doc-4I (FROZEN) |
| AI derived artifacts (Recommendation / Prediction / Classification / Similar-Vendor) | 9 — AI | BC-AI-1…4 | Doc-2 §10.10 (cache lifecycle); Doc-4K (FROZEN) |

*Module 0 — Platform Core owns no business-entity state machine; it provides infrastructure (audit/outbox/UUID/POLICY) consumed by the state-transition contracts of the owning modules (Doc-4B). AI artifacts (Module 9) have a cache lifecycle, not a business state machine (Doc-4K; Doc-2 §10.10) — listed for completeness, flagged as derived/disposable.*

*Owner BC values reference each module's frozen bounded-context inventory; the authoritative BC identity is in the referenced document.*

*Lifecycle classification: entries in this inventory fall into two categories — (a) **Named Doc-2 §5 state machine** — a full state/transition graph with guards is defined in Doc-2 §5 and the owning module's frozen Doc-4 state-transition contracts (e.g., RFQ §5.4, Organization §5.1, Subscription §5.7); (b) **Doc-2 §3 status enum only** — the entity carries a status field enumerated in Doc-2 §3 but has no named §5 state machine; the authoritative transition guards (if any) are in the owning Doc-4 module contract, not in a dedicated Doc-2 §5 entry. A §3 status enum is not a lifecycle state machine. Do not derive transition contracts from the field definition alone.*

*Admin ban (`staff_can_ban`) is not a lifecycle entity with its own state machine. It is represented as a `Vendor Profile → banned` transition (M5) driven by the Admin via `VendorBanned` event, and as a cross-module seam (M6-4, Admin → Marketplace). There is no `ban_actions` aggregate or §5 state machine in the frozen corpus.*

---

## M4 — State Authority Matrix

**Reference only. No lifecycle narrative.** The canonical states per entity, cited from the authoritative source. States are listed as a pointer to the source enumeration; their meaning, guards, and ordering are **not** restated here.

| Entity | Current State (canonical set — see source) | Owner BC | Reference Source |
|---|---|---|---|
| Organization | per Doc-2 §5.1 (claim/operational dimensions) | Identity / Organization | Doc-2 §5.1; Doc-4C (FROZEN) |
| Vendor Profile | claim: `seeded/invited/claimed/verified` · status: `active/suspended/banned` | Marketplace | Doc-2 §5.3, §3 (`vendor_profiles`); Doc-4D (FROZEN) |
| RFQ | `draft / [pending_internal_approval] / submitted / under_review / matching / vendors_notified / quotations_received / buyer_reviewing / shortlisted / closed_won / closed_lost / expired / cancelled` | RFQ lifecycle | Doc-2 §5.4; Doc-3 §1.1; Doc-4E (FROZEN) |
| RFQ Invitation | `draft / selected / deferred / delivered / accepted / declined / expired` | RFQ / Invitation | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| Quotation | per Doc-2 §5.5 (active set + terminal) | RFQ / Quotation | Doc-2 §5.5; Doc-4E (FROZEN) |
| Engagement | per Doc-2 §3.5 (open/update/close) | BC-OPS-2 | Doc-2 §3.5/§10.5; Doc-4F (FROZEN) |
| Private Vendor Record | `active / archived` (claim lifecycle N/A — PATCH-02) | BC-OPS-1 | Doc-2 §3; Doc-4F (FROZEN) |
| Category Assignment | `proposed / active / removed` | Marketplace | Doc-2 §3 (`category_assignments`); Doc-4D (FROZEN) |
| Product | `draft / published / unpublished` | Marketplace | Doc-2 §3 (`products`); Doc-4D (FROZEN) |
| Microsite | `draft / published / unpublished` | Marketplace | Doc-2 §3 (`microsites`); Doc-4D (FROZEN) |
| Custom Domain | `pending / verified / active / released` | Marketplace | Doc-2 §3 (`custom_domains`); Doc-4D (FROZEN) |
| Verification Record | per Doc-2 §5.6 | Trust / Verification | Doc-2 §5.6; Doc-4G (FROZEN) |
| Verified Financial Tier | `pending_verification / verified / suspended / expired` (`declared` = absence of row) | Trust tier | Doc-2 §3, §5.6; Doc-4G (FROZEN) |
| Document Template | per Doc-2 §5.9 | BC-OPS-4 | Doc-2 §5.9; Doc-4F (FROZEN) |
| Delegation Grant | per Doc-2 §5.10 | Identity / Delegation | Doc-2 §5.10; Doc-4C (FROZEN) |
| Subscription | `pending_payment / active / expired` (cancel = `active + auto_renew=false`; A-06) | BC-BILL-* | Doc-2 §5.7; Doc-4I (FROZEN) |
| Advertisement | per Doc-2 §5.8 (A-07 minimal) | Marketplace | Doc-2 §5.8; Doc-4D (FROZEN) |
| Membership | per Doc-2 §5.2 | Identity / Membership | Doc-2 §5.2; Doc-4C (FROZEN) |
| Vendor Lead | per Doc-2 §3 (`vendor_leads` status) | BC-OPS-3 | Doc-2 §3; Doc-4F (FROZEN) |
| Support Ticket | per Doc-2 §3 (`support_tickets` status) | Communication / Support | Doc-2 §3; Doc-4H (FROZEN) |
| Platform Invoice | per Doc-2 §3 (`platform_invoices` status) | BC-BILL-* | Doc-2 §3; Doc-4I (FROZEN) |
| AI derived artifacts | cache: `fresh / stale / expired` (derive-on-demand; Doc-2 §10.10) | BC-AI-1…4 | Doc-2 §10.10; Doc-4K (FROZEN) |

*State strings are quoted as navigation keys into the source enumeration. The authoritative state set, including any state not surfaced here, is in the Reference Source. This matrix introduces no state.*

*Where the Reference Source is Doc-2 §3 (status enum) rather than Doc-2 §5 (named state machine), the listed states are the field-level enumeration only — no authoritative transition graph exists in Doc-2 for these entities. Transition guards (if any) are in the owning module's frozen Doc-4 state-transition contract. Do not infer a full lifecycle state machine from a §3 status enum.*

---

## M5 — Transition Authority Matrix

**Reference only. Do not restate transition rules.** Complete transition inventory per entity with the actor/contract that owns the trigger. Guards, pre/post-conditions, and the validity clock are **not** restated; they live in Doc-3 and the owning module's state-transition contract.

**This matrix is the complete transition inventory for all M3-enumerated entities.** One transition per row. One trigger authority per row. Guards and pre/post-conditions are in Doc-3 and the owning module's frozen Doc-4 state-transition contracts — not restated here.

| Entity | From State | To State | Trigger Authority | Reference Source |
|---|---|---|---|---|
| **Organization** | | | | |
| Organization | per Doc-2 §5.1 (pre-claim state) | `claimed` | User (Owner completes org claim) | Doc-2 §5.1; Doc-4C (FROZEN) |
| Organization | `claimed` | `active` | System (claim verification complete) | Doc-2 §5.1; Doc-4C (FROZEN) |
| Organization | `active` | `suspended` | Admin (compliance/payment gate) | Doc-2 §5.1; Doc-4C (FROZEN) — see M6 |
| Organization | `suspended` | `active` | Admin (suspension lifted) | Doc-2 §5.1; Doc-4C (FROZEN) |
| Organization | `active` / `suspended` | `closed` | User (Owner transfer + delete) / Admin | Doc-2 §5.1; Doc-4C (FROZEN) |
| **Membership** | | | | |
| Membership | `invited` | `active` | User (invite accepted) | Doc-2 §5.2; Doc-4C (FROZEN) |
| Membership | `active` | `suspended` | Admin / Owner (role gate) | Doc-2 §5.2; Doc-4C (FROZEN) |
| Membership | `suspended` | `active` | Admin / Owner (suspension lifted) | Doc-2 §5.2; Doc-4C (FROZEN) |
| Membership | `active` / `suspended` | `removed` | Owner / Admin (member removal) | Doc-2 §5.2; Doc-4C (FROZEN) |
| **Delegation Grant** | | | | |
| Delegation Grant | `pending` | `active` | User (delegatee accepts) | Doc-2 §5.10; Doc-4C (FROZEN) |
| Delegation Grant | `active` | `revoked` | User (grantor revokes) / System (scope expiry) | Doc-2 §5.10; Doc-4C (FROZEN) |
| Delegation Grant | `active` | `expired` | System (TTL expiry) | Doc-2 §5.10; Doc-4C (FROZEN) |
| **Vendor Profile** | | | | |
| Vendor Profile | `seeded` | `invited` | System (invite dispatched) | Doc-2 §5.3; Doc-4D (FROZEN) |
| Vendor Profile | `invited` | `claimed` | User (vendor completes claim) | Doc-2 §5.3; Doc-4D (FROZEN) |
| Vendor Profile | `claimed` | `verified` | Trust verification decision (Doc-4G) | Doc-2 §5.3; Doc-4G → Doc-4D (FROZEN) — see M6-8 |
| Vendor Profile | `active` | `suspended` | Admin (compliance) | Doc-2 §5.3; Doc-4D (FROZEN) |
| Vendor Profile | `suspended` | `active` | Admin (suspension lifted) | Doc-2 §5.3; Doc-4D (FROZEN) |
| Vendor Profile | `active` | `banned` | Admin ban (`staff_can_ban`; emits `VendorBanned`) | Doc-2 §5.3, §8; Doc-4J → Doc-4D (FROZEN) — see M6-4 |
| **Category Assignment** | | | | |
| Category Assignment | `proposed` | `active` | Admin (category approved) | Doc-2 §3 (`category_assignments`); Doc-4D (FROZEN) |
| Category Assignment | `active` | `removed` | Admin (category removed) | Doc-2 §3 (`category_assignments`); Doc-4D (FROZEN) |
| Category Assignment | `proposed` | `removed` | Admin (proposal rejected) | Doc-2 §3 (`category_assignments`); Doc-4D (FROZEN) |
| **Product** | | | | |
| Product | `draft` | `published` | User (`can_manage_products`; entitlement-gated) | Doc-2 §3 (`products`); Doc-4D (FROZEN) |
| Product | `published` | `unpublished` | User (`can_manage_products`) / Admin | Doc-2 §3 (`products`); Doc-4D (FROZEN) |
| Product | `unpublished` | `published` | User (`can_manage_products`; entitlement-gated) | Doc-2 §3 (`products`); Doc-4D (FROZEN) |
| **Microsite** | | | | |
| Microsite | `draft` | `published` | User (`can_publish_profile`; entitlement-gated) | Doc-2 §3 (`microsites`); Doc-4D (FROZEN) |
| Microsite | `published` | `unpublished` | User (`can_publish_profile`) / Admin | Doc-2 §3 (`microsites`); Doc-4D (FROZEN) |
| Microsite | `unpublished` | `published` | User (`can_publish_profile`; entitlement-gated) | Doc-2 §3 (`microsites`); Doc-4D (FROZEN) |
| **Custom Domain** | | | | |
| Custom Domain | `pending` | `verified` | Marketplace (entitlement-gated DNS check) | Doc-2 §3 (`custom_domains`); Doc-4D (FROZEN) |
| Custom Domain | `verified` | `active` | Marketplace (entitlement-gated activation) | Doc-2 §3 (`custom_domains`); Doc-4D (FROZEN) |
| Custom Domain | `active` | `released` | User (domain detached) / Admin | Doc-2 §3 (`custom_domains`); Doc-4D (FROZEN) |
| **Advertisement** | | | | |
| Advertisement | per Doc-2 §5.8 (A-07) | per Doc-2 §5.8 (A-07) | per Doc-2 §5.8 (A-07 minimal) | Doc-2 §5.8; Doc-4D (FROZEN) — see M7 `ASSUMPTION A-07` |
| **RFQ** | | | | |
| RFQ | `draft` | `pending_internal_approval` | User (buyer submits for internal approval — optional gate) | Doc-2 §5.4; Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `draft` | `submitted` | User (buyer; direct submit where approval gate absent) | Doc-2 §5.4; Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `pending_internal_approval` | `submitted` | User (approver; `can_approve_rfq`) | Doc-2 §5.4; Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `pending_internal_approval` | `cancelled` | User (audited reason) | Doc-2 §5.4; Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `submitted` | `under_review` | Platform moderation | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `under_review` | `matching` | System (moderation pass) | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `matching` | `vendors_notified` | System (matching complete; invitations dispatched) | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `vendors_notified` | `quotations_received` | System (first quotation received) | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `quotations_received` | `buyer_reviewing` | User (buyer opens review) | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `buyer_reviewing` | `shortlisted` | User (buyer shortlists) | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `shortlisted` | `closed_won` | User (`can_award_rfq`; emits `RFQClosedWon`) | Doc-3 §1.2; Doc-4E (FROZEN) — see M6-1 |
| RFQ | `shortlisted` | `closed_lost` | User (no award) | Doc-3 §1.2; Doc-4E (FROZEN) |
| RFQ | `vendors_notified` | `expired` | System actor (validity clock) | Doc-3 §1.2/§1.4; Doc-4E (FROZEN) |
| RFQ | `quotations_received` | `expired` | System actor (validity clock) | Doc-3 §1.2/§1.4; Doc-4E (FROZEN) |
| RFQ | `buyer_reviewing` | `expired` | System actor (validity clock) | Doc-3 §1.2/§1.4; Doc-4E (FROZEN) |
| RFQ | `draft` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `submitted` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `under_review` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `matching` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `vendors_notified` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `quotations_received` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `buyer_reviewing` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| RFQ | `shortlisted` | `cancelled` | User (audited reason) | Doc-3 §1.6; Doc-4E (FROZEN) |
| **RFQ Invitation** | | | | |
| RFQ Invitation | `draft` | `selected` | System (matching selects vendor) | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| RFQ Invitation | `selected` | `deferred` | System / User (deferral logic) | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| RFQ Invitation | `selected` | `delivered` | System (delivery dispatch; emits `VendorInvited`) | Doc-2 §3, §8; Doc-4E (FROZEN) — see M6-2 |
| RFQ Invitation | `deferred` | `delivered` | System (deferral resolved; emits `VendorInvited`) | Doc-2 §3, §8; Doc-4E (FROZEN) |
| RFQ Invitation | `delivered` | `accepted` | User (vendor; `can_respond_to_rfq`) | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| RFQ Invitation | `delivered` | `declined` | User (vendor; `can_respond_to_rfq`) | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| RFQ Invitation | `delivered` | `expired` | System (validity clock) | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| RFQ Invitation | `accepted` | `expired` | System (parent RFQ expires/cancels) | Doc-2 §3 (`rfq_invitations`); Doc-4E (FROZEN) |
| **Quotation** | | | | |
| Quotation | `draft` | `submitted` | User (vendor; `can_submit_quote`) | Doc-2 §5.5; Doc-4E (FROZEN) |
| Quotation | `submitted` | `withdrawn` | User (vendor; `can_withdraw_quote`) | Doc-2 §5.5; Doc-4E (FROZEN) |
| Quotation | `submitted` | `shortlisted` | User (buyer selects for shortlist) | Doc-2 §5.5; Doc-4E (FROZEN) |
| Quotation | `shortlisted` | `selected` | User (`can_award_rfq`; award decision) | Doc-2 §5.5; Doc-4E (FROZEN) |
| Quotation | `shortlisted` | `not_selected` | User (award goes to another quotation) | Doc-2 §5.5; Doc-4E (FROZEN) |
| Quotation | `submitted` | `expired` | System (parent RFQ expires) | Doc-2 §5.5; Doc-4E (FROZEN) |
| **Engagement** | | | | |
| Engagement | `—` *(no prior state; created directly into `active` by `RFQClosedWon`)* | `active` | System (`RFQClosedWon` creates and activates) | Doc-2 §3.5, §8; Doc-4F (FROZEN) — see M6-1 |
| Engagement | `active` | `completed` | User (`can_manage_engagements`; completion confirmation) | Doc-2 §3.5; Doc-4F (FROZEN) |
| Engagement | `active` | `disputed` | User (`can_manage_engagements`; dispute raised) | Doc-2 §3.5; Doc-4F (FROZEN) |
| Engagement | `disputed` | `active` | User / Admin (dispute resolved) | Doc-2 §3.5; Doc-4F (FROZEN) |
| Engagement | `disputed` | `terminated` | Admin (unresolvable dispute) | Doc-2 §3.5; Doc-4F (FROZEN) |
| Engagement | `active` | `terminated` | Admin (compliance) | Doc-2 §3.5; Doc-4F (FROZEN) |
| **Private Vendor Record** | | | | |
| Private Vendor Record | `active` | `archived` | User (`can_manage_private_vendors`; archive action) | Doc-2 §3 (`private_vendor_records`); Doc-4F (FROZEN) |
| Private Vendor Record | `archived` | `active` | User (`can_manage_private_vendors`; restore action) | Doc-2 §3 (`private_vendor_records`); Doc-4F (FROZEN) |
| **Vendor Lead** | | | | |
| Vendor Lead | `new` | `contacted` | User (`can_manage_leads`; outreach logged) | Doc-2 §3 (`vendor_leads`); Doc-4F (FROZEN) |
| Vendor Lead | `contacted` | `qualified` | User (`can_manage_leads`; qualification set) | Doc-2 §3 (`vendor_leads`); Doc-4F (FROZEN) |
| Vendor Lead | `qualified` | `converted` | System (vendor invited to RFQ via `VendorInvited`) | Doc-2 §3 (`vendor_leads`); Doc-4F (FROZEN) — see M6-2 |
| Vendor Lead | `new` / `contacted` / `qualified` | `disqualified` | User (`can_manage_leads`) | Doc-2 §3 (`vendor_leads`); Doc-4F (FROZEN) |
| **Document Template** | | | | |
| Document Template | `draft` | `active` | User (`can_manage_templates`; publish) | Doc-2 §5.9; Doc-4F (FROZEN) |
| Document Template | `active` | `archived` | User (`can_manage_templates`; archive) | Doc-2 §5.9; Doc-4F (FROZEN) |
| Document Template | `archived` | `active` | User (`can_manage_templates`; restore) | Doc-2 §5.9; Doc-4F (FROZEN) |
| Document Template | `draft` | `archived` | User (`can_manage_templates`; discard draft) | Doc-2 §5.9; Doc-4F (FROZEN) |
| **Verification Record** | | | | |
| Verification Record | `submitted` | `under_review` | System (assigned to verification_tasks queue) | Doc-2 §5.6; Doc-4G (FROZEN) — see M6-5 |
| Verification Record | `under_review` | `approved` | Admin (`staff_can_verify`; verification decision) | Doc-2 §5.6; Doc-4G (FROZEN) — see M6-5 |
| Verification Record | `under_review` | `rejected` | Admin (`staff_can_verify`; verification decision) | Doc-2 §5.6; Doc-4G (FROZEN) — see M6-5 |
| Verification Record | `approved` | `expired` | System (TTL / re-verification trigger) | Doc-2 §5.6; Doc-4G (FROZEN) |
| Verification Record | `rejected` | `submitted` | User (resubmission; `can_submit_verification`) | Doc-2 §5.6; Doc-4G (FROZEN) |
| **Verified Financial Tier** | | | | |
| Verified Financial Tier | `pending_verification` | `verified` | Admin (`staff_can_verify`; Trust stores; emits `VendorTierChanged`) | Doc-2 §5.6; Doc-4G (FROZEN) — see M6-3 |
| Verified Financial Tier | `verified` | `suspended` | Admin (compliance review) | Doc-2 §3; Doc-4G (FROZEN) |
| Verified Financial Tier | `suspended` | `verified` | Admin (suspension lifted) | Doc-2 §3; Doc-4G (FROZEN) |
| Verified Financial Tier | `verified` | `expired` | System (TTL / re-verification trigger) | Doc-2 §3; Doc-4G (FROZEN) |
| **Support Ticket** | | | | |
| Support Ticket | `open` | `in_progress` | User / Staff (`staff_can_support`; assignment) | Doc-2 §3 (`support_tickets`); Doc-4H (FROZEN) |
| Support Ticket | `in_progress` | `resolved` | Staff (`staff_can_support`; resolution logged) | Doc-2 §3 (`support_tickets`); Doc-4H (FROZEN) |
| Support Ticket | `resolved` | `closed` | System (auto-close) / User (confirms) | Doc-2 §3 (`support_tickets`); Doc-4H (FROZEN) |
| Support Ticket | `resolved` | `in_progress` | User (re-open; issue persists) | Doc-2 §3 (`support_tickets`); Doc-4H (FROZEN) |
| Support Ticket | `open` / `in_progress` | `closed` | Admin / User (close without resolution) | Doc-2 §3 (`support_tickets`); Doc-4H (FROZEN) |
| **Subscription** | | | | |
| Subscription | `pending_payment` | `active` | Billing on payment success; emits `SubscriptionPurchased` | Doc-2 §5.7, §8; Doc-4I (FROZEN) — see M6-6 |
| Subscription | `active` | `active` *(flag mutation — state unchanged; cancel = auto_renew=false per A-06)* | User (`can_manage_billing`) | Doc-2 §5.7 (A-06); Doc-4I (FROZEN) |
| Subscription | `active` | `expired` | System (renewal failed / cancel + period end); emits `SubscriptionExpired` | Doc-2 §5.7, §8; Doc-4I (FROZEN) — see M6-6 |
| Subscription | `expired` | `pending_payment` | User (`can_manage_billing`; resubscribe) | Doc-2 §5.7; Doc-4I (FROZEN) |
| Subscription | `active` | `active` *(renewal event — state unchanged; emits `SubscriptionRenewed` per A-06)* | System (auto-renewal success) | Doc-2 §5.7, §8; Doc-4I (FROZEN) |
| **Platform Invoice** | | | | |
| Platform Invoice | `draft` | `issued` | System (Billing; invoice generation) | Doc-2 §3 (`platform_invoices`); Doc-4I (FROZEN) |
| Platform Invoice | `issued` | `paid` | System (payment confirmation) | Doc-2 §3 (`platform_invoices`); Doc-4I (FROZEN) |
| Platform Invoice | `issued` | `overdue` | System (payment deadline passed) | Doc-2 §3 (`platform_invoices`); Doc-4I (FROZEN) |
| Platform Invoice | `overdue` | `paid` | System (late payment confirmed) | Doc-2 §3 (`platform_invoices`); Doc-4I (FROZEN) |
| Platform Invoice | `overdue` | `voided` | Admin (write-off / compliance) | Doc-2 §3 (`platform_invoices`); Doc-4I (FROZEN) |
| **AI Derived Artifacts** | | | | |
| AI Derived Artifact | `(absent)` | `fresh` | System (`generate_*` contract; derive-on-demand) | Doc-2 §10.10; Doc-4K (FROZEN) |
| AI Derived Artifact | `fresh` | `stale` | System (TTL elapsed or source entity mutated) | Doc-2 §10.10; Doc-4K (FROZEN) |
| AI Derived Artifact | `stale` | `fresh` | System (re-derive on next request) | Doc-2 §10.10; Doc-4K (FROZEN) |
| AI Derived Artifact | `fresh` / `stale` | `expired` | System (`expire_*` contract; cache purge) | Doc-2 §10.10; Doc-4K (FROZEN) |

*Each row names the **trigger authority** (the actor/contract permitted to drive the transition), not the rule. One transition → one trigger authority. Guards, pre/post-conditions, and the validity clock are in Doc-3 and the owning module's frozen Doc-4 state-transition contracts — not restated here. Terminal states (e.g., RFQ `closed_won / closed_lost / cancelled / expired` — Doc-3 §1.6) have no outbound rows; do not author a transition out of them.*

---

## M6 — Cross-Module State Dependencies

**Reference only.** State transitions that require coordination across module boundaries — one module's transition triggers or gates another's, always via the frozen §8 event or a documented service seam. No transition is created here; each is a documented dependency.

| # | Dependency | Source transition (owner) | Effect in target module (owner) | Reference Source |
|---|---|---|---|---|
| M6-1 | **RFQ → Operations.** RFQ closing won creates the post-award engagement. | RFQ `→ closed_won` (3 — RFQ) emits `RFQClosedWon` | Engagement created (4 — Operations / BC-OPS-2) | Doc-2 §8; Doc-4E → Doc-4F (FROZEN) |
| M6-2 | **RFQ → Operations / Communication.** Invitation delivery drives lead creation + notification fan-out. | RFQ Invitation `→ delivered` (3 — RFQ) emits `VendorInvited` | Vendor lead created (4 — Operations / BC-OPS-3); notification dispatched (6 — Communication) | Doc-2 §3, §8; Doc-4E → Doc-4F / Doc-4H (FROZEN) |
| M6-3 | **Verification → Marketplace.** Verified-tier status change synchronizes the marketplace tier history. | Verified Financial Tier status change (5 — Trust) emits `VendorTierChanged (tier_type='verified')` | Marketplace writes `financial_tier_history` (2 — Marketplace) — Trust never writes it directly | Doc-2 §8; Doc-4G → Doc-4D (FROZEN) |
| M6-4 | **Admin → Marketplace.** Admin ban transitions the vendor profile to banned. | Ban action (8 — Admin) emits `VendorBanned` | Vendor Profile `→ banned` reflected (2 — Marketplace) | Doc-2 §8; Doc-4J → Doc-4D (FROZEN) DD-3 |
| M6-5 | **Admin → Trust.** Admin verification decision drives the Trust-owned verification record/tier. | Verification decision (8 — Admin, via verification_tasks) | Verification Record / Verified Tier transition (5 — Trust stores) | Doc-2 §5.6; Doc-4J → Doc-4G (FROZEN) |
| M6-6 | **Billing → Identity.** Subscription lifecycle refreshes org entitlement. | Subscription `→ active/expired` (7 — Billing) emits `SubscriptionPurchased/Renewed/Expired` | Entitlement cache refresh for the organization (1 — Identity / consumers) | Doc-2 §8; Doc-4I (FROZEN) |
| M6-7 | **Marketplace → Trust.** Ownership transfer triggers the Trust Protection Workflow (trust freeze → review → reactivation). | Vendor ownership transfer approval (2 — Marketplace) emits `VendorOwnershipTransferred` | Trust freeze/reactivation workflow (5 — Trust) | Doc-2 §5.3, §8; Doc-4D → Doc-4G (FROZEN) |
| M6-8 | **Trust → Marketplace (claim-status).** Verification approval updates the Vendor Profile claim dimension from `claimed` to `verified`. | Verification record approval (5 — Trust, via verification_tasks; `staff_can_verify`) | Vendor Profile claim status updated `claimed → verified` (2 — Marketplace / Doc-4D reflects; Trust never writes `vendor_profiles` directly) | Doc-2 §5.3, §5.6; Doc-4G → Doc-4D (FROZEN) |

*Each cross-module transition rides the frozen Doc-2 §8 event (or a named service seam); the emitting module owns the event and the consuming module authors its own consumer (single-authorship). This index records the dependency; the authoritative contracts are in the cited frozen documents. Event payload/idempotency are not restated.*

---

## M7 — Escalation Markers

**List only. No resolution. No normalization.** Unresolved lifecycle-related escalation markers and assumption flags inherited from the frozen corpus. Each is carried verbatim from its source; identifier formats are source-native and are not normalized by Doc-4M.

| Marker | Scope | Source (frozen) |
|---|---|---|
| `ASSUMPTION A-06` | Subscription minimal state machine (`pending_payment/active/expired`; cancel = `active + auto_renew=false`) — architecture defines ownership + events, not states. | Doc-2 §5.7 (A-06) |
| `ASSUMPTION A-07` | Advertisement minimal state machine. | Doc-2 §5.8 (A-07) |
| `PATCH-02` (claim-lifecycle scope) | Claim lifecycle applies only to marketplace vendor profiles, never to private vendor records — carried as a lifecycle-scope constraint. | Architecture Patch v1.0.1 PATCH-02; Doc-2 §5.3, §3 |
| `[ESC-AI-EVENT]` | AI Layer carries no §8 lifecycle event (pull/derive-on-demand); cache lifecycle only. | Doc-4K (FROZEN) |
| Module lifecycle `[ESC-*]` carries | Any module-level lifecycle/state escalation marker resides in that module's frozen freeze record and is authoritative there. | Doc-4B–4L (FROZEN) |

*This list consolidates the lifecycle-related markers and assumption flags surfaced by the frozen corpus; it resolves none, normalizes none, renames none, and adds none of its own. Additional markers, if any, are authoritative in their owning module's frozen document.*

---

## M8 — AI-Agent Consumption Rules

**Reference-never-restate. State lookup only.** Guidance for Claude Code, Cursor, and other AI coding agents performing state/transition lookup against this index. These are navigation rules, not lifecycle rules.

1. **This index is a pointer, not a definition.** To implement a state or transition, open the **Reference Source** cited in M3/M4/M5 and read the authoritative state machine there. Never generate lifecycle behavior from this document — it restates none.
2. **Doc-2 §5 is the canonical state-machine home; Doc-3 holds operational transition semantics.** Treat the M4 state column and M5 transition rows as navigation keys into those sources. If a state or transition is not in the corpus, it does not exist — do not infer one.
3. **Owner Module/BC tells you where the transition contract lives.** Use Owner Module + Owner BC to locate the authoritative state-transition contract (Doc-4A template 21.4) in that module's frozen Doc-4 document; do not assume a transition is owned by a module that merely reacts to it.
4. **One transition → one trigger authority.** The actor/contract in M5 is the only authority permitted to drive that transition. Do not implement a second trigger path. Guards and pre/post-conditions are in Doc-3 / the owning contract.
5. **Honor cross-module seams (M6).** A transition that affects another module rides the frozen §8 event; the emitter owns the event, the consumer authors its own handler (single-authorship). Do not write cross-module state directly.
6. **Terminal states are terminal.** Where the source marks a state terminal (e.g., RFQ `closed_won/closed_lost/cancelled/expired` — Doc-3 §1.6), never author a transition back out of it.
7. **Escalation markers / assumptions (M7) are unresolved.** Treat `ASSUMPTION A-06/A-07` and other carries as open; consult the owning source and surface the assumption rather than hardening it silently.
8. **On any apparent conflict, FLAG-AND-HALT.** If this index disagrees with a frozen source, the frozen source wins; stop and surface the discrepancy rather than proceeding.

---

## M9 — Freeze Notes

**Governance constraints and limitations.**

1. **Non-normative.** Doc-4M is a consolidation index. It defines, owns, and decides nothing. It must **not** be cited as a contract source, a state-machine specification, or a lifecycle authority. The authoritative sources are Doc-2 §5 (state machines), Doc-3 (operational transition semantics), and each owning module's frozen Doc-4 state-transition contracts.
2. **Reference-never-restate (Doc-4A §0.3).** No state definition, transition rule, event contract, workflow map, or permission logic is duplicated here. Every cell is a pointer. Any future edit that introduces a restatement is out of scope for this document.
3. **Nothing created.** No state, transition, workflow, business rule, ownership, or event is introduced. The entity/state/transition set is exactly the frozen corpus set; nothing is inferred or coined.
4. **One entity → one state authority; one transition → one trigger authority.** The matrices are structured so each entity resolves to a single owning state machine and each transition to a single trigger authority — preventing duplicate lifecycle ownership and state/transition ambiguity. Where a frozen source states ownership explicitly, that statement governs over any inference in this index.
5. **Derivation, not authority.** Owner-BC and trigger attributions are derived by pointer from the frozen documents. The frozen corpus governs; this index is corrected to match it, never the reverse.
6. **FROZEN.** This document is Doc-4M_FROZEN_v1.0. It is the authoritative, locked consolidation index for the iVendorZ State Machine Contracts. It supersedes all prior Doc-4M drafts. No content may be modified without a new Board-authorized patch cycle.

---

*End of Doc-4M_FROZEN_v1.0. State Machine Contracts — FROZEN 2026-06-20. Consolidation document (non-normative; reference-never-restate). 23 lifecycle-bearing entities across Modules 1–9 consolidated by reference. Complete M5 transition inventory. 8 cross-module seams (M6-1 through M6-8). 5 escalation markers verbatim (A-06, A-07, PATCH-02, [ESC-AI-EVENT], module-level carry). Creates no state, transition, workflow, business rule, ownership, or event. Lifecycle source of truth: Doc-2 §5 + Doc-3. Contract grammar: Doc-4A (21.4 state-transition template). Corpus authority: Master Architecture FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN) → Doc-4M_Structure_FROZEN_v1.0 → Doc-4M_PassA_Content_v1.0. Doc-4M is hereby designated: Doc-4M_FROZEN_v1.0.*
