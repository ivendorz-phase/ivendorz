# Doc-8C — Contract & API Conformance Suite — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26). Effective = `Doc-8C_Structure_Proposal_v0.1` + `Doc-8C_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8C = the **Contract & API Conformance suite**; consumes the frozen **Doc-8B harness** by pointer (DR-8-HARNESS) |
| Document | **Doc-8C** — realizes `Doc-8A §5` + Appendix A bands **A/B** as a **table-driven** conformance suite over the frozen Doc-5 caller-facing surface |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0` §5 + Appendix A bands A/B. **Oracle:** the frozen Doc-5 surface (`Doc-5B…5K` `§HB`) + `Doc-5A §5.6`/`§6.2`/`§8` + `Doc-4A §9.7`/§22.1 + `Doc-3 §12`. Consumes `Doc-8B` (runner/fixtures/seeding/clock-ID/mock-boundary/CI-gate) by pointer |
| Authority | `Doc-8A` governs; the frozen corpus + frozen Doc-5 surface are the oracle. Doc-8C **coins nothing** and **asserts only Doc-5-declared behavior** — a red test = code defect, or `[ESC-8-API]`/`[ESC-8-CORPUS]` (never weaken the assertion) |
| Contains | Structure only — C1 (table-driven) + C2 (wired-only scope), section map §0–§9, carried items. **No test code, no per-contract cases** — those land in the content passes |
| Program note | Doc-8C introduces **no contract, field, error class, status, header, slug, or expected value**. On any gap (a contract untestable as written): flag-and-halt → `[ESC-8-API]` (additive Doc-5x patch, Board) — never coin, never relax |

> **Governing rule:** Doc-8C realizes, never re-decides, never re-specifies. Every assertion is an oracle-by-pointer into a frozen `Doc-5x`; no assertion is stricter or looser than its contract (Doc-8A §3.3).

---

## Ratified decisions

- **C1 — Table-driven / parameterized over the frozen Doc-5 contract inventory (provable coverage).** Doc-8C is registry-driven, not hand-written per contract. The **contract inventory** is **derived from the frozen per-module Doc-5x contract enumerations** (`Doc-5B…5K` — the authoritative lists; coverage target counts: `Doc-5C` 42 · `Doc-5D` 71 · `Doc-5E` 38 · `Doc-5F` 50 · `Doc-5G` 40 · `Doc-5H` 23 · `Doc-5I` 33 · `Doc-5J` 34 · `Doc-5K` 16 · `Doc-5B` out-of-wire), cross-checked against the **`Doc-5A_Content_v1.0_Pass10 §B.1`** route-registry namespace/path grammar, and — once code exists — against the **`generated-contracts-registry/`** (CLAUDE.md §10). Each inventory row carries: identifier, method/path, actor, list-vs-command, idempotent-or-not, wired-vs-out-of-wire, `§HB` oracle pointer. Each applicable Band-B check runs **over every wired row**. The inventory is **never hand-maintained as an independent list** — it is derived from the frozen surface; it coins nothing.
- **C2 — Scope = the wired, caller-facing Doc-5 surface; out-of-wire is N/A to Band B.** Band B (envelope/pagination/error/idempotency/prohibited-field/actor-scope) is **HTTP-surface-specific** and applies to **wired caller-facing contracts**. **Out-of-wire** contracts — M0 `core` (R1 boundary), `Doc-5E` 8 System engine workers, `Doc-5I R10` internal services (`resolve_entitlements`/`enforce_quota`), score calculators, out-of-wire M9 reads — are **N/A to Band B**; their conformance is asserted by their owning discipline (Doc-8F integration / Doc-8D persistence / Doc-8E domain). Each out-of-wire row is **N/A-recorded with its owning-suite pointer** (no silent omission). Applying an HTTP-envelope assertion to a non-wire internal service would be a category error.

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8C's place (below Doc-8A; consumes Doc-8B by pointer; beside 8D…8G); realize-never-redecide-never-respecify; oracle = the frozen Doc-5 surface; freeze obligation — pass Appendix A **Bands A + B** (`CHK-8-001…003`, `CHK-8-010…015`) and clear any `[ESC-8-*]` via its named channel. Authors no contract.
- **Dependencies:** `Doc-8A §0/§5/Appendix A`; `Doc-8B`; `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Contract Inventory
- **Purpose:** the **inventory** (C1) — every frozen Doc-5 caller-facing contract from `Doc-5B…5K`, each row carrying identifier/method/path/actor/list-vs-command/idempotent/wired-vs-out-of-wire/`§HB` pointer; **derived from the frozen Doc-5x enumerations** (reference-never-restate), cross-checked against `Doc-5A Pass10 §B.1` (and `generated-contracts-registry/` once code exists). The inventory is the spine the Band-B checks parameterize over; wired-only Band-B scope (C2); out-of-wire rows N/A-recorded with owning-suite pointer.
- **Dependencies:** `Doc-5B…5K`; `Doc-5A Pass10 §B.1`; `Doc-8A §5`. **Detail:** inventory schema + scope boundary + source-of-truth anchor.

