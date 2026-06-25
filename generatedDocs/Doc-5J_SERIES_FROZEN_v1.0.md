# Doc-5J — Admin Operations (M8 `admin`) API Realization — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-5J Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Module | M8 — Admin Operations (`admin` schema; platform-staff governance/operations layer) |
| Realizes | `Doc-4J_FROZEN_v1.0` (**34 operation tokens**, BC-ADM-1…6) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` governs**; gated by Doc-5A Appendix A |
| Freeze evidence | `Doc-5J_Content_Freeze_Audit_v1.0.md` — 6 audit dimensions PASS; 0 open findings |

---

## Effective set (the authoritative Doc-5J)

| Artifact | Role |
|---|---|
| `Doc-5J_Structure_v1.0_FROZEN.md` | Frozen structure — partition spine, R1–R10, section map §0–§11 + Appendix A |
| `Doc-5J_Content_v1.0_Pass1.md` | §0–§3 (actor / `check_permission` / firewalls AF-1…4 / 8 machines / non-disclosure / §3.6 read-scopes / §3.7 bound-slugs / §3.8 error map / §3.9 envelope) + §2 inventory (32 tokens) |
| `Doc-5J_Content_v1.0_Pass2.md` | §4 BC-ADM-1 (5) · §5 BC-ADM-2 (4) · §6 BC-ADM-3 (7) |
| `Doc-5J_Content_v1.0_Pass3.md` | §7 BC-ADM-4 (4) · §8 BC-ADM-5 (5) · §9 BC-ADM-6 (7) · §10 Out-of-Wire (2 + internal legs) · §11 Conformance · Appendix A |
| `Doc-3_Policy_Key_Registration_Patch_v1.7_Admin.md` | Registers `admin.idempotency_dedup_window` + `admin.list_page_size_max`; clears `[ESC-ADM-POLICY]` |

## Partition (34 tokens)

| BC | Caller-facing | Out-of-wire | § |
|---|---|---|---|
| BC-ADM-1 Moderation | 5 | 0 | §4 |
| BC-ADM-2 Enforcement | 4 | 1 | §5 / §10 |
| BC-ADM-3 Suggestions | 7 | 0 | §6 |
| BC-ADM-4 Data Import | 4 | 1 | §7 / §10 |
| BC-ADM-5 Verification | 5 | 0 | §8 |
| BC-ADM-6 Outreach | 7 | 0 | §9 |
| **Total** | **32** | **2** | **34** |

## Realization decisions (R1–R10) — by pointer

R1 out-of-wire (2 System + dual-template/write-via-service/event-consumer legs) · R2 platform-staff Admin only (no tenant/public; no active-org; no delegation) · R3 `admin` route=token · R4 no token invented · **R5 Admin-decides/owning-module-owns** (cross-module writes = in-process service legs; no domain bypass) · **R6 non-disclosure** (Staff-Internal; link content never vendor-visible; `404` collapse) · **R7 procurement moat** (no matching/routing/award; outreach informational) · **R8 Trust/score firewall** (`verification_tasks ≠ trust.verification_records`) · **R9 single event** (`VendorBanned`, BC-ADM-2 only) · R10 import-job create-then-poll lean `201`.

## Carried items (non-gating; named channels only)

`[ESC-ADM-POLICY]` → **RESOLVED** by `Doc-3 …Patch_v1.7_Admin`. `[ESC-ADM-SLUG]` (Doc-2 §7), `[ESC-ADM-AUDIT]` (Doc-2 §9), `[ESC-ADM-EVENT]` (Doc-2 §8), `[ESC-ADM-FIELD]` (Doc-4J PassB field registry), DR-ADM-1/MKT/RFQ/OPS/TRUST/PC — tracked; resolved only via their named channels (`DR-ADM-COMM` does not exist).

## Provenance (reference only)

Structure: Proposal v0.1 → v0.2 (Independent Hard Review — 3 MAJOR + 4 MINOR + 3 NITPICK + 1 OBS resolved) → Structure Freeze Audit PASS → FROZEN. Content: Pass-1/2/3 → Content Independent Hard Review (0 BLOCKER · 0 MAJOR · 2 MINOR · 3 NITPICK) → patch → Content Freeze Audit (PASS).

---

*Doc-5J (M8 Admin Operations) API realization is FROZEN. Realizes Doc-4J on HTTP — 34 tokens (32 caller-facing + 2 out-of-wire); platform-staff Admin only; sole event `VendorBanned`; Admin-decides/owning-module-owns. **With Doc-5J frozen, all 10 Doc-5 module realizations (M0–M9) are content-FROZEN — the Doc-5 API realization program is COMPLETE.** On any conflict with a frozen Doc-4x/Doc-5A, the frozen corpus wins; flag-and-halt.*
