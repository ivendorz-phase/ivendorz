# Doc-4G_PassB_Part3_Patch_v1.0.md

## Status

**Approved Pass-B Part-3 Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_PassB_Part3_BC-TRUST-3_Performance_Scoring_v1.0.md`. Surgical, contract-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_PassB_Part3_BC-TRUST-3_Performance_Scoring_v1.0.md` |
| Produces | `Doc-4G_PassB_Part3_BC-TRUST-3_Performance_Scoring_v1.0` as amended by this patch (canonical input to Pass-B Part-3 Freeze) |
| Review authority | `Doc-4G_PassB_Part3_Independent_Hard_Review_v1.0` |
| Board adjudication | **Mandatory:** F4G-PB3-MA1, F4G-PB3-MA2, F4G-PB3-M1, F4G-PB3-M2, F4G-PB3-M3. **Recommended:** F4G-PB3-N1, F4G-PB3-N2 — applied. |
| Scope | Post-reactivation publication-candidate rule (MA1); `freeze_state` = publication-state overlay on lifecycle (MA2); §G6.4 validation N/A rows normalized (M1); single public-badge visibility model (M2); single consumer description (M3); de-duplicated "Not Rated ≠ 0" / "Financial Tier never feeds" to §H.9 (N1/N2). |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN, Doc-4G PassB Part1 FROZEN, Doc-4G PassB Part2 FROZEN — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**. Anchors verified verbatim against the base. |

This patch **introduces no contract, event, state, permission slug, audit action, or POLICY key**, and **modifies no ownership, aggregate, bounded context, lifecycle, or catalog**. The trust firewall, procurement moat, the F4G-M2 single-writer rule, and the F4G-M3 Buyer-Feedback dual-path are preserved unchanged. Escalation markers are preserved exactly — not removed, not renamed, not reinterpreted.

---

# 1. Exact Changes

---

### F4G-PB3-MA1 — §G6.2 — post-reactivation publication-candidate rule

> **Frozen-corpus authority:** Doc-2 §3.6 — "Freeze suspends publication and ranking **effect only**" + scores "auto-calculated" (the computed value stays current under freeze). Authoritative rule: while `freeze_state=frozen`, recomputation/snapshotting continue normally; **the latest successfully computed score (the current `performance_scores` row at reactivation) is the publication candidate** — reactivation publishes that latest value, not any earlier suppressed value. No earlier frozen snapshot is "queued"; there is exactly one current score.

#### F4G-PB3-MA1·a — §G6.2 §6 State Machine Enforcement

**Before:**

```
**6. State Machine Enforcement** — Targets **`not_rated`** (NULL score, below threshold) or **`computed`** (≥ threshold) (Doc-2 §3.6/§10.6); creates the `performance_scores` row if absent, else updates it + appends a `performance_score_history` snapshot on change · **Threshold gate:** `score` stays NULL/`not_rated` until `min_threshold_met` (**5 responses OR 2 projects**) — **never 0** (Doc-3 §12.1 FIXED) · **Frozen-state (authoritative, Doc-2 §3.6 "publication and ranking effect only"):** under `freeze_state=frozen`, **recompute ALLOWED, snapshot ALLOWED, publication SUPPRESSED** (no `PerformanceScoreUpdated` until reactivation) · Forbidden: no manual/hand-edited write path (firewall) · Concurrency: optimistic on row revision; lost race → `CONFLICT`.
```

**After:**

```
**6. State Machine Enforcement** — Targets **`not_rated`** (NULL score, below threshold) or **`computed`** (≥ threshold) (Doc-2 §3.6/§10.6); creates the `performance_scores` row if absent, else updates it + appends a `performance_score_history` snapshot on change · **Threshold gate:** `score` stays NULL/`not_rated` until `min_threshold_met` (**5 responses OR 2 projects**) — **never 0** (see §H.9(f)) · **Frozen-state (authoritative, Doc-2 §3.6 "publication and ranking effect only"):** under `freeze_state=frozen`, **recompute ALLOWED, snapshot ALLOWED, publication SUPPRESSED** (no `PerformanceScoreUpdated` until reactivation) · **Post-reactivation publication candidate (authoritative rule, MA1):** while frozen, **multiple recomputations may occur**, each updating the single current `performance_scores` row and appending a history snapshot; the **latest successfully computed score — i.e. the current `performance_scores` row at the moment of reactivation — is the publication candidate**. Reactivation publishes that latest value (one current score; no earlier suppressed value is queued or re-published). If the latest value is unchanged from what was last published before the freeze, publish-on-change applies (no event). · Forbidden: no manual/hand-edited write path (firewall) · Concurrency: optimistic on row revision; lost race → `CONFLICT`.
```

