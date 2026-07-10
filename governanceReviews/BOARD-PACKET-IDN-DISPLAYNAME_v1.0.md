# BOARD PACKET — ESC-IDN-DISPLAYNAME · `display_name` field divergence (Doc-4C vs Doc-2/Doc-6C)

**Status:** ✅ CLOSED — owner ruled **Option A**, 2026-07-09 (decision record below)
**Channel:** `esc_registry.md` → `ESC-IDN-DISPLAYNAME` (minted at RV-0148, 2026-07-09)
**Author:** AI Engineering Orchestrator (Backend-Lead hat), 2026-07-09
**Gates:** **W2-IDN-6.1** (`identity.update_user_profile.v1` wire face) — the ONLY blocked build item.
No other WP touches the field; nothing else waits on this ruling.
**Precedent:** `BOARD-PACKET-IDN-SLUGCOUNT_v1.0.md` → `Doc-6C_Patch_v1.0.1.md` (additive,
Authority-Map-registered).

---

## 1. The divergence (facts only — verified at RV-0148, re-cited by pointer)

- **Doc-4C §C3** — the `get_user` projection enumerates a **`display_name`** field.
- **Doc-4C §C4** — the `update_user_profile.v1` wire surface carries **`display_name`** as a
  writable field.
- **Doc-2 §10.2** (users table, ~line 717) — **no `display_name` column**.
- **Doc-6C `identity.users`** (realized DDL authority) — **no `display_name` column**; the
  realized Wave-2 schema (IDN-1, live) matches Doc-6C.

This is a Doc-4C (contract corpus) vs Doc-2/Doc-6C (data corpus) divergence: the contract
promises a field the data model does not carry. Two frozen sources disagree about whether the
field exists; neither self-subordinates to the other on this point → Flag-and-Halt, never
resolved locally (CLAUDE.md §11/§13.4).

## 2. Current safe posture (already shipped, no action required)

- W2-IDN-3's `get_user` projection **honestly omits** the field (projects realized columns
  only); the omission is comment-anchored to this handle.
- **W2-IDN-6.1 is GATED**: the `update_user_profile.v1` wire must neither coin the column nor
  silently drop a frozen wire field — it waits for this ruling.

## 3. Options (neutral — the Board rules; the Orchestrator does not recommend)

**Option A — realize the column (data corpus follows the contract).**
Additive Doc-2 §10.2 + Doc-6C patch adding `display_name` to `identity.users`; forward-only
migration; `get_user` + `update_user_profile.v1` then serve the field as §C3/§C4 promise.
- Effect: the contract surface ships exactly as frozen; one new nullable column; small migration
  + projection/wire additions inside W2-IDN-6.1's existing scope.
- Question the Board must answer under A: semantics (user-chosen display alias distinct from
  legal/profile name?) — Doc-4C names the field but does not define its semantics; the patch
  must state them.

**Option B — remove the field (contract corpus follows the data model).**
Additive Doc-4C editorial patch removing `display_name` from §C3 (`get_user`) and §C4
(`update_user_profile`); the realized schema stands as-is.
- Effect: zero schema change; W2-IDN-6.1 ships the remaining §C4 fields; the SLUGCOUNT
  "propagated error corrected editorially" shape.
- Question under B: was the field a §C3/§C4 authoring artifact (nothing else in the corpus
  consumes it), or does any downstream doc (Doc-7 UX, journeys) assume a display name? A
  pre-patch grep of the corpus for `display_name` should be attached to the patch.

**Either way:** the instrument is an **additive patch + Authority-Map registration** (the
`Doc-6C_Patch_v1.0.1` precedent); frozen base files are never edited; the ruling closes the
registry row and un-gates W2-IDN-6.1.

## 4. Decision requested

Rule **A** (realize the column — with semantics) or **B** (editorial removal). On ruling, the
Orchestrator authors the corresponding additive patch, registers it in
`generatedDocs/00_AUTHORITY_MAP.md`, syncs the living docs, and un-gates W2-IDN-6.1.

---

## DECISION RECORD — 2026-07-09

**Ruling:** the owner ruled **Option A** — realize the `display_name` column; the data corpus
conforms to the already-frozen Doc-4C contract surface.

**Semantics adopted (the minimal reading of the frozen surface, recorded in the patch —
owner may veto by superseding patch):** optional user-chosen presentation name; nullable text;
personal data (anonymize-on-departure per the existing `identity.users` disposition);
presentation-only, never an identifier (no uniqueness, no auth linkage, no resolution/matching
participation); written only via `update_user_profile.v1` self-scope; projected in `get_user`.

**Instruments (all executed 2026-07-09):**
1. `generatedDocs/Doc-2_Patch_v1.0.6.md` (PATCH-D2-05) — §10.2 field-list addition + semantics.
2. `generatedDocs/Doc-6C_Patch_v1.0.2.md` — DDL overlay; forward-only migration authored at
   W2-IDN-6.1; RLS unchanged. Linked pair, folded together.
3. `generatedDocs/00_AUTHORITY_MAP.md` — Doc-2 series row → v1.0.6; linked-pair patch row added.
4. `esc_registry.md` → `ESC-IDN-DISPLAYNAME` **RESOLVED** (this record).
5. `docs/backend/backend_execution_tracker.md` — **W2-IDN-6.1 un-gated**; its packet must carry:
   the migration + Prisma column + `get_user` projection completion + `update_user_profile.v1`
   wire field (bounded per Doc-4A validation conventions) + resolution of the W2-IDN-3
   `get_user` handle comment.

**PACKET CLOSED.**
