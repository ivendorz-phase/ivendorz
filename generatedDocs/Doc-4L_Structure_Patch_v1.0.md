# Doc-4L_Structure_Patch_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4L_Structure_Patch_v1.0` |
| Nature | **Structure patch only.** Not a redesign, new authoring pass, scope expansion, permission redesign, or ownership redesign. Applies approved findings only. |
| Patch target | `Doc-4L_Structure_Proposal_v0.1` |
| Finding source | `Doc-4L_Independent_Hard_Review_v1.0` + Architecture Board Assessment (findings F4L-SR-01 / F4L-SR-02 / F4L-SR-03) |
| Authority | Master Architecture (FROZEN) → ADR Compendium (FROZEN) → Doc-2 v1.0.3 (FROZEN) → Doc-3 v1.0.2 (FROZEN) → Doc-4A v1.0 (FROZEN) → Doc-4B–4K (FROZEN) → Doc-4L_Structure_Proposal_v0.1. On any conflict: **FLAG-AND-HALT**. |
| Patch scope | **Mandatory:** F4L-SR-01. **Recommended:** F4L-SR-02, F4L-SR-03. No other finding patched. No self-generated finding. |
| Discipline | Reference-never-restate preserved. No permission, ownership, role, actor, business rule, or escalation marker invented, modified, or resolved. |

---

## Patch Summary

| Patch ID | Finding | Severity | Affected Section | Nature |
|---|---|---|---|---|
| P-4L-01 | F4L-SR-01 | MINOR (mandatory) | L3 — Permission Ownership Matrix (`can_submit_verification` row) | Reference Source → ownership authority only; remove dependency attribution from the ownership row (dependency remains in L5-1) |
| P-4L-02 | F4L-SR-02 | NITPICK (recommended) | L3 — Permission Ownership Matrix (`can_create_documents` row) | Reconcile Owner BC against frozen Doc-4F: single BC-OPS-2 authoritative; point to Doc-4F as resolution authority |
| P-4L-03 | F4L-SR-03 | NITPICK (recommended) | L6 — Escalation Markers (preamble) | Add marker-format clarification (verbatim carry; source-native; not normalized) |

---

# P-4L-01 — F4L-SR-01

**Affected Section:** L3 — Permission Ownership Matrix → `can_submit_verification` row.
**Finding Reference:** F4L-SR-01 (MINOR, MANDATORY).

### Existing Text

```
| `can_submit_verification` | 1 — Identity | Organization (verification submission authority) — see L5 (records owned by Trust) | Doc-2 §7; Doc-4C (FROZEN) DC-2 |
```

### Amendment Text

```
| `can_submit_verification` | 1 — Identity | Organization (verification submission authority) | Doc-2 §7; Doc-4C (FROZEN) |
```

### Rationale

The finding requires the L3 Reference Source to cite **ownership authority only**, removing the dependency attribution from the ownership row. The Owner-BC cell previously carried an inline dependency note ("— see L5 (records owned by Trust)") and the Reference Source cited the `DC-2` dependency-boundary clause. Per F4L-SR-01, the ownership row is corrected to `Doc-2 §7; Doc-4C (FROZEN)` (ownership authority only). The cross-module dependency (submission slug Identity-owned; `verification_records` Trust-owned) **remains documented only in L5-1**, which is unchanged. Ownership is unchanged (Identity), the dependency is unchanged (still in L5-1), and no permission is changed.

### Verification Notes

- Owner Module unchanged: `1 — Identity`.
- Owner BC cell cleaned to the ownership statement only; dependency cross-reference removed from L3.
- Reference Source set to `Doc-2 §7; Doc-4C (FROZEN)` exactly as the finding specifies.
- L5-1 (the cross-module dependency row) is **not** modified by this patch — the dependency remains documented there with its full provenance.
- No ownership, dependency, or permission change introduced.

---

# P-4L-02 — F4L-SR-02

**Affected Section:** L3 — Permission Ownership Matrix → `can_create_documents` row.
**Finding Reference:** F4L-SR-02 (NITPICK, RECOMMENDED).

### Existing Text

```
| `can_create_documents` | 4 — Business Operations | BC-OPS-2 / BC-OPS-4 (documents) | Doc-2 §7; Doc-4F (FROZEN) |
```

### Amendment Text

```
| `can_create_documents` | 4 — Business Operations | BC-OPS-2 Engagement & Commercial Documents | Doc-2 §7; Doc-4F (FROZEN) — BC attribution per Doc-4F |
```

### Rationale

The finding directs reconciliation of the Owner BC against the authoritative frozen Doc-4F source, with the instruction not to infer. The frozen Doc-4F (Structure, FROZEN) resolves this to a **single authoritative BC**:

