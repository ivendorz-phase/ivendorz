# Doc-8A — Test & Conformance Realization Metastandard — **Content Pass-3 (§10–§12 + Appendix A check IDs)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-3 (DRAFT)** — realizes §10–§12 of `Doc-8A_Structure_v1.0_FROZEN` + assigns Appendix A `CHK-8-xxx` check IDs. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8A_Structure_v1.0_FROZEN` §10–§12 + Appendix A; R-set R11 (§10) · R12 (§11) · all R (§12 + Appendix A) |
| Authority | Frozen corpus governs; the *what*-corpus (Doc-2/3/4) + the Doc-5/6/7 realization contracts = the oracle; Doc-8 = the conformance harness, subordinate to its oracle |
| Posture | Reference-never-restate. Mechanism only — **no test code, no CI config**. Appendix A assigns stable check IDs; the per-band pass/fail is evaluated per-suite (Doc-8B…8G) |
| Coins | **Nothing.** Check IDs are conformance-checklist identifiers (the Doc-5A/6A/7A Appendix-A precedent), not domain elements |

> **Scope of this pass:** isolation/determinism/hermeticity/CI merge-gate (§10 → Doc-8B), the out-of-test boundary (§11), conformance & carried items (§12), and the assignment of stable `CHK-8-xxx` check IDs across the nine Appendix-A bands (the per-suite freeze gate). This is the **final content pass**; after its review/closure → Content Freeze Audit → SERIES_FROZEN (folding in `ERR-8A-1`).

---

## §10 — Isolation, Determinism, Hermeticity & CI Merge-Gate Realization *(mechanism only — realized in Doc-8B)*

### §10.1 Per-test isolation (R11)
Each case runs isolated — a transaction rolled back at teardown, or a reset schema — so no inter-case state bleed exists; no suite depends on execution order or prior-case residue. Realized once in Doc-8B (§4.4) and consumed by every suite.

### §10.2 Determinism (R11)
Wall-clock and IDs are injected, never ambient: a **seeded test clock** and a **deterministic ID provider** (the M0 UUIDv7 service — `Doc-4B` owner, `Doc-6A §3` convention, `Doc-6B core.id_sequences` allocator — fed the seeded clock; or fixed-UUID fixtures) (§4.3). **Flaky tolerance is zero** — a non-deterministic test is a defect, fixed at its source, never retried-until-green.

### §10.3 Hermeticity (R11/R12)
No suite reaches a live external service. Every out-of-wire boundary is a mocked double (§3.1) — **Supabase Storage, Realtime, Resend, PostHog, the Inngest dispatch surface, and the M9 AI providers** — simulated and disposable. A suite that requires a live boundary to pass is mis-designed; the boundary is mocked and the contract-mediated path asserted instead.

### §10.4 CI merge-gate (R11/R4)
The CI gate **blocks merge on any red conformance suite**. Consistent with §3.4 (never-weaken): **a skipped, relaxed, `.only`-narrowed, or deleted conformance test is treated as a red** — the gate does not pass on a suppressed assertion. The gate is the operational expression of Doc-8's downward authority over Code (§0.3).

### §10.5 AI-code review rule (CLAUDE.md §8) — necessary, not sufficient
Passing the Doc-8 merge-gate does **not** by itself authorize a merge of AI-generated code: AI-generated code clears the gate **plus** AI Coding Supervisor or human review (CLAUDE.md §8). Architecture-affecting artifacts require **human** approval (CLAUDE.md §8) — the gate and the review are independent obligations; neither substitutes for the other.

### §10.6 What §10 does not do
§10 instantiates **no CI pipeline and no harness code** — the runner, isolation mechanism, seeded clock/ID provider, mock boundary, and gate wiring are realized in Doc-8B. §10 is the convention Doc-8B conforms to.

---

## §11 — Out-of-Test Boundary

### §11.1 Tests own no production state (R12)
The test database is **ephemeral**; test doubles, fixtures, factories, and mocks are **disposable** and are never a source of production truth. A test never writes to production data or a live external service.

