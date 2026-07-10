# Doc-4M Additive Patch v1.0.2 — M5 Index Correction: Delegation Grant Rows (Editorial)

> **STATUS: EXECUTED — IN FORCE.** Approved by the human owner/Architecture Board 2026-07-10
> ("additive index-correction patch only; no semantic, state-machine, ownership, or business-rule
> changes" — all honored). Raised in the `BOARD-PACKET-IDN-4M-INDEX_v1.0.md` DECISION RECORD
> post-close note (2026-07-09), verified verbatim against the frozen base before raising.
> Precedent for class + mechanics: `Doc-4M_Patch_v1.0.1.md` / `Doc-6C_Patch_v1.0.1.md`.

| Field | Value |
|---|---|
| **Patches** | `Doc-4M_FROZEN_v1.0.md` (State Machine Contracts) — v1.0.1 → **v1.0.2** |
| **Class** | **Editorial index correction — additive patch.** No state, transition, workflow, business rule, ownership, or event is introduced. The M5 Delegation Grant rows are corrected to match the canonical machine Doc-4M itself binds (Doc-2 §5.10, through `Doc-2_Patch_v1.0.7`). No other Doc-4M section is touched. |
| **Authorized by** | Human owner/Architecture Board ruling, 2026-07-10 |
| **Correction procedure authority** | Doc-4M's own frozen text (:18/:34/:351) — "the frozen source governs — this index is corrected, never the frozen corpus. The canonical state machines remain **Doc-2 §5**." |
| **Frozen text** | `Doc-4M_FROZEN_v1.0.md` is NOT edited in place. This patch is the corrective overlay; on any conflict between this patch and the base M5 rows below, **this patch governs the row text; Doc-2 §5.10 (as patched) governs the machine** (untouched). |

## 1. The corrections

Canonical source, re-read verbatim (`Doc-2_Domain_Model_And_Database_Blueprint_v1.0.2.md` §5.10
:584-588, through `Doc-2_Patch_v1.0.7`):

```
draft ──grant [granted_by must hold authority in controlling org]──▶ active
active ──suspend──▶ suspended ──reinstate [only while valid_to has NOT passed]──▶ active
active|suspended ──revoke──▶ revoked
active|suspended ──valid_to passes──▶ expired        (suspended-source edge per Patch v1.0.7)
```
States: `draft / active / suspended / revoked / expired` — **no `pending` state exists in §5.10.**

### Delegation Grant block (M5 rows :166–168)

| Base row (unedited) | Was | **Is (per this patch)** | Defect class |
|---|---|---|---|
| :166 | `pending` → `active` — User (delegatee accepts) | `draft` → `active` — Controlling org (grant; `granted_by` must hold authority in the controlling org) — Doc-2 §5.10; Doc-4C (FROZEN) | Nonexistent state (`pending`) + misattributed trigger (§5.10 grants are issued by the **controlling org**, not accepted by a delegatee) |
| :167 | `active` → `revoked` — User (grantor revokes) / System (scope expiry) | `active` / `suspended` → `revoked` — Controlling org (revoke; terminal) — Doc-2 §5.10 (:586) | Omitted suspended-source leg; "System (scope expiry)" conflated revocation with expiry — expiry is its own edge (:168) |
| :168 | `active` → `expired` — System (TTL expiry) | `active` / `suspended` → `expired` — System (`valid_to` passes; terminal) — Doc-2 §5.10 (:587) + `Doc-2_Patch_v1.0.7` | Omitted suspended-source leg (the v1.0.7-resolved boundary) |
| *(new row)* | *(absent)* | `active` → `suspended` — Controlling org (suspend) — Doc-2 §5.10 (:585) | Omitted edge |
| *(new row)* | *(absent)* | `suspended` → `active` — Controlling org (reinstate — only while non-expired) — Doc-2 §5.10 (:585) + `Doc-2_Patch_v1.0.7` | Omitted edge |

Trigger-authority cells follow §5.10's dual-party rule verbatim ("only the **controlling
organization** may create, suspend, revoke, or renew", :590) — this patch attributes nothing the
corpus does not.

## 2. What does NOT change

- **Doc-2 §5.10 (as patched) is untouched and remains the sole canonical machine.** This patch
  corrects index rows, never the machine.
- Every other M5 block and every other Doc-4M section stands unchanged; the v1.0.1 corrections
  (Organization + Membership) stand. The two frozen-vs-frozen siblings (`ESC-7G-LEAD-MACHINE`,
  `ESC-JRN-TKT-MACHINE`) remain out of scope and unprejudiced.
- No schema, code, contract, event, audit action, or POLICY key is affected. The realized
  W2-IDN-4 machine was built from Doc-2 §5.10 verbatim (RV-0149, twice re-derived) — **zero
  implementation impact**; the §5.10-boundary code changes are `Doc-2_Patch_v1.0.7`'s (realized
  at W2-IDN-6.5), not this index correction's.

## 3. Effect

Doc-4M advances v1.0.1 → v1.0.2. The next reader of M5's Delegation Grant block sees the
canonical §5.10 edge set including the v1.0.7-resolved boundary.

---
*Additive patch; the frozen base file is never edited in place. Approved by the human owner per
CLAUDE.md §7/§8 and Doc-4M's own correction procedure (ruling 2026-07-10). Registered in
`generatedDocs/00_AUTHORITY_MAP.md`.*
