# Doc-5H — Communication (M6 `communication`) API Realization — Content v1.0, Pass 3 (§6–§9 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5H — Communication (Module 6) — API Realization |
| Pass | 3 of 3 — §6 Delivery Tracking (BC-COMM-3, 1) · §7 Support Communications (BC-COMM-4, 6) · §8 Out-of-Wire Boundary (4) · §9 Conformance & Carried Items · Appendix A |
| Status | ACTIVE — Content Pass 3 of 3; §6–§9 + Appendix A. 0 open BLOCKER/MAJOR/MINOR. Conforms to `Doc-5H_Structure_v1.0_FROZEN.md`; builds on Pass-1 (§0–§3 + inventory) and Pass-2 (§4–§5) |
| Realizes | the §6–§7 caller-facing surfaces on HTTP — method/path (§5.2/§5.3), request inputs (§5.4), success status (§5.5), state machine (Doc-4M index / Doc-2 §3.7 edges), idempotency/concurrency (§9), error-status set (§6), audit, disclosure scope per read, actor side per command, non-disclosure; the §8 out-of-wire boundary declaration; the §9 conformance attestation + carried-items register; Appendix A per-band attestation |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Contains | The §5.7 realization of each §6–§7 caller-facing surface; §8 out-of-wire boundary; §9 conformance + carried items; Appendix A. No contract bodies, representations, error codes, POLICY keys, slugs, audit actions, or Doc-4H rules restated — bound by pointer |
| Audience | Architecture / API Governance Boards · Doc-5H authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4H fixed the contracts; Doc-2 §3.7/§10.7 + Doc-4M own the state machines; Doc-5A fixed the wire mechanics. §6–§9 + Appendix A realize the **wire face** per `Doc-5A §5/§6/§7/§9/§10/§17` and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, state edges, and the (empty) M6 event set are bound **by pointer, never restated**. The §3 cross-cutting model (User/Admin · `check_permission` sole authority · disclosure-scope + actor-side rules · delivery-only firewall · realtime = channel · non-disclosure · state-map index) governs every endpoint here; **every read declares its disclosure scope and every command its actor side** (§3.3). Transport-level choices are **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9/§10/§17`; `Doc-4H §H6/§H7`; `Doc-4M`; `Doc-2 §3.7/§10.7`; §3 (Pass-1).

---

## §6 — Delivery Tracking Surface Realization (BC-COMM-3)

### 6.1 Endpoint Realization (§5.2/§5.3; inventory §2.4)
- `get_delivery_status` → `GET /communication/delivery_records/{id}` → `200`.
- **Actor:** User (own-record, `Iv-Active-Organization` server-validated) / Admin (`staff_can_support`, no org context — `Doc-5A §7.3`).
- Inputs per §5.4: `{id}` = `UUIDv7` in path; no body; **no prohibited input** — actor/org-selection/authz/state/attribution are **never** a wire field (`Doc-4A §9.7`).
- The 3 write-path contracts (`create_delivery_record`, `update_delivery_status`, `retry_delivery`) have **no caller wire** — §8.
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4H §H6`.

### 6.2 Delivery Aggregate Ownership (`[REC-COMM-OWNERSHIP]` — reconfirmed verbatim)
The **`Outbound Log` aggregate** (`email_logs` / `sms_logs` / `whatsapp_logs`, VO `DeliveryStatus`) is **M6-owned** — confirmed against `Doc-4H` BC-COMM-3 ("Owned Aggregate: Outbound Log") + `Doc-2 §10.7`. **Provider callbacks (R8) mutate only M6-owned state** — the provider → webhook → M6 path writes M6's own Outbound Log; the `Outbound Log` is **never** a Platform-Core-owned read-model that M6 mirrors (ownership stays in M6, not M0/infra). `comm.update_delivery_status` is the out-of-wire contract for this ingress (§8/R8); the M6-owned aggregate is the structure it writes.

