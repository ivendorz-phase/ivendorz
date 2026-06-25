# Doc-5H — Communication (M6 `communication`) API Realization — Content v1.0, Pass 1 (§0–§3 + inventory)

| Field | Value |
|---|---|
| Document | Doc-5H — Communication (Module 6) — API Realization |
| Pass | 1 of 3 — §0 Document Control · §1 Scope & Partition · §2 Realized Endpoint Inventory (19 caller-facing) · §3 Cross-Cutting Wire Model |
| Status | ACTIVE — Content Pass 1 of 3. 0 open BLOCKER/MAJOR/MINOR. Conforms to `Doc-5H_Structure_v1.0_FROZEN.md` |
| Realizes | the 19 caller-facing M6 endpoints' wire face (method/path/actor/active-org/status); the 4 out-of-wire contracts + §5.7 per-endpoint bodies are Pass-2/3 |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | `Doc-5H_Structure_v1.0_FROZEN.md` (R1–R12; 23-contract partition) |
| Contains | §0–§3 + the endpoint inventory. No §5.7 contract bodies, representations, error codes, POLICY keys, slugs, audit actions, events, or Doc-4H rules restated — bound by pointer |
| Audience | Architecture / API Governance Boards · Doc-5H authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4H fixed the contracts; Doc-2 §3.7/§10.7 + Doc-4M own the state machines; Doc-5A fixed the wire mechanics. §0–§3 realize the **wire face** and re-decide nothing. Error codes, representations, POLICY keys, slugs, audit actions, state edges, and the (empty) M6 event set are bound **by pointer, never restated**. The §3 cross-cutting model governs every endpoint; **every read declares its disclosure scope and every command its actor side** (§3.3 binding rules). Transport-level path choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9/§10`; `Doc-4H §H0/§H4–§H7`; `Doc-4M`; `Doc-2 §3.7/§10.7`; `Doc-4C §C3/§C8` (consumed); `Doc-4E` (RFQ scrub-rule, consumed — DH-3); §3 (this document).

---

## §0 — Document Control, Precedence & Conformance Obligation

### 0.1 Precedence
Doc-5H sits at: `Master Architecture → ADR Compendium → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A → Doc-4H → Doc-5A → **Doc-5H** → Code`. On any conflict, the higher document governs and Doc-5H is corrected; **flag-and-halt**, never resolve locally (`Gov-Note §7`).

### 0.2 Scope of Authority
Doc-5H realizes **only the M6 caller-facing HTTP wire face**. It owns no entity, state edge, event, slug, audit action, or POLICY key — those are Doc-2/Doc-4H/Doc-3. It realizes no other module's surface (§1.3).

### 0.3 Conformance Obligation
Every section conforms to **Doc-5A** and must pass the **Doc-5A Appendix A** `CHK-5A-xxx` checklist before freeze (`Gov-Note §6`). Doc-5H **coins nothing** — no endpoint, status, header, error class, slug, POLICY key, or **event** (R4/R11; `CHK-5A-121`).

### 0.4 Realize-Never-Redecide & Realization Conventions
Where Doc-5A is **silent** on a transport detail (e.g., the concrete path string for a resource), Doc-5H fixes a **[realization convention]** that contradicts nothing upstream; the binding rule (method, status, namespace) remains Doc-5A. Where the corpus **decides**, Doc-5H binds by pointer and never re-opens it.

---

## §1 — Scope, Audience & M6 Surface Partition

### 1.1 What Doc-5H Governs
The **19 caller-facing** Communication endpoints (User + Admin) across BC-COMM-1…4: messaging & threads, notifications, delivery-status read, support tickets. It does **not** govern the 4 out-of-wire System contracts (§8/Pass-3), realtime push (a delivery channel, not a contract — R9), the provider-webhook ingress (infrastructure — R8), or any other module's surface.

### 1.2 M6 Surface Partition (carried from FROZEN structure)

**23 contracts = 19 caller-facing + 4 out-of-wire.** Internal-service-only contracts: **0** — the dual-audience internal leg is a *mechanism, not a counted contract* (MA-COMM-01).

| Doc-5H § | BC | Caller-facing | Out-of-wire (→ §8) | Total |
|---|---|---|---|---|
| §4 | BC-COMM-1 Messaging | 8 | 0 | 8 |
| §5 | BC-COMM-2 Notifications | 4 | 1 (`create_notification`) | 5 |
| §6 | BC-COMM-3 Delivery Tracking | 1 | 3 (`create_delivery_record`, `update_delivery_status`, `retry_delivery`) | 4 |
| §7 | BC-COMM-4 Support | 6 | 0 | 6 |
| **Total** | | **19** | **4** | **23** |

### 1.3 Dependency Boundary
M6 realizes only M6 surfaces. Cross-module concerns are the owning module's Doc-5x (Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Operations → Doc-5F, Trust → Doc-5G, Billing → Doc-5I, Admin → Doc-5J). M6 **consumes** those modules' Doc-2 §8 events (fan-out) and services (Identity `check_permission`/context — `Doc-4C §C3/§C8`; RFQ scrub-rule — `Doc-4E`/DH-3) by pointer, and realizes **none** of their surfaces.

### 1.4 Audience & Carried Items
Carried by pointer, resolved only via their Doc-4H channels (none resolved here): **DH-1…DH-8**; `[ESC-COMM-AUDIT]` (Doc-2 §9 additive), `[ESC-COMM-POLICY]` (Doc-3 §12.2 additive), `[ESC-COMM-SLUG]` (Doc-2 §7 additive), `[ESC-COMM-EVENT]` (Doc-2 §8 additive — none today); **`[REC-COMM-OWNERSHIP]`** (delivery-aggregate ownership — satisfied at structure freeze against `Doc-4H` BC-COMM-3 "Outbound Log" + `Doc-2 §10.7`; **reconfirm verbatim per-contract** in Pass-3 §6).

---

## §2 — Realized Endpoint Inventory

### 2.1 Namespace, Path Grammar & Method Mapping
- **Route namespace `communication`** (`Doc-5A Appendix B.1`; `Doc-2 §0.3`). **Path grammar derives from the route prefix `communication`, never from the `comm.` Contract-ID token stem** (R3); paths follow `/{communication}/{resource-plural}[/{id}][/{command-name}]` (`Doc-5A §5.3`). Concrete path strings are **[realization convention]** (Doc-5A is silent on path text; the binding rules are method §5.2, status §5.5).
- **Method mapping (`Doc-5A §5.2`):** Query → `GET`; create-command → `POST` to the collection (`201` + `Location` **[rc]**); partial update → `PATCH` on the item (`200`); state-transition / domain command → `POST` to a named command sub-resource (`200`); soft-delete command → `DELETE` on the item (ADR-012, never hard delete) — `200` with updated entity body where the contract declares a body outcome; `204` where no-body (`Doc-5A §5.5`).
- **Command tokens** are the exact `comm.<operation>` names **verbatim from the Doc-4H PassB per-Contract-ID blocks**. **Inventory ordering within a section is non-authoritative and informational only; the partition table (§1.2) is authoritative — on conflict the partition table wins; inventory order never implies lifecycle order** (N-07). Each endpoint instantiates the §5.7 template (filled in Pass-2/3).

### 2.2 Inventory — §4 Messaging & Threads (BC-COMM-1, 8)

| # | Contract | Actor | Method · Path **[rc]** | Active-org | Success |
|---|---|---|---|---|---|
| 1 | `comm.create_thread.v1` | User | `POST /communication/threads` | Y | `201` |
| 2 | `comm.send_message.v1` | User | `POST /communication/threads/{id}/messages` (append-only message — R12; RFQ scrub seam on `rfq_clarification` — R7/§3.8) | Y | `201` |
| 3 | `comm.add_thread_participant.v1` | User | `POST /communication/threads/{id}/participants` | Y | `201` |
| 4 | `comm.remove_thread_participant.v1` | User | `DELETE /communication/threads/{id}/participants/{participant_id}` (soft; audit retained — R12) | Y | `200` |
| 5 | `comm.close_thread.v1` | User | `POST /communication/threads/{id}/close_thread` (state cmd `open → closed`; history retained — R12) | Y | `200` |
| 6 | `comm.get_thread.v1` | User | `GET /communication/threads/{id}` (Participant scope) | Y | `200` |
| 7 | `comm.list_threads.v1` | User | `GET /communication/threads` (Participant scope) | Y | `200` |
| 8 | `comm.get_messages.v1` | User | `GET /communication/threads/{id}/messages` (Participant scope; **source of truth** — R9) | Y | `200` |

### 2.3 Inventory — §5 Notifications (BC-COMM-2, 4)

| # | Contract | Actor | Method · Path **[rc]** | Active-org | Success |
|---|---|---|---|---|---|
| 9 | `comm.mark_notification_read.v1` | User | `POST /communication/notifications/{id}/mark_notification_read` (`unread → read`) | Y | `200` |
| 10 | `comm.archive_notification.v1` | User | `POST /communication/notifications/{id}/archive_notification` (`read → archived`; does not delete — R12) | Y | `200` |
| 11 | `comm.get_notification.v1` | User | `GET /communication/notifications/{id}` (Recipient scope) | Y | `200` |
| 12 | `comm.list_notifications.v1` | User | `GET /communication/notifications` (Recipient scope) | Y | `200` |

> Recipient-read scope carries `[ESC-COMM-SLUG]` (no distinct Doc-2 §7 notification-read slug; interim recipient scope by pointer — never invented).

### 2.4 Inventory — §6 Delivery Tracking (BC-COMM-3, 1)

| # | Contract | Actor | Method · Path **[rc]** | Active-org | Success |
|---|---|---|---|---|---|
| 13 | `comm.get_delivery_status.v1` | User / Admin | `GET /communication/delivery_records/{id}` (**Own-or-Support scope** — User own-record / Admin `staff_can_support`; cross-tenant → `NOT_FOUND`) | Y / **N** (admin) | `200` |

> Read over the M6-owned `Outbound Log` aggregate (R8). The 3 write-path contracts (`create_delivery_record`, `update_delivery_status`, `retry_delivery`) have **no wire** — §8/Pass-3.

### 2.5 Inventory — §7 Support Communications (BC-COMM-4, 6)

| # | Contract | Actor | Method · Path **[rc]** | Active-org | Success |
|---|---|---|---|---|---|
| 14 | `comm.create_ticket.v1` | User | `POST /communication/tickets` (opener message created in-transaction) | Y | `201` |
| 15 | `comm.update_ticket.v1` | User / Admin | `POST /communication/tickets/{id}/update_ticket` (state-transition cmd on the §3.7 ticket machine; per-command actor-side — §3.3) | Y / **N** (admin) | `200` |
| 16 | `comm.add_ticket_message.v1` | User / Admin | `POST /communication/tickets/{id}/messages` (append-only — R12) | Y / **N** (admin) | `201` |
| 17 | `comm.close_ticket.v1` | User / Admin | `POST /communication/tickets/{id}/close_ticket` (`resolved → closed`) | Y / **N** (admin) | `200` |
| 18 | `comm.get_ticket.v1` | User / Admin | `GET /communication/tickets/{id}` (Own-or-Support scope) | Y / **N** (admin) | `200` |
| 19 | `comm.list_tickets.v1` | User / Admin | `GET /communication/tickets` (Own-or-Support scope) | Y / **N** (admin) | `200` |

> `update_ticket` realizes legal `open → in_progress → resolved → closed` transitions only (edges `Doc-2 §3.7`; Doc-4M = index — §3.7); illegal → `STATE` → `409`. User vs Staff transition authority is the §3.3 per-command actor-side rule (filled in Pass-3 §7). The support-ticket aggregate stays **M6-owned**; Admin acts via `staff_can_support`, ownership never transfers to Admin (M8).

### 2.6 Out-of-wire exclusion
The 4 out-of-wire System contracts — `comm.create_notification` (fan-out event-consumer), `comm.create_delivery_record` (dispatch job), `comm.update_delivery_status` (provider-webhook callback), `comm.retry_delivery` (retry job) — are **excluded from this inventory** (no HTTP wire in any protocol). They are realized as the §8 out-of-wire boundary in Pass-3.

---

## §3 — Cross-Cutting Actor, Delivery-Only & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*

This section realizes the cross-cutting mechanism every §4–§7 endpoint depends on. **It instantiates no endpoint body.**

### 3.1 Actor Model
**User + Admin only — there is NO public/anonymous actor** (R2). The **User** carries `Authorization` (authentication) **and** `Iv-Active-Organization` — **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`) — for all BC-COMM-1/-2 and the opener side of BC-COMM-4. The **Admin** support actor (`staff_can_support`) carries **no** active-org context (`Doc-5A §7.3`) for the delivery-status read and the staff legs of BC-COMM-4. System is out-of-wire (§8).

