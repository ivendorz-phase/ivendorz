# Doc-7A — Content Pass-1 **Patch v1.0.1** (applies Pass-1 Independent Hard Review) + Short Re-Review

| Field | Value |
|---|---|
| Patches | `Doc-7A_Content_v1.0_Pass1.md` (§0–§4) |
| Applies | `Doc-7A_Content_Pass1_Independent_Hard_Review_v1.0.md` (1 MAJOR + 3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-1 **+ this patch** = clean §0–§4 |
| Status | **PATCH APPLIED — short re-review PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-2 (§5–§9) |
| Discipline | Additive; nothing coined; no frozen document edited. Each change cites its finding |

---

## Changes

### C-1 — closes **MAJOR-1** (frontend ↔ internal-service boundary)
**(a) New convention added to §3 (the data-binding boundary), titled "§3.7 Wired-contracts-only boundary":**
> The frontend — **including its Next.js server layer (Server Components, server actions, route handlers)** — is an external caller of every module and may consume **only the caller-facing (wired) subset** of the frozen Doc-5 surface. **Out-of-wire / internal-service contracts are never frontend-callable** (neither client nor server). Examples explicitly out of bounds: `check_permission` (`Doc-5C §C3`), `resolve_entitlements` / `enforce_quota` (`Doc-5I R10`), and every Doc-5x §"out-of-wire" engine/System worker. Cross-module access is via the wired `contracts/` surface only (One Module, One Owner). A frontend that reaches an internal-service root violates the wired boundary.

**(b) §4.3 reframed.** Replace "the canonical authorization root is the internal-service `check_permission` … invoked server-side" with:
> The UI gates UX on **permission/entitlement *state* read via wired contracts**. **Authoritative re-validation lives inside each wired Doc-5 contract** the server action calls — every contract runs its own authorization (per `Doc-4A §5` validation order), internally using M1's `check_permission`. The frontend **does not invoke `check_permission` or `resolve_entitlements` itself**; those are the owning module's internal concern. The UI gate is a UX nicety over the server's contract-level enforcement, never the authorization boundary (R7).

**(c) §4.4 Admin** gains: "the Admin console calls only wired `Doc-5J` contracts (no internal-service access)."

### C-2 — closes **MINOR-1** (entitlement read path)
§4.3 entitlement sentence specified:
> Entitlement/quota **state** reaches the UI **through the wired contracts the UI already calls** — either a wired read that exposes the resolved entitlement, or a wired command whose own quota enforcement returns a typed error mapped per `Doc-5A §6.2`. The UI branches on the resolved **boolean/numeric/enum** entitlement value, **never a plan-name or role-name string** (Invariant #10). It never calls the internal `resolve_entitlements` service (C-1).

### C-3 — closes **MINOR-2** (`Doc-5A §7.3` attribution)
§4.4 Admin-no-org fact re-attributed: primary anchors **`Doc-5C R2`** (frozen — "Admin governance subset carries **no** org context") + **`Doc-5J`** (Admin-only, no active-org); `Doc-5A §7.3` retained only as the onward pointer Doc-5C itself cites, not as a freshly-asserted in-session anchor. `Doc-4A §5.3` and `Doc-5A §7` (header registry) remain (both verified this pass).

### C-4 — closes **MINOR-3** (§0.1 precedence omits Doc-6)
§0.1 chain amended to show Doc-6 and Doc-7 as **siblings** at the Implementation Contract layer:
```
            └─ Doc-5A → Doc-5B…5K        (frozen API surface)
                 ├─ Doc-6A → Doc-6B…6K   (database realization — sibling)
                 └─ Doc-7A → Doc-7B…7H   (frontend realization — this)
                      └─ Code
```
Neither sibling governs the other; both realize upstream (Doc-6 realizes Doc-2; Doc-7 realizes Doc-5/Doc-4M/Doc-2). Consistency between them is a cross-check, not conformance.

### C-5 — closes **NITPICK-1** (§2.1 Inngest row)
§2.1 async/jobs row reframed:
> Async job results are surfaced **only as contract-delivered state**; the client never invokes a job, the outbox, or Inngest directly. (Job orchestration is M0/Inngest, consumed by modules — CLAUDE.md §2 — and reaches the UI only as a changed contract result.)

---

## Short Re-Review (closure verification)

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 frontend ↔ internal-service boundary | MAJOR | C-1 §3.7 wired-only convention + §4.3/§4.4 reframe | **CLOSED** — frontend boundary = wired caller-facing subset only; no internal-service call |
| MINOR-1 entitlement read path | MINOR | C-2 wired entitlement-state path + Invariant #10 retained | **CLOSED** |
| MINOR-2 `Doc-5A §7.3` attribution | MINOR | C-3 re-attributed via Doc-5C R2 + Doc-5J | **CLOSED** — no unverified anchor freshly asserted |
| MINOR-3 §0.1 omits Doc-6 sibling | MINOR | C-4 sibling added | **CLOSED** |
| NITPICK-1 Inngest row | NIT | C-5 reframed to boundary | **CLOSED** |

**Re-review verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding; no anchor regressed; nothing coined. The §3.7 wired-only convention **strengthens** the R7/R12 realization and will propagate as an Appendix A check (contract-binding band) in Pass-3.

**Next pass:** Content Pass-2 (§5–§9) — Data-Binding & API-Client (§5), Content≠Presentation (§6), State-Machine-Driven UI (§7), Non-Disclosure & Privacy (§8), AI Advisory (§9) — through the same loop. §5 will carry the §3.7 wired-only boundary into the concrete data-binding conventions.

*End of Content Pass-1 Patch v1.0.1 + Short Re-Review. Effective §0–§4 = Pass-1 + this patch. Additive; nothing coined; no frozen document edited.*
