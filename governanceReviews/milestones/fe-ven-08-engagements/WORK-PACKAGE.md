# WORK PACKAGE — FE-VEN-08 Engagements

- **Lane:** G (money-boundary adjacency — DF-6; contract-bound renders)
- **Reviewed-SHA record:** `ec8306b` (scope complete — the sole in-scope page checkpointed)
- **Value:** Vendor Growth · **Priority:** P1 · **Size:** L · **Risk:** Med

## In scope (the delta — a frozen-conformance fix over the vendor workspace E1-E5 stock)

- **P-VND-24 Engagement detail** (🟩; overview pane): `EngagementOverview`'s lifecycle control
  ALWAYS rendered the single hardcoded button "Mark delivered → completed", regardless of the
  engagement's actual `status`. The companion's own frozen text (Doc-4F_PassB_Part2, quoted
  verbatim in `vendor_planning_and_design.md:1004`) is explicit: **"Engagement machine (FROZEN):
  `open → in_delivery → completed → closed`; only the single next legal edge is shown; `closed`
  reached only via `ops.close_engagement.v1` on `completed → closed`; `open→closed`/
  `in_delivery→closed` not offered; `closed` terminal."** The shipped code violated this on 3 of 4
  statuses (`open`, `completed`, `closed` all showed the SAME in_delivery→completed CTA — wrong
  and misleading on an engagement that hasn't even started delivery, or one that's already
  finished/closed). Fixed: the panel now derives the correct single next legal edge per status —
  `open` → "Mark in delivery", `in_delivery` → "Mark delivered → completed" (unchanged, the only
  status this was previously correct for; keeps its existing irreversibility note, m-2), `completed`
  → "Close engagement" (citing `ops.close_engagement.v1`), `closed` → no action, terminal note.

## Out of scope (Review-A enforces)

- **P-VND-23 Engagements list** — reviewed against its own header comment (`MINOR-C3`: the frozen
  `ops.list_engagements.v1` projection is `{engagement_id, human_ref, status}` ONLY) and found
  already exactly conformant — nothing to fix, nothing to add without over-projecting. Left
  untouched.
- **P-VND-25/26 (Delivery challan / Trade invoice — the E3 document-set tabs)** — correctly
  gated by `[ESC-7G-ENG-03]` (no `list_engagement_documents` contract exists; enumeration is
  build-blocked, genuine-empty + pending note is the honest interim). Left untouched — building
  a fabricated list here would be the RV-0051 mistake repeated.
- Any trust/performance score or band surface (⛔ FE-VEN-09) · money movement of any kind (DF-6 —
  record/confirm off-platform only, never Pay/Settle/Escrow/Wallet) · backend/wiring · kit/token
  changes · coined states/fields/mutation names (only the real `ops.close_engagement.v1` is cited,
  never invented).
- RFQ Workspace (FE-VEN-05) · Quotation Builder (FE-VEN-06) · Leads (FE-VEN-07) — all ✅ Closed;
  this delta does not touch any file from those scopes.

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: engagements are created OUT-OF-WIRE on award (no create affordance); non-party
  → byte-identical not-found (Inv 11); `[ESC-7G-ENG-01]` (no `rfq_id` projection) and
  `[ESC-7G-ENG-02]` (no buyer display-name read) both stay "pending projection"/neutral-label,
  unaffected by this delta.

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner: "approve close, continue to FE-VEN-08") ·
Paused — · Resumed — · Scope complete 2026-07-02 (checkpoint `ec8306b`) · **Closed 2026-07-02**
(owner-approved, RV-0105)

## DoD confirmation (checked at Board close — carry-forward: delta-only over 🟩 legacy pages)

☑ page DoD (1 page) ☑ responsive D/T/M (N/A — no layout/breakpoint change; button/copy swap only)
☑ WCAG-AA (B confirmed: real labeled buttons in every branch, no regression) ☑ tsc/eslint/prettier
(independently re-verified by both A and B) ☑ realistic mock data — N/A by design: genuine-empty
received-only pattern; B render-verified all 5 status branches via a disposable harness anyway ☑
Review A PASS (RV-0105, 11 OBS — incl. independent trace of the frozen-conformance claim to
`Doc-4F_PassB_Part2_BC-OPS-2_FROZEN.md`) ☑ Review B PASS (RV-0105, 11 OBS + 1 non-gating NIT,
B/M/M=0) ☑ Board approved (owner, 2026-07-02) ☑ no TODO/dead code (B confirmed) ☑ no duplicate
components (B confirmed — `nextLegalEdge` is genuinely new logic) ☑ promotion candidates
registered — none flagged ☑ tracker updated
(current-focus/execution-board/team-3/changelog/fe-program-wbs) ☑ card closed
