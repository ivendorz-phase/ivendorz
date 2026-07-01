# Doc-2_IndustryTaxonomy_Additive_Patch_PROPOSAL.md

> **STATUS: DRAFT — PROPOSED ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-2 is **rank-0 frozen
> architecture** (`CLAUDE.md §7`). This is the **largest** proposal in the package and it **assigns
> module ownership of a net-new taxonomy** — a rank-0/human decision. This file **recommends** a shape;
> it does **not** decide. NOT folded by any AI action. On approval a human folds it as
> `generatedDocs/Doc-2_Patch_v1.0.6.md` (+ linked Doc-4D/Doc-6D/Doc-8 realizations) and registers it.
> Realizes `ADR-023` §4 · `CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` C-4. Resolves `ESC-CLASS-INDUSTRY`
> (supersedes the `../esc_registry.md` "Industry … taxonomies not modeled" note on approval).

## Status

| Field | Value |
|---|---|
| Applies to | `Doc-2` §10.3 (marketplace) + §10.2 (identity ref) ; realized in `Doc-4D`, `Doc-6D`, `Doc-8` |
| Produces | Doc-2 **v1.0.6** (+ linked Doc-4D/Doc-6D/Doc-8 realization patches) |
| Scope | **A net-new admin-governed Industry taxonomy** + assignment to vendors and `buyer_profiles`, referenced cross-module **by ID only**. No change to capability, participation, or the matching moat by this patch. |
| Purpose | Industry is explicitly **"not modeled — escalate"** (`../esc_registry.md`, Known non-ESC gaps). Buyers/vendors need "which industries served" for discovery/analytics (and, later, optional M3 ranking). This introduces the taxonomy the same way categories are governed. |
| Authority | `CLAUDE.md §7/§8/§11/§13`; Invariant #7 (cross-module reference by ID, **no FK**); `Doc-4D` DD-4 (category approval boundary — the pattern to mirror); `Doc-6D` §3.2 (4-level tree precedent, `level CHECK 1–4`). |

---

# PATCH-D2-06 — Industry Taxonomy (recommended shape; ownership for Board ratification)

**Recommended owner: M2 Marketplace** — mirroring `marketplace.categories` (DD-4: M2 owns the entity and
lifecycle; **M8 Admin governs approval** via a staff permission analogous to `staff_can_manage_categories`).
*Assigning a new taxonomy's owner is an architecture decision; the Board ratifies. Recommendation = M2.*

**Structure — 4 levels (mirrors the frozen category tree):**

```
Industry → Sector → Sub-Sector → Application            (level CHECK 1–4, self-FK parent, materialized path)
```

Worked example: `Power → Generation → Gas Turbine → Combined Cycle`.

**Assignment:**

- **Vendors:** an `industry_assignments` set on the vendor (M2), bounded like category assignments
  (recommend a cap analogous to categories, e.g. ≤10 / ≤5 primary — Board to confirm the numbers).
- **Buyers:** a reference from `identity.buyer_profiles` to an industry node **by ID via contract — never
  a cross-module FK** (Invariant #7; M1 stores the bare UUID and resolves via the M2 service, the same
  pattern M1 already uses for M2 references).

**Binding rules:**

- **Admin-governed lifecycle** (`draft → active → retired`, soft-delete), like categories; vendors/buyers
  **assign** active nodes, never create them. Suggestions route through the existing admin suggestion path
  (analogous to `admin.category_suggestions`).
- **Distinct from Category.** Industry = *sector served* (Pharmaceutical, Power…). Category = *product/
  service* (Pumps, Valves…). They are independent dimensions; neither derives from the other.
- **Matching boundary.** This patch makes industry **available** as metadata. Any use as a Phase-C
  ranking signal is a **separate M3/Board decision** (`MATCHING-ENGINE-RECONCILIATION_v1.0.md`); it is
  **never** a Phase-A gate here.
- **Firewall.** No governance-signal or payment/plan coupling (Invariant #6/#10).
- **Classification Schema Version** bumps on any level/value change (ADR-023 §7).

**Linked realizations (human-folded on approval; recorded, not edited here):**

- **`Doc-6D`** — `marketplace.industries` table (self-FK, `level CHECK 1–4`, path) + `industry_assignments`
  join, DDL + Prisma + RLS + FTS, mirroring the categories realization; project into
  `vendor_matching_attributes` **only if** the Board approves industry as an M3 input (else omit).
- **`Doc-4D`** — admin CRUD + status contracts (mirror `create/update/set_status/list_categories`) under
  a new staff permission; `assign_industry` (User, controlling-org authority); add `industry` to the
  discovery filter allowlist (§B.6).
- **`Doc-2` §10.2** — `buyer_profiles` gains an optional `industry_id` reference (by ID).
- **`Doc-8`** — conformance tests for the new tree + assignment + non-disclosure.

**Open questions for the Board:** (a) confirm M2 ownership; (b) assignment caps; (c) whether buyers get
one industry or many; (d) whether `buyer_profiles.industry` (existing free-text) is migrated to the
taxonomy or kept as a free-text fallback.

*End of Doc-2_Patch_v1.0.6 (PROPOSED) — net-new admin-governed 4-level Industry taxonomy, M2-recommended,
referenced by ID (no FK); metadata by default, M3 ranking use deferred to a separate decision. DRAFT —
awaits HUMAN approval; not folded by AI.*
