# Doc-4D — Content Pass-B Patch v1.0.1 (Marketplace & Discovery — Hard Review Resolution)

| Field | Value |
|---|---|
| Patch ID | Doc-4D-PassB-Patch-v1.0.1 |
| Applies To | `Doc-4D_Content_v1.0_PassB.md` (master) + Part files A–E |
| Produces | Doc-4D Content v1.0 Pass-B **as amended** — Pass-B approval candidate |
| Patch Authority | Architecture Board Directive — approved `Doc-4D_PassB_Hard_Review_Report_v1.0.md` findings **M-01, m-01, m-02, m-03** + optional **N-01, N-02** |
| Patch Type | **Additive governance patch only.** Corrects one invented state-machine edge (M-01), one mis-attributed audit binding (m-01), one response/state non-determinism (m-02), per-Contract-ID presentation normalization (m-03), and two optional clarifications (N-01, N-02). **No redesign, no Pass-B rewrite, no Freeze Audit.** |
| Coining guarantee | **No entity, contract, event, permission slug, audit action, POLICY key, template, lifecycle state, or state-machine transition invented.** Corpus conflicts carried, not resolved locally. |
| Conforms To | Architecture FINAL, ADRs v1, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN, Doc-4D_Content_v1.0_PassA (APPROVED) — all FROZEN/closed |
| Precedence | Architecture → ADRs → Doc-2 → Doc-3 → Doc-4A → Doc-4B → Doc-4C → Doc-4D Structure → Doc-4D Pass-A → Doc-4D Pass-B → Hard Review Report v1.0 |
| Status | **APPROVED — additive Pass-B patch** |

---

## 1 — Patch Summary

This patch applies the Architecture Board–approved Hard Review findings to `Doc-4D_Content_v1.0_PassB` (master + Parts A–E) as targeted, additive amendments, each quoting the exact base text. **M-01** corrects the `publish_microsite.v1`/`unpublish_microsite.v1` state-machine notation from the invented `draft ↔ published → unpublished` to the corpus-literal `draft → published → unpublished` (Doc-2 §3.3; no `published → draft` edge). **m-01** rebinds the `create_category.v1` / `update_category.v1` audit from the wrong Doc-2 §9 "category approve/delete" action to `[ESC-MKT-AUDIT]` (§9 enumerates no category-create/edit action); `set_category_status.v1` is unchanged. **m-02** makes `assign_category.v1` deterministic (Response `status : enum(=active)`, matching the State Effects `proposed → active`; no approval gate invented). **m-03** normalizes the combined contract blocks to per-Contract-ID sections (presentation only; §B.1 / Doc-4A §4.3) via the Section Split Mapping in §5. **N-01** adds the REFERENCE stage to the two System consumers that omit it (`reflect_verified_claim_status.v1`, `reflect_vendor_ban.v1`); `sync_verified_financial_tier.v1` already declares it. **N-02** extends `create_category.v1` AI-Agent Notes to name the DD-4 boundary. Nothing is invented; no ownership/authority/lifecycle/event/audit-action/schema change; DD-1…DD-8 and `[ESC-MKT-AUDIT]` preserved.

---

## 2 — Finding Resolution Matrix

| Finding | Severity | Affected | Amendments | Resolution |
|---|---|---|---|---|
| **M-01** | MAJOR | Part C `publish_microsite.v1`·`unpublish_microsite.v1` | REP-1 (Validation Matrix STATE), REP-2 (State Effects) | `↔` removed; corpus-literal `draft → published → unpublished` (publish: `draft→published`; unpublish: `published→unpublished`); no `published → draft` edge. |
| **m-01** | MINOR | Part B `create_category.v1`, `update_category.v1` | REP-3 (create audit), REP-4 (update audit) | Audit rebound to `[ESC-MKT-AUDIT]` (Doc-2 §9 has no category-create/edit action; channel §9 additive). `set_category_status.v1` unchanged. |
| **m-02** | MINOR | Part B `assign_category.v1` | REP-5 (Response), REP-6 (State Effects determinism) | Response `status : enum(=active)`; command drives full `proposed → active` (no approval gate per Doc-2 §3.3). |
| **m-03** | MINOR | Parts B/C/D/E combined blocks | §5 Section Split Mapping | Each Contract-ID → own Header section (§B.1); shared content cross-referenced. Presentation only — no contract/ownership/authz/event/audit/schema change. |
| **N-01** | NITPICK (opt) | Part A `reflect_verified_claim_status.v1`; Part E `reflect_vendor_ban.v1` | REP-7, REP-8 | REFERENCE stage added between CONTEXT and STATE. `sync_verified_financial_tier.v1` already declares REFERENCE — unchanged. |
| **N-02** | NITPICK (opt) | Part B `create_category.v1` AI-Agent Notes | REP-9 | Note extended to name DD-4 (governance vs assignment separation). |

