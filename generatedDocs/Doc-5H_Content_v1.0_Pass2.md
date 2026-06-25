# Doc-5H — Communication (M6 `communication`) API Realization — Content v1.0, Pass 2 (§4–§5)

| Field | Value |
|---|---|
| Document | Doc-5H — Communication (Module 6) — API Realization |
| Pass | 2 of 3 — §4 Messaging & Threads (BC-COMM-1, 8) · §5 Notifications (BC-COMM-2, 4) — the 12 caller-facing messaging + notification endpoints |
| Status | ACTIVE — Content Pass 2 of 3; §4–§5. Independent hard review applied; 4 MINOR + 1 NITPICK resolved; 0 open. Conforms to `Doc-5H_Structure_v1.0_FROZEN.md`; builds on Pass-1 (§0–§3 + inventory) |
| Realizes | the 12 §4–§5 caller-facing surfaces on HTTP — method/path (§5.2/§5.3), request inputs (§5.4), success status (§5.5), state machine (Doc-4M index / Doc-2 §3.7/§10.7 edges), idempotency/concurrency (§9), error-status set (§6), audit, disclosure scope per read, non-disclosure |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Contains | The §5.7 realization (grouped form — Doc-5C/5D/5E precedent) of each §4–§5 caller-facing surface. No contract bodies, representations, error codes, POLICY keys, slugs, audit actions, events, or Doc-4H rules restated; the 4 out-of-wire contracts + §6/§7 + integrations are Pass-3 |
| Audience | Architecture / API Governance Boards · Doc-5H authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4H fixed the contracts; Doc-2 §3.7/§10.7 + Doc-4M own the state machines; Doc-5A fixed the wire mechanics. §4–§5 realize the **wire face** per `Doc-5A §5/§6/§7/§9/§10` and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, state edges, and the (empty) M6 event set are bound **by pointer, never restated**. The §3 cross-cutting model (User/Admin · `check_permission` sole authority · disclosure-scope + actor-side rules · delivery-only firewall · realtime = channel · non-disclosure) governs every endpoint here; **every read declares its disclosure scope** (§3.3). Transport-level choices are **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9/§10`; `Doc-4H §H4/§H5`; `Doc-4M`; `Doc-2 §3.7/§10.7`; `Doc-4E` (RFQ scrub-rule, consumed — DH-3); §3 (Pass-1).

---

## §4 — Messaging & Threads Surface Realization (BC-COMM-1)

### 4.1 Endpoint Realization (§5.2/§5.3; inventory §2.2)
- Methods: `create_thread` → `POST /communication/threads` (`201` + `Location`); `send_message` → `POST …/threads/{id}/messages` (`201` — no `Location` header; message has no standalone GET URL on this surface **[rc]**; observe via `get_messages`); `add_thread_participant` → `POST …/threads/{id}/participants` (`201`); `remove_thread_participant` → `DELETE …/threads/{id}/participants/{participant_id}` (soft; audit retained — R12); `close_thread` → `POST …/threads/{id}/close_thread` (state command); reads → `GET` (`get_thread`, `list_threads`, `get_messages`).
- Inputs per §5.4: `{id}` = `UUIDv7` in path; Request-Contract fields in body; **no prohibited input** — actor / org-selection / authz / state / attribution are **never** a wire field (`Doc-4A §9.7`). `create_thread` body carries `thread_type` (`direct` | `rfq_clarification`) + `context_id` (`rfq_id`, bare UUID, when `rfq_clarification`).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4H §H4`.

### 4.2 Thread State Machine (Doc-4M index; Doc-2 §3.7/§10.7 edges)
- The **thread** machine (`open → closed`, terminal) is realized as **legal transitions only** — `close_thread` drives the single `open → closed` edge; **no transition invented** (`Doc-4M` = cross-module state-map index; edges sourced from `Doc-2 §3.7/§10.7`; `Doc-4A §13`). Illegal transition (e.g., write to a `closed` thread) → `STATE` → `409`. **`close_thread` closes the thread and does not delete message history** (R12); `remove_thread_participant` is a soft removal that **retains the participation audit** (R12). Messages are **append-only — never overwritten or hard-deleted** (R12; `Doc-2 §10.7`).
- **Binds:** `Doc-4M`; `Doc-4A §13`; `Doc-4H §H4`; `Doc-2 §3.7/§10.7`.

