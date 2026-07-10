# Buyer Vendor Directory & Vendor Discovery — Reconciliation & Board Intake

**Status:** DRAFT v1.0 — Board intake (NON-authoritative; conforms upward, coins nothing).
**Date:** 2026-07-03
**Author:** AI Coding Supervisor (planning) — raises findings; does **not** rule (§13 Raise ≠ Accept, `CLAUDE.md §13`).
**Presiding authority:** Human Architecture Board (ranks 0–1 immutable to skills — `CLAUDE.md §7/§8`).
**Companions (this package):** `BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md` ·
`DECISION-MATRIX-BUYER-VENDOR-DIRECTORY_v1.0.md` ·
`Doc-4F_Vendor_Directory_Additive_Patch_PROPOSAL.md` ·
`Doc-2_Vendor_Directory_Additive_Patch_PROPOSAL.md` ·
`Doc-4D_or_4J_Buyer_Invite_Additive_Patch_PROPOSAL.md` ·
`../esc_registry.md` (new `ESC-VENDIR-*` rows) · `../productSpec/BUYER_VENDOR_DIRECTORY_SPEC_v1.0.md` (non-authoritative).

> Precedence: NON-authoritative. On any conflict the frozen corpus wins (`CLAUDE.md §7`, §11
> Flag-and-Halt). This document **references-never-restates** frozen entities/slugs/events; it records
> the owner's Buyer Vendor Directory proposal reconciled against the corpus for human-Board
> adjudication. It changes nothing on its own.

---

## 0. Why this exists

The owner proposed (2026-07-03, session record) a **Buyer Vendor Directory** as a first-class
procurement feature: a per-buyer private vendor master, an Add-Vendor workflow, use of private
vendors across procurement flows, a "Smart Upgrade" link when a private vendor registers,
buyer-initiated invitations, and a three-level visibility model culminating in an anonymous
**"Discovered Vendor" network-intelligence layer**. The proposal was authored without sight of the
frozen corpus. Much of it **already exists in the frozen architecture**; parts are genuine new scope;
one part conflicts with canonical frozen rules. This document routes every element to its correct
channel so the decisions become the repository's own governed record.

**Decision outcome sought:** ratify the dispositions in §3, rule on the Board packet questions
R2–R5, and note the productSpec companion as non-authoritative.

---

## 1. Frozen baseline (pointers only — the "already exists" inventory)

