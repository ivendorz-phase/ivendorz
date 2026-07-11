# iVendorz — Backend Build Plan

| Field | Value |
|---|---|
| **Document type** | Living execution plan · non-authoritative under the frozen corpus |
| **Date** | 2026-07-08 |
| **Owner** | Engineering (backend) |
| **Conforms to** | `Build_Roadmap_v1.0` → `Development_Decomposition_v1.0` → Doc-2/3, Doc-4A…4M, Doc-5A…5K, Doc-6A…6K, Doc-8A…8G (all FROZEN) |
| **Conflict rule** | **Flag-and-Halt** — cite both sources, escalate for a human-approved additive patch; never resolve locally (CLAUDE.md §11). The frozen document always wins. |
| **Coins** | Nothing. WP IDs (`W2-CORE-1`…) are organizing labels over the ordered steps the Decomposition already fixed. |
| **Companion docs** | This is the **sequence** layer. Per-WP build order, canonical module file-map, CQRS command/query list, **event matrix**, API-execution mapping, Doc-8 test mapping, and Expected-Deliverables file-maps live in [`backend_execution_playbook.md`](backend_execution_playbook.md) (§2–§9); live per-WP status (owner · Review-A/B · PR · suites · ESC) in [`backend_execution_tracker.md`](backend_execution_tracker.md). Read all three together. |

> This plan **sequences realization only**. It decides no architecture, API, schema, event,
> POLICY, state, route, or contract — each traces by pointer to the frozen corpus. Waves use
> `Build_Roadmap_v1.0` numbering (Wave 2 = M0 → M1). The Development Decomposition numbers the
> same graph differently (its Wave 1 = M0 → M1); the graph is identical, re-bucketed
> (`Build_Roadmap` §4 reconciliation).

---

## 1. Governing constraints (every WP, non-negotiable)

- **Realize-never-redecide.** Code conforms to Doc-5 (API/HTTP), Doc-6 (schema/RLS/migration), Doc-8 (tests). No invention; gaps → `[ESC-*]` + Flag-and-Halt.
- **One module, one owner.** Cross-module only through `contracts/`. No cross-schema access, no cross-module FK, no cross-module import beyond `contracts/`.
- **Users act; Organizations own.** Server-validated active-org context; client-supplied org ID never trusted.
- **Authorization in the app layer**, resolved by M1 `check_permission` (out-of-wire). RLS is the defense-in-depth backstop, not the model. No shadow authz.
- **Audited, atomic writes.** Every business write + its audit append + its `§8` outbox event commit in **one transaction** — the D7 reference pattern (`governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`). Never invent a new audited-write shape; never invent an audit action.
- **Forward-only migrations** (expand-contract, Doc-6A §11). No down-migrations; a bad schema is undone by a compensating forward migration.
- **Gate:** a WP/wave closes at `BLOCKER = MAJOR = MINOR = 0` with its required Doc-8 bands green (CLAUDE.md §13).

---

## 2. Where we are (verified against code, 2026-07-08)

- **Wave 0 — Bootstrap:** ✅ delivered to `main` (`wave0-complete`, `b1c70fd`). 10 Prisma schemas migrate clean; harness + CI merge-gate active.
- **Wave 1 — Walking Skeleton:** ✅ delivered (`wave1-complete`, `3345b00`). Real slice: login → atomic lazy-provision → server-resolved active-org RLS → wired `get_buyer_profile.v1` → Doc-7E screen → integration test; `CHK-8-024` proven. Extended by the **D7 audited buyer-profile write** (`upsert_buyer_profile`) — the canonical audited-write reference; suite 58/58 green on real Postgres.
- **Wave 2 branch:** `wave/2-core-platform` cut from `main`.

**Realized backend surface:**