---

## 3 — Exact Insertions

No standalone insertions. The N-01 REFERENCE-stage additions are line-replacements (§4, REP-7/REP-8). The m-03 per-Contract-ID Header insertions are enumerated structurally in **§5 Section Split Mapping** (applied at Pass-B-closure integration).

---

## 4 — Exact Replacements

### REP-1 — M-01: `publish_microsite.v1`·`unpublish_microsite.v1` Validation Matrix STATE (Part C)

- *Existing Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_publish_profile`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §3.3 `draft ↔ published → unpublished`) → BUSINESS (publishable).`
- *Amendment Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX → CONTEXT → AUTHZ (`can_publish_profile`) → SCOPE → DELEGATION (§6B) → STATE (Doc-2 §3.3 `draft → published → unpublished` — unidirectional; publish drives `draft → published`, unpublish drives `published → unpublished`; **no `published → draft` edge**) → BUSINESS (publishable).`
- *Rationale:* Removes the invented `published → draft` edge implied by `↔`; binds the literal Doc-2 §3.3 microsite machine (Doc-4A §13). No new state/transition.

### REP-2 — M-01: `publish_microsite.v1`·`unpublish_microsite.v1` State Effects (Part C)

- *Existing Text:*
  > `- **State Effects (§13):** Doc-2 §3.3 `draft ↔ published → unpublished`. **Idempotency (§B.7):** required; dedup [DD-6].`
- *Amendment Text:*
  > `- **State Effects (§13):** Doc-2 §3.3 `draft → published → unpublished` (unidirectional) — `publish_microsite.v1`: `draft → published`; `unpublish_microsite.v1`: `published → unpublished`. **No `published → draft` edge** (a reverse edge would require a Doc-2 §3.3 additive). **Idempotency (§B.7):** required; dedup [DD-6].`
- *Rationale:* Same as REP-1, applied to State Effects; corpus-literal lifecycle only.

### REP-3 — m-01: `create_category.v1` Audit (Part B)

- *Existing Text:*
  > `- **Audit (§B.8):** yes; Admin "category approve/delete" (§9) by pointer; attribution standard (Admin); Correlation both.`
- *Amendment Text:*
  > `- **Audit (§B.8):** yes; **`[ESC-MKT-AUDIT]`** — Doc-2 §9 enumerates **no category-create audit action** (the §9 Admin "category approve/delete" action covers approve/retire, not create); interim nearest §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**. Attribution standard (Admin); Correlation both.`
- *Rationale:* `create_category.v1` creates at `draft` — it neither approves nor deletes. Doc-2 §9 has no category-create action → `[ESC-MKT-AUDIT]` (Doc-4A §17.2). No action coined.

### REP-4 — m-01: `update_category.v1` Audit (Part B)

- *Existing Text:*
  > `**State Effects:** none (attribute edit). **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; Admin "category approve/delete". **Events:** none. **AI-Agent Notes:** DD-4 Admin authority; no reparenting beyond ≤4-level CHECK.`
- *Amendment Text:*
  > `**State Effects:** none (attribute edit). **Idempotency (§B.7):** required; dedup [DD-6]. **Audit (§B.8):** yes; **`[ESC-MKT-AUDIT]`** — Doc-2 §9 enumerates **no category-edit audit action**; interim nearest §9 action by pointer; channel Doc-2 §9 additive; **no audit action invented**. **Events:** none. **AI-Agent Notes:** DD-4 Admin authority; no reparenting beyond ≤4-level CHECK.`
- *Rationale:* `update_category.v1` edits name/slug — not approve/delete. Same `[ESC-MKT-AUDIT]` treatment. `set_category_status.v1` retains "category approve/delete" (unchanged — covers `draft→active` approve / `active→retired` retire).

### REP-5 — m-02: `assign_category.v1` Response Contract (Part B)

- *Existing Text:*
  > `- **Response Contract (§B.3):** `{ category_assignment_id : uuid, status : enum(=proposed|active) } + reference_id`.`
- *Amendment Text:*
  > `- **Response Contract (§B.3):** `{ category_assignment_id : uuid, status : enum(=active) } + reference_id` (deterministic — the command drives the full `proposed → active` transition; Doc-2 §3.3 declares no approval gate).`
- *Rationale:* Removes the `proposed|active` non-determinism; the command lands `active` (consistent with the State Effects and Doc-2 §3.3's gate-free `proposed → active`). No approval gate / intermediate workflow / DD marker invented.

### REP-6 — m-02: `assign_category.v1` State Effects determinism note (Part B)

- *Existing Text:*
  > `- **State Effects (§13):** Doc-2 §3.3 `proposed → active`. **Idempotency (§B.7):** required; dedup [DD-6].`
- *Amendment Text:*
  > `- **State Effects (§13):** Doc-2 §3.3 `proposed → active` — the command completes the full transition automatically (no approval gate in Doc-2 §3.3); the assignment lands **`active`** (Response `status = active`). **Idempotency (§B.7):** required; dedup [DD-6].`
- *Rationale:* Makes State Effects and Response mutually deterministic; corpus-literal `proposed → active` (no invented intermediate rest state).

### REP-7 — N-01: `reflect_verified_claim_status.v1` Validation Matrix (Part A)

- *Existing Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX (payload) → CONTEXT (System; §5.2) → STATE (Doc-2 §5.3 claim `claimed → verified`; literal edge) → BUSINESS (idempotent; profile in `claimed`).`
- *Amendment Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX (payload) → CONTEXT (System; §5.2) → REFERENCE (`vendor_profile_id` exists) → STATE (Doc-2 §5.3 claim `claimed → verified`; literal edge) → BUSINESS (idempotent; profile in `claimed`).`
- *Rationale:* REFERENCE (stage 7) declared in the matrix per the canonical order (§B.4); the existence check already noted in §B.10 is now reflected in the matrix. No functional change.

### REP-8 — N-01: `reflect_vendor_ban.v1` Validation Matrix (Part E)

- *Existing Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX (payload) → CONTEXT (System; §5.2) → STATE (Doc-2 §5.3 status `active → banned`; literal edge) → BUSINESS (idempotent; reflect Admin's ban decision).`
- *Amendment Text:*
  > `- **Validation Matrix (§B.4):** SYNTAX (payload) → CONTEXT (System; §5.2) → REFERENCE (`vendor_profile_id` exists) → STATE (Doc-2 §5.3 status `active → banned`; literal edge) → BUSINESS (idempotent; reflect Admin's ban decision).`
