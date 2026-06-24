# Doc-5E — RFQ Procurement Engine (M3 `rfq`) API Realization — Content v1.0, Pass 3 (§8–§9 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5E — RFQ Procurement Engine (Module 3) — API Realization |
| Pass | 3 of 3 — Sections §8 (out-of-wire boundary), §9 (conformance & carried items), and Appendix A (conformance attestation) — final content pass |
| Status | ACTIVE — Content Pass 3 of 3; §8–§9 + Appendix A. On completion, Doc-5E content (§0–§9 + Appendix A) is complete → next is the Doc-5E Freeze Readiness Audit |
| Structure | Conforms to `Doc-5E_Structure_v1.0_FROZEN.md` |
| Realizes | The out-of-wire boundary (the 8 System engine workers, the internal-service read legs, the DE-1…DE-8 integrations, the emitted outbox events) + the Doc-5A Appendix A attestation for the 30 caller-facing M3 endpoints |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5E Content Pass-1 (§0–§3 + inventory) and Pass-2 (§4–§7, the 30 caller-facing endpoints) |
| Contains | The §8 boundary statement (no realization), the §9 conformance obligation + carried-item register, and the Appendix A per-band attestation. No contract bodies, representations, error codes, POLICY keys, audit actions, events, or Doc-3 rules restated |
| Audience | Architecture / API Governance Boards · Doc-5E authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** Doc-4E fixed the contracts; Doc-3 owns the procurement logic (by pointer); Doc-4M owns the state machines; Doc-5A fixed the wire mechanics and the Appendix A freeze gate. §8 declares the boundary (no endpoint, no realization); §9 + Appendix A attest the realized surface. Nothing is coined. The engine's compute, internal reads, cross-module integrations, and emitted events are **out-of-wire by design** — the highest-stakes expression of R1: the moat is deliberately not a caller surface.

**Dependency realization path:** `Doc-5A §1.3/§10/§11`, Appendix A; `Doc-4E §E5/§E6/§E9/§E10/§E12`, Appendix C; `Doc-2 §8`; `Doc-4B` outbox.

---

## §8 — Out-of-Wire Boundary (the engine · internal reads · integration · events)

> §8 **declares a boundary; it realizes nothing.** No path, method, status, header, or schema is defined for any mechanism named here. Every §8 mechanism is async-worker / in-process-service / outbox emission, consumed within other modules' transactions — never an M3 HTTP endpoint. Caller-visible results of these mechanisms are observed only via the §4–§7 reads (the `Doc-5A §10` status pattern satisfied by reads), never a synchronous facade over the engine.

### 8.1 The Engine — 8 System Workers (no wire)

- The matching/routing/selection/comparison engine is realized by **8 System workers** (21.5, `Response: none`) — none is caller-invocable; **no path, method, or status exists for any of them**:

  | Worker | Role (by pointer — Doc-3/Doc-4E) | Caller observes via |
  |---|---|---|
  | `run_matching_pipeline` | full match/gate/score/distribute pass (`Doc-3 §3–§7`) | RFQ state (`get_rfq`), `get_matching_results` (§7) |
  | `rematch_incremental` | incremental re-match on eligibility/capacity change | same reads |
  | `regenerate_matching_results` | rebuild derived results artifact | `get_matching_results` |
  | `assemble_and_route_wave` | wave assembly + invitation routing (`Doc-3 §8`) | `get_routing_log`, `list_invitations` |
  | `replenish_wave` | top up an under-filled wave | `get_routing_log` |
  | `drain_deferred_queue` | release capacity-deferred candidates | `get_routing_log` (non-disclosing — R5) |
  | `expire_rfq` | `matching → expired` / coverage-exhausted edge (`Doc-4M`) | RFQ state (`get_rfq`) |
  | `generate_comparison_statement` | compute the decision-support artifact (`Doc-3 §9`) | `get_comparison_statement` (§6) |

