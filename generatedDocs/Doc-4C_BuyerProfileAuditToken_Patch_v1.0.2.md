# Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2_PROPOSAL.md

> **✅ STATUS: APPROVED (human — Board ruling 2026-06-30) + FOLDED into the corpus.** This is the corpus copy
> `generatedDocs/Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2.md`, registered in `00_AUTHORITY_MAP.md`, carried
> **alongside** the unedited frozen `Doc-4C_Content_v1.0_PassB` — **no frozen file edited in place.** Origin/
> provenance: `governanceReviews/Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2_PROPOSAL.md`.
>
> **Companion to `Doc-2_Patch_v1.0.4` (business actions).** Per the Board ruling (2026-06-30): Doc-2 owns the
> **business semantics** ("buyer profile create" / "buyer profile update"); **this Doc-4C patch owns the
> wire-level realization** (the serialized `action` tokens, `entity_type`, and value mapping). A future change
> to *serialization* touches **this** patch, never reopens rank-0 Doc-2. **Linked-pair — frozen together.**

## Status

Approved Patch — FOLDED 2026-06-30 (human-approved, Board ruling)

| Field | Value |
|---|---|
| Applies to | `Doc-4C_Content_v1.0_PassB.md` §C10 (`identity.upsert_buyer_profile.v1`) (+ PassA/PassB patches v1.0.1) |
| Produces | Doc-4C realization addendum **v1.0.2** (resolves the `[ESC-IDN-AUDIT]` *realization* for buyer-profile) |
| Depends on | **`Doc-2_Patch_v1.0.4`** (the business actions "buyer profile create" / "buyer profile update" in §9 Organization). This patch realizes those two actions on the wire; the two are a **linked pair** (business + realization) and freeze together. |
| Scope | **Pin the serialized realization** of the two buyer-profile audit actions for `upsert_buyer_profile` §C10 — the `action` token strings, `entity_type`, `entity_id`, and `old_value`/`new_value` mapping — **nothing else.** No business-action change (Doc-2 v1.0.4 owns that), no contract request/response shape change, no slug/error-code/idempotency change, no event, no schema change. |
| Purpose | Give D7 a **frozen serialization constant** so the M1 buyer-profile write encodes canonical `action` tokens (imported as named constants, never hardcoded literals), with **business semantics (Doc-2) and serialization (Doc-4) cleanly separated** (Board ruling). Resolves the realization half of `[ESC-IDN-AUDIT]` on §C10. |
| Authority | CLAUDE.md §7/§8/§11/§13; Doc-2 §9 (business actions, via `Doc-2_Patch_v1.0.4`); Doc-4B `core.append_audit_record.v1` §A10/§17.1 (the append primitive + atomicity, unchanged); Doc-4C §C10 (the contract being realized); the realized `core.ActorType` enum (lowercase labels) + the `audit_records_context_append` RLS path (ESC-W2-AUDIT-RLS = R-b / ADR-021). |

Doc-4C **redefines no Doc-4B mechanism and re-implements nothing** (Appendix B posture preserved). The append stays
`core.append_audit_record.v1` only; this patch pins **which `action` string** that primitive receives for the
buyer-profile legs.

---

# PATCH-4C-BPAT-01 — Buyer-Profile Audit Token Realization (resolves `[ESC-IDN-AUDIT]` realization on §C10)

**Location:** §C10 `identity.upsert_buyer_profile.v1` — the **Audit (§B.8)** line (frozen text, line 682):

```
- **Audit (§B.8):** yes; Domain Organization (buyer-profile change) by pointer — **`[ESC-IDN-AUDIT]`** (not separately enumerated); attribution standard.
```

**Resolution (additive — the frozen line is not edited in place; this records its realization):** the
`[ESC-IDN-AUDIT]` interim is **resolved**. The business actions are now canonically enumerated in Doc-2 §9
(`Doc-2_Patch_v1.0.4`: "buyer profile create" / "buyer profile update"); their **wire-level realization** is pinned
here:

