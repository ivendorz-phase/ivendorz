# URL Naming & SEO Authority — Board Review Adjudication + Consolidated Cross-Reference

**v1.0 · 2026-07-06 · Adjudication record (CLAUDE.md §13) + pointer-only consolidation.**

> **✅ STATUS: FROZEN v1.0 — owner Board approval "FREEZE APPROVED", 2026-07-06 (chat = the
> human-Board channel, ESC-7G-SCORE-DISPLAY precedent).** Gate satisfied at 0 BLOCKER · 0 MAJOR ·
> 0 MINOR. Changes require an additive patch + version bump. This document remains **derived and
> pointer-only** — on any divergence from a pointed-to frozen source, that source wins and this
> file is patched additively.

> **Derived, non-authoritative.** This document adjudicates the owner-submitted Architecture Board
> review of the 2026-07-06 URL-naming assessment and consolidates the **already-ratified** canonical
> SEO ownership rules into one findable table. It **coins nothing** — every row points to its frozen
> or Board-approved source (reference-never-restate, §11). On any divergence, the pointed-to source
> wins and this file is patched.

**Review verdict received:** PASS WITH PATCH REQUIRED (0 BLOCKER · 1 MAJOR · 1 MINOR · 4 OBS).
**Post-adjudication tally: 0 BLOCKER · 0 MAJOR · 0 MINOR** (gate §13 satisfied) — see dispositions.

---

## 1. Finding dispositions (Validate-Findings gate, §13)

| Finding | Claim | Valid? | Applicable? | Disposition |
|---|---|---|---|---|
| **MAJOR-01** | Canonical SEO ownership (apex vs vendor subdomain) not defined | Valid concern; **rule already exists in the corpus** | Yes | **DOWNGRADED → OBS per the review's own condition** ("if this rule already exists … downgrade to OBS by adding a cross-reference"). The rule is ratified across **ADR-025** (Marketplace Public URL Law, APPROVED + FOLDED 2026-07-03), **ADR-024** (Canonical Vendor Subdomain URLs / CHR), **Doc-4D CanonicalHost Patch v1.0.2** (`seo.canonical` advisory), and the **MEGA_MENU §9.1** category ratification. Resolved by the consolidated cross-reference in §2 below — **no new architecture authored** (§8: architecture changes need their own human-Board channel; none is needed). |
| **MINOR-01** | Singular `/marketplace/product` · `/marketplace/category` risks being "fixed" by future contributors | Valid | Yes | **ACTIONED** — "Marketplace Family Exception" guard note added to §3 below **and** to the FE route registry view (`project-management/fe-navigation-screen-matrix.md` §6). Ratified shape not reopened. |
| **OBS-01** | API `snake_case` vs FE `kebab-case` split | Correct | — | **RECORDED, no action** — deliberate dual convention: Doc-5A §5.3 (wire tokens = owning-entity `snake_case`) vs web-standard kebab-case FE segments. |
| **OBS-02** | Locale strategy = future roadmap | Partially stale | — | **RECORDED + STRENGTHENED** — locale is not merely "roadmap": the URL space is already **reserved** — future locale URLs SHALL be path segments under the canonical host (ADR-024 Decision 10; Doc-7D §11.7; ADR-025 §10 — canonical/id-anchor is locale-invariant). No action now; the reservation prevents the URL-equity trap the OBS worried about. |
| **OBS-03** | Empty `app/(admin)` route group | Valid | Yes | **ACTIONED** — empty directory removed (working-tree cleanup; git tracked no content under it). Admin surface remains `app/(app)/admin`. |
| **OBS-04** | `/workspace` neutral prefix awaits Board | Valid | Yes | **RECORDED** — awaiting the `ESC-7G-A7` human-Board ruling; all built surfaces are A7-safe under the neutral prefix. No action here. |