- **Caller-visible async (R1/§10):** **no caller endpoint returns `202`** (§2.1). Each caller command commits its own state transition synchronously (`200`/`201`); the engine runs **downstream** as these System workers, and progress is observed via the §4/§7 reads — never a synchronous engine trigger. **`generate_comparison_statement` is engine computation: no caller-facing endpoint exists or may be added; the buyer reads the *result* via `get_comparison_statement` (§6), not the generation** (R6 — the platform never auto-decides; the statement is read-only decision support).
- **Binds:** `Doc-4E §E5/§E6/§E9/§E10`; `Doc-3 §3–§9`; `Doc-4M`; `Doc-5A §1.3/§10/§11`; structure R1.

### 8.2 Internal-Service Read Legs (dual-path rule — no wire)

- Where a Doc-4E read contract has **both** a caller-facing leg and an internal-service leg, §4–§7 realize the caller leg only; the internal-service leg is **out-of-wire** (in-process module composition via `rfq/contracts/`, never HTTP — frozen Doc-5C precedent). This governs the internal legs of `get_rfq`, `list_rfqs`, `get_rfq_version`, `get_matching_results`, `get_routing_log`, `get_invitation`, `list_invitations`. **Consumers access the in-process service interface only; no cross-module table access is permitted** (One Owner — `Doc-4A §4.1/§4.3`). Contract count (38) is unchanged — these are legs of existing contracts, not new contracts.
- **Binds:** structure §1 (dual-path rule); `Doc-4A §4.1/§4.3`; `Doc-5A §1.3`.

### 8.3 DE-1…DE-8 Cross-Module Integrations (no wire)

- The engine **reads** other modules' data and **emits** to others, all **in-process / via outbox**, never as an M3 HTTP endpoint:

  | Integration | Direction | Out-of-wire realization |
  |---|---|---|
  | **DE-1** Identity (`check_permission` / delegation) | read | authorization resolved in-process (§3.4/§3.5); no grant wire input |
  | **DE-2** Marketplace `vendor_matching_attributes` (the moat seam) | read | engine reads via Marketplace service (§8.1); never re-modeled in `rfq` |
  | **DE-3** Trust signals (firewall) | read | consumed as gate/scoring inputs; **never mutated** (R7) |
  | **DE-4** Operations CRM / post-award engagement | read / emit | buyer CRM read under non-disclosure (R5); engagement created by Operations on the emitted `RFQClosedWon` event |
  | **DE-5** Admin moderation / ban | read | `moderate_rfq` (§4) reflects the Admin decision; ban reflected in the engine gate |
  | **DE-6** Communication (notification + clarification thread) | emit | RFQ emits events only; **authors no notification or thread contract; no webhook** (single-authorship) |
  | **DE-7** Billing entitlement/quota (firewall) | read / consume | quota read per the three-instrument identity (R7, §5.3); **no ledger owned; payment never influences matching** |
  | **DE-8** Platform Core (`core.*`) | consume | events via the Doc-4B outbox; audit via `core.append_audit_record` |

- **Binds:** `Doc-4E` Appendix C (DE-1…DE-8); `Doc-2 §8`; `Doc-4B`; `Doc-4A §4.2/§4.4`.

### 8.4 Emitted Domain Events (outbox — no wire)

- M3's domain events (`RFQCreated`, `RFQSubmitted`, `RFQApproved`, `RFQClosedWon`, `RFQClosedLost`, `QuotationSubmitted`, `QuotationWithdrawn`, `QuotationSelected`, `InvitationAccepted`, `InvitationDeclined`, … — exact catalog owned by `Doc-4E §E12` / Doc-2, **bound by pointer, never restated or invented**) are written to the **Doc-4B transactional outbox** within the same transaction as the state change, then delivered by infrastructure (Inngest). **No event is a wire field; no consumer/notification/webhook contract is authored** (DE-6 single-authorship). Idempotent command replay (§4.3/§5.4/§6.4) does **not** re-emit an already-emitted event (`Doc-5A §9.7`).
- **Binds:** `Doc-4E §E12`; `Doc-2 §8`; `Doc-4B` outbox; `Doc-5A §9.7`.

### 8.5 Explicit Protocol Exclusion & Flag-and-Halt

