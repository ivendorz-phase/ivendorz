# Doc-4M_PassA_Patch_v1.0

| Field | Value |
|---|---|
| Document | `Doc-4M_PassA_Patch_v1.0` |
| Nature | **Content patch only.** Not a redesign, new authoring pass, scope expansion, state redesign, transition redesign, or ownership reallocation. Applies approved findings only. |
| Patch target | `Doc-4M_PassA_Content_v1.0` |
| Finding source | `Doc-4M_PassA_Independent_Hard_Review_v1.0` + Architecture Board Assessment (findings F4M-PA-01 / F4M-PA-02 / F4M-PA-03 / F4M-PA-04) |
| Authority | Master Architecture (FROZEN) → ADR Compendium (FROZEN) → Doc-2 v1.0.3 (FROZEN) → Doc-3 v1.0.2 (FROZEN) → Doc-4A v1.0 (FROZEN) → Doc-4B–4L (FROZEN) → Doc-4M_Structure_FROZEN_v1.0 → Doc-4M_PassA_Content_v1.0. On any conflict: **FLAG-AND-HALT**. |
| Patch scope | **Mandatory:** F4M-PA-01, F4M-PA-02. **Recommended:** F4M-PA-03, F4M-PA-04. No other finding patched. No self-generated finding. |
| Discipline | Reference-never-restate preserved. No state, transition, workflow, ownership, actor, business rule, or escalation marker invented, modified, or resolved. |

---

## Patch Summary

| Patch ID | Finding | Severity | Affected Section | Nature |
|---|---|---|---|---|
| P-4M-PA-01 | F4M-PA-01 | MINOR (mandatory) | M5 — Organization block (From State cell, first row) | Replace non-canonical `unverified (claim pending)` with corpus-compliant pointer |
| P-4M-PA-02 | F4M-PA-02 | MINOR (mandatory) | M5 — Vendor Profile `claimed → verified` row + M6 (new seam row M6-8) | Resolve dangling "see M6" pointer: add M6-8 Trust → Marketplace claim-status seam |
| P-4M-PA-03 | F4M-PA-03 | NITPICK (recommended) | M5 — Subscription `active → active` rows (two rows) | Clarify same-state lifecycle events as flag mutation / renewal; not state transitions |
| P-4M-PA-04 | F4M-PA-04 | NITPICK (recommended) | M5 — Engagement From State `(created)` | Replace with form that cannot be misread as a state enum value |

---

# P-4M-PA-01 — F4M-PA-01

**Affected Section:** M5 — Organization block → first transition row (From State column).
**Finding Reference:** F4M-PA-01 (MINOR, MANDATORY).

### Existing Text

```
| Organization | `unverified` (claim pending) | `claimed` | User (Owner completes org claim) | Doc-2 §5.1; Doc-4C (FROZEN) |
```

### Amendment Text

```
| Organization | per Doc-2 §5.1 (pre-claim state) | `claimed` | User (Owner completes org claim) | Doc-2 §5.1; Doc-4C (FROZEN) |
```

### Rationale

F4M-PA-01 identifies `unverified (claim pending)` as a non-canonical state string not found in Doc-2 §5.1. The Organization state machine in Doc-2 §5.1 defines a claim/operational dimension but does not enumerate a state named `unverified`. The finding requires replacement with either the exact Doc-2 §5.1 state name or a corpus-compliant pointer form if no single canonical state string is enumerated. Doc-2 §5.1 describes the Organization lifecycle in claim/operational dimensions without naming a discrete `unverified` state; M4 already represents this correctly as "per Doc-2 §5.1 (claim/operational dimensions)". The amendment aligns M5's From State cell with the same "per source" pointer pattern used in M4, making the navigation key unambiguous: an AI agent reading "per Doc-2 §5.1 (pre-claim state)" will open §5.1 to find the authoritative state name rather than searching for a non-existent `unverified` enum. No state is introduced or renamed.

### Verification Notes

- `unverified` removed from M5 From State column; not a Doc-2 §5.1 canonical state string.
- Replacement "per Doc-2 §5.1 (pre-claim state)" is a pointer, not a state definition.
- To State (`claimed`), Trigger Authority, and Reference Source unchanged.
- No state introduced. No transition invented. No ownership changed.
- Consistent with M4 "per Doc-2 §5.1 (claim/operational dimensions)" pointer pattern.

---

# P-4M-PA-02 — F4M-PA-02

**Affected Section:** M5 — Vendor Profile `claimed → verified` row (M5 Reference Source cell) + M6 (new seam row M6-8 appended).
**Finding Reference:** F4M-PA-02 (MINOR, MANDATORY).

### Existing Text (M5 Vendor Profile row)

```
| Vendor Profile | `claimed` | `verified` | Trust verification decision (Doc-4G) | Doc-2 §5.3; Doc-4G → Doc-4D (FROZEN) — see M6 |
```

### Amendment Text (M5 Vendor Profile row)

```
| Vendor Profile | `claimed` | `verified` | Trust verification decision (Doc-4G) | Doc-2 §5.3; Doc-4G → Doc-4D (FROZEN) — see M6-8 |
```

