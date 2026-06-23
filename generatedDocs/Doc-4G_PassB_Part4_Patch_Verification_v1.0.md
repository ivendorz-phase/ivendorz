# Architecture Board — Patch Review
**Document Reviewed:** `Doc-4G_PassB_Part4_Patch_v1.0`
**Verification Date:** 2026-06-18
**Status:** FINAL

| Field | Value |
|---|---|
| Patch Document | `Doc-4G_PassB_Part4_Patch_v1.0` |
| Base Document | `Doc-4G_PassB_Part4_BC-TRUST-4_Fraud_Risk_Signals_v1.0` |
| Review Authority | `Doc-4G_PassB_Part4_Independent_Hard_Review_v1.0` |
| Findings Under Verification | F4G-PB4-MA1 (MAJOR), F4G-PB4-MA2 (MAJOR), F4G-PB4-M1 (MINOR), F4G-PB4-M2 (MINOR), F4G-PB4-M3 (MINOR), F4G-PB4-N1 (NITPICK), F4G-PB4-N2 (NITPICK) |
| Authoritative Corpus | Architecture v1.0 FINAL (FROZEN), ADR Compendium v1 (FROZEN), Doc-2 v1.0.3 (FROZEN), Doc-3 v1.0.2 (FROZEN), Doc-4A–4F v1.0 (all FROZEN), Doc-4G Structure v1.0 (FROZEN), Doc-4G Pass-A v1.0 (FROZEN), Doc-4G PassB Part1/2/3 (all FROZEN), Doc-4G_PassB_Part4_BC-TRUST-4_Fraud_Risk_Signals_v1.0 |
| Posture | Defect-closure verification only. No new findings unless regression, corpus conflict, or patch-introduced defect is found. Resolved findings not reopened. |

---

## Executive Verdict

```
PATCH VERIFICATION
= PASS
```

All seven approved findings are closed. No regression found. No corpus conflict found. No patch-introduced defect found.

---

## Finding Closure Verification

---

### F4G-PB4-MA1

**Required:** Replay behavior deterministic. Explicit distinction between same-transition replay and new transition against wrong/terminal state. Replay handling explicitly defined. Wrong-state handling explicitly defined. No ambiguity. Lifecycle unchanged.

**Patch Result:**

The base §G7.2 §10 read: "replay of the same transition that already applied → same state, no duplicate audit; a transition against a terminal/wrong source → `STATE` (not idempotency-absorbed)." While directionally correct, this collapsed two structurally distinct decision paths into a single sentence — the mechanism for each case (idempotency-key lookup vs. state enforcement) was not stated, and the sentence allowed an implementer to treat the two paths as variations of the same check.

The patch replaces §10 with an explicit two-case model, labeled and separated:

**(A) Replay of an already-applied identical transition** — a re-delivery of the *same* request (same idempotency key, same target transition that already succeeded) is **idempotency-absorbed**: returns the original result, writes nothing, produces no duplicate audit. This check is performed **before** state evaluation and is decided entirely by the idempotency key within the dedup window.

**(B) A new transition attempted from a terminal or wrong source state** — a *distinct* request (different idempotency key, or a different actor/attempt) targeting a signal whose current state does not permit the transition is **rejected with `STATE`** (§6) and is **not** idempotency-absorbed. Examples: `action` on an `open` signal (wrong pre-state); any transition on a terminal `actioned`/`dismissed` signal.

The decisive closing statement: "Case A is decided by the idempotency key; Case B is decided by state enforcement; the two never overlap."

`expected_revision` is correctly retained and scoped to its own purpose: "guards concurrent races on the valid source state (lost race → `CONFLICT`)." Its role is clearly separated from both Case A and Case B.

The lifecycle (`open → reviewed → actioned | dismissed`; `actioned`/`dismissed` terminal) is unchanged. No state added. No edge added. The patch clarifies mechanism, not behavior.

**Verification:** PASS

---

### F4G-PB4-MA2

**Required:** `detection_window` authority explicitly bound to `[ESC-TRUST-POLICY]`. Duration unresolved. Implementation may not choose locally. No invented policy key. No invented duration.

