# M2 Public-Read Backend — Slice Plan (Wave 3)

| Field | Value |
|---|---|
| **Document type** | Living execution plan · non-authoritative under the frozen corpus |
| **Date** | 2026-07-22 |
| **Owner** | Engineering (backend) |
| **Scope** | M2 `marketplace` — the **public / anonymous read surface only** (BC-MKT-6 Discovery + the public legs of taxonomy and product reads). M2 write contracts, vendor-console wiring, and the other 3 Wave-3 modules are out of scope. |
| **Conforms to** | `Build_Roadmap_v1.0` §Wave 3 → Doc-4A (metastandard), Doc-4D + patches v1.0.2/v1.0.3, Doc-5A + patch v1.0.1, Doc-5D + patch v1.0.1, Doc-6D + patch v1.0.1, Doc-8D, Doc-8E, ADR-024, ADR-025, Doc-3 POLICY patches v1.2/v1.10/v1.11 (all FROZEN/APPROVED) |
| **Conflict rule** | **Flag-and-Halt** (CLAUDE.md §11). §3 below lists the frozen-vs-frozen items found while drafting — none are resolved here. |
| **Coins** | Nothing. Slice IDs (`M2-PR-1`…) are organizing labels only. |
| **Companion** | Sequence context: [`backend_build_plan.md`](backend_build_plan.md) §W3. Pattern reference: M1 identity, as realized in `src/modules/identity/`. |

> This plan **sequences realization only**. Every contract-ID, path, error code, POLICY key,
> enum value, and RLS predicate below is bound by pointer to a frozen document — none is authored
> here. Where the corpus is silent or self-contradictory, the item is raised in §3, not decided.

---

## 1. Why this slice, and what it changes

Today every public discovery page renders from one curated static file,
`app/(public)/_components/discovery/seed.ts` — whose own header (lines 1–9) records that it stands
in for the unwired anonymous reads. No M2 code exists: `src/modules/marketplace/contracts/services.ts`
is a 3-line `export {}`, the four DDD layer folders hold only `.gitkeep`, there is no
`app/api/marketplace/**`, and `prisma/schema.prisma` declares the `marketplace` schema
(line 32) with **zero models** in it.

`Program_Status_And_Roadmap.md:159-161` places this work in the current phase: "Wave 3 …
Public/Marketplace FE (Doc-7D) is built here once each module's Doc-5 surface is wired."

The purely editorial marketing routes — `/about`, `/pricing`, `/for-buyers`, `/for-vendors`,
`/how-it-works`, `/trust`, `/resources`, `/legal/*` — hold no entity data and are **explicitly out
of scope**. They need no backend now or later.

---

## 2. What the corpus authorizes

### 2.1 The four public Discovery contracts (BC-MKT-6)

Wire rows are frozen at `Doc-5D_Content_v1.0_Pass1.md:171-173` plus
`Doc-5D_PublicProductDetail_Patch_v1.0.1.md:56`. All four are Active-Org **N**, success `200`.

| # | Contract-ID | Method · Path |
|---|---|---|
| 62 | `marketplace.search_catalog.v1` | `GET /marketplace/catalog_search` |
| 63 | `marketplace.list_vendor_directory.v1` | `GET /marketplace/vendor_directory` |
| 64 | `marketplace.get_public_vendor_profile.v1` | `GET /marketplace/public_vendor_profiles/{id}` |
| 65 | `marketplace.get_public_product_detail.v1` | `GET /marketplace/public_product_details/{id}` |

`get_public_vendor_profile.v1` is the furthest along: its DTOs already exist at
`src/modules/marketplace/contracts/types.ts` (the only populated M2 file), with the XOR lookup key
matching `Doc-4D_Content_v1.0_PassB_Discovery.md:22`.

### 2.2 `list_categories` is public — the registry row saying otherwise is stale

`ESC-7-API-CATNAV` (`esc_registry.md:27`) reads as an open blocker: "`list_categories` has **no
Public projection** → public Industrial Category Explorer tree blocked". **It is not a live
blocker.** `R-ESC7-PRODDETAIL-FREEZE` Ruling R-0 adjudicated it as one of a *transcription-error
family* (`governanceReviews/ESC-7-API-PRODDETAIL_…_PROPOSAL.md:85-91`, item C2), against frozen
text that says the opposite:

