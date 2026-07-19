# ADR-026 (PROPOSED) — Transient Upload Lifecycle & Business Record Composition

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** The ADR Compendium is
rank 1 in the authority order (CLAUDE.md §7) and **immutable to all skills**; per CLAUDE.md §8 an
architecture-affecting artifact requires **human approval** — code review or Supervisor sign-off does not
substitute. No AI action folds this into the corpus — on approval a human appends ADR-026 to
`ADR_Compendium_v1.md` and records it in `00_AUTHORITY_MAP.md` (same fold commit as the linked patch set;
see `BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md` R3). Until then this file lives in `governanceReviews/`
and is **non-authoritative**.

> ⚠️ **This proposal sits adjacent to clauses that speak — it asks the Board to rule on scope, not merely
> to append** (precedent: `Doc-7D_SessionAwareHeader_Additive_Patch_PROPOSAL.md`). The permanent-deletion
> allowlist exists **verbatim at two ranks**: rank-0 `Master_System_Architecture_v1.0_FINAL.md` L1304
> ("**Permanent deletion (only):** temporary uploads, unused draft files, expired system cache.") and
> rank-1 `ADR_Compendium_v1.md` L589 (ADR-012, same list). Deleting a **confirmed** evidence original is
> not inside that list today. See "Flag-and-Halt" below — the tension is stated, never resolved locally
> (CLAUDE.md §11).

| Field | Value |
|---|---|
| Target document | `ADR_Compendium_v1.md` (rank 1, immutable) — **append new ADR-026**; additive amendment to ADR-012's permanent-deletion list; companion rank-0 annotation to Master L1304 (Board-ruled, see Flag-and-Halt) |
| Proposed version | ADR Compendium v1 → v1 + ADR-026 (additive; **no existing ADR clause reworded or removed**) |
| Realizes | Owner directive 2026-07-17 (evidence-snapshot document-handling policy; refined same day: implementation-neutral snapshot definition; reusable pipeline + M4 second member) |
| Coins | Exactly two lifecycle concepts: **Transient Upload** · **Business Record** (+ the implementation-neutral **Evidence Snapshot** definition consumed by module policies). No table, contract, slug, enum value, event, or POLICY key is coined here (those live in the linked Doc-2/Doc-4B/Doc-4G/Doc-4F/Doc-3 patch proposals). |
| Linked patch set | `Doc-2_EvidenceArtifacts_Additive_Patch_PROPOSAL.md` · `Doc-4B_UploadGrant_Additive_Patch_PROPOSAL.md` · `Doc-4G_EvidenceSnapshot_Additive_Patch_PROPOSAL.md` · `Doc-4F_VendorImport_Additive_Patch_PROPOSAL.md` · `Doc-3_Policy_Key_Registration_Patch_v1.13_EvidenceHandling_PROPOSAL.md` — one indivisible fold (packet R3) |
| Authority | CLAUDE.md §5 Inv #8, §7, §8, §11, §13; Master §1.5 Invariant 8 (L282); ADR-010 / ADR-012 / ADR-013 |

---

## Problem (why an ADR, not code)

The owner requires a document-handling policy in which an uploaded verification document (trade license,
TIN, BIN, …) is processed (fingerprint → snapshot → optional extraction), user-confirmed into structured
data, and then the **original file is permanently deleted** with a mandatory deletion audit event. The
frozen corpus forbids that deletion step as written:

- **Invariant 8** (Master L282): "Nothing authoritative is overwritten or hard-deleted."
- **ADR-010** (Compendium L507): "**Company Documents:** trade license, ISO certificate, factory audit
  reports" are controlled, versioned document records — never destroyed.
- **ADR-012** (Compendium L589; Master L1304): permanent deletion is sanctioned **only** for "Temporary
  uploads, unused draft files, expired system cache." A **confirmed** evidence original is none of these —
  that gap is precisely why this ADR exists.
- **ADR-013** (Compendium L601, "Data Ownership & Privacy Policy"): uploaded originals are
  organization-owned.

Per CLAUDE.md §11 this is Flag-and-Halt territory: adoption requires an additive, human-approved patch —
never a local implementation decision.

## The proposed ADR-026 text (folded verbatim on approval)

### ADR-026: Transient Upload Lifecycle & Business Record Composition

**Status:** Proposed (this file); Approved upon human fold.

