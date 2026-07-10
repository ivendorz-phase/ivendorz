# ADR-024: Canonical Vendor Subdomain URLs — the Platform-issued Vendor Subdomain, Vendor Slug Law, and Canonical Host Resolution

> **✅ APPROVED (owner — human Architecture Board, 2026-07-03; Final Architecture Board Resolution: review
> cycle CLOSED; artifact text gate-confirmed same day).** This is the individual-ADR corpus copy, carried
> alongside `ADR_Compendium_v1.md` per the ADR-021 precedent — the Compendium itself is untouched (rank 1;
> Compendium-v2 consolidation deferred, human re-freeze). Ruling record:
> `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`.
> Origin/provenance: `governanceReviews/ADR-024_Canonical_Vendor_Subdomain_URLs_PROPOSAL.md`.

**Status:** **APPROVED (2026-07-03).** A new ADR is a **new decision**; per CLAUDE.md §7 the ADR Compendium
is **rank 1, immutable to skills** — this ADR is **NOT** folded into `generatedDocs/ADR_Compendium_v1.md`
by any AI action; it is carried alongside as the individual ADR legal record.

| Field | Value |
|---|---|
| Proposed number | **ADR-024** (next free; ADR-019 reserved/do-not-backfill; ADR-021 last folded; ADR-022/023 raised, folds pending) |
| Date | 2026-07-03 |
| Raised by | **Owner directive (chat = the human-Board channel, ESC-7G-SCORE-DISPLAY precedent)**: "Every vendor microsite shall have a unique canonical URL in the format `https://{vendor-slug}.ivendorz.com/`" — refined through a 4-round CTO review (4 MAJOR / 8 MINOR / NITs / 1 recommendation, all adjudicated per §13) and closed by the **Final Architecture Board Resolution 2026-07-03: APPROVED**. |
| Realized by | **Doc-2 Patch v1.0.5** (PATCH-D2-04: Vendor Slug law + CHR + `vendor_slug_history` + §9 action) · **Doc-4D CanonicalHost Patch v1.0.2** (wire semantics) · **Doc-6D VendorSlugSubdomain Patch v1.0.1** (DDL) · **Doc-3 Policy Key Registration Patch v1.10** (`marketplace.reserved_subdomain_labels`) · **Doc-7D §11** (Host Canonicalization) · FE WBS **FE-PUB-10** (presentation realization, registered) |
| Relationship to existing ADRs | **Composes with ADR-022** (the seven-route path IA is unchanged; this ADR changes only the canonical HOST — `https://{slug}.ivendorz.com/{page}` ≡ `/vendors/{slug}/{page}`). **Interprets Master §8.4 item 7** (the `vendor.ivendorz.com` example under entitled Custom Domain Support) — see Decision (1). **Supersedes nothing.** Consistent with Invariants 8 (never-reuse), 9 (Content ≠ Presentation), 11 (byte-equivalent 404); Invariant 6 untouched. |
| Authority | CLAUDE.md §7 (authority order), §8 (architecture-affecting → human approval), §11 (Flag-and-Halt / reference-never-restate), §13 (Raise ≠ Accept; Validate-Findings gate). |

---

## Context

1. **The corpus already holds the Vendor Slug but no URL law.** `marketplace.vendor_profiles.slug` is
   frozen live-unique (Doc-2 §10.3 :731; Doc-6D Pass-1 :84), yet the corpus is **silent** on slug format,
   reserved labels, immutability, canonical-URL primacy, redirects, and microsite route hosts. No ADR
   covers URLs, slugs, or domains.

2. **Subdomains appear once, ambiguously.** Master §8.4 item 7 (:574) lists `vendor.ivendorz.com` as an
   *example* under **entitlement-gated Custom Domain Support** — it neither grants every vendor a platform
   subdomain nor forbids one.

3. **The shipped canonical scheme is path-based.** ADR-022 froze the seven-route IA under
   `/vendors/[slug]`; no canonical tags, no host routing, no central URL builder exist yet (~15 files emit
   `/vendors/…` links directly).

4. **Why decide now.** Every approved vendor needs one permanent, indexable, SEO-strong public identity —
   a branded microsite URL under the platform domain — and the platform needs one deterministic rule for
   which host is canonical before more surfaces emit vendor links.

Because the corpus is silent, this is an **additive authoring** decision — not an override of any frozen
clause. Where it touches frozen documents (Doc-2/Doc-4D/Doc-6D/Doc-3/Doc-7D), it rides carried-alongside
additive patches with human approval (§7/§8).

