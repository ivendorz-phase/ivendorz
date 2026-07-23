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

## Implementation status — recorded 2026-07-23

```text
FE-BUY-11 Saved Vendors

Presentation Status:
COMPLETE

Backend Wiring Status:
DEFERRED TO WAVE 5

Reason:
The required M4 contracts are frozen, but their runtime implementation,
persistence schema, repositories, application services, route handlers,
audit behavior, and mutation infrastructure do not yet exist.
```

**Delivered route (owner directive 2026-07-23 — supersedes the "Re-home" item below).** The surface
ships **in place at `/buy/saved-vendors`**. `/buy/vendors` was **not** created and **no redirect was
added**; `/buy/crm` + `/buy/crm/[recordId]` remain live and untouched. Nav already pointed
"Saved Vendors" at this route, so no nav change was required. Delivered code:
`app/(app)/(workspace)/buy/saved-vendors/` (server page + client workspace) over the Tier-2
components in `app/(app)/(workspace)/buy/_components/vendor-directory/`; tests in
`tests/integration/saved-vendors-directory.test.ts` (14 passing). The approved clickable prototype
that this surface reproduces is held **outside version control** (excluded artifact — no repo path
cited here by design).

**No production persistence exists today.** Reads are composed server-side by
`buildDirectorySnapshot()` in
`app/(app)/(workspace)/buy/_components/vendor-directory/working-model.ts` — the single frozen-read
seam, fixture-backed. All mutations (⭐ Preferred set/clear, archive/restore, private-vendor create,
paste-create) update **local client working state only** and reset on reload. Nothing is written, and
the browser calls no Doc-5 contract and sets no `Iv-Active-Organization`.

**Dependency — M4 runtime (Wave 5).** A wiring audit on 2026-07-23 established that the M4
`operations` module has **frozen contracts but zero runtime**: 8/8 of the operations this surface
needs (`list_private_vendors`, `get_private_vendor`, `get_buyer_supplier_relationship`,
`set_vendor_favorite`, `clear_vendor_favorite`, `create_private_vendor`, `archive_private_vendor`,
`set_buyer_vendor_status`) have a frozen Doc-5F contract row, and **0/8 have a persistence table, an
implementation, or an HTTP/action entry point**. `src/modules/operations/contracts/services.ts` is an
`export {}` placeholder; `api/application/domain/infrastructure` are empty; no migration creates any
`operations.*` table (the schema namespace exists, spine-only). This is true on **`origin/main` as
well as this branch** — rebasing unlocks nothing. M4 is **Wave 5**; the programme is entering Wave 3.
Wiring therefore cannot proceed without building M4 early (out of sequence) or inventing the missing
layer — both refused.

**Marketplace search stays parked too.** The Add-Vendor free-text search maps to
`marketplace.search_catalog`, which is **unbuilt on every branch** (recorded as deferred at the Wave-3
exit gate). The adjacent `list_vendor_directory` is built on `origin/main` only and accepts no
free-text query, so it cannot serve this UX regardless.

**Governance dependency (separate, blocking Wave-5 wiring):** see `GOVERNANCE-DEPENDENCY.md` in this
folder — the frozen permission model cannot express the approved ordinary/authorized member asymmetry.

**When M4 lands**, only the body of `buildDirectorySnapshot()` and the mutation handlers change; no
view or component changes shape. All items in "Out of scope" below remain parked and unchanged.

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

- H: — none for the presentation milestone (fixtures; zero API).
- S: Stream-2 packet fold (R8) + extraction phase gate **only** for the future real import wiring
  (WP-8, Phase B) — the simulation here does not depend on it.

**Blocking Phase-B / Wave-5 production wiring (recorded 2026-07-23):**

1. **M4 runtime implementation — Wave 5.** Contracts frozen, runtime absent (persistence schema,
   repositories, application services, route handlers, audit behaviour, mutation infrastructure).
   See "Implementation status" above.
2. **Authorization asymmetry — Doc-2 governance.** The frozen permission model cannot express the
   approved ordinary/authorized member distinction. Separate record: `GOVERNANCE-DEPENDENCY.md`
   (this folder). Must be resolved before Wave-5 wiring; **not** resolvable in a frontend task.

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
