# Doc-5A — API Realization Standards — Content v1.0, Pass 9 (§12)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 9 of N — Section §12 only |
| Status | ACTIVE — Content Pass 9 of N; §12 only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1…Pass-8 (§0–§11) |
| Contains | API-versioning & evolution **wire-realization** only (thin) — surface-version vs domain-version boundary, surface-version expression on the wire, backward-compatible vs breaking realization, contract-identity stability, deprecation signalling, evolution discipline. No SemVer/CalVer/major-minor-patch scheme, no sunset dates, no migration plans, no version-negotiation/Accept-version algorithm, no new header, no new status code, no URL-path versioning scheme |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** The contract-versioning & evolution model (`Doc-4A §20` — version-vs-domain boundary §20.1, change classification §20.2, bump mechanics §20.3, deprecation pattern §20.4, AI-agent/freeze rules §20.5) and the event-evolution model (`Doc-4A §16` / `Doc-2 §8`) are **frozen** and owned upstream. §12 is **thin**: it does not restate the §20.2 classification table or re-decide any classification — it fixes only the **wire face** of versioning, binding everything else by pointer. It introduces no version scheme, no header, no status code, no URL-path versioning, no deprecation algorithm, and no migration policy. Transport-level choices are marked **[realization convention]**.

**Dependency realization path:** §0 (precedence) · §4.4 (`Iv-Api-Version` carrier) · §5 (stable resource path) · §6 (`error_class`) · §11 (event surface) · `Doc-4A §§16, 20`.

---

## §12 — API Versioning & Evolution Realization Standard

### 12.1 Surface Version vs Domain Version

- The **API surface version** governs how a module exposes its entities on the wire — field declarations, validation, error behavior, template fields (`Doc-4A §20.1`). It is **distinct** from the **domain version** (entities, state machines, events, permissions), which changes only through a corpus patch (`Doc-2 §5`/§7/§8, `Doc-3 §12`).
- A surface change that would require a new entity, state, transition, event, permission slug, or POLICY key is **not** a versioning action: it is a **domain change** that **MUST** be escalated as a corpus patch **first** — flag-and-halt (`Doc-4A §20.1`; `Doc-5_Program_Governance_Note_v1.0 §7`). The domain change always precedes the contract update that surfaces it.
- **Binds:** `Doc-4A §20.1`; `Doc-2 §5`/§7/§8; `Doc-3 §12`; Gov-Note §7. **Rationale:** mixing surface and domain versioning is the primary evolution failure; keeping the surface version off the domain protects the frozen state machines and event catalog.

### 12.2 Surface-Version Expression

- The API surface version is expressed **only** through the **`Iv-Api-Version`** standard header (declared in §4.4, owning section = §12) **[realization convention]**. The surface-version identifier is allocated in the Reserved API-Surface Namespace Registry (Appendix B, later pass); §4.4 and Appendix B **MUST** agree.
- The **resource path is stable** (§5): the surface version is **NOT** expressed by URL path, by query parameter, or by a versioned resource name. No alternate versioning channel is introduced.
- Contract-internal version mechanics are realized by pointer, not restated: contract versions are integers ≥ 1 and the Contract-ID encodes the version (e.g. `…​.v2`) per `Doc-4A §20.3`.
- **Binds:** Doc-5A §4.4 (`Iv-Api-Version`), §5 (path stability); `Doc-4A §20.3`; Appendix B (later pass). **Rationale [realization convention — header-carried version]:** one carriage channel (the header) keeps the resource identity and path stable across versions and prevents ten modules inventing ten URL-versioning idioms.

### 12.3 Backward-Compatible vs Breaking Realization

- Change classification is **owned by `Doc-4A §20.2`** and bound here **by pointer — not restated**. On the wire:
  - **Additive / editorial** changes (e.g. new optional response/request field, new optional enum value, new `error_code` within an existing class) **MUST NOT** bump the surface version (`Doc-4A §20.2`, §20.3).
  - **Breaking** changes (e.g. removing/renaming a field, changing a field type or semantics, a new required request field, renaming an `error_code`) **MUST** bump the surface version (`Doc-4A §20.2`, §20.3).
