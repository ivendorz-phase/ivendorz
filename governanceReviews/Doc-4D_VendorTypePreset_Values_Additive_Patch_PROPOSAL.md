# Doc-4D_VendorTypePreset_Values_Additive_Patch_PROPOSAL.md

> **STATUS: DRAFT — PROPOSED ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-4D is **rank-0 frozen
> architecture** (`CLAUDE.md §7` — immutable to skills); changing it requires an **additive architecture
> patch with HUMAN approval — never a skill decision.** This file is a PROPOSAL in `governanceReviews/`;
> it is **NOT** folded into the frozen corpus by any AI action. On approval, a human folds it as
> `generatedDocs/Doc-4D_VendorTypePreset_Values_Patch_v1.0.1.md` and registers it in `00_AUTHORITY_MAP.md`.
> Realizes `ADR-023` §2 · `CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` C-2. Resolves `ESC-MKT-VENDORTYPE`.

## Status

| Field | Value |
|---|---|
| Applies to | `Doc-4D_Structure_v1.0_FROZEN.md` + `Doc-4D_Content_v1.0_PassB_VendorProfile.md` / `…_Discovery.md` |
| Produces | Doc-4D **v1.0.1** (v1.0 + this patch) |
| Scope | **Defines the allowed *value set* of the already-frozen `vendor_type_preset` field** as Business Classification metadata — **nothing else.** No new field, no new contract, no ownership change, no state/event change, **no capability-matrix change**, **no DB DDL change** (the `marketplace.vendor_profiles.vendor_type_preset` column is already `text`, `Doc-6D Pass1` L70). |
| Purpose | The corpus declares `vendor_type_preset : enum : optional` (`Doc-4D …VendorProfile §B`) and already exposes it as a discovery **filter** (`Doc-4D …Discovery §B.6`), but **enumerates no values**. This patch pins the value set so vendors can self-describe (Manufacturer/Supplier/…) for search/filter/analytics **without touching the capability matrix**. |
| Authority | `CLAUDE.md §7/§8/§11/§13`; Invariant #1 (matrix authoritative); `Doc-6D Pass1 L88 MK-CR4` ("`vendor_type_preset` is a UI preset label, not the capability source of truth"). |

All frozen decisions, aggregate boundaries, ownership, and the capability matrix are **preserved**.

---

# PATCH-4D-VTP-01 — `vendor_type_preset` value set (Business Classification metadata)

**Allowed values (Classification Schema v1.0):**

```
manufacturer, supplier_distributor, importer, fabricator, epc_contractor, engineering_consultant, other
```

**Reserved for a later schema version (documented, not yet valid):** `oem`, `dealer`,
`system_integrator`, `authorized_service_partner`. Adding any reserved value later bumps the
Classification Schema Version (ADR-023 §7) via a follow-on additive patch.

**Binding rules:**

- **Metadata, never authoritative for capability.** `vendor_type_preset` remains a UI/discovery preset
  label. Vendor capability is and stays the four booleans `can_supply`/`can_service`/`can_fabricate`/
  `can_consult` (Invariant #1). The preset is **not** derived from the flags and **must not** override
  them.
- **Matching boundary.** This field is **not** a Phase-A eligibility gate. *"Business Type metadata is
  available to the matching engine as an optional ranking signal. Whether and how it influences ranking
  is determined exclusively by M3 matching policies approved by the Architecture Board."* No M3 change is
  authorized by this patch (see `MATCHING-ENGINE-RECONCILIATION_v1.0.md`).
- **Optional & multi-reality.** The field stays `optional`. A company with several identities selects the
  primary preset; its full capability is expressed by the (independent) capability flags and category
  assignments. (A future multi-select "commercial capability" set is a **separate** net-new proposal —
  `ESC-MKT-VENDORTYPE`/discovery facets — not coined here.)
- **Firewall.** No governance-signal read/write; no payment/plan coupling (Invariant #6/#10, §4).

**Realization layer:** the value set is enforced at the **contract/validation layer** (`Doc-4D`
create/update `vendor_type_preset : enum`) and in the discovery filter allowlist (`§B.6`). **No Doc-6D
DDL change is required** — the column is already `text`; an optional DB `CHECK` is **deferred** (recorded,
not coined) so this patch touches no frozen schema.

---

# Appendix A — Business Type → default Capability crosswalk (A7, **suggestion-only**)

Onboarding convenience: when a vendor picks a preset, the UI **pre-checks** the suggested capability
flags; the vendor may change any of them. This is **not** a runtime derivation and **not** a reverse
mapping — the flags remain the source of truth (Invariant #1).

| Business Type (preset) | Suggested default capability flags |
|---|---|
| manufacturer | can_supply, can_fabricate |
| supplier_distributor | can_supply |
| importer | can_supply |
| fabricator | can_fabricate, can_supply |
| epc_contractor | can_supply, can_service |
| engineering_consultant | can_consult |
| other | (none pre-checked) |

*End of Doc-4D_VendorTypePreset_Values_Patch_v1.0.1 (PROPOSED) — defines the `vendor_type_preset` value
set as metadata; no field/contract/DDL/ownership/matrix change; suggestion-only crosswalk. DRAFT — awaits
HUMAN approval; not folded by AI.*
