# Doc-4F_Structure_Patch_v1.0.md

## Status

**Approved Structure Patch** — applies the Architecture-Board-accepted findings of `Doc-4F_Structure_Independent_Hard_Review_v1.0` to `Doc-4F_Structure_v1.0.md`. Surgical, structure-level patching only — no rewrite.

| Field | Value |
|---|---|
| Applies to | `Doc-4F_Structure_v1.0.md` |
| Produces | `Doc-4F_Structure_v1.0` as amended by this patch (canonical input to Structure Freeze) |
| Review source | `Doc-4F_Structure_Independent_Hard_Review_v1.0` |
| Board adjudication | **Apply:** F4F-M1, F4F-M2. **Optional:** F4F-N1 — applied (trivial). |
| Scope | `VendorInvited` co-consumer clarification (§F10); `[ESC-OPS-AUDIT]` structure-level clarification (§F12); BC-OPS-4 two-aggregate one-liner (§F3). **No bounded-context / aggregate / dependency / event / procurement-ownership change.** |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D v1.0, Doc-4E v1.0 — all FROZEN |
| Application model | Additive amendment document. Each item quotes the exact **Before** text present verbatim in the base, gives the **After**, and states the rationale. |

All frozen ownership boundaries, bounded contexts, aggregate ownership, dependency markers (DF-1…DF-8), event ownership, escalation markers, and the procurement moat are preserved. This patch **creates no bounded context, aggregate, event, DF marker, escalation marker, slug, or audit action**: F4F-M1 records an **existing** Doc-2 §8 co-consumer (Communication); F4F-M2 adds a structure-level governance clarification (no audit-binding analysis); F4F-N1 is a cosmetic count note.

---

# 1. Patch Summary

| Finding | Severity | Location | Disposition |
|---|---|---|---|
| **F4F-M1** | MAJOR | §F10 Event Consumption Map — `VendorInvited` | **APPLIED** — `VendorInvited` now states RFQ owns production; BC-OPS-3 consumes for `vendor_leads` creation; **Communication consumes for notification dispatch**; the two consumption paths are independent and idempotent. |
| **F4F-M2** | MINOR | §F12 Escalation Register — `[ESC-OPS-AUDIT]` | **APPLIED** — added a structure-level clarification: Buyer-CRM (and all Operations) audit actions are governed by Doc-2 §9; structure authoring does not determine audit coverage; any Pass-A mutation lacking explicit §9 coverage carries `[ESC-OPS-AUDIT]` and halts. No audit-binding analysis performed. |
| **F4F-N1** | NITPICK (optional) | §F3 | **APPLIED (trivial)** — one-line note that BC-OPS-4 owns two aggregates (Document Template, Generated Document). |

F4F-M1/M2 applied; F4F-N1 applied as trivial. Nothing invented.

---

# 2. Exact Changes

> Each change quotes the **Before** text exactly as it appears in `Doc-4F_Structure_v1.0.md` and gives the **After**. Anchors verified verbatim against the base.

### F4F-M1 — §F10 — `VendorInvited` co-consumer clarification

**Location:** §F10 Event Consumption Map — the `VendorInvited` bullet.

**Before:**

```
  - **`VendorInvited`** (producer: RFQ / Doc-4E) → **BC-OPS-3** creates the `vendor_leads` row (Doc-2 §8 primary consumer: "vendor_leads creation (operations)"; fires only at invitation `delivered`). Ownership direction: RFQ owns the event; Operations owns the lead effect.
```

**After:**

```
  - **`VendorInvited`** (producer: **RFQ / Doc-4E owns event production**; fires only at invitation `delivered`) — **two independent consumers (Doc-2 §8)**: (1) **BC-OPS-3 (Operations)** consumes it to create the `vendor_leads` row ("vendor_leads creation (operations)"); (2) **Communication (Doc-4H)** consumes it for notification dispatch (fan-out: in-app/email/SMS/WhatsApp). The two consumption paths are **independent** (neither depends on the other) and **idempotent** (each consumer dedupes on event identity, Doc-4A §16). Ownership direction: RFQ owns the event; Operations owns the `vendor_leads` effect (its own consumer); Communication owns the notification effect (its own consumer, DF-7) — single-authorship preserved, no shared ownership.
```

**Rationale:** Doc-2 §8 Primary-consumers row lists `VendorInvited` → **both** "Communication dispatch (notification fan-out)" **and** "vendor_leads creation (operations)". The base §F10 named only BC-OPS-3. The amendment records the existing Communication co-consumer with explicit independent + idempotent paths. **No ownership altered, no DF marker altered, no event created** — RFQ still owns production; each consumer owns its own effect (single-authorship); Communication is DF-7 (already in the dependency map).

---

### F4F-M2 — §F12 — `[ESC-OPS-AUDIT]` structure-level clarification

**Location:** §F12 Escalation Register — the `[ESC-OPS-AUDIT]` bullet.

**Before:**

```
  - **`[ESC-OPS-AUDIT]`** — any Operations mutation whose audit action is not separately enumerated in Doc-2 §9 (the §9 Engagement domain covers open/status-change/close, LOI/PO/challan/WCC issue+revision, dispute, buyer feedback; the Buyer-CRM domain covers status set/changed/cleared). Candidate gaps: finance-record actions; generated-document creation; template lifecycle (Doc-2 §9 Documents domain covers template/generated-document — confirm at content authoring). **Interim:** bind the nearest §9 action by pointer; **no audit action invented**. **Channel:** Doc-2 §9 additive.
```

