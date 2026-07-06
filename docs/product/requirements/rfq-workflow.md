# iVendorz RFQ Workflow — Frontend Workflow Companion

| | |
| --- | --- |
| **Document** | `rfq-workflow.md` — RFQ Frontend Workflow Companion |
| **Version** | v1.1 — review-adjudicated (see Appendix A); v1.0 initial |
| **Last updated** | 2026-07-06 |
| **Status** | NON-AUTHORITATIVE design/implementation companion. Mirrors the frozen corpus and is patched to match it; on any conflict **the frozen document wins** (CLAUDE.md §7). |
| **Realized by** | `app/(app)/_components/rfq-workflow/` (journey model · transition projection · document registry · data-adapter seam · journey UI) — see §10 Implementation status |
| **Authorities (by pointer, never restated)** | Doc-2 §5.4/§5.5 (state machines) · Doc-3 §1/§4/§8–§10 (operational semantics) · Doc-4E (RFQ module contract) · Doc-4F (post-award, M4) · Doc-4M (consolidation index) · Doc-5E (API realization) · Doc-5H (M6 threads) · Doc-7F/7G (buyer/vendor UX) |
| **Scope** | The complete RFQ procurement journey as the FRONTEND realizes it: buyer leg + vendor leg + M4 hand-off. No backend, no writes, no new states, no new document kinds. |

> **The one rule this document lives by:** the proposed "complete procurement journey"
> (Draft → … → RFQ Closed) is realized **entirely on frozen mechanics**. Where a proposed stage has
> no frozen backing, it is mapped onto a frozen mechanism or **flagged in §9 — never coined**.

---

## 1. The RFQ lifecycle (corpus-conformant)

**Read this first — the journey crosses THREE bounded contexts, and they are not one state
machine.** M3 (RFQ) owns the lifecycle below; M6 (Communication) owns a side-channel thread that
never changes a lifecycle state; M4 (Operations) owns a **separate** machine reached only through
the `RFQClosedWon` event. The module banners in the diagram are load-bearing (One Module, One
Owner): the frontend crosses each line by navigation only, never by shared state.

**Notation legend:**

```text
◇ Stage name       presentation JOURNEY STAGE (RFQ_JOURNEY) — orientation only, NEVER a state
lowercase_token    frozen Doc-4M lifecycle STATE (verbatim token)
command_name       frozen Doc-5E command realizing a caller-driven edge
═══ MODULE ═══     bounded-context boundary (One Module, One Owner)
┌─ boxed inset ─┐  a leg or side-channel, not a stage in the main spine
```

