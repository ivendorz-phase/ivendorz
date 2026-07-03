# Buyer Vendor Directory — Product Specification v1.0

**Status:** DRAFT v1.0 — NON-authoritative product spec; conforms upward to the frozen corpus and to
`governanceReviews/BUYER-VENDOR-DIRECTORY-RECONCILIATION_v1.0.md`. Implementation-gated: every
element carries a governance tag — **FROZEN-BACKED** (buildable subject to FE program/roadmap
gates) or **GATED-ON-R2/R3/R4/R5** (renders only after the corresponding Board ruling in
`governanceReviews/BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md`).
**Date:** 2026-07-03 · **Owner intent source:** owner proposal + 4 owner review rounds (2026-07-03).
**Terminology rule (owner-ruled):** buyer-facing copy uses **"Vendor"** everywhere; "Supplier" is
reserved for external documents, imported ERP terminology, or integrations.

> On any conflict the frozen corpus wins (Flag-and-Halt). This spec coins **no** entity, slug,
> enum, state, or event — presentation labels map to frozen names via §2.

---

## 1. Design thesis

The buyer's Vendor Directory is the single place a procurement team manages **every** vendor they
transact with — marketplace-linked or private — with an experience that feels identical at the
presentation layer while contract-level differences (what a private vendor can participate in)
are shown honestly, never papered over.

## 2. Label → frozen-name mapping (binding for implementers)

| Buyer-facing label | Frozen name (never re-coined) |
|---|---|
| Vendor Directory | presentation surface over BC-OPS-1 (Doc-4F §F4) |
| Vendor record (private) | `operations.private_vendor_records` |
| Add Vendor | `ops.create_private_vendor.v1` (create path) |
| Edit Vendor | `ops.update_private_vendor.v1` |
| Archive | `ops.archive_private_vendor.v1` → lifecycle `archived` |
| Notes | `private_vendor_notes` (`ops.add_private_vendor_note.v1`) |
| My rating | `private_vendor_ratings` (`ops.set_private_vendor_rating.v1`) |
| ⭐ Preferred | `vendor_favorites` (`ops.set/clear_vendor_favorite.v1`) |
| Status (Approved / Conditional / Blacklisted) | `buyer_vendor_statuses` (`ops.set/clear_buyer_vendor_status.v1`) |
| Link to marketplace profile | `ops.confirm_vendor_link.v1` / `ops.dismiss_vendor_link.v1` |
| Marketplace vendor page | `marketplace.vendor_profiles` (M2 public read) |
| Vendor list / detail reads | `ops.list_private_vendors.v1` / `ops.get_private_vendor.v1` / `ops.get_buyer_supplier_relationship.v1` |

Permission for all directory management: `can_manage_private_vendors` (O,D,M,F; no delegation).

## 3. Definitions (owner-ruled, verbatim)

- **Marketplace Vendor** — *a vendor linked to an iVendorz marketplace profile, regardless of
  verification status.* (Named for **source, not trust level**.)
- **Private Vendor** — *a vendor record visible only within the owning buyer organization and not
  linked to a marketplace profile.*
- **Preferred Vendor** — *buyer-specific favorite vendor; can be a Marketplace Vendor or a Private
  Vendor; private to the buyer organization and NOT a platform-wide ranking or recommendation.*

Derived "type" logic (no new enum): Marketplace = `link_status = linked`; Private =
`link_status ∈ {none, suggested}`; verification badge from the linked profile's claim state.

## 4. Information architecture (owner-ruled)

```
Vendor Directory
├── All Vendors            ← default view
├── Marketplace Vendors
├── Private Vendors
├── ⭐ Preferred Vendors
├── Pending Invitation     [GATED-ON-R4 — section absent until approved]
└── Archived
```

