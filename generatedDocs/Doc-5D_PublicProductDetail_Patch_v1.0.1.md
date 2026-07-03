# Doc-5D_PublicProductDetail_Patch_v1.0.1.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-03) + FOLDED into the corpus.**
> This is the corpus copy `generatedDocs/Doc-5D_PublicProductDetail_Patch_v1.0.1.md`,
> registered in `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`, carried **alongside** the unedited
> frozen Doc-5D (`Doc-5D_Structure_v1.0_FROZEN.md` + `Doc-5D_Content_v1.0_Pass1…3` +
> `Doc-5D_SERIES_FROZEN_v1.0.md`) — **no frozen file edited in place.**
> Origin/provenance: `governanceReviews/Doc-5D_PublicProductDetail_Patch_v1.0.1_PROPOSAL.md`.
>
> **Linked-pair** with `Doc-4D_PublicProductDetail_Patch_v1.0.3` (the contract this realizes) —
> approved and folded **together**, mirroring the Doc-2 v1.0.4 ↔ Doc-4C v1.0.2 linked-pair
> precedent.
>
> **Realizes** Annex-E instrument **E-1** (wire leg) of the Board-ratified resolution
> `governanceReviews/ESC-7-API-PRODDETAIL_Product_Detail_Architecture_Plan_v1.0_PROPOSAL.md`
> (**`R-ESC7-PRODDETAIL-FREEZE`**, 2026-07-03) — Decisions **2** (composed read, wire), **3** (spec-entry
> conformance correction + embedded-only category path), and **8** (breadcrumb deterministic pick rule —
> "rule fixed at patch time · Doc-5D patch text"). Owner plan-review rulings of 2026-07-03 folded and
> marked **[owner-ruled 2026-07-03]**.
>
> **Hard Review (two independent lanes, 2026-07-03): BLOCKER 0 · MAJOR 0.** 7 unique MINOR + 4 NIT raised
> across the pair; all adjudicated **ACCEPT** (§13 Validate-Findings gate) and folded — marked
> **[review-adjudicated 2026-07-03]** where they correct resolution text upward to the frozen corpus;
> OBS items recorded, no action.

## Status

Approved Patch — FOLDED 2026-07-03 (human-approved: owner/Board ruling)

| Field | Value |
|---|---|
| Patch ID | **PATCH-5D-PPD-01** |
| Applies to | Doc-5D v1.0 (Structure FROZEN + Content Pass1…3 + SERIES freeze; applied dependency `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`) |
| Produces | Doc-5D **v1.0.1** (v1.0 + this patch) |
| Scope | **Three items, nothing else:** (1) wire realization of the new `marketplace.get_public_product_detail.v1` (linked Doc-4D patch); (2) the **breadcrumb deterministic pick rule** (resolution Decision 8); (3) the **`get_spec_library_entry` conformance correction** (resolution §I.5.3). Plus the Annex-F conformance rows carried for Doc-8 wiring at fold time. No other endpoint, projection, POLICY, or register is touched. |
| Purpose | Put the Product Detail Projection on the wire with the R9 collapse enforced once; conform Doc-5D upward to its own module contract on the spec-library read. |
| Raised by | `ESC-7-API-PRODDETAIL` → `R-ESC7-PRODDETAIL-FREEZE` (2026-07-03), Annex E item E-1 |
| Authority | CLAUDE.md §7/§8/§11/§13; Doc-5A §5.2/§5.3/§5.5/§5.7 (wire grammar/templates), §6.2 (error envelope), §6.3/§7 (non-disclosure/actor carriage), §8 (pagination); Doc-4A §18.2/§19; Doc-5D Structure R1–R10; Doc-4D §D6/§D7.2 (+ linked patch v1.0.3) |

All frozen Doc-5D decisions — R1 out-of-wire boundary, R2 tri-actor, R3 route prefix, R4 anti-invention,
R5 projection separation, R6/DD-2 matching internal-only, R7 reflect-never-decide, R8 entitlement
consumption, R9 non-disclosure firewall, R10 outbox — are **preserved and bound by pointer.**

