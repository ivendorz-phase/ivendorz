# Doc-4H — Communication Engine — Pass-B (Hardening) Part 4 — BC-COMM-4 Support Communications v1.0

| Field | Value |
|---|---|
| Document | `Doc-4H_PassB_Part4_BC-COMM-4_Support_Communications_v1.0` — Pass-B hardening of the BC-COMM-4 (Support Communications) contracts |
| Module | Module 6 — Communication (`communication` schema · `comm_` namespace) |
| Bounded Context | **BC-COMM-4 — Support Communications** |
| Owned Aggregate | **Support Ticket** (`support_tickets` + `ticket_messages`; VO ticket status) — the frozen Pass-A aggregate (§HA-4.4 / §HA-3; ASSUMPTION A-04, Module-6-owned). *Reconciliation note: the Part-4 brief's label "SupportConversation" is a non-authoritative descriptive alias for this same frozen aggregate; no `SupportConversation` aggregate exists in the corpus, and Pass-A governs the name. Likewise the brief's "Support-ticket ownership ∈ not-owned" is reconciled to Pass-A, which assigns Support Ticket ownership to BC-COMM-4 (A-04); BC-COMM-4 owns the support communication records (`support_tickets`/`ticket_messages`) and nothing beyond them.* |
| Scope (owns) | Customer-support communication, support interaction tracking, support-thread lifecycle, support-staff participation, support-case communication history — **communication records only**. |
| Scope (does NOT own) | RFQ discussions / procurement negotiations (BC-COMM-1 + RFQ), vendor matching / ranking (RFQ — moat), Trust/Performance/Verification/Governance scores (Trust — firewall), Identity ownership (Identity — consumed via DH-1). |
| Sole contract authority | `Doc-4H_PassA_v1.0_FROZEN` (HA-4.4 BC-COMM-4 records; Appendix A rows 14–18; HA-6 lifecycle; HA-7/B.6 event inventory; HA-8 DH-1…DH-8) · `Doc-4H_Structure_v1.0_FROZEN` |
| Governing authority (precedence) | Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A/4B/4C/4D/4E/4F/4G v1.0 (FROZEN) · Doc-4H Structure FROZEN · Doc-4H Pass-A FROZEN. On conflict: **FLAG-AND-HALT** (no local resolution). |
| Nature | **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. BC/aggregate/event/dependency/permission/escalation ownership are exactly as frozen in Pass-A. |

**Contract-inventory gate (pre-authoring, mandatory).** The frozen BC-COMM-4 inventory (`Doc-4H_PassA_v1.0_FROZEN` §HA-4.4; Appendix A rows 14–18) is the six contracts below — `comm.create_ticket.v1`, `comm.update_ticket.v1`, `comm.add_ticket_message.v1`, `comm.close_ticket.v1`, `comm.get_ticket.v1`, `comm.list_tickets.v1`. Verified complete; no additional BC-COMM-4 contract exists. This is the **only** authoritative inventory; it is hardened verbatim — **no contract invented, renamed, merged, or omitted.**

---

