# Doc-2_Patch_v1.0.11_VendorTypePresetValues_PROPOSAL.md

> **🛑 STATUS: SUPERSEDED 2026-07-22 by
> `governanceReviews/Doc-2_Patch_v1.0.12_VendorTypePresetValues_PROPOSAL.md`.** Never folded.
> Review-A returned 🟠 REVISION REQUIRED (0 BLOCKER / 4 MAJOR / 7 MINOR / 2 NIT / 4 OBS); all
> findings are dispositioned in v1.0.12 §10. **Retained on disk for the review trail — do not
> delete.** Two defects in this draft are load-bearing and must not be cited from here:
> **(a)** the banner's `Doc-4A_Content_v1.0_Pass5.md:242` quotation is **fabricated** — no such
> sentence exists in the corpus, and `:242` is the entity-state row (corrected at v1.0.12 §3.1);
> **(b)** the `Doc-4A_Content_v1.0_Pass3.md:46` "Doc-2 §3" anchor is section-mismatched — Doc-2 §3
> is the Entity Catalog and carries no attributes (corrected at v1.0.12 §3.2). Row 1's identifier
> `service_provider_consultant` is superseded by `consultant` (owner ruling 2026-07-22).
>
> ---
>
> *Original status block follows, unaltered:*
>
> **STATUS: DRAFT — ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-2 is **rank-0 frozen architecture**
> (`00_AUTHORITY_MAP.md:18`); changing it requires an **additive architecture patch with human
> approval** (`CLAUDE.md:139–140`) — never a skill decision. Not folded by any AI action.
>
> **Route corrected.** An earlier attempt placed this value set in a Doc-4D contract patch
> (`Doc-4D_VendorTypePreset_Values_Patch_v1.0.4_PROPOSAL.md`) and was **REJECTED at Review-A**:
> `Doc-4A_Content_v1.0_Pass3.md:47` — *"A request contract **MUST NOT** define a new enum or extend
> an existing one"* — and `:46` names **the owning corpus location** (Doc-2 §3 entity attributes) as
> where a value domain lives. `Doc-4A_Content_v1.0_Pass5.md:242` confirms the sequence: *"Domain
> change → Doc-2 §5 patch **first** → Post-patch contract update."* **This is that first step.**
>
> **Linked pair.** Fold together with the dependent Doc-4D contract update (§8), which will declare
> `vendor_type_preset : enum(Doc-2 §10.3)` per `Doc-4A_Content_v1.0_Pass3.md:46`. Precedent for
> linked-set folds: `00_AUTHORITY_MAP.md:55` (Doc-2 v1.0.5 + Doc-4D v1.0.2 + Doc-6D v1.0.1 + Doc-3
> v1.10).

## Status

| Field | Value |
|---|---|
| Patch ID | **PATCH-D2-10** (v1.0.10 = PATCH-D2-09; v1.0.9 = PATCH-D2-08) |
| Applies to | `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` **§10.3**, the `marketplace.vendor_profiles` attribute row (`:731`) |
| Produces | **Doc-2 v1.0.11** — next free label (§1.1) |
| Change class | **ADDITIVE** — supplies the value domain of an existing attribute, in the notation its siblings already use |
| Scope | The value domain of `vendor_type_preset`, bound by pointer to the **five presets already frozen** at `Master_System_Architecture_v1.0_FINAL.md:214–220`. **Nothing else.** |
| Does NOT | Add · rename · remove · reseed any preset · change the capability matrix · add a column, entity, state, event, permission or audit action · change ownership · change DDL |
| Resolves | `ESC-MKT-VENDORTYPE` — **values half only** (§6) |
| Authority | `CLAUDE.md §7/§8/§11/§13` · Invariant #1 · `Doc-4A_Content_v1.0_Pass3.md:46–47` · `Doc-6D_Content_v1.0_Pass1.md:88` (MK-CR4) · `Doc-7G_Content_v1.0_Pass1.md:46` |

### 1.1 Version label — derived from disk

Doc-2 patches present: `v1.0.3` … `v1.0.10` (`Doc-2_Patch_v1.0.10_GrowthHub.md` highest);
`00_AUTHORITY_MAP.md:55` records Doc-2 at **v1.0.10**. Next unused label: **v1.0.11**.

---

## 2. Problem

`vendor_type_preset` is a **frozen attribute with no declared value domain**.

| Fact | Anchor |
|---|---|
| Attribute exists in the §10.3 `marketplace.vendor_profiles` row | `Doc-2 …v1.0.2.md:731` |
| Column realized as `text`, nullable | `Doc-6D_Content_v1.0_Pass1.md:70` |
| Declared `vendor_type_preset : enum : optional` on create and update | `Doc-4D …PassB_VendorProfile.md:19, :48` |
| Exposed as an **allowlisted hard filter** — *"Filters = allowlisted **hard** attributes"* | `Doc-4D …PassB_Discovery.md:20, :27` |
| Gap registered | `esc_registry.md:92` (`ESC-MKT-VENDORTYPE`) |

