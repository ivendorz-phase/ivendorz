# Classification & Matching Decision — Reconciliation & Board Intake

**Status:** DRAFT v1.0 — Board intake (NON-authoritative; conforms upward, coins nothing).
**Date:** 2026-07-01
**Author:** AI Coding Supervisor (planning) — raises findings; does **not** rule (see §13 Raise ≠ Accept).
**Presiding authority:** Human Architecture Board (ranks 0–1 immutable to skills — `CLAUDE.md §7/§8`).
**Companions (this package):** `ADR-023_Vendor_Buyer_Classification_Model_PROPOSAL.md` ·
`Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` ·
`Doc-2_BuyerTypeClassification_Additive_Patch_PROPOSAL.md` ·
`Doc-2_IndustryTaxonomy_Additive_Patch_PROPOSAL.md` · `MATCHING-ENGINE-RECONCILIATION_v1.0.md` ·
`../esc_registry.md` (new rows) · `../productSpec/*` (Track 3, non-authoritative).

> Precedence: NON-authoritative. On any conflict the frozen corpus wins (`CLAUDE.md §7`, §11
> Flag-and-Halt). This document **references-never-restates** frozen entities/slugs/events; it records
> a set of *product/architecture proposals* for human-Board adjudication. It changes nothing on its own.

---

## 0. Why this exists

A set of external product proposals (industrial buyer/vendor classification, a weighted RFQ matching
engine, and a product-specification layer) were authored **without sight of the frozen corpus**. They
are strong product thinking, but several parts intersect **Core Invariants** and the frozen **M3 matching
moat**. This document reconciles each proposed concept against the corpus and routes it to the correct
channel. It exists so the decisions become the repository's *own* governed record instead of living in
chat history.

**Decision outcome sought:** ratify the dispositions in §3, approve (or amend) the four companion
additive-patch proposals, and note the Track-3 product specs as non-authoritative companions.

---

## 1. Foundational principles (proposed for ratification)

1. **Capability is authoritative; everything else is metadata.** The vendor capability matrix — four
   independent booleans `can_supply` / `can_service` / `can_fabricate` / `can_consult` (Invariant #1;
   `Doc-2 §10.3`; `Doc-6D_Content_v1.0_Pass1` L66-69/L88 MK-CR4) — remains the single source of truth for
   what a vendor can do, and the only capability input to RFQ matching (gate **A3**).
2. **Three independent dimensions.** *Capability* answers "what can this company perform?"; *Business
   Type* answers "what kind of company is this?"; *Industry* answers "which industries does it serve?"
   They never collapse into one another and never cross-mutate.
3. **Classification ⟂ Matching (B1).** *Classification defines metadata (M2/M1). Matching consumes
   metadata according to configurable M3 policies. The two are never coupled* and evolve on different
   clocks — taxonomy is stable for years, ranking evolves continuously.
