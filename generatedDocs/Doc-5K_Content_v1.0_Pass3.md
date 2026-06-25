# Doc-5K — AI Layer (M9 `ai`) API Realization — Content v1.0, Pass 3 (§5–§6 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5K — AI Layer (Module 9) — API Realization |
| Pass | 3 of 3 — §5 Out-of-Wire Boundary · §6 Conformance & Carried Items · Appendix A Conformance Attestation (the freeze evidence) |
| Status | ACTIVE — Content Pass 3 of 3; §5–§6 + Appendix A. 0 open BLOCKER/MAJOR/MINOR. Conforms to `Doc-5K_Structure_v1.0_FROZEN.md` (+ Patch CE-01); builds on Pass-1 (§0–§3 + inventory) + Pass-2 (§4) |
| Realizes | the §5 out-of-wire boundary (the 8 non-wire contracts), the §6 conformance attestation obligation + carried-item register, and the Appendix A per-band CHK-5A attestation — completing the Doc-5K content set |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Contains | Boundary declaration + attestation only. No representations, error codes, POLICY keys, slugs, audit actions, events, scores, or Doc-4K rules restated — bound by pointer |
| Audience | Architecture / API Governance Boards · Doc-5K authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** §5 declares a boundary (no realization); §6 + Appendix A attest. Nothing is coined; every binding is by pointer. The 4 caller-facing read families (§4, Pass-2) are the **only** M9 wire surface.

**Dependency realization path:** `Doc-4K` BC-AI-1…4, §B.12; `Doc-2 §10.10`; `Doc-5A §1.3/§5/§6/§8/§11/§17.1`, Appendix A; §3 (Pass-1).

---

## §5 — Out-of-Wire Boundary (generate · expire · internal-service leg)

The **8 out-of-wire contracts have no HTTP wire** — they are in-process services / background jobs / event-free derivation, never a caller surface. **Doc-5K realizes none of them as an endpoint** (this section is a boundary statement, not a realization).

### 5.1 `generate_*` — AI-Agent on-demand + System scheduled (4)
- `ai.generate_recommendation.v1` · `ai.generate_prediction.v1` · `ai.generate_classification.v1` · `ai.generate_similar_vendors.v1` — Operation `21.4 Command / 21.5 System`, **Actor `AI Agent / System`** (no User/Admin caller actor — **out-of-wire**, REC-1 resolved). Invoked in-process (AI-Agent on-demand derivation or System scheduled derivation), **never over HTTP**.
- **Idempotent upsert** on the **globally-unique cache identity `(subject_org_id, entity_ref_id, model_version)`** — a re-run with the same key refreshes the row (no duplicate); a different `model_version` creates a new row (`Doc-4K`). Request idempotency key = `ai_idempotency_key` (`UUIDv7`, Doc-4B). Writes **only `ai.*`** — never directly or indirectly mutates another bounded context's authoritative table (R5); **no authoritative write is attributed to the AI Agent**.
- **Binds:** `Doc-4K` BC-AI-1…4; R5/R7.

