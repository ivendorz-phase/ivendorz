# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 17 (auto-check ~5min) — P-BUY-26 (RV-0040, non-disclosure crux) & P-ACC-05 (RV-0041) ✅ Approved; P-ADM-14 under review. Commits landing (P-ACC-03/04, P-ADM-12/13, P-BUY-25).

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-06` Members (P1) — ⬜ Pending (P-ACC-05 ✅ Approved, RV-0041)
- **Status:** ⬜ queued to build
- **Next Page:** `P-ACC-07` Invite member (P1, Ready)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-27` CRM — vendor detail (P2) — ⬜ Pending (P-BUY-26 ✅ Approved, RV-0040). **never leaks** (approve/blacklist private, Inv #11)
- **Status:** ⬜ queued to build
- **Next Page:** — (CRM cluster tail; P-BUY-27 is the last buyer page in the tracker)
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-15` Import job — new / detail (P2) — ⬜ Pending (P-ADM-14 ✅ Approved, RV-0042). create-then-poll (async)
- **Status:** ⬜ queued to build
- **Next Page:** `P-ADM-16` Outreach campaigns (P3, Ready) — acquisition only
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
