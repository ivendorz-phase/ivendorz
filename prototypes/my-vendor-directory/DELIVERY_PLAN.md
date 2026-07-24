# My Vendor Directory — Delivery Plan (the Saved-Vendors fold)

**Non-authoritative planning artifact. Coins nothing.** Design target = the clickable prototype in
this folder (`index.html`). Frozen backing = **M4 BC-OPS-1** (Doc-2 §3.5/§10.5 · Doc-4F §F4.1–F4.9 ·
Doc-6F FROZEN). Every phase binds frozen entities/contracts **by pointer**; it invents no schema,
contract, event, or escalation. On any conflict with a frozen doc → **Flag-and-Halt** (CLAUDE.md §11).

**Changelog**
- **v1.1 — 2026-07-23** — Review-A fold (verdict *APPROVE WITH PLAN PATCH*): applied MAJOR-1
  (projection rule), MAJOR-2 (paste ≠ bulk import → new **D3**), MAJOR-3 (D1(a) reframed interim +
  escalation), MINOR-1..4. Folded owner design-chat directives: **D3** Paste Vendor List, **D4**
  directory authority model, **D5** unified offerings + category eligibility. Anchors re-verified
  against Doc-4F PassA + Doc-4F_PassB_Part1_BC-OPS-1 + Doc-2 v1.0.2 §7 + Doc-4D PassA. All new
  escalations are **DRAFT, pending Human Board** — none registered in `esc_registry.md` yet.
- v1.0 — initial fold plan.

---

## 0. What this delivers

Turn the reserved, contract-less **Saved Vendors** page into **My Vendor Directory** — the buyer's
private vendor list that unifies marketplace-linked and off-platform vendors and absorbs the already
shipped Vendor CRM (P-BUY-26/27). "Saved Vendors" **is** ⭐ Preferred (`operations.vendor_favorites`),
resolved by the 2026-07-16 owner fold of `ESC-BUY-SAVED-VENDORS`. No new module, contract, or signal.

**The directory is a read projection over two frozen aggregates** (Doc-4F §F4), not a new aggregate
and not a one-to-one co-creation of both roots *(MAJOR-1)*:

1. **Private Vendor Record** — root `private_vendor_records` (+ `private_vendor_notes`,
   `private_vendor_ratings`), carrying the derived `link_status`. Backs buyer-maintained private
   vendors.
2. **Buyer–Supplier Relationship** — root `buyer_supplier_relationships`, keyed
   `UNIQUE(organization_id, vendor_profile_id)` (+ `buyer_vendor_statuses`, `vendor_favorites`).
   **Marketplace-linked only** (Doc-4F_PassB_Part1 :39, :477).

Where a frozen link exists (`link_status = linked`), the presentation **composes** both sources at
read time. It must never create duplicate records, copy one root's data into the other, or assume
both roots always exist for a given row.

---

## 1. Frozen-vs-Gated ledger (what is buildable, what is blocked)