#### F4G-PB3-MA1·b — §G6.2 §8 Event Binding

**Before:**

```
**8. Event Binding** — Emitted **`PerformanceScoreUpdated`** (Doc-2 §8 — `trust.performance_scores`; **this contract is the publisher of record — H.7**) via Doc-4B outbox-write (one transaction), **publish-on-change only** (no event when score/level unchanged) · **Publication SUPPRESSED while `frozen`** — recompute + snapshot still occur, no event until reactivation · Also emitted by this publisher of record on a **reactivation-driven** change (requested by `trust.reactivate_performance_score.v1`) · Consumed: this contract is the **effect of a System trigger** — not itself a Doc-2 §8 consumer · Consumers of `PerformanceScoreUpdated`: Marketplace (badge read-model rebuild), RFQ (matching refresh) — each owns its own effect; Communication fan-out (DG-6).
```

**After:**

```
**8. Event Binding** — Emitted **`PerformanceScoreUpdated`** (Doc-2 §8 — `trust.performance_scores`; **this contract is the publisher of record — H.7**) via Doc-4B outbox-write (one transaction), **publish-on-change only** (no event when score/level unchanged) · **Publication SUPPRESSED while `frozen`** — recompute + snapshot still occur, no event until reactivation · **On reactivation**, this publisher of record publishes the **latest successfully computed score** (the current row; the publication candidate per §6/MA1) as a single `PerformanceScoreUpdated`, subject to publish-on-change (no event if unchanged from the last pre-freeze publication) · Consumed: this contract is the **effect of a System trigger** — not itself a Doc-2 §8 consumer · **Consumers per §H.7 (single consumer description — M3):** Marketplace consumes `PerformanceScoreUpdated` into its badge/directory read-model; RFQ consumes it as a matching signal; each owns its own effect (single-authorship); Trust makes no procurement decision; Communication owns notification fan-out (DG-6).
```

*(This After incorporates the F4G-PB3-M3 consumer normalization for §G6.2 §8 — M3 is applied here; the standalone §G6.2 §8 item under F4G-PB3-M3 is therefore folded into this MA1·b edit to avoid a double-edit of the same line.)*

#### F4G-PB3-MA1·c — §G6.2 §12 AI-Agent Notes

**Before:**

```
**12. AI-Agent Implementation Notes** — **System actor only**; never expose a vendor/buyer/staff endpoint to compute or edit a score; the score is **computed, never supplied**. **Not Rated (NULL) below 5 responses OR 2 projects — never 0** (Doc-3 §12.1 FIXED). **Buyer-Feedback Path A (`BuyerFeedbackRecorded`/Operations) and Path B (`public_reviews`/BC-TRUST-5) are distinct `performance_inputs` rows feeding one component — de-dup at computation, never naive-sum** (H.10). Financial Tier never feeds the score (H.9d). Emit `PerformanceScoreUpdated` **only on change**; this contract is the sole publisher of record (H.7). Formula tunables carry `[ESC-TRUST-POLICY]`; bump `performance_formula_version` — never invent a key.
```

**After:**

```
**12. AI-Agent Implementation Notes** — **System actor only**; never expose a vendor/buyer/staff endpoint to compute or edit a score; the score is **computed, never supplied**. **Not Rated semantics per §H.9(f)** (NULL below 5 responses OR 2 projects — never 0). **Buyer-Feedback dual-path per §H.10** (Path A `BuyerFeedbackRecorded`/Operations vs Path B `public_reviews`/BC-TRUST-5 — distinct rows, de-dup at computation, never naive-sum). **Firewall per §H.9** (Financial Tier never feeds the score). **Frozen recompute → reactivation:** while frozen, recompute/snapshot continue; on reactivation publish the **latest computed score** (publication candidate, §6/MA1), publish-on-change. This contract is the sole publisher of record for `PerformanceScoreUpdated` (H.7). Formula tunables carry `[ESC-TRUST-POLICY]`; bump `performance_formula_version` — never invent a key.
```

