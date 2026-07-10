# Doc-2 Additive Patch PROPOSAL — Vendor Directory (schema mirror)

**Status:** PROPOSAL DRAFT v1.0 — gated on Board rulings **R3/R5**; mirrors
`Doc-4F_Vendor_Directory_Additive_Patch_PROPOSAL.md`. NOT applied; frozen Doc-2 v1.0.2 is not edited.
**Date:** 2026-07-03 · **Kind:** additive only (new nullable columns / new tenancy rows / additive
enum values; nothing removed or repurposed).

## P-1 (R5) — `operations.private_vendor_records` column additions
Per Doc-4F proposal Part 1 (only the items the Board accepts as first-class): `contact_person`,
`designation`, `alt_phone`, `office_phone`, `website`, `address`, `city`, `country`, `bin_number`,
`trade_license_no`, `vat_registration_no`, `logo_storage_ref`, business-category references
(service-validated IDs, **no cross-schema FK** — Doc-2 §0.3). All nullable. Items the Board leaves
in `details_jsonb` receive **no** schema change. Tenancy row (§6/§10.5) unchanged: tenant-owned,
never disclosed.

## P-2 (R5) — `admin.link_suggestions.match_basis` additive enum values
`bin`, `domain` appended to `email|phone|trade_license`. State machine
(`suggested/confirmed/dismissed`) untouched; never vendor-visible (unchanged).

## P-3 (R3) — off-platform participation, per the Board's shape choice
- **If Shape A:** `operations.engagements` gains nullable `private_vendor_record_id` + exactly-one
  party rule; visibility note: private-party engagements are buyer-org-private (vs `shared
  (parties)`); engagement creation gains a buyer-manual source alongside `RFQClosedWon` (A-02
  extended additively). Document children inherit party + visibility.
- **If Shape B:** new tenancy/entity rows for `operations.offline_procurement_records` (+ offline
  document children): tenant-owned (buyer `organization_id`), never disclosed, soft-delete per
  Invariant #8, versioned documents mirroring §10.5 engagement-children conventions; `human_ref`
  allocation via Doc-4B (kind per Doc-4B registry pass).

## P-4 (R5) — permission slugs (only if Board separates them)
Optional new slugs for buyer import/export (else covered by `can_manage_private_vendors`); if R4
approves, the buyer-invite submit permission is defined in the buyer-invite proposal, not here.

## Out of scope
No change to: claim lifecycle (PATCH-02 boundary), link-not-merge (A-03/PATCH-05), governance
signals (§4 firewall), `buyer_vendor_statuses` (append-only, never evented — R5), M3 rows, or any
frozen state machine.
