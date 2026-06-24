# Doc-5A — API Realization Standards — Content v1.0, Pass 10 (Appendix B)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 10 of N — Appendix B only |
| Status | ACTIVE — Content Pass 10 of N; Appendix B only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1…Pass-9 (§0–§12) |
| Contains | The Reserved API-Surface Namespace Registry only — a **thin, pointer-aggregating** registry of module route prefixes, per-module error-code prefixes (pointer to `Doc-4A Appendix B.2`), surface-version identifier form, and the standard-header name set (mirror of §4.4). No new namespace, header, status code, error class, error-code value, version scheme, or POLICY key. No endpoints, schemas, or implementation detail |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** This appendix **registers by pointer; it coins nothing.** Every token traces to a frozen owner: module namespaces (`Doc-2 §0.3`), error-code prefixes (`Doc-4A Appendix B.2`), standard headers (Doc-5A §4.4), surface-version form (`Doc-4A §20.3`). The registry exists to prevent cross-document collisions across Doc-5B…5M — it does not define behavior (each owning section does) and does not invent a name. New registrations require a **Doc-5A amendment** (`Doc-5_Program_Governance_Note_v1.0 §5`), never module-doc invention. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** §4.4 (header registry) · §5.3 (path grammar) · §6 (error namespaces) · §12 (surface version) · `Doc-2 §0.3` · `Doc-4A Appendix B.2` · `Doc-4A §20.3`.

---

## Appendix B — Reserved API-Surface Namespace Registry

### B.0 Registry Purpose & Authority

- This appendix is the **central collision-prevention registry** for the Doc-5 API family. Ten module documents (Doc-5B…5M) are authored in parallel; without one registry they collide on route prefixes, error-code prefixes, surface-version identifiers, and header names.
- The registry **aggregates pointers to frozen owners**. It is **not** a source of truth for any token it lists: each token's authority is its owning section/document, cited per row. Where this appendix and an owning section could diverge, the **owning section wins** and the divergence is resolved by Doc-5A amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).
- **Binds:** `Doc-5_Program_Governance_Note_v1.0 §5` (amendment), §7 (escalation); Doc-5A §4.5 (registry synchronization). **Rationale:** a single, pointer-bound registry keeps the parallel module documents collision-free without becoming a second naming authority.

### B.1 Module Route-Prefix Registry

- Each module reserves one `{module-namespace}` route-prefix segment in the §5.3 path grammar (`/{module-namespace}/{resource-plural}/…`). The prefix **realizes the canonical module namespace** defined in `Doc-2 §0.3` (one schema per module) via a **schema-name alignment convention** **[realization convention]** — the registry binds to the canonical namespace, **not** to physical storage naming, so a later Doc-6 schema-naming decision does not invalidate this registry.

| Module | Canonical namespace (`Doc-2 §0.3`) | Reserved route prefix | Status |
|---|---|---|---|
| M0 — Platform Core / Shared Kernel | `core` | `core` | Reserved |
| M1 — Identity & Organization | `identity` | `identity` | Reserved |
| M2 — Marketplace & Discovery | `marketplace` | `marketplace` | Reserved |
| M3 — RFQ Procurement Engine | `rfq` | `rfq` | Reserved |
| M4 — Business Operations | `operations` | `operations` | Reserved |
| M5 — Trust & Verification | `trust` | `trust` | Reserved |
| M6 — Communication | `communication` | `communication` | Reserved |
| M7 — Monetization | `billing` | `billing` | Reserved |
| M8 — Admin Operations | `admin` | `admin` | Reserved |
| M9 — AI Layer | `ai` | `ai` | Reserved |

- **M6 namespace note:** the M6 canonical namespace is `communication`, taken **verbatim from the frozen owner `Doc-2 §0.3`**. The shorthand `comms` (the non-authoritative `CLAUDE.md` mirror) and the `comm_` **error-code** prefix (`Doc-4A Appendix B.2`) are **not** the route namespace; the corpus value `communication` is used exactly, no deviation.
- **Ownership rule (binding):** a route prefix **reserves namespace only — it does not confer ownership.** Resource ownership remains governed by `Doc-2`, the Doc-4 module contracts, and bounded-context rules (`Doc-4A §4.1`, one owner per resource). A resource appearing under `/rfq/…` does **not** mean the RFQ module owns every concept beneath that path; cross-module composition is via Services/Events/Public Contracts (`Doc-4A §4.2`), never a foreign-namespace endpoint (§5.3).
- **Binds:** `Doc-2 §0.3` (canonical namespaces); Doc-5A §5.3 (path grammar); `Doc-4A §4.1`/§4.2 (ownership/channels). **Rationale:** one reserved prefix per module makes the surface mechanically collision-free while keeping ownership where the corpus already assigns it.

