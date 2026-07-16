# Board Packet — Verification Evidence Snapshot & Transient Upload Lifecycle v1.0

**Status:** **PROPOSED — AWAITS HUMAN BOARD RULING.** This packet presents eight decision items
(R1–R8) over an indivisible six-file additive patch set. Per §13 (Raise ≠ Accept) the authors raise and
conclude; **ratification is the Board's act** — nothing below is authoritative until a human folds it.
Per CLAUDE.md §8, these are architecture-affecting artifacts: **human approval is required**; Supervisor
sign-off does not substitute.

| Field | Value |
|---|---|
| Owner intent source | Owner rulings 2026-07-17 (three rounds, recorded verbatim in §2) |
| Patch set (folds as ONE) | `ADR-026_Transient_Upload_Lifecycle_PROPOSAL.md` · `Doc-2_EvidenceArtifacts_Additive_Patch_PROPOSAL.md` · `Doc-4B_UploadGrant_Additive_Patch_PROPOSAL.md` · `Doc-4G_EvidenceSnapshot_Additive_Patch_PROPOSAL.md` · `Doc-4F_VendorImport_Additive_Patch_PROPOSAL.md` · `Doc-3_Policy_Key_Registration_Patch_v1.13_EvidenceHandling_PROPOSAL.md` |
| Companion (non-authoritative) | `docs/product/requirements/verification_evidence_snapshot_planning_and_design.md` (implementation blueprint; R7) |
| Registry actions at fold | `esc_registry.md`: `ESC-TRUST-EVIDENCE` → RESOLVED · `ESC-7-API/upload` → RESOLVED (R4) · `ESC-VENDIR-FIELDS` row annotation (R8; R5.5 itself stays OPEN). **Authority Map + registry flip in the same fold commit.** |
| Fold protocol | Human appends/folds all six + the Master one-line annotation (if R1-A) + Authority Map rows + registry flips — one commit. Partial folds are invalid; any failed ruling returns the whole set. |

---

## §1 — What is being decided (one paragraph)

