# iVendorz — Master System Architecture v1.0 FINAL

| Field | Value |
|---|---|
| Document | Master System Architecture |
| Version | 1.0 FINAL |
| Status | **CANONICAL — Single Source of Truth** |
| Date | 2026-06-12 |
| Supersedes | Master System Architecture Draft v0.1; ADR Compendium v1 (for reading purposes); Architecture Closure Package v0.3.2 (for reading purposes) |
| Audience | Founders · Business Analysts · System Analysts · Solution Architects · Developers · AI Coding Agents (Claude Code, Cursor) · Future CTOs |

**How to use this document.** This is the single source of truth for what iVendorz is, how it is organized, and the rules that must never be broken. Every schema, every API, every screen, and every generated module must conform to it. All architecture decisions recorded here are final and frozen; the Architecture Decision Index (Section 24) maps each rule back to its originating decision record for traceability. AI build agents must treat Sections 4 (Core Invariants), 16 (Module Boundaries), and 22 (Security & Governance Rules) as hard constraints: if a requested feature appears to conflict with this document, the agent must stop and flag the conflict rather than work around it.

---

## 1. Executive Summary

**iVendorz is the Industrial Procurement Operating System for Bangladesh** — a multi-tenant SaaS platform that combines an industrial marketplace, a structured RFQ procurement workflow, ERP-lite business operations, and a professional vendor network on a single, shared foundation.

The platform is built around one central object — the **RFQ (Request for Quotation)** — and one central actor — the **Organization**. Buyers discover vendors through a public, SEO-driven directory; they procure through a governed RFQ → quotation → comparison → award workflow; they then run the resulting commercial paperwork (LOI, PO, challan, trade invoice, payment record, work completion certificate) through the platform's Business Operations Engine. Vendors build a verified professional identity, receive matched RFQs sized to their real capability, and manage their pipeline through a built-in CRM.

### 1.1 The Operating Model: Three Engines on Shared Infrastructure

Every feature in the product belongs to exactly one engine or one shared service. If a feature cannot be placed, it does not belong in the product.

```
┌────────────────────────────────────────────────────────────────────┐
│                            iVendorz                                │
│                                                                    │
│   ENGINE 1                ENGINE 2                ENGINE 3         │
│   Marketplace &           RFQ Procurement         Business         │
│   Discovery               Engine                  Operations       │
│   "find / be found"       "the moat"              Engine           │
│                                                   "the stickiness" │
│ ────────────────────────────────────────────────────────────────  │
│   SHARED INFRASTRUCTURE                                            │
│   Platform Core (Shared Kernel) · Identity & Organization ·       │
│   Trust & Verification · Communication · Monetization ·           │
│   Admin Operations · AI Layer                                     │
└────────────────────────────────────────────────────────────────────┘
```

- **Engine 1 — Marketplace & Discovery** gets users in. SEO pages, the four-level category directory, vendor profiles, product listings, microsites, and advertising form the acquisition surface.
- **Engine 2 — RFQ Procurement Engine** is the reason to stay and the thing competitors cannot copy. RFQ lifecycle control, capability-aware matching, governed routing, throttling, and quotation comparison are where the defensible data accumulates.
- **Engine 3 — Business Operations Engine** makes leaving expensive. Once a buyer runs challans, trade invoices, POs, finance records, and vendor relationship history through iVendorz, the switching cost is real. The engine spans documents, finance, vendor CRM, and operational analytics.

### 1.2 Architecture Style

iVendorz is a **serverless Modular Monolith** built on Domain-Driven Design. It is one deployable Next.js application, internally divided into ten strictly bounded modules (Module 0 through Module 9 — Section 16). Each module owns its data, business rules, services, and events. No module may touch another module's tables; cross-module communication happens only through services, events, and public contracts. Services are extracted into independent deployables only when load demonstrably justifies it.

The platform is **multi-tenant**: the Organization is the tenant boundary, all data is private by default, and cross-tenant visibility exists only through explicit, controlled, auditable channels.

The platform is **organization-centric**: users act, organizations own. Every user belongs to at least one organization, every business record belongs to an organization, and every action executes within an active organization context.

### 1.3 Technology Stack

The stack optimizes for TypeScript end-to-end, fewest moving parts, managed infrastructure over self-hosted, and serverless over servers. The combination is deliberately well-documented and AI-agent-friendly.

| Concern | Choice | Role |
|---|---|---|
| Frontend | Next.js (App Router) + React + Tailwind + shadcn/ui | SSR/SSG for SEO; one stack for public site and applications |
| Backend | Next.js route handlers + server actions (TypeScript) | Same codebase as frontend; logic organized into module folders by bounded context |
| Database | Supabase (PostgreSQL) | System of record; one PostgreSQL schema per module |
| ORM | Prisma | The data model schema is the single source of data truth that agents read before generating code |
| Auth | Supabase Auth | Authentication only (login, sessions, email/phone OTP). Authorization lives in the application layer |
| Storage | Supabase Storage | Files, images, generated documents |
| Realtime | Supabase Realtime | In-platform chat and live notifications |
| Async jobs | Inngest | Matching, routing, notifications, document generation, imports — all background work |
| Hosting | Vercel | Hosts the entire application; single deploy |
| Email | Resend | Transactional email (RFQ alerts, invitations, verification) |
| Analytics | PostHog | Product analytics and funnels (acquisition → RFQ → quotation → won) |
| Search | PostgreSQL full-text (current); Meilisearch (future expansion) | Postgres full-text covers current scale; Meilisearch adoption requires its own decision record covering indexing ownership, tenant filtering, and event-driven sync before implementation |
| AI | Claude + OpenAI APIs (future activation) | RFQ structuring, matching assist, quote comparison — activates once RFQ volume exists |

Row-Level Security in Supabase is a defense-in-depth backstop, not the authorization model. Authorization is enforced in the application layer (Section 13).

### 1.4 Money Flow Position

iVendorz processes **only its own revenue** — subscriptions, lead packages, advertising, microsite fees, sponsored placements, and platform service fees — collected as an ordinary merchant through Bangladeshi payment gateways (SSLCOMMERZ, bKash Merchant, Nagad Merchant, bank transfer). The platform provides no escrow, no wallets, no custody, no trade settlement. Buyer-to-vendor payments occur outside the platform. Escrow is deferred, not rejected: the schema continuously captures commercial transaction intelligence (RFQ estimated value, quotation value, awarded value, currency, payment and delivery terms) so that a future financial-services layer can be added as new modules without redesigning the core marketplace. The platform currency is **BDT**; all tier bands and value fields are denominated in BDT, with the currency captured explicitly on every value field so multi-currency support can be introduced without schema redesign.

### 1.5 The Governance Signal Matrix

The platform evaluates vendors along four **independent** platform-wide dimensions plus one buyer-private lens. This separation is a cross-cutting invariant that recurs throughout this document:

| Signal | Question Answered | Owner Module | Scope |
|---|---|---|---|
| Trust Score | Can they be trusted? | Trust & Verification | Platform-wide |
| Capacity Profile | Can they execute the work? | Marketplace (data) / Trust (verification) | Platform-wide |
| Financial Tier | What project size should they receive? | Trust & Verification (verified state); Vendor Profile attribute | Platform-wide |
| Performance Score | How well do they actually perform? | Trust & Verification | Platform-wide |
| Buyer Vendor Status | Does *this buyer* want them? | Business Operations (Vendor CRM) | Private to one buyer |

**Firewall rules (binding, everywhere):** Financial Tier never increases Trust Score. Financial Tier never affects Performance Score. Buyer Approved/Blacklisted status never mutates platform-wide scores. Secondary trust signals never dominate trust calculation. No single governance signal may dominate matching decisions.

---

## 2. Product Positioning

### 2.1 Composition

iVendorz is not a clone of any single platform. Its composition is:

```
40%  Industrial Marketplace        (discovery, vendor profiles, microsites, directory)
30%  Procurement Platform          (RFQ → quotation → comparison → award workflow)
20%  ERP-Lite Operations           (challan, trade invoice, PO, finance records, documents)
10%  Professional Vendor Network   (vendor identity, trust, reputation, performance)
```

The marketplace is the acquisition surface; the procurement workflow is the product; the operations layer is the retention mechanism; the vendor network is the trust fabric that makes the other three credible.

### 2.2 What iVendorz Is Not (Scope Guardrails)

**Not an escrow or transaction platform.** The platform never holds buyer↔vendor deal money, never runs trade assurance, and never takes a cut of deal value. Deals close off-platform or through the document workflow of the Business Operations Engine. The only money the platform processes is its own revenue (Section 1.4 and Section 20). Because the platform never custodies third-party funds, it carries none of the regulated-escrow or dispute-mediation burden.

**Not a generic e-commerce store.** There is no cart, no checkout of goods, no consumer SKUs. The unit of work is an RFQ, not an order.

**Not a plain directory.** The directory is a side effect; the governed procurement workflow is the product.

### 2.3 In Scope / Out of Scope (Money)

| In scope (current) | Out of scope (current; future financial-services layer) |
|---|---|
| Subscription payment collection | Escrow accounts and ledger |
| Plan purchases, lead packages | Buyer/vendor wallets |
| Advertising purchases | Trade settlement, fund custody |
| Platform service fees | Payment protection, milestone-based release |
| Platform invoice generation, payment status tracking, revenue reporting | Dispute engine, fund release workflows |

**Guiding principle:** iVendorz manages procurement workflows today and preserves the option to manage procurement payments tomorrow.

### 2.4 Who the Platform Serves

- **Buyers** — factories, industrial plants, EPC contractors, and procurement teams in Bangladesh. They get structured sourcing (RFQ instead of phone calls), a comparison discipline, internal approval workflow that mirrors how factories actually authorize spending, and a private system of record for their supplier base.
- **Vendors** — suppliers, importers, manufacturers, fabricators, service providers, consultants, and engineering firms. They get a verified professional identity, matched leads sized to their real capability and geography, a pipeline CRM, and branded documents.
- **Hybrid organizations** — companies that buy and sell, supported natively because participation is profile-based, not type-based.
- **The platform operator** — admin operations, verification, moderation, monetization, and analytics tooling to run the marketplace; revenue from subscriptions and services, never from deal cuts.

### 2.5 Strategic Defensibility

The moat is the RFQ control plane: routing, throttling, sorting, and scoring of leads, governed by four independent vendor signals and one buyer-private lens. Each completed RFQ cycle deepens the platform's matching intelligence — data no competitor can replicate by copying screens. The Business Operations Engine then converts that workflow into retention: procurement records, documents, finance history, and vendor relationship intelligence accumulate inside the buyer's tenant and make migration costly.

---

## 3. Business Domains

The platform decomposes into ten bounded contexts. This is the complete domain map; the ownership and boundary rules for each appear in Section 16.

| Module | Domain | Engine / Layer | Core Responsibility |
|---|---|---|---|
| 0 | Platform Core / Shared Kernel | Shared infrastructure | Audit records, outbox events, ID generation, system configuration, feature flags |
| 1 | Identity & Organization | Shared | Users, organizations, memberships, roles, permissions, authentication, organization switching |
| 2 | Marketplace & Discovery | Engine 1 | Vendor directory, profiles, products, categories, microsites, Profile Experience Engine, advertisements, SEO |
| 3 | RFQ Procurement Engine | Engine 2 (Core Moat) | RFQs, routing, matching, sorting, vendor invitations, quotations, comparison statements |
| 4 | Business Operations Engine | Engine 3 | LOI, PO, challan, trade invoices, payment records, finance records, generated documents, Vendor CRM |
| 5 | Trust & Verification | Shared | Trust scores, performance scores, verification records, fraud signals, risk assessment |
| 6 | Communication | Shared | Chat, RFQ threads, notifications, email/SMS/WhatsApp logs |
| 7 | Monetization | Shared | Plans, subscriptions, entitlements, usage quotas, lead credits, platform invoices |
| 8 | Admin Operations | Shared | Moderation, bans, category approval, vendor approval workflow, system configuration policy |
| 9 | AI Layer | Shared (future activation) | Recommendations, predictions, classifications — derived, regenerable, non-authoritative artifacts only |

