# Doc-7A — Frontend Realization Metastandard — **Content Pass-2 (§5–§9)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 of `Doc-7A_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-3 (§10–§12 + Appendix A) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7A_Structure_v1.0_FROZEN` §5–§9; R4 (§5) · R5 (§6) · R9 (§7) · R8 (§8) · R10 (§9) |
| Carries forward | Pass-1 §3.7 **wired-contracts-only boundary** (frontend consumes only the caller-facing wired Doc-5 subset) |
| Posture | Reference-never-restate; mechanism only — **no JSX, no component code, no screens**. Coins **nothing** |

> **Scope:** the *interaction* conventions — data-binding & API-client (§5), Content≠Presentation (§6), state-machine-driven UI (§7), non-disclosure & privacy (§8), AI advisory surfaces (§9). All token names (`error_class` set, envelope, cursor grammar) are bound **verbatim by pointer** to the frozen Doc-5A surface; none is invented.

---

## §5 — Data-Binding & API-Client Conventions *(mechanism only — authors no surface)*

### §5.1 The wired boundary (carried from Pass-1 §3.7)
The typed API-client (realized in Doc-7C) binds **only** the caller-facing **wired** subset of the frozen Doc-5 surface. Out-of-wire / internal-service contracts are never frontend-callable (Pass-1 §3.7; e.g. `check_permission` `Doc-5C §C3`, `resolve_entitlements`/`enforce_quota` `Doc-5I §10` — both "no HTTP caller wire"). Read path = Server Components fetching wired read/list contracts; write path = server actions calling wired command contracts (Pass-1 §3.4).

### §5.2 Success envelope
A successful response is consumed as the frozen Doc-5A envelope (`Doc-5A §5.6`): the owning module's representation **by reference** (`Doc-4A §10.1` — never reshaped client-side) plus the **top-level `reference_id`** (uuidv7, a sibling of the payload — `Doc-4A §22.1 C-05`). The UI surfaces `reference_id` in support/error contexts; it does not synthesize one.

### §5.3 Error taxonomy → UI state (verbatim, no invented class)
Error responses are consumed as the frozen Doc-5A error body (`Doc-5A §6.2`): root `{ "error": { error_class, error_code, message, field_errors?, retryable }, "reference_id": <uuidv7> }`. **The UI MUST branch on `error.error_class` / `error.error_code`, never on HTTP status alone** (`Doc-4A §12.3` — several classes deliberately share one status). The closed class→status map (`Doc-5A §6.2`) is realized in the UI as:

| `error_class` | status | UI realization |
|---|---|---|
| `VALIDATION` | 400 | field-level errors from `field_errors`; inline form display |
| `AUTHORIZATION` | 403 | not-permitted state (only where the right-to-know is established — else collapses to `NOT_FOUND`, §8) |
| `QUOTA` | 403 | entitlement-exhausted state; **no** `Retry-After`; not retryable (`Doc-5A §6.4`) |
| `RATE_LIMITED` | 429 | throttled state; honor `Retry-After`; retryable |
| `NOT_FOUND` | 404 | not-found view — **identical** to genuine absence (the protected-fact collapse, §8) |
| `CONFLICT` / `STATE` | 409 | stale-state reconciliation (re-fetch authoritative state — §7) |
| `REFERENCE` / `BUSINESS` | 422 | domain-rejection message from `error.message` |
| `DEPENDENCY` | 503 | transient-dependency state; retryable per declared interval |
| `ASYNC_PENDING` | (§10 async surface) | accepted-then-processing; poll the status resource — **not** the error envelope (`Doc-5A §6.2`/§10) |

The UI **never invents an error class, code, or status**; an undeclared failure path is a contract gap → flag-and-halt (`Doc-5A §6.2`; `Doc-5 Governance Note §7`).

### §5.4 No protected enrichment in error UI
The UI **MUST NOT** render any protected fact that the contract itself withholds: `field_errors`, quota/rate metadata, `DEPENDENCY` detail, and headers carry no other-tenant data, routing-pipeline internals, or existence signals (`Doc-4A §12.4`; `Doc-3 §12.1`). The safe default for an ambiguous AUTHORIZATION/NOT_FOUND failure is the **non-disclosing `NOT_FOUND` (404)** (`Doc-4A §12.6`) — see §8.

### §5.5 Pagination consumption (cursor-only)
List views consume the frozen cursor grammar (`Doc-5A §8`; `Doc-4A §9.6`):

