# WORK PACKAGE — FE-DOC-01 Buyer Documents Hub

- **Lane:** G (cross-module presentation composition; DF-6/R6/R7/Inv#8/Inv#11 adjacency)
- **Reviewed-SHA record:** _(fill at submission)_
- **Value:** Buyer Productivity · **Priority:** P1 · **Size:** M · **Risk:** Med

## In scope

- **P-DOC-01 Buyer Documents hub** at `/documents` (in `(buyer)`, sibling of `/engagements`) —
  presentation-only composition of frozen module-owned records; in-page `MOCK_*` seeds
  field-aligned to the established fixture universe (ENG-2026-000124 family, DOC-2026-000091,
  INV-2026-…, BDT) so **every deep link resolves**.
  - **LifecycleStrip** (permanent, top): `RFQ → Quotation → Purchase Order → Challan → Trade
    Invoice → Payment` — six frozen entity names, each a Link setting `?stage=`.
    **Navigation, not state** (MAJOR-01 constraint): never a per-engagement progress indicator;
    no "current stage" computation anywhere. LOI/WCC (frozen kinds not in the strip) reachable
    via the Document Type facet + §2 rows.
  - Toolbar: kit `SearchBar` → allowlisted `?q=` (searches human_ref / counterparty label / kind
    label only) · preset chips All · Received · Sent · Pending approval · Completed (`?view=`) ·
    `RecentlyOpenedStrip` (seeded, presentation-labelled).
  - Kit `FilterSidebar` (collapsed initially): facets = Document Type (frozen kinds +
    as-projected `doc_kind` strings) · Status (per-kind frozen enums) · Counterparty · Date
    (issued_at) · Amount. **No Project facet** (`ESC-OPS-DOC-FEATURES` — no frozen linkage).
  - §1 Generated documents (BC-OPS-4): listing — Ref (DOC-…) · Kind (as-projected label) ·
    Direction (derived, neutral Badge) · Version · Source → `/engagements/[id]` · File (FileLink
    + Preview → `DocumentPreviewDialog` | "PDF generating…" ASYNC-pending row); one
    `grant_state: "revoked"` row; disabled "Generate document" + disabled "Bulk download" +
    hub Print shortcut + presentation Callout.
  - §2 Engagement document records (BC-OPS-2): per-engagement rows (ref + frozen status chip) +
    the five fixed deep links (`/engagements/[id]/po|payments|trade-invoice|challan|wcc`) —
    plain navigation, **no existence claims** (ESC-7G-ENG-03 discipline; the FE-BUY-07 MAJOR
    caption precedent) — + expandable **process timeline** (`DocumentProcessTimeline`, labels
    restate seeded frozen facts only). DF-6 money-boundary Callout adjacent to financial rows.
  - §3 Sourcing documents: deep links to `/rfqs`, quotation detail, comparison (labelled
    "System-generated · never recommends", R6), `/approvals` ("RFQ internal approvals" — never
    "document approvals").
  - §4 Platform invoices: visually separated Card + copy (platform fees ≠ trade documents,
    DF-6) → `/account/invoices`.
  - `?view=` presets over frozen fields: Received/Sent = derived issuer-org vs active-org
    grouping (presentation derivation over Doc-2 §10.5 `organization_id`; view-model comment
    states it; wiring-time projection note in the packet — §F7.5 doesn't enumerate the field);
    Pending = trade invoices in frozen `issued`/`disputed` + the approvals link; Completed =
    engagements `completed|closed` → `/engagements?status=…`.
- **Shared documents home** `app/(app)/_components/documents/` (single `index.ts` import point,
  mirrors `vendor/shared/`) — created HERE because FE-DOC-02/03 are known second consumers (M8
  shared-extraction rationale): `DocumentCollection` (section wrapper + the two empty-state
  contracts) · `document-table-spec.ts` (column model: default sort `issued_at DESC` · cursor/25
  via kit `PaginationControl` · 390px priority = hide Version/Amount/Counterparty, keep
  Ref/Kind/Status/File) · `DocumentActions` (Preview/Download/Print/Bulk-disabled cluster,
  visibility-matrix-consistent) · `DocumentRelations` (same-engagement children +
  engagement↔awarded-RFQ per ADR-002) · `document-icon-map.ts` (single icon map, all FE-DOC
  surfaces) · `analytics-events.ts` (five reserved names — `documents_filter_changed` ·
  `documents_opened` · `document_preview` · `document_download` · `lifecycle_stage_selected` —
  **names only, nothing emits**) · `LifecycleStrip` · `DocumentProcessTimeline` ·
  `DocumentPreviewDialog` · `RecentlyOpenedStrip`. Search debounce = 250 ms constant (component
  spec, not a budget). `DocumentTable` itself materializes on the FE-SH-01 ruling (packet item
  3); until then the buyer hub renders via the buyer-side `DataListTable` + the shared spec
  (same-surface reuse; swap is mechanical; **no third table copy**).
- **Disclosed touches:** `(buyer)/_components/buyer-nav-model.ts` (Operations section +
  `{label: "Documents", href: "/documents", icon: "documents"}`) ·
  `app/(app)/_components/shell/icons.ts` (additive `documents` key — the registry self-authorizes
  extension; fallback = reuse `quotations` key if Review-A objects).

## Out of scope (Review-A enforces)

Backend/wiring/server actions · vendor hub + `/workspace/*` mounts (FE-DOC-02) · templates &
generated-documents PAGES (FE-DOC-03 — the hub renders §1 rows but links no `/documents/generated`
or `/documents/templates` sub-route: they don't exist yet, no dead links) · detail-page touches
(RelatedDocumentsRail/detail print/detail timeline = FE-DOC-04) · re-homing/editing any closed
page · any coined kind/state/format/route/facet (incl. Mushok/credit-debit/packing-list/
sales-order/contract/tag/favorite — `esc_registry.md` §Document Management) · per-engagement
stage-progress rendering (MAJOR-01 constraint) · count/KPI tiles (client-computed counts violate
R7) · kit/token changes · perf-budget numbers (Doc-8 owns; bind by pointer — NIT-R3-02).

## Presentation visibility matrix (MINOR-01 R2 — expectations, not authz)

| Surface | Buyer | Vendor |
|---|---|---|
| Engagement docs (LOI/PO/Challan/WCC) | Read (party) | Read (party) |
| Trade invoices | Read · approve affordance **disabled** | Read · issue affordance **disabled** |
| Payment records | Read · record/confirm **disabled** | Read |
| Generated documents | Read (own + granted) | Read (own + granted) |
| Templates | Read | Read |
| Grant/Revoke · Generate · template lifecycle | **Disabled** | **Disabled** |

## Empty-state contracts (MINOR-02 R2)

Per section, two variants via kit `EmptyState`: **filtered-empty** ("No documents match the
current filters" + clear-filters action) and **genuine-empty** with corpus-honest copy —
engagement docs: "No engagement documents yet — they appear after an RFQ award creates an
engagement" (RFQClosedWon flow); generated: "No generated documents yet". Copy finalized under
Review-A discipline.

## Dependencies

- H: FE-DOC-00 (delivered in the same package pass).
- S: FE-SH-01 ruling (packet item 3) — fallback documented above; does not block.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → close per
Amendment v1.3 §13 (Dev-team self-close on clean A:PASS ∧ B:PASS).

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner decision 3: package then immediate build) ·
Closed —

## Owner findings adjudication annex (§13 Validate-Findings record — Raise ≠ Accept)

### Round 1 (2026-07-03, at plan review)

| Finding | Disposition | Resolution |
|---|---|---|
| MAJOR-01 lifecycle workflow header | ACCEPT | `LifecycleStrip`, six frozen stage names, clickable `?stage=` filters. **Constraint: navigation, not state** — no global document lifecycle exists in the corpus; no per-engagement stage claims (R7-class). LOI/WCC via facet/rows |
| MINOR-01 global search | ACCEPT | Kit `SearchBar` → allowlisted `?q=`, frozen fields only |
| MINOR-02 filter sidebar | ACCEPT minus one facet | Kit `FilterSidebar`, frozen-field facets; **Project facet excluded** (no frozen linkage → `ESC-OPS-DOC-FEATURES`/packet) |
| MINOR-03 timeline view | ACCEPT (hub-side now) | Expandable per-engagement `DocumentProcessTimeline` in §2; detail-page integration → FE-DOC-04 (closed pages, disclosed touches) |
| MINOR-04 related documents rail | ACCEPT, scoped to FE-DOC-04 | `DocumentRelations` built shared; detail rails land as FE-DOC-04 disclosed touches; hub rows already cluster the five deep links |
| NIT-1 preview icon | ACCEPT | `DocumentPreviewDialog`, honest placeholder |
| NIT-2 bulk download | ACCEPT | Disabled affordance + note |
| NIT-3 print | ACCEPT (hub); detail → FE-DOC-04 | Hub print shortcut now |
| NIT-4 recently opened | ACCEPT as seeded presentation | `RecentlyOpenedStrip`, presentation-labelled |
| NIT-5 favorites | DEFER → packet | Unmodeled (M2 favorites ≠ document favorites) → `ESC-OPS-DOC-FEATURES` |
| NIT-6 document tags | DEFER → packet | Owner: "only if future corpus supports it" → `ESC-OPS-DOC-FEATURES` |

### Round 2 (2026-07-03)

| Finding | Disposition | Resolution |
|---|---|---|
| MINOR-01 permission matrix | ACCEPT | Visibility matrix above (expectations, not authz) |
| MINOR-02 empty-state variants | ACCEPT | Two contracts per section (above) |
| NIT-01 default sort | ACCEPT | `issued_at DESC`, stated once in `document-table-spec.ts` |
| NIT-02 pagination | ACCEPT | Cursor/25 via kit `PaginationControl` (P-BUY-19 convention, not Load-More) |
| NIT-03 icon mapping | ACCEPT | Single `document-icon-map.ts` |
| NIT-04 responsive column priority | ACCEPT | Defined once: 390px hides Version/Amount/Counterparty; keeps Ref/Kind/Status/File |
| Strategic: abstraction family | ACCEPT | `DocumentCollection → DocumentTable → DocumentActions → DocumentRelations`; FE-SH-01 ask sharpened (packet item 3); fallback = buyer DataListTable + shared spec, no third copy |

### Round 3 (2026-07-03, non-blocking)

| Finding | Disposition | Resolution |
|---|---|---|
| NIT-R3-01 analytics contract | ACCEPT (FE-PUB-09 precedent) | Five reserved names in `analytics-events.ts`; **nothing emits** (presentation-only; PostHog wiring later); no domain slug coined |
| NIT-R3-02 performance budget | ACCEPT intent, bind by pointer | Standing Board guardrail: FE planning never invents perf budgets — **Doc-8 owns**. Acceptance targets cite Doc-8's entries for this surface class; if Doc-8 lacks one, the gap is recorded here + packet, never coined. Interaction spec (not budget): search debounce 250 ms; dialog/table posture = the kit's |

## DoD confirmation (checked at close — carry-forward rule: this is a NEW page, full-page DoD)

☐ page DoD ☐ responsive D/T/M (incl. 390px column-priority behavior) ☐ WCAG-AA (axe 0 own-content)
☐ tsc/eslint/prettier ☐ realistic mock data (fixture-universe parity with P-BUY-19/22/23 seeds —
every deep link resolves) ☐ LifecycleStrip = six frozen labels, `?stage=` only, zero
progress-state rendering ☐ facets frozen-field-only, no Project facet ☐ `?q=`/`?view=`/`?stage=`
allowlisted with safe fallbacks ☐ disabled affordances match the visibility matrix cell-for-cell
☐ both empty-state variants reachable ☐ icons only via `document-icon-map.ts` ☐ no
`_components/vendor/*` import under `(buyer)/documents/` or `_components/documents/` ☐ no coined
status/kind strings (grep) ☐ no "approval" wording on documents ☐ Review A PASS ☐ Review B PASS
☐ no TODO/dead code ☐ no duplicate components (DataListTable fallback ≠ fork; no third copy)
☐ promotion candidates registered ☐ tracker updated ☐ card closed
