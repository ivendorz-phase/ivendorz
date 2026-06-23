# Doc-4H — Communication Engine — Pass-B (Hardening) Part 2 — BC-COMM-2 Notifications v1.0

| Field | Value |
|---|---|
| Document | `Doc-4H_PassB_Part2_BC-COMM-2_Notifications_v1.0` — Pass-B hardening of the BC-COMM-2 (Notifications) contracts |
| Module | Module 6 — Communication (`communication` schema · `comm_` namespace) |
| Bounded Context | **BC-COMM-2 — Notifications** |
| Owned Aggregate | **Notification** (`notifications`) — in-app, user-visible notification records + lifecycle. Owns **no** message content (BC-COMM-1), delivery transport / email-SMS-WhatsApp logs (BC-COMM-3), or support content (BC-COMM-4). |
| Sole contract authority | `Doc-4H_PassA_v1.0_FROZEN` (HA-4.2 BC-COMM-2 records; HA-6 lifecycle; HA-7/B.6 event inventory; HA-8 DH-1…DH-8) · `Doc-4H_Structure_v1.0_FROZEN` |
| Governing authority (precedence) | Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A/4B/4C/4D/4E/4F/4G v1.0 (FROZEN) · Doc-4H Structure FROZEN · Doc-4H Pass-A FROZEN. On conflict: **FLAG-AND-HALT** (no local resolution). |
| Nature | **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. BC/aggregate/event/dependency/permission/escalation ownership are exactly as frozen in Pass-A. |

---

