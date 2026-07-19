# Vendor Business Docs — Requirements Spec v1.1 (Owner Directive + Round-2 Amendments)

**Status:** SAVED FOR IMPLEMENTATION — **NOT SCHEDULED, PARTIALLY GATED.** Non-authoritative
(mirrors the frozen corpus; on any conflict the frozen doc wins — CLAUDE.md §7/§11).
**Source:** Owner directive, 2026-07-17 (round 1); owner amendments, 2026-07-17 (round 2, §Amendments).
**Module scope:** M4 Business Operations (`operations` schema, Doc-4F) — single-module ✓.
**Surface:** extends the existing FE-DOC track at `/sell/documents` ("Business Docs" nav
section already exists in the vendor workspace).

---

## Conformance Map (Review-A, re-verified 2026-07-17)

> **Evidence-integrity note (v1.0 → v1.1).** v1.0's map was grepped against
> `Doc-4_SERIES_FROZEN_v1.0.md` — which is a **100-line manifest, not corpus content**. That
> evidence was worthless and two v1.0 rows were wrong (the ADR-026 "second member" claim and the
> "PDFs never stored ✅" row). Re-verified below against the actual PassA/PassB content files.
> Cited line numbers are from `generatedDocs/Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md`
> and the `Doc-4F_PassB_Part*_FROZEN.md` files.

Frozen post-award set = `loi | po | challan | wcc` + `trade_invoices` + `payment_records`;
M4 template-format enum = the fixed five `challan | bill | letterhead | quotation | wcc`
(Doc-4F §F5/§F7; Doc-2 §10.5).

### ✅ Conformant — implementable when scheduled

| Spec element | Frozen basis (verified) |
|---|---|
| Business Docs workspace under vendor ops | M4 owns post-award docs (Doc-4F); `/sell/documents` hub already built (FE-DOC track) |
| Purchase Orders — direct create, structured data | Frozen versioned document `purchase_orders`; contract `ops.issue_engagement_document.v1` (Doc-4F Part2 §F5) |
| Delivery Challans from PO, DB-autofilled | Frozen versioned document `challans`; contract `ops.record_delivery.v1`; emits `DeliveryRecorded` (a Trust **performance input** — emit, never score) |
| Bill Generation / invoices | Frozen aggregate `trade_invoices` — **≠ `billing.platform_invoices` (DF-6) and holds no funds** |
| **Database is the authoritative business record** | Frozen: `content_jsonb` on versioned docs; Invariant #8 |
| References upstream/downstream without duplicating data | Frozen: reference-by-UUID; `template_version_id` in-module ref; BC-OPS-2 owns no RFQ/quotation/award (DF-3) |
| Version history · audit log · activity timeline · internal notes | Frozen versioned-document semantics; audited writes follow the canonical D7 pattern — **never coin audit actions** (`[ESC-OPS-AUDIT]` carries) |
| Dashboard KPIs & quick actions | Workspace-private surface (public zero-stats rule does not apply); fixtures carry shape, not claims |

### 🛑 Flag-and-Halt — conflicts with rank-0 frozen text (CLAUDE.md §11: cite both, escalate, never resolve locally)

**The spec's "Generated PDFs are transient artifacts — do not save generated PDFs in storage"
contradicts the frozen corpus.** Both sources cannot be true as written:

- **Doc-2 L170** — `Generated Document | generated_documents (AR) | — (versions are rows) | StorageRef`
- **Doc-2 L333** — `generated_documents | Outputs of the template engine (storage refs) | tenant-owned (sharable to counterparty by grant) | versioned`
- **Doc-2 L787** — `operations.generated_documents … NO (versioned) … human_ref DOC-…, doc_kind, version_no, storage_ref, generated_by, generation_job_id` (the `NO` column = **not hard-deletable**)
- **Doc-4F Part4 (BC-OPS-4) §Frozen scope** — owns the Generated Document aggregate; async generation job dedups on `generation_job_id`; `ASYNC_PENDING` signals in-progress; generated documents **hold storage refs** and are shared **only** by grant/revoke; `template_versions` are **immutable**; generated documents **record the `template_version` used**
- **Doc-2 L781** — the versioned documents themselves (`lois`/`purchase_orders`/`challans`/`work_completion_certificates`) each carry a **`storage_ref`**

