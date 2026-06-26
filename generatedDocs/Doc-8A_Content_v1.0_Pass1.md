# Doc-8A — Test & Conformance Realization Metastandard — **Content Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-8A_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short re-review → Content Pass-2 (§5–§9) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8A_Structure_v1.0_FROZEN` §0–§4; R-set R1–R5 + R11 (R1/R2/R4 framing · R5/R11 in §4) |
| Authority | Frozen corpus governs; `Doc-5_Program_Governance_Note_v1.0 §1/§3/§6/§7/§8 (rule 5)`. The full *what*-corpus (Doc-2/3/4) + the Doc-5/6/7 realization contracts = the oracle (binding); Doc-8 = the conformance harness, subordinate to its oracle |
| Posture | Reference-never-restate. Every architectural fact bound by pointer; nothing copied/invented. Mechanism only — **no test code, no fixtures, no assertions, no suite files, no CI config** |
| Coins | **Nothing.** No module, contract, route, field, permission slug, state, event, audit action, POLICY key, or expected behavior |

> **Scope of this pass:** the cross-cutting *foundation* conventions — document control, precedence & the verification obligation (§0), program scope & partition (§1), the test realization stack & authority binding (§2), the cross-cutting test conventions & the oracle-by-pointer rule (§3), and the test-data/tenancy/determinism model (§4). §5–§12 (contract conformance, persistence/migration/RLS, domain/invariant/state, integration/event, frontend/e2e, isolation/CI, out-of-test, conformance) land in Pass-2/Pass-3.
>
> **Anchor correction carried into this pass (for the Board hard review):** the frozen structure (R11/§4) cites the deterministic ID provider as "the M0 UUIDv7 service … *deterministic per `Doc-6A §7`*." Verified: `Doc-6A_Structure_v1.0_FROZEN §7` is **Outbox & Event-Persistence**; the `id UUIDv7` / `human_ref` ID-service convention is **`Doc-6A §3`** (dependency `Doc-4B`, the M0 ID owner), realized physically in `Doc-6B` (`core.id_sequences`). "Deterministic" is **Doc-8's own test-harness convention** (a seeded clock), not a Doc-6A claim. This pass uses the corrected anchor (§4.3) and flags the structure's `§7` reference as an imprecision for additive disposition — no frozen document is edited.

---

## §0 — Document Control, Precedence & the Verification Obligation

### §0.1 Precedence chain (binding)
Doc-8A sits in the Implementation Contract layer of the source-of-truth hierarchy (`Doc-5 Governance Note §3`), beside Doc-5/Doc-6/Doc-7, below Doc-4, above Code:

```
Master System Architecture (CANONICAL)
  └─ ADR Compendium
       └─ Doc-2 · Doc-3
            └─ Doc-4A (API metastandard) → Doc-4B…4M        (domain what + state/event authority)
                 └─ Doc-5A → Doc-5B…5K   (API)   ┐
                 └─ Doc-6A → Doc-6B…6K   (DB)    ├─ realization contracts (under test)
                 └─ Doc-7A → Doc-7B…7H   (FE)    ┘
                      └─ Doc-8A (this) → Doc-8B…8G          (test & conformance realization)
                           └─ Code
```

On any conflict, the higher document wins and Doc-8 is corrected — never the reverse (`Doc-5 Governance Note §3`). Doc-8 introduces nothing architectural (§Program note, structure).

### §0.2 The realize-never-redecide-never-respecify rule (R2)
Doc-2/3/4 fixed *what* the system is; Doc-5/6/7 fixed *how* it is realized — all the binding inputs. Doc-8 realizes only *how those are proven correct*: executable conformance suites. The only *new* decisions Doc-8 makes are **test-infrastructure** choices (harness shape, fixture/factory design, assertion style, mock topology); these **MUST NOT** assert behavior the corpus does not declare, nor a rule stricter or looser than the owning contract. Doc-8 re-decides nothing in Doc-2/3/4 and re-specifies nothing in Doc-5/6/7.

### §0.3 The verification obligation — conformance harness, subordinate to its oracle (R4)
Doc-8 stands in a **dual relation** (structure authority row; the REJECTED-false finding worked this out):

