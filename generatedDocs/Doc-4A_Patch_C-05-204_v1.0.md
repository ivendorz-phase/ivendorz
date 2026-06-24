# Doc-4A Patch — `PATCH-D4A-C05-204` — C-05 `reference_id` scope clarification (no-body responses)

| Field | Value |
|---|---|
| Patches | `Doc-4A` Content Pass-6 — Consistency Correction **C-05** (§22.1) only |
| Patch ID | `PATCH-D4A-C05-204` |
| Type | **Additive clarification** (narrows the carriage scope of an existing requirement; adds no field, status, header, or behavior). Frozen Doc-4A body not rewritten; effective = base + this patch. |
| Status | **APPROVED — human ruling on `GAP-D5A-P11-01` (2026-06-24)** · pending Architecture-Board ratification into the frozen corpus |
| Authority | Architecture corpus is rank-0 immutable; changed only by an **additive patch with human approval** (`CLAUDE.md §7`; `Master Architecture §22.7`). Human approval recorded; Board ratification required to take effect. |
| Resolves | `GAP-D5A-P11-01` (`governanceReviews/Doc-5A_CORPUS_GAP_P11-01_reference_id_204.md`) |

## Issue

Doc-4A §22.1 **C-05** states `reference_id` is "present in **every** contract response — success and error." Doc-5A §5.5 realizes `204 No Content` as a **no-body** outcome, and the corpus defines `reference_id` **only** as a body field (success body, error envelope §12.1, audit §17.2). A no-body response has nowhere to carry a body field, so the literal "every response" wording is unsatisfiable for `204` under the only defined carriage — the gap raised as `GAP-D5A-P11-01`.

## Clarification (the change)

C-05 is clarified to read (added qualifier **bold**):

> `reference_id` is a platform-assigned UUID (UUIDv7) present in every contract response **that carries a body** — success and error — generated at request acceptance. **A no-body response (e.g. `204 No Content`) does not carry `reference_id` on the wire; the linkage to the audit record and idempotency key is maintained server-side (the audit record carries its own `reference_id`, §17.2) and the caller correlates via the request's idempotency/correlation identifiers.** It is the primary linkage between the API response, the audit record, and the idempotency key. Contracts MUST NOT use a caller-supplied value as the `reference_id`.

No new field, status code, header, or error class is introduced. The audit/idempotency linkage (§17.2, §14.3) is unchanged; only the **wire-carriage scope** is clarified for no-body responses.

## Effect on Doc-5A

- `CHK-5A-042` (Appendix A) — already scoped to "every response **that carries a body**" — now matches clarified C-05 exactly; the Pass-11 CORPUS-GAP note is closed by pointer to this patch.
- Doc-5A §5.6/§6.1 (top-level `reference_id` on body-bearing success/error) are unaffected and correct.

## Ratification

This additive clarification is recorded as human-approved (GAP-D5A-P11-01 ruling). It becomes corpus-effective on Architecture-Board ratification; until then it is carried as an approved-pending-ratification patch and cited by `GAP-D5A-P11-01` and the Doc-5A Freeze Readiness Audit. Record in `00_AUTHORITY_MAP.md` provenance at ratification.
