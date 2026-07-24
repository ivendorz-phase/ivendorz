# Doc-4D_VendorTypePreset_Pointer_Patch_v1.0.5.md  (PATCH-4D-VTP-01)

> **✅ STATUS: PROPOSED — D2-10 forward-PR reconcile to `main` (2026-07-24).** Additive/editorial
> realization overlay to Doc-4D; the frozen Doc-4D content files are NOT edited (carried alongside, per
> the Doc-4D realization patch norm — v1.0.1/v1.0.2/v1.0.3/v1.0.4). Linked-pair with the in-force
> **`Doc-2_Patch_v1.0.12`** (PATCH-D2-11, this PR). On `vendor_type_preset` enum-declaration questions
> this patch governs. Reconciled from the branch fold `3e0cfa7`, where it was owner-approved 2026-07-22
> as `Doc-4D_VendorTypePreset_Pointer_Patch_v1.0.4`. **Identifier reassignment only** (§6 Renumber
> note); content unchanged.

## 1. Status

| Field | Value |
|---|---|
| Patch ID | **PATCH-4D-VTP-01** (unchanged — the `PATCH-4D-xx` axis does not collide on `main`; only the Doc-4D **version label** moves) |
| Patches | Doc-4D (M2 Marketplace API contracts) — effective **v1.0.4 → v1.0.5** |
| Class | **Editorial-additive — pointer only.** Supplies the missing `<source pointer>` on an enum declaration that `Doc-4A_Content_v1.0_Pass3.md:46` already requires. No wire field, projection, error code, actor leg, event or contract added, removed or reshaped. |
| Depends on | `Doc-2_Patch_v1.0.12` (value domain, PATCH-D2-11, this PR) — the pointer target `Doc-2 §10.3` must hold the six-member domain first (Doc-2-first sequencing, `Doc-4A_…_Pass5.md:243`). |
| Consumer obligation | Carries the `Doc-4A_…_Pass5.md:236` *"consumers declare tolerance"* declaration for the `search_catalog` `vendor_type_preset` filter (§3). |

## 2. Problem

`Doc-4A_Content_v1.0_Pass3.md:46` requires enum fields to be declared `enum(<source pointer>)`, the
pointer naming the owning corpus location. Three frozen Doc-4D declarations name `vendor_type_preset`
as `enum` **with no pointer**, because no owning value domain existed until `Doc-2_Patch_v1.0.12`
supplied it at Doc-2 §10.3:

| Declaration | Anchor (verbatim on disk 2026-07-22) |
|---|---|
| Vendor-profile **create** request | `Doc-4D_Content_v1.0_PassB_VendorProfile.md:19` — `vendor_type_preset : enum : optional` |
| Vendor-profile **update** request | `Doc-4D_Content_v1.0_PassB_VendorProfile.md:48` — `vendor_type_preset : enum : optional` |
| `search_catalog` **filter** | `Doc-4D_Content_v1.0_PassB_Discovery.md:20` — `filters : object{ … vendor_type_preset : enum }` |

## 3. Governed reading (overlay — Doc-4D content files NOT edited)

Each of the three declarations reads, under this overlay:

> `vendor_type_preset : enum(Doc-2 §10.3) : optional`

- **Pointer, not restatement.** The pointer names Doc-2 §10.3 as the owning location; the six values
  are **never restated** in the contract (`Doc-4A_…_Pass3.md:47` forbids a request contract defining or
  extending an enum — the earlier attempt to place the value set in a Doc-4D contract was rejected on
  exactly this rule, which is why the values live in Doc-2, not here).
- **Filter is additive with a tolerance obligation.** `Doc-4A_…_Pass5.md:236` classes a new optional
  enum value for a filter/sort parameter as **Additive**, requiring consumers to declare tolerance.
  `search_catalog`'s `vendor_type_preset` filter (`Doc-4D_…_PassB_Discovery.md:27` — allowlisted hard
  attribute) carries that tolerance: an unknown `vendor_type_preset` filter value is handled per the
  contract's standard optional-filter validation, not a hard error class change.
- **No wire change.** The wire field name, type, cardinality and casing are untouched — `enum` gains
  its mandated source pointer. Enum values remain lowercase `snake_case` (`Doc-4A_…_Pass1.md:172`).

## 4. Regression / firewall

No contract added/removed; no projection, error code, actor leg, event, permission or audit change; no
governance signal; no M3 change. One module, one owner (M2 contract, M2 doc). The change is the minimal
one Doc-4A already mandates.

## 5. Red Flag Checklist

No new module · no ownership change · no cross-module DB access · no cross-module FK · no import beyond
`contracts/` · no governance-signal touch · no ADR override · **no frozen document edited in place** —
overlay carried alongside, human-approval gated, folded by owner ruling (branch 2026-07-22, reconcile
2026-07-24).

## 6. Renumber note

*On branch* (`fe/account-referral-nav`, `3e0cfa7`): authored as **v1.0.4**, linked-pair with the
branch's `Doc-2_Patch_v1.0.13`. *Reconcile to `main`* (2026-07-24, D2-10 forward-PR): the Doc-4D
**version label** moves **v1.0.4 → v1.0.5**, because on `main` v1.0.4 is already occupied by
`Doc-4D_VendorSlugResolve_Patch_v1.0.4` (PATCH-4D-VSR-01, folded 2026-07-11); v1.0.5 is the next
verified-available Doc-4D label. The **patch ID `PATCH-4D-VTP-01` is unchanged** — the `PATCH-4D-xx`
axis does not collide. Linked pointer target updated `Doc-2_Patch_v1.0.13` → **`Doc-2_Patch_v1.0.12`**
(PATCH-D2-11) to match the reconciled Doc-2 label. **Identifier reassignment only; content unchanged.**

---

*End of Doc-4D_VendorTypePreset_Pointer_Patch_v1.0.5 (PATCH-4D-VTP-01) — adds the mandated
`(Doc-2 §10.3)` source pointer to the three `vendor_type_preset` enum declarations
(`PassB_VendorProfile:19,:48`; `PassB_Discovery:20`); pointer only, no value restated, no wire change;
carries the `Pass5:236` consumer-tolerance declaration for the `search_catalog` filter. Linked-pair
with `Doc-2_Patch_v1.0.12` (PATCH-D2-11), reconciled from branch v1.0.4 → v1.0.5 (Doc-4D label only;
patch ID unchanged).*
