# New RFQ — Production Correction Plan

**Status:** Open · non-authoritative companion to the frozen corpus
**Owner ruling in force:** the production `/buy/rfqs/new` page was **not accepted**; three fixes required.
**Presentation source of truth:** `prototypes/new-rfq/index.html` (the approved clickable prototype).
**Branch / worktree:** `fe/account-referral-nav` @ `E:/Projects/iVendorz-wt-newrfq` (base `d8459eb`), dev server `:3011`.
**Guardrail (unchanged):** Wave-4 writes PARKED — no `create_rfq` / `update_rfq` / `submit_rfq`, no autosave, no browser draft persistence, `estimated_value` is *Required before submission*.

> Companion to `DELIVERY_PLAN.md` (v1.1, records owner rulings D1–D6). This file tracks only the
> post-rejection correction and its acceptance gate. On any conflict, the frozen doc in
> `generatedDocs/` wins and this file is patched to match.

---

## 1. Why this plan exists

The Phase-2 build reproduced the prototype's **behaviour** (Zone-1 gate, two-tier requiredness,
readiness panel, save/discard/leave-guard) but not its **presentation**, and it did not render inside
the Buyer workspace shell. Owner directive: *"The prototype is the presentation source of truth for
this milestone. Do not create a new interpretation of the design."* Functional equivalence is
explicitly **not** sufficient.

---

## 2. The three required fixes

### Fix 1 — Visually match the approved prototype
Close every visible difference against `index.html` at matching desktop width:

- page shell + content max-width
- section hierarchy and ordering
- card / border / radius / shadow treatment
- typography scale and weight
- action placement + **sticky bottom action area**
- Zone 1 → canvas interaction
- readiness / validation presentation (right rail, 268px)
- desktop responsive behaviour (and tablet/mobile)

**Rule:** port the prototype's layout, rhythm, and chrome — do **not** re-interpret. Reuse kit
primitives; no bespoke re-implementations.

### Fix 2 — Render inside the Buyer AppShell (sidebar + workspace topbar)
The page must live inside the existing `(workspace)` shell — buyer sidebar + workspace header — with
the existing RFQ-related nav item active. **Reuse** the shared sidebar/layout components; do **not**
duplicate or hand-roll a sidebar, and do **not** render the form as a detached full-screen page.

> **Open shell-level defect (blocks Fix 2, needs its own decision):** on this branch the workspace
> sidebar `<aside>` renders on **no** Buyer route — `/buy/rfqs`, `/buy/dashboard` and `/buy/rfqs/new`
> all return zero `<aside>` in the running dev server. This is a `WorkspaceShell`-level condition
> affecting **every** Buyer and Vendor page, not the RFQ page detaching itself. It must be diagnosed
> and ruled on separately, because a fix changes the whole workspace group, not just this milestone.

### Fix 3 — Governed six-row vendor-type register ✅ DONE
`VENDOR_TYPE_OPTIONS` now **consumes** the canonical register
(`app/(app)/_components/vendor/company/vendor-type-presets.ts`) rather than a buyer-local copy.

- Value domain owned by **Doc-2 §10.3** (`Doc-2_Patch_v1.0.13_VendorTypePresetValues`, PATCH-D2-10,
  folded 2026-07-22), bound by pointer to the six rows re-frozen by `AMD-MA-VTP-1`.
- Final six values: `consultant` · `mro_retail_supplier` · `importer_equipment_seller` ·
  `manufacturer_workshop` · `engineering_firm` · `service_provider`.
- `service_provider` is a **governed** slug → **no Flag-and-Halt** needed.
- "Any" = the Select placeholder (empty string), not a preset value — no-preference never
  serialises as a governed slug.
- Only `slug` + `label` are read; capability `seeds` untouched → nothing infers matching from the
  four flags (Invariant 1).
- The replaced list held **four invented** values (`any` / `manufacturer` / `importer` /
  `distributor`) matching no register at all.

---

