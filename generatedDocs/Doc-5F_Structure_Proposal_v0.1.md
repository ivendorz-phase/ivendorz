# Doc-5F — Business Operations (M4 `operations`) API Realization — Structure Proposal v0.1

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.2 — Independent Hard Review (Architecture Board) applied; severities Board-calibrated** (1 MAJOR + 4 MINOR + 3 NITPICK dispositioned, §Review Disposition). Freeze-ready → Structure FROZEN. Structure only |
| Module | Module 4 — Business Operations Engine (`operations` schema; the post-award ERP-Lite layer) |
| Realizes | `Doc-4F` (M4 contracts, FROZEN — **50 contracts**, PassB BC-OPS-1…5 per-Contract-ID blocks) on the bound HTTP transport |
| Authority | `Doc-5_Program_Governance_Note_v1.0`; **`Doc-5A_SERIES_FROZEN_v1.0` (FROZEN) governs this document** |
| Precedent (informational, not authority) | `Doc-5B` (M0) out-of-wire boundary (R1); `Doc-5C` (M1) cross-cutting context/non-disclosure wire model; `Doc-5D` (M2) tri-actor + per-read projection rule. Force derives from `Doc-5A §1.3/§5/§7/§11` |
| Conforms To | `Master_System_Architecture_v1.0_FINAL`, `ADR_Compendium_v1`, Doc-2 v1.0.3, Doc-3 v1.0.2, Doc-4A v1.0 (FROZEN), Doc-4B v1.0 (FROZEN — Core consumed), Doc-4C v1.0 (FROZEN — Identity consumed), Doc-4F v1.0 (FROZEN), Doc-4M v1.0 (FROZEN — cross-module state-machine index; operations edges defined in Doc-2 §3.5/§5.9/§10.5 + Doc-4F — m-01), Doc-5A v1.0 (FROZEN) |
| Contains | Structure only — section map, surface partition (with section-pointer column), ratified realization decisions, the carried freeze-gate dependencies. No endpoints, paths, status tables, schemas, or contract bodies |
| Audience | Architecture Board · API Governance Board · Doc-5F content authors (human + AI) · AI Coding Supervisor · backend, QA |
| Sibling note | `Doc-5E` (M3 `rfq`) is not yet authored; Doc-5F binds M3 only **by pointer** to `Doc-4E` (FROZEN) and is not blocked by Doc-5E. The RFQ→Operations award/invitation seam is realized as **inbound** event consumption (out-of-wire), not an RFQ surface |

Two governing rules shape this document (the Doc-5B/5C/5D precedent):

1. **Realize, never re-decide.** Doc-4F fixed *what* M4's 50 contracts declare (FROZEN); Doc-5A fixed *how* a contract becomes a concrete HTTP API (FROZEN). Doc-5F realizes Doc-4F's caller-facing surface on the wire and re-decides nothing; every rule binds to Doc-5A / Doc-4F / corpus by pointer.
2. **Conformance is an obligation.** Doc-5F passes the Doc-5A **Appendix A** checklist (`CHK-5A-xxx`) before freeze (`Doc-5_Program_Governance_Note_v1.0 §6`). It coins no endpoint, status, header, error class, permission slug, or POLICY key.

---

## Decisions ratified at structure freeze (proposed)

