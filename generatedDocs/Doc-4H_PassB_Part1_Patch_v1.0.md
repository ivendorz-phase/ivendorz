# Doc-4H_PassB_Part1_Patch_v1.0 — Corrective Patch (BC-COMM-1 Messaging, Pass-B Part 1)

| Field | Value |
|---|---|
| Document | Doc-4H_PassB_Part1_Patch_v1.0 — corrective patch for `Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0` |
| Nature | Corrective patch — structural completeness only. Applies F4H-PB2-M1 (MINOR). No business-logic / governance / authorization change. |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4H_PassB_Part1_BC-COMM-1_Messaging_v1.0.md` |
| Preserved unchanged | BC/aggregate/event/dependency/permission/lifecycle ownership; authorization behavior; audit behavior; idempotency behavior; procurement-moat boundaries; trust-firewall boundaries; contract inventory |

---

## Patch 1 — F4H-PB2-M1 · add explicit Stage-8 BUSINESS row to query Validation Matrices (§HB-1.2, §HB-1.4)

**Issue:** the two query-contract Validation Matrices (§HB-1.2 `comm.get_thread.v1`/`comm.list_threads.v1`; §HB-1.4 `comm.get_messages.v1`) skip from Stage 7 REFERENCE to Stage 9 POLICY, omitting an explicit Stage 8 BUSINESS row. Completeness correction only — no business validation logic, no new rule/error class/lifecycle check.

**Original** (identical block in §HB-1.2 and §HB-1.4 Validation Matrices)

```
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |
```

**Replacement** (apply to both occurrences)

```
| 7 REFERENCE | Doc-4A §4.5 | none (in-aggregate) | — |
| 8 BUSINESS | Doc-4A §11.2 | n/a — read operation (no business rule applies) — Stage 8 evaluated, not applicable for this query contract | — |
| 9 POLICY | Doc-4A §18 | `page_size` within POLICY bound (`[ESC-COMM-POLICY]`) | `VALIDATION` |
```

---

## Regression Guard

| Area | Result |
|---|---|
| Contracts | UNCHANGED (`comm.create_thread.v1`/`comm.get_thread.v1`/`comm.list_threads.v1`/`comm.send_message.v1`/`comm.get_messages.v1`) — only the affected Stage-8 rows added |
| Validation Logic | UNCHANGED (Stage 8 = explicit non-applicable for queries; no rule introduced) |
| Authorization | UNCHANGED |
| State Enforcement | UNCHANGED |
| Event Binding | UNCHANGED — **BC-COMM-1 emits NO Doc-2 §8 event** |
| Audit Binding | UNCHANGED |
| Dependency Model | UNCHANGED (DH-1, DH-3, DH-8) |
| Error Model | UNCHANGED — **REFERENCE ≠ DEPENDENCY**, **STATE ≠ CONFLICT** |
| Procurement Moat | UNCHANGED |
| Trust Firewall | UNCHANGED |

Canonical stage numbering/order preserved (`1→2→3→4→5→6→7→8→9`); no new error class, no new rule, no new lifecycle check.

---

*End of Doc-4H_PassB_Part1_Patch_v1.0.*
