# iVendorz — ADR Compendium v1

| Field | Value |
|---|---|
| Corpus Version | v0.3.3 (consolidated) |
| Status | FROZEN (amended) |
| Compiled | 2026-06-12 |
| Scope | ADR-001 → ADR-020 + Amendments v0.3, Redlines v0.3.1, v0.3.3 |
| Authority | This document supersedes the individual ADR files for reading purposes. Original files remain the legal record of each decision. |

## How To Read This Compendium

Each ADR is presented once, with:

- **Status** — Approved / Superseded, as originally recorded.
- **Decision** — the normative decision, deduplicated.
- **Amendments** — integrated inline under the owning ADR, labeled with their source (v0.3 / Redline v0.3.1 / Redline v0.3.3) so amendment provenance survives.
- **Review Notes** — where the Architecture Review Board (this consolidation pass) reconciled conflicts, the reconciliation is stated explicitly and logged in §B.

Nothing in this compendium introduces a new decision. Where two approved texts conflicted, the later amendment wins and the reconciliation is recorded.

---

## §A — Governance Signal Matrix (Cross-ADR Invariant)

The platform evaluates vendors along four **independent** governance dimensions, plus one buyer-private lens. No signal may mutate another.

| Signal | ADR | Question Answered | Owner Module |
|---|---|---|---|
| Trust Score | ADR-003 | Can they be trusted? | Trust & Verification |
| Capacity Profile | ADR-004 | Can they execute the work? | Marketplace (data) / Trust (verification) |
| Financial Tier | ADR-006 | What project size should they receive? | Trust & Verification (verified state); Vendor Profile attribute |
| Performance Score | ADR-018 | How well do they actually perform? | Trust & Verification |
| Buyer Vendor Status | ADR-007 R3.3 | Does *this buyer* want them? (private) | Business Operations (Vendor CRM) |

**Firewall rules (binding):**

- Financial Tier must never increase Trust Score (ADR-006 R, Amendment F).
- Financial Tier does not affect Performance Score (ADR-006 R, Amendment G).
- Buyer Approved/Blacklisted status must never mutate platform-wide scores (ADR-007 R3.3, Amendment E).
- Secondary trust signals must never dominate trust calculation (ADR-003 Amendment, v0.3).
- No single governance signal may dominate matching decisions (ADR-006 R, Amendment L).

---

## §B — Architecture Review Board Log (Consolidation Pass)

| # | Item | Verdict | Action Taken |
|---|---|---|---|
| 1 | ADR-006 original body defines Basic/Starter/Growth/Enterprise (subscription packages) while Redline v0.3.1 defines Financial Tier A–E | **Modify** | Original packaging content reclassified under ADR-011 (Subscription/Entitlements). ADR-006 is exclusively the Financial Tier ADR, per v0.3 "Financial vs Subscription Tier" amendment. Eliminates dual meaning of "tier" before Doc-2 schema work. |
| 2 | ADR-003 "admins may not manually modify scores" vs Trust Freeze amendment | **Modify (reconcile)** | Freeze suspends publication and ranking effect only. Score values are never hand-edited; only underlying data may be corrected. Stated normatively in ADR-003. |
| 3 | ADR-009 "never delete audit logs" vs Redaction amendment | **Modify (reconcile)** | Record immutability ≠ field immutability. Sensitive fields may be redacted under approved policy; redaction emits its own audit event. Stated normatively in ADR-009. |
| 4 | ADR-017 "AI owns nothing" vs Redline Amendment C | **Modify** | Amendment C wording is normative: AI owns no *authoritative business* records; may own regenerable derived artifacts. |
| 5 | ADR-020 gates features by plan name (Basic/Starter/Growth/Enterprise) | **Modify** | Violates ADR-011 ("features must never check plan names"). Gating restated as entitlement slugs; plan→entitlement mapping is marketing configuration, not architecture. |
| 6 | Probation pool 80/20 routing split (v0.3, ADR-007 section) | **Modify** | Ratio is policy, not architecture. Stored in Module 0 `system_configuration`; routing engine reads it. Prevents hardcoded redeploys for tuning. |
| 7 | ADR-005 Redline "maturity scores" (4.0 → 9.5/10) | **Modify (editorial)** | Removed from normative text; not a decision. |
| 8 | "mendment L" typo; duplicated ADR files in corpus | **Modify (editorial)** | Fixed; deduplicated. |
| 9 | ADR-019 absent from corpus | **Flag** | Number reserved. Do not backfill. Confirm whether skipped or unpublished before v0.4. |
| 10 | All other approved decisions and amendments | **Keep** | Consolidated verbatim in substance. |
| 11 | Proposals to add new modules / split services early | **Reject** | ADR-017 Future Extraction Rule stands: extraction only when justified by load. |

---

# ADR-001: Technology Stack

**Status:** Approved

## Decision

Adopt a serverless architecture:

- Next.js App Router
- Vercel
- Supabase (Postgres, Auth, Storage, Realtime)
- Inngest
- Resend
- PostHog

## Rationale (summary)

Lowest operational complexity, fastest MVP delivery, scales to early marketplace growth, AI-agent-friendly workflow, minimal DevOps.

## Future Expansion

- Meilisearch for advanced search
- AI Matching Engine
- Dedicated microservices only when justified by load (see ADR-017, Future Extraction Rule)

> **Review note:** Search architecture has no ADR yet. When Meilisearch is adopted, it requires its own ADR (indexing ownership, sync strategy, tenancy filtering per ADR-016).

---

# ADR-002: Platform Money Flow Policy & Escrow Scope

**Status:** Approved

## Decision

iVendorz does **not** provide escrow, wallet, custody, or trade-settlement services in the current platform version. The platform collects only revenue that belongs directly to iVendorz:

Vendor subscriptions · Premium listings · Microsite fees · Lead packages · Advertising · Sponsored placements · Future SaaS services.

Buyer-to-vendor transaction payments occur outside the platform.

## Scope

**In scope:** subscription payment collection, plan purchases, lead packages, advertising purchases, platform service fees.

**Out of scope (current version):** escrow, buyer/vendor wallets, trade settlement, fund custody, payment protection, milestone-based release.

## Strategic Position

Escrow is **deferred, not rejected**. Architecture, schema and workflows must preserve the ability to add Trade Assurance / Escrow / Secure Payments / Financing later **without redesigning the core marketplace**.

## Future Escrow Readiness

The platform continues capturing commercial transaction intelligence: RFQ estimated value, quotation value, awarded value, closed-won value, currency, payment terms, delivery terms. This enables future GMV reporting and trade-assurance products.

If escrow is introduced, it is an **additional financial-services layer** (escrow accounts, transactions, milestone payments, settlement engine, wallet ledger, dispute resolution, compliance) added as new modules — with no changes required to User, Organization, Verification, RFQ, Quotation, or Subscription systems.

## Architectural Consequences

