# Doc-5D — Marketplace & Discovery (M2 `marketplace`) API Realization — Content v1.0, Pass 3 (§7–§10 + Appendix A)

| Field | Value |
|---|---|
| Document | Doc-5D — Marketplace & Discovery (Module 2) — API Realization |
| Pass | 3 of 3 — §7 (advertising + favorites), §8 (discovery), §9 (out-of-wire boundary), §10 (conformance & carried items), Appendix A (conformance attestation) — final content pass |
| Status | ACTIVE — Content Pass 3 of 3; §7–§10 + Appendix A. **Independent Hard Review applied:** MAJOR-01 §7.4 cursor pagination added for `list_advertisements`/`list_catalog_favorites` (CHK-5A-070/071); MINOR-01 §7.3 `get_advertisement`/`list_advertisements` projection corrected to Controlling-Org; MINOR-02 §8.1 `[Realization convention §0.4]` markup added for search/directory-as-read (CHK-5A-122); MINOR-03 §10.2 DD-4 row corrected (speculative slug-registration obligation removed); MINOR-05 App A CHK-5A-110 qualified to `Doc-5A §12`; MINOR-06 §9.2 event-category inline list replaced with pure pointer (CHK-5A-103); O-01 CHK-5A-133 entity count sourced to `Doc-4D §D4–§D7.3`; NP-01 `add_catalog_favorite` → `201`+`Location`; NP-02 §9.3 protocol exclusion enumerated; NP-03 App A R9 band standalone moat attestation added. **0 open BLOCKER/MAJOR/MINOR.** On completion, Doc-5D content (§0–§10 + Appendix A) is complete → next is Doc-5D Freeze Readiness Audit (gated on DD-6 `marketplace.*` POLICY-key registration patch) |
| Structure | Conforms to `Doc-5D_Structure_v1.0_FROZEN.md` |
| Realizes | The remaining 12 caller-facing endpoints (§7 = 9 advertising/favorites, §8 = 3 public discovery) + the out-of-wire boundary (the 7 out-of-wire contracts, DD-1…DD-8 integrations, emitted outbox events) + the Doc-5A Appendix A attestation |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; `Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document |
| Builds on | Doc-5D Content Pass-1 (§0–§3 + inventory) and Pass-2 (§4–§6) |
| Contains | The §7/§8 §5.7 realization, the §9 boundary statement (no realization), the §10 conformance obligation + carried-item register, and the Appendix A per-band attestation. No contract bodies, representations, error codes, POLICY keys, audit actions, events, or Doc-4D rules restated |
| Audience | Architecture / API Governance Boards · Doc-5D authors · AI Coding Supervisor · backend, QA |

> **Realize, never re-decide.** §7–§8 realize the **wire face** of the remaining caller surfaces; §9 declares the boundary (no endpoint, no realization); §10 + Appendix A attest. Nothing is coined. The §3 cross-cutting model (tri-actor / visibility / non-disclosure) governs §7–§8; **every read declares its projection class** (§3.4). The public discovery surface (§8) is the **highest-risk M2 non-disclosure area** (R9). Transport choices marked **[realization convention]**.

**Dependency realization path:** `Doc-5A §5/§6/§7/§8/§9/§11`, Appendix A; `Doc-4D §D6/§D7.4/§D7.5`, Appendix C; `Doc-4M`; `Doc-4I` (entitlement, consumed); `Doc-2 §8`; `Doc-4B` outbox.

---

## §7 — Advertising & Catalog-Favorites Surface Realization (BC-MKT-5 + BC-MKT-7)

### 7.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
- **Advertising:** `create_advertisement` → `POST /marketplace/advertisements` (`201`+`Location`; entitlement-gated — DD-5/R8); `submit_advertisement` → `POST …/{id}/submit_advertisement` (`draft → pending_review`); `review_advertisement` → `POST …/{id}/review_advertisement` (**Admin**, 21.6, no org context; `pending_review → scheduled | rejected`); `set_advertisement_state` → `POST …/{id}/set_advertisement_state` (**User leg**, `active ⇄ paused`); reads `get_advertisement`/`list_advertisements` → `GET`.
- **Catalog favorites:** `add_catalog_favorite` → `POST /marketplace/catalog_favorites` (`201`+`Location`); `remove_catalog_favorite` → `DELETE /marketplace/catalog_favorites/{id}`; `list_catalog_favorites` → `GET /marketplace/catalog_favorites`. **Membership-only — no slug** (org-scoped bookmarks; distinct from Operations' private-CRM vendor favorites).
- **Binds:** `Doc-5A §5.2/§5.3`; `Doc-4D §D7.4/§D7.5`.

### 7.2 Advertisement Machine & System Auto-Transition (Doc-4M)
- The advertisement lifecycle (`draft → pending_review → scheduled → active ⇄ paused → completed | rejected`) is realized as **legal transitions only** (`Doc-4M` = authoritative state-machine index; edges sourced from `Doc-2`/`Doc-4D`; `Doc-4A §13`). Caller legs: `submit_advertisement` (`→ pending_review`), `review_advertisement` (Admin, `→ scheduled | rejected`), `set_advertisement_state` (User, `active ⇄ paused`). **The scheduled-activation and completion auto-transitions are System-driven and out-of-wire (§9)** — no caller `202`; observed via reads. Illegal → `STATE` → `409`.
- **Binds:** `Doc-4M`; `Doc-4D §D7.4`.

### 7.3 Entitlement Gating & Projection Class (§3.4/§3.6)
- `create_advertisement` (and `submit_advertisement`) **consume** Billing (`Doc-4I`) entitlement at the gate; **denial collapses to `NOT_FOUND`** (R9 — no leak); **M2 consumes the entitlement decision, never persists or derives it** (DD-5). Advertisement **purchase** is Billing-owned (`Doc-4D §D7.4`), referenced by bare UUID; Doc-5D authors no Billing contract.
- **Projection (§3.4):** `get_advertisement` / `list_advertisements` → **Controlling-Org** (vendor views own org's ads in all lifecycle states per `Doc-4D §D7.4`; active ads are publicly surfaced via §8 catalog discovery — not via a §7 public path; no anonymous caller leg on §7 ad reads). `list_catalog_favorites` → **Controlling-Org** (org-scoped bookmarks; never public). No read merges projections (R5).
- **Binds:** `Doc-4I` (consumed — DD-5); §3.4/§3.6; `Doc-4D §D6/§D7.5`.

### 7.4 Idempotency, Concurrency, Error, Audit & Events
- **Pagination:** `list_advertisements` and `list_catalog_favorites` use **cursor-based pagination only — no offset** (`CHK-5A-070` [B]; `Doc-5A §8`); page-size bound governed by a **`marketplace.*` list page-size POLICY key** (referenced by intended name only, registration not implied; part of the **DD-6 registration batch** — content-freeze gate, `CHK-5A-071`). Counts/items exclude state-restricted ads and org-scoped favorites identically (R9/R5).
- Mutations `Idempotency: required` (`marketplace.*` dedup key — DD-6 content-gate; referenced by intended name only, registration not implied); optimistic updates → `If-Match` (`updated_at`); stale → `CONFLICT` → `409`. **Removal:** `remove_catalog_favorite` → `DELETE` on the favorite row (relationship removal; owned by `Doc-4D §D7.5` `State Effects`, by pointer). Error per `Doc-5A §6.2` (by pointer; codes `Doc-4D §D7.4/§D7.5`, `marketplace_`). Top-level `reference_id` on every body-bearing response (§4.7). Audited via `core.append_audit_record.v1`; advertisement audit actions carry **`[ESC-MKT-AUDIT]`** (nearest §9 action; never invented). Emitted advertisement events are §9 (outbox, R10) — **catalog/payloads owned by `Doc-2 §8`, not restated** (`CHK-5A-103`). Authorization server-side (§3.5); `review_advertisement` Admin no-org; favorites **membership-only, no slug**.
- **Binds:** `Doc-5A §6/§9`; `Doc-4D §D7.4/§D7.5/§D8`; `Doc-2 §8`; DD-6, `[ESC-MKT-AUDIT]`.

---

## §8 — Discovery & Public Read Surface Realization (BC-MKT-6) — highest-risk non-disclosure area (R9)

### 8.1 Endpoint Realization (§5.2/§5.3; inventory §2.5)
- `search_catalog` → `GET /marketplace/catalog_search` (**anonymous**; **[Realization convention §0.4]** — search-as-read: a read, never creates server state; §5.3 is silent on search surface — §2.1); `list_vendor_directory` → `GET /marketplace/vendor_directory` (**anonymous**; **[Realization convention §0.4]** — directory-as-read: §5.3 is silent on singular-noun resource — §0.4); `get_public_vendor_profile` → `GET /marketplace/public_vendor_profiles/{id}` (**anonymous**). **No `Authorization`, no `Iv-Active-Organization`** on any §8 read (R2 public surface).
- **Binds:** `Doc-5A §5.3/§7`; `Doc-4D §D6`.

### 8.2 Non-Disclosure Firewall (R9 — first-class M2 invariant)
- All §8 reads are **Public projection only**. The non-disclosure firewall (`Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §0.2/§10.11`): **no blacklist / private-CRM / Buyer-Vendor-Status / banned / suspended / soft-deleted / unpublished / retired fact is ever surfaced** — a protected-fact-gated or absent record returns a uniform **`NOT_FOUND`** identical in status, body, and timing to genuinely-absent (no side-channel). Banned/suspended/unpublished vendors and unpublished products **drop from discovery results and counts identically** (no count leak). **There is no public RFQ/CRM/private surface here** — only published marketplace presentation.
- **No matching/ranking on the wire (DD-2):** discovery ordering is catalog relevance only; **no caller-visible matching, eligibility, ranking, recommendation, or routing surface exists** — that logic is RFQ-owned (`Doc-4E`); M2's `vendor_matching_attributes` read-model is internal-service (out-of-wire §9).
- **Binds:** `Doc-5A §6.3`; `Doc-4A §7.5`; `Doc-2 §0.2/§10.11`; `Doc-4D §D6`; DD-2 (§9).

### 8.3 Pagination, Error & `reference_id`
- `search_catalog`, `list_vendor_directory` use **cursor-based pagination only — no offset** (`CHK-5A-070`; `Doc-5A §8`); page-size bound via a **`marketplace.*` list page-size POLICY key** (DD-6 batch — content-freeze gate, `CHK-5A-071`). Error per `Doc-5A §6.2` (by pointer; codes `Doc-4D §D6`, `marketplace_`); non-disclosed/absent → uniform `404`. Top-level `reference_id` on every body-bearing response (§4.7). **Reads are not audited** (`Doc-4A §17.1`).
- **Binds:** `Doc-5A §6/§8`; `Doc-4D §D6`; DD-6.

---

## §9 — Out-of-Wire Boundary (System consumers · matching read-model internal leg · infra domain-verify · integrations · events · DD-8 blocked ban-lift)

> §9 **declares a boundary; it realizes nothing.** No path, method, status, header, or schema is defined for any mechanism named here. Each is an async worker / in-process service / event consumer / outbox emission, invoked within other modules' transactions — never an M2 HTTP endpoint. Caller-visible results are observed only via the §4–§8 reads.

### 9.1 The 7 Out-of-Wire Contracts (no wire)

| Contract | Kind | Caller observes via |
|---|---|---|
| `sync_verified_financial_tier` | System event consumer (Trust-driven, DD-1) | `get_declared_financial_tier` (declared) / Trust (verified, Doc-4G) |
| `reflect_verified_claim_status` | System event consumer (Trust-driven, DD-1; R7) | vendor `verified` state via `get_vendor_profile` |
| `reflect_vendor_ban` | System event consumer (Admin-driven, DD-3; R7) | banned vendor drops from §8 reads (R9) |
| `reflect_vendor_ban_lift` | **DD-8 non-implementable placeholder** | — (no `VendorBanLifted` event in Doc-2 §8; **"DO NOT implement" guard**) |
| `confirm_custom_domain_verification` | System, infra-driven | custom-domain `active` state via `get_custom_domain` |
| `get_vendor_matching_attributes` | **internal-service** (RFQ-consumed, DD-2) | — (RFQ engine reads in-process; never an M2 caller read) |
| `rebuild_vendor_matching_attributes` | System read-model rebuild (DD-2) | — (internal projection rebuild) |

- **Reflect-never-decide (R7):** the verified-tier write, the `claimed → verified` transition, and the `banned` status are realized **only** as System event consumers — never a caller-facing decision endpoint. **`reflect_vendor_ban_lift` keeps its "DO NOT implement" guard until Doc-2 §8 declares the ban-lift event** (DD-8).
- **Matching read-model (DD-2):** `get_vendor_matching_attributes` is an internal-service read consumed by the RFQ engine in-process; `rebuild_vendor_matching_attributes` is System-only. **M2 authors no matching/eligibility/ranking/routing logic** — that is RFQ-owned (`Doc-4E`). The `set_advertisement_state` System auto-transition (scheduled activation / completion) is likewise out-of-wire.

### 9.2 DD-1…DD-8 Integrations & Emitted Events (no wire)
- **Integrations (in-process / by pointer):** DD-1 Trust verification (read/consume), DD-2 RFQ matching read-model (M2 read-model only), DD-3 Admin ban decision (`Doc-4J`, reflected), DD-4 Admin category governance (`staff_*`), DD-5 Billing entitlement (`Doc-4I`, consumed), DD-8 ban-lift (blocked). Identity `check_permission` and Billing entitlement are consumed in-process (`Doc-4C §C3` / `Doc-4I`), **never an M2 HTTP endpoint** (One Owner — `Doc-4A §4.1/§4.3`).
- **Emitted events:** M2's `marketplace` domain events are bound by pointer to **`Doc-2 §8`** — the event catalog and payloads are owned there and **are not restated here** (`CHK-5A-103`). Events are written to the **Doc-4B transactional outbox** within the same transaction as the state change, then delivered by infrastructure. **No event is a wire field; no consumer/notification/webhook contract is authored.** Idempotent command replay does not re-emit an already-emitted event (`Doc-5A §9.7`).

### 9.3 Explicit Protocol Exclusion & Flag-and-Halt
- For **every** §9 mechanism — the 7 out-of-wire contracts, the DD-1…DD-8 integrations, and the emitted events — **no caller wire in any protocol** is defined or may be added:
  - No REST endpoint
  - No SSE / WebSocket stream
  - No Webhook
  - No GraphQL surface
  - No synchronous facade; no engine/control surface
- Proposing **any** wire surface (any protocol) for these is an **architecture-affecting change** → **flag-and-halt** + human/Board approval (`Doc-5_Program_Governance_Note_v1.0 §7`; CLAUDE.md Red-Flag list). Doc-5D does not, and may not, grant them a wire.
- **Binds:** Gov-Note §7; structure R1 / Fences; `Doc-4D §D4/§D6/§D7.3`, Appendix C; `Doc-2 §8`; `Doc-4B`; `Doc-5A §1.3/§11`.

---

## §10 — Conformance & Carried Items

### 10.1 Conformance Obligation
- Before freeze, Doc-5D **MUST** pass the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) for every caller-facing endpoint (§4–§8). Freeze eligibility and the `[B]`/`[M]`/`[m]` severity discipline are governed by **`Doc-5A Appendix A §A.0`** / **Gov-Note §6**. The attestation is **Appendix A** below.

### 10.2 Carried Items (by pointer; resolved only via Doc-4D channels)

| ID | Status | Effect on Doc-5D |
|---|---|---|
| **DD-1** | OPEN (out-of-wire) | Trust verification consumed; verified-tier/claim System consumers §9; no verification surface |
| **DD-2** | OPEN (out-of-wire) | RFQ matching read-model only (§9); no matching/ranking authored |
| **DD-3** | OPEN (out-of-wire) | Admin ban decision (`Doc-4J`); `reflect_vendor_ban` §9; banned drops from §8 (R9) |
| **DD-4** | CARRY FORWARD | Admin category governance binds `staff_can_manage_categories` per `Doc-4D §D7.1`; registration status confirmed in `Doc-4D` (any unresolved registration gap is a pre-existing Doc-4D matter — escalate via Doc-4D errata channel; not a Doc-5D obligation) |
| **DD-5** | OPEN (out-of-wire) | Billing entitlement consumed (R8); denial → `404`; no ledger; ad purchase Billing-owned |
| **DD-6** | **RESOLVED** | `marketplace.idempotency_dedup_window` + `marketplace.list_page_size_max` **registered in Doc-3 §12.2** via the approved `Doc-3_Policy_Key_Registration_Patch_v1.2_Marketplace` (2026-06-25). Content-freeze gate cleared (`CHK-5A-121/071`; Doc-4A §18.2 satisfied) |
| **DD-7** | **TRACKED / escalated** | `vendor_claim_records` tenancy (cross-frozen-doc, Board-gated); blocks `claim_vendor_profile` **content finalization only** — not authoring/review/Freeze Audit/other contracts (§4.6) |
| **DD-8** | OPEN (blocked) | No `VendorBanLifted` event in Doc-2 §8 → `reflect_vendor_ban_lift` blocked, non-implementable (§9); channel Doc-2 §8 additive |
| `[ESC-MKT-AUDIT]` | OPEN | Advertisement/product-publish/showcase/custom-domain audit actions bound to nearest Doc-2 §9 action; never invented |

### 10.3 Doc-5D Coins Nothing
- Doc-5D realizes the wire face of the frozen Doc-4D contracts and **coins no** endpoint identity, HTTP status, header token, error class, `error_code`, permission slug, POLICY key, or event (`CHK-5A-121/154`; `Doc-4A §6.4/§20.1`). The realization-convention decisions (nested singletons; create-via-source-command for supersede; search/directory-as-read) are §0.4 transport disambiguations, contradicting nothing upstream. Carried `DD-*` / `[ESC-MKT-AUDIT]` are **escalated**, never invented (`CHK-5A-123`).
- **Binds:** `Doc-5A Appendix A`; `Doc-4A §6.4/§20.1`.

---

## Appendix A — Doc-5D Conformance Attestation

Per-band attestation of the realized M2 caller-facing surface (§4–§8, the 64 endpoints) against the Doc-5A **Appendix A** checklist. **PASS** = satisfied for every endpoint to which the check applies; **N/A** = precondition absent (reason cited). No `[B]`/`[M]` unresolved; no `[m]` deviation. One item is **conditional and content-freeze-gated** (`CHK-5A-121` / DD-6 — the `marketplace.*` POLICY-key registration patch), confirmed by the Freeze Readiness Audit.

| ID | Sev | Result | Evidence / scope |
|---|---|---|---|
| CHK-5A-010 | B | PASS | JSON/UTF-8 envelope — §4–§8 (`Doc-5A §3`) |
| CHK-5A-011 | M | PASS | Field names `snake_case`, from Doc-4D by pointer |
| CHK-5A-012 | B | N/A | No money field on the M2 wire — ad purchase is Billing-owned (bare UUID, DD-5); financial tier is an enum |
| CHK-5A-013 | M | PASS | `updated_at`/timestamps in §3 canonical form |
| CHK-5A-014 | B | PASS | `{id}`/identifiers = UUIDv7; not a mutation-path human ref |
| CHK-5A-015 | B | PASS | Enums/state names from Doc-2/Doc-4M; none invented |
| CHK-5A-020 | M | PASS | Single §4 success envelope |
| CHK-5A-021 | B | PASS | Only registered standard headers (`Authorization`, `Iv-Active-Organization`, `Idempotency-Key`, `If-Match`) |
| CHK-5A-022 | M | PASS | `Iv-` used only for registered tokens |
| CHK-5A-023 | B | PASS | No identity/role/permission/tenant-assertion header — authorization server-side (§3) |
| CHK-5A-024 | B | PASS | `Authorization` present on User/Admin ops; **absent on §8 Public reads** (anonymous — R2); `Iv-Active-Organization` on User ops only (§3.3) |
| CHK-5A-025 | M | PASS | `Idempotency-Key`/`If-Match` present exactly per §4–§7 |
| CHK-5A-030 | B | PASS | Every caller endpoint instantiates the §5.7 template (grouped section-level realization — Doc-5C/5E precedent) — §4–§8 |
| CHK-5A-031 | B | PASS | Method per §5.2 — create→POST/201, update→PATCH, state/domain→POST named, removal→DELETE, read→GET; no `PUT`. Nested-singleton / create-via-source (supersede) / search-as-read are §0.4 disambiguations, not method-rule deviations |
| CHK-5A-032 | B | PASS | Paths follow §5.3 grammar; nested/singleton/search per §0.4 (§5.3 silent) |
| CHK-5A-033 | B | PASS | State changes are named commands, never arbitrary field replacement |
| CHK-5A-034 | B | PASS | Input placement per §5.4; no prohibited field (actor/org-selection/authz/state/attribution never input) |
| CHK-5A-035 | M | PASS | Success `200`/`201` per §5.5; `supersede_spec_document` `201`+`Location` (new addressable revision); `add_catalog_favorite` `201`+`Location` (addressable resource — `remove_catalog_favorite` uses `{id}`); no `202` (System auto-transitions §9) |
| CHK-5A-036 | m | PASS | No abstract `get`/`update` verb in a path (named commands are compound operations) |
| CHK-5A-040 | B | PASS | class→status per §6.2 — §4–§8 |
| CHK-5A-041 | B | PASS | §6 canonical error envelope |
| CHK-5A-042 | B | PASS | **Top-level `reference_id` on every body-bearing response** (§4.7; `Doc-4A §22.1 C-05`; 204 exempt per PATCH-D4A-C05-204) |
| CHK-5A-043 | B | PASS | Codes within registered `marketplace_` namespace (`Doc-4A Appendix B.2`) |
| CHK-5A-044 | M | PASS | `retryable` per §6 class |
| CHK-5A-045 | M | N/A | No rate/quota surface declared on M2 (entitlement is Billing-owned, consumed — DD-5) |
| CHK-5A-050/051/052 | B | PASS | No-access vs not-found indistinguishable (status/body/timing) — §3.6/§8.2 (**R9 — see dedicated band below**) |
| CHK-5A-053 | B | PASS | Non-disclosed/banned/suspended/unpublished rows undetectable — uniform `404` collapse, no count leak (§8.2) |
| CHK-5A-060 | B | PASS | `Authorization` = authentication only (§3.1); §8 Public reads carry none |
| CHK-5A-061 | B | PASS | **`Iv-Active-Organization` server-validated, never client-trusted** (§3.3) on User ops |
| CHK-5A-062 | B | PASS | No authz assertion from client input (§3.5) |
| CHK-5A-063 | M | PASS | Actor-type (Public/User/Admin) + delegation resolved server-side via `check_permission` (§3.2/§3.5) |
| CHK-5A-070 | B | PASS | Cursor pagination on list reads (`list_*`, `search_catalog`, `vendor_directory`); no offset (§5.5/§7.4/§8.3) |
| CHK-5A-071 | M | PASS | Page-size bound via `marketplace.list_page_size_max` (Doc-3 §12.2, registered via Patch v1.2); DD-6 gate cleared |
| CHK-5A-072 | M | PASS | Filter/sort allowlist per Doc-4D; no protected-fact filter exposed (R9) |
| CHK-5A-073 | B | PASS | Counts/items exclude non-disclosed/unpublished/retired identically (R9 — no count leak) |
| CHK-5A-080 | B | PASS | `Idempotency-Key` on `required` mutations (§4–§7) |
| CHK-5A-081 | B | PASS | Replay → same result, no duplicate audit, **no re-emitted outbox event** (§9.2; `Doc-5A §9.7`) |
| CHK-5A-082 | M | PASS | `If-Match` (`updated_at`) on optimistic-concurrency commands (§4.5/§5.5/§6.4/§7.4) |
| CHK-5A-083 | m | PASS | Retry aligned to §6 `retryable` |
| CHK-5A-090…095 | B/M | N/A | All M2 caller contracts commit synchronously; no caller `202`. System auto-transitions are out-of-wire (§9) |
| CHK-5A-100/102 | B/M | N/A | No event-driven completion on the caller surface; results observed via reads |
| CHK-5A-101 | B | PASS | No external webhook/push surface (§9.3) |
| CHK-5A-103 | m | PASS | Event catalog/payloads owned by `Doc-2 §8`, not restated; emitted via outbox (§9.2) |
| CHK-5A-110 | B | PASS | No URL/query versioning; surface version via `Iv-Api-Version` (conditional, owned by `Doc-5A §12`) |
| CHK-5A-111/113 | M | N/A | Initial `v1`; no breaking change / deprecation |
| CHK-5A-112 | B | PASS | Contract identity stable; no `…V2` resource |
| CHK-5A-114 | B | PASS | No domain change expressed as a version bump |
| CHK-5A-120 | B | PASS | No upstream content restated; Doc-4D/Doc-4M/Doc-2 bound by pointer (error-class mapping pointer-attributed to `Doc-5A §6.2`) |
| CHK-5A-121 | B | **PASS** | Nothing coined — §10.3. The two `marketplace.*` POLICY keys are **registered in Doc-3 §12.2** via approved Patch v1.2 (Doc-4A §18.2 satisfied); DD-6 gate cleared |
| CHK-5A-122 | m | PASS | Transport choices marked `[realization convention]` with explicit keyword (§4.1/§5.6/§6.1/§8.1/§2.6) |
| CHK-5A-123 | B | PASS | Nested/singleton/source/search addressing surfaced; `DD-*`/`[ESC-MKT-AUDIT]` escalated, not invented |
| CHK-5A-124 | B | PASS | No invented webhook/push; no synchronous facade (§9.3) |
| CHK-5A-131 | B | PASS | `Owner-Module` = Module 2 on every endpoint |
| CHK-5A-132 | B | PASS | Each of the 64 traces to a frozen Doc-4D contract (PassB); the 7 out-of-wire are §9; total 71 unchanged |
| CHK-5A-133 | B | PASS | No undefined aggregate referenced (12 owned M2 entities per `Doc-4D §D4–§D7.3` aggregate inventory) |
| CHK-5A-134 | B | PASS | Contract identity stable under §12 |
| CHK-5A-141 | B | PASS | Resources only under the `marketplace` namespace |
| CHK-5A-142 | B | PASS | No foreign-aggregate read/mutate on the wire; cross-module = out-of-wire (§9) |
| CHK-5A-143 | B | PASS | Cross-module via approved channel (in-process service / outbox event), no foreign-namespace endpoint |
| CHK-5A-144 | B | PASS | No ownership contradiction; defers to Doc-4A Appendix A |
| CHK-5A-151 | B | PASS | `marketplace` route prefix in App B.1 (`Doc-2 §0.3`) |
| CHK-5A-152 | B | PASS | `marketplace_` code prefix in `Doc-4A Appendix B.2` |
| CHK-5A-153 | B | PASS | Standard-header tokens in App B.4, agree with §3/§4 |
| CHK-5A-154 | B | PASS | No self-assigned namespace/registry token |

### Dedicated attestation — R5 Projection Separation (the highest-risk M2 invariant) — NP-02

Attested against `CHK-5A-050…053` + structure R5 + §3.4 binding rule.

| Aspect | Result | Evidence |
|---|---|---|
| **Projection separation preserved — no public read exposes controlling-org-only data** | PASS | §3.4/§4.4/§5.4/§6.3/§7.3 — every read declares exactly one projection class; Public projection returns published-only |
| Draft and published are distinct wire surfaces, never merged in one response | PASS | §3.4/§6.2 — `publish_*`/`unpublish_*` drive the Doc-4M transition; no merged read |
| Every §4–§8 read declares its projection class (Public / Controlling-Org / Internal-Service) | PASS | per-read declarations in §4.4/§5.4/§6.3/§7.3/§8.2 |
| Internal-Service consumption never a caller surface | PASS | §3.4 dual-leg fence; `get_vendor_matching_attributes` + `get_spec_document` RFQ leg → §9 |

### Dedicated attestation — R9 Non-Disclosure on the public wire

Attested against `CHK-5A-050…053` + `Doc-4A §7.5` (`Doc-2 §0.2/§10.11`).

| Aspect | Result | Evidence |
|---|---|---|
| Banned / suspended / soft-deleted / unpublished / retired never surfaced on a Marketplace read | PASS | §8.2 — uniform `404` collapse; dropped from results + counts identically |
| Entitlement denial indistinguishable from absent | PASS | §7.3/§6.3 — Billing denial → `404`, not a distinguishable `403` |
| No blacklist / private-CRM / Buyer-Vendor-Status fact on any public read | PASS | §3.6/§8.2 — protected facts never on the wire |
| No matching/ranking/recommendation surface (DD-2 moat) | PASS | §8.2/§9.1 — discovery is catalog relevance only; matching is RFQ-owned |
| **No caller-visible matching / ranking / routing / eligibility surface exists on any M2 endpoint** | PASS | §8.2/§9.1 — `get_vendor_matching_attributes` is internal-service §9; `rebuild_vendor_matching_attributes` is System §9; M2 realizes no selection or ranking logic; RFQ engine owns all matching (`Doc-4E`; One Module, One Owner) |

**Attestation result:** all applicable `[B]`/`[M]` checks **PASS**; `[m]` PASS, no deviation. The R5 projection-separation and R9 non-disclosure invariants are attested PASS across all aspects. The former DD-6 content-freeze gate is **cleared** — both `marketplace.*` POLICY keys are registered in Doc-3 §12.2 via approved Patch v1.2 (CHK-5A-121/071 PASS). DD-7 (`claim_vendor_profile`) remains a tracked content-finalization blocker for that one contract, not a structural-conformance gate. **No other unresolved checklist item remains.**

---

*End of Doc-5D Content v1.0, Pass 3 (§7–§10 + Appendix A) — the final content pass. §7 advertising (entitlement-gated, System auto-transition out-of-wire) + favorites (membership-only); §8 public discovery (anonymous, the highest-risk R9 non-disclosure surface, no matching wire — DD-2); the 7 out-of-wire contracts, DD-1…DD-8 integrations, and emitted outbox events fenced **out-of-wire** (§9) with explicit protocol exclusion (REST/SSE/WS/webhook/GraphQL) + flag-and-halt; `reflect_vendor_ban_lift` blocked (DD-8 "DO NOT implement"); Appendix A all applicable `[B]`/`[M]` PASS with dedicated R5 projection-separation + R9 non-disclosure bands; the `marketplace.*` POLICY-key registration (DD-6) is the sole content-freeze-gated conditional; Doc-5D coins nothing. Doc-5D content (§0–§10 + Appendix A) is complete; next is the Doc-5D Freeze Readiness Audit — gated on the additive Doc-3 §12.2 `marketplace.*` registration patch — conforming to `Doc-5D_Structure_v1.0_FROZEN.md`.*
