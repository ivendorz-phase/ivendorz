# Buyer Profile Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Terms:** `MASTER-CLASSIFICATION-DICTIONARY.md`. **Governance:** `ADR-023` + reconciliation doc.

---

## 1. How iVendorz models a buyer

**Organizations participate; they don't *type*** (Invariant #2). A buyer is an organization that has a
**buyer profile** (optional, org-owned). Segmentation therefore lives on the **profile**, never as an
`organization_type` enum on the organization.

## 2. Buyer concept map

| Concept | Business meaning | Tag | Anchor / route |
|---|---|---|---|
| Participation (Buyer / Vendor / Hybrid) | The org buys, sells, or both — via presence of profiles | **EXISTS** | Invariant #2; `Doc-2 §10.2` participation flags |
| Org Role (Owner/Director/Manager/Officer) | Who inside the org may act, with delegation | **EXISTS** | Invariant #2; `Doc-6C` roles/delegation |
| Industry (free-text today) | Sector the buyer belongs to | **EXISTS** (free-text) → **NET-NEW** (taxonomy) | `buyer_profiles.industry`; `Doc-2_IndustryTaxonomy` patch |
| Factory info | Plant details | **EXISTS** | `buyer_profiles.factory_info_jsonb` |
| Delivery locations | Where goods/services are needed | **EXISTS** | `buyer_profiles.delivery_locations_jsonb` |
| Procurement preferences / approval settings | Buying rules & approval | **EXISTS** | `buyer_profiles.procurement_preferences_jsonb`; `organization_workflow_settings` |
| **Buyer Type** | Factory / Hospital / Government / … | **NET-NEW** (on profile) | `Doc-2_BuyerType` patch; `ESC-IDN-BUYERTYPE` |
| **Department** | Requesting department (Engineering, SCM…) | **NET-NEW** | routed → `ESC-IDN-BUYERTYPE` |
| **Procurement Role** | Requester's function (e.g. SCM Manager) | **NET-NEW** (may relate to Org Role) | routed → `ESC-IDN-BUYERTYPE` |
| **Buying Frequency / Approval Authority level** | Purchasing cadence & sign-off power | **NET-NEW** | routed → `ESC-IDN-BUYERTYPE` |
| **Procurement Maturity** | Occasional / Regular / Enterprise / Group | **NET-NEW (reserved)** | routed → `ESC-IDN-BUYERTYPE` |

## 3. What ships additively now (Track 1)

Only **Buyer Type** is proposed for the near-term additive patch (`Doc-2_BuyerType` v1.0.5 on
`buyer_profiles`). Value set (Classification Schema v1.0): `factory`, `hospital`, `commercial_building`,
`government`, `utility`, `real_estate_developer`, `epc_company`, `trading_company`, `university`, `hotel`,
`ngo`, `other`. It is **metadata** (search/analytics), **not** a matching input.

## 4. Reserved / net-new (routed, not coined here)

Department, Procurement Role, Buying Frequency, Approval Authority level, and Procurement Maturity are
**not modeled** and are **not coined** in this spec. They are routed to `ESC-IDN-BUYERTYPE` for a future
M1 additive decision, and would each bump the Classification Schema Version when ratified. Some (e.g.
Procurement Role) may be expressed through the existing **Org Role + delegation** model rather than a new
field — a Board/M1 call.

## 5. Worked example

```text
Buyer:  Square Pharma
Participation: Buyer
Industry: Pharmaceutical            (free-text now → taxonomy on ratification)
Buyer Type: factory                 (NET-NEW — Track 1)
Factory info / delivery: Gazipur    (EXISTS — JSONB)
Department: Engineering             (NET-NEW — reserved)
```
