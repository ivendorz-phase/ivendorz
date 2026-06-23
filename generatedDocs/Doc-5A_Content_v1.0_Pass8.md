# Doc-5A — API Realization Standards — Content v1.0, Pass 8 (§11)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 8 of N — Section §11 only |
| Status | ACTIVE — Content Pass 8 of N; §11 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1…Pass-7 (§0–§10) |
| Contains | Event-surface **boundary** realization only (thin) — the caller-observable event-completion rule, the event-authority boundary, and the no-external-webhook exclusion. No event catalog, no payload schemas, no outbox/dispatcher design, no webhooks/SSE/socket push, no new events, no new delivery semantics |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** The transactional-outbox event contract (`Doc-4A §16`), the event catalog (`Doc-2 §8` / `Doc-4J`), and the cross-module event flows (`Doc-4L`) are **frozen** and owned upstream. §11 is **thin**: it does not restate the catalog, payloads, outbox, or delivery semantics — it fixes only the **caller-facing surface boundary** of events, binding everything else by pointer. It introduces no event, no payload, no delivery guarantee, and no push/webhook surface. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** §10 (status resource) · `Doc-4A §16` · `Doc-2 §8` · `Doc-4J` · `Doc-4L`.

---

## §11 — Event Surface Realization & Delivery Notes

### 11.1 Event Surface Boundary

- Events are the platform's **internal integration fabric** — facts written to the transactional outbox and delivered to internal consumers (`Doc-4A §16`). They are **not** a caller-facing wire API: an API caller does **not** subscribe to, receive, or contract on raw outbox events.
- The event **catalog and payloads** (`Doc-2 §8` / `Doc-4J` authoritative catalog), the **outbox** obligation (`Doc-4A §16` / Doc-4B), and the **cross-module flows** (`Doc-4L`) are owned upstream and are **not restated, extended, or realized as a wire surface** here. §11 binds them by pointer only.
- **Binds:** `Doc-4A §16`; `Doc-2 §8`; `Doc-4J`; `Doc-4L`. **Rationale:** keeping events off the caller surface preserves the one-source-of-truth boundary and prevents Doc-5A from becoming a second event-catalog authority.

### 11.2 Caller-Observable Event Completion

- An API caller observes event-driven completion **only** through the **§10 status resource** (the owning module's Query of the entity's current true state) — **never** by consuming outbox events directly.
- **Event delivery ≠ business completion:** an outbox event is delivered at-least-once to idempotent consumers (`Doc-4A §16`) and signals a fact to those consumers; it is **not** the caller's completion signal. This realizes and **closes the forward-verification flagged in §10.5** — the joint no-duplicate rule's event-surface face is consistent with the transport face: the caller's authority is the status resource, not event receipt.
- **Binds:** Doc-5A §10 (status resource); `Doc-4A §16`. **Rationale:** one caller-observable completion path (the status resource) means missed/duplicated/late event delivery never affects what the caller sees as the outcome.

### 11.3 No External Webhook / Push Surface (ratified exclusion)

- The frozen corpus defines **no** outbound webhook, server-push, or third-party event-delivery API surface. §11 **MUST NOT** invent one (no webhooks, SSE, or socket-based push contracts).
- An external event/push surface is introduced **only** by an architecture patch — flag-and-halt and escalate (`Doc-5_Program_Governance_Note_v1.0 §7`); it is never created in a Doc-5 document. (Internal push delivery of state-change notifications remains a delivery channel only, per §10.5.)
- **Binds:** `Doc-5A_Structure_v1.0_FROZEN.md` §11 (ratified exclusion); `Doc-5_Program_Governance_Note_v1.0 §7` (escalation). **Rationale:** the absence is a real corpus gap, fenced — never filled by local invention.

### 11.4 Event Authority Boundary

- Events **communicate facts between internal consumers**. They are **not** caller-facing completion authority, and they are **not** authoritative state.
- The **authoritative business state remains the owning aggregate** and is observed through the **§10 status resource** (§10.2/§10.7).
- An API caller **MUST NOT** treat event receipt (via any notification or push channel) as completion authority. The authoritative outcome remains the **§10 status resource**. The event is a fact to act on (idempotently, `Doc-4A §16`), not a determination of business outcome.
- **Binds:** `Doc-4A §16`; Doc-5A §10. **Rationale:** distinguishing "a fact was delivered" from "the business outcome is X" is what keeps the owning aggregate the single source of truth across the async and event surfaces.

---

*End of Doc-5A Content v1.0, Pass 8 (§11). Event-surface boundary realization only (thin) — no event catalog, payload schemas, outbox/dispatcher design, webhooks/SSE/socket push, new events, or new delivery semantics; the event-completion face of the §9.7/§10.5 forward note is verified here. §12 and Appendices A–C follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
