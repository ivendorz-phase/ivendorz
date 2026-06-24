# Doc-5C — Identity & Organization (M1 `identity`) API Realization — Structure Proposal v0.2

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review applied** (2 MAJOR + 5 MINOR + observations dispositioned, §Review Disposition). Freeze-ready; one optional lightweight re-review of the §3/§C8 reorganization (O-01) → Structure FROZEN |
| Module | Module 1 — Identity & Organization (`identity` schema) |
| Realizes | `Doc-4C` (M1 contracts, FROZEN — 42 contracts, PassB Appendix A) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B_SERIES_FROZEN_v1.0` established the out-of-wire boundary (R1); its force derives from `Doc-5A §1.3/§5/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN), Doc-4C v1.0 (FROZEN), Doc-4M v1.0 (FROZEN — state machines), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (with section-pointer column), ratified realization decisions, carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5C content authors (human + AI) · AI Coding Supervisor · backend, QA |

Two governing rules shape this document (the Doc-5B precedent):

1. **Realize, never re-decide.** Doc-4C fixed *what* M1's 42 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Doc-5C realizes Doc-4C's caller-facing surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4C / corpus by pointer.
2. **Conformance is an obligation.** Doc-5C passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, or POLICY key.

---

## Decisions ratified at structure freeze (proposed)

- **R1 — Out-of-wire boundary** (Doc-5B R1 precedent; authority `Doc-5A §1.3/§5/§11`). Doc-5C realizes only the caller-facing HTTP surface (User + Admin). The **§C3 authorization-root reads** — `identity.get_user.v1`, `identity.get_organization.v1`, `identity.get_membership.v1`, `identity.check_permission.v1` (all `Audience: internal-service`, 21.3) — have **no caller wire**: they are the in-process authorization-resolution services every other module consumes (Doc-4C §C3 authoritative-source rule). The **System timers** (`activate_membership`, `expire_invitation`, `expire_delegation_grant`, 21.5, `Response: none`), the **dual-audience reads' internal-service leg** (`get_buyer_profile`, `get_workflow_settings` consumed by M3/M6), and the **DC-1 cross-module cascade/teardown** are likewise out-of-wire (§7). **Flag-and-halt if any wire is proposed for them.**
- **R2 — User-primary actor surface WITH server-validated active-organization context.** Unlike M0 (admin-only, no org context), M1's primary actor is the **User** acting inside an active org: the `Iv-Active-Organization` context header **is** carried and is **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`). The **Admin** governance subset (org/user suspend-reinstate, ownership recovery — 21.6) carries **no** org context (`Doc-5A §7.3`). System is out-of-wire (R1).
- **R3 — `identity` route prefix** (`Doc-5A Appendix B.1`; `Doc-2 §0.3`).
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs; carried gaps (`[ESC-IDN-SLUG]`; **DC-3** `staff_*` governance slugs; **DC-5** `identity.*` POLICY keys; `[ESC-IDN-AUDIT]`; `[ESC-IDN-DELEG-EXPIRY]`) are bound by pointer and **escalated, never invented** — `CHK-5A-121`/`-154`; `Doc-4A §6.4`/§18.2.
- **R5 — Delegation realized as grant-management commands + party reads only.** The `delegation_grants` lifecycle commands and the dual-party reads (`get_delegation_grant`, `list_delegation_grants`) are realized as caller-facing endpoints (`Doc-4C §C9`). The §6B **delegated-access check** (five-condition resolution, four-attribution rule) is performed **server-side inside `check_permission` (out-of-wire, R1)** — no delegation grant, scope, or attribution is ever a wire input (`Doc-4A §6B`/§9.7; `Doc-5A §7`).
- **R6 — No event surface (DC-1).** Module 1 emits **no domain event** (`Doc-2 §8` — no `identity` emitter; `Doc-4C §C12.4`). Doc-5A §11 event surface is N/A; cross-module cascade/teardown is out-of-wire integration **blocked at DC-1**; no webhook/push (`Doc-5A §11.3`).

