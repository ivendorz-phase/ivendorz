# Doc-5H — Communication (M6 `communication`) API Realization — Content v1.0, Pass 3 (§6–§9 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5H — Communication (Module 6) — API Realization |
| Pass | 3 of 3 — §6 Delivery Tracking (BC-COMM-3, 1 caller-facing) · §7 Support Communications (BC-COMM-4, 6) · §8 Out-of-Wire Boundary (4) · §9 Conformance & Carried Items · Appendix A |
| Status | ACTIVE — Content Pass 3 of 3; 0 open BLOCKER/MAJOR/MINOR. Conforms to `Doc-5H_Structure_v1.0_FROZEN.md`; builds on Pass-1 (§0–§3 + inventory) and Pass-2 (§4–§5; 4 MINOR + 1 NITPICK resolved) |
| Realizes | the §6–§7 caller-facing surfaces on HTTP; §8 out-of-wire boundary declaration; §9 + Appendix A conformance attestation |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Contains | The §5.7 realization (grouped form) of §6–§7 caller-facing surfaces; §8 5-protocol fence for 4 out-of-wire contracts; §9 carried-items register + CHK-5A attestation summary; Appendix A conformance bands. No contract bodies, representations, error codes, POLICY keys, slugs, audit actions, or events restated; all by pointer |

> **Realize, never re-decide.** Doc-4H fixed the contracts; Doc-2 §3.7/§10.7 + Doc-4M own the state machines; Doc-5A fixed the wire mechanics. §6–§7 realize the **wire face** per `Doc-5A §5/§6/§7/§9` and re-decide nothing. The §3 cross-cutting model (User/Admin · `check_permission` sole authority · disclosure-scope + actor-side rules · delivery-only firewall · non-disclosure) governs every endpoint here; **every read declares its disclosure scope** (§3.3). The `[REC-COMM-OWNERSHIP]` gate is **reconfirmed verbatim** at §6.4 as required by the structure freeze mandate.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9`; `Doc-4H §H6/§H7/§H13`; `Doc-4M`; `Doc-2 §3.7/§10.7`; §3 (Pass-1).

---

## §6 — Delivery Tracking Surface Realization (BC-COMM-3)

### 6.1 Endpoint Realization (§5.2/§5.3; inventory §2.4)
- Methods: `get_delivery_status` → `GET /communication/delivery-records/{delivery_record_id}` (get-by-ID, `200`) and `GET /communication/delivery-records` (list with allowlisted filters, `200`) — single contract covering both modes. The three write-path contracts (`create_delivery_record`, `update_delivery_status`, `retry_delivery`) are **out-of-wire** (§8); noted here for BC-COMM-3 completeness only.
- Inputs per §5.4: `{delivery_record_id}` = `UUIDv7` in path (get mode); `source_event_id` and `channel` as allowlisted query params (list mode, `Doc-4A §9.6`); `page_size` within `[ESC-COMM-POLICY]` bound; keyset `cursor` (`Doc-5A §8`). No prohibited input (`Doc-4A §9.7`).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5/§8`; `Doc-4H §H6`.

### 6.2 Delivery State Machine (Doc-4M index; Doc-2 §10.7 edges)
- The **Outbound Log** delivery lifecycle is **forward-only** `queued → sent → delivered | failed` with frozen retry `failed → queued` (re-dispatch — no new state). `delivered` and `failed` are terminal per attempt; retry is a separate out-of-wire contract (§8). Backward/illegal advance → `STATE` → `409`. **No state invented** (`Doc-4M` = cross-module state-map index; edges `Doc-2 §10.7`; `Doc-4A §13`). **Append-only — delivery logs are never overwritten or hard-deleted** (R12).
- `get_delivery_status` is a read; it does not transition state. Write-path state transitions (`queued → sent → delivered | failed`; `failed → queued`) are System effects realized in §8.
- **Binds:** `Doc-4M`; `Doc-4A §13`; `Doc-4H §H6`; `Doc-2 §10.7`.

### 6.3 Disclosure Class per Read (§3.3 binding rule)
- `get_delivery_status` → **Own-or-Support** scope: a **User** reads **own delivery records only** (records whose recipient resolves to the active org/user); an **Admin** (`staff_can_support`) reads delivery records in staff scope. A non-recipient / unauthorized read **collapses to `NOT_FOUND`** (§3.6/R10; `Doc-5A §6.3/§7`; `Doc-4A §7.5/§12.4`) — existence never confirmed via `AUTHORIZATION`. Timing-uniformity: not-authorized / not-exist responses identical.
- Delivery-read slug carries `[ESC-COMM-SLUG]` (no distinct Doc-2 §7 recipient delivery-read slug; interim own-record / `staff_can_support` scope by pointer; **never invented**).
- **Binds:** §3.3/§3.6; `Doc-4H §H6`; `[ESC-COMM-SLUG]`.

