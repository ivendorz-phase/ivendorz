# Reviews & Ratings Display — Planning Package (v1.0)

> **Status:** PLANNING ONLY · **non-authoritative** · coins no route, contract, token, page ID, event,
> score, or slug. This package **binds by pointer** to the frozen corpus and **restates nothing**. On
> any conflict, the **frozen document wins** and this package is patched to match (CLAUDE.md §7, §11).
> This v1.0 incorporates an independent review's 5 MAJOR + 9 MINOR + 5 NIT findings; every finding and
> its disposition is recorded in §12.

**Canonical phrase (used throughout):** **"Public Review Display."** Where this package means the
staff-internal instrument it says **"Admin Rating."** Where it means the tenant-private instrument it
says **"Private CRM Rating."** These three phrases are never interchanged (NIT-01).

**Document conventions:** all divisions are numbered **§N** (no mixing of "S-1" / "Section" / "Surface"
labels — NIT-03). Front-end views are referred to as **surface specifications**, matching
`docs/product/ux/screen_specifications.md` house style (NIT-02).

---

## §0 · Authority & Non-Authority Banner

This is a **planning artifact**. It has **no authority** to create or reserve platform state.

- It sits **below** every frozen document in the authority order (CLAUDE.md §7, ranks 0–1 immutable).
- **Page IDs, page-universe deltas, and FE milestone identifiers named anywhere in this package are
  illustrative planning proposals. They do NOT reserve page IDs. Only the Board may mint page IDs and
  update the page universe** (`docs/product/ux/page_inventory.md` +
  `project-management/fe-navigation-screen-matrix.md` are the SSoT). *(MAJOR-03)*
- No contract, event, audit action, POLICY key, or slug is coined here. Every such entity is referenced
  by its frozen name and owning document.
- Nothing in this package authorises implementation. Approval of this package authorises only the
  **next governance step** (Board adjudication of the open questions in §7 and §9).

---

## §1 · Scope & the Content ≠ Presentation Boundary

**In scope:** how *already-frozen* review and rating data **may be displayed** on front-end surfaces —
placement, ordering, states, and the non-disclosure rules that constrain them. **Out of scope:** the
review/rating **domain** (aggregates, lifecycle, contracts, moderation authority) — that is frozen and
owned by Doc-4G BC-TRUST-5 and is referenced, never redesigned.

**Content ≠ Presentation (Golden Rule 4) applies independently to four distinct concerns** — a display
decision on any one does not imply a decision on the others *(MINOR-01)*:

