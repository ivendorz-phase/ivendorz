# Doc-4D_VendorTypePreset_Values_Patch_v1.0.4_PROPOSAL.md

> # 🔴 REJECTED AT REVIEW-A — WRONG ROUTE. Superseded by `Doc-2_Patch_v1.0.11_VendorTypePresetValues_PROPOSAL.md`.
>
> **Do not fold. Do not cite as the ship path.** Review-A 2026-07-21: **🔴 REJECT — 1 BLOCKER ·
> 5 MAJOR · 6 MINOR**. The blocker is a **routing** defect no edit to this document can cure:
> `Doc-4A_Content_v1.0_Pass3.md:47` — *"A request contract **MUST NOT** define a new enum or extend
> an existing one"* — and `:46` names **the owning corpus location** (Doc-2 §3 entity attributes) as
> where a value domain lives; `Doc-4A_Content_v1.0_Pass1.md:163` — *"Doc-4 documents introduce no
> business terminology."* `Doc-4A …Pass5.md:242` also disposes of the "nothing persists it yet"
> defence: domain changes are classified by **document authority**, not data population.
> §3 of this document pre-committed to exactly this outcome.
>
> **Contributing cause, recorded:** `CLAUDE.md §11` requires *"Read **Doc-4A** (API metastandard)
> before any contract work."* Doc-4A was never opened while drafting this patch.
>
> **Substance preserved and re-routed** into the Doc-2 patch: the five identifiers, the binding
> rules, the ESC half-closure with B1 protection, the supersession grounds, and the version
> derivation. Corrections applied there: the `service_provider` mapping is now a **binding gate**
> (was a table footnote) · the absence claim is bounded · `"Manufacturer"` **does** exact-match
> `Master…FINAL.md:219` · ADR-023 item 2 is `:36–44` · ADR-027 does not yet exist · G-1 dropped as
> stale and out of scope (`00_AUTHORITY_MAP.md:128`) · slug-durability raised as **NAM-1**.
>
> Retained unedited below so the review trail resolves.

> **STATUS: DRAFT — ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-4D is **rank-0 frozen architecture**
> (`00_AUTHORITY_MAP.md:18`); changing it requires an **additive architecture patch with human
> approval** (`CLAUDE.md:139–140`) — never a skill decision. Not folded by any AI action.
>
> **This patch is ADDITIVE ONLY.** It amends **no frozen text**, renames nothing, removes nothing,
> and touches no rank-0 table. It fills a **declared-but-empty value domain**. It therefore does
> **not** depend on the parked rank-0 amendment track (ADR-027) and must not be read as depending on
> it.
>
> **Supersedes** `governanceReviews/Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` (§6).

## Status

| Field | Value |
|---|---|
| Applies to | `Doc-4D_Content_v1.0_PassB_VendorProfile.md:19, :48` · `Doc-4D_Content_v1.0_PassB_Discovery.md:20, :27` |
| Produces | **Doc-4D v1.0.4** (§1.1 — label re-derived, not inherited) |
| Change class | **ADDITIVE** — enumerates the value set of an already-frozen field |
| Scope | The allowed values of `vendor_type_preset`, bound by pointer to the **five presets already frozen** at `Master_System_Architecture_v1.0_FINAL.md:214–220`. **Nothing else.** |
| Does NOT | Add a preset · rename a preset · change any capability seed · change the matrix · change any contract shape, field, DDL, event, state, permission, audit action, or ownership |
| Resolves | `ESC-MKT-VENDORTYPE` — **values half only** (§5) |
| Authority | `CLAUDE.md §7/§8/§11/§13` · Invariant #1 · `Doc-6D_Content_v1.0_Pass1.md:88` (MK-CR4) · `Doc-7G_Content_v1.0_Pass1.md:46` |
| Origin | Owner ruling 2026-07-21 — decompose the vendor-type work; ship the additive part, park the rank-0 part |

### 1.1 Version label — re-derived from disk, not inherited

An earlier review asserted that `Doc-4D` v1.0.1 had been "issued twice." **That premise was
disproven** (Review-A round 2, M-5): `Doc-4D_PassA_Patch_v1.0.1.md` and
`Doc-4D_PassB_Patch_v1.0.1.md` carry `Applies To: Doc-4D_Content_v1.0_PassA.md` and
`…_PassB.md` — **two different base documents**, each correctly at its own v1.0.1. It is not cited
here, and the label below is derived independently.

