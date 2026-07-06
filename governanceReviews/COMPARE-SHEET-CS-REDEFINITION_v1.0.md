# Compare Sheet → Compare Workspace + Comparative Statement (CS) — Redefinition & Sign-off Record

**Status:** v1.0 — COMPLETE (owner-ruled + Visual-Approved 2026-07-06) · non-authoritative record;
on any conflict the frozen corpus wins.
**Subject:** `docs/product/requirements/COMPARE_SHEET_UX_FREEZE_v0.1.md` (header version of record:
**v1.0 — FROZEN (product)**).
**Chain:** owner instruction "Review and sign off D2–D7" → verification review → owner
**redefinition ruling** (two-concept split + CS Document Standard) → plan adjudication
(3 MAJOR · 2 MINOR · 2 NIT, all adopted) → **Visual Approval** → freeze. WP-2 un-gated.

---

## 1. What happened (sequence, 2026-07-06)

1. **D2–D7 verification review ran first** (three Explore sweeps, verbatim-anchored against
   `generatedDocs/` + code). All D2–D7 citation anchors verified (see §3) — two gating findings
   and one wording defect surfaced (§2).
2. Before adjudication completed, the **owner issued the redefinition ruling**: the Compare Sheet
   splits into the interactive **Compare Workspace** and the official **Comparative Statement
   (CS)** procurement document (written CS Document Standard + visual reference supplied; written
   standard wins). All D2–D7 re-evaluated against the CS.
3. The implementation plan was reviewed by the owner across three rounds — **every finding
   adopted** (MAJOR-1 temporary route · MAJOR-2 no implied CS numbering / "Draft Reference" ·
   MAJOR-3 "Buyer Evaluation Summary" not "Vendor Ranking" · MINOR-1 placeholder-not-business-term
   · MINOR-2 ownership statement · NIT-1 route-header sentence · NIT-2 Visual Approval gate).
4. **Visual Approval checkpoint** (NIT-2): high-fidelity A4 previews produced before any code;
   owner adjudicated small print margins + content-driven pagination + larger type scale, then
   **approved** the layout.
5. The decision record was rewritten in place to **v1.0 — FROZEN (product)** (it was a v0.1
   DRAFT — not a frozen document; the freeze IS the sign-off the draft was waiting for).

## 2. Original D2–D7 review findings and how they resolved