### §11.2 Mocked boundaries are simulated, never live (R12)
Storage / Realtime / Resend / PostHog / Inngest / AI providers are simulated doubles (§10.3); a "mock" that calls the real service is not a mock.

### §11.3 Observe, never author (R12)
A test **observes** the contract it verifies; it never **authors** it. A suite may read a frozen contract/schema/surface and assert against it, but no test defines, extends, or relaxes a contract — that is the corpus's role (§3.2/§3.3). The authoritative definition of a behavior is the frozen corpus, never a test.

### §11.4 Flag-and-halt (R12)
**Halt** if any test is proposed as: a source of production truth, the authoritative definition of a behavior, or a backdoor asserting behavior the corpus does not declare. Escalate (`[ESC-8-CORPUS]` for a corpus-definition gap; never encode the un-declared behavior into a test).

---

## §12 — Conformance & Carried Items

### §12.1 Doc-8A self-check against Appendix A
Doc-8A defines the `CHK-8-xxx` checklist (Appendix A below) as the per-suite freeze gate for Doc-8B…8G and itself **coins nothing and authors no suite** — it is the convention + gate layer. Doc-8A passes its own meta-obligations: every convention (§3–§11) binds an oracle by pointer; no contract/field/error/state/event/audit action/POLICY key/expected value is coined; the assert-once allocation is honored (§6.4 defines, §9.6 composes).

