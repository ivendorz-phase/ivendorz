# Doc-4J_PassA_Part2_Patch_v1.0 — Corrective Pass-A Patch (Module-8 Admin Operations, Part 2 — BC-ADM-4/5/6)

| Field | Value |
|---|---|
| Document | Doc-4J_PassA_Part2_Patch_v1.0 — corrective patch for `Doc-4J_PassA_Part2_Content_v1.0` |
| Nature | **Pass-A patch only.** Applies the accepted finding **F4J-PA2-M1 (MINOR)**. Minimal, audit-wording correction only. Not a redesign. |
| Applies to | `Doc-4J_PassA_Part2_Content_v1.0.md` |
| Finding source | `Doc-4J_PassA_Part2_Independent_Hard_Review_v1.0` (PASS WITH PATCH; Open BLOCKER = 0 · MAJOR = 0 · MINOR = 1 · NITPICK = 0) |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs; on conflict **FLAG-AND-HALT** |
| Scope | `admin.queue_verification_task.v1` · `admin.assign_verification_task.v1` · `admin.decide_verification_task.v1` (J5A-3, BC-ADM-5) — **Audit field only**. No other contract or field changed. |
| Preserved unchanged | BC inventory, aggregate inventory, ownership, dependencies, authorization, slug usage, **lifecycles / state machines** (`import_jobs queued→processing→completed/failed`; `verification_tasks queued→in_review→decided`; `outreach_campaigns draft→running→completed`), **event governance (Produced = NONE for BC-ADM-4/5/6)**, procurement moat, trust firewall, error model, structure. |

---

## Executive Summary

Patched findings:

- **F4J-PA2-M1 (MINOR)** — the three BC-ADM-5 verification-workflow contracts (`queue_verification_task.v1`, `assign_verification_task.v1`, `decide_verification_task.v1`) carried a **dual audit binding** ("§9 Admin by pointer / `[ESC-ADM-AUDIT]`") instead of a single definitive binding, and `queue_verification_task.v1` additionally used **"suggestion decisions" as a stretch §9 pointer** (a BC-ADM-3 audit anchor, not valid for a BC-ADM-5 verification-task action). **Resolution:** each contract's Audit field is set to the sole binding **`[ESC-ADM-AUDIT]`** (verification-task workflow is not separately enumerated in the Doc-2 §9 Admin domain; nearest action by pointer; no action invented), matching the J-A5 consolidation row exactly. The dual-option and the "suggestion decisions" stretch-pointer are removed. This is the same fix that resolved F4J-PA1-N1 in Part 1.

---

## Patch 1

**Finding:** F4J-PA2-M1 (MINOR) — BC-ADM-5 per-contract audit dual-option + stretch-pointer (`admin.queue_verification_task.v1`, `admin.assign_verification_task.v1`, `admin.decide_verification_task.v1`).

### Change 1a — `admin.queue_verification_task.v1` (J5A-3) — Audit field

**Original Text**
```
**Audit:** §9 Admin ("suggestion decisions" nearest domain) by pointer / **`[ESC-ADM-AUDIT]`** if verification-task workflow is not separately enumerated in §9 (nearest action by pointer; no action invented).
```

**Replacement Text**
```
**Audit:** **`[ESC-ADM-AUDIT]`** (verification-task workflow is not separately enumerated in the Doc-2 §9 Admin domain; nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented).
```

### Change 1b — `admin.assign_verification_task.v1` (J5A-3) — Audit field

**Original Text**
```
**Audit:** §9 Admin by pointer / `[ESC-ADM-AUDIT]` (as above; no action invented).
```

**Replacement Text**
```
**Audit:** **`[ESC-ADM-AUDIT]`** (verification-task workflow is not separately enumerated in the Doc-2 §9 Admin domain; nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented).
```

### Change 1c — `admin.decide_verification_task.v1` (J5A-3) — Audit field

**Original Text**
```
**Audit:** §9 Admin by pointer / `[ESC-ADM-AUDIT]` (no action invented).
```

**Replacement Text**
```
**Audit:** **`[ESC-ADM-AUDIT]`** (verification-task workflow is not separately enumerated in the Doc-2 §9 Admin domain; nearest §9 action by pointer; Doc-2 §9 additive; no audit action invented).
```

**Affected Contracts**

- `admin.queue_verification_task.v1`
- `admin.assign_verification_task.v1`
- `admin.decide_verification_task.v1`

