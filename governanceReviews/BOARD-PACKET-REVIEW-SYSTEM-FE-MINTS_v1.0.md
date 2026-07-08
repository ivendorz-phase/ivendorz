<!--
Type:       Board decision packet (request). NON-AUTHORITATIVE until the Board rules.
Status:     FINALIZED 2026-07-08 — ready for human Board. (Supersedes the 2026-07-08 draft:
            reconciled against the now-frozen Admin Console package → net ZERO new page IDs;
            D2 resolved by the corpus. See §2.5.)
Baseline:   Prototype locked as the Visual Design Baseline (VDB v1.0), owner 2026-07-08.
Purpose:    Request the FE-* milestone mints the visually-approved Review System surfaces need,
            and record their placement as FACES of existing pages. Presentation-only scope.
Authority:  Coins nothing. Only the Board may mint FE-* milestones. This packet requests NO new
            page IDs and touches neither the page universe (151) nor the WBS. On any conflict
            the frozen corpus wins (CLAUDE.md §7, §11).
Provenance: docs/product/requirements/review_system_planning_and_design.md (planning package) ·
            prototypes/review-system/ (prototype — VDB v1.0, owner-approved 2026-07-08) ·
            docs/product/requirements/admin_console_planning_and_design.md (frozen; P-ADM owner).
-->

# Board Packet — Review System FE Mints (FINALIZED)

> **What this is:** a request to the Board to (1) mint the **FE-\* milestones** the
> visually-approved Review System surfaces need, and (2) confirm each surface's placement as a
> **face/section of an existing page**. **Scope = presentation-only FE** under the standing
> "parallelization, not reorder" authorization.
>
> **This packet requests no backend and mints no page IDs.** After reconciling with the frozen
> Admin Console package (§2.5), **every one of the five surfaces lands on a page that already
> exists** — so the page universe stays **151** and the WBS coverage ledger is **untouched**
> (`scripts/verify-fe-wbs-coverage.mjs` → `PASS: 151/151`, re-verified 2026-07-08). New FE-\*
> milestone IDs remain **Board-only** to mint (`project-management/fe-program-wbs.md`).

---

## 0. One-page summary

**Where we are.** The Review System planning package (all three rating lanes) passed adversarial
review, and the high-fidelity clickable prototype covering all five surfaces was **visually
approved by the owner on 2026-07-08** and **locked as the Visual Design Baseline (VDB v1.0)** —
Surface 2 = **Option A (testimonial)**, light + dark themes, responsive behaviour, component
hierarchy, typography/spacing, and interaction model all accepted. The design direction is
confirmed; **no build is authorized yet.**

**What finalization changed.** The original draft floated *new* `P-ADM` pages for the staff
surfaces. That is now **foreclosed and unnecessary**: the Admin Console package (frozen,
committed `cfdf4d3`) already defines **`P-ADM-01…29`** — all 29 owned by the **Complete**
`FE-ADM-01` milestone — and **binds review moderation to the existing moderation surface**
(`J-ADM-01`, `P-ADM-02/03/04`, *composes* `trust.moderate_review.v1`). So Surface 3 is the
**review face of `P-ADM-02/03`**, and Surface 5 is a **face of the admin console's not-page-pinned
trust/vendor-governance context** (§12/E6). **Result: 0 new page IDs; universe stays 151.**

**The asks (all placement = faces of existing pages; net page impact = 0):**

| # | Board decision | Recommendation | Page-ID impact |
|---|---|---|---|
| **D1** | Surface 2 = section+anchor of the microsite (`P-PUB-13`) | **Confirm** (matches planning §7) | 0 |
| **D2** | Surface 3 moderation placement | **Resolved by corpus → face of `P-ADM-02/03`** (`J-ADM-01`); new pages would conflict + expand the universe | 0 |
| **D3** | Owner of the staff review legs (S3, S5) | **`FE-ADM-01` owner (Team-3)** — Admin console is built/owned; the legs are a *touch-only* extension | 0 |
| **D4** | Surface 1 buyer submission placement | **Face of engagement detail** (CS "second face" precedent) | 0 |

**Mints requested:** only the **FE-\* milestones** in §5 (all *touch-only* — they own no new
pages, mirroring the `FE-BUY-08` "touches, owns nothing" precedent). **No page-ID mints. No
universe change. No WBS coverage-ledger change.**

---

## 1. Provenance (bound by pointer)

- **Visual Design Baseline — VDB v1.0:** `prototypes/review-system/` (`index.html` + `README.md`),
  owner-approved and **locked 2026-07-08**. The canonical visual reference during implementation;
  future visual change must be incremental and justified (README status block).
- **Planning package:** `docs/product/requirements/review_system_planning_and_design.md` — the
  authoritative spec for Surfaces 1–5, bound to the frozen `Doc-4G_PassB_Part5_BC-TRUST-5`,
  `Doc-4F_PassB_Part1_BC-OPS-1`, `Doc-5G`, `J-REV`, `Doc-7D`. Coins nothing. Its §7 already
  grounds S2→`P-PUB-13` and S3→`P-ADM-02/03`.
