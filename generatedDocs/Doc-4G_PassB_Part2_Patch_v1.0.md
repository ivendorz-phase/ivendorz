# Doc-4G_PassB_Part2_Patch_v1.0.md

## Status

**Approved Pass-B Part-2 Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_PassB_Part2_BC-TRUST-2_Trust_Scoring_v1.0.md`. Surgical, contract-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_PassB_Part2_BC-TRUST-2_Trust_Scoring_v1.0.md` |
| Produces | `Doc-4G_PassB_Part2_BC-TRUST-2_Trust_Scoring_v1.0` as amended by this patch (canonical input to Pass-B Part-2 Freeze) |
| Review authority | `Doc-4G_PassB_Part2_Independent_Hard_Review_v1.0` |
| Board adjudication | **Mandatory:** F4G-PB2-MA1, F4G-PB2-MA2, F4G-PB2-M1, F4G-PB2-M2, F4G-PB2-M3. **Recommended:** F4G-PB2-N1, F4G-PB2-N2 — applied. |
| Scope | Frozen-state compute behavior made explicit (MA1); single publisher-of-record for `TrustScoreUpdated` (MA2); System-actor authorization terminology normalized (M1); single visibility statement "public band only" (M2); single input-ownership expression (M3); de-duplicated firewall statements (N1/N2). |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G Structure FROZEN, Doc-4G Pass-A FROZEN, Doc-4G PassB Part1 FROZEN — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**. Anchors verified verbatim against the base. |

This patch **introduces no contract, aggregate, bounded context, lifecycle state, event, permission slug, audit action, or POLICY key**. Ownership, aggregates, bounded contexts, lifecycle states, the event/permission/audit/policy catalogs, the trust firewall, and the procurement moat are preserved unchanged. Escalation markers are preserved exactly — not removed, not renamed, not reinterpreted.

---

# 1. Exact Changes

---

### F4G-PB2-MA1 — §G5.1 — explicit frozen-state compute behavior (one authoritative interpretation)

> **Frozen-corpus authority:** Doc-2 §3.6 — "Freeze suspends publication and ranking **effect only**." The word *only* is decisive: freeze suspends **nothing else**. Therefore the single authoritative interpretation under `freeze_state = frozen` is: **recomputation ALLOWED · history-snapshot creation ALLOWED · publication SUPPRESSED** (the underlying score stays current and auditable; only its public band and ranking effect are withheld until reactivation). This is stated explicitly with no "MAY"/inference wording.

#### F4G-PB2-MA1·a — §G5.1 §6 State Machine Enforcement

**Before:**

```
**6. State Machine Enforcement** — Target **`computed`** (Doc-2 §3.6/§10.6); creates the `trust_scores` row if absent, else updates it + appends a `trust_score_history` snapshot on change · A **`frozen`** score: computation MAY recompute the underlying value and snapshot it, but **publication/ranking effect stays suspended** (freeze semantics, H.5) — no `TrustScoreUpdated` publish of a band while frozen · Forbidden: no manual/`hand-edited` write path exists (firewall) · Concurrency: optimistic on row revision; lost race → `CONFLICT`.
```

**After:**

```
**6. State Machine Enforcement** — Target **`computed`** (Doc-2 §3.6/§10.6); creates the `trust_scores` row if absent, else updates it + appends a `trust_score_history` snapshot on change · **Behavior under `freeze_state = frozen` (authoritative, Doc-2 §3.6 — "freeze suspends publication and ranking effect only"):** (i) **recomputation is ALLOWED** — a frozen score is still recomputed when its inputs/formula change (freeze does not suspend computation); (ii) **history-snapshot creation is ALLOWED** — a changed recompute still appends one `trust_score_history` snapshot (the audit/history record stays current); (iii) **publication is SUPPRESSED** — no `TrustScoreUpdated` is emitted for a band change and no band/ranking effect is published while frozen; the suppressed publication resumes on reactivation. The underlying `score` therefore remains current and auditable throughout a freeze; only its public band and ranking effect are withheld. · Forbidden: no manual/`hand-edited` write path exists (firewall) · Concurrency: optimistic on row revision; lost race → `CONFLICT`.
```

