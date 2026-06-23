# Doc-4 — Family Map Conformance Conflict — Escalation Record v0.1

| Field | Value |
|---|---|
| Status | **RESOLVED — Architecture Board selected Option B (2026-06-13)** |
| Type | Conformance conflict — flag-and-halt (Doc-4A §0.6) |
| Severity | **BLOCKER** — authoring of the next module document cannot proceed |
| Raised By | Doc-4 authoring agent, on receipt of "Architecture Board Status Update & Next Work Authorization" |
| Affects | Next Authorized Work — "Doc-4B — Identity Context API Contracts" |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN) |
| Authoring Status | **HALTED** for the affected document pending Board resolution |

---

## §1 — Summary

The authorization directs authoring of **"Doc-4B — Identity Context API Contracts"** with scope: User, Organization, Membership, Role, Permission, Delegation, Buyer Profile, and identity-related reference entities.

That scope is **Module 1 — Identity & Organization**, which the frozen corpus assigns to **Doc-4C**, not Doc-4B. The frozen corpus assigns **Doc-4B to Module 0 — Platform Core / Shared Kernel**. The authorization's document identifier therefore conflicts with the frozen Doc-4A family map.

Per the Board's own working rule in the authorization ("If any requirement appears to conflict with Doc-4A: flag the conflict; halt authoring for the affected section; do not invent a workaround; escalate for Architecture Board review") and Doc-4A §0.6 (Flag-and-Halt), authoring is halted and the conflict is recorded below.

---

## §2 — The Conflict

**Authorization (this message):**

- Document identifier: **Doc-4B**
- Name: **Identity Context**
- Scope: User, Organization, Membership, Role, Permission, Delegation, Buyer Profile, identity reference entities → these are **Module 1 (Identity & Organization)** entities.

**Frozen corpus — unanimous across the full precedence chain:**

| Source (by pointer) | What it states |
|---|---|
| Doc-4A §1.3 Family Map (Pass 1, FROZEN) | **Doc-4B = Platform Core / Shared Kernel (Module 0)**; **Doc-4C = Identity & Organization (Module 1)** |
| Doc-4A Appendix B Namespace Registry (Pass 5, FROZEN) | Platform Core → **Doc-4B** → `core_`; Identity & Organization → **Doc-4C** → `identity_` |
| Doc-4A §5 Context model (Pass 2, FROZEN) | "...the validated context-switch mechanism owned by **Identity (Doc-4C)**" |
| Master Architecture §16 (module map) | Module 0 = Platform Core / Shared Kernel; Module 1 = Identity & Organization (users, organizations, memberships, roles, permissions, authentication, organization switching) |
| ADR Compendium (ADR-017 module ownership; ADR-015 Identity & Organization Model) | Module 0 = Platform Core / Shared Kernel; Module 1 = Identity & Organization |
| Doc-2 §0.3 schema map | `core` = Module 0 — Platform Core / Shared Kernel; `identity` = Module 1 — Identity & Organization |

Every entity listed in the authorization maps one-to-one onto **Module 1 (`identity` schema) = Doc-4C**. None of them belong to Module 0 / Doc-4B (which is infrastructure-only: audit, outbox, ID generation, system configuration, feature flags).

**Two deviations are present:**

1. **Document-number conflict (BLOCKER).** Identity & Organization is **Doc-4C** in the frozen map; **Doc-4B** is reserved for Platform Core / Shared Kernel (Module 0).
2. **Name deviation (MINOR).** "Identity Context" is not a corpus term. The canonical name is **"Identity & Organization (Module 1)"** (Architecture §16; ADR-015; Doc-2 §0.3). Workflow Rules forbid alternate names for existing concepts.

---

## §3 — Why authoring is halted

Three frozen rules independently forbid proceeding under a "Doc-4B = Identity" label:

1. **Doc-4A §1.3:** *"Changes to this family map (splitting or merging documents) MUST be made by Doc-4A patch, never informally."* Authoring Identity as "Doc-4B" would informally re-map the family.
2. **Doc-4A §0.6 (Flag-and-Halt)** and the Board's working rule in this authorization: a conflict with a frozen / higher-precedence document must be halted and escalated, never worked around by local interpretation.
3. **Governance Note rule 5 + Doc-4A Appendix B:** reserved namespaces (`core_` → Doc-4B, `identity_` → Doc-4C) are allocated only by Doc-4A patch. Authoring Identity under "Doc-4B" collides with the `core_` / Doc-4B reservation.

