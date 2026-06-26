# Doc-8A — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8A_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · No Architecture Redesign · No Ownership Reallocation |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 2 MAJOR + 2 MINOR open; 2 NITPICK; 1 OBSERVATION; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT (sample)

Programmatically confirmed against the frozen corpus:

- `Doc-5_Program_Governance_Note_v1.0 §8 rule 5` — **verified verbatim** (line 131): "The sibling Doc-6 / Doc-7 / **Doc-8** programs are authored after Doc-5A and their contracts must be **consistent with the API surface established by the Doc-5 program** — but Doc-5A does not have conformance authority over those programs. Planning for Doc-6/7/8 may proceed in parallel (not hard-blocked)." Doc-8A's consistency-not-conformance posture + parallel-proceed sequencing are CORRECT and explicitly sanctioned.
- `Doc-5_Program_Governance_Note §1` (purpose), `§3` (source-of-truth hierarchy), `§6` (conformance rules), `§7` (escalation — flag-and-halt / never invent), `§8` (freeze rules, rule 1 = no freeze with open BLOCKER/MAJOR/MINOR) — all exist and are the right anchors.
- `Doc-6A R8` + `§4` (Tenancy & RLS Realization Model) — **verified verbatim** (frozen lines 32, 77): "the positive/negative/cross-tenant RLS test obligation is **Doc-8's** gate (by pointer)" + non-disclosure byte-equivalence (`buyer_vendor_statuses`/`link_suggestions` never exposed). R6 correctly inherits this delegated gate.
- `Doc-5A §5.6` (envelope), `§6.2` (error taxonomy at fixed status), `§8` (cursor pagination) — correct anchors for R4/§5 (consistent with the Doc-6A/Doc-7A usage).
- CLAUDE.md `§2` (stack: Next.js 15 / TS / Prisma / Supabase / Inngest; RLS-as-backstop), `§4` (5 firewalled governance signals), `§5` (12 invariants; Users-Act/Orgs-Own; client org ID never trusted), `§8` (AI code needs AI Coding Supervisor OR human review — necessary-not-sufficient) — CORRECT bases for R5/R6/R7/R11.
- `Doc-2 §0.4` currency (BDT default, per-field) · Invariant #11 (private exclusion / byte-equivalence) · `Doc-4M` (state authority) · `Doc-4J`/`Doc-4L` (event catalog / flow map) — correctly invoked for R6/R8/R9/R10.

0 BLOCKER. The R-set spine (R1–R12), the test-discipline partition, the oracle-by-pointer rule, and the "conformance harness yet subordinate to its oracle" framing are structurally sound and reference-never-restate is largely honored. The findings below are two coverage/ownership gaps and two anchor/precision defects.

---

## Findings