#### F4G-PB2-MA1·b — §G5.1 §8 Event Binding (align the frozen-suppression wording)

**Before:**

```
**8. Event Binding** — Emitted **`TrustScoreUpdated`** (Doc-2 §8 — `trust.trust_scores`; **the Trust Score aggregate owns this event; this contract is the publisher of record**) via Doc-4B outbox-write (business write + event one transaction), **publish-on-change only** (no event when score/band unchanged) · Suppressed while `frozen` (no band publication) · Consumed: this contract is the **effect of a System trigger** (input-signal change / recalc) — not itself a Doc-2 §8 consumer · Consumers of `TrustScoreUpdated`: Marketplace (`vendor_matching_attributes` rebuild / directory re-rank), RFQ (matching refresh) — each owns its own effect (single-authorship); Communication fan-out (DG-6).
```

**After:**

```
**8. Event Binding** — Emitted **`TrustScoreUpdated`** (Doc-2 §8 — `trust.trust_scores`; **the Trust Score aggregate owns this event; this contract `trust.compute_trust_score.v1` is the publisher of record — see H.7**) via Doc-4B outbox-write (business write + event one transaction), **publish-on-change only** (no event when score/band unchanged) · **Publication SUPPRESSED while `frozen`** — recompute + snapshot still occur (MA1 §6), but no `TrustScoreUpdated` is emitted until reactivation · Consumed: this contract is the **effect of a System trigger** (input-signal change / recalc) — not itself a Doc-2 §8 consumer · Consumers of `TrustScoreUpdated`: Marketplace (`vendor_matching_attributes` rebuild / directory re-rank), RFQ (matching refresh) — each owns its own effect (single-authorship); Communication fan-out (DG-6).
```

---

### F4G-PB2-MA2 — §G5.2 + §H.7 — single authoritative publisher of record (no publisher ambiguity)

> **One publisher only:** `trust.compute_trust_score.v1` is the **publisher of record** for `TrustScoreUpdated`. Freeze/reactivate do **not emit** the event — they **request a publication-state change** that the publisher of record performs. No event-ownership change; no new event.

#### F4G-PB2-MA2·a — §H.7 (event governance — make the single publisher unambiguous)

**Before:**

```
- **H.7 — Events (Doc-2 §8 via Doc-4B `core.write_outbox_event.v1`).** **The Trust Score aggregate owns and emits exactly one event: `TrustScoreUpdated`** (Doc-2 §8 — `trust.trust_scores`), written transactionally (business write + event insert one transaction); **no event coined** (§16.4); **no publisher ambiguity** — `trust.compute_trust_score.v1` is the publisher of record, and freeze/reactivate **trigger** a publication-state change reflected via the same `TrustScoreUpdated` (the freeze/reactivate contract is not a separate publisher). **Consumed (Doc-2 §8, other modules):** `VendorOwnershipTransferred` (Marketplace — Trust Protection freeze trigger). BC-TRUST-2 **emits no Marketplace/RFQ effect** — those modules consume `TrustScoreUpdated` and author their own effects (single-authorship, Doc-4A §4.4). Notification fan-out is Communication's (DG-6), not authored here.
```

**After:**