- **BC-OPS-2 — Engagement & Commercial Documents** owns the post-award engagement and its document chain (`lois`, `purchase_orders`, `challans`, `trade_invoices`, `payment_records`, `work_completion_certificates`), and its service surface is "engagement lifecycle, **document issue/revision**, payment-record tracking" (Doc-4F BC-OPS-2 ownership + services).
- **BC-OPS-4 — Document Generation & Templates** owns `document_templates` (+`template_versions`) and `generated_documents` — i.e., template management and the generation engine, gated by `can_manage_templates`, not `can_create_documents`. Doc-4F records that BC-OPS-2 *references* BC-OPS-4 for generation, but the document-creation authority is BC-OPS-2's.

Per F4L-SR-02 ("if a single BC is authoritative, use single BC"), the dual attribution is corrected to single **BC-OPS-2**, with Doc-4F named as the resolution authority. This is a precision correction to the BC reference only — no ownership change (Module 4 / Operations throughout), no permission change, no inference (the attribution is read directly from the frozen Doc-4F text).

### Verification Notes

- Owner Module unchanged: `4 — Business Operations`.
- Owner BC corrected from dual (`BC-OPS-2 / BC-OPS-4`) to single (`BC-OPS-2 Engagement & Commercial Documents`), per the frozen Doc-4F ownership/service statements — not inferred.
- Reference Source retains `Doc-2 §7; Doc-4F (FROZEN)` and adds the explicit pointer "BC attribution per Doc-4F" as the resolution authority.
- `can_manage_templates` (BC-OPS-4) is the separate, already-correct row for template/generation authority — unchanged by this patch.
- No new BC, ownership, or permission introduced.

---

# P-4L-03 — F4L-SR-03

**Affected Section:** L6 — Escalation Markers → preamble.
**Finding Reference:** F4L-SR-03 (NITPICK, RECOMMENDED).

### Existing Text

```
**List only. No resolution.** Unresolved permission-related escalation markers and open dependencies inherited from the frozen corpus. Each is carried verbatim from its source; Doc-4L resolves none.
```

### Amendment Text

```
**List only. No resolution.** Unresolved permission-related escalation markers and open dependencies inherited from the frozen corpus. Each is carried verbatim from its source; Doc-4L resolves none.

Marker identifiers are carried verbatim from their owning frozen documents. Identifier formats are source-native and are not normalized by Doc-4L.
```

### Rationale

F4L-SR-03 requires adding a clarification to the L6 preamble stating that marker identifiers are carried verbatim from their owning frozen documents and that identifier formats are source-native and not normalized by Doc-4L. The clarification is added exactly as specified, appended to the existing preamble. This accounts for the heterogeneous identifier formats already present in the L6 table (e.g., bracketed `[ESC-AI-SLUG]` / `[ESC-OPS-SLUG]` / `[ESC-BILL-SLUG]` versus bare `[D-2]` / `DC-3`), confirming the variance is intentional source-fidelity, not a Doc-4L inconsistency. No marker is modified, renamed, or resolved.

### Verification Notes

- Clarification text added verbatim from the finding.
- Appended to the L6 preamble; the marker table itself is untouched.
- No marker identifier modified, renamed, or resolved.
- "List only. No resolution." posture preserved.

---

## Mandatory Validation

Confirmed for this patch set:

| Validation check | Result |
|---|---|
| No new permission introduced | PASS — slug set unchanged; only reference-source and BC-attribution cells edited |
| No new ownership introduced | PASS — `can_submit_verification` stays Identity; `can_create_documents` stays Operations (BC narrowed within the same module per Doc-4F) |
| No new role introduced | PASS — no role bundle added or restated |
| No new actor introduced | PASS — actor types untouched |
| No new business rule introduced | PASS — no rule added; reference-never-restate preserved |
| No escalation marker modified | PASS — L6 marker table unchanged; only a preamble clarification appended |
| No escalation marker resolved | PASS — all markers remain unresolved; "no resolution" posture intact |

**Cross-finding consistency:** F4L-SR-01 removes the L3 dependency cross-reference while L5-1 (the authoritative cross-module dependency record) is preserved unchanged — the dependency remains documented exactly once, in L5. F4L-SR-02 narrows a BC attribution within the same owning module using the frozen Doc-4F text as the named resolution authority. F4L-SR-03 adds source-fidelity language consistent with the existing verbatim-carry posture. No patch alters scope, ownership, or the slug catalog.

---

*End of Doc-4L_Structure_Patch_v1.0. Structure patch for Doc-4L_Structure_Proposal_v0.1. Applies F4L-SR-01 (MANDATORY — `can_submit_verification` L3 Reference Source → ownership authority only; dependency retained in L5-1), F4L-SR-02 (RECOMMENDED — `can_create_documents` Owner BC reconciled to single BC-OPS-2 per frozen Doc-4F), F4L-SR-03 (RECOMMENDED — L6 preamble marker-format clarification). No permission, ownership, role, actor, or business rule introduced; no escalation marker modified or resolved; reference-never-restate preserved. Corpus authority: Master Architecture FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4K (FROZEN) → Doc-4L_Structure_Proposal_v0.1. Patch document only — no verification, freeze assessment, or self-review performed.*
