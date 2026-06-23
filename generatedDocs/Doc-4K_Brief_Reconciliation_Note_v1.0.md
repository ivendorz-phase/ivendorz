# Doc-4K Brief — Reconciliation & Corpus-Mapping Note v1.0

| Field | Value |
|---|---|
| Document | `Doc-4K_Brief_Reconciliation_Note_v1.0` |
| Nature | **FLAG-AND-HALT reconciliation note.** Maps the "Doc-4K Part-1 — Cross-Module Execution Framework" brief against the frozen corpus. **No structure authored; no frozen decision overridden; no family-map reassignment.** Decision-support only. |
| Trigger | The brief's subject/scope conflicts with frozen authority (Doc-4A §1.3 family map; Master Architecture §16/§18). Per Charter, conflicts are surfaced, never resolved locally. |
| Authority cited | Master Architecture v1.0 FINAL (FROZEN); Doc-4A v1.0 (FROZEN); Doc-2 v1.0.3 (FROZEN). |
| Date | 2026-06-19 |
| Status | **Awaiting user decision** (no authoring proceeds until the target is confirmed). |

---

## 1. The conflict in one paragraph

The brief asks to author **Doc-4K Part-1** as a normative **"Cross-Module Execution Framework"** governing orchestration, cross-module authority boundaries, execution ownership, module interaction contracts, permission execution, failure handling, audit, and AI-agent safety — i.e. rules that **bind every module**. But the **frozen family map (Doc-4A §1.3)** assigns **Doc-4K = AI Layer (Module 9)** and assigns the **cross-module integration view to Doc-4L**, which is **explicitly non-normative** ("defines nothing … MUST NOT be cited as a contract source"). Separately, the cross-cutting *rules* the brief enumerates are **already frozen and owned by Doc-4A**. So the brief, as titled, cannot be executed without (a) reassigning a frozen document number, and (b) creating a second source of truth for governance Doc-4A already owns — both prohibited by the Project Instructions and the One-Business-Truth-One-Source principle.

**Frozen anchors (verbatim by pointer):**
- Doc-4A §1.3: "**Doc-4K** | AI Layer contracts (Module 9; advisory-only per Master Architecture §18)."
- Doc-4A §1.3: "**Doc-4L** | Cross-Module Integration & Event Flow Index — a non-normative index assembled from source-module-owned contracts; it defines nothing and **MUST NOT** be cited as a contract source."
- Master Architecture §16: ten strictly bounded modules (Module 0–9); "cross-module communication happens only through services, events, and public contracts."
- Master Architecture §18: "Module 9 is the platform's AI capability … owns no authoritative business records … produces only regenerable derived artifacts."
- Doc-2 §3.10 / §10.10: `ai` (Module 9) = `recommendations`, `predictions`, `classification_results`, `similar_vendor_results` — all "derived, regenerable, disposable; never source of truth; hard delete allowed (cache)."

---

## 2. Where every Part-1 scope item ALREADY lives (the mapping)

The brief's Part-1 scope is reproduced below, each line mapped to its **existing frozen home**. "Doc-4A (FROZEN)" means the rule already exists and is authoritative; re-authoring it elsewhere would duplicate a source of truth.

### Governance
| Brief item | Frozen home | Verdict |
|---|---|---|
| Purpose / Scope / Authority | Doc-4A §0.1 Authority & Precedence · §0.2 Scope of Authority · §1.3 Family Map | Exists (Doc-4A) |
| Relationship to prior documents | Doc-4A §0.1 precedence chain; Project Instructions precedence order | Exists (Doc-4A) |
| Document conventions | Doc-4A §3 (Vocabulary, Naming, Notation, Normative Keywords, Patch Citation, Prohibited Terminology) | Exists (Doc-4A) |

