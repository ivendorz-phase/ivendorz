# iVendorz — Deferred Frontend Governance Decisions

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — Deferred Decisions Register (non-authoritative companion)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (deferred-work annotation)
**Companions:** [`shared_conventions.md`](shared_conventions.md) · [`landing_page_spec.md`](landing_page_spec.md) · [`design_philosophy.md`](design_philosophy.md)

---

## 0. Precedence & Authority (read first)

Non-authoritative companion. It **records decisions that were intentionally deferred or rejected** so
they are neither lost nor acted on prematurely. A deferred *architecture* decision is **governance, not
implementation** — it carries a trigger condition and a named owner, and it **coins nothing**. Precedence:

```
Master → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                        ▲ this doc conforms upward
```

On any conflict the frozen corpus wins. ESC handles → [`esc_registry.md`](esc_registry.md).

---

## 1. Deferred — revisit when the trigger fires

| ID | Decision | Status | Trigger to revisit | Current location |
|---|---|---|---|---|
| **DEF-01** | **Command Center extraction** → a standalone `command_center_spec.md` | Deferred | A **second surface reuses** the command center, or it changes independently of the landing page | Lives in `LP §2` (`SEC-COMMAND-CENTER`), **marked "Extractable Unit"** |
| **DEF-02** | **Document modularization** (split large specs into `landing/ · buyer/ · vendor/ · admin/ · shared/` folders) | Deferred | A doc exceeds **~1500 lines**, OR **multiple authors edit concurrently**, OR a doc **changes independently** of the rest | Single-file today; largest are `LP` (~935) and `SS` (~799) — under threshold |
| **DEF-03** | **Light-default code reconciliation** (`app/globals.css` / `tailwind.config.ts` ship dark-default; `DP §3.1` sets light-primary) | Deferred to a dedicated frontend theming work package | When the theming work package is opened | `DP §0`/`§3.1`; demo realized in `information_architecture_demo.html` |

> **Rule:** do **not** perform DEF-01/02 ad hoc. They are tracked here precisely so a future session
> doesn't fragment the docs (DEF-02) or extract a single-use unit (DEF-01) before reuse justifies it.

---

## 2. Rejected — recorded so they are not re-raised

| ID | Proposal | Disposition | Why |
|---|---|---|---|
| **REJ-01** | A separate `ai_ui_governance.md` | **Rejected** | Would duplicate the canonical AI-UI governance already in `UX §5.5` + `IA §4.10` (`GI-11`). Those remain the single source; other docs reference them. |
| **REJ-02** | Authoring QA / acceptance / a11y / performance criteria inside the frontend specs | **Rejected (as authoring)** | **Testing is Doc-8's** ownership. Specs carry a **"Test → Doc-8"** pointer only (`SC §8`), never the criteria themselves. |

---

## 3. Open questions — awaiting board adjudication (Raise ≠ Accept)

From `LP §19.3` — raised, **not** accepted; each needs a product/board ruling, and any resolution that
needs a new contract goes through its `ER` channel (never coined locally):

| ID | Question | Bound gap |
|---|---|---|
| **OQ-01** | Marketplace Statistics — omit entirely vs show only contract-provided facet counts | `ESC-7-API/stats` |
| **OQ-02** | Customer Success — static testimonials vs a `list_reviews` read | (needs a public reviews read if dynamic) |
| **OQ-03** | Trust-strip aggregate counts — disclosure safety (must not enable re-identification) | Invariant #11 / `GI-12` |

---

## 4. Governance Alignment

This register restates no authority and coins nothing; it points to `SC`/`ER`/`LP`/`DP` and the frozen
corpus. Deferred and rejected items are **governance records** — revisit DEF-* only on their trigger;
treat REJ-* as settled unless the corpus changes; route OQ-* through the board.

---

*Non-authoritative. Conforms upward; coins nothing. On any conflict the frozen document wins and this
file is patched to match.*
