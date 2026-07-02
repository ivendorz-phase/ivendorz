# Current Focus — execution pointer (READ THIS FIRST)

> The one file an agent reads at the **start of every session**. It holds only the active pointer
> per team — do **not** scan the 100-row team files to decide what to build. The team files
> (`team-1.md` / `team-2.md` / `team-3.md`) remain the **source record**; this file is the
> **pointer**. Keep it tiny. On any change, also update the owning team file + `changelog.md`.

**Updated:** 2026-07-02 · **Sprint:** Review cycle 18 (auto-check ~5min) — P-BUY-27 (RV-0043, CRM non-disclosure), P-ACC-06 (RV-0044), P-ADM-15 (RV-0045) ✅ all Approved; all three advanced. CRM pair (P-BUY-26/27) + verification pair + import pair complete.

---

## Team-1 — Public / Shared / Identity

- **Current Page:** `P-ACC-11` Delegation grants (P2) — 🟡 In Progress (P-ACC-10 ✅ committed)
- **Status:** 🟡 building (presentation-only; T-LISTING `list_delegation_grants`, Doc-4C §C9)
- **Next Page:** `P-ACC-12` Delegation grant editor (P2, Waiting Decision — `ESC-IDN-DELEG-EXPIRY`)
- **Updated:** 2026-07-02

## Team-2 — Buyer

- **Current Page:** `P-BUY-11` RFQ version history (P2) — ⬜ Pending (P-BUY-10 ✅ Approved, RV-0056). versioned (Inv #8)
- **Status:** ⬜ queued to build — then `P-BUY-13` Routing log
- **Next Page:** `P-BUY-13` Routing log / invitations (P2) — no excluded vendor shown. **⚠️ P-BUY-03/04 + P-BUY-05 DEFERRED — OWNER decisions pending**
- **Updated:** 2026-07-02
- **Updated:** 2026-07-02

## Team-3 — Vendor / Verification / Admin

- **Current Page:** `P-ADM-20` Routing rule editor (P2) — 🔵 Ready for Review (stage-gated per-rule editor, awaiting Team-4)
- **Status:** 🔵 Ready for Review — Save/Enable/assist_routing disabled (R5, stage-gated); params from core.system_configuration (no coined schema); notFound Inv #11
- **Next Page:** `P-ADM-21` Matching results (internal) (P2, Ready) — internal-service leg only
- **Updated:** 2026-07-02

---

_Team-4 (QCT) has no build pointer — it reviews `🔵 Ready for Review` pages only._