---

# PATCH-5D-PPD-01 · Part 1 — Wire realization of `marketplace.get_public_product_detail.v1`

**Location:** Doc-5D §8 — *Discovery & Public Read Surface Realization (BC-MKT-6)* — appended to the §8.1
endpoint set and the §2.5 inventory (new row 65). Composition precedent: `get_public_vendor_profile.v1`
(Pass1 row 64).

## 1.1 Inventory row (appended to §2.5; Doc-5A §5.7 wire modeling)

| # | Doc-4D Contract-ID | Actor | Method · Path | Active-Org | Success | § |
|---|---|---|---|---|---|---|
| 65 | `marketplace.get_public_product_detail.v1` | Public | `GET /marketplace/public_product_details/{id}` *(anonymous; composed read; non-disclosure — R9)* | N (public) | `200` | §8 |

- **Path grammar (Doc-5A §5.3):** `/{module-namespace}/{resource-plural}/{id}` — `marketplace` (R3 reserved
  prefix) · `public_product_details` (snake_case resource-plural drawn from the owning contract, exactly as
  `get_public_vendor_profile` → `public_vendor_profiles`) · `{id}` = product **UUIDv7** in canonical form.
  No abstract verb on the path. No `human_ref` leg (not declared a lookup).
- **API path ≠ page URL (anti-conflation note):** the public **page** canonical URL is the presentation
  URL law owned by the sibling instrument **E-3 (`ADR-025_Marketplace_Public_URL_Law`)** — referenced by
  pointer, never restated (the page-URL shape is deliberately not spelled here; E-3's channel owns every
  literal of it **[review-adjudicated 2026-07-03]**). This wire path is the **API** surface only; nothing
  here defines, constrains, or duplicates the page URL law.
- **Carriage (R2 public surface):** **no `Authorization`, no `Iv-Active-Organization`** — anonymous-cacheable,
  identical response for every caller class (a signed-in User receives the same Public projection).

## 1.2 Response realization (Doc-5A §5.5; Doc-5D §4.7 top-level `reference_id`; Doc-4A §22.1 C-05)

`200` → `{ result: <Product Detail Projection>, reference_id }`. Single-entity read — **no pagination**;
nested collections are structurally bounded by the domain model (≤10 active category assignments per
vendor — Doc-2 `category_assignments` service rule; category tree ≤4 levels) and in all cases capped by the
registered **`marketplace.list_page_size_max` [100]** (`Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`
— applied dependency, bound by pointer).

Field-level realization of the Doc-4D v1.0.3 response contract (classes: R required · O optional ·
C conditional · K computed — resolution §I.7 logical model, bound by pointer):

| Section | Wire content | Class | Source (M2-owned only) |
|---|---|---|---|
| Identity | `product_id` · `name` · timestamps | R | `products` |
| Description | `description` | O | `products` |
| Media | image storage **refs** from `images_jsonb` — refs only, never inline binary (**Doc-2 §9 out-of-DB boundary / Doc-6A §12.1 (R12)**; delivery via signed/public URL at read; companion convention GI-09 supplementary) | C | `products` |
| Taxonomy | `primary_category_path` + `category_paths[]` — each path an ordered root→leaf chain of `{category_id, slug, name}` (≤4 levels) **[owner-ruled 2026-07-03: naming]** | C | `categories` + owning vendor's `category_assignments` (embedded-only — Decision 3; the granular `get_category_assignments.v1` stays vendor-addressed Controlling-Org, **no widening**) |
| Specifications | spec-entry summaries `{spec_entry_id, name, summary}` | C | `spec_library_entries` via `product_spec_links` |
| Documents | `{spec_document_id, doc_type (urs\|datasheet\|checklist\|drawing\|standard — frozen enum), version_no, is_active_revision, storage_ref}` — **`storage_ref` is the frozen Doc-2/Doc-4D §D7.2 field name; the resolution's §I.7 `file_ref` is reconciled upward to it (§7) [review-adjudicated 2026-07-03]** | C | `spec_documents` (versioned, never overwritten — Invariant #8) |
| Vendor summary | `vendor_id` · `vendor_name` · `vendor_url` (builder-emitted microsite link, opaque) — **no `vendor_slug`** **[owner-ruled 2026-07-03]** | R | `vendor_profiles` + canonical URL builder (ADR-024 CHR, by pointer) |
| Canonical URL | `canonical_url` — **opaque, read-only; clients MUST NOT derive, modify, or reconstruct it** and MUST NOT construct product URLs locally **[owner-ruled 2026-07-03]** | K | canonical URL builder (E-3/`ADR-025_Marketplace_Public_URL_Law`, by pointer; never stored) |

