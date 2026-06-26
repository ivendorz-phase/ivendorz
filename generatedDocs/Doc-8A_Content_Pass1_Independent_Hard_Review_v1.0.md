# Doc-8A — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8A_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · Reference-Never-Restate · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 OBSERVATION + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-1 Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

Programmatically confirmed against the frozen corpus:

- `Doc-5 Governance Note §6` (**Conformance Rules** — line 94), `§7` (**Escalation / Flag-and-Halt** — line 103), `§3` (source-of-truth), `§8 rule 5` (sibling program — line 131) — all exist; §0.1/§0.3/§0.4/§3.4 cite them correctly.
- `Doc-6A §3` (**Cross-Cutting Schema Conventions** — `id UUIDv7` PK + `human_ref`; dependency `Doc-4B` ID service — frozen lines 72–74) — **verified**. The Pass-1 §4.3 anchor correction (structure's "`Doc-6A §7`" → `§3`) is CORRECT: frozen `Doc-6A §7` is Outbox & Event-Persistence (line 89). Good proactive catch.
- `Doc-3 §12` (`*.list_page_size_max`), `Doc-5A §6.2` (error taxonomy at fixed status), `Doc-2 §6/§7`, CLAUDE.md §2/§4/§5/§8 (AI code needs Supervisor OR human review — necessary-not-sufficient), Invariants #5 (Users Act/Orgs Own) / #7 (One Module One Owner) — all correctly invoked.

0 BLOCKER, 0 MAJOR. §0–§4 are reference-never-restate-clean, mechanism-only (no test code), and the dual-relation framing (downward gate / upward-subordinate / necessary-not-sufficient) is correctly and consistently stated. The `[ESC-8-CORPUS]` never-weaken discipline (§0.4/§3.4) is the strongest part of the pass. Findings below are two attribution/precision defects, one freeze-record observation, one nit.

---

## Findings

### MINOR-1 — §3.4 attributes the "zero-skip" rule to R11; it derives from R4/§3.4 (never-weaken), not R11 (flakiness/determinism)
§3.4 closes: *"A skipped/relaxed conformance test is treated as a red (**R11 zero-flaky/zero-skip discipline** — detail §10)."* **Verified:** structure **R11** governs *isolation, determinism, and zero **flaky** tolerance* ("a non-deterministic test is a defect"); it says nothing about **skipping**. The prohibition on skipping/relaxing a conformance test to hide a defect is the **R4 / §3.4 never-weaken** rule. Conflating them mis-sources the discipline.
**Required fix:** re-attribute — *"a skipped, relaxed, or deleted conformance test is a weakened test (R4/§3.4) and is treated as a red; zero **flaky** tolerance is the separate R11 determinism discipline (detail §10)."* Keep both; source each correctly.

### MINOR-2 — §4.1 borrows the Doc-6/Doc-7 "consistency obligation" language for Doc-8, which has no such formal obligation
§4.1 says the active-org fixture model is realized *"(… consistency with the `Doc-5C` active-org surface, by pointer)."* **The "consistency-not-conformance" obligation is a Doc-6/Doc-7 construct** (`governance §8 rule 5`) describing how those *sibling realization* programs relate to the Doc-5 API surface. Doc-8 does not *realize a surface consistent with* Doc-5 — it **conforms to** the corpus (Doc-2 §6 tenancy + CLAUDE.md §5 active-org) and **verifies** the Doc-5C realization. Importing "consistency with the Doc-5C surface" mis-frames Doc-8's relation.
**Required fix:** reword to *"the active-org model the fixtures seed against is the runtime's, anchored in `Doc-2 §6` + CLAUDE.md §5 and realized by M1 (`Doc-5C`, by pointer); Doc-8 **verifies** that realization, it does not hold a consistency-obligation to it."* Removes the borrowed framing.

### OBSERVATION-1 — the corrected structure anchor must reach the freeze of record, not only this pass
Pass-1 correctly fixes the frozen structure's imprecise "`Doc-6A §7`" → `§3` (§4.3 + header). Because the **structure is FROZEN**, the correction lives only in a content pass today. To prevent the imprecise anchor persisting in the freeze of record, the eventual `Doc-8A` SERIES_FROZEN manifest (or a structure erratum note) should carry this anchor correction explicitly (additive — never an edit of the frozen structure).
**Suggested handling:** log it now as a one-line **carried erratum** (`ERR-8A-1: structure R11/§4 "Doc-6A §7" → "Doc-6A §3 + Doc-4B"`), to be folded into the SERIES_FROZEN manifest at content freeze. Not a gate.

### NITPICK-1 — §3.1 overloads "gate" (an Appendix-A band *and* the CI merge-gate)
§3.1's terminology table defines **gate** as both "a band of Appendix A" and "the CI merge-gate (R11)." Two distinct mechanisms under one term invites ambiguity in Doc-8C…8G.
**Suggested fix:** split — **freeze-gate** = an Appendix-A band a suite passes to freeze; **merge-gate** = the CI control that blocks code on a red suite (R11). Or keep "gate" generic and qualify at each use.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§0.1 places Doc-8 **below** Doc-5/6/7, but Doc-8 **tests** them — a tester below its subject is backwards; Doc-8 should sit above or beside the realizations it gates."* | **REJECTED (false).** Two different axes, conflated. In the **source-of-truth hierarchy** Doc-8 is subordinate to the realization contracts it verifies (it may not redefine a Doc-5/6/7 contract — §0.3 upward-subordinate), so it correctly sits **below** them. In the **gate direction** Doc-8 is a downward gate over **Code** (Code must pass its suites — §0.3 downward gate). The diagram (§0.1) places Code below Doc-8, which is exactly right. Gate-direction (over Code) ≠ authority-direction (under the contracts). No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §3.4 "zero-skip" mis-sourced to R11 | MINOR | Pass-1 Patch — re-attribute to R4/§3.4 |
| MINOR-2 §4.1 borrowed "consistency obligation" framing | MINOR | Pass-1 Patch — reword to conform/verify |
| OBSERVATION-1 corrected anchor must reach freeze of record | OBS | Pass-1 Patch — log `ERR-8A-1` carried erratum |
| NITPICK-1 "gate" overloaded | NIT | Pass-1 Patch — split freeze-gate / merge-gate |

**Gate (governance §8 rule 1 + §6 conformance-at-each-gate):** a content pass is approved with no open BLOCKER/MAJOR/MINOR. 2 MINOR open → **Pass-1 Patch required**, then short closure check, then Content Pass-2 (§5–§9).

*End of Independent Hard Review (Content Pass-1). Nothing coined; no frozen document edited. All challenged anchors verified against the frozen corpus (governance §6/§7/§8 rule 5; Doc-6A §3 ID convention vs §7 outbox; CLAUDE.md §8 review rule).*
