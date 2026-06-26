# Doc-7D — Public Surface — **Content Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-7D_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7D_Structure_v1.0_FROZEN` §0–§4; PR1 (§1) · PR2 (§2) · PR3 (§3) · PR4 (§4) |
| Authority | Conforms to `Doc-7A`/`Doc-7B`/`Doc-7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5D Public surface |
| Posture | Reference-never-restate; **mechanism only — no JSX/page/route code**. Coins **nothing**; gaps → `[ESC-7-API]` |

> **Scope:** the public-surface foundation — control & gating (§0), scope & place (§1), the **view inventory & contract binding** (§2 — the load-bearing bind-or-ESC pass), public projection & non-disclosure (§3), microsite & Content≠Presentation (§4). §5–§9 + Appendix land in Pass-2.

---

## §0 — Document Control, Precedence & Gating

### §0.1 Precedence & conformance
Doc-7D is a Doc-7 **surface** document. It **conforms to** `Doc-7A` (metastandard), `Doc-7B` (kit), `Doc-7C` (App Shell), and to Doc-4M/Doc-2 (upstream); it is **consistent with** the frozen **Doc-5D Public** read surface. On any conflict the higher document wins and Doc-7D is corrected.

### §0.2 Realize-never-redecide
Doc-7D realizes the anonymous Public surface by **binding frozen Doc-5D Public-projection reads** to views. It re-authors no contract and **invents none**. Where an anonymous view needs a read not present as a frozen **Public** projection, the gap is **`[ESC-7-API]`** (additive Doc-5x patch, Board) — never coined (`Doc-5 Governance Note §7`).

### §0.3 Freeze obligation
Doc-7D passes the **full** `Doc-7A` Appendix A applicable per PR9 (conditional read/write checks) and clears any carried `[ESC-7-*]` before freeze (governance §8 rules 1, 3).

---

## §1 — Scope & the Public Surface's Place *(authors no kit/shell/other surface)*

Doc-7D is the **anonymous** read surface — Public projection only, no active-org, no anonymous mutation (PR1/PR3/PR5). It mounts in the Doc-7C **`(public)` route group**, consumes the Doc-7B kit + Doc-7C server-side wired client **by reference**, and authors only its own public views. It authors no kit/shell (Doc-7B/7C) and no other surface (Doc-7E…7H).

---

## §2 — View Inventory & Contract Binding *(the bind-or-ESC pass)*

### §2.1 The frozen Public read surface is narrow — three reads
**Verified vs `Doc-5D_Structure_v1.0_FROZEN`:** the **only** contracts marked **"Public Query (anonymous)"** are **BC-MKT-6 §8**: `search_catalog`, `list_vendor_directory`, `get_public_vendor_profile`. Every other Doc-5D read (`get_product`/`list_products` BC-MKT-3, `list_categories` BC-MKT-2, `get_advertisement`/`list_advertisements` BC-MKT-5, `get_vendor_profile` BC-MKT-1) is a **User Query (21.3)** — **not** an anonymous Public projection.

### §2.2 View → contract binding
| Public view | Binds (frozen Public read) | Status |
|---|---|---|
| **Marketplace discovery / search** | `search_catalog` (BC-MKT-6 §8, Public) | **BOUND** |
| **Vendor directory** | `list_vendor_directory` (BC-MKT-6 §8, Public) | **BOUND** |
| **Public vendor profile / microsite** | `get_public_vendor_profile` (BC-MKT-6 §8, Public) | **BOUND** (§4) |
| **Catalog / product items** | surfaced through **`search_catalog`** results (Public) | **BOUND (via search)** |
| **Standalone anonymous product-detail page** | — (`get_product` is **User**, not Public) | **`[ESC-7-API-PRODDETAIL]`** |
| **Standalone anonymous category browse/nav** | category facets within **`search_catalog`** (Public); a dedicated `list_categories` is **User** | **BOUND via search facets** / standalone = **`[ESC-7-API-CATNAV]`** |
| **Ads display (anonymous)** | — (`get_advertisement`/`list_advertisements` are **User**) | **`[ESC-7-API-ADS]`** |

### §2.3 Disposition of the gaps (flag-and-halt, never coin)
- **`[ESC-7-API-PRODDETAIL]`** — an anonymous standalone product-detail page needs a **Public-projection** `get_product`; none is frozen. **Interim realization:** product information renders **only from `search_catalog` Public results** (no deep anonymous product page) **until** an additive Doc-5D Public `get_product` projection is approved (Board; `[ESC-7-API]`). Not coined here.
- **`[ESC-7-API-CATNAV]`** — anonymous category navigation renders from **`search_catalog` facets** (Public); a dedicated public category list is **`[ESC-7-API]`** if required.
- **`[ESC-7-API-ADS]`** — anonymous ad display has **no frozen Public ad read**. **Interim:** ads are **not rendered on the anonymous surface** until an additive Doc-5D Public ad-read projection is approved (Board). Not coined.

These ESC markers are carried to §9 and resolved only via an additive `Doc-5D` patch (human-approved) — never locally.

### §2.4 No view binds a non-Public projection
Every bound view uses a **Public** read; no view reaches a User/Controlling-Org/Internal-Service projection (PR3). A view that would require one is an ESC, not a silent cross-projection read.

---

## §3 — Public Projection & Non-Disclosure *(mechanism only)*

### §3.1 Public projection only (PR3; `Doc-5D` projection rule)
The surface consumes **only Public-projection** reads (§2). It reaches **no** governance internal, no buyer-private (M4 CRM), no exclusion signal, no routing/matching internal, no User/Controlling-Org projection. A non-disclosed fact collapses to **`NOT_FOUND`** (`Doc-5A §6.3`); byte-equivalence holds (`Doc-7A §8`; `CHK-7-040/041/042`).

### §3.2 No concept of buyer-private status (Invariant #11)
The public surface reflects **only the `public` visibility scope** and has **no concept of buyer-private status whatsoever**: a vendor blacklisted by one buyer **still appears publicly** (the exclusion is private to that buyer, invisible everywhere — including absent from any public-surface awareness). The surface cannot leak an exclusion because it never holds one.

### §3.3 Public list mechanics
Public lists (`search_catalog`, `list_vendor_directory`) consume cursor pagination via the Doc-7C client (§6, Pass-2): the surface renders the contract's exclusion-applied result, computes **no client-side total/count**, and the opaque cursor reveals no excluded count (`Doc-5A §8`; `Doc-4A §10.7`). (The Public projection has nothing buyer-private to exclude — §3.2 — but the list-mechanics discipline holds uniformly.)

---

## §4 — Microsite & Content ≠ Presentation *(mechanism only)*

### §4.1 The microsite binds `get_public_vendor_profile` (Public)
The vendor microsite (public storefront) renders from **`get_public_vendor_profile`** (BC-MKT-6 §8, Public) for the vendor's public profile, plus **`search_catalog`** (vendor-scoped) for the vendor's public catalog. Both are Public reads; the microsite is fully realizable anonymously.

### §4.2 Content ≠ Presentation (`Doc-7A §6`; `Doc-7B` microsite theming)
The microsite renders **M2-owned content** with **vendor-branded presentation** — the Doc-7B microsite theme override (presentation-only, owns no M2 content). Doc-7D is the **public read/render** surface; **M2 owns the content**; the **Vendor workspace (Doc-7G) manages it** (same content, two surfaces, one owner — Doc-7A §6.2). The presentation skin is surface-local; the authoritative content is M2's, fetched via the Public read.

### §4.3 Display controls
Kit sort/filter on public browse **re-queries** `search_catalog` with the contract's sort/filter params (`Doc-7B §4.3` / `Doc-5A §8`), never a client-side reorder of cursor pages. There is **no M3 matching** on the public surface to re-rank (matching is the authenticated RFQ engine — Doc-7F).

---

## Pass-1 self-check (pre-review)

- **Bind-or-ESC honored:** §2 binds the 3 verified Public reads; product-detail/category-nav/ads gaps flagged `[ESC-7-API-*]`, **not coined** — verified vs `Doc-5D` BC-MKT-6 (only Public) vs BC-MKT-1/2/3/5 (User).
- **Mechanism only:** §0–§4 author no page/route.
- **Coins nothing:** 0 new module/contract/route-as-API/field/projection/POLICY key; gaps are ESC markers.
- **Public projection + Invariant #11:** §3 — no non-Public projection, no buyer-private concept.
- **Open for review:** confirm the `[ESC-7-API-ADS]` and `-PRODDETAIL` interim realizations (search-only) are acceptable vs product expectations, or whether the ESCs should be raised to the Board now; confirm `get_public_vendor_profile` is the right microsite read (vs a distinct BC-MKT-4 presentation read).

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-7D_Structure_v1.0_FROZEN` §0–§4. Nothing coined; gaps are `[ESC-7-API-*]`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9 + Appendix).*
