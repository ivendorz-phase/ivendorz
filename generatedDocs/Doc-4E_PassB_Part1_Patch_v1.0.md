# Doc-4E_PassB_Part1_Patch_v1.0.md

## Status

**Approved Pass-B Part-1 Patch** — applies the Architecture-Board-adjudicated findings of `Doc-4E_PassB_Part1_Independent_Hard_Review_v1.0` to `Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md`.

| Field | Value |
|---|---|
| Applies to | `Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md` |
| Produces | Part 1 as amended by this patch (canonical input to Pass-B Part-1 Patch Verification) |
| Review source | `Doc-4E_PassB_Part1_Independent_Hard_Review_v1.0` |
| Board adjudication | **Apply:** PB1-M1, PB1-M2, PB1-M3. **Do not patch (deferred, non-gating):** PB1-N1, PB1-N2. |
| Scope | Three alignment/clarity corrections (validation-matrix completeness ×2; explicit edge notation ×1). **No rewrite, no contract regeneration, no architecture redesign, no behavior/lifecycle/concurrency change.** |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN — all FROZEN |
| Application model | Additive amendment document (Board-applied). Each item quotes the exact **Before** text present verbatim in the base Part-1, gives the **After**, and states the rationale. The base file correctly still holds pre-application text until re-issued. |

All frozen ownership boundaries, DDD boundaries, lifecycle/state machines, event catalog, audit catalog, authorization model, and the procurement moat are preserved. This patch invents nothing, adds no state/transition/slug/event/audit-action/POLICY-key/contract, and resolves no carried dependency (DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]` carried unchanged).

---

# 1. Patch Summary

| Finding | Severity | Location | Disposition |
|---|---|---|---|
| **PB1-M1** | MINOR | §E4.6 `rfq.cancel_rfq.v1` — Validation Matrix, Stage 1 SYNTAX | **APPLIED** — added `expected_version_no` (required, numeric) to the SYNTAX row so the Validation Matrix aligns with the Request Schema. |
| **PB1-M2** | MINOR | §E4.9 `rfq.expire_rfq.v1` — Validation Matrix | **APPLIED** — inserted the missing Stage 1 SYNTAX row (`rfq_id` uuid; `trigger` enum) before Stage 6, preserving the nine-stage order. |
| **PB1-M3** | MINOR | §E4.5 `rfq.moderate_rfq.v1` — State Machine Enforcement + AI-Agent Notes | **APPLIED** — replaced the compound-path notation with explicit Edge A / Edge B / Edge C definitions and added an AI-agent implementation constraint. |
| **PB1-N1** | NITPICK | (deferred) | **DEFERRED — Non-Gating, No Patch Applied** (per Board adjudication). |
| **PB1-N2** | NITPICK | (deferred) | **DEFERRED — Non-Gating, No Patch Applied** (per Board adjudication). |

All three accepted MINOR findings applied; both NITPICKs deferred without content change per Board adjudication. Nothing invented; no behavior/lifecycle/concurrency change.

---

# 2. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md` and gives the **After**. Anchors verified verbatim against the base.

### PB1-M1 — §E4.6 `rfq.cancel_rfq.v1` — Validation Matrix Stage 1 SYNTAX alignment

**Location:** §E4.6 — section **4. Validation Matrix**, Stage 1 SYNTAX row.

**Before:**

```
| `rfq_id`, `cancellation_reason` | 1 SYNTAX | Doc-4A §9 | presence/type; reason non-empty | `VALIDATION` |
```

**After:**

```
| `rfq_id`, `expected_version_no`, `cancellation_reason` | 1 SYNTAX | Doc-4A §9 | presence/type; `expected_version_no` required (numeric); reason non-empty | `VALIDATION` |
```

**Rationale:** The §E4.6 Request Schema declares `rfq_id`, `expected_version_no`, and `cancellation_reason`, but the Stage 1 SYNTAX row omitted `expected_version_no`. The field already drives the optimistic-concurrency assertion recorded in the State Machine Enforcement and Idempotency sections (unchanged); this edit only makes the SYNTAX row enumerate every required request field, aligning the Validation Matrix with the Request Schema. **No behavior, lifecycle, or concurrency change** — `expected_version_no` was already required and already enforced; only its presence-check listing was missing.

---

### PB1-M2 — §E4.9 `rfq.expire_rfq.v1` — Insert missing Stage 1 SYNTAX row

**Location:** §E4.9 — section **4. Validation Matrix**, before the existing Stage 6 STATE row.

**Before:**

```
| Check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| trigger precondition | 6 STATE | Doc-2 §5.4 (+PATCH-D2-02) | validity-lapse: RFQ ∈ {`vendors_notified`,`quotations_received`,`buyer_reviewing`}; coverage-exhausted: RFQ ∈ {`matching`} with hold-bound elapsed | `STATE` (idempotent no-op if already terminal) |
| reason binding | 8 BUSINESS | Doc-3 §1.2/§1.4; PATCH-D3-05 | coverage-exhausted records reason `no_eligible_vendors_found` | — |
```

