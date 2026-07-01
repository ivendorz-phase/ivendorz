# Doc-2_BuyerTypeClassification_Additive_Patch_PROPOSAL.md

> **STATUS: DRAFT — PROPOSED ADDITIVE PATCH; AWAITS HUMAN APPROVAL.** Doc-2 is **rank-0 frozen
> architecture** (`CLAUDE.md §7` — immutable to skills); changing it requires an **additive architecture
> patch with HUMAN approval — never a skill decision.** This file is a PROPOSAL in `governanceReviews/`;
> it is **NOT** folded by any AI action. On approval, a human folds it as `generatedDocs/Doc-2_Patch_v1.0.5.md`
> (producing Doc-2 v1.0.5) with the linked-pair `Doc-6C` realization, and registers both in `00_AUTHORITY_MAP.md`.
> Realizes `ADR-023` §3 · `CLASSIFICATION-DECISION-RECONCILIATION_v1.0.md` C-5. Resolves `ESC-IDN-BUYERTYPE`.

## Status

| Field | Value |
|---|---|
| Applies to | `Doc-2_Domain_Model_And_Database_Blueprint` (v1.0.4) §10.2 identity; realized in `Doc-6C` (M1 `identity` schema) |
| Produces | Doc-2 **v1.0.5** (+ linked `Doc-6C` additive realization patch) |
| Scope | **One additive optional attribute `buyer_type` on `identity.buyer_profiles`** as Buyer Classification metadata — **nothing else.** No change to `organizations`; no new aggregate; no ownership/state/event change; no matching input. |
| Purpose | Buyers need a segmentation label (Factory/Hospital/Government/…). The corpus has **no** org-type field by design (**Invariant #2** — "organizations participate, they don't type", `Master …FINAL §3`). This patch adds the label at the **profile** level, which is Invariant-#2-safe: participation/segmentation is a property of the org's *profiles*, not its *type*. |
| Authority | `CLAUDE.md §7/§8/§11/§13`; Invariant #2; Doc-2 §10.2 (identity); `Doc-6C` (buyer_profiles is one of the 9 identity tables). |

Invariant #2, the participation model, and all `organizations` attributes are **preserved**.

---

# PATCH-D2-05 — Buyer Type on `buyer_profiles`

**Location:** §10.2 identity schema — the `buyer_profiles` attribute list (which already carries
`industry`, `factory_info_jsonb`, `delivery_locations_jsonb`, `procurement_preferences_jsonb`).

**Additive attribute:**

```
buyer_type   (optional) — Buyer Classification metadata
```

**Allowed values (Classification Schema v1.0):**

```
factory, hospital, commercial_building, government, utility, real_estate_developer,
epc_company, trading_company, university, hotel, ngo, other
```

**Reserved for a later schema version (documented, not yet valid):** buyer **Procurement Maturity**
(occasional / regular / enterprise / group) — a *separate* future attribute, not part of this patch
(see `../productSpec/BUYER-PROFILE-MODEL.md` and `ESC-IDN-BUYERTYPE`).

**Binding rules:**

- **On `buyer_profiles`, never `organizations`.** Preserves Invariant #2. An org with both buyer and
  vendor profiles carries `buyer_type` only on its buyer profile.
- **Metadata only.** Used for search/analytics/reporting; **not** a matching input (buyer-side facts do
  not gate/rank vendors; Classification Governance Matrix). Ranking use, if ever, is an M3/Board decision.
- **Optional.** No backfill required; absent = unclassified.
- **Firewall.** No governance-signal coupling; no payment/plan coupling (Invariant #6/#10).
- **Open-vs-closed enum:** proposed as a **closed enum** for v1 (above). If the Board prefers an
  admin-managed open list, that is a one-line ruling recorded here; default recommendation = closed.

---

# Linked realization (recorded, not edited here)

- **`Doc-6C` additive realization patch (companion, human-folded on approval):** adds the `buyer_type`
  column (`text`, nullable) to `identity.buyer_profiles` DDL + Prisma; no RLS change (same org-anchor as
  the rest of the profile); no new POLICY key.
- **`Doc-4C` (M1 identity API):** `buyer_type` becomes an optional field on the existing
  `upsert_buyer_profile` request/response contract (resolved by pointer on approval; frozen text not
  edited in place). No new contract.

*End of Doc-2_Patch_v1.0.5 (PROPOSED) — one additive optional `buyer_type` on `buyer_profiles`
(Invariant-#2-safe); metadata only, no matching input; closed enum (v1); no org/ownership/state/event
change. DRAFT — awaits HUMAN approval; not folded by AI.*