- **R1 — Out-of-wire boundary** (Doc-5B/5C/5D R1 precedent; authority `Doc-5A §1.3/§5/§11`). Doc-5F realizes only the caller-facing HTTP surface (tenant Users). The following **4 contracts have no caller wire** and are documented as the out-of-wire boundary (§9): the **System event consumers** `ops.create_engagement_on_award.v1` (21.5 System, `RFQClosedWon` consumer) and `ops.create_lead_on_invitation.v1` (21.5 System, `VendorInvited` consumer); the **async document-generation job** `ops.generate_document.v1` (21.5 System — enqueued internally by `issue_engagement_document` / template activation, returns no caller wire of its own); and the **internal-service** `ops.read_crm_status_for_routing.v1` (21.3 internal-service, RFQ-routing-consumed under non-disclosure — DF-3, **never tenant-facing**). **Flag-and-halt if any wire is proposed for them.**
- **R2 — Two-sided tenant-User surface; no Admin, no public** (the M4 differentiator). Unlike M2 (Public + User + Admin), M4 has **one actor class on the wire — the tenant User** — but it is **two-sided**: **User(buyer)** controlling-org scope for BC-OPS-1 CRM, the buyer side of BC-OPS-2 engagements, BC-OPS-4 templates, and BC-OPS-5 finance; **User(vendor)** controlling-org scope for BC-OPS-3 leads and the vendor side of an engagement. The `Iv-Active-Organization` context header **is** carried and is **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`). **No Admin (21.6) surface exists** (Doc-4F B.1 — the link-suggestion *decision* is Admin's, DF-5; Operations only *confirms* a link as a tenant write). **No public/anonymous surface.** System is out-of-wire (R1).
- **R3 — `operations` route prefix; `ops.` Contract-ID token** (a deliberate split — `Doc-5A Appendix B.1` registers the M4 route namespace `operations`, `Doc-2 §0.3`; the Doc-4F Contract-ID operation token is `ops.<operation>.v1` with error-code namespace `ops_`, `Doc-4F B.1`/`Doc-4A Appendix B.2`). **The HTTP route prefix is `operations`; the command token is `ops.<operation>` verbatim from Doc-4F.** **Path grammar (§5.3) derives from the route prefix `operations`, never from the `ops.` token stem** — the `ops.<operation>` token is the command identifier only, not a path segment. Doc-5F coins neither.
- **R4 — No token invented.** Endpoints bind existing Doc-2 §7 slugs (the ten `can_manage_*` / `can_approve_*` / `can_record_*` operations slugs, Doc-4F B.4), §9 audit actions, and the §8 event catalog; carried gaps are bound by pointer and **escalated, never invented**: `[ESC-OPS-SLUG]` (Doc-2 §7 additive), `[ESC-OPS-AUDIT]` (un-enumerated CRM / lead / finance-record / counterparty-grant audit actions, Doc-2 §9 additive), `[ESC-OPS-POLICY]` (no `operations` POLICY namespace key registered, Doc-3 §12.2 additive) — `CHK-5A-121` (anti-invention) · `CHK-5A-154` (namespace token) · `Doc-4A §6.4`/§18.2.
- **R5 — Non-disclosure firewall is load-bearing (Invariant #11 — Private Exclusion Stays Private).** `buyer_vendor_statuses` (Approved / Conditional / **Blacklisted**) and all buyer-private CRM facts (records, notes, ratings, favorites, link status) are **tenant-owned and never disclosed** to the vendor or any other tenant. The **only** sanctioned egress of CRM status is the out-of-wire internal-service `read_crm_status_for_routing` (RFQ-consumed, §9), engineered so a blacklist/exclusion is **indistinguishable from a non-match** (`Doc-4A §7.5`; `Doc-2 §10.11`). No status event is emitted; protected-fact-gated reads collapse to a uniform `NOT_FOUND` (no timing side-channel).
- **R6 — Governance-signal firewall; Operations stores no signal** (Invariant #6). Operations **computes and stores no trust / performance / verification / financial-tier signal** (those are Trust — DF-4) and **no matching / eligibility** (RFQ — DF-3). It **emits performance *inputs* only** — the BC-OPS-2 operations event set enumerated in **`Doc-2 §8`**, bound **by pointer and never restated here** — which Trust consumes idempotently into `performance_inputs`. **Buyer Vendor Status is the private, per-buyer governance signal (CLAUDE.md §4) and never mutates a platform-wide score.**
- **R7 — Post-award seam; Operations owns no procurement decision.** Operations begins **after** the RFQ `closed_won` award. The `engagements` row is created **only** by the System consumer of `RFQClosedWon`; the `vendor_leads` row **only** by the System consumer of `VendorInvited` (fires at invitation `delivered`). Doc-5F authors **no** matching / routing / award / invitation surface (RFQ / `Doc-4E` — DF-3); these are inbound, out-of-wire (§9/R1).
- **R8 — Money boundary; records, not rails (DF-6).** The platform **never handles buyer↔vendor transaction money** (Master Architecture). `operations.trade_invoices` ≠ `billing.platform_invoices`; `payment_records` are **bookkeeping records only** — no funds movement, no escrow, no settlement, no payment-gateway surface. Doc-5F realizes `issue_trade_invoice` / `update_trade_invoice_status` / `record_payment` / `confirm_payment` as **document/record state transitions**, never a payment rail. **Flag-and-halt if a settlement/transfer surface is proposed.**
- **R9 — Async document generation (Doc-5A §10 pattern).** The enqueueing user action (per `Doc-4F §F7.3` — a BC-OPS-2/BC-OPS-4 command) triggers the out-of-wire `generate_document` job (§9), idempotent on `generation_job_id`, recording the immutable `template_version` used. The async surface is realized on the **Doc-5A §10 accepted-then-processing pattern** (`Doc-4A §15`): the enqueue returns **`202`**; the **status-resource Query (`get_generated_document`) is the source of truth**, returning **`ASYNC_PENDING`** while pending and **never a fabricated outcome** (`Doc-5A §10.2/§10.3`; `CHK-5A-090/-092`). Cross-counterparty access is realized as explicit `grant_generated_document` / `revoke_generated_document_grant` (the document-grant model), never implicit disclosure.
- **R10 — Event surface via outbox, not webhook.** The BC-OPS-2 performance-input events (`Doc-2 §8`) are emitted to the **M0 transactional outbox** by the realizing command (business write + event insert, one transaction — `Doc-4B`); every other Operations mutation is a **state + §9 audit** action with **no** event. Doc-5A §11 carries **no** caller-facing webhook/push surface (`Doc-5A §11.3`). Cross-module notification rides Communication (DF-7), authored by Communication, not here. Outbox-emission realization (per-command emitter mapping) belongs to the **content phase, not the structure phase**.

---

## M4 surface partition (the structural spine)

> **50 Doc-4F contracts** (PassB BC-OPS-1…5 per-Contract-ID blocks) — **46 caller-facing**, **4 out-of-wire**. Each row carries an explicit **Doc-5F §** owner; every contract is assigned to exactly one section. §3 is a cross-cutting wire-model section and **owns no endpoint**.

| Doc-4F contracts | Nature | **Doc-5F §** |
|---|---|---|
| BC-OPS-1 `create_private_vendor`, `update_private_vendor`, `archive_private_vendor`, `add_private_vendor_note`, `set_private_vendor_rating`, `set_buyer_vendor_status`, `clear_buyer_vendor_status`, `set_vendor_favorite`, `clear_vendor_favorite`, `confirm_vendor_link`, `dismiss_vendor_link` · `get_private_vendor`, `list_private_vendors`, `get_buyer_supplier_relationship` | User(buyer) command / query (21.4 / 21.3; non-disclosure load-bearing — R5) | **§4** `POST` / `GET` |
| BC-OPS-2 `update_engagement_status`, `close_engagement`, `record_delivery`, `record_buyer_feedback`, `issue_engagement_document`, `revise_engagement_document`, `issue_trade_invoice`, `update_trade_invoice_status`, `record_payment`, `confirm_payment` · `get_engagement`, `list_engagements`, `get_engagement_document` | User(buyer/vendor) command / query (21.4 / 21.3; §3.5/§10.5 machines; perf events → outbox R10; money boundary R8) | **§5** `POST` / `GET` |
| BC-OPS-3 `update_lead_stage`, `add_lead_activity` · `get_lead`, `list_leads` | User(vendor) command / query (21.4 / 21.3; lead §3.5 machine) | **§6** `POST` / `GET` |
| BC-OPS-4 `create_template`, `add_template_version`, `activate_template`, `archive_template`, `reactivate_template`, `grant_generated_document`, `revoke_generated_document_grant` · `get_template`, `list_templates`, `get_generated_document`, `list_generated_documents` | User(buyer/vendor) command / query (21.4 / 21.3; template §5.9 versioning; doc-grant model R9) | **§7** `POST` / `GET` |
| BC-OPS-5 `create_finance_record`, `update_finance_record` · `get_finance_record`, `list_finance_records` | User(buyer/vendor) command / query (21.4 / 21.3; no lifecycle) | **§8** `POST` / `GET` |
| BC-OPS-2 `create_engagement_on_award` · BC-OPS-3 `create_lead_on_invitation` | System event consumer (21.5; RFQ seam — DF-3/R7) | **§9** out-of-wire |
| BC-OPS-4 `generate_document` | System async job (21.5; R9) | **§9** out-of-wire |
| BC-OPS-1 `read_crm_status_for_routing` | internal-service read (21.3; RFQ-routing, non-disclosure — DF-3/R5) | **§9** out-of-wire |

§3 is a **cross-cutting wire-model section and owns no endpoint** — §4–§8 each depend on it (see §3 purpose).

---

## §0 — Document Control, Precedence & Conformance Obligation
- **Purpose:** Doc-5F's precedence (… → Doc-4A → Doc-4F → Doc-5A → **Doc-5F** → Code); the obligation to conform to Doc-5A in full and pass Appendix A; realize-never-redecide; flag-and-halt.
- **Dependencies:** `Doc-5A §0`; `Doc-5_Program_Governance_Note_v1.0`. **Detail:** short, normative.

## §1 — Scope, Audience & M4 Surface Partition
- **Purpose:** what Doc-5F governs (the M4 caller-facing HTTP surface — two-sided tenant User only) and does not; carry the surface-partition table; the **§1.x dependency boundary** (M4 owns realization only for M4 surfaces; cross-module → owning module's Doc-5x — Identity → Doc-5C, Marketplace → Doc-5D, RFQ → Doc-5E, Trust → Doc-5G, Admin → Doc-5J, Billing → Doc-5I; **M4 consumes, never realizes, those surfaces**); register carried dependencies **DF-1…DF-8** + `[ESC-OPS-SLUG]` / `[ESC-OPS-AUDIT]` / `[ESC-OPS-POLICY]` by pointer (resolved only via their Doc-4F channels; none resolved here).
- **Dependencies:** `Doc-5A §1`; `Doc-4F §F0`, Appendix (DF-1…DF-8). **Detail:** scope + partition + carried-dependency table.

## §2 — Realized Endpoint Inventory
- **Purpose:** the `operations`-route HTTP surface — one row per **caller-facing** endpoint (the 46 User commands/queries): method (§5.2), path grammar (§5.3, prefix `operations`), actor side (buyer / vendor) + active-org applicability (§7), success status (§5.5; `ASYNC_PENDING` where document generation is enqueued — R9). Command tokens = the exact `ops.<operation>` operation names **verbatim from the Doc-4F PassB per-Contract-ID blocks** (`ops.<operation>.v1`; `Doc-4A §21` / `Doc-5A §5`). **Inventory ordering within each section is non-authoritative and informational only; section ownership (the partition table) is authoritative — on any conflict, the partition table wins.** Every endpoint instantiates the §5.7 template (filled in content).
- **Dependencies:** `Doc-5A §5`, App B.1 (`operations`); `Doc-4F` PassB (50-contract inventory). **Detail:** inventory table (paths in content pass).

## §3 — Cross-Cutting Two-Sided Actor, Context & Non-Disclosure Wire Model *(mechanism only — owns no endpoint)*
- **Purpose:** the defining Doc-5F cross-cutting section — realize, on the wire, the **two-sided actor + non-disclosure mechanism** §4–§8 endpoints all depend on (it instantiates no endpoint body): `Authorization` bearer = authentication only; **`Iv-Active-Organization` server-validated, never client-trusted** (R2); the **buyer-side vs vendor-side resource-scope** model (buyer org = `buyer_organization_id`; vendor side = `controlling_organization_id`); the three-layer authorization check **OR §6B delegation grant** for a representative org acting for a vendor it does not control — all resolved **server-side** via Identity's `check_permission`. **`check_permission` is the sole authorization authority consumed by M4 surfaces; no parallel or shadow authorization path is permitted (`Doc-4A §5.3`, `Doc-4A §6`).** The **non-disclosure firewall** (R5) — `buyer_vendor_statuses` and buyer-private CRM never disclosed; uniform `NOT_FOUND` collapse on protected-fact-gated reads — and the **money/governance firewalls as wire constraints** (R6/R8). **Per-read disclosure-scope rule (binding):** every read surface in §4–§8 **shall explicitly declare which disclosure scope it serves — Buyer-Org-Private, Vendor-Counterparty, Shared-Engagement, or Internal-Service** — in its content-pass block; an ambiguous or undeclared scope is a **content-authoring blocker**. **Per-command actor-side rule (binding, M-01):** every command surface in §4–§8 **shall explicitly declare which actor side may drive it — Buyer, Vendor, or Either** — in its content-pass block (e.g. `record_delivery` = vendor/either, `record_buyer_feedback` = buyer); an ambiguous or undeclared actor side is a **content-authoring blocker**. The two rules are symmetric (read disclosure ↔ write actor side) and together fix the two-sided realization per surface. No endpoint is instantiated here.
- **Dependencies:** `Doc-5A §6.3/§7`; `Doc-4A §5/§5.3/§6/§6B/§7.5`; `Doc-4C §C3/§C8` (consumed authorization root); `Doc-4F §F4` (non-disclosure). **Detail:** cross-cutting wire-model declaration; bound, not redefined; no endpoint instantiation.

## §4 — Buyer Private CRM Surface Realization (BC-OPS-1)
- **Purpose:** the §F4 buyer-private CRM commands + reads — private-vendor records (create / update / archive; `active ⇄ archived`), notes & ratings, **buyer-vendor-status** set/clear (append-only Approved / Conditional / Blacklisted history — **never disclosed, never evented**, R5), vendor favorites, and vendor-link **confirm/dismiss** (the suggestion entity is Admin-owned — DF-5; Operations writes its own row); buyer-org-private reads (`get_private_vendor`, `list_private_vendors`, `get_buyer_supplier_relationship`), each **declaring Buyer-Org-Private disclosure scope** (§3 rule); idempotency/concurrency (§9); error mapping (§6) with non-disclosure `NOT_FOUND` collapse; **top-level `reference_id` (C-05) — the Doc-5F nominated declaration point, cross-cutting to §5–§8** (`Doc-4A §22.1 C-05`, clarified by `PATCH-D4A-C05-204`: body-bearing responses only, `204` exempt; `CHK-5A-042` [B]); `[ESC-OPS-AUDIT]` on the un-enumerated CRM mutations. The CRM-status read-service is out-of-wire (§9/R5).
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4F §F4`; `Doc-4M` (cross-module state-map index; edges defined in Doc-2/Doc-4F); `Doc-2 §3.5/§10.5/§10.11`. **Detail:** command + private-read realization.

