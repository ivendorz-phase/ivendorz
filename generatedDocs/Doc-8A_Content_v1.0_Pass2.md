# Doc-8A — Test & Conformance Realization Metastandard — **Content Pass-2 (§5–§9)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 of `Doc-8A_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-3 (§10–§12 + Appendix A check IDs) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8A_Structure_v1.0_FROZEN` §5–§9; R-set R4 (§5) · R6 (§6) · R7/R8 (§7) · R9 (§8) · R10 (§9) |
| Authority | Frozen corpus governs; the *what*-corpus (Doc-2/3/4) + the Doc-5/6/7 realization contracts = the oracle (binding); Doc-8 = the conformance harness, subordinate to its oracle |
| Posture | Reference-never-restate. Mechanism only — **no test code, no fixtures, no assertions, no suite files**. Every assertion-convention binds its oracle by pointer; nothing copied/invented |
| Coins | **Nothing.** No contract, field, error class, slug, state, event, audit action, POLICY key, or expected value |

> **Scope of this pass:** the per-discipline assertion *conventions* each owning suite realizes — contract & API conformance (§5 → Doc-8C), persistence/migration/RLS (§6 → Doc-8D), domain/invariant/firewall/state-machine (§7 → Doc-8E), integration & event-flow (§8 → Doc-8F), frontend & e2e (§9 → Doc-8G). Each section fixes *how to assert*, not the cases themselves (those are the per-suite content). §10–§12 + Appendix A check-ID assignment land in Pass-3.

---

## §5 — Contract & API Conformance Realization *(mechanism only — realized in Doc-8C; oracle = the frozen Doc-5 surface)*

### §5.1 Envelope conformance
Every response from a frozen Doc-5x contract is asserted against the canonical envelope (`Doc-5A §5.6`) — shape, success/error discriminant, and metadata block — **by pointer, never a re-described shape**. A contract whose response deviates from `§5.6` is a code defect (§3.4 case 1).

### §5.2 Cursor-pagination conformance
Every list contract is asserted against the cursor-pagination grammar (`Doc-5A §8`): opaque cursor, stable deterministic sort key, forward/back semantics. The page-size ceiling binds to the contract's **`*.list_page_size_max`** POLICY key (`Doc-3 §12`) **by pointer — never a literal**; a suite asserts the boundary (request at, above, and below the bound) by reading the registered key, not by hard-coding its value.

### §5.3 Error-taxonomy conformance
Every error path maps to a `Doc-5A §6.2` error class **at its fixed HTTP status**; the suite asserts the class + status pair, never an invented error class or a re-mapped status (§3.2 oracle-by-pointer; §3.3 no-respecify). An error the contract does not declare is a code defect; a missing-but-needed class is `[ESC-8-API]`.

### §5.4 Idempotency conformance
Every mutation contract is asserted for idempotency: a replayed request inside the **`*.idempotency_dedup_window`** (`Doc-3 §12`, by pointer) yields the deduplicated result, not a double-effect. The window is read from the registered key; the dedup-persistence it relies on is asserted at the data layer (§6, Doc-8D).

### §5.5 Prohibited-request-field conformance
Every contract is asserted to **reject the prohibited request-field categories** (`Doc-4A §9.7`): attribution, audit, tenant-selection, authorization, ownership-change, lifecycle-state, governance signals, soft-delete-as-direct-write, `human_ref`-as-reference, and inline tunable limits. A contract that accepts a client-supplied value from any prohibited category is a code defect — these are the fields the server owns, never the caller.

### §5.6 Actor-scope & field-trace conformance
Reads are asserted **actor-scoped per the owning Doc-4x** (the actor model each contract declares — User/Admin/System/anonymous); a contract must not return rows outside the caller's actor scope. Every request/response field traces verbatim to its owning **`§HB` contract** (inputs/outputs/validation); a field with no `§HB` source is a coined expectation (forbidden — §3.2).

