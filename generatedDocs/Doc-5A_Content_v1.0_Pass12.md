# Doc-5A — API Realization Standards — Content v1.0, Pass 12 (Appendix C)

| Field | Value |
|---|---|
| Document | Doc-5A — API Realization Standards (the API Realization Metastandard) |
| Pass | 12 of N — Appendix C only — **final content pass** |
| Status | ACTIVE — Content Pass 12 of N; Appendix C only; pending Independent Hard Review |
| Structure | Conforms to `Doc-5A_Structure_v1.0_FROZEN.md` (canonical TOC; structural change requires patch) |
| Authority | `Doc-5_Program_Governance_Note_v1.0` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A effective (`Doc-4A_Structure_v1.0_FROZEN` + Content Pass-1…Pass-6), Doc-4B…4M v1.0 — all FROZEN |
| Builds on | Doc-5A Content Pass-1…Pass-11 (§0–§12 + Appendix A + Appendix B) |
| Contains | The Cross-Reference Index only — one pointer table mapping every Doc-5A realization point to the frozen authority it realizes, plus the register of carried open items. **No authority of its own; pure aggregation of the `Binds:` already authored.** No new mapping, rule, token, or behavior |
| Audience | Architecture Board · API Governance Board · contract authors (human + AI) of Doc-5B…5M · AI Coding Supervisor · backend, frontend, QA engineers |

> **Realize, never re-decide.** This index is **not an authority** — each row's rule lives in the cited source, already bound in the section's own `Binds:`. The index exists to make the **abstract ↔ realization** boundary auditable in one place and to catch restatement drift. Every row traces to a pointer already authored in §0–§12 / Appendix A / Appendix B; this pass invents no mapping. Where a realization point depends on a frozen convention, the type column marks it. Transport-level Doc-5A choices are marked **[rc]** = *[realization convention]*.

**Dependency realization path:** all of §0–§12 + Appendix A + Appendix B (sources of every row).

---

## Appendix C — Cross-Reference Index (Doc-5A → Doc-4A / corpus)

### C.0 Purpose & Posture

- One table maps each Doc-5A realization point to the frozen standard it realizes (`Doc-4A §X`, Doc-2/Doc-3 section, ADR, Master Architecture, or Gov-Note). It **operationalizes realize-never-redecide**: a realization point with no upstream owner is a finding (flag-and-halt, Gov-Note §7), never an index row.
- The index is **descriptive, pointer-only**. It defines nothing; it carries no `MUST`. On any divergence between this index and an owning section, **the owning section wins** and the index is corrected by amendment.
- **Type legend:** *governance* (precedence/scope/conformance) · *realization* (abstract rule → wire) · *registry* (namespace/token allocation) · *enforcement* (the checklist gate) · **[rc]** *[realization convention]* (Doc-5A transport-level choice where the corpus is silent).

### C.1 Master Cross-Reference Table

