# Doc-4J — Admin Operations — API & Integration Contracts — Content Pass-A Part 2 v1.0

| Field | Value |
|---|---|
| Document | Doc-4J — **Content Pass-A Part 2 v1.0** — contract inventory + governance records for Module 8 — Admin Operations (`admin` schema, `admin_` namespace), bounded contexts **BC-ADM-4 / BC-ADM-5 / BC-ADM-6** |
| Status | **Pass-A Part 2 — contract structure (inventory + governance records), pre-hardening.** Not structure design, not a freeze audit, not Pass-B. Next stage: Independent Hard Review → Pass-A Patch → Patch Verification → Pass-A FROZEN → Pass-B. |
| Structure authority | `Doc-4J_Structure_FROZEN_v1.0` (FROZEN; sole structural authority; **not revisited, not redesigned, not reopened**) |
| Prior Part | `Doc-4J_PassA_Part1_Content_v1.0` (BC-ADM-1/2/3) — **not reopened.** |
| Authority | Doc-4_Governance_Note_v1.0.md; Doc-4A v1.0 (FROZEN) governs this document |
| Conforms To | Architecture v1.0 FINAL, ADR Compendium v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4I v1.0, Doc-4J_Structure_FROZEN_v1.0, Doc-4J_PassA_Part1_Content_v1.0 — all FROZEN |
| Part scope (this Part) | **BC-ADM-4 Data Import** (Import Job) · **BC-ADM-5 Verification Workflow** (Verification Task) · **BC-ADM-6 Vendor Outreach** (Outreach Campaign). **Not authored here:** BC-ADM-1 Moderation, BC-ADM-2 Enforcement, BC-ADM-3 Suggestions (Part 1, FROZEN-in-progress). |
| Contains | Pass-A depth: BC overviews, aggregate definitions, **contract inventory** (no 12-section per-contract hardening — Pass-B), authorization/audit/event/dependency matrices, error model, AI-agent notes. |
| Audience | Doc-4J Pass-B authors; Claude Code / Cursor / OpenAI Codex / backend / frontend / QA |

**Conventions carry from Part 1 (§B).** The Pass-A cross-cutting conventions B.1–B.8 (contract-ID `admin.<operation>.v1`; templates 21.6 Admin / 21.3 Query / 21.5 System; Admin/System actors; UUIDv7 + bare-UUID cross-module refs; platform-staff slug authorization, Doc-2 §7, no slug invented; Doc-2 §9 Admin audit domain by pointer; **`VendorBanned` the sole Admin §8 event**; Admin-governance neutrality + firewall) are stated once in `Doc-4J_PassA_Part1_Content_v1.0` §B and **bound here by pointer** — not restated. Per-contract records cite specifics.

**Recorded reconciliation — Part-2 lifecycles + dependency marker (no Flag-and-Halt breach; frozen authority governs; user-confirmed).** The Part-2 authoring brief stated lifecycles and a dependency marker that differ from the **frozen authority** (`Doc-4J_Structure_FROZEN_v1.0` §J13 / Doc-2 §3.9). The frozen states govern and are authored here:
- **BC-ADM-4 Import Job** — brief said "`queued → running → completed/failed`"; frozen = **`queued → processing → completed / failed`** (Doc-2 §3.9; `import_jobs.state(queued/processing/completed/failed)`, §10.9). `processing`, not `running`.
- **BC-ADM-5 Verification Task** — brief said "`pending → approved → rejected`"; frozen = **`queued → in_review → decided`** (Doc-2 §3.9; `verification_tasks.state(queued/in_review/decided)`, §10.9). The task is **workflow** — the approve/reject *decision content* lives in `trust.verification_decisions` (Trust-owned), not in the task state.
- **BC-ADM-6 Outreach Campaign** — brief said "`draft → active → completed/cancelled`"; frozen = **`draft → running → completed`** (Doc-2 §3.9). `running`, not `active`; no `cancelled` state exists in the frozen lifecycle.
- **Dependency marker** — brief cited "`DR-ADM-COMM`"; the frozen structure enumerates **no such marker** (frozen DR markers: DR-ADM-1 / DR-ADM-MKT / DR-ADM-RFQ / DR-ADM-OPS / DR-ADM-TRUST / DR-ADM-PC). `DR-ADM-COMM` is **not used** (no marker invented); BC-ADM-6 binds the frozen markers only.

