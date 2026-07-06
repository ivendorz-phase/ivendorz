# Category Taxonomy Review — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion, submitted for owner/Board adjudication
under CLAUDE.md §13 (Raise ≠ Accept — this review *raises*; the Board *rules*).
**Date:** 2026-07-02 · **Home:** `docs/product/requirements/` · **Proposes:** **Taxonomy Content v1.0** under
Classification Schema v1.0.
**Companions:** `CATEGORY_MIGRATION_PLAN.md` (implementation + full old→new mapping) ·
`CATEGORY_GOVERNANCE_MODEL.md` (evolution rules) · `CATEGORY_ATTRIBUTE_FRAMEWORK.md` (attributes) ·
`CATEGORY_TAXONOMY_DECISION_RECORD.md` (rationale record) · terminology per
`MASTER-CLASSIFICATION-DICTIONARY.md`.

**Subject.** The current iVendorz industrial category taxonomy (Excel export, 2026-07; normalized
inventory = Appendix A of the migration plan): **751 leaf nodes, 1,078 total nodes**, 10 distinct L1
groups spread over 13 physical blocks. This review covers hierarchy, naming, parent-child integrity,
duplicates, gaps, buyer/vendor mental models, RFQ matching fit, search/SEO/AI readiness, and
scalability — and proposes a complete replacement tree (**794 nodes: 13 L1 · 87 L2 · 354 L3 · 340
L4**), fully re-mapped node-by-node in the migration plan.

**Frozen-corpus frame (binding on every recommendation here):**
- Category mechanism is frozen: 4-level tree (`level CHECK 1–4`), `draft → active → retired`,
  Admin-only publication, UUIDv7 + unique slugs, soft delete, no coined events (`Doc-2 §10.3` ·
  `Doc-4D` DD-4 · `Doc-4J` BC-ADM-3 · `Doc-6D §3.2`).
- Taxonomy **content** is open — nothing in the corpus prescribes any category list (`Doc-6D §7`).
- Matching: category is hard gate **A2**; the capability matrix is gate **A3**; independent, neither
  dominates; excluded vendors are never disclosed (`Doc-3 §3.1` · `Doc-4E §E5.1/H.10`).
- **Category ≠ Industry ≠ Business Type ≠ Capability** (ADR-023 package; `ESC-RFQ-PROCCAT` already
  ruled: reuse `marketplace.categories`, coin no new entity).
- **A fifth level is architecturally impossible** without a Board-approved corpus patch. The original
  request ("Level 5 only where necessary") is answered structurally: anything below L4 is an
  attribute, a spec, or a synonym — never a node. This also happens to be correct IA practice.

---

## 1. Executive Review

### Strengths
- **Domain coverage is genuinely broad and locally grounded.** The tree reflects real Bangladesh
  industrial procurement (WTP/ETP, jute, spinning spares incl. the local term *Tula*, DG sets, AAC
  brick plants). Most of the right *concepts* exist somewhere.
- **Depth is mostly appropriate** — 4 levels used through the machinery branches with sensible
  L2 process groupings (bulk/liquid/thermal/packaging) that match how plant engineers think.
- **Specificity where it matters**: pump types, dryer types, welding processes, and boiler families
  are individually addressable — good raw material for RFQ targeting.

### Findings (severity per CLAUDE.md §13 — gating: BLOCKER/MAJOR/MINOR; adjudication is the Board's)

| # | Severity | Finding | Evidence (normalized inventory) |
|---|---|---|---|
| F-1 | **BLOCKER** | **Structural integrity failure**: "MRO, Spares & Industrial Consumables" appears as **4 separate L1 blocks** (blocks 10–13), one in a different flat column format; block 11 lost a hierarchy level (material headers sit as siblings of their own items); duplicate L2 "Mechanical Spares & Components" across blocks. The artifact cannot be seeded as-is. | blocks 10–13; SRC-617…SRC-751 |
| F-2 | **MAJOR** | **Duplicate concepts across branches** (~39 flagged rows + 31 family-level overlaps): conveyors ×2, silos/bins/tanks ×3, dust collectors & scrubbers ×3, PLC/SCADA ×4+, energy monitoring ×3, fire extinguishers ×2, emergency lighting ×2, calipers ×2, checkweighers/vision ×2, heat exchangers ×2, pressure vessels ×2 (verbatim), Greige Fabric ×3, cotton yarn ×2, bearings/belts/chains/seals duplicated wholesale between block 10 and flat block 13. Duplicates split vendor liquidity, make gate A2 unreliable (which node does the RFQ target?), and cannibalize SEO. | notes columns `dup`/`dup-family` |
| F-3 | **MAJOR** | **Services interleaved in product branches** (69 rows): every utilities L2 carries its own EPC/Installation/AMC/Audit subtree; "Installation & Commissioning Services" appears verbatim ×5, "AMC" ×6, energy audits ×5, training ×3. A service vendor must self-classify into up to 8 scattered nodes; buyers can't find "who does boiler AMC" in one place. Violates product/service separation (and maps badly onto the frozen `work_nature` axis, which already encodes supply-vs-service on the RFQ). | notes column `service` |
| F-4 | **MAJOR** | **Attribute-as-category nodes**: Storage Tanks (SS)/(FRP)/(MS); Stainless/Glass-Lined/Alloy Reactors; OEM/Authorized/Critical/Emergency spares (sourcing & urgency as categories); Silos (MS, SS, Aluminum); food-grade variants. Materials, sourcing arrangements, and urgency are attributes — as categories they explode combinatorially and confuse vendor self-classification. | notes `attribute-as-category` |
| F-5 | **MAJOR** | **Missing major families**: no home for industrial valves (gate/globe/ball/butterfly/control), pipes & tubes (GI/MS/SS/HDPE — among the highest-volume industrial purchases in Bangladesh), pipe fittings & flanges; PPE is one grouped leaf (no respiratory/fall protection); process instrumentation (flow/pressure/level/temperature) exists only as one grouped "sensors" row; no pallets, no hoists, no AGV/AMR, no CMM. | gap analysis vs. new tree `ADD` notes |
| F-6 | **MAJOR** | **Grouped multi-concept leaves** break RFQ precision: "Belt, Roller & Screw Conveyors", "Forklifts, Stackers & Pallet Trucks", "Overhead, Gantry & Jib Cranes", "UTM, Hardness & Impact Testers", "PP, PE, PVC, PET". An RFQ for a jib crane matches vendors of overhead cranes; a PP resin RFQ reaches PVC traders. One concept per node is a matching requirement, not just style. | ~23 SPLIT rows in mapping |
| F-7 | **MINOR** | **Naming inconsistencies**: scope qualifiers baked into names ("Roller Conveyors (Process use only)", "(Packaging line)", "(Process duty)" ×2 verbatim duplicates); umbrella nodes as siblings of their own children ("Industrial Dryers" next to six dryer types, "Process Reactors" next to its variants); catch-alls ("Other Pumps", "General Industrial Chemicals"); abbreviation collision (BMS = Burner Management **and** Building Management). | notes `parent-as-sibling`, `catch-all`, `abbrev-collision` |
| F-8 | **MINOR** | **Encoding corruption** (mojibake): "IBC â€" Process use", "Liquidâ€"Powder", "COâ‚‚" rendered as "COâ" — 7 rows; must be normalized before any import. | notes `mojibake-fixed` |
| F-9 | **OBS** | Depth already uses all 4 frozen levels in the machinery branches — there is **zero headroom** for sub-typing by adding levels; the attribute framework is not optional, it is the only lawful pressure valve. | — |
| F-10 | **OBS** | No synonym/alias layer exists anywhere (also absent from the frozen corpus — a NET-NEW mechanism opportunity, §8/§9). | — |

