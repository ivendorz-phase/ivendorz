# iVendorz — Backend Execution Playbook

| Field | Value |
|---|---|
| **Document type** | Living execution playbook · non-authoritative under the frozen corpus |
| **Companion to** | [`backend_build_plan.md`](backend_build_plan.md) (sequence) · [`backend_execution_tracker.md`](backend_execution_tracker.md) (status) |
| **Scope** | Wave 2 (M0 → M1) **execution-ready**; Waves 3–6 patterns are declared, detailed at wave entry |
| **Rule** | Coins nothing. Every route/event/slug/table binds a frozen authority by pointer; the frozen document always wins (Flag-and-Halt on conflict). |

> **The Build Plan says *what order*; this Playbook says *how to build each WP deterministically*.**
> All contract names, routes, RLS policies, event facts, and seed sources below are transcribed
> verbatim from the frozen corpus (Doc-5C, Doc-6C, Doc-2 §8, Doc-4B/4C). Where the corpus is
> silent or gated, it is marked — never filled by invention.

> **Additive amendment — execution-organization sync (2026-07-09).** WPs in this playbook are
> executed by **Team-7 Module Agents** under the **AI Engineering Organization v1.0** (`project-
> management/ai-engineering-organization-plan.md`; ratified per `governanceReviews/
> BOARD-DECISION-AI-ENG-ORG_v1.0.md`): one activation per WP task, briefed by an Activation
> Packet, returning a Completion Report, suspending via a Handoff Note (templates in
> `governanceReviews/`). **Team-6 (Security Review) activates per the ratified runtime policy** on
> any security-surfaced WP (charter: `governanceReviews/TEAM-6-Security-Review-Charter.md`) — note
> that nearly every M1 WP touches authz/org-context/RLS and should be pre-flagged at dispatch.
> Governance is not restated here; the organization plan and Board decision own it.

---

## §1 — Load-bearing corpus facts (Wave 2 — verified, non-negotiable)

These were confirmed against the frozen docs and **override intuition**:

1. **M0 `core` and M1 `identity` emit ZERO §8 domain events.** Doc-2 §8's emitting-module column contains only `rfq`/`marketplace`/`trust`/`operations`/`admin`/`billing`. Every Doc-4C contract states `Events: none (§8)`. **Never invent an identity/core event.** Identity's cross-module effects (membership cascade, notification fan-out, account-verification) have **no emitter** — the open escalation **`[DC-1]`**. If any WP appears to require an identity-originated event → **Flag-and-Halt** (needs an additive architecture patch, human-approved).
2. **Every M1 mutation is audited, with no outbox leg.** Writes call `core.append_audit_record.v1` (Doc-4B) in-transaction; there is no event emission. Reads (`GET`) are not audited.
3. **`check_permission` is app-layer, not a DB function** (Doc-4C §C3; Doc-6C CHK-6-023). The DB owns only the substrate tables + RLS visibility backstop. No SQL `check_permission()`.
4. **Outbox is atomic + at-least-once + idempotent-consumer** (Doc-4B §B6): emit primitive `core.write_outbox_event.v1` inserts one `pending` row **in the caller's transaction** (business write rolls back if the outbox insert fails). Workers `core.phase2_dispatch_outbox_events.v1` (`pending→dispatched`) and `core.phase2_archive_dispatched_events.v1` (`dispatched→archived`). Status transition = dedup guard; retry w/ backoff; dead-letter after max attempts, never silently dropped. **`[D-5]` Outbox Audit Granularity is BOARD-PENDING — the two workers' freeze is gated on it** (relevant to `W2-CORE-2`).
5. **Authoritative §8 catalog = Doc-2 §8** (26 events, 6 producers). Doc-4J is the M8 Admin module contract (governs only `VendorBanned`, the sole admin event); Doc-4L_FROZEN is titled "Permission Authority Matrix." Consumer routing lives in **Doc-2 §8 line 673**. *(OBS: CLAUDE.md §9 labels Doc-4J "authoritative event catalog" / Doc-4L "event-flow map" — a pointer-label nuance to verify with the Board; does not gate Wave 2. Use Doc-2 §8 as the name/consumer source.)*