- *Rationale:* As REP-7. *(`sync_verified_financial_tier.v1` (Part A) already declares the REFERENCE stage — no change required; N-01 is satisfied across all three System consumers.)*

### REP-9 — N-02: `create_category.v1` AI-Agent Notes (Part B)

- *Existing Text:*
  > `- **AI-Agent Notes:** platform-staff only; category approval is Admin-governed (DD-4); enforce ≤4 levels; do not couple category create to vendor assignment.`
- *Amendment Text:*
  > `- **AI-Agent Notes:** platform-staff only; category approval is Admin-governed (DD-4); enforce ≤4 levels; **do not couple category create to vendor assignment (DD-4 — category governance is platform-staff; category assignment is controlling-org via `assign_category.v1`; separate contracts, separate authorization chains).**`
- *Rationale:* Names the DD-4 corpus boundary for the governance-vs-assignment separation. No behavioral change.

---

## 5 — Section Split Mapping (m-03 — presentation normalization)

Each combined block is split into per-Contract-ID sections; each Contract-ID opens with its own Header per **§B.1** (`Contract-ID · Operation Title · Template · Actor`). Shared content (Authorization, Firewall, Validation-Matrix structure, Reference Validation) is **cross-referenced to the sibling's section** rather than re-duplicated; each section retains its own Request/Response/Error Register/State Effects/Idempotency/Audit/Events. **No contract, ownership, authorization, event, audit, or schema change** — addressability only (Doc-4A §4.3). Applied at Pass-B-closure integration.

| Part | Combined block (current) | Split into per-Contract-ID sections |
|---|---|---|
| B | `create_category.v1` · `update_category.v1` | `create_category.v1`; `update_category.v1` |
| B | `update_category_assignment.v1` · `remove_category_assignment.v1` | `update_category_assignment.v1`; `remove_category_assignment.v1` |
| B | `create_product.v1` · `update_product.v1` | `create_product.v1`; `update_product.v1` |
| B | `create_spec_library_entry.v1` · `update_spec_library_entry.v1` | `create_spec_library_entry.v1`; `update_spec_library_entry.v1` |
| B | `add_spec_document.v1` · `supersede_spec_document.v1` | `add_spec_document.v1`; `supersede_spec_document.v1` |
| B | `get_product.v1` · `list_products.v1` · `get_spec_library_entry.v1` · `get_spec_document.v1` | four read sections (shared authz/query note; per-Contract-ID Header + Error Register) |
| B | `list_categories.v1` · `get_category_assignments.v1` | `list_categories.v1`; `get_category_assignments.v1` |
| C | `create_microsite.v1` · `update_microsite.v1` | `create_microsite.v1`; `update_microsite.v1` |
| C | `publish_microsite.v1` · `unpublish_microsite.v1` | `publish_microsite.v1`; `unpublish_microsite.v1` (each with its single literal edge per REP-1/REP-2) |
| C | `update_profile_sections.v1` · `update_branding_assets.v1` · `update_seo_settings.v1` | three sections (per-Contract-ID Header; per-op event: `ProfileLayoutChanged` / `ProfileThemeChanged` / none) |
| C | `publish_profile.v1` · `unpublish_profile.v1` | `publish_profile.v1`; `unpublish_profile.v1` |
| C | `create_custom_domain.v1` · `confirm_custom_domain_verification.v1` · `activate_custom_domain.v1` · `release_custom_domain.v1` | four sections (per-Contract-ID Header; shared DD-5 note cross-referenced) |
| C | `create_showcase_project.v1` · `update_showcase_project.v1` · `publish_showcase_project.v1` | three sections |
| D | `get_advertisement.v1` · `list_advertisements.v1` | `get_advertisement.v1`; `list_advertisements.v1` |
| D | `add_catalog_favorite.v1` · `remove_catalog_favorite.v1` | `add_catalog_favorite.v1`; `remove_catalog_favorite.v1` |
| E | `search_catalog.v1` · `list_vendor_directory.v1` · `get_public_vendor_profile.v1` | three sections (shared public-read/non-disclosure note cross-referenced) |

