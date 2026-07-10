# Doc-4D_PublicProductDetail_Patch_v1.0.3_PROPOSAL.md

> **⏳ STATUS: PROPOSAL — awaiting API-Gov Board + human approval (CLAUDE.md §8).** Architecture-affecting
> additive patch; **no frozen file is edited in place.** On approval this file is copied to
> `generatedDocs/Doc-4D_PublicProductDetail_Patch_v1.0.3.md` (producing **Doc-4D v1.0.3**), registered in
> `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md`, and carried **alongside** the unedited frozen Doc-4D
> (v1.0 + `Doc-4D_CanonicalHost_Patch_v1.0.2`).
>
> **Linked-pair** with `Doc-5D_PublicProductDetail_Patch_v1.0.1` (wire realization) — the two patches are
> approved and folded **together**, mirroring the Doc-2 v1.0.4 ↔ Doc-4C v1.0.2 and Doc-2 v1.0.5 ↔
> Doc-4D v1.0.2 linked-pair precedents.
>
> **Realizes** Annex-E instrument **E-1** (contract leg) of the Board-ratified resolution
> `governanceReviews/ESC-7-API-PRODDETAIL_Product_Detail_Architecture_Plan_v1.0_PROPOSAL.md`
> (**`R-ESC7-PRODDETAIL-FREEZE`**, human Board, 2026-07-03) — Decisions **2** (coin the composed read)
> and **3** (category path embedded-only). Owner plan-review rulings of 2026-07-03 (two adjudication
> rounds, all findings accepted) are folded and marked **[owner-ruled 2026-07-03]** where they refine
> the resolution text.
>
> **Hard Review (two independent lanes, 2026-07-03): BLOCKER 0 · MAJOR 0.** 7 unique MINOR + 4 NIT
> raised; all adjudicated **ACCEPT** through the §13 Validate-Findings gate and folded (marked
> **[review-adjudicated 2026-07-03]** where they correct resolution text upward to the frozen corpus);
> OBS items recorded, no action.

## Status

Proposed Patch — awaiting human approval (API-Gov Board channel)

| Field | Value |
|---|---|
| Patch ID | **PATCH-4D-PPD-01** |
| Applies to | Doc-4D v1.0 (`Doc-4D_Structure_v1.0_FROZEN.md` + Content passes) **+** `Doc-4D_CanonicalHost_Patch_v1.0.2` |
| Produces | Doc-4D **v1.0.3** (v1.0.2 + this patch) |
| Scope | **One additive Public query contract** — `marketplace.get_public_product_detail.v1` — appended to **BC-MKT-6 Discovery & Read-Model** (Doc-4D §D6) — **nothing else.** No entity change, no ownership change, no schema change, no event, no state-machine change, no permission slug, no audit action, no POLICY registration (intended identifier reserved only — see §Rate-Limiting). |
| Purpose | Give the public Product Detail page (P-PUB-11 / FE-PUB-05) its canonical composed read, so the R9 non-disclosure collapse is enforced **once** at the contract instead of re-implemented by every consumer, per resolution §I.5.4 (rejected alternative B-alone). |
| Raised by | `ESC-7-API-PRODDETAIL` (esc_registry) → Board resolution `R-ESC7-PRODDETAIL-FREEZE` (2026-07-03), Annex E item E-1 |
| Authority | CLAUDE.md §7 (Doc-4D = rank 0 module contract), §8 (architecture-affecting → **human approval**), §11 (additive only), §13; Doc-4A §21.3 (Query template), §12 (error model), §19 (rate limiting), §18.2 (POLICY gate); Doc-4D §D6 (BC-MKT-6 home) |

All frozen Doc-4D decisions — the tri-actor model, BC partitions, DD-1…DD-8 dispositions, R-register, the
`[ESC-MKT-AUDIT]` carried gap — are **preserved**. The freeze on Doc-4D remains in force; this patch is the
minimal additive exception routed through change management (human approval).

