# Doc-4D_CanonicalHost_Additive_Patch_PROPOSAL.md

> **✅ STATUS: APPROVED (human — owner/Board ruling 2026-07-03; artifact text gate-confirmed same day) + FOLDED into the corpus.**
> Corpus copy: `generatedDocs/Doc-4D_CanonicalHost_Patch_v1.0.2.md`,
> registered in `00_AUTHORITY_MAP.md`, carried **alongside** the unedited frozen Doc-4D content passes —
> **no frozen file edited in place.** This file stays the provenance copy. **Linked set** with `Doc-2_Patch_v1.0.5` (PATCH-D2-04, the business
> semantics this realizes), `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1`, and
> `Doc-3_Policy_Key_Registration_Patch_v1.10_VendorSubdomain` — folded together. Decision record:
> `governanceReviews/BOARD-PACKET-CANONICAL-VENDOR-SUBDOMAIN_v1.0.md`; decision: **ADR-024**.

## Status

Approved Patch — FOLDED 2026-07-03 (human-approved: owner/Board ruling + same-day gate confirmation)

| Field | Value |
|---|---|
| Applies to | Doc-4D (M2 Marketplace contracts) — `Doc-4D_Content_v1.0_PassB_ProfileExperience.md` (custom-domain lifecycle · microsite domain binding · profile-experience edits) |
| Produces | Doc-4D **v1.0 (+ realization patch v1.0.2)** — naming mirrors `Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2` |
| Scope | **Wire/realization semantics of the Canonical Vendor Subdomain rule — nothing else.** Three additive semantic notes on **existing** frozen contracts + one additive REFERENCE/BUSINESS validation. **Coins no new contract, no new field, no new projection, no new event, no new error code, no request/response-shape change.** |
| Purpose | Realize Doc-2 v1.0.5 (PATCH-D2-04) at the contract layer: the platform namespace is not registrable as a custom domain; the vendor-configurable `seo.canonical` is advisory under Canonical Host Resolution (CHR); domain bind/release transitions switch the CHR output and invalidate derived caches. Resolves the wire leg of `[ESC-MKT-CANONICAL-URL]`. |
| Raised by | Owner directive (2026-07-03) + CTO-review adjudication (4 rounds); **Final Architecture Board Resolution 2026-07-03: APPROVED**. |
| Authority | CLAUDE.md §7 (Doc-4D = rank 0), §8, §11, §13; Doc-4A (API metastandard — no new contract shape authored); Doc-2 v1.0.5 D2-04.3 (the CHR algorithm — referenced, never restated). |

---

# PATCH-4D-CH-01 — Canonical-Host realization notes (additive)

## 4D-CH-01.1 — `marketplace.create_custom_domain.v1`: platform-namespace rejection (additive REFERENCE/BUSINESS validation)

The create leg's Validation Matrix (frozen: "SYNTAX (domain format/uuid) → … → BUSINESS (entitlement check
from Billing — DD-5; `domain UNIQUE(partial)`)") gains one **additive BUSINESS validation**:

- **Reject any domain under `*.ivendorz.com`** (and the apex `ivendorz.com`). The platform namespace is
  platform-owned; the Platform-issued Vendor Subdomain is **derived from `vendor_profiles.slug`** (Doc-2
  v1.0.5 D2-04.1), never a `marketplace.custom_domains` row. Rejection surfaces via the **existing**
  `marketplace_domain_invalid_input` (VALIDATION) error — **no new error code coined**.

Everything else about the custom-domain lifecycle — DD-5 entitlement gating, `pending → verified → active →
released`, the infra-owned DNS-verification confirm leg, `domain UNIQUE(partial)` — is **unchanged**.

## 4D-CH-01.2 — `marketplace.update_seo_settings.v1`: `seo.canonical` is advisory (additive semantic note)

The frozen SEO object `{title, meta, keywords, og_image, canonical, schema_jsonb}` is **unchanged** (no
request-shape change). Additive semantic note:

- The vendor-configurable `canonical` field is **advisory**. The authoritative canonical host for every
  public vendor surface is the **CHR output** (Doc-2 v1.0.5 D2-04.3). Renderers emit the CHR-derived
  canonical link / `og:url`; a stored cross-host `canonical` value is **never emitted as the canonical
  link**. (FE realization: Doc-7D §11.)
- Frozen posture preserved: SEO change emits **no §8 event** (unchanged — do not coin one).

## 4D-CH-01.3 — `marketplace.set_microsite_domain.v1` · `marketplace.release_custom_domain.v1`: CHR transition semantics (additive semantic note)

- Binding an **`active`** custom domain to the microsite switches the CHR output to that hostname; release
  (`active → released`) reverts the CHR output to the Platform-issued Vendor Subdomain. (This is a semantic
  note on the **existing** transitions; payloads, validation, DD-5 gating, and the **existing** frozen
  `MicrositeDomainChanged` §8 event are unchanged — no event coined.)
- **Cache invalidation (rule-level):** a CHR transition (domain activate/release; slug migration when its
  contract lands) MUST invalidate every cached canonical derivation — canonical-URL, sitemap, metadata,
  redirect, and URL-builder caches; **no stale canonical host is ever served.** Purge mechanics are
  implementation-time realization, not contract surface.

## 4D-CH-01.4 — Public reads: CHR is derivable from the existing wire (no coinage)

Consumers derive the effective canonical host via CHR from fields **already on the wire**: the vendor
profile's `slug` (public read) + the bound custom domain's `status` (`marketplace.get_custom_domain.v1` /
microsite binding; custom-domain public read is already `status IN ('verified','active')` per Doc-6D RLS).
**This patch coins no new field, contract, or projection.** If a future consumer needs a server-computed
`canonical_host` convenience projection, that is a **separate** additive intake (API Governance Board) —
explicitly **not** authored here.

## This patch does NOT

- Coin the **M8 admin-mediated slug-migration contract** — its absence is recorded as
  **`[ESC-MKT-SUBDOMAIN-MIGRATE]`** (esc_registry; additive Doc-4D/Doc-5D patch when scheduled).
- Confirm, restate, or re-adjudicate the per-slug Doc-5D grounding of the custom-domain lifecycle slugs —
  that is `[ESC-7G-SLUG-MKT]`'s own channel; this patch binds those contracts **by pointer**.
- Change any request/response shape, error register, validation order, idempotency posture, audit mapping
  (the slug-migration business action is Doc-2 v1.0.5 §9's; its wire token lands with the future migration
  contract), event catalog, or entitlement rule (DD-5 unchanged).
- Touch routing/matching/eligibility: CHR is presentation-layer (Invariant 9); no governance signal reads
  or writes it (Invariant 6).

---

# Conformance self-check

| Check | Result |
|---|---|
| Additive only; no frozen Doc-4D clause altered in place | PASS — three semantic notes + one additive validation, carried alongside |
| No new contract / field / projection / event / error code | PASS — existing `marketplace_domain_invalid_input` reused; `MicrositeDomainChanged` already frozen |
| Layer boundary (Doc-2 business ↔ Doc-4D realization) | PASS — CHR defined in Doc-2 v1.0.5, referenced here, never restated |
| Anti-invention (no Doc-5D slug coined or confirmed) | PASS — custom-domain slugs bound by pointer; `[ESC-7G-SLUG-MKT]` untouched; migration contract deferred to `[ESC-MKT-SUBDOMAIN-MIGRATE]` |
| Firewall (Invariants 6/9/11) | PASS — presentation-layer identity only; byte-equivalent 404 posture realized in Doc-7D §11 |

---

*End of Doc-4D_CanonicalHost_Patch_v1.0.2 — wire realization of the Canonical Vendor Subdomain rule:
platform-namespace rejection on `create_custom_domain`, `seo.canonical` advisory under CHR, CHR transition
+ cache-invalidation semantics on domain bind/release, CHR derivable from the existing wire. Coins
nothing. Linked set with Doc-2 v1.0.5 · Doc-6D v1.0.1 · Doc-3 v1.10; decision ADR-024. **APPROVED & FOLDED
into the corpus (human, owner/Board ruling 2026-07-03).***