| Concern | Content (owned, frozen) | Presentation (this package's subject) |
|---|---|---|
| **Review Body** | buyer-authored `body` text (Doc-4G, Doc-2 §10.6) | truncation, "read more", typographic treatment |
| **Rating Value** | `rating` ∈ 1–5 (Doc-2 §10.6) | how a single rating renders **per review** (see §4 for the hard limit on derived values) |
| **Display Placement** | n/a — placement is presentation | which surface the block appears on (§6) |
| **Sorting** | n/a — order is presentation | the fixed default order (§6) |

None of these four may be changed by inventing behavior; each is governed by the rules below.

---

## §2 · The Three-Lane Model (never cross-contaminated)

Three independent instruments carry "a buyer's opinion of a vendor." They are **firewalled** and must
never be merged, cross-read, or presented as one number. Lane labels are **textual only** — this
package assigns them **no colour semantics** (no green/orange/red coding) *(MINOR-02)*.

| Lane | Instrument | Owner | Visibility | Frozen anchor |
|---|---|---|---|---|
| **Lane A** | **Public Review** (`public_reviews`) | **M5 Trust** (BC-TRUST-5) | public — **only** `published` reviews | Doc-4G Part 5; Doc-2 §10.6 |
| **Lane B** | **Admin Rating** (`admin_ratings`) | **M5 Trust** (BC-TRUST-5) | **staff-only** — never tenant-visible, never public, never exposed externally | Doc-4G Part 5 §G8.4 (Patch F4G-PB5-M3) |
| **Lane C** | **Private CRM Rating** (`private_vendor_ratings`) | **M4 Operations** (BC-OPS-1) | **tenant-private** — one buyer org only | Doc-4F Part 1 §H.10 |

- **Lane A ≠ Lane B.** The frozen corpus is explicit: a Public Review *"is a **Public Review**, never an
  Admin Rating (separate aggregate)"* and *"Reviews and Admin Ratings are SEPARATE authorities and are
  never merged"* (Doc-4G Part 5). They never share a widget, a number, or an average.
- **Lane B — "display" ≠ "public visibility."** An Admin Rating may be *displayed* to platform staff on
  an internal admin surface; that is **not** publication. No admin surface that renders an Admin Rating
  makes it tenant- or public-visible, and non-staff access collapses to `NOT_FOUND` (Doc-4G Patch
  F4G-PB5-M3). This package draws the line explicitly to prevent an admin mock from being read as a
  public feature *(MINOR-06)*.
- **Lane C — never leaves the tenant.** Private CRM Ratings are `organization_id`-scoped and **never
  exported, never searchable, and never shown outside the owning tenant** — on any vendor-facing
  surface, view, log, or error (Doc-4F Part 1 §H.9; Invariant 11 — private exclusion stays private).
  A Private CRM Rating **never** mutates any platform-wide score *(MINOR-07)*.

---

## §3 · Frozen Grounding (by pointer)

Everything below is referenced, not restated. **Journey references are authoritative by pointer; journey
diagrams are NOT duplicated here** *(MINOR-03)*.

**Domain & lifecycle** — Doc-4G `Doc-4G_PassB_Part5_BC-TRUST-5_Reviews_Admin_Ratings_v1.0.md` **as
amended by** `Doc-4G_PassB_Part5_Patch_v1.0.md` (Freeze Audit: APPROVE FOR FREEZE):
- Public Review lifecycle (verbatim): **`submitted → approved → published | rejected | removed`**
  (entry `submitted`; `removed` = hidden soft-delete, SD=YES).
- Admin Rating: **create/update + soft delete; no multi-state machine** (Doc-2 §10.6).
- `rating ∈ 1–5`; subject = **vendor** (`vendor_profile_id`), author = buyer org (`author_organization_id`).
- **Eligibility:** buyer permission `can_submit_review`; **engagement-gated, post-award only** — the
  `engagement_id` gate is mandatory and service-validated (DG-4). A second review for the same
  engagement is a **BUSINESS** error, not idempotency.

**Contracts** (named, never coined) — Doc-4G §G8 + Doc-5G §2.5:
`trust.submit_review.v1` · `trust.moderate_review.v1` · `trust.publish_review.v1` ·
`trust.remove_review.v1` · `trust.set_admin_rating.v1` · `trust.get_review.v1` (public, published-only) ·
`trust.list_reviews.v1` (public, published-only).

**Journeys** (by pointer only) — `docs/product/journeys/journeys_trust.md` **J-REV** (Public Review
Lifecycle, M5) · `docs/product/journeys/journeys_admin.md` **J-MOD** (Moderation Case Lifecycle, M8 —
*"M8 never writes the owning table"*) · **J-PSC** (a `published` Buyer-Feedback review is a
`performance_inputs` source via BC-TRUST-3, Path B).

**Audit & events** — Doc-2 §9 review actions bound by pointer: *review submit · moderation decision ·
publish · remove*. Admin-rating set has no enumerated §9 action → carries `[ESC-TRUST-AUDIT]`.
**BC-TRUST-5 emits NO domain event** — every review/rating mutation is **state + §9 audit only**
(Doc-4G §H.7). Carried escalation markers: `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]` (dedup windows),
`[ESC-TRUST-SLUG]` (any future dedicated moderation/admin-rating slug).

---

## §4 · Aggregate Rating Freeze *(MAJOR-01)*

The frozen corpus defines **no** aggregation formula, weighting, rounding, or publication rule for
review ratings. `trust.list_reviews.v1` returns only per-review published fields; reviews are
*"informational signals only"* and BC-TRUST-5 *"never computes an average."* Absent an explicit rule,
UI teams could accidentally invent one. This package therefore states the binding display constraint:

> **No aggregate rating, average score, recommendation percentage, or derived review statistic may be
> displayed unless explicitly authorized by future corpus guidance.**

This prohibition covers — non-exhaustively — an "average rating" (e.g. "4.8/5"), a star average, a
review **count** presented as a score, a "% recommended", a Bayesian/weighted score, a percentile, a
histogram implying a computed distribution, or any endpoint-computed derivation. **Only individual
`published` reviews, each showing its own `rating`, may be displayed** (subject to §5, §6). This rule is
consistent with the frozen corpus (it introduces no new law — it names an existing absence and forbids
filling it locally); a future corpus patch is the **only** channel that could authorize a derived
statistic.

---

## §5 · Projection Rule *(MAJOR-02)*

Front-end presentation **never** touches Trust-owned tables. Strengthened wording (reinforcing DG-2 and
Doc-4G Patch F4G-PB5-M1, *"served via Marketplace/Trust service projection, never direct table
access"*):

> **Presentation consumes only the Marketplace public projection (a read of `published` reviews via
> service). It MUST NOT query Trust-owned entities directly.**

- The public consumer is the Marketplace display service (**DG-2**), which projects **`published`
  reviews only**; non-`published` states are not readable on the public projection (collapse to
  `NOT_FOUND`).
- No FE surface reads `public_reviews`, `admin_ratings`, or any Trust table; no cross-module table
  access, no cross-schema SQL (Golden Rule 2; CLAUDE.md Red-Flag Checklist).
- Trust badges are composed **beside** the review read, never inside it (Doc-4G R6/DD-2). A review
  display never carries a Trust Score, Performance Score, band, or Financial Tier (firewall).

---

## §6 · Display & UX Rules

**Placement (subject firewall).** Because reviews are **vendor-subject**, Public Review Display belongs
on **vendor** surfaces (vendor profile / microsite public read). **No product-detail surface carries a
review block** — a product page has no review lane at all (this is why the Single Product Page prototype
shows none). Any future product-level review concept is net-new and Board-gated.

**Ordering (fixed default).** Review cards render **`published_at` descending (newest published first),
with a deterministic `public_review_id` tiebreak** for stable pagination. Not chronological by authored
date, not by rating, not by any relevance/ranking signal (which would imply computation — forbidden by
§4 and the R6/R7 non-ranking rule) *(MINOR-05)*.

**Buyer submission (one per engagement).** Eligibility is engagement-gated and one-review-per-engagement
(§3). The submission surface therefore follows: **if a review already exists for the engagement →
render view-only (the buyer sees their submitted review); offer no second-submission affordance.**
A second submit is a BUSINESS error, never surfaced as a retry *(MINOR-04)*.

**Per-review rendering.** Each `published` review may show its author-scoped `rating` (1–5), `body`, and
published timestamp. No aggregate anything (§4). Absence of reviews renders as an honest empty state,
never a fabricated "0.0" or "No rating yet" score.

---

## §7 · Page-ID / Universe-Delta Proposals *(illustrative — see §0)*

The following are **planning proposals only** and **reserve nothing** (MAJOR-03; §0 banner governs).
They exist to scope the conversation for the Board, which alone may mint IDs.

- *(illustrative)* A vendor-surface **"Public Reviews" display region** — most likely a **face of an
  existing vendor profile/microsite page**, not a new page ID.
- *(illustrative)* A buyer **"Write a review" surface**, reachable only from a completed engagement
  (post-award gate) — likely a face of the engagement/operations surface, not a new public route.
- *(illustrative)* Reviews in the **existing** admin moderation queue (see §9) — **no new page proposed
  by default**.

No page-universe delta is asserted; the coverage invariant is not modified by this package.

---

## §8 · Waves & Phasing

Display work is gated behind the frozen backend and the Board decisions in §9. Indicative sequence
(subject to `generatedDocs/Build_Roadmap_v1.0.md`, which owns real gating):

```
  Phase P  ──►  Phase 1  ──►  Phase 2  ──►  Phase 3
 (present-   (read-only    (buyer write   (moderation
  ation)      public        surface,       surface per
              display of     one-per-       §9 Board
              published      engagement)    ruling)
              reviews)
   guard        DG-2          post-award     owner =
   rails        projection    gate           Board
   (§10)        (§5)          (§6)           decision
```

**Timeline annex (indicative, non-binding)** *(NIT-04)*: Phase P (this package + prototype review) →
Board adjudication (§9, §7) → Phase 1 build once BC-TRUST-5 reads are wired → Phase 2/3 follow their own
Definition-of-Ready gates. No calendar dates are asserted; the Build Roadmap owns scheduling.

---

## §9 · Moderation-Queue Ownership — **Board Decision Required** *(MAJOR-04)*

Reviews already appear in the built generic moderation surface (P-ADM-02 / P-ADM-03 case queue), which
routes the *effect* to M5's `trust.moderate_review.v1` while **M8 never writes the owning table**
(J-MOD). The open question is whether review moderation should keep using that generic face or gain a
dedicated surface. Two neutral options:

- **Option A — extend the existing moderation face** (P-ADM-02 / P-ADM-03) to handle review cases within
  the generic reported-content worklist.
- **Option B — a dedicated review-moderation surface** distinct from the generic queue.

> **This package does not recommend either option. A Board decision is required. No implementation
> preference is implied.** Whichever is chosen, the ownership firewall is fixed and not in question: the
> **review record + lifecycle + audit are M5-owned**; the moderation **case** is M8-owned; M8 delegates
> the effect to M5 and never writes the review table.

---

## §10 · Presentation-Only Guard Rails *(MAJOR-05)*

Any FE built from this package during a presentation-only phase is bound by:

> **No mock persistence. No fake moderation. No simulated publish state. Presentation only.
> Static / mock adapter only.**

A presentation build renders frozen-shaped mock data through a static adapter. It does not persist a
review, does not simulate a `submitted → approved → published` transition, does not fabricate a
moderation decision, and shows no "your review is now live" state. This prevents prototype drift into
business behavior (mirrors the CS / WP presentation-only discipline).

---

## §11 · Backend Annex — *informative only* *(NIT-05)*

For orientation only; it grants nothing and coins nothing. The Public Review is a shared-tenancy
aggregate (author org writes; public only when `published`); the post-award `engagement_id` gate is
mandatory and service-validated (DG-4); a `published` Buyer-Feedback review feeds `performance_inputs`
via BC-TRUST-3 (Path B) — BC-TRUST-5 never writes a score; the whole aggregate emits no domain event
(state + §9 audit only). All authoritative detail lives in Doc-4G Part 5 and Doc-2 §10.6.

---

## §12 · Disposition Log

Every finding from the independent review, adjudicated through the CLAUDE.md §13 four-question Validate
gate (Valid? · Applicable? · Best for the product? · Consistent with the frozen corpus?). Fixed schema
**Finding · Severity · Decision · Resolution · Owner · Status** *(MINOR-09)*. All findings passed the
gate and are incorporated into v1.0.

| Finding | Severity | Decision | Resolution | Owner | Status |
|---|---|---|---|---|---|
| Aggregate rating needs explicit freeze | MAJOR-01 | Accept | §4 states the binding no-derived-statistic rule verbatim | Author | Closed-v1.0 |
| Projection boundary needs stronger language | MAJOR-02 | Accept | §5 — "consumes only the Marketplace public projection; MUST NOT query Trust entities directly" | Author | Closed-v1.0 |
| Page-ID proposal needs non-authority banner | MAJOR-03 | Accept | §0 banner + §7 marked illustrative; "only the Board may mint page IDs" | Author | Closed-v1.0 |
| Moderation-queue ownership unclear | MAJOR-04 | Accept | §9 — neutral A/B options; "Board decision required, no preference implied" | Author | Closed-v1.0 |
| Presentation-only phase needs guard rails | MAJOR-05 | Accept | §10 — no mock persistence / fake moderation / simulated publish | Author | Closed-v1.0 |
| Content ≠ Presentation applies per-concern | MINOR-01 | Accept | §1 table — Review Body · Rating Value · Display Placement · Sorting each independent | Author | Closed-v1.0 |
| Three-lane diagram should be colour-neutral | MINOR-02 | Accept | §2 — textual lane labels only, no green/orange/red | Author | Closed-v1.0 |
| Journey binding by pointer, no duplicate diagrams | MINOR-03 | Accept | §3 — journeys referenced by pointer; diagrams not duplicated | Author | Closed-v1.0 |
| Buyer: one review exists → view only | MINOR-04 | Accept | §6 — existing review → view-only, no second submission | Author | Closed-v1.0 |
| Review-card ordering unspecified | MINOR-05 | Accept | §6 — `published_at` desc + `public_review_id` tiebreak | Author | Closed-v1.0 |
| Admin ratings: "display" ≠ "public visibility" | MINOR-06 | Accept | §2 Lane B — staff display is not publication; non-staff → NOT_FOUND | Author | Closed-v1.0 |
| Private CRM lane never exported/searchable/shown | MINOR-07 | Accept | §2 Lane C — tenant-private, never leaves the tenant | Author | Closed-v1.0 |
| §8 wave diagram for readability | MINOR-08 | Accept | §8 — ASCII wave diagram added | Author | Closed-v1.0 |
| Disposition log needs fixed schema | MINOR-09 | Accept | This table — Finding·Severity·Decision·Resolution·Owner·Status | Author | Closed-v1.0 |
| Consistent canonical terminology | NIT-01 | Accept | Header — "Public Review Display" / "Admin Rating" / "Private CRM Rating" fixed | Author | Closed-v1.0 |
| "surface specifications" not "screen specs" | NIT-02 | Accept | Header conventions — house term adopted | Author | Closed-v1.0 |
| One naming style for sections | NIT-03 | Accept | Uniform §N numbering throughout | Author | Closed-v1.0 |
| Wave annex could include a timeline | NIT-04 | Accept | §8 — indicative non-binding timeline annex added | Author | Closed-v1.0 |
| Keep backend annex informative only | NIT-05 | Accept (affirm) | §11 marked informative-only, grants/coins nothing | Author | Closed-v1.0 |

**Architecture conformance** (self-assessment; independent review may override — Raise ≠ Accept):
Authority Order ✅ · Frozen Corpus ✅ · Module Ownership ✅ · Wave Gating ✅ · Contract Discipline ✅ ·
No Coined APIs ✅ · No Architecture Drift ✅ · Governance Firewalls ✅ · DG-2 Projection Rule ✅ (§5
strengthened) · Planning-only Discipline ✅ (§0 banner + §10 guard rails).

---

*Non-authoritative. Conforms upward; coins nothing. Every entity resolves via its named frozen owner,
never locally. On any conflict the frozen document wins (CLAUDE.md §7, §11).*
