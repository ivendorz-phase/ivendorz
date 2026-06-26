# Doc-7A — Content Pass-3 (§10–§12 + Appendix A) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7A_Content_v1.0_Pass3.md` (§10–§12 + Appendix A) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Coverage Audit (R1–R12 ↔ checks) |
| Verdict | **NOT YET PASS** — 1 MAJOR + 3 MINOR + 1 NITPICK open; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Freeze Audit |

---

## Coverage audit — R1–R12 ↔ Appendix A checks

| R | Covered by | OK? |
|---|---|---|
| R2 realize-never-redecide | CHK-7-080/081 | ✅ |
| R3 stack | — *(none)* | ❌ MINOR-2 |
| R4 Doc-5 consistency | CHK-7-001/002/003/004 | ✅ |
| R5 Content≠Presentation | CHK-7-020/021 | ✅ |
| R6 active-org | CHK-7-010/012 | ✅ |
| R7 authz UX | CHK-7-011 | ✅ |
| R8 non-disclosure | CHK-7-040/041/042 | ✅ |
| R9 state machine | CHK-7-030/031 | ✅ |
| R10 AI | CHK-7-050/051 | ✅ |
| R11 baseline | CHK-7-060/061/062/063 | ✅ |
| R12 out-of-frontend | CHK-7-070/071 | ✅ |
| Structure embedded-component single-owner rule (allocation table / DR-7-SHELL) | — *(none)* | ❌ MAJOR-1 |

§10–§12 token-bindings (currency `Doc-2 §0.4`, Storage/Realtime CLAUDE.md §2/`Doc-2 §9`, governance §8) verified CORRECT. 0 BLOCKER.

---

## Findings

### MAJOR-1 — Appendix A has no check for the embedded-component single-owner rule
The structure's load-bearing fix (Structure Patch C-1) requires that a shared embedded component (trust badge, notification center, RFQ thread, billing indicator, AI panel) is **defined once** in its defining document and **composed, never re-implemented**, by surfaces — and the **contract owner is the module regardless of where it renders**. Appendix A has **no check** enforcing this. A surface (Doc-7F/7G) could re-implement the notification center or thread and **pass the freeze gate undetected**, defeating the structural rule.
**Required fix:** add a check (Band A or a new Band J — Composition):
> `CHK-7-005` — Shared embedded components are **consumed by reference from their single defining document** (Doc-7B/7C per the structure allocation table); a surface **never re-implements** one; the contract owner is the module (`Doc-5x`) regardless of render location. Source: structure Program-partition allocation table; DR-7-SHELL.

### MINOR-1 — Appendix A check total is wrong (says 25; actual 24)
Recount: Band A 4 + B 3 + C 2 + D 2 + E 3 + F 2 + G 4 + H 2 + I 2 = **24**, not "25 checks." A freeze gate's inventory must be exact.
**Required fix:** correct to the true count after MAJOR-1 lands (24 + `CHK-7-005` = **25**, which then makes the stated total correct — but state it as the *computed* sum, not a guessed number).

### MINOR-2 — R3 (stack) has no dedicated check
R3 (Next.js 15 App Router + React + Tailwind + shadcn/ui; RSC default; server-actions write path) is realized but unchecked. It is largely a **Doc-7C/7B infrastructure property**, not a per-surface variable — but the gate should say so rather than silently omit it.
**Required fix:** either add a check, or add an Appendix A note: *R3 is realized once as Doc-7C/7B infrastructure (App Shell + kit) and verified at their freeze; per-surface docs inherit it (Server-Component default is checked by `CHK-7-063`).* Make the omission deliberate and documented.

### MINOR-3 — Appendix A applicability to the non-surface docs (Doc-7B/7C) is undefined
Appendix A is framed as the "**per-surface** freeze gate," but Doc-7B (Design System) and Doc-7C (App Shell) are **cross-cutting, not surfaces** — several checks (e.g. `CHK-7-001` "every screen maps to a contract") do not apply to a component kit that authors no screen.
**Required fix:** add an applicability rule — cross-cutting docs (Doc-7B/7C) run the **applicable subset** of Appendix A (the checks their scope touches); the surface docs (Doc-7D…7H) run the **full set**. A check that does not apply is marked **N/A with a one-line reason**, not silently skipped.

### NITPICK-1 — make the intentional check-ID gaps explicit
The IDs are non-contiguous by band (`…004`, `…010`, `…020`, `…080`). This is sensible (reserves room for additive checks) but unstated.
**Required fix:** one line noting the per-band ID ranges reserve gaps for future additive checks; existing IDs are stable and never renumbered.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 missing embedded-component single-owner check | MAJOR | Content Patch — add `CHK-7-005` |
| MINOR-1 check total 25→24(→25 after MAJOR-1) | MINOR | Content Patch — recompute |
| MINOR-2 R3 unchecked | MINOR | Content Patch — note Doc-7C/7B infra |
| MINOR-3 Appendix A applicability to 7B/7C | MINOR | Content Patch — applicability rule + N/A marking |
| NITPICK-1 ID-gap note | NIT | Content Patch — one line |

**Gate:** clears only with 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Content Patch required**, then short closure check, then Content Freeze Audit → Doc-7A FROZEN.

*End of Content Pass-3 Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a real gate-coverage gap (the embedded-component single-owner rule was unenforced).*