### Problem summaries by lens
- **UX**: duplicates + grouped leaves make the Explorer ambiguous ("Conveyors" in two L1s); services
  buried under 8 different parents; a maintenance engineer's world (MRO) is fractured across 4 blocks.
- **Architecture**: nothing violates the frozen mechanism, but ambiguous A2 targets degrade the moat
  (matching) and split-listed vendors burn their ≤10 assignment budget on duplicate nodes.
- **Scalability**: attribute-as-category and grouped leaves are the two patterns that grow O(products)
  instead of O(families); at 100k products the tree would need constant surgery.
- **SEO**: duplicate concepts = duplicate landing intent = self-cannibalizing pages; no slugs, no
  aliases, no synonym strategy.
- **Matching**: A2 needs exactly one obvious node per buyer intent; today "dust collector" has three.

---

## 2. Taxonomy Philosophy & Design Principles

The philosophy in one line: **the tree answers "what is it?" — everything else is another axis.**

| Principle | Meaning |
|---|---|
| **Stable** | Nodes describe product families that outlive products, brands, and trends; growth defaults to attributes/synonyms (Stable Taxonomy Principle — `CATEGORY_GOVERNANCE_MODEL.md` §2) |
| **Buyer-centric** | Organized by the buyer's mental model (what they need), not vendor org charts or internal convenience |
| **Industrial** | Uses the terms plant engineers actually use in Bangladesh (DG set, ETP, FBD, VFFS) |
| **Non-overlapping (mutually exclusive)** | One concept → one node; one home per product family |
| **Collectively exhaustive** | Every purchasable industrial thing has a home — even if the home is a family node, never a junk drawer |
| **Search-friendly** | Names are what people type; synonyms expand queries; nodes never exist just to catch a search term |
| **SEO-friendly** | Stable kebab slugs, one canonical page per concept, aliases redirect |
| **AI-friendly** | Clean node semantics + attribute vocabulary = reliable extraction targets (§8c) |
| **Expandable** | New markets add nodes under existing roots; roots don't churn |
| **Independent from attributes** | Material/size/rating/grade never form nodes (§"the ladder") |
| **Independent from brands** | Brand is a listing field, never a node |
| **Independent from suppliers** | No node exists because one vendor wants a shelf; no sourcing arrangement (OEM/authorized) as a node |
| **Independent from industry** | "Used in pharma" is the Industry axis (ADR-023 / `INDUSTRY-TAXONOMY-MODEL.md`) — see §"Cross-industry rule" |

### Category vs Product Family vs Application vs Material — the node-admission ladder

Every candidate node is placed on this ladder; only the top two rungs may become nodes:

```
Category         Pumps                          → node (L3)
Product family   Centrifugal Pump               → node (L4) — buyers browse & vendors specialize by it
Application      Chemical-duty pump             → ATTRIBUTE (duty/media), unless a market-recognized
                                                  browse family (rare; needs governance approval)
Material/grade   SS316                          → ATTRIBUTE, always
Brand            Grundfos                       → listing field, never a node
Sourcing/urgency OEM part / breakdown spare     → ATTRIBUTE, always
```

Test for "product family" (all must hold): buyers browse it as a family · vendors specialize in it as
a family · it stays meaningful for years · it can hold multiple vendors. Anything that fails =
attribute or synonym (`CATEGORY_ATTRIBUTE_FRAMEWORK.md` §1).

### Cross-industry rule (one home per family)

A **bearing** is bought by textile mills, cement plants, food factories, and pharma alike. It lives in
**exactly one node** (`bearings`). The industries it serves are the separate Industry axis
(`INDUSTRY-TAXONOMY-MODEL.md`, `ESC-CLASS-INDUSTRY` — Board-gated). The tree never forks a product
family by "who uses it"; the *only* industry-shaped branch is **Industry-Specific Production
Machinery**, where the machines themselves are industry-defined products (a tablet press *is* a pharma
machine), plus its mirror in machine-specific *spares* — both pass the ladder because buyers and
vendors genuinely specialize by those machine families.

### Product vs Service rule

**Never nest a service under a product node.** "Pump Installation" does not live inside "Pump".
Products and Industrial Services are separate L1 branches; an RFQ combines them through the frozen
`work_nature[]` axis (supply + service on one RFQ), the taxonomy does not. This resolves F-3: the
eight scattered EPC/AMC subtrees collapse into one Services root with *domain-specific leaves*
(boiler EPC ≠ fire EPC — kept separate for vendor targeting precision).