## §5 — Procurement Engagement & Commercial Documents Surface Realization (BC-OPS-2)
- **Purpose:** the §F5 post-award engagement surface — engagement lifecycle (`open → in_delivery → completed → closed`; status/close/delivery/buyer-feedback commands; the System award-consumer is out-of-wire §9/R7); **commercial documents** (`issue_engagement_document` / `revise_engagement_document` for LOI/PO/challan/WCC bodies referencing an active `template_version`; async generation enqueued — R9); **trade invoices** (`issue_trade_invoice`, `update_trade_invoice_status`; `issued → partially_paid → paid|disputed|cancelled`) and **payment records** (`record_payment`, `confirm_payment`; `recorded → confirmed`) realized as **records, not rails** (R8 — no settlement surface); the BC-OPS-2 performance-input events emitted to the outbox (R10); shared-engagement reads (`get_engagement`, `list_engagements`, `get_engagement_document`) declaring disclosure scope; idempotency/concurrency; error mapping.
- **Dependencies:** `Doc-5A §5/§6/§9/§11`; `Doc-4F §F5`; `Doc-4M` (cross-module state-map index; edges defined in Doc-2/Doc-4F); `Doc-2 §3.5/§5.9/§10.5`. **Detail:** engagement + commercial-document realization.

## §6 — Vendor Lead Pipeline Surface Realization (BC-OPS-3)
- **Purpose:** the §F6 vendor-side lead surface — `update_lead_stage` (`received → quoted → negotiation → won|lost → follow_up`, **no candidate state invented** — edges `Doc-2 §3.5`) and `add_lead_activity` commands, `get_lead` / `list_leads` reads (vendor-controlling-org scope), each declaring disclosure scope; the System invitation-consumer that creates the lead is out-of-wire (§9/R7); `[ESC-OPS-AUDIT]` on the un-enumerated lead mutations; idempotency/concurrency; error mapping.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4F §F6`; `Doc-4M` (cross-module state-map index; edges defined in Doc-2/Doc-4F); `Doc-2 §3.5`. **Detail:** vendor-lead realization.

## §7 — Document Templates & Generated Documents Surface Realization (BC-OPS-4)
- **Purpose:** the §F7 template + generated-document surface — template lifecycle (`create_template`, `add_template_version`, `activate_template`, `archive_template`, `reactivate_template`; `draft → active → archived`, new version `active → active`, `archived → active`; **versions immutable, never overwritten** — edges `Doc-2 §5.9`); generated-document reads (`get_generated_document`, `list_generated_documents`; **`ASYNC_PENDING` while the out-of-wire `generate_document` job runs** — §9/R9); the **document-grant model** (`grant_generated_document` / `revoke_generated_document_grant`) for explicit cross-counterparty access (never implicit disclosure), declaring disclosure scope; `[ESC-OPS-AUDIT]` on the counterparty-grant action; idempotency/concurrency; error mapping.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4F §F7`; `Doc-4M` (cross-module state-map index; edges defined in Doc-2/Doc-4F); `Doc-2 §5.9`. **Detail:** template + generated-document realization.

