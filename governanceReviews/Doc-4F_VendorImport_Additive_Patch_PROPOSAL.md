# Doc-4F Additive Patch (PROPOSED) — Vendor Directory Single-Document Import (M4 Module Policy)

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** Doc-4F (M4
Business Operations contracts) is frozen; additive only; human fold; part of the
`BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md` R3 indivisible set (ratified by packet item **R8**).
Deliberately **slim**: module policy lives in the owning module's contract doc (mirroring how M5's
declaration lives in the Doc-4G patch) — this patch declares policy and binds existing frozen surfaces;
it coins **no new M4 wire contract**.

| Field | Value |
|---|---|
| Target document | Doc-4F — version = next at fold per `00_AUTHORITY_MAP.md` |
| Change type | Additive: M4's ADR-026 module-policy declaration + **one** deletion audit token binding. **No BC-OPS-1 contract, column, enum, or state is modified.** |
| Realizes | Owner ruling 2026-07-17 (third round): the Stream-2 pipeline is reusable; M4 Vendor Directory Add-Vendor form-fill is its second consumer |
| Coins | One audit serialization token (pointer-bound, below). Nothing else — purpose/registry = Doc-4B patch; POLICY keys = Doc-3 v1.13 patch (`operations.vendor_import_*`); record creation = **frozen** `ops.create_private_vendor.v1` |
| Slug | Existing only: `can_manage_private_vendors` (BC-OPS-1's own slug; no delegation) |

---

## §1 — M4 module policy declaration (ADR-026)

**Vendor Directory single-document import uploads are Transient Uploads.** A buyer may upload one
document (business card, letterhead, brochure) via `core.issue_upload_grant.v1` with purpose
`vendor_directory_import` (Doc-4B patch). Extraction produces a **non-authoritative suggestion**
(Invariant #12 — AI suggests, modules decide) that pre-fills the Add Vendor form. **The pipeline stops
there.**

- **Business Record** = the confirmed `operations.private_vendor_records` row, created by the **frozen**
  `ops.create_private_vendor.v1` exactly as specified in Doc-4F §F4.1: required components are the
  user-confirmed structured data, the import processing metadata, and the audit history. Import
  processing metadata (source filename, extraction engine/version, imported_at) rides inside
  `details_jsonb` — the frozen "shape = dev-doc scope" field (§F4.1 field table) — no column is added.
- **Optional components: NONE.** No Evidence Snapshot is generated or retained (snapshots are exclusive
  to M5 per ADR-026's exclusivity rule); no SHA-256 fingerprint is kept.
- **`source` enum untouched.** The record's `source` is `manual` — the upload is a form-input aid, not a
  new record source; the user reviews, edits, and confirms every field before anything persists.
- **Purge point:** the original uploaded file is **permanently deleted after the user confirms and saves
  the vendor record**, with the mandatory deletion audit event (§2). An upload whose form is never saved
  is an abandoned/unused file — swept under ADR-012's **existing** "temporary uploads" carve-out.

## §2 — Deletion audit token (the only coinage)

| Token | Attribution | Binding |
|---|---|---|
| `vendor_import_original_purged` | System | **`[ESC-OPS-AUDIT]`** — nearest Doc-2 §9 Buyer-CRM action by pointer (import purge not separately enumerated; channel Doc-2 §9 additive; **no business action invented**) — exactly the Doc-4F PassB §F4.1/§F4.2 audit-binding pattern |

Mandatory on every purge (ADR-026); metadata-only old_value (ADR-009 — no blobs in audit records).
Object scope: the purged intake object's key + the created `private_vendor_records` row id.

## §3 — Boundary statements

- **Distinct from R5.5.** `ESC-VENDIR-FIELDS` item 5 (buyer bulk **import/export** — Excel/spreadsheet
  ingestion) remains **Board-gated and untouched**; its interim ("no import/export affordance") continues
  to govern bulk flows. This patch covers only the **single-document, single-record, user-confirmed
  form pre-fill** — a different capability the owner ruled separately (packet R8). The registry row is
  annotated accordingly (never flipped).
- **No RFQ/engagement reach.** The imported record is an ordinary Private Vendor under BC-OPS-1 law;
  `ESC-VENDIR-OFFPLATFORM` (R3) and all other VENDIR gates are unaffected.
- **Categories stay gated.** R5.2 (category refs on private records) is untouched — the import never
  writes category data in any form.
- **Firewall.** Nothing here reads or writes any governance signal; the extraction suggestion carries no
  score, tier, or trust datum.

## §4 — Non-impact confirmation & self-check

| Check | Result |
|---|---|
| BC-OPS-1 contracts (§F4.1–§F4.9), columns, enums, states | Unchanged — record creation binds the frozen create contract verbatim |
| `source enum<manual\|email_list\|excel>` | Unchanged (`manual`; verified verbatim Doc-4F PassB L36, 2026-07-17) |
| `details_jsonb` carriage for import metadata | Frozen-conformant (§F4.1 "shape = dev-doc scope"; R5 interim ruling) |
| Snapshot exclusivity (ADR-026) | PASS — no snapshot component declared |
| Audit token pointer-bound via `[ESC-OPS-AUDIT]`; no invented business action | PASS (§2) |
| R5.5 / R3 / R5.2 gates | Untouched (§3) |
| Coinage sweep (`vendor_directory_import` purpose, `vendor_import_original_purged`) | PASS — zero corpus hits, 2026-07-17 |

---

*Doc-4F additive patch proposal — M4's slim ADR-026 founding declaration: single-document import as a
Transient Upload feeding the Add Vendor form; Business Record = the frozen `private_vendor_records` row;
no snapshot, no fingerprint; purge-after-save with a mandatory pointer-bound audit token. PROPOSED —
folds only with the ADR-026 set (packet R3/R8).*