### Existing Text (M6 — current last row and footer)

```
| M6-7 | **Marketplace → Trust.** Ownership transfer triggers the Trust Protection Workflow (trust freeze → review → reactivation). | Vendor ownership transfer approval (2 — Marketplace) emits `VendorOwnershipTransferred` | Trust freeze/reactivation workflow (5 — Trust) | Doc-2 §5.3, §8; Doc-4D → Doc-4G (FROZEN) |

*Each cross-module transition rides the frozen Doc-2 §8 event (or a named service seam); the emitting module owns the event and the consuming module authors its own consumer (single-authorship). This index records the dependency; the authoritative contracts are in the cited frozen documents. Event payload/idempotency are not restated.*
```

### Amendment Text (M6 — M6-8 inserted between M6-7 row and footer)

```
| M6-7 | **Marketplace → Trust.** Ownership transfer triggers the Trust Protection Workflow (trust freeze → review → reactivation). | Vendor ownership transfer approval (2 — Marketplace) emits `VendorOwnershipTransferred` | Trust freeze/reactivation workflow (5 — Trust) | Doc-2 §5.3, §8; Doc-4D → Doc-4G (FROZEN) |
| M6-8 | **Trust → Marketplace (claim-status).** Verification approval updates the Vendor Profile claim dimension from `claimed` to `verified`. | Verification record approval (5 — Trust, via verification_tasks; `staff_can_verify`) | Vendor Profile claim status updated `claimed → verified` (2 — Marketplace / Doc-4D reflects; Trust never writes vendor_profiles directly) | Doc-2 §5.3, §5.6; Doc-4G → Doc-4D (FROZEN) |

*Each cross-module transition rides the frozen Doc-2 §8 event (or a named service seam); the emitting module owns the event and the consuming module authors its own consumer (single-authorship). This index records the dependency; the authoritative contracts are in the cited frozen documents. Event payload/idempotency are not restated.*
```

### Rationale

F4M-PA-02 identifies a dangling "see M6" pointer in the M5 Vendor Profile `claimed → verified` row with no corresponding M6 seam entry. The Trust → Marketplace claim-status seam is a real, frozen, corpus-supported dependency: Doc-2 §5.3 owns the Vendor Profile claim dimension in Marketplace (Doc-4D); Doc-2 §5.6 governs the Verification Record lifecycle in Trust (Doc-4G); the verification approval outcome (Trust-owned) updates the Vendor Profile claim status (Marketplace-owned). This is structurally identical to the Admin → Trust (M6-5) seam pattern: one module's decision drives a state change in another module's aggregate. No new event is introduced — the reference sources (Doc-4G, Doc-4D, Doc-2 §5.3/§5.6) are all already cited in M5's existing row. The M5 pointer is updated from "see M6" to "see M6-8" for precision. The M6-8 row documents the seam without restating verification-record lifecycle, event contracts, or ownership definitions.

### Verification Notes

- M5 Vendor Profile row: Reference Source updated from "— see M6" to "— see M6-8"; all other cells unchanged.
- M6 gains one new row (M6-8): Trust → Marketplace claim-status seam.
- No new event invented — M6-8 references existing frozen sources only (Doc-4G, Doc-4D, Doc-2 §5.3/§5.6).
- No ownership changed — Trust owns verification decision; Marketplace owns `vendor_profiles`; this is an existing frozen seam, not a new one.
- M6-8 is distinct from M6-3 (tier history synchronization, `VendorTierChanged`) and M6-5 (Admin → Trust verification decision routing); M6-8 covers the downstream claim-status update in Marketplace only.
- No state, transition, workflow, or actor invented. Single-authorship principle preserved (Marketplace authors its own consumer; Trust never writes `vendor_profiles` directly).

---

# P-4M-PA-03 — F4M-PA-03

**Affected Section:** M5 — Subscription block → two `active → active` rows.
**Finding Reference:** F4M-PA-03 (NITPICK, RECOMMENDED).

### Existing Text (two rows)

```
| Subscription | `active` | `active` (auto_renew=false) | User (`can_manage_billing`; cancel = flag, not state change) | Doc-2 §5.7 (A-06); Doc-4I (FROZEN) |
| Subscription | `active` | `active` (renewed) | System (auto-renewal success); emits `SubscriptionRenewed` | Doc-2 §5.7, §8; Doc-4I (FROZEN) |
```

### Amendment Text (two rows)

```
| Subscription | `active` | `active` *(flag mutation — state unchanged; cancel = auto_renew=false per A-06)* | User (`can_manage_billing`) | Doc-2 §5.7 (A-06); Doc-4I (FROZEN) |
| Subscription | `active` | `active` *(renewal event — state unchanged; emits `SubscriptionRenewed` per A-06)* | System (auto-renewal success) | Doc-2 §5.7, §8; Doc-4I (FROZEN) |
```

### Rationale

