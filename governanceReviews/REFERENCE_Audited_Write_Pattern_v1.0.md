# REFERENCE — Audited Write Pattern (iVendorz canonical) v1.0

| Field | Value |
|---|---|
| Status | **CANONICAL REFERENCE — Board-declared (CTO, 2026-06-30).** D7 (`identity.upsert_buyer_profile.v1`) is the platform's **first fully realized audited write** and the **template every subsequent audited write copies.** |
| Mandate | "Every future audited write should copy this architecture. No team should invent a different audited write pattern." |
| Worked example | D7 — `tests/integration/upsert-buyer-profile-slice.test.ts` + the files in §"Layer map". Reports: `D7_Traceability_Report_v1.0.md`, `D7_Conformance_Report_v1.0.md`. |
| Foundation | The audit-write mechanism (ESC-W2-AUDIT-RLS = R-b / ADR-021; the `audit_records_context_append` RLS policy + the non-`RETURNING` `core.append_audit_record.v1` facade). |

> **Scope.** This is an **engineering standard**, not a frozen-corpus decision — it codifies *how* to realize any
> Audit-Required tenant write. It binds frozen authorities by pointer; it coins no architecture. Applies to:
> **organization updates · vendor-profile updates · RFQ creation · quotation submission · company edits · product
> edits · trust actions** — and every other Audit-Required write across the 10 modules.

---

## 1. The pipeline (non-negotiable)

```
HTTP route (app/api/**)            thin: parse body → typed input; serialize WireResponse
        │
App composition (src/server/**)    resolve session → ensureProvisioned → withActiveOrg(tx, ctx)
        │                          INJECT the M0 appendAuditRecord (concrete) into the command
        ▼
Command (module/application)       validate → authorize → write → appendAuditRecord  — ALL on ONE tx
        │
        ├── Repository (module/infrastructure)   owns the SQL; RLS-scoped; returns old/new field sets
        │
        └── appendAuditRecord() (M0 contracts)   the ONLY audit-write surface; in the SAME tx
        ▼
core.audit_records (immutable)     admitted by the context-bound INSERT RLS policy; canonical action
```

## 2. The rules (every audited write MUST satisfy)

1. **Command → `appendAuditRecord()` → Repository → Transaction.** The command orchestrates; it owns no state.
2. **No command knows SQL.** All persistence is in the module's `infrastructure/` repository.
3. **No repository knows audit policy.** The repository returns DATA (created/updated + `old_value`/`new_value`
   field sets); the **command** chooses the audit action; the **M0 facade** performs the append.
4. **Audit stays behind the platform facade.** `appendAuditRecord` (`@/modules/core/contracts`) is the ONLY
   audit-write path. The owning module imports the M0 **TYPE** only; the **app-layer composition injects** the
   concrete (never a cross-module value import). No module re-implements audit.
5. **One transaction.** The business write and the audit append share the **same** RLS-scoped executor (`tx` from
   `withActiveOrgContext`). This is what makes the two invariants hold:
   - **No business write without an audit row** — audit is appended in the same tx; if it throws, the write rolls back.
   - **No audit row without a successful write** — audit follows the write in the same tx; any failure rolls both back.
6. **Canonical action constants — never literals.** The `action` token comes from a module-owned constant
   (e.g. `BuyerProfileAuditAction.CREATED`), realized from **Doc-2 §9** (business action) + the **Doc-4/Doc-6**
   serialization patch. Create and update are **distinct** actions (the immutable ledger records what happened).
7. **Non-`RETURNING` append.** The audit insert must not emit `RETURNING` (it would trip the staff-only audit
   SELECT policy → SQLSTATE 42501). M0's `appendAuditRecord` already uses `createMany` (app-minted UUIDv7) — use it.