- **Cursor-based only.** Offset / page-number / index pagination is **forbidden** (offset arithmetic leaks exclusion counts — `Doc-4A §7.5`). The UI builds no "page N" / "jump to page" control that implies offsets.
- Query parameters `page_size` and `cursor`. The continuation `cursor` is the **opaque** `page_info.next_cursor` from the prior response; the client **MUST NOT** construct, decode, or modify it (`Doc-4A §9.6`/§10.3).
- `page_size` bounds (min/max/default) come from the **POLICY key** (`*.list_page_size_max`, `Doc-3 §12`) — **never a literal in UI code**; a `page_size` over the max is a `400 VALIDATION` (`Doc-5A §8.5`), so the UI requests within the POLICY bound.
- The list response is consumed as `{ items: [...by-reference], page_info: { next_cursor?, has_more, total_count? } }` inside the §5.2 envelope. `has_more` drives "load more"; `total_count` is **contract-optional** — the UI shows a total **only when the contract provides it**, never a client-computed count.

### §5.6 Idempotency on mutations
Every mutation carries idempotency per the contract's `*.idempotency_dedup_window` (`Doc-3 §12`, by pointer) — the server action attaches the idempotency key; a retried submit within the window is de-duplicated server-side, so optimistic UI retries are safe (state reconciliation §7). The UI invents no idempotency semantics; it honors the contract's.

### §5.7 What §5 does not do
Realizes no concrete client, query, or screen — those are Doc-7C (client) and Doc-7D…7H (views). §5 is the binding convention.

---

## §6 — Content ≠ Presentation Realization *(mechanism only)*

### §6.1 The boundary (R5 / Invariant #9)
The frontend separates **content** (module-owned, fetched via wired contracts) from **presentation** (layout, theme, skinning, display ordering). Presentation **never** mutates content, caches content as authoritative (R12), or stands in for it. The presentation layer is the Doc-7B design system + per-surface composition; content always arrives by reference from a contract (§5.2) and is **never reshaped** client-side (`Doc-4A §10.1`).

### §6.2 The microsite case (one owner, two surfaces)
A vendor microsite's presentation renders **M2-owned** content (`Doc-5D`). The **same** M2 content is **rendered read-only by the Public surface (Doc-7D)** and **managed by the Vendor workspace (Doc-7G)** — two surfaces, one owner. Neither surface owns microsite content; both bind M2 contracts. Presentation/theme choices are surface-local; the authoritative content is M2's.

### §6.3 Display ordering is presentation, never a re-rank of governed matching
List sort/filter chosen in the UI is **presentation over the contract-provided result set** — it **never re-ranks governed M3 matching**. The matching/sorting/scoring authority is M3 (`Doc-5E`); the UI **displays** the contract's ordered, exclusion-applied result (§5.5, §8) and **never re-scores, re-weights, or re-orders to override** the governed result. A client-side sort toggle reorders only within what the contract returned and never reconstructs a ranking the engine withheld.

### §6.4 What §6 does not do
Authors no component or theme — those are Doc-7B. §6 is the separation rule every surface conforms to.

---

## §7 — State-Machine-Driven UI Realization *(mechanism only)*

### §7.1 Doc-4M is the transition authority (R9)
Every lifecycle surface (RFQ, quotation, verification, subscription, post-award documents) renders state and **only the transitions Doc-4M permits** for the actor in the current state (`Doc-4M` — authoritative lifecycle/state authority). The UI **offers no transition the machine forbids** and **invents no state, edge, or label**. Available actions are derived from the contract-reported current state + the Doc-4M transition set, never hardcoded independently of it.

### §7.2 Server owns state; UI displays it
The UI **displays** state; the server **owns** it. Optimistic UI is permitted — a transition may render eagerly — but it **reconciles to the server's authoritative state**: a stale or illegal transition returns `CONFLICT` / `STATE` (409, §5.3), and the UI **re-fetches and reconciles** to the authoritative state rather than asserting its optimistic guess. Idempotency (§5.6) makes the reconciling retry safe.

### §7.3 Transitions go through wired command contracts
A state change is always a server action calling the frozen Doc-5 **command** contract that owns the transition (§5.1) — never a client-side state mutation. The command's own authorization + validation (Pass-1 §4.3, contract-internal) gate the transition; the UI's enabled/disabled control is UX only.

### §7.4 What §7 does not do
Authors no lifecycle screen — those are the surface docs (RFQ in 7F/7G, subscription in 7E, etc.). §7 is the state-fidelity rule.

---

## §8 — Non-Disclosure & Privacy Realization *(mechanism only)*

### §8.1 Byte-equivalence (R8 / Invariant #11)
A blacklisted/excluded vendor's frontend experience is **byte-equivalent** to a non-matched vendor's: **no surface, view, count, analytic, notification, or error reveals** buyer-private exclusion (`buyer_vendor_statuses`) or link suggestions. The UI realizes this by consuming only what the contract discloses — it never derives, infers, or reconstructs an excluded fact.

