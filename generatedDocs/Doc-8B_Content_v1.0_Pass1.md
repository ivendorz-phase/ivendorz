# Doc-8B — Test Foundation & Harness — Content v1.0 **Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-8B_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8B_Structure_v1.0_FROZEN` §0–§4: control/precedence · scope/harness-partition · test-tooling stack (D1) · ephemeral test-DB strategy · fixture & factory design |
| Authority | `Doc-8A_SERIES_FROZEN_v1.0` (the *how* — harness conventions §4/§10 + Appendix A bands A/H/I); the frozen corpus governs above. Consumes by pointer: `Doc-2 §6/§7`; `Doc-6A §3`; `Doc-6B core.id_sequences` + `Doc-4B`; `Doc-6C` (realized role/permission + tenant tables); CLAUDE.md §2/§5/§10 |
| Coins | **Nothing.** Conventions trace to Doc-8A; tooling = the Board-ratified D1 (Vitest + Playwright + TS-native SQL); physical specifics (file layout, helper names, config shape) are Doc-8B realization choices, tagged inline |
| Binding vs choice | Every convention that traces to Doc-8A is **[Doc-8A binding]**; every physical specific not stated by Doc-8A (helper names, file layout, config fields, illustrative snippets) is a **[Doc-8B choice]**. Code blocks are **illustrative of the convention**, not the frozen artifact — the convention is binding, the snippet illustrates. |

> **Scope of this pass:** the harness *foundation* — control/precedence (§0), scope & partition (§1), the ratified tooling realized concretely (§2), the ephemeral test-DB + isolation strategy (§3), and the fixture/factory design (§4). §5–§9 (tenant seeding, clock/ID, mock boundary + outbox observer, CI gate, conformance) land in Pass-2.

---

## §0 — Control, Precedence & the Doc-8A Binding

Doc-8B sits at: `… → Doc-8A → **Doc-8B** → (Doc-8C…8G consume) → harness code`. It **realizes** the Doc-8A harness conventions (`§4` test-data/tenancy/determinism · `§10` isolation/determinism/hermeticity/CI — the *how*) as a concrete, consumable foundation, and **passes the applicable Doc-8A Appendix-A bands** before content freeze: **Band H** (`CHK-8-070…074` isolation/determinism/CI) and **Band I** (`CHK-8-080/081` out-of-test). **Band A** (oracle-by-pointer) is **N/A** — the harness authors no assertions. **Bands B–G** are **N/A** — the harness provides the means those discipline suites assert with. Realize-never-redecide; reference-never-restate; flag-and-halt on any conflict. Doc-8B coins nothing. The two freeze obligations: pass Bands H/I, and `[ESC-8-TOOLING]` is already **RESOLVED** (D1, §2).

## §1 — Scope & the Harness Partition

Doc-8B governs the **shared test foundation** every discipline suite (Doc-8C…8G) consumes **by pointer** (DR-8-HARNESS): a suite imports a harness helper; it never re-implements a fixture, a mock, the clock, or the gate. Pass-1 realizes the **runner + ephemeral test DB + fixtures/factories** (§2–§4); Pass-2 realizes **tenant seeding + clock/ID + mock boundary/outbox observer + CI gate + conformance** (§5–§9).

**Provides / does-not-provide [Doc-8A binding]:** the harness provides the *means* (runner config, DB lifecycle, builders, doubles, gate) — **never a discipline assertion** (those are Doc-8C…8G). A harness helper makes no `expect(...)` about domain behavior; it sets up, tears down, and observes. **N/A-band map** (Doc-8A Appendix A): A (oracle-by-pointer) · B contract · C persistence/RLS · D invariant/firewall · E state-machine · F integration/event · G frontend/e2e → **all N/A to the harness itself** (it enables them); **H, I** are Doc-8B's own gates.

## §2 — Test-Tooling Stack Realization *(D1 — RESOLVED)*

