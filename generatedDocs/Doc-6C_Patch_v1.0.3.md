# Doc-6C Additive Patch v1.0.3 — Permission-Slug Count Overlay (43 → 45; Editorial)

| Field | Value |
|---|---|
| **Patches** | Doc-6C (M1 `identity` schema realization) — v1.0.2 → **v1.0.3** |
| **Class** | **Editorial count correction — additive patch.** No schema, DDL, RLS, semantic, state, event, or contract change. No slug renamed or removed; the two staff slugs added are content-authored by Doc-2 §7 as patched v1.0.8 (not coined here). |
| **Authorized by** | Human owner/Architecture Board ruling, 2026-07-10 — `ESC-RFQ-SLUG` **APPROVED** (decision record `governanceReviews/BOARD-DECISION-RFQ-SLUG_v1.0.md`; corpus fold `generatedDocs/Doc-2_Patch_v1.0.8.md` PATCH-D2-07). Doc-2 v1.0.8 §4 carries this Doc-6C count overlay as the **W2-IDN-7** realization (precedent `Doc-6C_Patch_v1.0.1`). |
| **Raised by** | Doc-4E Pass-A Independent Hard Review **PA-05** → `[ESC-RFQ-SLUG]`; realized at W2-IDN-7 (the M1 catalog-conformance gate). |
| **Frozen text** | Doc-6C Pass-1…3 files are NOT edited. This patch is the corrective overlay; on any conflict between this patch and the base assertion lines below, **this patch governs the count; Doc-2 §7 (as patched v1.0.8) governs the slug content.** |

## 1. The correction

Doc-2 §7 — which Doc-6C §5 binds as the sole authoritative, exhaustive slug list — was extended by
`Doc-2_Patch_v1.0.8` (PATCH-D2-07) with **two platform-staff routing-governance slugs**
(`staff_can_view_routing`, `staff_can_manage_routing`; both `space='staff'`). The effective catalog
grows from the `Doc-6C_Patch_v1.0.1` count (43 = 36 tenant + 7 staff) to **45 = 36 tenant + 9 staff**.

| Location (base text — unedited) | Was (per `Doc-6C_Patch_v1.0.1`, effective) | **Is (per this patch)** |
|---|---|---|
| `Doc-6C_Content_v1.0_Pass2.md` §3.5 (line 74) | "45 slugs (§5) — 38 tenant + 7 staff" *(the base "45/38" was itself a propagated counting error; the effective count was 43/36/7 per v1.0.1)* | **"45 slugs — 36 tenant + 9 staff"** |
| `Doc-6C_Content_v1.0_Pass2.md` §5.1 (line 169–170) | "45 slugs … 38 tenant + 7 staff" → v1.0.1 "43 slugs … 36 tenant + 7 staff" | **"45 slugs … 36 tenant + 9 staff"** |
| `Doc-6C_Content_v1.0_Pass2.md` Coins row (line 9) + Review Disposition (line 193/209) | "45 permission slugs" | **"45 permission slugs (36 tenant + 9 staff)"** |
| `Doc-6C_Content_v1.0_Pass3.md` Appendix A **CHK-6-062** | v1.0.1 "43 slugs … by pointer" | **"45 slugs … by pointer"** (the attestation is by-pointer; the pointer's enumeration is now 45) |
| Any Doc-6C figure derived from a slug count | 43 / 45(38) | **45 (36 tenant + 9 staff)** |

**T6-OBS-3 (RV-0159):** the base §3.5 prose literal "45 (38/7)" now coincides with the total (45)
but its **breakdown is stale** — the real arithmetic is **36 tenant + 9 staff**, NOT 38 + 7. The
`+2` are staff slugs (the routing pair), not tenant slugs; the tenant count is unchanged at 36.

## 2. What does NOT change

- **Doc-2 §7 (as patched v1.0.8) is untouched and remains the sole content authority** for slug
  names, spaces, and bundle-default (O/D/M/F) mapping cells. This patch corrects a *count
  assertion*, never content; the two new slugs are Doc-2 v1.0.8's, not coined here.
- **Invariant #2** holds and is strengthened: the two routing slugs are `space='staff'` and are
  mapped to **no** org role bundle (the staff space is separate — Doc-2 §7 / v1.0.8 §3). The
  4 system bundles (`Owner`/`Director`/`Manager`/`Officer`), the seed mechanics (Doc-6C §5.2), and
  every DDL/RLS artifact of Doc-6C stand unchanged. The tenant count (36) and the 103 bundle-mapping
  rows are unchanged.
- `Doc-6C_Patch_v1.0.1` (count) and `Doc-6C_Patch_v1.0.2` (`display_name`) stand; this patch chains
  on them.

## 3. Effect

`W2-IDN-7` realizes: the forward-only routing-slug seed migration
(`20260710160000_identity_routing_slugs_seed`, +2 `staff` slugs, on no bundle) → the catalog is
**45 (36 tenant + 9 staff)**; the 8E conformance suite pins 45/36/9 and discriminating-tests the
routing-slug-on-no-bundle guard.

**Coordinator follow-up (NOT executed by this file):** register this patch in
`generatedDocs/00_AUTHORITY_MAP.md` (Doc-6C series row → v1.0.3 + patch-chain row) — a governance-file
edit outside the module agent's lane.

---
*Additive patch; the frozen base files are never edited in place. Authorized by the human owner per
CLAUDE.md §7/§8 (`ESC-RFQ-SLUG` ruling 2026-07-10, folded as Doc-2 v1.0.8; this Doc-6C overlay carried
to W2-IDN-7). Coins nothing.*