**Required now:** merchant gateway integration (e.g., SSLCOMMERZ, bKash Merchant, Nagad Merchant, bank transfer — fee collection only), subscription billing, invoice generation, payment status tracking, revenue reporting.

**Deferred:** wallet system, escrow ledger, custody accounts, settlement workflows, dispute engine, fund release.

**Guiding principle:** iVendorz manages procurement workflows today and preserves the option to manage procurement payments tomorrow.

---

# ADR-003: Trust Score Engine

**Status:** Approved (amended v0.3)

## Decision

Platform-wide Trust Score Engine evaluating vendor credibility, reliability and engagement. Trust Score is a decision-support metric; it does not replace buyer judgment.

## Components

- **Profile Completeness** — company info, products, services, certifications, contacts
- **Verification Status** — trade license, TIN, BIN, factory verification, ISO
- **Marketplace Activity** — RFQ response rate, participation, profile updates, login activity
- **Performance Indicators** — buyer reviews, completion rate, repeat engagement, response time

## Score Range

0–100. Indicative bands: 0–30 Low · 31–60 Moderate · 61–80 Trusted · 81–100 Highly Trusted.

## Rules

- Trust score updates automatically.
- **Admins may never hand-edit a score value.** Only underlying data may be corrected.
- Reconciliation with Trust Freeze (below): freezing suspends *publication and ranking effect*; the stored value is untouched. Freeze ≠ modification. *(Review item §B-2.)*

## Amendments (v0.3)

**Trust Score Versioning** — required fields: `trust_formula_version`, `trust_score_updated_at`. Trust algorithms evolve; historical scores must remain explainable.

**Trust Freeze** — Trust Score may be frozen during fraud investigation, major dispute, or manual compliance review, to prevent score manipulation during active investigations. During freeze: score hidden, trust ranking disabled, manual review required (effects mirrored in ADR-005 Redline Amendment A).

**Trust Signal Classification**

- *Primary:* verification status, performance score, complaint history, RFQ response quality.
- *Secondary:* profile completion, platform activity.
- Secondary signals must never dominate trust calculation.

## Future Extensions

AI credibility analysis, delivery performance, financial reliability indicators.

**Principle:** Trust is earned through measurable behavior.

---

# ADR-004: Vendor Capacity Profile

**Status:** Approved

## Decision

Every vendor maintains a structured capacity profile, used for RFQ matching, search ranking and buyer evaluation.

## Capacity Areas

- **Manufacturing:** factory size, production capacity, equipment list, workforce size
- **Service Providers:** technical team size, service coverage area, available resources
- **Project Capability:** project size range, industry experience, major clients
- **Commercial Capacity:** annual turnover, years in business, export capability

## Usage & Verification

Contributes to RFQ matching, vendor search, comparison, and trust building. Certain capacity claims may be verified by iVendorz; verified capacity is displayed separately.

## Relationship to Financial Tier (per ADR-006 Redline, Amendment D)

- ADR-006 answers: *what size projects should this vendor receive?*
- ADR-004 answers: *can this vendor actually execute it?*
- **Tier = Claim. Capacity = Evidence.** Capacity contradicting tier (e.g., Tier D with 5 employees) may reduce matching confidence.

**Principle:** Capability should be visible before engagement.

---

# ADR-005: Vendor Identity, Ownership & Representation Model

**Status:** Approved (Revised — supersedes ADR-005 v1; amended Redline v0.3.1)

> **Superseded marker:** ADR-005 v1 ("Vendor Linking Policy", multi-owner ambiguity) is **SUPERSEDED** by this revision. Do not implement against v1.

## Decision

Vendor **Identity** and Vendor **Ownership** are separate concepts.

- Every Vendor Profile has **exactly one Controlling Organization** at any point in time.
- A Vendor Profile may have **0..N Authorized Representatives**.
- Ownership is singular. Representation may be multiple.

## Controlling Organization

Legal and operational owner. Owns: profile, subscription, verification, trust score attribution, categories. Only one at a time.

## Authorized Representatives

Scoped, delegated permissions only (e.g., sales / regional / distributor access).

- **May (if delegated):** view assigned RFQs, submit quotations, manage leads.
- **May never:** transfer ownership, change subscription, delete vendor, modify verification records. *(Redline Amendment E.)*

## Subscription & Trust Rules

- Subscriptions belong to **Organizations**, never Vendor Profiles. Profiles inherit capabilities through the controlling organization.
- Trust Scores belong to the **Vendor Profile**. Ownership changes do not reset trust history.

## Redline v0.3.1 Amendments

**A — Ownership Transfer Trust Protection.** Every ownership transfer automatically triggers the Trust Protection Workflow:

`Transfer Requested → Transfer Approved → Trust Freeze → Compliance Review → Trust Reactivation`

Purpose: prevent trust laundering (high-trust vendor sold to bad actor). Freeze effects: trust score hidden, trust ranking disabled, manual review required.

**B — Quotation Ownership Rule.** Quotations belong to the **Vendor Profile**, not to representative organizations. Constraint: **one vendor = one active quotation per RFQ.** If another representative submits: allowed actions are replace draft, create revision, or withdraw previous version. Two active quotes for the same vendor on the same RFQ are never allowed. *(Resolves the quotation race condition.)*

**C — Quota Attribution Rule.** All usage consumption (RFQ responses, lead access, ad launches) is attributed to the **Controlling Organization's** quota, regardless of which representative acted. Prevents quota splitting, quota abuse, billing ambiguity. **Representatives act. Owners pay.**

**D — Ownership History Model.** Vendor ownership history is preserved permanently. Required fields: `valid_from`, `valid_to`, `transfer_reason`, `approved_by`. Supports audit, compliance, dispute resolution.

**E — Representative Permission Scope.** (Merged above.) Representation ≠ Ownership.

**F — Vendor Identity Invariant.** Vendor Identity survives ownership change, representative change, subscription change. Trust history remains attached to the Vendor Profile, subject to Trust Freeze review. **Identity persists. Control may change.**

## Audit Requirement

All ownership changes generate: audit record (ADR-009) + domain event (ADR-014) + historical ownership entry.

**Principle:** One Vendor. One Owner. Many Representatives.

---

# ADR-006: Financial Tier Framework

**Status:** Approved (redefined by Amendments v0.3 + Redline v0.3.1)

> **Reclassification (Review item §B-1):** The original ADR-006 body described subscription packages (Basic / Starter / Growth / Enterprise). Per the v0.3 amendment **Financial Tier ≠ Subscription Tier**, that packaging content is governed under **ADR-011** (entitlements). ADR-006 is now exclusively the **vendor financial capability** ADR. The original packaging text is retained under ADR-011's review note for traceability; it is **superseded in meaning** here.

## Decision (Redline Amendment A)

Financial Tier represents the **maximum project value a vendor is expected to execute**.

- It is a **matching signal**.
- It is **not** a trust signal.
- It is **not** a subscription signal.

