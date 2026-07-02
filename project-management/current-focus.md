# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-21` Platform invoice detail (P2) — 🟡 In Progress (P-ACC-20 ✅ committed). `get_platform_invoice`
- **Status:** 🟡 building (presentation-only; get_platform_invoice §HB-5.4; human_ref/purpose/payments; NO line_items/file_ref coined; notFound)
- **Next Page:** _(confirm from team-1.md after P-ACC-21)_
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `BX-02` RFQ detail presentation — ✅ Approved (RV-0075) + **committed 9625340**. Overview: work_nature chips (Inv#1), routing_mode observe-only (R6), version + history cross-link (Inv#8); no kit/token change.
- **Status:** ✅ BX-02 done + committed. Ready for **BX-03** (next enhancement — awaiting owner target). Freeze remediation still HELD (batches after sprint). Presentation-only; no backend.
- **Next Page:** BX-03 (owner target). **Still owner-gated:** P-BUY-03/04 route topology + P-BUY-05 favorites scope/projection
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-26` Identity ops — users (P2) — ⬜ Pending (P-ADM-25 ✅ Approved, RV-0077). no active-org
- **Status:** ⬜ queued to build — admin user-ops (M8→M1 boundary, R5); `set_user_account_status`; watch same admin-list read-binding gap (RV-0077) + firewall
- **Next Page:** `P-ADM-27` Suggestion triage (P3, Ready) — non-disclosure
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