```
- **H.7 — Events (Doc-2 §8 via Doc-4B `core.write_outbox_event.v1`).** **The Trust Score aggregate owns exactly one event: `TrustScoreUpdated`** (Doc-2 §8 — `trust.trust_scores`), written transactionally (business write + event insert one transaction); **no event coined** (§16.4). **Single publisher of record (authoritative):** `trust.compute_trust_score.v1` is the **only** publisher of `TrustScoreUpdated`. Every emission of the event — on a score/band change **and** on a freeze/reactivate publication-state change — is performed by the publisher of record. **Freeze/reactivate (`trust.freeze_trust_score.v1` / `trust.reactivate_trust_score.v1`) do NOT emit `TrustScoreUpdated`** — they **request** the publication-state change (suppress on freeze, resume on reactivate), which the publisher of record carries out; the freeze/reactivate contracts are never a second publisher. This removes all publisher ambiguity: **one event, one owning aggregate, one publisher of record.** **Consumed (Doc-2 §8, other modules):** `VendorOwnershipTransferred` (Marketplace — Trust-Protection freeze trigger). BC-TRUST-2 **emits no Marketplace/RFQ effect** — those modules consume `TrustScoreUpdated` and author their own effects (single-authorship, Doc-4A §4.4). Notification fan-out is Communication's (DG-6), not authored here.
```

#### F4G-PB2-MA2·b — §G5.2 §8 Event Binding (freeze/reactivate: "requests", not "emits")

**Before:**

```
**8. Event Binding** — Emitted **`TrustScoreUpdated`** (Doc-2 §8) on freeze-state change (band publication suppressed on freeze / resumed on reactivate), via outbox-write — **the Trust Score aggregate owns the event; the freeze/reactivate contract triggers a publication-state change reflected via `TrustScoreUpdated`, it is not a separate publisher** (publisher of record = the aggregate; H.7) · **Consumed: `VendorOwnershipTransferred`** (Marketplace, Doc-2 §8) as a **Trust-Protection freeze trigger** (an admin/automated freeze on ownership transfer) · Consumers of the emitted event: Marketplace/RFQ read-model + matching refresh, Communication fan-out (DG-6).
```

**After:**

```
**8. Event Binding** — **This contract emits NO event directly.** It **requests** a publication-state change of `TrustScoreUpdated` (suppress on freeze / resume on reactivate, Doc-2 §8); the **publisher of record** `trust.compute_trust_score.v1` performs any resulting emission (single publisher — H.7 / MA2). The Trust Score aggregate owns `TrustScoreUpdated`; freeze/reactivate is never a second publisher · **Consumed: `VendorOwnershipTransferred`** (Marketplace, Doc-2 §8) as a **Trust-Protection freeze trigger** (an admin/automated freeze on ownership transfer) · Downstream consumers of `TrustScoreUpdated`: Marketplace/RFQ read-model + matching refresh, Communication fan-out (DG-6).
```

#### F4G-PB2-MA2·c — §G5.2 §12 AI-Agent Notes (align publisher wording)

**Before:**

```
**12. AI-Agent Implementation Notes** — freeze/reactivate is **governance, not a score edit** — never modify `score`/`band`; only `freeze_state`/`freeze_reason`/`frozen_at`. Authorization is an **OR** over `staff_can_verify`/`staff_can_ban`. The emitted `TrustScoreUpdated` is owned by the Trust Score aggregate (publisher of record); this contract **triggers** the publication-state change, it is not a second publisher. `VendorOwnershipTransferred` is a **consume** (Trust-Protection freeze), never a Trust emission. Freeze suspends publication/ranking only — the score persists.
```

**After:**

```
**12. AI-Agent Implementation Notes** — freeze/reactivate is **governance, not a score edit** — never modify `score`/`band`; only `freeze_state`/`freeze_reason`/`frozen_at`. Authorization is an **OR** over `staff_can_verify`/`staff_can_ban`. This contract **emits no event**; it **requests** the publication-state change, and the single publisher of record `trust.compute_trust_score.v1` performs any `TrustScoreUpdated` emission (H.7). Do **not** add an outbox-write for `TrustScoreUpdated` inside the freeze/reactivate handler. `VendorOwnershipTransferred` is a **consume** (Trust-Protection freeze), never a Trust emission. Freeze suspends publication/ranking only — the score persists.
```

---

### F4G-PB2-M1 — §G5.1 — normalize System-actor authorization terminology

> One consistent System-actor model: **Authorization = none (System actor; no slug); enforcement = trigger-authenticity (Doc-4A §21.5)** — used identically in the Validation Matrix and the Authorization Matrix.