**Exclusions are binding** (Doc-4D v1.0.3 normative exclusion manifest, by pointer): no trust/performance
values (Doc-5G badge reads compose **beside** on the page, never inside this response) · no price/currency ·
no counts · no draft/internal fields · no related items · no buyer-private facts · no entitlement facts ·
no pricing/inventory/quotation/engagement state. `Attributes` reserved — absent in v1.

## 1.3 Non-disclosure & errors (R9; Doc-5A §6.2/§6.3)

- **R9 atomicity:** unknown / draft / unpublished / soft-deleted / **suspended-vendor** / banned-vendor →
  **one uniform `404` (`marketplace_product_not_found`, NOT_FOUND)** — byte-identical in status, body, and
  timing across every absence cause **and every cache tier**; the collapse is computed **once for the whole
  composition** (a partial composition never leaks — no 200-with-holes for a non-served product). *(Cause
  set conformed upward to frozen Doc-5D §8.2 — banned/suspended/unpublished drop identically; the
  resolution's enumerations omitted `suspended` **[review-adjudicated 2026-07-03]**.)*
- Malformed `{id}` → `marketplace_product_invalid_input` (VALIDATION) per the frozen product-read error
  register (Doc-4D §D7.2 read block — **no code coined**); statuses per Doc-5A §6.2 by pointer.
- Top-level `reference_id` on every body-bearing response (§4.7; Doc-4A §22.1 C-05).
- **Reads are not audited** (Doc-4A §17.1); no event emitted; idempotency n/a (§8.3 convention).

## 1.4 Rate limiting (Doc-4A §19; §18.2 gate)

Throughput-type control; `RATE_LIMITED` (retryable true, contract-declared interval semantics). Bound to the
registered POLICY identifier `marketplace.public_read_rate_limit` — **registered by the linked
`Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit` (instrument E-2), folded alongside this
patch** (Doc-4A §18.2; DD-6 precedent, CHK-5A-071 family).

## 1.5 Byte-consistency obligation

This endpoint is a **derived projection over the same read-models** as its granular sources
(`get_product` Public leg, `get_spec_library_entry` public leg, `get_spec_document` public leg,
`list_categories`). For the same published product at the same instant, composed fields ≡ granular fields
(conformance row F-6, Part 4). The granular reads remain entity authority (resolution §I.5.4).

---

# PATCH-5D-PPD-01 · Part 2 — Breadcrumb deterministic pick rule (resolution Decision 8 / RK-8)

**This section is the normative fixing of the rule the Board deferred to patch time.**

**Field-model correction (verified against Doc-2):** the resolution's RK-8 sketch cited "`level` /
`is_specialized`, no primary flag". Doc-2 defines `marketplace.category_assignments` with
**`level` as an enum (`primary` / `secondary`)** — an assignment-level attribute, **not** tree depth — plus
`is_specialized` and `status(proposed/active/removed)`, with the service rule ≤10 total / ≤5 primary
assignments; assignments are **vendor-scoped** (→ `vendor_profiles`, → `categories`); products carry no
direct category reference. The rule below therefore operates on the **owning vendor's assignments** and uses
the real fields.

**Eligible set:** the owning vendor's `category_assignments` with `status = active`, each resolved to the
full root→leaf path of its assigned category; paths through `retired` categories are excluded (Doc-2 §0.2
public-read exclusion).

**`primary_category_path`** = the eligible path selected by this total order, applied in sequence until a
single path remains:

1. **Deepest path wins** — greater root→leaf depth (most specific; tree ≤4 levels).
2. **`is_specialized = true`** beats `false`.
3. **`level = primary`** beats `secondary`.
4. **Lowest assigned-category UUID** (ascending canonical byte order) — final, always-total tiebreak.

**Determinism clause [owner-ruled 2026-07-03]:** the rule is evaluated at read time, is identical for every
actor, and is **evaluated independently of request order, database ordering, or insertion sequence** — the
same data always yields the same `primary_category_path`, on any implementation.

**Array-order clause [owner-ruled 2026-07-03]:** **`category_paths[]` SHALL be returned in the same
deterministic order as the breadcrumb selection** — `primary_category_path` first, remaining paths ordered
by the same comparison rule — so identical data never produces implementation-dependent array orders.

The selection is **presentation-neutral data ordering only**: it feeds the P-PUB-11 breadcrumb (resolution
§I.9) and creates **no** matching, ranking, or discovery-ordering surface (R6/DD-2 untouched; no
governance-signal input — the rule reads taxonomy facts only).

**No Doc-2 change:** no primary flag is added to the domain model (resolution RK-8 — "no Doc-2 flag patch");
the rule is a realization-layer computation (Class K).

---

# PATCH-5D-PPD-01 · Part 3 — Conformance correction: `marketplace.get_spec_library_entry.v1`

**This is a conformance correction only. No new contract is introduced.**

**The defect (downward narrowing):** Doc-5D realized `get_spec_library_entry` as **User / Controlling-Org**
(Pass1 §2.3 inventory row 31: Actor `User`, Active-Org `Y`; Pass2 §5.4: "`get_spec_library_entry` →
**Controlling-Org**"). Its own module contract declares the read group Public: Doc-4D PassB
CatalogProductSpec §D7.2 read block (:120–122) — *"`get_product` · `list_products` ·
`get_spec_library_entry` · `get_spec_document` — 21.3 Query · **Actor: public / User** — public read of
published products/**spec entries**/public documents"*. Doc-2 independently models `spec_library_entries`
visibility as **shared (public)**. Doc-5D narrowed its module contract — a realization defect, corrected
upward (CLAUDE.md §7).

**Corrected realization (replaces the two frozen statements above, carried alongside — not edited in place):**

- Inventory row 31 → Actor **Public / User** · Path unchanged (`GET /marketplace/spec_library_entries/{id}`) ·
  Active-Org **Y / N** · Success `200`.
- Pass2 §5.4 sentence → "`get_spec_library_entry` → **Public-or-Controlling-Org**".

**Public-leg projection (field-level review against Doc-4D §D7.2, mandated at patch time):**

- The public leg serves **only entries reachable via at least one published product** (a `product_spec_links`
  row to a `status = published`, non-soft-deleted product of a non-banned/suspended vendor). An entry with no
  published linkage collapses to the uniform `NOT_FOUND` — **byte-identical to absence** (R9; count/read
  consistency with `get_public_product_detail`, F-3 analogue).
- Public-leg fields = the entry's spec summary surface exactly as composed into
  `get_public_product_detail` (entry id, name, summary + its document refs under the frozen `doc_type`
  enum): the Doc-4D §D7.2 declared public surface — "published products/spec entries/public documents".
  **No org-internal fact** (controlling-org identifiers, draft/unpublished linkage, buyer-uploaded
  RFQ-attached documents — the latter remain gated by `rfq.rfq_document_grants`, RFQ-owned per Doc-4E,
  unchanged) appears on the public leg.
- The Controlling-Org leg is **unchanged** (own-org entries, including those not yet publicly reachable).
  The two legs are distinct projections, never merged (R5).

**No inventory count change** (an actor-column correction, not a new row): Doc-5D remains 64 caller-facing +
7 out-of-wire over Doc-4D v1.0.2's 71 — the count change to 65/72 comes solely from Part 1's new row 65
(linked Doc-4D patch).

---

# PATCH-5D-PPD-01 · Part 4 — Conformance rows carried for Doc-8 (wired at fold time)

CHK-style rows (resolution Annex F, restated as this patch's obligations; Doc-8 wiring is mechanical at fold):

| # | Check |
|---|---|
| F-1 | **404 byte-equality** across absent/draft/unpublished/soft-deleted/**suspended**/banned — status, body, timing — **including every cache tier** *(cause set per frozen Doc-5D §8.2 — `suspended` added over the resolution's Annex-F wording **[review-adjudicated 2026-07-03]**)* |
| F-2 | **301 slug-correction** on the page route (E-3 owned; recorded here for the pair): any non-canonical slug segment for a published product 301s to the current canonical; id-only leg resolves |
| F-3 | **R9 count consistency**: an unpublished product disappears from search results, facet counts, sitemaps, and detail identically |
| F-4 | **Builder-only lint** (E-3 owned; recorded here for the pair): no string-concatenated product URL in any emitter (pages, metadata, JSON-LD, sitemap, notifications) |
| F-5 | **No vendor-host product route** (E-3 owned; recorded here for the pair): no product-detail route resolves under any vendor host (v1 invariant) |
| F-6 | **Byte-consistency**: composed read fields ≡ their granular-read sources for the same published product |
| F-7 | **Breadcrumb determinism**: for fixed assignment data, `primary_category_path` and `category_paths[]` order are identical across repeated reads, actors, and implementations (Part 2 clauses) |
| F-8 | **Spec-entry public-leg gate**: an entry with no published-product linkage returns the uniform `NOT_FOUND` on the public leg, byte-identical to absence, while remaining readable on its Controlling-Org leg |

---

# Explicit NOT-changes

No new endpoint beyond row 65 · no change to any other inventory row or §4–§9 section · R1–R10 intact ·
no error code coined · no audit action, event, or slug touched · the granular `get_category_assignments.v1`
stays vendor-addressed Controlling-Org (**no widening** — resolution Decision 3) · out-of-wire §9 set
unchanged (7 contracts) · no matching/ranking/discovery-ordering surface created (R6/DD-2).

# Downstream resolution — landed together at this fold

- **`Doc-4D_PublicProductDetail_Patch_v1.0.3` (linked pair):** the contract this Part 1 realizes.
  **Folded together with this patch.**
- **E-2 (`Doc-3_Policy_Key_Registration_Patch_v1.11_PublicReadRateLimit`)** registers
  `marketplace.public_read_rate_limit`. **Folded together with this patch.**
- **E-3 (`ADR-025_Marketplace_Public_URL_Law`)** ratifies the canonical product URL law. **Folded together
  with this patch.**
- **Doc-8:** Part 4 rows to be wired at Doc-8's own next pass (E-1 closure step; the E-3-owned rows F-2/F-4/F-5
  are reconciled by E-3's channel).
- **`ESC-7-API-PRODDETAIL`:** E-1 **wire leg** resolved by this patch — registry pointer updated at fold time.
  **FE-PUB-05** un-gated at this fold — Annex E items E-1 + E-2 + E-3 have all landed together.

---

*End of Doc-5D_PublicProductDetail_Patch_v1.0.1 — realizes the composed Public read on
`GET /marketplace/public_product_details/{id}` with the R9 collapse enforced once; fixes the breadcrumb
deterministic pick rule (deepest → specialized → primary-level → lowest-UUID, order-independent, with
deterministic `category_paths[]` ordering); corrects `get_spec_library_entry` upward to
Public-or-Controlling-Org (conformance correction only — no new contract); carries F-1…F-8 for Doc-8.
Coins no verb, code, slug, event, or audit action. Linked-pair with Doc-4D_PublicProductDetail_Patch_v1.0.3
— approved and folded together.*