Capability ≠ Trust. Capability ≠ Subscription.

## Tier Structure (Redline Amendment B)

| Tier | Project Value (BDT) | Typical Vendor |
|---|---|---|
| A | 0 – 5 Lac | Retail supplier, small service provider, local workshop |
| B | 5 – 25 Lac | Importer, small contractor, industrial supplier |
| C | 25 Lac – 1 Crore | Engineering company, fabricator, medium manufacturer |
| D | 1 – 5 Crore | Large EPC, major manufacturer, industrial group |
| E | 5 Crore+ | Enterprise vendor, national supplier, large industrial contractor |

## Tier Assignment (Redline Amendment C)

- **Stage 1 (MVP):** vendor selects a **Declared Tier**.
- **Stage 2:** platform may issue a **Verified Tier** based on completed projects, supporting documents, business capacity, historical awards.
- Declared Tier may differ from Verified Tier.

## Tier ↔ Capacity (Redline Amendment D)

Tier = Claim. Capacity (ADR-004) = Evidence. Contradictions reduce matching confidence.

## RFQ Matching Rules (Redline Amendment E)

A vendor is eligible for an RFQ when the RFQ value falls within or below the vendor's tier ceiling. Example: an 18 Lac RFQ is eligible for Tiers B–E, not Tier A. Admin override permitted (audited).

## Separation Firewalls (Redline Amendments F, G)

- Financial Tier must **never** increase Trust Score directly. (Large ≠ trustworthy.)
- Financial Tier does **not** affect Performance Score. Performance derives only from response rate, delivery success, buyer feedback, award history.
- Capacity, Trust, Performance are separate dimensions. *(See §A matrix.)*

## Tier Lifecycle (Redline Amendments H, I, J, K)

- **Event:** `VendorTierChanged` (added to ADR-014 catalog). Triggers matching refresh, vendor re-ranking, audit entry.
- **History:** tier changes are versioned. Required fields: `effective_from`, `effective_to`, `change_reason`, `approved_by`. Vendor capability evolves; history survives.
- **Status values:** Declared · Pending Verification · Verified · Suspended · Expired.
- **Expiry review:** Verified tier reviewed periodically — recommended every 24 months.

## Matching Confidence (Redline Amendment L)

`Matching Confidence = Financial Tier + Capacity Profile + Performance Score + Trust Score`

No single governance signal may dominate matching decisions.

## Implementation Constraints

Financial Tier belongs to the Vendor Profile. Tier calculations must be auditable; tier history must be retained.

## Separation from Subscription Tier (Amendments v0.3)

Financial Tier (capability) and Subscription Tier (commercial package) are independent. Tier D vendor + Basic subscription = valid. Tier A vendor + Enterprise subscription = valid.

---

# ADR-007: Category Participation & RFQ Routing Eligibility

**Status:** Approved (amended v0.3; Redline v0.3.3)

## Decision

Vendor participation is controlled through category assignments. Only eligible vendors may receive RFQs from assigned categories.

## Category Model

- Vendor selects categories; platform may review and approve assignments.
- Levels: Primary · Secondary · Specialized.
- **Taxonomy governance (v0.3):** hierarchy limited to **4 levels maximum** (e.g., Mechanical → Pumps → Centrifugal Pumps → Food Grade Pumps).

## RFQ Distribution

RFQs distribute only to matching categories, verified vendors, eligible participants. Category misuse → warning, suspension, or category removal.

## New Vendor Exposure Policy (v0.3)

New vendors may participate via a **probation pool** to prevent cold-start invisibility. Reference routing split: 80% verified vendors / 20% probation vendors.

> **Review note (§B-6):** the 80/20 ratio is operating policy, not architecture. It is stored as Module 0 `system_configuration` and read by the routing engine.

## Redline v0.3.3 — Buyer-Defined Vendor Filters (Approved Vendor List, F044)

*Scope: adds a routing filter and a non-disclosure invariant. No new module. No new ownership class. Reuses Vendor CRM (Module 4) and RFQ Routing (Module 3).*

### Amendment A — Buyer-Defined Vendor Status

A buyer organization may assign a **private** relationship status to any vendor profile:

| Status | Meaning |
|---|---|
| Approved | Buyer-trusted. Eligible. May be preferred in buyer-scoped sorting. |
| Conditional | Eligible, with a buyer-private caveat note (e.g., "good price, slow delivery"). |
| Blacklisted | Excluded from this buyer's RFQs. Non-disclosing (Amendment C). |
| *(none)* | Neutral — default for all vendors. |

Ownership: **Business Operations Module → Vendor CRM (Pre-Award)** per ADR-017. Scope: **private**, buyer organization only (ADR-016). Keyed on `(buyer_org_id, vendor_profile_id, status)`.

**Buyer judgment is private intelligence. It is a lens, not a platform signal.**

### Amendment B — RFQ Routing Mode

Each RFQ selects one mode:

- **Approved Only** — route only to Approved vendors.
- **Approved + Conditional** — route to both.
- **Approved + Open Market** — Approved preferred, plus normal category matching.
- **Open Market (default)** — normal category matching, no buyer restriction.

**Invariant:** Blacklist is NOT a mode. Blacklisted vendors are excluded in **every** mode, including Open Market. Always. *Modes widen the pool; blacklist sets an absolute floor.*

### Amendment C — Non-Disclosure Invariant (hard security invariant)

A vendor must never be able to detect that a specific buyer has blacklisted them.

- Prohibited signals: no notification, no lead record, no analytics trace, no error message, no "not eligible" state.
- **Indistinguishability rule:** blacklist exclusion must be indistinguishable from ordinary non-match — silent absence.
- **Survives representation (ADR-005):** filter targets the Vendor Profile; no representative of an excluded profile is invited or signaled.
- **Survives probation pool:** blacklisted vendors never enter via the probation slot; buyer filter applies before probation injection.
- **Cross-tenant rule (ADR-016):** blacklist status never crosses the tenant boundary — not through routing, analytics, or inference.

### Amendment D — Routing Pipeline (Order of Operations)

1. **Buyer Filter** (mode + blacklist floor) — binary gate, FIRST
2. **Category Match** (ADR-007)
3. **Verification Eligibility + Probation Pool** (v0.3)
4. **Financial Tier Eligibility** (ADR-006 Redline)
5. **Matching Confidence** = Capacity + Performance + Trust (ADR-006 Redline, Amendment L)

The buyer filter is a binary gate, never a confidence input.

### Amendment E — Signal Firewall

Buyer filter operates in buyer scope only. It must never mutate platform-wide vendor scores (no Trust ± from buyer approval/blacklist). One buyer's preference is not platform-wide truth. Mirrors: Trust ≠ Tier ≠ Performance ≠ Buyer Judgment.

### Amendment F — Audit & Explainability