| Module | Realized | Remaining for full Wave-2 build |
|---|---|---|
| **M0 `core`** | 5 tables (`audit_records` CR4′, `outbox_events`, `id_sequences` + `allocate_human_ref`, `system_configuration`, `feature_flags`); 5 immutability triggers; 18 `core.*` POLICY keys; services: audit-writer, human-ref allocator, outbox drainer | Config/flag **read services on `contracts/`**; out-of-wire boundary formalization; M0 Doc-8 bands executing |
| **M1 `identity`** | **5 of 9 tables** (`users`, `organizations`, `roles`, `memberships`, `buyer_profiles`) + org-anchor RLS on those 5 + system-bundle role seed; verticals: `provisionIdentity`, `getBuyerProfile`, `upsertBuyerProfile` | **4 tables** (`permissions`, `role_permissions`, `organization_workflow_settings`, `delegation_grants`); 43-slug/4-bundle seed (per `Doc-6C_Patch_v1.0.1`); `check_permission`; delegation; 3 state machines; the Doc-5C management surface; 7 `identity.*` POLICY keys |
| **App layer** | `src/server/context` active-org guard live | `src/server/authz` seam (empty by design) wired to `check_permission` |

**Net:** M0 is complete at the infra/schema level; the Wave-2 work is contract exposure + tests. M1 is ~55% — the read/write spine exists, but the **authorization core, delegation, org/membership management, and 4 tables are unbuilt**. Wave 2 is the universal unblock: every downstream module needs M0 infra + M1 `check_permission`/org-context.

---

## 3. Wave sequence (backend spine)

```
W2  M0 → M1                (serial)        ← CURRENT
W3  M2 · M5 · M6 · M7      (parallel independent domains)
W4  M3 RFQ                 (the moat)
W5  M4 · M8                (post-award + admin, parallel)
W6  M9 AI                  (advisory)
```

**Critical path (Decomposition §8):** `M0 → M1 → M2/M5 → M3 → M4`. **Frozen dependency graph** (Decomposition §7.1): M0 → all; M1 → all; M2 → M3/M7/M9; M3 → M4/M6/M7; M4 → M5/M6; M5 → M2/M3/M7 (async, idempotent consumers); M7 → M3 (quota service); M8 → M2/M3/M5 (`VendorBanned` + decision authority); M6 emits nothing; M9 reads all, emits nothing.

**CI note (owner decision, 2026-07-08):** WP-1.9 infra (Supabase project + Vercel + push `main` to origin + branch-protection/required checks) remains **parked by the Board**. Wave 2 proceeds with **Doc-8 suites run locally** against an ephemeral transactional test DB (as Wave 1 shipped); CI merge-gate *enforcement* is wired when infra is unparked. Suites are still the gate — locally-green is required to close a WP.

---

## 4. Wave 2 — Core Platform (M0 → M1, serial) — DETAILED

Per-WP fields follow the Decomposition §3.1 template (Objective · Frozen authority · Inputs · Outputs · Dependencies · Files · Acceptance gate · Required Doc-8 · Done · Build owner). Each module delivers the §3.2 **Build Artifact Checklist** (schema · migrations+seed · `contracts/` · `domain/` · `application/` · `infrastructure/` · `api/` · Doc-8 suites · README) subject to its shape-exception.

### Stage A — M0 `core` completion (canonical chain: schema+CR4′ → human-ref → outbox → audit → **config/flag services** → **out-of-wire boundary**)

Steps 1–4 are realized (Wave 0/1). Wave-2 M0 = steps 5–6 + gates. **Shape-exception: infra-only, no business `domain/`.**

#### `W2-CORE-1` — Config & feature-flag read services
- **Objective:** expose `system_configuration` (POLICY) reads + `feature_flags` reads on M0 `contracts/` so every module reads POLICY/flags via M0, never its own schema.
- **Frozen authority:** Doc-4B · Doc-5B (out-of-wire boundary R1 precedent) · Doc-6B §3.4/§3.5.
- **Inputs:** existing `core` tables + POLICY seed (18 keys).
- **Outputs:** `core.contracts` service types + callables (POLICY read by key; flag read by key/scope).
- **Files:** `src/modules/core/contracts/services.ts`, `src/modules/core/infrastructure/data/*`.
- **Acceptance / Doc-8:** **8D** (schema/immutability unaffected) + **8B** harness.
- **Done:** Build Artifact Checklist (infra-only) · zero `[ESC-*]`.