**`[REC-COMM-OWNERSHIP]` is SATISFIED** — the `Outbound Log` aggregate's M6 ownership is explicit here per the FROZEN structure's "reconfirm verbatim at content" obligation. (§9.2 entry confirms.) **Binds:** `Doc-4H` BC-COMM-3; `Doc-2 §10.7`; R8.

### 6.3 Disclosure Class per Read (§3.3 binding rule)
- `get_delivery_status` → **Own-or-Support** scope: the requesting User reads **only** a delivery record belonging to their own active org; Admin (`staff_can_support`) reads any record.
- A cross-tenant / out-of-scope read **collapses to a uniform `NOT_FOUND`** — no timing side-channel (`Doc-5A §6.3/§7`; `Doc-4A §7.5`; §3.6/R10).
- **Binds:** §3.3/§3.6; `Doc-4H §H6`; R10.

### 6.4 Firewall, Audit & Error (§6.2/§17.1)
- **Delivery outcome is observability only — it is never a score/eligibility/business signal** (R6/DH-5); the result of `get_delivery_status` is never consumed as a governance input, trigger, or matching signal.
- Delivery logs are **append-only** (R12/Invariant #8); **never caller-writable** — written exclusively by §8 System contracts (`create_delivery_record`, `update_delivery_status`, `retry_delivery`). No caller write path exists for delivery records.
- Read: **not audited** (`Doc-5A §17.1`).
- Error classes per `Doc-5A §6.2` (by pointer); codes `Doc-4H §H6` register (`comm_` namespace, `Doc-4A Appendix B.2`): `AUTHORIZATION` → `403` (else `404` collapse §3.6/R10), `NOT_FOUND` → `404`.
- **No `Doc-2 §8` event emitted** (R11).
- **Binds:** `Doc-5A §6.2/§17.1`; `Doc-4H §H6`; R6/R8/R12.

---

## §7 — Support Communications Surface Realization (BC-COMM-4)

### 7.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
Methods, paths **[rc]**, and success statuses:

| Contract | Method · Path **[rc]** | Actor | Active-org | Success |
|---|---|---|---|---|
| `comm.create_ticket.v1` | `POST /communication/tickets` | User | Y | `201` |
| `comm.update_ticket.v1` | `POST /communication/tickets/{id}/update_ticket` | User / Admin | Y / **N** | `200` |
| `comm.add_ticket_message.v1` | `POST /communication/tickets/{id}/messages` | User / Admin | Y / **N** | `201` |
| `comm.close_ticket.v1` | `POST /communication/tickets/{id}/close_ticket` | User / Admin | Y / **N** | `200` |
| `comm.get_ticket.v1` | `GET /communication/tickets/{id}` | User / Admin | Y / **N** | `200` |
| `comm.list_tickets.v1` | `GET /communication/tickets` | User / Admin | Y / **N** | `200` |

- Inputs per §5.4: `{id}` = `UUIDv7` in path; Request-Contract fields in body; **no prohibited input** (`Doc-4A §9.7`). `create_ticket` body carries `subject` + opener message in-transaction; `add_ticket_message` body carries the message payload. `update_ticket` body carries permitted meta-fields and/or the target state (legal transitions only — §7.2).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4H §H7`.

### 7.2 Ticket State Machine (Doc-4M index; Doc-2 §3.7 / Doc-4H §H13 edges)
- Ticket machine: **`open → in_progress → resolved → closed`** (terminal). `create_ticket` creates in `open`. `update_ticket` drives `open → in_progress` and `in_progress → resolved` (Staff-gated state transitions; User may update metadata fields per Doc-4H §H7 without advancing state). `close_ticket` drives `resolved → closed`.
- **No transition invented** (`Doc-4M` = cross-module state-map index; edges sourced from `Doc-2 §3.7` / `Doc-4H §H13`; `Doc-4A §13`). Illegal transition → **`STATE` → `409`**; concurrent write collision → **`CONFLICT` → `409`** (`Doc-5A §9.5`).
- **`close_ticket` closes the ticket (`resolved → closed`) and does not delete message history** (R12).
- **Binds:** `Doc-4M`; `Doc-4A §13`; `Doc-4H §H7/§H13`; `Doc-2 §3.7`.

### 7.3 Per-Command Actor-Side Rule (§3.3 binding rule)
BC-COMM-4 is **two-sided: User (opener, `can_raise_support_ticket`) + Admin (staff, `staff_can_support`)**. Per-command declaration (binding — §3.3):

| Contract | Actor side |
|---|---|
| `create_ticket` | **User** (`can_raise_support_ticket` opener; creates the ticket + initial message in-transaction) |
| `update_ticket` | **Either** (User may update non-state metadata on own ticket; Admin/Staff advances state and updates meta) |
| `add_ticket_message` | **Either** (User continues thread on own ticket; Admin/Staff responds) |
| `close_ticket` | **Either** (User closes from `resolved` accepting resolution; Admin/Staff closes) |
| `get_ticket` | **Either** (User reads own org's ticket; Admin `staff_can_support` reads any) |
| `list_tickets` | **Either** (User lists own org's tickets; Admin `staff_can_support` lists any) |

- User: `Iv-Active-Organization` server-validated (§3.1); Admin: no org context (`Doc-5A §7.3`).
- **The support-ticket aggregate stays M6-owned** — Admin acts via `staff_can_support` as an authorized governance actor; **ownership never transfers to Admin (M8)** (FROZEN structure §7).
- Ticket messages **inherit ticket scope** — no independent participant scope (§3).
- **Binds:** §3.3; `Doc-4H §H7`; `Doc-5A §7.2/§7.3`; `Doc-2 §7`.

### 7.4 Disclosure Class per Read (§3.3 binding rule)
- `get_ticket` / `list_tickets` → **Own-or-Support** scope: User reads only own org's ticket(s); Admin (`staff_can_support`) reads any ticket.
- **Ticket messages inherit ticket scope** (§3; no independent participant lookup for messages on a ticket).
- A cross-org / non-authorized read **collapses to a uniform `NOT_FOUND`** (§3.6/R10).
- **Binds:** §3.3/§3.6; `Doc-4H §H7`; `Doc-5A §6.3/§7`.

### 7.5 Append-Only Messages (R12)
- `add_ticket_message` is **append-only** — messages never overwritten or hard-deleted (R12/Invariant #8; `Doc-2 §3.7`).
- **`close_ticket` closes the ticket but does not delete message history** (R12).
- No caller-facing delete surface for ticket messages or tickets exists (soft-close is terminal; ticket aggregate retained for audit).
- **Binds:** R12; Invariant #8; `Doc-2 §3.7`.

### 7.6 Idempotency, Concurrency, Error & Audit
- All mutations declare `Idempotency: required` → **`Idempotency-Key` mandatory** (`Doc-5A §9`); dedup window **`[ESC-COMM-POLICY]`** (no `communication` POLICY namespace key registered; referenced by platform-default key name only; channel `Doc-3 §12.2` additive).
- State transitions (`update_ticket`, `close_ticket`) assert the **expected source state**; stale/illegal state → `STATE` → `409`; concurrent write collision → `CONFLICT` → `409` (`Doc-5A §9.5`). Idempotent replay within the dedup window returns the cached original (no duplicate audit).
- Error classes per `Doc-5A §6.2` (by pointer); codes `Doc-4H §H7` register (`comm_` namespace, `Doc-4A Appendix B.2`): `VALIDATION` → `400`, `AUTHORIZATION` → `403` (else `404` collapse §3.6/R10), `NOT_FOUND` → `404`, `STATE` → `409`, `CONFLICT` → `409`, `REFERENCE` → `422`, `BUSINESS` → `422`.
- Mutations **audited** via `core.append_audit_record.v1`; support-ticket audit actions carry **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication audit domain; bound to nearest §9 action by pointer; **never invented**).
- Reads not audited (`Doc-5A §17.1`).
- **No `Doc-2 §8` event emitted** (R11).
- Authorization server-side via `check_permission` (§3.2): User `can_raise_support_ticket`; Admin `staff_can_support`; no shadow path.
- **Binds:** `Doc-5A §6/§9/§17.1`; `Doc-4H §H7`; `Doc-2 §7/§9`; `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`.

---

## §8 — Out-of-Wire Boundary (notification fan-out · delivery dispatch / provider-webhook / retry · internal legs)

The following **4 System contracts have no HTTP wire in any protocol**:

| Contract | Nature | §8 declaration |
|---|---|---|
| `comm.create_notification.v1` | System event-consumer fan-out from other modules' Doc-2 §8 events; idempotent on `source_event_id` (R5/R1) | **No wire** — background event consumer; never caller-initiated |
| `comm.create_delivery_record.v1` | System dispatch job → M6-owned Outbound Log channel entry (R8) | **No wire** — background dispatch job |
| `comm.update_delivery_status.v1` | **Provider-webhook callback — email/SMS/WhatsApp infra signal; explicitly NOT a Doc-2 §8 domain event** (R8); forward-only `queued → sent → delivered \| failed` | **No wire** — infrastructure callback; not an M6-emitted webhook (R11) |
| `comm.retry_delivery.v1` | System retry job (`failed → queued`) | **No wire** — background retry job |

**Protocol fence:** the above 4 contracts have **no caller wire in any protocol — no REST endpoint, no SSE stream, no WebSocket, no Webhook, no GraphQL. Flag-and-halt if any wire surface in any protocol is proposed** for them (an architecture change requiring a frozen-doc amendment — `Gov-Note §7`).

**Non-contract mechanisms also out-of-wire (not counted contracts):**
- **Realtime push (Supabase Realtime, DH-8):** a **delivery channel** (`Doc-5A §10` / `Doc-4A §15.7`), **not** a contract or API surface (R9); §4 caller commands own state transitions; `comm.get_messages` is the source of truth; no realtime wire surface here.
- **Dual-audience read internal-service leg:** in-process mechanism; zero wire; counted as zero contracts per MA-COMM-01 (§1.2/Pass-1).

Implementation of all 4 out-of-wire contracts is code / Doc-6.
**Binds:** `Doc-4H §H5/§H6`; `Doc-5A §1.3/§5/§11`; R1/R5/R8/R9/R11.

---

## §9 — Conformance & Carried Items

### 9.1 Conformance Statement
Doc-5H realized across **Pass-1** (§0–§3 + inventory), **Pass-2** (§4–§5), and **Pass-3** (§6–§9 + Appendix A), conforming to `Doc-5H_Structure_v1.0_FROZEN.md` and `Doc-5A_SERIES_FROZEN_v1.0` throughout. **Doc-5H coins nothing** — no endpoint, status, header, error class, permission slug, POLICY key, or event. Per-band attestation in Appendix A; overall status: 0 open BLOCKER/MAJOR/MINOR across all three passes.

### 9.2 Carried Items Register

| ID | Item | Doc-5H handling | Freeze gate? |
|---|---|---|---|
| **DH-1** | Identity — `check_permission` / org / active-org / `staff_can_support` / notification rules read, consumed | Auth resolved server-side via Identity (`Doc-4C §C3/§C8`); `check_permission` sole authority (§3.2/Pass-1); no shadow authz; no Identity surface realized | **No** |
| **DH-2** | Marketplace — consume §8 events for fan-out; vendor refs by UUID | Events consumed by §8 fan-out consumer (`create_notification`); no Marketplace surface realized | **No** |
| **DH-3** | RFQ — consume §8 events; **read scrub-rule by service, apply content-side**; host `rfq_clarification` thread | `send_message` reads+applies rule at write-time (R7/§4.3/Pass-2); rule stays RFQ-owned (`Doc-4E`); no cache/copy/extend/override; no procurement decision | **No** |
| **DH-4** | Operations — consume §8 events for party fan-out | §8 consumer; no Operations surface realized | **No** |
| **DH-5** | Trust firewall — consume §8 events; compute/own no score | §8 consumer; delivery outcome never a score/eligibility signal (R6/§6.4); notification read-state firewalled from trust (§5.4/Pass-2); no Trust surface realized | **No** |
| **DH-6** | Billing — consume §8 events; no paid-plan delivery gating touching trust/eligibility | §8 consumer; firewall as §3 wire constraint (R6/Pass-1); no Billing surface realized | **No** |
| **DH-7** | Admin — consume §8 events; moderation/ban is Admin's | §8 consumer; ticket aggregate stays M6-owned, Admin acts via `staff_can_support` not as owner (R2/§7.3); no Admin surface realized | **No** |
| **DH-8** | Platform Core — audit-write / outbox / UUIDv7 / POLICY / flags / **Realtime backing**, consumed | Consumed via Doc-4B mechanisms by pointer; Realtime = delivery channel (R9/§3.5/Pass-1); never re-implemented | **No** |
| `[ESC-COMM-AUDIT]` | Doc-2 §9 no Communication audit domain — every mutation carries it | Bound to nearest Doc-2 §9 action by pointer; **interim, not finalized**; channel: Doc-2 §9 additive | **No** |
| `[ESC-COMM-POLICY]` | No `communication` POLICY namespace key (dedup / retry / backoff / rate / page) | Platform-default key names by pointer (no key restated inline); channel: Doc-3 §12.2 additive; **`[ESC-COMM-POLICY]`-keyed contracts not finalized until registered** | **Tracked** — per-contract finalization; not a structural gate |
| `[ESC-COMM-SLUG]` | No distinct notification-recipient-read slug in Doc-2 §7 | Interim recipient / `staff_can_support` scope by pointer; channel: Doc-2 §7 additive; no slug invented | **No** |
| `[ESC-COMM-EVENT]` | M6 emits no Doc-2 §8 event today | §11 N/A (R11/§8); if ever required, additive Doc-2 §8 patch; **never coin an event in Doc-5H** | **No** |
| **`[REC-COMM-OWNERSHIP]`** | Delivery-aggregate ownership must be explicit (BLOCKER BC-COMM-01 at structure review) | **SATISFIED** — confirmed verbatim at §6.2: `Outbound Log` aggregate M6-owned per `Doc-4H` BC-COMM-3 ("Owned Aggregate: Outbound Log") + `Doc-2 §10.7`; provider callbacks mutate only M6 state (R8). Reconfirmed at content per FROZEN structure "reconfirm verbatim at content" requirement | **Satisfied** |

---

## Appendix A — Doc-5H Conformance Attestation

Per-band pass/fail against `Doc-5A Appendix A` (`CHK-5A-xxx`) for the realized M6 surface (Pass-1 §0–§3 + inventory; Pass-2 §4–§5; Pass-3 §6–§9). Evidence by pointer to the realized section; no rules restated.

### A.1 — Out-of-Wire Boundary (`Doc-5A §1.3/§5/§11`)

| Band | Status | Evidence |
|---|---|---|
| Out-of-wire contracts declared, no wire in any protocol | **PASS** | §8: 4 contracts; protocol fence (5 protocols stated); flag-and-halt noted |
| Internal-service-only contracts = 0; dual-audience leg = mechanism (CHK-5A-046) | **PASS** | §1.2/Pass-1 MA-COMM-01: count exactly 19 caller + 4 out = 23; 0 internal-service-only |
| Realtime declared delivery channel, not a contract/endpoint | **PASS** | §3.5/Pass-1; §4.4/Pass-2; §8 (R9) |

### A.2 — Actor & Authorization (`Doc-5A §7`)

| Band | Status | Evidence |
|---|---|---|
| Actor model declared; **no public/anonymous** | **PASS** | §3.1/Pass-1: User + Admin only; System out-of-wire; explicit declaration |
| `Iv-Active-Organization` server-validated for User | **PASS** | §3.1/Pass-1: server-validated, never client-trusted (`Doc-4A §5.3`) |
| `check_permission` sole authorization authority; no shadow path | **PASS** | §3.2/Pass-1: sole authority declared; no parallel authz path |
| Existing Doc-2 §7 slugs bound; none invented | **PASS** | §3.2/Pass-1: `can_use_messaging`, `can_raise_support_ticket`, `staff_can_support` bound; `[ESC-COMM-SLUG]` carried for notification-read slug |

### A.3 — Method Mapping & Path Grammar (`Doc-5A §5.2/§5.3`)

| Band | Status | Evidence |
|---|---|---|
| Query → `GET`/`200` | **PASS** | 7 read endpoints: §2.2–§2.5/Pass-1; §4.1/Pass-2; §6.1; §7.1 |
| Create command → `POST` collection / `201` + `Location` **[rc]** | **PASS** | `create_thread`, `create_ticket` → 201; `send_message`, `add_thread_participant`, `add_ticket_message` → 201 (append child) |
| State/domain command → `POST /{id}/{command-name}` / `200` | **PASS** | `close_thread`, `update_ticket`, `close_ticket`, `mark_notification_read`, `archive_notification` → POST named cmd/200 |
| Soft removal → `DELETE` / `200` (audit retained) | **PASS** | `remove_thread_participant` → DELETE/200/R12 |
| Path prefix `communication` (never `comm.`) | **PASS** | All paths `/communication/…`; **[realization convention]** marked; R3 |
| Path grammar `/{module}/{resource}[/{id}][/{cmd}]` | **PASS** | All paths conform; `{id}` = UUIDv7; command sub-resources named |

### A.4 — Request Structure (`Doc-5A §5.4`)

| Band | Status | Evidence |
|---|---|---|
| No prohibited inputs (actor/org/state/attribution never wire fields) | **PASS** | §4.1/Pass-2; §5.1/Pass-2; §6.1; §7.1: `Doc-4A §9.7` compliance declared |
| `{id}` = UUIDv7 in path | **PASS** | All path IDs UUIDv7 per Doc-4B `core.allocate_id.v1` |

### A.5 — Success Status & Response Envelope (`Doc-5A §5.5/§6`)

| Band | Status | Evidence |
|---|---|---|
| Status family `200`/`201`+Location/`204` per spec; none invented | **PASS** | All endpoints: creates 201+Location, state cmds/reads 200 |
| Top-level `reference_id` C-05 (`Doc-4A §22.1` / CHK-5A-042) | **PASS** | Declared at §4.7/Pass-2 as cross-cutting for all body-bearing responses in §4–§7; `204` body-exempt per `Doc-4A_Patch_C-05-204_v1.0` |

### A.6 — Error Mapping (`Doc-5A §6.2`)

| Band | Status | Evidence |
|---|---|---|
| Error class → HTTP status per §6.2 | **PASS** | §4.6/Pass-2; §5.5/Pass-2; §6.4; §7.6: VALIDATION→400, AUTH→403/404, NOT_FOUND→404, STATE→409, CONFLICT→409, REFERENCE→422, BUSINESS→422 |
| Non-disclosure `NOT_FOUND` collapse; no timing side-channel | **PASS** | §3.6/Pass-1; §4.5/Pass-2; §5.3/Pass-2; §6.3; §7.4: all reads scope-gated; non-scope → NOT_FOUND (R10) |

### A.7 — Idempotency & Concurrency (`Doc-5A §9`)

| Band | Status | Evidence |
|---|---|---|
| `Idempotency-Key` mandatory on all mutations | **PASS** | §4.6/Pass-2; §5.5/Pass-2; §7.6: all mutations declare Idempotency-Key; dedup `[ESC-COMM-POLICY]` |
| State transitions assert expected source state; stale → STATE/CONFLICT → 409 | **PASS** | §4.2/Pass-2; §5.2/Pass-2; §7.2/§7.6: `close_thread`, `update_ticket`, `close_ticket`, notification cmds all assert source state |
| All concurrency-bearing contracts listed (CHK-5A-122) | **PASS** | State-machine contracts with expected-state assertion: `close_thread`, `mark_notification_read`, `archive_notification`, `update_ticket`, `close_ticket` — all declared |

### A.8 — Pagination (`Doc-5A §8`)

| Band | Status | Evidence |
|---|---|---|
| List endpoints paginated; filters as query params; page-size `[ESC-COMM-POLICY]` | **PASS** | `list_threads`, `list_notifications`, `list_tickets` paginate per §8; status/type filters as query params |

### A.9 — Outbox / Events (`Doc-5A §11`)

| Band | Status | Evidence |
|---|---|---|
| M6 emits no Doc-2 §8 event; §11 N/A | **PASS** | R11; §3.4/Pass-1; §4.6/Pass-2; §5.5/Pass-2; §6.4; §7.6; §8: `[ESC-COMM-EVENT]` none today |
| No caller webhook/push surface | **PASS** | §8: provider webhook = inbound infra (R8/R11); no M6-emitted webhook; no caller push surface |

### A.10 — Audit (`Doc-5A §17`)

| Band | Status | Evidence |
|---|---|---|
| Mutations audited via `core.append_audit_record.v1`; `[ESC-COMM-AUDIT]` carried | **PASS** | §4.6/Pass-2; §5.5/Pass-2; §7.6: all mutations audited by pointer; `[ESC-COMM-AUDIT]` for un-enumerated Communication domain |
| Reads not audited (`§17.1`) | **PASS** | §4.6/Pass-2; §5.5/Pass-2; §6.4; §7.6: reads declared not audited |

### A.11 — POLICY Keys (`Doc-5A §12` / `Doc-3 §12.2`)

| Band | Status | Evidence |
|---|---|---|
| POLICY keys by pointer only; none restated inline | **TRACKED** | `[ESC-COMM-POLICY]`: no `communication` namespace key registered; platform-default names by pointer; channel `Doc-3 §12.2` additive. Finalization required before content freeze |

### A.12 — Anti-Invention (CHK-5A-121 / CHK-5A-154)

| Band | Status | Evidence |
|---|---|---|
| No endpoint coined (CHK-5A-121) | **PASS** | All 19 caller-facing endpoints realize existing Doc-4H PassB tokens verbatim |
| No status / header / error-class coined | **PASS** | Statuses per `Doc-5A §5.5`; error codes per `comm_` namespace (`Doc-4A App B.2`) |
| No slug / POLICY-key / event coined | **PASS** | Slugs bind Doc-2 §7; POLICY keys by pointer; no event coined (R11/R4) |
| Route namespace `communication` matches App B.1 verbatim (CHK-5A-154) | **PASS** | R3: route = `communication` (`Doc-5A App B.1` line 41); token = `comm.` (`Doc-4H`); `comms` = non-authoritative shorthand only |

---

### A.M6-1 — Delivery-Only / Single-Authorship Band (R5)

| Assertion | Status | Evidence |
|---|---|---|
| M6 emits no Doc-2 §8 event | **PASS** | R11; §3.4/Pass-1; `[ESC-COMM-EVENT]` none today; §9.2 |
| `create_notification` is System event-consumer; never caller-initiated | **PASS** | §8; R1/R5: out-of-wire; flag-and-halt if wire proposed |
| M6 authors no notification-production contract for another module | **PASS** | R5; §1.3/Pass-1 dependency boundary |
| Consumed event payload = observational input only; never API-contract authority | **PASS** | R5; §3.4/Pass-1: rendered as notification text; no owned read-model field derived from payload |

### A.M6-2 — Delivery-Aggregate-Ownership Band (R8 / `[REC-COMM-OWNERSHIP]`)

| Assertion | Status | Evidence |
|---|---|---|
| `Outbound Log` aggregate is M6-owned | **PASS** | §6.2: confirmed against `Doc-4H` BC-COMM-3 ("Owned Aggregate: Outbound Log") + `Doc-2 §10.7` |
| Provider callbacks mutate only M6-owned state; not a Core read-model M6 mirrors | **PASS** | §6.2/R8: provider → webhook → M6 writes M6's own Outbound Log; ownership stays in M6 not M0/infra |
| `update_delivery_status` = inbound infra; NOT a Doc-2 §8 domain event | **PASS** | §8/R8: explicitly declared NOT a domain event; forward-only; out-of-wire |
| `[REC-COMM-OWNERSHIP]` satisfied and reconfirmed at content | **PASS** | §6.2 (verbatim reconfirm) + §9.2 (register entry) — per FROZEN structure obligation |

### A.M6-3 — Non-Disclosure Band (R10)

| Assertion | Status | Evidence |
|---|---|---|
| All 7 reads declare disclosure scope per §3.3 binding rule | **PASS** | §4.5/Pass-2 Participant (threads/messages); §5.3/Pass-2 Recipient (notifications); §6.3 Own-or-Support (delivery); §7.4 Own-or-Support (tickets) |
| Non-scope read → uniform `NOT_FOUND`; no timing side-channel | **PASS** | §3.6/Pass-1; §4.5/Pass-2; §5.3/Pass-2; §6.3; §7.4 (R10; `Doc-5A §6.3/§7`; `Doc-4A §7.5`) |
| No cross-tenant leakage | **PASS** | NOT_FOUND collapse on all out-of-scope reads; no existence signal |
| Notification read/archive state never influences prioritization/matching/trust | **PASS** | §5.4/Pass-2: read-state firewall (R6/DH-5) |

### A.M6-4 — Append-Only Band (R12)

| Assertion | Status | Evidence |
|---|---|---|
| Thread messages never overwritten or hard-deleted | **PASS** | §4.2/Pass-2; R12/Invariant #8 |
| `close_thread` retains message history | **PASS** | §4.2/Pass-2: `open → closed` only; no history deletion (R12) |
| `archive_notification` retains notification | **PASS** | §5.2/Pass-2: `read → archived`; notification not deleted (R12) |
| Ticket messages append-only; `close_ticket` retains them | **PASS** | §7.5; R12: append-only declared; close retains |
| Delivery logs append-only; never caller-writable | **PASS** | §6.4; §8: exclusively §8 System write path; no caller write surface (R12) |

---

*End of Doc-5H Content v1.0, Pass 3 (§6–§9 + Appendix A). Delivery tracking (`get_delivery_status` Own-or-Support; M6-owned `Outbound Log` aggregate ownership confirmed at §6.2 — `[REC-COMM-OWNERSHIP]` SATISFIED); support communications (BC-COMM-4: 6 endpoints, two-sided User(opener)/Admin(staff), ticket `open → in_progress → resolved → closed` per Doc-2 §3.7/Doc-4H §H13 no edge invented, per-command actor-side declared per §3.3, append-only messages, M6-owned aggregate); out-of-wire boundary (4 contracts declared, 5-protocol fence, flag-and-halt); conformance + carried items (DH-1…DH-8 PASS, ESC items registered, `[ESC-COMM-POLICY]` TRACKED, `[REC-COMM-OWNERSHIP]` SATISFIED); Appendix A (12 standard bands PASS, `[ESC-COMM-POLICY]` TRACKED, 4 M6-unique bands all PASS); 0 open BLOCKER/MAJOR/MINOR; nothing coined; all references by pointer. Doc-5H (Pass-1 + Pass-2 + Pass-3) structurally complete against `Doc-5H_Structure_v1.0_FROZEN.md`. Next: Freeze Readiness Audit.*
