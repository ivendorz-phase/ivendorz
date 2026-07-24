# Doc-3_Patch_v1.0.3_RfqSubmissionGate.md

## Status

Proposed Patch — pending independent Review-A/B + owner fold (§13). Additive; edits no frozen text
in place. Rank-0 amendment — owner-approved direction 2026-07-24 (Option C, "both fully optional").

| Field | Value |
|---|---|
| Applies to | Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md (current effective v1.0.2) |
| Produces | Doc-3 v1.0.3 (v1.0.2 + this patch) |
| Requires (linked set) | `Doc-2_Patch_v1.0.13_RfqSubmissionGate.md` (PATCH-D2-12 — relaxes §5.4 A-05); `Doc-4E_RfqSubmissionGate_Pointer_Patch_v1.0.md` (submit FIXED-set pointer) |
| Scope | Removes `estimated_value` (presence) and the specification-or-scope conditional from the §1.1 submission FIXED-set; makes both **optional at submit**. Reconciles the two dependent §1.1 rules (moderation value-plausibility; material-edit re-notify). No new module, entity, POLICY key, event, slug, or state. No POLICY key removed. |

All frozen architecture decisions, ownership boundaries, permission boundaries, governance-signal
firewalls, and marketplace doctrines preserved. The state machine (Doc-2 §5.4) is unchanged — only the
*content* of the draft→submitted exit gate is reduced.

> **Owner-override recorded (Raise ≠ Accept, §13 — not buried).** The AI reviewer RAISED a MAJOR
> caution: `estimated_value` and scope/spec are matching/routing INPUTS, not friction; making scope
> fully optional leaves vendors nothing to quote against, and the up-front-friction concern is already
> handled by draft-permissiveness (a draft needs only `category_id` + `work_nature[]`). The owner, as
> the human authority for a rank-0 amendment, ruled to proceed with the maximal option. This patch
> executes that ruling in full and preserves the caution on the record.

---

# PATCH-D3-06 — Header Alignment (administrative)

**Location:** Doc-3 header table.

**Replace:**

```
| Version | 1.0.2 |
```

**With:**

```
| Version | 1.0.3 |
```

**Replace:**

```
| Supersedes | Doc-3 v1.0.1 (Doc-3_Patch_v1.0.2 integrated) |
```

**With:**

```
| Supersedes | Doc-3 v1.0.2 (Doc-3_Patch_v1.0.3 integrated) |
```

---

# PATCH-D3-07 — §1.1 submission gate: `estimated_value` + specification become optional

**Location:** §1.1, the "Draft → Submitted" lifecycle table, row **"Validation on exit (submission gate)"**.

**Replace:**

```
| Validation on exit (submission gate) | **FIXED set:** category present and active (leaf or any level — see 1.3); `work_nature` non-empty; `estimated_value` present, > 0, BDT; delivery geography at least to district level; routing mode selected; at least one specification attachment **or** an explicit "no formal spec" flag with free-text scope ≥ a minimum length (POLICY `rfq.min_scope_chars` *[start: 200]*); attached specs reference an active document revision. |
```

**With:**

```
| Validation on exit (submission gate) | **FIXED set (reduced, v1.0.3):** category present and active (leaf or any level — see 1.3); `work_nature` non-empty; delivery geography at least to district level; routing mode selected; attached specs **(if any)** reference an active document revision. **Optional at submit (v1.0.3 · PATCH-D3-07 · owner-ruled 2026-07-24):** (a) `estimated_value` — may be omitted; **if provided it must be > 0, BDT** (the numeric VALIDATION is retained — only the *presence* requirement is dropped); (b) **specification** — an RFQ may be submitted with no attachment **and** no written scope. The `no_formal_spec` flag and POLICY `rfq.min_scope_chars` no longer gate submission; they survive as RFQ-quality-band inputs only (1.7), never a submission blocker. Rationale (owner): reduce submission friction / widen demand; the raised counter-caution is recorded in the patch header. |
```

---

# PATCH-D3-08 — §1.1 moderation: value-plausibility becomes conditional

**Location:** §1.1, the "Under review (moderation)" table, row **"Checks"**.

**Replace:**

```
| Checks | Contact-leak scrubbing (emails/phones/URLs in scope text — see 1.5); duplicate detection (same org, same category, similar scope within POLICY `moderation.dup_window_days` *[start: 14]*); value plausibility (estimated_value vs category norms — flag, never silently edit); prohibited content; RFQ quality banding (1.7) — High-quality RFQs get moderation priority. |
```

**With:**

```
| Checks | Contact-leak scrubbing (emails/phones/URLs in scope text — see 1.5); duplicate detection (same org, same category, similar scope within POLICY `moderation.dup_window_days` *[start: 14]*); value plausibility **(only when `estimated_value` is present** — vs category norms — flag, never silently edit; **an omitted value is a legitimate state (v1.0.3) and is never itself a flag)**; prohibited content; RFQ quality banding (1.7) — High-quality RFQs get moderation priority. |
```

---

# PATCH-D3-09 — §1.1 buyer edits: value/spec material-edit trigger becomes conditional

**Location:** §1.1, the RFQ edit rule, row **"Buyer edits"**.

**Replace:**

```
| Buyer edits | Edits create a new RFQ version (frozen rule: versions immutable once quoted — pre-quote edits also version, with revision reason). Material edits (spec, value, work_nature, geography, window) re-notify all invited vendors and **reset the response clock** for vendors who have not yet responded (POLICY `rfq.edit_clock_reset` *[start: true]*). |
```

**With:**

```
| Buyer edits | Edits create a new RFQ version (frozen rule: versions immutable once quoted — pre-quote edits also version, with revision reason). Material edits (spec, value, work_nature, geography, window) re-notify all invited vendors and **reset the response clock** for vendors who have not yet responded (POLICY `rfq.edit_clock_reset` *[start: true]*). **v1.0.3:** for the now-optional `value` and specification fields, the material-edit trigger fires only on a **transition** (absent→present, or present→changed) — first-time addition of a value/spec is material; leaving either absent is not an edit and never a material change. |
```

---

## Non-normative notes (no edit; recorded for reviewers)

- **§12.1 FIXED prose (unchanged).** It enumerates high-level invariants (gate-before-score, firewalls,
  self-match exclusion …), not the submission field list — the field-level gate lives at §1.1, which
  PATCH-D3-07 reduces. Nothing to strike in §12.1.
- **`rfq.min_scope_chars` (§12.2 Lifecycle) — key RETAINED.** No POLICY key is removed (Inv #8). It
  still bounds scope quality when scope is provided; it simply no longer gates submission.
- **RFQ quality banding (§1.7).** A no-value / no-scope RFQ bands **low quality** — acceptable and
  already non-gating ("a vague RFQ from a real buyer is still demand; the response is coaching, not
  exclusion"). This is now a conscious, expected outcome.
- **Doc-2 §5.4 A-05 + Doc-4E** are relaxed by the linked patches in the Requires row; without them the
  corpus would self-contradict. Fold the three together.