#### F4G-PB2-M1·a — §G5.1 §4 Validation Matrix (authentication/authorization rows)

**Before:**

```
| trigger authenticity | 4 AUTHENTICATION / 4–5 collapse (System) | Doc-4A §21.5/§11.2 | System actor; trusted trigger (no tenant context/authz/scope/delegation) | `AUTHORIZATION` (untrusted trigger) |
| (authorization) | 5 AUTHORIZATION | Doc-4A §5.2 | **none — System actor, no slug** (H.3) | — |
```

**After:**

```
| System-actor trigger authenticity | 4 AUTHENTICATION / 4–5 collapse (System) | Doc-4A §21.5/§11.2 | System actor; **Authorization = none (no slug)**; enforcement = trigger-authenticity (no tenant context/authz/scope/delegation) | `AUTHORIZATION` (untrusted trigger) |
| 5 AUTHORIZATION (System-actor) | 5 AUTHORIZATION | Doc-4A §5.2/§21.5 | **Authorization = none — System actor, no slug**; collapsed into the §4 trigger-authenticity check (H.3) | — |
```

#### F4G-PB2-M1·b — §G5.1 §5 Authorization Matrix

**Before:**

```
**5. Authorization Matrix** — Actor **System** · Slug **none** (System actor; **no tenant/staff slug** — scores auto-calculated, never hand-edited; Doc-4A §5.2; Doc-2 §3.6) · Scope = platform/system · Delegation n/a · Enforcement = trigger-authenticity (Doc-4A §21.5). **No staff-, vendor-, or buyer-triggered computation path exists.**
```

**After:**

```
**5. Authorization Matrix** — Actor **System** · **Authorization = none** (System actor; **no slug** — no tenant/staff/vendor/buyer slug; scores auto-calculated, never hand-edited; Doc-4A §5.2; Doc-2 §3.6) · Scope = platform/system · Delegation n/a · **Enforcement = trigger-authenticity** (Doc-4A §21.5; stages 4–5 collapse to the single trigger-authenticity check). **No staff-, vendor-, or buyer-triggered computation path exists.** *(Same System-actor authorization model as the frozen Part-1 §G4.5 System contract — terminology normalized.)*
```

---

### F4G-PB2-M2 — §G5.3 — single authoritative visibility statement ("public band only")

> One visibility statement, applied across response schema, authorization matrix, AI-agent notes, and the conformance ledger: **the current trust-score read exposes the public BAND only** (Doc-2 §3.6 "band published unless frozen"; band suppressed while frozen). The numeric `score` is **not** part of the public read — only the band, `trust_score_updated_at`, and `freeze_state`. History (with score) is staff-only.

#### F4G-PB2-M2·a — §G5.3 §3 Response Schema

**Before:**

```
**3. Response Schema** — *get_trust_score:* `score : numeric (0..1; null/suppressed while frozen)`, `band : enum/string (1)`, `trust_score_updated_at : timestamptz (1)`, `freeze_state : enum<none|frozen> (1)` — **public band/score unless frozen** (Doc-2 §3.6); no internal formula internals beyond `trust_formula_version`. *list_trust_score_history:* page of snapshots (score, band, `formula_version`, timestamp) — **staff view**. Every response carries `reference_id : uuid (1)`.
```

**After:**

```
**3. Response Schema** — *get_trust_score (public band only):* `band : enum/string (1; suppressed while frozen)`, `trust_score_updated_at : timestamptz (1)`, `freeze_state : enum<none|frozen> (1)` — **public BAND only** (Doc-2 §3.6 "band published unless frozen"); the numeric `score` is **not** exposed on the public read, and no formula internals are returned. *list_trust_score_history (staff only):* page of snapshots (`score`, `band`, `formula_version`, timestamp) — staff view; the numeric `score` appears **only** here under `staff_can_verify`. Every response carries `reference_id : uuid (1)`.
```

