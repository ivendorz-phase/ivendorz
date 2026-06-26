# Doc-3 — POLICY Key Registration Patch v1.9 (`identity.*`)

| Field | Value |
|---|---|
| Status | **APPROVED / RATIFIED — 2026-06-26** (human/Board). Additive `Doc-3 §12.2` registration; patches frozen Doc-3 without editing it in place. **Effective registry: `identity.*` — 7 keys.** `[DC-5]` CLEARED · `[ESC-6-POLICY]` CLEARED · Doc-6C authoring UNBLOCKED. Board confirmed the **7-key union** (§3.1) + all start values |
| Date | 2026-06-26 |
| Type | **Additive POLICY-key registration** (Doc-3 §12.2 channel — the same used for `core.*` v1.0 and `rfq.*`…`ai.*` v1.1–v1.8). **No semantic / governance-signal / state / event / contract change.** |
| Registers | the **`identity.*` (Module 1)** POLICY-key block — **7 keys** — enumerated by Doc-4C `[DC-5]` (§C.3 + the per-contract `[DC-5]` references + Structure §DC-5) |
| Clears | the Doc-4C `[DC-5]` content-finalization gate (Doc-4A §18.2) **and** the Doc-6C `[ESC-6-POLICY]` (identity) content-freeze gate (DC-CR9) |
| Authority | `Doc-3 §12.2` (POLICY registration channel); `Doc-4C §C.3/§DC-5` (the intended key names — authority for *what* to register); `Doc-4A §18.2` (reference form + escalate-never-invent) |
| Raised by | Doc-6C authoring (`[ESC-6-POLICY]` identity gate, DC-CR9) — flag-and-halt for the missing registration |

---

## §1 — Purpose

Module 1 (`identity`) contracts (Doc-4C) reference tunable idempotency-dedup windows, timer windows, validity defaults, and a succession-reminder cadence **by intended `identity.*` POLICY-key name**, marked `[DC-5]` — but **no `identity.*` block exists in Doc-3 §12.2** (the v1.0–v1.8 patches register `core`/`rfq`/`marketplace`/`trust`/`operations`/`communication`/`billing`/`admin`/`ai` — **not** `identity`). Per Doc-4C §DC-5 / Doc-4A §18.2, these contracts are **not finalized until registration**, and Doc-6C cannot persist their dedup/timer references (DC-CR9) until the keys exist. This patch registers the block **additively** — names verbatim from Doc-4C, **nothing coined**.

## §2 — Scope & non-impact (binding)

- **Additive only.** Registers POLICY keys in `Doc-3 §12.2`; edits no frozen document in place; introduces no entity, state, event, slug, audit action, contract, or template.
- **All keys are POLICY** (tunable; changes audited per Doc-3 §12.4) and **none influences any governance signal** (Doc-4A §18.3 / §4B firewall) — they are idempotency/timer/validity operational tunables only.
- **Reference form** (Doc-4A §18.2): `core.system_configuration.identity.<key_name>`; domain segment = `identity`; stored in `core.system_configuration` (M0-owned — Doc-6B §3.4).
- **Start values are proposed defaults** (Board may adjust at approval) — registration fixes the **names + types**; the values are tunable POLICY thereafter.

## §3 — Registered `identity.*` POLICY keys (the block — 7)