**Bounded finding** (Board drafting control — bounded language, not an absence claim): *within
`generatedDocs/`, no machine-readable value domain is defined for this attribute anywhere.* The five
presets **do exist**, as **display names with capability cells**, at
`Master_System_Architecture_v1.0_FINAL.md:214–220`. What is missing is the domain declaration, not
the concept.

**The patch site is visible in the frozen text itself.** At `:731` every sibling attribute carries
its domain **inline in parentheses** — `claim_state(seeded/invited/claimed/verified)`,
`status(active/suspended/banned)`, `visibility(public)` — while `vendor_type_preset` appears
**bare**. This patch fills that one gap, in that exact notation.

**Consequences today:** the field cannot be validated; the discovery filter has no domain; and the
shipped editor at `capabilities-capacity-form.tsx:39–41` offers `manufacturer`, `trader`,
`service_provider` — matching no governance source.

---

# PATCH-D2-10 — `vendor_type_preset` value domain (§10.3)

**Existing Text Reference** — `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md:731`, within the
`marketplace.vendor_profiles` Key Attributes cell:

> `vendor_type_preset`

**Amendment Text** *(replacement, in the inline-domain notation used by the sibling attributes in
the same cell)*:

> `vendor_type_preset(service_provider_consultant/mro_retail_supplier/importer_equipment_seller/manufacturer/engineering_firm)`

**No other text in `:731`, in §10.3, or anywhere in Doc-2 is amended.**

### Binding — by pointer, never restated (`CLAUDE.md:193`)

Each value denotes one preset already frozen at `Master_System_Architecture_v1.0_FINAL.md:214–220`,
in the order given there. **The display names and the four capability cells of every row are
governed there and are not reproduced, interpreted, or altered by this patch.**

| Value | Denotes the frozen preset at |
|---|---|
| `service_provider_consultant` | `Master…FINAL.md:216` |
| `mro_retail_supplier` | `:217` |
| `importer_equipment_seller` | `:218` |
| `manufacturer` | `:219` |
| `engineering_firm` | `:220` |

**The domain is closed at these five values.** Precedent for a Doc-2 additive patch closing a value
set: `Doc-2_Patch_v1.0.9.md:49` — *"The stage enum is closed at the five values above."*

### Binding rules

