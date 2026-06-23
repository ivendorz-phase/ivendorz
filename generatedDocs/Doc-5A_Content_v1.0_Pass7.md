# Doc-5A — API Realization Standards — Content v1.0, Pass 7 (§10)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 7 of N — Section §10 only |
| Status | ACTIVE — Content Pass 7 of N; §10 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1 (§0–§2), Pass-2 (§3–§4), Pass-3 (§5–§6), Pass-4 (§7), Pass-5 (§8), Pass-6 (§9) |
| Contains | Asynchronous-operation **wire-realization** only — accepted-then-processing pattern, status-resource observation, `ASYNC_PENDING`, no-fabricated-activity, delivery-channel boundary, async state ownership & discipline. No webhooks/SSE/socket details, no Inngest/queue/worker/retry/dead-letter design, no new status codes, no new realtime guarantees, no framework code |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** The accepted-then-processing pattern (`Doc-4A §15`), the `ASYNC_PENDING` class (`Doc-4A §12.2`, mapped in Doc-5A §6.2), the no-fabricated-activity FIXED rule (`Doc-3 §12.1`), and the frozen state machines (`Doc-2 §5` / `Doc-4M`) are **frozen**. §10 realizes only the **wire face** of async operations and re-decides none of them. It introduces no async semantics, no status code, no event model, no infrastructure requirement, no job-engine decision, and no realtime guarantee. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** §5 (`202` accepted) · §6 (`ASYNC_PENDING` status) · §11 (event surface — verified later) · `Doc-4A §15` · `Doc-4M` · `Doc-3 §12.1`.

---

## §10 — Asynchronous Operation Realization Standard

### 10.1 Accepted-Then-Processing Wire Pattern

- An operation whose execution extends beyond the synchronous request (`Doc-4A §15.1`) is realized as the **accepted-then-processing** pattern: the synchronous request completes **Phase-1** and returns **`202 Accepted`** (§5.5); **Phase-2** continues out of band. **Phase-1 validation MUST be complete in the synchronous request and MUST NOT be deferred into Phase-2** (`Doc-4A §15.1`).
- The `202` body carries the entity in its **post-Phase-1 state** — the state `Doc-2 §5` / `Doc-4M` designates for the command — which is the authoritative starting point, **not** the final outcome (`Doc-4A §15.3`).
- A contract **MUST NOT** claim synchronous completion of work that is actually async, and **MUST NOT** place a **synchronous facade over an async engine** (`Doc-4A §15.1`/§15.4).
- **Terminology note (clarification, no semantic change):** the **Phase-1** and **Phase-2** labels used in §10 are explanatory **realization terminology only** and are **not business states** — business states are defined solely by the frozen state machine (`Doc-2 §5` / `Doc-4M`; §10.8).
- **Binds:** `Doc-4A §15.1`, §15.3; Doc-5A §5.5 (`202`). **Rationale [realization convention — accepted body]:** `202` is already the §5.5 success status; §10 fixes that its body is the true post-Phase-1 entity state, never a completion claim.

### 10.2 Status Resource = Source of Truth

- The caller observes the outcome through the owning module's **Query**, which returns the entity's **current true state per the state machine** (`Doc-4A §15.3`). That Query is the **status resource and the single source of truth** for the async outcome.
- The `202` Phase-1 response **MUST NOT** be cached or treated as the final outcome (`Doc-4A §15.3`). Observation is declared per `Doc-4A §15.2` (Query name | push channel | poll-interval POLICY key, §10.6).
- **Binds:** `Doc-4A §15.2`, §15.3. **Rationale:** one authoritative observation surface (the entity Query) prevents callers inferring completion from a non-authoritative signal.

### 10.3 `ASYNC_PENDING` Realization

- `ASYNC_PENDING` is realized **here** (the §10 ownership assigned in Doc-5A §6.2): a **dedicated result-observation Query** — one that returns a result **only** upon completion — **MUST** return `ASYNC_PENDING` (`Doc-4A §12.2`, `retryable: true`) while Phase-2 is in progress, **never a fabricated partial result** (`Doc-4A §15.3`).
- A plain entity Query (not result-only) instead returns the entity's **current true state** (e.g. whatever current state is defined by the authoritative frozen state machine), not `ASYNC_PENDING`.
- The status code is the existing `ASYNC_PENDING` mapping of Doc-5A §6.2 — **no new status code** is introduced.
- **Binds:** `Doc-4A §15.3`, §12.2; Doc-5A §6.2. **Rationale:** `ASYNC_PENDING` is the result-Query's truthful "not yet" signal; routing its realization through §10 keeps the error surface (§6) and the async surface consistent.

