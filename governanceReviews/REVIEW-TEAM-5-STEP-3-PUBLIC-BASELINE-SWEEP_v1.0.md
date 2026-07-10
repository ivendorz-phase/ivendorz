<!--
Doc-type:  Review Team 5 (Quality & Adversarial / B-lane) gate report — NON-authoritative program-org output.
Scope:     QCT 5-step conformance track, Step 3 = Public Shared Promotion baseline sweep.
Authority: Board agenda #10 (owner-authorized 2026-07-02). Charter: REVIEW-TEAM-5-CHARTER_v1.0.md.
Rule:      Raise ≠ Accept — Team 5 raises; the Architecture Board rules (CLAUDE.md §7/§13). Coins nothing.
-->

# Review Team 5 — Step 3: Public Shared Promotion Baseline Sweep v1.0

**Verdict: PASS** (baseline quality-clean) · **0 BLOCKER · 0 MAJOR · 0 MINOR** · promotion candidates
raised for Board registration (non-blocking).

- **Reviewed SHA (stable target):** `6007ea1` — `app/(public)/` byte-clean at review time (only
  tracker/WP files dirty; no uncommitted change to the public surface).
- **Authorization:** Board agenda #10, owner-authorized 2026-07-02 (changelog).
- **Purpose (charter §Standing backlog):** establish a reviewed public baseline **before** `FE-PUB-02`
  pulls its first page (WP card §Dependencies `S:`); findings feed the FE-PUB packages.

---

## 1. Scope & method

- **Surface swept:** the public route set under `app/(public)/` = **27 route files** (the P-PUB + P-SH
  public-facing pages incl. the 7 vendor-microsite sub-routes) and their **~40 components**.
- **Method:** two read-only mapping passes (inventory/duplication + a11y/hygiene) + **independent
  adversarial verification** of every load-bearing claim by direct file reads (I did not rubber-stamp
  the mapping passes — see §2/§3), + full-repo `tsc`.
- **Coverage decision (stated, not silently capped):** per-page **render + screenshots were already
  performed at each page's original review** (RV-0086…RV-0100 for P-PUB/P-SH). This baseline therefore
  targets **cross-cutting** concerns — duplication/promotion, kit-reuse discipline, a11y/hygiene
  consistency — and does **not** re-render all 27 routes. Per-milestone render stays with the FE-PUB
  packages (each renders its own in-scope pages).

---

## 2. Baseline quality — PASS

| Check | Result | Evidence |
|---|---|---|
| Type-safety | **Clean** | `npx tsc --noEmit -p .` exit 0 (full repo) at `6007ea1` |
| Kit reuse (no re-implementation) | **Clean** | public pages import kit primitives correctly (`CurrencyDisplay`, `CapabilityMatrix`, `VendorCard`/`vendorInitials` [verified export `src/frontend/components/vendor-card.tsx:36`], `SearchBar`, `FilterSidebar`, `ResultsGrid`, `PaginationControl`, `EmptyState`, `ErrorState`) |
| Heading discipline (single h1) | **Clean** | one `<h1>` per route across all 27 |
| Colour-only status | **Clean** | every state pairs icon+text (e.g. compare `OnOff` Yes/No; pricing entitlement Check/Minus + label) |
| Icons / images | **Clean** | decorative icons `aria-hidden`; zero fabricated `<img>` (intentional) |
| Dead code / hygiene | **Clean** | no TODO/FIXME, no commented-out JSX, no unused imports found |
| Hardcoded values | **Clean** | only `#000` in `hero.tsx` (documented **mask alpha**, not a theme colour); all else uses semantic tokens |
| Consistency | **Clean** | marketing pages share hero→sections→CTA idiom; microsite via `VendorSection`; listing pages share grid+sidebar |

**Refuted finding (recorded for audit):** the a11y pass raised one **MAJOR** against
`pricing-plans.tsx:200-213` ("AI Assistant" disabled affordance). **Verified false —** that file ends
at **line 201**; the affordance it described actually lives in `command-center.tsx` (a deliberate,
already-approved `aria-disabled` + "coming soon" pattern, discoverable-but-inert — an accepted a11y
idiom, not a defect). Misattributed line reference → **not carried.** [OBS] the `aria-disabled`
"coming soon" idiom (command-center) is defensible and was approved at the landing review; no action.

---

## 3. Promotion candidates raised (the Step-3 deliverable)

**Governance frame (important):** all four patterns below are duplicated **within the public surface
only** (one surface). Their promotion target is a **public-scoped shared extraction** — a Team-1
milestone analogous to the vendor **M8 Shared Extraction** (creates `app/(public)/_components/shared/`,
zero behaviour change, per-consumer byte-equivalence) — **not** a frozen-kit change. Only the kit-gap in
§4 touches the frozen foundation. Raised for Board registration; **I mint no FE-* ID** (Board-only) and
do **not** write the Board-maintained `promotion-watchlist.md`.

