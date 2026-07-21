# ReviewA_Record_RankZero_Amendment_Mechanism_v1.2.md

> **Review record — Team-4 Review-A, round 3 (fresh reviewer, no prior involvement).**
> Subject: `governanceReviews/Governance_RankZero_Amendment_Mechanism_v1.2_PROPOSAL.md` (committed
> `cb87019`). Findings preserved **as raised**; Raise ≠ Accept (`CLAUDE.md §13`).
> **No adjudication.** B-1, MAJ-1, MAJ-3 and MAJ-8 concern fit against rank-0/rank-1 frozen text and
> the declared authority order — they **escalate to the human Architecture Board** under
> `CLAUDE.md:198` and must not be resolved locally.
> Rounds 1–2: `ReviewA_Record_RankZero_Amendment_Mechanism_v1.0.md` / `_v1.1.md`.

| Field | Value |
|---|---|
| Round | 3 · 2026-07-21 · fresh reviewer, new reasoning chain |
| Verdict | **🟠 REVISION REQUIRED** |
| Counts | **1 BLOCKER · 10 MAJOR · 12 MINOR · 3 NIT · 4 OBS** |
| Gate (`CLAUDE.md:225`) | **NOT MET** |

## Convergence trend — the reason this track is being parked

| Round | Subject | BLOCKER | MAJOR | MINOR |
|---|---|:-:|:-:|:-:|
| 1 | v1.0 | 1 | 9 | 10 |
| 2 | v1.1 | 1 | 9 | 7 |
| 3 | **v1.2** | **1** | **10** | **12** |

Three revisions, three blockers, majors rising. The reviewer identifies **three respects in which
v1.2 is worse than v1.1** (§5 below). The instrument is **not converging**; owner ruled 2026-07-21 to
park it and unblock the product need by an additive route instead (see §6).

---

## 1. BLOCKER

**B-1 — RZ-1's semantic trigger is over-broad and self-applied: as written it captures the ordinary
additive rank-0 patch route, and is evadable by characterization.**
*Instrument:* `v1.2:284–314` (RZ-1), `:450` (§6 step 1). *Sources:* `CLAUDE.md:139–140`;
`00_AUTHORITY_MAP.md:30–31, :55, :86, :121, :123`.

