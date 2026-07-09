# Doc-6C Additive Patch v1.0.1 — Permission-Slug Count Correction (Editorial)

| Field | Value |
|---|---|
| **Patches** | Doc-6C (M1 `identity` schema realization) — FROZEN v1.0 → **v1.0.1** |
| **Class** | **Editorial count correction — additive patch.** No schema, DDL, RLS, semantic, state, event, or contract change. No slug added, removed, or renamed. |
| **Authorized by** | Human owner/Board ruling, 2026-07-09 — `ESC-IDN-SLUGCOUNT` **Option A** (Board packet: `governanceReviews/BOARD-PACKET-IDN-SLUGCOUNT_v1.0.md`) |
| **Raised by** | Agent M1, W2-IDN-2 Flag-and-Halt at `c21c38f` (evidence: `governanceReviews/milestones/w2-idn-2/HANDOFF-NOTE.md` §3/§4) |
| **Frozen text** | Doc-6C Pass-1…3 files are NOT edited. This patch is the corrective overlay; on any conflict between this patch and the base assertion lines below, **this patch governs the count; Doc-2 §7's enumeration governs the content.** |

## 1. The correction

Doc-2 §7 — which Doc-6C §5 itself binds as the sole authoritative, exhaustive slug list — 
**enumerates 43 distinct permission slugs: 36 tenant (`space='tenant'`) + 7 staff
(`space='staff'`)** (verified by manual row-walk and exhaustive slug-pattern extraction; the one
duplicate citation `can_manage_vendor_profile` appears in two rows but is one slug). The figure
"45 (38 tenant + 7 staff)" that appears in Doc-6C's assertion lines was a **propagated counting
error**: no source asserting 45 enumerates it, and all of them cite Doc-2 §7, which does not
substantiate it.

| Location (base text — unedited) | Was | **Is (per this patch)** |
|---|---|---|
| `Doc-6C_Content_v1.0_Pass2.md` §5.1 (line 169) | "45 slugs — 38 tenant + 7 staff" | **"43 slugs — 36 tenant + 7 staff"** |
| `Doc-6C_Content_v1.0_Pass3.md` Appendix A **CHK-6-062** | attests "45 slugs … by pointer" | attests **"43 slugs … by pointer"** (the attestation was always by-pointer; the pointer's enumeration is 43) |
| Any other Doc-6C figure derived from "45"/"38 tenant" | 45 / 38 | **43 / 36** |

Ruled out as sources of two additional slugs (Flag-and-Halt evidence): Doc-2 patches
v1.0.3/v1.0.4/v1.0.5, PATCH-10 (folded into base text), Master System Architecture §13.1/§13.3.

## 2. What does NOT change

- **Doc-2 §7 is untouched and remains the sole content authority** for slug names, spaces, and
  bundle-default (O/D/M/F) mapping cells. This patch corrects a *count assertion*, never content.
- The 7 staff slugs, the 4 system bundles (`Owner`/`Director`/`Manager`/`Officer`), the seed
  mechanics (Doc-6C §5.2 conflict clauses, System actor, idempotency), and every DDL/RLS artifact
  of Doc-6C v1.0 stand unchanged.
- Downstream execution docs (`docs/backend/backend_build_plan.md`, `backend_execution_playbook.md`)
  are living companions synced to this patch in the same change set.

## 3. Effect

`W2-IDN-2` resumes: the seed realizes **exactly the 43 slugs Doc-2 §7 enumerates** (36 tenant +
7 staff) + 4 bundles + the Doc-2 §7 mapping; the 8E conformance suite pins 43/36/7.

---
*Additive patch; the frozen base files are never edited in place. Authorized by the human owner
per CLAUDE.md §7/§8 (Option A ruling, 2026-07-09). Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
