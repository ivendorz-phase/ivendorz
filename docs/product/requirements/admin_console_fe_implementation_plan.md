<!--
Status:     v1.0 — Stage-5 deliverable of the Admin Console 6-stage pipeline
            (Planning → Board → Prototype → Visual Approval → **FE Impl Plan** → Production).
            Authored after Stage-4 APPROVED (Prototype v1.0, 2026-07-08). v0.2 added §9 Admin
            Personas & Responsibility Matrix; **v1.0 folds Team-4 Engineering + Team-5 Governance
            reviews** (0 BLOCKER; all MAJOR/MINOR/NIT folded — see §10). This is the PLAN; it
            authorizes NO production development — that remains gated behind Board approval AND the
            Wave-5 backend gate.
Authority:  NON-AUTHORITATIVE implementation-planning companion. Wave-gated · coins nothing ·
            conforms upward to the frozen corpus (CLAUDE.md §7). Third in the series with
            admin_console_planning_and_design.md (v0.3) + admin_console_prototype_design_brief.md (v0.2).
Produced:   2026-07-08.
Scope:      How the approved Admin Console (29 surfaces, P-ADM-01…29) is realized in production
            Next.js under app/(app)/admin/ — presentation elevation (now) + backend wiring (Wave 5).
-->

# iVendorz Admin Console — Stage-5 Frontend Implementation Plan

> **Status:** NON-AUTHORITATIVE implementation-planning companion — **PLANNING ONLY · wave-gated ·
> coins nothing.** It turns the **Stage-4-approved Prototype v1.0** into an ordered production plan.
> It authorizes **no** production development: implementation proceeds only after this plan passes
> your engineering + governance review, and each wired surface is additionally **Wave-5-gated**
> (M8 backend). On any conflict with a frozen document: **Flag-and-Halt** (CLAUDE.md §11).

## Context

The pipeline has cleared Planning (v0.3), Prototype Brief (v0.2), and a Board-approved clickable
Prototype (v1.0). Stage-5 answers **how to build the production Admin Console** — mapping the
approved design onto real Next.js code, wiring to the frozen contracts, and sequencing the work
against the roadmap — **without** starting the build.

**The load-bearing reality that shapes this plan:** the 29 `P-ADM` surfaces **already exist in code**
as **presentation-only** Next.js routes under [`app/(app)/admin/`](../../../app/(app)/admin/) (built
by Team-3, reviews RV-0003…0084; all mutating actions rendered-but-disabled; seed view-models; no
backend). So Stage-5 is **not** a greenfield code build. It is:

1. **Phase A — Presentation elevation** (Wave-2-parallel, presentation-only): reconcile the existing
   built pages with the **approved Prototype v1.0** design and governance (navy shell, per-surface
   governance correctness, Doc-7B realization, states), keeping actions disabled.
2. **Phase B — Backend wiring** (**Wave-5-gated**): wire each surface to its frozen `admin.*` /
   cross-module Admin contracts via the canonical audited-write pattern, after its blocking
   escalations resolve.

## Authority pointers (all FROZEN / approved; bound, never restated)

| Concern | Pointer |
|---|---|
| Governance (per-surface authority/permission/state/firewalls) | `admin_console_planning_and_design.md` v0.3 (§6 surfaces · §8 playbooks · §12 escalations) |
| Visual / interaction / building blocks | `admin_console_prototype_design_brief.md` v0.2 + approved **Prototype v1.0** (`prototypes/admin-console/`) |
| M8 contracts / HTTP / DB | Doc-4J · Doc-5J · Doc-6J (frozen) |
| Cross-module Admin legs | Doc-5D (M2) · Doc-5G (M5) · Doc-5E §7 (M3) · Doc-5I (M7) · Doc-5C (M1) · Doc-5H (M6) |
| FE realization law | Doc-7H (HR1–HR12) · Doc-7A/7B (kit/tokens) · Doc-7C (`(admin)` shell) |
| Canonical audited write | `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` (D7 — binding for every wired write) |
| Roadmap / wave gate | `generatedDocs/Build_Roadmap_v1.0.md` (M8 = Wave 5; exit gates 8D/8E/8F) |
| Existing built pages | `app/(app)/admin/**` + `app/(app)/_components/admin/**` (`AdminQueueTable`, `admin-shell-vm.ts`, per-feature `*-seed.ts`) |
| Test obligation | Doc-8 (e2e/RBAC) + `/ivendorz-verify-fe`, `/fe-verify-bundle`, `/review-a-lens` skills |

## Non-negotiables carried into implementation (from Planning §1/§4/§8)

