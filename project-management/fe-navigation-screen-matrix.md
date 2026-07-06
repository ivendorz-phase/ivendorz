# Frontend Navigation & Screen Matrix — single execution map

**FE Program Management · v1.0 · 2026-07-06 · Owner-requested deliverable** (sequencing ruling
2026-07-06: produced BEFORE the Business Operations Journey document, which is **deferred** until
the frontend is substantially complete / backend work begins).

**Derived, non-authoritative.** This matrix is a tracking VIEW over on-disk truth + the trackers —
it coins nothing and re-homes nothing. Frozen page ids stay in [`page_inventory.md`](../page_inventory.md)
(universe **151**, coverage-verified); milestones stay in [`fe-program-wbs.md`](fe-program-wbs.md);
queues/gates stay in [`execution-board.md`](execution-board.md). On divergence, those win and this
file is patched. Statuses reflect the working tree as of 2026-07-06.

**Status legend:**

| Mark | Meaning |
| --- | --- |
| ✅ Wired (mock) | Reads through the RFQ workflow adapter seam (`_components/rfq-workflow/adapters`) — swaps to the GI-02 server layer at Wave 4 with no page change |
| 🟩 Built | Presentation complete (page seeds / genuine-empty); wiring is a later, separate milestone |
| ⏳ Scaffold | Route exists as `ImplementationPendingView` — no backing contract yet; real build is contract-/Board-gated |
| ⏸ Gated | Not buildable now; the gate is named in the row |

**Team map:** Team-1 = Public · Team-2 = Buyer · Team-3 = Vendor. **Admin dev ownership is
UNASSIGNED (Board to assign)** — note: in this program Team-4/Team-5 are the REVIEW lanes
(Board decision 2026-07-02), so an admin build must be assigned to a dev team, not to a review team.

---

## 1. Buyer journey (Team-2) — `app/(app)/(buyer)`

### RFQ workflow spine (adapter-wired)

