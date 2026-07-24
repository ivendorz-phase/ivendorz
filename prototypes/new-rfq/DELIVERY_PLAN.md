# New RFQ (P-BUY-07) — Delivery Plan · UX rework + interactive build

| | |
| --- | --- |
| **Surface** | `/buy/rfqs/new` — Buyer RFQ authoring (`P-BUY-07`, template `T-WIZARD`) |
| **Version** | **v1.1 — §3 OWNER-RULED 2026-07-24** (v1.0 DRAFT raised the questions) |
| **Status** | **NON-AUTHORITATIVE** design/delivery companion. Mirrors the frozen corpus; on any conflict the frozen doc wins (CLAUDE.md §7/§11). |
| **Gate status** | `STATUS: APPROVED TO BUILD PROTOTYPE` — Phase 0 closed, Phase 1 open. |
| **Scope** | UX rework **+** interactive client build. Backend writes stay stubbed (Wave 4 PARKED). |
| **Authorities (by pointer, never restated)** | Doc-4E §E4.1/§E4.2/§E4.3 (create/update/submit contracts) · Doc-3 §1.2 (submission FIXED-set, POLICY `rfq.min_scope_chars`) · Doc-2 §5.4/§10.4 (state machine, RFQ columns) · Doc-4D `marketplace.list_categories.v1` (category read) · Doc-4M (lifecycle index) · `docs/product/requirements/buyer_planning_and_design.md` §P-BUY-07 (non-authoritative UX companion) · `docs/product/requirements/RFQ-CREATION-BUSINESS-MODEL.md` (Procurement Mode → Work Nature crosswalk) |
| **Coins** | nothing. No new field, state, event, slug, POLICY key, or contract. |

---

## 0. What this delivers

The page exists and is complete as **presentation**. It is not complete as a **product**: nothing
the buyer types is held, validated, saved, or recoverable, and the page's own notion of what is
required disagrees with the frozen submission gate.

This plan delivers three things, in order:

1. **Rulings** on six design questions (§3) that the current page answered implicitly and, in two
   cases, answered against the frozen corpus. — **Owner-ruled 2026-07-24; recorded below.**
2. **A clickable prototype** at `prototypes/new-rfq/` (Stage-3 artifact, served locally) that makes
   the reworked authoring flow reviewable before production code is touched.
3. **A production interactive build** of `/buy/rfqs/new` — real client state, two-tier validation,
   submit-readiness, draft dirty-guard, review-then-confirm — with every server write still stubbed
   behind the parked Wave-4 seam.

**Out of scope (explicitly):** the `create_rfq`/`update_rfq`/`submit_rfq` writes, real file upload,
real category data, matching, invitations, AI drafting. Each is gated in §1.

---

## 1. Frozen-vs-gated ledger

### 1.1 Buildable now — the contract shape is frozen and the FE may model it

