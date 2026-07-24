# Doc-2 — Additive Patch v1.0.12 (PATCH-D2-11) — `vendor_type_preset` Value Domain

> **✅ STATUS: PROPOSED — D2-10 forward-PR reconcile to `main` (2026-07-24).**
> Additive overlay to Doc-2 §10.3; the Doc-2 base file is **NOT edited** (carried alongside, the
> `Doc-2_Patch_v1.0.6/v1.0.8/v1.0.9` overlay mechanism). Reconciled from the branch fold `3e0cfa7`
> (`fe/account-referral-nav`), where it was owner-approved + Review-A PASS (0B/0MAJ/0MIN) 2026-07-22 as
> `Doc-2_Patch_v1.0.13` / PATCH-D2-10. **Identifier reassignment only for the reconcile — content
> unchanged** (§10 Renumber note). Origin/provenance:
> `governanceReviews/Doc-2_Patch_v1.0.13_VendorTypePresetValues_PROPOSAL.md`.
>
> On `vendor_type_preset` value-domain questions, **this patch governs** (v1.0.9 precedent). Realizes
> the value domain deferred by the in-force **AMD-MA-VTP-1** re-freeze.
>
> **Depends on a landed rank-0 act — sequenced as PR-1 of this two-PR split.** This patch realizes the
> machine-readable value domain of the six-row preset register re-frozen by **AMD-MA-VTP-1**
> (`generatedDocs/Architecture_VendorTypePreset_Amendment_v1.0.md`), **independently verified PASS and
> IN FORCE 2026-07-22, applied to `main` 2026-07-24** (`00_AUTHORITY_MAP.md` Master row;
> `generatedDocs/Architecture_VendorTypePreset_Amendment_Verification_v1.0.md`). AMD-MA-VTP-1 §6
> declares **no identifiers** and expressly hands the value domain to Doc-2 §10.3 — **this is that
> patch.** Split packaging is owner-ruled (2026-07-24): the rank-0 re-freeze lands first and alone; this
> value-domain overlay lands second, so its six slugs never bind to a five-row register.

## 1. Status

| Field | Value |
|---|---|
| Patch ID | **PATCH-D2-11** (assigned per Amendment A-2 — the branch ID `PATCH-D2-10` is occupied on `main` by Growth Hub; next verified-available contiguous ID taken) |
| Patches | Doc-2 (Domain Model & Database Blueprint) — FROZEN **v1.0.11 → v1.0.12** (§10) |
| Class | **ADDITIVE — additive overlay.** Supplies the value domain of an existing attribute that currently has none. **The Doc-2 base file is NOT edited** — this patch carries as the additive overlay, per the v1.0.9 precedent (§3). No column, entity, state, event, permission, audit action, ownership or DDL change. |
| Applies to | `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` **§10.3**, the `marketplace.vendor_profiles` Key-Attributes cell (`:731`) — the value domain of `vendor_type_preset` **only** |
| Scope | The six-member value domain of `vendor_type_preset`, bound **by pointer** to the six rows re-frozen at `Master_System_Architecture_v1.0_FINAL.md:216–221` (AMD-MA-VTP-1, in force on `main`). **Nothing else.** |
| Does NOT | Add · rename · remove · reseed any preset (AMD-MA-VTP-1 owns the rows) · change any display name · change the capability matrix · add a column, entity, state, event, permission or audit action · change ownership · change DDL |
| Resolves | `ESC-MKT-VENDORTYPE` — **values half only** (§8) |
| Authorized by | Owner ruling 2026-07-22 (six-row decision) + AMD-MA-VTP-1 in force on `main` (PR-1, 2026-07-24) + D2-10 forward-PR reconcile owner-approved 2026-07-24. |

---

## 2. Problem — the attribute has no declared value domain

`vendor_type_preset` is a **frozen attribute with no declared value domain.**

