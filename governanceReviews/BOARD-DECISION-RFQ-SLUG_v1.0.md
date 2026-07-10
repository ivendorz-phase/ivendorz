# BOARD DECISION — ESC-RFQ-SLUG · Routing-Governance Staff Permission Slugs

**Status:** ✅ APPROVED — owner/Architecture Board ruling, 2026-07-10
**Channel:** `esc_registry.md` → `ESC-RFQ-SLUG` (registered + CLOSED by this record)
**Raised by:** Doc-4E Pass-A Independent Hard Review finding **PA-05** → carried as
`[ESC-RFQ-SLUG]` in `Doc-4E_PassB_Part3_v1.0_FROZEN.md` (H.3, §E6.5, §E6.6) and
`Doc-5E_SERIES_FROZEN_v1.0.md` (open-items row: "Human-assist / routing-rule admin **slugs**")
**Immediate instrument:** `generatedDocs/Doc-2_Patch_v1.0.8.md` (**PATCH-D2-07**,
Authority-Map-registered; proposal record
`governanceReviews/Doc-2_RoutingGovernanceSlugs_Additive_Patch_PROPOSAL.md`)

## Ruling (owner, 2026-07-10)

Two dedicated platform-staff permission slugs are registered in the Doc-2 §7 catalog
(read/write split — least privilege):

- **`staff_can_view_routing`** — routing/matching governance **reads**: routing log
  (`rfq.get_routing_log.v1`), matching results (`rfq.get_matching_results.v1` staff leg),
  routing-rules list/detail. Realizes standing authorization for the admin monitor surfaces
  P-ADM-19/20/21 — **monitor, never decide** (the frozen RFQ-Operations persona statement).
- **`staff_can_manage_routing`** — routing-governance **writes**: human-assisted routing
  (`rfq.assist_routing.v1`) and the routing-rule control plane (`rfq.manage_routing_rule.v1`);
  bound by the Doc-3 §3.6 FIXED forbidden-actions wall.
- **`staff_super_admin` remains the break-glass superset** (every action audited+flagged),
  never a standing team grant — unchanged.

**Rationale (owner):** the only frozen enumerated slug for routing governance was
`staff_super_admin` (audited break-glass), which blocked standing authorization for routing
monitor/governance surfaces. A read/write split matches Doc-5E's plural carry ("slugs"), the
"monitor routing and matching results but never decide" persona boundary, and least-privilege
doctrine: the ability to observe matching output must not imply the ability to trigger
human-assisted routing. Naming follows the frozen `staff_can_<verb>` convention; PA-05 itself
anticipated `staff_can_manage_routing` as the missing idiom.

## Governance executed today (docs only)

1. This decision record.
2. `governanceReviews/Doc-2_RoutingGovernanceSlugs_Additive_Patch_PROPOSAL.md` — PATCH-D2-07
   proposal (APPROVED & FOLDED by this ruling).
3. `generatedDocs/Doc-2_Patch_v1.0.8.md` — the corpus fold copy (Doc-2 effective v1.0.7 → v1.0.8;
   frozen base file NOT edited).
4. `generatedDocs/00_AUTHORITY_MAP.md` — Doc-2 row → v1.0.8 + PATCH-D2-07 patch-chain row.
   Staff permission slug catalog expanded from 7 to 9 (effective Doc-2 v1.0.8).
5. `esc_registry.md` — `ESC-RFQ-SLUG` registered and marked ✅ RESOLVED (dual pointers: this
   record + the patch instrument).
6. `docs/backend/backend_execution_tracker.md` — carried-items notes (W2-IDN-7 seed carry;
   W4 binding-flip carry).

## Implementation carried (explicitly NOT done today — future sessions must not read these as complete)

- **Prisma identity catalog-seed migration** for the two slugs — lands with the next identity
  catalog WP (natural home: **W2-IDN-7**, the M1 catalog-conformance gate). Includes the
  **Doc-6C count overlay** (slug catalog assertions 43 → 45; staff 7 → 9 — Doc-6C §5.1 /
  CHK-6-062, precedent `Doc-6C_Patch_v1.0.1`).
- **Doc-4E binding flip** — §E6.5/§E6.6 Authorization Matrices + H.3 currently bind
  `staff_super_admin` (nearest) with the `[ESC-RFQ-SLUG]` carry; they flip to
  `staff_can_manage_routing` at **W4 M3 realization** (frozen Doc-4E files untouched today).
- **Doc-5E binding flip** — the open-items row (`Doc-5E_SERIES_FROZEN_v1.0.md:78`) closes by
  pointer at **W4 M3 realization** (frozen Doc-5E untouched today).
- **Admin console wiring** — P-ADM-19/20/21 are **no longer authorization-ESC-blocked** (the
  standing slug now exists in the catalog), but their wiring remains **Wave 5 / Phase B gated**
  per `docs/product/requirements/admin_console_fe_implementation_plan.md` §4 (that plan
  self-resolves via the registry at wiring time; not edited today).

## Notes

- The staff space stays a **separate identifier space** (no org context; enforcement = Identity
  `check_permission`, platform-staff space, Doc-4C §C3/§C8). The view slug does NOT widen
  tenant-side disclosure: `matching_results`/routing-log reads remain internal-service/Admin
  only, never tenant-vendor-visible (Doc-4E §E5/§E6 non-disclosure invariants unchanged).
- No wire token, no event, no contract, no state, no table is coined by this ruling — exactly
  two permission-slug catalog entries.
- Companion ruling of the same sitting:
  `governanceReviews/BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md`.
