# Doc-4D — Pass-B — Part E: Discovery & Read-Model (§D6) + Event Consumers

| Field | Value |
|---|---|
| Part | E of E — hardened contract blocks for Pass-A §D6 (Discovery) + the ban event-consumers |
| Master | `Doc-4D_Content_v1.0_PassB.md` (§B conventions govern; defaults cited as §B.x) |
| Status | DRAFT — ready for Independent Hard Review |
| Conforms To | Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0, Doc-4B v1.0, Doc-4C v1.0, Doc-4D_Structure_v1.0_FROZEN (all FROZEN); Pass-A (closed) |
| Scope | Public discovery reads; `vendor_matching_attributes` read-model expose + rebuild (**DD-2** — Marketplace owns attributes, RFQ owns matching; **no routing/ranking/selection/matching logic authored**); ban consumers (`reflect_vendor_ban` — DD-3; `reflect_vendor_ban_lift` — DD-8 conditional/non-implementable). All defaults per the master **§B**. |

Public reads honor the **non-disclosure invariant** (§7.5) and **soft-delete/retire/ban exclusion** (Doc-2 §0.2). All defaults per the master **§B**.

---

#### `marketplace.search_catalog.v1` · `marketplace.list_vendor_directory.v1` · `marketplace.get_public_vendor_profile.v1` — Public Discovery Reads · 21.3 Query · Actor: public

- **Authorization (§B.9):** public read; no slug; no org context required; non-disclosure (§7.5) and soft-delete/retire/ban exclusion (§0.2) enforced.
- **Firewall:** §B.11 — none (read of public, Marketplace-owned presentation; `TrustIndicators` surfaced are a Trust read-model, DD-1).
- **Request Contract (per op):**
  - `search_catalog`: `query : string : optional`; `filters : object{ category_id : uuid, country/division/district/industrial_zone : enum, capability : enum, vendor_type_preset : enum } : optional`; `target_type : enum(vendor_profile|product|category) : optional`; `cursor : string : optional`; `page_size : integer : optional`.
  - `list_vendor_directory`: `filters : object{ category_id, geography, capability } : optional`; `cursor`/`page_size`.
  - `get_public_vendor_profile`: `vendor_profile_id : uuid : optional` XOR `human_ref : string : optional` (one required).
