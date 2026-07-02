# WORK PACKAGE — FE-VEN-14 Vendor ↔ Account Integration (Composition Layer)

- **Lane:** L (Light — documentation/composition-planning only, no UI/backend/component change;
  ONE fresh-context review covering both A and B checklists → Board, per review-process.md §2)
- **Reviewed-SHA record:** _(filled at review — this milestone produces a document, not code; the
  "SHA" is the commit that adds the report)_
- **Value:** Platform · **Priority:** P2 · **Size:** S · **Risk:** Low (no code touched)

## In scope (owner-specified)

Prepare the architecture that unblocks `FE-VEN-10`/`FE-VEN-11`/`FE-VEN-12`:
- Inventory reusable Account (`P-ACC-*`) components.
- Define the composition mapping (Billing → Account Billing, Organization → Account Organization,
  Settings → Account Settings).
- Document required adapters (ViewModels only).
- Verify no forks of Account pages exist.
- Produce a reuse/composition report + implementation plan:
  `governanceReviews/FE-VEN-14-VENDOR-ACCOUNT-COMPOSITION-REPORT_v1.0.md`.

Report contents: full `P-ACC-02..21` inventory with file/route/contract per page; the composition
mapping table; a reusability assessment (8 of 17 components read in depth, self-contained/zero-prop
pattern confirmed, no participation-specific hard-coding found); the ViewModel-adapter design for
the future wiring phase (none needed today — importing the existing component reaches presentation
parity with zero fork); fork verification (confirmed clean via repo-wide grep); two real findings
routed to the Board, not resolved locally (`P-ACC-13` Workflow Settings is written in buyer-only
RFQ-approval language; `P-ACC-19` Lead Credits is classified "Buyer" in `page_inventory.md` despite
being vendor-facing everywhere else in the program); and the actual gating decision — route topology
(Option A pure link-out, mirroring `FE-BUY-10`/P-BUY-04, vs. Option B composed vendor-mounted pages
importing the existing components unchanged) — presented with tradeoffs, not chosen unilaterally.

## Out of scope (owner constraints — binding)

- **No UI changes** — no page/component was created, edited, or touched under `app/` or
  `src/frontend/`.
- **No backend** — no contract, route handler, or server code touched.
- **No new components** — the report documents reuse of *existing* Account components only.
- **No page duplication** — explicitly verified (§ "Verify no forks") via repo-wide grep across the
  vendor workspace for any Organization/Billing/Members/Workflow/Delegation content; zero matches.
- **Building FE-VEN-10/11/12 themselves** — explicitly gated on Board approval of this report's
  route-topology recommendation (§7) and the two routed findings (§6.1/§6.2); this milestone stops
  at the report, per the owner's own framing ("no implementation starts before the Board decides
  the reuse strategy").

## Dependencies

- H: — none for producing the report. Building FE-VEN-10/11/12 (next milestones) depends on this
  report's Board ruling (route topology + the two routed findings).
- S: — none.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Lane L: ONE fresh-context review (combined A+B
checklist) → Board decision on the report's recommendation (a strategic ruling, not a mechanical
gate — distinct from Amendment v1.3's clean-gate self-close, since the report itself asks the Board
to decide something, not just confirm code quality).

## Key dates

Created 2026-07-03 · Started 2026-07-03 (owner-specified milestone, delivered directly in chat) ·
Scope complete —

## DoD confirmation (checked at close)

☐ report produced covering all 6 owner-specified scope items ☐ inventory verified against
`page_inventory.md`/`account-nav-model.ts` + direct file reads (8 of 17 components read in depth) ☐
fork verification performed (repo-wide grep, zero matches) ☐ no code touched (`git status` shows
only the report + WP-card + tracker files) ☐ combined Lane-L review PASS (B/M/M = 0) ☐ Board
decision recorded on route topology + the two routed findings ☐ tracker updated ☐ card closed
