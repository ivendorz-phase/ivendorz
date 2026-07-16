# Verification Evidence Snapshot — Planning & Design (Implementation Blueprint) v1.0

**Status:** DRAFT v1.0 — **NON-authoritative implementation blueprint**; conforms upward to the frozen
corpus and to the PROPOSED patch set in `governanceReviews/BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md`.
**Nothing here executes until:** Gate 0 (Board ratifies R1–R8 + human folds the patch set), Gate 1
(ops provisions service-role key + buckets), Gate 2 (M5 wave scheduling + `wave/3-trust` branch
reconciliation). Acknowledged as planning-only by packet item **R7**. Owner rulings source: 2026-07-17
(three rounds; recorded in the packet §2). Corpus-anchored and branch-agnostic.

> Rendering formats, page counts, pixel bounds, library choices, and bucket/key shapes in this document
> are **implementation details** — deliberately absent from the governance patches per the owner's
> implementation-neutrality ruling. Changing them later requires no governance change.

---

## 1. What gets built (one paragraph)

A reusable document-processing pipeline: a client obtains a purpose-bound upload grant
(`core.issue_upload_grant.v1`), PUTs the file to transient intake storage, and the owning module
processes it — for **M5 verification evidence**: SHA-256 fingerprint → Evidence Snapshot render →
optional extraction suggestion → user confirms → structured data + snapshot + fingerprint persist as the
Business Record (`trust.evidence_artifacts`) → the original is purged with a mandatory audit event; for
**M4 vendor import**: extraction suggestion pre-fills the Add Vendor form → user confirms & saves
(frozen `ops.create_private_vendor.v1`) → the original is purged (no snapshot, no fingerprint).

## 2. Storage architecture

- **Two private Supabase buckets:**
  - `evidence-intake` — originals; transient; **no read grants are ever issued against it**; TTL-swept;
    objects purged on confirm (M5: policy-delayed; M4: after save).
  - `evidence-snapshots` — long-lived snapshot artifacts (M5 only); read via short-lived signed URLs
    from `trust.issue_evidence_view_grant.v1`; never public.
- **Org-scoped keys** (illustrative shapes — implementation detail):
  `org/{org_id}/{artifact_id}/original` (intake) · `org/{org_id}/{artifact_id}/p{page}.webp` (snapshots).
- **Service-role key: server-side only.** Raw client at `src/server/storage/service-client.ts`. The
  ONLY consumer is the **M0-owned narrow port**
  `src/modules/core/infrastructure/storage/object-storage.service.ts`
  (`createSignedUploadUrl` / `createSignedReadUrl` / `headObject` / `downloadStream` / `deleteObject`).
  **M5/M4 never import the Supabase SDK** — they consume the port via `@/modules/core/contracts`-level
  seams, preserving One-Module-One-Owner. DB rows store `file_ref`/object keys only — never URLs/paths
  with credentials (Doc-7C discipline; Doc-6A out-of-DB boundary).

## 3. Upload flow

1. `core.issue_upload_grant.v1` (Doc-4B patch): validates purpose + POLICY bounds
   (`core.upload_grant_ttl` [15m], `core.upload_max_open_grants_per_org` [10], per-purpose
   mime/size keys), mints `artifact_id` (UUIDv7 via `src/shared/ids`), returns
   `{ artifactId, uploadUrl, expiresAt, objectKey }`. The URL is never persisted.
2. Client PUTs the file to `evidence-intake` using the signed URL.
3. The consuming module binds the object:
   - M5: `trust.submit_verification_evidence.v1` → creates the `evidence_artifacts` row (`received`),
     kicks the pipeline.
   - M4: the import session hands the object to extraction and returns the suggestion to the form
     (see §7 — no Business-Record row exists until the user saves the vendor).
4. **Orphans** (grant issued, never bound / form never saved) are abandoned/unused files → swept under
   ADR-012's existing "temporary uploads" carve-out (legal today, no ADR-026 dependency).

## 4. Data model (realization of the Doc-2 patch)

