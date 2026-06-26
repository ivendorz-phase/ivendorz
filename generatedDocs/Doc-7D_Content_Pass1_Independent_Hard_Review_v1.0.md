# Doc-7D — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7D_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · realize-never-redecide · Doc-5D projection conformance |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- **§2.1 narrow Public surface** — verified: only **BC-MKT-6** (`search_catalog`/`list_vendor_directory`/`get_public_vendor_profile`) is "Public Query (anonymous)"; `get_product`/`list_categories`/`get_advertisement` are **User** (21.3). The bind-or-ESC table is correct, and the `[ESC-7-API-*]` markers are the right realize-never-redecide outcome. CORRECT — strong pass.
- §3 Public-projection-only + Invariant #11 (no buyer-private concept) — CORRECT.
- §4.3 re-query not client reorder; no M3 on public — CORRECT.

0 BLOCKER, 0 MAJOR. The bind-or-ESC discipline worked. Three refinements (all tied to the **Doc-5D R5 draft/published projection model**, which the pass under-used) + one nit.

### MINOR-1 — §4 under-binds the microsite; bind the BC-MKT-4 **published (public) presentation projection**
§4.1 binds the microsite to `get_public_vendor_profile` + vendor-scoped `search_catalog` only. **`Doc-5D R5`** establishes that Content≠Presentation is realized as **two distinct read projections — draft (controlling-org) and published (public) — as distinct wire surfaces** (BC-MKT-4, §6). The microsite's presentation/experience therefore has a **published (public) projection** that the anonymous surface binds.
**Required fix:** §4 bind the microsite to the **BC-MKT-4 published (public) presentation projection** (in addition to `get_public_vendor_profile`); the microsite is **fully BOUND** via Public reads (not an ESC). The **draft projection is controlling-org** — the Vendor workspace's (Doc-7G). State the draft/published split as the binding.

### MINOR-2 — §3 omits the Doc-5D R5 published-only non-disclosure rule
§3 covers projection/Invariant-#11 but not the **draft/unpublished exclusion**. `Doc-5D R5`: **no merged read leaks draft state to the public surface; soft-deleted / unpublished / retired entities are excluded from public reads** (`Doc-2 §0.2`).
**Required fix:** §3 add — the public surface consumes **only published projections**; **draft / unpublished / soft-deleted / retired content is excluded from every public read** (`Doc-5D R5`; `Doc-2 §0.2`). This is a load-bearing non-disclosure rule (a vendor's unpublished draft microsite/profile never appears publicly).

### MINOR-3 — §2.3 `[ESC-7-API-ADS]` over-states "no ads"; ads may surface as sponsored placements within `search_catalog`
The platform earns on **sponsored placements** (Master Architecture). Anonymous ad display is plausibly realized as **sponsored placements within `search_catalog` Public results**, not a standalone `get_advertisement` read.
**Required fix:** §2.3 refine — anonymous ad display is realized as **sponsored placements surfaced within `search_catalog`** *if* the Public search projection includes sponsorship; **only if it does not** is a standalone Public ad read required → `[ESC-7-API-ADS]`. Confirm at content against `Doc-5D` BC-MKT-5/6; don't flatly assert "no ads."

### NITPICK-1 — §2.2 table: mark the search-realized rows as realizations, not gaps
"Catalog/product via search" and "category via facets" sit alongside the ESC rows; label them clearly as **realized via the Public `search_catalog`** (BOUND), distinct from the genuine ESC gaps (standalone product-detail / standalone category list / standalone ads).
**Required fix:** visually separate BOUND-via-search rows from ESC rows.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 microsite published-projection binding | MINOR | Content Patch — bind BC-MKT-4 published projection |
| MINOR-2 §3 published-only non-disclosure (R5) | MINOR | Content Patch — add draft-exclusion |
| MINOR-3 §2.3 ads via sponsored placement | MINOR | Content Patch — refine ESC-ADS |
| NITPICK-1 §2.2 BOUND-via-search vs ESC clarity | NIT | Content Patch — relabel |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-2 (§5–§9 + Appendix).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. 0 MAJOR — the bind-or-ESC pass is strong; three refinements bring in the Doc-5D R5 draft/published projection model (microsite binding + published-only non-disclosure + ads-via-sponsored-placement).*
