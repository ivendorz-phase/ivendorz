# Doc-5A — API Realization Standards — Content v1.0, Pass 6 (§9)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 6 of N — Section §9 only |
| Status | ACTIVE — Content Pass 6 of N; §9 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1 (§0–§2), Pass-2 (§3–§4), Pass-3 (§5–§6), Pass-4 (§7), Pass-5 (§8) |
| Contains | Idempotency & concurrency **wire-carriage** realization only — how the idempotency key and the optimistic-concurrency token are carried, and the observable replay/conflict/retry behavior. No storage design, no deduplication-mechanism or window values, no new headers, no new status codes, no framework code |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** The idempotency requirement and key model (`Doc-4A §14.1/§14.2`), the joint replay rule (`Doc-4A §14.3`), the request scenarios (`Doc-4A §14.4`), the optimistic-concurrency model and token (`Doc-4A §14.5`), the retry/error alignment (`Doc-4A §14.7`), the outbox/event obligations (`Doc-4A §16`), and the audit obligations (`Doc-4A §17`) are **frozen**. §9 realizes only their **wire carriage and observable behavior**, reusing the header slots already registered in §4.4 and the error mapping already realized in §6.2. It allocates no new header, no new status code, no new concurrency or retry semantics, and re-decides no outbox or audit behavior. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** §4 (header slots) → §6 (error/status: `CONFLICT` → `409`) → **§9** → §11 (event surface). Business-uniqueness is a `Doc-4A §11.2` Category-8 concern (not idempotency).

---

## §9 — Idempotency & Concurrency Realization Standard

### 9.1 Idempotency Model (declaration realized, not re-decided)

- Every unsafe operation has already declared its idempotency model upstream — an idempotency-key declaration (`Doc-4A §14.2`) or an optimistic-concurrency declaration (`Doc-4A §14.5`); a pure Query declares `Idempotency: not-applicable` (`Doc-4A §14.1`). §9 does **not** decide which model applies; it realizes the **wire carriage** of whichever model the contract declared.
- **Binds:** `Doc-4A §14.1` (idempotency requirement). **Rationale:** the model choice is a frozen contract declaration; §9 is the transport realization of it.

### 9.2 Idempotency-Key Carriage

- Where a contract declares `Idempotency: required` (`Doc-4A §14.2`), the idempotency key is carried in the **§4.4-registered `Idempotency-Key` header slot** — **never** in the request body, path, or query. It is a replay-safety metadata field, not a business input (`Doc-4A §14.2`/§9.7; §5.4 prohibited inputs).
- The key is a **client-generated opaque string**; its format, character set, and length are development-document concerns (`Doc-4A §14.2`) and are **not** fixed here. §9 fixes only that the key is carried in the registered header.
- **Binds:** `Doc-4A §14.2` (key declaration, client-generated, metadata-not-payload), §9.7 (no business-input smuggling); §4.4 (`Idempotency-Key` slot). **Rationale [realization convention — header carriage]:** carrying the key in the registered header (not the payload) is the realization that keeps it a replay mechanism rather than a business field; no new header is introduced.

### 9.3 Safe-Replay Behavior on the Wire

- A **safe replay** — the same request re-submitted with the **same** idempotency key within the contract's deduplication window (`Doc-4A §14.4`) — returns the **stored original result** with **no re-execution** (`Doc-4A §14.3`). **[realization convention — replay-response identity]:** Doc-5A realizes "return the stored result" as a reply carrying the **same stored result, the same HTTP status, and the same original `reference_id`** as the first execution (the `reference_id` links the response to the single audit record and the key, `Doc-4A §22.1 C-05`/§17). The corpus (`Doc-4A §14.3`) guarantees only the **stored result and no re-execution**; the identical-response realization above is Doc-5A's, **not** an upstream byte-identity guarantee.
- The replay path **MUST NOT** produce a second audit record and **MUST NOT** write a second outbox event (the `Doc-4A §14.3` joint rule; §9.7). The deduplication **mechanism, layer, and window** are development-document concerns (`Doc-4A §14.3` — "implementation mechanism belongs in development documents"); §9 asserts only the observable wire result and the no-duplicate obligation.
- **Binds:** `Doc-4A §14.3` (joint replay rule), §14.4 (safe-replay scenario), §22.1 C-05 (`reference_id`); §16.2/§17 (no duplicate event/audit). **Rationale:** the corpus fixes "return the stored result, emit nothing twice"; §9 realizes that as an identical stored replayed response (a [realization convention], not an upstream byte-identity guarantee) and binds the no-duplicate guarantees to their owners.

### 9.4 Request-Scenario Realization

Realizing the `Doc-4A §14.4` scenarios on the wire (behavior owned upstream; §9 maps outcomes only):

| Scenario (`Doc-4A §14.4`) | Wire outcome |
|---|---|
| **Safe replay** (same key, within window) | Stored original response returned, no re-execution (§9.3). |
| **Duplicate submission** (different or absent idempotency keys) | Two **independent** executions, each with its own outcome, audit record, and outbox events. Business-logical duplication is a **`BUSINESS` (`Doc-4A §11.2` Category 8)** validation concern → `422` per §6.2 — **never** `CONFLICT` (`Doc-4A §14.4`/§14.6). |
| **Concurrent submission** (overlapping in-flight on one resource) | Handled by the concurrency model (§9.5); the losing request receives `CONFLICT` (`Doc-4A §14.4`/§12.2) → `409` (§6.2). |