---

# PATCH-4D-PPD-01 — New contract `marketplace.get_public_product_detail.v1`

**Location:** Doc-4D §D6 — **BC-MKT-6 Discovery & Read-Model**, appended to the public read surface beside
`search_catalog` / `list_vendor_directory` / `get_public_vendor_profile` (composition precedent:
`get_public_vendor_profile.v1`, resolution §I.5.1).

**Template:** Doc-4A **§21.3 Query**; naming per Doc-4A **§3.2** (imperative verb + owned entity — no new
verb coined; `get` + `public_product_detail` follows the frozen `get_public_vendor_profile` naming shape
exactly, with the `.v1` version suffix).

## Contract declaration

- **Contract-ID:** `marketplace.get_public_product_detail.v1` · **Kind:** 21.3 Query · **Owner:** M2 (BC-MKT-6)
- **Purpose:** the canonical composed **Product Detail Projection** (resolution §I.6, Figure PD-03) for **one
  published product** — the single read the public product-detail page consumes (PD-P10: FE never re-composes
  from granular legs).
- **Actor:** **public** — the frozen single-Public-projection label used by the three BC-MKT-6 siblings
  (Doc-4D PassB Discovery read block: "Actor: public"); the resolution §I.5.2's "Public / User" phrasing
  described the caller population, not a dual projection leg **[review-adjudicated 2026-07-03 — frozen
  labeling wins]**. Anonymous (R2): **no `Authorization`, no `Iv-Active-Organization`**; anonymous-cacheable;
  a signed-in User receives the **identical** Public projection (no Controlling-Org leg on this contract).
  **Admin has no special leg** (Admin governance goes through owning-module commands only).
- **Authorization (§B.9):** none required (public read of published state). No permission slug bound — coining
  none (Doc-4A §6.4 anti-invention).
- **Preconditions:** the product exists, `status = published`, is not soft-deleted, and its owning vendor profile
  is not banned/suspended/soft-deleted. **Any precondition failure — including sheer absence — yields the single
  uniform `NOT_FOUND`** (see Non-Disclosure).