---

## M1 surface partition (the structural spine)

> **42 Doc-4C contracts** (PassB Appendix A) — **35 caller-facing**, **7 out-of-wire**. Each row carries an explicit **Doc-5C §** owner; every contract is assigned to exactly one section.

| Doc-4C contracts | Nature | **Doc-5C §** |
|---|---|---|
| §C4 `update_user_profile`, `update_user_2fa_settings`, `deactivate_own_account` | User command (21.4) | **§4** `POST` |
| §C4 `set_user_account_status` · §C5 `set_organization_status`, `admin_recover_ownership` | Admin governance (21.6, no org context) | **§4** `POST` |
| §C5 `create_organization`, `update_organization_profile`, `transfer_ownership`, `soft_delete_organization`, `restore_organization` | User command (21.4; §5.1 machine) | **§4** `POST` |
| §C6 `invite_member`, `accept_invitation`, `set_membership_status`, `remove_member`, `revoke_invitation` | User command (21.4; §5.2 machine) | **§5** `POST` |
| §C7 `create_role`, `update_role`, `set_role_permissions`, `delete_role` (cmd) · `list_roles`, `list_permissions` (read) | User command / Query (21.4 / 21.3) | **§5** `POST` / `GET` |
| §C9 `create_delegation_grant`, `suspend_delegation_grant`, `reinstate_delegation_grant`, `revoke_delegation_grant` (cmd) · `get_delegation_grant`, `list_delegation_grants` (read) | User command / Query (21.4 / 21.3; §5.10 machine; R5) | **§5** `POST` / `GET` |
| §C8 `switch_active_organization` (cmd) · `get_active_context`, `list_my_organizations` (read) | User command / Query (21.4 / 21.3) | **§6** `POST` / `GET` |
| §C10 `upsert_buyer_profile` (cmd) · §C11 `update_workflow_settings` (cmd) | User command (21.4) | **§6** `POST` |
| §C10 `get_buyer_profile` · §C11 `get_workflow_settings` (owning-org read) | Query (21.3), dual-audience | **§6** `GET` (internal-service M3/M6 leg → §7) |
| §C3 `get_user`, `get_organization`, `get_membership`, `check_permission` | internal-service (21.3) — authorization root | **§7** out-of-wire |
| §C6 `activate_membership`, `expire_invitation` · §C9 `expire_delegation_grant` | System (21.5) | **§7** out-of-wire |
| DC-1 cross-module cascade (org soft-delete → M2/M3; delegation teardown → M3) | Integration (blocked) | **§7** out-of-wire |