### 3.2 Authorization Authority
Authorization is resolved **server-side via Identity's `check_permission`** (`Doc-4C §C3`, consumed). **`check_permission` is the sole authorization authority consumed by M6 surfaces; no parallel or shadow authorization path is permitted** (`Doc-4A §5.3`, `Doc-4A §6`). Slugs bind the existing Doc-2 §7 catalog (`can_use_messaging`, `can_raise_support_ticket`, `staff_can_support`); a missing slug carries `[ESC-COMM-SLUG]` — never invented.

### 3.3 Per-Read Disclosure-Scope & Per-Command Actor-Side Rules (binding)
- **Every read in §4–§7 declares its disclosure scope** — **Participant** (threads/messages) · **Recipient** (notifications) · **Own-or-Support** (delivery, tickets) · **Shared** — in its §5.7 block. An ambiguous/undeclared scope is a **content-authoring blocker**.
- **Every command declares its actor side** — **User / Admin / Either** (BC-COMM-4 tickets are two-sided). An ambiguous/undeclared actor side is a **content-authoring blocker**.

### 3.4 Delivery-Only / Single-Authorship & Firewall (wire constraints)
M6 owns notification fan-out + delivery transport only; the **emitting module authors the Doc-2 §8 event, M6 consumes + dispatches** (R5). A **consumed event payload is observational input only and never becomes API-contract authority** — rendered as notification text, never re-exposed as an owned read-model field. A **delivery outcome is an observability fact, never a score/eligibility/business signal** (R6/DH-5); **no entitlement/plan/commercial state gates delivery** in a way touching trust/eligibility/routing fairness (DH-6). M6 emits **no** Doc-2 §8 event (R11).