---

### F4G-PB3-MA2 — §H.5 + §G6.3 — `freeze_state` is a publication-state overlay on the lifecycle

> **Frozen-corpus authority:** Doc-2 §10.6 stores `freeze_state` as a **separate column** on `performance_scores`, distinct from the value lifecycle; Doc-2 §3.6 — "freeze suspends publication and ranking **effect only**." Authoritative model: **`freeze_state` (`none|frozen`) is a publication-state OVERLAY on the value lifecycle (`not_rated | computed`), not itself a lifecycle state.** The value lifecycle and the freeze overlay are orthogonal: a score is `not_rated` **or** `computed` (the value state) and independently `freeze_state=none` **or** `frozen` (the publication overlay). The §3.6 lifecycle string `not_rated → computed | frozen` denotes the **observed/published** state where `frozen` is the overlay surfacing on a `computed` (or `not_rated`) value. Used consistently throughout.

#### F4G-PB3-MA2·a — §H.5

**Before:**

```
- **H.5 — State machine (Doc-2 §3.6/§10.6; Doc-4A §13).** The BC-TRUST-3 lifecycles are exactly: **Performance Score** (`performance_scores`): **`not_rated → computed | frozen`** — `not_rated` until `min_threshold_met` (**5 responses OR 2 projects**, Doc-2 §10.6); freeze "suspends publication and ranking effect only" (Doc-2 §3.6, frozen-corpus rule); **`performance_score_history`** append-only; **`performance_inputs`** append-only (correctable; corrections audited). Transitions: ingest appends a `performance_inputs` row; compute writes/updates the score (NULL while `not_rated`) + a history snapshot on change; freeze sets `freeze_state=frozen`; reactivate clears it. **Frozen-state behavior (authoritative, Doc-2 §3.6 "publication and ranking effect only"):** under `freeze_state=frozen`, **recomputation is ALLOWED, history-snapshot creation is ALLOWED, publication is SUPPRESSED** (the underlying score stays current; only badge/ranking effect is withheld until reactivation) — identical to the frozen Part-2 §G5.1 ruling. Every mutation cites allowed **source state(s)**, **target state**, **forbidden source states** (→ `STATE`). Concurrency: optimistic — mutating commands assert the expected row revision; lost race → `CONFLICT`. **No edge added or modified.**
```

**After:**

```
- **H.5 — State machine (Doc-2 §3.6/§10.6; Doc-4A §13).** **Two orthogonal dimensions on `performance_scores` (authoritative model, MA2):** (1) the **value lifecycle** `not_rated → computed` — `not_rated` (score NULL) until `min_threshold_met` (**5 responses OR 2 projects**, Doc-2 §10.6), then `computed`; and (2) the **publication-state overlay** `freeze_state ∈ {none, frozen}` — a **separate Doc-2 §10.6 column**, **not** a lifecycle state, that overlays the value lifecycle and "suspends publication and ranking effect only" (Doc-2 §3.6). The two are independent: a score has a value state (`not_rated`/`computed`) **and** independently a freeze overlay (`none`/`frozen`). The §3.6 lifecycle string `not_rated → computed | frozen` denotes the **observed/published** state, where `frozen` is the overlay surfacing on a `computed` (or `not_rated`) value — the underlying computed value is retained throughout a freeze. **`performance_score_history`** append-only; **`performance_inputs`** append-only (correctable; corrections audited). Transitions: ingest appends a `performance_inputs` row; compute writes/updates the value (NULL while `not_rated`) + a history snapshot on change; **freeze sets the overlay `freeze_state=frozen` (no value change); reactivate sets `freeze_state=none` (no value change)**. **Frozen overlay behavior (authoritative, Doc-2 §3.6 "publication and ranking effect only"):** under `freeze_state=frozen`, **recomputation is ALLOWED, history-snapshot creation is ALLOWED, publication is SUPPRESSED** (the underlying score stays current; only badge/ranking effect is withheld until reactivation) — identical to the frozen Part-2 §G5.1 ruling. Every mutation cites allowed **source state(s)/overlay**, **target**, **forbidden source(s)** (→ `STATE`). Concurrency: optimistic — mutating commands assert the expected row revision; lost race → `CONFLICT`. **No edge added or modified; the overlay is the existing `freeze_state` column, not a new state.**
```

