# Category Taxonomy Decision Record — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion (decision record for **Taxonomy Content
v1.0**; not an ADR — it records *content* decisions under the frozen mechanism, per Authority Order §7).
**Date:** 2026-07-02 · **Home:** `productSpec/` · **Companions:** `CATEGORY_TAXONOMY_REVIEW.md` ·
`CATEGORY_MIGRATION_PLAN.md` · `CATEGORY_GOVERNANCE_MODEL.md` · `CATEGORY_ATTRIBUTE_FRAMEWORK.md`.

**Purpose.** Six months from now, someone will propose "just add an SS Valves category" or "split
services back into each domain branch". This record exists so that undoing a deliberate decision is a
conscious act with the original trade-offs on the table — not an accident.

---

## 1. What was decided

Adopt **Taxonomy Content v1.0**: 794 nodes (13 roots · 87 L2 · 354 L3 · 340 L4) replacing the
organically grown 1,078-node spreadsheet, with a full 751-row leaf mapping, a governance model, an
attribute framework, and a synonym starter set. Board-amended plan (two review rounds) executed
2026-07-02; adoption gated on the acceptance criteria in the review §13.

---

## 2. Alternatives considered and rejected

| Alternative | Why rejected |
|---|---|
| **Repair in place** (fix duplicates inside the existing shape) | The failures are structural (quadruplicated MRO L1, services woven through every branch, attribute-splits). Partial repair leaves duplicate concepts forever — the Board's own reasoning for mandating full re-map. Cost of replacement is at its lifetime minimum: zero live data |
| **Industry-first tree** (Textile → machines/spares/chemicals per industry) | Forks every cross-industry family (bearings ×10 industries); collides head-on with the separate Industry axis already ruled in ADR-023; vendor self-classification explodes against the ≤10 cap |
| **Function-first flat + facets** (shallow 2-level tree, everything else facets — the pure-search model) | Underserves gate A2 (matching needs precise nodes), the 4-column Explorer UX (`ux_patterns.md` §3.2), and SEO landing pages; assumes a search maturity (attribute mechanism, synonym layer) that is NET-NEW and unratified |
| **Deeper tree (5 levels)** for material/duty variants | **Architecturally impossible** — `level CHECK 1–4` is frozen (Doc-2 §10.3, Doc-6D §3.2). Also bad IA: level 5 candidates were all attributes. Ruled: never simulate L5 with attribute-named nodes |
| **Keep services embedded per domain** (Boiler EPC under Boilers) | Violates product/service separation (Board C7); makes service vendors burn assignment slots ×8; duplicates AMC/installation verbatim across branches. Mitigation for the lost locality: domain-specific service leaves (fire EPC ≠ boiler EPC) keep A2 targeting sharp |
| **Merge machine tools back into Production Machinery** | BD light-engineering is a distinct buyer/vendor world; burying lathes at L3 under process machinery failed the buyer mental model and starved the segment of an L1 identity |
| **12-or-fewer roots** (fold Quality into Automation, or Machine Tools into Machinery) | Each fold traded a real buyer domain for cosmetic root-count; 13 renders fine in the Explorer's first column |
| **Exhaustive synonym dictionary in v1.0** | High fabrication risk on obscure terms; starter-set + governed growth chosen instead (owner-selected option) |

---

## 3. Major design decisions (cross-referenced to Board findings)