### Cross-Module Execution Rules
| Brief item | Frozen home | Verdict |
|---|---|---|
| Ownership principles | Doc-4A §4.1 Ownership Rules; Master Arch §16 (One Entity = One Owner) | Exists (Doc-4A) |
| Authority principles | Doc-4A §6.1 Universal Authorization Contract; §6.2 Slugs-only | Exists (Doc-4A) |
| Execution responsibility rules | Doc-4A §4.2 API Surface Composition; §15.5 Async Ownership & Attribution | Exists (Doc-4A) |
| Service interaction rules | Doc-4A §4.2/§4.3 (cross-module effects only via owning module's service/event) | Exists (Doc-4A) |
| Event interaction rules | Doc-4A §4.4 single-authorship; §16 Events Are Facts; §16.3 produced-events | Exists (Doc-4A) |

### Module Interaction Framework
| Brief item | Frozen home | Verdict |
|---|---|---|
| Allowed / forbidden interactions | Doc-4A §4.3 (no cross-module entity mutation; helper/shared-table/batch bypass prohibited) | Exists (Doc-4A) |
| Dependency rules | Doc-4A §4.5 Cross-Module Reference Expectations; §8.4 Cross-Module References | Exists (Doc-4A) |
| Anti-corruption / boundary protection | Doc-4A §4.3 + §8.4 (bare-UUID refs, no cross-schema FK, no cross-module cascade); Master Arch §16.4 | Exists (Doc-4A) |

### Permission Execution Framework
| Brief item | Frozen home | Verdict |
|---|---|---|
| Permission enforcement principles | Doc-4A §6.1–§6.3; §11.2 stage 3 AUTHZ | Exists (Doc-4A) |
| Delegation execution principles | Doc-4A §6 (delegation/§6B); §19.4 Quota Attribution & Delegation; Doc-2 §6 delegation | Exists (Doc-4A) |
| Multi-actor execution rules | Doc-4A §5.2 Actor Types; §5.3 Active Org Context; §5.5 Context Propagation; §5.6 Admin Context | Exists (Doc-4A) |
| Authority verification requirements | Doc-4A §6.1 (`check_permission`, three-layer); §11.2 ordered validation | Exists (Doc-4A) |

### Audit & Traceability Framework
| Brief item | Frozen home | Verdict |
|---|---|---|
| Audit requirements | Doc-4A §2.4 Auditable by Construction; §17 Audit (Doc-2 §9 by pointer) | Exists (Doc-4A) |
| Traceability / observability | Doc-4A §5.4 Attribution; §15 async progress/outcome observation; observability endpoints → Development Decomposition (Doc-4A §0 scope split) | Exists (Doc-4A) / Dev-doc |

### Failure & Exception Framework
| Brief item | Frozen home | Verdict |
|---|---|---|
| Failure classification | Doc-4A §12.1–§12.6 closed error-class set + class-specific rules | Exists (Doc-4A) |
| Recovery / retry principles | Doc-4A §14.7 Retry & Error-Class Alignment; §15.6 Async Failure Handling | Exists (Doc-4A) |
| Escalation principles | Doc-4A §6.4 Missing-Permission Escalation; §12.6 Escalation Behavior; §0.6 flag-and-halt | Exists (Doc-4A) |

### AI-Agent Implementation Safety
| Brief item | Frozen home | Verdict |
|---|---|---|
| AI coding constraints | Doc-4A §2.5 AI-Agent Authoring Rules; §4.4 (agents MUST NOT generate cross-module access) | Exists (Doc-4A) |
| Implementation safety / ambiguity prevention | Doc-4A §2.3 Determinism & Explainability; §2.6 Smallest-Change Doctrine | Exists (Doc-4A) |
| Cross-document consistency | Doc-4A §20.5 AI-Agent & Freeze Compatibility; §22.1 Consistency Corrections | Exists (Doc-4A) |

**Result: 100% of the Part-1 scope already has a frozen home — almost entirely in Doc-4A, with a few observability items belonging to the Development Decomposition.** Nothing in the brief's Part-1 scope is genuinely unhomed. A new "execution framework" document would re-state Doc-4A governance — the duplication the brief itself forbids ("avoid duplication of existing documents," "avoid ownership leakage").

---

## 3. What Doc-4K actually is (frozen)

**Doc-4K = AI Layer (Module 9), schema `ai`, namespace `ai_`.** Per Doc-2 §3.10/§10.10 it owns exactly four **derived** aggregates — Recommendation (`recommendations`), Prediction (`predictions`), Classification Result (`classification_results`), Similar Vendor Result (`similar_vendor_results`) — all **regenerable, disposable, hard-delete-permitted (cache semantics), never source of truth.** Per Master Architecture §18 it is **advisory-only**: it owns no authoritative record, makes no procurement decision (moat), computes no Trust/Performance/Verification/Governance score (firewall), and (expected, to confirm at inventory gate) **produces and consumes no Doc-2 §8 event.** This is the next lifecycle step the Context Pack v5 and Program Roadmap already name.

**Doc-4L = Cross-Module Integration & Event-Flow Index** is the home for a *cross-module view*, but it is **non-normative**: it assembles the per-module event production/consumption + service seams that the owning modules already define, cites them by pointer, and **defines nothing new**. It is sequenced **after** Doc-4K in the roadmap.

---

## 4. Options (unchanged from the question; recorded here for the file)

1. **Author Doc-4K as the AI Layer (Module 9)** — honor Doc-4A §1.3; the standard next step. Your execution-framework concerns are already covered by Doc-4A (governance) and will be *indexed* by Doc-4L (cross-module view). **Recommended** — zero conflict, zero duplication.
2. **Retarget the intent to Doc-4L** — if you want the cross-module execution/event-flow picture, author `Doc-4L_Structure` as a **non-normative index** (pointers to Doc-4A rules + per-module contracts; defines nothing). Note the roadmap sequences Doc-4L after Doc-4K.
3. **New document number, Doc-4A §1.3 amended first** — if you want a *normative* standalone execution framework, the frozen family map must be amended by Architecture-Board action to add a new slot (not Doc-4K, not Doc-4L). Halt authoring until approved. **Caveat:** heavy overlap with already-frozen Doc-4A governance; high duplication risk.

---

## 5. Recommendation

Proceed with **Option 1 — author `Doc-4K_Structure_Authoring_v1.0` as the AI Layer (Module 9)**, structure-only, running the inventory gate against Doc-2 §2/§3.10/§10.10 first and flag-and-halt on any anchor conflict. This respects the frozen family map, advances the named roadmap, and avoids duplicating Doc-4A. The cross-module execution material in the brief is **not lost** — it is governed by Doc-4A today and will be surfaced as a navigable view by Doc-4L next. If a genuinely normative, standalone cross-module execution framework is still wanted after seeing this mapping, that is Option 3 and requires a frozen-map amendment first.

---

*End of Doc-4K_Brief_Reconciliation_Note_v1.0. FLAG-AND-HALT decision-support only. No structure authored, no frozen governance overridden, no family-map reassignment. Awaiting user confirmation of target before any authoring.*
