# Doc-4H_PassA_Patch_v1.0 — Corrective Patch (Module-6 Communication, Pass-A)

| Field | Value |
|---|---|
| Document | Doc-4H_PassA_Patch_v1.0 — corrective patch for `Doc-4H_PassA_Content_v1.0` |
| Nature | Corrective patch only. Applies F4H-PB-MA1 (MAJOR), F4H-PB-M1 (MINOR). |
| Authority | Doc-4_Governance_Note_v1.0; Doc-4A v1.0 (FROZEN) governs; on conflict FLAG-AND-HALT |
| Applies to | `Doc-4H_PassA_Content_v1.0.md` |
| Preserved unchanged | module charter, BC inventory (BC-COMM-1…4), aggregate inventory (4), aggregate ownership, dependency ownership (DH-1…8), event ownership (Communication emits no Doc-2 §8 event), lifecycle states, permission catalog, procurement-moat boundaries, trust-firewall boundaries, escalation markers |

---

## P4H-MA1 — F4H-PB-MA1 · `comm.get_delivery_status.v1` authorization (HA-4.3, HA-5, Appendix A)

### HA-4.3 record

**Original**

```
- **Purpose:** read delivery status for an outbound record (ops/recipient-scoped). **Owning BC:** BC-COMM-3. **Aggregate:** Outbound Log. **Permission family:** ops/recipient-scoped (platform-owned logs; staff/recipient read). **Lifecycle:** none (read). **Audit:** none. **Events:** none. **Cross-Module:** Platform Core (DH-8). **Sources:** Doc-2 §10.7.
```

**Replacement**

```
- **Purpose:** read delivery status for an outbound record. **Owning BC:** BC-COMM-3. **Aggregate:** Outbound Log. **Permission family / access scope (governing escalation marker `[ESC-COMM-SLUG]` — no slug invented):** **Recipient (User):** may read **own delivery records only** (records whose recipient is the active org/user); **Support Staff (Admin):** **`staff_can_support`** (Doc-2 §7) may read delivery records (§5.6, no active org context); **cross-tenant access: prohibited**. **Protected-fact rule:** unauthorized access → **`NOT_FOUND`** (Doc-4A §12.4/§7.5 protected-fact collapse; existence not disclosed). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Platform Core (DH-8); Identity scope/`staff_can_support` (DH-1). **Sources:** Doc-2 §10.7; Doc-2 §7 (`staff_can_support`); Doc-4A §7.5/§12.4; carried `[ESC-COMM-SLUG]` (Doc-2 §7 additive — recipient-read slug, if a distinct one is later required).
```

### HA-5 Permission Surface — add explicit row (after the `(System)` row)

**Original**

```
| (System) | platform (no active org) | System | `create_notification`, `create_delivery_record`, `update_delivery_status`, `retry_delivery` | consumer/job effects on Communication's own entities only |
```

**Replacement**

```
| (System) | platform (no active org) | System | `create_notification`, `create_delivery_record`, `update_delivery_status`, `retry_delivery` | consumer/job effects on Communication's own entities only |
| delivery-status read (`comm.get_delivery_status.v1`) — governing marker `[ESC-COMM-SLUG]` (no slug invented) | tenant (recipient) / platform-staff | User / Admin | `comm.get_delivery_status.v1` | **Recipient:** own delivery records only; **Support Staff:** `staff_can_support` (Doc-2 §7) may read delivery records; **cross-tenant prohibited**; unauthorized → `NOT_FOUND` (Doc-4A §7.5/§12.4) |
```

### Appendix A — row 13

**Original**

```
| 13 | `comm.get_delivery_status.v1` | Get Delivery Status | BC-COMM-3 | Outbound Log | 21.3 Query | User / Admin | ops/recipient-scope |
```

**Replacement**

```
| 13 | `comm.get_delivery_status.v1` | Get Delivery Status | BC-COMM-3 | Outbound Log | 21.3 Query | User / Admin | Recipient: own records only · Support Staff: `staff_can_support` · cross-tenant prohibited · unauthorized → `NOT_FOUND` · `[ESC-COMM-SLUG]` (recipient-read slug) |
```

---

## P4H-M1 — F4H-PB-M1 · `comm.update_ticket.v1` actor→transition authority (HA-4.4, HA-6)

### HA-4.4 record (`comm.update_ticket.v1`)

**Original**

```
- **Purpose:** advance a ticket (`open → in_progress → resolved`); staff progress via Support-Admin. **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket. **Permission family:** `can_raise_support_ticket` (opener) / `staff_can_support` (Support Admin, §5.6). **Lifecycle:** `open → in_progress → resolved` (Doc-2 §3.7). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity + Support-Admin slug (DH-1). **Sources:** Doc-2 §3.7/§10.7.
```

**Replacement**

```
- **Purpose:** advance a support ticket per the Doc-2 §3.7 lifecycle. **Owning BC:** BC-COMM-4. **Aggregate:** Support Ticket. **Permission family / explicit actor→transition authority (Doc-2 §7; lifecycle unchanged):** **User (`can_raise_support_ticket`, own-org ticket only):** may add ticket messages and **close own ticket** (`resolved → closed`) — User performs no `open → in_progress` or `in_progress → resolved` transition. **Support Staff (`staff_can_support`, §5.6):** **`open → in_progress`**, **`in_progress → resolved`**, **`resolved → closed`**. **Lifecycle:** `open → in_progress → resolved → closed` (Doc-2 §3.7; no state added, sequence unchanged). **Audit:** `[ESC-COMM-AUDIT]`. **Events:** none. **Cross-Module:** Identity + Support-Admin slug (DH-1). **Sources:** Doc-2 §3.7/§10.7; Doc-2 §7 (`can_raise_support_ticket`/`staff_can_support`).
```

### HA-6 Lifecycle Inventory — Support Ticket row

**Original**

```
| Support Ticket (`support_tickets`) | `open → in_progress → resolved → closed` | `closed` |
```

**Replacement**

```
| Support Ticket (`support_tickets`) | `open → in_progress → resolved → closed` *(actor→transition, Doc-2 §7: Support Staff `staff_can_support` drives `open → in_progress`, `in_progress → resolved`, `resolved → closed`; User `can_raise_support_ticket` may `resolved → closed` on own-org ticket only — lifecycle/sequence unchanged, no state added)* | `closed` |
```

---

## Regression Audit

| Area | Result |
|---|---|
| Module Charter | UNCHANGED |
| BC Count | UNCHANGED (BC-COMM-1/2/3/4) |
| Aggregate Count | UNCHANGED (4) |
| Contract Count | UNCHANGED (18) |
| Ownership Matrix | UNCHANGED |
| Dependency Inventory | UNCHANGED (DH-1…DH-8) |
| Event Inventory | UNCHANGED — Communication emits **no Doc-2 §8 event** |
| Procurement Moat | UNCHANGED |
| Trust Firewall | UNCHANGED |
| Escalation Inventory | UNCHANGED (`ESC-COMM-AUDIT`/`POLICY`/`SLUG`/`EVENT`) |

No slug invented · no event invented · no escalation marker invented · no lifecycle state/sequence change.

---

*End of Doc-4H_PassA_Patch_v1.0.*
