# Doc-4K_Structure_FROZEN_v1.0 — AI Layer (Module 9) — FROZEN Structure Baseline

| Freeze Metadata | Value |
|---|---|
| Structure Status | **FROZEN** |
| Document | `Doc-4K_Structure_FROZEN_v1.0` |
| Authority | **Architecture Board** |
| Module | **9** |
| Schema | **`ai`** |
| Namespace | **`ai_`** |
| Source body | `Doc-4K_Structure_Authoring_v1.0` (byte-faithful; 2 Board-dispositioned NITPICK editorial folds applied inline — K-HR-N1 §K3, K-HR-N2 §K6) |
| Freeze chain | Structure Proposal → `Doc-4K_Structure_Independent_Hard_Review_v1.0` → `Doc-4K_Structure_Hard_Review_Patch_v1.0` → `Doc-4K_Structure_Patch_Verification_v1.0` (PATCH VERIFIED) → `Doc-4K_Structure_Board_Assessment_v1.0` (APPROVE FOR STRUCTURE FREEZE) → `Doc-4K_Structure_Freeze_Audit_v1.0` (FREEZE APPROVED) |
| Freeze authority | `Doc-4K_Structure_Freeze_Audit_v1.0` — FREEZE APPROVED (12 domains PASS · BLOCKER=0 · MAJOR=0 · MINOR=0 · NITPICK=0) |
| Conforms To | Master Architecture v1.0 FINAL (§16/§18), ADR Compendium v1, Doc-2 v1.0.3 (§2/§3.10/§10.10), Doc-3 v1.0.2, Doc-4A v1.0 (§1.3), Doc-4B–4J — all FROZEN |
| Baseline for | `Doc-4K_PassA_Content_v1.0` (authoritative structure baseline for all future Doc-4K content authoring) |
| Conflict rule | FLAG-AND-HALT |

## Frozen Decisions (Architecture Board)

**Q1 — BC Granularity.** Four bounded contexts retained:

```
BC-AI-1 Recommendation
BC-AI-2 Prediction
BC-AI-3 Classification Result
BC-AI-4 Similar Vendor Result
```

(Doc-2 §2 = four separate aggregates, one per BC.)

**Q2 — Matching-Assist Ownership.**

```
Matching-Assist Confidence Artifact → BC-AI-1 Recommendation
```

RFQ remains authoritative decision owner. AI remains advisory-only (moat preserved).

**Q3 — Event Refresh Posture.**

```
Pull / Derive On Demand
```

AI Layer consumes no authoritative events. Future event-assisted refresh remains `[ESC-AI-EVENT]` only.

## Frozen Section Hierarchy

```
K1  Module Overview
K2  Business Objectives
K3  BC Landscape
K4  Context Responsibilities
K5  Aggregate Inventory
K6  Domain Service Inventory
K7  External Dependency Map
K8  Ownership Matrix
K9  Event Production Map
K10 Event Consumption Map
K11 Authorization Surface
K12 Audit & Traceability Surface
K13 Lifecycle Registry
K14 Escalation Inventory
K15 Cross-Module Reference Inventory
K16 AI-Agent Governance
K17 Structure Summary
```

---

# Doc-4K — AI Layer — API & Integration Contracts — Structure (FROZEN baseline)

| Field | Value |
|---|---|
| Document | **Doc-4K_Structure_FROZEN_v1.0** — Module 9 AI Layer (`ai` schema, `ai_` namespace) — **FROZEN** structure baseline |
| Lifecycle stage | **FROZEN** — authoritative structure baseline. Authored Proposal → Independent Hard Review → Hard Review Patch → Patch Verification → Architecture Board Assessment (APPROVE FOR STRUCTURE FREEZE) → Structure Freeze Audit (FREEZE APPROVED) → this FROZEN record. Next: `Doc-4K_PassA_Content_v1.0`. |
| Scope of this document | Bounded contexts, aggregates, ownership, dependency markers, event maps, authorization surface, lifecycle registry (high-level), AI-agent governance — **structure only**. **No** field registries, value-object specs, read models, idempotency, concurrency, retention, indexes, API contracts, error matrices, or state-machine detail (those are Pass-A / Pass-B). |
| Authority | Doc-4A v1.0 (FROZEN) governs this document; Doc-4_Governance_Note_v1.0. On any conflict: **FLAG-AND-HALT**. |
| Conforms To | Master Architecture v1.0 FINAL (§16 ten-module map, §18 AI Layer), ADR Compendium v1, Doc-2 v1.0.3 (§2 / §3.10 / §10.10), Doc-3 v1.0.2, Doc-4A–4J v1.0 — all FROZEN. |
| Family-map binding | Doc-4A §1.3 (FROZEN): "**Doc-4K** | AI Layer contracts (Module 9; advisory-only per Master Architecture §18)." Cross-module integration is **Doc-4L's** non-normative scope — **not** this document. |
| Inventory-gate result | **PASS (2026-06-19).** Doc-2 §2/§3.10/§10.10 pinned: 4 derived aggregates; AI owns no authoritative record; **no Doc-2 §8 event produced or consumed** (catalog scan: zero AI events; `ai.` never a Source-Ref); **no `ai_` §7 slug**, **no AI §9 audit domain**, **no `ai.*` §12.2 POLICY key** — escalation markers carried where the corpus is silent. No conflict found. |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA / Solution Architects — structure foundation, no architecture interpretation required. |

