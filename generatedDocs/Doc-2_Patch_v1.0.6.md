# Doc-2 Additive Patch v1.0.6 (PATCH-D2-05) — `identity.users.display_name` Realization

| Field | Value |
|---|---|
| **Patches** | Doc-2 (Domain Model & Database Blueprint) — FROZEN v1.0.5 → **v1.0.6** |
| **Class** | **Additive column realization.** One nullable personal-data column on one table. No state, event, permission, signal, contract, or ownership change. No existing column altered. |
| **Authorized by** | Human owner/Board ruling, 2026-07-09 — `ESC-IDN-DISPLAYNAME` **Option A** (decision packet: `governanceReviews/BOARD-PACKET-IDN-DISPLAYNAME_v1.0.md`) |
| **Raised by** | Review-A at RV-0148 (MINOR-4), 2026-07-09 — Doc-4C §C3/§C4 promise a `display_name` field the data corpus does not carry |
| **Frozen text** | The Doc-2 base file is NOT edited. This patch is the corrective overlay; it makes the data corpus conform to the already-frozen Doc-4C contract surface. |
| **Linked pair** | `Doc-6C_Patch_v1.0.2.md` (DDL realization), folded together |

## 1. The addition

**Doc-2 §10.2, row `identity.users` (line ~717):** the field list gains **`display_name`**,
reading (per this patch):

> `email UNIQUE WHERE deleted_at IS NULL`, `phone, password(auth-managed), two_fa, status,
> preferences_jsonb, `**`display_name`**

## 2. Semantics (ruled with Option A — the minimal reading of the frozen contract surface)

- **`display_name`** = the user's **optional, user-chosen presentation name** (nullable text).
- **Personal data** — falls under the `identity.users` row's existing "YES (anonymize on
  departure)" disposition; anonymized with the rest of the user's personal fields on account
  deactivation (Doc-4C §C4 `deactivate_own_account` anonymization, PassB:209).
- **Presentation-only, never an identifier**: no uniqueness, no auth linkage, no participation
  in any resolution/matching/governance path. Content ≠ Presentation (Golden Rule 4) holds —
  this is content the user owns about themself.
- **Written** only via `identity.update_user_profile.v1` (self-scope; Doc-4C §C4 PassB:174,
  `string : optional : bounded` — wire bound per the Doc-4A validation conventions, realized at
  W2-IDN-6.1). **Projected** in `identity.get_user` (§C3 PassB:117).

## 3. What does NOT change

- Every other Doc-2 §10.2 field, table, and disposition stands unchanged.
- Doc-4C is untouched — it already carries the field; this patch makes the data corpus conform
  to it (Option A's direction).
- No governance signal, no new contract, no audit action (the existing §C4 update-profile audit
  covers the field as part of old/new value serialization).

## 4. Effect

`W2-IDN-6.1` is **un-gated**: it realizes the column (forward-only migration per
`Doc-6C_Patch_v1.0.2.md`), serves it in the `get_user` projection, and accepts it on the
`update_user_profile.v1` wire — exactly as Doc-4C §C3/§C4 froze. The W2-IDN-3 `get_user`
comment anchored to `ESC-IDN-DISPLAYNAME` is resolved at 6.1.

---
*Additive patch; the frozen base files are never edited in place. Authorized by the human owner
per CLAUDE.md §7/§8 (Option A ruling, 2026-07-09). Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
