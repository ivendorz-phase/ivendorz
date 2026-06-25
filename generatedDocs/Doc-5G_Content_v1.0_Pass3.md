# Doc-5G — Trust & Verification (M5 `trust`) API Realization — Content v1.0, Pass 3 (§6–§9 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5G — Trust & Verification (Module 5) — API Realization |
| Pass | 3 of 3 — §6 (fraud & risk signals), §7 (reviews & admin ratings), §8 (out-of-wire boundary), §9 (conformance & carried items), Appendix A — final content pass |
| Status | ACTIVE — Content Pass 3 of 3; §6–§9 + Appendix A. **Independent Hard Review applied (Pass-3):** MINOR-01 §6.4/§7.4 cursor-pagination added for `list_fraud_signals`/`list_admin_ratings`; MINOR-02 §7.1 `[realization convention §0.4]` keyword added for `set_admin_rating`, CHK-5A-122 evidence updated to §7.1; MINOR-03 §8.3 event tokens replaced with pure `Doc-2 §8` pointer, CHK-5A-103/120 updated; O-01 §6.4 "Emits no caller event" replaced with precise Doc-2 §8 / Doc-4G §G7 citation; O-02 CHK-5A-133 entity count sourced to `Doc-4G §G4–§G8`; O-03 App A preamble freeze-gate temporal clarification added; NP-01 CHK-5A-035 `+Location` added for creates; NP-02 §8.4 protocol list enumerated; NP-03 §9.2 DG table Owner Module column added. **0 open BLOCKER/MAJOR/MINOR.** On completion, Doc-5G content (§0–§9 + Appendix A) is complete → next is the Doc-5G Freeze Readiness Audit (gated on the `trust.*` POLICY-key registration patch) |
| Structure | Conforms to `Doc-5G_Structure_v1.0_FROZEN.md` |
| Realizes | The remaining 14 caller-facing endpoints (§6 = 6 fraud, §7 = 8 reviews/ratings) + the out-of-wire boundary (the 6 out-of-wire contracts, dual-audience internal legs, DG-1…DG-8 integrations, emitted outbox events) + the Doc-5A Appendix A attestation |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5G Content Pass-1 (§0–§3 + inventory) and Pass-2 (§4–§5) |
| Contains | The §6/§7 §5.7 realization, the §8 boundary statement (no realization), the §9 conformance obligation + carried-item register, and the Appendix A per-band attestation. No contract bodies, representations, error codes, POLICY keys, audit actions, events, Doc-4G rules, or **scores** restated |
| Audience | Architecture / API Governance Boards · Doc-5G authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** §6–§7 realize the **wire face** of the remaining caller surfaces; §8 declares the boundary (no endpoint, no realization); §9 + Appendix A attest. Nothing is coined. Fraud signals and admin ratings are the **highest-risk staff-internal non-disclosure surfaces** (R10); the **score-computation firewall** (R5) and the **DG-7 governance/Billing firewall** (R6) are the M5 signature. Transport choices marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§8/§9/§11`, Appendix A; `Doc-4G §G4–§G8`, Appendix; `Doc-2 §3.6/§8/§10.6`; `Doc-4B` outbox.

---

## §6 — Fraud & Risk Signal Surface Realization (BC-TRUST-4)

### 6.1 Endpoint Realization (§5.2/§5.3; inventory §2.4)
- Methods: `create_fraud_signal` → `POST /trust/fraud_signals` (`201`+`Location`, **Admin staff-reported leg**; the **21.5 System-detected leg is out-of-wire §8** — dual-audience fence, R12); `review_fraud_signal`/`action_fraud_signal`/`dismiss_fraud_signal` → `POST …/fraud_signals/{id}/{command}` (Admin state commands); reads → `GET` (`get_fraud_signal`, `list_fraud_signals`).
- Inputs per §5.4: `{id}`=`UUIDv7` in path; Request-Contract fields in body; **no** prohibited input (`Doc-4A §9.7`).
- **Binds:** `Doc-5A §5.2/§5.3`; `Doc-4G §G7`.

### 6.2 Fraud Triage State Machine (Doc-2 §3.6/§10.6 — Doc-4M index)
- The triage machine is realized as **legal transitions only** (no transition invented — `Doc-2 §3.6/§10.6`; `Doc-4M` index): `create_fraud_signal` enters **`open`**; `review_fraud_signal` **`open → reviewed`**; `action_fraud_signal` **`reviewed → actioned`** (terminal); `dismiss_fraud_signal` **`reviewed → dismissed`** (terminal). **`actioned`/`dismissed` are terminal — never reopen.** No freeze/acknowledge state exists in the corpus; the `reviewed` step is the investigation/acknowledgement transition (none invented). Illegal source → `STATE` → `409`; stale revision → `CONFLICT` → `409`.
- **Binds:** `Doc-2 §3.6/§10.6`; `Doc-4M`; `Doc-4G §G7.1/§G7.2`.

### 6.3 Staff-Internal Non-Disclosure (R10) & AI Rule (R12)
- **Disclosure scope (binding — §2/§3.6):** **every §6 surface is Staff-Internal** — fraud signals (detail, queue, disposition) are **never tenant-visible, never public** (R10); a cross-org or non-staff read collapses to a uniform `NOT_FOUND` (no side-channel). No Public projection exists or may be added.
- **AI rule (R12):** the **System/AI-detected `create_fraud_signal` leg is observational input only** (out-of-wire §8); **administrative disposition (`review`/`action`/`dismiss`) remains authoritative** — no AI authoritative write on any wire.
- **No ban (DG-5):** **Trust issues no ban** — the ban *decision* is Admin-owned (`Doc-4J`, bound by pointer); `action_fraud_signal` records the triage outcome, never a platform ban.
- **Binds:** `Doc-5A §6.3/§7`; `Doc-4A §7.5`; `Doc-4G §G7`; §3.6/§3.7; DG-5.

### 6.4 Idempotency, Concurrency, Error & Audit
- Mutations `Idempotency: required` (`trust.*` dedup key — `[ESC-TRUST-POLICY]`, content-freeze gate); a duplicate indicator within the dedup window produces **no second `open` row** (Doc-4G §G7.1 §10); optimistic precondition on triage commands; stale → `CONFLICT` → `409`. Error per `Doc-5A §6.2` (by pointer; codes `Doc-4G §G7`, `trust_`). Top-level `reference_id` on every body-bearing response (§4.4). Audited via `core.append_audit_record.v1`; fraud actions not separately enumerated carry **`[ESC-TRUST-AUDIT]`** (nearest §9; never invented). Authorization server-side via `check_permission` (Admin, `staff_*`; gap → `[ESC-TRUST-SLUG]`). `list_fraud_signals` cursor-paginated (page-size via `trust.*` key — `[ESC-TRUST-POLICY]`; no offset — `CHK-5A-070/071`). **Emits no cross-module event** (Doc-2 §8 has no fraud-signal event — `Doc-4G §G7` by pointer).
- **Binds:** `Doc-5A §6/§9`; `Doc-4G §G7`; `[ESC-TRUST-POLICY]`, `[ESC-TRUST-AUDIT]`, `[ESC-TRUST-SLUG]`.

---

## §7 — Reviews & Admin Ratings Surface Realization (BC-TRUST-5)

### 7.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
- Methods: `submit_review` → `POST /trust/reviews` (`201`+`Location`, **User**, engagement-gated); `moderate_review`/`publish_review` → `POST …/reviews/{id}/{command}` (Admin state commands); `remove_review` → `DELETE /trust/reviews/{id}` (Admin soft-delete — Doc-2 §10.6 SD=YES); `set_admin_rating` → `PATCH /trust/admin_ratings/{vendor_profile_id}` (Admin upsert, subject-keyed **[realization convention §0.4]**); reads → `GET` (`get_review`, `list_reviews`, `list_admin_ratings`).
- **Binds:** `Doc-5A §5.2/§5.3`; `Doc-4G §G8`.

### 7.2 Review Machine & Published-Review Ingestion (R9)
- The review machine is realized as **legal transitions only** (`Doc-2 §3.6/§10.6`; `Doc-4M` index): `submit_review` enters **`submitted`** (engagement-gated — buyer, post-award); `moderate_review` **`submitted → approved | rejected`**; `publish_review` **`approved → published`**; `remove_review` **`→ removed`** (hidden, soft-delete). Illegal source → `STATE` → `409`; stale `expected_revision` → `CONFLICT` → `409`.
- **Published-review ingestion (R9):** on publish, `publish_review` **invokes the §8 `ingest_performance_input` service in-module (Path B Buyer-Feedback) — it NEVER writes `performance_inputs` directly** (`BC-TRUST-3` remains the sole writer — Doc-4G F4G-M2). A replay re-invokes the ingestion **idempotently** (dedup at ingestion) — no duplicate input, no duplicate audit. An unavailable ingestion service is `DEPENDENCY` → `503` (retryable), never `REFERENCE`.
- **Binds:** `Doc-2 §3.6/§10.6`; `Doc-4M`; `Doc-4G §G8.1/§G8.2/§G8.3`; R9.

### 7.3 Disclosure Scope & Admin-Rating Internal-Only Firewall (R10)
- **Disclosure scope (binding, narrow-never-widen):** `get_review` / `list_reviews` → **Public-Badge** (**published reviews only**; + Internal-Service leg → §8, current known consumer: M2 review display DG-2). `set_admin_rating` + `list_admin_ratings` → **Staff-Internal** — the admin rating is a **SEPARATE authority from the public review** (Doc-4G H.9a): **staff-owned, internal-only, never public / tenant-visible / externally exposed** (R10); **no public/tenant projection of any kind**. A non-staff read of admin ratings collapses to `NOT_FOUND`.
- **Admin-rating firewall (Doc-4G H.9b):** the admin rating is an **internal signal — it mutates no Trust / Performance / Verification / Fraud / Tier signal** (`BUSINESS` if attempted); it is **not a platform score** (no score value on the wire — R5).
- **Binds:** `Doc-5A §6.3`; `Doc-4G §G8.4/§G8.5`; §3.6; R10.

### 7.4 Idempotency, Error & Audit
- Mutations `Idempotency: required` (`trust.*` dedup key — `[ESC-TRUST-POLICY]`); `set_admin_rating` update + review state commands carry the optimistic precondition (`expected_revision`); stale → `CONFLICT` → `409`. `list_reviews` and `list_admin_ratings` cursor-paginated (page-size via `trust.*` key — `[ESC-TRUST-POLICY]`; no offset — `CHK-5A-070/071`). Error per `Doc-5A §6.2` (by pointer; codes `Doc-4G §G8`, `trust_`). Top-level `reference_id` on every body-bearing response (§4.4). Audited via `core.append_audit_record.v1` — `publish`/`remove` separately enumerated (Doc-2 §9 Reviews); admin-rating set carries **`[ESC-TRUST-AUDIT]`** (nearest §9; never invented). **Emits no cross-module event** (Doc-2 §8 has no review/admin-rating event — H.7); Marketplace displays `published` reviews **via service** (DG-2), never table access.
- **Binds:** `Doc-5A §6/§8/§9`; `Doc-4G §G8`; `[ESC-TRUST-POLICY]`, `[ESC-TRUST-AUDIT]`.

---

## §8 — Out-of-Wire Boundary (score-computation firewall · perf-input sole-writer · perf-review trigger · expiry timers · System-detected fraud leg · dual-audience internal legs · integrations · events)

> §8 **declares a boundary; it realizes nothing.** No path, method, status, header, or schema is defined for any mechanism named here. Each is an async worker / in-process service / event consumer / outbox emission — never an M5 HTTP endpoint. Caller-visible results are observed only via the §4–§7 reads.

### 8.1 The 6 Out-of-Wire Contracts (no wire)

| Contract | Role (by pointer — Doc-4G) | Caller observes via |
|---|---|---|
| `compute_trust_score` | System auto-calc — **sole Trust Score writer** (score firewall R5; H.9a) | `get_trust_score` (band/display) |
| `compute_performance_score` | System auto-calc — **sole Performance Score writer** (R5; H.9a) | `get_performance_score` |
| `ingest_performance_input` | System — **sole writer of `performance_inputs`** (R9); dual-path (Operations events + RFQ `QuotationSubmitted` + published reviews) | `list_performance_inputs` (staff) |
| `trigger_performance_review` | System — review signal; **never edits a score** | RFQ/perf reads |
| `expire_verification` | System timer — `approved → expired` (R7) | `get_verification` |
| `expire_verified_tier` | System timer — `verified → expired` (R8) | `get_verified_tier` |

- **Score-computation firewall (R5 — highest-stakes R1):** `compute_*` are System-only and out-of-wire; **no caller action mutates a score value, and no score value / formula / threshold / weight is ever on a wire.** `freeze_*`/`reactivate_*` (caller-facing, §5) govern publication only.

### 8.2 Dual-Audience Internal Legs & System-Detected Fraud Leg (no wire)
- The **Internal-Service consumption leg** of the Public-Badge reads (`get_verified_tier`, `get_trust_score`, `get_performance_score`, `get_review`, `list_reviews`) and the **System-detected leg** of `create_fraud_signal` are realized **exclusively here** — in-process module composition via `trust/contracts/`, never HTTP — and **create no additional HTTP surface** (dual-audience fence; `Doc-4A §4.1/§4.3`). Consumers (M2/M3/M6) access the in-process service interface only; no cross-module table access.

### 8.3 DG-1…DG-8 Integrations & Emitted Events (no wire)
- **Integrations (in-process / by pointer):** DG-1 Identity (`check_permission` consumed); DG-2 Marketplace (consumes tier/score events; writes `financial_tier_history` — R8); DG-3 RFQ (`QuotationSubmitted` perf input; Trust owns no matching); DG-4 Operations (5 perf-input events → ingestion); DG-5 Admin (ban decision Admin-owned — Trust issues no ban); DG-6 Communication (notification fan-out on Trust events); DG-7 Billing (**firewall** — no commercial state influences any signal); DG-8 Platform Core (audit/outbox/timers). None is an M5 HTTP endpoint (One Owner — `Doc-4A §4.1/§4.3`).
- **Emitted events:** M5's `trust` domain events are bound by pointer to **`Doc-2 §8`** — the event catalog and payloads are owned there and **are not restated here** (`CHK-5A-103`). Events are written to the **Doc-4B transactional outbox** within the same transaction, then delivered by infrastructure; consumed by M2/M3/M6. **No event is a wire field; no consumer/notification/webhook contract is authored.** Idempotent replay does not re-emit an already-emitted event (`Doc-5A §9.7`).

### 8.4 Explicit Protocol Exclusion & Flag-and-Halt
- For **every** §8 mechanism — the 6 out-of-wire contracts, the dual-audience internal legs, the System-detected fraud leg, the DG-1…DG-8 integrations, and the emitted events — **no caller wire in any protocol** is defined or may be added:
  - No REST endpoint
  - No SSE / WebSocket stream
  - No Webhook
  - No GraphQL surface
  - No synchronous facade; no score/control surface
- Proposing **any** wire surface (any protocol) for these — **especially a score-computation or score-mutation surface** — is an **architecture-affecting change** → **flag-and-halt** + human/Board approval (`Doc-5_Program_Governance_Note_v1.0 §7`; CLAUDE.md Red-Flag list). Doc-5G does not, and may not, grant them a wire.
- **Binds:** Gov-Note §7; structure R1/R5/Fences; `Doc-4G §G4/§G5/§G6/§G7`; `Doc-2 §8`; `Doc-4B`; `Doc-5A §1.3/§11`.

---

## §9 — Conformance & Carried Items

### 9.1 Conformance Obligation
- Before freeze, Doc-5G **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) for every caller-facing endpoint (§4–§7). Freeze eligibility and the `[B]`/`[M]`/`[m]` severity discipline are governed by **`Doc-5A Appendix A §A.0`** / **Gov-Note §6**. The attestation is **Appendix A** below.

### 9.2 Carried Items (by pointer; resolved only via Doc-4G channels)

| ID | Owner Module | Status | Effect on Doc-5G |
|---|---|---|---|
| **DG-1** Identity | M1 | OPEN (consumed) | `check_permission`/org-context in-process; no Identity surface realized |
| **DG-2** Marketplace | M2 | OPEN (out-of-wire) | Consumes tier/score events; writes `financial_tier_history` (R8); no Marketplace surface |
| **DG-3** RFQ | M3 | OPEN (out-of-wire) | `QuotationSubmitted` perf input via ingestion (§8); Trust owns no matching |
| **DG-4** Operations | M4 | OPEN (out-of-wire) | 5 perf-input events → `ingest_performance_input` (sole writer, §8) |
| **DG-5** Admin | M8 | OPEN | Fraud triage realized (§6); **Trust issues no ban** (ban = `Doc-4J`) |
| **DG-6** Communication | M6 | OPEN (out-of-wire) | Trust emits to outbox (R11); notification dispatch Communication-authored |
| **DG-7** Billing | M7 | OPEN (**firewall**) | DG-7 verbatim invariant (R6); no commercial state on any wire |
| **DG-8** Platform Core | M0 | OPEN (consumed) | Audit/outbox/timers via Doc-4B by pointer |
| `[ESC-TRUST-SLUG]` | Doc-2 §7 | OPEN | Staff slugs not in Doc-2 §7 bound to nearest by pointer; never invented |
| `[ESC-TRUST-AUDIT]` | Doc-2 §9 | OPEN | Verification/tier/fraud/admin-rating actions not separately enumerated bound to nearest Doc-2 §9 action |
| `[ESC-TRUST-POLICY]` | Doc-3 §12.2 | **wire keys: RESOLVED** | `trust.idempotency_dedup_window` + `trust.list_page_size_max` **registered in Doc-3 §12.2** via the approved `Doc-3_Policy_Key_Registration_Patch_v1.3_Trust` (2026-06-25). Content-freeze gate cleared (`CHK-5A-121/071`; Doc-4A §18.2 satisfied). Out-of-wire keys (score thresholds/weights, expiry/review windows) — tracked, not a wire-conformance gate |

### 9.3 Doc-5G Coins Nothing
- Doc-5G realizes the wire face of the frozen Doc-4G contracts and **coins no** endpoint identity, HTTP status, header token, error class, `error_code`, permission slug, POLICY key, event, or **score value/formula/threshold/weight** (`CHK-5A-121/154`; `Doc-4A §6.4/§20.1`). The realization conventions (subject-keyed score/tier addressing; nested history/inputs; `set_admin_rating` upsert) are §0.4 transport disambiguations resolved from frozen sources (§2.6). Carried `DG-*` / `[ESC-TRUST-*]` are **escalated**, never invented (`CHK-5A-123`).
- **Binds:** `Doc-5A Appendix A`; `Doc-4A §6.4/§20.1`.

---

## Appendix A — Doc-5G Conformance Attestation

Per-band attestation of the realized M5 caller-facing surface (§4–§7, the 34 endpoints) against the Doc-5A **Appendix A** checklist. **PASS** = satisfied for every endpoint to which the check applies; **N/A** = precondition absent (reason cited). No `[B]`/`[M]` unresolved; no `[m]` deviation. One item is **conditional and content-freeze-gated** (`CHK-5A-121/071` / `[ESC-TRUST-POLICY]` — the `trust.*` POLICY-key registration patch). **This attestation is forward-looking: it assumes successful completion of the Doc-5G Freeze Readiness Audit and confirmation of the `trust.*` POLICY-key registration; until then, `CHK-5A-121/071` remains conditional and the PASS is not fully earned.**

| ID | Sev | Result | Evidence / scope |
|---|---|---|---|
| CHK-5A-010 | B | PASS | JSON/UTF-8 envelope — §4–§7 (`Doc-5A §3`) |
| CHK-5A-011 | M | PASS | Field names `snake_case`, from Doc-4G by pointer |
| CHK-5A-012 | B | N/A | No money field on the M5 wire — scores are bands/values, not currency; no commercial field (DG-7 firewall) |
| CHK-5A-013 | M | PASS | `updated_at`/timestamps in §3 canonical form |
| CHK-5A-014 | B | PASS | `{id}`/`vendor_profile_id` identifiers = UUIDv7 |
| CHK-5A-015 | B | PASS | Enums/state names from Doc-2; none invented |
| CHK-5A-020 | M | PASS | Single §4 success envelope |
| CHK-5A-021 | B | PASS | Only registered standard headers (`Authorization`, `Iv-Active-Organization`, `Idempotency-Key`, concurrency precondition) |
| CHK-5A-022 | M | PASS | `Iv-` used only for registered tokens |
| CHK-5A-023 | B | PASS | No identity/role/permission/tenant-assertion header — authorization server-side (§3) |
| CHK-5A-024 | B | PASS | `Authorization` on User/Admin; **absent on Public-Badge reads** (§3.1/R2); `Iv-Active-Organization` on the two User legs only (§3.3) |
| CHK-5A-025 | M | PASS | `Idempotency-Key`/concurrency precondition present exactly per §4.6/§5.5/§6.4/§7.4 |
| CHK-5A-030 | B | PASS | Every caller endpoint instantiates the §5.7 template (grouped section-level — Doc-5C/5D/5E precedent) — §4–§7 |
| CHK-5A-031 | B | PASS | Method per §5.2 — create→POST/201, command→POST named, soft-delete→DELETE, upsert→PATCH, read→GET; no `PUT`. Subject-keyed/nested addressing = §0.4 disambiguation, frozen-sourced (§2.6) |
| CHK-5A-032 | B | PASS | Paths follow §5.3 grammar; subject-keyed/nested per §0.4 (§5.3 silent) |
| CHK-5A-033 | B | PASS | State changes are named commands, never arbitrary field replacement |
| CHK-5A-034 | B | PASS | Input placement per §5.4; no prohibited field; **no score/commercial value as input** (R5/R6) |
| CHK-5A-035 | M | PASS | Success `200`/`201`+`Location` (creates: `request_verification`, `create_fraud_signal`, `submit_review`) per §5.5; no `202` (System mechanisms §8) |
| CHK-5A-036 | m | PASS | No abstract `get`/`update` verb in a path (named commands are compound operations) |
| CHK-5A-040 | B | PASS | class→status per §6.2 — §4–§7 |
| CHK-5A-041 | B | PASS | §6 canonical error envelope |
| CHK-5A-042 | B | PASS | **Top-level `reference_id` on every body-bearing response** (§4.4; `Doc-4A §22.1 C-05`; 204 exempt per PATCH-D4A-C05-204) |
| CHK-5A-043 | B | PASS | Codes within registered `trust_` namespace (`Doc-4A Appendix B.2`) |
| CHK-5A-044 | M | PASS | `retryable` per §6 class; `DEPENDENCY`→`503` (ingestion-service unavailable) retryable (§7.2) |
| CHK-5A-045 | M | N/A | No rate/quota surface on M5 |
| CHK-5A-050/051/052 | B | PASS | No-access vs not-found indistinguishable (status/body/timing) — §3.6/§4.5/§6.3/§7.3 (**non-disclosure band below**) |
| CHK-5A-053 | B | PASS | Staff-Internal rows (verification detail, fraud, admin ratings) undetectable to non-staff — uniform `404` |
| CHK-5A-060 | B | PASS | `Authorization` = authentication only (§3.1); Public-Badge reads carry none |
| CHK-5A-061 | B | PASS | **`Iv-Active-Organization` server-validated by M1 Identity, never client-trusted** (§3.3) on the two User legs |
| CHK-5A-062 | B | PASS | No authz assertion from client input (§3.4); **no shadow authorization path** |
| CHK-5A-063 | M | PASS | Actor-type (Public/User/Admin) resolved server-side via `check_permission` (§3.2/§3.4) |
| CHK-5A-070 | B | PASS | Cursor pagination on list reads (`list_verifications`, `list_*_history`, `list_performance_inputs`, `list_fraud_signals`, `list_reviews`, `list_admin_ratings`); no offset |
| CHK-5A-071 | M | PASS | Page-size bound via `trust.list_page_size_max` (Doc-3 §12.2, registered via Patch v1.3); `[ESC-TRUST-POLICY]` gate cleared |
| CHK-5A-072 | M | PASS | Filter/sort allowlist per Doc-4G; no protected-fact filter exposed (R10) |
| CHK-5A-073 | B | PASS | Counts/items exclude non-disclosed/soft-deleted/frozen-suppressed identically (no leak) |
| CHK-5A-080 | B | PASS | `Idempotency-Key` on `required` mutations (§4.6/§5.5/§6.4/§7.4) |
| CHK-5A-081 | B | PASS | Replay → same result, no duplicate audit, **no re-emitted outbox event, no duplicate `performance_inputs`** (§7.2/§8.3; `Doc-5A §9.7`) |
| CHK-5A-082 | M | PASS | Optimistic precondition (`expected_revision`) on optimistic commands |
| CHK-5A-083 | m | PASS | Retry aligned to §6 `retryable` |
| CHK-5A-090…095 | B/M | N/A | All M5 caller contracts commit synchronously; no caller `202`. Compute/ingest/trigger/timers are out-of-wire (§8) |
| CHK-5A-100/102 | B/M | N/A | No event-driven completion on the caller surface; results observed via reads |
| CHK-5A-101 | B | PASS | No external webhook/push surface (§8.4) |
| CHK-5A-103 | m | PASS | Event catalog/payloads owned by `Doc-2 §8`, not restated — pure pointer (§8.3); emitted via `Doc-4B` outbox |
| CHK-5A-110 | B | PASS | No URL/query versioning; surface version via `Iv-Api-Version` (conditional, owned by `Doc-5A §12`) |
| CHK-5A-111/113 | M | N/A | Initial `v1`; no breaking change / deprecation |
| CHK-5A-112 | B | PASS | Contract identity stable; no `…V2` resource |
| CHK-5A-114 | B | PASS | No domain change expressed as a version bump |
| CHK-5A-120 | B | PASS | No upstream content restated; Doc-4G/Doc-2/Doc-4M bound by pointer; **no score value/formula restated; no event catalog or names restated** (§8.3 pure pointer) |
| CHK-5A-121 | B | **PASS** | Nothing coined — §9.3. The two `trust.*` POLICY keys are **registered in Doc-3 §12.2** via approved Patch v1.3 (Doc-4A §18.2 satisfied); `[ESC-TRUST-POLICY]` gate cleared |
| CHK-5A-122 | m | PASS | Transport choices marked `[realization convention]` with explicit keyword (§2.1/§2.6/§4.1/§5.1/§7.1) |
| CHK-5A-123 | B | PASS | Subject-keyed/nested addressing surfaced; `DG-*`/`[ESC-TRUST-*]` escalated, not invented |
| CHK-5A-124 | B | PASS | No invented webhook/push; no synchronous score facade (§8.4) |
| CHK-5A-131 | B | PASS | `Owner-Module` = Module 5 on every endpoint |
| CHK-5A-132 | B | PASS | Each of the 34 traces to a frozen Doc-4G contract (PassB); the 6 out-of-wire are §8; total 40 unchanged |
| CHK-5A-133 | B | PASS | No undefined aggregate referenced (7 owned M5 entities per `Doc-4G §G4–§G8` aggregate inventory) |
| CHK-5A-134 | B | PASS | Contract identity stable under §12 |
| CHK-5A-141 | B | PASS | Resources only under the `trust` namespace |
| CHK-5A-142 | B | PASS | No foreign-aggregate read/mutate on the wire; cross-module = out-of-wire (§8) |
| CHK-5A-143 | B | PASS | Cross-module via approved channel (in-process service / outbox event), no foreign-namespace endpoint |
| CHK-5A-144 | B | PASS | No ownership contradiction; defers to Doc-4A Appendix A |
| CHK-5A-151 | B | PASS | `trust` route prefix in App B.1 (`Doc-2 §0.3`) |
| CHK-5A-152 | B | PASS | `trust_` code prefix in `Doc-4A Appendix B.2` |
| CHK-5A-153 | B | PASS | Standard-header tokens in App B.4, agree with §3/§4 |
| CHK-5A-154 | B | PASS | No self-assigned namespace/registry token |

### Dedicated attestation — Score-Computation Firewall (the M5 signature)

Attested against structure R5 + `Doc-4G` H.9a + §5/§8.

| Aspect | Result | Evidence |
|---|---|---|
| `compute_trust_score` / `compute_performance_score` are System-only and out-of-wire | PASS | §8.1 — no path/method/status; sole score writers (H.9a) |
| Only `freeze_*` / `reactivate_*` are caller-facing — publication/ranking effect only | PASS | §5.2 — `freeze_state` toggle; never edits/recomputes/zeroes the value |
| `ingest_performance_input` is the sole writer of `performance_inputs`; `publish_review` invokes, never writes | PASS | §7.2/§8.1 — Path B in-module invocation; no direct write |

### Dedicated attestation — No Score Value Caller-Editable (NP-03, separate)

| Aspect | Result | Evidence |
|---|---|---|
| **No caller request — User or Admin — can write, set, or edit a Trust Score or Performance Score value** | PASS | §3.5/§5.1/§5.4 — no score value is a wire input; no caller endpoint mutates a score |
| No score value, formula, threshold, weight, or raw input appears on any wire | PASS | §2.1/§5.3 — badge reads expose band/display only; inputs Staff-Internal; formula/thresholds never on wire (N5G-01/02) |
| Admin rating is not a platform score and mutates no governance signal | PASS | §7.3 — internal-only; mutates no Trust/Performance/Verification/Fraud/Tier (Doc-4G H.9b) |

### Dedicated attestation — Non-Disclosure (verification / fraud / admin ratings)

| Aspect | Result | Evidence |
|---|---|---|
| Verification case detail (beyond status) never tenant-visible or public | PASS | §4.5/§6.3 — Staff-Internal; cross-org → `NOT_FOUND` |
| Fraud signals never tenant-visible or public | PASS | §6.3 — all §6 surfaces Staff-Internal; no Public projection |
| Admin ratings never public / tenant-visible / externally exposed | PASS | §7.3 — internal-only, no public/tenant projection (Doc-4G H.9a) |
| Governance/Billing firewall — no commercial state influences any signal | PASS | §3.5/§5.4 — DG-7 verbatim (R6); no commercial value on any wire |

**Attestation result:** all applicable `[B]`/`[M]` checks **PASS**; `[m]` PASS, no deviation. The score-computation firewall, no-score-value-caller-editable, and non-disclosure invariants are attested PASS across all aspects. The former `[ESC-TRUST-POLICY]` content-freeze gate is **cleared** — both `trust.*` POLICY keys are registered in Doc-3 §12.2 via approved Patch v1.3 (CHK-5A-121/071 PASS). **No unresolved checklist item remains.**

---

*End of Doc-5G Content v1.0, Pass 3 (§6–§9 + Appendix A) — the final content pass. §6 fraud triage (`open → reviewed → actioned | dismissed` terminal; staff-internal R10; AI observational R12; Trust issues no ban DG-5); §7 reviews (engagement-gated submit; publish invokes the §8 ingestion R9, never writes `performance_inputs`; remove soft-delete) + admin ratings (internal-only, not a platform score); the 6 out-of-wire contracts, dual-audience internal legs, System-detected fraud leg, DG-1…DG-8 integrations, and emitted outbox events fenced **out-of-wire** (§8) with explicit protocol exclusion (REST/SSE/WS/webhook/GraphQL) + flag-and-halt (the score-computation firewall the highest-stakes R1/R5); Appendix A all applicable `[B]`/`[M]` PASS with dedicated **score-computation-firewall**, **no-score-value-caller-editable**, and **non-disclosure** bands; the `trust.*` POLICY-key registration (`[ESC-TRUST-POLICY]`) is the sole content-freeze-gated conditional; Doc-5G coins nothing. Doc-5G content (§0–§9 + Appendix A) is complete; next is the Doc-5G Freeze Readiness Audit — gated on the additive Doc-3 §12.2 `trust.*` registration patch — conforming to `Doc-5G_Structure_v1.0_FROZEN.md`.*