- **All Vendors** [FROZEN-BACKED]: every vendor regardless of origin. Per-row **origin badges**
  (`Marketplace` / `Private`); trust badge `✓ Verified` only when the linked profile's claim state
  is `verified`. Default sort: **⭐ Preferred → Recently Used → Marketplace → Private**.
  "Recently Used" derives from the buyer's own activity (latest engagement/status/note timestamps —
  buyer-side data only). Finer statuses (**Verified · Claimed · Blacklisted · Archived**) are
  **table filter chips, never navigation items**; the Blacklisted chip renders buyer-side only
  (buyer-private data; Invariant #11 is a vendor-facing rule and is unaffected).
- **Marketplace Vendors** [FROZEN-BACKED]: no "(iVendorz)" suffix (context implicit; badges carry
  origin).
- **Private Vendors** [FROZEN-BACKED].
- **⭐ Preferred Vendors** [FROZEN-BACKED]: presentation view over `vendor_favorites`.
- **Pending Invitation** [GATED-ON-R4]: derived from invite-intake + claim-record state.
- **Archived** [FROZEN-BACKED]: lifecycle `archived`; contains **both origins** (owner ruling —
  procurement teams archive regardless of source). UI "Inactive" == `archived`; there is no third
  state.

**Relationship to shipped FE-BUY-09 (P-BUY-26/27, route `/crm`):** this spec re-homes/relabels that
surface under "Vendor Directory". That change is registered as an FE-change item for the FE program
board (see reconciliation §3.11) — the shipped milestone is not silently respecified.

## 5. Add Vendor workflow

1. **[Add Vendor]** button (permission-gated). [FROZEN-BACKED]
2. **Unified search** (owner-ruled): one query, searching **marketplace vendors AND the buyer's own
   private vendors simultaneously**, results labeled by origin badge. [FROZEN-BACKED — composition
   of M2 public search + `list_private_vendors`]
3. Result actions:
   - Marketplace hit → **[Add to My Vendor List]** — creates the buyer-supplier relationship
     surface (favorite and/or status write; container auto-created on first write per Doc-4F
     §F4.5). [FROZEN-BACKED]
   - Own-private hit → open the existing record (duplicate creation prevented). [FROZEN-BACKED]
   - No hit → **[Create Private Vendor]** → §6 form. [FROZEN-BACKED]
4. **Duplicate prevention** (owner-ruled): on name/email/phone/BIN similarity with an existing
   entry, a resolution prompt offers:
   - **Link** (to a marketplace profile — `ops.confirm_vendor_link.v1`) [FROZEN-BACKED]
   - **Merge** (private↔private) [GATED-ON-R5 item 6 — until ruled, the prompt shows **Archive
     duplicate** instead]
   - **Cancel** [FROZEN-BACKED]

## 6. Vendor form — field spec

| Field | Req | Governance tag |
|---|---|---|
| Company Name | ✔ | FROZEN-BACKED (`name`) |
| Contact Person | ✔ | GATED-ON-R5.1 (first-class) — until ruled: `details_jsonb` |
| Designation | ✔ | GATED-ON-R5.1 — interim `details_jsonb` |
| Mobile Number | ✔ | FROZEN-BACKED (`phone`) |
| Email Address | ✔ | FROZEN-BACKED (`email`) |
| Core Business Area (multi-select, taxonomy) | ✔ | GATED-ON-R5.2 |
| Alternate Contact / Office Phone / Website / Address / City / Country | — | GATED-ON-R5.1 — interim `details_jsonb` |
| BIN / Trade License No. / VAT Registration | — | GATED-ON-R5.1 — interim `details_jsonb` (also feeds R5.4 match bases) |
| Company Logo | — | GATED-ON-R5.3 |
| Notes | — | FROZEN-BACKED (`private_vendor_notes`) |
| Preferred (⭐) | — | FROZEN-BACKED (`vendor_favorites`) |
| Active / Archived | — | FROZEN-BACKED (lifecycle) |

Required-field validation is presentation-side where the frozen contract is looser; the frozen
request schema is never narrowed.

## 7. Vendor detail

- Header: name, origin + verification badges, ⭐, status chip (Approved/Conditional/Blacklisted —
  buyer-side only), lifecycle. [FROZEN-BACKED]
- Tabs: Profile (fields §6) · Notes · My Rating · Status history (append-only — history is never
  overwritten) · Documents/History [GATED-ON-R3] · Invite [GATED-ON-R4].
- **Link panel:** when a link suggestion exists (`link_status = suggested`), show "This vendor may
  have joined iVendorz — review & link" with buyer-approve/dismiss (nothing auto-links; suggestion
  provenance is never exposed to the vendor). After linking: badge flips to Marketplace; private
  data (notes/ratings/status/history) remains buyer-private forever. [FROZEN-BACKED]

## 8. Off-platform procurement recording [GATED-ON-R3, entire section]

Once R3 rules a shape: from a Private Vendor detail, buyers can **record** off-platform procurement
(PO / LOI / challan / invoice / payment record / WCC; Mushok pending `ESC-OPS-DOC-MUSHOK`) as buyer-private
documents. Copy must say "record" (the platform never handles the money — recording only). The
RFQ/quotation moat remains marketplace-only: the UI never offers "send RFQ" to an unlinked private
vendor; it offers **"Record off-platform purchase"** instead, plus a hint to invite the vendor
(GATED-ON-R4) for the full experience. This is the honest presentation of the "identical
experience" goal: identical *directory* experience; participation differences stated in-line.

## 9. Invite to iVendorz [GATED-ON-R4, entire section]

From a Private Vendor detail: **[Invite to iVendorz]** → confirmation with the benefits copy →
intake → admin triage → dispatch → vendor claims → link suggestion → buyer approves link (§7).
"Pending Invitation" nav section lists in-flight invites. Disclosure default (does the vendor see
who invited them) follows the Board's Q-3 ruling.

## 10. Suggest to iVendorz [GATED-ON-R2-b — only if the Board picks the consent-based path]

Per-record, explicit buyer action ("Suggest this vendor to iVendorz"); no aggregate counts are ever
shown to any buyer; no discovery surface exists buyer-side. (If R2-c is ruled instead, a separate
spec revision follows the ratified rank-0 patch; if R2-a, this section is deleted.)

## 11. Non-disclosure & privacy obligations (binding on every element above)

- Nothing in the Directory is ever visible to vendors or other buyers; blacklist remains
  byte-equivalent-undetectable vendor-side.
- No element may display cross-buyer aggregates, reference counts, or "others use this vendor"
  signals (Invariant #6/§6.4) — absent an R2-c ratified patch.
- Status changes emit no events (R5 — frozen); UI must not promise notifications on status change.
- Exports (GATED-ON-R5.5) are tenant-scoped and audited.

## 12. Open items ledger

| Item | Waits on |
|---|---|
| Merge contract vs archive-duplicate | R5.6 |
| First-class columns vs `details_jsonb` set | R5.1 |
| Category multi-select on private records | R5.2 |
| Logo | R5.3 |
| BIN/domain match bases (better link suggestions) | R5.4 |
| Import/export | R5.5 |
| Mushok kind | `ESC-OPS-DOC-MUSHOK` (document-management packet item 2a) |
| Off-platform recording shape | R3 |
| Invite flow + Pending Invitation + disclosure default | R4 |
| Discovery path | R2 |
| FE-BUY-09 `/crm` relabel/re-home | FE program board |
