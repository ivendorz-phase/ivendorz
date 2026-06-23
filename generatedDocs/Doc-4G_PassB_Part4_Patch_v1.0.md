# Doc-4G_PassB_Part4_Patch_v1.0.md

## Status

**Approved Pass-B Part-4 Patch** — applies the Architecture-Board-approved corrections to `Doc-4G_PassB_Part4_BC-TRUST-4_Fraud_Risk_Signals_v1.0.md`. Surgical, contract-level patching only — no rewrite, no redesign.

| Field | Value |
|---|---|
| Applies to | `Doc-4G_PassB_Part4_BC-TRUST-4_Fraud_Risk_Signals_v1.0.md` |
| Produces | that document as amended by this patch (canonical input to Pass-B Part-4 Freeze) |
| Board adjudication | **Mandatory:** F4G-PB4-MA1, F4G-PB4-MA2, F4G-PB4-M1, F4G-PB4-M2, F4G-PB4-M3. **Recommended:** F4G-PB4-N1, F4G-PB4-N2 — applied. |
| Conforms To | Architecture FINAL · ADR v1 · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A/4B/4C/4D/4E/4F v1.0 · Doc-4G Structure FROZEN · Doc-4G Pass-A FROZEN · Doc-4G PassB Part1/2/3 FROZEN — all FROZEN |
| Application model | Additive amendment. Each item quotes the exact **Before** text present verbatim in the base and gives the **After**. Anchors verified verbatim. |

No ownership, aggregate, lifecycle, event, permission, audit, policy-ownership, trust-firewall, or procurement-moat change; no new POLICY key / slug / state / event. Escalation markers preserved exactly.

---

# 1. Exact Changes

---

### F4G-PB4-MA1 — §G7.2 §10 — deterministic triage replay model

**Location:** §G7.2 (`review/action/dismiss`) — **10. Idempotency Rules**.

**Before:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-TRUST-POLICY]`**, H.8); replay of the same transition that already applied → same state, no duplicate audit; a transition against a terminal/wrong source → `STATE` (not idempotency-absorbed). `expected_revision` guards races.
```

**After:**

```
**10. Idempotency Rules** — `Idempotency: required` + dedup window (**`[ESC-TRUST-POLICY]`**, H.8). **Deterministic replay model (two distinct cases — no ambiguity):** **(A) Replay of an already-applied identical transition** — a re-delivery of the *same* request (same idempotency key, same target transition that already succeeded) is **idempotency-absorbed**: it returns the original result, writes nothing, and produces no duplicate audit. This is recognized by the idempotency key within the dedup window, **before** state evaluation. **(B) A new transition attempted from a terminal or wrong source state** — a *distinct* request (different idempotency key, or a different actor/attempt) targeting a signal whose current state does not permit the transition (e.g. `action` on an `open` signal, or any transition on a terminal `actioned`/`dismissed` signal) is **rejected with `STATE`** (§6) — it is **not** idempotency-absorbed. Case A is decided by the idempotency key; Case B is decided by state enforcement; the two never overlap. `expected_revision` guards concurrent races on the valid source state (lost race → `CONFLICT`).
```

**Rationale:** Removes the A-vs-B ambiguity (MA1). Replay protection is the idempotency key's job (Case A); a genuinely new transition from a terminal/wrong state is a state defect (Case B → `STATE`). Lifecycle, ownership, permissions unchanged.

---

### F4G-PB4-MA2 — §G7.1 §10 + §H.8 — bind `detection_window` authority to `[ESC-TRUST-POLICY]`

#### F4G-PB4-MA2·a — §G7.1 §10 Idempotency Rules

**Before:**

```
**10. Idempotency Rules** — *system-detected:* `Idempotency: required` — idempotent on `(subject_id, subject_type, signal_type, detection_window)`; at-least-once detection → one `open` signal, no duplicate. *staff:* `Idempotency: required` + dedup window. Dedup-window key absent from Doc-3 §12.2 → **`[ESC-TRUST-POLICY]`** (platform default by name; no key invented). Replay within window → same `fraud_signal_id`, no duplicate audit.
```