---

## 3. Recommended Taxonomy — Taxonomy Content v1.0

**Shape: 13 roots · 87 L2 · 354 L3 · 340 L4 = 794 nodes** (26% smaller than the source's 1,078 while
adding ~25 justified missing families). Machine-usable master table (slug · level · parent · name):
`CATEGORY_MIGRATION_PLAN.md` **Appendix C**. Full node-by-node source mapping: **Appendix B**.

### Why each level exists
- **L1 (13 roots)** — the Explorer's first column and the vendor's "what business am I in". Stable for
  a decade; renders in one screen; each root is a distinct procurement world.
- **L2 (87)** — the buyer's domain vocabulary ("Water & Wastewater Treatment", "Bearings & Power
  Transmission"). Where browsing starts to narrow; the natural granularity for vendor primary
  assignments (≤5 primary).
- **L3 (354)** — the *category* rung of the ladder: Pumps, Valves, Dryers. The default RFQ-targeting
  level and default vendor-assignment level.
- **L4 (340)** — the *product family* rung: Centrifugal Pumps, Butterfly Valves, Spray Dryers. Only
  exists where buyers genuinely browse a family (ladder test); many L3s deliberately terminate without
  children. **L5 does not exist and must never be simulated by attribute-named nodes.**

### The 13 roots

| # | Root (slug) | Contains (L2s) | Rationale |
|---|---|---|---|
| 1 | **Raw Materials & Chemicals** (`raw-materials`) | Industrial Chemicals · Polymers & Plastics · Metals & Alloys (incl. Metal Stock & Semi-Finished) · Minerals & Ores · Textile Raw Materials · Agro & Food Ingredients · Construction Raw Materials · Paper & Wood | Input goods bought by specification & grade. Absorbs the orphaned "semi-finished engineering materials" MRO block (what it *is* = metal stock) |
| 2 | **Production & Process Machinery** (`process-machinery`) | Bulk & Powder · Liquid & Fluid · Thermal & Separation · Packaging & Filling · Industry-Specific Machinery | Capital equipment that transforms product. Sheds machine tools (→ root 3), conveyors/silos (→ root 8), dust control (→ root 5), services (→ root 13) |
| 3 | **Machine Tools & Fabrication Equipment** (`machine-tools`) | Metal Cutting · Sheet Metal · Thermal & Precision Cutting · Welding & Joining · Presses & Forging · Workshop & Finishing · Tooling & Workholding | Bangladesh's light-engineering/workshop segment is a distinct buyer & vendor world with its own vocabulary — promoted from an L2 buried inside Production Machinery |
| 4 | **Power & Electrical Equipment** (`power-electrical`) | Power Generation · Substations & Distribution · Power Control & Quality · Backup & Energy Storage · Earthing & Lightning · **Electric Motors & Drives** | The electrical buyer (DG sets → transformers → motors). Motors & VFDs get their single whole-unit home here (spares stay in MRO) |
| 5 | **Plant Utility Systems** (`plant-utilities`) | Water & Wastewater · Steam & Boilers · Compressed Air, Gas & Vacuum · HVAC & Cleanroom · **Air Pollution & Dust Control** | Engineered plant-wide systems. Dust collectors/scrubbers get their one home here (was ×3). Utility *automation* moved to root 7; utility *services* to root 13 |
| 6 | **Fire, Safety & Security** (`fire-safety-security`) | Fire Detection & Alarm · Fire Suppression · Emergency & Escape · PPE (6 families) · Workplace Safety · Security & Surveillance | Merges the two duplicated fire branches; PPE expanded from one grouped leaf to a real L2 (respiratory & fall protection added) |
| 7 | **Automation, Control & Instrumentation** (`automation-instrumentation`) | Industrial Control Systems · Automation Panels · Process Instrumentation & Sensors · Industrial Robotics · Plant Monitoring & Energy Management | The single home for PLC/SCADA/DCS (was ×4+), OEE/EMS/predictive monitoring (was ×3), and the new instrumentation families (flow/pressure/level/temperature) |
| 8 | **Material Handling, Storage & Logistics** (`material-handling`) | Lifting Equipment · **Conveying Systems** · **Bulk Storage** · Warehousing & Racking · Loading & Dock · Transit Packaging & Pallets · In-Plant Logistics | One conveyor home (was ×2), one silo/bin/tank home (was ×3); adds pallets, hoists, AGV/AMR |
| 9 | **Construction & Building Products** (`construction-infrastructure`) | PEB & Steel Structures · Roofing, Cladding & Insulation · Industrial Flooring · Construction Machinery | Products only — civil *works* (buildings, roads, drainage, site dev) are services and moved to root 13 |
| 10 | **Quality, Lab & Measurement** (`quality-lab`) | Dimensional Metrology · NDT · Lab & Analytical · Material Testing · Environmental Monitoring · Calibration Instruments · Electrical Test Instruments | Instruments only; calibration/testing *services* → root 13. One home for calipers (was ×2) |
| 11 | **IT, OT & Industrial Software** (`it-ot-software`) | IT Hardware & Networking · Industrial & Enterprise Software · OT Cybersecurity | Slimmed: control *hardware* → root 7; integration/cloud *services* → root 13 |
| 12 | **MRO, Components & Consumables** (`mro-consumables`) | Bearings & Power Transmission · Seals & Gaskets · Fasteners · Wear Parts · **Valves, Piping & Fittings** (new) · Electrical Spares · Automation Spares · Cables · Hydraulics · Pneumatics · Machine-Specific Spares · Consumables · Tools & Workshop | The maintenance engineer's world, reunified from 4 fragmented blocks. Valves/pipes/fittings added (F-5) — among the highest-volume BD industrial purchases |
| 13 | **Industrial & Professional Services** (`industrial-services`) | Engineering & Design · EPC & Turnkey (11 domain leaves) · Installation & Commissioning · Maintenance & AMC · Audits & Optimization · Testing, Calibration & Certification · Construction & Civil Works · Business Services · HR & Training · Logistics & Supply Programs · IT Services | The single services root (F-3). Domain-specific EPC leaves preserved (fire EPC ≠ boiler EPC) so gate A2 still routes precisely; the vendor's `can_service`/`can_consult` flags (gate A3) do the rest |