```text
═══════════════════════════ MODULE M3 — RFQ (schema `rfq`) ═══════════════════════════

◇ Draft
        draft
          │  submit_rfq (buyer; optional org gate)
          ├──────────────► pending_internal_approval
          │                    │ approve_rfq (approver, can_approve_rfq)
          ▼                    ▼
◇ Validation
        submitted ◄────────────┘
          │  (platform moderation intake)
          ▼
        under_review
          │  moderate_rfq (Admin decides — DE-5)
          ├── reject ──────► draft                 (Doc-5E §4.2 patched edge)
          ▼  pass
◇ Matching & invitations
        matching
          │  System: matching engine routes (routing_mode: approved_only /
          │  approved_conditional / approved_open / open_market — breadth only;
          │  NO public RFQ board exists, R5)
          ├── coverage exhausted ──► expired       (Doc-5E §4.2 patched edge)
          ▼
        vendors_notified
          │
          │  ┌─ VENDOR LEG (same module M3 — grant-scoped, received-only, DP1/BE-1) ──┐
          │  │ invitation: draft → selected → [deferred] → delivered                  │
          │  │               │ respond_to_invitation                                  │
          │  │       ┌───────┼────────┐                                               │
          │  │   accepted declined  expired                                           │
          │  │       │                                                                │
          │  │   quotation draft (builder)                                            │
          │  │       │ submit_quotation (consumes the Billing quota — DE-7)           │
          │  │       ▼                                                                │
          │  │   quotation submitted — a revision is revise_quotation → a NEW         │
          │  │   IMMUTABLE VERSION; the state stays `submitted` (Inv #8)              │
          │  └────────────────────────────────────────────────────────────────────────┘
          │
          │  ┌─ SIDE-CHANNEL: MODULE M6 — COMMUNICATION (Doc-5H thread) ──────────────┐
          │  │ Clarification thread: buyer ↔ invited vendor Q&A, one thread per       │
          │  │ invited vendor. Runs ALONGSIDE quoting, repeatable in both directions, │
          │  │ and changes NO lifecycle state — it is a conversation, not a workflow  │
          │  │ step. (Thread-level semantics are M6/Doc-5H-owned; the embedded        │
          │  │ thread component is Board-deferred — see Appendix A, MINOR-01.)        │
          │  └────────────────────────────────────────────────────────────────────────┘
          ▼
◇ Quotations
        quotations_received ◄── first submission (same transaction)
          │  first open of get_comparison_statement (server-side — §E8.6)
          ▼
◇ Comparison & evaluation
        buyer_reviewing
          │  technical + commercial evaluation = buyer working practice over the
          │  System-generated comparison statement (decision support ONLY — R6)
          │  shortlist_quotation
          ▼
◇ Shortlist & award
        shortlisted
          │  award_rfq (explicit, exactly one — NO recommendation exists, R6)
          │      quotations: shortlisted → selected | not_selected
          ├── close_lost_rfq ──► closed_lost
          ▼
        closed_won            ◄── TERMINAL: the M3 machine ENDS here

  Any active state ── cancel_rfq (audited reason) ──► cancelled
  vendors_notified / quotations_received / buyer_reviewing ── validity clock ──► expired
  closed_lost / expired / cancelled ── reissue_rfq ──► a NEW RFQ aggregate at `draft`
                                                       (source unchanged — Doc-5E §4.6)

─────────────── HANDOFF — an EVENT, not a transition: `RFQClosedWon` ───────────────
    M3 emits; M4 consumes (Doc-4M M6-1 seam). No shared tables, no cross-module
    imports. The frontend crosses this line by NAVIGATION only (DP10).

═════════════ MODULE M4 — OPERATIONS (schema `operations`) — a SEPARATE machine ═════════════

◇ Post-award
        engagement — created directly ACTIVE by RFQClosedWon (no prior state)
          │
          ├─ document chain:  LOI → PO → challan → WCC
          │                   (engagement_document_kind — the ONLY four; immutable chain)
          ├─ separate aggregates:  trade_invoices · payment_records
          │                   (record-only — the platform never settles funds, DF-6)
          ▼
        completion / closure per the M4 contract
        (engagement state naming carries the §9.6 Flag-and-Halt — not restated here)
```

---

## 2. RFQ state machine (frozen — Doc-2 §5.4 via Doc-4M M5 + Doc-5E §4.2)

| From | To | Trigger authority | Command (Doc-5E) |
| --- | --- | --- | --- |
| `draft` | `pending_internal_approval` | Buyer (optional gate) | `submit_rfq` |
| `draft` | `submitted` | Buyer (gate absent) | `submit_rfq` |
| `pending_internal_approval` | `submitted` | Approver (`can_approve_rfq`) | `approve_rfq` |
| `submitted` | `under_review` | Platform moderation | — |
| `under_review` | `matching` | Admin (moderation pass — DE-5) | `moderate_rfq` |
| `under_review` | `draft` | Admin (moderation reject) | `moderate_rfq` |
| `matching` | `vendors_notified` | System (invitations dispatched) | — |
| `matching` | `expired` | System (coverage exhausted) | — |
| `vendors_notified` | `quotations_received` | System (first quotation, same txn) | — |
| `quotations_received` | `buyer_reviewing` | Buyer (first comparison open — §E8.6) | — |
| `buyer_reviewing` | `shortlisted` | Buyer | `shortlist_quotation` |
| `shortlisted` | `closed_won` | Buyer (`can_award_rfq`; emits `RFQClosedWon`) | `award_rfq` |
| `shortlisted` | `closed_lost` | Buyer | `close_lost_rfq` |
| `vendors_notified` / `quotations_received` / `buyer_reviewing` | `expired` | System (validity clock) | — |
| any active state | `cancelled` | Buyer (audited reason) | `cancel_rfq` |

