# Doc-5B — Platform Core (M0 `core`) API Realization — Content v1.0, Pass 3 (§4–§5)

| Field | Value |
|---|---|
| Document | Doc-5B — Platform Core / Shared Kernel (Module 0) — API Realization |
| Pass | 3 of N — Sections §4 and §5 only |
| Status | ACTIVE — Content Pass 3 of N; §4–§5 only. Independent Hard Review applied + board-ruled (register: B-01, M-01, M-02, M-03, m-01…m-04, NP-01/02). **All findings resolved** — B-01 ruled UUIDv7 path addressing (§5.3); M-03 ruled non-blocking (§B9 V8 = non-wire invariant). No open Pass-3 items (`governanceReviews/Doc-5B_Pass3_Escalation_B01_M03.md`, CLOSED) |
| Structure | Conforms to `Doc-5B_Structure_v1.0_FROZEN.md` |
| Realizes | `Doc-4B §B5` (audit redaction), `§B8` (config change), `§B9` (feature-flag set) — FROZEN — on HTTP |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5B Content Pass-1 (§0–§2), Pass-2 (§3) |
| Contains | Wire realization of the three M0 Admin **command** endpoints — audit redaction, configuration change, feature-flag set (path, body, idempotency/concurrency, success, error-status set, authorization). No read surface (§3), no out-of-wire mechanisms (§6 — incl. the `config_value_query`/`feature_flag_evaluate` internal reads), no contract bodies restated |
| Audience | Architecture / API Governance Boards · Doc-5B authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** `Doc-4B §B5/§B8/§B9` fix the three Admin command contracts — their request/response, idempotency/concurrency model, audit, firewall, and error codes (FROZEN). §4–§5 realize only their **HTTP wire face** per Doc-5A and re-decide none of it. Representations, POLICY keys, error codes, and audit actions are bound **by pointer, never restated**. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§9`; `Doc-4B §B5/§B8/§B9`; Doc-5B §2 (inventory).

---

## §4 — Audit Redaction Realization

Realizes `core.admin_redact_audit_field.v1` (`Doc-4B §B5`) — the only permitted mutation of the immutable `core.audit_records` stream (compliance-ordered field redaction).

### 4.1 The Redaction Endpoint (§5.7 realization)

```
Realization (Doc-5A §5):
  HTTP-Method     : POST                                                    (§5.2 — state-changing command)
  Path            : /core/audit_records/{id}/admin_redact_audit_field       (§5.3; {id} = audit_id, UUIDv7)
  Input-Placement : {id}=audit_id → path; fields_to_redact, redaction_reason → body   (§5.4)
  Success-Status  : 200                                                     (§5.5 — synchronous command with result)
  Response-Body   : result                                                  (§5.6)
  Error-Status-Set: { VALIDATION→400, AUTHORIZATION→403, NOT_FOUND→404, BUSINESS→422, CONFLICT→409 }  (§6.2)
```

- Addressing is **clean**: the §B5 `audit_id` (a `UUIDv7`) is the `{id}` path segment (§5.3); `fields_to_redact` and `redaction_reason` are the command body (§5.4). `admin_redact_audit_field` is the named command sub-resource (§5.2) — a `POST`, never field replacement.
- Success body is the `Doc-5A §5.6` command envelope `{ "result": <§B5 Response Contract>, "reference_id": <uuidv7> }` — the `result` object is the **§B5 Response Contract by pointer, not restated here**; top-level `reference_id` per `Doc-4A §22.1 C-05`. The §B5 `updated_at` is the post-redaction concurrency token (§4.2).
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.6`; `Doc-4B §B5`. **Rationale [realization convention — command endpoint]:** one named-command POST is the wire form of the frozen redaction command.

### 4.2 Idempotency & Concurrency (§9)