Every wired surface preserves: **Admin-decides / owning-module-owns** (frontend never writes another
module's data — contracts only); **no active-org** (act ON a target by ID; `CHK-7-010` N/A,
`CHK-7-012`/`CHK-7-011` APPLY); **Trust firewall** (workflow ≠ decision; no score write);
**procurement moat** (no matching/award/eligibility); **non-disclosure** (`NOT_FOUND` collapse for
link suggestions / staff-internal reads); **`VendorBanned`** as the sole M8 event; **coins nothing**
(no new contract/field/enum/state/route-as-API/POLICY key). Every write follows the D7 audited-write
pattern; scores auto-calculate under System.

---

## 1. Phase A — Presentation elevation (parallel-authorized, presentation-only)

Goal: bring the existing `app/(app)/admin/` pages up to Prototype v1.0 fidelity + governance
correctness, with **all mutating actions still disabled** (no backend). Authorized under the standing
presentation-only parallel authorization; still Dev → Review-A → Review-B → Board per the FE-PM model.

- **A0 — Built-vs-approved reconciliation matrix (Phase-A input artifact).** Before elevation,
  produce a per-surface matrix: *built route · built label · built nav group · states present* ↔
  *approved-prototype target*. This scopes the elevation (it is otherwise unestimable). Verified
  divergences to close (examples, not exhaustive): the shipped `ADMIN_NAV` in `admin-shell-vm.ts`
  uses non-approved group labels (`Trust & approval` / `Catalog & ads` / `Engine` / `Growth` /
  `Commerce & identity`) vs the approved IA; `ADMIN_NAV` is **missing nav entries** for built routes
  Support (29), Suggestions (27), Link triage (28), Outreach contacts (18); P-ADM-07 is built as
  label **"Vendor approval"** at route `/admin/vendor-approval` (retire per E5 — see A4 / §8.2).
- **A1 — Shell & design system.** Realize the navy `(admin)` shell (Doc-7C) and Doc-7B tokens to
  match the prototype: sidebar (frozen IA groups, collapse/expand/pinned/responsive), header
  (staff identity, non-functional search placeholder, notification entry, theme). **Rewrite
  `ADMIN_NAV` to the approved prototype IA and add the four missing nav entries (A0)** — the shell's
  one-level `NavItem.children` already supports the `Operations › X` nesting, so no shell-schema
  change is needed. **Suppress the tenant org-switcher for the admin VM** (via the shell's
  `orgSwitcherSlot` override) and render a neutral platform-staff identity — the `ShellIdentity.activeOrg`
  field is non-optional, so the admin VM must neutralize it rather than imply a tenant context
  (no active-org).
- **A2 — Shared surface templates.** Consolidate the queue/detail/editor patterns behind the built
  **`AdminQueueTable`** (7+ consumers) + shared admin components — the prototype's config-driven
  approach realized as real components. **`AdminQueueTable` IS the admin worklist realization** — do
  **not** refactor it onto, or build a parallel to, a new `table` primitive (that is the
  duplication-as-architecture hazard). Promote per the Reuse Register / Promotion Watchlist
  discipline ([[Review-A kit-primitive duplication check]]).
- **A3 — Doc-7B primitive vendoring.** Vendor the **deferred** primitives on first genuine need
  through Doc-7B (not locally): `select`, `toast` (Doc-7C notification center), and a Doc-7B `table`
  **only** for genuinely different tabular needs (e.g. the append-only import-rows sub-table in
  P-ADM-15) — never as a replacement for `AdminQueueTable` (A2). A missing embedded component →
  `[ESC-7-DESIGN]`.
- **A4 — Per-surface governance correctness.** Apply the Prototype's governance framing to each of
  the 29 pages — most importantly the **Board rulings**: P-ADM-07 is **Vendor Moderation** (Suspend/
  Reactivate; no "Approve"; the claim-is-vendor-performed note), and **no** review-moderation /
  admin-ratings surfaces (E8). Render the five states (loading/empty/error/success) + disabled
  System-only actions (`expire_ban`, `process_import_job`).
- **A5 — Governance/review affordances are dev-only.** The prototype's governance strip + ESC
  annotations are a **review aid** (Board MINOR-01/02): in production they are removed or behind a
  dev/staff-debug flag, never user-visible product UI.
- **A6 — Permission-driven navigation (presentational scaffold only in Phase A).** Add a pure
  `filterNav(sections, heldSlugs)` and drive the shell's computed nav VM from a **mock** slug set
  (real resolved slugs are M8-owned and Wave-5 — B6). This realizes the `👁 permission-hidden`
  behavior visually now, without a live auth/staff-context layer. The team/permission model is **§9**
  — an organizational layer over the *existing* IA + frozen slugs; it adds no page, nav group, or
  permission. **Live wiring (resolve slugs → server-computed VM) is Phase B (B6).**
- **A7 — Error/empty state boundaries.** Add per-segment `error.tsx` boundaries under
  `app/(app)/admin/**` (only `loading.tsx` exists today) and confirm `not-found` coverage for the
  `notFound()` detail routes, so the five states (incl. **error**) are real, not implied.