### B.2 Per-Module Error-Code Namespace

- Per-module `error_code` prefixes are **owned by `Doc-4A Appendix B.2`** (Module Error Code Namespace Registry) and are bound here **by pointer — the prefixes and codes are not re-listed in this document.** This appendix **intentionally does not duplicate `Doc-4A Appendix B.2` content.** Each module's `error_code` values are allocated within its registered prefix; new prefix registrations require a Doc-4A patch (`Doc-4A Appendix B.2`), never module-doc self-assignment.
- Clients **branch on `error_class`, not `error_code`** (§6; `Doc-4A §12`). The error-code prefix is a stable allocation namespace, not a wire-branching surface.
- Note: an error-code prefix is **independent of** the §B.1 route prefix and may differ from it; both trace to their own frozen owners. (Reading the two registries together is intentional — they govern different token spaces.)
- **Binds:** `Doc-4A Appendix B.2`; Doc-5A §6. **Rationale:** error-code allocation is already a frozen Doc-4A registry; restating it here would create a second, drift-prone copy.

### B.3 Surface-Version Identifier Registry

- The API surface-version identifier is carried by the `Iv-Api-Version` standard header (§4.4 / §12.2). Its **form is an integer ≥ 1** per `Doc-4A §20.3` (the first frozen surface is version `1`). Its wire rendering is the canonical unsigned base-10 integer — no prefix, suffix, leading zeros, or decimal point (e.g. `1`, `2`, `3`…) — **[realization convention]**: integer wire-rendering only, it **adds no version semantics** to `Doc-4A §20.3`. No SemVer, calendar-version, date, or major/minor/patch scheme is defined — none exists in the frozen corpus.
- **Surface-version allocation follows `Doc-4A §20.2` and §20.3**; concrete per-surface version values are not enumerated here. This registry records the **identifier form and its single carriage channel** only — no version-classification logic lives in Appendix B.
- **Interpretation guard (binding):** surface-version identifiers are **API-surface identifiers only**. They **MUST NOT** be interpreted as a domain, entity, state-machine, or event version — those evolve only via corpus patch (§12.1; `Doc-2 §5`/§8; `Doc-4A §20`). A surface version never encodes or stands in for a domain version.
- **Binds:** Doc-5A §12 (§12.1/§12.2), §4.4 (`Iv-Api-Version`); `Doc-4A §20.3` (the integer ≥ 1 **form** only — the base-10 wire rendering above is a §3-consistent **[realization convention]**, not part of §20.3). **Rationale:** fixing one identifier form and one carriage channel prevents per-module version idioms; the interpretation guard protects the frozen domain/state-machine/event-evolution rules.

### B.4 Standard-Header Name Registry

- This registry **mirrors the §4.4 Header Registry** and is bound to it by a **normative synchronization requirement** (§4.5): the two **MUST** remain identical, and any divergence is a conformance failure resolved only by Doc-5A amendment. §4.4 is the authoritative source of each slot's role, canonical token, classification, and owning section. No header **value format** or **behavior** is defined here — those belong to each header's owning section.

| Slot (role) | Canonical token | Classification | Owning section |
|---|---|---|---|
| Request correlation id | `Iv-Request-Id` | Mandatory | Out of scope for Doc-5A (dev/observability, §1.3) |
| Authentication carrier | `Authorization` | Mandatory | §7 |
| Active-organization context carrier | `Iv-Active-Organization` | Mandatory (org-scoped) | §7 |
| Idempotency key | `Idempotency-Key` | Conditional (`Idempotency: required`) | §9 |
| Concurrency precondition | `If-Match` | Conditional (`Concurrency: optimistic`) | §9 |
| Surface version | `Iv-Api-Version` | Version-carriage header (owned by §12) | §12 |

