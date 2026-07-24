# New RFQ (P-BUY-07) — clickable prototype

**Stage-3 artifact.** The running prototype is the review surface; screenshots are audit evidence,
never the review. Non-authoritative — it coins nothing, and every field name shown is a frozen one.

```bash
npm run prototype new-rfq -- --port 8095
# → http://localhost:8095
```

*(8091–8094 are already serving other prototypes on this box.)*

- **Plan + rulings:** [`DELIVERY_PLAN.md`](DELIVERY_PLAN.md) — §3 is owner-ruled (D1–D6, 2026-07-24).
- **Acceptance gates:** `DELIVERY_PLAN.md` §5 — all ten must pass before Phase 2 opens.
- **Production surface this replaces:** `app/(app)/(workspace)/buy/rfqs/new/` +
  `app/(app)/(workspace)/buy/_components/rfq-create/`.

---

## What it demonstrates

| Ruling | In the prototype |
|---|---|
| **D1** gated Zone 1 → anchored single canvas | The landing screen is the gate: **Continue is disabled** until a category *and* a work type are chosen. No nine-step wizard. After the gate, all eight sections sit on one canvas with a sticky **section rail** (completion dot + blocker count + scroll-spy). |
| **D2** explicit save, never autosave | Dirty pip + "Unsaved changes" · **Save draft** (simulated, with a success *and* a failure state) · **Discard changes** with confirm · leave-guard modal on any nav click while dirty · `beforeunload` · an always-visible line stating *there is no autosave*. |
| **D3** two-tier requiredness + readiness | Four distinct badges — `Required to start` · `Required before submission` · `Conditionally required` · `Optional` — plus a persistent readiness panel with the three ruled states (**Not ready / Needs attention / Ready to submit**) whose every row jumps to and focuses the offending field. |
| **D3** budget correction (MAJOR) | The card is **Estimated value & priority**; the field is marked *Required before submission*. The rejected `(optional)` / `Optional — commercial guidance` wording is gone. It stays non-blocking while drafting. |
| **D5** device-local T&C bundles | Action reads **“Save as bundle on this device”**, with the ruled disclosure copy verbatim. Not called an organization template; no sync implied. |
| **D6** canonical combobox | One accessible combobox: type-ahead search, ↑/↓/Home/End/Enter/Esc/Tab, `role="combobox"` + `aria-activedescendant`, grouped options, clear button, and empty / loading / error states. Phase 3 extracts this into the kit. |

### Item requirements — an item may need more than one line

Each item is a **block**, not a table row (owner feedback 2026-07-24). The name gets its own
full-width line; `PR # · Size · Qty · Unit` sit on a second, column-aligned line with persistent
micro-labels; and any line opens a **multi-line description** beneath it — bold + three brand
colours, `Enter` adds a new line, per the owner directive of 2026-07-07. **Paste from Excel**
(tab / comma / semicolon, Append or Replace-all, unit normalisation) and the `UNIT_OPTIONS` select
are carried over from the built `item-requirements-table.tsx`. Descriptions are dev-doc capture —
they serialise with the row into `content_jsonb` and coin no contract field.

## Review chrome

- **Demo states** (top bar): `Zone 1 gate` · `Fresh draft` · `Part-filled` · `Ready` · `Save failure`.
  *Save failure* arms the failed-save path — press **Save draft** to see it.
- **Review notes** toggle shows the dashed amber annotations tying each region to its ruling and
  frozen anchor.
- **× on the banner** hides *all* prototype chrome — banner and notes together — so you can read the
  screen exactly as a buyer sees it. A **Show prototype chrome** chip appears bottom-left to restore
  it. Review chrome only; not a production affordance.

## What is deliberately absent

No production write and no fabricated server persistence — Submit and Save both say so plainly. No
vendor invitation or candidate targeting, no matching weights, no public/private toggle, no payment
terms / incoterms / tax (the **vendor** sets commercial terms), no AI drafting. The draft itself is
never written to `localStorage`; the only browser-local store is the T&C bundle library, which is
labelled as device-local because that is the ruled production behaviour.

## Illustrative vs frozen

Category options, item lines, districts and file names are **illustrative demo data**. The frozen
things they stand in for: `marketplace.list_categories.v1` (the real picker read), `category_id`,
`work_nature[]`, `estimated_value`/`currency`<BDT>, `delivery_geography`, `routing_mode`,
`scope_text`, `no_formal_spec`, `spec_document_ids[]`, and POLICY `rfq.min_scope_chars` — whose
value is server-provided and is **not** to be hardcoded in the production FE.