**Patch Result:**

The base §G7.1 §10 described the system-detected create idempotency key as `(subject_id, subject_type, signal_type, detection_window)` and deferred the dedup-window to `[ESC-TRUST-POLICY]`. However, the `detection_window` component of the idempotency key was mentioned without any authority statement — an implementer could reasonably choose a concrete duration (e.g. 24 hours) and treat the `detection_window` as a locally-defined constant. The base §H.8 carried the same implicit gap.

The patch closes this at two locations:

**MA2·a — §G7.1 §10:** Adds an explicit authority block immediately after the idempotency-key statement: "**`detection_window` authority — `[ESC-TRUST-POLICY]` (unresolved):** the window's **duration/value is NOT resolved in this Part** and is **not bound to any Doc-3 §12.2 key today**; it is carried under **`[ESC-TRUST-POLICY]`** and **governed only through future policy authority** (Doc-3 §12.2 additive). **Implementation MUST NOT choose a `detection_window` value locally** — until the policy key is established, the window is an unresolved tunable; **no key invented, no duration invented**."

**MA2·b — §H.8:** Adds the parallel authority statement at the conventions level: "**`detection_window` (and every `trust` dedup window) authority = `[ESC-TRUST-POLICY]`, unresolved:** the duration/value is **not** bound to any Doc-3 §12.2 key today and is **governed only through future policy authority** (Doc-3 §12.2 additive); **implementation MUST NOT choose a value locally; no key invented, no duration invented.**" The §H.8 triage idempotency wording is also updated to cross-reference the MA1 Case A/B model ("replay model per §G7.2 §10 (Case A absorbed by idempotency key; Case B → `STATE`)").

No policy key is invented. No duration is invented. The `[ESC-TRUST-POLICY]` marker is strengthened with explicit governance language, not replaced. Both the `detection_window` and the triage/staff dedup windows are now explicitly governed under the same unresolved `[ESC-TRUST-POLICY]` posture.

**Verification:** PASS

---

### F4G-PB4-M1

**Required:** Validation presentation normalized. `6 STATE` stage explicitly represented. N/A handling explicit. Canonical order preserved. No behavior change.

**Patch Result:**

The base §G7.1 §4, stage 6 row: "| (state) | 6 STATE | Doc-2 §3.6/§10.6 | N/A — create has no prior state (entry `open`) | — |" — the "N/A" was a bare assertion without the explicit "stage not applicable" language.

§H.1 of the base document itself cites the frozen Part-3 §G6.4 presentation precedent for explicit N/A rows. The patch normalizes the row to match that precedent: "| (state) | 6 STATE | Doc-2 §3.6/§10.6 | **N/A (stage not applicable)** — create has no prior state; the signal is written at the lifecycle entry `open` (no source-state precondition) | — |"

The stage label (6 STATE), source authority, and failure outcome (—) are unchanged. The canonical nine-stage order is unchanged. The rule explanation is expanded to make the lifecycle entry rationale explicit ("signal is written at the lifecycle entry `open` — no source-state precondition"). No behavior change.

**Verification:** PASS

---

### F4G-PB4-M2

**Required:** Single visibility statement. Consistent wording across Authorization Matrix, Response Schema, AI-Agent Notes, and Ledger. No visibility drift.

**Patch Result:**

The base had three distinct phrasings for the same staff-only non-disclosure rule:
- §G7.3 §5 (Authorization Matrix): "staff-only — never tenant-visible, never public"
- §G7.3 §12 (AI-Agent Notes): "staff-internal — never tenant-visible, never public"
- §G7.Z ledger: "staff-internal, never tenant-visible"

The `NOT_FOUND` collapse clause was stated in the Error Boundary blocks but absent from §5 and the ledger.

The patch establishes one authoritative phrase and applies it at all three locations:

> **"staff-only — never tenant-visible, never public (Doc-2 §3.6; Doc-4A §7.5); any non-staff access collapses to `NOT_FOUND`."**