Representative L3/L4 detail for every branch is in the master table (Appendix C); the structure below
L2 follows the source where the source was healthy and applies the ladder where it was not (all
deviations are dispositioned row-by-row in Appendix B).

---

## 4. Navigation Review

**Target surface:** the public **Industrial Category Explorer** (`ux_patterns.md` §3.2 — four
synchronized columns, hover-to-drill, whole taxonomy visible; realizes `information_architecture.md`
§5.3). The 4-level tree maps 1:1 onto the 4 columns — the frozen depth limit and the frozen UX pattern
are the same number by design, and this tree is built for that surface:

- **13 roots fit one column** without scrolling on desktop (the source's 10-but-actually-13-blocks
  did not render coherently at all).
- **Names are click-predictable**: `Industrial Pumps → Centrifugal Pumps` beats the source's
  `Industrial Raw Materials → Chemicals → Acids → Industrial Acid` anti-pattern (tautological leaf).
  Every leaf name adds information its parent didn't have.
- **No scope qualifiers in names** ("(Process use only)") — scope is expressed by *position* in the
  tree, or it's an attribute. Names travel well into breadcrumbs, chips, and search results.
- **Umbrella-as-sibling removed**: "Industrial Dryers" is now the L3 the six dryer types live under,
  not their seventh sibling.
- **Breadcrumbs** (`ux_patterns.md` §3.3) read as sentences: *Plant Utility Systems › Steam & Boiler
  Systems › Boilers & Steam Generation › Industrial Steam Boilers*.
- Known dependency: the public tree endpoint is gated on `[ESC-7-API-CATNAV]` (no Public
  `list_categories` projection yet) — sequencing handled in the migration plan P3.

**Example, recommended browse path:**

```
Raw Materials & Chemicals → Industrial Chemicals → Basic Chemicals, Acids & Alkalis → Industrial Acids
```
with *Sulphuric Acid* as a synonym+attribute of `industrial-acids` — not a fifth level (frozen cap)
and not a duplicate node.

---

## 5. Buyer Journey

Scenario from the original brief: *"Need Pump → Mechanical → Pumps → Centrifugal → Chemical Pump →
SS316."* Under Taxonomy Content v1.0:

```
Production & Process Machinery          (L1 — root)
  → Liquid & Fluid Processing           (L2)
    → Industrial Pumps                  (L3 — the category; default RFQ target)
      → Centrifugal Pumps               (L4 — the product family)
        duty = chemical                 (ATTRIBUTE, filter/facet)
        material = SS316                (ATTRIBUTE, filter/facet)
```

The taxonomy supports the journey to exactly the right depth and hands over to attributes at the
ladder boundary. Parallel journeys verified against the tree (these five are also the m-03 usability
walkthrough tasks): centrifugal pump (above) · **pump installation service** → Industrial Services →
Installation & Commissioning · **SS316 butterfly valve** → MRO → Valves, Piping & Fittings →
Industrial Valves → Butterfly Valves + material attribute · **conveyor manufacturer** → Material
Handling → Conveying Systems (one home) · **fire protection contractor** → Industrial Services → EPC →
Fire Protection EPC (or Fire, Safety & Security for the equipment itself).

Buyers who don't browse, search — and land on the same nodes via synonyms (§9): "genset" →
`diesel-generators`, "GI pipe" → `ms-gi-pipes`.

---

## 6. Vendor Journey

Vendors self-classify under hard caps (≤10 assignments, ≤5 primary — `Doc-4D §D7.1`), which makes
duplicate nodes actively expensive: in the source, a conveyor manufacturer honest about visibility
needed nodes in two L1s, burning 2 of 10 slots on one product line. Under v1.0:

- **One home per family** → one slot per product line; the ≤10 budget maps to real breadth.
- **Assignment level guidance**: assign at L3 (the category) by default; add L4 only for genuine
  specialization (`is_specialized` flag exists on assignments). A pump maker with a wide range takes
  `industrial-pumps`; a pure AODD specialist takes `diaphragm-pumps`.
