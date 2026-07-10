# Doc-6C Additive Patch v1.0.2 — `identity.users.display_name` DDL Realization

| Field | Value |
|---|---|
| **Patches** | Doc-6C (M1 `identity` schema realization) — v1.0.1 → **v1.0.2** |
| **Class** | **Additive DDL realization.** One nullable column added to one table via forward-only migration. No RLS, index, constraint, enum, state, or seed change. |
| **Authorized by** | Human owner/Board ruling, 2026-07-09 — `ESC-IDN-DISPLAYNAME` **Option A** (decision packet: `governanceReviews/BOARD-PACKET-IDN-DISPLAYNAME_v1.0.md`) |
| **Frozen text** | Doc-6C Pass-1…3 files are NOT edited. This patch is the corrective overlay realizing `Doc-2_Patch_v1.0.6` (the linked pair, folded together). |

## 1. The addition

**`identity.users`** (Doc-6C Pass-1 §2, CREATE TABLE at line ~51) gains, per this patch:

```sql
display_name    text,    -- [Doc-2 §10.2 per Doc-2_Patch_v1.0.6] optional user-chosen presentation
                         -- name; personal data (anonymized on departure with the §C4 set);
                         -- never an identifier — no uniqueness, no auth linkage
```

- **Nullable, no default** — absence is the legitimate initial state; the wire field is
  `optional` (Doc-4C §C4 PassB:174).
- **Realization vehicle:** a **forward-only migration** authored inside `W2-IDN-6.1`
  (`ALTER TABLE identity.users ADD COLUMN display_name text;`) — never an edit to the shipped
  `identity_init`/`identity_authz` migrations (Invariant 8; forward-only discipline).
- **RLS: unchanged.** The column rides the existing `identity.users` row policies; no new
  policy, no policy edit.
- **Anonymization:** joins the §C4 `deactivate_own_account` personal-field anonymization set
  (realized when that contract's write side lands; W2-IDN-6.1 scope note).

## 2. What does NOT change

- Every other Doc-6C artifact (tables, RLS, enums, seeds, CHK attestations) stands unchanged;
  the 43-slug catalog and `Doc-6C_Patch_v1.0.1` are untouched.
- No Prisma-model change beyond the 1:1 column addition in the same 6.1 change set.

## 3. Effect

`W2-IDN-6.1` is un-gated and realizes: the migration above · the Prisma column · `get_user`
projecting `display_name` (§C3 PassB:117) · `update_user_profile.v1` accepting it
(§C4 PassB:174, bounded per Doc-4A validation conventions). The `ESC-IDN-DISPLAYNAME` registry
row closes on this patch pair.

---
*Additive patch; the frozen base files are never edited in place. Authorized by the human owner
per CLAUDE.md §7/§8 (Option A ruling, 2026-07-09). Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