RFQ routing records the applied mode for award explainability (ADR-009): RFQ ID, routing mode, applied filter reference, timestamp. Audit of buyer filters is visible only to the buyer organization and platform compliance under policy. Blacklist entries are never surfaced in any vendor-facing audit view. **Decisions are explainable to the decider, not to the excluded.**

### Implementation Constraints

- RFQ Routing (Module 3) reads buyer status **through a CRM service** — no direct table access (ADR-017).
- Status changes generate audit records (ADR-009).
- Blacklist exclusion enforced **at routing** — never at presentation, never client-side.
- Empty/error states for excluded vendors must be indistinguishable from non-match.

### Feature Mapping

Resolves **F044 — Approved Vendor List**. Backlog (not architecture): F043 Clone RFQ, F045 Purchase History Intelligence, F047 RFQ Package Library.

**Principle:** Participation follows proven capability; private exclusion stays private, forever.

---

# ADR-008: Organization Workflow Settings

**Status:** Approved (amended v0.3)

## Decision

Organizations configure their own internal workflow settings, affecting approval processes and permissions.

## Workflow Areas

- **RFQ Approval:** No Approval · Single Approval · Multi-Step Approval
- **User Roles:** Owner · Admin · Manager · Member (role bundles per ADR-016)
- **Financial Permissions:** view billing, manage subscription, approve payments
- **Notification Rules:** email, SMS, platform notifications

## Amendment (v0.3) — Permission Slug Model

Authorization must use **permissions**, never role names.

Bad: `if (role == "Manager")` · Good: `can_approve_rfq`

**Roles are bundles. Permissions are authority.** *(Normative authorization model lives in ADR-016.)*

## Future Extensions

Department-based routing, budget approval chains, enterprise procurement policies.

**Principle:** Organizations control their own operating rules.

---

# ADR-009: Audit Trail & Compliance Policy

**Status:** Approved (amended v0.3)

## Decision

All business-critical actions generate **immutable** audit records. The audit trail is a platform-wide shared service (Module 0). **No module may bypass it.**

## Audit Coverage

- **RFQ:** created, edited, submitted, approved, rejected, closed, cancelled
- **Quotation:** created, edited, submitted, withdrawn, approved, rejected
- **Vendor:** created, claimed, verified, suspended, banned, tier changed, category changed
- **Organization:** created, role changed, ownership changed, subscription changed
- **Financial:** invoice created, payment status changed, refund issued, subscription renewed
- **Admin:** ban issued, verification approved/rejected, category approved/deleted

## Minimum Audit Fields

`audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent`

## Amendments (v0.3)

**Redaction Policy.** Audit records are permanent, but *record immutable ≠ field immutable*. Sensitive fields (e.g., IP address, user agent) may be redacted under approved privacy policy. Redaction must create a **new audit event** recording who redacted what and why. *(Reconciliation, Review item §B-3: "never delete" governs records; redaction governs fields and is itself audited.)*

**Actor Types.** Supported: User · Admin · System · **AI Agent**.

**Large Object Handling.** Audit records reference document versions (ADR-010); never store large blobs in audit tables.

## Retention

Never delete audit logs. Soft archive only.

**Principle:** Business actions may change. Audit history may not.

---

# ADR-010: Document Versioning & Specification Control

**Status:** Approved (amended v0.3)

## Decision

All controlled business documents support versioning. **No document is overwritten.** Every change creates a new revision.

## Version-Controlled Documents

- **Product Specifications:** URS, datasheet, technical specification, checklist, drawing
- **Procurement Documents:** RFQ, quotation, comparison statement, LOI, PO, work completion certificate
- **Company Documents:** trade license, ISO certificate, factory audit reports

## Rules

- **Never overwrite** — RFQ v1 → v2 → v3; never edit-in-place.
- **Active revision** — system always marks current vs previous versions.
- **Change notes** — every revision requires a revision reason (e.g., "material changed", "delivery date changed").
- **Relationships** — a quotation must record **which RFQ version** it was submitted against.

## Amendment (v0.3) — RFQ Version Immutability

Once any quotation is submitted against RFQ Version X, **RFQ Version X becomes immutable**. Changes create v2/v3/v4; existing versions are never modified.

## Future Benefit

Version history enables explainability (what changed, why a quotation was revised, who approved).

**Principle:** Documents evolve. History must survive.

---

# ADR-011: Subscription Entitlement Policy

**Status:** Approved (amended v0.3; absorbs subscription packaging from original ADR-006)

## Decision

Subscription plans control access through a **centralized entitlement system**. Features must never check plan names directly.

Bad: `if (plan == "Growth")` · Good: `can_receive_extra_rfqs`, `can_create_microsite`, `can_view_advanced_analytics`

Plan names change. Entitlements remain stable.

`Subscription Plan → Entitlements → Features`

## Amendments (v0.3)

**Entitlement Types.** Boolean (`can_create_microsite`) · Numeric (`monthly_rfq_limit`) · Enum (`support_level`).

**Usage Ledger.** Quota consumption is tracked separately from entitlement grants: RFQ usage, lead usage, advertisement credits. *(Consumption attribution: always the Controlling Organization — ADR-005 Redline Amendment C.)*

## Subscription Packaging (reclassified from original ADR-006 — Review item §B-1)

Indicative commercial packages (marketing configuration, expressed as entitlement bundles):

| Plan | Indicative Entitlements |
|---|---|
| Basic | Listing, limited visibility, basic search/chat, base RFQ limit |
| Starter | Basic + business profile, included leads, more categories, priority visibility |
| Growth | Starter + enhanced profile, more leads, priority placement, advanced analytics, lead boost |
| Enterprise | Growth + custom workflow, dedicated support, enterprise procurement tools (future expansion) |

Billing: monthly and annual; annual may include discounts. Future: premium advertising, enterprise procurement tools, sponsored placement.

**Subscription ownership:** Organizations only — never Users, never Vendor Profiles (ADR-015/016). Financial Tier is independent of Subscription Tier (ADR-006).

**Principle:** Plans are marketing. Entitlements are architecture.

---

# ADR-012: Soft Delete & Data Retention Policy

**Status:** Approved (amended v0.3)

## Decision

Business-critical records are never physically deleted. All deletions are **soft deletes**.

## Applies To

Organizations, users, vendor profiles, RFQs, quotations, documents, invoices, POs, payments, specifications.

## Minimum Fields

`deleted_at, deleted_by, delete_reason`

## User Experience

Delete means archived / hidden / inactive — not removed.

## Permanent Deletion (only)

Temporary uploads, unused draft files, expired system cache.

## Amendments (v0.3)

**Partial Unique Index Rule.** Soft-deleted records must not block reuse of unique values. Use partial unique indexes — engine-specific and must be explicitly stated. PostgreSQL: `UNIQUE ... WHERE deleted_at IS NULL`.

**Restore Policy.** Soft-deleted entities may be restored (vendor, user, RFQ, organization).

**Principle:** Business history survives. Visibility may change.

---

# ADR-013: Data Ownership & Privacy Policy

