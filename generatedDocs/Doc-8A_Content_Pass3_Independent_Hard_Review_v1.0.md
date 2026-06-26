# Doc-8A — Content Pass-3 (§10–§12 + Appendix A) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8A_Content_v1.0_Pass3.md` (§10–§12 + Appendix A `CHK-8-xxx`) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · R-coverage audit · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-3 Patch → short closure check → Content Freeze Audit |

---

## Anchors & coverage verified CORRECT

- §10–§12 bind every convention by pointer (R11/R12; CLAUDE.md §8 review rule — verified; `Doc-4B`/`Doc-6A §3`/`Doc-6B` ID-service chain — verified per Pass-1 `ERR-8A-1`).
- Appendix A check oracles spot-checked: `CHK-8-014` → `Doc-4A §9.7` (verified CHK-087); `CHK-8-024` → `Doc-6A R8/§4` (verified); `CHK-8-051` → `Doc-6A §7` outbox (verified); `CHK-8-052` → `Doc-4J`/`Doc-4L` (verified); `CHK-8-064` → `Doc-2 §0.4` (verified).
- **R-coverage map (R2,R4,R6,R7,R8,R9,R10,R11,R12 → checks):** R2→001/002 · R4→003/073 · R6→024 · R7→030–033 · R8→040–042 · R9→050–053 · R10→060–065 · R11→070–073 · R12→080/081. **Nine of twelve R's covered.** R1 (program shape) and R3 (tooling) are Doc-8A-meta, not per-suite gates — acceptable (see NITPICK-1). **R5 is NOT covered — see MINOR-1.**
- The Pass-1/Pass-2 fixes are correctly carried into the checklist: `CHK-8-073` (zero-skip → R4/§3.4), `CHK-8-031` (firewall oracle = CLAUDE.md §4 + M5/Doc-6G, audit corroborates), `CHK-8-065` (one-criterion/two-layer).

0 BLOCKER, 0 MAJOR. The checklist is well-structured and oracle-anchored. Two real defects: an orphaned R and a miscount.

---

## Findings

### MINOR-1 — **R5 (test-data & tenancy) has no Appendix-A check** — orphaned ratified decision
Structure **R5** mandates: test data seeded **through contracts/seed paths, never by hand-mutating another module's tables** (One Module, One Owner inside the harness), and **≥2 organizations** for any tenant-scoped suite. §4.1/§4.2 author the convention, but **no `CHK-8-xxx` asserts it** — Band C (CHK-8-025) and Band F (CHK-8-050) cover the *production* no-cross-schema/contracts-only rules, not the *test-harness* seeding discipline. A suite could hand-`INSERT` another module's rows in a fixture and still pass every current check. The self-check's own claim ("confirm 31 checks cover all R1–R12 with no orphaned R") is falsified by R5.
**Required fix:** add to **Band H** (or a Band C/H seam) — e.g. `CHK-8-074`: *"Test data seeded through contracts/seed paths, never by hand-mutating another module's tables (R5; One Module One Owner in harness); ≥2 orgs seeded for any tenant-scoped suite (R5/R6)."* Oracle: R5 · §4.1/§4.2.

### MINOR-2 — Appendix-A total miscounted: stated "31 checks," actual count is 38
The footer states *"Total: 31 checks across 9 bands."* **Verified count:** A=3, B=6, C=6, D=4, E=3, F=4, G=6, H=4, I=2 → **38**. The stated 31 is wrong.
**Required fix:** correct the total to **39** after adding `CHK-8-074` (MINOR-1): 38 existing + 1 = 39. Restate "39 checks across 9 bands (A–I)."

### NITPICK-1 — R1 and R3 silently absent from the R-coverage; state they are Doc-8A-meta, not per-suite gates
R1 (program shape) and R3 (test tooling) have no `CHK-8-xxx`. This is **correct** — R1 is the partition (asserted by Doc-8A's own structure, §1/§12), and R3's concrete tooling is `[ESC-8-TOOLING]` (a Board ratification, not a per-suite assertion). But the omission is silent and could read as a gap.
**Suggested fix:** add a one-line note under Appendix A: *"R1 (program shape) and R3 (tooling selection) are Doc-8A-meta — asserted by this metastandard / resolved via `[ESC-8-TOOLING]` — not per-suite `CHK-8-xxx` gates."*

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"`CHK-8-031` cites `M5/Doc-6G`, which is not frozen — a frozen checklist may not reference an unfrozen oracle; remove the reference."* | **REJECTED (false).** Per-suite **oracle-readiness** (§1.2) explicitly permits a check whose oracle freezes later: the check is **defined now** but **evaluated when its owning suite freezes** (Doc-8E firewall freezes when its oracle M5/Doc-6G is ready). The frozen **corroboration** (`Doc-6A §8` audit `actor_type`) is available immediately. Precedent: Doc-6A Appendix A defined checks for tables realized per-module later. Defining the check early is correct and necessary; removing it would orphan R7's enforcement. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 R5 orphaned — no test-data/tenancy check | MINOR | Pass-3 Patch — add `CHK-8-074` |
| MINOR-2 Appendix-A total miscounted (31 → 39) | MINOR | Pass-3 Patch — correct total |
| NITPICK-1 R1/R3 meta-status unstated | NIT | Pass-3 Patch — add meta note |

**Gate (governance §6/§8 rule 1):** approved with no open BLOCKER/MAJOR/MINOR. 2 MINOR open → **Pass-3 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-3). Nothing coined; no frozen document edited. R-coverage audited (R5 orphan found); check count re-tallied (38 actual vs 31 stated); oracle anchors spot-verified against the frozen corpus.*