#### F4G-PB3-MA2·b — §G6.3 §6 State Machine Enforcement

**Before:**

```
**6. State Machine Enforcement** — `freeze`: allowed source **`computed`** or **`not_rated`** (`freeze_state=none`) → **`frozen`** (set `freeze_reason`/`frozen_at`); suspends publication/ranking effect only — underlying `score` retained · `reactivate`: allowed source **`frozen`** → **`none`** (publication resumes; recompute/republish via the `PerformanceScoreUpdated` publisher of record) · Forbidden: reactivate on non-`frozen` / freeze on already-`frozen` → `STATE` (or idempotent no-op, §10) · Concurrency: optimistic; lost race → `CONFLICT`. **No score value is written by this contract** (governance only; **freeze never penalizes a vendor**, Doc-3 §12.1 FIXED).
```

**After:**

```
**6. State Machine Enforcement** — operates on the **publication-state overlay `freeze_state` only** (the value lifecycle `not_rated|computed` is unchanged by this contract — MA2) · `freeze`: allowed overlay source **`freeze_state=none`** (over any value state `not_rated`/`computed`) → **`freeze_state=frozen`** (set `freeze_reason`/`frozen_at`); suspends publication/ranking effect only — underlying value (`score`/`not_rated`) retained · `reactivate`: allowed overlay source **`freeze_state=frozen`** → **`freeze_state=none`** (publication resumes; the `PerformanceScoreUpdated` publisher of record republishes the latest computed value — §G6.2/MA1) · Forbidden: reactivate when `freeze_state=none` / freeze when `freeze_state=frozen` → `STATE` (or idempotent no-op, §10) · Concurrency: optimistic; lost race → `CONFLICT`. **No value-lifecycle transition and no score value is written by this contract** (overlay governance only; **freeze never penalizes a vendor**, see §H.9(f)).
```

---

### F4G-PB3-M1 — §G6.4 — normalize validation presentation (explicit N/A stages)

> Add explicit N/A rows for the stages §G6.4 omits, matching the presentation style of the other contracts (which name all applicable stages and mark the inapplicable ones).

**Location:** §G6.4 §4 Validation Matrix — insert explicit `6 STATE` and `8 BUSINESS` N/A rows in canonical order (between the existing `5 AUTHORIZATION` row and the `7 REFERENCE` row, and after `7 REFERENCE`).

**Before:**

```
| 5 AUTHORIZATION (System-actor) | 5 AUTHORIZATION | Doc-4A §5.2/§21.5 | **none — System actor, no slug** (H.3); collapsed into §4 | — |
| score row resolves | 7 REFERENCE | Doc-2 §10.6 | `performance_scores` row exists for the subject | `REFERENCE` (unresolved) ; `DEPENDENCY` (store down) |
| review-cadence tunable | 9 POLICY | Doc-3 §12.2 | cadence/window absent → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |
```

**After:**

```
| 5 AUTHORIZATION (System-actor) | 5 AUTHORIZATION | Doc-4A §5.2/§21.5 | **none — System actor, no slug** (H.3); collapsed into §4 | — |
| (state) | 6 STATE | Doc-2 §3.6/§10.6 | **N/A — no score-state transition** (the trigger is a review signal; it never edits the score, H.9a) | — |
| score row resolves | 7 REFERENCE | Doc-2 §10.6 | `performance_scores` row exists for the subject | `REFERENCE` (unresolved) ; `DEPENDENCY` (store down) |
| (business) | 8 BUSINESS | Doc-2 §3.6 | **N/A — no quantitative business rule beyond the §3 review-condition semantic and §9 policy cadence** | — |
| review-cadence tunable | 9 POLICY | Doc-3 §12.2 | cadence/window absent → `[ESC-TRUST-POLICY]` | `BUSINESS` (policy-derived) |
```

---

### F4G-PB3-M2 — §G6.5 — single authoritative public-badge visibility model

> One visibility model, applied across response schema, authorization matrix, AI-agent notes, and the conformance ledger: **the public read exposes the BADGE only** — `level/badge` + `freeze_state` + `rated` (the three public fields); the numeric `score` is **never** public (staff-only via inputs/history). Badge suppressed while `frozen`; Not Rated surfaces as `rated=false`, never 0.

