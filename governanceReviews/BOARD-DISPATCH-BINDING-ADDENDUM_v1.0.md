<!--
Doc-type:  Board decision record — additive dispatch binding (NON-authoritative under the frozen
           corpus). Binds currently provisioned AI models to the abstract Model Classes of the
           ratified AI Engineering Organization v1.0 §6.10. The organization plan is NOT amended.
Directive: Owner Board ruling "APPROVED WITH CLARIFICATION" (2026-07-09) — record the binding in a
           separate, replaceable companion; keep the organization document vendor-neutral.
-->

# Board Dispatch Binding — Addendum v1.0

| Field | Value |
|---|---|
| **Document type** | Board decision record · additive dispatch binding · non-authoritative under the frozen corpus |
| **Binds against** | `project-management/ai-engineering-organization-plan.md` (v1.0 — Ratified) §6.10 abstract Model Classes + routing rules — **which remain authoritative and unchanged** |
| **Status** | **APPROVED v1.0** (owner Board ruling, 2026-07-09 — "approved with clarification": bind in a companion, never in the organization document) · review round R1 folded same date (MINOR-01 class-first role defaults · NIT-01 effectivity block · NIT-02 scope statement) |
| **Effective date** | **2026-07-09** |
| **Supersedes** | None — first dispatch binding issued under the ratified plan |
| **Superseded by** | — (append the v1.1+ pointer here when a superseding binding issues; this file is otherwise never edited) |
| **Record class** | Append-only Board decision record; changes = a superseding version (v1.1+) of **this file only** |
| **Maintained by** | AI Engineering Orchestrator proposes · Board approves; the organization plan never changes when models change |
| **Rule** | Concrete model names appear **only in this addendum** (and in dispatch logs). Packets, reports, charters, and the organization plan stay model-neutral — they speak in §6.10 classes. |

**Depends on:** AI Engineering Organization v1.0 (`project-management/ai-engineering-organization-plan.md`)
· `BOARD-DECISION-AI-ENG-ORG_v1.0.md` · CLAUDE.md (§7 authority · §8 AI rules · §13 Review & Findings
Governance).

**Related governance:** [`AI-Activation-Packet-Template.md`](AI-Activation-Packet-Template.md)
(§0 "Model class" field — the abstract class this addendum resolves at dispatch) ·
[`AI-Completion-Report-Template.md`](AI-Completion-Report-Template.md) ·
[`TEAM-6-Security-Review-Charter.md`](TEAM-6-Security-Review-Charter.md) (independence + class floor
already bound there by pointer).

> **Scope of change.** This addendum binds the currently approved AI models to the existing
> abstract Model Classes. It does **not** amend the AI Engineering Organization, Board governance,
> team responsibilities, the runtime lifecycle, activation rules, or the concurrency policy.

> **Purpose.** The organization plan deliberately defines routing in **abstract Model Classes**
> (lightweight · medium · advanced · highest capability, §6.10) so the governance is vendor-neutral
> and durable. This addendum is the **implementation-specific, replaceable half**: it records which
> currently provisioned models realize those classes, the resulting per-role dispatch defaults, and
> the deterministic escalation triggers. Replacing a model (or an entire provider) supersedes this
> addendum — and **only** this addendum.

---

## 1. Decision

The Board approved binding the currently provisioned model set — **Fable · Opus · Sonnet** — to the
existing §6.10 classes, as recorded in §2–§4 below, with the clarifications that:

1. The abstract Model Classes and the §6.10 routing rules **remain authoritative**; this addendum
   adds no class, no rule, and no reinterpretation.
2. Review independence is **not** defined by model choice (§5).
3. The binding is replaceable without touching the organization plan (§6).

Team responsibilities, the runtime lifecycle, activation rules, packet limits, dispatch priority
(P0–P3), and the concurrency policy are **untouched** by this record.

## 2. Class → model binding

| §6.10 class | Bound model | Note |
|---|---|---|
| Lightweight | **Sonnet** | No lighter tier is currently provisioned; dispatching lightweight work on Sonnet is a forced route-up, which §6.10 permits ("when unsure of the class, route **up**"). When a lighter tier is provisioned, rebind here (v1.1+) — nothing else changes. |
| Medium | **Sonnet** | — |
| Advanced | **Sonnet** (default) · **Opus** (escalated) | Escalation is deterministic — §4 triggers only, never a judgment call at dispatch. |
| Highest capability | **Fable** | Realizes the ratified guard: a governance-gating review never routes below this class. |

Work-type → class assignment is owned by the §6.10 table and is **not restated here**; this table
answers only "which model realizes the class today."

## 3. Role dispatch defaults

A role never owns a model — it owns a **Model Class**, assigned by the ratified plan (pointer
given per row). The "Current binding" column is the only vendor-specific content and resolves
purely through the §2 table; when §2 rebinds, this column follows with no governance meaning of
its own. The packet's §0 **Model class** field continues to carry the abstract class; the
concrete model is resolved at dispatch.