### 3.5 Realtime = Delivery Channel
Realtime push (Supabase Realtime, DH-8 backing) is a **delivery channel** (`Doc-5A §10` / `Doc-4A §15.7`), **not** a contract or API surface. **Realtime carries observations only and has no state-transition authority** — no message creation, mutation, or acknowledgement through realtime; every state change is a §4 caller command; `comm.get_messages` is the **source of truth** (R9).

### 3.6 Non-Disclosure Firewall
Thread/message/notification/ticket/delivery reads are participant/recipient/scope-gated; a non-participant / non-recipient / out-of-scope / cross-tenant read **collapses to a uniform `NOT_FOUND`** — no timing side-channel (`Doc-5A §6.3/§7`; `Doc-4A §7.5`; R10). **Notification read/archive state never influences prioritization, matching, or trust** (R6).

### 3.7 State-Machine Authority
Communication lifecycles — thread (`open → closed`), notification (`unread → read → archived`), ticket (`open → in_progress → resolved → closed`), delivery (`queued → sent → delivered | failed`, retry `failed → queued`) — have their **edges defined in `Doc-2 §3.7/§10.7`** (+ Doc-4H); **`Doc-4M` is the cross-module state-map index, not the edge definer**. Doc-5H realizes legal transitions only; no edge invented; illegal → `STATE` → `409`.

