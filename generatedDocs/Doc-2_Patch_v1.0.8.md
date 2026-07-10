# Doc-2 Additive Patch v1.0.8 (PATCH-D2-07) — §7 Routing-Governance Staff Slugs

| Field | Value |
|---|---|
| **Patches** | Doc-2 (Domain Model & Database Blueprint) — FROZEN v1.0.7 → **v1.0.8** |
| **Class** | **Permission-slug catalog addition — additive.** Extends the §7 platform-staff slug paragraph with two slugs. No new table/column, no state, no event, no contract, no ownership change. |
| **Authorized by** | Human owner/Architecture Board ruling, 2026-07-10 — `ESC-RFQ-SLUG` **APPROVED** (decision record: `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md`; proposal: `governanceReviews/Doc-2_RoutingGovernanceSlugs_Additive_Patch_PROPOSAL.md`) |
| **Raised by** | Doc-4E Pass-A Independent Hard Review **PA-05**; carried as `[ESC-RFQ-SLUG]` in `Doc-4E_PassB_Part3_v1.0_FROZEN.md` (H.3 :31, §E6.5 :264/:269, §E6.6 :320) and `Doc-5E_SERIES_FROZEN_v1.0.md` :78 — routing governance had no dedicated slug; nearest enumerated was `staff_super_admin` (break-glass, never a standing team grant) |
| **Frozen text** | The Doc-2 base file is NOT edited. This patch is the additive overlay; on §7 platform-staff enumeration questions this patch governs. |

## 1. The addition (owner ruling, verbatim substance)

**Base §7 platform-staff paragraph (unedited, line 645):**

```
**Platform-staff slugs (separate space):** `staff_can_moderate_rfq`, `staff_can_verify` (Verification Admin), `staff_can_support` (Support Admin; no private-RFQ read), `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit` (compliance-scoped), `staff_super_admin` (all; every action audited+flagged). Verification Admins hold no finance-read slugs; Support Admins hold no private-RFQ slugs.
```

**Per this patch, the paragraph reads:**

```
**Platform-staff slugs (separate space):** `staff_can_moderate_rfq`, `staff_can_verify` (Verification Admin), `staff_can_support` (Support Admin; no private-RFQ read), `staff_can_ban`, `staff_can_manage_categories`, `staff_can_redact_audit` (compliance-scoped), `staff_can_view_routing` (routing/matching governance reads: routing log, matching results, routing rules — monitor, never decide), `staff_can_manage_routing` (routing-governance writes: human-assisted routing, routing-rule control plane; bound by the Doc-3 §3.6 forbidden-actions wall), `staff_super_admin` (all; every action audited+flagged). Verification Admins hold no finance-read slugs; Support Admins hold no private-RFQ slugs; routing viewers monitor routing and matching results but never decide vendor selection.
```

Binding rules (freeze-level):

1. **`staff_can_view_routing`** — routing/matching governance **reads only** (routing log,
   matching results staff leg, routing-rules list/detail). Widens **no** tenant-side
   disclosure: `matching_results` and the routing log remain internal-service/Admin-only,
   never tenant-vendor-visible (Doc-4E §E5/§E6 non-disclosure invariants unchanged).
2. **`staff_can_manage_routing`** — routing-governance **writes** (`rfq.assist_routing.v1`,
   `rfq.manage_routing_rule.v1`), bound by the Doc-3 §3.6 FIXED forbidden-actions wall.
3. **`staff_super_admin` remains the break-glass superset** (every action audited+flagged),
   never a standing team grant — unchanged.
4. View does not imply manage; manage does not imply any other staff slug.

## 2. Rationale (Board, recorded)

Least-privilege split (read ≠ write) for the M3 moat's control plane: the ability to observe
matching output must not imply the ability to trigger human-assisted routing. Ends the
`staff_super_admin`-as-nearest interim without weakening the forbidden-actions wall or the
non-disclosure invariants. Naming follows the frozen `staff_can_<verb>` convention.

## 3. What does NOT change

- The 36 tenant slugs, the six existing staff slugs, and `staff_super_admin`'s scope stand
  unchanged; no slug is renamed, removed, or re-scoped.
- The staff space remains a **separate identifier space** (no org context; enforcement =
  Identity `check_permission`, platform-staff space, Doc-4C §C3/§C8).
- Doc-4E §E6.5/§E6.6 contract wire shapes; Doc-3 §3.6 forbidden actions; every §E5/§E6
  non-disclosure invariant.

## 4. Effect

- Staff permission slug catalog expanded from 7 to 9 (effective Doc-2 v1.0.8). Total catalog
  43 → **45** (36 tenant + 9 staff).
- **Carried realization (NOT executed by this fold):** (a) identity catalog-seed migration +
  Doc-6C count-assertion overlay (§5.1 / CHK-6-062: 43 → 45; precedent `Doc-6C_Patch_v1.0.1`)
  at **W2-IDN-7**; (b) Doc-4E §E6.5/§E6.6/H.3 + Doc-5E:78 nearest-slug bindings flip to
  `staff_can_manage_routing` at **W4 M3 realization**; (c) admin console P-ADM-19/20/21
  standing authorization unblocked, wiring stays **Wave 5 / Phase B** gated.
- `ESC-RFQ-SLUG` registry row CLOSES on this patch (dual pointers: decision record + this file).

---

*Additive patch; the frozen base files are never edited in place. Authorized by the human owner
per CLAUDE.md §7/§8 (ruling 2026-07-10). Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
