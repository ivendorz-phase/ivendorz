# Doc-4B Additive Patch (PROPOSED) — `core.issue_upload_grant.v1` (Purpose-Bound Upload Grant)

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** Doc-4B (M0
Platform Core contracts) is frozen; this is an **additive** contract patch folded only by a human, only
as part of the `BOARD-PACKET-VERIFICATION-EVIDENCE_v1.0.md` R3 indivisible set. **This patch is the
Board leg the ESC registry already anticipates:** `esc_registry.md` L31 carries **`ESC-7-API/upload`**
("No client-facing upload-grant (signed-URL issuance) in the wired surface") with remediation
"**Additive Doc-5x/Doc-4B patch (Board)**" — packet item R4 rules it. The registry row flips to RESOLVED
only at human fold.

| Field | Value |
|---|---|
| Target document | Doc-4B (Platform Core / Shared Kernel contract doc) — version = next at fold per `00_AUTHORITY_MAP.md` |
| Change type | Additive: **one** new caller-facing contract + a closed, additively-extensible **purpose registry** + **one** M0 audit action. **No existing contract, table, or clause changed.** |
| Realizes | ADR-026 (PROPOSED) pipeline entry point; resolves `ESC-7-API/upload` (packet R4) |
| Coins | `core.issue_upload_grant.v1` · purpose registry entries `trust_verification_evidence`, `vendor_directory_import` · audit action `upload_grant_issued` (additive Doc-2 §9 Platform Core row, riding this same fold; precedent: `Doc-4B_OutboxAuditToken_Patch_v1.0_PROPOSAL.md`) |
| Adds M0 tables | **NONE — M0 stays at 5 tables.** Grant issuance is stateless in M0 (audit record only). |
| Persists | **No URL, no path** (Doc-4A storage discipline; Doc-6A R-set out-of-DB boundary / Doc-7C "`file_ref` only"). The signed URL exists on the wire and in object storage only. |

---

## §1 — Contract: `core.issue_upload_grant.v1`

**Intent.** The single, platform-wide way a client obtains permission to PUT a file into transient
intake storage. Every grant is bound to a **purpose** from the closed registry (§2); the purpose fixes
the authorizing permission slug, the POLICY bounds, and the org-scoped intake location. Consuming
modules (M5 evidence, M4 vendor import) never issue storage credentials themselves — M0 owns the seam
(one module, one owner; M5/M4 never import a storage SDK).

**Request** (snake_case, Doc-4A grammar):

| Field | Type | Req | Notes |
|---|---|---|---|
| `purpose` | `enum` (§2 registry) | 1 | closed set; unknown → `VALIDATION` |
| `original_filename` | `string` | 1 | display metadata only — never a storage path |
| `mime_type` | `string` | 1 | validated against the purpose's POLICY allowlist |
| `byte_size` | `integer` | 1 | declared size; validated against the purpose's POLICY max |

**Behavior** (Doc-4A §11.2 stage order): SYNTAX → CONTEXT (server-resolved active org; client-supplied
org never trusted, Inv #5) → AUTHZ (the purpose's slug, §2) → POLICY bounds (Doc-3 v1.13 keys: TTL,
per-org open-grant cap, per-purpose mime/size) → mint `artifact_id` (UUIDv7, `src/shared/ids` at
realization) → issue a single-use signed upload URL to the org-scoped intake location for that purpose
→ audit `upload_grant_issued` (same transaction as any quota bookkeeping; metadata only).

**Response** (camelCase result per the binding wire-casing rule):
`{ artifactId, uploadUrl, expiresAt, objectKey }` — `objectKey` is the org-scoped storage reference the
consuming module will later persist as its own storage-ref column (the sanctioned `file_ref`/
`storage_ref` discipline); `uploadUrl` is **never persisted anywhere**.

**Errors:** `VALIDATION` (unknown purpose, mime/size outside POLICY) · `AUTHORIZATION` (missing slug) ·
`BUSINESS` (open-grant cap reached) · `SYSTEM`. Cross-org disclosure is impossible by construction —
grants are minted only into the caller's own active-org scope.

**Orphan discipline.** A grant whose object is never bound by the consuming module's submit contract is
an *abandoned/unused* file — swept under ADR-012's **existing** "temporary uploads" carve-out (legal
today, no ADR-026 dependency).

## §2 — Purpose registry (closed enum; extended only by additive patch to this section)

| Purpose | Consuming module & binding contract | Authorizing slug (existing; none coined) | POLICY bounds (Doc-3 v1.13) |
|---|---|---|---|
| `trust_verification_evidence` | M5 — `trust.submit_verification_evidence.v1` (Doc-4G patch) | `can_submit_verification` | `trust.evidence_mime_allowlist` · `trust.evidence_max_bytes` |
| `vendor_directory_import` | M4 — Add-Vendor form pre-fill; record lands via frozen `ops.create_private_vendor.v1` (Doc-4F patch) | `can_manage_private_vendors` | `operations.vendor_import_mime_allowlist` · `operations.vendor_import_max_bytes` |

Common keys: `core.upload_grant_ttl` · `core.upload_max_open_grants_per_org`. A future module joins by
an additive row here **plus** its own ADR-026 module-policy declaration — never by code.

## §3 — Annex W: wire leg

Realized as a Doc-5B wire contract at fold (path per the Doc-5B grammar; snake_case segment
`upload_grants`; `Idempotency: required`; Doc-5A envelope). The wire leg is registered in the Doc-5B
inventory additively at implementation era — this patch fixes the contract truth only.

## §4 — Non-impact confirmation

| Aspect | Effect |
|---|---|
| M0 table inventory | **Unchanged (5)** — no grants table; quota realization is implementation-era within the POLICY bound (blueprint §) |
| Existing Doc-4B contracts (audit append, human refs, config, flags, outbox) | Unchanged |
| Storage discipline (`file_ref`/`storage_ref` only; out-of-DB boundary) | Reaffirmed — no URL/path column anywhere |
| Module boundaries | M0 owns issuance; consuming modules bind objects via their own contracts; no module imports a storage SDK except M0's infrastructure port |
| Events | None — grant issuance emits audit only |

## §5 — Conformance self-check

| Check | Result |
|---|---|
| Resolves `ESC-7-API/upload` by its own anticipated remediation path (Doc-4B additive, Board) | PASS — packet R4 |
| Purpose-bound, org-scoped, slug-gated issuance; Inv #5 upheld | PASS (§1) |
| Coins no slug, no table, no event; audit action registered additively with precedent | PASS |
| Both founding purposes map to existing slugs verified in the corpus (`can_submit_verification` Doc-4G · `can_manage_private_vendors` Doc-4F/Doc-2 §7) | PASS — verified 2026-07-17 |
| Coinage sweep (`issue_upload_grant`, purpose values, `upload_grant_issued`) | PASS — zero corpus hits, 2026-07-17 |

---

*Doc-4B additive patch proposal — the platform's single purpose-bound upload-grant contract
(`core.issue_upload_grant.v1`), two founding purposes (M5 evidence · M4 vendor import), no new M0 table,
no persisted URL. Resolves `ESC-7-API/upload` (packet R4). PROPOSED — folds only with the ADR-026 set.*