| Capability | Status | Anchor |
|---|---|---|
| ⭐ Preferred flag (set/clear) | **FROZEN** | Doc-4F §F4.6 `ops.set/clear_vendor_favorite.v1` |
| Approved / Conditional / Blacklisted status (+ append-only history) | **FROZEN** | Doc-4F §F4.5 `ops.set/clear_buyer_vendor_status.v1` |
| Private vendor CRUD (create / edit / archive) | **FROZEN** | Doc-4F §F4.1–F4.3 |
| Private notes + rating | **FROZEN** | Doc-4F §F4.4 |
| Private↔public link (link-not-merge; Admin suggests, Ops confirms) | **FROZEN** | Doc-4F §F4.7; Doc-2 A-03 |
| Reads: get / list private vendors + get relationship | **FROZEN** | Doc-4F §F4.9 (list takes **no** free-text query) |
| RFQ-routing status read-seam (M3 consumes service-only) | **FROZEN** | Doc-4F §F4.8 |
| M2 taxonomy read (for category suggestion/validation) | **FROZEN** | Doc-4D §D7 `marketplace.list_categories.v1` |
| **Clipboard paste → editable review grid** (parse/map/validate/preview, client-side) | **PRESENTATION — buildable now** | no persistence contract coined; see **D3** |
| Per-row persistence via the frozen single-create | **CONDITIONAL — Phase 3** | `ops.create_private_vendor.v1` only if per-row limits/idempotency/retry are contract-safe (D3) |
| Confirmed **M2 category identity** persisted on a private record | **GATED** | `ESC-VENDIR-FIELDS` (R5) — `details_jsonb` does **not** independently authorize a cross-module category ref (D5) |
| External-vendor **field set** first-class vs `details_jsonb`; logo | **GATED** | `ESC-VENDIR-FIELDS` (R5) |
| **Dedicated batch import** / Excel-CSV upload / Word-PDF extraction / bulk export / import-job history | **GATED** | `ESC-VENDIR-FIELDS` (R5) — the clipboard flow above is **not** this (D3) |
| **Pending Invitation** section (buyer invite-to-platform) | **GATED / hidden from prod IA** | `ESC-VENDIR-INVITE` (R4) — no submit contract exists (MINOR-1) |
| Off-platform engagement/document recording (Documents tab) | **GATED** | `ESC-VENDIR-OFFPLATFORM` (R3) |
| ⭐/status classification for an **unlinked** private vendor | **GATED (interim: disabled)** | new draft `ESC-VENDIR-PRIVATE-RELATIONSHIP-CLASSIFICATION` (D1/MAJOR-3) |
| Restrict **removal-like** actions (clear ⭐ / archive / unlink) to non-ordinary members | **GATED** | Doc-2 §7 additive slug/role ruling (D4) |
| Anonymous cross-buyer "Discovered Vendor" aggregation | **GATED / likely-REJECT** | `ESC-VENDIR-DISCOVERY` (R2) — conflicts Inv #6/#11; Flag-and-Halt |

**Search posture (MINOR-2).** Phases 1–3 have **no server-side free-text search**: the frozen list
read `ops.list_private_vendors.v1` takes no query filter. The list offers view tabs + refine chips
only. Any client-side filter operates over the **currently loaded page** and must never be presented
as directory-wide search. A future directory-wide search requires an **additive M4 list/search
contract or an approved read-model enhancement** — not built here.

---

## 2. Current repo state (the starting line)

- `/buy/vendors`, `/buy/vendors/[id]`, `/buy/vendors/new` — **do not exist** (greenfield).
- `app/(app)/(workspace)/buy/crm/page.tsx` + `[recordId]` — **live** (the shipped Vendor CRM, P-BUY-26/27).
- `app/(app)/(workspace)/buy/saved-vendors/page.tsx` — **`ImplementationPendingView` stub**.
- Supporting `buy/_components/` view-models (`crm-list-view-models.ts`, `crm-detail-view-models.ts`,
  `view-models.ts`) landed under FE-BUY-11 but the surface was **scaffolded, not closed**.
- **Owed governance hygiene:** `esc_registry.md:175` still reads "no vendor-saving concept" — stale,
  superseded by the fold (the registry contradicts itself at `:166`, where `operations.vendor_favorites`
  is listed **frozen**). Rewrite is Phase-0, human-gated.

---

## 3. Design decisions (adjudications, not code — Raise ≠ Accept, §13)

### D1 — ⭐/status on an *unlinked* private vendor — **INTERIM ruling (a), accepted 2026-07-23**

The frozen favorite and status contracts (§F4.5/§F4.6) accept only a marketplace `vendor_profile_id`
(REFERENCE-checked against Marketplace) **or** an existing `buyer_supplier_relationship_id`, and the
relationship aggregate is keyed on `vendor_profile_id` (Doc-4F_PassB_Part1 :39). The `is_favorite`
list filter therefore **never returns unlinked records** (:477). So a purely private vendor
(`link_status = none`) can hold notes + ratings but **cannot** be ⭐ Preferred or Approved/Blacklisted
until it is linked.