- **Services vendors** classify once under Industrial Services (e.g. `fire-protection-epc`,
  `amc-contracts`) instead of hunting 8 scattered EPC nodes; their `can_service` capability flag —
  which is authoritative and orthogonal (Invariant #1) — carries the work-nature signal.
- **Onboarding crosswalk** (suggestion-only, per `VENDOR-PROFILE-MODEL.md`): Business Type hints at
  roots (Fabricator → Machine Tools/Fabrication; EPC-Contractor → Industrial Services). Suggestions
  only; the vendor decides; capability flags never derive from category.
- **Remaining confusion points and their answers** (to be encoded in onboarding UI copy):
  - *"I make storage tanks — process or bulk?"* → Process Tanks & Vessels (engineered process duty)
    vs Bulk Storage (silos/farm tanks). Explorer descriptions must state this in one line.
  - *"I sell pumps AND pump spares"* → two nodes (`industrial-pumps`, `pump-compressor-spares`) —
    correct and intended; they are different businesses.
  - *"I do supply and installation"* → one product node + relevant service node; the RFQ's
    `work_nature[]` combines them at transaction time.

---

## 7. RFQ Mapping

How the taxonomy serves the moat (M3), by pointer to the frozen flow (`Doc-3 §3.1`,
`RFQ-MATCHING-BUSINESS-MODEL.md`):

- **RFQ creation** — the buyer picks **one category node** (`rfqs.category_id`); the node's attribute
  vocabulary (`CATEGORY_ATTRIBUTE_FRAMEWORK.md`) supplies structured spec fields. Node grain = L3
  default, L4 when the buyer knows the family. Clean nodes make this pick unambiguous — the entire
  point of F-2/F-6 fixes.
- **Vendor matching** — gate **A2**: active category assignment on the RFQ's node. One-home nodes
  concentrate vendor liquidity so A2 yields non-empty, honest candidate pools. Work nature (gates
  A3/A4 via the capability matrix) is orthogonal — the tree deliberately does *not* encode
  supply-vs-service in product nodes.
- **RFQ authoring mapping (buyer intent → system axes):**

```
Buyer thinks:            "Need a pump + installation + commissioning"
System captures:
  category_id      →  industrial-pumps / centrifugal-pumps     (taxonomy — gate A2)
  work_nature[]    →  {supply, service}                        (frozen axis — gates A3/A4,
                                                                via Procurement Mode crosswalk)
  attributes       →  flow, head, material, duty               (attribute framework — spec fields)
  industry         →  (future, deferred)                        (ADR-023 Industry axis — optional
                                                                Phase-C ranking signal, never a gate)
```

- **Search** — same nodes power catalog facets (search follows ownership; disposable projection,
  `Doc-6D` MK-CR9).
- **Notifications** — invitations/leads key off category assignment; stable node IDs mean vendor
  notification preferences survive taxonomy releases (merge/retire handled by the governance recipes).
- **Analytics** — demand by node, RFQ-per-category, match-pool depth per node (KPIs in
  `CATEGORY_GOVERNANCE_MODEL.md` §10) become meaningful only when each concept has exactly one node.
- **Firewalls unchanged**: money never buys rank; no taxonomy placement is sellable; gate-excluded
  vendors stay invisible (`Doc-4E` H.10). Taxonomy work must never become a paid-placement surface.

---

## 8. Search, SEO & AI

### 8a. SEO recommendations
- **Slugs**: kebab-case, English, stable-after-publish (governance policy — the frozen mechanism
  allows mutation; we don't use it; see `CATEGORY_GOVERNANCE_MODEL.md` §7). Slug = the concept, no
  filler: `/categories/centrifugal-pumps`, `/categories/etp-plants`.
- **One canonical page per concept** — the direct SEO payoff of de-duplication; the source's three
  dust-collector homes would have competed against each other in search results.
- **Category landing pages** — **NET-NEW** (no landing-page contract exists in Doc-4D; categories are
  reference data). Routed as a Doc-5D-adjacent public-projection concern with `[ESC-7-API-CATNAV]`
  (migration plan §Escalations). Recommended shape when ratified: leaf pages carry intro copy,
  attribute-driven filters, vendor count (contract-provided only), and FAQ blocks; high-volume
  attribute-value pages ("SS316 butterfly valves") generate *under* the leaf, never as nodes.
- **Aliases/redirects**: every retired source concept keeps a resolvable path via the alias map
  (`ESC-CLASS-ALIAS`) so external links and SEO equity survive migration.

### 8b. Four-System Separation (binding mental model)

| System | Job | Owns | Never |
|---|---|---|---|
| **Taxonomy** | Defines the official structure — what exists and where | Node names, slugs, hierarchy (M2 entity, Admin-governed) | Never bends to catch search terms |
| **Search** | Finds anything from any words | FTS/Meilisearch projection — disposable read-model (`Doc-6D` MK-CR9) | Never becomes source of truth; never re-ranks M3 results |
| **Aliases/Synonyms** | Expand queries & redirect old paths to canonical nodes | Synonym dictionary (§9), alias map (NET-NEW mechanism) | Never appear as navigation; never fork the tree |
| **AI** | Suggests — categories, attributes, results | M9 (reserved) — regenerable artifacts only | Never decides; never writes taxonomy; suggestions require user confirmation (Invariant #12) |

Four independent systems. Most taxonomy failures come from letting one do another's job (nodes created
to catch search terms; search results hard-wired to hierarchy; AI auto-classifying vendors). Keep them
apart.

### 8c. AI semantic search readiness (future-facing, M9-gated)

```
User writes:   "Need food grade SS pump for juice line, 20 m3/h"
AI extracts:   category  → centrifugal-pumps        (suggestion)
               material  → SS316                     (attribute suggestion)
               duty      → food/hygienic             (attribute suggestion)
               flow      → 20 m³/h                   (attribute suggestion)
               industry  → Food & Beverage           (Industry axis, when ratified)
Buyer confirms → structured RFQ (category_id + attributes + work_nature)
```

The clean tree is what makes extraction reliable: one unambiguous target node per concept, a typed
attribute vocabulary to slot values into, and synonyms as the bridge from colloquial language
("SS", "food grade") to canonical fields. **AI suggests; the buyer confirms; modules decide** — no
auto-filed RFQs, no auto-classification of vendors.

---

## 9. Industrial Synonym Dictionary — Starter Set (v0.1)

**Scope declared honestly:** a starter set of **~110 clusters** covering the highest-volume Bangladesh
industrial search language, not exhaustive coverage of 794 nodes. Growth is governed
(`CATEGORY_GOVERNANCE_MODEL.md` §6: propose → validate true-synonym → version bump). The storage/
serving mechanism is NET-NEW (`ESC-CLASS-ALIAS`); until ratified this is governed content consumable
by the search projection. Format: **canonical node ← synonyms** (synonyms are search expansions,
never nodes).

**Metals, stock & pipes**
- `ms-gi-pipes` ← GI pipe · galvanized pipe · galvanized iron pipe · MS pipe · mild steel pipe · black pipe · ERW pipe
- `ss-pipes` ← SS pipe · stainless pipe · stainless steel pipe · seamless pipe (SS) · 304 pipe · 316 pipe
- `plastic-pipes` ← HDPE pipe · PVC pipe · uPVC · CPVC · PPR pipe · poly pipe
- `pipe-fittings-flanges` ← elbow · tee · reducer · union · nipple · flange · SORF/WNRF
- `ms-sections` ← MS rod · MS bar · angle bar · channel · flat bar · TMT bar* · rebar* · deformed bar* (*rebar = v1.1 node candidate, §12)
- `steel-coils-sheets` ← HR coil · CR coil · GI sheet · GP sheet · CI sheet · plate
- `stainless-steel-stock` ← SS rod · SS plate · SS sheet · 304/316 rod
- `aluminium-metal` ← aluminum · ingot · billet
- `brass-bronze` ← gunmetal · phosphor bronze

**Rotating equipment & drives**
- `centrifugal-pumps` ← water pump · end suction pump · multistage pump · monoblock pump
- `submersible-pumps` ← submersible · borewell pump · sewage pump · sump pump
- `diaphragm-pumps` ← AODD pump · air operated pump
- `dosing-metering-pumps` ← dosing pump · metering pump · chemical pump
- `electric-motors` ← induction motor · three phase motor · gear motor · dynamo (colloquial) · geared motor
- `variable-frequency-drives` ← VFD · VSD · AC drive · inverter drive · frequency inverter
- `gearboxes-reducers` ← gear box · speed reducer · worm gear · helical gearbox · planetary gearbox
- `air-compressors` (children) ← compressor · screw compressor · air pump (colloquial)
- `vacuum-pumps` ← liquid ring pump · rotary vane pump

**Bearings & transmission**
- `ball-bearings` ← deep groove bearing · 6203/6204/6205 (designation pattern) · SKF-type bearing
- `roller-bearings` ← taper roller · spherical roller · cylindrical roller · needle bearing
- `thrust-bearings` ← thrust ball bearing
- `pillow-blocks-housings` ← pillow block · plummer block · UCP/UCF (designation pattern)
- `belts-pulleys` ← V-belt · timing belt · taper lock pulley · fan belt
- `chains-sprockets` ← roller chain · conveyor chain · chain wheel
- `couplings` ← love-joy coupling · tyre coupling · gear coupling
- `mechanical-seals` ← cartridge seal · pump seal
- `oil-seals-o-rings` ← oil seal · O-ring · rotary shaft seal
- `gaskets-packings` ← gland packing · CAF gasket · spiral wound gasket

**Valves**
- `gate-globe-check-valves` ← gate valve · globe valve · check valve · NRV · non-return valve · sluice valve
- `ball-valves` ← ball valve · 2-piece/3-piece ball valve
- `butterfly-valves` ← butterfly valve · wafer valve
- `control-valves` ← control valve · actuated valve · pneumatic control valve
- `safety-relief-valves` ← safety valve · PRV · pressure relief valve
- `pneumatic-valves-frl` ← solenoid valve · FRL · air regulator

**Utilities & environment**
- `diesel-generators` ← genset · DG set · generator · standby generator
- `industrial-steam-boilers` ← boiler · steam generator · fire tube boiler · water tube boiler
- `thermic-fluid-heaters` ← thermal oil heater · hot oil boiler
- `etp-plants` ← ETP · effluent plant · effluent treatment
- `stp-plants` ← STP · sewage plant
- `ro-plants` ← RO plant · reverse osmosis · water purifier (industrial)
- `dm-plants` ← DM plant · demin water · deionizer
- `water-softening-plants` ← softener · water softener
- `zld-systems` ← ZLD · zero liquid discharge
- `chillers-ahus` ← chiller · AHU · air handling unit · central AC (industrial) · process chiller
- `dehumidifiers` ← dehumidifier · dryer room unit
- `baghouse-dust-collectors` ← bag filter · baghouse · dust collector
- `industrial-scrubbers` ← scrubber · fume scrubber
- `air-dryers` ← refrigerated dryer · desiccant dryer · compressed air dryer
- `nitrogen-generators` ← N2 generator · PSA nitrogen
- `transformers` ← distribution transformer · power transformer · 11kV transformer
- `switchgear-panels` ← LT panel · HT panel · distribution board · DB board
- `apfc-panels` ← PFI plant · power factor panel · capacitor bank (BD: "PFI" is the common term)
- `ups-systems` ← UPS · online UPS · uninterruptible power supply
- `battery-energy-storage` ← BESS · battery storage
- `busbar-trunking` ← bus duct · busway
- `earthing-systems` ← grounding · earth pit · chemical earthing

**Process & packaging machinery**
- `industrial-storage-tanks` ← SS tank · water tank (industrial) · mixing tank · FRP tank
- `process-reactors` ← reactor · glass-lined reactor · GLR · jacketed reactor
- `heat-exchangers` (children) ← HX · PHE · shell and tube · plate heat exchanger
- `fluid-bed-dryers` ← FBD · fluidized bed dryer
- `spray-dryers` ← spray dryer
- `cip-systems` ← CIP · clean in place
- `filter-presses` ← filter press · membrane press
- `vffs-machines` ← VFFS · pouch packing machine · vertical packing machine
- `hffs-machines` ← HFFS · flow wrap · horizontal wrapper
- `stick-sachet-machines` ← sachet machine · stick pack
- `checkweighers` ← check weigher · weight checker
- `metal-detectors` ← metal detector (inline) · needle detector (garments)
- `inkjet-coders` ← batch coding machine · date coder · CIJ printer
- `labeling-machines` ← labeller · sticker machine
- `palletizers` ← palletizer · robotic palletizer
- `stretch-shrink-wrappers` ← stretch wrapper · pallet wrapper · shrink tunnel

**Machine tools & welding**
- `lathes-turning-centers` ← lathe · CNC lathe · turning center
- `vertical-machining-centers` ← VMC · machining center
- `press-brakes` ← press brake · bending machine · CNC bender
- `shearing-machines` ← shearing machine · guillotine
- `laser-cutting-machines` ← laser cutter · fiber laser · CO2 laser
- `arc-welding-machines` ← welding machine · stick welder · MMA · rod welding
- `mig-mag-welders` ← MIG · CO2 welding (colloquial BD) · wire welding
- `tig-welders` ← TIG · argon welding (colloquial BD)
- `welding-consumables` ← electrode · welding rod · MIG wire · filler wire · flux
- `abrasives` ← grinding wheel · cutting disc · flap disc · emery

**Textile & garments**
- `spinning-spares` ← spindle · ring traveller · bobbin · apron · **Tula** (local: spinning cloth)
- `weaving-knitting-spares` ← reed · heald wire · needle · sinker
- `dyeing-machines` ← jet dyeing · jigger · winch · soft flow
- `greige-fabric` ← grey fabric · gray fabric · loom-state fabric
- `cotton-yarn` ← carded yarn · combed yarn · 30s/40s count (pattern)
- `garment-trims` (children) ← trims · accessories · zipper · button · eyelet

**Instrumentation, IT & safety**
- `plc-systems` ← PLC · programmable logic controller
- `scada-hmi` ← SCADA · HMI · touch panel
- `flow-instruments` ← flow meter · magnetic flow meter · rotameter
- `pressure-instruments` ← pressure gauge · transmitter · manometer
- `level-instruments` ← level sensor · radar level · float switch
- `temperature-instruments` ← RTD · thermocouple · temperature controller · PT100
- `cctv-surveillance` ← CCTV · IP camera · NVR/DVR
- `access-control-attendance` ← access control · time attendance · biometric
- `fire-extinguishers` ← ABC extinguisher · CO2 extinguisher · fire ball
- `fire-alarm-panels` ← fire panel · addressable panel
- `sprinkler-systems` ← sprinkler · fire sprinkler
- `head-eye-face-protection` ← helmet · hard hat · goggles · face shield
- `hand-protection` ← gloves · cut-resistant gloves
- `foot-protection` ← safety shoes · gum boot · steel toe
- `respiratory-protection` ← mask · respirator · SCBA
- `lockout-tagout` ← LOTO · lockout kit

**Consumables & MRO**
- `lubricants-oils` ← grease · gear oil · hydraulic oil · engine oil (industrial)
- `cutting-fluids-coolants` ← coolant · cutting oil · rust preventive
- `hand-tools` ← spanner · wrench · pliers · hammer · tool set
- `power-tools` ← drill machine · grinder machine · angle grinder · cordless drill
- `hydraulic-hoses-fittings` ← hydraulic hose · hose pipe · quick coupling
- `cable-glands-lugs` ← gland · lug · thimble · ferrule
- `power-control-cables` ← armoured cable · flexible cable · BYA/NYY (pattern)
- `circuit-breakers-fuses` ← MCB · MCCB · ACB · breaker · fuse
- `contactors-relays` ← contactor · magnetic contactor · relay · overload relay

**Services**
- `etp-plants` + `water-treatment-epc` ← "ETP company" (intent-dependent: equipment vs contractor — search layer disambiguates by query shape)
- `amc-contracts` ← AMC · annual maintenance · service contract
- `equipment-installation` ← erection · installation & commissioning · I&C
- `energy-audits` ← energy audit · power audit
- `manpower-recruitment` ← manpower supply · labor contractor

---

## 10. Duplicate Detection — summary of dispositions

Full row-by-row table (751 rows, exact + near + plural/singular + wrong-parent): migration plan
**Appendix B**. Headline clusters and their rulings:

| Cluster | Source occurrences | Disposition |
|---|---|---|
| MRO L1 block | ×4 (blocks 10–13, one flat-format) | Reunified under `mro-consumables`; flat block 13 rows all MERGE into block-10 homes |
| Conveyors | Bulk Processing + Material Handling | One home: `material-handling > conveyors` (9 child families) |
| Silos / bins / storage tanks | ×3 | `bulk-storage` (silos, hoppers-bins, bulk-storage-tanks); process vessels stay `process-tanks-vessels` |
| Dust collectors / scrubbers / vacuum | ×3 | `air-pollution-control` |
| PLC / SCADA / HMI / DCS / RTU | ×4+ | `control-systems` |
| Energy monitoring / EMS / OEE / predictive | ×3 | `monitoring-systems` |
| Heat exchangers | ×2 | `heat-exchangers` (duty = attribute) |
| Pressure vessels | ×2 verbatim | `pressure-vessels` |
| Storage tanks by material (SS/FRP/MS) | attribute-split ×3 | `industrial-storage-tanks` + material attribute |
| Reactors by material | attribute-split ×4 | `process-reactors` + material attribute |
| Fire extinguishers / emergency lighting | ×2 each | `fire-extinguishers` / `emergency-lighting` |
| Calipers & micrometers | Quality + MRO tools | `calipers-micrometers-gauges` |
| Checkweighers / vision | Packaging + Quality | `packaging-inspection` children |
| Greige fabric | ×3 | `greige-fabric` |
| Cotton/polyester/blended yarn | ×2 each | `yarns` children |
| Bearings / belts / chains / seals / switchgear spares | block 10 vs 13 | block-10 homes win; block 13 fully absorbed |
| Wear plates | MRO + crusher spares | `wear-plates-liners` |
| Installation & Commissioning | ×5 verbatim | `equipment-installation` (SERVICE) |
| AMC | ×6 verbatim | `amc-contracts` (SERVICE) |
| Energy audits | ×5 | `energy-audits` (SERVICE) |
| Safety/fire/EHS audits | ×3 | `safety-compliance-audits` (SERVICE) |
| Training | ×3 | `safety-compliance-training` / `technical-training` (SERVICE) |
| ISO/GMP certification & audits | ×2 | `iso-gmp-certification` (SERVICE) |
| PMC | ×2 | `project-management-pmc` (SERVICE) |
| ZLD | Evaporation + Water | `zld-systems` |
| OEM / Critical / Emergency spares | sourcing/urgency-as-category | ATTRIBUTE on `machine-spares` |
| "Other Pumps" | catch-all | RETIRE → residual demand to `industrial-pumps` |

---

## 11. Category Health Report — source L1 grades

| Source L1 | Grade | Why |
|---|---|---|
| Industrial Raw Materials & Inputs | **Good** | Coherent domains, sane depth; marred by the textile branch (Greige ×3, yarns ×2) and orphaned trims placement |
| Production & Process Machinery | **Needs Improvement** | Best-detailed branch, but overloaded: machine tools mis-scoped inside it, services interleaved, tanks/reactors attribute-split, conveyors/dust-control overlapping other L1s |
| Industrial Utilities & Plant Systems | **Needs Improvement** | Strong domain L2s, but every L2 drags an EPC/services subtree (F-3), and PLC/SCADA/energy-monitoring duplicate the automation world (F-2) |
| Construction, Civil & Industrial Infrastructure | **Needs Improvement** | Mixes civil *works* (services) with building *products*; thin coverage; grouped machinery leaf |
| Material Handling, Storage & Logistics | **Good** | Clean shape; loses points for grouped leaves ("Belt, Roller & Screw Conveyors") and overlap with bulk-processing storage/conveying |
| Quality, Lab & Testing | **Good** | Clean and appropriately scoped; duplicates calipers/vision/checkweighers found elsewhere; services mixed in at the edges |
| Safety, Security & Environmental | **Needs Improvement** | Wholesale duplication of the fire branch; dust collectors' third home; PPE compressed into a single grouped leaf |
| IT, OT & Industrial Software | **Good** | Tidy; PLC/RTU/SCADA hardware duplicates the automation branch; data-center row mixes product and service |
| Business, Engineering & Professional Services | **Good** | Right idea (a services home!) — but only ~10 of the ~69 service rows live here; the rest hide in product branches |
| MRO, Spares & Industrial Consumables | **Poor** | Quadruplicated L1, duplicate L2, one block in a different format, one block missing a hierarchy level, sourcing/urgency-as-category, wholesale family duplication with block 13 (F-1) |

---

## 12. Future Expansion

- **Bangladesh → South Asia → global.** Roots and L2s are country-neutral; BD-specific *language*
  lives in the synonym layer (PFI plant, Tula, CO2 welding), which regionalizes cleanly — add a
  synonym set per market, not nodes per market. Multi-country readiness = same tree + per-market
  dictionaries + (already frozen) per-field currency discipline.
- **100k products / 1M+ SKUs.** SKUs live on listings *below* the tree; families absorb volume through
  attributes (`CATEGORY_ATTRIBUTE_FRAMEWORK.md`), so node count grows sub-linearly with catalog size.
  The two patterns that would have broken this — attribute-as-category and grouped leaves — are
  eliminated and banned by the admission ladder.
- **Enterprise procurement.** Stable UUIDs + immutable-after-publish slugs + versioned content
  releases give ERP integrations and punch-out catalogs a dependable key space; the governance model's
  changelog discipline (§8) is what enterprise buyers audit.
- **Known v1.1 node candidates** (parking list — governance-gated, not in v1.0): TMT rebar under
  `metal-stock` (high BD demand; currently a synonym on `ms-sections`) · lab consumables ·
  weighing systems (scales/weighbridges) · industrial refrigeration (cold storage) · marine/shipyard
  equipment (if the segment onboards).
- **Risks**: (1) taxonomy team churn → mitigated by the governance model + decision record;
  (2) synonym layer left unbuilt → search quality caps out, pressure returns to create junk nodes —
  `ESC-CLASS-ALIAS` should be prioritized; (3) L1 #13 (Services) attracting scope creep ("add a node
  per service niche") → the EPC/domain-leaf pattern is the pressure valve, governed like all nodes.

---

## 13. Taxonomy Acceptance Criteria (Board gate — M-01)

Machine-checkable (script results recorded in the migration plan §Verification):

- [x] Every source node mapped exactly once (751/751 leaf rows in Appendix B; intermediate nodes by
      derivation rule stated in Appendix B preamble)
- [x] Zero orphan nodes; every node has exactly one parent; child level = parent level + 1
- [x] Zero duplicate slugs (794 unique)
- [x] Maximum depth 4 (frozen cap respected; no simulated L5)
- [x] No product/service mixing (no SERVICE-disposition target sits outside `industrial-services`)
- [x] No attribute-as-category nodes (ladder applied; violations dispositioned ATTRIBUTE)
- [x] All L4 nodes pass the admission test (family, not material/application/brand/sourcing)
- [x] All starter aliases point at existing nodes

Human validation (pre-freeze activities — **pending; not self-certified by this document**):

- [ ] Navigation walkthrough (m-03 task set): find a centrifugal pump · pump installation service ·
      SS316 butterfly valve · conveyor manufacturer · fire protection contractor
- [ ] Buyer journey validation with 3–5 real procurement users
- [ ] Vendor onboarding validation with 3–5 real vendors (self-classification without help)
- [ ] RFQ mapping validation: sample RFQs target an unambiguous node at L3/L4

**Gate:** BLOCKER = MAJOR = MINOR = 0 on this review's open findings **and** all checklist items
green before Taxonomy Content v1.0 is approved for seeding (migration plan Phase P1).

---

## 14. Final Recommendation

**Replace, don't repair.** The source tree's concepts are ~85% right; its *structure* fails on
integrity (F-1), uniqueness (F-2), product/service separation (F-3), and the attribute boundary
(F-4). Adopt **Taxonomy Content v1.0** (794 nodes, 13 roots) with the full old→new mapping in the
migration plan; run the phased rollout there (approve → seed → activate surfaces → alias layer);
govern all future change through `CATEGORY_GOVERNANCE_MODEL.md`. Since no production categories exist
yet (only presentation mocks), this is the cheapest this migration will ever be — the entire "legacy"
is one spreadsheet.

---

## Appendix — Category Design Principles (one-page quick reference)

```
1.  One concept → one node.
2.  One home per product family — cross-industry products live once.
3.  Services are separate — never nested under a product; RFQ work_nature combines them.
4.  Industry is a separate axis — never fork the tree by "who uses it".
5.  Material is an attribute. Always.
6.  Application is an attribute — unless it is a market-recognized browse family (rare; governance-gated).
7.  Size, rating, grade, certification — attributes.
8.  Brand never creates a category.
9.  Sourcing (OEM/compatible) and urgency (critical/breakdown) never create categories.
10. Categories describe WHAT IT IS, not who uses it, who sells it, or how urgently it's needed.
11. Four levels maximum — below L4 lives in attributes, specs, and synonyms (frozen cap; also good IA).
12. Names carry no scope qualifiers — position and attributes express scope.
13. No catch-all nodes ("Other X") — a miss means a synonym gap or a governance request.
14. New nodes pass the admission ladder and governance approval; growth defaults to attributes/aliases.
15. Taxonomy ≠ Search ≠ Aliases ≠ AI — four systems, kept independent.
```
