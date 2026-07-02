# iVendorz Product Status — Snapshot 2026-07-02

**Purpose:** consolidated, verified state of the product across backend waves and the frontend
program — the input document for drafting the next roadmap.
**Non-authoritative.** Status SSoT stays `generatedDocs/00_AUTHORITY_MAP.md` +
`generatedDocs/Program_Status_And_Roadmap.md` (ledger) + `generatedDocs/Build_Roadmap_v1.0.md`
(gated sequence). Page-level SSoT = the team files in this folder. This snapshot restates counts
only; on any conflict those sources win.

---

## 1. Program at a glance

| Track | State |
|---|---|
| Architecture corpus | **FROZEN, complete** — Doc-2/3 · Doc-4A–4M · Doc-5A–5K · Doc-6 program · Doc-7A–7H · Doc-8A–8G (per ledger §§1–4d) |
| Wave 0 — Repository Bootstrap | **DELIVERED** to `main` 2026-06-27 (`wave0-complete`, Exit Gate GREEN 5/5) |
| Wave 1 — Foundation (Walking Skeleton) | **DELIVERED** to `main` (Exit Gate GREEN; `3345b00`) |
| Wave 2 — Core Platform (M0 → M1) | **IN PROGRESS** on `wave/2-core-platform`. D7 buyer-profile audited-WRITE vertical **shipped** (`8f8a4a0`) — canonical audited-write pattern (`governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`); ESC-W2-AUDIT-RLS resolved (ADR-021 + Doc-6B patch); full suite 58/58 GREEN on real Postgres |
| Frontend (owner-authorized parallel stream) | Presentation-only, 3 build teams + Team-4 QCT, ahead of the Wave-3 sequence ("parallelization, not reorder"). **120 / 144 pages exist (83%)**; 75 through the QCT gate |
| Frontend foundation | Kit (`src/frontend/`) + public shell + light theme: **built, verified, treated as frozen platform** (extend, never duplicate). Brand logo integration complete in code; palette re-skin (navy/indigo/gold) applied |

> **Ledger staleness flag (for the ledger owner):** `Program_Status_And_Roadmap.md` §5 still says
> Wave 2 "no implementation started" — superseded by the D7 delivery above. Flag, don't resolve here.

## 2. Frontend page board — 144 pages (verified against team files 2026-07-02)

| Surface | Team | Pages | 🟩 Built (pre-loop) | ✅ Approved | 🔵 In review | ⬜ Ready to build | ⬜ Blocked / gated |
|---|---|---:|---:|---:|---:|---:|---:|
| Public `P-PUB` | 1 | 24 | 11 | 3 | 1 | 7 | 2 ᴬ |
| Shell `P-SH` | 1 | 6 | 2 | — | — | 4 | — |
| Auth `P-AUTH` | 1 | 8 | 1 | 7 | — | — | — |
| Account `P-ACC` | 1 | 22 | 1 | 20 | — | — | 1 ᴮ |
| Buyer `P-BUY` | 2 | 27 | 8 | 16 | — | — | 3 ᶜ |
| Vendor `P-VND` | 3 | 28 | 21 | — | — | 5 | 2 ᴰ |
| Admin `P-ADM` | 3 | 29 | — | 29 | — | — | — |
| **Total** | | **144** | **44** | **75** | **1** | **16** | **8** |

ᴬ P-PUB-09/11 Waiting API (`ESC-7-API-CATNAV`, `ESC-7-API-PRODDETAIL`) ·
ᴮ P-ACC-12 Waiting Decision (`ESC-IDN-DELEG-EXPIRY`) ·
ᶜ P-BUY-03/04 route topology + P-BUY-05 favorites scope/projection — owner decisions ·
ᴰ P-VND-10 Waiting API (`ESC-7-API/upload`), P-VND-28 Waiting Decision (`ESC-7G-SCORE-DISPLAY`).

In review now: **P-PUB-05 For Buyers** (🔵 awaiting Team-4; page built + uncommitted, commits on approval per loop rule).

### Cluster milestones reached

- **Auth cluster COMPLETE** — P-AUTH-02..08 all ✅ (P-AUTH-01 pre-built).
- **Account cluster COMPLETE** — P-ACC-01..22 ✅ (only P-ACC-12 decision-gated).
- **Admin console COMPLETE** — P-ADM-01..29 all ✅ Approved + committed (2026-07-02).
- **Buyer page set COMPLETE** — P-BUY-01..27 built/approved except the 3 owner-gated rows.
  **Buyer Frontend Freeze Report v1.0 delivered**: BLOCKER 0 · MAJOR 6 · MINOR 5 — verdict
  *not-yet-frozen*; remediation **HELD** by owner for a single F2-Z batch after the enhancement
  sprint (BX-01 ✅, BX-02 ✅ committed; BX-03 awaiting owner target).
- **Vendor workspace M1–M8 COMPLETE** (pre-loop 🟩 stock, consolidated + shared-extraction pass
  reviewed byte-identical). M2.5 public microsite: foundation built, **stopped pending owner approval**.
