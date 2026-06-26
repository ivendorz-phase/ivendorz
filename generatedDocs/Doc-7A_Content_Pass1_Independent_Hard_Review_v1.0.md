# Doc-7A — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7A_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · Reference-Never-Restate |
| Verdict | **NOT YET PASS** — 1 MAJOR + 3 MINOR + 1 NITPICK open; 0 BLOCKER. Resolve via Content Patch → short re-review → Content Pass-2 |

---

## Anchors verified CORRECT (sample)

- `Doc-4A §5.3` "Active Organization Context" — **verified** (`Doc-4A_Content_v1.0_Pass2` §5.3; server-validated, never client-supplied). §4.1 binding CORRECT.
- `Iv-Active-Organization` header, server-validated / never client-trusted — **verified** (`Doc-5A_Content_v1.0_Pass2` line 189: "Mandatory (every org-scoped operation) … server-validated, never client-trusted (`Doc-4A §5.3`/§9.7)"). §4.1 CORRECT.
- `Doc-5C §C8` (`switch_active_organization`, `get_active_context`, `list_my_organizations`), `§C6` (membership/invitation), `§C3` (`check_permission` internal-service) — **verified** against `Doc-5C_Structure_v1.0_FROZEN`. Contract names CORRECT (none invented).
- Invariant #2 (Hybrid participation) and #10 (entitlement ≠ plan-name string) — correctly invoked in §4.2/§4.3.
- `Doc-5 Governance Note §3/§7/§8 rule 5` framing (conform-vs-consistency) — CORRECT in §0.3/§2.3.

0 BLOCKER. The §0–§4 spine is faithful to the frozen structure and reference-never-restate is largely honored. One correctness defect (frontend ↔ internal-service boundary) and three smaller items follow.

---

## Findings

### MAJOR-1 — §4.3/§4.4 imply the frontend invokes internal-service (out-of-wire) contracts → boundary violation
§4.3 states "the canonical authorization root is the internal-service **`check_permission`** … invoked server-side," and §4.3 reads entitlements via "**`Doc-5I R10`** — the entitlement service is authoritative." But `check_permission` (`Doc-5C §C3`) and `resolve_entitlements`/`enforce_quota` (`Doc-5I R10`) are **internal-service / out-of-wire** — they are **not** caller-facing wired contracts. The frontend — *including its Next.js server layer* — is an external caller of each module; it may consume **only the wired, caller-facing contract surface** (cross-module access is via `contracts/` only — One Module, One Owner). A frontend that calls another module's internal-service authz/entitlement root reaches across the wired boundary the corpus forbids.
**Required fix:**
1. Add a **"wired-contracts-only" convention** (to §3, the data-binding boundary): the frontend consumes **only the caller-facing (wired) subset** of the frozen Doc-5 surface; **out-of-wire / internal-service contracts are never frontend-callable** (neither client nor server layer).
2. Reframe §4.3: the UI gates UX on **permission/entitlement *state* read via wired contracts**; the **authoritative re-validation lives inside each wired Doc-5 contract** the server action calls (the contract runs its own authorization per `Doc-4A §5`/validation order, internally using M1's `check_permission`). The frontend does **not** invoke `check_permission` or `resolve_entitlements` itself — those are the owning module's internal concern.
3. §4.4 Admin: same rule — the Admin console calls only wired `Doc-5J` contracts.

### MINOR-1 — §4.3 entitlement read path under-specified after MAJOR-1
Once MAJOR-1 lands, §4.3 must state *how* the UI obtains entitlement state without the internal service: entitlement/quota state is surfaced **through the wired contracts the UI already calls** (a wired read exposing the resolved entitlement, or the command's own quota enforcement returning a typed error mapped per `Doc-5A §6.2`). Keep Invariant #10 (boolean/numeric/enum, never plan-name) — that is correct and stays.

### MINOR-2 — anchor `Doc-5A §7.3` not directly verifiable this pass; attribute through frozen Doc-5C
§4.4 cites `Doc-5A §7.3` for "Admin carries no org context." `Doc-5A §7` is the header-registry section authored in a "later pass" (`Doc-5A_Content_v1.0_Pass2` line 189 marks §7 "later pass"); the precise §7.3 sub-anchor was not confirmable in this review. The claim itself is sound — it is **carried verbatim by frozen `Doc-5C R2`** ("the Admin governance subset … carries **no** org context (`Doc-5A §7.3`)") and reinforced by `Doc-5J` (Admin-only, no active-org).
**Required fix:** attribute the Admin-no-org fact primarily through **`Doc-5C R2`** + **`Doc-5J`** (frozen, in-corpus), keeping `Doc-5A §7.3` as the onward pointer Doc-5C itself uses — not as a freshly-asserted anchor.

### MINOR-3 — §0.1 precedence diagram omits Doc-6 (the sibling beside Doc-7)
The structure places Doc-7A "beside Doc-6" (Implementation Contract layer). The §0.1 chain shows only `Doc-7A → Doc-7B…7H` under Doc-5, omitting Doc-6.
**Required fix:** show Doc-6 and Doc-7 as siblings at the Implementation Contract layer (both realize upstream; neither governs the other), for precedence completeness.

### NITPICK-1 — §2.1 "Inngest-driven outbox effects" row risks reading as a frontend concern
The async/jobs row is accurate (CLAUDE.md §2) but invites the misread that the frontend touches Inngest/outbox.
**Required fix:** reframe to "async job results are surfaced **only as contract-delivered state**; the client never invokes a job or the outbox" — emphasizing the boundary, not the mechanism.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 frontend ↔ internal-service boundary (wired-only) | MAJOR | Content Patch — add wired-only convention + reframe §4.3/§4.4 |
| MINOR-1 entitlement read path post-fix | MINOR | Content Patch — specify wired entitlement-state path |
| MINOR-2 `Doc-5A §7.3` attribution | MINOR | Content Patch — attribute via Doc-5C R2 + Doc-5J |
| MINOR-3 §0.1 omits Doc-6 sibling | MINOR | Content Patch — add sibling |
| NITPICK-1 Inngest row framing | NIT | Content Patch — reframe to boundary |

**Gate:** a pass clears only with no open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Content Patch required**, then short re-review, then Content Pass-2 (§5–§9).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a genuine boundary-correctness defect (frontend must consume only the wired Doc-5 subset), not a style note.*