**Rationale.** Doc-2 §9's Admin audit domain enumerates "ban issue/lift, category approve/delete, suggestion decisions, import job execution, moderation decisions, link confirm/dismiss" — **verification-task workflow is not separately enumerated**. The corpus-faithful binding is therefore `[ESC-ADM-AUDIT]` (the Doc-2 §9-additive marker, nearest action by pointer), exactly as the J-A5 consolidation row already states ("Verification queue/assign/decide (BC-ADM-5) | `[ESC-ADM-AUDIT]`"). The three per-contract records were inconsistent with J-A5 in two ways: (1) they presented a dual option ("§9 pointer / `[ESC-ADM-AUDIT]`") leaving the binding unresolved, and (2) `queue_verification_task.v1` named "suggestion decisions" as the §9 anchor — but "suggestion decisions" is the BC-ADM-3 (Suggestions) audit action, not a sound anchor for a BC-ADM-5 (Verification Workflow) action. Replacing all three Audit fields with the single `[ESC-ADM-AUDIT]` binding removes the dual-option, removes the stretch-pointer, and aligns the per-contract records exactly with J-A5. No audit action invented; no other §9 binding changed (BC-ADM-4 "import job execution" and BC-ADM-6 `[ESC-ADM-AUDIT]` remain as authored). This is the same defect and fix as F4J-PA1-N1 (Part 1). Wording only — Audit field of three contracts; no structural, lifecycle, ownership, event, or authorization change.

---

## Regression Review

| Surface | Result |
|---|---|
| Structure | UNCHANGED |
| BC inventory | UNCHANGED (BC-ADM-4 Data Import · BC-ADM-5 Verification Workflow · BC-ADM-6 Vendor Outreach) |
| Aggregate inventory | UNCHANGED (Import Job · Verification Task · Outreach Campaign) |
| Ownership | UNCHANGED — Admin owns `verification_tasks` (workflow only); Trust stores the verification record/decision; no aggregate moved. |
| Authorization | UNCHANGED — BC-ADM-5 contracts remain `staff_can_verify` (Doc-2 §7); no slug invented; no permission changed. |
| Dependencies | UNCHANGED — DR-ADM-TRUST / DR-ADM-1 / DR-ADM-PC carried as before; no `DR-ADM-COMM`. |
| Lifecycles | UNCHANGED — `verification_tasks queued → in_review → decided` (and `import_jobs`, `outreach_campaigns` lifecycles) untouched; the patch edits only the Audit field. |
| Event governance | UNCHANGED — **Produced = NONE for BC-ADM-4/5/6** (the sole Admin §8 event `VendorBanned` is BC-ADM-2's, Part 1); no event added. |
| Procurement moat | UNCHANGED — no matching/routing/ranking/supplier-selection/award/eligibility decision introduced. |
| Trust firewall | UNCHANGED — "Admin decides workflow; Trust stores decisions"; Admin owns no verification record, computes no score; the firewall note in `decide_verification_task.v1` is untouched. |
| Error model | UNCHANGED — `REFERENCE ≠ DEPENDENCY`, `STATE ≠ CONFLICT` preserved. |

Additional invariants confirmed: only the Audit field of the three named BC-ADM-5 contracts is edited; the J-A5 consolidation row (already `[ESC-ADM-AUDIT]`) is unchanged and the per-contract records now match it; no audit action invented; BC-ADM-4 ("import job execution") and BC-ADM-6 (`[ESC-ADM-AUDIT]`) audit bindings are untouched. Patch scope is limited to BC-ADM-5 audit-binding wording only.

---

## Patch Status

```text
F4J-PA2-M1 = RESOLVED   (queue/assign/decide_verification_task.v1 audit = sole [ESC-ADM-AUDIT]; dual-option removed; "suggestion decisions" stretch-pointer removed; aligned with J-A5; no audit action invented)
```

```text
Open BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0   (post-patch, pending Patch Verification)
```

---

*End of Doc-4J_PassA_Part2_Patch_v1.0. Pass-A patch only — applies F4J-PA2-M1 (the three BC-ADM-5 verification-task contracts' Audit fields set to the sole `[ESC-ADM-AUDIT]` binding; dual-option and the "suggestion decisions" stretch-pointer removed; aligned exactly with the J-A5 consolidation). Minimal, audit-wording correction only; the Audit field of `admin.queue_verification_task.v1` / `admin.assign_verification_task.v1` / `admin.decide_verification_task.v1` only. No redesign; structure, BC inventory, aggregate inventory, ownership, authorization, slug usage, lifecycles/state machines, event governance (Produced = NONE for BC-ADM-4/5/6), procurement moat, trust firewall, and error model all preserved; no new contract/audit-action/permission/event/lifecycle/ownership change. Authorized next stage: Patch Verification → Pass-A Consolidation Review → Pass-A FROZEN → Pass-B.*