| Fact | Anchor (re-derived from disk 2026-07-22) |
|---|---|
| Attribute exists in the §10.3 `marketplace.vendor_profiles` row, **bare** (no inline domain) | `generatedDocs/Doc-2_…_v1.0.2.md:731` |
| Column realized as `text`, nullable, annotated `-- [Doc-2 §10.3]` | `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:70` |
| Declared `vendor_type_preset : enum : optional` on create and update — **with no source pointer** | `generatedDocs/Doc-4D_…_PassB_VendorProfile.md:19, :48` |
| Exposed as an **allowlisted hard filter** in `search_catalog` | `generatedDocs/Doc-4D_…_PassB_Discovery.md:20`; semantics `:27` — *"**Filters** = allowlisted hard attributes (category, geography, capability, vendor_type_preset)"* |
| Gap registered | `esc_registry.md` (`ESC-MKT-VENDORTYPE`) |

**Why the additive-vs-re-key debate does not arise here.** An earlier drafting line bound values to the
frozen **five-row** register and had to argue whether minting slugs was *additive realization* or
*re-keying* a frozen row. **That debate is closed by a landed act:** AMD-MA-VTP-1 re-froze the register
at six rows, renaming rows 1 and 4 and adding row 6, and it explicitly declares no identifiers (§6).
Identity for the rows is settled at the Architecture layer; this patch supplies the **machine-readable
domain** the amendment deferred. (Re-keying is separately dispositioned at §5.)

**Bounded finding** (Board drafting control — `governanceReviews/RankZero_Instruments_Coordination_Register_v1.0.md:71–76`,
§5 Method control, Board-ruled 2026-07-21): *within the sources enumerated in this patch —
`generatedDocs/`, `esc_registry.md`, and the M2 frontend surfaces in §11 — no machine-readable value
domain for this attribute was identified.* The six presets **do exist**, as **display names with
capability cells**, at `Master_…_FINAL.md:216–221` (re-frozen). What is missing is the domain
declaration, not the concept.

**Consequences today:** the field cannot be validated; the discovery filter has no domain to validate
against; and the shipped editor at `app/(app)/_components/vendor/company/vendor-type-presets.ts` now
offers the six presets but carries slugs marked **NOT governed** pending this patch.

---

# PATCH-D2-11 — `vendor_type_preset` value domain (§10.3), overlay

**Base text reference** — `generatedDocs/Doc-2_…_v1.0.2.md:731`, within the `marketplace.vendor_profiles`
Key-Attributes cell. Verified verbatim against disk 2026-07-22 (§9 gate). The token as it stands, bare:

> `vendor_type_preset`

**Governed reading declared by this overlay** *(the Doc-2 base file is NOT edited; on
`vendor_type_preset` value-domain questions, this patch governs — v1.0.9 precedent, §3)*, in the
inline-domain notation the sibling attributes in the same cell already use
(`claim_state(...)`, `status(...)`, `visibility(public)`):

> `vendor_type_preset(consultant/mro_retail_supplier/importer_equipment_seller/manufacturer_workshop/engineering_firm/service_provider)`

### Binding rules (freeze-level)

*Precedent for a Doc-2 additive patch carrying freeze-level binding rules in prose alongside its
overlay text: `generatedDocs/Doc-2_Patch_v1.0.9.md:41` — "Binding rules (freeze-level):". These rules
are part of the patch and fold with it.*

1. **The domain is closed at these six values.** No seventh value, and no `other` value, is minted.
   Precedent for a Doc-2 additive patch closing a value set: `generatedDocs/Doc-2_Patch_v1.0.9.md:49`
   — *"The stage enum is closed at the five values above."* **Closure resides in this rule, not in the
   parenthesis** — Doc-2 §0.4 Notation (`:55–60`) does not govern the inline-parenthetical attribute
   notation, and the sibling `visibility(public)` lists one value where Invariant #3 scopes two, so the
   notation does not itself carry closure. **That §10.3 inline domains do compile to closed machine
   enums is shown by the frozen realization layer:** `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:58` —
   `CREATE TYPE marketplace.vendor_visibility AS ENUM ('public'); -- [Doc-2 §10.3 visibility(public)]
   only value` — the database blueprint reads a §10.3 inline parenthesis directly into a
   `CREATE TYPE … AS ENUM`. This is the corpus confirming §10.3 owns machine-readable value domains.