- For **every** §8 mechanism — the 8 engine workers, the internal read legs, the DE-1…DE-8 integrations, and the emitted events — **no REST endpoint, no SSE/WebSocket stream, and no webhook** is defined or may be added. There is no synchronous engine facade, no engine control surface, and no public RFQ board (R5). Matching/routing reads (§7) expose **derived/explainability artifacts only** — observational, never a control surface, never disclosing a protected fact.
- Proposing **any** wire surface (any protocol) for the engine, the internal reads, or the integrations is an **architecture-affecting change** → **flag-and-halt** + human/Board approval (`Doc-5_Program_Governance_Note_v1.0 §7`; CLAUDE.md Red-Flag list). Doc-5E does not, and may not, grant them a wire.
- **Binds:** Gov-Note §7; structure R1 / Fences; `Doc-5A §11`.

---

## §9 — Conformance & Carried Items

### 9.1 Conformance Obligation

- Before freeze, Doc-5E **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) for every caller-facing endpoint (§4–§7). Freeze eligibility and the `[B]`/`[M]`/`[m]` severity discipline are governed by **`Doc-5A Appendix A §A.0`** / **Gov-Note §6** — not restated here. The attestation is **Appendix A** below.

### 9.2 Carried Items (by pointer; resolved only via Doc-4E channels)

| ID | Status | Effect on Doc-5E |
|---|---|---|
| **DE-1** | OPEN (out-of-wire) | Identity authorization/delegation consumed in-process (§3/§8.3); no M1 surface realized here |
| **DE-2** | OPEN (out-of-wire) | Marketplace `vendor_matching_attributes` read in the engine (§8); never re-modeled (moat seam) |
| **DE-3** | OPEN (out-of-wire) | Trust signals consumed as gate/scoring inputs; never mutated (firewall, R7) |
| **DE-4** | OPEN (out-of-wire) | Operations CRM read under non-disclosure (R5); engagement on emitted `RFQClosedWon` (§8) |
| **DE-5** | OPEN (out-of-wire) | `moderate_rfq` (§4) reflects the Admin decision; ban reflected in the engine gate (§8) |
| **DE-6** | OPEN (out-of-wire) | RFQ emits events only; authors no notification/thread contract; no webhook (§8.4) |
| **DE-7** | OPEN (out-of-wire) | Quota read/consumed per three-instrument identity (R7, §5.3); no ledger; payment never influences matching |
| **DE-8** | OPEN (out-of-wire) | Platform Core consumed by pointer; events via outbox (§8.4); audit via `core.append_audit_record` |
| `[ESC-RFQ-AUDIT]` | OPEN | Audit actions not separately enumerated in Doc-2 §9 bound to the nearest §9 action; channel Doc-2 §9 additive; never invented (§4.5/§6.4/§7.4) |
| `[ESC-RFQ-POLICY]` | **CONDITIONAL** | `rfq.*` POLICY keys (idempotency/dedup windows) referenced by exact Doc-3 §12.2 name; **No gate if every referenced key exists in Doc-3 §12.2; blocks if any referenced key is unregistered** (`CHK-5A-121`; Doc-3 §12.2 additive first). The freeze audit confirms registration. |
| `[ESC-RFQ-SLUG]` | OPEN | Human-assist / routing-rule admin slugs interim `staff_*`; least-privilege slug = future Doc-2 §7 patch; escalate, never invent (§7) |

### 9.3 Doc-5E Coins Nothing

- Doc-5E realizes the wire face of the frozen Doc-4E contracts and **coins no** endpoint identity, HTTP status, header token, error class, `error_code`, permission slug, POLICY key, or event (`CHK-5A-121/154`; `Doc-4A §6.4/§20.1`). The realization-convention decisions (§4.6 `reissue_rfq`; §6.1 nested/singleton paths; §7.2 `manage_routing_rule` per-variant) are transport-addressing disambiguations on which Doc-5A is silent (§0.4), contradicting nothing upstream. Carried `DE-*` / `[ESC-RFQ-*]` are **escalated**, never invented (`CHK-5A-123`).
- **Binds:** `Doc-5A Appendix A`; `Doc-4A §6.4/§20.1`.

---

## Appendix A — Doc-5E Conformance Attestation

