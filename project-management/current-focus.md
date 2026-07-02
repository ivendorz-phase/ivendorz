# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-08` Roles (P2) — 🟡 In Progress (P-ACC-07 ✅ committed)
- **Status:** 🟡 building (presentation-only; T-LISTING; frozen `list_roles`, Doc-4C §C7)
- **Next Page:** `P-ACC-09` Role editor (P2, Ready)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-03` Vendor directory (in-app) (P2) — ⬜ Pending (P-BUY-02 ✅ Approved, RV-0048). Also VendorCard (now AA-clean via PLAT-P7)
- **Status:** ⬜ queued to build. **PLAT-P7 CLOSED** (kit fix Team-4-verified; commits with P-BUY-02)
- **Next Page:** `P-BUY-04` Vendor profile (in-app) (P2, Ready) — trust read-only
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-17` Campaign detail (P3) — 🔵 Ready for Review (campaign + contacts, awaiting Team-4)
- **Status:** 🔵 Ready for Review — Run/Complete disabled (R5); contacts (jsonb stage illustrative); moat acquisition-only; notFound Inv #11
- **Next Page:** `P-ADM-18` Outreach contacts (P3, Ready)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