**M2·a — §G7.3 §5:** "**Visibility (authoritative phrase): staff-only — never tenant-visible, never public (Doc-2 §3.6; Doc-4A §7.5); any non-staff access collapses to `NOT_FOUND`.**" The redundant "No vendor/buyer/public read path exists" sentence is removed (subsumed by the authoritative phrase).

**M2·b — §G7.3 §12:** Updated to use the authoritative phrase verbatim; "staff-internal" replaced with "staff-only."

**M2·c — §G7.Z ledger:** Row renamed "Visibility / Non-disclosure (authoritative phrase)" and updated to the canonical phrase with a note: "used consistently across §5/§3/§12."

The staff-only non-disclosure rule and the `NOT_FOUND` collapse behavior are unchanged. This is presentation normalization only.

**Verification:** PASS

---

### F4G-PB4-M3

**Required:** Consumer terminology normalized. One authoritative consumer description. Ownership unchanged. Behavior unchanged.

**Patch Result:**

The base had four locations expressing the Admin consumer relationship with different wording:
- §H.7: "Admin (Doc-4J) **consumes the signal state by service** for ban management"
- §G7.1 §8: "Admin consumes signal state by service"
- §G7.2 §8: "Admin (DG-5) **reads** `actioned` signals by service for ban management"
- §G7.3 §11: "the Admin ban-management surface reads `actioned` signals by service (staff-scoped)"

The patch establishes one authoritative phrase — **"Admin consumes the signal state by service (reads `actioned` signals)"** — and applies it across all locations:

**M3·a — §H.7:** Phrase updated to "consumes the signal state by service (reads `actioned` signals)"; a parenthetical added: "*(This is the single authoritative consumer phrase used throughout this Part.)*"

**M3·b — §G7.1 §8:** Updated to use the authoritative phrase.

**M3·c — §G7.1 §11, §G7.2 §8, §G7.3 §11:** All three updated to the authoritative phrase. §G7.1 §11 also adds "(see §H.9(c))" after "the ban decision is Admin's" — a pointer to the authoritative location (aligned with N1).

Admin still consumes `actioned` signals by service. The ban decision is still Admin's (DG-5). DG-5 dependency unchanged. No ownership change. No behavior change.

**Verification:** PASS

---

### F4G-PB4-N1

**Required:** "The ban decision is Admin's" centralized where practical. No behavior change.

**Patch Result:**

§H.9(c) is the authoritative location for the ban-ownership rule: "**Ownership of downstream decisions remains external** — the **ban decision is Admin's** (Doc-4J, DG-5); BC-TRUST-4 records/triages and surfaces `actioned` signals; it **never issues a ban**." The base §G7.Z carried dependencies section restated this rule inline without referencing §H.9(c).

The patch updates the §G7.Z DG-5 entry from "the ban decision is Admin's" to "the ban decision is Admin's — **authoritative at §H.9(c)**." This adds a pointer to the authoritative location without removing the statement (the rule remains visible in §G7.Z but now explicitly defers to §H.9(c)). §H.9(c) itself is unchanged. No behavior change.

**Verification:** PASS

---

### F4G-PB4-N2

**Required:** "No Trust fraud event exists" centralized where practical. No behavior change.

**Patch Result:**

§H.7 is the authoritative location for the no-fraud-event rule. The base §G7.Z Events ledger row restated the rule inline: "Doc-2 §8 — **none** (no Trust fraud event in catalog); BC-TRUST-4 emits no event; Admin consumes signal state by service; nothing coined."

The patch updates the row to: "Per §H.7 (authoritative): Doc-2 §8 enumerates **no** Trust fraud event → BC-TRUST-4 emits no event; Admin consumes the signal state by service (reads `actioned` signals); nothing coined." The row now explicitly points to §H.7 as authoritative and uses the M3 consumer phrase for consistency. §H.7 itself is unchanged. No behavior change.

**Verification:** PASS

---

## Regression Audit

