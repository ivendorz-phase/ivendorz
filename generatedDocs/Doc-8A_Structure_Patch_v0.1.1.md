# Doc-8A — Structure **Patch v0.1.1** (Independent Hard Review disposition)

| Field | Value |
|---|---|
| Patches | `Doc-8A_Structure_Proposal_v0.1.md` |
| Against | `Doc-8A_Structure_Independent_Hard_Review_v0.1.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied** — 2 MAJOR + 2 MINOR + 2 NITPICK + 1 OBSERVATION dispositioned (all FIXED); 1 finding REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → freeze-ready pending short re-review |
| Method | Additive structure patch — no frozen document edited; nothing coined. Effective Doc-8A structure = `Proposal_v0.1` **as amended by this patch** |

---

## Disposition of findings

### MAJOR-1 — migration-test obligation (Doc-6A §11) orphaned → **FIXED**
**Change (partition table, Doc-8D row):** Doc-8D is renamed and its scope widened from *"Persistence & RLS Conformance"* to **"Persistence, Migration & RLS Conformance."** Its "Realizes" cell now reads:

> Schema-constraint conformance (standard columns, partial-unique `WHERE deleted_at IS NULL`, CHECK constraints, immutability triggers, soft-delete, multi-currency); **migration conformance — forward-only sequencing, expand-contract / non-destructive on authoritative tables (Invariant #8; destructive only on the `ai.*` cache — `Doc-6A §11`), seed-migration verification (POLICY keys + role seeds), and Prisma-codegen integrity (`generated-contracts-registry/`)**; and the **load-bearing RLS positive/negative/cross-tenant byte-equivalence gate** (R6).

**Change (§6 title/scope):** §6 renamed *"Persistence, Migration & RLS Conformance Realization"*; a migration clause added: *"realize migration conformance per `Doc-6A §11` — forward-only, expand-contract, non-destructive on authoritative tables, seed-migration + codegen-integrity verification."* **Change (Appendix A, persistence/RLS band):** add check *"migration forward-only / expand-contract / non-destructive-on-authoritative / seed + codegen-integrity asserted (`Doc-6A §11`)."* No realization layer is now orphaned.

### MAJOR-2 — cross-cutting conformance concerns split with no single-defining owner → **FIXED**
**Change (new sub-table appended to the partition, the Doc-7A MAJOR-1 precedent):**

> **Cross-cutting conformance-concern allocation** — each concern is asserted **once** in its defining suite; composing suites **invoke** that assertion, never re-implement it (One-Owner-at-the-suite-layer):
>
> | Cross-cutting concern | Single defining suite | Composing suites (exercise, never redefine) |
> |---|---|---|
> | RLS positive/negative/cross-tenant byte-equivalence (R6) | **Doc-8D** (persistence — at the data layer) | Doc-8G (re-asserts the same gate at the UI per Doc-7 R8) |
> | Non-disclosure (`buyer_vendor_statuses`/`link_suggestions` never observable; Invariant #11) | **Doc-8D** (the canonical byte-equivalence assertion) | Doc-8C (contract-response equivalence), Doc-8G (UI equivalence) |
> | 5-signal governance firewall (R7) | **Doc-8E** (domain/firewall — the canonical assertion) | Doc-8C (where a signal crosses a contract), Doc-8F (where a signal flows via events) |
> | Each Core Invariant (R7) | **Doc-8E** | the suite where the invariant is naturally exercised (invokes 8E's assertion) |
> | State-machine conformance (R8) | **Doc-8E** | Doc-8C/8F (transition-triggering contracts/events) |
>
> A composing suite **imports/invokes** the defining suite's assertion helper; it does not author a second copy. Genuinely-unresolved allocations carry `[ESC-8-SCOPE]`.

**Change (cross-discipline note):** reworded to state "asserted **once** in the defining suite, exercised by composing suites" rather than implying parallel authorship.

### MINOR-1 — RLS-gate anchor conflated `Doc-6A §11` (migration) with R8/§4 (RLS) → **FIXED**
**Change:** every RLS-gate citation (R6, §6, Appendix A persistence/RLS band) now reads **`Doc-6A R8 / §4`** (the verified RLS-gate delegation, frozen lines 32/77). The `Doc-6A §11` citation now appears **only** in the migration-conformance scope (MAJOR-1). Editorial note added: *"the roadmap's `§4.4/§11.5` are Doc-6A content-pass subsection numbers; the structure-level anchors are R8/§4 (RLS) and §11 (migration)."*

### MINOR-2 — "seedable UUIDv7" imprecise → **FIXED**
**Change (R11 + §4):** *"seedable UUIDv7 ID source"* → **"a deterministic ID provider — the M0 UUIDv7 service (`Doc-4B`; deterministic per `Doc-6A §7`) fed the seeded test clock — or fixed-UUID fixtures where an assertion pins a specific ID."** The seedable-clock requirement is retained as the root of determinism.

### NITPICK-1 — R3 names candidate frameworks in the R-set body → **FIXED (APPLIED)**
**Change:** R3's body now states only the principle (*"TypeScript test tooling over the fixed Master-Architecture runtime; the specific frameworks are an implementation choice ratified at freeze or carried via `[ESC-8-TOOLING]`"*). The candidate list (Vitest/Jest · Playwright · pgTAP/transactional-SQL · a11y/visual path) moves wholesale into the **`[ESC-8-TOOLING]`** carried-item row. R-set stays coinage-clean.

### NITPICK-2 — "above Code" risks reading as defining behavior → **FIXED (APPLIED)**
**Change (authority row + §0):** added clause — *"Doc-8 is a **downward gate** over implementations (Code and the Doc-5/6/7 realizations must pass its suites to merge) and **upward-subordinate** to its oracle (it asserts only corpus-declared behavior, never defines it — governance §3/§8 rule 5); the gate is **necessary, not sufficient** — AI-generated code also clears AI Coding Supervisor/human review (CLAUDE.md §8)."*

### OBSERVATION-1 — per-suite oracle-readiness → **FIXED (APPLIED)**
**Change (§1 + the Provenance sequencing note):** the note now states per-suite oracle-readiness — **8A/8B/8C/8E oracle-ready now** (Doc-5 frozen; Doc-2/3/4M + invariants frozen); **8D/8F/8G partly await** their oracle (Doc-6 mid-program — only 6B frozen; Doc-7 only 7A structure-frozen). Freeze order follows oracle availability.

### REJECTED finding — upheld
The "conformance harness vs subordinate-to-oracle = contradiction" challenge stays **REJECTED as false** (two different relations — downward gate vs upward subordination; governance §3/§8 rule 5). Only the NITPICK-2 clarifying clause is added.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 2 | **0** |
| MINOR | 2 | **0** |
| NITPICK | 2 | 0 (both applied) |
| OBSERVATION | 1 | 0 (applied) |

Effective Doc-8A structure = `Proposal_v0.1` + this patch: R-set R1–R12 (R3 coinage-clean; R6/R11 re-anchored/precise); partition Doc-8A + Doc-8B…8G with **Doc-8D widened to Persistence, Migration & RLS** + a **cross-cutting conformance-concern allocation table**; §0–§12 + Appendix A (`CHK-8-xxx` bands, persistence/RLS band gains a migration check). Coins nothing; no frozen document edited.

*End of Structure Patch v0.1.1. Next: short re-review to confirm closure → Structure Freeze Audit → `Doc-8A_Structure_v1.0_FROZEN`.*