- `Doc-5D_Content_v1.0_Pass1.md:117` — row 18, Actor **Public**
- `Doc-5D_Content_v1.0_Pass2.md:78` — "`list_categories` → **Public** (taxonomy is public)"
- `Doc-4D_Content_v1.0_PassB_CatalogProductSpec.md:62,64` — "Actor: public / User", "public read of the taxonomy"

No frozen statement contradicts the public leg. `esc_registry.md:19` sets the precedence
("non-authoritative; on conflict the frozen corpus wins"). **Build guidance:** treat
`list_categories.v1` public projection as available; the registry row should be flipped by the
ordered corrigendum, not treated as a gate. Public taxonomy read excludes `retired`
(`Doc-4D_Content_v1.0_PassB_CatalogProductSpec.md:66`).

### 2.3 Anonymous ads stay blocked — for a different reason than the registry gives

`ESC-7-API-ADS` (`esc_registry.md:29`) is likewise in the transcription-error family (item C3) —
Pass1 rows 57/58 do say "Public / User *(public when active)*". **But a second, unadjudicated
conflict sits inside Doc-5D itself:** `Doc-5D_Content_v1.0_Pass3.md:34` (§7.3) states
`get_advertisement`/`list_advertisements` → **Controlling-Org**, with "**no anonymous caller leg on
§7 ad reads**". That is frozen-vs-frozen within one document → **Flag-and-Halt** (§3.1). Ads stay
off the public surface for this slice.

### 2.4 Other public-projection reads available but not in this slice

`get_product` / `list_products` (rows 29/30, public = published only), `get_spec_library_entry` /
`get_spec_document` (31/32), `get_microsite` / `get_profile_experience` / `get_showcase_project`
(49/50/51). These are the follow-on slices once the composed reads land.

---

## 3. Flag-and-Halt / raised items (raise ≠ accept — none resolved here)

Per CLAUDE.md §13, these are **claims for adjudication**, each with a proposed severity. The author
or presiding authority rules; only validated findings get implemented.

### 3.1 Ads: Doc-5D Pass1 rows 57/58 vs Doc-5D Pass3 §7.3 — **MAJOR**
Same document, opposite actor legs (see §2.3). Needs the same Board channel as the CATNAV/ADS
corrigendum sweep. Blocks any anonymous ad rendering. Does **not** block this slice.

### 3.2 Banned vendors: three frozen statements disagree — **MAJOR**
- `Doc-6D_Content_v1.0_Pass1.md:46` + DDL `:292-293` — a banned profile **remains readable** at the
  RLS layer (ban is "a public banner, not a hide"); exclusion is read-model/FTS only. The frozen
  predicate is exactly `visibility = 'public' AND deleted_at IS NULL`.
- `Doc-6D_Structure_v1.0_FROZEN.md:20-21` (MK-CR2/CR3) — public-read class is "published,
  **non-banned**".
- `Doc-5D_Content_v1.0_Pass3.md:51` + `Doc-5D_Structure_v1.0_FROZEN.md:31` (R9) — banned/suspended
  **never surfaced**, uniform 404. `src/modules/marketplace/contracts/types.ts:44` already asserts this.

**Proposed disposition (for ruling, not applied unilaterally):** Doc-4D/Doc-5D govern the wire, and
Doc-6D itself calls RLS "a coarse backstop" (`Pass1:43,46`) — so apply the ban/suspend filter in the
**application read**, and copy the frozen RLS DDL verbatim without tightening it. Record the
MK-CR2-vs-§2.3 wording divergence as an OBS for the corpus, do not resolve locally.

### 3.3 `types.ts:69` cites the wrong authorities for R9 — **MINOR**
The comment cites "Doc-6D R9 / Doc-5A §6.6". R9 is a **Doc-5D Structure** rule
(`Doc-5D_Structure_v1.0_FROZEN.md:31`); Doc-6D has no rule R9 (its set is MK-CR1–CR12), and its
"R9" mentions are references to *Doc-6A* R9 = multi-currency. `Doc-5A §6.6` is "Escalation"; the
normative non-disclosure realization is **`Doc-5A §6.3`** (`Doc-5A_Content_v1.0_Pass3.md:168`).
Comment-only correction; no behavior change.

### 3.4 `types.ts:56` states a `vendor_type_preset` value domain — **MINOR**
The doc-comment reads "(manufacturer | service_provider | trader | other)". Per the open
amendment track, the frozen field carries an **empty** value domain and the owner-ruled 6-slug set
is an amendment still in proposal (`governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.3_PROPOSAL.md`
is untracked on this branch). The TS type is `string | null` and code coins nothing — but the
comment asserts a set the corpus has not frozen. Align the comment to the ratified set once it
lands; do not encode an enum meanwhile.

