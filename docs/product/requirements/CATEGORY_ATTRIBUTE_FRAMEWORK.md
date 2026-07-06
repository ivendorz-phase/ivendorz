# Category Attribute Framework — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Date:** 2026-07-02 · **Home:** `productSpec/` · **Companions:** `CATEGORY_TAXONOMY_REVIEW.md` ·
`CATEGORY_GOVERNANCE_MODEL.md` · terminology per `MASTER-CLASSIFICATION-DICTIONARY.md`.
**Mechanism status:** the attribute mechanism itself is **NET-NEW** (no attribute schema exists in the
frozen corpus) — routed as `ESC-CLASS-ATTR` (see `CATEGORY_MIGRATION_PLAN.md` §Escalations). The
nearest EXISTS anchor is `marketplace.spec_library_entries` (optional `category_id`), which this
framework is designed to feed rather than replace. **This document defines modeling rules and
per-category vocabularies, not a data model.**

**Purpose.** How products are *described* without creating category sprawl. Attributes are the second
axis of the classification system: the taxonomy says **what it is**; attributes say **which one**.
Forms, filters, RFQ spec fields, and AI extraction all reuse the same per-category vocabulary defined
under these rules.

---

## 1. Attribute vs node — the decision test

A concept becomes a **category node** only if *all* hold (the node-admission ladder,
`CATEGORY_TAXONOMY_REVIEW.md`):

1. It is a **product family** — buyers browse it as a family and vendors specialize in it as a family.
2. It is **not** a material, grade, size, rating, brand, application context, sourcing arrangement
   (OEM/compatible), or urgency (critical/breakdown).
3. It will remain meaningful for years (stability) and can plausibly hold multiple vendors/products.

Everything that fails the test is an **attribute** (or a synonym). The canonical illustration:

```
Valve                      → category (L3 family)
  Butterfly Valve          → product family (earns an L4 node — buyers browse it)
    Pressure rating PN16   → attribute
    Material SS316         → attribute
    Connection: flanged    → attribute
    Temperature class      → attribute
```

**Never:** `Valve → SS Valve → Flanged Valve → High Pressure Valve` — attribute values masquerading as
a hierarchy. That shape multiplies nodes combinatorially (materials × connections × ratings), makes
vendor self-classification ambiguous (a vendor selling flanged SS valves fits three nodes), and
starves each node of liquidity.

---

## 2. Modeling rules

1. **One vocabulary per category family, inherited downward.** Attributes attach at the highest node
   where they are meaningful (e.g., `material` on Industrial Valves L3) and apply to all children.
