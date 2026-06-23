# Doc-4M_Structure_Patch_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4M_Structure_Patch_v1.0` |
| Nature | **Structure patch only.** Not a redesign, new authoring pass, scope expansion, state redesign, transition redesign, or ownership reallocation. Applies approved findings only. |
| Patch target | `Doc-4M_Structure_Proposal_v0.1` |
| Finding source | `Doc-4M_Independent_Hard_Review_v1.0` + Architecture Board Assessment (findings F4M-SR-01 / F4M-SR-02 / F4M-SR-03 / F4M-SR-04 / F4M-SR-05) |
| Authority | Master Architecture (FROZEN) → ADR Compendium (FROZEN) → Doc-2 v1.0.3 (FROZEN) → Doc-3 v1.0.2 (FROZEN) → Doc-4A v1.0 (FROZEN) → Doc-4B–4L (FROZEN) → Doc-4M_Structure_Proposal_v0.1. On any conflict: **FLAG-AND-HALT**. |
| Patch scope | **Mandatory:** F4M-SR-01, F4M-SR-02. **Recommended:** F4M-SR-03, F4M-SR-04, F4M-SR-05. No other finding patched. No self-generated finding. |
| Discipline | Reference-never-restate preserved. No state, transition, workflow, ownership, actor, business rule, or escalation marker invented, modified, or resolved. |

---

## Patch Summary

| Patch ID | Finding | Severity | Affected Section | Nature |
|---|---|---|---|---|
| P-4M-01 | F4M-SR-01 | MINOR (mandatory) | M3 + M4 — footer notes | Add §5-vs-§3 classification footnotes: distinguish named state machines from status-enum-only entities |
| P-4M-02 | F4M-SR-02 | MINOR (mandatory) | M3 — `Trust / Performance Score` row | Add inline clarification: derived aggregate, score-update events only, no lifecycle state machine |
| P-4M-03 | F4M-SR-03 | NITPICK (recommended) | M5 — `Custom Domain` row | Split two-hop `pending → verified → active` into two single-transition rows |
| P-4M-04 | F4M-SR-04 | NITPICK (recommended) | M3 — `Ban Action` row | Remove `Ban Action` as lifecycle entity; add footer note pointing to M5 + M6-4 |
| P-4M-05 | F4M-SR-05 | NITPICK (recommended) | M5 — section header | Strengthen disclaimer: "representative sample, not exhaustive" |

---

# P-4M-01 — F4M-SR-01

**Affected Section:** M3 — State Machine Inventory (footer note) + M4 — State Authority Matrix (footer note).
**Finding Reference:** F4M-SR-01 (MINOR, MANDATORY).

### Existing Text (M3 — current footer)

```
*Module 0 — Platform Core owns no business-entity state machine; it provides infrastructure (audit/outbox/UUID/POLICY) consumed by the state-transition contracts of the owning modules (Doc-4B). AI artifacts (Module 9) have a cache lifecycle, not a business state machine (Doc-4K; Doc-2 §10.10) — listed for completeness, flagged as derived/disposable.*

*Owner BC values reference each module's frozen bounded-context inventory; the authoritative BC identity is in the referenced document.*
```

### Amendment Text (M3 — replacement footer)

```
*Module 0 — Platform Core owns no business-entity state machine; it provides infrastructure (audit/outbox/UUID/POLICY) consumed by the state-transition contracts of the owning modules (Doc-4B). AI artifacts (Module 9) have a cache lifecycle, not a business state machine (Doc-4K; Doc-2 §10.10) — listed for completeness, flagged as derived/disposable.*

*Owner BC values reference each module's frozen bounded-context inventory; the authoritative BC identity is in the referenced document.*

*Lifecycle classification: entries in this inventory fall into two categories — (a) **Named Doc-2 §5 state machine** — a full state/transition graph with guards is defined in Doc-2 §5 and the owning module's frozen Doc-4 state-transition contracts (e.g., RFQ §5.4, Organization §5.1, Subscription §5.7); (b) **Doc-2 §3 status enum only** — the entity carries a status field enumerated in Doc-2 §3 but has no named §5 state machine; the authoritative transition guards (if any) are in the owning Doc-4 module contract, not in a dedicated Doc-2 §5 entry. A §3 status enum is not a lifecycle state machine. Do not derive transition contracts from the field definition alone.*
```