### 3.5 MK-CR1 child-count grouping divergence — **OBS**
`Doc-6D_Structure_v1.0_FROZEN.md:19` says "Vendor Profile (AR) + 11 children";
`Doc-6D_SERIES_FROZEN_v1.0.md:30` and the Content Freeze Audit say "+ 7 children" plus "Microsite
(+4 presentation children)". Same 21 tables, different grouping of `profile_sections` /
`branding_assets` / `seo_settings` / `custom_domains`. Not a blocker — do not quote both phrasings
in one artifact without noting it.

### 3.6 `/vendors/{slug}` is a legacy route that must 301 — **MAJOR (FE consequence)**
The frozen lookup key admits **exactly one of** `vendor_profile_id` or `human_ref`
(`Doc-4D_Content_v1.0_PassB_Discovery.md:22`; `types.ts:77-85`) — there is no slug leg. ADR-025
decision (8) states legacy `/vendors/{slug}` **MUST 301**, "a legacy route is never itself a second
canonical", with the canonical vendor URL being ADR-024's CHR output. The shipped FE route is
`/vendors/[slug]` with seam `getPublicVendorProfile(slug)` (`seed.ts:363`). Cutover therefore
requires a redirect + CHR resolution leg, not a drop-in swap. ADR-025 records the Doc-7 builder/
redirect leg as "a separate future instrument, explicitly deferred" (`:134-135`) — so this needs a
scheduled FE work package, not an inline fix during backend wiring.

---

## 4. Build sequence

### 4.0 Schema first — and all 21 tables at once

MK-CR1 freezes M2 at **21 tables / 8 aggregates**, and "a 22nd table is non-conformant"
(`Doc-6D_Structure_v1.0_FROZEN.md:19`). Doc-8D's inventory-completeness rule is
schema-inventory-driven: coverage ≡ frozen Doc-6 DDL, `core` 5 + `identity` 9 + `marketplace`
**21** = 35 tables. A partial 3-table migration cannot pass that gate.

So `M2-PR-0` lands the **whole** marketplace schema in one forward-only migration
`prisma/migrations/<ts>_marketplace_init/`, copying the concrete DDL already written across
`Doc-6D_Content_v1.0_Pass1..3.md` — enums, CHECKs, self-FK tree, generated `tsvector` + GIN (MK-CR9),
RLS policies (`Pass1:290-331`), and the `marketplace.*` POLICY seeds (Doc-3 v1.2). **Copy, never
re-author.** Read paths are then sliced on top.

Doc-8D discipline: forward-only, expand-contract, destructive DDL permitted **only** on `ai.*`;
`generated-contracts-registry/` regenerates with no diff and is never hand-edited.

### 4.1 Slices

| ID | Slice | Delivers | Depends on |
|---|---|---|---|
| **M2-PR-0** | Schema + RLS + POLICY seeds | 21 tables, tri-actor RLS, FTS indexes, `marketplace.*` POLICY seeds | — |
| **M2-PR-1** | `get_public_vendor_profile.v1` | contracts (DTOs exist) → repo → query → api mapper → `src/server/marketplace/` → `app/api/marketplace/public_vendor_profiles/[id]/route.ts` | PR-0 |
| **M2-PR-2** | `list_categories.v1` public leg | public taxonomy read, `retired` excluded | PR-0 |
| **M2-PR-3** | `list_vendor_directory.v1` | cursor list + facets over FTS | PR-0, PR-1 |
| **M2-PR-4** | `search_catalog.v1` | cursor list + facets, vendors + products | PR-0, PR-3 |
| **M2-PR-5** | `get_public_product_detail.v1` | composed projection + deterministic breadcrumb | PR-0, PR-2 |
| **M2-PR-6** | FE cutover | seed → wired, per §7 | PR-1…PR-5 |

**Recommended first build: M2-PR-0 + M2-PR-1.** PR-1 is a single-entity read with frozen DTOs
already in the repo, no pagination, and it establishes the anonymous route seam every later slice
reuses. PR-3/PR-4 carry the cursor+facet+exclusion-consistency burden and should not be first.

---

## 5. Per-slice realization pattern (from M1)

M1 is the only fully-built module; M2 follows its shape exactly.