*(Part A: `create_vendor_profile.v1` and all other Part-A contracts are already individually headed — no split required.)*

---

## 6 — Preservation Validation

| Property | Status | Note |
|---|---|---|
| No ownership changes | **Preserved** | All amendments are notation/binding/presentation; entity ownership unchanged. |
| No authority changes | **Preserved** | No slug/actor changed; `set_category_status.v1` audit unchanged. |
| No entity additions | **Preserved** | None. |
| No event additions | **Preserved** | None coined; emitted/consumed sets unchanged. |
| No permission additions | **Preserved** | None. |
| No audit-action additions | **Preserved** | m-01 rebinds to `[ESC-MKT-AUDIT]` (carried) — **no action created** to bypass escalation. |
| No POLICY-key additions | **Preserved** | None; DD-6 dedup keys unchanged. |
| No template additions | **Preserved** | Templates unchanged (21.3/21.4/21.5/21.6). |
| No lifecycle modifications | **Preserved** | M-01 **removes** an invented edge → corpus-literal §3.3; m-02 affirms the literal `proposed → active`. |
| No state-machine modifications | **Preserved** | Doc-2 §3.3/§5.3/§5.8 untouched; no edge added. |
| No module-boundary modifications | **Preserved** | DD-4 (category governance Admin), DD-1/DD-3 (Trust/Admin) boundaries intact. |
| No integration-boundary modifications | **Preserved** | Single-authorship intact; N-01 adds a validation stage only; no integration authored. |
| DD-1 … DD-8 preserved | **Preserved** | Unchanged. |
| `[ESC-MKT-AUDIT]` preserved | **Preserved** | Unchanged; m-01 carries two more contracts under it (interim nearest §9 action; no action invented). |

---

## 7 — Governance Validation

| Check | Result |
|---|---|
| Corpus-literal lifecycle (M-01) | **PASS** — `draft → published → unpublished` matches Doc-2 §3.3; no `published → draft` invented; a reverse edge would require a Doc-2 §3.3 additive (not authored). |
| Audit attribution correctness (m-01) | **PASS** — create/edit no longer mislabeled "category approve/delete"; `[ESC-MKT-AUDIT]` carried to the Doc-2 §9 additive channel; `set_category_status.v1` approve/delete binding intact. |
| State determinism (m-02) | **PASS** — Response `status = active` consistent with State Effects `proposed → active`; no approval gate / intermediate workflow / DD marker invented. |
| Addressability (m-03) | **PASS** — one Contract-ID = one addressable section (§B.1 / Doc-4A §4.3); presentation only; shared content cross-referenced; no semantic change. |
| Canonical validation order (N-01) | **PASS** — REFERENCE placed at its canonical position (stage 7, between CONTEXT and STATE); all three System consumers now declare it; order unchanged. |
| Flag-and-Halt discipline | **PASS** — `[ESC-MKT-AUDIT]` (Doc-2 §9), the `published → draft` non-edge (Doc-2 §3.3 additive), and DD-1…DD-8 all carried to their channels; nothing resolved locally; nothing invented. |
| Nothing invented | **PASS** — no entity/contract/event/slug/audit-action/POLICY-key/template/lifecycle/state created. |

---

*End of Doc-4D Content Pass-B Patch v1.0.1 — additive resolution of M-01, m-01, m-02, m-03 + optional N-01, N-02. Microsite lifecycle made corpus-literal (M-01); category create/edit audit rebound to `[ESC-MKT-AUDIT]` (m-01); `assign_category` made deterministic (m-02); per-Contract-ID section split mapped (m-03); REFERENCE stage added to two System consumers (N-01); DD-4 boundary named (N-02). No ownership/authority/lifecycle/event/audit-action/schema change; DD-1…DD-8 and `[ESC-MKT-AUDIT]` preserved; nothing invented.*