- **Admin Console package (frozen, committed `cfdf4d3`):**
  `docs/product/requirements/admin_console_planning_and_design.md` — owner of `P-ADM-01…29`;
  `J-ADM-01` binds review moderation to `P-ADM-02/03/04`; trust staff legs are actor-bound /
  **not page-pinned** (§12, E6). Admin FE is **built** under `app/(app)/admin/` (`FE-ADM-01`,
  ✅ Complete).
- **Program constraints:** page universe = **151** (`scripts/verify-fe-wbs-coverage.mjs`, `PASS
  151/151`); FE track naming + Board-only mint rule + the **"owns" vs "touches"** distinction
  (`project-management/fe-program-wbs.md`); wave gates (`generatedDocs/Build_Roadmap_v1.0.md`).

---

## 2. Scope binding (what the Board is authorizing if it approves)

**In scope — presentation-only FE (Phase P):** the five surfaces built with **mock adapters /
static data only** — *no persistence · no fake moderation flows · no simulated publish/state
transitions · no new workflow states · frozen-contract grounding · coins nothing* (planning
package §8 Phase-P guardrails). Every action is a mock; nothing emulates the business state
machine. Build must conform to **VDB v1.0** (no redesign; incremental, justified change only).

**Explicitly NOT requested here** (separate gates / channels):

- **Backend** — M5 `trust.public_reviews`/`admin_ratings` tables + the seven BC-TRUST-5 contracts
  (Wave 3); M8 moderation wiring + M4 `ops.set_private_vendor_rating.v1` wiring (Wave 5). Wave-gated.
- **New page IDs / universe change** — none needed (§4); the universe stays 151.
- **Aggregate-rating display** (§9(a)) — interim-prohibited (DP-R1); future corpus-guidance item.
- **Vendor reply to reviews** (§9(b)) — absent from the corpus; product decision, not requested.
- **Author review-status read** (§9(e)) — no author-scoped read exists; an additive Doc-4G/Doc-5G
  contract question for the API Governance Board, not a coinable UI.

---

## 2.5 Reconciliation with the Admin Console package (why this packet mints no page IDs)

Verified against the frozen corpus 2026-07-08 (`verify-before-delivering`, CLAUDE.md §11):

| Fact (bound by pointer) | Consequence for this packet |
|---|---|
| `P-ADM-01…29` exist and are **all owned** by `FE-ADM-01` (✅ Complete); universe `ADM: 29` is inside the **151** total | No free `P-ADM` number exists; minting one would **expand the universe** (forbidden by this request) |
| `J-ADM-01` (moderation staff leg, `P-ADM-02/03/04`) **composes `trust.moderate_review.v1`** | **Surface 3 is the review face of `P-ADM-02/03`** — the frozen answer to D2; a new page would double-claim the namespace |
| Admin ratings "**render only inside the staff console**"; the Trust staff leg is **actor-bound, not page-pinned** (§12, E6) | **Surface 5 is a face** of that not-page-pinned context — placement is a Board confirmation, **not** a new page |
| WBS distinguishes **"owns"** (coverage, counts toward 151) vs **"touches"** (may modify, owns nothing) — e.g. `FE-BUY-08` *touches* `P-BUY-01`, owns 0 | The review-system milestones can **touch** existing pages and **own nothing** → coverage ledger unchanged |

**No conflict is resolved locally.** D2 is decided by the corpus (conform upward, §7); this packet
merely records it. Nothing here reopens `FE-ADM-01` or edits the frozen Admin Console package.

---

## 3. Placement decisions (D1–D4)

### D1 — Surface 2 microsite placement — **Confirm**
Render `published` reviews as a **section + anchor** within the one-page microsite (`P-PUB-13`,
Doc-7D) — not a new sub-route. Matches planning §7 and the frozen one-page HYBRID IA. **0 pages.**

### D2 — Surface 3 moderation placement — **Resolved by the corpus (face of `P-ADM-02/03`)**
`J-ADM-01` binds the moderation staff leg (`P-ADM-02/03/04`) to *compose* `trust.moderate_review.v1`.
Surface 3 is therefore the **review case-type / filter face** of the existing moderation queue —
the review-specific experience the Admin Console prototype deliberately left to this package (E8).
The draft's "new dedicated pages" option is **foreclosed** (it would conflict with `J-ADM-01` and
expand the universe). **0 pages.**

