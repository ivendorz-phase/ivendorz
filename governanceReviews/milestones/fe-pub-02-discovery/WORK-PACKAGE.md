# WORK PACKAGE — FE-PUB-02 Public Discovery (DRAFT — awaiting owner kickoff approval + Step-3 baseline)

- **Lane:** G (Core Marketplace; GI-04 editorial-slice discipline; anonymous contract surface)
- **Reviewed-SHA record:** _(filled at 🔵A)_
- **Value:** Core Marketplace · **Priority:** P1 · **Size:** L · **Risk:** Med

## In scope (the delta — enhancement over the public 🟩 stock)

- **P-PUB-07 Categories index** (🟩): featured categories, capability cards, industry sections —
  every "featured" slice is **editorial, never a computed rank** (GI-04); category data from the
  existing build-time seed (simple nav).
- Search experience polish across the discovery entry points (grounded in `search_catalog` facets
  only — the ESC-7-API-CATNAV interim).
- Featured vendors / featured products sections on the discovery surface: public projections only
  (Doc-4D §B.3), Verified = binary chip, capability = 4-flag matrix (Inv#1), no score/band.
- **P-PUB-09 Industry page**: ⛔ `ESC-7-API-CATNAV` — page-gate carve-out; NOT built in this
  milestone; the milestone closes without it.

## Out of scope (Review-A enforces — pull-in risk is HIGH here)

**Mega menu — explicitly excluded** (Board ruling 4): the `MEGA_MENU_*.md` package stays
design-only; category navigation uses the existing simple nav (FE-PF-05). Do not implement any
part of the package even though the spec docs exist at repo root → that work is ⛔ **FE-PUB-09**.
Also out: backend/wiring · search-API changes · AI features (`ESC-7-AI` reserved) · re-ranking
of any M3 output · kit/token changes.

## Dependencies

- H: — none for the buildable scope (P-PUB-09 carved out).
- **S: Review-B Step-3 Public baseline sweep** (QCT 5-step Step 3) — run first so Team-1 enhances
  a reviewed baseline (Board agenda #10).

## Lifecycle ownership

Builder = **Team-1** · Maintainer = **Team-1** · Review A → Review B (fresh contexts) → Board
(owner approves close).

## Key dates

Created 2026-07-02 · Started — · Paused — · Resumed — · Closed —

## DoD confirmation (checked at Board close — carry-forward: delta-only over 🟩 legacy pages)

☐ page DoD ☐ responsive D/T/M ☐ WCAG-AA ☐ tsc/eslint/prettier ☐ realistic mock data
☐ Review A PASS ☐ Review B PASS (B/M/M=0) ☐ Board approved ☐ no TODO/dead code ☐ no duplicate
components ☐ promotion candidates registered ☐ tracker updated ☐ card closed
