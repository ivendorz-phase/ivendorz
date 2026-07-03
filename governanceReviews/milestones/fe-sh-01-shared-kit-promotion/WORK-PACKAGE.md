# WORK PACKAGE — FE-SH-01/05/07/08 Shared Kit Promotion (Comparison Table + RFQ Card)

- **Lane:** L proposed (zero-behavior-change component promotion; no Inv#11/R6/R7/firewall/money-
  boundary/contract-bound-render touch — pure structural move + thin re-export shims. **Board/owner
  may override to G** per review-process.md §2 "ambiguous → Lane G")
- **Reviewed-SHA record:** _(fill at 🔵A — working-tree checkpoint, uncommitted as of this card)_
- **Value:** Platform · **Priority:** P2 · **Size:** M · **Risk:** Low (mechanical move, byte-
  identical verified)

## In scope (owner-specified — CTO override, 2026-07-03)

Promotes the buyer-scoped Comparison Table (`P-BUY-15`) and the vendor-scoped RFQ inbox row
(`InvitationRow`, S2) into the Doc-7B kit at `src/frontend/components/`, ahead of the Shared
Platform Component Registry's normal "2nd consumer" trigger — an explicit CTO override, since
neither had a second workspace consumer at promotion time. Advances/registers the following
`promotion-watchlist.md` candidates:

- **FE-SH-01** `DataListTable` — Candidate → **Extracted** (buyer-local file is now a re-export
  shim; 12 existing consumers unaffected).
- **FE-SH-05** Status components (`state-display`) — **partially** promoted: only
  `quotationStateDisplay` moved to Tier-0 `quotation-state-display.ts` (needed by the Comparison
  Table); the other 7 domain mappings (RFQ/engagement/payment/invoice/vendor-link/buyer-vendor/
  invitation) stay buyer-scoped.
- **FE-SH-07 `SealedMarker`** (proposed new ID, owner ratification pending) — Candidate → Extracted.
- **FE-SH-08 Comparison/RFQ card composition** (proposed new ID, owner ratification pending) —
  new `src/frontend/components/comparison/` (ComparisonTable/Summary/Empty/builders/view-models)
  and `src/frontend/components/rfq/` (new `RfqCard`, promoted `state-chips`/`window-state-chip`/
  types).

Also added: `src/frontend/components/format.tsx` (Money/formatDate/formatInstant/Ref — needed by
the Comparison Table, not previously watchlisted) and `src/frontend/components/README.md`
(canonical-location + no-duplicate-implementations notice, + the one-way import-direction rule).

**Deliverables:**
- 5 new Tier-0 files (`data-list-table.tsx`, `sealed-marker.tsx`, `format.tsx`,
  `quotation-state-display.ts`, `README.md`) + 2 new Tier-0 folders (`comparison/`, `rfq/`, 7 files
  + 2 barrels).
- Zero-behavior-change re-export shims at every original buyer/vendor location (M8 pattern).
- `invitation-inbox.tsx` and `comparison-view.tsx` rewritten as thin adapters over the promoted
  components.
- `shared_platform_component_registry.md` updated in place (§5.1/§5.3/§5.4) to record the override.

## Out of scope (owner constraints — binding)

- **Timeline unification** — buyer `activity-timeline.tsx` and vendor `lead-activity-log.tsx` have
  genuinely divergent prop shapes (`ActivityEntry` vs `LeadActivityView`); no unification attempted.
- **Company Card / Quote Card** — neither exists anywhere in the codebase today (verified by
  inventory); building either would be net-new feature scope, not a promotion. Not built.
- **Storybook stories** for the newly-promoted components — deliberately a separate PR (owner
  MINOR-1: keep the promotion diff focused; Storybook tooling setup is nontrivial on its own).
- **Repointing existing consumers' imports directly** to the new Tier-0 paths — the shim approach
  was chosen specifically to avoid a much larger diff across 12+ buyer files and 4+ vendor files;
  a future FE-CLN-03 pass can do the direct repoint + shim removal ("Migrated"/"Old-removed" stages
  per the promotion lifecycle) once this Extracted stage is Board-approved.

## Dependencies

- H: — none to land this promotion.
- S: **FE-DOC-03** (Team-3, Track 7) carries a soft-dependency on "the FE-SH-01 ruling, kit-
  primitive-rows fallback documented" (execution-board.md Board agenda #13) — this milestone is
  that ruling's technical groundwork; Board agenda #13 still needs the owner's formal
  approve-with-extraction decision.

## Lifecycle ownership

Builder = **Kit owner** (cross-cutting; touches both Team-2/Team-3 app-layer + the shared kit,
consistent with the promotion-watchlist's "Owner (Mnt): Kit owner" convention for all FE-SH rows) ·
Maintainer = Kit owner · Review A → Review B → Board.

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner-specified CTO override, delivered directly in
session) · Scope complete 2026-07-03 (working tree; SHA to be filled at checkpoint commit).

## DoD confirmation (checked at submission to Review-A)

☑ `tsc --noEmit` clean ☑ `eslint .` (whole repo) clean ☑ `prettier --check` clean on all touched
files ☑ one-way import direction verified (`src/frontend/components/**` never imports from `app/`)
☑ dev-server render check: buyer comparison page renders full fixture data through the entire
promoted chain; vendor RFQ inbox renders its correct pre-existing empty state (no fixture ever
wired there — unaffected by this change) ☑ zero duplicate implementations left behind (all
originals are re-export shims, not copies) ☑ `promotion-watchlist.md` updated in the same change
☑ `shared_platform_component_registry.md` updated in the same change ☐ Review A ☐ Review B ☐ Board
approved ☐ WBS/execution-board/changelog fully updated (this card + watchlist done; execution-board
queue entry + changelog line pending in this same session) ☐ WP card closed.

**Known gap (disclosed, not hidden):** `next build` was not exercised as verification — it failed
on this machine with a pre-existing `EPERM` scandir error on `C:\Users\engra\Application Data`
(Windows environment issue, `next.config.ts` confirmed untouched, unrelated to this diff). Review-A/
B should re-attempt a production build on a clean environment if one is available, since `tsc`+
dev-server render checks are the strongest verification obtained here.