**Phase-A exit:** all 29 surfaces render at approved fidelity with seed VMs (nav = approved IA;
org-switcher suppressed; five states incl. `error.tsx`); actions disabled; `/ivendorz-verify-fe` +
`/review-a-lens` green; production build clean (isolated `next build` in a worktree —
[[Review-B: isolated production build, never defer]]).

## 2. Phase B — Backend wiring (Wave-5-gated, per surface)

Goal: wire each surface to its frozen contracts. **Gated by Wave 5 (M8 backend) and by each
surface's blocking escalations (§4).** No wiring begins before the M8 backend exists and the surface's
escalations resolve via the named channel.

- **B1 — Read bindings (must carry the concurrency token).** Bind list/detail reads to the frozen
  `admin.list_*` / `get_*` and owning-module reads. Reads are not audited (§17.1). No fabricated
  aggregate/metric (DP-A8) — the dashboard tiles bind real `list_*` counts; System health stays out
  (no contract). **Detail read view-models MUST surface the current `expected_state`/version token**
  so it can be threaded read→write (B2 concurrency depends on this provenance).
- **B2 — Audited writes (concurrency + idempotency).** Every mutation (decide, ban, suspend,
  activate_plan, decide_verification, etc.) implemented as a server action following
  **`REFERENCE_Audited_Write_Pattern_v1.0.md`** (D7): transactional write + immutable audit in one
  boundary; `expected_state` optimistic concurrency (token from B1) → `CONFLICT` vs `STATE`. Never
  invent an audit action; bind Doc-2 §9 by pointer (`[ESC-ADM-AUDIT]` items resolve first — §4).
  **Idempotency:** retry-prone commands (e.g. `issue_ban`, the create-then-poll `submit_import_job`)
  carry an idempotency key per the frozen `admin.idempotency_dedup_window` POLICY (Doc-3 v1.7); bind
  the mechanism by pointer to D7 — coin nothing.
- **B3 — Owning-module legs.** Cross-module writes go through the **owning module's service**
  (`marketplace.*`, `trust.decide_verification`, `rfq.manage_routing_rule`, `billing.*`,
  `identity.*`, M6 support) — never a direct table write (Admin-decides/owning-module-owns).
  **The ban→M2 reflect is Marketplace's (M2) in-process `VendorBanned` System consumer**
  (`reflect_vendor_ban`, DD-3 — Doc-4J §H.7 / Doc-5D §3.3); **M8 emits the event only and never
  writes vendor-profile status.** (Attributing `reflect_vendor_ban` to M8 would be a cross-module DB
  write — Red-Flag; corrected here and in Planning §3.)
- **B4 — Firewall enforcement in code.** No score write on verification; no award/eligibility on
  routing; `NOT_FOUND` collapse on link/staff-internal reads; no active-org header; `VendorBanned`
  as the only emitted event.
- **B5 — Authorization.** Gate every action on its frozen staff slug; `[ESC-ADM-SLUG]` surfaces
  (missing-vendor/link/import/outreach), **`[ESC-RFQ-SLUG]`** (routing/matching) and
  **`[ESC-IDN-SLUG]`/DC-3** (identity write-side) wire only after their slug registers (§4) — the
  nearest frozen enumerated slug for some legs is `staff_super_admin`, which is audited break-glass,
  **not** a standing team grant, so those surfaces are authorization-ESC-blocked, not wireable today.
- **B6 — Permission-driven nav wiring.** Resolve the staff member's held slugs (M1
  `check_permission`, app-layer) and **compute the filtered nav VM server-side** before it reaches
  the shell; the shell renders whatever `NavSection[]` it is given (it does not filter client-side).
  See §9.4.

**Phase-B exit (per surface):** Doc-8 e2e + RBAC tests; Wave-5 exit gates 8D (Admin-only RLS / link
non-disclosure), 8E (Admin-decides/owning-module-owns), 8F (`VendorBanned` framing); `/ivendorz-security`
+ `/review-a-lens` green.

---

## 3. Sequencing (WBS-ready; not a schedule)

Phase A can run now (parallel-authorized); Phase B waits for Wave 5 and per-surface escalations.

| Order | Group | Surfaces | Phase-B gate notes |
|---|---|---|---|
| 1 | Shell + Dashboard | shell, P-ADM-01 | dashboard reads only (list_* counts); no writes |
| 2 | Moderation | 02/03/04 | clean (slug `staff_can_moderate_rfq`; audit §9) |
| 3 | Enforcement | 05/06 | `VendorBanned`; ban-expiry audit = `[ESC-ADM-AUDIT]` (resolve) |
| 4 | Verification | 12/13 | Trust firewall; binds `trust.decide_verification.v1`; workflow audit `[ESC-ADM-AUDIT]` |
| 5 | Approvals/Suggestions | 07/08/09/27/28 | **07 = moderation (E5)**; 27/28 slug `[ESC-ADM-SLUG]`; 28 non-disclosure |
| 6 | Ads | 10/11 | M2 leg (`review_advertisement`) |
| 7 | Import | 14/15 | create-then-poll; System process; slug `[ESC-ADM-SLUG]` |
| 8 | Outreach | 16/17/18 | moat; slug + audit `[ESC-ADM-*]` |
| 9 | Routing/Matching | 19/20/21 | moat; read-only 21; no award |
| 10 | Monetization | 22/23/24 | M7 leg; `activate_plan` (additive) |
| 11 | Identity Ops | 25/26 | **list-read `[ESC-7-API]` (E4) blocks the list wiring** |
| 12 | Support | 29 | M6 leg; staff ticket transitions; aggregate M6-owned |

