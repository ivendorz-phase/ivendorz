# Doc-4E_PassB_Part5_Patch_v1.0.md

## Status

**Approved Pass-B Part-5 Patch** — applies the Architecture-Board-accepted findings of `Doc-4E_PassB_Part5_Independent_Hard_Review_v1.0` to `Doc-4E_Content_v1.0_PassB_Part5_EvaluationComparisonAward.md`. Surgical patching only — no rewrite.

| Field | Value |
|---|---|
| Applies to | `Doc-4E_Content_v1.0_PassB_Part5_EvaluationComparisonAward.md` |
| Produces | Part 5 as amended by this patch (canonical input to Pass-B Part-5 Patch Verification) |
| Board adjudication | **Apply:** PB5-MA1, PB5-M1, PB5-M2, PB5-M3 (A+B). **Do not implement (Board-deferred NITPICKs):** PB5-N1, PB5-N2, PB5-N3. |
| Scope | Award shortlist-membership BUSINESS rule; comparison-read transition mechanism; explicit Stage-5 DELEGATION rows (5 contracts); §E8.3 validation-ordering correction + `quotation_revised` internal-trigger clarification. **No rewrite, no redesign, no Pass-A/frozen reopen.** |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1/2/3/4_v1.0_FROZEN — all FROZEN |
| Application model | Additive amendment document (Board-applied). Each item quotes the exact **Before** text present verbatim in the base Part-5, gives the **After**, and states the rationale. |

All frozen ownership boundaries, lifecycle/state machines, event catalog, audit catalog, authorization model, DDD boundaries, and the procurement moat are preserved. This patch **invents no entity, aggregate, state, transition, permission slug, event, audit action, or POLICY key**: the shortlist set it references (PB5-MA1) is already persisted by `rfq.shortlist_quotation.v1`; the `quotations_received → buyer_reviewing` edge (PB5-M1) is the existing Doc-2 §5.4 edge; the DELEGATION rows (PB5-M2) record an *existing* non-eligibility; the ordering fix (PB5-M3a) is cosmetic; `quotation_revised` (PB5-M3b) is clarified as a non-event internal trigger. Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]` carried unchanged.

---

# 1. Patch Summary

| Finding | Severity | Location | Disposition |
|---|---|---|---|
| **PB5-MA1** | MAJOR | §E8.4 `rfq.award_rfq.v1` — Validation Matrix + AI-Agent Notes | **APPLIED** — added a Stage-8 BUSINESS rule requiring `selected_quotation_id` ∈ the persisted shortlist set (written by `shortlist_quotation.v1`); award of a non-shortlisted quotation foreclosed; AI note added. |
| **PB5-M1** | MINOR | §E8.6 `rfq.get_comparison_statement.v1` — State Machine + AI-Agent Notes | **APPLIED** — specified the execution point, transaction boundary, and idempotency of the `quotations_received → buyer_reviewing` first-open transition (same transaction as the read; no events/jobs/CDC/extra contracts). |
| **PB5-M2** | MINOR | §E8.2, §E8.3, §E8.4, §E8.5 — Validation Matrices | **APPLIED** — added explicit Stage-5 DELEGATION rows stating buyer decision authority is **not** delegation-eligible (Doc-4A §6B; Doc-3 §9.4; H.3). No behavioral/authorization change. |
| **PB5-M3 (A)** | MINOR | §E8.3 — Validation Matrix | **APPLIED** — restored canonical stage ordering (8 BUSINESS before 9 POLICY); ordering only, no semantic change. |
| **PB5-M3 (B)** | MINOR | §E8.1 `rfq.generate_comparison_statement.v1` — Event Binding + AI-Agent Notes | **APPLIED** — documented `quotation_revised` explicitly as a **non-Doc-2-§8 internal application-layer trigger** (not an event/outbox/contract); described comparison-regeneration invocation. |
| PB5-N1 / PB5-N2 / PB5-N3 | NITPICK | (deferred) | **NOT IMPLEMENTED** — Board-deferred; no content change. |

PB5-MA1/M1/M2/M3 applied. PB5-N1/N2/N3 not implemented (Board-deferred). Nothing invented.

---

# 2. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4E_Content_v1.0_PassB_Part5_EvaluationComparisonAward.md` and gives the **After**. Anchors verified verbatim against the base.