| Frozen element | Anchor |
|---|---|
| Private vendor record AR `operations.private_vendor_records` — tenant-owned, **never disclosed**; lifecycle `active/archived`; claim lifecycle does **not** apply | Doc-2 §3.5 · §10.5 · §5.3 guard (Architecture Patch v1.0.1 **PATCH-02**) |
| Frozen field set: `organization_id`, `linked_vendor_profile_id` (nullable), `name`, `email`, `phone`, `details_jsonb`, `source enum<manual\|email_list\|excel>`, `link_status enum<none\|suggested\|linked>`, `link_confidence`, `linked_at`, `link_confirmed_by` | Doc-2 §10.5 · Doc-4F_PassB_Part1_BC-OPS-1 §"Owned data" |
| Buyer CRM contracts: `ops.create_private_vendor.v1` / `update` / `archive`, `add_private_vendor_note`, `set_private_vendor_rating`, `set/clear_buyer_vendor_status`, `set/clear_vendor_favorite`, `confirm/dismiss_vendor_link`, reads `get_private_vendor` / `list_private_vendors` / `get_buyer_supplier_relationship` | Doc-4F §F4 (BC-OPS-1) · Doc-5F_Structure_v1.0_FROZEN |
| Permission: `can_manage_private_vendors` (O,D,M,F; delegation **not eligible**) | Doc-2 §7 · Doc-4F §F4.1 (Authorization Matrix) |
| Buyer–Supplier Relationship AR: `buyer_supplier_relationships` + children `buyer_vendor_statuses` (`approved\|conditional\|blacklisted`, append-only history, **never evented — R5**) and `vendor_favorites` (Operations CRM favorites, PATCH-02 — distinct from `marketplace.catalog_favorites`) | Doc-4F §F4.5/§F4.6 · Doc-5F Content Pass2 · Doc-2 §2 (favorites note) |
| Link-not-merge: link column-set on `private_vendor_records`; candidates in `admin.link_suggestions` (`match_basis enum<email\|phone\|trade_license>`, `confidence`, `state(suggested/confirmed/dismissed)`, **never vendor-visible**); buyer confirms via `ops.confirm_vendor_link.v1`; "Linking never moves or exposes private data" | Doc-2 ASSUMPTION **A-03** · §10.9 · Doc-4F §F4.7 · Architecture Patch v1.0.1 **PATCH-05** (Vendor Master Identity = logical concept) |
| Marketplace claim lifecycle `seeded → invited → claimed → verified` (marketplace profiles ONLY); `vendor_claim_records` (`source(excel/admin/registration)`); direct registration lands in `claimed` | Doc-2 §3.3 · §5.3 · Master Architecture §8.3 (Invariant #3) |
| RFQ invitations & routing anchor on `vendor_profile_id` (bare UUID, service-validated); `UNIQUE(rfq_id, vendor_profile_id)`; `VendorInvited` per delivery; no off-platform invitee concept exists | Doc-4E B.3 · Doc-4E PassB Part3 (idempotency) · Doc-2 §10.4 |
| Post-award container `operations.engagements` binds `rfq_id, buyer_organization_id, vendor_profile_id, vendor_controlling_org_id`; one per Closed-Won (A-02); children `lois / purchase_orders / challans / trade_invoices / payment_records / work_completion_certificates` | Doc-2 §3.6 · §10.5 (engagements row) · A-02 |
| Non-disclosure invariant: blacklist undetectable; private supplier intelligence never exposed publicly, **even after vendor linking**; link facts undiscoverable | Master Architecture §1.5 Invariant #11 · §22.3 · Doc-4A §7.5 (undiscoverable-facts list) |
| Governance-signal firewall: "Buyer-private judgments never become platform-wide truth" | Master Architecture §4 Invariant #6 |
| Cross-tenant rule: no exposure of private data across tenant boundaries — "not through routing, analytics, or inference"; default-private tenancy, cross-tenant visibility only through explicit, controlled, auditable channels | Master Architecture §6.4 · §1.2 · ADR-016 |
| Buyer Vendor Status = "a lens, not a platform signal" | Master Architecture §10.4 |
| M8 Admin charter includes **missing-vendor intake** and **internal sales CRM for vendor acquisition**; `admin.missing_vendor_suggestions` (`suggested_by_organization_id`, `category_id`, `vendor_name`, `contact_hint`, `state(submitted/triaged/closed)`) with admin contracts `admin.triage_missing_vendor_suggestion.v1` / `admin.close_missing_vendor_suggestion.v1` | Master Architecture §16.2 (M8) · Doc-2 §3.9/§10.9 · Doc-4J BC-ADM-3 · Doc-5J |
| Cell-grid growth model: vendor recruitment targeting (sales CRM priorities) driven by demand/supply/conversion **cells**, not by private CRM contents | Doc-3 §11.4 (marketplace health cells) |
| M9 AI layer owns no authoritative business records; regenerable derived artifacts only | Master Architecture Invariant #12 · Doc-4K |
| Money boundary: platform never handles buyer↔vendor transaction money | ADR-002 |

---

## 2. Dispositions at a glance

| # | Proposal element | Disposition |
|---|---|---|
| 3.1 | Per-buyer private vendor master | **ALREADY-FROZEN** — point |
| 3.2 | Proposed `buyer_private_vendors` table | **SUPERSEDED** by frozen entity |
| 3.3 | Vendor "types" (Verified / Private / Claimed) | **ALREADY-FROZEN** (derived presentation) |
| 3.4 | Field list (required + optional) | **PARTIAL** — deltas → additive patch (R5) |
| 3.5 | Permissions model | **MAPPED** to frozen slugs; import/export = new-scope sub-items (R5) |
| 3.6 | Add-Vendor workflow + unified search + duplicate prevention | **COMPOSABLE** from frozen contracts; "Merge" = new-scope question (R5) |
| 3.7 | Smart Upgrade (matching + buyer-approved linking, history intact) | **ALREADY-FROZEN**; BIN/domain match bases = deltas (R5) |
| 3.8 | Use private vendors in RFQ/PO/invoice/challan flows | **NEW-SCOPE** → additive patch options (R3) |
| 3.9 | Buyer-initiated Invite-to-iVendorz | **NEW-SCOPE** → additive patch + ownership ruling (R4) |
| 3.10 | Level-3 "Discovered Vendor" anonymous intelligence | **CONFLICT** → Flag-and-Halt → Board options (R2) |
| 3.11 | Directory IA/naming (Vendor Directory; All/Marketplace/Private/Preferred/Pending/Archived) | **CONFORMANT** presentation (owner-ruled in session) |
| 3.12 | Mushok / VAT document kind | **SILENT** → field-level new-scope item (R5) |

---

## 3. Item-by-item reconciliation

Each item is adjudicated against the four-question Validate-Findings gate (`CLAUDE.md §13`):
**V** Valid? · **A** Applicable? · **B** Best for the product? · **C** Consistent with the frozen corpus?

### 3.1 Per-buyer private vendor master — ALREADY-FROZEN

The proposal's core ("every buyer organization has its own private vendor master", buyer-creatable,
private forever, usable without the vendor being registered) **is the frozen BC-OPS-1 Buyer Private
CRM** (§1 rows 1–5). FE-BUY-09 has already shipped its presentation (P-BUY-26/27).
**Gate:** V✔ A✔ B✔ C✔ — disposition: point to frozen; no action beyond presentation work in the
productSpec companion.

