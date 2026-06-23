# Doc-4J_PassA_Part1_Patch_v1.0 — Corrective Pass-A Patch (Module-8 Admin Operations, Part 1 — BC-ADM-1/2/3)

| Field | Value |
|---|---|
| Document | Doc-4J_PassA_Part1_Patch_v1.0 — corrective patch for `Doc-4J_PassA_Part1_Content_v1.0` |
| Nature | **Pass-A patch only.** Applies the accepted findings **F4J-PA1-M1 (MINOR)** and **F4J-PA1-N1 (NITPICK)**. Minimal, clarification/correction only. Not a redesign. |
| Applies to | `Doc-4J_PassA_Part1_Content_v1.0.md` |
| Finding source | `Doc-4J_PassA_Part1_Independent_Hard_Review_v1.0` (PASS WITH PATCH; Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 · NITPICK = 1) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | `admin.expire_ban.v1` (J2A-3, BC-ADM-2) · J-A5 (Audit Surface, Ban-expire row). No other contract changed. |
| Preserved unchanged | BC inventory, aggregate inventory, ownership, dependencies, authorization, slug usage, **event ownership (`VendorBanned` sole Admin event)**, procurement moat, trust firewall, error model, structure, and the BC-ADM-3 authorization resolution (category → `staff_can_manage_categories`; missing-vendor → `[ESC-ADM-SLUG]`; link → `[ESC-ADM-SLUG]`). |

---

## Executive Summary

Patched findings:

- **F4J-PA1-M1 (MINOR)** — BC-ADM-2 Ban Action lifecycle inconsistency: `admin.expire_ban.v1` allowed `active → expired` and `lifted → expired`, contradicting the aggregate definition (J2A-2: `active → lifted → expired`). **Resolution: Option B** per Doc-2 §3.9 (the frozen lifecycle is exactly `active → lifted → expired`) — `expire_ban.v1` is restricted to **`lifted → expired`** only. The document now contains one Ban Action lifecycle. *(J2A-2, J-A9, and the end-note already state `active → lifted → expired` and need no change; only the `expire_ban.v1` contract is corrected to align.)*
- **F4J-PA1-N1 (NITPICK)** — `admin.expire_ban.v1` audit binding was dual-option ("§9 ‘ban issue/lift’ by pointer OR `[ESC-ADM-AUDIT]`"). **Resolution: Option B** — Doc-2 §9 Admin enumerates "**ban issue/lift**" and does **not** separately enumerate ban expiry; per the Doc-4I `[ESC-BILL-AUDIT]` precedent (F4I-PA-M2, subscription expiry), the binding is **`[ESC-ADM-AUDIT]`** (nearest §9 action by pointer; no action invented). Single binding in `expire_ban.v1` and J-A5.

---

## Patch 1

**Finding:** F4J-PA1-M1 (MINOR) — BC-ADM-2 Ban Action lifecycle inconsistency (J2A-2 vs `admin.expire_ban.v1`).

**Original Text** (`admin.expire_ban.v1`, J2A-3)
```
- **Purpose:** expire a ban at the end of its window (`active → expired` / `lifted → expired`). **Owning BC:** BC-ADM-2. **Aggregate:** Ban Action. **Permission family:** none (System; expiry job). **Lifecycle:** `→ expired` (Doc-2 §3.9). **Audit:** §9 Admin ("ban issue/lift" — expiry by pointer) / `[ESC-ADM-AUDIT]` if expiry is not covered by the §9 enumeration (nearest by pointer; no action invented). **Events:** none. **Cross-Module:** Marketplace (DR-ADM-MKT); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
```

**Replacement Text**
```
- **Purpose:** expire a lifted ban at the end of its window (`lifted → expired`). **Owning BC:** BC-ADM-2. **Aggregate:** Ban Action. **Permission family:** none (System; expiry job). **Lifecycle:** `lifted → expired` (Doc-2 §3.9 — the frozen `ban_actions` lifecycle is `active → lifted → expired`; expiry fires only from `lifted`; forbidden from any other source → `STATE`). **Audit:** **`[ESC-ADM-AUDIT]`** (Doc-2 §9 Admin enumerates "ban issue/lift"; ban **expiry** is not separately enumerated — nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented). **Events:** none. **Cross-Module:** Marketplace (DR-ADM-MKT); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
```

**Rationale.** Doc-2 §3.9 (the frozen lifecycle authority) states the `ban_actions` machine as exactly **`active → lifted → expired`** — a linear chain in which `expired` is reachable only from `lifted`. The aggregate definition (J2A-2), the AI-agent notes (J-A9), and the end-note already state this correctly; the only inconsistency was `expire_ban.v1` allowing `active → expired`. Restricting `expire_ban.v1` to `lifted → expired` (Option B) makes the document contain exactly one Ban Action lifecycle, matching Doc-2 §3.9 verbatim. No state invented, no lifecycle invented, no structural change — wording only, isolated to BC-ADM-2. *(This change also resolves F4J-PA1-N1 in the same line — see Patch 2.)*

---

## Patch 2

**Finding:** F4J-PA1-N1 (NITPICK) — `admin.expire_ban.v1` audit binding dual-option (also echoed in J-A5).

