# Doc-4L_Structure_Proposal_v0.1

**Document title (target):** `Doc-4L — Permission Authority Matrix v1.0`
**This artifact:** `Doc-4L_Structure_Proposal_v0.1` (structure proposal only)

| Field | Value |
|---|---|
| Document | `Doc-4L_Structure_Proposal_v0.1` — structure proposal for the Permission Authority Matrix |
| Nature | **Consolidation document.** Creates no permission, ownership, role, actor, business rule, or state transition. Consolidates permission authority already defined in the frozen corpus, by reference only. |
| Discipline | **Reference-never-restate** (Doc-4A §0.3). Every cell is a pointer to an authoritative source; no permission specification, role bundle, authorization logic, or state-machine behavior is duplicated. |
| Authority | Master Architecture (FROZEN) → ADR Compendium (FROZEN) → Doc-2 v1.0.3 (FROZEN) → Doc-3 v1.0.2 (FROZEN) → Doc-4A v1.0 (FROZEN) → Doc-4B–4K (FROZEN). On any conflict: **FLAG-AND-HALT**. |
| Permission source of truth | **Doc-2 §7 — Permission Mapping** (the canonical slug catalog). Owner-BC attribution is by pointer to each module's frozen Doc-4 document. |
| Status | Structure proposal. No self-review. No findings. No future phases. |

---

## L1 — Purpose

**Objective.** Provide a single lookup surface that resolves, for any permission slug already defined in the frozen corpus:

```
Permission → Owner Module → Owner BC → Resolution Authority → Reference Source
```

so that Backend Engineers, Frontend Engineers, QA Engineers, Claude Code, Cursor, and other AI coding agents can determine **where a permission is owned and how it is resolved without searching ten module documents**.

**Authority and limits.** This document is a navigational index over frozen material. It is **non-normative**: it defines nothing, owns nothing, and may not be cited as a contract source. Where this index and any frozen source appear to disagree, the frozen source governs and the discrepancy is escalated (FLAG-AND-HALT) — this index is corrected, never the frozen corpus. The canonical permission catalog remains **Doc-2 §7**; authorization mechanics remain **Doc-4A** and each owning module's frozen Doc-4 document.

**What this document does not do.** It does not define permissions, define or compose roles, specify authorization logic, or describe state-machine behavior. Those live in the authoritative sources to which every row points.

---

## L2 — Authority Chain

Frozen sources governing permission ownership, in precedence order (highest first). All permission attribution in L3–L7 resolves through this chain.

