# Doc-4E_PassB_Part3_Patch_v1.0.md

## Status

**Approved Pass-B Part-3 Patch** — applies the Architecture-Board-adjudicated findings of `Doc-4E_PassB_Part3_Independent_Hard_Review_v1.0` to `Doc-4E_Content_v1.0_PassB_Part3_RoutingGovernance.md`.

| Field | Value |
|---|---|
| Applies to | `Doc-4E_Content_v1.0_PassB_Part3_RoutingGovernance.md` *(the request cited `…_RoutingAndGovernance`; the on-disk artifact is `…_RoutingGovernance` — same document, name reconciled here)* |
| Produces | Part 3 as amended by this patch (canonical input to Pass-B Part-3 Patch Verification) |
| Review source | `Doc-4E_PassB_Part3_Independent_Hard_Review_v1.0` |
| Board adjudication | **Apply:** PB3-M1, PB3-M2. **Optional (apply if non-invasive/corpus-safe):** PB3-N1 — applied, retargeted to the correct contract. **Defer (no patch):** PB3-N2. |
| Scope | One MINOR validation-completeness row (REFERENCE on `invitation_id`); one MINOR idempotency-authority correction (dedup-window → `[ESC-RFQ-POLICY]`); one optional `RFQRouted`-emission clarification. **No routing/governance redesign, no Pass-A reopen, no behavior change.** |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E_Structure_v1.0_FROZEN, Doc-4E_PassA_v1.0_FROZEN, Doc-4E_PassB_Part1_v1.0_FROZEN, Doc-4E_PassB_Part2_v1.0_FROZEN — all FROZEN |
| Application model | Additive amendment document (Board-applied). Each item quotes the exact **Before** text present verbatim in the base Part-3, gives the **After**, and states the rationale. |

All frozen ownership boundaries, routing/governance ownership, lifecycle, event catalog, audit catalog, authorization model, and the procurement moat are preserved. This patch **invents no event, slug, audit action, POLICY key, state, or transition**. Carried dependencies DE-1…DE-8, `[ESC-RFQ-AUDIT]`, `[ESC-RFQ-POLICY]`, `[ESC-RFQ-SLUG]` carried unchanged.

---

# 1. Patch Summary

| Finding | Severity | Location | Disposition |
|---|---|---|---|
| **PB3-M1** | MINOR | §E6.4 `rfq.respond_to_invitation.v1` — Validation Matrix | **APPLIED** — added the explicit Stage 7 REFERENCE row resolving `invitation_id` to an existing `rfq_invitations` record. |
| **PB3-M2** | MINOR | §H.8 (global conventions) + §E6.4 item 10 — idempotency dedup-window authority | **APPLIED** — corpus verified: **no `rfq.*` dedup-window POLICY key exists**; replaced "dedup window (POLICY)" with the `[ESC-RFQ-POLICY]` escalation per the finding's own branch. No key invented. |
| **PB3-N1** | NITPICK (optional) | routing contract — `RFQRouted` emission | **APPLIED (corpus-safe), retargeted** to `rfq.assemble_and_route_wave.v1` (the request named `rfq.route_suppliers.v1`, which does not exist in Pass-A/Part-3). |
| **PB3-N2** | NITPICK | (deferred) | **DEFERRED — No Patch Applied.** Content unchanged. |

PB3-M1 + PB3-M2 applied; PB3-N1 applied (retargeted to the real contract); PB3-N2 deferred. Nothing invented.

---

# 2. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4E_Content_v1.0_PassB_Part3_RoutingGovernance.md` and gives the **After**. Anchors verified verbatim against the base.

### PB3-M1 — §E6.4 `rfq.respond_to_invitation.v1` — add Stage 7 REFERENCE row

**Location:** §E6.4 — section **4. Validation Matrix**, inserted between the Stage 6 STATE row and the Stage 8 BUSINESS row (canonical nine-stage order: REFERENCE is stage 7, after STATE).

