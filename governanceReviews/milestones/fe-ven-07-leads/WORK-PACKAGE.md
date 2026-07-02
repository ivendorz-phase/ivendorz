# WORK PACKAGE — FE-VEN-07 Leads

- **Lane:** G (private CRM firewall adjacency — R6; contract-bound renders)
- **Reviewed-SHA record:** `b1810fe` (scope complete — both in-scope pages checkpointed)
- **Value:** Vendor Growth · **Priority:** P1 · **Size:** M · **Risk:** Med

## In scope (the delta — enhancement over the vendor workspace PL-1/PL-2 stock)

- **P-VND-21 Leads pipeline** (🟩; List + Board views, companion §13.2): the Board view now shows
  each card's `NextActionPill` (own CRM date/urgency), matching the List view's information
  density. Closes an inconsistency where the identical `LeadView.next_action_urgency`/
  `next_action_label` fields are rendered in List but silently dropped in Board — same underlying
  data, two different disclosure levels.
- **P-VND-22 Lead detail** (🟩): `LeadPipelinePanel` now renders `lead.created_at` ("Lead created
  … from your invitation") — a field already typed and documented on `LeadView`
  (`created_at`) but never surfaced anywhere on the detail page.

## Out of scope (Review-A enforces)

- **Client-side "due first" reordering of the list/board** — considered and explicitly declined.
  `LeadPipeline` already carries an explicit (currently-disabled) **"Due first" server-driven sort
  control** whose comment ties it to a future wired `ops.list_leads.v1` query. Silently
  reordering rows client-side under that same visible-but-disabled control would create a
  confusing double-signal (a disabled button implying "nothing happens" while the rows already
  reordered) — unlike the FE-VEN-05 inbox precedent, where no competing UI control claimed
  ownership of that behavior. Left alone; the disabled control stays the single source of truth
  for that feature.
- **Stage-advance / Mark won-lost / value-estimate / next-action editing / activity logging /
  private notes saving** — all correctly disabled pending wiring (`ops.update_lead_stage.v1`,
  `ops.add_lead_activity.v1`); no scope here.
- Any trust/performance score or band surface (⛔ FE-VEN-09) · routed/eligible/total denominators
  or any lead-stage win-rate (ND-8) · backend/wiring · kit/token changes · coined
  states/fields/activity-type enum (Doc-5F/Doc-2 §3.5 chips only, never invent).
- RFQ Workspace (FE-VEN-05, ✅ Closed) · Quotation Builder (FE-VEN-06, ✅ Closed) — this delta does
  not touch any file from either closed scope.

## Dependencies

- H: — none (buildable now).
- S: — none.
- Carried context: leads are RECEIVED-ONLY (out-of-wire `ops.create_lead_on_invitation`, no
  self-create affordance); firewall — `won`/`lost` is private CRM, never the RFQ award, never a
  governance signal (R6); byte-equivalence load-bearing (Invariant 11).

## Lifecycle ownership

Builder = **Team-3** · Maintainer = **Team-3** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner: "approve close, continue to FE-VEN-07") ·
Paused — · Resumed — · Scope complete 2026-07-02 (checkpoints `4636bf2`/`b1810fe`) · **Closed
2026-07-02** (owner-approved, RV-0104)

## DoD confirmation (checked at Board close — carry-forward: delta-only over 🟩 legacy pages)

☑ page DoD (2 pages) ☑ responsive D/T/M (B render-verified Board `w-64` layout + `hidden md:flex`
gate via SSR HTML) ☑ WCAG-AA (no colour-only signal; pill always carries a text label) ☑
tsc/eslint/prettier (independently re-verified by both A and B) ☑ realistic mock data — N/A by
design: genuine-empty received-only pattern, established pre-cutover; delta is additive markup
over the existing empty-safe render ☑ Review A PASS (RV-0104, 13 OBS) ☑ Review B PASS (RV-0104, 9
OBS, B/M/M=0) ☑ Board approved (owner, 2026-07-02) ☑ no TODO/dead code (B confirmed) ☑ no
duplicate components (B confirmed — `NextActionPill` reused verbatim, not reimplemented) ☑
promotion candidates registered — none flagged by either reviewer ☑ tracker updated
(current-focus/execution-board/team-3/changelog/fe-program-wbs) ☑ card closed
