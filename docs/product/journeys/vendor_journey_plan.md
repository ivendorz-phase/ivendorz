# iVendorz — Vendor Journey Plan v1.0

| | |
|---|---|
| **Status** | Companion document — **NON-authoritative**. Mirrors the frozen corpus; on any conflict the frozen document in `generatedDocs/` wins (Flag-and-Halt per CLAUDE.md §11). |
| **Date** | 2026-07-06 (build-status snapshot as of this date) |
| **Scope** | End-to-end vendor lifecycle journey + built-vs-gap analysis. Reference-never-restate: every state token, slug, event, and contract ID below is copied verbatim from a frozen source (pointer given) or explicitly marked **[candidate — not in corpus]** / **[ESC-open]**. Nothing is coined here. |
| **Siblings** | `vendor_planning_and_design.md` (vendor workspace design companion, v0.9-rc) · `buyer_planning_and_design.md` · `project-management/fe-program-wbs.md` (build-status SSoT) |
| **Reviews** | Two adjudication rounds folded (PASS WITH PATCH); dispositions in Appendix A per CLAUDE.md §13 (Raise ≠ Accept; only validated findings implemented). |

---

## §0 Executive summary — the vendor lifecycle in one minute

```
DISCOVER ──► REGISTER ──► ACTIVATE ──► PUBLISH ──► VERIFY ──► GET INVITED ──► QUOTE ──► WIN ──► DELIVER ──► GROW ──► RETAIN
   S0          S1           S2          S3–S4        S5          S6–S7          S8       S8       S9–S10      §6       S11–S12
   M8/M2       M1           M2          M2           M5          M3/M4          M3       M3       M4          all      M7/M1/M8
```

A vendor organization is **discovered or seeded** on the marketplace (S0), **registers** and forms its organization and team (S1), **claims and activates** its vendor profile (S2), **publishes** its capability matrix, catalog, and microsite (S3–S4), gets **verified** by Trust (S5), becomes **visible** to buyers and receives **invitations** to RFQs (S6–S7), **quotes** through the governed procurement engine (S8), **wins** awards (S8→S9), **delivers** through the post-award document workflow (S9–S10), **grows** through the earned-standing flywheel (§6), and **retains or exits** through subscription and lifecycle edges (S11–S12). Day to day, the vendor operates out of a recurring **Daily Workspace Hub** (S-Hub) that every action returns to.

**What this platform never does — three lines that shape every stage:**
1. **Never touches buyer↔vendor transaction money** — no escrow, wallet, or settlement; payment records only record/confirm off-platform events (Doc-4F).
2. **Never reveals exclusion** — a blacklisted vendor's experience is byte-identical to a never-matched vendor's (Invariant 11; CHK-6-022 / CHK-7-040).
3. **Never mixes governance signals** — Trust, Performance, Verified Tier, and Verification are independent, System-computed, read-only; billing state never buys standing (Invariants 6, 10).

---

## §1 Purpose & authority

- This document assembles the vendor journey **from the frozen per-module contracts**; the corpus itself contains no single journey narrative. It is a map for product, design, and engineering — not a source of truth.
- **Doc-4M is non-normative** (its own M9 rule): where this document cites a state machine via `Doc-4M_FROZEN_v1.0.md`, the binding authority is Doc-2 §5 / Doc-3 / the owning Doc-4 contract, which Doc-4M consolidates.
- **Program status is not tracked here.** The status SSoT is `generatedDocs/00_AUTHORITY_MAP.md` + `generatedDocs/Program_Status_And_Roadmap.md`; FE build status SSoT is `project-management/fe-program-wbs.md`. §8's gap table is a **dated snapshot** referencing WBS milestone IDs, nothing more.
- Open escalation handles (`[ESC-…]`) are tracked in `esc_registry.md` and cited here as **open**, never as resolved.

## §2 Actors & personas

Two role dimensions, never merged (Invariant 2; Doc-4C):

| Dimension | Values | Journey relevance |
|---|---|---|
| Platform Participation | Buyer / **Vendor** / **Hybrid** / Staff | This journey covers Vendor and the vendor-leg of Hybrid orgs |
| Organization Role | Owner / Director / Manager / Officer | Gates who inside the vendor org can act at each stage (permission slugs, server-resolved) |

**Users act; Organizations own** (Invariant 5): every business record in this journey belongs to the vendor organization; the active org context is server-validated; no org ID ever appears in a URL (companion DP9). Personas per stage are noted in each stage block as **Primary actor** — `System`, `User (vendor)`, `User (buyer)`, or `Admin` — matching the Doc-4M trigger-actor columns.

## §3 Journey overview

Thirteen stages on a spine, one recurring hub, and two cross-cutting lanes:

```
Phase bands (presentation labels only — nothing semantic is coined):
[ ACQUIRE  S0–S2 ] [ ACTIVATE  S3–S5 ] [ SELL  S6–S8 ] [ EXECUTE  S9–S10 ] [ GROW  §6/S11 ] [ RETAIN/EXIT  S12 ]

        ┌────────────────────────── S-Hub · Daily Workspace (recurring loop) ──────────────────────────┐
        │  every completed action returns here: invitations · deadlines · leads · quota · credits · trust │
        └───────────────────────────────────────────────────────────────────────────────────────────────┘
S0 ─► S1 ─► S2 ─► S3 ─► S4 ─► S5 ─► S6 ─► S7 ─► S8 ─► S9 ─► S10 ─► S11 ─► S12
════ Communication lane (M6 — §5): event-driven notifications ride under every stage ════
════ Governance lane (§7): money boundary · byte-equivalence · signal firewalls · gates ════
```

Module owners along the spine: S0 M8→M2 · S1 M1 · S2 M2(+M5 seam) · S3 M2 · S4 M2 · S5 M5 · S6 M2 · S7 M3(+M4 seam) · S8 M3 · S9 M4 · S10 M4(+M5 seam) · S11 M7 · S12 M1/M8/M7.

---

## §4 The stages

Each stage uses one template: **Trigger → Primary actor → Touchpoints → Frozen states → Owner → Gates → Communication events → Guardrails → Typical duration *(illustrative only — not policy)* → Build status → Gaps**.

### S0 · Seeded presence 🌱

- **Trigger:** Admin (M8) imports/seeds a vendor record into the marketplace before the vendor ever arrives.
- **Primary actor:** Admin / System.
- **Touchpoints:** none for the vendor yet — the seeded profile may already be publicly listed (`/vendors`, `/vendors/[slug]`).
- **Frozen states:** Vendor Profile claim dimension `seeded → invited` (System dispatches the claim invite) — Doc-2 §5.3 via `Doc-4M_FROZEN_v1.0.md`; import `link_suggestions` are never vendor-visible (Doc-6J note, `CORPUS_INDEX.md`).
- **Owner:** M8 (import) → M2 (profile record).
- **Guardrails:** claim lifecycle applies **only** to marketplace vendor profiles, never to buyers' private CRM vendor records (Doc-4M PATCH-02) — two different "vendor record" universes that never merge.
- **Build status:** public directory + microsite render seeded vendors (FE-PUB-03/06, presentation-only).

### S1 · Registration, organization & team 👤

- **Trigger:** a person signs up and creates/joins the vendor organization.
- **Primary actor:** User (vendor Owner first, then invited members).
- **Touchpoints:** `app/(auth)/signup`, `app/(auth)/login`; team management at `/workspace/organization` (FE-VEN-10/11 composition).
- **Frozen states (Doc-2 §5.1/§5.2 via Doc-4M):** Organization `claimed → active` (System, claim verification), `suspended ⇄ active` (Admin), `→ closed`. Membership `invited → active → suspended ⇄ active → removed`. Delegation Grant `pending → active → revoked/expired`. Invite-expiry / delegation-validity POLICY keys registered in Doc-3 (Identity patch v1.9).
- **Owner:** M1 Identity.
- **Gates:** org-role permissions (slugs, server-side `check_permission` — Doc-4C).
- **Communication events:** registration/claim-invite notifications ride §5.
- **Typical duration *(illustrative)*:** minutes.
- **Build status:** generic auth pages exist; organization tabs built (FE-VEN-10/11).
- **Gaps:** **no vendor-specific onboarding wizard** — the guided registration→claim→profile spine (companion §4.4) has no dedicated UI yet. → §8, §9.

### S2 · Claim & activation ✅

- **Trigger:** the vendor follows the claim invitation (or self-initiates) and takes ownership of the profile.
- **Primary actor:** User (vendor).
- **Touchpoints:** first-run/unclaimed dashboard state D-0a (companion §3.4); onboarding spine (companion §4.4) with the profile **completeness meter** (companion DP13; kit handle `[ESC-7B-METER]`, open).
- **Frozen states:** Vendor Profile claim `invited → claimed` (User completes claim), `claimed → verified` (Trust verification decision reflected into M2 — seam M6-8; Trust never writes `vendor_profiles` directly). Status dimension is separate: `active / suspended / banned`.
- **Owner:** M2 (profile) with M5 seam (verified flag).
- **Guardrails:** claim status labels follow the companion §7.1 taxonomy (`seeded`→"Unclaimed", `invited`→"Invitation sent", `claimed`, `verified`) — display labels, not new states.
- **Typical duration *(illustrative)*:** minutes to a day.
- **Build status:** dashboard first-run states designed (companion §3.4); no dedicated claim-flow UI. → §8.

### S-Hub · Daily Workspace (recurring loop) 🏠