**Before:**

```
| invitation state = `delivered` | 6 STATE | Doc-2 §3.4 | response legal only from `delivered` | `STATE` |
| window open | 8 BUSINESS | Doc-3 §8.1/§8.5 | RFQ quotation window open (decline allowed any time before close) | `STATE`/`BUSINESS` |
```

**After:**

```
| invitation state = `delivered` | 6 STATE | Doc-2 §3.4 | response legal only from `delivered` | `STATE` |
| `invitation_id` resolves | 7 REFERENCE | Doc-4A §4.5/§9.5; Doc-2 §10.4 (RFQ Invitation aggregate) | `invitation_id` MUST resolve to an existing `rfq_invitations` record (owned by the RFQ Invitation aggregate) | `NOT_FOUND` (protected-fact collapse, §7.5 / §12.4 — a non-resolving or non-visible invitation is indistinguishable from not-found) |
| window open | 8 BUSINESS | Doc-3 §8.1/§8.5 | RFQ quotation window open (decline allowed any time before close) | `STATE`/`BUSINESS` |
```

**Rationale:** The Request Schema declares `invitation_id` but the Validation Matrix lacked an explicit reference-resolution stage. The added Stage 7 REFERENCE row resolves `invitation_id` against the RFQ Invitation aggregate, matching the finding's intent and the canonical Doc-4A §11.2 ordering (REFERENCE after STATE). **Failure-class note:** per Doc-4A §12.4 / §7.5, a non-resolving or non-visible invitation **collapses to `NOT_FOUND`** (the protected-fact discipline already used by the SCOPE row), rather than a distinct `REFERENCE_NOT_FOUND` — this keeps the contract consistent with the non-disclosure invariant and the Doc-4A §12 closed class set (no new error code coined). No behavior, lifecycle, or ownership change — the resolution was always implied; this makes it explicit.

---

### PB3-M2 (a) — §H.8 — dedup-window authority correction (global conventions)

**Location:** §H.8 (Part-3 Hardening Conventions), idempotency sentence for `respond_to_invitation`.

**Before:**

```
- **H.8 — Idempotency (Doc-4A §14).** System contracts inherently idempotent (re-fire safe): a replay produces the same invitation/`matching_results`/`rfq_routing_log` state with no duplicate `VendorInvited`/audit. `respond_to_invitation` carries `Idempotency: required` + dedup window (POLICY); replay → same invitation state, no duplicate. Admin mutations (`manage_routing_rule`) carry `Idempotency: required`. Queries are side-effect-free.
```

**After:**

```
- **H.8 — Idempotency (Doc-4A §14).** System contracts inherently idempotent (re-fire safe): a replay produces the same invitation/`matching_results`/`rfq_routing_log` state with no duplicate `VendorInvited`/audit. `respond_to_invitation` and `manage_routing_rule` carry `Idempotency: required` with a deduplication window whose **authority is unresolved — carried as `[ESC-RFQ-POLICY]`**: no `rfq.*` dedup-window POLICY key exists in Doc-3 §12.2 (the `core.*_dedup_window` keys are Module-0 infrastructure, firewalled from RFQ use per Doc-3 §12.1 / Doc-4A §18.3). **No POLICY key or value is invented**; the dedup-window value is implementation-blocked until the authority is resolved via the Doc-3 §12.2 additive channel (`[ESC-RFQ-POLICY]`). Replay within the (to-be-authorized) window → same state, no duplicate. Queries are side-effect-free.
```

### PB3-M2 (b) — §E6.4 item 10 — dedup-window authority correction (respond_to_invitation)

**Location:** §E6.4 — section **10. Idempotency Rules**.

