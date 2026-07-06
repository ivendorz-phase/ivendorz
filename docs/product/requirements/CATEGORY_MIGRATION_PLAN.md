# Category Migration Plan — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion; execution gated on Board approval of
`CATEGORY_TAXONOMY_REVIEW.md` (Taxonomy Content v1.0).
**Date:** 2026-07-02 · **Home:** `docs/product/requirements/` · **Companions:** `CATEGORY_TAXONOMY_REVIEW.md` ·
`CATEGORY_GOVERNANCE_MODEL.md` · `CATEGORY_ATTRIBUTE_FRAMEWORK.md` · `CATEGORY_TAXONOMY_DECISION_RECORD.md`.

**Scope reality check.** There is **no live category data to migrate**. The frozen mechanism exists
(`marketplace.categories`, `Doc-2 §10.3`) but seeding is admin-runtime (`Doc-6D §7`) and none has
happened; the only in-repo categories are presentation-only mocks
(`app/(app)/_components/admin/categories/categories-seed.ts` — untouched by this plan). "Migration"
therefore means: **source spreadsheet → approved Taxonomy Content v1.0 → governed seed → surface
activation** — a content adoption, not a data migration. This is the cheapest this work will ever be;
every quarter of delay adds real vendors and RFQs to any future re-mapping.

---

## 1. Phases

### P1 — Approve the content (human gate)
- Board/owner adjudicates `CATEGORY_TAXONOMY_REVIEW.md` under CLAUDE.md §13.
- **Entry condition:** the Taxonomy Acceptance Criteria checklist (review §13) — machine checks green
  (results in §5 below), human walkthroughs completed by the design/product team.
- Output: Taxonomy Content v1.0 ratified (or amended + re-verified). Nothing is seeded before this.

### P2 — Seed as governed data
- Seed the 794 nodes from Appendix C as `draft` rows (parent-before-child order; Appendix C is
  depth-ordered for exactly this), via the M8 admin surface or the admin import path (an `imports`
  presentation with a `categories` job type already exists; wiring is its own tracked work).
- Admin reviews and publishes `draft → active` via `marketplace.set_category_status.v1` — the frozen
  approval path; batch publication is still per-node state transitions (no new bulk contract coined).
- Identity policy applies from the first row (§3).
- Open decision flagged: category **human_ref prefix** (not materialized in the corpus — Board).

### P3 — Activate surfaces
- **Admin category editor** (P-ADM-08) wires `list_categories`/lifecycle contracts to real data;
  the presentation seed file retires *at wiring time* (not edited now).
- **Vendor self-classification** (M2 assignment flows) opens against active nodes (≤10/≤5 caps).
- **Public Category Explorer** (`ux_patterns.md` §3.2): **blocked on `[ESC-7-API-CATNAV]`** (no
  Public projection for `list_categories`). Interim per the ux-patterns register: render
  `search_catalog` facets only. The Explorer's 4-column design is ready for the 4-level tree the
  moment the projection patch lands.
- **RFQ category picker** (M3 intake) targets active nodes; L3 default grain per review §7.

### P4 — Language & SEO layer (escalation-gated)
- Synonym dictionary v0.1 (review §9) feeds the search projection once `ESC-CLASS-ALIAS` lands a
  mechanism; until then it can inform FTS synonym expansion at the search read-model level
  (disposable projection — no corpus impact).
- Category landing pages + slug-redirect handling: with `[ESC-7-API-CATNAV]` / Doc-5D public
  projection work.
- Attribute mechanism (`ESC-CLASS-ATTR`) per `CATEGORY_ATTRIBUTE_FRAMEWORK.md` — enables structured
  RFQ specs and facets.

---

## 2. Old → new mapping (the heart of this plan)

- **Appendix A** — normalized source inventory: 751 leaf rows (SRC-001…SRC-751) reconstructed from
  the Excel export, mojibake fixed, the flat-format block re-hierarchized, analyst notes preserved.
- **Appendix B** — full disposition table, one row per source leaf: 751/751 mapped, machine-verified.
  Dispositions: **MAP 380 · MERGE 235 · SERVICE 85 · SPLIT 46 · ATTRIBUTE 4 · RETIRE 1.**
  - *Intermediate source nodes* (10 L1 / 70 L2 / 247 L3 paths) are dispositioned **by derivation**:
    a container's disposition is the union of its leaves' targets (it dissolves when its leaves
    scatter, it renames when they move together). This rule + the leaf table = every source node
    mapped exactly once, with no hand-maintained second table to drift.
- **Appendix C** — Taxonomy Content v1.0 master table: 794 rows (slug · level · parent · name ·
  design note), depth-first, import-ready.

Reason codes appear per row; the headline duplicate clusters and their rulings are summarized in
`CATEGORY_TAXONOMY_REVIEW.md` §10.

---

## 3. Canonical identity & backward compatibility

| Element | Policy |
|---|---|
| **UUIDv7** | Minted once at P2 seed (M0 ID generation), immutable, never reused — frozen mechanism. No legacy IDs exist to preserve; ID stability *starts* here |
| **Slug** | From Appendix C; **immutable after publish as governance policy** (the frozen mechanism permits `update_category` slug changes; we reserve that for Board-level exceptions because slugs are URLs, SEO equity, and import keys). Slug change ⇒ mandatory alias + redirect |
| **human_ref** | Prefix undecided in the corpus — **open Board decision** (flagged; not blocking P2 if allocation follows the M0 §2.5 convention when ruled) |
| **Display name** | Freely renameable (id-preserving) under governance review |
| **Aliases** | Every source *concept* keeps a resolvable path: source-name → target-slug pairs derivable from Appendix B; mechanism = `ESC-CLASS-ALIAS` |
| **Future relocations** | Never mutate `parent_id`/`level` of an active node — successor-node + retire recipe (`CATEGORY_GOVERNANCE_MODEL.md` §4) |

Backward compatibility burden today is **zero** (no live URLs, assignments, or RFQs reference any
category). The redirect strategy exists for *future* structural releases, not for this adoption.

---

## 4. Risks & rollback

| Risk | Mitigation |
|---|---|
| Seeding before approval bakes in a wrong tree | P1 human gate is hard; P2 does not start until the review is ruled BLOCKER/MAJOR/MINOR = 0 |
| `retired` is terminal (no reopen) + IDs never reused → a mis-published node can't be "un-published" | Publish in reviewed batches (root-first, branch-by-branch); anything doubtful stays `draft` (drafts are invisible to public reads and A2). Rollback of a published mistake = retire + successor node — cheap now (no assignments), expensive later |
| Vendors self-classify onto a node later restructured | Deprecate-window process + re-assignment before retirement (`CATEGORY_GOVERNANCE_MODEL.md` §3/§5); avoid structural churn in the first two quarters — parking list over hotfixes |
| Public explorer blocked by missing projection while vendors already classify | Acceptable sequencing (vendor-side works without the public tree); track `[ESC-7-API-CATNAV]` |
| Synonym layer deferred → search misses colloquial terms → pressure to add junk nodes | Stable Taxonomy Principle + prioritize `ESC-CLASS-ALIAS`; zero-result search log feeds the quarterly synonym batch |
| Import tooling not yet wired | P2 fallback is manual admin seeding of L1/L2 first (87+13 nodes), deeper levels as tooling lands — the tree is valid at any prefix depth |

---

## 5. Verification record (machine checks — rerun before P2)

Automated checks executed against Appendices A/B/C (scripts in the working scratchpad; to be
committed alongside import tooling when P2 wiring happens):

- Source inventory: 751 leaf rows; 13 blocks; 10 distinct L1 names; every row fully pathed.
- Tree: 794 nodes; 13 roots; slugs unique + kebab-valid; every child level = parent level + 1; max
  depth 4; zero orphans.
- Mapping: 751/751 ids mapped exactly once; every target slug exists in the tree; all SPLIT rows ≥2
  targets; **every SERVICE-disposition target resolves under `industrial-services`** (product/service
  separation holds mechanically); 22 tree leaves have no source mapping — verified to be exactly the
  intended additions (valves ×5, pipes & fittings ×4, PPE ×2, instrumentation ×4, hoists, pallets,
  AGV/AMR, CMM, general-lab, servo-motion, shutdown-maintenance).
- Human items (review §13 checklist) remain **pending** and are P1 entry conditions.

---

## 6. Escalations registered by this package

| Code | What | Route |
|---|---|---|
| `ESC-CLASS-ALIAS` | Alias/synonym storage & serving mechanism (search expansion + slug redirects). Unmodeled in corpus; search-projection-adjacent | Track-1 style additive proposal to Board (M2 owner recommended) |
| `ESC-CLASS-ATTR` | Category attribute schema (typed per-category vocabularies feeding forms/filters/RFQ specs). Nearest EXISTS anchor: `spec_library_entries` | Track-1 style additive proposal (M2) |
| `[ESC-7-API-CATNAV]` | *Existing* — Public projection for `list_categories` (blocks public Explorer + landing pages) | Already registered (ux_patterns §12); this package adds a consumer |
| Category `human_ref` prefix | Not materialized in Doc-2 §0.1 | Board note at P2 |
| Category landing pages | SEO surface over categories (reference data → content surface) | With Doc-5D public-projection work |

All are **additive**; none reopens a frozen document; on any conflict discovered during ratification:
Flag-and-Halt (CLAUDE.md §11).

---

*Appendices A (source inventory, 751 rows), B (old→new mapping, 751 rows), C (Taxonomy Content v1.0
master table, 794 rows) follow — generated from the verified data files, not hand-transcribed.*

<!-- APPENDICES:GENERATED-BELOW -->

## Appendix A — Normalized source inventory (751 leaf rows)

Reconstructed from the 2026-07 Excel export. `block` = physical block in the export (the
quadruplicated MRO L1 spans blocks 10–13; block 13 was flat-format). Mojibake normalized;
analyst notes preserved verbatim.

