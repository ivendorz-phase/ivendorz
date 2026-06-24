# Doc-5F — Business Operations (M4 `operations`) API Realization — Structure Proposal v0.1 — Independent Hard Review (Board / Virtual CTO) v1.0

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** (Board Chair · Principal Enterprise Architect · DDD Architect · API Governance Reviewer · AI Coding Supervisor) |
| Target | `Doc-5F_Structure_Proposal_v0.1.md` |
| Mode | Hard Review → Board Review · Defect-Hunting · Realize-Never-Redecide · No Architecture Redesign / Ownership Reallocation / Module-Boundary Change |
| Conformance basis | `Doc-5A v1.0 (FROZEN)` Appendix A (`CHK-5A-xxx`); `Doc-4F v1.0 (FROZEN)`; Doc-2 v1.0.3; Doc-4A v1.0; `Doc-5_Program_Governance_Note_v1.0 §6/§8` |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT FREEZE-READY** — 0 BLOCKER · 2 MAJOR · 4 MINOR · 1 OBSERVATION · 2 NITPICK *(as submitted)*. **Board calibration:** M-02 → MINOR, m-04 → NITPICK ⇒ **1 MAJOR · 4 MINOR · 1 OBSERVATION · 3 NITPICK**. Per Gov-Note §8.1 (no open BLOCKER/MAJOR/MINOR may freeze), apply Structure Patch v0.1 → v0.2, then promote `Doc-5F_Structure_v1.0_FROZEN` |

## Board summary

Partition is sound — **50 contracts = 46 caller-facing + 4 out-of-wire**, every contract mapped to exactly one §. State-machine edges checked against frozen source and are **verbatim, no invented edge** (engagement `open→in_delivery→completed→closed` terminal; lead `received→quoted→negotiation→won|lost→follow_up`; trade-invoice `issued→partially_paid→paid|disputed|cancelled`; payment `recorded→confirmed`; template `draft→active→archived`). Money boundary (DF-6), governance-signal firewall (R6), non-disclosure firewall (R5), and the post-award seam (R7) are correctly drawn. `ASYNC_PENDING` is **not** a coinage — it is the Doc-5A §10 / §12.2 realization (CHK-5A-092). Findings below are binding-precision and rule-completeness gaps, not architecture breaks. No Board decision is required to clear any of them.

## Evidence verified this review

| Claim in Doc-5F | Source checked | Result |
|---|---|---|
| 50 contracts; 4 out-of-wire | `Doc-4F` PassB token grep | ✅ 50 unique `ops.*` tokens; 4 are 21.5/internal-service |
| Engagement / lead / trade-invoice / payment edges | `Doc-4F PassB Part2/Part3 H.5`; `Doc-2 §3.5/§10.5` | ✅ verbatim; no edge added |
| `generate_document` = 21.5 System async, out-of-wire | `Doc-4F §F7.3` | ✅ "async generation job · Actor System · Response none" |
| Route prefix `operations`; token `ops.` | `Doc-5A App B.1` (Pass10:39); `Doc-4F B.1` | ✅ split confirmed |
| `ASYNC_PENDING` exists upstream | `Doc-5A §10` / `§12.2`; CHK-5A-090/091/092 | ✅ not coined |
| DF-6 money boundary | `Doc-4F PassA B.8` / PassB Part2 invariants | ✅ `trade_invoices` ≠ `platform_invoices`; payment records hold no funds |
| Doc-4M state authority for M4 | `Doc-4M_FROZEN` lines 89–92/122/135 | ⚠ Doc-4M **delegates** to Doc-2 §3.5/§10.5 + Doc-4F (see m-01) |

---

## Findings

### MAJOR

**M-01 — Two-sided write-side actor rule missing. [§3]**
§3 carries a binding per-*read* disclosure-scope rule but **no symmetric per-*command* actor-side rule**. The partition tags engagement/template/finance commands "User(buyer/vendor)" — which leaves *which side may drive each transition* undeclared (e.g. `record_delivery` = vendor; `record_buyer_feedback` = buyer; `close_engagement` = either). M4 is the platform's only two-sided tenant module; without a structural rule this is the same divergent-realization risk Doc-5D raised for reads (5D M-03), on the write side.
**Fix:** add a binding §3 rule — *every §4–§8 command shall declare its actor side (Buyer / Vendor / Either) in its content block; an ambiguous or undeclared side is a content-authoring blocker.* Add a self-audit row.