- **(a) Honor the constraint — INTERIM, adopted (zero frozen change):** for unlinked private records,
  disable the ⭐ star + status controls; offer "Link to a marketplace profile to prefer / set status."
  Notes + ratings stay available. Prototype demo data corrected to match (no unlinked vendor renders
  ⭐/status). **This is an interim constraint, not the final product design.**
- **Target (owner/Review-A):** buyer-private classification is a normal industrial-procurement need
  that must eventually cover **off-platform** vendors too — a buyer should be able to privately mark
  an off-platform vendor Preferred / Approved / Conditional / Blacklisted. Restricting buyer
  governance to post-join vendors is a product mismatch to be resolved, not accepted as final.
- **Escalation (DRAFT, pending Human Board):** `ESC-VENDIR-PRIVATE-RELATIONSHIP-CLASSIFICATION` —
  the Board rules whether (i) `buyer_supplier_relationships` (or favorites/statuses) may key on a
  `private_vendor_record_id` as well, or (ii) a separate M4-owned classification mechanism applies to
  private vendor records. **Kept distinct from `ESC-VENDIR-OFFPLATFORM` (R3)** — documents/off-platform
  history are a separate concern and must not silently absorb relationship classification.
- **(b) not self-resolvable:** extending the aggregate schema is a **rank-0 frozen-schema change →
  Flag-and-Halt, human/Board only.** Do not build (b) without a ruling.

### D2 — External-vendor create-form scope (gated on R5)

Only `name`/`email`/`phone` are frozen create columns (`ops.create_private_vendor.v1`; source enum
`manual|email_list|excel`). Contact-person, designation, WhatsApp, website, city/district, categories,
notes are `details_jsonb`-interim until `ESC-VENDIR-FIELDS`. The presentation renders them tagged
GATED-R5.x; first-class persistence + import wait on the ruling. **Category identity is a stricter
case — see the D5 persistence boundary.**

### D3 — Clipboard Paste vs Bulk Import (owner directive 2026-07-23 — additive; Review-A MAJOR-2)

Clipboard-assisted multi-row entry is **not equivalent to bulk import** and must not be labelled or
governed as one. The two are separated:

**Presentation-only, buildable now (coins no persistence contract):**
1. Accept tabular clipboard content from Excel / Google Sheets / Word / TSV / CSV.
2. Parse locally into an editable preview grid.
3. Suggest column mapping (buyer corrects — "parser suggests; Business Operations decides").
4. Validate rows deterministically.
5. Detect obvious duplicates + marketplace matches as **advisory only**.
6. Require explicit buyer confirmation.

**Persistence is separately governed:**
- The existing single-record create (`ops.create_private_vendor.v1`) may be used per-row **only after**
  confirming per-row creation, a safe UI row cap, controlled concurrency, explicit per-row outcome,
  and retry-does-not-duplicate are all contract-safe. Pasted rows carry the frozen `source = excel`
  enum value (Doc-4F_PassB_Part1 :36 — **no new field**).
- **No atomicity, batch semantics, or import-job behavior may be claimed.** UI label is
  **"Paste multiple vendors"**, never "Import". Any row cap / concurrency number shown is
  **illustrative**, pending a real contract/POLICY limit — invent no authoritative number.
- Dedicated batch create, file upload, Word/PDF extraction, import-job history, and bulk export
  remain **GATED** under `ESC-VENDIR-FIELDS` (R5) or a specific import-contract ruling.

**Column classes for the mapper:** frozen-direct (`name`/`email`/`phone`) · `details_jsonb`-interim
GATED-R5.x (contact person, designation, WhatsApp, website, city/district, notes, tags, stage,
follow-up) · **category identity** (special — D5 boundary) · **never-importable** (verification, trust /
performance scores, profile ownership, public content).