So generated documents are, in frozen law, **stored, versioned, and never hard-deleted** — the
opposite of "transient, never stored". Note the frozen model **already delivers Amendment #3's
goal** (render from an immutable `template_version`, addressed by `version_no`) and delivers it
*by storing* the output. Escalate; do not implement "never store" and do not implement "always
store" — await the ruling.

**Unaffected by the conflict:** "the database is the authoritative business record" is frozen-true
independently. Only the *no-stored-artifact* rule conflicts.

### ⛔ GATED — do not implement until the named gate resolves

| Spec element | Gate | Channel |
|---|---|---|
| **PO Import: upload → extract → confirm → apply Transient Upload Lifecycle** | **ADR-026 — PROPOSED, awaits human Board.** The rank-0/rank-1 permanent-deletion allowlist is only "temporary uploads, unused draft files, expired system cache". **v1.0 CORRECTION:** `Doc-4F_VendorImport_Additive_Patch_PROPOSAL.md` covers **Vendor Directory** import (business card/letterhead/brochure → `private_vendor_records`) — **not** PO import. PO import is a **third consumer** of the reusable Stream-2 pipeline and has **nothing modeled**: it needs its own M4 module-policy declaration, its own `core.issue_upload_grant.v1` **purpose** (Doc-4B patch registry), its own deletion audit token (`[ESC-OPS-AUDIT]`-bound), and its own POLICY keys (Doc-3 v1.13 namespace). | ADR-026 fold **plus** a follow-on M4 patch — Board |
| **Mushok Challans** | **`ESC-OPS-DOC-MUSHOK` — OPEN.** Zero corpus modeling. Nav entry exists per owner ruling 2026-07-03 as an honest `ImplementationPendingView` stub — no coined slug/category anywhere. | Additive Doc-2 §2/§10.5 + Doc-4F §F5/§F7 patch (Board) |
| **Offers — proactive quotations independent of RFQs** | **Unmodeled — re-verified properly.** "offer" occurs in only 4 Doc-4 files, **all prose** ("if a contract offers them", "offers no marker", "is offered but") — zero business-entity modeling. M3 owns quotations (RFQ-bound, Doc-4E Part4); the only adjacent frozen hook is the M4 template **format** `quotation` (a doc-gen format, not an aggregate). Needs a new aggregate **and** an M3-vs-M4 ownership adjudication — same class as `ESC-OPS-DOC-KINDS`. | Board intake (new ESC; sweep the Authority Map before registering) |
| **Email Document** | M6 owns delivery only (email/SMS/WhatsApp logs). No M4→M6 document-delivery binding exists. | M6 Doc-5H channel (Board) |

### ⚠️ Flagged — state machines bind verbatim; the spec's lists do not

1. **`trade_invoices` conflict.** Frozen machine (Doc-4F Part2 H.5) is exactly
   **`issued → partially_paid → paid | disputed | cancelled`**. The spec's **`Draft`** and
   **`Sent`** are **not frozen states**, and the spec **omits `disputed`**. Do not encode the
   spec's list.
2. **`lois`/`purchase_orders`/`challans`/`wcc` have NO status machine** (Doc-4F Part2 H.5) —
   they are versioned documents: **`version_no`, `is_active_revision`, `revision_reason`,
   `issued_by`, `issued_at`**. Therefore a pre-issue **"Draft workflow" on these documents is
   unmodeled** — `ops.issue_engagement_document.v1` *creates* version 1 (`document_id` MUST NOT
   be supplied); `ops.revise_engagement_document.v1` appends `version_no+1` and **requires**
   `revision_reason`; **prior versions are retained and overwrite → `BUSINESS` error**.
3. **Engagement machine** is exactly `open → in_delivery → completed → closed` — **no `on_hold`,
   `active`, or `disputed` engagement state** ("dispute" is an audit action + `DisputeRecorded`
   event; `disputed` is a *`trade_invoices`* status).