## §8 — Finance Records Surface Realization (BC-OPS-5)
- **Purpose:** the §F8 finance-record surface — `create_finance_record`, `update_finance_record` commands (no lifecycle machine — simple records) and `get_finance_record`, `list_finance_records` reads (controlling-org scope), declaring disclosure scope; **records only, no funds movement** (R8 — distinct from Billing `platform_invoices`, DF-6); `[ESC-OPS-AUDIT]` on the un-enumerated finance-record mutations (Doc-2 §9 Financial domain names trade-invoice/payment actions, not finance-record); idempotency/concurrency; error mapping.
- **Dependencies:** `Doc-5A §5/§6/§9`; `Doc-4F §F8`; `Doc-2 §3.5`. **Detail:** finance-record realization.

## §9 — Out-of-Wire Boundary (System event consumers · async doc-gen job · internal-service CRM read)
- **Purpose:** declare that the 4 out-of-wire contracts have **no HTTP wire** — the System event consumers (`create_engagement_on_award` ← `RFQClosedWon`; `create_lead_on_invitation` ← `VendorInvited`), the async `generate_document` job (enqueued internally; idempotent on `generation_job_id`), and the internal-service `read_crm_status_for_routing` (RFQ-routing-consumed under non-disclosure — DF-3) — are in-process services / background workers / event consumers invoked within other modules' transactions or driven by the outbox. **Out-of-wire contracts have no caller wire in any protocol: no REST endpoint, no SSE stream, no WebSocket, no Webhook.** Implementation is code / Doc-6. **Flag-and-halt if any wire surface in any protocol is proposed** (an architecture change). The CRM-status read-service being out-of-wire is the highest-stakes application of R1/R5 (non-disclosure).
- **Dependencies:** `Doc-4F §F4/§F5/§F6/§F7`, Appendix (DF-3); `Doc-5A §1.3/§11`. **Detail:** boundary statement only — no realization.