- **Metadata, never authoritative for capability.** Capability is and remains the four booleans
  `can_supply` / `can_service` / `can_fabricate` / `can_consult` (Invariant #1). The preset is **not**
  derived from the flags and **must not** override them — `Doc-6D_Content_v1.0_Pass1.md:88` (MK-CR4):
  *"`vendor_type_preset` is a UI preset label, not the capability source of truth."*
- **Seed-once, not a live relationship.** Per `Master…FINAL.md:222` the preset **seeds** the flags at
  authoring time and the vendor may override any of them. No runtime derivation, no reverse mapping.
  **A vendor whose flags diverge from its preset is valid, not an inconsistency to reconcile.**
- **Never collapsed in the UI.** `Doc-7G_Content_v1.0_Pass1.md:46`: the editor presents the four flags
  independently and *"the UI never collapses them to a single 'vendor type.'"*
- **Matching boundary.** Not a Phase-A eligibility gate; matching filters on flags covering the RFQ's
  `work_nature` (`Master…FINAL.md:224`). **No M3 change is authorized.**
- **Optional.** The attribute remains optional/nullable; "none of these" is NULL. **No `other` value
  is minted.**
- **Firewall.** No governance-signal read or write; no plan or entitlement coupling (Invariants #6, #10).

**No DDL change.** `Doc-6D_Content_v1.0_Pass1.md:70` is already `text`. An optional DB `CHECK` is
**deferred** — recorded, not coined.

---

## 3. Why this is additive

| Test | Result |
|---|---|
| Does any frozen sentence change truth value? | **No.** `Master…FINAL.md:212` *"Five named vendor types exist"* stays exactly true — this declares five. |
| Is a preset added, renamed, removed or reseeded? | **No.** |
| Is the notation novel? | **No** — three sibling attributes in the same cell already carry inline domains (`:731`). |
| Is Doc-2 the owning location? | **Yes** — `Doc-4A_Content_v1.0_Pass3.md:46` names *"Doc-2 §3 entity attributes"* as the owning corpus location for an attribute's value domain. |
| May a Doc-2 additive patch close a value set? | **Yes** — `Doc-2_Patch_v1.0.9.md:49`. |

### 3.1 ⚠️ The one Board judgement — raised, not resolved

`Master…FINAL.md:214–220` gives the five presets as **display names**. This patch coins five
**machine-readable identifiers**. Two readings:

- **Additive realization (asserted here):** Doc-2 §10.3 is the owning location for attribute value
  domains (`Doc-4A Pass3:46`), and Doc-2 patches may close value sets (`v1.0.9:49`). Declaring the
  domain in the owning document is realization of an existing concept, not invention of a new one.
  The Master register keeps its display names; the identifiers point at its rows.
- **Re-keying (the contrary reading):** if a display string is today's identity, minting an
  identifier relocates identity onto the slug — which would touch the frozen rows.

**This patch takes the first reading and flags the second for the Board.** The route correction
materially strengthens the first reading relative to the rejected Doc-4D attempt: the minting now
happens in the **owning** document rather than in a contract forbidden to mint. **If the Board takes
the second reading, the identifiers must come from the parked rank-0 track instead** — the rest of
this patch would survive with the display names used verbatim as values.

---

## 4. ⚠️ Gate — the `service_provider` mapping must not ship

The shipped editor offers `service_provider` (`capabilities-capacity-form.tsx:41`). Mapping it to
`service_provider_consultant` maps it onto the frozen row that seeds **`can_consult`** with
`can_service` at `–` (`Master…FINAL.md:216`).

Today that string is unvalidated and the form has no submission wiring. After adoption it becomes a
**governed identifier**, and a maintenance or installation vendor selecting the option labelled
"Service provider" would be seeded the opposite capability — and under `:224` routed the wrong
`work_nature`. That is a live matching-correctness harm.

> **GATE-VTP-1 (binding on FE realization):** the FE **must not** map any "service provider" option
> onto `service_provider_consultant`. Until **P-1 and P-2 are ruled** (§7), a service-led vendor's
> preset is left **NULL**. Adopting this patch does not authorize that mapping.

A disclosure in an impact table is not a control; this is stated as a gate because Review-A found the
disclosure insufficient.

---

## 5. Impact

| Surface | Impact |
|---|---|
| `prisma/schema.prisma` · `prisma/migrations/` | **None.** 11 migrations, all `core`/`identity`; no `VendorProfile` model; only `Organization.hasVendorProfile:204`. |
| Stored data | **None.** Nothing persists the attribute; adoption costs no migration. That window closes when the M2 tables land. |
| `capabilities-capacity-form.tsx:39–41` | `manufacturer` → `manufacturer` (unchanged) · `trader` → `mro_retail_supplier` · `service_provider` → **NULL, per GATE-VTP-1** (§4). |
| `profile-overview.tsx:57` | Renders the value **raw**; a value → display-name lookup is required in the same change. |
| `app/(public)/_components/discovery/seed.ts:55–118` | 8 demo entries / 6 distinct labels. **`"Manufacturer"` exact-matches `:219`**; `"Supplier / Distributor"`, `"Importer / Distributor"`, `"Importer"`, `"Fabricator"`, `"Engineering Consultant"` do not. Requires reconciliation. |
| `vendor-card.tsx:37–41, :99–101` | Renders the label publicly; its doc-comment points at the superseded proposal (§7) and must be re-pointed. |
| `types.ts:42` | `vendor_type_preset?: string` narrows to the five-member union. |
| M3 matching | **None.** Flags remain the sole eligibility input. |

FE realization is **not authorized by this patch**.

---

## 6. `ESC-MKT-VENDORTYPE` — values half only

`esc_registry.md:92` scopes the handle to two gaps. This closes the first; the second —
*"net-new vendor 'commercial capability' facets (brand/OEM-authorization) unmodeled"*, channel
*"net-new facets → future M2 patch"* — is **expressly preserved**.

The row is **amended row-wise** across Scope/gap, Interim presentation and Channel (the table has
**no status column**, `:25`). It must **not** use the whole-handle ✅ resolution mechanism seen at
`esc_registry.md:96` (`ESC-RFQ-MATCH-EVOLVE`) — that mechanism closes a handle entirely, which is
wrong for a half-closure.

**Two dependencies the Board should see before any closure:**

- `docs/product/requirements/digital_showcase_planning_and_design.md:393` (**B1**) withholds four
  business-shape presets from production **expressly because this handle is OPEN**; `:106`, `:353`,
  `:385` carry the same gate. **This patch takes no position on B1 and must not be treated as closing
  it.**
- `BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md` item **3** defers business-type ranking *pending Track-1
  (`ESC-CLASS-INDUSTRY` / `ESC-MKT-VENDORTYPE`)* — per `esc_registry.md:96`. Closing half this handle
  touches that deferral's premise. **No M3 change is authorized here**; recorded so the deferral's
  basis stays accurate.

---

## 7. What this does NOT fix — carried, OPEN

| ID | Finding | Status |
|---|---|---|
| **P-1** | Frozen row 1 is named *"Service Provider / Consultant"* but seeds `can_consult` only (`Master…FINAL.md:216`). The name promises a capability the seed does not grant. | **OPEN** — requires renaming a frozen row. |
| **P-2** | No preset seeds `can_service` alone; service-led vendors have no correct entry point. | **OPEN** — requires adding a preset row. |
| **C-6** | `engineering_firm` seeds **all four** flags (`:220`), over-seeding a consulting-only firm. Pre-existing, frozen. | **OPEN** |
| **NAM-1** | `service_provider_consultant` bakes the P-1-defective name into a persisted identifier, and `manufacturer` (bare) sits near a parked `manufacturer_workshop` proposal. `Doc-4A_Content_v1.0_Pass5.md:241` treats wire-token renames as **Breaking**, so these are expensive to undo after the M2 tables land. | **OPEN — accept knowingly or defer** |

**P-1 and P-2 require the parked rank-0 amendment track** — `Governance_RankZero_Amendment_Mechanism_*_PROPOSAL.md`
(intended fold form **ADR-027**, which **does not yet exist**; the election is marked *owner
direction, pre-review, non-folding*). ⚠️ **Provenance note:** a `…v1.3_PROPOSAL.md` and a
`RankZero_Instruments_Coordination_Register_v1.0.md` are present on disk whose authorship is
unaccounted for in the drafting session; the parked state should be re-confirmed against the latest
draft before relying on it.

**This patch is deliberately narrower than the problem.** It makes the field usable; it does not make
the register correct.

**G-1 (legacy base/patch precedence) is not carried here** — it is unrelated to this attribute, and
its headline evidence has been superseded: `00_AUTHORITY_MAP.md:128` shows `Doc-6C_Patch_v1.0.3`
correcting the count to 45 and recording that the *base prose was stale*, naming Doc-2 §7 as *"the
sole content authority, untouched."*

---

## 8. Dependent contract update (linked pair, drafted separately)

On fold, `Doc-4D_Content_v1.0_PassB_VendorProfile.md:19, :48` and `…PassB_Discovery.md:20` update the
declaration to `vendor_type_preset : enum(Doc-2 §10.3)` — a **pointer**, per
`Doc-4A_Content_v1.0_Pass3.md:46`, never a restatement of the values. That is the *"post-patch
contract update"* of `Doc-4A …Pass5.md:242` and carries no independent authority.

**Supersedes** `governanceReviews/Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` (7
values incl. `other`; crosswalk contradicting the frozen seeds; no identifiers; self-labelled
v1.0.1) and `governanceReviews/Doc-4D_VendorTypePreset_Values_Patch_v1.0.4_PROPOSAL.md` (rejected on
route, `Doc-4A Pass3:47`). `ADR-023_Vendor_Buyer_Classification_Model_PROPOSAL.md` restates the
7-value set at **Decision item 2, `:36–44`** (that document has no §2);
`MASTER-CLASSIFICATION-DICTIONARY.md:49–50` and `VENDOR-PROFILE-MODEL.md:23, :41–48` restate it.
These are **downstream conformance tasks, not gates on this patch** — sequencing a rank-0 fold behind
unratified and lower-rank artifacts would invert `CLAUDE.md §7`.

---

## 9. Approval block

| Gate | Status |
|---|---|
| Review-A (independent) | ☐ not run |
| Review-B (independent) | ☐ not run |
| **§3.1 reading confirmed — additive realization vs re-keying** | ☐ not ruled |
| Human approval — rank-0 additive patch (`CLAUDE.md:139–140`) | ☐ not granted |
| Verification: Existing Text Reference matches `Doc-2 …v1.0.2.md:731` verbatim | ☐ not run |
| Fold as `generatedDocs/Doc-2_Patch_v1.0.11_VendorTypePresetValues.md` + linked Doc-4D update (§8) + `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md` | ☐ blocked |
| `esc_registry.md:92` amended row-wise (values closed, facets carve-out preserved) | ☐ blocked |
| B1 (`digital_showcase…:393`) disposition acknowledged before ESC closure | ☐ not done |
| **GATE-VTP-1** carried into FE realization (§4) | ☐ binding on fold |

Freeze/merge gate (`CLAUDE.md:225`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold.

*End of Doc-2_Patch_v1.0.11_VendorTypePresetValues (PROPOSED) — supplies the closed value domain of
`vendor_type_preset` in §10.3, five identifiers bound by pointer to the frozen register, in the
inline notation its sibling attributes already use. No preset added, renamed, removed or reseeded; no
column, entity, state, event, permission, audit action, ownership or DDL change. P-1, P-2, C-6 and
NAM-1 remain OPEN. DRAFT — awaits HUMAN approval; not folded by AI.*
