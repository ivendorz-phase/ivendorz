# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 15 (manual check) — P-ACC-04 (RV-0036), P-ADM-12 (RV-0037), P-BUY-25 (RV-0038 + extraction byte-equiv verified) ✅ all Approved; all three advanced. P-ACC-03 committed (cf978e9). Auto-loop STOPPED.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-05` Organization lifecycle (P2) — 🔵 Ready for Review (awaiting Team-4 QCT)
- **Status:** 🔵 Ready for Review — soft-delete + restore (Inv #8), Owner-only typed confirm, `?state=deleted` dev-gated restore path; Doc-4C §C5; not committed
- **Next Page:** `P-ACC-06` Members (P1, Ready)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-26` CRM — vendor list (P2) — 🔵 Ready for Review (axe GREEN; 2-reviewer PASS; blacklist/approval NOT projected — undetectable)
- **Status:** 🔵 awaiting Team-4 review
- **Next Page:** `P-BUY-27` CRM — vendor detail (P2, Ready) — **never leaks** (approve/blacklist private)
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-14` Import jobs (P2) — 🔵 Ready for Review (read-only import list, awaiting Team-4)
- **Status:** 🔵 Ready for Review — frozen `import_jobs` states; "New import job" disabled (P-ADM-15 wizard); no stats/totals
- **Next Page:** `P-ADM-15` Import job — new / detail (P2, Ready) — create-then-poll (async)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
