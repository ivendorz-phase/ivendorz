# Doc-4J_Structure_Patch_v1.0 — Corrective Structure Patch (Module-8 Admin Operations)

| Field | Value |
|---|---|
| Document | Doc-4J_Structure_Patch_v1.0 — corrective structure patch for `Doc-4J_Structure_Proposal_v0.1` |
| Nature | **Structure patch only.** Applies the accepted findings **F4J-MA-M1 (MINOR)** and **F4J-MA-N1 (NITPICK)**. Minimal, clarification only. Not a redesign. |
| Applies to | `Doc-4J_Structure_Proposal_v0.1.md` |
| Finding source | `Doc-4J_Structure_Independent_Hard_Review_v1.0` (PASS WITH PATCH; Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 · NITPICK = 1) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | §J12 (Permission Surface Map — BC-ADM-3 authorization) · §J5 (Aggregate Inventory — Suggestion no-split guard). No other section changed. |
| Preserved unchanged | family-map reconciliation (Doc-4J = Admin Operations), BC count (6), aggregate inventory (6), ownership, state machines, dependency seams (DR-ADM-*), event ownership (`VendorBanned` only), procurement moat, trust firewall, non-disclosure. No new slug/event/audit-action. |

---

## Executive Summary

Findings patched:

- **F4J-MA-M1 (MINOR)** — §J12 — BC-ADM-3 (Suggestions) authorization surface underspecified: `staff_can_manage_categories` scope across the three Suggestion roots was indeterminate. **Resolution: Option (B)** per Doc-2 §7 — `staff_can_manage_categories` covers **category-suggestion decisions only**; **missing-vendor** and **link-candidate** decisions carry **`[ESC-ADM-SLUG]`** (no §7 staff slug enumerates them; no slug invented). Authorization is now deterministic per Suggestion contract.
- **F4J-MA-N1 (NITPICK)** — §J5 — add an explicit Pass-A guard that the three Suggestion roots remain co-located in BC-ADM-3 and must not be split into separate bounded contexts (Doc-2 §2 mandate).

---

## Patch 1

**Finding:** F4J-MA-M1 (MINOR) — §J12 Permission Surface Map — BC-ADM-3 authorization surface underspecified.

**Original Text** (§J12, BC-ADM-3 permission-family bullet)
```
  - **`staff_can_manage_categories`** → BC-ADM-3 Suggestions (category-suggestion decisions; link/missing-vendor decisions bind the nearest applicable staff slug, or carry `[ESC-ADM-SLUG]` if no §7 staff slug enumerates the action — **no slug invented**).
```

**Replacement Text**
```
  - **`staff_can_manage_categories`** → BC-ADM-3 Suggestions — **category-suggestion decisions ONLY** (Doc-2 §7 scope: `staff_can_manage_categories` governs the category surface, consistent with the Doc-2 §9 Admin audit action "category approve/delete"; it does **not** extend to missing-vendor or link-candidate decisions). **Determination (F4J-MA-M1 — Option B; Doc-2 §7 is the authority):**
    - `category_suggestions` decisions → **`staff_can_manage_categories`** (Doc-2 §7).
    - `missing_vendor_suggestions` decisions → **`[ESC-ADM-SLUG]`** — Doc-2 §7 enumerates no platform-staff slug for missing-vendor triage; carried (Doc-2 §7 additive); **no slug invented**.
    - `link_suggestions` confirm/dismiss → **`[ESC-ADM-SLUG]`** — Doc-2 §7 enumerates no platform-staff slug for link-candidate confirmation; carried (Doc-2 §7 additive); **no slug invented**.
    BC-ADM-3 therefore binds **one named §7 slug (`staff_can_manage_categories`) for the category-suggestion contract** and **`[ESC-ADM-SLUG]` for the missing-vendor and link-candidate contracts** (the Pass-A author binds these three Suggestion contracts accordingly; `staff_super_admin` remains the audited-and-flagged override per Doc-2 §7). No slug invented; no new authorization model.
```

**Rationale.** Doc-2 §7 (the corpus authority) enumerates exactly seven platform-staff slugs; `staff_can_manage_categories` is named, and both its name and the Doc-2 §9 Admin audit action ("category approve/delete") scope it to the **category** surface — there is **no enumerated §7 staff slug** for missing-vendor triage or link-candidate confirmation. The corpus-faithful resolution is therefore Option (B): `staff_can_manage_categories` covers the category-suggestion root only, and the other two roots carry `[ESC-ADM-SLUG]` (the Doc-2 §7-additive marker) until a named slug is registered through that channel. This makes the §J12 permission surface deterministic per Suggestion contract — an AI-agent now binds exactly one named slug for the category contract and the marker for the other two — without inventing a slug or adding an authorization model. Wording only; no structural change.

