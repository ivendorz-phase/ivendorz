# Doc-5A — Structure/Content Alignment Governance Note — Pagination Cursor

| Field | Value |
|---|---|
| **Note ID** | `GOVNOTE-D5A-STRUCT-02` |
| **Status** | OPEN — pending Structure additive patch |
| **Applies To** | `Doc-5A_Structure_v1.0_FROZEN.md` §4 purpose line |
| **Raised By** | Pass-2 Closure Verification (closure checklist — frozen-structure-violations check) |
| **Board Disposition** | C-02 GOVERNANCE FLAG — do not modify Pass-2 content; do not reintroduce Pagination Cursor into §4.4 header registry; resolve by additive structure patch |

---

## Misalignment Description

The frozen structure's §4 purpose line lists **pagination cursors** as one of the standard headers §4 should define:

> `§4 — Transport Envelope & Standard Header Set`
> **Purpose:** "Define the one envelope and the closed set of standard headers
> (correlation/trace id, authentication carrier, active-organization context carrier,
> idempotency key, concurrency precondition, surface version, **pagination cursors**),
> each bound to its owning standard."

Pass-2 content, informed by `Doc-4A §9.6`, correctly identifies the pagination continuation cursor as a **query parameter** (`cursor`), not a header. Board Assessment round-2 M-01 approved its removal from the §4.4 header registry:

> "§4.4 Pagination Cursor REMOVED from header registry; it is a pagination concern
> owned by §8 (registry kept header-only)"

The `§4.4` note (line 201, Pass-2) records this decision:

> "Pagination cursor (board M-01): the paginated-traversal continuation cursor is a
> pagination concern, not a header. It is carried as the `cursor` request parameter
> (`Doc-4A §9.6`) and owned entirely by **§8**; it is **not** a slot in this header
> registry."

**No additive patch has been applied to `Doc-5A_Structure_v1.0_FROZEN.md`.**
The frozen structure's §4 purpose line therefore still names pagination cursors as a
standard header — misaligned with the board-approved content decision.

---

## Governance Consequence

`Doc-5A_Structure_v1.0_FROZEN §4` is the authoritative template for all content passes.
As written, it requires §4 to define a pagination-cursor header. Pass-2 content correctly
diverges from this on corpus grounds (`Doc-4A §9.6`), but without a conforming structure
patch the divergence is formally a structural deviation.

This misalignment will recur at every future §4 conformance check until the structure is
corrected. Later passes (§5 onward) **must not** be blocked by this open note, but §8
authoring (pagination wire grammar) **should not begin** until this note is resolved and
the structure patch is applied, to avoid a second authoring conflict.

---

## Required Resolution

Apply an **additive patch** to `Doc-5A_Structure_v1.0_FROZEN.md` §4 purpose line removing
`pagination cursors` from the enumerated header slots:

**Before (current §4 purpose line):**

```
Define the one envelope and the closed set of standard headers (correlation/trace id,
authentication carrier, active-organization context carrier, idempotency key, concurrency
precondition, surface version, pagination cursors), each bound to its owning standard.
```

**After (proposed — for board approval):**

```
Define the one envelope and the closed set of standard headers (correlation/trace id,
authentication carrier, active-organization context carrier, idempotency key, concurrency
precondition, surface version), each bound to its owning standard. The pagination
continuation cursor is a query parameter (`cursor` per `Doc-4A §9.6`), not a header; it
is owned by §8 (Pagination, Filtering & Sort Wire Grammar).
```

This additive patch:
- Removes `pagination cursors` from §4's stated header scope.
- Adds an explicit clarifying sentence so the omission is intentional and documented.
- Requires a companion `Doc-5A_Structure_Patch_STRUCT-02.md` additive patch document.
- Requires board approval before application to the frozen structure.

---

## Action Required

| Actor | Action |
|---|---|
| **Architecture Board** | Approve the proposed §4 purpose-line wording above and authorize `PATCH-D5A-STRUCT-02`. |
| **AI agent / author** | On approval: apply patch to `Doc-5A_Structure_v1.0_FROZEN.md`, create `Doc-5A_Structure_Patch_STRUCT-02.md`, update `00_AUTHORITY_MAP.md` provenance trail. |
| **Pass-3+ authors** | No action until board approval. Do not reference pagination cursor as a header. |

---

*End of GOVNOTE-D5A-STRUCT-02. Non-authoritative governance record; additive; does not modify any frozen document or Pass-2 content.*