## Decision

1. **The Platform-issued Vendor Subdomain (universal).** Every APPROVED vendor receives one permanent
   **Platform-issued Vendor Subdomain** `https://{vendor-slug}.ivendorz.com/` — universal, free, **never
   entitlement-gated**. *Interpretation of Master §8.4 item 7 (recorded here; no Master patch):* the
   platform-issued subdomain is **not** a "custom domain" — the frozen example list under Custom Domain
   Support is not an entitlement-exclusivity clause; `marketplace.custom_domains` (DD-5, entitled) remains
   the machinery for **external** domains only, and `create_custom_domain` rejects `*.ivendorz.com`
   (Doc-4D v1.0.2).

2. **The Vendor Slug law (FIXED; defined once in Doc-2 v1.0.5 D2-04.2).** Globally unique (already
   frozen); lowercase DNS label `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`; 3–40 chars; **ASCII-only** (IDN/
   Unicode/emoji rejected; `xn--` punycode prefix rejected explicitly); reserved labels blocked at
   issuance/migration per POLICY key `marketplace.reserved_subdomain_labels` (Doc-3 v1.10) — reserved
   labels are **platform-owned namespaces, never issuable to vendors**; list changes are never retroactive.

3. **Immutability + admin-mediated migration + never-reuse.** The Vendor Slug is vendor-immutable after
   activation. Only an **M8 admin-mediated migration** may change it — automatic **permanent 301** from
   the old subdomain, old slug **never reused** (Invariant 8), recorded in append-only
   `vendor_slug_history`. Migration changes **URL identity only**: analytics, bookmarks, backlinks, and
   search rankings MAY change; **Vendor identity (`id`/`human_ref`) NEVER changes** — analytics/attribution
   key to vendor identity, never to host. The migration wire contract is not coined →
   `[ESC-MKT-SUBDOMAIN-MIGRATE]`.

4. **Canonical Host Resolution (CHR).** The normative algorithm (Doc-2 v1.0.5 D2-04.3 — defined once,
   referenced everywhere): no canonical host exists for a non-publicly-routable vendor (∅); an `active`
   bound custom domain is canonical while active (subdomain 301s to it; reverts on release); otherwise the
   Platform-issued Vendor Subdomain. **Fail-closed** — a hostname is never synthesized on partial failure.
   Legacy/alternate URLs (including `/vendors/[slug]/*`) 301 to the CHR output. `seo.canonical` is
   advisory; emitted canonical link + `og:url` = CHR output.

5. **The CHR Invariant (ADR-scoped, SHALL).** Every public vendor resource SHALL resolve to exactly one
   canonical host, computed **only** via CHR. **No subsystem** — FE, SEO metadata, middleware, sitemap
   generation, redirects, future backend — may independently determine canonical URLs. *(Constitutional
   promotion to Core Invariant 13 — Invariant 12 being taken — was offered as gate sub-decision (vi); the
   owner elected **ADR-scoped** at the gate, 2026-07-03 — no Master/CLAUDE.md patch; this ADR binds the
   invariant at rank 1.)*

6. **The Vendor URL Builder rule (enforcement corollary of 5).** Every frontend, backend, email template,
   notification, sitemap, SEO-metadata emitter, structured-data (JSON-LD) emitter, API projection, and
   future service MUST obtain vendor URLs **only through the canonical URL builder**; **direct string
   concatenation of `{slug}.ivendorz.com` is prohibited.**

7. **Host Resolution Matrix + byte-equivalence.** Existing frozen states only: publicly-routable → 200 on
   the canonical host; migrated old slug → permanent 301; unknown/pending-claim/rejected/suspended/
   soft-deleted/unpublished → **404 byte-identical to absence** (Invariant #11 / CHK-7-040 extended to
   hosts); reserved labels are platform-owned hosts, never vendor microsites. (Doc-7D §11.3.)

8. **Sessions & cookies.** Platform-issued Vendor Subdomains are **anonymous, session-free public
   surfaces**; platform auth cookies are host-scoped to the app host — **never `Domain=.ivendorz.com`**;
   authenticated flows redirect to the apex. (Doc-7D §11.6; Security-Architect lane flagged in the packet.)

9. **Discovery files.** Apex sitemap-index → canonical vendor hosts; each canonical host serves its own
   platform-generated sitemap + robots.txt; vendors do not control robots.txt; non-canonical hosts serve
   neither. hreflang is placed here when locales exist. (Doc-7D §11.5.)

