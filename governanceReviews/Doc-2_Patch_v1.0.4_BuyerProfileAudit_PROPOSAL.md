# Doc-2_Patch_v1.0.4_BuyerProfileAudit_PROPOSAL.md

> **✅ FOLDED (2026-06-30).** APPROVED (Board ruling) and folded into the corpus as the authoritative copy
> `generatedDocs/Doc-2_Patch_v1.0.4.md` (registered in `00_AUTHORITY_MAP.md`). Retained here as provenance; the
> corpus copy is authoritative.

> **✅ STATUS: DRAFT — PROPOSED ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-2 is **rank-0 frozen
> architecture** (CLAUDE.md §7 — immutable to skills); changing it requires an **additive architecture
> patch with HUMAN approval — never a skill decision.** This file is a PROPOSAL in `governanceReviews/`;
> it is **NOT** folded into the frozen corpus by any AI action. On approval, a human folds it as
> `generatedDocs/Doc-2_Patch_v1.0.4.md` (producing Doc-2 v1.0.4) and registers it in `00_AUTHORITY_MAP.md`.
>
> **Board ruling (2026-06-30): APPROVED WITH ONE MODIFICATION** — Doc-2 carries **business semantics only**;
> the wire-level audit **token** realization is moved **out of Doc-2** into the Doc-4C realization patch
> (companion: `Doc-4C_Patch_…_BuyerProfileAuditToken_PROPOSAL.md`). This revision applies that ruling.

## Status

Proposed Patch (DRAFT — awaits human approval)