- **Trigger:** every login, and the return point after every completed action in S3–S12.
- **Primary actor:** User (vendor).
- **Touchpoints:** `/workspace` + `/workspace/dashboard` (FE-VEN-01) — pending invitations, quotation deadlines, lead pipeline links, quota meter ("7/10"), lead-credit balance, trust standing, completeness meter, quick actions (all grounded in companion §3.2/§3.4 and built dashboard sections).
- **Owner:** composition surface (Doc-7G); each tile reads its owning module's contracts only.
- **Guardrails:** dashboard shows **only owned data** (companion DP13) — no matchability, no "RFQs you missed", no exclusion-revealing denominators; the shell deliberately renders **no unread badge** while notifications are unwired (Invariant 11).
- **Build status:** built (FE-VEN-01, presentation-only).
- **Gaps:** notifications page is a disclosed placeholder → §5, §8.

### S3 · Company profile & capability matrix 🏢

- **Trigger:** claimed vendor completes matching-relevant content.
- **Primary actor:** User (vendor, `can_manage_vendor_profile` family — Doc-2 §7 slugs by pointer).
- **Touchpoints:** `/workspace/company` (FE-VEN-02: identity & geography, capabilities & capacity, financial-tier panel), `/workspace/company/categories` (category assignments).
- **Frozen states & facts:** capability = **four independent booleans** `can_supply / can_service / can_fabricate / can_consult` — a vendor-type preset only seeds them; matching consumes the flags, never a label (Invariant 1; Doc-4D). Category Assignment `proposed → active/removed` — vendor proposes, **Admin approves** (Doc-4M). **Declared** Financial Tier is vendor-set; **Verified** tier belongs to S5 (append-only tier history; companion DP6).
- **Owner:** M2 content.
- **Guardrails:** Content ≠ Presentation (Invariant 9) — this stage is the *matching-relevant* half; S4 is the presentation half; the IA keeps them in different nav groups (companion §2.2). Financial Tier ≠ Subscription Plan (Invariant 10).
- **Typical duration *(illustrative)*:** hours.
- **Build status:** built (FE-VEN-02, presentation-only).

### S4 · Catalog, microsite & projects publishing 📦