| Screen | Route | Status | Notes |
| --- | --- | --- | --- |
| RFQ list + journey buckets | `/rfqs` | ✅ Wired (mock) | `list_rfqs` + pipeline summary |
| RFQ create wizard | `/rfqs/new` | 🟩 Built | blank-draft presentation |
| RFQ detail (+ journey strip) | `/rfqs/[rfqId]` | ✅ Wired (mock) | `get_rfq` + quotations tab |
| Compare sheet | `/rfqs/[rfqId]/compare` | ✅ Wired (mock) | **WP-2 changes HELD until the Compare UX freeze is signed** (`productSpec/COMPARE_SHEET_UX_FREEZE_v0.1.md`) |
| Award wizard | `/rfqs/[rfqId]/award` | ✅ Wired (mock) | shortlist read; `award_rfq` write parked |
| Version history | `/rfqs/[rfqId]/versions` | ✅ Wired (mock) | immutable chain (Inv #8) |
| Routing & invitations log | `/rfqs/[rfqId]/routing` | ✅ Wired (mock) | delivered-onward only |
| Clarifications host | `/rfqs/[rfqId]/clarifications` | ✅ Wired (mock) | thread itself = M6 embedded component, Board-deferred |
| Quotation detail | `/rfqs/[rfqId]/quotations/[quotationId]` | ✅ Wired (mock) | visibility-gated read |
| Close-lost | `/rfqs/[rfqId]/close-lost` | 🟩 Built | frozen reason codes |

### Other buyer surfaces

| Screen | Route | Status | Notes |
| --- | --- | --- | --- |
| Dashboard | `/dashboard` | 🟩 Built | BX-03…06 enhanced |
| Approvals queue | `/approvals` | 🟩 Built | feeds `pending_internal_approval` |
| Discovery & favorites | `/discover` | 🟩 Built | FE-BUY-10 closed |
| Vendor CRM list / detail | `/crm` · `/crm/[recordId]` | 🟩 Built | FE-BUY-09; buyer-private (Inv #11) |
| Documents hub | `/documents` | 🟩 Built | FE-DOC-01 closed |
| Engagements list / detail | `/engagements` · `/engagements/[id]` | 🟩 Built | M4 SURFACES EXIST; wiring ⏸ (Wave 4+) |
| PO · Challan · Trade invoice · Payments · WCC | `/engagements/[id]/po` etc. (5 routes) | 🟩 Built | M4 document chain presentation; wiring ⏸ |
| Notifications | `/notifications` | 🟩 Built | BX-05 relocation |
| Org / Profile / Settings / Team | 4 routes | 🟩 Built | compositions of Account (BX-05) |
| Quotations (cross-RFQ) | `/quotations` | ⏳ Scaffold | no cross-RFQ quotation read exists |
| Quotations compare (cross-RFQ) | `/quotations/compare` | ⏳ Scaffold | stays scaffold under the Compare freeze D2 proposal |
| Purchase orders (standalone) | `/purchase-orders` | ⏳ Scaffold | contract-gated |
| Saved vendors | `/saved-vendors` | ⏳ Scaffold | P-BUY-05 held (projection gap) |
| Spec library | `/spec-library` | ⏳ Scaffold | contract-gated |
| Messages | `/messages` | ⏳ Scaffold | M6-gated |
| Reports | `/reports` | ⏳ Scaffold | contract-gated |

## 2. Vendor journey (Team-3) — `app/(app)/workspace`

### RFQ workflow spine (adapter-wired)

| Screen | Route | Status | Notes |
| --- | --- | --- | --- |
| Invitation inbox + quota + buckets | `/rfqs` | ✅ Wired (mock) | received-only (DP1/BE-1) |
| RFQ detail (+ vendor journey strip) | `/rfqs/[rfqId]` | ✅ Wired (mock) | grant-scoped snapshot + own invitation/quotation |
| Quotation builder | `/rfqs/[rfqId]/quotation` | ✅ Wired (mock) | own draft; submit/revise writes parked |

### Other vendor surfaces

| Screen | Route | Status | Notes |
| --- | --- | --- | --- |
| Workspace home / Dashboard | `/` · `/dashboard` | 🟩 Built | VX-01 redesign closed |
| Company profile (+ products, categories, spec library) | `/company` + 4 routes | 🟩 Built | M2–M4 milestones |
| Project portfolio | `/company/projects` | ⏳ Scaffold | VX-01 scaffold |
| Microsite (+ ads suite) | `/microsite` + 3 routes | 🟩 Built | |
| Leads & pipeline | `/leads` · `/leads/[leadId]` | 🟩 Built | private CRM, firewalled |
| Engagements (+ detail + documents) | `/engagements` + 2 routes | 🟩 Built | M7 post-award (E1–E5); wiring ⏸ |
| Documents hub | `/documents` | 🟩 Built | FE-DOC-02 closed |
| Mushok challan | `/documents/mushok-challan` | ⏳ Scaffold | ⏸ gate: `ESC-OPS-DOC-MUSHOK` (Board) |
| Buyer inquiries | `/inquiries` | ⏳ Scaffold | VX-01 scaffold |
| Notifications | `/notifications` | ⏳ Scaffold | VX-01 scaffold |
| Billing & plan | `/billing` | 🟩 Built | entitlements only (Inv #10) |
| Trust center | `/trust` | 🟩 Built | band + ruled numeric display |
| Organization / Settings | 2 routes | 🟩 Built | FE-VEN-12 closed |

## 3. RFQ journey (cross-leg spine)

The RFQ journey is not a third page tree — it is the **workflow spine** both legs share:
`app/(app)/_components/rfq-workflow/` (journey model · frozen transition projection · document
registry · adapter seam · journey UI), documented in [`rfq-workflow.md`](../rfq-workflow.md) v1.1.
The 13 adapter-wired routes above ARE the RFQ journey's realization. Owner status: **✅ approved as
the implementation blueprint** (WP-1 rules: approved pages only · mock adapters · no backend logic
· no reserved/blocked routes · no new workflow states · frozen journey exactly).

## 4. Admin journey (dev owner: UNASSIGNED — Board to assign) — `app/(app)/admin`

All admin surfaces exist as built presentation with seeds (earlier program phase); wiring ⏸ for all.

| Screen group | Routes | Status |
| --- | --- | --- |
| RFQ moderation | `/rfq-moderation` | 🟩 Built |
| Content moderation | `/moderation` · `/moderation/[caseId]` | 🟩 Built |
| Verification | `/verification` · `/verification/[taskId]` | 🟩 Built |
| Vendor approval | `/vendor-approval` | 🟩 Built |
| Categories | `/categories` · `/categories/new` | 🟩 Built |
| Bans | `/bans` · `/bans/[banId]` | 🟩 Built |
| Imports | `/imports` + 2 routes | 🟩 Built |
| Ads / Plans / Entitlements | 5 routes | 🟩 Built |
| Identity (orgs, users) | 2 routes | 🟩 Built |
| Matching / Routing rules | 3 routes | 🟩 Built |
| Outreach / Suggestions / Links / Support | 5 routes | 🟩 Built |
| Admin home | `/` | 🟩 Built |

## 5. Platform / Account (shared shell)

`/account/**` (23 routes: overview, profile, security, members, roles, delegation, billing,
subscription, invoices, usage, lead credits, notifications, settings, organization lifecycle, …) —
all 🟩 Built. Shared shell (sidebar/topbar/quick-create) owned platform-wide; 1 pre-existing mobile
a11y OBS tracked at Board standing agenda #11.

## 6. Public track (Team-1) — `app/(public)`

**Complete:** FE-PUB-01 … FE-PUB-11 all ✅ Closed (landing, discovery, vendor directory/profile,
category, search, product detail, mega menu, canonical subdomain, project detail). Coverage
**151/151 PASS** (`scripts/verify-fe-wbs-coverage.mjs`). Detail lives in
[`fe-program-wbs.md`](fe-program-wbs.md) Track 1 — not duplicated here.

> **Marketplace Family Exception (do not "fix"):** `/marketplace/product/[slug]` and
> `/marketplace/category/[slug]` are **intentionally singular** — ratified route families
> (ADR-025 §8 · MEGA_MENU §9.1). Never pluralize to `/products`/`/categories`; a change needs a
> Board channel. Canonical SEO ownership (apex vs vendor host) is consolidated pointer-only in
> `governanceReviews/URL-NAMING-SEO-REVIEW-ADJUDICATION_v1.0.md` (over ADR-024/ADR-025).

## 7. M4 Business Operations (post-award) — status of the DEFERRED journey

Owner ruling 2026-07-06: the **Business Operations Journey document is deferred** until the
Marketplace/RFQ frontend is substantially complete (40–60%) or backend work begins. Note the
distinction this matrix makes visible: the M4 **pages already exist as built presentation** (buyer
`/engagements/**` suite, vendor `/engagements/**` + documents hubs) — what is deferred is the
journey *document* + M4 *wiring*, not the surfaces.

---

## Rollup (2026-07-06)

| Track | ✅ Wired (mock) | 🟩 Built | ⏳ Scaffold | Owner |
| --- | --- | --- | --- | --- |
| Buyer | 8 routes | 19 routes | 7 routes | Team-2 |
| Vendor | 3 routes | 19 routes | 4 routes | Team-3 |
| Admin | — | 30 routes | — | UNASSIGNED (Board) |
| Account | — | 23 routes | — | shared shell |
| Public | — | complete (Track 1 closed) | — | Team-1 |

**Owner-ruled priority order (2026-07-06):** 1) finish Team-2 buyer implementation (WP-1 rules) →
2) freeze Compare UX (`productSpec/COMPARE_SHEET_UX_FREEZE_v0.1.md`, owner sign-off) → 3) implement
Buyer → Vendor → RFQ → Admin from the approved journeys → 4) backend begins; only then produce the
Business Operations Journey. ESC items go through Board intake (ESC → discussion → decision →
patch → freeze), never by editing frozen journey documents.