| Doc-5A realization point | Realizes (frozen authority) | Type |
|---|---|---|
| §0 Document Control, Precedence & Conformance Obligation | `Doc-5_Program_Governance_Note_v1.0 §§1–5, §7`; Master Architecture (precedence head); `Doc-4A §§0–21` (scope-of-authority boundary); Appendix A (conformance obligation, §0.5) | governance |
| §1 Scope, Audience & Doc-5 Family Map | `Gov-Note §4`; `Doc-4A` (each Doc-5x realizes Doc-4x + ownership); `Doc-5A_Structure_v1.0_FROZEN` (letter map); `Doc-3 §12` (deferrals) | governance |
| §2 Realization Philosophy & Transport Binding | `Doc-4A §2` (implementation neutrality); `ADR-001`; `Architecture §19`; `Doc-4A §7` (non-disclosure doctrine, §2.1.2); `Doc-4A §18B` (stage) | governance / realization |
| §3 Wire Naming & Serialization | `Doc-4A §3` (snake_case), §8 (UUIDv7 / `human_ref`), §9 (money / timestamp / nullability), §10; `Doc-2 §§0.1, 0.4, 3` (enums) | realization |
| §4 Transport Envelope & Standard Header Set | `Doc-4A §9.7` (prohibited inputs), §9.8 (transport concepts deferred); §4.3 `Iv-` prefix **[rc]**; Appendix B.4 (mirror, §4.5 sync) | realization / registry |
| §5 Endpoint Realization | `Doc-4A §4` (topology/ownership §4.1–§4.2), §21.1 (template), §13 (commands); `ADR-012`; §5.5 success statuses **[rc]** | realization |
| §6 Error Realization & Status Mapping | `Doc-4A §12` (taxonomy/status), §7 (non-disclosure on the wire), §19 (rate/quota), §22.1 C-05 (top-level `reference_id`); Appendix B.2 → `Doc-4A Appendix B.2` (error-code namespace) | realization |
| §7 Identity, Context & Authorization | `Doc-4A §5` (org context, never client-trusted), §6 (authz / delegation); `Master Architecture §13` (permission model), §6.1 (isolation), §13.5 (platform roles); `ADR-001` (Supabase Auth = authentication only) | realization |
| §8 Pagination, Filter & Sort | `Doc-4A §9.6` (opaque cursor / allowlist), §10 (list shape), §7 (exclusion consistency), §18 (POLICY); `Doc-3 §12` | realization |
| §9 Idempotency & Concurrency | `Doc-4A §14.2` (idempotency key), §14.3 (joint replay rule), §14.5 (optimistic / `updated_at`), §16 (outbox), §17 (audit); `If-Match` / ETag **[rc]** | realization |
| §10 Asynchronous Operations | `Doc-4A §15.1` (accepted-then-processing), §15.2 (observation), §15.3 (status resource), §15.7 (realtime = delivery channel), §12.2 (`ASYNC_PENDING`); `Doc-3 §12.1` (no fabricated activity); `Doc-4M` / `Doc-2 §5` (state machine); `202` **[rc]** | realization |
| §11 Event Surface | `Doc-4A §16` (outbox events), §15.3 (status resource = completion truth); `Doc-2 §8` / `Doc-4J` (catalog), `Doc-4L` (flows); `Doc-5A_Structure_v1.0_FROZEN` §11 (webhook exclusion) | thin realization |
| §12 API Versioning & Evolution | `Doc-4A §20.1` (surface vs domain), §20.2 (classification), §20.3 (bump form), §20.4 (deprecation), §20.5 (AI/freeze), §16 (event evolution); `Doc-2 §5`/§8 (domain change); `Iv-Api-Version` **[rc]** | realization |
| Appendix A — Conformance Checklist | mirrors `Doc-4A Appendix A`; `Gov-Note §6` (conformance gate); sources = all §0–§12 + Appendix B | enforcement |
| Appendix B — Reserved Namespace Registry | `Doc-2 §0.3` (module namespaces); `Doc-4A Appendix B.2` (error-code prefixes); §4.4/§4.5 (headers); `Doc-4A §20.3` (surface-version form); `Gov-Note §5` (amendment) | registry / pointer |

### C.2 Carried Open Items (flagged, not resolved here)

The index records — but does **not** resolve — the open items surfaced during content authoring. Each is a **freeze-gate** item (`Doc-5_Program_Governance_Note_v1.0 §8`); none is closeable inside this appendix.

| Item | Nature | Authority / disposition |
|---|---|---|
| **STRUCT-02** | Structure §4 purpose line still lists "pagination cursors"; content excludes it. | Substance settled by frozen `Doc-4A §9.6` (cursor = request parameter, owned by §8); only a structure-doc purpose-line **wording-sync patch** (`PATCH-D5A-STRUCT-02`) remains. |
| **B.4 ↔ §4.4 `Iv-Api-Version` wording** | B.4 records "version-carriage header (owned by §12)"; §4.4 classifies "Conditional — per §12 rules". | §4.5 normative sync / `CHK-5A-153` require identical wording → parallel §4.4 alignment by Doc-5A amendment. |
| **GAP-D5A-P11-01** | `reference_id` carriage on no-body (`204`) responses is undefined: `Doc-4A §22.1 C-05` (every response) vs §5.5/§4.0 (204 no-body); `reference_id` defined only as a body field. | **CORPUS GAP** — escalated for a `Doc-4A` clarification (`Gov-Note §7`); Appendix A invents no mechanism. |

*Additional pre-existing freeze-gate debts (e.g. Pass-3 §5.6/§6.1 and Pass-4 §7 patches) are tracked by the program roadmap and the Freeze Readiness Audit, not duplicated in this index.*

---

*End of Doc-5A Content v1.0, Pass 12 (Appendix C) — and the **final content pass** of Doc-5A. Cross-reference index only: every row points to a frozen authority already bound in §0–§12 / Appendix A / Appendix B; no mapping, rule, token, or behavior is coined, and the index holds no authority of its own. Three carried open items are registered for the freeze gate, not resolved. With §0–§12 + Appendices A–C drafted, Doc-5A content is **complete pending Independent Hard Review and the Freeze Readiness Audit** (`Doc-5_Program_Governance_Note_v1.0 §8`).*
