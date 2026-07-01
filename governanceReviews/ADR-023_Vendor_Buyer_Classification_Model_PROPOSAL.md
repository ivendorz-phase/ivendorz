# ADR-023 — Vendor & Buyer Classification Model

**Status:** PROPOSAL (awaiting human Architecture Board — ranks 0–1 immutable to skills, `CLAUDE.md §7/§8`).
**Date:** 2026-07-01
**Deciders:** Human Architecture Board (with Enterprise Architect, DDD Architect, API Governance, M3 owner).
**Relates to:** extends the capability model of Invariant #1; does **not** supersede any ADR.
**Realizes:** `CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` §1/§3.
**Additive patches (linked):** `Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md`,
`Doc-2_BuyerTypeClassification_Additive_Patch_PROPOSAL.md`, `Doc-2_IndustryTaxonomy_Additive_Patch_PROPOSAL.md`.

> On approval this ADR is carried alongside `ADR_Compendium_v1.md` (consolidation into Compendium v2
> deferred to a human re-freeze — the current practice for ADR-021). NON-authoritative until approved.

---

## Context

Industrial buyers and vendors need richer classification than the frozen 4-flag capability matrix
provides for discovery, filtering, analytics, and (potentially) ranking. External product proposals
suggested replacing the matrix with a multi-category vendor "business type" and adding industry and
organization-type dimensions. The frozen corpus already fixes: capability = four booleans (Invariant #1,
`Doc-2 §10.3`), organizations *participate* rather than *type* (Invariant #2, `Master …FINAL §3`),
categories = a 4-level admin-governed tree (`Doc-4D` DD-4 / `Doc-6D` §3.2), and a matching moat that
gates on capability (A3) and category (A2) and takes no payment/plan input (`Doc-3 §12.1/§4B`).

The decision needed: how to add business-type, industry, and buyer-type classification **additively**
without weakening the matrix, the participation model, or the matching firewalls.

## Decision

1. **The capability matrix remains authoritative and unchanged.** `can_supply` / `can_service` /
   `can_fabricate` / `can_consult` stay the single source of truth for vendor capability and the only
   capability input to matching. **The matrix is intentionally compact and stable; expansion requires
   Architecture Board approval** (restates `CLAUDE.md §7/§8`; coins no new authority).

2. **Business Type is metadata, hosted on the existing `vendor_type_preset` field.** Its allowed values
   (Manufacturer / Supplier-Distributor / Importer / Fabricator / EPC-Contractor / Engineering-Consultant
   / Other, with OEM / Dealer / System-Integrator / Authorized-Service-Partner reserved for a later
   schema version) are **Business Classification metadata** — usable for search, filter, analytics,
   reporting. *"Business Type metadata is available to the matching engine as an optional ranking signal.
   Whether and how it influences ranking is determined exclusively by M3 matching policies approved by
   the Architecture Board."* It is **never** a Phase-A gate and **never** derives from or overrides the
   matrix. A **suggestion-only** Type→default-capability crosswalk aids onboarding (user-editable; not a
   runtime derivation).

3. **Buyer Type lives on `buyer_profiles`, not `organizations`.** A `buyer_type` classification is added
   to the identity **profile** (Factory / Hospital / Commercial-Building / Government / Utility /
   Developer / EPC / Trading / University / Hotel / NGO / Other), preserving Invariant #2 ("organizations
   participate, they don't type"). It is metadata for search/analytics; not a matching input.

4. **Industry is a new M2-owned taxonomy.** A 4-level **Industry → Sector → Sub-Sector → Application**
   taxonomy (mirroring the frozen category tree's `level CHECK 1–4`), admin-governed (DD-4 pattern:
   M2 owns the entity/lifecycle, M8 approves), assignable to vendors and to `buyer_profiles`,
   **referenced across modules by ID via contract — never a cross-module FK** (Invariant #7). Ranking-use
   of industry is a downstream M3/Board decision, not granted by this ADR.

5. **Procurement categories reuse the existing category tree.** No new "Mechanical/Electrical/HVAC"
   entity is coined (A4).

6. **Classification ⟂ Matching.** Classification (M2/M1) defines metadata; matching (M3) consumes it via
   configurable, Board-approved policies. The two are decoupled and approved on independent tracks.

7. **Classification Schema Versioning.** The classification metadata set carries a **Classification
   Schema Version** (v1.0 at ratification); any additive value/level change bumps it (Invariant #8 spirit).

## Consequences

**Positive:** richer discovery/analytics without weakening the moat; matrix and participation invariants
untouched; industrial vendors/buyers describe themselves realistically; a single versioned taxonomy
prevents duplicate industry lists; clean M2⟂M3 boundary future-proofs the matching engine.

**Costs / follow-ups:** three additive patches (Doc-4D + Doc-6D; Doc-2 §10.2 + Doc-6C; Doc-2 + Doc-4D +
Doc-6D + Doc-8) require human approval and DB migrations at M1/M2 build time; net-new discovery signals
(brands, OEM-authorization, structured certifications, buyer department/role/maturity) are **out of scope
here** and routed to `esc_registry.md` for separate Board decisions; any M3 ranking use of Business Type
or Industry needs its own M3 patch.

**Firewalls preserved:** Invariant #1 (matrix), #2 (participation), #6/§4 (signal firewall), #7 (no
cross-module FK), #10 (Tier ≠ Plan; entitlements ≠ plan-name).

## Alternatives considered

- **Replace the matrix with a 7-type enum** — rejected: violates Invariant #1 and breaks matching gate
  A3 (`Doc-6D Pass1 L88`).
- **Add organization_type to `organizations`** — rejected: violates Invariant #2.
- **New procurement-category entity** — rejected: duplicates the frozen category tree (A4).
- **Subscription-weighted ranking** — rejected in the matching track: `Doc-3 §12.1/§4B` bar payment/plan
  input to matching (Invariant #10).

## References

Invariants #1/#2/#4/#6/#7/#8/#10/#12 (`CLAUDE.md §5`) · `Doc-2 §10.2/§10.3/§10.4` · `Doc-4D` DD-4 /
Discovery §B.6 / VendorProfile §B · `Doc-6C` (identity schema) · `Doc-6D Pass1 L66-70/L88` §3.2 (category
tree) · `Doc-3 §3.1/§12.1/§4B`, `Doc-4E …Part2` (matching) · `../esc_registry.md` (Known non-ESC gaps).
