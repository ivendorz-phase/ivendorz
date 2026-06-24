# Doc-5B — Platform Core (M0 `core`) API Realization — Content v1.0, Pass 2 (§3)

| Field | Value |
|---|---|
| Document | Doc-5B — Platform Core / Shared Kernel (Module 0) — API Realization |
| Pass | 2 of N — Section §3 only |
| Status | ACTIVE — Content Pass 2 of N; §3 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5B_Structure_v1.0_FROZEN.md` |
| Realizes | `Doc-4B §B4` (Group 1 — Audit Record Queries, FROZEN) on HTTP |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5B Content Pass-1 (§0–§2) |
| Contains | Wire realization of the M0 audit read endpoint only — the `GET /core/audit_records` surface (filter/correlation variants, pagination, response shape, non-disclosure, error-status set, authorization). No mutation surface (§4/§5), no out-of-wire (§6), no contract bodies or audit-field-set restated |
| Audience | Architecture / API Governance Boards · Doc-5B authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** `Doc-4B §B4` fixes the two audit-read contracts (`core.audit_record_query.v1`, `core.audit_correlation_lookup.v1`) — their filters, representation, non-disclosure boundary, and error codes (FROZEN). §3 realizes only their **HTTP wire face** per Doc-5A and re-decides none of it. The `audit_record` representation (Doc-2 §9 field set) and the error codes are bound **by pointer, never restated**. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§8`; `Doc-4B §B4`; Doc-5B §2 (inventory).

---

## §3 — Audit Read Surface Realization

### 3.1 The Audit Read Endpoint (§5.7 realization)

- The Group 1 reads realize as one HTTP operation:
  ```
  Realization (Doc-5A §5):
    HTTP-Method     : GET                                   (§5.2 — safe read)
    Path            : /core/audit_records                   (§5.3; collection read, no {id})
    Input-Placement : all filters / sort / page_size / cursor → query   (§5.4)
    Success-Status  : 200                                   (§5.5)
    Response-Body   : list                                  (§5.6)
    Error-Status-Set: { VALIDATION→400, AUTHORIZATION→403, NOT_FOUND→404, RATE_LIMITED→429 }  (§6.2)
  ```