| Decision | Rationale | Board ref |
|---|---|---|
| One home per product family; ~31 duplicate families consolidated | Gate A2 needs one obvious node; vendor liquidity concentrates; SEO stops self-cannibalizing | C6, M-01 |
| Services extracted to a single root with **domain-specific leaves** | Separation without losing matching precision — `fire-protection-epc` is a different vendor pool than `boiler-thermal-epc` | C7, C8 |
| Node-admission ladder (category / family / application / material) | The anti-sprawl mechanism; material & sourcing & urgency demoted to attributes (4 ATTRIBUTE dispositions, 3 attribute-split clusters collapsed) | C4, C5 |
| Attributes as a required companion framework, not an afterthought | With depth frozen at 4 and zero headroom already used, attributes are the only lawful specificity valve | C5, F-9 |
| Taxonomy ≠ Search ≠ Aliases ≠ AI (four independent systems) | Most taxonomy decay = one system doing another's job; codified in review §8b and governance | C3 |
| Cross-industry rule; only Industry-Specific *Machinery* (and its spares mirror) may be industry-shaped | Machines are industry-defined products (a tablet press *is* pharma); everything else uses the Industry axis | C6 |
| Stable Taxonomy Principle + governance-gated node additions | Trees rot by accretion; growth defaults to attributes/synonyms | M-02 |
| Slug immutability-after-publish as **policy** (mechanism allows mutation) | Slugs are URLs/SEO/import keys; policy layered on frozen mechanism, honestly labeled | m-01 |
| Lifecycle documented as 6-step *process* over the frozen 3-state machine; "Deprecate" = operational convention | No state may be coined; a true `deprecated` state would be a Board-level corpus patch (Flag-and-Halt) | C2 |
| ~25 missing families added (valves/pipes/fittings, PPE expansion, instrumentation, pallets, hoists, AGV/AMR, CMM) | Collectively-exhaustive principle; valves/pipes are among the highest-volume BD industrial purchases and had **no home at all** | F-5 |
| TMT rebar left as synonym on `ms-sections` (v1.1 node candidate) | Tree stability over completeness at the margin; demand data will decide | M-02 |
| KPI definitions product-level; instrumentation pointed to owning modules | No invented budgets; numbers owned where measured | C10 |
| AI extraction documented as suggest-only pipeline | Invariant #12; M9 reserved; buyer confirms everything | C9 |

---

## 4. Known tensions accepted (with eyes open)

- **Fabric families are not orthogonal** (greige = finish state; woven/knitted = construction; denim =
  market family). Kept all four as leaves because the *market* browses them as families; purity lost,
  buyer language won. Revisit only with search-log evidence.
- **Membrane systems appear twice by duty** (process liquid filtration vs utility water treatment
  RO/UF). These are genuinely different procurement events with different vendors; the duty split is
  positional, not a duplicate concept. Documented so nobody "fixes" it into a false merge.
- **Robotic welding cells sit with welding, robotic palletizers with packaging** — application-first
  homes for application-locked robots; general-purpose robots live in Automation. The alternative
  (all robots in one place) scored worse on buyer intent.
- **Grouped judgment calls from the mapping pass** (flagged by mapping agents, accepted as-is):
  sealants portion of SRC-652 absorbed by `industrial-adhesives`+`tapes-films-strapping`; block-13
  "Gaskets, O-Rings, Gland Packings" merged whole into `gaskets-packings`; gear motors treated as an
  `electric-motors` attribute. Each is recorded in Appendix B reasons.

---

## 5. Future extension strategy

1. **New markets** (South Asia → global): add per-market synonym sets; roots and L2s stay put.
   Country-specific product families (if truly local) enter as governance-gated L3/L4 under existing
   roots.
2. **New segments**: parking list first (review §12 — rebar, weighing systems, refrigeration, marine),
   quarterly demand evidence second, node third.
3. **Attribute mechanism** (`ESC-CLASS-ATTR`) unlocks structured RFQ specs, faceted browse, and
   attribute-value SEO pages — the intended absorber of all future "we need a sub-category" pressure.
4. **Alias mechanism** (`ESC-CLASS-ALIAS`) unlocks colloquial search and safe future restructuring
   (retired slugs redirect).
5. **Never**: a 5th level (frozen), brand nodes, paid placement in taxonomy, industry-forked product
   families, search-term-driven node creation.

---

## 6. Provenance

- Source: owner-provided Excel export (tableConvert), 2026-07 — normalized to 751 leaves / 1,078 nodes
  (migration plan Appendix A).
- Process: plan drafted → Architecture Board review round 1 (APPROVED WITH MINOR AMENDMENTS, findings
  C1–C10 + two added deliverables) → round 2 (M-01/M-02/m-01/m-02/m-03 + NIT rename + this document
  added) → all findings adjudicated through the §13 Validate-Findings gate (dispositions in the
  execution plan) → executed 2026-07-02 with machine-verified tree/mapping integrity.
- Verification record: migration plan §5. Human walkthroughs pending (P1 entry condition).