## §10 — Conformance & Carried Items
- **Purpose:** Doc-5F's attestation against Doc-5A **Appendix A** (the freeze gate); the carried-items register (DF-1…DF-8 + `[ESC-OPS-SLUG]` / `[ESC-OPS-AUDIT]` / `[ESC-OPS-POLICY]`) by pointer with each named resolution channel; statement that Doc-5F coins nothing.
- **Dependencies:** `Doc-5A Appendix A`; `Doc-4F §F0`, Appendix. **Detail:** attestation + carried-item register.

## Appendix A — Doc-5F Conformance Attestation
- **Purpose:** per-band pass/fail against the applicable `CHK-5A-xxx` checks for the realized M4 surface; the freeze evidence. Includes a dedicated **non-disclosure attestation band** (the M4-unique, load-bearing risk not covered by a single `CHK-5A-xxx`): *no buyer-vendor-status or buyer-private CRM fact is surfaced on any tenant wire; the blacklist-indistinguishable-from-non-match property holds; the CRM-status egress is out-of-wire only* — and a **money-boundary band**: *no trade-invoice/payment/finance surface exposes a funds-movement or settlement operation.*
- **Dependencies:** `Doc-5A Appendix A`; §3 (disclosure-scope rule, R5); R8. **Detail:** attestation table (content pass).

