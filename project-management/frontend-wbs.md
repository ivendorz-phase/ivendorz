# Frontend WBS — live board

**Status:** Active v1.0 · **Date:** 2026-07-01 · Non-authoritative. See [`README.md`](README.md) for
the loop and ownership rules; [`page_inventory.md`](../page_inventory.md) for the page list.

## Summary metrics (refreshed 2026-07-02 — verified against team files)

| Metric | Count |
|---|---:|
| **Total pages** (page_inventory) | 144 |
| **🟩 Built** (pre-existing, under Team-4 QCT) | 44 |
| **✅ Approved** | 75 |
| **🔵 Ready for Review** | 1 (P-PUB-05) |
| **⬜ Pending** | 24 |
| — of which **Ready** | 16 |
| — of which **Blocked** (Waiting API/Decision) | 5 |
| — of which **owner-gated** (P-BUY-03/04/05) | 3 |

Per-surface breakdown + cluster milestones: [`product-status.md`](product-status.md) §2.
Complete clusters: **Auth** (02–08) · **Account** (01–22, −12 gated) · **Buyer** (01–27, −3 gated) ·
**Admin** (01–29).

## Rules

- Only **ONE** page `🟡 In Progress` per team at a time.
- Only the **owning team** may set `🟡 In Progress` (see README team table).
- Work **highest-priority Ready** first — never alphabetical. Skip `Dependency ≠ Ready`.
- Reuse existing components; no new primitives; no routing/design-system changes.
- Stop after each page reaches `🔵 Ready for Review`. **Team-4 reviews; never edits.**

## Status legend (mapped to the WP state model — `Wave_Template_v1.0.md`)

| Marker | State | WP model |
|---|---|---|
| `⬜` | Pending | PLANNED |
| `🟡` | In Progress | IN_PROGRESS |
| `🔵` | Ready for Review | UNDER_REVIEW |
| `🟥` | Patch Required | (review verdict) |
| `🟠` | Fixing | FIXING |
| `✅` | Approved | GREEN |
| `🟩` | Built (pre-existing) | — (under Team-4 QCT milestone track) |

**Cycle:** ⬜ → 🟡 → 🔵 → { ✅ | 🟥 → 🟠 → 🔵 … }

## Priority vocabulary

Seeded from `page_inventory.md` §13 / `SC §8` (`P0` walking-skeleton · `P1` core · `P2` later). This
board splits "later" into **P2 Important** and **P3 Nice-to-have** as an execution sub-tier — both
fold to `SC §8` P2 and coin no new corpus priority.

| Tier | Meaning |
|---|---|
| **P0** | Critical / walking skeleton |
| **P1** | MVP core |
| **P2** | Important (SC §8 "later") |
| **P3** | Nice-to-have (SC §8 "later") |

## Dependency vocabulary

`Ready` · `Blocked` · `Waiting API` · `Waiting Design` · `Waiting Decision`. Any non-`Ready` value
**cites its `esc_registry.md` handle** — the tracker records absence, never invents a contract.

## Team files

- [`team-1.md`](team-1.md) — Public / Shared / Identity (`P-PUB-*`, `P-SH-*`, `P-AUTH-*`, `P-ACC-*`)
- [`team-2.md`](team-2.md) — Buyer (`P-BUY-*`)
- [`team-3.md`](team-3.md) — Vendor / Verification / Admin (`P-VND-*`, `P-ADM-*`)

## Open dependency blocks (from `esc_registry.md`)

| Page | Dependency | Handle |
|---|---|---|
| `P-PUB-09` Industry page | Waiting API | `ESC-7-API-CATNAV` |
| `P-PUB-11` Product detail (public) | Waiting API | `ESC-7-API-PRODDETAIL` |
| `P-ACC-12` Delegation grant editor | Waiting Decision | `ESC-IDN-DELEG-EXPIRY` |
| `P-VND-10` Spec documents (upload) | Waiting API | `ESC-7-API/upload` |
| `P-VND-28` Trust & performance | Waiting Decision | `ESC-7G-SCORE-DISPLAY` (band-only interim) |
