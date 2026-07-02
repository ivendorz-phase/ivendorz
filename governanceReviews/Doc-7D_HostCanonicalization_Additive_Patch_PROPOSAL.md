# Doc-7D Additive Patch — Host Canonicalization (Platform-issued Vendor Subdomains)

> **✅ APPROVED (owner — human Architecture Board, 2026-07-03; artifact text gate-confirmed same day)**
> alongside ADR-024. The append of **§11** to Doc-7D and the **v1.1 → v1.2** bump are a **human records
> action** — no AI edits the frozen Doc-7 series in place (CLAUDE.md §11). FE realization (**FE-PUB-10**)
> proceeds against this ratified section.

**Status:** **APPROVED (2026-07-03).** Doc-7D is part of the frozen Doc-7 series
(`Doc-7D_SERIES_FROZEN_v1.0`). Per CLAUDE.md §11, **a frozen document is never edited in place**; this is
an **additive** patch that **adds one new section (§11)** and **alters no existing clause** — the same
standing as the approved §10 patch (`Doc-7D_MultiPage_IA_Additive_Patch_PROPOSAL.md`, ADR-022), whose
corpus fold likewise remains a pending records action. This file lives in `governanceReviews/` with its
approval banner; no generatedDocs copy is made for Doc-7 additive sections (the §10-patch precedent).

