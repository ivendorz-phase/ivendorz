# ESC — `ESC-W1-AUTH-401` v1.0

| Field | Value |
|---|---|
| **Type** | Recorded escalation (Raise ≠ Accept — CLAUDE.md §13). **Non-blocking** for Wave 1. |
| **Raised by** | Wave 1 execution, WP-1.5 [W1-IDENTITY-002] (Board review — BLOCKER fix applied) |
| **Date** | 2026-06-28 |
| **Severity** | MINOR (non-gating — realized within authority; a future additive standard MAY supersede the body shape) |
| **Status** | **RESOLVED-IN-REALIZATION — Board ruled (2026-06-28): the unauthenticated case is realized as a transport-level auth-boundary 401 carrying NO Doc-5A contract `error_class`.** Doc-5A is unamended; 403 is not used. |
| **Authority** | CLAUDE.md §11 (Flag-and-Halt on a genuine gap); Doc-5A §6.1/§6.2 (contract error model); Doc-5C §3.1 (auth = infrastructure); DC-4 (Doc-5C §8.2 — auth mechanism is infrastructure; the wire carries `Authorization` only) |

---

## 1. The situation

`GET /identity/buyer_profiles` (`identity.get_buyer_profile.v1`, Doc-5C §6.1 row 33) must answer an
**unauthenticated** request (no resolvable session). The natural transport status is `401`. The first
WP-1.5 realization dressed that `401` body in a Doc-5A **contract** error envelope with
`error_class: "AUTHORIZATION"` — which **Doc-5A §6.2 normatively maps to `403`** — while overriding the
status to `401`. That is an internal contradiction in the frozen error model: a client branches on
`error_class` (Doc-4A §12.3) and would read **AUTHORIZATION** (an authorization *denial*) when the real
cause is **no credential presented**.

## 2. Why the Doc-5A class set cannot express it (the genuine gap)

The Doc-5A §6.2 closed error-class set is **contract-level and post-authentication** by design. **It has
no authentication / `401` class** — because authentication is **not** a Doc-5A contract concern:

- Doc-5C §3.1 — "the wire carries `Authorization` only; the auth mechanism is **infrastructure**."
- DC-4 (Doc-5C §8.2) — the auth mechanism (login / 2FA-challenge / session) is **infrastructure**; the
  wire carries the `Authorization` bearer only.

An **unauthenticated** request is therefore **pre-contract**: it never reaches a Doc-5A contract, so it
**must not** be assigned a Doc-5A contract `error_class` at all. Choosing any class (AUTHORIZATION → 403,
or any other) would either contradict the §6.2 status mapping or mislead the client's branch.

## 3. Disposition (the realize-never-redecide fix)

- **Doc-5A is NOT amended** (no new class coined; realize-never-redecide).
- The unauthenticated case is realized as a **transport-level auth-boundary `401`** that carries **no
  contract `error_class`** — only the top-level `reference_id` (Doc-4A §22.1 C-05) for traceability:

  ```
  HTTP 401
  { "reference_id": "<uuidv7>" }
  ```

  Realized as `AuthChallengeEnvelope` + `authChallengeResponse()` in `src/shared/http`, documented there
  and in the route handler as **outside** the Doc-5A contract error model. The thin `app/api` entry MAY set
  the HTTP-standard `WWW-Authenticate` header (transport only; Doc-5A §4.0 admits standard HTTP
  infrastructure headers). The success (`200`, Doc-5A §5.6) and non-disclosure (`404`, Doc-5C §6.3 / Doc-5A
  §6.2 NOT_FOUND collapse) realizations are **unchanged**.

## 4. Requested action (future, additive)

- **If a future Doc-5A / Doc-4A additive standardizes the auth-boundary (pre-contract `401`) response
  shape**, this realization **adopts it** (flag-by-pointer; coin nothing). Until then, the body above is the
  realized auth-boundary response and is **non-gating**.
- No Wave-1 rework is implied: the call site (`handleGetBuyerProfile` step 1) and the helper stay; only the
  body shape would change on a ratified additive.

---

*Raised under Raise ≠ Accept: recorded as non-gating. The auth-boundary 401 is realized within authority
(Doc-5A unamended, no contract `error_class`, 403 not used); a future additive standardizing the shape is
requested by pointer.*