### 3.2 Proposed `buyer_private_vendors` table — SUPERSEDED

The proposal sketches a new table (`buyer_private_vendors` with `linked_vendor_id` etc.). The frozen
corpus already owns this shape as `operations.private_vendor_records` + link column-set (§1). Coining
a second entity would violate One-Module-One-Owner and Invariant #8.
**Gate:** V✔ (the *need* is valid) A✔ B✘ (duplicate entity) C✘ — disposition: **superseded**; the
proposal's DB sketch is treated as intent, realized by the frozen entity.

### 3.3 Vendor "types" — ALREADY-FROZEN as derived presentation

Proposed types (Verified iVendorz Vendor / Private Vendor / Claimed Vendor) map onto existing frozen
state, with **no new enum or state machine**:

| Proposed "type" | Derivation (frozen state) |
|---|---|
| Verified iVendorz Vendor | `link_status = linked` ∧ linked profile claim state `verified` (Master §8.3) |
| Claimed Vendor | `link_status = linked` ∧ linked profile claim state `claimed` |
| Private Vendor | `link_status ∈ {none, suggested}` (no linked profile) |

**Gate:** V✔ A✔ B✔ C✔ — disposition: derived presentation concept only. The owner subsequently
ruled the buyer-facing folder taxonomy is **source-based** (Marketplace vs Private), "named for
source, not trust level," with verification shown as badges — recorded in §3.11.

### 3.4 Field list — PARTIAL; deltas → additive patch (Board R5)

Mapping the proposed fields against the frozen field set (§1 row 2):

| Proposed field | Frozen home | Delta? |
|---|---|---|
| Company Name | `name` | — |
| Email Address | `email` | — |
| Mobile Number | `phone` | — |
| Notes | `private_vendor_notes` child | — |
| Preferred (⭐) | `vendor_favorites` (PATCH-02) | — |
| Active / Inactive | lifecycle `active/archived` | — (semantic mapping: "Inactive" = `archived`; see productSpec) |
| Contact Person, Designation, Alternate Contact, Office Phone, Website, Company Address, City, Country, BIN, Trade License No., VAT Registration | **no first-class column**; `details_jsonb` exists as frozen catch-all | **YES** — Board choice: (a) carry inside `details_jsonb` (zero schema change; weak queryability) or (b) additive first-class columns (patch) |
| Core Business Area (multi-select from taxonomy) | none (no category reference on private records) | **YES** — additive patch item (category-id references, service-validated, no cross-schema FK per Doc-2 §0.3) |
| Company Logo | none (no storage ref) | **YES** — additive patch item (storage reference) |

**OBS-1:** `admin.link_suggestions.match_basis` already includes `trade_license` as a match basis,
yet `private_vendor_records` has no first-class trade-license column — matching presumably reads
`details_jsonb`. The Doc-4F patch proposal should state where the trade-license value canonically
lives.
**Gate:** V✔ A✔ B✔ C✔ (as additive) — disposition: per-field deltas routed to
`Doc-4F_Vendor_Directory_Additive_Patch_PROPOSAL.md` / `Doc-2_Vendor_Directory_Additive_Patch_PROPOSAL.md` (Board R5).