| Field | Value |
|---|---|
| Target document | **Doc-7D — Public Surface** (`Doc-7D_Content_v1.0` series, FROZEN v1.0; + approved §10 additive patch = v1.1, fold pending) |
| Proposed version | **Doc-7D v1.1 → v1.2** (additive new section; **no existing clause changed**) |
| Realizes | **ADR-024** — *Canonical Vendor Subdomain URLs* (the decision) + Doc-2 v1.0.5 D2-04.3 **CHR** (the algorithm — referenced, never restated) at the public-surface layer |
| Change type | **Additive** — authors the host-level canonicalization rules for the seven-route IA that §10 authored. §10 bound the microsite to `/vendors/[slug]` paths; this section binds the same IA to its canonical HOST. |
| Coins | **Nothing** — no new contract, no route-as-API, no field, no projection, no POLICY key (the reserved-label key is Doc-3 v1.10's registration), no new page (the 144-page inventory is unchanged; hosts project EXISTING pages) |
| Authority | CLAUDE.md §7, §8, §11 (reference-never-restate; additive-patch-only), §13; Doc-2 v1.0.5 (CHR + Vendor Slug law); Doc-4D CanonicalHost patch v1.0.2 (wire semantics); decision record `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md` |

---

## Rationale (why this is additive, not an override)

Doc-7D §1–§4 mandate public metadata/SEO for microsites and bind the Public reads; §10 (ADR-022) authored
the seven-route path IA. **No frozen clause authors the canonical HOST** — the corpus is silent on URL
primacy, redirects, and subdomain serving (the only corpus mention of subdomains is the Master §8.4 item 7
example, interpreted by ADR-024). Authoring host canonicalization therefore **adds** where the corpus was
silent; it changes no §4/§10 clause, no Public read, and no content model. The seven-route IA is unchanged —
the host maps onto it 1:1.

## Proposed new section (to append to Doc-7D)

> ### §11 — Host Canonicalization *(realizes ADR-024; composes with §10)*
>
> §10 authors the seven-route path IA; this section authors its **host-level canonicalization**. It is
> presentation routing over the same §4.1 Public reads; it coins no contract, field, projection, page, or
> route-as-API, and changes no §4/§10 clause.
>
> **§11.1 Host ≡ path equivalence.** Every approved vendor's microsite is served on its **Platform-issued
> Vendor Subdomain**: `https://{vendor-slug}.ivendorz.com/{page}` ≡ `/vendors/{slug}/{page}` over the
> **same seven-route IA (§10.1)** — one implementation, host-based rewrite; pages are never re-authored per
> host. The two §10.6 legacy stubs (`/capabilities`, `/certifications`) redirect identically on both hosts.
>
> **§11.2 Canonical host.** The canonical host for every vendor microsite page is the **CHR output**
> (Doc-2 v1.0.5 D2-04.3 — referenced, never restated): the Platform-issued Vendor Subdomain by default; an
> `active` bound custom domain while it stays active; reverting on release. Legacy/alternate URLs —
> including the `/vendors/{slug}/*` path routes — **301 to the CHR output**. Retired slugs 301 permanently
> via `vendor_slug_history` (Doc-2 v1.0.5 D2-04.4/D2-04.5). CHR is **fail-closed**: when it cannot be
> computed, the request 404s (or configuration-errors) — a hostname is never synthesized.
>
> **§11.3 Host Resolution Matrix** (binds the EXISTING frozen states — §10.4's per-page read + Doc-2
> §5.3/§10.3 postures; coins no new state):
>
> | Vendor/slug state (existing) | Host behavior |
> |---|---|
> | Publicly routable (approved + published) | **200** on the canonical host (CHR output) |
> | Publicly routable, requested on a non-canonical host (subdomain while custom domain active; legacy path; retired slug) | **Permanent 301** to the CHR output |
> | Unknown slug · pending claim · rejected · suspended · soft-deleted · unpublished | **404 byte-identical** to genuine absence (Invariant #11 / CHK-7-040 extended to hosts; same copy/layout/timing as §10.4's path-level 404) |
> | Reserved label (POLICY key `marketplace.reserved_subdomain_labels`, Doc-3 v1.10) | Platform-owned host — **never a vendor microsite**; never enumerable as one |
>
> **§11.4 SEO / metadata.** Each route's emitted canonical link and `og:url` equal the **CHR output** for
> that page (§10.5's per-route metadata, now host-aware). The vendor-configurable `seo.canonical` field is
> **advisory** (Doc-4D CanonicalHost patch v1.0.2) — a cross-host value is never emitted as the canonical
> link. Structured data (JSON-LD), when emitted, carries CHR-derived URLs only.
>
> **§11.5 Discovery files.** The apex (`ivendorz.com`) serves a **sitemap index** referencing each
> canonical vendor host's sitemap. Each canonical vendor host serves its **own platform-generated sitemap**
> (its seven §10.1 routes) and **platform-generated robots.txt** pointing at that host's sitemap — vendors
> do not control robots.txt. Non-canonical hosts serve neither (they 301 per §11.3). **hreflang** belongs
> here when locales exist: emitted per canonical host under the locale-path scheme (§11.7); none are
> emitted today (locales reserved only).
>
> **§11.6 Sessions & cookies.** Platform-issued Vendor Subdomains are **anonymous, session-free public
> surfaces** (the §0.2/§10.6 anonymous posture, restated as a host rule): platform auth cookies are
> **host-scoped to the app host — never `Domain=.ivendorz.com`**; no session, auth, or tracking cookie is
> set or read on vendor hosts; authenticated intents route to the apex `(auth)`/app host (§10.6 / Doc-7A
> §4.3).
>
> **§11.7 Locale-safety reservation.** If/when locale support is introduced, locale URLs SHALL be **path
> segments under the canonical host** (`{host}/en/…`, `{host}/bn/…`) — nested locale subdomains
> (`bn.{slug}.ivendorz.com`) are **prohibited** (and sit outside single-level wildcard TLS coverage).
> Reservation only — this section coins no locale route or page.
>
> **§11.8 Single source of truth.** Vendor URLs are obtained **only through the canonical URL builder**
> (the CHR realization — ADR-024's Vendor URL Builder rule); direct string concatenation of
> `{slug}.ivendorz.com` is prohibited in every emitter (components, metadata, JSON-LD, sitemaps,
> notifications, future services). Renderers never serve a stale canonical host after a CHR transition —
> affected caches (canonical-URL, sitemap, metadata, redirect, URL-builder) are invalidated per Doc-4D
> CanonicalHost patch v1.0.2.
>
> **§11.9 Presentation-only boundary.** This section authors **host routing and canonicalization**, not
> behaviour: no wiring, no new Public read, no mutation. Wildcard DNS/TLS and cert provisioning are
> **deployment constraints outside the corpus** (platform-managed for platform hosts; custom-domain certs
> provisioned on entitlement activation — ADR-024 Consequences).

## Conformance / what is untouched

- **§4.1/§4.2/§4.3 and §10.1–§10.6 unchanged** — same Public reads, same Content ≠ Presentation rule, same
  seven-route IA, same per-page 404 parity. §11 adds the host dimension only.
- **Doc-2 §3.3 `microsites` unchanged** — content model intact; M2 still owns content.
- **144-page inventory unchanged** — hosts project existing pages; no page coined.
- **No coin** — 0 new module / contract / route-as-API / field / projection / POLICY key / page. The
  `[ESC-7-API-*]` interims are carried forward unchanged. The slug-migration contract stays
  `[ESC-MKT-SUBDOMAIN-MIGRATE]` (absent, recorded).
- **Invariants** — #8 (never-reuse; permanent 301s), #9 (Content ≠ Presentation — hosts are presentation),
  #11 (byte-equivalent 404 per host) preserved; #6 untouched (CHR is never a signal input).

---

*Doc-7D additive patch (PROPOSED) — realizes ADR-024; adds §11 (Host Canonicalization: host≡path
equivalence · CHR by reference · Host Resolution Matrix · SEO/discovery files · cookie posture ·
locale-path reservation · URL-builder single source of truth); alters no existing clause; coins nothing.
Same governanceReviews standing as the approved §10 patch; fold = records action.*