- **Review ledger:** RV-0001..RV-0088 in `review-log.md`; review cycle 18. Team-4 QCT milestone
  track over the 🟩 Built stock: Step 1 Platform ✅ · Step 2 Vendor ✅ · **Step 3 Public = next**,
  then full-tree → RC.

## 3. Decision queue (what's blocking work — roadmap input #1)

**Human / Board decisions (packets already prepared where noted):**

1. **Vendor FE 3 BLOCKERs** — SCORE-DISPLAY · TRUSTSCORE · A7. Gates vendor companion freeze +
   P-VND-28. Packets ready: `governanceReviews/BOARD-PACKET-VENDOR-FE-BLOCKERS`, `DECISION-MATRIX-VENDOR-FE`.
2. **P-BUY-03/04 route topology** + **P-BUY-05 favorites scope/projection** (contract-mismatch flag).
3. **BX-03 target** — name the next buyer enhancement, or skip to **F2-Z** (single freeze-remediation
   batch → buyer frontend freeze approval).
4. **P-ACC-12** — `ESC-IDN-DELEG-EXPIRY` (delegation grant reinstate path).
5. **M2.5 vendor public microsite** — approve continuation past the foundation.
6. **Taxonomy seeding** — human P1 approval of the Taxonomy Content v1.0 package (`productSpec/`);
   mega-menu implementation gated behind the same approval chain.
7. **Official brand SVGs** — supply unmodified assets under `public/brand/` (never regenerated);
   completes runtime branding.

**Waiting-API handles (arrive with backend wiring waves, not decisions):**
`ESC-7-API-CATNAV` (P-PUB-09) · `ESC-7-API-PRODDETAIL` (P-PUB-11) · `ESC-7-API/upload` (P-VND-10,
plus the P-VND-25 upload path).

**Cross-team fix escalations (from the Buyer Freeze Report):** FZ-01 shell container double-wrap ·
FZ-09 kit FormField `role=alert` — both touch the frozen foundation, need owner scoping. Plus the
SiteHeader "Pricing" nav → `/pricing` chrome follow-up (RV-0087).

## 4. Buildable now — no decision needed (roadmap input #2)

| Team | Work | Volume |
|---|---|---|
| Team-1 | P-PUB-06/18/20/21/22/24 (P2) + P-SH-01/02/06 (P2) · then P-PUB-20/23 + P-SH-05 (P3) | 11 pages |
| Team-2 | idle pending owner (item 3 above) — then F2-Z batch (FZ-02/03/04/05/06/08/10/11) | 1 batch |
| Team-3 | P-VND-09 (wired write) · P-VND-12/13/14 (ads) · P-VND-27 (finance) — currently idling pending owner direction | 5 pages |
| Team-4 | P-PUB-05 review (in queue) + QCT Step 3 Public milestone review over the 44 🟩 Built stock | reviews |

## 5. Backend runway (roadmap input #3)

- **Wave 2 remainder:** full M0 → M1 module builds per `Build_Roadmap_v1.0.md` § Wave 2. D7 is the
  declared canonical audited-write — every future audited write (org, vendor, RFQ, quotation,
  product, trust) copies it.
- **Wave 3+ (wiring):** the FE program has accumulated a precise wiring queue — every approved
  page carries `OBS(wiring)` notes; gaps registered in `esc_registry.md`. Notable pre-registered
  wiring items: admin identity-ops **list-read binding gap** (RV-0077/0079 — one ESC recommended),
  plans **family-key grouping** (RV-0068), buyer invitation **delivered-onward server filter**
  (RV-0064), non-suppressible security notifications (RV-0067), delegation `draft` vs `pending`
  intra-corpus reconciliation (RV-0062, Flag-and-Halt at wiring).
- **Vendor M9 backend wiring** queued after the workspace feature set (future, wave-gated).

## 6. Uncommitted work-in-flight (as of this snapshot)

`app/(public)/for-buyers/` (P-PUB-05, commits on approval) · tracker updates (`current-focus`,
`changelog`, `review-log`, `team-1`, `team-3`) · `BUYER_FRONTEND_FREEZE_REPORT_v1.0.md` ·
`governanceReviews/milestones/team1-pub-05-for-buyers/`.

## 7. Roadmap axes (proposed structure for the roadmap doc — not the roadmap itself)

A. **Finish the FE presentation program** — 16 Ready pages + P-PUB-05 review + QCT Steps 3–5
   (Public → full-tree → RC).
B. **Buyer frontend freeze** — BX-03(+) per owner → F2-Z single remediation batch → verify
   (tsc/eslint/prettier/axe + 2-review) → freeze approval.
C. **Decision burn-down** — §3 queue; unblocks 8 gated pages, vendor companion freeze, microsite
   M2.5, taxonomy/mega-menu, runtime branding.
D. **Wave 2 completion → Wave 3 wiring** — per `Build_Roadmap_v1.0.md`; FE wiring consumes the
   §5 queue, module by module, D7 pattern for every audited write.
E. **Content & assets** — brand SVGs, taxonomy seeding (gated), mega-menu build (gated).