### 3.5 Permissions — MAPPED to frozen slugs

Proposed tiers (Buyer Admin / Procurement Officer / Viewer) would coin a third role vocabulary next
to the two frozen dimensions (Invariant #2). The frozen model already covers the intent:

| Proposed capability | Frozen slug / mechanism |
|---|---|
| Add / Edit / Delete(archive) | `can_manage_private_vendors` (O,D,M,F) |
| Use in PO/RFQ | RFQ/engagement slugs own their surfaces (e.g. `can_create_documents`, `can_approve_po` — Doc-2 §7); CRM grants nothing outside CRM |
| Read only | CRM reads fall under the private-vendor slug (Doc-4F §F4, no separate read slug — carried `[ESC-OPS-SLUG]` in the frozen doc) |
| Import / Export | **no frozen slug or contract** — new-scope sub-item (R5); import precedent exists admin-side only (`source enum` value `excel`; M8 Excel import console) |
| Invite Vendor | new-scope (R4, §3.9) |

**Gate:** V✔ A✔ B✔ C✔ (as mapped) — disposition: mapped; no new roles; buyer-side import/export and
invite are the only capability gaps.

### 3.6 Add-Vendor workflow, unified search, duplicate prevention — COMPOSABLE; one new-scope question

- Search-existing → **Add to My Vendor List**: composable — M2 public search (Doc-5D) +
  `ops.set_buyer_vendor_status.v1` / `ops.set_vendor_favorite.v1` create the
  `buyer_supplier_relationships` container on first write (Doc-4F §F4.5). A private record referencing
  the found profile can equally be created then immediately linked (`link_status = linked`).
- Not-found → **Create Private Vendor**: `ops.create_private_vendor.v1` (frozen).
- **Unified search (owner ruling):** query marketplace + own private records simultaneously —
  presentation-level composition of two frozen reads (M2 search · `list_private_vendors`); no
  contract change.
- **Duplicate prevention (owner ruling):** on a match, offer **Link / Merge / Cancel**. *Link* is
  frozen (§F4.7). *Cancel* is trivial. **Merge (private↔private consolidation) has no frozen
  contract** — and the frozen linking philosophy is explicitly **link-not-merge** (A-03, PATCH-05).
  A private↔private merge is not the same operation as the prohibited private↔public merge, but the
  corpus is silent; treated as a **new-scope candidate** under R5, with the alternative
  (archive-duplicate + pointer note) available at zero patch cost.

**OBS-2 (intra-corpus pointer discrepancy — for the record, no local resolution):** Doc-4F PassA
(§traceability) cites "ADR-003 (link-not-merge)", but the ADR Compendium's ADR-003 is the *Trust
Score Engine*; the vendor identity/linking decision content sits in **ADR-005** and Architecture
Patch v1.0.1 PATCH-05 / Doc-2 A-03. Raised as OBS only — frozen documents are not edited; the Board
may note it for a future corpus errata patch.
**Gate:** V✔ A✔ B✔ C✔ — disposition: composable now, except Merge → R5.

### 3.7 Smart Upgrade — ALREADY-FROZEN; match-basis deltas

Proposed detection (email/BIN/phone/domain match) → prompt → buyer approves → history intact — this
**is** the frozen flow: `admin.link_suggestions` candidates → buyer `ops.confirm_vendor_link.v1` →
link columns written; nothing auto-links ("the buyer decides whether to link" matches frozen
buyer-confirmation); "procurement history remains intact" is guaranteed by link-not-merge + Invariant
#11 ("even after vendor linking").
**Delta:** frozen `match_basis` is `email|phone|trade_license`. Proposed **BIN** and **domain**
bases are additive enum-value candidates → Doc-2/Doc-4J-adjacent patch item under R5.
**Gate:** V✔ A✔ B✔ C✔ — disposition: point to frozen; two enum-value deltas → R5.

### 3.8 Off-platform participation in procurement flows — NEW-SCOPE (Board R3)

The proposal wants private vendors usable in "RFQ, Purchase Order, Quotation Request, Comparison …
Challan, Mushok, Commercial Offer, Invoice, Delivery Tracking" with an experience "identical whether
the supplier is an iVendorz vendor or a private vendor."

Frozen reality: **every** RFQ invitation/routing surface and the post-award engagement container
bind a `vendor_profile_id` (§1 rows 8–9). A private-only vendor **cannot** appear in any of these
today. This is not an omission to patch silently — it is a deliberate boundary of the frozen moat
(M3) and post-award chain (M4).

Owner ruling (this session): **pursue** off-platform participation as buyer-private recording (no
vendor-side experience, no platform money handling — ADR-002 conformant). Two candidate shapes are
drafted in `Doc-4F_Vendor_Directory_Additive_Patch_PROPOSAL.md` for Board choice (**R3**):

- **Shape A — XOR party reference:** extend `operations.engagements` (and document children) to bind
  `vendor_profile_id` **XOR** `private_vendor_record_id`. One chain, both origins; touches the frozen
  engagement aggregate and its `RFQClosedWon` creation path (A-02) — larger blast radius.
- **Shape B — parallel buyer-private aggregate:** a new `operations`-owned, tenant-private
  "offline procurement record" AR (own document children), leaving frozen `engagements` untouched;
  "identical experience" delivered at the presentation layer. Smaller frozen-surface impact; some
  presentation-level duplication.

**M3 is untouched in both shapes** — an off-platform "RFQ" is a buyer-private M4 record, never an
`rfq` row: routing, matching, invitations, quotations remain marketplace-only (preserves the moat,
Invariant #4, and the §6.4 tenancy model).
**Gate:** V✔ A✔ B (Board judgment) C✔ *only as additive patch* — disposition: R3.

### 3.9 Buyer-initiated Invite-to-iVendorz — NEW-SCOPE (Board R4)

Frozen seeding/invitation is **admin-driven** (M8 Excel import console → claim lifecycle;
`vendor_claim_records.source enum<excel|admin|registration>`); no buyer-initiated invite contract
exists anywhere in the corpus. The proposal's invite flow (buyer invites private vendor; on
acceptance the vendor claims and the buyer links) is genuinely new scope. Ownership analysis in
`Doc-4D_or_4J_Buyer_Invite_Additive_Patch_PROPOSAL.md`:

- Invitation dispatch/claim tracking is **M2's** (`vendor_claim_records`) — an added `source` value
  (e.g. buyer-referral) is an additive enum candidate;
- Intake/triage of buyer-suggested vendors is **M8's** (missing-vendor intake charter; note the
  frozen corpus has admin triage/close contracts but **no submit contract** — a gap any variant must
  fill additively);