No workaround has been invented; no Structure has been authored under the conflicting label.

---

## §4 — Resolution options

### Option A — Relabel to Doc-4C (RECOMMENDED; zero patch)

Treat "Doc-4B" as a label slip and author the document as **Doc-4C — Identity & Organization (Module 1)**, exactly as the frozen family map already reserves. The authorized scope is unchanged — it already equals Module 1. The delivery strategy (Phase 1 Structure → Pass-A → independent review → Pass-B → final review → freeze) applies unchanged. No frozen document is modified. This is the smallest change that preserves the architecture (Change Management Rule).

### Option B — Author Doc-4B as its true scope (Platform Core / Shared Kernel) first

If the intent was to author Doc-4B next per the frozen map, the correct Doc-4B scope is **Module 0 — Platform Core / Shared Kernel** (audit, outbox, ID generation, system configuration, feature flags) — not Identity. Identity then follows as Doc-4C. This also satisfies the natural dependency order, since Identity contracts bind to Module 0 services (audit per §17, events/outbox per §16, ID generation, POLICY per §18). It changes which module is authored next.

### Option C — Formally renumber the family map (NOT RECOMMENDED)

If the Board genuinely wants Identity to become Doc-4B, that requires a formal **Doc-4A patch** amending §1.3 (Family Map) and Appendix B (Namespace Registry). This is a larger change, contradicts the smallest-change doctrine, and reverses the established Module 0 / Module 1 ordering across the corpus. Not recommended.

---

## §5 — Recommendation

**Option A.** The authorized scope is already, precisely, Doc-4C's frozen scope; only the document letter in the authorization is off. Relabeling to **Doc-4C — Identity & Organization** resolves the conflict with no change to any frozen document and lets Phase 1 (Structure) proceed immediately.

If the Board prefers strict dependency ordering, it may additionally choose to sequence **Doc-4B (Platform Core / Shared Kernel)** before **Doc-4C (Identity)** — that is a work-sequencing decision (Option B), not a requirement for resolving this conflict.

---

## §6 — Requested Board decision

Confirm one:

- **(A)** Author as **Doc-4C — Identity & Organization** now (recommended); or
- **(B)** Author **Doc-4B — Platform Core / Shared Kernel** instead (its true frozen scope); or
- **(C)** Issue a Doc-4A patch to renumber the family map, then author.

On **(A)** or **(B)** authoring proceeds immediately to Phase 1 (Structure) under the confirmed identifier. On **(C)** authoring remains halted until the patch is approved.

---

## §7 — Self-review

| Criterion | Result |
|---|---|
| No frozen document modified by this record | PASS |
| No new entity / workflow / state / permission / event introduced | PASS |
| Conflict recorded with both citations by pointer (Doc-4A §0.6) | PASS |
| No workaround invented; affected authoring halted | PASS |
| Recommendation is the smallest change (Change Management Rule) | PASS |
| Scope limited to the conflict; no architecture redesign proposed | PASS |

---

## §8 — Board Resolution (2026-06-13)

The Architecture Board selected **Option B**: author **Doc-4B** as its true frozen scope — **Module 0, Platform Core / Shared Kernel** (audit records, outbox events, ID generation, system configuration, feature flags). The Doc-4B identifier is retained per the frozen family map (Doc-4A §1.3); no Doc-4A patch is required. Identity & Organization (Module 1) remains reserved for **Doc-4C**, to be authored after Doc-4B.

This ordering also satisfies the natural dependency direction: Identity (and all other module) contracts bind to Module 0 services (audit per Doc-4A §17, events/outbox per §16, ID generation per §8, POLICY/config per §18), so the Shared Kernel contracts are authored first.

Authoring proceeds to **Doc-4B Phase 1 — Structure** under the confirmed identifier and scope.

---

*End of Doc-4 Family Map Conformance Conflict — Escalation Record v0.1. Resolved by Architecture Board decision (Option B); no frozen document is amended by this record.*