10. **Locale-safety reservation.** Future locale URLs SHALL be path segments under the canonical host
    (`{host}/en/`, `{host}/bn/`); nested locale subdomains are prohibited (also outside single-level
    wildcard TLS coverage). Reservation only.

11. **Precedence note.** Whenever this package conflicts with implementation assumptions, **the CHR
    algorithm defined in the Doc-2 patch is authoritative.**

## What this decision is NOT

- **Not an entitlement change.** DD-5 custom-domain gating, `can_use_custom_domain`, and the
  `pending → verified → active → released` lifecycle are unchanged; the universal subdomain sits beside
  them, not inside them.
- **Not a matching/eligibility input.** CHR output is presentation identity (Invariant 9); no governance
  signal reads or writes it (Invariant 6 untouched).
- **Not a route-IA change.** ADR-022's seven pages stand; the host maps 1:1. Closed milestones (FE-PUB-03
  microsite et al.) are **not reopened** (Invariant 8 discipline; Trust-Score-ruling precedent) —
  realization is the fresh milestone FE-PUB-10.
- **Not a contract coinage.** No new wire contract, field, projection, event, or error code; the M8
  slug-migration contract is explicitly deferred (`[ESC-MKT-SUBDOMAIN-MIGRATE]`); the S13 custom-domain
  slugs stay bound by pointer (`[ESC-7G-SLUG-MKT]`'s channel, untouched).
- **Not an org/category/permission-slug rule.** Those identifier spaces (incl. `identity.organizations.slug`
  and its §5.1 restore-conflict regeneration) are untouched.

## Consequences

- **Five-artifact linked realization set** (Doc-2 v1.0.5 · Doc-4D v1.0.2 · Doc-6D v1.0.1 · Doc-3 v1.10 ·
  Doc-7D §11) folded together; registered in `00_AUTHORITY_MAP.md`; escalations `ESC-MKT-CANONICAL-URL`
  (resolved by this decision) + `ESC-MKT-SUBDOMAIN-MIGRATE` (opened) recorded in `esc_registry.md`.
- **FE-PUB-10** (Board-minted 2026-07-03) realizes the presentation side: middleware host-routing, the
  canonical URL builder (repointing ~15 direct `/vendors/` emitters), CHR-derived canonical/`og:url`
  metadata, path→canonical-host 301s, Host-Resolution-Matrix 404s, host-scoped robots/sitemap stubs.
  **Acceptance criterion: pixel output of all existing pages remains identical** — only URL generation,
  routing, metadata, redirects, and discovery artifacts may change.
- **URL identity ≠ Vendor identity** becomes a documented platform distinction (Doc-2 v1.0.5 terminology).
- **DNS independence:** governance defines URL identity only — DNS/CDN/provider choice, wildcard DNS/TLS
  (`*.ivendorz.com`), and cert provisioning are **implementation/deployment constraints outside the
  corpus**. Platform manages TLS for platform hosts and provisions custom-domain certs on entitlement
  activation. Platform owns search-engine verification for `*.ivendorz.com`; custom-domain verification
  rides the existing `custom_domains` verification lifecycle (vendor DNS).
- **Back-compat:** existing `/vendors/[slug]` links keep working (301 to canonical once FE-PUB-10 lands);
  nothing breaks in the interim — path URLs simply remain the served scheme until then.

## Firewall / invariant check (no governance signal touched)

This ADR adds **no** permission slug, **no** module/ownership change, **no** contract, **no** event, **no**
state machine, and weakens **no** RLS; it registers exactly **one** POLICY key (Doc-3 v1.10, list-valued,
platform-namespace only). It touches **none** of the five firewalled governance signals. **Invariant 8** is
strengthened (slug never-reuse + permanent history); **Invariant 9** honoured (hosts are presentation; CHR
never feeds matching); **Invariant 11** extended in realization (byte-equivalent 404 per host). The R7
firewall is preserved — the subdomain is free and universal, so no payment/plan signal can couple to it.

---

**Principle:** *One vendor, one permanent platform-issued home on the web. The slug is law, the canonical
host is computed in exactly one place, and nothing about a vendor's URL ever leaks what the platform knows.*

*ADR-024 (APPROVED 2026-07-03) — composes with ADR-022, interprets Master §8.4 item 7, supersedes nothing.
Realized by the five-artifact linked patch set + FE-PUB-10. Individual-ADR corpus copy carried alongside
(ADR-021 precedent); Compendium-v2 consolidation deferred (human re-freeze).*