> **Sync flag (PATCH-02 consequence):** the `Iv-Api-Version` row above records **ownership only** ("Version-carriage header (owned by §12)"); its wording intentionally differs from §4.4's classification cell ("Conditional — per §12 rules") to drop implied presence/absence behavior. Per the §4.5 **normative synchronization requirement** (CHK-5A-153), §4.4 ↔ B.4 must be reconciled by a **parallel §4.4 wording alignment** (Doc-5A amendment) — flagged for the freeze gate, not left silently divergent. No header behavior is defined here; **§12 remains sole owner** of version behavior.

- The paginated-traversal continuation cursor is **not** a header: per the **frozen `Doc-4A §9.6`** it is the opaque `cursor` request parameter (owned by §8), so it has no header slot and is excluded from this registry. The exclusion is a direct consequence of the frozen `Doc-4A §9.6` rule — not a local or board decision.
- **`Iv-Request-Id` governance ownership:** Doc-5A owns only this header's **slot existence and canonical token name**; its **behavioral semantics** (generation-when-absent, propagation, retention, sampling) are owned by development/observability documents (§1.3; §4.4). The Appendix A conformance checks therefore validate **token presence and name only** for this header and **do not validate its behavioral semantics**. No behavior rule is created here.
- HTTP infrastructure headers (`Content-Type`, `Accept`, etc.) are outside this registry and outside the conformance surface (§4.0). Any new application header carrying semantic meaning is allocated **here / §4.4 only** (§4.3) and requires a Doc-5A amendment.
- **`Iv-` prefix:** the `Iv-` application-header prefix is the reserved Doc-5 application-header namespace **[realization convention]** (ratified §4.3); only registered `Iv-` tokens above are sanctioned.
- **Binds:** Doc-5A §4.4 (authoritative header registry), §4.5 (synchronization), §4.3 (`Iv-` prefix); §7/§9/§12 (behaviors). **Rationale:** mirroring (not redefining) §4.4 keeps one header authority while giving parallel module authors a single lookup.

> **Carried governance flag — STRUCT-02 (structural patch synchronization pending):** the content header set above excludes the pagination cursor, consistent with the **frozen `Doc-4A §9.6`** (cursor = opaque request parameter, owned by §8) and the §4.4 content registry. The frozen **structure** document's §4 purpose line still lists "pagination cursors" among standard headers; `PATCH-D5A-STRUCT-02` aligning that purpose-line wording is **not yet applied**. The substantive exclusion is settled by frozen corpus (`Doc-4A §9.6`) — only the structure-doc **wording synchronization** remains (an additive structural patch, not an open decision). Flagged for the freeze gate; not absorbed here.

### B.5 Registration & Amendment Rules

- A new route prefix, error-code prefix, surface-version-identifier form, or standard-header name is added **only by a Doc-5A amendment** (`Doc-5_Program_Governance_Note_v1.0 §5`), board-gated. A Doc-5B…5M module document **MUST NOT** self-assign or invent any registry token; doing so is a conformance failure requiring escalation (Gov-Note §7).
- A registry entry whose frozen owner cannot be cited is **flag-and-halt**: it is never filled by local invention (Gov-Note §7).
- **Namespace Collision Resolution (binding, deterministic):** if two authorities claim the same token —
  1. **freeze authoring** of the affected surface;
  2. **raise a governance finding** (named, citing both claimants);
  3. **escalate to the Architecture / API Governance Board**;
  4. the **registry stays unchanged** until the Board resolves it.

  A collision is **never** resolved locally or by first-come precedence.
- **Binds:** `Doc-5_Program_Governance_Note_v1.0 §5` (amendment), §7 (escalation); Doc-5A §4.3 (allocation authority). **Rationale:** deterministic, board-gated collision handling is what makes the parallel-authored module family safe.

---

*End of Doc-5A Content v1.0, Pass 10 (Appendix B). Reserved API-Surface Namespace Registry only (thin, pointer-aggregating) — no new namespace, header, status code, error class, error-code value, version scheme, or POLICY key coined; module namespaces bound to `Doc-2 §0.3`, error-code prefixes to `Doc-4A Appendix B.2`, headers mirror §4.4, surface-version form to `Doc-4A §20.3`. The "Appendix B (later pass)" forward references in §4.4/§4.5, §5.3, §6, §12 are resolved here. STRUCT-02 = structure-doc purpose-line wording synchronization pending (substance settled by frozen `Doc-4A §9.6`; flagged for freeze gate). Appendix A (Conformance Checklist) and Appendix C (Cross-Reference Index) follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