| Field | Value |
|---|---|
| Applies to | `Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` (+ `Doc-2_Patch_v1.0.3`) |
| Produces | Doc-2 **v1.0.4** (v1.0.3 + this patch) |
| Scope | **Two additive business audit actions** in §9 Audit Mapping (Organization domain) — **nothing else.** No entity changes, no ownership changes, no schema changes, no event-catalog changes, no state-machine changes, no slug/permission changes, **and no wire-level token/serialization** (that is the Doc-4C realization patch's remit, per the Board ruling). |
| Purpose | **Resolve `[ESC-IDN-AUDIT]` for `identity.upsert_buyer_profile.v1`** (Doc-4C §C10) at the **business-semantic** layer: Doc-2 §9 enumerates **no** buyer-profile-change audit action, so the M1 buyer-profile write (D7) could not record a **canonical** business action in the immutable audit ledger. This patch enumerates the two business actions so the ledger is **semantically correct from the first persisted row.** |
| Raised by | Board Sprint follow-on — D7 (M1 buyer-profile write) prerequisite; owner-directed (2026-06-30): "the audit action must be canonical from the first persisted row," and "Doc-2 defines business actions; serialization belongs to Doc-4/Doc-6." |
| Authority | CLAUDE.md §7 (authority order; Doc-2 = rank 0), §8 (architecture-affecting → **human approval**), §11 (additive only; never edit a frozen doc in place), §13; Doc-2 §9 (Audit Mapping); Doc-4C §C10 + `[ESC-IDN-AUDIT]` (the gap this resolves at the business layer); Doc-4B `core.append_audit_record.v1` (the append primitive, unchanged). |

All frozen architecture decisions, aggregate boundaries, ownership rules, tenancy rules, the §9 field set, and the
`core.append_audit_record.v1` primitive are **preserved**. The freeze on Doc-2 remains in force; this patch is the
minimal additive exception, routed through change management (human approval), mirroring the lifecycle used for ADR-021
and the Doc-6B audit-RLS patch.

---

# PATCH-D2-03 — Buyer-Profile Audit Actions (resolves `[ESC-IDN-AUDIT]` for `upsert_buyer_profile`, business layer)

**Location:** §9 Audit Mapping — the **Organization** domain row of the "Actions that MUST create audit records" table.

**Rationale for the Organization domain:** `buyer_profiles` is owned by the **Organization** aggregate root (Doc-2
aggregate map — "Organization | `organizations` (AR) | `memberships`, `organization_workflow_settings`,
`buyer_profiles`"). A buyer-profile change is therefore an Organization-domain audit event. This is the **canonical
home** the `[ESC-IDN-AUDIT]` interim already pointed to "by pointer"; this patch makes it explicit and enumerated.

**Exact additive change** — append **two** business actions to the Organization domain's MUST-audit action list,
preserving the §9 style that already separates `create` from `…change` (Board ruling — create and update are
materially different events; record what actually happened):

```
buyer profile create, buyer profile update
```

**Layer boundary (Board ruling).** Doc-2 enumerates **only the business actions** ("buyer profile create", "buyer
profile update"). The **wire-level realization** — the serialized `action` token strings, `entity_type`, and the
`old_value`/`new_value` mapping — is **NOT** specified here; it is owned by the **Doc-4C realization patch**
(`Doc-4C_Patch_…_BuyerProfileAuditToken_PROPOSAL.md`), so a future change to *serialization* touches Doc-4C, never
reopens rank-0 Doc-2.

**Rules (business-semantic):**

- **Audited in the SAME transaction** as the buyer-profile write, via `core.append_audit_record.v1` **only** (Doc-4B
  §A10 / §17.1) — atomic with the business write (realized on the now-proven `audit_records_context_append` RLS path,
  ESC-W2-AUDIT-RLS = R-b / ADR-021). Create and update are **distinct** audit actions (the command records whichever
  leg it executed).
- **Actor:** the acting **User** (Doc-2 §9 governance label `actor_type[User|…]`). Attribution is the standard §9 field
  set (`audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value,
  timestamp, ip_address, user_agent`) — unchanged.
- **No event coined:** Doc-2 §8 posture intact — `upsert_buyer_profile` emits **no** domain event (Doc-4C §C10:
  `Events: none`); the audit record is the compliance record.
- **Scope boundary — only buyer-profile:** this patch resolves `[ESC-IDN-AUDIT]` **for `upsert_buyer_profile` only.**
  The other identity contracts carrying `[ESC-IDN-AUDIT]` (`update_organization_profile`, `activate_membership`,
  `deactivate_own_account`, `set_user_account_status`, `update_user_2fa_settings`, `set_organization_status`,
  `expire_delegation_grant`) **remain on their interim binding** and are **out of scope** here (a future, separate §9
  additive — kept small per owner direction). This patch coins **two** business audit actions, nothing more.

---

# Resulting §9 Organization domain row (full replacement)

Before:

```
| Organization | create, membership invite/accept/suspend/remove, role/permission change, ownership change/succession, workflow settings change, subscription change, soft delete/restore |
```

After:

```
| Organization | create, membership invite/accept/suspend/remove, role/permission change, ownership change/succession, workflow settings change, subscription change, buyer profile create, buyer profile update, soft delete/restore |
```

(Every other §9 domain row is unchanged. The §9 preamble, field set, and redaction rule are unchanged.)

---

# Downstream resolution (recorded, not edited here)

- **Doc-4C realization patch (companion):** pins the **serialized realization** of these two business actions — the
  `action` token strings, `entity_type`, and `old_value`/`new_value` mapping — for `upsert_buyer_profile` §C10. The
  token literals are owned **there** (Doc-4 realization), not in Doc-2 (Board ruling).
- **Doc-4C §C10 (`upsert_buyer_profile`):** its `[ESC-IDN-AUDIT]` audit marker is **resolved by pointer** — the
  business action is now a canonical §9 enumeration (this patch) and its serialization is pinned in the Doc-4C
  realization patch. Doc-4C's frozen text is **not edited in place**; the resolution is recorded. The contract's other
  markers (`[ESC-IDN-SLUG]`, `[ESC-IDN-BUYERPROFILE-CODE]`, `[DC-5]`) are **unaffected** and remain interim.
- **D7 (M1 buyer-profile write):** implements `upsert_buyer_profile` against the **exported audit-action constants**
  (sourced from the Doc-4C-pinned tokens) — never hardcoded literals — so the audited write ships with a canonical
  Doc-2 §9 business action from row one.

---

*End of Doc-2_Patch_v1.0.4 (PROPOSED) — minimal additive §9 enumeration of the **two business** buyer-profile audit
actions; resolves `[ESC-IDN-AUDIT]` for `upsert_buyer_profile` only at the business-semantic layer; coins two business
actions, no token/serialization, no event, no slug, no schema/ownership/state change. Serialization is the Doc-4C
realization patch's remit (Board ruling). Downstream: Doc-4C §C10 (marker resolved by pointer + token realization),
Doc-4B `core.append_audit_record.v1` (unchanged), D7 (exported action constants). **DRAFT — awaits HUMAN approval; not
folded by AI.***