#### F4G-PB2-M2·b — §G5.3 §5 Authorization Matrix (get_trust_score visibility)

**Before:**

```
- **`trust.get_trust_score.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public band/score read, Doc-2 §3.6 "band published unless frozen") · Scope **public** (per `vendor_profile_id`) · Visibility **public band + score (suppressed/absent while `frozen`)**; no history, no formula internals beyond `trust_formula_version`.
```

**After:**

```
- **`trust.get_trust_score.v1`** — Actor **internal-service / any caller via public projection** · Authorization **none** (public band read, Doc-2 §3.6 "band published unless frozen") · Scope **public** (per `vendor_profile_id`) · Visibility **public BAND only** (band + `trust_score_updated_at` + `freeze_state`; band suppressed while `frozen`); **the numeric `score` is NOT exposed publicly**, no history, no formula internals.
```

#### F4G-PB2-M2·c — §G5.3 §6 + §12 (align "band only")

**Before:**

```
**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only). A `frozen` score is reported with `freeze_state=frozen` and its band/score publication suppressed (Doc-2 §3.6) — never fabricated, never silently shown.
```

**After:**

```
**6. State Machine Enforcement** — n/a — **queries do not mutate state** (read-only). A `frozen` score is reported with `freeze_state=frozen` and its **band** publication suppressed (Doc-2 §3.6) — never fabricated, never silently shown (the numeric `score` is staff-only via history regardless).
```

**Before:**

```
**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). The **current band/score is public** (suppressed while `frozen`); **history is staff-only** — collapse non-entitled history reads to `NOT_FOUND` (§7.5). Never fabricate a band for a `frozen` score; report `freeze_state`. Marketplace reads the band **via service projection**, never by direct table access.
```

**After:**

```
**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). The **current public read is the BAND only** (suppressed while `frozen`); the numeric `score` is **never** returned on the public read — it appears only in **staff-only history**. Collapse non-entitled history reads to `NOT_FOUND` (§7.5). Never fabricate a band for a `frozen` score; report `freeze_state`. Marketplace reads the band **via service projection**, never by direct table access.
```

---

### F4G-PB2-M3 — Part-level firewall / cross-module / AI-agent notes — single input-ownership expression

> One consistent ownership expression for the three score inputs: **"owned by BC-TRUST-N, read-only via same-module read-service"** — Verification owned by **BC-TRUST-1**, Performance owned by **BC-TRUST-3**, Fraud owned by **BC-TRUST-4**. No "aggregate/service/state" drift; ownership unchanged.

#### F4G-PB2-M3·a — §H.9(b)

**Before:**

```
 (b) **BC-TRUST-2 is consumer-only of its inputs** — it reads Verification status (BC-TRUST-1), Performance score (BC-TRUST-3), and Fraud-signal state (BC-TRUST-4) via **same-module read-services, read-only**, and **never mutates Verification, Performance, or Fraud**; source ownership stays with BC-TRUST-1/3/4.
```

**After:**

```
 (b) **BC-TRUST-2 is consumer-only of its inputs** — it reads its three score inputs, each **owned by its source context and consumed read-only via a same-module read-service**: **Verification — owned by BC-TRUST-1**; **Performance — owned by BC-TRUST-3**; **Fraud — owned by BC-TRUST-4**. BC-TRUST-2 **never mutates** any of them; source ownership stays with BC-TRUST-1/3/4 (this is the single ownership expression used throughout this Part).
