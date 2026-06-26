# Doc-7D — Public Surface — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7D** — the Public Surface (first surface document) |
| Program | **Doc-7 — Frontend Realization** |
| Realizes | the frozen **Doc-5D Public-projection** read surface + **Doc-5G public-badge/review** reads, on the Doc-7C `(public)` route group, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7A` · `Doc-7B` · `Doc-7C` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (PR9, conditional) |
| Coins | **Nothing** — binds frozen Public reads by pointer; three `[ESC-7-API-*]` carried (additive Doc-5D channel) |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7D_Structure_v1.0_FROZEN` (= Proposal v0.1 + Patch v0.1.1) |
| Content §0–§4 | `Doc-7D_Content_v1.0_Pass1` + `Doc-7D_Content_Pass1_Patch_v1.0.1` |
| Content §5–§9 + Appendix | `Doc-7D_Content_v1.0_Pass2` + `Doc-7D_Content_Pass2_Patch_v1.0.1` |
| Freeze gates | `Doc-7D_Structure_Freeze_Audit_v1.0` · `Doc-7D_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7D_Structure_Independent_Hard_Review_v0.1` · `Doc-7D_Content_Pass{1,2}_Independent_Hard_Review_v1.0` |

---

## What Doc-7D fixes (summary — authoritative text is the effective set)

**Scope (PR1):** the **anonymous** Public surface — Public projection only, no active-org, no anonymous mutation; mounts in the Doc-7C `(public)` group; consumes the 7B kit + 7C server-side wired client by reference.

**View inventory (PR2, bind-or-ESC, verified):**
- **BOUND (direct Public reads):** marketplace search (`search_catalog`), vendor directory (`list_vendor_directory`), public vendor profile / **microsite** (`get_public_vendor_profile` + **BC-MKT-4 published presentation projection** — `Doc-5D R5` draft/published split), **public trust badge** (`get_trust_score`/`get_performance_score`/`get_verified_tier` — Doc-5G public badge), **public published reviews** (`get_review`/`list_reviews` — BC-TRUST-5).
- **BOUND via `search_catalog`:** catalog/product items, category facets, (sponsored ads — TBC).
- **`[ESC-7-API]` (genuine gaps; additive Doc-5D channel, Board):** `PRODDETAIL` (standalone anon product page — `get_product` is User), `CATNAV` (standalone public category list — `list_categories` is User), `ADS` (standalone public ad read if not surfaced as sponsored placement in search).

**Non-disclosure (PR3 + Doc-5D R5 + Doc-5G R10 + Invariant #11):** Public projection only; **published-only** (draft/unpublished/soft-deleted/retired excluded); **no concept of buyer-private status** (a blacklisted vendor still appears publicly); verification case detail / fraud / admin ratings **never public**; protected reads collapse to `NOT_FOUND`.

**Content ≠ Presentation (PR4):** the microsite renders **M2 content** with **vendor-branded presentation** (Doc-7B theme override); the **draft/published projection split is the wire realization of Invariant #9**; manage = Vendor workspace (7G), render = Public (7D).

**CTAs (PR5):** no anonymous mutation; conversion CTAs route to the `(auth)` group → Doc-7E; CTA gating = UX. Any anonymous write = bind-or-ESC (none bound).

**Data (PR6):** reads via the Doc-7C server-side wired client (no browser-direct call); cursor pagination + POLICY page_size; media as `file_ref` (no blob). **Render (PR7):** SSR/SSG, indexable, **published+Public content only** in pages/sitemap/metadata. **Baseline (PR8):** WCAG-AA, i18n-ready, currency-per-field default BDT, responsive (from Doc-7B).

**Conformance (PR9):** APPLIES `CHK-7-001/002/004/005/011(CTA)/020/021/040/041/042/060–063/070/071/080/081`; **N/A** `CHK-7-003(read-only)/010/012/030/031/050/051`.

---

## Carried into Doc-7E…7H

`DR-7-SHELL` · `DR-7-API` · `DR-7-STATE` · **`[ESC-7-API-PRODDETAIL/CATNAV/ADS]`** (Doc-7D-specific; additive Doc-5D patch, Board) · `[ESC-7-API]` (incl. the Doc-7C file-upload grant) · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]`. Resolved only via named channels.

**Next deliverable:** **Doc-7E — Account & Identity Shell** — auth-entry screens (login/signup/recovery) + membership/role/delegation management + account/subscription/invoice views (realizes `Doc-5C` management screens + `Doc-5I` account-facing), through the Board loop.

*End of Doc-7D SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7D realizes the anonymous Public surface over the frozen Doc-5D/5G Public reads; Public projection only; coins nothing; three `[ESC-7-API-*]` carried.*
