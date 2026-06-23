# Architecture Board — Patch Review
**Document Reviewed:** `Doc-4G_PassB_Part1_Patch_v1.0`
**Verification Date:** 2026-06-18
**Status:** FINAL

| Field | Value |
|---|---|
| Patch Document | `Doc-4G_PassB_Part1_Patch_v1.0` |
| Base Document | `Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0` |
| Review Authority | `Doc-4G_PassB_Part1_Independent_Hard_Review_v1.0` |
| Findings Under Verification | F4G-PB1-MA1 (MAJOR), F4G-PB1-MA2 (MAJOR), F4G-PB1-M1 (MINOR), F4G-PB1-M2 (MINOR), F4G-PB1-M3 (MINOR), F4G-PB1-N1 (NITPICK), F4G-PB1-N2 (NITPICK) |
| Authoritative Corpus | Architecture (FROZEN), ADR (FROZEN), Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4F v1.0 (all FROZEN), Doc-4G Structure v1.0 (FROZEN), Doc-4G Pass-A v1.0 (FROZEN), Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0 |
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

### F4G-PB1-MA1

**Required:** Validation matrices must use only the canonical Pass-B nine-stage vocabulary (`1 SYNTAX 2 SHAPE 3 SEMANTIC 4 AUTHENTICATION 5 AUTHORIZATION 6 STATE 7 REFERENCE 8 BUSINESS 9 POLICY`). Dual vocabulary removed. §H.1 aligned. All validation matrices aligned. Doc-4A §11.2 retained as enforcement authority.

**Patch Result:**