- `Doc-4B §B5` declares `Idempotency: required` → the **`Idempotency-Key` header is mandatory** on this request (`Doc-5A §9`; §4.4 slot). A replay within the POLICY-keyed window (`core.system_configuration.core.redaction_dedup_window`, by key) returns the **cached original result** — same result, no second redaction, no duplicate redaction audit record (**§14.3 joint rule, audit-record leg only**; `Events-Produced: none` — the §14.3 outbox-event leg is **not applicable** to this contract) (`Doc-5A §9.7`; `Doc-4B §B5` per Freeze Patch FP-03).
- `Concurrency: optimistic` (Token `updated_at`) → the **`If-Match` precondition carries the `updated_at`** of the target record (`Doc-5A §9`; §4.4 slot); a stale token is a `CONFLICT` (§4.4).
- **Binds:** `Doc-5A §9`; `Doc-4B §B5`. **Rationale:** redaction is unsafe and replay-sensitive; both carriages are mandatory exactly as declared.

### 4.3 Non-Disclosure (§6.3)

- The §B5 `V4 : NOT_FOUND | collapse-rule` + `Timing-Uniformity: asserted` realize as the wire indistinguishability invariant (`Doc-5A §6.3`; `Doc-4A §12.4`): a target audit record outside the caller's compliance scope returns a `404` identical in status, body, and timing to a genuinely-absent record — existence is never disclosed beyond compliance scope.
- **Re-redaction is a no-op, not an error** (§B5 `V8`): redacting an already-redacted field succeeds idempotently and reveals nothing (`Doc-4B §B5`, which carries the Architecture §14.3 pointer internally — bound through §B5, not restated).
- **Binds:** `Doc-5A §6.3`; `Doc-4B §B5`; `Doc-4A §12.4`.

### 4.4 Error-Status Set (§6)

| `error_class` | HTTP | §B5 `error_code` |
|---|---|---|
| `VALIDATION` | `400` | `core_audit_invalid_redaction_input` |
| `AUTHORIZATION` | `403` | (§5.6 context / authz; collapsed per §4.3 where existence is gated) |
| `NOT_FOUND` | `404` | `core_audit_record_not_found` (collapse target) |
| `BUSINESS` | `422` | `core_audit_field_not_redactable` |
| `CONFLICT` | `409` | `core_audit_redaction_conflict` (stale `If-Match`) |

Codes are within the registered `core_` namespace (`Doc-4A Appendix B.2`), bound by pointer. **Binds:** `Doc-5A §6.2`; `Doc-4B §B5`.

### 4.5 Authorization & Audit (§7)

- **Admin** (21.6): `Authorization` bearer = authentication only; authorization is the server-side **`staff_can_redact_audit`** slug (`Doc-4B §B5`; Doc-2 §7 — this slug **exists**; **no D-2 dependency** here, unlike config/flag), plus `tenant-data-access` Admin-Scope + Compliance-Basis. **No `Iv-Active-Organization`** (§7.3); no delegation.
- The redaction is itself **audited** server-side (`Audit-Required: yes`; Action-Ref Doc-2 §9 "audit redaction (event)", by pointer) and correlated by `reference_id` + idempotency key (`Doc-4B §B5` §17.7) — an audit obligation, **not a wire field**.
- **Binds:** `Doc-5A §7.1/§7.3`; `Doc-4B §B5`; Doc-2 §7.

---

## §5 — System Configuration & Feature-Flag Surface Realization

Realizes the two Admin **command** contracts `core.admin_update_config_value.v1` (`Doc-4B §B8`) and `core.admin_set_feature_flag.v1` (`Doc-4B §B9`). The §B8/§B9 **internal reads** (`config_value_query`, `feature_flag_evaluate`) are in-process services with **no wire** → out-of-wire (§6), not realized here.

### 5.1 The Two Command Endpoints (§5.7 realization)