No state invented, no lifecycle invented, no dependency marker invented. *(Confirmed with the user before authoring.)*

---

# BC-ADM-4 — Data Import (Import Job aggregate)

## J4A-1 — BC Overview

- **Purpose:** Run Excel import jobs (category and vendor-seed loads) and capture per-row outcomes. **Imports via the owning modules' services; creates no Marketplace entity directly.**
- **Responsibilities:** import-job lifecycle (submit/process), per-row outcome capture. Seeding (categories / vendor profiles) is performed **through the owning Marketplace services**.
- **Ownership:** `import_jobs` (+ child `import_rows`) — platform-owned. Admin owns the job + row records; the seeded entities are created via the Marketplace service and remain Marketplace-owned.
- **Dependencies:** **DR-ADM-MKT** (seeded categories/vendor profiles created via the Marketplace service), **DR-ADM-1** (Identity import authority + `check_permission`), **DR-ADM-PC** (Platform Core file-ref/audit/POLICY).

## J4A-2 — Aggregate Definition

- **Import Job** — root `import_jobs`; child `import_rows` (VO RowError); fields `job_type(categories/vendor_seed)`, `file_ref`, `state(queued/processing/completed/failed)`, `stats_jsonb`, `initiated_by`; `import_rows`: `created_entity_id`, per-row outcome + errors (Doc-2 §10.9). **State machine:** `queued → processing → completed / failed` (Doc-2 §3.9). Platform-owned.

## J4A-3 — Contract Inventory (BC-ADM-4)

