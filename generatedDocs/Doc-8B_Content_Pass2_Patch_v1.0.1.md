# Doc-8B — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8B_Content_v1.0_Pass2.md` (§5–§9) |
| Against | `Doc-8B_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 3 MINOR dispositioned (all FIXED); 1 finding REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Freeze Audit |
| Method | Additive content patch — no frozen document edited; nothing coined. Effective Pass-2 = `Content_v1.0_Pass2` **as amended below** |

---

## Disposition of findings

### MINOR-1 — outbox observer column `dispatch_status` → realized `status` → **FIXED**
§7.2(a) + the illustrative observer are corrected to the realized schema (`Doc-6B §3.2`):
> Read **`core.outbox_events.status`** (type **`core.outbox_status`**, labels `pending/dispatched/archived`) plus the realized operational columns **`dispatched_at`**, **`attempts`**. `status` is **forward-only** (`pending→dispatched→archived`, enforced by the `outbox_events_status_forward_only` trigger) and **DELETE-blocked** (archived, **not** deleted — `Doc-6B §3.2` / Doc-2 §10.1); the drainer advances `status` via UPDATE and **never deletes**.

```ts
// corrected illustrative; realized column = status (core.outbox_status), forward-only, DELETE-blocked
export const outbox = {
  pending: (tx) => tx.query(`select * from core.outbox_events where status = 'pending'`),
  dispatch: async (tx) => { /* feed pending -> set status='dispatched', dispatched_at, attempts++ via the mocked Inngest double */ },
  archive: async (tx) => { /* dispatched -> archived, POLICY-bounded (core.outbox_archive_retention); never DELETE */ },
}
```

### MINOR-2 — dispatch vs archival conflation → **FIXED**
§7.2(b) is split:
> **Dispatch tick** advances `pending→dispatched` (the dispatch action against the mocked Inngest double — set `dispatched_at`, increment `attempts`), so a suite asserts the `Doc-4L` fan-out (`CHK-8-052`). **Archival** (`dispatched→archived`) is a **separate, POLICY-bounded retention step** (`core.outbox_archive_retention`, read from `system_configuration`) the harness drives **distinctly** — so a Band-F suite asserts dispatch and archival independently. Neither step deletes (DELETE-blocked).

### MINOR-3 — UUIDv7 vs human_ref conflation → **FIXED (refines ERR-8A-1)**
§6's deterministic-ID bullet is split into the two realized mechanisms:
> - **(a) UUIDv7 machine IDs** — *generated* (time-ordered: clock + random — `Doc-4B` owner, `Doc-6A §3` convention); made reproducible by feeding the **seeded clock** (§6). No sequence table involved.
> - **(b) `human_ref`** — the year-scoped customer-facing reference (`RFQ-2026-000123`), allocated by **`core.id_sequences`** (`Doc-6B`); made reproducible by controlling the seeded sequence deterministically.
>
> **`ERR-8A-1` clarification (carried):** `core.id_sequences` is the **`human_ref`** allocator, **not** the UUIDv7 allocator (UUIDv7 is generated, not sequence-allocated). The corrected ID-service anchor remains `Doc-4B` + `Doc-6A §3` (UUIDv7) and `Doc-6B core.id_sequences` (human_ref) — recorded as an `ERR-8A-1` second-order clarification; no frozen document edited.

The illustrative provider is corrected:
```ts
export const seededClock = (epochMs) => { let t = epochMs; return { now: () => t, advance: (ms) => (t += ms) } }
export const uuidV7Provider = (clock) => m0UuidV7({ clock })          // (a) generated UUIDv7, deterministic via seeded clock
export const humanRefProvider = (ctx) => seededHumanRefSequence(ctx)  // (b) core.id_sequences (Doc-6B), deterministic
```

### REJECTED finding — upheld
"§7.1 Realtime double untestable" stays **REJECTED as false** — Realtime is transport not store; the authoritative effect is asserted via the contract/DB, not the live channel. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 3 | **0** |

---

## Short Closure Check (re-review)

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 outbox column `status` | MINOR | **CLOSED** — realized `status`/`core.outbox_status` + forward-only/DELETE-blocked + `dispatched_at`/`attempts` |
| MINOR-2 dispatch vs archival | MINOR | **CLOSED** — dispatch=pending→dispatched; archival=POLICY-bounded retention; distinct steps |
| MINOR-3 UUIDv7 vs human_ref | MINOR | **CLOSED** — two mechanisms split; ERR-8A-1 second-order clarification carried |
| REJECTED (Realtime double) | — | **Upheld false** |

No new defect. Re-verified against `Doc-6B §3.2` (realized `status` column + forward-only trigger + DELETE-block; `core.outbox_archive_retention` POLICY) and the UUIDv7-vs-human_ref distinction (`core.id_sequences` = human_ref). **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.** Both content passes (§0–§9) approved → ready for Content Freeze Audit.

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Nothing coined; no frozen document edited. Next: Content Freeze Audit → `Doc-8B_SERIES_FROZEN_v1.0` (folds in the `ERR-8A-1` second-order clarification).*