**Layering:** `domain/` (pure policy) → `infrastructure/data/*.repository.ts` (Prisma only) →
`application/queries/*.query.ts` → `api/*.handler.ts` (module-owned wire mapper, pure) →
`contracts/` (sole public surface) → `marketplace.module.ts` (exports `marketplaceQueries` /
`marketplaceCommands`) → `src/server/marketplace/*.route-handler.ts` (composition) →
`app/api/marketplace/**/route.ts` (thin routing only).

**Contract shape:** type alias + concrete facade delegating to the module's own application layer
(cf. `src/modules/identity/contracts/services.ts:386-395`). Reads return a `*Result` discriminated
found-union — `{ found: true; … } | { found: false }` — which is exactly what
`GetPublicVendorProfileResult` already is.

**The anonymous route seam** — M1's only public route is the precedent
(`app/api/identity/growth_invitations/resolve/route.ts` +
`src/server/identity/growth-invitation.route-handler.ts:160-177`), in fixed order:

1. **Rate limit first**, as a transport stage outside the contract error matrix. Read
   `marketplace.public_read_rate_limit` via `core.config_value_query.v1` — **never a literal**
   (`Doc-6D_SERIES_FROZEN_v1.0.md:38`). Doc-3 v1.11 registers the identifier with **no numeric
   value** and no enforcement mechanism (`:85-88`, `:116`); absent value ⇒ **dormant**, per M1's
   precedent. Adoption is explicit per contract — only `get_public_vendor_profile.v1` and
   `get_public_product_detail.v1` are named consumers; `search_catalog` and `list_vendor_directory`
   **must not** inherit it implicitly.
2. **Validation order is fixed and is a disclosure control** — public reads run
   SYNTAX → CONTEXT → AUTHZ(public) → SCOPE (`Doc-4D_Content_v1.0_PassB.md:55`). MUST NOT be
   reordered, merged, or short-circuited.
3. Query → module `api/` mapper → `WireResponse` → `NextResponse.json` with `Cache-Control` set
   deliberately (these reads are anonymous-cacheable per `Doc-5D_PublicProductDetail_Patch_v1.0.1.md:67`).

**Carriage:** no `Authorization`, no `Iv-Active-Organization` on any §8 read
(`Doc-5D_Content_v1.0_Pass3.md:47`). A signed-in user receives the **identical** Public projection;
Admin has no special leg. Actor type is server-determined, never asserted.

**Envelope:** `{ result, reference_id }` single-entity; `{ items, page_info: { next_cursor, has_more,
total_count? }, reference_id }` for lists. `reference_id` is top-level on every body-bearing
response, platform-assigned UUIDv7, never caller-supplied.

**Casing (the one deviation to get right):** per `Doc-5A_Patch_v1.0.1.md` (owner ruling 2026-07-10,
`ESC-WIRE-FIELD-CASING` Option B) — **`result`-payload properties serialize camelCase**; request
bodies, query params, envelope keys (`reference_id`, `error_class`, `error_code`), and **enum
values** stay snake_case verbatim. The shared `successResponse` edge in `src/shared/http/index.ts`
is the cited precedent.

**Error codes — coin none.** `marketplace_discovery_invalid_input` (VALIDATION),
`marketplace_vendor_not_found` (NOT_FOUND) for Discovery; `marketplace_category_*` for taxonomy;
`marketplace_product_invalid_input` / `marketplace_product_not_found` for product detail. Class→status
is normative in `Doc-5A_Content_v1.0_Pass3.md:148-161` and a module MUST NOT remap it.

**Reads are not audited** (Doc-4A §17.1), and idempotency is n/a on queries — so no D7 audited-write
path and no outbox emit in this entire slice. That is a large simplification versus M1's write work.

**Pagination (PR-3/PR-4):** cursor only, no offset. `page_size` above `marketplace.list_page_size_max`
**[100]** is a `400 VALIDATION`, never a silent clamp. Filters `filter[<field>]=<v>`, sort
`sort=<field>:<asc|desc>` with a server-appended `id` tiebreaker (client-supplied `id` in `sort` =
400). Cursors are opaque and MUST NOT encode absolute positions. **Exclusion consistency:** `items`,
`has_more`, `total_count`, and every facet apply the identical exclusion set.

**Breadcrumb determinism (PR-5):** the total order is frozen at
`Doc-5D_PublicProductDetail_Patch_v1.0.1.md:138-156` — deepest path → `is_specialized` → `level =
primary` → lowest assigned-category UUID. Note the field-model correction at `:130-136`:
`category_assignments.level` is an enum (`primary`/`secondary`), **not** tree depth, and assignments
are **vendor-scoped** — products carry no direct category reference. `canonical_url` is opaque and
builder-emitted; `vendor_slug` is withheld from the payload entirely.