## 4. Escalation → wiring gate map (Phase B blockers)

Wiring of a surface does not start until its blocking escalation resolves through its named channel
(Board / additive corpus patch). From Planning §12:

| Escalation | Blocks | Resolve before |
|---|---|---|
| **E1** `[ESC-ADM-SLUG]` (missing-vendor/link/import/outreach) | writes on 27/28/14/15/16/17/18 | slug registration (Doc-2 §7 additive) |
| **E2** `[ESC-ADM-AUDIT]` (ban-expiry/verification/outreach) | audit binding on those writes | audit-action registration (Doc-2 §9 additive) |
| **E3** `[ESC-ADM-POLICY]` (page-size/dedup/retention) | tunables | POLICY key registration (Doc-3 §12.2) |
| **E4** — no frozen admin cross-tenant list-read (orgs/users) | P-ADM-25/26 **list-read** wiring | wiring the identity list reads |
| **E5** — P-ADM-07 has no Admin "approve" contract | any approval semantics on 07 | already handled: surface is moderation-only; naming/route reconciliation only (§8.2) |
| **E6** — trust-publication leg not page-pinned | placement of `freeze_/reactivate_trust_score` | Board decides the host surface |
| **E7** — dashboard System health / Reports / Settings / global search | those tiles/affordances | `[ESC-7-API]` (health/reports/search) + M0 (settings/config); **N/A for wiring** — rendered honestly (§2 B1, §9.2), never fabricated |
| **E8** — review-moderation placement / admin-ratings / dev-ownership | those surfaces (**not built now**) | Board (`BOARD-PACKET-REVIEW-SYSTEM-FE-MINTS`) |
| **E9** — route topology `(admin)` vs `app/(app)/admin` | shell mount | reconcile at A1 (cosmetic; IA route-agnostic) |
| **`[ESC-RFQ-SLUG]`** (Doc-5E §E6.5/§E6.6) — no dedicated routing-governance staff slug (nearest frozen = `staff_super_admin`, break-glass) | P-ADM-19/20/21 **authorization** wiring | routing-slug registration (Doc-2 §7 additive) — not wireable on a standing team grant today |
| **`[ESC-IDN-SLUG]` / DC-3** (Doc-5C) — least-privilege identity-governance slug is a future Doc-2 §7 patch | P-ADM-25/26 **write-side** (status / ownership-recovery) authorization | identity-slug registration (Doc-2 §7 additive) |

**Phase A is not blocked by these** (presentation renders the disabled affordance); only **Phase B
wiring** is gated. **E7 is not a wiring blocker** (its tiles/affordances are rendered as honest
`[ESC-7-API]` placeholders / omitted, never fabricated).

## 5. Testing & verification (Doc-8)

- **Phase A:** `/ivendorz-verify-fe` (8-layer), `/review-a-lens` (conformance), isolated production
  build (`/fe-verify-bundle`) — no dev-server-only passes.
- **Phase B:** Doc-8 e2e per journey (J-ADM-01…07) + RBAC matrix per staff slug; `/ivendorz-security`
  (org-context N/A but slug-gating, non-disclosure, cross-module boundary); audited-write invariant
  tests (transaction↔audit) per the D7 reference suite.