### §5.7 Untestable contract → `[ESC-8-API]`; what §5 does not do
Where a frozen Doc-5x contract cannot be asserted as written (missing observable, ambiguous error mapping, untestable idempotency), flag-and-halt → `[ESC-8-API]` (additive Doc-5x patch, Board), never a locally-relaxed assertion. §5 instantiates **no case** — the contract suites are realized in Doc-8C against these conventions.

---

## §6 — Persistence, Migration & RLS Conformance Realization *(mechanism only — realized in Doc-8D; oracle = the frozen Doc-6 schema)*

### §6.1 Schema-constraint conformance
Each realized table is asserted against its Doc-6 schema: the standard columns (`id UUIDv7`, timestamp/actor/tenant/soft-delete tuples — `Doc-6A §3`); **partial-unique `... WHERE deleted_at IS NULL`** on every soft-deletable unique constraint (`Doc-6A §5 / R5` — never an `is_deleted` boolean); CHECK constraints for enumerated state/currency (`Doc-6A §5`); and **multi-currency** storage — every monetary amount is `NUMERIC` with an explicit adjacent currency column, default `'BDT'` (`Doc-6A R9` / `Doc-2 §0.4`), never an implicit currency.

### §6.2 Immutability & versioning conformance
Assert Invariant #8 at the data layer (`Doc-6A §6 / R7`): soft-deleted rows are excluded from routing/matching/search/default queries; versioned tables are immutable once a binding state is reached (a write to a frozen version is rejected by the trigger/constraint; a revision is a new row); append-only history tables reject update/delete; IDs are never reused. The **sole enumerated exception** — the regenerable `ai.*` cache permits TTL hard-delete (`Doc-5K R7`) — is asserted as *legitimately* destructible; no other authoritative table is.