- **Request Contract:** `product_id : uuid : required` (UUIDv7). No other inputs in v1.
- **Response Contract (§B.3):** `{ entity } + reference_id` — the Product Detail Projection, **M2-owned data
  only** (resolution §I.5.2 "Composes"; logical model §I.7 — bound by pointer, realized field-by-field in the
  linked Doc-5D patch):
  - **product core** — id · name · description · media refs from `images_jsonb` (**storage refs only, never
    inline binary — Doc-2 §9 out-of-DB boundary / Doc-6A §12.1 (R12)**; delivery via signed/public URL at
    read; companion convention GI-09 supplementary) · timestamps. Published state is implicit (only published
    products are served).
  - **taxonomy** — `primary_category_path` + `category_paths[]` (id+slug+name chain per path, ≤4 levels,
    admin-governed tree) **[owner-ruled 2026-07-03: field naming]**. Paths derive from the owning vendor's
    **active** category assignments (Doc-2 — `category_assignments` is vendor-scoped; products carry no direct
    category reference). `primary_category_path` is selected by the **deterministic pick rule fixed in the
    linked Doc-5D patch** (resolution Decision 8 — rule at patch time, Doc-5D patch text). Class C — present
    iff **eligible paths exist** (eligible set per the linked Doc-5D rule — active assignments resolving
    through non-retired categories; assignments alone do not guarantee presence) **[review-adjudicated
    2026-07-03]**.
  - **specifications** — linked spec-entry summaries via `product_spec_links → spec_library_entries`; spec-document
    refs (`doc_type` frozen enum `urs|datasheet|checklist|drawing|standard`, version/active-revision,
    **`storage_ref`** — the frozen Doc-2/Doc-4D §D7.2 field name; the resolution's §I.7 `file_ref` wording is
    reconciled upward to the frozen name per §7 **[review-adjudicated 2026-07-03]**) via `spec_documents`
    (versioned, never overwritten — Invariant #8). Class C.
  - **vendor summary card** — **`vendor_id` + `vendor_name` + builder-emitted vendor microsite URL only.
    `vendor_slug` is NOT exposed in this payload** **[owner-ruled 2026-07-03, supersedes the resolution's
    §I.7 vendor-summary row AND the §I.5.2 Composes row ("vendor slug for the CHR link") on this point]**: all links are derived server-side by the canonical URL builder
    (ADR-024 CHR for the vendor link; E-3/ADR-025 for the product link), keeping the URL law the sole
    construction authority and leaving no client-side slug assembly path.
  - **`canonical_url`** — Class K (computed at read, never stored), emitted **only** by the canonical URL
    builder (E-3/ADR-025 — referenced by pointer, never restated here). **`canonical_url` is an opaque value
    returned by the service; clients MUST treat it as read-only and MUST NOT derive, modify, or reconstruct
    it** **[owner-ruled 2026-07-03]**. Clients MUST NOT construct product URLs locally.
- **Normative exclusion manifest (binding — resolution §I.7):** no trust/performance values (trust badges are
  composed **beside** this read from Doc-5G, never inside — resolution §I.5.2 "permitted but rejected"; R6/DD-2) ·
  no price or currency · no counts (views/RFQ demand) · no draft/internal fields · no related items (carried
  `ESC-7-API/related`) · no buyer-private anything (Invariant #11) · no entitlement facts (R8) ·
  **no pricing, inventory, quotation, or engagement state is added to this projection** **[owner-ruled
  2026-07-03: scope-creep guard]**. The `Attributes` section is **reserved — empty in v1** (resolution §I.7.2).
- **Visibility / projection:** **single Public projection class — published products only; no merged read (R5).**
  Draft preview stays on the existing `get_product.v1` Controlling-Org leg (unchanged). This contract is a
  **derived projection over the same M2 read-models** as the granular reads — byte-consistency with its granular
  sources is a conformance obligation (linked Doc-5D patch, Annex-F row F-6).
- **Non-Disclosure (R9 atomicity):** unknown / draft / unpublished / soft-deleted / **suspended-vendor** /
  banned-vendor → **one byte-identical `NOT_FOUND` for the whole composition** (status, body, timing —
  including every cache tier); the collapse is enforced **once at this contract**, not per consumer.
  *(Cause set conformed upward to frozen Doc-5D §8.2 — "banned / suspended / unpublished vendors … drop
  identically"; the resolution's enumerations omitted `suspended` **[review-adjudicated 2026-07-03]**.)*
- **Validation Matrix (§B.4, query):** SYNTAX (`product_id` UUID) → CONTEXT → AUTHZ (public) → SCOPE.
- **Error Register (§B.5):** **reuses the frozen product-read codes — no code coined:**
  `marketplace_product_invalid_input` (VALIDATION, retryable no) · `marketplace_product_not_found`
  (NOT_FOUND, retryable no — the uniform R9 collapse) · SYSTEM per Doc-4A §12. Statuses per Doc-5A §6.2
  (by pointer; realized in the linked Doc-5D patch).
- **State Effects (§13):** none (query). **Idempotency (§B.7):** n/a (read). **Audit (§B.8):** no.
  **Events:** none. *(Doc-4D read-block convention — e.g. Doc-4D PassB CatalogProductSpec §D7.2 read block.)*
- **Rate Limiting (Doc-4A §19):** throughput-type, `RATE_LIMITED` error class, POLICY-bound. Bound to the
  **intended POLICY identifier `marketplace.public_read_rate_limit` — reserved here (unregistered); referenced
  by intended name only, registration not implied** (Doc-4A §18.2 gate). Registration — names and values — is
  the sibling instrument **E-2** (additive Doc-3 §12.2 batch), which must land **before contract freeze**
  of this patch's realization.
- **Reference Validation (§B.10):** `product_id` existence is folded into the R9 collapse (absence and
  non-disclosure are indistinguishable — Invariant #11).
- **Dependencies:** M2-owned read-models only (`products`, `vendor_profiles`, `categories` +
  `category_assignments`, `product_spec_links`, `spec_library_entries`, `spec_documents`) + the canonical URL
  builder (E-3/ADR-025 by pointer). **No cross-module read** — M5 trust badges are page-composed beside
  (Doc-5G reads), never fetched by this contract.
- **AI-Agent Notes:** never widen this projection with trust/price/counts/related items — those are governed
  exclusions; never expose `vendor_slug` on this payload; never emit a URL except via the canonical builder;
  the R9 collapse must remain byte-identical across all absence causes.

## Versioning & evolution (bound, not invented)

Additive-only after freeze; never rename, never remove; optional-field addition is the growth path
(reserved `Attributes` section is the declared socket); compatibility guaranteed within `v1`; `v2` only via
the Doc-4A §20 breaking-change table; consumers must tolerate unknown fields (resolution §I.5.5, PD-P6).

---

# Partition impact

- **BC-MKT-6 Discovery & Read-Model:** contract inventory increases by one (**3 → 4**).
- **Doc-4D total:** contract inventory increases by one (**71 → 72**; caller-facing **64 → 65**;
  out-of-wire unchanged at 7).
- Every other BC partition, the DD register, the R-register, and all existing contracts are **unchanged**.

# Explicit NOT-changes

No new module · no ownership change · no entity/schema change (Doc-2 untouched) · no event coined · no
state-machine change · no permission slug coined · no audit action coined (reads are not audited) · no
POLICY key **registered** (intended identifier reserved only — E-2 registers) · no governance-signal
exposure (Trust display ruling 2026-07-03 referenced by pointer; trust stays **beside**) · **no pricing,
inventory, quotation, or engagement state added to this projection** · no change to `get_product` /
`list_products` / any granular read (they remain entity authority) · no vendor-host product route implied
(URL law is E-3/ADR-025).

# Downstream resolution (recorded, not edited here)

- **`Doc-5D_PublicProductDetail_Patch_v1.0.1` (linked pair):** realizes this contract on HTTP (wire path per
  Doc-5A §5.3), fixes the breadcrumb deterministic pick rule (resolution Decision 8), and carries the
  `get_spec_library_entry` conformance correction (resolution §I.5.3 — a Doc-5D-only correction; **this
  Doc-4D patch is intentionally silent on it** because Doc-4D:120 is already correct).
- **E-2 (Doc-3 §12.2 POLICY batch):** registers `marketplace.public_read_rate_limit` (+ any sibling
  public-read keys) with values — pending sibling instrument; **not resolved here.**
- **E-3 (ADR-025-class record + Doc-7 leg):** canonical product URL law — pending sibling instrument;
  **not resolved here**; this contract consumes its builder by pointer.
- **`ESC-7-API-PRODDETAIL`:** the E-1 **contract leg** is resolved by this patch on fold; registry pointer
  updated at fold time (E-5/E-6 channels).
- **FE-PUB-05:** un-gates when **Annex E items 1–3** have landed — E-1 (this pair) + E-2 (POLICY
  registration, also a contract-freeze gate here) + E-3 (resolution Decision 10, cited per its ratified
  text) **[review-adjudicated 2026-07-03]**.

---

*End of Doc-4D_PublicProductDetail_Patch_v1.0.3 (PROPOSAL) — one additive 21.3 Query
(`marketplace.get_public_product_detail.v1`) in BC-MKT-6; coins no verb, no error code, no slug, no event,
no audit action, no POLICY registration; R9 collapse centralized; trust beside-never-inside; vendor_slug
withheld from the payload and `canonical_url` opaque per owner rulings 2026-07-03. Linked-pair with
Doc-5D_PublicProductDetail_Patch_v1.0.1 — approved and folded together, or not at all.*