| id | blk | L1 | L2 | L3 | L4 (leaf) | note |
|---|---|---|---|---|---|---|
| SRC-001 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Basic Chemicals, Acids & Alkalis | Acids (Sulphuric, Hydrochloric, Nitric, Phosphoric) |  |
| SRC-002 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Basic Chemicals, Acids & Alkalis | Alkalis (Caustic Soda, Soda Ash) |  |
| SRC-003 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Basic Chemicals, Acids & Alkalis | General Industrial Chemicals |  |
| SRC-004 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Solvents & Alcohols | Hydrocarbon Solvents |  |
| SRC-005 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Solvents & Alcohols | Ketone Solvents |  |
| SRC-006 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Solvents & Alcohols | Industrial Alcohols |  |
| SRC-007 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Utility & Water Treatment Chemicals | Boiler & Cooling Tower Chemicals |  |
| SRC-008 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Utility & Water Treatment Chemicals | WTP / ETP Chemicals |  |
| SRC-009 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Utility & Water Treatment Chemicals | RO & Membrane Chemicals |  |
| SRC-010 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Dyes, Pigments & Colorants | Textile Dyes |  |
| SRC-011 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Dyes, Pigments & Colorants | Pigments (Organic / Inorganic) |  |
| SRC-012 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Dyes, Pigments & Colorants | Printing Inks & Pastes |  |
| SRC-013 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Adhesives, Sealants & Resins | Industrial Adhesives |  |
| SRC-014 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Adhesives, Sealants & Resins | Sealants |  |
| SRC-015 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Adhesives, Sealants & Resins | Synthetic Resins |  |
| SRC-016 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Specialty Chemicals & Additives | Textile Auxiliaries |  |
| SRC-017 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Specialty Chemicals & Additives | Plastic Additives |  |
| SRC-018 | 1 | Industrial Raw Materials & Inputs | Industrial Chemicals | Specialty Chemicals & Additives | Paint & Coating Additives |  |
| SRC-019 | 1 | Industrial Raw Materials & Inputs | Polymers, Resins & Elastomers | Commodity Polymers | PP, PE, PVC, PET |  |
| SRC-020 | 1 | Industrial Raw Materials & Inputs | Polymers, Resins & Elastomers | Engineering Plastics | ABS, PC, Nylon, PS |  |
| SRC-021 | 1 | Industrial Raw Materials & Inputs | Polymers, Resins & Elastomers | Elastomers & Rubber Compounds | EVA, TPE, Synthetic Rubber |  |
| SRC-022 | 1 | Industrial Raw Materials & Inputs | Polymers, Resins & Elastomers | Recycled Polymers | Recycled PP / PE / PET |  |
| SRC-023 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Ferrous Metals | Pig Iron, Sponge Iron |  |
| SRC-024 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Ferrous Metals | HR / CR / GI Coils & Sheets |  |
| SRC-025 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Non-Ferrous Metals | Aluminium |  |
| SRC-026 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Non-Ferrous Metals | Copper |  |
| SRC-027 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Non-Ferrous Metals | Zinc, Lead |  |
| SRC-028 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Alloys & Ferro Alloys | Ferro Manganese, Ferro Silicon |  |
| SRC-029 | 1 | Industrial Raw Materials & Inputs | Metals & Alloys | Alloys & Ferro Alloys | Brass, Bronze |  |
| SRC-030 | 1 | Industrial Raw Materials & Inputs | Minerals, Ores & Natural Resources | Industrial Minerals | Limestone, Dolomite |  |
| SRC-031 | 1 | Industrial Raw Materials & Inputs | Minerals, Ores & Natural Resources | Industrial Minerals | Silica Sand, Quartz |  |
| SRC-032 | 1 | Industrial Raw Materials & Inputs | Minerals, Ores & Natural Resources | Industrial Minerals | Kaolin, Ball Clay |  |
| SRC-033 | 1 | Industrial Raw Materials & Inputs | Minerals, Ores & Natural Resources | Energy Minerals | Coal (Industrial Grade) |  |
| SRC-034 | 1 | Industrial Raw Materials & Inputs | Minerals, Ores & Natural Resources | Metal Ores | Iron Ore |  |
| SRC-035 | 1 | Industrial Raw Materials & Inputs | Minerals, Ores & Natural Resources | Metal Ores | Bauxite |  |
| SRC-036 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Natural Fibers & Yarns | Raw Cotton, Cotton Yarn |  |
| SRC-037 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Natural Fibers & Yarns | Jute Fiber & Yarn |  |
| SRC-038 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Synthetic Fibers & Yarns | Polyester Fiber & Yarn |  |
| SRC-039 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Synthetic Fibers & Yarns | Nylon, Viscose |  |
| SRC-040 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Specialty & Blended Yarns | PC, CVC, Spandex |  |
| SRC-041 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Greige Fabric | Woven Greige Fabric |  |
| SRC-042 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Greige Fabric | Knitted Greige Fabric |  |
| SRC-043 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Fabrics & Cloth Materials | Greige Fabric | dup: Greige Fabric also an L3 sibling |
| SRC-044 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Fabrics & Cloth Materials | Woven Fabric |  |
| SRC-045 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Fabrics & Cloth Materials | Knitted Fabric |  |
| SRC-046 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Fabrics & Cloth Materials | Denim Fabric |  |
| SRC-047 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Garment Accessories & Trims | Buttons |  |
| SRC-048 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Garment Accessories & Trims | Zippers |  |
| SRC-049 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Garment Accessories & Trims | Hooks & Eyelets |  |
| SRC-050 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Garment Accessories & Trims | Elastic Tapes |  |
| SRC-051 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Garment Accessories & Trims | Labels & Tags |  |
| SRC-052 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Yarns & Fibers | Cotton Yarn | dup: yarn concepts already under Natural Fibers & Yarns |
| SRC-053 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Yarns & Fibers | Polyester Yarn | dup: see Synthetic Fibers & Yarns |
| SRC-054 | 1 | Industrial Raw Materials & Inputs | Textile Fibers, Yarns & Fabrics (Raw) | Yarns & Fibers | Blended Yarns | dup: see Specialty & Blended Yarns |
| SRC-055 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Grains & Cereals | Wheat, Maize, Rice |  |
| SRC-056 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Oils, Fats & Waxes | Crude Vegetable Oils |  |
| SRC-057 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Oils, Fats & Waxes | Paraffin Wax |  |
| SRC-058 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Sweeteners & Starches | Raw Sugar, Molasses |  |
| SRC-059 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Sweeteners & Starches | Industrial Starch |  |
| SRC-060 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Proteins & Enzymes | Milk Powder, Whey |  |
| SRC-061 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Proteins & Enzymes | Enzymes & Yeast |  |
| SRC-062 | 1 | Industrial Raw Materials & Inputs | Agro, Food & Bio Ingredients (Industrial Grade) | Animal Feed Raw Materials | Soybean Meal, Fish Meal |  |
| SRC-063 | 1 | Industrial Raw Materials & Inputs | Construction Raw Materials (Basic Form) | Cement & Concrete Inputs | Clinker, Gypsum |  |
| SRC-064 | 1 | Industrial Raw Materials & Inputs | Construction Raw Materials (Basic Form) | Cement & Concrete Inputs | Fly Ash, Slag |  |
| SRC-065 | 1 | Industrial Raw Materials & Inputs | Construction Raw Materials (Basic Form) | Aggregates & Fill Materials | Stone, Sand |  |
| SRC-066 | 1 | Industrial Raw Materials & Inputs | Construction Raw Materials (Basic Form) | Road & Pavement Inputs | Bitumen |  |
| SRC-067 | 1 | Industrial Raw Materials & Inputs | Construction Raw Materials (Basic Form) | Brick & Ceramic Inputs | Clay |  |
| SRC-068 | 1 | Industrial Raw Materials & Inputs | Paper, Pulp & Wood Raw Materials | Pulp & Fiber | Wood Pulp |  |
| SRC-069 | 1 | Industrial Raw Materials & Inputs | Paper, Pulp & Wood Raw Materials | Recycled Paper Inputs | Waste Paper |  |
| SRC-070 | 1 | Industrial Raw Materials & Inputs | Paper, Pulp & Wood Raw Materials | Timber & Logs | Industrial Timber & Logs |  |
| SRC-071 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Silos (MS, SS, Aluminum) | attribute-in-name: material variants |
| SRC-072 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Hoppers & Day Bins |  |
| SRC-073 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Storage Bins & Bulk Containers |  |
| SRC-074 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Screw Feeders |  |
| SRC-075 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Vibratory Feeders |  |
| SRC-076 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Belt Feeders & Weigh Belt Feeders |  |
| SRC-077 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Loss-in-Weight Feeders |  |
| SRC-078 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Volumetric Dosing Feeders |  |
| SRC-079 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | Bag Dump Stations (Manual / Enclosed) |  |
| SRC-080 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Storage, Feeding & Dosing Systems | FIBC / Jumbo Bag Unloaders |  |
| SRC-081 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Belt Conveyors (Flat, Trough, Inclined) | cross-branch overlap: Material Handling conveyors |
| SRC-082 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Screw Conveyors (Horizontal, Inclined, Vertical) | cross-branch overlap: Material Handling conveyors |
| SRC-083 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Chain Conveyors |  |
| SRC-084 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Drag Conveyors |  |
| SRC-085 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Bucket Elevators |  |
| SRC-086 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Vibrating Conveyors |  |
| SRC-087 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mechanical Conveying Systems | Roller Conveyors (Process use only) | scope-qualifier-in-name |
| SRC-088 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Pneumatic Conveying Systems | Lean Phase Pneumatic Conveying Systems |  |
| SRC-089 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Pneumatic Conveying Systems | Dense Phase Pneumatic Conveying Systems |  |
| SRC-090 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Pneumatic Conveying Systems | Rotary Airlock Valves |  |
| SRC-091 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Pneumatic Conveying Systems | Diverter Valves |  |
| SRC-092 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Pneumatic Conveying Systems | Cyclone Separators (Process use) |  |
| SRC-093 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Pneumatic Conveying Systems | Conveying Blowers & Vacuum Pumps (Process-dedicated) |  |
| SRC-094 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Ribbon Blenders |  |
| SRC-095 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Paddle Mixers |  |
| SRC-096 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Ploughshare Mixers |  |
| SRC-097 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | V-Blenders |  |
| SRC-098 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Double Cone Blenders |  |
| SRC-099 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Tumble Blenders |  |
| SRC-100 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Drum Mixers |  |
| SRC-101 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | High-Shear Powder Mixers |  |
| SRC-102 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Mixing, Blending & Homogenizing Equipment | Dry Granulators (Roll Compactors) |  |
| SRC-103 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Jaw Crushers |  |
| SRC-104 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Impact Crushers |  |
| SRC-105 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Roller Crushers |  |
| SRC-106 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Hammer Mills |  |
| SRC-107 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Pin Mills |  |
| SRC-108 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Ball Mills |  |
| SRC-109 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Jet Mills |  |
| SRC-110 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Pulverizers |  |
| SRC-111 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Size Reduction (Crushing, Grinding & Milling) | Micronizers |  |
| SRC-112 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Vibrating Screens |  |
| SRC-113 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Rotary Screens |  |
| SRC-114 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Gyratory Sifters |  |
| SRC-115 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Centrifugal Sieves |  |
| SRC-116 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Magnetic Separators |  |
| SRC-117 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Metal Detectors (Process inline) | dup-family: Metal Detectors also in Packaging Inspection |
| SRC-118 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Screening, Classification & Separation | Air Classifiers |  |
| SRC-119 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Granulation, Agglomeration & Pelletizing | High Shear Granulators |  |
| SRC-120 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Granulation, Agglomeration & Pelletizing | Roller Compactors | dup: Dry Granulators (Roll Compactors) under Mixing |
| SRC-121 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Granulation, Agglomeration & Pelletizing | Pelletizers |  |
| SRC-122 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Granulation, Agglomeration & Pelletizing | Extruders (Dry bulk use) |  |
| SRC-123 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Granulation, Agglomeration & Pelletizing | Agglomerators |  |
| SRC-124 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Dust Control & Process Air Filtration | Baghouse Dust Collectors | dup-family: dust collectors x3 across L1s |
| SRC-125 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Dust Control & Process Air Filtration | Cartridge Dust Collectors |  |
| SRC-126 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Dust Control & Process Air Filtration | Cyclone Dust Collectors |  |
| SRC-127 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Dust Control & Process Air Filtration | Wet Scrubbers (Process dust) | dup-family: scrubbers x3 |
| SRC-128 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Dust Control & Process Air Filtration | Industrial Vacuum Systems (Process duty) |  |
| SRC-129 | 2 | Production & Process Machinery | Bulk, Solid & Powder Processing Machinery | Dust Control & Process Air Filtration | Filter Bags, Cages & Cartridges (Process filters only) | consumable in machinery branch |
| SRC-130 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Storage Tanks (SS) | attribute-as-category: material split |
| SRC-131 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Storage Tanks (FRP) | attribute-as-category: material split |
| SRC-132 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Storage Tanks (MS) | attribute-as-category: material split |
| SRC-133 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Hygienic / Aseptic Tanks |  |
| SRC-134 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Jacketed & Insulated Tanks |  |
| SRC-135 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Reactors (Low-pressure, Atmospheric) | dup-family: reactors also under Thermal/Reaction |
| SRC-136 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Pressure Vessels (Process duty) | dup: exact repeat under Reaction & High-Pressure |
| SRC-137 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Storage & Holding Equipment | Intermediate Bulk Containers (IBC) - Process use | mojibake-fixed (was "â") |
| SRC-138 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Centrifugal Pumps (End suction, Multistage) |  |
| SRC-139 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Positive Displacement Pumps |  |
| SRC-140 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Gear Pumps |  |
| SRC-141 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Lobe Pumps |  |
| SRC-142 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Screw Pumps |  |
| SRC-143 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Progressive Cavity Pumps |  |
| SRC-144 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Diaphragm Pumps (AODD, Mechanical) |  |
| SRC-145 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Peristaltic / Hose Pumps |  |
| SRC-146 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Metering & Dosing Pumps |  |
| SRC-147 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Drum & Barrel Pumps |  |
| SRC-148 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Pumping & Transfer Systems | Other Pumps | catch-all node |
| SRC-149 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Top-entry Agitators |  |
| SRC-150 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Side-entry Agitators |  |
| SRC-151 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Bottom-entry Agitators |  |
| SRC-152 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Inline Static Mixers |  |
| SRC-153 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | High-Shear Mixers (Batch & Inline) |  |
| SRC-154 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Homogenizers |  |
| SRC-155 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Emulsifiers |  |
| SRC-156 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Mixing, Agitation & Homogenization | Liquid-Powder Induction & Mixing Systems | mojibake-fixed |
| SRC-157 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Filter Press (Chamber, Membrane) |  |
| SRC-158 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Bag Filter Housings |  |
| SRC-159 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Cartridge Filter Systems |  |
| SRC-160 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Self-Cleaning Filters & Strainers |  |
| SRC-161 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Industrial Centrifuges (Basket, Decanter) |  |
| SRC-162 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Oil-Water Separators | mojibake-fixed |
| SRC-163 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Filtration, Clarification & Separation | Membrane Filtration Systems (MF, UF, NF) |  |
| SRC-164 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Dosing, Measuring & Process Skids | Automated Liquid Dosing Skids |  |
| SRC-165 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Dosing, Measuring & Process Skids | Chemical Dosing Systems |  |
| SRC-166 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Dosing, Measuring & Process Skids | Inline Flow Measurement Skids |  |
| SRC-167 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Dosing, Measuring & Process Skids | Batch Dosing & Recipe Control Skids |  |
| SRC-168 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Cleaning, Sterilization & Hygienic Systems | CIP (Clean-in-Place) Systems |  |
| SRC-169 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Cleaning, Sterilization & Hygienic Systems | SIP (Sterilize-in-Place) Systems |  |
| SRC-170 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Cleaning, Sterilization & Hygienic Systems | Tank & Vessel Cleaning Machines |  |
| SRC-171 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Cleaning, Sterilization & Hygienic Systems | Pigging Systems (for pipelines) |  |
| SRC-172 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Liquid Process Line Integration | Turnkey Liquid Processing Lines | service-in-product-branch |
| SRC-173 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Liquid Process Line Integration | Skid-Mounted Process Units |  |
| SRC-174 | 2 | Production & Process Machinery | Liquid & Fluid Processing Machinery | Liquid Process Line Integration | Modular Process Systems |  |
| SRC-175 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Dryers | parent-as-sibling: generic next to specific dryers |
| SRC-176 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Tray Dryers |  |
| SRC-177 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Fluid Bed Dryers (FBD) |  |
| SRC-178 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Spray Dryers |  |
| SRC-179 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Rotary Dryers |  |
| SRC-180 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Vacuum Dryers |  |
| SRC-181 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Freeze / Lyophilization Dryers |  |
| SRC-182 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Ovens | parent-as-sibling |
| SRC-183 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Batch Ovens |  |
| SRC-184 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Conveyor Ovens |  |
| SRC-185 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Industrial Curing Ovens |  |
| SRC-186 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Process Chillers & Cooling Tunnels |  |
| SRC-187 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heating, Drying & Cooling Systems | Heat Tunnels & Thermal Chambers (Process use) |  |
| SRC-188 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heat Transfer Equipment | Shell & Tube Heat Exchangers | dup-family: HX also under Steam/Boiler utility |
| SRC-189 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heat Transfer Equipment | Plate Heat Exchangers |  |
| SRC-190 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heat Transfer Equipment | Finned Tube Heat Exchangers |  |
| SRC-191 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heat Transfer Equipment | Scraped Surface Heat Exchangers |  |
| SRC-192 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Heat Transfer Equipment | Heat Recovery Units (Process-side) |  |
| SRC-193 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Process Reactors | parent-as-sibling |
| SRC-194 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Stainless Steel Process Reactors | attribute-as-category: material split |
| SRC-195 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Glass-Lined Process Reactors | attribute-as-category: material split |
| SRC-196 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Alloy Reactors (Hastelloy, etc.) | attribute-as-category: material split |
| SRC-197 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Pressure Vessels (Process duty) | dup: exact repeat of Storage & Holding row |
| SRC-198 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Autoclaves (Industrial process) |  |
| SRC-199 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Fermenters & Bioreactors |  |
| SRC-200 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Reaction & High-Pressure Processing | Agitated Reaction Systems |  |
| SRC-201 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Evaporation & Concentration Systems | Falling Film Evaporators |  |
| SRC-202 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Evaporation & Concentration Systems | Rising Film Evaporators |  |
| SRC-203 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Evaporation & Concentration Systems | Forced Circulation Evaporators |  |
| SRC-204 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Evaporation & Concentration Systems | Agitated Thin Film Evaporators (ATFE) |  |
| SRC-205 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Evaporation & Concentration Systems | Multi-Effect Evaporators (MEE) |  |
| SRC-206 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Evaporation & Concentration Systems | Zero Liquid Discharge (ZLD) Concentration Units | dup-family: ZLD also under Water Treatment |
| SRC-207 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Distillation & Fractionation Systems | Batch Distillation Units |  |
| SRC-208 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Distillation & Fractionation Systems | Continuous Distillation Columns |  |
| SRC-209 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Distillation & Fractionation Systems | Fractionation Columns |  |
| SRC-210 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Distillation & Fractionation Systems | Column Internals Trays (Sieve, Bubble Cap) |  |
| SRC-211 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Distillation & Fractionation Systems | Column Internals Packings (Structured, Random) |  |
| SRC-212 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Extraction, Leaching & Mass Transfer | Solid-Liquid Extractors | mojibake-fixed |
| SRC-213 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Extraction, Leaching & Mass Transfer | Liquid-Liquid Extraction Columns | mojibake-fixed |
| SRC-214 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Extraction, Leaching & Mass Transfer | Supercritical Fluid Extraction (SFE) Systems |  |
| SRC-215 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Extraction, Leaching & Mass Transfer | Leaching Systems |  |
| SRC-216 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Crystallization, Precipitation & Solidification | Batch Crystallizers |  |
| SRC-217 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Crystallization, Precipitation & Solidification | Continuous Crystallizers |  |
| SRC-218 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Crystallization, Precipitation & Solidification | Cooling Crystallizers |  |
| SRC-219 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Crystallization, Precipitation & Solidification | Evaporative Crystallizers |  |
| SRC-220 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Crystallization, Precipitation & Solidification | Melt Crystallization Systems |  |
| SRC-221 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Thermal & Process Line Integration | Turnkey Thermal Processing Lines | service-in-product-branch |
| SRC-222 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Thermal & Process Line Integration | Skid-Mounted Thermal Process Units |  |
| SRC-223 | 2 | Production & Process Machinery | Thermal, Separation & Reaction Systems | Thermal & Process Line Integration | Process Optimization & Retrofits (Thermal) | service-in-product-branch |
| SRC-224 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Filling & Dosing Machines | Liquid Filling Machines (Volumetric, Gravimetric, Flow-meter based) |  |
| SRC-225 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Filling & Dosing Machines | Powder Filling Machines (Auger, Vacuum) |  |
| SRC-226 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Filling & Dosing Machines | Granule Filling Machines (Cup, Weighing) |  |
| SRC-227 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Filling & Dosing Machines | Piston Filling Machines |  |
| SRC-228 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Filling & Dosing Machines | Aseptic Filling Machines |  |
| SRC-229 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Filling & Dosing Machines | Multi-Head Weighers & Filling Systems |  |
| SRC-230 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Form-Fill-Seal (FFS) & Pouching Systems | Vertical Form-Fill-Seal (VFFS) Machines |  |
| SRC-231 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Form-Fill-Seal (FFS) & Pouching Systems | Horizontal Form-Fill-Seal (HFFS) Machines |  |
| SRC-232 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Form-Fill-Seal (FFS) & Pouching Systems | Stick Pack Machines |  |
| SRC-233 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Form-Fill-Seal (FFS) & Pouching Systems | Sachet Packaging Machines |  |
| SRC-234 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Form-Fill-Seal (FFS) & Pouching Systems | Pouch Filling & Sealing Machines (Stand-up, Zipper, Spout) |  |
| SRC-235 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Capping, Sealing & Closing Machines | Screw Capping Machines |  |
| SRC-236 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Capping, Sealing & Closing Machines | ROPP & Lug Capping Machines |  |
| SRC-237 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Capping, Sealing & Closing Machines | Induction Sealing Machines |  |
| SRC-238 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Capping, Sealing & Closing Machines | Heat Sealing Machines |  |
| SRC-239 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Capping, Sealing & Closing Machines | Vacuum Sealing Machines |  |
| SRC-240 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Capping, Sealing & Closing Machines | Carton Sealing Machines |  |
| SRC-241 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Labeling, Coding & Marking Systems | Bottle & Container Labeling Machines |  |
| SRC-242 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Labeling, Coding & Marking Systems | Wrap-Around & Sticker Labeling Machines |  |
| SRC-243 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Labeling, Coding & Marking Systems | Inkjet Coding Machines (CIJ, TIJ) |  |
| SRC-244 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Labeling, Coding & Marking Systems | Laser Marking Machines |  |
| SRC-245 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Labeling, Coding & Marking Systems | Thermal Transfer Overprinters (TTO) |  |
| SRC-246 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Labeling, Coding & Marking Systems | Serialization & Track-and-Trace Systems |  |
| SRC-247 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Secondary Packaging & Case Packing | Cartoning Machines (Horizontal / Vertical) |  |
| SRC-248 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Secondary Packaging & Case Packing | Case Packers (Top-load, Side-load) |  |
| SRC-249 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Secondary Packaging & Case Packing | Case Erectors & Case Sealers |  |
| SRC-250 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Secondary Packaging & Case Packing | Tray Packing Machines |  |
| SRC-251 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Secondary Packaging & Case Packing | Shrink Wrapping Machines (Secondary) |  |
| SRC-252 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | End-of-Line Handling & Palletizing | Palletizers (Conventional, Robotic) | dup-family: palletizing also in Robotics + Material Handling |
| SRC-253 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | End-of-Line Handling & Palletizing | Depalletizers |  |
| SRC-254 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | End-of-Line Handling & Palletizing | Stretch Wrapping Machines | dup-family: pallet wrappers also in Material Handling |
| SRC-255 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | End-of-Line Handling & Palletizing | Shrink Hood Wrapping Machines |  |
| SRC-256 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | End-of-Line Handling & Palletizing | Pallet Conveyors (Packaging-line use) |  |
| SRC-257 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Inspection, Check & Rejection Systems | Checkweighers | dup: Vision Inspection & Checkweighers under Quality L1 |
| SRC-258 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Inspection, Check & Rejection Systems | Metal Detectors (Packaging line) | dup-family |
| SRC-259 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Inspection, Check & Rejection Systems | X-Ray Inspection Systems |  |
| SRC-260 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Inspection, Check & Rejection Systems | Vision Inspection Systems | dup-family |
| SRC-261 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Inspection, Check & Rejection Systems | Leak Detection Systems |  |
| SRC-262 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Inspection, Check & Rejection Systems | Automatic Reject Systems |  |
| SRC-263 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Packaging Line Integration & Turnkey Solutions | Turnkey Packaging Line Setup | service-in-product-branch |
| SRC-264 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Packaging Line Integration & Turnkey Solutions | Integrated Filling-Packing Lines | mojibake-fixed |
| SRC-265 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Packaging Line Integration & Turnkey Solutions | Packaging Line Automation & Controls |  |
| SRC-266 | 2 | Production & Process Machinery | Packaging, Filling & End-of-Line Machinery | Packaging Line Integration & Turnkey Solutions | Line Balancing & Speed Optimization | service-in-product-branch |
| SRC-267 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Lathe Machines (Conventional, CNC) |  |
| SRC-268 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Milling Machines (Conventional, CNC, VMC) |  |
| SRC-269 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Drilling Machines (Pillar, Radial, Magnetic) |  |
| SRC-270 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Boring Machines |  |
| SRC-271 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Shaper & Slotting Machines |  |
| SRC-272 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Surface Grinding Machines |  |
| SRC-273 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Cylindrical & Centerless Grinding Machines |  |
| SRC-274 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Machining (Metal Cutting) Machines | Tool & Cutter Grinding Machines |  |
| SRC-275 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | CNC & Advanced Machining Centers | CNC Turning Centers | overlap: CNC variants also listed in Machining L3 |
| SRC-276 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | CNC & Advanced Machining Centers | Vertical Machining Centers (VMC) | overlap |
| SRC-277 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | CNC & Advanced Machining Centers | Horizontal Machining Centers (HMC) |  |
| SRC-278 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | CNC & Advanced Machining Centers | 5-Axis CNC Machining Centers |  |
| SRC-279 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | CNC & Advanced Machining Centers | Multi-Spindle & Multi-Axis Machines |  |
| SRC-280 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Sheet Metal Fabrication Machines | Shearing Machines |  |
| SRC-281 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Sheet Metal Fabrication Machines | Press Brake Machines (NC, CNC) |  |
| SRC-282 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Sheet Metal Fabrication Machines | Power Press Machines |  |
| SRC-283 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Sheet Metal Fabrication Machines | Turret Punching Machines |  |
| SRC-284 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Sheet Metal Fabrication Machines | Plate Rolling & Bending Machines |  |
| SRC-285 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Sheet Metal Fabrication Machines | Panel Benders |  |
| SRC-286 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Thermal & Advanced Cutting Technologies | Laser Cutting Machines (Fiber, CO2) | mojibake-fixed (CO2) |
| SRC-287 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Thermal & Advanced Cutting Technologies | Plasma Cutting Machines |  |
| SRC-288 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Thermal & Advanced Cutting Technologies | Waterjet Cutting Machines |  |
| SRC-289 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Thermal & Advanced Cutting Technologies | Flame / Oxy-Fuel Cutting Machines |  |
| SRC-290 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | Arc / MMA Welding Machines |  |
| SRC-291 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | MIG / MAG Welding Machines |  |
| SRC-292 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | TIG Welding Machines |  |
| SRC-293 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | Submerged Arc Welding (SAW) Systems |  |
| SRC-294 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | Spot & Resistance Welding Machines |  |
| SRC-295 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | Robotic Welding Cells | dup-family: robotics also under Automation |
| SRC-296 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Welding, Joining & Brazing Equipment | Brazing & Soldering Equipment |  |
| SRC-297 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Forming, Pressing & Forging Machinery | Hydraulic Presses |  |
| SRC-298 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Forming, Pressing & Forging Machinery | Mechanical Presses |  |
| SRC-299 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Forming, Pressing & Forging Machinery | Forging Presses |  |
| SRC-300 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Forming, Pressing & Forging Machinery | Roll Forming Machines |  |
| SRC-301 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Forming, Pressing & Forging Machinery | Extrusion Presses (Metal forming) |  |
| SRC-302 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Workshop Support & Finishing Equipment | Shot Blasting & Sand Blasting Machines |  |
| SRC-303 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Workshop Support & Finishing Equipment | Surface Finishing & Polishing Machines |  |
| SRC-304 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Workshop Support & Finishing Equipment | Heat Treatment Furnaces (Workshop-scale) |  |
| SRC-305 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Workshop Support & Finishing Equipment | Parts Washing & Degreasing Machines |  |
| SRC-306 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Workshop Support & Finishing Equipment | Balancing Machines |  |
| SRC-307 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Tooling, Dies & Production Fixtures (Equipment Side) | Mold & Die Making Machines |  |
| SRC-308 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Tooling, Dies & Production Fixtures (Equipment Side) | Tool Presetting Machines |  |
| SRC-309 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Tooling, Dies & Production Fixtures (Equipment Side) | Jigs, Fixtures & Workholding Systems (Production-grade) |  |
| SRC-310 | 2 | Production & Process Machinery | Fabrication, Machining & Workshop Machinery | Tooling, Dies & Production Fixtures (Equipment Side) | EDM Machines (Wire-cut, Die-sinking) |  |
| SRC-311 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Spinning Machines |  |
| SRC-312 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Weaving Looms (Rapier, Air-Jet, Water-Jet) |  |
| SRC-313 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Knitting Machines (Circular, Flat) |  |
| SRC-314 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Dyeing Machines (Jet, Jigger, Winch) |  |
| SRC-315 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Textile Printing Machines |  |
| SRC-316 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Finishing & Compacting Machines |  |
| SRC-317 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Textile, Garments & Fiber Processing Machinery | Nonwoven & Technical Textile Machinery |  |
| SRC-318 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Grain & Flour Milling Machines |  |
| SRC-319 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Dairy Processing Machinery |  |
| SRC-320 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Beverage Processing Lines |  |
| SRC-321 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Bakery & Confectionery Machines |  |
| SRC-322 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Meat & Poultry Processing Machinery |  |
| SRC-323 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Fruit & Vegetable Processing Machines |  |
| SRC-324 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Food & Beverage Processing Machinery | Edible Oil Processing Machinery |  |
| SRC-325 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Pharmaceutical & Medical Production Machinery | Tablet Compression Machines |  |
| SRC-326 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Pharmaceutical & Medical Production Machinery | Capsule Filling Machines |  |
| SRC-327 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Pharmaceutical & Medical Production Machinery | Granulation & Coating Systems |  |
| SRC-328 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Pharmaceutical & Medical Production Machinery | Injectable & Sterile Processing Lines |  |
| SRC-329 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Pharmaceutical & Medical Production Machinery | Blister & Strip Packaging Lines (Process-linked) |  |
| SRC-330 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Pharmaceutical & Medical Production Machinery | Medical Device Assembly Machinery |  |
| SRC-331 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Plastics, Rubber & Polymer Processing Machinery | Injection Molding Machines |  |
| SRC-332 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Plastics, Rubber & Polymer Processing Machinery | Extrusion Lines |  |
| SRC-333 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Plastics, Rubber & Polymer Processing Machinery | Blow Molding Machines |  |
| SRC-334 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Plastics, Rubber & Polymer Processing Machinery | Compression & Transfer Molding Machines |  |
| SRC-335 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Plastics, Rubber & Polymer Processing Machinery | Rubber Mixing & Calendering Machines |  |
| SRC-336 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Plastics, Rubber & Polymer Processing Machinery | Thermoforming Machines |  |
| SRC-337 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Paper, Pulp & Packaging Board Machinery | Pulping & Digestion Systems |  |
| SRC-338 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Paper, Pulp & Packaging Board Machinery | Paper Making Machines |  |
| SRC-339 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Paper, Pulp & Packaging Board Machinery | Tissue & Specialty Paper Machines |  |
| SRC-340 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Paper, Pulp & Packaging Board Machinery | Paper Converting Machinery |  |
| SRC-341 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Paper, Pulp & Packaging Board Machinery | Corrugation & Board Making Machines |  |
| SRC-342 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Building Materials & Construction Product Machinery | Cement & Clinker Production Machinery |  |
| SRC-343 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Building Materials & Construction Product Machinery | Concrete Batching & Block Making Machines |  |
| SRC-344 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Building Materials & Construction Product Machinery | Brick & Tile Making Machines |  |
| SRC-345 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Building Materials & Construction Product Machinery | AAC / Fly Ash Brick Plants |  |
| SRC-346 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Building Materials & Construction Product Machinery | Gypsum Board Production Lines |  |
| SRC-347 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Wood, Furniture & Panel Processing Machinery | Sawmill & Log Processing Machines |  |
| SRC-348 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Wood, Furniture & Panel Processing Machinery | Wood Cutting & Shaping Machines |  |
| SRC-349 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Wood, Furniture & Panel Processing Machinery | Panel Processing Machines (MDF, Plywood) |  |
| SRC-350 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Wood, Furniture & Panel Processing Machinery | Furniture Manufacturing Machines |  |
| SRC-351 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Wood, Furniture & Panel Processing Machinery | Wood Surface Finishing Machines |  |
| SRC-352 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Chemical & Specialty Process Machinery | Chemical Batch Processing Units |  |
| SRC-353 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Chemical & Specialty Process Machinery | Specialty Chemical Production Lines |  |
| SRC-354 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Chemical & Specialty Process Machinery | Agrochemical & Fertilizer Machinery |  |
| SRC-355 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Chemical & Specialty Process Machinery | Resin & Adhesive Manufacturing Systems |  |
| SRC-356 | 2 | Production & Process Machinery | Industry-Specific Production Machinery | Chemical & Specialty Process Machinery | Paint & Coating Production Machinery |  |
| SRC-357 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Turnkey Production Line Solutions | Complete Production Line Setup | service-in-product-branch |
| SRC-358 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Turnkey Production Line Solutions | Greenfield Plant Line Installation | service |
| SRC-359 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Turnkey Production Line Solutions | Brownfield Line Expansion & Retrofit | service |
| SRC-360 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Turnkey Production Line Solutions | Capacity Enhancement & Debottlenecking Projects | service |
| SRC-361 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Machine-to-Machine Integration | Process Conveying & Transfer Integration | service |
| SRC-362 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Machine-to-Machine Integration | Synchronization of Multiple Machines | service |
| SRC-363 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Machine-to-Machine Integration | Inline Buffering & Accumulation Systems |  |
| SRC-364 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Machine-to-Machine Integration | Interlocking & Safety Integration | service |
| SRC-365 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Industrial Automation Systems | PLC-Based Control Systems | dup-family: PLC/SCADA appears 4+ times across L1s |
| SRC-366 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Industrial Automation Systems | SCADA & HMI Systems (Process operations) | dup-family |
| SRC-367 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Industrial Automation Systems | Distributed Control Systems (DCS) |  |
| SRC-368 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Industrial Automation Systems | Batch Control & Recipe Management Systems |  |
| SRC-369 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Robotics & Smart Production Cells | Pick-and-Place Robotic Cells |  |
| SRC-370 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Robotics & Smart Production Cells | Robotic Loading / Unloading Systems |  |
| SRC-371 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Robotics & Smart Production Cells | Robotic Palletizing Cells (Process-linked) | dup-family: palletizers |
| SRC-372 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Robotics & Smart Production Cells | Collaborative Robots (Cobots) in Production |  |
| SRC-373 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Robotics & Smart Production Cells | Vision-Guided Robotic Systems |  |
| SRC-374 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Electrical, Instrumentation & Control (EIC) Integration | MCC & Control Panel Integration (Process duty) | service |
| SRC-375 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Electrical, Instrumentation & Control (EIC) Integration | Field Instrumentation Integration | service |
| SRC-376 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Electrical, Instrumentation & Control (EIC) Integration | VFD & Servo Drive Integration | service |
| SRC-377 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Electrical, Instrumentation & Control (EIC) Integration | Sensors, Actuators & Field Devices (Integration scope) |  |
| SRC-378 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Digitalization, Monitoring & Optimization | Production Monitoring Systems |  |
| SRC-379 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Digitalization, Monitoring & Optimization | OEE & Downtime Analysis Systems | dup-family: OEE also under Utility Automation |
| SRC-380 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Digitalization, Monitoring & Optimization | Energy Monitoring (Process level) | dup-family: energy monitoring x3 |
| SRC-381 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Digitalization, Monitoring & Optimization | Predictive Maintenance (Production assets) | dup-family |
| SRC-382 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Commissioning, Validation & Lifecycle Services | Installation & Commissioning Services | service; repeated in ~8 branches |
| SRC-383 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Commissioning, Validation & Lifecycle Services | FAT / SAT & Line Acceptance Testing | service |
| SRC-384 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Commissioning, Validation & Lifecycle Services | Process Optimization & Tuning | service |
| SRC-385 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Commissioning, Validation & Lifecycle Services | GMP / Validation Support (where applicable) | service |
| SRC-386 | 2 | Production & Process Machinery | Production Line Integration & Process Automation | Commissioning, Validation & Lifecycle Services | AMC for Integrated Production Lines | service |
| SRC-387 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Generation Systems | Diesel Generator (DG) Sets |  |
| SRC-388 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Generation Systems | Gas Generator Sets |  |
| SRC-389 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Generation Systems | Captive Power Plants |  |
| SRC-390 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Generation Systems | Solar Power Plants (Industrial / Rooftop) |  |
| SRC-391 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Generation Systems | Hybrid Power Generation Systems |  |
| SRC-392 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Generation Systems | Cogeneration (CHP) Systems |  |
| SRC-393 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical Substations & Distribution | HT / LT Substations |  |
| SRC-394 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical Substations & Distribution | Transformers (Power & Distribution) |  |
| SRC-395 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical Substations & Distribution | HT / LT Switchgear Panels |  |
| SRC-396 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical Substations & Distribution | Ring Main Units (RMU) |  |
| SRC-397 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical Substations & Distribution | Bus Duct & Busbar Trunking Systems |  |
| SRC-398 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Control, Protection & Conditioning | Power Control Centers (PCC) |  |
| SRC-399 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Control, Protection & Conditioning | Motor Control Centers (MCC) |  |
| SRC-400 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Control, Protection & Conditioning | Uninterruptible Power Supply (UPS) |  |
| SRC-401 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Control, Protection & Conditioning | Automatic Power Factor Correction (APFC) Panels |  |
| SRC-402 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Power Control, Protection & Conditioning | Harmonic Filters & Power Quality Systems |  |
| SRC-403 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Backup & Energy Storage Systems | Emergency Power Supply Systems |  |
| SRC-404 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Backup & Energy Storage Systems | Battery Energy Storage Systems (BESS) |  |
| SRC-405 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Backup & Energy Storage Systems | Automatic / Static Transfer Switches (ATS / STS) |  |
| SRC-406 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Earthing, Lightning & Electrical Safety | Earthing & Grounding Systems |  |
| SRC-407 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Earthing, Lightning & Electrical Safety | Lightning Protection Systems |  |
| SRC-408 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Earthing, Lightning & Electrical Safety | Arc Flash & Electrical Safety Systems |  |
| SRC-409 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical EPC & Services | Electrical EPC & Turnkey Projects | service-in-product-branch |
| SRC-410 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical EPC & Services | Installation & Commissioning Services | service; repeated |
| SRC-411 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical EPC & Services | Electrical Testing & Safety Audits | service |
| SRC-412 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical EPC & Services | Annual Maintenance Contracts (AMC) | service; repeated |
| SRC-413 | 3 | Industrial Utilities & Plant Systems | Power Generation & Electrical Systems | Electrical EPC & Services | Energy Audit & Power Optimization Services | service |
| SRC-414 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Raw Water Intake & Pre-Treatment Systems | Raw Water Intake Systems |  |
| SRC-415 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Raw Water Intake & Pre-Treatment Systems | Screening & Grit Removal Systems |  |
| SRC-416 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Raw Water Intake & Pre-Treatment Systems | Oil & Grease Removal Systems |  |
| SRC-417 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Raw Water Intake & Pre-Treatment Systems | Clarifiers & Settling Systems |  |
| SRC-418 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Treatment Plants (WTP) | Conventional Water Treatment Plants |  |
| SRC-419 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Treatment Plants (WTP) | Activated Carbon Filtration Systems |  |
| SRC-420 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Treatment Plants (WTP) | Water Softening Plants |  |
| SRC-421 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Treatment Plants (WTP) | Reverse Osmosis (RO) Plants |  |
| SRC-422 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Treatment Plants (WTP) | Ultrafiltration (UF) Systems |  |
| SRC-423 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Treatment Plants (WTP) | Demineralization (DM) Plants |  |
| SRC-424 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Process & Utility Water Systems | Boiler Feed Water Treatment Systems |  |
| SRC-425 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Process & Utility Water Systems | Cooling Tower Make-Up Water Treatment |  |
| SRC-426 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Process & Utility Water Systems | High-Purity & Process Water Systems |  |
| SRC-427 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Wastewater & Effluent Treatment Plants | Domestic Sewage Treatment Plants (STP) |  |
| SRC-428 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Wastewater & Effluent Treatment Plants | Industrial Effluent Treatment Plants (ETP) |  |
| SRC-429 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Wastewater & Effluent Treatment Plants | Physico-Chemical Treatment Systems |  |
| SRC-430 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Wastewater & Effluent Treatment Plants | DAF (Dissolved Air Flotation) Systems |  |
| SRC-431 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Wastewater & Effluent Treatment Plants | Tertiary & Advanced Treatment Systems |  |
| SRC-432 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Sludge Treatment & Handling Systems | Sludge Thickening Systems |  |
| SRC-433 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Sludge Treatment & Handling Systems | Sludge Dewatering Systems |  |
| SRC-434 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Sludge Treatment & Handling Systems | Sludge Drying Systems |  |
| SRC-435 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Reuse, Recycling & ZLD Systems | Water Recycling & Reuse Systems |  |
| SRC-436 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Water Reuse, Recycling & ZLD Systems | Zero Liquid Discharge (ZLD) Systems | dup-family: ZLD also under Evaporation |
| SRC-437 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Instrumentation, Automation & Services (Water Side) | Water Treatment Instrumentation Systems |  |
| SRC-438 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Instrumentation, Automation & Services (Water Side) | PLC & SCADA for Water Systems | dup-family: PLC/SCADA |
| SRC-439 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Instrumentation, Automation & Services (Water Side) | WTP / ETP / ZLD EPC & Turnkey Projects | service |
| SRC-440 | 3 | Industrial Utilities & Plant Systems | Water, Wastewater & Effluent Treatment Systems | Instrumentation, Automation & Services (Water Side) | Operation & Maintenance (O&M) Services | service |
| SRC-441 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler & Steam Generation Systems | Industrial Steam Boilers |  |
| SRC-442 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler & Steam Generation Systems | Thermic Fluid Heaters |  |
| SRC-443 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler & Steam Generation Systems | Waste Heat Recovery Boilers (WHRB) |  |
| SRC-444 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler & Steam Generation Systems | Package & Skid-Mounted Boiler Systems |  |
| SRC-445 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Steam Distribution & Condensate Systems | Steam Piping & Distribution Systems |  |
| SRC-446 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Steam Distribution & Condensate Systems | Condensate Recovery Systems |  |
| SRC-447 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Steam Distribution & Condensate Systems | Steam Traps & Steam Accessories Systems |  |
| SRC-448 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Heat Transfer & Thermal Systems | Heat Exchangers (Process & Utility) | dup: HX under Thermal Processing too |
| SRC-449 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Heat Transfer & Thermal Systems | Hot Water Generation Systems |  |
| SRC-450 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Heat Transfer & Thermal Systems | Thermal Oil Circulation Systems |  |
| SRC-451 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Fuel Handling & Combustion Systems | Fuel Storage & Handling Systems |  |
| SRC-452 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Fuel Handling & Combustion Systems | Burners & Combustion Systems |  |
| SRC-453 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Fuel Handling & Combustion Systems | Gas Train & Fuel Supply Systems |  |
| SRC-454 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler Automation, Control & Safety | Boiler Automation & Control Panels |  |
| SRC-455 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler Automation, Control & Safety | Burner Management Systems (BMS) | abbrev-collision: BMS = Building Mgmt too |
| SRC-456 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler Automation, Control & Safety | Safety Valves & Boiler Safety Systems |  |
| SRC-457 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler EPC, Installation & Services | Boiler EPC & Turnkey Projects | service |
| SRC-458 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler EPC, Installation & Services | Boiler Installation & Commissioning | service |
| SRC-459 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler EPC, Installation & Services | Boiler Testing & Statutory Inspection | service |
| SRC-460 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler EPC, Installation & Services | Annual Maintenance Contracts (AMC) | service; repeated |
| SRC-461 | 3 | Industrial Utilities & Plant Systems | Steam, Thermal & Boiler Systems | Boiler EPC, Installation & Services | Energy Audit & Boiler Efficiency Services | service |
| SRC-462 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Generation Systems | Reciprocating Air Compressors |  |
| SRC-463 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Generation Systems | Screw Air Compressors |  |
| SRC-464 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Generation Systems | Centrifugal Air Compressors |  |
| SRC-465 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Generation Systems | Oil-Free Air Compressors |  |
| SRC-466 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Generation Systems | Portable & Skid-Mounted Compressors |  |
| SRC-467 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Treatment & Distribution | Air Dryers (Refrigerated & Desiccant) | stray L1 text in source far column (artifact) |
| SRC-468 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Treatment & Distribution | Air Receivers & Storage Tanks |  |
| SRC-469 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Treatment & Distribution | Air Filtration & Moisture Removal Systems |  |
| SRC-470 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air Treatment & Distribution | Compressed Air Piping & Distribution Systems |  |
| SRC-471 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Industrial Gas Generation & Supply Systems | Nitrogen Generation Systems |  |
| SRC-472 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Industrial Gas Generation & Supply Systems | Oxygen Generation Systems |  |
| SRC-473 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Industrial Gas Generation & Supply Systems | Industrial Gas Mixing Systems |  |
| SRC-474 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Industrial Gas Generation & Supply Systems | Gas Storage & Cylinder Manifold Systems |  |
| SRC-475 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Vacuum Generation & Systems | Vacuum Pumps (Liquid Ring, Rotary Vane, Dry) |  |
| SRC-476 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Vacuum Generation & Systems | Central Vacuum Systems |  |
| SRC-477 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Vacuum Generation & Systems | Vacuum Filtration & Suction Systems |  |
| SRC-478 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas Automation | Compressor Control & Sequencing Systems |  |
| SRC-479 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas Automation | Energy Monitoring for Compressed Air | dup-family: energy monitoring |
| SRC-480 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas Automation | Leak Detection & Air Audit Systems |  |
| SRC-481 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas EPC & Services | Compressed Air System EPC & Turnkey Projects | service |
| SRC-482 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas EPC & Services | Installation & Commissioning Services | service; repeated |
| SRC-483 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas EPC & Services | Annual Maintenance Contracts (AMC) | service; repeated |
| SRC-484 | 3 | Industrial Utilities & Plant Systems | Compressed Air, Gas & Vacuum Systems | Compressed Air & Gas EPC & Services | Energy Audit & System Optimization Services | service |
| SRC-485 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Industrial HVAC Systems | Central HVAC Systems (Chillers & AHUs) |  |
| SRC-486 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Industrial HVAC Systems | Industrial Ventilation & Exhaust Systems |  |
| SRC-487 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Industrial HVAC Systems | Precision Air Conditioning Systems |  |
| SRC-488 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Industrial HVAC Systems | Process Cooling & Heating Systems |  |
| SRC-489 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Cleanroom & Controlled Environment Systems | Cleanroom HVAC Systems |  |
| SRC-490 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Cleanroom & Controlled Environment Systems | Cleanroom Panels & Modular Cleanrooms |  |
| SRC-491 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Cleanroom & Controlled Environment Systems | Laminar Air Flow (LAF) & HEPA Filter Units |  |
| SRC-492 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Cleanroom & Controlled Environment Systems | Air Showers & Pass Boxes |  |
| SRC-493 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Temperature & Humidity Control Systems | Dehumidification Systems |  |
| SRC-494 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Temperature & Humidity Control Systems | Humidification Systems |  |
| SRC-495 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Temperature & Humidity Control Systems | Environmental Chambers (Industrial Use) |  |
| SRC-496 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Air Pollution & Emission Control Systems | Dust Collection & Fume Extraction Systems | dup-family: dust collectors x3 |
| SRC-497 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Air Pollution & Emission Control Systems | Industrial Scrubbers (Wet & Dry) | dup-family: scrubbers |
| SRC-498 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | Air Pollution & Emission Control Systems | Stack & Emission Control Systems |  |
| SRC-499 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC & Environmental Automation | Building Management Systems (BMS) | abbrev-collision: BMS |
| SRC-500 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC & Environmental Automation | HVAC Control Panels & Automation Systems |  |
| SRC-501 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC & Environmental Automation | Energy Monitoring for HVAC Systems | dup-family: energy monitoring |
| SRC-502 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC, Cleanroom & Environmental EPC & Services | HVAC & Cleanroom EPC & Turnkey Projects | service |
| SRC-503 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC, Cleanroom & Environmental EPC & Services | Installation & Commissioning Services | service; repeated |
| SRC-504 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC, Cleanroom & Environmental EPC & Services | Testing, Balancing & Validation (TAB) | service |
| SRC-505 | 3 | Industrial Utilities & Plant Systems | HVAC, Cleanroom & Environmental Control Systems | HVAC, Cleanroom & Environmental EPC & Services | Annual Maintenance Contracts (AMC) | service; repeated |
| SRC-506 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Detection & Alarm Systems | Fire Alarm Control Panels |  |
| SRC-507 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Detection & Alarm Systems | Smoke, Heat & Flame Detection Systems |  |
| SRC-508 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Detection & Alarm Systems | Manual Call Points & Alarm Devices |  |
| SRC-509 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Detection & Alarm Systems | Public Address & Voice Evacuation Systems |  |
| SRC-510 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Suppression & Firefighting Systems | Fire Sprinkler Systems |  |
| SRC-511 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Suppression & Firefighting Systems | Hydrant & Hose Reel Systems |  |
| SRC-512 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Suppression & Firefighting Systems | Gas-Based Fire Suppression Systems |  |
| SRC-513 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Suppression & Firefighting Systems | Foam-Based Fire Suppression Systems |  |
| SRC-514 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Suppression & Firefighting Systems | Portable & Mobile Fire Extinguishers | dup: Fire Extinguishers & Emergency Kits under Safety L1 |
| SRC-515 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Specialized Fire Protection Systems | Electrical & Panel Room Fire Protection |  |
| SRC-516 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Specialized Fire Protection Systems | Data Center & Server Room Fire Protection |  |
| SRC-517 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Specialized Fire Protection Systems | Kitchen Hood Fire Suppression Systems |  |
| SRC-518 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Specialized Fire Protection Systems | High Hazard & Industrial Fire Protection Systems |  |
| SRC-519 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Safety Equipment & Emergency Systems | Emergency Lighting Systems | dup: Emergency Lighting & Alarm under Safety L1 |
| SRC-520 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Safety Equipment & Emergency Systems | Exit Signs & Escape Route Systems |  |
| SRC-521 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Safety Equipment & Emergency Systems | Fireman Communication & Control Systems |  |
| SRC-522 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection Automation & Monitoring | Fire Alarm Monitoring Systems |  |
| SRC-523 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection Automation & Monitoring | Integration with BMS / SCADA | service |
| SRC-524 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection Automation & Monitoring | Remote Fire Safety Monitoring Systems |  |
| SRC-525 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection EPC & Services | Fire Protection EPC & Turnkey Projects | service |
| SRC-526 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection EPC & Services | Installation & Commissioning Services | service; repeated |
| SRC-527 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection EPC & Services | Fire Safety Audit & Compliance Services | service; dup: EHS/Fire audits under Safety L1 |
| SRC-528 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection EPC & Services | Annual Maintenance Contracts (AMC) | service; repeated |
| SRC-529 | 3 | Industrial Utilities & Plant Systems | Fire Protection & Life Safety Systems | Fire Protection EPC & Services | Fire Drill & Safety Training Services | service; dup: Safety Training under Safety L1 |
| SRC-530 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation & Control Systems | Utility PLC & SCADA Systems | dup-family: PLC/SCADA |
| SRC-531 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation & Control Systems | Distributed Utility Control Systems |  |
| SRC-532 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation & Control Systems | Utility Control Panels & RTU Systems |  |
| SRC-533 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Energy Monitoring & Management Systems | Energy Monitoring Systems (EMS) | dup-family: energy monitoring |
| SRC-534 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Energy Monitoring & Management Systems | Power & Utility Metering Systems |  |
| SRC-535 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Energy Monitoring & Management Systems | Sub-Metering & Load Monitoring Systems |  |
| SRC-536 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Energy Monitoring & Management Systems | Energy Analytics & Reporting Platforms | software-in-hardware-branch |
| SRC-537 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Performance & Optimization Systems | OEE & Utility Performance Monitoring | dup-family: OEE |
| SRC-538 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Performance & Optimization Systems | Demand Management & Peak Load Control Systems |  |
| SRC-539 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Performance & Optimization Systems | Predictive Maintenance Systems (Utility Assets) | dup-family |
| SRC-540 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Remote Monitoring & Digital Utility Platforms | Remote Utility Monitoring Systems |  |
| SRC-541 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Remote Monitoring & Digital Utility Platforms | Cloud-Based Utility Dashboards | software |
| SRC-542 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Remote Monitoring & Digital Utility Platforms | Alarm Management & Notification Systems |  |
| SRC-543 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation Integration Services | Utility Automation System Integration | service |
| SRC-544 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation Integration Services | Integration with BMS / DCS / SCADA | service |
| SRC-545 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation Integration Services | Data Acquisition & Historian Systems |  |
| SRC-546 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation EPC & Services | Utility Automation EPC & Turnkey Projects | service |
| SRC-547 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation EPC & Services | System Commissioning & Validation | service |
| SRC-548 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation EPC & Services | Annual Maintenance Contracts (AMC) | service; repeated |
| SRC-549 | 3 | Industrial Utilities & Plant Systems | Utility Automation, Monitoring & Energy Management Systems | Utility Automation EPC & Services | Energy Audit & Utility Optimization Services | service |
| SRC-550 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Civil Construction | Factory & Plant Buildings | Manufacturing & Utility Buildings | construction service (works) |
| SRC-551 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Civil Construction | Foundation & Structural Works | RCC & Steel Structural Works | construction service |
| SRC-552 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Civil Construction | Industrial Flooring & Finishing | Epoxy, PU & Heavy Duty Flooring |  |
| SRC-553 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Civil Construction | Internal Roads & Yard Development | Roads, Pavements & Drainage | construction service |
| SRC-554 | 4 | Construction, Civil & Industrial Infrastructure | Pre-Engineered & Modular Structures | Pre-Engineered Buildings (PEB) | Industrial & Warehouse Sheds |  |
| SRC-555 | 4 | Construction, Civil & Industrial Infrastructure | Pre-Engineered & Modular Structures | Steel & Modular Structures | Steel Structures & Modular Buildings |  |
| SRC-556 | 4 | Construction, Civil & Industrial Infrastructure | Pre-Engineered & Modular Structures | Mezzanine & Access Structures | Mezzanine Floors & Platforms |  |
| SRC-557 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Roofing, Cladding & Insulation | Roofing Systems | Metal & Insulated Roofing |  |
| SRC-558 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Roofing, Cladding & Insulation | Wall Cladding Systems | Metal & Composite Cladding |  |
| SRC-559 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Roofing, Cladding & Insulation | Insulation & Waterproofing | Thermal Insulation & Waterproofing |  |
| SRC-560 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Utilities & Infrastructure Works | Drainage & Underground Works | Storm Water & Sewerage Systems | construction service |
| SRC-561 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Utilities & Infrastructure Works | Piping & Ducting Infrastructure | Underground Piping & Cable Ducts | construction service |
| SRC-562 | 4 | Construction, Civil & Industrial Infrastructure | Industrial Utilities & Infrastructure Works | Site Development Works | Boundary, Fencing & External Works | construction service |
| SRC-563 | 4 | Construction, Civil & Industrial Infrastructure | Construction Machinery & EPC Services | Construction Machinery | Earthmoving, Concrete & Lifting Equipment |  |
| SRC-564 | 4 | Construction, Civil & Industrial Infrastructure | Construction Machinery & EPC Services | Construction EPC & PMC | Turnkey Construction & PMC Services | service |
| SRC-565 | 5 | Material Handling, Storage & Logistics | Material Handling Equipment | Lifting & Handling Equipment | Forklifts, Stackers & Pallet Trucks |  |
| SRC-566 | 5 | Material Handling, Storage & Logistics | Material Handling Equipment | Conveying Systems | Belt, Roller & Screw Conveyors | dup: conveyors also under Bulk Processing |
| SRC-567 | 5 | Material Handling, Storage & Logistics | Material Handling Equipment | Cranes & Hoists | Overhead, Gantry & Jib Cranes |  |
| SRC-568 | 5 | Material Handling, Storage & Logistics | Warehousing & Storage Systems | Racking & Shelving Systems | Pallet Racking & Industrial Shelving |  |
| SRC-569 | 5 | Material Handling, Storage & Logistics | Warehousing & Storage Systems | Bulk Storage Systems | Silos, Bins & Storage Tanks | dup: silos/bins/tanks also under Bulk Processing + Liquid Storage |
| SRC-570 | 5 | Material Handling, Storage & Logistics | Warehousing & Storage Systems | Warehouse Automation | ASRS & Automated Storage Systems |  |
| SRC-571 | 5 | Material Handling, Storage & Logistics | Packaging, Loading & Dispatch Systems | Palletizing & Wrapping Systems | Pallet Wrappers & Strapping Machines | dup: stretch wrappers under Packaging Machinery |
| SRC-572 | 5 | Material Handling, Storage & Logistics | Packaging, Loading & Dispatch Systems | Loading Dock Equipment | Dock Levelers & Dock Shelters |  |
| SRC-573 | 5 | Material Handling, Storage & Logistics | Packaging, Loading & Dispatch Systems | Transit Packaging Systems | Industrial Packaging & Crating |  |
| SRC-574 | 5 | Material Handling, Storage & Logistics | Logistics, Transportation & EPC Services | In-Plant Logistics Systems | Intralogistics & Material Flow Systems |  |
| SRC-575 | 5 | Material Handling, Storage & Logistics | Logistics, Transportation & EPC Services | Transportation & Fleet Solutions | Industrial Transport & Fleet Services | service |
| SRC-576 | 5 | Material Handling, Storage & Logistics | Logistics, Transportation & EPC Services | Logistics EPC & Services | Turnkey Material Handling & Logistics Projects | service |
| SRC-577 | 6 | Quality, Lab & Testing | Quality Control & Inspection Equipment | Dimensional & Visual Inspection | Calipers, Micrometers & Gauges | dup: also under MRO Tools measuring |
| SRC-578 | 6 | Quality, Lab & Testing | Quality Control & Inspection Equipment | NDT & Material Inspection | Ultrasonic, Magnetic & Radiography Testing |  |
| SRC-579 | 6 | Quality, Lab & Testing | Laboratory Testing Equipment | Analytical & Chemical Testing | Spectrophotometers & Chromatographs |  |
| SRC-580 | 6 | Quality, Lab & Testing | Laboratory Testing Equipment | Physical & Mechanical Testing | UTM, Hardness & Impact Testers |  |
| SRC-581 | 6 | Quality, Lab & Testing | Process & Inline Quality Systems | Inline Inspection Systems | Vision Inspection & Checkweighers | dup: also under Packaging Inspection |
| SRC-582 | 6 | Quality, Lab & Testing | Process & Inline Quality Systems | Process Monitoring Systems | Online Sensors & Analyzers |  |
| SRC-583 | 6 | Quality, Lab & Testing | Calibration & Measurement Services | Calibration Equipment | Calibration Instruments & Standards |  |
| SRC-584 | 6 | Quality, Lab & Testing | Calibration & Measurement Services | Calibration Services | Lab & On-Site Calibration Services | service |
| SRC-585 | 6 | Quality, Lab & Testing | Testing, Certification & QA Services | Third-Party Testing Services | Material, Product & Compliance Testing | service |
| SRC-586 | 6 | Quality, Lab & Testing | Testing, Certification & QA Services | Audit, Validation & Certification | ISO, GMP & Quality Audits | service; dup: ISO/GMP under Business Services too |
| SRC-587 | 7 | Safety, Security & Environmental | Industrial Safety Equipment | Personal Protective Equipment (PPE) | Helmets, Gloves, Shoes & Safety Wear |  |
| SRC-588 | 7 | Safety, Security & Environmental | Industrial Safety Equipment | Workplace Safety Systems | Safety Barriers, Signage & Guarding |  |
| SRC-589 | 7 | Safety, Security & Environmental | Fire & Emergency Safety Systems | Fire Safety Equipment | Fire Extinguishers & Emergency Kits | dup: fire extinguishers under Fire Protection L2 |
| SRC-590 | 7 | Safety, Security & Environmental | Fire & Emergency Safety Systems | Emergency Response Systems | Emergency Lighting & Alarm Systems | dup: emergency lighting under Fire Protection L2 |
| SRC-591 | 7 | Safety, Security & Environmental | Industrial Security Systems | Surveillance & Access Control | CCTV, Access Control & Time Attendance |  |
| SRC-592 | 7 | Safety, Security & Environmental | Industrial Security Systems | Perimeter & Asset Security | Fencing, Bollards & Security Barriers | dup-family: fencing under Construction Site Dev too |
| SRC-593 | 7 | Safety, Security & Environmental | Environmental Protection Systems | Pollution Control Equipment | Dust Collectors & Scrubber Systems | dup: dust collectors/scrubbers x3 |
| SRC-594 | 7 | Safety, Security & Environmental | Environmental Protection Systems | Environmental Monitoring | Air, Water & Noise Monitoring Systems |  |
| SRC-595 | 7 | Safety, Security & Environmental | Safety, Security & Environmental Services | Safety & Environmental Audits | EHS, Fire & Compliance Audits | service; dup: fire audits under Fire Protection |
| SRC-596 | 7 | Safety, Security & Environmental | Safety, Security & Environmental Services | Training & Compliance Services | Safety Training & Environmental Compliance | service; dup: fire/safety training |
| SRC-597 | 8 | IT, OT & Industrial Software | Industrial IT Infrastructure | IT Hardware & Networking | Servers, Storage & Industrial Networking |  |
| SRC-598 | 8 | IT, OT & Industrial Software | Industrial IT Infrastructure | Data Center & Cloud Infrastructure | Industrial Data Centers & Cloud Services |  |
| SRC-599 | 8 | IT, OT & Industrial Software | Industrial OT & Control Systems | Industrial Control Hardware | PLC, RTU & Industrial Controllers | dup-family: PLC/SCADA |
| SRC-600 | 8 | IT, OT & Industrial Software | Industrial OT & Control Systems | Supervisory & Control Systems | SCADA & HMI Systems | dup-family: PLC/SCADA |
| SRC-601 | 8 | IT, OT & Industrial Software | Manufacturing & Operations Software | Manufacturing Software | MES & Production Management Systems |  |
| SRC-602 | 8 | IT, OT & Industrial Software | Manufacturing & Operations Software | Asset & Maintenance Software | CMMS & Asset Management Systems |  |
| SRC-603 | 8 | IT, OT & Industrial Software | Business & Enterprise Software | Enterprise Systems | ERP, SCM & Inventory Management Software |  |
| SRC-604 | 8 | IT, OT & Industrial Software | Business & Enterprise Software | Quality & Compliance Software | QMS & Compliance Management Systems |  |
| SRC-605 | 8 | IT, OT & Industrial Software | Cybersecurity, Integration & Services | Industrial Cybersecurity | OT Security & Network Protection Systems |  |
| SRC-606 | 8 | IT, OT & Industrial Software | Cybersecurity, Integration & Services | System Integration & Services | System Integration, Deployment & AMC Services | service |
| SRC-607 | 9 | Business, Engineering & Professional Services | Engineering & Technical Services | Design & Engineering Services | Process, Mechanical & Electrical Engineering | service |
| SRC-608 | 9 | Business, Engineering & Professional Services | Engineering & Technical Services | Project Engineering Services | Detailed Engineering & Technical Documentation | service |
| SRC-609 | 9 | Business, Engineering & Professional Services | EPC, Project & Construction Services | EPC & Turnkey Services | EPC & Turnkey Industrial Projects | service; dup: domain EPC nodes x8 |
| SRC-610 | 9 | Business, Engineering & Professional Services | EPC, Project & Construction Services | Project Management & PMC | Project Management & PMC Services | service; dup: Construction PMC |
| SRC-611 | 9 | Business, Engineering & Professional Services | Compliance, Legal & Certification Services | Regulatory & Compliance Services | Licensing, Statutory & Regulatory Approvals | service |
| SRC-612 | 9 | Business, Engineering & Professional Services | Compliance, Legal & Certification Services | Audit & Certification Services | ISO, GMP & Industry Certifications | service; dup: ISO/GMP audits under Quality |
| SRC-613 | 9 | Business, Engineering & Professional Services | Business, Financial & Commercial Services | Financial & Advisory Services | Financial Advisory & Project Finance | service |
| SRC-614 | 9 | Business, Engineering & Professional Services | Business, Financial & Commercial Services | Procurement & Sourcing Services | Global Sourcing & Vendor Development | service |
| SRC-615 | 9 | Business, Engineering & Professional Services | HR, Training & Support Services | Human Resource Services | Manpower Supply & Recruitment Services | service |
| SRC-616 | 9 | Business, Engineering & Professional Services | HR, Training & Support Services | Training & Skill Development | Technical, Safety & Compliance Training | service; dup: safety training x3 |
| SRC-617 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Bearings & Power Transmission | Ball, Roller & Thrust Bearings | dup: Bearings & Housings in flat block 13 |
| SRC-618 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Bearings & Power Transmission | Gearboxes, Gear Motors & Speed Reducers |  |
| SRC-619 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Bearings & Power Transmission | Couplings, Chains & Sprockets | dup: Chains & Sprockets in flat block 13 |
| SRC-620 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Bearings & Power Transmission | Pulleys, Belts & Bushes | dup: Belts & Pulleys in flat block 13 |
| SRC-621 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Sealing, Wear & Replacement Parts | Oil Seals, O-Rings & Gaskets | dup: Fluid Control Spares in flat block 13 |
| SRC-622 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Sealing, Wear & Replacement Parts | Wear Plates, Liners & Wear Strips | dup: Wear Plates under Crusher Spares |
| SRC-623 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Sealing, Wear & Replacement Parts | Bushes, Sleeves & Guide Rails |  |
| SRC-624 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Fasteners & Mechanical Hardware | Bolts, Nuts, Washers & Studs |  |
| SRC-625 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Fasteners & Mechanical Hardware | Industrial Screws, Anchors & Rivets |  |
| SRC-626 | 10 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Fasteners & Mechanical Hardware | Springs, Pins & Mechanical Locks |  |
| SRC-627 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Electrical Components & Panels | MCB, MCCB, ACB & Fuse Systems |  |
| SRC-628 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Electrical Components & Panels | Contactors, Relays & Overload Relays | dup: Switchgear Spares in flat block 13 |
| SRC-629 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Electrical Components & Panels | Push Buttons, Indicators & Switchgear |  |
| SRC-630 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Automation & Control Spares | PLC Modules, I/O Cards & Racks |  |
| SRC-631 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Automation & Control Spares | HMI Panels & Operator Interfaces |  |
| SRC-632 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Automation & Control Spares | VFDs, Servo Drives & Controllers | dup: Variable Speed Drives in flat block 13 |
| SRC-633 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Cabling & Power Accessories | Power, Control & Instrumentation Cables |  |
| SRC-634 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Cabling & Power Accessories | Cable Glands, Lugs, Ferrules & Connectors |  |
| SRC-635 | 10 | MRO, Spares & Industrial Consumables | Electrical & Automation Spares | Cabling & Power Accessories | Cable Trays, Trunking & Raceway Accessories |  |
| SRC-636 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Hydraulic Components | Hydraulic Pumps, Motors & Cylinders |  |
| SRC-637 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Hydraulic Components | Hydraulic Valves, Manifolds & Power Packs |  |
| SRC-638 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Hydraulic Components | Hydraulic Hoses, Pipes & Fittings |  |
| SRC-639 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Pneumatic Components | Air Cylinders, Actuators & Grippers |  |
| SRC-640 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Pneumatic Components | Solenoid Valves, Directional Valves & FRL Units |  |
| SRC-641 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Pneumatic Components | Pneumatic Tubes, Push Fittings & Accessories |  |
| SRC-642 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Compressed Air & Vacuum Accessories | Air Filters, Oil Separators & Dryer Elements |  |
| SRC-643 | 10 | MRO, Spares & Industrial Consumables | Hydraulic, Pneumatic & Fluid Power Spares | Compressed Air & Vacuum Accessories | Vacuum Pumps Spares & Suction Accessories |  |
| SRC-644 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Lubricants, Oils & Maintenance Chemicals | Industrial Oils, Greases & Lubricants |  |
| SRC-645 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Lubricants, Oils & Maintenance Chemicals | Cutting Fluids, Coolants & Rust Preventives |  |
| SRC-646 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Lubricants, Oils & Maintenance Chemicals | Cleaning, Degreasing & Descaling Chemicals | dup-family: cleaning chemicals under Raw Materials chemicals |
| SRC-647 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Welding, Cutting & Fabrication Consumables | Welding Electrodes, MIG/TIG Wires & Flux |  |
| SRC-648 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Welding, Cutting & Fabrication Consumables | Gas Cutting Nozzles, Tips & Accessories |  |
| SRC-649 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Welding, Cutting & Fabrication Consumables | Abrasives, Grinding Wheels & Cutting Discs |  |
| SRC-650 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Packaging, Housekeeping & Plant Consumables | Industrial Tapes, Films & Strapping Materials |  |
| SRC-651 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Packaging, Housekeeping & Plant Consumables | Wipers, Rags, Absorbents & Spill Kits |  |
| SRC-652 | 10 | MRO, Spares & Industrial Consumables | Industrial Consumables | Packaging, Housekeeping & Plant Consumables | Adhesives, Sealants & Industrial Tapes | dup: Adhesives/Sealants under Raw Materials; tapes repeated within sibling |
| SRC-653 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Hand, Power & Pneumatic Tools | Hand Tools (Spanners, Pliers, Hammers) |  |
| SRC-654 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Hand, Power & Pneumatic Tools | Electric, Pneumatic & Cordless Power Tools |  |
| SRC-655 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Hand, Power & Pneumatic Tools | Tool Bits, Blades & Accessories |  |
| SRC-656 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Measuring, Testing & Portable Instruments | Calipers, Micrometers & Dial Gauges | dup: Calipers under Quality L1 |
| SRC-657 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Measuring, Testing & Portable Instruments | Multimeters, Clamp Meters & Testers |  |
| SRC-658 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Workshop, Stores & Maintenance Supplies | Tool Cabinets, Workbenches & Storage Systems |  |
| SRC-659 | 10 | MRO, Spares & Industrial Consumables | Tools, Instruments & Workshop Supplies | Workshop, Stores & Maintenance Supplies | Maintenance Kits, LOTO Devices & Safety Tags |  |
| SRC-660 | 10 | MRO, Spares & Industrial Consumables | OEM, Machine-Specific & Critical Spares | OEM & Authorized Spare Parts | Original OEM Spare Parts | sourcing-attribute-as-category |
| SRC-661 | 10 | MRO, Spares & Industrial Consumables | OEM, Machine-Specific & Critical Spares | OEM & Authorized Spare Parts | Authorized Compatible Spare Parts | sourcing-attribute-as-category |
| SRC-662 | 10 | MRO, Spares & Industrial Consumables | OEM, Machine-Specific & Critical Spares | Critical & Breakdown Spares | Critical Machine Replacement Parts | urgency-attribute-as-category |
| SRC-663 | 10 | MRO, Spares & Industrial Consumables | OEM, Machine-Specific & Critical Spares | Critical & Breakdown Spares | Emergency Breakdown Spares | urgency-attribute-as-category |
| SRC-664 | 10 | MRO, Spares & Industrial Consumables | OEM, Machine-Specific & Critical Spares | Planned Maintenance & Shutdown Kits | Preventive Maintenance Spare Kits |  |
| SRC-665 | 10 | MRO, Spares & Industrial Consumables | OEM, Machine-Specific & Critical Spares | Planned Maintenance & Shutdown Kits | Shutdown & Overhaul Spare Sets |  |
| SRC-666 | 10 | MRO, Spares & Industrial Consumables | MRO Supply, Inventory & Support Programs | MRO Supply & Contract Models | Industrial MRO Supply Contracts | service |
| SRC-667 | 10 | MRO, Spares & Industrial Consumables | MRO Supply, Inventory & Support Programs | MRO Supply & Contract Models | Rate Contract & Annual Supply Agreements | service |
| SRC-668 | 10 | MRO, Spares & Industrial Consumables | MRO Supply, Inventory & Support Programs | Inventory, Stores & Vendor Management | MRO Inventory Management Services | service |
| SRC-669 | 10 | MRO, Spares & Industrial Consumables | MRO Supply, Inventory & Support Programs | Inventory, Stores & Vendor Management | Vendor Managed Inventory (VMI) | service |
| SRC-670 | 10 | MRO, Spares & Industrial Consumables | MRO Supply, Inventory & Support Programs | Inventory, Stores & Vendor Management | Just-In-Time (JIT) MRO Supply Programs | service |
| SRC-671 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Mild Steel (MS) Materials | dup-L1 block 2; header row (source lost a level) |
| SRC-672 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | MS Shaft |  |
| SRC-673 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | MS Round Bar |  |
| SRC-674 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | MS Flat |  |
| SRC-675 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | MS Plate |  |
| SRC-676 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | MS Angle |  |
| SRC-677 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | MS Channel |  |
| SRC-678 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Alloy & Carbon Steel Materials | header row (lost level) |
| SRC-679 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Alloy Steel Bars & Shafts |  |
| SRC-680 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Carbon Steel Plates & Flats |  |
| SRC-681 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Stainless Steel Materials | header row (lost level) |
| SRC-682 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Stainless Steel Rods & Shafts |  |
| SRC-683 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Stainless Steel Plates & Flats |  |
| SRC-684 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Non-Ferrous Workshop Materials | header row (lost level) |
| SRC-685 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Aluminium Rods & Plates |  |
| SRC-686 | 11 | MRO, Spares & Industrial Consumables | Mechanical Spares & Components | Semi-Finished Engineering Materials | Brass & Copper Rods |  |
| SRC-687 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Spindle | dup-L1 block 3 |
| SRC-688 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Spindle Tape |  |
| SRC-689 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Spinning Ring |  |
| SRC-690 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Ring Traveller |  |
| SRC-691 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Bobbin |  |
| SRC-692 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Apron |  |
| SRC-693 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Spinning Machine Spares | Spinning Cloth / Tula | local-term (BD) |
| SRC-694 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Carding & Combing Machine Spares | Card Clothing |  |
| SRC-695 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Carding & Combing Machine Spares | Comber Parts |  |
| SRC-696 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Weaving & Knitting Machine Spares | Reeds & Heald Wires |  |
| SRC-697 | 12 | MRO, Spares & Industrial Consumables | Textile & Spinning Machine Spares | Weaving & Knitting Machine Spares | Needles & Sinkers |  |
| SRC-698 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Cement Plant Machine Spares | Mill Liners |  |
| SRC-699 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Cement Plant Machine Spares | Grinding Media |  |
| SRC-700 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Cement Plant Machine Spares | Kiln Tyres & Rollers |  |
| SRC-701 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Cement Plant Machine Spares | Girth Gears |  |
| SRC-702 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Cement Plant Machine Spares | Burner Nozzles |  |
| SRC-703 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Crusher & Material Processing Spares | Jaw Plates |  |
| SRC-704 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Crusher & Material Processing Spares | Impact Hammers |  |
| SRC-705 | 12 | MRO, Spares & Industrial Consumables | Cement & Building Material Machine Spares | Crusher & Material Processing Spares | Wear Plates | dup: Wear Plates under Sealing/Wear parts |
| SRC-706 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Food Processing Machine Spares | Blades & Knives |  |
| SRC-707 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Food Processing Machine Spares | Screens & Sieves |  |
| SRC-708 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Food Processing Machine Spares | Seals & Gaskets (Food Grade) | attribute-in-name (food grade) |
| SRC-709 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Food Processing Machine Spares | Conveyor Belts (Food Grade) | attribute-in-name |
| SRC-710 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Packaging & Filling Line Spares | Sealing Jaws |  |
| SRC-711 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Packaging & Filling Line Spares | Filling Nozzles |  |
| SRC-712 | 12 | MRO, Spares & Industrial Consumables | Food & Beverage Processing Machine Spares | Packaging & Filling Line Spares | Capping Heads |  |
| SRC-713 | 12 | MRO, Spares & Industrial Consumables | Pharmaceutical & Chemical Machine Spares | Pharma Production Machine Spares | Punches & Dies |  |
| SRC-714 | 12 | MRO, Spares & Industrial Consumables | Pharmaceutical & Chemical Machine Spares | Pharma Production Machine Spares | Tablet Compression Tooling |  |
| SRC-715 | 12 | MRO, Spares & Industrial Consumables | Pharmaceutical & Chemical Machine Spares | Pharma Production Machine Spares | Coating Pan Parts |  |
| SRC-716 | 12 | MRO, Spares & Industrial Consumables | Pharmaceutical & Chemical Machine Spares | Pharma Production Machine Spares | Granulator Screens |  |
| SRC-717 | 12 | MRO, Spares & Industrial Consumables | Pharmaceutical & Chemical Machine Spares | Chemical Process Machine Spares | Agitator Blades |  |
| SRC-718 | 12 | MRO, Spares & Industrial Consumables | Pharmaceutical & Chemical Machine Spares | Chemical Process Machine Spares | Reactor Seals & Liners |  |
| SRC-719 | 12 | MRO, Spares & Industrial Consumables | Plastics & Injection Molding Machine Spares | Injection Molding Machine Spares | Screw & Barrel |  |
| SRC-720 | 12 | MRO, Spares & Industrial Consumables | Plastics & Injection Molding Machine Spares | Injection Molding Machine Spares | Nozzle Tips |  |
| SRC-721 | 12 | MRO, Spares & Industrial Consumables | Plastics & Injection Molding Machine Spares | Injection Molding Machine Spares | Heater Bands |  |
| SRC-722 | 12 | MRO, Spares & Industrial Consumables | Plastics & Injection Molding Machine Spares | Injection Molding Machine Spares | Tie Bar Nuts |  |
| SRC-723 | 12 | MRO, Spares & Industrial Consumables | Plastics & Injection Molding Machine Spares | Extrusion & Blow Molding Spares | Die Heads |  |
| SRC-724 | 12 | MRO, Spares & Industrial Consumables | Plastics & Injection Molding Machine Spares | Extrusion & Blow Molding Spares | Calibration Sleeves |  |
| SRC-725 | 12 | MRO, Spares & Industrial Consumables | Packaging & Printing Machine Spares | Packaging Machine Spares | Cutting Blades |  |
| SRC-726 | 12 | MRO, Spares & Industrial Consumables | Packaging & Printing Machine Spares | Packaging Machine Spares | Teflon Belts |  |
| SRC-727 | 12 | MRO, Spares & Industrial Consumables | Packaging & Printing Machine Spares | Packaging Machine Spares | Guide Rollers |  |
| SRC-728 | 12 | MRO, Spares & Industrial Consumables | Packaging & Printing Machine Spares | Printing Machine Spares | Print Rollers |  |
| SRC-729 | 12 | MRO, Spares & Industrial Consumables | Packaging & Printing Machine Spares | Printing Machine Spares | Doctor Blades |  |
| SRC-730 | 12 | MRO, Spares & Industrial Consumables | Metal, CNC & Fabrication Machine Spares | CNC Machine Spares | Ball Screws |  |
| SRC-731 | 12 | MRO, Spares & Industrial Consumables | Metal, CNC & Fabrication Machine Spares | CNC Machine Spares | Linear Guides |  |
| SRC-732 | 12 | MRO, Spares & Industrial Consumables | Metal, CNC & Fabrication Machine Spares | CNC Machine Spares | Spindle Motors |  |
| SRC-733 | 12 | MRO, Spares & Industrial Consumables | Metal, CNC & Fabrication Machine Spares | Fabrication & Workshop Machine Spares | Welding Torches |  |
| SRC-734 | 12 | MRO, Spares & Industrial Consumables | Metal, CNC & Fabrication Machine Spares | Fabrication & Workshop Machine Spares | Cutting Nozzles | dup: Gas Cutting Nozzles under Consumables |
| SRC-735 | 12 | MRO, Spares & Industrial Consumables | Metal, CNC & Fabrication Machine Spares | Fabrication & Workshop Machine Spares | Chuck Jaws |  |
| SRC-736 | 12 | MRO, Spares & Industrial Consumables | Utility & Plant Equipment Spares | Boiler & Thermal System Spares | Boiler Tubes |  |
| SRC-737 | 12 | MRO, Spares & Industrial Consumables | Utility & Plant Equipment Spares | Boiler & Thermal System Spares | Burner Spares |  |
| SRC-738 | 12 | MRO, Spares & Industrial Consumables | Utility & Plant Equipment Spares | Boiler & Thermal System Spares | Refractory Components |  |
| SRC-739 | 12 | MRO, Spares & Industrial Consumables | Utility & Plant Equipment Spares | Compressor & Pump Spares | Impellers | dup: Pump Components impellers in flat block 13 |
| SRC-740 | 12 | MRO, Spares & Industrial Consumables | Utility & Plant Equipment Spares | Compressor & Pump Spares | Shafts & Sleeves |  |
| SRC-741 | 12 | MRO, Spares & Industrial Consumables | Utility & Plant Equipment Spares | Compressor & Pump Spares | Seal Kits |  |
| SRC-742 | 13 | MRO, Spares & Industrial Consumables | Motors & Drive Spares | AC & DC Motors | Single Phase, Three Phase, Gear Motors | flat-format block; dup-L1 block 4 |
| SRC-743 | 13 | MRO, Spares & Industrial Consumables | Motors & Drive Spares | Motor Components | Carbon Brushes, Capacitors, Cooling Fans |  |
| SRC-744 | 13 | MRO, Spares & Industrial Consumables | Motors & Drive Spares | Variable Speed Drives | VFDs, Soft Starters, Motor Controllers | dup: VFDs Servo Drives & Controllers block 10 |
| SRC-745 | 13 | MRO, Spares & Industrial Consumables | Pump & Fluid Handling Spares | Industrial Pumps | Centrifugal, Submersible, Diaphragm Pumps | dup: pumps under Liquid Processing (whole machines in spares branch) |
| SRC-746 | 13 | MRO, Spares & Industrial Consumables | Pump & Fluid Handling Spares | Pump Components | Mechanical Seals, Impellers, Pump Shafts | dup: Compressor & Pump Spares block 12 |
| SRC-747 | 13 | MRO, Spares & Industrial Consumables | Pump & Fluid Handling Spares | Fluid Control Spares | Gaskets, O-Rings, Gland Packings | dup: Oil Seals O-Rings & Gaskets block 10 |
| SRC-748 | 13 | MRO, Spares & Industrial Consumables | Power Transmission Spares | Belts & Pulleys | V-Belts, Timing Belts, Taper Lock Pulleys | dup: Pulleys Belts & Bushes block 10 |
| SRC-749 | 13 | MRO, Spares & Industrial Consumables | Power Transmission Spares | Chains & Sprockets | Roller Chains, Conveyor Chains, Sprockets | dup: Couplings Chains & Sprockets block 10 |
| SRC-750 | 13 | MRO, Spares & Industrial Consumables | Power Transmission Spares | Bearings & Housings | Ball Bearings, Roller Bearings, Pillow Blocks | dup: Ball Roller & Thrust Bearings block 10 |
| SRC-751 | 13 | MRO, Spares & Industrial Consumables | Electrical MRO | Switchgear Spares | Contactors, Relays, Circuit Breaker Spares | dup: Contactors Relays & Overload Relays block 10 |