## Part-2 hardening conventions (H.1–H.10)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is established before semantic processing (6–9) — a disclosure control (§7.5). Every Validation Matrix row names the **stage**, **source authority**, **rule (validation)**, and **failure class**. For query contracts Stage 8 is present and, where no business rule applies, is stated explicitly as `n/a — read operation`.
- **H.2 — Actors (Doc-4A §5).** **System** for `comm.create_notification.v1` (consumed-event effect; no active org context — Doc-4A §5.2/§15.5). **User** (recipient) for the reads and the state commands. No Admin surface in BC-COMM-2.
- **H.3 — Delegation (Doc-4A §6B).** Notifications are **not delegation-eligible**; Stage 5 is `n/a` on every contract.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`; codes follow **`comm_<domain>_<code>`** (namespace `comm_`); numeric codes are development-document scope — Pass-B fixes **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable:false`) is distinct from `DEPENDENCY` (an owning service / outbox / Realtime transiently unavailable; `retryable:true`)**; **`STATE` (operation illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4; FROZEN Doc-4F P-03/P-01 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract).
- **H.5 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Recipient-scoped access — a notification is visible/mutable only to its recipient (`recipient_user_id` / `recipient_organization_id` = active user/org), enforced via RLS on `organization_id` (Doc-2 §10.7). **No distinct Doc-2 §7 read/state slug is enumerated for notifications** → governed by **`[ESC-COMM-SLUG]`** (Doc-2 §7 additive; **no slug invented**). Identity org/user/active-org resolution is consumed (DH-1, Doc-4C FROZEN). No shadow authorization. `comm.create_notification.v1` is a System effect (no slug; no active org).
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution**, **object scope** (the `notifications` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority**. Reads are not audited (§17.1). **Doc-2 §9 enumerates no separate Communication / Notification audit domain** → every BC-COMM-2 mutation (create-notification, mark-read, archive) carries **`[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**), exactly as frozen in Pass-A HA-9.
- **H.7 — Events (Doc-2 §8; single-authorship Doc-4A §4.4).** **BC-COMM-2 emits NO Doc-2 §8 domain event** (Doc-4A §16.4 — no event coined). It **consumes** the Doc-2 §8 catalog of every producing module (B.6) and creates the notification effect idempotently (Doc-4A §16). **The producing module owns each consumed event; consuming it to create a notification transfers no event ownership.** Single-authorship is intact: the emitter authors event production; Communication authors only its own consumer/fan-out effect. `VendorInvited` is co-consumed independently by Operations.
- **H.8 — Idempotency (Doc-4A §14/§16).** Mutations carry `Idempotency: required`. **`comm.create_notification.v1`** is **event-consumer idempotent** — the inbound `source_event_id` (the Doc-2 §8 event id) is the natural dedup key: re-delivery of the same event yields the same `notifications` row, no duplicate row, no duplicate audit (Doc-4A §16; exactly-once effect over at-least-once delivery). State commands replay within a dedup window (`[ESC-COMM-POLICY]`; **no key invented** — platform default referenced by name). Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Protected-fact collapse (Doc-4A §7.5/§12.4).** A non-recipient accessing a notification by id receives **`NOT_FOUND`** (existence never confirmed via `AUTHORIZATION`); lists enumerate only the actor's own notifications. `Timing-Uniformity`: not-recipient / not-exist responses are identical.
- **H.10 — Neutrality / moat / firewall (Doc-4A §4.4/§4A/§4B).** Notifications **transport, never decide**. BC-COMM-2 owns **none** of matching / routing / ranking / quotation-evaluation / supplier-selection / award (RFQ — DH-3) and computes/owns **no** Trust / Performance / Verification / Governance score (Trust — DH-5) — score-derived events are consumed for notification **text only**. Notification preferences/rules are **Identity-owned**, consumed read-only (DH-1). Push is delivery-only and never substitutes for the owning module's Query (§4A); a paid plan/flag never gates delivery in a way touching trust/eligibility/routing/matching (§4B).

**Per-contract record shape (Pass-B).** Each contract is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Notes.**

**Frozen anchors (verbatim).** Aggregate **Notification** (`notifications`). Fields (Doc-2 §10.7): `recipient_user_id`, `recipient_organization_id`, `source_event_id`, `channel(in_app)`, `title`, `body`, `payload_jsonb`, `read_at`; RLS `organization_id`; soft-delete = archive. Lifecycle (Doc-2 §3.7/§10.7): **`unread → read → archived`** (terminal `archived`). Contracts to harden (⊆ Pass-A HA-4.2): `comm.create_notification.v1`, `comm.get_notification.v1`, `comm.list_notifications.v1`, `comm.mark_notification_read.v1`, `comm.archive_notification.v1`.

---

## §HB-2.1 — `comm.create_notification.v1` — Create Notification (consumed-event effect)

**1. Contract Metadata** — **Contract ID:** `comm.create_notification.v1` · **Name:** Create Notification · **Owning BC:** BC-COMM-2 · **Aggregate:** Notification (`notifications`) · **Operation Type:** 21.5 System (consumed-event effect) · **Actor:** System (no active org context — Doc-4A §5.2/§15.5) · **Permission Family:** none (System; no slug).

**2. Request Schema** *(internal consumer input, not a public API surface — driven by a consumed Doc-2 §8 event)*

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `source_event_id` | uuid | Required | Doc-2 §10.7; §8 | the inbound Doc-2 §8 event id — natural idempotency key (H.8) |
| `recipient_user_id` | uuid | Required* | Doc-2 §10.7 | recipient user; resolved from the event + Identity notification rules (DH-1) |
| `recipient_organization_id` | uuid | Required | Doc-2 §10.7 | recipient org (RLS scope) |
| `channel` | enum(`in_app`) | Required | Doc-2 §10.7 | BC-COMM-2 owns the **in-app** record; email/SMS/WhatsApp transport is BC-COMM-3 |
| `title` | text | Required | Doc-2 §10.7 | derived from event type per Identity-owned rules (DH-1); no business decision |
| `body` | text | Required | Doc-2 §10.7 | rendered notification text; consumes producer/Trust outputs as text only (H.10) |
| `payload_jsonb` | jsonb | Optional | Doc-2 §10.7 | structured references by UUID (e.g. `rfq_id`); own no producer entity |

*Recipient resolution follows the Identity-owned notification rules (DH-1, read-only); fan-out across recipients is orchestrated, one `notifications` row per recipient.

**3. Response Schema** — **Success:** the created/idempotently-returned `notifications` row (`id`, `source_event_id`, `recipient_*`, `channel`, `title`, `body`, `payload_jsonb`, `status=unread`, `created_at`) — internal handler result. **Failure:** Doc-4A §12 envelope (`error_class, error_code, message, field_errors, retryable, reference_id`). **Authority:** Doc-2 §10.7; Doc-4A §12.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `source_event_id` uuid; `channel = in_app`; `title`/`body` non-empty | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is **System** (no active org context); inbound is a recognized Doc-2 §8 event | `SYSTEM` |
| 3 AUTHZ | Doc-4A §15.5 | System effect — no slug; not user-initiated (no `can_*` check) | — |
| 4 SCOPE | Doc-4A §7.3 | recipient resolution (`recipient_organization_id` / `recipient_user_id`) per Identity rules (DH-1) | `REFERENCE` (recipient unresolved) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | n/a — create has no prior state (enters `unread`) | — |
| 7 REFERENCE | Doc-4A §4.5; DH-2…DH-7 | `source_event_id` is a valid consumed §8 event; `payload_jsonb` UUIDs reference producer entities by id (own none) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4/§16 | notification derivation only — **no business decision** is made (transport, never decide, H.10); event ownership stays with the producer | — |
| 9 POLICY | Doc-3 §12.2 | dedup window on `source_event_id` (`[ESC-COMM-POLICY]`); fan-out per Identity-owned rules | — |

**5. Authorization Matrix** — **Actor:** System · **Authority:** Doc-4A §5.2/§15.5 (System; no active org) · **Scope:** writes Communication's own `notifications` rows only · **Restrictions:** no user slug; cannot act outside the consumed-event effect · **Cross-tenant:** writes the recipient's `organization_id` as resolved from the event (no cross-tenant authoring) · **Protected-fact:** n/a (no caller-facing existence probe).

**6. State Enforcement** — Creates `notifications` at **`unread`** (Doc-2 §3.7). Lifecycle `unread → read → archived`; create is the entry transition only. No state invented; no transition added.

**7. Audit Binding** — Audit trigger: notification creation · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by pointer; **no action invented**) · Required audit record: attribution **System**, `recipient_organization_id`, `entity_type=notifications`, `entity_id`, action, `source_event_id`, timestamp via Doc-4B `core.append_audit_record.v1` (in-transaction).

**8. Event Binding** — **Consumed:** the Doc-2 §8 catalog (B.6) — RFQ/Marketplace/Trust/Operations/Admin/Billing events (DH-2…DH-7), idempotent (Doc-4A §16). **Produced:** **none** (H.7 — BC-COMM-2 emits no Doc-2 §8 event). **Ownership:** the **producing module owns each consumed event**; creating a notification transfers no event ownership (single-authorship intact).

**9. Error Register** — `VALIDATION` (malformed event/fields) · `SYSTEM` (unrecognized event / non-System invocation) · `REFERENCE` (recipient or referenced entity not resolvable — definitive) · `DEPENDENCY` (Identity-rules / outbox / Realtime transiently unavailable — `retryable:true`). No `AUTHORIZATION` (System effect). No `STATE` (create).

**Error Boundary block (Doc-4A §12.4/§12.6):** `REFERENCE` (definitive: recipient/entity does not exist; `retryable:false`) is distinct from `DEPENDENCY` (transient: owning service/outbox unavailable; `retryable:true`) — never merged (H.4). `Timing-Uniformity`: n/a (no caller-facing existence probe).

**10. Idempotency Rules** — `Idempotency: required`; **event-consumer idempotent on `source_event_id`** (Doc-4A §16) — re-delivery of the same §8 event → same `notifications` row, **no duplicate row, no duplicate audit** (exactly-once effect over at-least-once delivery); dedup window `[ESC-COMM-POLICY]` (no key invented).

**11. Cross-Module References** — Producing modules' §8 events: Marketplace (DH-2), RFQ (DH-3), Operations (DH-4), Trust (DH-5), Billing (DH-6), Admin (DH-7); Identity notification rules/recipient resolution (DH-1, read-only); Platform Core outbox/audit/Realtime (DH-8). Owns no producer entity; computes no score (DH-5 firewall); makes no procurement decision (DH-3 moat).

**12. AI-Agent Notes** — System-only effect from a consumed §8 event; **never user-initiated**. Dedup strictly on `source_event_id` (exactly-once over at-least-once). **Producer owns the event; Communication owns only the notification row.** Derive `title`/`body` from Identity-owned rules (DH-1) — never compute a Trust/Performance/Verification/Governance score (firewall), never make a routing/matching/award decision (moat). One row per recipient on fan-out; channel here is `in_app` only (email/SMS/WhatsApp transport is BC-COMM-3). Enters `unread`. Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-2.2 — `comm.get_notification.v1` · `comm.list_notifications.v1` — Notification Reads

**1. Contract Metadata** — **Contract IDs:** `comm.get_notification.v1`, `comm.list_notifications.v1` · **Name:** Notification reads (get one / list recipient's) · **Owning BC:** BC-COMM-2 · **Aggregate:** Notification · **Operation Type:** 21.3 Query · **Actor:** User (recipient) · **Permission Family:** recipient-scoped (`[ESC-COMM-SLUG]` — no distinct §7 slug; no slug invented).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `notification_id` | uuid | Required (get) | Doc-2 §10.7 | get-by-id |
| `status` | enum(`unread`,`read`,`archived`) | Optional (list) | Doc-2 §3.7 | filter; allowlisted field only (Doc-4A §9.6) |
| `page_size` | int | Optional (list) | Doc-4A §18/§22.3 | within POLICY bound (`[ESC-COMM-POLICY]`) |
| `cursor` | string | Optional (list) | Doc-4A §22.3 | keyset pagination |

**3. Response Schema** — **Success (get):** the `notifications` row if the actor is the recipient (else `NOT_FOUND`). **Success (list):** recipient-scoped page (`items[]`, `next_cursor`), ordered per Doc-4A §22.3, restricted to the actor's own notifications (RLS). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §6/§10.7; Doc-4A §22.3.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields; `page_size` within bound | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org/user context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; `[ESC-COMM-SLUG]` | recipient-scoped access (no distinct §7 read slug; no slug invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **get:** actor is the recipient (`recipient_user_id`/`recipient_organization_id` = active user/org) else `NOT_FOUND` collapse. **list:** results restricted to the actor's own notifications (RLS on `organization_id`) | `NOT_FOUND` (collapse) — get; scoped result set — list |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — **Actor:** User (recipient) · **Authority:** Doc-2 §7 + `[ESC-COMM-SLUG]`; Doc-4A §7.3/§7.5 · **Scope:** own notifications only (recipient = active user/org) · **Restrictions:** non-recipient sees nothing; no Admin/staff read surface in BC-COMM-2 · **Cross-tenant:** prohibited (RLS `organization_id`) · **Protected-fact:** non-recipient get → **`NOT_FOUND`** (Doc-4A §7.5/§12.4); list never enumerates another recipient's rows.

**6. State Enforcement** — None (reads do not transition state). Lifecycle unchanged.

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Consumed: none · Produced: none.

**9. Error Register** — `VALIDATION` (bad filter/sort/page_size) · `AUTHORIZATION` (no active context) · `NOT_FOUND` (non-recipient get — protected-fact collapse).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-recipient notification is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm existence). `list` enumerates only the actor's own notifications. `Timing-Uniformity`: not-recipient / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — Identity org/user/active-org resolution (DH-1). No producer entity owned; no score computed; no procurement decision.

**12. AI-Agent Notes** — Recipient-scope only; collapse to `NOT_FOUND` for non-recipients on get; list is RLS-restricted to the actor's own rows. Reads are unaudited. No state change. Filter only on allowlisted fields (`status`); paginate via keyset.

---

## §HB-2.3 — `comm.mark_notification_read.v1` — Mark Notification Read

**1. Contract Metadata** — **Contract ID:** `comm.mark_notification_read.v1` · **Name:** Mark Notification Read · **Owning BC:** BC-COMM-2 · **Aggregate:** Notification (`notifications`) · **Operation Type:** 21.4 Command · **Actor:** User (recipient) · **Permission Family:** recipient-scoped (`[ESC-COMM-SLUG]`).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `notification_id` | uuid | Required | Doc-2 §10.7 | the recipient's own notification |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe within dedup window |

**3. Response Schema** — **Success:** updated row (`id`, `status=read`, `read_at`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §3.7/§10.7; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `notification_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org/user context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; `[ESC-COMM-SLUG]` | recipient-scoped (no distinct §7 slug; none invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | actor is the recipient of `notification_id` else `NOT_FOUND` collapse (H.9) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | notification is `unread` (transition `unread → read`); already-`read` is idempotent no-op; `archived` cannot be marked read | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — recipient state change only; no business rule (transport, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup window (`[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — **Actor:** User (recipient) · **Authority:** Doc-2 §7 + `[ESC-COMM-SLUG]`; Doc-4A §7.3/§7.5 · **Scope:** own notification only · **Restrictions:** cannot mark another recipient's notification · **Cross-tenant:** prohibited (RLS) · **Protected-fact:** non-recipient → **`NOT_FOUND`** (§7.5/§12.4).

**6. State Enforcement** — `notifications` **`unread → read`** (Doc-2 §3.7). Sets `read_at`. `read → read` is an idempotent no-op; `archived` is terminal and cannot transition to `read` (`STATE`). No state added; sequence unchanged.

**7. Audit Binding** — Audit trigger: mark-read · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record: attribution **User**, `recipient_organization_id`, `entity_type=notifications`, `entity_id`, action, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — Consumed: none · Produced: **none** (H.7 — no Doc-2 §8 event).

**9. Error Register** — `VALIDATION` (bad id) · `AUTHORIZATION` (no active context) · `NOT_FOUND` (non-recipient — protected-fact) · `STATE` (archived → read illegal). Optional `CONFLICT` only on a true optimistic-concurrency lost race (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — non-recipient is `NOT_FOUND`. **`STATE` (illegal-from-`archived`) is distinct from `CONFLICT` (lost concurrency race)** — never merged. `REFERENCE`/`DEPENDENCY`: n/a (in-aggregate). `Timing-Uniformity`: not-recipient / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → same `read` result, **no duplicate audit**; `read → read` is a no-op (Doc-4A §14.6).

**11. Cross-Module References** — Identity (DH-1). No producer entity; no score; no procurement decision.

**12. AI-Agent Notes** — Recipient-only state change `unread → read`; set `read_at`. `NOT_FOUND` for non-recipients. Idempotent replay → no duplicate audit. `archived` cannot become `read` (`STATE`, not `CONFLICT`). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-2.4 — `comm.archive_notification.v1` — Archive Notification

**1. Contract Metadata** — **Contract ID:** `comm.archive_notification.v1` · **Name:** Archive Notification · **Owning BC:** BC-COMM-2 · **Aggregate:** Notification (`notifications`) · **Operation Type:** 21.4 Command · **Actor:** User (recipient) · **Permission Family:** recipient-scoped (`[ESC-COMM-SLUG]`).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `notification_id` | uuid | Required | Doc-2 §10.7 | the recipient's own notification |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe within dedup window |

**3. Response Schema** — **Success:** updated row (`id`, `status=archived`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §3.7/§10.7; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `notification_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org/user context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; `[ESC-COMM-SLUG]` | recipient-scoped (no distinct §7 slug; none invented) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | actor is the recipient of `notification_id` else `NOT_FOUND` collapse (H.9) | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | notification is `read` (transition `read → archived`; **archive allowed only from `read`** per the frozen linear lifecycle); `unread → archived` is illegal (mark read first); already-`archived` is an idempotent no-op (terminal) | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — recipient state change only; no business rule (transport, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup window (`[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — **Actor:** User (recipient) · **Authority:** Doc-2 §7 + `[ESC-COMM-SLUG]`; Doc-4A §7.3/§7.5 · **Scope:** own notification only · **Restrictions:** cannot archive another recipient's notification · **Cross-tenant:** prohibited (RLS) · **Protected-fact:** non-recipient → **`NOT_FOUND`** (§7.5/§12.4).

**6. State Enforcement** — `notifications` **`read → archived`** (Doc-2 §3.7; `archived` terminal — soft-delete). **Archive is allowed only from `read`** per the frozen strict-linear lifecycle `unread → read → archived`; a notification must be marked read (`comm.mark_notification_read.v1`) before it can be archived. **`unread → archived` is illegal** (`STATE`). `archived → archived` is an idempotent no-op. No state added; no transition invented; sequence unchanged (the frozen `unread → read → archived` linear path; archive is the soft-delete terminal reachable only from `read`).

**7. Audit Binding** — Audit trigger: archive · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record: attribution **User**, `recipient_organization_id`, `entity_type=notifications`, `entity_id`, action, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — Consumed: none · Produced: **none** (H.7 — no Doc-2 §8 event).

**9. Error Register** — `VALIDATION` (bad id) · `AUTHORIZATION` (no active context) · `NOT_FOUND` (non-recipient — protected-fact) · `STATE` (no illegal-source transition under the terminal rule). Optional `CONFLICT` only on a true optimistic-concurrency lost race (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — non-recipient is `NOT_FOUND`. **`STATE` is distinct from `CONFLICT`** — never merged. `REFERENCE`/`DEPENDENCY`: n/a (in-aggregate). `Timing-Uniformity`: not-recipient / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → same `archived` result, **no duplicate audit**; `archived → archived` is a no-op (terminal; Doc-4A §14.6).

**11. Cross-Module References** — Identity (DH-1). No producer entity; no score; no procurement decision.

**12. AI-Agent Notes** — Recipient-only soft-delete to `archived` (terminal). **Archive is reachable only from `read`** (frozen strict-linear lifecycle `unread → read → archived`); an `unread` notification must first be marked read (`comm.mark_notification_read.v1`) — **`unread → archived` is illegal** (`STATE`). `NOT_FOUND` for non-recipients. Idempotent replay / re-archive → no duplicate audit. Terminal-state re-entry (`archived → archived`) is a no-op (`STATE` only for a genuinely illegal source, distinct from `CONFLICT`). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-2.5 — BC-COMM-2 Pass-B Consolidation

**Contract → operation → aggregate → actor → permission → events → audit**

| Contract | Op | Aggregate | Actor | Permission | Events | Audit |
|---|---|---|---|---|---|---|
| `comm.create_notification.v1` | 21.5 System | Notification (`notifications`) | System | none (System) | **consumes** §8 catalog (B.6); produces none | `[ESC-COMM-AUDIT]` |
| `comm.get_notification.v1` · `comm.list_notifications.v1` | 21.3 Query | Notification | User (recipient) | recipient-scope (`[ESC-COMM-SLUG]`) | none | none (read) |
| `comm.mark_notification_read.v1` | 21.4 Command | Notification (`notifications`) | User (recipient) | recipient-scope (`[ESC-COMM-SLUG]`) | none | `[ESC-COMM-AUDIT]` |
| `comm.archive_notification.v1` | 21.4 Command | Notification (`notifications`) | User (recipient) | recipient-scope (`[ESC-COMM-SLUG]`) | none | `[ESC-COMM-AUDIT]` |

**Part-2 invariants (held).** The 5 hardened contracts are the verbatim Pass-A `comm.create_notification.v1`/`comm.get_notification.v1`/`comm.list_notifications.v1`/`comm.mark_notification_read.v1`/`comm.archive_notification.v1` (no contract added/renamed); BC-COMM-2 owns the **Notification aggregate only** (`notifications`) and owns **no** message content / delivery transport / email-SMS-WhatsApp logs (BC-COMM-1/BC-COMM-3). **Emits zero Doc-2 §8 events**; **consumes** the §8 catalog (B.6) idempotently — **the producing module owns every consumed event; the notification effect is Communication's own and transfers no event ownership** (single-authorship intact). Recipient-scoped access governed by `[ESC-COMM-SLUG]` (no slug invented); non-recipient access collapses to `NOT_FOUND` (Doc-4A §7.5/§12.4). Every mutation (create, mark-read, archive) carries `[ESC-COMM-AUDIT]` (Doc-2 §9 enumerates no Communication action; no action invented); reads are unaudited. Lifecycle is exactly **`notifications unread → read → archived`** (no state invented; `archived` terminal/soft-delete). `comm.create_notification.v1` is **event-consumer idempotent on `source_event_id`** (exactly-once effect over at-least-once delivery). REFERENCE ≠ DEPENDENCY and STATE ≠ CONFLICT are separated throughout. **Procurement moat:** owns none of matching/routing/ranking/quotation-evaluation/supplier-selection/award (DH-3). **Trust firewall:** computes/owns no Trust/Performance/Verification/Governance score (DH-5) — score-derived events consumed as notification text only. Notification preferences/rules are Identity-owned, consumed read-only (DH-1). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

**Carried markers (unchanged):** DH-1 (Identity), DH-2 (Marketplace), DH-3 (RFQ), DH-4 (Operations), DH-5 (Trust — firewall), DH-6 (Billing), DH-7 (Admin), DH-8 (Platform Core); `[ESC-COMM-AUDIT]` (every mutation), `[ESC-COMM-POLICY]` (dedup window), `[ESC-COMM-SLUG]` (recipient read/state slug), `[ESC-COMM-EVENT]` (none today). Carried, never resolved here — resolution is an additive patch to the owning document and does not reopen the frozen structure.

---

*End of Doc-4H — Pass-B (Hardening) Part 2 v1.0 — BC-COMM-2 Notifications. Authored against `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4H_Structure_v1.0_FROZEN`. Hardens the 5 Pass-A notification contracts to implementation grade (field-level schemas on Doc-2 §10.7, Doc-4A §11.2 nine-stage validation matrices with Stage 8 explicit on queries, authorization matrices, state enforcement, audit bindings, event bindings, error registers with §12.4 Error Boundary blocks + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-COMM-2 owns the Notification aggregate; emits no Doc-2 §8 domain event and consumes the §8 catalog idempotently with producer ownership preserved (single-authorship); the lifecycle is exactly `notifications unread → read → archived`; `create_notification` is event-consumer idempotent on `source_event_id`; recipient-scope with `NOT_FOUND` collapse; every mutation binds `[ESC-COMM-AUDIT]` while reads stay unaudited; the procurement moat and Trust firewall are preserved; Communication transports, never decides; nothing invented. Carried markers DH-1…DH-8, `[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-SLUG]`/`[ESC-COMM-EVENT]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*