- **Downward — a conformance gate over implementations:** Code and the Doc-5/6/7 realizations **must pass** Doc-8's suites to merge. In this direction Doc-8 has authority — a red suite blocks the merge (§10/R11).
- **Upward — subordinate to its oracle:** Doc-8 asserts **only** corpus-declared behavior and may never redefine a contract, schema, surface, or domain rule (`Doc-5 Governance Note §3` source-of-truth; `§8 rule 5` sibling-program). Every assertion is an **oracle-by-pointer** (§3.2).
- **Necessary, not sufficient:** passing the Doc-8 gate does not by itself authorize a merge — AI-generated code also clears AI Coding Supervisor or human review (CLAUDE.md §8); the gate never substitutes for that review.

This dual relation is load-bearing: *Doc-8 gates the code; Doc-8 obeys the corpus.*

### §0.4 Flag-and-halt (`Doc-5 Governance Note §7`)
Where verification surfaces a gap, Doc-8 **halts and escalates** via the named channel — never invents, never resolves locally. Markers (structure Open Carried Items): `[ESC-8-TOOLING]` (test-framework ratification — Board), `[ESC-8-API]` (a frozen Doc-5x contract not testable as written → additive Doc-5x patch), `[ESC-8-CORPUS]` (**a test reveals a genuine corpus/contract defect — flag-and-halt to the Board; the test is never weakened to hide the defect**), `[ESC-8-POLICY]` (additive `Doc-3 §12.2` patch), `[ESC-8-SCOPE]` (cross-discipline allocation). `[ESC-8-CORPUS]` is the discipline that distinguishes Doc-8 from every other program: testing is where latent corpus defects surface, and the response is escalation, never assertion-weakening (R4).

### §0.5 The two freeze obligations every per-suite document inherits
1. **Pass Appendix A** (`CHK-8-xxx`) — the per-suite conformance checklist (structure Appendix A; check IDs assigned in Pass-3).
2. **Clear every carried `[ESC-8-*]`** via its named additive channel (human-approved) before freeze — never locally (`Doc-5 Governance Note §8 rules 1, 3`).

---

## §1 — Scope, Audience & the Doc-8 Program Partition

### §1.1 What Doc-8A governs (and does not)
Doc-8A governs the **cross-cutting test realization conventions** (§3–§12) and the **per-suite freeze gate** (Appendix A). It **authors no suite**: every actual test case, fixture, factory, and CI configuration is realized in Doc-8B…8G against these conventions (structure §1). Doc-8A is to Doc-8B…8G what Doc-5A is to Doc-5B…5K, Doc-6A to Doc-6B…6K, and Doc-7A to Doc-7B…7H.

### §1.2 Program partition (test-discipline-based) — carried by pointer
The partition is **by test layer / verification discipline**, not by backend module (structure R1) — the Doc-7 precedent: a single conformance concern (the cross-tenant RLS gate, the event-flow suite) spans many modules. The discipline map and the cross-cutting conformance-concern allocation table are fixed in `Doc-8A_Structure_v1.0_FROZEN` (Program partition) and **not restated here**; this pass binds them by pointer. Three facts are load-bearing and re-asserted:

- **DR-8-HARNESS:** Doc-8B (Test Foundation & Harness) is cross-cutting and **freezes before** the suites (Doc-8C…8G) that consume it; suites reference the runner/fixtures/seeding/mock-boundary/CI-gate by pointer, never re-author them.
- **No realization layer is orphaned:** Doc-5 API → 8C; Doc-6 DB + migration → 8D; domain/Doc-4 → 8E; events/Doc-4L → 8F; Doc-7 FE → 8G. Each cross-cutting concern (RLS byte-equivalence, non-disclosure, the firewall, each invariant, state-machine conformance) has a **single defining suite** in the structure's allocation table; composing suites **invoke** that assertion, never re-implement it.
- **Per-suite oracle-readiness governs freeze order:** 8A/8B/8C/8E are oracle-ready now (Doc-5 frozen; Doc-2/3/4M + invariants frozen); 8D/8F/8G partly await their oracle (Doc-6 mid-program — only 6B frozen; Doc-7 only 7A structure-frozen).

