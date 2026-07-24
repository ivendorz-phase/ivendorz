# Architecture_VendorTypePreset_Amendment_v1.0.md

## Status

**Owner-approved Architecture RE-FREEZE — NON-ADDITIVE.** Re-issues the vendor-type preset register
in **Architecture §Invariant 1** (`Master_System_Architecture_v1.0_FINAL.md:212–220`) from five preset
rows to six, renaming rows 1 and 4 and adding row 6. This is a **canonical base re-freeze**, not a
carry-alongside overlay — the frozen base text at `:212–220` **is re-issued** to carry the new truth
(see §1.1). Resolves carried findings **P-1** and **P-2**.

| Field | Value |
|---|---|
| Applies to | `Master_System_Architecture_v1.0_FINAL.md` — the §Invariant 1 preset sentence (`:212`) and register table (`:214–220`) **only** |
| Produces | Architecture §Invariant 1 re-frozen with the six-row preset register; Architecture version bumped in `00_AUTHORITY_MAP.md` |
| Amendment ID | **AMD-MA-VTP-1** |
| Change class | **NON-ADDITIVE** — see §1. One row added (additive); two rows renamed and the count word changed (not additive) |
| Method | **Canonical base re-freeze** — Board-directed for this register (§1.2); NOT an overlay |
| Authority | **Owner ruling, 2026-07-22** (this session). `CLAUDE.md:139–140`: *"Ranks 0–1 are **immutable to all skills** (including the Virtual CTO). Changing them requires an additive architecture patch **with human approval** — never a skill decision."* The owner is that human; the re-freeze method is separately owner-authorized 2026-07-22 (§1.2) |
| Resolves | **P-1** (row 1 named for a capability its seed does not grant) · **P-2** (no preset seeds `can_service` alone) |
| Does NOT | Change the capability matrix · change Invariant #1 · change any seed value on a pre-existing row · change matching · add a column, entity, state, event, permission, audit action or ownership · declare machine-readable identifiers (§6) |
| Verification | **REQUIRED, NOT RUN** — independent; see §8. Not in force until it passes |

---

## 1. Change class — stated plainly, not softened

**This amendment is not additive, and is not presented as additive.**

| Element | Additive? |
|---|---|
| Row 6 `Service Provider` added | **Yes** |
| Row 1 renamed *Service Provider / Consultant* → *Consultant* | **No** — renames frozen text |
| Row 4 renamed *Manufacturer* → *Manufacturer / Workshop* | **No** — renames frozen text |
| `:212` count word *"Five"* → *"Six"* | **No** — rewrites a frozen sentence |

### 1.1 Method — canonical base re-freeze, and why the base text is re-issued

`CLAUDE.md:139–140` prescribes the form *"an additive architecture patch with human approval."* It
prescribes **no form for a non-additive rank-0 amendment**, because the corpus has not previously
performed one. The instrument intended to supply that form
(`governanceReviews/Governance_RankZero_Amendment_Mechanism_*_PROPOSAL.md`, intended fold form
**ADR-027**) is **PARKED by owner ruling 2026-07-21** after non-converging review, and is not reopened
here — the owner rules the substance directly instead.

This amendment therefore borrows the **document form** of `Architecture_CD-MA-1_Patch_v1.0`
(Original-verbatim → Revised → regression statement → independent verification). It does **not** borrow
CD-MA-1's *method* or *change class*: CD-MA-1 was an **additive** catalog-completeness patch that
carried alongside an unedited base, and it carries **no authority** for a non-additive change or for an
overlay that leaves the base contradicting the ruling. The method here is the Board-directed
**re-freeze** (§1.2): the frozen base at `:212–220` is re-issued to the six-row text, the prior
five-row text is retained in git history and in the provenance record at §9, and the Architecture
version is bumped in `00_AUTHORITY_MAP.md`. This is Invariant #8-compliant — #8 mandates *versioned
docs*, and a re-freeze is a versioned re-issue with the prior retained, not a silent overwrite.

**Consequence to record:** absent ADR-027, this amendment is the corpus's **first non-additive rank-0
act** and its **first executed canonical re-freeze**. It will be read as precedent for the next one and
is written to be read that way.

### 1.2 The Board disfavoured an overlay for this exact register — disclosed, and executed accordingly

**`governanceReviews/ReviewA_Record_MasterArchitecture_Inv1_VendorTypePreset_v1.0.md:98`** (Board
adjudication, 2026-07-21) directs: *"Board prefers **canonical base re-freeze** over a permanent
overlay, and directs that no generic 'latest overlay wins' precedence mechanism be introduced."* The
same record's **MAJ-5 (`:34`)** states the concrete defect of the overlay method: *"A replacing overlay
leaves `…FINAL.md:216` still reading the superseded row, with no precedence rule."*