**Status:** Approved (amended v0.3)

## Decision

Ownership of platform data and business data are separate concepts.

| Class | Examples | Owner |
|---|---|---|
| **User-owned (organization-owned) data** | RFQs, quotations, private vendor notes, private ratings, uploaded specifications, generated documents, finance records | Creator Organization |
| **Platform-owned data** | Trust score, performance score, audit logs, matching scores, verification results, platform analytics | iVendorz |
| **Shared data** | Public vendor profile, public reviews, public categories | Platform + participating organizations |

## Privacy Rule

Private supplier intelligence — notes, personal ratings, negotiation history, internal remarks — must **never** be exposed publicly. Even after vendor linking. *(Extended by ADR-007 R3.3 non-disclosure invariant for blacklist status.)*

## Amendments (v0.3)

**Disclosure Rule.** Private RFQs remain private until distribution. After distribution, only invited vendors may access the RFQ.

**AI Data Usage Rule.** Allowed: anonymized aggregate analytics. Not allowed: training public AI models on private RFQ content.

**User Departure Rule.** When a user leaves an organization: business records remain; personal identity may be anonymized.

**Principle:** Users (organizations) own their business data. The platform owns platform intelligence.

---

# ADR-014: Domain Event Architecture

**Status:** Approved (amended v0.3; catalog extended by ADR-006 R, ADR-018, ADR-020)

## Decision

Every important business action emits a **domain event**. Domain Events are separate from Audit Logs.

- Audit answers: *what happened?*
- Events answer: *what should happen next?*

Example: RFQ Submitted → audit records "officer submitted RFQ"; event `RFQSubmitted` triggers matching, notifications, analytics, automation.

## Event Catalog (consolidated)

| Domain | Events |
|---|---|
| RFQ | RFQCreated, RFQSubmitted, RFQApproved, RFQClosedWon, RFQClosedLost |
| Vendor | VendorClaimed, VendorVerified, VendorSuspended, VendorBanned, **VendorTierChanged** *(ADR-006 R, Amendment H)* |
| Quotation | QuotationSubmitted, QuotationWithdrawn, QuotationSelected |
| Trust / Performance | TrustScoreUpdated, PerformanceScoreUpdated, **PerformanceReviewTriggered**, **PerformanceFrozen** *(ADR-018)* |
| Subscription | SubscriptionPurchased, SubscriptionRenewed, SubscriptionExpired |
| Profile Experience | **ProfileThemeChanged, ProfileLayoutChanged, ProfilePublished, ProfileUnpublished, MicrositePublished, MicrositeDomainChanged** *(ADR-020)* |

## Event Consumers

Notifications, analytics, matching engine, trust engine, automation engine, future AI layer.

## Amendments (v0.3)

**Transactional Outbox Pattern.** Business record + outbox event written in the **same transaction**, then commit. (Outbox owned by Module 0, ADR-017 R Amendment A.)

**Event Versioning.** Every event includes `event_name` + `event_version`.

**Idempotent Consumers.** Consumers must tolerate duplicate delivery.

**Event Payload Rule.** Events carry IDs + minimal metadata; consumers fetch details from owning modules.

**Principle:** Business actions create events. Events drive automation.

---

# ADR-015: Identity & Organization Model

**Status:** Approved (amended Redline v0.3.1)

## Decision

iVendorz is **organization-centric**. Users act through Organizations. Most business records belong to Organizations, not individual users.

`User → Membership → Organization`

A user may belong to multiple organizations; an organization may have multiple users. The user switches active organization; all actions execute under the current organization context.

## Ownership Split

| Entity | Owns |
|---|---|
| **User** (a person) | Login identity, password, 2FA, personal preferences, notification settings |
| **Organization** (a business) | RFQs, quotations, vendor profile, documents, subscription, private vendor list, finance records, ratings given |
| **Membership** (the link) | Role, permissions, department, status, joined_at |

## Organization Types

Organizations are not split into buyer vs vendor companies. One organization may be **Buyer**, **Vendor**, or **Hybrid** (buy + sell) simultaneously — very common in Bangladesh. Organization Role ≠ Organization Type.

## Record Ownership Rules

- **Subscription:** belongs to the Organization, never a User. If a user leaves, subscription remains.
- **RFQ:** owned by the Organization; track separately RFQ owner org, creator user, approver user.
- **Quotation:** belongs to the Vendor Organization; track submitting user.
- **Vendor Profile:** exactly one Controlling Organization (ADR-005); representatives allowed; ownership transfer must be approval-based, audited, versioned.
- **Buyer private vendor records:** remain private to the buyer organization forever, even when linked to public vendor records.
- **Data access:** determined by Organization + Permission — never by user alone.

## Redline v0.3.1 Amendments

**A — Mandatory Organization Rule.** Every user must belong to ≥1 organization. Orphan users are not allowed. **Solo Trader Rule:** signup without an organization auto-creates a Personal Organization (e.g., "Musa Trading"). Avoids special cases, dual identity models, user-owned records. *Every action occurs within an organization.*

**B — Membership Lifecycle.** Membership is a first-class entity. States: Invited (no access) → Pending (accepted, verification incomplete) → Active (full access per permissions) → Suspended (access blocked, history retained) → Removed (ended, audit retained). Memberships evolve; history survives.

**C — Last Owner Protection.** An organization must always have at least one active owner. Before owner removal: transfer ownership or assign a new owner. Organizations must never become ownerless.

**D — Ownership Succession.** If an owner account becomes disabled/deleted/suspended, ownership must be reassigned. Allowed methods: manual transfer, admin recovery, legal recovery process. Recovery actions require audit record, reason code, approver identity. Prevents abandoned organizations.

**E — Organization Verification.** Separate from Vendor Verification. Checks: trade license, BIN, TIN, business information. Types: Unverified · Verified · Enhanced Verified. Applies to buyer, vendor, and hybrid organizations. *Organizations are verified; vendor capabilities are verified separately.*

**F — Organization ↔ Vendor Profile Cardinality.** **MVP constraint: one organization = maximum one Vendor Profile** (organization may exist without one). Multiple vendor profiles per organization (e.g., ABC Group → ABC Pumps / ABC Boilers / ABC EPC) is **future expansion, not MVP**. Optimize for simplicity first.

**G — Buyer Profile.** Optional, organization-owned. Contains procurement preferences, industry, factory information, delivery locations, approval settings. Purpose: enhance matching and procurement workflows.

**Principle:** Users act. Organizations own.

---

# ADR-016: Multi-Tenancy & Authorization Strategy

**Status:** Approved

## Decision

iVendorz is multi-tenant. **Organizations are the tenant boundary.** Data is isolated by organization unless explicitly designed as shared or public.

## Isolation Principle

Default rule: **private**. Everything is private unless declared otherwise.

## Visibility Scopes

