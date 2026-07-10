# Doc-2_RoutingGovernanceSlugs_Additive_Patch_PROPOSAL.md

> **STATUS: ✅ APPROVED & FOLDED — owner/Architecture Board ruling, 2026-07-10.**
> Corpus copy: `generatedDocs/Doc-2_Patch_v1.0.8.md` (**PATCH-D2-07**, producing Doc-2 effective
> **v1.0.8**), carried alongside the unedited frozen
> `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` — **no frozen file edited in place.**
> Decision record: `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md` (resolves `ESC-RFQ-SLUG`,
> raised by Doc-4E Pass-A Hard Review PA-05; carried in Doc-4E §E6.5/§E6.6/H.3 + Doc-5E:78).
> Linked carried realization (NOT executed by this fold): identity catalog-seed migration +
> Doc-6C count overlay (43 → 45) at **W2-IDN-7**; Doc-4E/Doc-5E slug-binding flips at **W4 M3
> realization**; admin console P-ADM-19/20/21 wiring at **Wave 5 / Phase B**.

## Status

**APPROVED & FOLDED 2026-07-10** — additive; coins exactly two platform-staff permission slugs.

| Field | Value |
|---|---|
| **Applies to** | Doc-2 (Domain Model & Database Blueprint) — FROZEN, effective v1.0.7 |
| **Produces** | Doc-2 effective **v1.0.8** via `generatedDocs/Doc-2_Patch_v1.0.8.md` (PATCH-D2-07) |
| **Scope** | §7 Permission Mapping — the platform-staff slug paragraph ONLY (line 645 of the frozen base). No table, column, state, event, contract, or ownership change. |
| **Purpose** | Register dedicated least-privilege routing-governance staff slugs so routing/matching admin surfaces stop binding the `staff_super_admin` break-glass slug as "nearest enumerated" |
| **Raised by** | Doc-4E Pass-A Independent Hard Review **PA-05** → `[ESC-RFQ-SLUG]` carried in `Doc-4E_PassB_Part3_v1.0_FROZEN.md` (H.3 :31, §E6.5 :264/:269, §E6.6 :320) and `Doc-5E_SERIES_FROZEN_v1.0.md` :78 |
| **Authority** | Human owner/Architecture Board ruling 2026-07-10 (`BOARD-DECISION-RFQ-SLUG_v1.0.md`) per CLAUDE.md §7/§8 |

All frozen Doc-2 content is preserved. This is a minimal additive exception routed through
change management (human approval): the §7 staff-slug enumeration is extended; no existing slug
is renamed, removed, or re-scoped.

# PATCH-D2-07 — §7 Routing-Governance Staff Slugs

**Terminology.** "Staff space" = the Doc-2 §7 platform-staff slug space ("separate space" — no
org context; enforcement = Identity `check_permission`, platform-staff space). "Routing
governance" = the Doc-4E BC-7 control plane (`rfq.assist_routing.v1`,
`rfq.manage_routing_rule.v1`) plus the staff-side routing/matching reads
(`rfq.get_routing_log.v1`, `rfq.get_matching_results.v1`, routing-rules list/detail).

## D2-07.1 — §7 platform-staff paragraph: two additive slugs

**Location:** §7 Permission Mapping, the bold platform-staff prose paragraph
(`Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md:645`) — one additive extension.

**Before (frozen base, verbatim):**

```
**Platform-staff slugs (separate space):** `staff_can_moderate_rfq`, `staff_can_verify` (Verification Admin), `staff_can_support` (Support Admin; no private-RFQ read), `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit` (compliance-scoped), `staff_super_admin` (all; every action audited+flagged). Verification Admins hold no finance-read slugs; Support Admins hold no private-RFQ slugs.
```

**After (per this patch, the paragraph reads):**

```
**Platform-staff slugs (separate space):** `staff_can_moderate_rfq`, `staff_can_verify` (Verification Admin), `staff_can_support` (Support Admin; no private-RFQ read), `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit` (compliance-scoped), `staff_can_view_routing` (routing/matching governance reads: routing log, matching results, routing rules — monitor, never decide), `staff_can_manage_routing` (routing-governance writes: human-assisted routing, routing-rule control plane; bound by the Doc-3 §3.6 forbidden-actions wall), `staff_super_admin` (all; every action audited+flagged). Verification Admins hold no finance-read slugs; Support Admins hold no private-RFQ slugs; routing viewers monitor routing and matching results but never decide vendor selection.
```

Binding rules (freeze-level):

1. **`staff_can_view_routing`** authorizes routing/matching governance **reads only** — routing
   log, matching results (staff leg), routing-rules list/detail. It widens **no** tenant-side
   disclosure: `matching_results` and the routing log remain internal-service/Admin-only, never
   tenant-vendor-visible (Doc-4E §E5/§E6 non-disclosure invariants unchanged).
2. **`staff_can_manage_routing`** authorizes routing-governance **writes** — human-assisted
   routing and the routing-rule control plane — and is bound by the Doc-3 §3.6 FIXED
   forbidden-actions wall (may never bypass blacklist/eligibility/verification/trust).
3. **`staff_super_admin` remains the break-glass superset** (every action audited+flagged),
   never a standing team grant — unchanged by this patch.
4. View does not imply manage; manage does not imply any other staff slug.

## D2-07.2 — Catalog-size note

Staff permission slug catalog expanded from 7 to 9 (effective Doc-2 v1.0.8). Total slug catalog
43 → **45** (36 tenant unchanged + 9 staff). The Doc-6C realization assertions (§5.1 /
CHK-6-062, currently "43-slug (36 tenant + 7 staff)" per `Doc-6C_Patch_v1.0.1`) are corrected by
a **carried Doc-6C overlay at seed-realization time (W2-IDN-7)** — recorded, not executed here.

# Downstream resolution (recorded, not edited here)

- **Doc-4E** §E6.5/§E6.6 Authorization Matrices + H.3 (`Doc-4E_PassB_Part3_v1.0_FROZEN.md`):
  the "nearest enumerated `staff_super_admin` / `[ESC-RFQ-SLUG]` carried" bindings flip to
  `staff_can_manage_routing` at **W4 M3 realization** (frozen files untouched today).
- **Doc-5E** open-items row (`Doc-5E_SERIES_FROZEN_v1.0.md:78`): closes by pointer at **W4 M3
  realization**.
- **Identity catalog seed** (`prisma/migrations/…identity_catalog_seed`): the two slugs enter
  the seeded catalog with the **W2-IDN-7** conformance WP (+ Doc-6C count overlay, D2-07.2) —
  **not** during the in-flight W2-IDN-6.x reviews (stable-target rule).
- **Admin console** (`docs/product/requirements/admin_console_fe_implementation_plan.md` §4):
  P-ADM-19/20/21 stop being authorization-ESC-blocked; wiring remains **Wave 5 / Phase B**
  gated. That plan self-resolves via the registry at wiring time.
- Decision record: `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md`. Registry:
  `esc_registry.md` → `ESC-RFQ-SLUG` (registered + ✅ RESOLVED 2026-07-10).

---

*Additive patch: coins exactly two staff permission slugs — no wire token, no event, no
contract, no state, no table, no ownership change. The frozen Doc-2 base file is never edited
in place. APPROVED & FOLDED per owner ruling 2026-07-10; registered in
`generatedDocs/00_AUTHORITY_MAP.md`.*
