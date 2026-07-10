# M1 — Identity & Organization (`identity`)

**Owner:** Module 1. **Schema:** `identity` (Prisma multiSchema). **Authoritative spec:** Doc-4C
(contracts) · Doc-5C (API realization) · Doc-6C (schema realization) · Doc-2 §5/§7/§10.2 (domain
model, permission mapping, tables) · Doc-4M (state machines). This README is a non-authoritative
map — on any conflict the frozen corpus wins. **Reference-never-restate:** names/counts below are
pointers, not re-coined truth.

## Purpose

Users, organizations, memberships, roles, permissions, delegation, active-org context, and buyer
profiles. Realizes the two load-bearing invariants: **Users act; Organizations own** (Invariant #5 —
server-validated active-org context; client org id never trusted) and **two role dimensions**
(Invariant #2 — Platform Participation ≠ Org Role; the `staff_*` slug space is never an org bundle).

## Layer map (canonical DDD — `REPOSITORY_STRUCTURE.md`)

- `contracts/` — the ONLY cross-module surface (`services` · `types` · `events` · `index`). Also the
  test/server access boundary (eslint `boundaries`).
- `domain/` — owns truth: `policies/` · `state-machines/` (org · membership · user · delegation-grant,
  Doc-4M) · `read-models/` · `value-objects/` (incl. `policy-duration.ts` — the unified POLICY-duration
  interpreter) · `audit-actions.ts`.
- `application/` — `commands/` · `queries/` (orchestration; owns no state).
- `infrastructure/data/` — own-schema repositories (RLS-scoped) incl. the `command_dedup` replay store.
- `api/` — buyer-profile handlers (the wired route handlers live in `src/server/identity/`).

## Governance posture

- **Events:** ZERO §8 events (`[DC-1]`) — M1 emits none (Wave 2 truth; Doc-2 §8 / playbook §7).
- **Governance signals:** M1 reads/writes NONE (firewall default; Inv #6). Workflow-settings writes
  are signal-free (RV-0159, nested-jsonb-smuggle proven inert).
- **Audited writes:** every mutation follows the D7 canonical audited-write pattern (audit atomic with
  the write, same tx); audit actions bound by pointer to Doc-2 §9 (zero invented).
- **POLICY:** idempotency/timer/validity windows read via `core.config_value_query.v1` — never a
  literal. The 7 `identity.*` keys are registered in Doc-3 v1.9 and seeded into `core.system_configuration`.

## Definition-of-Done status — W2-IDN-7 M1 conformance gate

| DoD item | Status |
|---|---|
| 35 caller-facing + 7 out-of-wire = 42 Doc-4C contracts wired + reviewed | MET (6.1–6.8; 6.7 Wave-1) |
| Permission catalog: **45 slugs = 36 tenant + 9 staff** (Doc-2 §7 + v1.0.8) seeded | MET |
| 18 `core.*` + **7 `identity.*`** POLICY keys seeded | MET |
| `durationToMs`/window canonicalization (behavior-preserving) | MET (parser unified; window-clock preserved — see below) |
| Doc-8 **8C + 8D + 8E** conformance green | MET (locally) |
| Build Artifact Checklist · tsc/ESLint/Prettier green | MET |
| Zero unresolved `[ESC-*]` on named channels | see open items below |

## Open / carried items (owner/Board-gated — surfaced, not decided here)

- `ESC-WIRE-FIELD-CASING` (🟥) — the wired envelope `result` camelCase house shape; gates the 6.5
  close (RV-0153 F1). Do not re-case locally.
- Realize-vs-defer ruling on the §C11 deferred pair (`default_routing_mode` / `buyer_courtesy_options`)
  + `ESC-IDN-ORG-PROFILE-FIELDS` (RV-0159 F1) — Board rules columns-vs-formal-defer at this gate.
- Workflow-settings first-row provisioning locus (RV-0159 OBS-1).
- Delegation expiry-sweep cadence → the `identity.delegation_expiry_sweep_cadence` POLICY (RV-0149
  OBS-7) — now seeded; the in-function cadence binding is a follow-up (behavior change, out of IDN-7 scope).
- Non-gating Board ESC queue: `2FA-RECOVERY` · `PREF-KEYS` · `LIST-PAGESIZE` · `INVITE-ACCOUNT` ·
  `CTX-SUSPENDED-DOWNSTREAM` (fail-closed interims).
- `[ESC-IDN-AUDIT]` — delegation serialization-token pinning (near-pointer interim).

## Note on the window-clock (RV-0153 OBS-Δ3)

The `command_dedup` replay window is evaluated on the injectable JS clock in the non-atomic FIND path
and on SQL `now()` in the atomic CLAIM upsert-guard. This split is intrinsic (a read vs an atomic
in-DB guard) and fail-closed; unifying the clock source would change observable behavior, so W2-IDN-7
preserved both paths and unified only the duplicated duration PARSER. The clock-source unification is
carried as a behavior-change item requiring its own authorization.