```
Change Configuration Value (Doc-4B §B8):
  POST /core/system_configurations/{id}/admin_update_config_value           (§5.2/§5.3)
  Body: new_value, value_type, change_reason (+ key — see §5.1 addressing note)   (§5.4)
  Success 200; result body; Error-Set { VALIDATION→400, AUTHORIZATION→403, REFERENCE→422, BUSINESS→422, CONFLICT→409 }

Set Feature Flag (Doc-4B §B9):
  POST /core/feature_flags/{id}/admin_set_feature_flag                       (§5.2/§5.3)
  Body: enabled, scope?, change_reason (+ flag_key — see §5.1 addressing note)     (§5.4)
  Success 200; result body; Error-Set { VALIDATION→400, AUTHORIZATION→403, CONFLICT→409 }
```

- Success bodies are the `Doc-5A §5.6` command envelope `{ "result": <§B8 / §B9 Response Contract>, "reference_id": <uuidv7> }` — each `result` object is its **§B8 / §B9 Response Contract by pointer, not restated here**; top-level `reference_id` per `Doc-4A §22.1 C-05`.
- **Addressing — board-ratified (B-01, resolved per `governanceReviews/Doc-5B_Pass3_Escalation_B01_M03.md`):** `{id}` = the config/flag **record's `UUIDv7`** per `Doc-5A §5.3` (the board ruled **UUIDv7 path addressing**; the key-addressed alternative is **not** adopted). The natural key (`key` / `flag_key`) is carried in the **body** per the §B8/§B9 Request Contract; the server **MUST** validate the addressed record's key equals the body key.
- **Binds:** `Doc-5A §5.2/§5.3/§5.4/§5.6`; `Doc-4B §B8/§B9`.

### 5.2 POLICY-Key & Firewall Boundary

- **Config change** writes a **POLICY value by key** only: the `key` **MUST** exist in `Doc-3 §12.2` (`Doc-4B §B8` V7/REFERENCE — a new key is a Doc-3 patch, never created on the wire); `new_value` **MUST** be within the key's declared bounds and **MUST NOT** set a FIXED rule (`Doc-4B §B8` V8/BUSINESS; `Doc-3 §12.1`; §18.5). Values are referenced/bounded by key, **never a literal POLICY value invented on the wire**.
- **Firewall (binding, by pointer):** config change and flag set **write no governance signal** and gate **no** trust / verification / eligibility / routing-fairness / matching-confidence concern (`Doc-4B §B8/§B9` Firewall-Compliance Declaration; §18.3/§4B). Flags gate feature rollout/visibility only.
- **Scoring-key downstream effect (out-of-wire):** where a changed key is scoring-relevant, the Trust `formula_version` increment is a **downstream effect via the §4 integration channel owned by Trust/RFQ** (`Doc-4B §B8`; Doc-2 §10.6) — **not** this endpoint's wire surface and **not** an M0-owned mutation; `formula_version_bumped` is a read-only visibility field in the response.
- **Binds:** `Doc-4B §B8/§B9`; `Doc-3 §12.1/§12.2`; `Doc-5A §8` (POLICY-keyed values); `Doc-4A §18.3/§18.5`.

### 5.3 Idempotency & Concurrency (§9)

- Both commands declare `Idempotency: required` and `Concurrency: optimistic` (Token `updated_at`) → the **`Idempotency-Key` header is mandatory** and the **`If-Match` precondition carries `updated_at`** (`Doc-5A §9`; §4.4 slots). Replay within the POLICY-keyed window (`core.system_configuration.core.config_change_dedup_window` / `core.system_configuration.core.flag_change_dedup_window`, by key) returns the cached original — **no second write, no duplicate audit record, no duplicate downstream trigger** (`Doc-5A §9.7`; `Doc-4B §B8/§B9` §14.3).
- **Binds:** `Doc-5A §9`; `Doc-4B §B8/§B9`.

### 5.4 Error-Status Sets (§6)

