# Compare Workspace & Comparative Statement (CS) — Product Decision Record

| | |
| --- | --- |
| **Document** | `docs/product/requirements/COMPARE_SHEET_UX_FREEZE_v0.1.md` — filename retains `v0.1` for pointer stability (the frozen `buyer_journey_v1.0.md` cites it); **the version of record is this header.** |
| **Version / status** | **v1.0 — FROZEN (product)** · owner-ruled 2026-07-06 (redefinition ruling + D2–D7 disposition + plan adjudication + Visual Approval, all same day). Supersedes the v0.1 DRAFT in place. |
| **Scope** | The buyer comparison surfaces for one RFQ (P-BUY-15 family): the interactive **Compare Workspace** and the **Comparative Statement (CS)** document. Presentation/product decisions ONLY. Nothing here touches the frozen `get_comparison_statement` contract, the RFQ machine, or module ownership. |
| **Frozen constraints this record operates UNDER (by pointer)** | Comparison statement is System-generated, read-only decision support; the platform **never re-ranks to a winner, never recommends** (Doc-5E R6 / Doc-3 §9.1 FIXED). Sorting default is **buyer-chosen** (Doc-3 §9.1). First open drives `quotations_received → buyer_reviewing` server-side (Doc-4E §E8.6). Sealed-until-close redaction is server POLICY (Doc-3 §10.1). Export/signatures are **not frozen capabilities** (`rfq-workflow.md` §7/§9). Unknown/undisclosed id → byte-identical not-found (Inv #11 / GI-12 / Doc-4E §E8.6 "no-access ≡ not-found"). |
| **Change control** | Frozen (product). Any later change = additive amendment + version bump via Board intake — never an in-place edit. |

---

## 1. The Two-Concept Split (owner ruling, 2026-07-06)

The owner redefined the former single "Compare Sheet" into **two separate concepts**. This
supersedes all previous assumptions about the Compare Sheet:

1. **Compare Workspace** — the interactive buyer UI at `/rfqs/[rfqId]/compare` (P-BUY-15).
   Supports sorting, filtering, and analysis over the System-generated comparison statement.
2. **Comparative Statement (CS)** — the official procurement document: a printable A4 report used
   for management approval, audit, PDF, Excel, and signatures. Layout is fixed and deterministic.

**Ownership statement (binding, owner-adjudicated MINOR-2):** *"The Comparative Statement is a
generated procurement document derived from the buyer's Workspace selection. It is not an
independent business entity until the Board approves ESC-CS-DOCKIND."*

All former D2–D7 decisions are re-evaluated against this split — the Workspace decisions in §2,
the CS standard in §3, the disposition table in §5.

---

## 2. Compare Workspace — decisions (RULED)

### W-1 · Comparison count *(carries D1 — owner-ruled 2026-07-06, unchanged)*

**Side-by-side comparison: minimum 2, maximum 5 quotations.** Owner rationale: industrial buyers
rarely evaluate more than 3–5 serious quotations. **Conformance note (load-bearing):** the cap is
a **presentation column-selection** over the System-generated statement — the statement itself
remains the full disclosed set; the comparison read exists from the first quotation and its first
open precedes shortlisting; `shortlist_quotation` remains the FORMAL narrowing mechanic. The
selection is ephemeral UI state; never persisted, never sent to a contract, never implies
preference to any vendor. **This same selection (2–5 vendors) is the vendor set of a generated
CS** (§3) — one selection concept, two renderings.

### W-2 · Entry points *(carries D2, + the CS affordance)*

1. **RFQ detail → Quotations tab** — primary CTA "Compare quotations" (visible when ≥ 1 disclosed
   quotation exists; at exactly 1 it opens the single-column statement view per W-6).
2. **Journey strip** — the "Comparison & evaluation" stage pill deep-links to
   `/rfqs/[rfqId]/compare` (already live).
3. **Direct route** — `/rfqs/[rfqId]/compare` (bookmarkable; unknown/undisclosed id →
   byte-identical not-found).
4. **Comparative Statement** — generated FROM the Workspace: a "Comparative Statement" affordance
   over the current 2–5 selection (§3; temporary route per §4.3).

**Explicitly NOT an entry point:** the reserved cross-RFQ `/quotations/compare` route **stays a
scaffold** — no cross-RFQ comparison read exists in the frozen corpus; introducing one is a Board
intake item, not a UX decision.

### W-3 · Selection & sorting *(amends D3)*

- Checkbox per supplier; selection carried in the URL query via native GET navigation (no client
  state store, consistent with the award wizard's `?sel=` pattern).
- **No default selection** and no "suggested picks" — any pre-selection would be a platform
  recommendation (R6).
- Min 2 to enter side-by-side view; at 5 selected, further checkboxes disable with a plain note
  ("Compare up to 5 at a time").
- **Buyer-chosen presentation sort is ALLOWED** (amendment): Doc-3 §9.1 says "Sorting default:
  buyer-chosen" and the frozen `buyer_journey_v1.0.md` row 09 records "buyer-chosen sort." The
  v0.1 draft's "never re-sorted (GI-04)" over-cited GI-04 — GI-04 forbids re-ranking **governed M3
  matching**, not presentation sort. Default order = the System-supplied statement order; a buyer
  may re-sort as presentation; **no sort ever produces a rank/recommend cue** (R6). *(The shipped
  Workspace surface renders System order only today — adding the sort control is Workspace
  follow-on scope, not required by this freeze.)*

### W-4 · Desktop behavior *(amends D4 — row-set wording corrected)*

Side-by-side column matrix (the existing kit `ComparisonSummary` + `ComparisonTable`), up to 5
columns. Row set = **a presentation SUBSET of the Doc-3 §9.1 statement**: status, price, delivery,
warranty, validity, spec-compliance, attachments count (a presentation aggregate of disclosed
data, not a frozen statement field). **Explicit deferral (owner-ruled):** the frozen statement's
vendor-standing bands (trust band, performance badge, verification depth, tier — Doc-3 §9.1) and
buyer-private columns (own status/notes — Doc-4E §E8.6) are NOT rendered in this milestone; adding
them is a later work package, recorded here so the omission is a decision, not a misstatement.
Sealed cells render the sealed explanation, never a blank that reads as "no price." Wide content
scrolls inside the table container, never the page.

### W-5 · Mobile behavior *(carries D5)*

Selected suppliers render as **stacked cards** in the current order (same disclosed rows per
card); the side-by-side matrix is a desktop/tablet affordance. No horizontal page scroll; a matrix
on small screens scrolls inside its own container. *(The CS document is exempt — it is a fixed A4
document with no responsive layout, §3.)*

### W-6 · Empty & degenerate states *(carries D6 — wording fixed)*

- **No statement yet** (pre-first-quotation): genuine absence — the honest "awaiting responses"
  empty; nothing fabricated.
- **Exactly 1 disclosed quotation:** single-column statement view; **the side-by-side selection
  controls are hidden** (W-1 minimum not met) — the surface never fakes a second column. The
  route stays reachable (the frozen first-open transition must remain drivable).
- **Unknown / undisclosed RFQ id:** byte-identical not-found (Inv #11 / GI-12).
- **CS generation:** available only when a valid 2–5 selection exists; otherwise the affordance
  states the requirement plainly.

---

## 3. Comparative Statement (CS) — Document Standard (CANONICAL)

Owner-authored 2026-07-06; canonical for iVendorz and **reused across all RFQs**. The written
standard wins over any visual reference on conflict. Visual layout approved by the owner
2026-07-06 (Visual Approval checkpoint, §4.4).

### 3.1 General rules

- Treat the CS as an **enterprise procurement document**, not a spreadsheet.
- Printable on **A4** paper (landscape adopted at Visual Approval — five vendor unit/total column
  pairs; print margins small).
- Professional corporate procurement document; buyer company letterhead at the top of every page
  (full letterhead page 1; slim letterhead variant in the repeating header thereafter).
- Automatic page numbering; repeating document header on every page.
- Optimized for both PDF and printing. Clean white background with minimal corporate blue accents.
- No dashboard-style cards. No responsive/mobile layout inside the printable document.
- Layout style: corporate ERP document (SAP / Oracle Procurement / Dynamics / industrial tender
  comparative statements). Readability, printability, professionalism over aesthetics.

### 3.2 Document structure

**Page 1 — Executive Summary:** buyer company letterhead · document title ·
**Draft Reference** (§4.2) · RFQ number · RFQ title · buyer · project · issue date · currency ·
participating vendors · executive summary (buyer-authored) · commercial summary · approval
signature block. This page does not contain the complete item comparison.

**Page 2 onwards — Item Comparison:** the comparison table. Columns: Sl · Item Description ·
Specification · Unit · Quantity; per vendor: Unit Price · Total Price (Delivery / Brand / Origin /
Remarks optional where they fit). Highlight the **lowest price** (arithmetic identification,
disclosed as such — never presented as a recommendation). Approximately **15–20 items per page**;
repeat the table header on every page; **never reduce font size to fit** — pagination is
content-driven (owner ruling at Visual Approval: page count decreases/increases as required, page
numbering follows).

**Final page:** commercial comparison summary · technical evaluation summary ·
**Buyer Evaluation Summary** (§4.2 — never "Vendor Ranking") · recommendation · remarks ·
procurement committee approval · signature blocks.

### 3.3 Export requirements

The same fixed layout serves **PDF export, print, and Excel print view**, all preserving
pagination. **Capability routing (binding):** browser print / print-to-PDF is a user-agent feature
and ships now; platform-side PDF/Excel export generation is **not a frozen capability**
(`rfq-workflow.md` §7) and enters through Board intake (`ESC-CS-EXPORT`) — until then the Excel
affordance is an honest gated stub, never a fabricated capability.

### 3.4 Signatures

The CS renders **printed signature blocks** (Prepared / Checked / Recommended / Approved — names,
titles, dates). Signing is executed on the printed document (wet ink). **The platform captures no
digital signatures** — signature capture does not exist in the frozen corpus; introducing it is
Board intake (`ESC-CS-DOCKIND` / ops-doc features class).

---

## 4. Conformance & governance routing (binding)

### 4.1 Provenance rule — R6 is Rank 0

Everything **evaluative** on the CS — Recommended Vendor, Reason for Recommendation, the Buyer
Evaluation Summary order, Risk Assessment, Remarks, the executive summary narrative — is
**buyer-authored/confirmed, never system-generated** (Doc-3 §9.1 FIXED: "the platform never
auto-recommends a winner pre-award"; Doc-5E R6: no auto-rank-to-winner, no recommendation
endpoint). The system computes **arithmetic facts only**: line totals, subtotals, VAT, grand
totals, differences, lowest-price identification, delivery min/avg/max. Every evaluative section
carries a visible buyer-authored provenance mark.

### 4.2 Adjudicated findings (owner, 2026-07-06 — all adopted, binding)

| # | Finding | Resolution |
|---|---|---|
| MAJOR-1 | Route is temporary | `/rfqs/[rfqId]/comparative-statement` is **mock-era only**; the CS is a generated procurement document, not an RFQ sub-view. Canonical route **TBD under `ESC-CS-DOCKIND`**. The route file header carries the NIT-1 sentence verbatim. |
| MAJOR-2 | No implied CS numbering | No `CS-YYYY-NNNNNN` reference anywhere (code, mocks, examples) until `ESC-CS-REF` (Doc-4A prefix patch) is approved. The document renders **"Draft Reference"** derived from the RFQ ref, marked *pending governance*. |
| MAJOR-3 | Governance-neutral label | The final-page section is titled **"Buyer Evaluation Summary"** — never "Vendor Ranking." All evaluative labels use neutral, buyer-provenance naming. |
| MINOR-1 | Placeholder ≠ business term | "Draft Reference" is a **temporary mock-era label only**; it must automatically transition to the official reference once `ESC-CS-REF` is approved (single swappable view-model field; no layout change). |
| MINOR-2 | Ownership clarity | The §1 ownership statement, verbatim, also carried on the `ESC-CS-DOCKIND` handle. |
| NIT-1 | Future route note | Route header sentence: *"This route exists only for the mock-era implementation and will migrate to the canonical Comparative Statement document route after ESC-CS-DOCKIND approval."* |
| NIT-2 | Visual approval checkpoint | High-fidelity A4 previews approved BEFORE implementation (§4.4). |

### 4.3 Intake handles (registered in `esc_registry.md`; packet `governanceReviews/BOARD-PACKET-CS-DOCUMENT_v1.0.md`)

| Handle | Gap | Channel |
|---|---|---|
| `ESC-CS-DOCKIND` | CS as a persisted pre-award document entity (+ canonical route, M3/M4 ownership) — no pre-award document kind exists (frozen set = LOI/PO/challan/WCC) | Human Architecture Board |
| `ESC-CS-REF` | `CS-` human-ref series — registry is ORG/RFQ/QTN/INV/DOC; a new prefix requires a Doc-4A patch | Doc-4A patch (Board) |
| `ESC-CS-EXPORT` | Platform PDF/Excel export generation — explicitly NOT modeled (`rfq-workflow.md` §7; ESC-OPS-DOC-* class) | Board intake |
| `ESC-CS-LINEITEMS` | Structured line items (desc/spec/unit/qty/unit-price; brand/origin optional) — `price_breakdown_jsonb`/`content_jsonb` internal schemas are **dev-doc scope** (Doc-4E PassB-Part4), so this is a dev-doc schema, not a corpus patch | Dev-doc ratification |
| `ESC-CS-LETTERHEAD` | Buyer letterhead/branding asset — buyer profile has no branding fields (vendor-only); "letterhead" exists only as an M4 template format | Board intake |

### 4.4 Visual Approval record

Per NIT-2, high-fidelity A4 previews (Executive Summary page · Item Comparison pages · Final
Approval page; realistic 27-item, 5-vendor BDT sample; arithmetic computed live) were produced
before any implementation. Owner adjudication rounds: landscape orientation accepted; print
margins set small (8mm `@page`); pagination ruled content-driven (page count flexes with items,
computed page numbering); document type scale enlarged so an 18-item page fills the sheet.
**Owner approved the layout 2026-07-06** ("approved"). The approved previews are the binding
visual reference for the build; this written standard wins on conflict.

---

## 5. D2–D7 disposition table

| Old decision (v0.1 DRAFT) | Ruling under the two-concept split | Status |
|---|---|---|
| D1 min-2/max-5 side-by-side | Carried as **W-1**; the same selection is the CS vendor set | RULED (unchanged) |
| D2 entry points | Carried as **W-2** + the CS-generation affordance; cross-RFQ route stays scaffold | RULED (amended) |
| D3 selection, "never re-sorted" | **W-3**: selection carried; buyer presentation sort ALLOWED (fixes the GI-04 over-citation; conforms to Doc-3 §9.1 + frozen journey row 09); no rank/recommend cue ever | RULED (amended) |
| D4 desktop row set | **W-4**: reworded to "presentation subset of Doc-3 §9.1"; vendor-standing + buyer-private columns = explicit deferral | RULED (amended) |
| D5 mobile stacked cards | Carried as **W-5**; CS exempt (fixed A4 document) | RULED (unchanged) |
| D6 empty/degenerate states | Carried as **W-6**; "side-by-side selection controls hidden" wording fix; CS-generation precondition added | RULED (amended) |
| D7 no export UI | **SUPERSEDED**: export moves to the CS (§3.3) — browser print/print-to-PDF ships now; platform PDF/Excel via `ESC-CS-EXPORT`; signatures stay printed-only (§3.4) | RULED (superseded) |

---

## 6. Process

1. ✅ Owner redefinition ruling + CS Document Standard authored (2026-07-06).
2. ✅ Plan review adjudicated (3 MAJOR · 2 MINOR · 2 NIT — all adopted, §4.2).
3. ✅ Visual Approval passed (§4.4).
4. ✅ **This document is v1.0 — FROZEN (product).** WP-2 implementation un-gates for Team-2 under
   the WP-1 rules (mock adapters, no backend, no new states) against §2–§4.
5. Any later change = additive amendment + version bump via Board intake — frozen journey
   documents and this record are never edited in place.

Sign-off record: `governanceReviews/COMPARE-SHEET-CS-REDEFINITION_v1.0.md`.
