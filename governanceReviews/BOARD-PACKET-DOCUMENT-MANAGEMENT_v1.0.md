<!--
Doc-type:  Architecture Board Decision Packet (decision-prep; NON-authoritative input to the human Architecture Board).
Subject:   FE-DOC Cross-workspace Document Management — excluded document kinds/features (corpus gaps) + FE-SH-01 promotion + mint ratification record.
Produced:  2026-07-03 (FE-DOC-00 governance package, corpus-verified). Raise != Accept: the Board rules; the registry/trackers are then patched to match.
Note:      AI/skill does not author corpus patches (CLAUDE.md 7/8/11). Recommendations here are NOT rulings. Items 2a-2c require human-approved additive patches + version bumps.
-->

# iVendorz Document Management — Architecture Board Decision Packet

**Track:** FE-DOC Cross-workspace Documents (WBS v1.2, owner Board-minted 2026-07-03).
**Packet date:** 2026-07-03 · **Prepared for:** the HUMAN Architecture Board · **Prepared by:** FE-DOC-00 governance package pass (rank ~7–8, non-authoritative).

## Purpose

The owner directed a cross-platform Document Management surface covering the full procurement
document lifecycle. Corpus verification found that **several of the requested document kinds and
features have no frozen anchor** — rendering them would coin document kinds/states, which §11 and
the Red-Flag list forbid. Per the owner's decision 2 (2026-07-03, recorded at plan approval), the
UI ships **frozen kinds only** and this packet routes each gap to its Board channel. The packet
also carries the FE-SH-01 `DataListTable` promotion request (needed by the FE-DOC build sequence)
and the mint ratification record. **Nothing here blocks the FE-DOC builds** — every item ships a
documented interim.

## Status

- Track: minted (WBS v1.2 · `page_inventory.md` v0.4 §8A · coverage script UNIVERSE `DOC: 6` ·
  150/150 green). FE-DOC-00 closes on this deliverable; items below stay open on their handles.
- ESC handles registered: `ESC-OPS-DOC-MUSHOK` · `ESC-OPS-DOC-KINDS` · `ESC-OPS-DOC-FEATURES`
  (`esc_registry.md` §Document Management).
- Owner findings R1–R3 adjudicated at minting (§13 Validate-Findings record in
  `governanceReviews/milestones/fe-doc-01-buyer-documents-hub/WORK-PACKAGE.md`).

## How to use this packet (Raise ≠ Accept)

Per CLAUDE.md §13, **the packet raises; the Board rules.** Each item carries frozen anchors, a
business driver, and a recommended disposition — the recommendations are not rulings. The Board
evaluates each against the four Validate-Findings questions (Valid? Applicable? Best for the
product? Consistent with the frozen corpus?), then rules; the registry/trackers are patched to
match, and any accepted item proceeds as a **human-approved additive corpus patch + version bump**
(§7/§8) on its named channel — never a local/UI resolution.

## Authority-order primer (§7) — why these are human-only

Every item 2a–2c reaches rank 0: the post-award document-kind set (`loi|po|challan|wcc` +
`trade_invoices`/`payment_records` as separate aggregates) and the template format enum (fixed
five `challan|bill|letterhead|quotation|wcc` — **never extend locally**) are frozen in Doc-2
§10.5/Doc-4F §F5/§F7. Adding a kind, format, aggregate, or cross-module linkage is an additive
architecture patch — immutable to skills/AI (§8). Item 3 is Board-gated by the FE-SH promotion
lifecycle itself (all kit changes are Board-gated). Item 1 is a ratification record of decisions
the owner already made — recorded so the mint has a durable Board artifact.

## Summary table

| # | Item | Recommended disposition | Unblocks / affects |
|---|---|---|---|
| 1 | Ratify the FE-DOC mint + topology (P-DOC-01..06; one-ID-two-mounts; shared documents home; nav entries) | **Ratify as executed** — owner decisions 1–3 recorded 2026-07-03; additive; coverage 150/150 green; FE-VEN-10 Option-B precedent | Durable record; nothing pending |
| 2a | `ESC-OPS-DOC-MUSHOK` — Bangladesh-statutory VAT documents (Mushok) unmodeled | **Accept as PRIORITY additive-patch candidate** (Doc-2 §2/§10.5 + Doc-4F §F5/§F7) — statutory for the home market | Mushok category in FE-DOC + M4 generation/records |
| 2b | `ESC-OPS-DOC-KINDS` — credit/debit notes · packing lists · sales orders · contracts | **Split:** credit/debit → BC-OPS-5 Finance-Records owner analysis (accept-candidate) · packing list → additive-kind candidate · **sales order → recommend DECLINE** (overlaps PO/engagement semantics) · **contracts → recommend DECLINE pending business case** (engagement formation is event-driven; LOI exists) | Taxonomy completeness for Bangladesh trade flows |
| 2c | `ESC-OPS-DOC-FEATURES` — digital signatures · expiry reminders · document favorites/pinning · document tags · document↔project linkage | **Route per-feature:** signatures → Doc-4B/e-sign patch (defer until wiring era) · expiry reminders → M6 Doc-5H notification-rule channel · favorites/tags/project-linkage → owner-module analysis (defer; owner said tags "only if future corpus supports it") | Hub facets/affordances currently excluded stay excluded until ruled |
| 3 | FE-SH-01 `DataListTable` promotion → kit (generic base; documents `DocumentTable` wraps it) | **Approve with extraction before FE-DOC-02/03** — criteria met (≥2 surfaces: buyer shared + AdminQueueTable 19 consumers; RV-0013 + freeze-report cites; byte-equivalence plan = RV-0038 proof pattern). If deferred: documented fallback (buyer-side DataListTable + shared column-model spec; **no third copy is ever created**) | FE-DOC-02/03 list infrastructure; FE-CLN-03 scope shrinks |