### MAJOR-1 — The migration-test obligation Doc-6A §11 explicitly delegates to Doc-8 has **no named owner** in the partition
`Doc-6A_Structure_v1.0_FROZEN §11` (frozen line 105) states verbatim: *"The migration test/CI obligation is **Doc-8's** (by pointer)."* This covers **migration conformance** — forward-only sequencing, expand-contract / non-destructive on authoritative tables (Invariant #8; destructive only on the `ai.*` cache), seed-migration verification (POLICY keys + role seeds), and Prisma-codegen integrity (`generated-contracts-registry/`). Doc-8A's six-suite partition (8B harness · 8C contract · 8D persistence/RLS · 8E domain · 8F integration · 8G FE) names **no owner** for migration conformance. This is exactly the orphaned-coverage defect the proposal itself claims to forbid ("every realization layer has a named owning suite, so no realization layer is left unverified") — a frozen, delegated obligation with no home.
**Required fix:** assign migration conformance an explicit owner. Cleanest: widen **Doc-8D** to *"Persistence, Migration & RLS Conformance"* (it already owns the Doc-6 schema oracle), adding a partition-row clause for forward-only / expand-contract / non-destructive-on-authoritative / seed-migration / codegen-integrity, citing `Doc-6A §11`. Add a matching Appendix-A check to the persistence/RLS band. (Alternative: a standalone migration row — rejected as heavier; migration conformance is persistence-adjacent.)

### MAJOR-2 — Cross-cutting conformance concerns (invariant firewall, RLS gate, non-disclosure) are exercised across multiple suites with **no single-defining-owner allocation** → split-owner divergence risk
The proposal's own cross-discipline note says the RLS/non-disclosure gate is asserted in **8D and re-asserted in 8G**, and the invariant firewall (8E) is "exercised through contract suites (8C) and integration suites (8F)." Without an allocation rule binding them, the **same** conformance concern can be authored twice, divergently — the One-Module-One-Owner defect re-emerging at the suite layer (identical to the Doc-7A MAJOR-1 embedded-component split-owner finding). Risk: two non-equivalent byte-equivalence assertions; a firewall test in 8E that drifts from the one in 8F.
**Required fix:** add an explicit **cross-cutting conformance-concern allocation table** to the partition (the Doc-7A MAJOR-1 precedent): each cross-cutting concern (RLS positive/negative/cross-tenant byte-equivalence; non-disclosure; the 5-signal firewall; each Core Invariant) names its **single defining suite** (where the canonical assertion lives) and its **composing suites** (which exercise/compose it without redefining). State that a composing suite **invokes** the defining suite's assertion, never re-implements it — so the oracle is asserted once. Promote genuinely-unresolved allocations to `[ESC-8-SCOPE]`.

### MINOR-1 — RLS-gate anchor conflates two distinct Doc-6A obligations (`§11` is migration, not RLS)
R6 and §6 cite the RLS positive/negative/cross-tenant byte-equivalence gate as delegated by *"Doc-6A R8 / §4 / §11"* (and Appendix A repeats `Doc-6A R8`). **Verified:** the **RLS** gate delegation is in `Doc-6A R8` + `§4` (frozen lines 32, 77); `Doc-6A §11` (frozen line 105) delegates the **migration** test obligation — a *different* obligation (now MAJOR-1). Citing §11 for the RLS gate is an anchor error.
**Required fix:** in R6/§6/Appendix A, cite the RLS gate as **`Doc-6A R8 / §4`** only; move the `§11` citation to the new migration-conformance scope (MAJOR-1). (Note: the roadmap's forward reference "Doc-6A §4.4/§11.5" points at *content-pass* subsection numbering; the structure-level anchors are R8/§4 for RLS and §11 for migration.)

### MINOR-2 — "seedable UUIDv7" is technically imprecise — determinism comes from the seeded clock, not a seeded UUID
R11/§4 require a *"seedable UUIDv7 ID source"* for determinism. UUIDv7 is **time-derived** (it embeds a millisecond timestamp); a "seeded UUID" is a contradiction in terms. Reproducibility is achieved by feeding the M0 UUIDv7 ID service (Doc-4B; deterministic per `Doc-6A §7`) a **seeded/injected clock**, or by using **fixed-UUID fixtures** for assertion stability.
**Required fix:** restate as *"a deterministic ID provider — the M0 UUIDv7 service (Doc-4B) fed the seeded test clock — or fixed-UUID fixtures where an assertion pins a specific ID."* Keep the seedable-clock requirement; drop the "seedable UUIDv7" phrasing.

### NITPICK-1 — R3 names specific candidate frameworks in the R-set body → keep the ratified-decision row coinage-clean
R3's body parenthetical names Vitest/Jest, Playwright, pgTAP. Tooling is genuinely unpinned by the Master Architecture and **does** need Board selection (unlike the Doc-7A Bengali/English locale coinage, which had no such need) — so naming candidates is defensible. But for R-set hygiene, the candidate list belongs in the **`[ESC-8-TOOLING]` carried-item row**, not the ratified-decision R3 body. Move it; R3 keeps only the principle (TS tooling over the fixed runtime; specific frameworks ratified at freeze).

### NITPICK-2 — "above Code" authority phrasing risks reading as Doc-8 *defining* code behavior
The authority row and §0 place Doc-8 "above Code (code MUST pass Doc-8 suites to merge)." Correct as a **gate**, but combined with "conformance harness" it can misread as Doc-8 being an authority that *defines* behavior. Add one clause (consistent with R4): Doc-8 is a **downward gate** over implementations (Code/realizations must pass) but **upward-subordinate** to its oracle (it asserts only corpus-declared behavior); the gate is **necessary, not sufficient** — AI code also clears AI Coding Supervisor/human review (CLAUDE.md §8).

### OBSERVATION-1 — Oracle-readiness varies by suite; make the sequencing note per-suite
The proposal's sequencing note says 8A + 8B proceed now and 8C/8D/8G "freeze as their oracle surfaces freeze." More precisely: **8C** (oracle = frozen Doc-5) and **8E** (oracle = frozen Doc-2/3/4M + invariants) are **oracle-ready now**; **8D** (Doc-6 — mid-program, only 6B frozen), **8F** (needs the realized outbox table from Doc-6B + Doc-7 has none), and **8G** (Doc-7 — only 7A structure-frozen) **partly await** their oracle. Not a defect — but §1/the sequencing note should state per-suite oracle-readiness so the freeze order is unambiguous. (Carried as guidance, not a gate.)

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"Doc-8 calls itself 'the conformance harness' yet also 'subordinate to its oracle' — a conformance authority cannot be subordinate; this is a contradiction that must be resolved before freeze."* | **REJECTED (false).** No contradiction — two **different relations**. Doc-8 holds conformance authority **downward** over implementations (Code and the Doc-5/6/7 realizations must pass its suites to merge — a gate) while being **subordinate upward** to its oracle (the frozen corpus, which it may assert but never redefine — governance §3 source-of-truth + §8 rule 5). The same dual relation every test harness has: it gates the code, it obeys the spec. Conflating the two directions is the error. No change beyond the NITPICK-2 clarification. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 migration-test obligation (Doc-6A §11) orphaned — no owning suite | MAJOR | Structure Patch — widen Doc-8D scope + Appendix-A check |
| MAJOR-2 cross-cutting conformance concerns split with no single-defining owner | MAJOR | Structure Patch — add conformance-concern allocation table |
| MINOR-1 RLS-gate anchor conflates `Doc-6A §11` (migration) with R8/§4 (RLS) | MINOR | Structure Patch — re-anchor RLS = R8/§4; §11 = migration |
| MINOR-2 "seedable UUIDv7" technically imprecise | MINOR | Structure Patch — deterministic ID provider via seeded clock |
| NITPICK-1 R3 names candidate frameworks in R-set body | NIT | Structure Patch — move list to `[ESC-8-TOOLING]` row |
| NITPICK-2 "above Code" risks reading as defining behavior | NIT | Structure Patch — one clause (downward gate / upward-subordinate) |
| OBSERVATION-1 per-suite oracle-readiness | OBS | Structure Patch — clarify sequencing note |

**Gate:** a structure may freeze only with no open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 2 MAJOR + 2 MINOR open → **Structure Patch required**, then short re-review to confirm closure, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. All challenged anchors verified against the frozen corpus (governance §8 rule 5 line 131; Doc-6A R8/§4 RLS-gate lines 32/77; Doc-6A §11 migration delegation line 105; CLAUDE.md §2/§4/§5/§8).*
