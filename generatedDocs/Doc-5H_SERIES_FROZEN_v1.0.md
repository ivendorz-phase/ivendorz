# Doc-5H_SERIES_FROZEN_v1.0

| Field | Value |
|---|---|
| Document | `Doc-5H_SERIES_FROZEN_v1.0` |
| Status | **FROZEN** (with one applied additive Doc-3 §12.2 registration — `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication`, APPROVED; the `[ESC-COMM-POLICY]` content-freeze gate cleared) |
| Freeze Date | 2026-06-26 |
| Freeze Authority | `governanceReviews/Doc-5H_Freeze_Readiness_Audit_v1.0.md` — READY TO FREEZE (BLOCKER=0 · MAJOR=0 · MINOR=0; the sole content-freeze gate resolved by Patch v1.5) |
| Module | Module 6 — Communication (`communication` schema) — **the delivery-only transport / notification fan-out layer; where the single-authorship + non-disclosure firewalls are realized** |
| Realizes | `Doc-4H` (M6 contracts, FROZEN — 23 contracts: 19 caller-facing + 4 out-of-wire) on the bound HTTP transport |
| Nature | **Document-level frozen designation.** Governance closure for Doc-5H — M6 API Realization. This manifest **designates and assembles**; it authors nothing, defines nothing, resolves nothing. Effective content = the registered passes + resolved registers, read in order under the cleaning rules below. |
| Corpus Authority | Master Architecture v1.0 FINAL → ADR Compendium v1 → Doc-2 v1.0.3 · Doc-3 v1.0.2 (+ Policy-Key Patches v1.0/v1.1/v1.2/v1.3/v1.4/v1.5) → Doc-4A–4M (FROZEN) → **Doc-5A (FROZEN)** · Doc-5B · Doc-5C · Doc-5D · Doc-5E · Doc-5F (FROZEN) · Doc-5G (FROZEN) → **Doc-5H** → Doc-5I…5M → Code |
| Conflict Rule | FLAG-AND-HALT |

---

## Program Certification

```
BLOCKER = 0   MAJOR = 0   MINOR = 0   NITPICK = 0 (review records carry methodology notes)
```

**Audit Status: READY TO FREEZE — one applied additive Doc-3 §12.2 registration (Patch v1.5), no open dependency**

**Governance Status: DOC-5H FROZEN**

Doc-5H is the per-module realization of **Module 6 — Communication, the delivery-only transport / notification fan-out layer**: it binds the frozen Doc-4H contracts to concrete HTTP endpoints under the `communication` route namespace (Contract-ID token `comm.<op>.v1`; R3 split), realizes the cross-cutting **User + Admin** actor / context / non-disclosure wire model (§3), and applies the out-of-wire boundary (R1) to the notification event-consumer fan-out, the delivery dispatch/provider-callback/retry System contracts, and any dual-audience internal leg (§8). It realizes the 19 caller-facing endpoints across messaging & threads, notifications, delivery tracking, and support communications. It passes the Doc-5A **Appendix A** conformance checklist in full, with dedicated attestations for the **delivery-only / single-authorship (R5)**, the **delivery-aggregate ownership (R8 / `[REC-COMM-OWNERSHIP]`)**, the **non-disclosure firewall (R10)**, and the **append-only invariant (R12)**.

---

## Frozen Document Register (effective content = these, in order)