### 3.1 Domain Interaction Overview

The canonical flow across domains:

```
Discovery (Module 2)
   → Buyer signs up / logs in (Module 1)
   → RFQ composed, optionally internally approved (Module 3 + org workflow settings)
   → Routing pipeline filters and selects vendors (Module 3, reading Modules 4, 5, 7)
   → Vendors notified (Module 6)
   → Quotations submitted, comparison statement generated (Module 3)
   → Clarification threads (Module 6)
   → Award: Closed Won (Module 3)
   → Post-award operations: negotiation → LOI → PO → delivery → challan
     → trade invoice → payment → review (Module 4)
   → Performance and trust signals update (Module 5)
   → Documents generated and versioned (Module 4, async via Shared Kernel events)
```

Vendor acquisition runs in parallel: seeding from Excel import and admin entry (Module 8), invitation outreach (Module 6), claim and profile completion (Modules 1–2), verification (Module 5), and monetization (Module 7).

### 3.2 Canonical System Flows

Three flows define how the domains cooperate end to end. They are normative: implementations must preserve the ordering, the module hand-offs, and the asynchronous boundaries shown here.

**Flow A — Discovery to RFQ.** An anonymous visitor arrives via organic search or direct traffic on a server-rendered category, vendor, or product page (Module 2). The RFQ call-to-action routes through signup or login (Module 1), which establishes or selects the active organization context. The buyer composes the RFQ in the RFQ Composer (Module 3), attaching versioned specifications from the Product Specification Library or their own uploads, selecting category, work_nature, estimated value, geography, and routing mode. The RFQ may be saved as a draft indefinitely. On submission it enters the lifecycle of Section 9.2, passing through the organization's configured internal approval if one is set.

**Flow B — RFQ to Award (the core loop).** The submitted RFQ passes platform moderation, then enters matching. The routing pipeline (Section 9.4) executes asynchronously: buyer filter, category match, verification/probation gate, tier gate, and confidence scoring select and meter the vendor set. Selected vendors are notified through the Communication module (in-app, email, SMS, WhatsApp per their notification preferences). Vendors submit quotations or formal declines against the specific RFQ version. The buyer works the Comparison Statement, runs clarification threads as needed, shortlists, and closes the RFQ as won or lost. Award value is recorded for transaction intelligence; events flow to Trust & Verification for performance measurement, and the engagement hands off to the Business Operations Engine for the post-award chain.

**Flow C — Vendor seeding to verified (cold-start).** Admin Operations imports category trees and vendor seed rows from Excel, creating `seeded` vendor records (public scope) — and buyers create `buyer_private` records by contributing known vendors. Outreach invitations move records to `invited`. A vendor who takes ownership and logs in moves the record to `claimed` under a controlling organization, completes the profile (earning bonus points where configured), declares capabilities, categories, capacity, and financial tier, and submits verification documents. Manual trust review grants `verified` and the badge. If a buyer searches a category with no vendors, a missing-vendor suggestion routes to admin intake; if a needed category is absent, a category suggestion enters the approval queue.

**Flow D — Document generation.** Whenever a document is produced (PO, quotation, work completion certificate, challan, bill, letterhead-based output), the Business Operations Engine merges the organization's brand assets with record data through one of the five template formats, executes generation asynchronously via the jobs infrastructure, stores the output as a new version in the generated document store, and notifies the requesting user. Generated documents are versioned and audited like any controlled document.

---

## 4. Core Invariants

These invariants sit underneath everything. They are cheap to honor from day one and prohibitively expensive to retrofit. Every schema, screen, and generated module must respect them. **AI build agents: these are hard constraints.**

### Invariant 1 — Vendor capability is a matrix, not a label

Vendor capability is stored as four independent capability flags, never as a single `type` enum:

```
can_supply      — sells/stocks finished or imported products
can_service     — installation, maintenance, repair, operational service
can_fabricate   — custom/made-to-order fabrication, production
can_consult     — advisory, design, engineering consultancy
```

Six named vendor types exist purely as **presets** over these flags, with vendor-elected **overrides** ("Additional Capabilities") on top:

| Vendor Type (preset) | supply | service | fabricate | consult |
|---|:---:|:---:|:---:|:---:|
| Consultant | – | – | – | ✓ |
| MRO / Retail Supplier | ✓ | – | – | – |
| Importer / Equipment Seller | ✓ | – | – | – |
| Manufacturer / Workshop | ✓ | – | ✓ | – |
| Engineering Firm | ✓ | ✓ | ✓ | ✓ |
| Service Provider | – | ✓ | – | – |

A vendor may enable additional capability flags beyond its preset (for example, an Importer that also performs installation and commissioning enables `can_service`). The preset seeds the flags; the flags — not the preset name — drive all matching.

Every RFQ carries a `work_nature` (one or more of supply / service / fabricate / consult). The matching engine filters to vendors whose capability flags **cover** the RFQ's work_nature. A supply-only RFQ never reaches a pure consultant; a fabrication RFQ reaches manufacturers and engineering firms, never retail suppliers.

### Invariant 2 — Two independent role dimensions

There are two separate axes; they are never mixed into one enum:

```
PLATFORM PARTICIPATION  (what the organization is on iVendorz)
   Buyer  ·  Vendor  ·  Hybrid (buyer + vendor)  ·  Platform Staff

ORGANIZATION ROLE  (where a person sits inside their own company)
   Owner  →  Director  →  Manager  →  Officer   (role bundles over permission slugs)
```

An organization can be a buyer, a vendor, or both simultaneously — the same company can post RFQs and receive them. A user belongs to organizations through memberships; the membership carries permissions that govern what the user may do within that organization. Platform staff (Support Admin, Verification Admin, Super Admin, and operational roles) are a separate internal user space, never mixed into organization roles.

### Invariant 3 — Vendor records carry a claim lifecycle and a visibility scope

The cold-start strategy depends on having vendors in the directory before they sign up. A vendor record is therefore never simply "registered or not." It has:

```
LIFECYCLE:   seeded → invited → claimed → verified
VISIBILITY:  buyer_private  |  public
```

`seeded` records come from Excel import or admin entry. `invited` records have received outreach (email/SMS/WhatsApp). `claimed` records have an owning organization that logged in and took control. `verified` records have passed trust checks and carry the badge. `buyer_private` records were added by one buyer for their own use and are visible only to that buyer; `public` records are listed in the open directory. Buyer-private records may be **linked** to public records but are never merged (Section 7.6).

### Invariant 4 — RFQ is a state machine with a control plane

The RFQ is a stateful object moving through a defined lifecycle, and lead distribution is actively governed:

```
LIFECYCLE (canonical state machine — Section 9.2)
draft → [pending_internal_approval] → submitted → under_review → matching
      → vendors_notified → quotations_received → buyer_reviewing
      → shortlisted → closed_won | closed_lost      (cancelled from any active state)

CONTROL PLANE
   Routing     — which vendors get this RFQ (five-step pipeline, Section 9.4)
   Throttling  — how many RFQs reach a vendor per time window
   Sorting     — order of RFQs (vendor view) and vendors (buyer view)
   Scoring     — Matching Confidence used by routing and sorting
```

The control plane is a deliberate, tunable system whose policy parameters live in system configuration, not in code. It is the platform's primary defensibility.

### Invariant 5 — Users act; Organizations own

Every user belongs to at least one organization (a Personal Organization is auto-created at solo signup). Every business record belongs to an organization. Every action executes within a server-validated active organization context. There are no orphan users and no user-owned business records.

### Invariant 6 — Governance signals are firewalled

Trust Score, Performance Score, Financial Tier, Capacity Profile, and Buyer Vendor Status are five separate dimensions (Section 1.5). No signal may mutate another. Buyer-private judgments never become platform-wide truth.

### Invariant 7 — One module, one owner

Every table has exactly one owning module. No module reads or writes another module's tables. Cross-module references are by ID only — no cross-module foreign keys. Communication is via services, events, and public contracts only (Section 16).

### Invariant 8 — Nothing authoritative is overwritten or hard-deleted

Controlled documents are versioned, never edited in place. Business-critical records are soft-deleted, never physically deleted. Audit records are immutable. Identifiers never change; human-friendly references are never reused.

### Invariant 9 — Content ≠ Presentation

Business data (vendor profile, products, projects, certificates) is the source of truth. Presentation (themes, layouts, sections, branding, SEO settings) is configurable experience data stored separately. Changing a template never requires changing business data, and presentation never affects matching.

### Invariant 10 — Two distinct "tiers"

**Financial Tier** (vendor capability: what project size a vendor should receive) and **Subscription Plan** (commercial package: what a vendor pays) are independent concepts with separate naming, separate schema, and separate owners. A Tier D vendor on a Basic plan is valid; a Tier A vendor on an Enterprise plan is valid.

### Invariant 11 — Private exclusion stays private, forever

A vendor must never be able to detect that a specific buyer has blacklisted them. Blacklist exclusion must be indistinguishable from ordinary non-match (Section 22.3). Private supplier intelligence — notes, private ratings, negotiation history, internal remarks — is never exposed publicly, even after vendor linking.

### Invariant 12 — AI suggests; business modules decide

The AI Layer owns no authoritative business records, consumes data only through APIs and only within the requesting organization's existing permissions, and produces only regenerable derived artifacts. Business decisions remain human- or workflow-approved.

---

## 5. Identity & Organization Model

iVendorz is **organization-centric**. Users act through Organizations; most business records belong to Organizations, not to individual users.

```
User → Membership → Organization
```

A user may belong to multiple organizations; an organization may have multiple users. The user switches their active organization, and all actions execute under the current organization context. The active organization context is always **server-validated**: a client-supplied organization identifier is never trusted directly.

### 5.1 Ownership Split

| Entity | Owns |
|---|---|
| **User** (a person) | Login identity, password, 2FA, personal preferences, notification settings |
| **Organization** (a business) | RFQs, quotations, vendor profile, documents, subscription, private vendor list, finance records, ratings given |
| **Membership** (the link) | Role bundle, permissions, department, status, joined_at |

### 5.2 Mandatory Organization Rule (Solo Trader Rule)

Every user must belong to at least one organization; orphan users are not allowed. If a person signs up without an organization, the system auto-creates a **Personal Organization** (e.g., "Musa Trading"). This eliminates special cases, dual identity models, and user-owned records: every action occurs within an organization, without exception.

### 5.3 Organization Participation

Organizations are not split into buyer companies and vendor companies. One organization may be **Buyer**, **Vendor**, or **Hybrid** (buys and sells) simultaneously — a very common pattern in Bangladesh. Participation is a property of the organization's profiles, not its type:

- **Buyer Profile** — optional, organization-owned. Contains procurement preferences, industry, factory information, delivery locations, and approval settings. Its purpose is to enhance matching and procurement workflows.
- **Vendor Profile** — optional, organization-controlled (Section 7). **Current constraint: one organization = maximum one Vendor Profile.** An organization may exist without one. Multiple vendor profiles per organization (e.g., a group with separate pump, boiler, and EPC businesses) is future expansion, deliberately excluded now to optimize for simplicity.

### 5.4 Membership Lifecycle

Membership is a first-class entity with a state machine:

```
Invited (no access) → Pending (accepted, verification incomplete)
→ Active (full access per permissions) → Suspended (access blocked, history retained)
→ Removed (membership ended, audit retained)
```

Memberships evolve; history survives. Membership state gates access: a suspended or removed membership grants nothing, regardless of permissions previously held.

### 5.5 Owner Protection and Succession

