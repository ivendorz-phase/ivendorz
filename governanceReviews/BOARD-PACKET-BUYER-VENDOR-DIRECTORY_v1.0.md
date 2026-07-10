# Board Packet — Buyer Vendor Directory & Vendor Discovery

**Status:** DRAFT v1.0 — awaiting human Architecture Board.
**Date:** 2026-07-03
**Author:** AI Coding Supervisor (planning) — raises; does not rule (Raise ≠ Accept, `CLAUDE.md §13`).
**Pre-read:** `DECISION-MATRIX-BUYER-VENDOR-DIRECTORY_v1.0.md` (one page).
**Basis:** `BUYER-VENDOR-DIRECTORY-RECONCILIATION_v1.0.md` (all anchors verified against the frozen corpus 2026-07-03).

> Ranks 0–1 are immutable to all skills (`CLAUDE.md §7`). Rulings R2-c and parts of R3 touch rank-0
> language and are therefore **human-only**; no AI sign-off substitutes (`CLAUDE.md §8`).

---

## Rulings sought

### R1 — Ratify the reconciliation dispositions *(authority: Board; rank 2+)*

Ratify §2/§3 of the reconciliation: the directory core, vendor types, Smart Upgrade, and permissions
are **already frozen** (pointed, not re-coined); the proposal's `buyer_private_vendors` table is
**superseded**; IA/naming rulings (§3.11) are recorded as presentation-level.

**Effect if ratified:** productSpec elements tagged FROZEN-BACKED become buildable at the FE program
board's discretion (subject to roadmap wave gating); nothing else changes.

---

### R2 — Discovered-Vendor intelligence layer *(options presented NEUTRALLY per owner instruction; no recommendation)*

Conflicts C-1…C-4 (reconciliation §3.10) are Flag-and-Halt. Three options:

**R2-a — Reject as proposed.**
No cross-buyer aggregation of private CRM contents in any form. The growth goal is served only by
existing frozen instruments (M8 missing-vendor intake; Doc-3 §11.4 cell-grid recruitment targeting
from demand/supply/conversion data).
*Cost:* forgoes the network-intelligence growth engine. *Authority:* Board minute only; no patch.

**R2-b — Conformant consent-based path.**
Buyer-initiated **"Suggest this vendor to iVendorz"**: an explicit, per-record, audited buyer action
that submits a suggestion into M8's frozen missing-vendor intake
(`admin.missing_vendor_suggestions` already carries `suggested_by_organization_id`, `category_id`,
`vendor_name`, `contact_hint`). Sales acquisition works from *submitted suggestions + cell-grid
demand data*, never from passive reads of private CRM tables. No anonymous
"referenced-by-N-buyers" surface exists; no buyer sees other buyers' activity.
*Gap to fill additively:* the corpus has admin triage/close contracts but **no submit contract** —
a small additive M8/M2-boundary patch (drafted as Annex B stub in the buyer-invite proposal file,
final home per R4 analysis). *Authority:* Board + normal additive patch flow (rank 2+); **no
rank-0 change** — consent-based submission is an "explicit, controlled, auditable channel"
(Master §1.2) and touches no invariant.

**R2-c — Rank-0 additive architecture patch (drafted, Annex A below).**
Amend the Master Architecture to carve a narrow, anonymized-aggregation exception and charter an
owner for discovery records. *Authority:* **human-only rank-0 patch** + version bump; largest
governance change in the program to date; Annex A is a draft for ratification, not a proposal by
the author.

> The author raises no preference among R2-a/b/c (owner instruction 2026-07-03).

---

### R3 — Off-platform participation shape *(owner has ruled the direction: pursue; Board picks the shape)*

Both shapes are drafted in `Doc-4F_Vendor_Directory_Additive_Patch_PROPOSAL.md`. In both, **M3 is
untouched** (an off-platform "RFQ" is a buyer-private M4 record, never an `rfq` row) and the money
boundary holds (recording, never settling — ADR-002).