| Role (org plan §1–§2) | Model Class (per org plan — authoritative) | Current binding (via §2) |
|---|---|---|
| AI Engineering Orchestrator (incl. Backend-Lead hat; cross-module decomposition) | **Highest** — §6.10 rule: "the coordinator stays on a highest-class model" | Fable |
| Build: Team-1/2/3 (FE lanes) · Team-7 Module Agents M0–M9 · wiring | **Advanced** (§6.10 row 3) | Sonnet · escalated: Opus (§4 triggers) |
| Team-4 — Review-A (gating) | **Highest** (§6.10 row 4) | Fable |
| Team-5 — Review-B (gating for merge) | **Advanced** (§6.10 row 3 — the ratified floor, unchanged); dispatched at **Highest** as a standing route-up (owner-endorsed 2026-07-09; §6.10 permits routing up without amendment) | Fable |
| Team-6 — Security Review (gating) | **Highest** (§6.10 row 4; charter §Independence binds it) | Fable |
| Team-8 — mechanical documentation (changelog, tracker upkeep, template refresh) | **Lightweight** (§6.10 row 1) | Sonnet (§2 toolset floor) |
| Team-8 — Board-packet / governance-record drafting | **Highest** (§6.10 row 4) | Fable |
| Team-9 — DevOps / Release (build verification, pipelines, migration ordering) | **Medium** (§6.10 row 2) | Sonnet · escalated: Opus (§4 triggers) |

## 4. Deterministic escalation (Sonnet → Opus)

Escalation is a rule about the **default vs. escalated binding of the Advanced/Medium classes**
(§2), not about the models themselves. Under the current binding, an implementation activation
dispatches on **Opus instead of Sonnet** when — and only when — at least one trigger below holds. Triggers are objective properties of the work item, readable from
the WP card and the activation packet; "difficult" or "complex" is never a trigger.

| ID | Trigger (objective, packet/WP-card-readable) |
|---|---|
| **E1** | The packet's scope includes a **frozen state machine** — any Doc-4M-pointed state machine, or files under a module's `domain/state-machines/`. |
| **E2** | The scope **emits or consumes a catalogued event**, or touches the transactional outbox (M0) — i.e., work on a cross-module event seam. |
| **E3** | The scope **creates or modifies a `contracts/` file** of the owning module (contract-first ladder work under Doc-4A governance). |
| **E4** | The scope includes the **M3 matching / routing / scoring control plane** (Doc-4E — the moat). |
| **E5** | The work item's dispatch priority is **P0** (org plan §5 — stops the line). |
| **E6** | The **second consecutive non-pass review verdict** on the same work item (two REVISION/ISSUES cycles in the same RV chain) — the fix reactivation escalates. |

Mechanics:

- Escalation moves exactly **one binding step** (Sonnet → Opus) and is recorded on the packet §0
  line as `advanced (escalated: E-<n>)` and on the WP card.
- Once a work item escalates, **every subsequent reactivation of that item stays escalated**
  (context destruction makes mid-item de-escalation meaningless); the next work item is evaluated
  fresh.
- Escalation never crosses a class boundary: highest-class work is Fable regardless of triggers,
  and no trigger ever routes gating-review work **down** (the ratified §6.10 guard).
- When trigger applicability is itself ambiguous, the ratified tie-break applies: route **up**.

## 5. Independence rule (restated ruling — binding)

Review independence is achieved by the **ratified runtime model**, not by model diversity:

- **fresh activation** — one review = one new context (org plan §4);
- **context destruction** — reviewer contexts are destroyed on completion, never resumed (§9);
- **stateless review** — no shared working memory with the builder, Team-4, Team-5, or Team-6
  (charters; org plan §2 "Never" items);
- **separate activation packets** — the coordinator authors each packet; no role authors its own.

Dispatching the reviewer on a different model than the builder is an **optional routing decision**
under §2–§3 of this addendum. It is never the source of independence, and a same-model
builder/reviewer pair in separate fresh contexts is fully independent under the ratified rules.

## 6. Supersession & vendor neutrality

- **Replacing a model** (new tier, new version, new provider): issue this addendum at v1.1+ with
  the §2 table rebound and, if defaults shift, the §3 table updated. The organization plan, the
  Board decision record, the templates, and the charters are **not** touched.
- **Adding a tier** (e.g. a lightweight-class model): rebind §2 row 1 only.
- The organization runs on any provider (org plan §6.9); nothing in this addendum introduces a
  vendor-specific rule into the organization — it only names the models provisioned **today**.

## 7. Dispositions recorded with this binding (CLAUDE.md §13)

Three deviations raised against an earlier informal routing table were adjudicated by making this
binding conform to the ratified plan:

| Raised | Disposition |
|---|---|
| Orchestrator on Opus | **Not adopted.** §6.10's "the coordinator stays on a highest-class model" is ratified and authoritative; binding the coordinator below the highest class would amend the plan, which this ruling forbids. Orchestrator → Fable (§3). An owner who wants an Opus coordinator may direct a superseding addendum version recording that explicit exception. |
| Team-5 Review-B on Fable | **Adopted as a standing route-up** (§3) — permitted by §6.10 without amendment; the ratified Advanced floor is unchanged. |
| Team-8 flat single model | **Not adopted.** Team-8 splits per the ratified table: mechanical work = lightweight (Sonnet, toolset floor); Board-packet drafting = highest (Fable). A flat binding would have under-routed a gating-class work type. |

## 8. Conformance self-check (performed at authoring)

- ☑ No governance change: no class, rule, team responsibility, lifecycle state, activation rule,
  packet limit, priority level, or concurrency ceiling added, removed, or reworded.
- ☑ No architecture content: modules, boundaries, signals, invariants untouched.
- ☑ No duplication: §6.10's work-type table is bound by pointer, never restated.
- ☑ Vendor-neutral governance preserved: model names exist only in this file.
- ☑ Abstract Model Classes remain authoritative; every §3 row derives from a cited plan section.
- ☑ Independently replaceable: §6 supersession path touches this file only.
- ☑ No conflict with the frozen corpus or the ratified plan was found — no Flag-and-Halt required.

---

*Non-authoritative Board decision record. Conforms upward (CLAUDE.md §7); coins nothing; binds the
provisioned toolset to ratified classes and nothing more.*