- **Last Owner Protection.** An organization must always have at least one active owner. Before an owner can be removed, ownership must be transferred or a new owner assigned. Organizations must never become ownerless.
- **Ownership Succession.** If an owner account becomes disabled, deleted, or suspended, ownership must be reassigned via manual transfer, admin recovery, or a legal recovery process. Every recovery action requires an audit record, a reason code, and an approver identity. This prevents abandoned organizations.

### 5.6 Organization Verification

Organization Verification is separate from Vendor Verification. It checks trade license, BIN, TIN, and business information, and applies to buyer, vendor, and hybrid organizations alike. Levels:

```
Unverified → Verified → Enhanced Verified
```

Organizations are verified as legal entities; vendor capabilities are verified separately (Section 11).

### 5.7 Record Ownership Rules

- **Subscription** belongs to the Organization, never a User and never a Vendor Profile. If a user leaves, the subscription remains.
- **RFQ** is owned by the Organization. Three actor references are tracked separately on every RFQ: the **owner organization**, the **creator user**, and the **approver user** (e.g., an Officer created it, a Manager approved it, a Director awarded it).
- **Quotation** belongs to the Vendor Profile (Section 7.4), with the submitting user tracked.
- **Buyer private vendor records** remain private to the buyer organization forever, even when linked to public vendor records.
- **Data access** is determined by Organization + Permission — never by user identity alone.
- **User departure:** when a user leaves an organization, business records remain with the organization; the departed user's personal identity may be anonymized.

**Principle: Users act. Organizations own.**

---

## 6. Multi-Tenancy Model

iVendorz is multi-tenant. **Organizations are the tenant boundary.** Data is isolated by organization unless explicitly designed as shared or public.

### 6.1 Isolation Principle

The default rule is **private**. Everything is private unless declared otherwise.

| Scope | Visible To | Examples |
|---|---|---|
| **Private** | Owner organization only | RFQ drafts, private vendor notes, internal ratings, finance records, approval history, buyer vendor status |
| **Shared** | Specific organizations, by explicit grant | RFQs distributed to selected vendors, submitted quotations, RFQ clarification threads |
| **Public** | Everyone | Vendor profiles, product listings, microsites, public reviews, categories |

A private RFQ remains private until distribution; after distribution, only invited vendors may access it.

### 6.2 Shared Access Pattern (Grant Tables)

Shared visibility is implemented through **grant tables**, never through ad-hoc flags or query logic. Canonical grant tables include `rfq_recipients`, `quotation_visibility`, and `thread_participants`. A vendor sees only the RFQs routed to it — never all RFQs.

### 6.3 Row-Level Security Strategy

Every tenant-owned record carries `organization_id` (rfqs, quotations, finance_records, private_vendors, and so on). The base access rule is `organization_id = current active organization`. RLS in the database is defense-in-depth behind application-layer authorization, and it is tested as code:

- **RLS Test Requirement:** every RLS policy requires a positive test, a negative test, and a cross-tenant denial test. CI validation is mandatory.
- **Service Role Policy:** the Supabase service role bypasses RLS; therefore every service-role query must include organization scope filtering, explicit authorization checks, and audit logging where applicable.
- **Active Organization Validation:** the active organization context is server-validated on every request; client-supplied organization identifiers are never trusted.

### 6.4 Cross-Tenant Rules

- Shared resources cross tenants only by design (RFQ distribution, quotation submission, clarification threads, chat) — never by direct database access.
- **Data leakage rule:** no module may expose private notes, admin ratings, internal scores, or finance data across tenant boundaries. Buyer blacklist status never crosses the tenant boundary — not through routing, analytics, or inference.
- Cross-tenant communication happens only through controlled channels owned by the Communication module.

### 6.5 Delegation Grants

Authorized representation of a vendor profile by another organization (Section 7.3) is implemented through an explicit **Delegation Grant**:

```
Representative Organization → Delegation Grant → Vendor Profile
```

A grant contains: `permission_set`, `valid_from`, `valid_to`, `granted_by`, `status`. The complete access formula for the platform is therefore:

```
Membership + Permission + Resource Scope
        OR
Active Delegation Grant
= Access
```

### 6.6 AI Access Rule

AI services (matching, comparison, recommendation) may read **only data the requesting organization already has access to**. AI never bypasses permissions.

### 6.7 Scalability

The current deployment is a single multi-tenant database. Because the tenant boundary (`organization_id` everywhere) already exists, future sharding is possible without redesign.

**Principle: Tenant isolation is mandatory. Cross-tenant access must be explicit, controlled, and auditable.**

---

## 7. Vendor Identity Model

Vendor **Identity** and Vendor **Ownership** are separate concepts. A Vendor Profile is a durable marketplace identity; control of it may change hands; its history survives.

### 7.1 Core Structure

- Every Vendor Profile has **exactly one Controlling Organization** at any point in time.
- A Vendor Profile may have **0..N Authorized Representatives** (organizations holding delegation grants).
- **Ownership is singular. Representation may be multiple.**

### 7.2 Controlling Organization

The Controlling Organization is the legal and operational owner of the vendor profile. It owns: the profile, the subscription that powers it, verification, trust score attribution, and category assignments. There is only ever one at a time.

- Subscriptions belong to **Organizations**, never to Vendor Profiles. Profiles inherit capabilities through the controlling organization's entitlements.
- Trust Scores belong to the **Vendor Profile**. Ownership changes do not reset trust history.

### 7.3 Authorized Representatives

Representatives hold scoped, delegated permissions only (e.g., sales agency, regional office, distributor access), expressed as Delegation Grants (Section 6.5).

- **May (if delegated):** view assigned RFQs, submit quotations, manage leads.
- **May never:** transfer ownership, change the subscription, delete the vendor profile, modify verification records.

**Representation ≠ Ownership.**

### 7.4 Quotation Ownership and Quota Attribution

- **Quotation Ownership Rule.** Quotations belong to the **Vendor Profile**, not to representative organizations. Constraint: **one vendor = one active quotation per RFQ.** If another representative submits, the allowed actions are: replace the draft, create a revision, or withdraw the previous version. Two active quotations from the same vendor on the same RFQ are never allowed.
- **Quota Attribution Rule.** All usage consumption (RFQ responses, lead access, ad launches) is attributed to the **Controlling Organization's** quota, regardless of which representative acted. This prevents quota splitting, quota abuse, and billing ambiguity. **Representatives act. Owners pay.**

### 7.5 Ownership Transfer and Trust Protection

Every ownership transfer automatically triggers the **Trust Protection Workflow**:

```
Transfer Requested → Transfer Approved → Trust Freeze → Compliance Review → Trust Reactivation
```

This prevents trust laundering (a high-trust vendor profile sold to a bad actor). During the freeze: the trust score is hidden, trust ranking is disabled, and manual review is required.

- **Ownership History.** Vendor ownership history is preserved permanently with `valid_from`, `valid_to`, `transfer_reason`, `approved_by`. It supports audit, compliance, and dispute resolution.
- **Audit Requirement.** All ownership changes generate an audit record, a domain event, and a historical ownership entry.
- **Vendor Identity Invariant.** Vendor Identity survives ownership change, representative change, and subscription change. Trust history remains attached to the Vendor Profile, subject to Trust Freeze review. **Identity persists. Control may change.**

### 7.6 Claim Lifecycle, Visibility, and Private–Public Linking

Vendor records follow the claim lifecycle and visibility scopes of Invariant 3. The buyer-private path works as follows:

1. A buyer adds known vendors (e.g., by comma-separated email entry or Excel import); valid entries are saved to the buyer's **private vendor list** with details. These records are visible only to that buyer.
2. Later, the same real-world vendor may register or claim a **public** vendor record.
3. The system detects candidate matches by **email, phone, and trade license**.
4. On high confidence, it proposes a **Suggested Link**; an admin or the vendor confirms.
5. The result is a **link**, never a merge:

```
        Vendor Master Identity
                 │
        ┌────────┴────────┐
   Public Vendor     Private Vendor records
     Profile         (Buyer A's, Buyer B's, …)
        ▲                    │
        └──── linked_to ─────┘
```

The buyer's internal notes, personal ratings, supplier history, and special terms remain private forever — linking exposes nothing. The Vendor Master Identity concept anchors duplicate resolution: one real-world vendor may be referenced by one public profile and many private records, all linked, none merged.

### 7.7 Capability, Categories, and Capacity on the Profile

The Vendor Profile carries:

- The **capability matrix** (Invariant 1) — four flags seeded by preset, adjustable by override.
- **Category assignments** (Section 8.2) — up to 10 assignments, of which up to 5 are Primary.
- The **Capacity Profile** (Section 11.3) — structured evidence of execution ability.
- The **Financial Tier** (Section 12) — declared and, later, verified.
- **Geography** — country, division, district, and industrial zone (e.g., Gazipur, Narayanganj, Chattogram, Khulna). Bangladesh procurement is highly geography-sensitive; geography is a first-class matching dimension.

**Principle: One Vendor. One Owner. Many Representatives.**

---

## 8. Marketplace Model

The Marketplace & Discovery module (Engine 1) is the acquisition surface: it makes vendors findable, credible, and presentable, and it converts anonymous traffic into RFQs.

### 8.1 Marketplace Components

| Component | Responsibility |
|---|---|
| Public homepage / landing | Acquisition surface, hero, calls-to-action |
| Four-level mega menu | Category navigation, seeded from Excel import |
| Vendor directory + profile pages | Browse/search vendors; public profile pages |
| Product directory + detail pages | Products with specification / URS lists per product |
| Service directory | Discovery of service-capability vendors |
| Microsites | Branded company pages for entitled vendors, usable as the vendor's own web link, including custom domains |
| Search (keyword) | Text search across vendors, products, categories — PostgreSQL full-text |
| Search (by image) | Visual product search (future activation, AI Layer backend) |
| Advertisement placement | Ad slots: landing, bottom, search, vendor profile — dense but not clumsy |
| Public ratings display | Buyer-facing reviews and ratings |
| Public ban banner | Public trust signal for banned/fraudulent entities |
| SEO / programmatic pages | Category and vendor landing pages for organic acquisition; server-rendered and crawlable |

SEO is a first-class requirement: all Engine 1 pages are server-rendered, because organic discovery is a primary acquisition channel.

### 8.2 Category Taxonomy and Vendor Participation

- The category hierarchy is limited to **4 levels maximum** (e.g., Mechanical → Pumps → Centrifugal Pumps → Food Grade Pumps). The taxonomy is seeded by Excel import and governed by Admin Operations; users may suggest new categories for admin approval, and missing-vendor suggestions are routed to admin intake.
- A vendor may hold a maximum of **10 category assignments**, of which up to **5 are Primary** and the remainder **Secondary**. A Primary assignment may additionally carry a **Specialized** designation marking a reviewed, niche specialization within that category.
- **Primary categories** drive RFQ matching, homepage search, vendor ranking, and lead delivery at **full weight (100%; 10 points in matching score)**.
- **Secondary categories** are used for search and directory listing only, at **reduced weight (40%; 4 points in matching score)**.
- The platform may review and approve category assignments. Category misuse leads to warning, suspension, or category removal.

This split prevents spam category selection while preserving discoverability: a vendor cannot harvest leads from ten categories at full weight.

### 8.3 Product Specification Library (Knowledge Base)

The marketplace includes a **Product Specification Library**: a structured knowledge base of industrial product specifications used both for buyer education and for RFQ composition. Each library entry (e.g., SS Vessel, Agitator, Boiler, Compressor, Safety Equipment) contains:

```
URS (User Requirement Specification) · Datasheet · Checklist · Drawing · Standards
```

All library documents are version-controlled under the document versioning rules of Section 19. Buyers attach library specifications (or their own uploaded, versioned specifications) to RFQs; quotations bind to the exact specification revision they were priced against.

### 8.4 Profile Experience Engine