### §1.3 Dependency boundary
Doc-8A realizes the corpus + the Doc-5/6/7 conventions; each Doc-8x realizes **only its own discipline**. **One Module, One Owner holds inside the harness** (R5): a suite never authors a second copy of another suite's canonical assertion, and a test for module M never writes module N's tables directly. Cross-cutting concerns live in their single defining suite (per the allocation table) and are composed downstream by invocation.

### §1.4 Carried-dependency register (by pointer)
`DR-8-HARNESS` · `DR-8-CONTRACT` (Doc-5/6/7 testability cross-check) · `DR-8-STATE` (Doc-4M drives state suites) · `DR-8-RLS` (mandatory byte-equivalence band) · `[ESC-8-TOOLING]` · `[ESC-8-API]` · `[ESC-8-CORPUS]` · `[ESC-8-POLICY]` · `[ESC-8-SCOPE]` — defined in `Doc-8A_Structure_v1.0_FROZEN` (Open Carried Items); resolved only via named channels, never in a content pass.

### §1.5 Audience
Architecture Board · Enterprise/DDD/Security Architect (RLS/non-disclosure) · QA/Test lead · Doc-8 content authors (human + AI) · AI Coding Supervisor · backend, frontend, DBA, release engineering.

---

## §2 — Test Realization Stack & Authority Binding

### §2.1 The test transport (TypeScript tooling over the fixed runtime — not re-decided)
Doc-8 realizes tests against the already-decided Master-Architecture runtime (CLAUDE.md §2; structure R3):

| Concern | Realization |
|---|---|
| Runtime under test | **Next.js 15 / TypeScript ≥5 / Prisma / Supabase PostgreSQL / Inngest** (the fixed Master-Architecture stack — CLAUDE.md §2) |
| Test language | **TypeScript** (the same end-to-end language; suites import the typed contracts/clients) |
| Unit / contract runner | **`[ESC-8-TOOLING]`** — candidate (Board ratification, not coined): a TS runner (e.g. Vitest/Jest) |
| Browser e2e driver | **`[ESC-8-TOOLING]`** — candidate: a browser driver (e.g. Playwright) |
| RLS / SQL conformance path | **`[ESC-8-TOOLING]`** — candidate: pgTAP or transactional SQL fixtures against a Supabase test database |
| a11y / visual-regression path | **`[ESC-8-TOOLING]`** — candidate: an a11y + visual-regression toolchain |

The Master Architecture pins **no test framework**; Doc-8 **coins none** (structure R3). The concrete tooling is an implementation choice the Board ratifies at a Doc-8A content/Board step or carries via `[ESC-8-TOOLING]` — the Doc-6A R3(b) precedent (one-Prisma-namespace-per-module). Exact version pins live in `package.json` once code exists.

### §2.2 The harness-centered posture
Every suite runs through the shared Doc-8B harness, which is **deterministic** (a seeded clock + a deterministic ID provider — §4.3), **isolated** (per-test transaction rollback or schema reset — §4.4), and **hermetic** (every out-of-wire boundary mocked — Storage/Realtime/Resend/PostHog/Inngest/AI — detail §10). This posture is the realization vehicle for R5 (test-data/tenancy), R11 (isolation/determinism/CI), and R12 (no production state); the per-convention detail is §4 and §10–§11.

### §2.3 Authority binding (restated operationally)
- **The *what* (binding — the oracle):** the full frozen corpus (Doc-2 entities/state/tenancy/events/audit/currency; Doc-3 §12 bounds; Doc-4J/4L/4M; the 12 invariants + firewall + moat) **and** the realization contracts under test (Doc-5 fields/errors/pagination/idempotency; Doc-6 columns/constraints/RLS; Doc-7 surfaces).
- **The *how* (this program):** the harness, fixtures, assertion conventions, and the per-discipline suites.
- **The dual relation:** Doc-8 is a **downward gate** over implementations and **upward-subordinate** to its oracle (`Doc-5 Governance Note §3/§8 rule 5`); it asserts only corpus-declared behavior (§0.3).