---

## Open Carried Items (Doc-4F Appendix — resolved only via named channels, never here)

| ID | Item | Doc-5F handling | Freeze gate? |
|---|---|---|---|
| **DF-1** | Identity — `check_permission` / org-context / §6B delegation, consumed | Authorization resolved server-side via Identity (`Doc-4C §C3/§C8`); no shadow authz (§3); Doc-5F realizes no Identity surface | **No** |
| **DF-2** | Marketplace — `vendor_profile_id` existence (read-only refs) | Cross-module refs are bare UUIDs validated by service; no Marketplace surface realized; private CRM links by pointer | **No** |
| **DF-3** | RFQ — consumes the CRM-status read-service; emits `RFQClosedWon`/`VendorInvited` | The CRM read-service + both event consumers are **out-of-wire** (§9); Doc-5F authors no matching/award (R7); RFQ bound to `Doc-4E` by pointer | **No** — out-of-wire |
| **DF-4** | Trust — Operations emits performance *inputs*, computes no score *(DF-4/DF-6/DF-7 text confirm verbatim at content)* | BC-OPS-2 emits the Doc-2 §8 event set to the outbox (R6/R10); no trust/performance surface realized | **No** |
| **DF-5** | Admin — `link_suggestions` candidate is Admin-owned | No Admin surface (R2); Operations realizes `confirm_vendor_link` / `dismiss_vendor_link` as **tenant writes** on its own row; suggestion entity bound to `Doc-4J` by pointer | **No** |
| **DF-6** | Billing — money boundary (`trade_invoices` ≠ `platform_invoices`; payment records, no funds) | Trade-invoice / payment / finance realized as **records, not rails** (R8); no Billing surface, no settlement; flag-and-halt on any transfer surface | **No** |
| **DF-7** | Communication — notification fan-out (co-consumer on `VendorInvited`) | Notification dispatch is Communication-authored (R10); Operations authors only its outbox events; no notification surface realized | **No** |
| **DF-8** | Platform Core — `core.allocate_human_reference` / audit-write / outbox / storage, consumed | Consumed via Doc-4B mechanisms by pointer; never re-implemented; no Core surface realized | **No** |
| `[ESC-OPS-SLUG]` | A required Operations action may lack a Doc-2 §7 slug | Interim binding to the nearest existing `can_*` slug by pointer; channel: Doc-2 §7 additive; no slug invented | **No** |
| `[ESC-OPS-AUDIT]` | CRM / lead / finance-record / counterparty-grant mutations not separately enumerated in Doc-2 §9 | Bound by pointer to the nearest Doc-2 §9 domain action; **interim**, not finalized; channel: Doc-2 §9 additive enumeration | **No** |
| `[ESC-OPS-POLICY]` | No `operations` POLICY namespace key registered (dedup window / list page-size) | Referenced by **intended key name** by pointer; resolved via the **Doc-3 §12.2 additive registration patch** (precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2 / `trust.*` v1.3; Doc-4A §18.2), human/Board-approved; not invented (`CHK-5A-121/123`). **`[ESC-OPS-POLICY]`-keyed contracts not finalized until registered** | **Structure: No. Content: YES** — `CHK-5A-121` content-freeze gate (Doc-5E/5D/5G precedent): the content Freeze Audit **blocks** if any referenced `operations.*` key is absent from Doc-3 §12.2 (the `operations` POLICY namespace must be created — none exists today). Resolve via the registration patch first |