Organizations control the presentation, branding, structure, and visual appearance of their public vendor profile, landing page, and microsite through the **Profile Experience Engine**, a subdomain of the Marketplace module.

**Core principle: Content ≠ Presentation** (Invariant 9). Business data remains stable; the same data renders through multiple themes, layouts, and templates. Changing a template never requires changing business data, and presentation never affects matching.

Components:

1. **Theme System** — typography, palette, buttons, cards, spacing, visual style. Example themes: Industrial, Corporate, Engineering, Modern, Minimal.
2. **Layout Templates** — predefined structures: A Directory Style · B Engineering Company · C Manufacturer · D Service Company · E Corporate Microsite. Each defines hero, section, and contact ordering.
3. **Dynamic Section Builder** — enable/disable sections: About, Products, Services, Projects, Certificates, Clients, Team, Factory Photos, Videos, Downloads, Contact, Custom.
4. **Profile Content Blocks** — presentation data stored separately from business entities: `profile_sections(section_type, display_order, is_visible, content_json)`.
5. **Branding Assets** — logo, cover banner, brand/secondary colors, company video, brochure PDF, gallery.
6. **SEO Management** — SEO title, meta description, keywords, OG image, canonical URL, schema metadata.
7. **Custom Domain Support** — `vendor.ivendorz.com`, `company.com`, `suppliers.company.com` for entitled subscriptions.

Feature gating uses entitlement slugs only (Section 20): `template_access_level`, `can_customize_colors`, `can_use_section_builder`, `seo_level`, `can_use_custom_domain`, `can_use_custom_theme`. Public profiles are visible to everyone; draft changes are visible only to the owning organization. Every configuration change generates an audit record (actor, timestamp, previous configuration, new configuration) and the appropriate domain events (`ProfileThemeChanged`, `ProfileLayoutChanged`, `ProfilePublished`, `ProfileUnpublished`, `MicrositePublished`, `MicrositeDomainChanged`).

### 8.5 Media Pipeline

All uploaded imagery passes through a media pipeline: upload from gallery → crop-shape preview → web optimization (smallest size at good screen quality). Generated assets are stored in object storage and referenced by ID.

**Principle: One Vendor Profile, multiple presentation possibilities. Business data is the source of truth; presentation is a configurable experience.**

---

## 9. RFQ Procurement Engine

The RFQ Procurement Engine (Module 3) is the core moat. It owns RFQs, routing, matching, sorting, vendor invitations, quotations, comparison statements, and routing rules. Nobody else may own these.

### 9.1 RFQ Composition

A buyer composes an RFQ with:

- **Category** (from the four-level taxonomy) and **work_nature** (one or more of supply / service / fabricate / consult).
- **Specifications** — attached from the Product Specification Library or uploaded; always version-bound.
- **Estimated value** (BDT) — drives Financial Tier eligibility.
- **Geography** — delivery/site location (division, district, industrial zone) as a matching dimension.
- **Routing mode** (Section 9.5) — selected at creation.
- Drafts may be saved at any point before submission.

Every RFQ records three actors separately: owner organization, creator user, approver user.

### 9.2 Canonical RFQ Lifecycle (State Machine)

```
draft
  → pending_internal_approval   (only if the buyer organization's workflow settings require it)
  → submitted
  → under_review                (platform moderation)
  → matching                    (routing pipeline executes)
  → vendors_notified
  → quotations_received
  → buyer_reviewing             (comparison statement available)
  → shortlisted
  → closed_won | closed_lost

cancelled — reachable from any active (non-closed) state; audited with reason
```

State transitions are events (Section 15) and audit entries (Section 14). Internal approval steps are configured per organization (Section 13.4): No Approval, Single Approval, or Multi-Step Approval (Officer → Manager → Director → Owner). Organizations that want no ceremony skip the approval workflow entirely.

### 9.3 RFQ Version Immutability

RFQs are version-controlled documents. **Once any quotation is submitted against RFQ Version X, Version X becomes immutable.** Buyer changes create v2/v3/v4; existing versions are never modified. Every quotation records which RFQ version it was submitted against. Every revision requires a revision reason.

### 9.4 Routing Pipeline (Order of Operations)

Routing executes as a strict five-step pipeline. The order is normative:

```
1. Buyer Filter            — routing mode + blacklist floor; binary gate, FIRST
2. Category Match          — Primary categories at full weight; Secondary at reduced weight
3. Verification Eligibility + Probation Pool injection
4. Financial Tier Eligibility — RFQ value within or below vendor tier ceiling
5. Matching Confidence     — Financial Tier + Capacity Profile + Performance Score + Trust Score
```

Steps 1–4 are gates; step 5 is a score. The buyer filter is a binary gate, never a confidence input. Capability-flag coverage of the RFQ's work_nature and geography proximity are applied within category matching and confidence scoring respectively. No single governance signal may dominate the confidence calculation.

**Probation pool.** New vendors participate via a probation pool to prevent cold-start invisibility. The reference routing split is 80% verified vendors / 20% probation vendors — this ratio is operating policy, stored in `system_configuration` (Module 0) and read by the routing engine, never hardcoded. Blacklisted vendors never enter via the probation slot: the buyer filter applies before probation injection.

