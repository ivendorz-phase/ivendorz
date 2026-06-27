# ESC — `ESC-W1-USER-PROVISION` v1.0

| Field | Value |
|---|---|
| **Type** | Recorded escalation (Raise ≠ Accept — CLAUDE.md §13). **Non-blocking** for Wave 1. |
| **Raised by** | Wave 1 execution, WP-1.3 [W1-AUTH-001] |
| **Date** | 2026-06-28 |
| **Severity** | MINOR (non-gating — an interim default is in place; the skeleton functions) |
| **Status** | **OPEN — interim disposition in use; awaits an additive ratification.** |
| **Authority** | CLAUDE.md §11 (Flag-and-Halt on a genuine gap); §13 (Raise ≠ Accept) |

---

## 1. Background — the resolved part

The **provisioning trigger** was ruled in planning: **lazy first-request provisioning** — on the first
authenticated request with no `identity.users` row, M1 atomically (one transaction, idempotent) creates
`users` + a personal default `organizations` row (`is_personal_org = true`) + an owner `membership`
(Owner system-bundle role), satisfying Invariant #5 (user ≥ 1 org). That is realized and tested
(WP-1.3: `tests/integration/identity-provisioning.test.ts` — atomic · idempotent · full-rollback).

The corpus supports a personal org: `identity.organizations.is_personal_org` is a frozen column
(Doc-6C §3.2). The org+owner-membership+`human_ref` create flow binds **Doc-4C §C5** (`create_organization`;
`human_ref` via Module 0, "not locally"). **No `create_user` wire contract is coined** (Doc-7E §2;
`[ESC-7-API-SIGNUP]`).

## 2. The genuine gap (cite the source)

The **personal-organization NAME** has **no deterministic rule** in the frozen corpus. The Master
Architecture §5.2 gives an *example* (`"Musa Trading"`), not a format/derivation **rule**. Auto-creating a
personal org on first login therefore needs a name, but the corpus does not specify how to derive it.
Inventing a business naming convention would violate realize-never-redecide.

## 3. Interim disposition (in code, flagged — NOT silently finalized)

WP-1.3 uses a transparent placeholder derivation: **title-cased email local-part + `" Trading"`**
(`musa@example.com` → `"Musa Trading"`), flagged at its 2 occurrences in
`src/modules/identity/application/commands/provision-identity.command.ts`. This is a sensible default that
keeps the walking skeleton functioning; it is **not** ratified as the rule.

## 4. Why non-blocking

The org name is a cosmetic/business label; it does not affect the slice's spine (auth → active-org →
RLS-scoped read → screen), the RLS isolation, or any invariant. Wave 1 proceeds; the rule can be ratified
later without reworking the skeleton.

## 5. Requested action (additive ratification, never a frozen-doc edit)

A Board / Architecture ruling on the personal-org naming rule — e.g. (a) ratify the interim
email-local-part derivation; (b) specify a different format; or (c) require the user to name the org
(making first-login provisioning create the user + a *pending* org-less state and prompt for an org name —
a larger UX change). Until ruled, the interim default stands, flagged.

---

*Raised under Raise ≠ Accept: a claim with a severity, adjudicated by the presiding authority. Recorded as
non-gating; the interim disposition is explicit in code and here.*