§3 is a **cross-cutting wire-model section and owns no endpoint** — §4/§5/§6 each depend on it (see §3 purpose).

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5C's precedence (… → Doc-4A → Doc-4B → Doc-4C → Doc-5A → **Doc-5C** → Code); the obligation to conform to Doc-5A in full and pass Appendix A; realize-never-redecide; flag-and-halt.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M1 Surface Partition
- **Purpose:** what Doc-5C governs (the M1 caller-facing HTTP surface) and does not; carry the surface-partition table; the **§1.x dependency boundary** (M1 owns realization only for M1 surfaces; cross-module → owning module's Doc-5x — Marketplace → Doc-5D, RFQ → Doc-5E); register the carried freeze-gate dependencies **DC-1…DC-5**, `[ESC-IDN-SLUG]`, `[ESC-IDN-AUDIT]`, `[ESC-IDN-DELEG-EXPIRY]` by pointer (resolved only via their Doc-4C channels; none resolved here).
- **Dependencies:** `Doc-5A §1`; `Doc-4C §C1`, Appendix C (DC-1…DC-5). **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `identity`-namespace HTTP surface — one row per **caller-facing** endpoint (the 35 User commands/queries + Admin governance commands): method (§5.2), path grammar (§5.3), actor + active-org applicability (§7), success status (§5.5). Command tokens = the exact `identity.<operation>` operation names **verbatim from the Doc-4C PassB Appendix A Contract-ID column** (`identity.<operation>.v1`; `Doc-4A §21` / `Doc-5A §5`). Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`identity`); `Doc-4C` PassB Appendix A (42-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Authorization & Context Wire Model *(mechanism only — owns no endpoint)*
- **Purpose:** the defining Doc-5C cross-cutting section — realize, on the wire, the authorization/context **mechanism** that §4/§5/§6 endpoints all depend on (it instantiates no endpoint body): `Authorization` bearer = authentication only; **`Iv-Active-Organization` server-validated, never client-trusted** (R2) — *the active organization is owned by the Identity context state model (`Doc-4C §C8`); the header carries selected context only and never establishes authority independently*; the three-layer authorization check + the §6B delegated-access check are **server-side** (R5 — no authz/delegation vocabulary is ever a wire input, `Doc-4A §9.7`); the Admin governance subset carries no org context (§7.3); non-disclosure (§6.3/§7) on protected-fact-gated reads (`NOT_FOUND` collapse). The §C8 context **endpoints** (`switch_active_organization`, `get_active_context`, `list_my_organizations`) are **realized in §6**, not here.
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §5/§5.3/§6/§6B/§9.7`; `Doc-4C §C3/§C8/§C12`. **Detail:** cross-cutting wire-model declaration; bound, not redefined; no endpoint instantiation.

## §4 — User & Organization Surface Realization
- **Purpose:** §C4 user commands + §C5 organization commands as named-command `POST`s; the org **§5.1** state machine (`active ⇄ suspended`, `→ soft_deleted → active`) realized as legal transitions only (no transition invented — `Doc-4A §13`, authoritative state authority **Doc-4M**); Admin governance subset (`set_user_account_status`, `set_organization_status`, `admin_recover_ownership` — 21.6, no org context); idempotency/concurrency carriage (§9); error mapping (§6); top-level `reference_id` (C-05). DC-1 org-cascade cross-module legs noted out-of-wire (§7/R6).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4C §C4/§C5`; `Doc-4M` (org §5.1 machine); `Doc-4A §13`. **Detail:** command + governance realization.

## §5 — Membership, Role & Delegation Surface Realization
- **Purpose:** §C6 membership commands (**§5.2** machine), §C7 role/permission commands + reads (bundle-vs-slug; permission catalog read-only — `Doc-4A §6.2/§6.4`), §C9 delegation grant commands (**§5.10** machine; R5 — grant management only, the §6B check stays server-side) **and the dual-party delegation reads** (`get_delegation_grant`, `list_delegation_grants`); idempotency/concurrency; error mapping. `reinstate_delegation_grant` carries **`[ESC-IDN-DELEG-EXPIRY]`** (lapsed-window-reinstatement disposition unresolved) — not finalized until resolved (§8). The System timers (`activate_membership`, `expire_invitation`, `expire_delegation_grant`) are out-of-wire (§7).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4C §C6/§C7/§C9`; `Doc-4M` (membership §5.2 + delegation §5.10 machines); `Doc-4A §6B/§13`. **Detail:** command + party-read realization (state-machine + delegation).

## §6 — Context, Buyer-Profile & Workflow-Settings Surface Realization
- **Purpose:** **§C8 context endpoints** — `switch_active_organization` (cmd) + `get_active_context`, `list_my_organizations` (reads) *(the context mechanism is §3; the endpoints are here)*; §C10 `upsert_buyer_profile` (cmd) + `get_buyer_profile` (owning-org `GET`); §C11 `update_workflow_settings` (cmd, ORG-leg, POLICY-bounded via Doc-4B `config_value_query` — out-of-wire resolution) + `get_workflow_settings` (owning-org `GET`); the dual-audience reads realize the **owning-org** wire face only — the internal-service (M3/M6) consumption is out-of-wire (§7); non-disclosure on cross-tenant reads.
- **Dependencies:** `Doc-5A §5/§6/§7/§8`; `Doc-4C §C8/§C10/§C11`; `Doc-3 §12.3` (ORG bounds). **Detail:** read/write realization (context + profile + settings).

## §7 — Out-of-Wire Boundary (§C3 authorization root · System timers · dual-audience internal leg · DC-1 cascade)
- **Purpose:** declare that the §C3 authorization-resolution reads (`get_user`/`get_organization`/`get_membership`/`check_permission`), the System Phase-2 timers, the dual-audience reads' internal-service (M3/M6) leg, and the DC-1 cross-module cascade/teardown have **no HTTP wire** — in-process services / background workers, consumed within other modules' transactions. Implementation is code / Doc-6. **Flag-and-halt if any wire surface is proposed** (an architecture change). The platform authorization root being out-of-wire is the highest-stakes application of R1.
- **Dependencies:** `Doc-4C §C3/§C6/§C9`, Appendix C (DC-1); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §8 — Conformance & Carried Items
- **Purpose:** Doc-5C's attestation against Doc-5A **Appendix A** (the freeze gate); the carried items register (DC-1…DC-5 + `[ESC-IDN-SLUG]` + `[ESC-IDN-AUDIT]` + `[ESC-IDN-DELEG-EXPIRY]`) by pointer with each named resolution channel; statement that Doc-5C coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4C §C12`, Appendix C. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5C Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M1 surface; the freeze evidence.
- **Dependencies:** `Doc-5A Appendix A`. **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4C Appendix C — resolved only via named channels, never here)

