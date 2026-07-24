# Doc-2 — Additive Patch v1.0.13 (PATCH-D2-12) — RFQ Submission Gate: `estimated_value` optional at submit

> **STATUS: PROPOSED** — linked patch of the `Doc-3_Patch_v1.0.3_RfqSubmissionGate` set; pending
> independent Review-A/B + owner fold. Additive overlay to Doc-2 §5.4; the Doc-2 base file is **NOT
> edited** (the v1.0.6/v1.0.8/v1.0.9 overlay mechanism). Rank-0 amendment — owner-approved direction
> 2026-07-24. On the question "is `estimated_value` mandatory at RFQ submission", **this patch governs.**

| Field | Value |
|---|---|
| Applies to | Doc-2 §5.4 (RFQ machine — Guards) + §Assumptions table row **A-05** |
| Produces | Doc-2 v1.0.13 (v1.0.12 + this patch) |
| Linked with | `Doc-3_Patch_v1.0.3_RfqSubmissionGate` (primary); `Doc-4E_RfqSubmissionGate_Pointer_Patch_v1.0` |
| Scope | Relaxes ASSUMPTION **A-05** — `estimated_value` becomes **optional at submit** (`> 0` if present). No schema/column change (`estimated_value` is already `numeric`, nullable at draft — Doc-2 §10.4). No new entity, event, or ownership change. |

---

## 1. What A-05 says today (superseded)

- **§5.4 Guards (v1.0.2 base, ~:521):** "Guards: `estimated_value` is **required at submission**
  (**ASSUMPTION A-05** — the tier gate is undefined without it; smallest assumption is
  mandatory-at-submit)."
- **Assumptions table (~:879):** "| A-05 | `estimated_value` **mandatory** at RFQ submission | Tier gate
  (pipeline) is undefined without a value; mandatory-at-submit is the smallest closure |"

## 2. What governs after v1.0.13

**A-05 is relaxed to:** `estimated_value` is **optional at RFQ submission**. If provided it must be
`> 0` (BDT) — the numeric bound is retained; only the mandatory-presence requirement is dropped. The
column is already nullable (Doc-2 §10.4 "no (draft) / yes (until submit)" → now "no"). Owner-ruled
2026-07-24 (Option C); primary rule change lives in Doc-3 §1.1 (PATCH-D3-07).

## 3. ⚠ Carried consequence — the matching **tier gate** (must be resolved, not assumed)

A-05's own rationale was *"the tier gate (pipeline) is undefined without a value."* Relaxing A-05 does
not make that undefinedness disappear — it **relocates** it. A no-value RFQ entering `matching` needs a
**defined tier-gate behaviour**. This patch does **not** silently pick one; it records the sub-question
for the matching-pipeline owner (M3 · Doc-4E PassB Part2 "Matching Pipeline" · Doc-3 pipeline §):

**Open sub-decision `[ESC-RFQ-VALUE-OPTIONAL-TIERGATE]` (owed before Wave-4 M3 realization):** when
`estimated_value` is absent, the tier gate must either (a) be **skipped** (RFQ routes without value-band
tiering — vendors of all financial tiers eligible on value grounds), (b) fall back to a **category-norm
band** (POLICY), or (c) require value **only in modes/categories where the tier gate is load-bearing**.
Recommendation for the Board: **(a) skip** (simplest, no fabricated band) — but this is a matching
firewall-adjacent call and is explicitly deferred to the M3 owner, not resolved here. Until ruled, the
FE/submission change may land (submission no longer blocks on value); the **matching realization stays
gated on this sub-decision** (matching is out-of-wire / Wave-4 — no live pipeline exists yet).

## 4. No structural change

`estimated_value numeric` (Doc-2 §10.4) is unchanged — already nullable pre-submit. No FK, no new
column, no state-machine edit (the `draft → submitted` transition still exists; only its Doc-3 §1.2 exit
predicate is reduced). Version immutability, award deal-value, and all §5.4 downstream (engagement /
performance inputs) are untouched.