| `error_class` | HTTP | §B8 config code | §B9 flag code |
|---|---|---|---|
| `VALIDATION` | `400` | `core_config_invalid_input` | `core_flag_invalid_input` |
| `AUTHORIZATION` | `403` | (§5.6 context / authz) | (§5.6 context / authz) |
| `REFERENCE` | `422` | `core_config_key_not_found` | — |
| `BUSINESS` | `422` | `core_config_value_out_of_bounds`, `core_config_fixed_rule_not_settable` | — *(no wire row — M-03)* |
| `CONFLICT` | `409` | `core_config_change_conflict` | `core_flag_change_conflict` |

- **M-03 — board-ruled (not a Pass-3 blocker; `governanceReviews/Doc-5B_Pass3_Escalation_B01_M03.md`):** `Doc-4B §B9` declares `V8 : BUSINESS` (the flag gates rollout/visibility only — a **firewall design invariant**) but registers **no wire `error_code`** (the §B9 registered set is `core_flag_invalid_input` / `core_flag_change_conflict` only). Realized accordingly: the flag command surfaces **no `BUSINESS→422` wire row** — `V8` is a non-wire invariant, not a caller-facing error. Doc-5B coins no `core_flag_*` code. Whether Doc-4B later registers a flag `BUSINESS` code is a Doc-4B-side observation, **not a Doc-5B freeze gate**.
- No protected-fact collapse applies (both declare `Timing-Uniformity: not-applicable` — platform config, no protected-fact surface, `Doc-4B §B8/§B9`). Codes are owned by `Doc-4B §B8/§B9` within the `core_` namespace, by pointer. **Binds:** `Doc-5A §6.2`; `Doc-4B §B8/§B9`.

### 5.5 Authorization & Carried Items (§7)

- **Admin** (21.6), `platform-wide` Admin-Scope: `Authorization` bearer = authentication only; authorization is the server-side **`staff_super_admin`** slug (`Doc-4B §B8/§B9`; Doc-2 §7). **No `Iv-Active-Organization`** (§7.3); no delegation.
- **Carried — D-2 (carry-forward, `Doc-4B_Freeze_Patch_v1.0.1 §2`):** no least-privilege `staff_*` slug for config/flag exists in Doc-2 §7; `staff_super_admin` is the authoritative binding until a future Doc-2 §7 additive patch (`Doc-4B §B8/§B9` [D-2]). Not a freeze gate. **D-4 (config-governance ownership) — RESOLVED at Doc-4B freeze** (`Doc-4B_Freeze_Patch_v1.0.1 §2`, APPROVED): Module 0 **stores/exposes** config, Module 8 **governs** policy/oversight (Doc-2 §16.2); no Doc-4B ownership change. Bound by pointer; **not an open Doc-5B item**.
- The config/flag changes are **audited** server-side (`Audit-Required: yes`; Action-Ref Doc-2 §9, by pointer); `Events-Produced: none` (`Doc-4B §B8/§B9`) — engines read values at runtime, no wire event.
- **Binds:** `Doc-5A §7.1/§7.3`; `Doc-4B §B8/§B9`; Doc-2 §7/§16.2.

---

*End of Doc-5B Content v1.0, Pass 3 (§4–§5). The three M0 Admin command endpoints (audit redaction, config change, feature-flag set) realized on the wire — path/body, mandatory `Idempotency-Key` + `If-Match`, success + error-status sets, POLICY-key/firewall boundary, Admin authorization — all by pointer; representations/codes/POLICY keys/audit actions not restated; the §B8/§B9 internal reads and the scoring-key downstream effect are out-of-wire. Both escalated items are **board-ruled and closed** — B-01 (addressing, §5.1) ratified as UUIDv7 path addressing (`Doc-5A §5.3`); M-03 (§B9 V8, §5.4) ruled a non-wire firewall invariant, not a freeze gate; no token coined. No open Pass-3 items. §6 (out-of-wire boundary) and §7 (conformance) follow next, conforming to `Doc-5B_Structure_v1.0_FROZEN.md`.*
