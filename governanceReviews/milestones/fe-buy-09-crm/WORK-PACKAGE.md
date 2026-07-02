# WORK PACKAGE — FE-BUY-09 CRM

- **Lane:** G (buyer-private CRM; Inv#11 non-disclosure — the highest-sensitivity surface in the
  buyer product: blacklist must stay UNDETECTABLE)
- **Reviewed-SHA record:** `adc84fa` (no code change — see Result below)
- **Value:** Buyer Productivity · **Priority:** P2 · **Size:** M · **Risk:** High

## In scope (the delta — a thorough re-audit; enhancement model per BX-01..FE-BUY-08)

- **P-BUY-26 CRM vendor list** (🟩 pre-loop; team-2.md: "Model non-disclosure listing"): re-audited
  for a genuine, safely-groundable enhancement. Findings: the list already renders a full,
  realistic 5-vendor fixture (not the "always empty" defect pattern seen on P-BUY-14/15/17/20
  before their fixes); it projects EXACTLY the 4 frozen `list_private_vendors.v1` fields
  {id,name,link_status,state}, so there is no additional field to surface without coining one; the
  link-status filter toolbar, cursor pagination stub, genuine-empty state, and archived-record tag
  are all already present and correct.
- **P-BUY-27 CRM vendor detail** (🟩 pre-loop; team-2.md: "model non-disclosure surface"):
  re-audited likewise. `currentStatus` (approved/conditional/blacklisted/none) is correctly gated
  to LINKED records only, correctly never rendered anywhere else in the app (verified: the
  dashboard's own governance comment explicitly states "CRM status is never shown [there]"), and
  the two DISTINCT authorization slugs (`can_manage_vendor_status` / `can_manage_private_vendors`)
  are correctly never collapsed. Notes/ratings/contact sections all handle absence honestly.
- **Navigation**: confirmed `/crm` is already wired into the buyer sidebar nav
  (`buyer-nav-model.ts`, "Private" section) with an explicit governance comment ("NO CRM
  status/flag is represented here") — no missing entry point.
- **Considered and REJECTED as unsafe**: a cross-link from the RFQ/Quotation/Comparison/Award
  surfaces to a vendor's CRM record (the natural "same-vendor" enhancement pattern used elsewhere
  this session, e.g. FE-BUY-06's comparison cross-link). Rejected because no frozen quotation/RFQ
  read projects a `private_vendor_record_id` or `vendor_profile_id` the CRM detail route could key
  on — the only shared signal is a free-text `vendorName` DISPLAY STRING, and matching on a display
  string risks resolving to the WRONG private vendor record (two profiles could share a display
  name), which would be a genuine Inv#11 cross-record leak risk. No contract grounds this link
  safely; not built.

## Out of scope (Review-A enforces)

- No new field on either read's projection (list stays 4 fields; detail stays exactly what
  `get_private_vendor`/`get_buyer_supplier_relationship` project).
- No cross-surface vendor-identity linkage (see rejection above) — genuinely ungrounded, not a
  scope-creep temptation to revisit without a new frozen read.
- No wiring of any of the 5 parked writes (status set/clear, add note, add rating, favorite
  toggle).
- No kit/token change.
- F2-Z freeze findings (parked for FE-CLN-01).

## Dependencies

- H: — none.
- S: — none.

## Lifecycle ownership

Builder = **Team-2** · Maintainer = **Team-2** · Review A → Review B (fresh contexts) → Dev-team
self-close on a clean A:PASS ∧ B:PASS gate (Amendment v1.3 §13; Board reserved for
BLOCKER/REGRESSION/Flag-and-Halt/override). Given the elevated Inv#11 stakes, Review-A/B are asked
to independently confirm the "no safe change found" conclusion, not just rubber-stamp it.

## Key dates

Created 2026-07-02 · Started 2026-07-02 (owner directive: proceed to kickoff without a pending
approval pause) · Paused — · Resumed — · Closed 2026-07-02 (RV-0114, Dev-team self-close,
audit-only — zero code delta)

## DoD confirmation (checked at close — review-process.md §6; NO code delta this milestone — the
DoD below is checked against the re-audit conclusion, not a new render)

☑ page DoD (re-audit, both pages) ☑ Inv#11/non-disclosure re-verified by both lanes (list-level
structural absence + detail-level proportionate, buyer-only chip both independently confirmed) ☑
Review A PASS (RV-0114, 9 OBS + 1 pre-existing non-gating MINOR) ☑ Review B PASS (RV-0114, 2 OBS,
B/M/M=0 for this milestone's own scope) ☑ no coined field/route/link introduced ☑ tracker updated
☑ card closed. Forward-looking CRM↔Engagement cross-link candidate recorded (A#2), not built —
belongs to a future milestone.
