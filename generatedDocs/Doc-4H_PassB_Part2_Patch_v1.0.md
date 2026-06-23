# Doc-4H_PassB_Part2_Patch_v1.0 — Corrective Patch (BC-COMM-2 Notifications, Pass-B Part 2)

| Field | Value |
|---|---|
| Document | Doc-4H_PassB_Part2_Patch_v1.0 — corrective patch for `Doc-4H_PassB_Part2_BC-COMM-2_Notifications_v1.0` |
| Nature | Corrective patch — **clarification only**. Applies F4H-PB2-NOT-M1 (MINOR). No governance change · no lifecycle redesign · no state addition/removal · no transition invention. |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4H_PassB_Part2_BC-COMM-2_Notifications_v1.0.md` |
| Frozen lifecycle authority (interpretation source) | `Doc-4H_PassA_v1.0_FROZEN` HA-6 (line 178) + HA-4.2 (line 113): `notifications` **`unread → read → archived`**; Doc-2 v1.0.3 §3.7/§10.7 (§3.7 table: `unread → read → archived`, terminal `archived`). **No frozen authority for a direct `unread → archived` edge.** |
| Determination | **Outcome A** — the frozen lifecycle is **strict-linear**: `archive allowed only from `read``. The draft's `unread → archived` wording was an inferred convenience absent from frozen authority and is removed. |
| Preserved unchanged | BC/aggregate/event/dependency/permission/audit/escalation ownership; contract inventory; validation matrices (canonical 1→9); authorization behavior; idempotency behavior; error model (REFERENCE ≠ DEPENDENCY, STATE ≠ CONFLICT); procurement-moat boundaries; trust-firewall boundaries. **No new state, no removed state, no invented transition** — the frozen `unread → read → archived` states/edges are unchanged; only the document's restatement is made unambiguous. |

---

## Patch 1 — F4H-PB2-NOT-M1 · resolve `archived`-reachability ambiguity in §HB-2.4 (MINOR)

**Issue.** §HB-2.4 (`comm.archive_notification.v1`) stated archive as reachable from **both** `unread` and `read` (`unread → archived` or `read → archived`) while the document's frozen-anchor restatement and the §HB-2.5 consolidation cite the linear `unread → read → archived`. Two readings of `archived`-reachability coexisted → lifecycle interpretation ambiguity.

**Determination (Pass-A re-opened for interpretation only).** `Doc-4H_PassA_v1.0_FROZEN` (HA-6 line 178; HA-4.2 line 113) and Doc-2 v1.0.3 §3.7/§10.7 define `notifications` as **`unread → read → archived`** — a strict-linear sequence with no `unread → archived` edge. **Outcome A applies: archive is allowed only from `read`.** A notification must be marked read (`comm.mark_notification_read.v1`) before it can be archived; `unread → archived` is illegal (`STATE`).

### 1.1 — §HB-2.4 · **4. Validation Matrix** · Stage 6 STATE row

**Original**

```
| 6 STATE | Doc-2 §3.7 | notification is `unread` or `read` (transition `→ archived`); already-`archived` is idempotent no-op (terminal) | `STATE` |
```

**Replacement**

```
| 6 STATE | Doc-2 §3.7 | notification is `read` (transition `read → archived`; **archive allowed only from `read`** per the frozen linear lifecycle); `unread → archived` is illegal (mark read first); already-`archived` is an idempotent no-op (terminal) | `STATE` |
```

### 1.2 — §HB-2.4 · **6. State Enforcement**

**Original**

```
**6. State Enforcement** — `notifications` **`unread → archived`** or **`read → archived`** (Doc-2 §3.7; `archived` terminal — soft-delete). `archived → archived` is an idempotent no-op. No state added; sequence unchanged (archive is reachable from `unread` or `read` per the frozen `unread → read → archived` lifecycle with archive as the soft-delete terminal).
```

**Replacement**

```
**6. State Enforcement** — `notifications` **`read → archived`** (Doc-2 §3.7; `archived` terminal — soft-delete). **Archive is allowed only from `read`** per the frozen strict-linear lifecycle `unread → read → archived`; a notification must be marked read (`comm.mark_notification_read.v1`) before it can be archived. **`unread → archived` is illegal** (`STATE`). `archived → archived` is an idempotent no-op. No state added; no transition invented; sequence unchanged (the frozen `unread → read → archived` linear path; archive is the soft-delete terminal reachable only from `read`).
```

### 1.3 — §HB-2.4 · **12. AI-Agent Notes**

**Original**

```
**12. AI-Agent Notes** — Recipient-only soft-delete to `archived` (terminal) from `unread` or `read`. `NOT_FOUND` for non-recipients. Idempotent replay / re-archive → no duplicate audit. Terminal-state re-entry is a no-op (`STATE` only for a genuinely illegal source, distinct from `CONFLICT`). Bind `[ESC-COMM-AUDIT]` in-transaction.
```

**Replacement**

```
**12. AI-Agent Notes** — Recipient-only soft-delete to `archived` (terminal). **Archive is reachable only from `read`** (frozen strict-linear lifecycle `unread → read → archived`); an `unread` notification must first be marked read (`comm.mark_notification_read.v1`) — **`unread → archived` is illegal** (`STATE`). `NOT_FOUND` for non-recipients. Idempotent replay / re-archive → no duplicate audit. Terminal-state re-entry (`archived → archived`) is a no-op (`STATE` only for a genuinely illegal source, distinct from `CONFLICT`). Bind `[ESC-COMM-AUDIT]` in-transaction.
```

### 1.4 — Related references (consistency check, no change required)

- §HB-2.5 Consolidation / Part-2 invariants and the document's **Frozen anchors** block already cite the linear **`unread → read → archived`** (terminal `archived`) — consistent with the determination; **no edit applied** (they did not assert `unread → archived`).
- §HB-2.3 (`comm.mark_notification_read.v1`) State Enforcement (`unread → read`) is unchanged and is the mandatory predecessor transition; no edit.

**Single-interpretation outcome.** After 1.1–1.3, every occurrence of the string `unread → archived` in §HB-2.4 appears only inside an explicit **"is illegal"** clause. The only permitted archive transition is `read → archived`. One interpretation; no conflicting statement; no alternative implementation path.

---

## Regression Guard

| Area | Result |
|---|---|
| Contract Inventory | UNCHANGED (`comm.create_notification.v1` / `comm.get_notification.v1` / `comm.list_notifications.v1` / `comm.mark_notification_read.v1` / `comm.archive_notification.v1`) |
| Validation Matrices | UNCHANGED — all four still canonical `1→9`; only the Stage-6 STATE *rule text* of §HB-2.4 clarified (stage/authority/failure-class unchanged: `STATE`) |
| Authorization Matrices | UNCHANGED (recipient-scope; `[ESC-COMM-SLUG]`; `NOT_FOUND` collapse) |
| Event Binding | UNCHANGED — **BC-COMM-2 emits NO Doc-2 §8 event**; consumes the §8 catalog (B.6) with producer ownership preserved |
| Audit Binding | UNCHANGED — `[ESC-COMM-AUDIT]` on every mutation (create / mark-read / archive); reads unaudited |
| Error Model | UNCHANGED — closed Doc-4A §12 set; **REFERENCE ≠ DEPENDENCY**, **STATE ≠ CONFLICT** separated |
| Idempotency | UNCHANGED (`create` event-consumer idempotent on `source_event_id`; state commands `required` + dedup window; queries `not-applicable`) |
| Lifecycle (states/transitions) | UNCHANGED set — frozen `unread → read → archived`; **no state added/removed, no transition invented**; clarification removes only the non-frozen `unread → archived` reading |
| Procurement Moat | UNCHANGED (owns none of matching/routing/ranking/quotation-evaluation/supplier-selection/award) |
| Trust Firewall | UNCHANGED (computes/owns no Trust/Performance/Verification/Governance score) |
| Ownership (BC / aggregate / event / dependency / permission / audit / escalation) | UNCHANGED (DH-1…DH-8; `[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-SLUG]`/`[ESC-COMM-EVENT]`) |

Clarification only · no governance change · no lifecycle redesign · no state addition/removal · no transition invention.

---

*End of Doc-4H_PassB_Part2_Patch_v1.0.*