### 6.4 Delivery-Aggregate Ownership Reconfirmation (`[REC-COMM-OWNERSHIP]` — gate satisfied)
> **Verbatim reconfirmation (structure freeze mandate):** The **`Outbound Log` aggregate** (channel structures `email_logs` / `sms_logs` / `whatsapp_logs`; VO `DeliveryStatus`) is **M6-owned** — `Doc-2 §10.7`; `Doc-4H` BC-COMM-3 ("Owned Aggregate: Outbound Log"; Part-3 §HB-3.5). **A provider callback mutates only M6-owned Outbound Log state** — the provider → webhook → M6 path writes M6's own channel-log rows only; these rows are never a Platform-Core-owned read-model that M6 mirrors; ownership stays in M6, not M0/infra (R8). `comm.update_delivery_status` is driven by an inbound provider callback — an **email/SMS/WhatsApp infra signal, explicitly NOT a Doc-2 §8 domain event** (H.7 / R8). **`[REC-COMM-OWNERSHIP]` gate: SATISFIED in-doc.** Reconfirmed verbatim at this content pass as required by the structure freeze mandate.
- **Binds:** R8; `Doc-4H §H6`; BC-COMM-3 Part-3 §HB-3.5 (M6-owned); `Doc-2 §10.7`.

### 6.5 Idempotency, Error & Audit
- `get_delivery_status` is a pure query: `Idempotency: not-applicable` (`Doc-5A §9` / `Doc-4A §14.1`); side-effect-free; pagination per `Doc-5A §8` / `Doc-4A §22.3`.
- Error classes per `Doc-5A §6.2` (by pointer; codes `Doc-4H §H6`, `comm_` namespace): `VALIDATION` → `400`, `AUTHORIZATION` → `403` (else `NOT_FOUND` collapse per §3.6/R10), `NOT_FOUND` → `404`. No `STATE`/`CONFLICT`/`REFERENCE`/`BUSINESS` on this read surface.
- **Reads not audited** (`Doc-5A §17.1`). **Delivery logs are never caller-writable** (R12) — only System write-path contracts (§8) write to `email_logs`/`sms_logs`/`whatsapp_logs`. A delivery outcome is observability only, never a score/eligibility signal (R6).
- **Binds:** `Doc-5A §6/§8/§9/§17.1`; `Doc-4H §H6`; `[ESC-COMM-SLUG]`, `[ESC-COMM-POLICY]`.

---

## §7 — Support Communications Surface Realization (BC-COMM-4)

### 7.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
- Methods:
  - `create_ticket` → `POST /communication/tickets` (`201` + `Location` → `/communication/tickets/{ticket_id}`)
  - `update_ticket` → `POST /communication/tickets/{id}/update_ticket` (`200` — named state command)
  - `add_ticket_message` → `POST /communication/tickets/{id}/ticket-messages` (`201` — no `Location` header; ticket message has no standalone GET URL **[rc]**; observable via `get_ticket`)
  - `close_ticket` → `POST /communication/tickets/{id}/close_ticket` (`200` — named terminal command)
  - `get_ticket` → `GET /communication/tickets/{id}` (`200`)
  - `list_tickets` → `GET /communication/tickets` (`200`)
