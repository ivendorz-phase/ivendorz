# ADR-025: Marketplace Public URL Law — Canonical Addressing for Public Marketplace Resources (Product leg ratified; framework extensible to future public resources)

> **DRAFT — pending human owner approval.** This is a PROPOSAL, staged in `governanceReviews/`
> pending ratification — no dedicated `BOARD-PACKET-*` ruling exists yet for this ADR's exact text
> (unlike ADR-024, which had `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`
> before drafting). Realizes instrument **E-3** of the `ESC-7-API-PRODDETAIL` Board Resolution
> (`R-ESC7-PRODDETAIL-FREEZE`, Annex E Decisions #4–#5). Until approved and promoted into
> `generatedDocs/`, this document carries no corpus authority — it is not yet rank 0/1 per
> CLAUDE.md §7. Origin/provenance: this file itself (born as a proposal; no separate propose-then-
> fold step).

| Field | Value |
|---|---|
| Proposed number | **ADR-025** (next free; ADR Compendium scope stops at ADR-020; ADR-021/ADR-024 carried alongside; ADR-022/023 raised, folds pending; ADR-019 reserved/do-not-backfill) |
| Date | 2026-07-03 |
| Raised by | Owner directive, realizing `ESC-7-API-PRODDETAIL` Board Resolution `R-ESC7-PRODDETAIL-FREEZE`, Annex E Decision #4 (canonical URL: apex + id-anchored derived slug + no-vendor-host-detail invariant) and Decision #5 (slug sub-shape `{name-slug}-{uuid}`, runner-up recorded) |
| Realized by | `governanceReviews/Doc-4D_PublicProductDetail_Patch_v1.0.3_PROPOSAL.md` (`canonical_url` field, Class K) + `governanceReviews/Doc-5D_PublicProductDetail_Patch_v1.0.1_PROPOSAL.md` (wire shape) — both already reference this ADR by pointer (`E-3/ADR-025`). Doc-7 leg (FE canonical-URL builder realization) is a separate future milestone, explicitly deferred here — same deferral pattern ADR-024 used for FE-PUB-10. |
| Relationship to existing ADRs | Generalizes the reusable *framework* alongside **ADR-024** — composes with, never supersedes it (the Vendor leg stays entirely ADR-024's, referenced by pointer); composes with **ADR-022** (frozen seven-route IA) |
| Authority | CLAUDE.md §7 (authority order), §8 (architecture-affecting artifacts → human approval), §11 (Flag-and-Halt / reference-never-restate), §13 (Raise ≠ Accept; Validate-Findings gate) |

---

## Context

`marketplace.get_public_product_detail.v1` (instrument E-1, `Doc-4D_PublicProductDetail_Patch_v1.0.3_PROPOSAL.md`
and `Doc-5D_PublicProductDetail_Patch_v1.0.1_PROPOSAL.md`) already declares a `canonical_url`
field — opaque, computed-at-read, never stored — and both proposals point at **this ADR by name,
before it exists**: *"emitted only by the canonical URL builder (E-3/ADR-025 — referenced by
pointer, never restated here)"*. Until this ADR exists, that pointer resolves to nothing, and E-1
cannot reach contract freeze (Doc-4A §18.2-class gate). This ADR is that hard dependency.

The `ESC-7-API-PRODDETAIL` resolution's Annex E Patch Manifest scoped this instrument narrowly:
*"E-3 — ADR-025-class record + Doc-7 leg — Canonical product URL law (I.4) — apex, id anchor,
derived slug, no-vendor-host-detail invariant"*. Decision #4 and Decision #5 ratified the concrete
**Product** shape only.

**Scope-framing.** This ADR's title and structure are deliberately broadened beyond that literal
Product-only scope, per owner instruction, into a reusable **Marketplace Public URL Law** — so the
same document doesn't need reopening every time a new public resource type is added (vendors,
products, projects, ...). This framing is kept honest by separating what is actually new-ratified
content from what is general, reusable principle:

