# RFQ Creation — Business Model — iVendorz

> **Product Specifications define the intended business behavior and user workflows. They are not
> authoritative for architecture, contracts, data models, or implementation. When conflicts occur, the
> frozen architecture corpus prevails.** (C1)

**Status:** DRAFT v1.0 — NON-authoritative product companion. **Classification Schema v1.0.**
**Terms:** `MASTER-CLASSIFICATION-DICTIONARY.md`. **Governance:** reconciliation doc C-3/C-6.
**Sibling:** `RFQ-MATCHING-BUSINESS-MODEL.md` (how vendors are matched — a separate concern).

---

## 1. How an industrial buyer thinks vs how the system stores it

Buyers think in **Procurement Modes** ("I need a boiler supplied, installed, and commissioned").
The frozen RFQ stores **Work Nature** — a subset of `{supply, service, fabricate, consult}` (`Doc-2
§10.4`). Procurement Mode is a **buyer-facing presentation that MAPS onto Work Nature**; it coins **no new
RFQ field**.

## 2. Procurement Mode → Work Nature crosswalk (A)

| Procurement Mode (buyer-facing) | Work Nature (stored subset) |
|---|---|
| Supply | supply |
| Supply + Installation | supply, service |
| Supply + Commissioning | supply, service |
| Fabrication | fabricate |
| Fabrication + Installation | fabricate, service |
| Turnkey EPC | supply, fabricate, service |
| Consultancy | consult |
| Maintenance Contract | service |
| Annual Service (AMC) | service |

*The system gates/matches on Work Nature (A3/A4); Procurement Mode is the friendly label a buyer picks.*

## 3. Buyer authoring workflow (business narrative)

```text
Start RFQ → Pick Industry + Procurement Mode → Category & item details
   → Specifications / attachments → Commercial fields → Delivery & timeline
   → Validation → Submit (enters the frozen RFQ state machine)
```

- **Industry + Procurement Mode** frame the request (Industry NET-NEW; Mode MAPS to Work Nature).
- **Category & items** use the frozen 4-level category tree (EXISTS). "Procurement categories" like
  Mechanical/Electrical/HVAC are **the same category tree**, not a new dimension (C-6, `ESC-RFQ-PROCCAT`).
- **Specifications / attachments** use the frozen spec-document + file handling (uploads via the
  `[ESC-7-API/upload]` interim; contracts carry `file_ref`).
- **Submit** transitions the RFQ per the frozen state machine (`Doc-4M`); everything downstream (routing,
  matching, quotation) is owned by M3.

## 4. RFQ field concept map

| Field group | Tag | Anchor / route |
|---|---|---|
| Work Nature (from Procurement Mode) | **EXISTS / MAPS** | `Doc-2 §10.4` |
| Category | **EXISTS** | `Doc-6D §3.2` |
| Value / currency, window/timeline | **EXISTS** | `Doc-2 §10.4`; `Doc-3` |
| Specifications / attachments | **EXISTS** | `Doc-4D` spec docs; `[ESC-7-API/upload]` |
| Delivery location | **EXISTS** | RFQ / buyer profile |
| **Industry tag on the RFQ** | **NET-NEW** | `Doc-2_IndustryTaxonomy` patch (RFQ-side use = M3/Board) |
| **Industry RFQ templates** (pre-filled field sets by sector) | **NET-NEW** (product/UX) | future M3/UX; coins no data model |

## 5. Validation & commercial fields

Validation follows the frozen RFQ submission gate (`Doc-4E …RFQLifecycle`; buyers cannot bypass it).
Commercial fields (value, currency — multi-currency-ready, BDT now) are stored per the frozen model; the
platform **never** handles buyer↔vendor money (no escrow/wallet/settlement). Industry-specific RFQ
templates are a **UX convenience** (pre-populated field sets); they coin no new RFQ structure and route
any new stored field back to the governance track.
