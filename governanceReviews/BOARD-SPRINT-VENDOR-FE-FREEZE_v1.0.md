# BOARD SPRINT — Vendor Workspace Design Freeze (`SPRINT-VENDOR-FE-FREEZE`) v1.0

> **A design-companion freeze milestone, not a feature build.** This sprint exists to convene the human
> Architecture Board on the **three BLOCKERs** that are the sole reason the Vendor Workspace design
> companion (`vendor_planning_and_design.md`, v0.9-rc) cannot freeze. It ships no product surface; its
> product is **three recorded rulings** and the companion edits they authorize.

| Field | Value |
|---|---|
| **Type** | Board Sprint (design-companion freeze milestone) |
| **Owner** | **Architecture Board** (presiding authority — CLAUDE.md §7); companion patched by the design author once ruled |
| **Status** | **OPEN — AWAITING D1.** Decision material prepared (the BOARD-PACKET below); convening + rulings are **human** (§8). No ruling authored by AI. |
| **Single objective** | Resolve the **3 BLOCKERs** in [`BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`](BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md) so the companion moves v0.9-rc → freeze (§13: BLOCKER=0 · MAJOR=0 · MINOR=0). Nothing else. |
| **Date opened** | 2026-06-30 |
| **Decision material** | [`BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`](BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md) (the 3 BLOCKERs — conflict · anchors · options · recommendation · blank decision record per entry) · [`DECISION-MATRIX-VENDOR-FE_v1.0.md`](DECISION-MATRIX-VENDOR-FE_v1.0.md) (one-page landscape of all decisions) |
| **Parallel queue (not part of this sprint)** | [`API-GOV-INTAKE-VENDOR-FE_v1.0.md`](API-GOV-INTAKE-VENDOR-FE_v1.0.md) (additive-contract questions — API Governance Board, rank 5; NONE blocks freeze) |
| **Resolves / closes** | `ESC-7G-SCORE-DISPLAY` · `ESC-7B-TRUSTSCORE` · `ESC-7G-A7` (all BLOCKER) |
| **Authority** | CLAUDE.md §7 (Authority Order), §8 (architecture-affecting → **human approval**), §11 (Flag-and-Halt), §13 (Raise ≠ Accept) |
| **Change class** | **Additive only** — companion patch always; an additive Doc-7B/Doc-7C/corpus patch **only if** a ruling requires one (human-approved). Never an edit that reopens a frozen decision. |

---

## 1. Why a sprint (and not three loose escalations)