| What | Anchor | Note |
|---|---|---|
| `category_id`, `work_nature[]`, `estimated_value`, `currency`<BDT>, `delivery_geography`, `routing_mode`, `scope_text`, `spec_document_ids[]`, `no_formal_spec` | Doc-4E §E4.1 request schema | Already modeled verbatim in `app/(app)/(workspace)/buy/_components/rfq-create/rfq-form-models.ts` — **do not re-derive, do not extend**. |
| **Create requires** `category_id` + `work_nature[]` | Doc-4E §E4.1 (`Required: yes`) | Load-bearing for D1 — a draft cannot exist server-side until these two are set. |
| **Submission FIXED-set** — category active · `work_nature` non-empty · `estimated_value` > 0 BDT · delivery ≥ district · `routing_mode` set · (≥1 spec attachment **or** `no_formal_spec` + scope ≥ `rfq.min_scope_chars`) · specs reference an active revision | Doc-3 §1.2; Doc-4E §E4.3 stage-8 BUSINESS | The single source of "what does Submit need". The FE **mirrors** it for guidance; the server enforces it. |
| Edit appends a version + **mandatory `revision_reason`** | Doc-4E §E4.2 | Load-bearing for D2 (no autosave). |
| Category taxonomy read | `marketplace.list_categories.v1` → `GET /marketplace/categories`, **public**, cursor-paginated (Doc-4D PassA; Doc-5D Pass1 #18) | A frozen read contract **exists** — the picker is not blocked on governance, only on seeded data. |
| Devices **D/T** for this surface; `MB-WIZARD` = one step per screen | `buyer_planning_and_design.md` §PI 13.5 / §Mobile | Phone is graceful degrade, never phone-primary. |

### 1.2 Gated — do not build past the seam

| Gate | Blocks | Status |
|---|---|---|
| **Wave 4 write-wiring milestone (PARKED)** | all three writes; the GI-02 server data layer | Owner un-gating required. Phase 4 below. |
| `[ESC-7-API/upload]` | real spec-document upload → `file_ref` | Attachments stay a presentation list. |
| Category taxonomy **seeding** — human P1 approval | real category options in the picker | Contract is frozen; the 794-node tree is not seeded. Picker runs on a stub adapter. |
| POLICY `rfq.min_scope_chars` *[start: 200]* | the exact counter threshold | FE must **not** hardcode `200`. Server-provided prop; until wiring, one named constant at the seam. |
| Org-owned reusable commercial terms | a shared T&C library | **Future governed capability — not part of this milestone** (D5). |

---

## 2. Current repo state (the starting line)

`app/(app)/(workspace)/buy/rfqs/new/page.tsx` → `RfqCreateView` → 11 files, 2 167 lines under
`buy/_components/rfq-create/`. Rendered at 1440px it is a **~3 400px single-column scroll** of nine
stacked cards: Requirement details · Technical requirements · Attachments · Terms & conditions ·
Delivery requirements · Vendor preferences · Budget & priority · Communication preferences, plus a
sticky Save-draft/Submit bar.

Honest inventory of what is and is not there:

- **Server Component, uncontrolled inputs.** Every field is `defaultValue`/`defaultChecked`. No
  state, no `onChange`, no validation, no submit. Typing into the page and navigating away loses
  everything, silently.
- **Two islands of real client state exist already** — `SubmitPreview` (review dialog) and
  `TermsConditionsSection` (row add/remove + `localStorage` bundles). Everything else is inert.
- **The stepper was dropped.** `wizard-stepper.tsx` still ships from this folder but is consumed
  only by the **Award** view. `buyer_planning_and_design.md:719` specifies P-BUY-07 as `T-WIZARD`
  — *stepper · sticky save-bar · per-step `field_errors` · `SK-WIZARD`*. The page is a single
  scroll. That divergence is resolved by **D1**.
- **The required-marks disagree with the frozen gate.** The page asterisks Category, Request type,
  Item name, Qty, Delivery district, Routing — and heads the budget card **"Budget & priority
  (optional)"** with the helper *"Optional — commercial guidance."* Doc-3 §1.2 puts
  `estimated_value` present-and-`> 0`-BDT **inside the submission FIXED-set**. Rejected by **D3**.
- **The `no_formal_spec` path is unguided.** The checkbox is there; the ≥ `rfq.min_scope_chars`
  consequence it triggers is nowhere on the page.
- **Kit gaps are papered over buyer-locally.** The kit ships no `select`/`checkbox`/`radio`/
  `textarea` primitive; `buy/_components/form-controls.tsx` supplies them (correctly scoped, and
  self-registered as a promotion candidate). A real category **combobox** does not exist anywhere.

A full-page reference capture is at `.playwright-mcp/rfq-new-full.png` (1440 × 3406, 2026-07-24).

---

## 3. Design decisions — **OWNER-RULED 2026-07-24**

```text
D1  APPROVED WITH CONSTRAINTS      D4  ACKNOWLEDGED — mandatory guardrails
D2  APPROVED                       D5  APPROVED
D3  APPROVED                       D6  APPROVED
```

Raised as questions in v1.0 under Raise ≠ Accept (§13); adjudicated by the owner. The rulings below
are binding on Phases 1–3.

---

### D1 — Authoring shape — **APPROVED WITH CONSTRAINTS**

**Ruled:** adopt *gated Zone 1 → anchored single-canvas authoring workspace → review and submission
gate*. **A conventional nine-step wizard is not to be implemented.**

**Zone 1 gate** collects the minimum for a valid draft — `category_id` and at least one valid
`work_nature[]` value. *The user cannot enter the full authoring canvas until this gate is
satisfied.* (This is the corpus-imposed seam: Doc-4E §E4.1 marks both fields `Required: yes`, so no
draft can exist without them.)

**Main canvas**, after Zone 1, must: show all major RFQ sections on one navigable canvas · provide a
persistent section rail · support direct navigation between sections · show section completion and
error state · use a sticky action bar · preserve full-document readability.

**T-WIZARD disposition (ruled):**

```text
T-WIZARD intent:            Approved presentation:
guided authoring            gated entry + anchored single canvas
visible progress
sticky actions
per-section error navigation
```

The existing 3 400px undifferentiated scroll is **not accepted**. The stepper specification at
`buyer_planning_and_design.md:719` is to be marked **“refined by this ruling”** — neither silently
ignored, nor treated as still requiring a classic wizard. *(Companion-doc annotation is a Phase-2
deliverable; the companion is non-authoritative, so this is an editorial note, not a corpus patch.)*

### D2 — Draft persistence — **APPROVED**

```text
Autosave: prohibited          Dirty-state indicator: required
Explicit Save Draft: required Leave guard: required
```

**Reason (ruled):** `update_rfq` creates a new version and requires a `revision_reason` (Doc-4E
§E4.2); autosaving ordinary field changes would create excessive versions and degrade the RFQ
evidence history (Doc-2 §5.4, Inv #8).

**Required interaction** in prototype *and* production interactive layer: `Save draft` · unsaved-
change indicator · leave-page confirmation · **discard-changes action** · save success **and
failure** states · last-saved information where available.

**Revision reason:** do **not** prompt on every local edit. The governed revision-reason interaction
for an explicit save is **determined at backend-wiring time** (Phase 4). Until wired, the frontend
may simulate save behaviour but **must not imply silent server persistence**.

**Prohibition:** `localStorage` is **not** a substitute for the organization-owned RFQ draft. Local
browser state may support a prototype demonstration or temporary unsaved recovery only, **clearly
labelled as non-production behaviour**.

### D3 — Two-tier requiredness and readiness — **APPROVED**

**Tier 1 — draft-entry requirements** (pass Zone 1, establish the authoring context): category ·
work nature.
**Tier 2 — submission requirements**: only before submission, per the frozen submission FIXED-set
and applicable conditional rules.

The UI must distinguish, explicitly and **not** collapsed into one generic red asterisk:

```text
Required to start
Required before submission
Optional
Conditionally required
```

**Readiness panel — approved, persistent.** Shows: blocking submission issues · incomplete required
sections · warnings that do not block submission · links to the affected section or field · overall
submission readiness. States:

```text
Not ready        Needs attention        Ready to submit
```

These are **presentation states only** — they must never be persisted as new RFQ lifecycle states
(Doc-2 §5.4 owns the states; this coins none).

**Budget contradiction — existing wording REJECTED.** Remove `Budget & priority (optional)` and
`Optional — commercial guidance`. Where `estimated_value` belongs to the frozen submission FIXED-set
and must be present and `> BDT 0`, the interface states:

```text
Estimated value
Required before submission
```

It may remain **non-blocking while drafting**, but it cannot be represented as optional. **This
MAJOR correction is mandatory in both the prototype and the production interactive build.**

### D4 — Build guardrails — **ACKNOWLEDGED, mandatory and non-discretionary**

Enforced throughout: no production RFQ writes · no backend un-gating · no new lifecycle states · no
alteration of RFQ ownership · no silent contract reinterpretation · no payment-handling implication
· no fabricated matching or vendor eligibility behaviour · no autosave that creates versions · no
browser persistence presented as organization persistence.

Carried forward from the v1.0 raise, unchanged and still binding: no vendor invitation or candidate
targeting (R6; `[ESC-7-7F-INVITE]`) · no matching weights or scoring inputs · no public/private
toggle — RFQs are never published (Doc-3 §5.1; the existing "Privacy by Design" callout is the
correct treatment and stays) · no payment terms / incoterms / tax — the **vendor** defines
commercial terms (Board 2026-07-01) · no AI drafting on this surface · "Preferred vendor" is a
**hint**, never a dispatch.

Phase 2 may implement a complete interactive client surface with **deterministic mocked behaviour**.
Phase 4 remains parked until Wave 4 is explicitly un-gated.

### D5 — Terms & conditions bundle storage — **APPROVED (option a: keep, disclose accurately)**

Keep the browser-local capability; rename the action to **“Save as bundle on this device”** (or
“Save to this device”), with supporting text:

```text
Available only in this browser on this device.
It is not shared with other members of your organization.
```

**Constraints (ruled):** do not call it an organization template · do not imply cloud sync · do not
treat it as the authoritative organization contract store · **do not open a new escalation solely
for the prototype** · do not promote this device-local store into backend scope during Phase 2.

**Recorded:** organization-owned reusable commercial terms is a **future governed capability**, not
part of the current RFQ milestone (see §1.2).

### D6 — Combobox ownership — **APPROVED**

Promote **one canonical accessible combobox** into the shared UI kit. Do **not** create another
buyer-local category picker primitive.

**Kit component requirements:** keyboard navigation · search · empty state · loading state · error
state · clear selection · disabled state · long industrial category labels · controlled value ·
accessible labelling and focus management · optional grouping where the category model requires it.

**Ownership rule:**

```text
Shared interaction primitive  →  UI kit owns
RFQ category rules and data   →  RFQ/application layer owns
```

The kit must **not** own: category eligibility · RFQ validation · category hierarchy semantics ·
matching behaviour · business defaults.

**Sequencing:** Phase 1 may use the prototype implementation; **Phase 3 extracts and promotes it
once its interaction behaviour is validated.**

---

## 4. Approved phase sequence

### Phase 0 — Record rulings and correct the planning document ✅ **CLOSED 2026-07-24**
- §3 replaced with the owner rulings above; §1.2, §2, §6, §7 reconciled to them.

### Phase 1 — Clickable prototype *(Stage-3 — **open**)*
- `prototypes/new-rfq/index.html` — single-file, static, illustrative seed data, **frozen field
  names only**. Served via `npm run prototype new-rfq -- --port 8095` (8091–8094 are taken).
- Must satisfy the ten acceptance gates in §5 before Phase 2 opens.
- Deliverables: `README.md`, `DELIVERY_PLAN.md` (this file), `index.html`, and post-approval
  `_screenshots/`. Stage-4 review happens on the **running** prototype, not on screenshots.

### Phase 2 — Production interactive frontend *(no production writes)*
- Convert `RfqCreateView` from a Server-Component form into a **server shell + one client form
  surface**: a single `RfqDraftForm` state object (the existing model, unchanged), controlled
  fields, per-field and per-section validation derived from the §1.1 FIXED-set table.
- Ship: Zone-1 gate · section rail · readiness panel (D3 states) · scope meter · dirty indicator +
  leave-guard + discard · corrected budget requiredness · save success/failure states · D5 relabel.
- Keep and reuse, do not rewrite: `RfqPreviewDocument`, `ItemRequirementsTable`, `UploadArea`, the
  privacy callout.
- Annotate `buyer_planning_and_design.md:719` as *refined by D1*.
- Gates before it is called done: `/fe-checklist` · `/ivendorz-fe-design` · `/review-a-lens` ·
  `/ivendorz-verify-fe` (8-layer, incl. the loading/empty/error/success matrix) · CI as the build
  oracle — no GREEN claim on a `tsc` proxy.

### Phase 3 — Promote the validated combobox to the shared kit
- Extract the Phase-1/2 combobox into `src/frontend/primitives/` against the D6 requirement list;
  take the already-registered `Textarea`/`Select` promotion in the same pass; buyer-local
  `form-controls` becomes a re-export, then retires. Registry entry in
  `docs/frontend/components/shared_platform_component_registry.md`.

### Phase 4 — Wire `create_rfq` → `update_rfq` → `submit_rfq` *(GATED — only after Wave-4 owner un-gating)*
- `create_rfq` at the Zone-1 gate → `human_ref` shown · `update_rfq` on explicit Save (with
  `expected_version_no` + the governed revision-reason interaction determined here, per D2) ·
  `submit_rfq` with a stable idempotency key · `409 CONFLICT` → re-read then retry (GI-10) ·
  `BUSINESS` failures from the FIXED-set mapped back onto the readiness panel · real category read
  via `marketplace.list_categories.v1` · upload once `[ESC-7-API/upload]` resolves.
- Resumable draft reopens the same RFQ (`buyer_planning_and_design.md:418` — version preserved).

---

## 5. Prototype acceptance gates (Phase 1 → Phase 2)

| # | Gate |
|---|---|
| 1 | Zone 1 prevents entry without category and work nature. |
| 2 | The main canvas supports direct section navigation. |
| 3 | Required-to-start and required-to-submit are visibly distinct. |
| 4 | Estimated value is correctly shown as required before submission. |
| 5 | Explicit save and dirty leave-guard are demonstrated. |
| 6 | No autosave behaviour is implied. |
| 7 | The readiness panel links blockers to their fields. |
| 8 | Device-local terms bundles are accurately labelled. |
| 9 | The canonical combobox is keyboard accessible. |
| 10 | No production write or fabricated server persistence occurs. |

**Builder self-check, 2026-07-24** — all ten exercised in a browser against the served prototype
(`:8095`): Continue stays disabled with only a category (1); rail + scroll-spy navigate (2); four
distinct badges render (3); estimated value carries *Required before submission* (4); explicit save
→ "All changes saved", then a nav click while dirty raises the leave-guard, and `beforeunload` fired
on reload (5); the no-autosave line is always visible and `localStorage` holds **no** draft key (6);
clicking *Routing breadth* scrolled to the section and focused `#routing` (7); the bundle action
reads "Save as bundle on this device" with the ruled disclosure (8); the combobox was driven to
selection by keyboard alone with `role=combobox` + `aria-activedescendant`, and its loaded/loading/
error/empty states are all reachable (9); Save and Submit both state they are simulated (10).
One defect found and fixed during the check: `[hidden]` was losing to `display:flex`, so the action
bar rendered on the Zone-1 gate. **This is the builder's check, not the Stage-4 review** — the gate
closes when the review team runs the prototype.

**Review finding — items, raised by the owner 2026-07-24, FIXED.** The first cut squeezed each item
onto a single table row and dropped the per-line **Description** entirely — a regression against the
owner directive of 2026-07-07 (multi-line description, bold + three colours, `Enter` adds a new
line) and against the built `item-requirements-table.tsx`, which also carries **Paste from Excel**
and a `UNIT_OPTIONS` select. All three were restored, and the row was rebuilt as a **block**:

- **an item may need more than one line** — every line opens a multi-line description beneath it,
  collapsed by default so simple items stay compact;
- the item **name** now occupies its own full-width line (it was being truncated at ~148px between
  the rail and the readiness panel); `PR # · Size · Qty · Unit` sit on a second, column-aligned line
  with persistent micro-labels, so a long list still scans like a table;
- **Paste from Excel** restored — tab / comma / semicolon, 5-column (with Description) / 4-column /
  3-column shapes, unit-token normalisation, and an Append vs Replace-all choice;
- **Unit** is a select over the `UNIT_OPTIONS` list again, not free text.

The description is dev-doc capture: it serialises with the row into `content_jsonb` and coins no
contract field. Verified: 5 lines (2 seeded + 3 pasted) renumber correctly, pasted descriptions
auto-open, colour formatting applies to a selection, and the review document renders each item's
description under its name with formatting intact.

**Review finding — viewport & chrome, raised by the owner 2026-07-24, FIXED.** Two defects, both
only visible below a ~760px-tall viewport, which is most real laptops:

1. **The readiness panel's last rows were unreachable.** The panel is 743px tall and
   `position:sticky`; on a 689px viewport its bottom — the warnings tail and the "presentation
   states only" footnote — was cut off for the entire scroll of the form. **A sticky column must
   never exceed the viewport.** Both sticky columns are now capped to
   `calc(100vh - 88px)` (the gap between the top offset and the sticky action bar); the readiness
   card keeps its header and footnote pinned and scrolls only the item lists. This is a **carry-in
   for Phase 2** — the production build inherits the same three-column layout and the same trap.
2. **The prototype chrome could not be turned off.** Only the amber notes had a toggle; the banner
   itself was permanent, so the screen could never be read as a buyer sees it. Added a dismiss on
   the banner that hides banner *and* notes together, with a floating "Show prototype chrome" chip
   to restore. Applies to this prototype's review chrome only — it is not a production affordance.

Fixing (1) surfaced a third: the action bar wrapped to two rows below ~1500px, doubling its height
and eating the clearance under the last section. The no-autosave disclosure now shortens instead of
wrapping — it never disappears, since D2 requires it to be stated.

**Review finding — the preview, raised by the owner 2026-07-24, FIXED.** The review document showed
**6 fields out of ~29**: category, work nature, estimated value, district, required-by, routing,
plus items, scope, attachments and terms. Everything else the buyer had typed — brand, alternative
brand, condition, standards, certifications, delivery site/location/instructions, preferred vendor,
financial tier, verified-only, accept-alternatives, urgency, special instructions, contact person,
contact number, preferred contact time, channels — was captured by the form and then **silently
dropped from the document the buyer is asked to approve**. A review step that hides two-thirds of
the request cannot do its job.

The preview is now the **whole RFQ at a glance**:

- an **at-a-glance band** across the top — estimated value · delivery district · required by ·
  routing — the four facts a buyer checks first, with missing submit-required ones called out in
  red rather than left blank;
- **nine sections**, every captured field rendered, in a two-key-per-line layout so the document
  stays scannable rather than becoming a long ladder;
- **honest empties** — optional blanks read `—`, submit-required blanks read *Required before
  submission* in red, and the key-facts band mirrors them. Verified on the part-filled draft:
  2 red required marks, 17 muted optional blanks, Submit disabled with the three-item reason;
- **the notes that keep the document truthful stay attached** — "preferences are hints, the
  matching engine decides who is invited" under routing, and "payment terms, incoterms and tax are
  set by the vendor" under commercial guidance.

Four fields were also missing from the **form** itself against the built page — certifications,
delivery instructions, special instructions, preferred contact time. All four restored, so form and
preview now cover the same ground.

**Disclosure boundary — found while widening the preview; fixed, and one question is OWED.** The
built `rfq-preview-document.tsx` closes with *"Routing preferences, budget and priority guidance
stay internal — vendors do not receive them with this RFQ,"* and deliberately omits them. The
widened preview had put routing, preferred vendor, financial tier and estimated value into a
document captioned *"as invited vendors will receive it"* — which would have told the buyer that
vendors see their budget and their routing breadth.

The preview is now split by an explicit **lock line**: everything above it is what an invited vendor
receives (requirement · items · specification · attachments · terms · delivery · communication);
everything below is tagged **internal** (vendor routing · commercial guidance) under the banner
*"Internal — not sent to vendors."* Verified both directions: nothing above the line is tagged
internal, everything below it is.

**OPEN — Board ruling owed: is `estimated_value` disclosed to an invited vendor?** No Flag-and-Halt:
nothing here conflicts with a frozen document. `rfq.get_rfq.v1` (Doc-4E §PassA) returns an "RFQ
projection (**scope per grant**)" and leaves the vendor-side field masking to **dev-doc scope**, so
the corpus does not settle it. But two surfaces disagreed in writing, and Doc-3 §1.2's material-edit
rule (a change to **value** re-notifies invited vendors and resets their response clock) reads as
though value is something invited vendors are told about. Until it is ruled, both prototype and
production take the **conservative** line — internal-only, and the estimated-value helper no longer
claims the figure is "guidance to vendors."

---

## 6. Invariants held throughout

- **Inv #5** — the browser never sets `Iv-Active-Organization`; org context is server-resolved.
- **Inv #9** — Content ≠ Presentation: the dev-doc capture (items, brand, standards, delivery
  detail, communication) serializes into `scope_text` / `delivery_geography` /
  `rfq_versions.content_jsonb`; it never coins a contract field.
- **Inv #8** — edits append versions; nothing authoritative is overwritten (drives D2).
- **Inv #12 / R6** — the engine matches and routes; the buyer sets *breadth* (`routing_mode`) and
  hints, never weights, never a winner, never an invitation.
- **R8** — no money moves; budget is guidance, commercial terms are the vendor's.
- **One Module, One Owner** — this surface reads M2 categories through the public M2 read contract
  only; it never touches marketplace tables.

---

## 7. Gate summary

| Gate | Blocks | Status |
|---|---|---|
| D1–D6 rulings | Phases 1–3 | ✅ **RULED 2026-07-24** |
| Prototype acceptance gates (§5) | Phase 2 | open |
| Wave-4 un-gating | Phase 4 entirely | **PARKED** — owner |
| `[ESC-7-API/upload]` | real attachments | governance track |
| Category P1 seeding | real picker *data* (not the picker) | owner |

## 8. Open items

1. **`revision_reason` for draft edits** — a buyer saving a draft has no meaningful "reason". Per
   D2 this is **deferred to Phase 4**, where the governed interaction is determined against Doc-2
   §10.4's mandatory column. Until then the FE simulates save without implying server persistence.
2. **Procurement Mode labels** — `RFQ-CREATION-BUSINESS-MODEL.md` §2 is a **DRAFT v1.0**
   non-authoritative companion. Using its nine buyer-facing labels in Zone 1 is a presentation
   choice mapping onto frozen `work_nature`; confirm the Board is content to surface them before
   the crosswalk doc itself is ratified. *(Prototype shows them; flag stays open.)*
3. **Devices** — P-BUY-07 is D/T. Confirm the phone treatment target (`MB-WIZARD`, one step per
   screen) is a Phase-2 deliverable and not deferred.
4. **Organization-owned reusable commercial terms** — recorded as a future governed capability
   (D5); no escalation opened for this milestone.
5. **Is `estimated_value` disclosed to invited vendors?** — **Board ruling owed.** The corpus leaves
   the vendor-side projection to dev-doc scope (`rfq.get_rfq.v1`, "scope per grant"); the built
   preview says internal, Doc-3 §1.2's material-edit rule hints otherwise. Both surfaces now take
   the conservative internal-only line. The same question applies to `routing_mode`, which the built
   document also treats as internal. **This is a disclosure decision, not a layout one** — it should
   be ruled before Phase 4 wires the vendor-side read.