```

#### F4G-PB2-M3·b — §G5.1 §11 Cross-Module References

**Before:**

```
**11. Cross-Module References** — **Intra-module (B.9a, read-only):** Verification status (BC-TRUST-1), Performance score (BC-TRUST-3), Fraud-signal state (BC-TRUST-4) via same-module Trust read-services — **never mutated**. **Marketplace (DG-2):** consumes `TrustScoreUpdated` into the directory read-model. **RFQ (DG-3):** consumes `TrustScoreUpdated` (matching refresh) — Trust makes no procurement decision. **Platform Core (DG-8):** outbox + audit. **Billing (DG-7):** **no input** (firewall).
```

**After:**

```
**11. Cross-Module References** — **Intra-module (B.9a, read-only — each input owned by its source context, consumed via same-module read-service, never mutated):** Verification — owned by **BC-TRUST-1**; Performance — owned by **BC-TRUST-3**; Fraud — owned by **BC-TRUST-4**. **Marketplace (DG-2):** consumes `TrustScoreUpdated` into the directory read-model. **RFQ (DG-3):** consumes `TrustScoreUpdated` (matching refresh) — Trust makes no procurement decision. **Platform Core (DG-8):** outbox + audit. **Billing (DG-7):** **no input** (firewall).
```

#### F4G-PB2-M3·c — §G5.1 §12 (align input-ownership phrasing)

**Before:**

```
 Inputs are **read-only**; **never write** `verification_records`/`performance_scores`/`fraud_signals` (consumer-only).
```

**After:**

```
 Inputs are **read-only**, each **owned by its source context** (Verification → BC-TRUST-1, Performance → BC-TRUST-3, Fraud → BC-TRUST-4) and consumed via a same-module read-service; **never write** `verification_records`/`performance_scores`/`fraud_signals` (consumer-only).
```

---

### F4G-PB2-N1 (recommended, applied) — de-duplicate "Financial Tier never feeds Trust Score"

> Single authoritative location = §H.9(c). Other occurrences reference it instead of restating, where practical. No behavior change.

#### F4G-PB2-N1·a — §G5.1 §12 AI-Agent Notes

**Before:**

```
 **Financial Tier never feeds the score; no signal dominates; absence-of-history is never scored as 0** (Doc-3 §12.1 FIXED). Emit `TrustScoreUpdated` **only on change**, transactionally; the Trust Score aggregate is the sole publisher.
```

**After:**

```
 Firewall rules per **§H.9(c)/(f)** (Financial Tier never feeds the score; no signal dominates; absence-of-history never zeroed — Architecture §1.5 / Doc-3 §12.1 FIXED). Emit `TrustScoreUpdated` **only on change**, transactionally; the single publisher of record is `trust.compute_trust_score.v1` (H.7).
