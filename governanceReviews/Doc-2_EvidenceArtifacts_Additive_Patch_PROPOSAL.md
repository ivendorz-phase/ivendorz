# Doc-2 Additive Patch (PROPOSED) — `trust.evidence_artifacts` (Verification Evidence Business Record)

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** Doc-2 is rank 0
(frozen corpus); per CLAUDE.md §11 a frozen document is never edited in place. This is an **additive**
patch proposal — on approval a human folds the blocks below and bumps the Doc-2 version; the Authority
Map and `esc_registry.md` flip in the **same fold commit**. Until then this file is non-authoritative.
**Folds only as part of the indivisible set** ratified by `BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md`
R3 (ADR-026 is the conceptual authority this patch realizes).

| Field | Value |
|---|---|
| Target document | `Doc-2_Domain_Model_And_Database_Blueprint` — effective frozen version per `00_AUTHORITY_MAP.md` at fold (v1.0.2 file + approved patch chain; CLAUDE.md §9 cites v1.0.3 effective). **Version = next at fold — verify against the Authority Map when folding.** |
| Change type | Additive only: **one** new §10.6 table row + column truth · new §3 entity/aggregate rows (Trust) · one new §5 lifecycle machine (next free §5 number at fold) · **five** additive §9 Trust audit actions · one interpretive note on an existing §10.6 column. **No existing table, column, enum, state, or action is modified, renamed, or removed.** |
| Realizes | ADR-026 (PROPOSED) — M5 founding Transient-Upload declaration's Business Record storage |
| Coins | Table `trust.evidence_artifacts` + its columns/enums + 5 audit action names. No permission slug (binds existing `can_submit_verification` · `staff_can_verify`), no event, no POLICY key (keys live in the Doc-3 v1.13 patch). |
| Authority / channels | Doc-4G PassB `[ESC-TRUST-AUDIT]` ("nearest Doc-2 §9 Trust action by pointer; channel Doc-2 §9 additive") — this patch performs the §9 additive registration for the five evidence actions; the channel itself remains open for other carried Trust actions. |

---

## §1 — Why Doc-2 must speak

The frozen `trust.verification_records` row (§10.6, Doc-2 v1.0.2 L795) carries
`evidence_document_refs[]` — per Doc-4G PassB §F-table L53 "document IDs; Platform Core storage refs",
realized in Doc-6G Pass1 L53 as a bare-UUID array with no FK. **No table those UUIDs resolve to exists
anywhere in the corpus.** ADR-026's M5 policy requires a Business Record (confirmed structured data +
processing metadata + audit history + Evidence Snapshot + SHA-256 fingerprint, both required by M5's
declaration) — that record needs a Doc-2-registered home. Column truth is Doc-2's monopoly; inventing
the table in an implementation would violate Reference-never-restate and One-Module-One-Owner.

## §2 — Additive block A: §10.6 table row (insert consistent with the frozen table style)

```
| trust.evidence_artifacts | — | subject_id + subject_type (mirrors verification subjects: vendor_profile/organization/capacity_claim/declared_tier), uploaded_by (user) | organization_id (+ platform-staff review read) | YES (the artifact row is the Business Record — Inv #8 governed; the ORIGINAL BINARY is a Transient Upload, ADR-026) | `evidence_kind(trade_license/tin_certificate/bin_certificate/incorporation_certificate/iso_certificate/factory_audit_report/other), state(§5.x), sha256_fingerprint (non-unique idx), original_filename, original_mime, original_byte_size, original_uploaded_at, original_uploaded_by, original_object_key (kept forever; dangling after purge BY DESIGN), snapshot_ref (file_ref only), snapshot_metadata_jsonb (render-specific facts — implementation detail, never governance columns), extraction_suggestion_jsonb + extraction_engine/version/completed_at/confidence (ALL nullable — degraded/manual path), confirmed_data_jsonb, document_number, document_expires_at (promoted typed columns — make the frozen Doc-4G §G4.5 "evidence document expired" BUSINESS rule machine-checkable), confirmed_by, confirmed_at, purged_at, revision` |
```

Column notes (binding):
- **Tenant/RLS truth:** every read/mutate is `organization_id`-scoped; platform-staff review access is a
  separate explicit read leg (realized at Doc-6G level at implementation era) — never a tenant bypass.
- **`snapshot_ref`** is a `file_ref` **only** (Doc-7C frozen: "blob via M0/Doc-4B Storage (`file_ref`
  only)"; Doc-6A R-set out-of-DB boundary) — no URL, no path, no binary in the DB.