F4M-PA-03 identifies the two `active → active` same-state rows as structurally imprecise: a From State = To State row is not a DDD state transition; it is an intra-state lifecycle event or data mutation. Doc-2 §5.7 (A-06) explicitly defines cancel as a flag (`auto_renew=false`) and renewal as "still active." The amendment adds inline italicized parentheticals to the To State cell of each row making unambiguous that these are not state-change transitions. This prevents AI agents from generating no-op state-change code for these rows. The A-06 escalation marker citation is retained and reinforced. No state, event, or trigger authority is changed.

### Verification Notes

- Both rows retained in M5 — they document real lifecycle events even if not state transitions.
- To State cells annotated with italic parentheticals: "flag mutation — state unchanged" and "renewal event — state unchanged".
- A-06 citation preserved in both rows.
- Trigger authorities unchanged. Reference Sources unchanged.
- No state, transition, event, or ownership introduced.
- M7 `ASSUMPTION A-06` marker untouched.

---

# P-4M-PA-04 — F4M-PA-04

**Affected Section:** M5 — Engagement block → first row (From State column).
**Finding Reference:** F4M-PA-04 (NITPICK, RECOMMENDED).

### Existing Text

```
| Engagement | `(created)` | `active` | System (`RFQClosedWon` creates and activates) | Doc-2 §3.5, §8; Doc-4F (FROZEN) — see M6 |
```

### Amendment Text

```
| Engagement | `—` *(no prior state; created directly into `active` by `RFQClosedWon`)* | `active` | System (`RFQClosedWon` creates and activates) | Doc-2 §3.5, §8; Doc-4F (FROZEN) — see M6-1 |
```

### Rationale

F4M-PA-04 identifies `(created)` in the From State cell as a parenthetical that could be misread by an AI agent as `Engagement.state = 'created'`. The finding requires replacement with a form unambiguous as non-state. The amendment uses `—` (em-dash) as the primary From State indicator (standard notation for "entity does not yet exist") with an explanatory italic parenthetical. The "see M6" pointer is also made precise: the relevant M6 seam is M6-1 (RFQ → Operations; `RFQClosedWon` creates the Engagement), so the pointer is sharpened to "see M6-1". No state, transition, or ownership is changed.

### Verification Notes

- `(created)` removed from From State column; replaced with `—` + non-state explanatory note.
- No `created` state exists in the Engagement lifecycle (Doc-2 §3.5; Doc-4F); none introduced here.
- Trigger Authority and To State unchanged.
- Reference Source "see M6" sharpened to "see M6-1" (the RFQ → Operations seam that creates the Engagement) — precision correction, not a navigation change.
- No state, transition, event, or ownership introduced.

---

## Mandatory Validation

Confirmed for this patch set:

| Validation check | Result |
|---|---|
| No new state introduced | PASS — `unverified` removed; no replacement state name coined; "per Doc-2 §5.1 (pre-claim state)" is a pointer only |
| No new transition introduced | PASS — M6-8 documents an existing frozen seam; no new transition created; M5 Vendor Profile row content unchanged |
| No new workflow introduced | PASS — no workflow narrative added |
| No new ownership introduced | PASS — M6-8 restates existing ownership (Trust decision; Marketplace reflects); no Owner Module/BC changed |
| No new event introduced | PASS — M6-8 references existing frozen sources only; no event coined |
| No escalation marker modified | PASS — M7 table entirely untouched; A-06 citation in M5 Subscription rows preserved and reinforced |
| No escalation marker resolved | PASS — all M7 markers remain unresolved |

**Cross-finding consistency:** P-4M-PA-01 (pointer replacement) and P-4M-PA-02 (M6-8 addition + M5 pointer sharpening) are independent. P-4M-PA-03 (Subscription annotation) is additive to the To State cell only; does not affect Trigger Authority, events, or A-06. P-4M-PA-04 (Engagement From State + M6 pointer precision) sharpens "see M6" to "see M6-1" — consistent with P-4M-PA-02 which sharpens "see M6" to "see M6-8" in a different M5 row. No patch alters the state enumeration, transition graph, event ownership, or escalation markers.

---

*End of Doc-4M_PassA_Patch_v1.0. Content patch for Doc-4M_PassA_Content_v1.0. Applies F4M-PA-01 (MANDATORY — Organization M5 From State `unverified` → "per Doc-2 §5.1 (pre-claim state)" pointer), F4M-PA-02 (MANDATORY — Vendor Profile M5 "see M6" → "see M6-8"; M6-8 Trust → Marketplace claim-status seam added), F4M-PA-03 (RECOMMENDED — Subscription `active → active` rows annotated as flag mutation / renewal event, state unchanged, per A-06), F4M-PA-04 (RECOMMENDED — Engagement From State `(created)` → `—` non-state notation; M5 "see M6" → "see M6-1"). No state, transition, workflow, ownership, actor, business rule, or escalation marker introduced, modified, or resolved; reference-never-restate preserved. Corpus authority: Master Architecture FINAL → ADR Compendium v1 → Doc-2 v1.0.3 → Doc-3 v1.0.2 → Doc-4A v1.0 → Doc-4B–4L (FROZEN) → Doc-4M_Structure_FROZEN_v1.0 → Doc-4M_PassA_Content_v1.0. Patch document only — no verification, freeze assessment, or self-review performed.*
