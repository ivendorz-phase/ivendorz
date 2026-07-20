# Digital Showcase — End-to-End Program Planning & Design

| | |
|---|---|
| **Status** | Companion document — **NON-AUTHORITATIVE** · **DRAFT v0.10** (v0.9 + the four owner rulings of 2026-07-20: presets Option B · G3 mint opened · brand-blue active step · AssetVisibility split out, see Disposition Log) · conforms to the FROZEN corpus · **coins nothing** · **PLANNING ONLY** (wave-gated; reorders no roadmap; authorizes no out-of-sequence build; mints no FE/page IDs — Board-only) |
| **Date** | 2026-07-20 |
| **Scope** | The vendor **Digital Showcase** pipeline end-to-end: workspace authoring (`/sell/company*`) → presentation builder (`/sell/microsite*`) → publish → public multi-page microsite (`/vendors/[slug]/*`) → backend realization & wiring. Reference-never-restate: frozen entities/contracts/events are bound **by pointer**. |
| **Precedence** | Frozen corpus (Doc-2 · Doc-4D · Doc-5D · Doc-6D · Doc-7A/7B/7C/7D/7G) → ADR Compendium (incl. ADR-022/024/025 as folded) → Board rulings → `vendor_journey_plan.md` / `vendor_planning_and_design.md` → **this companion**. On any conflict the higher authority wins and this file is corrected. |
| **Siblings** | `vendor_planning_and_design.md` (Doc-7G workspace design, S1–S14) · `vendor_journey_plan.md` (§4 S4 publishing journey, §6 S6 visibility, §8 gap snapshot, §9 candidate list) · `docs/product/benchmarks/public_marketplace_ui_benchmark_and_design_direction.md` (§6.9 public showcase visual rulings) · `governanceReviews/T3-microsite-multipage/*` (QA prep artifacts, uncommitted) |
| **No code** | This document changes no code and no frozen document. |

---

## 0. Carried Flag-and-Halt / gate items

Raised here, **escalated not resolved** (CLAUDE.md §11/§13). Each blocks the phase noted in §6.

- **F1 — Approved-but-unfolded Doc-7D sections (records action).** Doc-7D §10 Multi-Page Route IA (→ v1.1, with ADR-022) and §11 Host Canonicalization (→ v1.2, with ADR-024) are Board-**APPROVED** but the corpus fold is a pending **human records action** (`00_AUTHORITY_MAP.md:163`; ADR-022 banner). Downstream, the Team-3 QA prep artifacts stay uncommitted by Board rule until the fold (`governanceReviews/T3-microsite-multipage/README.md:50-57`).
- **F2 — Template-amendment nav divergence.** The owner-directed amendment to the approved Vendor Profile Template System v1.0 (Industries removed; Resources folded into About → **5-item nav**) diverges from the Board-approved Doc-7D §10.2 **canonical seven** ("no top-level nav item without Board approval"). Recorded in the prototype itself (`prototypes/vendor-profile-templates/README.md:14-21`). Production must not build the 5-item nav without a Doc-7D additive patch + Board sign-off.
- **F3 — Template ↔ `layout_template` mapping — 🟡 AXIS RULED, binding pending.** The five approved design templates (01 Corporate Classic … 05 Business Landing) and the frozen enum `marketplace.microsites.layout_template ∈ {A…E}` (Doc-2:744; Doc-6D Pass2:146) matched only in **cardinality**. **Owner ruling 2026-07-20 (hybrid model)** settles the *axis*: the canonical template axis is **visual layout style** (the approved five), and a **deterministic mapping is proposed** — A→Corporate Classic · B→Modern Industrial · C→Product Catalogue · D→Portfolio & Projects · E→Business Landing. The formal **binding is still a Board mint** (G3, now READY); until recorded, code uses neutral references. **No corpus conflict** — verified 2026-07-20: the corpus treats A–E as opaque slots with zero semantics and names no template anywhere (see §3A conformance note).
- **F4 — Layout-05 single-page vs the canonical 7-route IA.** The approved template system locks Layouts 01–04 as multi-page and Layout 05 as a **single-page Starter**, while Doc-7D §10 (approved) fixes **seven routes** under `/vendors/[slug]`. How a single-page template renders inside the 7-route topology (all routes live with Home composite? sub-routes redirect home?) is undecided — Board design ruling needed before template-driven rendering is built.
- **F5 — `showcase_projects` columns are carried, not frozen.** The aggregate is frozen (Doc-2:141) but Doc-6D deliberately realized only base + `content_jsonb` + interim `is_visible`/`display_order`, carrying **`[ESC-6-SCHEMA-SHOWCASE]`** — typed portfolio columns await a Doc-4D/Doc-5D DTO bind or an additive Doc-2 entry (Doc-6D Pass3:44-47). Project Portfolio authoring UX cannot finalize field shapes before this resolves.
- **F6 — Stale disclosure comment (MINOR, code).** `app/(app)/(workspace)/sell/company/projects/page.tsx:2-4` states "no 'past projects / case studies' concept exists in the frozen corpus today" — contradicted by the frozen `Showcase Project (AR)` (Doc-2:141,293,750) and the four frozen BC-MKT-4 showcase contracts (Doc-5D Pass1:150-155). The gap is real (columns + wiring), but the comment misstates *why*. Correct when the page is next touched.
- **F7 — "Services" and "departments" are NOT frozen content concepts.** The audited temporary reference kits (§3A) demonstrated "engineering services", "disciplines", and "departments" as **presentation structures**. The frozen M2 content model has **no services aggregate and no departments aggregate** — its content surfaces are: public profile, capability matrix (4 flags), categories, products + specs, `showcase_projects`, `profile_sections`, `branding_assets`, `seo_settings`. Any such feature must render as presentation over `profile_sections` (`section_type` + `content_json`) — departments mapping onto admin-governed categories — or be escalated; it must never silently mint a new content aggregate. DS-W2A recorded the per-feature disposition (audit finding M1: confirmed presentation-only, no data model in any kit).
- **F8 — Kit ↔ approved-template correspondence — ✅ FULLY CLOSED.** The claim that the four kits *were* approved Templates 01–04 was audited (DS-W2A) and found unverified — the kits were organized by business type, the approved system by layout style. **Owner ruling 2026-07-20 (§3A.0):** the kits **do not supersede** the approved template system and are **never automatically treated as Templates 01–04**; they are **reference content arrangements only** — so there is no correspondence to mint. **Licensing leg closed 2026-07-20 (§3A.1):** the kit source was deleted from the tree with no code/token/asset reuse, leaving **no continuing licensing dependency** (G3B retired). Historical intake note preserved in the audit §4.

---

## 1. Program thesis

