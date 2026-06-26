# Doc-8B — Content Pass-2 (§5–§9) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8B_Content_v1.0_Pass2.md` (§5–§9) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · Reference-Never-Restate · anchors verified live against Doc-6B |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 3 MINOR open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-2 Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- **Outbox lifecycle labels** — verified against the realized table (`Doc-6B_Content_v1.0_Pass1 §3.2` line 116): `CREATE TYPE core.outbox_status AS ENUM ('pending','dispatched','archived')` [Doc-2 §10.1 binding]. The §7.2 labels are correct. **(But the column name and dispatch/archive semantics are wrong — MINOR-1/MINOR-2.)**
- **Six mocked boundaries** vs CLAUDE.md §2 — verified: Storage, Realtime (Supabase), Resend (email), PostHog (analytics), Inngest (async), AI (Claude+OpenAI). §7.1 matches exactly.
- `Doc-8A §4.1/§4.3/§10.2/§10.3/§10.4/§3.4` + Bands H/I; `Doc-6C` (org/membership seed); `Doc-2 §6/§9`; `Doc-4L`; CLAUDE.md §5/§8; Invariants #2/#5/#12 — correctly invoked.

0 BLOCKER, 0 MAJOR. The harness-services altitude is right and the Pass-1 fixes (savepoint opt-out, realized-seed) are correctly carried. Three precision defects, all verified against the frozen Doc-6B realization.

### MINOR-1 — §7.2 outbox observer reads `dispatch_status`; the **realized column is `status`** (`core.outbox_status`)
§7.2's illustrative observer queries `where dispatch_status = 'pending'`. **Verified** (`Doc-6B §3.2` line 124): the realized column is **`status core.outbox_status NOT NULL DEFAULT 'pending'`** — there is no `dispatch_status` column. An outbox observer that consumes the realized table must read the real column or it cannot run.
**Required fix:** §7.2 → `status` (type `core.outbox_status`); note the adjacent realized operational columns the observer/drainer inspects (`dispatched_at`, `attempts` — `Doc-6B §3.2`); and state that `status` is **forward-only** (`pending→dispatched→archived`, trigger-enforced) and **DELETE-blocked** (archived, not deleted — `Doc-6B §3.2` / Doc-2 §10.1), so the drainer advances status via UPDATE and never deletes.

### MINOR-2 — §7.2 conflates **dispatch** with **archival**; they are distinct realized transitions
§7.2 says the dispatch tick advances rows "`pending → dispatched → archived`" in one motion. **Verified** (`Doc-6B §3.2`): **dispatch** moves `pending→dispatched` (set `dispatched_at`, increment `attempts`); **archival** (`dispatched→archived`) is a **separate retention transition** bounded by the `core.outbox_archive_retention` POLICY (read from `system_configuration`, not immediate). Collapsing them misrepresents the realized lifecycle.
**Required fix:** §7.2 — the **dispatch tick** advances `pending→dispatched` (the dispatch action against the mocked Inngest double); **archival** (`dispatched→archived`) is a **separate, POLICY-bounded retention step** (`core.outbox_archive_retention`) the harness drives **distinctly** (so a Band-F suite can assert dispatch and archival independently).

### MINOR-3 — §6 conflates **UUIDv7** (generated) with **`human_ref`** (`core.id_sequences` allocator); they are different ID mechanisms
§6 (and the carried `ERR-8A-1` phrasing) calls `Doc-6B core.id_sequences` the "UUIDv7 allocator." **Verified:** UUIDv7 machine IDs are **generated** (time-ordered, clock+random — `Doc-4B`/`Doc-6A §3`); `core.id_sequences` is the **year-scoped `human_ref` allocator** (`RFQ-2026-000123`), a *different* mechanism. A deterministic test ID provider must handle **both, distinctly**: (a) **UUIDv7** — made reproducible by feeding the **seeded clock**; (b) **`human_ref`** — made reproducible by controlling the **`core.id_sequences`** allocation deterministically.
**Required fix:** §6 — split the two: UUIDv7 (generated; deterministic via seeded clock — `Doc-4B`/`Doc-6A §3`) and `human_ref` (year-scoped sequence — `Doc-6B core.id_sequences`, deterministic by controlling the seeded sequence). Note this **refines the `ERR-8A-1` phrasing** (a second-order precision: `core.id_sequences` is the `human_ref` allocator, not the UUIDv7 allocator) — carried as `ERR-8A-1` clarification, no frozen doc edited.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§7.1's Realtime double 'emits nothing authoritative' makes realtime features untestable — a double that emits nothing cannot test realtime delivery."* | **REJECTED (false).** Realtime is a **transport, not a store** (Doc-2 / CLAUDE.md §2); authoritative state is asserted via the **contract/DB effect** (the row written, the notification queued), never via the live channel. The hermetic double need not emit a live event for a suite to assert the authoritative effect; asserting "live channel delivery" as transport is **out-of-test** (R12 hermeticity). The convention is correct. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 outbox column `dispatch_status` → realized `status` | MINOR | Pass-2 Patch — `status` + forward-only/DELETE-blocked + dispatched_at/attempts |
| MINOR-2 dispatch vs archival conflation | MINOR | Pass-2 Patch — dispatch=pending→dispatched; archival=POLICY-bounded retention |
| MINOR-3 UUIDv7 vs human_ref conflation (refines ERR-8A-1) | MINOR | Pass-2 Patch — split the two ID mechanisms |

**Gate (governance §6/§8 rule 1):** approved with no open BLOCKER/MAJOR/MINOR. 3 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited. Anchors verified against the realized Doc-6B (`core.outbox_status` ENUM + `status` column + forward-only trigger; `core.id_sequences` = human_ref allocator) and CLAUDE.md §2 (six boundaries).*