2. **Each value is bound by pointer, never restated** (`CLAUDE.md` Working Rules — *"Reference-never-restate —
   bind frozen entities/slugs/events/audit actions/POLICY keys by pointer; never copy or invent"*):

   | Identifier | Denotes the re-frozen preset at | Display name (governed there, **not** restated as authority) |
   |---|---|---|
   | `consultant` | `Master_…_FINAL.md:216` | *Consultant* |
   | `mro_retail_supplier` | `:217` | *MRO / Retail Supplier* |
   | `importer_equipment_seller` | `:218` | *Importer / Equipment Seller* |
   | `manufacturer_workshop` | `:219` | *Manufacturer / Workshop* |
   | `engineering_firm` | `:220` | *Engineering Firm* |
   | `service_provider` | `:221` | *Service Provider* |

   The display names and the four capability cells of every row are governed at those lines
   (AMD-MA-VTP-1, in force) and are **not** reproduced, interpreted, or altered by this patch. The
   display column is a reading aid; on any divergence the re-frozen line governs. Each identifier is
   **lowercase `snake_case`**, per `Doc-4A_Content_v1.0_Pass1.md:172`.

3. **Metadata, never authoritative for capability.** Capability is and remains the four booleans
   `can_supply` / `can_service` / `can_fabricate` / `can_consult` (Invariant #1).
   `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:88` (MK-CR4): *"Capability = matrix, not label … no
   `vendor_type` enum derived from them in the DB (`vendor_type_preset` is a UI preset label, not the
   capability source of truth)."*

4. **Seed-once, not a live relationship.** `Master_…_FINAL.md:222`: *"The preset seeds the flags; the
   flags — not the preset name — drive all matching."* No runtime derivation, no reverse mapping. A
   vendor whose flags diverge from its preset is valid, not an inconsistency.

5. **Never collapsed in the UI.** `generatedDocs/Doc-7G_Content_v1.0_Pass1.md:46`: *"The profile
   editor presents the four independently; the UI never collapses them to a single 'vendor type.'"*

6. **Matching boundary.** Not a Phase-A eligibility gate. Matching filters on flags **covering** the
   RFQ's `work_nature` (`Master_…_FINAL.md:224`). **No M3 change is authorized.**

7. **Optional.** The attribute remains optional/nullable; "none of these" is NULL.

8. **Firewall.** No governance-signal read or write; no plan or entitlement coupling
   (Invariants #6, #10).

**No DDL change.** `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:70` is already `text`. An optional DB
`CHECK` is **deferred** — recorded, not coined.

---

## 3. Why this is additive — and why it is an overlay, not a base edit

| Test | Result |
|---|---|
| Does any frozen sentence change truth value? | **No.** `:731` reads `vendor_type_preset` **bare** — "domain unspecified." Supplying the domain fills a gap; it does not contradict a stated domain. |
| Is a preset added, renamed, removed or reseeded? | **No.** AMD-MA-VTP-1 owns the rows; this patch touches no row, name or seed. |
| Is any capability cell changed? | **No.** `:216–221` are untouched. |
| Is the notation novel? | **No** — three sibling attributes in the same cell already carry inline domains (`:731`); closure is carried in Binding rule 1. |
| Is Doc-2 §10.3 the owning location? | **Yes** — §4. |
| May a Doc-2 additive patch close a value set as an overlay? | **Yes** — `Doc-2_Patch_v1.0.9.md:49` (closure) + `:10` "Frozen text" header row (*"The Doc-2 base file is NOT edited. This patch is the additive overlay"*). |

**Overlay, not base edit — and why that is correct here (contrast the Master re-freeze).**
`Doc-2_Patch_v1.0.9.md` header establishes the Doc-2 norm: additive patches **do not edit the base
file**; they carry as overlays and govern on their topic. This patch follows it. The Board's
2026-07-21 preference for **canonical re-freeze over overlay**
(`ReviewA_Record_MasterArchitecture_Inv1_VendorTypePreset_v1.0.md:98`) applied to a **non-additive,
contradicting** overlay on the Master register — where the base would keep asserting the *superseded*
five rows. That reasoning does not reach here: this overlay is **additive and non-contradicting** —
the base asserts no competing domain, it asserts none at all. There is nothing for a "latest overlay
wins" rule to arbitrate, so none is introduced. (This is the same additive-overlay shape as every
folded Doc-2 patch v1.0.4–v1.0.11.)

---

## 4. Is Doc-2 §10.3 the owning location?

`Doc-4A_Content_v1.0_Pass3.md:46` says enum fields are declared `enum(<source pointer>)` naming the
owning location, and lists *"Doc-2 §3 entity attributes"* — but **Doc-2 §3 is the Entity Catalog**
(Entity/Purpose/Tenant/Lifecycle) and carries no attribute value domains; `Pass1:172` repeats the same
loose "§5, §3" shorthand. The corpus resolves the looseness at three anchors, each from disk:

| Anchor | Content | Establishes |
|---|---|---|
| `Doc-4A_Content_v1.0_Pass1.md:169` | Field names → source of truth: **"Doc-2 §3, §10"** | Doc-4A pairs **§3 and §10** for attribute-level truth; the bare "§3" is shorthand for the pair. |
| `Doc-6D_Content_v1.0_Pass1.md:58` | `CREATE TYPE marketplace.vendor_visibility AS ENUM ('public'); -- [Doc-2 §10.3 visibility(public)]` | The frozen DB blueprint compiles a **§10.3 inline domain** straight into a machine `ENUM`, annotated **§10.3 by name** — §10.3 demonstrably owns machine-readable value domains. |
| `Doc-6D_Content_v1.0_Pass1.md:70` + `Doc-4D_Content_v1.0_PassA.md:81` | `vendor_type_preset text, -- [Doc-2 §10.3]`; *"…`vendor_type_preset`, presentation anchor (Doc-2 §10.3)"* | Two frozen rank-0 documents point **this attribute** at **§10.3 by name.** |

**Conclusion.** Doc-2 §10.3 is the owning location for this attribute's value domain — named by the DB
blueprint and a rank-0 contract, and shown by `:58` to be the layer where §10.3 domains become enums.

---

## 5. Re-keying — dispositioned (handed here by AMD-MA-VTP-1 §5.5)

The owner's election ledger (`…Amendment_PROPOSAL_v1.1.md:119, :120, :122`) classed the slugs for rows
2/3/5 as **Re-keying** (rows 1 and 4 at `:118`/`:121` are **Amendment**, distinct), on the reading that
the display string was the de-facto key. AMD-MA-VTP-1 §5.5
declined to settle it and handed it here. **Disposition:**

At the **governance layer there was never a governed string key** — Doc-2 §10.3 held the attribute
**bare**, with no value domain, and the display names live in the Architecture register (presentation,
Invariant #9 Content ≠ Presentation). This patch therefore performs the **first assignment** of the
attribute's machine-readable domain, not the re-keying of an existing governed identifier. The display
names remain governed, unchanged, in their re-frozen home; the slugs are their machine keys in the
domain's owning home. Two registers, one per layer, over the same six rows — the split Invariant #9
requires.

**Zero stored data makes this costless and reversible.** Nothing persists the attribute today (§11);
no value is being migrated. The relocation of *de-facto* identity from string to slug that the ledger
flagged is real as a description, but it has **no data consequence** and introduces **no contradiction**
(the base asserted no slug to contradict). Recorded, not papered over.

---

## 6. Realization gates — **(Informative — Non-Normative)**

> **Altitude.** Doc-2 governs the domain model; FE conduct is Doc-7G's. The items below are
> informative findings of this patch; they acquire binding force only when carried into a Doc-7G item
> or a registered `esc_registry.md` row. The Board is asked to direct where they land.

**G-A · The `service_provider` mapping (mis-routing harm) — now mitigated by AMD-MA-VTP-1.** Row 6
`service_provider` seeds `can_service` alone (`:221`), giving a service-led vendor its own correct
entry point — the P-2 fix. The shipped editor's former `service_provider` option that would have
mapped onto the consult-only row is removed; the register now offers `consultant` (`can_consult`) and
`service_provider` (`can_service`) as distinct rows. **Finding:** the FE picker must map a
maintenance/installation vendor to `service_provider`, never to `consultant`; the two seed opposite
flags and `:224` routes on flags.

**G-B · Public rendering (Invariant #1 / FE-PUB-09).** `src/frontend/components/vendor-card.tsx:99–101`
renders the preset label on a public surface. Whether a preset label may render in production is
governed by the FE-PUB-09 precedent and B1's escalation (AMD-MA-VTP-1 §5.2, §5.4), **not** by this
patch. **Finding:** adopting this value domain is not authority to render the label publicly.

---

## 7. Regression / firewall

No governance-signal read, write or cross-mutation (Invariants #6, #10). Capability stays the four
booleans (Invariant #1, MK-CR4). Matching unchanged — flags remain the sole eligibility input
(`:224`); **no M3 change.** No stored data at risk (§11). Content ≠ Presentation held (§5). One
module, one owner — M2 attribute, M2 doc.

---

## 8. `ESC-MKT-VENDORTYPE` — values half only

`esc_registry.md` scopes the handle to **two** gaps: *"`vendor_type_preset` enumerates **no
values**; net-new vendor 'commercial capability' facets (brand/OEM-authorization) unmodeled."* This
closes the **first**. The second — Channel *"net-new facets → future M2 patch"* — is **expressly
preserved**.

The row is amended **row-wise** across Scope/gap, Interim presentation and Channel — the table has no
status column (`esc_registry.md` header: `| Handle | Scope / gap | Interim presentation |
Channel |`). It must **not** use the whole-handle ✅ mechanism seen on `ESC-RFQ-MATCH-EVOLVE`, which
closes a handle entirely — wrong for a half-closure.

**Registered-channel deviation, declared.** `esc_registry.md`'s Channel currently reads *"Additive
`Doc-4D_VendorTypePreset_Values` patch (Board)."* This proposal reroutes it to a **Doc-2 §10.3** patch,
on the §4 grounds and the Review-A rejection of the Doc-4D route (`Doc-4A_…_Pass3.md:47` — a request
contract MUST NOT define/extend an enum). The row-wise amendment includes Channel; the deviation is
carried but **called out**, not executed silently.

**`ESC-RFQ-MATCH-EVOLVE` item ③** records *"industry/business-type ranking stays DEFERRED pending …
`ESC-MKT-VENDORTYPE`."* Closing half this handle touches that deferral's premise. **No M3 change is
authorized here**; recorded so the deferral's basis stays accurate.

**Gate lifted (non-adverse), noted for the record.** `docs/product/requirements/digital_showcase_planning_and_design.md:385`
stands a gate *"no coined vendor-type values while `ESC-MKT-VENDORTYPE` is open"*, keyed on the very
closure this patch performs. This patch **satisfies** that gate rather than conflicting with it — the
values are not *coined* here but bound by pointer to the re-frozen register (Binding rule 2), and the
handle's values half closes. Recorded so a later reader does not treat the `:385` gate as still open on
this basis. (Public *rendering* remains separately gated — G-B, §6.)

---

## 9. Dependent contract update (linked pair)

On fold, `Doc-4D_Content_v1.0_PassB_VendorProfile.md:19, :48` and `…PassB_Discovery.md:20` update the
declaration to `vendor_type_preset : enum(Doc-2 §10.3)` — a **pointer** in the form
`Doc-4A_Content_v1.0_Pass3.md:46` prescribes, never a restatement of the values. It is carried by the
linked **`Doc-4D_VendorTypePreset_Pointer_Patch_v1.0.5`** (PATCH-4D-VTP-01, this PR), which holds no
independent authority and is sequenced **after** this patch, per the Doc-2-first pattern at
`Doc-4A_…_Pass5.md:243`. *(Review-A OBS: `Pass5:242` "New enum value in entity state" is deliberately
**not** cited — `vendor_type_preset` is not a state field, so `:242` is off-point; `:243` is used only
for its "Doc-2 patch first" sequencing principle, not as an exact change-class match. The table has no
row for a value domain on a non-state attribute; the on-point additive row is `:236` — the
Consumer-tolerance obligation carried by the linked pointer patch.)*

**Consumer-tolerance obligation.** `Doc-4A_…_Pass5.md:236` (*"New optional enum value for a filter/sort
parameter → Additive … Consumers must declare tolerance"*) requires the linked pointer patch to carry
that declaration for `search_catalog`'s `vendor_type_preset` filter.

The 7-value restatements in `ADR-023_…_PROPOSAL.md` (Decision item 2), `MASTER-CLASSIFICATION-DICTIONARY.md`
and `VENDOR-PROFILE-MODEL.md` are **downstream conformance tasks, not gates** — sequencing a rank-0/1
fold behind unratified lower-rank artifacts would invert `CLAUDE.md §7`.

---

## 10. Version label + Renumber note — derived from disk

**On `main` at the D2-10 forward-PR cut (`4fc4b23`):** `00_AUTHORITY_MAP.md` records Doc-2 folded at
**v1.0.11** (`Doc-2_Patch_v1.0.11_GrowthHub`, PATCH-D2-10). The next unused version label is
**v1.0.12**; the next verified-available contiguous patch ID is **PATCH-D2-11** (`PATCH-D2-01…10`
contiguous on `main`). This patch takes **v1.0.12 / PATCH-D2-11**. No label is reserved or skipped —
the branch's five-value predecessor drafts never existed as files on `main`, so there is nothing to
reserve here (contrast the branch history, where v1.0.11/v1.0.12 were consumed labels).

**Renumber note — two hops.** (1) *On branch* (`fe/account-referral-nav`): authored and folded at
`3e0cfa7` as **v1.0.13 / PATCH-D2-10**, after two five-value predecessor labels (v1.0.11, v1.0.12) were
consumed and superseded there. (2) *Reconcile to `main`* (2026-07-24, D2-10 forward-PR): renumbered to
**v1.0.12 / PATCH-D2-11** per `governanceReviews/RULING_Doc-2_v1.0.9_Collision_Renumber_SchemeB_v1.0.md`
— **Scheme B** on the version line (Amendment A-1) and **Amendment A-2** on the patch-ID axis. On
`main`, Growth Hub occupies v1.0.11 / PATCH-D2-10, so both axes settle one lower than the branch's
v1.0.13 and one higher than the branch's PATCH-D2-10. **Identifier reassignment only; content
unchanged** (A-2 §9: renumber ≠ fold; semantics untouched).

---

## 11. Impact

| Surface | Impact |
|---|---|
| `prisma/schema.prisma` · `prisma/migrations/` | **None.** No `VendorProfile` model; only `Organization.hasVendorProfile`. |
| Stored data | **None.** Nothing persists the attribute; adoption costs no migration. That window closes when the M2 tables land. |
| `app/(app)/_components/vendor/company/vendor-type-presets.ts` | The presentation register already carries the six rows + slugs, marked **NOT governed** pending this patch; on fold, its provenance comment is re-pointed to this patch as the governing value domain. **Reconciliation carried, not executed in this documentary forward-PR.** |
| `app/(app)/_components/vendor/company/capabilities-capacity-form.tsx` · `profile-overview.tsx` | Consume the register (picker + display lookup); no change needed on fold. |
| `src/modules/marketplace/contracts/types.ts:56` | Doc-comment states a stale `(manufacturer \| service_provider \| trader \| other)` set — **must be corrected** to the six-member domain at M2 realization; the TS type is `string \| null` and coins nothing (raised as MINOR in `docs/backend/m2_public_read_slice_plan.md` §3.4). Carried, not executed here. |
| `src/frontend/components/vendor-card.tsx` | Renders the label publicly; gated by G-B (not this patch). |
| `app/(public)/_components/discovery/seed.ts:55–118` | Demo labels, most matching no row — reconciliation carried, not executed. |
| M3 matching | **None.** Flags remain the sole eligibility input (`:224`). |

**FE realization beyond the register wiring is not authorized by this patch. This is a documentary
forward-PR — the Doc-2 patch doc + linked Doc-4D pointer patch + Authority Map / CORPUS_INDEX /
`esc_registry` sync; no code, Prisma or test carried** (mirrors the D2-08/D2-09 forward-PR pattern).

---

## 12. Approval block

| Gate | Status |
|---|---|
| AMD-MA-VTP-1 in force + applied to `main` (owning register landed, PR-1) | ✅ verified PASS 2026-07-22 (PV-AMD-MA-VTP-1); applied to `main` 2026-07-24 |
| Review-A (independent) — on this patch (branch) | ✅ **PASS 2026-07-22 — 0B / 0MAJ / 0MIN / 2NIT / 2OBS** (freeze-eligible); carried unchanged by the reconcile (A-2 §9 — renumber ≠ re-review) |
| A-2 patch-ID axis ruled (owner) | ✅ 2026-07-23 (`RULING_…SchemeB_v1.0.md` §9) |
| Version + patch ID verified free on `main` at cut (`4fc4b23`) | ✅ v1.0.12 free; PATCH-D2-11 next-contiguous |
| Human approval — D2-10 forward-PR reconcile | ✅ owner-approved 2026-07-24 (this PR) |
| Verification: base text `Doc-2_…_v1.0.2.md:731` matches disk verbatim; slug→row pointers resolve at `Master_…_FINAL.md:216–221` (six-row register, in force on `main`) | ✅ run 2026-07-22; re-confirmed against the PR-1 six-row register 2026-07-24 |
| Fold as `generatedDocs/Doc-2_Patch_v1.0.12_VendorTypePresetValues.md` + linked Doc-4D pointer patch v1.0.5 (§9) + `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md` + `esc_registry.md` | ✅ this PR |
| `types.ts:56` comment corrected to the six-member domain | ☐ carried to M2 realization |
| G-A / G-B (§6) assigned a binding home — Doc-7G item or registered ESC row | ☐ Board direction requested |

Freeze/merge gate (`CLAUDE.md` §13): does not freeze or merge until **BLOCKER = 0 · MAJOR = 0 ·
MINOR = 0**.

---

## 13. Red Flag Checklist

No new module · no ownership change (M2 attribute, M2 doc) · no cross-module DB access or cross-schema
raw SQL · no cross-module foreign key · no import beyond another module's `contracts/` · no
governance-signal read, write or cross-mutation · no workflow owning state, no read-model as source of
truth, no M9/AI authoritative data · no Admin bypass · no ADR override · **no FROZEN document modified**
— this is an additive overlay, human-approval gated, folded by no AI action; the Doc-2 base file is not
edited. (The one non-additive rank-0 act in this two-PR chain — AMD-MA-VTP-1 — lands separately in PR-1
under direct owner authorization; this patch is additive and depends on it.)

---

*End of Doc-2_Patch_v1.0.12_VendorTypePresetValues (PATCH-D2-11, PROPOSED — D2-10 forward-PR) — supplies
the closed six-member value domain of `vendor_type_preset` in §10.3 as an additive overlay:
`consultant` · `mro_retail_supplier` · `importer_equipment_seller` · `manufacturer_workshop` ·
`engineering_firm` · `service_provider`, each bound by pointer to the six-row register re-frozen by
AMD-MA-VTP-1 (in force on `main`, PR-1) at `Master_…_FINAL.md:216–221`, in the inline notation its
sibling attributes use, closure carried in freeze-level Binding rule 1 on the `Doc-6D_…Pass1.md:58`
ENUM precedent. Doc-2 base unedited. No preset added/renamed/removed/reseeded; no column, entity,
state, event, permission, audit action, ownership or DDL change. Re-keying dispositioned (§5). ESC
values-half closed (§8). Reconciled from branch v1.0.13 / PATCH-D2-10 → v1.0.12 / PATCH-D2-11
(Scheme B + A-2); content unchanged.*