| Section(s) | Source pass (base) | Applied resolutions |
|---|---|---|
| Canonical structure / TOC | `Doc-5H_Structure_v1.0_FROZEN.md` | R1–R12 + DH-1…DH-8 + `[REC-COMM-OWNERSHIP]` ratified at structure freeze (Board pre-authoring 1 BLOCKER + 4 MAJOR + 6 MINOR + 7 NITPICK; Independent Hard Review 2 MINOR + 2 NITPICK; partition independently verified 19+4; history in `Doc-5H_Structure_Proposal_v0.1.md` + `Doc-5H_Structure_Freeze_Audit_v1.0.md`) |
| §0 Document Control · §1 Scope & M6 Surface Partition · §2 Realized Endpoint Inventory (19) · §3 Cross-Cutting Actor / Delivery-Only / Non-Disclosure Wire Model | `Doc-5H_Content_v1.0_Pass1.md` | User+Admin (no public); `check_permission` sole authority (no shadow path); per-read disclosure-scope + per-command actor-side binding rules; R5/R6/R9/R10; `reference_id` (C-05) + `[ESC-COMM-POLICY]` (now cleared) obligations; DELETE+body status rule (200 body / 204 no-body — NP-01); Row-13 formal Own-or-Support label (NP-02); partition reconciles to 23 |
| §4 Messaging & Threads (BC-COMM-1) · §5 Notifications (BC-COMM-2) | `Doc-5H_Content_v1.0_Pass2.md` | thread `open→closed` (history retained, R12); notification `unread→read→archived` strict-linear (notification kept, R12); RFQ scrub seam read-by-service + content-side apply, no cache/copy/extend/override (R7); realtime = delivery channel, `get_messages` source of truth (R9); recipient/participant disclosure scope; read-state firewall (R6). Hard-review fixes: `send_message`→201 no Location (no standalone message GET — M-01); §4.3 `Doc-4A §9` nine-stage pipeline (M-02); `close_thread` OCC `expected_status`/`Doc-4A §14` (M-03); notification FSM edges `Doc-2 §3.7/§10.7` (M-04); §5.4 read-state firewall `Doc-4A §4A`+`§H7` (NP-01) |
| §6 Delivery Tracking (BC-COMM-3) · §7 Support Communications (BC-COMM-4) · §8 Out-of-Wire Boundary · §9 Conformance & Carried Items · Appendix A Conformance Attestation | `Doc-5H_Content_v1.0_Pass3.md` | `get_delivery_status` dual-mode GET; Own-or-Support scope; `[REC-COMM-OWNERSHIP]` reconfirmed verbatim §6.4 (Outbound Log M6-owned; provider callbacks mutate only M6 state — R8); delivery logs never caller-writable (R12); ticket `open→in_progress→resolved→closed` (Doc-2 §3.7 / Doc-4H §H13); two-sided User/Admin actor→transition table (User `resolved→closed` only; staff-only legs by User → `AUTHORIZATION` not `STATE`); ticket stays M6-owned (m-COMM-03); `add_ticket_message`→201 no Location; §8 4 out-of-wire + 5-protocol fence (REST/SSE/WS/webhook/GraphQL) + provider-webhook=inbound infra (R8/R11); CHK-5A-071/121 → **cleared** by Patch v1.5; 14 CHK-5A bands (async N/A) + 4 M6-unique attestation bands |

Governing authority for all sections: `Doc-5_Program_Governance_Note_v1.0`; conformance gate: `Doc-5A Appendix A`.

---

## Assembly & Cleaning Rules (for any future consolidated monolith or reader)

1. **Order** = the register above (structure, then §0→§9, then Appendix A).
2. **Apply resolutions** in place at their named section; the resolved wording supersedes the original pass text.
3. **Strip** per-pass scaffolding on assembly: pass header tables, "Hard Review applied" status lines, and review notes.
4. **Anchors verbatim** — every `Doc-5A §X` / `Doc-4H §X` / `Doc-2` / `Doc-4M` / `Doc-4A` / `Doc-4C §C3/§C8` / `Doc-4E` pointer is preserved exactly; reference-never-restate holds; **M6 emits no Doc-2 §8 event; no buyer/score/match surface on any wire**.
5. **No content change on assembly** — assembly is mechanical; any substantive change requires a new Doc-5H amendment (`Doc-5_Program_Governance_Note_v1.0 §5`).

---

## Ratified Structural Decisions (carried from structure freeze)

