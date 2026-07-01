# Vendor Profile Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Terms:** `MASTER-CLASSIFICATION-DICTIONARY.md`. **Governance:** `ADR-023` + reconciliation doc.

---

## 1. What a vendor profile expresses

"Who is this vendor, what can they do, and how do buyers find them?" Most of this is already modeled;
this doc names each concept and tags it **EXISTS / MAPS / NET-NEW**.

## 2. Vendor profile concept map

| Concept | Business meaning | Tag | Anchor / route |
|---|---|---|---|
| Name, human_ref, claim state, status, visibility | Identity & lifecycle of the vendor record | **EXISTS** | `Doc-2 §10.3`; `Doc-4D …VendorProfile` |
| **Capability (4 flags)** | What the vendor can perform (authoritative) | **EXISTS** | Invariant #1; `Doc-6D Pass1 L66-69` |
| **Business Type** | Company kind (Manufacturer/Supplier/…) | **MAPS** (`vendor_type_preset`); value set **NET-NEW** | `Doc-4D …VendorProfile §B`; `ESC-MKT-VENDORTYPE` |
| Geography (country/division/district/zone) | Where the vendor operates | **EXISTS** | `Doc-2 §10.3`; `Doc-6D Pass1` |
| Categories (product/service) | What products/services (4-level tree; ≤10/≤5 primary) | **EXISTS** | `Doc-4D` DD-4; `Doc-6D §3.2` |
| Products & specifications | Published catalog items | **EXISTS** | `Doc-4D …CatalogProductSpec` |
| Projects | Track record / experience | **EXISTS** | M2 (marketplace projects) |
| Capacity profile | Factory-size, employee range, turnover, max project value, monthly RFQ capacity | **EXISTS** | `Doc-2` `vendor_capacity_profiles` |
| Certifications (ISO/license/TIN/VAT) | Verified credentials | **EXISTS** (as verification) | M5 verification records; `Doc-6D` verified-fields |
| Trust / Performance | Governance signals (band display only) | **EXISTS** | Invariant #6; M5 |
| **Industries served** | Sectors the vendor serves | **NET-NEW** | `Doc-2_IndustryTaxonomy` patch; `ESC-CLASS-INDUSTRY` |
| **Commercial Capability** | Export, Import, OEM, Authorized-Distributor, Dealer, Stockist, After-Sales, 24/7-Support | **NET-NEW** | routed → `ESC-MKT-VENDORTYPE` / future M2 patch |

## 3. Business Type ↔ Capability (suggestion-only crosswalk)

When a vendor picks a Business Type at onboarding, the UI **pre-checks** the suggested capability flags;
the vendor may change any of them. This is an onboarding aid, **not** a runtime derivation, and the flags
remain the source of truth (Invariant #1). Full crosswalk lives in the Track-1 patch
(`Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md`, Appendix A).

| Business Type | Suggested default flags |
|---|---|
| manufacturer | supply, fabricate |
| supplier_distributor | supply |
| importer | supply |
| fabricator | fabricate, supply |
| epc_contractor | supply, service |
| engineering_consultant | consult |

## 4. Commercial Capability (NET-NEW — routed, not coined here)

The signals Export / Import / OEM / Authorized-Distributor / Dealer / Stockist / After-Sales / 24-7
would enrich discovery, but they are **not modeled** in the frozen corpus. They are **not** coined in
this spec — they are routed to `ESC-MKT-VENDORTYPE` for a future M2 additive decision (and some overlap
with reserved Business-Type values `oem`/`dealer`). Until ratified, they are not part of the product.

## 5. Discovery signals available today (EXISTS)

Buyers can already filter the public directory by **category, geography, capability, `vendor_type_preset`**
and see Trust **band** indicators (`Doc-4D …Discovery §B.6`). Brand and structured-certification facets
are NET-NEW (routed). See `RFQ-MATCHING-BUSINESS-MODEL.md` for how these become matching inputs.