The three BLOCKERs share one trait: each turns on a **rank-0 frozen artifact** (the Master System
Architecture's Invariant 6; Doc-5G; the frozen Doc-7B kit; the Doc-7A/7C shell mandate), so none is
AI/skill-resolvable (§7/§8/§11 — an AI must never pick a winner between two rank-0 readings). They are
also **interlinked** — `ESC-7B-TRUSTSCORE` is a strict child of `ESC-7G-SCORE-DISPLAY` — so they are best
ruled together, in order. They are the **only** items the §13 freeze gate needs a human to resolve;
everything else from Track 2/3 was engineering-resolved or routed to the API Governance Board (the
parallel queue, by pointer). Problem statements + re-verified anchors live in the BOARD-PACKET (not
restated here).

## 2. Objective

Obtain a **recorded ruling** on each of the three BLOCKERs (Validate-Findings gate: Valid? · Applicable? ·
Best for the product? · Consistent with the frozen corpus?), after which the design author applies the
authorized companion edits and the companion becomes freeze-eligible. Out of scope: the additive-contract
questions (API Governance Board), the corpus-reconciliation items, and any vendor FE **build** (Wave-3-gated).

## 3. Deliverables (strict sequence — each gates the next)

| # | Deliverable | Done when |
|---|---|---|
| **D1** | **Board rulings (×3)** | The human Architecture Board rules each BLOCKER — order: `SCORE-DISPLAY` → `TRUSTSCORE` (its child) → `A7` — and records each in the BOARD-PACKET's per-entry **Decision record**. Recommendations in the packet are **not** rulings. |
| **D2** | **Companion edits applied** | The design author patches `vendor_planning_and_design.md` to match each ruling (DP4 / §3 governance strip / §4.3 / §9.2 kit register / §2.x IA + §12/§13 dispositions), and clears the three from the §12.2 gate tally. Companion-only; conforms upward. |
| **D3** | **Additive patches (only if a ruling requires)** | If a ruling mandates a frozen-kit or shell change (e.g. guarding `trust-badge.score`, or naming the vendor surface-set in Doc-7C), the corresponding **additive Doc-7B/Doc-7C patch + ADR** is drafted as a PROPOSAL and **human-approved + frozen** via the corpus process (§7/§8). No frozen doc edited by AI. |
| **D4** | **Freeze-gate re-audit** | Companion re-audited: BLOCKER = 0. (MAJOR/MINOR: the API-Gov queue items are accepted-with-fallback or carried — confirm none re-classifies to a freeze-blocker.) |
| **D5** | **Freeze v1.0** | Companion stamped **frozen v1.0** (supersedes v0.9-rc); the 3 ESCs marked RESOLVED with the ruling recorded; `esc_registry.md` updated. |

## 4. Recommendations to the Board (Raise ≠ Accept — the Board validates or overrides)

By pointer to the BOARD-PACKET (do not restate): **SCORE-DISPLAY → Option B** (permit the Doc-5G display
score only on the vendor's own-profile Public-Badge read; band-only elsewhere; record that Invariant 6 is
display-silent — no corpus patch); **TRUSTSCORE → Option 1 now** (usage-discipline lint; defer any
frozen-kit guard to the SCORE-DISPLAY ruling); **A7 → Option 1** (ratify "mount-both, grouped; `(vendor)`
is an acceptable non-routing layout group under `(app)`" with a Golden-Rule-7 sign-off). These are
recommendations; the panel rules.

## 5. Exit criteria (Definition of Done)

- ✅ D1–D5 complete, in order; three rulings recorded.
- ✅ Only additive, human-approved patches landed (if any); **no frozen decision reopened**; **coins nothing**.
- ✅ Companion BLOCKER = 0 → frozen v1.0; the 3 ESCs = RESOLVED in `esc_registry.md`.

## 6. Relationship to the API Governance queue (parallel, independent)

The additive-contract questions ([`API-GOV-INTAKE-VENDOR-FE_v1.0.md`](API-GOV-INTAKE-VENDOR-FE_v1.0.md))
move on the **API Governance Board** track and **do not gate this sprint or the companion freeze** — each
ships a conformant fallback. They are listed here only so the two queues are visible together.

## 7. Scope note (this is NOT a platform feature freeze)

Unlike `BOARD-SPRINT-AUDIT-MECH`, this sprint imposes **no feature-work freeze**. It ratifies a
**design companion**; it does not pause the authorized parallel presentation-only FE work or any other
stream. Vendor FE **build** remains Wave-3-gated independently of this design freeze.

## 8. D1 Session Charter

> **A scope-setting charter, not a decision.** It convenes the D1 session and bounds it; it **authors no
> ruling and selects no option** — those are produced in-session and recorded in the BOARD-PACKET.

**Session title:** Architecture Board — D1: Vendor Workspace Design Freeze (3 BLOCKERs)

**Single objective:** Rule `ESC-7G-SCORE-DISPLAY`, then `ESC-7B-TRUSTSCORE`, then `ESC-7G-A7`. Nothing else.

**Review panel** (eight roles — **FE/Design seats included**, as these are frontend/design-system/shell decisions):
1. Architecture Board Chair (presiding — CLAUDE.md §7)
2. Principal Enterprise Architect
3. Principal Frontend Architect (Doc-7A / Doc-7C owner)
4. Design System owner (Doc-7B)
5. Principal Security Architect (governance-signal firewall / disclosure)
6. Trust & Verification (M5) representative
7. API Governance Reviewer
8. Virtual CTO

**Inputs** (read-only; by pointer, never restated): the BOARD-PACKET (per-blocker options + anchors); the
companion §3/§4/§12/§13; the frozen anchors named in the packet (Master §4 Invariant 6; Doc-5G §5.3;
Doc-7A §3.7 / R6; Doc-7B; Doc-7C SR3; `src/frontend/embedded/trust-badge.tsx`).

**Expected outputs** (produced in-session): three rulings (recorded in the BOARD-PACKET decision records);
authorization for the D2 companion edits; authorization for any D3 additive Doc-7B/7C/corpus patch + ADR
(human-approved, frozen via the corpus process) **only where a ruling requires it**.

**Guardrails:** additive only; no frozen decision reopened; architecture-affecting artifacts require
**human approval** (§8). The panel rules; the design author then patches the companion. This charter
selects nothing and designs nothing.

---

*Opened under Flag-and-Halt / Raise ≠ Accept (CLAUDE.md §11/§13). The reviewer frames; the Architecture
Board rules; only validated, additive, human-approved resolutions are implemented. The sprint exits only
when the three BLOCKERs are RESOLVED and the companion freezes.*
