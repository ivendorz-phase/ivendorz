# Doc-8B — Test Foundation & Harness — Content v1.0 **Pass-2 (§5–§9)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-2 (DRAFT)** — realizes §5–§9 of `Doc-8B_Structure_v1.0_FROZEN`. Final Doc-8B content pass. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-8B_Structure_v1.0_FROZEN` §5–§9: multi-tenant seeding · seeded clock & ID provider · out-of-wire mock boundary + outbox observer · CI merge-gate · conformance/carried |
| Authority | `Doc-8A_SERIES_FROZEN_v1.0` §4/§10 + Appendix A bands H/I (the *how*); the frozen corpus governs above. Consumes by pointer: `Doc-2 §6`; `Doc-4B`/`Doc-6A §3`/`Doc-6B`; `Doc-6C` (org/membership tables); `Doc-6A §7` (outbox); `Doc-4L`; CLAUDE.md §2/§5/§8 |
| Coins | **Nothing.** Conventions trace to Doc-8A; physical specifics (helper names, config shape, snippets) are Doc-8B choices, tagged inline |
| Binding vs choice | Convention tracing to Doc-8A = **[Doc-8A binding]**; physical specific = **[Doc-8B choice]**. Code blocks illustrate the convention; the convention binds, the snippet illustrates. |

> **Scope of this pass:** the harness *services* — multi-tenant seeding (§5), the seeded clock + deterministic ID provider (§6), the out-of-wire mock boundary + the Band-F outbox observer (§7), the CI merge-gate (§8), and Doc-8B's own conformance attestation + carried register (§9). With Pass-1 (§0–§4) this completes Doc-8B content.

---

## §5 — Multi-Tenant Seeding *(≥2 orgs; active-org context)*

**[Doc-8A §4.1 binding / `CHK-8-074`]:** any tenant-scoped suite seeds **≥2 organizations** — the minimum to prove isolation; the Band-C cross-tenant gate (Doc-8D) reads from this fixture (org A must never see org B).

