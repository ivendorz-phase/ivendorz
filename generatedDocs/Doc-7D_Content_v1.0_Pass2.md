# Doc-7D — Public Surface — **Content Pass-2 (§5–§9 + Appendix)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 + Appendix of `Doc-7D_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7D FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7D_Structure_v1.0_FROZEN` §5–§9 + Appendix; PR5 (§5) · PR6 (§6) · PR7 (§7) · PR8 (§8) · PR9/PR10 (§9) |
| Carries forward | Pass-1 §2 bind-or-ESC · §3 Public-projection + published-only · §4 microsite |
| Posture | Reference-never-restate; mechanism only. Coins **nothing**; gaps remain `[ESC-7-API-*]` |

> **Scope:** conversion CTAs & the auth-entry boundary (§5), data access via the Doc-7C client (§6), public render & discoverability (§7), baseline (§8), conformance & carried items incl. the ESC register (§9), the view-inventory skeleton (Appendix).

---

## §5 — Conversion CTAs & the Auth-Entry Boundary *(mechanism only)*

### §5.1 No anonymous mutation (PR5)
The Public surface performs **no authenticated mutation** and carries **no `Iv-Active-Organization`** (anonymous). It renders content and **conversion CTAs** only.

### §5.2 CTAs route to the auth-entry area (Doc-7C `(auth)` group → Doc-7E)
Conversion CTAs — **sign up to claim a vendor profile, save a favorite, or start an RFQ** — are **presentation affordances** that route to the **auth-entry routes** (`(auth)` group — Doc-7C SR2; screens authored by Doc-7E). The **auth action itself is Doc-7E's**, not Doc-7D's. After authentication, the user lands in the authenticated surface (claim → Vendor workspace 7G; favorite/RFQ → Buyer workspace 7F) — none of which Doc-7D authors.

### §5.3 CTA gating is UX only (`CHK-7-011`)
A CTA shown to an anonymous visitor is **UX**; the authenticated capability is gated server-side in the destination surface (`Doc-7A §4.3`). The CTA reveals no protected fact and asserts no permission.

### §5.4 Any anonymous write is bind-or-ESC
If product expectations require an **anonymous write** (e.g. a public contact/lead-capture form), it **must trace to a frozen Public-actor command or `[ESC-7-API]`** (PR5) — none is assumed. No such command is presently bound.

---

## §6 — Data Access via the Doc-7C Client *(mechanism only)*

### §6.1 Server-side wired reads (PR6; `Doc-7C §5`)
All public reads flow through the **Doc-7C server-side typed wired client** (RSC fetch). The **browser never calls Doc-5 directly and holds no credential** (`Doc-7C §5.1`). The client binds only the **wired Public** reads (§2).

### §6.2 Pagination & error
Public lists (`search_catalog`, `list_vendor_directory`) consume **cursor pagination** (`Doc-5A §8`) with POLICY-keyed `page_size` (`Doc-3 §12`); offset/page-number forbidden; the surface computes **no client-side total/count** (Pass-1 §3.3). Errors map by `error_class` to the Doc-7B error/not-found primitives (`Doc-7A §5.3`); a non-disclosed fact renders **not-found ≡ absence** (`Doc-7A §8.2`).

### §6.3 No write path
The Public surface uses **no server-action write path** (PR5) — it is read-only. (A future anonymous write would be a server action to a frozen Public command — §5.4, ESC.)

---

## §7 — Public Render & Discoverability *(mechanism only)*

### §7.1 SSR/SSG & indexability (PR7)
Public views are **Server-Component-rendered** (`Doc-7A §3.3`), SSR/SSG-friendly and **indexable**, with public metadata for the marketplace, vendor directory, public profiles, and microsites (SEO). Streaming/suspense per `Doc-7C §7`.

### §7.2 Only published, Public-projection content is exposed
Indexable/public render exposes **only published, Public-projection** content (Pass-1 §3.1a / `Doc-5D R5`): **draft / unpublished / soft-deleted / retired entities never appear** in any public page, sitemap, or metadata. Public discoverability cannot surface a non-published or non-Public datum.