| Doc-2 §9 business action | `action` token (frozen) | `entity_type` | `entity_id` | `old_value` | `new_value` |
|---|---|---|---|---|---|
| buyer profile create | `buyer_profile_created` | `buyer_profile` | the new `buyer_profiles.id` | `null` | the created field set (industry, factory_info, delivery_locations, procurement_preferences) |
| buyer profile update | `buyer_profile_updated` | `buyer_profile` | the existing `buyer_profiles.id` | the prior field set | the new field set |

**Realization rules:**

- **Token convention:** snake_case `entity_action`, past tense (`buyer_profile_created` / `buyer_profile_updated`) —
  consistent with the corpus's snake_case structured codes (`rfq_correction_required`, `no_eligible_vendors_found`).
  Two tokens (not one `upserted`) so the **immutable** record distinguishes a create from an update (Board ruling —
  audit history reflects what actually happened).
- **Append path:** written via `core.append_audit_record.v1` **only** (Doc-4B §A10), **in the caller's transaction**
  (atomic with the business write — §17.1), on the proven `audit_records_context_append` RLS path. `actor_type` is the
  realized lowercase `core.ActorType` label **`'user'`**; `actor_id = app.user_id`, `organization_id = app.active_org`
  (the audit-RLS `WITH CHECK` admits exactly this row). `entity_id` = the `buyer_profile_id` returned by the contract.
- **Attribution:** the standard Doc-2 §9 field set (unchanged); `timestamp`/`ip_address`/`user_agent` per the append
  primitive's input.
- **Code binding (D7):** the M1 buyer-profile write imports these as **named constants** (e.g.
  `BUYER_PROFILE_CREATED` / `BUYER_PROFILE_UPDATED`, M1-owned per One-Module-One-Owner) and passes them to
  `appendAuditRecord` — **never a hardcoded string literal**. Changing the *serialization* later changes the constant +
  this patch, not Doc-2.

---

# Resulting §C10 Audit line (full replacement of the audit bullet)

Before (frozen):

```
- **Audit (§B.8):** yes; Domain Organization (buyer-profile change) by pointer — **`[ESC-IDN-AUDIT]`** (not separately enumerated); attribution standard.
```

After:

```
- **Audit (§B.8):** yes; Domain Organization, business actions "buyer profile create" / "buyer profile update" (Doc-2 §9 via Doc-2_Patch_v1.0.4); realized `action` tokens `buyer_profile_created` / `buyer_profile_updated`, `entity_type = buyer_profile` (this patch). [ESC-IDN-AUDIT] RESOLVED for buyer-profile. Attribution standard.
```

(The §C10 request/response/error/idempotency/slug lines are **unchanged**; `[ESC-IDN-SLUG]`,
`[ESC-IDN-BUYERPROFILE-CODE]`, and `[DC-5]` remain interim — out of scope.)

---

# Downstream

- **D7 (M1 buyer-profile write):** implements `upsert_buyer_profile` and, on the create leg, appends
  `buyer_profile_created`; on the update leg, `buyer_profile_updated` — via the exported M1 constants, in the same
  transaction as the write, through `appendAuditRecord`.
- **Other `[ESC-IDN-AUDIT]` contracts:** unaffected (still interim; future separate additive).

---

*End of Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2 (PROPOSED) — pins ONLY the wire-level serialization (tokens,
entity_type, value mapping) of the two Doc-2 v1.0.4 buyer-profile business audit actions for `upsert_buyer_profile`
§C10; resolves the realization half of `[ESC-IDN-AUDIT]` for buyer-profile. No business-action change, no contract-shape
change, no Doc-4B re-implementation, no event/slug/schema change. Linked-pair with `Doc-2_Patch_v1.0.4` (freeze
together). Frozen Doc-4C text not edited in place. **APPROVED & FOLDED into the corpus (human, Board ruling
2026-06-30); linked-pair with Doc-2_Patch_v1.0.4.***