| # | Key | Category | Value type | Purpose (Doc-4C) | Referencing contracts | Proposed start value |
|---|---|---|---|---|---|---|
| 1 | `identity.command_dedup_window` | Idempotency | duration | Generic mutating-command idempotency dedup window (per-domain) | all 21.4 / 21.6 / 21.5 `identity` mutations | **24h** |
| 2 | `identity.user_update_dedup_window` | Idempotency | duration | User self-service mutation idempotency dedup | `update_user_profile`, `update_user_2fa_settings` | **24h** |
| 3 | `identity.membership_invite_dedup_window` | Idempotency | duration | Membership-invite idempotency dedup | `invite_member` | **24h** |
| 4 | `identity.membership_invite_expiry_window` | Timer | duration | `invited → expire` timer window (Doc-2 §5.2) | `expire_invitation` (System 21.5) | **14d** |
| 5 | `identity.delegation_validity_default` | Timer / default | duration | Default `valid_to` span at delegation-grant issue (Doc-2 §5.10) | `create_delegation_grant`, `expire_delegation_grant` | **365d** |
| 6 | `identity.delegation_expiry_sweep_cadence` | Timer | duration | Delegation-grant expiry sweep cadence (Doc-2 §5.10) | `expire_delegation_grant` (System 21.5) | **1h** |
| 7 | `identity.ownership_succession_reminder_cadence` | Timer | duration | Ownership-succession reminder cadence (Doc-2 §5.5) | `transfer_ownership`, `admin_recover_ownership` | **7d** |

*(Keys 1–3 = idempotency dedup; keys 4–7 = timer/validity. All durations; all POLICY.)*

### §3.1 — Discrepancy note (flag-and-halt → Board)

Doc-4C **§C.3** (the explicit registration worklist) enumerates **6** keys, omitting `identity.delegation_expiry_sweep_cadence` (it maps `delegation_validity_default` to both `create_` and `expire_delegation_grant`). However, Doc-4C **contract bodies** (`expire_delegation_grant` Timer/sweep, line ~641/451) **and** Structure **§DC-5** (line ~826) reference `identity.delegation_expiry_sweep_cadence` as a **distinct `[DC-5]` key**. To leave **no contract reference unregistered**, this patch registers the **complete union (7)** — registering the 7th is additive and harmless; omitting it would leave `expire_delegation_grant`'s sweep-cadence reference dangling. **Board to confirm** the 7-key set (vs §C.3's 6) at approval. Nothing coined either way (all 7 names are verbatim from Doc-4C).

## §4 — What this clears

- **Doc-4C `[DC-5]`** — the 7 referenced `identity.*` keys are now registered; Doc-4C contracts referencing them are **finalizable** (Doc-4A §18.2).
- **Doc-6C `[ESC-6-POLICY]` (identity)** — the content-freeze gate (DC-CR9); Doc-6C persistence (idempotency-dedup store; membership-invite + delegation expiry timers; org-create succession-reminder) reads these keys from `core.system_configuration`, **never a literal** (Doc-6A §10.2).

## §5 — Not registered here (flagged, not coined)

- **No `identity.list_page_size_max`.** Doc-4C §C.3 / `[DC-5]` enumerate **no** identity page-size key (unlike the generic `<ns>.list_page_size_max` of v1.1–v1.7). If a frozen Doc-5C list contract requires an identity-scoped page-size bound that no existing key satisfies, that is a **separate escalation** (`[ESC-6-API]` / Doc-4A §18.2) — **not coined here**. Doc-6C registers exactly the Doc-4C-referenced set.
- **No per-user org-count cap key.** Doc-4C references it only as "if configured" (conditional, unnamed in §C.3). If realized, it is registered by a follow-up additive patch with a Board-assigned name — **not coined here**.

## §6 — Governance

All 7 keys are operational POLICY (Doc-3 §12 / Doc-4A §18.3): tunable, changes audited (Doc-3 §12.4), **no governance-signal / scoring / firewall impact** (Doc-4A §4B). No module ownership, state, event, slug, or contract changes. The `core.system_configuration` storage + the seed are realized by Doc-6C §5/§6 (reading the registered block), owned by M0 (Doc-6B §3.4).

---

*Additive Doc-3 §12.2 POLICY-key registration — the `identity.*` block (7 keys), names verbatim from Doc-4C `[DC-5]`. PROPOSED — awaiting human/Board approval. On approval: clears Doc-4C `[DC-5]` + Doc-6C `[ESC-6-POLICY]` (DC-CR9); the frozen Doc-3 is not edited in place; this patch is the effective `identity.*` registration. Coins nothing; no governance/state/event/contract change; flag-and-halt discrepancy (§3.1) surfaced for Board confirmation.*