### D3 — Owner of the staff review legs — **`FE-ADM-01` owner (Team-3)**
Admin dev ownership is **no longer unassigned**: `FE-ADM-01` (Admin Console, `P-ADM-01…29`) is
built and owned by **Team-3**. Surfaces 3 & 5 are a **touch-only extension** of those owned pages.
Recommendation: assign the review legs to the `FE-ADM-01` owner and sequence them **last**
(owner's Buyer → Vendor → RFQ → Admin order).

### D4 — Surface 1 buyer submission placement — **Face of engagement detail**
A **face of the existing engagement-detail surface** (Doc-7F), entered from a completed
engagement — per the CS WP-1 "second face, no new page ID" precedent. **0 pages.**

---

## 4. Page-ID mapping (no mints — every surface is a face of an existing page)

> The page universe is **unchanged (151)** and the WBS coverage ledger is **untouched**. This
> table records where each surface *lands*; it reserves and mints nothing.

| Surface | Lands on (existing page) | New page IDs | Universe Δ |
|---|---|---|---|
| S1 — Buyer review submission | Face of the engagement-detail surface (Doc-7F) | none | 0 |
| S2 — Public reviews (Option A) | Section + anchor of `P-PUB-13` (vendor public microsite) | none | 0 |
| S3 — Moderation queue + case | Review face of `P-ADM-02/03` (moderation; `J-ADM-01`) | none | 0 |
| S4 — Private CRM ratings | Existing buyer CRM record detail (parked card at `app/(app)/(buyer)/crm/[recordId]/`) | none | 0 |
| S5 — Admin ratings (staff) | Face of the admin console's not-page-pinned trust/vendor-governance context (§12/E6) | none | 0 |

**Universe: 151 → 151 (no change). Coverage ledger: unchanged.** Verified `PASS 151/151`.

---

## 5. FE-\* milestone mints requested (Board-only) — all *touch-only*

Per `fe-program-wbs.md` naming (`FE-<TRACK>-NN`); the Board assigns the numbers. Each milestone
**touches** existing pages and **owns no new page** (the `FE-BUY-08` precedent) — so the coverage
ledger and the 151-page universe are untouched.

| Milestone (proposed) | Surface(s) | Track / team | Touches (owns 0) | Depends on | Sequence |
|---|---|---|---|---|---|
| `FE-BUY-«n»` Review submission + CRM ratings | S1, S4 | FE-BUY / Team-2 | engagement detail · buyer CRM detail | D4 | **1st** |
| `FE-PUB-«n»` Public reviews display (Option A) | S2 | FE-PUB / Team-1 | `P-PUB-13` | D1 | 2nd |
| `FE-ADM-«n»` Review moderation + admin ratings faces | S3, S5 | FE-ADM / Team-3 | `P-ADM-02/03` · admin trust context | D2, D3 | last |

- **Surface 4 (CRM ratings)** is the presentation-only *activation* of the already-built parked
  card — folded into the FE-BUY milestone (mock adapter; real wiring stays Wave-5).
- The FE-ADM milestone may be split (S3 / S5) at the Board's discretion; either way it owns no
  new page. **Ordering** follows the owner's Buyer → Vendor → RFQ → Admin rule.

---

## 6. Conformance guardrails carried into the build

- **Baseline:** build to **VDB v1.0** (`prototypes/review-system/`). No layout redesign;
  incremental, justified visual change only. Keep the prototype as the live visual reference.
- **Governance (from the approved design):** no derived review statistics anywhere (DP-R1);
  published-only public reads via the Marketplace projection (DP-R3); three lanes never merged;
  neutral verified-engagement medallion (provenance, not author identity); only the five frozen
  statuses; staff/CRM firewalls; NOT_FOUND-collapse honoured; light **and** dark themes (the
  frozen `.dark`) both first-class.
- **Namespace discipline:** the staff legs **touch** `P-ADM-02/03` and the admin trust context —
  they never mint a `P-ADM` page and never reopen the Complete `FE-ADM-01`.
- **Carried markers (open, not resolved here):** `[ESC-TRUST-SLUG]`, `[ESC-TRUST-AUDIT]`,
  `[ESC-OPS-POLICY]` — bound by pointer; no ESC minted by this packet.

---

## 7. Board disposition block

| Decision | Ruling | Notes |
|---|---|---|
| D1 — S2 = section+anchor of `P-PUB-13` | ☐ Confirm ☐ Revise | 0 pages |
| D2 — S3 = review face of `P-ADM-02/03` (`J-ADM-01`) | ☐ Confirm ☐ Revise | Corpus-resolved; new pages foreclosed |
| D3 — staff legs owned by the `FE-ADM-01` owner (Team-3) | ☐ Confirm ☐ Reassign: ______ | Sequence last |
| D4 — S1 = face of engagement detail | ☐ Confirm ☐ New page | 0 pages |
| FE-\* milestone mints (§5) — all touch-only | ☐ Mint ☐ Hold | Board assigns IDs; coverage ledger unchanged |
| Page universe / WBS | ☑ Unchanged (151) | No mint requested; `PASS 151/151` |
| Scope = presentation-only (Phase P), built to VDB v1.0 | ☐ Confirm | Backend stays wave-gated |

*On approval, the planning-package Surface specs are annotated with the confirmed placements and
Phase-P presentation-only build may begin in the sequence above, conforming to VDB v1.0. Nothing
here reorders the roadmap, mints a page ID, changes the page universe, or authorizes any
backend/wiring work.*