**Context.** Some platform features accept a file upload whose sole purpose is to be *processed into*
a permanent structured record (e.g., verification evidence, form-fill imports). Retaining the original
binary indefinitely serves no business function, concentrates sensitive data, and enlarges the breach
surface. Existing document law (ADR-010 controlled Company Documents; ADR-012 soft-delete/restore;
ADR-013 ownership) governs uploads that ARE the business record; it does not describe uploads that are
merely *inputs* to one.

**Decision.** Two lifecycle concepts are established:

1. **Transient Upload** — an uploaded file that is a temporary processing artifact, regardless of what
   processing occurs on it (OCR, AI extraction, virus scanning, fingerprinting, snapshot rendering). A
   Transient Upload is **permanently deleted after successful user confirmation** of the derived record,
   and every such deletion **MUST** emit a mandatory deletion audit event (module-owned audit action,
   System or User attribution per the owning module's contract doc). This is explicitly distinct from
   ADR-012's existing "temporary uploads" carve-out: that carve-out covers *abandoned/unused* files;
   **this decision covers *confirmed* originals** — the case the existing list does not reach.

2. **Business Record** — the permanent record derived from a Transient Upload. Its **required**
   components are: the user-confirmed structured data, the processing metadata, and the audit history.
   Its **optional** components — declared per module policy in the owning module's contract document —
   are: an **Evidence Snapshot** and a **SHA-256 fingerprint** of the original. The original uploaded
   file is **never** the authoritative business record. The Business Record itself (row, components,
   history) remains **fully Invariant-#8 governed**: versioned, soft-deleted only, immutably audited.

**Evidence Snapshot (implementation-neutral definition).** *"Evidence Snapshot: a lightweight, read-only
verification reference generated from the uploaded document."* No rendering format is prescribed at the
governance level; rendering technology is an implementation detail. **Rule:** *"Evidence Snapshots are
verification references only. They must never be treated as the original uploaded document, used for OCR
re-processing, or considered a legal replacement for the original source document."*
**Exclusivity:** Evidence Snapshots are exclusive to Trust & Verification (M5) unless another module
explicitly opts in through governance (an additive patch to that module's contract doc).

**Reusable pipeline (platform pattern).** The processing pipeline — purpose-bound upload grant →
transient intake → processing → module-specific confirmation → mandatory purge + deletion audit — is a
reusable platform pattern. Each consuming module declares its own policy (which optional Business-Record
components it requires, its purge timing, its confirmation contract) in its own contract document.
Founding members:

| Module | Declaration | Optional components | Purge point |
|---|---|---|---|
| **M5 Trust & Verification** — verification evidence | Doc-4G additive patch | Evidence Snapshot **required** · SHA-256 fingerprint **required** | policy-delayed after confirmation |
| **M4 Business Operations** — Vendor Directory single-document import (form pre-fill) | Doc-4F additive patch | **None** (no snapshot, no fingerprint) | after the user confirms & saves the vendor record |

**Fail-safe default.** An upload counts as a Transient Upload **only** where the owning module's corpus
document explicitly declares it. Every upload surface without such a declaration (M2 `spec_documents`,
M3 RFQ spec attachments, M4 `generated_documents`, M6 `attachments_refs`, and all others) remains under
existing document law (ADR-010/ADR-012/ADR-013) untouched.

**ADR-012 amendment (additive).** ADR-012's permanent-deletion list gains one entry: *"confirmed
transient uploads (per a module's ratified Transient Upload declaration; mandatory deletion audit
event)."* The existing three entries are unchanged.

**ADR-010 boundary.** A file uploaded *as verification evidence* (or as a form-fill import input) is a
Transient Upload — it is **not** thereby a Company Document. ADR-010's controlled Company Documents
(vendor-managed document library records) are unaffected; the same physical paper may exist in both
worlds as **different platform artifacts** under different law.

**ADR-013 grounding.** The original remains organization-owned until purge; deletion is part of the
declared processing contract, disclosed at upload time, and triggered by the owning organization's own
confirmation. The derived Business Record remains organization-owned (tenant-scoped) thereafter.

**Consequences.** Sensitive originals stop accumulating; what persists is the confirmed structured data
plus the module-declared verification components, all under Invariant #8. Legal-retention exposure of
deleting statutory originals is accepted by explicit owner sign-off with mitigations (faithful snapshot
where declared, SHA-256 integrity proof where declared, immutable audit chain) — packet item R6.

**Operational Cost & Upload Governance (Informative — Non-Normative).** This section records
implementation posture only (owner-recommended addition, 2026-07-17). It binds no module, coins no
name, and sets no value. Concrete POLICY keys and their values are registered in Doc-3; enforcement
behavior lives in the owning module's Doc-4 contract document. Nothing here narrows or widens the
normative lifecycle rules above.

Upload limits exist at three layers, each serving a distinct purpose:

1. **Per-file limits** — purpose-specific maximum file size and MIME/extension allowlists, enforced
   at grant issuance. These protect the platform and its processing pipeline (security screening,
   upload/processing stability); they are not commercial instruments, and they are scoped per
   purpose because legitimate file profiles differ radically between purposes.
2. **Per-container limits** — bounds on attachment count and total bytes per business container
   (e.g., per RFQ). These prevent abuse of durable storage as a free file locker and should be set
   generously enough that no legitimate industrial use ever encounters them.
3. **Per-organization quotas** — total durable storage per organization, managed as a configurable
   subscription entitlement (a numeric entitlement, never a plan-name check). This is the only layer
   a legitimate user should ever feel, and it degrades commercially — advance warning and an upgrade
   path — rather than failing an in-flight business action without notice.

**Retention posture.** Durable documents are never deleted because of storage constraints. Cost is
managed through storage tiering (an infrastructure concern invisible to this ADR), deduplication
(within a single organization only — deduplication must never be observable across tenants), and the
commercial quotas above — never by shortening retention and never by widening the permanent-deletion
list beyond the decision text of this ADR. Future durable-upload declarations (e.g., M2 spec
documents, M3 RFQ attachments) are expected to realize these layers in their own contract and POLICY
patches, inheriting this posture without expanding this ADR's normative scope.

## Flag-and-Halt: the clause tensions (the Board's actual decision)

Stated per CLAUDE.md §11, not resolved here. **The Board must rule:**

1. **Rank-0 reach.** The deletion allowlist speaks at rank 0 (Master L1304) and rank 1 (ADR-012).
   - **(A) Scoping ruling (recommended):** Invariant 8's object is "nothing **authoritative**"; a
     Transient Upload is never authoritative once its Business Record exists — the Master list is read as
     enumerating *system-initiated* deletions and delegating declared-lifecycle deletions to ADR law. At
     fold, the human appends a one-line additive annotation to the Master list pointing at ADR-026.
   - **(B) Enumerated exception:** the Board reads the Master list as exhaustive; ADR-026 is then folded
     as a narrow rank-0 additive exception (human-only patch), recorded with its bounds.
2. **ADR-010 boundary ratification.** Confirm that evidence uploads/import inputs are not Company
   Documents (the boundary above), so ADR-010 is not being excepted at all.
3. **ADR-012 speaking-clause amendment.** Approve the additive list entry verbatim.

If any ruling fails, this proposal and the entire linked patch set are returned, not partially folded.

## Non-impact confirmation

| Aspect | Effect |
|---|---|
| Existing ADR-001…ADR-025 text | Unchanged (ADR-012 list gains one additive entry; nothing reworded/removed) |
| Invariant #8 for Business Records | Unchanged — rows/components remain versioned, soft-delete-only, immutably audited |
| Module boundaries / ownership (Golden Rule #2) | Unchanged — each member declares in its own contract doc; no new module |
| Governance signals (Inv #6) / M9 (Inv #12) | Untouched — extraction output is a non-authoritative suggestion; modules decide |
| Non-declared upload surfaces | Unchanged — fail-safe default keeps them under existing law |
| Events | None — the lifecycle emits audit records only (packet R5) |

## Conformance self-check

| Check | Result |
|---|---|
| Additive only; no frozen text edited in place | PASS — new ADR + one additive list entry, folded by a human |
| Coins only the two lifecycle concepts | PASS — all realization names live in the linked patches |
| Speaking clauses flagged for Board scope-ruling, not resolved locally (CLAUDE.md §11) | PASS — Flag-and-Halt above |
| Fail-safe default protects all undeclared surfaces | PASS |
| Mandatory deletion audit event on every purge | PASS — stated in the decision text |
| Evidence Snapshot implementation-neutral + reference-only rule + M5 exclusivity | PASS — verbatim owner wording |
| Cost/limits section is informative-only — binds nothing, coins nothing, sets no value | PASS — posture only; keys/values live in the Doc-3/Doc-4 patches |

---

*ADR-026 proposal — Transient Upload / Business Record lifecycle, reusable processing pipeline, M5+M4
founding declarations, ADR-012 additive amendment, informative cost & upload-governance posture,
rank-0 scope ruling requested. PROPOSED — awaits human approval; folds only with the linked patch set
(packet R3).*