Test-infrastructure choices never assert un-declared behavior (R2). Where a *what* is missing or untestable, flag-and-halt (§0.4).

---

## §3 — Cross-Cutting Test Conventions & the Oracle-by-Pointer Rule *(mechanism only — authors no suite)*

### §3.1 Canonical terminology
To remove ambiguity across Doc-8B…8G:

| Term | Meaning |
|---|---|
| **suite** | a discipline document's test set (one per Doc-8C…8G; the shared harness is Doc-8B) |
| **case** | a single test (one assertion-bearing scenario) |
| **fixture / factory** | a seedable test-data builder (realized in Doc-8B; consumed by every suite) |
| **oracle** | the frozen pointer an assertion verifies against (a Doc-2/3/4 declaration or a Doc-5/6/7 contract) |
| **double / mock** | a simulated out-of-wire boundary (Storage/Realtime/Resend/PostHog/Inngest/AI) — never live (R12) |
| **gate** | a band of Appendix A (`CHK-8-xxx`) a suite must pass to freeze; and the CI merge-gate (R11) |

### §3.2 The oracle-by-pointer rule (R2)
**Every expected value in every assertion traces verbatim, by pointer, to a frozen declaration.** A suite never embeds a "desired" value that is not in the corpus. The oracle is either:

- a **domain *what*** — a Doc-2 entity/column/state/tenancy class, a Doc-3 §12 bound, a Doc-4J event, a Doc-4M transition, a CLAUDE.md §4/§5 invariant/firewall; or
- a **realization contract** — a Doc-5x field/error/pagination/idempotency rule, a Doc-6x column/constraint/RLS policy, a Doc-7x surface behavior.

A page-size assertion binds to `*.list_page_size_max` (Doc-3 §12) **by pointer, never a literal**; an error assertion binds to a `Doc-5A §6.2` class at its fixed status; a state assertion binds to a Doc-4M edge. No oracle is coined.

### §3.3 The no-respecify rule
An assertion may be **neither stricter nor looser** than its owning contract. A test that demands behavior the contract does not require (over-strict) or tolerates behavior the contract forbids (over-loose) is itself a defect — it re-specifies the contract, which Doc-8 may not do (R2/R4). When a suite author believes the contract *should* be stricter/looser, that is a corpus opinion, routed via `[ESC-8-CORPUS]`/`[ESC-8-API]`, never encoded into the test.

### §3.4 Disposition of a red test (the load-bearing Doc-8 discipline — R4)
A failing conformance test is dispositioned exactly one of two ways, never a third:

1. **Code / realization defect** → fix the implementation (the suite stays; Doc-8 wins, the code is brought into conformance). This is the common case.
2. **Corpus / contract defect** (the *declaration itself* is wrong or ambiguous) → `[ESC-8-CORPUS]` / `[ESC-8-API]`: flag-and-halt to the Board for a human-approved additive patch **at the owning document**.

**The test is never weakened, skipped, or deleted to make a red go green.** A skipped/relaxed conformance test is treated as a red (R11 zero-flaky/zero-skip discipline — detail §10).

### §3.5 What §3 does not do
§3 instantiates **no suite and no case** — the per-discipline assertions are realized in Doc-8C…8G; the shared harness in Doc-8B. §3 is the convention layer they conform to.

---

## §4 — Test-Data, Tenancy & Determinism Realization *(mechanism only — realized in Doc-8B)*