## §2 — Table-Driven Conformance Design *(C1 — mechanism)*
- **Purpose:** the parameterized design — each Band-B check is a function over an inventory row; the runner (Vitest — Doc-8B D1) iterates the inventory, applying every **applicable** check per row (applicability from the row flags). The **completeness check** asserts **inventory ≡ the frozen Doc-5x enumerations** (every frozen contract present, none invented, each flagged wired/out-of-wire); a divergence fails the suite. No per-contract case is hand-authored.
- **Dependencies:** `Doc-8B` (runner/fixtures); `Doc-8A §3.2`; `Doc-5B…5K` (the frozen enumerations). **Detail:** table-driven mechanism + completeness ≡ frozen surface.

## §3 — Envelope Conformance *(`CHK-8-010`)*
- **Purpose:** assert every wired contract's response against the canonical envelope (`Doc-5A §5.6`) by pointer; 204/no-body exemptions per `Doc-4A §22.1 C-05` (reference_id on body-bearing; 204 exempt).
- **Dependencies:** `Doc-5A §5.6`; `Doc-4A §22.1`. **Detail:** envelope assertion convention.

## §4 — Cursor-Pagination Conformance *(`CHK-8-011`)*
- **Purpose:** assert every **list** contract against the cursor grammar (`Doc-5A §8`): opaque cursor, deterministic sort key, forward/back; page-size ceiling from **`*.list_page_size_max`** (`Doc-3 §12`, by pointer, never a literal); boundary cases. The deterministic-sort-key **index** is a Doc-8D (`Doc-6A §10`) concern, cross-referenced.
- **Dependencies:** `Doc-5A §8`; `Doc-3 §12`; `Doc-6A §10` (cross-ref). **Detail:** pagination assertion convention.

## §5 — Error-Taxonomy Conformance *(`CHK-8-012`)*
- **Purpose:** assert every error path maps to a `Doc-5A §6.2` class **at its fixed HTTP status** (class+status pair); never an invented class or re-mapped status (Doc-8A §3.2/§3.3); a needed-but-missing class is `[ESC-8-API]` (never coined).
- **Dependencies:** `Doc-5A §6.2`. **Detail:** error-taxonomy assertion convention.

## §6 — Idempotency Conformance *(`CHK-8-013`)*
- **Purpose:** assert every **idempotent mutation**: a replay **keyed per the frozen idempotency mechanism** (`Doc-4A` idempotency-key header / request-identity rule, by pointer) inside **`*.idempotency_dedup_window`** (`Doc-3 §12`) yields the deduplicated result, not a double-effect; the dedup persistence is a Doc-8D (`Doc-6A §10`) concern, cross-referenced. Non-idempotent contracts N/A (inventory flag).
- **Dependencies:** `Doc-4A` (idempotency-key); `Doc-3 §12`; `Doc-6A §10` (cross-ref). **Detail:** idempotency assertion convention; key mechanism bound.

## §7 — Prohibited-Request-Field Conformance *(`CHK-8-014`)*
- **Purpose:** assert every contract **rejects** the prohibited request-field categories (`Doc-4A §9.7`: attribution, audit, tenant-selection, authorization, ownership-change, lifecycle-state, governance signals, soft-delete-as-direct-write, `human_ref`-as-reference, inline tunable limits) — server-owned fields a caller may not set.
- **Dependencies:** `Doc-4A §9.7` (CHK-087 categories). **Detail:** prohibited-field assertion convention.