---

## Patch 2

**Finding:** F4J-MA-N1 (NITPICK) — §J5 Aggregate Inventory — three-root co-location guard absent.

**Original Text** (§J5, Suggestion aggregate-inventory bullet)
```
  - **Suggestion** — roots `category_suggestions` / `missing_vendor_suggestions` / `link_suggestions` (AR each; the one Suggestion aggregate family) → **BC-ADM-3**.
```

**Replacement Text**
```
  - **Suggestion** — roots `category_suggestions` / `missing_vendor_suggestions` / `link_suggestions` (AR each; the one Suggestion aggregate family) → **BC-ADM-3**. **Co-location guard (F4J-MA-N1):** the three Suggestion roots remain co-located in BC-ADM-3 at all pass stages — they **must not** be split into separate bounded contexts even though they carry distinct lifecycles (`submitted→approved/rejected`; `submitted→triaged→closed`; `suggested→confirmed/dismissed`) and distinct dependency sets (Marketplace; neither; Operations); the co-location is **mandated by Doc-2 §2** (one Suggestion aggregate, three ARs). No BC split at Pass-A or any later pass.
```

**Rationale.** The three Suggestion roots have different lifecycles and different external writes, which could lead a content-pass author or AI agent to infer (incorrectly) that they belong in three separate bounded contexts. Doc-2 §2 defines them as **one Suggestion aggregate realized by three aggregate roots** ("AR each") — so they must remain co-located in BC-ADM-3. The guard sentence makes this explicit at the canonical structure-level ownership authority (§J5), preventing a structural revision / contract-renumbering at Pass-A. Wording only; no structural, aggregate, or ownership change (the §J5 inventory still lists the same one Suggestion aggregate in the same one BC-ADM-3).

---

## Regression Check

| Surface | Result |
|---|---|
| Family Map (Doc-4J = Admin Operations; event-flow = Doc-4L non-normative) | UNCHANGED |
| BC count | UNCHANGED (6 — BC-ADM-1…6) |
| Aggregate inventory | UNCHANGED (6 — Moderation Case, Ban Action, Suggestion, Import Job, Verification Task, Outreach Campaign; Suggestion still one aggregate / three roots / one BC) |
| Ownership | UNCHANGED — each aggregate one BC-ADM; no aggregate moved/split; BC-ADM-3 still owns all three Suggestion roots. |
| Dependencies | UNCHANGED — DR-ADM-1/MKT/RFQ/OPS/TRUST/PC carried as before. |
| Event ownership | UNCHANGED — Admin produces only `VendorBanned` (BC-ADM-2); no event added. |
| State machines | UNCHANGED — the three Suggestion lifecycles are quoted for clarity in the N1 guard, not modified; no state/transition added or removed. |
| Procurement moat | UNCHANGED — no matching/routing/ranking/supplier-selection/award decision introduced. |
| Trust firewall | UNCHANGED — no Trust/Performance/Verification/Governance score introduced (Trust stores; Admin decides workflow). |
| Non-disclosure | UNCHANGED — link-suggestion content remains never vendor-visible. |
| Slugs / events / audit actions | UNCHANGED — no slug invented (Option B uses the existing `staff_can_manage_categories` + the carried `[ESC-ADM-SLUG]`); no event/audit-action introduced. |

Sections edited = §J12 and §J5 only. No unrelated edit; no structural redesign; no feature addition.

---

## Patch Status

```text
F4J-MA-M1 = RESOLVED   (§J12 — BC-ADM-3 authorization deterministic: category → staff_can_manage_categories; missing-vendor + link → [ESC-ADM-SLUG]; Option B per Doc-2 §7)
F4J-MA-N1 = RESOLVED   (§J5 — three-root co-location guard added; Doc-2 §2 mandate; no BC split at any pass)
```

```text
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Structure Patch Verification)
```

---

*End of Doc-4J_Structure_Patch_v1.0. Structure patch only — applies F4J-MA-M1 (§J12 BC-ADM-3 authorization made deterministic per Doc-2 §7 Option B: `staff_can_manage_categories` = category-suggestion only; missing-vendor + link-candidate decisions carry `[ESC-ADM-SLUG]`, no slug invented) and F4J-MA-N1 (§J5 three-root co-location guard, Doc-2 §2 mandate). Minimal, clarification only; sections §J12 / §J5 only. No redesign; family-map reconciliation, BC count (6), aggregate inventory (6), ownership, state machines, dependency seams, event ownership (`VendorBanned` only), procurement moat, trust firewall, and non-disclosure all preserved; no new slug/event/audit-action. Authorized next stage: Structure Patch Verification → Doc-4J_Structure_FROZEN_v1.0 → Pass-A.*
