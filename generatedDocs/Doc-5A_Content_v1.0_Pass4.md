# Doc-5A — API Realization Standards — Content v1.0, Pass 4 (§7)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 4 of N — Section §7 only |
| Status | ACTIVE — Content Pass 4 of N; §7 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1 (§0–§2), Pass-2 (§3–§4), Pass-3 (§5–§6) |
| Contains | Identity/context/authorization **wire-carriage** realization only — how the authenticated principal, actor type, active-organization context, and delegation context enter a request. No authentication mechanics, no session/token implementation, no new headers, no endpoints, no framework code |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** The actor model (`Doc-4A §5.2`), the authentication boundary (`Doc-4A §5.1`), "Users act, Organizations own" (`Master Architecture` Invariant 5), the server-validated active-organization rule (`Doc-4A §5.3`), the three-layer authorization check (`Doc-4A §6.1`), and the delegation model (`Doc-4A §6B`) are **frozen**. §7 realizes only **how that context is carried on the HTTP wire**, using the headers already registered in §4.4 — it adds no header, no actor type, no slug, and no authorization vocabulary, and re-decides nothing upstream. Transport-level choices are marked **[realization convention]**.

---

## §7 — Identity, Context & Authorization Realization Standard

### 7.1 Authentication Carriage

- The authenticated principal is carried in the **`Authorization`** header (the §4.4 authentication-carrier slot) using the **Bearer scheme**, conveying the authenticated principal credential. Authentication establishes **who the principal is** — *only* — and is never the source of authorization (`Doc-4A §5.1`; §7.5).
- Doc-5A fixes only the **carriage and scheme**. The credential's format, issuance, validation, session lifecycle, and OTP/login mechanics are **authentication mechanics** and are **out of scope** (`Doc-4A §5.1`: contracts MUST NOT embed authentication mechanics; owned by development/code, `Doc-4A §2.2`). A contract **MUST** assume an already-authenticated principal where its actor type requires one.
- **Binds:** `Doc-4A §5.1` (authentication boundary); `Master Architecture §13` (Permission & Authorization Model — authorization is established separately, never derived from authentication); §4.4 (auth-carrier slot); `ADR-001`. **Rationale [realization convention — Bearer scheme]:** the corpus fixes "authenticated principal," not a wire scheme; the Bearer carriage in `Authorization` is the single realization, with all token mechanics left to development.

### 7.2 Actor-Type Determination

- The four actor types — **User, Admin, System, AI Agent** (`Doc-4A §5.2`) — are **determined server-side** from the authenticated principal and the request context. A request **MUST NOT** carry a field or header asserting its own actor type; a client-asserted actor type (e.g. an "as-admin" flag) is a forbidden input (§4.4 Forbidden; `Doc-4A §9.7`).
- No Doc-5 contract adds, renames, or merges actor types (`Doc-4A §5.2`). Admin (`staff_*`) and User principals are distinguished by the server from the authenticated identity, not by the wire.
- **Binds:** `Doc-4A §5.2` (actor types); `Master Architecture §13.5` (Platform Roles — the platform-role basis distinguishing Admin/staff from User principals); `Doc-2 §7` (slug catalog owner for the `staff_*` namespace); §9.7 (no client-asserted identity/authorization). **Rationale:** actor type drives authorization and audit attribution; deriving it server-side is the only realization that preserves the §5/§6 trust boundary.

### 7.3 Active-Organization Context Carriage

- A User-actor business operation executes within a **server-validated active organization context** (`Doc-4A §5.3`; `Master Architecture §6.1` — Isolation Principle). The active organization is named on the wire by the **`Iv-Active-Organization`** header (the §4.4 slot), carrying the organization `UUIDv7` (§3.4).
- The header is a **context selector, not a trusted assertion**: the server **MUST** validate that the authenticated principal holds an active membership in the named organization **before** any business processing (CONTEXT category, §7.6). A client-supplied organization identifier is **never** trusted (`Doc-4A §5.3`); the header names a desired context and the server decides whether it is the principal's to use.
- The active organization is **ambient validated context, never a request-body field**: a contract **MUST NOT** accept an "act as organization X" payload/path/query field outside this validated mechanism (`Doc-4A §5.3`; tenant-selection is a forbidden input, §4.4 / `Doc-4A §9.7`). Context-switching is owned by Identity (Doc-4C), not realized per contract.
- **Absence:** for an org-scoped operation, an absent or unvalidated `Iv-Active-Organization` context yields a CONTEXT-category failure (§7.6; `Doc-4A §11.2`), surfaced per §6 (with non-disclosure, §6.3). **Admin** (`staff_*`) contracts carry **no** active-organization context (`Doc-4A §5.6`); the header is not used for them, and admin scope derives solely from `staff_*` slugs plus the contract's declared admin scope.
- Every record created through a contract is owned by the **active organization** (or attributed per delegation, §7.4), never by the user personally (`Master Architecture` Invariant 5 — "Users act; organizations own"). Doc-5A carries the context; ownership semantics are upstream.
- **Binds:** `Doc-4A §5.3` (server-validated active org), §5.6 (admin context), §9.7 (tenant-selection forbidden); `Master Architecture §6.1` (Isolation Principle), Invariant 5; §4.4 (active-org slot). **Rationale [realization convention — header carriage]:** the corpus mandates server-validated ambient context; carrying the selector in the registered `Iv-Active-Organization` header (server-validated, never trusted) is the realization — it introduces no client trust.

