# Product Classification Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Terms:** as defined in `MASTER-CLASSIFICATION-DICTIONARY.md` (this doc redefines nothing).
**Governance:** `governanceReviews/CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` + `ADR-023`.

---

## 1. Why classification exists

Industrial buyers and vendors are multi-dimensional. A single "vendor vs buyer" or "supply vs service"
label loses the information that makes discovery and RFQ matching accurate. iVendorz classifies along
**independent dimensions** so a company can be described truthfully and found precisely.

## 2. The dimensions (see Dictionary for definitions)

| Dimension | Answers | Tag | Owner |
|---|---|---|---|
| **Capability** (4 flags) | What can this company **perform**? | EXISTS | M2 |
| **Business Type** | What **kind** of company is it? | MAPS (value set net-new) | M2 |
| **Industry** | Which **industries** does it serve? | NET-NEW | M2 (rec.) |
| **Category** | What **products/services**? | EXISTS | M2 |
| **Buyer Type** | What kind of **buyer** organization? | NET-NEW (profile) | M1 |

**Governance rule:** Capability is authoritative and the only capability input to matching (gate A3).
Everything else is metadata. Classification (M2/M1) defines metadata; Matching (M3) consumes it via
Board-approved policies — the two are never coupled.

### Classification Governance Matrix

| Dimension | Owner | Phase-A gate? | Phase-C rank? | Search | Analytics |
|---|---|---|---|---|---|
| Capability | M2 | Yes (A3) | Yes | Yes | Yes |
| Business Type | M2 | No | Optional (M3 policy) | Yes | Yes |
| Industry | M2 | No | Optional (M3 policy) | Yes | Yes |
| Category | M2 | Yes (A2) | Yes | Yes | Yes |
| Buyer Type | M1 | No | No | Yes | Yes |

## 3. Worked examples — "what kind of company is this?"

| Company | Capability (flags) | Business Type | Industries served |
|---|---|---|---|
| ME BD TECH | supply + fabricate + service | manufacturer | Pharmaceutical, Food, Chemical |
| SKF distributor | supply | supplier_distributor | multi-industry |
| Boiler company | supply + fabricate + service | manufacturer | Power, Food, Textile |
| HVAC contractor | supply + service | epc_contractor | Commercial Buildings, Hospital |
| Structural consultancy | consult | engineering_consultant | multi-industry |

Note how **Manufacturer** and **Fabricator** differ: both may fabricate, but a manufacturer typically
also carries `can_supply` of its own product line, while a job-shop fabricator may not. The **Business
Type** captures the identity; the **Capability flags** capture the verifiable behavior; matching relies
on the flags, not the label.

## 4. The classification model spans the full procurement lifecycle (J)

Classification is not just for the RFQ→match step — the same dimensions carry through post-award ops
(M4) and performance (M5):

```text
Buyer → RFQ → Vendor Matching → Quotation → Negotiation → Award → Purchase Order
     → Delivery → Inspection → Invoice → Payment → Performance → Learning
```

- **Buyer / RFQ:** Buyer Type + Industry + Procurement Mode shape the RFQ (M1/M3).
- **Vendor Matching:** Capability (gate) + Category (gate) + bands/geography (rank) select vendors (M3).
- **Quotation → Award:** the frozen RFQ/quotation state machines (M3).
- **PO → Payment:** post-award documents & finance records (M4) — money recorded, never settled on-platform.
- **Performance → Learning:** M5 signals feed back as bands; M9 may advise (Invariant #12).

## 5. Related docs

`VENDOR-PROFILE-MODEL.md` · `BUYER-PROFILE-MODEL.md` · `RFQ-CREATION-BUSINESS-MODEL.md` ·
`RFQ-MATCHING-BUSINESS-MODEL.md` · `INDUSTRY-TAXONOMY-MODEL.md`.