### §4.1 Active-org / tenant fixture model — server-resolved, never client-trusted (R5)
Every test seeds and acts through the **same active-organization/tenant model the runtime enforces** (Users Act, Organizations Own — Invariant #5; CLAUDE.md §5):

- The active org is **server-resolved**, never client-trusted — a fixture that forges a client-supplied org ID to bypass resolution is itself a non-conformance to be asserted against, not a shortcut (CLAUDE.md §5; consistency with the `Doc-5C` active-org surface, by pointer).
- **Any tenant-scoped suite seeds ≥2 organizations** — the minimum to prove isolation; a single-org fixture cannot exercise the cross-tenant gate (R6; realized in Doc-8D).
- Standard-column and role/permission seeds follow the realized schema: `id UUIDv7`, the timestamp/actor/tenant/soft-delete tuples (`Doc-6A §3`), and the Doc-2 §7 role/permission seed set.

### §4.2 Through-contracts / seed-only data rule — One Module, One Owner inside the harness (R5)
Test data is created **through contracts or the module's own seed path — never by hand-mutating another module's tables.** A suite for module M may not `INSERT` into module N's schema to set up a precondition; it calls N's contract (or N's seed factory). This preserves One Module, One Owner (Invariant #7) inside the harness exactly as in production, and ensures fixtures exercise the real write path (so a fixture cannot accidentally seed a state the contract would reject).

### §4.3 Deterministic ID & clock (R11) — corrected anchor
Determinism is the root of a non-flaky suite. The harness supplies:

- **A seeded test clock** — wall-clock time is injected, never read ambient; any time-dependent assertion (timestamps, TTL, dedup windows) is reproducible.
- **A deterministic ID provider** — the M0 UUIDv7 ID service (**`Doc-4B`** owner; convention realized in **`Doc-6A §3`**; physical allocator in **`Doc-6B` `core.id_sequences`**) is fed the **seeded clock**, so the time-ordered UUIDv7 values are reproducible across runs; alternatively, **fixed-UUID fixtures** where a case pins a specific ID for an assertion.

*(Anchor note: "deterministic" here is Doc-8's test-harness convention, not a Doc-6A property; the ID-service anchor is `Doc-6A §3` + `Doc-4B` — see the Pass header correction of the structure's `§7` reference.)*

### §4.4 Per-test isolation (R11)
Each case runs **isolated** — either inside a transaction rolled back at teardown, or against a reset schema — so no inter-case state bleed exists. A suite never depends on execution order or on residue from a prior case. The isolation mechanism is realized in Doc-8B and consumed by every suite.

### §4.5 Hermeticity (R11/R12 — forward pointer)
No fixture reaches a live external service: Supabase Storage, Realtime, Resend, PostHog, the Inngest dispatch surface, and the M9 AI providers are **mocked doubles** (§3.1), simulated and disposable. The full hermeticity + CI-gate convention is §10; §4 fixes only that **test data and boundaries are seeded/simulated, never live**.

### §4.6 What §4 does not do
§4 instantiates **no fixture and no factory** — the seeded clock, ID provider, tenant seeder, isolation mechanism, and mock boundary are realized in Doc-8B (Test Foundation & Harness, frozen first per DR-8-HARNESS). §4 is the convention Doc-8B conforms to.

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** every fact bound by pointer — `Doc-5 Governance Note §1/§3/§6/§7/§8 rule 5`; `Doc-2 §6/§7`; `Doc-3 §12` (`*.list_page_size_max`); `Doc-4B` (ID owner); `Doc-4J`/`Doc-4M`; `Doc-5A §6.2` (error taxonomy); `Doc-6A §3` (standard-column/ID convention); `Doc-6B` (`core.id_sequences`); CLAUDE.md §2/§4/§5/§8; Invariants #5/#7. **No contract, field, error class, slug, event, or POLICY key invented.**
- **Mechanism only:** no test code, no fixture, no case authored. §3 instantiates no suite; §4 instantiates no fixture.
- **Coins nothing:** 0 new module/contract/route/field/permission/state/event/audit/POLICY key/expected value.
- **Dual-relation framing correct:** downward gate over implementations / upward-subordinate to the oracle / necessary-not-sufficient — stated in §0.3, §2.3; the `[ESC-8-CORPUS]` never-weaken discipline in §0.4/§3.4.
- **Anchor correction surfaced:** the structure's "deterministic per `Doc-6A §7`" (R11/§4) is corrected to `Doc-6A §3` + `Doc-4B` (verified: §7 = Outbox); flagged in the Pass header + §4.3 for Board disposition — no frozen document edited.
- **Open for review:** confirm `Doc-6A §3` as the canonical ID-service convention anchor; confirm the `[ESC-8-TOOLING]` candidate framing is non-coining (candidates parenthetical, ratified at a Board step).

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-8A_Structure_v1.0_FROZEN` §0–§4. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short re-review → Content Pass-2 (§5–§9).*