2. **Typed values** — enum (connection type), numeric + unit (pressure, kW, m³/h), boolean
   (food-grade), free text last resort. Units follow the field-level convention (multi-currency/unit
   discipline mirrors the platform's per-field currency rule).
3. **Required vs optional per category.** *Required* = without it an RFQ or listing is not actionable
   for that family. Keep required sets small (≤5) — required attributes are onboarding friction.
4. **Facet flag.** An attribute marked *facet* becomes a search/browse filter. Facets must be
   contract-provided, never client-computed (`ux_patterns.md` §2.2 — leak safety).
5. **Attributes never affect matching gates.** Gate A2 is category; gate A3 is the capability matrix
   (Invariant #1). Attributes may inform future *ranking policies* only through M3's own governed
   policy layer (`RFQ-MATCHING-BUSINESS-MODEL.md`) — never as a new gate coined here.
6. **Attributes are not governance signals.** No attribute may store or proxy Trust/Performance/Tier
   (Golden Rule 3 — signals are firewalled).
7. **Brand is an attribute-like field on listings, never a category and never part of taxonomy
   content.** (Prompt rule: separate taxonomy from brands.)
8. **Vocabulary changes follow governance** — additive minor releases per
   `CATEGORY_GOVERNANCE_MODEL.md` §8; removing/retyping a used attribute is a structural change.

---

## 3. Starter vocabularies — top category families

Product-level shape only; value lists are illustrative starting points, refined with vendors during
seeding. `(R)` = proposed required · `(F)` = facet.

### 3.1 Industrial Pumps (`industrial-pumps`)
| Attribute | Type | Notes |
|---|---|---|
| Pump type (R)(F) | enum | inherited from L4 node; centrifugal/PD/etc. |
| Flow rate (R) | numeric m³/h | |
| Head (R) | numeric m | |
| Material of construction (F) | enum | CI, SS304, SS316, PP, PVDF… |
| Duty / media (F) | enum | water, chemical, slurry, food, hygienic |
| Motor rating | numeric kW | |
| Seal type | enum | gland, mechanical, magnetic-drive |
| Certification | enum multi | ATEX, food-grade, IEC |

### 3.2 Industrial Valves (`industrial-valves`)
Size/DN (R)(F) · Pressure rating PN/class (R)(F) · Material (R)(F): CI/CS/SS304/SS316/bronze/PVC ·
End connection (F): flanged/threaded/wafer/welded · Operation (F): manual/gear/pneumatic/electric
actuated · Media/temperature class · Standard (API/BS/DIN).

### 3.3 Electric Motors (`electric-motors`)
Power kW (R)(F) · Phase (R)(F): single/three · Speed RPM / poles (F) · Frame size · Mounting: foot/
flange · Efficiency class: IE1–IE4 (F) · Voltage · Duty type · Protection: IP55/IP65 (F).

### 3.4 Bearings (`bearings` + children)
Bore/OD/width (R) · Designation number (R)(F — the primary search key: 6205-2RS…) · Cage material ·
Seal type: open/ZZ/2RS (F) · Precision class · Load direction (encoded partly by L4 node).

### 3.5 Industrial Storage Tanks (`industrial-storage-tanks`)
Capacity litres (R)(F) · Material (R)(F): SS304/SS316/MS/FRP/HDPE · Orientation: vertical/horizontal ·
Jacketed y/n · Hygienic/aseptic y/n · Design code.

### 3.6 Steam Boilers (`industrial-steam-boilers`)
Capacity TPH (R)(F) · Working pressure (R)(F) · Fuel (R)(F): gas/diesel/coal/biomass/dual ·
Type: fire-tube/water-tube · Efficiency % · Statutory certification.

### 3.7 Air Compressors (`air-compressors` children)
FAD cfm/m³min (R)(F) · Pressure bar (R)(F) · Power kW · Oil-free y/n (F — also an L4 node; the node
wins for browse, the attribute serves filtering within other types) · Cooling: air/water · VFD y/n.

### 3.8 Diesel/Gas Generators (`diesel-generators`, `gas-generators`)
Rating kVA (R)(F) · Voltage/phase · Canopy: open/silent (F) · Fuel · Engine brand (brand = listing
field) · ATS included y/n.

### 3.9 Cables (`power-control-cables`)
Type (R)(F): power/control/instrumentation · Conductor: Cu/Al (R)(F) · Size sqmm (R)(F) · Cores ·
Insulation: PVC/XLPE (F) · Voltage grade · Armoured y/n (F) · Standard.

### 3.10 PPE (`ppe` children)
Standard/certification (R)(F): EN/ANSI/BDS · Size range · Material · Application rating (cut level,
dielectric class, filter class per child family).

### 3.11 Fabrics (`fabrics` children)
GSM (R)(F) · Composition (R)(F) · Width · Construction · Finish state (greige/finished — ties to the
family nodes) · MOQ.

### 3.12 Industrial Chemicals (`industrial-chemicals` children)
Concentration/purity % (R)(F) · Grade (R)(F): technical/food/pharma · Packaging: drum/IBC/bag ·
CAS number (F — search key) · Hazard class (R for logistics).

### 3.13 Pipes & Tubes (`industrial-pipes-tubes` children)
NB size (R)(F) · Schedule/thickness (R)(F) · Material & standard (R)(F) · End type · Coating
(GI = the family node; zinc coating weight = attribute).

### 3.14 Heat Exchangers (`heat-exchangers` children)
Heat duty kW (R) · Design pressure/temperature (R) · Material (F) · Surface area · TEMA/plate type ·
Gasket material.

### 3.15 Machine-Specific Spares (`machine-spares` children)
Machine make & model (R)(F) · Part/OEM number (F — primary search key) · Fitment (OEM/compatible —
the *sourcing attribute* that replaced the retired "OEM/Authorized/Critical" source categories) ·
Criticality (buyer-side tag, not a category).

---

## 4. Who consumes the vocabulary

| Consumer | Use |
|---|---|
| **Vendor product forms** | Category-driven form fields (required set = validation) |
| **Buyer filters/facets** | Facet-flagged attributes only; contract-provided values (`ux_patterns.md` §2.2) |
| **RFQ authoring** | Category selection pulls the family's required attributes as structured spec fields; frees the buyer from prose specs (`RFQ-CREATION-BUSINESS-MODEL.md` crosswalk) |
| **Spec library** | Vocabularies seed `spec_library_entries` templates per category (EXISTS anchor) |
| **AI extraction (future, M9)** | "food grade SS pump 20 m³/h" → suggested category `centrifugal-pumps` + attributes {duty: food, material: SS316, flow: 20} — **suggestions the buyer confirms; modules decide** (Invariant #12) |
| **SEO landing pages (future)** | High-volume attribute-value pages (e.g. "SS316 butterfly valves") generated *under* the category page, never as taxonomy nodes |

---

## 5. Boundaries (what this framework is not)

- **Not a data model.** Tables/columns/contracts for attributes are a future additive design owned by
  M2 through the governance track (`ESC-CLASS-ATTR`). This document only fixes the product rules any
  such design must satisfy.
- **Not matching input.** No gate, no score. Any future ranking use runs through M3 policy governance.
- **Not a synonym store.** Synonyms/aliases are search-layer content (`CATEGORY_GOVERNANCE_MODEL.md` §6).
- **Not industry.** "Used in pharma" is the Industry axis (`INDUSTRY-TAXONOMY-MODEL.md`), except where
  a *product-intrinsic* property applies (food-grade contact material is an attribute; "sold to food
  factories" is industry).
