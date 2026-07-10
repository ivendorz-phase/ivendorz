> **STATUS — CONSOLIDATED v1.1 · 2026-06-30.** Single consolidated Buyer (Track 2) Planning & Design deliverable. **Part I** = the base deliverable (four-lens synthesis, adversarially verified). **Part II** = the six Board-approved additive sections + four in-place refinements + the Board Disposition Log (incorporating the CTO + Architecture Board adjudication). Non-authoritative companion; conforms to FROZEN Doc-7F / Doc-4M / Doc-7B / Doc-7C; coins nothing; PLANNING ONLY. Three review findings were rejected with cause (see the Disposition Log).

# iVendorz — Buyer Workspace: Planning & Design (Track 2)

**Roles:** Enterprise Frontend Architect · Procurement Domain Expert · Senior React Engineer · UX Designer
**Status:** NON-AUTHORITATIVE companion · **DRAFT** · conforms to FROZEN **Doc-7F** (Buyer Workspace), **Doc-4M** (RFQ/quotation state index) + **Doc-4F/Doc-2 §3.5** (engagement state machine — see precedence caveat in §0.1), **Doc-7B** (component kit), **Doc-7C** (app shell), **Doc-5E/5F/5D** (buyer-leg contracts) · **coins nothing** · **PLANNING ONLY** (wave-gated, reorders no roadmap, authorizes no out-of-sequence build).
**Date:** 2026-06-30
**Precedence chain (on any conflict, higher wins):** Frozen Architecture Corpus (Doc-2/3/4-series, Master Architecture) → ADR Compendium → Doc-7F/Doc-4M/Doc-7C/Doc-7B (frozen design corpus) → Doc-5E/5F/5D (frozen buyer-leg contracts) → **this companion**. On any conflict with a frozen document — **including an intra-corpus divergence between two frozen docs** — the response is **Flag-and-Halt**: cite both sources, escalate, never resolve locally (CLAUDE.md §11).
**No code.** This deliverable produces information architecture, navigation, flows, screen specifications, component mapping, and conformance registers only — no TS/JSX/CSS. Every contract, route, state, screen, template, and token is **bound by pointer** to the grounding; any genuine gap is surfaced as an existing `[ESC-7-*]` handle, never an invention.

---

## 0. Carried Flag-and-Halt items (intra-corpus divergences surfaced, not resolved)

This deliverable is the buyer-leg planning surface; it does not adjudicate frozen-corpus conflicts. During verification, three points surfaced where two frozen documents diverge or where a single frozen document carries internal tension. Per CLAUDE.md §11 and the precedence chain above, they are **carried as Flag-and-Halt / `[ESC-7-*]` items and escalated**, not silently reconciled into design law. The design below adopts the **contract-authority** reading where one exists, and marks the seam.

### 0.1 Engagement state set — Doc-4M index vs Doc-4F/Doc-2 §3.5 contract authority

- **Doc-4F PassB Part-2 (BC-OPS-2 FROZEN)** — the operative *contract authority* for the engagement aggregate — models the engagement as `enum<open | in_delivery | completed | closed>`, created at `open` by the `RFQClosedWon` consumer, with `open → in_delivery → completed → closed` (`closed` terminal) and the **trade-invoice `disputed` status explicitly declared "*not* an engagement state"** (Doc-4F §F5.5, line 336). Doc-2 §3.5 (`engagements` machine) and Doc-5F Structure FROZEN concur.
- **Doc-4M_FROZEN** engagement rows (lines 234–240) instead list `active → completed | disputed | terminated`, created at `active`, with `active↔disputed` and `…→terminated` transitions.
- **Disposition:** this design pins the engagement lifecycle to the **contract authority (Doc-4F §F5 / Doc-2 §3.5): `open → in_delivery → completed → closed`** and treats dispute as a non-state audit/event fact (§0.2). The Doc-4M-vs-Doc-4F divergence is **raised as a carried Flag-and-Halt** for an authoritative reconciliation before the engagement state→screen map is built. Engagement-state wiring (§3.2, §5.1, §5.2, §8 Flow 4, §10 P-BUY-19/20) is marked **pending reconciliation** against Doc-4M.

### 0.2 "Dispute" representation

Per the contract authority (Doc-4F §F5.5; Doc-2 §8/§9), a dispute is **not an engagement state**: it is a **trade-invoice status transition (`→ disputed`) that emits the real `DisputeRecorded` event** (Trust input, DF-4) plus its audit row. This design adopts that representation, while §0.1's Flag-and-Halt notes that Doc-4M's index disagrees by listing a `disputed` engagement state.

### 0.3 Doc-7F internal tension on "buyer invites" (carried, not resolved)

Doc-7F's own frozen text carries tension on whether the buyer *targets* vendors:

- **FR8 (Structure FROZEN)** is titled "Discovery … (vendor discovery **to invite**)"; **Content Pass-1 §2.1** "The buyer discovers vendors **to invite** to RFQs"; **§2.2** "favorites vendors/catalog items **for later RFQ invitation**"; **§2.3** "The buyer **chooses whom to invite** from discovery; the engine **separately** routes per governed rules."
- **Content Pass-2 §4.2** states the buyer "**never invokes matching/routing** and **never sends an invitation**" (the engine generates invitations per governed routing).

These reconcile as *intent/candidate-selection (buyer) ≠ invitation dispatch (engine)* — but they are not byte-identical, and the absolute claim "discovery is research/reference ONLY with no targeting at all" is **stronger than the frozen corpus settles**. **Disposition:** this design (a) preserves the load-bearing, unambiguously frozen rule — **the engine dispatches invitations; the buyer never invokes matching/routing and there is no engine-bypass "dispatch invitation" control on the RFQ leg** (FR9; Pass-2 §4.2; R6) — and (b) **raises the FR8/Pass-1-§2.x vs Pass-2-§4.2 tension as a carried `[ESC-7-7F-INVITE]` Flag-and-Halt**, presenting the *form* of buyer vendor-targeting (candidate expression vs none) as an **open carried question**, not a settled absence. See §6.2.

---

## 1. Design thesis / executive summary

### 1.1 The buyer's job-to-be-done

The iVendorz Buyer Workspace (Surface F, Doc-7F) is the cockpit for an **industrial procurement officer** at a Bangladeshi factory, plant, or EPC contractor. Their job is a governed loop: **Discover → Compare → Procure → Manage**. They research who can supply or fabricate what they need; they author a structured RFQ; they observe the platform route it to suppliers; they compare the quotations that come back; they award **exactly one**; and they run the post-award order through to completion — all while keeping a private record of which vendors they trust, and which they will never work with again.

### 1.2 The moat as a UX stance — *"the platform dispatches the invitations; the buyer decides the award; the UI never decides"*

The defensible core of iVendorz is the **governed RFQ→quote→award engine (M3)** plus the **post-award workflow and private vendor CRM (M4)**. That moat is only as strong as the discipline of the surface that exposes it. Three sentences govern every screen in this document:

- **The platform dispatches the invitations.** The buyer expresses *intent* through the RFQ; the M3 engine — not a buyer control on the RFQ leg — invokes matching/routing and **dispatches** invitations (Doc-7F Pass-2 §4.2). There is **no engine-bypass "dispatch invitation" control on the RFQ leg.** *(Whether discovery surfaces any buyer candidate-targeting affordance is a carried `[ESC-7-7F-INVITE]` question — §0.3, §6.2; until resolved this design ships no such control.)*
- **The buyer decides the award.** `award_rfq` is an explicit, deliberate, **unranked, 1:1** choice. The comparison view is decision *support*, never a recommendation.
- **The UI never decides.** No surface — and no AI panel — auto-recommends, auto-ranks-to-winner, or auto-selects a vendor or quotation (Invariant #12). The UI displays governance signals read-only and never re-ranks the engine's governed **matching/routing** order (Invariant #9 / GI-04). *(Buyer-chosen comparison sorting and the buyer-private Approved-vendor float are governed, contract-applied, buyer-scoped behaviors the frozen corpus explicitly permits — §6.1.)*

### 1.3 Design principle — *"Industrial Precision, Human Clarity"*

Procurement officers move large sums against dense, multi-criteria data, often from a factory floor on a phone. The design answer is **Industrial Precision, Human Clarity**: tabular-aligned numerics, unambiguous state chips, friction-by-design at irreversible moments (award, blacklist, payment confirm), and progressive disclosure that reduces density **without ever hiding a required, safety, or compliance fact**. Precision earns trust; clarity prevents the mis-tap that the moat's guardrails forbid.

---

## 2. Roles & method

### 2.1 The four lenses

This deliverable is assembled from four role lenses, each grounded independently and then reconciled by a lead editor:

| Lens | Role | Contribution (sections) |
|---|---|---|
| A/B/C | **Enterprise Frontend Architect** | Information architecture, navigation model, template→page map, data-flow architecture (§3, §4, §11) |
| D/E/F | **Procurement Domain Expert** | The RFQ workflow as a procurement job, state→screen map, guardrails-in-UX, edge cases (§5, §6, §7) |
| G/H | **Senior React Engineer** | Per-screen specifications (P-BUY-01..27), component mapping, data architecture (§10, §11) |
| I/J | **UX Designer** | Screen-flow journey diagrams, dashboard composition, interaction & accessibility design (§8, §9) |

### 2.2 Conformance posture

- **Reference-never-restate.** Every contract, route, RFQ/quotation/engagement state, screen key (`P-BUY-*`), template (`T-*`), GI convention (`GI-01..12`), POLICY key, and token (`--iv-*`) is bound **by pointer** to the grounding and the frozen corpus. No identifier is copied speculatively or invented. **All buyer-leg contract slugs in this document are the verbatim frozen Doc-5D/5E/5F names** (e.g. CRM = `set_buyer_vendor_status`/`get_private_vendor`; post-award docs = `issue_engagement_document`/`get_engagement_document`; award gate slug = `can_award_rfq`) — verified against Doc-7F Pass-3 §8.1, Doc-5F Pass-1 §2.2/§2.3, Doc-5E §2, and Doc-4M lines 205/231.
- **Coins nothing.** Where a genuine capability gap exists (e.g. a client upload-grant contract), it is carried as an **existing** `[ESC-7-*]` handle from the ESC registry — never papered over with an invented contract, route, field, permission slug, POLICY key, or component (§13).
- **Validate-Findings gate (CLAUDE.md §13).** Any finding raised against this companion is adjudicated against the four questions — Valid? · Applicable? · Best for the product? · Consistent with the frozen corpus? A finding that conflicts with a frozen document triggers **Flag-and-Halt**, not a local fix.
- **Authoritative topology caveat.** Route strings shown throughout are *illustrative routing vocabulary* over **opaque UUIDs**; the authoritative topology is Doc-7C/Doc-7F. The load-bearing facts are the **screen→contract bindings**, the **opaque-ID rule**, and the **state-machine gating** — not literal path strings. Human refs (`RFQ-2026-000123`) are **display labels only**, never URL identifiers.

---

## 3. Buyer Dashboard Information Architecture

### 3.1 Sitemap (IA tree — the four top-level sections)

The Buyer Workspace (Surface F, Doc-7F) mounts in the Doc-7C `(app)` route group under the **server-resolved active org**. Its sidebar (labelled **"Procurement"**) resolves to four navigable sections. Every leaf binds a frozen Doc-5E/5F/5D buyer-leg contract **by pointer** (verbatim frozen slugs); presentation routes carry **opaque UUIDs**, never human refs. The "screen key" column is the Doc-7F realized page (`P-BUY-*`); the "template" column is its `T-*`.

```
BUYER WORKSPACE  (Surface F · (app) · org-scoped · Buyer/Hybrid)
│
├─ 1. VENDOR DISCOVERY & SOURCING            [research/reference for RFQ authoring — engine dispatches invitations]
│   ├─ P-BUY-02  Discover vendors            T-LISTING   search_catalog · list_vendor_directory (Doc-5D)
│   ├─ P-BUY-03  Vendor directory (in-app)   T-LISTING   list_vendor_directory (Doc-5D)
│   ├─ P-BUY-04  Vendor profile (in-app)     T-DETAILS   get_vendor_profile (Doc-5D, User leg) + trust-badge (M5, read-only)
│   └─ P-BUY-05  Favorites                    T-LISTING   list_catalog_favorites · add_catalog_favorite · remove_catalog_favorite (BC-MKT-7)
│
├─ 2. RFQ MANAGEMENT                          [the moat author-side: author → approve → observe → compare → award]
│   ├─ P-BUY-06  RFQ list                     T-LISTING   list_rfqs (Doc-5E) · cursor pagination
│   ├─ P-BUY-07  RFQ create wizard            T-WIZARD    create_rfq → update_rfq → submit_rfq (resumable draft)
│   ├─ P-BUY-12  Internal approval            T-MANAGEMENT approve_rfq · reject_internal_rfq (Doc-5E)
│   └─ RFQ DETAIL  (P-BUY-08 is the host)     T-DETAILS   get_rfq (Doc-5E)
│       ├─ tab: Overview      → P-BUY-08      (status · lifecycle actions · timeline)         get_rfq
│       ├─ tab: Quotations    → P-BUY-09      T-LISTING   list_quotations_for_rfq (visibility-gated)
│       ├─ tab: Activity      → P-BUY-10      (routing/audit timeline, M0)
│       ├─ sub: Version hist.  → P-BUY-11     T-DETAILS   get_rfq_version (Invariant #8)
│       ├─ sub: Routing log    → P-BUY-13     T-LISTING   get_routing_log · list_invitations (caller-leg)
│       ├─ sub: Quotation detail → P-BUY-14   T-DETAILS   get_quotation (visibility-gated)
│       ├─ sub: Comparison     → P-BUY-15     T-ANALYTICS get_comparison_statement (read-only, System-gen, R6)
│       ├─ sub: Clarifications → P-BUY-16     T-DETAILS   manage_clarification · invoke_best_and_final (+ M6 thread, Doc-5H)
│       ├─ act: Award          → P-BUY-17     T-WIZARD    award_rfq (explicit · unranked · 1:1 · Doc-5E)
│       └─ act: Close lost     → P-BUY-18     T-DETAILS   close_lost_rfq (non-penalizing)
│
├─ 3. POST-AWARD OPERATIONS                   [records/workflow only — NO settlement, R8]
│   ├─ P-BUY-19  Engagements                  T-LISTING   list_engagements (Doc-5F buyer-leg)
│   └─ ENGAGEMENT DETAIL  (P-BUY-20 is host)  T-DETAILS   get_engagement + get_engagement_document
│       ├─ tab: Overview      → P-BUY-20      states: open → in_delivery → completed → closed (Doc-4F/Doc-2 §3.5 — §0.1)
│       │                                     update_engagement_status · close_engagement · record_buyer_feedback
│       ├─ tab: Documents     → P-BUY-20      (document list → doc sub-pages)
│       ├─ tab: Payments      → P-BUY-22      T-DETAILS   record_payment · confirm_payment (records only)
│       ├─ doc: PO / LOI        → P-BUY-21    T-DETAILS   issue_engagement_document · revise_engagement_document (can_approve_po; versioned; 202/poll)
│       ├─ doc: Trade invoice  → P-BUY-23     T-DETAILS   update_trade_invoice_status · get_engagement_document (≠ platform invoice)
│       ├─ doc: Challan        → P-BUY-24     T-DETAILS   get_engagement_document (vendor records delivery; buyer reads)
│       └─ doc: WCC            → P-BUY-25     T-DETAILS   get_engagement_document (proof-of-work; Trust input)
│
└─ 4. BUYER-PRIVATE CRM                       [Invariant #11 — renders ONLY here; blacklist undetectable]
    ├─ P-BUY-26  CRM — vendor list            T-LISTING   list_private_vendors · get_private_vendor (own-org)
    └─ P-BUY-27  CRM — vendor detail          T-DETAILS   update_private_vendor · add_private_vendor_note ·
                                                          set_private_vendor_rating · set_buyer_vendor_status /
                                                          clear_buyer_vendor_status (approved/blacklisted) (BC-OPS-1)
```

> Route segments are illustrative routing vocabulary; the authoritative topology is Doc-7C/Doc-7F. The load-bearing facts are the **screen key → contract** bindings and the **opaque-ID** rule. Post-award document children (PO/LOI/challan/WCC) are all `engagement_documents` — a **single contract family** (`issue_engagement_document`/`revise_engagement_document`/`get_engagement_document`), not per-type contracts (Doc-5F §2.3; Doc-4F §F5.3/§F5.4).

### 3.2 The buyer's mental object model (five first-class objects)

The IA is organized around the procurement **job**, not around backend modules. The buyer reasons about exactly five first-class objects — three they **own/author**, two they **read** but never compute:

| # | Object | Buyer's relationship | Anchored at | Lifecycle authority |
|---|---|---|---|---|
| 1 | **RFQ** | Authors, submits, observes, awards/closes (owns the intent) | P-BUY-06/07/08…18 | Doc-4M RFQ state machine: `draft → [pending_internal_approval] → submitted → under_review → matching → vendors_notified → quotations_received → buyer_reviewing → shortlisted → closed_won \| closed_lost \| expired \| cancelled` |
| 2 | **Quotation** | Receives, reads (visibility-gated), shortlists, compares (never edits — vendor authors) | P-BUY-09/14/15 | Doc-4M quotation lifecycle; contract order is authoritative |
| 3 | **Engagement** | System-created on award; advances post-award; receives/approves docs; records payment | P-BUY-19/20…25 | states `open → in_delivery → completed → closed` per **Doc-4F §F5 / Doc-2 §3.5** (the contract authority); a dispute is a trade-invoice `→ disputed` status + `DisputeRecorded` event, **not** an engagement state (Doc-4F §F5.5). **Carried Flag-and-Halt:** Doc-4M lists `active/completed/disputed/terminated` (§0.1) |
| 4 | **Vendor [public/discovery]** | Researches, favorites, references when authoring an RFQ (read-only) | P-BUY-02/03/04 | M2-owned profile + M5 trust/perf/tier displayed read-only |
| 5 | **Vendor [private CRM record]** | Owns privately: status/notes/rating/approved/**blacklist** | P-BUY-26/27 | M4 CRM (BC-OPS-1) — `buyer_vendor_status` is buyer-private append-only history, **never** mutates platform-wide scores (§4 firewall) and **emits no event** (Doc-5F R5) |

**Objects 4 and 5 are deliberately distinct.** The same real-world vendor surfaces as a *public discovery object* (P-BUY-04, with read-only trust) and, separately, as a *private CRM record* (P-BUY-27). The CRM status is **never** shown on P-BUY-04 — the two never merge into one model (Invariant #11).

**Crucially — what the buyer does NOT own (the out-of-wire boundary, Doc-7F FR3/FR9):**

- **The matching/routing engine** — matching and routing-wave assembly are System out-of-wire. The buyer **never invokes matching/routing**; the RFQ's `under_review → matching → vendors_notified` transitions are **System-triggered, displayed not invoked**.
- **Invitation dispatch** — the engine generates and dispatches `rfq_invitations`; **the buyer never sends an invitation** and **there is no engine-bypass dispatch control on the RFQ leg** (Pass-2 §4.2; FR9). *(Carried `[ESC-7-7F-INVITE]`: the form of any buyer candidate-targeting in discovery is open — §0.3, §6.2.)*
- **The comparison statement** — generation is System (`generate_comparison_statement`, out-of-wire); the buyer reads `get_comparison_statement` only. The Admin/internal matching-results leg (`get_matching_results`) is **NOT bound** in the Buyer Workspace (FR3; anti-gaming).
- **Scores** — trust (0–100), performance (0–100), financial tier (A–E), capacity (M5/M2) are **displayed read-only**; the buyer never computes/edits them (R7 firewall).
- **Excluded vendors / the buyer's own blacklist effect on routing** — `read_crm_status_for_routing` is internal-service/out-of-wire; the frontend never calls it; the buyer sees the **positive routing outcome only** (invited vendors + reasons), never the excluded set.

### 3.3 Entry points & cross-links between sections

| From | To | Nature | Guardrail |
|---|---|---|---|
| **Discovery (P-BUY-02/04)** → **RFQ create (P-BUY-07)** | "Start an RFQ" CTA / Quick Create `New RFQ` (`create_rfq`) | **Reference.** A favorited/viewed vendor informs *what the buyer asks for*. | The buyer never dispatches an invitation; the engine routes (R6; Pass-2 §4.2). Any candidate-targeting form is `[ESC-7-7F-INVITE]`-gated (§0.3). |
| **RFQ list (P-BUY-06)** → **RFQ detail (P-BUY-08)** | Row open → detail host | — | Own-org RFQs only; opaque ID in URL. |
| **RFQ detail (P-BUY-08)** → tabs/sub-pages | Quotations (09) / Activity (10) / Versions (11) / Routing (13) / Comparison (15) / Clarify (16) | In-page tabs + contextual sub-routes | Deferral/exclusion invisible; "No invitations yet" must not imply exclusion (P-BUY-13). |
| **Comparison (P-BUY-15)** → **Award (P-BUY-17)** | "Proceed to award" navigation to a permitted transition | **No pre-selected winner.** Comparison ends; the award wizard begins as a *separate, deliberate* act. | R6: comparison never ranks-to-winner; award is its own `T-WIZARD` (Invariant #12). |
| **Award (P-BUY-17)** → **Engagement (P-BUY-20)** | On `award_rfq`, an engagement is System-created (`open`) | Award → Post-Award seam | Exactly one `selected` (1:1); split sourcing = `reissue_rfq`, never multi-award. |
| **Engagement detail (P-BUY-20)** → doc sub-pages | PO/LOI (21) / Payments (22) / Invoice (23) / Challan (24) / WCC (25) | Document drill-down | Records/workflow only; copy must not imply settlement (R8). |
| **CRM (P-BUY-26/27)** | Reachable **only** from the CRM sidebar item | Isolated section | Never linked from any vendor/discovery/engagement surface; blacklist undetectable. |

**Forbidden cross-links (must not exist):** any engine-bypass "dispatch invitation to this RFQ" control on the RFQ leg; Comparison → "award to recommended"; any vendor/discovery/engagement/notification surface → CRM status, approved/blacklist flag, or exclusion reason. These are the load-bearing *absences* the IA preserves.

---

## 4. Navigation model

### 4.1 Global shell (Doc-7C)

The buyer mounts in the **Dashboard shell**: topbar + role-scoped sidebar + content, on the Doc-7C root layout that owns the three shell slots (navigation · org-switcher · notification center). Layouts and the frame are Server Components; only the interactive controls below are Client Components holding ephemeral UI state.

**Topbar (left → right):**

| Slot | Content | Binding / owner |
|---|---|---|
| **Org-switcher** | Active org + switch list | Doc-7C-owned. List via `list_my_organizations`; switch via `switch_active_organization`; on switch the shell re-resolves `get_active_context`, re-derives the navigable set, and re-renders (not a header swap). **Active org is server-validated via `Iv-Active-Organization`; the browser never sets it** (Inv #5). |
| **Quick Create** `+ Create ▾` | Role-scoped create actions | For Buyer: **`New RFQ` → `create_rfq`**. `Invite Team Member → invite_member` (org members, **not** vendors). **No engine-bypass "dispatch invitation to RFQ" item exists.** |
| **⌘K Command Center** | Search · Navigate · Run wired command · Ask AI | Gating mirrors nav derivation; never offers a non-entitled destination or a non-disclosable entity. |
| **Global search** | Context-aware scoped search | Buyer scope binds `list_rfqs`, `list_quotations_for_rfq` (visibility-gated), `search_catalog`/`list_vendor_directory`, post-award doc reads. Search is presentation — **never re-ranks governed M3 matching/routing** (GI-04). |
| **Notifications** | Bell + unread count | Doc-7C shell slot rendering M6 (Doc-5H) reads; non-disclosure-bound; Realtime = transport → re-fetch. The count itself must be non-disclosure-safe (no excluded/CRM signal). |
| **User menu** | Account · security/2FA · theme · logout | Distinct from org-switcher; account screens live in Surface E. |

**Role-scoped sidebar nav groups ("Procurement"):** items are derived from server-resolved participation (Buyer/Hybrid) + org role, gated by entitlement/permission **read via wired contracts, never name-strings** (Inv #10). Hiding a link is convenience only — the server re-validates every action (Inv #7).

| Sidebar group | Items → page | Section (§3.1) |
|---|---|---|
| **Overview** | Dashboard → **P-BUY-01** (`T-DASHBOARD`) | dashboard home |
| **Sourcing** | Discover → P-BUY-02 · Favorites → P-BUY-05 | Vendor Discovery & Sourcing |
| **RFQs** | RFQs → P-BUY-06 · Approvals → P-BUY-12 | RFQ Management |
| **Operations** | Engagements → P-BUY-19 | Post-Award Operations |
| **Private** | Vendor CRM → P-BUY-26 | Buyer-Private CRM |

(Master Navigation Matrix — Buyer left nav: Dashboard · Discover · Favorites · RFQs · Approvals · Engagements · Vendor CRM.) For a **Hybrid** org, the shell additionally mounts the Vendor (7G) groups under one org, clearly sectioned "Procurement" / "Selling" (Inv #2) — the buyer leg is unchanged.

### 4.2 Secondary & contextual navigation

The deep RFQ workflow is reached through **in-page tabs** (presentation, not routing-critical) on the detail host plus **contextual sub-routes** for the heavier facets:

- **RFQ-detail tab set** (host P-BUY-08, `T-DETAILS` hero + tabs): **Overview** (P-BUY-08) · **Quotations** (P-BUY-09) · **Activity** (P-BUY-10).
- **RFQ-scoped sub-pages** reached *from* the detail/its tabs (contextual nav class): **Version history** (P-BUY-11, from Overview) · **Routing log / invitations** (P-BUY-13, from Activity) · **Quotation detail** (P-BUY-14, from Quotations) · **Comparison** (P-BUY-15, from the Quotations toolbar "Compare") · **Clarifications + best-and-final** (P-BUY-16) · **Award** (P-BUY-17, a deliberate `T-WIZARD` act) · **Close lost** (P-BUY-18). Comparison and award are intentionally *not* tabs — they are separate destinations so award stays a deliberate, unranked act (R6).
- **Engagement-detail tab set** (host P-BUY-20, `T-DETAILS`): **Overview** · **Documents** · **Payments**. The Documents tab drills to PO/LOI (P-BUY-21) · Trade invoice (P-BUY-23) · Challan (P-BUY-24) · WCC (P-BUY-25); the Payments tab hosts P-BUY-22.
- **Breadcrumbs:** `Section / List / Item`, e.g. `RFQs / RFQ-2026-000123 / Comparison`. The leaf label is the human ref from contract data; **the URL still carries the opaque UUID.** Breadcrumbs are **non-disclosure-safe** — never expose a parent the buyer may not see.
- **Notification center role:** the cross-cutting wayfinding back into work — an M6 notification (quotation received, internal-approval requested) deep-links to the relevant detail. It surfaces only what the wired M6 read discloses; it can never reveal a CRM/exclusion signal.

### 4.3 Responsive navigation (GI-07)

The shell degrades **sidebar → icon rail → drawer** as the viewport narrows; the deep RFQ workflow degrades via per-template `MB-*` presets:

| Tier | Sidebar | Topbar | Buyer deep-workflow behavior |
|---|---|---|---|
| **Mobile `< sm`** | Off-canvas **drawer**; org-switcher moves into the drawer header | Compact: logo · search icon · ⌘K · bell · avatar | `MB-DETAIL`: RFQ-detail tabs → **accordion**; right-rail meta → **bottom sheet**; sticky primary state-machine CTA. `MB-WIZARD`: RFQ create / award = **one step per screen** + sticky Next/Back + compact stepper. Lists (`MB-LIST`): `data-table` → stacked cards or `--iv-table-min` h-scroll; filters → **filter sheet**; pinned ref column. |
| **Tablet `md–lg`** | **Icon rail** (`--iv-sidebar-collapsed` 64px), expandable | Full | Two-pane where useful; comparison h-scrolls. |
| **Laptop `lg–xl`** | Full sidebar (`--iv-sidebar-width` 264px) | Full | Multi-column. |
| **Desktop `xl–2xl`** | Full sidebar | Full | **Primary target** — full density, right rail, the 24-col comparison matrix (P-BUY-15 is desktop `D` only). |

**Comparison (P-BUY-15) is desktop-primary** (`D`-only): the 24-col matrix uses column-pin/h-scroll below `xl` and degrades to stacked per-quotation cards (criteria as rows) below `lg` — but **never** introduces a "recommended" cue at any breakpoint (R6); buyer-chosen sort and Approved-vendor float remain the governed, contract-applied orderings (§6.1). The mobile drawer always closes on navigate; touch targets and focus order meet the a11y baseline (GI-06).

---

## 5. The RFQ workflow — the procurement journey (the moat)

> **Inherits:** GI conventions · the Doc-4M RFQ state machine · J-PROC-01..14 (the procurement journey) · the P-BUY screen set. **Scope:** the buyer leg only; vendor-side states and the engine's internal pipeline are observed, never driven, here. **Conforms upward; coins nothing.**

### 5.1 The procurement journey, told as a procurement officer's job

This is the moat: the governed RFQ→quote→award→post-award loop a factory or EPC procurement officer actually runs, bound step-for-step to J-PROC and the Doc-4M state machine.

**J-PROC-01 — Sourcing / discovery (state: none yet).** *Job: "Who can supply this? Have I worked with them? Are they credible?"* The officer browses the in-app vendor directory and catalog (P-BUY-02/03/04), reading the **4-flag capability matrix** (`can_supply`/`can_service`/`can_fabricate`/`can_consult` — Invariant #1), the read-only **trust ring** and **financial tier** (M5-owned, displayed never computed — R7), and saving candidates to **Favorites** (P-BUY-05). Discovery search/sort is presentation and **never re-ranks M3 matching** (GI-04). The officer forms intent here; **the buyer never invokes matching/routing and never dispatches an invitation** (R6; Pass-2 §4.2) — *the form of any buyer candidate-targeting is a carried `[ESC-7-7F-INVITE]` question (§0.3), and this design ships no engine-bypass dispatch control.* Buyer-private CRM status is **never rendered on discovery** even though it is the same vendor (Invariant #11).

**J-PROC-02 — Author the RFQ (state: `draft`).** *Job: "Specify what I need, by when, at what budget, with what specs and attachments."* The officer opens the **RFQ create wizard** (P-BUY-07, `T-WIZARD`), a resumable draft persisted through `create_rfq` → `update_rfq` (never browser-local state — GI-02). Line items carry `{amount, currency}`, BDT default (GI-08); attachments resolve to Storage `file_ref` (GI-09; upload-grant gap = `ESC-7-API/upload`). If an `ai-advisory-panel` is present it may **draft or explain only** — the officer confirms and the module commits; it never auto-submits (GI-11; Invariant #12).

**J-PROC-03 — Submit (transition out of `draft`).** *Job: "Send this for sourcing."* `submit_rfq` moves the RFQ to **`pending_internal_approval`** *or* directly to **`submitted`** via the self-approve path when the officer holds `can_approve_rfq`. The wizard offers only the machine-permitted next action (GI-10); a stable idempotency key guards the submission.

**J-PROC-04 — Internal spend approval (state: `pending_internal_approval`).** *Job (the approver's): "Is this spend authorized?"* A Director/Manager works the approval queue (P-BUY-12, `T-MANAGEMENT`): `approve_rfq` → `submitted`, or `reject_internal_rfq` (**mandatory reason**) → back to `draft`; the requester may also `cancel_rfq` (audited reason) → `cancelled` (Doc-4M line 198). There is **no auto-approve timeout** (Doc-3 §1.2) — an unapproved RFQ simply waits. This is the org's own governance gate, distinct from platform moderation.

**J-PROC-05 / 06 — Engine routes (states: `under_review` → `matching` → `vendors_notified`, all System-driven).** *Job: none — the officer waits and observes.* Admin/System moderates (`moderate_rfq`: pass → `matching`, reject → `draft`), then the M3 matching pipeline and routing waves run out-of-wire and **the engine dispatches invitations to vendors** (R6; Pass-2 §4.2). `matching` is an internal state. There is **no buyer control** in any of these states.

**J-PROC-07 — Observe routing (state: `vendors_notified`).** *Job: "Is my RFQ live and reaching suppliers?"* The officer reads the routing log / invitations (P-BUY-13) and the RFQ activity tab (P-BUY-10) — both **read-only**. Routing **deferral is invisible** to the buyer and **no excluded/deferred vendor is ever shown** (Doc-3 §4.2; Invariant #11). An empty routing list reads as "no invitations yet," never "vendor X was excluded."

**J-PROC-08 — Quotations arrive (state: `quotations_received`).** *Job: "What did suppliers offer?"* The first vendor quote transitions the RFQ to `quotations_received`. The officer reads the quotations list (P-BUY-09) and individual quotations (P-BUY-14). Visibility is **server-gated** — only disclosed quotations appear, and the **contract's order is authoritative; the UI never re-ranks the governed matching set** (R6/GI-04). **Cross-vendor isolation** holds: a quotation outside the buyer's `quotation_visibility` scope collapses to `NOT_FOUND`, and one vendor's quotation never exposes another vendor's values to *that vendor* (Doc-5E R5). The buyer, having received these quotations to its own RFQ, legitimately sees each disclosed quotation's actual quoted values (Doc-3 §9.1).

**J-PROC-09 — Compare (state: `buyer_reviewing`).** *Job: "Line these up so I can decide."* Opening the comparison transitions the RFQ to `buyer_reviewing`. The **comparison statement** (P-BUY-15, `T-ANALYTICS`, `get_comparison_statement`) is **read-only, System-generated decision support**. It presents each **disclosed** quotation's actual values side by side — per Doc-3 §9.1 the rows are **price (normalized), delivery, validity, warranty, spec-compliance declarations, vendor standing** (trust band / performance badge / verification depth / tier), plus **buyer-private columns** (the buyer's own CRM status/notes, visible only to the buyer). Default sort is **buyer-chosen**, and **Approved vendors float** in Approved-inclusive modes (Doc-3 §9.1, §7.5) — a governed, contract-applied, **buyer-private** ordering. The view has **no "recommended" affordance of any kind** (R6; Invariant #12): decision *support*, never a recommendation.

**J-PROC-10 — Clarify / best-and-final (state: `buyer_reviewing`).** *Job: "Ask a question; request sharpened pricing."* The officer runs a clarification thread (P-BUY-16, `manage_clarification` + M6 conversation-thread). Per Doc-3 §9.3, the buyer may open a **best-and-final round** via the frozen buyer command **`invoke_best_and_final`** (round cap = POLICY `eval.baf_rounds_max`, start 1); all shortlisted vendors are simultaneously invited to a final sealed revision with a common deadline, **visible to all invitees** — no private extensions (Doc-3 §5.4/§9.3). Quotation revisions independently carry a soft-cap (POLICY `quote.max_revisions`).

**J-PROC-11 — Shortlist (transition to `shortlisted`).** *Job: "Narrow to finalists."* `shortlist_quotation` (P-BUY-14) marks quotations `shortlisted` and moves the RFQ to `shortlisted`. Shortlist depth carries a soft-cap (POLICY `eval.shortlist_max`, start 5). *(Doc-5E names no distinct shortlist permission slug; this design binds the action by pointer to `shortlist_quotation` and states no coined slug — Doc-5E §6.)*

**J-PROC-12 — Award (transition `shortlisted` → `closed_won`).** *Job: "Pick the winner. Make it official."* The **Award wizard** (P-BUY-17, `award_rfq`) is the single most governance-load-bearing screen. It is an **explicit, deliberate, UNRANKED, 1:1 choice** gated on **`can_award_rfq`** (Doc-4M line 205; Doc-3 §9.4) — exactly **one** quotation becomes `selected`, all others `not_selected`, and an **engagement** is created (`open`) atomically (Doc-3 §9.1/§9.4; R6). Award value is **snapshotted immutably**. If the value exceeds the org's configured threshold, **Director/Owner award-threshold approval** is required (Doc-3 §9.4). **Split sourcing is `reissue_rfq`, never multi-award.**

**J-PROC-12b — Or close lost (transition to `closed_lost`).** *Job: "None of these; close cleanly."* `close_lost_rfq` (P-BUY-18) closes the RFQ uniformly and **non-penalizingly** to vendors (Doc-3 §9.5). Closure copy and behavior are byte-equivalent regardless of *why* — no vendor learns they "lost."

**J-PROC-13 — Post-award engagement, docs, delivery, payment (engagement: `open → in_delivery → completed → closed`, per Doc-4F/Doc-2 §3.5 — §0.1).** *Job: "Run the order: PO, receive goods, check invoice, record payment, certify completion."* The engagement hub (P-BUY-19/20) advances the engagement via `update_engagement_status`/`close_engagement` and links the post-award documents — all **`engagement_documents`**: **PO/LOI** (P-BUY-21, `issue_engagement_document`/`revise_engagement_document`, PO needs `can_approve_po`, versioned, **202-then-poll**), **delivery/challan** (P-BUY-24, `record_delivery` emits `DeliveryRecorded`; read via `get_engagement_document`), **WCC** (P-BUY-25, `issue_engagement_document` `doc_kind=wcc` emits `WorkCompletionIssued`; read via `get_engagement_document`), **trade invoice review** (P-BUY-23, `update_trade_invoice_status`, `→ disputed` emits `DisputeRecorded`; read via `get_engagement_document`), **payments** (P-BUY-22, `record_payment`/`confirm_payment`, `confirm` needs `can_approve_payment`), plus **buyer feedback** (`record_buyer_feedback`, perf input). Every one is a **record/workflow, never settlement** — the platform moves **no money** (R8). The **trade invoice is not the platform billing invoice** (DF-6).

**J-PROC-14 — CRM (buyer-private, state: none).** *Job: "Capture how this vendor performed, for my eyes only."* The buyer's **private CRM** (P-BUY-26/27) records status, notes, rating, approved/blacklist via the BC-OPS-1 verbs (`update_private_vendor`, `add_private_vendor_note`, `set_private_vendor_rating`, `set_buyer_vendor_status`/`clear_buyer_vendor_status`) — **buyer-private, never leaking** to any vendor surface, count, notification, analytic, or error; **blacklist is undetectable** (Invariant #11; §4 firewall). `set_buyer_vendor_status` is **append-only history and emits no event** (Doc-5F R5). Approved/Blacklisted **never mutates platform-wide scores**.

### 5.2 State → Screen map (every Doc-4M RFQ state)

"Driver" = the actor who transitions the RFQ *out* of the state. **System-driven states are observe-only on the buyer leg.**

| Doc-4M state | Renders on (P-BUY) | Driver out of state | Buyer CAN | Buyer CANNOT |
|---|---|---|---|---|
| `draft` | P-BUY-07 wizard; P-BUY-08 overview | **Buyer** (`submit_rfq`) / Buyer (`cancel_rfq`) | edit, save draft, submit, cancel | dispatch an invitation; skip approval if no `can_approve_rfq` |
| `pending_internal_approval` | P-BUY-12 approval queue; P-BUY-08 | **Buyer-approver** (`approve_rfq` → `submitted`; `reject_internal_rfq` → `draft`); Buyer (`cancel_rfq` → `cancelled`, audited) | approve / reject (reason); self-approve if `can_approve_rfq`; cancel (audited reason) | auto-approve (no timeout); edit RFQ content |
| `submitted` | P-BUY-08 (status chip) | **System** (moderation → `under_review`); Buyer (`cancel_rfq`) | observe; cancel | influence moderation |
| `under_review` *(System — observe-only)* | P-BUY-08; P-BUY-10 activity | **System/Admin** (`moderate_rfq`: pass → `matching`, reject → `draft`); Buyer (`cancel_rfq`) | observe status; cancel | moderate; route; dispatch invitation |
| `matching` *(System, internal — observe-only)* | P-BUY-08 (status only) | **System** (routing wave → `vendors_notified`); Buyer (`cancel_rfq`) | observe; cancel | see matched/excluded vendors; re-rank; dispatch invitation |
| `vendors_notified` *(System — observe-only)* | P-BUY-08; P-BUY-13 routing log; P-BUY-10 | **System** (first quote → `quotations_received`); Buyer (`cancel_rfq`); System (`expire_rfq`) | observe invitations/waves; cancel | see deferred/excluded vendors; dispatch invitation; force a quote |
| `quotations_received` | P-BUY-09 quotations; P-BUY-14 quotation detail | **Buyer** (open compare → `buyer_reviewing`); Buyer (`cancel_rfq`) | read disclosed quotations; clarify; cancel | re-rank the governed matching set; see a quotation outside `quotation_visibility` |
| `buyer_reviewing` | P-BUY-15 comparison; P-BUY-16 clarifications; P-BUY-14 | **Buyer** (`shortlist_quotation` → `shortlisted`); Buyer (`cancel_rfq`) | compare (read-only; buyer-chosen sort + Approved float), clarify, `invoke_best_and_final`, shortlist | get an auto-recommended winner; award directly without shortlist path |
| `shortlisted` | P-BUY-17 award; P-BUY-18 close-lost; P-BUY-15 | **Buyer** (`award_rfq` → `closed_won`, `can_award_rfq`; `close_lost_rfq` → `closed_lost`); Buyer (`cancel_rfq`) | award (1:1, unranked, deliberate); close lost | multi-award; auto-select; bypass threshold approval |
| `closed_won` *(terminal)* | P-BUY-08; engagement P-BUY-19/20 | — (terminal; recovery = `reissue_rfq`) | run post-award ops; reissue (new RFQ, links source) | reopen; change the awarded vendor |
| `closed_lost` *(terminal)* | P-BUY-08; P-BUY-18 | — (terminal; recovery = `reissue_rfq`) | reissue | reopen; penalize vendors |
| `cancelled` *(terminal)* | P-BUY-08 | — (terminal; cascade open quotations/invitations → `expired`) | reissue | reopen |
| `expired` *(terminal, System)* | P-BUY-08 | **System** (`expire_rfq`); cascade as above | reissue | reopen; blame vendors |

> **Cascade & finality:** `cancel_rfq` / `expire_rfq` cascade any open quotations + invitations to `expired` **in the same transaction**; terminals **never reopen** — the only forward path is `reissue_rfq`, which starts a fresh `draft` linked to the source (Doc-4E §E4.7). No `RFQCancelled` event is coined.
>
> **Engagement state map (P-BUY-19/20) — pending reconciliation (§0.1):** per the contract authority (Doc-4F §F5 / Doc-2 §3.5) the engagement renders `open → in_delivery → completed → closed`, driven by `update_engagement_status`/`close_engagement`; dispute is a trade-invoice `→ disputed` status + `DisputeRecorded` event, not an engagement state (Doc-4F §F5.5). Doc-4M's engagement row lists `active/completed/disputed/terminated` — a carried Flag-and-Halt; the P-BUY-20 state-chip enum is finalized only after reconciliation.

### 5.3 Quotation lifecycle from the buyer's view

Canonical quotation states: `draft → submitted` · `submitted → submitted (new version)` · `→ withdrawn` · `→ shortlisted` · `→ selected` · `→ not_selected` · `→ expired`. The buyer authors **none** of these except `shortlisted`/`selected` (indirectly, via RFQ-level commands); `draft`/`submitted`/`withdrawn`/`expired` are **vendor- or System-driven and observed**.

| Quotation state | Buyer sees it on | Buyer's permitted action | Notes (governance) |
|---|---|---|---|
| `submitted` (incl. revised versions) | P-BUY-09 list; P-BUY-14 detail | open, clarify (P-BUY-16), `shortlist_quotation` | order is the contract's governed set — **never re-ranked** (R6); buyer-chosen sort/Approved float are governed views (§6.1); revisions are immutable new versions (Invariant #8) |
| `withdrawn` *(vendor-driven — observe-only)* | P-BUY-09 (status chip) | none on the quotation | withdraw = **zero vendor penalty** (Doc-3 §8.3); may trigger invisible replenishment |
| `shortlisted` | P-BUY-09/14; P-BUY-15 comparison | proceed to `award_rfq` or `close_lost_rfq` | shortlist soft-cap POLICY `eval.shortlist_max` (start 5) |
| `selected` *(set by `award_rfq`)* | P-BUY-17 confirmation; P-BUY-09 | none further (award is terminal) | **exactly one** per RFQ (1:1); value snapshotted immutably |
| `not_selected` *(set by `award_rfq`)* | P-BUY-09 (status chip) | none | uniform, **non-penalizing**; vendor never sees competitor data or "why" (Doc-3 §9.5) |
| `expired` *(System-driven — observe-only)* | P-BUY-09 (status chip) | none | from RFQ cancel/expire cascade or window lapse |

---

## 6. Decision points & guardrails-in-UX

> Each guardrail names **the UX affordance that enforces it** and **the anti-pattern it forbids.** Bound to the GI conventions, R6/R7/R8 (Doc-5E/5F FROZEN structure rules), and the moat rails.

### 6.1 R6 — No auto-decision; no recommended winner; award is unranked & deliberate

*Frozen anchor: Doc-5E R6 + Doc-3 §9.1 — "the platform never auto-recommends a winner pre-award (decision-support, not decision); award is an explicit buyer command (`award_rfq`); no auto-award, auto-rank-to-winner, or recommendation endpoint."*

- **Affordance that enforces it:** the **comparison statement** (P-BUY-15) renders each disclosed quotation's real values (Doc-3 §9.1 row set) with **no "recommended" / "best value" / "top pick" cell, badge, sort-to-winner, or highlight** — "no 'recommended' affordance exists." **What IS sanctioned and must work:** the default sort is **buyer-chosen** and **Approved vendors float** in Approved-inclusive modes (Doc-3 §9.1, §7.5) — a governed, **server/contract-applied, buyer-private** ordering, *not* a UI-generated re-rank and *not* a "recommended winner." The **Award wizard** (P-BUY-17) requires a **single explicit selection** through a review→confirm stepper with an irreversible-action warning. Any `ai-advisory-panel` may **explain, never rank-to-winner or auto-select** (GI-11).
- **Anti-pattern forbidden:** a "Recommended supplier" banner; a default-selected quotation in the award step; a *client-side* re-rank of the **governed M3 matching/routing** order; an AI panel that says "choose vendor X." The presentation never re-ranks the governed matching set (Invariant #9 / GI-04) — but it **must not** suppress the frozen-sanctioned buyer-chosen sort or Approved-vendor float (the precise scope of GI-04 is the M3 matching/routing order and the recommendation cue, not buyer-scoped comparison sorting).

### 6.2 Buyer-never-dispatches — invitation dispatch is engine-only; routing observe-only, positive-only

*Frozen anchor: Doc-7F Pass-2 §4.2 — the buyer "never invokes matching/routing and never sends an invitation"; FR9; Doc-3 §4.2 — deferral invisible. **Carried `[ESC-7-7F-INVITE]`:** Doc-7F FR8 / Pass-1 §2.1/§2.3 ("vendor discovery to invite"; "the buyer chooses whom to invite") vs Pass-2 §4.2 ("never sends an invitation") — §0.3.*

- **Affordance that enforces it (load-bearing, unambiguously frozen):** there is **no engine-bypass "dispatch invitation to this RFQ" control** on the vendor profile (P-BUY-04), on discovery (P-BUY-02/03), in Favorites (P-BUY-05), or anywhere on the RFQ leg. The buyer **never invokes matching/routing and never sends an invitation**; the engine dispatches invitations per governed routing (Pass-2 §4.2). The routing log (P-BUY-13) is **read-only** and shows **only positive facts** — invitations issued and their responses — never an exclusion or deferral.
- **Carried question (not settled here):** *whether discovery exposes a buyer "candidate-targeting / nominate for sourcing" affordance that feeds RFQ intent* is the `[ESC-7-7F-INVITE]` Flag-and-Halt (FR8/Pass-1 "to invite" vs Pass-2 "never sends an invitation"). Until the Board reconciles, this design ships **no** such control and treats discovery as research/reference; the absence is presented as a *carried open item*, not asserted as settled frozen law.
- **Anti-pattern forbidden:** any control that lets the buyer *dispatch* an invitation directly (bypassing the engine); a routing view that lists "vendors excluded / deferred / not matched"; an empty routing state that implies exclusion. Empty must read "No invitations yet" and "must not imply exclusion."

### 6.3 R7 — Firewall; quota is a delivery ceiling, never an eligibility gate

*Frozen anchor: Doc-5E R7 — "no plan/payment/entitlement value is ever a wire input to matching/routing/selection; payment never influences eligibility, scores, confidence, or fairness. Billing quota is read as a delivery ceiling / consumed at submission."*

- **Affordance that enforces it:** governance signals (trust ring, performance, financial tier) display as **read-only M5-owned values** (P-BUY-04, P-BUY-15 vendor-standing rows) — the UI **displays, never computes or edits** them. Any billing/quota surfacing uses `billing-indicator` showing **boolean/numeric/enum, never a plan-name** (Invariant #10) and appears only at **delivery/submission** points, never on a vendor card or comparison cell.
- **Anti-pattern forbidden:** an "Excluded by quota" / "Upgrade plan to see this vendor" label; a comparison that grays out or down-ranks a quotation because of the buyer's plan; a trust/tier value the buyer can edit. Payment state must never touch matching, selection, or who appears.

### 6.4 R8 — Money boundary; records not settlement; trade invoice ≠ billing invoice

*Frozen anchor: Doc-5F R8 / DF-6 — "records only, no funds movement … `operations.trade_invoices` ≠ `billing.platform_invoices`."*

- **Affordance that enforces it:** PO/LOI (P-BUY-21, `issue_engagement_document`), payments (P-BUY-22, states `recorded → confirmed`), and trade invoice (P-BUY-23, `update_trade_invoice_status`, states `issued → partially_paid → paid | disputed | cancelled`) are **document/workflow surfaces**. Payment copy **"must not imply settlement"** — it records that a payment happened off-platform. The **trade invoice (P-BUY-23) is visually and navigationally distinct from the platform invoice (P-ACC-20/21)** — different surface (Buyer workspace vs Account/Billing), different contract (`get_engagement_document` vs `get_platform_invoice`), and is explicitly "≠ `billing.platform_invoices`, no funds custody" (Doc-4F §F5.5, line 336).
- **Anti-pattern forbidden:** a "Pay now" / "Release funds" / "Escrow" button; a wallet balance; merging trade and platform invoices into one ledger; any UI implying the platform holds or moves buyer↔vendor money.

### 6.5 Invariant #11 — Buyer-private CRM; blacklist undetectable; byte-equivalence

*Frozen anchor: Invariant #11 / Doc-5F R5 / CHK-7-040/041 — non-disclosure & byte-equivalence; `set_buyer_vendor_status` append-only, never evented; `read_crm_status_for_routing` is internal-service/out-of-wire.*

- **Affordance that enforces it:** CRM status/notes/rating/approved/**blacklist** render **only** in the buyer's own workspace (P-BUY-26/27) — and, as buyer-private columns, inside the buyer's own comparison (P-BUY-15, Doc-3 §9.1). On discovery (P-BUY-02), the same vendor shows **no CRM status**; on the in-app vendor profile (P-BUY-04), buyer-private CRM status is **NOT shown**. The frontend **never calls `read_crm_status_for_routing`** — it is internal-service only. Setting a `buyer_vendor_status` **emits no event** and is append-only history (Doc-5F R5). Blacklisting a vendor changes **nothing** observable to that vendor: not their invitations, quotations, counts, notifications, analytics, or error pages (byte-equivalence). A protected-fact-gated read collapses to a uniform `NOT_FOUND` identical in status, body, and timing to genuine absence (Doc-5F §3.5; GI-05).
- **Approved-vendor float containment (the §6.1 buyer-private ordering):** the Approved-vendor float and any Approved/Conditional column on P-BUY-15 are **buyer-org-private** (Doc-3 §7.5 — "never crosses tenants, never feeds platform scores, never affects other buyers' routing"); they are never emitted to a vendor surface, count, notification, or analytic; the vendor's experience stays byte-identical.
- **Anti-pattern forbidden:** a blacklist/Approved badge on a shared/vendor-visible surface; a CRM status leaking into a notification, win-rate, count, facet, or error message; a vendor inferring exclusion from any timing/copy difference; a coined `crm.*` status event; the frontend reading CRM-for-routing.

### 6.6 Inv #5 (Users Act / Orgs Own) and Inv #9 (Content ≠ Presentation)

- **Inv #5 affordance:** every buyer screen mounts in the Doc-7C shell with **active-org server-resolved, never client-trusted** (GI-01). The org-switcher changes context server-side; a client-supplied org ID is never honored. **Forbidden:** trusting a client org ID for scoping any RFQ/CRM/engagement read.
- **Inv #9 affordance:** all buyer list sort/filter (P-BUY-06/09) is **presentation that re-queries the contract** and **never re-ranks the governed M3 matching/routing order** (GI-04). Buyer-chosen comparison sort and Approved-vendor float (P-BUY-15) are the **contract-applied, buyer-scoped** orderings the corpus permits (§6.1) — they are governed reads, not a client re-rank of the matching set. **Forbidden:** a client-side reorder of the governed quotation/matching sequence.

---

## 7. Edge cases & decision branches

> Each branch cites the exact state/contract/POLICY identifier. Domain realism under governance precision.

| Edge case (procurement reality) | How the flow handles it (state · contract · POLICY) |
|---|---|
| **No quotations received** | RFQ holds in `vendors_notified`. Per Doc-3 §5.3, **replenishment waves fire first** (POLICY `distribution.replenish_check_hours`, start 24h) drawing the next vendor band — **invisible to the buyer** (Doc-3 §4.2). If exhausted with zero quotes, System `expire_rfq` → `expired`. Buyer recovery: `reissue_rfq`. P-BUY-09 empty reads "No quotations yet (awaiting vendor responses)," never implying exclusion. |
| **Vendor withdraws / declines** | Decline = no state change to the RFQ and **no penalty** to the vendor (Doc-3 §8.4); withdraw moves that quotation `→ withdrawn` (**zero performance penalty**, Doc-3 §8.3). The engine may fire an **invisible replenishment wave**. The buyer sees only fewer/replacement disclosed quotations on P-BUY-09 — **never** "vendor X declined/withdrew because…". |
| **Late vendor wants in (extension)** | A late vendor's `request_late_extension` is buyer-approved one-tap; the **window reopens for ALL un-responded invitees** (Doc-3 §8.5), capped by POLICY `quote.late_extension_max_days` (start 3). **No private extensions** — visible to all invitees (corruption-vector guard). Vendor-side `request_late_extension`; buyer observes the reopened window. |
| **Moderation fail** | `moderate_rfq` (reject, reason) sends the RFQ from `under_review` **back to `draft`**. The buyer edits in P-BUY-07 and re-submits via `submit_rfq` — a normal resubmission from draft, not a dead end. |
| **RFQ expiry** | System `expire_rfq` from any active state → `expired` (terminal). Cascade: open quotations + invitations → `expired` in the same transaction. Recovery: `reissue_rfq` only. |
| **Award value over org threshold** | `award_rfq` (gated `can_award_rfq`) above the org's configured award threshold requires **Director/Owner award-threshold approval on award** (Doc-3 §9.4; threshold sourced from Identity config, set in P-ACC-13 workflow settings, consumed not authored). P-BUY-17 surfaces the threshold-approval gate step; the award does not complete until approved. |
| **Buyer wants to split the award** | **Not permitted as multi-award.** Award is **1:1** — exactly one `selected` quotation (Doc-3 §9.4). Split sourcing = **`reissue_rfq`** for the remaining scope (a new `draft`, `reissued_from` the source). The award wizard offers no "award to multiple" path. |
| **Terminal finality / reopen** | `closed_won` / `closed_lost` / `cancelled` / `expired` **never reopen** (Doc-3 §1.6). The only forward path is `reissue_rfq`, which **links to the source** RFQ (Doc-4E §E4.7) — the original record is preserved immutably (Invariant #8). |
| **Shortlist gets too large** | Shortlist depth is governed by a **soft-cap** POLICY `eval.shortlist_max` (start 5, Doc-3 §9.2). Soft — the UI surfaces the cap as guidance, not a hard block; the buyer remains the decider. |
| **Best-and-final rounds** | Buyer may `invoke_best_and_final` once in `buyer_reviewing`/`shortlisted` (Doc-3 §9.3), capped by POLICY `eval.baf_rounds_max` (start 1). All shortlisted vendors are simultaneously invited to a final sealed revision with a common deadline — **visible to all invitees** (no private rounds, Doc-3 §9.3). Quotation revisions independently carry soft-cap POLICY `quote.max_revisions` (start 3; beyond it, a clarification-thread justification is required). |
| **Vendor withdraws after shortlisting** | Triggers an immediate buyer alert + **optional replenishment wave** if comparison drops below viable depth (Doc-3 §8.3) — replenishment remains invisible as to *which* vendors. The RFQ stays in `shortlisted`/`buyer_reviewing`; the buyer may still award a remaining shortlisted quotation or `close_lost_rfq`. |
| **Post-award dispute** | A dispute is **not an engagement state** (Doc-4F §F5.5): it is a **trade-invoice `→ disputed` status transition via `update_trade_invoice_status`, emitting `DisputeRecorded`** (Trust input, DF-4). Engagement stays in its lifecycle state (`open → in_delivery → completed → closed`). No money moves (R8). **Carried Flag-and-Halt (§0.1):** Doc-4M lists a `disputed` engagement state — surfaced for reconciliation, not resolved here. |

---

## 8. Screen flows (journey diagrams)

> **Grounding stamp.** Every screen ID (`P-BUY-*`), journey step (`J-PROC-*`), Doc-4M state, contract, and template (`T-*`) below is bound by pointer to the grounding and the frozen corpus (Doc-7F, Doc-4M, Doc-5E/5F/5D). The Actor column distinguishes **Buyer** (acts via a wired command) from **System** (Doc-4M transitions **displayed, never invoked** — out-of-wire: matching/routing/wave-assembly/`expire_rfq`/comparison-generation/engagement-creation/document-generation). ASCII boxes are schematic, not pixel specs.

### Legend (used in all six flows)

```
[ P-BUY-nn  Screen name ]          ← screen the buyer is on
  «state: doc-4m_state»            ← Doc-4M RFQ/engagement state (out-of-wire states marked ⚙)
  ▸ action → contract              ← Buyer-actor transition (GI-10; only Doc-4M-permitted)
  ⚙ System → (out-of-wire)         ← System transition: DISPLAYED, never invoked (Doc-7F)
  ⟂ R6 / R7 / R8 / Inv#11          ← load-bearing moat rail asserted at this point
```

### Flow 1 — Create & submit RFQ (internal-approval branch + reject → redraft)

Journey `J-PROC-02` (Author) → `J-PROC-03` (Submit) → `J-PROC-04` (Internal approval). Templates: `T-WIZARD` (P-BUY-07, P-BUY-17 family), `T-MANAGEMENT` (P-BUY-12).

```
 Buyer                                                              Actor / Doc-4M state
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [ P-BUY-06  RFQ list ]   ▸ New RFQ → create_rfq                    Buyer           │
│         └──────────────► [ P-BUY-07  RFQ create wizard ]  T-WIZARD                 │
│                            «draft»                                                 │
│   Stepper: Details ▸ Specs ▸ Review                                                │
│   ▸ Save draft → create_rfq → update_rfq   (persisted via contract, not local)    │
│   ⟂ Buyer expresses INTENT. NO engine-bypass "dispatch invitation" control here.   │
│     The M3 engine invokes matching/routing and dispatches invitations             │
│     (J-PROC-06, out-of-wire). [ESC-7-7F-INVITE]: candidate-targeting form is OPEN. │
│                                                                                    │
│   ▸ Submit RFQ → submit_rfq                                       Buyer            │
│        │                                                                           │
│        ├─ if NOT can_approve_rfq ──► «pending_internal_approval»                   │
│        │       └────► [ P-BUY-12  Internal approval ]  T-MANAGEMENT                │
│        │              queue rows: ref · requester · value · submitted              │
│        │              ▸ Approve → approve_rfq        ──► «submitted» ──┐           │
│        │              ▸ Reject  → reject_internal_rfq (REASON required)│           │
│        │                          ──► «draft»  ───────────────────────┼───┐       │
│        │              ▸ Cancel  → cancel_rfq (audited) ──► «cancelled» │   │       │
│        │              ⟂ No auto-approve timeout (Doc-3 §1.2)           │   │       │
│        │              ⟂ Award-threshold approval = Director/Owner      │   │       │
│        │                                                               │   │       │
│        └─ if can_approve_rfq (self-approve path) ──────────────────────┤   │       │
│                                                    ──► «submitted»     │   │       │
│                                                                        ▼   │       │
│                                               ⚙ System: moderate_rfq        │       │
│                                               «submitted → under_review     │       │
│                                                 → matching»  (J-PROC-05/06) │       │
│                                               DISPLAYED on P-BUY-08/10      │       │
│   redraft loop ◄───────────────────────────────────────────────────────────┘       │
│   [ P-BUY-07 ] reopens the same draft (resumable); version preserved (Inv #8,      │
│   viewable at P-BUY-11). Idempotency key stable per submission (GI-10).            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

*Governance asserted:* GI-10 (only machine-permitted transitions; 409 → reconcile), buyer-never-dispatches (no engine-bypass invitation control on the RFQ leg), Inv #8 (versioned, never overwritten), reject-requires-reason.

### Flow 2 — Observe routing & quotations inbox (System-driven; deferral invisible)

Journey `J-PROC-06` (Match & route, System) → `J-PROC-07` (Observe) → `J-PROC-08` (Receive quotes). Templates: `T-DETAILS` (P-BUY-08/10), `T-LISTING` (P-BUY-09/13).

```
 System (out-of-wire)                         Buyer observes (read-only)
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ⚙ matching pipeline + routing wave                                                │
│   «matching → vendors_notified»            ENGINE dispatches invitations (J-PROC-06)│
│   ⟂ R7: NO plan/quota/payment gates matching. Gate-before-score.                   │
│        │                                                                           │
│        ▼  (buyer never triggers this; only watches)                               │
│ [ P-BUY-08  RFQ detail — overview ]  T-DETAILS   «vendors_notified»                │
│   Tabs:  Overview │ Quotations │ Activity                                          │
│   Toolbar: state-machine actions ONLY (Cancel / Reissue where Doc-4M permits)      │
│        │                                                                           │
│   ├──► [ P-BUY-13  Routing log / invitations ]  T-LISTING                          │
│   │      get_routing_log · list_invitations                                        │
│   │      rows: vendor · invited · response · status                                │
│   │      ⟂ Inv#11: NO excluded/blacklisted vendor row. Deferral INVISIBLE.         │
│   │      Empty copy = "No invitations yet" — MUST NOT imply exclusion.             │
│   │                                                                                │
│   ├──► [ P-BUY-10  RFQ detail — activity ]  T-DETAILS                              │
│   │      timeline from immutable audit (M0); ⟂ deferral invisible (Doc-3 §4.2)     │
│   │                                                                                │
│   └──► ⚙ System: vendor quotations arrive  «→ quotations_received» (J-PROC-08)     │
│           │                                                                        │
│           ▼                                                                        │
│       [ P-BUY-09  RFQ detail — quotations ]  T-LISTING                             │
│         list_quotations_for_rfq                                                    │
│         rows: vendor · amount · validity · status                                  │
│         ⟂ R6/GI-04: UI never re-ranks the GOVERNED MATCHING SET.                   │
│         ⟂ visibility-GATED server-side (quotation_visibility; outside scope =      │
│           NOT_FOUND, never client 404). Buyer sees disclosed quotes' real values.  │
│         Empty = "No quotations yet (awaiting vendor responses)".                   │
│         ▸ Compare → P-BUY-15      ▸ Open quotation → P-BUY-14                       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

*Governance asserted:* R7 (matching never gated by money), Inv #11 (deferral/exclusion invisible), R6/GI-04 (no re-rank of the governed matching set), cross-vendor isolation via `quotation_visibility` (Doc-5E R5).

### Flow 3 — Compare → shortlist → clarify / best-and-final → award (and close-lost branch)

Journey `J-PROC-09` → `J-PROC-10` → `J-PROC-11` → `J-PROC-12` / `J-PROC-12b`. Templates: `T-ANALYTICS` (P-BUY-15), `T-DETAILS` (P-BUY-14/16/18), `T-WIZARD` (P-BUY-17).

```
 Buyer decides — System never decides                       Doc-4M state
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [ P-BUY-15  Comparison statement ]  T-ANALYTICS   «buyer_reviewing»                │
│   get_comparison_statement (read-only, SYSTEM-GENERATED, decision SUPPORT)         │
│   rows: price(norm) · delivery · validity · warranty · spec-compliance ·          │
│         vendor standing + buyer-private columns (own status/notes)  (Doc-3 §9.1)   │
│   sort: BUYER-CHOSEN default; Approved vendors FLOAT (Doc-3 §9.1/§7.5) —           │
│         governed, contract-applied, BUYER-PRIVATE ordering (not a re-rank).        │
│   ⟂⟂ R6 (load-bearing): NO "recommended" cell, NO winner highlight, NO            │
│      auto-select. The "recommended" affordance DOES NOT EXIST. ai-advisory-panel   │
│      may EXPLAIN, never rank.                                                       │
│   ⟂ GI-04: UI never re-ranks the GOVERNED M3 MATCHING order.                       │
│   ⟂ Inv#11: Approved/buyer-private columns are buyer-org-private; never leak.      │
│        │                                                                           │
│        ├──► [ P-BUY-14  Quotation detail ]  T-DETAILS                              │
│        │      get_quotation; ▸ Shortlist (where state permits) · ▸ Clarify → 16    │
│        │                                                                           │
│        ├──► [ P-BUY-16  Clarifications / thread ]  T-DETAILS                       │
│        │      manage_clarification (+ M6 thread) · ▸ invoke_best_and_final         │
│        │      (eval.baf_rounds_max=1; reopened window visible to ALL invitees)     │
│        │      ⟂ renders only DISCLOSED messages (no excluded-party inference)      │
│        │                                                                           │
│        ▼  ▸ Shortlist → shortlist_quotation            «→ shortlisted» (J-PROC-11) │
│                                                                                    │
│   ┌─────────────────────────── AWARD GATE ────────────────────────────────────┐   │
│   │ [ P-BUY-17  Award ]  T-WIZARD   «shortlisted»  (gated can_award_rfq)        │   │
│   │   Stepper: Review → (threshold-approval gate if > org threshold) → Confirm │   │
│   │   ⟂⟂ R6: the buyer ALWAYS decides. NO pre-selected winner; the wizard opens │   │
│   │      on NO default selection. Award is EXPLICIT, UNRANKED, 1:1. AI takes    │   │
│   │      NO part in selection.                                                  │   │
│   │   ▸ Award → award_rfq                                                       │   │
│   │      «shortlisted → closed_won»; exactly ONE quote → selected (1:1),        │   │
│   │      others → not_selected; ⚙ System creates engagement «open».            │   │
│   │      Split sourcing = reissue_rfq, NEVER multi-award.                       │   │
│   │      Dialog: irreversible confirm; value snapshotted immutably.            │   │
│   └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                    │
│   CLOSE-LOST branch (no award):                                                    │
│   [ P-BUY-18  Close lost ]  T-DETAILS                                              │
│     ▸ Close → close_lost_rfq    «→ closed_lost»                                    │
│     ⟂ uniform closure, NON-PENALIZING to vendors (Doc-3 §9.5).                     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

*Governance asserted:* R6 at the award gate — comparison is decision support with no recommended winner; buyer-chosen sort + Approved float are sanctioned governed orderings (Doc-3 §9.1/§7.5); award is a deliberate unranked 1:1 buyer act gated `can_award_rfq`; AI is excluded from selection; close-lost is non-penalizing.

### Flow 4 — Post-award operations (engagement → PO/LOI/WCC → challan/invoice → payment)

Journey `J-PROC-13`. Engagement states `open → in_delivery → completed → closed` (Doc-4F §F5 / Doc-2 §3.5 — **§0.1 pending reconciliation vs Doc-4M**). Templates: `T-LISTING` (P-BUY-19), `T-DETAILS` (P-BUY-20/21/22/23/24/25).

```
 System creates → Buyer advances/issues records (NO money moves)   engagement state
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ⚙ System: award_rfq created the engagement  «open»  (create_engagement_on_award)   │
│        ▼                                                                           │
│ [ P-BUY-19  Engagements ]  T-LISTING  list_engagements                             │
│        └─► [ P-BUY-20  Engagement detail ]  T-DETAILS  get_engagement              │
│   Tabs: Overview │ Documents │ Payments    «open → in_delivery → completed → closed»│
│   ▸ Advance → update_engagement_status   ▸ Close → close_engagement                │
│   ▸ Buyer feedback → record_buyer_feedback (perf input → outbox)                   │
│   (a dispute is a trade-invoice → disputed + DisputeRecorded, NOT an eng. state)   │
│   ⟂⟂ R8 (load-bearing): every doc below is a RECORD / workflow artifact —          │
│      the platform NEVER settles, escrows, or custodies buyer↔vendor money (DF-6). │
│        │                                                                           │
│   ├─ [ P-BUY-21  Purchase order / LOI ]                                            │
│   │     ▸ Issue / Revise → issue_engagement_document · revise_engagement_document  │
│   │     (202 ACCEPTED → poll get_generated_document; ASYNC_PENDING while pending)  │
│   │     PO needs can_approve_po (distinct perm); VERSIONED, overwrite forbidden    │
│   │                                                                                │
│   ├─ ⚙ Vendor records delivery → [ P-BUY-24  Challan ]  read get_engagement_document│
│   │     ⚙ record_delivery emits DeliveryRecorded; versioned                        │
│   │                                                                                │
│   ├─ ⚙ Vendor issues → [ P-BUY-23  Trade invoice review ]                          │
│   │     ▸ Approve/Dispute → update_trade_invoice_status · read get_engagement_document│
│   │     state: issued → partially_paid → paid | disputed | cancelled               │
│   │     ⟂⟂ R8: TRADE invoice ≠ platform billing invoice (P-ACC-20/21). No funds.   │
│   │     → disputed emits DisputeRecorded (Doc-4F §F5.5)                            │
│   │                                                                                │
│   ├─ [ P-BUY-22  Payments ]   ▸ Record / Confirm → record_payment · confirm_payment│
│   │     state: recorded → confirmed; confirm needs can_approve_payment             │
│   │     ⟂⟂ R8: RECORD-ONLY, NO funds movement. Copy MUST NOT imply settlement.     │
│   │                                                                                │
│   └─ ⚙ Vendor issues → [ P-BUY-25  WCC ]  read get_engagement_document             │
│         ⚙ issue_engagement_document(doc_kind=wcc) emits WorkCompletionIssued       │
│         (proof-of-work; a Trust input, M5-owned)                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

*Governance asserted:* R8 — PO/LOI/challan/invoice/payment/WCC are `engagement_documents` records and workflow, never money settlement; the trade invoice is firewalled from the platform billing invoice; payment copy must never imply settlement; Inv #8 (versioned docs); 202-then-poll async for document generation.

### Flow 5 — Vendor CRM (private) — set status / blacklist; the Inv #11 containment boundary

Journey `J-PROC-14`. Templates: `T-LISTING` (P-BUY-26), `T-DETAILS` (P-BUY-27).

```
 Buyer's OWN workspace ONLY — nothing crosses the boundary
┌───────────────────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════ BUYER-PRIVATE CONTAINMENT (Inv #11) ════════════════════╗ │
│  ║ [ P-BUY-26  CRM — vendor list ]  T-LISTING   list_private_vendors (own-org)     ║ │
│  ║   rows: vendor · CRM status · last activity                                     ║ │
│  ║        ▼  ▸ open → P-BUY-27                                                      ║ │
│  ║ [ P-BUY-27  CRM — vendor detail ]  T-DETAILS   get_private_vendor                ║ │
│  ║   ▸ Edit → update_private_vendor     ▸ Note → add_private_vendor_note            ║ │
│  ║   ▸ Rate → set_private_vendor_rating                                             ║ │
│  ║   ▸ Approve/Blacklist → set_buyer_vendor_status (enum value) /                   ║ │
│  ║                          clear_buyer_vendor_status  (confirm dialog)             ║ │
│  ║   ⟂ buyer_vendor_status = append-only history; EMITS NO EVENT (Doc-5F R5)        ║ │
│  ║   ⟂ Approved/Blacklisted NEVER mutates platform-wide scores (§4 firewall)        ║ │
│  ╚═════════════════════════════════════════════════════════════════════════════════╝ │
│        │  this status/note/rating/approved/blacklist/link data renders ONLY inside  │
│        │  the box above (and the buyer's own comparison columns). It does NOT       │
│        │  appear on:                                                                │
│        ✗ P-BUY-02/03/04 Discover / directory / vendor profile (CRM status NOT shown) │
│        ✗ any vendor surface (P-VND-*) — blacklist is UNDETECTABLE (byte-equivalence) │
│        ✗ any shared component, notification, count, KPI, analytic, facet, or error   │
│        ✗ read_crm_status_for_routing is internal-service / out-of-wire — the         │
│          FRONTEND NEVER CALLS IT. The buyer's blacklist silently de-prioritizes      │
│          via the engine; the vendor's experience stays byte-identical to non-match.  │
│   No coined crm.* analytics event is emitted; set_buyer_vendor_status is never       │
│   evented (Doc-5F R5). Any telemetry binds the SC §4 grammar by pointer, own-org.    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

*Governance asserted:* Inv #11 — the CRM box is the containment boundary; no leak to discovery, vendor, shared, notification, count, analytic, or error surface; the §4 firewall (private status never mutates platform-wide scores); `set_buyer_vendor_status` append-only and **never evented** (Doc-5F R5); `read_crm_status_for_routing` out-of-wire and never called by the frontend; blacklist undetectable.

### Flow 6 — Discovery / sourcing (research → informs RFQ authoring; engine dispatches invitations)

Journey `J-PROC-01`. Templates: `T-LISTING` (P-BUY-02/03/05), `T-DETAILS` (P-BUY-04).

```
 Buyer researches — discovery is REFERENCE; engine dispatches invitations
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [ P-BUY-02  Discover vendors ]  T-LISTING   search_catalog · list_vendor_directory │
│ [ P-BUY-03  Vendor directory (in-app) ]  T-LISTING                                 │
│   cards: identity · trust chip (READ-ONLY) · tier · 4-flag capability matrix ·     │
│          capacity-bar                                                              │
│   ⟂ R7: trust/performance/tier DISPLAYED, never computed/edited here (M5 owns).    │
│   ⟂ GI-04: sort/filter re-queries the contract — NEVER re-ranks M3 matching.       │
│   ⟂ Inv#11: CRM status / blacklist NEVER rendered on discovery.                    │
│        │                                                                           │
│        ├─ ▸ Favorite → add_catalog_favorite ──► [ P-BUY-05  Favorites ]  T-LISTING │
│        │                                         list_catalog_favorites            │
│        │                                                                           │
│        └─ ▸ open vendor → [ P-BUY-04  Vendor profile (in-app) ]  T-DETAILS         │
│              get_vendor_profile (User leg) · trust ring (read-only) · capability    │
│              ⟂⟂ NO engine-bypass "dispatch invitation" control — invitations are   │
│                 ENGINE-dispatched (R6; Pass-2 §4.2). [ESC-7-7F-INVITE]: any buyer  │
│                 candidate-targeting form is an OPEN carried question (§0.3).        │
│                                                                                    │
│   Research OUTCOME feeds RFQ authoring (Flow 1) as the buyer's mental model /      │
│   favorites reference:                                                            │
│        ╴╴╴╴╴► [ P-BUY-07  RFQ create wizard ]  (buyer expresses INTENT; the M3     │
│                  engine — not this screen — invokes matching and dispatches        │
│                  invitations, J-PROC-06)                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

*Governance asserted:* buyer-never-dispatches (no engine-bypass invitation control on discovery or the RFQ leg; candidate-targeting form carried as `[ESC-7-7F-INVITE]`), R7 (trust/tier read-only display), GI-04 (sort/filter never re-ranks M3), Inv #11 (CRM never on discovery), `get_vendor_profile` (User leg, not the anonymous public read).

---

## 9. Dashboard composition & interaction design

> **Grounding stamp.** Anchored to `PI §6` / `PI §13.5` (P-BUY-01 = `T-DASHBOARD`, Complex, P0, Hero, Read-only, Devices D/T/M), `SS P-BUY-01`, `PT §5` (`T-DASHBOARD` region contract), `UX §6.2` (KPI cards), and the `--iv-*` token sets (layout, density, a11y). Coins no widget, metric, contract, or token.

### 9.1 P-BUY-01 dashboard anatomy

P-BUY-01 instantiates `T-DASHBOARD` (`PT §5`): `TB-NONE` (page-header only) · `SK-DASHBOARD` · `MB-DASHBOARD`. Per `SS P-BUY-01` the required kit (Doc-7B) is: `stat-card` · `card` · `data-table` (recent RFQs) · `status-chip` · `timeline`; optional `billing-indicator`, `score-ring` (Hybrid context), `ai-advisory-panel` (reserved). The region contract:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ PAGE-HEADER  "Procurement"          [date range ▾ (presentation)] [+ Quick Create]│  ← shell slot, GI-01
├────────────────────────────────────────────────────────────────────────────────┤
│ KPI STAT-CARD BAND   repeat(auto-fill, minmax(--iv-card-min,1fr))                │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐ ┌────────────┐            │
│  │ Spend       │ │ Active RFQs │ │ Awaiting MY approval│ │ Win rate    │            │
│  │ Metric      │ │ Metric      │ │ Status + count      │ │ Trend       │            │
│  │ currency-   │ │ status-chip │ │ (queue surfacer)    │ │ delta/spark │            │
│  │ display BDT │ │ by state    │ │                     │ │             │            │
│  └────────────┘ └────────────┘ └────────────────────┘ └────────────┘            │
│   ⟂ every figure is a WIRED READ (GI-12 / UX §6.2): no client-computed metric.   │
│   ⟂ counts respect non-disclosure — NO excluded/blacklist counts (Inv #11).      │
├───────────────────────────────────────────────────┬────────────────────────────┤
│ CONTENT GRID  (12→8→1 col; 24-col only at xl+)     │ RIGHT-RAIL (collapses 1st) │
│  ┌─ WORK QUEUE: RFQs by state ─────────────────┐    │  shortcuts / tasks         │
│  │ data-table (compact) · status-chip · ref-mono│   │  (optional)                │
│  ├─ WORK QUEUE: Quotations awaiting review ─────┤    │                            │
│  │ data-table · vendor · amount · validity      │   │                            │
│  ├─ WORK QUEUE: Engagements needing action ─────┤    │                            │
│  │ data-table · state · value · updated         │   │                            │
│  ├─ RECENT ACTIVITY ──────────────────────────┤    │                            │
│  │ timeline (from immutable audit, M0)          │   │                            │
│  └──────────────────────────────────────────────┘   │                            │
└───────────────────────────────────────────────────┴────────────────────────────┘
   First-run empty: single "Create RFQ" CTA (SS P-BUY-01).
```

- **KPI stat-card band** — four cards mapping to `UX §6.2` variants: **Spend** (Metric, `currency-display` `{amount, currency}` BDT, GI-08), **Active RFQs** (Metric/Status, `status-chip` by Doc-4M state), **Awaiting-my-approval** (Status + count — the surfacer into P-BUY-12), **Win rate** (Trend, value + delta/sparkline). Each is a contract read; none is client-computed (`UX §6.2` governance).
- **Work queues** — three `data-table` queue widgets (RFQs by Doc-4M state · quotations awaiting review → P-BUY-09/14 · engagements needing action → P-BUY-20), plus a **recent-activity** `timeline` sourced from the immutable M0 audit. Quick-create lives in the shell page-header (role-scoped + entitlement-gated).
- **Per-widget Suspense streaming** — per `PT §5.3` each widget streams as an independent Suspense boundary behind its own `SK-DASHBOARD` skeleton; a single widget's read failure renders a scoped `error-state` (with `reference_id`) **without taking down the dashboard** (GI-05). KPI band → activity/queues → shortcuts is the load order and the visual hierarchy.

### 9.2 Interaction patterns

**Progressive disclosure (comparison matrix & RFQ detail).** Per `UX §5.4`, disclosure tiers reduce density without ever hiding required/safety/compliance data:
- *Comparison (P-BUY-15, `T-ANALYTICS`)* — the 24-col matrix shows headline criteria (price normalized, delivery, validity, warranty, spec-compliance, vendor standing — Doc-3 §9.1) by default; secondary line-item detail expands per row. Disclosure **never** introduces a ranking, a winner highlight, or a "recommended" tier — the `ai-advisory-panel` can be expanded to **explain** criteria, never to rank (R6). The buyer-chosen sort and Approved-vendor float (Doc-3 §9.1/§7.5) remain the governed orderings at every tier, and the buyer-private columns stay buyer-private (Inv #11).
- *RFQ detail (P-BUY-08, `T-DETAILS`)* — tabbed facets (Overview / Quotations / Activity) with the right-rail hosting metadata/relations-by-ID/files/audit; deep history is one tab deeper (P-BUY-11 versions). Hero actions are **state-machine-permitted only** (GI-10) — the toolbar surfaces Cancel/Reissue only where Doc-4M allows.

**Keeping dense procurement data scannable.**
- **Density tokens** via the `data-density` attribute: `compact` (32px rows, `--iv-space-2`) for comparison matrices and large RFQ/quotation tables; `default` (40px) for standard lists; `comfortable` (48px) for detail/touch. The buyer can toggle density (TB-LIST control).
- **`tabular-nums`** (`font-variant-numeric: tabular-nums`, the `[data-type="amount"]` hook) on every money/quantity column so amounts and quantities align for cross-row scanning across P-BUY-09/14/15/19/21/22/23.
- **Status-chip color semantics with non-color cues (GI-06).** `status-chip` carries Doc-4M/engagement/quotation state with a semantic token (`--iv-success-*` / `--iv-warning-*` / `--iv-danger-*` / `--iv-info-*` / `--iv-neutral-*`) **plus** an icon and text label — never color alone. Trust/tier/capability likewise: `--iv-trust-*`, `--iv-tier-a…e`, and the four `--iv-cap-supply/service/fabricate/consult` flags each render as a labeled element (capability is a 4-flag matrix, never a single colored label — Inv #1).

**Award confirmation as friction-by-design.** The award gate (P-BUY-17, `T-WIZARD`, gated `can_award_rfq`) is deliberately a multi-step, no-default-selection moment: Review → (threshold-approval gate if above the org award threshold, Director/Owner) → an **irreversible confirm dialog** with the value snapshotted immutably. There is **no pre-selected winner anywhere** in the flow — not on the comparison (P-BUY-15), not in the wizard's initial state, not in any AI panel (R6 / Inv #12). The friction is the point: the buyer's selection is an explicit, unranked, 1:1 act (`SS P-BUY-17`).

### 9.3 Accessibility (WCAG-AA, GI-06) and mobile-first (GI-07)

**Accessibility across the core buyer flows (GI-06):** semantic landmarks and a single H1 per page; full keyboard operability (queue rows and table actions keyboard-reachable; comparison matrix cells **header-associated** with no color-only cue — and **no "recommended" affordance exists** to begin with); visible `:focus-visible` ring; ARIA where the primitive needs it; WCAG-AA contrast on every semantic token including the data-viz palette; live regions announce result counts (P-BUY-09) and new clarification messages (P-BUY-16); irreversible actions (award, blacklist, payment confirm) are clearly warned and never color-only. The a11y *test* is Doc-8's.

**Mobile-first for a procurement officer on the factory floor (GI-07 / `MB-*`).** Devices per `PI §13.5`: P-BUY-01 dashboard is **D/T/M** — on small screens `MB-DASHBOARD` collapses to a single-column KPI stack, nav → drawer, the most action-driving widgets surface first. What gets prioritized on mobile:
- **Triage over authoring.** The "Awaiting-my-approval" KPI and the approval queue (P-BUY-12, D/T/M, `MB-LIST`) lead — approve/reject from the floor with reason capture, sticky primary CTA, swipe row-actions backed by a visible non-swipe alternative.
- **Read on the move.** RFQ detail (P-BUY-08), challan (P-BUY-24), and WCC (P-BUY-25) — all **D/T/M** — use `MB-DETAIL`: tabs → accordion, right-rail → bottom sheet, sticky primary action.
- **Desktop/tablet-anchored deep work stays off the phone.** Per `PI §13.5`: the **comparison statement (P-BUY-15) is Devices D only**, the **quotation detail (P-BUY-14) is D/T**, and the **RFQ create wizard (P-BUY-07) is D/T** — the dense 24-col matrix, the per-quotation evaluation, and multi-step authoring degrade gracefully (matrix → stacked per-quotation cards below `lg`; quotation detail floors at tablet) but are **not** promoted to a phone-primary surface, because mis-tapping an award or a comparison on a 360px screen is exactly the friction-failure R6 forbids.

**No leak in any visual / empty / error state (binding across §9):** the routing-log empty state ("No invitations yet") must not imply exclusion; dashboard KPI counts carry no excluded/blacklist figure; CRM status renders only inside P-BUY-26/27 (and the buyer's own comparison columns); not-found on any RFQ/quotation/engagement is byte-identical to genuine absence (GI-05); analytics telemetry binds the SC §4 grammar by pointer and coins no Doc-2 §8 event, never logs an excluded/non-invited party, and emits no `crm.*` status event (Doc-5F R5; GI-12).

---

## 10. Per-screen specifications (P-BUY-01 … P-BUY-27)

All entries bind by pointer to `PI §6/§13`, `PT §n` (region contract + allowed/prohibited sets), and `SS [P-BUY-nn]` (deltas). Templates: `T-DASHBOARD §5` · `T-LISTING §3` · `T-DETAILS §4` · `T-WIZARD §6` · `T-MANAGEMENT §8` · `T-ANALYTICS §9`. Inheritance is the `SS §1.1` banner (`Inherits: GI · T-* · TB-* · SK-* · MB-*`); only deltas are stated. State-primitive plan reads as **Loading = `SK-*` preset / Empty = SS empty-copy delta / Error = `error_class` branch + `reference_id` (GI-05) / Not-found = byte-identical (GI-12)**. "Engine dispatches invitations" and "buyer never dispatches" (R6/Pass-2 §4.2) hold platform-wide; CRM (Inv #11) is buyer-private and undetectable. **All contract slugs below are the verbatim frozen Doc-5D/5E/5F names.** Routes carry **opaque IDs (UUIDs)**, never human refs.

> **Companion-vs-frozen reconciliation note:** the companion grounding (`page_inventory.md`, `screen_specifications.md`) labels several buyer-leg contracts with presentation vocabulary that diverges from the frozen names (e.g. `get_crm_status`/`set_blacklist`; `issue_po`/`get_invoice`/`get_challan`/`get_wcc`/`approve_trade_invoice`; `get_public_vendor_profile` on the in-app profile). This document binds the **frozen Doc-5D/5E/5F names** (the precedence chain places them above the non-authoritative companions) and surfaces the companion divergence for upstream correction.

### Section 1 — Discovery & home (P-BUY-01…05) — research/reference; engine dispatches invitations

| P-BUY · name | `T-*` | Purpose | Bound contracts (R reads / W writes) | Primary components | State-primitive plan | Buyer actions (gated) | Guardrails |
|---|---|---|---|---|---|---|---|
| **P-BUY-01** Buyer dashboard | `T-DASHBOARD §5` | Procurement at-a-glance: KPIs, active RFQs, queues (`J-PROC-01`) | R: dashboard reads; embedded score-ring read only if Hybrid | stat-card · card · `data-table` (recent RFQs) · `status-chip` · `timeline`; opt `billing-indicator`, `score-ring`, `ai-advisory-panel`(reserved) | `SK-DASHBOARD`, per-widget Suspense / Empty="Create RFQ" first-run CTA / scoped widget `error-state`, dashboard survives | Navigate to RFQ/approval/engagement (read-only home) | R6 (no winner/recommended-vendor widget) · R7/Inv#11 (KPI counts respect non-disclosure — no excluded counts) · firewall (metrics from contract reads, never client-computed) |
| **P-BUY-02** Discover vendors | `T-LISTING §3` | In-app vendor/product discovery (`J-PROC-01`) | R: `search_catalog`, `list_vendor_directory`; W: `add_catalog_favorite` | vendor/product cards · `search` · `filter` · `pagination-control` · `trust-badge` · capability-matrix; opt capacity-bar, favorite toggle, sort | `SK-CARD` / Empty="No vendors match"+adjust / `error-state` | Favorite (optimistic); open vendor → P-BUY-04 | **No engine-bypass "dispatch invitation" control** (engine dispatches, R6) · GI-04 (never re-ranks M3) · Inv#11 (CRM status NEVER on discovery) · R7 (trust read-only) · GI-12 facets/counts |
| **P-BUY-03** Vendor directory (in-app) | `T-LISTING §3` | Browse the vendor directory in-app (`J-PROC-01`) | R: `list_vendor_directory` | vendor cards · `search` · `filter` · `pagination-control` · `trust-badge` · capability-matrix; opt capacity-bar, sort, favorite | `SK-CARD` / Empty="No vendors match" / `error-state` | Open vendor → P-BUY-04; favorite | Same as P-BUY-02: no dispatch control (R6); trust read-only (R7); non-disclosure (GI-12); no client re-rank (GI-04) |
| **P-BUY-04** Vendor profile (in-app) | `T-DETAILS §4` | View a vendor profile in-app with trust (`J-PROC-01`) | R: `get_vendor_profile` (Doc-5D User leg) + trust (M5 read); W: `add_catalog_favorite`, `remove_catalog_favorite` | detail hero (identity + trust ring) · tabs · `trust-badge` · capability-matrix · button(favorite); opt capacity-bar, score-ring, file-link, `ai-advisory-panel`(reserved) | `SK-DETAIL` / Empty+Not-found **byte-identical** (GI-12) / `error-state` | Favorite | **No engine-bypass dispatch control** — invitations engine-dispatched (R6) · R7 (trust read-only) · **Inv#11 (buyer-private CRM status NOT shown here)** · AI explains capabilities, non-recommending (GI-11) · User-leg read (`get_vendor_profile`), not the anonymous public read |
| **P-BUY-05** Favorites | `T-LISTING §3` | Manage saved vendors/products (`J-PROC-01`) | R: `list_catalog_favorites`; W: `add_catalog_favorite`, `remove_catalog_favorite` (BC-MKT-7) | vendor/product cards · `pagination-control` · button(remove); opt filter(type), `search` | `SK-CARD` / Empty="No saved items"+browse / `error-state` | Remove favorite (optimistic) | Own-org only (Inv#5) · GI-12 non-disclosure |

### Section 2 — RFQ procurement leg (P-BUY-06…13) — Doc-4M state machine; engine-dispatched; no dispatch control

| P-BUY · name | `T-*` | Purpose | Bound contracts | Primary components | State-primitive plan | Buyer actions (Doc-4M-gated) | Guardrails |
|---|---|---|---|---|---|---|---|
| **P-BUY-06** RFQ list | `T-LISTING §3` | List/manage org RFQs | R: `list_rfqs`; W: `create_rfq` | `data-table` · `status-chip`(RFQ state) · `search` · `filter` · `pagination-control`; opt bulk-action bar, density, saved-views | `SK-LIST`; pinned ref column / Empty="No RFQs yet"+create / `error-state` | New RFQ → P-BUY-07; open → P-BUY-08; row actions **only where Doc-4M permits** | GI-10 (per-row transitions only) · GI-03 (cursor pagination) · own-org (Inv#5) · ref is display label, route opaque |
| **P-BUY-07** RFQ create wizard | `T-WIZARD §6` | Author an RFQ as a resumable draft (`J-PROC-02/03`) | W: `create_rfq` → `update_rfq` → `submit_rfq`; R: `can_approve_rfq` | `stepper` · `form-field` · button(next/save-draft/submit) · `file-link`(attachments) · `currency-display`; opt line-item table, `ai-advisory-panel`(reserved), category/spec pickers | `SK-WIZARD`; sticky save-bar / per-step `field_errors`; `STATE`(409)→re-derive offerable + idempotent retry (GI-10) / Success: draft-saved/submitted toast | Save draft; Submit (`draft → pending_internal_approval` *or* `submitted` if `can_approve_rfq`) | **No engine-bypass "dispatch invitation"** anywhere (R6) · GI-10 (only machine-permitted next state) · AI **drafts/explains only; module commits, never auto-submits** (Inv#12) · **stable idempotency key per submission** · files → `file_ref` (`ESC-7-API/upload`) |
| **P-BUY-08** RFQ detail — overview | `T-DETAILS §4` | RFQ command center: status, meta, lifecycle | R: `get_rfq`; W: `submit_rfq`, `cancel_rfq`, `reissue_rfq` (where permitted) | detail hero (ref-mono + `status-chip`) · tabs (Overview/Quotations/Activity) · `timeline`(lifecycle, M0 audit) · button(state actions) · breadcrumbs; opt `ai-advisory-panel`(reserved), file-link, currency-display | `SK-DETAIL`; sticky primary action / Empty+Not-found byte-identical / `STATE` re-derives actions, no blind retry | Lifecycle transitions **surfaced only where Doc-4M permits** | GI-10 (Doc-4M actions only) · **deferral/exclusion invisible** (Doc-3 §4.2; Inv#11) · buyer never dispatches · ref display-only/opaque route · AI explains status, non-recommending |
| **P-BUY-09** RFQ detail — quotations | `T-LISTING §3` | List received quotations (`J-PROC-08`) | R: `list_quotations_for_rfq` | `data-table` · `status-chip`(quote state) · `pagination-control` · `currency-display` · button(compare → P-BUY-15); opt filter, `trust-badge` | `SK-LIST` / Empty="No quotations yet (awaiting vendor responses)" / `error-state` | Open quotation → P-BUY-14; open comparison | **Governed matching set — never client re-ranked** (R6/GI-04) · **visibility-gated** (`quotation_visibility`; outside scope → `NOT_FOUND`, never client 404) · buyer sees disclosed quotes' real values (Doc-3 §9.1) · GI-12 |
| **P-BUY-10** RFQ detail — activity | `T-DETAILS §4` | Routing/audit activity (`J-PROC-07`) | R: routing/audit reads (immutable M0 audit) | `timeline`(activity) · `status-chip` · breadcrumbs; opt filter(event type) | `SK-DETAIL` / Empty="No activity yet" / `error-state` | None (read-only) | **Deferral invisible** (Doc-3 §4.2) · **no excluded vendor shown** (Inv#11) · filter is presentation over disclosed reads (GI-04) |
| **P-BUY-11** RFQ version history | `T-DETAILS §4` | View versioned, immutable RFQ history | R: `get_rfq_version` | `timeline`(versions) · diff/compare view · breadcrumbs; opt file-link | `SK-DETAIL`; side-by-side→stacked narrow / Empty=single-version note / `error-state` | Select versions to compare (read) | Inv#8 (**versioned, never overwritten**) · diffs not color-only (GI-06) |
| **P-BUY-12** Internal approval | `T-MANAGEMENT §8` | Approve/reject RFQs in the internal chain (`J-PROC-04`) | W: `approve_rfq`, `reject_internal_rfq`, `cancel_rfq`; R: `can_approve_rfq` | `data-table`(pending queue) · `status-chip` · button(approve/reject) · `currency-display` · `pagination-control`; opt bulk-action bar, filter, detail drawer | `SK-LIST` / Empty="Nothing to approve" / `STATE` re-derives; `CONFLICT` on stale | Approve (threshold-aware); Reject (**mandatory reason**); Cancel (audited reason): `pending_internal_approval → submitted | → draft | → cancelled` | GI-10 · **No auto-approve timeout** (Doc-3 §1.2) · approver-scope via `can_approve_rfq`; **award-threshold approval requires Director/Owner** (Doc-3 §9.4) |
| **P-BUY-13** Routing log / invitations | `T-LISTING §3` | Observe routing waves + invitations (`J-PROC-07`) | R: `get_routing_log`, `list_invitations` | `data-table` · `status-chip`(invitation state) · `timeline`(routing waves) · `pagination-control`; opt filter | `SK-LIST` / Empty="No invitations yet" (**must not imply exclusion**) / `error-state` | None (**engine dispatches invitations**) | **No excluded vendor shown; deferral invisible** (Inv#11; Doc-3 §4.2) · analytics never logs excluded · buyer never dispatches (R6) |

### Section 3 — Quote evaluation & award (P-BUY-14…18) — the MOAT firewall surfaces

| P-BUY · name | `T-*` | Purpose | Bound contracts | Primary components | State-primitive plan | Buyer actions (Doc-4M-gated) | Guardrails (load-bearing) |
|---|---|---|---|---|---|---|---|
| **P-BUY-14** Quotation detail | `T-DETAILS §4` (Devices D/T) | View a single received quotation (`J-PROC-08`) | R: `get_quotation`; W: `shortlist_quotation` (where permitted) | detail hero (vendor + status) · line-item table · `currency-display` · `file-link` · `status-chip` · breadcrumbs; opt `trust-badge`, version timeline, button(shortlist) | `SK-DETAIL` / Empty+Not-found byte-identical / `STATE` re-derives | Shortlist (only where Doc-4M permits) | **Visibility-gated** (`quotation_visibility`; cross-vendor isolation, Doc-5E R5) · buyer sees this disclosed quotation's real values (Doc-3 §9.1) · GI-10 · Doc-5E names no distinct shortlist slug — bound by pointer, none coined · AI explain reserved, non-recommending |
| **P-BUY-15** Comparison statement | `T-ANALYTICS §9` (desktop-only, `D`) | Read the **System-generated** quotation comparison — decision support (`J-PROC-09`) | R: `get_comparison_statement` | comparison-matrix (read-only, 24-col `data-table`) · `currency-display` · `status-chip` · `score-ring`(vendor-standing signals if provided); opt `ai-advisory-panel`(explain, reserved), export | `SK-DASHBOARD`; matrix h-scroll fallback / Empty="No quotations to compare" / `error-state` | Open quotation → P-BUY-14; `invoke_best_and_final` (→ P-BUY-16); **navigate** to permitted next transition | **R6 (load-bearing): NO recommended winner / ranked-to-winner / auto-select; AI panel must NOT recommend** (Inv#12) · rows = price(norm)/delivery/validity/warranty/spec-compliance/vendor-standing + buyer-private columns (Doc-3 §9.1) · **buyer-chosen sort + Approved float are SANCTIONED governed orderings** (Doc-3 §9.1/§7.5), buyer-private (Inv#11) · **UI never re-ranks the governed M3 matching order** (GI-04) · no "recommended" affordance exists · **award is NOT a button this view pre-selects** · export = exclusion-applied user-readable data only, create-then-poll (`ESC-7-API/export`) |
| **P-BUY-16** Clarifications / thread | `T-DETAILS §4` (TB-NONE) | Clarification conversation + best-and-final (`J-PROC-10`) | W: `manage_clarification`, `invoke_best_and_final` (+ M6 thread, Doc-5H) | `conversation-thread`(M6, embedded) · `form-field`(message) · button(send/invoke-BAF) · `file-link`; opt participant list | `SK-DETAIL`; sticky composer on mobile / Empty="No clarifications yet" / `error-state` | Send message (optimistic, idempotency key); `invoke_best_and_final` (cap `eval.baf_rounds_max`=1; reopened window visible to all invitees) | **Thread renders only disclosed messages** — no excluded-party inference (Inv#11) · BAF window visible to ALL invitees, no private rounds (Doc-3 §9.3) · Realtime = transport → re-fetch · non-disclosure-bound |
| **P-BUY-17** Award | `T-WIZARD §6` | Award the RFQ to **exactly one** quotation (`J-PROC-12`) | W: `award_rfq`; R: `can_award_rfq` + threshold | `stepper`(review → confirm) · summary card · `currency-display` · button(award); opt threshold-approval gate step | `SK-WIZARD` / `STATE` if not `shortlisted`; `CONFLICT` on stale / Success: award confirmation + engagement created, idempotency key | Award: `shortlisted → closed_won`; **exactly one `selected` (1:1)**, others → `not_selected`; engagement created (`open`) | **R6: explicit, unranked, never auto-recommended** (Doc-3 §9.1) · **gated `can_award_rfq`** (Doc-4M line 205) · **AI does NOT select — deliberate buyer choice** (Inv#12) · **split sourcing = `reissue_rfq`, never multi-award** · award-threshold approval (Director/Owner) above org threshold (Doc-3 §9.4) · irreversible confirm; value snapshotted immutably (Inv#8) |
| **P-BUY-18** Close lost | `T-DETAILS §4` (TB-NONE) | Close an RFQ as lost, non-penalizing (`J-PROC-12b`) | W: `close_lost_rfq` | `form-field`(reason) · button(close) · `status-chip`; opt confirm summary | `SK-DETAIL` / `STATE` re-derives / `error-state` | Close: `→ closed_lost` (offered only where Doc-4M permits) | **Uniform closure; non-penalizing to vendors** (Doc-3 §9.5; no vendor-visible penalty signal) · GI-10 |

### Section 4 — Post-award operations (P-BUY-19…25) — records/workflow only, no money (R8)

> **Engagement state set pending reconciliation (§0.1):** `open → in_delivery → completed → closed` per Doc-4F §F5 / Doc-2 §3.5; Doc-4M's engagement row diverges (carried Flag-and-Halt). Document children are all `engagement_documents` (single contract family); issue/revise are **202-then-poll** async (Doc-5F §2.3).

| P-BUY · name | `T-*` | Purpose | Bound contracts | Primary components | State-primitive plan | Buyer actions (Doc-4M/4F-gated) | Guardrails |
|---|---|---|---|---|---|---|---|
| **P-BUY-19** Engagements | `T-LISTING §3` | List post-award engagements (`J-PROC-13`) | R: `list_engagements` | `data-table` · `status-chip`(engagement state) · `pagination-control` · `currency-display`; opt filter, search | `SK-LIST` / Empty="No engagements yet" / `error-state` | Open engagement → P-BUY-20 | States `open → in_delivery → completed → closed` (Doc-4F §F5 — §0.1) · own-org (Inv#5) · GI-03 cursor |
| **P-BUY-20** Engagement detail | `T-DETAILS §4` | Post-award hub: state + documents (`J-PROC-13`) | R: `get_engagement`, `get_engagement_document`; W: `update_engagement_status`, `close_engagement`, `record_buyer_feedback`; (delivery: `record_delivery`) | detail hero (status) · tabs (Overview/Documents/Payments) · `timeline` · `file-link` · `status-chip` · `currency-display` · breadcrumbs; opt button(state actions), `ai-advisory-panel`(reserved) | `SK-DETAIL` / Empty+Not-found byte-identical / `STATE` re-derives | Advance (`update_engagement_status`) / Close (`close_engagement`) / record feedback (where permitted); links to PO/payment/invoice/challan/WCC | **R8: records only, no funds** (DF-6) · GI-10 · **dispute = trade-invoice `→ disputed` + `DisputeRecorded`, not an engagement state** (Doc-4F §F5.5) · engagement enum pending Doc-4M reconciliation (§0.1) · AI explain reserved, non-recommending |
| **P-BUY-21** Purchase order / LOI | `T-DETAILS §4` | Issue/view a PO or LOI, versioned (`J-PROC-13`) | W: `issue_engagement_document`, `revise_engagement_document`; R: `get_engagement_document` / `get_generated_document`; R: `can_approve_po` | detail hero · line-item table · `currency-display` · `file-link` · button(issue/revise) · `status-chip` · `timeline`(versions); opt approval gate | `SK-DETAIL`; **202 ACCEPTED → poll `get_generated_document` (ASYNC_PENDING while pending)** / Empty="No PO issued"+issue CTA / `STATE` re-derives | Issue / Revise (revise **requires reason**) | **PO needs `can_approve_po`** in addition to create perm (Doc-4F §F5.4) · **versioned; overwrite forbidden** (Inv#8) · **R8: a record, not settlement** · async generation (202/poll, R9) |
| **P-BUY-22** Payments | `T-DETAILS §4` | Record/confirm payments — **records only, no funds** (`J-PROC-13`) | W: `record_payment`, `confirm_payment`; R: `can_approve_payment` | `data-table`(payment records) · `form-field` · button(record/confirm) · `currency-display` · `status-chip` · `file-link`; opt filter | `SK-DETAIL` / Empty="No payment records"+record / `STATE` re-derives | Record (`recorded`); Confirm (`→ confirmed`, gated `can_approve_payment`) | **R8/DF-6: NO funds movement; copy must not imply settlement** · `can_approve_payment` wired read · proof attachment → `file_ref` (`ESC-7-API/upload`) |
| **P-BUY-23** Trade invoice review | `T-DETAILS §4` | Review/approve a **trade** invoice — **≠ platform invoice** (`J-PROC-13`) | W: `update_trade_invoice_status`; R: `get_engagement_document` | detail hero · line-item table · `currency-display` · `file-link` · button(approve/dispute) · `status-chip` · `timeline`; opt dispute action | `SK-DETAIL` / Empty+Not-found byte-identical / `STATE` re-derives | Approve / Dispute via `update_trade_invoice_status`: `issued → partially_paid → paid | disputed | cancelled` | **R8: records only — `operations.trade_invoices` ≠ `billing.platform_invoices`, no funds custody** (Doc-4F §F5.5) · `→ disputed` emits `DisputeRecorded` |
| **P-BUY-24** Challan | `T-DETAILS §4` | View a delivery challan, versioned (`J-PROC-13`) | R: `get_engagement_document` | detail hero · line-item table · `file-link` · `status-chip` · `timeline`(versions) · `currency-display` | `SK-DETAIL` / Empty+Not-found byte-identical / `error-state` | Download (read) | **Vendor-side records delivery (`record_delivery` emits `DeliveryRecorded`); buyer reads** · versioned (Inv#8) · own-org |
| **P-BUY-25** WCC | `T-DETAILS §4` | View a Work Completion Certificate (`J-PROC-13`) | R: `get_engagement_document` | detail hero · `file-link` · `status-chip` · `timeline`; opt currency-display | `SK-DETAIL` / Empty+Not-found byte-identical / `error-state` | Download (read) | Versioned; `issue_engagement_document` (`doc_kind=wcc`) emits `WorkCompletionIssued` (proof-of-work, Trust input — display only; R7 firewall, never computed here) · own-org |

### Section 5 — Buyer-private CRM (P-BUY-26…27) — Invariant #11, undetectable blacklist

| P-BUY · name | `T-*` | Purpose | Bound contracts | Primary components | State-primitive plan | Buyer actions | Guardrails (load-bearing) |
|---|---|---|---|---|---|---|---|
| **P-BUY-26** CRM — vendor list | `T-LISTING §3` | The buyer's **private** vendor CRM list (`J-PROC-14`) | R: `list_private_vendors`, `get_buyer_supplier_relationship` (own-org) | `data-table` · `status-chip`(CRM status) · `search` · `filter` · `pagination-control`; opt bulk-action bar, `trust-badge` | `SK-LIST` / Empty="No CRM entries yet" / `error-state` | Open CRM vendor → P-BUY-27 | **Inv#11: BUYER-PRIVATE — NEVER leaks; blacklist undetectable**; never appears on discovery/public/vendor surfaces, counts, facets, or telemetry · analytics own-org only; no `crm.*` event coined (Doc-5F R5) · `read_crm_status_for_routing` is internal-service/out-of-wire — **frontend never calls it** |
| **P-BUY-27** CRM — vendor detail | `T-DETAILS §4` | Manage one vendor's **private** CRM status/notes (`J-PROC-14`) | R: `get_private_vendor`; W: `update_private_vendor`, `add_private_vendor_note`, `set_private_vendor_rating`, `set_buyer_vendor_status` / `clear_buyer_vendor_status` (BC-OPS-1) | detail hero · `form-field`(notes) · button(set status) · `status-chip` · `timeline`(notes/activity); opt `trust-badge`(read-only) | `SK-DETAIL` / Empty="No notes yet" / `CONFLICT` on stale | Edit / Note / Rate / Set status (Approved/Conditional/Blacklisted via `set_buyer_vendor_status`) / Clear status | **Inv#11: NEVER leaks — buyer-private; Approved/Blacklisted NEVER mutates platform-wide scores** (§4 firewall, R7) · **`set_buyer_vendor_status` = append-only history, EMITS NO EVENT** (Doc-5F R5) · **blacklist undetectable to vendor (byte-equivalence)** · status set never emits any vendor-visible signal/notification · approved/blacklist are *enum values* of one `set_buyer_vendor_status`, not separate commands |

---

## 11. Component mapping & data architecture

### 11.1 Template → page map (the seven templates the Buyer Workspace instantiates)

The Buyer Workspace uses 7 of the 11 `PT` templates (authoritative per-page value = PI *Template* column; canonical layout = `PT §n`):

| Template (`T-*`) | Buyer pages | Rationale |
|---|---|---|
| **T-DASHBOARD** (`PT §5`) | **P-BUY-01** | Role home: KPI band (wired reads only — no fabricated/excluded counts) + "needs your action" queues + activity, per-widget Suspense. |
| **T-LISTING** (`PT §3`) | **P-BUY-02, 03, 05, 06, 09, 13, 19, 26** | Every filterable, cursor-paginated collection: discovery, favorites, RFQ list, the RFQ-detail Quotations tab, routing log, engagements list, CRM list. `data-table`/card-grid + `TB-LIST`; offset pager forbidden (GI-03). |
| **T-DETAILS** (`PT §4`) | **P-BUY-04, 08, 10, 11, 14, 16, 18, 20, 21, 22, 23, 24, 25, 27** | Every single-entity hub: vendor profile, RFQ detail (Overview+Activity host), version history, quotation detail, clarifications thread, close-lost, engagement detail, and the post-award document records. Hero + tabs + right-rail; actions are **Doc-4M/4F-permitted only** (GI-10). |
| **T-WIZARD** (`PT §6`) | **P-BUY-07, 17** | Multi-step, state-machine-gated authoring: RFQ creation (resumable draft) and Award (review → confirm, gated `can_award_rfq`). AI may draft, the **buyer confirms and the module commits** — never auto-submit/auto-select (Inv #12). |
| **T-MANAGEMENT** (`PT §8`) | **P-BUY-12** | Internal-approval queue: selection-first `data-table` + decision actions (`approve_rfq`/`reject_internal_rfq`/`cancel_rfq`, reason mandatory); no auto-approve timeout. |
| **T-ANALYTICS** (`PT §9`) | **P-BUY-15** | The firewall-critical comparison matrix (24-col): **read-only, System-generated, non-recommending** — no "recommended winner," no client re-rank of the governed matching order, no award button pre-selected (R6); buyer-chosen sort + Approved float are the governed orderings (§6.1). |

(Sections **not** in the buyer leg: `T-LANDING`/`T-STATIC` are Public Surface D; `T-AUTH` is `(auth)` Surface E; `T-STATE` is the Doc-7C shell P-SH-03…06; buyer settings — buyer profile (P-ACC-14), workflow/approval-chain + award threshold (P-ACC-13) — live in **Account Surface E**, not Doc-7F, reached via the user menu / settings nav, not the Procurement sidebar.)

### 11.2 Reuse table — existing built/frozen kit (Doc-7B kit in `src/frontend/`)

Status key: **Built** = present on disk in the frozen Doc-7B kit + public shell (verified against `src/frontend/primitives/` and `src/frontend/components/`). `status-chip` drives all Doc-4M state rendering; `currency-display` defaults BDT per `GI-08`. Embedded components are single-owned (Doc-7B §5) and read-only.

| Component (tier) | Status | Buyer screens that consume it |
|---|---|---|
| **button** (primitive) | Built | All 27 (actions, navigation, save/submit/confirm) |
| **input** (primitive) | Built | P-BUY-07, 12, 16, 17, 18, 21, 22, 26, 27 (via form-field) |
| **dialog** (primitive) | Built | P-BUY-07 (discard), 08 (cancel/reissue), 12 (reject-reason/approve), 14 (shortlist), 17 (**award confirm, irreversible**), 18 (close), 20–23 (state confirms), 27 (set-status/blacklist) |
| **dropdown-menu** (primitive) | Built | Toolbars/overflow on P-BUY-06, 08, 09, 12, 19, 26 (sort/filter/density/row-overflow) |
| **tabs** (primitive) | Built | P-BUY-04, 08 (Overview/Quotations/Activity), 20 (Overview/Documents/Payments) |
| **tooltip** (primitive) | Built | P-BUY-04/15 (trust ring value, signal labels), 22 (record-only clarifier), 12 (threshold note) |
| **badge** (primitive) | Built | P-BUY-01 (KPI accents), 26 (CRM tags); distinct from status-chip |
| **card** (primitive) | Built | P-BUY-01 (KPI/meta), 02/03/04/05 (vendor/product cards), 08/14/17 (summary cards) |
| **skeleton** (primitive) | Built | All 27 via `SK-DASHBOARD/LIST/CARD/DETAIL/WIZARD` presets (GI-05) |
| **avatar** (primitive) | Built | P-BUY-02/03/04 (vendor identity), 16 (thread participants), 26/27 (CRM vendor) |
| **separator** (primitive) | Built | All detail/settings layouts (region/section dividers) |
| **sheet** (primitive) | Built | Mobile filter sheet P-BUY-02/03/06/09/19/26; mobile row-action / thread sheet P-BUY-09/16/20 |
| **form-field** (app) | Built | P-BUY-07 (wizard fields), 12 (reject reason), 16 (message), 17 (award gate), 18 (reason), 21/22 (record), 27 (notes) |
| **status-chip** (app) | Built | **Drives Doc-4M state rendering** on P-BUY-06, 08, 09, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27 |
| **currency-display** (app) | Built | **BDT default (GI-08)** on P-BUY-07, 09, 12, 14, 15, 17, 19, 20, 21, 22, 23, 24(opt), 25(opt) |
| **pagination-control** (app) | Built | **Cursor (GI-03)** on every Listing: P-BUY-02, 03, 05, 06, 09, 12, 13, 19, 26 |
| **file-link** (app) | Built | P-BUY-07, 11(opt), 14, 16, 20, 21, 22, 23, 24, 25 (display via `file_ref`, GI-09) |
| **empty-state** (app) | Built | All 27 (per-screen empty copy delta) |
| **error-state** (app) | Built | All 27 (`error_class` branch + `reference_id`, GI-05) |
| **not-found** (app) | Built | P-BUY-04, 08, 14, 20, 23, 24, 25 (**byte-identical to absence**, GI-12) |
| **trust-badge** (embedded, M5 read-only) | Built | P-BUY-02, 03, 04 (+ optional P-BUY-09/14/26); **R7 — displays, never computes/edits** |

> **Correction (was mis-stated as Built):** `select` / `checkbox` / `radio` / `switch` are **specified in the Doc-7B kit but NOT yet on disk** (`src/frontend/primitives/` contains only `input` among form primitives). They are carried in §11.3 below, not in the Built set. Screens that need them (P-BUY-07/12/16/17/18/21/22/26/27 via `form-field`) depend on those unbuilt primitives.

### 11.3 Net-new / not-yet-built components (NONE coined here — each binds Doc-7B §5 / a `PT` allowed-set entry; "specified" = named by `PT`/`SS`/Doc-7B but not yet on disk)

| Net-new / unbuilt component | Justification & screens | `PT`/Doc-7B binding | Owner | State |
|---|---|---|---|---|
| **select / checkbox / radio / switch** (primitives) | Form primitives specified in the Doc-7B kit (Doc-7B Content Pass-2 line 103) but not yet on disk; consumed via `form-field` on P-BUY-07/12/16/17/18/21/22/26/27. | Doc-7B §5 primitive tier | Doc-7B kit | specified-in-Doc-7B (not yet built) |
| **data-table** | The Listing/Management workhorse: P-BUY-06, 09, 12, 13, 19, 22, 26 (+ recent-RFQ mini-table P-BUY-01). **Re-queries the contract; NEVER re-ranks the governed M3 matching set** (GI-04). | `PT §3.3`; `PT §8.3` (P-BUY-12) | Doc-7B kit | specified-in-Doc-7B |
| **comparison-matrix** | P-BUY-15 only: criteria × quotations, rows per Doc-3 §9.1, **buyer-chosen sort + Approved float (governed), no winner column / no recommended affordance** (R6). 24-col `data-table` variant. | `PT §9.3` (`T-ANALYTICS`) | Doc-7B kit | specified-in-Doc-7B |
| **capability-matrix** | Vendor 4-flag capability (`can_supply`/`can_service`/`can_fabricate`/`can_consult`) on P-BUY-02, 03, 04 — a **matrix, not a label** (Inv #1). Read-only. | `PT §3.3`/`§4.3` (vendor cards) | Doc-7B kit / M2 read | specified-in-Doc-7B |
| **capacity-bar** | Capacity-profile display on P-BUY-02/03/04 (optional). Read-only M2/M5. | `PT §4.3`/`§5.3` | Doc-7B kit | specified-in-Doc-7B |
| **score-ring** | Vendor-standing signal display P-BUY-15 (if provided), vendor trust ring P-BUY-04 (optional), dashboard P-BUY-01 (Hybrid). **Read-only; firewall — never computes** (R7). | `PT §4.1/§4.3`, `§5.3`, `§9.3` | Doc-7B kit / M5 read | specified-in-Doc-7B |
| **wizard/stepper chrome + sticky save-bar** | `T-WIZARD` region chrome for P-BUY-07 (RFQ create) and P-BUY-17 (Award): stepper-rail + sticky save-bar. Forward action **state-machine-gated, stable idempotency key**; AI may draft but **module commits** (GI-10, Inv#12). | `PT §6.1/§6.3` | Doc-7B kit | specified-in-Doc-7B |
| **kpi-stat-card band** | `T-DASHBOARD` KPI band on P-BUY-01 (Metric/Trend/Status/…). **Metrics from contract reads; counts respect non-disclosure — no excluded counts** (GI-12). | `PT §5.3` | Doc-7B kit | specified-in-Doc-7B |
| **conversation-thread** (embedded, M6) | P-BUY-16 clarifications: renders **only disclosed messages**, non-disclosure-bound (Doc-7B §5; Inv#11). Realtime = transport. | `PT §4.3` (clarifications) | Doc-7B §5 single-owned (M6) | specified-in-Doc-7B |
| **ai-advisory-panel** (embedded, M9, reserved) | Optional reserved on P-BUY-01, 04, 08, 15, 20: **suggests/explains only — never recommends a winner / ranks-to-winner / auto-selects / executes** (GI-11, Inv#12, R6). Graceful absence when inactive. | `PT §4.3/§5.3/§9.3` AI line | Doc-7B §5 (M9) | **blocked-by-ESC** (`ESC-7-AI`) |
| **billing-indicator** (embedded, M7) | Optional on P-BUY-01: **delivery-ceiling display only — never a matching-eligibility gate** (R7); reads entitlements (boolean/numeric/enum), never plan-name (Inv #10). | `PT §5.3` | Doc-7B §5 (M7) | specified-in-Doc-7B |

### 11.4 Data-flow architecture (GI-01, GI-02, GI-03, GI-10)

**Server-side data layer (GI-02 / Doc-7C SR5).** The typed wired Doc-5 client executes **only in the Next.js server layer**. The browser never invokes a Doc-5 contract directly, holds no service credential, and never sets `Iv-Active-Organization` — the server attaches the server-validated active-org context (SR3).

- **Reads = React Server Components.** Every screen's data is fetched in an RSC via the typed client: `get_rfq`, `list_rfqs`, `list_quotations_for_rfq`, `get_routing_log`, `list_invitations`, `get_engagement`, `list_engagements`, `get_engagement_document` / `get_generated_document`, `get_private_vendor` / `list_private_vendors`, `get_vendor_profile`. Client Components are limited to ephemeral UI (tab state, dialogs, the command palette, org-switcher trigger).
- **`get_comparison_statement` is a side-effecting read (note).** Per Doc-5E §6.3 / Doc-4E §E8.6, opening the comparison drives `quotations_received → buyer_reviewing` **in the same transaction as the read on first open**. It is therefore fetched **non-cacheably** with the state transition handled **idempotently** (state-guarded — subsequent opens are a no-op on an already-`buyer_reviewing` RFQ) and a 409 reconciled per GI-10; it is **not** treated as an ordinary cache-eligible RSC read.
- **Writes = server actions.** Client Components trigger server actions only: `create_rfq`/`update_rfq`/`submit_rfq`, `approve_rfq`/`reject_internal_rfq`/`cancel_rfq`, `shortlist_quotation`, `manage_clarification`, `invoke_best_and_final`, `award_rfq`, `close_lost_rfq`, `update_engagement_status`/`close_engagement`/`record_buyer_feedback`/`record_delivery`, `issue_engagement_document`/`revise_engagement_document`, `record_payment`/`confirm_payment`, `update_trade_invoice_status`, and the CRM writes (`update_private_vendor`/`add_private_vendor_note`/`set_private_vendor_rating`/`set_buyer_vendor_status`/`clear_buyer_vendor_status`). The action consumes the Doc-5A envelope and branches errors on `error_class` (never HTTP status), surfacing `reference_id` and never enriching with protected facts (GI-05).

**Idempotency + 409 reconcile (GI-10 / SR5).** Every state-transition submission carries a **stable idempotency key per submission**. On `CONFLICT`/`STATE` (409) the UI **re-derives the offerable Doc-4M/4F transitions** and offers an idempotent retry rather than a blind one — load-bearing on:
- **P-BUY-07** (`draft → pending_internal_approval` *or* `submitted` per `can_approve_rfq`),
- **P-BUY-12** (`pending_internal_approval → submitted | draft | cancelled`),
- **P-BUY-15** (first-open comparison transition `quotations_received → buyer_reviewing`),
- **P-BUY-17** Award (`shortlisted → closed_won`, gated `can_award_rfq`; stale → `CONFLICT`; not-in-`shortlisted` → `STATE`),
- **P-BUY-20/21/23** (engagement advance + 202-then-poll document generation).
Only **Buyer-actor, Doc-4M/4F-permitted** transitions are ever offered; **System transitions** (`matching`, `vendors_notified`, comparison generation, `expire_rfq`, engagement creation, document generation) are **displayed, never invoked** (FR9).

**Async document generation (R9 / Doc-5F §2.3).** `issue_engagement_document` / `revise_engagement_document` return **`202`**; the UI polls **`get_generated_document`** (the source-of-truth status resource), rendering an `ASYNC_PENDING` body-state until the job completes — never a fabricated outcome. Large comparison export = create-then-poll under `ESC-7-API/export` (P-BUY-15).

**Cursor pagination (GI-03 / Doc-7C §5.3).** Every `T-LISTING`/`T-MANAGEMENT` buyer list uses opaque-cursor pagination with `page_size` from the relevant `*.list_page_size_max` POLICY key (`operations.list_page_size_max`, `rfq.*`, `marketplace.*`); **offset/page-number pagers are forbidden**; `total_count` renders **only** if the contract provides it (a client-computed total could leak an exclusion count — GI-12; e.g. P-BUY-13 "No invitations yet" must never imply exclusion).

**Suspense / streaming.** Independent Suspense boundaries stream where the surface composes several reads: the **P-BUY-01 dashboard** (each KPI/queue/activity widget its own boundary; a single widget failure shows a scoped `error-state` without taking down the dashboard); the **RFQ detail (P-BUY-08) tabs** (Overview/Quotations/Activity stream independently); the **engagement detail (P-BUY-20)** (Overview/Documents/Payments stream independently).

**Files & async (GI-09).** Post-award attachments and RFQ spec attachments transfer **directly to/from Supabase Storage**; the contract carries `file_ref` only. There is no client-facing upload-grant contract in the frozen wired surface today → the file-upload path is carried as **`ESC-7-API/upload`**, rendered as a clearly-labeled interim placeholder citing the handle — **never invented**. Interim presentation: display existing `file_ref` via **file-link** only (read/download); any "upload" affordance is a clearly-labeled placeholder. Resolution is upward only (CLAUDE.md §11); no local invention.

---

## 12. Conformance & guardrail register

Each guardrail maps to **where in this design it is enforced** → **the anti-pattern it forbids**.

| Guardrail (frozen anchor) | Enforced in this design at | Anti-pattern it forbids |
|---|---|---|
| **R6 — no auto-decision; award unranked & deliberate** (Doc-5E R6; Doc-3 §9.1; Inv #12) | §6.1, §5.2 (`shortlisted → closed_won`, gated `can_award_rfq`), §8 Flow 3 award gate, §10 P-BUY-15 (`T-ANALYTICS`, no "recommended" affordance) & P-BUY-17 (`T-WIZARD`, no default selection), §11.1 (`T-ANALYTICS` rationale) | "Recommended supplier" banner; default-selected quotation; AI saying "choose vendor X"; comparison that ranks-to-winner; **client re-rank of the governed M3 matching order** (but NOT the sanctioned buyer-chosen sort / Approved float) |
| **Buyer-never-dispatches — invitation dispatch engine-only** (Doc-7F Pass-2 §4.2; FR9; Doc-3 §4.2). **Carried `[ESC-7-7F-INVITE]`** (FR8/Pass-1 §2.x vs Pass-2 §4.2 — §0.3) | §3.2 (out-of-wire boundary), §3.3 (forbidden cross-links), §6.2, §8 Flow 1 & 6, §10 P-BUY-02/03/04 (no dispatch control) & P-BUY-13 (read-only routing log) | An engine-bypass "dispatch invitation" control; a routing view listing excluded/deferred vendors; an empty routing state implying exclusion |
| **R7 — firewall; quota is delivery ceiling, not eligibility gate** (Doc-5E R7) | §6.3, §8 Flow 2 (matching never money-gated) & Flow 6 (trust read-only), §10 P-BUY-04/15 (read-only signals), §11.3 (score-ring / billing-indicator read-only) | "Excluded by quota" / "Upgrade plan to see vendor"; comparison graying-out by plan; editable trust/tier value |
| **R8 — money boundary; records not settlement; trade invoice ≠ billing invoice** (Doc-5F R8 / DF-6; Doc-4F §F5.5) | §6.4, §8 Flow 4, §10 P-BUY-21/22/23 (records-only; "copy must not imply settlement"; trade invoice distinct from P-ACC-20/21) | "Pay now" / "Release funds" / "Escrow" button; wallet balance; merging trade + platform invoices |
| **Inv #11 — buyer-private CRM; blacklist undetectable** (Doc-5F R5; CHK-7-040/041) | §3.2 (objects 4≠5), §6.5, §8 Flow 5 containment box, §9.3 (no leak in any state), §10 P-BUY-26/27 (`set_buyer_vendor_status` own-org, never evented), §11.4 (`total_count` only if provided) | Blacklist/Approved badge on a shared/vendor surface; CRM status in a notification/count/facet/error; a coined `crm.*` event; frontend calling `read_crm_status_for_routing`; byte-difference a vendor could detect |
| **Inv #5 — Users Act / Orgs Own** (server-resolved active org) | §3.1 (org-scoped mount), §4.1 (org-switcher → `get_active_context`; `Iv-Active-Organization` server-set), §6.6, §11.4 (server-side data layer) | Trusting a client-supplied org ID for any RFQ/CRM/engagement read |
| **Inv #9 — Content ≠ Presentation** (GI-04; display never re-ranks M3 matching) | §6.6, §8 Flow 2 & 6 (sort/filter re-queries, never re-ranks the matching set), §10 P-BUY-09/15 | Client-side reorder of the governed quotation/matching sequence (the buyer-chosen comparison sort + Approved float are governed, not a client re-rank) |
| **GI-02 — server data layer** (RSC reads / server-action writes; browser holds no credential) | §11.4 (reads = RSC incl. the side-effecting `get_comparison_statement` note; writes = server actions) | Browser calling a Doc-5 contract directly; client holding a service credential |
| **GI-10 — state-machine UI** (offer only permitted transitions; reconcile on 409; stable idempotency key) | §5.2/§5.3 (driver columns), §11.4 (idempotency + 409 reconcile + 202/poll), §10 P-BUY-07/12/15/17/20 | Offering a non-permitted transition; blind retry on 409; missing/unstable idempotency key |

---

## 13. ESC gaps capping fidelity

All handles are existing ESC-registry entries (plus one carried Flag-and-Halt raised by this companion against an intra-Doc-7F tension), bound by pointer; no contract/route/state/slug/event/POLICY key is coined here. Each is rendered with a clearly-labeled interim and never re-explained beyond the pointer.

| ESC / Flag-and-Halt handle | Buyer impact | Interim presentation |
|---|---|---|
| **`ESC-7-API/upload`** — no client-facing upload-grant (signed-URL issuance) in the wired surface | Blocks the *upload* affordance on RFQ spec attachments (P-BUY-07), payment proofs (P-BUY-22), and any buyer-attached document. Reading existing `file_ref` via file-link is unaffected. | Blobs go to Supabase Storage; contract carries `file_ref` only. Display existing files via **file-link**; any "upload" control is a clearly-labeled placeholder citing the handle. Resolution: additive Doc-5x/Doc-4B patch (Board). |
| **`ESC-7-AI`** — a conversational AI navigator/assistant beyond M9's wired `Doc-5K` advisory is absent | The optional `ai-advisory-panel` (P-BUY-01/04/08/15/20) is reserved, not active; no AI assistance ships yet. | AI entry reserved "Coming Soon," limited to `Doc-5K` **non-recommending** advisory; panel absent gracefully. Resolution: additive Doc-5K patch / activation (Board). |
| **`ESC-7-API/export`** — no dedicated bulk-export contract | Caps comparison export (P-BUY-15) and any large list export to user-readable (exclusion-applied) data only. | Export only exclusion-applied user-readable data; large export via **create-then-poll**. Resolution: additive Doc-5x patch (Board). |
| **`ESC-7-API-CATNAV`** — `list_categories` has no Public projection | Caps a full Industrial Category Explorer tree as a discovery aid; relevant where buyer discovery overlaps the public catalog tree. | Render `search_catalog` facets only; counts via facet aggregation. Resolution: additive Doc-5D public-projection patch (Board). |
| **`ESC-7-API-PRODDETAIL`** — `get_product` is User-only → no anonymous product detail | Caps a standalone anonymous product-detail page; products render from `search_catalog` results within authenticated discovery. | Products render from `search_catalog` results. Resolution: additive Doc-5D patch (Board). |
| **`[ESC-7-7F-INVITE]` — Flag-and-Halt (raised by this companion, §0.3)** — Doc-7F FR8 / Pass-1 §2.1/§2.3 ("vendor discovery **to invite**"; "the buyer **chooses whom to invite**") vs Pass-2 §4.2 ("**never sends an invitation**") — an intra-Doc-7F tension on whether/how the buyer targets vendor candidates. | Caps the *form* of any buyer candidate-targeting affordance in discovery (P-BUY-02/04). The unambiguous frozen rule — engine dispatches invitations; buyer never invokes matching/routing; no engine-bypass dispatch control — is fully realized regardless. | Ship **no** engine-bypass dispatch control; treat discovery as research/reference; present candidate-targeting as a **carried open question**, not settled absence. Resolution: Board reconciliation of Doc-7F FR8/Pass-1 vs Pass-2 (cite both verbatim, §0.3). |

> Per the registry rule, each handle is referenced once and **never re-explained** beyond the pointer. The two intra-corpus state-machine divergences (engagement state set, dispute-as-state — §0.1/§0.2) are carried as Flag-and-Halt items in §0, not as ESC-registry handles.

---

## 14. Open questions & next steps

### 14.1 Wave sequencing (binds M3/M4 → later waves)

The Buyer Workspace binds **M3** (RFQ procurement engine) and **M4** (business operations / vendor CRM) surfaces. The current build phase is **Wave 2 (M0 → M1)**; the M3/M4 surfaces this document specifies are **later-Wave work**. This deliverable is **PLANNING ONLY** — it reorders no roadmap and authorizes no out-of-sequence build. The Public/Landing FE is separately Wave-3-gated.

### 14.2 What to confirm in wave planning

- **Carried Flag-and-Halt resolution (§0).** Before the engagement state→screen map (P-BUY-19/20) is built, the Board must reconcile the **Doc-4M (active/disputed/terminated) vs Doc-4F/Doc-2 §3.5 (open/in_delivery/completed/closed)** engagement-state divergence (§0.1) and the **dispute-as-state vs dispute-as-event** question (§0.2). Before any discovery candidate-targeting affordance is designed, the Board must reconcile **`[ESC-7-7F-INVITE]`** (§0.3).
- **Doc-7G/7H seam.** Confirm the precise hand-off points where the buyer leg meets the vendor leg (the same engagement, the shared clarification thread, the routing/quotation seam) so the moat guardrails (especially Inv #11 byte-equivalence and the buyer-never-dispatches boundary) are enforced identically on both legs.
- **`ESC-7-API/upload` resolution.** Confirm the additive Doc-5x/Doc-4B upload-grant patch before any wave that ships RFQ spec attachments or payment proofs — the placeholder is interim only.
- **`ESC-7-AI` activation.** Confirm whether any wave activates the reserved `ai-advisory-panel`; if so, re-verify the non-recommending constraint (R6 / Inv #12) against the active `Doc-5K` advisory contract.
- **Net-new / unbuilt component build order.** `select`/`checkbox`/`radio`/`switch`, `data-table`, `comparison-matrix`, `capability-matrix`, `score-ring`, wizard chrome, and the KPI band are specified-in-Doc-7B but not yet on disk; confirm their build sequence within the kit before the first M3/M4 buyer slice.
- **Account-surface dependencies.** Buyer profile (P-ACC-14) and workflow/approval-chain + award-threshold settings (P-ACC-13) live in Account Surface E, not Doc-7F, but the buyer leg *consumes* the award threshold (§7). Confirm the Surface-E dependency is available before the award gate (P-BUY-17) ships.
- **Hybrid org shell composition.** Confirm the sectioned "Procurement" / "Selling" sidebar composition (Inv #2) for Hybrid orgs before any wave that targets Hybrid participation.

### 14.3 Cross-references to existing companion docs

This deliverable supplements, and is consistent with, the following non-authoritative companion docs (all absolute paths). Where a companion's presentation vocabulary diverges from the frozen contract names (CRM verbs, post-award document verbs, the in-app vendor profile read), **this document binds the frozen Doc-5D/5E/5F names** and surfaces the divergence for upstream correction:
- `e:\Projects\iVendorz\page_inventory.md` — `PI §6` P-BUY-01..27 rows + `PI §13.5` planning matrix (canonical screen metadata; note: P-BUY-14 = D/T, P-BUY-15 = D, P-BUY-07 = D/T)
- `e:\Projects\iVendorz\screen_specifications.md` — `SS §6` P-BUY-01..27 verbatim screen specs + `§ESC` table
- `e:\Projects\iVendorz\page_templates.md` — `PT` T-* region contracts (allowed/prohibited sets)
- `e:\Projects\iVendorz\shared_conventions.md` — `SC §1` GI-01..12, `§3` TB/SK/MB presets, `§4` analytics grammar, `§7` Doc-7B tiers
- `e:\Projects\iVendorz\information_architecture.md` — shell/nav model, sitemaps, ESC register
- `e:\Projects\iVendorz\marketplace_ux.md` — `MX §4` J-PROC-01..14 journey steps, `§8` cross-journey rails
- `e:\Projects\iVendorz\ux_patterns.md` — `UX §8.1–8.5` RFQ/quotation/post-award state machines, `§6.2` KPI cards, `§5.4` progressive disclosure, `§9` mobile
- `e:\Projects\iVendorz\design_philosophy.md` — `--iv-*` token families (space/layout, density, tabular-nums, trust/tier/capability)
- `e:\Projects\iVendorz\ui_realization_framework.md` — assembly/binding pointers, kit tier recital
- `e:\Projects\iVendorz\esc_registry.md` — ESC handles (`ESC-7-API/upload`, `ESC-7-AI`, `ESC-7-API/export`, `ESC-7-API-CATNAV`, `ESC-7-API-PRODDETAIL`)
- `frontend_first_slice.md` (design-wave companion) — the planned/Wave-3-gated first FE slice; reconcile this buyer-leg plan against it during wave planning.

Frozen-corpus anchors (authoritative, do not edit): `generatedDocs/Doc-7F_*_FROZEN.md` (Buyer Workspace FR1-FR12, R6/R7/R8; FR8/Pass-1 vs Pass-2 invite tension — §0.3), `generatedDocs/Doc-7C_Structure_v1.0_FROZEN.md` (shell SR1-SR10), `generatedDocs/Doc-4M_FROZEN_v1.0.md` (RFQ/quotation state sets; engagement-row divergence — §0.1), `generatedDocs/Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md` + `Doc-2 §3.5` (engagement state machine — the contract authority), `generatedDocs/Doc-3_*` (POLICY keys, §7.5/§9.1/§9.5), `generatedDocs/Doc-5E/5F/5D` (R5/R6/R7/R8 verbatim, DF-6, the buyer-leg contract names).

> **Status reminder:** NON-AUTHORITATIVE companion · DRAFT · conforms to the FROZEN corpus · coins nothing · PLANNING ONLY (wave-gated). On any conflict with a frozen document — or between two frozen documents — the response is **Flag-and-Halt** (§0): cite both sources, escalate — never resolve locally.

---

## Appendix — Conformance Verification Log

| Dimension | Severity | Finding (title, abbreviated) | Disposition |
|---|---|---|---|
| Moat & governance | MINOR | "Bands, not competitor values" misapplies a vendor-side rule to the buyer's comparison | **Fixed** — struck from all buyer-comparison refs; buyer sees disclosed quotations' real values (Doc-3 §9.1); banding = vendor loss feedback (§9.5); cross-vendor isolation = `quotation_visibility` (Doc-5E R5) |
| Moat & governance | MINOR | Doc-3 §7.5 mis-cited as anchor for vendor-isolation / banding | **Fixed** — re-pointed to Doc-5E R5 (isolation) and Doc-3 §9.5 (loss banding); §7.5 now used for Buyer Preference / Approved float |
| Moat & governance | MINOR | Absolute "contract order only" omits buyer-chosen sort + Approved float | **Fixed** — scoped GI-04 to the M3 matching/routing order + recommendation cue; buyer-chosen sort and Approved-vendor float explicitly permitted (Doc-3 §9.1/§7.5) in §6.1, §4.3, §9.2, §10 P-BUY-15, §11.1, §12 |
| Moat & governance | OBS | Approved float must not leak CRM | **Fixed** — Inv#11 containment note added for Approved float/columns (§6.5) |
| Coins-nothing / Architecture | BLOCKER (×2) | Buyer-private CRM contracts fabricated (`get_crm_status`/`set_blacklist`/…) | **Fixed** — rebound to frozen BC-OPS-1: `list_private_vendors`/`get_private_vendor`/`update_private_vendor`/`add_private_vendor_note`/`set_private_vendor_rating`/`set_buyer_vendor_status`/`clear_buyer_vendor_status`/`get_buyer_supplier_relationship` (§3.1, §3.2, §5.1, §8 Flow 5, §10 §5, §11.4, §12) |
| Coins-nothing / Architecture | BLOCKER + MAJOR (×2) | Post-award document contracts fabricated (`issue_po`/`get_invoice`/`get_challan`/`get_wcc`/`approve_trade_invoice`) | **Fixed** — rebound to `issue_engagement_document`/`revise_engagement_document`/`get_engagement_document`/`get_generated_document` and `update_trade_invoice_status`; 202-then-poll async reflected (§3.1, §5.1, §8 Flow 4, §10 §4, §11.4) |
| Coins-nothing | MAJOR | Engagement lifecycle commands never bound | **Fixed** — bound `list_engagements`/`get_engagement`/`update_engagement_status`/`close_engagement`/`record_delivery`/`record_buyer_feedback` (P-BUY-19/20) |
| Coins-nothing | MAJOR | Coined analytics events `crm.status_set`/`crm.note_added`/`dashboard.viewed`; contradict "never evented" | **Fixed** — removed coined strings; stated `set_buyer_vendor_status` is append-only, emits no event (Doc-5F R5); telemetry bound to SC §4 grammar by pointer (§8 Flow 5, §9.3, §10 P-BUY-26) |
| Coins-nothing | MAJOR | Favorites mis-pluralized in sitemap | **Fixed** — `list_catalog_favorites` / `add_catalog_favorite` / `remove_catalog_favorite` (§3.1) |
| Coins-nothing / Architecture | MINOR + MAJOR | Award gated on non-existent `can_approve_vendor_selection` | **Fixed** — award gate (P-BUY-17/`award_rfq`) bound to `can_award_rfq` (Doc-4M line 205; Doc-3 §9.4); shortlist (P-BUY-14) bound by pointer with no coined slug (Doc-5E names none) |
| Coins-nothing / Architecture | OBS + MINOR | `get_public_vendor_profile` (anonymous) on authenticated P-BUY-04 | **Fixed** — rebound to `get_vendor_profile` (Doc-5D User leg); public read reserved for Doc-7D (§3.1, §10 §1, §8 Flow 6) |
| Architecture | MINOR | Comparison classified as pure RSC read despite first-open state-write | **Fixed** — §11.4 notes the in-transaction first-open transition; non-cacheable, state-guarded, idempotent, 409-reconciled |
| Architecture / Completeness | MAJOR | "Dispute is NEVER a state" vs Doc-4M | **Fixed (position retained per contract authority; conflict surfaced)** — Doc-4F §F5.5 explicitly states `disputed` is a trade-invoice status, *not* an engagement state, and emits `DisputeRecorded`; the Doc-4M divergence is now carried as a Flag-and-Halt (§0.1/§0.2), not silently asserted |
| Architecture / Completeness | MAJOR + MINOR | Engagement state set conflicts with Doc-4M; misattributed | **Fixed** — engagement states attributed to the contract authority (Doc-4F §F5 / Doc-2 §3.5); Doc-4M divergence raised as a carried Flag-and-Halt (§0.1); P-BUY-19/20 marked pending reconciliation |
| Completeness | MAJOR | Draft locally resolves the Doc-7F FR8/Pass-1 vs Pass-2 "buyer invites" contradiction | **Fixed** — absolutism softened; the unambiguously-frozen rule (engine dispatches, buyer never invokes/dispatches, no engine-bypass control) retained; the FR8/Pass-1 vs Pass-2 tension raised as carried `[ESC-7-7F-INVITE]` Flag-and-Halt (§0.3, §6.2, §13) |
| Completeness | MINOR | `invoke_best_and_final` referenced but never bound | **Fixed** — bound on P-BUY-15/16 and added to §11.4 writes (gating `eval.baf_rounds_max`=1) |
| Completeness | MINOR | `select`/`checkbox`/`radio`/`switch` marked Built but absent on disk | **Fixed** — moved to §11.3 (specified-in-Doc-7B, not yet built); only `input` retained in §11.2 Built |
| Completeness | MINOR | P-BUY-14 device claim wrong (D/T, not D/T/M) | **Fixed** — §9.3 excludes P-BUY-14 from the D/T/M group; P-BUY-14 marked D/T in §10 |
| Completeness | MINOR | State→screen map omits `pending_internal_approval → cancelled` | **Fixed** — `cancel_rfq` added to the row (§5.2, §8 Flow 1, §10 P-BUY-12) |
| Coins-nothing / Completeness | OBS (×2) | CRM names diverge (inherited); discovery/routing/money clean | **Acknowledged** — divergence reconciled to frozen names (see CRM BLOCKER); clean areas recorded, no action |

**Gating status at finalize: BLOCKER=0 · MAJOR=0 · MINOR=0 (post-disposition).**

---

# Part II — Capability, Ownership & Surface Architecture (Board-approved additions)

Part II adds the capability / ownership / surface layer the Board approved, sitting ABOVE the page layer (Platform to Capabilities to Shared Components to Pages). It is additive and conformant: Part I (the page-level deliverable) is retained in full because Doc-7F is surface-organized; Part II makes the reusable spine explicit so the Vendor (Doc-7G) and Admin (Doc-7H) tracks bind the same capabilities and components without duplication. Every binding is a pointer; nothing is coined. These sections are consistent with the carried Flag-and-Halt items in Part I §0 (engagement-state divergence; the [ESC-7-7F-INVITE] buyer-targeting question).


- BC-1 → Doc-4E §E4 (create/update/submit/get/list_rfqs, internal approval, version)
- BC-3 (routing-observation) → Doc-4E §E6 (`get_routing_log`/`get_invitation`/`list_invitations`, OBSERVE-only, engine out-of-wire)
- BC-4 → Doc-4E §E7 buyer-leg reads (`get_quotation`/`list_quotations_for_rfq`, visibility-gated)
- BC-5/BC-6 → Doc-4E §E8 (`get_comparison_statement`, `shortlist_quotation`, `manage_clarification`, `award_rfq`, `close_lost_rfq`)
- BC-OPS-2 → Doc-4F §F5 (`issue_po`, `record/confirm_payment`, `approve_trade_invoice`, `get_challan`/`get_wcc`/`get_invoice`)
- BC-OPS-4 → Doc-4F Part4 (templates; consumed indirectly via `template_version_id`)
- BC-OPS-5 → Doc-4F Part5 (finance records, buyer-leg reads)
- BC-OPS-1 → Doc-4F Part1 (`get/update_crm_status`, `add_crm_note`, `set_approved`/`set_blacklist`)
- BC-MKT-6/7 → Doc-5D / IA §6.3 (`search_catalog`, `list_vendor_directory`, `get_public_vendor_profile`, favorites)


### II.1 Buyer Capability Map

A capability-first layer **above** the pages. The stable unit is the **frozen business-capability code** (`BC-*`); a `P-BUY-*` page is one *composition* of a capability's buyer-leg contracts. Every operation below binds **by pointer** to its frozen owner (CLAUDE.md §3) — the buyer surface **consumes**; the owning module **owns**. No identifier here is coined; gaps carry an `[ESC-7-*]` handle ([`ER`](../../../esc_registry.md)).

**Reading the columns**
- **Capability** — the frozen `BC-*` code and its owning module.
- **Frozen operations (buyer-leg)** — the wired contracts the buyer composes, bound by pointer to the frozen contract doc (Doc-4E §E4–§E8 for M3; Doc-4F Part1–Part5 for M4; Doc-5D / `IA §6.3` for M2). *Read* vs *command* per the contract's frozen template.
- **P-BUY pages powered** — the `page_inventory.md` §6 rows this capability composes.
- **Reused by** — the other surface tracks (Vendor / Admin) that bind the **same owning capability** on their own legs; this is the reuse fact that makes the capability — not the page — the unit.

| Capability (BC-* · owner) | Frozen operations — buyer-leg (by pointer) | P-BUY pages powered | Reused by (other-track legs of the same BC) |
|---|---|---|---|
| **BC-1 — RFQ Lifecycle** (M3 `rfq`, Doc-4E §E4) | `create_rfq` · `update_rfq` · `submit_rfq` · `cancel_rfq` · `reissue_rfq` (commands); `approve_rfq` · `reject_internal_rfq` (internal-approval commands); `get_rfq` · `list_rfqs` · `get_rfq_version` (reads). Status from Doc-4M; versioned (Invariant #8). | P-BUY-06 (list), P-BUY-07 (create wizard), P-BUY-08 (overview), P-BUY-10 (activity), P-BUY-11 (version history), P-BUY-12 (internal approval) | **Admin** binds `moderate_rfq` (M8→M3 leg, P-ADM-04 pass→matching / reject→draft). RFQ reads (`get_rfq`/`list_rfqs`) are the **M3-shared** lifecycle surface across buyer + admin + internal-service. |
| **BC-3 — Routing-Observation** (M3 `rfq`, Doc-4E §E6) | **OBSERVE ONLY:** `get_routing_log` · `get_invitation` · `list_invitations` (reads). **The engine is out-of-wire** — matching/routing run System-actor and **dispatch invitations**; the buyer expresses intent (BC-1) and **reads the positive-only routing log**. **No buyer engine-bypass / dispatch-invitation control on the RFQ leg** (moat). Excluded/deferred vendors never appear (Invariant #11; byte-equivalence). | P-BUY-13 (routing log / invitations) | **Vendor** binds the **received** side — `list_invitations` · `get_invitation` · `respond_to_invitation` (P-VND-15/16). **Admin** binds the internal routing/matching legs (`manage_routing_rule`, `get_matching_results`, P-ADM-19/20/21). Same BC-3 contracts; the buyer leg is read-only observation. |
| **BC-4 — Quotation Review** (M3 `rfq`, Doc-4E §E7, buyer-leg) | `list_quotations_for_rfq` · `get_quotation` (reads, **visibility-gated** by `quotation_visibility`). Buyer **reviews**; the buyer never authors a quotation. | P-BUY-09 (RFQ detail — quotations), P-BUY-14 (quotation detail) | **Vendor** binds the authoring leg of the same BC — `submit_quotation` · `revise_quotation` · `withdraw_quotation` · `request_late_extension` (P-VND-17/18/19/20). BC-4 is **M3-shared**; buyer reads, vendor writes. |
| **BC-5 / BC-6 — Evaluation & Award** (M3 `rfq`, Doc-4E §E8) | `get_comparison_statement` (read; **System-generated, read-only, decision-support — never recommends a winner**, R6) · `shortlist_quotation` · `manage_clarification` (orchestration; thread = M6) · `invoke_best_and_final`; **`award_rfq`** (BC-6 terminal → `closed_won`; **explicit, unranked, 1:1**; threshold approval) · `close_lost_rfq` (BC-6 terminal; non-penalizing). `generate_comparison_statement` is **System-actor**, not a buyer command. | P-BUY-15 (comparison statement), P-BUY-16 (clarifications), P-BUY-17 (award), P-BUY-18 (close lost) | Evaluation/comparison/award are **buyer-decision capabilities** — no symmetric vendor write leg (a vendor never awards). **Admin** never re-ranks or awards (R5/R6). The comparison-matrix presentation is **surface-local** (buyer-only). |
| **BC-OPS-2 — Post-Award Engagement** (M4 `operations`, Doc-4F §F5, buyer-leg) | `issue_po` (`can_approve_po` distinct from `can_create_documents`) · `record_payment` · `confirm_payment` (`can_approve_payment` distinct) · `approve_trade_invoice` (commands); `get_invoice` · `get_challan` · `get_wcc` + engagement reads. **Records only — no funds movement** (R8 / DF-6). Versioned documents (Invariant #8). | P-BUY-19 (engagements), P-BUY-20 (engagement detail), P-BUY-21 (PO), P-BUY-22 (payments), P-BUY-23 (trade invoice review), P-BUY-24 (challan), P-BUY-25 (WCC) | **Vendor** binds the counterparty leg of the same engagement — `upload_delivery_challan` · `record_delivery` · `issue_trade_invoice` (P-VND-23/24/25/26/27). BC-OPS-2 is the **M4-shared, two-party** engagement surface (party-scoped; collapses to `NOT_FOUND` for non-parties). |
| **BC-OPS-4 — Templates** (M4 `operations`, Doc-4F Part4) | **No buyer-direct contract.** Document bodies (PO/challan/invoice/WCC) render from a BC-OPS-4 `template_version_id` resolved **in-module by BC-OPS-2 issuance** (read-only; BC-OPS-4 owns the template). `can_manage_templates` is **not a buyer permission** (Doc-2 §7) → consumed indirectly only; any buyer-facing template-management surface would be an `[ESC-7-*]` gap (none coined here). | (none directly) — surfaced **through** BC-OPS-2 documents at P-BUY-21/23/24/25 | **Vendor / Staff** hold `can_manage_templates` (template authoring leg). BC-OPS-4 is reused as the **shared body-source** behind every party's generated document; buyers and vendors both consume, neither buyer-leg owns it. |
| **BC-OPS-5 — Finance** (M4 `operations`, Doc-4F Part5) | Finance-record **reads** on the buyer leg (engagement-scoped `finance_records`; `can_manage_finance_records` per Doc-2 §7). Surfaces alongside payments/invoices; **records only, no settlement** (DF-6). ≠ platform invoices (M7). | composed into P-BUY-22 (payments) and P-BUY-23 (trade invoice review) finance views | **Vendor** binds finance reads on its side (P-VND-27). BC-OPS-5 is the **M4-shared finance-record** surface; firewall: trade finance never becomes a platform-wide score or a billing fact. |
| **BC-OPS-1 — Buyer-Private CRM** (M4 `operations`, Doc-4F Part1) | `get_crm_status` (own-org read) · `update_crm_status` · `add_crm_note` · `set_approved` · `set_blacklist` (commands). **Buyer-private, append-only, never disclosed/evented** (Invariant #11) — blacklist **never mutates platform-wide scores** (firewall §4) and **never leaks** (byte-equivalence). | P-BUY-26 (CRM — vendor list), P-BUY-27 (CRM — vendor detail) | **None.** BC-OPS-1 is **single-track by design** — private to one buyer org; no vendor or admin leg exists or may exist. This is the one buyer capability with **no reuse**, precisely because privacy is the invariant. |
| **BC-MKT-6 / BC-MKT-7 — Discovery & Favorites** (M2 `marketplace`, Doc-5D / `IA §6.3`) | `search_catalog` · `list_vendor_directory` · `get_public_vendor_profile` (BC-MKT-6 reads; presentation **never re-ranks** M3) + read-only **trust badge** (M5, firewalled); `add_catalog_favorites` · `remove_catalog_favorites` · `list_catalog_favorites` (BC-MKT-7). | P-BUY-02 (discover), P-BUY-03 (vendor directory in-app), P-BUY-04 (vendor profile in-app), P-BUY-05 (favorites) | **Public** track binds the same BC-MKT-6 reads as its anonymous projection (P-PUB-10/12/13; `landing_page_spec.md` SEC-*). BC-MKT-6/7 are the **most-reused capabilities** — the discovery surface shared verbatim across Public + Buyer (+ Vendor discovery). Trust badge stays **M5-owned, read-only** wherever embedded. |

**Closing line:** capabilities are the stable unit of reuse; pages are their composition.

All anchors confirmed against the frozen corpus:
- BC-OPS-1 = Buyer Private CRM (M4/operations), buyer-private, leaves only via CRM service to routing — never leaks (Invariant #11).
- BC-OPS-2 = Engagement & Commercial Documents (post-award), BC-OPS-4 = Templates, BC-OPS-5 = Finance Records — all M4.
- BC-MKT-6 (search_catalog / list_vendor_directory discovery) and BC-MKT-7 (favorites) — M2; confirmed in IA §6.3 and screen specs (P-BUY-05 binds BC-MKT-7).



### II.2 Capability Ownership Matrix

The single load-bearing rule of this matrix — and of the whole buyer surface — is that **the buyer surface CONSUMES and OBSERVES; the owning module OWNS**. Every cell below binds a FROZEN business-capability code to its frozen owning module (CLAUDE.md §3 / Doc-4x); the "Buyer relationship" column records the *only* posture the buyer surface is permitted to take toward that capability. **AUTHORS** = the buyer expresses authoritative intent through a wired write the owning module commits; **CONSUMES-read-only** = the buyer renders a wired read it can never mutate; **OBSERVES** = the buyer reads a System-/engine-produced artifact it can neither generate nor re-order. This separation *is* the moat: the buyer never reaches inside the engine, never re-ranks a System artifact, and never leaks a private one.

| Capability (FROZEN code) | Owning module (CLAUDE.md §3) | Buyer relationship | Firewall / governance note |
|---|---|---|---|
| **BC-1 — RFQ lifecycle** (RFQ aggregate; Doc-4E §E4) | **M3 `rfq`** | **AUTHORS** the RFQ; **OBSERVES** routing | Buyer authors/versions/submits the RFQ (`create_rfq` → `update_rfq` → `submit_rfq`, lifecycle bound to Doc-4M). The buyer **expresses RFQ intent only** — the engine OWNS matching/routing and **dispatches invitations out-of-wire**; the buyer **OBSERVES the routing log positive-only** (`get_routing_log`, `list_invitations`) and has **no engine-bypass dispatch-invitation control** on the RFQ leg (R6; IA §4.9; P-BUY-13). Deferral/exclusion are invisible; "no invitations yet" must not imply exclusion (Doc-3 §4.2; Invariant #11). |
| **BC-4 — Quotation management** (Quotation aggregate; Doc-4E §E7) | **M3 `rfq`** | **CONSUMES-read-only** (vendor AUTHORS) | The **vendor** authors the quotation (`submit_quotation` / `revise_quotation`); the buyer **reads** it (`get_quotation`, `list_quotations_for_rfq`). Quotation visibility is **server-gated, never a client 404**; competitor values are never shown — comparison shows **bands, not competitor values** (Doc-3 §7.5; P-BUY-14). |
| **BC-5 — Evaluation & comparison** (Comparison Statement aggregate; Doc-4E §E8) | **M3 `rfq`** | **OBSERVES** (System-generated); buyer never re-ranks | The comparison statement is produced under the **System actor** (`generate_comparison_statement.v1` — System); the buyer only **reads** it (`get_comparison_statement` → `buyer_reviewing`). It is **decision-support, never a recommendation**: the UI **never generates, re-orders, or ranks-to-winner**; quotations render in the **contract's order** (R6; P-BUY-15). Shortlist (`shortlist_quotation`) is a buyer decision the module commits, gated by `can_approve_vendor_selection`. |
| **BC-6 — Award** (RFQ terminal; Doc-4E §E8) | **M3 `rfq`** | **AUTHORS** (explicit, unranked, 1:1) | `award_rfq` is an **explicit, unranked, deliberate buyer choice** — never auto-recommended, never AI-selected (R6; Doc-3 §9.1). **Exactly one** quotation `selected` (1:1); split sourcing = `reissue_rfq`, **never multi-award**; award above the org threshold needs Director/Owner approval (Doc-3 §9.4). Award is irreversible and value-snapshotted; it creates an `open` engagement (M4). |
| **BC-OPS-1 — Buyer-private CRM** (Private Vendor Record + Buyer–Supplier Relationship; Doc-4F §F4) | **M4 `operations`** | **AUTHORS** (buyer-private) | Buyer authors CRM status, notes, ratings, approved/blacklist (`update_crm_status`, `add_crm_note`, `set_approved` / `set_blacklist`). **Private to the one buyer org, forever — NEVER leaks** (Invariant #11): not shown on discovery or vendor profile, never byte-distinguishable, never mutates any platform-wide score. Buyer-Vendor status leaves BC-OPS-1 **only** via the CRM service to RFQ routing as a Buyer-Filter input; **RFQ owns no copy** (Doc-2 §10.5; Doc-4F DF-3). |
| **BC-OPS-2 — Engagement / post-award docs** (Procurement Engagement; Doc-4F §F5) | **M4 `operations`** | **AUTHORS** post-award docs; engagement state-driven | Buyer authors PO/payment/challan-confirm/WCC/trade-invoice-approval on the buyer leg (`issue_po`, `record_payment` / `confirm_payment`, `approve_trade_invoice`, post-award reads). Engagement state is machine-driven (`open → in_delivery → completed → closed`); a dispute is an **audit action + `DisputeRecorded` event, not a state**. The platform **RECORDS** documents and **never settles buyer↔vendor money** (R8 / DF-6; P-BUY-19/20/21). |
| **BC-OPS-4 — Document generation & templates** (Document Template + Generated Document; Doc-4F §F7) | **M4 `operations`** | **CONSUMES-read-only** generated artifacts | Generated documents/templates are produced by M4; the buyer **renders** them (file-link to Storage `file_ref`). Files are **versioned, never overwritten** (Invariant #8). No client-facing upload-grant exists in the wired surface → **[ESC-7-API]** (file-upload grant). |
| **BC-OPS-5 — Finance records** (Finance Record; Doc-4F §F8) | **M4 `operations`** | **AUTHORS** finance records (records-only) | Buyer authors/reads finance records on the engagement. **Records only — no funds move**; these are **trade records distinct from M7 platform-fee invoices** (R8 / DF-6). |
| **BC-MKT-6 — Discovery / catalog** (`search_catalog`, `list_vendor_directory`) | **M2 `marketplace`** | **CONSUMES-read-only** | Buyer searches/browses the published catalog and vendor directory; **presentation sort/filter is over the contract result set and NEVER re-ranks governed M3 matching** (Golden Rule #4; Doc-7A §6). Published-only; no draft leaks; CRM/blacklist status **never** surfaced on discovery (Invariant #11; P-BUY-02). Public category-tree gaps → **[ESC-7-API-CATNAV]** (facets only). |
| **BC-MKT-7 — Favorites** (`add` / `remove` / `list_catalog_favorites`) | **M2 `marketplace`** | **AUTHORS** (own-org favorites) | Buyer authors own-org favorites (presentation/convenience). A favorite is **not** a CRM signal and carries no governance weight; it never reveals or implies an exclusion/blacklist (Invariant #11; P-BUY-05). |
| Trust Score · Performance Score (signals) | **M5 `trust`** | **CONSUMES-read-only** (displayed) | Scores are **displayed read-only** via the M5 wired read (`get_trust_score`, `get_performance_score`; rendered by the M5-owned `trust-badge`). **Firewall (binding):** the buyer surface **never computes, edits, or influences** a score; scores are auto-calculated under the System actor; M2 reads trust, **never** calculates it (CLAUDE.md §4; firewall). |
| Financial Tier (signal) | **M5 `trust`** | **CONSUMES-read-only** (displayed) | Verified Financial Tier (A–E) is **displayed read-only** (`get_verified_tier`). **Firewall:** Financial Tier never raises Trust, never affects Performance, and **never gates matching/award**; Financial Tier (capability) ≠ Subscription Plan (commercial) (Invariant #10; CLAUDE.md §4). |
| Notifications (delivery) | **M6 `communication`** | **CONSUMES-read-only** (+ read/archive) | Notifications and RFQ/clarification threads are M6-owned (`Doc-5H`); the buyer reads them and may `mark_notification_read` / `archive_notification`. The M6-owned `conversation-thread` renders **only disclosed messages** (no excluded-party inference); **Realtime = transport → re-fetch, never source of truth** (Doc-7C §6.3/§6.4; Doc-7B §5). |
| Billing / quota / entitlements | **M7 `billing`** | **CONSUMES-read-only** (delivery-ceiling) | Entitlement/quota *state* is **displayed read-only** via the M7-owned `billing-indicator` (`Doc-5I`) as **boolean/numeric/enum, never a plan-/role-name** (Invariant #10). Entitlements are a **delivery ceiling, never an eligibility gate**: **no plan gates RFQ matching, comparison, or award** (R7; Doc-3 §11.8). Platform-fee invoices are **distinct from trade documents** (R8 / DF-6). |

**Component-ownership corollary (Doc-7B §5).** The matrix's "owning module OWNS" rule extends to embedded components: single-owner, module-embedded components render their owner's wired read and are **never re-implemented** by the buyer surface — `trust-badge` (M5 `Doc-5G`), `billing-indicator` (M7 `Doc-5I`), `ai-advisory-panel` (M9 `Doc-5K`, advisory-only/non-recommending), `conversation-thread` (M6 `Doc-5H`). Kit-shared primitives + app components live in `src/frontend`. **`comparison-matrix` is the one surface-local component** — buyer-only **presentation** over the System-generated BC-5 comparison statement; it presents, it **never** generates or re-ranks the artifact it displays (R6; P-BUY-15). This is the moat expressed at the component layer, mirroring the matrix's load-bearing line: the buyer **CONSUMES/OBSERVES**, the owning module **OWNS**.

Disk confirms the grounding: 12 primitives, 8 app components (form-field, status-chip, currency-display, pagination-control, file-link, empty-state, error-state, not-found), and trust-badge embedded — all Built. data-table, comparison-matrix, kpi-stat-card, wizard/stepper, conversation-thread, ai-advisory-panel, billing-indicator are not on disk. This matches grounding C.2 exactly.


### II.3 Component Ownership & Lifecycle Matrix

Every component the buyer surface renders is allocated by the frozen Doc-7B ownership model: **Kit-shared** (presentation-only primitives + app components, owned by the kit, composed by every surface) · **Module-embedded single-owner** (defined once, contract-owner stays the module — Doc-7B §5 / BR5 / `CHK-7-005`) · **Surface-local** (buyer-only presentation, never shared). The buyer surface *composes*; it never re-implements a Kit-shared or Module-embedded component and never reaches past an owner's contract. "Built" = present on disk in `src/frontend` (grounding C.2, disk-verified); "Doc-7B-specified" = allocated/specified, not yet built; "ESC-blocked" = build gated behind a named escalation handle.

**Built kit — primitives (`src/frontend/primitives`, Doc-7B BR1 three-layer boundary)**

| Component | Ownership class | Owner | Shared across surfaces? | Consumers | Status |
|---|---|---|---|---|---|
| button | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| input | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| dialog | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| dropdown-menu | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| tabs | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| tooltip | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| badge | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| card | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| skeleton | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| avatar | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| separator | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| sheet | Kit-shared (primitive) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |

**Built kit — app components (`src/frontend/components`, Doc-7B BR9 status primitives + form/data presentation)**

| Component | Ownership class | Owner | Shared across surfaces? | Consumers | Status |
|---|---|---|---|---|---|
| form-field | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| status-chip | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| currency-display | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| pagination-control | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| file-link | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| empty-state | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| error-state | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |
| not-found | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |

> Non-disclosure (Invariant #11; GI-12; `CHK-7-040/041/042`): `error-state`, `not-found`, and `form-field`/`field_errors` encode the no-protected-enrichment + not-found-≡-genuine-absence contract once (Doc-7A §5.4 / §8.2). The buyer surface inherits it by composition; it never adds a buyer-private reveal (status/blacklist) into any state branch, count, facet, or `reference_id` surface.

**Built kit — embedded (`src/frontend/embedded`, Doc-7B §5 / BR5)**

| Component | Ownership class | Owner | Shared across surfaces? | Consumers | Status |
|---|---|---|---|---|---|
| trust-badge | Module-embedded single-owner | M5 (`Doc-5G`) | Yes | Buyer/Vendor/Admin/Platform | Built in `src/frontend` |

> trust-badge renders M5's Trust Score read-only (firewall, Doc-7F R7): the buyer surface displays the band, never computes or re-ranks it (GI-04). Same component, same owner, every surface.

**Net-new — to be built (Doc-7B-specified or ESC-blocked)**

| Component | Ownership class | Owner | Shared across surfaces? | Consumers | Status |
|---|---|---|---|---|---|
| data-table | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Doc-7B-specified (not built; sticky-header, sortable, selectable, cursor-paginated; re-queries the contract, never re-ranks — GI-04; used by T-LISTING/T-MANAGEMENT) |
| kpi-stat-card | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Doc-7B-specified (not built; T-DASHBOARD KPI band, P-BUY-01; renders contract reads only) |
| wizard / stepper chrome | Kit-shared (app component) | Kit (Doc-7B) | Yes | Buyer/Vendor/Admin/Platform | Doc-7B-specified (not built; T-WIZARD stepper-rail + sticky save-bar; state-machine-gated per Doc-4M / GI-10; P-BUY-07, P-BUY-17) |
| comparison-matrix | **Surface-local (buyer-only)** | Buyer surface | **No — buyer-private presentation** | Buyer | Doc-7B-specified as surface composition (not built; T-ANALYTICS, P-BUY-15; renders `get_comparison_statement` in contract order, decision-support only — NEVER re-ranked, NEVER a "recommended winner": Doc-7F R6, GI-04, Invariant #12) |
| conversation-thread | Module-embedded single-owner | M6 (`Doc-5H`, via Doc-7C shell slot) | Yes | Buyer/Vendor/Admin/Platform | Doc-7B-specified (not built; RFQ clarifications P-BUY-16 `manage_clarification`; non-disclosure-bound `CHK-7-040`) |
| billing-indicator | Module-embedded single-owner | M7 (`Doc-5I`) | Yes | Buyer/Vendor/Admin/Platform | Doc-7B-specified (not built; boolean/numeric/enum, never plan-name — Invariant #10; delivery ceiling only, never a matching-eligibility gate — firewall Doc-7F R7) |
| ai-advisory-panel | Module-embedded single-owner | M9 (`Doc-5K`) | Yes | Buyer/Vendor/Admin/Platform | **ESC-blocked — `[ESC-7-AI]`** (not built; suggests-never-decides/ranks, graceful-absence, §8 non-disclosure-bound — Invariant #12 / R6; reserved "Coming Soon") |

**Allocation rules (binding — Doc-7B §5 / BR5)**

- **No per-surface re-implementation.** Anything **Kit-shared** or **Module-embedded single-owner** is defined exactly once and **composed** by the buyer surface — the buyer surface MUST NOT fork, copy, or re-skin a primitive, app component, or embedded component. For embedded components the **contract owner stays the module** (trust-badge → M5; conversation-thread → M6; billing-indicator → M7; ai-advisory-panel → M9); the buyer surface passes props/by-reference and renders, never reshaping or enriching the owner's data.
- **Only Surface-local components are buyer-private.** `comparison-matrix` is the sole buyer-private presentation artifact here: buyer-only, not shared, never promoted to the kit. It is decision-support presentation over the System-generated `get_comparison_statement` and observes the moat guardrails — contract order preserved, bands not competitor values, no auto-recommendation (Doc-7F R6 / Doc-3 §9.1 FIXED). Buyer-private CRM data (status/notes/rating/approved/blacklist, BC-OPS-1) is M4-owned and never embedded in a Kit-shared or Module-embedded surface (Invariant #11); it renders only in buyer-local CRM views (P-BUY-26/27).
- Authority: component ownership classes and the shared-embedded catalog are fixed by **Doc-7B §5** (BR5, `CHK-7-005`). Any embedded component needing allocation or redefinition is **`[ESC-7-DESIGN]`** to the Doc-7B definer; a view needing a non-existent/wrong-actor contract is **`[ESC-7-API]`** (FREEZE-GATE). This section coins nothing — it binds by pointer.


**Component tiers (SC §7 / Doc-7B §5):**
- Primitives: button, input, dialog, table, tabs, checkbox, switch, radio, select, badge, separator, avatar
- App components: data-table, form-field, status-chip, currency-display, pagination-control, file-link, empty-state, error-state, not-found, stepper, timeline, score-ring, capability-matrix, capacity-bar, card, stat-card
- Embedded (single-owned): trust-badge (M5), billing-indicator (M7), ai-advisory-panel (M9), conversation-thread (M6)
- Surface-local: comparison-matrix (buyer-only presentation)
- Shell slots (Doc-7C, GI-01): navigation, org-switcher, notification center



---

### II.4 Page Composition / Dependency Graphs

> **Inherits:** SC §1 (GI) · SC §7 component tiers · Doc-7B §5 ownership · PT region contracts (`T-*`) · the per-page `SS [P-*]` deltas + `PI §13` row. **Coins nothing** — every node below is a real kit/embedded/surface-local component already bound in `SS`/`PT`/`PI`; this section only makes the *composition* (page → region → component → owner) explicit so codegen and duplication are unambiguous. Tokens, states (loading/empty/error/not-found), responsive presets, a11y, and performance posture are **inherited by pointer**, not redrawn per node.

**How to read these trees.** Indentation = composition. Each leaf is tagged with its **tier** and, where single-owned, its **owner module**:

| Tag | Tier (SC §7 / Doc-7B §5) | Ownership |
|---|---|---|
| `[prim]` | Primitive (vendored shadcn/ui) | Kit-shared (Doc-7B) |
| `[app]` | App component (kit composition) | Kit-shared (Doc-7B) |
| `[emb:M_]` | Embedded, single-owned | the named module (M5/M6/M7/M9) — surface **composes**, never re-implements |
| `[surface-local]` | Surface-local presentation | buyer surface only (not promoted to the kit) |
| `[shell]` | Shell slot (GI-01) | Doc-7C — **not** re-implemented by the page |

**Shell frame (inherited by every `(app)` page — drawn once, never repeated below).** Per `GI-01` / Doc-7C, every Buyer page mounts inside the Doc-7C shell: `navigation [shell]`, `org-switcher [shell]`, `notification center [shell]`. These are **not** page-owned regions; the trees start at the page's own content frame. Per-page Loading = its `SK-*` skeleton, Empty/Error/Not-found = `empty-state [app]` / `error-state [app]` / `not-found [app]` (`GI-05`) — also inherited and **omitted from the trees** to keep composition legible.

---

#### II.4.1 P-BUY-15 · Comparison statement — `T-ANALYTICS` (the firewall-critical page)

```text
P-BUY-15 (comparison statement)        SS: get_comparison_statement (read-only, System-generated)
└─ T-ANALYTICS frame (PT §9)
   ├─ page-header region
   │  ├─ breadcrumb / back ............................. [prim] button
   │  ├─ ref label "RFQ-2026-000123" (DISPLAY only) .... [prim] (text; opaque ID in route)
   │  ├─ status-chip (RFQ/statement state) ............. [app]
   │  ├─ density control ............................... [prim] button/select
   │  └─ export action (user-readable data only) ....... [prim] button   → ER ESC-7-API/export
   ├─ content region
   │  └─ comparison-matrix (criteria × quotations) ..... [surface-local]  ◄ buyer-only presentation
   │     │   renders the contract's order; UI NEVER generates/re-ranks (R6, GI-04)
   │     │   shows BANDS, not competitor values (Doc-3 §7.5)
   │     ├─ matrix cell: currency band ................. [app] currency-display
   │     ├─ matrix cell: per-quote signal (if provided)  [app] score-ring        (read-only)
   │     ├─ matrix cell: status .......................  [app] status-chip
   │     └─ row → open quotation (navigate) ............ [prim] button   → P-BUY-14
   └─ right-rail region (optional, PT §9.1)
      ├─ legend / filters ............................... [app] (presentation; re-query, GI-04)
      └─ ai-advisory-panel (reserved; EXPLAIN only) ..... [emb:M9]  ◄ M9 — non-recommending (R6, GI-11)
```

**Composition-level guardrails (load-bearing).** There is **no** "recommended"/"winner"/auto-select node anywhere in this tree — the absence is itself a contract (`SS` "no 'recommended' affordance exists"). `comparison-matrix` is **surface-local** (buyer-only) precisely so it is *not* mistaken for a kit primitive other surfaces could reuse to rank. Award is a **separate page** (P-BUY-17, `T-WIZARD`) — it is **not** a button this analytics view pre-selects. `ai-advisory-panel` is M9-owned and composed, never re-built.

---

#### II.4.2 P-BUY-07 · RFQ create wizard — `T-WIZARD`

```text
P-BUY-07 (RFQ create wizard)           SS: create_rfq → update_rfq → submit_rfq (resumable draft)
└─ T-WIZARD frame (PT §6)
   ├─ page-header region
   │  ├─ task title + draft ref (DISPLAY label) ........ [prim] text
   │  └─ exit / discard-draft trigger ................. [prim] button → dialog (discard confirm) [prim]
   ├─ stepper-rail region
   │  └─ stepper (Details / Specs / Routing / Review) .. [app]   (offers only machine-permitted progress, GI-10)
   ├─ content region (current step, 8-col form)
   │  ├─ form-field × N (inline validation on blur) .... [app]  (composes input/select/checkbox/radio/switch [prim])
   │  ├─ currency-display (value fields, BDT default) .. [app]   GI-08
   │  ├─ category / spec pickers (optional) ............ [prim] select / [app] form-field
   │  ├─ line-item editor (optional) ................... [app] data-table  (cursor; no offset, GI-03)
   │  ├─ file-link (spec attachments) ................. [app]   → ER ESC-7-API/upload (file_ref, GI-09)
   │  └─ ai-advisory-panel (draft assist, reserved) .... [emb:M9]  ◄ M9 — drafts/explains; user confirms, MODULE commits (Inv #12)
   └─ save-bar region (sticky)
      ├─ Back .......................................... [prim] button
      ├─ Save draft (create_rfq / update_rfq) .......... [prim] button   (persist via contract, never local state)
      └─ Next / Submit RFQ (submit_rfq) ................ [prim] button   (stable idempotency key per submission, GI-10)
```

**Composition-level guardrails.** No state-mutating node sits outside a wired command (draft = `create_rfq`/`update_rfq`; final = `submit_rfq`). `ai-advisory-panel` may pre-fill a `form-field` but never drives the save-bar `Submit` node (no AI auto-submit, Inv #12). The buyer expresses intent here; routing/matching and invitation dispatch are **engine-only** and have **no node** in this tree (the moat).

---

#### II.4.3 P-BUY-01 · Buyer dashboard — `T-DASHBOARD`

```text
P-BUY-01 (buyer dashboard)             SS: reads (KPI/queue contracts); Journey J-PROC-01
└─ T-DASHBOARD frame (PT §5)
   ├─ page-header region
   │  ├─ greeting / title ............................. [prim] text
   │  ├─ date range (presentation) .................... [prim] select
   │  └─ Quick Create (role/entitlement-scoped) ....... [shell]  (Doc-7C slot, IA §4.9 — not page-owned)
   ├─ KPI band region
   │  └─ stat-card × N ................................ [app]   (each = one wired read; counts respect non-disclosure, GI-12)
   │     └─ billing-indicator (optional, entitlement) . [emb:M7]  ◄ M7 — boolean/numeric/enum, never plan-name (Inv #10)
   ├─ content-grid region
   │  ├─ recent-RFQ mini-table ........................ [app] data-table  (cursor, GI-03)
   │  │  └─ row status ............................... [app] status-chip
   │  ├─ activity / timeline ......................... [app] timeline    (from immutable audit, M0)
   │  └─ score-ring (optional; vendor context if Hybrid) [app]            (read-only, M5 display)
   └─ right-rail region (optional)
      ├─ shortcuts / "needs action" queue ............. [app] card / data-table
      └─ ai-advisory-panel (reserved; summarize) ....... [emb:M9]  ◄ M9 — non-recommending
```

**Composition-level guardrails.** Every KPI `stat-card` is a wired read — no client-computed authoritative metric node, no excluded/blacklist-count node (GI-12). `billing-indicator [emb:M7]` exposes entitlement state, never a plan-name gate. No "recommended vendor/winner" widget node exists.

---

#### II.4.4 P-BUY-20 · Engagement detail — `T-DETAILS`

```text
P-BUY-20 (engagement detail)           SS: engagement + document reads; records only, no funds (R8/DF-6)
└─ T-DETAILS frame (PT §4)
   ├─ breadcrumb region ............................... [prim] button / text
   ├─ hero region
   │  ├─ identity + status-chip (engagement state) .... [app] status-chip
   │  ├─ currency-display (engagement value) .......... [app]   GI-08
   │  └─ state-machine actions ONLY (advance where permitted) [prim] button → dialog (transition confirm) [prim]   (GI-10, Doc-4M)
   ├─ tabs region (Overview / Documents / Payments) ... [prim] tabs
   │  ├─ Overview: vendor + engagement meta ........... [app] card
   │  ├─ Documents: document list ..................... [app] data-table (cursor) → file-link [app]
   │  │     links to PO/payment/invoice/challan/WCC sub-pages (P-BUY-21..25)
   │  └─ Payments: payment records .................... [app] data-table → currency-display [app]
   │        copy must NOT imply settlement (records only)
   ├─ content region (active tab body) ................ [app] (composed per tab above)
   └─ right-rail region
      ├─ lifecycle timeline (open→in_delivery→completed→closed) [app] timeline  (immutable audit, M0)
      ├─ document peek drawer ........................... [prim] dialog/sheet
      └─ ai-advisory-panel (reserved; explain) ......... [emb:M9]  ◄ M9 — non-recommending
```

**Composition-level guardrails.** A dispute is an audit action + `DisputeRecorded` event, **not a state** — so there is **no** dispute-state node in the status chip or transition set. All money nodes are `currency-display` over recorded data; no funds-movement node exists (R8/DF-6). Sub-document pages (PO/payment/invoice/challan/WCC) are **separate `T-DETAILS` pages** reached by link — not nested compositions here, which prevents duplicating their editors.

---

#### II.4.5 P-BUY-08 · RFQ detail — overview — `T-DETAILS`

```text
P-BUY-08 (RFQ detail — overview)       SS: get_rfq (read); status from Doc-4M
└─ T-DETAILS frame (PT §4)
   ├─ breadcrumb region ............................... [prim] button / text
   ├─ hero region
   │  ├─ ref (mono, DISPLAY label) .................... [prim] text
   │  ├─ status-chip (RFQ state from Doc-4M) .......... [app]
   │  └─ state-machine actions ONLY ................... [prim] button → dialog (cancel/reissue confirm) [prim]
   │        e.g. Submit (submit_rfq) · Cancel (cancel_rfq) · Reissue (reissue_rfq) — surfaced only where Doc-4M permits
   ├─ tabs region (Overview / Quotations / Activity) .. [prim] tabs
   │  ├─ Overview: primary facts ..................... [app] card · currency-display · file-link
   │  ├─ Quotations → list leg ....................... renders P-BUY-09 listing (data-table [app], cursor)
   │  │        contract order authoritative; never re-ranked (R6); visibility server-gated
   │  └─ Activity → routing/audit leg ................ renders P-BUY-10 (timeline [app])
   │        deferral/exclusion INVISIBLE — no excluded-vendor node (Inv #11; Doc-3 §4.2)
   ├─ content region (active tab body) ................ [app] (composed per tab above)
   └─ right-rail region
      ├─ meta sidebar (relations by ID, files) ........ [app] card · file-link
      ├─ lifecycle timeline ........................... [app] timeline   (immutable audit, M0)
      └─ ai-advisory-panel (reserved; explain status) . [emb:M9]  ◄ M9 — non-recommending
```

**Composition-level guardrails.** Hero action nodes are **Doc-4M-permitted transitions only** (GI-10) — the tree offers no fabricated transition. There is **no** "invite vendor" node (invitations are engine-only; the buyer observes the routing log positive-only). The Activity tab composes the routing-log view with **no excluded-vendor / deferral node** (Inv #11).

---

#### II.4.6 Cross-page composition observations (duplication map)

| Component | Tier · owner | Reused across (these 5 pages) | Composition note |
|---|---|---|---|
| `data-table` | `[app]` Doc-7B | P-BUY-01, -07 (line-items), -08/-09, -20 | One kit component; cursor pagination + re-query-never-re-rank inherited (GI-03/04). Do **not** fork per page. |
| `status-chip` | `[app]` Doc-7B | all 5 | Single presentation mapping keyed on contract-reported state (Doc-7B BR3); invents no status. |
| `currency-display` | `[app]` Doc-7B | -07, -15, -20, -08 | `{amount, currency}`, BDT default (GI-08); the comparison-matrix cell composes it, not a bespoke money node. |
| `timeline` | `[app]` Doc-7B | -01, -08, -20 | Always over immutable M0 audit reads. |
| `score-ring` | `[app]` Doc-7B | -01, -15 | Read-only M5 display; in -15 it is a matrix cell, not a ranking control (firewall). |
| `stepper` / `form-field` / `save-bar` | `[app]`/`[prim]` Doc-7B | -07 (also shared with P-BUY-17 Award) | Wizard scaffold is shared; the Award wizard reuses the same nodes — no duplicate stepper. |
| `ai-advisory-panel` | `[emb:M9]` | -01, -07, -08, -15, -20 (all reserved) | **Single M9-owned** component composed everywhere; never re-implemented; always non-recommending (GI-11). |
| `billing-indicator` | `[emb:M7]` | -01 (optional) | **Single M7-owned**; entitlement state only. |
| `conversation-thread` | `[emb:M6]` | *(not in these 5)* — lives on P-BUY-16 | Noted to prevent a thread node being hand-built inside an RFQ tab; clarifications route to P-BUY-16. |
| `comparison-matrix` | `[surface-local]` | -15 **only** | Deliberately **not** promoted to the kit — buyer-only decision-support presentation; isolating it prevents any other surface composing a ranking matrix. |

> **Local governance (this section).** These trees realize `PT` regions with `SS`/`PI`-bound nodes and re-author none of them. The single-owned embedded leaves (`ai-advisory-panel`=M9, `billing-indicator`=M7, `conversation-thread`=M6, plus read-only `trust-badge`/`score-ring`=M5) are **composed, never re-implemented** (Doc-7B §5); `comparison-matrix` is the lone surface-local leaf. Shell slots (`navigation`/`org-switcher`/`notification center`) are Doc-7C-owned and appear in **no** page tree. Where a node needs an absent contract it carries its existing `ER` handle (`ESC-7-API/upload` on -07; `ESC-7-API/export` on -15; `ESC-7-AI` on every reserved `ai-advisory-panel`) — coined nowhere here. **Test → Doc-8.**


Key observations for the matrix:
- ESC handles capping buyer pages: `ESC-7-API/upload` (P-BUY-07 attachments), `ESC-7-API/export` (P-BUY-15 comparison export). No buyer page is fully *blocked* by an ESC; the two are feature-capping deltas. All others have no ESC.
- Engine/System operations that buyer pages only observe (out-of-wire): matching/routing/wave dispatch (P-BUY-10, P-BUY-13), comparison-generation (P-BUY-15), invitation dispatch (P-BUY-13). `expire_rfq` is an engine/System transition observed on P-BUY-08/10.
- The "Reads" are the read contracts; "Writes" are server-action commands. Doc-5E = RFQ leg, Doc-5F = operations leg, Doc-5D = marketplace/discovery, Doc-5C = identity (favorites are BC-MKT-7 / Doc-5D), Doc-5H = M6 comms.


### II.5 Page to API Surface Matrix

> **Inherits-from (reference-never-restate):** the per-page contract bindings are those already named in the grounding — `page_inventory.md` §6 (Binds column) and `screen_specifications.md` §6 (per-page Actions/Search/Permissions deltas), bound upward to the **frozen wired surface**: **Doc-5E** (M3 RFQ leg), **Doc-5F** (M4 operations leg), **Doc-5D** (M2 marketplace/discovery projection), with **Doc-5C** (favorites · identity reads), **Doc-5H** (M6 clarifications/thread), and the M5 read-only score legs cited where embedded. This is a **consolidation of the per-screen specs**, not a new binding; it **coins no contract**. Every row's read/write is the contract already wired at its `P-BUY-*` spec; a gap is an existing `esc_registry.md` handle, never an invented identifier.

**Column legend.** *Reads* = frozen read contract(s) the page resolves via RSC (GI-02), streamed behind skeletons. *Writes* = frozen server-action contract(s) the page invokes, each gated by the actor's **Doc-4M**-permitted transition for the current state (no UI authority). *ESC* = the existing `[ESC-7-*]` handle that **caps** the page (a feature-capping delta, not a page block) — `—` where the page is fully wired. **OUT-OF-WIRE** marks an engine/System operation (matching · routing · wave dispatch · invitation dispatch · comparison-generation · `expire_rfq`) whose **output the page only observes** (positive-only; the buyer never invokes the engine — the moat rail: no engine-bypass dispatch-invitation control on the RFQ leg, IA §4.9 / R6).

**Discovery & favorites flow segment (BC-MKT-6 discovery · BC-MKT-7 favorites · M5 read-only signals)**

| Page | Reads (frozen) | Writes (frozen) | ESC |
|---|---|---|---|
| **P-BUY-01** Buyer dashboard | dashboard/KPI + recent-RFQ reads (`list_rfqs`, engagement reads) · `billing-indicator` entitlement read (M7, read-only) · `score-ring` (M5 read-only, Hybrid context) | — (navigation only; counts respect non-disclosure) | — |
| **P-BUY-02** Discover vendors | `search_catalog`, `list_vendor_directory` (BC-MKT-6) · `trust-badge` (M5 read-only) | `add_catalog_favorite` (BC-MKT-7) | — |
| **P-BUY-03** Vendor directory (in-app) | `list_vendor_directory` (BC-MKT-6) · `trust-badge` (M5 read-only) | `add_catalog_favorite` / `remove_catalog_favorite` (BC-MKT-7) | — |
| **P-BUY-04** Vendor profile (in-app) | `get_public_vendor_profile` (BC-MKT-6) · `trust-badge` / `score-ring` (M5 read-only); CRM status **never** shown here (Invariant #11) | `add_catalog_favorite` / `remove_catalog_favorite` (BC-MKT-7) — **no "invite to RFQ"** (invitations engine-only, OUT-OF-WIRE) | — |
| **P-BUY-05** Favorites | `list_catalog_favorites` (BC-MKT-7) | `add_catalog_favorite`, `remove_catalog_favorite` (BC-MKT-7) | — |

**RFQ lifecycle flow segment (BC-1 RFQ lifecycle · BC-4 quotation mgmt — Doc-5E)**

| Page | Reads (frozen) | Writes (frozen) | ESC |
|---|---|---|---|
| **P-BUY-06** RFQ list | `list_rfqs` (BC-1; cursor pagination, re-query-never-re-rank) | `create_rfq` (BC-1); per-row state actions surfaced **only where Doc-4M permits** | — |
| **P-BUY-07** RFQ create wizard | resumable-draft read (`get_rfq` draft); category/spec pickers | `create_rfq` → `update_rfq` → `submit_rfq` (BC-1). AI advisory drafts/explains only; **the module commits** (Invariant #12) | `ESC-7-API/upload` (attachments → Storage `file_ref`) |
| **P-BUY-08** RFQ detail — overview | `get_rfq` (BC-1); lifecycle timeline from immutable audit (M0). **`expire_rfq` = engine/System transition — OUT-OF-WIRE** (observed) | `submit_rfq`, `cancel_rfq`, `reissue_rfq` (BC-1) — surfaced only where Doc-4M permits | — |
| **P-BUY-09** RFQ detail — quotations | `list_quotations_for_rfq` (BC-4) — **visibility-gated, contract order authoritative, never re-ranked** (R6) | — (navigation to P-BUY-14 / compare) | — |
| **P-BUY-10** RFQ detail — activity | routing/audit reads (immutable audit, M0). **matching · routing waves — OUT-OF-WIRE** (observed positive-only; deferral/exclusion invisible) | — (read; no excluded vendor shown, Invariant #11) | — |
| **P-BUY-11** RFQ version history | `get_rfq_version` (BC-1; versioned, never overwritten — Invariant #8) | — (read) | — |
| **P-BUY-12** Internal approval | pending-approval queue reads; `can_approve_rfq` wired read · `currency-display` | `approve_rfq`, `reject_internal_rfq` (mandatory reason) (BC-1) — `pending_internal_approval` → `submitted` / → `draft`; **no auto-approve** (Doc-3 §1.2) | — |
| **P-BUY-13** Routing log / invitations | `get_routing_log`, `list_invitations` (caller read). **wave dispatch · invitation dispatch — OUT-OF-WIRE** (engine owns invitations; observed positive-only) | — (read; no excluded vendor shown; empty must not imply exclusion — Invariant #11) | — |

**Evaluation & award flow segment (BC-5/BC-6 evaluation & award · BC-4 — Doc-5E; comparison-generation = System/M3)**

| Page | Reads (frozen) | Writes (frozen) | ESC |
|---|---|---|---|
| **P-BUY-14** Quotation detail | `get_quotation` (BC-4) — **visibility-gated; bands not competitor values** (Doc-3 §7.5) | `shortlist_quotation` (BC-5) — only where Doc-4M permits, gated by `can_approve_vendor_selection` | — |
| **P-BUY-15** Comparison statement | `get_comparison_statement` (BC-5; read-only, **System-generated — comparison-generation OUT-OF-WIRE**). Renders in contract order; **never recommends / ranks-to-winner / auto-selects** (R6, Invariant #12) | — (navigate to permitted transition; AI may explain, never recommend) | `ESC-7-API/export` (export = exclusion-applied user-readable data; large = create-then-poll) |
| **P-BUY-16** Clarifications / thread | `conversation-thread` disclosed-messages read (M6, Doc-5H) | `manage_clarification` (+ M6 thread send) (Doc-5H) | — |
| **P-BUY-17** Award | shortlisted-quotation summary read (`get_quotation`); `can_approve_vendor_selection` + threshold wired reads | `award_rfq` (BC-6) — `shortlisted` → `closed_won`; **exactly one `selected` (1:1), unranked, irreversible**; engagement created; split = `reissue_rfq`, never multi-award | — |
| **P-BUY-18** Close lost | RFQ state read | `close_lost_rfq` (BC-1) — → `closed_lost`; uniform, non-penalizing | — |

**Post-award operations flow segment (BC-OPS-2 engagement/post-award docs · BC-OPS-5 finance — Doc-5F; records only, no funds — R8/DF-6)**

| Page | Reads (frozen) | Writes (frozen) | ESC |
|---|---|---|---|
| **P-BUY-19** Engagements | engagement reads (BC-OPS-2; states `open → in_delivery → completed → closed`) | — (navigation to P-BUY-20) | — |
| **P-BUY-20** Engagement detail | engagement + document reads (BC-OPS-2); lifecycle timeline | engagement state-machine actions where permitted (BC-OPS-2); dispute = audit action + `DisputeRecorded`, not a state | — |
| **P-BUY-21** Purchase order | PO read + versions (BC-OPS-2; versioned, overwrite forbidden — Invariant #8) | `issue_po` (+ revise w/ reason) (BC-OPS-2) — gated by `can_approve_po` | — |
| **P-BUY-22** Payments | payment-records read (BC-OPS-5; `recorded → confirmed`) | `record_payment`, `confirm_payment` (BC-OPS-5) — `confirm` gated by `can_approve_payment`; **records only, no funds** (DF-6) | — |
| **P-BUY-23** Trade invoice review | `get_invoice` (BC-OPS-5; trade invoice `issued → partially_paid → paid \| disputed \| cancelled`; ≠ platform invoice) | `approve_trade_invoice` (BC-OPS-5) — `disputed` emits `DisputeRecorded`; records only (DF-6) | — |
| **P-BUY-24** Challan | `get_challan` (BC-OPS-2; versioned). **`record_delivery`/`DeliveryRecorded` = vendor-side — OUT-OF-WIRE** (buyer reads) | — (read; download) | — |
| **P-BUY-25** WCC | `get_wcc` (BC-OPS-2; versioned; `WorkCompletionIssued` is a Trust input) | — (read; download) | — |

**Buyer-private CRM flow segment (BC-OPS-1 buyer-private CRM — buyer-private, never leaks · Invariant #11 / §4 firewall)**

| Page | Reads (frozen) | Writes (frozen) | ESC |
|---|---|---|---|
| **P-BUY-26** CRM — vendor list | `get_crm_status` (BC-OPS-1, own-org) · `trust-badge` (M5 read-only) — **buyer-private; never appears on discovery/public/vendor surfaces; blacklist undetectable** | — (navigation to P-BUY-27) | — |
| **P-BUY-27** CRM — vendor detail | `get_crm_status` (BC-OPS-1, own-org) · `trust-badge` (M5 read-only) | `update_crm_status`, `add_crm_note`, `set_approved`, `set_blacklist` (BC-OPS-1) — **Approved/Blacklisted NEVER mutates platform-wide scores** (§4 firewall); byte-equivalent to the vendor | — |

**Consolidation notes (binding, by pointer).**
- **OUT-OF-WIRE roll-up:** the engine legs the buyer surface only *observes* — matching + routing waves (P-BUY-10), wave dispatch + invitation dispatch (P-BUY-13), comparison-generation (P-BUY-15, System-generated), `expire_rfq` (P-BUY-08, engine/System transition), and the vendor-side `record_delivery`/`DeliveryRecorded` (P-BUY-24). The buyer **expresses RFQ intent and observes positive-only output**; there is **no engine-bypass dispatch-invitation control** on the RFQ leg (moat rail, R6 / IA §4.9).
- **ESC roll-up:** only two existing handles cap a buyer page, both as feature-capping deltas (the page is otherwise fully wired) — `ESC-7-API/upload` (P-BUY-07 RFQ attachments) and `ESC-7-API/export` (P-BUY-15 comparison export). All resolve **only** via their named channel in `esc_registry.md` (additive Doc-5x patch, Board) — never locally (CLAUDE.md §11). No buyer page is *blocked* by an ESC.
- **Embedded single-owner reads** carried inline: `trust-badge` / `score-ring` (M5, read-only — firewall) on P-BUY-01/02/03/04/26/27; `billing-indicator` (M7, read-only) on P-BUY-01; `conversation-thread` (M6) on P-BUY-16. `comparison-matrix` (P-BUY-15) is **surface-local buyer-only presentation** (Doc-7B §5), never a recommendation.
- **Authority of this matrix:** consolidation only. Each cell is the contract already wired at the page's `P-BUY-*` spec (`screen_specifications.md` §6) and named in `page_inventory.md` §6; on any conflict the frozen Doc-5E/5F/5D/5C/5H leg wins and this matrix is patched to match (CLAUDE.md §7).


Key bindings confirmed:
- Governed states: GI-05 (Loading/Empty/Error/Not-found), GI-10 (409 reconcile + idempotency), GI-12 (byte-equivalence/non-disclosure)
- SK presets: SK-LIST, SK-CARD, SK-DETAIL, SK-DASHBOARD, SK-WIZARD (SC §3.2)
- Templates → buyer pages mapping (PT §13 / PI §6)
- T-STATE owns full-page failure surface (PT §12); within-page states are GI-05
- Collapse-to-404 / not-found ≡ absence (PT §4 local gov, PT §12.4, Invariant #11)
- Expired → Doc-4M terminal/expired; Archived → soft-delete (Invariant #8)
- ESC handles exist for gaps (ER)


### II.6 Screen State Matrix

> **Conforms upward, coins nothing.** This matrix extends — never restates — the governed state primitives. Loading / Empty / Error / Not-found are defined once at `SC §1 GI-05` (anchored to Doc-7B §6 · Doc-7A §5.3-5.4/§8); Conflict/Stale reconciliation is `SC §1 GI-10` (Doc-7A §7 · Doc-4M); non-disclosure across every state is `SC §1 GI-12` (Invariant #11 · `CHK-7-040/041`). Skeleton presets are `SC §3.2` (SK-LIST/SK-CARD/SK-DETAIL/SK-DASHBOARD/SK-WIZARD). Each row binds a buyer page (or `T-*` group) by pointer to `PI §6` (P-BUY-01…27) and its template (`PT §13`). The columns below carry **only the per-row delta**; an unmarked cell inherits the GI default verbatim (`SC §2`).

**Column legend (governed UI states).**
- **Loading** — RSC streams behind a skeleton (`GI-05`); preset per template (`SC §3.2`). No invented perf budget (budgets are Doc-8-owned).
- **Empty** — the contract's own empty result, rendered by `empty-state` (Doc-7B §6); never a client-computed total (`GI-03`/`GI-05`).
- **Error** — `error-state` branches on **`error_class`, never HTTP status**; surfaces `reference_id`; no protected enrichment (`GI-05`; Doc-7A §5.4/§8). Hard/route-level failure routes to **T-STATE** (`PT §12`).
- **Not-found** — **byte-identical to genuine absence** (`GI-05`; Invariant #11; `CHK-7-041`); no copy/layout/timing/telemetry tell.
- **Permission** — where there is **no right-to-know, collapse to 404** (the Not-found surface); **never enumerate** what exists or why access is denied (Invariant #11; `PT §4`/`§12.4`; `PI §2`).
- **Conflict/Stale** — on `CONFLICT`/`STATE` (409) re-derive the offerable Doc-4M transitions and retry under a stable idempotency key (`GI-10`; `UX §5.3`).
- **Expired** — a Doc-4M **terminal/expired** state (e.g. closed quotation window): present read-only, offer only Doc-4M-permitted transitions (`GI-10`; Doc-4M).
- **Archived** — soft-deleted / superseded version; visible as immutable history, never hard-deleted, IDs never reused (Invariant #8).

> **"Offline" is intentionally EXCLUDED.** There is no offline/PWA state in this matrix. It is **out of corpus scope** (no PWA in the corpus), and an **offline-write-log-as-truth is a `Doc-7A §11.3` forbidden out-of-frontend artifact → Flag-and-Halt** (CLAUDE.md §11). Loss of connectivity surfaces through the standard **Error** column (`error_class` + `reference_id`), never as a divergent local source of truth.

**Matrix — grouped by `T-*` where states are identical; broken out only where a row carries a load-bearing delta.**

| Page(s) (`PI §6`) | Template (`PT §13`) | Loading (skeleton) | Empty | Error | Not-found | Permission | Conflict/Stale (409) | Expired | Archived |
|---|---|---|---|---|---|---|---|---|---|
| **P-BUY-01** Buyer dashboard | `T-DASHBOARD` | SK-DASHBOARD | per-panel contract-empty (each KPI/queue independently); no fabricated zero | per-panel `error-state` (`error_class`+`reference_id`); panel-scoped, dashboard frame survives | n/a (no single entity) | tiles a member can't read **omit silently** (`GI-12`) — no "restricted" tile | n/a | n/a | n/a |
| **P-BUY-02/03** Discover / Vendor directory | `T-LISTING` (`SK-LIST`/`MB-LIST`) | SK-LIST | contract-empty list (no client `total_count`, `GI-03`) | `error-state` (branch `error_class`, `reference_id`) | n/a (a search yielding nothing = Empty, not Not-found) | excluded/non-eligible vendors are **absent from results** (byte-equivalence, `GI-12`) | n/a (read-only) | n/a | n/a |
| **P-BUY-05** Favorites | `T-LISTING` | SK-LIST | "no favorites yet" contract-empty | `error-state` | n/a | own-org scope only | add/remove 409 → reconcile + idempotent retry (`GI-10`) | n/a | a removed favorite simply disappears from the list (own-org soft state) |
| **P-BUY-06** RFQ list · **P-BUY-19** Engagements | `T-LISTING` | SK-LIST | contract-empty (drives first-RFQ / first-engagement CTA) | `error-state` | collapse-to-404 if no read right (`GI-12`) | n/a (read-only) | terminal/expired RFQs shown as a Doc-4M status chip, not hidden | superseded items shown via version/status, never hard-deleted (Invariant #8) | superseded items shown via version/status, never hard-deleted (Invariant #8) |
| **P-BUY-09** RFQ detail — quotations | `T-LISTING` | SK-LIST | **visibility-gated** contract-empty — no client-side count of withheld quotes (`GI-12`) | `error-state` | **404-collapse** when the buyer has no right to the quotation set | n/a | re-query reflects new arrivals; no optimistic write | quotation window closed (Doc-4M) → read-only list | withdrawn/superseded quotes via status, never removed |
| **P-BUY-13** Routing log / invitations | `T-LISTING` | SK-LIST | positive-only contract-empty (no dispatched invitations *yet*) | `error-state` | n/a | **excluded vendors never appear** — the log is positive-only; absence is total (`GI-12`; Invariant #11). **No engine-bypass dispatch control here** (the moat: buyer OBSERVES the routing log, the engine DISPATCHES). | n/a (observation only) | n/a | n/a |
| **P-BUY-26** CRM — vendor list | `T-LISTING` (buyer-private) | SK-LIST | **buyer-private** contract-empty (`get_crm_status` own-org) | `error-state` | **hard 404-collapse** to any non-member — the CRM's existence must not leak | own-org only; cross-org access is genuine absence | status edits 409 → reconcile (`GI-10`) | n/a | blacklisted/approved status is **never** exposed off-org (Invariant #11) |
| **P-BUY-04** Vendor profile (in-app) · **P-BUY-08/10/11** RFQ overview/activity/version · **P-BUY-14** Quotation detail · **P-BUY-16** Clarifications · **P-BUY-18** Close lost · **P-BUY-20** Engagement detail · **P-BUY-24** Challan · **P-BUY-25** WCC | `T-DETAILS` (`SK-DETAIL`/`MB-DETAIL`) | SK-DETAIL | section-scoped contract-empty (e.g. no activity entries) | `error-state` (`error_class`+`reference_id`); route-level failure → **T-STATE** | **not-found ≡ genuine absence** (`GI-05`; `PT §4` local gov) | **collapse-to-404 where no right-to-know** — no enumeration (Invariant #11) | n/a for read-only sub-tabs; transactional tabs reconcile (see GI-10 rows) | terminal RFQ/quotation/engagement state shown read-only via Doc-4M status; **P-BUY-11** version history is the canonical "expired/superseded" reader | **P-BUY-11** renders prior immutable versions; soft-deleted records remain readable, never reused (Invariant #8) |
| **P-BUY-16** Clarifications / thread | `T-DETAILS` (embeds `conversation-thread`, M6) | SK-DETAIL (thread region via M6 component) | contract-empty thread | `error-state`; thread send failure branches `error_class` | 404-collapse if not a thread participant | non-disclosure on participant set (`GI-12`) | message send 409 → idempotent retry (`GI-10`) | thread on a closed RFQ → read-only per Doc-4M | n/a |
| **P-BUY-21** Purchase order · **P-BUY-22** Payments · **P-BUY-23** Trade invoice review | `T-DETAILS` (Transactional) | SK-DETAIL | contract-empty (no PO/payment/invoice yet) | `error-state`; **P-BUY-22 records only — no funds movement** (DF-6), so no payment-gateway error class | 404-collapse where no right-to-know; `can_approve_po` is a distinct right (absent ⇒ action simply not offered, not a visible "denied") | **issue_po / record_payment / confirm_payment / approve_trade_invoice 409 → re-derive permitted Doc-4M transition + idempotent retry** (`GI-10`) | document on a terminal engagement → read-only | issued/approved documents are immutable; corrections are new versions (Invariant #8) |
| **P-BUY-27** CRM — vendor detail | `T-DETAILS` (buyer-private, Editable) | SK-DETAIL | buyer-private contract-empty | `error-state` | **hard 404-collapse** off-org | own-org only | `update_crm_status`/`add_crm_note`/`set_approved`/`set_blacklist` 409 → reconcile (`GI-10`) | n/a | notes/status are append/versioned; **blacklist never leaks platform-wide** (Invariant #11; firewall) |
| **P-BUY-07** RFQ create wizard | `T-WIZARD` (`SK-WIZARD`/`MB-WIZARD`) | SK-WIZARD | empty/new resumable draft (not an error) | step-scoped `error-state`; `field_errors` inline; attachment upload via `ESC-7-API/upload` (`GI-09`) | 404-collapse if draft not owned by org | **submit 409 → reconcile against server draft + stable idempotency key per submission** (`GI-10`) | a draft past its Doc-4M validity → reconcile to current state on resume | abandoned draft soft-state; never hard-deleted (Invariant #8) |
| **P-BUY-17** Award | `T-WIZARD` (Critical) | SK-WIZARD | n/a (entered from a comparison/quotation context) | `error-state`; threshold-approval failures by `error_class` | 404-collapse if no award right; threshold-approval right distinct | **`award_rfq` 409 → re-derive permitted transition + idempotent retry** (`GI-10`). **Award is explicit, unranked, 1:1** (Doc-2 §5.4 / Doc-3 §9.1) — no auto-select, no ranked default | award attempt on an expired/terminal RFQ blocked by Doc-4M; reconcile to current state | once awarded, the decision is immutable; reversal is a new Doc-4M transition, not an edit (Invariant #8) |
| **P-BUY-12** Internal approval | `T-MANAGEMENT` (`TB-MANAGEMENT`; no offset pager) | SK-LIST | contract-empty approval queue | `error-state` | 404-collapse / silent omit for items the member can't action (`GI-12`) | **`approve_rfq`/`reject_internal_rfq` 409 → re-derive permitted transition + idempotent retry** (`GI-10`); **no auto-approve** | approval on an expired RFQ blocked by Doc-4M | actioned items leave the queue via status, audit-immutable (Invariant #8) |
| **P-BUY-15** Comparison statement | `T-ANALYTICS` | SK-DETAIL (analytics body) | contract-empty when `get_comparison_statement` has no comparable quotations | `error-state` (`error_class`+`reference_id`) | 404-collapse if no read right to the RFQ's quotations | **decision-support only — read-only, System-generated, NEVER recommends / ranks-to-winner / auto-selects** (R6; `GI-04`/`GI-11`). Trust/performance/financial-tier columns are **read-only displays** (firewall). | statement reflects a terminal/expired RFQ read-only | regenerable derived artifact; supersession does not mutate quotations (Invariant #8/#9) |

**Cross-cutting notes (bind, do not restate).**
- **The moat holds in every error path.** No state in this matrix exposes a buyer control to dispatch invitations or to bypass the engine on the RFQ leg; the engine invokes matching/routing and dispatches invitations out-of-wire, while the buyer expresses RFQ intent and **observes** the positive-only routing log (P-BUY-13). Comparison (P-BUY-15) and any AI surface remain advisory and non-recommending in Loading, Empty, and Error alike (`GI-11`).
- **One firewall across all states.** Trust (M5), performance (M5), and financial-tier (M5) are rendered read-only wherever shown; buyer-private CRM/blacklist (M4) collapses to genuine absence off-org in Permission/Not-found (Invariant #11). The buyer surface **consumes**; the owning module **owns**.
- **Hard vs. in-page failure.** A within-page region failure stays in the page frame using the `error-state`/`empty-state`/`not-found` app components (Doc-7B §6); a route-/shell-level failure resolves to the **T-STATE** full-page surface (`PT §12`), which is the canonical home of byte-equivalence.
- **Gaps are handles, not inventions.** Where a state needs a wired affordance the frozen surface does not provide (e.g. client upload-grant for P-BUY-07 attachments → `ESC-7-API/upload`; bulk export of any list → `ESC-7-API/export`), render the `ER` interim presentation labeled with its `ESC-7-*` handle — never fabricate the contract.
- **Performance posture.** All Loading cells are RSC streaming behind the named skeleton preset with suspense boundaries (`SC §1` performance posture); **no LCP/JS/numeric budget is asserted here — those are owned by Doc-8.**

---

**File paths consulted (all absolute):**
- `e:\Projects\iVendorz\ui_realization_framework.md` — RF assembly layer, H-003 states, worked buyer examples
- `e:\Projects\iVendorz\shared_conventions.md` — **SC §1 GI-05/GI-10/GI-12 (governed state primitives), SC §3.2 SK-* presets, SC §7 component ownership** (primary grounding)
- `e:\Projects\iVendorz\page_inventory.md` — PI §6 buyer pages P-BUY-01…27, PI §13 planning matrix, template→page coverage
- `e:\Projects\iVendorz\page_templates.md` — PT §12 T-STATE, PT §4 not-found≡absence/collapse-to-404, PT §13 template→page map
- `e:\Projects\iVendorz\screen_specifications.md` — Doc-4M transition binding, moat/byte-equivalence rails
- `e:\Projects\iVendorz\esc_registry.md` — ESC-7-API/upload, /export, /related, /stats, ESC-7-AI handles

Note: the prompt referenced the grounding as "undefined" (no concrete path supplied). I resolved it to the design-wave companion family (SC/PI/PT/SS/RF/ER) which is the binding source for all GI/SK/T-*/P-BUY identifiers used above; no identifier was coined. If a different single "Part I" consolidated file was intended, point me to it and I will re-anchor the row groupings — though all pointers above are already bound to the frozen/companion sources it would reference.



### II.7 Refinements

These refinements are presentation-layer engineering decisions over the Part I buyer surface. They **coin nothing**: every capability, contract, component, state, and owner is bound by pointer to the frozen corpus and the design grounding (`RF`/`SC`/`PI`/`PT`/`SS`/`MX`/`ER`). On any conflict the frozen document wins and this section is patched to match (CLAUDE.md §7/§11).

---

#### II.7.a Workflow as flow segments

The buyer journey `J-PROC` (`MX §`, the eleven-stage RFQ→post-award flow) is decomposed into six **independently-evolvable UI flow segments**. These are **UI journey stages, not the ten reserved bounded modules** (CLAUDE.md §3) — "Module" stays reserved; each segment is presentation that **consumes** the owning module's contracts and **owns no state** (GI-02).

| Flow segment | Journey stage (`MX`) | Pages (`PI`) | Consumes (contract · owner) | Segment governance |
|---|---|---|---|---|
| **authoring** | J-PROC-02 | P-BUY-07 (`T-WIZARD`) | `create_rfq`, `update_rfq` · M3 (BC-1) | Resumable draft; client never source-of-truth (II.7.d) |
| **internal-approval** | J-PROC-03/04 | P-BUY-12 (`T-MANAGEMENT`) | `submit_rfq`, `approve_rfq`, `reject_internal_rfq` · M3 (BC-1) | No auto-approve; Doc-4M transitions only (GI-10) |
| **routing-observation** | J-PROC-06/07 | P-BUY-13 (`T-LISTING`) | `get_routing_log`, `list_invitations` · M3 | **OBSERVE-ONLY**; the engine matches/routes and **dispatches invitations out-of-wire** (R1); positive-only — **deferral/excluded vendors invisible** (Doc-3 §4.2; GI-12). **No engine-bypass dispatch control on the RFQ leg.** |
| **quotation-review** | J-PROC-08/09/10 | P-BUY-09, P-BUY-14, P-BUY-15, P-BUY-16 | `list_quotations_for_rfq`, `get_quotation` · M3 (BC-4); `get_comparison_statement` · M3 (BC-5); `manage_clarification` · M6 | Visibility-gated; comparison is decision-support, **never recommends** (R6) |
| **award-decision** | J-PROC-11/12/12b | P-BUY-17 (`T-WIZARD`), P-BUY-18 | `shortlist_quotation`, `award_rfq`, `close_lost_rfq` · M3 (BC-5/BC-6) | `award_rfq` **explicit, unranked, 1:1**; threshold approval (Doc-3 §9.4); not pre-selected by comparison |
| **post-award-ops** | J-PROC-13/14 | P-BUY-19…27 | engagement/PO/payment/challan/invoice/WCC · M4 (BC-OPS-2/4/5); `*_crm_*` · M4 (BC-OPS-1) | **Records only, no funds movement** (R8/DF-6); CRM/blacklist **buyer-private, never leaks** (Invariant #11) |

Each segment is independently realizable/reviewable (`RF §3` per-page assembly) and may evolve without reopening the others, because each binds only its own segment's contracts.

---

#### II.7.b Navigation ownership

Navigation is owned once, never duplicated across surfaces (GI-01).

| Element | Owner | Notes |
|---|---|---|
| Topbar · org-switcher · notification center | **Shell (Doc-7C)** — Shell-slot tier (`SC §7`) | Active-org is **server-resolved, never client-trusted** (Invariant #5; GI-01) |
| Buyer **sidebar nav group** | **Buyer surface** | The surface owns only its own sidebar group; it never re-implements topbar/org-switcher/notifications |
| Admin navigation | **Admin surface (separate)** | Distinct surface with **no active-org context**; not a tab inside the buyer shell |

No nav element appears in more than one owner. The buyer surface mounts in the Doc-7C shell and contributes a single sidebar group; it does not fork shell slots.

---

#### II.7.c Comparison-matrix engineering

`comparison-matrix` is a **surface-local component** (buyer-only presentation, not Kit-shared, not single-owner module-embedded) realized on P-BUY-15 / `T-ANALYTICS §9` over `get_comparison_statement` (M3, BC-5). It renders the **contract-ordered** criteria × quotations grid — never a client re-rank (GI-04), never a recommended/ranked winner (R6; `PT §9.4`).

| Concern | Engineering decision | Bound to |
|---|---|---|
| Large dataset | Dense 24-col `data-table` (`DP §2.10`) with column-pin/resize + density; RSC-streamed behind a skeleton (no invented budgets — Doc-8 owns perf) | `PT §9.1/§9.3` · GI-05 |
| Horizontal overflow | h-scroll / column-pin below `xl`; below `lg` degrade to stacked per-quotation cards (criteria as rows) | `PT §9.2` |
| Sticky vendor headers | Quotation-column headers pinned during h-scroll; criteria labels pinned during v-scroll | `PT §9.1/§9.2` |
| Print mode | Print stylesheet of the same contract-ordered, band-only matrix; no winner highlight; opaque ID, `RFQ-…` is a display label only | `PT §9` · `H-004` |
| **Export** | **Gated** by `ESC-7-API/export` (no bulk-export contract yet — interim create-then-poll) **AND** Invariant #11 + R6: export **only user-readable, exclusion-applied** data; **bands, not competitor values**; **no ranking / no winner**; **no buyer-private leak** | `ER ESC-7-API/export` · `PT §9.3` · GI-12 |

The optional `ai-advisory-panel` (M9-embedded) may explain criteria / summarize differences only — **suggests, never decides / ranks-to-winner / auto-selects** (GI-11; Invariant #12).

---

#### II.7.d Wizard recovery (P-BUY-07 / P-BUY-17)

Both wizards (`T-WIZARD`, `UX §5`) recover without ever promoting a client cache to source-of-truth (Doc-7A §11.3; GI-02). No Offline UI state exists — offline is out of scope (no PWA in the corpus).

| Mechanism | Behavior | Bound to |
|---|---|---|
| Autosave to draft | Server-side draft via `create_rfq` → `update_rfq` (M3, BC-1); RFQ state `draft` (Doc-4M). Award wizard autosaves its in-progress selection against `award_rfq`'s threshold-approval step | `PI` P-BUY-07/17 · J-PROC-02 |
| Resume / restore | On re-entry, restore from the persisted draft (server read), not from a browser-held copy | `RF §4.5` · GI-02 |
| Conflict / version-mismatch | **Stable idempotency key per submission**; on `CONFLICT`/`STATE` (409) **reconcile** — re-fetch authoritative state, surface the mismatch, offer only Doc-4M-permitted transitions | GI-10 · Doc-7A §7 |
| Source-of-truth rule | Server draft + contract state are authoritative; **no client cache is promoted to truth** (no offline-write-log) | Doc-7A §11.3 |

File attachments (RFQ spec docs) follow GI-09: blobs to Supabase Storage, contract carries `file_ref` only; client upload-grant is the interim `ESC-7-API/upload`.

---

*Non-authoritative companion (Part II). Conforms upward; coins nothing; binds every capability/contract/component/state/owner by pointer. Gaps are `[ESC-7-*]` handles in `ER`. On any conflict the frozen document wins and this section is patched to match.*

## Part II — Board Disposition Log (CTO + Architecture Board adjudication · 2026-06-30)

Applies §13 *Raise != Accept* + the four-question *Validate-Findings* gate to the external "CTO + Architecture Board Hard Review". A raised finding is a claim, not a mandate; an independent review may override a reviewer's self-classification. **Net:** 6 additive sections (II.1–II.6), 4 in-place refinements (II.7), 3 rejections recorded with cause.

| # | Finding | Review sev. | Board ruling | Disposition |
|---|---|---|---|---|
| F1 | Capability-first vs screen-first | BLOCKER (self: MAJOR) | ACCEPT-AS-MODIFIED — additive layer, pointer to BC-*; page layer retained | Added II.1 (+ dashboard reframe, Part I §9) |
| F2 | Capability ownership matrix | BLOCKER | ACCEPT-AS-MODIFIED — pointer to CLAUDE.md §3/§4 | Added II.2 |
| F3 | Component ownership matrix | BLOCKER | ACCEPT — pointer to Doc-7B §5 | Added II.3 |
| F4 | Page dependency graph | BLOCKER | ACCEPT — additive | Added II.4 |
| F5 | API surface matrix | BLOCKER | ACCEPT — additive (reference-never-restate) | Added II.5 |
| F6 | Screen state matrix | MAJOR | ACCEPT-AS-MODIFIED — extends GI-05/GI-10; Offline excluded | Added II.6 |
| F7 | Dashboard capability-driven | MAJOR | ACCEPT-AS-MODIFIED | Reframed in II.1 + Part I §9 |
| F8 | Workflow modularity | MAJOR | ACCEPT-AS-MODIFIED + correction — flow segments not modules; routing OBSERVE-ONLY | II.7.a |
| F9 | Performance budget | MINOR | REJECT — conflicts with the decided no-invented-budgets stance; Doc-8 owns perf conformance | Not added; pointer to Doc-8 |
| F10 | Navigation ownership | MINOR | ACCEPT | II.7.b |
| F11 | Comparison matrix detail | MINOR | ACCEPT-AS-MODIFIED — export gated by [ESC-7-API/export] + Inv#11 + R6 | II.7.c |
| F12 | Wizard recovery | MINOR | ACCEPT | II.7.d |
| CTO | Platform-Capabilities-Components-Pages altitude | — | ACCEPT as an additive layer (page layer retained) | II.1–II.3 |

**Severity reclassification (§13).** The review labelled five findings BLOCKER, yet none identified a violation of the frozen corpus, an invariant, or a Golden Rule in the base deliverable, and none made it wrong or unsafe — so by the §13 ladder they are reclassified to MINOR-additive enhancements. (F1 self-contradicts: "BLOCKER 1 … Severity: MAJOR".)

**Rejections recorded with cause.**
- **F9 — Performance budgets — REJECTED.** Contradicts the decided FE stance "Performance = RSC streaming behind skeletons, no invented budgets" (GI-11 posture; screen_specifications.md) and encroaches on Doc-8's ownership of performance/a11y conformance (ui_realization_framework.md §5). The design retains the streaming-behind-skeletons performance *model*; any numeric budgets belong to Doc-8.
- **F6 "Offline" state — REJECTED** from the state matrix. No PWA/offline scope exists in the corpus, and an offline-write-log-treated-as-truth is a Doc-7A §11.3 flag-and-halt out-of-frontend artifact.
- **F8 "Module" / "Routing Module" wording — CORRECTED.** "Module" is reserved for the 10 bounded modules (coining one is a Red-Flag STOP); a buyer "Routing Module" would imply the buyer owns routing, violating engine-out-of-wire and the rule that the buyer never invokes matching/routing. Reframed as UI flow segments, routing-observation marked OBSERVE-ONLY.

**Post-disposition gating status vs the frozen corpus: BLOCKER = 0 · MAJOR = 0 · MINOR = 0.** All additions coin nothing (every binding points to a frozen identifier) and are consistent with Part I's carried Flag-and-Halt items (§0.1–0.3), including the [ESC-7-7F-INVITE] buyer vendor-targeting question.