**After:**

```
| Check | Stage | Source authority | Rule | Failure outcome |
|---|---|---|---|---|
| `rfq_id`, `trigger` | 1 SYNTAX | Doc-4A §9 | `rfq_id` required (uuid); `trigger` required (enum<validity_lapse\|coverage_exhausted>) | `VALIDATION` |
| trigger precondition | 6 STATE | Doc-2 §5.4 (+PATCH-D2-02) | validity-lapse: RFQ ∈ {`vendors_notified`,`quotations_received`,`buyer_reviewing`}; coverage-exhausted: RFQ ∈ {`matching`} with hold-bound elapsed | `STATE` (idempotent no-op if already terminal) |
| reason binding | 8 BUSINESS | Doc-3 §1.2/§1.4; PATCH-D3-05 | coverage-exhausted records reason `no_eligible_vendors_found` | — |
```

**Rationale:** §E4.9 is a Template 21.5 System contract whose internal trigger carries `rfq_id` + `trigger` (the dispatch selector already declared in its Request Schema). The Validation Matrix began at Stage 6, omitting the Stage 1 SYNTAX row for these inputs. The inserted row restores the canonical nine-stage ordering (Doc-4A §11.2) by placing SYNTAX first. **No new validation stage** is introduced (SYNTAX is stage 1 of the existing nine), and **no behavior change** — the System contract already validated its trigger inputs implicitly; this makes the SYNTAX stage explicit and consistent with the other eight contracts in Part 1.

---

### PB1-M3 — §E4.5 `rfq.moderate_rfq.v1` — Explicit edge definitions + AI-agent constraint

**Location 1:** §E4.5 — section **6. State Machine Enforcement**.

**Before:**

```
**6. State Machine Enforcement** — Allowed source **`submitted`** / **`under_review`** · Target **`matching`** (cleared) or **`draft`** (reject; Doc-2 §5.4 **PATCH-D2-01**, platform-moderation actor) · Forbidden: all other states → `STATE` · Concurrency: optimistic on state; buyers cannot trigger this transition (actor-type gate at CONTEXT).
```

**After:**

```
**6. State Machine Enforcement** — explicit edges (Doc-2 §5.4; no compound path):

- **Edge A — `submitted → under_review`.** Owner: platform moderation progression. Actor: moderation system (entry into the moderation queue). Not a moderator clearance decision.
- **Edge B — `under_review → matching`.** Owner: moderation clearance. Actor: moderator (`staff_can_moderate_rfq`) — the *pass* decision.
- **Edge C — `under_review → draft`.** Owner: moderation rejection. Actor: moderator (`staff_can_moderate_rfq`). Reference: Doc-2 §5.4 **PATCH-D2-01**; structured reason `rfq_correction_required`.

Forbidden: all source states other than `submitted` (Edge A) and `under_review` (Edges B/C) → `STATE`. Concurrency: optimistic on state; buyers cannot trigger any of these transitions (actor-type gate at CONTEXT). No state added; no transition added — these are the existing Doc-2 §5.4 (+PATCH-D2-01) edges, stated individually.
```

**Location 2:** §E4.5 — section **12. AI-Agent Implementation Notes**.

**Before:**

```
**12. AI-Agent Implementation Notes** — Buyers **cannot** trigger this (actor-type + `staff_can_moderate_rfq` gate). Resubmission after reject re-enters the submission gate (`submit_rfq`), never bypasses it (PATCH-D2-01 rule). The reject edge is Doc-2 §5.4 PATCH-D2-01 exactly — platform-moderation actor, reason `rfq_correction_required`; its audit carries `[ESC-RFQ-AUDIT]`. Repeated rejects feed buyer abuse scoring (Doc-3 §10.2) — an analytics effect, not part of this contract.
```

**After:**

```
**12. AI-Agent Implementation Notes** — Buyers **cannot** trigger this (actor-type + `staff_can_moderate_rfq` gate). Resubmission after reject re-enters the submission gate (`submit_rfq`), never bypasses it (PATCH-D2-01 rule). The reject edge is Doc-2 §5.4 PATCH-D2-01 exactly — platform-moderation actor, reason `rfq_correction_required`; its audit carries `[ESC-RFQ-AUDIT]`. Repeated rejects feed buyer abuse scoring (Doc-3 §10.2) — an analytics effect, not part of this contract. **Edge constraint (implementation):** moderator clearance/rejection actions operate **only from `under_review`** (Edges B/C). `submitted → under_review` (Edge A) is a separate moderation-system progression transition. **Never implement `submitted → matching` as a single command path** — it does not exist in Doc-2 §5.4; clearance is always the two-step `submitted → under_review → matching`.
```

