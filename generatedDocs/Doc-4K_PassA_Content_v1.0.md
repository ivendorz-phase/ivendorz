# Doc-4K — AI Layer — API & Integration Contracts — Content Pass-A v1.0

| Field | Value |
|---|---|
| Document | Doc-4K — **Content Pass-A v1.0** — contract inventory + governance records for Module 9 — AI Layer (`ai` schema, `ai_` namespace), bounded contexts **BC-AI-1 / BC-AI-2 / BC-AI-3 / BC-AI-4** |
| Lifecycle stage | **Pass-A** — contract inventory + per-contract governance records. **No 12-section hardening** (field registries, value-object specs, read models, idempotency, concurrency, retention, indexes, request/response/error matrices belong to Pass-B). |
| Structure authority | `Doc-4K_Structure_FROZEN_v1.0` (FROZEN; sole structure authority — not revisited, not redesigned, not reopened) |
| Authority | Doc-4A v1.0 (FROZEN) governs this document; Doc-4_Governance_Note_v1.0. On any conflict: **FLAG-AND-HALT**. |
| Conforms To | Master Architecture v1.0 FINAL (§16, §18 incl. Invariant 12), ADR Compendium v1, Doc-2 v1.0.3 (§2/§3.10/§9/§10.10), Doc-3 v1.0.2, Doc-4A–4J v1.0, Doc-4K_Structure_FROZEN_v1.0 — all FROZEN |
| Frozen Board decisions applied | **Q1** four BCs (BC-AI-1 Recommendation · BC-AI-2 Prediction · BC-AI-3 Classification Result · BC-AI-4 Similar Vendor Result). **Q2** Matching-Assist Confidence Artifact → BC-AI-1 (RFQ owns the decision; AI advisory-only). **Q3** Pull / Derive On Demand — **no event-consumption contract is authored**; future event-assisted refresh remains `[ESC-AI-EVENT]` only. |
| Audience | Claude Code / Cursor / OpenAI Codex / backend / frontend / QA / Solution Architects — contract inventory, implementation-ready at Pass-A depth |

**Pass-A mission.** Convert the frozen Doc-4K structure into a **contract inventory with per-contract governance records** for Module 9 (AI Layer). The AI Layer is **advisory-only**: it owns only the four derived artifacts (Recommendation, Prediction, Classification Result, Similar Vendor Result), owns **no authoritative record**, makes **no procurement decision** (the moat), and computes/owns **no** Trust/Performance/Verification/Governance score (the firewall). Per **Master Architecture §18 Invariant 12**, AI-Agent contracts are read-only or advisory with respect to authoritative business data; the AI Layer writes only its **own** `ai.*` derived tables. **No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template is created.** Where the corpus is silent, an `[ESC-AI-*]` marker is carried to the owning additive channel and **nothing is coined**. On any required detail absent from the corpus: **FLAG-AND-HALT**.

---

## §B — Pass-A Cross-Cutting Conventions (stated once; bound by pointer per contract)

- **B.1 — Module identity.** Module 9 — AI Layer; schema `ai`; namespace `ai_` (Doc-2 §2; Master Architecture §16/§18; `Doc-4K_Structure_FROZEN_v1.0`). Four bounded contexts, one frozen derived aggregate each (Q1): **BC-AI-1 Recommendation** (`ai.recommendations`), **BC-AI-2 Prediction** (`ai.predictions`), **BC-AI-3 Classification Result** (`ai.classification_results`), **BC-AI-4 Similar Vendor Result** (`ai.similar_vendor_results`).