4. **PO approval requires `can_approve_po` *in addition to* `can_create_documents`** (Doc-2 §7) —
   **never collapse the two slugs** (Doc-4F Part2 §12 AI-Agent note).
5. **Lifecycle chain.** The spec's chain (RFQ → Quotation → Offer → PO → Challan → Mushok → Bill)
   omits LOI and inserts two unmodeled kinds. Doc-4M stays authoritative; never render or encode
   the spec's chain until the Offer/Mushok patches land.
6. **Retention rule.** The spec's "retain only where legally required" is **the same question
   ADR-026 poses** — apply the Board's ruling; never resolve locally.

### Program-sequencing note

M4 backend is not in the current wave. FE presentation-only build of the ✅ rows is permitted
under the standing FE parallel-implementation authorization (fixtures, zero API); backend wiring
follows the wave sequence.

---

## Amendments — owner, round 2 (2026-07-17)

These supersede the marked parts of the round-1 directive below, which is retained verbatim as
the record of what was directed.

| # | Amendment | Adjudication |
|---|---|---|
| **1** | **"Delete Uploaded File" → "Apply the platform's Transient Upload Lifecycle policy."** Uploaded files follow the platform lifecycle policy; after successful extraction and confirmation the system applies the configured lifecycle automatically. | **ACCEPTED.** Strictly better: the deletion *trigger* is exactly what ADR-026 asks the Board to rule, so the spec must not pre-empt it. Binding: **ADR-026 (PROPOSED)** coins *Transient Upload*; the timing/configuration lives in **Doc-3 POLICY keys** (v1.13 patch namespace) — **never name a POLICY key in this doc** (ADR-altitude rule, 2026-07-17). Supersedes the round-1 "Delete Uploaded File" node and the "must be permanently deleted after…" sentence. |
| **2** | **"OCR / AI Extraction" → "Document Data Extraction."** Some PDFs carry selectable text; parsing may suffice; don't bind the workflow to a technology. | **ACCEPTED.** Matches ADR-026's own *implementation-neutral* precedent, and stays inside Invariant #12 — extraction yields a **non-authoritative suggestion**; the user-review step decides. Supersedes the round-1 "OCR / AI Data Extraction" node. |
| **3** | **Versioning rule** — issue → version → render **from that version**, so a later edit cannot silently restate an issued document. | **ACCEPTED (intent) — REFINED (wording): this is already frozen law, so point, never coin.** Frozen: `ops.issue_engagement_document.v1` creates **version 1**; `ops.revise_engagement_document.v1` appends **`version_no+1`** with a required `revision_reason`; prior versions retained; **overwrite → `BUSINESS` error**; generated documents **record the `template_version` used** and `template_versions` are **immutable**. ⚠️ **Do not coin "Version Snapshot"** — *Snapshot* is claimed by ADR-026's **Evidence Snapshot**, which is **exclusive to M5**; reusing it in M4 would collide with a coined concept. Use the frozen vocabulary: `version_no` · `is_active_revision` · `revision_reason`. ⚠️ Also see Flagged #2: these documents have **no `Draft`/`Issue` states** — "issue" is a *contract*, not a state transition. |
| **4** | **"Generate PDF" → "Render Document"**, with Preview / Print / Download / Email from one template — keeping Content ≠ Presentation clean. | **ACCEPTED (intent) — REFINED (wording): frozen already names this layer.** BC-OPS-4 = **"Document Generation & Templates"**, with a **template engine**, `generation_job_id`, `ASYNC_PENDING`, and `doc_kind`. Use that vocabulary rather than coining "Render Engine". Invariant #9 backs the separation. 🛑 **But #4's premise — "no stored PDF" — is the rank-0 conflict above.** The vocabulary change is safe; the storage claim is not. |
| **5** | **Add Extraction Status** — `Pending Review` / `Verified` / `Imported`, alongside `Source (Imported / iVendorz)`. | **NOT ACCEPTED AS WRITTEN — Board question (two defects).** (a) **It coins an enum.** Enums live in the owning module's patch, never in a requirements doc. Precedent from the vendor-import patch: the `source` enum is **untouched** (`source` = `manual`) and import metadata rides in **`details_jsonb`** — "**no column is added**". Expect the same shape here; do not assume a new `source` value. (b) **Architecturally load-bearing: `Pending Review` implies persisting a pre-confirmation record**, which the ADR-026 pipeline explicitly does **not** do — "extraction produces a non-authoritative suggestion that pre-fills the form. **The pipeline stops there**"; an unsaved upload is an abandoned/temporary file. **#5 therefore changes #1's deletion trigger** from *after save* to *after review* — the file must survive until a human clears the queue. **#1 and #5 must be ruled together**, not separately. |