8. **Server-resolved context (Invariant #5).** `actor_id = app.user_id`, `organization_id = app.active_org`,
   `actor_type = 'user'` — all server-resolved (never client input); the audit RLS `WITH CHECK` re-verifies them.
9. **Wire conformance.** Outcome → Doc-5A envelope via the module's `api/` mapper: 201 create / 200 update; the
   frozen `error_class`→status map (VALIDATION 400 · AUTHORIZATION 403 · CONFLICT 409); 401 auth-boundary; 404
   non-disclosure for no-context.

## 3. The governance PREREQUISITE (do this BEFORE coding)

**The audit `action` writes the immutable ledger — it must be canonical from the first persisted row.** Before
implementing an audited write whose action is **not** yet enumerated:

1. Confirm the business action exists in **Doc-2 §9** (Audit Mapping). If not → author an **additive Doc-2 §9 patch**
   (business semantics only), human-approved + folded. *(Worked example: `Doc-2_Patch_v1.0.4`.)*
2. Pin the **serialization** (token string, `entity_type`, old/new mapping) in a **Doc-4/Doc-6 realization patch** —
   NOT in Doc-2. *(Worked example: `Doc-4C_BuyerProfileAuditToken_Patch_v1.0.2`.)*
3. **Never invent** an audit action, slug, or POLICY key in code. Carry `[ESC-…]` interim markers explicitly where a
   binding is genuinely deferred.

## 4. Per-write build checklist (the D7 order)

1. **Audit-action constants** — module `domain/audit-actions.ts` (from the Doc-2/Doc-4 patches).
2. **Contract DTOs** — `contracts/types.ts` (`*Input` / `*Outcome` / `*Error`; frozen register codes).
3. **Repository** — `infrastructure/data/*.repository.ts` (RLS-scoped write; concurrency; returns old/new field sets).
4. **Command** — `application/commands/*.command.ts` (validate → authorize → repo → `appendAuditRecord`, one tx).
5. **Facade** — `contracts/services.ts` (the type + concrete; re-export the wire mapper; inject the M0 deps).
6. **Wire mapper** — `api/*.handler.ts` (outcome → Doc-5A envelope + status).
7. **App composition** — `src/server/<module>/*.route-handler.ts` (auth → provision → `withActiveOrg` → inject M0 audit).
8. **HTTP route** — `app/api/<module>/**/route.ts` (thin; body→input; serialize).
9. **UI affordance** (where applicable) — a client island POSTing to the endpoint; the read view stays unchanged.
10. **Conformance test** — `tests/integration/*-slice.test.ts` proving, vs **real PostgreSQL**: create→audit,
    update→audit (old/new), conflict→no-write/no-audit, **audit-failure→rollback**, authz, validation.
11. **Green gates** — tsc · eslint · prettier · slice tests · full suite · audit-verified (create+update) · both invariants.
12. **Reports** — a traceability report (Doc-2 §9 → … → audit row → test) + a conformance report.

## 5. D7 layer map (the files to copy)

| Step | D7 file |
|---|---|
| Constants | `src/modules/identity/domain/audit-actions.ts` |
| DTOs | `src/modules/identity/contracts/types.ts` |
| Repository | `src/modules/identity/infrastructure/data/buyer-profile.repository.ts` |
| Command | `src/modules/identity/application/commands/upsert-buyer-profile.command.ts` |
| Facade | `src/modules/identity/contracts/services.ts` |
| Wire mapper | `src/modules/identity/api/upsert-buyer-profile.handler.ts` |
| App composition | `src/server/identity/upsert-buyer-profile.route-handler.ts` |
| HTTP route | `app/api/identity/buyer_profiles/route.ts` (POST) |
| UI form | `app/(app)/account/account-buyer-profile-form.tsx` |
| Conformance test | `tests/integration/upsert-buyer-profile-slice.test.ts` |
| M0 audit facade (reuse) | `src/modules/core/contracts/services.ts` (`appendAuditRecord`) |

---

*REFERENCE — Audited Write Pattern v1.0. D7 is the canonical audited write. Copy the pattern, not a new one. The
audit action must be canonical (Doc-2 §9 business + Doc-4/6 serialization) before code; the write and its audit
share one transaction; audit lives behind the M0 facade; conformance is proven against real PostgreSQL.*