---

## §2 — Canonical module file-map (frozen nested-DDD shape)

**Bind CLAUDE.md §10 / REPOSITORY_STRUCTURE §3 — do NOT invent sub-layers.** The corrected taxonomy (vs. common but non-frozen names):

```
src/modules/<module>/
├─ contracts/        services.ts · events.ts · types.ts (DTOs + IDs) · index.ts   ← only cross-module surface
├─ domain/           aggregates/ · entities/ · value-objects/ · policies/ · state-machines/
├─ application/      commands/ · queries/ · workflows/                            ← orchestration; owns NO state
├─ infrastructure/   data/ (own-schema Prisma repos) · read-models/ · events/ · search/
├─ api/              route handlers / server actions (HTTP mappers live HERE)
└─ <module>.module.ts
```

| Common (non-frozen) name | ✅ Frozen home |
|---|---|
| `application/handlers/` | HTTP handlers → `api/`; app orchestration → `application/{commands,queries}` |
| `application/dto/` | DTOs/IDs → `contracts/types.ts` |
| `infrastructure/prisma/` or `repositories/` | `infrastructure/data/` (repos as `<aggregate>.repository.ts` — existing convention) |
| `infrastructure/cache/` | **not for M0–M8** — caching is M9-only (Inv #12); do not add a cache layer to identity |
| `<module>/tests/` | tests live in the `tests/` tree per the Doc-8B harness, **not** a module subfolder |

---

## §3 — The deterministic per-WP build ladder

Every WP walks this order (the frozen §3.2 Build Artifact Checklist ordering — **contract-first**, tests-last):

```
1. contracts/     — types.ts (DTOs/IDs) + services.ts signatures (the interface first)
2. domain/        — aggregates · value-objects · policies · state-machines (the invariants)
3. infrastructure/data/ — Prisma repo(s) over the module's OWN schema (+ migration/seed if new table)
4. application/   — commands/queries orchestrating domain + repo (owns no state)
5. infrastructure/events/ — outbox emit ONLY where Doc-2 §8 declares an event (N/A for M1)
6. api/           — route handler mapping result → Doc-5A envelope/§6.2 status
7. app/api/       — thin route entry wiring the handler inside withActiveOrgContext
8. Doc-8 suites   — the WP's required bands (C/D/E/F), authored against frozen oracles
```

**Every write** additionally: (a) runs inside `withActiveOrgContext` (server-set `app.active_org`/`app.user_id` GUCs), (b) appends `core.append_audit_record.v1` **atomically** in the same transaction (the D7 reference pattern), (c) reads POLICY bounds from `core.system_configuration` via `core.config_value_query.v1` — **never literals**.

---

## §4 — M0 `core` WP cards (infra-only shape-exception)

M0 tables/triggers/allocator/audit-writer are realized (Wave 0/1). Wave-2 M0 = the last two chain steps + gates.

### `W2-CORE-1` — Config & feature-flag read services
- **Build order:** `contracts/services.ts` (POLICY read by key; flag read by key/scope) → `infrastructure/data/` readers over `system_configuration` / `feature_flags` → expose on `contracts/index.ts`.
- **Frozen:** Doc-4B (`core.config_value_query.v1`) · Doc-6B §3.4/§3.5. Reads are open per POLICY; flags firewalled.
- **Doc-8:** 8B harness · 8D (schema/immutability unaffected).

### `W2-CORE-2` — Outbox dispatch hardening + Inngest wiring
- **Build order:** confirm `core.write_outbox_event.v1` atomic emit (exists) → `infrastructure/events/` dispatcher wiring to Inngest realizing `core.phase2_dispatch_outbox_events.v1` (`pending→dispatched`) + `core.phase2_archive_dispatched_events.v1` (`dispatched→archived`) → retry/backoff (`core.outbox_dispatch_backoff`, `…_max_attempts`) + dead-letter park (never drop) → reconciliation sweep re-enqueues stuck `pending`.
- **Frozen:** Doc-4B §B6 · Doc-2 §8 outbox rule · `inngest/functions/dispatch-outbox.ts`.
- **⚠ Gate:** **`[D-5]` Outbox Audit Granularity is BOARD-PENDING** — audit binds at dispatch-run/batch granularity (never per-event). Build the dispatch mechanics; the *audit-granularity* leg lands with the D-5 ruling. Flag if a WP tries to per-event-audit.
- **Doc-8:** 8B outbox observer (dispatch + distinct archival) · 8F write-plus-emit atomicity foundation.

### `W2-CORE-3` — M0 conformance gate
- **Doc-8:** 8D CR4′ immutability (5 triggers) + 8B observer green (locally).
- **DoD:** 18 `core.*` POLICY keys seeded (done) · zero `[ESC-*]` (note `[D-5]` on its channel).

---

## §5 — M1 `identity` WP cards

### `W2-IDN-1` — Complete the schema (4 tables + RLS) · Doc-6C §3.5/§3.6/§3.7/§3.9 · §6.2a
**Migration order (Doc-6C §6.2, forward-only, single transaction, FK-valid):** enums (incl. `permission_space`, `rfq_approval_mode`, `delegation_grant_status`) → tables in order `… permissions, roles, role_permissions, organization_workflow_settings, buyer_profiles, memberships, delegation_grants` → partial-unique-live + Band-H indexes → RLS enable + policies → seeds. The only deferred FK is the existing `memberships_role_fk`; the 4 new tables carry inline FKs (parents precede them). `delegation_grants.vendor_profile_id` carries **no FK** (M2 bare UUID).

| Table | RLS policies (Doc-6C §6.2a, verbatim intent) | Indexes | Triggers |
|---|---|---|---|
| `permissions` | `permissions_read` FOR SELECT `USING (true)`; `permissions_staff_write` FOR ALL `USING/WITH CHECK (is_platform_staff)` | `permissions_slug_uq UNIQUE(slug)`; PK`(id)` | none (SD=NO) |
| `role_permissions` | split: `_read` SELECT `(org=active_org OR org IS NULL OR staff)`; `_insert`/`_delete` `(org=active_org OR staff)` — no UPDATE | composite PK `(role_id, permission_id)`; `role_permissions_org_idx(organization_id)` | none |
| `organization_workflow_settings` | `ows_tenant` FOR ALL `(org=active_org OR staff)` | `ows_org_live_uq(organization_id) WHERE deleted_at IS NULL`; PK`(id)` | none |
| `delegation_grants` | dual-party: `_party_read` SELECT `(active_org IN (controlling_organization_id, representative_organization_id) OR staff)`; `_controlling_insert/_update/_delete` `(active_org=controlling_organization_id OR staff)` (split, not FOR ALL) | 3 partial (`WHERE deleted_at IS NULL`): `_controlling_idx`, `_representative_idx`, `_expiry_idx(status, valid_to)`; PK`(id)` | none; one CHECK `delegation_grants_validity_chk (valid_to IS NULL OR valid_to > valid_from)` |

**No CR4′ immutability trigger on any of the 4** (identity versions/hard-deletes nothing; CHK-6-031/032 = N/A).
- **Doc-8:** 8D schema-constraint + org-anchor RLS (positive / negative / cross-tenant).

### `W2-IDN-2` — Role/permission catalog seed (43 slugs + 4 bundles) · Doc-6C §5 (as patched v1.0.1)
- **Content source = Doc-2 §7 (by pointer; Doc-6C coins nothing).** **43 slugs = 36 tenant** (`space='tenant'`) **+ 7 staff** (`space='staff'`) — count corrected 45→43 per `Doc-6C_Patch_v1.0.1` (owner-ruled `ESC-IDN-SLUGCOUNT` Option A, 2026-07-09; Doc-2 §7's enumeration is and was the truth); idempotent `ON CONFLICT (slug) DO UPDATE`.
- **4 system bundles (verbatim):** `Owner`, `Director`, `Manager`, `Officer` (`organization_id=NULL`, `is_system_bundle=true`); `ON CONFLICT (name) WHERE deleted_at IS NULL AND organization_id IS NULL DO NOTHING`.
- **`role_permissions` mapping** = Doc-2 §7 bundle defaults (O/D/M/F columns); **Inv #2 guard — `staff_*` slugs never assigned to org bundles.** Separate idempotent data migration.
- **Doc-8:** 8E Invariant #2 (two role dimensions).

### `W2-IDN-3` — `check_permission` + active-org resolution (app-layer, out-of-wire) · Doc-4C §C3 · Doc-5C §7.1
- **Build order:** `application/queries` for the 4 auth-root internal reads (`get_user` · `get_organization` · `get_membership` · `check_permission`) over the substrate → `domain/policies` for the three-layer resolution (**active Membership + Permission Slug + Resource Scope**) OR the §6B five-condition delegated-access check → **wire `src/server/authz/index.ts`** to `check_permission` (no re-derivation, no shadow authz).
- **Silence:** these 4 are **out-of-wire — no HTTP method/path** (Doc-5C §7.1); proposing a wire = architecture change (§7.5).
- **Doc-8:** 8E Invariant #5 (users act, orgs own) + 8D RLS-as-backstop (app-bypassed negative path).

### `W2-IDN-4` — Delegation grants (dual-party) · Doc-6C §3.9/§5.10 · Doc-5C §C9
- **State machine `delegation_grant_status` (5):** `draft → active`; `active ⇄ suspended`; `→ revoked`; `→ expired` (Doc-2 §5.10 owner).
- **Guards (service-layer):** dual-party authority (controlling org writes); `permission_set_jsonb ⊆ existing` and **never ownership-class** (Inv #2); RLS write policy = row backstop.
- **Refresh-on-revocation:** on `→ revoked/expired`, derived M3 `rfq_invitation_grantees` + visibility rows are removed **via service/event — never a cross-schema write from identity**.
- **System timer (out-of-wire):** `identity.expire_delegation_grant.v1` — background worker, `active → expired` edge only (`suspended`-at-expiry carries `[ESC-IDN-DELEG-EXPIRY]`).
- **POLICY (from `core.system_configuration`):** `identity.delegation_validity_default` · `identity.delegation_expiry_sweep_cadence` · `identity.command_dedup_window`.
- **Events:** **none** (§8) — audited only. **Do not emit.**
- **Doc-8:** 8E delegation as 2nd authz path · 8D dual-party RLS.

### `W2-IDN-5` — State machines (org · membership · delegation) · Doc-4M · Doc-2 §5.1/§5.2/§5.10
- **Value sets (enum + CHECK at DB; transition matrix service-layer, DR-6-STATE):** org `active|suspended|soft_deleted`; membership `invited|pending|active|suspended|removed`; delegation `draft|active|suspended|revoked|expired`. (Plus simple `users` lifecycle.)
- **Service-layer guards:** Last-Owner Protection, ownership succession, dual-party authority, "only `active` participates." **Re-read Doc-4M/Doc-2 verbatim — never a paraphrased machine.**
- **System timers (out-of-wire):** `activate_membership` · `expire_invitation` (POLICY-keyed window).
- **Doc-8:** 8E Doc-4M edge coverage (`CHK-8-040…042`).

### `W2-IDN-6` — Doc-5C wired management API (35 caller-facing, split into 8 sub-domain PRs)
Method conventions (frozen): create→`POST` collection (`201`+`Location`); field update→`PATCH` item; ADR-012 soft-delete→`DELETE` item; state/domain command→`POST` named sub-resource; read→`GET`; **never `PUT`**. All commands audited via `core.append_audit_record.v1`; all `Events: none`.

| Sub-WP | §C | Contracts (verbatim id · route · C/Q) | Notes |
|---|---|---|---|
| **6.1 User/Account** | §4 | `update_user_profile.v1` PATCH·C · `update_user_2fa_settings.v1` POST·C · `deactivate_own_account.v1` POST·C · `set_user_account_status.v1` POST·C | self + Admin-state; no active-org |
| **6.2 Organization** | §4 | `create_organization.v1` POST·C · `update_organization_profile.v1` PATCH·C · `transfer_ownership.v1` POST·C · `soft_delete_organization.v1` DELETE·C · `restore_organization.v1` POST·C · `set_organization_status.v1` POST·C · `admin_recover_ownership.v1` POST·C | DC-1 cascade out-of-wire (§7.4) |
| **6.3 Membership** | §5 | `invite_member.v1` POST·C · `accept_invitation.v1` POST·C · `set_membership_status.v1` POST·C · `remove_member.v1` POST·C · `revoke_invitation.v1` POST·C | active-org |
| **6.4 Role & Permission** | §5 | `list_permissions.v1` GET·Q · `list_roles.v1` GET·Q · `create_role.v1` POST·C · `update_role.v1` PATCH·C · `set_role_permissions.v1` POST·C · `delete_role.v1` DELETE·C | 17 dual-actor read |
| **6.5 Delegation wire** | §5 | `create_delegation_grant.v1` POST·C · `suspend_delegation_grant.v1` POST·C · **`reinstate_delegation_grant.v1` POST·C ⚠`[ESC-IDN-DELEG-EXPIRY]`** · `revoke_delegation_grant.v1` POST·C · `get_delegation_grant.v1` GET·Q · `list_delegation_grants.v1` GET·Q | #25 NOT FINALIZED until Doc-2 §5.10 resolves — ship the rest, gate #25 |
| **6.6 Context/Active-Org** | §6 | `switch_active_organization.v1` POST·C · `get_active_context.v1` GET·Q · `list_my_organizations.v1` GET·Q | switcher re-resolves org (7C seam) |
| **6.7 Buyer-Profile** | §6 | `upsert_buyer_profile.v1` PATCH·C ✅ · `get_buyer_profile.v1` GET·Q ✅ | **already delivered** (D7 + Wave 1); verify under full M1 gate |
| **6.8 Workflow-Settings** | §6 | `update_workflow_settings.v1` PATCH·C · `get_workflow_settings.v1` GET·Q | POLICY bounds via `core.config_value_query.v1`; writes no governance signal |
- **Doc-8:** 8C contract/API per sub-WP (envelope · pagination · error class+status · idempotency · prohibited fields · actor-scope; wired-only, completeness ≡ frozen surface).

### `W2-IDN-7` — POLICY seed + M1 conformance gate
- Seed **7 `identity.*` POLICY keys** (Doc-3 v1.9): incl. `identity.command_dedup_window`, `identity.delegation_validity_default`, `identity.delegation_expiry_sweep_cadence`.
- **M1 module DoD:** Build Artifact Checklist · 18 `core.*` + 7 `identity.*` keys seeded · **8C + 8D + 8E** green · zero `[ESC-*]` (carried ESCs on channels).

---

## §6 — CQRS command/query index (derived from Doc-5C — coins nothing)

- **Wire Commands (22, all audited):** `update_user_profile` · `update_user_2fa_settings` · `deactivate_own_account` · `set_user_account_status` · `create_organization` · `update_organization_profile` · `transfer_ownership` · `soft_delete_organization` · `restore_organization` · `set_organization_status` · `admin_recover_ownership` · `invite_member` · `accept_invitation` · `set_membership_status` · `remove_member` · `revoke_invitation` · `create_role` · `update_role` · `set_role_permissions` · `delete_role` · `create_delegation_grant` · `suspend_delegation_grant` · `reinstate_delegation_grant` · `revoke_delegation_grant` · `switch_active_organization` · `update_workflow_settings` · `upsert_buyer_profile` *(≈27 command rows; buyer-profile done)*.
- **Wire Queries (reads, GET):** `list_permissions` · `list_roles` · `get_delegation_grant` · `list_delegation_grants` · `get_active_context` · `list_my_organizations` · `get_buyer_profile` ✅ · `get_workflow_settings`.
- **Out-of-wire auth-root reads (§7.1):** `get_user` · `get_organization` · `get_membership` · `check_permission`.
- **Out-of-wire System timers (§7.2):** `activate_membership` · `expire_invitation` · `expire_delegation_grant`.

*(35 caller-facing + 7 out-of-wire = 42 Doc-4C contracts.)*

---

## §7 — Event matrix

**Wave 2 (M0 + M1): the matrix is EMPTY — both modules emit zero §8 events** (§1.1). The matrix below is the **downstream reference** (Doc-2 §8 authoritative catalog, 26 events / 6 producers); it activates at Wave 3+. **Anti-invention guard:** only these 26 names legally exist; anything attributed to `core`/`identity` is invented → reject (or route through open `[DC-1]`).

| Producer | Events (verbatim) | Primary consumers (Doc-2 §8) |
|---|---|---|
| `rfq` | `RFQCreated` `RFQSubmitted` `RFQApproved` `RFQClosedWon` `RFQClosedLost` `RFQMatched` `RFQRouted` `VendorInvited` `QuotationSubmitted` `QuotationWithdrawn` `QuotationSelected` | moderation/matching, invitation creation, Communication dispatch + `vendor_leads`, engagement creation, performance inputs, comparison refresh |
| `marketplace` | `VendorClaimed` `VendorSuspended` `VendorTierChanged`(declared) `ProfileThemeChanged` `ProfileLayoutChanged` `ProfilePublished` `ProfileUnpublished` `MicrositePublished` `MicrositeDomainChanged` `VendorOwnershipTransferred` | directory/presentation, matching refresh |
| `trust` | `VendorTierChanged`(verified) `VendorVerified` `TrustScoreUpdated` `PerformanceScoreUpdated` `PerformanceReviewTriggered` `PerformanceFrozen` | `vendor_matching_attributes` rebuild, directory re-ranking (M2 writes `financial_tier_history`, not Trust) |
| `operations` | `DeliveryRecorded` `WorkCompletionIssued` `EngagementCompleted` `DisputeRecorded` `BuyerFeedbackRecorded` | Trust performance inputs, Communication |
| `admin` | `VendorBanned` (sole admin event; Doc-4J BC-ADM-2) | Marketplace reflect, Communication notify, Trust Protection freeze |
| `billing` | `SubscriptionPurchased` `SubscriptionRenewed` `SubscriptionExpired` | entitlement cache refresh |

**Note:** `VendorTierChanged` = one name, two producers (marketplace `declared` / trust `verified`) distinguished by payload `tier_type`.

---

## §8 — API mapping pattern (per wired write)

```
POST /identity/<collection>[/{id}/<command>]        (app/api thin entry)
  → api/<contract>.handler.ts        map request → input DTO (contracts/types.ts)
  → withActiveOrgContext(...)         server-set app.active_org / app.user_id GUCs
  → contracts/services.<contract>     facade → application/commands/<contract>.command.ts
  → domain/                           invariant + state-machine guard
  → infrastructure/data/<agg>.repository  own-schema write (RLS-scoped)
  → core.append_audit_record.v1       ATOMIC audit append (same tx)   ← every write
  → [ outbox: NONE for M1 — no §8 event ]
  → api mapper → Doc-5A envelope + §6.2 status
```
Reads: `GET … → api/<contract>.handler → application/queries/<contract>.query → infrastructure/data (RLS-scoped) → envelope`. Cross-tenant/absent → `found:false` / `404` collapse (non-disclosure).

---

## §9 — Test mapping (onto the frozen Doc-8 bands — not a parallel taxonomy)

The frozen conformance fabric already partitions testing; map coverage **onto** it (never fork it):

| Desired coverage | Frozen Doc-8 band |
|---|---|
| Contract/API (envelope, pagination, error, idempotency, actor-scope, prohibited fields) | **8C** (bands A+B) |
| Schema constraints · immutability (CR4′) · migration · **RLS positive/negative/cross-tenant/byte-equivalence** · cross-module integrity | **8D** (bands A+C; `CHK-8-024` mandatory) |
| Domain invariants · firewall · state-machine edges (Doc-4M) | **8E** (bands A+D+E) |
| Cross-module boundary · write-plus-emit atomicity · event fan-out · consumer locality | **8F** (band F) |
| Component · a11y · visual · e2e journeys · UI non-disclosure | **8G** (band G) |
| Harness (runner, ephemeral tx DB, fixtures, seeded clock, outbox observer) | **8B** (bands H+I) |

**Not in the corpus (do not add as gates):** performance benchmarks and mutation testing are **not** Doc-8 bands A–I; perf budgets are Doc-8-owned (never invent one). Raise via `[ESC-8-*]` if genuinely needed — never coin locally.

---

## §10 — Definition of Complete (per WP — extends the frozen DoD, coins nothing)

Frozen DoD (Build Plan §6) **plus** engineering hygiene:
- ✅ Required Doc-8 bands green (locally, until CI unparks) · CI/boundary-lint/migration-check green.
- ✅ Zero unresolved `[ESC-*]` (carried ESCs on named channels) · zero `TODO`/`FIXME`/`console.log`/dead code in the merged path.
- ✅ Migrations apply clean forward-only · Prisma client regenerated (never hand-edited) · `generated-contracts-registry/` regenerated.
- ✅ Build Artifact Checklist (§3.2) complete · pre-PR checklist (`IMPLEMENTATION_START_HERE.md`) satisfied · README updated.
- ❌ **Not gates here:** coverage-% threshold (Doc-8 model is "completeness ≡ frozen surface", not %); OpenAPI regen (this stack uses a typed server-side client + `generated-contracts-registry`, no OpenAPI).

---

## §11 — Open corpus items gating / shadowing Wave 2

| Handle | What | Effect on Wave 2 |
|---|---|---|
| **`[DC-1]`** | Identity has cross-module effects (membership cascade, notification fan-out, account-verification) with **no §8 emitter** | **Do not build any identity-originated event.** Flag-and-Halt if a WP needs one. |
| **`[D-5]`** | Outbox Audit Granularity — BOARD-PENDING; freezes the two dispatch/archive workers | Build dispatch mechanics (`W2-CORE-2`); audit-granularity leg lands with the ruling. |
| **`[ESC-IDN-DELEG-EXPIRY]`** | `reinstate_delegation_grant` / `expire_delegation_grant` error boundary not finalized (Doc-2 §5.10) | Ship delegation; **gate contract #25** (IDN-6.5). |
| **`[ESC-IDN-AUDIT]`** | Some audit actions bound by pointer to nearest Doc-2 §9 action | Bind by pointer; never invent an audit action. |
| **`[ESC-IDN-SLUG]`** | Buyer-profile / some admin slugs — interim authority | Carry on channel; don't coin. |

---

## Sources (pointers, never restated)
- Doc-5C series (M1 API — 35 caller-facing + 7 out-of-wire; routes, conventions, ESC markers)
- Doc-6C series (M1 schema — §3.5/3.6/3.7/3.9 tables, §5 seed, §6.2/6.2a migration+RLS)
- Doc-2 §8 (authoritative event catalog + consumer routing) · Doc-2 §7 (permission/role seed source) · Doc-2 §5.1/5.2/5.10 (state machines)
- Doc-4B §B6 (outbox mechanics, `[D-5]`) · Doc-4C §C3 (`check_permission`, R6 no-event) · Doc-4M (state authority) · Doc-4J (Admin `VendorBanned`)
- Doc-8A…8G (test bands) · Doc-3 v1.9 (identity POLICY keys) · `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`
</content>