**§H.1 (MA1·a):** The base §H.1 contained the dual-vocabulary text — the canonical §11.2 pipeline (`1 SYNTAX → 2 CONTEXT → 3 AUTHZ → …`) plus a "Board label mapping" that introduced alternate labels. The patch replaces this entirely with a single canonical presentation: `1 SYNTAX → 2 SHAPE → 3 SEMANTIC → 4 AUTHENTICATION → 5 AUTHORIZATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. The enforcement binding to Doc-4A §11.2 is retained and now explicitly labelled "enforcement authority (Doc-4A §11.2, FROZEN — order and logic unchanged)." The mapping between each canonical stage and its §11.2 enforcement rule is preserved in the After text (SYNTAX+SHAPE → §11.2 SYNTAX; SEMANTIC+BUSINESS → §11.2 BUSINESS; AUTHENTICATION → §11.2 CONTEXT; AUTHORIZATION → §11.2 AUTHZ+SCOPE+DELEGATION; STATE/REFERENCE/POLICY identical). No alternate vocabulary survives in §H.1.

**Matrix relabels (MA1·b):** The patch documents an exhaustive relabel table and applies it to all eight contract blocks (§G4.1–§G4.8). Verified against the base:

- §G4.1: `1 SYNTAX (incl. SHAPE)` → `1 SYNTAX`; `2 CONTEXT (AUTHENTICATION)` → `4 AUTHENTICATION`; `3 AUTHZ` → `5 AUTHORIZATION`; `4 SCOPE` → `5 AUTHORIZATION (scope)`; `5 DELEGATION` → `5 AUTHORIZATION (delegation — n/a here)`; `6 STATE` → `6 STATE`; `7 REFERENCE` → `7 REFERENCE`; `8 BUSINESS` → `8 BUSINESS`; `9 POLICY` → `9 POLICY`. ✓
- §G4.2: `1 SYNTAX` → `1 SYNTAX`; `2 CONTEXT` → `4 AUTHENTICATION`; `3 AUTHZ` → `5 AUTHORIZATION`; `4 SCOPE` → `5 AUTHORIZATION (scope)`; `6 STATE` → `6 STATE`; `6 STATE / concurrency` → `6 STATE (concurrency)`; `7 REFERENCE` → `7 REFERENCE`. ✓
- §G4.3–§G4.8: relabels consistent with the documented mapping across all contracts. ✓
- §G4.5 `2–5 collapse` relabeled to `4 AUTHENTICATION / 4–5 collapse (System trigger-authenticity)` — consistent with the table entry `2 CONTEXT / 2–5 collapse (System)`. ✓
- The `duplicate-open-case guard` (§G4.1) and `basis-is-approved-tier-verification` (§G4.6) rows, which express domain-meaning preconditions, are presented under `3 SEMANTIC` per the relabel guidance — both remain bound to §11.2 BUSINESS as authority. ✓

No row's source authority, rule, or failure outcome class changes. Enforcement order is exactly Doc-4A §11.2 and is not reordered.

**Verification:** PASS

---

### F4G-PB1-MA2

**Required:** Verified-tier creation path must explicitly preserve `pending_verification → verified`. No absence-of-row → `verified` shortcut. Row creation sequence explicit. Lifecycle authority preserved.

**Patch Result:**

The base §G4.6 §6 read: "`set`: source **none** (or absence-of-row 'Declared Only') → target **`verified`** (via `pending_verification → verified`, Doc-2 §3.6/§10.6)." This was ambiguous — "absence-of-row → `verified`" could be read as collapsing the intermediate `pending_verification` step.

The patch replaces this with an explicit two-step description within one transaction: (i) the `verified_financial_tiers` row is **created at `pending_verification`** (lifecycle entry); (ii) **in the same transaction**, when an approved tier-verification basis exists, the row **advances `pending_verification → verified`**. The row never appears in any intermediate persisted state outside this transaction. The patch closes the shortcut explicitly: "there is **no absence-of-row → `verified`** edge — the authoritative path is exactly `pending_verification → verified`."

The "Forbidden" clause is extended to include: "advancing to `verified` without an approved basis → remains at `pending_verification` (→ `BUSINESS`, stage 8)."

The frozen lifecycle `pending_verification → verified → suspended → expired` is stated verbatim. Lifecycle authority (Doc-2 §3.6/§10.6) is preserved. No new lifecycle edge is introduced.

**Verification:** PASS

---

### F4G-PB1-M1

**Required:** Assign behavior unambiguous — `requested → in_review`; already-`in_review` → `STATE`. No no-op ambiguity. Idempotency behavior separated. State enforcement aligned.

**Patch Result:**

Three locations patched, all aligned:

**§G4.2 §6 (M1·a):** The base already listed `in_review` as a forbidden source state, but the §8 Event Binding contradicted this by calling a re-assign "a no-op." The patch makes the forbidden treatment explicit and removes the contradiction: "Forbidden: **`in_review`** (an already-assigned case) → `STATE`" and "A re-assign against an already-`in_review` case is **not** a success and **not** a no-op — it returns `STATE`. Replay of the *same* assign request is handled solely by the idempotency key (§10), never by accepting a second assign as valid."

**§G4.2 §8 (M1·b):** The base "re-assign of an already-`in_review` case is a no-op (state target idempotent)" is replaced with the definitive statement: "a **genuine request replay** (same idempotency key) returns the original result without a second write (§10); a **new** assign request against an already-`in_review` case is rejected with `STATE` (§6) — it is never treated as a no-op success." The contradiction between §6 and §8 is closed.

**§G4.2 §10 (M1·c):** The idempotency rules now state clearly: "Replay protection is the idempotency key's sole responsibility" for same-key replays, and a distinct request against an already-`in_review` case is "not idempotency-absorbed — it is rejected by state enforcement with `STATE` (§6)." `expected_revision` guards concurrent races only.

State enforcement and idempotency are cleanly separated across all three locations.

**Verification:** PASS

---

### F4G-PB1-M2

**Required:** Revoke authorization rule explicit — `staff_can_verify` OR `staff_can_ban`. No "and/or" ambiguity. No authorization inference. Identity enforcement defined.

**Patch Result:**

The base §G4.4 §5 stated "Slug **`staff_can_verify`** and/or **`staff_can_ban`**" and "compliance-driven revoke **may require** ban authority" — leaving the OR/AND ambiguity and the selection mechanism to implementer interpretation.

The patch replaces this with an explicit OR rule: "**Authorization rule = OR (either slug authorizes):** the caller MUST hold **`staff_can_verify`** OR **`staff_can_ban`** … holding **either** is sufficient and the operation is identical regardless of which slug authorized it … Neither slug is required in combination; there is no policy gate selecting between them." The enforcement mechanism is named: "Identity `check_permission` evaluates the OR."

Both slugs are confirmed as Doc-2 §7 platform-staff slugs (confirmed in the now-FROZEN Pass-A). The `[ESC-TRUST-SLUG]` note is correctly repositioned: the marker remains available for a future dedicated revoke slug if one is added to Doc-2 §7, but is not carried for the current OR pattern (which is fully resolved by two confirmed slugs). No slug invented.

**Verification:** PASS

---

### F4G-PB1-M3

**Required:** Each query independently defines Actor, Authorization, Scope, Visibility. `trust.get_verification.v1`, `trust.list_verifications.v1`, `trust.get_verified_tier.v1` have distinct authority definitions.

**Patch Result:**

The base §G4.8 §5 was a single combined entry mixing the three read contracts in one block without clear per-query delineation.

The patch expands §5 to three explicitly separated per-query records:

- **`trust.get_verification.v1`:** Actor Admin (platform-staff, §5.6) · Authorization `staff_can_verify` (Doc-2 §7) · Scope platform (no tenant scope) · Visibility staff-only — full `verification_records` + `verification_decisions`; non-entitled caller receives `NOT_FOUND` (protected-fact collapse, §7.5).
- **`trust.list_verifications.v1`:** Actor Admin (platform-staff, §5.6) · Authorization `staff_can_verify` (Doc-2 §7) · Scope platform (staff queue) · Visibility staff-only — case summaries; allowlisted filter/sort fields (Doc-4A §9.6); non-entitled caller → `NOT_FOUND`.
- **`trust.get_verified_tier.v1`:** Actor internal-service / any caller via public projection · Authorization none (public badge read, Doc-2 §3.6) · Scope public (per `vendor_profile_id`) · Visibility public band/status only — `tier`, `status`, `verified_at`, `next_review_at`; **no** internal `basis_jsonb`, decisions, or case detail; served by Marketplace via service projection, never table access (Doc-2 §10.6).

The enforcement statement closes the block: "Identity `check_permission` for the two staff queries; the public verified-tier badge requires no slug and exposes band/status only. No query mutates state (CQRS)."

Every dimension (Actor, Authorization, Scope, Visibility) is independently and explicitly defined for each of the three read contracts.

**Verification:** PASS

---

### F4G-PB1-N1

**Required:** `admin tier override` mapping clarification added. No audit invention.

**Patch Result:** The patch appends a clarification note to §H.6: "**Why 'admin tier override' is the nearest §9 mapping (clarification, no new action):** … verified-tier set/confirm/downgrade/suspend transitions are precisely staff-initiated tier changes, so 'admin tier override' is the closest authoritative action by meaning. It is used as the **nearest** pointer (not an exact per-transition action), which is why the residual per-transition specificity still carries `[ESC-TRUST-AUDIT]` for additive resolution — **no audit action is invented and no audit ownership changes**."

The clarification explains the mapping logic without creating a new audit action. `[ESC-TRUST-AUDIT]` carries unchanged. Doc-2 §9 ownership unchanged.

**Verification:** PASS

---

### F4G-PB1-N2

**Required:** Event-binding repetition reduced. Single authoritative reference (§H.7) used. No behavior change.

**Patch Result:**

**§G4.6 §8:** The base inline statement "**Trust never writes `marketplace.financial_tier_history`** — Marketplace consumes the event and writes the history rows + read-model band (Doc-2 §8 ownership note)" is replaced with a pointer: "no-history-write rule is per §H.7 (Trust emits; Marketplace consumes and writes `marketplace.financial_tier_history` + read-model band)." The rule is preserved at its authoritative location (§H.7, unchanged).

**§G4.7 §8:** The base inline "**Trust never writes `marketplace.financial_tier_history`** (Marketplace consumes)" is replaced with: "no-history-write rule per §H.7."

§H.7 itself is unchanged — it contains the full rule verbatim. The de-duplication eliminates inline repetition while preserving the rule at its single authoritative location. No behavior change. No event invented or renamed.

**Verification:** PASS

---

## Regression Audit

| Area | Result |
|---|---|
| Contract Inventory | UNCHANGED — 8 contract-record blocks / 13 contract IDs intact; no contract added, removed, or split; MA1 relabels presentation only; MA2/M1/M2/M3/N1/N2 edit wording only |
| Aggregate Ownership | UNCHANGED — Verification Case + Verified Financial Tier → BC-TRUST-1; no aggregate added or moved |
| Lifecycle Ownership | UNCHANGED — MA2 makes the `pending_verification → verified` creation path explicit (no new edge; frozen Doc-2 §5.6/§3.6 machine unchanged); M1 clarifies `requested → in_review` with already-`in_review` → `STATE` (frozen edge unchanged) |
| Event Ownership | UNCHANGED — `VendorVerified` / `VendorTierChanged[verified]` still Trust-emitted; N2 de-duplicates inline prose to §H.7 reference (§H.7 unchanged); no event added, renamed, or removed; Trust still never writes `marketplace.financial_tier_history` |
| Permission Ownership | UNCHANGED — M2 fixes the revoke rule to an OR over two confirmed Doc-2 §7 slugs (no slug invented or renamed); M3 assigns per-query slug authority per confirmed §7 slugs and the public badge (no slug); no permission ownership altered |
| Audit Ownership | UNCHANGED — N1 explains the `admin tier override` nearest-mapping only; §9 bindings + `[ESC-TRUST-AUDIT]` carries unchanged; no audit action invented |
| Policy Ownership | UNCHANGED — no POLICY key added, changed, or removed; `[ESC-TRUST-POLICY]` carries (review/dedup windows) unchanged |
| Trust Firewall | UNCHANGED — no scoring occurs in this Part; Financial Tier never feeds a score; verified tier validates declared without owning it (PATCH-01); no Billing influence; no firewall text altered |
| Procurement Moat | UNCHANGED — no matching/routing/ranking/evaluation/selection/award; RFQ ownership intact; no moat text altered |
| Escalation Markers | PRESERVED — `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-POLICY]`, `[ESC-TRUST-SLUG]` retained, not renamed, not removed; M2 notes ESC-TRUST-SLUG is not needed for revoke today (both slugs confirmed, OR rule explicit) but leaves the marker available for a future dedicated revoke slug |

---

## Governance Audit

### Ownership Integrity

**PASS** — BC-TRUST-1 owns Verification Case and Verified Financial Tier. No aggregate added, moved, or shared. The two-step creation wording (MA2) restates existing aggregate ownership; no new entity is introduced. The per-query authority expansion (M3) is read-only surface definition; no ownership changes.

---

### DDD Boundary Integrity

**PASS** — All mutations are confined to BC-TRUST-1-owned aggregates (`verification_records`, `verification_decisions`, `verified_financial_tiers`). Cross-module references (DG-1 Identity, DG-2 Marketplace, DG-5 Admin, DG-6 Communication, DG-8 Platform Core) remain read-only or event-consumption boundaries. No boundary crossed. The `verification_task_id` reference to Admin (DG-5) is read-only and was already established in the base document.

---

### Authorization Integrity

**PASS** — All slugs used in this Part are confirmed Doc-2 §7 entries: `can_submit_verification` (Owner-only), `staff_can_verify` (Verification Admin), `staff_can_ban` (compliance/ban). The M2 OR rule makes `staff_can_verify` OR `staff_can_ban` deterministic for revoke. The M3 per-query expansion correctly assigns `staff_can_verify` to the two staff queries and no slug to the public badge read. No slug invented. `[ESC-TRUST-SLUG]` carries unchanged for any future dedicated slug requirement.

---

### Trust Firewall Integrity

**PASS** — No score computation occurs in BC-TRUST-1; verified tier validates declared without owning it (PATCH-01); Trust never writes `marketplace.financial_tier_history` (rule preserved at §H.7, unchanged); Financial Tier never feeds a score (Invariant 6 — no scoring in this Part); no Billing influence; no paid-plan gate touches verification or verified-tier. All H.9 firewall postures unchanged.

---

### Procurement Moat Integrity

**PASS** — No matching, routing, ranking, quotation evaluation, supplier selection, or award is computed or referenced in BC-TRUST-1. The verified-tier band is a signal RFQ consumes (DG-3); Trust makes no procurement decision. RFQ ownership authoritative. Unchanged.

---

### Event Integrity

**PASS** — `VendorVerified` (emitted on `approve` at `trust.decide_verification.v1`) and `VendorTierChanged[verified]` (emitted on tier status change at §G4.6/§G4.7) remain the only emitted events. N2 removes inline repetition of the no-history-write rule without altering the rule at §H.7 or changing any emission site. No event coined, renamed, or removed. No event emitter changes.

---

## AI-Agent Readiness

**HIGH**

The patch substantially improves implementation determinism across all seven findings:

- **MA1:** A single canonical nine-stage vocabulary is now the only surface for all eight contract blocks. Agents implementing validation pipelines have one unambiguous stage sequence with explicit §11.2 enforcement bindings — no alternate vocabulary to resolve.
- **MA2:** The verified-tier creation path is now deterministic: row created at `pending_verification`, advanced to `verified` in the same transaction when the approved basis is present. The shortcut is explicitly closed. Agents cannot infer an absence-of-row → `verified` path.
- **M1:** Assign idempotency is cleanly separated from state enforcement. Agents implementing the assign handler know exactly: same-key replay → original result; different-request-on-wrong-state → `STATE`. No ambiguity about whether `in_review` is a success state.
- **M2:** Revoke authorization is a deterministic OR check: `staff_can_verify` OR `staff_can_ban`. No policy-gate selection. Identity `check_permission` evaluates the OR. Agents have a single implementable rule.
- **M3:** Each of the three read contracts has its own complete Actor/Authorization/Scope/Visibility definition. Agents implementing each query have independent, non-inferred authority specifications.
- **N1/N2:** The audit mapping clarification and event-binding de-duplication are low-impact improvements for readability and maintainability.

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

**Can the document proceed to `Doc-4G_PassB_Part1_Freeze_Audit_v1.0`?**

**YES**

**Justification:** The full Pass-B Part-1 governance sequence is complete: Hard Review (APPROVED WITH PATCH REQUIRED) → Patch (surgical, no regression) → Patch Verification (PASS, all seven findings closed, 0 open at any severity). The patched document `Doc-4G_PassB_Part1_BC-TRUST-1_Verification_v1.0` as amended by `Doc-4G_PassB_Part1_Patch_v1.0` has no open defects and is ready for Pass-B Part-1 Freeze Audit.

---

*End of Doc-4G_PassB_Part1_Patch_Verification_v1.0. All findings closed: F4G-PB1-MA1 PASS · F4G-PB1-MA2 PASS · F4G-PB1-M1 PASS · F4G-PB1-M2 PASS · F4G-PB1-M3 PASS · F4G-PB1-N1 PASS · F4G-PB1-N2 PASS. Regression Audit: UNCHANGED across all areas. Governance Audits: all PASS. AI-Agent Readiness: HIGH. Freeze Readiness: 0B · 0MA · 0M · 0N. Decision: PATCH VERIFICATION PASS. Approval: YES — proceed to Doc-4G_PassB_Part1_Freeze_Audit_v1.0.*
