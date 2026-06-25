# Doc-5G — Trust & Verification (M5 `trust`) API Realization — Content v1.0, Pass 2 (§4–§5)

| Field | Value |
|---|---|
| Document | Doc-5G — Trust & Verification (Module 5) — API Realization |
| Pass | 2 of 3 — Sections §4 (verification & verified-tier) and §5 (trust & performance score governance) — 20 caller-facing endpoints |
| Status | ACTIVE — Content Pass 2 of 3; §4–§5. Conforms to `Doc-5G_Structure_v1.0_FROZEN.md` |
| Realizes | The 20 §4/§5 caller-facing M5 endpoints on HTTP (method/path per §5.2/§5.3, state machine, idempotency/concurrency, error-status set, audit, disclosure-scope, score firewall, `reference_id`) |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5G Content Pass-1 (§0–§3 + inventory; plan + Pass-1 + Hard reviews applied) |
| Contains | The §5.7 realization of each §4–§5 caller-facing surface. No contract bodies, representations, error codes, POLICY keys, audit actions, events, Doc-4G rules, or **score values/formulae/thresholds/weights** restated; the 6 out-of-wire contracts (incl. `compute_*`, `ingest_performance_input`, `trigger_performance_review`, the expiry timers) and the dual-audience internal legs are §8 (Pass-3) |
| Audience | Architecture / API Governance Boards · Doc-5G authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4G fixed the contracts; Doc-2 §5.6/§3.6/§10.6 own the state edges (Doc-4M = the cross-module state-map index); Doc-5A fixed the wire mechanics. §4–§5 realize the **wire face** per Doc-5A §5/§6/§7/§9 and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, state edges, events, and **score values/formulae** are bound **by pointer, never restated**. The §3 cross-cutting model governs every endpoint here; **every read declares its disclosure scope (narrow-never-widen — §2/§3.6)**; **no score value is a caller write and no score input/formula/threshold/weight is on any wire** (R5). Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9`; `Doc-4G §G4–§G6`; `Doc-2 §5.6/§3.6/§10.6` (edges) + `Doc-4M` (index); §3 (this document).

---

## §4 — Verification & Verified-Tier Surface Realization (BC-TRUST-1)

### 4.1 Endpoint Realization (§5.2/§5.3; inventory §2.2)
- Methods: `request_verification` → `POST /trust/verifications` (`201`+`Location`, User); `assign_verification`/`decide_verification`/`revoke_verification` → `POST …/verifications/{id}/{command}` (Admin state commands); `set_verified_tier`/`confirm_verified_tier`/`suspend_verified_tier`/`downgrade_verified_tier` → `POST /trust/verified_tiers/{vendor_profile_id}/{command}` (Admin; subject-keyed — §0.4); reads → `GET` (`get_verification`, `list_verifications`, `get_verified_tier`).
- Inputs per §5.4: `{id}`=`UUIDv7` (verification) / `{vendor_profile_id}`=subject `UUIDv7` (tier) in path; Request-Contract fields in body; **no** prohibited input (actor/org-selection/authz/state/attribution never a field — `Doc-4A §9.7`); **no score value or commercial value is ever an input** (R5/R6).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4G §G4`.

### 4.2 Verification State Machine (Doc-2 §5.6 — Doc-4M index)
- The verification machine is realized as **legal transitions only**, each its named command (no transition invented — `Doc-2 §5.6`; `Doc-4M` index; `Doc-4A §13`): `request_verification` enters **`requested`** (one open case per subject+type — `BUSINESS` guard, not `CONFLICT`); `assign_verification` **`requested → in_review`**; `decide_verification` **`in_review → approved | rejected | requested`** (request-info), appending an immutable `verification_decisions` row, with `confirm`/`downgrade` affecting declared-tier validation **via the §4.3 verified-tier contracts** (which own the tier state + event); `revoke_verification` **`approved → revoked`** (fraud/compliance). The **`approved → expired` edge is owned by the §8 System timer** `expire_verification` (periodic-review lapse / document expiry — **not an Admin action**, R7), observed via reads. Illegal transition → `STATE` → `409`; stale revision → `CONFLICT` → `409`.
- `decide_verification` (on approve) emits **`VendorVerified`** to the outbox (§8) — **event catalog owned by `Doc-2 §8`, never restated** (R11).
- **Binds:** `Doc-2 §5.6`; `Doc-4M`; `Doc-4A §13`; `Doc-4G §G4.1–§G4.5`.

