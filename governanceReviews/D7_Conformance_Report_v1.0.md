# D7 Conformance Report — `identity.upsert_buyer_profile.v1` v1.0

| Field | Value |
|---|---|
| Date | 2026-06-30 |
| Scope | The M1 buyer-profile WRITE vertical (D7) — gate evidence for the CTO-required green checks. |
| Oracle | Real **PostgreSQL 16** (ephemeral `docker compose` DB) — migrations applied incl. `20260630090000_audit_context_append_policy`. |
| Verdict | **✅ ALL REQUIRED GATES GREEN.** |
| Companion | `D7_Traceability_Report_v1.0.md` (the realization chain). |

---

## Required gates (CTO)

| Gate | Result | Evidence |
|---|---|---|
| **TypeScript** (`tsc --noEmit`) | ✅ exit 0 | whole project typechecks with the vertical + form |
| **ESLint** | ✅ exit 0 | all D7 source/test/UI files lint clean |
| **Prettier** | ✅ exit 0 | all D7 files conform after format |
| **Slice tests** | ✅ **6 / 6** | `tests/integration/upsert-buyer-profile-slice.test.ts` |
| **E2E vs live PostgreSQL** | ✅ **full suite 58 / 58** | the slice + every existing integration test, run against the live DB (the Playwright login→form e2e remains parked pending a Supabase project — the codebase's `build-local-park-deploy` convention, same as the read slice's e2e) |
| **Audit verification — create path** | ✅ | CREATE test asserts exactly one `buyer_profile_created` audit row, `actor_type='user'`, correct `actor_id`/`organization_id`, `old_value=null` |
| **Audit verification — update path** | ✅ | UPDATE test asserts the second row is `buyer_profile_updated` with `old_value`=prior / `new_value`=new |
| **No transaction without an audit record** | ✅ | every successful create/update appends its audit row in the SAME tx (CREATE/UPDATE assert the row; CONFLICT asserts NO spurious audit on a rejected write) |
| **No audit record without a successful transaction** | ✅ | the INVARIANT test injects a failing `appendAuditRecord`; the whole tx rolls back → NO buyer_profile row persists |

---

## Test matrix (`upsert-buyer-profile-slice.test.ts` — 6/6 against real PostgreSQL)

| # | Test | Proves |
|---|---|---|
| 1 | **CREATE → 201 + `buyer_profile_created` audit** | absent → create; status 201 + Doc-5A §5.6 envelope + `reference_id`; the business row persists; **exactly one** audit row, canonical action, correct attribution, `old_value=null` |
| 2 | **UPDATE → 200 + `buyer_profile_updated` audit** | present → update; status 200; same singleton row; two audit rows `[created, updated]`; the update row carries the old→new diff |
| 3 | **CONFLICT → 409, no extra audit** | stale `updated_at` (optimistic concurrency) → 409 `identity_buyer_profile_conflict`; the rejected write changes nothing and appends **no** audit |
| 4 | **INVARIANT — audit failure rolls back the write** | a failing `appendAuditRecord` rolls the whole tx back → **no** buyer_profile row (no business write without audit; no audit without a committed write) |
| 5 | **FORBIDDEN → 403** | `[ESC-IDN-SLUG]` interim — a non-Owner/Director active membership → `AUTHORIZATION` / `identity_buyer_profile_forbidden`; no write, no audit |
| 6 | **VALIDATION → 400** | malformed input (`industry` not a string) → `VALIDATION` / `identity_buyer_profile_invalid_input` before any write |

The audit READ is staff-only (ESC-W2-AUDIT-RLS), so the tests inspect audit rows via the RLS-bypassing superuser
connection — asserting row existence + content exactly as a future staff/compliance reader would see it.

---

## Architecture conformance (no regression; no boundary breach)

- **Full integration suite 58/58** — includes the Wave-1 `buyer_profiles` RLS byte-equivalence gate (9/9), the
  audit-RLS conformance gate (16/16), and the account-view READ render test (4/4, unchanged — the write form is a
  separate client island; the read view stays form-free).
- **Pattern enforced** — Command → `appendAuditRecord()` → Repository → Transaction; no command writes SQL; no
  repository knows audit policy; audit stays behind the M0 facade; M1 imports only the M0 contract type.
- **Canonical audit action from row one** — the audited write uses the frozen Doc-2 §9 / Doc-4C v1.0.2 tokens via
  imported constants (never literals), exactly as the governance ruling required.

---

## Known interim bindings carried (documented, not invented)

- **`[ESC-IDN-SLUG]`** — authorization is the interim Owner/Director authority (no dedicated `can_manage_buyer_profile`
  slug yet; Doc-4C §C10). Realized in the command; awaits a future Doc-2 §7 additive.
- **`[ESC-IDN-BUYERPROFILE-CODE]`** — the no-context NOT_FOUND collapse reuses the read's interim code; the write
  register codes (`invalid_input`/`forbidden`/`conflict`) are the **frozen** Doc-4C §C10 codes.
- **`[DC-5]`** — concurrency is realized as optimistic concurrency on `updated_at`; the dedup-window POLICY key is a
  future registration (Doc-3 §12.2). `approval_settings` (Doc-4C input) has no Doc-2 §10.2 column → deferred.
- **Playwright login→form e2e** — parked pending a Supabase project (no live auth env), per the codebase convention;
  the runnable e2e is the integration suite against live PostgreSQL (green).

---

*D7 Conformance Report v1.0 — the buyer-profile write vertical passes every CTO-required green gate against a real
PostgreSQL instance: tsc · eslint · prettier · 6/6 slice · 58/58 suite · audit verified on create AND update · both
transaction↔audit invariants proven. Governance-clear and engineering-proven.*
