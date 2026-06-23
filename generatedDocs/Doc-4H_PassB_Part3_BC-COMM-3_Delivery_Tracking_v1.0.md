# Doc-4H — Communication Engine — Pass-B (Hardening) Part 3 — BC-COMM-3 Delivery Tracking v1.0

| Field | Value |
|---|---|
| Document | `Doc-4H_PassB_Part3_BC-COMM-3_Delivery_Tracking_v1.0` — Pass-B hardening of the BC-COMM-3 (Delivery Tracking) contracts |
| Module | Module 6 — Communication (`communication` schema · `comm_` namespace) |
| Bounded Context | **BC-COMM-3 — Delivery Tracking** |
| Owned Aggregate | **Outbound Log** — single aggregate root; channel structures `email_logs` / `sms_logs` / `whatsapp_logs`; VO **DeliveryStatus**. Tracks delivery outcomes / attempts / provider acknowledgements / provider delivery status / observability. Owns **no** message content (BC-COMM-1), notification content (BC-COMM-2), transport-provider configuration (infra), vendor profiles (Marketplace), Trust scores (Trust), or Billing decisions (Billing). |
| Sole contract authority | `Doc-4H_PassA_v1.0_FROZEN` (HA-4.3 BC-COMM-3 records; Appendix A rows 10–13; HA-6 lifecycle; HA-7/B.6 event inventory; HA-8 DH-1…DH-8) · `Doc-4H_Structure_v1.0_FROZEN` |
| Governing authority (precedence) | Architecture/ADRs (FROZEN) · Doc-2 v1.0.3 · Doc-3 v1.0.2 · Doc-4A/4B/4C/4D/4E/4F/4G v1.0 (FROZEN) · Doc-4H Structure FROZEN · Doc-4H Pass-A FROZEN. On conflict: **FLAG-AND-HALT** (no local resolution). |
| Nature | **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed. BC/aggregate/event/dependency/permission/escalation ownership are exactly as frozen in Pass-A. |

**Contract-inventory gate (pre-authoring, mandatory).** The frozen BC-COMM-3 inventory (`Doc-4H_PassA_v1.0_FROZEN` §HA-4.3; Appendix A rows 10–13) is the four contracts below — `comm.create_delivery_record.v1`, `comm.update_delivery_status.v1`, `comm.retry_delivery.v1`, `comm.get_delivery_status.v1`. This is the **only** authoritative inventory; it is hardened verbatim — **no contract invented, none omitted, none renamed.**

---

