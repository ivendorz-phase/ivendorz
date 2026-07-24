# Doc-2 — Additive Patch v1.0.13 (PATCH-D2-12) — RFQ Submission Gate: `estimated_value` optional at submit

> **STATUS: PROPOSED** — linked patch of the `Doc-3_Patch_v1.0.3_RfqSubmissionGate` set; pending
> independent Review-A/B + owner fold. Additive overlay to Doc-2 §5.4; the Doc-2 base file is **NOT
> edited** (the v1.0.6/v1.0.8/v1.0.9 overlay mechanism). Rank-0 amendment — owner-approved direction
> 2026-07-24. On the question "is `estimated_value` mandatory at RFQ submission", **this patch governs.**

| Field | Value |
|---|---|
| Applies to | Doc-2 §5.4 (RFQ machine — Guards) + §Assumptions table row **A-05** + §10.4 `rfq.rfqs` row (column annotation) |
| Produces | Doc-2 v1.0.13 (v1.0.12 + this patch) |
| Linked with | `Doc-3_Patch_v1.0.3_RfqSubmissionGate` (primary); `Doc-4E_RfqSubmissionGate_Pointer_Patch_v1.0` |
| Scope | Relaxes ASSUMPTION **A-05** — `estimated_value` becomes **optional at submit** (`> 0` if present). No **physical** schema/column change (the column is already physically nullable — a draft carries no value); the §10.4 annotation `NUMERIC NOT NULL at submit` is relaxed to match (Edit 2 below), so no `ALTER COLUMN` is emitted. No new entity, event, or ownership change. |

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
column is already **physically** nullable (a draft carries no value), so no `ALTER COLUMN` is needed;
but the §10.4 `rfq.rfqs` annotation `estimated_value NUMERIC NOT NULL at submit` states the *at-submit*
presence constraint that A-05 encoded — it is relaxed by **Edit 2** below so the DB blueprint no longer
re-imposes the removed gate. (The "no (draft) / yes (until submit)" nullability phrasing lives in
**Doc-4E PassB Part1:47**, not §10.4; it is corrected by the linked `Doc-4E …Pointer_Patch`.) Owner-ruled
2026-07-24 (Option C); primary rule change lives in Doc-3 §1.1 (PATCH-D3-07).

## 2a. Explicit edits (Replace / With — for the fold)

Additive overlay: the base file is not edited in place now; these blocks document the exact fold so
the produced v1.0.13 is internally consistent (no §5.4/§10.4 disagreement).

**Edit 1 — §Assumptions table row A-05 (~:879).**

Replace:

```
| A-05 | `estimated_value` mandatory at RFQ submission | Tier gate (pipeline) is undefined without a value; mandatory-at-submit is the smallest closure |
```

With:

```
| A-05 | `estimated_value` **optional** at RFQ submission (`> 0` if present) — relaxed v1.0.13 (PATCH-D2-12, owner-ruled 2026-07-24, Option C). The tier-gate undefinedness for a no-value RFQ is **relocated** to the matching pipeline as open sub-decision `[ESC-RFQ-VALUE-OPTIONAL-TIERGATE]` (§3), owed to the M3 owner before Wave-4 realization; it no longer forces a submission-time value. |
```

(The §5.4 Guards prose at ~:521 — "`estimated_value` is required at submission (ASSUMPTION A-05 …)" —
is superseded by declaration through the A-05 row above; on the mandatory-at-submit question this patch
governs. No independent Guards rewrite is required because §5.4 states the rule *as* A-05.)

**Edit 2 — §10.4 `rfq.rfqs` column annotation (~:757).**  *(F1 — closes the §5.4/§10.4 contradiction.)*

Replace:

```
`estimated_value NUMERIC NOT NULL at submit, currency DEFAULT 'BDT'`
```

With:

```
`estimated_value NUMERIC NULL (optional at submit; > 0 if present — A-05 relaxed, v1.0.13), currency DEFAULT 'BDT'`
```

The physical column was already nullable (drafts carry no value) — no `ALTER COLUMN` is emitted; only
the *at-submit* constraint annotation is relaxed so the DB blueprint stops re-imposing the removed gate.
This mirrors the linked `Doc-4E …Pointer_Patch` treatment of the analogous PassB Part1:47 field annotation.

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

## 4. No structural change (annotation-only §10.4 edit)

The `estimated_value` **column** is physically unchanged — `numeric`, already nullable (a draft carries
no value), no FK, no new column, no `ALTER COLUMN`. The only §10.4 change is **textual**: the annotation's
*at-submit* `NOT NULL` constraint note is relaxed (Edit 2) to match A-05 — a documentation reconcile, not
a DDL migration. No state-machine edit (the `draft → submitted` transition still exists; only its Doc-3
§1.2 exit predicate is reduced). Version immutability, award deal-value, and all §5.4 downstream
(engagement / performance inputs) are untouched.