- **Cross-cutting (owned elsewhere, bound by pointer):** accessibility realization (focus management
  on route change, keyboard behavior for permission-hidden groups) is verified by `/ivendorz-verify-fe`;
  **performance budgets are Doc-8-owned** (this plan coins none); **i18n/localization** for admin
  surfaces is a platform-level Doc-7 concern (out of this plan's scope) — pointers only, nothing coined.

## 6. Risks

- **Drift from the approved prototype** — mitigate: the prototype is the visual source of truth
  (version-linked); Review-A checks fidelity + governance.
- **Wiring ahead of an unresolved escalation** — mitigate: the §4 gate map; Flag-and-Halt.
- **Re-coining a primitive** instead of vendoring via Doc-7B — mitigate: kit-primitive duplication
  check in Review-A.
- **Prod-build regressions** (barrel re-exports / eager chunks) — mitigate: isolated `next build`
  in a worktree, chunk-ownership via app-build-manifest ([[Review-B: isolated production build, never defer]]).

## 7. Out of scope / does NOT authorize

- **No production development** until this plan passes engineering + governance review.
- **No Phase-B wiring** until Wave 5 (M8 backend) and the surface's §4 escalation resolve.
- Coins no contract/field/enum/state/route-as-API/event/POLICY key; no architecture change; no new
  module/ownership boundary; does not build review-moderation or admin-ratings surfaces (E8).

## 8. Open decisions for review

1. **Phase-A ownership** — assign to a Dev team (FE-ADM / Team-3, the current owner of `P-ADM-*`).
2. **Route topology (E9)** — ratify `app/(app)/admin/*` as canonical (built) vs the Doc-7C `(admin)`
   group name; recommend documenting the built path as the realization of the `(admin)` group.
3. **Governance-strip production treatment (MINOR-01/02)** — confirm: removed vs dev/staff-debug flag.
4. **Trust-publication host (E6)** — which surface hosts `freeze_/reactivate_trust_score`.
5. **Admin team assignment (§9)** — ratify the persona→surface mapping (esp. the Platform
   Administration catch-all for Billing/Identity/Support and general Moderation placement).

---

## 9. Admin Personas & Responsibility Matrix

**Scope note (load-bearing).** This is a **Stage-5 implementation concern only** — *not* Stage-1
planning or Stage-3 prototype content. It is an **organizational layer** that groups the **existing**
29 Admin Console surfaces by operational responsibility so frontend routing, navigation visibility,
and permission gating are organized by staff function instead of one all-powerful admin. It is
**not** a new module, feature, workflow, API, contract, page ID, permission, ownership boundary, or
firewall change. It **reuses** the frozen IA (Planning §3), the frozen surfaces (`P-ADM-01…29`), the
frozen permission slugs, and the frozen contracts — and **coins nothing**. No `staff_super_admin`
bypass is designed in (that slug is the audited break-glass override, never a team's standing grant);
where a leg's only frozen enumerated slug is `staff_super_admin` (routing/matching), the team is
**authorization-ESC-blocked** pending a least-privilege slug (§4 `[ESC-RFQ-SLUG]`), not standing-granted.

> **Nav-group basis.** The nav groups below are the **approved prototype IA (Planning §3.1)**, taken
> as canonical. The shipped `admin-shell-vm.ts` `ADMIN_NAV` currently uses different group labels and
> is missing entries — reconciled in Phase A (§1 A0/A1), not a new taxonomy.

### 9.1 Frozen permission-slug inventory (the only slugs this section may bind)

M8 staff slugs (Doc-4J §H.3, from Doc-2 §7): **`staff_can_moderate_rfq`** · **`staff_can_ban`** ·
**`staff_can_manage_categories`** (category-suggestion decisions ONLY) · **`staff_can_verify`** ·
**`staff_super_admin`** (audited break-glass override — never a standing team grant). Cross-module:
**`staff_can_support`** (defined in **Doc-2 §7**; consumed by M6 support, Doc-5H); **Doc-5D staff
gating** (vendor-profile / ad / category CRUD, M2); **Doc-5I Admin** (billing, M7); **Doc-5C Admin**
(identity **read** legs, M1, no org). **Open slug escalations (not invented, not wireable as a
standing team grant until registered):** **`[ESC-ADM-SLUG]`** — missing-vendor + link decisions,
import, outreach (Planning §12 E1); **`[ESC-RFQ-SLUG]`** (Doc-5E §E6.5/§E6.6) — routing/matching
governance (nearest frozen enumerated = `staff_super_admin`, break-glass); **`[ESC-IDN-SLUG]` / DC-3**
(Doc-5C) — identity-governance **write-side** least-privilege slug.

> **Slug reconciliation (governance-critical).** The tasking example used `staff_can_moderate_vendor`
> and `staff_can_import` — **these are NOT frozen slugs** and are not used here. Per the instruction's
> own constraint (use frozen slugs; do not invent), vendor moderation (P-ADM-07) binds **Doc-5D staff
> gating** and import (P-ADM-14/15) binds **`[ESC-ADM-SLUG]`**. Where a cross-module leg's exact slug
> name is not stated verbatim in the frozen planning docs, it is bound **by pointer** ("per Doc-5x
> staff gating"), never coined.

### 9.2 Operational teams (persona definitions)

**1 · Platform Administration** — platform-level oversight & administration.
- **Surfaces:** P-ADM-01 (Dashboard) · P-ADM-25/26 (Identity ops — org/user administration) ·
  P-ADM-22/23/24 (Monetization — plan/entitlement configuration) · P-ADM-29 (Support).
- **Nav groups:** Overview · Identity · Billing · Support.
- **Permissions:** Dashboard reads (visibility of each tile follows the viewer's other slugs);
  Identity **read** = Doc-5C Admin (no org); Identity **write-side** (status / ownership-recovery) =
  **`[ESC-IDN-SLUG]`/DC-3** (authorization-blocked pending slug registration — §4); Billing =
  Doc-5I Admin; Support = `staff_can_support` (Doc-2 §7).
- **Typical:** monitor the platform overview; administer org/user status + ownership recovery;
  configure the plan catalog/entitlements; handle support tickets.
- **NON-responsibilities:** does **not** moderate content, verify, ban, route, or run outreach.
  **System config & feature flags are M0-owned** (not an M8 surface — Planning §12 E7); **platform
  monitoring / "system health" has no frozen contract** (`[ESC-7-API]`); **staff-account/role
  administration has no frozen `P-ADM` surface** (an M1 concern outside the 29) — none invented.
  Never uses `staff_super_admin` as a standing grant.

**2 · Marketplace Operations** — marketplace content & catalog governance.
- **Surfaces:** P-ADM-07 (Vendor moderation) · P-ADM-08/09 (Categories) · P-ADM-10/11 (Ads) ·
  P-ADM-27 (Suggestions) · P-ADM-28 (Link triage) · P-ADM-02/03 (general **content** moderation).
  *(This assigns ownership of the general content-moderation surfaces only; it does **not** pre-empt
  Board **E8** — whether the review-system's review-moderation rides on P-ADM-02/03 or gets dedicated
  pages remains the Board's open decision.)*
- **Nav groups:** Marketplace · Operations › Moderation.
- **Permissions:** vendor moderation = **Doc-5D staff gating**; categories = `staff_can_manage_categories`
  (suggestion decisions) + Doc-5D staff gating (category CRUD); ads = Doc-5D staff gating; suggestions
  (missing-vendor) = `[ESC-ADM-SLUG]`; link triage = `[ESC-ADM-SLUG]`; general moderation =
  `staff_can_moderate_rfq` (**shared with RFQ Operations** — one slug gates BC-ADM-1).
- **Board ruling (binding):** **Vendor Moderation ≠ Vendor Approval** — P-ADM-07 is suspend/reactivate
  only; there is **no** "Approve" action; vendor *claim* approval is vendor-performed
  (`marketplace.claim_vendor_profile.v1`, User actor).
- **NON-responsibilities:** never decides Trust/verification; never bans (Enforcement owns); never
  routes/awards RFQs. **Link-suggestion content is non-disclosure** — `NOT_FOUND` collapse, never
  exposed to a tenant/vendor.

**3 · RFQ Operations** — RFQ content moderation + routing control + matching observability.
- **Surfaces:** P-ADM-04 (RFQ moderation) · P-ADM-19/20 (Routing rules) · P-ADM-21 (Matching results).
- **Nav groups:** Operations › RFQ moderation · RFQ Operations.
- **Permissions:** RFQ moderation = `staff_can_moderate_rfq`; routing/matching (P-ADM-19/20/21) =
  **`[ESC-RFQ-SLUG]`** (Doc-5E §E6.5/§E6.6 — the only frozen enumerated slug is `staff_super_admin`,
  break-glass, so these surfaces are **authorization-ESC-blocked** for a standing team slug, not
  wireable today — §4). Doc-5E control-plane acts with **no org**.
- **Binding statement:** **RFQ Operations monitor routing and matching results but never decide
  procurement awards** — `assist_routing` adjusts rules / human-assist (Stage-gated),
  `get_matching_results` is a read; **no winner / selection / ranking / eligibility** (moat).
- **NON-responsibilities:** no award/selection/eligibility decision; no vendor moderation, ban, or
  verification.

**4 · Verification Operations** — the verification workflow.
- **Surfaces:** P-ADM-12 (Verification queue) · P-ADM-13 (Verification task detail).
- **Nav groups:** Operations › Verification.
- **Permissions:** `staff_can_verify`.
- **Binding statement (Trust firewall):** **Verification workflow ≠ Trust decision.** M8 owns the
  workflow task + a reference; M5 owns the decision/record/score (`trust.decide_verification.v1`).
  **No Trust score ownership; no score write** — scores auto-calculate under System.
- **NON-responsibilities:** never writes/owns any Trust / Performance / Financial-Tier / verification
  score; never moderates content or bans.

**5 · Enforcement Operations** — platform-wide vendor bans.
- **Surfaces:** P-ADM-05 (Bans) · P-ADM-06 (Ban detail / issue).
- **Nav groups:** Enforcement.
- **Permissions:** `staff_can_ban`.
- **Binding statements:** **`VendorBanned` is the only emitted event** (from `issue_ban`); **Ban ≠
  buyer blacklist** (a ban is platform-wide and vendor-visible; a blacklist is buyer-private and
  undetectable — Doc-7F/7G, not this console). `expire_ban` is **System-only** (displayed, never
  invoked).
- **NON-responsibilities:** never writes vendor-profile status directly (Marketplace reflects the ban
  via its consumer); never verifies or moderates.

**6 · Import & Data Operations** — seed-data import jobs + monitoring.
- **Surfaces:** P-ADM-14 (Import jobs) · P-ADM-15 (Import job — new / detail).
- **Nav groups:** Operations › Import.
- **Permissions:** **`[ESC-ADM-SLUG]`** (no frozen import slug — **not** `staff_can_import`).
- **Binding statement:** **Marketplace entities remain Marketplace-owned** — import **loads** data,
  it never **owns** the seeded categories/vendors (created via the Marketplace service; seam
  import→M2). `process_import_job` is **System-only** (create-then-poll).
- **NON-responsibilities:** owns no marketplace/catalog data; runs no matching; performs no moderation.

**7 · Outreach Operations** — vendor-acquisition outreach (marketing).
- **Surfaces:** P-ADM-16/17 (Campaigns) · P-ADM-18 (Contacts).
- **Nav groups:** Outreach.
- **Permissions:** **`[ESC-ADM-SLUG]`** (no frozen outreach slug).
- **Binding statement:** **Marketing / informational acquisition only** — **never** procurement
  routing, matching, ranking, supplier-selection, award, or eligibility (moat).
- **NON-responsibilities:** no procurement decision; no moderation, verification, or ban.

### 9.3 Responsibility Matrix (representative — frozen slugs / ESC only)

| Team | Surface | Permission (frozen / ESC) | Navigation group |
|---|---|---|---|
| Marketplace Operations | P-ADM-07 Vendor moderation | Doc-5D staff gating *(not `staff_can_moderate_vendor`)* | Marketplace |
| Marketplace Operations | P-ADM-08 Categories | `staff_can_manage_categories` (+ Doc-5D CRUD) | Marketplace |
| Marketplace Operations | P-ADM-28 Link triage | `[ESC-ADM-SLUG]` | Marketplace |
| Marketplace Operations | P-ADM-02/03 Moderation | `staff_can_moderate_rfq` | Operations › Moderation |
| RFQ Operations | P-ADM-04 RFQ moderation | `staff_can_moderate_rfq` | Operations › RFQ moderation |
| RFQ Operations | P-ADM-19/20/21 Routing / Matching | `[ESC-RFQ-SLUG]` *(nearest frozen = `staff_super_admin`, break-glass)* | RFQ Operations |
| Verification Operations | P-ADM-13 Verification task | `staff_can_verify` | Operations › Verification |
| Enforcement Operations | P-ADM-05/06 Bans | `staff_can_ban` | Enforcement |
| Import & Data Operations | P-ADM-15 Import job | `[ESC-ADM-SLUG]` *(not `staff_can_import`)* | Operations › Import |
| Outreach Operations | P-ADM-16 Campaigns | `[ESC-ADM-SLUG]` | Outreach |
| Platform Administration | P-ADM-25/26 Identity ops | Doc-5C Admin read · write-side `[ESC-IDN-SLUG]`/DC-3 | Identity |
| Platform Administration | P-ADM-22 Plan management | Doc-5I Admin | Billing |
| Platform Administration | P-ADM-29 Support | `staff_can_support` | Support |
| Platform Administration | P-ADM-01 Dashboard | reads per the viewer's slugs | Overview |

*Coverage: all 29 `P-ADM` surfaces map to exactly one team (surfaces not listed above follow their
group's row). `staff_can_moderate_rfq` is deliberately shared by Marketplace + RFQ Operations because
one frozen slug gates all of BC-ADM-1.*

### 9.4 Navigation visibility (permission-driven)

- **Rule:** frontend navigation is **permission-driven** — a staff member sees **only** the
  navigation groups/surfaces their held slugs authorize. Unauthorized groups are **hidden** (not
  greyed), matching the prototype's `👁 permission-hidden` marker.
- **Realization (server-computed VM).** The nav VM is computed **server-side** from the staff's
  **resolved slugs** (M1 `check_permission`, app-layer authorization — RLS is a backstop, not the
  model) via a pure `filterNav(sections, heldSlugs)`, and the shell renders whatever `NavSection[]`
  it is handed (it does **not** filter client-side). Server-side route guards still enforce access on
  every route (a hidden group is not a security boundary by itself). Phase A scaffolds `filterNav`
  over a mock slug set (A6); Phase B resolves real slugs (B6).
- **Reuse only:** this uses the **existing** IA (Planning §3 nav → surface → owner map). It creates
  **no** new page, nav group, or permission. A staff member may belong to multiple teams (union of
  slugs); breadth is additive, never a `staff_super_admin` bypass.

### 9.5 Compliance

No frozen architecture modified · no module created · no page ID created · no permission invented
(`[ESC-ADM-SLUG]` / `[ESC-RFQ-SLUG]` / `[ESC-IDN-SLUG]` surfaced where no §7 slug exists) · no
ownership boundary changed · no governance firewall changed · no super-admin standing grant · Stage-5
implementation concern only (not Stage-1/Stage-3).

---

## 10. Review Disposition Log (v0.2 → v1.0 — Validate-Findings gate, CLAUDE.md §13)

Two independent reviews on v0.2 (fresh context, adversarial): **Team 4 — Engineering** (0B/3M/4m/2N/3O)
and **Team 5 — Governance** (0B/2M/2m/0N/4O). No blockers. Each finding adjudicated (Valid?
Applicable? Best for the product? Consistent with the frozen corpus?); all validated findings folded.

**Governance (Team 5):**
| # | Finding | Sev | Disposition |
|---|---|---|---|
| G-M1 | `reflect_vendor_ban` misattributed to M8 (it is **Marketplace's** M2 `VendorBanned` consumer — Doc-4J §H.7 / Doc-5D §3.3); Red-Flag if carried to code | MAJOR | **FOLDED** — §2 B3 corrected; **Planning §3 patched** to match (non-authoritative → conforms to frozen) |
| G-M2 | RFQ (`[ESC-RFQ-SLUG]`) + Identity write-side (`[ESC-IDN-SLUG]`/DC-3) slug escalations absent from §4; §9 "no super-admin standing grant" collided with Doc-5E's `staff_super_admin` binding | MAJOR | **FOLDED** — §4 rows added; §9.1/§9.2/§9.3 bind ESC + reconcile super-admin (authorization-ESC-blocked, not standing-granted) |
| G-m1 | `staff_can_support` authority = **Doc-2 §7** (M6 = consumer, not authority) | MINOR | **FOLDED** — §9.1 |
| G-m2 | §4 E7/E8 labels swapped vs Planning §12; real E7 absent | MINOR | **FOLDED** — §4 relabeled; real E7 added (N/A-for-wiring) |
| G-O1 | 02/03 ownership must not pre-empt Board E8 | OBS | **FOLDED (note)** — §9.2 Team-2 clarifies content-moderation ≠ E8 review-moderation |
| G-O2/3/4 | Firewalls / Board rulings / coining all verified clean | OBS | **AFFIRMED** — no action |

**Engineering (Team 4):**
| # | Finding | Sev | Disposition |
|---|---|---|---|
| E-M1 | No built-vs-approved delta inventory; `ADMIN_NAV` labels differ + missing entries (27/28/18/29); 07 routed `/vendor-approval` | MAJOR | **FOLDED** — new **A0** reconciliation matrix; A1 names the `ADMIN_NAV` rewrite + 4 missing entries; §8.2/E5 route rename |
| E-M2 | Permission-driven nav mis-phased into Phase A; "client renders" wrong (shell renders a server-computed VM; slugs are Wave-5) | MAJOR | **FOLDED** — A6 = presentational scaffold (mock slugs) only; **B6** live wiring; §9.4 language → server-computed |
| E-M3 | `expected_state` provenance + idempotency unspecified | MAJOR | **FOLDED** — B1 carries the token; B2 states idempotency (bound to D7 + `admin.idempotency_dedup_window`) |
| E-m1 | `table` vs built `AdminQueueTable` re-coin risk | MINOR | **FOLDED** — A2 (AdminQueueTable IS the worklist) / A3 (table only for import-rows sub-table) |
| E-m2 | No-active-org vs shared shell org-switcher | MINOR | **FOLDED** — A1 suppresses org-switcher via `orgSwitcherSlot`, neutral staff identity |
| E-m3 | No `error.tsx` boundaries built | MINOR | **FOLDED** — new **A7** per-segment error/not-found boundaries |
| E-m4 | §9 nav-group self-consistency (prototype IA vs shipped VM) | MINOR | **FOLDED** — §9 declares prototype IA canonical + cross-refs A0/A1 |
| E-N1 | Header v0.2 vs footer v0.1 drift | NIT | **FOLDED** — reconciled to v1.0 |
| E-N2 | Route rename `/vendor-approval` understated | NIT | **FOLDED** — §8.2 / E5 |
| E-O1/2/3 | i18n / perf-budget / a11y ownership pointers | OBS | **FOLDED (pointers)** — §5 cross-cutting note |

**Gate:** BLOCKER 0 · MAJOR 0 · MINOR 0 open. Ready for **commit → Board approval** (per the Stage-5
review pipeline). Frontend implementation begins only after Board approval **and** the Wave-5 gate.

---

*End of Admin Console — Stage-5 Frontend Implementation Plan (**v1.0** — Team-4 Engineering + Team-5
Governance reviews folded). NON-AUTHORITATIVE · PLANNING ONLY · coins nothing · wave-gated. Authorizes
no production development. Next: commit → Board approval; then Phase A (presentation elevation,
parallel) and — behind Wave 5 — Phase B (wiring). On any conflict with a frozen document:
Flag-and-Halt.*