**M-02 — Async document-generation surface under-bound. [R9 / §7]**
R9/§7 name `ASYNC_PENDING` but do not bind the Doc-5A §10 async realization pattern: `202` accepted-then-processing (CHK-5A-090), the status-resource Query as the single source of truth (§10.2 / CHK-5A-091), no-fabricated-outcome (§10.3 / CHK-5A-092), `Doc-4A §15`. As written, content authors could invent the async shape.
**Fix:** §7 and R9 bind `Doc-5A §10` + `Doc-4A §15`; name `get_generated_document` as the status-resource; `202` on the enqueuing command, `ASYNC_PENDING` from the result Query while pending.

### MINOR

**m-01 — State-authority over-attribution to Doc-4M. [R5 · §4–§7]**
Doc-4M lists the operations entities but **delegates** authority — "Doc-2 §3.5/§10.5 … Doc-4F (FROZEN)". Doc-4F itself binds edges to `Doc-2 §3.5/§5.9/§10.5; Doc-4A §13`, never to Doc-4M. The repeated phrase "authoritative state authority **Doc-4M**" mis-attributes the edge definition.
**Fix:** cite `Doc-2 §3.5/§5.9/§10.5` as the edge source; reference Doc-4M as the cross-module state-machine **index/map**, not the edge definer.

**m-02 — R6 re-enumerates the Doc-2 §8 event set. [R6]**
R6's parenthetical "(delivery / work-completion / engagement-completion / dispute / buyer-feedback)" restates the §8 catalog — the reference-never-restate breach this very document claims to pre-incorporate from Doc-5D M-02.
**Fix:** replace the parenthetical with a pure `Doc-2 §8` (operations emitter set) pointer; name no event.

**m-03 — Route/token path-derivation rule absent. [R3 · §2]**
R3/§2 state the route prefix `operations` and the command token `ops.` but never state that **HTTP paths derive from `operations`, never from the `ops.` token stem**. The divergence trap is exactly this split.
**Fix:** add one sentence to §2 — path grammar uses the route prefix `operations`; `ops.<operation>` is the command token only (never a path segment source).

**m-04 — `generate_document` enqueue trigger imprecise. [R9]**
R9 says the job is "enqueued by `issue_engagement_document` / template activation". `Doc-4F §F7.3` says only "enqueued by a user action in BC-OPS-2/BC-OPS-4" — template *activation* is not confirmed as a trigger.
**Fix:** bind the enqueue trigger to `Doc-4F §F7.3` by pointer; defer the exact command→job mapping to the content phase.

### OBSERVATION

**O-01 — Generated-document grant audience unspecified. [§7]**
`grant_generated_document` / `revoke_generated_document_grant` realize cross-counterparty access. The structure does not state whether the grantee is the engagement counterparty (intra-`operations`, party-scoped) or a cross-module RFQ document-grant (`rfq_document_grants` analogue). If cross-module, the gate must not traverse another module's tables (One Module, One Owner).
**Disposition:** content-phase §7 must cite the Doc-4F authority for the grant audience; **flag-and-halt if Doc-4F is silent**. Not freeze-blocking at structure.

### NITPICK

**NP-01** — self-audit header "(pre-review)" → "(post-review v0.2)" after patch.
**NP-02** — DF-4/DF-6/DF-7 carried-item descriptions partly sourced from extraction; mark "confirm verbatim at content." (DF-3/4/5/6/7/8 grep-verified this review; residual risk low.)

---

## Disposition & required actions

| # | Finding | Sev | Action | Board decision? |
|---|---|---|---|---|
| 1 | M-01 write-side actor rule | MAJOR | Add §3 per-command actor-side rule + self-audit row | No |
| 2 | M-02 async surface binding | MAJOR | Bind §7/R9 to Doc-5A §10 + Doc-4A §15; name status-resource | No |
| 3 | m-01 Doc-4M attribution | MINOR | Re-cite Doc-2 §3.5/§5.9/§10.5; Doc-4M = index | No |
| 4 | m-02 §8 restatement | MINOR | Replace parenthetical with `Doc-2 §8` pointer | No |
| 5 | m-03 path-derivation rule | MINOR | Add §2 path-stem sentence | No |
| 6 | m-04 enqueue trigger | MINOR | Bind to `Doc-4F §F7.3`; defer mapping | No |
| 7 | O-01 grant audience | OBS | Resolve in content §7; flag-and-halt if silent | No |
| 8 | NP-01 / NP-02 | NIT | Header + verbatim-confirm note | No |

All six substantive findings are mechanically resolvable; **no architecture, ADR, ownership, governance-invariant, or module-boundary change is implicated** — none requires the rank 0–1 human-approval path. Recommend: apply **Structure Patch v0.1 → v0.2**, then promote **`Doc-5F_Structure_v1.0_FROZEN`**.

---

*End of Doc-5F Structure Independent Hard Review (Board / Virtual CTO) v1.0. Evidence-verified against the frozen corpus. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt.*
