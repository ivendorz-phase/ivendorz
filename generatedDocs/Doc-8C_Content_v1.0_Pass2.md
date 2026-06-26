# Doc-8C — Contract & API Conformance Suite — Content v1.0 **Pass-2 (§5–§9)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 of `Doc-8C_Structure_v1.0_FROZEN`. Final Doc-8C content pass. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8C_Structure_v1.0_FROZEN` §5–§9: error-taxonomy · idempotency · prohibited-field · actor-scope/field-trace · conformance/carried |
| Authority | `Doc-8A` (§5 + bands A/B); the frozen Doc-5 surface is the oracle; consumes `Doc-8B` by pointer |
| Coins | **Nothing.** Assertions oracle-by-pointer into frozen `Doc-5x`; snippets illustrative |
| Binding vs choice | Convention tracing to Doc-8A/Doc-5 = **[binding]**; physical specific = **[Doc-8C choice]**. |

> **Scope of this pass:** the remaining four Band-B checks — error taxonomy (§5, `CHK-8-012`), idempotency (§6, `CHK-8-013`), prohibited request fields (§7, `CHK-8-014`), actor-scope & field-trace (§8, `CHK-8-015`) — plus Doc-8C's conformance attestation + carried register (§9). With Pass-1 (§0–§4) this completes Doc-8C content.

---

## §5 — Error-Taxonomy Conformance *(`CHK-8-012`)*

**[binding `Doc-5A §6.2`]** Every wired contract's error paths are asserted against the **frozen error taxonomy** (`Doc-5A §6.2`): each error maps to a **declared error class at its fixed HTTP status** — the suite asserts the **(class, status) pair** by pointer, never an invented class or a re-mapped status (`Doc-8A §3.2/§3.3`).

- **Per-contract error set [binding owning `Doc-4x §HB`]:** the errors a contract may emit are enumerated in its `§HB` (validation/error section); §5 drives each declared error condition and asserts the resulting class+status. An error condition with no `§HB`-declared class is **not** invented — it is `[ESC-8-API]` (flag-and-halt; the contract under-specifies its error surface — Board, additive Doc-5x patch).
- **No stricter/looser:** the suite asserts exactly the declared classes — it neither demands an undeclared error (over-strict) nor tolerates an undeclared status (over-loose).
- **Envelope of the error** is §3 (Pass-1); §5 asserts the **class+status**, not the envelope shape.

```ts
// illustrative; convention [Doc-5A §6.2 binding]; assert (class, fixed status) pair, never invent
export const errorCheck = { id: 'CHK-8-012', run: (c, ctx) =>
  for (const e of c.hb.declaredErrors)                  // from the owning Doc-4x §HB
    expectErrorClassAtStatus(drive(c, e.condition, ctx), e.class, e.status, Doc5A_6_2)
}
```

## §6 — Idempotency Conformance *(`CHK-8-013`)*

**[binding `Doc-4A` idempotency-key + `Doc-3 §12`]** Every `idempotent = true` mutation is asserted: a **replay keyed per the frozen idempotency mechanism** (`Doc-4A` idempotency-key header / request-identity rule, by pointer) **inside `<namespace>.idempotency_dedup_window`** (`Doc-3 §12`, read under `c.namespace` — by pointer, never a literal) yields the **deduplicated result** (same response, single effect), not a double-effect. Applicability: `idempotent = false` rows N/A (inventory flag).

- **Window boundary:** assert a replay **inside** the window dedups; a replay **after** the window (advancing the Doc-8B §6 seeded clock past `idempotency_dedup_window`) is a new operation per the frozen rule.
- **Dedup persistence cross-ref [binding `Doc-6A §10`]:** the dedup-key **persistence** the window relies on is a **Doc-8D** (`Doc-6A §10`) data-layer concern — asserted there; §6 asserts the **contract-observable** dedup behavior. One behavior, two layer-checks.
- **Single-effect:** the replay must not produce a second outbox event / second state transition — the §single-effect assertion reads the Doc-8B §7 **outbox observer** (no second `core.outbox_events` row for the deduped replay).

```ts
// illustrative; convention [Doc-4A key + Doc-3 §12 binding]; replay inside window dedups; clock-advanced replay is new
export const idempotencyCheck = { id: 'CHK-8-013', applies: (c) => c.idempotent, run: (c, ctx) => {
  const win = policy(c.namespace, 'idempotency_dedup_window')   // Doc-3 §12 by pointer
  const r1 = call(c, withIdemKey(ctx, K)), r2 = call(c, withIdemKey(ctx, K))  // same key, inside window
  expectDeduped(r1, r2); expectSingleOutboxEffect(ctx)          // Doc-8B §7 outbox observer
  ctx.clock.advance(win + 1); expectNewOperation(call(c, withIdemKey(ctx, K)))
}}
```

## §7 — Prohibited-Request-Field Conformance *(`CHK-8-014`)*

**[binding `Doc-4A §9.7`]** Every wired contract is asserted to **reject** a client-supplied value in any **prohibited request-field category** (`Doc-4A §9.7` / CHK-087): **attribution, audit, tenant-selection, authorization, ownership-change, lifecycle-state, governance signals, soft-delete-as-direct-write, `human_ref`-as-reference, inline tunable limits**. These are **server-owned**; a contract that accepts a prohibited client value is a **code defect**.

