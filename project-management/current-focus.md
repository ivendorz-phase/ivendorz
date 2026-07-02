# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-10` Permissions reference (P2) — 🟡 In Progress (P-ACC-09 ✅ committed). permissions by reference (Inv #10)
- **Status:** 🟡 building (presentation-only; read-only `list_permissions` catalog, Doc-4C §C7)
- **Next Page:** `P-ACC-11` Delegation grants (P2, Ready)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-10` RFQ detail — activity (P2) — ⬜ Pending (P-BUY-12 ✅ Approved+committed). Next buildable (sub-view of /rfqs/[id])
- **Status:** ⬜ queued to build. **P-BUY-05 DEFERRED (FLAG): catalog_favorites=product|category not vendors + IDs-only projection — owner decision needed**
- **Next Page:** `P-BUY-11` RFQ version history (P2), then `P-BUY-13` Routing log. **⚠️ P-BUY-03/04 + P-BUY-05 all DEFERRED — need OWNER decisions** (03/04 route topology; 05 favorites scope+projection)
- **Updated:** 2026-07-02
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-19` Routing rules (P2) — 🔵 Ready for Review (stage-gated control-plane list, awaiting Team-4)
- **Status:** 🔵 Ready for Review — stage-gate notice; Manage/New disabled (R5, M3-owned); illustrative rules grounded in Doc-3; no coined schema/score
- **Next Page:** `P-ADM-20` Routing rule editor (P2, Ready)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