- **Trigger:** vendor publishes what buyers see.
- **Primary actor:** User (vendor).
- **Touchpoints:** `/workspace/company/products` + `/[productId]` + `/spec-library` (FE-VEN-04); `/workspace/microsite` (FE-VEN-03: branding, SEO, preview/publish, custom domain); `/workspace/company/projects` (placeholder); public result at `/vendors/[slug]` (FE-PUB-03) and the directory `/vendors` (FE-PUB-06).
- **Frozen states:** Product `draft → published ⇄ unpublished`; Microsite `draft → published ⇄ unpublished` — publish gated by permission slug **+ entitlement**; **no hard delete** (Invariant 8). Custom Domain `pending → verified → active → released` — **external domains only**; the universal platform subdomain/slug is governed by ADR-024 + Doc-2 v1.0.5 canonical-host rule (`*.ivendorz.com` input rejected, Doc-4D v1.0.2 patch). Showcase Projects have frozen create/update/**publish** commands (`marketplace.*_showcase_project.v1`, Doc-4D Profile-Experience part) — lifecycle per that contract, cited by pointer.
- **Owner:** M2 presentation (+ product content).
- **Guardrails:** product images are M2 **content**, not presentation (companion DP5); public microsite renders **published projections only** — no buyer-private concept exists on the public surface (Doc-7D).
- **Communication events:** none owned here (publishing is state + audit).
- **Typical duration *(illustrative)*:** hours to days, iterative.
- **Build status:** built (FE-VEN-03/04, FE-PUB-03/06); projects route is a disclosed placeholder. → §8.

### S5 · Verification & trust standing 🛡️

- **Trigger:** vendor submits verification evidence; Admin decides; Trust stores.
- **Primary actor:** User (vendor submits) → Admin (`staff_can_verify` decides) → System (scores).
- **Touchpoints:** `/workspace/trust` (FE-VEN-09 Trust Center — Trust ring, Performance band, Verified-Tier chip). Verification **submission** currently has admin-side UI only (`app/(app)/admin/verification`).
- **Frozen states (Doc-2 §5.6 via Doc-4M):** Verification Record `submitted → under_review → approved/rejected`; `approved → expired` (TTL); `rejected → submitted` (resubmit). Verified Financial Tier `pending_verification → verified → suspended ⇄ verified → expired`; `declared` = absence of a row; `VendorTierChanged` → M2 appends `financial_tier_history` (seam M6-3).
- **Owner:** M5 Trust stores; **Admin decides, Trust owns** (module boundary note, CLAUDE.md §3).
- **Guardrails:** four **firewalled, independent, read-only** signals — Trust Score, Performance Score, Verified Financial Tier, Verification status (Invariant 6). Display ruling (Board 2026-07-03): Trust Score may render band + numeric 0–100 + badges anywhere public; **Performance stays band-only**; formula / matching / fraud / ranking / confidence / percentile are **never rendered**. Scores are System-computed, never hand-edited.
- **Communication events:** verification decision notifications ride §5.
- **Typical duration *(illustrative)*:** days (decision latency is Admin-side, not a platform SLA).
- **Build status:** display built (FE-VEN-09); **vendor-facing submission UI missing**. → §8, §9.

### S6 · Visibility & discovery surfaces 🔍

How buyers find the vendor — all surfaces read published M2 projections:

| Surface | Grounding | Build |
|---|---|---|
| Vendor directory `/vendors` | Doc-7D public surface | FE-PUB-06 built |
| Category listing | Admin-approved category assignments (S3) | taxonomy seeded (FE-PUB-09 approved) |
| Product listings / product detail | Doc-4D catalog; `get_public_product_detail.v1` (ESC-7-API-PRODDETAIL resolved) | FE-PUB built |
| Public microsite `/vendors/[slug]` + SEO fields | Doc-7D §4 / P-PUB-13 | FE-PUB-03 + M2.5 built |
| Canonical subdomain / custom domain | ADR-024 / Doc-4D custom-domain machine (S4) | FE-PUB-10 |
| Advertising campaigns | Doc-4D §D7.4 ad lifecycle (Billing purchase, DD-5) | FE-VEN-13 built (`/workspace/microsite/ads`) |
| Buyer favorites | frozen twice: M2 `catalog_favorites` (org bookmark, membership-only) and `operations.vendor_favorites` (M4 buyer-private CRM) — Doc-4D §D7.5 | buyer-side surfaces |

- **Primary actor:** User (buyer) discovering; System serving projections.
- **Guardrails:** matching/routing/**ranking internals are never disclosed** to anyone (Board Trust ruling) — there is no "improve your rank" meter and no visibility score. Buyer favorites are buyer-side records; the vendor never sees who favorited (M4 CRM is buyer-private, ND-5).
- **[candidate — not in corpus]:** "featured vendor" placement; M9 recommendation surfaces (reserved module — "AI suggests; modules decide"; future activation only). → §9.

### S7 · RFQ invitation → response 📨

- **Trigger:** the governed matching/routing engine (M3 — the moat) selects and invites the vendor. **There is no "browse open RFQs" surface, by design** — the inbox is received-only, which is what makes exclusion undetectable (Invariant 11; CHK-7-040).
- **Primary actor:** System (delivers) → User (vendor, `can_respond_to_rfq`).
- **Touchpoints:** `/workspace/rfqs` invitation inbox → `/workspace/rfqs/[rfqId]` detail (FE-VEN-05); lead auto-appears at `/workspace/leads` (FE-VEN-07).
- **Frozen states:** RFQ Invitation `draft → selected → deferred → delivered → accepted/declined/expired` — the vendor leg **begins at `delivered`**; there is no `invited` state (companion §6.4 fixed that as a BLOCKER). On `VendorInvited` at `delivered`, `ops.create_lead_on_invitation` System-creates the Vendor Lead out-of-wire (seam M6-2) — the vendor **never self-creates a lead**. Lead stages per the frozen Doc-5F machine: `received → quoted → negotiation → won | lost → follow_up`.
- **Owner:** M3 (invitation) + M4 BC-OPS-3 (lead).
- **Non-happy paths (explicit):** `declined` · `expired` · accepted-but-never-submitted — the lead moves to `lost` in the vendor's private pipeline. Not every invitation becomes a quotation, and the journey must render those ends with the same one canonical empty state (byte-equivalence BE rules, companion §8).
- **Guardrails:** lead `won/lost` is **private vendor CRM** — never the RFQ award state, never a governance signal (R6 firewall).
- **Communication events:** invitation-delivered and reminder notifications ride §5.
- **Typical duration *(illustrative)*:** response windows are RFQ-defined (window-state chips in the built UI).
- **Build status:** built (FE-VEN-05/07, presentation-only).

### S8 · Quotation: author → submit → clarify/revise → outcome 💰

- **Trigger:** accepted invitation opens the quotation workspace.
- **Primary actor:** User (vendor, `can_submit_quote` / `can_withdraw_quote`) ⇄ User (buyer) ⇄ System (windows/expiry).
- **Touchpoints:** `/workspace/rfqs/[rfqId]/quotation` — 7-step builder, price-breakdown table, terms, attachments, preview, quota meter, version timeline, outcome panel (FE-VEN-06; clarifications section on the RFQ detail).
- **Frozen states (Doc-2 §5.5 via Doc-4M):** Quotation `draft → submitted`; `submitted → withdrawn / shortlisted / expired`; `shortlisted → selected / not_selected`. **Revisions are immutable versions within `submitted`** — there is no `revised` state (Invariant 8). Buyer-side parent: RFQ `… → quotations_received → buyer_reviewing → shortlisted → closed_won / closed_lost / expired`.
- **Clarification / amendment loop (a flow, not new states):** buyer runs `rfq.manage_clarification.v1` (actions `post_clarification | broadcast_material | invoke_best_and_final`, Doc-4E Part 5 §E8.3); the thread channel itself is **Communication-owned** (DE-6); the **fair-information rule** broadcasts material clarifications anonymized to *all* active invitees; vendor replies on the thread and revises — a new immutable version, **no state change, no quota**. Best-and-final reuses the same revision contract; revision count is soft-capped by POLICY `quote.max_revisions` (beyond cap requires thread justification).
- **Quota economics:** SUBMIT consumes one `monthly_rfq_limit` entitlement unit, enforced server-side at SUBMIT; revision consumes none (companion §6.5/§6.7).
- **Losing outcomes (explicit):** `withdrawn` · `expired` · `not_selected` · RFQ `closed_lost`/`expired` — the outcome panel renders them; the lead ends `lost`.
- **Owner:** M3.
- **Guardrails:** the 8 submit fields are frozen (companion M5 note); comparison/evaluation internals are buyer-side and never disclosed.
- **Communication events:** clarification broadcasts, award/outcome notifications ride §5.
- **Build status:** built (FE-VEN-06; quotation workflow integrated on the RFQ surface — current branch).

### S9 · Award → engagement & post-award documents 🏆🚚

- **Trigger:** buyer awards: RFQ `shortlisted → closed_won` emits `RFQClosedWon`; the engagement is **System-created out-of-wire** (seam M6-1) directly into its initial state — the hand-off is a **navigation, never a cross-module write** (companion DP10).
- **Primary actor:** System (creation) → User (vendor & buyer parties, `can_create_documents`; PO financial approval additionally requires the distinct slug `can_approve_po` — never collapsed).
- **Touchpoints:** `/workspace/engagements` → `/[engagementId]` (overview, documents, reconciliation, money-boundary banner) → `/documents/[documentId]` (FE-VEN-08); cross-workspace documents hub `/workspace/documents` (FE-DOC-02).
- **Frozen document model (Doc-4F BC-OPS-2/-4, cited by pointer — the vendor experiences this as chains, not workflows):**
  - Engagement children `lois` / `purchase_orders` / `challans` / `work_completion_certificates` are **versioned documents** (`human_ref DOC-…`, `version_no`, `is_active_revision`, `revision_reason`) via `ops.issue_engagement_document.v1` / `ops.revise_engagement_document.v1` (`doc_kind enum<loi|po|wcc>`; challan has its own contract §F5.3). **There is no per-document approval state machine** — a revision supersedes by version, immutably.
  - **Direction of issue** as the vendor sees it: typically **receives** buyer-issued LOI / PO / WCC and **issues** challans, trade invoices, and payment-record confirmations (both orgs are parties; reads are shared-by-parties, RLS-scoped).
  - **WCC issuance emits `WorkCompletionIssued`** — a Trust performance input (DF-4: emit, never score). LOI/PO issue/revise emit no event.
  - Templates (BC-OPS-4): `document_templates` `draft → active → archived` (formats `challan|bill|letterhead|quotation|wcc`); rendered artifacts generate **async** — the record is usable immediately, the PDF follows; generated documents are versioned rows with **no status machine**, shared to the counterparty by a `granted|revoked` visibility grant.
- **Money boundary (hard):** trade invoices / payment records **record and confirm off-platform payment events only** — no pay, settle, escrow, or wallet affordance anywhere; `operations.trade_invoices ≠ billing.platform_invoices` (Doc-4F R8). BC-OPS-5 `finance_records` are org-internal structured text (`tax|ait|payment|expense`) with **no state machine and no funds**.
- **Frozen engagement states:** per the owning Doc-4F BC-OPS-2 contract (Doc-4M consolidates the lifecycle; disputed/terminated edges exist — S10).
- **Typical duration *(illustrative)*:** weeks to months — the longest stage.
- **Build status:** built (FE-VEN-08 + FE-DOC-02, presentation-only). Gap: `/workspace/documents/mushok-challan` placeholder instruments the open **ESC-OPS-DOC-MUSHOK** gap. → §8.

### S10 · Ongoing relationship & feedback loop ⭐

- **Trigger:** delivery milestones, disputes, completion.
- **Primary actor:** System (recompute) ⇄ Users (parties).
- **Touchpoints:** engagement reconciliation summary (derived view — deliberately no stat-tile, ENG-03 discipline); `/workspace/trust` reflects updated standing.
- **The recalculation chain (explicit):** engagement completion / `WorkCompletionIssued` / trade-invoice `DisputeRecorded` → consumed by **M5 under the System actor** → Performance/Trust recompute → updated standing renders in the Trust Center and on public surfaces per the display ruling. **Operations emits, never scores** (DF-4); no formula is disclosed; **no single signal dominates a matching decision** (firewall, CLAUDE.md §4).
- **The other side of the relationship (invisible by design):** the buyer's private Vendor CRM (M4 BC-OPS-1 `buyer_vendor_statuses`, records `active ⇄ archived`) — Approved/Blacklisted status, notes, favorites. **None of it ever renders on the vendor leg** (ND-5), and blacklisting is undetectable end-to-end (Invariant 11).
- **Build status:** reconciliation + trust display built; wiring future.

### S11 · Monetization touchpoints (cross-cutting) 💳

M7 Billing touches the journey at defined points — and **only** commercially (billing firewall: no billing state gates trust, eligibility, routing, matching, or award — Doc-4I):

| Touchpoint | Frozen grounding | Journey stage it gates |
|---|---|---|
| Subscription `pending_payment → active → expired`; cancel = `active + auto_renew=false` (A-06); `SubscriptionPurchased/Renewed/Expired` refresh org entitlements (seam M6-6) | Doc-4I BC-BILL-2 | everything entitlement-gated |
| Entitlements — boolean/numeric/enum, **never plan-name checks** | BC-BILL-1; Invariant 10 | publish gates (S4), quota (S8) |
| `monthly_rfq_limit` quota consumed at SUBMIT | BC-BILL-3 | S8 |
| Lead-credit ledger (append-only) — **commercial balance, never procurement standing** | BC-BILL-4 | S6/S7 lead packages |
| Advertising purchase | BC-BILL-5 purpose enum `subscription \| lead_package \| advertising \| microsite \| service` | S6 |
| Platform invoices `INV-P-…` `draft → issued → paid/overdue → paid/voided` — the **only** money the platform handles (its own revenue) | BC-BILL-5 | — |

- **Touchpoints:** `/workspace/billing` (FE-VEN-12 area — currently a tab shell). **Gap:** no plan-selection/upgrade flow UI. → §8, §9.

### S12 · Suspension, ban & offboarding 🚪

- **Frozen edges:** Organization `suspended ⇄ active → closed` (Admin; Doc-2 §5.1). Vendor Profile `→ banned` driven by the Admin `VendorBanned` event — the **sole Admin-owned §8 event**, produced by BC-ADM-2 Ban Actions (`active → lifted → expired`, expiry only from `lifted`; Doc-4J). Subscription lapse: `auto_renew=false → expired` (S11). Voluntary wind-down: unpublish microsite/products (S4 machines run backward — `published → unpublished`).
- **What never happens:** hard deletion. Versioned docs, soft delete, immutable audit, IDs never reused (Invariant 8) — the record trail survives the relationship.
- **Primary actor:** Admin (suspend/ban) / User (voluntary) / System (expiry).
- **[candidate — not in corpus]:** self-service data export. → §9.
- **Build status:** no vendor-facing offboarding UI (expected — admin-side moderation surfaces exist).

---

## §5 Cross-cutting Communication Layer (M6)

Communication is continuous under the whole spine — but M6 **transports, never decides** (Doc-4H H.10): it owns no matching/routing/ranking/award logic and computes no score.

- **Channels (frozen split):** in-app = BC-COMM-2 Notification aggregate (`notifications`, lifecycle **`unread → read → archived`**, Doc-2 §3.7/§10.7); email/SMS/WhatsApp transport & delivery logs = BC-COMM-3 (delivery only); messaging/threads = BC-COMM-1.
- **Trigger model:** M6 **emits no domain events** — it consumes the Doc-2 §8 catalog of every producing module and creates the notification effect idempotently on `source_event_id` (exactly-once over at-least-once). The producing module owns each event.
- **The vendor's notification timeline along the journey** (each entry = producing module's frozen event or contract, consumed by M6):

| Journey point | Trigger (owner) |
|---|---|
| S1/S2 registration & claim invite | Identity/Marketplace claim dispatch (`seeded→invited` is System "invite dispatched") |
| S5 verification decision | Trust verification record transitions (M5) |
| S7 invitation delivered (+ reminders) | `VendorInvited` (M3; seam M6-2 — co-consumed by Operations for lead creation) |
| S8 clarification / best-and-final broadcast | `rfq.manage_clarification.v1` actions, dispatched by Communication (DE-6, anonymized fair-information broadcast) |
| S8/S9 outcome & award | `RFQClosedWon` (M3; seam M6-1) |
| S9 WCC / completion | `WorkCompletionIssued` (M4) |
| S11 subscription lifecycle | `SubscriptionPurchased/Renewed/Expired` (M7; seam M6-6) |

- **Notification preferences are Identity-owned (M1)** and consumed read-only by M6 (Doc-4H DH-1) — a preferences surface belongs to Settings, not to a Communication module UI.
- **Privacy behaviors (frozen):** a non-recipient fetching a notification gets `NOT_FOUND` (existence never confirmed); timing-uniform responses.
- **Byte-equivalence constraint:** the **absence** of notifications must never reveal exclusion — no "you weren't invited" artifacts; the built shell deliberately renders no unread badge until wired (Invariant 11).
- **Build status:** `/workspace/notifications` and `/workspace/inquiries` are disclosed placeholders. → §8.

## §6 Growth & retention flywheel

The platform's long-term vendor value proposition, stated firewall-correctly — **standing is earned through the journey; visibility is bought only commercially; the two never mix**:

```
richer profile + verification (S3–S5)
        │  (capability matrix + approved categories + verified tier)
        ▼
more capability/category matches → more invitations (S7)     [matching is governed;
        ▼                                                      no signal dominates]
more quotations (S8) → more awards (S9)
        ▼
delivered engagements + WCCs (S9–S10)
        ▼
Performance/Trust recompute (System, M5) → stronger public standing
        ▼
buyer confidence → repeat invitations ──────────────► loops back to S7
```

**What a plan upgrade buys (commercial lane only):** more `monthly_rfq_limit` quota, lead credits, advertising, microsite/domain entitlements — i.e., capacity and commercial visibility. **What it never buys:** matching rank, trust, eligibility, or award odds (billing firewall; subscription cannot boost rank). Growth guidance in-product uses **only the vendor's own data** — completeness, missing categories, unverified flags, quota (companion DP13); it may never reference matching causality.

## §7 Cross-journey guardrails

| Guardrail | Binding source | Shapes |
|---|---|---|
| Money boundary — record/confirm off-platform only; platform invoices are the only platform-handled money | Doc-4F R8; CLAUDE.md §1 | S9, S11 |
| Blacklist undetectable — byte-equivalence on the vendor leg | Invariant 11; CHK-6-022 / CHK-7-040; companion §8 ND/BE | S-Hub, S6–S8, §5 |
| Firewalled signals — 4 independent, System-only, read-only | Invariants 6; §4 firewall table | S5, S10, §6 |
| Capability matrix, never labels | Invariant 1 | S3, S6 |
| Content ≠ Presentation | Invariant 9 | S3 vs S4 |
| Financial Tier ≠ Subscription Plan; entitlements never plan-name | Invariants 10; Doc-4I | S3, S11 |
| One module one owner; cross-module = navigation/events, never writes | Invariant 7; DP10 | S7→S9 hand-offs |
| Nothing authoritative overwritten or hard-deleted | Invariant 8 | S8 versions, S9 chains, S12 |
| AI suggests; modules decide (M9 reserved) | Invariant 12 | S6 candidates |
| Users act, Organizations own; server-validated org context | Invariant 5 | every stage |

## §8 Gap analysis — build-status snapshot (2026-07-06)

Status SSoT is `project-management/fe-program-wbs.md`; everything "Built" below is **presentation-only** (seed-driven; backend wiring is a future program phase). Snapshot only — do not treat as a living ledger.

| Stage | Surface | Status | Missing |
|---|---|---|---|
| S0 | Public directory/microsite render seeded vendors | Built (FE-PUB-03/06) | — |
| S1 | `app/(auth)/signup`, `/workspace/organization` | Partial | **Vendor onboarding wizard** (registration→claim→profile spine) |
| S2 | First-run dashboard D-0a, claim flow | Designed only | Claim-flow UI, completeness meter (kit `[ESC-7B-METER]` open) |
| S-Hub | `/workspace` dashboard | Built (FE-VEN-01) | wiring |
| S3 | `/workspace/company` + categories | Built (FE-VEN-02) | wiring |
| S4 | products / spec-library / microsite / ads | Built (FE-VEN-03/04/13) | `/workspace/company/projects` placeholder |
| S5 | `/workspace/trust` display | Built (FE-VEN-09) | **Vendor-facing verification submission UI** (admin-side only today) |
| S6 | `/vendors`, taxonomy, mega-menu, subdomain | Built (FE-PUB tracks) | vendor analytics **[candidate]** |
| S7 | `/workspace/rfqs` inbox + `/workspace/leads` | Built (FE-VEN-05/07) | wiring |
| S8 | `/workspace/rfqs/[rfqId]/quotation` | Built (FE-VEN-06) | wiring |
| S9 | `/workspace/engagements` + `/workspace/documents` | Built (FE-VEN-08, FE-DOC-02) | `mushok-challan` placeholder (ESC-OPS-DOC-MUSHOK, human-gated) |
| S10 | reconciliation, trust refresh | Built (display) | wiring |
| S11 | `/workspace/billing` | Shell only | **Plan-selection/upgrade flow**, invoices, credits ledger UI |
| S12 | — | Missing (expected) | vendor-side lifecycle states surfaced in Settings |
| §5 | `/workspace/notifications`, `/workspace/inquiries` | Placeholders | **Notification center + inbox/threads**; preferences (Identity-owned) in Settings |

## §9 Candidate next milestones (proposal only — human-gated)

Ordered by journey criticality; each is a WBS-mint decision for the owner, not a commitment. All corpus-conformant unless flagged.

1. **FE-VEN Onboarding wizard** — registration → claim → guided profile spine with completeness meter (unblocks S1–S2; realizes companion §4.4; needs `[ESC-7B-METER]`/`[ESC-7B-STEPPER]` kit adds).
2. **FE-VEN Verification submission** — vendor-facing evidence submission + resubmit-on-reject (S5; pairs with existing admin surface).
3. **FE-VEN Notification center + inquiries inbox** — `unread → read → archived`, no-badge-until-wired discipline; preferences panel in Settings (Identity-owned data) (§5).
4. **FE-VEN Billing flow** — plan selection, entitlement display, platform invoices, lead-credit ledger (S11; entitlement-driven UI, never plan-name).
5. **FE-VEN Projects (showcase)** — replace placeholder using the frozen showcase-project contracts (S4).
6. **Vendor analytics** — own-data metrics only with byte-equivalence-safe denominators (see §10).
7. **Backend wiring program** — the umbrella successor (vendor M9 milestone per team notes); out of scope here.

**Flagged out-of-corpus (owner/Board decision required before any work):** Help Center / support tickets / live chat (no owning module); "featured vendor" placement; gamification badges; self-service data export; vendor-side buyer bookmarks. Recorded here so they aren't silently reinvented later.

## §10 Journey KPIs (explicitly NOT governance signals)

Candidate success metrics for dashboards/analytics (§9.6). Every metric is derivable from the **vendor's own records**, and every denominator is byte-equivalence-safe (invitations-received / quotations-submitted only — never a matched-pool or opportunity-universe rate, which could reveal exclusion):

profile completeness · verified (binary) · products published · invitations received · quotations submitted · awards won (`selected`) · engagements completed · repeat buyers (from own award history).

These are product KPIs. They are **not** inputs to, proxies for, or displays of the four firewalled M5 signals, and must never be presented as such.

## §11 Open ESC pointers (cited as open — `esc_registry.md` is authoritative)

`ESC-7G-A7` (vendor route mount — why everything sits under neutral `/workspace/*` today) · `ESC-7G-SLUG-MKT` · `ESC-7G-PIPE-CONTRACT` · `ESC-7G-ENG-01/03` · `ESC-OPS-DOC-*` (incl. MUSHOK) · `ESC-7B-METER` / `ESC-7B-STEPPER` (kit) · `ESC-COMM-AUDIT` / `ESC-COMM-SLUG` / `ESC-COMM-POLICY` (Communication carried markers).

---

## Appendix A — Review-findings dispositions (per CLAUDE.md §13)

Two review rounds were adjudicated against the four-question Validate-Findings gate. Summary of dispositions (full rationale in the review exchange):

**Round 1 — 4 MAJOR / 9 MINOR / 5 NIT:** ACCEPTED — communication lane (→§5), daily-workspace hub (→S-Hub), visibility expansion (→S6, minus coined "featured vendor"/"recommendation engine"/rank meters), growth flywheel (→§6, firewall-corrected), favorites (→S6, frozen forms only), analytics (→§10, safe denominators), projects (→S4, by pointer), inbox (→§5), notification preferences (→§5, found Identity-owned), completeness meter (→S2, verified in companion), team/delegation (→S1), offboarding detail (→S12, minus data export), actor-per-stage, illustrative durations, icons/pain-points. REJECTED — Help Center (out-of-corpus, §9 flag), milestone badges (out-of-corpus, §9 flag).

**Round 2 — 1 MAJOR / 5 MINOR / 4 NIT:** ACCEPTED — document lifecycle in S9 (via frozen versioned-chain model; reviewer's coined `Requested→…→Archived` chain **not** adopted — verified against Doc-4F: engagement docs are versioned rows with no approval state machine), clarification/amendment loop (→S8, fully frozen contracts found), expiry/no-quote paths (→S7/S8), trust recalculation chain (→S10), notification timeline (→§5), hub return-loop, phase bands (visual-only), consistent icons, actor colors, success metrics (→§10, constrained).

**Round 3 — 1 optional NIT:** ACCEPTED — one-page executive summary (→§0).

---

*End of Vendor Journey Plan v1.0 — companion document; not committed; supersedes nothing.*