### Existing Text (M4 — current footer)

```
*State strings are quoted as navigation keys into the source enumeration. The authoritative state set, including any state not surfaced here, is in the Reference Source. This matrix introduces no state.*
```

### Amendment Text (M4 — replacement footer)

```
*State strings are quoted as navigation keys into the source enumeration. The authoritative state set, including any state not surfaced here, is in the Reference Source. This matrix introduces no state.*

*Where the Reference Source is Doc-2 §3 (status enum) rather than Doc-2 §5 (named state machine), the listed states are the field-level enumeration only — no authoritative transition graph exists in Doc-2 for these entities. Transition guards (if any) are in the owning module's frozen Doc-4 state-transition contract. Do not infer a full lifecycle state machine from a §3 status enum.*
```

### Rationale

F4M-SR-01 requires an explicit structural distinction between Doc-2 §5 named state machines (full transition graph with guards in corpus) and Doc-2 §3 status enums (field-level enumeration only; no §5 transition graph). The finding targets M3 and M4 as the AI-agent-facing surfaces where the ambiguity is most dangerous. The patch adds footer notes to both sections; no inventory row is added, removed, or modified. The distinction is navigational, not definitional — no state or transition is introduced.

### Verification Notes

- No inventory row added, removed, or modified in M3.
- No state added or removed in M4.
- No transition introduced.
- No ownership changed.
- Footer notes added verbatim per finding guidance; wording aligns with "status enum ≠ lifecycle state machine" requirement.
- M3 existing footnotes (Platform Core / AI artifacts / Owner BC note) preserved unchanged above the new paragraph.

---

# P-4M-02 — F4M-SR-02

**Affected Section:** M3 — State Machine Inventory → `Trust / Performance Score` row.
**Finding Reference:** F4M-SR-02 (MINOR, MANDATORY).

### Existing Text

```
| Trust / Performance Score | 5 — Trust & Verification | Scoring | Doc-2 §8 (score events); Doc-4G (FROZEN) |
```

### Amendment Text

```
| Trust / Performance Score | 5 — Trust & Verification | Scoring | Doc-2 §8 (score events); Doc-4G (FROZEN) — score-update events only; no lifecycle state machine; derived aggregate, not a stateful entity |
```

### Rationale

F4M-SR-02 requires the `Trust / Performance Score` row to be clearly marked as a derived aggregate with score-update events only and no lifecycle state machine. The finding notes that Doc-4K's AI artifacts receive this treatment via footnote; Trust/Performance Score warrants the same inline clarification to prevent an AI agent from seeking or implementing a non-existent state machine. The row is not removed (it is a legitimate corpus reference); the inline parenthetical is added to the Reference Source cell, matching the form used for AI artifacts in M3's existing footer. No state is added to M4 for this entity; it has no M4 row and none is introduced.

### Verification Notes

- Row retained in M3; entity is a legitimate corpus reference.
- No state introduced (Trust/Performance Score has no M4 row; none added).
- No transition introduced.
- No ownership changed.
- Reference Source pointers (`Doc-2 §8`; `Doc-4G (FROZEN)`) preserved unchanged; clarification appended, not substituted.
- Inline wording ("score-update events only; no lifecycle state machine; derived aggregate, not a stateful entity") matches the finding's required language exactly.

---

# P-4M-03 — F4M-SR-03

**Affected Section:** M5 — Transition Authority Matrix → `Custom Domain` row.
**Finding Reference:** F4M-SR-03 (NITPICK, RECOMMENDED).

### Existing Text

