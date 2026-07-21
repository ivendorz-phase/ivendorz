# Vendor Console (Seller Dashboard) Backend — Build Plan (Wave 3)

| Field | Value |
|---|---|
| **Document type** | Living execution plan · non-authoritative under the frozen corpus |
| **Date** | 2026-07-22 |
| **Owner** | Engineering (backend) |
| **Scope** | The **authenticated seller console** (`/sell/*`), org-scoped (Actor: User, Active-Org = Y). Focus: the M2 vendor-profile console that Wave 3 can actually wire. The `/sell/dashboard` overview *aggregation* is scoped as mostly gated (see §2). |
| **Conforms to** | `Build_Roadmap_v1.0` §Wave 3 → Doc-4A, Doc-4D + patches, Doc-5A + patch v1.0.1, Doc-6D, Doc-8C/8D/8E, ADR-005 (ownership transfer), the D7 audited-write reference pattern (all FROZEN/APPROVED) |
| **Conflict rule** | **Flag-and-Halt** (CLAUDE.md §11). §3 lists raised items; none resolved here. |
| **Coins** | Nothing. Slice IDs (`M2-VC-1`…) are organizing labels only. |
| **Depends on** | **`m2_public_read_slice_plan.md` M2-PR-0** — the 21-table `marketplace` schema migration is a **shared prerequisite** for both the public reads and this authenticated console. It is not rebuilt here. |
| **Companion** | Sequence: [`backend_build_plan.md`](backend_build_plan.md) §W3. Pattern reference: M1 identity (`src/modules/identity/`) — the only fully-built module, and the one that carries the write/audit/outbox pattern this plan reuses. |

> This plan **sequences realization only**. Every contract-ID, path, enum value, event, and RLS
> predicate is bound by pointer to a frozen document. Where the corpus is silent or the surface
> depends on an unbuilt module, that is stated as a gate, not worked around.

---

## 1. What "vendor dashboard" is, today

The seller workspace is `/sell/*` (`app/(app)/(workspace)/sell/`); `/sell` redirects to
`/sell/dashboard` (`sell/page.tsx:5`). Navigation is `VENDOR_NAV`
(`app/(app)/_components/vendor/vendor-shell-vm.ts:39-196`). **Every page is presentation-only** —
a repo-wide grep for `fetch(`, `@/backend`, `supabase`, `.v1(` under `sell/` returns nothing. Pages
pass empty arrays (`leads={[]}`, `RECEIVED_PAYMENTS = []`) into kit empty-states, or no value at all.

This is not an accident — it is the standing **VX-03 owner directive (2026-07-17): no demo data on
the vendor console**. Every surface renders **a wired read OR a disclosed honest placeholder — never
a fixture/fabricated figure** (`sell/dashboard/page.tsx:6-10`; `sell/finance/page.tsx:18,55-56`;
`docs/product/requirements/digital_showcase_planning_and_design.md:47,346`). Wiring a backend is
exactly how a placeholder becomes a real value — this plan is the mechanism VX-03 was waiting on.

The only "data" that exists is **presentation-type contracts, not fixtures**:
`app/(app)/_components/vendor/company/types.ts` maps 1:1 to frozen Doc-2 §10.3 / Doc-6D columns
(all fields optional, "ZERO CONTRACT INVENTION", header lines 1-12), and
`app/(app)/_components/vendor/identity-seed.ts` — a neutral identity placeholder only.

---

## 2. The overview page is mostly gated — and that decides the scope

`/sell/dashboard` is a 6-KPI + multi-panel **cross-module aggregation**. Mapping each tile to its
owning module against the frozen wave sequence
(`backend_build_plan.md:56-57,166-167` — **M3 rfq = Wave 4, M4 operations = Wave 5**) shows most of
it cannot be backed in Wave 3:

| Dashboard tile (file:line) | Owner | Wave | Wireable now? |
|---|---|---|---|
| Open RFQs, Active quotations, Latest RFQ invitations, Sales pipeline (`page.tsx:44-45,90-111`) | **M3 rfq** | **W4** | No |
| New POs, Bills receivable, Recent documents, Financial snapshot ×4 (`page.tsx:46-47,123`; `panels:70`) | **M4 operations** | **W5** | No |
| Follow-ups due, Buyer inquiries (`page.tsx:48,112-118`) | **M4 ops (CRM)** | **W5** | No (ND-8 forbids a lead aggregate regardless) |
| Buyer engagement analytics (`panels:14-15`) | **M2 marketplace** | **W3** | Deferred — no engagement-analytics read contract exists |
| Global Trust Score ring + tier (`global-trust-score-card.tsx`) | **M5 trust** | **W3** | Thin read leg (parallel module) |
| Subscription: RFQs remaining / Lead balance / Renewal (`panels:94`) | **M7 billing** | **W3** | Thin entitlement-read leg (parallel module) |
| Quick actions (`panels:115-122`) | navigation only | — | Already shippable (no data) |

**Conclusion:** a fully-wired overview page is a Wave-5 outcome, not a Wave-3 task. Attempting it now
would either fabricate figures (VX-03 violation) or cross-import unbuilt modules (Golden Rule 2). So
this plan targets what Wave 3 genuinely unlocks: **the M2 vendor-profile console** (the `/sell/company`
tree + microsite/profile publish), where the seller reads and edits their own org's profile. The
overview page keeps its honest placeholders and lights up tile-by-tile as W3→W5 land.

---

## 3. Flag-and-Halt / raised items (raise ≠ accept)

### 3.1 The overview page's module dependencies — **OBS (scope note, not a defect)**
Most overview tiles are W4/W5. Recorded so no one mistakes the honest-placeholder dashboard for
unfinished W3 work. The M2/M5/M7 tiles wire on their own module timelines, not as one dashboard task.

### 3.2 `claim_vendor_profile.v1` blocked by DD-7 — **MAJOR (blocks that one slice)**
`vendor_claim_records` tenancy is unsettled (DD-7; `Doc-4D_Content_v1.0_PassB_VendorProfile.md:30`).
Per the public-read research, DD-7 blocks **`claim_vendor_profile` content finalization only** — not
the other profile reads/writes. Sequence claim last; do not force a local tenancy decision.

### 3.3 `vendor_type_preset` value domain still in proposal — **MINOR** (carried from the public-read
plan §3.4). `update_vendor_profile.v1` accepts `vendor_type_preset`; the frozen field has an **empty**
value domain and the 6-slug amendment is unratified. Accept the value as an opaque `string | null`;
do not encode an enum or a `CHECK` constraint against an unratified set.

