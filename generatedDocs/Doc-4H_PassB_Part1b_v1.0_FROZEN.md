# Doc-4H_PassB_Part1b_v1.0_FROZEN — BC-COMM-1 Participant & Close (FROZEN Consolidation)

| Freeze Metadata | Value |
|---|---|
| Status | **FROZEN** |
| Source | `Doc-4H_PassB_Part1b_BC-COMM-1_Participant_And_Close_v1.0` |
| Freeze Authority | `Doc-4H_PassB_Part1b_Freeze_Audit_v1.0` |
| Board Status | **APPROVED FOR FREEZE** |
| Hard Review | `Doc-4H_PassB_Part1b_Independent_Hard_Review_v1.0` — PASS (0 BLOCKER / 0 MAJOR / 0 MINOR / 0 NITPICK) |
| Freeze References | `Doc-4H_Structure_v1.0_FROZEN` · `Doc-4H_PassA_v1.0_FROZEN` · `Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0` (FROZEN) · BC-COMM-2/3/4 (FROZEN) · `Doc-4H_Module6_Consolidated_PassB_Review_v2.0` |
| Clears | **F-MOD6-M1** (BC-COMM-1 contract-complete: 7 of 7) · records-completion item **F-FINAL-MIN1** of `Doc-4H_Final_Freeze_Audit_v1.0` |
| Consolidation rule | Mechanical merge — source body preserved byte-for-byte; only this freeze header and the closing freeze-approval footer are added; no contract content (ownership, validation, schemas, audit bindings, dependencies, idempotency, AI-agent notes, lifecycle, authorization) modified. |

---

# Doc-4H — Communication Engine — Pass-B (Hardening) Part 1b v1.0 — BC-COMM-1 Participant & Close

## BC-COMM-1 — Messaging Hardening (HA-4.1) — Participant Grant/Remove & Close Thread