**(a) No additive carve-out.** The trigger fires on *correction · reconciliation · consolidation*
whenever an act "changes the active meaning of rank-0 canon." The exclusion list excludes editorial
changes, non-authoritative guidance, derived indexes, lower-rank documents and legacy overlays —
**but not additive extension of rank-0 canon**. Doc-2 and Doc-3 are rank 0
(`00_AUTHORITY_MAP.md:18`); Doc-2 stands at v1.0.10 through ten additive patches, several of which
are corrections that change what Doc-2 canonically says (`:123` 45→43; `:121` 43→45→46→47; `:86` "a
conformance correction"). Under RZ-1 the next such patch mandates **full re-issue of Doc-2 under §6's
nine-step Board procedure** — contradicting `CLAUDE.md:139–140` and the instrument's own prose
assurance at `:313–314`, which has no clause behind it.

**(b) No decider, applied before the Board sees it.** *"Editorial corrections that do not change
canonical meaning"* (`:293`) names no authority. §6 step 1 places admissibility on the **drafter**;
Board approval is step 6. A drafter who calls a change editorial never enters the procedure.
Rank-1 precedent puts that call with the Board — `ADR_Compendium_v1.md:56–57` shows the Board issuing
*"Modify (editorial)"* verdicts. Same evasion vector as round-2 **M-2**, relocated from *"could it be
additive?"* to *"is it editorial?"*, not removed.

---

## 2. MAJOR

| ID | Finding |
|---|---|
| **MAJ-1** | **The rank-0 sweep covers 1 of 13 rank-0 documents** while §1.1 is headed *"What ranks 0 and 1 actually contain."* `00_AUTHORITY_MAP.md:18` — rank 0 = Master **· Doc-2 · Doc-3 · Doc-4A…4M**. Only Master was swept. On-point material sits in the unswept set: `Doc-4_Governance_Note_v1.0.md:23` — *"**Amendment rule.** After freeze, Doc-4A changes only through the established patch process"* — a stated amendment rule for a **rank-0** document; parallel clauses at `Doc-4D_Structure_Freeze_Gate_v1.0.md:190`, `Doc-4C_Freeze_Audit_v1.0.md:134`, `Doc-4E_Structure_Freeze_Gate_v1.0.md:84`. Round-2 **M-9** flagged one of these and it was accepted; still absent. **Third consecutive recurrence of the B-1 defect class.** |
| **MAJ-2** | **`ADR_Compendium_v1.md:57` is the wrong anchor, in three places** (`:71`, `:157`, `:438–439`). `:57` is §B **item 8** (typo/dedup). The quote *"ADR-019 absent from corpus … Number reserved. Do not backfill."* is at **`:58`**. Error inherited verbatim from `ReviewA_Record_…_v1.1.md:93`, where it was recorded as *"confirmed"* — **the verification step did not verify** (`CLAUDE.md:197`). This is the **sole** rank-1 support for RZ-8 rule 2. |
| **MAJ-3** | **RZ-8 rule 2's support does not support the proposition, and the coined rule sits in the "existing precedent" column.** `:58` concerns an **ADR numbering gap** — a never-issued number not to be retro-filled (`ADR-024:16` reads it as such). RZ-8.2 concerns **reuse of a previously issued document version label** — different subject (issued vs never-issued), different object (version label vs ADR number). So RZ-8.2 is unsupported at rank 1, and §3.1 — the column rebuilt under **M-8** precisely to separate coined from demonstrated — carries a coined rule as precedent. |
| **MAJ-4** | **The instrument violates its own RZ-8 rule 1 in choosing its own label.** By the stated method (sweep `00_AUTHORITY_MAP.md` + `generatedDocs/`), the next unused label is **ADR-026**; the instrument selects **ADR-027**. The selection is correct in substance — `ADR-026_Transient_Upload_Lifecycle_PROPOSAL.md` exists and ADR-022/023 are pending (`ADR-024:16`) — which is the point: **the sweep method cannot see allocated-but-unfolded labels**, so it cannot derive the instrument's own number. |
| **MAJ-5** | **RZ-4's "authoritative adoption / re-issue record" is a new artifact class with no corpus precedent, no home, no authority level and no registration duty.** *"adoption record"* / *"re-issue record"* / *"reissue record"* return **zero hits across `generatedDocs/`**. RZ-4.2 makes it the thing that establishes the transition — superior in effect to the Authority Map — yet nothing says where it lives, in what form, or at what level; it fits **no** value in the `:39–45` legend, and RZ-6 imposes no duty to register it. Calling it *"authoritative"* asserts a level while `:227–228` disclaims coining one. **Round-2 M-6 is relocated, not closed.** |
| **MAJ-6** | **The §7.3 effectiveness gate is not decidable.** `Governance_Freeze_v1.0.md:49–53` requires an additive patch **+ bump the `FROZEN vX.Y` stamp in `CLAUDE.md` AND `repository_structure.md`.** §7.3 cites `:8` for scope but never reaches `:49–53`; its bundle carries a vague *"governance/orientation freeze procedure"* line and **omits the `REPOSITORY_STRUCTURE.md` stamp entirely**. §9 makes this gate the sole condition of effectiveness. |
| **MAJ-7** | **The folded-but-inert state is registered nowhere.** ADR-027 folds into `generatedDocs/` and registers in the Authority Map while being **ineffective**. No duty to record the inertness, no owner, no deadline, no failure path. A reader of the folded ADR-027 has no signal it is inert — **the identical hole RZ-4 was rewritten to close for superseded artifacts.** |
| **MAJ-8** | **§7.3/§7.4 contradict RZ-6's own principle and invert the asserted authority direction.** RZ-6 (`:408–409`): *"a rank-1 ADR does not make normative duties out of non-authoritative or draft artifacts"* — yet §7.3 makes a NON-AUTHORITATIVE file's update a **precondition of the ADR's effectiveness** (stronger than a duty), and §7.4 binds every governance artifact in the program. Against `:148–149` (*"Nothing below rank 1 authorizes anything in §5"*). Separately: RZ-3 does **not** edit a frozen document, so `CLAUDE.md:192` sentence 1 is not contradicted — only sentence 2 — and the replacement wording silently **drops** that sentence rather than qualifying it. |
| **MAJ-9** | **RZ-2 cites a §3.2 row that does not exist.** `:327–329` claims *"conversational approval authorizes drafting only"* is enumerated in §3.2 per **M-8**; §3.2's nine rows contain no such row. Also still unclassified in either column: RZ-3's five "Normative posture" bullets (`:349–358`) — incl. *"No 'latest file wins'"* and *"No concurrent rank-0 canon"*, which are negative **precedence rules** while `:226` states *"Not coined, expressly: a base/patch precedence rule"* — and §7.1's *"Every rank-0 amendment is a discrete Board act."* |
| **MAJ-10** | **§2.1 mis-slots its own contrary evidence as supporting.** `:186–187` cites `Architecture_Freeze_Reconfirmation_v1.0.md:18` *"For"* the instrument. In place, `:18` labels the **base-plus-overlay** state as *"the standard consolidated state"* and calls the additive-amendment route *"**the established model**"* — i.e. it is evidence **for** durable base+patch coexistence, the strongest single counter to RZ-3's "no permanent corrective overlays." The quotation is attributed to the wrong referent, **in the section written to demonstrate even-handedness.** |

---

## 3. MINOR / NIT (as raised, condensed)

**m-1** `:50–59` cited for eleven verdicts; items 1–11 occupy `:50–60`. · **m-2** ADR-010 spans
`:495–524` not `:495–523`; categories at `:505–507` not `:506–508`; `:511` is general to controlled
business documents, not *"RFQ-scoped"* (round-2 m-3 was accepted to make this exact). · **m-3**
*"changes require an additive patch + version bump"* attributed to `CLAUDE.md:3–5`; the sentence is
at **`:13`**. · **m-4** sweep boundary misdescribes ADR-024/-025 as *inside* the Compendium; they are
separate carried files. · **m-5** `Doc-4E_…:92` cited with the filename elided — 41 candidate files;
resolves to `Doc-4E_Structure_Freeze_Gate_v1.0.md:92`. · **m-6** `Doc-5D_Patch_v1.0.1` does not
exist; the artifact is `Doc-5D_PublicProductDetail_Patch_v1.0.1` (inherited from v1.1). · **m-7**
`ADR-024:3, :18` stamped *"rank 1 — FROZEN"* in the load-bearing column; both are status-banner /
"Raised by" **metadata**, not normative decision text. · **m-8** the `Doc-4C_PassA_Patch:38` row has
**no authority level** in the load-bearing column (per `00_AUTHORITY_MAP.md:189` it is PROVENANCE). ·
**m-9** **undisclosed widening** — v1.1's exclusion of *"convenience, tidiness, or consolidation"*
was deleted and **consolidation promoted to a trigger**; Board-authorized, but the loss of the
anti-convenience guard is nowhere disclosed in the delta narrative. · **m-10** §7.4 heading says
*"binding on future instruments"*, body says *"in this program"* — drops the Board's *"future"* and
makes the control retroactive. · **m-11** same evidence anchored `:1186–1196` and `:1184–1196`;
`:1184` is the load-bearing sentence. · **m-12** dependents are gated on *"approved AND folded"*
while §7.3 introduces a later **effective** state; unclear whether they unpark on fold or on
effectiveness.
**n-1** `Doc-4D_Structure_Freeze_Gate` classified PROVENANCE by analogy; unregistered. · **n-2**
`:41` is the legend, the target document's row is `:53`. · **n-3** *"§5"* of the v1.1 record is
ambiguous — that record has two `## 5.` headings.

---

## 4. OBS

**O-1** `:108–110` is an absence-shaped statement about the legacy corpus in the section most likely
to be quoted; bounded and deferred to G-1, so not a §7.2 breach, but worth watching. · **O-2**
disposition drift: the v1.1 record rules O-2 *"Adopt the scope-independent Invariant 8 argument"*
while v1.2 abandons Invariant 8 as a basis; the same record's §5.8 says O-1…O-4 need no action, so
the record contradicts itself. · **O-3 — Red Flag Checklist · 12 Core Invariants · authority order ·
governance-signal firewall · Content ≠ Presentation: NO VIOLATION FOUND.** RZ-3's re-issue is
*adjacent* to *"Modify a FROZEN document"*; the adjacency is disclosed, RZ-4 forbids mutating the
superseded artifact, RZ-2 routes to human Board, and `CLAUDE.md:149` is correctly self-applied. ·
**O-4** corrections claimed against v1.1 that the reviewer **independently confirmed real**: M-1,
M-3, M-4, M-5, M-6, M-9. *"The revision is substantive."*

---

## 5. Respects in which v1.2 is WORSE than v1.1

1. **B-1** — v1.1's syntactic test could not, by construction, capture additive patches; v1.2's
   semantic trigger **can**, and no exclusion stops it.
2. **m-9** — the *"convenience, tidiness, consolidation"* exclusion was deleted and consolidation
   promoted to a trigger, **undisclosed**.
3. **MAJ-5** — supersession moved from resting on a nonexistent legend value to resting on a **wholly
   undefined artifact class**.

---

## 6. Owner ruling — 2026-07-21

**ADR-027 track: PARKED.** Not rejected — parked as non-converging. Resuming it requires, at minimum:
the full **13-document rank-0 sweep** (MAJ-1), an RZ-1 trigger with an additive carve-out and a named
decider (B-1), an authority level and home for the adoption record (MAJ-5), and a decidable §7.3
bundle (MAJ-6).

**The product need is unblocked by an additive route instead** — `vendor_type_preset` values are
enumerated against the **five frozen presets**, which requires no rank-0 amendment:
`governanceReviews/Doc-4D_VendorTypePreset_Values_Patch_v1.0.4_PROPOSAL.md`.

**Carried, unresolved by that route:** P-1 (frozen row 1 is named *"Service Provider / Consultant"*
but seeds `can_consult` only) and P-2 (no preset seeds `can_service` alone). Both remain **OPEN** and
require the parked rank-0 track. **G-1** likewise remains OPEN, PARTIALLY INFORMED.

**Also carried:** `MAJ-2`'s anchor error means `ReviewA_Record_…_v1.1.md:93`'s *"confirmed"* stamp
is unreliable for that row; and a coordination artifact
(`RankZero_Instruments_Coordination_Register_v1.0.md`, referencing an *Instrument 3*) appears in this
review's citations with **provenance unaccounted for in this session** — resolve before further work
lands on it.

---

## 7. Status

**Not folded. Not approved. No file modified by the review.**