**Note on the review's recommended patch text.** The suggested policy ("duplicated marketplace
content on vendor subdomains MUST use canonical tags or differ materially") is **weaker than what is
already ratified**: the v1 invariant is that **no vendor-host product-detail route exists at all**
(ADR-025 §3 — nothing to canonicalize), and the vendor-configured `seo.canonical` is **advisory,
never emitted** as the canonical link (Doc-4D v1.0.2, 4D-CH-01.2). The ratified regime is recorded
as-is; the weaker suggested wording is **not** adopted.

---

## 2. SEO Authority Matrix (pointer-only — every row cites its ratified source)

| Public resource | Canonical SEO owner | Ratified source |
|---|---|---|
| Product detail | **Apex** — `/marketplace/product/{name-slug}-{uuid}`; v1 invariant: **no vendor-host product-detail route exists** | ADR-025 §3/§8 (realizing ESC-7-API-PRODDETAIL I.4, Decisions #4–#5) |
| Vendor microsite "Products" page | **Vendor canonical host** (listing only); each item **links out** to the apex product detail | ESC-7-API-PRODDETAIL I.4; ADR-025 §3 |
| Category landing | **Apex** — `/marketplace/category/{slug}` | MEGA_MENU §9.1 ratification; pointed to (not re-declared) by ADR-025 §8 |
| Marketplace search / discovery / mega-menu | **Apex** (public shell); vendor hosts carry **only** the microsite route IA — no search surface | ADR-022 (frozen microsite IA); Doc-7C route topology |
| Vendor company identity (about, capabilities, certifications, contact, industries, projects, resources) | **Vendor canonical host via CHR** — active custom domain if bound, else `{slug}.ivendorz.com`; legacy `/vendors/{slug}/*` 301s to CHR output | ADR-024 Decisions 4–5 (CHR, Doc-2 v1.0.5 D2-04.3); ADR-022 route IA |
| Vendor project detail | **Vendor canonical host** (part of the microsite IA) | ADR-022; Doc-7D §10.1 |
| Vendor-configured `seo.canonical` | **Advisory only** — never emitted as the canonical link / `og:url`; CHR output always wins | Doc-4D CanonicalHost Patch v1.0.2 (4D-CH-01.2) |
| RFQs · quotations · engagements · workspace · account · admin | **Private — no public URL exists, nothing is indexed** (session-gated app surfaces; default-private tenancy) | Doc-7C §2–§3 (session & auth boundary); Master default-private tenant model *(derived consequence — no public URL is minted for these resources)* |
| Sitemaps / robots | **Apex sitemap-index → canonical vendor hosts**; each canonical host serves its own platform-generated sitemap + robots.txt (vendors never control robots); non-canonical hosts serve none; product URLs enter the **apex** sitemap | ADR-024 Decision 9; ESC-7-API-PRODDETAIL (sitemap row) |
| Duplicate-content guard (platform-wide) | **One resource = one canonical URL**; legacy/migrated URLs → permanent **301**; unknown/unpublished → byte-identical 404 (never 410); **builder-only emission** — no string-concatenated public URL anywhere | ADR-025 §4/§5/§7; ADR-024 §6 (Vendor URL Builder rule) |

**Decision hierarchy (per ADR-025):** Vendor URL law → ADR-024 · marketplace public-URL
*principles* → ADR-025 · each future resource-specific URL *shape* → its own additive Board
decision composing with ADR-025 (never amending it).

---

## 3. Marketplace Family Exception (MINOR-01 guard note)

```text
Marketplace Family Exception

/marketplace/product/{name-slug}-{uuid}
/marketplace/category/{slug}

are INTENTIONALLY SINGULAR — ratified route families
(ADR-025 §8 · MEGA_MENU §9.1).

Do NOT "fix" them to /products or /categories.
A change requires a Board channel, not a refactor.
```

The plural convention (`/vendors`, `/rfqs`, `/quotations`, `/purchase-orders`, …) governs
everywhere else; the marketplace family's singular type-selector is the one deliberate exception.

---

*End of adjudication — post-gate tally 0/0/0; MAJOR-01 discharged by cross-reference (the
reviewer's own downgrade condition), MINOR-01 by the guard note, OBS-03 by cleanup; OBS-01/02/04
recorded. No frozen document touched; nothing coined.*