- Delivery (email/SMS) is **M6** (delivery only);
- The private-record linkage on acceptance is already frozen (§3.7).

"Pending Invitation" as a Directory section is GATED-ON-R4 in the productSpec.
**Gate:** V✔ A✔ B✔ C✔ *only as additive patch* — disposition: R4.

### 3.10 Level-3 "Discovered Vendor" anonymous network intelligence — CONFLICT → Flag-and-Halt (Board R2)

Proposed: aggregate private vendor adds across buyers into platform discovery records
("referenced by 25 buyer organizations"), surface anonymous suggestions to other buyers, and drive
sales-team acquisition targeting.

**Flag-and-Halt (`CLAUDE.md §11`): the proposal conflicts with canonical frozen language.** Both
sources cited; no local resolution:

| # | Frozen rule (anchor) | Conflicting proposal element |
|---|---|---|
| C-1 | Invariant #6 — "Buyer-private judgments never become platform-wide truth" (Master §4) | reference counts derived from private adds become a platform-wide signal |
| C-2 | Invariant #11 — "Private supplier intelligence … is never exposed publicly, even after vendor linking" (Master §1.5) | discovery records/suggestions are derived exposures of private CRM contents |
| C-3 | Cross-tenant rule — private data never crosses tenant boundaries, "not through routing, analytics, **or inference**" (Master §6.4; ADR-016) | cross-buyer aggregation is precisely analytics/inference across tenants |
| C-4 | "Buyer vendor status is private intelligence — a lens, not a platform signal … never crosses the tenant boundary" (Master §10.4) | "referenced by N buyers" makes the lens a platform signal |