The Board-ratified D1 stack [Doc-8A R3 binding; selection Board-ratified], over the Master-Architecture runtime (Next.js 15 / TS / Prisma / Supabase / Inngest — CLAUDE.md §2):

| Layer | Tool | Serves (Appendix-A band) | Note |
|---|---|---|---|
| Unit / contract / integration runner | **Vitest** | harness + B/C/D/E/F | native TS/ESM; one config drives all non-e2e suites |
| Browser e2e | **Playwright** | G (`CHK-8-063`) | App Router support |
| a11y | **`@axe-core/playwright`** | G (`CHK-8-061`) | runs inside the Playwright driver |
| visual-regression | **Playwright snapshots** | G (`CHK-8-062`) | no extra toolchain |
| RLS / SQL | **TS-native transactional SQL** (via Vitest, against the Supabase test DB; per-case role / `SET LOCAL`) | C (`CHK-8-024`) | single toolchain; pgTAP not selected (D1) |

Illustrative runner config shape **[Doc-8B choice]** (the *convention* is "one Vitest project with global setup wiring the DB lifecycle, seeded clock, and mock boundary"; the field names illustrate):

```ts
// vitest.config.ts — illustrative [Doc-8B choice]; convention = global setup wires DB + clock + mocks [Doc-8A binding]
export default defineConfig({
  test: {
    globalSetup: ['./tests/harness/global-setup.ts'],   // migrate test DB, seed POLICY + roles (§4)
    setupFiles: ['./tests/harness/per-test-setup.ts'],   // open tx, inject seeded clock + ID provider (§3/§6)
    sequence: { shuffle: false },                        // determinism (Band H); no order-dependence either way
    pool: 'threads',
  },
})
```

Exact version pins live in `package.json` once code exists (CLAUDE.md §2). No tool is coined as architecture — D1 is a Board-ratified implementation choice.

## §3 — Ephemeral Test-Database Strategy

**[Doc-8A §4.4/§10.1 binding]:** the test DB is **ephemeral** and **per-test isolated**; no inter-case state bleed; disposable (R12 / `CHK-8-080`).

- **Schema:** a Supabase Postgres test database carrying the **realized Doc-6 schema + migrations** (Prisma `multiSchema` — `Doc-6A R3b`; CLAUDE.md §10). Because the realized migrations run on the test DB, **migration conformance** (Band C / `Doc-6A §11`, asserted by Doc-8D) runs against the same schema the suites use. As of freeze the realized schema is `core` (Doc-6B) + `identity` (Doc-6C); further schemas attach as Doc-6D…6K freeze (per-suite oracle-readiness).
- **Isolation mechanism [Doc-8A binding; mechanism a Doc-8B choice]:** **transaction-rollback per test by default** — each case runs inside a transaction opened in `per-test-setup` and rolled back at teardown; **schema-reset** is the fallback for cases that exercise DDL or RLS role-switching (where a single transaction cannot hold the assertion — e.g. testing a policy as two DB roles). The default keeps cases fast and hermetic; the reset path is reserved for the Band-C RLS/migration suites.

Illustrative isolation pattern **[Doc-8B choice]**:

```ts
// per-test-setup.ts — illustrative; convention = each test isolated, rolled back, deterministic [Doc-8A binding]
beforeEach(async (ctx) => {
  ctx.tx = await db.$begin();                 // transaction-rollback isolation (default)
  ctx.clock = seededClock(FIXED_EPOCH);       // §6 seeded clock
  ctx.ids = deterministicIdProvider(ctx.clock); // §6 M0 UUIDv7 fed the seeded clock (ERR-8A-1 anchor)
})
afterEach(async (ctx) => { await ctx.tx.rollback() })  // no residue; DB disposable (R12)
```

RLS/role-switching cases opt into the schema-reset path (declared per suite) since `SET LOCAL ROLE` + rollback interact; that is a Band-C (Doc-8D) concern, enabled here.