### PB5-MA1 — §E8.4 Award — shortlist-membership Stage-8 BUSINESS rule

**Location 1:** §E8.4 — section **4. Validation Matrix**, inserted immediately after the Stage-7 `selected-quote ref` row, before the `single award` row.

**Before:**

```
| selected-quote ref | 7 REFERENCE | Doc-4A §9.5; Doc-2 §10.4 | `selected_quotation_id` is a `submitted`/shortlisted quotation on this RFQ | `REFERENCE`/`NOT_FOUND` |
| single award | 8 BUSINESS | Doc-2 §5.4 FIXED | exactly one selected quotation (multi-award foreclosed — split = re-issue) | `BUSINESS` |
```

**After:**

```
| selected-quote ref | 7 REFERENCE | Doc-4A §9.5; Doc-2 §10.4 | `selected_quotation_id` is a `submitted`/shortlisted quotation on this RFQ | `REFERENCE`/`NOT_FOUND` |
| shortlist membership | 8 BUSINESS | Doc-3 §9.4; §E8.2 shortlist governance | `selected_quotation_id` MUST exist in the **current persisted shortlist set** for the RFQ (the `shortlisted_quotation_ids` written by `rfq.shortlist_quotation.v1`, §E8.2); award of a non-shortlisted quotation is foreclosed. The membership check executes **before award commit** (same transaction). | `BUSINESS` |
| single award | 8 BUSINESS | Doc-2 §5.4 FIXED | exactly one selected quotation (multi-award foreclosed — split = re-issue) | `BUSINESS` |
```

**Location 2:** §E8.4 — section **12. AI-Agent Implementation Notes**.

**Before:**

```
**12. AI-Agent Implementation Notes** — **Single award only** (Doc-2 §5.4 cardinality FIXED) — exactly one `selected_quotation_id`; split needs are a **re-issue** (BC-1, Part 1 `reissue_rfq`), never multi-award. The **engagement is Operations'** (DE-4), created off `RFQClosedWon` — never authored here. RFQ + quotation transitions are **one atomic transaction** (Doc-2 §10.11.4). Award records deal value. Terminal — never reopen. No plan influence on award (§4B).
```

**After:**

```
**12. AI-Agent Implementation Notes** — **Single award only** (Doc-2 §5.4 cardinality FIXED) — exactly one `selected_quotation_id`; split needs are a **re-issue** (BC-1, Part 1 `reissue_rfq`), never multi-award. **Award of a non-shortlisted quotation is foreclosed (PB5-MA1):** `selected_quotation_id` must be a member of the current persisted shortlist set (`shortlisted_quotation_ids` from `rfq.shortlist_quotation.v1`, §E8.2); the **shortlist-membership check must execute before award commit** (in the same atomic transaction as the state writes). The **engagement is Operations'** (DE-4), created off `RFQClosedWon` — never authored here. RFQ + quotation transitions are **one atomic transaction** (Doc-2 §10.11.4). Award records deal value. Terminal — never reopen. No plan influence on award (§4B).
```

**Rationale:** Closes the gap where award validated only that `selected_quotation_id` is a submitted quotation, not that it was actually shortlisted. The shortlist set is already **persisted** by `rfq.shortlist_quotation.v1` (§E8.2 writes `shortlisted_quotation_ids` to the RFQ) — so the Stage-8 BUSINESS membership check reads existing state; **no new entity/state/event**. Authority: Doc-3 §9.4 (award process) + §E8.2 shortlist governance. Award follows shortlist (Doc-2 §5.4: `shortlisted → closed_won`), so a non-shortlisted award is invalid; the check runs before commit, in the existing atomic transaction.

---

### PB5-M1 — §E8.6 Comparison Read — transition mechanism (execution point, transaction, idempotency)

**Location 1:** §E8.6 — section **6. State Machine Enforcement**.

**Before:**

```
**6. State Machine Enforcement** — **The first buyer open drives `quotations_received → buyer_reviewing`** (Doc-2 §5.4); the system also auto-advances at quotation-window close — **whichever is first** (Doc-3 §1.2; Pass-A PA-16). Vendor-facing status shows "under evaluation" only from `buyer_reviewing`. The read itself is otherwise side-effect-free; the first-open transition is audited via the lifecycle. **No edge invented** (the `quotations_received → buyer_reviewing` edge is the existing Doc-2 §5.4 edge).
```