**After:**

```
**10. Idempotency Rules** — *system-detected:* `Idempotency: required` — idempotent on the detection key `(subject_id, subject_type, signal_type, detection_window)`; at-least-once detection → one `open` signal, no duplicate. **`detection_window` authority — `[ESC-TRUST-POLICY]` (unresolved):** the window's **duration/value is NOT resolved in this Part** and is **not bound to any Doc-3 §12.2 key today**; it is carried under **`[ESC-TRUST-POLICY]`** and **governed only through future policy authority** (Doc-3 §12.2 additive). **Implementation MUST NOT choose a `detection_window` value locally** — until the policy key is established, the window is an unresolved tunable; **no key invented, no duration invented**. *staff:* `Idempotency: required` + dedup window (same `[ESC-TRUST-POLICY]` posture). Replay within the (policy-governed) window → same `fraud_signal_id`, no duplicate audit.
```

#### F4G-PB4-MA2·b — §H.8 (detection key window authority)

**Before:**

```
- **H.8 — Idempotency (Doc-4A §14).** **System-detected create** is idempotent on the detection key `(subject_id, subject_type, signal_type, detection_window)` — at-least-once detection never produces a duplicate `open` signal for the same indicator within the window. **Staff create** carries `Idempotency: required` + a dedup window. **Triage** (review/action/dismiss, 21.6) carries `Idempotency: required` — replay of the same transition on an already-advanced signal is a no-op on the terminal/target state (or → `STATE` if the source is wrong, per §6). **No `trust` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-TRUST-POLICY]`** (reference the platform default by name; no key invented). Replay within the window → same result, no duplicate audit. Queries (21.3) are side-effect-free (`Idempotency: not-applicable`, §14.1).
```

**After:**

```
- **H.8 — Idempotency (Doc-4A §14).** **System-detected create** is idempotent on the detection key `(subject_id, subject_type, signal_type, detection_window)` — at-least-once detection never produces a duplicate `open` signal for the same indicator within the window. **`detection_window` (and every `trust` dedup window) authority = `[ESC-TRUST-POLICY]`, unresolved:** the duration/value is **not** bound to any Doc-3 §12.2 key today and is **governed only through future policy authority** (Doc-3 §12.2 additive); **implementation MUST NOT choose a value locally; no key invented, no duration invented.** **Staff create** carries `Idempotency: required` + a dedup window (same posture). **Triage** (review/action/dismiss, 21.6) carries `Idempotency: required` — replay model per §G7.2 §10 (Case A absorbed by idempotency key; Case B → `STATE`). Replay within the (policy-governed) window → same result, no duplicate audit. Queries (21.3) are side-effect-free (`Idempotency: not-applicable`, §14.1).
```

**Rationale:** Binds the `detection_window` (and triage/staff dedup windows) authority explicitly to `[ESC-TRUST-POLICY]` with the duration unresolved and a no-local-choice rule (MA2); aligns the §H.8 triage wording with the MA1 replay model. No key/duration invented.

---

### F4G-PB4-M1 — §G7.1 §4 — normalize the `6 STATE` N/A row to Pass-B convention

**Location:** §G7.1 Create — **4. Validation Matrix**, the `6 STATE` row.

**Before:**

```
| (state) | 6 STATE | Doc-2 §3.6/§10.6 | N/A — create has no prior state (entry `open`) | — |
```

**After:**

```
| (state) | 6 STATE | Doc-2 §3.6/§10.6 | **N/A (stage not applicable)** — create has no prior state; the signal is written at the lifecycle entry `open` (no source-state precondition) | — |
```

**Rationale:** Formatting/presentation only — matches the explicit "N/A (stage not applicable)" convention used in the frozen Part-3 §G6.4 validation matrices. No behavior change.

---

### F4G-PB4-M2 — Visibility statement standardized (one authoritative phrase)

> Single authoritative phrase, applied across Authorization Matrix, Response Schema, AI-Agent Notes, and the ledger: **"staff-only — never tenant-visible, never public (Doc-2 §3.6; Doc-4A §7.5); any non-staff access collapses to `NOT_FOUND`."**

#### F4G-PB4-M2·a — §G7.3 §5 Authorization Matrix

**Before:**

```
**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_ban`** (Doc-2 §7) · Scope = platform · Visibility **staff-only — never tenant-visible, never public** (Doc-2 §3.6; Doc-4A §7.5) · Delegation n/a · Enforcement `check_permission`. **No vendor/buyer/public read path exists.** **No query mutates state (CQRS).**
```

