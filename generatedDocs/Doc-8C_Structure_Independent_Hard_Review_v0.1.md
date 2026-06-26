# Doc-8C — Structure Proposal v0.1 — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8C_Structure_Proposal_v0.1.md` |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET FREEZE-READY** — 1 MAJOR + 1 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER. Resolve via Structure Patch → short re-review → Structure Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-5A §5.6` (envelope), `§6.2` (error taxonomy at fixed status), `§8` (cursor pagination) · `Doc-4A §9.7` (prohibited request fields, CHK-087 categories) · `Doc-3 §12` (`*.list_page_size_max`/`*.idempotency_dedup_window`) · `Doc-4A §22.1 C-05` (reference_id on body-bearing; 204 exempt — verified via the `Doc-4A_Patch_C-05-204_v1.0` ledger row) — all correctly invoked.
- `Doc-5A_Content_v1.0_Pass10 §B.1` (the **API route registry** — namespace/path grammar) — verified (line 31: "the registry binds to the canonical namespace…"). Relevant to MAJOR-1.
- C2 out-of-wire set — verified: M0 `core` (R1 boundary), `Doc-5E` 8 System engine workers, `Doc-5I R10` internal services (`resolve_entitlements`/`enforce_quota`), `Doc-5J` Admin-only / `Doc-5D` tri-actor / `Doc-5C R2` active-org actor models — correctly cited.
- `Doc-8A §5/§3.2/§3.3` + Appendix A bands A (`CHK-8-001…003`) / B (`CHK-8-010…015`); `Doc-8B` harness consumption — correct.

0 BLOCKER. C1 (table-driven) and C2 (wired-only scope) are the right shape, and the §3–§8 check-per-dimension map is sound. One load-bearing gap, one seam, one nit.

---

## Findings

### MAJOR-1 — C1's "provable coverage" has no frozen **source of truth** for the inventory; it must anchor to the frozen Doc-5x contract enumerations (not hand-transcription)
C1 says the inventory is "derived from the frozen contracts," and §2's completeness check fails on a "missing/extra row." **But the proposal never names what the inventory is checked *against*.** A hand-transcribed inventory's completeness check only proves the inventory is **internally consistent** — not that it **matches the frozen Doc-5 surface**. A transcription error (a wrong/missing/invented contract row) would pass an internal check while silently mis-covering or coining. C1's central claim ("provable, complete coverage") is hollow without a frozen oracle for the inventory itself.
**Required fix:** §1/§2 must anchor the inventory's source of truth to the **frozen per-module Doc-5x contract enumerations** — the authoritative contract lists in `Doc-5B…5K` (the frozen counts are the coverage target: `Doc-5C` 42 · `Doc-5D` 71 · `Doc-5E` 38 · `Doc-5F` 50 · `Doc-5G` 40 · `Doc-5H` 23 · `Doc-5I` 33 · `Doc-5J` 34 · `Doc-5K` 16 · `Doc-5B` out-of-wire), cross-checked against the `Doc-5A_Content_v1.0_Pass10 §B.1` route-registry namespace/path grammar. The **completeness check asserts: inventory ≡ the frozen Doc-5x enumerations** (every frozen contract present, none invented). State that the inventory is **derived/generated from the frozen Doc-5x docs (and, once code exists, cross-checked against the `generated-contracts-registry/`)** — never hand-maintained as an independent list. This makes "provable coverage" actually provable.

### MINOR-1 — §8 conflates contract-actor-scope (Doc-8C) with RLS enforcement (Doc-8D); state the seam
§8 asserts "reads actor-scoped per the owning Doc-4x" and points cross-tenant to Doc-8D. Correct in direction, but the **seam** should be explicit: **Doc-8C** asserts the **contract-declared actor scope** (the contract's documented actor sees only what the contract grants — an API-surface assertion); **Doc-8D** asserts the **RLS backstop** (the DB-level enforcement) and the cross-tenant byte-equivalence gate. Both layers, distinct oracles; without the seam a reader may think Doc-8C covers RLS (it does not) or that the two overlap.
**Required fix:** §8 — add one clause: Doc-8C asserts contract-declared actor scope at the API surface (oracle = the owning `Doc-4x §HB` actor model); the RLS enforcement + cross-tenant byte-equivalence are **Doc-8D's** gate (`Doc-6A R8/§4`), cross-referenced, not re-asserted. One behavior, two layer-checks (the §6.4/§9.6 allocation precedent).

### NITPICK-1 — §6 idempotency does not bind the idempotency-**key** mechanism
§6 asserts "a replay inside `*.idempotency_dedup_window` yields the deduplicated result" but does not say what makes a request a "replay" — the idempotency-key mechanism (the `Doc-4A` idempotency-key header / request-identity rule). The replay must be keyed **per the frozen mechanism**, not assumed content-based.
**Suggested fix:** §6 — bind the idempotency-key mechanism by pointer (`Doc-4A` idempotency header/key rule); the replay is keyed per the frozen declaration.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"C2 excluding out-of-wire contracts from Band B leaves them unverified — a coverage hole."* | **REJECTED (false).** Out-of-wire contracts **are** verified — by their **owning discipline** (Doc-8F integration / Doc-8D persistence / Doc-8E domain), and Doc-8C records each as **N/A with its owning-suite pointer** (no silent omission — C2/§9). Band B is **HTTP-surface-specific** (envelope, HTTP-status-mapped errors, cursor pagination over the wire); applying it to a non-HTTP internal service / engine worker would be a **category error** (asserting an HTTP envelope on something with no wire). Correct discipline routing, not a hole. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MAJOR-1 inventory has no frozen source-of-truth | MAJOR | Structure Patch — anchor inventory to frozen Doc-5x enumerations + Pass10 §B.1; completeness ≡ frozen surface |
| MINOR-1 §8 contract-scope vs RLS seam | MINOR | Structure Patch — state the seam (Doc-8C API actor-scope / Doc-8D RLS) |
| NITPICK-1 §6 idempotency-key mechanism unbound | NIT | Structure Patch — bind the Doc-4A idempotency-key rule |

**Gate (governance §8 rule 1):** freeze only with 0 open BLOCKER/MAJOR/MINOR. 1 MAJOR + 1 MINOR open → **Structure Patch required**, then short re-review, then Structure Freeze Audit.

*End of Independent Hard Review. Nothing coined; no frozen document edited. Anchors verified against the frozen corpus (Doc-5A §5.6/§6.2/§8/Pass10 §B.1; Doc-4A §9.7/§22.1; Doc-5x contract counts; Doc-8A §5 + bands A/B).*
