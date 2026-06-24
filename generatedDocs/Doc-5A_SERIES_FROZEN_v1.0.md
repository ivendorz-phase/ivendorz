# Doc-5A_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5A_SERIES_FROZEN_v1.0` |
| Status | **FROZEN — CONDITIONAL** (effective on Architecture-Board ratification of `PATCH-D5A-STRUCT-02` + `PATCH-D4A-C05-204`) |
| Freeze Date | 2026-06-24 |
| Freeze Authority | `Doc-5A_Freeze_Readiness_Audit_v1.0` — FREEZE-READY (BLOCKER=0 · MAJOR=0 · MINOR=0); 2 approved patches pending ratification |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5A — API Realization Standards. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content is the registered passes + applied patches, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A–4M (FROZEN) → **Doc-5A** → Doc-5B…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0(carried via review records)
```

**Audit Status: FREEZE-READY (conditional on ratification of 2 patches)**

**Governance Status: DOC-5A FROZEN — PENDING RATIFICATION**

Doc-5A is the **API Realization Metastandard** of the Doc-5 family: it fixes *how* the abstract Doc-4 contracts become concrete HTTP APIs, and supplies the conformance checklist (Appendix A) and reserved-namespace registry (Appendix B) that gate every downstream Doc-5B…5M document.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied patches |
|---|---|---|
| Canonical structure / TOC | `Doc-5A_Structure_v1.0_FROZEN.md` | `Doc-5A_Structure_Patch_STRUCT-02.md` (§4 purpose-line wording) |
| §0 Document Control, Precedence & Conformance · §1 Scope, Audience & Family Map · §2 Realization Philosophy & Transport Binding | `Doc-5A_Content_v1.0_Pass1.md` | M6 family-map label `comms`→`communication` |
| §3 Wire Naming & Serialization · §4 Transport Envelope & Standard Header Set | `Doc-5A_Content_v1.0_Pass2.md` | `PATCH-D5A-0D` (§4.4 `Iv-Api-Version` cell aligned to B.4) |
| §5 Endpoint Realization · §6 Error Realization & Status Mapping | `Doc-5A_Content_v1.0_Pass3.md` | 0-B (top-level `reference_id`, §5.6/§6.1) |
| §7 Identity, Context & Authorization | `Doc-5A_Content_v1.0_Pass4.md` | 0-C (§7.2 Binds + `Master §13.5` + `Doc-2 §7`) |
| §8 Pagination, Filtering & Sort | `Doc-5A_Content_v1.0_Pass5.md` | — |
| §9 Idempotency & Concurrency | `Doc-5A_Content_v1.0_Pass6.md` | — |
| §10 Asynchronous Operations | `Doc-5A_Content_v1.0_Pass7.md` | — |
| §11 Event Surface | `Doc-5A_Content_v1.0_Pass8.md` | — |
| §12 API Versioning & Evolution | `Doc-5A_Content_v1.0_Pass9.md` | — |
| Appendix B — Reserved Namespace Registry | `Doc-5A_Content_v1.0_Pass10.md` | B.3 (version-classification removed), B.4 (`Iv-Api-Version` ownership-only), STRUCT-02 + 0-D flags reconciled, B.1 Status column, B.2 non-duplication |
| Appendix A — Conformance Checklist | `Doc-5A_Content_v1.0_Pass11.md` | CHK-5A-042 (C-05 body-bearing), CHK-5A-081/-100 sources, severity model `[B]/[M]/[m]`, ID-range note, GAP-01 resolved |
| Appendix C — Cross-Reference Index | `Doc-5A_Content_v1.0_Pass12.md` | V-01 (Doc-3 §11 removed), C.2 dispositions |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§12, then Appendices A, B, C).
2. **Apply patches** in place at their named section; patch wording supersedes the base pass.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "pending Independent Hard Review" status lines, board self-review notes, and "(later pass)" qualifiers (all referenced sections now exist).
4. **Anchors verbatim** — every `Doc-4A §X` / `Doc-2` / `Doc-3` / `ADR` / `Master Architecture` pointer is preserved exactly; reference-never-restate holds.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5A amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Patches Register

| Patch | Scope | Status |
|---|---|---|
| `PATCH-D5A-STRUCT-02` | Structure §4 purpose-line — remove "pagination cursors" (cursor = request param, `Doc-4A §9.6`) | **APPROVED — pending Board ratification** |
| `PATCH-D5A-0D` | §4.4 `Iv-Api-Version` classification cell aligned to Appendix B.4 (`CHK-5A-153`) | APPLIED (content) |
| `PATCH-D4A-C05-204` | **Doc-4A** §22.1 C-05 clarified — `reference_id` on "every response that carries a body"; `204` exempt | **APPROVED (human ruling) — pending Architecture-Board ratification** (touches rank-0 corpus) |

---

## Pending-Ratification Register (the only open conditions)

| ID | Affected | Item | Status |
|---|---|---|---|
| RAT-01 | `Doc-5A_Structure_v1.0_FROZEN` | `PATCH-D5A-STRUCT-02` wording sync | **PENDING BOARD RATIFICATION** |
| RAT-02 | `Doc-4A` (rank-0 corpus) | `PATCH-D4A-C05-204` C-05 no-body clarification | **PENDING BOARD RATIFICATION** (human-approved) |

Doc-5A's FROZEN status becomes **unconditional** when RAT-01 and RAT-02 are ratified. Review evidence: `governanceReviews/Doc-5A_Freeze_Readiness_Audit_v1.0.md`, `governanceReviews/Doc-5A_CORPUS_GAP_P11-01_reference_id_204.md`.

---

## Downstream Effect

On ratification, Doc-5A is the binding realization metastandard; **Doc-5B…5M** (per-module API realizations, letter map in §1.2) may begin, each gated at freeze by the Appendix A conformance checklist (`CHK-5A-xxx`). Doc-6 (DB), Doc-7 (Frontend), Doc-8 (Tests) planning may proceed in parallel; Doc-8 consumes Appendix A.

---

*Doc-5A program freeze designation. Non-authoring. On any conflict, the registered frozen sources and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
