<!--
Doc-type:  Decision Matrix (Board pre-read; NON-authoritative; one-page landscape).
Subject:   iVendorz Vendor Workspace design companion (vendor_planning_and_design.md, v0.9-rc) - all open decisions.
Produced:  2026-06-30. Recommendations are NOT rulings (Raise != Accept, CLAUDE.md 13). Detail lives in the packets.
-->

# Vendor Workspace — Decision Matrix (Board pre-read) v1.0

The 30-second landscape of **every open decision** for the Vendor Workspace design companion
(`vendor_planning_and_design.md`, v0.9-rc — coverage complete, **freeze WITHHELD**). Full detail per item:
[`BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md`](BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md) ·
[`API-GOV-INTAKE-VENDOR-FE_v1.0.md`](API-GOV-INTAKE-VENDOR-FE_v1.0.md) · companion §12/§13. Convened by
[`BOARD-SPRINT-VENDOR-FE-FREEZE_v1.0.md`](BOARD-SPRINT-VENDOR-FE-FREEZE_v1.0.md).

**Legend** — *Board:* **Arch** = human Architecture Board · **API-Gov** = API Governance Board (§7 r5) ·
**Corpus** = human corpus-reconciliation. *Impact:* effort + blast-radius of acting on the recommendation.
*Freeze?:* does it gate the companion's §13 freeze — **only the three BLOCKERs do.** Recommendations are
**raised, not ruled** (§13).

## 1 · Freeze-gating — Architecture Board (D1; the ONLY path to companion freeze)

| Decision | Board | Recommendation | Impact | Blocks / unblocks | Freeze? | Status |
|---|---|---|---|---|---|---|
| **ESC-7G-SCORE-DISPLAY** | Arch | **Option B** — own-profile display-score; band-only elsewhere; record **Invariant 6 = display-silent** (no corpus patch) | Low | parent of TRUSTSCORE; unblocks dashboard signals (§3), tier badge (§4.3) | **YES** | Awaiting D1 |
| **ESC-7B-TRUSTSCORE** | Arch | **Option 1** — usage-discipline lint now; defer any frozen-kit guard to the SCORE-DISPLAY ruling | Low | child of SCORE-DISPLAY | **YES** | Awaiting D1 |
| **ESC-7G-A7** | Arch | **Option 1** — ratify "mount-both, grouped; `(vendor)` is a non-routing layout group" (Golden-Rule-7 sign-off) | Medium | Vendor routing/IA (§2); sets precedent Buyer Doc-7F inherits | **YES** | Awaiting D1 |

**Decision order:** SCORE-DISPLAY → TRUSTSCORE (its child) → A7 (independent).
**Key reframe for the panel:** Invariant 6 (Master §4:274–276) is a *cross-mutation firewall*, **not** a display rule — so SCORE-DISPLAY is resolvable by *interpretation* (the companion's DP4 over-read it), not by amending the corpus.

## 2 · Contract gaps — API Governance Board (parallel; NOT freeze-gating; each ships a fallback)

| Decision | Board | Recommendation | Impact | Blocks (if declined) | Freeze? | Status |
|---|---|---|---|---|---|---|
| **ESC-7-API** (participation · M1) | API-Gov | **Approve** — additive *wired* participation read | Medium | Buyer/Vendor/Hybrid label (Hybrid UX) | No | Awaiting review |
| **ESC-7G-ENG-01** (`rfq_id` · M4) | API-Gov | **Approve** — project the existing Doc-2 §10 column | Low | engagement→RFQ breadcrumb (E2) | No | Awaiting review |
| **ESC-7G-ENG-03** (doc enumeration · M4) | API-Gov | **Approve** — child-ref projection on `get_engagement` | Medium | E3 documents-tab enumeration (build-blocked) | No | Awaiting review |
| **ESC-7-API** (pipeline count · M4) | API-Gov | **Decline v1** — keep non-numeric "view" links | Low | dashboard numeric tiles only | No | Awaiting review |
| **ESC-7G-Q-DRAFT** (M3) | API-Gov | **Defer** — client-local drafts are conformant | Low | cross-device draft continuity | No | Awaiting review |
| **ESC-7G-ENG-02** (buyer name · M1/M4) | API-Gov | **Optional** | Low | buyer name vs neutral label | No | Awaiting review |
| **ESC-7G-LEAD-NOTE** (M4) | API-Gov | **Decline** — use note-typed `add_lead_activity` | Low | none (fallback clean) | No | Awaiting review |
| **ESC-7G-LEAD-REF** (M4) | API-Gov | **Decline** — render no lead human-ref | Low | none | No | Awaiting review |

## 3 · Corpus reconciliation / watch — human

| Decision | Board | Recommendation | Impact | Blocks | Freeze? | Status |
|---|---|---|---|---|---|---|
| **ESC-7G-LEAD-MACHINE** | Corpus | Reconcile Doc-4M label vs Doc-2/4F/5F (companion binds Doc-2/5F per per-module authority) | Low | none | No | Awaiting corpus |
| **ESC-7G-ENG-04** | Watch | Watch Doc-2 §8 IR-02/IR-03 emit-cardinality | Low | none | No | Watch |

## Bottom line

- **Only the 3 BLOCKERs gate freeze**, and all three sit with the Architecture Board (D1). SCORE-DISPLAY + TRUSTSCORE are **Low** impact (interpretation + lint); A7 is **Medium** (IA precedent).
- The **API-Gov queue is parallel and non-blocking** — every item ships a conformant fallback. The single **High-value Approve** is the participation read; ENG-01/ENG-03 are easy Approves that restore the engagement breadcrumb and the documents tab.
- Nothing here is AI-resolvable: the BLOCKERs are rank-0 interpretation/realization calls (human Board); the contract gaps are additive-contract calls (API-Gov); LEAD-MACHINE is a frozen-vs-frozen reconcile (human). Recommendations are inputs; the Boards rule.
