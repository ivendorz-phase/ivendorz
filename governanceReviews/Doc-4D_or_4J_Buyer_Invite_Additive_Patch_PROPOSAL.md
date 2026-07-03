# Additive Patch PROPOSAL — Buyer-Initiated Invite-to-iVendorz (ownership analysis + drafted flow)

**Status:** PROPOSAL DRAFT v1.0 — gated on Board ruling **R4**
(`BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md`). NOT applied; no frozen doc edited.
**Date:** 2026-07-03 · **Kind:** additive (one enum value, new submit/dispatch contracts).
**Also hosts:** the R2-b "Suggest this vendor to iVendorz" submit stub (Annex B) — same intake
machinery, so drafted once here.

## 1. Frozen baseline
Seeding/invitation is admin-driven: M8 Excel import console seeds `marketplace.vendor_profiles`
into the claim lifecycle; `marketplace.vendor_claim_records` tracks `seeded → invited → claimed`
with `source enum<excel|admin|registration>` (Doc-2 §3.3/§10.3). No buyer-initiated invite exists.
`admin.missing_vendor_suggestions` exists (`suggested_by_organization_id`, `category_id`,
`vendor_name`, `contact_hint`; `submitted → triaged → closed`) with **admin triage/close contracts
only — no submit contract in the frozen corpus** (verified 2026-07-03).

## 2. Proposed flow (drafted for R4)
1. **Submit (buyer):** from a Private Vendor record, the buyer triggers an invite request. New
   contract (final home per §3): submit creates an intake row referencing the buyer org and the
   private record's public-safe fields ONLY (company name, category, contact channel the buyer
   explicitly designates for the invite). Notes/ratings/status/history are never included
   (Invariant #11).
2. **Triage (admin, M8):** existing missing-vendor triage machinery; approval seeds/locates a
   `vendor_profiles` row via the frozen M8 seeding path.
3. **Dispatch (system):** invitation dispatched per the frozen `seeded → invited` transition;
   delivery via M6 (delivery-only). `vendor_claim_records.source` gains additive value
   `buyer_referral`.
4. **Claim (vendor):** frozen `invited → claimed` (Doc-2 §5.3).
5. **Link-back (buyer):** on claim, the normal `admin.link_suggestions` → buyer
   `ops.confirm_vendor_link.v1` path fires (already frozen). Buyer approval remains required;
   nothing auto-links.
6. **"Pending Invitation" UI state:** derived buyer-side from the intake row + claim record state;
   the vendor never sees which buyer invited them unless the buyer chose a disclosed invite
   (Board sub-question Q-3 below).

## 3. Ownership ruling sought (the "4D or 4J" question)
| Piece | Candidate owner | Note |
|---|---|---|
| Submit contract + intake row | **M8** (missing-vendor intake charter, Master §16.2) — reuse/extend `missing_vendor_suggestions` or a sibling intake AR | keeps buyer-submitted intel platform-side with existing triage |
| `source` enum value `buyer_referral` | **M2** (`vendor_claim_records`) | one additive enum value |
| Dispatch/delivery | **M6** | delivery-only; no content ownership |
| Link on acceptance | **M4** | already frozen |

## 4. Board sub-questions
- **Q-1:** reuse `missing_vendor_suggestions` (add optional `private_vendor_record_id` +
  contact-designation fields) vs a sibling "vendor invite request" AR.
- **Q-2:** permission — under `can_manage_private_vendors` vs a new invite slug.
- **Q-3:** disclosed vs anonymous invite (does the invited vendor learn the inviting buyer's name?).
  Anonymous preserves maximal privacy; disclosed ("Your customer has invited you") is the proposal's
  stated UX and is a *buyer-consented* disclosure — Board to rule the default and whether it's
  per-invite selectable.
- **Q-4:** quota/abuse control (POLICY-owned limit per org per period).

## Annex B — R2-b submit stub (if the Board picks the consent-based discovery path)
Same intake machinery as §2 step 1 minus the invitation intent: buyer explicitly submits a
"suggest this vendor to iVendorz" row (public-safe fields only, audited, org-attributed via
`suggested_by_organization_id`). Sales/acquisition consoles (M8 staff-scoped) read intake rows and
cell-grid data (Doc-3 §11.4) — never `operations.private_vendor_records`. No aggregate is ever
buyer-facing; no reference counts are surfaced anywhere.