- **Response Contract (§B.3):** `search_catalog`/`list_vendor_directory` → `{ items : list<public_projection>, page_info } + reference_id`; `get_public_vendor_profile` → `{ vendor_profile : public_projection (name, human_ref, capability_flags, geography, categories, public TrustIndicators [Trust read-model, DD-1], published profile-experience) } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX (filter/enum/pagination types; one identifier for the single read) → CONTEXT (public caller) → AUTHZ (public) → SCOPE (published/non-excluded rows only; `NOT_FOUND` collapse for the single read).
- **Error Register (§B.5):** `marketplace_discovery_invalid_input` (VALIDATION, no — bad filter/cursor), `marketplace_vendor_not_found` (NOT_FOUND, no — single read). User-facing: VALIDATION → correct input; NOT_FOUND → uniform "not available" (§7.5).
- **State Effects:** none (read). **Idempotency (§B.7):** not-applicable.
- **Query semantics (§B.6):** **Filters** = allowlisted hard attributes (category, geography, capability, vendor_type_preset); **Sort** = relevance/`name` with tiebreaker `id` (total order); **Pagination** = opaque cursor, `page_size` bounded by intended `marketplace.*` key **[DD-6]**; **Projection** = published/public fields only; **Visibility** = soft-deleted/retired/banned excluded (§0.2); blacklist/private-CRM/Buyer-Vendor-Status facts never exposed (§7.5).
- **Audit (§B.8):** no (reads). **Events:** none.
- **Reference Validation (§B.10):** single-read identifier existence; filter `category_id` validated against `categories`.
- **AI-Agent Notes:** these are **discovery reads, not matching** — filtering returns catalog rows; **ranking/scoring/eligibility-gating/supplier-selection are RFQ's (DD-2)** and are not authored here; never expose a protected fact (§7.5); exclude soft-deleted/retired/banned from results; `TrustIndicators` are read-through from Trust (DD-1).

#### `marketplace.get_vendor_matching_attributes.v1` — Expose Matching Read-Model · 21.3 Query (internal-service) · Actor: internal-service · *(DD-2)*

- **Authorization (§B.9):** internal-service caller-context (consumed by RFQ / Doc-4E); no tenant slug; not a public surface.
- **Firewall:** §B.11 — exposes the **derived** read-model projecting trust/performance/verified-tier bands + Marketplace-owned capability/geo/category/declared-tier; **no matching/eligibility computed** (DD-2).
- **Request Contract:** `vendor_profile_ids : list<uuid> : required` (read attributes for the supplied profiles; bulk-by-id) — *(no RFQ-side filtering/selection performed here; the candidate set is determined by RFQ's matching engine — DD-2)*.
- **Response Contract (§B.3):** `{ items : list<vendor_matching_attributes> (denormalized: capability flags, tier, geography, category sets, trust band, performance band, probation flag — Doc-2 §10.3) } + reference_id`.
- **Validation Matrix (§B.4, query):** SYNTAX (`vendor_profile_ids` uuids; bounded count) → CONTEXT (internal-service caller) → AUTHZ (entitled consumer) → SCOPE (existence; per-id projection).
- **Error Register (§B.5):** `marketplace_attr_invalid_input` (VALIDATION, no), `marketplace_attr_not_found` (NOT_FOUND, no — unknown profile id). User-facing: internal; transient classes retry.
- **State Effects:** none (read). **Idempotency (§B.7):** not-applicable.
- **Query semantics (§B.6):** bulk-by-id read; `page_size` bound **[DD-6]** if paginated; projection = the attribute row; **no ranking/scoring exposed** (DD-2).
- **Audit (§B.8):** no (read). **Events:** none.
- **Reference Validation (§B.10):** `vendor_profile_ids` existence.
- **AI-Agent Notes:** **Marketplace owns the attributes; RFQ owns the matching** (DD-2) — this is a **projection read**, never a "find matching vendors for RFQ X" query; do not author routing/ranking/eligibility/selection here; the candidate-set decision is RFQ's.

#### `marketplace.rebuild_vendor_matching_attributes.v1` — Rebuild Matching Read-Model *(internal / event consumer)* · 21.5 System · Actor: System · *(DD-2)*

- **Authorization (§B.9):** System; platform scope; not user-invocable.
- **Firewall:** §B.11 — **projects** trust/performance/verified-tier signals (Trust-owned) + Marketplace-owned capability/geo/category/declared-tier into the derived read-model; **does not compute matching/eligibility, does not mutate any signal**; no paid plan influences it (§4B / DD-2).
- **Trigger / inputs:** (a) consumed Trust events `TrustScoreUpdated`, `PerformanceScoreUpdated`, `VendorTierChanged[verified]` (Doc-2 §8); (b) internal Marketplace changes (capability/geography/category-assignment/capacity/declared-tier — from Parts A/B commands). Inputs are the event payload / changed `vendor_profile_id`.
- **Response Contract:** `Response: none` (21.5; §B.3).
- **Validation Matrix (§B.4):** SYNTAX (payload/trigger well-formed) → CONTEXT (System; platform scope, §5.2) → REFERENCE (`vendor_profile_id` exists) → BUSINESS (recompute the denormalized attribute row from authoritative marketplace/trust sources; idempotent).
- **Error Register (internal, §B.5):** `marketplace_attr_rebuild_failed` (DEPENDENCY, yes — retryable), `marketplace_attr_payload_invalid` (VALIDATION, no).
- **State Effects (§13):** `vendor_matching_attributes` rebuilt (derived; hard-refreshable; Doc-2 §10.3 — "rebuilt").
- **Idempotency (§B.7):** required (platform scope) — dedup source = the trigger identity / current source-of-truth state; rebuild is naturally idempotent (recompute to the same result).
- **Audit (§B.8):** no — derived-read-model rebuild is not a Doc-2 §9 business action.
- **Events:** consumes Trust `TrustScoreUpdated`/`PerformanceScoreUpdated`/`VendorTierChanged[verified]` (§8); emits none. **Integration:** consume (delivery contracts are Trust's per §4.4); **expose** the result via `get_vendor_matching_attributes` to RFQ.
- **Reference Validation (§B.10):** `vendor_profile_id` existence.
- **AI-Agent Notes:** rebuilds the **projection only** — it reads trust/performance/verified-tier bands and Marketplace-owned attributes and denormalizes them; it **never scores, ranks, gates eligibility, or selects** (that is RFQ's matching engine — DD-2); idempotent recompute; one of the two `VendorVerified`-adjacent consumers is handled in Part A (`reflect_verified_claim_status`), this handles score/tier-driven rebuilds (N-01 — independent subscriptions; event flow unchanged).

#### `marketplace.reflect_vendor_ban.v1` — Reflect Vendor Ban *(event consumer)* · 21.5 System · Actor: System · *(DD-3)*

- **Authorization (§B.9):** System; platform scope; not user-invocable.
- **Trigger / inputs:** Admin `VendorBanned` (Doc-2 §8) — inputs are the event payload (`vendor_profile_id`).
- **Response Contract:** `Response: none` (21.5).
- **Validation Matrix (§B.4):** SYNTAX (payload) → CONTEXT (System; §5.2) → STATE (Doc-2 §5.3 status `active → banned`; literal edge) → BUSINESS (idempotent; reflect Admin's ban decision).
- **Error Register (internal, §B.5):** `marketplace_vendor_state_invalid` (STATE, no), `marketplace_vendor_payload_invalid` (VALIDATION, no).
- **State Effects (§13):** Doc-2 §5.3 status `active → banned` (reflected; no edge invented). Banned profiles are excluded from discovery (§B.6) and the matching read-model.
- **Idempotency (§B.7):** required (platform scope) — dedup source = target row already `banned`.
- **Audit (§B.8):** yes; Vendor-profile "ban/lift" (ban direction) by pointer; attribution system; Correlation phase2-origin.
- **Events:** consumes Admin `VendorBanned` (§8); emits none. **Integration:** consume (delivery contract is Admin's per §4.4 — **DD-3**); `ban_actions` is Admin-owned.
- **Reference Validation (§B.10):** `vendor_profile_id` existence.
- **AI-Agent Notes:** Marketplace **reflects** the Admin ban decision (DD-3) — it never authors the ban (`ban_actions` is Admin/Module 8); idempotent; ensure banned profiles drop out of discovery and the matching read-model.

#### `marketplace.reflect_vendor_ban_lift.v1` — Reflect Vendor Ban-Lift *(conditional placeholder — **[DD-8]**; non-implementable until resolved)* · 21.5 System · Actor: System

- **Authorization (§B.9):** System; platform scope; not user-invocable.
- **Trigger / inputs:** a **future** Admin ban-lift event — **Doc-2 §8 declares no `VendorBanLifted` event ([DD-8])**; this contract is **non-implementable until that event is declared** (or the Doc-2 custodian confirms the lift is an Admin direct-write to `vendor_profiles.status`). **No event coined; no local resolution.**
- **Response Contract:** `Response: none` (21.5). *(Payload/validation/error/idempotency detail are **not finalized** — blocked on DD-8.)*
- **Validation Matrix (§B.4):** would be SYNTAX → CONTEXT (System) → STATE (Doc-2 §5.3 status `banned → active`; literal edge — **no edge invented**) → BUSINESS (idempotent reflect) — **non-final, carried under [DD-8]**.
- **Error Register (§B.5):** **deferred — carried under [DD-8]** (would parallel `reflect_vendor_ban`; not finalized until the lift event exists).
- **State Effects (§13):** would be Doc-2 §5.3 status `banned → active` (the literal lift edge) — **not exercised until DD-8 resolves**.
- **Idempotency (§B.7):** would be platform-scope idempotent — **carried under [DD-8]**.
- **Audit (§B.8):** would bind Doc-2 §9 Vendor-profile "ban/lift" (lift direction), attribution system — **carrier pending [DD-8]**.
- **Events:** would consume a future Admin ban-lift event — **none exists in Doc-2 §8 ([DD-8])**. **Integration:** consume (delivery would be Admin's per §4.4); contingent on DD-8.
- **Reference Validation (§B.10):** `vendor_profile_id` existence — **on resolution**.
- **AI-Agent Notes:** **DO NOT implement** — blocked on **DD-8**; **do not coin `VendorBanLifted`**, do not invent a lift event or an Admin direct-write contract, do not resolve DD-8 locally; until DD-8 resolves, an Admin-lifted ban leaves `vendor_profiles.status = banned` in Marketplace's projection (the carried gap), surfaced for the Doc-2 §8 additive channel.

---

*End of Doc-4D Pass-B — Part E (Discovery & Read-Model §D6 + event consumers). Hardened per the master §B. **DD-2** preserved (Marketplace owns the `vendor_matching_attributes` read-model; RFQ owns matching — no routing/ranking/selection/matching logic authored); **DD-3** ban reflected (Admin-owned decision); **DD-8** `reflect_vendor_ban_lift` carried as a conditional, non-implementable placeholder (no `VendorBanLifted` coined). No entity/event/slug/audit-action/POLICY-key/template invented; non-disclosure (§7.5) and soft-delete/ban exclusion enforced. Ready for Independent Hard Review.*