| ID | Decision |
|---|---|
| **R1** | Out-of-wire boundary — 4 System contracts (`create_notification` event-consumer fan-out; `create_delivery_record` dispatch job; `update_delivery_status` provider-webhook callback; `retry_delivery` retry job) have no caller wire (§8). No caller `202` (no M6 caller-facing async surface). |
| **R2** | Multi-actor: User + Admin; no public, System out-of-wire — User (messaging `can_use_messaging`; notification recipient; tickets `can_raise_support_ticket`) under server-validated `Iv-Active-Organization`; Admin (`staff_can_support`, no org context) on tickets + delivery-status reads. No public/anonymous surface. |
| **R3** | `communication` route prefix; `comm.<op>.v1` Contract-ID token; `comm_` error prefix (deliberate split — path grammar derives from `communication`, never the `comm.` stem; Doc-5A App B.1; Doc-2 §0.3). Namespace immutable after freeze. |
| **R4** | No token invented — Doc-2 §7 slugs (`can_use_messaging`, `can_raise_support_ticket`, `staff_can_support`) / §9 audit / §8 events / Doc-3 §12.2 keys; carried gaps (`[ESC-COMM-SLUG]`/`[ESC-COMM-AUDIT]`/`[ESC-COMM-POLICY]`/`[ESC-COMM-EVENT]`) escalated. |
| **R5** | Delivery-only / single-authorship (M6 signature) — M6 owns notification fan-out + delivery transport; the emitting module authors the Doc-2 §8 event, M6 consumes + dispatches; `create_notification` is a System event-consumer (out-of-wire); a consumed payload is observational only, never API-contract authority. |
| **R6** | Delivery/governance firewall (DH-5/DH-6) — a delivery outcome is observability, never a score/eligibility/business signal; M6 computes/owns no score; no entitlement/plan gates delivery in a way touching trust/eligibility/routing; notification read/archive state ⇏ prioritization/matching/trust. |
| **R7** | RFQ scrub-rule seam (DH-3) — `send_message` on `rfq_clarification` reads the RFQ-owned scrub rule via service + applies content-side; content rejected → `BUSINESS`; M6 cannot cache/copy/extend/override; rule stays RFQ-owned; no procurement decision. |
| **R8** | Provider-webhook inbound boundary + delivery-aggregate ownership — the **Outbound Log aggregate (`email_logs`/`sms_logs`/`whatsapp_logs`, VO `DeliveryStatus`) is M6-owned**; a provider callback mutates only M6-owned state; `update_delivery_status` is an inbound infra signal, **NOT a Doc-2 §8 event**; forward-only `queued→sent→delivered\|failed` (retry `failed→queued`); webhook ingress is infrastructure, out-of-wire (§8). |
| **R9** | Realtime chat = delivery channel, not an API surface — `send_message`/`get_messages` are the caller wire; realtime push (Supabase Realtime, DH-8) is a delivery channel (`Doc-5A §10` / `Doc-4A §15.7`), observations only, no state-transition authority; `get_messages` is the source of truth. |
| **R10** | Non-disclosure firewall — thread/message/notification/ticket/delivery reads participant/recipient/scope-gated; non-participant/non-recipient/out-of-scope → uniform `NOT_FOUND` (`Doc-5A §6.3/§7`; `Doc-4A §7.5`); no cross-tenant leak; timing-uniformity. |
| **R11** | No emitted event surface; M6 is a consumer — M6 emits **no** Doc-2 §8 event (delivery-only; `[ESC-COMM-EVENT]` — none today); Doc-5A §11 outbox-emission surface N/A; provider webhook is inbound infra, not an M6-emitted webhook; no caller webhook/push. |
| **R12** | Append-only & no-destructive-close (Invariant #8) — messages, delivery logs, ticket messages append-only, never overwritten/hard-deleted; `close_thread` keeps message history; `archive_notification` keeps the notification; `close_ticket` keeps ticket history; delivery logs never caller-writable (written only by §8 System contracts). |

## Realization Conventions (frozen-sourced, within Doc-5H authority)

- **`close_thread` / `close_ticket` / `update_ticket` / `mark_notification_read` / `archive_notification` → `POST` named state command** (named command-name = the contract operation token per Doc-5A §5.2/§5.3; bare `update`/`close` would be the abstract-verb violation, `update_ticket`/`close_ticket` are correct).
- **`create_thread` / `create_ticket` → `POST` `201` + `Location`** (resource has a standalone GET URL — `get_thread` / `get_ticket`).
- **`send_message` / `add_ticket_message` → `POST` `201` *without* `Location`** (the created message/ticket-message has **no** standalone GET URL on the M6 surface; observable via `get_messages` / `get_ticket`).
- **`remove_thread_participant` → `DELETE` `200`** (returns body `status=removed`; soft removal, participation audit retained — R12).
- **`get_delivery_status` → dual-mode `GET`** (by-ID `/delivery-records/{id}` + list `/delivery-records` with allowlisted `source_event_id`/`channel` filters).
- **`close_thread` OCC = `expected_status` state-enum assertion** (`Doc-4A §14`; H.5 convention — not `updated_at`/§9.5); BC-COMM-4 ticket commands carry optional `CONFLICT` on lost race (contract-internal OCC).
- **Actor-sides frozen-sourced (Doc-4H §H5/§H7):** BC-COMM-1 messaging User-participant; BC-COMM-2 notification User-recipient; BC-COMM-3 delivery read User own-record / Admin `staff_can_support`; BC-COMM-4 two-sided User(opener)/Admin(staff) with explicit actor→transition authority (User `resolved→closed` only; staff drives all three transitions).

## Open Carried Items (non-gate) & Applied Patch

| ID | Item | Status |
|---|---|---|
| **DH-1…DH-8** | Identity / Marketplace / RFQ / Operations / Trust / Billing / Admin / Communication-Platform-Core integrations | OPEN — consumed in-process / out-of-wire (§8) / via Doc-4B mechanisms |
| `[ESC-COMM-SLUG]` | OPEN — recipient/delivery read scope binds nearest Doc-2 §7 by pointer; never invented |
| `[ESC-COMM-AUDIT]` | OPEN — every mutation binds nearest Doc-2 §9 action by pointer; never invented |
| `[ESC-COMM-EVENT]` | OPEN — M6 emits no Doc-2 §8 event (R11); §8/§11 N/A; if ever required, additive Doc-2 §8 patch — never coined in Doc-5H |
| **`[REC-COMM-OWNERSHIP]`** | **SATISFIED** — Outbound Log M6-owned, confirmed vs Doc-4H BC-COMM-3 / Doc-2 §10.7 at structure; reconfirmed verbatim at content §6.4; provider callbacks mutate only M6 state |
| `[ESC-COMM-POLICY]` (wire keys) | **RESOLVED** — `communication.idempotency_dedup_window` + `communication.list_page_size_max` registered in Doc-3 §12.2 via approved `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication` (new `communication` namespace; Doc-4A §18.2) |

**Applied corpus patch (ratification dependency, satisfied):** `Doc-3_Policy_Key_Registration_Patch_v1.5_Communication` — additive §12.2 registration of `communication.idempotency_dedup_window` + `communication.list_page_size_max` (new `communication` namespace; Doc-4A §18.2); Status APPROVED (human owner, 2026-06-26). Additive only; no Doc-3 semantic/delivery/non-disclosure/governance/ownership change; delivery-only + non-disclosure + single-authorship firewalls preserved. Review evidence: `governanceReviews/Doc-5H_Freeze_Readiness_Audit_v1.0.md`.

---

## Downstream Effect

Doc-5H is the binding API-realization layer for **Module 6 — Communication, the delivery-only transport / notification fan-out layer**. It establishes the **single-authorship rule** (R5 — M6 emits no Doc-2 §8 event; authors no other module's notification-production; a consumed payload never becomes contract authority), the **delivery-aggregate ownership** (R8 — Outbound Log M6-owned; provider callbacks mutate only M6 state; webhook is inbound infra, not an emitted event), the **non-disclosure firewall** (R10 — participant/recipient/scope-gated reads; uniform `NOT_FOUND`), and the **append-only invariant** (R12 — close keeps history, logs never caller-writable) as wire invariants, plus the RFQ scrub-rule seam (R7) and the realtime-as-delivery-channel pattern (R9). Each remaining Doc-5x (Doc-5I Billing, Doc-5J Admin, Doc-5K AI, Doc-5L/5M) is gated at freeze by the Doc-5A Appendix A checklist. Doc-6 (DB) / Doc-7 (Frontend) / Doc-8 (Tests) planning may proceed in parallel.

---

*Doc-5H program freeze designation. Non-authoring. On any conflict, the registered frozen sources, Doc-5A (FROZEN), and `Doc-5_Program_Governance_Note_v1.0` win; flag-and-halt.*