Additionally, **no module may own it**: M2 computes no derived signals, M4 is tenant-scoped, M5 is
firewalled, M9 is explicitly forbidden (Invariant #12), and M8's charter is staff-internal.

**Adjacent conformant capability (already frozen, for Board option R2-b):** M8 owns
**missing-vendor intake** (`admin.missing_vendor_suggestions` carries `suggested_by_organization_id`,
`category_id`, `vendor_name`, `contact_hint`) and the **internal sales CRM for vendor acquisition**;
Doc-3 §11.4's cell grid already drives recruitment targeting from *demand/supply/conversion* data,
not private CRM contents. A buyer-initiated, consent-based "suggest this vendor to iVendorz" flow
would be an "explicit, controlled, auditable channel" (§1.2) rather than passive inference.

Per owner instruction, the Board packet presents three options **neutrally** (reject / conformant
consent-based path / rank-0 architecture patch, drafted in the packet's Annex A) with **no
recommendation**.
**Gate:** V✔ (the growth goal is real) A✔ B (Board judgment) **C✘ as proposed** — disposition:
Flag-and-Halt → R2. Not implementable in any form without a Board ruling; option (c) additionally
requires a human-approved rank-0 additive architecture patch.

### 3.11 Directory IA & naming — CONFORMANT presentation (owner-ruled)

Owner rulings from the plan-review rounds (2026-07-03), all presentation-level (frozen names
unchanged; label→frozen-name mapping table lives in the productSpec):

- Surface named **"Vendor Directory"**; buyer-facing terminology consistently "Vendor"; "Supplier"
  reserved for external/ERP document contexts.
- Navigation: **All Vendors** (default; origin badges; default sort ⭐ Preferred → Recently Used →
  Marketplace → Private) · **Marketplace Vendors** (*a vendor linked to an iVendorz marketplace
  profile, regardless of verification status* — source, not trust level) · **Private Vendors** (*a
  vendor record visible only within the owning buyer organization and not linked to a marketplace
  profile*) · **⭐ Preferred Vendors** (view over frozen `vendor_favorites`; buyer-private; not a
  platform ranking) · **Pending Invitation** (GATED-ON-R4) · **Archived** (frozen `archived` state;
  both origins).
- Finer statuses (Verified / Claimed / Blacklisted / Archived) are **table filter chips, never
  navigation items**; Blacklisted chips render buyer-side only (Invariant #11 is vendor-facing and
  unaffected).
- The shipped FE-BUY-09 "CRM" surface (`/crm`, P-BUY-26/27): whether it is relabeled/re-homed under
  "Vendor Directory" is registered as an FE-change item for the FE program board — not silently
  respecified here.

**Gate:** V✔ A✔ B✔ C✔ — disposition: recorded; realized in the productSpec companion.

### 3.12 Mushok / VAT documents — SILENT (field-level new-scope, R5)

"Mushok" (Bangladesh VAT forms) appears **nowhere** in the frozen corpus. The engagement document
children are `lois / purchase_orders / challans / trade_invoices / payment_records /
work_completion_certificates`; `document_templates.format` is `challan/bill/letterhead/quotation/wcc`.
**This gap is already registered as `ESC-OPS-DOC-MUSHOK`** (FE-DOC intake, 2026-07-03,
`esc_registry.md`) with its own Board channel (`BOARD-PACKET-DOCUMENT-MANAGEMENT_v1.0.md` item 2a) —
this package does **not** re-register it; R5 item 7 simply cross-references that handle so the
Directory's off-platform recording (R3) composes with whatever the document-management ruling
decides. Recording VAT documents remains money-boundary-conformant (ADR-002: recording, never
settling).

---

## 4. What this package does NOT do

- Does not edit any frozen document (`generatedDocs/` untouched).
- Does not implement anything; no code, no schema, no seeds.
- Does not resolve C-1…C-4 (§3.10) — those are Board-only.
- Does not restate frozen field lists/enums beyond the minimal pointers needed for adjudication.

## 5. Validate-Findings ledger

All dispositions above carry their four-question gate inline. Items failing a question are marked
(§3.2 B✘/C✘ → superseded; §3.10 C✘ → Flag-and-Halt) and are **not** implemented. Raise ≠ Accept:
this document raises; the human Board rules via `BOARD-PACKET-BUYER-VENDOR-DIRECTORY_v1.0.md`.