| ID | Item | Doc-5C handling | Freeze gate? |
|---|---|---|---|
| **DC-1** | Identity cross-module cascade with no `identity` event | Cascade/teardown legs **out-of-wire** (§7); no event coined, no integration wired until the Board selects service-call vs Doc-2 §8 event | **No** — out-of-wire; blocks only the cross-module legs |
| **DC-2** | Org verification ownership boundary (Trust owns `verification_records`) | Doc-5C realizes no `verification_record` surface; identity-side trigger integrates with the Trust contract (Doc-4G) by pointer | **No** |
| **DC-3** | Platform-governance Admin slugs | Admin governance binds existing `staff_*` (D-2 CARRY FORWARD); least-privilege identity-admin slug = future Doc-2 §7 patch | **No** |
| **DC-4** | Authentication boundary (Supabase Auth = auth only) | Wire carries `Authorization` bearer only (§3); 2FA *settings* realized, the *mechanism* (login/password/2FA-challenge/session) is infrastructure | **No** |
| **DC-5** | `identity.*` POLICY-key registration | Idempotency/timer/sweep windows referenced by **intended key name** by pointer; registration via Doc-3 §12.2 additive channel; **`[DC-5]`-keyed contracts not finalized until registered** | **Tracked** — per-contract finalization; not a structural gate |
| `[ESC-IDN-SLUG]` | No dedicated buyer-profile / some admin slugs in Doc-2 §7 | Interim Owner/Director authority (buyer profile) / `staff_*` (admin); escalate, never invent | **No** |
| `[ESC-IDN-AUDIT]` | Some audit actions not separately enumerated in Doc-2 §9 | Bound by pointer to the nearest Doc-2 §9 domain action; nothing invented | **No** |
| `[ESC-IDN-DELEG-EXPIRY]` | Doc-2 §5.10 silent on the `suspended`-at-validity-expiry disposition | `reinstate_delegation_grant` (§5, caller-facing) + `expire_delegation_grant` (§7, out-of-wire) carry the marker; the lapsed-window-reinstatement error boundary is **not finalized**; **channel:** Doc-2 §5.10 change management (Doc-4C PassB entry condition 4). No edge invented | **Tracked** — `reinstate_delegation_grant` not finalized until resolved; not a structural gate |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface · resolving DC-1…DC-5 / `[ESC-IDN-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving the §C3 authorization root, System timers, dual-audience internal leg, or DC-1 cascade a wire · the authentication mechanism (DC-4) · coining any endpoint/status/header/error-class/slug/POLICY key.

---

## Review Disposition (Independent Hard Review v0.1 → v0.2)

| Finding | Sev | Disposition |
|---|---|---|
| **M-01** §C8 contracts had no single-section owner; §3 dual-role | MAJOR | **FIXED** — §3 reframed **mechanism-only (owns no endpoint)** + retitled "Cross-Cutting Authorization & Context Wire Model"; **all three §C8 endpoints assigned to §6**; partition table grew a **Doc-5C § column** (every contract → exactly one section). |
| **M-02** count 40 vs authoritative 42 | MAJOR | **FIXED** — verified Doc-4C PassB Appendix A = **42**. The 2 missing were `identity.get_delegation_grant.v1` + `identity.list_delegation_grants.v1` (User party reads, §C9) — added to §5 / partition. Count = 42 throughout (35 caller-facing + 7 out-of-wire). |
| **m-03** `[ESC-IDN-DELEG-EXPIRY]` absent | MINOR | **FIXED** — added to carried-items table; `reinstate_delegation_grant` (§5) noted not-finalized until Doc-2 §5.10 resolves. |
| **m-04** §3 role ambiguous | MINOR | **FIXED** — §3 is now explicitly mechanism-only; endpoint language removed (folded into M-01). |
| **m-05** no Doc-4M pointer for state machines | MINOR | **FIXED** — `Doc-4M` added to §4 + §5 dependencies and Conforms-To. |
| **m-06** `admin_recover_ownership` name unverified | MINOR | **VERIFIED** — Doc-4C PassB Appendix A line 764 = `identity.admin_recover_ownership.v1`. Name correct; no change. |
| **m-07** Doc-5B in Authority field | MINOR | **FIXED** — removed from Authority; moved to an informational **Precedent** row; R1 authority = `Doc-5A §1.3/§5/§11`. |
| **O-01** compressed-lifecycle caveat | OBS | The patch is additive (no new section, no new scope) — reassignment + clarification + count fix. §3 received a **title change**; per O-01 a single optional lightweight re-review of the §3/§C8 reorg is offered before freeze. |
| **O-02** §2 naming-convention pointer | OBS | **APPLIED** — §2 now binds the Doc-4C PassB Appendix A Contract-ID column (not "the Doc-5B convention"). |
| **NP-01** active-org authority-model sentence | OBS | **APPLIED** — added to §3's `Iv-Active-Organization` clause. |

## Structure self-audit (post-review)

| Check | Result |
|---|---|
| Every Doc-4C caller-facing contract assigned to exactly one §3–§6 realization section (partition § column) | ✅ — 35 caller-facing → §4(11)/§5(17)/§6(7) |
| Every internal-service / System / DC-1 contract assigned to §7 out-of-wire | ✅ — 7 |
| Total = 42 (matches Doc-4C PassB Appendix A) | ✅ |
| `check_permission` + §C3 reads classified out-of-wire | ✅ — R1 highest-stakes case |
| §3 mechanism-only; owns no endpoint; §C8 endpoints in §6 | ✅ — M-01 |
| Active-org context realization owned by one section (§3 mechanism) + endpoints in §6 | ✅ |
| Delegation: commands + party reads on wire (§5); §6B check server-side (§3/§7) | ✅ — R5 |
| State machines bound to Doc-4M (authoritative) in §4/§5 | ✅ — m-05 |
| No-event posture (DC-1) carried; §11 N/A; no webhook | ✅ — R6 |
| Carried DC-1…DC-5 + `[ESC-IDN-*]` (incl. DELEG-EXPIRY) registered by pointer; none resolved here | ✅ |
| Nothing coined; `identity` prefix + `identity_` codes bound to registries | ✅ — R3/R4 |

---

*End of Doc-5C Structure Proposal v0.2. Structure only; Hard Review v0.1 applied (2 MAJOR + 5 MINOR resolved; observations applied). On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. Next: optional lightweight re-review of the §3/§C8 reorganization (O-01) → promote to `Doc-5C_Structure_v1.0_FROZEN`; then compressed content passes (Pass-1 = §0–§3 + inventory; Pass-2 = §4–§8 + Appendix A).*