Per-band attestation of the realized M3 caller-facing surface (§4–§7, the 30 endpoints) against the Doc-5A **Appendix A** checklist. **PASS** = satisfied for every endpoint to which the check applies; **N/A** = precondition absent (reason cited). No `[B]`/`[M]` unresolved; no `[m]` deviation. One item remains **conditional, freeze-gated** (`[ESC-RFQ-POLICY]` key registration — `CHK-5A-121`), confirmed by the Freeze Readiness Audit.

| ID | Sev | Result | Evidence / scope |
|---|---|---|---|
| CHK-5A-010 | B | PASS | JSON/UTF-8 envelope — §4–§7 (`Doc-5A §3`) |
| CHK-5A-011 | M | PASS | Field names `snake_case`, from Doc-4E by pointer |
| CHK-5A-012 | B | PASS | Money fields present (`estimated_value`, quotation price) — currency-tagged per `Doc-4E`/`Doc-4A §8`; multi-currency-ready, not restated |
| CHK-5A-013 | M | PASS | `updated_at`/timestamps in §3 canonical form |
| CHK-5A-014 | B | PASS | `{id}`/identifiers = UUIDv7; `RFQ-YYYY-…` human ref not a mutation-path id |
| CHK-5A-015 | B | PASS | Enums/state names from Doc-2/Doc-4M; none invented |
| CHK-5A-020 | M | PASS | Single §4 success envelope |
| CHK-5A-021 | B | PASS | Only registered standard headers (`Authorization`, `Iv-Active-Organization`, `Idempotency-Key`, concurrency precondition per Doc-5A §9) |
| CHK-5A-022 | M | PASS | `Iv-` used only for registered tokens |
| CHK-5A-023 | B | PASS | No identity/role/permission/tenant-assertion header — authorization server-side (§3) |
| CHK-5A-024 | B | PASS | `Authorization` present; `Iv-Active-Organization` on buyer/vendor ops, absent on Admin (§3.3/§4.5/§7.1) |
| CHK-5A-025 | M | PASS | `Idempotency-Key`/concurrency precondition present exactly per §4.3/§5.4/§6.4/§7.4 |
| CHK-5A-030 | B | PASS | Every caller endpoint instantiates the §5.7 template — §4.1/§5.1/§6.1/§7.1 |
| CHK-5A-031 | B | **PASS** | Method per §5.2 — create→POST/201, versioned edit→PATCH, state/domain command→POST named, read→GET; no `PUT`, no soft-delete on this surface (terminal states reached by named state commands). `reissue_rfq` (create-via-source-command) and `manage_routing_rule` (multi-operation single contract) are **transport-addressing disambiguations** on which §5.2 is silent (§0.4) — not method-rule deviations |
| CHK-5A-032 | B | PASS | Paths follow §5.3 grammar; nested/singleton segments per §0.4 (§5.3 silent) |
| CHK-5A-033 | B | PASS | State changes are named commands, never arbitrary field replacement |
| CHK-5A-034 | B | PASS | Input placement per §5.4; no prohibited field (actor/org-selection/authz/state/attribution never input) |
| CHK-5A-035 | M | PASS | Success `200`/`201` per §5.5; no `202` (engine downstream — §8/§2.1) |
| CHK-5A-036 | m | PASS | No abstract `get`/`update` verb in a path (named commands are compound operations) |
| CHK-5A-040 | B | PASS | class→status per §6.2 — §4.4/§5.4/§6.4/§7.4 |
| CHK-5A-041 | B | PASS | §6 canonical error envelope |
| CHK-5A-042 | B | PASS | Top-level `reference_id` on every body-bearing response (`Doc-4A §22.1 C-05`) |
| CHK-5A-043 | B | PASS | Codes within registered `rfq_` namespace (`Doc-4A Appendix B.2`) |
| CHK-5A-044 | M | PASS | `retryable` per §6 class; `QUOTA`→`403` (quota), `RATE_LIMITED`→`429`, `DEPENDENCY`→`503` retryable per §6 |
| CHK-5A-045 | M | PASS | Quota surface present — `submit_quotation` consumes the three-instrument quota read from Billing (DE-7, R7); `QUOTA`→`403` per §6.2; RFQ owns no ledger |
| CHK-5A-050/051/052 | B | PASS | No-access vs not-found indistinguishable (status/body/timing) — §3.6/§4.5/§7.3 (**R5 — see dedicated item below**) |
| CHK-5A-053 | B | PASS | Non-disclosed rows undetectable (blacklist/deferral/gate-fail = `404` collapse, identical to genuinely-absent) — §3.6 |
| CHK-5A-060 | B | PASS | `Authorization` = authentication only (§3.1) |
| CHK-5A-061 | B | PASS | **`Iv-Active-Organization` server-validated, never client-trusted** (§3.3) — buyer vs vendor org is server-resolved |
| CHK-5A-062 | B | PASS | No authz assertion from client input (§3.5); no plan/payment value a matching input (R7 firewall) |
| CHK-5A-063 | M | PASS | Actor-type + §6B delegation resolved server-side (§3.2/§3.4) |
| CHK-5A-070 | B | PASS / N/A | Cursor pagination on list reads (`list_rfqs`, `list_quotations_for_rfq`, `list_invitations`); N/A singletons (`get_comparison_statement`) |
| CHK-5A-071 | M | PASS | Page bound via POLICY key (`[ESC-RFQ-POLICY]`) on paginated lists |
| CHK-5A-072 | M | PASS | Filter/sort allowlist per Doc-4E; no protected-fact filter exposed (R5) |
| CHK-5A-073 | B | PASS | Counts/items exclude non-disclosed/deferred/gated-out identically (R5 — no count leak) |
| CHK-5A-080 | B | PASS | `Idempotency-Key` on `required` mutations (§4.3/§5.4/§6.4/§7.4) |
| CHK-5A-081 | B | PASS | Replay → same result, no duplicate audit record, **no re-emitted outbox event** (§8.4; `Doc-5A §9.7`) |
| CHK-5A-082 | M | PASS | Optimistic concurrency precondition (`expected_version_no`) on `update_rfq`/`revise_quotation`; carriage owned by Doc-5A §9 |
| CHK-5A-083 | m | PASS | Retry aligned to §6 `retryable` |
| CHK-5A-090…095 | B/M | N/A | All M3 **caller** contracts commit synchronously; no caller `202`. The async engine is out-of-wire (§8), not a caller async pattern |
| CHK-5A-100/102 | B/M | N/A | No event-driven completion on the caller surface; engine results observed via reads (§2.1) |
| CHK-5A-101 | B | PASS | No external webhook/push surface; DE-6 single-authorship — no notification/thread contract (§8.4/§8.5) |
| CHK-5A-103 | m | PASS | Event catalog not restated — events emitted via outbox (§8.4), bound by pointer (`Doc-4E §E12`) |
| CHK-5A-110 | B | PASS | No URL/query versioning; surface version via `Iv-Api-Version` (conditional, owned by §12) |
| CHK-5A-111/113 | M | N/A | Initial `v1`; no breaking change / deprecation |
| CHK-5A-112 | B | PASS | Contract identity stable; no `…V2` resource |
| CHK-5A-114 | B | PASS | No domain change expressed as a version bump |
| CHK-5A-120 | B | PASS | No upstream content restated; Doc-3/Doc-4E/Doc-4M bound by pointer |
| CHK-5A-121 | B | **PASS (conditional)** | Nothing coined — §9.3. `[ESC-RFQ-POLICY]` keys referenced by exact Doc-3 §12.2 name; freeze-gated on registration (every referenced key must exist in Doc-3 §12.2 — confirmed by the Freeze Audit) |
| CHK-5A-122 | m | PASS | Transport choices marked `[realization convention]` (§4.6/§6.1/§7.2/§2.5) |
| CHK-5A-123 | B | PASS | Nested/singleton/source addressing surfaced; `DE-*`/`[ESC-RFQ-*]` escalated, not invented |
| CHK-5A-124 | B | PASS | No invented webhook/push; no synchronous engine facade (§8.5) |
| CHK-5A-131 | B | PASS | `Owner-Module` = Module 3 on every endpoint |
| CHK-5A-132 | B | PASS | Each of the 30 traces to a frozen Doc-4E contract (PassB); 8 engine workers + internal legs are out-of-wire (§8), count 38 unchanged |
| CHK-5A-133 | B | PASS | No undefined aggregate referenced (`rfqs`, `quotations`, `rfq_invitations`, `routing_rules`) |
| CHK-5A-134 | B | PASS | Contract identity stable under §12 |
| CHK-5A-141 | B | PASS | Resources only under the `rfq` namespace |
| CHK-5A-142 | B | PASS | No foreign-aggregate read/mutate on the wire; cross-module = out-of-wire (§8) |
| CHK-5A-143 | B | PASS | Cross-module via approved channel (in-process service / outbox event), no foreign-namespace endpoint |
| CHK-5A-144 | B | PASS | No ownership contradiction; defers to Doc-4A Appendix A |
| CHK-5A-151 | B | PASS | `rfq` route prefix in App B.1 (`Doc-2 §0.3`) |
| CHK-5A-152 | B | PASS | `rfq_` code prefix in `Doc-4A Appendix B.2` |
| CHK-5A-153 | B | PASS | Standard-header tokens in App B.4, agree with §4.4 |
| CHK-5A-154 | B | PASS | No self-assigned namespace/registry token |

