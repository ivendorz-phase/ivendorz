# Doc-5D_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5D_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (with one applied additive Doc-3 §12.2 registration — `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace`, APPROVED; the DD-6 content-freeze gate cleared) |
| Freeze Date | 2026-06-25 |
| Freeze Authority | `governanceReviews/Doc-5D_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0; the sole content-freeze gate resolved by Patch v1.2) |
| Module | Module 2 — Marketplace & Discovery (`marketplace` schema) — first large public/anonymous read surface |
| Realizes | `Doc-4D` (M2 contracts, FROZEN — 71 contracts: 64 caller-facing + 7 out-of-wire) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5D — M2 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content = the registered passes + resolved registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 · Doc-3 v1.0.2 (+ Policy-Key Patches v1.0/v1.1/v1.2) → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** · Doc-5B · Doc-5C · Doc-5E (FROZEN) → **Doc-5D** → Doc-5F…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0 (review records carry methodology notes)
```

**Audit Status: READY TO FREEZE — one applied additive Doc-3 §12.2 registration (Patch v1.2), no open dependency**

**Governance Status: DOC-5D FROZEN**

Doc-5D is the per-module realization of **Module 2 — Marketplace & Discovery**, the first Doc-5 module with a **large public/anonymous read surface**: it binds the frozen Doc-4D contracts to concrete HTTP endpoints under the `marketplace` namespace, realizes the cross-cutting **tri-actor (Public/User/Admin) + visibility + non-disclosure** wire model (§3), and applies the out-of-wire boundary (R1) to the 7 System event consumers / read-model rebuild / infra domain-verify / internal-service matching read / DD-8-blocked ban-lift (§9). It realizes the 64 caller-facing endpoints across vendor profile, catalog/product/spec, profile experience, advertising/favorites, and public discovery. It passes the Doc-5A **Appendix A** conformance checklist in full, with dedicated attestations for the **R5 projection-separation** and **R9 non-disclosure** invariants.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5D_Structure_v1.0_FROZEN.md` | R1–R10 + DD-1…DD-8 ratified at structure freeze (Hard Review v0.2 + round-3 ADD-1/ADD-2; history in `Doc-5D_Structure_Proposal_v0.1.md`) |
| §0 Document Control · §1 Scope & M2 Surface Partition · §2 Realized Endpoint Inventory (64) · §3 Cross-Cutting Actor/Visibility/Non-Disclosure Wire Model | `Doc-5D_Content_v1.0_Pass1.md` | dual-leg fence (§3.4); per-read projection rule; tri-actor; `check_permission` sole authority; Identity = Doc-4C §C3 (not a DD); supersede `201` + entry-32 projection (r2); no caller `202` |
| §4 Vendor Profile, Capacity & Financial-Tier · §5 Catalog, Product & Specification · §6 Profile Experience & Presentation | `Doc-5D_Content_v1.0_Pass2.md` | §4.7 top-level `reference_id` (C-05); `create_vendor_profile` entry-state `claimed` (BR-M-02, Doc-2 §5.3); coined `ShowcaseProjectPublished` removed (BR-M-01); event names→`Doc-2 §8` pointer (BR-m-01); supersede `201`+`Location` (Doc-4D §D7.2); cursor pagination; entitlement firewall (DD-5); `claim_vendor_profile` DD-7 fenced |
| §7 Advertising & Catalog-Favorites · §8 Discovery & Public Read · §9 Out-of-Wire Boundary · §10 Conformance & Carried Items · Appendix A Conformance Attestation | `Doc-5D_Content_v1.0_Pass3.md` | §8 R9 non-disclosure firewall (public surface); §9 protocol exclusion (REST/SSE/WS/webhook/GraphQL) + flag-and-halt + DD-8 blocked ban-lift; CHK-5A-121/071 → **cleared** by Patch v1.2; dedicated R5 projection-separation + R9 non-disclosure attestations |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§10, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "Independent Hard Review / Board Review applied" status lines, and board self-review notes.
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4D §X` / `Doc-4M` / `Doc-2` / `Doc-4A` / `Doc-4I` / `Doc-4C §C3` pointer is preserved exactly; reference-never-restate holds.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5D amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary — 7 contracts (System event consumers, read-model rebuild, infra domain-verify, internal-service matching read, DD-8 blocked ban-lift) + integrations + outbox events have no caller wire (§9). No caller `202`. |
| **R2** | Tri-actor — Public (anonymous, no auth/org), User (server-validated `Iv-Active-Organization`), Admin (no org context); System out-of-wire. |
| **R3** | `marketplace` route prefix (Doc-5A Appendix B.1; Doc-2 §0.3). |
| **R4** | No token invented — existing Doc-2 §7 slugs / §9 audit / §8 events / Doc-3 §12.2 keys; carried gaps escalated. |
| **R5** | Content ≠ Presentation — draft (Controlling-Org) and published (Public) are distinct wire surfaces; no merged read; per-read projection class declared. |
| **R6** | Matching read-model projection-only (DD-2) — M2 reads Trust, never calculates; authors no matching/ranking/routing logic. |
| **R7** | Reflect-never-decide — verified-tier write, `claimed→verified`, `banned` realized only as System event consumers (§9), never a caller decision endpoint. |
| **R8** | Entitlement gating consumed, never authored (DD-5) — Billing checks consumed; denial → `NOT_FOUND`; no ledger. |
| **R9** | Non-disclosure firewall on the public wire — no blacklist/private/banned/suspended/soft-deleted fact surfaced; uniform `NOT_FOUND`, no count leak. |
| **R10** | Event surface via outbox, not webhook — `marketplace` events (Doc-2 §8, by pointer) → M0 outbox; no caller webhook/push. |