```

#### F4G-PB2-N1·b — §G5.Z conformance ledger (firewall/moat row reference)

**Before:**

```
| Firewall / moat | Architecture §1.5 / Invariant 6 (Financial Tier never feeds Trust Score; no signal dominates; absence ≠ zero); Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED |
```

**After:**

```
| Firewall / moat | Per §H.9 (authoritative): Architecture §1.5 / Invariant 6 (Financial Tier never feeds Trust Score; no signal dominates; absence ≠ zero); Doc-4A §4B; Doc-3 §11.8/§12.1 FIXED |
```

---

### F4G-PB2-N2 (recommended, applied) — de-duplicate "absence-of-history ≠ zero"

> Single authoritative location = §H.9(f). The §G5.Z posture line references it instead of restating. No behavior change.

**Location:** §G5.Z — Firewall & moat (Part-2 posture).

**Before:**

```
**Firewall & moat (Part-2 posture):** Trust Score is platform-owned, **System-computed only** — no staff/vendor/buyer/manual mutation; **BC-TRUST-2 is consumer-only** of Verification/Performance/Fraud inputs and mutates none of them (source ownership stays BC-TRUST-1/3/4); Financial Tier never feeds the score; no Billing influence; absence-of-history never zeroed; the **Trust Score aggregate owns `TrustScoreUpdated`** (no publisher ambiguity); Trust Score is a **signal only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**
```

**After:**

```
**Firewall & moat (Part-2 posture) — authoritative statement at §H.9:** Trust Score is platform-owned, **System-computed only** — no staff/vendor/buyer/manual mutation; **BC-TRUST-2 is consumer-only** of its three inputs (Verification → BC-TRUST-1, Performance → BC-TRUST-3, Fraud → BC-TRUST-4) and mutates none of them; the firewall rules (Financial Tier never feeds the score; no Billing influence; **absence-of-history never zeroed**) are stated authoritatively at §H.9(c)/(d)/(f); the **Trust Score aggregate owns `TrustScoreUpdated`** with a single publisher of record (H.7 — no publisher ambiguity); Trust Score is a **signal only** — no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. **No flag-and-halt triggered; no corpus conflict.**
```

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| **Contract Inventory** | **UNCHANGED** | 3 contract blocks / 5 contract IDs intact; no contract added/removed/split. All edits are wording-level. |
| **Aggregate Ownership** | **UNCHANGED** | Trust Score → BC-TRUST-2; no aggregate added/moved. M3 restates input ownership (BC-TRUST-1/3/4) without changing it. |
| **Lifecycle Ownership** | **UNCHANGED** | MA1 makes the frozen-state behavior of the existing `computed | frozen` machine explicit (recompute allowed, snapshot allowed, publication suppressed — per Doc-2 §3.6 "publication and ranking effect only"); no new state/edge. |
| **Event Ownership** | **UNCHANGED** | `TrustScoreUpdated` still owned by the Trust Score aggregate; MA2 fixes to a single publisher of record (`trust.compute_trust_score.v1`); freeze/reactivate now "request" not "emit"; no event added/renamed; `VendorOwnershipTransferred` still consumed. |
| **Permission Ownership** | **UNCHANGED** | M1 normalizes System-actor authorization terminology only (no slug change); freeze/reactivate OR over `staff_can_verify`/`staff_can_ban` unchanged; history `staff_can_verify` unchanged; no slug invented/renamed. |
| **Audit Ownership** | **UNCHANGED** | §9 bindings (recalculation / formula version change / freeze + reactivation) unchanged; no audit action invented; no `[ESC-TRUST-AUDIT]` change. |
| **Policy Ownership** | **UNCHANGED** | No POLICY key added/changed; `[ESC-TRUST-POLICY]` carries unchanged. |
| **Trust Firewall** | **UNCHANGED** | MA1/M2/M3/N1/N2 clarify/de-duplicate firewall wording; the rules (System-only compute, consumer-only inputs, Financial Tier never feeds, no Billing input, absence ≠ zero) are unchanged and now centralized at §H.9. |
| **Procurement Moat** | **UNCHANGED** | Trust Score remains a signal only; no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. |
| **Escalation Markers** | **PRESERVED EXACTLY** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained — not removed, not renamed, not reinterpreted. |
| **No invention** | **CONFIRMED** | No contract, aggregate, bounded context, lifecycle state, event, slug, audit action, or POLICY key introduced. MA1 derives its ruling from the frozen Doc-2 §3.6 "publication and ranking effect only" text. |

---

*End of Doc-4G_PassB_Part2_Patch_v1.0 — applies F4G-PB2-MA1 (frozen-state compute behavior explicit: recompute ALLOWED · snapshot ALLOWED · publication SUPPRESSED, per Doc-2 §3.6 "publication and ranking effect only"), F4G-PB2-MA2 (single publisher of record for `TrustScoreUpdated` = `trust.compute_trust_score.v1`; freeze/reactivate request not emit), F4G-PB2-M1 (System-actor authorization terminology normalized — Authorization = none, enforcement = trigger-authenticity), F4G-PB2-M2 (single visibility statement "public band only"; numeric score staff-only), F4G-PB2-M3 (single input-ownership expression — Verification/BC-TRUST-1, Performance/BC-TRUST-3, Fraud/BC-TRUST-4, read-only), F4G-PB2-N1/N2 (de-duplicated firewall statements to §H.9). Surgical/contract-level only; contract inventory, aggregate/lifecycle/event/permission/audit/policy ownership, trust firewall, and procurement moat preserved; escalation markers preserved exactly; nothing invented. Canonical input: `Doc-4G_PassB_Part2_BC-TRUST-2_Trust_Scoring_v1.0.md` as amended by this patch.*