### 4.3 Verified-Tier Lifecycle & the M5→M2 Seam (R8)
- The verified-tier machine (`Doc-2 §3.6/§10.6`, subject-keyed): `set_verified_tier` **(absence-of-row / "Declared Only") → `verified`** (`pending_verification → verified`; `UNIQUE(vendor_profile_id)` guards a duplicate set → `CONFLICT`/`BUSINESS`); `confirm_verified_tier` **`verified → verified`** (renew); `downgrade_verified_tier` **`verified → verified`** (lower tier band); `suspend_verified_tier` **`verified → suspended`**. The **`verified → expired` edge is owned by the §8 System timer** `expire_verified_tier` (R8), observed via reads. Illegal → `STATE`; duplicate → `CONFLICT`/`BUSINESS`.
- **Verified-tier-without-ownership (R8 — the seam, reciprocal of Doc-5D DD-1):** Trust validates / confirms / suspends / downgrades the verified tier and **emits `VendorTierChanged[verified]`** (outbox, §8); **Marketplace writes `marketplace.financial_tier_history`, never Trust** — Doc-5G authors **no** cross-module write. `get_verified_tier` reflects the current `status`; **"Declared Only" = absence of a verified-tier row, reported as such (no row), never fabricated**.
- **Binds:** `Doc-2 §3.6/§10.6`; `Doc-4M`; `Doc-4G §G4.6/§G4.7/§G4.8`; R8 (Marketplace write is DG-2, out-of-wire).

### 4.4 Top-Level `reference_id` (C-05) — Doc-5G nominated declaration point
- **Every Doc-5G response that carries a body** (success and error) includes a **top-level `reference_id`** (platform-assigned `UUIDv7`) — `Doc-4A §22.1 C-05`, clarified by `PATCH-D4A-C05-204` (body-bearing responses only; `204` exempt). It is a sibling of `result`/`error` at the envelope top level, **never nested inside `error`** (`Doc-5A §6`; `CHK-5A-042` [B]). Consistent with the Doc-4G §3 response contracts (each carries `reference_id`).
- **Cross-cutting:** this declaration **applies equally to §5–§7** — §4 is the nominated declaration point for Doc-5G; the obligation is uniform across every M5 caller-facing surface and is not restated per section.
- **Binds:** `Doc-4A §22.1 C-05`; `PATCH-D4A-C05-204`; `Doc-5A §6`; `Doc-4G §3` (response shape).

### 4.5 Disclosure Scope, Authorization & Non-Disclosure (§3)
- **Disclosure scope (binding, narrow-never-widen — §2/§3.6):** `get_verification` / `list_verifications` → **Staff-Internal** (case detail + queue; never tenant-visible or public — R10); `get_verified_tier` → **Public-Badge** (band/status only — "no internal basis", Doc-4G §G4.8; + Internal-Service leg → §8, dual-audience fence). No Public-Badge read surfaces a Staff-Internal field.
- **Authorization** server-side via `check_permission` (§3.4, sole authority — no shadow path); `request_verification` is **User** with the server-validated `Iv-Active-Organization` (subject-owning org); all `assign/decide/revoke` + verified-tier commands are **Admin, no org context** (`staff_*` verification authority; gap → `[ESC-TRUST-SLUG]`). **Non-disclosure:** a cross-org or non-entitled read collapses to a uniform `NOT_FOUND` (§3.6/R10).
- **Firewall:** **no commercial/plan/payment value gates verification or the verified tier** (DG-7 verbatim, R6); **no score value is a wire input** (R5).
- **Binds:** `Doc-5A §6.3/§7`; `Doc-4G §G4`; §3.3/§3.4/§3.5/§3.6; Doc-2 §7.