#### F4G-PB3-M2·a — §G6.5 §5 Authorization Matrix (get_performance_score)

**Before:**

```
- **`trust.get_performance_score.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public badge read, Doc-2 §3.6 "badge published unless frozen") · Scope **public** (per `vendor_profile_id`) · Visibility **public BADGE only** (level/badge + `freeze_state` + `rated`; badge suppressed while `frozen`; **Not Rated surfaces as Not Rated, never 0** — Doc-3 §12.1 FIXED); **the numeric `score` is NOT exposed publicly**, no inputs, no history.
```

**After:**

```
- **`trust.get_performance_score.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public badge read, Doc-2 §3.6 "badge published unless frozen") · Scope **public** (per `vendor_profile_id`) · Visibility **public BADGE only — the three public fields `level/badge` + `freeze_state` + `rated`** (badge suppressed while `frozen`; Not Rated surfaces as `rated=false`, never 0 — see §H.9(f)); **the numeric `score` is NEVER exposed publicly** (staff-only via inputs/history); no inputs, no history on this read. *(This is the single authoritative visibility model — identical wording in §3 Response Schema, §12 AI-Agent Notes, and the §G6.Z ledger.)*
```

#### F4G-PB3-M2·b — §G6.5 §12 AI-Agent Notes

**Before:**

```
**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). The **current public read is the BADGE only** (suppressed while `frozen`); the numeric `score` is **never** public — it appears only in **staff-only** inputs/history. **Not Rated surfaces as Not Rated, never 0** (Doc-3 §12.1 FIXED). Collapse non-entitled inputs/history reads to `NOT_FOUND` (§7.5). Marketplace reads the badge **via service projection**, never by direct table access.
```

**After:**

```
**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). **Single visibility model:** the public read is the **BADGE only — `level/badge` + `freeze_state` + `rated`** (suppressed while `frozen`); the numeric `score` is **never** public — it appears only in **staff-only** inputs/history. Not Rated surfaces as `rated=false`, never 0 (§H.9(f)). Collapse non-entitled inputs/history reads to `NOT_FOUND` (§7.5). Marketplace reads the badge **via service projection**, never by direct table access.
```

#### F4G-PB3-M2·c — §G6.Z ledger (visibility row added under permissions/firewall context)

**Before:**

```
| Permissions | Doc-2 §7 — `staff_can_verify`, `staff_can_ban` (freeze/reactivate OR; inputs/history `staff_can_verify`); badge read public (no slug); **computation + ingestion = System actor, no slug** |
```

**After:**

```
| Permissions | Doc-2 §7 — `staff_can_verify`, `staff_can_ban` (freeze/reactivate OR; inputs/history `staff_can_verify`); badge read public (no slug); **computation + ingestion = System actor, no slug** |
| Visibility (single model) | **Public read = BADGE only** (`level/badge` + `freeze_state` + `rated`; suppressed while frozen; Not Rated = `rated=false`, never 0); numeric `score` **never** public (staff-only via inputs/history) — consistent across §3/§5/§12 |
```

---

### F4G-PB3-M3 — §H.7 + §G6.2 + §G6.3 + cross-module refs — single consumer description

> One ownership-safe consumer description used consistently: **"Marketplace consumes `PerformanceScoreUpdated` into its badge/directory read-model; RFQ consumes it as a matching signal; each owns its own effect (single-authorship, Doc-4A §4.4); Trust makes no procurement decision; Communication owns notification fan-out (DG-6)."**

#### F4G-PB3-M3·a — §H.7 (consumer clause)

**Before:**

```
 BC-TRUST-3 **emits no Marketplace/RFQ effect** — those modules consume `PerformanceScoreUpdated` and author their own effects (single-authorship, Doc-4A §4.4). Notification fan-out is Communication's (DG-6).
```

**After:**

```
 BC-TRUST-3 **emits no Marketplace/RFQ effect** — **single authoritative consumer description (used consistently in this Part):** Marketplace consumes `PerformanceScoreUpdated` into its **badge/directory read-model**; RFQ consumes it as a **matching signal**; **each consumer owns its own effect** (single-authorship, Doc-4A §4.4); **Trust makes no procurement decision**; Communication owns **notification fan-out** (DG-6).
```