*(The `expire_ban.v1` audit binding is corrected in Patch 1's replacement text above — from the dual-option wording to the single `[ESC-ADM-AUDIT]` binding. Patch 2 applies the same single binding to the J-A5 Audit Surface consolidation row.)*

**Original Text** (J-A5 Audit Surface, Ban-expire row)
```
| Ban expire (BC-ADM-2, System) | "ban issue/lift" by pointer (or `[ESC-ADM-AUDIT]` if expiry unenumerated; no action invented) | Admin | yes |
```

**Replacement Text**
```
| Ban expire (BC-ADM-2, System) | **`[ESC-ADM-AUDIT]`** (Doc-2 §9 Admin enumerates "ban issue/lift"; ban expiry is not separately enumerated — nearest §9 action by pointer; §9 additive; no action invented) | Admin | yes |
```

**Rationale.** Doc-2 §9's Admin audit domain enumerates "**ban issue/lift**" — issuance and lifting, not expiry. Ban expiry is therefore not separately enumerated, exactly as subscription expiry was not enumerated under the §9 Financial domain's "purchase/renewal/cancel" in Doc-4I (resolved to `[ESC-BILL-AUDIT]` per F4I-PA-M2). Applying that precedent, the corpus-faithful binding for ban expiry is **`[ESC-ADM-AUDIT]`** (the Doc-2 §9-additive marker, nearest action by pointer). The dual-option wording is removed from both `expire_ban.v1` (Patch 1) and J-A5 (here); the binding is now stated definitively and consistently. No audit action invented; no other §9 binding changed (issue/lift, moderation, category, suggestion, link all remain named §9 pointers).

---

## Regression Review

| Surface | Result |
|---|---|
| BC inventory | UNCHANGED (BC-ADM-1 Moderation · BC-ADM-2 Enforcement · BC-ADM-3 Suggestions) |
| Aggregate inventory | UNCHANGED (Moderation Case · Ban Action · Suggestion [one aggregate, three roots, one BC]) |
| Ownership | UNCHANGED — Admin owns `ban_actions`; the vendor-status reflection remains Marketplace's; no aggregate moved/split. |
| Dependencies | UNCHANGED — DR-ADM-1/RFQ/MKT/OPS/PC carried as before (`expire_ban` still DR-ADM-MKT + DR-ADM-PC). |
| Authorization | UNCHANGED — `staff_can_moderate_rfq` / `staff_can_ban` / `staff_can_manage_categories` (category-suggestion decisions ONLY) + `[ESC-ADM-SLUG]` (missing-vendor + link); `expire_ban` remains System (no slug). No slug invented. |
| Event ownership | UNCHANGED — **`VendorBanned` is the sole Admin-owned Doc-2 §8 event** (BC-ADM-2, `issue_ban`); `expire_ban` emits none; no event added. |
| Procurement moat | UNCHANGED — no matching/routing/ranking/supplier-selection/award/eligibility decision introduced. |
| Trust firewall | UNCHANGED — no Trust/Performance/Verification/Governance score or verification record introduced. |
| AI-agent governance | UNCHANGED — J-A9 already states `active → lifted → expired` and is now fully consistent with `expire_ban.v1`; ownership/authorization/event/moat/firewall/non-disclosure notes unmodified. |

Additional invariants confirmed: error model unchanged (`STATE ≠ CONFLICT`, `REFERENCE ≠ DEPENDENCY` preserved; the `lifted → expired` restriction adds a `STATE` guard on forbidden sources, consistent with the existing error model); the BC-ADM-3 authorization resolution (category → `staff_can_manage_categories`; missing-vendor → `[ESC-ADM-SLUG]`; link → `[ESC-ADM-SLUG]`) is untouched; non-disclosure (link content never vendor-visible) untouched; lifecycle drift is confined to BC-ADM-2 (Ban Action) and only removes the spurious `active → expired` path to match Doc-2 §3.9. Sections edited = `admin.expire_ban.v1` and J-A5 only.

---

## Patch Status

```text
F4J-PA1-M1 = RESOLVED   (Ban Action lifecycle = active → lifted → expired only; expire_ban.v1 restricted to lifted → expired; Doc-2 §3.9 Option B; one lifecycle, no ambiguity)
F4J-PA1-N1 = RESOLVED   (expire_ban.v1 + J-A5 audit = [ESC-ADM-AUDIT]; single binding; Doc-2 §9 "ban issue/lift" does not enumerate expiry; Doc-4I [ESC-BILL-AUDIT] precedent; no action invented)
```

```text
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Patch Verification)
```

---

*End of Doc-4J_PassA_Part1_Patch_v1.0. Pass-A patch only — applies F4J-PA1-M1 (`ban_actions` lifecycle made deterministic per Doc-2 §3.9: `active → lifted → expired`; `expire_ban.v1` restricted to `lifted → expired`) and F4J-PA1-N1 (`expire_ban.v1` + J-A5 audit binding = `[ESC-ADM-AUDIT]`, single option; Doc-2 §9 does not enumerate ban expiry; Doc-4I `[ESC-BILL-AUDIT]` precedent). Minimal, clarification/correction only; sections `admin.expire_ban.v1` / J-A5 only. No redesign; BC inventory, aggregate inventory, ownership, dependencies, authorization, slug usage, event ownership (`VendorBanned` sole Admin event), procurement moat, trust firewall, error model, structure, and the BC-ADM-3 authorization resolution all preserved; no new contract/state/event/permission/audit-action. Authorized next stage: Patch Verification → Part 2 → Pass-A FROZEN → Pass-B.*