## Part-3 hardening conventions (H.1–H.10)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is established before semantic processing (6–9) — a disclosure control (§7.5). Every Validation Matrix row names the **stage**, **source authority**, **rule (validation)**, and **failure class**. For the query contract Stage 8 is present and, where no business rule applies, is stated explicitly as `n/a — read operation`.
- **H.2 — Actors (Doc-4A §5).** **System** for the three write-path contracts — `create_delivery_record` (dispatch job from BC-COMM-2 fan-out), `update_delivery_status` (provider callback), `retry_delivery` (retry job) — each no active org context (Doc-4A §5.2/§15.5). **User / Admin** for `get_delivery_status` (recipient read / Support-Admin read, §5.6).
- **H.3 — Delegation (Doc-4A §6B).** Delivery records are **not delegation-eligible**; Stage 5 is `n/a` on every contract.
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`; codes follow **`comm_<domain>_<code>`** (namespace `comm_`); numeric codes are development-document scope — Pass-B fixes **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable:false`) is distinct from `DEPENDENCY` (an owning service / channel provider / outbox transiently unavailable; `retryable:true`)**; **`STATE` (operation illegal from current delivery state) is distinct from `CONFLICT` (optimistic-concurrency lost race on a status write)** — never merged (Doc-4A §12.2/§12.4; FROZEN Doc-4F P-03/P-01 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract).
- **H.5 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** The three write-path contracts are **System** effects (no slug; no active org — Doc-4A §5.2/§15.5) on Communication's own Outbound Log rows. The read (`get_delivery_status`) is access-scoped: **Recipient (User)** reads **own delivery records only** (records whose recipient is the active org/user); **Support Staff (Admin)** uses **`staff_can_support`** (Doc-2 §7; §5.6, no active org) to read delivery records; **cross-tenant access prohibited**. No distinct §7 recipient-read slug is enumerated → governed by **`[ESC-COMM-SLUG]`** (Doc-2 §7 additive; **no slug invented**). Identity scope/`staff_can_support` resolution is consumed (DH-1, Doc-4C FROZEN). No shadow authorization.
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (System), **object scope** (the channel-log row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority**. Reads are not audited (§17.1). **Doc-2 §9 enumerates no separate Communication / Delivery audit domain** → every BC-COMM-3 mutation (create-record, update-status, retry) carries **`[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**), exactly as frozen in Pass-A HA-9 (row: "BC-COMM-3 mutations (create/update/retry delivery) | `[ESC-COMM-AUDIT]` | Communication | yes").
- **H.7 — Events (Doc-2 §8; single-authorship Doc-4A §4.4).** **BC-COMM-3 emits NO Doc-2 §8 domain event and consumes none** (Doc-4A §16.4 — no event coined). The write-path trigger is the **internal BC-COMM-2 fan-out** (not a Doc-2 §8 event) and the **provider callback** (infra, not a domain event). Delivery outcomes observed from the channel provider are provider acknowledgements (infra signals), **not** Doc-2 §8 domain events; consuming them transfers no event ownership and coins no event. Single-authorship intact.
- **H.8 — Idempotency (Doc-4A §14/§16).** Mutations carry `Idempotency: required`. `create_delivery_record` is keyed on the fan-out unit (`source_event_id` + recipient + channel) — re-dispatch yields the same channel-log row, no duplicate row, no duplicate audit. `update_delivery_status` is idempotent on `(record, provider_ref, target_status)` — a repeated provider callback is a no-op; status only advances forward. `retry_delivery` is bounded by the retry/backoff POLICY (`[ESC-COMM-POLICY]`; **no key invented** — platform default referenced by name). Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Protected-fact collapse (Doc-4A §7.5/§12.4).** On `get_delivery_status`, an actor who is neither the record's recipient nor authorized Support Staff receives **`NOT_FOUND`** (existence never confirmed via `AUTHORIZATION`). `Timing-Uniformity`: not-authorized / not-exist responses identical.
- **H.10 — Neutrality / moat / firewall (Doc-4A §4.4/§4A/§4B).** Delivery Tracking **transports/observes, never decides**. BC-COMM-3 owns **none** of matching / routing / ranking / quotation-evaluation / supplier-selection / award (RFQ — DH-3) and computes/owns **no** Trust / Performance / Verification / Governance score (Trust — DH-5). It owns no message/notification content, no transport-provider configuration, no vendor profile, no Billing decision. A delivery outcome (`delivered`/`failed`) is an observability fact, never a business/eligibility/score signal; push is delivery-only and never substitutes for an owning module's Query (§4A); a paid plan/flag never gates delivery in a way touching trust/eligibility/routing/matching (§4B).

**Per-contract record shape (Pass-B).** Each contract is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Notes.**

**Frozen anchors (verbatim).** Aggregate **Outbound Log** — channel structures `email_logs` / `sms_logs` / `whatsapp_logs` (append-only; **no soft-delete**); VO **DeliveryStatus**. Fields (Doc-2 §10.7): `template`, `status(queued/sent/delivered/failed)`, `provider_ref`; recipient refs; `source_event_id`. Lifecycle (Doc-2 §10.7; Pass-A HA-6): **`queued → sent → delivered | failed`**, with frozen retry **`failed → queued`** (re-dispatch; no new state). Contracts (⊆ Pass-A HA-4.3; Appendix A rows 10–13): `comm.create_delivery_record.v1`, `comm.update_delivery_status.v1`, `comm.retry_delivery.v1`, `comm.get_delivery_status.v1`.

---

## §HB-3.1 — `comm.create_delivery_record.v1` — Create Delivery Record (dispatch)

**1. Contract Metadata** — **Contract ID:** `comm.create_delivery_record.v1` · **Name:** Create Delivery Record (dispatch) · **Owning BC:** BC-COMM-3 · **Aggregate:** Outbound Log (`email_logs`/`sms_logs`/`whatsapp_logs`) · **Operation Type:** 21.5 System · **Actor:** System (no active org context — Doc-4A §5.2/§15.5) · **Permission Family:** none (System job).

**2. Request Schema** *(internal job input from the BC-COMM-2 fan-out — not a public API surface)*

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `source_event_id` | uuid | Required | Doc-2 §10.7 | the originating §8 event id carried through the fan-out (idempotency anchor, H.8) |
| `channel` | enum(`email`,`sms`,`whatsapp`) | Required | Doc-2 §10.7 | selects the channel structure (`email_logs`/`sms_logs`/`whatsapp_logs`) |
| `recipient_ref` | uuid/value | Required | Doc-2 §10.7 | recipient reference for the channel (recipient scope) |
| `template` | text | Required | Doc-2 §10.7 | provider template id; content owned upstream (BC-COMM-2), referenced only |

**3. Response Schema** — **21.5 System: `Response: none`** (consumer/job effect). Internal result: the created channel-log row at `status=queued` (`id`, `channel`, `recipient_ref`, `template`, `status=queued`, `source_event_id`, `created_at`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §10.7; Doc-4A §15.5/§12.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `channel` ∈ enum; `recipient_ref`/`template` present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is **System**; trigger is the internal BC-COMM-2 fan-out unit | `SYSTEM` |
| 3 AUTHZ | Doc-4A §15.5 | System effect — no slug; not user-initiated | — |
| 4 SCOPE | Doc-4A §7.3 | writes Communication's own Outbound Log row for the resolved `recipient_ref` only | — |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §10.7 | n/a — create has no prior state (enters `queued`) | — |
| 7 REFERENCE | Doc-4A §4.5; DH-8 | `source_event_id` carried from the fan-out; provider template resolvable | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | dispatch logging only — **no business decision** (transport, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | dedup on the fan-out unit (`[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — **Actor:** System · **Authority:** Doc-4A §5.2/§15.5 (System; no active org) · **Scope:** writes Communication's own channel-log rows only · **Restrictions:** no user slug; cannot act outside the fan-out effect · **Cross-tenant:** writes the recipient's row as resolved from the fan-out (no cross-tenant authoring) · **Protected-fact:** n/a (no caller-facing existence probe).

**6. State Enforcement** — Creates the channel-structure row at **`queued`** (Doc-2 §10.7). Lifecycle `queued → sent → delivered | failed` (+ retry `failed → queued`); create is the entry transition only. Append-only aggregate; no state invented; no transition added.

**7. Audit Binding** — Audit trigger: delivery-record creation (dispatch) · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by pointer; **no action invented**) · Required audit record: attribution **System**, `recipient_ref` scope, `entity_type=<channel>_logs`, `entity_id`, action, `source_event_id`, timestamp via Doc-4B `core.append_audit_record.v1` (in-transaction).

**8. Event Binding** — **Consumed:** none (Doc-2 §8); trigger is the internal BC-COMM-2 fan-out. **Produced:** **none** (H.7 — BC-COMM-3 emits no Doc-2 §8 event). **Ownership:** n/a — no event ownership touched.

**9. Error Register** — `VALIDATION` (malformed/unknown channel) · `SYSTEM` (non-System invocation) · `REFERENCE` (recipient/template not resolvable — definitive) · `DEPENDENCY` (channel provider / outbox transiently unavailable — `retryable:true`). No `AUTHORIZATION` (System). No `STATE` (create).

**Error Boundary block (Doc-4A §12.4/§12.6):** `REFERENCE` (definitive: recipient/template does not exist; `retryable:false`) is distinct from `DEPENDENCY` (transient: provider/outbox unavailable; `retryable:true`) — never merged (H.4). `Timing-Uniformity`: n/a (no caller-facing existence probe).

**10. Idempotency Rules** — `Idempotency: required`; keyed on the fan-out unit (`source_event_id` + `recipient_ref` + `channel`) — re-dispatch → same channel-log row, **no duplicate row, no duplicate audit**; dedup window `[ESC-COMM-POLICY]` (no key invented).

**11. Cross-Module References** — External channel providers (infra; delivery transport — configuration owned by infra, not BC-COMM-3); Platform Core outbox/audit (DH-8). No producer entity owned; no score computed (DH-5 firewall); no procurement decision (DH-3 moat).

**12. AI-Agent Notes** — System-only dispatch effect from the BC-COMM-2 fan-out; **never user-initiated**. Select the channel structure by `channel`; write at `queued`. Dedup on (`source_event_id`,`recipient_ref`,`channel`). Append-only; never mutate prior rows here. Content/template is referenced, owned upstream (BC-COMM-2) — own no message/notification content. Provider configuration is infra-owned. Compute no score (firewall); make no routing/award decision (moat). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-3.2 — `comm.update_delivery_status.v1` — Update Delivery Status

**1. Contract Metadata** — **Contract ID:** `comm.update_delivery_status.v1` · **Name:** Update Delivery Status · **Owning BC:** BC-COMM-3 · **Aggregate:** Outbound Log · **Operation Type:** 21.5 System · **Actor:** System (provider callback; no active org) · **Permission Family:** none (System).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `delivery_record_id` | uuid | Required | Doc-2 §10.7 | the channel-log row to advance |
| `target_status` | enum(`sent`,`delivered`,`failed`) | Required | Doc-2 §10.7 | forward-only advance per DeliveryStatus |
| `provider_ref` | text | Required | Doc-2 §10.7 | provider acknowledgement reference |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe on repeated callbacks |

**3. Response Schema** — **21.5 System: `Response: none`.** Internal result: the advanced row (`id`, `status`, `provider_ref`). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §10.7; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `delivery_record_id` uuid; `target_status` ∈ {`sent`,`delivered`,`failed`}; `provider_ref` present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is **System**; trigger is the provider callback | `SYSTEM` |
| 3 AUTHZ | Doc-4A §15.5 | System effect — no slug | — |
| 4 SCOPE | Doc-4A §7.3 | operates on the identified Outbound Log row only | — |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §10.7 | forward-only transition `queued → sent → delivered \| failed`; backward/illegal transition (e.g. `delivered → sent`) rejected; repeated same-status callback is an idempotent no-op | `STATE` |
| 7 REFERENCE | Doc-4A §4.5; DH-8 | `delivery_record_id` resolves to an existing channel-log row | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | status observability only — **no business decision** (delivery outcome is an infra fact, never a score/eligibility signal, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | provider-callback handling per `[ESC-COMM-POLICY]` | — |

**5. Authorization Matrix** — **Actor:** System · **Authority:** Doc-4A §5.2/§15.5 · **Scope:** the identified Outbound Log row only · **Restrictions:** no user slug; forward-only status advance · **Cross-tenant:** n/a (System on platform-owned rows) · **Protected-fact:** n/a (no caller-facing probe).

**6. State Enforcement** — `email_logs`/`sms_logs`/`whatsapp_logs` **`queued → sent → delivered | failed`** (Doc-2 §10.7; forward-only). `delivered` and `failed` are terminal for a given attempt (retry is a separate contract). Repeated same-status callback → idempotent no-op. **`STATE`** on a backward/illegal advance; no state added; sequence unchanged.

**7. Audit Binding** — Audit trigger: delivery-status update · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record: attribution **System**, `entity_type=<channel>_logs`, `entity_id`, prior→new status, `provider_ref`, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — **Consumed:** none (Doc-2 §8) — the provider callback is an infra signal, not a domain event (H.7). **Produced:** **none**. **Ownership:** n/a — no event ownership touched; provider acknowledgement coins no Doc-2 §8 event.

**9. Error Register** — `VALIDATION` (bad id/status) · `SYSTEM` (non-System invocation) · `STATE` (illegal/backward transition) · `REFERENCE` (record not found — definitive) · `DEPENDENCY` (provider/outbox transient). Optional `CONFLICT` only on a true optimistic-concurrency lost race on the status write (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** **`STATE` (illegal/backward delivery transition) is distinct from `CONFLICT` (lost concurrency race on the status write)** — never merged. **`REFERENCE` (record does not exist; `retryable:false`) is distinct from `DEPENDENCY` (provider/outbox transiently unavailable; `retryable:true`).** `Timing-Uniformity`: n/a (System contract; no caller-facing existence probe).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14); idempotent on `(delivery_record_id, provider_ref, target_status)` — a repeated provider callback for the same target is a no-op, **no duplicate audit**; status advances forward only (Doc-4A §14.6).

**11. Cross-Module References** — Channel providers (infra; acknowledgement source); Platform Core audit/outbox (DH-8). No producer entity owned; no score; no procurement decision.

**12. AI-Agent Notes** — System-only, driven by the provider callback. Advance status forward only along `queued → sent → delivered | failed`; reject backward transitions (`STATE`, not `CONFLICT`). Idempotent on (`record`,`provider_ref`,`target_status`); repeated callbacks are no-ops. A delivery outcome is an observability fact — never write a Trust/Performance/Verification/Governance score (firewall), never gate any business decision (moat). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-3.3 — `comm.retry_delivery.v1` — Retry Delivery

**1. Contract Metadata** — **Contract ID:** `comm.retry_delivery.v1` · **Name:** Retry Delivery · **Owning BC:** BC-COMM-3 · **Aggregate:** Outbound Log · **Operation Type:** 21.5 System · **Actor:** System (retry job; no active org) · **Permission Family:** none (System).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `delivery_record_id` | uuid | Required | Doc-2 §10.7 | a `failed` channel-log row |
| `idempotency_key` | string | Required | Doc-4A §14 | replay-safe within the retry/backoff window |

**3. Response Schema** — **21.5 System: `Response: none`.** Internal result: the re-dispatched row (`id`, `status=queued`, `attempt_count`/`next_attempt_at` per observability). **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §10.7; Doc-3 §12.2; Doc-4A §12/§14.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `delivery_record_id` uuid | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§15.5 | actor is **System**; trigger is the retry job | `SYSTEM` |
| 3 AUTHZ | Doc-4A §15.5 | System effect — no slug | — |
| 4 SCOPE | Doc-4A §7.3 | operates on the identified Outbound Log row only | — |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §10.7 | record is `failed` (transition `failed → queued` re-dispatch); non-`failed` record is not retryable | `STATE` |
| 7 REFERENCE | Doc-4A §4.5; DH-8 | `delivery_record_id` resolves to an existing channel-log row | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §4.4 | retry orchestration only — **no business decision** (transport, never decide, H.10) | — |
| 9 POLICY | Doc-3 §12.2 | retry/backoff bound + max-attempt cap (`[ESC-COMM-POLICY]`) | `RATE_LIMITED` (retry budget exhausted) |

**5. Authorization Matrix** — **Actor:** System · **Authority:** Doc-4A §5.2/§15.5 · **Scope:** the identified Outbound Log row only · **Restrictions:** no user slug; retries only a `failed` record within POLICY budget · **Cross-tenant:** n/a (System) · **Protected-fact:** n/a.

**6. State Enforcement** — `email_logs`/`sms_logs`/`whatsapp_logs` **`failed → queued`** re-dispatch (Doc-2 §10.7; Pass-A HA-4.3 — **no new state**; re-enters the existing `queued`). Only a `failed` record is retryable; otherwise `STATE`. After re-dispatch the normal `queued → sent → delivered | failed` advance applies (via `update_delivery_status`). No state invented.

**7. Audit Binding** — Audit trigger: delivery retry · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record: attribution **System**, `entity_type=<channel>_logs`, `entity_id`, `failed → queued`, attempt counter, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — **Consumed:** none (Doc-2 §8). **Produced:** **none** (H.7). **Ownership:** n/a.

**9. Error Register** — `VALIDATION` (bad id) · `SYSTEM` (non-System invocation) · `STATE` (record not `failed`) · `REFERENCE` (record not found — definitive) · `DEPENDENCY` (provider/outbox transient) · `RATE_LIMITED` (retry/backoff budget exhausted — Doc-4A §12). Optional `CONFLICT` only on a true lost race (distinct from `STATE`).

**Error Boundary block (§12.4/§12.6):** **`STATE` (record not in `failed`) is distinct from `CONFLICT` (lost concurrency race).** **`REFERENCE` (record does not exist) is distinct from `DEPENDENCY` (provider/outbox transient; `retryable:true`).** `RATE_LIMITED` (budget) is distinct from `DEPENDENCY` (transient infra). `Timing-Uniformity`: n/a (System contract).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + retry/backoff window (`[ESC-COMM-POLICY]`); replay within window → single re-dispatch, **no duplicate audit**, no duplicate provider send; attempts bounded by the max-attempt cap (Doc-4A §14.6).

**11. Cross-Module References** — Channel providers (infra; re-dispatch); Platform Core audit/outbox (DH-8); Doc-3 §12.2 retry POLICY (`[ESC-COMM-POLICY]`). No producer entity; no score; no procurement decision.

**12. AI-Agent Notes** — System-only retry of a `failed` record → `failed → queued` (no new state). Non-`failed` is not retryable (`STATE`). Respect the retry/backoff + max-attempt POLICY (`[ESC-COMM-POLICY]`); budget exhaustion → `RATE_LIMITED`. Idempotent within the window — one re-dispatch, no duplicate send/audit. Compute no score (firewall); make no business decision (moat). Bind `[ESC-COMM-AUDIT]` in-transaction.

---

## §HB-3.4 — `comm.get_delivery_status.v1` — Get Delivery Status

**1. Contract Metadata** — **Contract ID:** `comm.get_delivery_status.v1` · **Name:** Get Delivery Status · **Owning BC:** BC-COMM-3 · **Aggregate:** Outbound Log · **Operation Type:** 21.3 Query · **Actor:** User (recipient) / Admin (Support Staff) · **Permission Family:** access-scoped — Recipient: own records only; Support Staff: `staff_can_support` (Doc-2 §7); governing marker `[ESC-COMM-SLUG]` (no slug invented).

**2. Request Schema**

| Field | Type | Req/Opt | Authority | Constraints |
|---|---|---|---|---|
| `delivery_record_id` | uuid | Required (get) | Doc-2 §10.7 | get-by-id |
| `source_event_id` | uuid | Optional (filter) | Doc-2 §10.7 | filter delivery records for a notification's fan-out (allowlisted) |
| `channel` | enum(`email`,`sms`,`whatsapp`) | Optional (filter) | Doc-2 §10.7 | allowlisted filter |
| `page_size` | int | Optional | Doc-4A §18/§22.3 | within POLICY bound (`[ESC-COMM-POLICY]`) |
| `cursor` | string | Optional | Doc-4A §22.3 | keyset pagination |

**3. Response Schema** — **Success:** the delivery record(s) — `id`, `channel`, `status(queued/sent/delivered/failed)`, `provider_ref`, `template`, timestamps — visible only within the actor's scope (recipient own-records / Support-Admin), else `NOT_FOUND`. **Failure:** Doc-4A §12 envelope. **Authority:** Doc-2 §10.7; Doc-2 §7 (`staff_can_support`); Doc-4A §7.5/§12.4/§22.3.

**4. Validation Matrix** *(canonical nine-stage)*

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields; `page_size` within bound | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5/§5.6 | actor is User (active org/user) **or** Support Admin (`staff_can_support`, no active org — §5.6) | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; `[ESC-COMM-SLUG]` | **Recipient:** own delivery records only (no distinct §7 read slug; none invented). **Support Staff:** `staff_can_support` (Doc-2 §7) | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **Recipient:** record's recipient = active org/user, else `NOT_FOUND` collapse. **Support Staff:** delivery records in staff scope. **Cross-tenant: prohibited** | `NOT_FOUND` (collapse) |
| 5 DELEGATION | Doc-4A §6B | n/a — not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §10.7 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — **Actor:** User (recipient) / Admin (Support Staff) · **Authority:** Doc-2 §7 (`staff_can_support`) + `[ESC-COMM-SLUG]`; Doc-4A §7.3/§7.5/§5.6 · **Scope:** Recipient → own delivery records only; Support Staff → delivery records in staff scope · **Restrictions:** Recipient cannot read another tenant's records; Support Staff has no active-org/private-tenant content beyond delivery status · **Cross-tenant:** **prohibited** (RLS / scope) · **Protected-fact:** unauthorized → **`NOT_FOUND`** (Doc-4A §7.5/§12.4; existence not disclosed).

**6. State Enforcement** — None (read does not transition state). Lifecycle unchanged.

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Consumed: none · Produced: none.

**9. Error Register** — `VALIDATION` (bad filter/sort/page_size) · `AUTHORIZATION` (no valid actor context) · `NOT_FOUND` (unauthorized / non-recipient — protected-fact collapse).

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a record outside the actor's scope is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm existence). `Timing-Uniformity`: not-authorized / not-exist identical. `REFERENCE`/`DEPENDENCY`: n/a (in-aggregate read).

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure query, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — Identity scope / `staff_can_support` (DH-1); Platform Core (DH-8). No producer entity owned; no score computed; no procurement decision.

**12. AI-Agent Notes** — Read-only delivery status. **Recipient:** own records only; **Support Staff (`staff_can_support`):** delivery records in staff scope; **cross-tenant prohibited.** Unauthorized/non-recipient → `NOT_FOUND` (protected-fact, never `AUTHORIZATION`). Reads are unaudited. Filter only on allowlisted fields (`source_event_id`,`channel`); paginate via keyset. Delivery status is observability only — expose no score (firewall), no procurement signal (moat).

---

## §HB-3.5 — BC-COMM-3 Pass-B Consolidation

**Contract → operation → aggregate → actor → permission → events → audit**

| Contract | Op | Aggregate | Actor | Permission | Events | Audit |
|---|---|---|---|---|---|---|
| `comm.create_delivery_record.v1` | 21.5 System | Outbound Log (`<channel>_logs`) | System | none (System) | none | `[ESC-COMM-AUDIT]` |
| `comm.update_delivery_status.v1` | 21.5 System | Outbound Log | System | none (System) | none | `[ESC-COMM-AUDIT]` |
| `comm.retry_delivery.v1` | 21.5 System | Outbound Log | System | none (System) | none | `[ESC-COMM-AUDIT]` |
| `comm.get_delivery_status.v1` | 21.3 Query | Outbound Log | User / Admin | Recipient own-records · Support Staff `staff_can_support` · `[ESC-COMM-SLUG]` | none | none (read) |

**Part-3 invariants (held).** The 4 hardened contracts are the verbatim Pass-A §HA-4.3 / Appendix A rows 10–13 inventory `comm.create_delivery_record.v1`/`comm.update_delivery_status.v1`/`comm.retry_delivery.v1`/`comm.get_delivery_status.v1` (**no contract added/renamed/omitted** — the inventory gate passed against frozen Pass-A). BC-COMM-3 owns the **Outbound Log aggregate only** (channel structures `email_logs`/`sms_logs`/`whatsapp_logs`; VO DeliveryStatus) and owns **no** message content (BC-COMM-1) / notification content (BC-COMM-2) / transport-provider configuration (infra) / vendor profile (Marketplace) / Trust score (Trust) / Billing decision (Billing). **Emits zero Doc-2 §8 events and consumes none** — the write-path triggers are the internal BC-COMM-2 fan-out and the infra provider callback; provider acknowledgements are infra signals, not domain events, and transfer no event ownership (single-authorship intact). The three write-path contracts are **System** effects (no slug); the read is access-scoped — Recipient own-records / Support Staff `staff_can_support` (Doc-2 §7) under `[ESC-COMM-SLUG]` (no slug invented), cross-tenant prohibited, unauthorized → `NOT_FOUND` (Doc-4A §7.5/§12.4). Every mutation (create, update-status, retry) carries `[ESC-COMM-AUDIT]` (Doc-2 §9 enumerates no Communication action; no action invented); the read is unaudited. Lifecycle is exactly **`queued → sent → delivered | failed`** with frozen retry **`failed → queued`** (append-only; no state invented). REFERENCE ≠ DEPENDENCY and STATE ≠ CONFLICT are separated throughout; `RATE_LIMITED` (retry budget) is distinct from `DEPENDENCY`. **Procurement moat:** owns none of matching/routing/ranking/quotation-evaluation/supplier-selection/award (DH-3). **Trust firewall:** computes/owns no Trust/Performance/Verification/Governance score (DH-5) — a delivery outcome is an observability fact, never a score/eligibility signal. **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

**Carried markers (unchanged):** DH-1 (Identity — scope/`staff_can_support`), DH-8 (Platform Core — audit/outbox); external channel providers are infra (transport; configuration not owned by BC-COMM-3). `[ESC-COMM-AUDIT]` (every mutation), `[ESC-COMM-POLICY]` (dispatch dedup / retry-backoff / page-size keys), `[ESC-COMM-SLUG]` (recipient delivery-read slug). Carried, never resolved here — resolution is an additive patch to the owning document and does not reopen the frozen structure.

---

*End of Doc-4H — Pass-B (Hardening) Part 3 v1.0 — BC-COMM-3 Delivery Tracking. Authored against `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4H_Structure_v1.0_FROZEN`. The contract-inventory gate was run against frozen Pass-A §HA-4.3 / Appendix A rows 10–13 before authoring; the four frozen contracts are hardened verbatim — none invented, none omitted. Hardens to implementation grade (field-level schemas on Doc-2 §10.7, Doc-4A §11.2 nine-stage validation matrices with Stage 8 explicit on the query, authorization matrices, state enforcement, audit bindings, event bindings, error registers with §12.4 Error Boundary blocks + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-COMM-3 owns the Outbound Log aggregate; emits no Doc-2 §8 domain event and consumes none (write-path triggers are the internal fan-out + infra provider callback; provider acknowledgements are infra signals, not domain events — no ownership transfer; single-authorship); the lifecycle is exactly `queued → sent → delivered | failed` with retry `failed → queued`; the three write-path contracts are System effects, the read is recipient/`staff_can_support`-scoped with `NOT_FOUND` collapse; every mutation binds `[ESC-COMM-AUDIT]` while the read stays unaudited; the procurement moat and Trust firewall are preserved; Delivery Tracking transports/observes, never decides; nothing invented. Carried markers DH-1/DH-8, `[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-SLUG]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*
