# Doc-4F — Pass-A — Patch Verification (Corpus-Authority) v1.0

| Field | Value |
|---|---|
| Document | Doc-4F_PassA_Patch_Verification_v1.0 — independent corpus-authority verification of the findings in `Doc-4F_PassA_Independent_Hard_Review_v1.0` |
| Status | **Verification board determination — pre-patch.** Each finding classified VALID / INVALID / CORPUS ESCALATION against frozen-corpus evidence only. **No patch authored; no redesign; no recommendation beyond classification.** |
| Board | Architecture Board Chair · Principal Enterprise Architect · Principal DDD Architect · Principal API Governance Reviewer · AI-Agent Governance Auditor — operating as an independent verification board |
| Authority used | Architecture (FROZEN), ADRs (FROZEN), Doc-2 v1.0.3 (FROZEN), Doc-3 v1.0.2 (FROZEN), Doc-4A v1.0 (FROZEN), Doc-4B/4C/4D/4E v1.0 (FROZEN), `Doc-4F_Structure_v1.0_FROZEN.md`. **Review reports, authoring notes, working drafts, and prior rationale were NOT used as authority.** |
| Subject under review | `Doc-4F_Content_v1.0_PassA.md` (the contract-structure pass), measured against the authority above. |

**Procedural note (input availability).** The cited input `Doc-4F_PassA_Independent_Hard_Review_v1.0` is **not present on disk** in the `ivendorz.com` folder at verification time (confirmed by directory scan). Per the project standing rule on inputs "cited but not on disk," this is recorded as a **NITPICK** and the board proceeds: each finding is verified **as stated in the verification request** against corpus authority and against the subject Pass-A text, with independent anchor re-derivation. No finding's classification depends on the absent file's internal rationale (which the board is instructed not to trust in any case).

**Method.** For every finding: (1) locate the cited Pass-A surface; (2) locate the governing frozen authority; (3) compare the Pass-A contract obligation against that authority; (4) classify; (5) record evidence. The three classes are applied strictly: **VALID** = supported by frozen authority, a patch is warranted; **INVALID** = contradicted by frozen authority, the finding is rejected; **CORPUS ESCALATION** = the gap is an absence/ambiguity **inside frozen authority itself** that Doc-4F may not resolve locally (FLAG-AND-HALT to the owning-document channel).

**Disposition convention used here.** A finding that a Pass-A record *deferred a detail to Pass-B* is assessed against two questions: (a) does frozen authority **define** the detail (if yes and Pass-A contradicts it → VALID/patch; if yes and Pass-A is silent-but-consistent → the deferral is legitimate → INVALID as a defect); (b) is the detail **absent from frozen authority** (then the deferral cannot be cured locally, and if the gap is governance-significant it is a CORPUS ESCALATION; if it is merely Pass-B-granularity it is INVALID as a Pass-A defect). The two-pass lifecycle (Structure → **Pass-A contract structure / high-level** → **Pass-B field-level, validation order, business rules, exact transition→event binding**) is the established program convention (Context Pack §6; Doc-4E precedent, FROZEN) and Doc-4A imposes **no** clause requiring field-level trigger-binding or template-runtime commitment at Pass-A.

---

## AD-01 — `EngagementCompleted` trigger binding deferred to Pass-B

### Classification
**INVALID** (deferral is corpus-legitimate; no patch).

### Authority Examined
Doc-2 §3.5 (`operations` entity lifecycles — `engagements`), §5.4 (`closed_won` guard), §8 (operations event row + Primary consumers), §10.5 (`operations.engagements` status set); Doc-4A §16 (events), §13 (state effects), template-selection guide §21; Doc-2 §10.6 `trust.performance_inputs`.