#### `W2-CORE-2` — Outbox dispatch hardening + Inngest wiring
- **Objective:** harden `pending → dispatched → archived` dispatch and wire it to Inngest as the real event pump feeding downstream consumers.
- **Frozen authority:** Doc-4B §B6 (outbox mechanics: `write_outbox_event`/`phase2_dispatch`/`phase2_archive`) · Doc-2 §8 (outbox rule + authoritative event catalog; Doc-4J = Admin `VendorBanned` leg only).
- **Files:** `src/modules/core/infrastructure/events/*`, `inngest/functions/dispatch-outbox.ts`.
- **Acceptance / Doc-8:** **8B** outbox observer (dispatch + distinct archival) · **8F** write-plus-emit atomicity foundation.
- **⚠ Gate:** `[D-5]` Outbox Audit Granularity is **Board-pending** — the two workers' freeze is gated on it; build dispatch mechanics, audit-granularity leg lands with the ruling.
- **Done:** observer green · `[D-5]` on its channel.

#### `W2-CORE-3` — M0 conformance gate
- **Objective:** M0 Doc-8 bands green locally.
- **Doc-8:** **8D** CR4′ immutability (5 triggers) + **8B** outbox observer.
- **Done (M0 module DoD, `Build_Roadmap` Wave 2):** 18 `core.*` POLICY keys seeded (done) · 8D + 8B green · zero `[ESC-*]`.

### Stage B — M1 `identity` full build (canonical chain: schema+RLS → seed → `check_permission`+active-org → delegation → state machines → wired API)

This is the bulk of Wave 2. Ordered by the Decomposition's M1 chain.

#### `W2-IDN-1` — Complete the schema (4 remaining tables + RLS)
- **Objective:** realize `permissions`, `role_permissions`, `organization_workflow_settings`, `delegation_grants` with org-anchor RLS (all 9 identity tables now explicit).
- **Frozen authority:** Doc-6C §3/§6 · Doc-2 §10.2.
- **Inputs:** existing `identity_init` (5-table subset).
- **Outputs:** forward-only migration extending `identity`; Prisma models; per-class RLS; FK-valid order.
- **Files:** `prisma/schema.prisma`, `prisma/migrations/<ts>_identity_authz/…`.
- **Acceptance / Doc-8:** **8D** schema-constraint + org-anchor RLS (positive/negative/cross-tenant).
- **Done:** migration applies clean forward-only · RLS green.

#### `W2-IDN-2` — Role/permission catalog seed (43 slugs + 4 bundles; count per `Doc-6C_Patch_v1.0.1`)
- **Objective:** seed the 43 permission slugs (36 tenant + 7 staff — `ESC-IDN-SLUGCOUNT` Option A ruling) + 4 system-bundle roles (`role_permissions` mapping).
- **Frozen authority:** Doc-6C §5.2 · Doc-2 §7. **Bind slugs by pointer — never coin or rename a slug.**
- **Outputs:** idempotent seed (re-runnable); System-actor authored.
- **Acceptance / Doc-8:** **8E** Invariant #2 (two role dimensions: Platform Participation ≠ Org Role).
- **Done:** seed idempotent · slug set ≡ Doc-2 §7.