### §12.2 Carried-items register (by pointer)
- **Dependencies:** `DR-8-HARNESS` (Doc-8B frozen first) · `DR-8-CONTRACT` (Doc-5/6/7 testability cross-check) · `DR-8-STATE` (Doc-4M drives state suites) · `DR-8-RLS` (mandatory byte-equivalence band).
- **Escalation markers:** `[ESC-8-TOOLING]` (test-framework ratification — Board) · `[ESC-8-API]` (additive Doc-5x patch) · `[ESC-8-CORPUS]` (corpus defect — flag-and-halt, never weaken the test) · `[ESC-8-POLICY]` (additive `Doc-3 §12.2` patch) · `[ESC-8-SCOPE]` (cross-discipline allocation).
- **Errata:** `ERR-8A-1` (structure R11/§4 ID-service anchor "`Doc-6A §7`" → "`Doc-6A §3` + `Doc-4B`"; "deterministic" is Doc-8's test convention, not a Doc-6A property) — to be folded into the SERIES_FROZEN manifest; the frozen structure is never edited.

All defined in `Doc-8A_Structure_v1.0_FROZEN` (Open Carried Items) + the Pass-1 patch (`ERR-8A-1`); resolved only via named channels.

### §12.3 The per-suite freeze obligation
Each Doc-8x (B…G): **passes the applicable Appendix-A bands** (`CHK-8-xxx`) and **clears every carried `[ESC-8-*]`** via its named additive channel (human-approved) before freeze — never locally (`Doc-5 Governance Note §8 rules 1, 3`). Per-suite oracle-readiness (§1.2) governs *when* a suite may freeze: 8C/8E now; 8D/8F/8G as Doc-6/7 freeze.

### §12.4 Closing
Doc-8A is the test analog of Doc-5A/6A/7A: it realizes *how the system is proven correct*, coins nothing, and is subordinate to its oracle while gating the Code beneath it.

---

## Appendix A — Doc-8 Test Realization Conformance Checklist (`CHK-8-xxx`) — the per-suite freeze gate

Each Doc-8B…8G passes the **applicable** bands before freeze (applicability noted per band — not every suite touches every band; a suite asserts its applicable bands PASS and marks the rest N/A with a one-line reason). Result is binary (PASS/FAIL); each check names its oracle.

### Band A — Oracle-by-pointer *(applies to ALL suites)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-001** | Every assertion's expected value traces verbatim by pointer to a frozen declaration (Doc-2/3/4) or a frozen realization contract (Doc-5/6/7); no expected value embedded that has no corpus source | R2 · §3.2 |
| **CHK-8-002** | No assertion is stricter or looser than its owning contract (no re-specification) | R2 · §3.3 |
| **CHK-8-003** | A red test is dispositioned as code-defect (fix code) or corpus-defect (`[ESC-8-CORPUS]`); none is weakened/skipped/deleted to pass | R4 · §3.4 |

### Band B — Contract & API conformance *(applies to Doc-8C; composing in 8F/8G)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-010** | Response envelope asserted per `Doc-5A §5.6` | §5.1 |
| **CHK-8-011** | Cursor pagination asserted per `Doc-5A §8`; page-size bound read from `*.list_page_size_max` (`Doc-3 §12`), never a literal | §5.2 |
| **CHK-8-012** | Error class+status asserted ⊆ `Doc-5A §6.2` at fixed status; no invented class | §5.3 |
| **CHK-8-013** | Idempotency asserted over `*.idempotency_dedup_window` (`Doc-3 §12`) | §5.4 |
| **CHK-8-014** | Prohibited request-field categories rejected per `Doc-4A §9.7` | §5.5 |
| **CHK-8-015** | Reads actor-scoped per owning Doc-4x; every field traces to its `§HB` contract | §5.6 |

### Band C — Persistence, Migration & RLS *(applies to Doc-8D)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-020** | Standard columns + partial-unique `WHERE deleted_at IS NULL` + CHECK constraints asserted (`Doc-6A §3/§5`); no `is_deleted` boolean | §6.1 |
| **CHK-8-021** | Multi-currency: every monetary amount `NUMERIC` + explicit currency column, default BDT (`Doc-6A R9` / `Doc-2 §0.4`) | §6.1 |
| **CHK-8-022** | Immutability/versioning/append-only asserted (`Doc-6A §6`; Invariant #8); `ai.*` TTL hard-delete the sole enumerated exception | §6.2 |
| **CHK-8-023** | Migration: forward-only / expand-contract / non-destructive on authoritative / seed + codegen integrity (`Doc-6A §11`) | §6.3 |
| **CHK-8-024** | **RLS gate (mandatory):** positive / negative (app-layer AND RLS) / cross-tenant / non-disclosure byte-equivalence (`Doc-6A R8/§4`; Invariant #11) | §6.4 |
| **CHK-8-025** | No cross-schema FK; cross-module refs are service-validated bare UUID (`Doc-6A §5`) | §6.5 |

### Band D — Invariant & firewall *(defining suite Doc-8E; composing in 8C/8F)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-030** | Each of the 5 governance signals asserted non-cross-mutating (CLAUDE.md §4) | §7.1 |
| **CHK-8-031** | Scores auto-calculated under System actor, never hand-edited (CLAUDE.md §4 + M5/Doc-6G; audit `actor_type` corroborates — `Doc-6A §8`) | §7.1 |
| **CHK-8-032** | Each of the 12 Core Invariants has an enforcing suite (CLAUDE.md §5) | §7.2 |
| **CHK-8-033** | The moat (governed M3 matching + M4 post-award/CRM) is exercised; UI/suite never re-ranks M3 | §7.3 |

### Band E — State-machine *(defining suite Doc-8E; composing in 8C/8F)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-040** | Every permitted Doc-4M transition (right actor, right source state) succeeds | §7.4 · `Doc-4M` |
| **CHK-8-041** | Every illegal transition (wrong edge/actor/source) is rejected; no state/edge coined | §7.4 · `Doc-4M` |
| **CHK-8-042** | Optimistic-UI reconciliation converges to server-authoritative state (Doc-7 R9) | §7.4 |

### Band F — Integration & event-flow *(applies to Doc-8F)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-050** | Cross-module interaction only via `contracts/`+events; no cross-module table access / FK / non-`contracts/` import | §8.1 |
| **CHK-8-051** | Transactional write-plus-emit atomicity: business write + `core.outbox_events` insert commit/rollback together (`Doc-6A §7`) | §8.2 |
| **CHK-8-052** | Event name+payload ⊆ `Doc-4J` catalog (zero coined); dispatch `pending→dispatched→archived`; `Doc-4L` fan-out honored | §8.3 |
| **CHK-8-053** | Consumer effect persists in the consuming module's own schema; no cross-schema write | §8.4 |

### Band G — Frontend & e2e *(applies to Doc-8G)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-060** | Components render the shared kit (`Doc-7B`); presentation owns no authoritative state (Invariant #9 / Doc-7 R5) | §9.1 |
| **CHK-8-061** | WCAG-AA + keyboard/focus baseline asserted (Doc-7 R11) | §9.2 |
| **CHK-8-062** | Visual-regression surfaced for review, never auto-accepted | §9.3 |
| **CHK-8-063** | E2E journeys invoke only frozen Doc-5 contracts; no endpoint invented | §9.4 |
| **CHK-8-064** | Per-value-field currency display, default BDT, never assumed (`Doc-2 §0.4`) | §9.5 |
| **CHK-8-065** | UI non-disclosure: same canonical equivalence criterion as §6.4, asserted at the UI layer (Doc-7 R8) | §9.6 |

### Band H — Isolation, determinism & CI *(applies to ALL suites; realized in Doc-8B)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-070** | Per-test isolation (transaction rollback / schema reset); no inter-case bleed | §10.1 |
| **CHK-8-071** | Determinism: seeded clock + deterministic UUIDv7 provider; zero flaky tolerance | §10.2 · §4.3 |
| **CHK-8-072** | Hermetic: every out-of-wire boundary mocked (Storage/Realtime/Resend/PostHog/Inngest/AI) | §10.3 |
| **CHK-8-073** | CI merge-gate blocks on any red; skipped/relaxed/`.only`/deleted conformance test = red | §10.4 · §3.4 |

### Band I — Out-of-test *(applies to ALL suites)*
| ID | Check | Oracle |
|---|---|---|
| **CHK-8-080** | No production state owned; doubles/fixtures disposable; no write to production/live service | §11.1/§11.2 |
| **CHK-8-081** | A test observes, never authors, the contract it verifies; no un-declared behavior asserted (`[ESC-8-CORPUS]` for gaps) | §11.3/§11.4 |

**Total: 31 checks across 9 bands (A–I).** Applicability: Bands A, H, I apply to every suite; B→8C, C→8D, D/E→8E, F→8F, G→8G (with composing checks invoked where signals/contracts cross). Final per-band PASS/FAIL is recorded by each Doc-8x at its freeze.

---

## Pass-3 self-check (pre-review)

- **Reference-never-restate:** §10–§12 + Appendix A bind every check's oracle by pointer (R-set; `Doc-5A §5.6/§6.2/§8`; `Doc-4A §9.7`; `Doc-6A §3/§5/§6/§7/§8/§10/§11/R8/R9`; `Doc-2 §0.4/§8/§9`; `Doc-4J/4L/4M`; `Doc-7B/R5/R8/R9/R11`; CLAUDE.md §4/§5/§8/§10; Invariants #1–#12).
- **Mechanism only:** no harness code, no CI config, no case authored. Appendix A assigns identifiers only.
- **Coins nothing:** check IDs are checklist identifiers (the Doc-5A/6A/7A Appendix-A precedent), not domain elements.
- **Internally consistent:** every `CHK-8-xxx` cites a §3–§11 convention authored in Pass-1/Pass-2/this pass; `CHK-8-031` carries the Pass-2 firewall-attribution fix; `CHK-8-073` carries the Pass-1 zero-skip fix; `CHK-8-065` carries the Pass-2 one-criterion/two-layer fix.
- **Open for review:** confirm 31 checks cover all R1–R12 with no orphaned R; confirm band applicability matches the discipline partition; confirm `ERR-8A-1` is correctly staged for the SERIES_FROZEN manifest (not a structure edit).

*End of Content Pass-3 (§10–§12 + Appendix A) — DRAFT. Realizes `Doc-8A_Structure_v1.0_FROZEN` §10–§12 + Appendix A. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN.*