## Appendix B — Old → new mapping (751 rows, machine-verified)

**Dispositions:** MAP = 1:1 move/rename · MERGE = collapses with siblings into target ·
SPLIT = grouped source lands in multiple targets (`;`-separated, primary first) · ATTRIBUTE =
concept becomes an attribute/synonym of target · SERVICE = relocated to Industrial Services ·
RETIRE = no successor concept (residual demand noted).

**Intermediate-node rule:** source L1/L2/L3 containers are dispositioned by derivation — a
container follows the union of its leaves' targets (dissolves when leaves scatter; renames when
they move together). This yields exactly-once coverage of all 1,078 source nodes without a
second hand-maintained table.

| id | source leaf | disposition | target(s) | reason |
|---|---|---|---|---|
| SRC-001 | Acids (Sulphuric, Hydrochloric, Nitric, Phosphoric) | MAP | `industrial-acids` | acid types become attributes/synonyms |
| SRC-002 | Alkalis (Caustic Soda, Soda Ash) | MAP | `industrial-alkalis` | caustic soda/soda ash become synonyms |
| SRC-003 | General Industrial Chemicals | MAP | `general-industrial-chemicals` | direct 1:1 match |
| SRC-004 | Hydrocarbon Solvents | MAP | `hydrocarbon-solvents` | direct 1:1 match |
| SRC-005 | Ketone Solvents | MAP | `ketone-solvents` | direct 1:1 match |
| SRC-006 | Industrial Alcohols | MAP | `industrial-alcohols` | direct 1:1 match |
| SRC-007 | Boiler & Cooling Tower Chemicals | MAP | `boiler-cooling-chemicals` | direct 1:1 match |
| SRC-008 | WTP / ETP Chemicals | MAP | `wtp-etp-chemicals` | direct 1:1 match |
| SRC-009 | RO & Membrane Chemicals | MAP | `ro-membrane-chemicals` | direct 1:1 match |
| SRC-010 | Textile Dyes | MAP | `textile-dyes` | direct 1:1 match |
| SRC-011 | Pigments (Organic / Inorganic) | MAP | `pigments` | organic/inorganic becomes attribute |
| SRC-012 | Printing Inks & Pastes | MAP | `printing-inks-pastes` | direct 1:1 match |
| SRC-013 | Industrial Adhesives | MAP | `industrial-adhesives` | direct 1:1 match |
| SRC-014 | Sealants | MAP | `industrial-sealants` | renamed to Industrial Sealants |
| SRC-015 | Synthetic Resins | MAP | `synthetic-resins` | direct 1:1 match |
| SRC-016 | Textile Auxiliaries | MAP | `textile-auxiliaries` | direct 1:1 match |
| SRC-017 | Plastic Additives | MAP | `plastic-additives` | direct 1:1 match |
| SRC-018 | Paint & Coating Additives | MAP | `paint-coating-additives` | direct 1:1 match |
| SRC-019 | PP, PE, PVC, PET | SPLIT | `polypropylene-pp;polyethylene-pe;pvc-resin;pet-resin` | grouped row split across four polymer leaves |
| SRC-020 | ABS, PC, Nylon, PS | SPLIT | `abs-resin;polycarbonate;nylon-polyamide;polystyrene` | grouped row split across four engineering plastics |
| SRC-021 | EVA, TPE, Synthetic Rubber | MAP | `elastomers-rubber` | EVA/TPE/synthetic rubber become attributes/synonyms |
| SRC-022 | Recycled PP / PE / PET | MAP | `recycled-polymers` | PP/PE/PET becomes attribute |
| SRC-023 | Pig Iron, Sponge Iron | MAP | `pig-sponge-iron` | direct 1:1 match |
| SRC-024 | HR / CR / GI Coils & Sheets | MAP | `steel-coils-sheets` | HR/CR/GI becomes attribute/synonyms |
| SRC-025 | Aluminium | MAP | `aluminium-metal` | direct 1:1 match |
| SRC-026 | Copper | MAP | `copper-metal` | direct 1:1 match |
| SRC-027 | Zinc, Lead | SPLIT | `zinc-metal;lead-metal` | grouped row split into two metal leaves |
| SRC-028 | Ferro Manganese, Ferro Silicon | MAP | `ferro-alloys` | FeMn/FeSi become attributes/synonyms |
| SRC-029 | Brass, Bronze | MAP | `brass-bronze` | direct 1:1 match |
| SRC-030 | Limestone, Dolomite | MAP | `limestone-dolomite` | direct 1:1 match |
| SRC-031 | Silica Sand, Quartz | MAP | `silica-quartz` | direct 1:1 match |
| SRC-032 | Kaolin, Ball Clay | MERGE | `kaolin-clays` | merges with construction Clay row SRC-067 |
| SRC-033 | Coal (Industrial Grade) | MAP | `industrial-coal` | direct 1:1 match |
| SRC-034 | Iron Ore | MAP | `iron-ore` | direct 1:1 match |
| SRC-035 | Bauxite | MAP | `bauxite` | direct 1:1 match |
| SRC-036 | Raw Cotton, Cotton Yarn | SPLIT | `raw-cotton;cotton-yarn` | fiber and yarn are separate leaves |
| SRC-037 | Jute Fiber & Yarn | SPLIT | `jute-fiber;jute-yarn` | fiber and yarn are separate leaves |
| SRC-038 | Polyester Fiber & Yarn | SPLIT | `synthetic-fibers;polyester-yarn` | fiber part attribute of synthetic-fibers; yarn separate |
| SRC-039 | Nylon, Viscose | MERGE | `synthetic-fibers` | nylon/viscose fibers become attributes; joins SRC-038 |
| SRC-040 | PC, CVC, Spandex | MERGE | `blended-specialty-yarns` | PC/CVC/spandex attributes; merges dup SRC-054 |
| SRC-041 | Woven Greige Fabric | MERGE | `greige-fabric` | woven becomes attribute; dup L3s collapse |
| SRC-042 | Knitted Greige Fabric | MERGE | `greige-fabric` | knitted becomes attribute; dup L3s collapse |
| SRC-043 | Greige Fabric | MERGE | `greige-fabric` | duplicate L4 of Greige Fabric L3 |
| SRC-044 | Woven Fabric | MAP | `woven-fabric` | direct 1:1 match |
| SRC-045 | Knitted Fabric | MAP | `knitted-fabric` | direct 1:1 match |
| SRC-046 | Denim Fabric | MAP | `denim-fabric` | direct 1:1 match |
| SRC-047 | Buttons | MAP | `buttons` | direct 1:1 match |
| SRC-048 | Zippers | MAP | `zippers` | direct 1:1 match |
| SRC-049 | Hooks & Eyelets | MAP | `hooks-eyelets` | direct 1:1 match |
| SRC-050 | Elastic Tapes | MAP | `elastic-tapes` | direct 1:1 match |
| SRC-051 | Labels & Tags | MAP | `labels-tags` | direct 1:1 match |
| SRC-052 | Cotton Yarn | MERGE | `cotton-yarn` | dup of SRC-036 yarn concept |
| SRC-053 | Polyester Yarn | MERGE | `polyester-yarn` | dup of SRC-038 yarn concept |
| SRC-054 | Blended Yarns | MERGE | `blended-specialty-yarns` | dup of SRC-040 blended yarns |
| SRC-055 | Wheat, Maize, Rice | MAP | `grains-cereals` | wheat/maize/rice become attributes |
| SRC-056 | Crude Vegetable Oils | MAP | `crude-vegetable-oils` | direct 1:1 match |
| SRC-057 | Paraffin Wax | MAP | `industrial-waxes` | paraffin becomes synonym |
| SRC-058 | Raw Sugar, Molasses | MAP | `sugar-molasses` | direct 1:1 match |
| SRC-059 | Industrial Starch | MAP | `industrial-starch` | direct 1:1 match |
| SRC-060 | Milk Powder, Whey | MAP | `dairy-ingredients` | milk powder/whey become synonyms |
| SRC-061 | Enzymes & Yeast | MAP | `enzymes-yeast` | direct 1:1 match |
| SRC-062 | Soybean Meal, Fish Meal | MAP | `animal-feed-ingredients` | soybean/fish meal become synonyms |
| SRC-063 | Clinker, Gypsum | MAP | `clinker-gypsum` | direct 1:1 match |
| SRC-064 | Fly Ash, Slag | MAP | `fly-ash-slag` | direct 1:1 match |
| SRC-065 | Stone, Sand | MAP | `aggregates` | stone/sand collapse into aggregates node |
| SRC-066 | Bitumen | MAP | `bitumen` | direct 1:1 match |
| SRC-067 | Clay | MERGE | `kaolin-clays` | binding rule: Clay absorbed by kaolin-clays |
| SRC-068 | Wood Pulp | MAP | `wood-pulp` | direct 1:1 match |
| SRC-069 | Waste Paper | MAP | `waste-paper` | direct 1:1 match |
| SRC-070 | Industrial Timber & Logs | MAP | `timber-logs` | direct 1:1 match |
| SRC-071 | Silos (MS, SS, Aluminum) | MERGE | `silos` | Material = attribute; merges block-5 silos dup |
| SRC-072 | Hoppers & Day Bins | MERGE | `hoppers-bins` | Hoppers/day bins collapse with storage bins |
| SRC-073 | Storage Bins & Bulk Containers | MERGE | `hoppers-bins` | Bins and bulk containers join hoppers leaf |
| SRC-074 | Screw Feeders | MAP | `screw-feeders` | 1:1 move to feeders-dosing |
| SRC-075 | Vibratory Feeders | MAP | `vibratory-feeders` | 1:1 move to feeders-dosing |
| SRC-076 | Belt Feeders & Weigh Belt Feeders | MAP | `belt-weigh-feeders` | 1:1 move to feeders-dosing |
| SRC-077 | Loss-in-Weight Feeders | MAP | `loss-in-weight-feeders` | 1:1 move to feeders-dosing |
| SRC-078 | Volumetric Dosing Feeders | MAP | `volumetric-feeders` | 1:1 move to feeders-dosing |
| SRC-079 | Bag Dump Stations (Manual / Enclosed) | MAP | `bag-dump-stations` | Manual/enclosed = attribute |
| SRC-080 | FIBC / Jumbo Bag Unloaders | MAP | `fibc-unloaders` | 1:1 move to feeders-dosing |
| SRC-081 | Belt Conveyors (Flat, Trough, Inclined) | MERGE | `belt-conveyors` | Single conveyor home; merges material-handling dup |
| SRC-082 | Screw Conveyors (Horizontal, Inclined, Vertical) | MERGE | `screw-conveyors` | Single conveyor home; merges material-handling dup |
| SRC-083 | Chain Conveyors | MERGE | `chain-drag-conveyors` | Chain and drag collapse into one leaf |
| SRC-084 | Drag Conveyors | MERGE | `chain-drag-conveyors` | Chain and drag collapse into one leaf |
| SRC-085 | Bucket Elevators | MAP | `bucket-elevators` | Moved to material-handling conveyor home |
| SRC-086 | Vibrating Conveyors | MAP | `vibrating-conveyors` | Moved to material-handling conveyor home |
| SRC-087 | Roller Conveyors (Process use only) | MERGE | `roller-conveyors` | Merges material-handling roller conveyor dup |
| SRC-088 | Lean Phase Pneumatic Conveying Systems | MERGE | `pneumatic-conveying-systems` | Lean/dense phase = attribute |
| SRC-089 | Dense Phase Pneumatic Conveying Systems | MERGE | `pneumatic-conveying-systems` | Lean/dense phase = attribute |
| SRC-090 | Rotary Airlock Valves | MERGE | `rotary-airlock-diverter-valves` | Airlocks and diverters collapse into one leaf |
| SRC-091 | Diverter Valves | MERGE | `rotary-airlock-diverter-valves` | Airlocks and diverters collapse into one leaf |
| SRC-092 | Cyclone Separators (Process use) | MERGE | `cyclone-dust-collectors` | Process cyclones merge with dust-duty cyclones |
| SRC-093 | Conveying Blowers & Vacuum Pumps (Process-dedicated) | MAP | `conveying-blowers` | Moved to pneumatic conveying home |
| SRC-094 | Ribbon Blenders | MAP | `ribbon-blenders` | 1:1 move within powder mixing |
| SRC-095 | Paddle Mixers | MAP | `paddle-mixers` | 1:1 move within powder mixing |
| SRC-096 | Ploughshare Mixers | MAP | `ploughshare-mixers` | 1:1 move within powder mixing |
| SRC-097 | V-Blenders | MERGE | `tumble-blenders` | Geometry = attribute; four blender leaves merged |
| SRC-098 | Double Cone Blenders | MERGE | `tumble-blenders` | Geometry = attribute; four blender leaves merged |
| SRC-099 | Tumble Blenders | MERGE | `tumble-blenders` | Geometry = attribute; four blender leaves merged |
| SRC-100 | Drum Mixers | MERGE | `tumble-blenders` | Geometry = attribute; four blender leaves merged |
| SRC-101 | High-Shear Powder Mixers | MAP | `high-shear-powder-mixers` | 1:1 move within powder mixing |
| SRC-102 | Dry Granulators (Roll Compactors) | MERGE | `granulators` | Dup of roller compactors; wet/dry = attribute |
| SRC-103 | Jaw Crushers | MAP | `jaw-crushers` | 1:1 move to crushers-mills |
| SRC-104 | Impact Crushers | MAP | `impact-crushers` | 1:1 move to crushers-mills |
| SRC-105 | Roller Crushers | MAP | `roller-crushers` | 1:1 move to crushers-mills |
| SRC-106 | Hammer Mills | MAP | `hammer-mills` | 1:1 move to crushers-mills |
| SRC-107 | Pin Mills | MERGE | `fine-grinding-mills` | Pin/jet/pulverizer/micronizer merged; type = attribute |
| SRC-108 | Ball Mills | MAP | `ball-mills` | 1:1 move to crushers-mills |
| SRC-109 | Jet Mills | MERGE | `fine-grinding-mills` | Pin/jet/pulverizer/micronizer merged; type = attribute |
| SRC-110 | Pulverizers | MERGE | `fine-grinding-mills` | Pin/jet/pulverizer/micronizer merged; type = attribute |
| SRC-111 | Micronizers | MERGE | `fine-grinding-mills` | Pin/jet/pulverizer/micronizer merged; type = attribute |
| SRC-112 | Vibrating Screens | MAP | `vibrating-screens` | 1:1 move within screening |
| SRC-113 | Rotary Screens | MERGE | `rotary-screens-sifters` | Rotary/gyratory/centrifugal merged; type = attribute |
| SRC-114 | Gyratory Sifters | MERGE | `rotary-screens-sifters` | Rotary/gyratory/centrifugal merged; type = attribute |
| SRC-115 | Centrifugal Sieves | MERGE | `rotary-screens-sifters` | Rotary/gyratory/centrifugal merged; type = attribute |
| SRC-116 | Magnetic Separators | MAP | `magnetic-separators` | 1:1 move within screening |
| SRC-117 | Metal Detectors (Process inline) | MERGE | `metal-detectors` | Duty = attribute; merges packaging-line dup |
| SRC-118 | Air Classifiers | MAP | `air-classifiers` | 1:1 move within screening |
| SRC-119 | High Shear Granulators | MERGE | `granulators` | Wet/dry = attribute; granulator family merged |
| SRC-120 | Roller Compactors | MERGE | `granulators` | Dup of dry granulators (roll compactors) row |
| SRC-121 | Pelletizers | MERGE | `pelletizers` | Pelletizers and agglomerators share one leaf |
| SRC-122 | Extruders (Dry bulk use) | MAP | `bulk-extruders` | 1:1 move within granulation-pelletizing |
| SRC-123 | Agglomerators | MERGE | `pelletizers` | Pelletizers and agglomerators share one leaf |
| SRC-124 | Baghouse Dust Collectors | MERGE | `baghouse-dust-collectors` | Single air-pollution-control home; dust dup x3 |
| SRC-125 | Cartridge Dust Collectors | MERGE | `cartridge-dust-collectors` | Single air-pollution-control home; dust dup x3 |
| SRC-126 | Cyclone Dust Collectors | MERGE | `cyclone-dust-collectors` | Merges process-use cyclone separators row |
| SRC-127 | Wet Scrubbers (Process dust) | MERGE | `industrial-scrubbers` | Scrubbers x3 consolidated; wet/dry = attribute |
| SRC-128 | Industrial Vacuum Systems (Process duty) | MAP | `industrial-vacuum-cleaners` | Moved to air-pollution-control home |
| SRC-129 | Filter Bags, Cages & Cartridges (Process filters only) | MAP | `filter-media` | Consumable relocated to MRO consumables |
| SRC-130 | Storage Tanks (SS) | MERGE | `industrial-storage-tanks` | Material = attribute; SS/FRP/MS merged |
| SRC-131 | Storage Tanks (FRP) | MERGE | `industrial-storage-tanks` | Material = attribute; SS/FRP/MS merged |
| SRC-132 | Storage Tanks (MS) | MERGE | `industrial-storage-tanks` | Material = attribute; SS/FRP/MS merged |
| SRC-133 | Hygienic / Aseptic Tanks | MAP | `hygienic-aseptic-tanks` | 1:1 move within process tanks |
| SRC-134 | Jacketed & Insulated Tanks | MAP | `jacketed-insulated-tanks` | 1:1 move within process tanks |
| SRC-135 | Reactors (Low-pressure, Atmospheric) | MERGE | `process-reactors` | Low-pressure = attribute; reactor family merged |
| SRC-136 | Pressure Vessels (Process duty) | MERGE | `pressure-vessels` | Exact duplicate rows merged |
| SRC-137 | Intermediate Bulk Containers (IBC) - Process use | MAP | `ibc-totes-containers` | Container = handling asset per binding rule |
| SRC-138 | Centrifugal Pumps (End suction, Multistage) | MAP | `centrifugal-pumps` | 1:1 move to industrial-pumps home |
| SRC-139 | Positive Displacement Pumps | MAP | `positive-displacement-pumps` | 1:1 move to industrial-pumps home |
| SRC-140 | Gear Pumps | MAP | `gear-pumps` | 1:1 move to industrial-pumps home |
| SRC-141 | Lobe Pumps | MAP | `lobe-pumps` | 1:1 move to industrial-pumps home |
| SRC-142 | Screw Pumps | MAP | `screw-pumps` | 1:1 move to industrial-pumps home |
| SRC-143 | Progressive Cavity Pumps | MAP | `progressive-cavity-pumps` | 1:1 move to industrial-pumps home |
| SRC-144 | Diaphragm Pumps (AODD, Mechanical) | MAP | `diaphragm-pumps` | AODD = synonym |
| SRC-145 | Peristaltic / Hose Pumps | MAP | `peristaltic-pumps` | 1:1 move to industrial-pumps home |
| SRC-146 | Metering & Dosing Pumps | MAP | `dosing-metering-pumps` | 1:1 move to industrial-pumps home |
| SRC-147 | Drum & Barrel Pumps | MAP | `drum-barrel-pumps` | 1:1 move to industrial-pumps home |
| SRC-148 | Other Pumps | RETIRE | `industrial-pumps` | Catch-all; residual demand to pump family |
| SRC-149 | Top-entry Agitators | MERGE | `tank-agitators` | Entry orientation = attribute; three leaves merged |
| SRC-150 | Side-entry Agitators | MERGE | `tank-agitators` | Entry orientation = attribute; three leaves merged |
| SRC-151 | Bottom-entry Agitators | MERGE | `tank-agitators` | Entry orientation = attribute; three leaves merged |
| SRC-152 | Inline Static Mixers | MAP | `inline-static-mixers` | 1:1 move within agitators-mixers |
| SRC-153 | High-Shear Mixers (Batch & Inline) | MERGE | `high-shear-mixers` | Mixers/homogenizers/emulsifiers merged; type = attribute |
| SRC-154 | Homogenizers | MERGE | `high-shear-mixers` | Mixers/homogenizers/emulsifiers merged; type = attribute |
| SRC-155 | Emulsifiers | MERGE | `high-shear-mixers` | Mixers/homogenizers/emulsifiers merged; type = attribute |
| SRC-156 | Liquid-Powder Induction & Mixing Systems | MAP | `powder-induction-mixers` | 1:1 move within agitators-mixers |
| SRC-157 | Filter Press (Chamber, Membrane) | MAP | `filter-presses` | Chamber/membrane = attribute |
| SRC-158 | Bag Filter Housings | MERGE | `bag-cartridge-filters` | Bag and cartridge housings share one leaf |
| SRC-159 | Cartridge Filter Systems | MERGE | `bag-cartridge-filters` | Bag and cartridge housings share one leaf |
| SRC-160 | Self-Cleaning Filters & Strainers | MAP | `self-cleaning-filters` | 1:1 move within liquid filtration |
| SRC-161 | Industrial Centrifuges (Basket, Decanter) | MAP | `industrial-centrifuges` | Basket/decanter = attribute |
| SRC-162 | Oil-Water Separators | MAP | `oil-water-separators` | 1:1 move within liquid filtration |
| SRC-163 | Membrane Filtration Systems (MF, UF, NF) | MAP | `membrane-filtration-systems` | Process duty; utility RO/UF lives elsewhere |
| SRC-164 | Automated Liquid Dosing Skids | MERGE | `chemical-dosing-systems` | Dosing skids fold into dosing systems leaf |
| SRC-165 | Chemical Dosing Systems | MERGE | `chemical-dosing-systems` | Dosing skids fold into dosing systems leaf |
| SRC-166 | Inline Flow Measurement Skids | MAP | `flow-measurement-skids` | 1:1 move within dosing skids |
| SRC-167 | Batch Dosing & Recipe Control Skids | MAP | `batch-recipe-skids` | 1:1 move within dosing skids |
| SRC-168 | CIP (Clean-in-Place) Systems | MAP | `cip-systems` | 1:1 move within hygienic cleaning |
| SRC-169 | SIP (Sterilize-in-Place) Systems | MAP | `sip-systems` | 1:1 move within hygienic cleaning |
| SRC-170 | Tank & Vessel Cleaning Machines | MAP | `tank-cleaning-machines` | 1:1 move within hygienic cleaning |
| SRC-171 | Pigging Systems (for pipelines) | MAP | `pigging-systems` | 1:1 move within hygienic cleaning |
| SRC-172 | Turnkey Liquid Processing Lines | SERVICE | `production-line-turnkey` | Liquid line integration = turnkey service |
| SRC-173 | Skid-Mounted Process Units | SERVICE | `production-line-turnkey` | Skid-mounted process units per services table |
| SRC-174 | Modular Process Systems | SERVICE | `production-line-turnkey` | Modular process units per services table |
| SRC-175 | Industrial Dryers | MERGE | `industrial-dryers` | Generic umbrella merges into dryer family L3 |
| SRC-176 | Industrial Tray Dryers | MAP | `tray-dryers` | 1:1 move within industrial dryers |
| SRC-177 | Industrial Fluid Bed Dryers (FBD) | MAP | `fluid-bed-dryers` | 1:1 move within industrial dryers |
| SRC-178 | Industrial Spray Dryers | MAP | `spray-dryers` | 1:1 move within industrial dryers |
| SRC-179 | Industrial Rotary Dryers | MAP | `rotary-dryers` | 1:1 move within industrial dryers |
| SRC-180 | Industrial Vacuum Dryers | MAP | `vacuum-dryers` | 1:1 move within industrial dryers |
| SRC-181 | Industrial Freeze / Lyophilization Dryers | MAP | `freeze-dryers` | 1:1 move within industrial dryers |
| SRC-182 | Industrial Ovens | MERGE | `industrial-ovens` | Generic umbrella merges into oven family L3 |
| SRC-183 | Industrial Batch Ovens | MAP | `batch-ovens` | 1:1 move within industrial ovens |
| SRC-184 | Industrial Conveyor Ovens | MAP | `conveyor-ovens` | 1:1 move within industrial ovens |
| SRC-185 | Industrial Curing Ovens | MAP | `curing-ovens` | 1:1 move within industrial ovens |
| SRC-186 | Process Chillers & Cooling Tunnels | SPLIT | `process-cooling-tunnels;chillers-ahus` | Tunnels stay; chillers canonical in HVAC |
| SRC-187 | Heat Tunnels & Thermal Chambers (Process use) | MERGE | `process-cooling-tunnels` | Heat tunnels join cooling tunnels leaf |
| SRC-188 | Shell & Tube Heat Exchangers | MAP | `shell-tube-heat-exchangers` | Single HX home; duty = attribute |
| SRC-189 | Plate Heat Exchangers | MAP | `plate-heat-exchangers` | Single HX home; duty = attribute |
| SRC-190 | Finned Tube Heat Exchangers | MAP | `finned-tube-heat-exchangers` | Single HX home; duty = attribute |
| SRC-191 | Scraped Surface Heat Exchangers | MAP | `scraped-surface-heat-exchangers` | Single HX home; duty = attribute |
| SRC-192 | Heat Recovery Units (Process-side) | MAP | `heat-recovery-units` | 1:1 move within heat exchangers |
| SRC-193 | Process Reactors | MERGE | `process-reactors` | Generic umbrella merges into reactor leaf |
| SRC-194 | Stainless Steel Process Reactors | MERGE | `process-reactors` | Material = attribute; reactor variants merged |
| SRC-195 | Glass-Lined Process Reactors | MERGE | `process-reactors` | Material = attribute; reactor variants merged |
| SRC-196 | Alloy Reactors (Hastelloy, etc.) | MERGE | `process-reactors` | Material = attribute; reactor variants merged |
| SRC-197 | Pressure Vessels (Process duty) | MERGE | `pressure-vessels` | Exact duplicate rows merged |
| SRC-198 | Autoclaves (Industrial process) | MAP | `autoclaves` | 1:1 move within reactors-bioprocess |
| SRC-199 | Fermenters & Bioreactors | MAP | `fermenters-bioreactors` | 1:1 move within reactors-bioprocess |
| SRC-200 | Agitated Reaction Systems | MERGE | `process-reactors` | Agitated systems fold into reactor family |
| SRC-201 | Falling Film Evaporators | MERGE | `industrial-evaporators` | Evaporator type = attribute; five leaves merged |
| SRC-202 | Rising Film Evaporators | MERGE | `industrial-evaporators` | Evaporator type = attribute; five leaves merged |
| SRC-203 | Forced Circulation Evaporators | MERGE | `industrial-evaporators` | Evaporator type = attribute; five leaves merged |
| SRC-204 | Agitated Thin Film Evaporators (ATFE) | MERGE | `industrial-evaporators` | Evaporator type = attribute; five leaves merged |
| SRC-205 | Multi-Effect Evaporators (MEE) | MERGE | `industrial-evaporators` | Evaporator type = attribute; five leaves merged |
| SRC-206 | Zero Liquid Discharge (ZLD) Concentration Units | MERGE | `zld-systems` | ZLD canonical in plant-utilities; dup merged |
| SRC-207 | Batch Distillation Units | MERGE | `distillation-columns` | Batch/continuous = attribute; columns merged |
| SRC-208 | Continuous Distillation Columns | MERGE | `distillation-columns` | Batch/continuous = attribute; columns merged |
| SRC-209 | Fractionation Columns | MERGE | `distillation-columns` | Fractionation folds into distillation columns leaf |
| SRC-210 | Column Internals Trays (Sieve, Bubble Cap) | MERGE | `column-internals` | Trays and packings share one leaf |
| SRC-211 | Column Internals Packings (Structured, Random) | MERGE | `column-internals` | Trays and packings share one leaf |
| SRC-212 | Solid-Liquid Extractors | MERGE | `extraction-systems` | Extraction mode = attribute; four leaves merged |
| SRC-213 | Liquid-Liquid Extraction Columns | MERGE | `extraction-systems` | Extraction mode = attribute; four leaves merged |
| SRC-214 | Supercritical Fluid Extraction (SFE) Systems | MERGE | `extraction-systems` | Extraction mode = attribute; four leaves merged |
| SRC-215 | Leaching Systems | MERGE | `extraction-systems` | Extraction mode = attribute; four leaves merged |
| SRC-216 | Batch Crystallizers | MERGE | `industrial-crystallizers` | Crystallizer type = attribute; five leaves merged |
| SRC-217 | Continuous Crystallizers | MERGE | `industrial-crystallizers` | Crystallizer type = attribute; five leaves merged |
| SRC-218 | Cooling Crystallizers | MERGE | `industrial-crystallizers` | Crystallizer type = attribute; five leaves merged |
| SRC-219 | Evaporative Crystallizers | MERGE | `industrial-crystallizers` | Crystallizer type = attribute; five leaves merged |
| SRC-220 | Melt Crystallization Systems | MERGE | `industrial-crystallizers` | Crystallizer type = attribute; five leaves merged |
| SRC-221 | Turnkey Thermal Processing Lines | SERVICE | `production-line-turnkey` | Thermal line integration = turnkey service |
| SRC-222 | Skid-Mounted Thermal Process Units | SERVICE | `production-line-turnkey` | Skid-mounted thermal units per services table |
| SRC-223 | Process Optimization & Retrofits (Thermal) | SERVICE | `process-optimization` | Optimization and retrofits per services table |
| SRC-224 | Liquid Filling Machines (Volumetric, Gravimetric, Flow-meter based) | MAP | `liquid-filling-machines` | Dosing principle = attribute |
| SRC-225 | Powder Filling Machines (Auger, Vacuum) | MAP | `powder-filling-machines` | Auger/vacuum = attribute |
| SRC-226 | Granule Filling Machines (Cup, Weighing) | MAP | `granule-filling-machines` | Cup/weighing = attribute |
| SRC-227 | Piston Filling Machines | MAP | `piston-filling-machines` | 1:1 move within filling machines |
| SRC-228 | Aseptic Filling Machines | MAP | `aseptic-filling-machines` | 1:1 move within filling machines |
| SRC-229 | Multi-Head Weighers & Filling Systems | MAP | `multihead-weighers` | 1:1 move within filling machines |
| SRC-230 | Vertical Form-Fill-Seal (VFFS) Machines | MAP | `vffs-machines` | 1:1 move within form-fill-seal |
| SRC-231 | Horizontal Form-Fill-Seal (HFFS) Machines | MAP | `hffs-machines` | 1:1 move within form-fill-seal |
| SRC-232 | Stick Pack Machines | MERGE | `stick-sachet-machines` | Stick pack and sachet share one leaf |
| SRC-233 | Sachet Packaging Machines | MERGE | `stick-sachet-machines` | Stick pack and sachet share one leaf |
| SRC-234 | Pouch Filling & Sealing Machines (Stand-up, Zipper, Spout) | MAP | `pouch-fill-seal-machines` | Pouch format = attribute |
| SRC-235 | Screw Capping Machines | MERGE | `capping-machines` | Screw/ROPP/lug = attribute; cappers merged |
| SRC-236 | ROPP & Lug Capping Machines | MERGE | `capping-machines` | Screw/ROPP/lug = attribute; cappers merged |
| SRC-237 | Induction Sealing Machines | MAP | `induction-sealing-machines` | 1:1 move within capping-sealing |
| SRC-238 | Heat Sealing Machines | MERGE | `heat-vacuum-sealers` | Heat and vacuum sealers share one leaf |
| SRC-239 | Vacuum Sealing Machines | MERGE | `heat-vacuum-sealers` | Heat and vacuum sealers share one leaf |
| SRC-240 | Carton Sealing Machines | MAP | `carton-sealing-machines` | 1:1 move within capping-sealing |
| SRC-241 | Bottle & Container Labeling Machines | MERGE | `labeling-machines` | Label format = attribute; labelers merged |
| SRC-242 | Wrap-Around & Sticker Labeling Machines | MERGE | `labeling-machines` | Label format = attribute; labelers merged |
| SRC-243 | Inkjet Coding Machines (CIJ, TIJ) | MAP | `inkjet-coders` | CIJ/TIJ = attribute |
| SRC-244 | Laser Marking Machines | MAP | `laser-marking-machines` | 1:1 move within labeling-coding |
| SRC-245 | Thermal Transfer Overprinters (TTO) | MAP | `thermal-transfer-overprinters` | 1:1 move within labeling-coding |
| SRC-246 | Serialization & Track-and-Trace Systems | MAP | `track-trace-systems` | 1:1 move within labeling-coding |
| SRC-247 | Cartoning Machines (Horizontal / Vertical) | MAP | `cartoning-machines` | 1:1 move within secondary packaging |
| SRC-248 | Case Packers (Top-load, Side-load) | MAP | `case-packers` | Top/side-load = attribute |
| SRC-249 | Case Erectors & Case Sealers | MAP | `case-erectors-sealers` | 1:1 move within secondary packaging |
| SRC-250 | Tray Packing Machines | MERGE | `tray-shrink-packers` | Tray packing and shrink wrap share leaf |
| SRC-251 | Shrink Wrapping Machines (Secondary) | MERGE | `tray-shrink-packers` | Tray packing and shrink wrap share leaf |
| SRC-252 | Palletizers (Conventional, Robotic) | MERGE | `palletizers` | Conventional/robotic = attribute; merges robotics dup |
| SRC-253 | Depalletizers | MERGE | `palletizers` | Depalletizers fold into palletizers leaf |
| SRC-254 | Stretch Wrapping Machines | MERGE | `stretch-shrink-wrappers` | Merges material-handling pallet wrapper dup |
| SRC-255 | Shrink Hood Wrapping Machines | MERGE | `stretch-shrink-wrappers` | Stretch and shrink hood share one leaf |
| SRC-256 | Pallet Conveyors (Packaging-line use) | MAP | `pallet-conveyors` | 1:1 move to end-of-line home |
| SRC-257 | Checkweighers | MERGE | `checkweighers` | Merges Quality L1 checkweigher dup |
| SRC-258 | Metal Detectors (Packaging line) | MERGE | `metal-detectors` | Duty = attribute; merges process-inline dup |
| SRC-259 | X-Ray Inspection Systems | MAP | `x-ray-inspection` | 1:1 move to packaging-inspection home |
| SRC-260 | Vision Inspection Systems | MERGE | `vision-inspection` | Merges Quality L1 vision inspection dup |
| SRC-261 | Leak Detection Systems | MAP | `leak-detection-systems` | 1:1 move to packaging-inspection home |
| SRC-262 | Automatic Reject Systems | MAP | `reject-systems` | 1:1 move to packaging-inspection home |
| SRC-263 | Turnkey Packaging Line Setup | SERVICE | `packaging-line-epc` | Packaging line turnkey per services table |
| SRC-264 | Integrated Filling-Packing Lines | SERVICE | `packaging-line-epc` | Line integration per services table |
| SRC-265 | Packaging Line Automation & Controls | SERVICE | `packaging-line-epc` | Line automation per services table |
| SRC-266 | Line Balancing & Speed Optimization | SERVICE | `packaging-line-epc` | Line balancing per services table |
| SRC-267 | Lathe Machines (Conventional, CNC) | MERGE | `lathes-turning-centers` | Conventional/CNC = attribute; merges CNC turning dup |
| SRC-268 | Milling Machines (Conventional, CNC, VMC) | SPLIT | `conventional-milling-machines;vertical-machining-centers` | Grouped row; VMC dedupes to own leaf |
| SRC-269 | Drilling Machines (Pillar, Radial, Magnetic) | MAP | `drilling-machines` | Pillar/radial/magnetic = attribute |
| SRC-270 | Boring Machines | MAP | `boring-machines` | 1:1 move to machine-tools branch |
| SRC-271 | Shaper & Slotting Machines | MAP | `shaper-slotting-machines` | 1:1 move to machine-tools branch |
| SRC-272 | Surface Grinding Machines | MAP | `surface-grinders` | 1:1 move to grinding machines |
| SRC-273 | Cylindrical & Centerless Grinding Machines | MAP | `cylindrical-grinders` | 1:1 move to grinding machines |
| SRC-274 | Tool & Cutter Grinding Machines | MAP | `tool-cutter-grinders` | 1:1 move to grinding machines |
| SRC-275 | CNC Turning Centers | MERGE | `lathes-turning-centers` | Dedupes against lathe machines row |
| SRC-276 | Vertical Machining Centers (VMC) | MERGE | `vertical-machining-centers` | Dedupes against milling machines VMC part |
| SRC-277 | Horizontal Machining Centers (HMC) | MAP | `horizontal-machining-centers` | 1:1 move to machining centers |
| SRC-278 | 5-Axis CNC Machining Centers | MERGE | `five-axis-machining-centers` | 5-axis and multi-axis share one leaf |
| SRC-279 | Multi-Spindle & Multi-Axis Machines | MERGE | `five-axis-machining-centers` | 5-axis and multi-axis share one leaf |
| SRC-280 | Shearing Machines | MAP | `shearing-machines` | 1:1 move to sheet metal machinery |
| SRC-281 | Press Brake Machines (NC, CNC) | MAP | `press-brakes` | NC/CNC = attribute |
| SRC-282 | Power Press Machines | MERGE | `mechanical-power-presses` | Power press merges with mechanical presses |
| SRC-283 | Turret Punching Machines | MAP | `turret-punches` | 1:1 move to sheet metal machinery |
| SRC-284 | Plate Rolling & Bending Machines | MAP | `plate-rolling-bending` | 1:1 move to sheet metal machinery |
| SRC-285 | Panel Benders | MAP | `panel-benders` | 1:1 move to sheet metal machinery |
| SRC-286 | Laser Cutting Machines (Fiber, CO2) | MAP | `laser-cutting-machines` | Fiber/CO2 = attribute |
| SRC-287 | Plasma Cutting Machines | MAP | `plasma-cutting-machines` | 1:1 move to cutting machines |
| SRC-288 | Waterjet Cutting Machines | MAP | `waterjet-cutting-machines` | 1:1 move to cutting machines |
| SRC-289 | Flame / Oxy-Fuel Cutting Machines | MAP | `oxyfuel-cutting-machines` | 1:1 move to cutting machines |
| SRC-290 | Arc / MMA Welding Machines | MAP | `arc-welding-machines` | 1:1 move to welding equipment |
| SRC-291 | MIG / MAG Welding Machines | MAP | `mig-mag-welders` | 1:1 move to welding equipment |
| SRC-292 | TIG Welding Machines | MAP | `tig-welders` | 1:1 move to welding equipment |
| SRC-293 | Submerged Arc Welding (SAW) Systems | MAP | `saw-welding-systems` | 1:1 move to welding equipment |
| SRC-294 | Spot & Resistance Welding Machines | MAP | `spot-resistance-welders` | 1:1 move to welding equipment |
| SRC-295 | Robotic Welding Cells | MAP | `robotic-welding-cells` | Welding robots stay with welding per rule |
| SRC-296 | Brazing & Soldering Equipment | MAP | `brazing-soldering-equipment` | 1:1 move to welding equipment |
| SRC-297 | Hydraulic Presses | MAP | `hydraulic-presses` | 1:1 move to presses-forging |
| SRC-298 | Mechanical Presses | MERGE | `mechanical-power-presses` | Mechanical merges with power press dup |
| SRC-299 | Forging Presses | MAP | `forging-presses` | 1:1 move to presses-forging |
| SRC-300 | Roll Forming Machines | MAP | `roll-forming-machines` | 1:1 move to presses-forging |
| SRC-301 | Extrusion Presses (Metal forming) | MAP | `metal-extrusion-presses` | 1:1 move to presses-forging |
| SRC-302 | Shot Blasting & Sand Blasting Machines | MAP | `blasting-machines` | Shot/sand = attribute |
| SRC-303 | Surface Finishing & Polishing Machines | MAP | `polishing-machines` | 1:1 move to workshop finishing |
| SRC-304 | Heat Treatment Furnaces (Workshop-scale) | MAP | `heat-treatment-furnaces` | Workshop-scale = attribute |
| SRC-305 | Parts Washing & Degreasing Machines | MAP | `parts-washers` | 1:1 move to workshop finishing |
| SRC-306 | Balancing Machines | MAP | `balancing-machines` | 1:1 move to workshop finishing |
| SRC-307 | Mold & Die Making Machines | MAP | `mold-die-machines` | 1:1 move to tooling-workholding |
| SRC-308 | Tool Presetting Machines | MAP | `tool-presetters` | 1:1 move to tooling-workholding |
| SRC-309 | Jigs, Fixtures & Workholding Systems (Production-grade) | MAP | `jigs-fixtures-workholding` | 1:1 move to tooling-workholding |
| SRC-310 | EDM Machines (Wire-cut, Die-sinking) | MAP | `edm-machines` | Wire-cut/die-sinking = attribute |
| SRC-311 | Spinning Machines | MAP | `spinning-machines` | 1:1 within textile machinery |
| SRC-312 | Weaving Looms (Rapier, Air-Jet, Water-Jet) | MAP | `weaving-looms` | Rapier/air-jet/water-jet = attribute |
| SRC-313 | Knitting Machines (Circular, Flat) | MAP | `knitting-machines` | Circular/flat = attribute |
| SRC-314 | Dyeing Machines (Jet, Jigger, Winch) | MAP | `dyeing-machines` | Jet/jigger/winch = attribute |
| SRC-315 | Textile Printing Machines | MAP | `textile-printing-machines` | 1:1 within textile machinery |
| SRC-316 | Finishing & Compacting Machines | MAP | `textile-finishing-machines` | 1:1 within textile machinery |
| SRC-317 | Nonwoven & Technical Textile Machinery | MAP | `nonwoven-machinery` | 1:1 within textile machinery |
| SRC-318 | Grain & Flour Milling Machines | MAP | `flour-grain-milling` | 1:1 within food machinery |
| SRC-319 | Dairy Processing Machinery | MAP | `dairy-processing-machinery` | 1:1 within food machinery |
| SRC-320 | Beverage Processing Lines | MAP | `beverage-lines` | 1:1 within food machinery |
| SRC-321 | Bakery & Confectionery Machines | MAP | `bakery-confectionery-machines` | 1:1 within food machinery |
| SRC-322 | Meat & Poultry Processing Machinery | MAP | `meat-poultry-machinery` | 1:1 within food machinery |
| SRC-323 | Fruit & Vegetable Processing Machines | MAP | `fruit-vegetable-machinery` | 1:1 within food machinery |
| SRC-324 | Edible Oil Processing Machinery | MAP | `edible-oil-machinery` | 1:1 within food machinery |
| SRC-325 | Tablet Compression Machines | MAP | `tablet-presses` | 1:1 within pharma machinery |
| SRC-326 | Capsule Filling Machines | MAP | `capsule-fillers` | 1:1 within pharma machinery |
| SRC-327 | Granulation & Coating Systems | MAP | `granulation-coating-systems` | 1:1 within pharma machinery |
| SRC-328 | Injectable & Sterile Processing Lines | MAP | `sterile-processing-lines` | 1:1 within pharma machinery |
| SRC-329 | Blister & Strip Packaging Lines (Process-linked) | MAP | `blister-packaging-lines` | 1:1 within pharma machinery |
| SRC-330 | Medical Device Assembly Machinery | MAP | `medical-device-assembly` | 1:1 within pharma machinery |
| SRC-331 | Injection Molding Machines | MAP | `injection-molding-machines` | 1:1 within plastics machinery |
| SRC-332 | Extrusion Lines | MAP | `plastic-extrusion-lines` | 1:1 within plastics machinery |
| SRC-333 | Blow Molding Machines | MAP | `blow-molding-machines` | 1:1 within plastics machinery |
| SRC-334 | Compression & Transfer Molding Machines | MAP | `compression-molding-machines` | 1:1 within plastics machinery |
| SRC-335 | Rubber Mixing & Calendering Machines | MAP | `rubber-mixing-calendering` | 1:1 within plastics machinery |
| SRC-336 | Thermoforming Machines | MAP | `thermoforming-machines` | 1:1 within plastics machinery |
| SRC-337 | Pulping & Digestion Systems | MAP | `pulping-systems` | 1:1 within paper machinery |
| SRC-338 | Paper Making Machines | MAP | `paper-making-machines` | 1:1 within paper machinery |
| SRC-339 | Tissue & Specialty Paper Machines | MAP | `tissue-paper-machines` | 1:1 within paper machinery |
| SRC-340 | Paper Converting Machinery | MAP | `paper-converting-machinery` | 1:1 within paper machinery |
| SRC-341 | Corrugation & Board Making Machines | MAP | `corrugation-board-machines` | 1:1 within paper machinery |
| SRC-342 | Cement & Clinker Production Machinery | MAP | `cement-plant-machinery` | 1:1 within building materials machinery |
| SRC-343 | Concrete Batching & Block Making Machines | MAP | `concrete-block-machines` | 1:1 within building materials machinery |
| SRC-344 | Brick & Tile Making Machines | MAP | `brick-tile-machines` | 1:1 within building materials machinery |
| SRC-345 | AAC / Fly Ash Brick Plants | MAP | `aac-brick-plants` | 1:1 within building materials machinery |
| SRC-346 | Gypsum Board Production Lines | MAP | `gypsum-board-lines` | 1:1 within building materials machinery |
| SRC-347 | Sawmill & Log Processing Machines | MAP | `sawmill-machines` | 1:1 within wood machinery |
| SRC-348 | Wood Cutting & Shaping Machines | MAP | `wood-cutting-shaping` | 1:1 within wood machinery |
| SRC-349 | Panel Processing Machines (MDF, Plywood) | MAP | `panel-processing-machines` | MDF/plywood = attribute |
| SRC-350 | Furniture Manufacturing Machines | MAP | `furniture-machines` | 1:1 within wood machinery |
| SRC-351 | Wood Surface Finishing Machines | MAP | `wood-finishing-machines` | 1:1 within wood machinery |
| SRC-352 | Chemical Batch Processing Units | MAP | `chemical-batch-units` | 1:1 within chemical plant machinery |
| SRC-353 | Specialty Chemical Production Lines | MAP | `specialty-chemical-lines` | 1:1 within chemical plant machinery |
| SRC-354 | Agrochemical & Fertilizer Machinery | MAP | `agrochemical-fertilizer-machinery` | 1:1 within chemical plant machinery |
| SRC-355 | Resin & Adhesive Manufacturing Systems | MAP | `resin-adhesive-plants` | 1:1 within chemical plant machinery |
| SRC-356 | Paint & Coating Production Machinery | MAP | `paint-production-machinery` | 1:1 within chemical plant machinery |
| SRC-357 | Complete Production Line Setup | SERVICE | `production-line-turnkey` | Turnkey production line per services table |
| SRC-358 | Greenfield Plant Line Installation | SERVICE | `production-line-turnkey` | Greenfield = attribute per services table |
| SRC-359 | Brownfield Line Expansion & Retrofit | SERVICE | `production-line-turnkey` | Brownfield/retrofit = attribute per services table |
| SRC-360 | Capacity Enhancement & Debottlenecking Projects | SERVICE | `production-line-turnkey` | Debottlenecking = attribute per services table |
| SRC-361 | Process Conveying & Transfer Integration | SERVICE | `machine-integration` | M2M conveying integration per services table |
| SRC-362 | Synchronization of Multiple Machines | SERVICE | `machine-integration` | Machine synchronization per services table |
| SRC-363 | Inline Buffering & Accumulation Systems | MAP | `conveyors` | No accumulation leaf; nearest conveyor family node |
| SRC-364 | Interlocking & Safety Integration | SERVICE | `machine-integration` | Interlocking integration per services table |
| SRC-365 | PLC-Based Control Systems | MERGE | `plc-systems` | PLC x4 across L1s consolidated |
| SRC-366 | SCADA & HMI Systems (Process operations) | MERGE | `scada-hmi` | SCADA/HMI x4 across L1s consolidated |
| SRC-367 | Distributed Control Systems (DCS) | MAP | `dcs-systems` | Single DCS product home |
| SRC-368 | Batch Control & Recipe Management Systems | MAP | `batch-recipe-control` | 1:1 move to control-systems home |
| SRC-369 | Pick-and-Place Robotic Cells | MERGE | `robot-cells` | Application = attribute; pick-place/load-unload merged |
| SRC-370 | Robotic Loading / Unloading Systems | MERGE | `robot-cells` | Application = attribute; pick-place/load-unload merged |
| SRC-371 | Robotic Palletizing Cells (Process-linked) | MERGE | `palletizers` | Robotic palletizing goes to end-of-line home |
| SRC-372 | Collaborative Robots (Cobots) in Production | MAP | `collaborative-robots` | 1:1 move to industrial-robotics home |
| SRC-373 | Vision-Guided Robotic Systems | MAP | `vision-guided-robotics` | 1:1 move to industrial-robotics home |
| SRC-374 | MCC & Control Panel Integration (Process duty) | SERVICE | `equipment-installation` | Integration service; panel product home = mcc-panels |
| SRC-375 | Field Instrumentation Integration | SERVICE | `equipment-installation` | Instrumentation integration = installation service |
| SRC-376 | VFD & Servo Drive Integration | SERVICE | `equipment-installation` | Integration service; drive product home = variable-frequency-drives |
| SRC-377 | Sensors, Actuators & Field Devices (Integration scope) | MAP | `field-devices` | Products; integration scope dropped per rule |
| SRC-378 | Production Monitoring Systems | MERGE | `production-monitoring-oee` | Monitoring and OEE share one leaf |
| SRC-379 | OEE & Downtime Analysis Systems | MERGE | `production-monitoring-oee` | Merges utility OEE dup |
| SRC-380 | Energy Monitoring (Process level) | MERGE | `energy-monitoring-systems` | Energy monitoring x3 consolidated |
| SRC-381 | Predictive Maintenance (Production assets) | MERGE | `predictive-maintenance-systems` | Merges utility-assets predictive maintenance dup |
| SRC-382 | Installation & Commissioning Services | SERVICE | `equipment-installation` | One of five identical installation leaves |
| SRC-383 | FAT / SAT & Line Acceptance Testing | SERVICE | `fat-sat-testing` | FAT/SAT per services table |
| SRC-384 | Process Optimization & Tuning | SERVICE | `process-optimization` | Optimization and tuning per services table |
| SRC-385 | GMP / Validation Support (where applicable) | SERVICE | `gmp-validation-support` | GMP/validation support per services table |
| SRC-386 | AMC for Integrated Production Lines | SERVICE | `amc-contracts` | One of six identical AMC leaves |
| SRC-387 | Diesel Generator (DG) Sets | MAP | `diesel-generators` | 1:1 power-generation leaf |
| SRC-388 | Gas Generator Sets | MAP | `gas-generators` | 1:1 power-generation leaf |
| SRC-389 | Captive Power Plants | MAP | `captive-power-plants` | 1:1 power-generation leaf |
| SRC-390 | Solar Power Plants (Industrial / Rooftop) | MAP | `solar-power-systems` | 1:1; rooftop becomes attribute |
| SRC-391 | Hybrid Power Generation Systems | MAP | `hybrid-power-systems` | 1:1 power-generation leaf |
| SRC-392 | Cogeneration (CHP) Systems | MAP | `cogeneration-chp` | 1:1 power-generation leaf |
| SRC-393 | HT / LT Substations | MAP | `substations` | 1:1 substations-distribution leaf |
| SRC-394 | Transformers (Power & Distribution) | MAP | `transformers` | 1:1; power/distribution becomes attribute |
| SRC-395 | HT / LT Switchgear Panels | MAP | `switchgear-panels` | 1:1 substations-distribution leaf |
| SRC-396 | Ring Main Units (RMU) | MAP | `ring-main-units` | 1:1 substations-distribution leaf |
| SRC-397 | Bus Duct & Busbar Trunking Systems | MAP | `busbar-trunking` | 1:1 substations-distribution leaf |
| SRC-398 | Power Control Centers (PCC) | MAP | `pcc-panels` | 1:1 power-control-quality leaf |
| SRC-399 | Motor Control Centers (MCC) | MERGE | `mcc-panels` | canonical MCC home; absorbs EIC integration dup |
| SRC-400 | Uninterruptible Power Supply (UPS) | MAP | `ups-systems` | 1:1 power-control-quality leaf |
| SRC-401 | Automatic Power Factor Correction (APFC) Panels | MAP | `apfc-panels` | 1:1 power-control-quality leaf |
| SRC-402 | Harmonic Filters & Power Quality Systems | MAP | `harmonic-filters` | 1:1 power-control-quality leaf |
| SRC-403 | Emergency Power Supply Systems | MAP | `emergency-power-systems` | 1:1 backup-energy-storage leaf |
| SRC-404 | Battery Energy Storage Systems (BESS) | MAP | `battery-energy-storage` | 1:1 backup-energy-storage leaf |
| SRC-405 | Automatic / Static Transfer Switches (ATS / STS) | MAP | `transfer-switches` | 1:1 backup-energy-storage leaf |
| SRC-406 | Earthing & Grounding Systems | MAP | `earthing-systems` | 1:1 earthing-lightning leaf |
| SRC-407 | Lightning Protection Systems | MAP | `lightning-protection` | 1:1 earthing-lightning leaf |
| SRC-408 | Arc Flash & Electrical Safety Systems | MAP | `arc-flash-protection` | 1:1 earthing-lightning leaf |
| SRC-409 | Electrical EPC & Turnkey Projects | SERVICE | `electrical-epc` | EPC service per services table |
| SRC-410 | Installation & Commissioning Services | SERVICE | `equipment-installation` | installation/commissioning service; merged home |
| SRC-411 | Electrical Testing & Safety Audits | SERVICE | `safety-compliance-audits` | electrical testing and safety audit service |
| SRC-412 | Annual Maintenance Contracts (AMC) | SERVICE | `amc-contracts` | AMC service; merged home (6 dups) |
| SRC-413 | Energy Audit & Power Optimization Services | SERVICE | `energy-audits` | energy audit service; merged home |
| SRC-414 | Raw Water Intake Systems | MERGE | `intake-screening-systems` | intake plus screening collapse into one leaf |
| SRC-415 | Screening & Grit Removal Systems | MERGE | `intake-screening-systems` | screening/grit joins intake leaf |
| SRC-416 | Oil & Grease Removal Systems | MAP | `oil-grease-removal` | 1:1 water-pretreatment leaf |
| SRC-417 | Clarifiers & Settling Systems | MAP | `clarifiers-settling` | 1:1 water-pretreatment leaf |
| SRC-418 | Conventional Water Treatment Plants | MAP | `conventional-wtp` | 1:1 WTP leaf |
| SRC-419 | Activated Carbon Filtration Systems | MAP | `carbon-filtration-systems` | 1:1 WTP leaf |
| SRC-420 | Water Softening Plants | MAP | `water-softening-plants` | 1:1 WTP leaf |
| SRC-421 | Reverse Osmosis (RO) Plants | MAP | `ro-plants` | 1:1 WTP leaf |
| SRC-422 | Ultrafiltration (UF) Systems | MAP | `uf-systems` | 1:1; utility-water UF duty |
| SRC-423 | Demineralization (DM) Plants | MAP | `dm-plants` | 1:1 WTP leaf |
| SRC-424 | Boiler Feed Water Treatment Systems | MAP | `boiler-feed-water-systems` | 1:1 process-utility-water leaf |
| SRC-425 | Cooling Tower Make-Up Water Treatment | MAP | `cooling-tower-water-treatment` | 1:1 process-utility-water leaf |
| SRC-426 | High-Purity & Process Water Systems | MAP | `high-purity-water-systems` | 1:1 process-utility-water leaf |
| SRC-427 | Domestic Sewage Treatment Plants (STP) | MAP | `stp-plants` | 1:1 wastewater leaf |
| SRC-428 | Industrial Effluent Treatment Plants (ETP) | MAP | `etp-plants` | 1:1 wastewater leaf |
| SRC-429 | Physico-Chemical Treatment Systems | MAP | `physico-chemical-treatment` | 1:1 wastewater leaf |
| SRC-430 | DAF (Dissolved Air Flotation) Systems | MAP | `daf-systems` | 1:1 wastewater leaf |
| SRC-431 | Tertiary & Advanced Treatment Systems | MAP | `tertiary-treatment-systems` | 1:1 wastewater leaf |
| SRC-432 | Sludge Thickening Systems | MAP | `sludge-thickening` | 1:1 sludge-handling leaf |
| SRC-433 | Sludge Dewatering Systems | MAP | `sludge-dewatering` | 1:1 sludge-handling leaf |
| SRC-434 | Sludge Drying Systems | MAP | `sludge-drying` | 1:1 sludge-handling leaf |
| SRC-435 | Water Recycling & Reuse Systems | MAP | `water-reuse-systems` | 1:1 water-recycling-zld leaf |
| SRC-436 | Zero Liquid Discharge (ZLD) Systems | MERGE | `zld-systems` | binding single ZLD home; absorbs evaporation dup |
| SRC-437 | Water Treatment Instrumentation Systems | MERGE | `field-devices` | generic water instrumentation, not analyzer-flavored; joins field-devices |
| SRC-438 | PLC & SCADA for Water Systems | SPLIT | `plc-systems;scada-hmi` | row names both; PLC and SCADA homes separate |
| SRC-439 | WTP / ETP / ZLD EPC & Turnkey Projects | SERVICE | `water-treatment-epc` | WTP/ETP/ZLD EPC service per table |
| SRC-440 | Operation & Maintenance (O&M) Services | SERVICE | `operation-maintenance` | O&M service per services table |
| SRC-441 | Industrial Steam Boilers | MAP | `industrial-steam-boilers` | 1:1 boiler leaf |
| SRC-442 | Thermic Fluid Heaters | MAP | `thermic-fluid-heaters` | 1:1 boiler leaf |
| SRC-443 | Waste Heat Recovery Boilers (WHRB) | MAP | `waste-heat-recovery-boilers` | 1:1 boiler leaf |
| SRC-444 | Package & Skid-Mounted Boiler Systems | MAP | `package-boilers` | 1:1 boiler leaf |
| SRC-445 | Steam Piping & Distribution Systems | MAP | `steam-piping-systems` | 1:1 steam-distribution leaf |
| SRC-446 | Condensate Recovery Systems | MAP | `condensate-recovery` | 1:1 steam-distribution leaf |
| SRC-447 | Steam Traps & Steam Accessories Systems | MAP | `steam-traps-accessories` | 1:1 steam-distribution leaf |
| SRC-448 | Heat Exchangers (Process & Utility) | MERGE | `heat-exchangers` | binding: single HX family home; umbrella row |
| SRC-449 | Hot Water Generation Systems | MAP | `hot-water-generation` | 1:1 hot-water-thermal-oil leaf |
| SRC-450 | Thermal Oil Circulation Systems | MAP | `thermal-oil-circulation` | 1:1 hot-water-thermal-oil leaf |
| SRC-451 | Fuel Storage & Handling Systems | MAP | `fuel-storage-handling` | 1:1 burners-combustion leaf |
| SRC-452 | Burners & Combustion Systems | MAP | `industrial-burners` | 1:1 burners-combustion leaf |
| SRC-453 | Gas Train & Fuel Supply Systems | MAP | `gas-trains-fuel-systems` | 1:1 burners-combustion leaf |
| SRC-454 | Boiler Automation & Control Panels | MAP | `boiler-control-panels` | 1:1 boiler-controls-safety leaf |
| SRC-455 | Burner Management Systems (BMS) | MAP | `burner-management-systems` | 1:1; BMS abbreviation spelled out |
| SRC-456 | Safety Valves & Boiler Safety Systems | MAP | `boiler-safety-valves` | 1:1 boiler-controls-safety leaf |
| SRC-457 | Boiler EPC & Turnkey Projects | SERVICE | `boiler-thermal-epc` | boiler EPC service per table |
| SRC-458 | Boiler Installation & Commissioning | SERVICE | `equipment-installation` | installation/commissioning service; merged home |
| SRC-459 | Boiler Testing & Statutory Inspection | SERVICE | `statutory-inspection` | boiler statutory inspection service |
| SRC-460 | Annual Maintenance Contracts (AMC) | SERVICE | `amc-contracts` | AMC service; merged home (6 dups) |
| SRC-461 | Energy Audit & Boiler Efficiency Services | SERVICE | `energy-audits` | energy audit service; merged home |
| SRC-462 | Reciprocating Air Compressors | MAP | `reciprocating-compressors` | 1:1 air-compressors leaf |
| SRC-463 | Screw Air Compressors | MAP | `screw-compressors` | 1:1 air-compressors leaf |
| SRC-464 | Centrifugal Air Compressors | MAP | `centrifugal-compressors` | 1:1 air-compressors leaf |
| SRC-465 | Oil-Free Air Compressors | MAP | `oil-free-compressors` | 1:1 air-compressors leaf |
| SRC-466 | Portable & Skid-Mounted Compressors | MAP | `portable-compressors` | 1:1 air-compressors leaf |
| SRC-467 | Air Dryers (Refrigerated & Desiccant) | MAP | `air-dryers` | 1:1; type = attribute; source artifact ignored |
| SRC-468 | Air Receivers & Storage Tanks | MAP | `air-receivers` | 1:1 compressed-air-treatment leaf |
| SRC-469 | Air Filtration & Moisture Removal Systems | MAP | `air-filtration-systems` | 1:1 compressed-air-treatment leaf |
| SRC-470 | Compressed Air Piping & Distribution Systems | MAP | `compressed-air-piping` | 1:1 compressed-air-treatment leaf |
| SRC-471 | Nitrogen Generation Systems | MAP | `nitrogen-generators` | 1:1 industrial-gas leaf |
| SRC-472 | Oxygen Generation Systems | MAP | `oxygen-generators` | 1:1 industrial-gas leaf |
| SRC-473 | Industrial Gas Mixing Systems | MAP | `gas-mixing-systems` | 1:1 industrial-gas leaf |
| SRC-474 | Gas Storage & Cylinder Manifold Systems | MAP | `gas-storage-manifolds` | 1:1 industrial-gas leaf |
| SRC-475 | Vacuum Pumps (Liquid Ring, Rotary Vane, Dry) | MAP | `vacuum-pumps` | 1:1; pump type = attribute |
| SRC-476 | Central Vacuum Systems | MAP | `central-vacuum-systems` | 1:1 vacuum-systems leaf |
| SRC-477 | Vacuum Filtration & Suction Systems | MAP | `vacuum-filtration-suction` | 1:1 vacuum-systems leaf |
| SRC-478 | Compressor Control & Sequencing Systems | MAP | `compressor-sequencing` | 1:1 compressed-air-controls leaf |
| SRC-479 | Energy Monitoring for Compressed Air | MERGE | `energy-monitoring-systems` | energy-monitoring dup folds into single home |
| SRC-480 | Leak Detection & Air Audit Systems | SPLIT | `air-leak-detection;energy-audits` | detection hardware primary; air audit is service |
| SRC-481 | Compressed Air System EPC & Turnkey Projects | SERVICE | `compressed-air-epc` | compressed air EPC service per table |
| SRC-482 | Installation & Commissioning Services | SERVICE | `equipment-installation` | installation/commissioning service; merged home |
| SRC-483 | Annual Maintenance Contracts (AMC) | SERVICE | `amc-contracts` | AMC service; merged home (6 dups) |
| SRC-484 | Energy Audit & System Optimization Services | SERVICE | `energy-audits` | energy audit service; merged home |
| SRC-485 | Central HVAC Systems (Chillers & AHUs) | MAP | `chillers-ahus` | 1:1 industrial-hvac leaf |
| SRC-486 | Industrial Ventilation & Exhaust Systems | MAP | `ventilation-exhaust` | 1:1 industrial-hvac leaf |
| SRC-487 | Precision Air Conditioning Systems | MAP | `precision-ac` | 1:1 industrial-hvac leaf |
| SRC-488 | Process Cooling & Heating Systems | MAP | `process-cooling-heating` | 1:1 industrial-hvac leaf |
| SRC-489 | Cleanroom HVAC Systems | MAP | `cleanroom-hvac` | 1:1 cleanroom-systems leaf |
| SRC-490 | Cleanroom Panels & Modular Cleanrooms | MAP | `cleanroom-panels` | 1:1 cleanroom-systems leaf |
| SRC-491 | Laminar Air Flow (LAF) & HEPA Filter Units | MAP | `laf-hepa-units` | 1:1 cleanroom-systems leaf |
| SRC-492 | Air Showers & Pass Boxes | MAP | `air-showers-pass-boxes` | 1:1 cleanroom-systems leaf |
| SRC-493 | Dehumidification Systems | MAP | `dehumidifiers` | 1:1 humidity-control leaf |
| SRC-494 | Humidification Systems | MAP | `humidifiers` | 1:1 humidity-control leaf |
| SRC-495 | Environmental Chambers (Industrial Use) | MAP | `environmental-chambers` | 1:1 humidity-control leaf |
| SRC-496 | Dust Collection & Fume Extraction Systems | SPLIT | `dust-collectors;fume-extraction-systems` | row names both; separate air-pollution-control homes |
| SRC-497 | Industrial Scrubbers (Wet & Dry) | MERGE | `industrial-scrubbers` | single scrubber home; absorbs 3 source occurrences |
| SRC-498 | Stack & Emission Control Systems | MAP | `stack-emission-control` | 1:1 air-pollution-control leaf |
| SRC-499 | Building Management Systems (BMS) | MAP | `bms-systems` | 1:1 building-management leaf |
| SRC-500 | HVAC Control Panels & Automation Systems | MAP | `hvac-control-panels` | 1:1 building-management leaf |
| SRC-501 | Energy Monitoring for HVAC Systems | MERGE | `energy-monitoring-systems` | energy-monitoring dup folds into single home |
| SRC-502 | HVAC & Cleanroom EPC & Turnkey Projects | SERVICE | `hvac-cleanroom-epc` | HVAC/cleanroom EPC service per table |
| SRC-503 | Installation & Commissioning Services | SERVICE | `equipment-installation` | installation/commissioning service; merged home |
| SRC-504 | Testing, Balancing & Validation (TAB) | SERVICE | `tab-services` | TAB service per services table |
| SRC-505 | Annual Maintenance Contracts (AMC) | SERVICE | `amc-contracts` | AMC service; merged home (6 dups) |
| SRC-506 | Fire Alarm Control Panels | MAP | `fire-alarm-panels` | 1:1 fire-detection leaf |
| SRC-507 | Smoke, Heat & Flame Detection Systems | MAP | `fire-detectors` | 1:1 fire-detection leaf |
| SRC-508 | Manual Call Points & Alarm Devices | MAP | `call-points-alarm-devices` | 1:1 fire-detection leaf |
| SRC-509 | Public Address & Voice Evacuation Systems | MAP | `voice-evacuation-pa` | 1:1 fire-detection leaf |
| SRC-510 | Fire Sprinkler Systems | MAP | `sprinkler-systems` | 1:1 fire-suppression leaf |
| SRC-511 | Hydrant & Hose Reel Systems | MAP | `hydrant-hose-reel` | 1:1 fire-suppression leaf |
| SRC-512 | Gas-Based Fire Suppression Systems | MAP | `gas-suppression-systems` | 1:1 fire-suppression leaf |
| SRC-513 | Foam-Based Fire Suppression Systems | MAP | `foam-suppression-systems` | 1:1 fire-suppression leaf |
| SRC-514 | Portable & Mobile Fire Extinguishers | MERGE | `fire-extinguishers` | single home; absorbs Safety L1 dup |
| SRC-515 | Electrical & Panel Room Fire Protection | MERGE | `special-hazard-fire-protection` | application becomes attribute; specialized rows collapse |
| SRC-516 | Data Center & Server Room Fire Protection | MERGE | `special-hazard-fire-protection` | application becomes attribute; specialized rows collapse |
| SRC-517 | Kitchen Hood Fire Suppression Systems | MERGE | `special-hazard-fire-protection` | application becomes attribute; specialized rows collapse |
| SRC-518 | High Hazard & Industrial Fire Protection Systems | MERGE | `special-hazard-fire-protection` | application becomes attribute; specialized rows collapse |
| SRC-519 | Emergency Lighting Systems | MERGE | `emergency-lighting` | single home; absorbs Safety L1 dup |
| SRC-520 | Exit Signs & Escape Route Systems | MAP | `exit-signage` | 1:1 emergency-escape leaf |
| SRC-521 | Fireman Communication & Control Systems | MAP | `fireman-communication` | 1:1 emergency-escape leaf |
| SRC-522 | Fire Alarm Monitoring Systems | MERGE | `fire-alarm-monitoring` | fire monitoring rows collapse into one leaf |
| SRC-523 | Integration with BMS / SCADA | SERVICE | `utility-automation-epc` | BMS/SCADA integration is a service |
| SRC-524 | Remote Fire Safety Monitoring Systems | MERGE | `fire-alarm-monitoring` | remote fire monitoring joins monitoring leaf |
| SRC-525 | Fire Protection EPC & Turnkey Projects | SERVICE | `fire-protection-epc` | fire EPC service per table |
| SRC-526 | Installation & Commissioning Services | SERVICE | `equipment-installation` | installation/commissioning service; merged home |
| SRC-527 | Fire Safety Audit & Compliance Services | SERVICE | `safety-compliance-audits` | fire safety audit service; merged home |
| SRC-528 | Annual Maintenance Contracts (AMC) | SERVICE | `amc-contracts` | AMC service; merged home (6 dups) |
| SRC-529 | Fire Drill & Safety Training Services | SERVICE | `safety-compliance-training` | fire drill/training service; merged home |
| SRC-530 | Utility PLC & SCADA Systems | SPLIT | `plc-systems;scada-hmi` | row names both; PLC and SCADA homes separate |
| SRC-531 | Distributed Utility Control Systems | MAP | `dcs-systems` | distributed utility control = DCS home |
| SRC-532 | Utility Control Panels & RTU Systems | SPLIT | `control-panels;rtu-telemetry` | binding split: panels and RTU homes separate |
| SRC-533 | Energy Monitoring Systems (EMS) | MERGE | `energy-monitoring-systems` | EMS dup folds into single home |
| SRC-534 | Power & Utility Metering Systems | MERGE | `energy-monitoring-systems` | metering folds into energy monitoring home |
| SRC-535 | Sub-Metering & Load Monitoring Systems | MERGE | `energy-monitoring-systems` | sub-metering/load monitoring joins metering home |
| SRC-536 | Energy Analytics & Reporting Platforms | MAP | `energy-analytics-software` | software row moved to software branch |
| SRC-537 | OEE & Utility Performance Monitoring | MERGE | `production-monitoring-oee` | OEE dup folds into single home |
| SRC-538 | Demand Management & Peak Load Control Systems | MERGE | `energy-monitoring-systems` | demand/peak-load control folds into energy management |
| SRC-539 | Predictive Maintenance Systems (Utility Assets) | MERGE | `predictive-maintenance-systems` | predictive maintenance dup folds into single home |
| SRC-540 | Remote Utility Monitoring Systems | MERGE | `remote-monitoring-platforms` | remote monitoring rows collapse into platform home |
| SRC-541 | Cloud-Based Utility Dashboards | MERGE | `remote-monitoring-platforms` | cloud dashboards join remote monitoring platforms |
| SRC-542 | Alarm Management & Notification Systems | MERGE | `remote-monitoring-platforms` | alarm management joins remote monitoring platforms |
| SRC-543 | Utility Automation System Integration | SERVICE | `utility-automation-epc` | utility system integration service per table |
| SRC-544 | Integration with BMS / DCS / SCADA | SERVICE | `utility-automation-epc` | BMS/DCS/SCADA integration service per table |
| SRC-545 | Data Acquisition & Historian Systems | MAP | `data-historians` | 1:1 monitoring-systems leaf |
| SRC-546 | Utility Automation EPC & Turnkey Projects | SERVICE | `utility-automation-epc` | utility automation EPC service per table |
| SRC-547 | System Commissioning & Validation | SERVICE | `equipment-installation` | commissioning service; closest installation family home |
| SRC-548 | Annual Maintenance Contracts (AMC) | SERVICE | `amc-contracts` | AMC service; merged home (6 dups) |
| SRC-549 | Energy Audit & Utility Optimization Services | SERVICE | `energy-audits` | energy audit service; merged home |
| SRC-550 | Manufacturing & Utility Buildings | SERVICE | `industrial-civil-works` | civil works row; buildings are construction service |
| SRC-551 | RCC & Steel Structural Works | SERVICE | `industrial-civil-works` | RCC/steel structural works are construction service |
| SRC-552 | Epoxy, PU & Heavy Duty Flooring | SPLIT | `epoxy-pu-flooring;flooring-application-services` | product plus application service per binding rule |
| SRC-553 | Roads, Pavements & Drainage | SERVICE | `roads-yard-works` | roads/pavement works; drainage part duplicated at SRC-560 |
| SRC-554 | Industrial & Warehouse Sheds | MAP | `peb-sheds` | 1:1 PEB product |
| SRC-555 | Steel Structures & Modular Buildings | MAP | `steel-structures-modular` | 1:1 product |
| SRC-556 | Mezzanine Floors & Platforms | MAP | `mezzanine-floors` | 1:1 product |
| SRC-557 | Metal & Insulated Roofing | MAP | `metal-insulated-roofing` | 1:1 product |
| SRC-558 | Metal & Composite Cladding | MAP | `wall-cladding` | 1:1 product |
| SRC-559 | Thermal Insulation & Waterproofing | MAP | `thermal-insulation-waterproofing` | 1:1 product |
| SRC-560 | Storm Water & Sewerage Systems | SERVICE | `drainage-underground-works` | storm water/sewerage works are construction service |
| SRC-561 | Underground Piping & Cable Ducts | SERVICE | `drainage-underground-works` | underground piping/duct works are construction service |
| SRC-562 | Boundary, Fencing & External Works | SERVICE | `site-development-works` | boundary works; security fencing product stays perimeter-security |
| SRC-563 | Earthmoving, Concrete & Lifting Equipment | SPLIT | `earthmoving-equipment;concrete-equipment;construction-lifting-equipment` | grouped construction machinery split per binding rule |
| SRC-564 | Turnkey Construction & PMC Services | SPLIT | `industrial-civil-works;project-management-pmc` | turnkey construction plus PMC per binding rule |
| SRC-565 | Forklifts, Stackers & Pallet Trucks | SPLIT | `forklifts;stackers-pallet-trucks` | grouped lifting equipment split |
| SRC-566 | Belt, Roller & Screw Conveyors | SPLIT | `belt-conveyors;roller-conveyors;screw-conveyors` | grouped conveyors split; canonical conveyor home |
| SRC-567 | Overhead, Gantry & Jib Cranes | SPLIT | `overhead-cranes;gantry-cranes;jib-cranes` | grouped cranes split |
| SRC-568 | Pallet Racking & Industrial Shelving | SPLIT | `pallet-racking;industrial-shelving` | grouped racking/shelving split |
| SRC-569 | Silos, Bins & Storage Tanks | SPLIT | `silos;hoppers-bins;bulk-storage-tanks` | grouped bulk storage split; canonical home |
| SRC-570 | ASRS & Automated Storage Systems | MAP | `asrs-automation` | 1:1 warehouse automation |
| SRC-571 | Pallet Wrappers & Strapping Machines | SPLIT | `stretch-shrink-wrappers;strapping-machines` | wrappers and strapping split; end-of-line home |
| SRC-572 | Dock Levelers & Dock Shelters | SPLIT | `dock-levelers;dock-shelters-seals` | grouped dock equipment split |
| SRC-573 | Industrial Packaging & Crating | MAP | `industrial-packaging-crating` | 1:1 transit packaging |
| SRC-574 | Intralogistics & Material Flow Systems | MAP | `material-flow-systems` | intralogistics/material flow home |
| SRC-575 | Industrial Transport & Fleet Services | SERVICE | `transport-fleet-services` | transport and fleet service row |
| SRC-576 | Turnkey Material Handling & Logistics Projects | SERVICE | `material-handling-epc` | turnkey material handling EPC service |
| SRC-577 | Calipers, Micrometers & Gauges | MERGE | `calipers-micrometers-gauges` | collapses with MRO measuring-tools dup |
| SRC-578 | Ultrasonic, Magnetic & Radiography Testing | SPLIT | `ultrasonic-testing-equipment;magnetic-penetrant-testing;radiography-testing-equipment` | grouped NDT split |
| SRC-579 | Spectrophotometers & Chromatographs | SPLIT | `spectrophotometers;chromatographs` | grouped analytical instruments split |
| SRC-580 | UTM, Hardness & Impact Testers | SPLIT | `universal-testing-machines;hardness-testers;impact-testers` | grouped material testers split |
| SRC-581 | Vision Inspection & Checkweighers | SPLIT | `vision-inspection;checkweighers` | split; inline inspection canonical in packaging-inspection |
| SRC-582 | Online Sensors & Analyzers | MAP | `online-analyzers` | process instrumentation home per rule |
| SRC-583 | Calibration Instruments & Standards | MAP | `calibration-equipment` | instruments are product; services live separately |
| SRC-584 | Lab & On-Site Calibration Services | SERVICE | `calibration-services` | calibration service row |
| SRC-585 | Material, Product & Compliance Testing | SERVICE | `third-party-testing` | third-party testing service |
| SRC-586 | ISO, GMP & Quality Audits | SERVICE | `iso-gmp-certification` | merges with Business Services certification dup |
| SRC-587 | Helmets, Gloves, Shoes & Safety Wear | SPLIT | `head-eye-face-protection;hand-protection;foot-protection;body-protection-workwear` | grouped PPE split across PPE children |
| SRC-588 | Safety Barriers, Signage & Guarding | SPLIT | `safety-barriers-guarding;safety-signage` | barriers/guarding and signage split |
| SRC-589 | Fire Extinguishers & Emergency Kits | MERGE | `fire-extinguishers` | dup of Fire Suppression extinguishers; collapses there |
| SRC-590 | Emergency Lighting & Alarm Systems | MERGE | `emergency-lighting` | dup of Emergency Systems lighting; collapses there |
| SRC-591 | CCTV, Access Control & Time Attendance | SPLIT | `cctv-surveillance;access-control-attendance` | CCTV and access control split |
| SRC-592 | Fencing, Bollards & Security Barriers | MAP | `perimeter-security` | security fencing/bollards product home |
| SRC-593 | Dust Collectors & Scrubber Systems | SPLIT | `baghouse-dust-collectors;industrial-scrubbers` | dust collector/scrubber dup lands in air-pollution-control |
| SRC-594 | Air, Water & Noise Monitoring Systems | SPLIT | `air-quality-monitoring;water-quality-monitoring;noise-monitoring` | grouped environmental monitoring split |
| SRC-595 | EHS, Fire & Compliance Audits | SERVICE | `safety-compliance-audits` | EHS/fire audit service; merges audit dups |
| SRC-596 | Safety Training & Environmental Compliance | SERVICE | `safety-compliance-training` | safety and compliance training service |
| SRC-597 | Servers, Storage & Industrial Networking | SPLIT | `servers-storage;industrial-networking` | grouped IT hardware split |
| SRC-598 | Industrial Data Centers & Cloud Services | SPLIT | `data-center-infrastructure;cloud-hosting-services` | infrastructure product plus cloud service per rule |
| SRC-599 | PLC, RTU & Industrial Controllers | SPLIT | `plc-systems;rtu-telemetry` | PLC and RTU split; control-systems home |
| SRC-600 | SCADA & HMI Systems | MERGE | `scada-hmi` | merges four SCADA/HMI source occurrences |
| SRC-601 | MES & Production Management Systems | MAP | `mes-software` | 1:1 software |
| SRC-602 | CMMS & Asset Management Systems | MAP | `cmms-software` | 1:1 software |
| SRC-603 | ERP, SCM & Inventory Management Software | MAP | `erp-scm-software` | 1:1 software |
| SRC-604 | QMS & Compliance Management Systems | MAP | `qms-software` | 1:1 software |
| SRC-605 | OT Security & Network Protection Systems | MAP | `ot-security-systems` | 1:1 OT security |
| SRC-606 | System Integration, Deployment & AMC Services | SPLIT | `system-integration-services;software-support-amc` | integration/deployment plus software AMC per rule |
| SRC-607 | Process, Mechanical & Electrical Engineering | SERVICE | `process-engineering;mechanical-electrical-engineering` | grouped row spans both engineering-design children |
| SRC-608 | Detailed Engineering & Technical Documentation | SERVICE | `detailed-engineering` | detailed engineering and documentation service |
| SRC-609 | EPC & Turnkey Industrial Projects | SERVICE | `industrial-epc` | general EPC umbrella; domain EPC rows elsewhere |
| SRC-610 | Project Management & PMC Services | SERVICE | `project-management-pmc` | PMC home; merges construction PMC dup |
| SRC-611 | Licensing, Statutory & Regulatory Approvals | SERVICE | `licensing-regulatory` | licensing and regulatory approvals service |
| SRC-612 | ISO, GMP & Industry Certifications | SERVICE | `iso-gmp-certification` | certification home; merges Quality audits dup |
| SRC-613 | Financial Advisory & Project Finance | SERVICE | `financial-advisory` | 1:1 service |
| SRC-614 | Global Sourcing & Vendor Development | SERVICE | `procurement-sourcing` | sourcing and vendor development service |
| SRC-615 | Manpower Supply & Recruitment Services | SERVICE | `manpower-recruitment` | 1:1 service |
| SRC-616 | Technical, Safety & Compliance Training | SERVICE | `technical-training;safety-compliance-training` | grouped training row spans both leaves |
| SRC-617 | Ball, Roller & Thrust Bearings | SPLIT | `ball-bearings;roller-bearings;thrust-bearings` | grouped bearing types split to bearing children |
| SRC-618 | Gearboxes, Gear Motors & Speed Reducers | MAP | `gearboxes-reducers` | gear motors = attribute per tree note |
| SRC-619 | Couplings, Chains & Sprockets | SPLIT | `couplings;chains-sprockets` | grouped row split to transmission children |
| SRC-620 | Pulleys, Belts & Bushes | SPLIT | `belts-pulleys;bushes-sleeves-rails` | belts/pulleys home; bushes are wear parts |
| SRC-621 | Oil Seals, O-Rings & Gaskets | SPLIT | `oil-seals-o-rings;gaskets-packings` | seals and gaskets split to seals-gaskets children |
| SRC-622 | Wear Plates, Liners & Wear Strips | MERGE | `wear-plates-liners` | merges with crusher-spares Wear Plates dup |
| SRC-623 | Bushes, Sleeves & Guide Rails | MAP | `bushes-sleeves-rails` | 1:1 wear-parts child |
| SRC-624 | Bolts, Nuts, Washers & Studs | MAP | `bolts-nuts-washers` | studs = synonym |
| SRC-625 | Industrial Screws, Anchors & Rivets | MAP | `screws-anchors-rivets` | 1:1 fasteners child |
| SRC-626 | Springs, Pins & Mechanical Locks | MAP | `springs-pins` | mechanical locks = locking hardware |
| SRC-627 | MCB, MCCB, ACB & Fuse Systems | MAP | `circuit-breakers-fuses` | MCB/MCCB/ACB = attribute+synonyms |
| SRC-628 | Contactors, Relays & Overload Relays | MERGE | `contactors-relays` | home merges block-13 switchgear spares dup |
| SRC-629 | Push Buttons, Indicators & Switchgear | MAP | `push-buttons-indicators` | 1:1 electrical-spares child |
| SRC-630 | PLC Modules, I/O Cards & Racks | MAP | `plc-modules-io` | 1:1 automation-spares child |
| SRC-631 | HMI Panels & Operator Interfaces | MAP | `hmi-spares` | 1:1 automation-spares child |
| SRC-632 | VFDs, Servo Drives & Controllers | MAP | `drive-spares` | spares context; whole drives live in motors-drives |
| SRC-633 | Power, Control & Instrumentation Cables | MAP | `power-control-cables` | 1:1 cables child |
| SRC-634 | Cable Glands, Lugs, Ferrules & Connectors | MAP | `cable-glands-lugs` | ferrules = synonym |
| SRC-635 | Cable Trays, Trunking & Raceway Accessories | MAP | `cable-trays-trunking` | raceway = synonym |
| SRC-636 | Hydraulic Pumps, Motors & Cylinders | MAP | `hydraulic-pumps-cylinders` | 1:1 hydraulics child |
| SRC-637 | Hydraulic Valves, Manifolds & Power Packs | MAP | `hydraulic-valves-power-packs` | manifolds = attribute |
| SRC-638 | Hydraulic Hoses, Pipes & Fittings | MAP | `hydraulic-hoses-fittings` | 1:1 hydraulics child |
| SRC-639 | Air Cylinders, Actuators & Grippers | MAP | `pneumatic-cylinders-actuators` | 1:1 pneumatics child |
| SRC-640 | Solenoid Valves, Directional Valves & FRL Units | MAP | `pneumatic-valves-frl` | directional valves = attribute |
| SRC-641 | Pneumatic Tubes, Push Fittings & Accessories | MAP | `pneumatic-fittings-tubing` | 1:1 pneumatics child |
| SRC-642 | Air Filters, Oil Separators & Dryer Elements | MERGE | `compressed-air-spares` | merges with vacuum pump spares row |
| SRC-643 | Vacuum Pumps Spares & Suction Accessories | MERGE | `compressed-air-spares` | merges with air filter/separator row |
| SRC-644 | Industrial Oils, Greases & Lubricants | MAP | `lubricants-oils` | 1:1 consumables child |
| SRC-645 | Cutting Fluids, Coolants & Rust Preventives | MAP | `cutting-fluids-coolants` | rust preventives included per tree |
| SRC-646 | Cleaning, Degreasing & Descaling Chemicals | MAP | `maintenance-chemicals` | degreasing/descaling home |
| SRC-647 | Welding Electrodes, MIG/TIG Wires & Flux | MAP | `welding-consumables` | 1:1 consumables child |
| SRC-648 | Gas Cutting Nozzles, Tips & Accessories | MERGE | `welding-machine-spares` | gas cutting nozzles go to welding spares |
| SRC-649 | Abrasives, Grinding Wheels & Cutting Discs | MAP | `abrasives` | grinding wheels included |
| SRC-650 | Industrial Tapes, Films & Strapping Materials | MAP | `tapes-films-strapping` | 1:1 consumables child |
| SRC-651 | Wipers, Rags, Absorbents & Spill Kits | MAP | `wipers-absorbents` | 1:1 consumables child |
| SRC-652 | Adhesives, Sealants & Industrial Tapes | SPLIT | `industrial-adhesives;tapes-films-strapping` | canonical adhesives home in chemicals; tapes stay consumables |
| SRC-653 | Hand Tools (Spanners, Pliers, Hammers) | MAP | `hand-tools` | 1:1 tools child |
| SRC-654 | Electric, Pneumatic & Cordless Power Tools | MAP | `power-tools` | electric/pneumatic/cordless = attribute |
| SRC-655 | Tool Bits, Blades & Accessories | MAP | `tool-accessories` | 1:1 tools child |
| SRC-656 | Calipers, Micrometers & Dial Gauges | MERGE | `calipers-micrometers-gauges` | merges with Quality L1 metrology dup |
| SRC-657 | Multimeters, Clamp Meters & Testers | MAP | `electrical-test-instruments` | portable testers move to quality-lab home |
| SRC-658 | Tool Cabinets, Workbenches & Storage Systems | MAP | `workbenches-storage` | 1:1 tools child |
| SRC-659 | Maintenance Kits, LOTO Devices & Safety Tags | SPLIT | `maintenance-kits;lockout-tagout` | kits stay tools; LOTO/tags go to safety |
| SRC-660 | Original OEM Spare Parts | ATTRIBUTE | `machine-spares` | sourcing OEM = attribute, not category |
| SRC-661 | Authorized Compatible Spare Parts | ATTRIBUTE | `machine-spares` | sourcing authorized = attribute, not category |
| SRC-662 | Critical Machine Replacement Parts | ATTRIBUTE | `machine-spares` | urgency critical = attribute, not category |
| SRC-663 | Emergency Breakdown Spares | ATTRIBUTE | `machine-spares` | urgency emergency = attribute, not category |
| SRC-664 | Preventive Maintenance Spare Kits | MERGE | `maintenance-kits` | PM kits merge with shutdown sets |
| SRC-665 | Shutdown & Overhaul Spare Sets | MERGE | `maintenance-kits` | shutdown/overhaul sets merge with PM kits |
| SRC-666 | Industrial MRO Supply Contracts | SERVICE | `mro-supply-programs` | supply contract is a service |
| SRC-667 | Rate Contract & Annual Supply Agreements | SERVICE | `mro-supply-programs` | rate contracts are services |
| SRC-668 | MRO Inventory Management Services | SERVICE | `mro-supply-programs` | inventory management is a service |
| SRC-669 | Vendor Managed Inventory (VMI) | SERVICE | `mro-supply-programs` | VMI is a service |
| SRC-670 | Just-In-Time (JIT) MRO Supply Programs | SERVICE | `mro-supply-programs` | JIT supply program is a service |
| SRC-671 | Mild Steel (MS) Materials | MERGE | `ms-sections` | header row folds into MS stock home |
| SRC-672 | MS Shaft | MERGE | `ms-sections` | form shaft = attribute |
| SRC-673 | MS Round Bar | MERGE | `ms-sections` | form round bar = attribute |
| SRC-674 | MS Flat | MERGE | `ms-sections` | form flat = attribute |
| SRC-675 | MS Plate | MERGE | `ms-sections` | form plate = attribute |
| SRC-676 | MS Angle | MERGE | `ms-sections` | form angle = attribute |
| SRC-677 | MS Channel | MERGE | `ms-sections` | form channel = attribute |
| SRC-678 | Alloy & Carbon Steel Materials | MERGE | `alloy-carbon-steel-stock` | header row folds into alloy/carbon stock home |
| SRC-679 | Alloy Steel Bars & Shafts | MERGE | `alloy-carbon-steel-stock` | form bars/shafts = attribute |
| SRC-680 | Carbon Steel Plates & Flats | MERGE | `alloy-carbon-steel-stock` | form plates/flats = attribute |
| SRC-681 | Stainless Steel Materials | MERGE | `stainless-steel-stock` | header row folds into SS stock home |
| SRC-682 | Stainless Steel Rods & Shafts | MERGE | `stainless-steel-stock` | form rods/shafts = attribute |
| SRC-683 | Stainless Steel Plates & Flats | MERGE | `stainless-steel-stock` | form plates/flats = attribute |
| SRC-684 | Non-Ferrous Workshop Materials | MERGE | `non-ferrous-stock` | header row folds into non-ferrous stock home |
| SRC-685 | Aluminium Rods & Plates | MERGE | `non-ferrous-stock` | form rods/plates = attribute |
| SRC-686 | Brass & Copper Rods | MERGE | `non-ferrous-stock` | brass/copper rods = attribute |
| SRC-687 | Spindle | MERGE | `spinning-spares` | spinning item folds into family leaf |
| SRC-688 | Spindle Tape | MERGE | `spinning-spares` | spinning item folds into family leaf |
| SRC-689 | Spinning Ring | MERGE | `spinning-spares` | spinning item folds into family leaf |
| SRC-690 | Ring Traveller | MERGE | `spinning-spares` | spinning item folds into family leaf |
| SRC-691 | Bobbin | MERGE | `spinning-spares` | spinning item folds into family leaf |
| SRC-692 | Apron | MERGE | `spinning-spares` | spinning item folds into family leaf |
| SRC-693 | Spinning Cloth / Tula | MERGE | `spinning-spares` | Tula = local synonym per tree |
| SRC-694 | Card Clothing | MERGE | `carding-combing-spares` | carding item folds into family leaf |
| SRC-695 | Comber Parts | MERGE | `carding-combing-spares` | combing item folds into family leaf |
| SRC-696 | Reeds & Heald Wires | MERGE | `weaving-knitting-spares` | reeds/healds fold into family leaf |
| SRC-697 | Needles & Sinkers | MERGE | `weaving-knitting-spares` | needles/sinkers fold into family leaf |
| SRC-698 | Mill Liners | MERGE | `cement-mill-kiln-spares` | cement item folds into family leaf |
| SRC-699 | Grinding Media | MERGE | `cement-mill-kiln-spares` | cement item folds into family leaf |
| SRC-700 | Kiln Tyres & Rollers | MERGE | `cement-mill-kiln-spares` | cement item folds into family leaf |
| SRC-701 | Girth Gears | MERGE | `cement-mill-kiln-spares` | cement item folds into family leaf |
| SRC-702 | Burner Nozzles | MERGE | `cement-mill-kiln-spares` | cement item folds into family leaf |
| SRC-703 | Jaw Plates | MERGE | `crusher-spares` | crusher item folds into family leaf |
| SRC-704 | Impact Hammers | MERGE | `crusher-spares` | crusher item folds into family leaf |
| SRC-705 | Wear Plates | MERGE | `wear-plates-liners` | binding exception: wear plates go to wear-parts home |
| SRC-706 | Blades & Knives | MERGE | `food-processing-spares` | food item folds into family leaf |
| SRC-707 | Screens & Sieves | MERGE | `food-processing-spares` | food item folds into family leaf |
| SRC-708 | Seals & Gaskets (Food Grade) | MERGE | `food-processing-spares` | food-grade = attribute per tree |
| SRC-709 | Conveyor Belts (Food Grade) | MERGE | `food-processing-spares` | food-grade belts = attribute per tree |
| SRC-710 | Sealing Jaws | MERGE | `filling-line-spares` | filling-line item folds into family leaf |
| SRC-711 | Filling Nozzles | MERGE | `filling-line-spares` | filling-line item folds into family leaf |
| SRC-712 | Capping Heads | MERGE | `filling-line-spares` | filling-line item folds into family leaf |
| SRC-713 | Punches & Dies | MERGE | `pharma-tooling` | pharma item folds into family leaf |
| SRC-714 | Tablet Compression Tooling | MERGE | `pharma-tooling` | pharma item folds into family leaf |
| SRC-715 | Coating Pan Parts | MERGE | `pharma-tooling` | pharma item folds into family leaf |
| SRC-716 | Granulator Screens | MERGE | `pharma-tooling` | pharma item folds into family leaf |
| SRC-717 | Agitator Blades | MERGE | `chemical-machine-spares` | chemical item folds into family leaf |
| SRC-718 | Reactor Seals & Liners | MERGE | `chemical-machine-spares` | chemical item folds into family leaf |
| SRC-719 | Screw & Barrel | MERGE | `injection-molding-spares` | molding item folds into family leaf |
| SRC-720 | Nozzle Tips | MERGE | `injection-molding-spares` | molding item folds into family leaf |
| SRC-721 | Heater Bands | MERGE | `injection-molding-spares` | molding item folds into family leaf |
| SRC-722 | Tie Bar Nuts | MERGE | `injection-molding-spares` | molding item folds into family leaf |
| SRC-723 | Die Heads | MERGE | `extrusion-blow-spares` | extrusion item folds into family leaf |
| SRC-724 | Calibration Sleeves | MERGE | `extrusion-blow-spares` | blow-molding item folds into family leaf |
| SRC-725 | Cutting Blades | MERGE | `packaging-machine-spares` | packaging item folds into family leaf |
| SRC-726 | Teflon Belts | MERGE | `packaging-machine-spares` | packaging item folds into family leaf |
| SRC-727 | Guide Rollers | MERGE | `packaging-machine-spares` | packaging item folds into family leaf |
| SRC-728 | Print Rollers | MERGE | `printing-machine-spares` | printing item folds into family leaf |
| SRC-729 | Doctor Blades | MERGE | `printing-machine-spares` | printing item folds into family leaf |
| SRC-730 | Ball Screws | MERGE | `cnc-spares` | CNC item folds into family leaf |
| SRC-731 | Linear Guides | MERGE | `cnc-spares` | CNC item folds into family leaf |
| SRC-732 | Spindle Motors | MERGE | `cnc-spares` | CNC item folds into family leaf |
| SRC-733 | Welding Torches | MERGE | `welding-machine-spares` | welding item folds into family leaf |
| SRC-734 | Cutting Nozzles | MERGE | `welding-machine-spares` | dup of gas cutting nozzles; same home |
| SRC-735 | Chuck Jaws | MERGE | `welding-machine-spares` | chuck jaws fold into family leaf |
| SRC-736 | Boiler Tubes | MERGE | `boiler-spares` | boiler item folds into family leaf |
| SRC-737 | Burner Spares | MERGE | `boiler-spares` | boiler item folds into family leaf |
| SRC-738 | Refractory Components | MERGE | `boiler-spares` | refractory folds into family leaf |
| SRC-739 | Impellers | MERGE | `pump-compressor-spares` | impellers fold into family leaf |
| SRC-740 | Shafts & Sleeves | MERGE | `pump-compressor-spares` | shafts/sleeves fold into family leaf |
| SRC-741 | Seal Kits | MERGE | `pump-compressor-spares` | seal kits fold into family leaf |
| SRC-742 | Single Phase, Three Phase, Gear Motors | MERGE | `electric-motors` | whole motors home; phase/gear = attributes |
| SRC-743 | Carbon Brushes, Capacitors, Cooling Fans | MAP | `motor-spares` | motor components stay MRO spares |
| SRC-744 | VFDs, Soft Starters, Motor Controllers | SPLIT | `variable-frequency-drives;soft-starters` | whole drives split to motors-drives children |
| SRC-745 | Centrifugal, Submersible, Diaphragm Pumps | SPLIT | `centrifugal-pumps;submersible-pumps;diaphragm-pumps` | whole pumps split to industrial-pumps children |
| SRC-746 | Mechanical Seals, Impellers, Pump Shafts | SPLIT | `mechanical-seals;pump-compressor-spares` | seals vs pump components split |
| SRC-747 | Gaskets, O-Rings, Gland Packings | MERGE | `gaskets-packings` | merges with block-10 gasket rows per binding |
| SRC-748 | V-Belts, Timing Belts, Taper Lock Pulleys | MERGE | `belts-pulleys` | merges block-13 dup; belt types = attribute |
| SRC-749 | Roller Chains, Conveyor Chains, Sprockets | MERGE | `chains-sprockets` | merges block-13 dup into transmission home |
| SRC-750 | Ball Bearings, Roller Bearings, Pillow Blocks | SPLIT | `ball-bearings;roller-bearings;pillow-blocks-housings` | grouped bearing row split to bearing children |
| SRC-751 | Contactors, Relays, Circuit Breaker Spares | MERGE | `contactors-relays` | switchgear spares merge into contactors-relays home |