### Evidence
- Doc-2 §3.5 defines the engagement lifecycle as `open → in_delivery → completed → closed` and §10.5 fixes `status(open/in_delivery/completed/closed)`. Both `completed` and `closed` exist as **distinct states**.
- Doc-2 §8 authorizes `EngagementCompleted` as an operations event consumed by Trust into `performance_inputs`. **Doc-2 nowhere binds `EngagementCompleted` to a specific transition edge**, and nowhere assigns "completed vs closed" event ownership; §5.4 states only that `closed_won` "triggers engagement creation (Module 4) and performance inputs (Module 5)" — it does not name the emitting engagement transition.
- Doc-4A §16/§13 require a contract to declare its Events-Produced and State-Machine effects, but impose **no Pass-A-vs-Pass-B granularity** on *which* transition carries the event; the program's two-pass convention places exact transition→event binding in Pass-B.

### Board Determination
The event is corpus-authorized and the Pass-A record emits it from the engagement-lifecycle contract; the **exact transition edge is not defined by Doc-2**, so binding it is a Pass-B refinement, not a Pass-A corpus contradiction. The deferral is legitimate. Finding rejected (INVALID). *(Note: this is distinct from a corpus escalation only because the event itself is authorized and the binding is a downstream authoring detail, not a missing governance object.)*

---

## AD-02 — `DisputeRecorded` trigger ambiguity / inventory incompleteness