**After:**

```
**5. Authorization Matrix** — Actor **Admin** · Slug **`staff_can_ban`** (Doc-2 §7) · Scope = platform · **Visibility (authoritative phrase): staff-only — never tenant-visible, never public (Doc-2 §3.6; Doc-4A §7.5); any non-staff access collapses to `NOT_FOUND`.** · Delegation n/a · Enforcement `check_permission`. **No query mutates state (CQRS).**
```

#### F4G-PB4-M2·b — §G7.3 §12 AI-Agent Notes

**Before:**

```
**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). Fraud signals are **staff-internal — never tenant-visible, never public** (Doc-2 §3.6; §7.5); collapse **any** non-staff access to `NOT_FOUND`. There is no public or tenant projection of a fraud signal. Admin reads `actioned` signals **by service**, staff-scoped.
```

**After:**

```
**12. AI-Agent Implementation Notes** — queries **never mutate** (CQRS). **Visibility (authoritative phrase): staff-only — never tenant-visible, never public (Doc-2 §3.6; Doc-4A §7.5); any non-staff access collapses to `NOT_FOUND`.** There is no public or tenant projection of a fraud signal. Admin **consumes the signal state by service** (staff-scoped), reading `actioned` signals (M3 phrase).
```

#### F4G-PB4-M2·c — §G7.Z ledger (visibility/non-disclosure row)

**Before:**

```
| Non-disclosure | Doc-4A §7.5; Doc-2 §3.6 — fraud signals **staff-internal, never tenant-visible**; non-staff access → `NOT_FOUND` collapse |
```

**After:**

```
| Visibility / Non-disclosure (authoritative phrase) | **staff-only — never tenant-visible, never public (Doc-2 §3.6; Doc-4A §7.5); any non-staff access collapses to `NOT_FOUND`** — used consistently across §5/§3/§12 |
```

**Rationale:** One visibility phrase across all four locations (M2). No behavior change; the staff-only/non-disclosure rule is unchanged.

---

### F4G-PB4-M3 — Consumer terminology standardized (one authoritative phrase)

> Single authoritative phrase: **"Admin consumes the signal state by service (reads `actioned` signals) for ban management; the ban decision is Admin's (DG-5)."** Replaces the drift between "consumes signal state by service" and "reads actioned signals by service."

#### F4G-PB4-M3·a — §H.7 (consumer clause)

**Before:**

```
Admin (Doc-4J) **consumes the signal state by service** for ban management — there is no fraud event to publish, **no publisher ambiguity, and no cross-context event ownership**.
```

**After:**

```
Admin (Doc-4J) **consumes the signal state by service (reads `actioned` signals)** for ban management — there is no fraud event to publish, **no publisher ambiguity, and no cross-context event ownership**. *(This is the single authoritative consumer phrase used throughout this Part.)*
```

#### F4G-PB4-M3·b — §G7.1 §8 Event Binding

**Before:**

```
**8. Event Binding** — **Emits NO event** (H.7 — Doc-2 §8 has no Trust fraud event; Admin consumes signal state by service) · Consumed: a system-detected create may be **triggered** by an existing Doc-2 §8 event from a source module (detection rule), but binds that existing event only — **no event coined**; no fraud event published.
```

**After:**

```
**8. Event Binding** — **Emits NO event** (H.7 — Doc-2 §8 has no Trust fraud event; **Admin consumes the signal state by service (reads `actioned` signals)** — M3 phrase) · Consumed: a system-detected create may be **triggered** by an existing Doc-2 §8 event from a source module (detection rule), but binds that existing event only — **no event coined**; no fraud event published.
```

