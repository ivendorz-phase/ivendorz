# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 14 (manual check; **2-min auto-loop STOPPED by owner**) — P-ACC-03 ✅ (RV-0034); P-ADM-11 🟥 (RV-0033, invoiceRef coined-ref MINOR). P-BUY-25 axe-pending

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-04` Organization profile (P1) — ⬜ Pending (P-ACC-03 ✅ Approved, RV-0034)
- **Status:** ⬜ queued to build
- **Next Page:** `P-ACC-05` Organization lifecycle (P2, Ready) — soft-delete (Inv #8)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-25` WCC (P2) — 🟡 In Progress (built + reviewed PASS; **axe run outstanding** — env/tooling blocked; not yet Ready)
- **Status:** 🟡 axe-pending (loop stopped by owner; resume to run axe → 🔵)
- **Next Page:** `P-BUY-26` CRM — vendor list (P2, Ready) — **buyer-private** (Inv #11)
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-11` Ad review detail (P2) — 🔵 Ready for Review (RV-0033 patched; awaiting Team-4 re-review)
- **Status:** 🔵 Ready for Review — shows opaque `platform_invoice_id` (bare UUID, DD-5), no coined INV- ref
- **Next Page:** `P-ADM-12` Verification queue (P1, Ready) — → M5 owns score (**firewall**)
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