| Scope | Visible To | Examples |
|---|---|---|
| Private | Owner organization only | RFQ drafts, private vendor notes, internal ratings, finance records, approval history |
| Shared | Specific organizations | RFQ sent to vendors, submitted quotations, RFQ clarification threads |
| Public | Everyone | Vendor profiles, product listings, microsites, public reviews, categories |

## Authorization Model

Permission-based, never role-name-based.

**Three layers — all must be satisfied:**

1. **Organization Membership** — no membership, no access.
2. **Permission Slugs** — e.g., `can_create_rfq`, `can_approve_rfq`, `can_submit_quote`, `can_manage_users`, `can_manage_billing`.
3. **Resource Ownership / Scope** — `can_view_rfq` ≠ `can_view_all_rfqs`; organization access must also hold.

`Membership + Permission + Resource Scope = Access`

## Role Bundles (convenience only)

Owner (all permissions) · Director (RFQ approval, financial approval, user management) · Manager (RFQ + vendor management) · Officer (RFQ creation, quotation management). **Roles are bundles. Permissions are authority.**

## Platform Roles (separate from organization roles)

- **Support Admin** — assist users, view tickets; cannot view private RFQs.
- **Verification Admin** — review documents, verify vendors; cannot read finance records.
- **Super Admin** — emergency access to all data; every action audited, logged, flagged.

## Row-Level Security Strategy

Every tenant-owned record carries `organization_id` (rfqs, quotations, finance_records, private_vendors, …). Access rule: `organization_id = current organization`.

## Cross-Tenant Rules

- Shared resources cross tenants only by design (e.g., RFQ distribution: vendor sees only routed RFQs, never all RFQs).
- Cross-tenant communication only through controlled channels: RFQ invitations, quotation submission, clarifications, chat. Never direct database access.
- **Data leakage rule:** no module may expose private notes, admin ratings, internal scores, or finance data across tenant boundaries. *(Hardened by ADR-007 R3.3 blacklist non-disclosure.)*

## Subscription Isolation

Subscription belongs to the Organization — never User, never Vendor Profile (unless specifically purchased as a vendor product).

## AI Access Rule

Future AI services (matching, comparison, recommendation) may read **only data the requesting organization already has access to**. AI never bypasses permissions.

## Scalability

Current: single multi-tenant database. Future: sharding possible without redesign because the tenant boundary already exists.

**Principle:** Tenant isolation is mandatory. Cross-tenant access must be explicit, controlled and auditable.

---

# ADR-017: Module Boundaries & Bounded Contexts

**Status:** Approved (amended Redline v0.3.1)

## Decision

iVendorz is a **Modular Monolith**. Each module owns its data, business rules, services, and events. No module may directly access another module's tables; communication only through **Services, Events, Public Contracts**.

## System Context Map

```
Module 0  Platform Core / Shared Kernel        (Redline Amendment A)
Module 1  Identity & Organization
Module 2  Marketplace & Discovery
Module 3  RFQ Procurement Engine  (Core Moat)
Module 4  Business Operations Engine
Module 5  Trust & Verification
Module 6  Communication
Module 7  Monetization
Module 8  Admin Operations
Module 9  AI Layer
```

## Module 0 — Platform Core / Shared Kernel *(Redline Amendment A)*

- **Owns:** `audit_records`, `outbox_events`, `id_generation`, `system_configuration`, `feature_flags`.
- **Responsible for:** cross-cutting infrastructure, system governance, event delivery, audit integrity.
- **Rule:** Shared Kernel = **infrastructure only**. Never move RFQ, Vendor, Trust, or Billing logic into it.

## Module 1 — Identity & Organization

- **Owns:** users, organizations, memberships, roles, permissions. *(Nobody else may own these.)*
- **Responsible for:** authentication, authorization, membership management, organization switching.
- **Public services:** Get User, Get Organization, Check Permission, Get Membership.

## Module 2 — Marketplace & Discovery

Subdomains: Vendor Directory · Microsite Engine · **Profile Experience Engine** (ADR-020).

- **Owns:** vendor profiles, microsites, products, projects, categories, advertisements, favorites; presentation data (themes, layouts, section config, brand settings, SEO settings).
- **Responsible for:** vendor discovery, SEO, directory, product browsing.
- **Public services:** Get Vendor Profile, Search Vendors, Get Categories.
- **Does NOT own:** RFQs, quotations, subscriptions, trust scores. May **read** Trust Score; may **not calculate** it.

## Module 3 — RFQ Procurement Engine (Core Moat)

- **Owns:** rfqs, RFQ routing, matching, sorting, vendor invitations, quotations, comparison statements, routing_rules. *(Nobody else may own rfqs / quotations / routing_rules.)*
- **Responsible for:** buyer → vendor procurement flow.
- **Public services:** Create RFQ, Submit Quote, Get Comparison, Route RFQ.
- Reads buyer-defined vendor status from Module 4 via CRM service only (ADR-007 R3.3).

## Module 4 — Business Operations Engine

- **Owns:** PO, LOI, challan, **trade_invoices** *(Redline Amendment B)*, payment records, finance records, generated documents, **Vendor CRM**.
- **Vendor CRM scope (Redline Amendment F):** CRM starts **before** purchase.
  - *Pre-Award:* private vendor notes, private ratings, favorites, vendor evaluation, buyer-defined vendor status (ADR-007 R3.3).
  - *Post-Award:* performance history, project records, relationship tracking.
- **Starts only after** RFQ Closed Won — for post-award operations.

## Module 5 — Trust & Verification

- **Owns:** trust scores, performance scores, `verification_records` *(only — Redline Amendment E)*, audit results, fraud signals.
- **Responsible for:** vendor trust, verification, risk assessment.
- **Rule (Amendment E):** Admin Operations may approve/reject/review verification requests but **never owns** `verification_records`. *Admin decides; Trust Module stores.*

## Module 6 — Communication

- **Owns:** chat, RFQ threads, notifications, emails, SMS logs, WhatsApp logs.
- **Rule:** RFQ Module creates the RFQ; Communication Module sends the notification. Separation required.

## Module 7 — Monetization

- **Owns:** plans, subscriptions, entitlements, usage quotas, lead credits, **platform_invoices** *(Redline Amendment B)*.
- **Responsible for:** billing, access limits, plan enforcement.
- **Rule:** Vendor module can query entitlements; cannot modify subscriptions.

### Invoice Ownership Fix *(Redline Amendment B — resolves One-Module-One-Owner collision)*

| Table | Owner | Meaning |
|---|---|---|
| `trade_invoices` | Module 4 | Vendor / buyer / project / delivery invoices (commerce between parties) |
| `platform_invoices` | Module 7 | Subscription / lead purchase / advertisement invoices (fees owed to iVendorz, per ADR-002) |

**Trade Invoice ≠ Platform Invoice.**

## Module 8 — Admin Operations

- **Owns:** moderation, ban actions, category approval, vendor approval (workflow), system configuration policy.
- **Responsible for:** platform governance.

## Module 9 — AI Layer *(Redline Amendment C — normative wording)*