### 4.3 RFQ Scrub-Rule Seam (DH-3 / R7) — `send_message` on `rfq_clarification`
- On a thread whose `thread_type = rfq_clarification`, `send_message` **reads the RFQ-owned raw-contact-scrub rule via the RFQ service** (`Doc-4E`; DH-3) and **applies it content-side** at message-write; content the rule disallows → **`BUSINESS`** error (`Doc-5A §6.2`, stage 8). **M6 cannot cache, copy, extend, or override the rule** — it applies the rule's verdict only; the rule definition stays wholly RFQ-owned; **no procurement decision is made here**. `context_id` (`rfq_id`) is a bare UUID; no ownership transfer.
- **Binds:** `Doc-4E` (scrub-rule, by pointer); `Doc-4H §H4`; `Doc-4A §9` (nine-stage validation pipeline; scrub check = stage 8 BUSINESS).

### 4.4 Realtime Delivery Channel (R9)
- Realtime push (Supabase Realtime, DH-8 backing) is a **delivery channel** (`Doc-5A §10` / `Doc-4A §15.7`), **not** an endpoint of this section. **Realtime carries observations only and has no state-transition authority** — message creation/mutation is exclusively `send_message`; the authoritative read is **`get_messages`** (source of truth). No realtime acknowledgement mutates state.
- **Binds:** `Doc-5A §10`; `Doc-4A §15.7`; DH-8.

### 4.5 Disclosure Class per Read (§3.3 binding rule)
- `get_thread` / `list_threads` / `get_messages` → **Participant** scope (only a `thread_participants` grantee reads the thread, its list membership, or its messages). A non-participant read **collapses to `NOT_FOUND`** — no existence/timing side-channel (`Doc-5A §6.3/§7`; R10). Soft-deleted/removed rows are hidden from reads.
- **Binds:** §3.3/§3.6; `Doc-4H §H4`; `Doc-2 §10.7`.

### 4.6 Idempotency, Concurrency, Error & Audit
- Every §4 mutation declares `Idempotency: required` → **`Idempotency-Key` mandatory** (`Doc-5A §9`); replay within the dedup window (**`[ESC-COMM-POLICY]`** — no `communication` POLICY namespace key registered; referenced by platform-default key name only, registration not implied; channel Doc-3 §12.2) returns the cached original — same result, no duplicate audit. `close_thread` (state transition) asserts the expected state; a lost race / stale state → **`CONFLICT` → `409`** (`Doc-4A §14` — `expected_status` OCC; H.5 convention).
- Error classes per **`Doc-5A §6.2`** (by pointer); codes owned by the `Doc-4H §H4` register (`comm_` namespace, `Doc-4A Appendix B.2`): `VALIDATION` → `400`, `AUTHORIZATION` → `403` (else `404` collapse, §3.6/R10), `NOT_FOUND` → `404`, `STATE` → `409`, `CONFLICT` → `409`, `REFERENCE` → `422`, `BUSINESS` → `422`.
- Mutations **audited** via Doc-4B `core.append_audit_record.v1`; messaging audit actions carry **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication audit domain; bound to the nearest §9 action by pointer; **never invented**). **M6 emits no `Doc-2 §8` event** (R11) — no outbox emission from these surfaces. **Authorization** server-side via `check_permission` (§3.2; `can_use_messaging`).
- **Binds:** `Doc-5A §6/§9`; `Doc-4H §H4`; Doc-2 §7/§9; `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`.

### 4.7 Top-Level `reference_id` (C-05) — Doc-5H nominated declaration point
- **Every Doc-5H response that carries a body** (success and error) includes a **top-level `reference_id`** (platform-assigned `UUIDv7`) — `Doc-4A §22.1 C-05`, clarified by `Doc-4A_Patch_C-05-204_v1.0` to **body-bearing responses only; `204` no-body responses are exempt**. It is a sibling of `result` / `error` at the envelope top level, **never nested inside `error`** (`Doc-5A §6`; `CHK-5A-042`).
- **Cross-cutting:** this declaration **applies equally to §5, §6, and §7** — §4 is the nominated declaration point for Doc-5H; the obligation is uniform across every M6 caller-facing surface and is not restated per section.
- **Binds:** `Doc-4A §22.1 C-05`; `Doc-4A_Patch_C-05-204_v1.0`; `Doc-5A §6`.

---

## §5 — Notifications Surface Realization (BC-COMM-2)

