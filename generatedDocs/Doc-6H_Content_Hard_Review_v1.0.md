# Doc-6H — M6 Communication (`communication`) Schema Realization — **Content Hard Review v1.0** (cross-pass, full §0–§8 + Appendix A)

| Field | Value |
|---|---|
| Reviewer | iVendorz **Virtual CTO & Architecture Board** — independent of the pass authors |
| Target | `Doc-6H_Content_v1.0_Pass1/2/3.md` (9 tables; §0–§8 + Appendix A) **read together** |
| Review type | **Cross-pass Content Hard Review** — the integration-seam gate (participant-grant nested RLS, delivery-only + append-only logs vs the *actual* Doc-6B §4 body, M0-event consumption, schema-name binding) |
| Basis | `Doc-2 v1.0.3 §10.7/§10.11`; `Doc-6A` (Appendix A); **`Doc-6B §4`**; Doc-6C (HQ-003 RLS lesson) / Doc-6F-6G (immutability lessons); Doc-3 v1.5 |
| Verdict | **0 BLOCKER + 0 MAJOR; 2 OBSERVATION confirmed-by-design.** Participant-grant RLS + delivery-only + append-only verified. **Ready for Content Freeze Audit.** |

> **Method note.** Verified (a) the **participant-grant nested RLS** terminates at the simple anchor (HQ-003 class), (b) the **delivery-only** posture (M6 owns no business content; logs append-only) end-to-end, (c) every immutability attachment vs the actual Doc-6B §4 body, and (d) the schema-name binding (`communication`, not `comms`). The passes proactively applied the accumulated immutability/RLS lessons — no BLOCKER recurred.

---

## 1 — Coverage (9/9)
| Pass | Tables | n |
|---|---|---|
| Pass-1 | threads · messages · thread_participants | 3 |
| Pass-2 | notifications · email_logs · sms_logs · whatsapp_logs | 4 |
| Pass-3 | support_tickets · ticket_messages | 2 |
| **Total** | = **Doc-2 §10.7 exactly** (email/sms/whatsapp = 3) | **9** |

No 10th; none missing. **PASS.**

---

## 2 — Headline verifications

### Participant-grant RLS terminates (HQ-003 class)
`threads`/`messages` read anchors on `EXISTS(thread_participants WHERE participant_organization_id = active_org AND status='active')` — the anchor's **own** RLS is the simple `participant_organization_id = active_org` (a single indexed predicate). Non-circular, non-defeatable. The message **write** is sender-anchored (`sender_organization_id = active_org` AND participant-EXISTS). `ticket_messages` anchors on the parent ticket (org or staff). **PASS.**

### Delivery-only + append-only
M6 carries **transmission** only — thread `context_id` (→ M3), `source_event_id` (→ M0) are bare references; no business content is owned. **Delivery logs** (email/sms/whatsapp) are **append-only** (column-scoped: facts frozen, only `status`/`provider_ref` advance via gateway callback) and **System-written** (no in-band write policy); `ticket_messages` full append-only; messages SD=hidden (retained). **PASS.**

---

## 3 — Cross-pass integration checks (PASS)

| Seam | Result |
|---|---|
| **Immutability vs Doc-6B §4** | email/sms/whatsapp logs column-scoped (status/provider_ref mutable); `ticket_messages` full append-only — all pass protected-col `TG_ARGV`; no PERFORM-of-trigger-fn; no empty-args UPDATE-open | PASS |
| **Enum singletons** | each `CREATE TYPE communication.*` once; `delivery_log_status` reused by all three log tables; §7 enums-first | PASS |
| **M0-event consumption** | notifications + logs carry `source_event_id` → `core.outbox_events` (bare UUID; M6 consumes, no cross-schema FK); no event coined | PASS |
| **Schema-name binding** | all DDL/Prisma use `communication` (Doc-2 §10.7 + Doc-3 v1.5 binding); CLAUDE.md `comms` flagged for orientation patch | PASS |
| **No human_ref / no money** | CHK-6-002 N/A (none in §10.7); CHK-6-050 N/A (no monetary column) | PASS |
| **Coin-nothing** | nothing coined; `priority`/`context_type` = text (no Doc-2 values); `[ESC-COMM-AUDIT]` carried | PASS |
| **Appendix A** | 37/37 (Pass-3); N/A 002/033/050/062 justified; 043 PASS-with-carry | PASS |

---

## 4 — Observations (2; confirmed-by-design)

### OBSERVATION HR-H1 — thread creation is service-mediated
`threads_participant` (FOR ALL, WITH CHECK requires a participant row for `active_org`) means a brand-new thread (no participants yet) can be INSERTed **only** via the staff/`SECURITY DEFINER` service path. **Confirmed correct** — the messaging service materializes the thread + its first participants atomically (CM-CR3); a regular user does not create a bare thread in-band. No change.

### OBSERVATION HR-H2 — message hide/edit is admin/service-mediated
`messages` grants participants SELECT + sender INSERT, but UPDATE/DELETE only to admin (FOR ALL). A sender cannot in-band edit/soft-delete its own message; hide (SD) is a moderation/service action. **Confirmed correct** — messages are audit-immutable for participants; hiding is service/admin-driven (consistent with delivery-only + audit). No change.

---

## 5 — Decision

**0 BLOCKER, 0 MAJOR; 2 OBSERVATION confirmed-by-design.** The passes proactively applied the accumulated lessons (immutability args, simple-anchor RLS, System-write-only logs). The gate verified the three properties — participant-grant RLS termination, delivery-only, and append-only logs — and the schema-name binding. Coverage 9/9; immutability correct vs Doc-6B §4.

**Authorized next step:** **Content Freeze Audit** → `Doc-6H_SERIES_FROZEN_v1.0` → fold corpus. **Carried:** `[ESC-COMM-AUDIT]`; the CLAUDE.md `comms`→`communication` orientation patch.

---

*End of Doc-6H Content Hard Review v1.0 (cross-pass). 0 BLOCKER/MAJOR; participant-grant RLS + delivery-only + append-only verified; immutability matches Doc-6B §4; schema = `communication`; coverage 9/9. 2 OBSERVATION confirmed-by-design. On any conflict, Doc-2 and Doc-6A win; flag-and-halt. Next: Content Freeze Audit → `Doc-6H_SERIES_FROZEN`.*