**After:**

```
**6. State Machine Enforcement** — **The first buyer open drives `quotations_received → buyer_reviewing`** (Doc-2 §5.4); the system also auto-advances at quotation-window close — **whichever is first** (Doc-3 §1.2; Pass-A PA-16). **Mechanism (PB5-M1):** on a buyer open, **if** the RFQ state = `quotations_received`, the contract advances the RFQ to `buyer_reviewing` **within the same database transaction used by the comparison read** (read + conditional state write committed atomically — modular monolith, Doc-2 §10.11.4); **subsequent reads perform no state transition** (the guard is the state itself — once in `buyer_reviewing` the conditional does not fire). **No new event, no outbox message, no background job, no CDC, no additional contract** — the transition is a synchronous, in-transaction side effect of this read only. Vendor-facing status shows "under evaluation" only from `buyer_reviewing`; the first-open transition is audited via the lifecycle. **No edge invented** (the `quotations_received → buyer_reviewing` edge is the existing Doc-2 §5.4 edge).
```

**Location 2:** §E8.6 — section **12. AI-Agent Implementation Notes**.

**Before:**

```
**12. AI-Agent Implementation Notes** — The comparison shows standing bands but **never an auto-recommended winner** (Doc-3 §9.1 FIXED). **Buyer-private columns are never exposed to vendors** (non-disclosure). The first buyer open (or window-close, whichever first) advances `quotations_received → buyer_reviewing` — the only side effect of this read (PA-16). Display data is from `matching_results` (PA-04), never a live signal read.
```

**After:**

```
**12. AI-Agent Implementation Notes** — The comparison shows standing bands but **never an auto-recommended winner** (Doc-3 §9.1 FIXED). **Buyer-private columns are never exposed to vendors** (non-disclosure). The first buyer open (or window-close, whichever first) advances `quotations_received → buyer_reviewing` — the only side effect of this read (PA-16). **Transition mechanism (PB5-M1):** execute it **inline, in the same transaction as the read**, guarded by `if state = quotations_received`; commit read + transition atomically; **subsequent reads do not re-transition** (idempotent on state). Do **not** implement it via an event, outbox message, background job, CDC, or a separate contract — it is a synchronous in-transaction effect of this read. Display data is from `matching_results` (PA-04), never a live signal read.
```

**Rationale:** Specifies the implementation mechanism the review flagged as under-defined: execution point (on buyer open), transaction boundary (same transaction as the read, atomic), and idempotency (state-guarded; subsequent reads no-op). Explicitly forecloses events/outbox/background-jobs/CDC/extra contracts. **No new event/contract/state**; the `quotations_received → buyer_reviewing` edge is the existing Doc-2 §5.4 edge.

---

### PB5-M2 — Explicit Stage-5 DELEGATION rows (§E8.2, §E8.3, §E8.4, §E8.5)

> Each insertion adds a Stage-5 DELEGATION row immediately after the section's Stage-4 SCOPE row, recording that **buyer decision authority is not delegation-eligible** (Doc-4A §6B; Doc-3 §9.4; H.3). Behavioral/authorization no-op — it makes the existing non-eligibility explicit in the matrix.

**§E8.2 `rfq.shortlist_quotation.v1`**

**Before:**

```
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns the RFQ | `NOT_FOUND` (collapse, §7.5) |
| state = `buyer_reviewing` | 6 STATE | Doc-2 §5.4 | shortlist legal only from `buyer_reviewing` | `STATE` |
```

**After:**

```
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns the RFQ | `NOT_FOUND` (collapse, §7.5) |
| delegation (buyer decision) | 5 DELEGATION | Doc-4A §6B; Doc-3 §9.4; H.3 | **not delegation-eligible** — buyer decision authority (shortlist) is the buyer org's own membership; no §6B grant path | `AUTHORIZATION` (if a delegation grant is presented) |
| state = `buyer_reviewing` | 6 STATE | Doc-2 §5.4 | shortlist legal only from `buyer_reviewing` | `STATE` |
```