| Field | Value |
|---|---|
| Document | Doc-4H — **Pass-B Part 1b v1.0** — Module 6 Communication (`communication` schema, `comm_` namespace) |
| Part scope | **BC-COMM-1 — Messaging (HA-4.1)** — the **3 deferred Pass-A messaging contracts** (Thread aggregate): `comm.add_thread_participant.v1`, `comm.remove_thread_participant.v1`, `comm.close_thread.v1`, hardened to implementation grade. Completes the BC-COMM-1 Pass-B set begun in Part 1 (which hardened the 5 core messaging contracts). |
| Status | **Pass-B Part 1b draft — implementation-grade contract specification for BC-COMM-1.** Independently reviewable. Suitable for Hard Review → Patch → Patch Verification → Freeze Audit. |
| Clears | **F-MOD6-M1 (MAJOR)** of `Doc-4H_Module6_Consolidated_PassB_Review_v1.0` — the three frozen BC-COMM-1 contracts deferred by Part 1 (H.5) and never authored; on freeze, BC-COMM-1 is contract-complete (7 of 7) and the module consolidation is re-run. |
| Contract authority | `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority; **not revisited, not redesigned, not reopened**) as amended by `Doc-4H_PassA_Patch_v1.0` (which does not touch these three contracts) |
| Structure authority | `Doc-4H_Structure_v1.0_FROZEN` |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0, Doc-4F v1.0, Doc-4G v1.0, Doc-4H_Structure_v1.0_FROZEN, Doc-4H_PassA_Content_v1.0, Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0 — all FROZEN |
| Part scope (this Part) | `comm.add_thread_participant.v1` · `comm.remove_thread_participant.v1` · `comm.close_thread.v1` |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA — **implementation-ready, no architecture interpretation required** |

**Pass-B mission (Part 1b).** Convert the 3 deferred Pass-A BC-COMM-1 messaging contracts into **implementation-grade** contracts: field-level request/response schemas, per-field validation matrices on the Doc-4A §11.2 nine-stage order, authorization matrices, state enforcement, audit bindings, event bindings, error registers (Doc-4A §12 closed class set), idempotency rules. **Pass-B hardens; it does not redesign.** No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created or changed; ownership, lifecycle, events, permissions, audit actions, and domain boundaries are exactly as frozen in Pass-A. These three contracts drive **only** the frozen Thread edges already enumerated in Doc-2 §3.7/§10.7 — `threads open → closed` and `thread_participants active → removed` — so no new lifecycle is implied (per F-MOD6-M1, additive completeness only). **Communication neutrality** is preserved: Messaging **transports, never decides** — it owns **no** matching/routing/ranking/quotation-evaluation/supplier-selection/award (RFQ — DH-3) and computes/owns **no** Trust/Performance/Verification/Governance score (Trust — DH-5). Carried markers **DH-1, DH-8** (the BC-COMM-1 seams for these three contracts) and **`[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]`** travel unchanged. On any required detail absent from the corpus: **flag-and-halt**.

**Recorded reconciliation — validation-stage vocabulary (no Flag-and-Halt breach; frozen authority governs).** The authoring brief restated the canonical validation order as "`1 SYNTAX · 2 CONTEXT · 3 AUTHZ · 4 SCOPE · 5 DELEGATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`." The **frozen authority** Doc-4A §11.2 fixes the canonical nine-stage order as **`1 SYNTAX · 2 CONTEXT · 3 AUTHZ · 4 SCOPE · 5 DELEGATION · 6 STATE · 7 REFERENCE · 8 BUSINESS · 9 POLICY`** (FIXED, "never reordered") — the brief's list matches it exactly. The frozen Doc-4A §11.2 order governs (Doc-4A §0.6 flag-and-halt), exactly as the FROZEN Doc-4F/Part-1 Pass-B precedents did. No stage invented, none reordered.

---

## §H — Part-1b Hardening Conventions (stated once; bound by pointer per contract)

- **H.1 — Validation stages (Doc-4A §11.2; canonical nine-stage order, never reordered).** `1 SYNTAX → 2 CONTEXT → 3 AUTHZ → 4 SCOPE → 5 DELEGATION → 6 STATE → 7 REFERENCE → 8 BUSINESS → 9 POLICY`. Failure terminates at the first failing stage; SYNTAX MAY aggregate field errors, stages 2–9 fail singly. Authorization (2–5) is established before semantic processing (6–9) — a disclosure control (§7.5). Each Validation Matrix row names the **stage**, the **source authority**, the **rule (validation)**, and the **failure class** (error class from H.4).
- **H.2 — Field type vocabulary.** `uuid` (UUIDv7, Doc-4A §8), `enum<…>` (membership fixed by the cited Doc-2 source), `string`, `text`, `uuid[]`/`string[]` (arrays; cardinality stated), `jsonb` (opaque structured payload — Pass-B fixes presence/shape boundary, not internal field schema), `timestamptz`, `bool`. **Required** = MUST be present and non-null (absence → SYNTAX failure, Doc-4A §9). **Nullable** stated per field. Cardinality stated for collections.
- **H.3 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Three-layer check — active **Membership + Permission Slug + Resource Scope** — OR §6B delegation (stage 5). Slugs only, from the Doc-2 §7 catalog; **no slug invented**. Enforcement = Identity `check_permission` (Doc-4C §C3/§C8; no shadow authorization). **BC-COMM-1 scope = thread participant** — a `thread_participants` grant row (`active`) for the actor's org/user. The sole Doc-2 §7 slug is **`can_use_messaging`** (all active members; participation via `thread_participants`). Participant grant/remove and close are **thread-owner / authorized-participant** actions (Pass-A HA-4.1 — "thread owner/authorized participant"), bound by `can_use_messaging` + participant scope. Messaging is **not delegation-eligible** (Doc-4A §6B — participation is a membership-scoped action; no representative-org scenario). **Cross-tenant: a non-participant collapses to `NOT_FOUND`** (§7.5; §12.4).
- **H.4 — Error model (Doc-4A §12; closed class set).** `VALIDATION, AUTHORIZATION, NOT_FOUND, STATE, REFERENCE, BUSINESS, QUOTA, RATE_LIMITED, CONFLICT, ASYNC_PENDING, DEPENDENCY, SYSTEM`. Envelope: `error_class, error_code, message, field_errors, retryable, reference_id`. Error codes follow **`comm_<domain>_<code>`** (Appendix B namespace `comm_`); numeric codes are development-document scope — Pass-B fixes the **class + trigger + retryable**. **`REFERENCE` (a supplied reference does not exist / definitive negative; `retryable: false`) is distinct from `DEPENDENCY` (an owning service / Realtime backing transiently unavailable; `retryable: true`)**; **`STATE` (operation illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4; FROZEN Doc-4F P-03/P-01 + Part-1 convention). Protected-fact failures collapse to `NOT_FOUND` (§7.5; §12.4 Error Boundary block per contract). No POLICY-limit (Category 9) applies in Part 1b unless a contract states one.
- **H.5 — State machine (Doc-2 §3.7/§10.7; Doc-4A §13).** The BC-COMM-1 lifecycles these three contracts drive are: **`thread_participants` → `active → removed`** (grant; `removed` retains audit — Doc-2 §10.7 "NO (removed state)") and **`threads` → `open → closed`** (Doc-2 §3.7/§10.7; `closed` terminal; soft-delete = close). `add_thread_participant` creates a grant row `active`; `remove_thread_participant` transitions `active → removed`; `close_thread` transitions the thread `open → closed`. Every transition cites allowed **source state(s)**, the **target state**, and **forbidden source states** (all others → `STATE`). Concurrency: optimistic — **`close_thread` asserts `expected_status`; a lost race → `CONFLICT`** (Doc-4A §14; the convention pre-stated in Part-1 H.5). **No edge added or modified** — Pass-B enforces the frozen Doc-2 §3.7/§10.7 edges only. *(The 5 core messaging contracts — create/read/send/read-messages — were hardened in Part 1.)*
- **H.6 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** Each audited mutation cites the **§9 audit action**, **actor attribution** (`User`), **object scope** (the `communication.*` row), **timing** (same transaction as the state write — Doc-2 §10.11.4), and **source authority** (Doc-2 §9 + Doc-4B). Reads are not audited (§17.1). **Doc-2 §9 enumerates no separate Communication / Thread / Participant audit domain** → every BC-COMM-1 mutation carries **`[ESC-COMM-AUDIT]`** (interim: nearest enumerated §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**), exactly as frozen in Pass-A HA-9. Participant removal is an individually auditable grant-row transition (Doc-2 §10.7 — "removed retains audit").
- **H.7 — Events (Doc-2 §8).** **BC-COMM-1 emits NO Doc-2 §8 domain event** and **consumes none** (Pass-A HA-7; single-authorship Doc-4A §4.4 — emitters own event production; Communication owns notification consumer effects authored in BC-COMM-2, not here; Doc-4A §16.4 — no event coined). Notification of a granted/removed participant or a thread close is a **BC-COMM-2 effect** (a notification derived from state), **not** a BC-COMM-1 event. No 21.2 integration contract authored.
- **H.8 — Idempotency (Doc-4A §14).** Every mutation carries `Idempotency: required` + a dedup window (POLICY key). **No `communication`/`comm` dedup-window key is registered in Doc-3 §12.2** → carried under **`[ESC-COMM-POLICY]`** (interim: reference the platform default dedup-window key by name; **no key invented** — Doc-3 §12.2 additive channel). Replay within the window → same result, **no duplicate row, no duplicate audit**; a state transition already applied is a no-op returning the same result (terminal-idempotent — re-removing a `removed` participant or re-closing a `closed` thread within the window returns success without a second transition or audit).
- **H.9 — Tenancy, scope & boundary (Doc-2 §6/§10.7; Doc-4A §7.3/§7.5).** `threads`/`thread_participants` are **shared by participants via the `thread_participants` grant** — never disclosed to a non-participant; a non-participant reference collapses to `NOT_FOUND` (§7.5; §12.4). **`context_id` (`rfq_id`) is a bare UUID reference (DH-3)** — Messaging owns no RFQ entity; these three contracts make no procurement decision and read no RFQ scrub rule (that seam applies only at message-write, §HB-1.3 of Part 1). **Firewall:** Messaging computes/owns no Trust/Performance/Verification/Governance score (DH-5); references Trust/RFQ context by UUID only.
- **H.10 — `communication` BC-COMM-1 field source (Doc-2 §10.7).** The hardened schemas bind to the frozen Doc-2 §10.7 columns; **Pass-B introduces no column** — it binds existing ones:
  - `threads`: `thread_type enum<direct|rfq_clarification>`, `context_type`, `context_id` (e.g., `rfq_id` for clarification), `status enum<open|closed>` (shared via `thread_participants`; soft-delete = close).
  - `thread_participants`: → `threads`; `participant_organization_id`, `participant_user_id`, `status enum<active|removed>`; PK (`thread_id`, `participant_organization_id`); `NO (removed state)` — rows are not hard-deleted; removal retains audit.

**Per-contract record shape (Pass-B).** Each contract below is recorded in 12 sections: **1 Contract Metadata · 2 Request Schema · 3 Response Schema · 4 Validation Matrix · 5 Authorization Matrix · 6 State Enforcement · 7 Audit Binding · 8 Event Binding · 9 Error Register (with Error Boundary block) · 10 Idempotency Rules · 11 Cross-Module References · 12 AI-Agent Notes.**

---

## §HB-1b.1 — `comm.add_thread_participant.v1` · `comm.remove_thread_participant.v1` — Participant Grant / Remove

> Paired per Pass-A HA-4.1 (`comm.add_thread_participant.v1` · `comm.remove_thread_participant.v1` — Participant Grant; one record line; both 21.4 Command, Actor User, `can_use_messaging`, Thread `thread_participants`). Hardened together; each contract carries its own request/state record below.

**1. Contract Metadata** — Contract IDs `comm.add_thread_participant.v1`, `comm.remove_thread_participant.v1` · Contract Name: Participant Grant / Remove · Owning BC **BC-COMM-1** · Aggregate **Thread** (`thread_participants`) · Operation **21.4 Command** · Actor **User** (thread owner / authorized participant) · Permission family **`can_use_messaging`** (Doc-2 §7; participant-scoped).

**2. Request Schema**

*`add_thread_participant`:*

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `thread_id` | `uuid` | yes | Doc-2 §10.7 | target thread (actor must be an `active` participant; thread `open`) |
| `participant_organization_id` | `uuid` | yes | Doc-2 §10.7 | grantee org; bare UUID, service-validated via Identity (DH-1); no cross-schema FK; part of PK (`thread_id`, `participant_organization_id`) |
| `participant_user_id` | `uuid` | no | Doc-2 §10.7 | grantee user (nullable; org-level grant when absent); bare UUID, service-validated |

*`remove_thread_participant`:*

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `thread_id` | `uuid` | yes | Doc-2 §10.7 | target thread (actor must be an `active` participant) |
| `participant_organization_id` | `uuid` | yes | Doc-2 §10.7 | the grant row to remove (PK component); transitions `active → removed` |
| `participant_user_id` | `uuid` | no | Doc-2 §10.7 | grant user, when the grant is user-scoped (nullable) |

**3. Response Schema** — **Success (`add`):** `thread_id : uuid`, `participant_organization_id : uuid`, `participant_user_id : uuid (nullable)`, `status : enum<active|removed> = active`, `reference_id : uuid` (Doc-4A §22.1). **Success (`remove`):** `thread_id : uuid`, `participant_organization_id : uuid`, `status : enum<active|removed> = removed`, `reference_id : uuid`. **Failure:** Doc-4A §12 envelope (`error_class, error_code, message, field_errors, retryable, reference_id`).

**4. Validation Matrix**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `thread_id` uuid; `participant_organization_id` uuid; `participant_user_id` uuid when present | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds `can_use_messaging` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | actor's org/user has an `active` `thread_participants` grant on `thread_id` (thread owner / authorized participant); else `NOT_FOUND` collapse | `NOT_FOUND` (collapse, H.9) |
| 5 DELEGATION | Doc-4A §6B | n/a — messaging not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7/§10.7 | **add:** parent thread is `open` (cannot grant on a `closed` thread); new grant row enters `active`. **remove:** target grant row is `active` (transition `active → removed`); a `removed` row → terminal-idempotent no-op (H.8), forbidden source otherwise → `STATE` | `STATE` |
| 7 REFERENCE | Doc-4A §4.5; DH-1 | `participant_organization_id` / `participant_user_id` resolve via Identity (definitive vs transient) | `REFERENCE` (definitive) / `DEPENDENCY` (transient) |
| 8 BUSINESS | Doc-4A §11.2 | participant grant/remove carries no procurement/business decision (transports, never decides — moat); no business rule beyond state/scope applies | — |
| 9 POLICY | Doc-3 §12.2 | none (any participant-count limit, if later required, carries `[ESC-COMM-POLICY]`) | — |

**5. Authorization Matrix** — Actor **User** · Authority **`can_use_messaging`** (Doc-2 §7) · Scope = actor is an `active` participant (thread owner / authorized participant) of `thread_id` · Restrictions: not delegation-eligible; `add` requires the thread `open` (`STATE` if `closed`) · Cross-tenant: a non-participant actor → `NOT_FOUND` (collapse; existence not disclosed); a non-resolvable grantee org/user → `REFERENCE` · Enforcement Identity `check_permission` (Doc-4C).

**6. State Enforcement** — **add_thread_participant:** Applicable states: parent thread `open` · Allowed: create a `thread_participants` row at **`active`** (Doc-2 §10.7) · Forbidden: grant on a `closed` thread → `STATE` · Concurrency: PK (`thread_id`, `participant_organization_id`) — a duplicate active grant is idempotent (H.8), not a new row. **remove_thread_participant:** Applicable state: grant row **`active`** · Allowed transition: **`active → removed`** (Doc-2 §3.7/§10.7; `removed` retains audit) · Forbidden: any non-`active` source other than the terminal-idempotent `removed` no-op → `STATE` · Concurrency: optimistic on the grant row; row is not hard-deleted (`NO (removed state)`).

**7. Audit Binding** — Audit trigger: participant grant (`add`) / participant removal (`remove`) · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by pointer; **no action invented**) · Required audit record: attribution `User`, `organization_id`, `entity_type=thread_participants`, `entity_id` (the grant row / PK), action, timestamp (Doc-2 §9 fields) via Doc-4B `core.append_audit_record.v1` (in-transaction). Removal is individually auditable (Doc-2 §10.7 — "removed retains audit").

**8. Event Binding** — Consumed: **none** · Produced: **none** (H.7 — BC-COMM-1 emits no Doc-2 §8 event; **notification of a granted/removed participant is a BC-COMM-2 effect derived from state, not a BC-COMM-1 event**) · Ownership: n/a.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad/missing `thread_id` or `participant_organization_id`; malformed `participant_user_id`) | false |
| `AUTHORIZATION` | actor/context/slug fail (member without slug) | false |
| `NOT_FOUND` | actor is not a participant of `thread_id` (protected-fact collapse, H.9) | false |
| `STATE` | `add` on a `closed` thread; `remove` of a non-`active` grant (other than the terminal-idempotent `removed` no-op) | false |
| `REFERENCE` | `participant_organization_id` / `participant_user_id` does not resolve at Identity (definitive negative) | false |
| `DEPENDENCY` | Identity / Doc-4B service transiently unavailable / no definitive answer (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-participant actor is `NOT_FOUND`, never `AUTHORIZATION` (which would confirm the thread's existence). `STATE` (grant on a `closed` thread, or removing a non-`active` row) is distinct from `CONFLICT`; `REFERENCE` (grantee org/user not found) distinct from `DEPENDENCY` (Identity transient). `Timing-Uniformity`: not-participant / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → one grant transition, no duplicate row (PK-guarded), no duplicate audit. **Terminal-idempotent:** re-adding an already-`active` grant or re-removing an already-`removed` grant within the window returns the same result with no second transition and no second audit (H.8). A grant/remove with a new idempotency key against a different (`thread_id`, `participant_organization_id`) is a distinct operation.

**11. Cross-Module References** — **Identity (DH-1):** active-org/membership resolution + `check_permission` + grantee org/user resolution. **Platform Core (DH-8):** audit-write (in-transaction); Realtime backing for participant-set change. **RFQ (DH-3):** none for participant grant/remove (`context_id` is an opaque UUID on the thread; no scrub-rule read here; no procurement decision — moat). **Trust (DH-5):** none — Messaging computes/references no score (firewall). **No ownership transfer.**

**12. AI-Agent Notes** — Ownership: BC-COMM-1 owns the Thread and its `thread_participants` grant; grantee `participant_organization_id`/`participant_user_id` are **bare UUID references** (DH-1), never copied entities. Authority: `can_use_messaging`; actor must be an `active` participant (thread owner / authorized participant). Lifecycle: `add` creates a grant `active`; `remove` is `active → removed` (never hard-delete — `removed` retains audit). State: cannot grant on a `closed` thread (`STATE`). Authorization: a non-participant actor → `NOT_FOUND`; a non-resolvable grantee → `REFERENCE`. **No event emitted** — recipient notification is BC-COMM-2's derived effect. Make no procurement decision (moat); reference no Trust score (firewall).

---

## §HB-1b.2 — `comm.close_thread.v1` — Close Thread

**1. Contract Metadata** — Contract ID `comm.close_thread.v1` · Contract Name: Close Thread · Owning BC **BC-COMM-1** · Aggregate **Thread** (`threads`) · Operation **21.4 Command** · Actor **User** (participant) · Permission family **`can_use_messaging`** (Doc-2 §7; participant-scoped).

**2. Request Schema**

| Field | Type | Required | Authority | Constraints |
|---|---|---|---|---|
| `thread_id` | `uuid` | yes | Doc-2 §10.7 | target thread (actor must be an `active` participant) |
| `expected_status` | `enum<open\|closed>` | yes | Doc-4A §14 | optimistic-concurrency assertion of the thread's current status; a lost race → `CONFLICT` (H.5) |

**3. Response Schema** — **Success:** `thread_id : uuid`, `status : enum<open|closed> = closed`, `reference_id : uuid` (Doc-4A §22.1). **Failure:** Doc-4A §12 envelope (`error_class, error_code, message, field_errors, retryable, reference_id`).

**4. Validation Matrix**

| Stage | Authority | Validation | Failure class |
|---|---|---|---|
| 1 SYNTAX | Doc-4A §9 | presence/type; `thread_id` uuid; `expected_status` ∈ enum | `VALIDATION` |
| 2 CONTEXT | Doc-4A §5.2/§5.3 | actor is User; active org context valid | `AUTHORIZATION` |
| 3 AUTHZ | Doc-2 §7; Doc-4A §6 | membership holds `can_use_messaging` | `AUTHORIZATION` |
| 4 SCOPE | Doc-4A §7.3; §7.5 | actor's org/user has an `active` `thread_participants` grant on `thread_id`; else `NOT_FOUND` collapse | `NOT_FOUND` (collapse, H.9) |
| 5 DELEGATION | Doc-4A §6B | n/a — messaging not delegation-eligible (H.3) | — |
| 6 STATE | Doc-2 §3.7 | thread is `open` (transition `open → closed`); a `closed` thread → terminal-idempotent no-op (H.8); forbidden source otherwise → `STATE` | `STATE` |
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate; `thread_id` resolved at SCOPE) | — |
| 8 BUSINESS | Doc-4A §11.2 | closing a thread carries no procurement/business decision (transports, never decides — moat); no business rule beyond state/scope applies | — |
| 9 POLICY | Doc-3 §12.2 | none | — |

**5. Authorization Matrix** — Actor **User** · Authority **`can_use_messaging`** (Doc-2 §7) · Scope = actor is an `active` participant of `thread_id` · Restrictions: not delegation-eligible · Concurrency: `expected_status` asserted; a lost optimistic race → `CONFLICT` (distinct from `STATE`) · Cross-tenant: a non-participant → `NOT_FOUND` (collapse; existence not disclosed) · Enforcement Identity `check_permission` (Doc-4C).

**6. State Enforcement** — Applicable state: **`open`** · Allowed transition: **`open → closed`** (Doc-2 §3.7; `closed` terminal; soft-delete = close) · Forbidden: any non-`open` source other than the terminal-idempotent `closed` no-op → `STATE` · Concurrency: optimistic — `close_thread` asserts `expected_status`; if the stored status has advanced since read, the write loses the race → **`CONFLICT`** (Doc-4A §14; the Part-1 H.5 convention). `closed` is terminal — no re-open edge exists (Doc-2 §3.7).

**7. Audit Binding** — Audit trigger: thread close · Audit owner: Communication · Escalation marker: **`[ESC-COMM-AUDIT]`** (Doc-2 §9 enumerates no Communication action; nearest by pointer; **no action invented**) · Required audit record: attribution `User`, `organization_id`, `entity_type=threads`, `entity_id`, action, timestamp (Doc-2 §9 fields) via Doc-4B `core.append_audit_record.v1` (in-transaction).

**8. Event Binding** — Consumed: **none** · Produced: **none** (H.7 — BC-COMM-1 emits no Doc-2 §8 event; **notification of a thread close is a BC-COMM-2 effect derived from state, not a BC-COMM-1 event**) · Ownership: n/a.

**9. Error Register**

| error_class | trigger | retryable |
|---|---|---|
| `VALIDATION` | SYNTAX failure (bad `thread_id`; `expected_status` not in enum) | false |
| `AUTHORIZATION` | actor/context/slug fail (member without slug) | false |
| `NOT_FOUND` | actor not a participant of `thread_id` (protected-fact collapse, H.9) | false |
| `STATE` | thread is not `open` from a forbidden source (close illegal) | false |
| `CONFLICT` | optimistic-concurrency lost race — `expected_status` no longer matches stored status | false |
| `DEPENDENCY` | Doc-4B / Realtime / Identity transiently unavailable (retry) | true |
| `SYSTEM` | unexpected | true |

**Error Boundary block (Doc-4A §12.4/§12.6):** `V4 (scope) : NOT_FOUND | collapse-rule` — a non-participant is `NOT_FOUND`, never `AUTHORIZATION`. **`STATE` (close illegal from current state) is distinct from `CONFLICT` (optimistic-concurrency lost race on `expected_status`)** — never merged (H.4; Part-1 H.5 convention). `Timing-Uniformity`: not-participant / not-exist identical.

**10. Idempotency Rules** — `Idempotency: required` (Doc-4A §14) + dedup window (`[ESC-COMM-POLICY]`); replay within window → one `open → closed` transition, no duplicate audit. **Terminal-idempotent:** re-closing an already-`closed` thread within the window returns success with no second transition and no second audit (H.8). The optimistic `expected_status` guard distinguishes a genuine concurrent advance (`CONFLICT`) from an idempotent replay (same result).

**11. Cross-Module References** — **Identity (DH-1):** active-org/membership resolution + `check_permission` + participant resolution. **Platform Core (DH-8):** audit-write (in-transaction); Realtime backing for thread-status change. **RFQ (DH-3):** none for close (`context_id` is an opaque UUID; no scrub-rule read; no procurement decision — moat). **Trust (DH-5):** none — Messaging computes/references no score (firewall). **No ownership transfer.**

**12. AI-Agent Notes** — Ownership: BC-COMM-1 owns the Thread. Authority: `can_use_messaging`; actor must be an `active` participant. Lifecycle: `open → closed` only; `closed` is terminal (no re-open edge — Doc-2 §3.7); soft-delete = close. Concurrency: assert `expected_status`; a lost race is **`CONFLICT`**, never `STATE` (and never merged). Authorization: a non-participant → `NOT_FOUND`. **No event emitted** — notification of close is BC-COMM-2's derived effect. Make no procurement decision (moat); reference no Trust score (firewall).

---

## Appendix A — BC-COMM-1 Part-1b Contract Register (Pass-B)

| § | Contract-ID | Operation | Aggregate | Actor | Permission | Emits event | Audit |
|---|---|---|---|---|---|---|---|
| §HB-1b.1 | `comm.add_thread_participant.v1` · `comm.remove_thread_participant.v1` | 21.4 Command | Thread (`thread_participants`) | User | `can_use_messaging` (participant) | none | `[ESC-COMM-AUDIT]` |
| §HB-1b.2 | `comm.close_thread.v1` | 21.4 Command | Thread (`threads`) | User | `can_use_messaging` (participant) | none | `[ESC-COMM-AUDIT]` |

**Part-1b invariants (held):** the 3 hardened contracts are the verbatim Pass-A `comm.add_thread_participant.v1`/`comm.remove_thread_participant.v1`/`comm.close_thread.v1` (no contract added/renamed; the two participant ops paired exactly as Pass-A HA-4.1 pairs them); BC-COMM-1 owns the Thread aggregate only; **emits zero Doc-2 §8 events** and consumes none (single-authorship; notification of a participant change or thread close is BC-COMM-2's derived effect); binds the single Doc-2 §7 slug `can_use_messaging` (no slug invented); every mutation carries `[ESC-COMM-AUDIT]` (Doc-2 §9 enumerates no Communication action; no action invented); carries `[ESC-COMM-POLICY]` for the dedup-window key; lifecycles are exactly `thread_participants active→removed` (`removed` retains audit; no hard delete) and `threads open→closed` (`closed` terminal; no state invented, no edge added); `close_thread` separates **STATE** (illegal-from-state) from **CONFLICT** (optimistic `expected_status` lost race); REFERENCE vs DEPENDENCY separated throughout; Messaging owns no RFQ authority and makes no procurement decision (moat), computes/owns no Trust/Performance/Verification/Governance score (DH-5 firewall). **No Pass-A decision modified; no entity/state/event/slug/audit-action/POLICY-key/template created.** With this Part, BC-COMM-1 Pass-B is contract-complete: 7 of 7 frozen contracts hardened (Part 1: 5 core; Part 1b: these 3) — **F-MOD6-M1 cleared** pending Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN and a re-run of the Module Consolidation Review.

---

## Appendix B — Carried Markers (Part 1b; unchanged)

- **DH-1** (Identity — `check_permission`/org-context/participant + grantee resolution, consumed), **DH-8** (Platform Core — audit-write, Realtime). *(DH-3 RFQ and DH-5 Trust appear only as negative assertions — these three contracts read no RFQ scrub rule and compute/own no score; the DH-3 scrub-rule seam is exercised only at message-write in Part 1 §HB-1.3.)*
- **`[ESC-COMM-AUDIT]`** (Doc-2 §9 additive) — every BC-COMM-1 mutation (participant grant, participant remove, close thread): Doc-2 §9 enumerates no Communication action; nearest action bound by pointer; no action invented.
- **`[ESC-COMM-POLICY]`** (Doc-3 §12.2 additive) — idempotency dedup-window key, and any participant-count/rate limit if later required (no `communication` POLICY namespace registered; platform default referenced by name; no key invented).
- **`[ESC-COMM-SLUG]`** (Doc-2 §7 additive) — not required in this Part (all three contracts bind `can_use_messaging`); carried for the module.
- **`[ESC-COMM-EVENT]`** (Doc-2 §8 additive) — BC-COMM-1 produces no §8 event; carried for the module.

**Carried, never resolved here**; resolution is an additive patch to the owning document and does not reopen Pass-A or this Part.

---

*End of Doc-4H — Pass-B (Hardening) Part 1b v1.0 — BC-COMM-1 Participant & Close. Authored against `Doc-4H_PassA_Content_v1.0` (FROZEN; sole contract authority; as amended by `Doc-4H_PassA_Patch_v1.0`, which does not touch these three contracts) and `Doc-4H_Structure_v1.0_FROZEN`, completing the BC-COMM-1 Pass-B set begun in the FROZEN `Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0`. Hardens the 3 deferred Pass-A messaging contracts to implementation grade (field-level schemas, Doc-4A §11.2 nine-stage validation matrices, authorization matrices, state enforcement, audit bindings, event bindings, error registers with §12.4 Error Boundary blocks + REFERENCE/DEPENDENCY + STATE/CONFLICT separation, idempotency) — no entity, aggregate, state, transition, slug, event, audit action, POLICY key, or template created or changed. BC-COMM-1 owns the Thread aggregate; emits no Doc-2 §8 domain event and consumes none (single-authorship; notification of a participant change or thread close is BC-COMM-2's derived effect); the lifecycles are exactly `thread_participants active→removed` (removal retains audit; no hard delete) and `threads open→closed` (`closed` terminal; `close_thread` asserts `expected_status` with a lost race → `CONFLICT`, distinct from `STATE`); these three contracts read no RFQ scrub rule and make no procurement decision (moat); Messaging computes/owns no Trust/Performance/Verification/Governance score (DH-5 firewall); the procurement moat and Trust firewall are preserved; Communication transports, never decides; nothing invented. Carried markers DH-1/DH-8 (DH-3/DH-5 negative-asserted), `[ESC-COMM-AUDIT]`, `[ESC-COMM-POLICY]`, `[ESC-COMM-SLUG]`, `[ESC-COMM-EVENT]` travel unchanged. This Part clears F-MOD6-M1 (BC-COMM-1 contract-complete: 7 of 7). Any change requires Architecture Board approval (Doc-4_Governance_Note_v1.0). Suitable for: Hard Review → Patch → Patch Verification → Freeze Audit → FROZEN → re-run Module Consolidation Review.*

---

## Freeze Approval (records consolidation)

```text
Status:        FROZEN
Source:        Doc-4H_PassB_Part1b_BC-COMM-1_Participant_And_Close_v1.0
Freeze Authority: Doc-4H_PassB_Part1b_Freeze_Audit_v1.0
Board Status:  APPROVED FOR FREEZE
Hard Review:   PASS (0 BLOCKER / 0 MAJOR / 0 MINOR / 0 NITPICK)
Open BLOCKER = 0 · Open MAJOR = 0 · Open MINOR = 0 · Open NITPICK = 0
```

*Frozen consolidation of `Doc-4H_PassB_Part1b_BC-COMM-1_Participant_And_Close_v1.0`. The source body above is preserved without content modification (mechanical merge); only the freeze header and this freeze-approval footer are added per the permitted freeze-metadata scope. Freeze authority: `Doc-4H_PassB_Part1b_Freeze_Audit_v1.0` (APPROVE FOR FREEZE; FROZEN = YES). With this consolidation, BC-COMM-1 Pass-B is contract-complete (7 of 7), F-MOD6-M1 is closed, and the records-completion item F-FINAL-MIN1 of the Final Module Freeze Audit is cleared.*