| | **Shape A — XOR party reference** | **Shape B — parallel buyer-private aggregate** |
|---|---|---|
| Mechanism | `operations.engagements` (+ document children) bind `vendor_profile_id` **XOR** `private_vendor_record_id` | new tenant-private `operations` AR ("offline procurement record") with its own document children; frozen `engagements` untouched |
| Frozen surface touched | Doc-2 §3.6/§10.5 engagement rows; A-02 creation path (engagements exist today only via `RFQClosedWon`) must gain a buyer-manual creation source | Doc-2 §3.5/§10.5 additive rows only |
| Tenancy | engagement is `shared (parties)` today — an XOR row with a private party must degrade to buyer-private (two visibility regimes in one AR) | uniformly buyer-private; no visibility regime mixing |
| "Identical experience" | closest at the data layer | delivered at the presentation layer |
| Risk profile | higher (touches the frozen post-award chain + its RLS/visibility model) | lower (purely additive), some FE duplication |
| Linking upgrade path | on later vendor-link, XOR flips to `vendor_profile_id`? (mutation of a frozen chain — needs explicit rule) | offline records stay buyer-private forever, even after linking (matches Invariant #11's "even after vendor linking" posture) |

**Effect:** the chosen shape's patch proposal proceeds to normal additive-patch adjudication;
productSpec elements tagged GATED-ON-R3 un-gate.

---

### R4 — Buyer-initiated Invite-to-iVendorz *(authority: Board; additive patches)*

Approve (or reject) the flow drafted in `Doc-4D_or_4J_Buyer_Invite_Additive_Patch_PROPOSAL.md`, and
rule on the ownership split it proposes: M2 claim-record `source` enum addition (buyer-referral) ·
M8 intake/triage (submit contract added) · M6 delivery only · M4 linkage on acceptance (already
frozen). "Pending Invitation" in the Directory UI un-gates only on approval.

---

### R5 — Field-delta & small-item additive patches *(authority: Board; additive patches)*

One ruling covering the itemized small deltas (each independently accept/rejectable in the patch
proposal):

1. Contact/address/registration fields — `details_jsonb` vs first-class columns (reconciliation §3.4).
2. Core Business Area category references on private records.
3. Company logo storage reference.
4. `match_basis` additive enum values: **BIN**, **domain** (§3.7).
5. Buyer-side **import/export** capability (no frozen slug/contract today; §3.5).
6. **Merge** (private↔private consolidation) — approve as new contract, or adopt the zero-patch
   alternative (archive-duplicate + pointer note) given the frozen link-not-merge philosophy (§3.6).
7. **Mushok/VAT** — no decision here: already escalated as `ESC-OPS-DOC-MUSHOK`
   (`BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md` item 2a); the Directory composes with that ruling (§3.12).
8. Note OBS-1 (trade-license canonical home) and OBS-2 (Doc-4F "ADR-003 (link-not-merge)" vs
   Compendium ADR-003/ADR-005 pointer discrepancy) for a future errata patch — no action now.

---

## Annex A — DRAFT rank-0 additive patch for R2-c (ratification draft; NOT a proposal by the author)

**Title:** Master Architecture Additive Patch — Anonymized Vendor-Demand Aggregation (draft)
**Touches (rank 0):** Master Architecture §4 (Invariants #6/#11 carve-out), §6.4 (cross-tenant rule),
§16.2 (M8 charter extension). Requires human approval + version bump per `CLAUDE.md` frozen-doc rule.

Draft language (for Board mark-up):

1. **New defined term — Vendor Demand Signal:** a platform-derived, k-anonymized aggregate over
   private vendor records limited to: normalized company name, category tags, coarse location, and
   a reference count. Contains **no** contact data, notes, ratings, statuses, documents, history, or
   buyer identities.
2. **Invariant #6 carve-out (additive sentence):** "A Vendor Demand Signal is not a governance
   signal; it MUST NOT feed Trust, Performance, Financial Tier, Capacity, matching, ranking, or any
   per-vendor score, and MUST NOT be displayed on any vendor-facing or public surface."
3. **Invariant #11 boundary (additive sentence):** "Aggregation into a Vendor Demand Signal is
   lawful only above a k-anonymity floor (k ≥ K_MIN, POLICY-owned, default 5) and only over the
   fields in (1); everything else remains never-exposed."
4. **§6.4 exception (additive):** "Exception: Vendor Demand Signals, computed by a System actor
   under M8 ownership, audited, and irreversibly decoupled from contributing organizations."
5. **Ownership:** M8 (staff-scoped consoles + the buyer-facing 'no verified vendors found —
   [Invite to Join]' hint, which exposes only fields in (1)). M9 remains excluded (Invariant #12
   untouched).
6. **Buyer transparency & opt-out:** tenant-level POLICY flag (`org may exclude its private records
   from aggregation`), disclosed in terms; exclusion undetectable externally.

*Open Board questions on the draft:* K_MIN default; whether the buyer-facing hint ships at all in
v1; retention/regeneration rules for demand signals; interaction with ADR-013 (Data Ownership &
Privacy).

---

## Disposition log (Board fills)

| Ruling | Decision | Date | Presiding |
|---|---|---|---|
| R1 | | | |
| R2 (a/b/c) | | | |
| R3 (A/B) | | | |
| R4 | | | |
| R5 (items 1–8) | | | |