Terminal states (`closed_won` / `closed_lost` / `expired` / `cancelled`) have **no outbound
transition**. `reissue_rfq` creates a **new** aggregate; the source is never mutated.

Typed projection: `app/(app)/_components/rfq-workflow/transitions.ts` (per-row source pointers;
fixture/orientation support only — at wiring the SERVER derives the permitted-action set, GI-10).

## 3. RFQ Invitation state machine (frozen — Doc-2 §3 via Doc-4M M5)

| From | To | Trigger |
| --- | --- | --- |
| `draft` | `selected` | System (matching selects vendor) |
| `selected` | `deferred` | System / deferral logic |
| `selected` / `deferred` | `delivered` | System (emits `VendorInvited` — M6-2 seam) |
| `delivered` | `accepted` / `declined` | Vendor (`respond_to_invitation`) |
| `delivered` | `expired` | System (validity clock) |
| `accepted` | `expired` | System (parent RFQ expires/cancels) |

**Non-disclosure:** the buyer sees delivered-onward rows only, with NO vendor identity; deferral is
invisible (Doc-3 §4.2 / Inv #11). The vendor-visible entry state is `delivered` (received-only —
there is no browse/discovery of un-invited RFQs).

## 4. Quotation state machine (frozen — Doc-2 §5.5 via Doc-4M M5)

| From | To | Trigger |
| --- | --- | --- |
| `draft` | `submitted` | Vendor (`submit_quotation`; consumes the Billing quota — DE-7) |
| `submitted` | `withdrawn` | Vendor (`withdraw_quotation`) |
| `submitted` | `shortlisted` | Buyer (`shortlist_quotation`) |
| `shortlisted` | `selected` / `not_selected` | Buyer (`award_rfq` — one selected, others not) |
| `submitted` | `expired` | System (parent RFQ expires) |

