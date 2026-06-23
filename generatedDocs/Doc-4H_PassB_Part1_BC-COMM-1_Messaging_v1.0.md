# Doc-4H — Communication Engine — Pass-B (Hardening) Part 1 v1.0 — BC-COMM-1 Messaging

## BC-COMM-1 — Messaging Hardening (HA-4.1)

| Field | Value |
|---|---|
| Document | Doc-4H — **Pass-B Part 1 v1.0** — Module 6 Communication (`communication` schema, `comm_` namespace) |
| Part scope | **BC-COMM-1 — Messaging (HA-4.1)** — the 5 Pass-A messaging contracts (Thread aggregate), hardened to implementation grade. |
| Status | **Pass-B Part 1 draft — implementation-grade contract specification for BC-COMM-1.** Independently reviewable. Suitable for Hard Review → Patch → Patch Verification → Freeze Audit. |
| Contract authority | `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority; **not revisited, not redesigned, not reopened**) |
| Structure authority | `Doc-4H_Structure_v1.0_FROZEN` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v1.0, Doc-4H_Structure_v1.0_FROZEN, Doc-4H_PassA_Content_v1.0 — all FROZEN |
| Part scope (this Part) | `comm.create_thread.v1` · `comm.get_thread.v1` · `comm.list_threads.v1` · `comm.send_message.v1` · `comm.get_messages.v1` |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 1).** Convert the 5 Pass-A BC-COMM-1 messaging contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A. **Communication neutrality** is preserved: Messaging **transports, never decides** — it owns **no** matching/routing/ranking/quotation-evaluation/supplier-selection/award (RFQ — DH-3) and computes/owns **no** Trust/Performance/Verification/Governance score (Trust — DH-5). Carried markers **DH-1, DH-3, DH-8** (the BC-COMM-1 seams) and **`[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt**.

**Recorded reconciliation — validation-stage vocabulary (no Flag-and-Halt breach; frozen authority governs).** The Part-1 authoring brief restated the canonical validation order as "`1 SYNTAX · 2 SHAPE · 3 SEMANTIC · 4 AUTHENTICATION · 5 AUTHORIZATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`." The **frozen authority** Doc-4A §11.2 fixes the canonical nine-stage order as **`1 SYNTAX · 2 CONTEXT · 3 AUTHZ · 4 SCOPE · 5 DELEGATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`** (FIXED, "never reordered"). On a conflict between a restated list and the frozen source, **the frozen Doc-4A §11.2 order governs** (Doc-4A §0.6 flag-and-halt), exactly as the FROZEN Doc-4F Pass-B precedents did. No stage invented, none reordered.

---

## §H — Part-1 Hardening Conventions (stated once; bound by pointer per contract)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule (validation)**, and the **failure class** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `uuid[]`/`string[]` (arrays; cardinality stated), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR §6B delegation (stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C §C3/§C8; no shadow authorization). **BC-COMM-1 scope = thread participant** — a `thread_participants` grant row (`active`) for the actor's org/user. The sole Doc-2 §7 slug is **`can_use_messaging`** (all active members; participation via `thread_participants`). Messaging is **not delegation-eligible** (Doc-4A §6B — participation is a membership-scoped action; no representative-org scenario). **Cross-tenant: a non-participant collapses to `NOT_FOUND`** (§7.5; §12.4).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`comm_<domain>_<code>`** (Appendix B namespace `comm_`); numeric codes are development-document scope — Pass-B fixes the **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable: false`) is distinct from `DEPENDENCY` (an owning service / Realtime backing transiently unavailable; `retryable: true`)**; **`STATE` (operation illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4; FROZEN Doc-4F P-03/P-01 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract). No POLICY-limit (Category 9) applies in Part 1 unless a contract states one.
- **H.5 — State machine (Doc-2 §3.7/§10.7; Doc-4A §13).** The BC-COMM-1 lifecycles are: **`threads` → `open → closed`** (Doc-2 §3.7/§10.7; `closed` terminal); **`messages` → append-only** (soft-delete = hidden; no status machine); **`thread_participants` → `active → removed`** (grant). Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — `close_thread` asserts `expected_status`; a lost race → `CONFLICT` (Doc-4A §14). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §3.7/§10.7 edges only. *(Participant grant/remove and close_thread are BC-COMM-1 contracts hardened in a later Part; this Part covers create/read/send/read-messages.)*
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User`), **object scope** (the `communication.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). **Doc-2 §9 enumerates no separate Communication / Thread / Message audit domain** → every BC-COMM-1 mutation carries **`[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**), exactly as frozen in Pass-A HA-9.
- **H.7 — Events (Doc-2 §8).** **BC-COMM-1 emits NO Doc-2 §8 domain event** and **consumes none** (Pass-A HA-7; single-authorship Doc-4A §4.4 — emitters own event production; Communication owns notification consumer effects authored in BC-COMM-2, not here; Doc-4A §16.4 — no event coined). Recipient notification of a message is a **BC-COMM-2 effect** (a notification derived from state), **not** a BC-COMM-1 event. No 21.2 integration contract authored.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `communication`/`comm` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-COMM-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate row, no duplicate audit**. Queries (21.3) are idempotent and side-effect-free (`Idempotency: not-applicable`, Doc-4A §14.1).
- **H.9 — Tenancy, scope & boundary (Doc-2 §6/§10.7; Doc-4A §7.3/§7.5).** `threads`/`messages` are **shared by participants via the `thread_participants` grant** — never disclosed to a non-participant; a non-participant reference collapses to `NOT_FOUND` (§7.5; §12.4). Soft-deleted messages are hidden. **DH-3 RFQ scrub seam (one mechanism, from Pass-A):** on an `rfq_clarification` thread, BC-COMM-1 **reads the RFQ-owned raw-contact-scrub rule via the RFQ service and applies it content-side at message-write** — the rule definition stays in RFQ/Doc-3; **Communication holds no copy and makes no procurement decision**. **`context_id` (`rfq_id`) is a bare UUID reference (DH-3)** — Messaging owns no RFQ entity. **Firewall:** Messaging computes/owns no Trust/Performance/Verification/Governance score (DH-5); references Trust/RFQ context by UUID only.
- **H.10 — `communication` BC-COMM-1 field source (Doc-2 §10.7).** The hardened schemas bind to the frozen Doc-2 §10.7 columns; **Pass-B introduces no column** — it binds existing ones:
  - `threads`: `thread_type enum<direct|rfq_clarification>`, `context_type`, `context_id` (e.g., `rfq_id` for clarification), `status enum<open|closed>` (shared via `thread_participants`; soft-delete = close).
  - `messages`: → `threads`; `sender_user_id`, `sender_organization_id`, `body`, `attachments_refs`, `sent_at` (append-only; soft-delete = hidden; Realtime-backed).
  - `thread_participants`: → `threads`; `participant_organization_id`, `participant_user_id`, `status enum<active|removed>`; PK (`thread_id`, `participant_organization_id`).

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Notes.**

---

## §HB-1.1 — `comm.create_thread.v1` — Create Thread

**1. Contract Metadata** — Contract ID `comm.create_thread.v1` · Contract Name: Create Thread · Owning BC **BC-COMM-1** · Aggregate **Thread** (`threads`) · Operation **21.4 Command** · Actor **User** (active member) · Permission family **`can_use_messaging`** (Doc-2 §7).

**2. Request Schema**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `thread_type` | `enum<direct\|rfq_clarification>` | yes | Doc-2 §10.7 | fixed enum; `rfq_clarification` requires `context_id` |
| `context_type` | `string` | no | Doc-2 §10.7 | context discriminator (e.g., `rfq`) |
| `context_id` | `uuid` | conditional (required for `rfq_clarification`) | Doc-2 §10.7; DH-3 | bare UUID (`rfq_id`); service-validated; no cross-schema FK |
| `participant_organization_ids` | `uuid[]` | yes | Doc-2 §10.7 | initial participants (≥1; the creator's org included); grant rows created `active` |

**3. Response Schema** — **Success:** `thread_id : uuid`, `thread_type : enum<direct|rfq_clarification>`, `status : enum<open|closed> = open`, `reference_id : uuid` (Doc-4A §22.1). **Failure:** Doc-4A §12 envelope (`error_class, error_code, message, field_errors, retryable, reference_id`).

**4. Validation Matrix**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `thread_type` ∈ enum; `participant_organization_ids` non-empty array; `context_id` present when `rfq_clarification` | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds `can_use_messaging` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3 | creator's org is among `participant_organization_ids` (creates the thread it participates in) | `AUTHORIZATION` |
| 5 DELEGATION | Doc-4A §6B | n/a — messaging not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | n/a — create has no prior state (enters `open`) | — |
| 7 REFERENCE | Doc-4A §4.5; DH-3 | for `rfq_clarification`, `context_id` (`rfq_id`) resolves via the RFQ service; `participant_organization_ids` resolve via Identity (DH-1) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-3 (clarification channel) | rfq_clarification thread is the sanctioned channel (Doc-3); no procurement decision made here | — |
| 9 POLICY | Doc-3 §12.2 | none | — |

**5. Authorization Matrix** — Actor **User** · Authority **`can_use_messaging`** (Doc-2 §7) · Scope = creator's org (must be a participant) · Restrictions: not delegation-eligible · Cross-tenant: a non-resolvable participant org → `REFERENCE`/`NOT_FOUND` (no existence disclosure) · Enforcement Identity `check_permission` (Doc-4C).

**6. State Enforcement** — Applicable states: **none** (creation) · Allowed transition: → **`open`** (Doc-2 §3.7 entry) · Forbidden: n/a · Concurrency: new row; the `thread_participants` grant rows created `active` in the same transaction.

**7. Audit Binding** — Audit trigger: thread creation · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by pointer; **no action invented**) · Required audit record: attribution `User`, `organization_id`, `entity_type=threads`, `entity_id`, action, timestamp (Doc-2 §9 fields) via Doc-4B `core.append_audit_record.v1` (in-transaction).

**8. Event Binding** — Consumed: **none** · Produced: **none** (H.7 — BC-COMM-1 emits no Doc-2 §8 event) · Ownership: n/a.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `thread_type`; empty participants; missing `context_id` on clarification) | false |
| `AUTHORIZATION` | actor/context/slug/scope fail (member without slug, or creator not a participant) | false |
| `REFERENCE` | `context_id` (`rfq_id`) or a participant org does not resolve (definitive negative) | false |
| `DEPENDENCY` | RFQ/Identity/Doc-4B service transiently unavailable / no definitive answer (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** `REFERENCE` (definitive) and `DEPENDENCY` (transient) are distinct (H.4). A non-resolvable participant/`context_id` is `REFERENCE`, not an existence-confirming `AUTHORIZATION`. `Timing-Uniformity`: not applicable (no participant-thread existence probe at create).

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → same `thread_id`, no duplicate row, no duplicate audit. A genuinely new create with a different idempotency key is a new thread (no business-uniqueness constraint on threads — Doc-4A §14.6).

**11. Cross-Module References** — **Identity (DH-1):** active-org/membership resolution + `check_permission` + participant org resolution. **RFQ (DH-3):** `context_id` (`rfq_id`) reference for `rfq_clarification` (read-only; no procurement decision; scrub rule read at message-write, §HB-1.4). **Platform Core (DH-8):** audit-write, Realtime backing. **No ownership transfer.**

**12. AI-Agent Notes** — Ownership: BC-COMM-1 owns the Thread; `context_id` (`rfq_id`) is a **bare UUID reference** (DH-3), never an RFQ entity. Authority: `can_use_messaging`; creator must be a participant. Lifecycle: thread enters `open`; participant grants created `active`. Authorization: cross-tenant participant non-resolution → `REFERENCE`. Dependency: read RFQ context by service for `rfq_clarification`; **make no procurement decision** (moat); reference no Trust score (firewall). No event emitted.

---

## §HB-1.2 — `comm.get_thread.v1` · `comm.list_threads.v1` — Thread Reads

**1. Contract Metadata** — Contract IDs `comm.get_thread.v1`, `comm.list_threads.v1` · Contract Name: Thread Reads · Owning BC **BC-COMM-1** · Aggregate **Thread** (`threads`) · Operation **21.3 Query** · Actor **User** (participant) · Permission family **`can_use_messaging`** (participant-scoped).

**2. Request Schema** — *`get_thread`:* `thread_id : uuid (required)`. *`list_threads`:* `filter : object{ thread_type?, status?, context_id? } (optional; allowlisted fields only, Doc-4A §9.6)`; `page_size : numeric (optional; bounded by POLICY key §18 — `[ESC-COMM-POLICY]`)`; `page_token : string (optional; Doc-4A §22.3)`.

**3. Response Schema** — **Success:** *`get_thread`:* `thread : object{ thread_id, thread_type, context_type, context_id, status }`, `reference_id`. *`list_threads`:* `items : list<object{ thread_id, thread_type, status }>`, `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**4. Validation Matrix**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9/§9.6 | presence/type; only allowlisted filter/sort fields | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_use_messaging` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | **get:** actor's org/user has an `active` `thread_participants` grant on the thread (else `NOT_FOUND` collapse). **list:** results restricted to threads the actor participates in (RLS via `thread_participants`) | `NOT_FOUND` (collapse) — get; scoped result set — list |
| 5 DELEGATION | Doc-4A §6B | n/a (not delegation-eligible) | — |
| 6 STATE | Doc-2 §3.7 | none (read) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — Actor **User** · Authority **`can_use_messaging`** · Scope = participant threads only (`thread_participants` grant) · Restrictions: not delegation-eligible · Cross-tenant: a non-participant thread → `NOT_FOUND` (collapse; existence not disclosed) · Enforcement Identity `check_permission`.

**6. State Enforcement** — None (read). Returns thread state as-is; soft-deleted threads/messages hidden.

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Consumed: none · Produced: none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad filter/sort; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without slug) | false |
| `NOT_FOUND` | actor is not a participant of the target thread (protected-fact collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-participant thread is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm existence). `list` enumerates only the actor's participant threads. `Timing-Uniformity`: not-participant / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure queries, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — **Identity (DH-1):** context + `check_permission` + participant resolution. **Platform Core (DH-8):** none beyond read infrastructure. **No ownership transfer.**

**12. AI-Agent Notes** — Strictly **participant-scoped**; a non-participant gets `NOT_FOUND` (never reveal a thread's existence to a non-participant — §7.5). `list` returns only the actor's threads. Reads disclose no RFQ/Trust authority — `context_id` is an opaque reference. No audit, no event.

---

## §HB-1.3 — `comm.send_message.v1` — Send Message

**1. Contract Metadata** — Contract ID `comm.send_message.v1` · Contract Name: Send Message · Owning BC **BC-COMM-1** · Aggregate **Thread** (`messages`) · Operation **21.4 Command** · Actor **User** (participant) · Permission family **`can_use_messaging`** (participant-scoped).

**2. Request Schema**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `thread_id` | `uuid` | yes | Doc-2 §10.7 | target thread (actor must be an `active` participant) |
| `body` | `text` | yes | Doc-2 §10.7 | message body; on `rfq_clarification` threads the RFQ-owned scrub rule is applied content-side (DH-3) |
| `attachments_refs` | `uuid[]` | no | Doc-2 §10.7 | attachment references (storage refs; Doc-4B — DH-8) |

**3. Response Schema** — **Success:** `message_id : uuid`, `thread_id : uuid`, `sent_at : timestamptz`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope.

**4. Validation Matrix**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `thread_id` uuid; `body` non-empty text | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_use_messaging` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | actor's org/user has an `active` `thread_participants` grant on `thread_id` | `NOT_FOUND` (collapse, H.9) |
| 5 DELEGATION | Doc-4A §6B | n/a (not delegation-eligible) | — |
| 6 STATE | Doc-2 §3.7 | thread is `open` (a message cannot be sent to a `closed` thread) | `STATE` |
| 7 REFERENCE | Doc-4A §4.5; DH-8 | `attachments_refs` (if present) resolve at storage | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-3; DH-3 | on an `rfq_clarification` thread, the **RFQ-owned raw-contact-scrub rule is read via the RFQ service and applied content-side** (rule definition stays in RFQ; Communication holds no copy; no procurement decision) | `BUSINESS` (content rejected by the RFQ-owned rule) |
| 9 POLICY | Doc-3 §12.2 | none (rate/anti-spam limits, if any, carry `[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — Actor **User** · Authority **`can_use_messaging`** · Scope = `active` participant of `thread_id` · Restrictions: not delegation-eligible; cannot send to a `closed` thread (`STATE`) · Cross-tenant: a non-participant → `NOT_FOUND` · Enforcement Identity `check_permission`.

**6. State Enforcement** — Applicable states: parent thread `open` · Allowed: append a `messages` row (Doc-2 §3.7 append-only) while thread `open` · Forbidden: send to `closed` thread → `STATE` · Concurrency: message append is additive (no row-revision race on the message); soft-delete = hidden (not a state machine).

**7. Audit Binding** — Audit trigger: message send · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (no §9 Communication action; nearest by pointer; no action invented) · Required audit record: attribution `User`, `organization_id`, `entity_type=messages`, `entity_id`, action, timestamp via Doc-4B (in-transaction).

**8. Event Binding** — Consumed: **none** · Produced: **none** (H.7 — message send emits no Doc-2 §8 event; **recipient notification is a BC-COMM-2 effect derived from state, not a BC-COMM-1 event**). Ownership: n/a.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (missing/empty `body`; bad `thread_id`) | false |
| `AUTHORIZATION` | context/slug fail (member without slug) | false |
| `NOT_FOUND` | actor not a participant of `thread_id` (protected-fact collapse, H.9) | false |
| `STATE` | thread is `closed` (message send illegal) | false |
| `REFERENCE` | `attachments_refs` do not resolve at storage (definitive negative) | false |
| `BUSINESS` | content rejected by the RFQ-owned raw-contact-scrub rule (rfq_clarification) | false |
| `DEPENDENCY` | RFQ scrub-rule service / storage / Doc-4B / Realtime transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-participant is `NOT_FOUND`. `STATE` (closed thread) is distinct from `CONFLICT`; `REFERENCE` (attachment not found) distinct from `DEPENDENCY` (scrub-service/storage transient). `Timing-Uniformity`: not-participant / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → one `messages` row, no duplicate audit. A genuinely new message with a different idempotency key is a new append (append-only by design — Doc-2 §3.7).

**11. Cross-Module References** — **RFQ (DH-3):** on `rfq_clarification`, **read the RFQ-owned scrub rule by service, apply content-side** — rule stays RFQ; **no procurement decision** (moat). **Platform Core (DH-8):** storage (`attachments_refs`), audit-write, Realtime delivery. **Identity (DH-1):** participant resolution. **Trust (DH-5):** none — Messaging computes/references no score (firewall). **No ownership transfer.**

**12. AI-Agent Notes** — Append-only message; **never overwrite**; soft-delete = hidden. Thread must be `open` (`STATE` if `closed`). On `rfq_clarification`, **read the RFQ-owned scrub rule via the RFQ service and apply content-side** — the rule is RFQ's; Communication makes no procurement decision and holds no copy (moat protection). **No event emitted** — recipient notification is BC-COMM-2's derived effect. Participant-scope only; collapse to `NOT_FOUND` for non-participants. Reference no Trust score (firewall).

---

## §HB-1.4 — `comm.get_messages.v1` — Get Messages

**1. Contract Metadata** — Contract ID `comm.get_messages.v1` · Contract Name: Get Messages · Owning BC **BC-COMM-1** · Aggregate **Thread** (`messages`) · Operation **21.3 Query** · Actor **User** (participant) · Permission family **`can_use_messaging`** (participant-scoped).

**2. Request Schema** — `thread_id : uuid (required)`; `page_size : numeric (optional; bounded by POLICY key §18 — `[ESC-COMM-POLICY]`)`; `page_token : string (optional; Doc-4A §22.3)`.

**3. Response Schema** — **Success:** `items : list<object{ message_id, sender_user_id, sender_organization_id, body, attachments_refs, sent_at }>` (soft-deleted hidden), `next_page_token : string (nullable)`, `reference_id`. **Failure:** Doc-4A §12 envelope.

**4. Validation Matrix**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `thread_id` uuid; `page_size` within bound | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7 | membership holds `can_use_messaging` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | actor's org/user has an `active` `thread_participants` grant on `thread_id`; results scoped to that thread | `NOT_FOUND` (collapse, H.9) |
| 5 DELEGATION | Doc-4A §6B | n/a (not delegation-eligible) | — |
| 6 STATE | Doc-2 §3.7 | none (read; messages readable on `open` or `closed` threads for participants) | — |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |

**5. Authorization Matrix** — Actor **User** · Authority **`can_use_messaging`** · Scope = `active` participant of `thread_id` · Restrictions: not delegation-eligible · Cross-tenant: a non-participant → `NOT_FOUND` (collapse) · Enforcement Identity `check_permission`.

**6. State Enforcement** — None (read). Soft-deleted messages hidden; participants may read messages of `open` or `closed` threads.

**7. Audit Binding** — **None** (reads not audited — Doc-4A §17.1).

**8. Event Binding** — Consumed: none · Produced: none.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `thread_id`; `page_size` out of bound) | false |
| `AUTHORIZATION` | context/slug fail (member without slug) | false |
| `NOT_FOUND` | actor not a participant of `thread_id` (protected-fact collapse, H.9) | false |
| `SYSTEM` | unexpected | true |

**Error Boundary block (§12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-participant gets `NOT_FOUND`; messages of a thread the actor does not participate in are never enumerated or revealed. `Timing-Uniformity`: not-participant / not-exist identical.

**10. Idempotency Rules** — `Idempotency: not-applicable` (pure query, Doc-4A §14.1); side-effect-free; pagination per Doc-4A §22.3.

**11. Cross-Module References** — **Identity (DH-1):** context + `check_permission` + participant resolution. **Platform Core (DH-8):** storage retrieval for `attachments_refs`; Realtime. **No ownership transfer.**

**12. AI-Agent Notes** — Strictly **participant-scoped**; non-participant → `NOT_FOUND` (never reveal a thread's messages or existence — §7.5). Soft-deleted messages are hidden. Reads disclose no RFQ/Trust authority. No audit, no event.

---

## Appendix A — BC-COMM-1 Part-1 Contract Register (Pass-B)

| § | Contract-ID | Operation | Aggregate | Actor | Permission | Emits event | Audit |
|---|---|---|---|---|---|---|---|
| §HB-1.1 | `comm.create_thread.v1` | 21.4 Command | Thread (`threads`) | User | `can_use_messaging` | none | `[ESC-COMM-AUDIT]` |
| §HB-1.2 | `comm.get_thread.v1` · `comm.list_threads.v1` | 21.3 Query | Thread | User | `can_use_messaging` (participant) | none | none (read) |
| §HB-1.3 | `comm.send_message.v1` | 21.4 Command | Thread (`messages`) | User | `can_use_messaging` (participant) | none | `[ESC-COMM-AUDIT]` |
| §HB-1.4 | `comm.get_messages.v1` | 21.3 Query | Thread (`messages`) | User | `can_use_messaging` (participant) | none | none (read) |

**Part-1 invariants (held):** the 5 hardened contracts are the verbatim Pass-A `comm.create_thread.v1`/`comm.get_thread.v1`/`comm.list_threads.v1`/`comm.send_message.v1`/`comm.get_messages.v1` (no contract added/renamed); BC-COMM-1 owns the Thread aggregate only; **emits zero Doc-2 §8 events** and consumes none (single-authorship; recipient notification is BC-COMM-2's derived effect); binds the single Doc-2 §7 slug `can_use_messaging` (no slug invented); every mutation carries `[ESC-COMM-AUDIT]` (Doc-2 §9 enumerates no Communication action; no action invented); carries `[ESC-COMM-POLICY]` for dedup-window/page-size keys; lifecycles are exactly `threads open→closed` / `messages` append-only / `thread_participants active→removed` (no state invented); **the RFQ-owned scrub rule is read by service and applied content-side (DH-3) — Messaging owns no RFQ authority and makes no procurement decision**; computes/owns no Trust/Performance/Verification/Governance score (DH-5). REFERENCE vs DEPENDENCY and STATE vs CONFLICT are separated throughout. **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.**

---

## Appendix B — Carried Markers (Part 1; unchanged)

- **DH-1** (Identity — `check_permission`/org-context/participant resolution, consumed), **DH-3** (RFQ — `context_id` reference + scrub-rule read by service, content-side; no procurement decision), **DH-8** (Platform Core — audit-write, storage, Realtime).
- **`[ESC-COMM-AUDIT]`** (Doc-2 §9 additive) — every BC-COMM-1 mutation (create thread, send message): Doc-2 §9 enumerates no Communication action; nearest action bound by pointer; no action invented.
- **`[ESC-COMM-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key, list/messages `page_size` bound, and any message rate/anti-spam limit (no `communication` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-COMM-SLUG]`** (Doc-2 §7 additive) — not required in this Part (all messaging contracts bind `can_use_messaging`); carried for the module.
- **`[ESC-COMM-EVENT]`** (Doc-2 §8 additive) — BC-COMM-1 produces no §8 event; carried for the module.

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4H — Pass-B (Hardening) Part 1 v1.0 — BC-COMM-1 Messaging. Authored against `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority) and `Doc-4H_Structure_v1.0_FROZEN`. Hardens the 5 Pass-A messaging contracts to implementation grade (field-level schemas, Doc-4A §11.2 nine-stage validation matrices, authorization matrices, state enforcement, audit bindings, event bindings, error registers with §12.4 Error Boundary blocks + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-COMM-1 owns the Thread aggregate; emits no Doc-2 §8 domain event and consumes none (single-authorship; recipient notification is BC-COMM-2's derived effect); the lifecycles are exactly `threads open→closed` / `messages` append-only / `thread_participants active→removed`; the RFQ-owned raw-contact-scrub rule is read by service and applied content-side (DH-3) with no procurement decision; Messaging computes/owns no Trust/Performance/Verification/Governance score (DH-5); the procurement moat and Trust firewall are preserved; Communication transports, never decides; nothing invented. Carried markers DH-1/DH-3/DH-8, `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]` travel unchanged. Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN.*
