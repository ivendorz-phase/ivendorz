# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-20` Platform invoices (P2) — 🟡 In Progress (P-ACC-19 ✅ committed)
- **Status:** 🟡 building (presentation-only; `list_platform_invoices` BC-BILL-5; opaque platform_invoice_id ref; ≠ trade invoices)
- **Next Page:** _(confirm from team-1.md after P-ACC-20)_
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `BX-01` Dashboard enhancement — ✅ Approved (RV-0070) + **committed 08dcb7a**. Sourcing Pipeline widget + populated dashboard; no kit/token change; axe 0 own-content.
- **Status:** ✅ BX-01 done. Ready for **BX-02** (next Buyer Experience enhancement) — awaiting owner target (RFQ/quotation presentation vs another widget). Freeze remediation still HELD (batches after sprint). Presentation-only; no backend.
- **Next Page:** BX-02 — proposed: improve RFQ detail / quotation presentation (contract-grounded). **Still owner-gated:** P-BUY-03/04 route topology + P-BUY-05 favorites scope/projection
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-24` Entitlements / bundles (P2) — ⬜ Pending (P-ADM-23 ✅ Approved, RV-0073). `bundle_plan_entitlement`
- **Status:** ⬜ queued to build — BC-BILL-1 entitlements catalog + bundling; Inv#10 type boolean/numeric/enum, slug UNIQUE; entitlements by value never plan-name; R5 (create/update_entitlement + bundle_plan_entitlement M7-owned)
- **Next Page:** `P-ADM-25` Identity ops — orgs (P2, Ready) — no active-org
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