**Throttling and sorting.** The control plane meters how many RFQs reach each vendor per time window, for three reasons: lead quality for vendors (a vendor drowning in mismatched leads stops responding, which damages their response rate and the platform's credibility), fairness across the vendor pool (leads must not concentrate on a handful of profiles), and monetization integrity (entitlement quotas such as `monthly_rfq_limit` are enforced here through the usage ledger, Section 20.3). Sorting orders RFQs in the vendor's inbox and vendors in the buyer's view using Matching Confidence, with Primary-category matches ranked above Secondary-category matches. Throttling windows and sorting weights are system configuration, never code constants, so the control plane can be tuned in production without redeploys. Lead and RFQ monitoring consoles in Admin Operations watch the control plane in action.

### 9.5 Buyer-Defined Routing Modes

Each RFQ selects exactly one routing mode:

| Mode | Behavior |
|---|---|
| **Approved Only** | Route only to vendors this buyer marked Approved |
| **Approved + Conditional** | Route to Approved and Conditional vendors |
| **Approved + Open Market** | Approved vendors preferred, plus normal category matching |
| **Open Market** (default) | Normal category matching, no buyer restriction |

**Invariant: Blacklist is NOT a mode.** Blacklisted vendors are excluded in every mode, including Open Market — always. Modes widen the pool; the blacklist sets an absolute floor. Buyer vendor statuses (Approved / Conditional / Blacklisted) are private buyer intelligence owned by the Vendor CRM (Section 10.4); the routing engine reads them **through the CRM service only**, never by direct table access. Blacklist exclusion is enforced at routing — never at presentation, never client-side — and excluded vendors' empty/error states must be indistinguishable from a non-match (Section 22.3).

**Routing explainability.** RFQ routing records the applied mode for award explainability: RFQ ID, routing mode, applied filter reference, timestamp. Audit of buyer filters is visible only to the buyer organization and platform compliance under policy; blacklist entries never appear in any vendor-facing audit view. **Decisions are explainable to the decider, not to the excluded.**

### 9.6 Quotations and Comparison

- Vendors respond with a priced quotation against a specific RFQ version, or with a **formal decline**. ("Response" means quote submitted or formal decline; ignored and expired RFQs count as non-response for performance measurement.)
- One vendor profile = one active quotation per RFQ (Section 7.4). Revisions supersede; withdrawal is explicit; all transitions are audited and versioned.
- The buyer receives a **Comparison Statement**: a side-by-side comparison of submitted quotations (price, delivery, capability, warranty, spec compliance). The comparison statement is itself a version-controlled document.
- Clarification happens in RFQ-scoped threads (Module 6); thread participation is grant-based.

### 9.7 Award and Hand-off

Shortlisting and award (`closed_won` / `closed_lost`) end the RFQ Engine's ownership of the transaction. Deal value is recorded at `closed_won` for GMV reporting and transaction intelligence — the platform never touches the money. Post-award, the workflow continues in the Business Operations Engine (Section 10): negotiation, LOI, PO, delivery, challan, trade invoice, payment record, and review. The award emits domain events that the Trust & Verification module consumes for performance measurement.

### 9.8 Vendor Contribution Flows

- **Buyer-contributed vendors:** buyers add known vendors by email; valid entries become buyer-private vendor records (Invariant 3, Section 7.6).
- **Missing-vendor suggestion:** if a category has no vendor, users suggest vendor names routed to admin intake.
- **Category suggestion:** users propose new categories for admin approval.

**Principle: Participation follows proven capability; private exclusion stays private, forever.**

---

## 10. Business Operations Engine

The Business Operations Engine (Module 4) is the retention layer. It owns post-award commercial workflow, business documents, finance records, and the Vendor CRM. Its scope deliberately exceeds "ERP-lite documents": it is the home for documents, finance, CRM, ERP-lite operations, and operational analytics.

### 10.1 End-to-End Procurement Workflow

The platform supports the full industrial procurement chain. The RFQ Engine owns the pre-award half; the Business Operations Engine owns the post-award half:

```
RFQ → Quotation → Comparison → Shortlist → [award: Closed Won]   (Module 3)
   → Negotiation → LOI → PO → Delivery → Challan → Trade Invoice
   → Payment Record → Review / Work Completion Certificate        (Module 4)
```

Every artifact in the chain is a version-controlled document (Section 19), owned by the creating organization, audited, and soft-delete protected.

### 10.2 Owned Records

| Record | Notes |
|---|---|
| LOI (Letter of Intent) | Post-shortlist commitment document |
| PO (Purchase Order) | Generated from templates with org branding |
| Challan | Delivery documentation |
| **Trade Invoices** | Vendor/buyer/project/delivery invoices — commerce **between parties**. Distinct from platform invoices (Module 7), which are fees owed to iVendorz. **Trade Invoice ≠ Platform Invoice.** |
| Payment records | Status tracking of buyer↔vendor payments as records only — no funds move through the platform |
| Finance records (text) | TAX, AIT, payments, expenses recorded as structured text entries (not file uploads) |
| Generated documents | Output of the template engine (Section 19.2) |
| Vendor CRM | Pre-award and post-award relationship intelligence (Section 10.4) |
| Time-bounded reporting | Procurement rollups (RFQs, quotations, challans, bills, payments, specs) for a defined time window |

### 10.3 Work Completion and Review

Project closure produces a **Work Completion Certificate** and buyer confirmation. These are first-class performance inputs: completion certificates, buyer confirmations, and project closures feed the Performance Score (Section 11.2) via domain events.

### 10.4 Vendor CRM

The Vendor CRM starts **before** purchase, not after:

- **Pre-Award:** private vendor notes, private ratings, favorites, vendor evaluation, and **buyer-defined vendor status** — Approved / Conditional / Blacklisted, keyed on `(buyer_org_id, vendor_profile_id, status)`:

| Status | Meaning |
|---|---|
| Approved | Buyer-trusted. Eligible; may be preferred in buyer-scoped sorting |
| Conditional | Eligible, with a buyer-private caveat note (e.g., "good price, slow delivery") |
| Blacklisted | Excluded from this buyer's RFQs in every routing mode. Non-disclosing |
| *(none)* | Neutral — default for all vendors |

- **Post-Award:** performance history, project records, relationship tracking.

Buyer vendor status is private intelligence — **a lens, not a platform signal**. It is scoped to the buyer organization, never crosses the tenant boundary, never mutates platform-wide scores, and is served to the routing engine exclusively through the CRM service contract. Status changes generate audit records visible only to the buyer organization and platform compliance.

Vendor-side, the CRM gives vendors a **lead pipeline**: RFQ Received → Quoted → Negotiation → Won / Lost → Follow-up. This is a second retention engine: vendors run their sales operation inside the platform.

### 10.5 Buyer Procurement Team Workflow

Factory procurement teams operate the chain with separation of duties: an Officer drafts, a Manager approves the RFQ and vendor selection, a Director approves financials and POs, an Owner holds full authority. The exact gates are the organization's own workflow settings (Section 13.4) — never hardcoded.

---

## 11. Trust & Performance Framework

The Trust & Verification module (Module 5) owns trust scores, performance scores, verification records, audit results, and fraud signals. It computes the platform-wide vendor governance signals — and enforces the firewalls between them.

### 11.1 Trust Score Engine

A platform-wide Trust Score evaluates vendor credibility, reliability, and engagement. It is a **decision-support metric**; it does not replace buyer judgment.

**Components:**

- **Profile Completeness** — company info, products, services, certifications, contacts
- **Verification Status** — trade license, TIN, BIN, factory verification, ISO
- **Marketplace Activity** — RFQ response rate, participation, profile updates, login activity
- **Performance Indicators** — buyer reviews, completion rate, repeat engagement, response time

**Signal classification:** *Primary signals* are verification status, performance score, complaint history, and RFQ response quality. *Secondary signals* are profile completion and platform activity. Secondary signals must never dominate the trust calculation.

**Score range:** 0–100. Indicative bands: 0–30 Low · 31–60 Moderate · 61–80 Trusted · 81–100 Highly Trusted.

**Rules:**

- The trust score updates automatically. **Admins may never hand-edit a score value**; only underlying data may be corrected.
- **Versioning:** every score carries `trust_formula_version` and `trust_score_updated_at`. Algorithms evolve; historical scores must remain explainable.
- **Trust Freeze:** during fraud investigation, major dispute, manual compliance review, or vendor ownership transfer, the trust score may be frozen. Freezing suspends *publication and ranking effect only* — the stored value is untouched, the score is hidden, trust ranking is disabled, and manual review is required before reactivation. Freeze ≠ modification.
- Trust is used as a matching-confidence input (pipeline step 5) and in directory/vendor ranking — never as an eligibility gate by itself.

**Principle: Trust is earned through measurable behavior.**

### 11.2 Performance Score Framework

Every Vendor Profile has a **Performance Score**, separate from Trust Score, Financial Tier, Subscription Plan, and Verification Status. A vendor may be verified but slow; large but unreliable; trusted but inactive. Performance measures **actual operational behavior**.

**Score range:** 0–100. Levels: Excellent 90–100 · Strong 75–89 · Average 60–74 · Weak 40–59 · Poor 0–39.

**Components (weights sum to 100%):**

| Component | Weight | Measures |
|---|---|---|
| RFQ Response Rate | 25% | RFQs received vs responded (response = quote submitted **or** formal decline; ignored/expired = non-response) |
| Delivery Performance | 25% | On-time delivery, project completion, missed commitments |
| Quote Quality | 15% | Complete submission, required documents, spec compliance |
| Buyer Feedback | 15% | Post-award reviews, completion ratings |
| Win Rate | 10% | Quotes submitted vs awarded |
| Dispute Record | 10% (negative) | Complaints, disputes, verified issues |

**Calculation rules:**

- **New Vendor Policy:** new vendors start as **Not Rated** — not 100, not 0.
- **Minimum Data Threshold:** the score is not calculated until the vendor has **5 RFQ responses or 2 completed projects**.
- **Renormalization:** if a component is unavailable (e.g., no delivery history yet), the remaining active weights are normalized to 100%. The vendor is not penalized for missing history.
- **Recency:** recent performance matters more; historical performance decays in weight over time.
- **Sources:** work completion certificates, buyer confirmations, and project closures (Module 4) are first-class performance inputs.
- **Versioning:** `performance_formula_version`, `performance_score_updated_at`.

**Visibility:** public sees the performance badge/level; the vendor sees the detailed breakdown; admins see the full calculation.

**Manual intervention:** admins may freeze, review, and recalculate — every action requires an audit record. The **Performance Freeze Workflow** is: Performance Review Triggered → Performance Frozen → Compliance Review → Performance Reactivated. During freeze the public badge is hidden and ranking impact disabled.

**Events:** `PerformanceScoreUpdated`, `PerformanceReviewTriggered`, `PerformanceFrozen`.

**Principle: Trust measures confidence. Performance measures execution.**

### 11.3 Vendor Capacity Profile

Every vendor maintains a structured Capacity Profile used for RFQ matching, search ranking, and buyer evaluation:

- **Manufacturing:** factory size, production capacity, equipment list, workforce size
- **Service Providers:** technical team size, service coverage area, available resources
- **Project Capability:** project size range, industry experience, major clients
- **Commercial Capacity:** annual turnover range (optional), years in business, export capability
- **Operational limits:** maximum project value, maximum monthly RFQ capacity, employee count range

Certain capacity claims may be verified by iVendorz; verified capacity is displayed separately from declared capacity.

**Relationship to Financial Tier: Tier = Claim. Capacity = Evidence.** The tier answers *what size projects should this vendor receive*; capacity answers *can this vendor actually execute it*. Capacity contradicting tier (e.g., a Tier D claim with 5 employees) reduces matching confidence.

**Principle: Capability should be visible before engagement.**

### 11.4 Verification

- **Vendor verification:** phone/email ownership → business verification (trade license, BIN/TIN — manual review first) → physical/factory verification (visit + QA/QC capability check). Passing grants the verified badge and trust indicators (response rate, on-time quote %, completed RFQs, years active, reviews).
- **Organization verification** is separate (Section 5.6).
- **Verification records** are owned exclusively by the Trust & Verification module. Admin Operations may approve, reject, and review verification requests but never owns the records. **Admin decides; the Trust module stores.**
- **Antifraud and bans:** fraud signals feed ban management (Module 8); bans surface on the public ban banner and emit `VendorBanned`.
- **Admin-only ratings:** internal scoring visible to platform staff only, never public, never crossing tenant boundaries.

---

## 12. Financial Tier Framework

The Financial Tier represents the **maximum project value a vendor is expected to execute**. It is a **matching signal** — not a trust signal, not a subscription signal. Capability ≠ Trust. Capability ≠ Subscription.

### 12.1 Tier Structure

Tiers are defined by **project value**, never by turnover (turnover is effectively unverifiable in Bangladesh):

| Tier | Project Value (BDT) | Typical Vendor |
|---|---|---|
| A | 0 – 5 Lac | Retail supplier, small service provider, local workshop |
| B | 5 – 25 Lac | Importer, small contractor, industrial supplier |
| C | 25 Lac – 1 Crore | Engineering company, fabricator, medium manufacturer |
| D | 1 – 5 Crore | Large EPC, major manufacturer, industrial group |
| E | 5 Crore+ | Enterprise vendor, national supplier, large industrial contractor |

### 12.2 Tier Assignment

- **Stage 1 (current):** the vendor selects a **Declared Tier**. Admin may override; overrides are audited.
- **Stage 2:** the platform may issue a **Verified Tier** based on completed projects, supporting documents, business capacity, and historical awards. Declared Tier may differ from Verified Tier; both are stored.
- **Tier upgrade suggestion:** when a vendor's award history demonstrates repeated wins above its current tier (reference threshold: 10 projects above tier, configured in system configuration), the system suggests a tier upgrade for review.

### 12.3 Matching Rule

A vendor is eligible for an RFQ when the RFQ value falls **within or below the vendor's tier ceiling**. Example: an 18 Lac RFQ is eligible for Tiers B–E, not Tier A. Tier eligibility is step 4 of the routing pipeline. Admin override is permitted and audited.

### 12.4 Separation Firewalls

- Financial Tier must **never** increase Trust Score directly. Large ≠ trustworthy.
- Financial Tier does **not** affect Performance Score. Performance derives only from response rate, delivery success, buyer feedback, and award history.
- Financial Tier and Subscription Plan are independent: Tier D + Basic plan is valid; Tier A + Enterprise plan is valid.
- Capacity, Trust, and Performance are separate dimensions; tier contradicted by capacity reduces matching confidence (Tier = Claim, Capacity = Evidence).

### 12.5 Tier Lifecycle

- **Status values:** Declared · Pending Verification · Verified · Suspended · Expired.
- **Event:** every tier change emits `VendorTierChanged`, triggering matching refresh, vendor re-ranking, and an audit entry.
- **History:** tier changes are versioned with `effective_from`, `effective_to`, `change_reason`, `approved_by`. Vendor capability evolves; history survives.
- **Expiry review:** a Verified tier is reviewed periodically — every 24 months.

### 12.6 Matching Confidence

```
Matching Confidence = Financial Tier + Capacity Profile + Performance Score + Trust Score
```

No single governance signal may dominate matching decisions. Tier calculations must be auditable; tier history must be retained. The Financial Tier belongs to the Vendor Profile.

---

## 13. Permission & Authorization Model

Authorization is permission-based, never role-name-based, and it lives in the application layer. Database RLS is defense-in-depth behind it (Section 6.3).

### 13.1 Permission Slugs

Authorization checks use **permission slugs**, never role names.

```
Bad:   if (role == "Manager")
Good:  if (hasPermission("can_approve_rfq"))
```

Canonical slugs include: `can_create_rfq`, `can_approve_rfq`, `can_submit_quote`, `can_manage_users`, `can_manage_billing`, `can_view_rfq`, `can_view_all_rfqs`. **Roles are bundles. Permissions are authority.**

### 13.2 Three-Layer Access Check

All three layers must be satisfied for tenant access:

1. **Organization Membership** — no active membership, no access.
2. **Permission Slug** — the action's required permission must be held.
3. **Resource Ownership / Scope** — `can_view_rfq` ≠ `can_view_all_rfqs`; organization scope must also hold.

```
Membership + Permission + Resource Scope = Access
        OR
Active Delegation Grant = Access            (vendor representation, Section 6.5)
```

### 13.3 Role Bundles (convenience only)

The canonical organization role bundles, in descending authority:

| Role | Bundle (indicative) |
|---|---|
| **Owner** | All permissions. Exclusive: subscription management, company verification submission, ownership transfer, organization deletion |
| **Director** | Financial approval, PO approval, payment approval, user permission approval, RFQ approval, user management |
| **Manager** | RFQ approval, vendor selection approval, quotation approval, team management |
| **Officer** | Create RFQ, save drafts, submit quotation, create vendor records, create products, create documents |

Bundles are convenience presets over slugs; organizations operate through the slugs, and bundle composition may be tuned per organization without schema change. An Officer cannot approve RFQs, approve payments, manage the subscription, or delete the company; a Manager cannot change ownership or manage the subscription — because those slugs are not in their bundles, not because of their titles.

**Worked examples.** An Officer in Buyer Org X opens an RFQ draft: membership in Org X is active, `can_create_rfq` is held, and the draft's `organization_id` matches the active context — access granted. The same Officer attempts to approve the RFQ: membership and scope hold, but `can_approve_rfq` is absent from the Officer bundle — access denied, regardless of title. A sales agent of Representative Org Y opens an RFQ routed to Vendor Profile V: Org Y holds an active Delegation Grant on V whose `permission_set` includes quotation submission and whose validity window covers today — access granted through the delegation path; the quotation is recorded against Vendor Profile V and the quota is consumed from V's Controlling Organization.

### 13.4 Organization Workflow Settings

Organizations configure their own internal operating rules; approval workflow is never hardcoded:

- **RFQ Approval:** No Approval · Single Approval · Multi-Step Approval (e.g., Officer → Manager → Director → Owner). SMEs may skip approval entirely.
- **Financial Permissions:** who can view billing, manage the subscription, approve payments.
- **Notification Rules:** per-organization email, SMS, and in-platform notification preferences, applied by the Communication module when dispatching.
- **Future extensions:** department-based routing, budget approval chains, enterprise procurement policies.

**Principle: Organizations control their own operating rules.**

### 13.5 Platform Roles

Platform staff roles are separate from organization roles:

- **Support Admin** — assists users, views tickets; cannot view private RFQs.
- **Verification Admin** — reviews documents, verifies vendors; cannot read finance records.
- **Super Admin** — emergency access to all data; every action audited, logged, and flagged.

Operational staff roles (Sales Agent, Verification Officer, Moderator) are specializations within this internal space, also expressed as permission bundles.

---

## 14. Audit & Compliance Model

All business-critical actions generate **immutable** audit records. The audit trail is a platform-wide shared service owned by the Shared Kernel (Module 0). **No module may bypass it.**

### 14.1 Audit Coverage

- **RFQ:** created, edited, submitted, approved, rejected, closed, cancelled
- **Quotation:** created, edited, submitted, withdrawn, approved, rejected
- **Vendor:** created, claimed, verified, suspended, banned, tier changed, category changed, ownership transferred
- **Organization:** created, role changed, ownership changed, subscription changed
- **Financial:** invoice created, payment status changed, refund issued, subscription renewed
- **Admin:** ban issued, verification approved/rejected, category approved/deleted
- **Routing:** applied routing mode and filter reference per RFQ (visible per the disclosure rules of Section 9.5)
- **Scores:** trust/performance freeze, recalculation, reactivation; tier overrides

### 14.2 Minimum Audit Fields

```
audit_id, actor_id, actor_type, organization_id, entity_type, entity_id,
action, old_value, new_value, timestamp, ip_address, user_agent
```

**Actor types:** User · Admin · System · AI Agent.

### 14.3 Immutability and Redaction

Audit records are permanent — but *record immutability ≠ field immutability*. Sensitive fields (e.g., IP address, user agent) may be redacted under approved privacy policy. Every redaction creates a **new audit event** recording who redacted what and why. Redaction requires a compliance-scoped permission and an approval flow. "Never delete" governs records; redaction governs fields and is itself audited.

### 14.4 Retention and Large Objects

- Audit logs are never deleted. Soft archive only.
- Audit records reference document versions; large blobs are never stored in audit tables.

### 14.5 Audit vs Events

Audit answers *what happened*. Domain events answer *what should happen next* (Section 15). They are separate systems: an RFQ submission writes an audit record ("officer submitted RFQ") **and** emits `RFQSubmitted` (which triggers matching, notifications, analytics).

### 14.6 Compliance Scenarios

The audit model is designed for the disputes an industrial procurement platform actually faces. When a buyer disputes which specification a vendor quoted against, the quotation's recorded RFQ version and the document version chain answer it. When a vendor disputes a lost award, the routing audit (mode, filter reference, timestamp) and the comparison statement versions reconstruct the decision — disclosed to the deciding buyer and platform compliance, never to excluded vendors. When a tier override, score freeze, or ownership transfer is questioned, the corresponding history tables (`tier_history`, ownership history, freeze events) plus their audit records identify who acted, when, and why. When a privacy request requires removing an IP address, redaction handles the field while the record and a redaction event survive. Every dispute path terminates in retained history; none terminates in "the data was overwritten."

**Principle: Business actions may change. Audit history may not.**

---

## 15. Event Architecture

Every important business action emits a **domain event**. Events drive automation, notifications, analytics, matching refresh, trust/performance recalculation, and the future AI layer.

### 15.1 Delivery: Transactional Outbox

The business record and its outbox event are written **in the same database transaction**, then committed. The outbox (`core.outbox_events`) is owned by the Shared Kernel; a dispatcher delivers events to consumers asynchronously (via the async-jobs platform). This guarantees no event is lost and no phantom event fires for a rolled-back write.

### 15.2 Event Rules

- **Versioning:** every event includes `event_name` + `event_version`.
- **Idempotent consumers:** consumers must tolerate duplicate delivery.
- **Thin payloads:** events carry IDs + minimal metadata; consumers fetch details from the owning module's services.
- **Async-by-default:** matching, routing, notifications, document generation, and imports all run as event-driven background jobs.

### 15.3 Event Catalog (canonical)

| Domain | Events |
|---|---|
| RFQ | RFQCreated, RFQSubmitted, RFQApproved, RFQClosedWon, RFQClosedLost |
| Vendor | VendorClaimed, VendorVerified, VendorSuspended, VendorBanned, VendorTierChanged |
| Quotation | QuotationSubmitted, QuotationWithdrawn, QuotationSelected |
| Trust / Performance | TrustScoreUpdated, PerformanceScoreUpdated, PerformanceReviewTriggered, PerformanceFrozen |
| Subscription | SubscriptionPurchased, SubscriptionRenewed, SubscriptionExpired |
| Profile Experience | ProfileThemeChanged, ProfileLayoutChanged, ProfilePublished, ProfileUnpublished, MicrositePublished, MicrositeDomainChanged |

The catalog grows by adding events under the owning module; lifecycle transitions in Section 9.2 map onto the RFQ events, with intermediate transitions recorded in audit.

### 15.4 Event Consumers

Notifications (Module 6), analytics, the matching engine (Module 3), the trust engine (Module 5), the automation engine, and the future AI layer (Module 9).

**Principle: Business actions create events. Events drive automation.**

---

## 16. Module Boundaries

iVendorz is a **Modular Monolith**. Each module owns its data, business rules, services, and events. No module may directly access another module's tables; communication happens only through **Services, Events, and Public Contracts**.

### 16.1 System Context Map

```
Module 0  Platform Core / Shared Kernel
Module 1  Identity & Organization
Module 2  Marketplace & Discovery
Module 3  RFQ Procurement Engine   (Core Moat)
Module 4  Business Operations Engine
Module 5  Trust & Verification
Module 6  Communication
Module 7  Monetization
Module 8  Admin Operations
Module 9  AI Layer
```

### 16.2 Module Ownership Charters

**Module 0 — Platform Core / Shared Kernel** *(detailed in Section 17)*
Owns: `audit_records`, `outbox_events`, `id_generation`, `system_configuration`, `feature_flags`. Responsible for cross-cutting infrastructure, system governance, event delivery, audit integrity. Rule: the Shared Kernel is **infrastructure only** — RFQ, Vendor, Trust, or Billing logic never moves into it.

**Module 1 — Identity & Organization**
Owns: users, organizations, memberships, roles, permissions. Nobody else may own these. Responsible for authentication, authorization, membership management, organization switching. Public services: Get User, Get Organization, Check Permission, Get Membership.

**Module 2 — Marketplace & Discovery**
Subdomains: Vendor Directory · Microsite Engine · Profile Experience Engine. Owns: vendor profiles, microsites, products, projects, categories, advertisements, favorites, and presentation data (themes, layouts, section config, brand settings, SEO settings). Responsible for vendor discovery, SEO, directory, product browsing. Public services: Get Vendor Profile, Search Vendors, Get Categories. Does **not** own RFQs, quotations, subscriptions, or trust scores; may **read** Trust Score, may **not calculate** it.

**Module 3 — RFQ Procurement Engine (Core Moat)**
Owns: rfqs, RFQ routing, matching, sorting, vendor invitations, quotations, comparison statements, routing_rules. Nobody else may own rfqs, quotations, or routing_rules. Responsible for the buyer → vendor procurement flow. Public services: Create RFQ, Submit Quote, Get Comparison, Route RFQ. Reads buyer-defined vendor status from Module 4 **via the CRM service only**.

**Module 4 — Business Operations Engine**
Owns: PO, LOI, challan, **trade_invoices**, payment records, finance records, generated documents, Vendor CRM. The CRM starts pre-award (private notes, ratings, favorites, evaluation, buyer vendor status) and continues post-award (performance history, project records, relationship tracking). Post-award operations begin only after RFQ Closed Won.

**Module 5 — Trust & Verification**
Owns: trust scores, performance scores, `verification_records` (exclusively), audit results, fraud signals. Responsible for vendor trust, verification, risk assessment. Admin Operations may approve/reject/review verification requests but never owns `verification_records`. **Admin decides; the Trust module stores.**

**Module 6 — Communication**
Owns: chat, RFQ threads, notifications, emails, SMS logs, WhatsApp logs. Rule: the RFQ module creates the RFQ; the Communication module sends the notification. The separation is required.

**Module 7 — Monetization**
Owns: plans, subscriptions, entitlements, usage quotas, lead credits, **platform_invoices**. Responsible for billing, access limits, plan enforcement. Other modules may query entitlements; none may modify subscriptions.

**Invoice ownership (resolved):**

| Table | Owner | Meaning |
|---|---|---|
| `trade_invoices` | Module 4 | Commerce between buyer and vendor (project/delivery invoices) |
| `platform_invoices` | Module 7 | Fees owed to iVendorz (subscriptions, leads, advertising) |

**Module 8 — Admin Operations**
Owns: moderation, ban actions, category approval, vendor approval workflow, system configuration policy. Responsible for platform governance. Includes: Excel import console (category trees + vendor seeding into the claim lifecycle), verification queue (decision workflow), RFQ moderation, category management, missing-vendor intake, lead/RFQ monitoring, fraud & ban console, subscription control, analytics dashboards, internal sales CRM for vendor acquisition.

**Module 9 — AI Layer** *(detailed in Section 18)*
Owns no authoritative business records; may own regenerable derived artifacts only.

### 16.3 Cross-Module Communication Rules

1. **No direct table access.** Bad: RFQ module → `UPDATE vendor_profiles`. Good: RFQ module → Vendor Service.
2. **Events for async work.** `RFQSubmitted` triggers matching, notifications, analytics.
3. **Ownership is singular.** Every table has exactly one owner module.

### 16.4 Boundary Enforcement

- **Database:** one dedicated PostgreSQL schema per module — `core.*, identity.*, marketplace.*, rfq.*, operations.*, trust.*, communication.*, billing.*, admin.*` (plus the AI layer's derived-artifact schema).
- **No foreign keys across module boundaries.** Cross-module references use IDs only; ownership remains independent.
- **Write-time validation:** because there are no cross-module FKs, referencing another module's entity requires service validation before save (e.g., an RFQ referencing a vendor calls the Vendor Service to validate the ID).
- **Integrity audit job:** a periodic job verifies referential integrity across boundaries — orphan_vendor_ids, orphan_org_ids, orphan_rfq_ids, orphan_quotation_ids. **Module independence requires validation discipline.**
- **Application layer:** each module exposes only Commands, Queries, and Events.
- **Repository rule:** cross-module repository imports are prohibited (the rfq module cannot import billing internals).
- **CI rule:** the build fails on module-ownership violations, cross-module dependency violations, or restricted imports.
- **AI Agent rule:** generated code must respect module boundaries. Agents may generate code only inside the owning module, must not read other modules' tables, must not modify other modules' entities, and must not bypass public contracts. Violations are rejected at review.

### 16.5 Future Extraction Rule

Services are extracted only when justified by load. Candidates: RFQ Engine, Search Engine, Notification Engine. **Not** Users / Categories / Products services — too fine-grained to extract.

**Principles: One Module, One Owner, One Responsibility. A module may expose capabilities; a module may never surrender ownership. Data, business, and module ownership must always align.**

---

## 17. Shared Kernel

Module 0 — Platform Core / Shared Kernel — is the infrastructure backbone shared by every module. It contains **infrastructure only**: no business logic, ever.

### 17.1 Owned Capabilities

| Capability | Table / Service | Purpose |
|---|---|---|
| Audit trail | `core.audit_records` | Immutable audit service used by all modules (Section 14) |
| Event delivery | `core.outbox_events` | Transactional outbox + dispatch (Section 15) |
| ID generation | `core.id_generation` | UUIDv7 machine IDs + human-friendly reference sequences |
| System configuration | `core.system_configuration` | Tunable operating policy: probation pool ratio, throttling windows, sorting parameters, tier-upgrade thresholds |
| Feature flags | `core.feature_flags` | Controlled rollout of features independent of deploys |

### 17.2 Identifier Strategy

All business entities use **UUIDv7** as their machine identifier: `organization_id`, `vendor_id`, `rfq_id`, `quotation_id`, `document_id`, `subscription_id`, and so on. UUIDv7 provides global uniqueness with time-ordered locality for index performance.

**Human-friendly references** are a separate field, generated per entity type with year-scoped sequences:

```
ORG-2026-000001     RFQ-2026-000123     QTN-2026-000567     DOC-2026-000891
```

Rules: **machine IDs and human references are separate concerns**; identifiers never change; human references are never reused — including after soft delete and restore.

### 17.3 System Configuration Discipline

Operating policy that needs tuning without redeploys lives in `system_configuration`, read by the owning engines at runtime: the probation routing split (default 80/20), throttling windows, sorting weights, minimum-data thresholds, and tier review cadence. Architecture defines the mechanism; configuration holds the numbers. Changes to configuration are audited.

---

## 18. AI Layer

Module 9 is the platform's AI capability. It is architecturally reserved now and activated when RFQ volume exists — rule-based logic outperforms a cold model and is debuggable, so AI layers **on top** of a working procurement loop rather than replacing it.

### 18.1 Ownership Rules

AI owns **no authoritative business records**.

- **May own:** `recommendations`, `predictions`, `classification_results`, `similar_vendor_results` — provided they are regenerable, derived, and non-authoritative. AI artifacts are cacheable and disposable.
- **May never own:** RFQ, Vendor Profile, Quotation, Trust Score, Subscription.
- **Consumes** RFQs, specifications, vendor data, and categories through APIs only.
- **Produces** recommendations, predictions, and suggestions — never source-of-truth records.

### 18.2 Reserved Capabilities

| Capability | Function |
|---|---|
| RFQ Structuring | Free text → structured RFQ (category, material, process, priority) |
| Specification Extraction | Pull structured specs from uploaded documents |
| Vendor Matching assist | Augments the rule-based pipeline's confidence scoring |
| Quote Comparison | Summarizes price/delivery/capability/warranty across quotations |
| Category Classification | Auto-suggest taxonomy placement |
| Image Search | Visual product search backend |
| Automation pipelines | Onboarding, lead routing, SEO page generation, email/WhatsApp flows |

### 18.3 Data and Access Rules

- AI services may read **only data the requesting organization already has access to** — AI never bypasses permissions.
- **Allowed:** anonymized aggregate analytics.
- **Not allowed:** training public AI models on private RFQ content.
- AI actions are auditable: the audit system supports the **AI Agent** actor type.

### 18.4 Activation Sequencing

The AI layer activates against accumulated data, not against the calendar. RFQ structuring and category classification activate first, because they need only the taxonomy and specification library plus a general-purpose model. Quote comparison activates once quotation volume provides realistic test cases. Matching assist activates last: it tunes the confidence scoring of pipeline step 5 against observed award outcomes, and it never replaces the deterministic gates of steps 1–4 — buyer filter, category, verification, and tier eligibility remain rule-based permanently, because gates must be explainable and litigable in a way learned models are not. Image search activates when the product catalog justifies the indexing cost. Each activation lands inside Module 9's existing boundary: new derived-artifact tables, new service contracts, no new ownership.

**Principle: AI suggests. Business modules decide.** Business decisions remain human- or workflow-approved.

---

## 19. Document & Template System

### 19.1 Document Versioning & Specification Control

All controlled business documents support versioning. **No document is overwritten.** Every change creates a new revision.

**Version-controlled documents:**

- **Product specifications:** URS, datasheet, technical specification, checklist, drawing
- **Procurement documents:** RFQ, quotation, comparison statement, LOI, PO, work completion certificate
- **Company documents:** trade license, ISO certificate, factory audit reports

**Rules:**

- **Never overwrite** — v1 → v2 → v3; never edit in place. Revisions are labeled (e.g., URS-001 Rev A, URS-001 Rev B).
- **Active revision** — the system always marks current vs previous versions.
- **Change notes** — every revision requires a revision reason ("material changed", "delivery date changed").
- **Relationships** — a quotation must record **which RFQ version** it was submitted against.
- **RFQ Version Immutability** — once any quotation is submitted against RFQ Version X, that version becomes immutable (Section 9.3).

Version history is what makes the platform explainable: what changed, why a quotation was revised, who approved.

**Principle: Documents evolve. History must survive.**

### 19.2 Document Template Engine

The Business Operations Engine generates branded business documents from **five template formats**:

```
1. Challan
2. Bill / Trade Invoice
3. Letterhead
4. Quotation / Offer
5. Work Completion Certificate
```

These five formats produce the platform's outbound documents (PO, quotation, WCC, and related paperwork). The engine pulls the organization's brand assets — logo, address, contact, core business — and merges them with record data (RFQ, quotation, completion data). Generation runs asynchronously through the event/jobs infrastructure; outputs are stored in the generated document store (object storage, referenced by document ID) and versioned like any controlled document.

### 19.3 Storage Discipline

Documents live in object storage; metadata, version chains, and references live in the owning module's schema. Audit records reference document versions by ID and never embed blobs.

---

## 20. Monetization & Entitlements

### 20.1 Revenue Model

Platform revenue comes exclusively from fees that belong to iVendorz (Section 1.4):

**Current streams:** vendor subscriptions · premium listings · microsite fees · lead packages · advertising · sponsored placements · platform service fees.

**Future expansion streams:** tender publishing fees · enterprise procurement tooling · vendor verification services · featured RFQs · data intelligence products · premium SaaS services.

Supporting capabilities owned by Module 7: subscription billing, plan purchases, lead credits, advertisement inventory and serving, platform invoice generation, payment status tracking, revenue reporting — all via merchant payment gateways. Referral rewards and bonus/reward points (profile completion, reviews, work completion) are loyalty mechanics governed here as well.

### 20.2 Entitlement System

Subscription plans control access through a **centralized entitlement system**. Features must never check plan names.

```
Bad:   if (plan == "Growth")
Good:  if (entitlement("can_create_microsite"))

Subscription Plan → Entitlements → Features
```

Plan names change; entitlements remain stable.

**Entitlement types:**

| Type | Example |
|---|---|
| Boolean | `can_create_microsite`, `can_receive_extra_rfqs`, `can_view_advanced_analytics` |
| Numeric | `monthly_rfq_limit` |
| Enum | `support_level`, `template_access_level`, `seo_level` |

### 20.3 Usage Ledger

Quota consumption is tracked separately from entitlement grants: RFQ usage, lead usage, advertisement credits. Consumption is always attributed to the **Controlling Organization**, regardless of which representative acted (Section 7.4). The RFQ control plane's throttling respects entitlement quotas through the ledger.

### 20.4 Commercial Packaging (marketing configuration, not architecture)

Indicative packages, expressed strictly as entitlement bundles:

| Plan | Indicative Entitlements |
|---|---|
| Basic | Listing, limited visibility, basic search/chat, base RFQ limit |
| Starter | Basic + business profile, included leads, more categories, priority visibility |
| Growth | Starter + enhanced profile, more leads, priority placement, advanced analytics, lead boost |
| Enterprise | Growth + custom workflow, dedicated support, enterprise procurement tools |

Billing is monthly and annual; annual may carry discounts. The plan→entitlement mapping is marketing configuration that may change at will; the architecture binds only to entitlement slugs.

**Ownership:** subscriptions belong to Organizations only — never to Users, never to Vendor Profiles. Financial Tier is independent of subscription (Invariant 10).

**Principle: Plans are marketing. Entitlements are architecture.**

---

## 21. Data Ownership Rules

### 21.1 Ownership Classes

| Class | Examples | Owner |
|---|---|---|
| **Organization-owned business data** | RFQs, quotations, private vendor notes, private ratings, uploaded specifications, generated documents, finance records | Creator Organization |
| **Platform-owned data** | Trust scores, performance scores, audit logs, matching scores, verification results, platform analytics | iVendorz |
| **Shared data** | Public vendor profiles, public reviews, public categories | Platform + participating organizations |

### 21.2 Privacy Rules

- Private supplier intelligence — notes, personal ratings, negotiation history, internal remarks, buyer vendor status — must **never** be exposed publicly. Even after vendor linking. Blacklist status additionally carries the non-disclosure invariant (Section 22.3).
- **Disclosure rule:** private RFQs remain private until distribution; after distribution, only invited vendors may access the RFQ.
- **AI data usage:** anonymized aggregate analytics allowed; training public AI models on private RFQ content not allowed.
- **User departure:** business records remain with the organization; personal identity may be anonymized.

### 21.3 Soft Delete & Retention

Business-critical records are never physically deleted. All deletions are **soft deletes**.

- **Applies to:** organizations, users, vendor profiles, RFQs, quotations, documents, invoices, POs, payments, specifications.
- **Minimum fields:** `deleted_at`, `deleted_by`, `delete_reason`.
- **User experience:** delete means archived / hidden / inactive — not removed.
- **Permanent deletion (only):** temporary uploads, unused draft files, expired system cache.
- **Partial unique indexes:** soft-deleted records must not block reuse of unique values — PostgreSQL: `UNIQUE ... WHERE deleted_at IS NULL`.
- **Restore policy:** soft-deleted entities (vendor, user, RFQ, organization) may be restored. **Restore conflict rule:** if a unique value (e.g., `vendor_slug`) has been reused while deleted, the system generates a new slug on restore; original history is preserved.
- Soft-deleted vendors are excluded from routing.

**Soft-delete cascade (organization deleted):**

```
Organization     → Soft Deleted
Memberships      → Soft Deleted
Vendor Profile   → Suspended
RFQs             → Archived
Quotations       → Preserved
```

Quotations are preserved because they belong to the counterparty's procurement history as well.

**Principle: Users (organizations) own their business data. The platform owns platform intelligence. Business history survives; visibility may change.**

---

## 22. Security & Governance Rules

### 22.1 Tenancy Enforcement

- Active organization context is server-validated on every request; client-supplied organization IDs are never trusted (Section 6.3).
- Service-role database access (which bypasses RLS) must always apply organization scope filtering, explicit authorization checks, and audit logging.
- Every RLS policy ships with positive, negative, and cross-tenant denial tests, enforced in CI.
- Shared visibility exists only through grant tables (`rfq_recipients`, `quotation_visibility`, `thread_participants`).

### 22.2 Score Integrity

- Score values (trust, performance) are never hand-edited; only underlying data may be corrected. All admin interventions (freeze, review, recalculate, tier override) are audited.
- Freezes suspend publication and ranking effect only; stored values are untouched.
- Formula versioning (`trust_formula_version`, `performance_formula_version`) keeps every historical score explainable.
- The governance signal firewalls (Section 1.5) are security rules, not just modeling guidance: code that feeds Financial Tier into Trust Score, or buyer status into any platform score, is a violation.

### 22.3 Non-Disclosure Invariant (Blacklist)

A vendor must never be able to detect that a specific buyer has blacklisted them.

- **Prohibited signals:** no notification, no lead record, no analytics trace, no error message, no "not eligible" state.
- **Indistinguishability rule:** blacklist exclusion must be indistinguishable from ordinary non-match — silent absence.
- **Survives representation:** the filter targets the Vendor Profile; no representative of an excluded profile is invited or signaled.
- **Survives the probation pool:** the buyer filter applies before probation injection.
- **Cross-tenant rule:** blacklist status never crosses the tenant boundary — not through routing, analytics, or inference.
- **Enforcement point:** at routing, never at presentation, never client-side.

### 22.4 Trust Protection

- Vendor ownership transfers always trigger the Trust Protection Workflow (Section 7.5) to prevent trust laundering.
- Trust and Performance freezes protect score integrity during fraud investigations, disputes, and compliance reviews.
- Fraud signals feed ban management; bans are public (ban banner), audited, and evented.

### 22.5 Platform Staff Governance

- Support Admins cannot view private RFQs; Verification Admins cannot read finance records; Super Admin emergency access is fully audited and flagged (Section 13.5).
- Admin verification decisions are recorded in the Trust module's `verification_records`; admin consoles hold workflow, never record ownership.

### 22.6 Money Governance

- The platform holds no third-party funds — no escrow, wallets, custody, or settlement (Section 1.4). The only processed money is platform revenue via merchant gateways.
- Commercial transaction intelligence (values, terms, currency) is captured continuously to keep a future, separately-governed financial-services layer additive rather than disruptive: if escrow is introduced, it arrives as new modules (escrow accounts, transactions, milestone payments, settlement engine, wallet ledger, dispute resolution, compliance) with no changes to User, Organization, Verification, RFQ, Quotation, or Subscription systems.

### 22.7 Build Governance for AI Agents

- Agents generate code only inside the owning module; cross-module table access, entity modification, or contract bypass is rejected at review and fails CI.
- Agents must treat this document's invariants as hard constraints and flag conflicts instead of working around them.
- All AI-agent actions on business data are audited under the AI Agent actor type.

---

## 23. Architecture Principles

These principles summarize the doctrine of the platform. When detailed rules are silent, decide in the spirit of these.

1. **Modular Monolith, disciplined boundaries.** One deployable; ten bounded contexts; one PostgreSQL schema per module; no cross-module table access; no cross-module foreign keys; extraction only under proven load.
2. **Domain-Driven Design.** Modules are bounded contexts with singular ownership: one module, one owner, one responsibility. Data, business, and module ownership must always align.
3. **Multi-tenant by default-private.** Organizations are the tenant boundary. Everything is private unless declared shared (by grant) or public (by design). Cross-tenant access is explicit, controlled, and auditable.
4. **Organization-centric.** Users act; organizations own. Every user belongs to an organization; every business record belongs to an organization; every action runs in a server-validated organization context.
5. **RFQ-centric.** The unit of work is the RFQ — a versioned, immutable-once-quoted state machine with a governed control plane (routing, throttling, sorting, scoring). The control plane is the moat.
6. **Procurement workflow platform.** The full chain — RFQ to quotation to comparison to award to LOI, PO, delivery, challan, trade invoice, payment, and review — lives on the platform, with organization-configurable approval workflow.
7. **ERP-lite operations as retention.** Documents, finance records, and the vendor CRM make the platform the buyer's system of record and the vendor's pipeline tool.
8. **Professional vendor network.** Vendor identity is durable and trust is earned through measurable behavior. Identity persists; control may change; history survives.
9. **Independent governance signals.** Trust, Performance, Financial Tier, Capacity, and Buyer Vendor Status are firewalled. No signal mutates another; no single signal dominates matching; buyer judgment is a private lens, never platform truth.
10. **Capability is a matrix.** Vendor ability is four flags (supply / service / fabricate / consult) with presets and overrides — never a type enum. RFQ work_nature must be covered by vendor flags.
11. **Tier ≠ Trust ≠ Subscription.** Financial Tier is a project-size matching signal. Tier = Claim; Capacity = Evidence. Plans are marketing; entitlements are architecture; features check slugs, never plan or role names.
12. **Permissions over roles.** Authorization = Membership + Permission + Resource Scope (or an active Delegation Grant). Roles are bundles; permissions are authority.
13. **Nothing is lost.** Immutable audit, versioned documents, soft deletes, ownership and tier histories, never-reused human references. Business actions may change; history may not.
14. **Events drive automation.** Transactional outbox, versioned events, idempotent consumers, thin payloads, async-by-default for heavy work.
15. **Content ≠ Presentation.** Business data is the source of truth; themes, layouts, and microsites are configurable experience. Presentation never affects matching.
16. **The platform never touches deal money.** Only its own revenue, as a merchant. Escrow readiness is preserved through transaction intelligence, not built.
17. **Rule-based first, AI on top.** Matching is deterministic and debuggable today; AI augments once data volume exists. AI suggests; business modules decide; AI owns nothing authoritative and never bypasses permissions.
18. **Private intelligence stays private, forever.** Buyer notes, ratings, history, and blacklists never leak — by linking, by routing, by analytics, or by inference.
19. **Policy in configuration, mechanism in architecture.** Tunable numbers (probation split, throttles, thresholds) live in system configuration; engines read them at runtime.
20. **SEO-first acquisition.** Public marketplace pages are server-rendered and crawlable; organic discovery is a primary growth channel.
21. **Fewest moving parts.** TypeScript end-to-end, managed and serverless infrastructure, a single deploy — a stack a small team plus AI agents can move fast on without operational drag.

---

## 24. Architecture Decision Index

This index is the only place in this document where decision-record numbers appear. Each entry lists the decision, its status, and the section(s) of this document where it is integrated. The original decision files remain the legal record; this document is the operative source of truth.

| ADR | Decision | Status | Integrated In |
|---|---|---|---|
| ADR-001 | Technology Stack — serverless: Next.js App Router, Vercel, Supabase (Postgres/Auth/Storage/Realtime), Inngest, Resend, PostHog; Postgres full-text now, Meilisearch as governed future expansion | Approved | §1.3 |
| ADR-002 | Platform Money Flow & Escrow Scope — platform revenue only; no escrow/wallet/custody/settlement; escrow deferred not rejected; transaction intelligence preserved | Approved | §1.4, §2.2–2.3, §20.1, §22.6 |
| ADR-003 | Trust Score Engine — components, 0–100 bands, auto-calculation, no hand-edits, formula versioning, Trust Freeze, primary/secondary signal classification | Approved (amended v0.3) | §11.1, §22.2 |
| ADR-004 | Vendor Capacity Profile — structured capacity areas; verified vs declared capacity; Tier = Claim / Capacity = Evidence | Approved | §11.3, §12.4 |
| ADR-005 | Vendor Identity, Ownership & Representation — one Controlling Organization, 0..N representatives, transfer Trust Protection Workflow, quotation ownership (one active quote per vendor per RFQ), quota attribution to owner, permanent ownership history, identity invariant. *(v1 "Vendor Linking Policy" superseded by this revision)* | Approved (Revised; Redline v0.3.1 A–F) | §7.1–7.5 |
| ADR-006 | Financial Tier Framework — tiers A–E by project value (BDT), declared→verified lifecycle, status enum, 24-month review, tier history, matching eligibility gate, firewalls vs Trust/Performance/Subscription, Matching Confidence formula. *(Original subscription packaging reclassified to ADR-011)* | Approved (redefined v0.3 + Redline v0.3.1 A–L) | §12, §9.4 |
| ADR-007 | Category Participation & RFQ Routing Eligibility — 4-level taxonomy, category assignment levels and review, probation pool (ratio in system configuration), and Redline v0.3.3: buyer-defined vendor status, four routing modes, blacklist floor, non-disclosure invariant, 5-step routing pipeline, signal firewall, routing audit (resolves F044 Approved Vendor List) | Approved (amended v0.3; Redline v0.3.3 A–F) | §8.2, §9.4–9.5, §10.4, §22.3 |
| ADR-008 | Organization Workflow Settings — org-configurable RFQ approval (none/single/multi-step), financial permissions, notification rules; permission-slug model | Approved (amended v0.3) | §13.4, §9.2 |
| ADR-009 | Audit Trail & Compliance — immutable platform-wide audit (Module 0), coverage, minimum fields, actor types incl. AI Agent, redaction-as-audited-event, no blobs, never delete | Approved (amended v0.3) | §14, §17.1 |
| ADR-010 | Document Versioning & Specification Control — never overwrite, active revision, change notes, quotation↔RFQ-version binding, RFQ version immutability | Approved (amended v0.3) | §19.1, §9.3 |
| ADR-011 | Subscription Entitlement Policy — centralized entitlements (boolean/numeric/enum), no plan-name checks, usage ledger, packaging as marketing configuration; subscriptions owned by Organizations only | Approved (amended v0.3; absorbs original ADR-006 packaging) | §20.2–20.4 |
| ADR-012 | Soft Delete & Data Retention — soft delete everywhere, minimum fields, partial unique indexes, restore policy; v0.3.2: cascade rules and restore conflict (new slug) | Approved (amended v0.3 + Closure v0.3.2 §3) | §21.3 |
| ADR-013 | Data Ownership & Privacy — organization-owned vs platform-owned vs shared data; private supplier intelligence never exposed; disclosure rule; AI data usage rule; user departure rule | Approved (amended v0.3) | §21.1–21.2, §18.3 |
| ADR-014 | Domain Event Architecture — events ≠ audit, transactional outbox, event versioning, idempotent consumers, thin payloads, consolidated catalog | Approved (amended v0.3; catalog extended by ADR-006R/018/020) | §15 |
| ADR-015 | Identity & Organization Model — organization-centric, User→Membership→Organization, ownership split, hybrid organizations; Redline v0.3.1: mandatory organization (Solo Trader Rule), membership lifecycle, last-owner protection, succession, organization verification, one-vendor-profile cardinality, buyer profile | Approved (amended Redline v0.3.1 A–G) | §5 |
| ADR-016 | Multi-Tenancy & Authorization — organization tenant boundary, default-private scopes, 3-layer authorization, role bundles, platform roles, RLS strategy, cross-tenant rules, AI access rule; v0.3.2: active-org server validation, service-role policy, grant tables, delegation grants, RLS test requirement | Approved (+ Closure v0.3.2 §1) | §6, §13, §22.1 |
| ADR-017 | Module Boundaries & Bounded Contexts — modular monolith, Modules 0–9, ownership charters, Module 0 shared kernel, trade vs platform invoice split, verification-record ownership, CRM scope, schema-per-module, no cross-module FKs, CI enforcement, AI-agent rules, future extraction rule; v0.3.2: write-time validation, integrity audit job | Approved (amended Redline v0.3.1 A–F + Closure v0.3.2 §2) | §16, §17 |
| ADR-018 | Performance Score Framework — 0–100, weighted components, Not Rated start, minimum data threshold (5 responses or 2 projects), recency decay, freeze workflow, formula versioning; v0.3.2: completion-certificate integration, response definition, renormalization | Approved (Amendments A–C + Closure v0.3.2 §4) | §11.2 |
| ADR-019 | Identifier Strategy — UUIDv7 for all business entities; separate human-friendly references (ORG-/RFQ-/QTN-/DOC-…); ID immutability; references never reused | Approved (Closure Package v0.3.2 §5) | §17.2 |
| ADR-020 | Vendor Experience & Profile Presentation Layer — Content ≠ Presentation; themes, layout templates, section builder, content blocks, branding, SEO, custom domains; entitlement-gated; audited; evented; owned by Marketplace → Profile Experience Engine | Approved | §8.4 |

**Consolidation rulings carried into this document** (from the architecture review of the frozen corpus): "tier" terminology split between ADR-006 (financial capability) and ADR-011 (subscription packaging); trust freeze reconciled as publication/ranking suspension, never value editing; audit redaction reconciled as field-level, itself audited; AI ownership wording fixed to "no authoritative business records"; feature gating restated as entitlement slugs; the probation ratio moved to system configuration; early service extraction rejected per the Future Extraction Rule.

**Closure items resolved in this document:** the canonical RFQ lifecycle state machine is ratified in §9.2; the platform currency is BDT with explicit currency capture on value fields (§1.4); notification policy is organization-configurable under workflow settings (§13.4) and dispatched by the Communication module; probation pool parameters default to 80/20 in system configuration (§9.4, §17.3); search remains PostgreSQL full-text with Meilisearch adoption gated behind its own future decision record (§1.3); identifier strategy is ratified as ADR-019 per the approved Closure Package (§17.2).

---

*End of iVendorz Master System Architecture v1.0 FINAL — the single source of truth. All prior drafts, compendia, and closure packages are superseded for reading purposes by this document.*






