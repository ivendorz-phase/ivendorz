# Doc-5A Structure Patch — `PATCH-D5A-STRUCT-02`

| Field | Value |
|---|---|
| Patches | `Doc-5A_Structure_v1.0_FROZEN.md` — §4 purpose line only |
| Patch ID | `PATCH-D5A-STRUCT-02` |
| Type | Additive wording-synchronization patch (frozen structure body not rewritten; effective structure = base + this patch) |
| Status | APPLIED — pending merge into the consolidated `Doc-5A_FROZEN` artifact |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §5` (post-freeze additive amendment) |
| Conforms To | `Doc-4A §9.6` (frozen); Doc-5A §8 (pagination ownership), §4.4 (header registry) |

## Issue

The frozen structure's **§4 purpose line** enumerates standard headers and includes **"pagination cursors"**:

> "the one envelope and the closed set of standard headers (correlation/trace id, authentication carrier, active-organization context carrier, idempotency key, concurrency precondition, surface version, **pagination cursors**)…"

The pagination continuation cursor is **not a header**. Per the **frozen `Doc-4A §9.6`**, the cursor is the opaque **`cursor` request parameter**, owned by the list grammar (**Doc-5A §8**). The content registry (§4.4) already excludes it; the structure purpose-line wording lagged.

## Change

In `Doc-5A_Structure_v1.0_FROZEN.md` §4 purpose line, **remove "pagination cursors"** from the standard-header enumeration. The corrected enumeration reads:

> "the one envelope and the closed set of standard headers (correlation/trace id, authentication carrier, active-organization context carrier, idempotency key, concurrency precondition, surface version), each bound to its owning standard."

No other structure text changes. No TOC change. No section added or removed.

## Rationale

- **Substance was never open:** `Doc-4A §9.6` (frozen) fixes the cursor as a request parameter; this patch only synchronizes the structure purpose-line wording with that frozen rule and with content §4.4.
- **Reference-never-restate:** the cursor's definition stays with `Doc-4A §9.6`; its grammar with Doc-5A §8. This patch restates nothing.

## Provenance

Raised as carried flag **STRUCT-02** during Doc-5A content authoring (surfaced in Pass-2 §4.4, Pass-10 Appendix B.4, Pass-12 Appendix C.2). Closed by this additive patch; to be folded into the consolidated `Doc-5A_FROZEN` artifact at freeze. Record in `00_AUTHORITY_MAP.md` provenance trail at consolidation.