### Amended workflow (supersedes the round-1 Import PO workflow)

```text
Upload Document
        │
        ▼
Document Data Extraction        (non-authoritative suggestion — Invariant #12)
        │
        ▼
User Review                     (the user decides; nothing persists yet)
        │
        ▼
Save Structured Data            (the Business Record — the DB is authoritative)
        │
        ▼
Apply Transient Upload Lifecycle Policy    (ADR-026 — timing is the Board's, not the spec's)
```

### Amended render model (supersedes the round-1 PDF Generation Policy)

```text
Database  →  Versioned Record (version_no / is_active_revision)  →  Template engine (BC-OPS-4)
                                                                          │
                                            ┌──────────────┬──────────────┼──────────────┐
                                            ▼              ▼              ▼              ▼
                                         Preview        Print        Download         Email
```

**Rendering addresses a *version*, never "current values"** — an issued document renders as
issued (Amendment #3). 🛑 Whether the rendered output is **stored** (`generated_documents.storage_ref`,
frozen) or **transient** (spec's round-1 rule) is the **open Flag-and-Halt above** — unresolved.

---

## Owner Directive — round 1, verbatim (2026-07-17)

> Retained as the record of what was directed. **Superseded in part by §Amendments** (round 2):
> the "Delete Uploaded File" node (#1), "OCR / AI Data Extraction" (#2), the PDF-from-current-values
> rule (#3), "Generate PDF" wording (#4), and the PDF Generation Policy block (#4 + Flag-and-Halt).

# Business Operations → Business Docs

Implement a new **Business Docs** workspace under **Vendor → Business Operations**. This is an
operational document management system for SMEs and industrial vendors. The database—not
uploaded files or generated PDFs—is the single source of truth.

## Pages

Create the following pages:

1. Business Docs Dashboard
2. Purchase Orders
3. Delivery Challans
4. Mushok Challans
5. Bill Generation (Invoices)
6. Offers
   - Make Offer
   - Saved Offers

Use the existing enterprise design system, data tables, filters, status badges, detail drawers,
audit logs, activity timelines, and responsive forms.

---

# Business Docs Dashboard

Display operational KPIs:

- Total Purchase Orders
- Pending Deliveries
- Pending Bills
- Draft Offers
- This Month's Documents
- Total Document Value

Quick Actions:

- Import PO
- Create PO
- Create Delivery Challan
- Generate Bill
- Create Offer

Recent Activities:

- Recently imported POs
- Recently generated bills
- Recent offers
- Pending actions

---

# Purchase Orders

Support **two creation methods**.

## Method 1 — Create PO

Create a Purchase Order directly inside iVendorz.

Store only structured business data.

Never generate or save a PDF during creation.

---

## Method 2 — Import Existing PO

Most SMEs receive Purchase Orders through email.

Support uploading:

- PDF
- Word
- Image
- Scanned copy

Workflow

```text
Upload PO
        │
        ▼
OCR / AI Data Extraction
        │
        ▼
User Review & Edit
        │
        ▼
Save Structured Data
        │
        ▼
Delete Uploaded File
```

Extract fields such as:

- PO Number
- PO Date
- Buyer
- Buyer Address
- Contact Person
- Project
- Currency
- Delivery Date
- Payment Terms
- PO Items
- Total Amount
- Internal Notes

The uploaded file is temporary and **must be permanently deleted after successful extraction,
user confirmation, and database save.**

Display a warning before saving:

> "The uploaded Purchase Order will be permanently deleted after the information is successfully
> extracted and saved. Please verify all extracted information before confirming."

---

# Purchase Order List

Columns:

- PO Number
- Buyer
- Project
- Date
- Delivery Date
- Amount
- Status
- Source (Imported / iVendorz)
- Actions

Actions:

- View
- Edit
- Generate PDF
- Print
- Duplicate
- Archive

---

# Delivery Challans

Users should be able to create a Delivery Challan from:

- Existing Purchase Order
- Existing Bill
- Existing Offer

When a PO already exists inside iVendorz:

Automatically populate:

- Buyer
- Delivery Address
- Items
- Quantities

No PDF lookup is required.

Everything comes from the database.

---

# Mushok Challans

Allow creation directly from:

- Purchase Order
- Delivery Challan
- Bill

Auto-fill available information from database records.

Store only structured VAT information.

---

# Bill Generation

Generate invoices directly from:

- Purchase Order
- Delivery Challan

Automatically populate:

- Customer
- Products
- Quantity
- Rates
- VAT
- Total

Statuses:

- Draft
- Sent
- Partially Paid
- Paid
- Cancelled

Store only structured invoice data.

---

# Offers

Support proactive quotations independent of RFQs.

Pages:

- Make Offer
- Saved Offers

Fields:

- Offer Number
- Customer
- Subject
- Project
- Offer Items
- Commercial Terms
- Technical Proposal
- Attachments
- Valid Until
- Notes

Statuses:

- Draft
- Sent
- Accepted
- Rejected
- Expired

Allow:

- Duplicate
- Convert to Purchase Order
- Generate PDF
- Print

---

# PDF Generation Policy

The database is always the **single source of truth**.

Never store generated PDFs.

Instead:

```text
Database
      │
      ▼
Predefined Template
      │
      ▼
Generate PDF
      │
      ▼
Download / Print / Email
```

Every document should support:

- Preview
- Print
- Download PDF
- Email PDF

PDFs are generated on demand from the current database values.

If the user edits a document later, the next generated PDF must automatically reflect the
updated data.

---

# Document Storage Policy

The system should follow a **Data over Documents** philosophy.

### Uploaded Documents

Uploaded files are temporary data sources.

After:

1. Successful OCR/AI extraction
2. User verification
3. Successful database save

the uploaded file must be permanently deleted.

The system should never retain uploaded Purchase Orders, Delivery Challans, Bills, or Offers as
permanent files.

### Generated Documents

Generated PDFs are transient artifacts.

Do not save generated PDFs in storage.

Generate them only when requested.

### Database

Store only structured business information required for operational workflows.

The database is the authoritative business record.

---

# Procurement Lifecycle

Maintain references between business documents:

```text
RFQ
   │
Quotation
   │
Offer
   │
Purchase Order
   │
Delivery Challan
   │
Mushok Challan
   │
Bill / Invoice
```

Each document should maintain references to upstream and downstream records without duplicating
business data.

> ⚠️ Conformance note: this chain is the owner's sketch of document adjacency, not a state
> machine. The frozen procurement lifecycle (Doc-4M) remains authoritative — see Flagged item 1.

---

# Shared Features

All Business Docs should support:

- Draft workflow
- Version history
- Audit log
- Activity timeline
- Internal notes
- Attachments (temporary where applicable)
- Search
- Advanced filters
- Duplicate
- Archive
- Print
- Preview
- Generate PDF
- Email PDF

---

# Architecture Rules

- Keep the implementation entirely within the existing **Business Operations** bounded context.
- Do not introduce new modules or ownership boundaries.
- Treat uploaded documents as temporary import sources.
- Treat generated PDFs as transient renderings.
- Use the database as the only persistent source of truth for operational business documents.
- Retain original uploaded files only where legal or regulatory policy explicitly requires
  long-term preservation (e.g., signed contracts or statutory evidence). Ordinary operational
  documents such as emailed Purchase Orders should not be retained after successful extraction
  and validation.
