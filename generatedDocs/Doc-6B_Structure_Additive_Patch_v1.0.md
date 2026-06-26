# Doc-6B — Structure Additive Patch v1.0 (CR4 immutability-model refinement)

| Field | Value |
|---|---|
| Status | **APPROVED — 2026-06-26** (human/Board). Additive; the effective CR4 is now **CR4′**. Patches the frozen `Doc-6B_Structure_v1.0_FROZEN` without editing it in place; folded into `Doc-6B_SERIES_FROZEN` |
| Date | 2026-06-26 |
| Raised by | Flag-and-halt during Doc-6B Content Pass-1 authoring (self-caught) |
| Type | **Realization-model refinement** (physical *how*; not architecture-affecting — no module/ownership/governance/state/event/POLICY change) |
| Patches | `Doc-6B_Structure_v1.0_FROZEN.md` — **CR4** (and its application in §2 / §3.1 / §3.2 / §4) |
| Authority | `Doc-2 §2/§9/§10.1` (the *what*); **`Doc-4B` Structure Patch F-03 / PATCH-4BS-03** (outbox status = operational field updates, not a §5 machine); `Doc-6A §6.4` (append-only realization) |

---

## The defect

Frozen **CR4** reads: *"`audit_records` + `outbox_events` append-only (INSERT-only; **UPDATE/DELETE trigger-blocked** — Doc-6A §6.4)."*

The **"INSERT-only / UPDATE-blocked"** clause **over-constrains** and conflicts with the frozen corpus:

- **Doc-4B Structure Patch F-03 (PATCH-4BS-03):** the outbox dispatcher's `pending → dispatched → archived` transitions are **"operational-entity field updates declared in the Mutation-Scope field"** — i.e., the dispatcher **UPDATEs** `status`, `dispatched_at`, `attempts`. A blanket UPDATE block makes the outbox undispatchable.
- **Doc-2 §2:** "append-only **streams**" means **rows are never deleted and identity/payload is immutable** — it does **not** mean "no UPDATE ever." Doc-2 §9 likewise gives `audit_records` a **"soft archive flag"** (an `archived_at` set), which is an UPDATE to a non-payload column.

So CR4's intent (immutability, no destructive rewrite, no row deletion) is **correct**; only the parenthetical realization clause is wrong. This is a Doc-6B-introduced over-tightening, not a Doc-2/Doc-6A issue — corrected here additively.

## The refinement (CR4′ — replaces the CR4 parenthetical only)

**CR4′ — Append-only = no DELETE + immutable business payload; controlled operational-field updates permitted, enforced by a column-scoped immutability trigger.**

- **`core.audit_records`:** **no DELETE** (trigger-blocked); the **payload columns** (`audit_id, actor_id, actor_type, organization_id, entity_type, entity_id, action, old_value, new_value, timestamp, ip_address, user_agent`) are **immutable** (UPDATE-blocked). **Permitted UPDATE:** the **archive flag only** (`archived_at` set once; Doc-2 §9 "soft archive flag"). **Redaction = a NEW audit row** (Doc-2 §9), never an in-place edit of payload.
- **`core.outbox_events`:** **no DELETE** (trigger-blocked); the **business payload** (`event_name, event_version, payload_jsonb, aggregate_id`) is **immutable** (UPDATE-blocked). **Permitted UPDATE:** the **operational fields only** — `status` (`pending→dispatched→archived`, forward-only CHECK), `dispatched_at`, `attempts` (the dispatcher's field updates per Doc-4B F-03). Row identity (`id`, `created_at`) immutable.
- **Realization (a §2.5 Doc-6 choice):** a **column-scoped `BEFORE UPDATE` trigger** raises on any change to a payload/identity column, and **allows** changes confined to the enumerated operational/archive columns. DELETE is blocked outright (both tables). This realizes Doc-6A §6.4's append-only intent at column granularity — the metastandard's "INSERT-only" template was for pure history tables; outbox/audit are **streams with bounded operational mutation**, a faithful specialization, not a deviation.

**Unchanged:** CR4's core commitments stand — SD=NO (no soft-delete tuple, no partial-unique-live index), no destructive rewrite, no row deletion, redaction-as-new-event, Invariant #8. Only the over-broad "INSERT-only/UPDATE-blocked" wording is refined to "no-DELETE + immutable-payload + bounded operational updates."

## Blast radius

- **§2** posture: "append-only" now reads per CR4′ (column-scoped immutability).
- **§3.1** audit: payload immutable; `archived_at` settable; redaction = new row.
- **§3.2** outbox: payload immutable; `status`/`dispatched_at`/`attempts` updatable (dispatcher); forward-only status CHECK.
- **§4** the shared `core.raise_immutable_violation()` trigger function is **column-aware** (parameterized by the protected column set), not a blanket UPDATE block.
- **Appendix A Band D** attestation: unchanged disposition (PASS) — append-only realized; now precisely scoped.

No change to: table set, columns, PKs, tenancy, events, audit actions, POLICY keys, ownership, or any Doc-2/Doc-6A binding.

## Disposition requested

Approve **CR4′** as an additive refinement to `Doc-6B_Structure_v1.0_FROZEN` (the frozen doc is not edited; this patch is carried alongside it and folded into `Doc-6B_SERIES_FROZEN`). On approval, Content Pass-1 resumes realizing `audit_records` + `outbox_events` under CR4′.

---

*Additive patch — flag-and-halt outcome. Realization-model refinement only; faithful to Doc-2 §2/§9 + Doc-4B F-03 + Doc-6A §6.4. No architecture/ownership/governance/state/event/POLICY change. The frozen Doc-6B structure is not edited in place; on approval this patch is the effective CR4 (CR4′).*