## Fences / Out of scope

Cross-module realization (owning module's Doc-5x — §1.x) · any other module's surface (incl. Doc-5E RFQ — bound by pointer only) · resolving DF-1…DF-8 / `[ESC-OPS-*]` · framework/DB/job-engine implementation (code/Doc-6) · giving any of the 4 out-of-wire contracts a wire in any protocol · authoring matching/routing/award (RFQ/Doc-4E — DF-3), any trust/performance signal (Trust/Doc-4G — DF-4), any Admin decision (Doc-4J — DF-5), any Billing/settlement/funds surface (Doc-4I — DF-6/R8), or any notification dispatch (Communication/Doc-4H — DF-7) · coining any endpoint/status/header/error-class/slug/POLICY key/event.

---

## Structure self-audit (post-review v0.2)

| Check | Result |
|---|---|
| Every Doc-4F caller-facing contract assigned to exactly one §4–§8 realization section (partition § column) | ✅ — 46 caller-facing → §4(14)/§5(13)/§6(4)/§7(11)/§8(4) |
| Every System / async-job / internal-service contract assigned to §9 out-of-wire | ✅ — 4 |
| Total = 50 (matches Doc-4F PassB BC-OPS-1…5 inventory) | ✅ — 46 + 4 |
| Two-sided User actor (buyer/vendor scope) isolated; no Admin, no public surface | ✅ — R2 |
| Non-disclosure firewall: buyer-vendor-status never on a tenant wire; CRM read-service out-of-wire; `NOT_FOUND` collapse | ✅ — R5 / §9 |
| Money boundary: trade-invoice/payment/finance = records, not rails; no settlement surface | ✅ — R8 / DF-6 |
| Governance-signal firewall: emits perf inputs only; stores no score; Buyer Vendor Status never mutates platform score | ✅ — R6 |
| Post-award seam: engagement/lead created only by System event consumers (out-of-wire); no award/matching authored | ✅ — R7 / DF-3 |
| Async doc-gen: `generate_document` out-of-wire job; `ASYNC_PENDING`; retrieval + grant model caller-facing | ✅ — R9 |
| Route prefix `operations` (App B.1) vs Contract-ID token `ops.` (Doc-4F) split stated; neither coined | ✅ — R3 |
| State-machine edges bound to Doc-2 §3.5/§5.9/§10.5 (source) + Doc-4M (cross-module index) in §4–§7; no edge invented | ✅ — m-01 |
| Per-read disclosure-scope rule declared (Buyer-Org-Private / Vendor-Counterparty / Shared-Engagement / Internal-Service); ambiguity = content blocker | ✅ — §3 |
| Per-command actor-side rule declared (Buyer / Vendor / Either); ambiguity = content blocker | ✅ — M-01 / §3 |
| Async doc-gen bound to Doc-5A §10 pattern (`202` + status-resource source of truth + `ASYNC_PENDING`, no fabricated outcome) | ✅ — M-02 / R9 |
| Event posture: outbox emission (R10), no webhook; emitter mapping deferred to content | ✅ — R10 |
| Carried DF-1…DF-8 + `[ESC-OPS-*]` registered by pointer; none resolved here | ✅ |
| Nothing coined; `operations` route + `ops_` codes bound to registries | ✅ — R3/R4 |
| `[ESC-OPS-POLICY]` flagged CHK-5A-121 content-freeze gate (additive Doc-3 §12.2 `operations.*` patch; `operations` namespace must be created) | ✅ — ADD-1 (Doc-5E/5D/5G precedent) |
| Top-level `reference_id` (C-05) nominated declaration point present (§4, cross-cutting §5–§8) | ✅ — ADD-2 (CHK-5A-042 [B]; pre-empts Doc-5D Pass-2 blocker) |
| Partition independently verified at freeze: 50 = 46 caller-facing + 4 out-of-wire; §4(14)/§5(13)/§6(4)/§7(11)/§8(4) | ✅ — grep-counted vs Doc-4F PassB |

---

## Review Disposition (Independent Hard Review — Architecture Board — v0.1 → v0.2)

> **Board severity calibration:** M-02 downgraded MAJOR → **MINOR** (the async surface was not undefined — R9 already fixed `generate_document` as the out-of-wire job and named `ASYNC_PENDING` + `get_generated_document`; only the tighter `Doc-5A §10` linkage for audit traceability was missing). m-04 downgraded MINOR → **NITPICK** (the "enqueued by `issue_engagement_document` / template-driven generation" wording is a structure-level description, not a realization commitment — no architecture risk). All fixes applied regardless of tier.

| Finding | Sev (calibrated) | Disposition |
|---|---|---|
| **M-01** Two-sided write-side actor rule missing — §3 had per-read disclosure rule but no symmetric per-command actor-side rule | MAJOR | **FIXED** — added a binding **per-command actor-side rule** to §3 (every §4–§8 command declares Buyer / Vendor / Either; ambiguity = content blocker); symmetric with the per-read rule; self-audit row added. |
| **M-02** Async doc-gen under-bound — R9/§7 named `ASYNC_PENDING` but not the Doc-5A §10 pattern | **MINOR** *(Board-downgraded from MAJOR)* | **FIXED** — R9 now binds `Doc-5A §10` + `Doc-4A §15`: `202` on enqueue, `get_generated_document` status-resource = source of truth, `ASYNC_PENDING` while pending, no fabricated outcome (`CHK-5A-090/-092`); self-audit row added. |
| **m-01** State-authority over-attributed to Doc-4M (Doc-4M delegates operations machines to Doc-2 §3.5/§10.5 + Doc-4F) | MINOR | **FIXED** — edge source re-cited to `Doc-2 §3.5/§5.9/§10.5`; Doc-4M relabelled **cross-module state-map index** in §4–§7 deps + §6/§7 inline + self-audit. |
| **m-02** R6 re-enumerated the Doc-2 §8 event set (reference-never-restate breach, Doc-5D M-02 lesson) | MINOR | **FIXED** — parenthetical replaced with a pure `Doc-2 §8` pointer. |
| **m-03** Route/token path-derivation rule absent | MINOR | **FIXED** — R3 now states path grammar derives from route prefix `operations`, never the `ops.` token stem. |
| **m-04** `generate_document` enqueue trigger imprecise ("template activation" unconfirmed) | **NITPICK** *(Board-downgraded from MINOR)* | **FIXED** — R9 binds the enqueue trigger to `Doc-4F §F7.3` by pointer; exact command mapping deferred to content. |
| **NP-01** self-audit header "(pre-review)" | NITPICK | **APPLIED** — changed to "(post-review v0.2)". |
| **NP-02** DF-4/DF-6/DF-7 text partly from extraction | NITPICK | **APPLIED** — carried-items table flags "confirm verbatim at content"; DF-3…DF-8 grep-verified during review. |
| **ADD-1** (round-2, post-Doc-5G) `[ESC-OPS-POLICY]` posture stale vs the Doc-5E/5D/5G content-freeze-gate precedent | MAJOR | **FIXED** — `[ESC-OPS-POLICY]` now foreshadows the additive Doc-3 §12.2 `operations.*` registration patch (precedent `core.*` v1.0 / `rfq.*` v1.1 / `marketplace.*` v1.2 / `trust.*` v1.3; Doc-4A §18.2) and flags it a **CHK-5A-121 content-freeze gate** (non-gate for structure freeze; the `operations` POLICY namespace must be created). |
| **ADD-2** (round-2) `reference_id` (C-05) declaration point unnominated | MINOR | **FIXED** — §4 purpose now nominates the top-level `reference_id` (C-05) declaration point, cross-cutting §5–§8 (CHK-5A-042 [B]); pre-empts the Doc-5D Pass-2 retrofit. |

---

*End of Doc-5F Structure Proposal v0.2. Structure only; Independent Hard Review (Architecture Board) applied, severities Board-calibrated — **1 MAJOR + 4 MINOR + 3 NITPICK** resolved (M-02 downgraded MAJOR→MINOR; m-04 MINOR→NITPICK). No open BLOCKER/MAJOR/MINOR; **freeze-ready**. On any conflict, Doc-5A (FROZEN) and the frozen corpus win; flag-and-halt. Next: promote to `Doc-5F_Structure_v1.0_FROZEN` (consolidated; review/disposition commentary stripped, anchors verified verbatim); then compressed content passes (Pass-1 = §0–§3 + inventory; Pass-2 = §4–§5; Pass-3 = §6–§10 + Appendix A), each conforming to this structure.*