- `GET` is safe and carries **no body**; every input is a query parameter (§5.4). No `{id}` path segment — this is a collection read, never an item path.
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.5/§5.7`; `Doc-4B §B4`. **Rationale [realization convention — read endpoint]:** the corpus declares an Admin read with filters; the single GET collection endpoint is its wire form.

### 3.2 Filter & Correlation Variants (two contracts, one endpoint)

- `GET /core/audit_records` realizes **both** §B4 contracts as **filter variants of one read endpoint** (Doc-5B §2.3):
  - **`audit_record_query.v1`** — the general-filter variant: the `Doc-4B §B4` **Filterable** allowlist (`entity_type, entity_id, actor_id, actor_type, action, organization_id, occurred_from, occurred_to`) as query parameters, each bound to its §B4 declaration (by pointer).
  - **`audit_correlation_lookup.v1`** — the correlation variant: the `reference_id` query parameter (required by that contract) resolves the audit chain bound to a prior response `reference_id` (`Doc-4B §B4`; §17.2).
- `organization_id` is a **filter over recorded audit context only — never an act-as-organization field** (`Doc-4B §B4`; `Doc-4A §9.7`; §5.4 prohibited inputs). No filter introduces a protected fact (§7.5).
- A query carrying `reference_id` realizes the correlation contract's `required` input; absent it, the general-filter contract applies. No new parameter is introduced beyond the two §B4 request contracts.
- **Binds:** `Doc-4B §B4` (Filterable/Sortable allowlists, request contracts); `Doc-5A §8` (filter grammar). **Rationale:** one read surface with an allowlisted filter set; the two frozen contracts are its filter variants, not two endpoints.

### 3.3 Pagination & Sort (§8)

- Pagination is **cursor-based**: the opaque `cursor` query parameter (`Doc-4B §B4`; `Doc-4A §9.6`); **no offset/index** pagination. `page_size` is bounded by the POLICY key `core.system_configuration.core.audit_query_page_size_max` (`Doc-4B §B4` [PA-E1]) — referenced by key, **never a literal** on the wire (`Doc-5A §8`; `Doc-3 §12`).
- `sort` accepts only the §B4 **Sortable** allowlist (`timestamp`, tiebreaker `audit_id` for total order); non-allowlisted sort/filter fields are a VALIDATION failure (§3.6).
- **Binds:** `Doc-5A §8`; `Doc-4B §B4`; `Doc-4A §9.6/§18`; `Doc-3 §12`. **Rationale:** one pagination/sort grammar; bounds stay POLICY-keyed.

### 3.4 Response Representation (§5.6)

- The success body is the **list shape** `{ "items": [ <audit_record> … ], "page_info": { "next_cursor", "has_more", "total_count"? }, "reference_id": <uuidv7> }` (`Doc-5A §5.6`; `Doc-4A §10.3`), with the top-level `reference_id` per `Doc-4A §22.1 C-05`.
- `<audit_record>` is the **canonical representation owned by `Doc-4B §B4`** (the Doc-2 §9 audit field set) — referenced by pointer, **never reshaped or restated here**. Redaction-aware fields (`ip_address`, `user_agent`) are **absent when redacted and the absence is not signaled** (`Doc-4B §B4`; §10.7/§14.3) — the wire does not distinguish "redacted" from "never present".
- `total_count` is **conditional and compliance-scoped** (`Doc-4B §B4`; §7.5) — emitted only within the compliance audience, never as a general count.
- **Binds:** `Doc-5A §5.6`; `Doc-4B §B4`; `Doc-4A §10.3`. **Rationale:** the envelope is realized; the representation stays the owning contract's.

### 3.5 Non-Disclosure on the Wire (§6.3 / §7)

- The §B4 Error-Boundary `V4 : NOT_FOUND | collapse-rule` and `Timing-Uniformity: asserted` are realized as the **wire indistinguishability invariant** (`Doc-5A §6.3`; `Doc-4A §7/§12.4`): a record (or correlation chain) the caller is not compliance-entitled to see returns a `404` that is **identical in status, body bytes, and timing** to the genuinely-absent response. Existence of a protected-fact-gated audit record is **never confirmed to a non-compliance party** (`Doc-4B §B4` §7.5).
- No filter, count, ordering, or error detail may reveal a protected fact (`Doc-5A §6.3/§8`; `Doc-4B §B4` Disclosure). The correlation lookup is access-controlled precisely because an open lookup is an oracle (`Doc-4B §B4`).
- **Binds:** `Doc-5A §6.3/§7`; `Doc-4B §B4`; `Doc-4A §7/§12.4`. **Rationale:** the audit read is the highest-disclosure-risk M0 surface; the collapse is realized exactly, never widened.

### 3.6 Error-Status Set (§6)

- The §B4 error codes map to status by the §6.2 class→status mapping (codes are within the registered `core_` namespace — `Doc-4B §B4`; Appendix B.2 → `Doc-4A Appendix B.2` — bound by pointer, not re-listed):

| `error_class` (Doc-4A §12.2) | HTTP status | §B4 `error_code` |
|---|---|---|
| `VALIDATION` | `400` | `core_audit_invalid_query_input` |
| `AUTHORIZATION` | `403` | (§5.6 context / authz failures — collapsed per §3.5 where existence is gated) |
| `NOT_FOUND` | `404` | `core_audit_not_found` (the collapse target) |
| `RATE_LIMITED` | `429` | `core_audit_rate_window_exceeded` (carries `Retry-After`, §6.4) |

- Clients branch on `error_class` / `error_code`, never status alone (`Doc-5A §6`; `Doc-4A §12.3`). Rate-limit windows are POLICY-keyed (`Doc-4B §B4` [PA-E1]).
- **Binds:** `Doc-5A §6.2/§6.4`; `Doc-4B §B4`; `Doc-4A §12.2/§12.3`. **Rationale:** the mapping is Doc-5A's; the codes are Doc-4B's.

### 3.7 Identity, Context & Authorization (§7)

- **Admin actor** (Template 21.6): `Authorization` bearer carries **authentication only** (`Doc-5A §7.1`); authorization is the server-side `staff_super_admin` slug check (`Doc-4B §B4`; Doc-2 §7) plus the `tenant-data-access` Admin-Scope and Compliance-Basis (`Doc-4B §B4`; §5.6). **No `Iv-Active-Organization`** — admin carries no org context (`Doc-5A §7.3`); no delegation (`Doc-4B §B4` — not eligible).
- No authorization vocabulary (slugs, scope, compliance basis) is ever a request input (`Doc-5A §7`; `Doc-4A §9.7`); all are server-derived.
- **Access-Flagging (infrastructure, not a wire field):** the `Doc-4B §B4` "Super Admin access (flagged)" audit row is written by the gateway/middleware layer **before** this endpoint executes (an operational obligation, not a contract-level audit declaration or a response field) — it is **out-of-wire** for §3 and introduces no audit event/action (`Doc-4B §B4` [PA-m02]).
- **Binds:** `Doc-5A §7.1/§7.3`; `Doc-4B §B4`; Doc-2 §7. **Rationale:** the tenancy/authz boundary is server-enforced; the wire carries nothing authorization-bearing.

### 3.8 Idempotency, Concurrency & Async (§9 / §10)

- The audit read is a **safe `GET`** (`Idempotency: not-applicable`, `State-Machine-Effects: none`, `Execution: sync` — `Doc-4B §B4`): it carries **no `Idempotency-Key` and no `If-Match`** (`Doc-5A §9` — those are for unsafe/optimistic operations) and is **not** async (no `202`/`ASYNC_PENDING`, §10).
- **Binds:** `Doc-5A §9/§10`; `Doc-4B §B4`. **Rationale:** a read mutates nothing; no idempotency or concurrency carriage applies.

---

*End of Doc-5B Content v1.0, Pass 2 (§3). Audit read surface (`GET /core/audit_records`) wire realization only — the two §B4 read contracts as filter variants of one endpoint; pagination/sort, list representation, non-disclosure collapse, error-status set, and Admin authorization realized by pointer; the `audit_record` representation and error codes are not restated; no mutation surface, no out-of-wire mechanism, nothing coined. §4 (audit redaction) follows next, conforming to `Doc-5B_Structure_v1.0_FROZEN.md`.*
