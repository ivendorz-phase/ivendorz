# Doc-8C — Contract & API Conformance Suite — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8C Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8C = the **Contract & API Conformance suite** — the first discipline suite; consumes the frozen **Doc-8B harness** by pointer |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0` §5 + Appendix A bands **A** (`CHK-8-001…003`) + **B** (`CHK-8-010…015`). **Oracle:** the frozen Doc-5 surface (`Doc-5B…5K §HB`) + `Doc-5A §5.6/§6.2/§8/Pass10 §B.1` + `Doc-4A §9.7/§22.1` + `Doc-3 §12`. Consumes `Doc-8B` (runner/fixtures/seeding/clock-ID/mock-boundary+outbox-observer/CI-gate) by pointer |
| Authority | `Doc-8A` governs; the frozen Doc-5 surface is the oracle. Doc-8C **coins nothing** and **asserts only Doc-5-declared behavior** — a red test = code defect, or `[ESC-8-API]`/`[ESC-8-CORPUS]` (never weaken the assertion) |
| Freeze evidence | `Doc-8C_Structure_Freeze_Audit_v1.0.md` (PASS) + `Doc-8C_Content_Freeze_Audit_v1.0.md` (APPROVE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8C)

| Artifact | Role |
|---|---|
| `Doc-8C_Structure_v1.0_FROZEN.md` | Frozen structure — C1 (table-driven, inventory ≡ frozen surface) + C2 (wired-only scope), §0–§9 |
| `Doc-8C_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-8C_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§4 — control · contract inventory · table-driven design + completeness check · envelope · cursor pagination |
| `Doc-8C_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §5–§9 — error taxonomy · idempotency · prohibited-field · actor-scope/field-trace · conformance |
| `Doc-8C_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

*(No `Doc-2`/`Doc-3`/`Doc-5x` patch was required to freeze Doc-8C — it coins nothing. Per-contract `[ESC-8-API]`/`[ESC-8-CORPUS]` surface at execution if a frozen contract proves untestable / defective.)*

---

## What Doc-8C fixes (the API conformance suite)

- **C1 table-driven, provable coverage** — a contract **inventory derived from the frozen `Doc-5x` enumerations** (counts: 5C 42 · 5D 71 · 5E 38 · 5F 50 · 5G 40 · 5H 23 · 5I 33 · 5J 34 · 5K 16 · 5B out-of-wire), cross-checked against `Doc-5A Pass10 §B.1` + the `generated-contracts-registry/` (once code exists); each Band-B check runs over every applicable wired row; the **completeness check asserts inventory ≡ the frozen surface** (no under/over-coverage). Row schema: `contract_id, method, path, namespace, actor, kind, idempotent, emits_event, wired, success_status, hb_pointer, owning_suite`.
- **C2 wired-only scope** — Band B applies to wired caller-facing contracts; out-of-wire (M0 boundary, M3 engine workers, M5/M7 internal services, out-of-wire M9) is N/A-recorded with its `owning_suite` (8F/8D/8E).
- **The six Band-B checks** — envelope (`CHK-8-010`, `Doc-5A §5.6`; 204 exempt per `Doc-4A §22.1 C-05`) · cursor pagination (`CHK-8-011`, `Doc-5A §8`; page-size via `*.list_page_size_max`; seeded > max rows; sort-key index cross-ref Doc-8D) · error taxonomy (`CHK-8-012`, `Doc-5A §6.2` class+status; un-triggerable classes fault-injected or logged, never silently skipped) · idempotency (`CHK-8-013`, `Doc-4A` key + `*.idempotency_dedup_window`; single-effect = no 2nd outbox row for emitters / single state-effect for non-emitters) · prohibited fields (`CHK-8-014`, `Doc-4A §9.7` 10 categories) · actor-scope & field-trace (`CHK-8-015`, owning `§HB` + actor models; present-field→`§HB`-declared).
- **Seam** — Doc-8C asserts contract-declared actor scope at the **API surface**; the **RLS backstop + cross-tenant byte-equivalence** are **Doc-8D's** (`Doc-6A R8/§4`). One behavior, two layer-checks.
- **Authored-not-run** — the suite design + coverage are FROZEN now (oracle = frozen Doc-5); per-assertion PASS/FAIL is recorded at execution once the application code exists.

## Carried items

`DR-8-HARNESS` **consumed** (Doc-8B by pointer) · `DR-8-CONTRACT` **satisfied** (Doc-8C is the Doc-5 testability cross-check; every wired contract asserted or `[ESC-8-API]`-flagged) · `[ESC-8-API]` (untestable/under-specified contract — additive Doc-5x patch, Board) · `[ESC-8-CORPUS]` (genuine Doc-5/Doc-4 defect — flag-and-halt, **never weaken**) · `[ESC-8-POLICY]` (unregistered POLICY key — additive Doc-3 §12.2).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 MAJOR + 1 MINOR + 1 NIT; 1 REJECTED) → Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1 (§0–§4), Pass-2 (§5–§9) — each authored → Board Hard Review → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; 2 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8C (Contract & API Conformance Suite) is FROZEN. A table-driven conformance suite over the frozen Doc-5 caller-facing surface (coverage ≡ the frozen surface); consumes the Doc-8B harness; asserts only Doc-5-declared behavior; coins nothing. On any conflict with the frozen corpus, the corpus wins; flag-and-halt — never weaken an assertion. Next: Doc-8E (Domain/Invariant/State — oracle-ready) and/or Doc-8D (Persistence/RLS — oracle growing: Doc-6B+6C frozen).*