### 4.6 Idempotency, Concurrency, Error & Audit
- Every §4 mutation declares `Idempotency: required` → **`Idempotency-Key` mandatory** (`Doc-5A §9`); replay within the POLICY-keyed window (**`trust.*` dedup key — `[ESC-TRUST-POLICY]`**, by intended name; **content-freeze gate, not finalized until registered in Doc-3 §12.2**) returns the cached original — same result, no duplicate audit, **no re-emitted outbox event** (`Doc-5A §9.7`). Commands declaring `Concurrency: optimistic` carry the precondition (`expected_revision`; carriage owned by `Doc-5A §9`); stale → `CONFLICT` → `409`.
- Error classes map per **`Doc-5A §6.2`** (by pointer, not restated); codes owned by the `Doc-4G §G4` registers (`trust_` namespace, `Doc-4A Appendix B.2`): `VALIDATION`→`400`, `AUTHORIZATION`→`403` (else `404` collapse — §3.6/R10), `NOT_FOUND`→`404`, `STATE`→`409`, `CONFLICT`→`409`, `REFERENCE`→`422`, `BUSINESS`→`422` (one-open-case, duplicate-tier guards), `DEPENDENCY`→`503`.
- Mutations **audited** via Doc-4B `core.append_audit_record.v1` (`Doc-4G §G4`; Doc-2 §9 by pointer); verification/tier transitions not separately enumerated carry **`[ESC-TRUST-AUDIT]`** (nearest §9 action; never invented). Emitted `VendorVerified` / `VendorTierChanged[verified]` are §8 (outbox), bound to `Doc-2 §8` by pointer.
- **Binds:** `Doc-5A §6/§9`; `Doc-4G §G4`; Doc-2 §7/§8/§9; `[ESC-TRUST-POLICY]`, `[ESC-TRUST-AUDIT]`.

---

## §5 — Trust & Performance Score Surface Realization (BC-TRUST-2 + BC-TRUST-3)

### 5.1 Endpoint Realization (§5.2/§5.3; inventory §2.3)
- Methods: `freeze_trust_score`/`reactivate_trust_score` → `POST /trust/trust_scores/{vendor_profile_id}/{command}` (Admin); `freeze_performance_score`/`reactivate_performance_score` → `POST /trust/performance_scores/{vendor_profile_id}/{command}` (Admin); reads → `GET` (`get_trust_score`, `list_trust_score_history`, `get_performance_score`, `list_performance_inputs`, `list_performance_score_history`), subject-keyed / nested (§0.4).
- **Out-of-wire (R5/R9, §8):** `compute_trust_score`, `compute_performance_score` (the **score-computation firewall** — System auto-calc, the **sole score writers**, H.9a), `ingest_performance_input` (**sole writer of `performance_inputs`**), and `trigger_performance_review` (review signal; **never edits a score**) have **no caller wire**; results observed via the reads. No caller `202`.
- **Binds:** `Doc-5A §5.2/§5.3`; `Doc-4G §G5/§G6`; structure R5/R9.

### 5.2 Freeze / Reactivate Semantics — publication only (R5)
- `freeze_*` / `reactivate_*` toggle the **`freeze_state`** (`none ⇄ frozen`) — a **publication/ranking governance effect only; they NEVER edit, recompute, or zero the computed score value** (R5; computation is the only score writer — Doc-4G H.9a). A `frozen` score's band/score publication is **suppressed** (`Doc-2 §3.6`) — never fabricated, never silently shown. Realized as legal `freeze_state` transitions (`Doc-2 §3.6`; `Doc-4M` index); illegal → `STATE` → `409`; stale → `CONFLICT` → `409`.
- **Binds:** `Doc-2 §3.6`; `Doc-4M`; `Doc-4G §G5.2/§G6.3`; R5.

### 5.3 Score Reads — band/display only; Not-Rated ≠ zero (R5/N5G-01/02)
- `get_trust_score` / `get_performance_score` (**Public-Badge**) return **band + display score** only; **while `freeze_state=frozen` the score is null/suppressed** (Doc-2 §3.6); a **sub-threshold performance score reports Not Rated (`rated=false`), never `0`** (Not-Rated ≠ zero); **no `trust_formula_version` internals, no thresholds, no weights, and no raw inputs are exposed** (N5G-01/02; Doc-4G §G5.3/§G6.5). `list_trust_score_history` / `list_performance_score_history` / `list_performance_inputs` are **Staff-Internal** (the raw inputs and version chain are staff-only — never on a public read). Reads are read-only (no state mutation); cross-entitlement read → `NOT_FOUND` (§3.6).
- **Internal-Service legs (dual-audience fence, §8):** the badge reads' internal-service consumption (current known consumers: M2 badge display DG-2, M3 matching confidence DG-3) is realized **exclusively in §8**, never an additional HTTP surface.
- **Binds:** `Doc-4G §G5.3/§G6.5`; `Doc-2 §3.6`; §2.1/§3.5; structure R5.