### §7.3 No buyer-private awareness
SEO/sitemap/metadata reflect only the `public` visibility scope; the surface has **no concept of buyer-private status** (Pass-1 §3.2; Invariant #11).

---

## §8 — Baseline *(inherited from Doc-7B §7)*

WCAG-AA a11y; i18n/localization-ready (locale set a product requirement); **currency-per-field, default BDT, never assumed** for catalog prices (`Doc-2 §0.4`); responsive — all inherited from the Doc-7B kit (`CHK-7-060/061/062/063`). The a11y/SEO/perf **tests** are Doc-8's.

---

## §9 — Conformance & Carried Items

### §9.1 Applicable `CHK-7-xxx` (PR9; conditional read/write)
| CHK | Status (Doc-7D) | Reason |
|---|---|---|
| `CHK-7-001/002/004` | **APPLIES** | the public **reads** — binding (§2), cursor pagination, error mapping (§6) |
| `CHK-7-003` | **N/A (read-only)** | Public surface is read-only (PR5); APPLIES only if a frozen anonymous write is added |
| `CHK-7-005` | **APPLIES** | composes embedded components (public trust badge binds `Doc-5G` Public read, else omit/ESC — Pass-1) |
| `CHK-7-011` | **APPLIES (CTA gating, UX)** | conversion CTAs (§5.3) |
| `CHK-7-020/021` | **APPLIES** | Content≠Presentation, microsite (§4) |
| `CHK-7-040/041/042` | **APPLIES** | Public projection / published-only / NOT_FOUND collapse (§3) |
| `CHK-7-060/061/062/063` | **APPLIES** | baseline (§8) |
| `CHK-7-070/071` | **APPLIES** | out-of-frontend (§6.1 — reads via shell client; no client authoritative state) |
| `CHK-7-080/081` | **APPLIES** | realize-never-redecide (§9.3) |
| `CHK-7-010/012` | **N/A** | anonymous — no active-org; Admin n/a |
| `CHK-7-030/031` | **N/A** | no lifecycle screen on the public surface |
| `CHK-7-050/051` | **N/A** | AI is User-read-only (`Doc-5K`); none anonymous |

### §9.2 Carried items & ESC register
| ID | Item | Resolution channel |
|---|---|---|
| **DR-7-SHELL** | consumes frozen Doc-7B kit + Doc-7C `(public)` shell | by reference |
| **DR-7-API** | views bind frozen Doc-5D Public reads | consistency cross-check; ESC on a gap |
| **`[ESC-7-API-PRODDETAIL]`** | no Public `get_product`; standalone anonymous product-detail page | additive Doc-5D Public-projection patch (Board); interim = search-only |
| **`[ESC-7-API-CATNAV]`** | no Public standalone category list (`list_categories` is User) | additive Doc-5D patch (Board); interim = `search_catalog` facets |
| **`[ESC-7-API-ADS]`** | anonymous ad display absent a Public ad read | confirm sponsored-in-`search_catalog`; else additive Doc-5D patch (Board) |
| `[ESC-7-DESIGN]` | a composed embedded component needs allocation | Doc-7B definer |

All ESC markers resolve **only** via an additive `Doc-5D` patch (human-approved) — never locally; the surface renders the **interim** (search-only) realization until then.

### §9.3 Coins nothing
Binds frozen Doc-5D Public reads by pointer; view/route names are presentation vocabulary (Appendix). No domain/API element introduced; every gap is an ESC marker (PR10).

---

## Appendix — View-Inventory Skeleton *(names = presentation vocabulary; bound reads frozen)*

| Public view | Bound frozen Public read(s) | Notes |
|---|---|---|
| Marketplace discovery / search | `search_catalog` (BC-MKT-6 §8) | cursor list; facets |
| Vendor directory | `list_vendor_directory` (BC-MKT-6 §8) | cursor list |
| Public vendor profile / microsite | `get_public_vendor_profile` (BC-MKT-6 §8) + **BC-MKT-4 published presentation projection** + vendor-scoped `search_catalog` | M2 content + vendor-branded presentation (§4) |
| Catalog / product items | via `search_catalog` results | no standalone anon product page (`[ESC-7-API-PRODDETAIL]`) |
| Category navigation | `search_catalog` facets | standalone list = `[ESC-7-API-CATNAV]` |
| Ads | sponsored placements within `search_catalog` (TBC) | else `[ESC-7-API-ADS]` |
| Shared embedded | public trust badge (`Doc-5G` Public read — confirm/omit) | composed from Doc-7B; non-disclosure-bound |

Exact pages, routes, and metadata realized with the implementation; Doc-7D fixes the **view inventory + bindings**, not the code.

---

## Pass-2 self-check (pre-review)

- **§9.1 vs PR9:** applicability matches the frozen structure PR9 (conditional 003; 011 CTA-scoped).
- **No anonymous mutation:** §5/§6.3 — read-only; any write is bind-or-ESC.
- **Published-only discoverability:** §7.2 — no draft/unpublished in any public render/sitemap (`Doc-5D R5`).
- **ESC register complete:** §9.2 — PRODDETAIL/CATNAV/ADS carried; resolved only via additive Doc-5D patch.
- **Coins nothing:** Appendix names are presentation vocabulary; bound reads are frozen.
- **Open for review:** confirm `CHK-7-070/071` (out-of-frontend) applicability wording for a read-only surface (no client cache authority); confirm the ESC register is the complete set (no fourth gap missed).

*End of Content Pass-2 (§5–§9 + Appendix) — DRAFT. Realizes `Doc-7D_Structure_v1.0_FROZEN` §5–§9 + Appendix. Nothing coined; gaps remain `[ESC-7-API-*]`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7D FROZEN.*
