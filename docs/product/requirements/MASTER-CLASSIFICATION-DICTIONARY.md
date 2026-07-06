# Master Classification Dictionary — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Date:** 2026-07-01 · **Home:** `productSpec/` · **Governance source:** `governanceReviews/
CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` + `ADR-023` (proposal).

**Purpose.** The single source of business terminology for every `productSpec/` document. Other product
specs **reference terms defined here; none redefine them** (anti-drift, CTO Concern 2). Each term is
tagged **EXISTS** (already in the frozen corpus — anchor cited), **MAPS** (presentation over a frozen
primitive), or **NET-NEW** (proposed additively — routed to a governance track/esc; not yet real).

---

## 1. The three independent dimensions

- **Capability** — *what a company can perform.* Authoritative.
- **Business Type** — *what kind of company it is.* Metadata.
- **Industry** — *which industries it serves.* Metadata.

They never collapse into one another and never cross-mutate (ADR-023 §1).

---

## 2. Term dictionary

| Term | Definition (business) | Owner | Tag | Anchor / route |
|---|---|---|---|---|
| **Capability (matrix)** | The four independent booleans a vendor sets: `can_supply`, `can_service`, `can_fabricate`, `can_consult`. The source of truth for what a vendor does. | M2 | **EXISTS** | Invariant #1; `Doc-2 §10.3`; `Doc-6D Pass1 L66-69` |
| **Business Type** | A vendor's self-described company kind (Manufacturer, Supplier/Distributor, Importer, Fabricator, EPC-Contractor, Engineering-Consultant, Other). Metadata for search/filter/analytics; optional M3 ranking signal; never a gate; never overrides Capability. | M2 | **MAPS** (onto `vendor_type_preset`) → value set **NET-NEW** | `Doc-4D …VendorProfile §B` (field exists); value set = `Doc-4D_VendorTypePreset_Values` patch (`ESC-MKT-VENDORTYPE`) |
| **Industry** | The sector a company serves/belongs to (Pharmaceutical, Power, Textile…). | M2 (rec.) | **NET-NEW** | `Doc-2_IndustryTaxonomy` patch (`ESC-CLASS-INDUSTRY`) |
| **Sector / Sub-Sector / Application** | Levels 2–4 of the Industry taxonomy (e.g. Power → Generation → Gas Turbine → Combined Cycle). | M2 (rec.) | **NET-NEW** | as above; mirrors `Doc-6D` category `level CHECK 1–4` |
| **Category** | The product/service taxonomy a vendor is assigned to (Pumps, Valves…). Admin-governed 4-level tree. Distinct from Industry. | M2 | **EXISTS** | `Doc-4D` DD-4; `Doc-6D §3.2` |
| **Buyer Type** | A buyer organization's segmentation (Factory, Hospital, Government…), stored on the **buyer profile**, not the organization. | M1 | **NET-NEW** (on `buyer_profiles`) | `Doc-2_BuyerType` patch (`ESC-IDN-BUYERTYPE`); Invariant #2 |
| **Procurement Mode** | A buyer-facing RFQ intent (Supply, Supply+Installation, Turnkey EPC…) that **maps onto** the frozen `work_nature` set. Not a stored RFQ field. | M3 (RFQ) | **MAPS** (onto `work_nature[]`) | `Doc-2 §10.4`; crosswalk in `RFQ-CREATION-BUSINESS-MODEL.md` |
| **Work Nature** | The frozen RFQ attribute: a subset of `{supply, service, fabricate, consult}`. Matching gates on it (A3/A4). | M3 | **EXISTS** | `Doc-2 §10.4`; `Doc-4E …Part2` |
| **Capacity Profile** | Vendor manufacturing/service/project/commercial capacity (factory-size range, employee range, turnover, max project value/monthly RFQ). | M2 (data) / M5 (verification) | **EXISTS** | `Doc-2` `vendor_capacity_profiles`; Governance Signal (CLAUDE.md §4) |
| **Trust / Performance (band)** | Governance signals consumed by matching as **bands via events**, never raw scores. | M5 | **EXISTS** | Invariant #6; `Doc-6D` (bands reflected); `Doc-3 §6` |
| **Commercial Capability** | Proposed vendor discovery signals: Export, Import, OEM, Authorized-Distributor, Dealer, Stockist, After-Sales, 24/7-Support. | M2 | **NET-NEW** | routed to `ESC-MKT-VENDORTYPE` / future M2 patch |
| **Procurement Maturity** | Proposed buyer segmentation: Occasional / Regular / Enterprise / Group. | M1 | **NET-NEW** (reserved) | routed to `ESC-IDN-BUYERTYPE` |

---

## 3. Controlled value lists (Classification Schema v1.0)

**Business Type** (`vendor_type_preset`): `manufacturer`, `supplier_distributor`, `importer`,
`fabricator`, `epc_contractor`, `engineering_consultant`, `other`.
*Reserved (later version):* `oem`, `dealer`, `system_integrator`, `authorized_service_partner`.

**Buyer Type** (`buyer_profiles.buyer_type`): `factory`, `hospital`, `commercial_building`, `government`,
`utility`, `real_estate_developer`, `epc_company`, `trading_company`, `university`, `hotel`, `ngo`, `other`.

**Work Nature** (frozen, do not extend without Board): `supply`, `service`, `fabricate`, `consult`.

**Procurement Mode** (buyer-facing; each maps to a Work-Nature subset — see `RFQ-CREATION-BUSINESS-MODEL.md`):
`supply`, `supply_installation`, `supply_commissioning`, `fabrication`, `fabrication_installation`,
`turnkey_epc`, `consultancy`, `maintenance_contract`, `annual_service`.

**Industry (Level 1, illustrative — full tree in `INDUSTRY-TAXONOMY-MODEL.md`):** Pharmaceutical, Textile
& Garments, Food & Beverage, Cement, Steel, Power & Energy, Oil & Gas, Chemical, Hospital & Healthcare,
Commercial Buildings, … (admin-governed; not frozen).

---

## 4. Versioning

This dictionary carries the **Classification Schema Version** (v1.0). Any added value, reserved-value
promotion, or new industry level increments the version and is recorded in `ADR-023` and the owning
patch (Invariant #8 spirit). Product docs cite "Classification Schema v1.0" so downstream imports/APIs/AI
bind to a stable handle.
