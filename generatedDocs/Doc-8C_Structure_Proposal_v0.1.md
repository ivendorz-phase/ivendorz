# Doc-8C — Contract & API Conformance Suite — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-8C artifact. Next: Independent Hard Review (Board) → Structure Patch → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Supersedes | — (first Doc-8C artifact) |
| Program | **Doc-8 — Test & Conformance Realization.** Doc-8C is the **Contract & API Conformance suite** — the discipline suite that proves every wired Doc-5x contract conforms to the frozen API surface. Consumes the frozen **Doc-8B harness** by pointer (DR-8-HARNESS) |
| Document | **Doc-8C** — realizes `Doc-8A §5` (contract-conformance conventions) + Appendix A **Band B** (`CHK-8-010…015`) + **Band A** (oracle-by-pointer) as an executable, **table-driven** conformance suite over the frozen Doc-5 caller-facing surface |
| Realizes | `Doc-8A_SERIES_FROZEN_v1.0` §5 + Appendix A bands A/B. **Oracle (the *what* under test):** the frozen **Doc-5 API surface** `Doc-5B…5K` (every wired contract's `§HB` field/error/validation) + `Doc-5A §5.6` (envelope) / `§6.2` (error taxonomy) / `§8` (cursor pagination) + `Doc-4A §9.7` (prohibited request fields) + `Doc-3 §12` (`*.list_page_size_max`, `*.idempotency_dedup_window`). Consumes `Doc-8B` (runner, fixtures, seeding, clock/ID, mock boundary, CI gate) by pointer |
| Authority | `Doc-8A` governs (test metastandard); the frozen corpus + the frozen Doc-5 surface are the oracle. Doc-8C is a Doc-8 realization document (below Doc-8A; beside Doc-8B/8D…8G); **coins nothing** and **asserts only Doc-5-declared behavior** (a red test = code defect, or `[ESC-8-API]`/`[ESC-8-CORPUS]` — never weaken the assertion) |
| Contains | Structure only — the ratified decisions (C1 table-driven; C2 wired-only scope), the suite section map §0–§9, carried items. **No test code, no per-contract cases** — those land in the Doc-8C content passes |
| Audience | Architecture Board · API Governance · QA/Test lead · Doc-8C content authors · backend/CI engineering |
| Program note | Doc-8C introduces **no contract, field, error class, status, header, slug, or expected value**. It asserts the frozen Doc-5 surface. On any gap (a contract untestable as written): **flag-and-halt** → `[ESC-8-API]` (additive Doc-5x patch, Board) — never coin, never relax |

> **Governing rule:** Doc-8C **realizes, never re-decides, never re-specifies.** Doc-5 fixed *what* each contract is (FROZEN — every field, error, status, pagination/idempotency rule); Doc-8C realizes *how each is proven conformant*. Every assertion is an **oracle-by-pointer** into a frozen `Doc-5x` contract; no assertion is stricter or looser than its contract (Doc-8A §3.3).

---

## Decisions proposed for ratification at structure freeze

- **C1 — Table-driven / parameterized over the frozen Doc-5 contract inventory (provable coverage).** Doc-8C is **not** hand-written per contract. It is a **registry-driven** suite: the frozen Doc-5 caller-facing contracts form a **contract inventory** (built from `Doc-5B…5K` — every contract by its identifier, method, path, actor, list-vs-command, idempotent-or-not, `§HB` pointer), and each applicable Band-B check (`CHK-8-010…015`) runs **over every inventory row**. This makes coverage **provable and complete** — a frozen contract with no inventory row is a coverage gap the suite itself detects (a completeness check). The inventory is derived from the frozen contracts, **coins nothing** (it references, never invents). *(Alternative: hand-written per-contract test files. Rejected — ~300 contracts, unprovable coverage, drift risk. Table-driven is the proposed shape; Board ratifies.)*
- **C2 — Scope = the wired, caller-facing Doc-5 surface; out-of-wire is N/A to Band B.** Band B (envelope/pagination/error/idempotency/prohibited-field/actor-scope) applies to **wired, caller-facing HTTP contracts**. **Out-of-wire contracts** — M0 `core` (R1 boundary, no wire), M3 engine workers (`Doc-5E` 8 System workers), M5/M7 internal services (`resolve_entitlements`/`enforce_quota`, score calculators), M9 advisory reads where out-of-wire — are **not HTTP-surface** and are **N/A to Band B**; their conformance is asserted by their owning discipline (Doc-8F integration / Doc-8D persistence / Doc-8E domain). Doc-8C's inventory **flags each contract wired-or-out-of-wire** (from the owning `Doc-5x` partition) and asserts Band B only over the wired set; out-of-wire rows are recorded **N/A with their owning-suite pointer** (no silent omission).

---

## §0 — Control, Precedence & the Doc-8A/Doc-8B Binding
- **Purpose:** Doc-8C's place (below Doc-8A; consumes Doc-8B by pointer; beside 8D…8G); realize-never-redecide-never-respecify; the oracle = the frozen Doc-5 surface; the freeze obligation — pass Appendix A **Bands A + B** (`CHK-8-001…003`, `CHK-8-010…015`) and clear any `[ESC-8-*]` via its named channel. Doc-8C authors no contract; it asserts frozen ones.
- **Dependencies:** `Doc-8A §0/§5/Appendix A`; `Doc-8B` (harness); `Doc-5 Governance Note §8`. **Detail:** short, normative.

## §1 — Scope & the Contract Inventory
- **Purpose:** define the **contract inventory** (C1) — every frozen Doc-5 caller-facing contract from `Doc-5B…5K`, each row carrying: identifier, method/path, actor (User/Admin/System/anonymous), list-vs-command, idempotent-or-not, wired-vs-out-of-wire (C2), and the `§HB` oracle pointer. The inventory is **derived from the frozen contracts** (reference-never-restate) and is the spine the Band-B checks parameterize over. State the wired-only Band-B scope (C2) and the per-row N/A recording for out-of-wire.
- **Dependencies:** `Doc-5B…5K` (the frozen contracts); `Doc-8A §5`. **Detail:** inventory schema + scope boundary.

## §2 — Table-Driven Conformance Design *(C1 — mechanism)*
- **Purpose:** realize the parameterized design: each Band-B check is a function over an inventory row; the runner (Vitest — Doc-8B D1) iterates the inventory, applying every **applicable** check per row (applicability from the row's flags: list-only checks skip commands, idempotency-only checks skip non-idempotent, etc.). Include the **completeness check** — every frozen Doc-5 contract has exactly one inventory row (a missing/extra row fails the suite). No case is hand-authored per contract; the design coins nothing.
- **Dependencies:** `Doc-8B` (runner/fixtures); `Doc-8A §3.2` (oracle-by-pointer). **Detail:** table-driven mechanism + completeness check.

## §3 — Envelope Conformance *(`CHK-8-010`)*
- **Purpose:** assert every wired contract's response against the canonical envelope (`Doc-5A §5.6`) — shape, success/error discriminant, metadata block — by pointer; a deviation is a code defect. 204/no-body exemptions per the frozen rule (`Doc-4A §22.1 C-05` reference_id-on-body-bearing; 204 exempt — by pointer).
- **Dependencies:** `Doc-5A §5.6`; `Doc-4A §22.1`. **Detail:** envelope assertion convention.

## §4 — Cursor-Pagination Conformance *(`CHK-8-011`)*
- **Purpose:** assert every **list** contract against the cursor grammar (`Doc-5A §8`): opaque cursor, deterministic sort key, forward/back; the page-size ceiling read from **`*.list_page_size_max`** (`Doc-3 §12`, by pointer — never a literal); boundary cases (at/above/below the bound). The deterministic-sort-key **index** is a Doc-8D (`Doc-6A §10`) concern, cross-referenced.
- **Dependencies:** `Doc-5A §8`; `Doc-3 §12`; `Doc-6A §10` (cross-ref). **Detail:** pagination assertion convention.

## §5 — Error-Taxonomy Conformance *(`CHK-8-012`)*
- **Purpose:** assert every error path maps to a `Doc-5A §6.2` error class **at its fixed HTTP status**; the suite asserts the class+status pair, never an invented class or re-mapped status (Doc-8A §3.2/§3.3). A needed-but-missing class is `[ESC-8-API]` (flag-and-halt), never coined.
- **Dependencies:** `Doc-5A §6.2`. **Detail:** error-taxonomy assertion convention.

## §6 — Idempotency Conformance *(`CHK-8-013`)*
- **Purpose:** assert every **idempotent mutation** contract: a replay inside **`*.idempotency_dedup_window`** (`Doc-3 §12`, by pointer) yields the deduplicated result, not a double-effect; the dedup persistence it relies on is a Doc-8D (`Doc-6A §10`) concern, cross-referenced. Non-idempotent contracts are N/A (inventory flag).
- **Dependencies:** `Doc-3 §12`; `Doc-6A §10` (cross-ref); the frozen idempotency declarations. **Detail:** idempotency assertion convention.

## §7 — Prohibited-Request-Field Conformance *(`CHK-8-014`)*
- **Purpose:** assert every contract **rejects** the prohibited request-field categories (`Doc-4A §9.7`): attribution, audit, tenant-selection, authorization, ownership-change, lifecycle-state, governance signals, soft-delete-as-direct-write, `human_ref`-as-reference, inline tunable limits. A contract accepting a prohibited client-supplied value is a code defect (these are server-owned).
- **Dependencies:** `Doc-4A §9.7` (CHK-087 categories). **Detail:** prohibited-field assertion convention.

## §8 — Actor-Scope & Field-Trace Conformance *(`CHK-8-015`)*
- **Purpose:** assert reads are **actor-scoped per the owning Doc-4x** (a contract returns no rows outside the caller's actor scope — User/Admin/System/anonymous, including the tri-actor public surface `Doc-5D` and the Admin no-active-org surface `Doc-5J`); every request/response field **traces verbatim to its `§HB` contract** (a field with no `§HB` source is a coined expectation — forbidden). Cross-tenant non-disclosure at the data layer is Doc-8D's gate (cross-ref), not re-asserted here.
- **Dependencies:** the owning `Doc-4x §HB`; `Doc-5C R2`/`Doc-5D`/`Doc-5J` (actor models); `Doc-8A §5.6`. **Detail:** actor-scope + field-trace convention.

## §9 — Conformance & Carried Items
- **Purpose:** Doc-8C's self-check against Appendix A **Bands A + B**; the **coverage attestation** (every frozen wired Doc-5 contract has an inventory row + every applicable check; out-of-wire rows N/A-recorded with owning-suite pointer); the carried register (`DR-8-CONTRACT` it satisfies as the Doc-5 testability cross-check; `[ESC-8-API]` for an untestable contract; `[ESC-8-CORPUS]` for a genuine Doc-5 defect — never weaken). State that Doc-8C coins nothing and asserts only Doc-5-declared behavior.
- **Dependencies:** `Doc-8A Appendix A` (A/B); `Doc-5B…5K`. **Detail:** attestation + coverage + carried register.

---

## Open Carried Items

| ID | Item | Doc-8C handling | Freeze gate? |
|---|---|---|---|
| **DR-8-HARNESS** | Doc-8C consumes the Doc-8B harness | By pointer; re-authors no fixture/mock/clock/gate | **Consumed** |
| **DR-8-CONTRACT** | The frozen Doc-5 surface must be testable as written | Doc-8C **is** the cross-check (C1 coverage); `[ESC-8-API]` on a gap | **Satisfied here (per-contract at content)** |
| `[ESC-8-API]` | A frozen Doc-5x contract not testable as written (missing observable, ambiguous error mapping, untestable idempotency) | Cited by pointer; additive Doc-5x patch (Board, human-approved); never relaxed locally | **Per-content: possible** |
| `[ESC-8-CORPUS]` | A test reveals a genuine Doc-5/Doc-4 defect | Flag-and-halt → Board additive patch at the owning doc; the test is never weakened | **Per-content: possible** |
| `[ESC-8-POLICY]` | A bound referencing an unregistered POLICY key | By intended name; additive `Doc-3 §12.2` patch; never coined | **Per-content: possible** |

## Fences / Out of scope

Authoring the harness (Doc-8B — consumed by pointer) · other disciplines (persistence/RLS = Doc-8D; domain/invariant = Doc-8E; integration/event = Doc-8F; frontend/e2e = Doc-8G) · coining any contract/field/error/status/header/slug/expected value · changing any frozen Doc-5/Doc-4 declaration · weakening an assertion to pass (`[ESC-8-CORPUS]` instead) · asserting cross-tenant RLS byte-equivalence (Doc-8D's gate) · asserting out-of-wire/internal-service contracts as HTTP surface (C2 — their owning discipline) · the implementation Code under test (downstream).

---

## Provenance & next steps

- **Provenance:** first Doc-8C artifact. Realizes `Doc-8A §5 + Appendix A bands A/B`; consumes `Doc-8B`; oracle = the frozen Doc-5 surface (`Doc-5A…5K`). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. C1 (table-driven), C2 (wired-only scope); section map §0–§9; carried items registered.
- **Next in the lifecycle (Board loop):** Independent Hard Review → Structure Patch → short re-review → Structure Freeze Audit → `Doc-8C_Structure_v1.0_FROZEN` → Doc-8C content passes (the per-check conventions + the contract-inventory realization). Oracle-ready now (Doc-5 FROZEN; Doc-8B harness FROZEN); execution awaits the application code, but the suite design + coverage freeze now.

*End of Doc-8C Canonical Structure **Proposal v0.1** — structure only. On any conflict, the frozen Doc-5 surface + Doc-8A + the corpus win; flag-and-halt — never weaken an assertion. Doc-8C realizes a table-driven conformance suite over the frozen Doc-5 caller-facing surface; consumes the Doc-8B harness; coins nothing. Next: Independent Hard Review.*