```
| Custom Domain | `pending` | `verified` → `active` | Marketplace (entitlement-gated) | Doc-2 §3; Doc-4D (FROZEN) |
```

### Amendment Text

```
| Custom Domain | `pending` | `verified` | Marketplace (entitlement-gated) | Doc-2 §3; Doc-4D (FROZEN) |
| Custom Domain | `verified` | `active` | Marketplace (entitlement-gated) | Doc-2 §3; Doc-4D (FROZEN) |
```

### Rationale

F4M-SR-03 requires the two-hop `pending → verified → active` conflation to be split into two single-transition rows, consistent with the one-transition-per-row discipline established throughout M5 and required by the Doc-4A state-transition contract template (21.4). The trigger authority is identical for both transitions per the corpus (`Doc-2 §3; Doc-4D`) — the split is structural normalization only, not an authority change. No transition is invented; both transitions are already implicit in the original `pending → verified → active` entry.

### Verification Notes

- No new transition introduced — both transitions already existed implicitly in the conflated row; this patch makes the structure explicit.
- Trigger authority unchanged for both rows: `Marketplace (entitlement-gated)` per `Doc-2 §3; Doc-4D (FROZEN)`.
- No new entity, state, or ownership introduced.
- Row count increases by one (one row → two rows) for this entity only.

---

# P-4M-04 — F4M-SR-04

**Affected Section:** M3 — State Machine Inventory → `Ban Action` row (removal) + M3 footer note (addition).
**Finding Reference:** F4M-SR-04 (NITPICK, RECOMMENDED).

### Existing Text (M3 table row)

```
| Ban Action | 8 — Admin | Ban | Doc-2 §8 (`VendorBanned`); Doc-4J (FROZEN) |
```

### Amendment Text (M3 table row)

*(Row removed. No replacement row. See footer note below.)*

### Existing Text (M3 footer — after P-4M-01 additions)

*(Footer as amended by P-4M-01 — no additional change to existing text.)*

### Amendment Text (M3 footer — additional note appended)

```
*Admin ban (`staff_can_ban`) is not a lifecycle entity with its own state machine. It is represented as a `Vendor Profile → banned` transition (M5) driven by the Admin via `VendorBanned` event, and as a cross-module seam (M6-4, Admin → Marketplace). There is no `ban_actions` aggregate or §5 state machine in the frozen corpus.*
```

### Rationale

F4M-SR-04 identifies `Ban Action` as a non-entity listed as a lifecycle entity in M3. The ban is an event/command (`VendorBanned`, Doc-2 §8) and a permission (`staff_can_ban`, Doc-4J); it drives a `Vendor Profile` state transition. It has no `ban_actions` table, no §5 state machine, and no lifecycle states in the frozen corpus. Removing it from M3 and adding an explanatory footer note prevents an AI agent from seeking a non-existent `ban_actions` aggregate while preserving navigational clarity by pointing to M5 and M6-4 where the ban is correctly represented. No state, transition, or entity is invented.

### Verification Notes

- `Ban Action` row removed from M3 — it is not a lifecycle entity in the frozen corpus.
- No replacement entity row added.
- Footer note appended directing readers to M5 (`Vendor Profile → banned`) and M6-4 (Admin → Marketplace seam) where the ban is correctly documented.
- M5 `Vendor Profile → banned` row (already present in the proposal) is untouched.
- M6-4 seam row (already present in the proposal) is untouched.
- No state, transition, ownership, or event introduced.

---

# P-4M-05 — F4M-SR-05

**Affected Section:** M5 — Transition Authority Matrix → section header / opening paragraph.
**Finding Reference:** F4M-SR-05 (NITPICK, RECOMMENDED).

### Existing Text

```
**Reference only. Do not restate transition rules.** Representative transitions per entity with the actor/contract that owns the trigger. Guards, pre/post-conditions, and the validity clock are **not** restated; they live in Doc-3 and the owning module's state-transition contract. (Pass-A will enumerate the full transition set per entity; this proposal scaffolds the matrix shape with the canonical anchors.)
```