### 7.4 Delegation-Grant Context

- Delegation is **resolved server-side, not asserted on the wire.** A request carries the authenticated principal (7.1), the active organization context (7.3), and the target resource (path, §5.3 — Pass-3); from these the server resolves any applicable **Delegation Grant** via the five-condition delegated-access check (`Doc-4A §6B.2`). **No delegation header or delegation request field exists** (and none is added — constraint: no new headers).
- A request **MUST NOT** carry a grant identifier, a `permission_set`, or any "acting under grant X" assertion as an input (forbidden authorization input, §4.4 / `Doc-4A §9.7`). The grant, its permission set, validity window, status, and the target profile's own state gate are evaluated server-side (`Doc-4A §6B.2`).
- Attribution of a delegated action is server-populated per `Doc-4A §6B.3` (controlling organization and acting user); Doc-5A carries no attribution input (§5.4 server-populated).
- **Binds:** `Doc-4A §6B.1` (eligibility), §6B.2 (five-condition check), §6B.3 (attribution); §9.7. **Rationale:** delegation authority is a server-side derivation over frozen grant state; realizing it without any wire assertion is the only carriage that cannot be spoofed.

### 7.5 Authorization Realization

- Authorization is **computed server-side** as the three-layer check — Active Membership **+** Permission Slug **+** Resource Scope, **OR** an active Delegation Grant path (`Doc-4A §6.1`, `Master Architecture §13.2`) — from the context carried in 7.1–7.4. The wire carries **no authorization vocabulary**: roles, plan names, permission slugs, membership, grants, and scopes are **never** request inputs (`Doc-4A §6.2` slugs-only; §4.4 Forbidden; `Doc-4A §9.7`).
- Authorization outcomes surface **only** as the §6 error classes — `AUTHORIZATION` (403) where existence is the caller's to know, otherwise the `NOT_FOUND` (404) collapse — under the non-disclosure rules of §6.3 (`Doc-4A §12.4`/§7). A response **MUST NOT** echo the caller's slugs, grants, or authorization decision beyond what the response representation rules (`Doc-4A §10`, realized by §5.6) permit.
- **Binds:** `Doc-4A §6.1` (three-layer check), §6.2 (slugs-only vocabulary), §9.7 (authz never from payload); Doc-5A §6.2/§6.3 (error surfacing + non-disclosure). **Rationale:** the authorization model is frozen; the realization is simply that **nothing** authorization-bearing is trusted from the wire and outcomes are expressed only through the §6 error surface.

### 7.6 Context Validation Position

- The carried context is validated in the fixed **CONTEXT category** of the universal validation order (`Doc-4A §11.2`, order position 2): actor type permitted (`Doc-4A §5.2`), active organization context valid (`Doc-4A §5.3`), admin scope declared and satisfied (`Doc-4A §5.6`) — established **before** AUTHZ, SCOPE, and DELEGATION (positions 3–5) and before any semantic processing. Doc-5A maps the resulting failure to its §6 status and **MUST NOT** reorder, merge, or short-circuit the categories — the order is a disclosure control owned by `Doc-4A §11.2` (§6.5).
- **Binds:** `Doc-4A §11.2` (validation order / disclosure control); Doc-5A §6.5 (validation-order preservation).

---

*End of Doc-5A Content v1.0, Pass 4 (§7). Identity/context/authorization wire-carriage realization only — no authentication mechanics, session/token implementation, new headers, endpoints, or framework code. §8 onward follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