All four clear the rule-of-three. Similarity ratings are **my verified** ratings, not the mapping pass's.

| # | Candidate | Pattern | Consumers (file:line) | Similarity (verified) | Cost | Confidence |
|---|---|---|---|---|---|---|
| A | `AnonymousIntentButtons` | "Request quote" + secondary intent (Contact / View supplier), all → `(auth)`, never mutate | `vendor-hero.tsx:51-58` · `vendor-microsite-footer.tsx:42-49` · `vendor-microsite-header.tsx:39-41` · `product-showcase.tsx:40-49` · `product-detail.tsx:107-116` | **2× byte-identical** (hero≡footer) + 3× same-family (diff labels/second-action) | S | High |
| B | `PublicCtaSection` | closing CTA band: centered h2 + desc + primary "Get started"/`ArrowRight` + outline secondary | `about:143-163` · `pricing:49-69` · `for-buyers:119-139` · `for-vendors` · `how-it-works` | **near-identical** (verified about vs pricing: differ only in bg class + copy + secondary href) | S | High |
| C | `PublicPageIntro` | page intro block `section.border-b.bg-background` + container + h1 + desc | `categories:22-30` · `vendors:21-29` · `marketplace:20-31` · `search:213-236` · `compare:86-96` · `pricing:25-35` · `about:77-89` (+ 1) | same idiom, **8× inlined**, content varies | S | Medium |
| D | `PublicCardGrid` | responsive `Card`-in-`ul` grid for icon+label items | `industry-grid:15-27` · `certification-grid:19-34` · `capability-section:27-40` · `company-gallery:16-29` · `mission-vision:51-62` · `why-choose-us:16-32` · `download-center:19-47` | **same-shape, different-props** (verified: breakpoints differ `cols-2 sm:3 lg:4` vs `sm:2 lg:4`; cell content differs) | M | Lower — parameterization cost may exceed benefit; Board to weigh |

Proposed **Approved-criteria** status for each (charter/watchlist ①–④): ① ≥2 consumers ✔ (all) · ②
≥2 approved RV refs ✔ (RV-0086 pricing · RV-0087 about · RV-0089/0090 segments · RV-0098 compare · plus
the microsite M2.5 set) · ③ byte-equivalence plan — **required at extraction** (RV-0038 precedent) · ④
Board approval + ID — **pending.** Recommend registering **A + B** now (High confidence, S cost); hold
**C** and **D** as watch items (C on divergence, D pending a param-cost/benefit call).

---

## 4. Kit-gap → FE-DS (frozen-foundation; Flag-and-Halt to kit owner)

- **`Textarea` primitive is absent** from the kit (`src/frontend/` — verified: no `*textarea*` file, no
  `Textarea` export). `contact-form.tsx:47-50` hand-rolls a `<textarea>` styled to match kit `Input`
  (documented as intentional local control, **not** a re-implementation of an existing primitive → no
  defect in the page). **Raised** as a kit-owner/Board item for **FE-DS-06/07** scoping (joins the
  existing FE-DS watch list: `--iv-reading-max`/`--iv-form-max`, kit `Select`, kit `Switch`). I do **not**
  authorize any kit change — this is the frozen foundation.

---

## 5. Findings ledger (severity)

- **BLOCKER:** none. **MAJOR:** none (the one raised was refuted, §2). **MINOR:** none.
- **OBS:** (1) public baseline is quality-clean and kit-reuse-disciplined; (2) `aria-disabled`
  "coming soon" idiom is defensible (no action); (3) four within-public duplication patterns → §3
  candidates; (4) kit `Textarea` gap → §4.

Gate: **BLOCKER 0 · MAJOR 0 · MINOR 0 → PASS.**

---

## 6. Verdict & handoff

- **PASS** — the public baseline at `6007ea1` is quality-clean; **`FE-PUB-02`'s `S:` dependency is
  satisfied** → Team-1 may enhance on a reviewed baseline.
- **To the Board (Raise ≠ Accept):** register candidates **A + B** to `promotion-watchlist.md` (mint
  FE-* IDs, target a Team-1 public shared-extraction milestone); hold **C + D** as watch items; add the
  kit `Textarea` gap to the FE-DS watch list.
- **Not done here (out of charter):** no code edited, no component extracted, no FE-* ID minted, no
  frozen-kit change authorized, no watchlist row written.

---

*Non-authoritative program-org gate report. Conforms upward; coins nothing. Team 5 raises; the
Architecture Board rules (CLAUDE.md §7/§13); frozen-foundation/architecture-affecting resolutions
require human approval (§8).*