## 3. Ownership boundaries (must stay intact)

- Vendor type is **not** owned by the New RFQ page — consume the shared register only.
- Do not hard-code a buyer-local copy, create a new enum/module, or alter vendor-type governance.
- Do not infer matching from the four capability flags; a preset is a **label** (Invariant 1).
- No production RFQ writes; no autosave-versions; no browser persistence presented as org
  persistence; no new lifecycle states (D4).

---

## 4. Execution steps

| # | Step | State |
|---|---|---|
| 1 | Replace stale vendor-type register → consume governed six-row `VENDOR_TYPE_PRESETS` | ✅ done |
| 2 | Diagnose shell-level missing `<aside>` across the whole `(workspace)` group | ⏳ pending |
| 3 | Rule on the shell defect (separate decision — touches every workspace page) | ⏳ pending |
| 4 | Render `/buy/rfqs/new` inside the shared Buyer AppShell, RFQ nav item active | ⏳ pending |
| 5 | Port prototype presentation (shell, width, cards, typography, sticky bar, rail) | ⏳ pending |
| 6 | §5 side-by-side comparison at matching desktop width; close every visible diff | ⏳ pending |
| 7 | Re-run gates: `tsc --noEmit`, ESLint, tests | ⏳ pending |
| 8 | Capture desktop + tablet/mobile screenshots of the corrected page | ⏳ pending |
| 9 | Produce the 12-item verification report | ⏳ pending |

---

## 5. Comparison method (owner-specified)

1. Serve the prototype: `npm run prototype new-rfq -- --port 8095`.
2. Open production `/buy/rfqs/new` at the **same** viewport width.
3. Compare, region by region: AppShell / sidebar / content width / header / right rail /
   Zone 1 / cards / sticky bar / typography / spacing / responsive behaviour.
4. Close every visible difference; re-capture; repeat until they match.

---

## 6. Acceptance gate

Complete **only** when all three hold:

1. The page visibly matches the prototype (Fix 1).
2. It renders inside the Buyer sidebar / AppShell with the RFQ nav item active (Fix 2).
3. It consumes the governed six-row vendor-type register (Fix 3 — **met**).

**Do not commit** until the visual comparison **and** the vendor-type verification both pass.

---

## 7. Verification report — 12 items (to fill at acceptance)

1. Branch / worktree
2. Exact files changed
3. Shared AppShell / sidebar component reused (name)
4. Prototype-to-production differences closed
5. Vendor-type source used
6. Final six vendor-type values rendered
7. Desktop screenshot
8. Tablet / mobile screenshot
9. `tsc --noEmit` result
10. ESLint result
11. Test result
12. Confirmation: no production RFQ writes

### Current standing (as of last session)

| Item | Standing |
|---|---|
| 1 | `fe/account-referral-nav` @ `iVendorz-wt-newrfq`, base `d8459eb`, dev `:3011` |
| 2 | vendor-type change: `rfq-options.ts` (this turn) + Phase-2 surface files (prior) |
| 3 | **Not done** — shell-level `<aside>` absent group-wide; separate defect |
| 4 | **None closed** — §5 comparison not yet run |
| 5 | `_components/vendor/company/vendor-type-presets.ts` (imported, not copied) |
| 6 | ✅ `consultant` · `mro_retail_supplier` · `importer_equipment_seller` · `manufacturer_workshop` · `engineering_firm` · `service_provider` (source + tsc; not yet re-confirmed in browser) |
| 7 | Zone-1 + canvas captured earlier; **no post-change** desktop capture |
| 8 | **Not captured** |
| 9 | `tsc --noEmit` **0 errors** after vendor-type change |
| 10 | Clean at prior run; **not re-run** after this edit |
| 11 | **Not run** |
| 12 | ✅ Confirmed — no writes; Save simulated; no draft key; estimated value *Required before submission* |

**Acceptance: NOT met.** Fix 3 passes; Fix 1 and Fix 2 remain.