4. **Firewalls hold.** No classification field mutates a governance signal (Invariant #6, §4); no
   payment/plan/entitlement input reaches matching (`Doc-3 §12.1/§4B`; Invariant #10).
5. **Additive & versioned.** New taxonomy ships as additive patches (human-approved, `CLAUDE.md §11`);
   taxonomy changes bump a **Classification Schema Version** (v1.0 → v1.1 …), never a silent enum edit
   (conforms to Invariant #8).

---

## 2. Two independent approval tracks

- **Track 1 — Classification governance** (M2/M1 additive patches: vendor_type_preset values,
  `buyer_type`, industry taxonomy). Human-Board gated.
- **Track 2 — Matching governance intake** (M3 moat). Separate M3-owner/Board decision; see
  `MATCHING-ENGINE-RECONCILIATION_v1.0.md`.

Classification never waits on matching; matching never freezes the taxonomy. (Track 3 = non-authoritative
product specs; Track 4 = future implementation contracts, out of scope here.)

---

## 3. Reconciliation & Validate-Findings adjudication (§13)

Each proposed concept is adjudicated against the four gate questions (Valid? · Applicable? · Best for the
product? · Consistent with the frozen corpus?) with a disposition and a resolution channel. A finding
that fails any question is recorded and **not** implemented.

| # | Proposed concept | Frozen reality (anchor) | Valid | Appl | Best | Consist | Disposition · Channel |
|---|---|---|---|---|---|---|---|
| C-1 | Vendor 7-type "Business Type" as capability | Invariant #1 — 4 booleans; `Doc-6D Pass1 L88` "no `vendor_type` enum derived from them" | Y | Y | N (as replacement) | N | **REJECT as replacement.** Keep the matrix; layer types as metadata (C-2). |
| C-2 | Vendor business-type **label** | `vendor_type_preset : enum : optional` exists; already an allowlisted **search filter** (`Doc-4D …Discovery §B.6`); "UI preset label, not the capability source of truth" (`Doc-6D Pass1 L88`) | Y | Y | Y | Y | **ACCEPT (additive).** Define the value set as Business Classification metadata. → Track 1 `Doc-4D…VendorTypePreset` patch; `ESC-MKT-VENDORTYPE`. |
| C-3 | Finer "work scope" (Install/Commission/…) | RFQ `work_nature[] ⊆ {supply,service,fabricate,consult}` (`Doc-2 §10.4`); matching gates on the 4 flags | Y | Partial | N (as gate) | N (as new gate) | **MAP only.** Present as buyer-facing procurement modes → `work_nature` crosswalk (Track 3 RFQ-Creation). No new RFQ field. |
| C-4 | Industry Segment (~25-30) | "Industry … taxonomies **not modeled** — escalate" (`../esc_registry.md` Known non-ESC gaps); `buyer_profiles.industry` free-text only | Y | Y | Y | Y (via additive) | **ACCEPT (additive).** New M2-owned 4-level taxonomy. → Track 1 `Doc-2…IndustryTaxonomy` patch; `ESC-CLASS-INDUSTRY`. |
| C-5 | Buyer "Organization Type" (Factory/Hospital/…) | Invariant #2 — "orgs participate, they don't type" (`Master …FINAL §3`); no org-type enum | Y | Y | Y (on profile) | N (at org) / Y (on profile) | **ACCEPT on `buyer_profiles`**, not `organizations`. → Track 1 `Doc-2…BuyerType` patch; `ESC-IDN-BUYERTYPE`. |
| C-6 | Procurement Category (Mechanical/HVAC) | RFQ reuses `marketplace.categories` (4-level, DD-4) + `work_nature` | Y | Y | Y | Y | **REUSE category tree** — coin no new entity. → `ESC-RFQ-PROCCAT` (confirm). |
| C-7 | Weighted matching engine (scores/weights) | Frozen moat — Doc-3 owns gates/scoring; Phase A→B→C (`Doc-4E …Part2`; `Doc-3 §3.1`) | Y | Y | Y (as intake) | conditional | **INTAKE only → M3/Board.** Not redesigned here. See Track 2; `ESC-RFQ-MATCH-EVOLVE`. |
| C-8 | Subscription boosts ranking (+2) | Matching takes **no payment/plan/entitlement input** (`Doc-3 §12.1/§4B`); Invariant #10 (Tier ≠ Plan); M7 entitlements ≠ plan-name checks | Y | Y | N | N | **REJECT score-boost.** Subscription's lever = intake **capacity** (`entitlement_quota`/`monthly_rfq_limit`) + lead credits, never score. (Track 2.) |
| C-9 | "Build ADR / docs/decisions" | ADR Compendium (rank 1) + `governanceReviews/` + `esc_registry.md` already exist (`CLAUDE.md §7/§11`) | Y | Y | Y | Y | **USE existing system.** Product decisions → `productSpec/` (non-authoritative), not a forked `docs/decisions/`. |

**Gate summary for freeze/merge (§13):** this intake raises proposals only; nothing is BLOCKER/MAJOR
against the corpus **provided** each additive patch is human-approved before implementation. If the Board
finds any resolution conflicts with a frozen document, **Flag-and-Halt** (§11) — do not resolve locally.

---

## 4. Classification Governance Matrix (the ambiguity-killer)

| Dimension | Owner | Phase-A gate? | Phase-C rank? | Search | Analytics | Editable by |
|---|---|---|---|---|---|---|
| Capability (4 flags) | M2 | **Yes (A3)** | Yes | Yes | Yes | Controlling org |
| Business Type (preset) | M2 | **No** | Optional — M3 policy only (§5) | Yes | Yes | Controlling org |
| Industry | M2 (rec.) | No | Optional — M3 policy only (§5) | Yes | Yes | Admin taxonomy / org assigns |
| Category | M2 | **Yes (A2)** | Yes | Yes | Yes | Admin taxonomy / org assigns |
| Buyer Type | M1 | No | No | Yes | Yes | Controlling org |

**Binding wording for Business Type ranking:** *"Business Type metadata is available to the matching
engine as an optional ranking signal. Whether and how it influences ranking is determined exclusively by
M3 matching policies approved by the Architecture Board."* It MUST NOT be a Phase-A eligibility gate and
MUST NOT derive from or override the Capability Matrix.

---

## 5. Target separation (north-star)

```text
M2 — Marketplace Classification (metadata; Classification Schema vN)
  ├── Industry        ├── Category      ├── Business Type
  ├── Buyer Type (M1) └── Capability (4-flag matrix, authoritative)
                    │  (consumed by ID via contract — no cross-module FK, Inv #7)
                    ▼
M3 — Matching Engine (owns HOW metadata is used)
  Eligibility Gates (A1–A7: Capability A3 / Category A2 fixed)
        ▼
  Ranking Policies (configurable per RFQ type — Phase-C signals)
        ▼
  Distribution Policies (capacity/fairness; M7 entitlements feed capacity, never ranking)
        ▼
  Learning & Optimization (M9 advises; modules decide — Inv #12)
```

---

## 6. Classification Schema Version

The classification metadata set is versioned as a whole: **Classification Schema v1.0** at first
ratification. Any additive value/level change (new business type, new industry level, reserved future
value) increments the version and is recorded in the ADR + the owning patch. This gives migrations,
imports, reporting, public APIs, and AI a stable version handle instead of silent enum drift
(Invariant #8 spirit).

---

## 7. What the Board is asked to decide

1. Ratify §1 principles and §3 dispositions (or amend).
2. Approve the four companion additive-patch proposals (vendor_type_preset values; buyer_type; industry
   taxonomy; and note the matching intake for the M3 owner).
3. Confirm **M2 ownership** of the industry taxonomy (assigning a new taxonomy's module owner is a
   rank-0/human decision — this doc *recommends*, it does not decide).
4. Note the Track-3 product specs as non-authoritative companions.

**Nothing in this package edits a frozen document or ships code.** Implementation follows the build
roadmap only after ratification.
