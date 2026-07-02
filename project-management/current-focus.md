# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-13` Workflow settings (P2) — 🟡 In Progress (P-ACC-11 ✅ committed). **P-ACC-12 SKIPPED (Waiting Decision `ESC-IDN-DELEG-EXPIRY`)**
- **Status:** 🟡 building (presentation-only; frozen `update_workflow_settings`, Doc-4C §C11)
- **Next Page:** _(confirm from team-1.md after P-ACC-13)_
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-13` Routing log / invitations (P2) — 🔵 Ready for Review (awaiting Team-4 QCT). Sub-route `/rfqs/[rfqId]/routing`; §E6.7 get_routing_log+list_invitations; NO vendor field (frozen projection governs); deferral invisible; R6 no buyer affordance; axe 0 own-content; 2 reviewers PASS/PASS 0 gating. P-BUY-11 committed 55965e7
- **Status:** 🔵 awaiting Team-4 review
- **Next Page:** **NONE BUILDABLE — Team-2 queue exhausted.** Only ⬜ left are **P-BUY-03/04/05, all DEFERRED pending OWNER decisions** (03/04 route topology; 05 favorites scope+projection). After P-BUY-13 commits, Team-2 idles until owner rules on the deferred trio or names a refinement item
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-22` Plan management (P2) — 🟥 Patch Required (RV-0063). MAJOR: list renders "Visibility"(is_active) column but `list_plans` output omits is_active (Doc-4I §HB-1.4:292 = {plan_id,name,billing_cycle,price,currency,status}); it's a get_plan/detail field. Fix → drop the column (may keep is_active as a list filter); surface it on P-ADM-23 editor
- **Status:** 🟥 Patch Required — NOT advanced; Team-3 fixes P-ADM-22 then re-flips to 🔵
- **Next Page:** `P-ADM-23` Plan editor (P2, Ready) — `activate_plan` admin-only
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
