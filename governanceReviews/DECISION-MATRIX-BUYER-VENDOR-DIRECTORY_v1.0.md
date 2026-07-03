# Decision Matrix — Buyer Vendor Directory & Vendor Discovery (one-page Board pre-read)

**Date:** 2026-07-03 · **Status:** awaiting human Board · **Full packet:** `BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md` · **Basis:** `BUYER-VENDOR-DIRECTORY-RECONCILIATION_v1.0.md`

**TL;DR:** The proposed Buyer Vendor Directory core **already exists frozen** (M4 BC-OPS-1 private
CRM + link-not-merge Smart Upgrade; FE shipped in FE-BUY-09). Real decisions: the anonymous
discovery layer (conflicts with 4 canonical rules — 3 options, neutral), the off-platform RFQ/PO
recording shape (A vs B), the buyer-invite flow, and a basket of small field/enum patches.

| Ruling | Question | Options | Frozen-corpus impact | Blocks |
|---|---|---|---|---|
| **R1** | Ratify dispositions (core = frozen; table superseded; types = derived; naming = presentation) | ratify / amend | none | all FROZEN-BACKED spec elements |
| **R2** | Anonymous "Discovered Vendor" intelligence — conflicts C-1…C-4 (Inv #6, Inv #11, §6.4 "analytics, or inference", §10.4) | **a** reject · **b** consent-based "Suggest to iVendorz" via frozen M8 missing-vendor intake (small additive submit contract) · **c** rank-0 patch (Annex A draft: k-anonymized Vendor Demand Signal, M8-owned) | a: none · b: additive patch, no invariant touched · c: **rank-0, human-only** (Master §4/§6.4/§16.2) | discovery/growth features |
| **R3** | Off-platform RFQ/PO/invoice/challan recording against private vendors (direction owner-ruled: pursue; M3 untouched in both) | **A** XOR party ref on frozen `engagements` · **B** new parallel buyer-private M4 aggregate | A: touches frozen post-award chain + visibility model · B: additive rows only | GATED-ON-R3 spec elements |
| **R4** | Buyer-initiated Invite-to-iVendorz (frozen seeding is admin-only) | approve / reject drafted flow (M2 source-enum + M8 intake submit + M6 delivery) | additive enum + new contracts | "Pending Invitation" section |
| **R5** | Small-item basket: fields (`details_jsonb` vs columns), category refs, logo, `match_basis` +BIN/+domain, buyer import/export, Merge-vs-archive, Mushok kind, OBS-1/OBS-2 errata note | per-item accept/reject | additive only | GATED-ON-R5 spec elements |

**Nothing in this package edits a frozen document.** R2-c is the only rank-0 item; everything else
is normal additive-patch flow. Package is uncommitted pending Board.