### 5.1 Endpoint Realization (§5.2/§5.3; inventory §2.3)
- Methods: `mark_notification_read` → `POST /communication/notifications/{id}/mark_notification_read` (state command); `archive_notification` → `POST …/notifications/{id}/archive_notification` (state command); reads → `GET` (`get_notification`, `list_notifications`). `create_notification` (the System event-consumer fan-out) is **out-of-wire** (§8/Pass-3) and is **not** realized here.
- Inputs per §5.4: `{id}` = `UUIDv7` in path; no prohibited input (`Doc-4A §9.7`). List filters (read/unread/archived) are query params (`Doc-5A §8`).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4`; `Doc-4H §H5`.

### 5.2 Notification State Machine (Doc-4M index; Doc-2 §3.7/§10.7 edges)
- The **notification** machine is **strict linear** `unread → read → archived` — `mark_notification_read` drives `unread → read`; `archive_notification` drives `read → archived`. **`unread → archived` is illegal** → `STATE` → `409`. **`archive_notification` advances inbox state and does not delete the notification** (R12). No transition invented (`Doc-4M` = cross-module state-map index; edges `Doc-2 §3.7` / aggregate `Doc-2 §10.7`; `Doc-4A §13`).
- **Binds:** `Doc-4M`; `Doc-4A §13`; `Doc-4H §H5`; `Doc-2 §3.7/§10.7`.

### 5.3 Disclosure Class per Read (§3.3 binding rule)
- `get_notification` / `list_notifications` → **Recipient** scope (only the notification's recipient reads it). A non-recipient read **collapses to `NOT_FOUND`** (§3.6/R10). The recipient-read scope carries **`[ESC-COMM-SLUG]`** (no distinct Doc-2 §7 notification-read slug; interim recipient scope by pointer; **never invented**; channel Doc-2 §7 additive).
- **Binds:** §3.3/§3.6; `Doc-4H §H5`; `[ESC-COMM-SLUG]`.

### 5.4 Read-State Firewall (R6)
- **Notification read / archive state is a per-recipient inbox fact only — it cannot influence prioritization, matching, or trust** (R6); it is never read by, exposed to, or consumed as a signal by any governance/matching surface. M6 computes/owns no score (DH-5).
- **Binds:** R6; DH-5; `Doc-4A §4A` (push-channel delivery-only principle); `Doc-4H §H7` (Authority Matrix).

### 5.5 Idempotency, Concurrency, Error & Audit
- `mark_notification_read` / `archive_notification` declare `Idempotency: required` (**`Idempotency-Key`**; dedup window `[ESC-COMM-POLICY]`, referenced by name only); each asserts the expected source state — stale/illegal → `STATE`/`CONFLICT` → `409`. Idempotent replay of `mark_read` on an already-`read` notification returns the cached original (no duplicate audit). Error classes per `Doc-5A §6.2` (by pointer; codes `Doc-4H §H5`, `comm_`). Reads are not audited (`Doc-5A §17.1`); mutations audited via `core.append_audit_record.v1` carrying **`[ESC-COMM-AUDIT]`**. **No `Doc-2 §8` event emitted** (R11). Authorization server-side via `check_permission`; recipient scope (§3.2/§5.3).
- **Binds:** `Doc-5A §6/§9/§17.1`; `Doc-4H §H5`; `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`.

---

*End of Doc-5H Content v1.0, Pass 2 (§4–§5). Independent hard review applied — 4 MINOR (M-01: send_message no standalone GET → no Location header; M-02: §4.3 §9.6 query-param allowlist → §9 nine-stage pipeline; M-03: close_thread OCC = expected_status / Doc-4A §14, not §9.5 updated_at; M-04: §5.2 notification FSM edges §10.7-only → §3.7/§10.7) + 1 NITPICK (NP-01: §5.4 §4B paid-plan firewall → §4A push-channel rule + §H7 Authority Matrix) resolved; 0 open. The 12 messaging + notification endpoints realized per the §5.2 method mapping (creates `POST`/`201`+`Location`, append children `POST`/`201` without Location where no standalone GET, state commands `POST` named, soft removal `DELETE`, reads `GET`/`200`); thread (`open → closed`) and notification (`unread → read → archived`) machines bound to Doc-4M (index) / Doc-2 §3.7/§10.7 (edges), no edge invented; RFQ scrub-rule read+applied content-side, no cache/copy/extend/override (R7); realtime = delivery channel, observations only, `get_messages` source of truth (R9); every read declares its disclosure scope (Participant / Recipient), non-disclosure `NOT_FOUND` collapse (R10); notification read-state firewalled from prioritization/matching/trust (R6); append-only — close keeps history, archive keeps notification (R12); idempotency/concurrency/error/audit by pointer; dedup window `[ESC-COMM-POLICY]`, recipient slug `[ESC-COMM-SLUG]`, audit `[ESC-COMM-AUDIT]`; no `Doc-2 §8` event emitted (R11); top-level `reference_id` (C-05) declared at §4.7 for all body-bearing responses; representations/codes/POLICY keys/slugs/audit actions/events/Doc-4H rules not restated; nothing coined. §6 (delivery), §7 (support), §8 (out-of-wire), §9 (conformance) + Appendix A follow in Pass-3, conforming to `Doc-5H_Structure_v1.0_FROZEN.md`.*