**Before:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (POLICY); replay after a response returns the resulting invitation state with no duplicate audit; the state assertion (`delivered`) makes a second response a `STATE` no-op (or idempotent same-result within the window).
```

**After:**

```
**10. Idempotency Rules** — `Idempotency: required` + a deduplication window whose **authority is unresolved — carried as `[ESC-RFQ-POLICY]`** (no `rfq.*` dedup-window key in Doc-3 §12.2; Module-0 `core.*_dedup_window` keys are firewalled from RFQ use; **no key/value invented** — dedup-window value implementation-blocked until resolved via the Doc-3 §12.2 additive channel); replay after a response returns the resulting invitation state with no duplicate audit; the state assertion (`delivered`) makes a second response a `STATE` no-op (or idempotent same-result within the to-be-authorized window).
```

**Rationale (PB3-M2 a+b):** The finding required identifying the dedup-window authority source. Corpus verification confirms **no `rfq.*` deduplication-window POLICY key exists** in Doc-3 §12.2; the only `*_dedup_window` keys are Module-0 `core.*` infrastructure keys explicitly firewalled from routing/RFQ use (Doc-3 §12.1; Doc-4A §18.3). Per the finding's own decision branch ("otherwise… `[ESC-RFQ-POLICY]`, implementation blocked until policy authority resolved") and the never-invent rule, the wording is replaced with the `[ESC-RFQ-POLICY]` escalation. This preserves the escalation model, invents no key or value, and changes no behavior (idempotency is still required; only the window's authority is correctly marked unresolved).

---

### PB3-N1 (optional, applied — retargeted) — `RFQRouted` emission clarification

**Location:** §E6.1 `rfq.assemble_and_route_wave.v1` — section **8. Event Binding**. *(The request named `rfq.route_suppliers.v1`; no such contract exists in Pass-A or Part-3. The routing-execution contract that emits `RFQRouted` is `rfq.assemble_and_route_wave.v1` — the clarification is applied there.)*

**Before:**

```
**8. Event Binding** — Emitted **`RFQRouted`** (Doc-2 §8; PATCH-06) + **`VendorInvited`** per transition to `delivered` (Doc-2 §8 — never on `selected`/`deferred`) · Consumed none · Trigger: routing-pipeline completion · Idempotency: replay → same invitation set, one `VendorInvited` per delivered invitation, no duplicate.
```

**After:**

```
**8. Event Binding** — Emitted **`RFQRouted`** (Doc-2 §8; PATCH-06) — **exactly one `RFQRouted` per routing execution; never multiple `RFQRouted` for a single execution** (a separate replenishment execution, §E6.2, emits its own separate `RFQRouted`) — + **`VendorInvited`** per transition to `delivered` (Doc-2 §8 — never on `selected`/`deferred`) · Consumed none · Trigger: routing-pipeline completion · Idempotency: replay → same invitation set, one `RFQRouted` and one `VendorInvited` per delivered invitation, no duplicate.
```

**Rationale:** Corpus-safe clarification of cardinality — one `RFQRouted` per routing execution; replenishment executions emit their own separate `RFQRouted`; never multiple for a single execution. No event created (`RFQRouted` is the existing Doc-2 §8 PATCH-06 event); no ownership change. Applied to the actual routing contract since `rfq.route_suppliers.v1` does not exist.

---

# 3. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| **Ownership unchanged** | **CONFIRMED** | No entity/aggregate moved; `invitation_id` resolves against the RFQ-owned Invitation aggregate. |
| **Routing ownership unchanged** | **CONFIRMED** | RFQ still owns routing/wave/selection; PB3-N1 clarifies `RFQRouted` cardinality only. |
| **Governance ownership unchanged** | **CONFIRMED** | No governance authority moved; PB3-M2 marks an unresolved POLICY authority, does not relocate it. |
| **Lifecycle unchanged** | **CONFIRMED** | No state/transition added; PB3-M1 is a reference-resolution row, not a state edge. |
| **Authorization unchanged** | **CONFIRMED** | No slug added/removed; `[ESC-RFQ-SLUG]` unchanged. |
| **Event catalog unchanged** | **CONFIRMED** | No event coined; `RFQRouted`/`VendorInvited` are existing Doc-2 §8 events; PB3-N1 is cardinality wording. |
| **Audit model unchanged** | **CONFIRMED** | No audit action added; failure-class on PB3-M1 is the existing `NOT_FOUND` (no new code). |
| **Procurement moat unchanged** | **CONFIRMED** | RFQ-runs-routing / Marketplace-owns-data boundary intact; firewall preserved (the `core.*` dedup keys are explicitly firewalled from RFQ). |

**Regression posture:** additive/clarifying only — one validation row (explicit reference resolution, failure collapses to existing `NOT_FOUND`), one idempotency-authority correction to the existing `[ESC-RFQ-POLICY]` escalation, one event-cardinality clarification on an existing event. No entity, slug, event, audit action, POLICY key, state, or transition created; no routing/governance redesign; no Pass-A reopen; no carried dependency resolved.

---

# 4. Deferred Findings

| Finding | Disposition | Reason for deferral |
|---|---|---|
| **PB3-N2** | **Deferred — No Patch Applied** | Per Architecture Board adjudication, classified NITPICK and not gating to Part-3 freeze readiness. No content modified; carried forward (may be addressed in a later cosmetic pass without reopening Part 3). |

---

# 5. Freeze Readiness

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** — none raised; none introduced. |
| **Open MAJOR** | **NO** — the review raised no MAJOR; PB3-M1/M2 were MINOR and are now closed. |
| **Open MINOR** | **NO** — PB3-M1 and PB3-M2 applied and closed. |
| **Ready for Patch Verification** | **YES** |

**Justification.** The two Board-accepted MINOR findings are applied: PB3-M1 adds the explicit Stage 7 REFERENCE validation row for `invitation_id` (resolving against the RFQ Invitation aggregate; failure collapses to the existing `NOT_FOUND` per §7.5/§12.4 — no new error code), and PB3-M2 corrects the idempotency dedup-window authority to the `[ESC-RFQ-POLICY]` escalation after corpus verification confirmed **no `rfq.*` dedup-window POLICY key exists** and the Module-0 `core.*_dedup_window` keys are firewalled from RFQ use (no key/value invented). The optional PB3-N1 was applied as a corpus-safe `RFQRouted`-cardinality clarification, **retargeted** to the real routing contract `rfq.assemble_and_route_wave.v1` (the request's `rfq.route_suppliers.v1` does not exist). PB3-N2 is deferred with no content change. Impact analysis confirms ownership, routing/governance ownership, lifecycle, authorization, event catalog, audit model, and the procurement moat are all unchanged; nothing was invented. The amended Part-3 conforms to `Doc-4E_PassA_v1.0_FROZEN`, the frozen structure, Parts 1–2 (FROZEN), and the frozen corpus, and carries DE-1…DE-8 + `[ESC-RFQ-AUDIT]` / `[ESC-RFQ-POLICY]` / `[ESC-RFQ-SLUG]` unchanged. Part 3 is **ready for Pass-B Part-3 Patch Verification.**

> No conflict with the frozen corpus was encountered during patch application; no flag-and-halt was triggered. Two request-vs-artifact naming mismatches (document suffix; `rfq.route_suppliers.v1`) were reconciled to the actual on-disk names, not treated as new contracts.

---

*End of Doc-4E_PassB_Part3_Patch_v1.0 — applies PB3-M1 (Stage 7 REFERENCE row) + PB3-M2 (dedup-window authority → `[ESC-RFQ-POLICY]`, no key invented) + PB3-N1 (RFQRouted cardinality, retargeted to `rfq.assemble_and_route_wave.v1`); defers PB3-N2. Additive/clarifying only; no ownership, routing/governance, lifecycle, authorization, event-catalog, audit, or moat change. Decision: accepted findings closed; ready for Patch Verification. Canonical input: `Doc-4E_Content_v1.0_PassB_Part3_RoutingGovernance.md` as amended by this patch.*