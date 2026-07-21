# DIRECTIVE — Revision brief for `Doc-2_Patch_v1.0.11_VendorTypePresetValues_PROPOSAL.md`

**Status:** NON-AUTHORITATIVE work directive. Not a governance instrument, not a rank-0 artifact,
never folded. It carries owner rulings + a Review-A disposition into a drafting task. On any
conflict with a frozen doc, Flag-and-Halt (`CLAUDE.md:198`) — do not resolve locally.

**EXECUTED 2026-07-22** → `governanceReviews/Doc-2_Patch_v1.0.12_VendorTypePresetValues_PROPOSAL.md`.
All 17 findings dispositioned in that document's §10.

**Issued:** 2026-07-22 · **Owner-ruled:** 2026-07-22 · **Branch:** `fe/account-referral-nav`
**Input:** `governanceReviews/Doc-2_Patch_v1.0.11_VendorTypePresetValues_PROPOSAL.md` (276 lines, commit `dc08ea5`)
**Output:** `governanceReviews/Doc-2_Patch_v1.0.12_VendorTypePresetValues_PROPOSAL.md`
**Review-A verdict being answered:** 🟠 REVISION REQUIRED — 0 BLOCKER / 4 MAJOR / 7 MINOR / 2 NIT / 4 OBS

---

## 0. Read this first — the failure class this track keeps hitting

Three prior rounds on this track failed on **record defects, not design defects**. The v1.0.11
round included a **fabricated quotation**: a sentence was presented inside quote marks that does
not exist in the corpus — three table cells reflowed with arrows. Every round has also **inherited
citations from a superseded draft rather than re-deriving them**, and every round has **missed
evidence in its own favour**.

Therefore these are binding on the drafter:

1. **Re-derive every citation from disk.** Open the file, read the line, confirm the text. Never
   carry a citation forward from v1.0.11 because it was there before. This includes citations
   Review-A marked ✅ — the verdict is the reviewer's, the obligation is yours.
2. **Quotation marks mean verbatim, character for character.** A table row is not a sentence. If
   you must render tabular content, render it as a table or describe it — never as a quoted
   sentence. Reflowing cells with arrows and quoting the result is fabrication.
3. **Cite `file:line`.** Bare filenames are not citations.
4. **Sweep for evidence against and for.** Before asserting anything, search for the adverse
   precedent AND the supporting one. Both go in the record.
5. **Absence claims obey the drafting control** — no SILENT / ABSENT / NO-PRECEDENT /
   FIRST-INSTANCE without the six-part proof; otherwise use bounded language
   (`RankZero_Instruments_Coordination_Register_v1.0.md:71-76`, §5 Method control, Board-ruled
   2026-07-21).
6. **Read-only outside the output file.** Do not edit any frozen document. Do not edit v1.0.11 —
   mark it SUPERSEDED in its own Status block only, and never delete it (a superseded governance
   draft was deleted once on this track and the diff is permanently unauditable).

---

## 1. Owner rulings — binding, do not re-litigate

### RULING 1 — NAM-1 is DECIDED. Row 1's slug is `consultant`.

Review-A's NAM-1 argued that persisting `service_provider_consultant` bakes a name that P-1
declares defective into a wire token, and that this is *"a decision to be taken now, not a
carried-OPEN item"* because renames get expensive once M2 lands. The owner agrees and rules:

> **Row 1 (`Master_System_Architecture_v1.0_FINAL.md:216`, display name "Service Provider /
> Consultant") is minted with the identifier `consultant`.**
>
> The display name in Master is **not touched**. Only the machine identifier is short.

Rationale to record in the patch (each point must be re-verified from disk before it is written):

- **No frozen text changes.** The Master row keeps its display name verbatim. Nothing is renamed,
  so no amendment is required and the parked ADR-027 track stays off the critical path.
- **It is permitted because no derivation rule exists.** Review-A established that the corpus
  contains **no governed display-name → identifier derivation rule** (contrast ADR-024, where
  minting vendor slugs required a normative CHR algorithm as its own instrument). Since the
  transform is ungoverned either way, `service_provider_consultant` had no more authority than
  `consultant`; the Board is free to choose, and chooses the one that does not encode a known
  defect. **Verify this absence claim yourself before writing it, and phrase it in bounded
  language per §0.5.**
- **It conforms to the one convention that does bind.** `Doc-4A_Content_v1.0_Pass1.md:172` —
  identifiers are lowercase snake_case. `consultant` conforms.
- **It is forward-compatible with the parked track.** The owner's 2026-07-21 six-preset ruling
  already used `consultant` for row 1. Choosing it now means that if P-1/P-2 ever land, row 1's
  identifier does **not** need a rename — the expensive operation Review-A warned about is avoided
  outright, not merely deferred.
- **Invariant #9 covers the slug/label divergence.** The identifier is content; the display name
  remains presentation. A short identifier under a longer display name is exactly the separation
  Invariant #9 requires. Note in-artifact that `Master_System_Architecture_v1.0_FINAL.md:216` and
  `iVendorz_Master_Overview_v1.0.md:195` **already** render this preset family under divergent
  display strings — which is the proof that the row, not the string, is identity (see FIX-5).

**NAM-1 moves from §7 (carried, OPEN) to a resolved decision recorded in §3 or its own subsection.**
It is no longer an open item. P-1 (row 1's *seeds* are `can_consult` not `can_service`) stays OPEN
and parked — do not conflate the two: NAM-1 was about the token, P-1 is about the capability seed.

**Do not change the other four identifiers.** They remain `mro_retail_supplier`,
`importer_equipment_seller`, `manufacturer`, `engineering_firm`, each bound by pointer to
`Master_System_Architecture_v1.0_FINAL.md:217`, `:218`, `:219`, `:220` respectively — re-verify all
four line anchors from disk.

### RULING 2 — Ship at FIVE. The sixth preset stays parked.

The patch mints exactly the five presets frozen at `Master_System_Architecture_v1.0_FINAL.md:214-220`.
A sixth (service-only) preset requires editing `:212` ("Five named vendor types exist") and adding a
table row — a rank-0 amendment, for which the corpus has no mechanism (`00_AUTHORITY_MAP.md:42`
permits additive patches only). ADR-027, the instrument that would create that mechanism, is
**PARKED by owner ruling 2026-07-21** after three non-converging Review-A rounds. It is not on this
patch's critical path and must not be reopened by this revision. **P-2 stays OPEN in §7.**

### RULING 3 — Draft the revision. Do not fold, do not commit to a frozen doc.

Produce v1.0.12 as a PROPOSAL. Human/Board approval is still required before any fold. Nothing in
this directive authorizes touching `generatedDocs/`.

---

## 2. Required fixes — Review-A MAJORs

### FIX-1 (M-1) · Replace the section-mismatched authority anchor

**Where:** v1.0.11 banner `:10-11`, and `:15`, `:30`, `:128`, `:136`.

**Defect:** The patch's central authority row (`:128`) reads *"Is Doc-2 the owning location? Yes —
Doc-4A Pass3:46 names 'Doc-2 §3 entity attributes' as the owning corpus location"*, then applies it
to §10.3. The quoted text is verbatim, but **§3 of Doc-2 (`Doc-2_..._v1.0.2.md:242-403`) is the
Entity Catalog — four columns (Entity / Purpose / Tenant Scope / Lifecycle) — and carries no
attributes and no value domains anywhere.** §3.3 (`:274`) names `vendor_profiles` with zero
attribute detail. The §3 → §10.3 substitution is never disclosed or argued, and the wording was
inherited verbatim from the rejected Doc-4D predecessor.

**Fix:** Keep the conclusion (§10.3 **is** the owning location — Review-A sustained it) and replace
the proof with the three anchors that actually bridge, each to be re-derived from disk:

| Anchor | What it establishes |
|---|---|
| `Doc-4A_Content_v1.0_Pass1.md:169` | field-name source of truth = "Doc-2 §3, §10" — the two are a **paired** register, so Pass3:46's "§3" is a loose corpus label, not a precise pointer |
| `Doc-6D_Content_v1.0_Pass1.md:70` | the realized DDL column is annotated `-- [Doc-2 §10.3]` |
| `Doc-4D_Content_v1.0_PassA.md:81` | a frozen rank-0 contract doc points `vendor_type_preset` at "(Doc-2 §10.3)" **by name** |

Disclose the mismatch explicitly rather than papering over it: state that Pass3:46 names §3, that
§3 carries no attributes, and that the corpus resolves the looseness at the three anchors above.
A record that hides the seam is what produced M-1 in the first place.

### FIX-2 (M-2) · Remove the fabricated quotation; use the correct change-class row

**Where:** v1.0.11 `:11-12` and `:242-243`.

**Defect:** The patch presents, inside quotation marks, *"Domain change → Doc-2 §5 patch first →
Post-patch contract update"*. **No such sentence exists.** It is three cells of the
`Doc-4A_Content_v1.0_Pass5.md` change-class table reflowed with arrows. Additionally, `:242` is the
row *"New enum value in entity state (affects state machine)"* — and `vendor_type_preset` is **not**
a state field (Doc-2 §5 has no such machine; §5.3 governs `claim_state`), so it was the wrong row
regardless.

**Fix:**

1. Delete the fabricated string. Never render a table row as a quoted sentence.
2. Cite the on-point row instead — **verified on disk 2026-07-22**:
   `Doc-4A_Content_v1.0_Pass5.md:236` — `| New optional enum value for a filter/sort parameter |
   Additive | None | Consumers must declare tolerance (§16.7 analogous) |`.
   This is **directly** applicable and favours the patch, because
   `Doc-4D_Content_v1.0_PassB_Discovery.md:20` and `:27` declare `vendor_type_preset` an allowlisted
   hard filter in `search_catalog`. Render it as a table row or describe it — do not quote it as prose.
3. Disclose honestly that **Doc-4A does not classify this exact change** (a new value domain on a
   non-state entity attribute). Scanning `:234-247`, the closest analogues are `:236` (above) and
   `:243` (generic "New entity or aggregate → Doc-2 patch first"). Say so in bounded language; do
   not present one row as the general rule.
4. Consequence to carry forward: `:236`'s fourth column requires **consumers to declare tolerance**.
   Address that in §8's dependent-contract note.

### FIX-3 (M-3) · Surface the FE-PUB-09 rejection, and gate public rendering

**Where:** v1.0.11 §6 `:201-204` and §5 `:180`.

**Defect (two parts):**

- `digital_showcase_planning_and_design.md:393` records that FE-PUB-09 (2026-07-03) **"already
  REJECTED that family on Invariant #1 grounds"**, and `:385` restates *"no coined vendor-type
  values while ESC-MKT-VENDORTYPE is open (Invariant #1 precedent: vendor-type labels rejected at
  FE-PUB-09)"*. v1.0.11 cites both lines — but only as B1 dependencies. **The single most adverse
  prior decision in scope is never shown to the Board.**
- §5 records that `vendor-card.tsx:99-101` renders this label **publicly**, and nothing in the patch
  gates public rendering. GATE-VTP-1 covers only the `service_provider` mapping.

**Fix:**

1. Add an explicit subsection surfacing the FE-PUB-09 rejection in full, with both line anchors.
2. Distinguish it on the merits — and verify the distinction from disk before asserting it. The
   available ground: what FE-PUB-09 rejected was a rigid vendor-type taxonomy **replacing**
   capability; capability remains the four flags. `Master_System_Architecture_v1.0_FINAL.md:212`
   frames the five as existing *"purely as presets over these flags"* and `:222` states *"the flags
   — not the preset name — drive all matching"*. Anchor the distinction there, and cite the
   verbatim MK-CR4 anchor already carried at v1.0.11 `:102-104`.
   **If the distinction does not hold on re-reading, say so and Flag-and-Halt — do not force it.**
3. Add an **Invariant #1 row** to §3's additive test table. It currently has none.
4. Add a gate covering **public rendering** of the label at `vendor-card.tsx:99-101`, distinct from
   GATE-VTP-1's `service_provider` mapping gate. Site it per FIX-5 (altitude), not as a binding
   control inside a rank-0 domain patch.

### FIX-4 (M-4) · Delete the unexecutable fallback

**Where:** v1.0.11 §3.1 `:146-147`.

**Defect:** *"the rest of this patch would survive with the display names used verbatim as values"*
— display names such as "Service Provider / Consultant" violate `Doc-4A_Content_v1.0_Pass1.md:172`
(mandatory lowercase snake_case for enum values). The Board is offered an option it cannot take.

**Fix:** Delete the sentence. Replace it with the accurate consequence: **if the Board takes reading
(ii) (RE-KEYING), the patch must be withdrawn pending the parked track** — there is no surviving
variant. Do not soften this.

---

## 3. Required fixes — Review-A MINORs

### FIX-5 (m-1) · GATE-VTP-1 is out of altitude — re-site it

**Where:** v1.0.11 `:162-164`, `:268`.

**Defect:** A normative control declared *"binding on FE realization"* sits inside a rank-0
domain/DB patch. Doc-2 governs the domain model; FE conduct is Doc-7G's. Nothing enforces it —
`:184` states *"FE realization is not authorized by this patch"*, so it binds a work item with no
owner, no ESC handle, no tracker row, no consumer. This is the **one respect in which v1.0.11 is
worse than the rejected predecessor**, which carried it as a disclosure.

**Fix:** The substance is correct and must be preserved (the harm at
`Master_System_Architecture_v1.0_FINAL.md:216` is real — mapping FE's `service_provider` onto a
`can_consult`-only preset would mis-route work). Change the instrument, not the content:

- Mark it **(Informative — Non-Normative)** inside this patch, per the repo's ADR-altitude rule; **and**
- Give it a real home — a Doc-7G item or an ESC row with a handle. If you open an ESC row, register
  it properly in `esc_registry.md` (repo root); if you do not, say plainly that it has no
  enforceable home yet rather than implying it does.
- Apply the same treatment to the new public-rendering gate from FIX-3.

### FIX-6 (m-2) · The closure claim's residence is ambiguous

**Where:** v1.0.11 `:57-60`, `:78`, `:96` vs `Doc-2_..._v1.0.2.md:55-60` (§0.4 Notation) and `:731`.

**Defect:** Doc-2 §0.4 defines `(AR)`, `VO`, tenancy classes and currency — it does **not** define
the inline parenthetical attribute notation. And the matched sibling `visibility(public)` lists one
value where Invariant #3 gives the scope as `buyer_private | public` — so the notation is proven
**non-closure-bearing in the very cell the patch imitates**. "The domain is closed at these five
values" is therefore carried by the patch's prose, not by the text landing in Doc-2 — which sits in
tension with `:80` ("No other text in :731, in §10.3, or anywhere in Doc-2 is amended").

**Fix:** Resolve the residence explicitly. Precedent for a prose-borne binding exists —
`Doc-2_Patch_v1.0.9.md:41` ("Binding rules (freeze-level)"). Either place the closure in a Binding
Rules block on that precedent and reconcile it against `:80`, or make the amended cell itself carry
the closure. Do not leave it ambiguous. Re-verify `:55-60` and `:731` from disk.

### FIX-7 (m-3) · Re-point the misattributed Authority Map quote

**Where:** v1.0.11 `:232-234` vs `00_AUTHORITY_MAP.md:128`. The row's *"(the sole content authority,
untouched)"* attaches to **Doc-2_Patch_v1.0.8**, not to "Doc-2 §7". The G-1 drop itself holds
(`:128` does record the 43→45 correction and the stale base prose) — only the attribution is wrong.

### FIX-8 (m-4) · Analyse the v1.0.9 precedent in the direction that matters

**Where:** v1.0.11 `:96-97`, `:129`, `:137`. `Doc-2_Patch_v1.0.9.md:49` is quoted correctly and does
establish that a Doc-2 patch may coin a closed value set. But the postures differ: v1.0.9 coined
**for entities it introduced itself**, where no other rank-0 document held a competing register.
This patch coins **alongside an existing rank-0 register** (`Master_..._FINAL.md:214-220`). State
the distinction and explain why it does not defeat the coining authority — it goes to the whole of
the §3.1 question and is currently unstated.

### FIX-9 (m-5) · Reason the `trader` → `mro_retail_supplier` mapping, or defer it

**Where:** v1.0.11 `:177` vs `Master_..._FINAL.md:217`, `:218` — both seed `✓ – – –` and are
therefore **behaviourally indistinguishable**. The patch builds a binding gate around one mapping
and asserts another as fact. Either give the semantic reasoning or defer it with the rest.

### FIX-10 (m-6) · Resolve the §4/§5 internal contradiction

`:164` ("Adopting this patch does not authorize that mapping") and `:184` ("FE realization is not
authorized by this patch") versus `:162` ("binding on FE realization") and the declarative mapping
table at `:177`. The patch simultaneously disclaims and directs FE behaviour. FIX-5 should largely
dissolve this; confirm no residue remains.

### FIX-11 (m-7) · Do not elide the adverse clause in `CLAUDE.md:193`

**Where:** v1.0.11 `:82`. The cited line reads *"bind frozen entities/slugs/events/audit
actions/POLICY keys **by pointer**; never copy or invent."* The pointer-binding is genuine and well
executed — but citing this line as the section heading of a **minting** act without acknowledging
the "never invent" clause is adverse-clause elision. Quote the clause in full and address it: the
patch binds the five rows by pointer and mints only machine identifiers for rows the corpus already
fixes, which is realization rather than invention. **Make that argument explicitly; do not let the
truncated quote do the work.**

---

## 4. Required fixes — NITPICKs and OBS worth landing

- **NIT-1** — `Doc-4A_Content_v1.0_Pass5.md:241` is the `error_code` rename row; generalizing it to
  "wire-token renames are Breaking" is extrapolation. `:239` ("Change field type or semantics →
  Breaking") is the closer support. Applies wherever v1.0.11 `:219` argued rename cost — note this
  argument is now largely spent, since RULING 1 avoids the rename outright.
- **NIT-2** — Path convention. `esc_registry.md` is at **repo root**; `00_AUTHORITY_MAP.md` is in
  **`generatedDocs/`**. v1.0.11 cites both bare (`:29`, `:49`, `:190`, `:195`, `:266`). Use
  repo-relative paths consistently.
- **OBS-1 → promote into the argument.** `iVendorz_Master_Overview_v1.0.md:195` carries a
  **divergent display set** for the same five presets — "(Service Provider, MRO Supplier, Importer,
  Manufacturer, Engineering Firm)" versus `Master_..._FINAL.md:216-220` — inside the patch's own
  declared sweep boundary. Under reading (ii) (RE-KEYING, identity = the string) the corpus would
  **already be self-contradictory**. It is not — because the **row**, not the string, is identity.
  This is the strongest available argument for the patch's own sustained position and it is
  currently nowhere in the patch. It also directly supports RULING 1. Verify both line anchors and
  put it in §3.1.
- **OBS-2** — `:217` and `:218` are capability-identical, so two identifiers are minted for
  behaviourally indistinguishable rows. Pre-existing and frozen, exactly like C-6 — but §7 lists
  C-6 and not this. Add it to the carried-OPEN register for consistency.
- **OBS-3** — §9 `:264` marks the Existing-Text-Reference verification "☐ not run" while §2 asserts
  the sibling notation as fact. Review-A independently confirmed the assertion is correct. Run the
  check and tick it, or keep it honest.
- **OBS-4** — `esc_registry.md:92` registers the channel as *"Additive
  Doc-4D_VendorTypePreset_Values patch (Board)"*. This proposal **reroutes** it to Doc-2. §6's
  row-wise amendment does include Channel, so the deviation is covered — but call it out
  explicitly as a deviation from a registered channel.

---

## 5. What must NOT change

Review-A verified these exactly. Preserve them; re-verify, do not rewrite:

- Patch ID **PATCH-D2-10**, version **v1.0.11** → the revision becomes **v1.0.12** / next free patch
  ID. Re-derive both from disk (`00_AUTHORITY_MAP.md:55` shows Doc-2 at v1.0.10; the on-disk patch
  series runs …v1.0.8 = D2-07, v1.0.9 = D2-08, v1.0.10 = D2-09).
- The §3.1 ruling itself: **reading (i) ADDITIVE REALIZATION sustained, reading (ii) RE-KEYING
  rejected** — record it as Review-A's sustained conclusion **awaiting Board ratification**. The
  reviewer concludes; the Board ratifies. Do not write "the Board should decide" as if unresolved,
  and do not write it as already ratified.
- §6's ESC half-closure — verified precise and complete (`esc_registry.md:25` genuinely has no
  status column; `:96`'s whole-handle ✅ mechanism is genuinely wrong for a half-closure; the
  second-gap carve-out is quoted exactly; B1 protection is real and correctly non-committal; the
  `BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0.md:24` item-3 deferral premise is honestly flagged).
- §5's code/Prisma impact table — every claim verified exactly, including the eight seed entries /
  six distinct labels at `prisma/seed.ts:55-118` and the exact "Manufacturer" match to
  `Master_..._FINAL.md:219`; 11 migration directories; no `VendorProfile` model;
  `Organization.hasVendorProfile:204`.
- §8's refusal to sequence a rank-0 fold behind unratified ADR-023 — correct
  (`00_AUTHORITY_MAP.md:55` confirms ADR-022/023 folds pending).
- The ADR-023 §-precision note (that document has Context / Decision / Consequences / Alternatives /
  References and **no §2**; the target is Decision item 2 at `:36-44`) — precise and honest.
- The bounded absence claim regarding no machine-readable domain in `generatedDocs/` — Review-A
  independently confirmed it by sweeping all five identifiers with zero hits.
- Firewall disclaimer `:114` (Invariants #6/#10) — correct.
- The verbatim MK-CR4 Invariant #1 protection at `:102-104`.

---

## 6. Red Flag Checklist

v1.0.11 cleared it and the revision must too: no new module · no ownership change · no cross-module
DB access or FK · no cross-module import beyond `contracts/` · no governance-signal read/write or
cross-mutation · no ADR override · **no frozen document modified** (proposal only, human-approval
gated). One Module One Owner intact — M2 attribute, M2 doc. If any fix in this directive would
breach one of these, **STOP and escalate** rather than proceeding.

---

## 7. Deliverable

1. `governanceReviews/Doc-2_Patch_v1.0.12_VendorTypePresetValues_PROPOSAL.md` — the revision.
2. A short **disposition table** inside it: each of M-1…M-4, m-1…m-7, NIT-1/2, OBS-1…4 →
   `applied` / `applied-with-variance (reason)` / `not applied (reason)`. Per Raise ≠ Accept, a
   raised finding is a claim, not a mandate — but every one gets an explicit ruling on the record.
3. v1.0.11's Status block updated to **SUPERSEDED by v1.0.12**. Do not delete the file. Do not
   otherwise edit it.
4. Nothing committed unless the owner asks. Nothing pushed. If committing, commit **by explicit
   path** — never `git add -A` (parallel sessions share this branch).