## Part-4 hardening conventions (H.1–H.10)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is established before semantic processing (6–9) — a disclosure control (§7.5). Every Validation Matrix row names the **stage**, **source authority**, **rule (validation)**, and **failure class**. For query contracts Stage 8 is present and, where no business rule applies, is stated explicitly as `n/a — read operation`.
- **H.2 — Actors (Doc-4A §5).** **User** (ticket opener — `can_raise_support_ticket`, own-org) and **Admin** (Support Staff — `staff_can_support`, §5.6 platform-staff, no active org context). No System actor in BC-COMM-4.
- **H.3 — Delegation (Doc-4A §6B).** Support tickets are **not delegation-eligible**; Stage 5 is `n/a` on every contract.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`; codes follow **`comm_<domain>_<code>`** (namespace `comm_`); numeric codes are development-document scope — Pass-B fixes **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable:false`) is distinct from `DEPENDENCY` (an owning service / Identity / outbox transiently unavailable; `retryable:true`)**; **`STATE` (operation illegal from current ticket state) is distinct from `CONFLICT` (optimistic-concurrency lost race on a ticket write)** — never merged (Doc-4A §12.2/§12.4; FROZEN Doc-4F P-03/P-01 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract).
- **H.5 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Two Doc-2 §7 authorities only: **`can_raise_support_ticket`** (all active members; the ticket opener, own-org) and the platform-staff **`staff_can_support`** (Support Admin; §5.6; **no private-RFQ read**). **Explicit actor→transition authority** (Doc-2 §3.7; lifecycle unchanged): **User** (`can_raise_support_ticket`, own-org ticket only) may add ticket messages and **close own ticket** (`resolved → closed`); User performs **no** `open → in_progress` or `in_progress → resolved` transition. **Support Staff** (`staff_can_support`) drives `open → in_progress`, `in_progress → resolved`, `resolved → closed`. No distinct §7 slug beyond these two → any residual question carries **`[ESC-COMM-SLUG]`** (Doc-2 §7 additive; **no slug invented**). Identity org/membership/active-org + `staff_can_support` resolution is consumed (DH-1, Doc-4C FROZEN). No shadow authorization.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (User or Support Staff), **object scope** (the `support_tickets`/`ticket_messages` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority**. Reads are not audited (§17.1). **Doc-2 §9 enumerates no separate Communication / Support audit domain** → every BC-COMM-4 mutation (create-ticket, update-ticket, add-ticket-message, close-ticket) carries **`[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**), exactly as frozen in Pass-A HA-9.
- **H.7 — Events (Doc-2 §8; single-authorship Doc-4A §4.4).** **BC-COMM-4 emits NO Doc-2 §8 domain event and consumes none** (Pass-A HA-4.4 — Events: none on every contract; Doc-4A §16.4 — no event coined). Support-ticket activity is not a Doc-2 §8 domain event; nothing is produced, consumed, or coined. Single-authorship intact.
- **H.8 — Idempotency (Doc-4A §14).** Mutations carry `Idempotency: required` + a dedup window (`[ESC-COMM-POLICY]`; **no key invented** — platform default referenced by name); replay within the window → same result, no duplicate row, no duplicate audit. `add_ticket_message` is append-only — replay with the same idempotency key yields one `ticket_messages` row. Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Protected-fact collapse (Doc-4A §7.5/§12.4).** A User accessing a ticket outside own-org, or any actor lacking the required authority, receives **`NOT_FOUND`** (existence never confirmed via `AUTHORIZATION`). Support Staff (`staff_can_support`) operate in staff scope; cross-tenant content beyond support tickets is never exposed (no private-RFQ read). `Timing-Uniformity`: not-authorized / not-exist responses identical.
- **H.10 — Neutrality / moat / firewall (Doc-4A §4.4/§4A/§4B).** Support Communications **transports/records, never decides**. BC-COMM-4 owns **none** of matching / routing / ranking / quotation-evaluation / supplier-selection / award (RFQ — DH-3) and computes/owns **no** Trust / Performance / Verification / Governance score (Trust — DH-5). A support ticket is a communication record — never a procurement decision, eligibility gate, or score signal. Support communications never become procurement decision authority; no RFQ ownership transfer.

**Per-contract record shape (Pass-B).** Each contract is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Notes.**

**Frozen anchors (verbatim).** Aggregate **Support Ticket** — `support_tickets` (refs `organization_id`, `opened_by`; RLS `organization_id` + staff; soft-delete = yes; fields `status(open/in_progress/resolved/closed)`, `subject`, `priority`) + `ticket_messages` (FK `→ support_tickets`; `author_id` user-or-staff; append-only, no soft-delete). Lifecycle (Doc-2 §3.7/§10.7): **`open → in_progress → resolved → closed`** (terminal `closed`). Slugs (Doc-2 §7): `can_raise_support_ticket`, `staff_can_support`. Contracts (⊆ Pass-A HA-4.4; Appendix A rows 14–18): `comm.create_ticket.v1`, `comm.update_ticket.v1`, `comm.add_ticket_message.v1`, `comm.close_ticket.v1`, `comm.get_ticket.v1`, `comm.list_tickets.v1`.

---

## §HB-4.1 — `comm.create_ticket.v1` — Create Ticket

**1. Contract Metadata** — **Contract ID:** `comm.create_ticket.v1` · **Name:** Create Ticket · **Owning BC:** BC-COMM-4 · **Aggregate:** Support Ticket (`support_tickets`) · **Operation Type:** 21.4 Command · **Actor:** User · **Permission Family:** `can_raise_support_ticket` (Doc-2 §7).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `subject` | text | Required | Doc-2 §10.7 | non-empty |
| `priority` | enum | Required | Doc-2 §10.7 | ticket priority per `support_tickets.priority` |
| `body` | text | Required | Doc-2 §10.7 | initial `ticket_messages` body (opener message) |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe within dedup window |

**3. Response Schema** — **Success:** the created `support_tickets` row (`id`, `organization_id`, `opened_by`, `subject`, `priority`, `status=open`, `created_at`) + the opener `ticket_messages` row. **Failure:** Doc-4A §12 envelope (`error_class, error_code, message, field_errors, retryable, reference_id`). **Authority:** Doc-2 §3.7/§10.7; Doc-4A §12.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `subject`/`body` non-empty; `priority` ∈ enum | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds `can_raise_support_ticket` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | ticket is created for the actor's active org (`organization_id` = active org; `opened_by` = actor) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | n/a — create has no prior state (enters `open`) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate; opener message created with the ticket) | — |
| 8 BUSINESS | Doc-4A §4.4 | support-ticket creation only — **no business decision** (transport/record, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup window (`[ESC-COMM-POLICY]`); any open-ticket rate limit carries `[ESC-COMM-POLICY]` | — |

**5. Authorization Matrix** — **Actor:** User · **Authority:** Doc-2 §7 (`can_raise_support_ticket`); Doc-4A §6/§7.3 · **Scope:** own active org only (`organization_id` = active org) · **Restrictions:** cannot open a ticket for another org · **Cross-tenant:** prohibited (RLS `organization_id`) · **Protected-fact:** n/a at create (no existence probe).

**6. State Enforcement** — Creates `support_tickets` at **`open`** (Doc-2 §3.7) and the opener `ticket_messages` row (append-only). Lifecycle `open → in_progress → resolved → closed`; create is the entry transition only. No state invented; no transition added.

**7. Audit Binding** — Audit trigger: ticket creation · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by pointer; **no action invented**) · Required audit record (payload): attribution **User**, `organization_id`, `entity_type=support_tickets`, `entity_id`, action, `subject`/`priority`, timestamp via Doc-4B `core.append_audit_record.v1` (in-transaction).

**8. Event Binding** — Consumed: none · Produced: **none** (H.7 — BC-COMM-4 emits no Doc-2 §8 event). Ownership: n/a.

**9. Error Register** — `VALIDATION` (malformed subject/priority/body) · `AUTHORIZATION` (no slug / no active org / cross-org). No `STATE` (create). No `REFERENCE` (in-aggregate).

**Error Boundary block (Doc-4A §12.4/§12.6):** `REFERENCE` (definitive) vs `DEPENDENCY` (transient — Identity/outbox) are distinct (H.4); neither typically applies at create. `Timing-Uniformity`: n/a (no existence probe at create).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → same `ticket_id` + single opener message, no duplicate row, no duplicate audit. A genuinely new create with a different key is a new ticket (Doc-4A §14.6).

**11. Cross-Module References** — Identity org-context/membership (DH-1); Platform Core audit/outbox + human-ref (DH-8). No producer entity owned; no score (DH-5 firewall); no procurement decision (DH-3 moat).

**12. AI-Agent Notes** — User-initiated; ticket is scoped to the actor's active org (`organization_id`), `opened_by` = actor. Create at `open` with the opener `ticket_messages` row. Cross-org create is prohibited; out-of-scope access elsewhere collapses to `NOT_FOUND`. Make no procurement decision (moat); reference/compute no Trust score (firewall). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-4.2 — `comm.update_ticket.v1` — Update Ticket (status/progress)

**1. Contract Metadata** — **Contract ID:** `comm.update_ticket.v1` · **Name:** Update Ticket (status/progress) · **Owning BC:** BC-COMM-4 · **Aggregate:** Support Ticket (`support_tickets`) · **Operation Type:** 21.4 Command · **Actor:** User / Admin · **Permission Family:** `can_raise_support_ticket` (opener, own-org) / `staff_can_support` (Support Staff).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `ticket_id` | uuid | Required | Doc-2 §10.7 | target ticket |
| `target_status` | enum(`in_progress`,`resolved`,`closed`) | Required | Doc-2 §3.7 | requested transition (actor→transition authority, §5) |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe within dedup window |

**3. Response Schema** — **Success:** updated `support_tickets` row (`id`, `status`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §3.7/§10.7; Doc-2 §7; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `ticket_id` uuid; `target_status` ∈ {`in_progress`,`resolved`,`closed`} | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5/§5.6 | actor is User (active org) **or** Support Admin (`staff_can_support`, no active org — §5.6) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | User holds `can_raise_support_ticket`; Support Staff holds `staff_can_support` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **User:** own-org ticket only, else `NOT_FOUND` collapse. **Support Staff:** staff scope | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | requested transition legal from current status along `open → in_progress → resolved → closed`; **actor→transition authority:** User may only `resolved → closed` (own ticket) — User performs no `open → in_progress` or `in_progress → resolved`; Support Staff drives `open → in_progress`, `in_progress → resolved`, `resolved → closed` | `STATE` (illegal transition) / `AUTHORIZATION` (actor not authorized for that transition) |
| 7 REFERENCE | Doc-4A §4.5 | `ticket_id` resolves to an existing ticket in scope | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | ticket-progress only — **no business decision** beyond the lifecycle (transport/record, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup window (`[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — **Actor:** User (opener, own-org) / Admin (Support Staff) · **Authority:** Doc-2 §7 (`can_raise_support_ticket` / `staff_can_support`); Doc-4A §6/§7.3/§7.5/§5.6 · **Scope:** User → own-org ticket; Support Staff → staff scope · **Restrictions (actor→transition):** User → `resolved → closed` only; Support Staff → `open → in_progress`, `in_progress → resolved`, `resolved → closed`; no private-RFQ read for staff · **Cross-tenant:** prohibited (User RLS; staff scope) · **Protected-fact:** out-of-scope → **`NOT_FOUND`** (Doc-4A §7.5/§12.4).

**6. State Enforcement** — `support_tickets` **`open → in_progress → resolved → closed`** (Doc-2 §3.7; sequence unchanged, no state added). Transition legality enforced by current status **and** actor authority (H.5): a User attempting `open → in_progress`/`in_progress → resolved` is rejected (`AUTHORIZATION`, the transition is staff-only — not a relabeled `STATE`); an out-of-sequence transition (e.g. `open → resolved`) is `STATE`. `closed` is terminal (see `close_ticket`). No lifecycle reinterpretation.

**7. Audit Binding** — Audit trigger: ticket status update · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record (payload): attribution **User / Support Staff**, `organization_id`, `entity_type=support_tickets`, `entity_id`, prior→new status, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — Consumed: none · Produced: **none** (H.7). Ownership: n/a.

**9. Error Register** — `VALIDATION` (bad id/status) · `AUTHORIZATION` (no slug / actor not authorized for the requested transition) · `NOT_FOUND` (out-of-scope ticket — protected-fact) · `STATE` (out-of-sequence transition). Optional `CONFLICT` only on a true optimistic-concurrency lost race (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — out-of-scope is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm existence). **`STATE` (out-of-sequence transition) is distinct from `CONFLICT` (lost concurrency race)** — never merged. A staff-only transition requested by a User is `AUTHORIZATION` (actor-authority), not `STATE`. **`REFERENCE` (ticket does not exist) vs `DEPENDENCY` (Identity/outbox transient)** distinct. `Timing-Uniformity`: not-in-scope / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → same resulting status, no duplicate audit; re-requesting the current status is an idempotent no-op (Doc-4A §14.6).

**11. Cross-Module References** — Identity + Support-Admin slug resolution (DH-1); Platform Core audit/outbox (DH-8). No producer entity owned; no score; no procurement decision.

**12. AI-Agent Notes** — Enforce **both** sequence and actor authority: User may only `resolved → closed` on an own-org ticket; Support Staff (`staff_can_support`) drives `open → in_progress`, `in_progress → resolved`, `resolved → closed`. A User requesting a staff-only transition → `AUTHORIZATION`; an out-of-sequence transition → `STATE` (distinct from `CONFLICT`). Out-of-scope ticket → `NOT_FOUND`. No state added; lifecycle unchanged. Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-4.3 — `comm.add_ticket_message.v1` — Add Ticket Message

**1. Contract Metadata** — **Contract ID:** `comm.add_ticket_message.v1` · **Name:** Add Ticket Message · **Owning BC:** BC-COMM-4 · **Aggregate:** Support Ticket (`ticket_messages`) · **Operation Type:** 21.4 Command · **Actor:** User / Admin · **Permission Family:** `can_raise_support_ticket` (opener) / `staff_can_support` (staff).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `ticket_id` | uuid | Required | Doc-2 §10.7 | target ticket |
| `body` | text | Required | Doc-2 §10.7 | non-empty message body |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe; append-only |

**3. Response Schema** — **Success:** the appended `ticket_messages` row (`id`, `ticket_id`, `author_id`, `body`, `created_at`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §10.7; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `ticket_id` uuid; `body` non-empty | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5/§5.6 | actor is User (active org) **or** Support Admin (`staff_can_support`) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | User holds `can_raise_support_ticket`; Support Staff holds `staff_can_support` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **User:** own-org ticket only (else `NOT_FOUND` collapse); **Support Staff:** staff scope | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | ticket is not `closed` (a message cannot be appended to a `closed` ticket) | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | `ticket_id` resolves to an existing ticket in scope | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | message append only — **no business decision** (transport/record, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup window (`[ESC-COMM-POLICY]`); anti-spam, if any, carries `[ESC-COMM-POLICY]` | — |

**5. Authorization Matrix** — **Actor:** User (opener, own-org) / Admin (Support Staff) · **Authority:** Doc-2 §7; Doc-4A §6/§7.3/§7.5/§5.6 · **Scope:** User → own-org ticket; Support Staff → staff scope · **Restrictions:** participants in the ticket only; no private-RFQ read for staff · **Cross-tenant:** prohibited · **Protected-fact:** out-of-scope → **`NOT_FOUND`** (§7.5/§12.4).

**6. State Enforcement** — Appends a `ticket_messages` row (Doc-2 §10.7 append-only; never overwrite). The parent ticket must not be `closed` (`STATE` if `closed`). Appending does not transition the ticket status. No state invented.

**7. Audit Binding** — Audit trigger: ticket-message append · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record (payload): attribution **User / Support Staff** (`author_id`), `organization_id`, `entity_type=ticket_messages`, `entity_id`, `ticket_id`, action, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — Consumed: none · Produced: **none** (H.7). Ownership: n/a.

**9. Error Register** — `VALIDATION` (empty body / bad id) · `AUTHORIZATION` (no slug / no active context) · `NOT_FOUND` (out-of-scope ticket — protected-fact) · `STATE` (ticket `closed`). Optional `CONFLICT` only on a true lost race (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — out-of-scope is `NOT_FOUND`. **`STATE` (closed ticket) is distinct from `CONFLICT` (lost race).** **`REFERENCE` (ticket does not exist) vs `DEPENDENCY` (Identity/outbox transient)** distinct. `Timing-Uniformity`: not-in-scope / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → one `ticket_messages` row, no duplicate audit. A genuinely new message with a different key is a new append (append-only — Doc-2 §10.7).

**11. Cross-Module References** — Identity (DH-1); Platform Core audit/outbox (DH-8). No producer entity owned; no score; no procurement decision.

**12. AI-Agent Notes** — Append-only message; **never overwrite**. Participants only (User own-org / Support Staff staff scope); out-of-scope → `NOT_FOUND`. A `closed` ticket rejects appends (`STATE`, not `CONFLICT`). Idempotent replay → one row, no duplicate audit. No procurement decision (moat); no Trust score (firewall). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-4.4 — `comm.close_ticket.v1` — Close Ticket

**1. Contract Metadata** — **Contract ID:** `comm.close_ticket.v1` · **Name:** Close Ticket · **Owning BC:** BC-COMM-4 · **Aggregate:** Support Ticket (`support_tickets`) · **Operation Type:** 21.4 Command · **Actor:** User / Admin · **Permission Family:** `can_raise_support_ticket` (opener, own-org) / `staff_can_support` (staff).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `ticket_id` | uuid | Required | Doc-2 §10.7 | a `resolved` ticket |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe within dedup window |

**3. Response Schema** — **Success:** updated `support_tickets` row (`id`, `status=closed`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §3.7/§10.7; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `ticket_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5/§5.6 | actor is User (active org) **or** Support Admin (`staff_can_support`) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | User holds `can_raise_support_ticket`; Support Staff holds `staff_can_support` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **User:** own-org ticket only (else `NOT_FOUND` collapse); **Support Staff:** staff scope | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | ticket is `resolved` (transition `resolved → closed`, terminal); a non-`resolved` ticket cannot be closed | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | `ticket_id` resolves to an existing ticket in scope | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | ticket close only — **no business decision** (transport/record, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup window (`[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — **Actor:** User (opener, own-org) / Admin (Support Staff) · **Authority:** Doc-2 §7; Doc-4A §6/§7.3/§7.5/§5.6 · **Scope:** User → own-org ticket; Support Staff → staff scope · **Restrictions:** both authorities may `resolved → closed` (User on own ticket; Staff in scope); no private-RFQ read for staff · **Cross-tenant:** prohibited · **Protected-fact:** out-of-scope → **`NOT_FOUND`** (§7.5/§12.4).

**6. State Enforcement** — `support_tickets` **`resolved → closed`** (Doc-2 §3.7; `closed` terminal). Only a `resolved` ticket is closable; otherwise `STATE`. `closed → closed` is an idempotent no-op. No state added; sequence unchanged.

**7. Audit Binding** — Audit trigger: ticket close · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record (payload): attribution **User / Support Staff**, `organization_id`, `entity_type=support_tickets`, `entity_id`, `resolved → closed`, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — Consumed: none · Produced: **none** (H.7). Ownership: n/a.

**9. Error Register** — `VALIDATION` (bad id) · `AUTHORIZATION` (no slug / no active context) · `NOT_FOUND` (out-of-scope ticket — protected-fact) · `STATE` (ticket not `resolved`). Optional `CONFLICT` only on a true lost race (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — out-of-scope is `NOT_FOUND`. **`STATE` (ticket not `resolved`) is distinct from `CONFLICT` (lost race).** **`REFERENCE` vs `DEPENDENCY`** distinct. `Timing-Uniformity`: not-in-scope / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → same `closed` result, no duplicate audit; `closed → closed` no-op (terminal; Doc-4A §14.6).

**11. Cross-Module References** — Identity (DH-1); Platform Core audit/outbox (DH-8). No producer entity owned; no score; no procurement decision.

**12. AI-Agent Notes** — Close only a `resolved` ticket → `resolved → closed` (terminal). Non-`resolved` → `STATE` (not `CONFLICT`). Out-of-scope → `NOT_FOUND`. Terminal re-entry (`closed → closed`) is a no-op. Both User (own ticket) and Support Staff (scope) may close. No procurement decision (moat); no Trust score (firewall). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-4.5 — `comm.get_ticket.v1` · `comm.list_tickets.v1` — Ticket Reads

**1. Contract Metadata** — **Contract IDs:** `comm.get_ticket.v1`, `comm.list_tickets.v1` · **Name:** Ticket reads (get one / list) · **Owning BC:** BC-COMM-4 · **Aggregate:** Support Ticket · **Operation Type:** 21.3 Query · **Actor:** User / Admin · **Permission Family:** `can_raise_support_ticket` (own-org) / `staff_can_support` (staff scope); `[ESC-COMM-SLUG]` for any residual read-slug question (no slug invented).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `ticket_id` | uuid | Required (get) | Doc-2 §10.7 | get-by-id |
| `status` | enum(`open`,`in_progress`,`resolved`,`closed`) | Optional (list) | Doc-2 §3.7 | allowlisted filter (Doc-4A §9.6) |
| `page_size` | int | Optional (list) | Doc-4A §18/§22.3 | within POLICY bound (`[ESC-COMM-POLICY]`) |
| `cursor` | string | Optional (list) | Doc-4A §22.3 | keyset pagination |

**3. Response Schema** — **Success (get):** the `support_tickets` row (+ `ticket_messages` per access) if in the actor's scope, else `NOT_FOUND`. **Success (list):** scoped page (`items[]`, `next_cursor`) — User: own-org tickets; Support Staff: staff scope — ordered per Doc-4A §22.3. **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §6/§10.7; Doc-2 §7; Doc-4A §22.3.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields; `page_size` within bound | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5/§5.6 | actor is User (active org) **or** Support Admin (`staff_can_support`) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | User holds `can_raise_support_ticket`; Support Staff holds `staff_can_support` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **get:** ticket in the actor's scope (User own-org / Staff scope) else `NOT_FOUND` collapse. **list:** results restricted to the actor's scope (RLS for User; staff scope for Admin) | `NOT_FOUND` (collapse) — get; scoped result set — list |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — **Actor:** User (own-org) / Admin (Support Staff) · **Authority:** Doc-2 §7 (`can_raise_support_ticket` / `staff_can_support`); Doc-4A §7.3/§7.5/§5.6 · **Scope:** User → own-org tickets; Support Staff → staff scope · **Restrictions:** User cannot read another org's tickets; Support Staff has no private-RFQ read · **Cross-tenant:** prohibited (RLS / staff scope) · **Protected-fact:** out-of-scope get → **`NOT_FOUND`** (Doc-4A §7.5/§12.4); list never enumerates out-of-scope tickets.

**6. State Enforcement** — None (reads do not transition state). Lifecycle unchanged.

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Consumed: none · Produced: none.

**9. Error Register** — `VALIDATION` (bad filter/sort/page_size) · `AUTHORIZATION` (no valid actor context) · `NOT_FOUND` (out-of-scope get — protected-fact collapse).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — an out-of-scope ticket is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm existence). `list` enumerates only the actor's scope. `Timing-Uniformity`: not-in-scope / not-exist identical. `REFERENCE`/`DEPENDENCY`: n/a (in-aggregate read).

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — Identity org/membership/`staff_can_support` resolution (DH-1); Platform Core (DH-8). No producer entity owned; no score computed; no procurement decision.

**12. AI-Agent Notes** — Read-only. **User:** own-org tickets; **Support Staff (`staff_can_support`):** staff scope; **cross-tenant prohibited.** Out-of-scope get → `NOT_FOUND` (protected-fact, never `AUTHORIZATION`); list is scope-restricted. Reads unaudited. Filter only on allowlisted fields (`status`); paginate via keyset. Expose no score (firewall); no procurement signal (moat).

---

## §HB-4.6 — BC-COMM-4 Pass-B Consolidation

**Contract → operation → aggregate → actor → permission → events → audit**

| Contract | Op | Aggregate | Actor | Permission | Events | Audit |
|---|---|---|---|---|---|---|
| `comm.create_ticket.v1` | 21.4 Command | Support Ticket (`support_tickets`) | User | `can_raise_support_ticket` | none | `[ESC-COMM-AUDIT]` |
| `comm.update_ticket.v1` | 21.4 Command | Support Ticket (`support_tickets`) | User / Admin | `can_raise_support_ticket` / `staff_can_support` | none | `[ESC-COMM-AUDIT]` |
| `comm.add_ticket_message.v1` | 21.4 Command | Support Ticket (`ticket_messages`) | User / Admin | `can_raise_support_ticket` / `staff_can_support` | none | `[ESC-COMM-AUDIT]` |
| `comm.close_ticket.v1` | 21.4 Command | Support Ticket (`support_tickets`) | User / Admin | `can_raise_support_ticket` / `staff_can_support` | none | `[ESC-COMM-AUDIT]` |
| `comm.get_ticket.v1` · `comm.list_tickets.v1` | 21.3 Query | Support Ticket | User / Admin | `can_raise_support_ticket` / `staff_can_support` · `[ESC-COMM-SLUG]` | none | none (read) |

**Part-4 invariants (held).** The 6 hardened contracts are the verbatim Pass-A §HA-4.4 / Appendix A rows 14–18 inventory `comm.create_ticket.v1`/`comm.update_ticket.v1`/`comm.add_ticket_message.v1`/`comm.close_ticket.v1`/`comm.get_ticket.v1`/`comm.list_tickets.v1` (**no contract added/renamed/merged/omitted** — the inventory gate passed against frozen Pass-A). BC-COMM-4 owns the **Support Ticket aggregate only** (`support_tickets` + `ticket_messages`) and owns **no** RFQ/procurement discussion (BC-COMM-1 + RFQ), vendor matching/ranking (RFQ — moat), Trust/Performance/Verification/Governance score (Trust — firewall), or Identity (consumed, DH-1). **Emits zero Doc-2 §8 events and consumes none** (single-authorship; support-ticket activity is not a domain event — no coined event). Two Doc-2 §7 authorities only: `can_raise_support_ticket` (opener, own-org) and `staff_can_support` (Support Admin; no private-RFQ read) — **no slug invented**; `[ESC-COMM-SLUG]` carries any residual read-slug question. **Actor→transition authority** is explicit: User → `resolved → closed` (own ticket); Support Staff → `open → in_progress`, `in_progress → resolved`, `resolved → closed`; a User requesting a staff-only transition is `AUTHORIZATION`, an out-of-sequence transition is `STATE`. Every mutation (create, update, add-message, close) carries `[ESC-COMM-AUDIT]` (Doc-2 §9 enumerates no Communication action; no action invented); reads are unaudited. Lifecycle is exactly **`open → in_progress → resolved → closed`** (no state invented; `closed` terminal; `ticket_messages` append-only). Tenant-safe: User own-org via RLS, Support Staff staff scope; out-of-scope access collapses to `NOT_FOUND` (Doc-4A §7.5/§12.4). REFERENCE ≠ DEPENDENCY and STATE ≠ CONFLICT are separated throughout. **Procurement moat:** owns none of matching/routing/ranking/quotation-evaluation/supplier-selection/award (DH-3) — support communications never become procurement decision authority. **Trust firewall:** computes/owns no Trust/Performance/Verification/Governance score (DH-5). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

**Carried markers (unchanged):** DH-1 (Identity — org/membership/`staff_can_support`), DH-8 (Platform Core — audit/outbox/human-ref). `[ESC-COMM-AUDIT]` (every mutation), `[ESC-COMM-POLICY]` (dedup/rate keys), `[ESC-COMM-SLUG]` (residual support read-slug question). Carried, never resolved here — resolution is an additive patch to the owning document and does not reopen the frozen structure.

---

*End of Doc-4H — Pass-B (Hardening) Part 4 v1.0 — BC-COMM-4 Support Communications. Authored against `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4H_Structure_v1.0_FROZEN`. The contract-inventory gate was run against frozen Pass-A §HA-4.4 / Appendix A rows 14–18 before authoring; the six frozen contracts are hardened verbatim — none invented, renamed, merged, or omitted. The owned aggregate is the frozen **Support Ticket** (`support_tickets` + `ticket_messages`; A-04); the brief's "SupportConversation" is recorded as a non-authoritative descriptive label for the same aggregate, and the brief's "Support-ticket ownership ∈ not-owned" is reconciled to Pass-A (BC-COMM-4 owns the support communication records). Hardens to implementation grade (field-level schemas on Doc-2 §10.7, Doc-4A §11.2 nine-stage validation matrices with Stage 8 explicit on the reads, authorization matrices with explicit actor→transition authority, state enforcement, audit bindings, event bindings, error registers with §12.4 Error Boundary blocks + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-COMM-4 owns the Support Ticket aggregate; emits no Doc-2 §8 domain event and consumes none (single-authorship); the lifecycle is exactly `open → in_progress → resolved → closed`; `ticket_messages` is append-only; every mutation binds `[ESC-COMM-AUDIT]` while reads stay unaudited; the slugs are `can_raise_support_ticket`/`staff_can_support` (Doc-2 §7) only; tenant-safe with `NOT_FOUND` protected-fact collapse; the procurement moat and Trust firewall are preserved; Support Communications transports/records, never decides; nothing invented. Carried markers DH-1/DH-8, `[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-SLUG]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*
