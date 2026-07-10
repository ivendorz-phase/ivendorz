# Doc-4F Additive Patch PROPOSAL — Vendor Directory (fields + off-platform participation)

**Status:** PROPOSAL DRAFT v1.0 — gated on Board rulings **R3** and **R5**
(`BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md`). NOT applied; frozen Doc-4F is not edited.
**Date:** 2026-07-03 · **Kind:** additive only (new fields/contracts; no frozen contract modified,
no state machine altered, no slug/enums removed).
**Mirrors:** `Doc-2_Vendor_Directory_Additive_Patch_PROPOSAL.md` (schema rows). Downstream on
approval: Doc-5F (API) and Doc-6F (DB) additive passes.

---

## Part 1 — Field additions to the Private Vendor Record (R5 items 1–3)

Target aggregate: **Private Vendor Record** (`private_vendor_records`, BC-OPS-1, Doc-4F §F4).
All additions are nullable/optional; existing contracts remain valid unmodified; `details_jsonb`
remains for uncatalogued attributes.

| # | Field (proposed) | Notes | Board option |
|---|---|---|---|
| F-1 | `contact_person`, `designation`, `alt_phone`, `office_phone`, `website` | plain scalar columns | first-class columns **or** stay in `details_jsonb` (zero-schema) |
| F-2 | `address`, `city`, `country` | country default BD; multi-currency posture unaffected | same choice |
| F-3 | `bin_number`, `trade_license_no`, `vat_registration_no` | registration identifiers; also feed link matching (Part 3) | first-class recommended by data-quality argument; Board decides |
| F-4 | `logo_storage_ref` | Supabase Storage reference, tenant-scoped | accept/reject |
| F-5 | business-category references (multi) | category IDs service-validated against Marketplace taxonomy; **no cross-schema FK** (Doc-2 §0.3) | accept/reject |

**OBS-1 resolution required:** state the canonical home of the trade-license value that
`admin.link_suggestions.match_basis=trade_license` matches against (today implied `details_jsonb`).

## Part 2 — Off-platform participation (R3 — two shapes; Board picks ONE)

Common to both shapes: tenant-private, **never disclosed**; no vendor-side experience; no M3
surface (an off-platform "RFQ" is a buyer-private record here, never an `rfq` row); money boundary
holds (recording only — ADR-002); audit per Doc-4B; contracts follow Doc-4A metastandard.

### Shape A — XOR party reference on the frozen engagement chain
- `operations.engagements` gains nullable `private_vendor_record_id` with a CHECK-style rule:
  exactly one of `vendor_profile_id` / `private_vendor_record_id`.
- Engagement creation gains a buyer-manual source alongside the frozen `RFQClosedWon` path (A-02) —
  new contract `ops.open_offline_engagement.v1` (name illustrative; final name in the Doc-5F pass).
- **Visibility rule addition:** engagements bound to a private party are `organization_id`-private
  (buyer-only), not `shared (parties)`.
- **Link-upgrade rule (Board must fix):** on later vendor linking, the engagement's party reference
  does / does not migrate to the `vendor_profile_id`. (Migration mutates a frozen chain; no
  migration preserves Invariant #11's "even after vendor linking" posture. Draft default: **no
  migration**.)
- Document children (`lois`, `purchase_orders`, `challans`, `trade_invoices`, `payment_records`,
  `work_completion_certificates`) inherit the engagement's party + visibility.

### Shape B — parallel buyer-private aggregate (frozen chain untouched)
- New AR **Offline Procurement Record** (`operations.offline_procurement_records` — name
  illustrative): root binds `organization_id` (buyer) + `private_vendor_record_id`; lifecycle
  `open/completed/closed` mirroring engagement semantics; tenant-private, never disclosed.
- Own document children mirroring the engagement set (offline LOI/PO/challan/invoice/payment/WCC
  records), versioned per Invariant #8; templates reuse `document_templates`.
- New contracts: `ops.create_offline_procurement_record.v1`, document create/revise commands, reads.
- Frozen `engagements` and its `RFQClosedWon` path are untouched; "identical experience" is a
  presentation-layer obligation (productSpec).
- Offline records remain buyer-private forever, **even after vendor linking**.

### Shape comparison (decision aid)
| Dimension | A | B |
|---|---|---|
| Frozen surface touched | engagement AR + visibility model + creation path | none (additive rows only) |
| Data-layer unification | yes | no (presentation-layer) |
| Visibility regimes in one AR | two (shared + private) | one (private) |
| Post-link behavior | needs an explicit migration rule | inherently stable |
| Blast radius / review cost | higher | lower |

## Part 3 — Match-basis enum additions (R5 item 4)
`admin.link_suggestions.match_basis`: additive values `bin`, `domain` (email-domain match).
Suggestion generation remains Admin/System-side; non-disclosure unchanged (never vendor-visible).

## Part 4 — Buyer import/export (R5 item 5)
New buyer-side contracts (names illustrative): `ops.import_private_vendors.v1` (async per Doc-4A
§15; row-level validation; `source` value reuse `excel`) and `ops.export_private_vendors.v1`
(tenant-scoped export). Permission: under `can_manage_private_vendors` or a new slug — Board choice;
no delegation.

## Part 5 — Merge vs archive-duplicate (R5 item 6)
- **Option M1 (new contract):** `ops.merge_private_vendors.v1` — private↔private only; target
  absorbs children (notes/ratings) with full audit; source archived with pointer. Distinct from the
  prohibited private↔public merge (link-not-merge stands untouched).
- **Option M2 (zero-patch):** duplicate-prevention UX offers Link / **Archive duplicate** / Cancel;
  archived record carries a pointer note. No corpus change.

## Part 6 — Mushok / VAT (R5 item 7 — cross-reference only)
Already escalated as **`ESC-OPS-DOC-MUSHOK`** (`esc_registry.md`; channel:
`BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md` item 2a). This proposal adds **nothing** for Mushok; the
off-platform document set (Part 2) automatically inherits whatever kind/format that ruling adds.