#### `admin.submit_import_job.v1` — Submit Import Job · 21.6 Admin · Actor: Admin
- **Purpose:** submit an Excel import job (`job_type`, `file_ref`) at `queued`. **Owning BC:** BC-ADM-4. **Aggregate:** Import Job (`import_jobs`). **Permission family:** platform-staff import authority — **no enumerated Doc-2 §7 slug → `[ESC-ADM-SLUG]`** (no slug invented; `staff_super_admin` override). **Lifecycle:** creates `import_jobs` at `queued` (Doc-2 §3.9). **Audit:** §9 Admin ("import job execution") by pointer. **Events:** none emitted; none consumed. **Cross-Module:** Marketplace (seed target via service — DR-ADM-MKT); Identity (DR-ADM-1); Platform Core (file-ref/audit — DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.process_import_job.v1` — Process Import Job · 21.5 System · Actor: System
- **Purpose:** process a queued job (`queued → processing → completed / failed`), writing `import_rows` outcomes and creating seeded entities **via the Marketplace service**. **Owning BC:** BC-ADM-4. **Aggregate:** Import Job (`import_jobs` + `import_rows`). **Permission family:** none (System; processing job). **Lifecycle:** `queued → processing → completed / failed` (Doc-2 §3.9). **Audit:** §9 Admin ("import job execution") by pointer. **Events:** none. **Cross-Module:** Marketplace seeded-entity creation via service (DR-ADM-MKT; Marketplace owns the seeded category/vendor); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.get_import_job.v1` · `admin.list_import_jobs.v1` · `admin.list_import_rows.v1` — Import Reads · 21.3 Query · Actor: Admin
- **Purpose:** read a job head / list jobs / list a job's per-row outcomes. **Owning BC:** BC-ADM-4. **Aggregate:** Import Job. **Permission family:** `[ESC-ADM-SLUG]` (import-read; no enumerated §7 slug). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9.

---

# BC-ADM-5 — Verification Workflow (Verification Task aggregate)

## J5A-1 — BC Overview

- **Purpose:** Drive the verification queue — the workflow that routes verification subjects to Verification Admins. **Admin owns the workflow task; Trust owns/stores the verification decision and any score (firewall).**
- **Responsibilities:** verification-task lifecycle (queue/assign/decide). The **decision is recorded into `trust.verification_decisions` via the Trust service** — the task carries only the workflow state and a `verification_record_id` reference.
- **Ownership:** `verification_tasks` (workflow only) — platform-owned. Admin owns the task; **Trust owns `verification_records` / `verification_decisions` and any Trust/Performance/Verification/Governance score** (DR-ADM-TRUST; firewall). VO DecisionRef = `verification_record_id`.
- **Dependencies:** **DR-ADM-TRUST** (the verification record referenced + the decision recorded via the Trust service; **Trust stores; Admin computes/owns no score, no verification record**), **DR-ADM-1** (Identity `staff_can_verify` + `check_permission`), **DR-ADM-PC** (Platform Core audit).

## J5A-2 — Aggregate Definition

- **Verification Task** — root `verification_tasks` (workflow only); VO DecisionRef (`verification_record_id`); fields `state(queued/in_review/decided)`, `assigned_to` (Doc-2 §10.9). **State machine:** `queued → in_review → decided` (Doc-2 §3.9). Platform-owned. **The approve/reject decision content lives in `trust.verification_decisions` (Trust-owned) — the task state is workflow only.**

## J5A-3 — Contract Inventory (BC-ADM-5)

#### `admin.queue_verification_task.v1` — Queue Verification Task · 21.6 Admin / 21.5 System · Actor: Admin / System
- **Purpose:** create a verification-workflow task at `queued` referencing a `verification_record_id`. **Owning BC:** BC-ADM-5. **Aggregate:** Verification Task (`verification_tasks`). **Permission family:** `staff_can_verify` (Doc-2 §7) / System (auto-queue from a verification request). **Lifecycle:** creates `verification_tasks` at `queued` (Doc-2 §3.9). **Audit:** §9 Admin ("suggestion decisions" nearest domain) by pointer / **`[ESC-ADM-AUDIT]`** if verification-task workflow is not separately enumerated in §9 (nearest action by pointer; no action invented). **Events:** none. **Cross-Module:** Trust verification-record reference (DR-ADM-TRUST); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.assign_verification_task.v1` — Assign Verification Task · 21.6 Admin · Actor: Admin
- **Purpose:** assign a task to a Verification Admin and advance to `in_review` (`queued → in_review`). **Owning BC:** BC-ADM-5. **Aggregate:** Verification Task. **Permission family:** `staff_can_verify` (Doc-2 §7). **Lifecycle:** `queued → in_review` (Doc-2 §3.9). **Audit:** §9 Admin by pointer / `[ESC-ADM-AUDIT]` (as above; no action invented). **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.decide_verification_task.v1` — Decide Verification Task · 21.6 Admin · Actor: Admin
- **Purpose:** record the workflow decision (`in_review → decided`); the **verification decision content (approve/reject) is written into `trust.verification_decisions` via the Trust service** — Admin advances the workflow, Trust stores the decision. **Owning BC:** BC-ADM-5. **Aggregate:** Verification Task (`verification_tasks`). **Permission family:** `staff_can_verify` (Doc-2 §7). **Lifecycle:** `in_review → decided` (Doc-2 §3.9; no state added). **Audit:** §9 Admin by pointer / `[ESC-ADM-AUDIT]` (no action invented). **Events:** none emitted (the verification decision is Trust-stored; Trust owns any resulting event/score). **Cross-Module:** Trust decision recorded via service (DR-ADM-TRUST; **Trust stores; Admin owns no verification record, computes no score — firewall**); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9. **Firewall:** Admin decides the workflow; Trust stores the verification record/decision and any Trust/Performance/Verification/Governance score.
#### `admin.get_verification_task.v1` · `admin.list_verification_tasks.v1` — Verification Reads · 21.3 Query · Actor: Admin
- **Purpose:** read a task / list the verification queue. **Owning BC:** BC-ADM-5. **Aggregate:** Verification Task. **Permission family:** `staff_can_verify`. **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9. *(Verification Admins hold no finance slugs — Doc-2 §7 separation.)*

---

# BC-ADM-6 — Vendor Outreach (Outreach Campaign aggregate)

## J6A-1 — BC Overview

- **Purpose:** Run the vendor-acquisition outreach CRM (empty-category recovery). **CRM only; owns no vendor profile; informational outreach — no procurement decision.**
- **Responsibilities:** outreach-campaign lifecycle (draft/run/complete), contact pipeline. Targets are referenced by `vendor_claim_record_id` / `vendor_profile_id` (Marketplace).
- **Ownership:** `outreach_campaigns` (+ child `outreach_contacts`) — platform-owned. Admin owns the campaign/contact records; the target vendor profile/claim record is Marketplace-owned.
- **Dependencies:** **DR-ADM-MKT** (target `vendor_claim_record_id`/`vendor_profile_id` by reference), **DR-ADM-1** (Identity outreach authority + `check_permission`), **DR-ADM-PC** (Platform Core audit). *(No `DR-ADM-COMM` marker exists in the frozen structure — outreach delivery, if any, binds the frozen markers only; not authored here.)*

## J6A-2 — Aggregate Definition

- **Outreach Campaign** — root `outreach_campaigns`; child `outreach_contacts`; fields target `vendor_claim_record_id` / `vendor_profile_id`, invite outreach pipeline (Doc-2 §10.9). **State machine:** `draft → running → completed` (Doc-2 §3.9). Platform-owned.

## J6A-3 — Contract Inventory (BC-ADM-6)

#### `admin.create_outreach_campaign.v1` — Create Outreach Campaign · 21.6 Admin · Actor: Admin
- **Purpose:** create an outreach campaign at `draft`. **Owning BC:** BC-ADM-6. **Aggregate:** Outreach Campaign (`outreach_campaigns`). **Permission family:** platform-staff outreach authority — **no enumerated Doc-2 §7 slug → `[ESC-ADM-SLUG]`** (no slug invented; `staff_super_admin` override). **Lifecycle:** creates `outreach_campaigns` at `draft` (Doc-2 §3.9). **Audit:** **`[ESC-ADM-AUDIT]`** (outreach is not separately enumerated in the Doc-2 §9 Admin domain; nearest §9 action by pointer; no action invented). **Events:** none. **Cross-Module:** Marketplace target reference (DR-ADM-MKT); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9.
#### `admin.run_outreach_campaign.v1` · `admin.complete_outreach_campaign.v1` — Outreach Lifecycle · 21.6 Admin · Actor: Admin
- **Purpose:** run a campaign (`draft → running`) and complete it (`running → completed`). **Owning BC:** BC-ADM-6. **Aggregate:** Outreach Campaign. **Permission family:** `[ESC-ADM-SLUG]` (no enumerated §7 slug; no slug invented). **Lifecycle:** `draft → running → completed` (Doc-2 §3.9). **Audit:** `[ESC-ADM-AUDIT]` (outreach not §9-enumerated; nearest by pointer; no action invented). **Events:** none. **Cross-Module:** Marketplace target reference (DR-ADM-MKT); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §3.9/§10.9. **Moat:** outreach is **informational acquisition only — no matching/routing/ranking/supplier-selection/award/eligibility decision.**
#### `admin.add_outreach_contact.v1` · `admin.update_outreach_contact.v1` — Outreach Contact · 21.6 Admin · Actor: Admin
- **Purpose:** add / update a contact in the outreach pipeline (`outreach_contacts`). **Owning BC:** BC-ADM-6. **Aggregate:** Outreach Campaign (`outreach_contacts`). **Permission family:** `[ESC-ADM-SLUG]`. **Lifecycle:** contact pipeline (child of campaign; no separate frozen status machine). **Audit:** `[ESC-ADM-AUDIT]`. **Events:** none. **Cross-Module:** Marketplace target reference (DR-ADM-MKT); Identity (DR-ADM-1); Platform Core (DR-ADM-PC). **Sources:** Doc-2 §10.9.
#### `admin.get_outreach_campaign.v1` · `admin.list_outreach_campaigns.v1` — Outreach Reads · 21.3 Query · Actor: Admin
- **Purpose:** read a campaign / list campaigns + contacts. **Owning BC:** BC-ADM-6. **Aggregate:** Outreach Campaign. **Permission family:** `[ESC-ADM-SLUG]` (outreach-read; no enumerated §7 slug). **Lifecycle:** none (read). **Audit:** none (reads not audited, §17.1). **Events:** none. **Cross-Module:** Identity (DR-ADM-1). **Sources:** Doc-2 §10.9.

---

## J-A4 — Permission Surface (Pass-A consolidation, Part 2)

Three-layer check (platform-staff Membership + Permission Slug + Resource Scope) resolved via Identity `check_permission` (consumed; no shadow authorization). **Platform-staff slugs (Doc-2 §7; separate space; §5.6 no active org context; none invented):**

| Permission family | Actor | Contracts | Ownership boundary |
|---|---|---|---|
| `staff_can_verify` | Admin | all BC-ADM-5 contracts | verification **workflow** only; Trust stores the decision/record |
| `[ESC-ADM-SLUG]` | Admin | all BC-ADM-4 contracts (import); all BC-ADM-6 mutations + reads (outreach) | Doc-2 §7 enumerates no staff slug for import-job or outreach management (additive; no slug invented); `staff_super_admin` override |
| (System) | System | `process_import_job` (BC-ADM-4); `queue_verification_task` (auto-queue, BC-ADM-5) | job effects on Admin's own entities |

`staff_super_admin` is the audited-and-flagged override for any action (Doc-2 §7); **no slug invented; no role bundle authored** (Identity-seeded). Verification Admins hold no finance slugs (Doc-2 §7 separation).

## J-A5 — Audit Surface (Pass-A consolidation, Part 2)

All audited mutations bind via Doc-4B `core.append_audit_record.v1` (in-transaction); reads not audited (§17.1). **Doc-2 §9 enumerates the Admin audit domain** (incl. "import job execution"); verification-task workflow and outreach are not separately enumerated → those carry **`[ESC-ADM-AUDIT]`** (nearest §9 action by pointer; no action invented).

| Contract group | §9 binding | Audit ownership | Audit requirement |
|---|---|---|---|
| Import submit/process (BC-ADM-4) | §9 Admin "import job execution" by pointer | Admin | yes (every mutation) |
| Verification queue/assign/decide (BC-ADM-5) | `[ESC-ADM-AUDIT]` (verification-task workflow not separately §9-enumerated; nearest by pointer; no action invented) | Admin | yes |
| Outreach create/run/complete + contacts (BC-ADM-6) | `[ESC-ADM-AUDIT]` (outreach not §9-enumerated; nearest by pointer; no action invented) | Admin | yes |
| all reads | — | n/a | no (reads not audited, §17.1) |
| `staff_super_admin` actions | the relevant §9 action / marker + **flagged** (Doc-2 §7) | Admin | yes + flagged |

*(The verification **decision content** is audited by Trust where Trust stores it — Admin audits only its own workflow-task transition.)*

## J-A6 — Event Surface (Pass-A consolidation, Part 2)

**Produced (Doc-2 §8): NONE.** **BC-ADM-4, BC-ADM-5, and BC-ADM-6 produce no Doc-2 §8 domain event.** The sole Admin-owned §8 event is `VendorBanned` (BC-ADM-2, authored in Part 1) — **it is not produced by these three contexts.** Import/verification/outreach state changes are Admin-owned entity transitions, **not** §8 events. **No event invented; events absent from Doc-2 §8 are not added** (`[ESC-ADM-EVENT]` carries any future need — none today; no event coined).

**Consumed (Doc-2 §8): NONE** in these three contexts (no §8 event routes into import/verification/outreach at structure level; any future consumption binds the Doc-2 §8 mapping at content authoring). The verification queue may be fed by a Trust verification-request **service** signal (DR-ADM-TRUST), not a §8 event.

## J-A7 — Dependency Surface (Pass-A consolidation, Part 2)

Per the frozen structure §J8 — DR-ADM-* carried; ownership unchanged. **No `DR-ADM-COMM` marker exists in the frozen structure; not used.**

| Marker | Owner (module) | Direction | Purpose (Part 2) |
|---|---|---|---|
| **DR-ADM-1** | Identity (Doc-4C, FROZEN) | consume | `check_permission` + platform-staff slug resolution |
| **DR-ADM-MKT** | Marketplace (Doc-4D, FROZEN) | reference + write-via-service | import seeded-entity creation via the Marketplace service (BC-ADM-4); outreach target reference (BC-ADM-6) |
| **DR-ADM-TRUST** | Trust (Doc-4G, FROZEN) | reference + record-via-service | verification-record reference + decision recorded via the Trust service (BC-ADM-5); **Trust stores; Admin computes/owns no score, no verification record (firewall)** |
| **DR-ADM-PC** | Platform Core (Doc-4B, FROZEN) | consume | audit-write, file-ref, UUIDv7, POLICY |

**No ownership transfer in any direction; no store written except via the owning module's service; no dependency marker invented.**

## J-A8 — Error Model (Pass-A consolidation, Part 2)

Doc-4A §12 closed class set only. **`REFERENCE` (definitive negative, `retryable:false`) ≠ `DEPENDENCY` (transient, `retryable:true`)**; **`STATE` (illegal-from-state) ≠ `CONFLICT` (optimistic-concurrency lost race)** — never merged (Doc-4A §12.2/§12.4). A platform-staff-scoped record that does not resolve is `NOT_FOUND`; a non-resolving cross-module reference (e.g., a `verification_record_id` at Trust, a seed target at Marketplace) is `REFERENCE` (definitive) vs `DEPENDENCY` (the Trust/Marketplace service transiently unavailable). The hardened per-stage error registers are authored at Pass-B.

## J-A9 — AI-Agent Notes (Pass-A consolidation, Part 2)

- **Ownership boundaries:** Admin owns `import_jobs`(+`import_rows`) (BC-ADM-4), `verification_tasks` (BC-ADM-5), `outreach_campaigns`(+`outreach_contacts`) (BC-ADM-6); each aggregate in exactly one BC; the decision-target's store remains its owner's (Marketplace seeds; Trust verification record/decision).
- **Admin decides; the owning module stores:** import seeding creates entities via the Marketplace service (Marketplace owns them); **the verification decision is recorded via the Trust service — Trust stores the verification record/decision and any score; Admin owns the workflow task only** (firewall).
- **Deterministic lifecycles (Doc-2 §3.9):** import `queued → processing → completed / failed`; verification `queued → in_review → decided`; outreach `draft → running → completed`. No state invented; no `cancelled`/`pending`/`running`(import)/`active`(outreach) state exists.
- **Authorization:** `staff_can_verify` (BC-ADM-5); import + outreach carry `[ESC-ADM-SLUG]` (no §7 staff slug; no slug invented); `staff_super_admin` override is flagged.
- **Event governance:** these three BCs produce **no Doc-2 §8 event** (the sole Admin event `VendorBanned` is BC-ADM-2's, Part 1); no event coined.
- **Procurement moat:** Admin makes **no** matching/routing/ranking/supplier-selection/award/procurement-eligibility decision; **vendor outreach is informational acquisition only — never procurement routing.**
- **Trust firewall:** Admin computes/owns **no** Trust/Performance/Verification/Governance score and **no verification record** (BC-ADM-5 is workflow; Trust stores).
- **No event/slug/audit-action/POLICY-key invention; no `DR-ADM-COMM` marker** — escalate via DR / `[ESC-ADM-*]`. Audience: Claude Code, Cursor, OpenAI Codex, backend, frontend, QA.

---

## Appendix A — BC-ADM-4/5/6 Part-2 Contract Inventory (Pass-A)

| # | Contract-ID | Name | Owning BC | Aggregate | Operation (template) | Actor | Permission family |
|---|---|---|---|---|---|---|---|
| 1 | `admin.submit_import_job.v1` | Submit Import Job | BC-ADM-4 | Import Job (`import_jobs`) | 21.6 Admin | Admin | `[ESC-ADM-SLUG]` |
| 2 | `admin.process_import_job.v1` | Process Import Job | BC-ADM-4 | Import Job (`import_jobs`+`import_rows`) | 21.5 System | System | none (System) |
| 3 | `admin.get_import_job.v1` / `admin.list_import_jobs.v1` / `admin.list_import_rows.v1` | Import reads | BC-ADM-4 | Import Job | 21.3 Query | Admin | `[ESC-ADM-SLUG]` |
| 4 | `admin.queue_verification_task.v1` | Queue Verification Task | BC-ADM-5 | Verification Task | 21.6 Admin / 21.5 System | Admin / System | `staff_can_verify` / System |
| 5 | `admin.assign_verification_task.v1` | Assign Verification Task | BC-ADM-5 | Verification Task | 21.6 Admin | Admin | `staff_can_verify` |
| 6 | `admin.decide_verification_task.v1` | Decide Verification Task | BC-ADM-5 | Verification Task | 21.6 Admin | Admin | `staff_can_verify` |
| 7 | `admin.get_verification_task.v1` / `admin.list_verification_tasks.v1` | Verification reads | BC-ADM-5 | Verification Task | 21.3 Query | Admin | `staff_can_verify` |
| 8 | `admin.create_outreach_campaign.v1` | Create Outreach Campaign | BC-ADM-6 | Outreach Campaign (`outreach_campaigns`) | 21.6 Admin | Admin | `[ESC-ADM-SLUG]` |
| 9 | `admin.run_outreach_campaign.v1` / `admin.complete_outreach_campaign.v1` | Outreach lifecycle | BC-ADM-6 | Outreach Campaign | 21.6 Admin | Admin | `[ESC-ADM-SLUG]` |
| 10 | `admin.add_outreach_contact.v1` / `admin.update_outreach_contact.v1` | Outreach contact | BC-ADM-6 | Outreach Campaign (`outreach_contacts`) | 21.6 Admin | Admin | `[ESC-ADM-SLUG]` |
| 11 | `admin.get_outreach_campaign.v1` / `admin.list_outreach_campaigns.v1` | Outreach reads | BC-ADM-6 | Outreach Campaign | 21.3 Query | Admin | `[ESC-ADM-SLUG]` |

*Skeleton inventory — working contract names (Doc-4A §21 namespace `admin_`). Pass-B finalizes per-Contract-ID payloads, validation order, error codes, and any contract split. No contract instantiated beyond this Pass-A record. **No Doc-2 §8 event produced by BC-ADM-4/5/6** (the sole Admin event `VendorBanned` is BC-ADM-2's, Part 1). BC-ADM-1/2/3 are Part 1 (not reopened).*

## Appendix B — Carried Markers (Pass-A Part 2; UNCHANGED)

**DR-ADM-1** (Identity), **DR-ADM-MKT** (Marketplace — import seed-via-service + outreach target reference), **DR-ADM-TRUST** (Trust — verification-record reference + decision recorded via service; **Trust stores; Admin owns no record, no score**), **DR-ADM-PC** (Platform Core). *(DR-ADM-RFQ / DR-ADM-OPS are Part-1 seams, not active in BC-ADM-4/5/6; **`DR-ADM-COMM` does not exist in the frozen structure — not used**.)* Escalation markers: **`[ESC-ADM-SLUG]`** (import + outreach — no §7 staff slug; no slug invented), **`[ESC-ADM-AUDIT]`** (verification-task workflow + outreach — not §9-enumerated; nearest by pointer; no action invented; import binds the named §9 "import job execution"), **`[ESC-ADM-POLICY]`** (Admin tunables absent from Doc-3 §12.2 — import batch limits, outreach cadence; carried), **`[ESC-ADM-EVENT]`** (none coined; BC-ADM-4/5/6 produce no §8 event). **Carried, never resolved here**; resolution is an additive patch to the owning document through its named Doc-2 channel.

---

*End of Doc-4J — Admin Operations — Content Pass-A Part 2 v1.0. Pass-A depth — BC overviews, aggregate definitions, contract **inventory** (no 12-section hardening), authorization/audit/event/dependency consolidations, error model, AI-agent notes — for BC-ADM-4 Data Import, BC-ADM-5 Verification Workflow, BC-ADM-6 Vendor Outreach. Authored against `Doc-4J_Structure_FROZEN_v1.0` (sole structural authority) and the frozen corpus (Architecture, ADRs, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A–4I FROZEN); Part-1 (BC-ADM-1/2/3) not reopened. State machines verbatim Doc-2 §3.9 (`import_jobs queued→processing→completed/failed`; `verification_tasks queued→in_review→decided`; `outreach_campaigns draft→running→completed`). **Produced events: NONE** in these three contexts (the sole Admin §8 event `VendorBanned` is BC-ADM-2's, Part 1); no event coined. Authorization: `staff_can_verify` (BC-ADM-5) + `[ESC-ADM-SLUG]` for import + outreach (no §7 staff slug; no slug invented); `staff_super_admin` flagged. Audit: Doc-2 §9 "import job execution" by pointer (BC-ADM-4) + `[ESC-ADM-AUDIT]` for verification-task workflow + outreach (not §9-enumerated; no action invented). "Admin decides; the owning module stores" — import seeds via Marketplace service, the **verification decision is recorded via the Trust service (Trust stores the record/decision and any score; Admin owns the workflow task only — firewall)**. The procurement moat (no matching/routing/ranking/supplier-selection/award/eligibility; **vendor outreach is informational only, never procurement routing**) and the trust firewall (no score, no verification record) are preserved; nothing invented. Reconciliation: the brief's differing lifecycles (`running`/`pending→approved→rejected`/`draft→active→completed/cancelled`) and `DR-ADM-COMM` marker were reconciled to the frozen Doc-2 §3.9 states and the frozen DR markers per the user's confirmation — frozen authority governs. Authorized next stage after Hard Review → Pass-A Patch → Patch Verification: Doc-4J Pass-A FROZEN → Pass-B.*