Digital Showcase is the vendor's public-presence value loop and the platform's supply-side storefront: **one M2-owned content model, authored privately, presented through vendor-chosen templates, published atomically, rendered anonymously.** Every stage is governed by **Content ≠ Presentation** (Invariant #9) and **no draft leaks to the public surface** (Doc-5D R5 via Doc-7G §3.1).

The pipeline (all M2; One Module, One Owner):

```
AUTHOR (workspace /sell/company*)      PRESENT (workspace /sell/microsite*)      RENDER (public /vendors/[slug]/*)
  profile · capability matrix            layout_template (A–E) · theme             7-page IA (Doc-7D §10, approved)
  products · specs · categories    →     profile_sections · branding · SEO    →    published-only projections
  showcase projects                      custom domain (entitlement, DD-5)         byte-equivalent 404 (Inv #11)
  (BC-MKT-1/2/3, part of 4)              publish/unpublish (BC-MKT-4)              (BC-MKT-6 public reads)
```

Advertising (BC-MKT-5) rides alongside as paid presence; favorites (BC-MKT-7) is the demand-side echo. Trust appears **only** as the binary Verified badge publicly and a read-only panel in the workspace — never computed or mutated here (Golden Rule 3).

## 2. Method & conformance posture

Lenses: program sequencing (what unblocks what) · governance conformance (every step bound to a frozen pointer) · honest-state UX (VX-03: wired read or disclosed placeholder, never fixtures) · reuse of the approved prototype, frozen frontend kit, existing production pages, and normalized DS-W2A design direction; no removed kit source is reused. This plan **proposes** milestones and rulings; the Board mints IDs and rules on escalations (Raise ≠ Accept).

---

## 3. Current-state register (the honest inventory, 2026-07-20)

Design corpus: **complete.** Doc-5D specifies **71 M2 contracts across BC-MKT-1…7**, freeze-ready (DD-6 resolved; DD-7 tracks `claim_vendor_profile`; DD-8 blocked on the absent `VendorBanLifted` event). Doc-6D realizes all 21 `marketplace` tables as frozen DDL.

Code: **presentation is far ahead of the backend.**

| Surface | Route | FE state | Contracts (pointer) | Backend state |
|---|---|---|---|---|
| Company Profile (S1–S4) | `/sell/company` | ✅ Built (FE-VEN-02) — genuine-empty | BC-MKT-1 · 11 contracts (Doc-5D §4) | **0 implemented** |
| Categories (S5) | `/sell/company/categories` | ✅ Built (FE-VEN-04) | BC-MKT-2 assign/list (Doc-5D §5) | **0 implemented** |
| Products + Specs (S6–S7) | `/sell/company/products`, `/spec-library` | ✅ Built (FE-VEN-04; P-VND-10 ⛔ `ESC-7-API/upload`) | BC-MKT-3 (Doc-5D §5) | **0 implemented** |
| **Project Portfolio** | `/sell/company/projects` | ⛔ `ImplementationPendingView` — no P-VND ID minted | BC-MKT-4 showcase ×4 (Doc-5D Pass1:150-155) | **0 implemented** + F5 columns carried |
| Microsite & Branding (S10–S14) | `/sell/microsite` | ✅ Built (FE-VEN-03) — opaque "Template A–E" picker | BC-MKT-4 · 20 contracts (Doc-5D §6) | **0 implemented** |
| Advertising | `/sell/microsite/ads` | ✅ Built (FE-VEN-13; P-VND-13 create-only) | BC-MKT-5 ×6 (Doc-5D §7) | **0 implemented** |
| Public microsite (7 routes) | `/vendors/[slug]/*` | ✅ Built (FE-PUB-03 + FE-PUB-11 project detail P-PUB-25) — **static discovery seed**, `[ESC-7-API-CATNAV]` interim | BC-MKT-6 (Doc-5D §8 + PublicProductDetail patch) | **3 reads on unmerged `wave/3-marketplace` only** (`get_public_vendor_profile` · `list_vendor_directory` · `resolve_vendor_slug`); `search_catalog` + `get_public_product_detail` unbuilt |
| Template system | `prototypes/vendor-profile-templates/` | ✅ Owner-approved v1.0 visual baseline (amendment pending re-approval, F2) | renders `layout_template` A–E (F3 mapping unminted) | n/a |
| Database realization | `prisma/schema.prisma` · `prisma/migrations/` | — | Authoritative DB contract: **21 `marketplace` tables** (Doc-6D frozen DDL) | Repository realization: **0 Prisma `marketplace` models · 0 marketplace table migrations** (the init migration creates only the empty `marketplace` schema shell; the name sits in the multiSchema list) |

Program parking: **M2.5 public-microsite continuation is owner-gated** (Board standing agenda #5, `project-management/execution-board.md:258,283`). Wave-3 exit gate is not yet gated; M2 branch merge is owner-gated per-module.

---

## 3A. Vendor Profile Template Register

The program includes **five approved vendor-profile presentation templates** (Template System v1.0,
owner-approved 2026-07-08). They are **presentation assets owned by M2** rendering the **same
governed vendor content model** — they own no business data, aggregates, contracts, publication
states, or route semantics. This register makes them explicit first-class deliverables rather than
a prototype footnote.

### 3A.0 Owner ruling — the hybrid model (2026-07-20) · **CLOSED**

> **The canonical template axis is visual layout style.** The five approved templates —
> **01 Corporate Classic · 02 Modern Industrial · 03 Product Catalogue · 04 Portfolio & Projects ·
> 05 Business Landing** — remain the sole canonical template identities.
>
> **The four supplied kits do not supersede this system and must never be treated automatically as
> Templates 01–04.** They are **reference content arrangements only**: kit-01 manufacturer/
> fabricator-oriented · kit-02 engineering-service-oriented · kit-03 catalogue/retailer-oriented ·
> kit-04 hybrid supply-and-service.
>
> **Business type, capability, and available content determine which sections are emphasized** —
> they must **not** create separate canonical template identities and must **not** lock a vendor
> into a template.

**Proposed deterministic mapping for the G3 mint** (owner-proposed; no authoritative conflict found):
**A → Corporate Classic · B → Modern Industrial · C → Product Catalogue · D → Portfolio & Projects ·
E → Business Landing.**

**Conformance note (why the hybrid model fits the frozen model better than the alternative).** The
ruling splits cleanly along an existing frozen seam: **visual style** is carried by
`microsites.layout_template` (one enum, one choice), while **section emphasis** is carried by
`profile_sections.display_order` + `is_visible` (per-section, content-driven) — exactly the
Content ≠ Presentation split (Inv #9). Had the business-type axis become canonical, template identity
would have had to encode vendor type, pressing on `vendor_type_preset` whose values are unenumerated
under the **open** `ESC-MKT-VENDORTYPE` and colliding with Invariant #1 (capability is a 4-flag
matrix, not a label). The hybrid ruling avoids that entirely.

**Frozen-corpus verification (2026-07-20, no conflict):** `layout_template` is an **opaque** enum in
every frozen occurrence — Doc-2:744 (`layout_template(A–E)`), Doc-4D PassB:18
(`enum(A|B|C|D|E) : required` on create), Doc-6D Pass2:146 (`CREATE TYPE marketplace.microsite_layout
AS ENUM ('A'…'E')`). **No frozen document assigns any meaning to any letter, and none of the five
template names appears anywhere in `generatedDocs/`.** The mapping is therefore a free mint, not an
override. **One consequence to note at the mint:** Doc-6D Pass2:152 freezes
`layout_template … DEFAULT 'A'`, so **A → Corporate Classic makes Corporate Classic the DB-level
default** for any microsite row created without an explicit choice (the Doc-4D create contract marks
the field `required`, so the default is a backstop, not the normal path). Flagged for the Board's
awareness — not an objection.

### Supplied implementation references

Four static reference kits were supplied as **temporary research inputs**, audited on 2026-07-20, and
then **deleted from the working tree by owner decision** (§3A.1). They were never committed. The
retained output is the audit —
`governanceReviews/DS-W2A-template-audit/DS-W2A_Template_Manifest_and_Audit_v0.2.md`, whose **§3B
carries the normalized design direction** — plus this section. Summary of what they were:

| Neutral ID (permanent) | Source | Reference arrangement (mock vendor) | Pages · nav | Status |
|---|---|---|---|---|
| kit-01 | `vendor/` | Manufacturer / fabricator-oriented (*Meghna Steel*) | 5 · Home/About/Products/Projects/Contact | Audited · reference-only |
| kit-02 | `vendor2/` | Engineering-service-oriented (*Axis Engineering*) | 5 · Home/About/**Services**/Projects/Contact | Audited · reference-only |
| kit-03 | `vendor3/` | Catalogue/retailer-oriented (*Hatiyar Hardware*) | 5 · Home/**Shop**/**Departments**/About/Contact | Audited · reference-only |
| kit-04 | `vendor4/` | Hybrid supply-and-service (*Orion Trading*) | 5 · Home/Products/**Services**/About/Contact | Audited · reference-only |

Per §3A.0 these are **arrangements, not templates**: each demonstrates *which sections to emphasize*
for a business shape, and that emphasis is realized through `profile_sections` order/visibility over
**any** chosen layout template — never by minting a template identity. Separately, the canonical
**Template 05 (Business Landing, single-page)** has **no supplied implementation artifact** — G3A
stays open (locate or commission).

**Headline audit finding — RULED (§3A.0).** The kits are organized by **vendor business type**,
whereas the approved Template System v1.0 names its five by **visual layout style**. These are
different taxonomies, so "4 kits = approved Templates 01–04" was never established. The owner
**ruled the hybrid model**: layout style stays canonical; the kits are **reference content
arrangements**, never template identities, and never lock a vendor to a template. Kits keep their
neutral IDs (kit-01…kit-04) permanently — there is no kit↔template binding to mint, only the
name↔letter mapping in §3A.0.

These were **visual and interaction references only**. Their vendor names, figures, products,
services, departments, nav labels, routes, and CTAs were demonstration content with **zero domain
authority** — and every kit's home hero carried a **fabricated trust panel** (numeric score, stars,
performance %, job counts) that **breaches the trust-display firewall**; DS-W2A-B1 survives as an
implementation guardrail requiring that **no such panel is ever recreated** (binary Verified badge only).

### 3A.1 Artifact removal — owner decision 2026-07-20 · **CLOSED**

> The supplied kit source files (`iVendorz Kit/` and all `iVendorz Kit*.zip`) are **removed from the
> repository working tree** now that the audit has preserved the design direction in governance
> documents. No kit HTML, CSS, JavaScript, component, token, manifest, or demo asset is copied,
> relocated, committed, or otherwise preserved.

Statements of record:

- The kits were **temporary research inputs**, never a deliverable and never committed.
- **DS-W2A extracted the useful presentation patterns**; the retained output is the audit manifest
  (esp. **§3B normalized design direction**) plus this plan.
- **Implementation will be recreated** on the frozen `--iv-*` token system and production
  (Doc-7B) components — **DS-P2 builds from the documented design specification and the approved
  prototype (`prototypes/vendor-profile-templates/`), never from kit source code.**
- **No kit code, token, business rule, data, or route structure is retained or required.**
- The **canonical five remain layout-style templates** (§3A.0), unchanged by this removal.
- The **four business-shaped arrangements remain documented presentation guidance only** — section
  emphasis via `profile_sections`, never template identities, never vendor-locking.
- **Provenance/licensing (historical):** unrecorded at intake (a v0/SPA export). **Disposition:**
  source artifacts removed · no code reuse · **no continuing licensing dependency** ⇒ **G3B retired**;
  licensing no longer blocks implementation.

### Required governance bindings (before production integration)

The Board must bind:

1. each approved template name to exactly one frozen `layout_template` value under **G3**;
2. Template 05 single-page behavior within the canonical route topology under **G4**;
3. visible navigation composition without changing canonical route capability under **G2**.

**No kit-to-template identity binding exists or is required** (§3A.0). Until the G3 mint is
recorded, production code uses **neutral internal references**.

### Shared-content rule

All five templates consume the **same published M2 projection**, bound to frozen surfaces only:
vendor identity + public profile · capability matrix (4 flags) + category presentation · products +
specifications · `showcase_projects` · published `profile_sections` · branding + SEO configuration ·
contact/inquiry intents (routing to `(auth)` — no anonymous mutation) · the binary public Verified
signal. A template may alter layout, hierarchy, density, visual grammar, section placement, and
navigation presentation. It must **not** alter content ownership, publication rules, authorization,
public disclosure, canonical identity, or backend contracts. *(“Services”/“departments” are not in
this list deliberately — see F7: presentation over `profile_sections`, or escalate.)*

### Applicability, not separate data models

Template selection must never create vendor-type-specific persistence. Manufacturer, service,
retailer, trader, contractor, and hybrid vendors all use the one M2 content model; a template may
*emphasize* the sections most relevant to a vendor while unavailable/unpublished sections stay
hidden under the governed section-visibility rules.

### Implementation approach

Phase 2 implements the documented visual direction through:

- the approved template prototype (`prototypes/vendor-profile-templates/`);
- the DS-W2A normalized design specification (audit §3B);
- frozen Doc-7B components and `--iv-*` tokens;
- one shared public runtime (DS-P1);
- five canonical presentation compositions (DS-P2).

**No removed kit source is imported, translated, copied, or decomposed.** No duplicated business
rule, publication check, entitlement check, trust logic, or route-resolution logic may exist inside
an individual template.

## 4. Target end-state (what "done" means)

1. A vendor authors profile/products/specs/projects in the workspace; every field maps to a frozen column or a Board-bound DTO — nothing invented.
2. The vendor picks one of five named templates (bound to `layout_template` A–E per the G3 mapping — **proposed, mint pending**), arranges `profile_sections`, sets branding/SEO/domain, previews, and publishes — draft never leaks.
3. `/vendors/[slug]/*` renders the published projection through the chosen template over the canonical 7-page IA, anonymously, with byte-equivalent 404 on every route and only the binary Verified trust signal.
4. All reads/writes ride wired Doc-5D contracts; the discovery seed and `[ESC-7-API-CATNAV]` interim are retired; audit actions bind per `[ESC-MKT-AUDIT]` disposition; events emitted are exactly the Doc-2 §8 set (`MicrositePublished`, `ProfilePublished/Unpublished`, `ProfileThemeChanged/LayoutChanged`, `MicrositeDomainChanged` — **no** `ProductPublished`/`ShowcasePublished` exists to emit).

---

## 5. Governance gates (own the sequence)

| Gate | What | Channel / owner | Unblocks |
|---|---|---|---|
| **G1** | Records folds — one batch, **executed in sub-gate order A→D** so a partial fold is never mistaken for complete. Order adjusted from the raising review: the rank-1 instrument (ADR-022) folds **before** its Doc-7D realization, per the §7 authority order. | **Human records action** | (umbrella — see A–D) |
| **G1-A** | Fold ADR-022 into `generatedDocs/` alongside the ADR Compendium; register its Authority Map row. Verify: ADR-022 listed at rank 1; proposal file marked folded. | Human records action | G1-B (the §10 patch realizes ADR-022) |
| **G1-B** | Fold Doc-7D §10 Multi-Page Route IA → **v1.1**. Verify: version bump in the Doc-7D Authority Map row; §10 present in the effective series. | Human records action | Canonical-seven becomes binding corpus text; G2 ruling has a folded base |
| **G1-C** | Fold Doc-7D §11 Host Canonicalization → **v1.2** (its ADR-024 is already folded — no instrument dependency). Verify: version bump; §11 present. | Human records action | Host-resolution work cites corpus, not a proposal |
| **G1-D** | Authority Map + dependent-pointer verification sweep: Doc-7D row shows v1.2 with no "folds pending" remnant; `esc_registry`/companion pointers re-checked; **T3 prep-artifact governance commit executes** (per its own Board-ruled sequence). | Human records action + verification | T3 artifact commit; any nav/IA change; Phase 2 |
| **G2** | Rule the template-amendment nav (F2): re-affirm canonical seven (recommended — treat the amendment's merges as *within-page content arrangement*, not nav topology) or approve a Doc-7D additive patch | Owner/Board | Amended template visuals in production |
| **G3** | 🟡 **READY — owner-PROPOSED binding, formal Board mint PENDING** (status corrected 2026-07-20, owner ruling §4; the earlier "MINTED" entry overstated an in-chat owner statement — see the v0.9 Disposition Log). Proposed: **A→Corporate Classic · B→Modern Industrial · C→Product Catalogue · D→Portfolio & Projects · E→Business Landing**. Axis = visual layout style (§3A.0); corpus verified conflict-free (the five names appear NOWHERE in `generatedDocs/`); frozen `DEFAULT 'A'` ⇒ Corporate Classic would become the DB-level default. Kit↔template binding **struck**. The naming lives in one presentation module (`app/(app)/_components/vendor/microsite/template-catalog.ts`), whose header records the PROPOSED status; **nothing derives behaviour from a name and no production code treats the binding as authoritative**. Mint requires a formal G3 governance artifact: created → reviewed → folded into `generatedDocs/` → registered in the Authority Map. | Owner/Board — **mint pending** | DS-W2B is BUILT on the proposed labels; authoritative semantics await the mint |
| **G3A** | 🔴 **OPEN** — canonical Template 05 (Business Landing, single-page) has **no design artifact**: locate or explicitly commission it. *(Kit↔template correspondence leg struck per §3A.0; licensing leg closed per §3A.1.)* | Owner | DS-P2 composition scope complete (all five renderable) |
| ~~**G3B**~~ | ✅ **RETIRED 2026-07-20 (§3A.1)** — kit source removed; no code/token/asset reuse and no continuing licensing dependency, so provenance no longer gates implementation. Historical note preserved in the audit §4. | — | — |
| **G4** | Rule Layout-05 single-page semantics inside the 7-route IA (F4) | Board | Template E (Starter) rendering |
| **G5** | 🟡 **FIELD SET RULED 2026-07-20 (owner); corpus patch still OWED.** Ruled set: title · sector · client **descriptor** · period · summary · scope highlights · gallery refs, over the FROZEN interim `display_order`/`is_visible`. **The ruling authorized the FE build only** — the fields are carried inside the frozen `content_jsonb` carrier (so no frozen doc is contradicted). `[ESC-6-SCHEMA-SHOWCASE]` stays **OPEN** until an additive Doc-2/Doc-4D/Doc-5D patch binds them as columns — a **human** records action (§7/§8), not an AI act. | Owner ruled → Board patch owed | ✅ DS-W1 built (presentation); **backend wiring still gated on the patch** |
| **G6** | Disposition `[ESC-MKT-AUDIT]`: audit-action binding for ad review / publish / domain / showcase writes (bind to nearest Doc-2 §9 action per D7 pattern — never invent) | Board | BC-MKT-4/5 **write** wiring |
| **G7** | Public-read gaps: `[ESC-7-API-CATNAV]` (public category tree) and `[ESC-7-API-ADS]` (anonymous ad read). **Deferred extensions — explicitly NON-BLOCKING for the core showcase launch** (§6 Phase 4); the registered interim postures stand until ruled. | Board (additive Doc-5D patches) | Category-nav seed retirement; public ad rendering — nothing else |
| **G8** | Un-park **M2.5 continuation** | Owner (Board agenda #5) | Phase 2 entry |
| **G9** | M2 backend build-wave authorization (+ Wave-3 exit-gate closure; DD-7 claim finalization; DD-8 `VendorBanLifted`) | Owner / Build Roadmap | Phase 3 entry |

---

## 6. Phase plan

Phases run in order; later phases may start per-surface where their own gates clear. Every FE milestone/page ID below is a **candidate — Board to mint**.

### Phase 0 — Governance closure (no code)
Execute G1–G6 (G7 may trail). Deliverables: the records folds; a Board packet covering F2/F3/F4 in one sitting (they are one decision cluster: *what the five templates are, called, and mapped to*); the `[ESC-6-SCHEMA-SHOWCASE]` additive patch proposal; the `[ESC-MKT-AUDIT]` disposition proposal. Exit: F1–F5 all ruled.

### Phase 1 — Workspace completion (presentation, FE — Track 3)
- **DS-W1 · Project Portfolio page** — ✅ **BUILT 2026-07-20** (presentation-only). `app/(app)/_components/vendor/showcase/` (types · list · form · visibility chip · barrel) composed at `/sell/company/projects`, replacing `ImplementationPendingView`. Genuine-empty list, editor with the G5-ruled fields, Save/Publish disabled naming their unimplemented contracts; no fixture rows (VX-03); no governance signal on the surface; no status enum coined (visibility = frozen `is_visible` boolean). **F6 fixed** in the same pass. Realizes journey-plan §9 candidate #5. Backend wiring remains gated (G5 patch owed + Phase 3).
- **DS-W2A · Template artifact audit and canonicalization — ✅ DONE.** Record: `governanceReviews/DS-W2A-template-audit/DS-W2A_Template_Manifest_and_Audit_v0.2.md` (manifest + 7 ranked findings).
  - Four temporary reference artifacts were audited.
  - The template-axis conflict was resolved by the owner's hybrid ruling (§3A.0).
  - The source artifacts were removed (§3A.1).
  - The normalized design direction was retained (audit §3B).
  - Business Landing remains open under **G3A**.
  - The fabricated trust-panel prohibition (DS-W2A-B1) remains an implementation guardrail.
- **DS-W2B · Named template selection** — ✅ **BUILT 2026-07-20.** The opaque `Template A…E` select on `/sell/microsite` is replaced by five named cards driven by `template-catalog.ts` (naming PROPOSED — G3 mint pending); native radios keep the surface Server-rendered (no hooks, works without JS); all five are always offered (no business-type restriction, no auto-mutation); the written value is the unchanged frozen `layout_template`. Spec below retained as the requirement of record. *(Original entry: supersedes v0.2's DS-W2; entry G3 mint + DS-W2A, +G2 for nav.)* Replace the opaque `A–E` radio with five named cards (the canonical five per §3A.0): name · preview image · use-case description · section emphasis · multi-page/single-page indicator · selection state · preview action. Template *recommendations* may show as **non-binding guidance** driven by content availability and the 4-flag capability matrix — never by a coined vendor-type taxonomy (`ESC-MKT-VENDORTYPE` open) — and never auto-mutate the selection. **Per §3A.0 the vendor is never locked to a template by business type**; the kits' business-shaped arrangements inform *section emphasis* defaults (`profile_sections` order/visibility), not template identity. Binds the same `update_microsite.layout_template` field.
- **DS-W0 · Authoring journey** — ✅ **BUILT 2026-07-20**; **DS-W0-R1 CONVERGENCE APPLIED 2026-07-20** (owner approved the v0.2 prototype as the production visual source of truth). **THREE steps on ONE route**, selected by the allowlisted `?step=overview|design|publish` param on `/sell/company/journey` — the established workspace idiom (`?view=` on `/sell/rfqs`), so browser Back/Forward walk the journey, every step is linkable, and all three stay server-rendered. **No route and no page ID minted.** Step 1 is `JourneyOverview` (status · selected template · visible sections · content sources · Content ≠ Presentation); steps 2 and 3 **compose the existing Microsite panels** (`MicrositeBuilder`, `PreviewPublishPanel`) rather than re-implementing them — one editor, one preview, two entry points (this journey and the full `/sell/microsite` surface with its Branding/SEO/Domain tabs). `JourneyStepRail` carries the prototype's sidebar journey nav in-page (the platform shell owns the real sidebar and `NavItem.children` is one level deep). Project Portfolio is **not** a step: removed from the journey nav, step cards, readiness, CTAs and dependencies, while `/sell/company/projects`, its content capability and the public Projects section are untouched. Departures from the prototype, all required: no gate identifiers in vendor copy, no sample content (VX-03 — the arrangement chips and per-row order/visibility handles render **disabled** since no sections read is wired), and the binary Verified badge renders only from an M5-owned `verified` prop, never assumed true.
- **DS-W3 · Preview & publish alignment** — 🟡 **PARTIAL 2026-07-20.** S14 now names the selected template from the same catalogue the builder writes (naming PROPOSED — G3 mint pending) (builder and preview can never disagree). The template-specific 7-route rendering it previews is Phase-2 work and **Template E route semantics remain gated on G4**. No new capability.

### Phase 2 — Public productionization (M2.5 continuation — Track 1/owner-gated)
Entry: **G8** + G1/G3/G4. **Productionize all five canonical vendor-profile templates through one shared public showcase runtime.** Build source = the **documented design specification** (audit §3B normalized design direction) + the **approved prototype** (`prototypes/vendor-profile-templates/`), realized on the frozen `--iv-*` tokens and Doc-7B components — **never from kit source, which no longer exists** (§3A.1). Still seed-fed until Phase 4 — template work must not wait on the backend. SEO completion rides the proposed FE-PLAT-01.

- **DS-P1 · Shared public showcase runtime.** Entry: G1+G3+G4+G8. One shared runtime owns: canonical vendor resolution · published-only loading · banned/unknown/unpublished non-disclosure · byte-equivalent 404 · canonical metadata · route context · common inquiry intents (→ `(auth)`) · Verified-badge projection · analytics hooks. **Individual templates never reimplement these.**
- **DS-P2 · Five-template composition layer.** Entry: DS-P1 + completed DS-W2A manifest. Five presentation compositions over the shared runtime; each may define header/nav presentation, hero treatment, page/section composition, product/project presentation, density, responsive layout, and theme-token application (Doc-7B microsite theme-override). Each consumes the same normalized published projection and shared section primitives. **No template-specific query, contract, publication state, authorization rule, or content fork.**
- **DS-P3 · Cross-template equivalence verification.** Same published dataset across all five templates must prove: (1) zero semantic data divergence; (2) hidden/draft sections absent in every template; (3) identity + canonical URLs stable across template changes; (4) changing template neither republishes nor modifies content; (5) canonical routes obey the G4 ruling; (6) unknown/unpublished/banned → byte-equivalent 404; (7) responsive + accessibility bars met; (8) template changes surface only the frozen layout/theme behavior (`ProfileLayoutChanged`/`ProfileThemeChanged` by pointer — nothing else emitted); (9) no fabricated metrics or leftover kit demo content; (10) preview and published rendering share one composition engine over different governed projections.

Exit: five templates render the same content model with zero content divergence (Content ≠ Presentation proof in production), DS-P3 all-green.

**Dependencies:** DS-W2A ✅ done → G3+G3A → DS-W2B · G1+G3+G4+G8 → DS-P1 → (+ audit §3B design direction + approved prototype) DS-P2 → DS-P3.

### Phase 3 — Backend realization (M2 module team — wave-gated)
Entry: **G9**. Sequence:
1. **Prisma realization** of the Doc-6D `marketplace` DDL (21 tables → models + migration) — everything sits behind this.
2. **BC-MKT-6 completion**: merge the `wave/3-marketplace` reads; build `search_catalog.v1` + `get_public_product_detail.v1`. *Public reads first — they light up the already-built public site.*
3. **BC-MKT-1** profile/capacity/tier writes (DD-7 gates `claim_vendor_profile` only).
4. **BC-MKT-2/3** categories/products/specs.
5. **BC-MKT-4** profile experience: microsite CRUD/publish, sections, branding, SEO, domains (entitlement via wired billing read, Inv #10), showcase (post-G5). Emits only the Doc-2 §8 events, via outbox.
6. **BC-MKT-5** advertising (post-G6) + **BC-MKT-7** favorites; out-of-wire reflectors last (DD-8 leg stays non-implementable until `VendorBanLifted` exists).

### Phase 4 — Wiring & verification (per-surface gates)
Order: public reads → workspace reads → workspace writes → publish flows. Per surface: replace seed/genuine-empty with the wired contract; verify **no-draft-leak** (draft content absent from every public byte), **byte-equivalent 404** on all 7 routes + project detail, entitlement gating on domains/ads, and zero fabricated figures. Exit per surface: `/ivendorz-verify-fe` + Review-A/B per the FE pipeline; CI is the build oracle.

**Core launch vs deferred extensions (launch boundary).** The **core Digital Showcase launch** = vendor profile · products/specs · projects · template rendering · publishing · the canonical public routes — gated only on G1–G6/G8/G9 and the wiring above. **Deferred extensions** = public category navigation (`[ESC-7-API-CATNAV]`) and anonymous ad rendering (`[ESC-7-API-ADS]`) — G7 blocks *their* seed slices only, never the core launch; the microsite is production-ready with those interims still standing. "Full seed retirement" (§4 item 4) is therefore a post-core exit, not a launch criterion.

---

## 7. Candidate WBS additions (Board to mint — none coined here)

| Candidate | Phase | Owns (candidate pages) | Precedent |
|---|---|---|---|
| FE-VEN-«next» Project Portfolio | 1 | new P-VND-«next» (list + editor) | journey-plan §9 #5; page-ID mint ritual per `fe-program-wbs.md:9-29` |
| FE-VEN-«next» Template picker & preview | 1 | delta on P-VND-05/06 | VX-01/VX-03 precedent |
| M2.5-C1…Cn Public template rendering | 2 | delta on P-PUB-13..17, P-PUB-25 | ADR-022 WBS M2.8–M2.16 frame |
| FE-PLAT-01 SEO completion | 2 | (already proposed in WBS) | `fe-program-wbs.md:191` |
| W«n»-MKT-* backend slices | 3 | n/a (backend office tracker) | W3-MKT-1/2 pilot pattern |

---

## 8. Conformance & guardrail register

| Rule | Where it bites in this program |
|---|---|
| Content ≠ Presentation (Inv #9) | Template/theme/sections own no content; publish mutates no content row. Five templates ↔ one data model is the proof. |
| No draft leak (Doc-5D R5 · Doc-7G §3.1) | Builder edits the draft projection; public surface renders published-only. Phase-4 verification item. |
| Byte-equivalent 404 (Inv #11) | Every public route via `loadVendorOr404`; unknown ≡ unpublished ≡ banned-hidden. |
| One Module, One Owner | Entire pipeline is M2; billing checked via wired entitlement read (Inv #10 — never plan-name); trust read never computed. |
| Trust firewall (Golden Rule 3) | Public = binary Verified badge only; workspace Trust panel read-only, separate nav group. |
| Users act, orgs own (Inv #5) | All writes under server-validated controlling-org context. |
| Nothing overwritten (Inv #8) | Specs supersede, never overwrite; tier history append-only. |
| Events/audit by pointer | Only Doc-2 §8 marketplace events; audit actions await G6 — never invented in code (D7 pattern). |
| No fabricated data (VX-03 · reference-fidelity directive) | Wired read or disclosed placeholder; no invented stats/figures on any surface. |
| Frozen FE foundation + motion standard | Frozen Doc-7B primitives, `--iv-*` tokens, and `@/frontend/motion` vocabulary only. |

---

## 9. ESC / carried-item register (pointers, no restatement)

Open: `[ESC-6-SCHEMA-SHOWCASE]` (G5) · `[ESC-MKT-AUDIT]` (G6) · `[ESC-7-API-CATNAV]`, `[ESC-7-API-ADS]` (G7) · `ESC-7-API/upload` (P-VND-10/25) · `ESC-MKT-SUBDOMAIN-MIGRATE` · `ESC-MKT-VENDORTYPE` · DD-7 (claim) · DD-8 (`VendorBanLifted`). Resolved-in-design-only: `ESC-7-API-PRODDETAIL` (contract folded 2026-07-03; backend read unbuilt). Records-pending: Doc-7D v1.1/v1.2 + ADR-022 folds (G1).

## 10. Decision asks (Board/owner, one packet where possible)

1. **G1** — schedule the records folds (unblocks the most for the least effort).
2. ~~**Template-set canonicality**~~ — ✅ **CLOSED 2026-07-20 (owner): hybrid model.** Layout style stays the canonical axis; kits are reference arrangements only, never template identities, never vendor-locking (§3A.0).
3. **G2+G3+G4** — canonical-seven nav disposition; **G3 formal mint** of the proposed A–E mapping (§3A.0 — ready, conflict-free); Layout-05/Template-E semantics. Recommendation (unchanged): re-affirm the seven; Template E renders all content on Home with sub-routes 308-redirecting home.
4. **Trust-panel firewall (from audit DS-W2A-B1, BLOCKER).** Confirm the disposition: normalization strips every kit's fabricated trust panel (score/stars/performance %/counts) to the binary Verified badge only. No production template renders a numeric trust or performance signal.
5. **G3A** — locate or commission the missing **Business Landing** design artifact (the fifth canonical template). *(G3B retired — §3A.1.)*
6. **G5** — commission the `showcase_projects` DTO-bind additive patch.
7. **G8** — un-park M2.5 with Phase 2 as its scope definition.
8. Confirm the **public-reads-first** wiring order (§6 Phase 3 step 2).

---

## Disposition Log (Raise ≠ Accept — §13 Validate-Findings gate)

**v0.1→v0.2 review (external reviewer, 2026-07-20; author-adjudicated):**

| Finding | Ruling | Disposition |
|---|---|---|
| MINOR-1 — G1 bundles four records artifacts with no fold order or per-artifact verification | **ACCEPT, with adjustment** | Split into G1-A…G1-D (§5). Order adjusted from the raised proposal: ADR-022 (rank-1 instrument) folds **before** its Doc-7D §10 realization, per the §7 authority order; §11 third (ADR-024 already folded); Authority-Map/pointer verification last. Not a new governance decision. |
| MINOR-2 — G7 could be read as blocking the whole program | **ACCEPT** | G7 marked explicitly non-blocking for the core launch (§5); Phase 4 gains the core-launch vs deferred-extensions boundary; "full seed retirement" reclassified as a post-core exit, not a launch criterion. Consistent with the ESC registry's standing interim postures. |
| NITPICK-1 — "schema declared, 0 models" ambiguous between doc-level and ORM-level schema | **ACCEPT (NIT, applied)** | §3 row split into authoritative DB contract (Doc-6D, 21 tables) vs repository realization (0 Prisma models · 0 table migrations). Verified before wording: the only marketplace artifact in `prisma/migrations/` is the empty `CREATE SCHEMA` shell in the init migration. |

**v0.2→v0.3 review (external reviewer, 2026-07-20 — "template register" patch; author-adjudicated):**

| Finding | Ruling | Disposition |
|---|---|---|
| Templates should be explicit first-class deliverables (§3A register + DS-W2A/W2B + DS-P1/P2/P3 + G3A + Phase-2 wording) | **ACCEPT, with corrections** | Folded as §3A, Phase-1/2 work packages, G3 refinement + G3A, dependency chain, Phase-2 lead rewording. |
| Correction 1 (author): proposal's shared-content rule listed "engineering services where applicable" as part of the published projection | **CORRECTED** | No services (or departments) aggregate exists in the frozen M2 model — the shared-content rule binds to frozen surfaces only; services/departments render via `profile_sections` or escalate. Raised as **F7**; DS-W2A records per-feature dispositions. |
| Correction 2 (author): proposal treats the four kits as Templates 01–04 implementations with the fifth missing | **QUALIFIED** | The correspondence was itself unverified at the time (kits not yet inspected; descriptions were the reviewer's report). Raised as **F8**; the DS-W2A audit then disproved the correspondence and the owner ruled the hybrid model (§3A.0); artifacts subsequently removed (§3A.1). *Historical entry — superseded by v0.5/v0.6.* |
| Recommendation guidance in DS-W2B by "business classification" | **QUALIFIED** | Accepted as non-binding guidance, but inputs restricted to content availability + the 4-flag capability matrix — no coined vendor-type values while `ESC-MKT-VENDORTYPE` is open (Invariant #1 precedent: vendor-type labels rejected at FE-PUB-09). |

**v0.8→v0.9 — OWNER RULINGS (2026-07-20): prototype APPROVED · DS-W0-R1 APPROVED · G3 status CORRECTED.** The owner approved prototype v0.2 as **the production visual and interaction source of truth** and approved **DS-W0-R1**, converging production onto the ruled three-step journey. Delivered (presentation-only; no read is wired): `/sell/company/journey` becomes a three-step flow on ONE route via the allowlisted `?step=` param — **no route, page ID, contract, event, field, or aggregate minted**. New: `journey-steps.ts` (step model + `parseJourneyStep`), `journey-nav.tsx` (`JourneyStepRail` + `JourneyStepNav`), `journey-overview.tsx` (replaces the four-step `authoring-journey.tsx`, DELETED). Steps 2–3 **reuse** `MicrositeBuilder` / `PreviewPublishPanel` — re-implementing them would have been a duplication finding — so the same convergence lands on `/sell/microsite` too: the builder gains the "Arrange your sections" heading, the four documented arrangement starting points and per-row order/visibility handles (all **disabled** pending `update_profile_sections.v1`), and "Save layout" → "Save design"; the preview panel gains the browser-chrome frame, CSS-only desktop/mobile widths (native radios + `has-[]`, so it stays RSC with no client boundary), the structural section preview in the vendor's arranged order, and the trust statement. Nav: `activeAcrossQuery: true` on the journey entry so it stays lit across `?step=`. **Project Portfolio removed from the journey** (nav, step cards, readiness, CTAs, dependencies) while its route, content capability and public section are untouched — verified independently reachable. Defect found and fixed during verification: the long step-2 CTA hit the kit Button's `whitespace-nowrap` and pushed a 390px viewport into horizontal scroll; the journey buttons now wrap.

**v0.9 — REVIEW-A ADJUDICATION (§13 Validate-Findings; Raise ≠ Accept).** Independent Review-A returned **REVISION REQUIRED — 1 BLOCKER · 4 MAJOR · 8 MINOR · 3 NITPICK · 4 OBS**. Author dispositions, each tested against Valid? / Applicable? / Best for the product? / Corpus-consistent?:

| Finding | Disposition | Action |
|---|---|---|
| **B1** — the four business-shape arrangement presets ("Manufacturer / fabricator" · "Engineering service" · "Catalogue / retailer" · "Hybrid supply & service") render a coined vendor-type label family in production while `ESC-MKT-VENDORTYPE` is OPEN and FE-PUB-09 (2026-07-03) already REJECTED that family on **Invariant #1** grounds; "Hybrid" also collides with a reserved Invariant #2 Participation term | **VALID · ESCALATED — Flag-and-Halt (§11), NOT resolved locally** | Presets **WITHHELD from production** pending a Board ruling. Genuine two-sided conflict: the owner's §3A.0 hybrid ruling permits business shape to inform section emphasis and the owner approved the prototype as the production visual SSoT; the FE-PUB-09 rejection + Invariant #1 forbid rendering coined vendor-type values. Withholding costs zero function (they would ship disabled, write nothing, reorder nothing — no sections read is wired) and is reversible in one block. Both citations recorded in `microsite-builder.tsx`. The prototype keeps them (non-authoritative, tagged GUIDANCE). **Owner/Board to rule.** |
| **M1** — `defaultChecked` fell back to `DEFAULT_LAYOUT_TEMPLATE`, pre-selecting "Corporate Classic" while step 1 said "Not chosen yet" and step 3 said "No template chosen"; once Save is wired a section-only edit would submit an unmade `layout_template` | **VALID · ACCEPTED** | Fallback removed — an unread field is an absence. `DEFAULT_LAYOUT_TEMPLATE` import dropped. |
| **M2** — the plan asserted "minted" in four further places and instructed readers that the *correct* PROPOSED annotation was "stale" | **VALID · ACCEPTED** | All four corrected; the "stale" sentence **retracted in place**; the v0.7 heading marked as originally-wrong. |
| **M3** — `profile_sections` carries **two** frozen axes (`is_visible` boolean **and** `publish_state` enum) and the public-read RLS requires **both** (Doc-6D Pass2:270 — `publish_state = 'published' AND is_visible`); the derived "visible on your public page" counts tested one axis, and the view's `visibility` field reuses `AssetVisibility` whose `'public'` is not the frozen `'published'` | **VALID · ACCEPTED (verified against Doc-6D directly)** | `is_visible` bound on `MicrositeSectionView` (a frozen column previously unbound — binding, not invention); new `isPubliclyVisibleSection` mirrors the frozen policy exactly and is the only predicate both surfaces use. The `AssetVisibility` token mismatch is **flagged in-file, not silently renamed** — the shared type also serves branding/SEO/domain, so that rename is the owner's call. |
| **M4** — the journey route ships with no P-VND page ID and outside the WBS page universe | **PARTIALLY VALID · DOWNGRADED to OBS** | The concrete failure does not reproduce: `scripts/verify-fe-wbs-coverage.mjs` reports **PASS 152/152 pages, each owned exactly once**. The route was created last turn under owner direction and no page ID was coined (constraint 4 satisfied). Whether the journey warrants its own P-VND ID is a Board question — **raised, not blocking**. |
| **m5** barrel leak · **m6** `<dl>` semantics · **m8** Back/Next order + arrows · **m9** hardcoded navy/white in the preview · **m11** "Draft" chip rendered from an unread status · **n1** line cite · **n2** missing ring-offset | **VALID · ACCEPTED** | Direct module imports replace both barrel imports; `SummaryRow` now emits `dt`/`dd` inside a `dl` (approved layout kept — `DescriptionList` renders a different two-column shape); Back precedes Next with `sm:ml-auto` moved to Next; preview lead block uses `bg-primary`/`text-primary-foreground` so it survives the dark theme; status renders "Not started yet" when unread, matching the two rows beside it; cite corrected to Pass2:152; ring-offset added. |
| **m7** — `--iv-amber-*` is reserved for "Award · Premium actions · Verified tiers · Featured · Milestones" (`globals.css:48`), and the sibling step rail (`wizard-stepper.tsx`) uses `iv-brand-*` | **VALID · DECLINED, RAISED TO OWNER** | Confirmed accurate. Not changed: the owner twice instructed that the amber active-step indicator be preserved, most recently in this ruling's own match list. A reviewer does not overturn an explicit owner design instruction (§13) — surfaced for confirmation instead. |
| **m10** — one "Save design" spans two contracts (`update_microsite` + `update_profile_sections.v1`) | **VALID · ACCEPTED AS DESIGNED, hazard removed** | The single Save is the owner-ruled design. Its actual danger was M1 (a section-only edit writing an unmade template); with M1 fixed the button submits only fields the vendor set. Wiring must still dispatch two contracts — recorded for the integration phase. |
| **m12** — `templateEntry` cannot fail and would mislabel an unknown letter | **VALID · DEFERRED** | Pre-existing; unreachable today (both callers guard). Revisit if `layout_template` is additively extended. |
| **o1–o4** | **NOTED** | o2 (two sidebar entries lit on `/sell/company/*`) is pre-existing shell prefix-matching, reproduces identically on `/products`; out of scope. |

**v0.9→v0.10 — FOUR OWNER RULINGS (2026-07-20), all applied.**

| # | Ruling | Applied |
|---|---|---|
| **1** | **Arrangement presets — Option B.** Keep the mechanism; rename presets around presentation emphasis, never vendor type. Approved labels: `Balanced overview` · `Lead with capabilities` · `Lead with catalogue` · `Lead with delivered work` · `Lead with products and capabilities` · `Reset to default order`. Prohibited: `Manufacturer` · `Engineering service` · `Retailer` · `Trader` · `Hybrid vendor` | Presets restored to production with the approved labels, **disabled** — the ruling's own clause "applying one must show exactly what changed" cannot be met while no sections read and no `update_profile_sections.v1` exist, so an enabled control would be dishonest. Binding semantics recorded in `microsite-builder.tsx`. **`ESC-MKT-ARRANGEMENT-PRESETS` CLOSED** — record updated with the ruling and a 6-row verification list (5 pass now; "show what changed" gates enabling). Verified: labels exact, all disabled, **zero** prohibited labels on the surface |
| **2** | **G3 — open the formal mint**, including `DEFAULT 'A' → Corporate Classic` as the database backstop, on the fixed sequence draft → Review-A → fixes → freeze → Review-B → fold → Authority Map verification. Until the fold, status stays READY | **Draft mint artifact created.** A local G3 mint proposal has been drafted and awaits Review-A. It is not yet a committed or authoritative repository artifact, so it is described here rather than cited by path. It carries the five-row register, the `DEFAULT 'A'` backstop declared as a *storage* default that presentation must never render as a vendor choice, five §2 non-effects, a §3 conformance table (names still absent from `generatedDocs/`), a §4 **fold-target question left open for Review-A/Board** (recommendation: standalone `generatedDocs/` record + Authority Map row + pointers from Doc-7G/7D; not chosen here — fold targets are above an AI author, §8), a §5 dependent-pointer sweep, and the §6 sequence. **Status unchanged everywhere: G3 READY, mint pending.** Awaiting Review-A |
| **3** | **Active step → `iv-brand-*`**, not amber. Amber is reserved for Award/Premium/Verified; governance annotations and prototype review chrome may keep it | Applied to `JourneyStepRail`: active card `border-iv-brand-200 bg-iv-brand-50`, numeral `bg-iv-brand-600 text-white`, matching the sibling `rfq-create/wizard-stepper.tsx`. **Zero amber remains in either production feature.** Recorded in-file as an approved deviation from the prototype, with the reason (frozen foundation outranks the prototype). The prototype keeps amber |
| **4** | **`AssetVisibility` mismatch — separate bounded patch, not inside this refactor.** Halt and report if `public` is serialized, persisted, or externally consumed | **Steps 1–2 done, step 3 HALTED — for a different reason than anticipated.** Record: a local vocabulary audit has been drafted and halted pending an owner modelling ruling. It is not yet a committed or authoritative repository artifact, so it is described here rather than cited by path. The stated halt condition does **not** fire (7 consumers, all presentation; no `JSON.stringify`/`fetch`/`prisma`/`use server`/storage/`formData` — the value never leaves the render). It halts because **one frontend type stands in for three different frozen concepts**: sections → `profile_sections.publish_state ENUM('draft','published')` (PUB-1 coins no third value) ⇒ `published` is right; **branding assets and SEO settings have _no such column at all_** (Doc-6D Pass2:291-292 — public-read is gated on the parent being public) ⇒ neither token is right; and for contrast `vendor_profiles.visibility` is genuinely `ENUM('public')`, single-value (Pass1:58) ⇒ `public` is correct there. A blanket rename would be wrong for two of three consumers, and deciding what branding/SEO "visibility" means is a modelling decision — the line the ruling itself drew. Recommendation: **split the type**, don't rename it. Nothing changed |

**v0.9 — REVIEW-B ADJUDICATION (independent implementation/adversarial pass).** Returned **REVISION REQUIRED — 0 BLOCKER · 1 MAJOR · 2 MINOR · 3 NITPICK · 5 OBS**, with every finding reproduced at runtime or proven by reading. Dispositions:

| Finding | Disposition | Action |
|---|---|---|
| **MAJOR-1** — the three steps of one journey reported **two different statuses**: step 1 rendered "Not started yet" while steps 2 and 3 (and both `/sell/microsite` tabs) rendered **"Draft"**, because `MicrositeStatusChip` defaulted an absent status to the frozen Doc-4M value | **VALID · ACCEPTED — and the class swept** | The author had fixed this at ONE of three call sites (Review-A m11) instead of at the source — a fix-forward failure. Corrected in `status-chips.tsx` itself: an unread status now renders "Not started yet" (matching the sibling `DomainStatusChip`, which already handled absence). The per-caller guard in `journey-overview.tsx` was removed as redundant. Verified: all three steps **and** `/sell/microsite` now agree, and no surface claims "Draft". |
| **MINOR-1** — the step-2 rail label truncated to "Choose Template + Arr…" across ~640–1100px with no tooltip; on steps 1 and 3 the rail is the only place that owner-approved label appears | **VALID · ACCEPTED** | `truncate` removed — the label wraps. Cards are `h-full` so they equalise. Verified at 1024px: 153/153, nothing clipped. |
| **MINOR-2** — `templateEntry()` substituted "Corporate Classic" for an absent template, inviting the exact fabrication its callers' comments forbid | **VALID · ACCEPTED** (Review-A raised the same as m12 and the author deferred; two independent reviewers reversed that) | Signature is now **absence in ⇒ absence out** (`TemplateCatalogEntry \| undefined`); the frozen default belongs at the write site, not a display lookup. Both callers simplified. |
| **NITPICK-1** — width-toggle label classes keyed off `defaultChecked`, so flipping which option is pre-checked would silently swap the peers | **VALID · ACCEPTED** | Each option now carries its own `peerClass`/`activeClass`. |
| **NITPICK-2** — on a phone the Mobile toggle changed nothing (preview already 311px) yet still lit up | **VALID · ACCEPTED** | Toggle hidden below `sm`. Verified hidden at 390px, visible and working at 1440px. |
| **NITPICK-3** — `/sell/company/projects` still imported through the `showcase` barrel, pulling the journey components into its graph | **VALID · ACCEPTED** | Direct module imports; all server components, so no client-JS leak either way. |
| **OBS-3** — the Flag-and-Halt existed only as a source comment, with no record under `governanceReviews/` | **VALID · ACCEPTED** | Escalation record created: `governanceReviews/ESC-MKT-ARRANGEMENT-PRESETS_FlagAndHalt_v1.0.md` — both sources cited verbatim, four options for the Board, and the verification list for whichever is ruled. |
| **OBS-1** — every reviewed file changed mid-review (the author was applying Review-A fixes concurrently); five defects found in the first state were already fixed and not counted | **NOTED — process lesson** | Review-A and Review-B were run in parallel against a moving tree. Sequence them, or freeze the tree, next time. Review-B pinned md5s so its report is at least self-consistent. |
| **OBS-5** — dev-environment noise: a stale SWC compile cache 500'd every `/sell/*` route while `tsc` was clean (cleared by a no-op touch); Playwright MCP writes into `.playwright-mcp/` inside the watched tree, triggering Fast Refresh; failed cross-origin fetches to `localhost:8080` | **NOTED — not attributable to the change** | The 8080 fetches were the author's own console probe of the prototype server, not app code (no source references port 8080). The stale-cache 500 is the known one-server-per-checkout failure mode. |

**⚠️ G3 STATUS CORRECTED — the v0.7/v0.8 entries below overstate it.** Those entries record G3 as "MINTED". **No formal mint exists**: it was an in-chat owner statement, recorded in this NON-AUTHORITATIVE and uncommitted plan. Verified this pass — the five template names appear **nowhere** in `generatedDocs/`, there is no G3 governance artifact, no Authority Map row, and no commit. Per the owner's ruling the governed status is **G3 READY, formal Board mint pending**, and the §5 gate row is corrected accordingly. Code corrected to match: `template-catalog.ts` and `microsite-builder.tsx` headers claimed a "Board-minted" binding and now record **PROPOSED — Board mint pending**; nothing derives behaviour from a template name, and the vendor-facing UI carries no governance marker (gate handles are internal — the standing DS-W0 ruling). Historical log entries are left as written; this correction supersedes them. Nothing committed.

**v0.7→v0.8 — OWNER DECISION (2026-07-20): the authoring journey is THREE steps.** Ruled IA: **1 Overview · 2 Choose Template + Arrange Sections · 3 Preview & Publish**. Project Portfolio is **removed from the journey** — it is content work that feeds the showcase, not a step in choosing and publishing a presentation. Explicitly preserved by the same ruling: the `/sell/company/projects` surface, the public Projects content section, and `showcase_projects` as a section content source. Consequence for the gate register: **G5 is no longer an authoring-journey gate** (its ruled field set and the owed `[ESC-6-SCHEMA-SHOWCASE]` corpus patch are unchanged — G5 still gates *Project Portfolio backend wiring*, just not this journey). Executed **prototype-scoped**, per the instruction's own wording: `prototypes/digital-showcase-workspace/` v0.1→**v0.2** (5 screens → 3; template selection and section arrangement merged onto one page with two independent state models and a single `Save design` action; Overview rebuilt as a status summary; desktop/mobile preview widths and the binary Verified badge added to the preview; steps made hash-addressable so browser Back works). **Nothing in the frozen corpus, no contract, route, gate, mapping, or implementation scope was changed, and no field/event/aggregate/page ID was minted.** Two pre-existing prototype defects were fixed in passing (an unclosed `.rv` div that deleted the whole Overview in preview mode; an inline `display:none` that permanently hid PROPOSED tags after a toggle). **Open follow-up `DS-W0-R1`:** the production `AuthoringJourney` component still renders the four-step IA and now diverges from the ruled design — see the Phase-1 DS-W0 entry; re-aligning it needs owner confirmation that the ruling extends to the production surface. **OBS (raised, not acted on):** the prototype's G3 annotations still read "mapping PROPOSED, Board mint pending", which **v0.9 confirms is CORRECT** (G3 is READY, formal Board mint pending). *This sentence originally called that annotation "stale" on the mistaken belief that G3 had been minted — RETRACTED.* The annotations were left verbatim, which turned out to be right. Nothing committed.

**v0.7 addendum (2026-07-20) — Authoring journey.** Owner directed the production surface to mirror the workspace prototype and to add an **"Authoring journey"** sidebar entry under Digital Showcase. Built as **DS-W0**: `authoring-journey.tsx` + `/sell/company/journey`, nav entry listed **first** in the showcase group (it is where a vendor starts, not a sixth destination). Two departures from the prototype are deliberate and recorded in the component header: gate identifiers are omitted (internal handles, not vendor copy) and no sample content is rendered (VX-03). Tab-hosted steps name their tab instead of deep-linking, since `WorkspaceTabs` is not URL-addressable. tsc/eslint clean; page and step navigation browser-verified, zero console errors.

**v0.6→v0.7 — OWNER AUTHORIZATION (2026-07-20): G3 mapping ACCEPTED · G5 field set ruled · Phase-1 built.** *(Originally written as "G3 minted" — **retracted in v0.9**; no formal mint exists.)* The owner accepted the G3 name↔letter binding (A→Corporate Classic … E→Business Landing) and ruled the G5 `showcase_projects` field set, then authorized the build. Delivered, **presentation-only** (the `marketplace` Prisma schema is unrealized and no BC-MKT contract is implemented, so nothing is wired): **DS-W1** — new `app/(app)/_components/vendor/showcase/` feature (types · `ProjectList` · `ProjectForm` · `ShowcaseVisibilityChip` · barrel) composed at `/sell/company/projects`, replacing `ImplementationPendingView` and fixing **F6**; **DS-W2B** — `template-catalog.ts` (the single home of the naming) driving named template cards in the S10 builder; **DS-W3 (partial)** — S14 preview names the selected template from that same catalogue. Gate movement: recorded here as "G3 MINTED" — **SUPERSEDED; see the v0.9 correction: G3 is READY, formal mint pending**; **G5 🟡 field set ruled but the additive Doc-2/Doc-4D/Doc-5D patch is still OWED** — the ruled fields ride the frozen `content_jsonb` carrier so no frozen document is contradicted, and backend wiring stays gated until the patch lands (a human records action per §7/§8). Quality gate: prettier · `tsc --noEmit` clean · eslint clean · both surfaces driven in the browser with zero console errors. Guardrails held: no fixture rows (VX-03), no coined status enum, no governance signal on either surface, no fabricated trust panel, client identity is a descriptor. Nothing committed.

**v0.5→v0.6 — OWNER DECISION (2026-07-20): kit-artifact removal.** After the audit preserved the design direction, the supplied kit source (`iVendorz Kit/`, 98 files, + `iVendorz Kit.zip`) was **deleted from the working tree**; nothing was copied, relocated, or committed (it had never been tracked). Recorded at **§3A.1** with the six statements of record (temporary research inputs · DS-W2A extracted the patterns · implementation recreated on frozen `--iv-*` tokens and production components · no kit code/token/rule/data/route retained or required · canonical five remain layout-style templates · four arrangements remain presentation guidance only). Consequential edits: audit gains **§3B Normalized design direction** (the durable replacement — visual character, chrome, section rhythm, catalogue/filtering, case-study patterns, the four arrangements, responsive behavior, accessibility floor, binding constraints) and moves to **v0.2 "audit complete · artifacts removed"**; §3 reframed as keep/discard/synthesize with "discarded" now physically absent; **M3 closed by removal**; **G3B RETIRED** (no retained source ⇒ no licensing dependency), historical intake note preserved with its disposition; **F8 fully closed**; Phase 2/DS-P2 build source restated as design-spec + approved prototype, never kit code; stale "in-repo / git-ignored / quarantine" wording replaced with "audited temporary reference artifacts, subsequently removed"; obsolete kit `.gitignore` entries removed. **DS-W2A-B1 retained as an implementation guardrail** — no fabricated trust panel may be recreated. Nothing committed.

**v0.4→v0.5 — OWNER RULING (2026-07-20): hybrid model.** Decision ask #2 (template-set canonicality) **CLOSED**. Ruling recorded verbatim at §3A.0: canonical template axis = **visual layout style** (the approved five); the four kits **do not supersede** it and are **never automatically Templates 01–04** — they are **reference content arrangements** (kit-01 manufacturer · kit-02 engineering-service · kit-03 catalogue/retailer · kit-04 hybrid supply-and-service); business type/capability/content drive **section emphasis only**, never template identity, and never lock a vendor to a template. Proposed G3 mapping accepted into the plan pending formal mint: **A→Corporate Classic · B→Modern Industrial · C→Product Catalogue · D→Portfolio & Projects · E→Business Landing**. Consequential edits: F3 → axis-ruled/binding-pending; F8 → resolved-by-ruling (licensing leg split out); G3 → **READY**; G3A → narrowed to the missing Business Landing artifact; **G3B minted** for provenance/licensing; §3A register relabeled "reference arrangement / permanent neutral IDs"; DS-W2B gains the no-vendor-lock constraint; decision asks re-sequenced. **DS-W2A-B1 (trust-panel) retained as a production BLOCKER.** Nothing committed.

**v0.3→v0.4 (DS-W2A audit folded, 2026-07-20)** — *historical; the kit-in-tree state described here was ended by v0.6 (§3A.1 removal):* four supplied kits landed at root `iVendorz Kit/`; audited by four independent readers → `governanceReviews/DS-W2A-template-audit/DS-W2A_Template_Manifest_and_Audit_v0.2.md`. Folded into §3A (real manifest replacing the ZIP-not-yet-in-repo placeholder), DS-W2A marked DONE, decision asks re-sequenced (template-set canonicality now precedes G3). New/sharpened findings: **DS-W2A-B1 (BLOCKER)** fabricated trust panels in all four kits breach the trust-display firewall → strip to binary Verified badge; **F7 CONFIRMED** clean at code level (no kit has a services/departments data model — only nav is data) but presentation IA diverges (Services/Departments routes → sections); **F8 sharpened** — kits are organized by *business type*, approved system by *layout style* (different axes; "4 kits = Templates 01–04" is unverified). Root `.gitignore` extended to quarantine `iVendorz Kit/` + `iVendorz Kit*.zip` (F8, uncommitted pending licensing). Speculative `prototypes/reference-kits/` removed (kits live at root).

---

*Appendix — grounding: Doc-2 §3.3/§8 (v1.0.2:135-141,283-293,661-665,731-750) · Doc-6D Content Pass1:56-86 / Pass2:48-227 / Pass3:18-63 · Doc-5D Content Pass1:59-173, Pass2:20-116, Pass3:21-113 · Doc-7G Content Pass1:34-82, Pass2:64-117 · Doc-7D Content Pass1:75-91 + §10/§11 patch proposals · ADR-022 proposal · `00_AUTHORITY_MAP.md:54,163` · `fe-program-wbs.md:87-129,191` · `page_inventory.md:114-126,219-231` · `esc_registry.md:27-29,81,92,106-107` · `Wave-3_Integration_Audit_and_Exit_Gate_v0.1_DRAFT.md:10-92` · prototype README:3-31.*