## Realization Conventions (§0.4 transport disambiguations — within Doc-5D authority)

- **Nested singletons:** `capacity_profile`, profile-experience `sections`/`branding_assets`/`seo_settings` — `PATCH` on the one-per-parent child (§5.3 silent).
- **Create-via-source-command:** `supersede_spec_document` — named command on the superseded doc producing a new addressable revision (`201`+`Location`; prior retained, Doc-2 §10.3).
- **Removals:** `remove_category_assignment` / `remove_catalog_favorite` → `DELETE` on the item (soft-delete-vs-row-removal owned by Doc-4D `State Effects`, by pointer); **N:N link/unlink → `POST` named command** (relationship mutation).
- **Search/directory-as-read:** `search_catalog`, `list_vendor_directory` — anonymous `GET` reads, never create server state.

## Open Carried Items (non-gate) & Applied Patch

| ID | Item | Status |
|---|---|---|
| **DD-1** Trust verification · **DD-2** RFQ matching read-model · **DD-3** Admin ban · **DD-5** Billing entitlement · **DD-8** ban-lift | OPEN — out-of-wire (§9); consumed in-process / blocked |
| **DD-4** Admin category governance | CARRY FORWARD — `staff_can_manage_categories` (Doc-4D §D7.1) |
| **DD-6** `marketplace.*` POLICY keys | **RESOLVED** — registered in Doc-3 §12.2 via approved `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` (the content-freeze gate; Doc-4A §18.2 satisfied) |
| **DD-7** `vendor_claim_records` tenancy | **TRACKED / escalated** — cross-frozen-doc (Doc-2 §6 vs §10.3/§3.3), Board-gated additive reconciliation; blocks `claim_vendor_profile` **content finalization only**; does **not** gate freeze |
| `[ESC-MKT-AUDIT]` | OPEN — nearest Doc-2 §9 action; never invented |

**Applied corpus patch (ratification dependency, satisfied):** `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` — additive §12.2 registration of `marketplace.idempotency_dedup_window` + `marketplace.list_page_size_max`; Status APPROVED (human owner, 2026-06-25). Additive only; no Doc-3 semantic/routing/trust/procurement/ownership change; firewall preserved. Review evidence: `governanceReviews/Doc-5D_Freeze_Readiness_Audit_v1.0.md`.

**Separate Board item (does not gate Doc-5D):** the **DD-7** `vendor_claim_records` tenancy reconciliation (additive Doc-2 §6/§3.3) — architecture-touching, human/Board-gated. `claim_vendor_profile` carries a tracked content-finalization flag until it resolves.

---

## Downstream Effect

Doc-5D is the binding API-realization layer for **Module 2 — Marketplace & Discovery**, and the first **public/anonymous-surface** realization (template for any module with anonymous reads). It establishes the tri-actor wire model and the R5 projection-separation + R9 public-wire non-disclosure precedents. Each remaining Doc-5x (Doc-5G Trust, Doc-5F…5M) is gated at freeze by the Doc-5A Appendix A checklist. Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel.

---

*Doc-5D program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*
