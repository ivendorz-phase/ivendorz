# Doc-3 — POLICY Key Registration Patch v1.13 (Evidence Handling & Import Bounds) — PROPOSED

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / BOARD APPROVAL.** Folds only as part of the
`BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md` R3 indivisible set. Until fold this file is
non-authoritative and registers nothing.

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.13-EvidenceHandling |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory (additive rows in three **existing** domain blocks) |
| Patch Authority | API Governance Board / human owner approval (pending); carries the `[ESC-TRUST-POLICY]` / `[ESC-OPS-POLICY]` channels for the evidence/import keys referenced by the linked Doc-4G / Doc-4F / Doc-4B patch proposals |
| Patch Type | **Additive registration only** — 9 keys across the existing `core.*` (Patch v1.0), `trust.*` (v1.3), `operations.*` (v1.4) domain blocks. No validation-semantic, trust, scoring, or ownership change. No existing key modified or removed. |
| Version check | Doc-3 policy chain ends at **v1.12** in `00_AUTHORITY_MAP.md` (verified 2026-07-17) → **v1.13 is the next free number**; re-verify at fold. |
| Linked Documents | `ADR-026_Transient_Upload_Lifecycle_PROPOSAL.md` · Doc-4B/4G/4F patch proposals (the referencing surfaces) · precedents `…v1.3_Trust.md`, `…v1.4_Operations.md` |

---

## §1 — Patch Authority

The linked Doc-4B/4G/4F patch proposals reference upload/evidence/import tunables that are absent from
the Doc-3 §12.2 inventory. Per Doc-4A §18.2 a referenced POLICY key MUST exist in §12.2; each reference
in the proposals carries its channel marker (`[ESC-TRUST-POLICY]` / `[ESC-OPS-POLICY]`) rather than
inventing a key. This patch performs exactly that registration. Doc-3 §12.2 remains the sole
registration authority; M0/M5/M4 are consuming/behavioral owners only.

**Per the owner's implementation-neutrality ruling (2026-07-17, second round):** the three
rendering-specific bounds originally sketched (`snapshot_max_pages`, `snapshot_max_dimension_px`,
`snapshot_max_bytes_per_page`) are **deliberately NOT registered** — rendering technology is an
implementation detail; those bounds live as implementation configuration in the blueprint. Governance
registers one neutral resource bound (`trust.evidence_snapshot_max_bytes`, total) instead.

## §2 — Scope Statement

| Action | Detail |
|---|---|
| Add to existing `core.*` block | 2 keys (upload-grant transport) |
| Add to existing `trust.*` block | 5 keys (evidence handling) |
| Add to existing `operations.*` block | 2 keys (vendor-import bounds) |
| New domains / modified keys / semantic changes | **None** |

## §3 — Additive Registration Rows (Doc-3 §12.2; `[start: …]` = initial defaults, operator-tunable, POLICY ≠ FIXED)

| Key | Category | Value type | Purpose | Mutability |
|---|---|---|---|---|
| `core.upload_grant_ttl` | API Realization | duration | Validity window of a `core.issue_upload_grant.v1` signed upload URL *[start: 15m]* | POLICY |
| `core.upload_max_open_grants_per_org` | API Realization | integer | Cap on concurrently open (issued, unbound) grants per organization *[start: 10]* | POLICY |
| `trust.evidence_mime_allowlist` | Evidence Handling | list | Accepted MIME types for `trust_verification_evidence` uploads *[start: pdf, jpeg, png, webp]* | POLICY |
| `trust.evidence_max_bytes` | Evidence Handling | integer (bytes) | Max original size for evidence uploads *[start: 20MB]* | POLICY |
| `trust.evidence_unconfirmed_ttl` | Evidence Handling | duration | Unconfirmed artifact lifetime before the `abandoned` sweep *[start: 30d]* | POLICY |
| `trust.evidence_snapshot_max_bytes` | Evidence Handling | integer (bytes) | **Neutral total** resource bound for a rendered Evidence Snapshot (format-agnostic per ADR-026) *[start: 10MB]* | POLICY |
| `trust.evidence_purge_delay` | Evidence Handling | duration | Delay between confirmation and original purge *[start: 24h]* | POLICY |
| `operations.vendor_import_mime_allowlist` | Import Bounds | list | Accepted MIME types for `vendor_directory_import` uploads *[start: pdf, jpeg, png, webp]* | POLICY |
| `operations.vendor_import_max_bytes` | Import Bounds | integer (bytes) | Max original size for vendor-import uploads *[start: 20MB]* | POLICY |

- All nine are **POLICY** (tunable without deploy; changes admin-permissioned and audited per Doc-3
  §12.4 / Doc-2 §9 "system_configuration change"). None is FIXED; none is ORG.
- **Firewall:** these keys tune upload/processing transport only. They MUST NOT influence Trust Score,
  Performance Score, Verification outcomes, matching, routing, or any governance signal — and by
  construction they do not. No payment/plan/entitlement coupling.

## §4 — Non-Impact Confirmation

| Aspect | Effect |
|---|---|
| Existing §12.2 keys (all domains, incl. v1.3 `trust.*` + v1.4 `operations.*` rows) | Unchanged |
| Trust/scoring/verification/fraud logic; state machines | Unchanged |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — all nine are POLICY |
| Rendering technology governance | **Deliberately unregistered** (implementation-neutrality ruling) |

## §5 — Conformance Self-Check

| Check | Result |
|---|---|
| Doc-4A §18.2 satisfied for every key the linked proposals reference | PASS — 9/9 registered here |
| No key invented in a Doc-4/Doc-5 document (channel markers used) | PASS |
| v1.13 free (chain ends at v1.12) | PASS — verified 2026-07-17; re-verify at fold |
| Coinage sweep (all 9 names, repo-wide `*.md`) | PASS — zero hits, 2026-07-17 |
| Registration style consistent with §12.2 precedents (v1.3/v1.4) | PASS |

---

*Doc-3 POLICY Key Registration Patch v1.13 (PROPOSED) — 9 additive keys: upload-grant transport
(`core.*` ×2), evidence handling (`trust.*` ×5, rendering-neutral), vendor-import bounds
(`operations.*` ×2). Folds only with the ADR-026 packet set.*