**Rationale:** The compound notation `submitted → under_review → matching` in one cell could read to an AI agent as a single atomic command edge, which Doc-2 §5.4 does **not** define. Splitting it into Edge A (`submitted → under_review`, moderation-system progression), Edge B (`under_review → matching`, moderator clearance), and Edge C (`under_review → draft`, moderator rejection per PATCH-D2-01) makes each existing Doc-2 §5.4 edge unambiguous, with its owner and actor. The AI-agent note adds the explicit "never implement `submitted → matching` as a single path" constraint. **This is clarification only** — no state added, no transition added, no lifecycle change; the edges, actors, slug (`staff_can_moderate_rfq`), and reason code are exactly as already frozen in Doc-2 §5.4 (+PATCH-D2-01) and Pass-A.

---

# 3. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| **Ownership unchanged** | **CONFIRMED** | No entity/aggregate moved; all three edits are within existing RFQ-owned `rfqs` contracts. |
| **Lifecycle unchanged** | **CONFIRMED** | PB1-M3 splits a compound notation into the **existing** Doc-2 §5.4 (+PATCH-D2-01) edges (`submitted→under_review`, `under_review→matching`, `under_review→draft`); no edge added or modified. PB1-M1/M2 touch only Validation-Matrix SYNTAX rows — no state logic. |
| **Authorization unchanged** | **CONFIRMED** | No slug added/removed; PB1-M3 names the existing `staff_can_moderate_rfq` on Edges B/C exactly as frozen. |
| **Event model unchanged** | **CONFIRMED** | No event added/removed; moderation remains state+audit only (no Doc-2 §8 moderation event). |
| **Audit model unchanged** | **CONFIRMED** | No audit action added; the `[ESC-RFQ-AUDIT]` carry on the reject edge is unchanged. |
| **DDD boundaries unchanged** | **CONFIRMED** | No bounded-context or section change; edits are field/notation-level within §E4.5/§E4.6/§E4.9. |
| **Procurement moat unchanged** | **CONFIRMED** | No matching/routing/ownership change; DE-1…DE-8 intact. |

**Regression posture:** purely additive/clarifying — two Validation-Matrix completeness corrections (listing an already-required field; restoring the SYNTAX stage) and one notation disambiguation (compound path → explicit existing edges). No entity, state, transition, slug, event, audit action, POLICY key, or contract added, split, or removed; no behavior, lifecycle, or concurrency change; no carried dependency resolved.

---

# 4. Deferred Findings

| Finding | Disposition | Reason for deferral |
|---|---|---|
| **PB1-N1** | **Deferred — Non-Gating, No Patch Applied** | Per Architecture Board adjudication, classified NITPICK and not gating to Pass-B Part-1 freeze readiness. No content modified; carried forward (may be addressed in a later cosmetic pass without reopening Part 1). |
| **PB1-N2** | **Deferred — Non-Gating, No Patch Applied** | Per Architecture Board adjudication, classified NITPICK and not gating. No content modified; carried forward. |

NITPICKs are deferrable by the proven lifecycle rule (a pass may freeze with no open BLOCKER/MAJOR/MINOR; NITPICKs are non-gating). Neither deferred finding affects the hardened contracts.

---

# 5. Freeze Readiness

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** — none raised; none introduced. |
| **Open MAJOR** | **NO** — the review raised no MAJOR; the three accepted findings were MINOR and are now closed. |
| **Open MINOR** | **NO** — PB1-M1, PB1-M2, PB1-M3 all applied and closed. |
| **Ready for Patch Verification** | **YES** |

**Justification.** The three Board-accepted findings were all MINOR alignment/clarity corrections, now applied: PB1-M1 lists `expected_version_no` in the §E4.6 SYNTAX row (Validation Matrix ↔ Request Schema alignment); PB1-M2 inserts the missing Stage 1 SYNTAX row in §E4.9 (restoring the canonical nine-stage order); PB1-M3 replaces the §E4.5 compound-path notation with explicit Edge A/B/C definitions plus an AI-agent implementation constraint. The two NITPICKs (PB1-N1, PB1-N2) are recorded as deferred, non-gating, with no content change, per Board adjudication. Impact analysis confirms ownership, lifecycle, authorization, event model, audit model, DDD boundaries, and the procurement moat are all unchanged; nothing was invented, added, split, or removed. The amended Part-1 conforms to `Doc-4E_PassA_v1.0_FROZEN`, the frozen structure, and the frozen corpus, and carries DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` unchanged. Part 1 is **ready for Pass-B Part-1 Patch Verification.**

> No conflict with the frozen corpus was encountered during patch application; no flag-and-halt was triggered.

---

*End of Doc-4E_PassB_Part1_Patch_v1.0 — applies PB1-M1/M2/M3 (MINOR alignment + clarity); records PB1-N1/N2 as deferred non-gating. Two Validation-Matrix completeness corrections + one compound-path disambiguation into existing Doc-2 §5.4 edges. No ownership, lifecycle, authorization, event, audit, DDD, or moat change; nothing invented. Decision: all accepted findings closed; ready for Patch Verification. Canonical input: `Doc-4E_Content_v1.0_PassB_Part1_RFQLifecycle.md` as amended by this patch.*