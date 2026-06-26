# Doc-7A — Content Pass-2 (§5–§9) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7A_Content_v1.0_Pass2.md` (§5–§9) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · Reference-Never-Restate |
| Verdict | **NOT YET PASS** — 1 MAJOR + 3 MINOR + 1 NITPICK open; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-3 |

---

## Anchors verified CORRECT

- **§5.3 class→status map** — fully cross-checked against `Doc-5A §6.2` (`Doc-5A_Content_v1.0_Pass3`): VALIDATION→400 (L150), NOT_FOUND→404 (L152), CONFLICT→409 (L154), QUOTA→403 (L157), RATE_LIMITED→429 (L158); **shared-status rationale L163** confirms AUTHORIZATION→403, **STATE→409, REFERENCE/BUSINESS→422**; DEPENDENCY→503 (L180); ASYNC_PENDING realized by §10 not the envelope (L159). **Every row CORRECT; no class/status invented.**
- **§8.2 protected-fact collapse `Doc-5A §6.3`** — verified (`Doc-5A_Content_v1.0_Pass3` L152: "NOT_FOUND … Includes every protected-fact collapse (§6.3)"); the 404-default for ambiguous AUTH/NOT_FOUND (L193, `Doc-4A §12.6`) CORRECT.
- **§5.5 pagination** — `page_size`/`cursor`/`page_info.next_cursor`/`has_more`/`total_count` verified verbatim (`Doc-5A_Content_v1.0_Pass5` L21/L26/L31/L53/L63–69); offset-forbidden (L25), opaque cursor (L31), POLICY-keyed page_size (L53), exclusion-set consistency (L77–80). CORRECT.
- **Error body shape** `{ error{ error_class,error_code,message,field_errors?,retryable }, reference_id }` — verified (`Pass3` L140); branch-on-class (L146, `Doc-4A §12.3`). CORRECT.

0 BLOCKER. Token-binding is faithful (verbatim, nothing coined). One architectural precision defect + three refinements + one nit follow.

---

## Findings

### MAJOR-1 — §7.1 leaves the Doc-4M→UI derivation ambiguous (design-time authority vs runtime) → drift risk
§7.1 says the UI renders "only the transitions Doc-4M permits … derived from the contract-reported current state + the Doc-4M transition set." But **Doc-4M is a design-time frozen authority, not a runtime service** — the UI cannot *fetch* "the Doc-4M transition set." As written, this reads as license to **hardcode** transitions in UI code, which silently **drifts** from the authoritative machine and offers no safeguard. The realization mechanism must be explicit.
**Required fix (§7.1):** state the derivation precisely:
1. The set of offerable transitions is a **build-time encoding** of the Doc-4M transition set, **conformance-tested against Doc-4M** (the encoding-matches-Doc-4M test is a **Doc-8** obligation, referenced) — never a free-hand UI guess.
2. The **contract-reported current state** selects which encoded transitions are *candidates* in this state.
3. The **server is the final authority**: an illegal/stale transition returns `STATE`/`CONFLICT` (409) and the UI reconciles (§7.2). The UI gate is UX over the server's enforcement (consistent with Pass-1 §4.3).

This keeps R9 true without implying a non-existent runtime "transition API" or sanctioning drift.

### MINOR-1 — §5.3/§7.2 conflate `CONFLICT` and `STATE` remediation
§5.3 groups "CONFLICT / STATE → 409 stale-state reconciliation" and §7.2 treats both as "re-fetch and reconcile." Their remediation differs (`Doc-5A §6.2` L154 vs the STATE class): **`CONFLICT`** = stale concurrency token / duplicate non-idempotent submit → refresh the concurrency token and **safely retry** (idempotent); **`STATE`** = the transition is illegal in the now-current state → **re-derive the available transitions** (the action may no longer be offered) and **do not auto-retry**.
**Required fix:** split the UI remediation: CONFLICT → refresh + idempotent retry; STATE → re-derive offerable transitions (§7.1), no blind retry. They share status 409 but not behavior (and the UI branches on `error_class`, not status — §5.3).

### MINOR-2 — §9 (AI advisory) omits the non-disclosure cross-reference
§9 establishes advisory-only/non-authoritative/non-gating but does not bind AI surfaces to §8. An AI summary/suggestion (M9) could otherwise surface a protected or excluded fact (an excluded vendor, buyer-private CRM content) **as a "suggestion,"** breaching byte-equivalence (R8) through the advisory channel.
**Required fix:** add §9 clause — AI advisory surfaces are **subject to the same §8 non-disclosure / byte-equivalence rule**: an AI panel never surfaces a protected-fact-excluded or buyer-private datum, even as advisory output; it consumes only what the wired `Doc-5K` read discloses, which is itself non-disclosure-bound.

### MINOR-3 — §5.6 idempotency-key stability unspecified
§5.6 says "the server action attaches the idempotency key" but not its **lifecycle**. Dedup only works if the **same** key is reused across retries of the **same logical submission**; a fresh key per attempt defeats `*.idempotency_dedup_window`.
**Required fix:** specify — **one stable idempotency key per logical user submission**, generated once and **reused across retries/reconciliations** of that submission (a new key only for a genuinely new submission). This makes the optimistic-retry (§7.2) safe.

### NITPICK-1 — §5.3 lists `ASYNC_PENDING` inside the error-taxonomy table
`ASYNC_PENDING` is **not** an error-envelope class (`Doc-5A §6.2` L159 — realized by §10). Listing it in the "error taxonomy → UI state" table, even with the caveat, slightly miscategorizes it.
**Required fix:** footnote it as *not an error-envelope class* (accepted-then-processing, §10 async surface) rather than a peer row, or move it below the table.

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MAJOR-1 §7.1 Doc-4M→UI derivation ambiguity | MAJOR | Content Patch — build-time encoding + Doc-8 conformance + server-final |
| MINOR-1 CONFLICT vs STATE remediation | MINOR | Content Patch — split §5.3/§7.2 behavior |
| MINOR-2 §9 non-disclosure cross-ref | MINOR | Content Patch — bind §9 to §8 |
| MINOR-3 idempotency-key stability | MINOR | Content Patch — one stable key per submission |
| NITPICK-1 ASYNC_PENDING categorization | NIT | Content Patch — footnote |

**Gate:** clears only with 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 1 MAJOR + 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-3 (§10–§12 + Appendix A).

*End of Content Pass-2 Independent Hard Review. Nothing coined; no frozen document edited. The MAJOR is a real realization-precision defect (how a design-time state authority reaches the UI without drift), not a style note.*
