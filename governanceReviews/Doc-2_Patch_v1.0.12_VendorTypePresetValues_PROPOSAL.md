# Doc-2_Patch_v1.0.12_VendorTypePresetValues_PROPOSAL.md

> **STATUS: DRAFT — ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-2 is **rank-0 frozen architecture**
> (`generatedDocs/00_AUTHORITY_MAP.md:18`); a FROZEN document is *"changed only by additive patch +
> (rank 0–1) human approval"* (`generatedDocs/00_AUTHORITY_MAP.md:42`; `CLAUDE.md:139–140`) — never
> a skill decision. Not folded by any AI action.
>
> **Supersedes `governanceReviews/Doc-2_Patch_v1.0.11_VendorTypePresetValues_PROPOSAL.md`**
> (Review-A: 🟠 REVISION REQUIRED — 0 BLOCKER / 4 MAJOR / 7 MINOR / 2 NIT / 4 OBS). v1.0.11 is
> retained on disk, marked SUPERSEDED, and is **not** deleted — the review trail cites it. Every
> finding is dispositioned in §10.
>
> **Route.** An earlier attempt placed this value set in a Doc-4D contract patch
> (`governanceReviews/Doc-4D_VendorTypePreset_Values_Patch_v1.0.4_PROPOSAL.md`) and was **REJECTED at
> Review-A**: `generatedDocs/Doc-4A_Content_v1.0_Pass3.md:47` — *"A request contract **MUST NOT**
> define a new enum or extend an existing one; a needed-but-missing value is escalated (§0.6)."*
> A value domain therefore belongs in its owning corpus location, which §3.2 establishes is Doc-2
> §10.3. **This is that patch.**
>
> **Linked pair.** Fold together with the dependent Doc-4D contract update (§8), which will declare
> `vendor_type_preset : enum(Doc-2 §10.3)`. Precedent for linked-set folds:
> `generatedDocs/00_AUTHORITY_MAP.md:55` records Doc-2 **v1.0.5** as a *"Linked set with Doc-4D
> v1.0.2 + Doc-6D v1.0.1 + Doc-3 v1.10."*

## 1. Status

| Field | Value |
|---|---|
| Patch ID | **PATCH-D2-10** |
| Applies to | `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` **§10.3**, the `marketplace.vendor_profiles` Key-Attributes cell (`:731`) |
| Produces | **Doc-2 v1.0.12** — next free label (§1.1) |
| Change class | **ADDITIVE** — supplies the value domain of an existing attribute, in the notation its siblings already use (§3.3) |
| Scope | The value domain of `vendor_type_preset`, bound **by pointer** to the five presets already frozen at `generatedDocs/Master_System_Architecture_v1.0_FINAL.md:214–220`. **Nothing else.** |
| Does NOT | Add · rename · remove · reseed any preset · change the capability matrix · change any display name · add a column, entity, state, event, permission or audit action · change ownership · change DDL |
| Resolves | `ESC-MKT-VENDORTYPE` — **values half only** (§6) |
| Decided here | **NAM-1** — row 1's identifier is `consultant` (§3.5, owner ruling 2026-07-22) |
| Still OPEN | **P-1 · P-2 · C-6 · OBS-2** (§7) — all require the parked rank-0 amendment track |

### 1.1 Version label — derived from disk

`generatedDocs/00_AUTHORITY_MAP.md:55` records Doc-2 at **v1.0.10**
(`Doc-2_Patch_v1.0.10_GrowthHub` = PATCH-D2-09; v1.0.9 = PATCH-D2-08; v1.0.8 = PATCH-D2-07).
`v1.0.11` was consumed by the superseded predecessor of this proposal, which was never folded but
was committed and reviewed under that label. To keep the review trail unambiguous, this revision
takes the **next unused label: v1.0.12**. The patch ID is unchanged at **PATCH-D2-10** — it is the
same patch, revised, not a second one.

---

## 2. Problem

`vendor_type_preset` is a **frozen attribute with no declared value domain.**

| Fact | Anchor (re-derived from disk 2026-07-22) |
|---|---|
| Attribute exists in the §10.3 `marketplace.vendor_profiles` row | `generatedDocs/Doc-2_…_v1.0.2.md:731` |
| Column realized as `text`, nullable, annotated `-- [Doc-2 §10.3]` | `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:70` |
| Declared `vendor_type_preset : enum : optional` on create and update | `generatedDocs/Doc-4D_…_PassB_VendorProfile.md:19, :48` |
| Exposed as an **allowlisted hard filter** in `search_catalog` | `generatedDocs/Doc-4D_…_PassB_Discovery.md:20`; semantics at `:27` — *"**Filters** = allowlisted hard attributes (category, geography, capability, vendor_type_preset)"* |
| Gap registered | `esc_registry.md:92` (`ESC-MKT-VENDORTYPE`) |

**Bounded finding** (Board drafting control — `governanceReviews/RankZero_Instruments_Coordination_Register_v1.0.md:71–76`,
§5 Method control, Board-ruled 2026-07-21: bounded language where the six-part proof is not
carried): *within the sources enumerated in this patch — `generatedDocs/`, `esc_registry.md`, and
the M2 frontend surfaces listed in §5 — no machine-readable value domain for this attribute was
identified.* The five presets **do exist**, as **display names with capability cells**, at
`Master_System_Architecture_v1.0_FINAL.md:214–220`. What is missing is the domain declaration, not
the concept.