**§E8.3 `rfq.manage_clarification.v1` · `rfq.invoke_best_and_final.v1`**

**Before:**

```
| RFQ owned + pre-award | 4 SCOPE / 6 STATE | Doc-4A §7.3; Doc-2 §5.4; Doc-3 §9.3 | buyer owns RFQ; RFQ pre-award (evaluation phase) | `NOT_FOUND`/`STATE` |
```

**After:**

```
| RFQ owned + pre-award | 4 SCOPE / 6 STATE | Doc-4A §7.3; Doc-2 §5.4; Doc-3 §9.3 | buyer owns RFQ; RFQ pre-award (evaluation phase) | `NOT_FOUND`/`STATE` |
| delegation (buyer decision) | 5 DELEGATION | Doc-4A §6B; Doc-3 §9.4; H.3 | **not delegation-eligible** — clarification/best-and-final orchestration is the buyer org's own decision authority; no §6B grant path | `AUTHORIZATION` (if a delegation grant is presented) |
```

**§E8.4 `rfq.award_rfq.v1`**

**Before:**

```
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns RFQ | `NOT_FOUND` (collapse, §7.5) |
| state = `shortlisted` | 6 STATE | Doc-2 §5.4 | award legal only from `shortlisted` | `STATE` |
```

**After:**

```
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns RFQ | `NOT_FOUND` (collapse, §7.5) |
| delegation (buyer decision) | 5 DELEGATION | Doc-4A §6B; Doc-3 §9.4; H.3 | **not delegation-eligible** — award authority is the buyer org's own membership (`can_award_rfq`); no §6B grant path | `AUTHORIZATION` (if a delegation grant is presented) |
| state = `shortlisted` | 6 STATE | Doc-2 §5.4 | award legal only from `shortlisted` | `STATE` |
```

**§E8.5 `rfq.close_lost_rfq.v1`**

**Before:**

```
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns RFQ | `NOT_FOUND` (collapse, §7.5) |
| state = `shortlisted` (or active per §1.2) | 6 STATE | Doc-2 §5.4 | close-without-award legal from `shortlisted` | `STATE` |
```

**After:**

```
| RFQ owned by active org | 4 SCOPE | Doc-4A §7.3 | buyer controlling org owns RFQ | `NOT_FOUND` (collapse, §7.5) |
| delegation (buyer decision) | 5 DELEGATION | Doc-4A §6B; Doc-3 §9.4; H.3 | **not delegation-eligible** — close-without-award authority is the buyer org's own membership; no §6B grant path | `AUTHORIZATION` (if a delegation grant is presented) |
| state = `shortlisted` (or active per §1.2) | 6 STATE | Doc-2 §5.4 | close-without-award legal from `shortlisted` | `STATE` |
```

**Rationale (PB5-M2):** Parts-5 §H.3 already states buyer decision commands are not delegation-eligible, but the per-contract Validation Matrices omitted the explicit Stage-5 DELEGATION row. Adding it makes the canonical nine-stage matrix complete and records the **existing** non-eligibility (Doc-4A §6B; Doc-3 §9.4). **No behavioral or authorization change** — a presented delegation grant was already rejected; this documents it. (The comparison **read** §E8.6 is a query, not a buyer *decision* command, and is not in scope for this finding.)

---

### PB5-M3 (A) — §E8.3 Validation Matrix — restore canonical 8 BUSINESS → 9 POLICY ordering

**Location:** §E8.3 — section **4. Validation Matrix**, the two trailing rows (currently 9 POLICY before 8 BUSINESS).

**Before:**

```
| best-and-final cap | 9 POLICY | Doc-3 §12.2 `eval.baf_rounds_max` | best-and-final invoked ≤ cap | `BUSINESS` |
| fair-information rule | 8 BUSINESS | Doc-3 §9.3 FIXED | material clarifications broadcast (anonymized) to all active invitees | `BUSINESS` |
```

**After:**

```
| fair-information rule | 8 BUSINESS | Doc-3 §9.3 FIXED | material clarifications broadcast (anonymized) to all active invitees | `BUSINESS` |
| best-and-final cap | 9 POLICY | Doc-3 §12.2 `eval.baf_rounds_max` | best-and-final invoked ≤ cap | `BUSINESS` |
```