AI owns **no authoritative business records**.

- **May own:** `recommendations`, `predictions`, `classification_results`, `similar_vendor_results` — provided they are regenerable, derived, non-authoritative. AI artifacts are cacheable and disposable.
- **May never own:** RFQ, Vendor Profile, Quotation, Trust Score, Subscription.
- **Consumes** RFQs, specifications, vendor data, categories — through APIs only.
- **Produces** recommendations, predictions, suggestions — never source-of-truth records.
- **AI suggests. Business modules decide.** Business decisions remain human- or workflow-approved.

## Cross-Module Communication Rules

1. **No direct table access.** Bad: RFQ Module → `UPDATE vendor_profiles`. Good: RFQ Module → Vendor Service.
2. **Events for async work** (ADR-014). Example: `RFQSubmitted` triggers matching, notifications, analytics.
3. **Ownership is singular.** Every table has exactly one owner module.

## Boundary Enforcement *(Redline Amendment D)*

- **Database:** one dedicated PostgreSQL schema per module — `core.*, identity.*, marketplace.*, rfq.*, operations.*, trust.*, communication.*, billing.*, admin.*`.
- **No foreign keys across module boundaries.** Cross-module references use IDs only; ownership remains independent.
- **Application layer:** each module exposes only Commands, Queries, Events.
- **Repository rule:** cross-module repository imports prohibited (e.g., rfq module cannot import billing internals).
- **CI rule:** build fails on module-ownership violation, cross-module dependency violation, restricted imports.
- **AI Agent rule:** generated code must respect module boundaries; agents may generate code only inside the owning module, must not read other modules' tables, modify other modules' entities, or bypass public contracts. Violations rejected at review.

## Future Extraction Rule

Extract services only when justified by load. Candidates: RFQ Engine, Search Engine, Notification Engine. **Not** Users / Categories / Products services — too early.

**Principles:** One Module, One Owner, One Responsibility. A module may expose capabilities; a module may never surrender ownership. Data, business, and module ownership must always align.

---

# ADR-018: Performance Score Framework

**Status:** Approved (Amendments A–C included)

## Decision

Every Vendor Profile has a **Performance Score**, separate from Trust Score, Financial Tier, Subscription Tier, and Verification Status.

A vendor may be verified but slow; large but unreliable; trusted but inactive. Performance measures **actual operational behavior**.

## Score Range & Levels

0–100. Levels: Excellent 90–100 · Strong 75–89 · Average 60–74 · Weak 40–59 · Poor 0–39.

## Components (weights sum to 100%)

| Component | Weight | Measures |
|---|---|---|
| RFQ Response Rate | 25% | RFQs received vs responded |
| Delivery Performance | 25% | On-time delivery, project completion, missed commitments |
| Quote Quality | 15% | Complete submission, required documents, spec compliance |
| Buyer Feedback | 15% | Post-award reviews, completion ratings |
| Win Rate | 10% | Quotes submitted vs awarded |
| Dispute Record | 10% (negative) | Complaints, disputes, verified issues |

## New Vendor Policy

New vendors start as **Not Rated** — not 100, not 0. No history exists.

**Amendment A — Minimum Data Threshold.** Score is not calculated until a minimum activity threshold is reached (e.g., 5 RFQs responded **or** 2 completed projects).

## Recency Principle

Recent performance matters more than old performance. Historical performance decays in weight over time.

## Relationships

- **Trust:** performance contributes to trust, but Performance Score ≠ Trust Score. (Excellent performance with expired verification is possible.)
- **Tier:** performance does not affect Financial Tier. (Tier E with poor performance is possible.)

## Visibility

- **Public:** performance badge / level.
- **Vendor:** detailed breakdown.
- **Admin:** full calculation.

## Manual Intervention & Freeze

Admins may freeze, review, recalculate — all actions require an audit record.

**Amendment C — Performance Freeze Workflow:**

`Performance Review Triggered → Performance Frozen → Compliance Review → Performance Reactivated`

During freeze: public badge hidden, ranking impact disabled, manual review required.

**Amendment B — Score Versioning.** Required fields: `performance_formula_version`, `performance_score_updated_at`. Algorithms evolve; historical scores must remain explainable.

## Events & Ownership

Events (ADR-014): `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen`. Owned by **Trust & Verification Module** (ADR-017). Performance changes generate audit entry + domain event.

**Principle:** Trust measures confidence. Performance measures execution.

---

# ADR-019: (Reserved)

**Status:** Not present in corpus — number reserved.

> **Review item §B-9:** ADR-019 does not exist in the frozen corpus. The number is reserved to preserve sequencing integrity. Confirm before v0.4 whether it was intentionally skipped or remains unpublished. **Do not backfill content against this number without an Architecture Review Board decision.**

---

# ADR-020: Vendor Experience & Profile Presentation Layer

**Status:** Approved

## Decision

iVendorz provides a configurable **Vendor Experience Layer**: organizations control presentation, branding, structure and visual appearance of their public vendor profile, landing page and microsite.

**Core principle: Content ≠ Presentation.** Business data remains stable; the same data may render through multiple themes, layouts, templates. Changing a template must never require changing business data.

## Ownership

Per ADR-017: **Marketplace & Discovery Module → Profile Experience Engine** subdomain.

## Components

1. **Theme System** — typography, palette, buttons, cards, spacing, visual style. Example themes: Industrial, Corporate, Engineering, Modern, Minimal.
2. **Layout Templates** — predefined structures: A Directory Style · B Engineering Company · C Manufacturer · D Service Company · E Corporate Microsite (each defines hero/sections/contact order).
3. **Dynamic Section Builder** — enable/disable sections: About, Products, Services, Projects, Certificates, Clients, Team, Factory Photos, Videos, Downloads, Contact, Custom.
4. **Profile Content Blocks** — presentation data stored separately from business entities. Suggested structure: `profile_sections(section_type, display_order, is_visible, content_json)`.
5. **Branding Assets** — logo, cover banner, brand/secondary colors, company video, brochure PDF, gallery.
6. **SEO Management** — SEO title, meta description, keywords, OG image, canonical URL, schema metadata.
7. **Custom Domain Support** — `vendor.ivendorz.com`, `company.com`, `suppliers.company.com` — for eligible subscriptions.

## Subscription Integration *(restated as entitlements per ADR-011 — Review item §B-5)*

Feature gating uses entitlement slugs, never plan names:

| Entitlement (illustrative) | Type | Basic | Starter | Growth | Enterprise |
|---|---|---|---|---|---|
| `template_access_level` | Enum | fixed_1 | standard_5 | all | custom |
| `can_customize_colors` | Boolean | ✗ | ✓ | ✓ | ✓ |
| `can_use_section_builder` | Boolean | ✗ | ✗ | ✓ | ✓ |
| `seo_level` | Enum | none | basic | advanced | advanced |
| `can_use_custom_domain` | Boolean | ✗ | ✗ | ✓ | ✓ |
| `can_use_custom_theme` / multi-language | Boolean | ✗ | ✗ | ✗ | ✓ |

