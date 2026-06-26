# Doc-8B — Test Foundation & Harness — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8B Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8B is the **shared test foundation & harness** — the first Doc-8 realization, frozen first per `DR-8-HARNESS`; consumed by Doc-8C…8G by pointer |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0` §4 (test-data/tenancy/determinism) + §10 (isolation/determinism/hermeticity/CI) + Appendix A bands **H** (`CHK-8-070…074`) and **I** (`CHK-8-080/081`). Consumes the frozen oracle by pointer: `Doc-2 §6/§7/§9`; `Doc-6A §3/§7/R3b/§11`; `Doc-6B` (`core.outbox_status`, `core.id_sequences`, POLICY seed); `Doc-6C` (org/membership/role-permission seed); `Doc-4B`; `Doc-4L`; CLAUDE.md §2/§5/§8/§10 |
| Authority | `Doc-8A` governs (test metastandard); the frozen corpus governs above. Doc-8B is a Doc-8 realization document (below Doc-8A; beside Doc-8C…8G); coins nothing |
| Freeze evidence | `Doc-8B_Structure_Freeze_Audit_v1.0.md` (PASS; D1 Board-ratified) + `Doc-8B_Content_Freeze_Audit_v1.0.md` (APPROVE FOR FREEZE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8B)

| Artifact | Role |
|---|---|
| `Doc-8B_Structure_v1.0_FROZEN.md` | Frozen structure — D1 (tooling, RESOLVED), section map §0–§9, carried items |
| `Doc-8B_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS; D1 Board-ratified) |
| `Doc-8B_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§4 — control/precedence · scope/partition · tooling stack (D1) · ephemeral test-DB + isolation · fixtures/factories |
| `Doc-8B_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §5–§9 — multi-tenant seeding · seeded clock + deterministic ID · mock boundary + outbox observer · CI merge-gate · conformance |
| `Doc-8B_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

**`ERR-8A-1` (second-order clarification, folded-in):** `core.id_sequences` (`Doc-6B`) is the **`human_ref`** allocator — **not** the UUIDv7 allocator (UUIDv7 is *generated* from clock+random, not sequence-allocated). The corrected Doc-8A ID-service anchor reads: **UUIDv7** = `Doc-4B` owner + `Doc-6A §3` convention (deterministic in tests via the seeded clock); **`human_ref`** = `Doc-6B core.id_sequences` (deterministic via the seeded sequence). Additive clarification; no frozen document edited.

*(No `Doc-2`/`Doc-3`/`Doc-5x` patch was required to freeze Doc-8B — it coins nothing. `[ESC-8-TOOLING]` was resolved at structure freeze by D1, recorded back at the Doc-8A manifest.)*

---

## What Doc-8B fixes (binding on Doc-8C…8G)

- **The shared harness (`DR-8-HARNESS` satisfied)** — runner config, ephemeral test DB, fixtures/factories, tenant seeding, seeded clock + ID provider, mock boundary + outbox observer, CI gate. Doc-8C…8G **consume by pointer**; re-author none.
- **D1 tooling (RESOLVED `[ESC-8-TOOLING]`)** — **Vitest** (unit/contract/integration) + **Playwright** (e2e) + **`@axe-core/playwright`** (a11y) + **Playwright snapshots** (visual) + **TS-native transactional SQL** (RLS); single TypeScript toolchain; pgTAP not selected.
- **Ephemeral test DB** — Supabase Postgres carrying the realized Doc-6 schema + migrations (Prisma `multiSchema`); **transaction-rollback isolation default**, **savepoint/schema-reset opt-out** for Band-F real-atomicity + Band-C RLS role-switching. Schema as of freeze: `core` (6B) + `identity` (6C); further schemas attach as Doc-6D…6K freeze.
- **Through-contracts / seed-only fixtures** (`CHK-8-074`) — factories build via the owning module's realized seed path (now) / contract (when code exists); never a hand-`INSERT` into another module's tables (Invariant #7).
- **Determinism** — seeded clock + the two ID mechanisms (UUIDv7 generated via seeded clock; `human_ref` via seeded `core.id_sequences`); zero flaky tolerance.
- **Hermeticity** — six mocked out-of-wire doubles (Storage/Realtime/Resend/PostHog/Inngest/AI); never live (R12).
- **Outbox observer/drainer (Band-F enabler)** — inspect `core.outbox_events.status` (`core.outbox_status`, forward-only, DELETE-blocked); **dispatch tick** `pending→dispatched` against the mocked Inngest double; **archival** `dispatched→archived` a distinct POLICY-bounded step (`core.outbox_archive_retention`); asserts atomicity + `Doc-4L` fan-out without a live async runtime.
- **CI merge-gate** — blocks merge on any red; skipped/relaxed/`.only`/deleted conformance test = red (never-weaken — Doc-8A §3.4); necessary-not-sufficient (AI code also clears AI Coding Supervisor/human review — CLAUDE.md §8).
- **Band applicability** — Doc-8B satisfies Appendix-A Bands **H/I** directly; **A** and **B–G** N/A (the harness authors no assertion; it provides the means).

## Carried items

`DR-8-HARNESS` **satisfied** (Doc-8B is the provider) · `[ESC-8-TOOLING]` **RESOLVED** (D1) · `ERR-8A-1` honored + second-order clarification folded in · `[ESC-8-API]`/`[ESC-8-CORPUS]`/`[ESC-8-POLICY]` surface only if a downstream suite uncovers a gap (named channel, never local).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (2 MINOR + 1 OBS + 1 NIT; 1 REJECTED) → Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS; D1 Board-ratified) → FROZEN. Content: Pass-1 (§0–§4), Pass-2 (§5–§9) — each authored → Board Hard Review → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; 2 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8B (Test Foundation & Harness) is FROZEN. Realizes the Doc-8A harness conventions as a concrete, consumable test foundation (Vitest + Playwright + TS-native SQL); satisfies DR-8-HARNESS; resolves `[ESC-8-TOOLING]`; coins nothing. On any conflict with Doc-8A or the frozen corpus, the corpus wins; flag-and-halt. Next: the discipline suites Doc-8C…8G consume the harness — 8C (Doc-5)/8E (Doc-2/4M) oracle-ready now; 8D growing (Doc-6B+6C); 8F/8G as their oracles freeze.*