### §6.3 Migration conformance (`Doc-6A §11 / R10`)
Assert the migration discipline Doc-6 delegates to Doc-8 (`Doc-6A §11` — "the migration test/CI obligation is Doc-8's"): **forward-only** sequencing; **expand-contract / non-destructive on authoritative tables** (a migration that drops or destructively rewrites an authoritative column fails — Invariant #8; destructive permitted **only** on the `ai.*` cache); **seed-migration** verification (the registered `Doc-3 §12` POLICY keys + the Doc-2 §7 role/permission seeds land); **Prisma-codegen integrity** (the generated client in `generated-contracts-registry/` is current and never hand-edited — CLAUDE.md §10).

### §6.4 The RLS positive / negative / cross-tenant byte-equivalence gate (`Doc-6A R8/§4`; R6) — **defining suite; mandatory band**
This is the **single defining assertion** of the cross-tenant security gate (structure allocation table; composing re-assertion at the UI in §9.6). Assert all four:

- **Positive** — an authorized actor under the active org sees exactly what the contract grants.
- **Negative** — an unauthorized actor is blocked at the **app layer** *and* at the **RLS backstop** (both, not either — RLS is defense-in-depth, the app layer is the model; CLAUDE.md §2).
- **Cross-tenant** — org A can never read/list/count org B's tenant-owned rows (the ≥2-org fixture — §4.1 — is the vehicle).
- **Non-disclosure byte-equivalence** (Invariant #11) — a blacklisted/excluded vendor's responses, counts, analytics, notifications, logs, and errors are **byte-equivalent** to a non-matched vendor's; `buyer_vendor_statuses` and `link_suggestions` are never observable in any vendor-facing surface, view, count, or error. The assertion compares the excluded-case output to the non-matched-case output and requires identity.

This band is **mandatory** for Doc-8D freeze (Appendix A).

### §6.5 Cross-module integrity conformance
Assert the **no-cross-schema-FK** rule (`Doc-6A §5`): cross-module references are bare UUID columns validated by the owning module's service, reconciled by the orphan-scan job; a schema with a cross-module foreign key, or a cross-schema RLS ownership traversal, is a defect. Intra-schema FKs within an aggregate boundary are permitted.

### §6.6 What §6 does not do
§6 instantiates **no case and no SQL** — the persistence/migration/RLS suites are realized in Doc-8D against these conventions.

---

## §7 — Domain, Invariant, Firewall & State-Machine Conformance Realization *(mechanism only — realized in Doc-8E; oracle = Doc-2/3/4M + CLAUDE.md §4/§5)*

### §7.1 Governance-signal firewall suites (the defining firewall assertion — CLAUDE.md §4)
A suite per firewall rule, each asserting **non-cross-mutation** of the five independent signals (CLAUDE.md §4):

- Financial Tier **never raises** Trust Score; Financial Tier **does not affect** Performance Score.
- Buyer Approved/Blacklisted (M4 CRM, buyer-private) **never mutates** platform-wide scores.
- **No secondary signal dominates** trust; **no single signal dominates** a matching decision.
- Scores are **auto-calculated under the System actor, never hand-edited** (a non-System write to a score table is rejected — bound by the `core.audit_records` `actor_type[…System…]` model, `Doc-6A §8`).

This is the **defining suite** for the firewall (structure allocation table); §8/§5 compose it where signals flow.

### §7.2 The 12-invariant suites
A suite per Core Invariant (CLAUDE.md §5), each binding its owning declaration by pointer: capability = 4-flag matrix not a label (#1); two role dimensions (#2); vendor claim-lifecycle + visibility scope (#3); RFQ state machine + control plane (#4); Users Act/Orgs Own (#5); firewall (#6 → §7.1); One Module One Owner (#7); nothing authoritative overwritten/hard-deleted (#8 → §6.2); Content ≠ Presentation (#9); Financial Tier ≠ Subscription Plan (#10); private exclusion stays private (#11 → §6.4 byte-equivalence); AI suggests, modules decide (#12).

### §7.3 The moat exercise
Assert the moat is exercised end-to-end: governed M3 matching/routing/sorting/scoring (`Doc-5E`) + M4 post-award document workflow & vendor CRM (`Doc-5F`). Matching/sorting authority is M3 — a suite never re-ranks results outside M3; it asserts M3's governed output.

### §7.4 State-machine conformance (`Doc-4M`; R8)
A suite per Doc-4M state machine (RFQ, quotation, verification, subscription, post-award documents, …), asserting: every **permitted** transition for the permitted actor in the permitted source state succeeds; every **illegal** transition (wrong edge / wrong actor / wrong source state) is rejected; no state label or edge exists that Doc-4M does not declare; optimistic-UI reconciliation (Doc-7 R9) converges to the server-authoritative state. No edge coined.

### §7.5 What §7 does not do
§7 instantiates **no case** — the domain/invariant/firewall/state suites are realized in Doc-8E; composing suites (§5/§8/§9) invoke these canonical assertions, never re-implement them.

---

## §8 — Integration & Event-Flow Conformance Realization *(mechanism only — realized in Doc-8F; oracle = Doc-2 §8 / Doc-4J / Doc-4L)*

### §8.1 Cross-module-boundary conformance
Assert that cross-module interaction occurs **only via `contracts/` and events** — no cross-module import beyond another module's `contracts/`, no cross-module table access, no cross-module foreign key (CLAUDE.md Red-Flag list; Invariant #7). A test that reaches into another module's internals to set up or verify a precondition is itself a boundary violation (§4.2).

### §8.2 Transactional write-plus-emit atomicity (`Doc-6A §7`; R9)
Assert the outbox transactionality: a business write and its **`core.outbox_events`** insert **commit or roll back together** — on a forced failure after the business write, the event must not be dispatched; on success, exactly one outbox row exists. The outbox is M0-owned (`Doc-4B`); no emitter writes another schema.

### §8.3 Event-payload & dispatch conformance
Assert every emitted event's name + payload against the **Doc-4J authoritative event catalog** (zero coined events); assert the dispatch lifecycle (`pending → dispatched → archived` — `Doc-6A §7`) and the **Doc-4L fan-out map** (the right consumers are invoked, no more, no fewer). An event not in the Doc-4J catalog is a coined event (forbidden).

### §8.4 Consumer-effect locality
Assert that a consumer's effect persists in the **consuming module's own schema** — never a cross-schema write back into the emitter's tables. Consumer effects propagate forward via the consumer's own contracts.

### §8.5 What §8 does not do
§8 instantiates **no case** — the integration/event suites are realized in Doc-8F against these conventions.

---

## §9 — Frontend & E2E Conformance Realization *(mechanism only — realized in Doc-8G; oracle = the frozen Doc-7 surfaces)*

### §9.1 Component conformance
Assert components against the shared kit (`Doc-7B`): a surface renders the kit's components, never a re-implemented primitive; the presentation-component boundary (Content ≠ Presentation, Invariant #9 / Doc-7 R5) holds — a component owns no authoritative state.

### §9.2 Accessibility baseline
Assert the **WCAG-AA + keyboard/focus** baseline every surface inherits (`Doc-7 R11`): focus order, keyboard operability, semantic roles, contrast. An a11y regression is a code defect.

### §9.3 Visual-regression
Assert presentation stability via visual-regression of the rendered surfaces (presentation is disposable over module-owned content — Doc-7 R5); a diff is surfaced for review, never auto-accepted.

### §9.4 E2E user-journey conformance
Assert end-to-end journeys over the **frozen Doc-5 surface only** (no endpoint invented): discovery → RFQ authoring → routing/invitation → quotation comparison → award → post-award operations (Buyer); invitation → quotation → microsite (Vendor); account/billing; admin console. Every step invokes a frozen Doc-5x contract.

### §9.5 Currency-display conformance
Assert **per-value-field currency display, default BDT, never assumed** (`Doc-2 §0.4`; Doc-7 R11) — a value rendered without its currency, or with an assumed currency, is a defect.

### §9.6 UI non-disclosure byte-equivalence (composing re-assertion of §6.4)
Assert at the **presentation layer** that a blacklisted/excluded vendor's UI experience is **byte-equivalent** to a non-matched vendor's (Invariant #11; Doc-7 R8 — the Vendor workspace's load-bearing attestation). This suite **invokes the canonical byte-equivalence assertion defined in Doc-8D (§6.4)** at the UI boundary; it does **not** re-implement a second equivalence definition (structure allocation table — assert once, compose elsewhere).

### §9.7 What §9 does not do
§9 instantiates **no case** — the frontend/e2e suites are realized in Doc-8G; they consume the frozen Doc-7 surfaces (which freeze as Doc-7B…7H freeze — per-suite oracle-readiness, §1.2).

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** every assertion-convention binds its oracle by pointer — `Doc-5A §5.6/§6.2/§8`; `Doc-3 §12` (`*.list_page_size_max`, `*.idempotency_dedup_window`); `Doc-4A §9.7` (prohibited categories, verified — `Doc-4A_Content_v1.0_Pass3 §9.7` / CHK-087); `§HB` contract trace; `Doc-6A §3/§5/§6/§7/§8/R5/R7/R8/R9/§11`; `Doc-2 §0.4/§8/§9`; `Doc-4J`/`Doc-4L`/`Doc-4M`; `Doc-5E`/`Doc-5F`/`Doc-5K R7`; `Doc-7B`/`Doc-7 R5/R8/R11`; CLAUDE.md §2/§4/§5/§10; Invariants #1–#12. **Nothing invented.**
- **Mechanism only:** no test code, no case, no SQL, no JSX authored. Each section fixes the assertion convention; the cases are the per-suite content (Doc-8C…8G).
- **Allocation honored:** §6.4 defines the byte-equivalence assertion once (Doc-8D); §9.6 composes it (invokes, never re-implements) — matches the structure allocation table.
- **Coins nothing:** 0 new contract/field/error/state/event/audit action/POLICY key/expected value.
- **Open for review:** confirm `Doc-4A §9.7` category list verbatim; confirm the firewall actor-stamp anchor (`core.audit_records actor_type` — `Doc-6A §8`) supports the "scores auto-calculated under System actor" assertion in §7.1.

*End of Content Pass-2 (§5–§9) — DRAFT. Realizes `Doc-8A_Structure_v1.0_FROZEN` §5–§9. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-3 (§10–§12 + Appendix A check IDs).*