- **Post-window:** behavior after the deduplication window expires is owned by development documents (the window is itself a development concern, `Doc-4A §14.2`/§14.3); **§9 asserts no outcome** for post-window re-submission.
- **Binds:** `Doc-4A §14.4` (scenarios), §14.6 (idempotency ≠ business uniqueness), `Doc-4A §11.2` (Category 8 BUSINESS); Doc-5A §6.2 (status mapping). **Rationale:** one wire mapping for the three frozen scenarios prevents per-module divergence; the BUSINESS-vs-`CONFLICT` separation is upstream and merely surfaced here.

### 9.5 Optimistic-Concurrency Precondition Carriage

- Where a contract declares `Concurrency: optimistic` (`Doc-4A §14.5`), the concurrency **precondition token** is carried in the **§4.4-registered concurrency-precondition header slot** (its concrete token is owned by §4.4 / Appendix B). The token value is **`updated_at`** — the canonical concurrency token from the entity's canonical representation (`Doc-4A §14.5`/§10.2); a contract **MUST NOT** define a separate version counter when `updated_at` is available, and **MUST NOT** conflate the idempotency key with the concurrency token (`Doc-4A §14.5`).
- On a **token mismatch** (a stale precondition), the write is rejected with **`CONFLICT`** (`Doc-4A §12.2`/§14.4) → **`409`** (§6.2). The error response carries the **current concurrency token** and nothing about the competing actor (`Doc-4A §12.5`), so the caller can re-read and retry (§9.6).
- **Current-token wire location (`Doc-4A §12.5`) [realization convention]:** the one canonical, platform-wide location of the current concurrency token on a `409 CONFLICT` response is the standard HTTP **`ETag`** response header, carrying the entity's current `updated_at` token. `ETag` is a **standard HTTP infrastructure header** (the same class as `Location`/`Retry-After`, §4.0/§5.5/§6.4) — it is **not** a new Doc-5A application header and is outside the §4 registry. No new error-envelope field is added (the §6.1 error model is unchanged); the token rides the standard header only.
- `Concurrency: none` is realized as the absence of the precondition (permitted only with the upstream-required justification, `Doc-4A §14.5`); §9 adds no concurrency semantics beyond the frozen optimistic/none model.
- **Binds:** `Doc-4A §14.5` (optimistic-concurrency, `updated_at` token), §10.2 (`updated_at` in representation), §12.2/§12.5 (`CONFLICT` carries current token); §4.4 (concurrency-precondition slot); Doc-5A §6.2 (`409`). **Rationale [realization convention — token carriage]:** carrying `updated_at` in the registered precondition header is the realization of the frozen optimistic model; no new header, semantics, or status is introduced.

### 9.6 Retry Realization

- Retry behavior is the §6 retryability signal (`error.retryable`, `Doc-4A §12.2`); §9 adds **no** new retry semantics (`Doc-4A §14` owns retry).
- Per `Doc-4A §14.7`: a contract declaring `Idempotency: required` carries `CONFLICT: retryable: true` — the idempotency-key replay mechanism (§9.3) makes the retry safe. A contract declaring `Concurrency: optimistic` carries `CONFLICT: retryable: true, after re-read` — the caller **re-reads** the entity to obtain the **current** `updated_at` token (returned per §9.5) before retrying. Doc-5A surfaces these as the §6.4 retryability realization (`409` is retryable per the contract's declaration).
- **Binds:** `Doc-4A §14.7` (retry/error alignment), §12.2 (retryable defaults); Doc-5A §6.4 (retryability realization). **Rationale:** retry is upstream-declared; §9 only points the wire client at the §6 signal and the re-read flow.

### 9.7 Joint No-Duplicate Rule (cross-section)

- The no-duplicate guarantee is a **joint rule** across §9 / §16 / §17: a safe-replayed request produces **exactly one** audit record (the original) and **no** second outbox event (`Doc-4A §14.3`; §16.2; §17). §9 realizes the **wire** side (return stored result, §9.3); the **outbox** write obligation is owned by `Doc-4A §16` / Doc-2 §8, and the **audit** obligation by `Doc-4A §17` / Doc-2 §9. §9 **re-decides neither** — it binds to them.
- The idempotency key recorded in the audit record (`Doc-4A §17`/`Doc-4A §14.3`) is the evidence that a second request was a replay, not a second execution; §9 carries the key (§9.2) but does not define audit or outbox content.
- **Forward-verification note:** the transport face of the joint no-duplicate rule is realized here; consistency with the event-surface face must be verified when Doc-5A §11 is authored.
- **Binds:** `Doc-4A §14.3` (joint rule), §16/§16.2 (outbox), §17 (audit); Doc-2 §8 (event catalog), §9 (audit mapping). **Rationale:** the replay invariant spans transport, events, and audit; §9 realizes only the transport face and defers the outbox/audit faces to their owners.

---

*End of Doc-5A Content v1.0, Pass 6 (§9). Idempotency/concurrency wire-carriage realization only — no storage design, deduplication-mechanism or window values, new headers, new status codes, or framework code; outbox and audit behavior bound to their owners, not redefined. §10 onward follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
