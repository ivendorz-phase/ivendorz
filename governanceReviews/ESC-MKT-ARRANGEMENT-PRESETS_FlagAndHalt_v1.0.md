# Flag-and-Halt — Section-arrangement presets vs. the vendor-type label prohibition

| | |
|---|---|
| **Handle** | `ESC-MKT-ARRANGEMENT-PRESETS` |
| **Status** | ✅ **CLOSED — RULED 2026-07-20 (owner): Option B.** Raised, halted, escalated, ruled, verified |
| **Raised** | 2026-07-20, Review-A finding **B1** on the DS-W0-R1 production convergence |
| **Severity** | **BLOCKER** (§13 ladder) — cleared |
| **Decided by** | Owner (§7). Not resolved locally at any point |
| **Blocked** | Rendering the section-arrangement starting points in the production vendor workspace. Nothing else — the journey, template picker, per-section order/visibility and publishing were unaffected throughout |
| **Artifacts** | `app/(app)/_components/vendor/microsite/microsite-builder.tsx` (ruling + binding semantics, in place) · `prototypes/digital-showcase-workspace/` v0.2 (retains business-shape labels; non-authoritative, tagged GUIDANCE) · `docs/product/requirements/digital_showcase_planning_and_design.md` §3A.0, Disposition Log v0.9 |

---

## 0. RULING (owner, 2026-07-20) — Option B

> **Keep the mechanism, rename presets around presentation emphasis rather than vendor type.**

Approved semantics, all binding on the wiring pass:

- presets only reorder and toggle governed `profile_sections`;
- they never change the selected template;
- they never persist or infer vendor type;
- they never create Services or Departments aggregates;
- they are user-triggered, reversible, and non-binding;
- **applying one must show exactly what changed.**

**Approved labels** (implemented verbatim): `Balanced overview` · `Lead with capabilities` ·
`Lead with catalogue` · `Lead with delivered work` · `Lead with products and capabilities` ·
`Reset to default order`.

**Prohibited labels** (must never return): `Manufacturer` · `Engineering service` · `Retailer` ·
`Trader` · `Hybrid vendor`.

### Implementation state (verified 2026-07-20)

Presets restored to production with the approved labels, rendered **disabled**. Disabled is not a
placeholder choice — it is required by the ruling's own last clause: with no sections read and no
`update_profile_sections.v1` wired there is nothing to reorder and **no diff to show**, so an
enabled control could not satisfy "applying one must show exactly what changed". They become
interactive in the same pass that wires the sections read.

Runtime verification: six buttons present, labels exact, all `disabled`; a full-text sweep of the
surface finds **none** of the prohibited labels; the template picker still offers all five templates
with none pre-selected; no preset name reaches any contract, event, column or URL. `tsc` and eslint
clean; no horizontal overflow; zero console errors.

**Carried to the wiring pass (not closed by this ruling):** the "show exactly what changed" affordance —
applying a preset must surface the resulting order/visibility diff before it is saved, and the
existing "Template unchanged" assurance must survive alongside it.

---

---

## 1. The question

May the production vendor workspace render the four documented **section-arrangement starting
points** under their business-shape names —

> **Manufacturer / fabricator · Engineering service · Catalogue / retailer · Hybrid supply & service**

— as guidance affordances that reorder `profile_sections`, while `[ESC-MKT-VENDORTYPE]` is open?

## 2. Both sources, cited (neither is paraphrased)

**Permitting side**

- **Owner hybrid ruling, plan §3A.0 (2026-07-20).** The canonical template axis is visual layout
  style; business type/capability/content drive **section emphasis only** — never template identity,
  and never a vendor lock. Section emphasis is exactly what these presets set.
- **Owner approval (2026-07-20).** Prototype v0.2 was approved as *"the production visual source of
  truth"*, and its §2 match list names **arrangement controls** explicitly. The prototype renders
  these four labels.
- **Audit §3B.** The four arrangements are a *documented, audited* reference set (kit-01…kit-04),
  retained deliberately when the kit source was deleted.

**Prohibiting side**

