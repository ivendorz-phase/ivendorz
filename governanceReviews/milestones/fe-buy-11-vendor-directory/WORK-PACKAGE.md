# WORK PACKAGE — FE-BUY-11 My Vendor Directory

- **Lane:** G (buyer-private CRM; Inv#11 non-disclosure — blacklist must stay UNDETECTABLE
  vendor-side; buyer may see their own)
- **Reviewed-SHA record:** _(set at Review-A/B)_
- **Value:** Buyer Productivity · **Priority:** P1 · **Size:** L · **Risk:** High

## Mandate

Owner rulings 2026-07-16/17 (recorded in the approved two-stream plan): rebuild the buyer vendor
CRM as **"My Vendor Directory"** per `docs/product/requirements/BUYER_VENDOR_DIRECTORY_SPEC_v1.0.md`
(§4 IA · §5 Add Vendor · §6 form · §7 detail), executing the reconciliation §3.11 re-home/relabel
FE-change item (owner-ruled — the shipped FE-BUY-09 milestone is superseded by ruling, not silently
respecified). Presentation-only (fixtures; zero API); Phase-B backend slice (BC-OPS-1) wires it later.

## In scope

- **Re-home:** P-BUY-26/27 move `/buy/crm` → `/buy/vendors` (+ `/buy/vendors/[recordId]`); thin
  `redirect()` stubs at `/buy/crm`, `/buy/crm/[recordId]`, `/buy/saved-vendors` (the reserved
  Saved-Vendors concept folds into ⭐ Preferred = frozen `vendor_favorites` — owner ruling 2026-07-16
  recorded in `ESC-BUY-SAVED-VENDORS` disposition); nav re-group ("Discover Vendors" label-collision
  fix; "My Vendor Directory" group with query-children; quick-bar swap).
- **List** (P-BUY-26 re-homed): spec §4 views All/Marketplace/Private/⭐Preferred/Archived as
  `?view=` GET links; filter chips `?f=` (verified|claimed|blacklisted|archived — chips never nav;
  Blacklisted chip buyer-side only); origin badges; owner sort ⭐ → Recently Used → Marketplace →
  Private; no free-text list search (frozen list read has no query filter).
- **Detail** (P-BUY-27 re-homed): §7 tabs Profile · Notes · My Rating (StarRating display +
  interactive input, Save disabled) · Status history (append-only) · Documents (**GATED-R3
  EmptyState placeholder**); link panel on `suggested` (Confirm/Dismiss disabled); linked-profile
  VendorCard block (M2 data displayed, never copied).
- **Add Vendor** (`/buy/vendors/new`, spec §5, client local-state): unified search both origins;
  marketplace hit → "Add to My Vendor List" (models favorite/status write); private hit → open
  record; no hit → §6 form (frozen fields first-class; extras in a `details_jsonb`-shaped section
  per the R5 interim ruling; categories multi-select max-10 rendered w/ GATED-R5.2 note — never
  persisted; engagement stage + custom tags + last-contact = jsonb-shaped NEW concepts, never
  conflated with frozen enums); duplicate prompt Link / **Archive duplicate** (Merge = R5.6) /
  Cancel; **"Import from document" simulation** (canned extraction suggestion pre-fills form;
  models the PROPOSED Stream-2 pipeline, purpose `vendor_directory_import`, no snapshot — see
  `BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md` R8; no real upload — `ESC-7-API/upload` open).
- New Tier-2 components (`buy/_components/vendor-directory/`): StarRating(+Input), OriginBadge,
  TagInput; composed VMs + `directory-display.ts` kept SEPARATE from frozen `state-display.ts`.

## Out of scope (Review-A enforces)

- Wiring any write or read (Phase-B); no fetch/API anywhere.
- Persisting categories in any form (R5.2), attachments/upload (R3 + ESC-7-API/upload +
  ESC-TRUST-EVIDENCE interims), merge (R5.6), invite (R4), bulk import/export (R5.5), discovery
  signals (R2 — nothing cross-buyer renders).
- "Send RFQ" affordance anywhere on the surface (unlinked-private rule; kept off linked too this
  milestone).
- Frozen unions/state-display edits; kit primitive changes; new deps; motion additions.

## Dependencies

- H: — none (presentation-only).
- S: Stream-2 packet fold (R8) + extraction phase gate **only** for the future real import wiring
  (WP-8, Phase B) — the simulation here does not depend on it.

## Lifecycle ownership

Builder = this session (owner-directed) · Review A → Review B (fresh contexts) → close per
review-process.md; Inv#11 stakes: both lanes independently verify non-disclosure (structural
absence on list; buyer-only chip on detail; no cross-buyer signal anywhere).

## Key dates

Created 2026-07-17 · Started 2026-07-17 · Closed — _(pending Review-A/B)_

## DoD confirmation (checked at close)

☐ page DoD (list/detail/new) ☐ Inv#11 re-verified both lanes ☐ redirects verified (3 routes)
☐ tsc/lint/build green (CI oracle) ☐ /fe-checklist ☐ /ivendorz-fe-design ☐ /ivendorz-verify-fe
☐ Playwright walkthrough ☐ no coined contract/field/slug/key (jsonb-shaped extras annotated)
☐ page_inventory updated ☐ tracker updated ☐ card closed