### Amendment Text

```
**Reference only. Do not restate transition rules.** Representative transitions per entity with the actor/contract that owns the trigger. Guards, pre/post-conditions, and the validity clock are **not** restated; they live in Doc-3 and the owning module's state-transition contract.

**This matrix is a representative sample only — it is NOT exhaustive.** Pass-A will populate the full transition set for every entity enumerated in M3. Entities not yet listed below (e.g., Organization, Membership, Delegation Grant, Advertisement, Document Template) have transitions defined in their authoritative sources; the absence of a row here does not mean no transition exists. Do not treat this partial matrix as the complete transition inventory.
```

### Rationale

F4M-SR-05 requires the M5 disclaimer to be strengthened so that "representative sample, not exhaustive" is unambiguous to both human readers and AI coding agents. The existing disclaimer ("this proposal scaffolds the matrix shape with the canonical anchors") is accurate but insufficiently prominent — it does not name unlisted entities or explicitly prohibit treating the partial matrix as complete. The amendment promotes the disclaimer to a standalone bold paragraph, names example unlisted entities, and adds the explicit prohibition. No transition is added, removed, or modified; the matrix content itself is unchanged by this patch.

### Verification Notes

- No transition row added, removed, or modified in M5.
- No entity, state, ownership, or event introduced.
- Disclaimer text strengthened; matrix content unchanged.
- Named example entities (Organization, Membership, Delegation Grant, Advertisement, Document Template) are not introduced — they are cited to illustrate incompleteness, not to define their transitions.

---

## Mandatory Validation

Confirmed for this patch set:

| Validation check | Result |
|---|---|
| No new state introduced | PASS — no state added anywhere; M4 gains no row; Trust/Performance Score M4 absence unchanged |
| No new transition introduced | PASS — Custom Domain split (P-4M-03) makes implicit transitions explicit; no new transition created |
| No new workflow introduced | PASS — no workflow narrative added |
| No new ownership introduced | PASS — no Owner Module/BC changed or added |
| No new event introduced | PASS — `VendorBanned` referenced in P-4M-04 footer note but not created; it is a corpus citation only |
| No escalation marker modified | PASS — M7 escalation table entirely untouched by all five patches |
| No escalation marker resolved | PASS — all M7 markers remain unresolved; "list only, no resolution" posture intact |

**Cross-finding consistency:** P-4M-01 (§3-vs-§5 footer) and P-4M-02 (Trust/Performance Score inline annotation) are complementary — P-4M-01 establishes the classification framework; P-4M-02 applies it to a specific ambiguous row. P-4M-03 (Custom Domain split) is purely structural and does not affect any other row. P-4M-04 (Ban Action removal + footer) is consistent with P-4M-01's framework (ban has no §5 state machine) and leaves M5/M6 untouched. P-4M-05 (M5 disclaimer) is independent and additive. No patch alters the slug catalog, state enumeration, transition graph, event ownership, or escalation markers.

---

*End of Doc-4M_Structure_Patch_v1.0. Structure patch for Doc-4M_Structure_Proposal_v0.1. Applies F4M-SR-01 (MANDATORY — M3+M4 §5-vs-§3 classification footnotes), F4M-SR-02 (MANDATORY — Trust/Performance Score inline derived-aggregate clarification), F4M-SR-03 (RECOMMENDED — Custom Domain two-row split), F4M-SR-04 (RECOMMENDED — Ban Action removed from lifecycle inventory; footer note to M5/M6-4), F4M-SR-05 (RECOMMENDED — M5 disclaimer strengthened to "representative sample, not exhaustive"). No state, transition, workflow, ownership, actor, business rule, or escalation marker introduced, modified, or resolved; reference-never-restate preserved. Corpus authority: Master Architecture FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN) → Doc-4M_Structure_Proposal_v0.1. Patch document only — no verification, freeze assessment, or self-review performed.*
