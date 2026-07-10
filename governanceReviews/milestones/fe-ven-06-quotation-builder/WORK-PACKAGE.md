# WORK PACKAGE — FE-VEN-06 Quotation Builder

- **Lane:** G (Procurement Moat; non-disclosure adjacency; contract-bound renders)
- **Reviewed-SHA record:** `4ae0ec1` (scope complete — all three in-scope pages checkpointed)
- **Value:** Procurement Moat · **Priority:** P1 · **Size:** L · **Risk:** Med

## In scope (the delta — enhancement over the vendor workspace S1/S4-S9 stock)

- **P-VND-17 Quotations** (🟩; co-located with P-VND-15 at `/workspace/rfqs` — S1 Quotation Home):
  each inbox row gains the vendor's OWN quotation-state chip (`QuotationStateChip`, frozen Doc-4M
  `QuotationState`) when a quotation exists on that RFQ — visibility-gated (per page_inventory),
  rendered only when present. Closes the gap where "Quotations" is a distinct left-nav destination
  (page_inventory IA table) but the merged listing showed no quotation-state signal at all.
- **P-VND-19 Quotation version history** (🟩): render the frozen `supersedes_version_no` reference
  (already typed in `QuotationVersionView`, Invariant 8/DP11, never rendered) so a superseded
  version visibly states which version replaced it — not just a bare "Superseded" chip.
- **P-VND-20 Quotation actions** (🟩): explicit **withdraw = zero penalty** copy next to the
  Withdraw action (frozen "pre-award, terminal" semantics) — mirrors the FE-VEN-05 P-VND-16
  decline-no-penalty precedent (RV-0101), including `aria-describedby` wiring.

## Out of scope (Review-A enforces)

- **P-VND-18 Quotation create/edit (the 7-step builder)** — reviewed and found already complete
  against its stated scope (companion §13.1); no grounded gap identified this cycle. Left
  untouched.
- **S7 Late-Extension (`request_late_extension`, two-phase)** — page_inventory binds this action to
  P-VND-20, but it is **entirely unbuilt** (no UI exists anywhere in the vendor RFQ workspace).
  Building the two-phase late-extension request flow from scratch is a **build**, not an
  **enhancement**, and is explicitly carved OUT of this milestone's delta scope — flagged here as a
  known, recorded gap (not silently dropped) for a future milestone/owner scoping decision, not
  invented under an ambiguous "enhance in place" instruction.
- Invitations inbox (FE-VEN-05, ✅ Closed, RV-0101) — this delta **touches** the same physical file
  (`invitation-inbox.tsx`) to add the P-VND-17 chip, but does **not** reopen or re-litigate the
  closed P-VND-15 scope (needs-response ordering, decline affordance) — byte-equivalence on that
  prior delta is Review-A's job to verify, not this milestone's to redo.
- Leads (FE-VEN-07) · Engagements (FE-VEN-08) · any trust/performance score or band surface
  (⛔ FE-VEN-09; band-only interim binds — never pass `score`) · routed/eligible/total denominators
  · backend/wiring · kit/token changes (incl. no change to the shared `WorkspaceTabs` infra) ·
  coined states/fields (Doc-4M chips only, never invent).

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: A7-safe neutral `/workspace` routing; byte-equivalence load-bearing on the
  vendor surface; deferral/exclusion invisible (Doc-3 §4.2); quota is consumed at SUBMIT only
  (Doc-5I, unaffected by this delta).

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner: "start now") · Paused — · Resumed — ·
Scope complete 2026-07-02 (checkpoints `af1d9db`/`91925fc`/`4ae0ec1`) · **Closed 2026-07-02**
(owner-approved, RV-0103)

## DoD confirmation (checked at Board close — carry-forward: delta-only over 🟩 legacy pages)

☑ page DoD (3 pages) ☑ responsive D/T/M (B render-verified via SSR HTML inspection, no headless
browser available this cycle — noted transparently in RV-0103 B#8) ☑ WCAG-AA (`aria-describedby`
pairing render-confirmed both branches; no colour-only status) ☑ tsc/eslint/prettier (independently
re-verified by both A and B) ☑ realistic mock data — N/A by design: this surface renders
genuine-empty (received-only/byte-equivalence pattern, established pre-cutover); delta is additive
markup over the existing empty-safe render, no new data path ☑ Review A PASS (RV-0103, 10 OBS) ☑
Review B PASS (RV-0103, 9 OBS, B/M/M=0) ☑ Board approved (owner, 2026-07-02) ☑ no TODO/dead code
(B confirmed) ☑ no duplicate components (B confirmed — `QuotationStateChip` reused, not
reimplemented) ☑ promotion candidates registered — none flagged by either reviewer ☑ tracker
updated (current-focus/execution-board/team-3/changelog/fe-program-wbs) ☑ card closed