#### F4G-PB3-M3·b — §G6.2 §8 consumer clause

Applied within **F4G-PB3-MA1·b** (the §G6.2 §8 Event Binding edit already carries the single M3 consumer description), since both findings target the same line. No separate edit needed here.

#### F4G-PB3-M3·c — §G6.2 §11 Cross-Module References (align consumer wording)

**Before:**

```
**11. Cross-Module References** — reads own `performance_inputs`. **Marketplace (DG-2):** consumes `PerformanceScoreUpdated` into the badge read-model. **RFQ (DG-3):** consumes `PerformanceScoreUpdated` (matching refresh) — Trust makes no procurement decision. **Platform Core (DG-8):** outbox + audit. **Billing (DG-7):** no input (firewall). **Intra-module:** does **not** mutate Trust Score / Verification / Fraud (owner-only of Performance Score, H.9c).
```

**After:**

```
**11. Cross-Module References** — reads own `performance_inputs`. **Consumers per §H.7 (single description):** **Marketplace (DG-2)** consumes `PerformanceScoreUpdated` into its **badge/directory read-model**; **RFQ (DG-3)** consumes it as a **matching signal** — each owns its own effect (single-authorship); **Trust makes no procurement decision**. **Platform Core (DG-8):** outbox + audit. **Billing (DG-7):** no input (firewall). **Intra-module:** does **not** mutate Trust Score / Verification / Fraud (owner-only of Performance Score, §H.9(c)).
```

---

### F4G-PB3-N1 (recommended, applied) — de-duplicate "Not Rated ≠ 0" to §H.9(f)

> Single authoritative statement = §H.9(f). The §G6.Z firewall/moat row references it. No behavior change. *(The per-contract `never 0` mentions in §G6.2/§G6.5 are converted to "§H.9(f)" references under MA1·a/MA1·c/M2 above.)*

**Location:** §G6.Z — Firewall / moat ledger row.

**Before:**

```
| Firewall / moat | Per §H.9 (authoritative): Architecture §1.5 / Invariant 6 (Financial Tier never feeds Performance Score; no signal dominates; absence ≠ zero → Not Rated); Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED |
```

**After:**

```
| Firewall / moat | **Single authoritative statement at §H.9** (Financial Tier never feeds Performance Score — §H.9(d); no signal dominates; **Not Rated ≠ 0 / absence never zeroed — §H.9(f)**); Architecture §1.5 / Invariant 6; Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED — all per-contract mentions reference §H.9 |
```

---

### F4G-PB3-N2 (recommended, applied) — de-duplicate "Financial Tier never feeds Performance Score" to §H.9(d)

> Single authoritative statement = §H.9(d). The §G6.Z posture line references it. No behavior change. *(The per-contract mentions in §G6.2 are converted to "§H.9" references under MA1·c.)*

**Location:** §G6.Z — Firewall & moat (Part-3 posture).

**Before:**

```
**Firewall & moat (Part-3 posture) — authoritative statement at §H.9:** Performance Score is platform-owned, **System-computed only** — no vendor/buyer/staff/manual mutation; administrative action **freezes/reactivates publication only**; **`performance_inputs` has a single writer** (F4G-M2); **BC-TRUST-3 is owner-only of Performance Score and consumer of its inputs** — it mutates **no** Trust Score / Verification / Fraud; Financial Tier never feeds the score; no Billing influence; **Not Rated, never zero** below threshold (Doc-3 §12.1 FIXED); the Performance Score aggregate owns `PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen` with a single publisher of record each (H.7); Buyer-Feedback Path A/B de-duped at compute (H.10); Performance Score is a **signal only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**
```

**After:**