---

## 6. Gate mapping (Doc-8)

**Doc-8D** — defining suite for `CHK-8-024` (RLS byte-equivalence, Invariant #11, MANDATORY) and
`CHK-8-022` (immutability). Required for this slice:

- §5.1 Positive: **tri-actor** Public / User / Admin — anonymous sees published-only.
- §5.2 Negative: query as the tenant DB role **with the app layer bypassed**; RLS must deny. The
  harness already provisions a restricted `NOBYPASSRLS` role (`tests/_harness/global-setup.ts:15-24`).
- §5.3 Cross-tenant: no policy depends on cross-schema ownership traversal (M2 child policies use
  intra-schema `EXISTS` on the parent — `Doc-6D_Content_v1.0_Pass1.md:43`).
- §5.4 Byte-equivalence: **the marketplace-visibility facet is ready now** — an unpublished/hidden
  vendor profile must be byte-equivalent to a non-existent one for anonymous and User. (The
  buyer-private CRM facet is M4/Doc-6F and stays execution-deferred.)

**Doc-8E** — `CHK-8-030/031` firewall (M2 reads Trust bands, never computes; MK-CR7: no
trust/performance column on any of the 21 tables), `CHK-8-032` invariants — **#1** capability matrix
is four booleans never a label, **#3** visibility scope. 8E exports canonical helpers
(`firewallNonCross`, `firewallNonDom`, `invariantHolds(n)`) — composers **invoke, never
re-implement**. Note 8E defers #8 and #11 to 8D.

**Carried M2-specific rows** (`Doc-5D_PublicProductDetail_Patch_v1.0.1.md:213-220`), to wire at
Doc-8's next pass: F-1 404 byte-equality across absent/draft/unpublished/soft-deleted/suspended/banned
including **every cache tier** · F-3 R9 count consistency (an unpublished product disappears from
results, facet counts, sitemaps, and detail identically) · F-4 builder-only URL lint · F-5 no
vendor-host product route resolves · F-6 composed-read ≡ granular-read byte-consistency · F-7
breadcrumb determinism across repeated reads/actors · F-8 spec-entry public-leg gate. F-2 (301
slug-correction) belongs to the deferred E-3 FE leg (§3.6).

Tests live centrally — `tests/integration/<slice>-slice.test.ts` and `rls-*.test.ts`, Vitest with
`fileParallelism: false` against one shared ephemeral Postgres. Timing-equality assertions (F-1) need
care on a shared runner; see the recorded hazards around shared-DB residue and review-concurrency.

**Gate arithmetic:** BLOCKER = MAJOR = MINOR = 0 with required bands green (CLAUDE.md §13).

---

## 7. FE cutover (M2-PR-6)

The seam is unusually clean — every discovery page resolves through
`app/(public)/_components/discovery/seed.ts`, whose exported accessors are the exact swap points:
`getPublicVendorProfile(slug)` (`:363`), `getPublicVendorProducts(slug)` (`:380`),
`getVendorTopProductNames(slug)` (`:386`), `getPublicProductDetail(id)` (`:548`), plus the `VENDORS`
/ `PRODUCTS` / `FEATURED_*` / `VENDOR_FACETS` constants.

Two cutover constraints carried from the corpus and from standing directives:

- **The slug problem (§3.6)** must be scheduled before `/vendors/[slug]` can be wired — the backend
  read has no slug leg.
- **No fabricated data.** The public surface gets zero stats and no figure without a real read; an
  absent verification renders as *absence* (no badge), never a fabricated "pending". The seed already
  encodes this deliberately (`seed.ts:42-47`, `:308-309`) and the wired version must preserve it.

---

## 8. Explicit non-goals

Marketing/editorial routes (no entity data) · M2 write contracts and vendor-console wiring ·
anonymous ads (§3.1) · public marketplace statistics and related/similar recommendations (no
contract exists — `esc_registry.md:33-34`) · any caller-visible matching / ranking / routing /
eligibility surface, which DD-2 forbids on **every** M2 endpoint · `vendor_matching_attributes` as a
public surface (admin-only RLS, out-of-wire) · slug migration (`ESC-MKT-SUBDOMAIN-MIGRATE`; no wire
contract, `vendor_slug_history` stays empty) · `reflect_vendor_ban_lift.v1`, which carries a frozen
**"DO NOT implement"** guard (DD-8).