### Dedicated attestation — R5 Non-Disclosure (highest-risk M3 audit area)

Attested against `CHK-5A-050…053` + `Doc-4A §7.5`; first-class M3 wire invariant (`Doc-3 §2.1/§4.2/§5.1/§9.5` FIXED; `Doc-2 §10.11`).

| Aspect | Result | Evidence |
|---|---|---|
| Blacklist exclusion indistinguishable from non-match | PASS | §3.6 — `404` collapse identical in status/body/timing; no field exposes the exclusion |
| Capacity **deferral** indistinguishable from non-match | PASS | §3.6/§7.3 — `drain_deferred_queue` (§8) non-disclosing; no routing-log/read field reveals deferral |
| Any eligibility-gate failure indistinguishable from non-match | PASS | §3.6 — gate-fail = non-match on every read/count/list/error |
| No public RFQ board; RFQs distributed, never published | PASS | §3.6/§4.5 — `list_rfqs` buyer-org-scoped only; no discover/list-all-open endpoint exists (R5) |
| Counts/aggregates/explainability non-disclosing | PASS | §7.3 — matching results/routing logs expose derived artifacts only; no gated-out/blacklisted/deferred vendor surfaced; observational, not a control surface |
| Loss feedback banded, never exact | PASS | §6.3 — `Doc-3 §9.5` by pointer; banded only |
| Vendor-house representative conflict never surfaced to buyer | PASS | §3.4/§5.3 — surfaced inside the vendor org only |

**Attestation result:** all applicable `[B]`/`[M]` checks **PASS**; `[m]` PASS, no deviation. The R5 non-disclosure invariant is attested PASS across all seven aspects. One item is **conditional and freeze-gated** — `[ESC-RFQ-POLICY]` key registration (`CHK-5A-121`), confirmed by the Doc-5E Freeze Readiness Audit. No other unresolved checklist item remains; freeze eligibility is determined by that audit.

---

*End of Doc-5E Content v1.0, Pass 3 (§8–§9 + Appendix A) — the final content pass. The 8 System engine workers, the internal-service read legs (dual-path rule), the DE-1…DE-8 cross-module integrations, and the emitted outbox events are fenced **out-of-wire** (§8) with an explicit protocol exclusion and flag-and-halt clause; the engine has no caller wire and no `202` (observed via reads); Appendix A attests all applicable `[B]`/`[M]` PASS with a dedicated R5 non-disclosure attestation (the highest-risk M3 area); `[ESC-RFQ-POLICY]` registration is the sole freeze-gated conditional; Doc-5E coins nothing. Doc-5E content (§0–§9 + Appendix A) is complete; next is the Doc-5E Freeze Readiness Audit, conforming to `Doc-5E_Structure_v1.0_FROZEN.md`.*