### §8.2 Protected-fact collapse to NOT_FOUND
Where the caller has no established right to know a resource exists, the contract returns **`NOT_FOUND` (404)**, not `AUTHORIZATION` (403) (`Doc-4A §12.4`/§12.6; `Doc-5A §6.3`). The UI renders the `NOT_FOUND` view **identically to genuine absence** (Pass-1 §3.5 not-found boundary) — it **MUST NOT** distinguish "exists but forbidden" from "does not exist" in copy, layout, timing, or telemetry. 403 is shown **only** where the right-to-know is already established by the caller's own tenancy/grants.

### §8.3 Exclusion-set consistency in lists (no inference leak)
List surfaces inherit the frozen exclusion guarantee (`Doc-5A §8`; `Doc-4A §10.7`/§7.5): `items`, `has_more`, `total_count`, and any facet/aggregate apply the **same exclusion set identically** — soft-deleted, out-of-tenancy/grants, protected-fact-excluded, and **routing-excluded** rows are absent from **all** of them. Because the UI consumes these as-is and pagination is cursor-opaque (§5.5), **page boundaries and counts reveal no excluded row's count or existence**. The UI computes no client-side total or "missing items" indicator that could leak an excluded count.

### §8.4 Buyer-private CRM never leaks
The buyer-private CRM (M4) renders **only inside the buyer's own workspace (Doc-7F)** and never appears in any vendor-facing surface (Doc-7G), shared embedded component, notification, or error. The Vendor workspace (Doc-7G) carries the **load-bearing byte-equivalence attestation** at its freeze (Appendix A non-disclosure band, Pass-3).

### §8.5 What §8 does not do
Authors no screen; the non-disclosure **test** obligation (positive/negative/cross-tenant byte-equivalence) is **Doc-8's** gate (referenced). §8 is the realization rule every surface conforms to.

---

## §9 — AI Advisory Surface Realization *(mechanism only)*

### §9.1 Advisory-only, labeled, non-authoritative (R10 / Invariant #12)
AI-derived artifacts (M9, `Doc-5K`) render **only as clearly-labeled advisory surfaces** (suggestions, drafts, summaries). They are **never** displayed as authoritative content and **never auto-commit** a business decision. An AI suggestion becomes an action only when a human invokes the corresponding **wired module command** (the module decides — Invariant #12); the AI panel itself triggers no state transition.

### §9.2 AI reads are regenerable projections, never a UI source of truth
The M9 reads are advisory and **regenerable/TTL** (`Doc-5K R7`; `ai.<bc>.ttl_seconds`). The UI treats an AI panel as a **disposable projection** (R12) — it may be stale, absent, or regenerated, and the surface degrades gracefully when it is. AI output is **never** cached-as-authoritative and **never** gates a procurement or governance decision (the score firewall holds — AI confidence ≠ Trust score, `Doc-5K`).

### §9.3 Wired-only (carried from §5.1)
AI panels consume only the **caller-facing wired** M9 read contracts (`Doc-5K` reads); the out-of-wire generate/expire workers are never frontend-invoked (Pass-1 §3.7; `Doc-5K` out-of-wire set).

### §9.4 What §9 does not do
Authors no AI panel component (defined once in Doc-7B, composed per surface — structure allocation table). §9 is the advisory-only rule.

---

## Pass-2 self-check (pre-review)

- **Verbatim binding, nothing invented:** error body/class set (`error_class`, `error_code`, `field_errors`, `retryable`, `reference_id`; VALIDATION/AUTHORIZATION/QUOTA/RATE_LIMITED/NOT_FOUND/CONFLICT/STATE/REFERENCE/BUSINESS/DEPENDENCY/ASYNC_PENDING) trace to `Doc-5A §6.2` (`Doc-5A_Content_v1.0_Pass3`); pagination (`page_size`, `cursor`, `page_info.next_cursor`, `has_more`, `total_count`) traces to `Doc-5A §8` (`Doc-5A_Content_v1.0_Pass5`) + `Doc-4A §9.6/§10.3`. **No class/field/param coined.**
- **Mechanism only:** no JSX, no client code, no screen authored.
- **Coins nothing:** 0 new module/contract/route/field/permission/state/event/audit/POLICY key.
- **Wired boundary** (Pass-1 §3.7) carried into §5.1/§7.3/§9.3.
- **Open for review:** verify the §5.3 class→status rows against `Doc-5A §6.2` exactly (esp. STATE→409, REFERENCE/BUSINESS→422, DEPENDENCY→503 — bind precisely); confirm `Doc-5A §6.3` is the protected-fact-collapse anchor cited in §8.2.

*End of Content Pass-2 (§5–§9) — DRAFT. Realizes `Doc-7A_Structure_v1.0_FROZEN` §5–§9. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-3 (§10–§12 + Appendix A).*