- **B.2 — Actor types (Doc-4A §5; Doc-2 §9 actor set `User | Admin | System | AI Agent`).** Module-9 contracts use: **System** (scheduled/triggered generation and cache maintenance jobs), **AI Agent** (the advisory/derived-generation actor; `actor_type = ai_agent` per Doc-4A §15/Pass-4 L470), and **User** (a tenant member who *reads* an AI artifact or *requests* an on-demand derivation within that org's existing permissions). **Master Architecture §18 Invariant 12 binds throughout:** AI-Agent contracts are read-only/advisory with respect to **authoritative** business data; the AI Layer's only writes are to its **own** `ai.*` derived tables (regenerable, non-authoritative — Doc-2 §10.10). Any authoritative write that *results from* an AI advisory is executed by a **User or System actor contract in the owning module** and attributed to that actor — never to the AI Agent, and never authored here.

- **B.3 — Operation templates (Doc-4A §21, frozen specializations of 21.1).** Module-9 contracts use **21.4 Command** (an `ai.*` generate/regenerate mutation), **21.3 Query** (an `ai.*` read), and **21.5 System** (a scheduled generation/expiry/invalidation job; `Response: none`). **No 21.2 Integration contract is authored** — the AI Layer produces and consumes no Doc-2 §8 event (Q3; §K9/§K10). No 21.6 Admin contract (no platform-staff AI governance surface at Pass-A).

- **B.4 — Authorization (Doc-4A §6/§6B; Doc-2 §7; Doc-4C consumed).** Every AI read or on-demand generation is gated by the **requesting organization's existing permissions** via Identity `check_permission` (Doc-4C, consumed by pointer) — the AI Layer grants **no new visibility** (Doc-2 §10.10: "reads honor requesting org's permissions"). **Doc-2 §7 enumerates no `ai_` permission slug** → any AI-specific user-triggered action that would require its own slug carries **`[ESC-AI-SLUG]`** (Doc-2 §7 additive; no slug invented). System/AI-Agent-triggered generation runs under System/AI-Agent authority (no slug). All org-scoped artifacts anchor on the **requesting (subject) Organization** (Identity-resolved; DF-AI-1).

- **B.5 — Audit (Doc-2 §9 via Doc-4B `core.append_audit_record.v1`).** **Doc-2 §9 enumerates no AI-specific audit action** (the audit domain is the shared `core.audit_records`; `actor_type` includes `AI Agent`). Each audited AI mutation (an `ai.*` generate/regenerate/invalidate) therefore carries **`[ESC-AI-AUDIT]`** (Doc-2 §9 additive — nearest action by pointer; no action invented), attributed with `actor_type ∈ {System, AI Agent, User}`, written in-transaction via the Doc-4B mechanism. **Reads are not audited** (Doc-4A §17.1). Per §18 Invariant 12, an AI Agent audit record covers the advisory/derivation action itself; any downstream authoritative write is audited by the owning module under its authoritative actor.

- **B.6 — Events (Doc-2 §8).** **The AI Layer produces no Doc-2 §8 domain event and consumes none as an authoritative trigger** (inventory-gate confirmed; Q3 frozen). Every contract's **Events** line reads **none** (production) and **none** (authoritative consumption). Regeneration is **pull/derive-on-demand** (Q3). The optional future event-assisted cache-refresh path is carried as **`[ESC-AI-EVENT]`** (Doc-2 §8 additive) and **no event-consumption contract is authored**. No event coined; no event ownership transferred; no 21.2 Integration contract authored.

- **B.7 — Procurement moat & trust firewall (ADR; Master Architecture §18; Doc-4A §4).** **AI suggests; RFQ decides.** The AI Layer owns/influences **none** of matching/routing/ranking/quotation-evaluation/supplier-selection/award/procurement-eligibility (moat). The Matching-Assist Confidence Artifact (BC-AI-1, Q2) is a **non-authoritative** recommendation RFQ may optionally consume; AI writes no RFQ state and decides no selection; the deterministic pipeline gates (steps 1–4) remain rule-based (Master Architecture §18). The AI Layer computes/owns **no** Trust/Performance/Verification/Governance score (firewall — Trust owns scores, Doc-4G); it may **read** a published score output as a derived input where the requesting org is entitled, and re-publishes none as authoritative.

- **B.8 — Ownership & boundary (Doc-2 §2/§10.10; Doc-4A §4.1/§4.3).** **BC-AI-1 owns Recommendation only; BC-AI-2 owns Prediction only; BC-AI-3 owns Classification Result only; BC-AI-4 owns Similar Vendor Result only.** All four are **derived, regenerable, cacheable, disposable** (hard delete permitted — cache semantics; Doc-2 §10.10); **none is a source of truth.** AI writes only `ai.*`; it reads upstream module data only through the **owning module's Query/Service** within the requesting org's permissions (no direct cross-module table access — Doc-4A §4.3); it embeds no foreign-module entity representation (`result_jsonb` holds derived results, not copies). No shared/duplicate/leaked ownership.

- **B.9 — Artifact field reference (Doc-2 §10.10, by pointer — not specified at Pass-A).** Each `ai.*` artifact carries `result_jsonb, model_version, generated_at, expires_at` plus the requesting/subject org and entity references. Field-level registries, value objects (BC-AI-1 Score, Basis — Doc-2 §2), read models, idempotency, retention, and indexes are **Pass-B** scope and are **not** authored here.

**Per-contract record shape (Pass-A).** Each contract below is recorded as: **Purpose · Owning BC · Aggregate · Operation (template) · Actor · Permission · Lifecycle impact · Audit · Events · Cross-Module · Sources.** Inventory + governance depth only — no Pass-B hardening.

---

## §K1 — Module Overview

Module 9 — **AI Layer** — is the platform's advisory AI capability (schema `ai`, namespace `ai_`; Master Architecture §16/§18). It produces **derived, regenerable, non-authoritative** decision-support artifacts and owns no authoritative business record. It is architecturally reserved and activated incrementally against accumulated data (Master Architecture §18: RFQ structuring + category classification first; quote-comparison, matching-assist, image-search later); each activation lands inside Module 9's existing boundary as new derived-artifact tables and service contracts with **no new ownership**. The module exposes four bounded contexts (Q1), one frozen derived aggregate each, and is a **pure downstream consumer** of upstream modules (it reads via their Query/Service within the requesting org's permissions and writes only `ai.*`). **Sources:** Master Architecture §16/§18; Doc-2 §2/§3.10/§10.10; Doc-4A §1.3; `Doc-4K_Structure_FROZEN_v1.0`.

---

## §K2 — Business Objectives

The AI Layer exists to produce non-authoritative decision-support artifacts that **augment, never replace**, the platform's deterministic logic. Objectives at Pass-A: (1) generate and serve **recommendations** (vendor/RFQ surfacing, incl. the Matching-Assist Confidence Artifact — Q2); (2) generate and serve **predictions** (derived forecasting artifacts); (3) generate and serve **classification results** (category/RFQ-structuring support; the authoritative category stays Marketplace's); (4) maintain **similar-vendor results** (similarity caches for discovery). Binding constraints (all frozen): owns **no** authoritative record (Master Architecture §18; Doc-2 §10.10); **advisory-only** — deterministic procurement gates (RFQ pipeline steps 1–4) remain rule-based, AI may only augment step-5 confidence as a non-binding suggestion (§18); **moat** — owns/influences no matching/routing/ranking/supplier-selection/award/eligibility decision; **firewall** — computes/owns no Trust/Performance/Verification/Governance score; artifacts are **regenerable, disposable** (hard delete permitted — cache semantics). **Sources:** Master Architecture §18; Doc-2 §10.10; ADR (moat + firewall).

---

## §K3 — Bounded Context Landscape

Four bounded contexts (Q1 frozen), one derived aggregate each (Doc-2 §2 Module-9), disjoint ownership (B.8):

- **BC-AI-1 — Recommendation** — owns **Recommendation** (`ai.recommendations`); vendor/RFQ recommendation artifacts, **including the Matching-Assist Confidence Artifact** (Q2).
- **BC-AI-2 — Prediction** — owns **Prediction** (`ai.predictions`); derived predictive artifacts.
- **BC-AI-3 — Classification Result** — owns **Classification Result** (`ai.classification_results`); category/classification outputs supporting RFQ structuring / category assignment.
- **BC-AI-4 — Similar Vendor Result** — owns **Similar Vendor Result** (`ai.similar_vendor_results`); similarity caches / similar-vendor results.

No fifth context; no BC owns an authoritative record; no aggregate shared across BCs. **Sources:** Doc-2 §2/§3.10/§10.10; `Doc-4K_Structure_FROZEN_v1.0` (Q1).

---

## §K4 — Context Responsibilities

- **BC-AI-1 Recommendation:** generate / regenerate / serve / expire non-authoritative vendor or RFQ recommendation artifacts (incl. the Matching-Assist Confidence Artifact — Q2) for a requesting org, derived from upstream data the org may already see; present as suggestions only; write only `ai.recommendations`.
- **BC-AI-2 Prediction:** generate / regenerate / serve / expire derived predictive artifacts (advisory); write only `ai.predictions`.
- **BC-AI-3 Classification Result:** produce category/classification outputs that **support** (never decide) RFQ structuring / category assignment; the authoritative category remains Marketplace's, the authoritative RFQ remains RFQ's; write only `ai.classification_results`.
- **BC-AI-4 Similar Vendor Result:** maintain similar-vendor / similarity-cache artifacts (derived, disposable); write only `ai.similar_vendor_results`.
- **Common to all four:** read upstream inputs **only within the requesting org's existing permissions** (Doc-2 §10.10) via the owning module's Query/Service; treat every output as regenerable cache; emit no Doc-2 §8 event; make no procurement decision; compute no score. **Sources:** Doc-2 §10.10; Master Architecture §18; Doc-4A §4.1/§4.3.

---

## §K5 — Aggregate Inventory

Four derived aggregates (Doc-2 §2 Module-9), one per BC; all `(AR)`, no child entities; all derived / regenerable / cacheable / disposable; hard delete permitted (cache semantics, Doc-2 §10.10); **none authoritative**.

- **Recommendation** — root `ai.recommendations` (AR); value objects **Score, Basis** (Doc-2 §2; specified in Pass-B) → **BC-AI-1**.
- **Prediction** — root `ai.predictions` (AR); no VO enumerated → **BC-AI-2**.
- **Classification Result** — root `ai.classification_results` (AR); no VO enumerated → **BC-AI-3**.
- **Similar Vendor Result** — root `ai.similar_vendor_results` (AR); no VO enumerated → **BC-AI-4**.

Reference field set (Doc-2 §10.10, by pointer — Pass-B): `result_jsonb, model_version, generated_at, expires_at` + requesting/subject org + entity refs. No aggregate belongs to more than one BC; none added beyond the Doc-2 §2 set; none from another module. **Sources:** Doc-2 §2/§3.10/§10.10.

---

## §K6 — Domain Service Inventory (Contract Inventory per BC)

Per-BC contract inventory at Pass-A depth. Each contract: **Purpose · Owning BC · Aggregate · Operation/Actor · Permission · Lifecycle · Audit · Events · Cross-Module · Sources.** Service-surface labels are capability descriptions, not frozen service identifiers or `ai_` slugs (§K11/§K14). No 21.2 Integration contract (B.6). All generation writes the BC's own `ai.*` table only (B.2/B.8).

### BC-AI-1 — Recommendation — Contract Inventory

#### `ai.generate_recommendation.v1` — Generate / Regenerate Recommendation · 21.4 Command / 21.5 System · Actor: AI Agent / System
- **Purpose:** derive a non-authoritative vendor/RFQ recommendation artifact (incl. the **Matching-Assist Confidence Artifact**, Q2 — a confidence suggestion augmenting RFQ pipeline step 5) for a requesting org, from upstream data the org may already see; write/refresh `ai.recommendations`. **Owning BC:** BC-AI-1. **Aggregate:** Recommendation (`ai.recommendations`). **Operation/Actor:** 21.4 Command (AI Agent advisory generation) / 21.5 System (scheduled/triggered derivation). **Permission:** requesting org's existing entitlement on the upstream inputs via `check_permission` (Doc-4C, DF-AI-1); no `ai_` slug exists → `[ESC-AI-SLUG]` for any user-triggered regenerate. **Lifecycle:** writes/refreshes a derived `ai.recommendations` row (cache; generated → refreshed → expired/invalidated → regenerated; no business state machine — §K13). **Audit:** `[ESC-AI-AUDIT]` (Doc-2 §9 additive; nearest by pointer; no action invented), `actor_type ∈ {AI Agent, System}`, in-transaction via Doc-4B. **Events:** produces none; consumes none (Q3 pull/derive-on-demand). **Cross-Module:** Identity (DF-AI-1), Marketplace (DF-AI-2 — vendor refs), RFQ (DF-AI-3 — RFQ/quotation refs; **routing/award decision stays RFQ; matching-assist artifact is advisory only**), Operations (DF-AI-4 — entitled reads), Trust (DF-AI-5 — read-only score output), Platform Core (DF-AI-6 — audit/UUIDv7). **Sources:** Doc-2 §2/§10.10; Master Architecture §18 (matching-assist; Invariant 12); ADR (moat).
#### `ai.get_recommendation.v1` · `ai.list_recommendations.v1` — Recommendation Reads · 21.3 Query · Actor: User / System
- **Purpose:** read a recommendation artifact / list a requesting org's recommendations (incl. matching-assist suggestions for consumption by the entitled RFQ surface). **Owning BC:** BC-AI-1. **Aggregate:** Recommendation. **Operation/Actor:** 21.3 Query (User in active org context; or System on behalf of an entitled consumer). **Permission:** requesting org's existing entitlement via `check_permission`; recipient-scoped to the subject org (DF-AI-1); no `ai_` slug → reuse the consumed-data entitlement (`[ESC-AI-SLUG]` for any AI-specific read slug). **Lifecycle:** none (read). **Audit:** none (reads not audited — Doc-4A §17.1). **Events:** none. **Cross-Module:** Identity (DF-AI-1); the consuming RFQ surface reads the artifact as a non-authoritative input (DF-AI-3). **Sources:** Doc-2 §10.10; Doc-4A §17.1.
#### `ai.expire_recommendations.v1` — Invalidate / Expire Recommendations · 21.5 System · Actor: System
- **Purpose:** invalidate or hard-delete expired/stale `ai.recommendations` rows (cache maintenance; `expires_at`). **Owning BC:** BC-AI-1. **Aggregate:** Recommendation. **Operation/Actor:** 21.5 System (cache-maintenance job; `Response: none`). **Permission:** none (System). **Lifecycle:** cache invalidation / hard delete (permitted — cache semantics, Doc-2 §10.10); no business transition. **Audit:** `[ESC-AI-AUDIT]` (`actor_type = System`), in-transaction via Doc-4B. **Events:** none. **Cross-Module:** Platform Core (DF-AI-6 — POLICY/`[ESC-AI-POLICY]` TTL window; audit). **Sources:** Doc-2 §10.10; Doc-4A §14/§17.

### BC-AI-2 — Prediction — Contract Inventory

#### `ai.generate_prediction.v1` — Generate / Regenerate Prediction · 21.4 Command / 21.5 System · Actor: AI Agent / System
- **Purpose:** derive a non-authoritative predictive artifact for a requesting org from entitled upstream data; write/refresh `ai.predictions`. **Owning BC:** BC-AI-2. **Aggregate:** Prediction (`ai.predictions`). **Operation/Actor:** 21.4 Command (AI Agent) / 21.5 System. **Permission:** requesting org entitlement via `check_permission` (DF-AI-1); `[ESC-AI-SLUG]` for any user-triggered regenerate. **Lifecycle:** writes/refreshes a derived `ai.predictions` row (cache; no business state machine). **Audit:** `[ESC-AI-AUDIT]` (`actor_type ∈ {AI Agent, System}`), in-transaction via Doc-4B. **Events:** produces none; consumes none (Q3). **Cross-Module:** Identity (DF-AI-1), Marketplace/RFQ/Operations (DF-AI-2/3/4 — entitled reads; **no procurement decision**), Trust (DF-AI-5 — read-only score output), Platform Core (DF-AI-6). **Sources:** Doc-2 §2/§10.10; Master Architecture §18 (Invariant 12); ADR (moat/firewall).
#### `ai.get_prediction.v1` · `ai.list_predictions.v1` — Prediction Reads · 21.3 Query · Actor: User / System
- **Purpose:** read a prediction artifact / list a requesting org's predictions. **Owning BC:** BC-AI-2. **Aggregate:** Prediction. **Operation/Actor:** 21.3 Query. **Permission:** requesting org entitlement via `check_permission`; recipient-scoped (DF-AI-1); `[ESC-AI-SLUG]`. **Lifecycle:** none (read). **Audit:** none (reads not audited — §17.1). **Events:** none. **Cross-Module:** Identity (DF-AI-1). **Sources:** Doc-2 §10.10; Doc-4A §17.1.
#### `ai.expire_predictions.v1` — Invalidate / Expire Predictions · 21.5 System · Actor: System
- **Purpose:** invalidate / hard-delete expired/stale `ai.predictions` rows (cache maintenance). **Owning BC:** BC-AI-2. **Aggregate:** Prediction. **Operation/Actor:** 21.5 System (`Response: none`). **Permission:** none (System). **Lifecycle:** cache invalidation / hard delete (cache semantics). **Audit:** `[ESC-AI-AUDIT]` (`actor_type = System`). **Events:** none. **Cross-Module:** Platform Core (DF-AI-6; `[ESC-AI-POLICY]`). **Sources:** Doc-2 §10.10; Doc-4A §14/§17.

### BC-AI-3 — Classification Result — Contract Inventory

#### `ai.generate_classification.v1` — Generate / Regenerate Classification · 21.4 Command / 21.5 System · Actor: AI Agent / System
- **Purpose:** derive a non-authoritative category/classification output (RFQ-structuring / category-assist support) for a requesting org; write/refresh `ai.classification_results`. **The authoritative category remains Marketplace's; the authoritative RFQ remains RFQ's** — this artifact is advisory support, not a category/RFQ decision. **Owning BC:** BC-AI-3. **Aggregate:** Classification Result (`ai.classification_results`). **Operation/Actor:** 21.4 Command (AI Agent) / 21.5 System. **Permission:** requesting org entitlement via `check_permission` (DF-AI-1); `[ESC-AI-SLUG]` for any user-triggered regenerate. **Lifecycle:** writes/refreshes a derived `ai.classification_results` row (cache; no business state machine). **Audit:** `[ESC-AI-AUDIT]` (`actor_type ∈ {AI Agent, System}`), in-transaction via Doc-4B. **Events:** produces none; consumes none (Q3). **Cross-Module:** Identity (DF-AI-1), Marketplace (DF-AI-2 — category catalog ref, read-only; **Marketplace owns categories**), RFQ (DF-AI-3 — RFQ refs; **RFQ owns structuring decision**), Platform Core (DF-AI-6). **Sources:** Doc-2 §2/§10.10; Master Architecture §18 (Invariant 12; classification activates first); ADR (moat).
#### `ai.get_classification.v1` · `ai.list_classifications.v1` — Classification Reads · 21.3 Query · Actor: User / System
- **Purpose:** read a classification result / list a requesting org's classification results. **Owning BC:** BC-AI-3. **Aggregate:** Classification Result. **Operation/Actor:** 21.3 Query. **Permission:** requesting org entitlement via `check_permission`; recipient-scoped (DF-AI-1); `[ESC-AI-SLUG]`. **Lifecycle:** none (read). **Audit:** none (reads not audited — §17.1). **Events:** none. **Cross-Module:** Identity (DF-AI-1); Marketplace/RFQ consume the output as non-authoritative support (DF-AI-2/3). **Sources:** Doc-2 §10.10; Doc-4A §17.1.
#### `ai.expire_classifications.v1` — Invalidate / Expire Classifications · 21.5 System · Actor: System
- **Purpose:** invalidate / hard-delete expired/stale `ai.classification_results` rows (cache maintenance). **Owning BC:** BC-AI-3. **Aggregate:** Classification Result. **Operation/Actor:** 21.5 System (`Response: none`). **Permission:** none (System). **Lifecycle:** cache invalidation / hard delete (cache semantics). **Audit:** `[ESC-AI-AUDIT]` (`actor_type = System`). **Events:** none. **Cross-Module:** Platform Core (DF-AI-6; `[ESC-AI-POLICY]`). **Sources:** Doc-2 §10.10; Doc-4A §14/§17.

### BC-AI-4 — Similar Vendor Result — Contract Inventory

#### `ai.generate_similar_vendors.v1` — Generate / Regenerate Similar-Vendor Result · 21.4 Command / 21.5 System · Actor: AI Agent / System
- **Purpose:** derive a non-authoritative similar-vendor / similarity-cache artifact for a requesting org from entitled vendor data; write/refresh `ai.similar_vendor_results`. **Owning BC:** BC-AI-4. **Aggregate:** Similar Vendor Result (`ai.similar_vendor_results`). **Operation/Actor:** 21.4 Command (AI Agent) / 21.5 System. **Permission:** requesting org entitlement via `check_permission` (DF-AI-1); `[ESC-AI-SLUG]` for any user-triggered regenerate. **Lifecycle:** writes/refreshes a derived `ai.similar_vendor_results` row (cache; no business state machine). **Audit:** `[ESC-AI-AUDIT]` (`actor_type ∈ {AI Agent, System}`), in-transaction via Doc-4B. **Events:** produces none; consumes none (Q3). **Cross-Module:** Identity (DF-AI-1), Marketplace (DF-AI-2 — vendor profile refs, read-only; **Marketplace owns vendor data**), Platform Core (DF-AI-6). **Sources:** Doc-2 §2/§10.10; Master Architecture §18 (Invariant 12); ADR (moat).
#### `ai.get_similar_vendors.v1` · `ai.list_similar_vendors.v1` — Similar-Vendor Reads · 21.3 Query · Actor: User / System
- **Purpose:** read a similar-vendor result / list a requesting org's similarity results. **Owning BC:** BC-AI-4. **Aggregate:** Similar Vendor Result. **Operation/Actor:** 21.3 Query. **Permission:** requesting org entitlement via `check_permission`; recipient-scoped (DF-AI-1); `[ESC-AI-SLUG]`. **Lifecycle:** none (read). **Audit:** none (reads not audited — §17.1). **Events:** none. **Cross-Module:** Identity (DF-AI-1). **Sources:** Doc-2 §10.10; Doc-4A §17.1.
#### `ai.expire_similar_vendors.v1` — Invalidate / Expire Similar-Vendor Results · 21.5 System · Actor: System
- **Purpose:** invalidate / hard-delete expired/stale `ai.similar_vendor_results` rows (cache maintenance). **Owning BC:** BC-AI-4. **Aggregate:** Similar Vendor Result. **Operation/Actor:** 21.5 System (`Response: none`). **Permission:** none (System). **Lifecycle:** cache invalidation / hard delete (cache semantics). **Audit:** `[ESC-AI-AUDIT]` (`actor_type = System`). **Events:** none. **Cross-Module:** Platform Core (DF-AI-6; `[ESC-AI-POLICY]`). **Sources:** Doc-2 §10.10; Doc-4A §14/§17.

---

## §K7 — External Dependency Map

Every dependency states **Direction · Purpose · Consumed Information · Ownership Boundary**. The AI Layer is a **pure downstream consumer**: it reads via the owning module's Query/Service within the requesting org's permissions and writes only `ai.*` (B.8; Doc-4A §4.3). Markers `DF-AI-*` carried, not resolved here.

- **DF-AI-1 — Identity (Doc-4C, FROZEN).** **Direction:** AI → Identity (downstream consumer). **Purpose:** resolve org/permission context and gate every read/generation to the requesting org's existing access. **Consumed Information:** `check_permission` result, org/membership resolution. **Ownership Boundary:** Identity owns organizations/memberships/users/`check_permission`; AI owns none; AI never widens visibility beyond the requesting org's scope.
- **DF-AI-2 — Marketplace (Doc-4D, FROZEN).** **Direction:** AI → Marketplace (downstream consumer). **Purpose:** derive recommendations / classifications / similarity from vendor & category data. **Consumed Information:** vendor-profile and category-catalog reads the requesting org is entitled to (via Marketplace Query); bare-UUID refs. **Ownership Boundary:** Marketplace owns vendor profiles + categories (authoritative); AI references by UUID and stores only derived results — no copy, no authoritative category/vendor decision.
- **DF-AI-3 — RFQ (Doc-4E, FROZEN) — the moat seam.** **Direction:** AI → RFQ (downstream consumer); optional artifact delivery consumed **by RFQ on RFQ's terms**. **Purpose:** derive recommendation/prediction/classification artifacts (incl. matching-assist confidence) from entitled RFQ/quotation data. **Consumed Information:** RFQ/quotation reads the requesting org is entitled to (via RFQ Query). **Ownership Boundary:** **RFQ owns matching/routing/ranking/supplier-selection/award/eligibility (the decision).** The matching-assist artifact is **advisory only**; AI writes no RFQ state, decides no selection, and never replaces the deterministic gates (steps 1–4). **AI suggests; RFQ decides.**
- **DF-AI-4 — Operations (Doc-4F, FROZEN).** **Direction:** AI → Operations (downstream consumer). **Purpose:** derive artifacts from entitled private-record/engagement data. **Consumed Information:** only what the requesting org is entitled to (via Operations Query); buyer-private facts stay buyer-private (Doc-4A §7.5). **Ownership Boundary:** Operations owns private vendor records / engagements; AI owns none; no protected fact widened or leaked into a cross-org artifact.
- **DF-AI-5 — Trust (Doc-4G, FROZEN) — the firewall seam.** **Direction:** AI → Trust (downstream consumer, read-only). **Purpose:** use a published score **output** as a derived input where the requesting org is entitled. **Consumed Information:** published Trust/Performance/Verification/Governance score **outputs** (read-only). **Ownership Boundary:** Trust owns verification records + all scores; **AI computes/owns/modifies no score** and re-publishes none as authoritative (firewall).
- **DF-AI-6 — Platform Core (Doc-4B, FROZEN).** **Direction:** AI → Platform Core (downstream consumer). **Purpose:** consume kernel services. **Consumed Information:** `core.append_audit_record` (audit-write), POLICY (`[ESC-AI-POLICY]` TTL/cadence), feature flags, UUIDv7. **Ownership Boundary:** Platform Core owns the kernel services; AI consumes by pointer and re-implements none.

No dependency resolved here (carried `DF-AI-*`); no ownership transfer; no direct cross-module table access; no AI write to any non-`ai.*` store. **Sources:** Doc-4A §4/§4.3/§4.5/§7.5; Doc-2 §8/§10.10; Doc-4B/4C/4D/4E/4F/4G; Master Architecture §18.

---

## §K8 — Ownership Matrix

**Owns (writes; `ai` schema only):** `ai.recommendations` (BC-AI-1), `ai.predictions` (BC-AI-2), `ai.classification_results` (BC-AI-3), `ai.similar_vendor_results` (BC-AI-4) — all derived, regenerable, disposable, **non-authoritative**. **References / reads only (owns nothing):** organizations/users/permissions (Identity), vendor profiles/categories (Marketplace), RFQs/matching/quotations/award (RFQ), private records/engagements (Operations), verification records + scores (Trust), `core.*` infrastructure (Platform Core). **Owns no:** authoritative business record; RFQ/matching/routing/award decision; vendor authority; Trust/Performance/Verification/Governance score; verification authority; governance authority; billing authority; any other module's entity; any Doc-2 §8 event (§K9). No shared/duplicate/hidden ownership. **Sources:** Doc-2 §2/§10.10; Doc-4A §4.1/§4.3; ADR (moat + firewall).

---

## §K9 — Event Production Map

**The AI Layer produces no Doc-2 §8 domain event.** Every Module-9 contract's production posture is **none** (§K6). The §8 catalog enumerates no AI/Module-9 event; `ai.` is never an event Source-Ref. No event coined; no 21.2 Integration production contract authored. A future AI-produced signal, should one ever be warranted, is carried as **`[ESC-AI-EVENT]`** (Doc-2 §8 additive) — none today. **Sources:** Doc-2 §8 (AI absent); Doc-4A §16.3/§4.4.

---

## §K10 — Event Consumption Map

**The AI Layer consumes no Doc-2 §8 event as an authoritative trigger.** Per the frozen Board decision **Q3 (Pull / Derive On Demand)**, **no event-consumption contract is authored.** Regeneration is pull/derive-on-demand within the requesting org's permissions (Doc-2 §10.10). The optional future event-assisted cache-refresh path is carried as **`[ESC-AI-EVENT]`** under three constraints (AI-local target `ai.*` only; existing upstream event by pointer; escalation, not assumption) — not adopted into Pass-A. No event coined; no event re-owned; no 21.2 Integration consumption contract authored. **Sources:** Doc-2 §8 (by pointer); Doc-4A §4.4/§16; `Doc-4K_Structure_FROZEN_v1.0` (Q3).

---

## §K11 — Authorization Surface

Every AI read and on-demand generation is gated by the **requesting organization's existing permissions** via Identity `check_permission` (Doc-4C, DF-AI-1) — the AI Layer grants no new visibility (Doc-2 §10.10). **Doc-2 §7 enumerates no `ai_` slug**; therefore AI serve/read capabilities **reuse the consumed module's entitlement** (the org must already be permitted to see the underlying data), and any AI-specific user-triggered action requiring its own slug carries **`[ESC-AI-SLUG]`** (Doc-2 §7 additive; no slug invented). System- and AI-Agent-triggered generation runs under System/AI-Agent authority (no slug), consistent with Doc-4A §5/§15.5 and §18 Invariant 12. Per-contract permission lines are recorded in §K6. **Sources:** Doc-4A §6.1/§6.2/§6.4/§5; Doc-2 §7 (AI absent), §9 (`actor_type` incl. `AI Agent`); Doc-4C.

---

## §K12 — Audit & Traceability Surface

AI mutations of the AI Layer's own `ai.*` artifacts (generate / regenerate / invalidate) are recorded through the shared **`core.audit_records`** facility (Doc-4B `core.append_audit_record.v1`, by pointer), attributed with `actor_type ∈ {System, AI Agent, User}` (`AI Agent` is a frozen `actor_type` value, Doc-2 §9). **Doc-2 §9 enumerates no AI-specific audit action** → each audited AI mutation carries **`[ESC-AI-AUDIT]`** (additive; nearest action by pointer; no action invented). **Reads are not audited** (Doc-4A §17.1). Per **Master Architecture §18 Invariant 12**, an AI Agent audit record covers the advisory/derivation action itself; any downstream authoritative write is audited by the owning module under its authoritative (User/System) actor — not attributed to the AI Agent and not authored here. Artifact provenance fields (`model_version, generated_at, expires_at`; Doc-2 §10.10) are cited by pointer for Pass-B. **Sources:** Doc-2 §9/§10.10; Doc-4A §17.1; Doc-4B; Master Architecture §18 Invariant 12.

---

## §K13 — Lifecycle Registry (high-level)

All four aggregates share one lifecycle posture (Doc-2 §2/§3.10/§10.10): **derived → regenerable → disposable**, with **hard delete permitted (cache semantics)** and free truncate/rebuild "without business impact." Each artifact carries `expires_at` (Doc-2 §10.10); expiry/invalidation is **cache management, not a business lifecycle transition**. There is **no business state machine** for any AI aggregate and **no cross-module lifecycle coupling** (no AI artifact gates another module's state). The per-aggregate cache lifecycle = {generated, (optionally) refreshed, expired/invalidated, regenerated}, realized by the `generate_*` (21.4/21.5) and `expire_*` (21.5) contracts in §K6. No state/transition is defined here (that exclusion is structural; state-machine detail is not a Pass-A or AI-Layer artifact). **Sources:** Doc-2 §2/§3.10/§10.10; Doc-4A §13.1 (no authoritative state machine for AI).

---

## §K14 — Escalation Inventory

Four escalation markers carried (none resolved here; Doc-4A §0.6/§6.4/§12.6):

- **`[ESC-AI-EVENT]`** (Doc-2 §8 additive) — the AI Layer produces/consumes no enumerated §8 event; carried as the sentinel for any future AI-produced or AI-consumed signal (§K9/§K10; Q3 keeps it future-only). No event coined.
- **`[ESC-AI-SLUG]`** (Doc-2 §7 additive) — no `ai_` permission slug exists; carried for any AI-specific user-triggered action that would need its own slug (§K11). No slug coined.
- **`[ESC-AI-AUDIT]`** (Doc-2 §9 additive) — no AI-specific audit action exists; carried for each AI `ai.*` mutation beyond the shared `core.audit_records` write (§K12). No action coined.
- **`[ESC-AI-POLICY]`** (Doc-3 §12.2 additive) — no `ai.*` POLICY key exists; carried for runtime-tunable values (cache TTL / `expires_at` window, regeneration cadence) surfaced in Pass-B. No key coined.

Each marker names its owning additive channel; resolution is an additive patch to the owning frozen document and does not reopen this Pass. **Sources:** Doc-4A §0.6/§6.4/§12.6; Doc-2 §7/§8/§9; Doc-3 §12.2.

---

## §K15 — Cross-Module Reference Inventory

`ai.*` artifacts reference, by **bare UUIDv7** only (Doc-4A §8.4; Doc-2 §0.3): organizations (requesting/subject org — DF-AI-1), vendors/categories (DF-AI-2), RFQs/quotations (DF-AI-3), private-record/engagement subjects where entitled (DF-AI-4), and (read-only) score-bearing entities (DF-AI-5). Each reference carries the **§4.5 obligation** (write-time validation via the owning module's service; reconciliation by the nightly integrity-audit job, Doc-2 §10.11). **No cross-schema FK** (Doc-2 §0.3); **no embedded foreign-module representation** (Doc-4A §4.3) — `result_jsonb` holds derived results, not copies. Concrete reference-field specification is Pass-B. **Sources:** Doc-4A §8.4/§4.5/§4.3; Doc-2 §0.3/§10.10/§10.11.

---

## §K16 — AI-Agent Governance

For an AI **coding agent** generating Module-9 code (distinct from the AI runtime the module describes): generated code MUST live inside the `ai` module and write only `ai.*` tables (Doc-4A §4.3 — cross-module table access/entity-mutation/contract-bypass fails CI/review). Agents MUST treat the moat + firewall as hard constraints (no generated path that decides matching/routing/award or computes a Trust/Performance/Verification/Governance score) and MUST flag-and-halt on any conflict (Doc-4A §2.5; Master Architecture §22.7). **Master Architecture §18 Invariant 12 binds:** AI-Agent contracts are read-only/advisory w.r.t. authoritative data; any resulting authoritative write is executed and attributed under a User/System actor contract in the owning module. AI artifacts are advisory and MUST be presented as non-authoritative; the deterministic gates remain rule-based. Provenance (`model_version, generated_at, expires_at`) MUST be populated so outputs are attributable and regenerable. Governance is bound by pointer to Doc-4A (not restated). **Sources:** Doc-4A §2.3/§2.5/§2.6/§4.3/§20.5; Master Architecture §16.4/§18 Invariant 12/§22.7; Doc-2 §9/§10.10.

---

## §K17 — Structure Summary

**Module 9 — AI Layer** · schema `ai` · namespace `ai_` · **4 bounded contexts** (BC-AI-1…4) ↔ **4 derived aggregates** (Recommendation / Prediction / Classification Result / Similar Vendor Result), one-to-one. **Contracts inventoried (Pass-A):** 12 — three per BC (a `generate_*` 21.4/21.5 Command, a `get_*`/`list_*` 21.3 Query pair, an `expire_*` 21.5 System), all writing only the BC's own `ai.*` table. **Owns:** only `ai.*` derived artifacts (non-authoritative). **Produces/consumes:** no Doc-2 §8 event (Q3; no 21.2 Integration contract). **Authorization:** requesting-org entitlement via `check_permission`; no `ai_` slug (`[ESC-AI-SLUG]`). **Audit:** shared `core.audit_records`; `[ESC-AI-AUDIT]`; `actor_type` incl. `AI Agent`; reads not audited. **Lifecycle:** cache posture only (no business state machine). **Escalation:** `[ESC-AI-EVENT/SLUG/AUDIT/POLICY]` carried. **Moat + firewall:** preserved (AI suggests; RFQ decides; no score). **Matching-Assist:** BC-AI-1 (Q2), advisory-only. Nothing invented. **Ready for Independent Hard Review → Pass-A Patch → Patch Verification → Pass-A FROZEN → Pass-B.** **Sources:** all §K above; Doc-2 §2/§3.10/§9/§10.10; Doc-4A §1.3/§4/§6/§16/§17; Master Architecture §16/§18; `Doc-4K_Structure_FROZEN_v1.0`.

---

*End of Doc-4K — AI Layer — Content Pass-A v1.0. Contract inventory + per-contract governance records for Module 9 (BC-AI-1 Recommendation · BC-AI-2 Prediction · BC-AI-3 Classification Result · BC-AI-4 Similar Vendor Result) — 12 contracts, three per BC (generate / read / expire), all writing only the owning BC's `ai.*` derived table. Authored against `Doc-4K_Structure_FROZEN_v1.0` (sole structure authority) and the frozen corpus (Master Architecture §16/§18 incl. Invariant 12; Doc-2 v1.0.3 §2/§3.10/§9/§10.10; Doc-4A §1.3/§4/§6/§16/§17; Doc-4B–4J). Frozen Board decisions applied without modification: Q1 four BCs; Q2 Matching-Assist → BC-AI-1 (advisory-only; RFQ owns the decision); Q3 Pull / Derive On Demand (no event-consumption contract authored). AI Layer owns only the four derived, regenerable, disposable, non-authoritative artifacts; owns no authoritative record, no RFQ/matching/routing/award decision (procurement moat), and no Trust/Performance/Verification/Governance score (trust firewall). Per §18 Invariant 12, AI-Agent contracts are advisory/read-only w.r.t. authoritative data; the AI Layer writes only `ai.*`; downstream authoritative writes are owned and attributed by the owning module under User/System actors. No entity, aggregate, state, transition, permission slug, event, audit action, POLICY key, or template created; `[ESC-AI-EVENT/SLUG/AUDIT/POLICY]` carried to their owning additive channels. Pass-A depth only (inventory + governance records); no 12-section hardening. Suitable for: Independent Hard Review → Pass-A Patch → Patch Verification → Pass-A FROZEN → Pass-B.*