```
**Firewall & moat (Part-3 posture) — authoritative statement at §H.9:** Performance Score is platform-owned, **System-computed only** — no vendor/buyer/staff/manual mutation; administrative action **freezes/reactivates publication only** (overlay, MA2); **`performance_inputs` has a single writer** (F4G-M2); **BC-TRUST-3 is owner-only of Performance Score and consumer of its inputs** — it mutates **no** Trust Score / Verification / Fraud. The firewall rules — **Financial Tier never feeds the score (§H.9(d))**, no Billing influence, **Not Rated ≠ 0 / absence never zeroed (§H.9(f))** — are stated authoritatively at §H.9; per-contract mentions reference it. The Performance Score aggregate owns `PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen` with a single publisher of record each (H.7); Buyer-Feedback Path A/B de-duped at compute (H.10); Performance Score is a **signal only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**
```

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| **Contract Inventory** | **UNCHANGED** | 5 contract blocks / 8 contract IDs intact; no contract added/removed/split. All edits wording-level. |
| **Aggregate Ownership** | **UNCHANGED** | Performance Score → BC-TRUST-3; no aggregate added/moved. |
| **Lifecycle Ownership** | **UNCHANGED** | MA2 clarifies that `freeze_state` is the existing Doc-2 §10.6 **overlay column** (not a new state) over the existing `not_rated|computed` value lifecycle; MA1 adds the post-reactivation publication-candidate rule within the existing machine. No new state/edge. |
| **Event Ownership** | **UNCHANGED** | `PerformanceScoreUpdated`/`PerformanceReviewTriggered`/`PerformanceFrozen` still owned by the Performance Score aggregate, single publisher of record each; M3 normalizes consumer wording only; no event added/renamed; `VendorOwnershipTransferred` still consumed. |
| **Permission Ownership** | **UNCHANGED** | M2 visibility normalization touches no slug; freeze/reactivate OR over `staff_can_verify`/`staff_can_ban` unchanged; badge public/no-slug unchanged; no slug invented/renamed. |
| **Audit Ownership** | **UNCHANGED** | M1 adds explicit N/A validation rows only; §9 bindings + `[ESC-TRUST-AUDIT]` carries unchanged; no audit action invented. |
| **Policy Ownership** | **UNCHANGED** | No POLICY key added/changed; `[ESC-TRUST-POLICY]` carries unchanged. |
| **Trust Firewall** | **UNCHANGED** | Firewall rules centralized at §H.9 (N1/N2); System-only compute, owner-only inputs, Financial-Tier-never-feeds, no-Billing, Not-Rated≠0 all preserved. |
| **Procurement Moat** | **UNCHANGED** | Performance Score remains a signal only; no matching/routing/ranking/evaluation/selection/award; RFQ authoritative; M3 reaffirms "Trust makes no procurement decision." |
| **Single Writer Enforcement (F4G-M2)** | **PRESERVED** | `performance_inputs` single writer (`trust.ingest_performance_input.v1`) untouched. |
| **Buyer-Feedback Dual Path (F4G-M3)** | **PRESERVED** | Path A/B distinct rows, de-dup at compute — untouched (referenced via §H.10). |
| **Escalation Markers** | **PRESERVED EXACTLY** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained — not removed, not renamed, not reinterpreted. |
| **No invention** | **CONFIRMED** | No contract, event, state, slug, audit action, or POLICY key introduced. MA1/MA2 derive from frozen Doc-2 §3.6 ("publication and ranking effect only") + §10.6 (`freeze_state` separate column). |

---

*End of Doc-4G_PassB_Part3_Patch_v1.0 — applies F4G-PB3-MA1 (post-reactivation publication candidate = latest successfully computed score, publish-on-change), F4G-PB3-MA2 (`freeze_state` is a publication-state overlay on the `not_rated|computed` value lifecycle — separate Doc-2 §10.6 column, not a new state), F4G-PB3-M1 (§G6.4 validation N/A rows for 6 STATE / 8 BUSINESS normalized), F4G-PB3-M2 (single public-badge visibility model — `level/badge`+`freeze_state`+`rated`; numeric score never public), F4G-PB3-M3 (single ownership-safe consumer description — Marketplace badge/directory read-model, RFQ matching signal, each owns its effect, Trust no procurement decision), F4G-PB3-N1/N2 (de-duplicated "Not Rated ≠ 0" and "Financial Tier never feeds" to §H.9). Surgical/contract-level only; contract inventory, aggregate/lifecycle/event/permission/audit/policy ownership, trust firewall, procurement moat, F4G-M2 single-writer, and F4G-M3 dual-path preserved; escalation markers preserved exactly; nothing invented. Canonical input: `Doc-4G_PassB_Part3_BC-TRUST-3_Performance_Scoring_v1.0.md` as amended by this patch.*