**There is NO `revised` state and NO "locked" state.** A revision is `revise_quotation` → a new
**immutable version** with the state unchanged (`submitted`), history preserved (Inv #8). Every
submitted version is already immutable; "locking" needs no mechanism. Sealed-until-close price
redaction is a server POLICY (Doc-3 §10.1), explained by the UI, decided by nobody client-side.

---

## 5. Buyer workflow view (journey buckets)

Rendered by `RfqPipelineSummary` on `/rfqs` from adapter-supplied counts. Each bucket is a
**documented union of frozen states** (`BUYER_PIPELINE_BUCKETS`) — nothing else:

| Bucket | Frozen states |
| --- | --- |
| Drafting | `draft` |
| Awaiting internal approval | `pending_internal_approval` |
| In validation | `submitted`, `under_review` |
| Matching & invited | `matching`, `vendors_notified` |
| Quotes received | `quotations_received` |
| In evaluation | `buyer_reviewing` |
| At award | `shortlisted` |
| Awarded | `closed_won` |
| Closed without award | `closed_lost`, `expired`, `cancelled` |

"Awaiting internal approval" is a dedicated tile (review MINOR-02): the approval gate is a distinct
buyer workflow moment — it feeds the `/approvals` queue and the "Awaiting MY approval" KPI — while
remaining a pure frozen-state union.

The ratified per-state funnel (`SourcingPipelineCard`, P-BUY-01) is a distinct, unchanged model.

## 6. Vendor workflow view (own facts only)

Rendered on `/workspace/rfqs`; every bucket derives from the vendor's OWN invitation/quotation
states — never a competitor fact (ND-1..ND-8):

| Bucket | Own facts |
| --- | --- |
| New invitations | invitation `delivered` |
| Preparing quote | invitation `accepted` + quotation absent/`draft` |
| Submitted | quotation `submitted` |
| Shortlisted | quotation `shortlisted` |
| Awarded | quotation `selected` |
| Not selected | quotation `not_selected` (non-penalizing display) |
| Declined / expired | invitation `declined`/`expired`, quotation `withdrawn`/`expired` |

**Why there is no "Needs revision" bucket** (review MINOR-03, rejected): no frozen fact denotes
"revision requested" — there is no state, field, or event for it, and inferring it client-side from
clarification activity plus a superseded version would be a business inference the presentation is
forbidden to make (a superseded version exists after **every** revision, requested or not). The
own-record `unread_clarification` flag on the inbox row is the frozen-conformant attention signal.

The vendor journey rail (`VendorJourneyStrip`): Invitation → Preparing quotation → Submitted →
Buyer review → Outcome → Post-award.

---

## 7. Documents across the lifecycle (frozen kinds only)

Registry: `app/(app)/_components/rfq-workflow/documents.ts`. The "Authored / generated by" column
is **display classification only** (icon/grouping support) — it is NEVER an authorization input;
access is server-decided per the owning module's contract.

| Journey stage | Artifact | Authored / generated by | Owner |
| --- | --- | --- | --- |
| Draft | RFQ document — immutable versions (`rfq_versions`) | Buyer | M3 |
| Matching & invitations | RFQ invitation record | System | M3 |
| Matching & invitations | Clarification thread (the "Q&A record") | Buyer & vendor (thread) | **M6** (delivery-only) |
| Quotations | Quotation — immutable versions | Vendor | M3 |
| Comparison & evaluation | Comparison statement (read-only) | System (§8 worker) | M3 |
| Post-award | LOI · PO · Delivery challan · WCC (`engagement_document_kind` — the ONLY four) | Operational — inter-party chain (issuer per Doc-4F, not restated here) | **M4** |
| Post-award | Trade invoice · Payment record (SEPARATE aggregates; record-only, DF-6) | Operational — inter-party records | **M4** |

**Explicitly NOT modeled (no frozen backing — Board-gated ESC-OPS-DOC-\* to add):** "Award Notice"
as a document (the award is a command + event + banded M6 notification), "Technical/Commercial
Evaluation record", "RFQ Completion Report", comparison Excel/PDF export + digital signatures.

## 8. Key system behaviours (as frozen, not as proposed)

- **RFQ versioning** — every buyer amendment is a new immutable `rfq_versions` row; quotations bind
  to a locked version snapshot (Inv #8).
- **Invitation tracking** — accepted/declined/expired/pending tracked independently per invitation;
  deferral invisible to the buyer.
- **Quotation revision** — buyer prompts via clarification / `invoke_best_and_final`; vendor runs
  `revise_quotation` → new immutable version. There is no "return for amendment" state.
- **Late window** — `request_late_extension` is one two-phase contract (vendor requests, buyer
  approves/denies); approval reopens the window for ALL un-responded invitees (Doc-3 §8.5 FIXED).
- **Comparison** — auto-generated from the first quotation by the §8 System worker; read-only;
  first open drives `quotations_received → buyer_reviewing`; **never** ranks-to-winner (R6).
- **Award** — explicit, exactly one, over the persisted shortlist only; above-threshold values
  require Director/Owner approval (server-enforced, Doc-3 §9.4); loss feedback is banded (§9.5).
- **Audit** — every mutation rides `core.append_audit_record.v1` (M0); the frontend renders the
  disclosed timeline and computes nothing.

---

## 9. Corpus divergence notes (Raise ≠ Accept)

None of these may be "fixed" in the frontend — they are corpus-level asks.

1. **`Amendment Requested` / `Revised Submission` / `Quotation Locked` as states** — do not exist;
   realized via versioning + clarifications (§4, §8).
2. **`Technical Evaluation` / `Commercial Evaluation` / post-quote `Internal Approval` as states**
   — buyer working practice inside `buyer_reviewing`/`shortlisted`; the only internal-approval
   state is the PRE-submission gate `pending_internal_approval`.
3. **"Award Recommendation"** — forbidden as a system output (R6: no auto-winner / recommendation
   endpoint may exist or be added).
4. **Unfrozen document kinds** — Award Notice / Evaluation record / RFQ Completion Report /
   comparison export + signatures (§7).
5. **"Public Marketplace (Optional)" branch** — routing breadth is the frozen `routing_mode`
   (`open_market` included); `list_rfqs` is buyer-org-scoped — **no public RFQ board** (R5).
6. **Engagement state naming** — carried Flag-and-Halt (Doc-4F §F5 `open/in_delivery/completed/
   closed` vs the Doc-4M row); this workflow treats M4 as a navigation hand-off only and inherits
   the pending reconciliation untouched.

---

## 10. Frontend implementation status (presentation-only)

**Home:** `app/(app)/_components/rfq-workflow/` — see its `README.md` for the folder-level rules.
Current phase: **presentation-only with mock adapters** (no backend, no writes); the wiring path is
§11.

### Architecture at a glance

```text
              pages (Server Components — the data boundary)
     buyer  /rfqs/**                    vendor  /workspace/rfqs/**
              │  await rfqWorkflowData.buyer.*  /  .vendor.*
              ▼
     adapters/index.ts   ◄────────────  THE SWAP POINT (one file)
              │ today                          │ Wave 4
              ▼                                ▼
     adapters/mock/                    GI-02 server data layer
     (full-lifecycle fixture universe;  (own-org / grant-scoped resolvers
      counts·facets·action sets          over the frozen Doc-5E reads)
      derived here — never in views)
              │                                │
              └────────── same view-models ────┘
                             │
                             ▼
     presentation views + Doc-7B kit (pure props — render, never decide)
     orientation UI fed by the journey model (journey.ts / transitions.ts / documents.ts)
```

**The adapter seam** (`adapters/`): every RFQ page reads through `rfqWorkflowData` — one method per
frozen Doc-5E read, returning the EXISTING presentation view-models. Buyer and vendor legs are
separate interfaces; M4 data is never served here (navigation hand-off only). The mock adapter is
the stand-in server: counts/facets/ordering/permitted-action sets are derived inside it, never in
components (R7 / GI-04 / GI-10). Unknown ids → `null` → each page's byte-identical genuine-absence
render (Inv #11 / GI-12).

**Fixture universe** (`adapters/mock/rfq-universe.ts`): one coherent dataset — a buyer RFQ in
**every** frozen state (deep chain detail → versions → routing → comparison → award on
`rfq-000123`; `rfq-000318` appears on both legs) and a vendor inbox covering every own-fact bucket
in §6.

### Component inventory (actual components, by layer)

| Layer | Components |
| --- | --- |
| Kit — RFQ chips (`src/frontend/components/rfq`) | `RfqStateChip` · `InvitationStateChip` · `QuotationStateChip` · `WindowStateChip` · `RfqCard` |
| Kit — comparison (`src/frontend/components/comparison`) | `ComparisonSummary` · `ComparisonTable` (+ `ComparisonData` view-models) |
| Kit — shared | `StatusChip` · `EmptyState` · `ErrorState` · `NotFound` · `CurrencyDisplay` · `PaginationControl` · `FileLink` · `SealedMarker` · `quotationStateDisplay` |
| Workflow (`_components/rfq-workflow`) | `RfqJourneyStrip` · `VendorJourneyStrip` · `RfqPipelineSummary` |
| Buyer surfaces (`(buyer)/…`) | `RfqListView` · `RfqDetailView` (Overview / Quotations / Activity tabs) · `ComparisonView` · `AwardView` · `RfqVersionsView` · `RoutingInvitationsView` · `ClarificationsView` · `QuotationDetailView` · `SourcingPipelineCard` · `ActivityTimeline` · `RfqCreateView` (+ wizard: `WizardStepper` · `ItemRequirementsTable` · `UploadArea` · `SubmitPreview` · section cards) |
| Vendor surfaces (`_components/vendor/rfq`) | `InvitationInbox` · `QuotationHomeSummary` · `RfqSnapshot` · `InvitationResponse` · `ClarificationsSection` · `QuotationStatusCard` · `QuotationVersionTimeline` · `QuotationOutcomePanel` · `QuotationBuilder` (+ `PriceBreakdownTable` · `QuotationTermsField` · `QuotationAttachments` · `QuotationPreview` · `QuotationSubmitPanel`) · `QuotaMeter` |

### Wired pages (11)

buyer `/rfqs` (list + buckets) · `/rfqs/[id]` (+ journey strip) · `…/compare` · `…/award` ·
`…/versions` · `…/routing` · `…/clarifications` · `…/quotations/[qid]` ·
vendor `/workspace/rfqs` (inbox + quota + buckets) · `/workspace/rfqs/[id]` (+ vendor strip) ·
`…/quotation` (builder draft).

**Journey UI:** `RfqJourneyStrip` / `VendorJourneyStrip` — navigation-not-state orientation rails
(never rendered in a not-found branch; terminal outcomes never drawn as progress) — and
`RfqPipelineSummary` bucket tiles.

## 11. Wiring plan (Wave 4 — the "minimal changes" contract)

1. Implement the GI-02 server data layer: own-org / grant-scoped resolvers mapping frozen Doc-5E
   DTOs onto the same view-models (cursor pagination GI-03, `error_class` branching GI-05,
   Suspense/streaming §11.4).
2. Swap the export in `adapters/index.ts` from `mockRfqWorkflowData` to it. **No page, view, or
   model file changes.**
3. Server-owned behaviours activate where they belong (comparison first-open transition,
   permitted-action derivation, sealed-until-close redaction, threshold enforcement).
4. Writes (`submit_rfq`, `respond_to_invitation`, `submit_quotation`, `award_rfq`, …) land as
   audit-backed server actions per the D7 reference audited-write pattern — a separate milestone;
   the affordances already render.

Reads run in Server Components only; the browser never calls a Doc-5 contract and never sets
`Iv-Active-Organization` (Inv #5 / Doc-7C SR3).

### Page ↔ adapter ↔ frozen contract map

| Page | Adapter read(s) | Frozen contract (Doc-5E unless noted) |
| --- | --- | --- |
| `/rfqs` | `buyer.listRfqs` · `buyer.getPipelineSummary` | `list_rfqs` (+ its state-facet read) |
| `/rfqs/[id]` | `buyer.getRfq` | `get_rfq` + nested `list_quotations_for_rfq` |
| `/rfqs/[id]/versions` | `buyer.getRfqVersions` | `get_rfq_version` |
| `/rfqs/[id]/routing` | `buyer.getRoutingInvitations` | `get_routing_log` + `list_invitations` (§E6.7) |
| `/rfqs/[id]/compare` | `buyer.getComparison` | `get_comparison_statement` (§E8.6) |
| `/rfqs/[id]/award` | `buyer.getAwardShortlist` | shortlist read (§E8); write `award_rfq` (parked) |
| `/rfqs/[id]/clarifications` | `buyer.getRfq` (identity only) | M6 thread read (Doc-5H — component deferred) |
| `/rfqs/[id]/quotations/[qid]` | `buyer.getQuotationDetail` | `get_quotation` (§E7.5, visibility-gated) |
| `/workspace/rfqs` | `vendor.listInbox` · `vendor.getQuota` · `vendor.getPipelineSummary` | `list_invitations` (vendor leg) · Doc-5I entitlement resolve (`monthly_rfq_limit`) |
| `/workspace/rfqs/[id]` | `vendor.getRfqSnapshot` · `getInvitation` · `getOwnQuotation` · `getEngagementHandoff` | grant-scoped `get_rfq` ([ESC-7G-Q-01] CLOSED) · own invitation/quotation reads · M4 hand-off pointer |
| `/workspace/rfqs/[id]/quotation` | `vendor.getQuotationDraft` · `vendor.getQuota` | own-draft read ([ESC-7G-Q-DRAFT] pending); writes `submit_quotation` / `revise_quotation` (parked) |

---

## Appendix A — Review disposition record (v1.1, 2026-07-06)

Owner-supplied review adjudicated per CLAUDE.md §13 (Raise ≠ Accept · four-question Validate
Findings gate). Gate after adjudication: **BLOCKER 0 · MAJOR 0 · MINOR 0 outstanding** (rejected
findings recorded below with rationale, per §13).

| Finding | Ruling | Disposition |
| --- | --- | --- |
| MAJOR-01 (three bounded contexts read as one machine) | **ACCEPTED, with one correction** | Module banners + explicit HANDOFF divider added to §1; M4 drawn as a separate machine. Correction to the finding's framing: M6 is a **side-channel during M3**, not a sequential context between M3 and M4 — drawn as a boxed inset, not chained. |
| MAJOR-02 (journey vs state visually ambiguous) | **ACCEPTED** | Notation legend added; journey stages now render as a distinct `◇` rail, states as lowercase tokens (§1). |
| MINOR-01 (add a clarification UI workflow: Open → Waiting → Resolved) | **PARTIAL — chain rejected** | The clarification loop is now drawn as an explicit boxed M6 side-channel with prose (§1). The proposed step-chain is NOT adopted: it would coin thread-lifecycle semantics owned by M6/Doc-5H, whose embedded thread component is Board-deferred (2026-07-01) — even "UI-only" states would pre-empt the owning contract. |
| MINOR-02 (dedicated "Awaiting internal approval" buyer tile) | **ACCEPTED** | Bucket split out of "Drafting" in §5 **and** in `BUYER_PIPELINE_BUCKETS` (journey.ts), keeping doc ↔ code true; still a pure frozen-state union. |
| MINOR-03 (vendor "Needs revision" bucket from clarification + superseded version) | **REJECTED** | Fails validity: no frozen state/field/event denotes "revision requested"; a superseded version exists after **every** revision, so the proposed derivation does not indicate what it claims; deriving it client-side would embed a business inference in the presentation. Rationale recorded in §6; `unread_clarification` remains the conformant signal. |
| MINOR-04 (classify documents by origin) | **ACCEPTED, grounded** | "Authored / generated by" column added (§7) — display classification only, never an authorization input. Per-document issuer detail for the M4 chain deliberately not asserted (Doc-4F owns it). |
| MINOR-05 (component inventory) | **ACCEPTED, real names** | Inventory added (§10) listing ACTUAL components. The review's example names (`RfqTimeline`, `RfqStatusBadge`, `InvitationCard`, …) do not exist in the codebase and were not adopted. |
| MINOR-06 (Page ↔ API mapping table) | **ACCEPTED** | Page ↔ adapter ↔ frozen-contract map added (§11). |
| NIT-01 (split the diagram into three) | **PARTIAL** | Vendor leg and M4 are now boxed/separated inside ONE diagram (via MAJOR-01). A full three-diagram split is declined — the end-to-end view is this document's purpose. |
| NIT-02 (paragraph width) | **NO ACTION** | Text wraps at ~100 columns per the repo's prettier prose convention. |
| NIT-03 (rename §9) | **ACCEPTED** | §9 renamed "Corpus divergence notes (Raise ≠ Accept)". |
| NIT-04 ("built 2026-07-06" ages the doc) | **ACCEPTED** | §10 renamed "Frontend implementation status"; the date moved to the header's Last-updated/Version rows. |
| NIT-05 (architecture picture) | **ACCEPTED** | "Architecture at a glance" added (§10). |