## Full entries

### 1 — Mint ratification record

Owner decisions recorded 2026-07-03 (plan approval + 3 findings rounds): **(1) additive
composition** — FE-DOC mints new pages only; the 16 closed document detail pages
(FE-BUY-02/04/05/07 · FE-VEN-06/08 · FE-ACC-02) stay owned where they closed and are deep-linked,
never re-homed or duplicated; **(2) frozen kinds only** — absent kinds/features go to this packet,
never the UI; **(3) package then FE-DOC-01 build** into the normal Review A→B→Board flow.
Topology: P-DOC-01/02 per-workspace hubs; P-DOC-03..06 one-page-two-mounts (buyer `/documents/*`,
vendor `/workspace/documents/*` — A7-neutral) rendered byte-identical from
`app/(app)/_components/documents/`. Universe 144 → 150 (first expansion since cutover; script +
inventory + WBS updated atomically; per-ID check green). **LifecycleStrip constraint (MAJOR-01
adjudication): the strip is navigation, not state** — no surface may compute or render a
per-engagement "current stage"; the corpus has per-aggregate state machines and no global document
lifecycle.

### 2a — `ESC-OPS-DOC-MUSHOK` (PRIORITY)

**Gap.** Bangladesh VAT documents (Mushok forms — e.g. Mushok 6.3 tax challan) appear nowhere in
the corpus: no document kind, no template format, no finance-record subtype, no tax field. For an
Industrial Procurement OS whose home market is Bangladesh (CLAUDE.md §1), statutory VAT paperwork
accompanies real challan/invoice flows.
**Frozen anchors (verified).** Doc-2 §10.5 engagement-child set = `lois · purchase_orders ·
challans · trade_invoices · payment_records · work_completion_certificates` (no tax doc);
Doc-4F §F7.1 template format enum = `challan | bill | letterhead | quotation | wcc` (fixed five);
Doc-4F BC-OPS-5 `finance_records` is generic (no tax-specific schema). Grep across
`generatedDocs/`: zero hits for mushok/musak/VAT-document.
**Recommended disposition.** Accept as a **priority additive-patch candidate**: Doc-2 §2/§10.5
(new engagement-child kind or finance-record subtype — owner-module analysis decides which) +
Doc-4F §F5/§F7 (contracts + optional template format). Human Board; M4 owns.
**Interim (binding now).** No Mushok category/placeholder/slug anywhere in FE-DOC.

### 2b — `ESC-OPS-DOC-KINDS`

**Gap & analysis.** Credit/debit notes (invoice adjustments — closest owner: BC-OPS-5 finance
records or a `trade_invoices` child), packing lists (delivery children, adjacent to challans),
sales orders (buyer→vendor order confirmation — semantically overlaps the frozen `purchase_orders`
+ engagement formation), contracts/agreements (engagement formation is event-driven via
`RFQClosedWon`; `lois` exist).
**Recommended dispositions.** Credit/debit notes → **accept-candidate**, route to BC-OPS-5 owner
analysis (new kind vs finance-record subtype). Packing list → **accept-candidate** (additive kind
+ format-enum extension). Sales order → **recommend decline** (duplicates PO semantics; absence
looks intentional). Contracts → **recommend decline pending business case**.
**Interim.** None rendered; no placeholder categories.

### 2c — `ESC-OPS-DOC-FEATURES`

Digital signatures (no PKI/signature aggregate anywhere — a wiring-era, multi-module patch;
**defer**), expiry reminders (RFQ/quotation expiry exists via System timers, post-award docs have
none; channel = M6 Doc-5H notification rules + Doc-2 §10.5 expiry fields), document
favorites/pinning (M2 `catalog_favorites` is `product|category` only — a document analogue is a
new M4 concern), document tags (owner: "only if future corpus supports it"), document↔project
linkage (M2 owns projects; no frozen link from M4 documents — this is why the hub has no Project
facet).
**Interim.** No affordances rendered; reserved analytics names carry no schema claim.

### 3 — FE-SH-01 `DataListTable` promotion

**Ask.** Approve Candidate → Approved and extract to the kit **before FE-DOC-02/03**, so the
shared `DocumentTable` (documents column model: default sort `issued_at DESC`, cursor/25, 390px
column priority) wraps the promoted base instead of forking it.
**Criteria status.** ① ≥2 surfaces: buyer shared + admin (`AdminQueueTable`, 19 consumers) — met.
② ≥2 review cites: RV-0013 (canonical admin queue) + buyer freeze-report OBS — met. ③
Byte-equivalence plan: RV-0038 `EngagementDocumentFileCard` proof pattern per consumer — stated.
④ Board approval + `[ESC-7B-*]` registration — **this ask**.
**If deferred.** FE-DOC-01 uses the buyer-side `DataListTable` directly (same-surface reuse, zero
new duplication) with the shared column-model spec (`document-table-spec.ts`), making the later
swap mechanical; FE-DOC-02/03 compose semantic list rows from kit primitives — **a third table
copy is never created**. Documented in the FE-DOC-03 WP card at its kickoff.

## Decision record (Board fills)

| # | Ruling | Date | Notes |
|---|---|---|---|
| 1 | — | — | — |
| 2a | — | — | — |
| 2b | — | — | — |
| 2c | — | — | — |
| 3 | — | — | — |

**What ratification unlocks:** 2a/2b accepted items → corpus patches → FE-DOC taxonomy extensions
in a future milestone (never mid-build); 3 approved → FE-DOC-02/03 build on the promoted base and
FE-CLN-03's dedupe scope shrinks.

---

*Non-authoritative decision-prep. Conforms upward; coins nothing; on any conflict the frozen
document wins. Each item resolves only via its named channel — never locally.*