### 5.4 Score-Computation & Governance/Billing Firewall (R5/R6) — the M5 signature
- **Score-computation firewall (R5):** **no caller action mutates a score value; no score value is ever a caller write or wire input; no score formula, threshold, or weight appears on any wire** (N5G-01/02). The `compute_*` workers are System-only and out-of-wire (§8) — the **only** score writers (Doc-4G H.9a). `freeze_*`/`reactivate_*` govern publication only (§5.2).
- **Governance/Billing firewall (R6 — DG-7 verbatim, binding):** *No entitlement, subscription, plan, payment, credit, quota, or commercial state may influence Trust Score, Performance Score, Verification, or Verified Tier.* Realized as a wire constraint — **no commercial value is ever a gating header/param on any §5 endpoint** (`Doc-4A §4B`). No cross-signal write (Financial Tier ⇏ Trust Score; Financial Tier ≠ Performance Score).
- **Binds:** `Doc-5A §6.3`; `Doc-4A §4B`; `Doc-4G §G5/§G6` (H.9a); structure R5/R6.

### 5.5 Idempotency, Error & Audit
- `freeze_*`/`reactivate_*` `Idempotency: required` (`trust.*` dedup key — `[ESC-TRUST-POLICY]`); optimistic precondition (`expected_revision`); reads are safe `GET` (cursor pagination on `list_*`; page-size bound via the `trust.*` list page-size key — `[ESC-TRUST-POLICY]`, content-freeze gate; no offset — `CHK-5A-070/071`). Error per `Doc-5A §6.2` (by pointer; codes `Doc-4G §G5/§G6`, `trust_`). Top-level `reference_id` on every body-bearing response (§4.4). `freeze_*`/`reactivate_*` audited via `core.append_audit_record.v1` (publication-governance action; `[ESC-TRUST-AUDIT]` where not separately enumerated); **reads are not audited** (`Doc-4A §17.1`). Score-publication events (if any) are §8 (outbox), `Doc-2 §8` by pointer.
- **Binds:** `Doc-5A §6/§8/§9`; `Doc-4G §G5/§G6`; `[ESC-TRUST-POLICY]`, `[ESC-TRUST-AUDIT]`.

---

*End of Doc-5G Content v1.0, Pass 2 (§4–§5). The 20 verification/verified-tier and score-governance endpoints realized per the §5.2 method mapping (creates `POST`/`201`, state/domain commands `POST` named, reads `GET`; subject-keyed/nested addressing per §0.4); verification (`Doc-2 §5.6`) and verified-tier (`Doc-2 §3.6/§10.6`) machines bound by pointer with the `expire_*` edges owned by §8 System timers (R7/R8); the R8 verified-tier-without-ownership seam (Trust emits `VendorTierChanged[verified]`; Marketplace writes `financial_tier_history`); `reference_id` (C-05) nominated declaration point (§4.4, cross-cutting §5–§7); the score-computation firewall (R5 — `compute_*` System-only §8, sole writers; `freeze_*`/`reactivate_*` publication-only, never edit value; Not-Rated ≠ zero; no inputs/formula/thresholds/weights on the wire) and DG-7 governance/Billing firewall (R6 verbatim); disclosure-scope narrow-never-widen; idempotency/error/audit by pointer; `trust.*` dedup + list page-size keys flagged `[ESC-TRUST-POLICY]` content-freeze gate; representations/codes/POLICY keys/audit actions/events/Doc-4G rules/scores not restated; nothing coined. §6 (fraud), §7 (reviews/ratings), §8 (out-of-wire), §9 (conformance) + Appendix A follow in Pass-3, conforming to `Doc-5G_Structure_v1.0_FROZEN.md`.*
