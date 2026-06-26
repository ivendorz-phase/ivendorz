# Doc-7A — Content Pass-2 **Patch v1.0.1** (applies Pass-2 Independent Hard Review) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-7A_Content_v1.0_Pass2.md` (§5–§9) |
| Applies | `Doc-7A_Content_Pass2_Independent_Hard_Review_v1.0.md` (1 MAJOR + 3 MINOR + 1 NITPICK) |
| Date | 2026-06-26 |
| Effective state | Content Pass-2 **+ this patch** = clean §5–§9 |
| Status | **PATCH APPLIED — short closure check PASS** (0 open BLOCKER/MAJOR/MINOR). Next: Content Pass-3 (§10–§12 + Appendix A) |
| Discipline | Additive; nothing coined; no frozen document edited. Each change cites its finding |

---

## Changes

### C-1 — closes **MAJOR-1** (§7.1 Doc-4M→UI derivation)
§7.1 rewritten to fix the derivation mechanism (replacing "derived from the contract-reported current state + the Doc-4M transition set"):
> Doc-4M is a **design-time** authority, not a runtime service. The UI derives offerable transitions as follows: **(1)** the Doc-4M transition set is a **build-time encoding** in the frontend, whose **equivalence to Doc-4M is conformance-tested** — the encoding-matches-Doc-4M check is a **Doc-8** obligation (referenced), never a free-hand UI guess that may drift; **(2)** the **contract-reported current state** selects which encoded transitions are *candidates* in this state for this actor; **(3)** the **server is the final authority** — an illegal/stale transition returns `STATE`/`CONFLICT` (409, §5.3) and the UI reconciles (§7.2). The UI's offered set is **UX over the server's enforcement** (Pass-1 §4.3); it offers no transition Doc-4M forbids and invents no state/edge/label.

### C-2 — closes **MINOR-1** (CONFLICT vs STATE remediation)
**§5.3** row split: `CONFLICT` (409) → "refresh concurrency token, **safe idempotent retry**"; `STATE` (409) → "**re-derive offerable transitions** (§7.1); the action may no longer be offered — **do not auto-retry**." Note added: same status, different behavior; the UI branches on `error_class` not status (`Doc-4A §12.3`).
**§7.2** amended: optimistic UI reconciles per class — **CONFLICT** → refresh + idempotent retry (§5.6); **STATE** → re-derive available transitions and surface the new authoritative state, **no blind retry**.

### C-3 — closes **MINOR-2** (§9 ↔ §8 non-disclosure)
New **§9.1a** clause: AI advisory surfaces are **subject to the §8 non-disclosure / byte-equivalence rule** — an AI panel **never** surfaces a protected-fact-excluded or buyer-private (M4 CRM) datum, **even as advisory output**. AI panels consume only what the wired `Doc-5K` read discloses, which is itself non-disclosure-bound; an AI suggestion is never a side channel around §8.

### C-4 — closes **MINOR-3** (idempotency-key stability)
§5.6 specified: the idempotency key is **one stable key per logical user submission** — generated once and **reused across all retries/reconciliations of that submission** (within `*.idempotency_dedup_window`); a new key is minted **only** for a genuinely new submission. This makes the optimistic-retry path (§7.2) and the CONFLICT safe-retry (C-2) idempotent.

### C-5 — closes **NITPICK-1** (ASYNC_PENDING categorization)
§5.3: `ASYNC_PENDING` moved out of the error-class rows into a **footnote** — *not an error-envelope class* (`Doc-5A §6.2`); it is the accepted-then-processing response whose realization (poll the status resource) is owned by the async surface (§10/Doc-5A §10), surfaced in §10 of this metastandard, not via the §6 error envelope.

---

## Short Closure Check ("is it fixed or not?")

| Finding | Sev | Fix | Closed? |
|---|---|---|---|
| MAJOR-1 §7.1 Doc-4M→UI derivation | MAJOR | C-1: build-time encoding + Doc-8 conformance test + server-final + contract-state candidate selection | **CLOSED** — no runtime "transition API" implied; drift guarded by Doc-8; server authoritative |
| MINOR-1 CONFLICT vs STATE | MINOR | C-2: split remediation in §5.3 + §7.2 (refresh-retry vs re-derive-no-retry) | **CLOSED** |
| MINOR-2 §9 non-disclosure | MINOR | C-3: §9.1a binds AI to §8 byte-equivalence | **CLOSED** — advisory channel can't leak protected/excluded facts |
| MINOR-3 idempotency-key stability | MINOR | C-4: one stable key per logical submission, reused across retries | **CLOSED** |
| NITPICK-1 ASYNC_PENDING | NIT | C-5: footnoted as non-error-class | **CLOSED** |

**Closure verdict: PASS — 0 open BLOCKER / MAJOR / MINOR.** No new finding; no anchor regressed; nothing coined. C-1 and C-2 will propagate to Appendix A Pass-3 checks (state-machine band: "offerable transitions = Doc-8-conformance-tested encoding, server-final"; contract-binding band: "branch on error_class, class-specific remediation").

**Next pass:** Content Pass-3 (§10–§12 + Appendix A check-ID assignment) — Accessibility/i18n/currency/performance baseline (§10), Out-of-frontend boundary (§11), Conformance & carried items (§12), and the `CHK-7-xxx` check IDs per band — through the same loop. Then Content Freeze Audit → Doc-7A SERIES/Content FROZEN.

*End of Content Pass-2 Patch v1.0.1 + Short Closure Check. Effective §5–§9 = Pass-2 + this patch. Additive; nothing coined; no frozen document edited.*
