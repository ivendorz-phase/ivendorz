<!--
Status:     v0.3-draft — Stage-1 deliverable of the Admin Console 6-stage pipeline
            (Planning → Board Approval → Hi-Fi Prototype → Visual Approval → FE Impl Plan →
            Production). Full Admin Console (29 surfaces). Authorizes NO build and NO prototype.
            v0.2 pared to true Stage-1 scope (prototype/impl detail → Stage-3 brief; cross-module
            leg contracts corrected). v0.3 = readability pass (§13 round 3): §6 template defined
            once, §12 categorized, review-round history → Appendix A. This is the doc Stage-2 reviews.
Authority:  NON-AUTHORITATIVE planning/design companion. PLANNING ONLY · wave-gated ·
            reorders no roadmap · coins nothing. On any conflict the frozen generatedDocs/
            corpus wins (CLAUDE.md §7) and this document is patched to match. Sibling of
            review_system_planning_and_design.md, buyer_planning_and_design.md,
            vendor_planning_and_design.md.
Produced:   2026-07-08.
Scope:      The full Admin Console — all 29 surfaces (P-ADM-01…29): M8's six bounded
            contexts (Doc-4J) + the cross-module Admin governance legs (Doc-7H HR8).
-->

# iVendorz Admin Console — Planning & Design (all 29 surfaces)

> **Status:** NON-AUTHORITATIVE planning/design companion — **PLANNING ONLY · wave-gated ·
> reorders no roadmap · coins nothing.** The Admin Console is **already fully frozen** in the
> corpus (Doc-4J M8 · Doc-5J HTTP realization · Doc-6J DB realization · Doc-7H FE realization);
> this document realizes its **product/UX/governance** planning surface and binds every entity,
> contract, state, slug, and POLICY key **by pointer** (reference-never-restate). Any genuine gap
> is surfaced as an escalation pointer, never an invention. On any conflict with a frozen document:
> **Flag-and-Halt** (cite both sides, escalate — CLAUDE.md §11), never resolve locally. Backend
> realization is **roadmap-gated** (M8 = **Wave 5**; current = Wave 2 per
> `generatedDocs/Build_Roadmap_v1.0.md`); this is planning ahead of that gate under the standing
> presentation-only parallel authorization ("parallelization, not reorder").

> **Phase boundary (load-bearing).** This is a **Stage-1 planning** document. It defines *product
> goals, UX principles, information architecture, journeys, per-surface governance, and
> constraints* — **not** visual/layout specification (Stage-3) or component/implementation detail
> (Stage-5). Prototype-level design guidance (grid, tokens-in-use, widget composition, interaction
> annotations, responsive breakpoints, prototype deliverables) lives in the **Stage-3 brief**:
> `docs/product/requirements/admin_console_prototype_design_brief.md` (gated behind Stage-2 Board
> approval; authorizes no build). Implementation-level detail (kit primitives, rendering strategy,
> component hierarchy) is deferred to the **Stage-5 FE Implementation Plan**.

---

## 0. Front Matter

### 0.1 Executive summary

The **Admin Console** is the platform-staff governance surface — one platform-scoped operations
console from which staff moderate content, issue enforcement, approve/moderate categories & vendors
& ads, run the verification workflow, import seed data, run vendor outreach, and drive the
cross-module governance legs (trust publication, plan catalog, routing control, identity ops,
support). Its mechanism is **already frozen** across Doc-4J / Doc-5J / Doc-6J / Doc-7H; this package
plans its **product and UX** surface — greenfield, grounded strictly in the corpus, coining nothing.
It covers all **29 frozen surfaces** (`P-ADM-01…29`) as a Stage-1 input to a mockup-first,
visual-approval-gated pipeline. Backend wiring is Wave-5-gated; nothing here authorizes a build.

**What success looks like:** a Stage-2 reviewer can trace every one of the 29 surfaces to its frozen
authority, permission, and lifecycle in a single read, confirm zero coined mechanism, and approve the
console's product/UX/governance scope into Stage-3 — with every genuine gap already surfaced as an
escalation (§12), never a fabrication.

### 0.2 What this is

One cohesive **planning** package: the M8 domain + firewall map, the UX design principles, the
information architecture, the frozen journey bindings, a per-surface **governance** specification
for all 29 surfaces (authority · required information · primary actions · permission · state
machine), the design-system **reuse strategy** (pointer, not a redefinition), the cross-cutting
governance playbooks, WBS coverage, a wave-gated build annex, a concise Stage-3 objectives
statement, and the open questions/escalations. As presiding author I apply the **Validate-Findings
gate** (Valid? Applicable? Best for the product? Consistent with the frozen corpus? — CLAUDE.md §13)
to every review finding; dispositions are recorded in §13.

### 0.3 Scope

- **In scope:** product goals; UX principles; information architecture (frozen nav → surface →
  owner); journey binding; **29 per-surface governance specifications** (authority, required
  information, primary actions, permission, state machine, firewall conformance); the design-system
  reuse strategy (by pointer); the cross-cutting playbooks (non-disclosure · no-active-org ·
  firewall); WBS coverage; a wave-gated build annex (informative); a Stage-3 objectives statement;
  open questions and escalations.
- **Out of scope (by pointer only):** **visual/layout specification** (Stage-3 brief) and
  **component/implementation detail** (Stage-5); any change to a frozen mechanism/contract/state
  machine/slug/event/POLICY key; the matching/routing **engine** (System — Admin adjusts rules,
  never runs matching/awards); any governance **score** computation (owned by M5, auto-calculated
  under System); config/feature-flag **management** (owned by M0, not M8); all backend
  implementation (wave-gated, §10); the e2e/RBAC **test** obligation (Doc-8).

### 0.4 Assumptions

1. The 29 `P-ADM` page IDs are frozen/registered (universe = 151; `scripts/verify-fe-wbs-coverage.mjs`);
   this package proposes no new page ID.
2. The frozen kit (Doc-7B), tokens, and shell (Doc-7C) are the design foundation; the console
   **extends** them and coins no primitive/color/foundation.
3. Backend is Wave-5-gated; the console renders against read-only/seed view-models until then, with
   mutating actions disabled ("Production Development" = the wired Stage-6 build).
4. Where the frozen corpus is silent on a needed contract/read/slug, this package raises an
   escalation pointer; it never fabricates one.

### 0.5 Authority pointers (all FROZEN; bound, never restated)