### 3.4 Declared-vs-verified tier firewall must hold at the write boundary — **MAJOR (design constraint)**
M2 owns and writes the **declared** financial tier (`set_declared_financial_tier.v1`). The
**verified** tier, trust score, performance score, and verification status are **M5-owned and
read-only reflections** into M2's projection (DD-1; `company/types.ts:52-53`). The console write path
must never let a seller edit a verified/Trust field. `upsert_vendor_capacity_profile.v1` has the same
trap: `verified_fields_jsonb` is Trust-owned — the seller writes declared capacity only. This is a
firewall (Golden Rule 3 / Invariant #6), enforced in the command, proven by Doc-8E `CHK-8-030/031`.

---

## 4. Build sequence

### 4.0 Prerequisite: shared M2 schema (M2-PR-0)
The authenticated console reads and writes the same 21 `marketplace` tables the public reads use.
**M2-PR-0** (the single forward-only `marketplace_init` migration, per the public-read plan) is the
shared foundation. If the public-read slice runs first, this plan starts at M2-VC-1; if not, M2-PR-0
is step zero here too. Either way it is built **once**.

### 4.1 Slices (all Actor: User, Active-Org = Y)

| ID | Slice | Delivers | Depends |
|---|---|---|---|
| **M2-VC-1** | `get_vendor_profile.v1` (**User projection**) | full entitled projection (incl. reflected `TrustIndicators`) for the seller's own org → wires `/sell/company` Overview | M2-PR-0 |
| **M2-VC-2** | `create_vendor_profile.v1` + `update_vendor_profile.v1` | first-run creation; edit name / **capability_flags (4 flags)** / geography / `vendor_type_preset` → wires the Identity + Capabilities forms | M2-VC-1 |
| **M2-VC-3** | capacity + declared tier | `upsert_vendor_capacity_profile.v1`, `get_vendor_capacity_profile.v1`, `set_declared_financial_tier.v1`, `get_declared_financial_tier.v1`, `get_financial_tier_history.v1` → wires Capacity + Financial-Tier tabs | M2-VC-2 |
| **M2-VC-4** | category assignments | `assign_category.v1`, `update_category_assignment.v1`, `remove_category_assignment.v1`, `get_category_assignments.v1` (+ the **public** `list_categories.v1` for the picker, from the public-read plan) → wires `/sell/company/categories` | M2-VC-2, PR-2 |
| **M2-VC-5** | profile / microsite publish | `update_profile_sections/branding_assets/seo_settings.v1`, `publish_profile.v1`/`unpublish_profile.v1`, `publish_microsite.v1`/`unpublish_microsite.v1`, `publish_showcase_project.v1` → wires `/sell/microsite` + profile publish; emits `ProfilePublished` etc. | M2-VC-2 |
| **M2-VC-6** | ownership transfer | `transfer_vendor_ownership.v1` (approval-based, ADR-005) | M2-VC-2 |
| **M2-VC-7** | claim | `claim_vendor_profile.v1` — **blocked by DD-7 (§3.2)**; sequence last, may not land in W3 | ESC/DD-7 |
| **M2-VC-T** | trust/subscription overview tiles | thin cross-module **read** legs: M5 `get_trust_score`/`get_performance_score`/verified tier, M7 entitlement reads → lights the overview's Trust + Subscription tiles only | M5/M7 slices |

**Recommended first build: M2-VC-1 + M2-VC-2** — read the profile, then create/update it. This is the
seller's core loop, wires the most-visited page (`/sell/company`), and establishes the org-scoped
write+audit+outbox path every later slice reuses.

---

## 5. Realization pattern — the write path (the real difference from public reads)

Public reads were anonymous, unaudited, no writes. The console is the opposite: **Users act,
Organizations own**. Everything below follows M1's write pattern (`src/modules/identity/`) exactly.

**Org-scoped carriage.** Authenticated ops carry `Authorization` (bearer) and, on org-scoped ops,
`Iv-Active-Organization` — **server-validated, never client-trusted** (Invariant #5). The composition
resolves it via `withActiveOrg` (`src/server/context/with-active-org.ts:43-89`), which opens one
`$transaction` and sets the three GUCs (`app.user_id`, `app.active_org`, `app.is_platform_staff`) via
parameterized `set_config(..., true)`, resolving the active org from a **confirmed active membership**
— fail-closed if not resolved.

**The D7 audited write, atomic.** Every business write + its audit append + its §8 outbox event
commit in **one transaction** — the reference pattern
(`governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`;
`upsert-buyer-profile.command.ts` is the concrete precedent). Command shape:
`Command → appendAuditRecord() → Repository → Transaction → Done`, all on one `db` executor. The M0
concretes (`appendAuditRecord`, `writeOutboxEvent`) are consumed as **contract types** by the module
and **injected at `src/server/marketplace/`** — never imported cross-module.

**Never invent an audit action or an event.** Audit actions bind to the nearest Doc-2 §9 action
(`[ESC-MKT-AUDIT]` governs the publish/showcase/domain bindings — bind, never coin). §8 events are
the frozen catalog: `ProfilePublished`, `ProfileUnpublished`, etc. — emitted only where the frozen
contract declares one.

**Idempotent creates.** `create_vendor_profile.v1` / `assign_category.v1` (the `POST → 201`
collections) use the shared `runTenantCreate` runner (`src/server/identity/command-dedup.ts:235+`):
session → syntax → mandatory `Idempotency-Key` (400 if absent) → provision → `withActiveOrg` → replay
lookup → claim → command → map → persist, in one tx. Dedup window is
`marketplace.idempotency_dedup_window` **[24h]**, read via `core.config_value_query.v1`, never a
literal. `PATCH`/state-transition `POST`s are not idempotency-keyed.

**Validation order is fixed** (disclosure control): SYNTAX → CONTEXT → AUTHZ → SCOPE → DELEGATION →
STATE → REFERENCE → BUSINESS → POLICY (`Doc-4D_Content_v1.0_PassB.md:55`). AUTHZ precedes semantics;
MUST NOT reorder/merge/short-circuit. `update_vendor_profile.v1` is **§6B delegation-eligible** — the
DELEGATION stage is live for it (delegation editor already built, `P-ACC-12`).

**Method mapping, strict** (`Doc-5D_Content_v1.0_Pass1.md:83`): create → `POST` collection (201 +
`Location`); field edit → `PATCH` item; state transition (publish/claim/transfer) → `POST` named
sub-resource; soft-delete → `DELETE` item (ADR-012); read → `GET`. **No `PUT`, no `202`.**

**Casing / envelope / error codes** — identical rules to the public-read plan §5: `result`-payload
camelCase, everything else snake_case (`Doc-5A_Patch_v1.0.1.md`); `{ result, reference_id }` /
list envelope; class→status map is normative and un-remappable; coin no error code
(`marketplace_vendor_*`, `marketplace_category_*`, `marketplace_tier_*`, `marketplace_profile_*`).

**The firewall, in code (§3.4).** The `update`/capacity/tier commands write only Marketplace-owned,
seller-declared fields. Verified tier, trust/performance scores, verification status, and
`verified_fields_jsonb` are **read-only reflections** — the command rejects any attempt to set them.
The System-actor projectors `sync_verified_financial_tier.v1` / `reflect_verified_claim_status.v1`
are the *only* writers of those fields and are **out of this scope** (they are event-consumers, not
seller ops).

---

## 6. Gate mapping (Doc-8)

Writes bring **Doc-8C** into play alongside 8D/8E:

- **Doc-8C** (app-layer authz + audited-write conformance) — the D7 matrix per write command:
  CREATE 201 + audit row; UPDATE 200 + old/new diff; CONFLICT 409 + no extra audit; **audit failure
  rolls back the business write**; FORBIDDEN 403 no write no audit; VALIDATION 400 before any write.
  Precedent: `tests/integration/upsert-buyer-profile-slice.test.ts`. Authorization is resolved in the
  app layer by M1 `check_permission` (out-of-wire) against the frozen slugs (`can_publish_profile`,
  etc.) — **no shadow authz**.
- **Doc-8D** — tri-actor RLS: the **User** leg now matters (sees own-org incl. pre-publish + public
  rows; never another org's). Cross-tenant: org A's DB role never reads/writes org B's vendor rows.
  Child policies use intra-schema `EXISTS` on the parent.
- **Doc-8E** — `CHK-8-030/031` **firewall is the headline gate** for this plan (declared ≠ verified;
  Trust never mutated by a seller write). `CHK-8-032` invariants: **#1** capability = four booleans
  never a label; **#5** Users-act-Orgs-own (server-validated org context); **#6** signals firewalled.
  8E exports `firewallNonCross` / `invariantHolds(n)` — invoke, never re-implement.

Tests live centrally (`tests/integration/<slice>-slice.test.ts`, Vitest, `fileParallelism: false`,
shared ephemeral Postgres). Mind the shared-DB residue and review-concurrency hazards.

**Gate arithmetic:** BLOCKER = MAJOR = MINOR = 0 with required bands green (CLAUDE.md §13).

---

## 7. FE wiring (per slice, not one big cutover)

Unlike the public seed, the console has **no fixture to swap** — pages already render honest empty
states. Wiring a slice means: page (server component) calls the M2 read → passes real props into the
already-built presentation component; forms `POST`/`PATCH` to `app/api/marketplace/**` → on success
re-read. The presentation-type contract (`company/types.ts`) is already the exact prop shape, so the
FE change per slice is small and additive. **VX-03 stays satisfied throughout**: an unwired tile keeps
its placeholder; a wired tile shows a real read; nothing is ever fabricated.

---

## 8. Explicit non-goals

The overview aggregation as a whole (W4/W5 tiles — §2) · M3 rfq / M4 operations / M4 CRM surfaces ·
buyer-engagement analytics (no read contract) · any invented chart or time-series (GR#8) · a lead
aggregate/count (ND-8) · Admin-owned ops (`set_vendor_profile_status`, category CRUD — those are M8) ·
the System projectors that write verified tier / verification (event-consumers, not seller ops) ·
`claim_vendor_profile` finalization (DD-7, §3.2).