### Classification
**INVALID** (the finding's premise — that a separate dispute contract is required or the inventory is incomplete — is contradicted by Doc-2; the trigger-edge detail is Pass-B).

### Authority Examined
Doc-2 §3.5 (`trade_invoices` status incl. `disputed`; `engagements`), §8 (operations events; `DisputeRecorded`), §9 (Engagement domain: "dispute recorded"), §10.5 (`trade_invoices` status set), §10.6 (`performance_inputs` input_type `dispute`).

### Evidence
- Doc-2 §9 **Engagement** domain explicitly enumerates the audit action **"dispute recorded"** within the engagement chain ("…; dispute recorded; buyer feedback submitted (dispute evidence requires the full chain)"). Disputes are therefore an **engagement-scoped** recorded fact with an enumerated §9 action — **no separate dispute aggregate or contract is required by the corpus.**
- Doc-2 §8 authorizes `DisputeRecorded`; §10.6 shows Trust writes a `dispute` performance input as an idempotent consumer of that event. The corpus thus fixes the **event** and its **consumer**, but **does not bind `DisputeRecorded` to the `trade_invoice → disputed` edge or to any specific transition.**
- Doc-2 §3.5 `trade_invoices` carries a `disputed` status, but the corpus does **not** state that this status transition is the `DisputeRecorded` trigger; the §9 "dispute recorded" action sits under Engagement, not Financial.

### Board Determination
The inventory is **not** incomplete — disputes are covered by the existing `DisputeRecorded` event (Doc-2 §8) and the §9 Engagement "dispute recorded" audit action; no separate contract is mandated. The precise emitting transition is undefined by Doc-2 and is a Pass-B binding. Finding rejected (INVALID). The Pass-A text correctly carries the event and flags the exact trigger as Pass-B; it must **not** invent a trade-invoice-`disputed`→event binding as fact (the Pass-A wording presents it as a candidate to confirm, which is compliant).

---

## AD-03 — Link-confirm audit interpretation ambiguity

### Classification
**INVALID** (Doc-2 §9 binds the action unambiguously to the Admin domain; the `[ESC-OPS-AUDIT]` fallback in Pass-A is a conditional belt-and-suspenders, not a required escalation — but the finding that the binding is *ambiguous* is contradicted by §9).

### Authority Examined
Doc-2 §9 (Admin domain; Buyer CRM domain), §3.5/§10.5 (`private_vendor_records` link columns; `admin.link_suggestions`), §10.9 (`admin.link_suggestions` — "confirmation writes link columns on the private record via Operations service"), ADR-003 (link-not-merge); Doc-4A §17 (audit attribution by actor).

### Evidence
- Doc-2 §9 **Admin** domain explicitly enumerates **"link confirm/dismiss"** (and "suggestion decisions"). The audit action for the link decision is therefore **defined and bound to the Admin domain** — it is not ambiguous in §9.
- Doc-2 §10.9 fixes the mechanism: `admin.link_suggestions` "confirmation writes link columns on the private record **via Operations service**." The **decision/audit action is Admin's**; the **column write is executed by the Operations service**. Actor scope is thus explicit at the data-ownership level (Admin owns the suggestion + decision audit; Operations performs the column write).
- Doc-4A §17 requires the audit record to reflect the **actual executing actor**; where Operations performs the write, the attribution follows the executing actor, binding the Doc-2 §9 action by pointer.

### Board Determination
Doc-2 §9 **clearly binds** the link-confirm/dismiss audit action (Admin domain), and §10.9 fixes actor scope (Admin decides; Operations writes the column). The binding is **not ambiguous**; `[ESC-OPS-AUDIT]` is **not required** for the link action. Finding rejected (INVALID). The Pass-A record's primary binding (Doc-2 §9 Admin "link confirm/dismiss") is correct; its conditional `[ESC-OPS-AUDIT]` clause is over-cautious surplus, not a corpus-required escalation, and may be tightened editorially in patch (optional, non-gating) — but the finding as stated (ambiguity requiring resolution) is contradicted by authority.

---

## AD-04 — Buyer-feedback authorization ambiguity (slug)

### Classification
**CORPUS ESCALATION** (the precise authorization object for engagement-bound buyer feedback is **absent** from Doc-2 §7; Doc-4F may not invent it — it must carry `[ESC-OPS-SLUG]` to the Doc-2 §7 additive channel).

### Authority Examined
Doc-2 §7 (full permission catalog, operations slugs + `can_submit_review`), §9 (Engagement "buyer feedback submitted"; Reviews domain), §10.6 (`performance_inputs` feedback), §10.6 `trust.public_reviews` (review entity ownership); Doc-4A §6.2/§6.4 (slugs only; no slug invention), §17 (audit attribution).

### Evidence
- Doc-2 §7 enumerates the operations slugs (`can_manage_private_vendors`, `can_manage_vendor_status`, `can_manage_engagements`, `can_create_documents`, `can_approve_po`, `can_record_payments`, `can_approve_payment`, `can_manage_finance_records`, `can_manage_templates`, `can_manage_leads`) and a buyer **post-award review** slug `can_submit_review` (O,D,M — "engagement required"). **There is no slug specifically for "record engagement buyer feedback"** as an operations performance-input action distinct from posting a public review.
- Doc-2 §9 lists **"buyer feedback submitted"** under **Engagement** (an operations performance input) and, separately, **"review submit/…"** under **Reviews** (a Trust-owned `public_reviews` action, Doc-2 §10.6). The two are distinct facts in distinct domains; the corpus provides a slug for the **review** (`can_submit_review`) but **not** explicitly for the **engagement feedback** performance-input.
- Doc-4A §6.2/§6.4: contracts use **slugs only**, from the Doc-2 catalog, and **may not invent** a slug; line 527 confirms permission/slug assignment binds **by pointer** to Doc-2.

### Board Determination
Whether `can_manage_engagements` is the intended authority for engagement-bound buyer feedback, or whether a distinct slug is required, is **not resolvable from Doc-2 §7 as written** — the catalog neither names an engagement-feedback slug nor states that `can_manage_engagements` subsumes it. This is an **absence inside frozen authority** (Doc-2 §7). Doc-4F **may not resolve locally** (no slug invention — Doc-4A §6.4). **FLAG-AND-HALT applies**: carry `[ESC-OPS-SLUG]` to the **Doc-2 §7 additive channel** (exactly as the Pass-A record already provisions). The finding is **VALID in substance but its disposition is escalation, not local patch** → classified **CORPUS ESCALATION**.

---

## AD-05 — Document-generation template fork (21.4 vs 21.5 deferred)

### Classification
**INVALID** (no Doc-4A clause requires Pass-A to commit the runtime template when the contract's runtime nature is a legitimate design choice; deferral is corpus-legitimate).

### Authority Examined
Doc-4A §21 template-selection guide (§21, Pass-5 PATCH-01 registry), §15.5/§5.2 (Phase-2 System actor), §13/§16 (state/events); Doc-2 §3.5/§10.5 (`generated_documents` — `generation_job_id`, versioned).

### Evidence
- Doc-4A §21 selection guide keys the template on the contract's **runtime nature**: 21.4 for "a mutating command (creates/updates/state-transitions an entity)"; **21.5 for "a Phase-2 async worker (System-actor execution under background processing)."** The two are mutually exclusive **once the runtime nature is fixed**, but the guide does not pre-decide whether a given capability is synchronous or async.
- Doc-2 §10.5 models `generated_documents` with a `generation_job_id` (suggesting an async job is *available*) but does **not mandate** that generation be Phase-2 async vs a synchronous command; the entity, ownership, version semantics, audit (§9 "generated document creation"), and storage-ref binding are **identical** under either template.
- Doc-4A imposes **no** Pass-A obligation to fix the runtime nature before Pass-B; the choice changes neither the owned entity nor any binding, only the template specialization.

### Board Determination
The corpus requires the **correct** template once the runtime nature is decided, but **does not require that decision at Pass-A** and does not pre-determine sync-vs-async for document generation. The Pass-A record correctly states the entity/ownership/bindings (invariant under either template) and defers the 21.4-vs-21.5 commitment to Pass-B. Deferral is legitimate. Finding rejected (INVALID).

---

## AD-06 — Generated-document sharing slug ambiguity

### Classification
**CORPUS ESCALATION** (no Doc-2 §7 slug specifically governs counterparty-grant sharing of a generated document; the corpus provides only the document-creation authority — the gap is in frozen authority and must be carried as `[ESC-OPS-SLUG]`, not invented).

### Authority Examined
Doc-2 §7 (operations slugs; `can_create_documents`), §9 (Documents domain; `rfq_document_grant create/remove`), §10.5 (`generated_documents` "sharable to counterparty by grant"); Doc-4A §6.2/§6.4 (no slug invention).

### Evidence
- Doc-2 §10.5 establishes that `generated_documents` are "sharable to counterparty **by grant**," and §9 **Documents** enumerates **"rfq_document_grant create/remove"** — but `rfq_document_grant` is an **RFQ-owned** grant entity (Doc-2 §10.4 / Doc-4E), **not** the Operations `generated_documents` counterparty grant.
- Doc-2 §7 provides `can_create_documents` (LOI/PO/challan/WCC creation) but **names no slug for granting/revoking access to a generated document**. Whether sharing falls under `can_create_documents` or requires a distinct grant slug is **not stated**.
- Doc-4A §6.4: a contract **may not invent** a slug; it binds by pointer to Doc-2 §7.

### Board Determination
The authorization object for **generated-document counterparty grant-sharing** is **absent from Doc-2 §7** (the only enumerated grant action, `rfq_document_grant`, belongs to RFQ). Doc-4F may not invent a sharing slug. **FLAG-AND-HALT applies**: carry `[ESC-OPS-SLUG]` to the **Doc-2 §7 additive channel** (as the Pass-A record provisions). Classified **CORPUS ESCALATION**.

---

## IR-01 — `record_delivery` precondition vs state-machine conflict

### Classification
**INVALID** (no conflict with frozen authority; the precondition is consistent with the §3.5 lifecycle, and the exact allowed source-state is a Pass-B validation detail the corpus leaves open).

### Authority Examined
Doc-2 §3.5 (`engagements` `open → in_delivery → completed → closed`; `challans` versioned document), §10.5 (`engagements` status; `challans` row), §8 (`DeliveryRecorded`); Doc-4A §13 (state effects), §11.2 (validation order — STATE stage).

### Evidence
- Doc-2 §3.5 places `in_delivery` between `open` and `completed`; recording a delivery (challan) during `in_delivery` is **consistent** with the lifecycle, and the lifecycle does **not prohibit** a delivery while `open` (challans are versioned documents under the engagement, §10.5, not themselves a gated state edge).
- Doc-2 defines **no precondition table** fixing the exact engagement source-state(s) from which a challan may be issued; STATE-stage validation (Doc-4A §11.2, Category-6) is a **Pass-B** concern.
- The Pass-A record states the precondition as "engagement in `in_delivery` (or per Doc-2 §3.5)" — i.e., it binds to the §3.5 machine and defers the exact gate to Pass-B; this is **not** a contradiction of any frozen edge.

### Board Determination
No frozen-authority conflict exists: the precondition is consistent with the §3.5 lifecycle, and Doc-2 fixes no exact source-state gate for delivery recording (a Pass-B validation rule). Finding rejected (INVALID). *(If the hard review read the Pass-A "in_delivery" precondition as an asserted hard gate, that reading is corrected here: the corpus does not define one, so none is asserted.)*

---

## IR-02 — Internal-service authorization enforcement (actor model)

### Classification
**INVALID** (the actor model is defined by Doc-4A §5.2 and the FROZEN Doc-4E precedent; "internal-service" is an accepted Pass-A composition notation, and service-authentication is a Doc-4B/development-layer concern — no additional Pass-A specification is required by authority).

### Authority Examined
Doc-4A §5.2 (actor types: User, Admin, System, AI Agent — "No Doc-4 document may add actor types"), §6 (three-layer authorization), §15.5/§16.7 (System-actor Phase-2; consumer effects); Doc-4E Pass-A (FROZEN) actor usage (`internal-service` on composition reads, e.g., `rfq.get_matching_results.v1`); Doc-4B (Module-0 service ownership); Doc-2 §6/§10.11 (RLS not an authorization mechanism — Doc-4A line 269).

### Evidence
- Doc-4A §5.2 fixes the **four** audit/actor types and forbids adding actor types. "internal-service" is **not** one of the four — it is a **descriptive composition label**. The FROZEN Doc-4E Pass-A uses "internal-service" precisely this way on synchronous cross-module/composition reads (e.g., `rfq.get_matching_results.v1` "Actor: internal-service / Admin"; `rfq.get_rfq.v1` "User / internal-service"), and Doc-4E is **frozen** — the Board has **already accepted** this notation at Pass-A.
- Doc-4A §6 fixes the authorization model (three-layer membership+slug+scope, or §6B delegation; resolved via Identity `check_permission`); **service-to-service authentication** (how an internal caller is authenticated/trusted) is an **infrastructure/development-document** concern, not a Pass-A contract field (consistent with Doc-4A treating mechanism as development-layer throughout, e.g., §14 idempotency mechanism).
- The Pass-A CRM read-service (`ops.read_crm_status_for_routing.v1`) mirrors the frozen Doc-4E internal-service composition pattern and binds the non-disclosure invariant at the boundary (Doc-2 §10.11; Doc-4A §7.5).

### Board Determination
The actor model **is** defined (four audit actor types; System for async; "internal-service" as the frozen-precedent composition notation), and additional service-authentication specification is **not a Pass-A obligation** under Doc-4A (it is development-layer). No frozen-authority gap requires a Pass-A patch. Finding rejected (INVALID).

---

## IR-03 — Consumer failure-isolation rule absent

### Classification
**INVALID** (the failure-isolation declaration belongs in the **21.2 Integration contract**, authored by the **emitting** module under §4.4 single-authorship — which Pass-A correctly does **not** instantiate; current wording is consistent with authority).

### Authority Examined
Doc-4A §4.4 (integration single-authorship — emitter authors the delivery integration), §16.7 (at-least-once delivery; consumers idempotent), Integration Contract template 21.2 fields `Consumer-Effect` / `Idempotency` / **`Failure:`** (retry per outbox POLICY | DLQ | skip-with-audit); Doc-2 §8 (operations events; consumers idempotent); Doc-4B (outbox dispatcher ownership).

### Evidence
- Doc-4A §16.7 fixes the platform rule: the outbox dispatcher delivers **at-least-once to all declared consumers; consumers MUST be idempotent.** The Pass-A consumer contracts (`create_engagement_on_award`, `create_lead_on_invitation`) declare idempotency on event identity — consistent with §16.7.
- The **explicit failure behavior** (`Failure: retry per POLICY | DLQ | skip with audit`) is a **field of the 21.2 Integration Contract** (template lines: `Consumer-Effect` / `Idempotency` / `Failure`), and per **§4.4 the 21.2 integration is authored by the EMITTING module** (RFQ for `RFQClosedWon`/`VendorInvited`). The Pass-A explicitly does **not** instantiate 21.2 (B.1; §F10) — so the absence of an isolation clause in the Operations Pass-A is **required by single-authorship**, not a defect.
- The Pass-A records already state the two consumers are **independent and idempotent** (§F6/§F11) — the §16.7-level obligation — without trespassing on the emitter-owned 21.2 failure declaration.

### Board Determination
Frozen authority places the consumer **failure-isolation** declaration in the emitter-authored 21.2 Integration contract (§4.4), which Pass-A correctly omits; the §16.7 idempotency obligation is stated. Current wording is **sufficient at Pass-A**. Finding rejected (INVALID).

---

## IR-04 — `source_entity_id` validation ambiguity

### Classification
**INVALID** (the validation mechanism is fixed by corpus — bare-UUID, service-validated, no cross-schema FK — and the per-field validation detail is Pass-B; no frozen-authority gap).

### Authority Examined
Doc-2 §0.3 / §10.11 (no cross-schema FK; write-time service validation + nightly integrity audit), §10.5 (`generated_documents.source_entity_id` = rfq/quotation/engagement doc); Doc-4A §8 (UUIDv7 identifiers; cross-module refs bare UUID, service-validated), §11.2 (REFERENCE validation stage 7).

### Evidence
- Doc-2 §10.11 mandates **no cross-schema FOREIGN KEY**; cross-entity references are enforced by **write-time service validation** + a nightly integrity audit scanning orphan ids. Doc-4A §8 fixes that cross-module references are **bare UUIDs, service-validated**.
- Doc-2 §10.5 fixes `generated_documents.source_entity_id` as a reference to an rfq/quotation/engagement doc — a cross-context/cross-module reference, hence **bare-UUID + service-validated** by the §10.11 / §8 rule. The mechanism is **not ambiguous**.
- Doc-4A §11.2 places REFERENCE validation at stage 7 (per-field REFERENCE checks) — a **Pass-B** validation-order detail; Pass-A states the reference is service-validated (B.3; §F7), consistent with authority.

### Board Determination
The validation **mechanism** is corpus-fixed (bare-UUID, service-validated, no cross-schema FK); only the per-field REFERENCE wiring is Pass-B. No frozen-authority gap. Finding rejected (INVALID).

---

## IR-05 — Engagement transition actor-scope ambiguity

### Classification
**CORPUS ESCALATION** (Doc-2 does **not** define per-transition actor ownership for the shared engagement lifecycle — which party drives `in_delivery`/`completed`/`closed` is absent from frozen authority; Doc-4F may not assign it locally beyond the §7 slug, and the precise party-per-edge binding routes to the owning-document channel).

### Authority Examined
Doc-2 §3.5/§10.5 (`engagements` shared by parties via party columns + RLS; `open → in_delivery → completed → closed`), §6 (shared tenancy), §7 (`can_manage_engagements` — single slug, O/D/M), §9 (Engagement "status change"); Doc-4A §5.3 (active-org scope), §6 (authorization); ADR-002 (engagement = one buyer org + one vendor profile).

### Evidence
- Doc-2 §10.5 makes the engagement **shared (both parties via party columns + RLS)** and §7 provides a **single** authority slug `can_manage_engagements` (O,D,M) — it does **not** state **which party** (buyer org vs vendor controlling org) is authorized for **which transition** (`open→in_delivery`, `in_delivery→completed`, `completed→closed`).
- Doc-2 §3.5/§5-series define the **engagement state edges** but bind **no actor/party per edge**; the corpus is silent on, e.g., whether the vendor side or buyer side drives `completed`.
- Doc-4A §5.3/§6 fix that scope is the active org and authorization is slug-based, but cannot supply the **per-edge party assignment** the corpus omits; inventing it would be a local ownership decision (forbidden — Doc-4A §0.6 / §4.1).

### Board Determination
The **per-transition actor/party ownership** for the shared engagement lifecycle is **absent from frozen authority** (Doc-2 §3.5/§7 give a shared entity and a single slug, no party-per-edge rule). Doc-4F may not resolve this locally beyond binding the §7 slug. **FLAG-AND-HALT applies**: the precise party-per-edge authority routes to the **Doc-2 §3.5/§7 owning-document channel** (engagement lifecycle / permission mapping). Classified **CORPUS ESCALATION**. *(Pass-A currently binds `can_manage_engagements` + "party scope (buyer org or vendor controlling org)" without fixing party-per-edge — consistent with not resolving locally; the residual ambiguity is the corpus gap recorded here.)*

---

## IR-06 — Authoring-brief wording reference

### Classification
**INVALID** (editorial only; no corpus-governance violation).

### Authority Examined
`Doc-4F_Structure_v1.0_FROZEN.md` §F3/§F4/§F5/§F15 (the five bounded contexts and owned aggregates; BC-OPS-5 = Finance Records); Doc-4A §0.3 (reference-never-restate); Doc-2 §2 (Module-4 aggregates).

### Evidence
- The subject Pass-A authors the **five frozen bounded contexts verbatim** from `Doc-4F_Structure_v1.0_FROZEN.md` (BC-OPS-1…5; BC-OPS-5 = **Finance Records**), and records the "Outcome & Performance Tracking" wording as the **BC-OPS-2 performance-input emission surface** (§F5/§F11), not a re-scoped context. The frozen structure (sole structure authority) is preserved; **no aggregate is re-scoped, renamed, moved, or duplicated** (Doc-2 §2; structure §F5/§F8).
- The reference to an authoring brief's alternate label is a **non-authoritative editorial note**; it changes no entity, ownership, slug, event, audit action, POLICY key, or template, and binds only by pointer (Doc-4A §0.3).

### Board Determination
The matter is **editorial**, not a governance violation: the deliverable conforms to the frozen structure and to Doc-2 §2 ownership. Finding rejected (INVALID).

---

## Final Board Summary

| Finding | Classification |
|---|---|
| AD-01 — `EngagementCompleted` trigger deferred | INVALID |
| AD-02 — `DisputeRecorded` trigger / inventory | INVALID |
| AD-03 — Link-confirm audit interpretation | INVALID |
| AD-04 — Buyer-feedback authorization slug | **CORPUS ESCALATION** |
| AD-05 — Document-generation template fork (21.4 vs 21.5) | INVALID |
| AD-06 — Generated-document sharing slug | **CORPUS ESCALATION** |
| IR-01 — `record_delivery` precondition vs lifecycle | INVALID |
| IR-02 — Internal-service authorization model | INVALID |
| IR-03 — Consumer failure-isolation rule | INVALID |
| IR-04 — `source_entity_id` validation mechanism | INVALID |
| IR-05 — Engagement transition actor-scope | **CORPUS ESCALATION** |
| IR-06 — Authoring-brief wording | INVALID |

---

## Patch Scope Determination

### Patch Required (VALID findings only)
*(A "VALID — patch required locally in Doc-4F" finding is one supported by frozen authority **and** curable within Doc-4F without invention.)*

- **None.** No finding is classified VALID-with-local-patch. No corpus authority is contradicted by the Pass-A text, and every detail the hard review flagged is either (a) a Pass-B-granularity refinement the corpus does not require at Pass-A, or (b) an absence inside frozen authority that Doc-4F may not cure locally (see Escalations).

### Reject Findings (INVALID only)
- **AD-01** — deferral of the `EngagementCompleted` transition edge is corpus-legitimate (Doc-2 binds no edge).
- **AD-02** — disputes are covered by `DisputeRecorded` + §9 Engagement "dispute recorded"; no separate contract required; trigger edge is Pass-B.
- **AD-03** — Doc-2 §9 Admin binds "link confirm/dismiss" unambiguously; §10.9 fixes actor scope; not ambiguous.
- **AD-05** — Doc-4A does not require Pass-A to commit 21.4-vs-21.5 when runtime nature is a legitimate design choice.
- **IR-01** — precondition is consistent with the §3.5 lifecycle; no source-state gate is fixed by Doc-2.
- **IR-02** — actor model is defined (Doc-4A §5.2 + frozen Doc-4E internal-service precedent); service auth is development-layer.
- **IR-03** — failure-isolation belongs in the emitter-authored 21.2 (Doc-4A §4.4), which Pass-A rightly omits; §16.7 idempotency is stated.
- **IR-04** — validation mechanism is corpus-fixed (bare-UUID, service-validated, no cross-schema FK); per-field wiring is Pass-B.
- **IR-06** — editorial only; conforms to the frozen structure and Doc-2 §2.

### Escalations (corpus-level ambiguities — FLAG-AND-HALT to owning-document channel; not resolvable in Doc-4F)
- **AD-04** — no Doc-2 §7 slug specifically governs **engagement buyer-feedback** as a performance-input action distinct from `can_submit_review`. **Channel: Doc-2 §7 additive** (`[ESC-OPS-SLUG]`). *No slug invented in Doc-4F.*
- **AD-06** — no Doc-2 §7 slug governs **generated-document counterparty grant-sharing** (the only enumerated grant action, `rfq_document_grant`, is RFQ-owned). **Channel: Doc-2 §7 additive** (`[ESC-OPS-SLUG]`). *No slug invented in Doc-4F.*
- **IR-05** — Doc-2 defines **no per-transition party/actor ownership** for the shared engagement lifecycle (single `can_manage_engagements` slug; shared entity). **Channel: Doc-2 §3.5/§7 owning-document** (engagement lifecycle / permission mapping). *No party-per-edge rule invented in Doc-4F.*

*All three escalations are already provisioned in the Pass-A text as carried markers (`[ESC-OPS-SLUG]` for AD-04/AD-06; the §F5 engagement records bind the §7 slug + party scope without fixing party-per-edge for IR-05). Carrying them is corpus-compliant; resolving them is an additive patch to the **owning document**, not a change to Doc-4F.*

---

## Final Decision

1. **How many findings are VALID (supported by authority, local Doc-4F patch required)?** — **0.**
2. **How many findings are INVALID (contradicted by authority; rejected)?** — **9** (AD-01, AD-02, AD-03, AD-05, IR-01, IR-02, IR-03, IR-04, IR-06).
3. **How many findings are CORPUS ESCALATION (ambiguity/absence inside frozen authority)?** — **3** (AD-04, AD-06, IR-05).
4. **Is a patch authorized?** — **No Doc-4F local patch is authorized.** No finding is VALID-with-local-cure: the nine INVALID findings are rejected, and the three escalations may **not** be resolved inside Doc-4F. The corrective action for the escalations is an **additive patch to the owning document** (Doc-2 §7 for AD-04/AD-06; Doc-2 §3.5/§7 for IR-05), through change management — not a Doc-4F edit. *(Optional, non-gating: an editorial tightening of the AD-03 conditional `[ESC-OPS-AUDIT]` surplus clause may be applied at the next Pass-A revision; it is not required and corrects no corpus contradiction.)*
5. **Is FLAG-AND-HALT required anywhere?** — **Yes — at three points** (AD-04, AD-06, IR-05), each halting on an **absence inside frozen authority** and routing to the **Doc-2 owning-document additive channel**. Doc-4F correctly carries these as `[ESC-OPS-*]` markers and resolves none locally (Doc-4A §0.6).

---

*End of Doc-4F_PassA_Patch_Verification_v1.0. Independent corpus-authority verification of the `Doc-4F_PassA_Independent_Hard_Review_v1.0` findings, performed against the frozen corpus only; prior reviews, patches, and author rationale were not used as authority. Result: 0 VALID (local patch) · 9 INVALID · 3 CORPUS ESCALATION. No Doc-4F patch authorized; FLAG-AND-HALT at AD-04, AD-06, IR-05 (Doc-2 §7 / §3.5 additive channels). No patch generated, no redesign, no recommendation beyond classification. The cited hard-review file was absent on disk (NITPICK); verification proceeded on the findings as stated with independent anchor re-derivation.*