- Clients **branch on `error_class`, not `error_code`** (§6; `Doc-4A §12`/§20.2); adding a new `error_code` within an existing class is therefore additive and non-breaking.
- **Contract identity stability:** a breaking change creates a **new contract version, not a new contract identity or resource identity**, unless explicitly authorized by an architecture-level corpus patch (`Doc-4A §20.3`; `Doc-5_Program_Governance_Note_v1.0 §7`). Renaming a resource or coining a parallel identity to express a version — `VendorProfile → VendorProfileV2`, `RFQ → RFQV2`, `…Search → …SearchNew` — is **nonconforming**; the version increment is the only sanctioned channel.
- **Binds:** `Doc-4A §20.2`, §20.3; Doc-5A §6; Gov-Note §7. **Rationale:** classification stays single-sourced upstream; identity stability stops the most common AI-agent evolution error (forking a v2-named resource instead of bumping the version).

### 12.4 Deprecation Signalling

- Deprecation is **declared in the contract** per `Doc-4A §20.4` — the `Deprecated` / `Deprecated-At` / `Removal-Window` / `Successor` fields — and is realized by pointer, not restated. The **`Removal-Window` is referenced by POLICY key** (`core.system_configuration.<deprecation_window_key>`, `Doc-3 §12.2`), **never** a literal date on the wire or in this document.
- A deprecated surface is **still conforming and still enforced** (`Doc-4A §20.4`). Removal **before** the declared window closes, or while the surface still has **active callers**, is a **breaking change** that **MUST** be escalated — flag-and-halt (`Doc-4A §20.4`/§0.6; Gov-Note §7).
- **No new wire header is invented here.** Any HTTP-level deprecation response signal (e.g. a deprecation/sunset response header) is a change to the closed standard-header set and **MUST** be introduced through a §4 registry + Appendix B amendment — flag-and-halt; §12 does not coin it.
- **Binds:** `Doc-4A §20.4`; `Doc-3 §12.2` (POLICY key); Doc-5A §4 (header registry); Gov-Note §7. **Rationale:** deprecation windows are tunable policy (keyed, not literal); fencing the wire header keeps the standard-header set closed and single-sourced.

### 12.5 Evolution Discipline (AI-Agent & Freeze)

- The `Doc-4A §20.5` constraints are realized by pointer and are **absolute** for AI agents authoring Doc-5B…5M: **no domain change** (new entity/state/transition/event/slug/POLICY key) inside a surface change; **no removal or rename** of a stable field, `error_code`, or contract in a frozen surface without a breaking-change classification; any change **not classifiable** against `Doc-4A §20.2` **MUST** be escalated rather than merged (Gov-Note §7).
- **Event-surface evolution is a domain change, not a surface-version bump:** event names are stable, and renaming/removing an event follows `Doc-2 §8` change management (`Doc-4A §16`), surfaced by §11 — it is never expressed by an `Iv-Api-Version` increment.
- A surface version **MUST NOT** be used to express, encode, or stand in for a domain version (§12.1).
- **Binds:** `Doc-4A §20.5`, §16; `Doc-2 §8`; Doc-5A §11; Gov-Note §7. **Rationale:** the freeze model only holds if surface evolution stays additive-or-classified and never silently extends the domain or the event catalog.

---

*End of Doc-5A Content v1.0, Pass 9 (§12). API-versioning & evolution wire realization only (thin) — no SemVer/CalVer/major-minor-patch scheme, no sunset dates, no migration plans, no version-negotiation/Accept-version algorithm, no new header, no new status code, no URL-path versioning; the §20.2 classification table is bound by pointer, not restated. Appendices A–C follow in later passes, each conforming to `Doc-5A_Structure_v1.0_FROZEN.md`.*