- **Per-category probe:** for each category, the check submits a request carrying a forbidden field of that category and asserts **rejection** (the frozen validation rejects it — the `Doc-5A §6.2` validation-error class at its status). A category not applicable to a given contract's schema is N/A for that row.
- **Governance-signal note [Invariant #6]:** the "governance signals" category enforces that a caller cannot **set** a trust/tier/score/performance value via the request body (scores are auto-calculated under the System actor — CLAUDE.md §4); M5/M7 contracts *serve* signals as outputs but **accept none as input** (the structure REJECTED-false precedent).

```ts
// illustrative; convention [Doc-4A §9.7 binding]; each prohibited category is rejected
export const prohibitedCheck = { id: 'CHK-8-014', run: (c, ctx) =>
  for (const cat of PROHIBITED_CATEGORIES_§9_7)               // the 10 frozen categories
    if (c.schema.touches(cat)) expectRejected(call(c, withForbiddenField(ctx, cat)))
}
```

## §8 — Actor-Scope & Field-Trace Conformance *(`CHK-8-015`)*

**[binding owning `Doc-4x §HB` + actor models]** Two assertions per wired contract:

- **Actor-scope:** a contract returns **no rows / no fields outside the caller's actor scope** — the actor model is the owning `Doc-4x` (User/Admin/System/anonymous; the tri-actor public surface `Doc-5D`; the Admin no-active-org surface `Doc-5J`; the active-org User surface `Doc-5C R2`). A read invoked as actor X must not expose actor-Y-scoped data.
- **Field-trace:** every request/response field **traces verbatim to its `§HB` contract** (inputs/outputs/validation). A response field with **no `§HB` source** is a **coined expectation** — forbidden; the suite flags it (a field present in the response but absent from `§HB` is either a code defect or `[ESC-8-CORPUS]`, never silently accepted).
- **Seam [the §6.4/§9.6 allocation precedent]:** Doc-8C asserts **contract-declared actor scope at the API surface**; the **RLS backstop enforcement + cross-tenant byte-equivalence** are **Doc-8D's** gate (`Doc-6A R8/§4`), cross-referenced, **not re-asserted** here. One behavior, two layer-checks.

```ts
// illustrative; convention [§HB + actor-model binding]; API-surface actor-scope + field-trace (RLS is Doc-8D)
export const actorScopeCheck = { id: 'CHK-8-015', run: (c, ctx) => {
  expectNoCrossActorData(callAs(c, ctx.actorX), ctx.actorY)   // contract-declared scope (not RLS — that's 8D)
  expectEveryFieldTracesToHB(responseShape(c), c.hb)          // no coined field
}}
```

## §9 — Conformance & Carried Items

**Doc-8C conformance attestation:**

| Band | Disposition |
|---|---|
| **A** — oracle-by-pointer (`CHK-8-001…003`) | **PASS** — every check asserts via `c.hb_pointer` into a frozen `Doc-5x`; none stricter/looser; red = code or `[ESC-8-*]`, never weakened |
| **B** — contract conformance (`CHK-8-010…015`) | **PASS** — envelope (§3) · pagination (§4) · error (§5) · idempotency (§6) · prohibited (§7) · actor-scope/field-trace (§8), each parameterized over the wired inventory |
| **C–I** | **N/A** — persistence/RLS (8D) · domain/invariant (8E) · integration/event (8F) · frontend/e2e (8G) · isolation/out-of-test (Doc-8B harness) |

**Coverage attestation [C1]:** the completeness check (Pass-1 §2) asserts **inventory ≡ the frozen Doc-5x enumerations** — every frozen wired contract covered by every applicable Band-B check; out-of-wire rows **N/A-recorded with `owning_suite`** (C2). Coverage is provable against the frozen surface, not internally consistent only.

**Carried register [by pointer]:** `DR-8-HARNESS` **consumed** (Doc-8B by pointer); `DR-8-CONTRACT` **satisfied** (Doc-8C is the Doc-5 testability cross-check — every wired contract asserted or `[ESC-8-API]`-flagged); `[ESC-8-API]` (untestable/under-specified contract — additive Doc-5x patch, Board); `[ESC-8-CORPUS]` (genuine Doc-5/Doc-4 defect — flag-and-halt, **never weaken**); `[ESC-8-POLICY]` (unregistered POLICY key — additive Doc-3 §12.2). Doc-8C coins nothing and asserts only Doc-5-declared behavior.

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** `Doc-5A §6.2`; `Doc-4A §9.7` (CHK-087 categories) / idempotency-key; `Doc-3 §12` (namespaced — uses the Pass-1 `namespace` column); `Doc-6A §10`/`R8/§4` (cross-refs); owning `Doc-4x §HB`; `Doc-5C R2`/`Doc-5D`/`Doc-5J` (actor models); `Doc-8B §6/§7` (clock, outbox observer); CLAUDE.md §4; Invariants #6/#7. **Nothing invented.**
- **Pass-1 fixes consumed:** §6 reads the `namespace` column (MINOR-1); §6 single-effect reads the Doc-8B §7 outbox observer.
- **Seam honored:** §8 API actor-scope (8C) vs RLS/cross-tenant (8D) — not re-asserted.
- **Coins nothing:** 0 new error class / field / status / expected value; prohibited categories + error classes are frozen, by pointer.
- **Open for review:** confirm the §7 governance-signal-input rejection is correctly scoped to *input* (not the M5/M7 *output* serving); confirm §6 single-effect via the outbox observer matches the Doc-8B §7 realized observer.

*End of Content Pass-2 (§5–§9) — DRAFT. Realizes `Doc-8C_Structure_v1.0_FROZEN` §5–§9. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN.*