#### `W2-IDN-3` — `check_permission` + active-org resolution
- **Objective:** the three-layer authorization resolution — active **Membership** + **Permission Slug** + **Resource Scope**, OR an active **Delegation Grant**; out-of-wire (no public HTTP surface).
- **Frozen authority:** Doc-4C §C3 · Doc-5C §3.5/§7.5.
- **Inputs:** `W2-IDN-1`/`-2`; `src/server/context` active-org GUC.
- **Outputs:** `identity.check_permission` on `contracts/` (out-of-wire) + `application/` resolution + `domain/policies`.
- **Files:** `src/modules/identity/{contracts,application,domain}/…`, then **wire** `src/server/authz/index.ts` to it (no re-derivation).
- **Acceptance / Doc-8:** **8E** Invariant #5 (users act, orgs own) + **8D** RLS-as-backstop (app-bypassed negative path).
- **Done:** app-layer authz seam bound; zero shadow authz; `ESC-W1-CONTEXT-RESOLVE`/`ESC-W1-AUTH-401` resolved or channeled.

#### `W2-IDN-4` — Delegation grants (dual-party)
- **Objective:** grant/revoke dual-party delegation (5-state `delegation_grant_status`: draft→active, active⇄suspended, →revoked/→expired), with refresh-on-revocation so `check_permission` reflects it immediately.
- **Frozen authority:** Doc-4C §C9 · Doc-2 §5.10 · Doc-6C §3.9/§5.10 `delegation_grants`.
- **Outputs:** delegation commands + **audited writes only — NO §8 event** (identity emits none, R6; cross-module effect is open `[DC-1]`); refresh-on-revocation of M3 grantee/visibility rows **via service/event, never cross-schema write**.
- **Acceptance / Doc-8:** **8E** delegation as second authz path · **8D** dual-party grant RLS.
- **Done:** grant→resolve→revoke cycle green; carried `ESC-IDN-DELEG-EXPIRY` (reinstate UI) noted (FE-side, non-blocking here).

#### `W2-IDN-5` — State machines (org · membership · delegation)
- **Objective:** realize the 3 M1 state machines (organization §5.1, membership §5.2, and the third per Doc-6C) with legal-transition enforcement.
- **Frozen authority:** Doc-4M (state machines) · Doc-2 §5.1/§5.2. **Re-read Doc-4M/Doc-2 verbatim — never trust a paraphrased machine.**
- **Outputs:** `domain/state-machines/*`; transition guards; audited transitions.
- **Acceptance / Doc-8:** **8E** Doc-4M edge coverage (`CHK-8-040…042`).
- **Done:** every legal edge covered; illegal edges rejected.

#### `W2-IDN-6` — Doc-5C wired management API
- **Objective:** realize M1's caller-facing HTTP surface (Doc-5C, 42 contracts) — org create/suspend/reinstate, membership invite/accept/remove, role management, buyer-profile (read/write already done), delegation admin.
- **Frozen authority:** Doc-5C §C4–§C11 · Doc-5A envelope/pagination/error/idempotency.
- **Outputs:** `api/` route handlers + `contracts/` facades; wired to `app/api/` thin entries; each audited+atomic where it writes.
- **Acceptance / Doc-8:** **8C** contract/API (envelope, pagination, error class+status, idempotency, prohibited fields, actor-scope; wired-only, completeness ≡ frozen surface).
- **Done:** M1 surface ≡ Doc-5C caller-facing set; 8C green.

#### `W2-IDN-7` — POLICY seed + M1 conformance gate
- **Objective:** seed 7 `identity.*` POLICY keys; roll up the M1 gate.
- **Frozen authority:** Doc-3 v1.9 (ratified).
- **Done (M1 module DoD, `Build_Roadmap` Wave 2):** Build Artifact Checklist complete · 18 `core.*` + 7 `identity.*` POLICY keys seeded · **8C + 8D + 8E** green · zero `[ESC-*]`.

### Wave 2 exit gate
All WPs through their full lifecycle · Wave Integration Audit GREEN · `BLOCKER=MAJOR=MINOR=0` · one PR `wave/2-core-platform → main`. **Milestone reached:** *Core Platform gated* (`Build_Roadmap` §9 milestone 3).