| Concern | Pointer |
|---|---|
| M8 domain model, BCs, aggregates, columns, tenancy, soft-delete | `generatedDocs/Doc-4J_FROZEN_v1.0.md` (Appendix A contract register · §H rails) · `Doc-4J_PassA_FROZEN_v1.0.md` · Doc-2 §3.9/§10.9 (`admin` schema) · §5 (aggregates) · §7 (permissions) · §9 (audit actions) |
| M8 contracts (32 caller-facing) | `generatedDocs/Doc-4J_FROZEN_v1.0.md` Appendix A (`admin.<operation>.v1`) |
| Wired HTTP realization (M8) | `generatedDocs/Doc-5J_SERIES_FROZEN_v1.0.md` (34 tokens; Admin-only; no active-org; no delegation; R5–R9) |
| DB realization (M8) | `generatedDocs/Doc-6J_SERIES_FROZEN_v1.0.md` (10 tables; `ban_actions` emits `VendorBanned`; `link_suggestions` never vendor-visible; append-only `import_rows`) |
| Frontend realization (the Admin Console) | `generatedDocs/Doc-7H_Structure_v1.0_FROZEN.md` (HR1–HR12 + section spine) · `Doc-7H_SERIES_FROZEN_v1.0.md` — the frozen precedent this package realizes |
| State-machine authority | Doc-2 §3.9/§10.9 + `generatedDocs/Doc-4M_FROZEN_v1.0.md`; the eight M8 lifecycles are quoted verbatim in §4 |
| Cross-module Admin legs (HR8) | ad review + vendor moderation + category governance = **Doc-5D (M2)** · trust publication + verification decision = **Doc-5G (M5)** · plan catalog incl. `activate_plan` = **Doc-5I (M7)** · routing control = **Doc-5E §7 (M3)** · identity governance = **Doc-5C (M1)** · support = **Doc-5H (M6)** |
| Design system (kit / shell / tokens) | Doc-7A (R1–R12) · **Doc-7B (kit/tokens — the reuse authority for all UI composition, §7)** · Doc-7C (`(admin)` shell / notification center) |
| Journeys | `docs/product/journeys/journeys_admin.md` (**J-ADM-01…07**) + `JOURNEY_ATLAS.md` (FE ownership: Doc-7H) |
| POLICY keys | Doc-3 §12.2 via `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin.md` — `admin.idempotency_dedup_window` · `admin.list_page_size_max` (transport-only; never a governance signal) |
| Audited-write pattern | `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` (D7 canonical — binding for every Wave-5 admin write) |
| Stage-3 prototype detail | `docs/product/requirements/admin_console_prototype_design_brief.md` (this doc's design companion; gated) |

### 0.6 Terminology (one voice)

- **Admin Console** — the platform-staff operations surface (mounts the `(admin)` route group; no
  active-org). Never "admin panel," "backend," or "CMS."
- **Acts ON a target by ID** — Admin acts on an org/user/vendor/RFQ **by ID** (a command parameter),
  never **AS** an org. No `Iv-Active-Organization` (HR1/HR11).
- **Admin-decides / owning-module-owns** — the console invokes a wired Admin command; the **owning
  module owns the data/decision/effect** (HR9/R5).
- **Ban ≠ blacklist** — a **ban** is platform-wide enforcement (vendor-visible; emits `VendorBanned`);
  a **blacklist** is buyer-private, undetectable (Doc-7F/7G, not this surface).
- **Workflow ≠ decision** (verification) — Admin owns the **workflow** (`verification_tasks`, M8); M5
  Trust owns the **decision/record/score** (`trust.decide_verification.v1`).
- **Governance leg** — a cross-module Admin command the console invokes on an owning module (HR8),
  bound by pointer to that module's frozen Admin contract.

### 0.7 Revision history

| Version | Date | Change |
|---|---|---|
| v0.1-draft | 2026-07-08 | Initial full authoring (13 sections) |
| v0.2-draft | 2026-07-08 | **Pared to Stage-1 scope** (independent review round 2): prototype/impl detail → Stage-3 brief; §7 widget catalog → design-system reuse strategy; unfrozen nav items → escalations; **corpus corrections** to cross-module leg contracts (namespacing; P-ADM-07 = moderation not approval; `trust.decide_verification.v1` binding; trust-publication leg; support not read-only). See §13. |
| v0.3-draft | 2026-07-08 | **Readability pass** (review round 3, §13.1): §6 surface template defined once (not restated per surface); §12 escalations categorized (Cat column); Rounds 1–2 disposition detail relocated to **Appendix A**; §0.1 "what success looks like" added. 4 MINOR + 7 NIT adjudicated (accept/partial/decline); no governance content changed. |

---

## 1. Design Principles

- **DP-A1 — Admin-decides / owning-module-owns (HR9, R5; Red Flag #8).** Every mutating surface
  invokes a wired Admin command; the **owning module owns the data/decision/effect**. The frontend
  never writes another module's data (contracts-only). Downstream effects are **the owning module's**
  in-process work, never the frontend's — e.g. the ban→Marketplace reflect is **Marketplace's (M2)**
  `VendorBanned` System consumer (`reflect_vendor_ban`, DD-3 — Doc-4J §H.7 / Doc-5D §3.3); **M8 emits
  the event only and never writes vendor-profile status** (consistent with §6.2 / §7).
- **DP-A2 — Platform-scoped, no active-org (HR1, HR11).** No `Iv-Active-Organization`. Every command
  takes its target **by ID**; no surface exposes an org switcher or implies acting AS an org.
  `CHK-7-010` N/A; `CHK-7-012` + `CHK-7-011` APPLY.
- **DP-A3 — Trust firewall: workflow ≠ decision, no score write (HR6, HR10, R8).**
  `verification_tasks` (M8) ≠ `trust.verification_records/decisions` (M5). Admin owns the workflow +
  a reference; the decision is M5's (`trust.decide_verification.v1`). `freeze_/reactivate_trust_score`
  is **publication/ranking only — never edits a value.** The console **writes no governance score**.
- **DP-A4 — Procurement moat: govern, don't procure (HR7, HR10, R7).** No surface makes a
  matching/routing/ranking/selection/award/eligibility decision. `assist_routing` adjusts
  rules/human-assist (Stage-gated); `get_matching_results` is a read; outreach is informational only.
- **DP-A5 — Non-disclosure collapses (HR4, HR11, R6; Invariant #11).** Staff-internal reads (link
  suggestions, verification case detail, fraud signals, admin ratings) are staff-only; an
  unauthorized read collapses to **`NOT_FOUND`** (never "not authorized"). A link suggestion's
  *existence* is itself a protected fact.
- **DP-A6 — Ban ≠ blacklist; single event (HR3, R9).** `admin.issue_ban.v1` emits **`VendorBanned`**
  — the only Doc-2 §8 event M8 produces. A ban is vendor-visible platform enforcement; distinct from
  the buyer-private blacklist.
- **DP-A7 — State-machine UI is navigation, not authority.** A surface renders the frozen lifecycle
  and offers only the transitions the contract allows from the current state; it never coins a queue
  state, bulk-transition, or shortcut edge. System-only transitions (`expire_ban`,
  `process_import_job`) are **displayed, never invoked**.
- **DP-A8 — Information binds to frozen reads (no fabricated data).** Every count/metric/tile shown
  resolves to a **frozen read** (a `list_*` count or a bound owning-module read) or is flagged
  `[ESC-7-API]`. No invented aggregate, derived score, distribution, or percentile (mirrors the
  review-system derived-statistics freeze). "System health" infra-monitoring has no frozen contract.
- **DP-A9 — Greenfield within a frozen foundation.** The kit/tokens/shell are FROZEN; the console
  extends them and coins no primitive/color/foundation. Missing embedded component → `[ESC-7-DESIGN]`
  (Doc-7B definer). *(Realization detail is Stage-3/Stage-5, not planning.)*
- **DP-A10 — Frozen vocabulary only (coins nothing).** The `admin.*` (and cross-module `*.<op>.v1`)
  contract slugs, the eight lifecycles, the permission slugs, the `[ESC-ADM-*]` markers, audit
  actions, and POLICY keys are bound by pointer. Reads are not audited (§17.1); writes bind Doc-2 §9;
  `staff_super_admin` actions are additionally flagged.
- **DP-A11 — Accessibility & honesty (planning-level).** The console targets WCAG-AA via the frozen
  semantic tokens; queues/detail are keyboard-navigable and screen-reader-labelled; every list/detail
  carries an honest empty state (no fabricated placeholder rows, no implied count without a read).
  *(Exact contrast/interaction realization is Stage-3/Stage-5.)*

---

## 2. UX Design Principles (product-level; visual specification → Stage-3 brief)

Planning-level UX direction only. Concrete visual specification — grid, tokens-in-use, density
scale, exact breakpoints, icon set, dark-mode realization — lives in the **Stage-3 brief** so
Stage-3 retains design-exploration room.

- **A governance cockpit, not a marketing surface.** Optimize for staff triaging queues all day:
  high information density, strong scannability, minimal chrome, decisive state color. Favor tables/
  lists for triage; reserve summary cards for overview/detail.
- **Token-disciplined, coins no color.** The visual language is realized through the **frozen token
  system** (Navy-dominant, semantic success/warning/critical for state) — the console prescribes
  *usage* of frozen tokens, never a new palette. *(The specific token map is a Doc-7B/Stage-3 concern.)*
- **Desktop-first responsive posture (product decision).** Full console on desktop; **tablet =
  read-only** posture; **mobile = critical operations only**. *(Exact breakpoints → Stage-3.)*
- **Honest empty/loading/error states** on every surface, citing only the frozen status vocabulary
  (DP-A7/A8/A11).

---

## 3. Information Architecture

One shell (sidebar + header) over the `(admin)` route group (Doc-7C app shell, no active-org).
Navigation is **presentation only** — it coins no authority; **every nav node maps to a frozen
surface + owning module.** Nodes without frozen authority are **not** in the nav — they are raised
in §12.

### 3.1 Global navigation tree → surface + owner map (frozen nodes only)

| Nav group | Nav item | Surface(s) | Owning module (governance leg) |
|---|---|---|---|
| **Dashboard** | Overview | P-ADM-01 | M8 reads + owning-module `list_*` (DP-A8) |
| **Operations** | Moderation | P-ADM-02 · P-ADM-03 | M8 BC-ADM-1 |
| | RFQ moderation | P-ADM-04 | M8 BC-ADM-1 (subject = RFQ, DR-ADM-RFQ) |
| | Verification | P-ADM-12 · P-ADM-13 | M8 BC-ADM-5 workflow · M5 decision (Doc-5G) |
| | Import | P-ADM-14 · P-ADM-15 | M8 BC-ADM-4 |
| **Enforcement** | Bans | P-ADM-05 · P-ADM-06 | M8 BC-ADM-2 (emits `VendorBanned`) |
| **Marketplace** | Vendor moderation | P-ADM-07 | M2 vendor-profile moderation (Doc-5D) |
| | Categories | P-ADM-08 · P-ADM-09 | M2 category governance (Doc-5D) + M8 BC-ADM-3 category-suggestion decisions |
| | Ads | P-ADM-10 · P-ADM-11 | M2 ad review (Doc-5D) |
| | Suggestions triage | P-ADM-27 | M8 BC-ADM-3 (missing-vendor) |
| | Link triage | P-ADM-28 | M8 BC-ADM-3 (link — **non-disclosure**) |
| **RFQ Operations** | Routing rules | P-ADM-19 · P-ADM-20 | M3 routing control (Doc-5E §7) |
| | Matching results | P-ADM-21 | M3 `rfq.get_matching_results.v1` (Doc-5E, read — **moat**) |
| **Outreach** | Campaigns | P-ADM-16 · P-ADM-17 | M8 BC-ADM-6 (**moat** — informational) |
| | Contacts | P-ADM-18 | M8 BC-ADM-6 |
| **Billing** | Plans | P-ADM-22 · P-ADM-23 | M7 plan catalog incl. `activate_plan` (Doc-5I) |
| | Entitlements | P-ADM-24 | M7 (Doc-5I) |
| **Identity** | Organizations | P-ADM-25 | M1 identity governance (Doc-5C) |
| | Users | P-ADM-26 | M1 identity governance (Doc-5C) |
| **Support** | Support | P-ADM-29 | M6 support (`staff_can_support`, Doc-5H) |

**Shell elements (frozen):** the header carries staff identity and the **notification center**
(Doc-7C delivery display — frozen). **Not in the nav (raised in §12):** Reports, Settings, and a
global search — none has a frozen read/contract; they are escalations, not navigation commitments.

### 3.2 Route topology note

The built implementation mounts these under `app/(app)/admin/*`; Doc-7C's frozen topology names an
`(admin)` route group. The naming reconciliation is a §12 item; the IA above is route-agnostic.

---

## 4. The M8 Domain Map & Firewall Diagram

### 4.1 The six bounded contexts (Doc-4J) + the cross-module governance legs (Doc-7H HR8)

M8 owns **six BCs**; the console additionally invokes **owning-module Admin commands** for surfaces
whose data lives in M1/M2/M3/M5/M6/M7. M8 owns the governance/workflow record; the decision-target
store stays the owner's (DP-A1).

| BC / leg | Aggregate / target | Surfaces |
|---|---|---|
| **BC-ADM-1 Moderation** | `moderation_cases` | P-ADM-02/03/04 |
| **BC-ADM-2 Enforcement** | `ban_actions` (sole `VendorBanned` producer) | P-ADM-05/06 |
| **BC-ADM-3 Suggestions** | `category_suggestions` · `missing_vendor_suggestions` · `link_suggestions` (one aggregate, three roots) | P-ADM-08/09 · 27 · 28 |
| **BC-ADM-4 Data Import** | `import_jobs` + append-only `import_rows` | P-ADM-14/15 |
| **BC-ADM-5 Verification Workflow** | `verification_tasks` (workflow only) | P-ADM-12/13 |
| **BC-ADM-6 Vendor Outreach** | `outreach_campaigns` + `outreach_contacts` | P-ADM-16/17/18 |
| **Leg — Marketplace (Doc-5D)** | vendor-profile moderation · ad review · category governance | P-ADM-07/08/09/10/11 |
| **Leg — Trust (Doc-5G)** | verification decision (`trust.decide_verification.v1`) · trust publication (`freeze_/reactivate_trust_score`) · staff reads | P-ADM-12/13 + a vendor-governance context (not page-pinned — §12) |
| **Leg — RFQ (Doc-5E §7)** | routing control · matching results | P-ADM-19/20/21 |
| **Leg — Billing (Doc-5I)** | plan catalog · entitlements | P-ADM-22/23/24 |
| **Leg — Identity (Doc-5C)** | org/user status · ownership recovery | P-ADM-25/26 |
| **Leg — Communication (Doc-5H)** | support tickets (`staff_can_support`) | P-ADM-29 |

### 4.2 The eight frozen lifecycles (verbatim — Doc-4J Appendix A / Final Freeze cert)

```
moderation_cases            open → approved / rejected / escalated
ban_actions                 active → lifted → expired      (expiry only from lifted; System)
category_suggestions        submitted → approved / rejected
missing_vendor_suggestions  submitted → triaged → closed   (no submitted→closed shortcut)
link_suggestions            suggested → confirmed / dismissed
import_jobs                 queued → processing → completed / failed
verification_tasks          queued → in_review → decided
outreach_campaigns          draft → running → completed
```

Concurrency: transitions use optimistic concurrency via `expected_state`; a lost race → `CONFLICT`,
distinct from `STATE` (illegal-from-state). Surfaces present these as two different errors (DP-A7).

### 4.3 The four cross-module write seams (Admin routes through the owning service — DP-A1)

| Seam | Effect | Owner writes |
|---|---|---|
| **ban → M2** | `VendorBanned` consumer reflect (DD-3) `active→banned` | Marketplace (`reflect_vendor_ban`, System consumer — Admin never writes vendor-profile status directly) |
| **verification → M5** | the verification **record/decision/score** | Trust (`trust.decide_verification.v1`; firewall — Admin owns workflow only) |
| **link → M4** | the private-vendor **link columns** (A-03) | Operations (via service) |
| **import → M2** | seeded **categories/vendors** | Marketplace (import loads; it does not own the seeded entities) |

### 4.4 Firewall summary (binding on every surface in §6)

1. No score write anywhere (Trust firewall — DP-A3).
2. No matching/routing/ranking/selection/award/eligibility decision (moat — DP-A4).
3. No owning-module direct write (Admin-decides/owning-module-owns — DP-A1).
4. No active-org / act-AS-an-org (platform-scope — DP-A2).
5. No exposure of staff-internal data to tenant/public; `NOT_FOUND` collapse (DP-A5).
6. `VendorBanned` is the only event; no surface implies another M8 event (DP-A6).

---

## 5. Journey Binding (authoritative by pointer; diagrams not duplicated)

| Journey | Frozen composition | Bound at surface(s) |
|---|---|---|
| **J-ADM-01** | Moderation / complaint-intake staff leg (composes `trust.moderate_review.v1` + BC-ADM-1) | P-ADM-02/03/04 |
| **J-ADM-02** | Verification workflow staff leg (operational leg of J-VER / J-TIER) | P-ADM-12/13 |
| **J-ADM-03** | Category governance staff leg (composes J-CAT / discovery) | P-ADM-08/09/27 |
| **J-ADM-04** | Enforcement staff leg | P-ADM-05/06 |
| **J-ADM-05** | Import staff leg (J-IMP submit → System process out-of-wire) | P-ADM-14/15 |
| **J-ADM-06** | Plan / identity-ops staff click-path (`activate_plan`; org/user status — lands in J-SUB / J-SUC-03) | P-ADM-22/23/24/25/26 |
| **J-ADM-07** | Suggestion/link non-disclosure triage staff leg | P-ADM-27/28 |

Authority: `docs/product/journeys/journeys_admin.md` (frozen Journey Atlas v1.0); FE ownership =
Doc-7H. Diagrams/step tables live there and are **not duplicated**. The exact `J-ADM-0n` ↔ leg
mapping is bound by pointer to `journeys_admin.md` (file authoritative where a number is ambiguous).

---

## 6. Surface Specifications (governance, per surface)

All 29 `P-ADM` surfaces, grouped by BC + governance leg. **Every surface below follows one fixed
planning template — defined once here, not restated per surface:**

> **Surface template:** ① **Purpose** · ② **Authority** (frozen contracts, by pointer) · ③ **Journey**
> · ④ **Required information** · ⑤ **Primary actions** · ⑥ **Permission** (slug) · ⑦ **State machine**
> · ⑧ **Conformance** (firewalls). A field is **omitted when N/A** (e.g. a read-only surface omits ⑦).

**UI composition, widgets, kit primitives, and rendering are out of scope here** — visual composition
is the Stage-3 brief; component realization is the Stage-5 plan. System-only transitions are
**displayed, never invoked** (DP-A7).

**Group index:** G1 Overview (01) · G2 Moderation (02/03/04) · G3 Enforcement (05/06) ·
G4 Approvals & Suggestions (07/08/09/27/28) · G5 Verification (12/13) · G6 Ads (10/11) ·
G7 Import (14/15) · G8 Outreach (16/17/18) · G9 Routing & Matching (19/20/21) ·
G10 Monetization (22/23/24) · G11 Identity Ops (25/26) · G12 Support (29).

### 6.0 Dashboard Home — P-ADM-01 (G1 Overview)

- **Purpose:** a fast-scan staff overview surfacing what needs attention across governance surfaces,
  with deep-links into the queues. **Overview only — it decides and mutates nothing.**
- **Authority / required information (each item binds a frozen read or is escalated — DP-A8):** the
  dashboard *must represent* — the **information**, not a fixed layout (arrangement is Stage-3):
  - open-moderation-case count → `admin.list_moderation_cases.v1`
  - active-ban count → `admin.list_ban_actions.v1`
  - queued/in-review verification count → `admin.list_verification_tasks.v1`
  - pending-import count → `admin.list_import_jobs.v1`
  - pending approvals (category suggestions) → `admin.list_suggestions.v1`; (ads/vendor) → Doc-5D reads
  - recent audit activity → Doc-2 §9 audit reads
  - staff notifications → M6 delivery (Doc-7C, display only)
  - **System health** → **`[ESC-7-API]`** (no frozen contract; not represented as real — §12)
- **Primary actions:** navigation deep-links only — **no new command, no inline mutation.**
- **Permission:** the applicable staff slugs gate visibility of each section's deep-link.
- **State machine:** n/a (read-only overview).
- **Conformance:** binds only frozen reads; no fabricated aggregate/derived metric; no active-org;
  no score/ranking rendered; graceful per-section degradation (a failed read never blanks the page).

### 6.1 G2 — Moderation (P-ADM-02 queue · P-ADM-03 case detail · P-ADM-04 RFQ moderation)

- **Purpose:** staff moderation of flagged content/RFQ subjects — approve/reject/escalate the **case**
  (never a procurement outcome).
- **Authority (BC-ADM-1):** `admin.create_moderation_case.v1` (dual-template; System auto-queue leg)
  · `admin.assign_moderation_case.v1` · `admin.decide_moderation_case.v1`
  (`decision enum<approved|rejected|escalated>`) · `admin.get_moderation_case.v1` ·
  `admin.list_moderation_cases.v1`.
- **Journey:** J-ADM-01.
- **Required information:** case queue (filter by state/assignee); case detail (subject, state,
  assignee, decision history).
- **Primary actions:** assign (while `open`); decide approve/reject/escalate (from `open`).
- **Permission:** `staff_can_moderate_rfq`. **Audit:** §9 "moderation decisions".
- **State machine:** `moderation_cases open → approved / rejected / escalated`; decide carries
  `expected_state` → `CONFLICT` vs `STATE`.
- **Conformance:** no coined queue state; decision enum verbatim; moat (case ≠ award). *(Carried Board
  question: whether review-moderation rides on P-ADM-02/03 or gets new pages — §9/§12.)*

### 6.2 G3 — Enforcement (P-ADM-05 bans · P-ADM-06 ban detail / issue)

- **Purpose:** issue / lift / view platform-wide vendor bans.
- **Authority (BC-ADM-2):** `admin.issue_ban.v1` (**emits `VendorBanned`**) · `admin.lift_ban.v1` ·
  `admin.expire_ban.v1` (**System — displayed, never invoked**) · `admin.get_ban_action.v1` ·
  `admin.list_ban_actions.v1`.
- **Journey:** J-ADM-04.
- **Required information:** ban list with state; ban detail (vendor target by ID, reason, state,
  history). The surface states plainly that a ban is **platform-wide and vendor-visible** (emits
  `VendorBanned`; Marketplace reflects DD-3), **distinct from a buyer-private blacklist** (DP-A6).
- **Primary actions:** issue (on a vendor by ID); lift.
- **Permission:** `staff_can_ban`. **Audit:** §9 "ban issue/lift"; expiry **`[ESC-ADM-AUDIT]`**.
- **State machine:** `ban_actions active → lifted → expired` (expiry only from `lifted`, System).
- **Conformance:** `VendorBanned` sole event; expiry read-only; ban ≠ blacklist; no direct
  vendor-profile write (Marketplace owns the reflect).

### 6.3 G4 — Approvals & Suggestions (P-ADM-07 · 08 · 09 · 27 · 28)

- **P-ADM-07 Vendor moderation** *(NOTE — corpus correction, §13):* the registered title is "Vendor
  approval," but the frozen Admin capability here is **vendor-profile moderation**, not claim
  approval. **Authority:** `marketplace.set_vendor_profile_status.v1` (M2, Admin — realizes the
  `active ⇄ suspended` moderation edges **only**). The `→ banned` edge is the System consumer
  `reflect_vendor_ban` (from BC-ADM-2), not an action here. **Vendor *claim* approval is
  `marketplace.claim_vendor_profile.v1` — a User actor (the vendor claims their own profile),
  DD-7-blocked — so there is no single Admin "vendor-approval" contract** (§12). **Primary actions:**
  suspend / reactivate a vendor by ID. **Permission:** per Doc-5D staff gating. **Conformance:** M2
  owns the profile store; Admin decides; no score write.
- **P-ADM-08 Category management · P-ADM-09 Category editor** — **Authority:** M2 governance
  `marketplace.create_category.v1` / `marketplace.update_category.v1` /
  `marketplace.set_category_status.v1` **+** BC-ADM-3 `admin.decide_category_suggestion.v1`
  (`enum<approved|rejected>`). **Permission:** `staff_can_manage_categories` (category-suggestion
  decisions ONLY; DD-4). **State machine:** `category_suggestions submitted → approved / rejected`.
  **Audit:** §9 "category approve/delete" / "suggestion decisions".
- **P-ADM-27 Suggestion triage** — BC-ADM-3 missing-vendor:
  `admin.triage_missing_vendor_suggestion.v1` · `admin.close_missing_vendor_suggestion.v1` ·
  `admin.get_suggestion.v1` · `admin.list_suggestions.v1`. **State machine:**
  `missing_vendor_suggestions submitted → triaged → closed` (**no `submitted → closed` shortcut**).
  **Permission:** `[ESC-ADM-SLUG]` (no §7 staff slug — flagged, not invented).
- **P-ADM-28 Link triage** — BC-ADM-3 link: `admin.confirm_link_suggestion.v1` ·
  `admin.dismiss_link_suggestion.v1`. **State machine:** `link_suggestions suggested → confirmed /
  dismissed`. **NON-DISCLOSURE (DP-A5, Invariant #11):** link content is staff-internal, never
  vendor-visible; unauthorized read → `NOT_FOUND`; the surface exists only inside the staff console;
  link confirm writes M4 columns **via the Operations service** (seam A-03). **Permission:**
  `[ESC-ADM-SLUG]`.

### 6.4 G5 — Verification (P-ADM-12 queue · P-ADM-13 task detail)

- **Purpose:** the staff verification **workflow** (queue/assign/decide the task) coupled to the M5
  verification **decision**.
- **Authority:** M8 workflow — `admin.queue_verification_task.v1` · `admin.assign_verification_task.v1`
  · `admin.decide_verification_task.v1` · `admin.get_verification_task.v1` ·
  `admin.list_verification_tasks.v1`. **M5 decision leg (Doc-5G, corpus-confirmed §13):**
  `trust.decide_verification.v1` (Admin) — the console binds this for the Trust decision; also
  `trust.assign_verification.v1` / `trust.revoke_verification.v1`.
- **Journey:** J-ADM-02.
- **Required information:** task queue; task detail with the M8 workflow state + the referenced M5
  verification record (staff-internal read, Doc-5G).
- **Primary actions:** queue / assign / decide the **task** (M8); record the Trust **decision** via
  `trust.decide_verification.v1` (M5).
- **Permission:** `staff_can_verify`. **Audit:** M8 workflow **`[ESC-ADM-AUDIT]`**.
- **State machine:** `verification_tasks queued → in_review → decided`.
- **TRUST FIREWALL (DP-A3, load-bearing):** `verification_tasks` (M8) ≠ `trust.verification_records/
  decisions` (M5). The task holds a `verification_record_id` **reference**; the decision content is
  **not** an M8 field, and **no score** is written here — the score auto-calculates under System.
  Any trust score shown is **display only** (per the Board Trust-Score display ruling), never a write.
- **Conformance:** workflow (M8) ≠ decision (M5); no score write; staff-internal reads non-disclosed.

### 6.5 G6 — Ads (P-ADM-10 ad review queue · P-ADM-11 ad review detail)

- **Purpose:** staff review (approve/reject) of advertisements.
- **Authority (M2, Doc-5D):** `marketplace.review_advertisement.v1` (Admin, on an ad by ID).
- **Required information:** ad-review queue; ad detail. **Primary actions:** approve / reject.
- **Permission:** per Doc-5D staff gating.
- **Conformance:** owning-module leg (M2 owns the ad store); no coined ad state.

### 6.6 G7 — Import (P-ADM-14 import jobs · P-ADM-15 import job — new / detail)

- **Purpose:** submit and monitor seed-data import jobs.
- **Authority (BC-ADM-4):** `admin.submit_import_job.v1` (**create-then-poll — R10**) ·
  `admin.process_import_job.v1` (**System — submitted + polled, never run by the console**) ·
  `admin.get_import_job.v1` · `admin.list_import_jobs.v1` · `admin.list_import_rows.v1`.
- **Journey:** J-ADM-05.
- **Required information:** jobs list with state; job detail (`job_type enum<categories|vendor_seed>`,
  `file_ref`, per-row outcomes/`RowError` from the append-only `import_rows`).
- **Primary actions:** submit a job; then **poll** get/list — the console **never runs**
  `process_import_job`.
- **Permission:** `[ESC-ADM-SLUG]`. **Audit:** §9 "import job execution".
- **State machine:** `import_jobs queued → processing → completed / failed`.
- **Conformance:** create-then-poll; System step displayed-not-invoked; **seeded categories/vendors
  are Marketplace-owned** (import loads, doesn't own — seam import→M2).

### 6.7 G8 — Outreach (P-ADM-16 campaigns · P-ADM-17 campaign detail · P-ADM-18 contacts)

- **Purpose:** informational vendor-acquisition outreach.
- **Authority (BC-ADM-6):** `admin.create_outreach_campaign.v1` · `admin.run_outreach_campaign.v1` ·
  `admin.complete_outreach_campaign.v1` · `admin.add_outreach_contact.v1` ·
  `admin.update_outreach_contact.v1` · `admin.get_outreach_campaign.v1` ·
  `admin.list_outreach_campaigns.v1`.
- **Required information:** campaigns list; campaign detail; contacts (target vendor by UUID,
  Marketplace-owned). **Primary actions:** create/run/complete a campaign; add/update a contact.
- **Permission:** `[ESC-ADM-SLUG]`. **Audit:** `[ESC-ADM-AUDIT]`.
- **State machine:** `outreach_campaigns draft → running → completed`.
- **MOAT (DP-A4):** informational acquisition only — **never** procurement routing/matching/ranking/
  supplier-selection/award/eligibility.

### 6.8 G9 — Routing & Matching (P-ADM-19 routing rules · P-ADM-20 rule editor · P-ADM-21 matching results)

- **Purpose:** staff routing-rule control + read-only matching observability.
- **Authority (M3, Doc-5E §7):** `rfq.manage_routing_rule.v1` · `rfq.assist_routing.v1`
  (**Stage-gated**) · `rfq.get_matching_results.v1` (Admin **read**).
- **Required information:** routing rules list + editor; internal matching results (read).
- **Primary actions:** manage a routing rule; Stage-gated routing assist. **No award/selection action.**
- **Permission:** Admin control-plane, no org context.
- **MOAT (DP-A4, load-bearing):** `assist_routing` adjusts rules/human-assist — **never** an award or
  winner. `get_matching_results` is a **staff-internal read**; its explainability must not expose a
  protected fact (Doc-5E R5). Flag-and-halt on any award/eligibility surface.

### 6.9 G10 — Monetization (P-ADM-22 plans · P-ADM-23 plan editor · P-ADM-24 entitlements / bundles)

- **Purpose:** manage the plan catalog and entitlements.
- **Authority (M7, Doc-5I BC-BILL-1):** `billing.create_plan.v1` · `billing.update_plan.v1` ·
  `billing.retire_plan.v1` · **`billing.activate_plan.v1`** (the `draft→active` owner; additive,
  Board Gate 2) · `billing.bundle_plan_entitlement.v1` · `billing.create_entitlement.v1`.
- **Journey:** J-ADM-06.
- **Required information:** plans list + lifecycle; plan editor; entitlements/bundles.
- **Primary actions:** create/update/retire/activate a plan; bundle/create entitlements.
- **State machine:** `create_plan → draft`, `activate_plan → active`, `retire_plan → retired`.
- **Conformance:** M7 owns; entitlements are boolean/numeric/enum, never plan-name checks
  (Invariant #10 — Financial Tier ≠ plan ≠ Trust); no entitlement invented; no cross-firewall.

### 6.10 G11 — Identity Ops (P-ADM-25 organizations · P-ADM-26 users)

- **Purpose:** platform-staff identity governance — org/user status + ownership recovery, acting **ON**
  a target **by ID**, no org context (DP-A2).
- **Authority (M1, Doc-5C):** `identity.set_organization_status.v1` · `identity.set_user_account_status.v1`
  · `identity.admin_recover_ownership.v1` (· `identity.restore_organization.v1`).
- **Journey:** J-ADM-06.
- **Required information:** org/user status + detail. **Primary actions:** suspend/reinstate;
  ownership recovery.
- **Permission:** Admin, no active-org; identity actions **not delegation-eligible**.
- **OPEN (`[ESC-7-API]`, §12) — corpus-confirmed:** there is **no frozen admin cross-tenant list-read**
  for orgs or users (`identity.list_my_organizations.v1` is a User, principal-scoped read; no
  `list_users`). The **list** views (P-ADM-25/26) are therefore specified as **bind-or-ESC**: absent a
  frozen cross-tenant read, the list is an escalation, not a fabricated query.
- **Conformance:** no active-org; act ON by ID; no invented list-read.

### 6.11 G12 — Support (P-ADM-29 support)

- **Purpose:** staff support of tenant tickets.
- **Authority (M6, Doc-5H):** support-ticket reads + **transitions** gated by `staff_can_support` —
  `get_ticket` / `list_tickets`, and (corpus correction, §13) staff **write/transition** authority:
  `update_ticket` (`open → in_progress → resolved → closed`) · `add_ticket_message` · `close_ticket`.
- **Required information:** ticket queue/detail (own-or-support scope). **Primary actions:** respond;
  drive the ticket state machine.
- **Permission:** `staff_can_support`.
- **Conformance:** the **support-ticket aggregate stays M6-owned** — ownership never transfers to
  Admin; **no private-RFQ read** for support staff (Doc-4H §H7); out-of-scope/cross-tenant reads
  collapse to `NOT_FOUND` (non-disclosure, R10).

---

## 7. Design-System Reuse Strategy (pointer — not a component catalog)

The console **reuses the frozen design system; it defines no components here.** Component/primitive
composition is owned by **Doc-7B** and realized at Stage-3 (visual) / Stage-5 (implementation).

- **Authority:** all UI composition binds **Doc-7B** (kit + tokens) and the Doc-7C shell. This
  package names **no** primitive and prescribes **no** composition — that is deliberately deferred so
  the design system stays the single owner (Invariant #9; DP-A9).
- **Reuse precedent (pointer):** the built admin queue/table pattern —
  `app/(app)/_components/admin/admin-queue-table.tsx` (`AdminQueueTable`) and `admin-shell-vm.ts` —
  is the existing reuse anchor for list/queue surfaces. Stage-3 may re-skin it (greenfield visual),
  but the reuse strategy is **extend, never duplicate** the foundation.
- **Gaps:** a genuinely missing embedded component is raised as **`[ESC-7-DESIGN]`** to the Doc-7B
  definer; a deferred primitive is vendored through Doc-7B on first need (demand-driven, never a
  silent cap). Neither is decided in this planning document.
- **Reuse discipline (carried into Stage-3/5):** a component used by ≥2 surfaces is a promotion
  candidate; a bespoke layout is documented, never silently forked (the vendor-track Reuse Register /
  Promotion Watchlist discipline).

---

## 8. Cross-Cutting Governance Playbooks

- **8.1 Non-disclosure (DP-A5).** Staff-internal reads (link suggestions, verification case detail,
  fraud signals, admin ratings) render **only** inside the staff console; unauthorized access →
  `NOT_FOUND` (never "not authorized"); no staff-internal datum is routed to a tenant/public
  component; a link suggestion's existence is a protected fact.
- **8.2 No-active-org (DP-A2).** Every command takes its target by ID; the shell never mounts an org
  switcher, never sends `Iv-Active-Organization`, never implies acting AS an org. `CHK-7-012` +
  `CHK-7-011` APPLY; `CHK-7-010` N/A.
- **8.3 Firewall (DP-A3/A4).** *Trust:* verification drives workflow (M8) + decision (M5); any trust
  score shown is display, not write (band/numeric per the Board ruling; formula/matching/fraud/
  ranking/percentile never). *Moat:* routing adjusts rules/human-assist and reads results; **no
  award/winner/eligibility action** ever renders. On a proposed score-write or award surface →
  **Flag-and-Halt**.

---

## 9. Page-ID / WBS Coverage (illustrative; Board-gated questions flagged)

- **Coverage:** the **29 `P-ADM-01…29`** IDs already exist and are registered (FE universe = 151;
  `scripts/verify-fe-wbs-coverage.mjs`, `ADM: 29`), owned by Team-3 under Doc-7H. This package
  **confirms** coverage and **proposes no new page ID**.
- **Carried Board questions (from `review_system_planning_and_design.md` §9, not resolved here):**
  review-moderation placement (new pages vs face of P-ADM-02/03); admin-ratings staff surface; admin
  dev-ownership of the staff review legs. Board packet:
  `governanceReviews/BOARD-PACKET-REVIEW-SYSTEM-FE-MINTS_v1.0.md` (OPEN).

---

## 10. Wave-Gated Build Annex (informative)

- **Backend = Wave 5 (M8)** — "Post-Award + Admin (M4 · M8)"; M8 builds after the modules it governs
  (M2/M3/M5, Waves 3–4). Exit gates: 8D (Admin-only RLS / link non-disclosure), 8E (Admin-decides /
  owning-module-owns), 8F (`VendorBanned` framing) — per `generatedDocs/Build_Roadmap_v1.0.md`.
- **Current = Wave 2** (Core Platform M0→M1). The Admin Console presentation is planned ahead of its
  Wave-5 backend under the standing presentation-only parallel authorization.
- **Pipeline mapping:** Stage-6 "Production Development" = the wired build behind Wave 5 (mutating
  actions disabled until then). Stages 1–5 are the presentation-only track.

---

## 11. Stage-3 Prototype — Objectives (detail in the Stage-3 brief)

Stage-3 produces a high-fidelity click-through of the 29 surfaces to establish the production visual
design, gated behind Stage-2 Board approval. **Objectives:** validate navigation clarity,
information hierarchy, and interaction consistency across the console, at high fidelity, in the
frozen design system, with **no invented workflow or data.** The full deliverable list, interaction
model, responsive breakpoints, and **Stage-4 approval criteria** live in
`docs/product/requirements/admin_console_prototype_design_brief.md`. Prototype home:
`prototypes/admin-console/`. Authorizes no build.

---

## 12. Open Questions & Escalations (pointers only — never resolved here)

Grouped by concern — **API** (E4·E6·E7) · **Naming** (E5) · **Slug** (E1) · **Policy** (E3) ·
**Audit** (E2) · **Routing** (E9) · **Board** (E8):

| # | Cat | Item | Marker / channel | Notes |
|---|---|---|---|---|
| E4 | API | Admin **cross-tenant list-read** for orgs/users (P-ADM-25/26) — **corpus-confirmed absent** | `[ESC-7-API]` | no frozen `list_users` / admin org-list; `list_my_organizations` is User principal-scoped; list is bind-or-ESC (§6.10) |
| E6 | API | **Trust-publication leg** (`freeze_/reactivate_trust_score`) not page-pinned | `[ESC-7-API]` / placement | bound to actor=Admin / Admin Console (Doc-7H), not to a specific `P-ADM` page in the frozen API layer; surface placement is a Stage-3/Board decision |
| E7 | API | Dashboard **System health / Reports / Settings / global search** have no frozen read | `[ESC-7-API]` (health/reports/search); **M0** (settings/config) | not represented as real; Settings/config = M0-owned (Doc-4B); removed from nav (§3) |
| E5 | Naming | **P-ADM-07 "vendor approval" has no Admin approval contract** | `[ESC-7-API]` / naming | Admin capability = moderation (`set_vendor_profile_status`, active⇄suspended); claim approval = `claim_vendor_profile.v1` (User, DD-7-blocked). Page title vs capability mismatch — Board/Stage-3 to reconcile |
| E1 | Slug | No §7 staff slug for **missing-vendor + link decisions, import, outreach** | `[ESC-ADM-SLUG]` (Doc-2 §7 additive) | slugs surfaced, not invented |
| E3 | Policy | Runtime-tunable values (dedup/retention/purge windows, import batch limits, outreach cadence) | `[ESC-ADM-POLICY]` (Doc-3 §12.2 additive) | M8 reads its 2 registered `admin.*` keys; coins none |
| E2 | Audit | **Ban expiry · verification-task workflow · outreach** not §9-enumerated | `[ESC-ADM-AUDIT]` (Doc-2 §9 additive) | nearest by pointer; no action invented |
| E9 | Routing | Route topology: `(admin)` group (Doc-7C) vs built `app/(app)/admin/*` | note | reconcile at Stage-5; IA is route-agnostic |
| E8 | Board | **Review-moderation placement**, **admin-ratings surface**, **admin dev-ownership** | Board (`BOARD-PACKET-REVIEW-SYSTEM-FE-MINTS_v1.0.md`) | carried from the review-system package (§9) |

Each is a **pointer**, not a resolution; resolution is an additive patch to the owning document
through its named channel, with human/Board approval where required (CLAUDE.md §8).

---

## 13. Disposition Log (Validate-Findings gate — CLAUDE.md §13)

**Current gate status:** BLOCKER 0 · MAJOR 0 · MINOR 0 open — ready for **Stage-2 (Review & Board
Approval)**. Round-by-round detail for Rounds 1–2 lives in **Appendix A — Review Provenance**; this
section keeps the current disposition summary + the latest round. *(At commit/freeze the provenance
graduates to a `governanceReviews/` log.)*

### 13.1 Round 3 — readability pass (v0.3)

Owner review raised 4 MINOR + 7 NIT readability findings; adjudicated via the §13 gate (Valid?
Applicable? Best for the product? Corpus-consistent?):

| # | Finding | Disposition |
|---|---|---|
| MINOR-01 | Doc large; move Design Principles / Playbooks / Disposition to appendices | **PARTIAL** — intent (easier to review) met via MINOR-02 (template dedup) + MINOR-04 (history → Appendix A). **Declined** the wholesale reorg of §1/§8: Design Principles are core planning (not supplementary), and physically moving heavily cross-referenced sections risks `DP-A*`/`§n` reference breakage — and contradicts the add-content NITs below. Siblings (review/buyer/vendor planning) are equally self-contained. |
| MINOR-02 | §6 repeats the 8-field template | **ACCEPTED** — template defined once at the §6 head; surfaces fill it, not restate it; fields omitted when N/A. No frozen binding dropped. |
| MINOR-03 | §12 mixes concerns | **ACCEPTED** — added a **Cat** column + grouping (API / Naming / Slug / Policy / Audit / Routing / Board). |
| MINOR-04 | §13 becoming a review archive | **ACCEPTED** — Rounds 1–2 detail → **Appendix A**; §13 keeps the current summary + latest round. |
| NIT-07 | "What success looks like" in Exec Summary | **ACCEPTED** — §0.1. |
| NIT-03 | Number the six BCs | **NO-OP** — §4.1 already labels BC-ADM-1…6. |
| NIT-01 | Reading-time estimate | **DECLINED** — chrome; absent in sibling docs; adds nothing a reviewer needs. |
| NIT-02 | One-page architecture diagram | **DECLINED** — duplicate of R2-m4 (already declined for size); contradicts MINOR-01; §3.1/§4.1 tables carry the map. |
| NIT-04 | Cross-module seam diagram | **DECLINED** — same class as NIT-02; the §4.3 seam table suffices. |
| NIT-05 | Move terminology to a glossary appendix | **DECLINED** — a reader needs the "one voice" vocab **before** reading; §0.6 stays up front. Shared terms live in `docs/reference/glossary.md` (pointer, not a relocation). |
| NIT-06 | Anchor links per surface group | **DECLINED** — low-value chrome; the §6 Group index already maps G1–G12 to their sections. |

**Self-consistency note:** MINOR-01 (shrink) and NIT-01/02/04/05/07 (add) partially conflict; the
gate resolved toward net-smaller — real cuts accepted (template dedup, history relocation),
size-adding chrome declined, one cheap high-value line (NIT-07) admitted. No governance content changed.

**Gate status:** BLOCKER 0 · MAJOR 0 · MINOR 0 open. Ready for **Stage-2**.

---

## Appendix A — Review Provenance (Rounds 1–2)

### A.1 Round 1 — self-review (v0.1)

Adversarial self-review folded 11 findings (D1–D11: dashboard fabricated-metrics hazard, palette
coining, Trust firewall, moat, link non-disclosure, orgs/users list-read, global-search API,
deferred primitives, bulk-transition, journey-number ambiguity, Settings=M0). All folded; see v0.1.

### A.2 Round 2 — independent review (v0.2): phase-boundary + corpus corrections

**Phase-boundary findings (owner review — the planning doc had over-reached into Stage-3/Stage-5):**

| # | Finding | Severity | Disposition |
|---|---|---|---|
| R2-B1 | Planning doc held prototype design spec (§2/§3/§7/§11) | BLOCKER | **ACCEPTED** — prototype-level detail moved to `admin_console_prototype_design_brief.md`; planning keeps principles + IA + governance |
| R2-B2 | §6 had become an implementation contract (widgets/primitives/rendering) | BLOCKER | **ACCEPTED** — §6 reduced to Purpose/Authority/Journey/Required-info/Primary-actions/Permission/State-machine/Conformance |
| R2-M1 | §7 widget inventory duplicated Doc-7B | MAJOR | **ACCEPTED** — replaced with a design-system reuse strategy (pointer) |
| R2-M2 | Nav included unfrozen items (Reports/Settings/Global search) | MAJOR | **ACCEPTED w/ refinement** — moved to §12; **Notification Center kept** (frozen Doc-7C) |
| R2-M3 | Dashboard over-specified (fixed arrangement) | MAJOR | **ACCEPTED** — §6.0 states *information that must be represented* + its frozen read; arrangement → Stage-3 |
| R2-M4 | §11 duplicated the prototype brief | MAJOR | **ACCEPTED** — §11 reduced to Stage-3 objectives; detail → brief |
| R2-M5 | §2 too prescriptive (grid/gutters/baseline) | MAJOR | **ACCEPTED** — §2 = high-level UX principles; grid → Stage-3 |
| R2-M6 | Scattered primitive references | MAJOR | **ACCEPTED** — primitives removed; reference Doc-7B generally |
| R2-m1 | Reduce ~30–40% implementation content | MINOR | **ACCEPTED** — net effect of the above |
| R2-m2 | Add accessibility principle | MINOR | **ACCEPTED** — DP-A11 |
| R2-m3 | Add Exec Summary / Assumptions / Revision History | NIT | **ACCEPTED (light)** — §0.1/§0.4/§0.7 |
| R2-m4 | Add IA diagram / interaction-matrix / dependency-matrix / perf / risk-register | MINOR/NIT | **DECLINED (recorded)** — adds size against R2-m1; cross-module interaction already in §4.1/§3.1; **perf budgets are Doc-8-owned, not a planning doc's to coin** (fe-planning governance guardrails). Revisit if the Board requests |

**Corpus-correctness findings (independent verification against frozen Doc-5x — folded into §6):**

| # | Finding | Severity | Disposition |
|---|---|---|---|
| R2-C1 | Cross-module legs written as bare names, not namespaced | MAJOR | **FOLDED** — all namespaced (`marketplace.`/`trust.`/`rfq.`/`billing.`/`identity.` `<op>.v1`) |
| R2-C2 | P-ADM-07 bound to `set_vendor_profile_status` as "vendor approval" — **wrong** | BLOCKER | **FOLDED** — reframed as vendor **moderation** (active⇄suspended); no Admin approval contract (claim = User `claim_vendor_profile.v1`, DD-7-blocked); §6.3 + E5 |
| R2-C3 | Verification M5 decision command hedged as bind-or-ESC | MAJOR | **FOLDED** — the command **exists**: `trust.decide_verification.v1` (Admin); §6.4 binds it; E5(v1) resolved |
| R2-C4 | Trust-publication leg mentioned but unsurfaced | MINOR | **FOLDED** — §4.1 + E6: actor-bound (Admin/Doc-7H), not page-pinned; placement is a Stage-3/Board decision |
| R2-C5 | Support (P-ADM-29) described as read-only — **wrong** | MAJOR | **FOLDED** — §6.11: staff hold ticket write/transition authority (`update_ticket`/`close_ticket`); aggregate stays M6-owned |

**Gate status:** BLOCKER 0 · MAJOR 0 · MINOR 0 open. Deferred items (R2-m4) recorded, not blocking.
This draft is ready for **Stage-2 (Review & Board Approval)**.

---

*End of Admin Console — Planning & Design (v0.3-draft). NON-AUTHORITATIVE · PLANNING ONLY · coins
nothing. Visual specification → `admin_console_prototype_design_brief.md` (Stage-3, gated);
implementation → Stage-5. On any conflict with a frozen document: Flag-and-Halt. Next gate: Stage-2
Board approval → then Stage-3 hi-fi prototype in `prototypes/admin-console/`.*