Labels observed on disk in the `Doc-4D` namespace, 2026-07-21: `v1.0.1` (PassA), `v1.0.1` (PassB),
`v1.0.2` (`CanonicalHost`), `v1.0.3` (`PublicProductDetail`). `00_AUTHORITY_MAP.md:61` records
*"v1.0 (+ realization patches v1.0.2, v1.0.3)"*. Highest label in use is **v1.0.3**; the next
unused series label is therefore **v1.0.4**, which is free however the pass-level `v1.0.1` labels
are read.

---

## 2. Problem

`vendor_type_preset` is a **frozen field with an empty value domain**:

| Fact | Anchor |
|---|---|
| Column exists, `text`, nullable | `Doc-6D_Content_v1.0_Pass1.md:70` |
| Declared `vendor_type_preset : enum : optional` on create and update | `Doc-4D_Content_v1.0_PassB_VendorProfile.md:19, :48` |
| Exposed as an **allowlisted hard filter** in `search_catalog` — *"Filters = allowlisted **hard** attributes"* | `Doc-4D_Content_v1.0_PassB_Discovery.md:20, :27` |
| **No values are enumerated anywhere in the corpus** | registered as `ESC-MKT-VENDORTYPE`, `esc_registry.md:92` |

Consequences today: the field cannot be validated; the discovery filter has no domain to filter on;
and the shipped editor at `app/(app)/_components/vendor/company/capabilities-capacity-form.tsx:39–41`
offers three values — `manufacturer`, `trader`, `service_provider` — that **match no governance
source**.

Separately, the five frozen preset **display names carry no stable identifier**, so the string is the
key. Drift is already live: `Master…FINAL.md:217` reads *"MRO / Retail Supplier"* while
`iVendorz_Master_Overview_v1.0.md:195` reads *"MRO Supplier"*.

---

# PATCH-4D-VTP-03 — `vendor_type_preset` value set

**Allowed values** (create `:19`, update `:48`, discovery filter allowlist `:20`/`:27`):

```
service_provider_consultant
mro_retail_supplier
importer_equipment_seller
manufacturer
engineering_firm
```

**Binding to the frozen register — by pointer, never restated** (`CLAUDE.md:193`). Each value
denotes one preset already frozen at `Master_System_Architecture_v1.0_FINAL.md:214–220`, in the order
given there. **The display names and the four capability cells of every row are governed there and
are not reproduced, interpreted, or altered by this patch.**

| Value | Denotes the frozen preset at |
|---|---|
| `service_provider_consultant` | `Master…FINAL.md:216` |
| `mro_retail_supplier` | `:217` |
| `importer_equipment_seller` | `:218` |
| `manufacturer` | `:219` |
| `engineering_firm` | `:220` |

**Binding rules:**

