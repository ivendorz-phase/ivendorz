# Project Instructions — Reconciliation Note v1.0

> **STATUS: RESOLVED — 2026-06-20.** User authorized the in-place edits (overriding the no-self-edit posture for this pass). Applied to `ivendorz_Project_Instructions.md`: R-1a (Current Authorized Work Doc-4I → Doc-4K), R-1b (Doc-2 effective version v1.0.3), precedence chain extended to Doc-4K, and the Current Project Status block refreshed (Doc-4A–4J FROZEN; Doc-4K STRUCTURE FROZEN/Pass-A; Doc-4L not started; Modules 0–8 frozen, Module 9 structure frozen). Companion drift also corrected in `Program_Status_And_Roadmap.md` (§2 Doc-4I row, §3 Thread A closed, §4 Doc-4K progress/next-action). The findings below are retained as the original record.

| Field | Value |
|---|---|
| Document | `Project_Instructions_Reconciliation_Note_v1.0` |
| Nature | **Reconciliation record only.** Surfaces stale labels in `ivendorz_Project_Instructions.md` for the user to fold in. **Not an authoritative override; does not edit the frozen file; does not redefine ownership, DDD boundaries, or any freeze decision.** |
| Authority | `ivendorz_Project_Instructions.md` remains authoritative as-is until the user applies these corrections. On conflict: FLAG-AND-HALT. |
| Date | 2026-06-19 |
| Verified against | On-disk corpus in the project folder + `iVendorz_Context_Pack_v5.md` + `Program_Status_And_Roadmap.md` (the two newest companion docs). |

---

## Why this note exists

`ivendorz_Project_Instructions.md` is the project's authoritative governance file and is to be treated as such. Two of its labels have fallen behind the frozen-on-disk reality as the Doc-4 program advanced (Modules 0–8 now frozen; Doc-4K AI Layer is the current target). Per the project's FLAG-AND-HALT discipline these are **surfaced, not silently edited**. The substance is not in dispute — only stale text — but because the file is governance authority, the corrections are recorded here for the user to apply.

These are stale-label discrepancies (MINOR/NITPICK class), **not** substantive contradictions. No freeze decision, ownership boundary, or DDD rule is affected.

---

## Finding R-1a — "Current Authorized Work" is stale

**Location:** `ivendorz_Project_Instructions.md` → `## Current Project Status` block (near end of file).

**Existing Text (verbatim):**
```
Current Authorized Work:
Doc-4I
```

**Suggested Amendment Text:**
```
Current Authorized Work:
Doc-4K
```

**Rationale.** On disk: `Doc-4J_FROZEN_v1.0.md` exists (Module 8 frozen) and the full Doc-4I (Module 7) review chain is APPROVED. The current target is **Doc-4K — AI Layer (Module 9, `ai`/`ai_`)**, per both newest companion docs. (As of this session, the two missing Doc-4I freeze-merge artifacts — `Doc-4I_PassB_Part2_v1.0_FROZEN` and `Doc-4I_FROZEN_v1.0` — have been generated, so Module 7 is now closed on disk; Doc-4K is unambiguously next.)

**Related (same block):** the per-doc status list shows `Doc-4E … Doc-4H FROZEN` and `Doc-4I/4J/4K` as not-yet-created. On disk, **Doc-4I and Doc-4J are complete/frozen**; only **Doc-4K and Doc-4L** remain unstarted. The "Current priority" list ("Create Doc-4F to 4K") is likewise satisfied through 4J. Recommend updating the status list to: Doc-4A–4J FROZEN; Doc-4K NEXT; Doc-4L not started.

---

## Finding R-1b — Doc-2 version label is stale in the authoritative-docs list

**Location:** `ivendorz_Project_Instructions.md` → `## Authoritative Documents`, item 3.

**Existing Text (verbatim):**
```
3. Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md
```

**Suggested Amendment Text:**
```
3. Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md (+ Doc-2_Patch_v1.0.3.md) — effective version v1.0.3
```

**Rationale.** The same file's `## Current Project Status` block already states `Doc-2  v1.0.3 FROZEN`, and `Doc-2_Patch_v1.0.3.md` is on disk. The frozen corpus (Context Pack, Roadmap, every Doc-4 freeze header) cites **Doc-2 v1.0.3**. The authoritative-docs list at the top still names v1.0.2 only — internally inconsistent with the same file's status block. The base-document filename on disk is `..._v1.0.2.md` (the patch is a separate file), so the suggested text keeps the real filename and clarifies the effective version is v1.0.3.

---

## What was NOT changed

- `ivendorz_Project_Instructions.md` is **untouched** — no in-place edit was made. The two corrections above await the user's decision.
- No frozen governance, ownership boundary, DDD rule, precedence order, or freeze decision is altered by this note.
- This note is non-authoritative and must not be cited as a contract or governance source.

---

*End of Project_Instructions_Reconciliation_Note_v1.0. Reconciliation record only — surfaces two stale labels (R-1a Current Authorized Work → Doc-4K; R-1b Doc-2 effective version → v1.0.3) in the authoritative Project Instructions for the user to fold in. Frozen file left untouched; no governance overridden.*