An earlier draft of this amendment (in-session) chose exactly that disfavoured overlay — frozen base
unedited, amendment carried alongside — and cited CD-MA-1 as precedent for it, **without disclosing
the Board's contrary direction sitting in this very register's review record.** Independent
verification caught it (CHECK 6, FAIL). This revision executes the Board's directed method: the base
is re-frozen (§3, §1.1), which removes the `:216`-still-reads-the-old-row defect at its source. No
generic "latest overlay wins" mechanism is introduced — there is no overlay to arbitrate.

### 1.3 Application to `main` — owner authorization, 2026-07-24

The 2026-07-22 ruling (§Status, `:18`) was taken on the working branch. Applying a non-additive
rank-0 change to the **trunk** is a distinct act with a distinct blast radius, so it was re-presented
to the owner rather than inferred from the branch ruling.

| Field | Value |
|---|---|
| Authorizing human | Repository owner |
| Date | **2026-07-24** |
| Scope | Apply **AMD-MA-VTP-1** — and only it — to `main`: the register re-freeze, this amendment record, and its verification record |
| Packaging ruled | **Split.** The re-freeze lands as its own instrument, ahead of and separate from the companion Doc-2 value-domain patch + linked Doc-4D pointer patch, so the rank-0 diff is never carried inside a larger changeset |
| Halt discharged | The `CLAUDE.md` Red-Flag Checklist item *"Modify a FROZEN document"* and §7 rank-0 immutability. Both route to human approval; this row is that approval, recorded in-repo |

**Disclosed, and not resolved by this authorization** — the Board's 2026-07-21 structural split
(`ReviewA_Record_…:94–99`) directed that the rank-0 amendment **mechanism**
(`governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.0_PROPOSAL.md`, Instrument 1) be ruled
**first**, and parked the register proposal (Instrument 2) as *"not reviewable in final form until
Instrument 1 is folded."* Instrument 1 is **still unfolded** (ADR-027 track PARKED). This amendment
therefore proceeds ahead of the mechanism that was meant to license it, under direct owner
authorization on both dates. §1.1's precedent warning stands and sharpens: the next non-additive
rank-0 act must not cite **this** one as having settled the mechanism question — it did not.

**Also disclosed:** `00_AUTHORITY_MAP.md:30–31` and `CLAUDE.md` §7 both state that changing ranks 0–1
requires an ***additive*** architecture patch with human approval. This amendment is **non-additive**
(§1). The human-approval limb is satisfied; the additive limb is not, and is **not** waived silently
here — it is the precise gap Instrument 1 exists to close. Neither text is edited by this instrument.

---

## 2. Original Architecture §Invariant 1 — preset register

*Quoted verbatim from `Master_System_Architecture_v1.0_FINAL.md:212–220`, re-derived from disk
2026-07-22. Anchor check is a gate of §8.*

```
Five named vendor types exist purely as **presets** over these flags, with vendor-elected **overrides** ("Additional Capabilities") on top:

| Vendor Type (preset) | supply | service | fabricate | consult |
|---|:---:|:---:|:---:|:---:|
| Service Provider / Consultant | – | – | – | ✓ |
| MRO / Retail Supplier | ✓ | – | – | – |
| Importer / Equipment Seller | ✓ | – | – | – |
| Manufacturer | ✓ | – | ✓ | – |
| Engineering Firm | ✓ | ✓ | ✓ | ✓ |
```

---

## 3. Re-frozen Architecture §Invariant 1 — preset register

*This block replaces `:212–220` in the base file under owner-authorized re-freeze (§1.1–§1.2).*

```
Six named vendor types exist purely as **presets** over these flags, with vendor-elected **overrides** ("Additional Capabilities") on top:

| Vendor Type (preset) | supply | service | fabricate | consult |
|---|:---:|:---:|:---:|:---:|
| Consultant | – | – | – | ✓ |
| MRO / Retail Supplier | ✓ | – | – | – |
| Importer / Equipment Seller | ✓ | – | – | – |
| Manufacturer / Workshop | ✓ | – | ✓ | – |
| Engineering Firm | ✓ | ✓ | ✓ | ✓ |
| Service Provider | – | ✓ | – | – |
```