| # | Severity | Finding | Resolution |
|---|---|---|---|
| F-1 | MAJOR | **D4 row-set misattribution** — D4 claimed its six rows ARE "the statement's disclosed fields," but Doc-3 §9.1 discloses price/delivery/validity/warranty/spec-compliance **plus vendor standing + buyer-private columns**; "attachments count" has no frozen backing as a statement field (it is a presentation aggregate) | **W-4 reword**: "presentation SUBSET of the Doc-3 §9.1 statement"; vendor-standing + buyer-private columns recorded as an explicit owner-ruled deferral; attachments count disclosed as a presentation aggregate. CLOSED |
| F-2 | MAJOR | **D3 vs frozen journey** — D3's "never re-sorted (GI-04)" contradicted frozen `buyer_journey_v1.0.md` row 09 ("buyer-chosen sort") AND over-cited GI-04 (which forbids re-ranking governed M3 matching, not presentation sort); Doc-3 §9.1 itself says "Sorting default: buyer-chosen" | **W-3 amendment**: buyer-chosen presentation sort ALLOWED (default = System order; no rank/recommend cue ever, R6). The redefinition made this natural — the Workspace is explicitly the interactive sort/filter surface. No journey erratum needed — the freeze now CONFORMS to the frozen journey. CLOSED |
| F-3 | MINOR | **D2↔D6 wording tension** — CTA visible at ≥1 disclosed quotation vs "the compare affordance is hidden" at exactly 1 | **W-6 wording fix**: "the side-by-side selection controls are hidden"; the CTA/route stay reachable (the frozen first-open transition must remain drivable). CLOSED |
| F-4 | OBS | Byte-identical not-found is realized as an in-view `EmptyState` (comparison-view.tsx), not framework `notFound()` — semantically equivalent; WP-1 LOI used `notFound()` | Recorded; mechanism note only, non-gating |
| F-5 | OBS | Kit row model includes a `status` row D4's list omitted (superset) | Folded into the W-4 row list. CLOSED |
| F-6 | OBS | `rfq-workflow.md` (D7's §7/§9 anchor) is self-declared NON-authoritative | Provenance noted; the exclusion is corroborated by corpus absence (grep-verified). Non-gating |
| F-7 | OBS | D2 entry point #1 ("Compare quotations" CTA) does not exist yet — `quotations-tab.tsx:17-18` explicitly deferred it | Net-new WP-2 scope, as intended |

**Gate after adjudication: 0 BLOCKER · 0 MAJOR · 0 MINOR outstanding** (F-1/F-2/F-3 resolved by
the v1.0 amendments; OBS non-gating).

## 3. Verification anchors (all confirmed verbatim in-source)

- Doc-4E §E8.6 (PassB-Part5:334): first buyer open drives `quotations_received → buyer_reviewing`
  in the same transaction as the comparison read; `:346` no-access ≡ not-found; `:318` request =
  `rfq_id` + optional `version_no` (single-RFQ — no cross-RFQ comparison read exists anywhere).
- Doc-3 §9.1 (:601–602): statement rows incl. vendor standing + buyer-private columns; "Sorting
  default: buyer-chosen"; **FIXED: the platform never auto-recommends a winner pre-award**.
- Doc-5E R6 (:28): no auto-recommend / auto-select / auto-rank-to-winner / recommendation endpoint.
- Doc-3 §10.1 (:634, POLICY `abuse.sealed_until_close` :776): sealed-until-close is a per-cell
  server POLICY.
- `rfq-workflow.md` §7 (:250–252) / §9 (:284–285): comparison Excel/PDF export + digital
  signatures explicitly NOT modeled (Board-gated ESC-OPS-DOC-* class).
- Comparison count: no frozen doc caps or mandates a side-by-side count (nearest numbers govern
  shortlist max / routing floor — different concepts). Min-2/max-5 contradicts nothing.
- Code reality: journey-strip deep-link live (`journey.ts:98–107`); `/quotations/compare` scaffold
  (`ImplementationPendingView`); award wizard native-GET `?sel=` (`award-view.tsx:216,113`);
  kit `ComparisonSummary`/`ComparisonTable` + `COMPARISON_ATTRIBUTES` row model exist
  (`src/frontend/components/comparison/`).

## 4. CS-vs-frozen-corpus routing (why the intake handles exist)

Corpus sweep verdict: the CS as specified is predominantly **net-new** — no pre-award document
kind (frozen set = LOI/PO/challan/WCC; Doc-4F), no `CS-` prefix (registry = ORG/RFQ/QTN/INV/DOC;
new prefix = Doc-4A patch, Doc-4B:525), no platform PDF/Excel export, no signature capture
anywhere (`can_approve_po` is PO-only), no buyer letterhead/branding (vendor-only; "letterhead"
exists only as an M4 template format), no structured line items (RFQ `content_jsonb` + quotation
`price_breakdown_jsonb` are opaque — **internal schemas explicitly dev-doc scope**, Doc-4E
PassB-Part4:30/53, which is the lawful landing zone for `ESC-CS-LINEITEMS` without a corpus
patch). R6's prohibition is **platform-scoped** — buyer-authored evaluative content on a
buyer-owned document is outside it; hence the binding provenance rule (freeze §4.1) and the five
handles `ESC-CS-DOCKIND` / `ESC-CS-REF` / `ESC-CS-EXPORT` / `ESC-CS-LINEITEMS` /
`ESC-CS-LETTERHEAD` (registered in `esc_registry.md`; packet
`BOARD-PACKET-CS-DOCUMENT_v1.0.md`). Interim: presentation-only build under WP-1 rules; browser
print/print-to-PDF only; Excel = honest gated stub; printed signature blocks (wet ink);
"Draft Reference" until ESC-CS-REF.

## 5. Sign-off

- **Product freeze:** v1.0 — FROZEN (product), owner-ruled 2026-07-06. Gate 0/0/0.
- **Visual Approval:** owner "approved" 2026-07-06 after three adjudication rounds (landscape A4;
  small print margins; content-driven pagination; enlarged type scale).
- **WP-2 un-gated** for Team-2 under WP-1 rules (mock adapters, no backend, no new states).
- Board items opened, **nothing accepted by registration** — each handle unresolved until
  individually ratified (Raise ≠ Accept).