**Structure mission.** Establish the stable, ownership-unambiguous skeleton for Module 9 (AI Layer) so the subsequent Pass-A (contract inventory) and Pass-B (hardening) author against a fixed set of bounded contexts, aggregates, ownership rules, dependency seams, and an event/authorization/lifecycle surface — **without inventing anything**. The AI Layer is **advisory-only**: it owns no authoritative business record, makes no procurement decision (the moat), and computes/owns no Trust/Performance/Verification/Governance score (the firewall). Its outputs are **derived, regenerable, disposable** artifacts (cache semantics) that other modules **may** consume as non-authoritative suggestions. Where the corpus does not yet enumerate a slug, audit action, POLICY key, or event for the AI Layer, this structure carries an **`[ESC-AI-*]`** escalation marker to the owning document's additive channel and **coins nothing**.

---

## §K1 — Module Overview

- **Purpose:** Fix the identity of Module 9 — name, schema, namespace, architectural role, and activation posture — as the anchor every later section binds to.
- **Expected content scope (by pointer; structure only):** Module 9 = **AI Layer**, schema **`ai`**, namespace **`ai_`** (Doc-2 §2 schema map; Master Architecture §16/§18). Architectural role: the platform's **advisory AI capability**, architecturally reserved now and activated incrementally against accumulated data (Master Architecture §18 — RFQ structuring + category classification first; quote-comparison, matching-assist, image-search later) — **each activation lands inside Module 9's existing boundary: new derived-artifact tables, new service contracts, no new ownership.** Deployment: a module of the serverless modular monolith (Master Architecture §16); "Shared (future activation)" tier (Master Architecture §16 module table).
- **Dependencies:** Master Architecture §16, §18; Doc-2 §2 (schema/aggregate map); Doc-4A §1.3 (family-map binding).
- **Excluded scope:** No redefinition of the module's role; no new capability beyond the Master-Architecture §18 set; no activation timeline (operational, not structural); no contract.

---

## §K2 — Business Objectives

- **Purpose:** State, at structure level, what the AI Layer exists to do and the non-negotiable constraints that bound it — so content passes never drift into authority the module does not hold.
- **Expected content scope:** Objective — produce **derived, non-authoritative** decision-support artifacts (recommendations, predictions, classifications, similarity results) that augment, never replace, the platform's deterministic logic. Constraints (all frozen): (a) **owns no authoritative business record** (Master Architecture §18; Doc-2 §10.10 "never source of truth"); (b) **advisory-only** — the deterministic procurement gates (RFQ pipeline steps 1–4: buyer filter, category, verification, tier eligibility) remain rule-based permanently; AI may only *augment confidence scoring* (step 5) as a non-binding suggestion (Master Architecture §18); (c) **moat** — owns/influences no matching/routing/ranking/supplier-selection/award/eligibility *decision*; (d) **firewall** — computes/owns no Trust/Performance/Verification/Governance score; (e) artifacts are **regenerable, disposable** (hard delete permitted, cache semantics).
- **Dependencies:** Master Architecture §18; Doc-2 §10.10; ADR Compendium (procurement-moat + governance-signal firewall ADRs, by pointer).
- **Excluded scope:** No KPI/metric targets (operational); no model/algorithm choice (development-document scope); no contract; no claim of decision authority.

---

## §K3 — Bounded Context Landscape

- **Purpose:** Partition Module 9 into bounded contexts, each owning a disjoint slice of the AI derived-artifact surface — the BC inventory every aggregate and contract later binds to.
- **Expected content scope (structure-level BC set; one aggregate family per BC; names structural, bound to Doc-2 §2 Module-9 aggregates):**
  - **BC-AI-1 — Recommendation** — owns the **Recommendation** aggregate (`ai.recommendations`); vendor/RFQ recommendation artifacts. *(Carries the Score + Basis value objects per Doc-2 §2 — declared in Pass-A/B, not here.)*
  - **BC-AI-2 — Prediction** — owns the **Prediction** aggregate (`ai.predictions`); predictive artifacts.
  - **BC-AI-3 — Classification** — owns the **Classification Result** aggregate (`ai.classification_results`); category/classification outputs (e.g., RFQ-structuring / category-assist support).
  - **BC-AI-4 — Similarity** — owns the **Similar Vendor Result** aggregate (`ai.similar_vendor_results`); similarity caches / similar-vendor results.
