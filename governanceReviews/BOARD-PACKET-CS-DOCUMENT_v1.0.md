# Board Packet — Comparative Statement (CS) Document Capabilities

**Status:** v1.0 — OPEN (intake registered 2026-07-06) · human Architecture Board · non-authoritative;
on any conflict the frozen corpus wins. Opening this intake implies **no acceptance** — each handle
remains unresolved until individually ratified (Raise ≠ Accept).
**Source ruling:** owner redefinition 2026-07-06 — the buyer comparison surface splits into the
interactive **Compare Workspace** (frozen-backed, building now) and the **Comparative Statement
(CS)** official procurement document (canonical standard frozen at
`docs/product/requirements/COMPARE_SHEET_UX_FREEZE_v0.1.md` §3, header v1.0).
**Companion records:** `COMPARE-SHEET-CS-REDEFINITION_v1.0.md` (sign-off + corpus verification) ·
`esc_registry.md` §"Comparative Statement (CS) Document (owner redefinition, 2026-07-06)".

**What ships WITHOUT any of these rulings (already owner-authorized, presentation-only under WP-1
rules):** the CS rendered as a fixed A4 print view over mock data at a temporary route, browser
print / print-to-PDF, printed signature blocks (wet ink), "Draft Reference" placeholder,
buyer-authored evaluative sections. Nothing below blocks that build.

---

## R1 · `ESC-CS-DOCKIND` — CS as a persisted pre-award document entity

**Gap:** the frozen post-award document set is exactly `loi | po | challan | wcc` (Doc-4F;
`trade_invoices`/`payment_records` separate aggregates); **no pre-award document kind exists**,
and the "Technical/Commercial Evaluation record" class is explicitly NOT modeled
(`rfq-workflow.md` §7). A persisted CS (immutable, numbered, auditable) is a new entity.
**Ownership question:** M3 owns the comparison statement (rfq schema); M4 owns document
generation/templates (BC-OPS-4). A generated pre-award document sits on that seam — the Board must
rule which module owns the CS entity and its canonical route.
**Binding ownership statement (owner-adjudicated MINOR-2):** *"The Comparative Statement is a
generated procurement document derived from the buyer's Workspace selection. It is not an
independent business entity until the Board approves ESC-CS-DOCKIND."*
**Also carried here (owner-adjudicated MAJOR-1/NIT-1):** the build route
`/rfqs/[rfqId]/comparative-statement` is mock-era only; the canonical CS document route is decided
WITH this ruling.

## R2 · `ESC-CS-REF` — official CS reference series

**Gap:** human-ref prefixes are a fixed Doc-2 §0.1 / Appendix B registry (ORG, RFQ, QTN, INV,
DOC); "a new prefix requires a Doc-4A patch (Governance Note rule 5) — never invented here"
(Doc-4B:525). A `CS-2026-NNNNNN` series is a new coin.
**Interim (owner-adjudicated MAJOR-2/MINOR-1, binding):** the UI renders **"Draft Reference"**
(derived from the RFQ ref, marked *pending governance*); no `CS-` string exists anywhere in code,
mocks, or examples. "Draft Reference" is a temporary mock-era label, not a business term — it
transitions automatically to the official reference on approval (single swappable view-model
field).
**Ask:** additive Doc-4A prefix patch registering the CS series (sequenced with/after R1 — a
reference series presupposes the entity).

## R3 · `ESC-CS-EXPORT` — platform PDF/Excel export generation

**Gap:** "comparison Excel/PDF export + digital signatures" are explicitly NOT modeled
(`rfq-workflow.md` §7 — the standing ESC-OPS-DOC-* class); frozen doc-gen (BC-OPS-4) covers M4
engagement documents over the fixed five-format template enum only.
**Interim:** browser print / print-to-PDF (user-agent capability, ships now); the Excel affordance
is an honest gated stub. The frozen CS standard (§3.3) requires all exports to preserve the fixed
pagination once the capability lands.
**Ask:** additive patch for CS document generation/export (channel likely M4 BC-OPS-4 extension or
a new M3 read-side renderer — decide with R1 ownership).

## R4 · `ESC-CS-LINEITEMS` — structured line items (dev-doc track, lighter)

**Gap:** the CS item table needs per-item structure (description, specification, unit, quantity,
per-vendor unit price; brand/origin optional) — but RFQ `content_jsonb` and quotation
`price_breakdown_jsonb` are opaque, and their **internal schemas are explicitly dev-doc scope**
(Doc-4E PassB-Part4:30/53: "internal price/terms schema is dev-doc").
**Consequence:** this is a **dev-doc schema ratification, not a frozen-corpus patch** — the only
handle in this packet with a non-Board channel. It should still be ratified deliberately (one
line-item schema serving RFQ authoring, quotation submit, the Workspace, and the CS).
**Interim:** CS presentation renders mock line items; real data waits on the schema.

## R5 · `ESC-CS-LETTERHEAD` — buyer letterhead/branding asset

**Gap:** the buyer organization profile has no logo/letterhead/branding fields
(`identity.buyer_profiles` — Doc-2:724); branding assets are vendor-only
(`marketplace.branding_assets`); "letterhead" exists only as an M4 document-template format with
org-scoped `brand_binding_jsonb` (Doc-2:785–786).
**Options sketch:** (a) small additive M1/M2 buyer-branding patch; (b) reuse the M4 org-scoped
letterhead template via contracts at render time. Decide with R1/R3.
**Interim:** the CS renders a mock letterhead; real buyer letterhead waits on the ruling.

---

## Sequencing note

R1 (entity + ownership + canonical route) is the keystone — R2/R3/R5 naturally sequence after it;
R4 can proceed independently on the dev-doc track. None of the five blocks the presentation-only
WP-2 build.

## Decision record

| Ruling | Decision | Date | By |
|---|---|---|---|
| R1 `ESC-CS-DOCKIND` | — | — | — |
| R2 `ESC-CS-REF` | — | — | — |
| R3 `ESC-CS-EXPORT` | — | — | — |
| R4 `ESC-CS-LINEITEMS` | — | — | — |
| R5 `ESC-CS-LETTERHEAD` | — | — | — |