#### F4G-PB4-M3·c — §G7.1 §11 + §G7.2 §8 + §G7.3 §11 (align to the M3 phrase)

**Before (§G7.1 §11):**

```
**11. Cross-Module References** — **Detection inputs (read-only; never mutated):** Identity (DG-1), Verification (BC-TRUST-1 in-module read), Marketplace (DG-2), RFQ (DG-3), Operations (DG-4), Communication (DG-6) activity. **Admin (DG-5):** consumes `actioned` signals for ban management; **the ban decision is Admin's**. **Platform Core (DG-8):** audit. **Billing (DG-7):** no input (firewall).
```

**After (§G7.1 §11):**

```
**11. Cross-Module References** — **Detection inputs (read-only; never mutated):** Identity (DG-1), Verification (BC-TRUST-1 in-module read), Marketplace (DG-2), RFQ (DG-3), Operations (DG-4), Communication (DG-6) activity. **Admin (DG-5): consumes the signal state by service (reads `actioned` signals)** for ban management; **the ban decision is Admin's** (see §H.9(c)). **Platform Core (DG-8):** audit. **Billing (DG-7):** no input (firewall).
```

**Before (§G7.2 §8):**

```
**8. Event Binding** — **Emits NO event** (H.7 — no Trust fraud event in Doc-2 §8) · Consumed: Admin (DG-5) **reads** `actioned` signals by service for ban management — there is no fraud event published; **no publisher ambiguity.**
```

**After (§G7.2 §8):**

```
**8. Event Binding** — **Emits NO event** (H.7 — no Trust fraud event in Doc-2 §8) · Consumed: Admin (DG-5) **consumes the signal state by service (reads `actioned` signals)** for ban management — there is no fraud event published; **no publisher ambiguity.**
```

**Before (§G7.3 §11):**

```
**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Admin (DG-5):** the Admin ban-management surface reads `actioned` signals by service (staff-scoped). **Platform Core (DG-8):** read-store/observability.
```

**After (§G7.3 §11):**

```
**11. Cross-Module References** — **Identity (DG-1 via Doc-4C):** staff identity + `check_permission`. **Admin (DG-5): consumes the signal state by service (reads `actioned` signals)** (staff-scoped). **Platform Core (DG-8):** read-store/observability.
```

**Rationale:** One consumer phrase throughout (M3). No ownership/dependency change — Admin still consumes `actioned` signals by service; the ban decision is still Admin's.

---

### F4G-PB4-N1 (recommended, applied) — de-duplicate "the ban decision is Admin's" to §H.9(c)

**Location:** §G7.Z — Firewall posture line (one representative restatement converted to a reference; the §H.9(c) statement is authoritative).

**Before:**

```
**Carried dependencies (unchanged):** DG-1 (Identity — staff `check_permission` + detection input), DG-2 (Marketplace — detection input/activity), DG-3 (RFQ — detection input/activity), DG-4 (Operations — detection input/activity), DG-5 (Admin — consumes `actioned` signals for ban management; **the ban decision is Admin's**), DG-6 (Communication — detection input + any fan-out), DG-8 (Platform Core — audit). DG-7 (Billing) referenced only as the **firewall** (no input). Intra-module: Verification (BC-TRUST-1) read as a detection input; BC-TRUST-2 reads fraud state as a trust-score input (B.9a) — BC-TRUST-4 mutates **no** score/verification/tier.
```

**After:**

```
**Carried dependencies (unchanged):** DG-1 (Identity — staff `check_permission` + detection input), DG-2 (Marketplace — detection input/activity), DG-3 (RFQ — detection input/activity), DG-4 (Operations — detection input/activity), DG-5 (Admin — consumes the signal state by service (reads `actioned` signals); **the ban decision is Admin's — authoritative at §H.9(c)**), DG-6 (Communication — detection input + any fan-out), DG-8 (Platform Core — audit). DG-7 (Billing) referenced only as the **firewall** (no input). Intra-module: Verification (BC-TRUST-1) read as a detection input; BC-TRUST-2 reads fraud state as a trust-score input (B.9a) — BC-TRUST-4 mutates **no** score/verification/tier.
```

