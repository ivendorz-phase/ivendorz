# Industry Taxonomy Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Terms:** `MASTER-CLASSIFICATION-DICTIONARY.md`. **Data model authority:** the Track-1 proposal
`governanceReviews/Doc-2_IndustryTaxonomy_Additive_Patch_PROPOSAL.md` (this doc is the product view only).

---

## 1. Status: NET-NEW

Industry is **not modeled** in the frozen corpus (`esc_registry.md` → now `ESC-CLASS-INDUSTRY`). This doc
proposes the **product-level shape**; the data model, ownership, and contracts are decided by the Board via
the Track-1 patch. Nothing here is coined.

## 2. Structure — 4 levels (mirrors the frozen category tree, `level CHECK 1–4`)

```text
Industry → Sector → Sub-Sector → Application
```

Worked example:

```text
Power
 └─ Generation
     └─ Gas Turbine
         └─ Combined Cycle
```

More examples:

```text
Food & Beverage → Beverage → Carbonated → Bottling Line
Commercial Buildings → Hospitality → Hotel → Central HVAC
Pharmaceutical → Formulation → Sterile → Cleanroom Utilities
```

## 3. Level-1 industries (illustrative — admin-governed, not frozen)

Pharmaceutical · Textile & Garments · Food & Beverage · Cement · Steel & Re-Rolling · Power & Energy ·
Oil & Gas · LPG/LNG · Chemical · Ceramic · Paper & Pulp · Agriculture · FMCG · Shipbuilding & Marine ·
Automobile · Electronics · Telecommunication · Hospital & Healthcare · Hotels & Hospitality · Commercial
Buildings · Real Estate · Education · Government · Infrastructure & Construction · Water & Wastewater ·
Mining · Others.

*(Levels 2–4 are populated by admins over time; this list is a starting point, not a fixed enum.)*

## 4. Governance (product view — see Track-1 patch for the binding version)

- **Owner (recommended): M2 Marketplace** — like `categories` (DD-4): M2 owns the entity/lifecycle,
  **M8 Admin approves**. Vendors/buyers **assign** active nodes; they never create them.
- **Referenced cross-module by ID via contract — never a cross-module FK** (Invariant #7). Buyers
  reference an industry node from `buyer_profiles`; vendors via an assignment set.
- **Industry ≠ Category.** Industry = *sector served*; Category = *product/service*. Independent.
- **Matching use is deferred.** Industry becomes an **optional Phase-C ranking signal only if** the Board
  approves an M3 patch — never a Phase-A gate. Until then it is metadata for search/analytics.
- **Versioned.** Any level/value change bumps the Classification Schema Version.

## 5. Migration note (for the Board)

`buyer_profiles.industry` exists today as **free text**. On ratification the Board decides whether to
migrate it to the taxonomy (by ID) or keep it as a free-text fallback. This doc coins no migration; it
records the open question (see the Track-1 patch, "Open questions for the Board").
