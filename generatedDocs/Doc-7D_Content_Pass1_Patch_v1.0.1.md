# Doc-7D — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7D_Content_v1.0_Pass1.md` (§0–§4) |
| Applies | `Doc-7D_Content_Pass1_Independent_Hard_Review_v1.0.md` (3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§4 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§5–§9 + Appendix) |
| Discipline | Additive; nothing coined; capability claims verified against the frozen surface |

---

## Changes

### C-1 — closes **MINOR-1** (microsite published-projection binding)
**Verified `Doc-5D R5`:** Content≠Presentation is realized as **two distinct read projections — draft (controlling-org) and published (public)** — as distinct wire surfaces (BC-MKT-4, §6). §4.1/§4.2 amended:
> The microsite binds the **BC-MKT-4 published (public) presentation projection** (the published wire surface) + `get_public_vendor_profile` + vendor-scoped `search_catalog` — **all Public reads**; the microsite is **fully BOUND** (not an ESC). The **draft projection is controlling-org** — managed in the Vendor workspace (Doc-7G). The **draft/published projection split *is* the wire realization of Content≠Presentation** (Invariant #9; `Doc-5D R5`).

The §2.2 microsite row is updated to BOUND via the published projection.

### C-2 — closes **MINOR-2** (§3 published-only non-disclosure)
§3 (new §3.1a) adds the `Doc-5D R5` rule:
> The public surface consumes **only published projections**. **Draft / unpublished / soft-deleted / retired content is excluded from every public read** (`Doc-5D R5`; `Doc-2 §0.2`) — a vendor's unpublished draft microsite/profile/product never appears publicly. No merged read leaks draft state to the public surface.

### C-3 — closes **MINOR-3** (§2.3 ads via sponsored placement)
§2.3 `[ESC-7-API-ADS]` refined:
> Anonymous ad display is realized as **sponsored placements surfaced within `search_catalog`** (the Public discovery read; platform earns on sponsored placements — Master Architecture) **if** the Public `search_catalog` projection includes sponsorship. **Only if it does not** is a standalone Public ad read required → **`[ESC-7-API-ADS]`** (additive Doc-5D patch, Board). Confirm against `Doc-5D` BC-MKT-5/6 at content; no standalone `get_advertisement`/`list_advertisements` (User) is used on the anonymous surface.

### C-4 — closes **NITPICK-1** (§2.2 BOUND-via-search vs ESC)
§2.2 table reorganized into three clearly-labeled groups: **BOUND (direct Public read)** — search/directory/microsite; **BOUND (via `search_catalog`)** — catalog items, category facets, sponsored ads (pending C-3 confirmation); **`[ESC-7-API]` (genuine gap)** — standalone anonymous product-detail page, standalone public category list, standalone public ad read (if sponsorship not in search).

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MINOR-1 microsite published projection | MINOR | C-1: bind BC-MKT-4 published projection (Doc-5D R5); microsite fully BOUND; draft=7G | **CLOSED** |
| MINOR-2 published-only non-disclosure | MINOR | C-2: §3.1a draft/unpublished/soft-deleted excluded (Doc-5D R5; Doc-2 §0.2) | **CLOSED** |
| MINOR-3 ads via sponsored placement | MINOR | C-3: sponsored-in-search realization; standalone ad = ESC only if absent | **CLOSED** |
| NITPICK-1 §2.2 grouping | NIT | C-4: BOUND-direct / BOUND-via-search / ESC | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** All three refinements pulled in the verified `Doc-5D R5` draft/published projection model (microsite fully bound; published-only non-disclosure; ads-via-sponsored-placement). No capability assumed; genuine gaps remain `[ESC-7-API-*]`.

**Next pass:** Content Pass-2 (§5–§9 + Appendix) — conversion CTAs & auth-entry boundary (§5), data access via the Doc-7C client (§6), public render/SEO (§7), baseline (§8), conformance & carried items incl. the `[ESC-7-API-*]` register (§9), view-inventory skeleton (Appendix).

*End of Content Pass-1 Patch v1.0.1 + Short Closure Check. Effective §0–§4 = Pass-1 + this patch. Additive; nothing coined; capability claims verified.*
