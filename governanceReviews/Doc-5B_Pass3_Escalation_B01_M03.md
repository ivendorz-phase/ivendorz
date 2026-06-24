# Doc-5B Pass-3 — Escalation Record: B-01 (addressing form) + M-03 (unregistered V8 BUSINESS code)

| Field | Value |
|---|---|
| Record type | Escalation / board-ruling request (PROVENANCE — lifecycle trail, reference only) |
| Raised by | Doc-5B Pass-3 Independent Hard Review (consolidated finding register) |
| Applies to | `generatedDocs/Doc-5B_Content_v1.0_Pass3.md` §5.1 (B-01), §5.4 (M-03) |
| Realizes | `Doc-4B §B8` (config change), `§B9` (feature-flag set) — FROZEN |
| Status | **CLOSED — board ruled (2026-06-24, OPTION A): B-01 → UUIDv7 path addressing (§5.3); M-03 → not a Pass-3 blocker (non-wire invariant). RESIDUAL m-01 / NP-01 → no action (intentional per Doc-5A §5.7 / realize-never-restate).** |
| Discipline | reference-never-restate · realize-never-redecide · flag-and-halt on missing authority · **no token coined** |

> Doc-5B realizes the **wire face** of frozen Doc-4B contracts; it may not re-decide a Doc-4B-owned
> declaration, invent an addressing scheme, or coin an `error_code`. Both items below sit **above**
> Doc-5B's authority (they touch how a frozen contract is addressed / which codes it registers).
> Per `Doc-5_Program_Governance_Note §7` they are escalated, not self-resolved.

---

## B-01 — Addressing form for the config / flag command endpoints is unresolved

**Statement.** `Doc-5A §5.3` mandates the command-path identifier `{id}` = `UUIDv7`. The frozen
`Doc-4B §B8/§B9` Request Contracts identify their target by **natural key** — `key`
(`core.admin_update_config_value.v1`) and `flag_key` (`core.admin_set_feature_flag.v1`) — **not** a
UUIDv7. The two cannot both hold on the wire without a ruling.

**Conflicting authorities.**
- `Doc-5A §5.3` — path grammar `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`; `{id}` is a UUIDv7.
- `Doc-4B §B8` Request Contract — `key : string : required : POLICY key; MUST exist in Doc-3 §12.2`.
- `Doc-4B §B9` Request Contract — `flag_key : string : required : flag identifier (Doc-2 §10.1 flag_key)`.

**Candidate realizations (surfaced, not chosen).**
- **(a) UUIDv7-addressed + key-in-body.** `{id}` = the config/flag record's `UUIDv7` (§5.3-conformant);
  natural key carried in the body per the §B8/§B9 declaration; server **MUST** validate the addressed
  record's key equals the body key. Keeps §5.3 literally; adds a server-side consistency check.
- **(b) Key-addressed resource.** Address the record by its natural key as a declared key-addressed
  resource. Matches the contract's natural identity directly; requires a §5.3 realization allowance for
  natural-key addressing on these contracts.

**Why escalated.** Choosing (a) vs (b) — or amending §5.3's addressing allowance — is an API-governance
decision over a frozen contract's wire identity. Doc-5B cannot pick silently. **No third option is invented.**

**Resolution required from.** API Governance Board (with Doc-5A authors). Outcome fixes §5.1.

---

## M-03 — `Doc-4B §B9` validation rule `V8 : BUSINESS` has no registered `error_code`

**Statement.** `Doc-4B §B9` declares `V8 : BUSINESS : the flag gates rollout/visibility only (never a
firewall-protected concern — §18.3, §4B)`. The §B9 **registered error-code set** is
`core_flag_invalid_input` (VALIDATION) and `core_flag_change_conflict` (CONFLICT) **only** — there is **no
`BUSINESS` code**. The §B8 config contract, by contrast, registers `core_config_value_out_of_bounds` and
`core_config_fixed_rule_not_settable` for its `BUSINESS` rule.

**The question.** Is §B9 `V8` a **wire-returnable `BUSINESS` error** (needing a registered `core_flag_*`
code, hence a `BUSINESS→422` row), or a **non-wire design invariant** (an assertion that the contract never
gates a firewall concern — no caller-facing error, so no `BUSINESS` row on the wire)?

**Conflicting reading.**
- The §B9 `V8` line is formatted as a validation rule with class `BUSINESS` (suggests a wire error).
- §B9 registers no `BUSINESS` code (suggests no wire error — an invariant, not a runtime rejection).

**Why escalated.** Resolving this either (i) requires Doc-4B to register a `core_flag_*` BUSINESS code
(a Doc-4B additive patch — owner decision), or (ii) confirms `V8` is a non-wire invariant and the
`BUSINESS→422` row is correctly **absent**. Doc-5B may **not** coin `core_flag_*` codes (`CHK-5A-121`,
`Doc-4A §6.4`), so it cannot self-resolve (i). **No code is invented.**

**Realization state pending ruling.** The flag command's `BUSINESS→422` row is left **blank/blocked** in
`Doc-5B Pass-3 §5.4`; the §5.1 flag Error-Set marks `BUSINESS→422` as escalated. The config command's
`BUSINESS` codes (§B8, registered) are realized normally — M-03 affects **only** the §B9 flag command.

**Resolution required from.** Doc-4B owner / Architecture Board (ruling, and if (i), a Doc-4B additive patch).

---

## Disposition — CLOSED (board ruling, OPTION A, 2026-06-24)

- **B-01 → RESOLVED.** Board ruled **UUIDv7 path addressing per `Doc-5A §5.3`** (candidate (a)); the
  key-addressed alternative (b) is **not** adopted. `{id}` = the record's `UUIDv7`; natural key carried in
  the body; server validates key match. Applied in `Doc-5B Pass-3 §5.1`.
- **M-03 → not a Pass-3 blocker.** Board ruled §B9 `V8 : BUSINESS` is a **non-wire firewall invariant**, not
  a caller-facing error; the flag command surfaces **no `BUSINESS→422` wire row** — consistent with §B9's
  registered code set. Doc-5B coins no `core_flag_*` code. Any later Doc-4B code registration is a
  Doc-4B-side observation, **not** a Doc-5B freeze gate. Applied in `Doc-5B Pass-3 §5.4`.
- **RESIDUAL (m-01 duplicate error sets / NP-01 "by pointer" repetition) → no action.** Template
  class→HTTP summary (§4.1/§5.1) vs detailed class→HTTP+code table (§4.4/§5.4) are different detail levels,
  not two code-authority locations — defensible per `Doc-5A §5.7`. "by pointer" repetition is an
  intentional realize-never-restate signal, not filler.

These were the **only** open findings from the Pass-3 register; all others (M-01, M-02, m-01…m-04, NP-01/02)
were resolved in-place against the frozen sources. The register's MAJOR M-01 (D-4 carried as open) was
corrected to **RESOLVED** per `Doc-4B_Freeze_Patch_v1.0.1 §2`. **No open Pass-3 items remain.**

*Non-authoritative escalation record. No frozen document is edited; no token is coined. The board ruling,
when it lands, is applied additively to Doc-5B Pass-3 and this record is closed.*
