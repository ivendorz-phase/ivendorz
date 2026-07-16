# Doc-4G Additive Patch (PROPOSED) — Verification Evidence Snapshot (M5 Module Policy + Contract Surface)

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** Doc-4G (M5 Trust &
Verification contracts) is frozen (`Doc-4G_Final_Freeze_Audit_v1.0.md` — no realization patch exists yet;
this would be **Doc-4G's first**). Additive only; human fold; part of the
`BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md` R3 indivisible set.

| Field | Value |
|---|---|
| Target document | Doc-4G — version = next at fold per `00_AUTHORITY_MAP.md` |
| Change type | Additive: M5's ADR-026 module-policy declaration + 5 caller-facing contracts + 3 out-of-wire System contracts. **No existing Doc-4G contract (§G4.x), state machine, or clause is modified.** |
| Realizes | Owner 7-step ruling 2026-07-17 (upload → fingerprint → snapshot → optional extraction → confirm → store → purge); ADR-026 founding member #1 |
| Coins | Contract names below + nothing else (table/columns/actions = Doc-2 patch; grant = Doc-4B patch; keys = Doc-3 v1.13 patch) |
| Slugs | **Existing only:** `can_submit_verification` (org-side) · `staff_can_verify` (staff review) — `[ESC-TRUST-SLUG]` stays untouched |
| Events | **Zero §8 events** (packet R5) — the evidence lifecycle emits audit records only; consistent with Doc-4G H.7 posture (verification expiry emits no dedicated event) and BC-OPS-1 precedent |

---

## §1 — M5 module policy declaration (ADR-026)

**Verification evidence uploads are Transient Uploads.** The M5 Business Record is the
`trust.evidence_artifacts` row (Doc-2 patch), whose **required** components are the confirmed structured
data, processing metadata, and audit history, and for which M5 **requires BOTH optional components**:
the **Evidence Snapshot** and the **SHA-256 fingerprint**.

**Evidence Snapshot (restated verbatim from ADR-026 — implementation-neutral):** *"Evidence Snapshot: a
lightweight, read-only verification reference generated from the uploaded document."* No rendering
format is prescribed at the governance level; rendering technology is an implementation detail.
*"Evidence Snapshots are verification references only. They must never be treated as the original
uploaded document, used for OCR re-processing, or considered a legal replacement for the original source
document."* Evidence Snapshots are exclusive to M5 unless another module opts in through governance.

**Extraction is OPTIONAL by design.** OCR/AI extraction produces a non-authoritative *suggestion*
(Invariant #12 — AI suggests, modules decide; no M9 bounded context is created or consulted). Manual
completion over the rendered snapshot is a first-class path: hash, snapshot, confirm, and purge work
identically with no extraction provider wired.

**Purge point:** policy-delayed after confirmation (`trust.evidence_purge_delay`), with the mandatory
`verification_evidence_original_purged` audit event (Doc-2 patch §5 table).

## §2 — Caller-facing contracts (Doc-4A grammar; snake_case requests/enums, camelCase results)

| Contract | Actor / slug | Intent | Key request fields | Result essentials |
|---|---|---|---|---|
| `trust.submit_verification_evidence.v1` | User · `can_submit_verification` | bind an uploaded object (Doc-4B grant, purpose `trust_verification_evidence`) to a new artifact row (`received`) and start processing | `artifact_id` (from the grant), `object_key`, `evidence_kind`, `subject_id`, `subject_type` | `{ artifactId, state }` (201) |
| `trust.confirm_evidence_extraction.v1` | User · `can_submit_verification` | write user-confirmed structured data; `review_pending → confirmed`; schedules purge | `artifact_id`, `confirmed_data` (incl. `document_number?`, `document_expires_at?`), `expected_revision` | `{ artifactId, state, revision }` |
| `trust.list_evidence_artifacts.v1` | User/staff · `can_submit_verification` / `staff_can_verify` | org-scoped list (staff: review queue leg) | allowlisted filters (`state?`, `evidence_kind?`, `subject_type?`), cursor, page size ≤ `trust.list_page_size_max` | rows of artifact projections |
| `trust.get_evidence_artifact.v1` | User/staff (same slugs) | detail projection (suggestion vs confirmed, snapshot metadata, state) | `artifact_id` | artifact projection; cross-org → `NOT_FOUND` collapse |
| `trust.issue_evidence_view_grant.v1` | User/staff (same slugs) | short-lived signed **read** URL for the **snapshot only** — never the original (the original is unreadable-by-design in intake and gone after purge) | `artifact_id` | `{ viewUrl, expiresAt }` — never persisted |

Shared rules: `Idempotency: required` on mutations (dedup window `trust.idempotency_dedup_window`,
Doc-3 v1.3 — already frozen); Doc-4A §11.2 stage order; cross-org reference collapses to `NOT_FOUND`,
never `AUTHORIZATION`; `expected_revision` per Doc-4A §14 on `confirm`.

## §3 — Out-of-wire System contracts (never HTTP; System actor attribution)

| Contract | Trigger | Effect |
|---|---|---|
| `trust.process_evidence_artifact.v1` | submit | fingerprint (SHA-256) → render snapshot → extract (optional) → `review_pending` + `verification_evidence_processed` audit. Integrity/render failure → terminal `failed`; extraction failure → NON-terminal (empty suggestion) |
| `trust.purge_evidence_original.v1` | confirm + `trust.evidence_purge_delay` | delete intake object, verify gone, then one tx: `original_purged` state + `purged_at` + **mandatory** `verification_evidence_original_purged` audit (metadata-only old_value, ADR-009). Sweep re-detects and re-writes if the audit tx fails |
| `trust.sweep_abandoned_evidence.v1` | cron | unconfirmed-TTL (`trust.evidence_unconfirmed_ttl`) → `abandoned` + audit; orphan intake objects → ADR-012 existing carve-out |

## §4 — POLICY bindings (registered in Doc-3 v1.13 patch; referenced by name, never invented)

`trust.evidence_mime_allowlist` · `trust.evidence_max_bytes` · `trust.evidence_unconfirmed_ttl` ·
`trust.evidence_snapshot_max_bytes` (neutral total-size bound) · `trust.evidence_purge_delay` ·
(common: `core.upload_grant_ttl`, `core.upload_max_open_grants_per_org`). Rendering bounds (pages,
pixels, per-page bytes) are **implementation configuration**, deliberately not governance keys
(implementation-neutrality ruling).

## §5 — Audit wire tokens (pinned)

The five Doc-2-patch actions are the only evidence audit vocabulary:
`verification_evidence_submitted` · `_processed` · `_confirmed` · `_original_purged` (mandatory) ·
`_abandoned`. No code mints any other evidence action (D7 rule; `[ESC-TRUST-AUDIT]` remains the channel
for other carried Trust actions).

## §6 — Annex W: Doc-5G wire leg

The five caller-facing contracts gain Doc-5G wire realizations at fold (Doc-5G path grammar; Doc-5A
envelope; the §2 idempotency/pagination keys already frozen by Doc-3 v1.3). This is **Doc-4G's first
realization patch** — the Authority Map gains the row at fold.

## §7 — Non-impact confirmation & self-check

| Check | Result |
|---|---|
| Existing §G4.1–G4.7 contracts, state machines (§5.6), scores/tiers/fraud | Unchanged |
| Firewall (H.9): evidence lifecycle never touches Trust/Performance scores | PASS — no score input, no signal write |
| "Evidence document expired" BUSINESS rule (§G4.5 L282) becomes machine-checkable via promoted `document_expires_at` | PASS — Doc-2 patch column note |
| Zero events; audit-only lifecycle | PASS (R5) |
| Slugs existing-only; `[ESC-TRUST-SLUG]` untouched | PASS |
| Coinage sweep (5 contract names, 3 System names) | PASS — zero corpus hits, 2026-07-17 |

---

*Doc-4G additive patch proposal — M5's ADR-026 founding declaration (snapshot + fingerprint required),
5 caller-facing + 3 System evidence contracts, POLICY bindings, pinned audit tokens, zero events.
PROPOSED — folds only with the ADR-026 set (packet R3).*
