# Doc-4E — RFQ Submission Gate Pointer Patch v1.0 (PATCH-4E-RSG-01)

> **STATUS: PROPOSED** — linked patch of the `Doc-3_Patch_v1.0.3_RfqSubmissionGate` set; pending
> independent Review-A/B + owner fold. Additive; edits no frozen Doc-4E text in place. Pointer-only —
> Doc-4E already binds the submission FIXED-set **by pointer** to Doc-3 §1.2 and re-derives nothing.

| Field | Value |
|---|---|
| Applies to | Doc-4E §E4.3 (`submit_rfq` BUSINESS stage) · PassB Part1 §Field table + §Validation Matrix · PassA §Preconditions |
| Produces | A pointer overlay tracking Doc-3 v1.0.3 (PATCH-D3-07) + Doc-2 v1.0.13 (A-05 relaxed) |
| Linked with | `Doc-3_Patch_v1.0.3_RfqSubmissionGate` (primary); `Doc-2_Patch_v1.0.13_RfqSubmissionGate` |
| Scope | Records that the submission FIXED-set enforced by `submit_rfq` is **reduced** — `estimated_value` presence and the spec/scope conditional are no longer BUSINESS-stage gates. No contract, endpoint, schema, error code, or event added. |

---

## 1. What tracks (by pointer — Doc-4E re-derives nothing, per its own H.9 / AI-Agent notes)

Doc-4E states the submission FIXED-set is "bound to Doc-3 §1.2 / Doc-2 §5.4 — not re-derived"
(PassB Part1 §4 Validation Matrix; PassA §21 AI-Agent notes). With Doc-3 v1.0.3 + Doc-2 v1.0.13 in
force, the `submit_rfq` **BUSINESS** stage FIXED-set is now:

- category active · `work_nature` non-empty · delivery ≥ district · `routing_mode` set · attached specs
  (if any) reference an active revision.
- **No longer gated:** `estimated_value` presence; the "spec attachment OR `no_formal_spec` + scope ≥
  `rfq.min_scope_chars`" conditional.

## 2. Retained (do NOT drop)

- **`estimated_value` VALIDATION.** PassB Part1 §Errors "`VALIDATION`: SYNTAX, or `estimated_value` ≤ 0
  numeric bound" **stays** — a *provided* value must be `> 0`. Only its **BUSINESS** presence-gate is
  removed. So: absent value → passes; present-and-`≤0` → `VALIDATION` failure (unchanged).
- **Field table (PassB Part1:47)** `estimated_value` "required at submit" annotation now reads
  **"optional at submit; `>0` if present (Doc-2 A-05 relaxed, v1.0.13)"** — pointer note, no type change.
- `no_formal_spec` (PassB Part1:53) remains a valid field; it simply no longer participates in a gate.

## 3. Carried gate (from the linked Doc-2 patch)

The matching-pipeline **tier-gate** behaviour for a no-value RFQ is the open sub-decision
`[ESC-RFQ-VALUE-OPTIONAL-TIERGATE]` recorded in `Doc-2_Patch_v1.0.13_RfqSubmissionGate` §3. It gates the
Wave-4 **matching realization** (Doc-4E PassB Part2), **not** this submission-gate change. `submit_rfq`
itself is un-gated by value; the engine's handling of an absent value is owed to the M3 owner.