**Rationale:** The two rows were listed 9 POLICY before 8 BUSINESS, contrary to the canonical Doc-4A §11.2 ascending stage order. Swapped to 8 BUSINESS → 9 POLICY. **Ordering correction only — no semantic change** (same rules, same authorities, same failure outcomes). *(Note: the `best-and-final cap` failure outcome remains as in the base; PB5-M3(A) is scoped to ordering, not the outcome cell — left unchanged to avoid scope creep.)*

---

### PB5-M3 (B) — §E8.1 `quotation_revised` — explicit internal-trigger (non-event) clarification

**Location 1:** §E8.1 — section **8. Event Binding**.

**Before:**

```
**8. Event Binding** — Emitted **none** (consumes quotation events; emits nothing) · Consumed **`QuotationSubmitted`** / **`QuotationWithdrawn`** (Doc-2 §8) + the quotation-revision trigger (revision is a non-event — Part 4 — surfaced as an internal trigger) · Idempotency: idempotent consumer (Doc-4A §16) — replay re-generates the same version content, no duplicate.
```

**After:**

```
**8. Event Binding** — Emitted **none** (consumes quotation events; emits nothing) · Consumed **`QuotationSubmitted`** / **`QuotationWithdrawn`** (Doc-2 §8). **`quotation_revised` is NOT a Doc-2 §8 event (PB5-M3 B):** quotation revision has no domain event (Part 4 §E7.2 — it is the `submitted → submitted` new-version transition + `edit (new version)` audit action only). It is an **internal application-layer trigger**: when `rfq.revise_quotation.v1` commits a new quotation version, the application layer **synchronously invokes** comparison regeneration (this contract) **in-process** — no outbox message, no domain event, no CDC, no separate contract. · Idempotency: idempotent consumer/invocation (Doc-4A §16) — replay re-generates the same version content, no duplicate.
```

**Location 2:** §E8.1 — section **12. AI-Agent Implementation Notes**.

**Before:**

```
**12. AI-Agent Implementation Notes** — **Never auto-recommend or mark a winner** (Doc-3 §9.1 FIXED) — the statement summarizes; humans decide. Bind vendor-standing columns to `matching_results` (PA-04), **not** a live Trust/Marketplace call. Buyer-private columns (own status/notes) are buyer-only (non-disclosure). Re-version on every quotation event; idempotent.
```

**After:**

```
**12. AI-Agent Implementation Notes** — **Never auto-recommend or mark a winner** (Doc-3 §9.1 FIXED) — the statement summarizes; humans decide. Bind vendor-standing columns to `matching_results` (PA-04), **not** a live Trust/Marketplace call. Buyer-private columns (own status/notes) are buyer-only (non-disclosure). Re-version on every quotation event; idempotent. **`quotation_revised` is an internal trigger, not an event (PB5-M3 B):** do **not** coin a Doc-2 §8 event, outbox message, or contract for it — quotation revision is a non-event (Part 4); comparison regeneration is invoked **synchronously in-process** by `rfq.revise_quotation.v1` on version commit. `QuotationSubmitted`/`QuotationWithdrawn` are the genuine Doc-2 §8 consumed events.
```

**Rationale:** Clarifies that `quotation_revised` in the `trigger_event` enum is an **internal application-layer trigger**, not a Doc-2 §8 event — consistent with Part 4, where quotation revision is a non-event (state + audit only). Documents the invocation: `revise_quotation` synchronously invokes comparison regeneration in-process; **no new event/outbox/CDC/contract**. Uses existing authority only.

---