- **Newly-ratified concrete content** = the **Product** leg only (I.4 / Decisions #4 &amp; #5).
- **Vendor** leg is **already fully governed by ADR-024** — referenced by pointer, never
  restated, never reopened here.
- **Other future resource types** (projects, industries, documents, ...) receive the *general
  principles* below (stability, opacity, one-URL-per-resource, builder-only emission, future-safe
  extension) as a **framework**, not invented per-resource specifics. Their concrete shape arrives
  via its own future additive Board decision.

**Decision hierarchy:**
- Vendor URL law → **ADR-024** (unchanged, referenced only)
- Marketplace Public URL *principles* (this document) → **ADR-025**
- Resource-specific URL *shapes* (Product today; any future resource type) → **individual Board
  decisions**, each composing with ADR-025's principles rather than amending them. **Future
  resource-specific URL decisions SHALL conform to the principles of this ADR unless explicitly
  superseded by a later Board decision** — formalizing the relationship without expanding this
  ADR's own scope.

---

## Decision

1. **Stable URLs.** Public URLs are permanent — no semantic versioning, no transient IDs, once
   published. (General principle; realized concretely today only by the Product id-anchor rule,
   §3 below.)

2. **Opaque IDs.** Public URLs route on immutable identifiers, never mutable business names.
   Product: the UUIDv7 tail is the sole resolution key (I.4); the `{name-slug}` segment is
   presentation-only, derived at render from `products.name`, never persisted, never
   authoritative. **The presentation slug is advisory only and is never used as the authoritative
   lookup key.**

3. **Canonical URLs.** Reference **ADR-024's Canonical Host Resolution (CHR)** (Doc-2 v1.0.5
   D2-04.3) for Vendor hosts — **never redefine CHR here**. For Product, the canonical host is
   the **apex marketplace host** (not a vendor microsite host) —
   `/marketplace/product/{name-slug}-{uuid}` (I.4, Decision #4) — a deliberate v1 invariant that
   **no vendor-host product-detail route exists at all** (Decision #4's no-vendor-host-detail
   invariant).

4. **One Resource = One URL.** Exactly one canonical URL per resource instance. Product: the apex
   route above. Vendor: ADR-024's CHR output. Future resource types get this same rule once they
   are given a public URL — not decided here.

5. **Legacy Redirect Rule.** Any URL migration → permanent **301** to the current canonical.
   Product: a stale, absent, or wrong slug segment → 301 to the current canonical (I.4); an
   unknown/draft/unpublished/soft-deleted/banned-vendor product → byte-identical 404, never 410
   (R9 non-disclosure).

6. **Public URLs never expose** tenant IDs, internal IDs, permission IDs, workflow IDs, or
   database keys. This matches the existing `canonical_url` opaque-field contract already locked
   in Doc-4D v1.0.3 / Doc-5D v1.0.1: clients MUST NOT derive, modify, or reconstruct it.

7. **Builder Rule.** Generalizes **ADR-024 §6** (the Vendor URL Builder rule — no direct string
   concatenation) to all public-resource URL emitters: FE, backend, email templates,
   notifications, sitemap generators, SEO/structured-data emitters, and API projections. **Every
   public URL SHALL be obtained through the authoritative URL Builder interface defined for that
   resource type. Implementations may exist in multiple layers (backend service, frontend helper,
   sitemap generator, email renderer) provided they produce identical canonical output** —
   preserving single-source-of-truth without implying a single code artifact. **The authoritative
   Builder interface defines the canonical output contract, independent of implementation language
   or runtime** — the contract, not any particular implementation, is authoritative. Referenced
   from ADR-024, not restated.

8. **Route Grammar** (grammar only, no routing implementation) — canonical grammar and legacy
   paths are explicitly separated so neither is mistaken for the other:
   - **Canonical grammar:** Product → `/marketplace/product/{name-slug}-{uuid}` (I.4); Vendor →
     ADR-024's CHR output. Other route families point to their own already-ratified source (e.g.
     `/marketplace/category/{slug}` per the MEGA_MENU ratification) rather than being re-declared
     here.
   - **Legacy routes:** e.g. `/vendors/{slug}` — if retained, MUST redirect (rule #5) to the
     canonical URL. A legacy route is never itself a second canonical.

9. **URL Independence.** A canonical URL is a **public compatibility contract** and SHALL NOT
   derive its authority from any implementation layer — not the database, not the frontend route,
   not the API shape.

10. **Future-safe.** Locale, pagination, filters, tracking params, and campaign params may be
    added without changing the canonical URL. Product: the reserved locale-path scheme (Doc-7D
    §11.7, referenced not restated) — the canonical/id-anchor is locale-invariant.

---

## What this decision is NOT

- **Not a redefinition of ADR-024 / CHR.** The Vendor leg is untouched — referenced only.
- **Not a Vendor Slug law change.** Doc-2 v1.0.5 D2-04.2 (format/length/ASCII/reserved-labels)
  applies to vendor slugs only; the Product `{name-slug}` is explicitly outside D2-04 (I.4).
- **Not a contract coinage.** `canonical_url` (Class K, computed-at-read, never stored) is already
  declared in Doc-4D v1.0.3 / Doc-5D v1.0.1; this ADR is what their pointer resolves to, not a new
  field.
- **Not a routing/FE implementation.** The Doc-7 leg (builder code, middleware, redirects) is a
  separate future instrument, explicitly deferred.
- **Not a decision for any resource type beyond Product and Vendor.**
  Projects/industries/documents/etc. get the general principles only; their concrete shape needs
  its own future ratification.
- **Not a Master/CLAUDE.md invariant promotion.** Stays ADR-scoped — the same choice ADR-024 made
  for CHR.

---

## Consequences

Unblocks E-1's contract freeze — the `E-3/ADR-025` pointers in Doc-4D v1.0.3 / Doc-5D v1.0.1 now
resolve. Product route family `/marketplace/product/{name-slug}-{uuid}` becomes the one ratified
canonical for products. No existing behavior migrates (v1 invariant: no vendor-host product route
exists to redirect from). The Doc-7 leg (FE canonical-URL builder for products, redirect
realization) is a future milestone, out of scope here — the same deferral pattern ADR-024 used for
FE-PUB-10. **Existing API contracts remain unchanged; this ADR provides the architectural
authority those contracts already reference** (Doc-4D v1.0.3 / Doc-5D v1.0.1's `canonical_url`
field).

---

## Firewall / invariant check (no governance signal touched)

Presentation-layer only (Invariant 9) — no matching, routing-fairness, eligibility, trust, or
governance-signal input; no payment/plan/entitlement coupling (R7 firewall preserved); does not
touch procurement/RFQ state machines (Doc-4M unchanged).

---

*Principle:* One resource, one permanent public URL, computed in exactly one place per resource
type — the id anchors it, the builder emits it, nothing else invents it.

*ADR-025 (DRAFT, 2026-07-03) — composes with ADR-024 (Vendor leg, unchanged) and ADR-022 (route
IA), supersedes nothing. Realizes E-3 of the `ESC-7-API-PRODDETAIL` resolution; unblocks E-1's
`canonical_url` contract freeze. Doc-7 leg deferred to a future milestone. Status: DRAFT — pending
human owner approval.*