**After:**

```
  - **`[ESC-OPS-AUDIT]`** — **audit coverage for all Operations mutations (including Buyer CRM) is governed by Doc-2 §9.** Structure authoring does **not** determine audit coverage and performs no audit-binding analysis here. **Rule:** any Operations mutation discovered during **Pass-A** that lacks explicit Doc-2 §9 coverage MUST carry **`[ESC-OPS-AUDIT]`** and **halt until resolved** via the Doc-2 §9 additive channel; **no audit action is invented**. (Enumerating candidate audit actions and binding them to §9 is Pass-A work, out of scope at structure level.) **Channel:** Doc-2 §9 additive.
```

**Rationale:** The base bullet drifted toward Pass-A territory (enumerating candidate audit gaps and §9 domain coverage). F4F-M2 corrects it to a strict structure-level clarification: §9 governs audit coverage; structure does not determine it; the halt-and-carry rule applies in Pass-A; no enumeration, no mapping, no audit-binding analysis. **No new escalation marker** (`[ESC-OPS-AUDIT]` unchanged); strictly structure-level.

---

### F4F-N1 (optional, applied) — §F3 — BC-OPS-4 two-aggregate note

**Location:** §F3 Bounded Context Landscape — the BC-OPS-4 bullet.

**Before:**

```
  - **BC-OPS-4 — Document Generation & Templates** (Document Template + Generated Document aggregates): the branded template formats and the template-engine outputs (storage refs).
```

**After:**

```
  - **BC-OPS-4 — Document Generation & Templates** (Document Template + Generated Document aggregates): the branded template formats and the template-engine outputs (storage refs). **BC-OPS-4 owns two aggregates: Document Template and Generated Document** (the only multi-aggregate context besides BC-OPS-1 and BC-OPS-2; each aggregate remains in exactly one context).
```

**Rationale:** Cosmetic one-line clarification of the aggregate count, as requested. No structural change.

---

# 3. Impact Analysis

| Dimension | Assessment | Evidence |
|---|---|---|
| Bounded contexts unchanged | **CONFIRMED** | No context created/split/merged; BC-OPS-1…5 intact. |
| Aggregate ownership unchanged | **CONFIRMED** | 7 aggregates, each in exactly one context; F4F-N1 only states an existing count. |
| Dependency ownership unchanged | **CONFIRMED** | DF-1…DF-8 unchanged; F4F-M1 references existing DF-7 (Communication); no DF marker created/modified. |
| Event ownership unchanged | **CONFIRMED** | RFQ still owns `VendorInvited`; Operations/Communication each own their own consumer effect; no event created. |
| Procurement boundaries unchanged | **CONFIRMED** | Post-award seam intact; no RFQ/Marketplace/Trust ownership moved. |
| Escalation markers unchanged | **CONFIRMED** | `[ESC-OPS-AUDIT]`/`[ESC-OPS-POLICY]`/`[ESC-OPS-SLUG]` set unchanged; F4F-M2 clarifies one, creates none. |
| Audit/authorization integrity | **CONFIRMED** | No audit action or slug invented; F4F-M2 keeps audit coverage as Doc-2 §9's, determined in Pass-A. |
| Structure-level discipline | **CONFIRMED** | No contract/command/query/state-machine/audit-binding instantiated; F4F-M2 explicitly stays out of Pass-A. |

**Regression posture:** additive/clarifying only — one co-consumer record (existing Doc-2 §8 fact), one governance clarification (no analysis), one count note. No bounded context, aggregate, event, DF marker, escalation marker, slug, or audit action created or modified; the procurement moat and all frozen ownership preserved.

---

# 4. Freeze Readiness

| Question | Answer |
|---|---|
| **Open BLOCKER** | **NO** |
| **Open MAJOR** | **NO** — F4F-M1 applied and closed. |
| **Open MINOR** | **NO** — F4F-M2 applied and closed. |
| **Structure Freeze Ready** | **YES** |

**Justification.** F4F-M1 (MAJOR) records the existing Doc-2 §8 Communication co-consumer of `VendorInvited` with explicit independent + idempotent paths, altering no ownership and creating no event; F4F-M2 (MINOR) corrects the `[ESC-OPS-AUDIT]` bullet to a strict structure-level governance clarification (§9 governs audit coverage; no audit-binding analysis; halt-and-carry in Pass-A); F4F-N1 (optional) adds a cosmetic aggregate-count note. Impact analysis confirms bounded contexts, aggregate ownership, dependency ownership, event ownership, procurement boundaries, and escalation markers are all unchanged; nothing invented; structure-level discipline held. The amended Doc-4F Structure conforms to the frozen corpus and is **ready for Structure Freeze**.

> No conflict with the frozen corpus was encountered; no flag-and-halt was triggered. The `VendorInvited` two-consumer fact (F4F-M1) was verified present in Doc-2 §8 before recording.

---

*End of Doc-4F_Structure_Patch_v1.0 — applies F4F-M1 (`VendorInvited` co-consumer: RFQ owns, BC-OPS-3 + Communication consume independently/idempotently) + F4F-M2 (`[ESC-OPS-AUDIT]` structure-level clarification) + F4F-N1 (BC-OPS-4 two-aggregate note). Surgical/structure-level only; no bounded-context, aggregate, event, DF, escalation, slug, or audit change; nothing invented. Decision: F4F-M1/M2 CLOSED, F4F-N1 applied; Structure Freeze Ready. Canonical input: `Doc-4F_Structure_v1.0.md` as amended by this patch.*