M5 verification documents (trade license, TIN, BIN, …) will be accepted as **Transient Uploads**:
processed (SHA-256 fingerprint → implementation-neutral Evidence Snapshot → optional OCR/AI extraction
as a suggestion), user-confirmed into structured data, and then the **original file is permanently
deleted** with a mandatory audit event. The processing pipeline is defined as a **reusable platform
pattern**; its second founding consumer is the M4 Vendor Directory single-document import (form
pre-fill only — no snapshot, no fingerprint, purge after save). The frozen corpus forbids the deletion
step as written (Invariant #8 · ADR-010 · ADR-012 · ADR-013), which is why this is a Board packet and
not code.

## §2 — Owner rulings recorded (the packet's mandate)

1. **2026-07-17 round 1:** delete via additive patch; originals = transient processing inputs; mandatory
   deletion audit event. Deliverable = Board packet + implementation-ready blueprint; **NO code this
   iteration**; implementation executes when M5 trust work is scheduled.
2. **2026-07-17 round 2 (implementation neutrality):** governance defines the Evidence Snapshot ONLY as
   *"a lightweight, read-only verification reference generated from the uploaded document"*; no rendering
   format at governance level; plus the rule *"Evidence Snapshots are verification references only. They
   must never be treated as the original uploaded document, used for OCR re-processing, or considered a
   legal replacement for the original source document."*
3. **2026-07-17 round 3 (reusability):** the pipeline is reusable by other modules; M4 Vendor Directory
   uses Transient Upload + OCR extraction to pre-fill the Add Vendor form, stops there, deletes the
   original after the user confirms and saves; **no Evidence Snapshot for Vendor Directory imports** —
   snapshots remain exclusive to M5 unless another module opts in through governance.

## §3 — Decision items

**R1 (central) — ADR-026 lifecycle concepts + rank-0 scope ruling.** Ratify the two coined concepts
(Transient Upload / Business Record with required+optional composition) and the fail-safe default
(undeclared upload surfaces stay under existing document law). The permanent-deletion allowlist speaks
at **two ranks** (Master L1304; ADR-012 Compendium L589) — the Board must choose the fold shape stated
in ADR-026's Flag-and-Halt: **(A) scoping ruling** (Invariant #8's "authoritative" never covered
transient processing inputs once the Business Record exists; one-line additive Master annotation at
fold — *authors' conclusion: consistent under this reading*) or **(B) enumerated rank-0 exception**.

**R2 — M5 Evidence Snapshot policy.** Ratify M5's founding declaration (Doc-4G patch): verification
evidence = Transient Upload; Business Record requires BOTH optional components (Evidence Snapshot +
SHA-256 fingerprint); the implementation-neutral definition and the verification-reference-only rule
carried verbatim; extraction explicitly OPTIONAL (manual completion is first-class).

**R3 — The patch set folds as one.** Approve the six files as a single indivisible fold (cross-file
name/key/token consistency verified — §5).

**R4 — Resolve `ESC-7-API/upload` via the Doc-4B leg.** The registry row's own remediation column
("Additive Doc-5x/Doc-4B patch (Board)") is exercised: one generic purpose-bound upload-grant contract
(`core.issue_upload_grant.v1`), founding purposes `trust_verification_evidence` +
`vendor_directory_import`, no new M0 table, no persisted URL/path.

**R5 — Zero-event posture.** Affirm the evidence/import lifecycle emits **audit records only** — no §8
outbox events (no cross-module consumer exists; consistent with Doc-4G H.7 and BC-OPS-1 H.7 precedents;
a status/evidence change must never be vendor-detectable).

**R6 — Legal-retention risk acceptance (explicit owner sign-off).** Deleting statutory originals may
conflict with retention law in some jurisdictions. Mitigations: faithful Evidence Snapshot + SHA-256
integrity proof + immutable audit chain (M5); the buyer retains their own original outside the platform
(M4 import). The Board accepts or returns this residual risk — *the authors raise it; they do not
accept it.*

**R7 — Blueprint acknowledgment.** The companion blueprint is non-authoritative planning,
implementation-gated on M5 wave scheduling + `wave/3-trust` branch reconciliation (M5 backend exists
only on that unpushed branch; the blueprint is corpus-anchored and branch-agnostic).

**R8 — Reusable pipeline + M4 second member.** Ratify: the pipeline as a platform pattern with
per-module policy declarations; M4 Vendor Directory single-document import as founding member #2
(Doc-4F patch: no snapshot, no fingerprint, delete-after-save, `source=manual` unchanged, import
metadata via `details_jsonb`); the `vendor_directory_import` purpose-registry entry; the Evidence
Snapshot exclusivity rule; and the **explicit distinction from R5.5** (bulk import/export stays gated;
its registry row is annotated, never flipped).

## §4 — Frozen anchors (verified 2026-07-17, this session — no rubber-stamping)

| Anchor | Where found (verbatim location) |
|---|---|
| `evidence_document_refs[]` | Doc-2 v1.0.2 L795 (§10.6) · Doc-4G PassB L33/L53 ("document IDs; Platform Core storage refs") · Doc-6G Pass1 L40/L53 ("bare-UUID array → storage/M2 (no FK); NO SD") |
| "Pass-B introduces no column" | Doc-4F PassB L35 (H.10) · Doc-4E/4G PassB H-blocks — stays literally true (the Doc-2 patch adds a table, no column) |
| "evidence document expired" | Doc-4G PassB L282 (§G4.5 BUSINESS rule: "`expires_at` elapsed or evidence document expired") — made machine-checkable by the promoted `document_expires_at` column |
| `[ESC-TRUST-AUDIT]` / `[ESC-TRUST-POLICY]` / `[ESC-TRUST-SLUG]` | Doc-4G PassB L131/L93/L236 et al. — channels carried, never freeze gates |
| ADR-012 deletion list | Compendium L589 + Master L1304, verbatim "Temporary uploads, unused draft files, expired system cache" — the two-rank speaking clause (R1) |
| ADR-010 Company Documents | Compendium L507: "trade license, ISO certificate, factory audit reports" |
| ADR-013 | Compendium L601 "Data Ownership & Privacy Policy" |
| Invariant #8 | Master L282 "Nothing authoritative is overwritten or hard-deleted" |
| `file_ref`-only storage discipline | Doc-7C frozen row (Authority Map L159: "blob via M0/Doc-4B Storage (`file_ref` only)") · Doc-6A R-set R5–R12 "out-of-DB boundary" |
| `ESC-7-API/upload` | esc_registry L31 — remediation "Additive Doc-5x/Doc-4B patch (Board)" (the R4 path) |
| Slugs | `can_submit_verification` (Doc-4G PassB) · `staff_can_verify` (Doc-4G PassB L236) · `can_manage_private_vendors` (Doc-4F PassB) — all existing; none coined |
| `source enum<manual\|email_list\|excel>` + `details_jsonb` "shape = dev-doc scope" | Doc-4F PassB L36/L59 |
| Version headroom | Doc-3 chain ends at v1.12 (Authority Map) → v1.13 free · ADR numbering ends at 025, no ADR-026 file exists · Doc-4G has no realization patch (this set adds its first) |
| Coinage-collision sweep | ZERO corpus hits for: `evidence_artifacts`, `evidence_kind`, `issue_upload_grant`, `issue_evidence_view_grant`, `submit_verification_evidence`, `confirm_evidence_extraction`, `verification_evidence_*`, `vendor_directory_import`, `trust_verification_evidence`, "Transient Upload", all 9 POLICY keys, `vendor_import_original_purged` |
| Enum disjointness | `evidence_kind` values disjoint from frozen `verification_type enum<contact\|business\|factory\|organization\|tier\|capacity>` (Doc-4G PassB L33) |

## §5 — Red-Flag checklist sweep (attested)

| Red flag | Sweep result |
|---|---|
| New module | NO — M0/M5/M4 each act inside their own boundary |
| Module ownership change | NO — M0 owns the grant seam; each module owns its confirm/Business Record |
| Governance-signal change | NO — no score/tier/signal read or written anywhere in the set |
| Users-Act/Orgs-Own change | NO — org-scoped grants; server-resolved org; Inv #5 restated in Doc-4B §1 |
| Cross-module DB access / FKs | NO — `evidence_document_refs[]` stays a bare-UUID array; no FK in either direction |
| Non-contracts import | NO — modules reach storage/extraction only via M0-owned ports (blueprint) |
| Workflow owning state / read-model as truth / M9 owning data | NO — extraction is a suggestion (Inv #12); the Business Record is module-owned; Snapshot ≠ source of truth (confirmed data + decisions are) |
| Admin bypass of an owning module | NO — staff review reads ride M5's own contracts with `staff_can_verify` |
| ADR override | NO override — ADR-012 amended **additively**; the rank-0 tension is **flagged for the Board (R1)**, not resolved locally |
| FROZEN document modified | NO — every change is an additive patch proposal folded by a human |

## §6 — Out of scope (this packet changes nothing about)

Any code, migration, dependency, bucket, or env change (owner round 1); `00_AUTHORITY_MAP.md` edits
before fold; flipping any registry row before fold; bulk import/export (R5.5), off-platform recording
(R3-VENDIR), invites (R4-VENDIR), discovery (R2-VENDIR); Company Documents (ADR-010) surfaces; Mushok
(`ESC-OPS-DOC-MUSHOK`).

---

*Board packet v1.0 — eight rulings over one indivisible six-file additive set realizing the owner's
2026-07-17 evidence-handling directives. Raised and concluded by the authors; awaiting the Board's
ratification. Nothing herein is authoritative until human fold.*