| Area | Result |
|---|---|
| Contract Inventory | UNCHANGED — 3 contract blocks / 6 contract IDs intact (`trust.create_fraud_signal.v1`, `trust.review_fraud_signal.v1`, `trust.action_fraud_signal.v1`, `trust.dismiss_fraud_signal.v1`, `trust.get_fraud_signal.v1`, `trust.list_fraud_signals.v1`); no contract added, removed, or split; all edits are wording-level |
| Aggregate Ownership | UNCHANGED — Fraud Signal → BC-TRUST-4; no aggregate added or moved; M3 normalizes consumer terminology without changing which module owns what |
| Lifecycle Ownership | UNCHANGED — `open → reviewed → actioned | dismissed` intact; `actioned`/`dismissed` terminal; MA1 clarifies the idempotency-key vs. state-enforcement decision mechanism without adding any state or edge; no freeze/reactivate/acknowledge state introduced |
| Event Ownership | UNCHANGED — BC-TRUST-4 still emits no event (Doc-2 §8 has none); N2 normalizes the ledger pointer to §H.7; nothing coined; no event added or renamed |
| Permission Ownership | UNCHANGED — `staff_can_ban` only; system-detected create System-actor no-slug; no slug invented or renamed; `[ESC-TRUST-SLUG]` preserved |
| Audit Ownership | UNCHANGED — every fraud-signal mutation (create/review/action/dismiss) still carries `[ESC-TRUST-AUDIT]` (no §9 fraud action enumerated); no audit action invented; `[ESC-TRUST-AUDIT]` preserved on all four mutation types |
| Policy Ownership | UNCHANGED — MA2 binds `detection_window` authority to the already-present `[ESC-TRUST-POLICY]` marker; no new POLICY key registered; no duration invented; `[ESC-TRUST-POLICY]` posture strengthened, not altered |
| Trust Firewall | UNCHANGED — fraud signals provide inputs only; mutate no Trust Score / Performance Score / Verification / Financial Tier; no Billing influence; staff-internal non-disclosure (H.9) preserved; M2 normalizes the phrase without changing the rule |
| Procurement Moat | UNCHANGED — fraud is a signal source only; no matching/routing/ranking/evaluation/selection/award; RFQ authoritative; H.9(g) unchanged |
| Escalation Markers | PRESERVED EXACTLY — `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained; not removed, not renamed, not reinterpreted; MA2 strengthens the `[ESC-TRUST-POLICY]` governance language without replacing the marker |

---

## Governance Audit

### Ownership Integrity

**PASS** — BC-TRUST-4 owns the Fraud Signal aggregate (`fraud_signals`). No aggregate added, moved, or shared. The M3 normalization confirms Admin (DG-5) consumes `actioned` signals — no ownership transfer, no new boundary crossed. The ban decision remains Admin's (H.9(c), unchanged).

---

### DDD Boundary Integrity

**PASS** — All mutations are confined to BC-TRUST-4-owned aggregates (`fraud_signals`). Detection inputs (DG-1/2/3/4/6 and BC-TRUST-1 in-module read) remain read-only. Admin (DG-5) consumes by service — no write-back. BC-TRUST-4 never mutates Trust Score (BC-TRUST-2), Performance Score (BC-TRUST-3), Verification (BC-TRUST-1), or Financial Tier. MA1 clarifies idempotency/state-enforcement separation — no boundary addition.

---

### Authorization Integrity

**PASS** — One confirmed Doc-2 §7 slug used: `staff_can_ban`. System-detected create carries no slug (System actor, trigger-authenticity). No vendor/buyer/tenant path. `[ESC-TRUST-SLUG]` correctly carried for any future dedicated fraud slug. No slug invented. M1/M2/M3 are presentation changes only — no authorization rule altered.

---

### Trust Firewall Integrity

**PASS** — All six H.9 firewall clauses are intact and unchanged: (a) exclusive BC-TRUST-4 ownership; (b) inputs-only posture (no mutation of Trust Score/Performance/Verification/Tier); (c) ban decision external to Admin; (d) fraud state is read-only input to BC-TRUST-2; (e) no Billing influence; (f) staff-internal non-disclosure. M2 normalizes the non-disclosure phrase (clause (f)) without changing the rule. No firewall breach.

---

### Procurement Moat Integrity

**PASS** — BC-TRUST-4 computes no matching, routing, ranking, evaluation, selection, or award. Fraud is a signal source only (H.9(g)). RFQ authoritative. No moat breach in any contract block.

---

### Event Integrity

**PASS** — BC-TRUST-4 emits no event. Doc-2 §8 enumerates no Trust fraud event. N2 updates the §G7.Z ledger to point to §H.7 as authoritative; §H.7 is unchanged. The M3 consumer phrase normalization does not introduce any event or publisher. No event coined. No event renamed.

---

### State Integrity

**PASS** — The lifecycle `open → reviewed → actioned | dismissed` is unchanged. MA1 explicitly separates the idempotency-key path (Case A — absorbed before state evaluation) from the state-enforcement path (Case B — new transition on wrong/terminal state → `STATE`). No new state. No new edge. No lifecycle shortcut. Terminal states (`actioned`/`dismissed`) remain terminal and inviolable. The `reviewed` step remains the single investigation/acknowledgement transition; no freeze/reactivate/acknowledge state is introduced.

---

## AI-Agent Readiness

**HIGH**

The patch substantially improves implementation determinism for all seven findings:

- **MA1:** The triage replay model is now a two-case algorithm: Case A (same idempotency key, already-applied transition) → absorbed before state evaluation; Case B (distinct request, wrong/terminal state) → `STATE`. Agents implementing the triage handler have a deterministic, non-overlapping decision tree.
- **MA2:** The `detection_window` is now explicitly an unresolved `[ESC-TRUST-POLICY]` tunable with a `MUST NOT choose locally` instruction. Agents cannot infer or hard-code a detection-window duration. The constraint is stated in both the per-contract §10 and the §H.8 convention.
- **M1:** The §G7.1 `6 STATE` N/A row matches the frozen Part-3 §G6.4 convention. Agents parsing validation matrices across Parts see a consistent N/A presentation.
- **M2:** One visibility phrase across all four surfaces (§5, §12, ledger, §3). The `NOT_FOUND` collapse is now explicit in the Authorization Matrix — agents generating authorization middleware for the read contracts see the collapse instruction without having to consult the Error Boundary block.
- **M3:** One consumer phrase throughout. Agents wiring the Admin (DG-5) dependency know the exact access model: service-based consumption of `actioned` signals; no event, no direct table access.
- **N1/N2:** Ban-ownership and no-fraud-event rules are now pointed to their single authoritative locations (§H.9(c) and §H.7 respectively), reducing the risk of staleness in inline copies.

---

## Freeze Readiness

```
Open BLOCKER  = 0
Open MAJOR    = 0
Open MINOR    = 0
Open NITPICK  = 0
```

---

## Final Decision

**PATCH VERIFICATION PASS**

All seven approved findings are closed. No regression. No corpus conflict. No new defect introduced by the patch.

---

## Approval Question

**Can the document proceed to `Doc-4G_PassB_Part4_Freeze_Audit_v1.0`?**

**YES**

**Justification:** The full Pass-B Part-4 governance sequence is complete: Hard Review (APPROVED WITH PATCH REQUIRED) → Patch (surgical, no regression) → Patch Verification (PASS, all seven findings closed, 0 open at any severity). The patched document `Doc-4G_PassB_Part4_BC-TRUST-4_Fraud_Risk_Signals_v1.0` as amended by `Doc-4G_PassB_Part4_Patch_v1.0` has no open defects and is ready for Pass-B Part-4 Freeze Audit.

---

*End of Doc-4G_PassB_Part4_Patch_Verification_v1.0. All findings closed: F4G-PB4-MA1 PASS · F4G-PB4-MA2 PASS · F4G-PB4-M1 PASS · F4G-PB4-M2 PASS · F4G-PB4-M3 PASS · F4G-PB4-N1 PASS · F4G-PB4-N2 PASS. Regression Audit: UNCHANGED across all areas. Governance Audits: all PASS. State Integrity: PASS. AI-Agent Readiness: HIGH. Freeze Readiness: 0B · 0MA · 0M · 0N. Decision: PATCH VERIFICATION PASS. Approval: YES — proceed to Doc-4G_PassB_Part4_Freeze_Audit_v1.0.*
