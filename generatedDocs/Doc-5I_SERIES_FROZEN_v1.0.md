# Doc-5I — Monetization / Billing (M7 `billing`) API Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-5I Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | M7 — Monetization / Billing (`billing` schema) |
| Realizes | `Doc-4I_FROZEN_v1.0` (32 contracts) **+ `Doc-4I_ActivatePlan_Additive_Patch_v1.0` (1 additive)** = **33 contracts** on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` governs**; gated by Doc-5A Appendix A |
| Freeze evidence | `Doc-5I_Content_Freeze_Audit_v1.0.md` — 7 audit dimensions PASS; 0 open findings |

---

## Effective set (the authoritative Doc-5I)

Read these together; this manifest binds them and restates nothing:

| Artifact | Role |
|---|---|
| `Doc-5I_Structure_v1.0_FROZEN.md` | Frozen structure — partition spine, R1–R11, section map §0–§11 + Appendix A |
| `Doc-5I_Structure_Additive_Patch_v1.0.md` | **Additive structure patch** — Board Gate 1 (§3 Admin-read re-scope to catalog) + Gate 2 (partition 32→33, `activate_plan`) |
| `Doc-5I_Content_v1.0_Pass1.md` | §0–§3 (cross-cutting: actor, `check_permission`, firewall, state machines, non-disclosure, §3.6 disclosure-scope, §3.7 actor-side, §3.8 error map, §3.9 envelope) + §2 inventory |
| `Doc-5I_Content_v1.0_Pass2.md` | §4 BC-BILL-1 (9, incl. `activate_plan`) · §5 BC-BILL-2 (4) · §6 BC-BILL-3 (1) |
| `Doc-5I_Content_v1.0_Pass3.md` | §7 BC-BILL-4 (4) · §8 BC-BILL-5 (4) · §9 BC-BILL-6 (5) · §10 Out-of-Wire (6) · §11 Conformance · Appendix A |
| `Doc-4I_ActivatePlan_Additive_Patch_v1.0.md` | **Additive Doc-4I contract** `billing.activate_plan.v1` (§HB-1.1a) — the `draft→active` owner (Board Gate 2) |
| `Doc-3_Policy_Key_Registration_Patch_v1.6_Billing.md` | Registers `billing.idempotency_dedup_window` + `billing.list_page_size_max`; clears `[ESC-BILL-POLICY]` |

## Partition (33 contracts)

| BC | Caller-facing | Out-of-wire | § |
|---|---|---|---|
| BC-BILL-1 Plans & Entitlements | 9 | 0 | §4 |
| BC-BILL-2 Subscriptions | 4 | 3 | §5 / §10 |
| BC-BILL-3 Usage & Quota | 1 | 2 | §6 / §10 |
| BC-BILL-4 Lead Credits | 4 | 0 | §7 |
| BC-BILL-5 Platform Invoicing | 4 | 1 | §8 / §10 |
| BC-BILL-6 Rewards & Referrals | 5 | 0 | §9 |
| **Total** | **27** | **6** | **33** |

## Realization decisions (R1–R11) — by pointer

R1 out-of-wire (6: renew/expire_subscription, resolve_entitlements, record_usage, enforce_quota, record_payment) · R2 User/Admin/System, no public · R3 `billing` route=token · R4 no token invented · **R5 billing firewall** (no state gates trust/eligibility/routing/matching) · **R6 platform-invoice ≠ trade-invoice (FIXED)** · R7 subscription + plans machines (plans now complete: create→draft, **activate→active**, retire→retired) · **R8 record_payment = gateway callback** (not §8 event) · R9 exactly 3 §8 events (BC-BILL-2) · **R10 resolve_entitlements + enforce_quota internal-service authority** · R11 actor-branched (User-leg wired, System in-process).

## Board dispositions (human-approved, additive)

| Gate | Disposition | Artifact |
|---|---|---|
| `[ESC-BILL-ADMINSCOPE]` | **Gate 1 → A** — re-scope §3 Admin-read grant to catalog reads; org-scoped reads User-only | `Doc-5I_Structure_Additive_Patch_v1.0` Patch 1 |
| `[ESC-BILL-ACTIVATE]` | **Gate 2 → A** — additive `billing.activate_plan.v1` (explicit `draft→active` owner) | `Doc-4I_ActivatePlan_Additive_Patch_v1.0` |

Source: `Doc-5I_ESC_Board_Escalation_v1.0.md`.

## Carried items (non-gating; via named channels only)

`[ESC-BILL-POLICY]` → **RESOLVED** by `Doc-3 …Patch_v1.6_Billing`. `[ESC-BILL-FIELD]` (Doc-4I output extension), `[ESC-BILL-SLUG]` (Doc-2 §7), `[ESC-BILL-AUDIT]` (Doc-2 §9), `[ESC-BILL-EVENT]` (Doc-2 §8), DF-BILL-1…8 — tracked; resolved only via their named channels, never in Doc-5I.

## Provenance (reference only — never reopened)

Structure: Proposal v0.1 → Independent Hard Review → Patch → Structure Freeze Audit → FROZEN → Additive Patch. Content: Pass-1/2/3 → Pass-2 Hard Review (5 BLOCKER) → Pass-2 Focused Re-Review (RR-B1/B2) → Doc-4I field-trace correction → Content Independent Hard Review (4 MINOR + 4 NITPICK) → ESC Board Escalation → Content Freeze Audit.

---

*Doc-5I (M7 Monetization / Billing) API realization is FROZEN. Realizes Doc-4I (+ ActivatePlan additive) on HTTP — 33 contracts (27 caller-facing + 6 out-of-wire). On any conflict with a frozen Doc-4x / Doc-5A, the frozen corpus wins and Doc-5I is patched additively — flag-and-halt. Fold the two additive patches + Doc-3 v1.6 into the corpus index under architecture governance.*