The sentence at `:222` (*"A vendor may enable additional capability flags beyond its preset … The
preset seeds the flags; the flags — not the preset name — drive all matching."*) is **unchanged and
load-bearing** — it is the frozen text that makes a preset a starting point rather than a
classification, and this amendment relies on it.

---

## 4. Change ledger

*Six rows, per the owner's election of 2026-07-21 carried at
`governanceReviews/MasterArchitecture_Inv1_VendorTypePreset_Amendment_PROPOSAL_v1.1.md:106–122`. That
ledger classes rows 2/3/5 as **Re-keying** because it also minted slugs; this amendment mints **no
slugs** (§6), so rows 2/3/5 are **Unchanged** here and the re-keying travels with the later Doc-2 patch
(§5.3).*

| Row | Display name | Seed | Class |
|:-:|---|---|---|
| 1 | **renamed** *Service Provider / Consultant* → **Consultant** | unchanged (`– – – ✓`) | **Amendment** |
| 2 | unchanged — *MRO / Retail Supplier* | unchanged (`✓ – – –`) | Unchanged |
| 3 | unchanged — *Importer / Equipment Seller* | unchanged (`✓ – – –`) | Unchanged |
| 4 | **renamed** *Manufacturer* → **Manufacturer / Workshop** | unchanged (`✓ – ✓ –`) | **Amendment** |
| 5 | unchanged — *Engineering Firm* | unchanged (`✓ ✓ ✓ ✓`) | Unchanged |
| 6 | **new** — *Service Provider* | **new** (`– ✓ – –`) | Additive |

**No seed value on any pre-existing row changes.** Row 6's seed is the only new capability data, and
it grants `can_service` alone — the combination P-2 records as absent.

### 4.1 Rows 1 and 6 ship as one unit

Row 6 cannot land without row 1's rename. If row 1 kept its frozen name the picker would offer
*"Service Provider / Consultant"* beside *"Service Provider"* — near-identical strings seeding
**opposite** flags (`consult` vs `service`). Partial approval of row 6 alone is worse than the status
quo and is not available.

### 4.2 What the two renames fix

- **P-1** — row 1 was *named* for a service capability its seed does not grant (`– – – ✓`, no
  `can_service`). A maintenance vendor reading *"Service Provider"* would select it and be seeded
  `can_consult`, then under `:224` — whose engine filters vendors whose flags **cover** the RFQ's
  `work_nature` — be routed work it cannot perform, undetectably. Renaming row 1 to *Consultant* and
  giving service-led vendors their own row 6 removes the mis-seeding path at its source.
- **P-2** — no preset seeded `can_service` alone; the only row granting `can_service` was `:220`,
  which grants all four. Service-led vendors had no correct entry point. Row 6 supplies it.

Row 4's rename (*Manufacturer* → *Manufacturer / Workshop*) is cosmetic breadth, carried from the
owner's election; it changes no seed and resolves no finding.

---

## 5. Adverse prior decisions — disclosed

**5.1 The Board disfavoured the overlay method for this register.** Disclosed and executed at §1.2 —
this amendment adopts the Board-directed canonical re-freeze instead.

**5.2 FE-PUB-09 rejected two of these display names by name.**
`project-management/changelog.md:519` records that in the FE-PUB-09 Board session the
*"proposed 'Manufacturer/Importer/Distributor' trade-role labels [were] **REJECTED as coined
(Invariant #1)**."* Two of this register's rows are *Manufacturer / Workshop* and *Importer /
Equipment Seller*. **The token overlap is real and is placed on the record here rather than left for
a reviewer to find.**

Why the rejection does not reach this amendment: what FE-PUB-09 rejected was a **newly coined**
trade-role label family, proposed for a MegaMenu vendor panel, standing **in place of** the capability
matrix — the ruling's own remedy was to bind that panel *"to the frozen 4-flag capability matrix."*
The rows here are **not newly coined**: four of the six are frozen text at `:216–:220` today, and all
six are governed as presets *over* the flags by `:212` and `:222`, never as a substitute for them.
The distinction is between coining a label taxonomy and re-issuing an existing preset register. It is a
real distinction, but it is a **judgement the owner has ruled on, not a fact the corpus settles** —
recorded as such.

**5.3 The `ESC-MKT-ARRANGEMENT-PRESETS` ruling constrained a different surface.**
`governanceReviews/ESC-MKT-ARRANGEMENT-PRESETS_FlagAndHalt_v1.0.md` (owner-ruled BLOCKER, 2026-07-20,
Option B) prohibited **section-arrangement presets** in the microsite builder from persisting or
inferring vendor type, and its guidance excluded vendor-type-shaped labels on that surface. That
ruling governs the **microsite section-arrangement mechanism**, not the capability-preset register;
its own scope line limits it to *"Rendering the section-arrangement starting points."* It is disclosed
here for completeness and does not reach the §Invariant 1 register. The standing gate it echoes —
`docs/product/requirements/digital_showcase_planning_and_design.md:385`, *"no coined vendor-type values
while `ESC-MKT-VENDORTYPE` is open"* — is addressed by §6: this amendment coins **no values**; the
value domain and the ESC closure travel with the later Doc-2 patch.

**5.4 This amendment does not authorize public rendering.**
`src/frontend/components/vendor-card.tsx:99–101` renders the preset label on a public surface.
Whether a preset label may render publicly is the subject of the FE-PUB-09 precedent and is **not
adjudicated here**. Adopting a six-row register is not authority to render any row publicly.

**5.5 Re-keying is a separate act, not performed here.**
The ledger cited at §4 classifies the minting of machine-readable slugs for rows 2/3/5 as
**Re-keying** — a real change to rows whose name and seed do not move, because under the pre-amendment
reading the display string *is* the key. This amendment **declares no identifiers** (§6); the
re-keying question travels with the Doc-2 patch and must be dispositioned there, not treated as
settled by this document.

---

## 6. What this amendment does NOT declare

**No machine-readable identifiers.** This document re-freezes the Architecture **register** — display
names, rows, and seeds. It declares no slug, no enum, no value domain.

The machine-readable value domain of `marketplace.vendor_profiles.vendor_type_preset` is owned by
**Doc-2 §10.3** and is supplied by a **companion Doc-2 patch**, sequenced **after** this re-freeze.
Until that patch folds, `vendor_type_preset` still enumerates no governed values and
`esc_registry.md:92` (`ESC-MKT-VENDORTYPE`) stays open on its values half.

---

## 7. Regression statement

| Dimension | Assessment | Evidence |
|---|---|---|
| **Invariant #1 (capability = matrix)** | **CONFIRMED UNCHANGED** | The four flags remain the capability model. `:212`/`:222` continue to frame presets as seeds over the flags; `Doc-6D_Content_v1.0_Pass1.md:88` (MK-CR4) continues to forbid any `vendor_type` enum derived from the flags in the DB. No preset becomes a capability source of truth. |
| **Matching / the M3 moat** | **CONFIRMED UNCHANGED** | `:224` is untouched — flags remain the sole eligibility input. No preset is a Phase-A gate. **No M3 change is authorized.** Row 6 changes which flags a vendor is *seeded*, never how seeded flags are matched. |
| **Module ownership** | **CONFIRMED UNCHANGED** | M2 attribute, Architecture register. No ownership boundary moves. |
| **Governance signals** | **CONFIRMED UNCHANGED** | No Trust/Performance/Tier/Capacity/Buyer-Status read or write; no cross-mutation (Invariants #6, #10). |
| **Stored data** | **NONE AT RISK** | Nothing persists `vendor_type_preset` today — `prisma/schema.prisma` carries no `VendorProfile` model and no migration realizes the M2 tables. Both renames and row 6 carry **zero migration cost**. **This window closes when the M2 tables land.** |
| **Pre-existing seeds** | **CONFIRMED UNCHANGED** | Every seed on rows 1–5 is byte-identical to its frozen value; only row 6 introduces new seed data (§4). |
| **Invariant #8 (nothing overwritten)** | **CONFIRMED HELD** | The base is **re-frozen**, not silently overwritten — versioned re-issue, prior text retained in git + §9 provenance, Architecture version bumped in `00_AUTHORITY_MAP.md`. #8 mandates versioned docs; this is one. |

---

## 8. Verification — REQUIRED, NOT RUN

Per the CD-MA-1 lifecycle (`Architecture_CD-MA-1_Patch_Verification_v1.0.md`), a change to a frozen
Architecture document is **not in force until an independent verification passes**. This amendment is
**authored, not verified**. The verifier must independently confirm:

1. **Anchor check** — §2's Original block matches the pre-re-freeze
   `Master_System_Architecture_v1.0_FINAL.md:212–220` (git `HEAD` blob before this change) verbatim,
   row for row, cell for cell.
2. **Re-freeze fidelity** — the base file now carries §3's six-row block byte-for-byte, and the
   Architecture version is bumped with a provenance note in `00_AUTHORITY_MAP.md`; no text outside
   `:212–220` in the base file changed.
3. **Seed integrity** — every seed on rows 1–5 of §3 is identical to its pre-re-freeze value; row 6 is
   the only new seed data.
4. **Ledger fidelity** — §4 matches the owner's 2026-07-21 election as carried at
   `…Amendment_PROPOSAL_v1.1.md:106–122`, with no row silently added, dropped or reseeded.
5. **Regression** — §7's seven claims, each re-derived from disk rather than accepted from this text.
6. **Scope** — no identifier or value domain is declared (§6); no document other than the base file,
   this amendment, and `00_AUTHORITY_MAP.md` (+ the non-authoritative Overview mirror) is changed.
7. **Adverse-disclosure completeness** — §5 surfaces every prior decision adverse to this amendment
   that a sweep of `project-management/`, `governanceReviews/` and `docs/product/requirements/`
   returns. The verifier treats §5 as a claim, not a floor.
8. **Anchor fidelity of cited authorities** — every `CLAUDE.md`, `00_AUTHORITY_MAP.md`, Doc, and
   review-record line cited in this amendment resolves on disk to the text quoted (the prior draft
   mis-cited the rank-0 rule as `:118–120`; it is `:139–140`).

The author is **not** independent of this document and does not certify it.

---

## 9. Provenance — the superseded text, retained

Invariant #8 requires the prior authoritative text to survive the version bump. It is retained three
ways: (a) git history of `Master_System_Architecture_v1.0_FINAL.md` before this change; (b) the
verbatim Original block at §2 of this document; (c) the `00_AUTHORITY_MAP.md` PROVENANCE row recording
this re-freeze. The five-row register was authoritative from freeze through 2026-07-22; the six-row
register is authoritative on and after independent-verification PASS.

## 9.1 Carried — downstream, not executed here

| Item | Disposition |
|---|---|
| **Doc-2 §10.3 value domain** — the six machine-readable identifiers | Companion Doc-2 patch, sequenced after this re-freeze (§6) |
| **Doc-4D contract pointer** — `vendor_type_preset : enum(Doc-2 §10.3)` | Follows the Doc-2 patch, per the Doc-2-first sequencing at `Doc-4A_Content_v1.0_Pass5.md:243` |
| `esc_registry.md:92` (`ESC-MKT-VENDORTYPE`) | Values half closes with the Doc-2 patch, not with this amendment; the net-new commercial-capability facets carve-out is preserved regardless |
| `iVendorz_Master_Overview_v1.0.md:194–195` | **NON-AUTHORITATIVE mirror** (`00_AUTHORITY_MAP.md:186`) — patched to match; already divergent on display names before this amendment |
| `app/(app)/_components/vendor/company/vendor-type-presets.ts` | Presentation register already carries the six rows, marked NOT-IN-FORCE pending this re-freeze; re-point its provenance comment on verification PASS |
| `app/(public)/_components/discovery/seed.ts:55–118` | 6 distinct demo labels, most matching no row — reconciliation carried, not executed |
| **C-6** — `engineering_firm` seeds all four flags, over-seeding a consulting-only firm | **OPEN** — pre-existing, not addressed by this amendment |
| **OBS-2** — rows 2 and 3 are capability-identical (`✓ – – –`) | **OPEN** — pre-existing, not addressed by this amendment |

---

## 10. Red Flag Checklist

No new module · no ownership change · no governance-signal change · Users-Act-Organizations-Own
untouched · no cross-module DB access or cross-schema raw SQL · no cross-module foreign key · no
import beyond another module's `contracts/` · no workflow owning state, no read-model as source of
truth, no M9/AI authoritative data · no Admin bypass of an owning module's domain · no ADR override.

**One hit, disclosed and authorized:** *"Modify a FROZEN document."* This amendment re-freezes rank-0
Architecture text. It is escalated to and **ruled by the human owner** (2026-07-22), which
`CLAUDE.md:139–140` establishes as the only authority competent to make it; the **re-freeze method** is
separately owner-authorized 2026-07-22 (§1.2), executing the Board's 2026-07-21 direction. The change
is a **versioned re-issue** (Invariant #8-compliant), not a silent overwrite. It is **not in force
until independent verification passes** (§8).

---

*End of Architecture_VendorTypePreset_Amendment_v1.0 (AMD-MA-VTP-1) — canonical base re-freeze of the
§Invariant 1 preset register from five rows to six: row 1 renamed to Consultant, row 4 renamed to
Manufacturer / Workshop, row 6 Service Provider added seeding `can_service` alone. Resolves P-1 and P-2.
NON-ADDITIVE, owner-ruled 2026-07-22; re-freeze method owner-authorized, executing the Board's
2026-07-21 direction. No seed changed on any pre-existing row; no capability-matrix, matching,
ownership, governance-signal, event, permission or audit change; no identifier or value domain declared.
Prior five-row text retained (§9). Independent verification REQUIRED and NOT RUN — not in force until it
passes.*