**The patch site is visible in the frozen text itself.** At `:731`, three sibling attributes in the
same Key-Attributes cell carry their domain **inline in parentheses** —
`claim_state(seeded/invited/claimed/verified)`, `status(active/suspended/banned)`,
`visibility(public)` — while `vendor_type_preset` appears **bare**. This patch fills that one gap,
in that exact notation. (On the limits of that notation as a closure device, see §3.3.)

**Consequences today:** the field cannot be validated; the discovery filter has no domain; and the
shipped editor at `app/(app)/_components/vendor/company/capabilities-capacity-form.tsx:39–41` offers
`manufacturer` / `trader` / `service_provider` — matching no governance source.

---

# PATCH-D2-10 — `vendor_type_preset` value domain (§10.3)

**Existing Text Reference** — `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md:731`,
within the `marketplace.vendor_profiles` Key Attributes cell. Verified verbatim against disk
2026-07-22 (§9 gate ticked). The token as it stands:

> `vendor_type_preset`

**Amendment Text** *(replacement of that token only, in the inline-domain notation used by the
sibling attributes in the same cell)*:

> `vendor_type_preset(consultant/mro_retail_supplier/importer_equipment_seller/manufacturer/engineering_firm)`

**No other text in `:731`, in §10.3, or anywhere in Doc-2 is amended.**

### Binding rules (freeze-level)

*Precedent for a Doc-2 additive patch carrying freeze-level binding rules in prose alongside its
amendment text: `generatedDocs/Doc-2_Patch_v1.0.9.md:41` — "Binding rules (freeze-level):". These
rules are part of the patch and fold with it; see §3.3 on why the closure must reside here rather
than in the parenthetical notation alone.*

1. **The domain is closed at these five values.** No sixth value, and no `other` value, is minted.
   Precedent for a Doc-2 additive patch closing a value set: `generatedDocs/Doc-2_Patch_v1.0.9.md:49`
   — *"The stage enum is closed at the five values above."* (On how that precedent's posture differs
   from this one, see §3.4.)

2. **Each value is bound by pointer, never restated** (`CLAUDE.md:193`, quoted in full at §3.6):

   | Identifier | Denotes the frozen preset at | Display name (governed there, **not** restated as authority) |
   |---|---|---|
   | `consultant` | `Master_System_Architecture_v1.0_FINAL.md:216` | *Service Provider / Consultant* |
   | `mro_retail_supplier` | `:217` | *MRO / Retail Supplier* |
   | `importer_equipment_seller` | `:218` | *Importer / Equipment Seller* |
   | `manufacturer` | `:219` | *Manufacturer* |
   | `engineering_firm` | `:220` | *Engineering Firm* |

   The display names and the four capability cells of every row are governed at those lines and are
   **not** reproduced, interpreted, or altered by this patch. The display-name column above is a
   reading aid for the Board; on any divergence the frozen line governs.