## §4 — Fixture & Factory Design *(through-contracts / seed-only)*

**[Doc-8A §4.2 binding / `CHK-8-074`]:** factories create data **through module contracts or the module's own seed path — never by hand-mutating another module's tables.** One Module, One Owner holds inside the harness (Invariant #7): a factory for module M never `INSERT`s module N's rows; it calls N's contract or N's seed factory.

- **Standard-column-aware [Doc-6A §3 binding]:** factories produce rows carrying the realized standard columns (`id UUIDv7` via the §6 ID provider; `created_at`/`updated_at`; tenant/actor/soft-delete tuples where the table declares them). A factory never invents a column.
- **Role/permission + POLICY seeds [Doc-2 §7 binding; realized seed by pointer]:** the global setup seeds the role/permission set and the registered POLICY keys via the **already-realized seed paths** — the `identity` 45-slug + 4-bundle role/permission seed (`Doc-6C`) and the `core.system_configuration` POLICY seed (`Doc-6B`; Doc-3 §12 registered keys, incl. `identity.*` Doc-3 v1.9). The harness **re-authors no seed** — it invokes the realized ones (reference-never-restate).
- **Composability [Doc-8B choice]:** factories are small, composable builders with sensible defaults and explicit overrides; deterministic (fed the §6 clock/ID provider), so the same factory call yields the same row across runs.

Illustrative factory pattern **[Doc-8B choice]** (convention = through-contracts, deterministic, standard-column-aware):

```ts
// illustrative; convention [Doc-8A binding] = build via contract/seed, deterministic, no foreign-table writes
export const makeOrganization = factory(async (over, ctx) =>
  // calls the M1 identity create-organization contract/seed — NEVER a raw INSERT into identity.* from another module
  identitySeed.organization({ name: 'Acme Plant', ...over }, ctx)   // [Doc-8A §4.2]
)
export const makeBuyerUserInOrg = factory(async (over, ctx) => {
  const org = over.org ?? await makeOrganization({}, ctx)
  return identitySeed.userWithMembership({ org, role: 'owner', ...over }, ctx) // role slug ⊆ Doc-6C seed
})
```

A factory that needs cross-module data (e.g. an RFQ referencing a vendor profile) composes the owning module's factory — it never reaches into `marketplace.*` or `rfq.*` directly (§1 boundary; Invariant #7).

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** conventions bound by pointer — `Doc-8A §4.2/§4.4/§10.1`, Appendix A bands H/I (`CHK-8-070…074`, `080/081`); `Doc-6A §3/R3b/§11`; `Doc-6B core.id_sequences`/POLICY seed; `Doc-6C` role/permission seed + realized tenant schema; `Doc-4B` (ID owner); `Doc-2 §7`; CLAUDE.md §2/§5/§10; Invariant #7; `ERR-8A-1`. **Nothing invented.**
- **Binding vs choice tagged:** every convention is [Doc-8A binding]; every snippet/helper-name/config-field is [Doc-8B choice], explicitly illustrative (not the frozen artifact).
- **Mechanism only / no discipline assertion:** the harness provides means; §2–§4 author no `expect(...)` about domain behavior.
- **Coins nothing:** 0 new contract/field/state/event/audit/POLICY key/expected value; tooling = Board-ratified D1.
- **Oracle-readiness honored:** test DB carries the realized schema as of freeze (`core` + `identity`); further schemas attach as Doc-6D…6K freeze.
- **Open for review:** confirm the transaction-rollback-default / schema-reset-for-RLS split is correctly attributed (Doc-8A §4.4 says "transaction rollback OR schema reset" — both sanctioned); confirm the role/permission seed pointer (`Doc-6C` 45-slug+4-bundle) is the right realized anchor now that Doc-6C is frozen.

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-8B_Structure_v1.0_FROZEN` §0–§4. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Pass-2 (§5–§9).*