- **Server-resolved active-org context [Invariant #5 / CLAUDE.md §5 binding]:** suites act under a **server-resolved** active org; the harness sets the active-org context the way the runtime does — it **never forges a client-supplied org ID** to bypass resolution. A suite that wants to act as org A's user receives a context the server would have resolved; a suite asserting that a forged client org ID is **rejected** is a Band-C/authz case (Doc-8D/8C), enabled here.
- **Realized tenant tables [Doc-6C binding, by pointer]:** orgs, memberships, roles, permissions are seeded via the `identity` realized seed/contract path (`Doc-6C`); the harness re-authors none. `human_ref` values come from `core` (`Doc-6B`), never minted by the harness.
- **Hybrid-participation fixture [Invariant #2 binding]:** where a suite needs it, a single org seeded with **Buyer + Vendor** participation (one org, both capabilities) — so Band-G/Band-E suites can exercise the Hybrid mount and the Buyer/Vendor surfaces under one active org.

Illustrative seeder **[Doc-8B choice]** (convention = ≥2 orgs, server-resolved context, realized seed path):

```ts
// illustrative; convention [Doc-8A §4.1] = >=2 orgs, server-resolved active-org, no forged client org id
export async function seedTwoTenants(ctx) {
  const orgA = await makeOrganization({ name: 'Acme Plant' }, ctx)   // §4 factory -> identity seed
  const orgB = await makeOrganization({ name: 'Beta Works' }, ctx)
  const userA = await makeBuyerUserInOrg({ org: orgA, role: 'owner' }, ctx)
  const userB = await makeBuyerUserInOrg({ org: orgB, role: 'owner' }, ctx)
  return { orgA, orgB, userA, userB }   // cross-tenant gate (Doc-8D) asserts A cannot read B
}
export const actAs = (user, org) => withServerResolvedContext(user, org)  // never a client-trusted org id (CLAUDE.md §5)
```

## §6 — Seeded Clock & Deterministic ID Provider

**[Doc-8A §4.3/§10.2 binding / `CHK-8-071`]:** determinism is the root of a non-flaky suite. Wall-clock and IDs are **injected, never ambient**.

- **Seeded clock:** a fixed epoch injected per test (Pass-1 §3 `per-test-setup`); any time-dependent value (timestamps, TTL, dedup windows) is reproducible. Time advances only by explicit harness control (e.g. `clock.advance(ms)`), never by real elapsed time.
- **Deterministic ID provider [ERR-8A-1 corrected anchor]:** the **M0 UUIDv7 ID service** (`Doc-4B` owner; `Doc-6A §3` convention; `Doc-6B core.id_sequences` allocator) is **fed the seeded clock**, so the time-ordered UUIDv7 values are reproducible across runs; or **fixed-UUID fixtures** where a case pins a specific ID for an assertion. The harness never calls an ambient UUID source.
- **Zero flaky tolerance [Doc-8A §10.2 binding]:** a non-deterministic test is a **defect**, fixed at its source — never retried-until-green. A test depending on real time or an ambient ID is mis-built.

Illustrative provider **[Doc-8B choice]**:

```ts
// illustrative; convention [Doc-8A §4.3] = seeded clock feeds the M0 UUIDv7 provider; reproducible
export const seededClock = (epochMs) => { let t = epochMs; return { now: () => t, advance: (ms) => (t += ms) } }
export const deterministicIdProvider = (clock) =>
  m0UuidV7({ clock })   // M0 service (Doc-4B / Doc-6A §3 / Doc-6B core.id_sequences) fed the seeded clock — ERR-8A-1 anchor
```

## §7 — Out-of-Wire Mock Boundary + Outbox Observer *(hermeticity + Band-F enabler)*

### §7.1 The six mocked boundaries [Doc-8A §10.3 binding / `CHK-8-072`]
No suite reaches a live external service. Each out-of-wire boundary is a **simulated, disposable double** (never live — R12):

| Boundary | Double behavior [Doc-8B choice] |
|---|---|
| Supabase **Storage** | returns a deterministic `file_ref`/path; holds no binary; the contract-mediated path is asserted against the double (the UI/service holds a `file_ref`, never a blob — Doc-2 §9) |
| Supabase **Realtime** | a transport stub; emits nothing authoritative; suites assert the contract effect, not a live channel |
| **Resend** (email) | captures the send call (recipient/template/payload) for assertion; sends nothing |
| **PostHog** (analytics) | captures events for assertion; no network |
| **Inngest** (dispatch) | the controlled-dispatch double (§7.2) — no live async runtime |
| **M9 AI** providers | returns canned/regenerable responses; never a live model call (advisory-only — Invariant #12) |

A "mock" that reaches the real service is **not a mock** (§ structure fence). The contract-mediated path (e.g. produce a `file_ref` without a live Storage call) is what the consuming suites assert against.

### §7.2 Deterministic outbox observer / drainer [Band-F enabler — `Doc-6A §7` / `Doc-4L` binding]
The harness lets a Band-F suite (Doc-8F) assert the transactional write-plus-emit and the dispatch lifecycle **without a live async runtime**:

- **(a) Inspect** — read `core.outbox_events` rows after a transaction, so a suite asserts a business write **and** its outbox insert committed or rolled back **together** (`CHK-8-051`). This consumes the Pass-1 §3 **savepoint/schema-reset opt-out** (atomicity needs a real commit boundary, not the rollback-everything default).
- **(b) Drain (controlled "dispatch tick")** — feed `pending` outbox rows to the **mocked Inngest double**, advancing them through the realized lifecycle `pending → dispatched → archived` (`Doc-6A §7`), so a suite asserts the lifecycle + the `Doc-4L` fan-out (the right consumers invoked, no more/fewer — `CHK-8-052`). The tick is explicit and deterministic; nothing dispatches by real elapsed time.

Illustrative observer **[Doc-8B choice]**:

```ts
// illustrative; convention [Doc-6A §7 / Doc-4L] = inspect committed outbox + controlled dispatch tick
export const outbox = {
  pending: (tx) => tx.query(`select * from core.outbox_events where dispatch_status = 'pending'`),
  tick: async (tx) => { /* feed pending rows to the mocked Inngest double; advance pending->dispatched->archived */ },
}
```

## §8 — CI Merge-Gate Wiring

**[Doc-8A §10.4/§10.5/§3.4 binding / `CHK-8-073`]:** the CI gate **blocks merge on any red conformance suite**, running every **applicable** Appendix-A band per suite (band applicability per Doc-8A Appendix A).

- **Never-weaken counts as red [Doc-8A §3.4 binding]:** a **skipped, relaxed, `.only`-narrowed, or deleted** conformance test is treated as a **red** — the gate inspects for suppressed assertions (e.g. fails the run if a conformance file contains `.skip`/`.only` or a coverage band reports fewer cases than its manifest). A green achieved by suppression is a defect, not a pass.
- **Necessary, not sufficient [CLAUDE.md §8 binding]:** passing the gate does **not** by itself authorize a merge — AI-generated code also clears **AI Coding Supervisor or human review**; **architecture-affecting artifacts require human approval** (CLAUDE.md §8). The gate and the review are independent; neither substitutes for the other.
- **Determinism enforced [Doc-8A §10.2 binding]:** the gate runs hermetically (no external network — §7) with the seeded clock/ID provider (§6); a flaky result is a defect to fix, never a re-run-until-green.

Illustrative gate posture **[Doc-8B choice]** (convention = block on red + suppressed-assertion detection + hermetic):

```yaml
# illustrative; convention [Doc-8A §10.4] = block merge on red; suppressed conformance test = red; hermetic
test-gate:
  run: vitest run && playwright test           # all applicable bands
  forbid: ['.only', '.skip in conformance/**']  # suppressed assertion = red (Doc-8A §3.4)
  network: none                                 # hermetic (§7)
  blocks_merge: true                            # necessary; AI-code review still required (CLAUDE.md §8)
```

## §9 — Conformance & Carried Items

**Doc-8B conformance attestation against the Doc-8A Appendix-A applicable bands:**

| Band | Disposition |
|---|---|
| **H** — isolation/determinism/CI (`CHK-8-070…074`) | **Doc-8B realizes directly** — per-test isolation (§3), seeded clock + deterministic ID (§6), hermetic mock boundary (§7), CI merge-gate (§8), ≥2-org/through-contracts seeding (§4/§5, `CHK-8-074`) |
| **I** — out-of-test (`CHK-8-080/081`) | **Doc-8B realizes directly** — ephemeral disposable DB + doubles (§3/§7); the harness owns no production state, authors no contract (R12) |
| **A** — oracle-by-pointer | **N/A** — the harness authors no assertion (satisfied by the consuming suites) |
| **B–G** — discipline assertions | **N/A** — the harness provides the means those suites assert with |

**Carried register [by pointer]:** `DR-8-HARNESS` **satisfied** (Doc-8B is the provider; consumed by Doc-8C…8G by pointer); `[ESC-8-TOOLING]` **RESOLVED** (D1 — Vitest + Playwright + TS-native SQL; recorded at the Doc-8A manifest); `ERR-8A-1` **honored** (§6 corrected ID anchor); `[ESC-8-API]`/`[ESC-8-CORPUS]`/`[ESC-8-POLICY]` surface only if a suite uncovers a gap (named channel, never local). Doc-8B coins nothing and authors no discipline assertion.

---

## Pass-2 self-check (pre-review)

- **Reference-never-restate:** conventions bound by pointer — `Doc-8A §4.1/§4.3/§10.2/§10.3/§10.4/§10.5/§3.4` + Appendix A bands H/I; `Doc-2 §6/§9`; `Doc-6C` (tenant tables); `Doc-6B core.id_sequences`/`Doc-4B`/`Doc-6A §3` (ID — ERR-8A-1); `Doc-6A §7` (outbox lifecycle); `Doc-4L` (fan-out); CLAUDE.md §2/§5/§8; Invariants #2/#5/#12. **Nothing invented.**
- **Binding vs choice tagged:** every convention [Doc-8A binding]; every snippet/helper/config-field [Doc-8B choice], illustrative not frozen.
- **Mechanism only / no discipline assertion:** §5–§8 provide means (seeders, clock, doubles, observer, gate); they author no `expect(...)` about domain behavior.
- **Pass-1 fixes carried:** §7.2 consumes the Pass-1 §3 savepoint/schema-reset opt-out (MINOR-1); seeding uses realized seed paths (MINOR-2).
- **Coins nothing:** 0 new contract/field/state/event/audit/POLICY key/expected value.
- **Open for review:** confirm `core.outbox_events.dispatch_status` lifecycle labels (`pending/dispatched/archived`) trace to `Doc-6A §7`/`Doc-6B` verbatim (not coined); confirm the six-boundary list matches CLAUDE.md §2 exactly.

*End of Content Pass-2 (§5–§9) — DRAFT. Realizes `Doc-8B_Structure_v1.0_FROZEN` §5–§9. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → SERIES_FROZEN.*