- Inputs per §5.4: `{id}` = `UUIDv7` in path; request-contract fields in body; no prohibited input (`Doc-4A §9.7`). `list_tickets` filter `status` ∈ enum is an allowlisted query param (`Doc-4A §9.6`). `update_ticket` body carries `target_status` (declared command parameter — not a prohibited lifecycle-state field; the prohibition is on *caller-asserting* state, not on the command's own declared transition parameter).
- **Two-sided actor declared (§3.3 per-command rule):** all commands and reads are **User / Admin (Either, with per-transition authority** — see §7.3).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5`; `Doc-4H §H7`.

### 7.2 Ticket State Machine (Doc-2 §3.7 / Doc-4H §H13)
- The **Support Ticket** machine is `open → in_progress → resolved → closed` (`closed` terminal). **No transition invented** (`Doc-4M` = cross-module state-map index; edges `Doc-2 §3.7` / aggregate `Doc-2 §10.7`; `Doc-4H §H13`; `Doc-4A §13`). Illegal sequence → `STATE` → `409`.
- `close_ticket` drives the dedicated `resolved → closed` terminal; only a `resolved` ticket is closable (`STATE` if not). `closed → closed` is an idempotent no-op.
- `add_ticket_message` is blocked if the ticket is `closed` (`STATE` → `409`).
- **`ticket_messages` is append-only — never overwritten or hard-deleted** (R12). `close_ticket` closes the ticket and does not delete message history (R12).
- **Binds:** `Doc-4M`; `Doc-4A §13`; `Doc-4H §H7/§H13`; `Doc-2 §3.7/§10.7`.

### 7.3 Two-Sided Actor Wire Model (§3 per-command actor-side rule)
BC-COMM-4 is the **only two-sided surface** in Doc-5H — **User** (`can_raise_support_ticket`, own-org, `Iv-Active-Organization` server-validated) and **Admin** (`staff_can_support`, platform-staff, no active org context — `Doc-4A §5.6`). **Explicit actor→transition authority** (R2/H.5; `Doc-2 §3.7`):

| Command | User authority | Admin authority |
|---|---|---|
| `create_ticket` | `can_raise_support_ticket` (own org, enters `open`) | n/a |
| `update_ticket` | `can_raise_support_ticket` — **`resolved → closed` ONLY** (own ticket); requesting `open → in_progress` / `in_progress → resolved` → **`AUTHORIZATION`** (staff-only transition; actor-denied, not a sequence error) | `staff_can_support` — `open → in_progress`, `in_progress → resolved`, `resolved → closed` |
| `add_ticket_message` | `can_raise_support_ticket` (own-org ticket, not `closed`) | `staff_can_support` (staff scope, ticket not `closed`) |
| `close_ticket` | `can_raise_support_ticket` (own `resolved` ticket) | `staff_can_support` (`resolved` ticket in scope) |
| `get_ticket` / `list_tickets` | `can_raise_support_ticket` (own-org scope) | `staff_can_support` (staff scope) |

**The Support Ticket aggregate stays M6-owned** — Admin acts via `staff_can_support` as an authorized actor; ownership never transfers to M8 Admin (m-COMM-03). Ticket messages inherit ticket scope (§3/N-05); no independent scope on `ticket_messages`. **`check_permission` sole authority; no shadow path** (§3.2).
- **Binds:** §3.2/§3.3; `Doc-4H §H7`; `Doc-2 §3.7/§7`; `Doc-4C §C3`.

### 7.4 Disclosure Class per Read (§3.3 binding rule)
- `get_ticket` / `list_tickets` → **Own-or-Support** scope (User own-org tickets; Admin `staff_can_support` staff scope). An out-of-scope get **collapses to `NOT_FOUND`** (§3.6/R10); list scopes its result set — out-of-scope tickets never enumerated. `ticket_messages` returned within `get_ticket` (inherit ticket scope; §3/N-05). **No private-RFQ read for Support Staff** (`Doc-4H §H7` H.5).
- **Binds:** §3.3/§3.6; `Doc-4H §H7`; `Doc-4A §7.5/§12.4`.

### 7.5 Idempotency, Concurrency, Error & Audit
- All BC-COMM-4 mutations (`create_ticket`, `update_ticket`, `add_ticket_message`, `close_ticket`) declare `Idempotency: required` → **`Idempotency-Key` mandatory** (`Doc-5A §9`); dedup window `[ESC-COMM-POLICY]` (no key invented); replay within window returns the cached original — same result, no duplicate audit, no duplicate row.
- State commands (`update_ticket`, `close_ticket`) enforce the expected transition from current ticket status; optional lost race → **`CONFLICT` → `409`** (distinct from `STATE`; no explicit `expected_status` or `updated_at` token in the BC-COMM-4 request schemas — OCC is contract-internal per `Doc-4H §H7`). `add_ticket_message` on a `closed` ticket → `STATE` → `409`. A User requesting a staff-only transition (`open → in_progress` / `in_progress → resolved`) → **`AUTHORIZATION`** (not `STATE`) — explicit in `Doc-4H §H7` H.5/§HB-4.2.
- Error classes per `Doc-5A §6.2` (by pointer; codes `Doc-4H §H7`, `comm_` namespace): `VALIDATION` → `400`, `AUTHORIZATION` → `403` (else `404` collapse, §3.6/R10), `NOT_FOUND` → `404`, `STATE` → `409`, `CONFLICT` → `409`, `REFERENCE` → `422`.
- Reads (`get_ticket`, `list_tickets`) not audited (`Doc-5A §17.1`). Mutations audited via Doc-4B `core.append_audit_record.v1`; ticket audit actions carry **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication audit domain; nearest §9 action by pointer; **never invented**). **BC-COMM-4 emits no `Doc-2 §8` event** (R11/H.7). Authorization server-side via `check_permission`; own-or-support scope (§3.2/§7.3/§7.4).
- **Binds:** `Doc-5A §6/§9/§17.1`; `Doc-4H §H7`; `Doc-2 §7/§9`; `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`.

---

## §8 — Out-of-Wire Boundary

The following **4 contracts have no HTTP wire in any protocol** (R1; `Doc-5A §1.3/§11`; `Doc-5B/5C/5F R1` precedent). They are in-process services, background workers, or event consumers driven by other modules' outbox events, internal fan-out, or provider callbacks. **Flag-and-halt if any caller wire in any protocol is proposed for them** — doing so is an architecture change.

**Protocol fence (binding): no REST endpoint · no SSE stream · no WebSocket · no Webhook emitted · no GraphQL.** No future protocol addition is permitted without a Doc-5A amendment and Architecture Board approval (Gov-Note §5). Implementation is code / Doc-6.

| Contract | BC | Actor | Nature | §8 rationale |
|---|---|---|---|---|
| `comm.create_notification.v1` | BC-COMM-2 | System | Event-consumer fan-out from other modules' Doc-2 §8 events → creates `notifications` rows; idempotent on `source_event_id` | R5: System event-consumer, never caller-initiated; emitting module authors the Doc-2 §8 event (single-authorship) |
| `comm.create_delivery_record.v1` | BC-COMM-3 | System | Dispatch job from BC-COMM-2 fan-out → creates `<channel>_logs` row at `queued`; idempotent on `(source_event_id, recipient_ref, channel)` | R1/R8: System dispatch job; no tenant caller wire |
| `comm.update_delivery_status.v1` | BC-COMM-3 | System | **Inbound provider-webhook callback (email/SMS/WhatsApp infra signal)** → advances Outbound Log `queued → sent → delivered | failed`; idempotent on `(delivery_record_id, provider_ref, target_status)` | R8: provider callback is infra, **NOT a Doc-2 §8 domain event**; webhook ingress is infrastructure, not an M6-emitted webhook (R11) |
| `comm.retry_delivery.v1` | BC-COMM-3 | System | Retry job → re-dispatches a `failed` record to `queued`; bounded by retry/backoff POLICY (`[ESC-COMM-POLICY]`); budget exhausted → `RATE_LIMITED` | R1/R8: System retry job; no tenant caller wire |

**Additional §8 notes:**
- **Realtime push (Supabase Realtime; DH-8 backing) is a delivery channel, not a contract** (R9) — not listed here because it has no Doc-4H contract; appears in §4.4 as a delivery channel for message observations only.
- **Provider-webhook ingress is infrastructure** — NOT an M6-emitted webhook (R11); `comm.update_delivery_status.v1` consumes it as a System effect on M6-owned Outbound Log state only.
- **`[REC-COMM-OWNERSHIP]`** reconfirmed at §6.4: provider callbacks mutate only M6-owned Outbound Log rows — never a cross-module write.
- **Binds:** `Doc-4H §H5/§H6`; PassA DH-1…8; `Doc-5A §1.3/§11`; R1/R5/R8/R11.

---

## §9 — Conformance & Carried Items

### 9.1 CHK-5A Attestation Summary

Doc-5H passes the Doc-5A Appendix A conformance gate (`Doc-5_Program_Governance_Note_v1.0 §6`). Full per-band attestation in **Appendix A**. Summary:

| CHK-5A group | Status | Notes |
|---|---|---|
| Wire encoding (010–015) | ✅ | JSON/UTF-8; snake_case; no bare money; UUIDv7 IDs; frozen enums only |
| Transport envelope (020–025) | ✅ | §4 envelope; registered headers; no forbidden header; `Iv-Active-Organization` on org-scoped ops; `Idempotency-Key` on mutations |
| Endpoint realization (030–036) | ✅ | Methods per §5.2; paths per §5.3 `communication` namespace; named state commands; input placement per §5.4; success statuses from §5.5 family |
| Error model (040–045) | ✅ | Error class → HTTP per §6; canonical envelope; `reference_id` on all body-bearing responses (C-05, §4.7); `comm_` namespace codes; `retryable` per class |
| Non-disclosure (050–053) | ✅ | Participant/Recipient/Own-or-Support reads scope-gated; `NOT_FOUND` collapse; timing-uniformity; no cross-tenant leak |
| Authorization (060–063) | ✅ | Bearer = authentication only; `Iv-Active-Organization` server-validated; no client-asserted authz; `check_permission` sole authority (§3.2) |
| Filter/pagination (070–073) | ✅ | Cursor-only pagination; `[ESC-COMM-POLICY]` page-size; allowlisted filter fields only (`Doc-4A §9.6`); soft-deleted rows excluded |
| Idempotency (080–083) | ✅ | `Idempotency-Key` on all mutations; dedup → same result, no duplicate audit; state-assertion OCC per contract |
| Async operations (090–095) | N/A | No M6 caller-facing async surfaces; out-of-wire System jobs are code-layer concerns |
| Event / outbox surface (100–103) | ✅ | M6 emits no Doc-2 §8 event (R11); no external push/webhook surface defined; provider-webhook is inbound infra (R8); event catalog not restated (§3/R4) |
| API versioning (110–114) | ✅ | `Iv-Api-Version` header only; no URL path versioning; contract identities stable |
| General (120–124) | ✅ | No restatement; nothing coined; transport choices marked **[rc]**; flag-and-halt on missing authority; no invented webhook |
| Provenance (131–134) | ✅ | All 19 caller-facing endpoints trace to frozen Doc-4H BC-COMM-1…4; every surface under `communication/` namespace; no undefined aggregate |
| Ownership (141–144) | ✅ | Resources under `communication/`; no foreign-aggregate mutation; cross-module via contracts only; no ownership contradiction with Doc-2/Doc-4H |
| Registry (151–154) | ✅ | Route `communication` in `Doc-5A App B.1`; `comm_` codes in `Doc-4A App B.2`; no self-assigned namespace token |

### 9.2 Carried Items Register

Carried items from Doc-4H PassA HA-8/HA-10 — resolved only via their named channels, never in Doc-5H. Status unchanged from structure registration.

| ID | Item | Doc-5H handling | Gate |
|---|---|---|---|
| **DH-1** | Identity — `check_permission` / org / `staff_can_support` / active-org context (consumed) | Resolved server-side via Identity (`Doc-4C §C3/§C8`); `check_permission` sole authority (§3.2); no Identity surface realized | No |
| **DH-2** | Marketplace — §8 events consumed for notification fan-out; vendor refs bare UUID | §8 consumer; no Marketplace surface realized | No |
| **DH-3** | RFQ — §8 events; scrub-rule by service, apply content-side; `rfq_clarification` thread | `send_message` reads+applies rule (R7/§4.3); rule stays RFQ-owned; no procurement decision | No |
| **DH-4** | Operations — §8 events consumed for party fan-out | §8 consumer; no Operations surface realized | No |
| **DH-5** | Trust firewall — §8 events; compute/own no score | §8 consumer; delivery outcome never a score/eligibility signal (R6/§6.5); no Trust surface | No |
| **DH-6** | Billing — §8 events; no paid-plan delivery gating touching trust/eligibility | §8 consumer; firewall as §3 wire constraint (R6); no Billing surface | No |
| **DH-7** | Admin — §8 events; moderation/ban is Admin's | §8 consumer; ticket aggregate stays M6-owned, Admin acts via `staff_can_support` (§7.3/m-COMM-03) | No |
| **DH-8** | Platform Core — audit/outbox/UUIDv7+human-ref/POLICY/flags/Realtime backing (consumed) | Consumed via Doc-4B mechanisms by pointer; Realtime = delivery channel (R9/§4.4) | No |
| `[ESC-COMM-AUDIT]` | No Communication audit domain in Doc-2 §9 | Bound by pointer to nearest §9 action; interim; channel: Doc-2 §9 additive | No |
| `[ESC-COMM-POLICY]` | No `communication` POLICY namespace keys registered (dedup/retry/backoff/rate/page) | Platform-default key names referenced by pointer; channel: Doc-3 §12.2 additive | Tracked — per-contract finalization |
| `[ESC-COMM-SLUG]` | No distinct recipient/delivery-read slug in Doc-2 §7 | Interim Own-or-Support / recipient scope by pointer; channel: Doc-2 §7 additive; no slug invented | No |
| `[ESC-COMM-EVENT]` | M6 emits no Doc-2 §8 event today | §8 N/A (R11); if ever required, additive Doc-2 §8 patch; **never coin an event in Doc-5H** | No |
| **`[REC-COMM-OWNERSHIP]`** | Delivery-aggregate ownership (BLOCKER BC-COMM-01) | **SATISFIED** — confirmed at structure (vs Doc-4H BC-COMM-3 / Doc-2 §10.7) and **reconfirmed verbatim at §6.4** — Outbound Log M6-owned; provider callbacks mutate only M6 state | Gate: **SATISFIED** |

---

## Appendix A — Doc-5H Conformance Attestation

Doc-5H attests the following bands against the Doc-5A Appendix A CHK-5A-xxx checklist. All bands PASS. Every check binds an existing obligation by pointer — no rule restated. Appendix A contains attestations only; no normative behavior is defined here.

---

### A.1 Wire Encoding Band (CHK-5A-010…015) — PASS
JSON/UTF-8 (CHK-5A-010); `snake_case` fields (CHK-5A-011); no bare money scalar — M6 carries no monetary amounts (CHK-5A-012 N/A); ISO 8601 timestamps (CHK-5A-013); all IDs are `UUIDv7`; `human_ref` only where a declared lookup/display applies (CHK-5A-014); all enum values drawn from Doc-2 frozen definitions — no invented value (CHK-5A-015).

### A.2 Transport Envelope Band (CHK-5A-020…025) — PASS
Single §4 envelope (CHK-5A-020); only registered standard headers carried (CHK-5A-021); `Iv-` prefix for registered tokens only — `Iv-Active-Organization` (CHK-5A-022); no forbidden header in any M6 surface (CHK-5A-023); `Authorization` mandatory; `Iv-Active-Organization` present on all org-scoped operations (CHK-5A-024); `Idempotency-Key` present when contract declares `Idempotency: required` (CHK-5A-025).

### A.3 Endpoint Realization Band (CHK-5A-030…036) — PASS
Every M6 endpoint instantiates the §5.7 template (CHK-5A-030); HTTP method per §5.2 mapping — creates `POST`/`201`, append children `POST`/`201`, state commands `POST` named/`200`, soft-remove `DELETE`/`200`, reads `GET`/`200` (CHK-5A-031); all paths conform to §5.3 grammar under `communication` namespace (CHK-5A-032); every state-changing operation is a named command sub-resource (`close_thread`, `close_ticket`, `update_ticket`, `mark_notification_read`, `archive_notification`) — no arbitrary field replacement (CHK-5A-033); inputs placed per §5.4 (CHK-5A-034); success statuses from §5.5 family (CHK-5A-035); `update_ticket` appears at named-command sub-resource position `/tickets/{id}/update_ticket` (not a bare collection or item path — the named command at sub-resource level is per §5.3 state-command convention) (CHK-5A-036).

### A.4 Error Model Band (CHK-5A-040…045, 050–053) — PASS
Every error maps class → HTTP per §6 (CHK-5A-040); canonical §6 error envelope (CHK-5A-041); top-level `reference_id` (platform-assigned `UUIDv7`) on all body-bearing responses — declared at §4.7 for all M6 surfaces (CHK-5A-042); `error_code` within `comm_` namespace (CHK-5A-043); `retryable` per §6 class (CHK-5A-044); `RATE_LIMITED` realized per `Doc-4A §19` where applicable (`retry_delivery` — §8) (CHK-5A-045). Non-access / not-found: indistinguishable in status (CHK-5A-050), body (CHK-5A-051), and timing (CHK-5A-052); excluded / routing-excluded rows undetectable (CHK-5A-053).

### A.5 Authorization Band (CHK-5A-060…063) — PASS
`Authorization` bearer = authentication token only; authorization derived server-side from `check_permission` (CHK-5A-060); `Iv-Active-Organization` server-validated per §3/§7; never accepted from client body or header as trusted input (CHK-5A-061); no authorization assertion from any header/input (`Doc-4A §9.7`) (CHK-5A-062); actor-type / delegation context resolved server-side; delegation not applicable on any M6 surface (`Doc-4H` H.3 on every BC) (CHK-5A-063).

### A.6 Filter/Pagination Band (CHK-5A-070…073) — PASS
Cursor-based (opaque `cursor`) pagination only; no offset/index (CHK-5A-070); page-size bound referenced by `[ESC-COMM-POLICY]` key only — no literal (CHK-5A-071); filter/sort fields drawn from declared allowlists (`Doc-4A §9.6`): `list_notifications` (`status`), `get_delivery_status` (`source_event_id`, `channel`), `list_tickets` (`status`) (CHK-5A-072); soft-deleted / non-disclosed / out-of-scope rows excluded from items, counts, and totals (CHK-5A-073).

### A.7 Idempotency Band (CHK-5A-080…083) — PASS
`Idempotency-Key` carried on all mutation contracts (`Idempotency: required`) (CHK-5A-080); duplicate request within dedup window → same result, no duplicate audit record, no duplicate row (CHK-5A-081); optimistic concurrency: `close_thread` uses `expected_status` OCC (`Doc-4A §14`); BC-COMM-4 ticket commands carry optional CONFLICT on lost race (`Doc-4H §H7`) (CHK-5A-082); retry semantics aligned to `retryable` signal (CHK-5A-083).

### A.8 Async Operations Band (CHK-5A-090…095) — N/A
No M6 caller-facing async (`202`) surfaces. Out-of-wire System contracts (§8) are in-process / background-job execution — a code-layer concern, not a Doc-5H wire concern. CHK-5A-090…095 not applicable to this module.

### A.9 Event / Outbox Surface Band (CHK-5A-100…103) — PASS
No event-driven completion surface (CHK-5A-100); no external webhook / SSE / socket push surface defined — provider-webhook is inbound infra, not M6-emitted; Realtime is a delivery channel, not a contract (CHK-5A-101); event receipt not treated as completion authority (CHK-5A-102); event catalog (Doc-2 §8) not restated — M6 emits no event; consumed events referenced by pointer only (CHK-5A-103).

### A.10 API Versioning Band (CHK-5A-110…114) — PASS
Surface version carried via `Iv-Api-Version` only; no URL-path or query versioning (CHK-5A-110); breaking change bumps surface version, additive/editorial does not (CHK-5A-111); contract identities stable (`comm.<operation>.v1`) (CHK-5A-112); deprecation per `Doc-4A §20.4`; `Removal-Window` by POLICY key (CHK-5A-113); domain change (entity/state/event/permission/POLICY) precedes contract — no surface-version bump as domain proxy (CHK-5A-114).

### A.11 General Band (CHK-5A-120…124) — PASS
No normative content restated; every rule bound by pointer (CHK-5A-120); nothing coined — no new entity / state / event / permission / POLICY key / error class / status / header invented (CHK-5A-121); transport-level choices marked **[rc]** (CHK-5A-122); missing authority → flag-and-halt; escalations carried by marker (CHK-5A-123); no invented external webhook / push surface (CHK-5A-124).

### A.12 Provenance Band (CHK-5A-131…134) — PASS
All 19 caller-facing M6 endpoints identify owning module (Communication, M6) and section (§4–§7) (CHK-5A-131); every endpoint traces to a frozen Doc-4H BC-COMM-1…4 contract (CHK-5A-132); no endpoint references an undefined aggregate — all aggregates (Thread/messages, Notification, Outbound Log, Support Ticket/ticket_messages) are frozen in Doc-2 §10.7 / Doc-4H (CHK-5A-133); contract identities stable under §12 (CHK-5A-134).

### A.13 Ownership Band (CHK-5A-141…144) — PASS
All M6 resources appear under `communication/` route namespace only (CHK-5A-141); no foreign-aggregate mutation — M6 contracts write only to M6-owned tables (`communication` schema: threads, messages, thread_participants, notifications, email_logs/sms_logs/whatsapp_logs, support_tickets, ticket_messages) (CHK-5A-142); cross-module interaction via approved channels (Identity via `check_permission` — consumed; RFQ scrub-rule via RFQ service — consumed; Doc-4B audit/outbox — consumed; never a foreign-namespace endpoint) (CHK-5A-143); no ownership contradiction with Doc-2 / Doc-4H (CHK-5A-144).

### A.14 Registry Band (CHK-5A-151…154) — PASS
Route prefix `communication` exists in `Doc-5A App B.1` (CHK-5A-151); `comm_` error-code prefix in `Doc-4A App B.2` (CHK-5A-152); standard header `Iv-Active-Organization` in `Doc-5A App B.4` (CHK-5A-153); no self-assigned namespace/registry token — new registrations via Doc-5A amendment only (CHK-5A-154).

---

### A.15 M6-Unique Attestation Bands

#### Delivery-Only / Single-Authorship Band (R5 / MA-COMM-04) — PASS
- M6 emits **no** Doc-2 §8 domain event (§8; R11; `[ESC-COMM-EVENT]` — none today).
- M6 authors **no** notification-production contract for another module — `comm.create_notification.v1` is a System event-consumer from other modules' events, never a caller-initiated production surface.
- A consumed event payload is **observational input only** — M6 renders it as notification text; it never becomes an M6 API-contract authority or owned read-model field (no ownership leakage from the source module — R5/MA-COMM-04).

#### Delivery-Aggregate Ownership Band (R8 / BLOCKER BC-COMM-01) — PASS
- The **Outbound Log aggregate** (`email_logs` / `sms_logs` / `whatsapp_logs`; VO `DeliveryStatus`) is **M6-owned** (`Doc-2 §10.7`; `Doc-4H` BC-COMM-3; §6.4 verbatim reconfirmation).
- Provider callbacks (`comm.update_delivery_status.v1`) mutate **only M6-owned Outbound Log state** — these are not Platform-Core-owned read-models that M6 mirrors; ownership stays in M6.
- `comm.update_delivery_status.v1` is driven by an inbound infra provider signal — **explicitly NOT a Doc-2 §8 domain event** (R8); no event ownership transferred.
- **`[REC-COMM-OWNERSHIP]` gate: SATISFIED** (structure freeze + §6.4 verbatim content reconfirmation).

#### Non-Disclosure Firewall Band (R10) — PASS
- Thread reads (`get_thread`, `list_threads`, `get_messages`) → **Participant** scope; non-participant → `NOT_FOUND`.
- Notification reads (`get_notification`, `list_notifications`) → **Recipient** scope; non-recipient → `NOT_FOUND`.
- Delivery reads (`get_delivery_status`) → **Own-or-Support** scope; non-authorized → `NOT_FOUND`.
- Ticket reads (`get_ticket`, `list_tickets`) → **Own-or-Support** scope; out-of-scope → `NOT_FOUND`.
- All collapses to uniform `NOT_FOUND` — no existence/timing side-channel (`Doc-5A §6.3/§7`; `Doc-4A §7.5/§12.4`); timing-uniformity throughout.
- **Notification read/archive state** is a per-recipient inbox fact only — cannot influence prioritization, matching, or trust (R6).

#### Append-Only Band (R12) — PASS
- **Messages** (`messages` rows in BC-COMM-1) — append-only; never overwritten or hard-deleted.
- **`close_thread`** closes the thread (`open → closed`) and **does not delete message history**.
- **`archive_notification`** advances inbox state (`read → archived`) and **does not delete the notification**.
- **Delivery logs** (`email_logs` / `sms_logs` / `whatsapp_logs`) — append-only; **never caller-writable** — written only by System contracts in §8.
- **Ticket messages** (`ticket_messages`) — append-only; never overwritten; appending blocked when ticket is `closed` (`STATE`).
- **`close_ticket`** closes the ticket (`resolved → closed`) and does not delete ticket message history.

---

*End of Doc-5H Content v1.0, Pass 3 (§6–§9 + Appendix A). §6 (Delivery Tracking, BC-COMM-3): `get_delivery_status` realized as dual-mode GET (by-ID + list) under `communication/delivery-records`; Own-or-Support disclosure scope; `[REC-COMM-OWNERSHIP]` reconfirmed verbatim at §6.4 — Outbound Log M6-owned, provider callbacks mutate only M6 state (R8); read unaudited; delivery logs never caller-writable (R12); forward-only FSM `queued → sent → delivered | failed` / retry `failed → queued`. §7 (Support, BC-COMM-4): 6 contracts realized; ticket machine `open → in_progress → resolved → closed` (terminal) — Doc-2 §3.7 / Doc-4H §H13 / §10.7 edges; two-sided User / Admin with explicit actor→transition authority (User → `resolved → closed` only; User requesting staff-only transition → `AUTHORIZATION`, not `STATE`); Support Ticket stays M6-owned (m-COMM-03); `create_ticket` → POST/201+Location; `add_ticket_message` → POST/201 no Location (no standalone message GET); `close_ticket` dedicated `resolved → closed` terminal; `ticket_messages` append-only; blocked on `closed` ticket. §8: 4 out-of-wire contracts declared with 5-protocol fence; provider-webhook inbound infra not M6-emitted (R8/R11); Realtime = delivery channel not a contract (R9). §9 + Appendix A: all 15 CHK-5A bands PASS (async N/A); `[REC-COMM-OWNERSHIP]` gate SATISFIED; 4 M6-unique bands (delivery-only/single-authorship, aggregate-ownership, non-disclosure, append-only) PASS; carried items DH-1…DH-8 + `[ESC-COMM-*]` registered by pointer; nothing coined; no Doc-2 §8 event emitted (R11). Doc-5H Content v1.0 complete — all 3 passes (§0–§9 + Appendix A) realized. Next: Doc-5H Freeze Readiness Audit.*