- **Dependencies:** Doc-2 §2 (Module-9 aggregate table), §3.10 (`ai` entity catalog), §10.10 (`ai` blueprint).
- **Excluded scope:** **No fifth context**; no BC that owns an authoritative record; no BC that performs matching/routing/award or computes a score; no aggregate shared across BCs; no contract IDs (Pass-A). *(BC count is held at four to mirror the four frozen aggregates one-to-one; a Hard-Review may challenge whether the four collapse into fewer BCs — see §K-Summary open question.)*

---

## §K4 — Context Responsibilities

- **Purpose:** Give each BC a single-responsibility charter (what it produces, from what inputs, for whom) — without contracts — so content passes know each context's remit and its boundaries.
- **Expected content scope (responsibility per BC; capability-level only):**
  - **BC-AI-1 Recommendation:** generate/refresh/serve/expire non-authoritative vendor or RFQ recommendation artifacts for a requesting organization, derived from upstream data the org may already see; expose them as suggestions only.
  - **BC-AI-2 Prediction:** generate/refresh/serve/expire predictive artifacts (derived, advisory).
  - **BC-AI-3 Classification:** produce category/classification outputs that *support* (never decide) RFQ structuring / category assignment; the authoritative category remains Marketplace's, the authoritative RFQ remains RFQ's.
  - **BC-AI-4 Similarity:** maintain similar-vendor / similarity cache artifacts, derived and disposable.
  - **Common to all four:** read upstream inputs **only within the requesting organization's existing permissions** (Doc-2 §10.10 "reads honor requesting org's permissions"); write **only** the BC's own `ai.*` table; treat every output as regenerable cache.
- **Dependencies:** Doc-2 §10.10 (tenant scope + permission-honoring reads); Master Architecture §18 (advisory role); Doc-4A §4.1 (one owner).
- **Excluded scope:** No responsibility that mutates another module's entity; no responsibility that returns an authoritative decision/score; no read that bypasses the requesting org's permissions; no contract.

---

## §K5 — Aggregate Inventory

- **Purpose:** Enumerate the four Module-9 aggregates (Doc-2 §2), each assigned to exactly one bounded context — the machine-readable ownership ledger for content passes.
- **Expected content scope (aggregate → root → children/value-objects → owning BC-AI, by pointer to Doc-2 §2/§3.10):**
  - **Recommendation** — root `ai.recommendations` (AR); **no child entities**; VOs **Score, Basis** (Doc-2 §2) → **BC-AI-1**.
  - **Prediction** — root `ai.predictions` (AR); no children; no VO enumerated → **BC-AI-2**.
  - **Classification Result** — root `ai.classification_results` (AR); no children; no VO enumerated → **BC-AI-3**.
  - **Similar Vendor Result** — root `ai.similar_vendor_results` (AR); no children; no VO enumerated → **BC-AI-4**.
- **Dependencies:** Doc-2 §2 (Module-9 aggregate design), §3.10 (entity catalog), §10.10 (`ai` blueprint). Reference field set (Doc-2 §10.10, **by pointer only — not authored here**): `result_jsonb, model_version, generated_at, expires_at`.
- **Excluded scope:** **No aggregate belongs to more than one context**; no aggregate added beyond the Doc-2 §2 Module-9 set; no aggregate from another module (matching results = RFQ; vendor profile = Marketplace; scores = Trust); no field/VO specification (Pass-B); the four aggregates are all derived AR — **none is authoritative**.

---

## §K6 — Domain Service Inventory