- **Invariant #1.** Vendor capability is a **4-flag matrix** (`can_supply` / `can_service` /
  `can_fabricate` / `can_consult`), *not a label*.
- **Board decision FE-PUB-09 (2026-07-03).** Vendor-type labels were **REJECTED as coined** on
  Invariant #1 grounds; vendor typing stays the frozen matrix. Three of these four names sit in that
  same rejected family.
- **`[ESC-MKT-VENDORTYPE]` — OPEN.** The `vendor_type_preset` value set is unenumerated and
  Board-pending; the classification dictionary marks it NET-NEW. Rendering values now pre-empts it.
- **Invariant #2.** *Hybrid* is a reserved **Platform Participation** term (Buyer / Vendor / Hybrid /
  Staff). "Hybrid supply & service" borrows it for business type — a second, colliding meaning.
- **The plan's own constraint**, §6 DS-W2B: *"never by a coined vendor-type taxonomy
  (`ESC-MKT-VENDORTYPE` open)"*; §3A.0 argues the hybrid ruling *"avoids that entirely"*.

## 3. Action taken pending the ruling *(historical — superseded by §0)*

The presets were **withheld from production**. The halt was recorded in place at
`microsite-builder.tsx` with both citations.

This is a halt, not a resolution. It was chosen because it is the **reversible** direction and costs
nothing:

- they would have shipped **disabled** (no sections read and no `update_profile_sections.v1` is
  wired), so they reorder nothing and write nothing today — **zero capability is lost**;
- restoring them is a single block if the Board rules them permissible;
- shipping first and retracting later would put a rejected label family in front of vendors.

Unaffected and still shipping: the three-step journey, the five named templates, per-section order
and visibility handles, the Content ≠ Presentation copy, preview and publish.

## 4. Options put to the Board *(historical — **Option B ruled**, see §0)*

| # | Option | Consequence |
|---|---|---|
| **A** | **Approve as presentation-only guidance** — labels are arrangement names, never vendor classification: not persisted, not read back, never restricting templates, never written to any `vendor_type*` field | Restores the approved prototype exactly. Needs an explicit finding that FE-PUB-09 governs *vendor classification* and not *arrangement naming*, so the precedent is bounded |
| **B** | **Approve with renamed, non-typing labels** — describe the *emphasis*, not the business: e.g. "Lead with capabilities" · "Lead with delivered work" · "Lead with the catalogue" · "Balance products and services" | Keeps the mechanism and the owner-approved UX while touching no vendor-type vocabulary. **Recommended** — it is the only option that satisfies both sources without a new precedent |
| **C** | **Defer until `[ESC-MKT-VENDORTYPE]` is ruled** | Current state persists. The vendor arranges sections manually; no starting points offered |
| **D** | **Reject permanently** | Arrangement presets are dropped from the roadmap; audit §3B stays a design reference only |

## 5. Verification list

| # | Check | Now | At wiring |
|---|---|---|---|
| 1 | No coined value reaches any contract, event, column or URL — presets change `profile_sections.display_order` / `is_visible` only | ✅ nothing is written at all | must re-verify |
| 2 | Applying a preset never changes `layout_template`, and all five templates stay selectable (§3A.0 no-vendor-lock) | ✅ separate state models; no template pre-selected | must re-verify |
| 3 | No preset is auto-applied or inferred from vendor data — the vendor chooses and nothing is switched for them | ✅ nothing auto-applies | must re-verify |
| 4 | Nothing persists as a vendor "type": no preset name stored, echoed publicly, or used in matching (Invariant #6 firewall, DP5) | ✅ labels are display strings only | must re-verify |
| 5 | No prohibited label appears anywhere on the surface | ✅ full-text sweep clean | must re-verify |
| 6 | Applying one **shows exactly what changed** | ⛔ not applicable — controls disabled, nothing to diff | **required before enabling** |

Checks 1–5 pass today. Check 6 is the gate on making the controls interactive.

---

*Raised by Review-A under §13 (Raise ≠ Accept), halted under §11, ruled by the owner under §7, and
closed only after the verification list passed. This record coins nothing and changes no frozen
document.*