The plan→entitlement mapping above is marketing configuration; the architecture binds only to the slugs.

## Data Ownership Split

- **Business data** (source of truth): vendor profile, products, projects, certificates, documents.
- **Presentation data** (Profile Experience Engine): themes, layouts, section configuration, brand settings, SEO settings.

## Visibility & Audit

- Public profile visible to everyone; draft changes visible only to the organization.
- Configuration changes generate audit records: actor, timestamp, previous configuration, new configuration (ADR-009).

## Events (added to ADR-014)

`ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`.

## Future Expansion

Page builder, landing/campaign pages, multi-language profiles, industry templates, AI-generated company pages.

**Principles:** One Vendor Profile, multiple presentation possibilities. Business data is the source of truth; presentation is a configurable experience.

---

# §C — Amendment Traceability Matrix

| Source Document | Target ADR | Content | Status |
|---|---|---|---|
| ADR-005 v1 | ADR-005 | Original vendor linking model | **Superseded** by ADR-005 Revised |
| ADR Amendments v0.3 | ADR-003 | Trust versioning, freeze, signal classification | Approved, integrated |
| ADR Amendments v0.3 | ADR-006 | Financial vs Subscription Tier separation | Approved, integrated |
| ADR Amendments v0.3 | ADR-007 | Taxonomy ≤4 levels; probation pool | Approved, integrated |
| ADR Amendments v0.3 | ADR-008 | Permission slug model | Approved, integrated |
| ADR Amendments v0.3 | ADR-009 | Redaction, actor types, large objects | Approved, integrated |
| ADR Amendments v0.3 | ADR-010 | RFQ version immutability | Approved, integrated |
| ADR Amendments v0.3 | ADR-011 | Typed entitlements, usage ledger | Approved, integrated |
| ADR Amendments v0.3 | ADR-012 | Partial unique index, restore policy | Approved, integrated |
| ADR Amendments v0.3 | ADR-013 | Disclosure, AI usage, user departure | Approved, integrated |
| ADR Amendments v0.3 | ADR-014 | Outbox, event versioning, idempotency, thin payloads | Approved, integrated |
| Redline v0.3.1 | ADR-005 | Amendments A–F (trust protection, quotation rule, quota attribution, history, scope, invariant) | Approved, integrated |
| Redline v0.3.1 | ADR-006 | Amendments A–L (tier definition, structure, lifecycle, firewalls, matching confidence) | Approved, integrated |
| Redline v0.3.1 | ADR-015 | Amendments A–G (mandatory org, membership lifecycle, owner protection, succession, verification, cardinality, buyer profile) | Approved, integrated |
| Redline v0.3.1 | ADR-017 | Amendments A–F (Module 0, invoice split, AI ownership, enforcement, verification ownership, CRM scope) | Approved, integrated |
| ADR-018 Amendments A–C | ADR-018 | Data threshold, versioning, freeze workflow | Approved, integrated |
| Redline v0.3.3 | ADR-007 | Amendments A–F (buyer vendor filters, routing modes, non-disclosure, pipeline, firewall, audit) | Approved, integrated (F044) |
| Original ADR-006 body | ADR-011 | Basic/Starter/Growth/Enterprise packaging | **Reclassified** (§B-1) |

---

# §D — Consolidated Impact Appendix (Doc-2/3/4/5 Hand-off)

| ADR | Schema Impact | Permission Impact | Workflow Impact | Matching Impact |
|---|---|---|---|---|
| 003 | trust score table + `trust_formula_version`, `trust_score_updated_at`, freeze state | admins: data correction only, never value edit | freeze/reactivation workflow | trust = matching-confidence input only |
| 005 | controlling_org FK, representative grants, ownership_history (`valid_from/to, transfer_reason, approved_by`) | delegated representative slugs | transfer approval + trust-protection workflow | quota & quotation uniqueness per vendor profile |
| 006 | tier field + status enum + tier_history | admin override audited | declared→verified→review(24mo) lifecycle | tier eligibility gate (pipeline step 4) |
| 007 (+R3.3) | buyer_vendor_status `(buyer_org_id, vendor_profile_id, status)` in operations schema; routing-mode column on RFQ | CRM write perms buyer-side only; cross-module read via service | routing mode selection on RFQ creation | 5-step pipeline; blacklist = pre-everything binary gate |
| 009 | core.audit_records, redaction events | compliance-scoped redaction permission | redaction approval flow | — |
| 010 | revision tables, active-version markers, quotation→rfq_version FK-by-id | — | revision-reason required | quotes bind to RFQ version |
| 011 | plans, entitlements (bool/num/enum), usage_ledger | `can_*` slugs everywhere; no plan-name checks | quota consumption on owner org | entitlements may gate visibility/placement |
| 012 | `deleted_at/by/reason` everywhere; partial unique indexes (`WHERE deleted_at IS NULL`) | restore permissions | restore workflow | soft-deleted excluded from routing |
| 014 | core.outbox_events; `event_name`, `event_version` | — | outbox in same transaction; idempotent consumers | events trigger matching refresh |
| 015 | memberships (state machine), personal-org auto-create, buyer_profiles | membership state gates access; last-owner guard | invite→active lifecycle; succession recovery | buyer profile feeds matching |
| 016 | `organization_id` on all tenant tables; RLS policies | 3-layer check (membership+slug+scope) | platform-role separation | vendor sees routed RFQs only |
| 017 | one PG schema per module; no cross-module FKs | module-scoped service contracts | CI boundary enforcement | RFQ↔CRM via service only |
| 018 | performance fields + formula version + freeze state; not-rated default | admin freeze/recalc audited | freeze workflow; min-data threshold | performance = confidence input (step 5) |
| 020 | marketplace.profile_sections, themes, branding, seo, domains | entitlement-gated features | draft→publish; domain change events | presentation never affects matching |

---

# §E — Open Items (for v0.4 / Doc-5 Roadmap)

1. **ADR-019** — confirm skipped vs unpublished.
2. **Search ADR** — Meilisearch adoption (indexing ownership, tenant filtering, sync via events) needs its own ADR before implementation.
3. **RFQ lifecycle state machine** — events and audit coverage imply states (Draft, Submitted, Approved, Closed Won/Lost, Cancelled); the formal state machine belongs to Doc-3 and should be ratified as an ADR appendix.
4. **Currency standard** — BDT is assumed throughout (tiers, transaction intelligence). Capture currency/locale handling explicitly before multi-currency pressure arrives.
5. **Notification policy matrix** (ADR-008) — deferred detail; Communication module contract needed for Doc-4.
6. **Probation pool parameters** — ratio and eligibility windows live in `core.system_configuration`; defaults to be ratified.

---

*End of ADR Compendium v1 — corpus v0.3.3, FROZEN (amended).*