### 5.2 `expire_*` — System TTL hard-delete sweep (4)
- `ai.expire_recommendations.v1` · `ai.expire_predictions.v1` · `ai.expire_classifications.v1` · `ai.expire_similar_vendors.v1` — Operation `21.5 System`, **Response: none**. The cache-maintenance sweep **hard-deletes** rows where `expires_at < now()` (a **legitimate hard-delete** — derived disposable cache, **not** Invariant #8 append-only; `Doc-4K §B.12` + `Doc-2 §10.10`). Idempotent; batch-configurable; runs under System authority (no org context).
- **Binds:** `Doc-4K §B.12`; `Doc-2 §10.10`; R7.

### 5.3 Dual-audience internal-service consumption leg (mechanism)
- The `get_*`/`list_*` reads' **System / internal-service leg** — in-process consumption of an artifact by an owning module — has **no HTTP wire** (the caller-facing **User** leg is the §4 surface). It is a **mechanism, not a counted contract**.
- **Binds:** §1.2 (partition); R1.

### 5.4 Protocol fence
- **Out-of-wire contracts have no caller wire in any protocol: no REST endpoint, no SSE stream, no WebSocket, no Webhook, no GraphQL. No streaming protocol today; any future protocol addition requires governance approval (`Gov-Note §5` amendment), never a local decision.** **Flag-and-halt if any wire surface in any protocol is proposed** — it is an architecture change. Implementation is code / Doc-6.
- **Audit:** `generate_*` / `expire_*` mutations bind the nearest `Doc-2 §9` action by pointer (`[ESC-AI-AUDIT]`; never invented); reads are not audited (`Doc-5A §17.1`). **M9 emits no `Doc-2 §8` event** (R8; `[ESC-AI-EVENT]`).
- **Binds:** `Doc-5A §1.3/§11`; `[ESC-AI-AUDIT]`, `[ESC-AI-EVENT]`.

---

## §6 — Conformance & Carried Items

### 6.1 Conformance Obligation
Doc-5K passes the **Doc-5A Appendix A** `CHK-5A-xxx` checklist (Appendix A below) before freeze (`Gov-Note §6`). Conformance is transitive — passing Doc-5A does not waive Doc-4A or the upstream corpus. Doc-5K **coins nothing** (no endpoint/status/header/error-class/slug/POLICY key/event/score) and **restates no DF-AI rule** — all bound by pointer.

### 6.2 Carried-Item Register (by pointer; resolved only via named channels)

| ID | Channel | Doc-5K disposition |
|---|---|---|
| DF-AI-1 (Identity) · DF-AI-2 (Marketplace) · DF-AI-3 (RFQ) · DF-AI-4 (Operations) · DF-AI-5 (Trust) · DF-AI-6 (Platform Core) | `Doc-4K` | consumed by pointer; **no rule restated** (M-5); no cross-module surface realized |
| `[ESC-AI-AUDIT]` | Doc-2 §9 additive | generate/expire bound to nearest §9 action; reads not audited; never invented |
| `[ESC-AI-EVENT]` | Doc-2 §8 additive | M9 emits/consumes no event; §11 N/A; **never coin an event** |
| `[ESC-AI-POLICY]` | Doc-3 §12.2 additive | TTL keys `policy.ai.<bc>.ttl_seconds` by intended name; **`[ESC-AI-POLICY]`-keyed contracts not finalized until registered** |
| `[ESC-AI-SLUG]` | Doc-2 §7 additive | no `ai_` slug; caller-gating reuses upstream entitlements via `check_permission`; never invented |
| `[REC-AI-WIRE]` | Doc-4K contract metadata | **Satisfied** — `generate_*` out-of-wire (no caller actor); final 8+8; **reconfirmed verbatim at this content pass** (Pass-1/2/3 honor it) |

---

## Appendix A — Doc-5K Conformance Attestation

> Attestations only — **no normative behavior** (N5); all binding rules live in §0–§6. Per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M9 surface (the 8 §4 reads). The freeze evidence.

### A.1 Doc-5A core-band attestation (representative checks)

| Band | Check (by pointer) | Result | Where |
|---|---|---|---|
| Method / status | `CHK-5A-035` success status from the §5.5 family (all reads `200`) | ✅ | §4.1 |
| Top-level `reference_id` | `CHK-5A-042` `reference_id` at envelope top, never inside `error` | ✅ | §2.1 (Pass-1) / §4.7 |
| Pagination | `CHK-5A-070` cursor-only, no offset | ✅ | §4.4 |
| Async | `CHK-5A-090/091/092` async/`ASYNC_PENDING` | **N/A** — no async wire; generation is out-of-wire (§5) |
| Namespace (route) | `CHK-5A-151` route prefix in App B.1 (`ai`) | ✅ | §2.1 / R3 |
| Namespace (error-code) | `CHK-5A-152` / `-043` `error_code` within the `ai_` prefix | ✅ | §4.6 |
| Anti-invention | `CHK-5A-121` no endpoint/status/header/error-class/slug/POLICY-key invented | ✅ | §0.3 / R4 |
| Event payload | `CHK-5A-103` event catalog owned by Doc-2 §8 | ✅ **N/A** — M9 emits no event (R8) |
| Audit | reads not audited (`Doc-5A §17.1`); mutations `[ESC-AI-AUDIT]` | ✅ | §4.6 / §5.4 |

### A.2 M9-unique band attestation

| Band | Attestation | Result |
|---|---|---|
| **Advisory / non-authoritative** | No caller bound; no AI-attributed authoritative write; M9 writes only `ai.*` (no direct/indirect cross-BC mutation); expired ≠ authoritative historical evidence | ✅ — R5 / §3.4 / §5.1 |
| **Score / decision firewall** | AI confidence (VO-1 `Score`) ≠ Trust score; snapshot-only score read (DF-AI-5); no matching/routing/award surface | ✅ — R6 / §3.5 / §4.2 |
| **Regenerable cache** | TTL hard-delete legitimate (not append-only); globally-unique cache identity; TTL ≠ business invalidation; deterministic regen; model-version = AI-infra; no business state machine (`§B.12` / `Doc-2 §10.10`) | ✅ — R7 / §4.5 / §5.2 |
| **Non-disclosure** | Subject-Org tenancy; own-org absent → `null`; cross-tenant → `404` collapse; bare-UUID `similar_vendors`; no leakage via totals | ✅ — R9 / §3.7 / §4.3 |
| **Actor** | User read-only on the wire; AI-Agent/System out-of-wire; **no public, no Admin** | ✅ — R2 / §3.1 / §5.1 |
| **Protocol fence** | No wire in any protocol for the 8 out-of-wire contracts; no streaming (governance-gated) | ✅ — §5.4 |

### A.3 Freeze statement
Doc-5K realizes the M9 caller-facing surface as **8 read endpoints**, coins nothing, restates no DF-AI rule, and passes the applicable Doc-5A Appendix A checks. The `[REC-AI-WIRE]` reconciliation (generate_* out-of-wire; final 8+8) is honored across Pass-1/2/3. **No open BLOCKER / MAJOR / MINOR — the Doc-5K content set is content-freeze-ready** (pending the standard Freeze Readiness Audit; the `[ESC-AI-POLICY]` TTL-key registration is a per-contract content-finalization carry, not a structural blocker).

---

*End of Doc-5K Content v1.0, Pass 3 (§5–§6 + Appendix A) — and of the Doc-5K content set. §5 declares the out-of-wire boundary (4 `generate_*` AI-Agent/System idempotent-upsert derivations · 4 `expire_*` System TTL hard-delete sweeps · the get/list internal-service leg), protocol-fenced (no wire in any protocol; no streaming, governance-gated); §6 attests conformance + registers DF-AI-1…6 / `[ESC-AI-*]` / `[REC-AI-WIRE]` by pointer; Appendix A records the per-band CHK-5A attestation (core + M9-unique bands) as the freeze evidence. Nothing coined; no DF-AI rule restated; the M9 advisory / firewall / regenerable-cache / non-disclosure signature is intact. Next: Doc-5K content Freeze Readiness Audit → content freeze. Conforms to `Doc-5K_Structure_v1.0_FROZEN.md` (+ Patch CE-01).*
