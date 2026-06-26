# Doc-8F — Integration & Event-Flow Conformance Suite — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-8F Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8F = the **Integration & Event-Flow conformance suite**; consumes the frozen **Doc-8B harness** (incl. the outbox observer/drainer §7) by pointer |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0 §8` + Appendix A bands **A** + **F** (`CHK-8-050…053`). **Oracle:** `Doc-2 §8` (event ownership/emitters) · `Doc-4J` (authoritative event catalog) · `Doc-4L` (cross-module event-flow map) · `core.outbox_events` (`Doc-6B`) · Invariant #7. Consumes `Doc-8B` (outbox observer/drainer §7 + mocked Inngest) by pointer |
| Authority | `Doc-8A` governs; `Doc-2 §8`/`Doc-4J`/`Doc-4L` are the oracle. Doc-8F **coins nothing, coins zero events** — a red test = code defect, or `[ESC-8-CORPUS]`/`[ESC-8-API]` (never weaken) |
| Freeze evidence | `Doc-8F_Structure_Freeze_Audit_v1.0.md` (PASS) + `Doc-8F_Content_Freeze_Audit_v1.0.md` (APPROVE; 8 dimensions PASS; 0 open BLOCKER/MAJOR/MINOR) |

---

## Effective set (the authoritative Doc-8F)

| Artifact | Role |
|---|---|
| `Doc-8F_Structure_v1.0_FROZEN.md` | Frozen structure — F1 (catalog-inventory-driven) + F2 (outbox-observer atomicity) + F3 (execution-readiness), §0–§7 |
| `Doc-8F_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-8F_Content_v1.0_Pass1.md` (+ `Pass1_Patch_v1.0.1`) | §0–§3 — control · event-catalog inventory · cross-module boundary · write-plus-emit atomicity |
| `Doc-8F_Content_v1.0_Pass2.md` (+ `Pass2_Patch_v1.0.1`) | §4–§7 — payload/dispatch/fan-out · consumer-effect locality · composition (8E/8D) · conformance |
| `Doc-8F_Content_Freeze_Audit_v1.0.md` | Content freeze certification (APPROVE) |

*(No `Doc-2`/`Doc-4` patch was required to freeze Doc-8F — it coins nothing, coins zero events. A coined event / catalog defect / `Doc-2 §8`↔`Doc-4J` divergence surfaces as `[ESC-8-CORPUS]`.)*

---

## What Doc-8F fixes (the integration/event-flow conformance suite)

- **F1 catalog-inventory-driven** — event inventory **derived from the frozen `Doc-4J` catalog + `Doc-4L` flow**; **completeness ≡ Doc-4J catalog** (zero events coined), bidirectional `Doc-2 §8` cross-check (a §8↔Doc-4J divergence between frozen docs is `[ESC-8-CORPUS]`).
- **Band F checks:** **cross-module boundary** (`CHK-8-050`: static import-graph [only `contracts/` importable] + 8D DDL FK cross-ref + through-contracts construction — no invented runtime probe) · **write-plus-emit atomicity** (`CHK-8-051`: the business write + the operation's declared event set (per `Doc-2 §8`, 0/1/N) commit/rollback **together**; via the Doc-8B outbox observer + savepoint; dispatch is §4, not §3) · **payload/dispatch/fan-out** (`CHK-8-052`: payload ⊆ `Doc-4J`; `pending→dispatched` via the drainer tick, archival a distinct retention step, `status` forward-only/DELETE-blocked; fan-out to exactly the `Doc-4L` consumers at the map's granularity) · **consumer-effect locality** (`CHK-8-053`: a consumer writes only its own schema; forward via contracts).
- **Composition (§6):** **firewall-via-events** (no consumer reacts to a signal-change event by cross-mutating a peer signal — `Doc-4L` routing + Doc-8E's criterion) · **non-disclosure-via-events** (no distinguishing event for an excluded vs non-matched vendor — Doc-8D §5.4 criterion, buyer-private/`Doc-6F`-deferred). 8F **composes**; 8E/8D **define**.
- **F2 atomicity via the Doc-8B outbox observer/drainer** (the Band-F enabler built into the harness) — a real commit boundary, no live async runtime.
- **F3 execution-readiness:** oracle frozen now (authored-not-run); the `core.outbox_events` mechanics + the 8D-DDL static FK ready; emitters/consumers/import-graph need code (deferred); non-disclosure-via-events needs `Doc-6F`; none silently dropped.

## Carried items

`DR-8-HARNESS` **consumed** (Doc-8B, outbox observer/drainer + mocked Inngest) · `[ESC-8-CORPUS]` (coined event / catalog defect / §8↔Doc-4J divergence — flag-and-halt, **never weaken, never coin an event**) · `[ESC-8-API]`/`[ESC-8-POLICY]` (by pointer, named channel).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 MAJOR + 1 MINOR + 1 NIT; 1 REJECTED) → Patch v0.1.1 + short re-review → Structure Freeze Audit (PASS) → FROZEN. Content: Pass-1 (§0–§3), Pass-2 (§4–§7) — each authored → Board Hard Review → Patch v1.0.1 → short closure check (each 0 open BLOCKER/MAJOR/MINOR; 2 findings REJECTED-as-false upheld) → Content Freeze Audit (APPROVE; 8 dimensions PASS).

---

*Doc-8F (Integration & Event-Flow Conformance Suite) is FROZEN. A catalog-inventory-driven suite over the frozen Doc-4J catalog + Doc-4L flow; atomicity via the Doc-8B outbox observer; composes 8E (firewall-via-events) + 8D (non-disclosure-via-events); coins nothing, coins zero events. On any conflict with the frozen corpus, the corpus wins; flag-and-halt — never weaken an assertion, never coin an event. Doc-8 program: 6 of 7 frozen (8A/8B/8C/8D/8E/8F); only Doc-8G (Frontend/E2E) remains, awaiting the Doc-7 surfaces.*
