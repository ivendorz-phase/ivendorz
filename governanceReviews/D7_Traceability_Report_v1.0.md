# D7 Traceability Report — `identity.upsert_buyer_profile.v1` (Buyer-Profile Write Vertical) v1.0

| Field | Value |
|---|---|
| Date | 2026-06-30 |
| Scope | The M1 buyer-profile WRITE vertical (D7) — from frozen governance to a verified audit row. |
| Status | **COMPLETE — all required green gates pass** (see `D7_Conformance_Report_v1.0.md`). |
| Companion | `D7_Conformance_Report_v1.0.md` (the gate evidence). |

> **Purpose (CTO directive).** A single chain that lets a future auditor follow a buyer-profile change from the
> rank-0 business decision, through every realization layer, to the immutable audit row and the test that proves
> it. Each hop names the authoritative artifact + the realized file.

---

## The chain

```
Doc-2 §9 (business action)
        │  "buyer profile create" / "buyer profile update"   — Doc-2_Patch_v1.0.4 (rank-0; human-approved)
        ▼
Doc-4C §C10 (serialization)
        │  action tokens `buyer_profile_created` / `buyer_profile_updated`, entity_type `buyer_profile`
        │  — Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2 (human-approved; linked-pair)
        ▼
Audit-action constants (code)
        │  src/modules/identity/domain/audit-actions.ts — BuyerProfileAuditAction.{CREATED,UPDATED},
        │  BUYER_PROFILE_ENTITY_TYPE (imported as constants, never literals)
        ▼
Command (orchestration)
        │  src/modules/identity/application/commands/upsert-buyer-profile.command.ts
        │  validate → authorize ([ESC-IDN-SLUG] Owner/Director) → write → appendAuditRecord — one tx
        ▼
Repository (state)
        │  src/modules/identity/infrastructure/data/buyer-profile.repository.ts
        │  upsertActiveOrgBuyerProfile (RLS-scoped create/update + optimistic concurrency; no audit policy)
        ▼
appendAuditRecord() (M0 facade)
        │  src/modules/core/contracts (concrete) → core.append_audit_record.v1
        │  non-RETURNING createMany, in the caller's tx (Doc-4B §A10/§17.1 atomicity)
        ▼
Audit row (immutable)
        │  core.audit_records — admitted by the `audit_records_context_append` RLS policy
        │  (ESC-W2-AUDIT-RLS = R-b / ADR-021); action = buyer_profile_created | buyer_profile_updated
        ▼
Conformance test (proof)
           tests/integration/upsert-buyer-profile-slice.test.ts — 6/6 green vs real PostgreSQL
```

---

## Layer-by-layer trace

| # | Layer | Authority (frozen) | Realized file | Key fact |
|---|---|---|---|---|
| 1 | **Business action** | Doc-2 §9 Audit Mapping (Organization domain), via **`Doc-2_Patch_v1.0.4`** | `generatedDocs/Doc-2_Patch_v1.0.4.md` | Two business actions enumerated; **no** wire literal in rank-0 Doc-2 |
| 2 | **Serialization** | **`Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2`** (Doc-4C §C10) | `generatedDocs/Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2.md` | tokens `buyer_profile_created`/`buyer_profile_updated`, `entity_type=buyer_profile`, old/new mapping |
| 3 | **Constants** | (realizes #1+#2) | `src/modules/identity/domain/audit-actions.ts` | `BuyerProfileAuditAction.CREATED/UPDATED`, `BUYER_PROFILE_ENTITY_TYPE` — imported, never hardcoded |
| 4 | **Contract DTOs** | Doc-4C §C10 request/response/register | `src/modules/identity/contracts/types.ts` | `UpsertBuyerProfileInput` / `…Outcome` / `…Error` (frozen `identity_buyer_profile_*` codes) |
| 5 | **Command** | Doc-4C §C10; Doc-4B §A10/§17.1 | `src/modules/identity/application/commands/upsert-buyer-profile.command.ts` | Command → appendAuditRecord() → Repository → Transaction; the two invariants live here |
| 6 | **Repository** | Doc-2 §10.2 columns; Doc-6C buyer_profiles RLS | `src/modules/identity/infrastructure/data/buyer-profile.repository.ts` | RLS-scoped upsert + optimistic concurrency; returns old/new field sets; **knows no audit policy** |
| 7 | **Audit facade** | Doc-4B §A10 `core.append_audit_record.v1` | `src/modules/core/contracts/services.ts` (`appendAuditRecord`) | the ONLY audit-write surface; non-`RETURNING`; in the caller's tx |
| 8 | **Audit row** | ESC-W2-AUDIT-RLS §7 = R-b / ADR-021; Doc-6B `audit_records_context_append` | `prisma/migrations/20260630090000_audit_context_append_policy` | tenant-context append admitted (`org=active_org ∧ actor_id=user_id ∧ actor_type='user'`) |
| 9 | **Facade / wire** | Doc-5A §5.6/§6.1/§6.2 | `src/modules/identity/contracts/services.ts` (`upsertBuyerProfile`), `…/api/upsert-buyer-profile.handler.ts` | 201 create / 200 update / 400·403·409 |
| 10 | **App composition** | Doc-7C server data layer; Invariant #5 | `src/server/identity/upsert-buyer-profile.route-handler.ts` | injects the M0 `appendAuditRecord`; runs inside `withActiveOrg` (RLS) |
| 11 | **HTTP route** | Doc-5C §C10 | `app/api/identity/buyer_profiles/route.ts` (POST) | snake_case body → typed input; serializes the `WireResponse` |
| 12 | **Account form** | Doc-7E §3.1 (the deferred write leg) | `app/(app)/account/account-buyer-profile-form.tsx` + `page.tsx` | client island POSTing to the endpoint; read view unchanged |
| 13 | **Conformance test** | the proof | `tests/integration/upsert-buyer-profile-slice.test.ts` | 6/6 green vs real PostgreSQL — audit rows verified for create + update |

---

## Boundary & invariant attestations (architecture)

- **No command knows SQL** — the command calls the repository (#6); all buyer_profiles SQL is in infrastructure.
- **No repository knows audit policy** — the repository returns data (created/updated + old/new field sets); the
  **command** decides the audit action (#5) and the **M0 facade** (#7) performs the append.
- **Audit behind the platform facade** — `appendAuditRecord` (M0 contracts) is the only audit-write path; M1 depends
  only on the M0 contract **TYPE** (injected by the app-layer composition, #10).
- **One Module, One Owner** — all `identity.*` writes are M1; the cross-module surface is `contracts/`-only; no
  cross-schema SQL; no frozen-doc edit in code.
- **Users Act, Organizations Own (Invariant #5)** — `app.active_org`/`app.user_id` are server-resolved (never client
  input); the audit row binds to them via the RLS `WITH CHECK`.
- **The two CTO invariants** — *no business write without an audit row* and *no audit row without a successful write* —
  hold because the write + the audit append share ONE transaction (#5); proven by the CREATE/UPDATE/CONFLICT/INVARIANT
  tests (#13).

---

*D7 Traceability Report v1.0 — buyer-profile change traced from Doc-2 §9 (business) → Doc-4C (serialization) →
constants → command → repository → `appendAuditRecord()` → immutable audit row → green conformance test. Every hop
binds to its frozen authority by pointer.*