**Reconciliations (recorded so a later review doesn't re-open them):**
- The owner-chat "Preferred" paste column is constrained by **D1 interim**: ⭐ is offered only on a row
  the buyer explicitly matches **and links** to a marketplace profile during the resolve step;
  unlinked created rows get no Preferred affordance.
- The R5 interim "no import/export affordance" reading is refined by the 2026-07-23 owner approval:
  clipboard-assisted entry that feeds the frozen single-create is **not** the gated bulk import. The
  `esc_registry.md` annotation update reflecting this is drafted for Phase 0 (human-gated).

### D4 — Directory authority model (owner directive 2026-07-23 — BINDING)

Stated exactly as ruled:
1. **Any active organization member can add a vendor** — via **two separate journeys**:
   **(A) private-vendor creation** (`ops.create_private_vendor.v1`, creates a directory record) and
   **(B) marketplace-vendor saving**, where "Save vendor" is the friendly presentation label for the
   single `ops.set_vendor_favorite.v1` action (creates-or-reuses the relationship container). No
   Save-then-Prefer sequence; the two journeys are never conflated *(MINOR-1 wording)*.
2. **No ordinary member can:** remove from Preferred · archive a private vendor · unlink a vendor
   relationship.
3. **No user can hard-delete a vendor** through My Vendor Directory (frozen archive lifecycle only).

Clear-Preferred requires a **confirmation dialog**; on success the vendor leaves only the Preferred
projection and remains in other applicable views. The FE mints **no** permission names; enforcement
binds frozen contract permissions in the application layer.

**Conformance ledger (conclusions, with pointers):**
- **Frozen-true today:** add-is-open — Doc-2 v1.0.2 §7 grants `can_manage_private_vendors` to
  **(O,D,M,F)** = all four org roles (:623); `can_manage_vendor_status` to **(O,D,M)** (:624).
  No-hard-delete — no delete contract exists; frozen archive lifecycle only; clear-⭐ = idempotent
  flag clear with the record remaining (Doc-4F_PassB_Part1 :334). Confirmation dialog = pure UX.
  Per-control slug pointers: ⭐ / archive / link → `can_manage_private_vendors`; status →
  `can_manage_vendor_status`.
- **Needs a Doc-2 §7 additive ruling:** restricting removal-like actions (clear ⭐ / archive / unlink)
  to non-ordinary members — today the **same all-roles slug** governs create *and* those actions, so
  the asymmetry is not expressible as frozen permissions stand. Draft a Doc-2 §7 additive (a distinct
  lifecycle/removal slug **or** a role threshold on the removal commands; reuse the carried
  `[ESC-OPS-SLUG]` lane or a sibling). Precedent: :624 already expresses role asymmetry
  (O,D,M vs O,D,M,F), so this is a natural additive extension. **Exact threshold = owner/Board — the
  plan invents none.** Phase-3 wiring enforces the asymmetry only after the ruling; Phase-1
  presentation renders removal controls as *privileged affordances* without claiming enforcement.

### D5 — Unified offerings presentation + category eligibility (owner directive 2026-07-23 — BINDING)

**(1) Unified presentation.** ONE shared component renders up to **10** products/services for both
vendor kinds.
- **Platform-linked:** offerings are composed from the **current M2 public profile at read time**
  (deterministic Marketplace ordering, max 10, link to the full public portfolio). **Saving a
  platform vendor creates or reuses the M4 buyer–supplier relationship, but does not create a
  duplicate private-vendor record or copy M2 products, services, categories, or public profile
  content into M4** *(MINOR-2 — Content ≠ Presentation preserved).* Matching/saving never copies
  Marketplace content into a private record.
- **Private:** offerings are entered/maintained privately by the buyer, combined max 10. Offering
  **text** may use the authorized `details_jsonb` interim envelope where permitted (GATED-R5.x);
  category **identity** follows the persistence boundary below.
- **Provenance is always visible:** `Vendor profile` (M2-authored) · `Buyer maintained` (M4 private) ·
  `Text only`.
- **Labeling (MINOR-3):** for platform-linked vendors the header is **"Products & Services · Source:
  Vendor profile"** — "Core" is used **only** if the frozen Marketplace contract exposes an
  authoritative core/featured designation (verify at wiring; default = no "Core"). For private
  vendors, **"Core Products & Services"** is correct because the buyer explicitly curates the ≤10 list.

**(2) Category eligibility.** Each private-vendor offering resolves as either **category-matched**
(buyer-**confirmed** against an active M2 system category — the system may *suggest*, never silently
fuzzy-bind) or **text-only** (buyer-private description, no system-category identity). A private
vendor is **eligible to be saved only when** required identity fields are valid **and** at least one
offering has a buyer-confirmed active system-category match. Text-only items never satisfy the
requirement; while unmet, Save stays disabled with an explanation. Matched + text-only together may
not exceed 10, and the system must **never silently truncate** pasted values. M2 owns the taxonomy;
M4 validates references through an authorized M2 contract (`marketplace.list_categories.v1`), never
duplicating category records or introducing cross-module FKs. Multi-row paste: eligibility is
evaluated **per vendor** — eligible rows may proceed while unmatched rows remain in the grid.

**Category matching persistence boundary (owner ruling — verbatim intent):**
> The prototype may model buyer-confirmed category matching and apply the owner-approved
> save-eligibility rule for design validation. Production persistence of confirmed M2 category
> identifiers, assignments, or match evidence remains **GATED under ESC-VENDIR-FIELDS R5**. The
> `details_jsonb` envelope does **not** independently authorize storage of a cross-module category
> reference. Before governed Phase-3 wiring, the Board must rule the persistence shape and validation
> contract. Until then:
> - text-only buyer descriptions may use the already-authorized field envelope where permitted;
> - confirmed category matching remains **prototype-only**;
> - production Save eligibility based on a confirmed category is **not wired**;
> - **no M2 category ID is persisted in M4.**

(The ≥1-confirmed-category save rule is **owner product policy layered above** the frozen create
contract — which requires only `name`+`source` — recorded here so reviews don't read it as
FE-invented.)

**(3) UX rules (15, deterministic).** Match confidence shown (High-confidence / Possible / No match)
but never auto-confirmed; batch "apply <category> to N identical items" (explicit, reversible);
original pasted text always preserved beside the matched category; **one** clear row state (Ready /
Needs category review / Possible duplicate / Missing required information / Blocked / Skipped) with
detail in a side panel; partial batch save ("Save N eligible vendors" — unresolved rows remain);
explicit duplicate decisions (Use existing / Link to platform vendor / Create separate — with a
high-similarity acknowledgment / Skip; never auto-merge); source badges everywhere (Platform vendor /
Private vendor / Linked private vendor); 10-item meter visible early ("6 of 10", excess highlighted,
never truncated, Save disabled until resolved); category search + parent→child hierarchy browse +
recent + "frequently used by this organization" (org-private convenience only — never affects
Marketplace ranking or public category governance); "Keep as text only" action with an explicit
warning; disabled Save always lists its reasons; local-only draft recovery (nav-away warning + refresh
restore — no server-draft claim without a contract); **private-vendor creation and marketplace-vendor
saving stay separate journeys** (create-directory-record vs the single "Save vendor" favorite action;
for a private unlinked vendor Preferred is unavailable under D1 interim; a pasted row explicitly
matched **and linked** to a marketplace profile may take "Save vendor" = the Preferred action);
progressive disclosure (first screen: company name, phone/email, offerings + category match; the rest
under "Add more company information").

**(4) Minimum save rule.** Required = company name + ≥1 confirmed category. A contact method is **not**
required to create, yielding two **derived display** states — `Saved` vs `Operationally ready`
(e.g. "Saved · Missing phone or email"). These are presentation-derived, never a persisted lifecycle
field.

---

## 4. Phased delivery

### Phase 0 — Registry reconciliation *(governance, non-code; do first; human-gated)*
- Rewrite the stale `esc_registry.md:175` disposition for `ESC-BUY-SAVED-VENDORS` → **resolved-by-fold
  into ⭐ Preferred (2026-07-16)**; note FE-BUY-11 over-claimed it as recorded.
- Draft/register the new escalations: `ESC-VENDIR-PRIVATE-RELATIONSHIP-CLASSIFICATION` (D1), the
  Doc-2 §7 removal-authority additive (D4). Annotate `ESC-VENDIR-FIELDS` with the D3 clipboard-vs-bulk
  refinement and the D5 category-persistence boundary.
- **Gate:** human approval (the registry is a governance artifact). Blocks nothing downstream but stops
  stale/over-broad claims propagating. *(Drafted inside this plan; application to `esc_registry.md`
  stays human-gated — this session writes no registry edits.)*

### Phase 1 — FE fold / IA re-home *(presentation-only; buildable NOW under the buyer-FE authorization)*
- Build `/buy/vendors` = **My Vendor Directory**: the 5 working views (All / Marketplace / Private /
  ⭐ Preferred / Archived), status **filter chips** (never nav), the no-free-text-search list, and the
  `/buy/vendors/[id]` detail (profile · notes · rating · status history · gated Documents) — the
  prototype's IA. The unified **offerings + category** subsystem (D5) and the **3-method Add Vendor**
  journey incl. **Paste Vendor List** (D3) are part of this presentation slice.
- **Pending Invitation is hidden from the production IA** *(MINOR-1)* — R4-gated with no submit
  contract; not rendered as an operational-looking section. (The prototype shows it only inside
  review-notes chrome for IA completeness.)
- **Redirects:**
  - `/buy/crm` → `/buy/vendors` (308, query-forward);
  - `/buy/crm/[recordId]` → `/buy/vendors/[id]` (308 — permitted because the record-id namespace is
    preserved 1:1 in the fold; if any id can't be preserved deterministically, use a compatibility
    route that resolves the legacy id before redirecting) *(MINOR-3)*;
  - `/buy/saved-vendors` → `/buy/vendors?view=preferred`.
  Retire the two stubs; repoint nav VM + dashboard quick-actions; fix breadcrumbs.
- Rename public **"Vendor Directory" → "Discover Vendors"** (M2 discovery) to kill the label collision.
- **Honest pre-wiring state — no fabricated rows:** the governed page renders empty/placeholder until
  Phase 3, never the prototype's demo rows (mirror the GATE-4 buyer-relationships build).
- Apply **D1(a)** UX (⭐/status disabled for unlinked private records) and the **D4** affordance model
  (removal controls presented as privileged; no delete control anywhere) — presentation only, no
  enforcement claim.
- **Gate:** design freeze (prototype approved) + FE build authorization. **Out:** any read/write wiring.

### Phase 2 — Backend realization (BC-OPS-1) *(GATED on Wave 5 — do NOT build now)*
- **Sequencing (binding):** **M4 is Wave 5** (Build_Roadmap §4; program is at Wave 3). Wave 4 (M3)
  consumes only the §F4.8 read-seam service-only. **BC-OPS-1 backend does not build out of sequence.**
- When Wave 5 opens: realize Doc-6F physical schema (Prisma multiSchema) for `private_vendor_records`
  (+notes/ratings), `buyer_supplier_relationships` (+`buyer_vendor_statuses`/`vendor_favorites`), the
  link column-set, and the `admin.link_suggestions` read seam; implement §F4.1–F4.9; AuthZ
  `can_manage_private_vendors` + `can_manage_vendor_status` (+ any D4 removal-slug the Board rules);
  RLS `app.active_org`; audit `[ESC-OPS-AUDIT]`; append-only status history (Inv #8); non-disclosure
  (Inv #11) at every layer.
- **Gate:** M4 wave entry + Doc-6F/migration review (8D green) per Roadmap.

### Phase 3 — FE wiring *(gated on Phase 2)*
- Swap presentation for live reads/writes: list→`list_private_vendors`, detail→`get_private_vendor` /
  `get_buyer_supplier_relationship`, ⭐→`set/clear_vendor_favorite`, status→`set/clear_buyer_vendor_status`,
  rating→`set_private_vendor_rating`, notes→`add_private_vendor_note`, link→`confirm/dismiss_vendor_link`,
  Add-Vendor unified search → M2 public search + `list_private_vendors`.
- **"Save" from a public vendor profile** resolves to `set_vendor_favorite`, which **self-creates the
  relationship container if absent** (Doc-4F_PassB_Part1 :317) — **no FE pre-create step** *(MINOR-4;
  semantics A)*.
- **Category persistence carve-out (D5):** Phase 3 must **not** claim confirmed category mappings are
  stored in `details_jsonb`, and does **not** wire the confirmed-category Save-eligibility rule —
  wiring covers only the frozen contract surface until the R5 persistence ruling. Paste persistence
  binds only to the frozen single-create per D3 (no batch semantics claimed).
- Full state matrix (loading / empty / error / success).
- **Gate:** Phase 2 contracts green; `/ivendorz-verify-fe` 8-layer pass.

### Phase 4 — Gated feature unlocks *(each on its own Board ruling)*
- **R5 `ESC-VENDIR-FIELDS`** → first-class external fields / logo + confirmed-category persistence +
  dedicated batch import/upload/extraction/export; finalizes the D2 form and the D5 category wiring.
- **R4 `ESC-VENDIR-INVITE`** → activates the Pending Invitation section (M2 `source` enum + M8 intake
  submit + M6 delivery).
- **R3 `ESC-VENDIR-OFFPLATFORM`** → Documents tab + off-platform procurement history.
- **`ESC-VENDIR-PRIVATE-RELATIONSHIP-CLASSIFICATION`** → resolves D1 target (⭐/status for off-platform
  vendors).
- **Doc-2 §7 removal-authority additive** → enforces the D4 asymmetry.
- **R2 `ESC-VENDIR-DISCOVERY`** → anonymous aggregation; expect **reject** (Inv #6/#11) — not on the
  happy path.

---

## 5. Invariants held throughout
Buyer-private, Inv #11 (vendor never detects saved / preferred / status / blacklist — symmetric) ·
governance-signal firewall (⭐ is never a platform ranking, §4B; "frequently used" is org-private, never
a ranking input) · Content ≠ Presentation (directory **reads** the M2 public profile via service,
never copies it into M4) · nothing authoritative overwritten (append-only status history, soft-delete
archive, no hard delete) · one module one owner (M4 owns; M2/M8 by ID + service; M2 owns the taxonomy).

## 6. Gate summary

| Phase | Buildable when | Approval | Depends on |
|---|---|---|---|
| 0 Registry | now | human (governance) | — |
| 1 FE fold (presentation) | **now** | design freeze + FE build auth | D1(a)/D3/D4/D5 as presentation |
| 2 Backend (BC-OPS-1) | **Wave 5** | M4 wave + 8D review | Roadmap sequence |
| 3 FE wiring | after P2 | verify-fe pass | Phase 2 |
| 4 Gated unlocks | per ESC ruling | Human Board (each) | R2/R3/R4/R5 + D1/D4 escalations |

## 7. Open items
- **D1** ruled interim (a); off-platform classification escalation
  `ESC-VENDIR-PRIVATE-RELATIONSHIP-CLASSIFICATION` **DRAFT, pending Board**.
- **D3** Paste Vendor List added (presentation now; persistence bound to frozen single-create; batch
  gated).
- **D4** authority model recorded; removal-authority asymmetry needs a **Doc-2 §7 additive** (pending
  Board) — not expressible under frozen permissions today.
- **D5** unified offerings + category eligibility recorded; **confirmed-category persistence gated R5**
  (no M2 category ID in M4 pre-ruling).
- **D2** field scope gated on R5.
- Prototype demo data corrected for D1(a) (no unlinked vendor Preferred/Approved).
- Confirm the buyer-FE presentation authorization covers `/buy/vendors` re-home (it covered P-BUY-26/27).
- **Phase-0 registry edits are drafted here only** — application to `esc_registry.md` stays human-gated.