3. **Metadata, never authoritative for capability.** Capability is and remains the four booleans
   `can_supply` / `can_service` / `can_fabricate` / `can_consult` (Invariant #1).
   `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:88` (MK-CR4): *"Capability = matrix, not label
   (Invariant #1, MK-CR4): four independent booleans; no `vendor_type` enum derived from them in the
   DB (`vendor_type_preset` is a UI preset label, not the capability source of truth)."*

4. **Seed-once, not a live relationship.** `Master_System_Architecture_v1.0_FINAL.md:222`: *"The
   preset seeds the flags; the flags — not the preset name — drive all matching."* No runtime
   derivation, no reverse mapping. **A vendor whose flags diverge from its preset is valid, not an
   inconsistency to reconcile.**

5. **Never collapsed in the UI.** `generatedDocs/Doc-7G_Content_v1.0_Pass1.md:46`: *"The profile
   editor presents the four independently; the UI never collapses them to a single 'vendor type.'"*

6. **Matching boundary.** Not a Phase-A eligibility gate. Matching filters on flags **covering** the
   RFQ's `work_nature` (`Master_System_Architecture_v1.0_FINAL.md:224`). **No M3 change is
   authorized.**

7. **Optional.** The attribute remains optional/nullable; "none of these" is NULL.

8. **Firewall.** No governance-signal read or write; no plan or entitlement coupling
   (Invariants #6, #10).

**No DDL change.** `generatedDocs/Doc-6D_Content_v1.0_Pass1.md:70` is already `text`. An optional DB
`CHECK` is **deferred** — recorded, not coined.

---

## 3. Why this is additive

| Test | Result |
|---|---|
| Does any frozen sentence change truth value? | **No.** `Master_System_Architecture_v1.0_FINAL.md:212` — *"Five named vendor types exist purely as **presets** over these flags"* — stays exactly true; this declares five. |
| Is a preset added, renamed, removed or reseeded? | **No.** No display name is touched (§3.5). |
| Is any capability cell changed? | **No.** `:216–:220` are untouched. |
| Does it coin a vendor-type taxonomy **replacing** capability? | **No** — Invariant #1 test, §3.7. |
| Is the notation novel? | **No** — three sibling attributes in the same cell already carry inline domains (`:731`). But the notation is not itself closure-bearing (§3.3). |
| Is Doc-2 §10.3 the owning location? | **Yes** — §3.2, on three anchors, with the imprecision disclosed. |
| Does Doc-4A classify this change as additive? | **The closest on-point row says yes** — §3.1. |
| May a Doc-2 additive patch close a value set? | **Yes** — `Doc-2_Patch_v1.0.9.md:49`, with the posture difference disclosed at §3.4. |

### 3.1 Change class under Doc-4A — the on-point row, and what Doc-4A does not classify

**Disclosure.** The superseded v1.0.11 presented, inside quotation marks, a sentence
*"Domain change → Doc-2 §5 patch first → Post-patch contract update"* attributed to
`Doc-4A_Content_v1.0_Pass5.md:242`. **No such sentence exists in the corpus.** It was three cells of
a table reflowed with arrows. Review-A raised it as M-2; it is withdrawn here without qualification,
and the underlying claim is re-derived below. The `:242` row was also the wrong row: it reads
*New enum value in entity state (affects state machine)*, and `vendor_type_preset` is **not** a state
field — Doc-2 §5 declares no machine for it, and §5.3 governs `claim_state`/`status`.

The change-class table at `Doc-4A_Content_v1.0_Pass5.md:234–247` contains **no row for a new value
domain on a non-state entity attribute.** Within that table, the closest rows are:

| Line | Row (rendered as a table row, not quoted as prose) | Bearing |
|---|---|---|
| `:236` | `New optional enum value for a filter/sort parameter` · **Additive** · Version: None · Consumer: *Consumers must declare tolerance (§16.7 analogous)* | **On point.** `Doc-4D_…_PassB_Discovery.md:20` and `:27` declare `vendor_type_preset` an allowlisted hard **filter** in `search_catalog`. Its wire-visible effect is exactly the class `:236` names **Additive**. |
| `:243` | `New entity or aggregate` · Domain change · *N/A — Doc-2 patch first* · *Post-patch contract update* | Analogous only on **sequence**: domain-level changes are patched in Doc-2 first, and the contract update follows. Not a class match — no entity or aggregate is created here. |
| `:239` | `Change field type or semantics` · **Breaking** | Would apply if the attribute's type or semantics changed. Neither does: `text`/nullable and "UI preset label" both stand. |

**Conclusion.** This change is classified **Additive** on `:236`, and its Doc-2-first sequencing
follows the pattern `:243` exemplifies. Where Doc-4A is silent — the exact class of a new value
domain on a non-state attribute — that silence is stated, not papered over, and the Board is asked
to confirm the classification rather than being shown a rule that does not exist.

**Carried consequence.** `:236`'s consumer column requires that **consumers declare tolerance**.
Carried into §8 as an obligation of the dependent contract update.

### 3.2 Is Doc-2 §10.3 the owning location?

**Disclosure first.** `Doc-4A_Content_v1.0_Pass3.md:46` reads: *"Enum fields are declared
`enum(<source pointer>)`, where the pointer names the owning corpus location (Doc-2 §5 state values,
Doc-2 §3 entity attributes, Doc-3 defined value sets)."* The superseded v1.0.11 quoted this line as
its central authority and then applied it to **§10.3** without disclosing the substitution. That was
Review-A's M-1, and it is well taken: **Doc-2 §3 (`:242–403`) is the Entity Catalog** — four columns,
Entity / Purpose / Tenant Scope / Lifecycle — and carries **no attributes and no value domains**;
§3.3 (`:274`) names `vendor_profiles` with zero attribute detail. `Doc-4A_Content_v1.0_Pass1.md:172`
carries the same imprecision in its source column ("Doc-2 §5, §3"). So Doc-4A's section labels for
attribute-level truth are **loose**, in two places, and cannot by themselves settle the location.

The corpus resolves the looseness elsewhere, at three anchors, each re-derived from disk:

| Anchor | Text / content | What it establishes |
|---|---|---|
| `Doc-4A_Content_v1.0_Pass1.md:169` | Field names → source of truth: **"Doc-2 §3, §10"** | Doc-4A treats **§3 and §10 as a paired register** for attribute-level truth. Pass3:46's bare "§3" is a shorthand for that pair, not an exclusion of §10. |
| `Doc-6D_Content_v1.0_Pass1.md:70` | `vendor_type_preset          text,                              -- [Doc-2 §10.3]` | The **realized DDL column** is annotated by the frozen database blueprint as sourced from **§10.3**, by name. |
| `Doc-4D_Content_v1.0_PassA.md:81` | *"edit profile attributes — capability flags (`can_supply/service/fabricate/consult`), geography, `vendor_type_preset`, presentation anchor (Doc-2 §10.3)"* | A **frozen rank-0 contract document** points `vendor_type_preset` at **§10.3 by name.** |

**Conclusion.** Two frozen rank-0 documents name §10.3 as this attribute's owning location, and
Doc-4A's own field-name row pairs §3 with §10. Doc-2 §10.3 is the owning location. The record now
carries the seam rather than concealing it.

### 3.3 Where the closure resides — and why not in the parenthesis alone

Review-A raised (m-2) that the inline-parenthesis notation is **ungoverned and demonstrably
non-exhaustive**, and the objection holds on both counts:

- **Ungoverned:** Doc-2 §0.4 Notation (`:55–60`) defines `(AR)`, `VO`, the tenancy classes, and the
  currency rule. It **does not define the inline parenthetical attribute notation at all.**
- **Non-exhaustive:** in the very cell this patch imitates, the sibling `visibility(public)` lists
  **one** value, where CLAUDE.md Invariant #3 gives the scope as `buyer_private | public`. The
  notation therefore demonstrably does not carry closure.

**Resolution.** The closure is placed in **Binding rule 1** above, on the
`Doc-2_Patch_v1.0.9.md:41` precedent ("Binding rules (freeze-level):"), and the amendment text
carries the **membership**. Reconciling this against the "No other text … is amended" line: that
line scopes the **edit to Doc-2's existing prose** — exactly one token at `:731` is replaced. The
Binding rules are **new patch text folded alongside** Doc-2, in the same form v1.0.9 used; they add,
they do not amend. Both statements are true and the residence is no longer ambiguous.

### 3.4 The v1.0.9 precedent — what it does and does not reach

`Doc-2_Patch_v1.0.9.md:49` — *"The stage enum is closed at the five values above"* — is quoted
correctly and does establish that a Doc-2 additive patch may **coin and close** a value set.

**The postures differ, and the difference must be on the record.** v1.0.9 coined for the
Vendor-Buyer-Relationship aggregate that the *same patch introduced*, where no other rank-0 document
held a competing register of the concept. **This patch coins alongside an existing rank-0 register**
(`Master_System_Architecture_v1.0_FINAL.md:214–220`).

Why that does not defeat the coining authority: the pre-existing register holds **display names and
capability cells**, which this patch neither restates nor alters; the domain being declared is the
**machine-readable membership of an attribute**, which that register does not hold and §3.2 shows
Doc-2 §10.3 owns. The two registers govern different things over the same five rows. v1.0.9 supports
the closure mechanism; the owning-location argument at §3.2, not v1.0.9, carries the coining.

### 3.5 ⚠️ The Board judgement, and the identifier ruling

`Master_System_Architecture_v1.0_FINAL.md:214–220` gives the five presets as **display names**. This
patch declares five **machine-readable identifiers**. Two readings:

- **Additive realization (asserted here):** Doc-2 §10.3 is the owning location for attribute value
  domains (§3.2), and Doc-2 patches may close value sets (§3.4). Declaring the domain in the owning
  document is realization of an existing concept, not invention of a new one. The Master register
  keeps its display names; the identifiers point at its rows.
- **Re-keying (the contrary reading):** if a display string is today's identity, minting an
  identifier relocates identity onto the slug — which would touch the frozen rows.

**Evidence that the row, not the string, is identity** *(this was absent from v1.0.11; Review-A
raised it as OBS-1 and it is the strongest argument available)*: the corpus **already** renders this
same five-preset family under a **divergent display set inside `generatedDocs/`** —
`iVendorz_Master_Overview_v1.0.md:195` gives *"(Service Provider, MRO Supplier, Importer,
Manufacturer, Engineering Firm)"* against `Master_System_Architecture_v1.0_FINAL.md:216–220`'s
*"Service Provider / Consultant"*, *"MRO / Retail Supplier"*, *"Importer / Equipment Seller"*,
*"Manufacturer"*, *"Engineering Firm"*. Under the re-keying reading, in which the string is the key,
the corpus would **already be self-contradictory**. It is not — because the **row** is identity and
the string is presentation. That is Invariant #9 (Content ≠ Presentation) operating on the frozen
text itself.

**This patch takes the first reading and records the second for the Board.** **If the Board takes
the second reading, this patch must be WITHDRAWN pending the parked rank-0 track.** There is no
surviving variant: v1.0.11 offered a fallback of *"the display names used verbatim as values"*, and
that fallback is **unexecutable** — `Doc-4A_Content_v1.0_Pass1.md:172` requires enum values to be
*"lowercase `snake_case`"*, which *"Service Provider / Consultant"* is not. Review-A raised this as
M-4; the fallback is withdrawn.

#### NAM-1 — DECIDED. Row 1's identifier is `consultant`.

Review-A argued that persisting `service_provider_consultant` bakes a name P-1 declares defective
into a wire token, and that this is *"a decision to be taken now, not a carried-OPEN item."*
**Owner ruling, 2026-07-22: row 1 is minted as `consultant`.**

| Ground | Anchor |
|---|---|
| **No frozen text changes.** Row 1's display name stays *"Service Provider / Consultant"* verbatim. Nothing is renamed, so no amendment is required and the parked track stays off the critical path. | `Master_…_FINAL.md:216` |
| **No derivation rule constrains the choice.** Within the sources enumerated in this patch, no governed display-name → identifier derivation rule was identified. Where the corpus has required one it minted it as a normative instrument — `00_AUTHORITY_MAP.md:55` records Doc-2 v1.0.5 adding a *"normative CHR algorithm"* for vendor slugs. Absent such a rule, `service_provider_consultant` carried no more authority than `consultant`; both are hand transforms, and the Board picks the one that does not encode a known defect. *(Bounded per `RankZero_Instruments_Coordination_Register_v1.0.md:71–76` — sweep boundary as stated, not an absence claim.)* | — |
| **It conforms to the one convention that does bind.** Enum values are *"lowercase `snake_case`"*. `consultant` conforms. | `Doc-4A_…_Pass1.md:172` |
| **It is forward-compatible with the parked track**, which already elects `consultant` for row 1. If P-1/P-2 ever land, row 1's identifier needs **no rename** — the expensive operation is avoided outright, not deferred. | Owner ruling 2026-07-21 (six-preset election, parked) |
| **Invariant #9 covers the slug/label divergence.** The identifier is content; the display name remains presentation. `Overview:195` vs `FINAL:216–220` shows the corpus already tolerating exactly this. | Invariant #9 |

**Scope of the ruling.** It settles the **identifier** only. **P-1 — that row 1 is *named* for a
service capability its seeds do not grant — remains OPEN and parked** (§7). The two must not be
conflated: NAM-1 was about the token, P-1 is about the capability seed. The other four identifiers
are unchanged.

**Stated explicitly so it is not left to inference.** `consultant` is minted as the **identifier**
for the row whose **frozen display name remains `Service Provider / Consultant`**
(`Master_…_FINAL.md:216`) — a Content ≠ Presentation split (Invariant #9), **orthogonal to P-1**,
which is a proposal to change the *display name*. **Adopting the identifier does not pre-commit the
display name in either direction.** If P-1 is later rejected, `consultant` still stands as the slug
for a row displayed as *"Service Provider / Consultant"* — exactly as `mro_retail_supplier` stands
for a row the corpus already displays two ways (`Overview:195` vs `FINAL:217`). If P-1 is later
approved, no rename is required. The identifier is therefore **independent of P-1's outcome**, not a
partial execution of it, and this patch neither borrows authority from the parked track nor forecloses
its options.

### 3.6 `CLAUDE.md:193` in full — pointer-binding against "never invent"

The line reads, in full: *"**Reference-never-restate** — bind frozen entities/slugs/events/audit
actions/POLICY keys **by pointer**; never copy or invent."* v1.0.11 cited it as the heading of a
minting act while quoting only the pointer clause. Review-A raised the elision (m-7); the full
clause is quoted here and answered:

This patch **binds by pointer** — the five rows are referenced at `:216`–`:220` and neither their
display names nor their capability cells are copied as authority (the display column in Binding
rule 2 is explicitly a reading aid, subordinate to the frozen line). It **does not invent**: no
preset, capability, name, or concept is created. What it declares is the machine-readable membership
of an attribute the corpus already froze, in the document §3.2 shows owns that membership. Minting a
key for an existing row is realization; inventing would be adding a row. **This patch adds no row —
see §7, where the row that is genuinely missing stays OPEN.**

### 3.7 Invariant #1 — the FE-PUB-09 rejection, surfaced

**This is the most adverse prior decision in scope and v1.0.11 did not show it to the Board.**
Review-A raised it as M-3. Stated in full:

- `docs/product/requirements/digital_showcase_planning_and_design.md:393` (**B1**) records that a
  four-preset business-shape family *"render[s] a coined vendor-type label family in production
  while `ESC-MKT-VENDORTYPE` is OPEN and FE-PUB-09 (2026-07-03) already REJECTED that family on
  **Invariant #1** grounds"* — disposition *"VALID · ESCALATED — Flag-and-Halt (§11), NOT resolved
  locally"*, presets **WITHHELD from production** pending a Board ruling.
- `:385` restates the standing gate: *"no coined vendor-type values while `ESC-MKT-VENDORTYPE` is
  open (Invariant #1 precedent: vendor-type labels rejected at FE-PUB-09)."*

**Distinction, argued on frozen text.** What FE-PUB-09 rejected was a coined label family standing
**in place of** capability. Invariant #1 holds that capability is a **matrix**, not a label. The five
presets in this patch are not a competing capability model: `Master_…_FINAL.md:212` frames them as
existing *"purely as **presets** over these flags"*, and `:222` states *"the flags — not the preset
name — drive all matching."* `Doc-6D_…_Pass1.md:88` (MK-CR4) forbids deriving any `vendor_type` enum
from the flags in the DB and fixes the attribute as *"a UI preset label, not the capability source of
truth."* `Doc-7G_…_Pass1.md:46` requires the editor to present the four flags independently and that
*"the UI never collapses them to a single 'vendor type.'"* This patch declares the membership of a
label the frozen corpus already defines and already subordinates to the matrix. Binding rules 3–6
carry that subordination forward.

**What the distinction does not cover — and the gate that follows.** FE-PUB-09's concern was
**production rendering**, and `src/frontend/components/vendor-card.tsx:99–101` renders this label
publicly (`{vendor.businessType}` in a `Badge`; the file's own comment at `:10` identifies
`businessType` as M2's `vendor_type_preset`). Adopting a domain does not adjudicate whether the
label may render in production. See §4.

**This patch takes no position on B1 and must not be treated as resolving it.** B1's Flag-and-Halt
escalation is the Board's; `:106`, `:353`, `:385` carry the same gate.

---

## 4. Realization gates — **(Informative — Non-Normative)**

> **Altitude disclosure.** Review-A raised (m-1) that v1.0.11 declared a control *"binding on FE
> realization"* inside a rank-0 domain patch, with nothing to enforce it — the patch's own §5 states
> FE realization is not authorized here, so the control bound a work item with no owner, no handle,
> no consumer. Doc-2 governs the domain model; FE conduct is Doc-7G's. **The substance below is
> retained; the instrument is corrected.** These are recorded as informative findings of this patch.
> They acquire binding force only when carried into their proper home — a Doc-7G item or a
> registered `esc_registry.md` row. **As of this draft they have no enforceable home**, and the
> Board is asked to direct where they land. Nothing here is normative on FE.

**G-A · The `service_provider` mapping (mis-routing harm).** The shipped editor offers
`service_provider` (`app/(app)/_components/vendor/company/capabilities-capacity-form.tsx:41`).
Mapping it onto row 1 would map it onto the frozen row that seeds `can_consult`, with `can_service`
at `–` (`Master_…_FINAL.md:216`). Today that string is unvalidated and the form has no submission
wiring; after adoption it becomes a **governed identifier**, and a maintenance or installation vendor
selecting the option labelled "Service provider" would be seeded the opposite capability — and under
`:224`, whose engine filters vendors whose flags **cover** the RFQ's `work_nature`, routed work it
cannot perform, undetectably. **Finding:** no "service provider" option should map onto `consultant`;
until P-1 and P-2 are ruled (§7), a service-led vendor's preset is left **NULL**. Adopting this patch
does not authorize that mapping. *(The identifier rename at §3.5 removes the misleading label; it does
not remove this harm, which is a property of the row's seeds, not its name.)*

**G-B · Public rendering (Invariant #1 / FE-PUB-09).** `src/frontend/components/vendor-card.tsx:99–101`
renders the preset label in a public surface. Per §3.7, whether a preset label may render in
production is governed by the FE-PUB-09 precedent and B1's open escalation, **not** by this patch.
**Finding:** adoption of this value domain is not authority to render the label publicly; that
disposition belongs with B1.

---

## 5. Impact

| Surface | Impact |
|---|---|
| `prisma/schema.prisma` · `prisma/migrations/` | **None.** 11 migration directories, all `core`/`identity`; no `VendorProfile` model; only `Organization.hasVendorProfile:204`. |
| Stored data | **None.** Nothing persists the attribute; adoption costs no migration. That window closes when the M2 tables land. |
| `app/(app)/_components/vendor/company/capabilities-capacity-form.tsx:39–41` | `manufacturer` → `manufacturer` (unchanged) · `trader` → `mro_retail_supplier` (**not asserted — see below**) · `service_provider` → **NULL**, per G-A. |
| `src/frontend/components/vendor-card.tsx:37–41, :99–101` | Renders the label publicly; gated by G-B. Its doc-comment (`:10`) points at the superseded proposal and must be re-pointed on realization. |
| `app/(public)/_components/discovery/seed.ts:55–118` | 8 demo entries / 6 distinct labels. **`"Manufacturer"` exact-matches `:219`**; `"Supplier / Distributor"`, `"Importer / Distributor"`, `"Importer"`, `"Fabricator"`, `"Engineering Consultant"` do not. Requires reconciliation. |
| `profile-overview.tsx:57` | Renders the value **raw**; an identifier → display-name lookup is required in the same change. |
| `types.ts:42` | `vendor_type_preset?: string` narrows to the five-member union. |
| M3 matching | **None.** Flags remain the sole eligibility input (`Master_…_FINAL.md:224`). |

**`trader` → `mro_retail_supplier` is NOT asserted by this patch.** Review-A raised (m-5) that
v1.0.11 stated this mapping as fact while gating the other. The two candidate rows are
**behaviourally indistinguishable** — `:217` (MRO / Retail Supplier) and `:218` (Importer /
Equipment Seller) both seed `✓ – – –`. The choice between them is therefore a **semantic judgement,
not a capability one**, and no frozen text decides it. It is recorded as an FE-realization question
alongside G-A and G-B, not settled here.

**FE realization is not authorized by this patch.**

---

## 6. `ESC-MKT-VENDORTYPE` — values half only

`esc_registry.md:92` scopes the handle to **two** gaps: *"`vendor_type_preset` enumerates **no
values**; net-new vendor 'commercial capability' facets (brand/OEM-authorization) unmodeled."* This
closes the first. The second — with its channel *"net-new facets → future M2 patch"* — is
**expressly preserved**.

The row is **amended row-wise** across Scope/gap, Interim presentation and Channel — the table has
**no status column** (`esc_registry.md:25` is the header: `| Handle | Scope / gap | Interim
presentation | Channel |`). It must **not** use the whole-handle ✅ resolution mechanism seen at
`esc_registry.md:96` (`ESC-RFQ-MATCH-EVOLVE`): that mechanism closes a handle entirely, which is
wrong for a half-closure.

**Registered-channel deviation, declared.** `esc_registry.md:92`'s Channel currently reads
*"Additive `Doc-4D_VendorTypePreset_Values` patch (Board)."* This proposal **reroutes** that channel
to a Doc-2 §10.3 patch, on the grounds at §3.2 and the Review-A rejection of the Doc-4D route
(`Doc-4A_…_Pass3.md:47`). The row-wise amendment includes Channel, so the deviation is carried — but
it **is** a deviation from a registered channel and is called out as one rather than executed
silently. *(Review-A OBS-4.)*

**Two dependencies the Board should see before any closure:**

- **B1** — `docs/product/requirements/digital_showcase_planning_and_design.md:393` withholds four
  business-shape presets from production **expressly because this handle is OPEN**, and records the
  FE-PUB-09 Invariant #1 rejection (§3.7); `:106`, `:353`, `:385` carry the same gate. **This patch
  takes no position on B1 and must not be treated as closing it.**
- **`ESC-RFQ-MATCH-EVOLVE` item ③** — `esc_registry.md:96` records *"industry/business-type ranking
  stays DEFERRED pending Track-1 (`ESC-CLASS-INDUSTRY`/`ESC-MKT-VENDORTYPE`)"*; full record at
  `governanceReviews/BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md`. Closing half this handle touches that
  deferral's premise. **No M3 change is authorized here**; recorded so the deferral's basis stays
  accurate.

---

## 7. What this does NOT fix — carried, OPEN

| ID | Finding | Status |
|---|---|---|
| **P-1** | Frozen row 1 is named *"Service Provider / Consultant"* but seeds `can_consult` only (`Master_…_FINAL.md:216`). The name promises a capability the seed does not grant. | **OPEN** — requires renaming a frozen row. |
| **P-2** | No preset seeds `can_service` alone; service-led vendors have no correct entry point. The only row seeding `can_service` is `:220`, which seeds all four. | **OPEN** — requires adding a preset row, and editing `:212` ("Five"). |
| **C-6** | `engineering_firm` seeds **all four** flags (`:220`), over-seeding a consulting-only firm. Pre-existing, frozen. | **OPEN** |
| **OBS-2** | `:217` and `:218` are **capability-identical** (`✓ – – –`), so two identifiers are minted for behaviourally indistinguishable rows. Pre-existing and frozen, on the same footing as C-6. *(Added on Review-A OBS-2 — v1.0.11 listed C-6 and not this.)* | **OPEN** |
| ~~NAM-1~~ | ~~Identifier for row 1~~ | **CLOSED** — decided at §3.5 (owner ruling 2026-07-22): `consultant`. |

**P-1, P-2, C-6 and OBS-2 require the parked rank-0 amendment track.** `00_AUTHORITY_MAP.md:42`
permits a FROZEN document to be *"changed only by additive patch"*, and neither a rename nor a
sixth row can be expressed additively. The instrument that would create a lawful amendment path
(`governanceReviews/Governance_RankZero_Amendment_Mechanism_*_PROPOSAL.md`, intended fold form
**ADR-027**, which **does not yet exist**) is **PARKED by owner ruling 2026-07-21** after three
non-converging Review-A rounds. It is **not** on this patch's critical path and is not reopened here.

⚠️ **Provenance note (carried from v1.0.11, unresolved):** a `…v1.3_PROPOSAL.md` and
`governanceReviews/RankZero_Instruments_Coordination_Register_v1.0.md` are present on disk whose
authorship is unaccounted for in the drafting session; the parked state should be re-confirmed
against the latest draft before relying on it. *(The Register is nonetheless cited above for its
Board-ruled §5 Method control, which the owner ruled 2026-07-21.)*

**This patch is deliberately narrower than the problem.** It makes the field usable; it does not make
the register correct.

**G-1 (legacy base/patch precedence) is not carried here** — it is unrelated to this attribute, and
its headline evidence has been superseded. `00_AUTHORITY_MAP.md:128` records `Doc-6C_Patch_v1.0.3`
correcting the permission-slug count to **45** and noting the base prose *"45 (38/7)"* was stale.
**Attribution correction** *(Review-A m-3)*: the phrase *"(the sole content authority, untouched)"*
in that row attaches to **`Doc-2_Patch_v1.0.8`**, not to "Doc-2 §7"; v1.0.11 re-pointed it.

---

## 8. Dependent contract update (linked pair, drafted separately)

On fold, `Doc-4D_Content_v1.0_PassB_VendorProfile.md:19, :48` and `…PassB_Discovery.md:20` update the
declaration to `vendor_type_preset : enum(Doc-2 §10.3)` — a **pointer**, in the form
`Doc-4A_Content_v1.0_Pass3.md:46` prescribes (*"Enum fields are declared `enum(<source pointer>)`"*),
never a restatement of the values. It carries no independent authority and is sequenced **after**
this patch, per the Doc-2-first pattern at `Doc-4A_…_Pass5.md:243`.

**Consumer-tolerance obligation.** `Doc-4A_…_Pass5.md:236` requires that *consumers declare
tolerance* for a new filter/sort enum value. The dependent update must carry that declaration for
`search_catalog`'s `vendor_type_preset` filter.

**Supersedes** `governanceReviews/Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` (7
values incl. `other`; crosswalk contradicting the frozen seeds; no identifiers) and
`governanceReviews/Doc-4D_VendorTypePreset_Values_Patch_v1.0.4_PROPOSAL.md` (rejected on route,
`Doc-4A_…_Pass3.md:47`). `ADR-023_Vendor_Buyer_Classification_Model_PROPOSAL.md` restates the 7-value
set at **Decision item 2, `:36–44`** — that document's headings are Context / Decision / Consequences
/ Alternatives / References, and it has **no §2**; `MASTER-CLASSIFICATION-DICTIONARY.md:49–50` and
`VENDOR-PROFILE-MODEL.md:23, :41–48` restate it. These are **downstream conformance tasks, not gates
on this patch** — sequencing a rank-0 fold behind unratified and lower-rank artifacts would invert
`CLAUDE.md §7`. `00_AUTHORITY_MAP.md:55` confirms the ADR-022/023 folds are pending.

---

## 9. Approval block

| Gate | Status |
|---|---|
| Review-A (independent) — on **v1.0.11** | ✅ run 2026-07-22 — 🟠 REVISION REQUIRED (0 B / 4 MAJ / 7 MIN / 2 NIT / 4 OBS); dispositioned §10 |
| Review-A (independent) — on **this revision** | ☐ not run |
| Review-B (independent) | ☐ not run |
| **§3.5 reading ratified — additive realization vs re-keying** | ☐ **not ratified** (reviewer sustained reading (i); the Board ratifies) |
| NAM-1 — row 1 identifier | ✅ **ruled `consultant`** (owner, 2026-07-22) — §3.5 |
| Human approval — rank-0 additive patch (`CLAUDE.md:139–140`) | ☐ not granted |
| Verification: Existing Text Reference matches `Doc-2_…_v1.0.2.md:731` verbatim | ✅ **run 2026-07-22** — token and all three sibling domains confirmed on disk |
| Verification: all citations in this document re-derived from disk (not inherited from v1.0.11) | ✅ **run 2026-07-22** |
| Fold as `generatedDocs/Doc-2_Patch_v1.0.12_VendorTypePresetValues.md` + linked Doc-4D update (§8) + `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md` | ☐ blocked |
| **FOLD OBLIGATION — record the `v1.0.11` reservation in `00_AUTHORITY_MAP.md`** (§1.1): the Doc-2 row must carry **`v1.0.11` — reserved; superseded pre-fold; do not backfill**, mirroring the rank-1 precedent at `ADR_Compendium_v1.md:58` (*"Number reserved. Do not backfill."*). **Without this the next author reads Doc-2 at v1.0.10 in the map and legitimately mints v1.0.11.** A disclosure inside the superseded artifact does not reach them; this is an obligation of the fold, not a manual promise. | ☐ **blocked — binding on fold** |
| `esc_registry.md:92` amended row-wise (values closed, facets carve-out preserved, channel deviation declared) | ☐ blocked |
| B1 (`digital_showcase…:393`) disposition acknowledged before ESC closure | ☐ not done |
| G-A / G-B (§4) assigned a binding home — Doc-7G item or registered ESC row | ☐ **not assigned — Board direction requested** |

Freeze/merge gate (`CLAUDE.md:225`): *"does not freeze or merge until **BLOCKER = 0 · MAJOR = 0 ·
MINOR = 0**."*

---

## 10. Review-A disposition — v1.0.11 findings

Per **Raise ≠ Accept** (`CLAUDE.md §13`): the reviewer raises, the author and the presiding authority
rule. Every finding is dispositioned; none is silently dropped.

| # | Finding | Disposition | Where |
|---|---|---|---|
| **M-1** | Authority anchor section-mismatched (§3 carries no attributes); bridging evidence uncited | **APPLIED** — mismatch disclosed; three real anchors substituted; Pass1:172's parallel imprecision also surfaced | §3.2 |
| **M-2** | Fabricated quotation at Pass5:242; wrong row (entity state) | **APPLIED** — quotation withdrawn and named as fabricated; `:236` substituted as on-point; Doc-4A's silence on this class disclosed; consumer-tolerance consequence carried | §3.1, §8 |
| **M-3** | FE-PUB-09 Invariant #1 rejection undisclosed; public rendering ungated | **APPLIED** — rejection surfaced verbatim with `:393`/`:385`; distinction argued on frozen text; Invariant #1 row added to §3's test table; G-B added | §3, §3.7, §4 |
| **M-4** | Stated fallback unexecutable under Pass1:172 | **APPLIED** — fallback withdrawn; consequence restated as withdrawal of the patch | §3.5 |
| **m-1** | GATE-VTP-1 out of altitude, unenforced | **APPLIED** — re-cast as (Informative — Non-Normative) G-A; substance retained; lack of a binding home stated plainly and Board direction requested | §4, §9 |
| **m-2** | Inline notation ungoverned and non-closure-bearing; closure residence ambiguous | **APPLIED** — closure relocated to Binding rule 1 on the v1.0.9:41 precedent; the `:80` tension reconciled | §3.3 |
| **m-3** | `00_AUTHORITY_MAP.md:128` quote misattributed | **APPLIED** — re-pointed to `Doc-2_Patch_v1.0.8` | §7 |
| **m-4** | v1.0.9 precedent under-analysed | **APPLIED** — posture difference stated; coining authority re-sourced to §3.2 | §3.4 |
| **m-5** | `trader` → `mro_retail_supplier` asserted without reasoning | **APPLIED** — assertion withdrawn; deferred as a semantic judgement, with `:217`/`:218` identity noted | §5 |
| **m-6** | §4/§5 internal tension (disclaims and directs FE) | **APPLIED** — dissolved by the §4 altitude correction; §5 no longer asserts a mapping | §4, §5 |
| **m-7** | `CLAUDE.md:193` adverse clause elided | **APPLIED** — clause quoted in full and answered | §3.6 |
| **NIT-1** | Pass5:241 is the `error_code` rename row; over-generalized | **APPLIED** — the rename-cost argument is removed (NAM-1's ruling avoids the rename); `:239` cited in the §3.1 table for the semantics class | §3.1 |
| **NIT-2** | Inconsistent path convention | **APPLIED** — repo-relative paths throughout (`esc_registry.md` at root; `generatedDocs/…` prefixed) | throughout |
| **OBS-1** | `Overview:195` divergent display set omitted — strongest argument for the patch's reading | **APPLIED** — promoted into the §3.5 argument | §3.5 |
| **OBS-2** | `:217`/`:218` capability-identical; absent from the carried-OPEN register | **APPLIED** — added as a carried-OPEN row | §7 |
| **OBS-3** | §9 Existing-Text-Reference verification marked "not run" | **APPLIED** — check run against disk 2026-07-22 and ticked | §9 |
| **OBS-4** | Registered-channel reroute not called out | **APPLIED** — declared as a deviation | §6 |

**Sustained without change** (Review-A verified; re-verified from disk here, not inherited): §6's ESC
half-closure construction · §5's code/Prisma impact claims · §8's refusal to sequence a rank-0 fold
behind unratified ADR-023 · the ADR-023 §-precision note · the bounded absence finding · the
Invariants #6/#10 firewall disclaimer · the verbatim MK-CR4 Invariant #1 protection · the patch-ID
derivation.

---

## 11. Red Flag Checklist

No hits. No new module · no ownership change (M2 attribute, M2 doc — One Module, One Owner intact) ·
no cross-module DB access or cross-schema raw SQL · no cross-module foreign key · no import beyond
another module's `contracts/` · no governance-signal read, write or cross-mutation · no workflow
owning state, no read-model as source of truth, no M9/AI authoritative data · no Admin bypass of an
owning module's domain · no ADR override · **no FROZEN document modified** — this is a proposal,
human-approval gated, folded by no AI action.

---

*End of Doc-2_Patch_v1.0.12_VendorTypePresetValues (PROPOSED) — supplies the closed value domain of
`vendor_type_preset` in §10.3: five identifiers bound by pointer to the frozen register at
`Master_System_Architecture_v1.0_FINAL.md:214–220`, in the inline notation its sibling attributes
already use, with closure carried in freeze-level Binding rules. No preset added, renamed, removed
or reseeded; no display name touched; no column, entity, state, event, permission, audit action,
ownership or DDL change. NAM-1 ruled (`consultant`). P-1, P-2, C-6 and OBS-2 remain OPEN and parked.
DRAFT — awaits HUMAN approval; not folded by AI.*