### 10.4 No-Fabricated-Activity (wire)

- `Doc-3 §12.1` is a **FIXED** invariant, by pointer — **not POLICY-overridable** (`Doc-4A §15.4`). On the wire: **no fabricated progress, no fabricated percentages, no synthetic activity**; no "processing started" before processing begins and no "completed" before completion (`Doc-4A §15.4`).
- A status resource (§10.2) reports **only** the entity's true state; it **MUST NOT** synthesize intermediate progress, counters, or percentages the corpus does not define.
- A contract design that requires fabricating state to function is **nonconforming** and **MUST** be escalated (`Doc-4A §15.4`/§0.6; `Doc-5_Program_Governance_Note_v1.0 §7`).
- **Binds:** `Doc-4A §15.4`; `Doc-3 §12.1` (FIXED). **Rationale:** the truthfulness of the async surface is a hard invariant; §10 realizes it as "report only true state, synthesize nothing."

### 10.5 Delivery Channel ≠ State Authority

- Where push infrastructure delivers state-change notifications (currently Supabase Realtime, `Doc-4A §15.7`), it is a **delivery channel only**: a push notification is **not** state authority, **not** a contract, and **not** a substitute for the status resource (§10.2).
- A caller **MUST** be able to obtain the authoritative outcome from the status resource **without** any push channel — Phase-2 completion does not depend on caller observation (`Doc-4A §15.2`).
- **Event delivery ≠ business completion:** transactional-outbox events are delivered at-least-once to idempotent consumers (`Doc-4A §16`); an event signals a fact to consumers, **not** the caller's completion authority. (The forward-verification of this against the event surface occurs at §11, per §9.7.)
- **No new realtime guarantees** are introduced; push-channel transport mechanics are development/code concerns.
- **Missed, delayed, duplicated, or reordered notifications do not alter authoritative business state** — the status resource (§10.2/§10.7) remains the sole authority for the outcome.
- **Binds:** `Doc-4A §15.7`, §16; §15.2. **Rationale:** separating delivery from authority is what stops a missed/duplicated notification from corrupting the caller's view of business state.

### 10.6 Observation Mechanics

- The `Doc-4A §15.2` Observation declaration is realized as Query-based polling and/or a declared push channel. A **poll interval is referenced by POLICY key** (`Doc-4A §18` / `Doc-3 §12`), **never** a literal value on the wire or in this document.
- Phase-2 completion **MUST NOT** depend on the caller observing (`Doc-4A §15.2`); the status resource (§10.2) and `ASYNC_PENDING` (§10.3) are the wire faces of observation.
- **Binds:** `Doc-4A §15.2`, §18; `Doc-3 §12`. **Rationale [realization convention — POLICY-keyed interval]:** the interval is tunable behavior, bound by key, never embedded.

### 10.7 Async State Ownership

- The **authoritative async state belongs to the owning aggregate/entity.** A status resource **MUST** expose the **current state of the authoritative entity**.
- An implementation **MUST NOT** create an **independent job-status lifecycle that becomes authoritative over business state**. Job infrastructure **MAY** track execution internally, but the **business outcome is determined only by the owning aggregate state**.
- **Binds:** `Doc-4A §15.2`, §15.3. **Rationale:** a job tracker is an execution detail; making it authoritative would create a second source of truth for business state, which the corpus forbids.

### 10.8 Async-State Discipline

- Asynchronous execution **MUST NOT** introduce business states **absent from the frozen state machine** (`Doc-2 §5` / `Doc-4M`).
- Async processing changes **execution timing, not domain lifecycle**.
- Any proposed **async-specific business state requires architecture-level approval** — flag-and-halt; it is never invented in a Doc-5 document (`Doc-5_Program_Governance_Note_v1.0 §7`; `Master Architecture §22.7`).
- **Binds:** `Doc-4A §15`; `Doc-4M` (state-machine authority); `Doc-2 §5`. **Rationale:** the state machines are frozen; async is a timing realization over them, never a source of new states.

---

*End of Doc-5A Content v1.0, Pass 7 (§10). Asynchronous-operation wire realization only — no webhooks/SSE/socket details, no Inngest/queue/worker/retry/dead-letter design, no new status codes, no new realtime guarantees, no new business states, no framework code. §11 onward follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