**Rationale:** The ban-ownership rule is stated authoritatively once at §H.9(c); other mentions reference it (N1). No behavior change.

---

### F4G-PB4-N2 (recommended, applied) — de-duplicate "no Trust fraud event exists" to §H.7

**Location:** §G7.Z ledger — Events row.

**Before:**

```
| Events | Doc-2 §8 — **none** (no Trust fraud event in catalog); BC-TRUST-4 emits no event; Admin consumes signal state by service; nothing coined |
```

**After:**

```
| Events | Per §H.7 (authoritative): Doc-2 §8 enumerates **no** Trust fraud event → BC-TRUST-4 emits no event; Admin consumes the signal state by service (reads `actioned` signals); nothing coined |
```

**Rationale:** The "no Trust fraud event" rule is stated authoritatively once at §H.7; the ledger references it (N2). No behavior change.

---

# 2. Regression Audit

| Check | Result | Evidence |
|---|---|---|
| Ownership | **UNCHANGED** | Fraud Signal → BC-TRUST-4; no aggregate added/moved; MA1/MA2/M1/M2/M3/N1/N2 are wording/determinism clarifications. |
| Aggregate definitions | **UNCHANGED** | `fraud_signals` schema/fields untouched. |
| Lifecycle | **UNCHANGED** | `open → reviewed → actioned | dismissed` intact; MA1 clarifies replay (Case A absorbed / Case B → `STATE`) without adding a state or edge; no freeze/acknowledge state introduced. |
| Events | **UNCHANGED** | BC-TRUST-4 still emits no event (Doc-2 §8 has none); M3/N2 normalize the consumer/no-event wording only; nothing coined. |
| Permissions | **UNCHANGED** | `staff_can_ban` only; system-detected create System-actor no-slug; no slug invented/renamed. |
| Audit ownership | **UNCHANGED** | Every fraud mutation still carries `[ESC-TRUST-AUDIT]` (no §9 fraud action); none invented. |
| Policy ownership | **UNCHANGED** | No POLICY key added; MA2 binds `detection_window` authority to the existing `[ESC-TRUST-POLICY]` marker (unresolved, no local choice); no key/duration invented. |
| Trust firewall | **UNCHANGED** | Fraud signals provide inputs only; mutate no score/verification/tier; no Billing input; staff-internal non-disclosure preserved. |
| Procurement moat | **UNCHANGED** | Fraud is a signal source only; no matching/routing/ranking/evaluation/selection/award; RFQ authoritative. |
| Escalation markers | **PRESERVED EXACTLY** | `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained — not removed/renamed/reinterpreted. |
| No invention | **CONFIRMED** | No new contract, event, state, slug, audit action, or POLICY key. |

---

*End of Doc-4G_PassB_Part4_Patch_v1.0 — applies F4G-PB4-MA1 (deterministic triage replay model: Case A identical-replay absorbed by idempotency key / Case B new-transition-from-terminal-or-wrong-state → `STATE`), F4G-PB4-MA2 (`detection_window` + dedup-window authority bound to `[ESC-TRUST-POLICY]`, unresolved, no local choice, no key/duration invented), F4G-PB4-M1 (§G7.1 §4 `6 STATE` N/A row normalized to Pass-B convention), F4G-PB4-M2 (single visibility phrase across §5/§3/§12/ledger), F4G-PB4-M3 (single consumer phrase "Admin consumes the signal state by service (reads `actioned` signals)" throughout), F4G-PB4-N1 (ban-ownership centralized to §H.9(c)), F4G-PB4-N2 (no-fraud-event centralized to §H.7). Surgical/contract-level only; ownership, aggregate, lifecycle, events, permissions, audit ownership, trust firewall, and procurement moat preserved; escalation markers preserved exactly; nothing invented. Canonical input: `Doc-4G_PassB_Part4_BC-TRUST-4_Fraud_Risk_Signals_v1.0.md` as amended by this patch.*
