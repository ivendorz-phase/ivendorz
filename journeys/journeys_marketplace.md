# Journeys — Marketplace & Discovery (M2)

**Breadcrumb:** [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) ▸ File C — Marketplace & Discovery
**Status:** **DRAFT v1.0** — non-authoritative companion (atlas §0 stance applies in full)
**Date:** 2026-07-06
**Owner module:** M2 Marketplace & Discovery (`marketplace` · Doc-4D)
**Journeys:** J-CLM · J-PRD · J-SITE · J-PORT · J-CAT · J-ADV · J-VOT
**Legend/notation:** atlas §2 · **Actor journeys composed:** `J-VND` §5, `J-GST` §2
(marketplace_ux.md)

> **Authority stance.** Non-authoritative companion. States resolve to **Doc-2 §5.3/§5.8 + §3**;
> contracts to **Doc-4D** (+ patches v1.0.2/v1.0.3). Escalation marker carried verbatim:
> **`ASSUMPTION A-07`** (Advertisement minimal machine). Standing rails: **Content ≠
> Presentation** (Invariant #9), **no draft leaks publicly**, M2 **reads** trust signals and
> never calculates them. Search & Discovery is owned by `J-GST`/`J-BUY`
> (marketplace_ux.md) — not re-narrated here. On any conflict the frozen corpus wins and this
> file is patched.

---

## C1. Vendor Claim & Onboarding Journey — `J-CLM`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Vendor Claim & Onboarding Journey

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (vendor profile AR) |
| Participating Modules | M1 (controlling organization); M5 (verification standing, seam M6-8); M8 (ban effect in, seam M6-4; profile status admin leg) |
| Authoritative Documents | Doc-2 §5.3, §3 (`vendor_profiles`, `vendor_claim_records`); Doc-4D |
| Read-only References | Doc-7E/7G (claim + workspace) · Doc-7D (public) |

**Actors:** Primary — vendor User. Supporting — Admin (seeding/status legs). ⚙ System — none in
the happy path.

**Intent arc:** Identity → Presence → Credibility (inherits `J-VND`).
**Goal:** take a vendor record from seeded/registered to a verified, discoverable presence — two
**orthogonal dimensions**: claim lifecycle and operational status.

**Entry:** a seeded record (`source: excel/admin`) exists, **or** direct registration (creates the
profile at `[claimed]`); a controlling organization is required for any claim transition.
**Exit:** claim `[verified]` (via seam M6-8) with status `[active]` — discoverable.

```
CLAIM:  [seeded] → invite sent → [invited] → vendor claims + logs in → [claimed] → verification passed → [verified]
        (direct registration enters at [claimed])
STATUS: [active] ⇄ [suspended]      [active] → ban → [banned] → lift → [active]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.3) | Outcome / governance |
|---|---|---|---|---|
| J-CLM-01 | Seed / invite | admin seeding (`vendor_claim_records`: `source excel/admin/registration`, invite channel) | claim `[seeded] → [invited]` | Pre-claim records exist before any user |
| J-CLM-02 | Claim / create | `claim_vendor_profile` / `create_vendor_profile` | `→ [claimed]` | Requires controlling org (Invariant #5); claim lifecycle applies **only to marketplace vendor profiles** (PATCH-02) |
| J-CLM-03 | Build identity | `update_vendor_profile`, `upsert_vendor_capacity_profile`, `set_declared_financial_tier` | `[claimed]` | Capability = **4-flag matrix** (Invariant #1) — never a label; declared ≠ verified tier (→ J-TIER) |
| J-CLM-04 | Verify | → J-VER; approval reflects via seam M6-8 | `[claimed] → [verified]` | Verified badge binary on public surfaces |
| J-CLM-05 | Operate | status dimension governed | `[active] ⇄ [suspended]` | Suspension also via org cascade (J-SUC-04) |
| J-CLM-06 | Ban / lift | effect of `(VendorBanned)` (seam M6-4; issued in J-BAN) | `[active] → [banned] → [active]` | **M8 decides, M2 executes**; public banner on `[banned]` |

**Governance rails:** visibility scope rides Invariant #3 (`buyer_private` | `public`);
soft-deleted profiles are excluded from routing/search (Doc-2 §5.3 guard); ownership transfer at
**any** point triggers the Trust Protection Workflow (→ J-VOT); M2 never computes trust.
**Success:** ✔ claim and status dimensions never conflated; ✔ controlling org bound before any
claim transition; ✔ ban effect executed from the event, never by admin table-write.

**Related:** upstream `J-GST-06` (claim CTA), J-ORG (controlling org) · downstream J-PRD, J-SITE,
J-PORT, J-CAT, J-VER, J-TIER · composed by `J-VND-01/02`.

---

## C2. Product Lifecycle — `J-PRD`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Product Lifecycle

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (product AR) |
| Participating Modules | none (fully in-module; public read on Doc-7D) |
| Authoritative Documents | Doc-2 §3 (`products`); Doc-4D (+ v1.0.3 public product detail) |
| Read-only References | Doc-7G (catalog manager) · Doc-7D (public detail, `get_public_product_detail.v1`) |

**Actors:** Primary — vendor User.

**Intent arc:** Draft → Publish → Maintain.
**Goal:** manage catalog items as versioned content with a clean publish boundary.

**Entry:** vendor profile claim ≥ `[claimed]`, status `[active]`.
**Exit:** product `[published]` (publicly readable) — or parked `[unpublished]`.

```
[draft] → publish → [published] ⇄ [unpublished]     (edits ↦ new version — content never overwritten)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-PRD-01 | Draft | `create_product` (spec library / docs attach) | `[draft]` | Never publicly visible |
| J-PRD-02 | Publish | `set_product_status` | `[draft] → [published]` | Public read via service only |
| J-PRD-03 | Maintain | `update_product` | `[published]` (`↦` version) | **Versioned, never overwritten** (Invariant #8) |
| J-PRD-04 | Park / relist | `set_product_status` | `[published] ⇄ [unpublished]` | Reversible; no archive state exists — **do not coin one** |

**Governance rails:** there is **no review/approval state** in the product enum — moderation
instruments live with M8 (J-MOD) and act on the record by ID; catalog search follows aggregate
ownership (search = presentation).
**Success:** ✔ drafts never leak; ✔ every edit a version; ✔ status changes limited to the frozen
enum.

**Related:** upstream J-CLM · sibling J-PORT (showcase ≠ catalog) · displayed in `J-GST-03/04` ·
composed by `J-VND-04`.

---

## C3. Microsite & Custom Domain Lifecycle — `J-SITE`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Microsite & Custom Domain Lifecycle

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (microsites, custom domains) |
| Participating Modules | M7 (microsite/service fees are platform revenue — by pointer) |
| Authoritative Documents | Doc-2 §3 (`microsites`, `custom_domains`); Doc-4D (+ v1.0.2 canonical vendor subdomain) |
| Read-only References | Doc-7D §4 (public microsite surface, P-PUB-13) |

**Actors:** Primary — vendor User. ⚙ System — domain verification checks.

**Intent arc:** Presence → Brand → Reach.
**Goal:** a branded public presence — microsite content with an optional custom domain, with the
publish boundary and domain custody strictly governed.

**Entry:** vendor profile `[claimed]`+, status `[active]`.
**Exit:** microsite `[published]`; domain `[active]` — or domain `[released]` (custody returned).

```
MICROSITE: [draft] → [published] ⇄ [unpublished]
DOMAIN:    [pending] → verify → [verified] → activate → [active] → release → [released]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-SITE-01 | Compose | microsite authoring (Doc-4D contracts) | `[draft]` | Content ≠ Presentation (Invariant #9) |
| J-SITE-02 | Publish | `publish_*` / `unpublish_*` | `[draft] → [published] ⇄ [unpublished]` | **No draft leaks**; same content read-only on Public (7D) |
| J-SITE-03 | Attach domain | custom-domain contracts (Doc-4D) | `[pending]` | Ownership proof pending |
| J-SITE-04 | Verify | ⚙ DNS/ownership verification | `[pending] → [verified]` | — |
| J-SITE-05 | Activate | domain go-live | `[verified] → [active]` | Canonical vendor subdomain rules (Doc-4D v1.0.2) |
| J-SITE-06 | Release | domain release | `[active] → [released]` | Custody returned; never re-used silently |

**Governance rails:** the public microsite is **one page of sections** on the anonymous surface
(Doc-7D §4) — published projection only; monetization of microsite features rides entitlements
(J-SUB), never plan-name checks.
**Success:** ✔ publish boundary intact; ✔ domain chain fully walked (never `[active]` without
`[verified]`); ✔ release audited.

**Related:** upstream J-CLM · content feeds `J-GST-04` · composed by `J-VND-03`.

---

## C4. Showcase Project Lifecycle — `J-PORT`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Showcase Project Lifecycle

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (`showcase_projects` AR) |
| Participating Modules | none |
| Authoritative Documents | Doc-2 §3 (`showcase_projects`, `[draft] → [published]`); Doc-4D §D7.3 |
| Read-only References | Doc-7G (portfolio manager) · Doc-7D (public profile sections) |

**Actors:** Primary — vendor User.

**Intent arc:** Proof → Story → Leads.
**Goal:** portfolio storytelling — public profile content distinct from post-award `engagements`
(Doc-2 A-02 deliberately renamed the aggregate to avoid the "project" collision).

**Entry:** vendor profile `[claimed]`+, `[active]`.
**Exit:** project `[published]` on the public profile.

```
[draft] → publish → [published]     (updates via contract; content never overwritten)
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-PORT-01 | Add | `marketplace.create_showcase_project.v1` | `[draft]` | Controlling-org-owned portfolio content |
| J-PORT-02 | Enrich | `marketplace.update_showcase_project.v1` (images, details) | `[draft]` | Honest content only — projects are claims until J-VER capacity evidence backs them |
| J-PORT-03 | Publish | `marketplace.publish_showcase_project.v1` | `[draft] → [published]` | **Publish emits no §8 event — never coin one** (Doc-4D §D7.3) |
| J-PORT-04 | Generate interest | public display → contact CTAs | `[published]` | Lead capture rides `J-GST-06` conversion, never a fabricated "lead" record |

**Governance rails:** showcase ≠ engagement — a showcase project **never** links to or discloses
a buyer engagement without that content being the vendor's own; no lifecycle beyond the frozen
two-state enum.
**Success:** ✔ published portfolio public; ✔ zero event coinage; ✔ engagement privacy intact.

**Related:** upstream J-CLM · sibling J-PRD · displayed in `J-GST-04` · composed by `J-VND-04`
(catalog leg).

---

## C5. Category Assignment Lifecycle — `J-CAT`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Category Assignment Lifecycle

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (`category_assignments`) |
| Participating Modules | M8 Admin (taxonomy governance — category catalog itself, → J-CATA) |
| Authoritative Documents | Doc-2 §3 (`category_assignments`); Doc-4D |
| Read-only References | Taxonomy Content v1.0 (productSpec, Board-approved P1) |

**Actors:** Primary — vendor User (proposes/assigns). Supporting — Admin (catalog owner).

**Intent arc:** Position → Approval → Discoverability.
**Goal:** place the vendor into the Admin-governed taxonomy — the vendor **assigns, never
defines** categories.

**Entry:** vendor profile `[claimed]`+; taxonomy category `[active]` (J-CATA).
**Exit:** assignment `[active]` (drives discovery facets) — or `[removed]`.

```
[proposed] → [active] → [removed]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §3) | Outcome / governance |
|---|---|---|---|---|
| J-CAT-01 | Browse | `list_categories` | — | Catalog read-only to vendors |
| J-CAT-02 | Assign / propose | `assign_category` | `[proposed]` | Proposal where approval is required |
| J-CAT-03 | Activate | approval per taxonomy governance | `[proposed] → [active]` | Category assignments feed matching by pointer (M3 reads eligibility, Doc-3) |
| J-CAT-04 | Remove | removal (vendor or governance) | `→ [removed]` | Audited; discovery facets refresh |

**Governance rails:** the category **catalog** is M8-governed (J-CATA); assignment ≠ capability —
the 4-flag capability matrix (Invariant #1) stays authoritative for matching, and subscription
can never boost rank (classification/matching Board package).
**Success:** ✔ assignments only into `[active]` categories; ✔ vendor never mutates the catalog;
✔ removal leaves audit.

**Related:** upstream J-CLM · catalog governance J-CATA · discovery display `J-GST-02/03` ·
composed by `J-VND-05`.

---

## C6. Advertisement Lifecycle — `J-ADV`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Advertisement Lifecycle

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (`advertisements`) |
| Participating Modules | M8 (review gate); M7 (purchase = `billing.platform_invoice`, → J-PINV) |
| Authoritative Documents | Doc-2 §5.8 (**ASSUMPTION A-07** — minimal machine), §3 (`advertisements`: placement `landing/bottom/search/vendor_profile`); Doc-4D |
| Read-only References | Doc-7G (campaign manager) · Doc-7H (review queue) |

**Actors:** Primary — vendor User (purchaser org). Supporting — Admin (reviewer). ⚙ System —
schedule/budget triggers.

**Intent arc:** Campaign → Approval → Airtime → Wrap.
**Goal:** paid placement with an explicit review gate — platform ad revenue, never procurement
influence.

**Entry:** vendor profile `[active]`; ad purchase invoiced via J-PINV.
**Exit:** `[completed]` (end date / budget exhausted) — or `[rejected]`.

```
[draft] → submit → [pending_review] → approve → [scheduled] → start date → [active] ⇄ [paused]
                        └→ [rejected]                    [active] → end date / budget exhausted → [completed]
```

| ID | Step | Key actions (pattern · contract) | State (Doc-2 §5.8) | Outcome / governance |
|---|---|---|---|---|
| J-ADV-01 | Create | `create_advertisement` (creative, placement, schedule) | `[draft]` | Carries **ASSUMPTION A-07** — machine is minimal; never harden beyond it |
| J-ADV-02 | Submit | `submit_advertisement` | `[draft] → [pending_review]` | — |
| J-ADV-03 | Review | `review_advertisement` (Admin) | `→ [scheduled]` / `[rejected]` | **Admin reviews before publish** (`J-ADM-03`) |
| J-ADV-04 | Run | ⚙ start date | `[scheduled] → [active]` | Public placements only (`landing/bottom/search/vendor_profile`) |
| J-ADV-05 | Pause / resume | campaign control | `[active] ⇄ [paused]` | — |
| J-ADV-06 | Complete | ⚙ end date / budget exhausted | `[active] → [completed]` | Terminal |

**Governance rails:** ads are **presentation-layer revenue** — an advertisement never re-ranks
M3, never gates matching, and never masquerades as an organic result (Content ≠ Presentation);
purchase/billing is a platform invoice (J-PINV), platform-revenue-only (money boundary).
**Success:** ✔ every airtime preceded by review; ✔ A-07 carried, not hardened; ✔ zero
procurement influence.

**Related:** billing J-PINV · review leg J-ADM-03 · displayed on 7D placements ·
composed by `J-VND-06`.

---

## C7. Vendor Ownership Transfer Journey — `J-VOT`

**Breadcrumb:** Atlas ▸ Marketplace ▸ Vendor Ownership Transfer Journey

| Ownership | |
|---|---|
| Owner Module | M2 Marketplace (profile custody + `vendor_ownership_history`) |
| Participating Modules | M5 Trust (Protection Workflow: freeze → compliance review → reactivation, seam M6-7); M1 (controlling org validity) |
| Authoritative Documents | Doc-2 §5.3 guard + §3 (`vendor_ownership_history`); Doc-4D |
| Read-only References | Doc-7G · Doc-7H |

**Actors:** Primary — current controlling org Owner. Supporting — new controlling org; Trust
reviewer. ⚙ System — freeze trigger.

**Intent arc:** Handover → Protection → Re-establishment.
**Goal:** move a vendor profile between controlling organizations **without laundering trust** —
scores freeze during the handover.

**Entry:** vendor profile with claim ≥ `[claimed]`; both orgs valid (M1).
**Exit:** custody transferred (history appended), Trust Protection Workflow completed
(reactivation).

```
initiate transfer → (VendorOwnershipTransferred) → ⚙ trust freeze → compliance review → reactivate → new custody operating
```

| ID | Step | Key actions (pattern · contract) | Outcome / governance |
|---|---|---|---|
| J-VOT-01 | Initiate | ownership-transfer contracts (Doc-4D) | Both orgs validated via M1 by ID |
| J-VOT-02 | Record | `vendor_ownership_history` append + `(VendorOwnershipTransferred)` | History never rewritten |
| J-VOT-03 | Protect | seam M6-7 → `trust.freeze_trust_score.v1` (+ performance freeze) | **Transfer at any point triggers the workflow** (Doc-2 §5.3 guard) |
| J-VOT-04 | Review | Trust compliance review | Verification standing re-examined (J-VER legs as needed) |
| J-VOT-05 | Reactivate | `trust.reactivate_trust_score.v1` | Scores resume under new custody — never inherited blindly |

**Governance rails:** scores are frozen, not transferred-and-trusted — the workflow exists so
reputation cannot be bought; delegation grants scoped to the profile are re-examined (J-DEL);
claim/status dimensions unchanged by custody itself.
**Success:** ✔ history appended; ✔ freeze preceded operation under new custody; ✔ reactivation
explicit and audited.

**Related:** protection legs J-TSC-04/J-PSC-04, J-VER · custody context J-CLM · **distinct from
J-SUC** (org ownership) — this transfers a *profile between orgs*.

---

## Not Covered (File C ledger)

| Item | Why | Pointer |
|---|---|---|
| Search & Discovery journey | Owned by `J-GST`/`J-BUY` (marketplace_ux.md §2/§3); extension hook = §12 | atlas §8 |
| Category **catalog** management | M8-owned — see J-CATA (File H) | Doc-4J |
| Profile-section/branding/SEO-OG surpluses | Open companion↔corpus surplus register (vendor FE track) — not journeys | vendor_planning_and_design.md |
| Favorites | A discovery affordance (`add_catalog_favorite`) inside `J-GST`/`J-PROC-01`, not a lifecycle | marketplace_ux.md |

*Cross-links:* actor journeys [`../marketplace_ux.md`](../marketplace_ux.md) §2 (`J-GST`), §5
(`J-VND`) · registry [`JOURNEY_ATLAS.md`](JOURNEY_ATLAS.md) §5-C.

*Non-authoritative; coins nothing; on conflict the frozen corpus wins (CLAUDE.md §7/§11).*