Prisma model `EvidenceArtifact` → `trust.evidence_artifacts` (all columns per the Doc-2 patch §2 —
transcribe at build, don't redesign): identity/subject (`org_id`, `subject_id`+`subject_type` mirroring
the frozen verification subjects, `uploaded_by`), `evidence_kind` enum, `sha256_fingerprint`
(non-unique index), `original_*` metadata (`original_object_key` kept forever — **dangling after purge
by design**), `snapshot_ref` + `snapshot_metadata_jsonb` (render facts live in the jsonb: page count,
bytes — never as columns), `extraction_suggestion_jsonb` + engine/version/completed_at/confidence (all
nullable — the degraded/manual path), `confirmed_data_jsonb` + promoted `document_number` /
`document_expires_at` (makes Doc-4G §G4.5 "evidence document expired" machine-checkable), `state`
(§5 machine below), `confirmed_by/at`, `purged_at`, `revision`, full audit + soft-delete columns.
RLS: org-scoped `FOR ALL` policy + an explicit platform-staff **read** leg for review
(`staff_can_verify`) — realized at migration era following the Doc-6G conventions.

**State machine** (Doc-2 patch §4): `received → processing → review_pending → confirmed →
original_purged`; `processing → failed` (terminal — integrity/render failure only; re-upload = new
artifact); `received|processing|review_pending → abandoned` (TTL sweep). Extraction failure is
**non-terminal** — proceed to `review_pending` with an empty suggestion.

## 5. Pipeline (Inngest)

- **`process-evidence-artifact`** (realizes `trust.process_evidence_artifact.v1`, System attribution;
  per-step memoization = idempotency):
  1. hash — SHA-256 via `node:crypto` streaming (no dependency);
  2. snapshot render — see §6 config;
  3. extract — optional, Phase 2 (§7);
  4. finalize — `review_pending` + `verification_evidence_processed` audit.
  Hash/snapshot failure → terminal `failed`; extraction failure → continue with empty suggestion.
- **confirm** — `trust.confirm_evidence_extraction.v1`, full D7 chain: `withActiveOrgContext` →
  repository write → `core.append_audit_record.v1` in the **same transaction**; `expected_revision`
  guards races.
- **`purge-evidence-original`** (realizes `trust.purge_evidence_original.v1`): waits
  `trust.evidence_purge_delay` [24h] after confirm → `deleteObject` on intake → verify gone
  (`headObject` 404) → ONE tx: state `original_purged` + `purged_at` + **mandatory**
  `verification_evidence_original_purged` audit (metadata-only old_value — ADR-009, no blobs). If the
  audit tx fails after deletion, the sweep re-detects the inconsistency and re-writes the state+audit
  pair (the deletion itself is idempotent).
- **`sweep-abandoned-evidence`** (cron; realizes `trust.sweep_abandoned_evidence.v1`): unconfirmed
  artifacts past `trust.evidence_unconfirmed_ttl` [30d] → `abandoned` + audit; orphan intake objects →
  deleted under the ADR-012 carve-out.

## 6. Snapshot rendering — implementation configuration (NOT governance)

Governance bound: `trust.evidence_snapshot_max_bytes` [10MB total, POLICY]. Everything else is
implementation config (env/constants, tunable without governance change):
max pages [5] · max dimension [2000px] · max bytes/page [2MB] · format [WebP today].
**Deps:** images = `sharp`; PDF→image = bounded open choice — recommend `@hyzyla/pdfium` (WASM,
serverless-clean) + `sharp`; fallback = external render service behind the same port. Decided at
Phase-1 build behind the render port; the Evidence Snapshot definition stays satisfied whatever the
renderer (ADR-026 neutrality).

## 7. Extraction boundary & the reusable pipeline (packet R8)

