# WORK PACKAGE — FE-VEN-13 Ads

- **Lane:** G (contract-bound renders; new build, not an enhancement)
- **Reviewed-SHA record:** `34395b2` (RV-0106 Review-B ISSUES 1 MINOR @ `c0689ce` — fixed, pure
  presentation, re-submitted to Review-B per review-process.md §5)
- **Value:** Vendor Growth · **Priority:** P2 · **Size:** M · **Risk:** Low

## In scope (READY(build) — a fresh 3-page build, not a delta over 🟩 stock)

`P-VND-12/13/14` were genuinely unbuilt before this milestone — `workspace/microsite/ads` was a
bare `WorkspaceSectionPlaceholder` stub. Built against the frozen `advertisements` contract
(Doc-2 §5.8/§10.746-749 · Doc-4D PassB Part D §D7.4: `create_advertisement.v1` ·
`submit_advertisement.v1` · `review_advertisement.v1` (admin, already shipped P-ADM-10/11) ·
`set_advertisement_state.v1` · `get_advertisement.v1`/`list_advertisements.v1`), mirroring the
already-shipped admin ad-review pages' field discipline and firewall framing (Doc-4D §B.11/§18.3
— ads never gate trust/eligibility/routing/matching).

- **P-VND-12 Ads (Listing)** — `workspace/microsite/ads/page.tsx`. Replaces the placeholder with a
  real list (`AdList`) over the vendor's own ads, all own states (owning-org `list_advertisements`
  scope). Cursor list, no totals (GI-03); one canonical empty copy; "New ad" CTA.
- **P-VND-13 Ad create** — `workspace/microsite/ads/new/page.tsx` (`AdForm`). Authors the frozen
  `create_advertisement.v1` request fields only: `placement`, `creative_ref`, `schedule{start,end}`
  (optional), `vendor_profile_id` (optional). **`platform_invoice_id` is NOT an editable field** —
  the purchase itself is Billing's (DD-5); this form never invents a purchase flow.
  **NOTE — genuinely create-only, not create/edit**: no `update_advertisement` contract exists
  anywhere in the frozen corpus, so an existing ad (including a still-`draft` one) is never
  re-opened for editing here — recorded honestly rather than inventing an update capability.
- **P-VND-14 Ad submission / status** — `workspace/microsite/ads/[adId]/page.tsx` (`AdDetailPanel`).
  Read-only status view for any existing ad (all states, including draft — see the create-only note
  above). Vendor-side actions only: Submit (`submit_advertisement.v1`, `draft → pending_review`)
  and Pause/Resume (`set_advertisement_state.v1`, `active ⇄ paused`) — **Approve/Reject is
  staff-only** (`review_advertisement.v1`, P-ADM-11) and is never offered here.
  `scheduled → active` / `active → completed` are **System-driven** (date/budget) and never a
  vendor button. Non-owned/absent `adId` → byte-identical not-found (Invariant #11, not yet wired
  — `notFound()` call deferred to the integration phase alongside the read itself, consistent with
  every other detail page in this workspace).

## Out of scope (Review-A enforces)

- Any editing of an existing ad's fields past creation (no `update_advertisement` contract —
  never invented).
- Approve/Reject on the vendor surface (staff-only, `review_advertisement.v1`, already on
  P-ADM-10/11 — never duplicated here).
- The actual ad-purchase/billing flow (`platform_invoice_id` origination) — DD-5, Billing's,
  not authored.
- Any trust/performance score or band surface (⛔ FE-VEN-09) · backend/wiring · kit/token changes
  (native `<select>` mirrors the admin category-editor precedent, RV-0029 — no buyer `Select`
  import) · coined states/fields (Doc-2 §5.8 tokens only, never invent).
- RFQ Workspace / Quotation Builder / Leads / Engagements (FE-VEN-05..08, all ✅ Closed) — no file
  from those scopes is touched.

## Dependencies

- H: — none (buildable now — the admin review counterpart, P-ADM-10/11, already shipped and
  established the field/firewall precedent this milestone mirrors).
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner: "approve close, continue to FE-VEN-13") ·
Paused — · Resumed — · Scope complete 2026-07-02 (checkpoints `c1f54ef`/`1a0ea1d`/`c0689ce`,
one fix-and-reverify cycle at `34395b2`) · **Closed 2026-07-02** (owner-approved, RV-0106)

## DoD confirmation (checked at Board close)

☑ page DoD (3 pages) ☑ responsive D/T/M (B render-verified all 3 routes at D/T/M, axe-core
zero violations) ☑ WCAG-AA (axe-core wcag2a/2aa/21a/21aa: zero violations on all 3 routes) ☑
tsc/eslint/prettier (independently re-verified across all review passes) ☑ realistic mock data —
N/A by design: genuine-empty received-only pattern, consistent with the rest of the vendor
workspace ☑ Review A PASS (RV-0106, 13 findings — 12 OBS + 1 NIT) ☑ Review B PASS after one
fix-and-reverify cycle (RV-0106 — 1 MINOR found + fixed + independently re-verified resolved,
B/M/M=0 final) ☑ Board approved (owner, 2026-07-02) ☑ no TODO/dead code ☑ no duplicate
components (the MINOR — a hand-rolled kit-`Input` duplicate — was caught and fixed) ☑ promotion
candidates registered — none flagged ☑ tracker updated
(current-focus/execution-board/team-3/changelog/fe-program-wbs) ☑ card closed