**Carried non-blocking ESCs to resolve or channel in Wave 2:** `ESC-W1-USER-PROVISION` · `ESC-W1-CONTEXT-RESOLVE` · `ESC-W1-AUTH-401` · `ESC-IDN-BUYERPROFILE-CODE` · `ESC-IDN-DELEG-EXPIRY`.

---

## 5. Waves 3–6 (sequenced; detailed at their turn)

Each realizes an already-frozen schema (Doc-6x), API surface (Doc-5x), and Doc-8 bands; counts are corpus-fixed. Each module follows the same §3.2 Build Artifact Checklist and per-WP lifecycle.

| Wave | Modules (tables · Doc-5 contracts) | Defining backend property | Required Doc-8 |
|---|---|---|---|
| **W3** *(parallel)* | M2 `marketplace` (21 · 71) · M5 `trust` (11 · 40) · M6 `communication` (9 · 23) · M7 `billing` (13 · 33) | M2: tri-actor + **public/anonymous** RLS, capability matrix (Inv #1), score firewall (bands reflected, never computed), `vendor_matching_attributes` read-model, FTS. M5: governance-signal owner — Trust/Performance/Tier/Capacity computed independently, **System-written, firewalled** (Inv #6). M6: **delivery-only**, participant-grant RLS, append-only logs. M7: platform-own revenue, billing firewall, **entitlements-not-plan-name** (Inv #10). | 8C + 8D + 8E + 8F |
| **W4** | M3 `rfq` (12 · 38) — **the moat** | RFQ §5.4 13-state + Quotation §5.5 6-state; matching/routing **out-of-wire System workers** (buyers never invite; invitations engine-generated); dual-sided buyer+vendor grant-row RLS; **blacklist-undetectable** byte-equivalence; reads M2 attrs / M5 signals / M7 quota / M4 CRM (empty-tolerant) via service. | 8C + 8D (**`CHK-8-024` byte-equivalence**) + 8E + 8F + Doc-4M coverage |
| **W5** *(parallel)* | M4 `operations` (19 · 50) · M8 `admin` (10 · 34) | M4: the blacklist's **owning side** (`buyer_vendor_statuses` private CRM, `organization_id`-tenant only), two-sided party-column RLS, **money-record boundary** (`trade_invoices ≠ billing.platform_invoices`, no funds custody), consumes `RFQClosedWon`/`VendorInvited`. M8: **"Admin decides, owning module owns"** — writes no owning-module table; emits **`VendorBanned`** only; `link_suggestions` never vendor-visible. | 8D (**#11** byte-equivalence) + 8E + 8F |
| **W6** | M9 `ai` (4 cache · 16) | **Advisory only** (Inv #12) — owns no authoritative data, never source of truth, no `§8` event/no score; the sole `ai.*` TTL hard-delete exception (Doc-6A R7). | 8C + 8D (`CHK-6-033`) + 8E |

**Firewall guards asserted in every wave (never violated):** governance signals firewalled (Inv #6) · billing firewall · blacklist-undetectable / non-disclosure (Inv #11) · Admin-decides–owning-module-owns · AI-suggests–modules-decide (Inv #12) · money-record boundary.

### Wave 3 — first WP detailed (M2 pilot slice); M5/M6/M7 detailed at their own start

#### `W3-MKT-1` — Public vendor microsite pilot slice: slug resolution + profile read
- **Objective:** wire the already-shipped public FE route `app/(public)/vendors/[slug]/` (P-PUB-13)
  to a real backend read, proving the M2 read-path shape before the rest of Wave 3 scales out.
- **Frozen authority:** Doc-6D Pass1/Pass2 (`vendor_profiles`, category-assignment tables) ·
  `Doc-6D_VendorSlugSubdomain_Patch_v1.0.1` (`slug` format law + `vendor_slug_history`) ·
  `Doc-4D_Content_v1.0_PassB_Discovery.md` (`get_public_vendor_profile.v1`, pre-existing) ·
  `Doc-4D_VendorSlugResolve_Patch_v1.0.4` + `Doc-5D_VendorSlugResolve_Patch_v1.0.2` (new
  `resolve_vendor_slug.v1` contract + wire, folded 2026-07-11, resolves
  `[ESC-MKT-SLUG-RESOLVE]`).
- **Inputs:** M0 (POLICY reads) + M1 (none required — both reads are anonymous, no active-org).
- **Outputs:** `marketplace.vendor_profiles` + category-join table + `marketplace.vendor_slug_history`
  (schema); `domain/policies/vendor-visibility.policy.ts` (the single shared visibility predicate);
  two repositories, two queries, one facade, two wire handlers, two app-composition functions +
  one composed FE-facing seam (`resolve-public-vendor.ts`); two `app/api/marketplace/*` routes;
  `app/(public)/vendors/[slug]/get-vendor.ts` rewired off its mock.
- **Dependencies:** none blocking (M2 depends only on M0+M1, both delivered Wave 2).
- **Files:** `prisma/schema.prisma` + migration `20260711100000_marketplace_vendor_slug_pilot` ·
  `src/modules/marketplace/{domain,infrastructure,application,contracts,api}/*` ·
  `src/server/marketplace/*` · `app/api/marketplace/vendor_slug_resolutions/[slug]/route.ts` ·
  `app/api/marketplace/public_vendor_profiles/[id]/route.ts` ·
  `app/(public)/vendors/[slug]/get-vendor.ts`.
- **Acceptance / Doc-8:** 8C (contract/API, both new + pre-existing wire shapes) · 8D (schema +
  public/anonymous RLS) · 8E (Invariant #1 capability matrix as flags · Invariant #11 non-disclosure
  byte-equivalence, including the two-hop migrated-then-hidden case).
- **Required tests:** `tests/integration/resolve-vendor-slug-slice.test.ts` (13, incl. the
  soft-deleted/suspended two-hop cases and the genuine multi-hop A→B→C fixture added at review) +
  `tests/integration/get-public-vendor-profile-slice.test.ts` (13) — both green against real
  Postgres (412/412 full suite, no regressions, 2026-07-11).
- **DTO-conformance fix (carried, pre-existing defect, corrected as part of this WP):**
  `PublicVendorProfileView` dropped `declaredTier`/`vendorTypePreset` — neither is in the frozen
  `get_public_vendor_profile.v1` public projection (`name, human_ref, capability_flags, geography,
  categories, TrustIndicators, profile-experience`).
- **Deferred — explicit gate, not silent narrowing:** the frozen projection's `TrustIndicators`
  (M5 read-model, DD-1 — M5 doesn't exist until its own Wave-3 WP) and "published
  profile-experience" (a richer follow-on) are **not** realized by this WP. Both must be picked up
  by a named follow-on M2 WP before Doc-8 gate 8C is considered complete for the full
  `get_public_vendor_profile.v1` contract — this WP only closes the identifier-resolution +
  core-projection slice.
  **FE-split-brain consequence (Review-B, recorded precisely, not just as "deferred fields"):**
  until `list_vendor_directory` / product / microsite-content reads are ALSO wired (out of scope
  for this WP), the public vendor microsite (`app/(public)/vendors/[slug]/`) is **functionally
  inconsistent for any real (non-seed) vendor**. The profile header/capability/geography now render
  from the real DB via this WP's wired reads, but `generateMetadata` (page `<title>`/canonical/OG)
  on every page, and the products/showcase sections on the home + products + projects pages, still
  render from the static 8-vendor `_components/discovery/seed.ts` — which will show EMPTY or WRONG
  content (falling back to a generic "Vendor · iVendorz" title, or no products/projects at all) for
  any vendor that exists in the real DB but is not one of the 8 seeded vendors. This is a known,
  accepted gap for this pilot slice, not a regression to fix here.
- **Review outcome (`Wave_Template_v1.0` lifecycle, 2026-07-11):** self-verify →
  Review-A (architecture/governance) + Review-B (quality/adversarial) + Team-6 (security) ran as
  three independent fresh-context passes against the stable diff. Review-A: 0 BLOCKER · 1 MAJOR
  (downgraded to a defensive-hardening fix after independently confirming this repo's app-layer
  Prisma connection is privileged/RLS-bypassing by design, matching the precedent in
  `governanceReviews/milestones/w2-idn-7/TEAM-6.md` — not a live disclosure bug) · 1 MINOR. Review-B:
  1 MAJOR (an illusory multi-hop migration test that would pass even with a real regression — fixed
  with a genuine A→B→C fixture) · 3 MINOR · 1 NIT. Team-6: 0 BLOCKER · 2 MAJOR, both **pre-existing
  frozen-architecture gaps this WP realizes but did not introduce** — carried as
  `[ESC-MKT-HUMANREF-ENUM]` and `[ESC-MKT-RATELIMIT-ENFORCE]` (`esc_registry.md`), owner-ruled
  non-blocking 2026-07-11 · 2 MINOR (recorded, one already well-mitigated by design, one fixed —
  explicit `dynamic = 'force-dynamic'` + `Cache-Control: no-store`). All code-fixable findings
  applied; full suite re-verified green (412/412) after fixes.
- **Done:** Build Artifact Checklist (read-only shape-exception: no `domain/` state, no audit,
  no `§8` event on either contract) · tsc/eslint/prettier clean · zero `[ESC-*]` left unresolved in
  the merged path except the four explicitly-carried, explicitly out-of-scope items below ·
  zero regressions in the pre-existing suite · BLOCKER=MAJOR=MINOR=0 in the merged path (CLAUDE.md
  §13 gate) once the four carried ESCs are excluded per their owner-ruled non-blocking disposition.
- **Build owner:** `ivendorz-implementer` agent, dispatched 2026-07-11, branch `wave/3-marketplace`.
  **Committed to `wave/3-marketplace` 2026-07-11 — NOT merged to `main`** (owner ruling: Wave 3 has
  three more parallel modules — M5/M6/M7 — not yet started; the wave branch merges to `main` at
  Wave 3's full exit gate, mirroring the Wave-2 precedent, not per-WP).

**Carried non-blocking items to resolve or channel at the next M2 WP (or Board, for the two
program-wide items):** the deferred `trust_indicators`/`profile_experience` projection fields
above; `[ESC-MKT-SUBDOMAIN-MIGRATE]` (the M8-mediated slug-migration write, still open);
`[ESC-7G-SLUG-MKT]` (custom-domain Doc-5D grounding, still open, unrelated to this WP);
`[ESC-MKT-HUMANREF-ENUM]` (sequential `human_ref` enumeration via gap analysis — program-wide, not
M2-specific, Board disposition needed); `[ESC-MKT-RATELIMIT-ENFORCE]` (zero enforced rate limiting
on any Marketplace public read — program-wide, pre-existing since `get_public_product_detail.v1`).

---

## 6. Per-WP execution lifecycle (Wave_Template_v1.0, binding)

```
implement → self-verify → Review-A (architecture/governance, fresh context)
  → Review-B (quality/adversarial, fresh context) → consolidate
  → Validate-Findings gate (CLAUDE.md §13: Valid? Applicable? Best? Corpus-consistent?)
  → apply accepted fixes → regression recheck → technical audit
  → merge-collision check → merge into wave/2-core-platform
```

- **Definition of Ready (§9.4):** governing frozen contracts identified · dependencies gated green · WP template filled · single build owner assigned · generated artifacts (Prisma client, contracts registry) exist for inputs.
- **Definition of Done (§9.5):** required Doc-8 bands green · CI/local suite green · zero unresolved `[ESC-*]` · zero `TODO` in the merged path · migrations apply clean forward-only · Build Artifact Checklist + pre-PR checklist (`IMPLEMENTATION_START_HERE.md`) satisfied.
- **PR scope:** one module scope per PR; multiple WP PRs per module; a PR never spans two modules. Generated paths (Prisma client, `generated-contracts-registry/`) are regenerated, never hand-merged.

> **Additive amendment — execution-organization sync (2026-07-09).** Backend execution now runs
> under the **AI Engineering Organization v1.0 — Ratified Execution Governance**
> (`project-management/ai-engineering-organization-plan.md`; decision record
> `governanceReviews/BOARD-DECISION-AI-ENG-ORG_v1.0.md`). The lifecycle above is unchanged; in
> addition, **Team-6 (Security Review) activates per the ratified runtime policy** — it fires as a
> blocking gate on any WP whose scope touches a security surface (auth/authz/roles/org-context/
> RLS/private-data/external-input/secrets/firewalled signal; charter:
> `governanceReviews/TEAM-6-Security-Review-Charter.md`) and is recorded "N/A — no security
> surface" without activation otherwise. Backend roles are activated as the organization's
> **Team-7 Module Agents** using the ratified packet/report/handoff templates (`governanceReviews/
> AI-Activation-Packet-Template.md` and companions). Governance is **not restated here** — the
> organization plan and Board decision own it; this note only binds the reference.

---

## 7. Risk register (engineering only — architecture is frozen)

| Risk | Mitigation |
|---|---|
| RLS byte-equivalence regression (blacklist/exclusion detectable) | `CHK-8-024` mandatory on every RLS change; load-bearing from W4/W5 (#11 target). |
| Outbox atomicity (write without event, or vice-versa) | Business write + audit + event in one transaction (D7 reference pattern); 8B outbox observer + savepoint. |
| Migration conflict across module schemas | Forward-only/expand-contract (Doc-6A §11); no cross-schema FK; CI migration check. |
| Shadow authorization (app re-deriving `check_permission`) | App-layer seam binds the M1 contract only; 8E Inv #5; boundary lint. |
| Coining under pressure (a gap tempts local invention) | Flag-and-Halt; `[ESC-*]` + escalate; never fill a corpus gap in code. |
| CI not yet merge-gating (WP-1.9 parked) | Suites run locally against ephemeral DB; wire CI merge-gate when infra unparks (§3). |

**Build-time rollback:** revert the wave's merge set to the last green wave tag; a bad schema is undone by a compensating forward migration, never a down-migration.

---

## 8. Immediate next actions

1. `W2-CORE-1` — M0 config/POLICY + feature-flag read services on `contracts/` (first Wave-2 WP; DoR satisfied — dependencies are all green).
2. `W2-CORE-2/3` — outbox dispatch hardening + M0 conformance gate.
3. `W2-IDN-1` — extend the `identity` schema with the 4 remaining tables + RLS (unblocks the seed → `check_permission` chain).

---

## Sources (by Authority Order; pointers, never restated)

- `generatedDocs/Build_Roadmap_v1.0.md` (wave sequence + gates)
- `generatedDocs/Development_Decomposition_v1.0.md` (§2 streams · §3 WP template + Build Artifact Checklist · §7 dependency graph · §9 acceptance gates · M0/M1 WP chains)
- `generatedDocs/Program_Status_And_Roadmap.md` (live status)
- Doc-2 v1.0.3 · Doc-3 v1.0.2 (+ POLICY patches v1.0/v1.9) · Doc-4C · Doc-4M · Doc-5C · Doc-6B · Doc-6C · Doc-8B…8G (frozen)
- `REPOSITORY_STRUCTURE.md` · `CLAUDE.md` · `IMPLEMENTATION_START_HERE.md` · `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`
</content>