# 3. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| **Ownership unchanged** | **CONFIRMED** | All edits within BC-5/BC-6-owned contracts; PB5-MA1 reads the existing `shortlisted_quotation_ids` (no new owner). |
| **Lifecycle unchanged** | **CONFIRMED** | No state/transition added; PB5-M1 specifies the *mechanism* of the existing Doc-2 §5.4 `quotations_received → buyer_reviewing` edge; PB5-MA1 enforces ordering within the existing `shortlisted → closed_won` edge. |
| **Authorization unchanged** | **CONFIRMED** | PB5-M2 records existing non-eligibility (no slug/grant change); no slug added/removed. |
| **Event catalog unchanged** | **CONFIRMED** | No event coined; PB5-M3(B) confirms `quotation_revised` is **not** an event; `QuotationSubmitted`/`QuotationWithdrawn`/`RFQClosedWon`/`QuotationSelected`/`RFQClosedLost` unchanged. |
| **Audit model unchanged** | **CONFIRMED** | No audit action added; PB5-MA1 failure is `BUSINESS` (existing class). |
| **POLICY model unchanged** | **CONFIRMED** | No POLICY key added; `eval.baf_rounds_max` / `eval.shortlist_max` unchanged; PB5-M3(A) reorders rows only. |
| **DDD boundaries unchanged** | **CONFIRMED** | BC-5/BC-6 boundary intact; no section added/removed. |
| **Procurement moat / firewall unchanged** | **CONFIRMED** | RFQ-owns / Marketplace-owns boundary intact; no plan influence; decision-support-never-decision and buyer-preference firewall untouched. |

**Regression posture:** surgical/additive only — one BUSINESS rule (reads existing shortlist state), one transition-mechanism specification (existing edge), five DELEGATION rows (existing non-eligibility), one row reorder, one internal-trigger clarification. No entity, aggregate, slug, event, audit action, POLICY key, state, or transition created; no rewrite; no frozen reopen; no carried dependency resolved.

---

# 4. Deferred Findings

| Finding | Disposition | Reason |
|---|---|---|
| **PB5-N1** | **NOT IMPLEMENTED** | Board-deferred NITPICK; no content change. Carried for a future cosmetic pass without reopening Part 5. |
| **PB5-N2** | **NOT IMPLEMENTED** | Board-deferred NITPICK; no content change. |
| **PB5-N3** | **NOT IMPLEMENTED** | Board-deferred NITPICK; no content change. |

---

# 5. Freeze Readiness

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** — none raised; none introduced. |
| **Open MAJOR** | **NO** — PB5-MA1 applied and closed. |
| **Open MINOR** | **NO** — PB5-M1, PB5-M2, PB5-M3 (A+B) applied and closed. |
| **Ready for Patch Verification** | **YES** |

**Justification.** All four Board-accepted findings are applied surgically: PB5-MA1 adds the shortlist-membership Stage-8 BUSINESS rule (reading the existing `shortlisted_quotation_ids` persisted by §E8.2; non-shortlisted award foreclosed, checked before commit); PB5-M1 specifies the comparison-read transition mechanism (inline, same transaction, state-guarded idempotency; no events/jobs/CDC/contracts); PB5-M2 adds explicit Stage-5 DELEGATION "not eligible" rows to the four buyer-decision contracts; PB5-M3(A) restores canonical 8→9 ordering in §E8.3; PB5-M3(B) documents `quotation_revised` as a non-event internal trigger. The three deferred NITPICKs (PB5-N1/N2/N3) are not implemented. Impact analysis confirms ownership, lifecycle, authorization, event catalog, audit model, POLICY model, DDD boundaries, and the procurement moat are unchanged; nothing was invented. The amended Part-5 conforms to `Doc-4E_PassA_v1.0_FROZEN`, the frozen structure, Parts 1–4 (FROZEN), and the frozen corpus, and carries DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]` unchanged. Part 5 is **ready for Pass-B Part-5 Patch Verification**.

> No conflict with the frozen corpus was encountered during patch application; no flag-and-halt was triggered. The shortlist set referenced by PB5-MA1 was verified already persisted by `rfq.shortlist_quotation.v1` (§E8.2) before adding the membership rule.

---

*End of Doc-4E_PassB_Part5_Patch_v1.0 — applies PB5-MA1 (shortlist-membership BUSINESS rule) + PB5-M1 (comparison-read transition mechanism) + PB5-M2 (explicit Stage-5 DELEGATION rows ×4 contracts) + PB5-M3 A (ordering) & B (`quotation_revised` internal-trigger); defers PB5-N1/N2/N3. Surgical/additive only; no ownership, lifecycle, authorization, event, audit, POLICY, DDD, or moat change; nothing invented. Decision: accepted findings closed; ready for Patch Verification. Canonical input: `Doc-4E_Content_v1.0_PassB_Part5_EvaluationComparisonAward.md` as amended by this patch.*