| Precedence | Source | Role in permission authority |
|---|---|---|
| 1 | Master System Architecture v1.0 FINAL (FROZEN) | Role model, actor types, delegation principle, staff-vs-tenant separation (Arch §13.3, §5.6, §6) |
| 2 | ADR Compendium v1 (FROZEN) | Ownership and authorization decisions of record |
| 3 | Doc-2 v1.0.3 (FROZEN) | **§7 Permission Mapping — canonical slug catalog;** §9 audit actor types; §13.3 role bundles |
| 4 | Doc-3 v1.0.2 (FROZEN) | Operational/state context in which permission gates apply; §12.2 POLICY channel |
| 5 | Doc-4A v1.0 (FROZEN) | Authorization grammar: `check_permission`, single-authorship (§4), authz placement (§5/§6), reference-never-restate (§0.3) |
| 6 | Doc-4B–4K (FROZEN) | Per-module owner-BC attribution and resolution seams (each module's frozen Doc-4 document) |

**Module → frozen-document index (owner-BC reference targets for L3):**

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

---

## L3 — Permission Ownership Matrix

**Reference only. No permission definitions.** Each slug is defined in Doc-2 §7; the Owner Module/BC is the module that owns the gated entity/action per its frozen Doc-4 document. (Indicative role defaults O/D/M/F and staff scoping are in Doc-2 §7 — not restated here.)

### Tenant (organization) permission slugs

| Permission | Owner Module | Owner BC | Reference Source |
|---|---|---|---|
| `can_create_rfq` | 3 — RFQ | RFQ lifecycle (BC-RFQ-*) | Doc-2 §7; Doc-4E (FROZEN) |
| `can_approve_rfq` | 3 — RFQ | RFQ lifecycle | Doc-2 §7; Doc-4E (FROZEN) |
| `can_view_rfq` | 3 — RFQ | RFQ lifecycle | Doc-2 §7; Doc-4E (FROZEN) |
| `can_view_all_rfqs` | 3 — RFQ | RFQ lifecycle | Doc-2 §7; Doc-4E (FROZEN) |
| `can_cancel_rfq` | 3 — RFQ | RFQ lifecycle | Doc-2 §7; Doc-4E (FROZEN) |
| `can_approve_vendor_selection` | 3 — RFQ | Award / selection | Doc-2 §7; Doc-4E (FROZEN) |
| `can_award_rfq` | 3 — RFQ | Award / selection | Doc-2 §7; Doc-4E (FROZEN) |
| `can_submit_quote` | 3 — RFQ | Quotation (vendor side) | Doc-2 §7; Doc-4E (FROZEN) |
| `can_respond_to_rfq` | 3 — RFQ | Invitation response (vendor side) | Doc-2 §7; Doc-4E (FROZEN) |
| `can_withdraw_quote` | 3 — RFQ | Quotation (vendor side) | Doc-2 §7; Doc-4E (FROZEN) |
| `can_manage_private_vendors` | 4 — Business Operations | BC-OPS-1 Buyer Private CRM | Doc-2 §7; Doc-4F (FROZEN) |
| `can_manage_vendor_status` | 4 — Business Operations | BC-OPS-1 Buyer Private CRM | Doc-2 §7; Doc-4F (FROZEN) |
| `can_manage_engagements` | 4 — Business Operations | BC-OPS-2 Engagement & Commercial Documents | Doc-2 §7; Doc-4F (FROZEN) |
| `can_create_documents` | 4 — Business Operations | BC-OPS-2 / BC-OPS-4 (documents) | Doc-2 §7; Doc-4F (FROZEN) |
| `can_approve_po` | 4 — Business Operations | BC-OPS-2 Engagement & Commercial Documents | Doc-2 §7; Doc-4F (FROZEN) |
| `can_record_payments` | 4 — Business Operations | BC-OPS-2 (trade invoices / payment records) | Doc-2 §7; Doc-4F (FROZEN) |
| `can_approve_payment` | 4 — Business Operations | BC-OPS-2 (payment records) | Doc-2 §7; Doc-4F (FROZEN) |
| `can_manage_finance_records` | 4 — Business Operations | BC-OPS-5 Finance Records | Doc-2 §7; Doc-4F (FROZEN) |
| `can_manage_templates` | 4 — Business Operations | BC-OPS-4 Document Generation & Templates | Doc-2 §7; Doc-4F (FROZEN) |
| `can_manage_leads` | 4 — Business Operations | BC-OPS-3 Vendor Lead Pipeline | Doc-2 §7; Doc-4F (FROZEN) |
| `can_manage_vendor_profile` | 2 — Marketplace | Vendor profile / categories / tier | Doc-2 §7; Doc-4D (FROZEN) |
| `can_publish_profile` | 2 — Marketplace | Profile experience / publish | Doc-2 §7; Doc-4D (FROZEN) |
| `can_manage_products` | 2 — Marketplace | Vendor products / catalog | Doc-2 §7; Doc-4D (FROZEN) |
| `can_manage_ads` | 2 — Marketplace | Advertising | Doc-2 §7; Doc-4D (FROZEN) |
| `can_upload_spec_documents` | 2 — Marketplace | Specification documents | Doc-2 §7; Doc-4D (FROZEN) |
| `can_manage_users` | 1 — Identity | Membership / team management | Doc-2 §7; Doc-4C (FROZEN) |
| `can_manage_workflow_settings` | 1 — Identity | Organization workflow settings | Doc-2 §7; Doc-4C (FROZEN) |
| `can_transfer_ownership` | 1 — Identity | Ownership / org lifecycle (Owner-only) | Doc-2 §7; Doc-4C (FROZEN) |
| `can_delete_organization` | 1 — Identity | Ownership / org lifecycle (Owner-only) | Doc-2 §7; Doc-4C (FROZEN) |
| `can_submit_verification` | 1 — Identity | Organization (verification submission authority) — see L5 (records owned by Trust) | Doc-2 §7; Doc-4C (FROZEN) DC-2 |
| `can_manage_delegations` | 1 — Identity | Delegation grants (own vendor profile) | Doc-2 §7; Doc-4C (FROZEN) |
| `can_use_messaging` | 6 — Communication | Threads / chat | Doc-2 §7; Doc-4H (FROZEN) |
| `can_raise_support_ticket` | 6 — Communication | Support tickets | Doc-2 §7; Doc-4H (FROZEN) |
| `can_submit_review` | 5 — Trust & Verification | BC-TRUST-5 Reviews / Admin Ratings (post-award; buyer side) | Doc-2 §7; Doc-4G (FROZEN) |
| `can_view_billing` | 7 — Billing | BC-BILL-* (billing & subscription) | Doc-2 §7; Doc-4I (FROZEN) |
| `can_manage_billing` | 7 — Billing | BC-BILL-* (billing & subscription) | Doc-2 §7; Doc-4I (FROZEN) |

### Platform-staff permission slugs (separate slug space — Doc-2 §7)

Staff slugs are held in a separate space from tenant slugs (Doc-2 §7; Arch §13.3). Several act on a domain module's entities while being **resolved by Admin or by Core** — see L5.

| Permission | Owner Module (resolution holder) | Owner BC / surface | Reference Source |
|---|---|---|---|
| `staff_can_moderate_rfq` | 8 — Admin | Moderation (acts on RFQ entities — see L5) | Doc-2 §7; Doc-4J (FROZEN) |
| `staff_can_verify` | 8 — Admin | Verification workflow (Verification Admin; acts on Trust records — see L5) | Doc-2 §7; Doc-4J (FROZEN) |
| `staff_can_ban` | 8 — Admin | Ban (acts on Marketplace vendor profile — see L5; emits `VendorBanned`) | Doc-2 §7; Doc-4J (FROZEN) |
| `staff_can_manage_categories` | 8 — Admin | Category management (acts on Marketplace categories — see L5) | Doc-2 §7; Doc-4J (FROZEN) |
| `staff_can_support` | 6 — Communication | Support Admin (no private-RFQ read) | Doc-2 §7; Doc-4H (FROZEN) |
| `staff_can_redact_audit` | 0 — Platform Core | Audit redaction (compliance-scoped) | Doc-2 §7; Doc-4B (FROZEN) |
| `staff_super_admin` | 0 — Platform Core | Platform-wide (every action audited + flagged); interim authority for the pending least-privilege staff slugs — see L6 | Doc-2 §7; Doc-4B (FROZEN) |

**These seven staff slugs are the complete canonical set in Doc-2 §7** (`staff_can_moderate_rfq`, `staff_can_verify`, `staff_can_ban`, `staff_can_manage_categories`, `staff_can_support`, `staff_can_redact_audit`, `staff_super_admin`). Additional least-privilege staff slug *names* referenced in frozen module documents (`staff_can_manage_feature_flags`, `staff_can_manage_system_configuration`, `staff_can_read_audit`, `staff_can_manage_organizations`) are **future Doc-2 §7 additive enhancements — NOT yet in the catalog**; the authoritative interim slug for those actions is `staff_super_admin`. They are listed in L6 (not above) precisely because they are pending, not catalogued. No slug is invented.

*Module 9 — AI Layer owns **no** permission slug. AI authorization reuses upstream entitlement via `check_permission` (Doc-4K DF-AI-1); the absence of a dedicated `ai_` slug is carried as `[ESC-AI-SLUG]` — see L6.*

*The Owner BC values reference each module's frozen bounded-context inventory. Where a frozen module document names a BC at finer granularity than is needed for lookup, the BC family is cited; the authoritative BC identity is in the referenced document.*

---

## L4 — Permission Resolution Matrix

**Reference only.** "Resolution Authority" = the mechanism/contract that evaluates the permission at runtime, per Doc-4A and the owning module. Actor types are the Doc-2 §9 set: `User | Admin | System | AI Agent`. Resolution mechanics are **not** restated here; rows point to the authoritative source.

| Permission family | Actor Type | Resolution Authority | Reference Source |
|---|---|---|---|
| All tenant slugs (RFQ, Operations, Marketplace, Identity, Communication, Trust review, Billing) | User | `check_permission` against the actor's role-bundle slugs (per-org `identity.roles` + `role_permissions`) | Doc-4A §5/§6; Doc-2 §7, §13.3; Doc-4C (delegation/role resolution) |
| Vendor-side slugs exercised via delegation (`can_submit_quote`, `can_respond_to_rfq`, vendor profile representation) | User (delegated) | `check_permission` **plus** Identity-owned delegation grant (consumed, not owned, by the acting module) | Doc-4A §6; Doc-4C (FROZEN) delegation; Doc-4D (consumes grant) — see L5 |
| Platform-staff slugs (`staff_*`) | Admin | Staff-space authorization; **Admin decides, owning module stores/acts** (where the slug acts on a domain entity) | Doc-2 §7 (staff space); Doc-4J (FROZEN) — see L5 |
| Core staff infrastructure slugs (catalogued: `staff_can_redact_audit`, `staff_super_admin`) | Admin / System | Core-owned staff authorization on platform infrastructure; pending least-privilege splits bind to `staff_super_admin` interim | Doc-2 §7; Doc-4B (FROZEN) — see L6 [D-2] |
| Authorization primitive itself (`check_permission`) | System | Platform Core service consumed by every module | Doc-4A §5/§6; Doc-4B (FROZEN) |
| AI advisory actions (no slug) | AI Agent | No `ai_` slug; reuses upstream entitlement via `check_permission`; AI writes only `ai.*` (advisory) | Doc-4K (FROZEN) DF-AI-1; Master Arch §18 Invariant 12 — see L6 `[ESC-AI-SLUG]` |
| System-actor actions (scheduled/triggered) | System | System authority; no tenant slug required (e.g., expiry/derivation jobs) | Doc-4A §5; owning module's frozen Doc-4 |

*Indicative role defaults (O/D/M/F) and staff scoping rules (e.g., "Verification Admins hold no finance-read slugs; Support Admins hold no private-RFQ slugs") are in Doc-2 §7 — referenced, not restated.*

---

## L5 — Cross-Module Permission Dependencies

**Reference only.** Permission relationships that cross a module boundary. None of these creates a permission; each is a documented seam between the holder of authority and the owner of the gated entity.

| # | Dependency | Authority holder | Entity owner / actor of record | Reference Source |
|---|---|---|---|---|
| L5-1 | **Verification submission vs. verification records.** `can_submit_verification` authorizes the submission; the resulting `verification_records` are Trust-owned. | 1 — Identity (owns the slug) | 5 — Trust (owns `verification_records`) | Doc-4C (FROZEN) DC-2; Doc-4D (FROZEN) DD-1; Doc-2 §5.6, §7 |
| L5-2 | **Delegation grants.** Vendor-side action by an org that does not control the vendor profile is authorized only via an Identity-owned delegation grant; acting modules consume the grant. | 1 — Identity (owns delegation) | 2 — Marketplace / 3 — RFQ (consume grant + `check_permission`) | Doc-4C (FROZEN) §6B; Doc-4D (FROZEN); Doc-4A §6 |
| L5-3 | **Staff moderation of RFQ.** `staff_can_moderate_rfq` is resolved in the Admin staff space but acts on RFQ-owned entities. | 8 — Admin (resolves) | 3 — RFQ (owns entities) | Doc-2 §7; Doc-4J (FROZEN); Doc-4E (FROZEN) |
| L5-4 | **Staff ban of vendor.** `staff_can_ban` is Admin-resolved; the ban acts on the Marketplace vendor profile; Admin emits `VendorBanned`, Marketplace reflects it. | 8 — Admin (resolves; emits event) | 2 — Marketplace (vendor profile; consumes `VendorBanned`) | Doc-2 §7, §8; Doc-4J (FROZEN); Doc-4D (FROZEN) DD-3 |
| L5-5 | **Staff verification workflow.** `staff_can_verify` (Verification Admin) is Admin-resolved; verification decisions act on Trust-owned records. | 8 — Admin (resolves) | 5 — Trust (owns verification records) | Doc-2 §7; Doc-4J (FROZEN); Doc-4G (FROZEN) |
| L5-6 | **Staff category management.** `staff_can_manage_categories` is Admin-resolved; categories are Marketplace-owned. | 8 — Admin (resolves) | 2 — Marketplace (owns categories) | Doc-2 §7; Doc-4J (FROZEN); Doc-4D (FROZEN) |
| L5-7 | **`check_permission` as a universal dependency.** Every module's permission check depends on the Core-provided authorization primitive and on Identity's role/bundle data. | 0 — Core (primitive) + 1 — Identity (role data) | All modules (consumers) | Doc-4A §5/§6; Doc-4B (FROZEN); Doc-4C (FROZEN) |
| L5-8 | **AI advisory under upstream entitlement.** AI holds no slug; its reads/derivations are gated by the upstream owner's `check_permission`, and any resulting authoritative write is performed by a User/System actor in the owning module — never by the AI Agent. | 9 — AI (no slug; consumes) | Upstream owning module (performs authoritative write) | Doc-4K (FROZEN) DF-AI-1; Master Arch §18 Invariant 12 |

*"Admin decides; owning module stores/acts" is the governing pattern for L5-3 through L5-6 (Doc-4J). This index records the seam; the authoritative contracts are in the cited frozen documents.*

---

## L6 — Escalation Markers

**List only. No resolution.** Unresolved permission-related escalation markers and open dependencies inherited from the frozen corpus. Each is carried verbatim from its source; Doc-4L resolves none.

| Marker | Scope | Source (frozen) |
|---|---|---|
| `[ESC-AI-SLUG]` | No dedicated `ai_` permission slug; AI reuses upstream entitlement via `check_permission`. Additive channel Doc-2 §7. | Doc-4K (FROZEN); carried in Doc-4K_FROZEN_v1.0 |
| `[D-2]` (Core) | Least-privilege staff slugs **pending** in Doc-2 §7 — `staff_can_manage_feature_flags`, `staff_can_manage_system_configuration`, `staff_can_read_audit` (config / feature-flag / audit-read). **Not yet catalogued;** authoritative interim = `staff_super_admin` (DOC-2 PATCH PENDING). Names appear in Doc-4B only. | Doc-4B (FROZEN) [D-2] |
| `DC-3` (Identity) | Least-privilege identity-admin slug **pending** in Doc-2 §7 — `staff_can_manage_organizations` (org suspension / ownership-succession recovery). **Not yet catalogued;** future Doc-2 §7 additive enhancement; authoritative interim = `staff_super_admin`. Name appears in Doc-4C only. | Doc-4C (FROZEN) DC-3 |
| `[ESC-OPS-SLUG]` | Operations permission-surface escalation marker carried at module freeze. | Doc-4F (FROZEN) |
| `[ESC-BILL-SLUG]` | Billing permission-surface escalation marker carried at module freeze (`can_view_billing` / `can_manage_billing` only; nothing invented). | Doc-4I (FROZEN) |

*Additional `[ESC-*-SLUG]`-class markers, if any, reside in their owning module's frozen freeze record and are authoritative there. This list consolidates the permission-related markers surfaced by the frozen corpus; it is not a resolution log and adds no marker of its own.*

---

## L7 — AI-Agent Consumption Rules

**Reference-never-restate.** Guidance for Claude Code, Cursor, and other AI coding agents performing permission-authority lookup against this index. These are navigation rules, not authorization rules.

1. **This index is a pointer, not a definition.** To implement or test a permission, open the **Reference Source** cited in L3/L4 and read the authoritative text there. Never generate authorization logic from this document — it restates none.
2. **Doc-2 §7 is the canonical slug catalog.** Treat the L3 slug column as a navigation key into Doc-2 §7. If a slug is not in Doc-2 §7, it does not exist — do not coin one.
3. **Owner Module/BC tells you where the contract lives.** Use the Owner Module + Owner BC to locate the authoritative API/authorization contract in that module's frozen Doc-4 document; do not assume a permission is enforced in the module where it is consumed.
4. **Resolution Authority tells you how it is checked.** All checks resolve through `check_permission` (Doc-4A §5/§6) against per-org role-bundle slugs; staff slugs resolve in the separate staff space. Do not hard-code role names — roles are per-org data (Doc-2 §13.3).
5. **Honor cross-module seams (L5).** Where authority holder ≠ entity owner (e.g., `can_submit_verification`, the `staff_*` slugs, delegation), follow the seam to the correct owning contract. Admin decides; the owning module stores/acts.
6. **AI actions hold no slug.** An AI-Agent action is advisory and gated by the upstream owner's entitlement; any authoritative write is performed by a User/System actor in the owning module (Doc-4K DF-AI-1; Master Arch §18 Invariant 12). Do not attribute an authoritative write to the AI Agent.
7. **Escalation markers (L6) are unresolved.** Do not implement against a marker as though it were settled; consult the owning module's freeze record and surface the open dependency.
8. **On any apparent conflict, FLAG-AND-HALT.** If this index disagrees with a frozen source, the frozen source wins; stop and surface the discrepancy rather than proceeding.

---

## L8 — Freeze Notes

**Governance rules and limitations of this document.**

1. **Non-normative.** Doc-4L is a consolidation index. It defines, owns, and decides nothing. It must **not** be cited as a contract source, an authorization specification, or an ownership authority. The authoritative sources are Doc-2 §7 (catalog), Doc-4A (authorization grammar), and each owning module's frozen Doc-4 document.
2. **Reference-never-restate (Doc-4A §0.3).** No permission specification, role bundle, authorization logic, or state-machine behavior is duplicated here. Every cell is a pointer. If any future edit introduces a restatement, that edit is out of scope for this document.
3. **Nothing created.** No permission, ownership, role, actor, business rule, or state transition is introduced. The slug set is exactly the Doc-2 §7 catalog; the staff space is exactly the Doc-2 §7 staff set plus the Core-owned infrastructure staff slugs surfaced by Doc-4B. No slug is coined.
4. **Derivation, not authority.** Owner-BC attributions are derived by pointer from the frozen module documents. Where a frozen document states ownership explicitly (e.g., Doc-4C DC-2 for `can_submit_verification`), that statement governs over any inference in this index.
5. **Drift handling.** This index reflects the frozen corpus at the time of authoring. If the corpus changes (e.g., the Doc-2 §7 least-privilege split noted in L6 `[D-2]` is applied), this index is updated to match — the frozen corpus is never edited to match this index.
6. **Scope boundary.** This is the structure proposal (`v0.1`). It establishes the L1–L8 skeleton and the reference-only matrices. It contains no findings, no review, and no future-phase content.

---

*End of Doc-4L_Structure_Proposal_v0.1. Permission Authority Matrix — consolidation document (non-normative; reference-never-restate). Sections L1–L8: Purpose · Authority Chain · Permission Ownership Matrix · Permission Resolution Matrix · Cross-Module Permission Dependencies · Escalation Markers · AI-Agent Consumption Rules · Freeze Notes. Consolidates the Doc-2 §7 permission catalog across Modules 0–9 by reference only; owner-BC attribution by pointer to Doc-4B–4K (FROZEN). Creates no permission, ownership, role, actor, business rule, or state transition; coins no slug; resolves no escalation marker. Permission source of truth: Doc-2 §7. Authorization grammar: Doc-4A §5/§6. Corpus authority: Master Architecture FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4K (FROZEN). Structure proposal only — no self-review, no findings, no future phases.*