### 3.8 RFQ Scrub-Rule Seam (mechanism; endpoint is §4)
On an `rfq_clarification` thread, `comm.send_message` **reads the RFQ-owned raw-contact-scrub rule via the RFQ service (`Doc-4E`/DH-3) and applies it content-side** at message-write; rejected content → `BUSINESS` error. **M6 cannot cache, copy, extend, or override the rule** — it applies the rule's verdict only; the rule stays wholly RFQ-owned; no procurement decision here. `context_id` (`rfq_id`) is a bare UUID.

---

*End of Doc-5H Content v1.0, Pass 1 (§0–§3 + inventory). The 19 caller-facing endpoints realized per the §5.2 method mapping (creates `POST`/`201`, partial updates `PATCH`, state/domain commands `POST` named, removals `DELETE`, appends `201`, reads `GET`/`200`); route namespace `communication` (paths `[realization convention]`, never the `comm.` token stem); the 4 out-of-wire contracts excluded (§8/Pass-3); the §3 cross-cutting model (User/Admin no-public · `check_permission` sole authority · disclosure-scope + actor-side rules · delivery-only firewall · realtime = channel · non-disclosure `NOT_FOUND` · state-map index · RFQ scrub seam) governs every endpoint; representations/codes/POLICY keys/slugs/audit actions/events/Doc-4H rules not restated; nothing coined. §4–§7 §5.7 bodies + §8 out-of-wire + §9 conformance + Appendix A follow in Pass-2 (§4–§5) and Pass-3 (§6–§9 + Appendix A), each conforming to `Doc-5H_Structure_v1.0_FROZEN.md`.*