- **Shared, module-neutral extraction port** (NOT M5-private): recommended home
  `src/modules/core/infrastructure/extraction/document-extraction.service.ts` — an M0-owned narrow
  port alongside the storage port, provider-pluggable (`EvidenceExtractionProvider` interface: engine
  name/version, `extract(stream, hints) → suggestion jsonb + confidence`). Output is a
  **non-authoritative suggestion** (Invariant #12); the authoritative datum is always the consuming
  module's user-confirmed write. Phase 1 ships with **zero** OCR dependencies (no provider wired).
- **Manual completion is first-class, not a fallback:** M5 users complete structured data over the
  rendered snapshot; hash/snapshot/confirm/purge work identically with no provider.
- **Per-module consumption:**

| Consumer | Uses | Confirm step | Purge point | Tracking |
|---|---|---|---|---|
| M5 evidence | hash + snapshot + optional extraction | `trust.confirm_evidence_extraction.v1` | `trust.evidence_purge_delay` after confirm | the `evidence_artifacts` row IS the tracker + Business Record |
| M4 vendor import | extraction only | user saves the Add Vendor form → frozen `ops.create_private_vendor.v1` (`source=manual`; import metadata in `details_jsonb`) | immediately after save (owner intent: no retention) + `vendor_import_original_purged` audit | **module-owned minimal import-session state**, only if the async flow requires it (e.g. a short-lived `operations`-side tracking row or signed session token). It is never a business record, never a snapshot carrier; shape decided at M4 WP-8 build. Bounds: `operations.vendor_import_mime_allowlist` / `operations.vendor_import_max_bytes` |

- **Exclusivity rule (ADR-026):** no snapshot is ever rendered for `vendor_directory_import`; a future
  module wanting snapshots opts in via an additive patch to its own contract doc.

## 8. Contracts, audit, POLICY — pointers (never restated)

Contract truth: Doc-4B patch (`core.issue_upload_grant.v1` + purpose registry) · Doc-4G patch (5
caller-facing + 3 System M5 contracts) · Doc-4F patch (M4 declaration; no new M4 wire contract).
Audit vocabulary: the five `verification_evidence_*` actions (Doc-2 patch §5) + `upload_grant_issued`
(Doc-4B) + `vendor_import_original_purged` (Doc-4F §2). POLICY keys: the nine Doc-3 v1.13 rows.
Wire realization: Doc-5B/Doc-5G Annex-W legs at fold. Casing: snake_case requests/enums, camelCase
results. Zero §8 events anywhere (packet R5).

## 9. Build sequencing (after Gates 0–2)

- **Phase 1 (no OCR):** storage service-client + M0 port → grant contract + route → `trust`
  migration (`evidence_artifacts` + RLS + staff read leg) → submit + hash + snapshot → manual confirm →
  purge + sweeps → list/get/view-grant reads → staff review surface. Tests: D7 atomicity, RLS
  byte-equivalence (extend `ensureRestrictedRlsRole` grants), state-machine legality, purge-audit
  mandatory-pair, idempotent replay; full-`uuidv7()` fixtures; tx-rollback isolation (shared-Postgres
  hygiene).
- **Phase 2:** extraction provider adapter + suggestion-vs-confirmed review UI diffing.
- **M4 vendor import (Stream 1 WP-8) rides Phase 2** — without extraction (and with no snapshot) an
  upload adds nothing for M4.

## 10. Open items ledger

| Item | Waits on |
|---|---|
| Board rulings R1–R8 + human fold | Gate 0 |
| Service-role key + two buckets | Gate 1 (ops) |
| M5 wave scheduling + `wave/3-trust` reconciliation | Gate 2 |
| PDF renderer final pick (pdfium-WASM vs external) | Phase-1 build, behind the port |
| Extraction provider selection (engine, hosting) | Phase 2 |
| `evidence_kind` value-set confirmation by owner | fold review (packet R2) |
| M4 import-session tracking shape | M4 WP-8 build |

---

*Blueprint v1.0 — implementation-ready realization plan for the ADR-026 pipeline (M5 evidence full
policy; M4 import suggestion-only). Non-authoritative; conforms upward; executes only after Gates 0–2.*