## §8 — Actor-Scope & Field-Trace Conformance *(`CHK-8-015`)*
- **Purpose:** assert reads are **actor-scoped per the owning Doc-4x** (no rows outside the caller's actor scope — User/Admin/System/anonymous; tri-actor `Doc-5D`; Admin no-active-org `Doc-5J`); every field **traces verbatim to its `§HB` contract** (no `§HB` source = coined, forbidden). **Seam:** Doc-8C asserts contract-declared actor scope at the **API surface**; the **RLS backstop enforcement + cross-tenant byte-equivalence** are **Doc-8D's** gate (`Doc-6A R8/§4`), cross-referenced, not re-asserted — one behavior, two layer-checks.
- **Dependencies:** owning `Doc-4x §HB`; `Doc-5C R2`/`Doc-5D`/`Doc-5J`; `Doc-8A §5.6`; `Doc-6A R8/§4` (cross-ref). **Detail:** actor-scope + field-trace + seam.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-8C's self-check against Appendix A **Bands A + B**; the **coverage attestation** (inventory ≡ frozen wired Doc-5 surface + every applicable check; out-of-wire N/A-recorded with owning-suite pointer); the carried register (`DR-8-CONTRACT` satisfied — Doc-8C is the Doc-5 testability cross-check; `[ESC-8-API]`; `[ESC-8-CORPUS]` — never weaken; `[ESC-8-POLICY]`). Coins nothing.
- **Dependencies:** `Doc-8A Appendix A` (A/B); `Doc-5B…5K`. **Detail:** attestation + coverage + carried register.

---

## Open Carried Items

| ID | Item | Doc-8C handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8C consumes the Doc-8B harness | By pointer; re-authors nothing | **Consumed** |
| **DR-8-CONTRACT** | The frozen Doc-5 surface must be testable as written | Doc-8C **is** the cross-check (C1 coverage ≡ frozen surface); `[ESC-8-API]` on a gap | **Satisfied here (per-contract at content)** |
| `[ESC-8-API]` | A frozen Doc-5x contract not testable as written | By pointer; additive Doc-5x patch (Board); never relaxed locally | **Per-content: possible** |
| `[ESC-8-CORPUS]` | A test reveals a genuine Doc-5/Doc-4 defect | Flag-and-halt → Board additive patch; test never weakened | **Per-content: possible** |
| `[ESC-8-POLICY]` | A bound referencing an unregistered POLICY key | By intended name; additive `Doc-3 §12.2` patch; never coined | **Per-content: possible** |

## Fences / Out of scope

The harness (Doc-8B — consumed) · other disciplines (8D/8E/8F/8G) · coining any contract/field/error/status/header/slug/expected value · changing any frozen Doc-5/Doc-4 declaration · weakening an assertion (`[ESC-8-CORPUS]` instead) · asserting cross-tenant RLS byte-equivalence (Doc-8D) · asserting out-of-wire/internal-service contracts as HTTP surface (C2) · the implementation Code under test (downstream).

---

## Provenance & status

- **Provenance:** first Doc-8C artifact, structure-frozen. Realizes `Doc-8A §5 + bands A/B`; consumes `Doc-8B`; oracle = the frozen Doc-5 surface. Independent Hard Review (1 MAJOR + 1 MINOR + 1 NIT; 1 REJECTED) + Structure Patch + short re-review + Structure Freeze Audit PASS. No frozen document edited; nothing coined.
- **Status:** **FROZEN v1.0** — structure only. C1 (table-driven, inventory ≡ frozen surface), C2 (wired-only scope); section map §0–§9.
- **Next:** Doc-8C content passes (per-check conventions + inventory realization), each through the Board loop.

*End of Doc-8C Canonical Structure **v1.0 FROZEN**. On any conflict, the frozen Doc-5 surface + Doc-8A + the corpus win; flag-and-halt — never weaken an assertion. Doc-8C realizes a table-driven conformance suite over the frozen Doc-5 caller-facing surface; coverage ≡ the frozen surface; consumes the Doc-8B harness; coins nothing.*