- **Purpose:** Name the structure-level domain-service *surfaces* per context (capabilities, not contracts) — so content passes know where each capability lands without inventing service names or contract IDs.
- **Expected content scope (service surface → owning BC-AI; capability-level only):** a **generate/regenerate** surface, a **serve/read** surface, and an **invalidate/expire** surface per BC (recommendation service — BC-AI-1; prediction service — BC-AI-2; classification service — BC-AI-3; similarity service — BC-AI-4). Each surface: pulls upstream inputs through the **owning module's published Query/Service within the requesting org's permissions** (never direct table reads — Doc-4A §4.3); writes only its own `ai.*` table; emits no Doc-2 §8 event (§K10). Cross-cutting kernel services consumed **by pointer**: Doc-4B (audit-write, POLICY, feature-flag, config-store, UUIDv7) and Doc-4C (`check_permission`, org/permission resolution).
- **Dependencies:** Doc-2 §3.10 (capabilities implied by entities); Doc-4B / Doc-4C (consumed services, FROZEN); Doc-4A §4.2/§4.3 (cross-module effects only via owning module's service); Master Architecture §18 ("new service contracts … no new ownership").
- **Excluded scope:** No command/query/contract instantiated (Pass-A work); no service that performs or influences a matching/routing/ranking/award/eligibility **decision**; no service that computes/writes a Trust/Performance/Verification/Governance score; no service that writes another module's store directly; no model/inference-engine internals (development-document scope). **No service identifier coined here — surface labels are structure-level capability descriptions, not frozen service contract names or `ai_` slugs (§K11/§K14).**

---

## §K7 — External Dependency Map

- **Purpose:** State every cross-module dependency explicitly, with **direction** and **consumption pattern** (Doc-4A §4 single-authorship, §4.4 integration, §4.5 cross-module references) — the structure-level seam list content passes bind to. The AI Layer is a **pure downstream consumer**: it **reads** upstream module outputs (within the requesting org's permissions) to derive artifacts and **writes only `ai.*`**. Carried dependency markers **DF-AI-\* identified structurally — carried, not resolved here** (analogous to Doc-4F `DF-*` / Doc-4I `DF-BILL-*` / Doc-4J `DR-ADM-*`).
  - **DF-AI-1 — Identity boundary.** `organizations`/`memberships`/`users`/`check_permission` are Identity's (Doc-4C, FROZEN). AI consumes org/permission resolution + `check_permission` by pointer to scope every read and every artifact to the **requesting organization's** access (Doc-2 §10.10); authors/owns none. **Channel:** consume Doc-4C. **Protected facts:** AI honors the requesting org's permission scope — it never widens visibility beyond what the org may already see.
  - **DF-AI-2 — Marketplace boundary.** Marketplace (Doc-4D, FROZEN) owns vendor profiles + the category catalog. AI **references** vendors/categories by UUID and **reads** the vendor/category Queries the requesting org is entitled to, to derive recommendations/classifications/similarity; owns no vendor/category data; the authoritative category remains Marketplace's. **Channel:** reference + read-via-Query. **Protected facts:** consumes only what the org's permissions expose; embeds no Marketplace representation (Doc-4A §4.3) — `ai.*` stores derived results, not copies.
  - **DF-AI-3 — RFQ boundary (the moat seam).** RFQ (Doc-4E, FROZEN) owns RFQs, matching, routing, quotations, award. AI **references** RFQs/quotations and **reads** entitled RFQ Queries to derive recommendation/prediction/classification artifacts; the **matching/routing/award decision stays RFQ's**. Where AI produces a *matching-assist confidence suggestion* (Master Architecture §18, pipeline step 5), it is a **non-authoritative artifact RFQ may optionally consume** — AI never writes RFQ state, never decides selection, and never replaces the deterministic gates (steps 1–4). **Channel:** reference + read-via-Query; optional downstream consumption of an AI artifact **by RFQ, on RFQ's terms**. **Moat:** no AI ownership/influence over the routing decision itself.
  - **DF-AI-4 — Operations boundary.** Operations (Doc-4F, FROZEN) owns private vendor records / engagements / CRM. AI **references** and **reads** only what the requesting org is entitled to (buyer-private facts stay buyer-private — Doc-4A §7.5); owns no private record. **Channel:** reference + read-via-Query. **Protected facts:** Buyer-Vendor-Status and other private facts are never widened or leaked into a cross-org artifact.
  - **DF-AI-5 — Trust boundary (the firewall seam).** Trust (Doc-4G, FROZEN) owns `verification_records` and all Trust/Performance/Verification/Governance scores. AI **may read** a published score *output* (as a derived input) where the org is entitled, but **computes/owns/modifies no score** and never re-publishes a score as if authoritative. **Channel:** read-only consumption of score outputs; **firewall — AI owns no score.**
  - **DF-AI-6 — Platform Core boundary.** All `core.*` services (audit-write, POLICY, feature flags, config store, UUIDv7) are Platform Core's (Doc-4B, FROZEN). AI consumes them by pointer; re-implements none. **Channel:** consume Doc-4B services.
- **Dependencies:** Doc-4A §4/§4.3/§4.4/§4.5/§7.5; Doc-2 §8 (event ownership), §10.10 (permission-honoring reads); Doc-4B/4C/4D/4E/4F/4G (consumed/adjacent, FROZEN); Master Architecture §18 (matching-assist is augmentation, not replacement).
- **Excluded scope:** No ownership transfer in any direction; no dependency resolved here (carried as `DF-AI-*`); no direct cross-module table read/write (only via the owning module's Query/Service); no AI write to any non-`ai.*` store; no contract.

---

## §K8 — Ownership Matrix

- **Purpose:** Pin, in one ledger, what Module 9 **owns** vs. what it merely **references/reads** — the explicit "One Entity = One Owner" guard for content passes (Doc-4A §4.1).
- **Expected content scope:** **Owns (writes, `ai` schema only):** `ai.recommendations` (BC-AI-1), `ai.predictions` (BC-AI-2), `ai.classification_results` (BC-AI-3), `ai.similar_vendor_results` (BC-AI-4) — all derived, regenerable, disposable, **non-authoritative**. **References/reads only (owns nothing):** organizations/users/permissions (Identity), vendor profiles/categories (Marketplace), RFQs/matching/quotations/award (RFQ), private records/engagements (Operations), verification records + scores (Trust), `core.*` infrastructure (Platform Core). **Owns no:** authoritative business record, matching/routing/award decision, Trust/Performance/Verification/Governance score, another module's entity, any §8 event (§K10).
- **Dependencies:** Doc-2 §2/§10.10 (ownership + derived-artifact status); Doc-4A §4.1/§4.3; ADR (moat + firewall).
- **Excluded scope:** No shared/duplicate/hidden ownership; no authoritative record claimed; no score or decision owned; structure only — no field-level ownership annotation (Pass-B).

---

## §K9 — Event Production Map

- **Purpose:** Declare what Doc-2 §8 events Module 9 **produces** — established up front so content passes coin nothing (Doc-4A §16.3, §4.4 single-authorship).
- **Expected content scope:** **The AI Layer produces NO Doc-2 §8 domain event.** Inventory-gate scan (§K Inventory-gate result) confirmed: no AI/Module-9 event exists in the §8 catalog and `ai.` is never an event Source-Ref. AI artifacts are derived/regenerable and carry no business-fact emission. Where a future activation might warrant an AI-produced signal, it is carried as **`[ESC-AI-EVENT]`** to the Doc-2 §8 additive channel — **no event coined here**.
- **Dependencies:** Doc-2 §8 (event catalog — AI absent); Doc-4A §16.3 (Events Produced), §4.4 (single-authorship).
- **Excluded scope:** No event invented; no §8 event re-owned from another module; no event payload (Doc-2 §8 owns payloads; Pass-B never redefines them); no 21.2 integration contract authored (none to author — nothing produced).

---

## §K10 — Event Consumption Map

- **Purpose:** Declare what Doc-2 §8 events Module 9 **consumes** (as triggers to regenerate/invalidate cache) — so content passes bind only to events that exist, and consumer effects stay AI-local (Doc-4A §4.4, §16).
- **Expected content scope:** **Structurally, the AI Layer consumes NO Doc-2 §8 event as an authoritative trigger** (inventory-gate: advisory/derived; none enumerated). AI regeneration is **pull/derive-on-demand within the requesting org's permissions** (Doc-2 §10.10) rather than event-driven write-back. If a later activation chooses to *refresh* a derived cache in response to an existing upstream event (e.g., a vendor/category/RFQ change), that consumption (a) targets **only the AI module's own `ai.*` artifacts** (Doc-4A §4.3 — no cross-module mutation), (b) re-uses the **existing** upstream event by pointer, and (c) is carried as **`[ESC-AI-EVENT]`** until enumerated — **no event coined, none re-owned**.
- **Dependencies:** Doc-2 §8 (existing events, by pointer), §10.10 (permission-honoring derive); Doc-4A §4.4/§16 (consumer-effect = own entities only).
- **Excluded scope:** No event invented; no consumer effect on a non-`ai.*` store; no cross-module write in response to any event; no payload definition.

---

## §K11 — Authorization Surface

- **Purpose:** Map, at structure level, how AI capabilities are authorized — so content passes bind to the **frozen** permission vocabulary and invent no slug (Doc-4A §6.1–§6.4).
- **Expected content scope:** Every AI read is gated by the **requesting organization's existing permissions** via Identity `check_permission` (Doc-4C, DF-AI-1) — AI grants no new visibility (Doc-2 §10.10 "reads honor requesting org's permissions"). The §7 slug map has **no `ai_` slug** (inventory-gate). Therefore: AI **serve/read** capabilities reuse the *consumed* module's entitlement (the org must already be permitted to see the underlying data); any AI-specific action that would need its own slug (e.g., an explicit "regenerate" command exposed to a user/admin) is carried as **`[ESC-AI-SLUG]`** to the Doc-2 §7 additive channel — **no slug coined**. System/automated regeneration runs under System-actor authority (no slug), consistent with Doc-4A §5/§15.5. *(Doc-2 §9 audit enumerates `actor_type` including `AI Agent` — a frozen anchor the AI-agent governance section and Pass-A audit bindings bind to.)*
- **Dependencies:** Doc-4A §6.1 (universal authorization), §6.2 (slugs-only), §6.4 (missing-permission escalation), §5 (actors); Doc-2 §7 (slug map — AI absent), §9 (`actor_type` incl. `AI Agent`); Doc-4C (`check_permission`).
- **Excluded scope:** No slug invented; no authorization that widens the requesting org's visibility; no admin/override surface defined here (Pass-A); no contract-level authorization matrix (Pass-B).

---

## §K12 — Audit & Traceability Surface

- **Purpose:** Fix, at structure level, what the AI Layer must make auditable/traceable — so content passes bind audit to the frozen `core` audit facility and invent no audit action (Doc-4A §2.4, §17; Doc-2 §9).
- **Expected content scope:** AI **mutations of its own `ai.*` artifacts** (generate/regenerate/invalidate) are recorded through the shared **`core.audit_records`** facility (Doc-4B, by pointer), attributed with `actor_type` ∈ {`System`, `AI Agent`, `User`/`Admin` where a person triggers a regenerate} — **`AI Agent` is a frozen `actor_type` value in Doc-2 §9**. Reads are not audited (Doc-4A §17.1). Traceability fields exist on the artifact itself (Doc-2 §10.10 `model_version, generated_at, expires_at` — by pointer) so any derived output is attributable to a model version and generation time. The §9 catalog enumerates **no AI-specific audit action** (inventory-gate); an AI-specific action requiring enumeration is carried as **`[ESC-AI-AUDIT]`** to the Doc-2 §9 additive channel — **no action coined**.
- **Dependencies:** Doc-4A §2.4 (auditable by construction), §17 (audit), §5.4 (attribution); Doc-2 §9 (`core.audit_records`, `actor_type` incl. `AI Agent`); Doc-2 §10.10 (artifact provenance fields); Doc-4B (audit-write service).
- **Excluded scope:** No new audit action/domain invented; no audit of reads; no audit-record schema redefinition (Doc-2 §9 owns it); no field-level audit binding (Pass-B).

---

## §K13 — Lifecycle Registry (high-level)

- **Purpose:** Record, at structure level only, the **lifecycle posture** of each aggregate — so content passes know there is **no business state machine** to author for the AI Layer (distinct from, e.g., RFQ/Billing lifecycles). **High-level posture only — no state-machine definition** (that exclusion is explicit in the brief).
- **Expected content scope:** All four aggregates share one posture (Doc-2 §2/§3.10/§10.10): **derived → regenerable → disposable**, with **hard delete permitted (cache semantics)** and free truncate/rebuild "without business impact." Artifacts carry an **`expires_at`** (Doc-2 §10.10, by pointer) — expiry/invalidation is **cache management, not a business lifecycle transition**. There is **no `pending/active/closed`-style business state machine** and **no cross-module lifecycle coupling** (no AI artifact gates another module's state). Concretely: each aggregate's "lifecycle" = {generated, (optionally) refreshed, expired/invalidated, regenerated} as cache operations.
- **Dependencies:** Doc-2 §2 ("derived, regenerable, cacheable, disposable; hard delete permitted"), §3.10 (regenerable/disposable), §10.10 (`expires_at`, "never source of truth"); Doc-4A §13.1 (authoritative state-machine source — none for AI).
- **Excluded scope:** **No state-machine definition** (states/transitions/guards — later parts/other docs, and per brief exclusions); no lifecycle event; no retention-window value (Pass-B / `[ESC-AI-POLICY]`); no business status enum (none exists).

---

## §K14 — Escalation Inventory

- **Purpose:** Collect every escalation marker this structure carries, so Hard Review and Pass-A see the complete set of corpus-silence points the AI Layer must escalate (never resolve locally — Doc-4A §0.6, §6.4).
- **Expected content scope (markers carried; none resolved here):**
  - **`[ESC-AI-EVENT]`** (Doc-2 §8 additive) — the AI Layer produces/consumes no enumerated §8 event; carried as the sentinel if a future activation needs an AI-produced or AI-consumed signal (§K9/§K10). No event coined.
  - **`[ESC-AI-SLUG]`** (Doc-2 §7 additive) — no `ai_` permission slug exists; carried for any AI-specific action (e.g., user/admin-triggered regenerate) that would need its own slug (§K11). No slug coined.
  - **`[ESC-AI-AUDIT]`** (Doc-2 §9 additive) — no AI-specific audit action exists; carried for any AI mutation needing a dedicated §9 action beyond the shared `core.audit_records` write (§K12). No action coined.
  - **`[ESC-AI-POLICY]`** (Doc-3 §12.2 additive) — no `ai.*` POLICY key exists; carried for runtime-tunable values (cache TTL / `expires_at` window, regeneration cadence, dedup window) surfaced in Pass-B. No key coined.
- **Dependencies:** Doc-4A §0.6 (flag-and-halt), §6.4 (missing-permission escalation), §12.6 (escalation behavior); Doc-2 §7/§8/§9 + Doc-3 §12.2 (the owning additive channels).
- **Excluded scope:** No marker resolved here (resolution is an additive patch to the owning frozen document); no marker invented beyond a genuine corpus-silence point; structure only.

---

## §K15 — Cross-Module Reference Inventory

- **Purpose:** List the cross-module **references** the AI Layer holds (bare UUIDv7, per Doc-4A §8.4 / §4.5) — so content passes apply write-time validation + integrity-audit reconciliation and embed no foreign representation.
- **Expected content scope:** `ai.*` artifacts reference, by **bare UUIDv7** only: organizations (subject/requesting org — DF-AI-1), vendors/categories (DF-AI-2), RFQs/quotations (DF-AI-3), private-record/engagement subjects where entitled (DF-AI-4), and (read-only) score-bearing entities (DF-AI-5). Each reference carries the **§4.5 obligation** (write-time validation via the owning module's service; reconciliation by the nightly integrity-audit job — Doc-2 §10.11). **No cross-schema FK** (Doc-2 §0.3 / §10.11); **no embedded foreign entity representation** (Doc-4A §4.3) — `result_jsonb` holds derived results, not copies of another module's entity.
- **Dependencies:** Doc-4A §8.4 (cross-module references), §4.5 (reference expectations), §4.3 (no foreign representation); Doc-2 §0.3 (no cross-schema FK), §10.10/§10.11 (refs + integrity audit).
- **Excluded scope:** No cross-schema foreign key; no cascade across modules; no embedded representation; no reference field specification (Pass-B); structure only.

---

## §K16 — AI-Agent Governance & Implementation-Safety Notes

- **Purpose:** State the structure-level safety constraints an AI **coding agent** (Claude Code / Cursor / Codex) must hold when generating Module-9 code — distinct from the AI *runtime* the module describes — binding to Doc-4A's frozen AI-agent rules (§2.5, §2.6, §20.5).
- **Expected content scope:** Generated Module-9 code **MUST** live inside the `ai` module and write only `ai.*` tables (Doc-4A §4.3 — cross-module table access/entity-mutation/contract-bypass fails CI/review). Agents **MUST** treat the moat + firewall as hard constraints (no generated path that decides matching/routing/award or computes a Trust/Performance/Verification/Governance score) and **MUST flag-and-halt** on any conflict rather than work around it (Doc-4A §2.5; Master Architecture §22.7). Determinism/explainability (Doc-4A §2.3): AI *artifacts* are advisory and must be presented as non-authoritative; the deterministic gates remain rule-based. Smallest-change doctrine (Doc-4A §2.6) governs any later amendment. Provenance: generated artifacts must populate `model_version`/`generated_at`/`expires_at` (Doc-2 §10.10, by pointer) so outputs are attributable and regenerable. *(This section governs how the module is built; it does not restate Doc-4A — it binds it by pointer.)*
- **Dependencies:** Doc-4A §2.3, §2.5, §2.6, §4.3, §20.5; Master Architecture §16.4, §22.7; Doc-2 §9 (`actor_type` `AI Agent`), §10.10 (provenance fields).
- **Excluded scope:** No restatement of Doc-4A governance (bound by pointer — avoids the duplication the family map forbids); no CI/tooling specification (development-document scope); no model/inference implementation detail; no contract.

---

## §K17 — Structure Summary & Open Questions

- **Purpose:** Close the structure with a one-look ledger and the explicit open questions a Structure Hard Review should rule on before Pass-A.
- **Expected content scope (ledger):** **Module 9 — AI Layer** · schema `ai` · namespace `ai_` · **4 bounded contexts** (BC-AI-1…4) ↔ **4 derived aggregates** (Recommendation/Prediction/Classification Result/Similar Vendor Result) **one-to-one** · **owns:** only `ai.*` derived artifacts (non-authoritative) · **produces/consumes:** **no Doc-2 §8 event** · **slugs/audit/POLICY:** none AI-specific (4 `[ESC-AI-*]` markers carried) · **moat + firewall:** fully asserted (advisory-only; no decision; no score) · **lifecycle:** cache posture only (no business state machine). Inventory-gate: **PASS**, no conflict.
- **Open questions for Structure Hard Review (recorded, not resolved):**
  1. **BC granularity** — should the four aggregates remain four separate BCs (BC-AI-1…4, mirroring Doc-2 §2 one-to-one), or collapse into a single "AI Derived-Artifacts" context with four aggregates? (Mirrors the Doc-4J Suggestion-family precedent where three roots sat in one BC.) Structure currently holds four; Review to confirm or collapse.
  2. **Matching-assist artifact home** — the Master-Architecture §18 "matching-assist confidence suggestion" is a *Recommendation*-flavored artifact consumed (optionally) by RFQ. Confirm it lands in **BC-AI-1 Recommendation** (current placement) and that DF-AI-3 correctly keeps the routing **decision** in RFQ (moat).
  3. **Event-refresh posture** — confirm "pull/derive-on-demand" (no §8 consumption) vs. an optional future `[ESC-AI-EVENT]` cache-refresh trigger; ensure either way stays AI-local (Doc-4A §4.3).
- **Dependencies:** all sections above; Doc-4A §1.3 (family-map binding); the inventory-gate result.
- **Excluded scope:** No resolution of the open questions (Hard Review's job); no contract; no Pass-A inventory (next stage).

---

*End of Doc-4K — AI Layer — Structure (FROZEN baseline). Structure-design only (bounded contexts, aggregates, ownership, dependency markers, event/authorization/lifecycle surface, AI-agent governance) — no field registries, value-object specs, read models, idempotency, concurrency, retention, indexes, API contracts, error matrices, or state-machine definitions (Pass-A / Pass-B / other documents). Authored against Doc-2 v1.0.3 §2/§3.10/§10.10, Master Architecture §16/§18, and Doc-4A §1.3 — all FROZEN; inventory gate PASS (4 derived aggregates; AI owns no authoritative record; no Doc-2 §8 event produced or consumed; no AI-specific slug/audit/POLICY — `[ESC-AI-EVENT/SLUG/AUDIT/POLICY]` carried). Advisory-only: the procurement moat (no matching/routing/ranking/supplier-selection/award/eligibility decision) and the governance-signal firewall (no Trust/Performance/Verification/Governance score owned or computed) are preserved; AI outputs are derived, regenerable, disposable, non-authoritative suggestions. Nothing invented. Suitable for: Independent Hard Review → Structure Patch → Patch Verification → Structure FROZEN → Pass-A → Pass-B → Consolidation → Final Freeze.*



---

## Freeze Certificate — Doc-4K_Structure_FROZEN_v1.0

```text
Structure Status : FROZEN
Document         : Doc-4K_Structure_FROZEN_v1.0
Authority        : Architecture Board
Module           : 9 — AI Layer
Schema           : ai
Namespace        : ai_
Bounded contexts : BC-AI-1 Recommendation · BC-AI-2 Prediction · BC-AI-3 Classification Result · BC-AI-4 Similar Vendor Result (4)
Aggregates       : recommendations · predictions · classification_results · similar_vendor_results (4, all derived AR; non-authoritative)
Frozen decisions : Q1 four BCs · Q2 matching-assist → BC-AI-1 (RFQ owns decision) · Q3 pull/derive-on-demand ([ESC-AI-EVENT] future-only)
Events           : produces none · consumes none (Doc-2 §8)
Escalation carry : [ESC-AI-EVENT] · [ESC-AI-SLUG] · [ESC-AI-AUDIT] · [ESC-AI-POLICY]
Moat / firewall  : preserved (no procurement decision; no Trust/Performance/Verification/Governance score)
Freeze authority : Doc-4K_Structure_Freeze_Audit_v1.0 (FREEZE APPROVED)
Open findings    : BLOCKER = 0 · MAJOR = 0 · MINOR = 0 · NITPICK = 0
Baseline for     : Doc-4K_PassA_Content_v1.0
Status           : FROZEN — 2026-06-19
```

*Doc-4K_Structure_FROZEN_v1.0 — authoritative frozen structure baseline for Module 9 (AI Layer). Source body Doc-4K_Structure_Authoring_v1.0 with the two Board-dispositioned NITPICK editorial folds applied inline; frozen decisions Q1/Q2/Q3 recorded; approved by Doc-4K_Structure_Freeze_Audit_v1.0 (FREEZE APPROVED). FROZEN.*
