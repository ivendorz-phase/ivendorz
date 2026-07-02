# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-09` Role editor (P2) — 🔵 Ready for Review (awaiting Team-4 QCT)
- **Status:** 🔵 Ready for Review — create+edit role editor; permissions by slug (Inv #10); system read-only; delete-confirm; unknown→404; Doc-4C §C7; not committed
- **Next Page:** `P-ACC-10` Permissions reference (P2, Ready) — permissions by reference (Inv #10)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-05` Favorites (P2) — ⬜ Pending (P-BUY-12 ✅ Approved, RV-0052). /favorites nav-bound
- **Status:** ⬜ queued to build — then P-BUY-10/11/13 (RFQ sub-views)
- **Next Page:** `P-BUY-10` RFQ detail — activity (P2, Ready). **⚠️ P-BUY-03/04 DEFERRED — need OWNER route-topology decision** (in-app vendor directory/profile: /discover mode vs /vendors vs tab)
- **Updated:** 2026-07-02
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-18` Outreach contacts (P3) — 🟥 Patch Required (RV-0051): cross-campaign contacts list has no frozen read (`list_outreach_contacts` doesn't exist) — flag the read-gap+ESC (as ENG-03) OR rescope to P-ADM-17 detail, then re-review
- **Status:** 🟥 Patch Required — stays with Team-3 (one-flag/rescope fix; rest fine; P-ADM-19 blocked)
- **Next Page:** `P-ADM-19` Routing rules (P2, Ready) — stage-gated
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