- **Metadata, never authoritative for capability.** Vendor capability is and remains the four
  booleans `can_supply` / `can_service` / `can_fabricate` / `can_consult` (Invariant #1). The preset
  is **not** derived from the flags and **must not** override them — `Doc-6D_Content_v1.0_Pass1.md:88`
  (MK-CR4): *"`vendor_type_preset` is a UI preset label, not the capability source of truth."*
- **Seed-once, not a live relationship.** Per `Master…FINAL.md:222`, the preset **seeds** the flags
  at authoring time and the vendor may override any of them. No runtime derivation, no reverse
  mapping. **A vendor whose flags diverge from its preset is valid, not an inconsistency to
  reconcile.**
- **Never collapsed in the UI.** `Doc-7G_Content_v1.0_Pass1.md:46` binds: the profile editor presents
  the four flags independently and *"the UI never collapses them to a single 'vendor type.'"* The
  preset is presented **alongside** the matrix, never instead of it.
- **Matching boundary.** Not a Phase-A eligibility gate; matching filters on flags covering the RFQ's
  `work_nature` (`Master…FINAL.md:224`). **No M3 change is authorized** — consistent with
  `BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md` ③, which keeps business-type ranking deferred.
- **Optional.** The field remains `optional` / nullable; "none of these" is expressed as NULL. **No
  `other` value is minted.**
- **Firewall.** No governance-signal read or write; no plan or entitlement coupling (Invariants
  #6, #10).

**Realization layer:** contract/validation (`Doc-4D` create/update `enum`) and the discovery filter
allowlist. **No Doc-6D DDL change** — the column is already `text`
(`Doc-6D_Content_v1.0_Pass1.md:70`). An optional DB `CHECK` is **deferred**, recorded not coined.

---

## 3. Why this is additive — and the one point to scrutinize

**Additive, uncontroversially:** Doc-4D already declares the field an `enum` and already lists it in
the discovery filter allowlist. Those declarations have **no members**. Supplying members fills a
declared-but-empty domain. No frozen sentence changes truth value; no rank-0 table is touched; the
count *"Five named vendor types exist"* (`Master…FINAL.md:212`) stays exactly true — this patch
enumerates **five**.

**The point a reviewer should press:** minting machine-readable slugs where the frozen register has
only display names. Two readings —

- *Additive (asserted here):* the slug is a **member of Doc-4D's empty enum**, a new thing bound by
  pointer to a frozen row. The frozen register's display names remain its display names and remain
  its identity; nothing is re-keyed.
- *Re-keying (the contrary reading):* if the display string is today's identity, introducing a slug
  relocates identity onto the slug.

This patch takes the first reading, **explicitly and for review**, because Doc-4D's enum is a
distinct field-level artifact from the rank-0 seed register, and because nothing persists
`vendor_type_preset` yet (§4) so no identity is in fact relocated at fold time. **If Review-A or the
Board takes the second reading, this patch is inadmissible on the additive route and must go back
behind the parked rank-0 track.** It is raised here rather than left to be discovered.

---

## 4. Impact

| Surface | Impact |
|---|---|
| `prisma/schema.prisma` · `prisma/migrations/` | **None.** No `VendorProfile` model, no `marketplace` migration exists (verified 2026-07-21; only `Organization.hasVendorProfile:204`). |
| Stored data | **None.** Nothing persists `vendor_type_preset`, so adoption costs no migration. |
| `capabilities-capacity-form.tsx:39–41` | Ships `manufacturer` / `trader` / `service_provider`, matching no governance source. Map: `manufacturer` → `manufacturer` (unchanged) · `trader` → `mro_retail_supplier` · `service_provider` → **`service_provider_consultant`** ⚠️ *see §7 — this is the row whose name and seed disagree.* |
| `profile-overview.tsx:57` | Renders `profile?.vendor_type_preset` **raw**; with slugs stored it would print `mro_retail_supplier`. A slug → display-name lookup is required in the same change. |
| `app/(public)/_components/discovery/seed.ts:55–118` | 8 demo entries / 6 distinct `businessType` labels; *"Supplier / Distributor"*, *"Importer / Distributor"*, *"Fabricator"*, *"Engineering Consultant"* match no frozen preset, and *"Manufacturer"* / *"Importer"* do not exact-match the frozen display names. Requires reconciliation. |
| `src/frontend/components/vendor-card.tsx:37–41, 99–101` | Renders `businessType` publicly; its doc-comment points at the superseded proposal (§6) and must be re-pointed. |
| `app/(app)/_components/vendor/company/types.ts:42` | `vendor_type_preset?: string` narrows to the five-member union. |
| M3 matching | **None.** Flags remain the sole eligibility input. |

FE realization is **not authorized by this patch**; it is listed so the Board sees the blast radius.

---

## 5. `ESC-MKT-VENDORTYPE` — values half only

`esc_registry.md:92` scopes the handle to **two** gaps. This patch closes the first and **expressly
preserves the second**:

1. *"`vendor_type_preset` enumerates **no values**"* → **RESOLVED.**
2. *"net-new vendor 'commercial capability' facets (brand/OEM-authorization) unmodeled"*, channel
   *"net-new facets → future M2 patch"* → **NOT addressed; carve-out preserved.**

The registry row must be **amended row-wise** (Scope/gap, Interim presentation and Channel columns —
note the table has **no status column**, `esc_registry.md:25`), not flipped whole.

**Downstream the Board should see before closing anything:**
`docs/product/requirements/digital_showcase_planning_and_design.md:393` (item **B1**) withholds four
business-shape arrangement presets from production **expressly because `ESC-MKT-VENDORTYPE` is
OPEN**; `:106`, `:385` and `:353` carry the same gate. Resolving the values half changes B1's gating
premise. **This patch takes no position on B1** and must not be treated as closing it.

---

## 6. Supersession

`governanceReviews/Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md` (values `manufacturer,
supplier_distributor, importer, fabricator, epc_contractor, engineering_consultant, other`) is
**SUPERSEDED** and must not be folded:

1. It enumerates a **7-value set that conflicts with the frozen 5-preset register** at
   `Master…FINAL.md:214–220` while presenting itself as additive; the conflict is unaddressed.
2. Its Appendix-A crosswalk **contradicts the frozen capability seeds** (`fabricator` →
   `can_fabricate, can_supply`; `epc_contractor` → `can_supply, can_service`).
3. It mints no stable identifiers.
4. It labels itself `v1.0.1` (§1.1).

`ADR-023_Vendor_Buyer_Classification_Model_PROPOSAL.md` restates the same 7-value set at **Decision
item 2, `:36–40`** (that document has no §2) and must be revised in step; its buyer-side scope
(`ESC-IDN-BUYERTYPE`) is untouched. `docs/product/requirements/MASTER-CLASSIFICATION-DICTIONARY.md:49–50`
and `VENDOR-PROFILE-MODEL.md:23, :41–48` restate it and are gated at §9.

---

## 7. What this patch does NOT fix — carried, OPEN

Stated plainly so adoption is not mistaken for resolution.

| ID | Finding | Status |
|---|---|---|
| **P-1** | Frozen row 1 is named *"Service Provider / Consultant"* but seeds `can_consult` only, with `can_service` at `–` (`Master…FINAL.md:216`). A maintenance or installation firm selecting the row whose name matches its business is seeded the **opposite** capability. | **OPEN** — fixing it requires renaming a frozen row. |
| **P-2** | No preset seeds `can_service` alone; service-led vendors have no correct entry point. Under `:224` a mis-seeded vendor is routed the wrong `work_nature`. | **OPEN** — fixing it requires adding a preset row. |
| **C-6** | `engineering_firm` seeds **all four** flags (`:220`), which over-seeds a consulting-only engineering firm. Pre-existing, frozen, not introduced or resolved here. | **OPEN** |
| **G-1** | Legacy base/patch precedence — `Doc-6C` base says 45, its patch says 43, both live, no tiebreak (`00_AUTHORITY_MAP.md:123`). | **OPEN, PARTIALLY INFORMED** |

**P-1 and P-2 require the parked rank-0 amendment track** (`Governance_RankZero_Amendment_Mechanism_v1.2_PROPOSAL.md`,
parked as non-converging after three Review-A rounds — record:
`ReviewA_Record_RankZero_Amendment_Mechanism_v1.2.md`). **This patch is deliberately narrower than the
problem.** It makes the field usable; it does not make the register correct.

---

## 8. Suggestion-only onboarding behaviour

When a vendor selects a preset, the UI **pre-checks** the capability flags that preset seeds per
`Master…FINAL.md:214–220`; the vendor may change any of them (`:222`). This restates the frozen rule
by pointer and coins nothing. Shipped copy already states it —
`capabilities-capacity-form.tsx:30`: *"A preset only seeds the capability flags below — matching reads
the four flags, not the preset."* **The seeding behaviour itself is not implemented** (the form has no
submission wiring); implementing it is FE follow-up, not authorized here.

---

## 9. Approval block

| Gate | Status |
|---|---|
| Review-A (independent) | ☐ not run |
| Review-B (independent) | ☐ not run |
| Human approval — rank-0 additive patch (`CLAUDE.md:139–140`) | ☐ not granted |
| §3 additive-vs-re-keying reading confirmed by review | ☐ not confirmed |
| `ADR-023` Decision item 2 revised in step | ☐ not done |
| `MASTER-CLASSIFICATION-DICTIONARY.md:49–50` revised | ☐ not done |
| `VENDOR-PROFILE-MODEL.md:23, :41–48` revised | ☐ not done |
| Fold as `generatedDocs/Doc-4D_VendorTypePreset_Values_Patch_v1.0.4.md` + `00_AUTHORITY_MAP.md` + `CORPUS_INDEX.md` | ☐ blocked |
| `esc_registry.md:92` amended row-wise (values closed, facets carve-out preserved) | ☐ blocked |
| B1 (`digital_showcase_planning_and_design.md:393`) disposition acknowledged before ESC closure | ☐ not done |

Freeze/merge gate (`CLAUDE.md:225`): **BLOCKER = 0 · MAJOR = 0 · MINOR = 0** before fold.

*End of Doc-4D_VendorTypePreset_Values_Patch_v1.0.4 (PROPOSED) — enumerates the `vendor_type_preset`
value set as five identifiers bound by pointer to the frozen register. No preset added, renamed or
reseeded; no frozen text amended; no field, contract, DDL, event, state, permission, ownership or
matrix change. P-1, P-2, C-6 and G-1 remain OPEN. DRAFT — awaits HUMAN approval; not folded by AI.*