- **No FK in either direction** between `evidence_artifacts` and `verification_records` — the frozen
  `evidence_document_refs[]` bare-UUID array is preserved exactly as frozen.
- **Evidence Snapshot columns are format-neutral** per the ADR-026 implementation-neutrality rule.

## §3 — Additive block B: §3 entity/aggregate rows (Trust)

- **Evidence Artifact** — aggregate root `trust.evidence_artifacts`; the ADR-026 **Business Record** for
  M5 verification evidence. Owned by M5. Referenced (never owned) by `verification_records` via the
  existing `evidence_document_refs[]` bare-UUID array. No child tables. Standard audit + soft-delete
  columns (the row is Inv-#8 governed; only the original binary is transient).

## §4 — Additive block C: §5 lifecycle machine (next free §5 number at fold)

```
received → processing → review_pending → confirmed → original_purged
processing → failed                (terminal; integrity/render failure — re-upload is a NEW artifact)
received | processing | review_pending → abandoned   (terminal; unconfirmed-TTL sweep)
```

- `confirmed → original_purged` is a **System** transition (policy-delayed purge; ADR-026 mandatory
  deletion audit). No reactivation edges. Extraction failure is **not** `failed` — the artifact proceeds
  to `review_pending` with an empty suggestion (manual completion is a first-class path).

## §5 — Additive block D: §9 audit actions (Trust; performs the additive registration the
`[ESC-TRUST-AUDIT]` channel anticipates for these five actions)

| Action | Attribution | Notes |
|---|---|---|
| `verification_evidence_submitted` | User | artifact row created; grant bound to object |
| `verification_evidence_processed` | System | processing finalized → `review_pending` |
| `verification_evidence_confirmed` | User | confirmed data written; Business Record complete |
| `verification_evidence_original_purged` | System | **MANDATORY on every purge** (ADR-026); metadata-only old_value (ADR-009 — no blobs in audit) |
| `verification_evidence_abandoned` | System | TTL sweep terminal |

Zero §8 events — the evidence lifecycle emits audit records only (packet R5; consistent with BC-OPS-1
H.7 precedent of no-event aggregates).

## §6 — Interpretive note (one sentence, appended to the §10.6 `verification_records` row's notes at fold)

*"`evidence_document_refs[]` UUIDs resolve to `trust.evidence_artifacts.id` (additive patch; the column
itself is unchanged)."* — Doc-4G PassB H-blocks stay literally true ("Pass-B introduces no column"): this
patch adds a **table**, not a column on any frozen table.

## §7 — Non-impact confirmation

| Aspect | Effect |
|---|---|
| All existing §10.6 rows / columns / enums | Unchanged |
| `verification_records` shape & Doc-4G PassB contracts | Unchanged — reference direction preserved (bare-UUID array) |
| Governance signals (Inv #6) | Untouched — evidence artifacts carry no score, tier, or signal |
| Permission slugs (Doc-2 §7) | None coined — binds `can_submit_verification` (org submit/confirm) + `staff_can_verify` (staff review) |
| Events (§8) | None added |
| M0 table count | Unchanged (storage stays a `file_ref` discipline; the grant contract is Doc-4B's patch and adds no table) |

## §8 — Conformance self-check

| Check | Result |
|---|---|
| Additive only; human fold; Authority Map + registry same commit | PASS (header) |
| Resolves the dangling `evidence_document_refs[]` target without touching the frozen column | PASS (§2, §6) |
| Evidence Snapshot columns implementation-neutral (ADR-026 second-round ruling) | PASS — `snapshot_ref` + `snapshot_metadata_jsonb` only |
| Five audit actions registered additively via the anticipated §9 channel; no action invented in code | PASS (§5) |
| No FK across module boundaries; no cross-module table access implied | PASS |
| `evidence_kind` values disjoint from frozen `verification_type` enum (`contact/business/factory/organization/tier/capacity`) | PASS — verified 2026-07-17 corpus grep |
| Coinage-collision sweep (`evidence_artifacts`, `evidence_kind`, action names) | PASS — zero corpus hits, 2026-07-17 |

---

*Doc-2 additive patch proposal — one new Trust table (`evidence_artifacts`, the ADR-026 Business Record),
its lifecycle machine, five §9 audit actions, and the `evidence_document_refs[]` interpretive note.
PROPOSED — folds only with the ADR-026 packet set (R3).*