## Appendix C — Taxonomy Content v1.0 master table (794 nodes, import-ready)

Depth-first (parent always precedes children — seedable in row order). `note` records design
decisions (HOME = canonical-home consolidation; ADD = new family absent from source;
attribute notes = what was demoted from node to attribute).

| slug | L | parent | name | design note |
|---|---|---|---|---|
| `raw-materials` | 1 | — | Raw Materials & Chemicals |  |
| `industrial-chemicals` | 2 | `raw-materials` | Industrial Chemicals |  |
| `basic-chemicals` | 3 | `industrial-chemicals` | Basic Chemicals, Acids & Alkalis |  |
| `industrial-acids` | 4 | `basic-chemicals` | Industrial Acids | types (sulphuric/HCl/nitric/phosphoric) = attributes+synonyms |
| `industrial-alkalis` | 4 | `basic-chemicals` | Industrial Alkalis | caustic soda/soda ash = synonyms |
| `general-industrial-chemicals` | 4 | `basic-chemicals` | General Industrial Chemicals |  |
| `solvents-alcohols` | 3 | `industrial-chemicals` | Solvents & Industrial Alcohols |  |
| `hydrocarbon-solvents` | 4 | `solvents-alcohols` | Hydrocarbon Solvents |  |
| `ketone-solvents` | 4 | `solvents-alcohols` | Ketone Solvents |  |
| `industrial-alcohols` | 4 | `solvents-alcohols` | Industrial Alcohols |  |
| `water-treatment-chemicals` | 3 | `industrial-chemicals` | Water Treatment & Utility Chemicals |  |
| `boiler-cooling-chemicals` | 4 | `water-treatment-chemicals` | Boiler & Cooling Tower Chemicals |  |
| `wtp-etp-chemicals` | 4 | `water-treatment-chemicals` | WTP & ETP Chemicals |  |
| `ro-membrane-chemicals` | 4 | `water-treatment-chemicals` | RO & Membrane Chemicals |  |
| `dyes-pigments-inks` | 3 | `industrial-chemicals` | Dyes, Pigments & Inks |  |
| `textile-dyes` | 4 | `dyes-pigments-inks` | Textile Dyes |  |
| `pigments` | 4 | `dyes-pigments-inks` | Pigments | organic/inorganic = attribute |
| `printing-inks-pastes` | 4 | `dyes-pigments-inks` | Printing Inks & Pastes |  |
| `adhesives-sealants-resins` | 3 | `industrial-chemicals` | Adhesives, Sealants & Resins | HOME: also absorbs MRO consumables adhesives dup |
| `industrial-adhesives` | 4 | `adhesives-sealants-resins` | Industrial Adhesives |  |
| `industrial-sealants` | 4 | `adhesives-sealants-resins` | Industrial Sealants |  |
| `synthetic-resins` | 4 | `adhesives-sealants-resins` | Synthetic Resins |  |
| `specialty-additives` | 3 | `industrial-chemicals` | Specialty Chemicals & Additives |  |
| `textile-auxiliaries` | 4 | `specialty-additives` | Textile Auxiliaries |  |
| `plastic-additives` | 4 | `specialty-additives` | Plastic Additives |  |
| `paint-coating-additives` | 4 | `specialty-additives` | Paint & Coating Additives |  |
| `polymers-plastics` | 2 | `raw-materials` | Polymers & Plastic Raw Materials |  |
| `commodity-polymers` | 3 | `polymers-plastics` | Commodity Polymers |  |
| `polypropylene-pp` | 4 | `commodity-polymers` | Polypropylene (PP) |  |
| `polyethylene-pe` | 4 | `commodity-polymers` | Polyethylene (PE) |  |
| `pvc-resin` | 4 | `commodity-polymers` | PVC Resin |  |
| `pet-resin` | 4 | `commodity-polymers` | PET Resin |  |
| `engineering-plastics` | 3 | `polymers-plastics` | Engineering Plastics |  |
| `abs-resin` | 4 | `engineering-plastics` | ABS |  |
| `polycarbonate` | 4 | `engineering-plastics` | Polycarbonate (PC) |  |
| `nylon-polyamide` | 4 | `engineering-plastics` | Nylon / Polyamide |  |
| `polystyrene` | 4 | `engineering-plastics` | Polystyrene (PS) |  |
| `elastomers-rubber` | 3 | `polymers-plastics` | Elastomers & Rubber Compounds | EVA/TPE/synthetic rubber = attributes+synonyms |
| `recycled-polymers` | 3 | `polymers-plastics` | Recycled Polymers | PP/PE/PET = attribute |
| `metals-alloys` | 2 | `raw-materials` | Metals & Alloys |  |
| `ferrous-metals` | 3 | `metals-alloys` | Ferrous Metals |  |
| `pig-sponge-iron` | 4 | `ferrous-metals` | Pig Iron & Sponge Iron |  |
| `steel-coils-sheets` | 4 | `ferrous-metals` | Steel Coils & Sheets | HR/CR/GI = attribute+synonyms |
| `non-ferrous-metals` | 3 | `metals-alloys` | Non-Ferrous Metals |  |
| `aluminium-metal` | 4 | `non-ferrous-metals` | Aluminium |  |
| `copper-metal` | 4 | `non-ferrous-metals` | Copper |  |
| `zinc-metal` | 4 | `non-ferrous-metals` | Zinc |  |
| `lead-metal` | 4 | `non-ferrous-metals` | Lead |  |
| `alloys-ferro-alloys` | 3 | `metals-alloys` | Alloys & Ferro Alloys |  |
| `ferro-alloys` | 4 | `alloys-ferro-alloys` | Ferro Alloys | FeMn/FeSi = attribute+synonyms |
| `brass-bronze` | 4 | `alloys-ferro-alloys` | Brass & Bronze |  |
| `metal-stock` | 3 | `metals-alloys` | Metal Stock & Semi-Finished Sections | HOME: absorbs MRO block-11 semi-finished materials |
| `ms-sections` | 4 | `metal-stock` | MS Bars, Plates & Sections | shaft/round bar/flat/plate/angle/channel = form attribute |
| `alloy-carbon-steel-stock` | 4 | `metal-stock` | Alloy & Carbon Steel Stock |  |
| `stainless-steel-stock` | 4 | `metal-stock` | Stainless Steel Stock |  |
| `non-ferrous-stock` | 4 | `metal-stock` | Non-Ferrous Metal Stock | aluminium/brass/copper rods & plates |
| `minerals-ores` | 2 | `raw-materials` | Minerals & Ores |  |
| `industrial-minerals` | 3 | `minerals-ores` | Industrial Minerals |  |
| `limestone-dolomite` | 4 | `industrial-minerals` | Limestone & Dolomite |  |
| `silica-quartz` | 4 | `industrial-minerals` | Silica Sand & Quartz |  |
| `kaolin-clays` | 4 | `industrial-minerals` | Kaolin & Industrial Clays | HOME: absorbs Construction Raw "Clay" |
| `energy-minerals` | 3 | `minerals-ores` | Energy Minerals |  |
| `industrial-coal` | 4 | `energy-minerals` | Industrial Coal |  |
| `metal-ores` | 3 | `minerals-ores` | Metal Ores |  |
| `iron-ore` | 4 | `metal-ores` | Iron Ore |  |
| `bauxite` | 4 | `metal-ores` | Bauxite |  |
| `textile-materials` | 2 | `raw-materials` | Textile Raw Materials |  |
| `textile-fibers` | 3 | `textile-materials` | Textile Fibers |  |
| `raw-cotton` | 4 | `textile-fibers` | Raw Cotton |  |
| `jute-fiber` | 4 | `textile-fibers` | Jute Fiber |  |
| `synthetic-fibers` | 4 | `textile-fibers` | Synthetic Fibers | polyester/viscose/nylon staple = attribute |
| `yarns` | 3 | `textile-materials` | Yarns | HOME: merges "Natural Fibers & Yarns" + "Yarns & Fibers" dup L3s |
| `cotton-yarn` | 4 | `yarns` | Cotton Yarn |  |
| `jute-yarn` | 4 | `yarns` | Jute Yarn |  |
| `polyester-yarn` | 4 | `yarns` | Polyester Yarn |  |
| `blended-specialty-yarns` | 4 | `yarns` | Blended & Specialty Yarns | PC/CVC/spandex = attribute+synonyms |
| `fabrics` | 3 | `textile-materials` | Fabrics | HOME: merges Greige Fabric L3 + Fabrics & Cloth Materials L3 |
| `greige-fabric` | 4 | `fabrics` | Greige Fabric | woven/knitted greige = attribute |
| `woven-fabric` | 4 | `fabrics` | Woven Fabric |  |
| `knitted-fabric` | 4 | `fabrics` | Knitted Fabric |  |
| `denim-fabric` | 4 | `fabrics` | Denim Fabric |  |
| `garment-trims` | 3 | `textile-materials` | Garment Accessories & Trims |  |
| `buttons` | 4 | `garment-trims` | Buttons |  |
| `zippers` | 4 | `garment-trims` | Zippers |  |
| `hooks-eyelets` | 4 | `garment-trims` | Hooks & Eyelets |  |
| `elastic-tapes` | 4 | `garment-trims` | Elastic Tapes |  |
| `labels-tags` | 4 | `garment-trims` | Labels & Tags |  |
| `agro-food-ingredients` | 2 | `raw-materials` | Agro & Food Ingredients (Industrial) |  |
| `grains-cereals` | 3 | `agro-food-ingredients` | Grains & Cereals | wheat/maize/rice = attribute |
| `oils-fats-waxes` | 3 | `agro-food-ingredients` | Oils, Fats & Waxes |  |
| `crude-vegetable-oils` | 4 | `oils-fats-waxes` | Crude Vegetable Oils |  |
| `industrial-waxes` | 4 | `oils-fats-waxes` | Industrial Waxes | paraffin = synonym |
| `sweeteners-starches` | 3 | `agro-food-ingredients` | Sweeteners & Starches |  |
| `sugar-molasses` | 4 | `sweeteners-starches` | Raw Sugar & Molasses |  |
| `industrial-starch` | 4 | `sweeteners-starches` | Industrial Starch |  |
| `proteins-enzymes` | 3 | `agro-food-ingredients` | Proteins & Enzymes |  |
| `dairy-ingredients` | 4 | `proteins-enzymes` | Dairy Ingredients | milk powder/whey = synonyms |
| `enzymes-yeast` | 4 | `proteins-enzymes` | Enzymes & Yeast |  |
| `animal-feed-ingredients` | 3 | `agro-food-ingredients` | Animal Feed Ingredients | soybean meal/fish meal = synonyms |
| `construction-raw` | 2 | `raw-materials` | Construction Raw Materials |  |
| `cement-concrete-inputs` | 3 | `construction-raw` | Cement & Concrete Inputs |  |
| `clinker-gypsum` | 4 | `cement-concrete-inputs` | Clinker & Gypsum |  |
| `fly-ash-slag` | 4 | `cement-concrete-inputs` | Fly Ash & Slag |  |
| `aggregates` | 3 | `construction-raw` | Stone & Sand Aggregates |  |
| `bitumen` | 3 | `construction-raw` | Bitumen |  |
| `paper-wood-raw` | 2 | `raw-materials` | Paper & Wood Raw Materials |  |
| `wood-pulp` | 3 | `paper-wood-raw` | Wood Pulp |  |
| `waste-paper` | 3 | `paper-wood-raw` | Waste Paper (Recycled Inputs) |  |
| `timber-logs` | 3 | `paper-wood-raw` | Industrial Timber & Logs |  |
| `process-machinery` | 1 | — | Production & Process Machinery |  |
| `bulk-powder-processing` | 2 | `process-machinery` | Bulk & Powder Processing Machinery |  |
| `feeders-dosing` | 3 | `bulk-powder-processing` | Feeders & Dosing Systems | silos/bins moved to material-handling bulk storage |
| `screw-feeders` | 4 | `feeders-dosing` | Screw Feeders |  |
| `vibratory-feeders` | 4 | `feeders-dosing` | Vibratory Feeders |  |
| `belt-weigh-feeders` | 4 | `feeders-dosing` | Belt & Weigh Belt Feeders |  |
| `loss-in-weight-feeders` | 4 | `feeders-dosing` | Loss-in-Weight Feeders |  |
| `volumetric-feeders` | 4 | `feeders-dosing` | Volumetric Dosing Feeders |  |
| `bag-dump-stations` | 4 | `feeders-dosing` | Bag Dump Stations |  |
| `fibc-unloaders` | 4 | `feeders-dosing` | FIBC / Jumbo Bag Unloaders |  |
| `powder-mixers-blenders` | 3 | `bulk-powder-processing` | Industrial Mixers & Blenders (Powder) |  |
| `ribbon-blenders` | 4 | `powder-mixers-blenders` | Ribbon Blenders |  |
| `paddle-mixers` | 4 | `powder-mixers-blenders` | Paddle Mixers |  |
| `ploughshare-mixers` | 4 | `powder-mixers-blenders` | Ploughshare Mixers |  |
| `tumble-blenders` | 4 | `powder-mixers-blenders` | Tumble, V & Double-Cone Blenders | geometry = attribute; merges 4 source leaves |
| `high-shear-powder-mixers` | 4 | `powder-mixers-blenders` | High-Shear Powder Mixers |  |
| `crushers-mills` | 3 | `bulk-powder-processing` | Crushers, Grinders & Mills |  |
| `jaw-crushers` | 4 | `crushers-mills` | Jaw Crushers |  |
| `impact-crushers` | 4 | `crushers-mills` | Impact Crushers |  |
| `roller-crushers` | 4 | `crushers-mills` | Roller Crushers |  |
| `hammer-mills` | 4 | `crushers-mills` | Hammer Mills |  |
| `ball-mills` | 4 | `crushers-mills` | Ball Mills |  |
| `fine-grinding-mills` | 4 | `crushers-mills` | Fine Grinding & Micronizing Mills | pin/jet/pulverizer/micronizer merged; type = attribute |
| `screening-separation` | 3 | `bulk-powder-processing` | Screening & Separation Equipment |  |
| `vibrating-screens` | 4 | `screening-separation` | Vibrating Screens |  |
| `rotary-screens-sifters` | 4 | `screening-separation` | Rotary Screens & Sifters | rotary/gyratory/centrifugal merged |
| `magnetic-separators` | 4 | `screening-separation` | Magnetic Separators |  |
| `air-classifiers` | 4 | `screening-separation` | Air Classifiers |  |
| `granulation-pelletizing` | 3 | `bulk-powder-processing` | Granulation & Pelletizing Equipment |  |
| `granulators` | 4 | `granulation-pelletizing` | Granulators & Roller Compactors | wet/dry = attribute; merges dup roller compactors |
| `pelletizers` | 4 | `granulation-pelletizing` | Pelletizers & Agglomerators |  |
| `bulk-extruders` | 4 | `granulation-pelletizing` | Extruders (Bulk Processing) |  |
| `liquid-processing` | 2 | `process-machinery` | Liquid & Fluid Processing Machinery |  |
| `industrial-pumps` | 3 | `liquid-processing` | Industrial Pumps | HOME: single pump family home; spares stay in MRO |
| `centrifugal-pumps` | 4 | `industrial-pumps` | Centrifugal Pumps | end-suction/multistage = attribute |
| `submersible-pumps` | 4 | `industrial-pumps` | Submersible Pumps | from flat MRO block; whole pumps belong here |
| `positive-displacement-pumps` | 4 | `industrial-pumps` | Positive Displacement Pumps |  |
| `gear-pumps` | 4 | `industrial-pumps` | Gear Pumps |  |
| `lobe-pumps` | 4 | `industrial-pumps` | Lobe Pumps |  |
| `screw-pumps` | 4 | `industrial-pumps` | Screw Pumps |  |
| `progressive-cavity-pumps` | 4 | `industrial-pumps` | Progressive Cavity Pumps |  |
| `diaphragm-pumps` | 4 | `industrial-pumps` | Diaphragm Pumps | AODD = synonym |
| `peristaltic-pumps` | 4 | `industrial-pumps` | Peristaltic & Hose Pumps |  |
| `dosing-metering-pumps` | 4 | `industrial-pumps` | Metering & Dosing Pumps |  |
| `drum-barrel-pumps` | 4 | `industrial-pumps` | Drum & Barrel Pumps | "Other Pumps" catch-all retired |
| `process-tanks-vessels` | 3 | `liquid-processing` | Process Tanks & Vessels |  |
| `industrial-storage-tanks` | 4 | `process-tanks-vessels` | Industrial Storage Tanks | SS/FRP/MS = material attribute; merges 3 source leaves |
| `hygienic-aseptic-tanks` | 4 | `process-tanks-vessels` | Hygienic & Aseptic Tanks |  |
| `jacketed-insulated-tanks` | 4 | `process-tanks-vessels` | Jacketed & Insulated Tanks |  |
| `pressure-vessels` | 4 | `process-tanks-vessels` | Pressure Vessels | HOME: merges 2 identical source leaves |
| `agitators-mixers` | 3 | `liquid-processing` | Agitators & Liquid Mixers |  |
| `tank-agitators` | 4 | `agitators-mixers` | Tank Agitators | top/side/bottom entry = attribute; merges 3 leaves |
| `inline-static-mixers` | 4 | `agitators-mixers` | Inline Static Mixers |  |
| `high-shear-mixers` | 4 | `agitators-mixers` | High-Shear Mixers & Homogenizers | homogenizers/emulsifiers merged; type = attribute |
| `powder-induction-mixers` | 4 | `agitators-mixers` | Liquid-Powder Induction Mixers |  |
| `liquid-filtration` | 3 | `liquid-processing` | Liquid Filtration & Separation |  |
| `filter-presses` | 4 | `liquid-filtration` | Filter Presses | chamber/membrane = attribute |
| `bag-cartridge-filters` | 4 | `liquid-filtration` | Bag & Cartridge Filter Systems |  |
| `self-cleaning-filters` | 4 | `liquid-filtration` | Self-Cleaning Filters & Strainers |  |
| `industrial-centrifuges` | 4 | `liquid-filtration` | Industrial Centrifuges | basket/decanter = attribute |
| `oil-water-separators` | 4 | `liquid-filtration` | Oil-Water Separators |  |
| `membrane-filtration-systems` | 4 | `liquid-filtration` | Membrane Filtration Systems (Process) | MF/UF/NF = attribute; utility water RO/UF lives in plant-utilities |
| `dosing-skids` | 3 | `liquid-processing` | Dosing Systems & Process Skids |  |
| `chemical-dosing-systems` | 4 | `dosing-skids` | Chemical Dosing Systems & Skids |  |
| `flow-measurement-skids` | 4 | `dosing-skids` | Flow Measurement Skids |  |
| `batch-recipe-skids` | 4 | `dosing-skids` | Batch Dosing & Recipe Skids |  |
| `hygienic-cleaning-systems` | 3 | `liquid-processing` | CIP, SIP & Hygienic Cleaning Systems |  |
| `cip-systems` | 4 | `hygienic-cleaning-systems` | CIP Systems |  |
| `sip-systems` | 4 | `hygienic-cleaning-systems` | SIP Systems |  |
| `tank-cleaning-machines` | 4 | `hygienic-cleaning-systems` | Tank & Vessel Cleaning Machines |  |
| `pigging-systems` | 4 | `hygienic-cleaning-systems` | Pigging Systems |  |
| `thermal-processing` | 2 | `process-machinery` | Thermal & Separation Process Equipment |  |
| `industrial-dryers` | 3 | `thermal-processing` | Industrial Dryers | generic "Industrial Dryers" parent-as-sibling resolved here |
| `tray-dryers` | 4 | `industrial-dryers` | Tray Dryers |  |
| `fluid-bed-dryers` | 4 | `industrial-dryers` | Fluid Bed Dryers (FBD) |  |
| `spray-dryers` | 4 | `industrial-dryers` | Spray Dryers |  |
| `rotary-dryers` | 4 | `industrial-dryers` | Rotary Dryers |  |
| `vacuum-dryers` | 4 | `industrial-dryers` | Vacuum Dryers |  |
| `freeze-dryers` | 4 | `industrial-dryers` | Freeze / Lyophilization Dryers |  |
| `industrial-ovens` | 3 | `thermal-processing` | Industrial Ovens |  |
| `batch-ovens` | 4 | `industrial-ovens` | Batch Ovens |  |
| `conveyor-ovens` | 4 | `industrial-ovens` | Conveyor Ovens |  |
| `curing-ovens` | 4 | `industrial-ovens` | Curing Ovens |  |
| `process-cooling-tunnels` | 3 | `thermal-processing` | Cooling & Heat Tunnels | chillers canonical in plant-utilities HVAC |
| `heat-exchangers` | 3 | `thermal-processing` | Heat Exchangers | HOME: single HX family home (process + utility duty = attribute) |
| `shell-tube-heat-exchangers` | 4 | `heat-exchangers` | Shell & Tube Heat Exchangers |  |
| `plate-heat-exchangers` | 4 | `heat-exchangers` | Plate Heat Exchangers |  |
| `finned-tube-heat-exchangers` | 4 | `heat-exchangers` | Finned Tube Heat Exchangers |  |
| `scraped-surface-heat-exchangers` | 4 | `heat-exchangers` | Scraped Surface Heat Exchangers |  |
| `heat-recovery-units` | 4 | `heat-exchangers` | Heat Recovery Units |  |
| `reactors-bioprocess` | 3 | `thermal-processing` | Reactors & Bioprocess Equipment |  |
| `process-reactors` | 4 | `reactors-bioprocess` | Process Reactors | SS/glass-lined/alloy = material attribute; merges 4 leaves + agitated reaction systems |
| `autoclaves` | 4 | `reactors-bioprocess` | Industrial Autoclaves |  |
| `fermenters-bioreactors` | 4 | `reactors-bioprocess` | Fermenters & Bioreactors |  |
| `evaporators-crystallizers` | 3 | `thermal-processing` | Evaporators & Crystallizers |  |
| `industrial-evaporators` | 4 | `evaporators-crystallizers` | Industrial Evaporators | falling/rising film, FC, ATFE, MEE = type attribute; ZLD canonical in plant-utilities |
| `industrial-crystallizers` | 4 | `evaporators-crystallizers` | Industrial Crystallizers | batch/continuous/cooling/evaporative/melt = attribute |
| `distillation-extraction` | 3 | `thermal-processing` | Distillation & Extraction Systems |  |
| `distillation-columns` | 4 | `distillation-extraction` | Distillation & Fractionation Columns | batch/continuous = attribute |
| `column-internals` | 4 | `distillation-extraction` | Column Internals (Trays & Packings) |  |
| `extraction-systems` | 4 | `distillation-extraction` | Extraction & Leaching Systems | solid-liquid/liquid-liquid/SFE = attribute |
| `packaging-machinery` | 2 | `process-machinery` | Packaging & Filling Machinery |  |
| `filling-machines` | 3 | `packaging-machinery` | Filling Machines |  |
| `liquid-filling-machines` | 4 | `filling-machines` | Liquid Filling Machines | volumetric/gravimetric/flowmeter = attribute |
| `powder-filling-machines` | 4 | `filling-machines` | Powder Filling Machines | auger/vacuum = attribute |
| `granule-filling-machines` | 4 | `filling-machines` | Granule Filling Machines |  |
| `piston-filling-machines` | 4 | `filling-machines` | Piston Filling Machines |  |
| `aseptic-filling-machines` | 4 | `filling-machines` | Aseptic Filling Machines |  |
| `multihead-weighers` | 4 | `filling-machines` | Multi-Head Weighers & Filling Systems |  |
| `form-fill-seal` | 3 | `packaging-machinery` | Form-Fill-Seal & Pouch Packing |  |
| `vffs-machines` | 4 | `form-fill-seal` | Vertical Form-Fill-Seal (VFFS) Machines |  |
| `hffs-machines` | 4 | `form-fill-seal` | Horizontal Form-Fill-Seal (HFFS) Machines |  |
| `stick-sachet-machines` | 4 | `form-fill-seal` | Stick Pack & Sachet Machines |  |
| `pouch-fill-seal-machines` | 4 | `form-fill-seal` | Pouch Filling & Sealing Machines | stand-up/zipper/spout = attribute |
| `capping-sealing` | 3 | `packaging-machinery` | Capping & Sealing Machines |  |
| `capping-machines` | 4 | `capping-sealing` | Capping Machines | screw/ROPP/lug = attribute |
| `induction-sealing-machines` | 4 | `capping-sealing` | Induction Sealing Machines |  |
| `heat-vacuum-sealers` | 4 | `capping-sealing` | Heat & Vacuum Sealing Machines |  |
| `carton-sealing-machines` | 4 | `capping-sealing` | Carton Sealing Machines |  |
| `labeling-coding` | 3 | `packaging-machinery` | Labeling, Coding & Marking |  |
| `labeling-machines` | 4 | `labeling-coding` | Labeling Machines | bottle/wrap-around/sticker = attribute |
| `inkjet-coders` | 4 | `labeling-coding` | Inkjet Coding Machines | CIJ/TIJ = attribute |
| `laser-marking-machines` | 4 | `labeling-coding` | Laser Marking Machines |  |
| `thermal-transfer-overprinters` | 4 | `labeling-coding` | Thermal Transfer Overprinters (TTO) |  |
| `track-trace-systems` | 4 | `labeling-coding` | Serialization & Track-and-Trace Systems |  |
| `secondary-packaging` | 3 | `packaging-machinery` | Secondary Packaging & Case Packing |  |
| `cartoning-machines` | 4 | `secondary-packaging` | Cartoning Machines |  |
| `case-packers` | 4 | `secondary-packaging` | Case Packers | top-load/side-load = attribute |
| `case-erectors-sealers` | 4 | `secondary-packaging` | Case Erectors & Sealers |  |
| `tray-shrink-packers` | 4 | `secondary-packaging` | Tray Packing & Shrink Wrapping Machines |  |
| `end-of-line` | 3 | `packaging-machinery` | End-of-Line & Palletizing | HOME: single palletizer/wrapper home |
| `palletizers` | 4 | `end-of-line` | Palletizers & Depalletizers | conventional/robotic = attribute; merges robotics dup |
| `stretch-shrink-wrappers` | 4 | `end-of-line` | Stretch & Shrink Hood Wrappers | merges Material Handling pallet wrappers |
| `strapping-machines` | 4 | `end-of-line` | Strapping Machines |  |
| `pallet-conveyors` | 4 | `end-of-line` | Pallet Conveyors |  |
| `packaging-inspection` | 3 | `packaging-machinery` | Inline Inspection & Rejection | HOME: single home for inline check systems |
| `checkweighers` | 4 | `packaging-inspection` | Checkweighers | merges Quality L1 dup |
| `metal-detectors` | 4 | `packaging-inspection` | Industrial Metal Detectors | process-inline + packaging-line = duty attribute |
| `x-ray-inspection` | 4 | `packaging-inspection` | X-Ray Inspection Systems |  |
| `vision-inspection` | 4 | `packaging-inspection` | Vision Inspection Systems |  |
| `leak-detection-systems` | 4 | `packaging-inspection` | Leak Detection Systems |  |
| `reject-systems` | 4 | `packaging-inspection` | Automatic Reject Systems |  |
| `industry-machinery` | 2 | `process-machinery` | Industry-Specific Production Machinery | machinery grouped by output industry; Industry taxonomy stays separate axis |
| `textile-machinery` | 3 | `industry-machinery` | Textile & Garment Machinery |  |
| `spinning-machines` | 4 | `textile-machinery` | Spinning Machines |  |
| `weaving-looms` | 4 | `textile-machinery` | Weaving Looms | rapier/air-jet/water-jet = attribute |
| `knitting-machines` | 4 | `textile-machinery` | Knitting Machines | circular/flat = attribute |
| `dyeing-machines` | 4 | `textile-machinery` | Dyeing Machines | jet/jigger/winch = attribute |
| `textile-printing-machines` | 4 | `textile-machinery` | Textile Printing Machines |  |
| `textile-finishing-machines` | 4 | `textile-machinery` | Textile Finishing & Compacting Machines |  |
| `nonwoven-machinery` | 4 | `textile-machinery` | Nonwoven & Technical Textile Machinery |  |
| `food-beverage-machinery` | 3 | `industry-machinery` | Food & Beverage Machinery |  |
| `flour-grain-milling` | 4 | `food-beverage-machinery` | Grain & Flour Milling Machines |  |
| `dairy-processing-machinery` | 4 | `food-beverage-machinery` | Dairy Processing Machinery |  |
| `beverage-lines` | 4 | `food-beverage-machinery` | Beverage Processing Lines |  |
| `bakery-confectionery-machines` | 4 | `food-beverage-machinery` | Bakery & Confectionery Machines |  |
| `meat-poultry-machinery` | 4 | `food-beverage-machinery` | Meat & Poultry Processing Machinery |  |
| `fruit-vegetable-machinery` | 4 | `food-beverage-machinery` | Fruit & Vegetable Processing Machines |  |
| `edible-oil-machinery` | 4 | `food-beverage-machinery` | Edible Oil Processing Machinery |  |
| `pharma-machinery` | 3 | `industry-machinery` | Pharmaceutical & Medical Machinery |  |
| `tablet-presses` | 4 | `pharma-machinery` | Tablet Compression Machines |  |
| `capsule-fillers` | 4 | `pharma-machinery` | Capsule Filling Machines |  |
| `granulation-coating-systems` | 4 | `pharma-machinery` | Granulation & Coating Systems |  |
| `sterile-processing-lines` | 4 | `pharma-machinery` | Injectable & Sterile Processing Lines |  |
| `blister-packaging-lines` | 4 | `pharma-machinery` | Blister & Strip Packaging Lines |  |
| `medical-device-assembly` | 4 | `pharma-machinery` | Medical Device Assembly Machinery |  |
| `plastics-rubber-machinery` | 3 | `industry-machinery` | Plastics & Rubber Machinery |  |
| `injection-molding-machines` | 4 | `plastics-rubber-machinery` | Injection Molding Machines |  |
| `plastic-extrusion-lines` | 4 | `plastics-rubber-machinery` | Plastic Extrusion Lines |  |
| `blow-molding-machines` | 4 | `plastics-rubber-machinery` | Blow Molding Machines |  |
| `compression-molding-machines` | 4 | `plastics-rubber-machinery` | Compression & Transfer Molding Machines |  |
| `rubber-mixing-calendering` | 4 | `plastics-rubber-machinery` | Rubber Mixing & Calendering Machines |  |
| `thermoforming-machines` | 4 | `plastics-rubber-machinery` | Thermoforming Machines |  |
| `paper-board-machinery` | 3 | `industry-machinery` | Paper & Board Machinery |  |
| `pulping-systems` | 4 | `paper-board-machinery` | Pulping & Digestion Systems |  |
| `paper-making-machines` | 4 | `paper-board-machinery` | Paper Making Machines |  |
| `tissue-paper-machines` | 4 | `paper-board-machinery` | Tissue & Specialty Paper Machines |  |
| `paper-converting-machinery` | 4 | `paper-board-machinery` | Paper Converting Machinery |  |
| `corrugation-board-machines` | 4 | `paper-board-machinery` | Corrugation & Board Making Machines |  |
| `building-materials-machinery` | 3 | `industry-machinery` | Building Materials Machinery |  |
| `cement-plant-machinery` | 4 | `building-materials-machinery` | Cement & Clinker Production Machinery |  |
| `concrete-block-machines` | 4 | `building-materials-machinery` | Concrete Batching & Block Making Machines |  |
| `brick-tile-machines` | 4 | `building-materials-machinery` | Brick & Tile Making Machines |  |
| `aac-brick-plants` | 4 | `building-materials-machinery` | AAC & Fly Ash Brick Plants |  |
| `gypsum-board-lines` | 4 | `building-materials-machinery` | Gypsum Board Production Lines |  |
| `wood-machinery` | 3 | `industry-machinery` | Wood & Furniture Machinery |  |
| `sawmill-machines` | 4 | `wood-machinery` | Sawmill & Log Processing Machines |  |
| `wood-cutting-shaping` | 4 | `wood-machinery` | Wood Cutting & Shaping Machines |  |
| `panel-processing-machines` | 4 | `wood-machinery` | Panel Processing Machines | MDF/plywood = attribute |
| `furniture-machines` | 4 | `wood-machinery` | Furniture Manufacturing Machines |  |
| `wood-finishing-machines` | 4 | `wood-machinery` | Wood Surface Finishing Machines |  |
| `chemical-plant-machinery` | 3 | `industry-machinery` | Chemical Plant Machinery |  |
| `chemical-batch-units` | 4 | `chemical-plant-machinery` | Chemical Batch Processing Units |  |
| `specialty-chemical-lines` | 4 | `chemical-plant-machinery` | Specialty Chemical Production Lines |  |
| `agrochemical-fertilizer-machinery` | 4 | `chemical-plant-machinery` | Agrochemical & Fertilizer Machinery |  |
| `resin-adhesive-plants` | 4 | `chemical-plant-machinery` | Resin & Adhesive Manufacturing Systems |  |
| `paint-production-machinery` | 4 | `chemical-plant-machinery` | Paint & Coating Production Machinery |  |
| `machine-tools` | 1 | — | Machine Tools & Fabrication Equipment | extracted from Production Machinery: distinct buyer segment (workshops/light engineering) |
| `metal-cutting` | 2 | `machine-tools` | Metal Cutting Machine Tools |  |
| `lathes-turning-centers` | 3 | `metal-cutting` | Lathes & Turning Centers | conventional/CNC = attribute; merges CNC Turning Centers dup |
| `milling-machining-centers` | 3 | `metal-cutting` | Milling Machines & Machining Centers |  |
| `conventional-milling-machines` | 4 | `milling-machining-centers` | Conventional Milling Machines |  |
| `vertical-machining-centers` | 4 | `milling-machining-centers` | Vertical Machining Centers (VMC) |  |
| `horizontal-machining-centers` | 4 | `milling-machining-centers` | Horizontal Machining Centers (HMC) |  |
| `five-axis-machining-centers` | 4 | `milling-machining-centers` | 5-Axis & Multi-Axis Machining Centers |  |
| `drilling-machines` | 3 | `metal-cutting` | Drilling Machines | pillar/radial/magnetic = attribute |
| `boring-machines` | 3 | `metal-cutting` | Boring Machines |  |
| `grinding-machines` | 3 | `metal-cutting` | Grinding Machines |  |
| `surface-grinders` | 4 | `grinding-machines` | Surface Grinding Machines |  |
| `cylindrical-grinders` | 4 | `grinding-machines` | Cylindrical & Centerless Grinding Machines |  |
| `tool-cutter-grinders` | 4 | `grinding-machines` | Tool & Cutter Grinding Machines |  |
| `shaper-slotting-machines` | 3 | `metal-cutting` | Shaper & Slotting Machines |  |
| `edm-machines` | 3 | `metal-cutting` | EDM Machines | wire-cut/die-sinking = attribute |
| `sheet-metal-machines` | 2 | `machine-tools` | Sheet Metal Machinery |  |
| `shearing-machines` | 3 | `sheet-metal-machines` | Shearing Machines |  |
| `press-brakes` | 3 | `sheet-metal-machines` | Press Brake Machines | NC/CNC = attribute |
| `turret-punches` | 3 | `sheet-metal-machines` | Turret Punching Machines |  |
| `plate-rolling-bending` | 3 | `sheet-metal-machines` | Plate Rolling & Bending Machines |  |
| `panel-benders` | 3 | `sheet-metal-machines` | Panel Benders |  |
| `cutting-machines` | 2 | `machine-tools` | Thermal & Precision Cutting Machines |  |
| `laser-cutting-machines` | 3 | `cutting-machines` | Laser Cutting Machines | fiber/CO2 = attribute |
| `plasma-cutting-machines` | 3 | `cutting-machines` | Plasma Cutting Machines |  |
| `waterjet-cutting-machines` | 3 | `cutting-machines` | Waterjet Cutting Machines |  |
| `oxyfuel-cutting-machines` | 3 | `cutting-machines` | Flame & Oxy-Fuel Cutting Machines |  |
| `welding-equipment` | 2 | `machine-tools` | Welding & Joining Equipment |  |
| `arc-welding-machines` | 3 | `welding-equipment` | Arc / MMA Welding Machines |  |
| `mig-mag-welders` | 3 | `welding-equipment` | MIG / MAG Welding Machines |  |
| `tig-welders` | 3 | `welding-equipment` | TIG Welding Machines |  |
| `saw-welding-systems` | 3 | `welding-equipment` | Submerged Arc Welding (SAW) Systems |  |
| `spot-resistance-welders` | 3 | `welding-equipment` | Spot & Resistance Welding Machines |  |
| `robotic-welding-cells` | 3 | `welding-equipment` | Robotic Welding Cells | welding-specific robots live with welding (buyer intent) |
| `brazing-soldering-equipment` | 3 | `welding-equipment` | Brazing & Soldering Equipment |  |
| `presses-forging` | 2 | `machine-tools` | Presses & Forging Machines |  |
| `hydraulic-presses` | 3 | `presses-forging` | Hydraulic Presses |  |
| `mechanical-power-presses` | 3 | `presses-forging` | Mechanical & Power Presses | merges Power Press dup from sheet metal |
| `forging-presses` | 3 | `presses-forging` | Forging Presses |  |
| `roll-forming-machines` | 3 | `presses-forging` | Roll Forming Machines |  |
| `metal-extrusion-presses` | 3 | `presses-forging` | Metal Extrusion Presses |  |
| `workshop-finishing` | 2 | `machine-tools` | Workshop & Surface Finishing Equipment |  |
| `blasting-machines` | 3 | `workshop-finishing` | Shot & Sand Blasting Machines |  |
| `polishing-machines` | 3 | `workshop-finishing` | Surface Finishing & Polishing Machines |  |
| `heat-treatment-furnaces` | 3 | `workshop-finishing` | Heat Treatment Furnaces |  |
| `parts-washers` | 3 | `workshop-finishing` | Parts Washing & Degreasing Machines |  |
| `balancing-machines` | 3 | `workshop-finishing` | Balancing Machines |  |
| `tooling-workholding` | 2 | `machine-tools` | Tooling, Dies & Workholding |  |
| `mold-die-machines` | 3 | `tooling-workholding` | Mold & Die Making Machines |  |
| `tool-presetters` | 3 | `tooling-workholding` | Tool Presetting Machines |  |
| `jigs-fixtures-workholding` | 3 | `tooling-workholding` | Jigs, Fixtures & Workholding |  |
| `power-electrical` | 1 | — | Power & Electrical Equipment |  |
| `power-generation` | 2 | `power-electrical` | Power Generation Equipment |  |
| `diesel-generators` | 3 | `power-generation` | Diesel Generator (DG) Sets |  |
| `gas-generators` | 3 | `power-generation` | Gas Generator Sets |  |
| `captive-power-plants` | 3 | `power-generation` | Captive Power Plants |  |
| `solar-power-systems` | 3 | `power-generation` | Industrial Solar Power Systems | rooftop = attribute |
| `hybrid-power-systems` | 3 | `power-generation` | Hybrid Power Systems |  |
| `cogeneration-chp` | 3 | `power-generation` | Cogeneration (CHP) Systems |  |
| `substations-distribution` | 2 | `power-electrical` | Substations & Power Distribution |  |
| `substations` | 3 | `substations-distribution` | HT & LT Substations |  |
| `transformers` | 3 | `substations-distribution` | Transformers | power/distribution = attribute |
| `switchgear-panels` | 3 | `substations-distribution` | HT & LT Switchgear Panels |  |
| `ring-main-units` | 3 | `substations-distribution` | Ring Main Units (RMU) |  |
| `busbar-trunking` | 3 | `substations-distribution` | Bus Ducts & Busbar Trunking |  |
| `power-control-quality` | 2 | `power-electrical` | Power Control & Power Quality |  |
| `pcc-panels` | 3 | `power-control-quality` | Power Control Centers (PCC) |  |
| `mcc-panels` | 3 | `power-control-quality` | Motor Control Centers (MCC) | HOME: merges EIC integration MCC dup (service part to services) |
| `ups-systems` | 3 | `power-control-quality` | UPS Systems |  |
| `apfc-panels` | 3 | `power-control-quality` | APFC Panels |  |
| `harmonic-filters` | 3 | `power-control-quality` | Harmonic Filters & Power Quality Systems |  |
| `backup-energy-storage` | 2 | `power-electrical` | Backup Power & Energy Storage |  |
| `emergency-power-systems` | 3 | `backup-energy-storage` | Emergency Power Supply Systems |  |
| `battery-energy-storage` | 3 | `backup-energy-storage` | Battery Energy Storage Systems (BESS) |  |
| `transfer-switches` | 3 | `backup-energy-storage` | Automatic & Static Transfer Switches |  |
| `earthing-lightning` | 2 | `power-electrical` | Earthing & Lightning Protection |  |
| `earthing-systems` | 3 | `earthing-lightning` | Earthing & Grounding Systems |  |
| `lightning-protection` | 3 | `earthing-lightning` | Lightning Protection Systems |  |
| `arc-flash-protection` | 3 | `earthing-lightning` | Arc Flash & Electrical Safety Systems |  |
| `motors-drives` | 2 | `power-electrical` | Electric Motors & Drives | HOME: whole motors/drives; spares stay in MRO |
| `electric-motors` | 3 | `motors-drives` | Electric Motors | AC/DC, single/three-phase, gear motors = attributes |
| `variable-frequency-drives` | 3 | `motors-drives` | Variable Frequency Drives (VFD) | HOME: merges MRO VFD dup (whole drives) |
| `soft-starters` | 3 | `motors-drives` | Soft Starters |  |
| `servo-motion-systems` | 3 | `motors-drives` | Servo Drives & Motion Systems |  |
| `plant-utilities` | 1 | — | Plant Utility Systems |  |
| `water-treatment` | 2 | `plant-utilities` | Water & Wastewater Treatment |  |
| `water-pretreatment` | 3 | `water-treatment` | Intake & Pre-Treatment Systems |  |
| `intake-screening-systems` | 4 | `water-pretreatment` | Raw Water Intake & Screening Systems |  |
| `oil-grease-removal` | 4 | `water-pretreatment` | Oil & Grease Removal Systems |  |
| `clarifiers-settling` | 4 | `water-pretreatment` | Clarifiers & Settling Systems |  |
| `water-treatment-plants` | 3 | `water-treatment` | Water Treatment Plants |  |
| `conventional-wtp` | 4 | `water-treatment-plants` | Conventional Water Treatment Plants |  |
| `carbon-filtration-systems` | 4 | `water-treatment-plants` | Activated Carbon Filtration Systems |  |
| `water-softening-plants` | 4 | `water-treatment-plants` | Water Softening Plants |  |
| `ro-plants` | 4 | `water-treatment-plants` | Reverse Osmosis (RO) Plants |  |
| `uf-systems` | 4 | `water-treatment-plants` | Ultrafiltration (UF) Systems | utility water duty; process membrane systems live in liquid-processing |
| `dm-plants` | 4 | `water-treatment-plants` | Demineralization (DM) Plants |  |
| `process-utility-water` | 3 | `water-treatment` | Process & Utility Water Systems |  |
| `boiler-feed-water-systems` | 4 | `process-utility-water` | Boiler Feed Water Treatment |  |
| `cooling-tower-water-treatment` | 4 | `process-utility-water` | Cooling Tower Water Treatment |  |
| `high-purity-water-systems` | 4 | `process-utility-water` | High-Purity & Process Water Systems |  |
| `wastewater-treatment-plants` | 3 | `water-treatment` | Wastewater & Effluent Treatment |  |
| `stp-plants` | 4 | `wastewater-treatment-plants` | Sewage Treatment Plants (STP) |  |
| `etp-plants` | 4 | `wastewater-treatment-plants` | Effluent Treatment Plants (ETP) |  |
| `physico-chemical-treatment` | 4 | `wastewater-treatment-plants` | Physico-Chemical Treatment Systems |  |
| `daf-systems` | 4 | `wastewater-treatment-plants` | DAF Systems |  |
| `tertiary-treatment-systems` | 4 | `wastewater-treatment-plants` | Tertiary & Advanced Treatment Systems |  |
| `sludge-handling` | 3 | `water-treatment` | Sludge Treatment & Handling |  |
| `sludge-thickening` | 4 | `sludge-handling` | Sludge Thickening Systems |  |
| `sludge-dewatering` | 4 | `sludge-handling` | Sludge Dewatering Systems |  |
| `sludge-drying` | 4 | `sludge-handling` | Sludge Drying Systems |  |
| `water-recycling-zld` | 3 | `water-treatment` | Water Recycling & ZLD |  |
| `water-reuse-systems` | 4 | `water-recycling-zld` | Water Recycling & Reuse Systems |  |
| `zld-systems` | 4 | `water-recycling-zld` | Zero Liquid Discharge (ZLD) Systems | HOME: absorbs ZLD evaporation dup |
| `steam-boilers` | 2 | `plant-utilities` | Steam & Boiler Systems |  |
| `steam-boilers-generation` | 3 | `steam-boilers` | Boilers & Steam Generation |  |
| `industrial-steam-boilers` | 4 | `steam-boilers-generation` | Industrial Steam Boilers |  |
| `thermic-fluid-heaters` | 4 | `steam-boilers-generation` | Thermic Fluid Heaters |  |
| `waste-heat-recovery-boilers` | 4 | `steam-boilers-generation` | Waste Heat Recovery Boilers (WHRB) |  |
| `package-boilers` | 4 | `steam-boilers-generation` | Package & Skid-Mounted Boilers |  |
| `steam-distribution` | 3 | `steam-boilers` | Steam Distribution & Condensate |  |
| `steam-piping-systems` | 4 | `steam-distribution` | Steam Piping & Distribution Systems |  |
| `condensate-recovery` | 4 | `steam-distribution` | Condensate Recovery Systems |  |
| `steam-traps-accessories` | 4 | `steam-distribution` | Steam Traps & Accessories |  |
| `hot-water-thermal-oil` | 3 | `steam-boilers` | Hot Water & Thermal Oil Systems |  |
| `hot-water-generation` | 4 | `hot-water-thermal-oil` | Hot Water Generation Systems |  |
| `thermal-oil-circulation` | 4 | `hot-water-thermal-oil` | Thermal Oil Circulation Systems |  |
| `burners-combustion` | 3 | `steam-boilers` | Burners, Fuel & Combustion |  |
| `industrial-burners` | 4 | `burners-combustion` | Industrial Burners & Combustion Systems |  |
| `gas-trains-fuel-systems` | 4 | `burners-combustion` | Gas Trains & Fuel Supply Systems |  |
| `fuel-storage-handling` | 4 | `burners-combustion` | Fuel Storage & Handling Systems |  |
| `boiler-controls-safety` | 3 | `steam-boilers` | Boiler Controls & Safety |  |
| `boiler-control-panels` | 4 | `boiler-controls-safety` | Boiler Automation & Control Panels |  |
| `burner-management-systems` | 4 | `boiler-controls-safety` | Burner Management Systems | BMS abbrev reserved for Building Mgmt; spell out |
| `boiler-safety-valves` | 4 | `boiler-controls-safety` | Safety Valves & Boiler Safety Systems |  |
| `compressed-air-gas` | 2 | `plant-utilities` | Compressed Air, Gas & Vacuum |  |
| `air-compressors` | 3 | `compressed-air-gas` | Air Compressors |  |
| `reciprocating-compressors` | 4 | `air-compressors` | Reciprocating Air Compressors |  |
| `screw-compressors` | 4 | `air-compressors` | Screw Air Compressors |  |
| `centrifugal-compressors` | 4 | `air-compressors` | Centrifugal Air Compressors |  |
| `oil-free-compressors` | 4 | `air-compressors` | Oil-Free Air Compressors |  |
| `portable-compressors` | 4 | `air-compressors` | Portable & Skid-Mounted Compressors |  |
| `compressed-air-treatment` | 3 | `compressed-air-gas` | Compressed Air Treatment & Distribution |  |
| `air-dryers` | 4 | `compressed-air-treatment` | Air Dryers | refrigerated/desiccant = attribute |
| `air-receivers` | 4 | `compressed-air-treatment` | Air Receivers & Storage Tanks |  |
| `air-filtration-systems` | 4 | `compressed-air-treatment` | Air Filtration & Moisture Removal |  |
| `compressed-air-piping` | 4 | `compressed-air-treatment` | Compressed Air Piping Systems |  |
| `industrial-gas-systems` | 3 | `compressed-air-gas` | Industrial Gas Generation & Supply |  |
| `nitrogen-generators` | 4 | `industrial-gas-systems` | Nitrogen Generation Systems |  |
| `oxygen-generators` | 4 | `industrial-gas-systems` | Oxygen Generation Systems |  |
| `gas-mixing-systems` | 4 | `industrial-gas-systems` | Industrial Gas Mixing Systems |  |
| `gas-storage-manifolds` | 4 | `industrial-gas-systems` | Gas Storage & Cylinder Manifolds |  |
| `vacuum-systems` | 3 | `compressed-air-gas` | Vacuum Systems |  |
| `vacuum-pumps` | 4 | `vacuum-systems` | Vacuum Pumps | liquid ring/rotary vane/dry = attribute |
| `central-vacuum-systems` | 4 | `vacuum-systems` | Central Vacuum Systems |  |
| `vacuum-filtration-suction` | 4 | `vacuum-systems` | Vacuum Filtration & Suction Systems |  |
| `compressed-air-controls` | 3 | `compressed-air-gas` | Compressed Air Controls & Monitoring |  |
| `compressor-sequencing` | 4 | `compressed-air-controls` | Compressor Control & Sequencing Systems |  |
| `air-leak-detection` | 4 | `compressed-air-controls` | Air Leak Detection Systems | audit services live in industrial-services |
| `hvac-cleanroom` | 2 | `plant-utilities` | HVAC & Cleanroom Systems |  |
| `industrial-hvac` | 3 | `hvac-cleanroom` | Industrial HVAC |  |
| `chillers-ahus` | 4 | `industrial-hvac` | Chillers & Air Handling Units | HOME: canonical chiller home (process chillers = duty attribute) |
| `ventilation-exhaust` | 4 | `industrial-hvac` | Industrial Ventilation & Exhaust Systems |  |
| `precision-ac` | 4 | `industrial-hvac` | Precision Air Conditioning |  |
| `process-cooling-heating` | 4 | `industrial-hvac` | Process Cooling & Heating Systems |  |
| `cleanroom-systems` | 3 | `hvac-cleanroom` | Cleanroom Systems |  |
| `cleanroom-hvac` | 4 | `cleanroom-systems` | Cleanroom HVAC Systems |  |
| `cleanroom-panels` | 4 | `cleanroom-systems` | Cleanroom Panels & Modular Cleanrooms |  |
| `laf-hepa-units` | 4 | `cleanroom-systems` | Laminar Air Flow & HEPA Filter Units |  |
| `air-showers-pass-boxes` | 4 | `cleanroom-systems` | Air Showers & Pass Boxes |  |
| `humidity-control` | 3 | `hvac-cleanroom` | Temperature & Humidity Control |  |
| `dehumidifiers` | 4 | `humidity-control` | Dehumidification Systems |  |
| `humidifiers` | 4 | `humidity-control` | Humidification Systems |  |
| `environmental-chambers` | 4 | `humidity-control` | Environmental Chambers |  |
| `building-management-systems` | 3 | `hvac-cleanroom` | Building Management & HVAC Controls |  |
| `bms-systems` | 4 | `building-management-systems` | Building Management Systems |  |
| `hvac-control-panels` | 4 | `building-management-systems` | HVAC Control Panels |  |
| `air-pollution-control` | 2 | `plant-utilities` | Air Pollution & Dust Control | HOME: single home for dust collectors/scrubbers (x3 in source) |
| `dust-collectors` | 3 | `air-pollution-control` | Dust Collectors |  |
| `baghouse-dust-collectors` | 4 | `dust-collectors` | Baghouse Dust Collectors |  |
| `cartridge-dust-collectors` | 4 | `dust-collectors` | Cartridge Dust Collectors |  |
| `cyclone-dust-collectors` | 4 | `dust-collectors` | Cyclone Dust Collectors & Separators |  |
| `fume-extraction-systems` | 3 | `air-pollution-control` | Fume Extraction Systems |  |
| `industrial-scrubbers` | 3 | `air-pollution-control` | Industrial Scrubbers | wet/dry = attribute; merges 3 source occurrences |
| `stack-emission-control` | 3 | `air-pollution-control` | Stack & Emission Control Systems |  |
| `industrial-vacuum-cleaners` | 3 | `air-pollution-control` | Industrial Vacuum Systems |  |
| `fire-safety-security` | 1 | — | Fire, Safety & Security | merges the two duplicated fire branches |
| `fire-detection-alarm` | 2 | `fire-safety-security` | Fire Detection & Alarm |  |
| `fire-alarm-panels` | 3 | `fire-detection-alarm` | Fire Alarm Control Panels |  |
| `fire-detectors` | 3 | `fire-detection-alarm` | Smoke, Heat & Flame Detectors |  |
| `call-points-alarm-devices` | 3 | `fire-detection-alarm` | Manual Call Points & Alarm Devices |  |
| `voice-evacuation-pa` | 3 | `fire-detection-alarm` | PA & Voice Evacuation Systems |  |
| `fire-alarm-monitoring` | 3 | `fire-detection-alarm` | Fire Alarm Monitoring Systems | remote monitoring merged; BMS/SCADA integration = service |
| `fire-suppression` | 2 | `fire-safety-security` | Fire Suppression Systems |  |
| `sprinkler-systems` | 3 | `fire-suppression` | Fire Sprinkler Systems |  |
| `hydrant-hose-reel` | 3 | `fire-suppression` | Hydrant & Hose Reel Systems |  |
| `gas-suppression-systems` | 3 | `fire-suppression` | Gas-Based Suppression Systems |  |
| `foam-suppression-systems` | 3 | `fire-suppression` | Foam-Based Suppression Systems |  |
| `fire-extinguishers` | 3 | `fire-suppression` | Fire Extinguishers | HOME: merges Safety L1 dup; portable/mobile = attribute |
| `special-hazard-fire-protection` | 3 | `fire-suppression` | Special Hazard Fire Protection | panel room/data center/kitchen hood/high hazard = application attribute |
| `emergency-escape` | 2 | `fire-safety-security` | Emergency & Escape Systems |  |
| `emergency-lighting` | 3 | `emergency-escape` | Emergency Lighting Systems | HOME: merges Safety L1 dup |
| `exit-signage` | 3 | `emergency-escape` | Exit Signs & Escape Route Systems |  |
| `fireman-communication` | 3 | `emergency-escape` | Fireman Communication & Control |  |
| `ppe` | 2 | `fire-safety-security` | Personal Protective Equipment (PPE) | expanded from single grouped leaf (ADD) |
| `head-eye-face-protection` | 3 | `ppe` | Head, Eye & Face Protection |  |
| `hand-protection` | 3 | `ppe` | Hand Protection |  |
| `foot-protection` | 3 | `ppe` | Safety Footwear |  |
| `body-protection-workwear` | 3 | `ppe` | Body Protection & Workwear |  |
| `respiratory-protection` | 3 | `ppe` | Respiratory Protection | ADD: missing core PPE family |
| `fall-protection` | 3 | `ppe` | Fall Protection | ADD: missing core PPE family |
| `workplace-safety` | 2 | `fire-safety-security` | Workplace Safety Equipment |  |
| `safety-barriers-guarding` | 3 | `workplace-safety` | Safety Barriers & Machine Guarding |  |
| `safety-signage` | 3 | `workplace-safety` | Safety Signage |  |
| `lockout-tagout` | 3 | `workplace-safety` | Lockout / Tagout (LOTO) | HOME: from MRO maintenance supplies |
| `security-systems` | 2 | `fire-safety-security` | Security & Surveillance |  |
| `cctv-surveillance` | 3 | `security-systems` | CCTV & Video Surveillance |  |
| `access-control-attendance` | 3 | `security-systems` | Access Control & Time Attendance |  |
| `perimeter-security` | 3 | `security-systems` | Perimeter Security & Barriers | fencing/bollards; construction boundary works = service |
| `automation-instrumentation` | 1 | — | Automation, Control & Instrumentation | HOME: single home for PLC/SCADA/DCS (4+ source locations) |
| `control-systems` | 2 | `automation-instrumentation` | Industrial Control Systems |  |
| `plc-systems` | 3 | `control-systems` | PLC Systems & Controllers | merges process/water/utility/OT PLC dups |
| `scada-hmi` | 3 | `control-systems` | SCADA & HMI Systems | merges 4 source occurrences |
| `dcs-systems` | 3 | `control-systems` | Distributed Control Systems (DCS) |  |
| `rtu-telemetry` | 3 | `control-systems` | RTU & Telemetry Systems |  |
| `batch-recipe-control` | 3 | `control-systems` | Batch Control & Recipe Management |  |
| `automation-panels` | 2 | `automation-instrumentation` | Automation & Control Panels |  |
| `control-panels` | 3 | `automation-panels` | Automation Control Panels | PLC/utility/HVAC panel builds; MCC/PCC canonical in power-electrical |
| `process-instrumentation` | 2 | `automation-instrumentation` | Process Instrumentation & Sensors | expanded families (ADD): source had only grouped nodes |
| `flow-instruments` | 3 | `process-instrumentation` | Flow Meters & Instruments | ADD |
| `pressure-instruments` | 3 | `process-instrumentation` | Pressure Instruments | ADD |
| `level-instruments` | 3 | `process-instrumentation` | Level Instruments | ADD |
| `temperature-instruments` | 3 | `process-instrumentation` | Temperature Instruments | ADD |
| `online-analyzers` | 3 | `process-instrumentation` | Online Sensors & Analyzers | from Quality L1 process monitoring |
| `field-devices` | 3 | `process-instrumentation` | Sensors, Actuators & Field Devices |  |
| `industrial-robotics` | 2 | `automation-instrumentation` | Industrial Robotics |  |
| `robot-cells` | 3 | `industrial-robotics` | Industrial Robot Cells | pick-place/load-unload = application attribute |
| `collaborative-robots` | 3 | `industrial-robotics` | Collaborative Robots (Cobots) |  |
| `vision-guided-robotics` | 3 | `industrial-robotics` | Vision-Guided Robotic Systems |  |
| `monitoring-systems` | 2 | `automation-instrumentation` | Plant Monitoring & Energy Management | HOME: OEE/EMS/predictive x2-3 source dups |
| `production-monitoring-oee` | 3 | `monitoring-systems` | Production Monitoring & OEE Systems |  |
| `energy-monitoring-systems` | 3 | `monitoring-systems` | Energy Monitoring & Metering Systems | merges EMS/process/compressed-air/HVAC energy monitoring |
| `predictive-maintenance-systems` | 3 | `monitoring-systems` | Predictive Maintenance Systems |  |
| `remote-monitoring-platforms` | 3 | `monitoring-systems` | Remote Monitoring & Alarm Platforms | dashboards/alarm management |
| `data-historians` | 3 | `monitoring-systems` | Data Acquisition & Historian Systems |  |
| `material-handling` | 1 | — | Material Handling, Storage & Logistics |  |
| `lifting-equipment` | 2 | `material-handling` | Lifting & Handling Equipment |  |
| `forklifts` | 3 | `lifting-equipment` | Forklifts |  |
| `stackers-pallet-trucks` | 3 | `lifting-equipment` | Stackers & Pallet Trucks |  |
| `cranes-hoists` | 3 | `lifting-equipment` | Cranes & Hoists |  |
| `overhead-cranes` | 4 | `cranes-hoists` | Overhead (EOT) Cranes |  |
| `gantry-cranes` | 4 | `cranes-hoists` | Gantry Cranes |  |
| `jib-cranes` | 4 | `cranes-hoists` | Jib Cranes |  |
| `hoists-winches` | 4 | `cranes-hoists` | Hoists & Winches | ADD: hoists implied but unnamed in source |
| `conveyors` | 2 | `material-handling` | Conveying Systems | HOME: single conveyor family home (source had 2 branches) |
| `belt-conveyors` | 3 | `conveyors` | Belt Conveyors | flat/trough/inclined = attribute |
| `roller-conveyors` | 3 | `conveyors` | Roller Conveyors |  |
| `screw-conveyors` | 3 | `conveyors` | Screw Conveyors |  |
| `chain-drag-conveyors` | 3 | `conveyors` | Chain & Drag Conveyors |  |
| `bucket-elevators` | 3 | `conveyors` | Bucket Elevators |  |
| `vibrating-conveyors` | 3 | `conveyors` | Vibrating Conveyors |  |
| `pneumatic-conveying` | 3 | `conveyors` | Pneumatic Conveying |  |
| `pneumatic-conveying-systems` | 4 | `pneumatic-conveying` | Pneumatic Conveying Systems | lean/dense phase = attribute |
| `rotary-airlock-diverter-valves` | 4 | `pneumatic-conveying` | Rotary Airlocks & Diverter Valves |  |
| `conveying-blowers` | 4 | `pneumatic-conveying` | Conveying Blowers & Vacuum Pumps |  |
| `bulk-storage` | 2 | `material-handling` | Bulk Storage Systems | HOME: silos/bins/tanks single home (3 source locations) |
| `silos` | 3 | `bulk-storage` | Industrial Silos | MS/SS/aluminium = material attribute |
| `hoppers-bins` | 3 | `bulk-storage` | Hoppers, Bins & Bulk Containers |  |
| `bulk-storage-tanks` | 3 | `bulk-storage` | Bulk Storage Tanks |  |
| `warehouse-storage` | 2 | `material-handling` | Warehousing & Racking |  |
| `pallet-racking` | 3 | `warehouse-storage` | Pallet Racking Systems |  |
| `industrial-shelving` | 3 | `warehouse-storage` | Industrial Shelving |  |
| `asrs-automation` | 3 | `warehouse-storage` | ASRS & Warehouse Automation |  |
| `ibc-totes-containers` | 3 | `warehouse-storage` | IBC Totes & Industrial Containers | from liquid processing storage (container = handling asset) |
| `loading-dock` | 2 | `material-handling` | Loading & Dock Equipment |  |
| `dock-levelers` | 3 | `loading-dock` | Dock Levelers |  |
| `dock-shelters-seals` | 3 | `loading-dock` | Dock Shelters & Seals |  |
| `transit-packaging` | 2 | `material-handling` | Transit Packaging & Pallets |  |
| `industrial-packaging-crating` | 3 | `transit-packaging` | Industrial Packaging & Crating |  |
| `pallets` | 3 | `transit-packaging` | Pallets | ADD: missing core family (wooden/plastic/steel = attribute) |
| `intralogistics` | 2 | `material-handling` | In-Plant Logistics Systems |  |
| `agv-amr-systems` | 3 | `intralogistics` | AGV & AMR Systems | ADD: named modern family (source: "intralogistics" only) |
| `material-flow-systems` | 3 | `intralogistics` | Material Flow & Intralogistics Systems |  |
| `construction-infrastructure` | 1 | — | Construction & Building Products | civil WORKS moved to industrial-services |
| `peb-structures` | 2 | `construction-infrastructure` | Pre-Engineered & Steel Structures |  |
| `peb-sheds` | 3 | `peb-structures` | Pre-Engineered Buildings & Sheds |  |
| `steel-structures-modular` | 3 | `peb-structures` | Steel Structures & Modular Buildings |  |
| `mezzanine-floors` | 3 | `peb-structures` | Mezzanine Floors & Platforms |  |
| `roofing-cladding` | 2 | `construction-infrastructure` | Roofing, Cladding & Insulation |  |
| `metal-insulated-roofing` | 3 | `roofing-cladding` | Metal & Insulated Roofing |  |
| `wall-cladding` | 3 | `roofing-cladding` | Wall Cladding Systems |  |
| `thermal-insulation-waterproofing` | 3 | `roofing-cladding` | Thermal Insulation & Waterproofing |  |
| `industrial-flooring` | 2 | `construction-infrastructure` | Industrial Flooring |  |
| `epoxy-pu-flooring` | 3 | `industrial-flooring` | Epoxy, PU & Heavy-Duty Flooring |  |
| `construction-machinery` | 2 | `construction-infrastructure` | Construction Machinery |  |
| `earthmoving-equipment` | 3 | `construction-machinery` | Earthmoving Equipment |  |
| `concrete-equipment` | 3 | `construction-machinery` | Concrete Equipment |  |
| `construction-lifting-equipment` | 3 | `construction-machinery` | Construction Lifting Equipment |  |
| `quality-lab` | 1 | — | Quality, Lab & Measurement |  |
| `dimensional-metrology` | 2 | `quality-lab` | Dimensional Measurement & Metrology |  |
| `calipers-micrometers-gauges` | 3 | `dimensional-metrology` | Calipers, Micrometers & Gauges | HOME: merges MRO measuring-tools dup |
| `cmm-vision-measuring` | 3 | `dimensional-metrology` | CMM & Vision Measuring Machines | ADD: core metrology family |
| `ndt-equipment` | 2 | `quality-lab` | NDT Equipment |  |
| `ultrasonic-testing-equipment` | 3 | `ndt-equipment` | Ultrasonic Testing Equipment |  |
| `magnetic-penetrant-testing` | 3 | `ndt-equipment` | Magnetic Particle & Dye Penetrant Testing |  |
| `radiography-testing-equipment` | 3 | `ndt-equipment` | Radiography Testing Equipment |  |
| `lab-analytical` | 2 | `quality-lab` | Laboratory & Analytical Instruments |  |
| `spectrophotometers` | 3 | `lab-analytical` | Spectrophotometers |  |
| `chromatographs` | 3 | `lab-analytical` | Chromatographs |  |
| `general-lab-equipment` | 3 | `lab-analytical` | General Lab Equipment | ADD: balances/furnaces/glassware home |
| `material-testing` | 2 | `quality-lab` | Physical & Material Testing |  |
| `universal-testing-machines` | 3 | `material-testing` | Universal Testing Machines (UTM) |  |
| `hardness-testers` | 3 | `material-testing` | Hardness Testers |  |
| `impact-testers` | 3 | `material-testing` | Impact Testers |  |
| `environmental-monitoring` | 2 | `quality-lab` | Environmental Monitoring Systems |  |
| `air-quality-monitoring` | 3 | `environmental-monitoring` | Air Quality & Emission Monitoring |  |
| `water-quality-monitoring` | 3 | `environmental-monitoring` | Water Quality Monitoring |  |
| `noise-monitoring` | 3 | `environmental-monitoring` | Noise Monitoring Systems |  |
| `calibration-equipment` | 2 | `quality-lab` | Calibration Instruments & Standards | calibration SERVICES live in industrial-services |
| `electrical-test-instruments` | 2 | `quality-lab` | Electrical Test Instruments | multimeters/clamp meters/testers from MRO tools |
| `it-ot-software` | 1 | — | IT, OT & Industrial Software | control hardware moved to automation-instrumentation |
| `it-infrastructure` | 2 | `it-ot-software` | IT Hardware & Networking |  |
| `servers-storage` | 3 | `it-infrastructure` | Servers & Storage |  |
| `industrial-networking` | 3 | `it-infrastructure` | Industrial Networking |  |
| `data-center-infrastructure` | 3 | `it-infrastructure` | Data Center Infrastructure | cloud services = service |
| `industrial-software` | 2 | `it-ot-software` | Industrial & Enterprise Software |  |
| `mes-software` | 3 | `industrial-software` | MES & Production Management Software |  |
| `cmms-software` | 3 | `industrial-software` | CMMS & Asset Management Software |  |
| `erp-scm-software` | 3 | `industrial-software` | ERP, SCM & Inventory Software |  |
| `qms-software` | 3 | `industrial-software` | QMS & Compliance Software |  |
| `energy-analytics-software` | 3 | `industrial-software` | Energy Analytics & Reporting Software | from utility monitoring branch |
| `ot-cybersecurity` | 2 | `it-ot-software` | OT & Industrial Cybersecurity |  |
| `ot-security-systems` | 3 | `ot-cybersecurity` | OT Security & Network Protection |  |
| `mro-consumables` | 1 | — | MRO, Components & Consumables |  |
| `bearings-power-transmission` | 2 | `mro-consumables` | Bearings & Power Transmission |  |
| `bearings` | 3 | `bearings-power-transmission` | Bearings | HOME: merges block-10 + block-13 bearing dups |
| `ball-bearings` | 4 | `bearings` | Ball Bearings |  |
| `roller-bearings` | 4 | `bearings` | Roller Bearings |  |
| `thrust-bearings` | 4 | `bearings` | Thrust Bearings |  |
| `pillow-blocks-housings` | 4 | `bearings` | Pillow Blocks & Bearing Housings |  |
| `gearboxes-reducers` | 3 | `bearings-power-transmission` | Gearboxes & Speed Reducers |  |
| `couplings` | 3 | `bearings-power-transmission` | Couplings |  |
| `chains-sprockets` | 3 | `bearings-power-transmission` | Chains & Sprockets | merges block-13 dup |
| `belts-pulleys` | 3 | `bearings-power-transmission` | Belts & Pulleys | V/timing belts, taper-lock = attribute; merges block-13 dup |
| `seals-gaskets` | 2 | `mro-consumables` | Seals, Gaskets & Packings | HOME: merges 3 source locations |
| `oil-seals-o-rings` | 3 | `seals-gaskets` | Oil Seals & O-Rings |  |
| `gaskets-packings` | 3 | `seals-gaskets` | Gaskets & Gland Packings | food-grade = attribute |
| `mechanical-seals` | 3 | `seals-gaskets` | Mechanical Seals |  |
| `fasteners` | 2 | `mro-consumables` | Fasteners & Hardware |  |
| `bolts-nuts-washers` | 3 | `fasteners` | Bolts, Nuts & Washers |  |
| `screws-anchors-rivets` | 3 | `fasteners` | Screws, Anchors & Rivets |  |
| `springs-pins` | 3 | `fasteners` | Springs, Pins & Locking Hardware |  |
| `wear-parts` | 2 | `mro-consumables` | Wear Parts & Liners |  |
| `wear-plates-liners` | 3 | `wear-parts` | Wear Plates, Liners & Strips | HOME: merges crusher-spares Wear Plates dup |
| `bushes-sleeves-rails` | 3 | `wear-parts` | Bushes, Sleeves & Guide Rails |  |
| `valves-piping` | 2 | `mro-consumables` | Valves, Piping & Fittings | ADD: major missing family (no valve/pipe home in source) |
| `industrial-valves` | 3 | `valves-piping` | Industrial Valves |  |
| `gate-globe-check-valves` | 4 | `industrial-valves` | Gate, Globe & Check Valves |  |
| `ball-valves` | 4 | `industrial-valves` | Ball Valves |  |
| `butterfly-valves` | 4 | `industrial-valves` | Butterfly Valves |  |
| `control-valves` | 4 | `industrial-valves` | Control Valves |  |
| `safety-relief-valves` | 4 | `industrial-valves` | Safety & Pressure Relief Valves |  |
| `industrial-pipes-tubes` | 3 | `valves-piping` | Industrial Pipes & Tubes |  |
| `ms-gi-pipes` | 4 | `industrial-pipes-tubes` | MS & GI Pipes |  |
| `ss-pipes` | 4 | `industrial-pipes-tubes` | Stainless Steel Pipes & Tubes |  |
| `plastic-pipes` | 4 | `industrial-pipes-tubes` | HDPE, PVC & Plastic Pipes |  |
| `pipe-fittings-flanges` | 3 | `valves-piping` | Pipe Fittings & Flanges |  |
| `electrical-spares` | 2 | `mro-consumables` | Electrical Components & Spares |  |
| `circuit-breakers-fuses` | 3 | `electrical-spares` | Circuit Breakers & Fuses | MCB/MCCB/ACB = attribute+synonyms |
| `contactors-relays` | 3 | `electrical-spares` | Contactors & Relays | HOME: merges block-13 switchgear spares |
| `push-buttons-indicators` | 3 | `electrical-spares` | Push Buttons & Indicators |  |
| `motor-spares` | 3 | `electrical-spares` | Motor Spares & Components | carbon brushes/capacitors/fans; whole motors in power-electrical |
| `automation-spares` | 2 | `mro-consumables` | Automation Spares |  |
| `plc-modules-io` | 3 | `automation-spares` | PLC Modules & I/O Cards |  |
| `hmi-spares` | 3 | `automation-spares` | HMI Panels & Operator Interfaces |  |
| `drive-spares` | 3 | `automation-spares` | VFD & Servo Drive Spares | whole drives canonical in power-electrical motors-drives |
| `cables-accessories` | 2 | `mro-consumables` | Cables & Wiring Accessories |  |
| `power-control-cables` | 3 | `cables-accessories` | Power, Control & Instrumentation Cables |  |
| `cable-glands-lugs` | 3 | `cables-accessories` | Cable Glands, Lugs & Connectors |  |
| `cable-trays-trunking` | 3 | `cables-accessories` | Cable Trays & Trunking |  |
| `hydraulics` | 2 | `mro-consumables` | Hydraulic Components |  |
| `hydraulic-pumps-cylinders` | 3 | `hydraulics` | Hydraulic Pumps, Motors & Cylinders |  |
| `hydraulic-valves-power-packs` | 3 | `hydraulics` | Hydraulic Valves & Power Packs |  |
| `hydraulic-hoses-fittings` | 3 | `hydraulics` | Hydraulic Hoses & Fittings |  |
| `pneumatics` | 2 | `mro-consumables` | Pneumatic Components |  |
| `pneumatic-cylinders-actuators` | 3 | `pneumatics` | Pneumatic Cylinders, Actuators & Grippers |  |
| `pneumatic-valves-frl` | 3 | `pneumatics` | Solenoid Valves & FRL Units |  |
| `pneumatic-fittings-tubing` | 3 | `pneumatics` | Pneumatic Tubing & Fittings |  |
| `compressed-air-spares` | 3 | `pneumatics` | Compressed Air & Vacuum Spares | filters/separators/dryer elements/vacuum pump spares |
| `machine-spares` | 2 | `mro-consumables` | Machine-Specific Spares |  |
| `textile-machine-spares` | 3 | `machine-spares` | Textile Machine Spares |  |
| `spinning-spares` | 4 | `textile-machine-spares` | Spinning Machine Spares | spindle/ring/traveller/bobbin/apron; Tula = local synonym |
| `carding-combing-spares` | 4 | `textile-machine-spares` | Carding & Combing Spares |  |
| `weaving-knitting-spares` | 4 | `textile-machine-spares` | Weaving & Knitting Spares | reeds/healds/needles/sinkers |
| `cement-plant-spares` | 3 | `machine-spares` | Cement & Crusher Spares |  |
| `cement-mill-kiln-spares` | 4 | `cement-plant-spares` | Cement Mill & Kiln Spares | liners/grinding media/kiln tyres/girth gears/burner nozzles |
| `crusher-spares` | 4 | `cement-plant-spares` | Crusher Spares | jaw plates/impact hammers |
| `food-machine-spares` | 3 | `machine-spares` | Food & Beverage Machine Spares |  |
| `food-processing-spares` | 4 | `food-machine-spares` | Food Processing Spares | blades/screens/food-grade seals & belts |
| `filling-line-spares` | 4 | `food-machine-spares` | Filling & Packaging Line Spares | sealing jaws/nozzles/capping heads |
| `pharma-chemical-spares` | 3 | `machine-spares` | Pharma & Chemical Machine Spares |  |
| `pharma-tooling` | 4 | `pharma-chemical-spares` | Pharma Tooling & Spares | punches & dies/compression tooling/coating pan/granulator screens |
| `chemical-machine-spares` | 4 | `pharma-chemical-spares` | Chemical Machine Spares | agitator blades/reactor seals & liners |
| `plastics-machine-spares` | 3 | `machine-spares` | Plastics Machine Spares |  |
| `injection-molding-spares` | 4 | `plastics-machine-spares` | Injection Molding Spares | screw & barrel/nozzle tips/heater bands/tie bar nuts |
| `extrusion-blow-spares` | 4 | `plastics-machine-spares` | Extrusion & Blow Molding Spares | die heads/calibration sleeves |
| `packaging-printing-spares` | 3 | `machine-spares` | Packaging & Printing Machine Spares |  |
| `packaging-machine-spares` | 4 | `packaging-printing-spares` | Packaging Machine Spares | cutting blades/teflon belts/guide rollers |
| `printing-machine-spares` | 4 | `packaging-printing-spares` | Printing Machine Spares | print rollers/doctor blades |
| `cnc-fabrication-spares` | 3 | `machine-spares` | CNC & Fabrication Machine Spares |  |
| `cnc-spares` | 4 | `cnc-fabrication-spares` | CNC Machine Spares | ball screws/linear guides/spindle motors |
| `welding-machine-spares` | 4 | `cnc-fabrication-spares` | Welding & Cutting Machine Spares | torches/nozzles/chuck jaws |
| `utility-equipment-spares` | 3 | `machine-spares` | Utility Equipment Spares |  |
| `boiler-spares` | 4 | `utility-equipment-spares` | Boiler & Thermal Spares | boiler tubes/burner spares/refractory |
| `pump-compressor-spares` | 4 | `utility-equipment-spares` | Pump & Compressor Spares | impellers/shafts/sleeves/seal kits; merges block-13 pump components |
| `consumables` | 2 | `mro-consumables` | Industrial Consumables |  |
| `lubricants-oils` | 3 | `consumables` | Lubricants, Oils & Greases |  |
| `cutting-fluids-coolants` | 3 | `consumables` | Cutting Fluids & Coolants | rust preventives included |
| `maintenance-chemicals` | 3 | `consumables` | Cleaning & Maintenance Chemicals | degreasing/descaling |
| `welding-consumables` | 3 | `consumables` | Welding Consumables | electrodes/MIG-TIG wire/flux |
| `abrasives` | 3 | `consumables` | Abrasives & Cutting Discs | grinding wheels included; gas cutting nozzles → welding spares |
| `filter-media` | 3 | `consumables` | Filter Bags, Cartridges & Media | from process dust-control branch (consumable) |
| `tapes-films-strapping` | 3 | `consumables` | Tapes, Films & Strapping Materials |  |
| `wipers-absorbents` | 3 | `consumables` | Wipers, Absorbents & Spill Kits |  |
| `tools-workshop` | 2 | `mro-consumables` | Tools & Workshop Equipment |  |
| `hand-tools` | 3 | `tools-workshop` | Hand Tools |  |
| `power-tools` | 3 | `tools-workshop` | Power Tools | electric/pneumatic/cordless = attribute |
| `tool-accessories` | 3 | `tools-workshop` | Tool Bits, Blades & Accessories |  |
| `workbenches-storage` | 3 | `tools-workshop` | Workbenches, Cabinets & Tool Storage |  |
| `maintenance-kits` | 3 | `tools-workshop` | Maintenance & Shutdown Kits | PM kits/overhaul sets; LOTO → safety |
| `industrial-services` | 1 | — | Industrial & Professional Services | HOME: single services root (source scattered services across 8 branches) |
| `engineering-design` | 2 | `industrial-services` | Engineering & Design Services |  |
| `process-engineering` | 3 | `engineering-design` | Process Engineering Services |  |
| `mechanical-electrical-engineering` | 3 | `engineering-design` | Mechanical & Electrical Engineering Services |  |
| `detailed-engineering` | 3 | `engineering-design` | Detailed Engineering & Documentation |  |
| `epc-turnkey` | 2 | `industrial-services` | EPC & Turnkey Projects | domain leaves kept for vendor/RFQ matching precision |
| `industrial-epc` | 3 | `epc-turnkey` | Industrial EPC & Turnkey Projects |  |
| `production-line-turnkey` | 3 | `epc-turnkey` | Production Line Turnkey & Integration | greenfield/brownfield/debottlenecking = attribute |
| `electrical-epc` | 3 | `epc-turnkey` | Electrical EPC Projects |  |
| `water-treatment-epc` | 3 | `epc-turnkey` | Water Treatment EPC (WTP/ETP/ZLD) |  |
| `boiler-thermal-epc` | 3 | `epc-turnkey` | Boiler & Thermal EPC Projects |  |
| `compressed-air-epc` | 3 | `epc-turnkey` | Compressed Air System EPC |  |
| `hvac-cleanroom-epc` | 3 | `epc-turnkey` | HVAC & Cleanroom EPC Projects |  |
| `fire-protection-epc` | 3 | `epc-turnkey` | Fire Protection EPC Projects |  |
| `packaging-line-epc` | 3 | `epc-turnkey` | Packaging Line Turnkey Projects |  |
| `utility-automation-epc` | 3 | `epc-turnkey` | Utility & Automation EPC Projects |  |
| `material-handling-epc` | 3 | `epc-turnkey` | Material Handling & Logistics Turnkey |  |
| `installation-commissioning` | 2 | `industrial-services` | Installation & Commissioning | HOME: merges 5 identical source leaves |
| `equipment-installation` | 3 | `installation-commissioning` | Equipment Installation & Commissioning | domain = attribute |
| `fat-sat-testing` | 3 | `installation-commissioning` | FAT / SAT & Acceptance Testing |  |
| `machine-integration` | 3 | `installation-commissioning` | Machine Integration & Synchronization | M2M integration services |
| `maintenance-services` | 2 | `industrial-services` | Maintenance & AMC Services |  |
| `amc-contracts` | 3 | `maintenance-services` | Annual Maintenance Contracts (AMC) | HOME: merges 6 identical source leaves; domain = attribute |
| `operation-maintenance` | 3 | `maintenance-services` | Operation & Maintenance (O&M) |  |
| `shutdown-maintenance` | 3 | `maintenance-services` | Shutdown & Turnaround Services | ADD: implied by shutdown spare kits |
| `audits-optimization` | 2 | `industrial-services` | Audits & Optimization Services |  |
| `energy-audits` | 3 | `audits-optimization` | Energy Audits & Optimization | HOME: merges 5 domain energy-audit leaves |
| `safety-compliance-audits` | 3 | `audits-optimization` | Safety, Fire & EHS Audits | merges fire/electrical/EHS audit dups |
| `process-optimization` | 3 | `audits-optimization` | Process Optimization & Tuning |  |
| `tab-services` | 3 | `audits-optimization` | Testing, Adjusting & Balancing (TAB) |  |
| `statutory-inspection` | 3 | `audits-optimization` | Statutory Testing & Inspection | boiler statutory etc. |
| `testing-certification` | 2 | `industrial-services` | Testing, Calibration & Certification |  |
| `third-party-testing` | 3 | `testing-certification` | Third-Party Testing Services | material/product/compliance |
| `calibration-services` | 3 | `testing-certification` | Calibration Services | lab & on-site |
| `iso-gmp-certification` | 3 | `testing-certification` | ISO, GMP & Certification Services | HOME: merges Quality + Business dup |
| `gmp-validation-support` | 3 | `testing-certification` | GMP & Validation Support |  |
| `construction-services` | 2 | `industrial-services` | Construction & Civil Works | WORKS from Construction L1 |
| `industrial-civil-works` | 3 | `construction-services` | Industrial Civil Construction | buildings/RCC & steel structural works |
| `roads-yard-works` | 3 | `construction-services` | Roads, Pavements & Yard Development |  |
| `drainage-underground-works` | 3 | `construction-services` | Drainage & Underground Works | storm water/sewerage/underground piping & ducts |
| `site-development-works` | 3 | `construction-services` | Site Development & Boundary Works |  |
| `flooring-application-services` | 3 | `construction-services` | Industrial Flooring Application |  |
| `business-services` | 2 | `industrial-services` | Business & Commercial Services |  |
| `project-management-pmc` | 3 | `business-services` | Project Management & PMC | HOME: merges Construction PMC dup |
| `financial-advisory` | 3 | `business-services` | Financial Advisory & Project Finance |  |
| `procurement-sourcing` | 3 | `business-services` | Procurement & Sourcing Services |  |
| `licensing-regulatory` | 3 | `business-services` | Licensing & Regulatory Approvals |  |
| `hr-training` | 2 | `industrial-services` | HR & Training Services |  |
| `manpower-recruitment` | 3 | `hr-training` | Manpower Supply & Recruitment |  |
| `technical-training` | 3 | `hr-training` | Technical Training Services |  |
| `safety-compliance-training` | 3 | `hr-training` | Safety & Compliance Training | HOME: merges 3 training dups incl. fire drills |
| `logistics-supply-services` | 2 | `industrial-services` | Logistics & Supply Programs |  |
| `transport-fleet-services` | 3 | `logistics-supply-services` | Industrial Transport & Fleet Services |  |
| `mro-supply-programs` | 3 | `logistics-supply-services` | MRO Supply Programs & Contracts | rate contracts/VMI/JIT/inventory management |
| `it-services` | 2 | `industrial-services` | IT & Digital Services |  |
| `system-integration-services` | 3 | `it-services` | System Integration & Deployment |  |
| `cloud-hosting-services` | 3 | `it-services` | Cloud & Hosting Services |  |
| `software-support-amc` | 3 | `it-services` | Software Support & AMC |  |
