# Doc-3 — POLICY Key Registration Patch v1.0 (Module 0 Infrastructure Keys)

| Field | Value |
|---|---|
| Patch ID | Doc-3-Policy-Key-Registration-Patch-v1.0 |
| Applies To | `Doc-3_RFQ_Procurement_Engine_And_Operational_Specification_v1.0.1.md` — §12.2 POLICY key inventory (additive block only) |
| Patch Authority | Architecture Board Directive; resolves **PB-B01 / PA-M3** (Doc-4B Pass-B Hard Review v1.0) |
| Patch Type | **Additive registration only** — registers existing Module 0 `core.*` POLICY keys. No validation-semantic, routing, trust, procurement, or ownership change. No existing key modified or removed. |
| Sole Purpose | Satisfy **Doc-4A §18.2** ("a POLICY key MUST exist in Doc-3 §12.2") for the keys already referenced by frozen-candidate Doc-4B Module 0 contracts. |
| Conforms To | Master_System_Architecture_v1.0_FINAL.md, ADR_Compendium_v1.md, Doc-2 v1.0.3 (base `…v1.0.2.md` + `Doc-2_Patch_v1.0.3.md`), Doc-3 v1.0.2 (base `…v1.0.1.md` + `Doc-3_Patch_v1.0.2.md`), Doc-4A v1.0 (FROZEN) |
| Linked Document | `Doc-4B_Freeze_Patch_v1.0.1.md` (the Doc-4B conformance update clearing the `[PA-E1]` markers depends on this registration) |
| Status | **APPROVED — additive Doc-3 §12.2 registration** |

---

## §1 — Patch Authority

The Doc-4B Pass-B Hard Review (PB-B01) confirmed that 18 `core.system_configuration.core.*` POLICY keys are referenced by Module 0 contracts but are **absent from the Doc-3 §12.2 inventory**. Per Doc-4A §18.2, a referenced POLICY key MUST exist in Doc-3 §12.2; inventing keys in a Doc-4 document is a conformance failure (correctly not done — every reference carries a `[PA-E1]` marker).

This patch registers exactly those keys, and only those keys, as a new additive sub-block of the existing Doc-3 §12.2 POLICY key inventory. It exists **solely** to satisfy the Doc-4A §18.2 registration requirement.

**This patch does NOT:** invent any new key; remove or rename any existing key; modify any validation semantic, gate, or threshold; modify routing rules, trust rules, or procurement logic; change Doc-3 ownership or any module boundary; alter the FIXED/POLICY/ORG trichotomy (Doc-3 §12.1/§12.3). All keys registered here are **POLICY** (tunable without deploy; changes audited per Doc-3 §12.4) and govern **Module 0 (Platform Core / Shared Kernel)** infrastructure behavior only — none feeds routing, matching, trust, verification, eligibility, or any governance signal (Doc-4A §18.3, §4B). Per Board decision **D-4**, Module 0 stores and exposes these configuration values; Module 8 governs administrative oversight of changes (Doc-2 §16.2) — this patch changes neither.

---

## §2 — Scope Statement

This patch adds one new domain sub-block to the Doc-3 §12.2 POLICY key inventory:

| Action | Detail |
|---|---|
| Add domain | **Core / Platform Infrastructure (Module 0)** — domain prefix `core.*` (full reference form `core.system_configuration.core.<key_name>`, Doc-4A §18.2) |
| Register keys | 18 keys (audit · outbox · config-governance · feature-flag infrastructure tunables) |
| Modify existing keys | **None** |
| Modify semantics/routing/trust/procurement/ownership | **None** |

No other section of Doc-3 is touched. The existing §12.2 domains (`rfq.*`, `moderation.*`, `matching.*`, `routing.*`, `tier.*`, `probation.*`, `fairness.*`, `capacity.*`, `distribution.*`, `confidence.*`, `quote.*`, `eval.*`, `abuse.*`, `suspension.*`, `econ.*`, `platform.*`, `stage_a.*`, `category.*`, `human_routing.*`, `strategic.*`, `quality.*`, `coverage.*`, `leads.*`) are unchanged.

---

## §3 — Additive Registration Block (Doc-3 §12.2)

**Insert the following row into the §12.2 domain inventory table** (consistent with existing domain→keys style):

```
| Core / Platform Infrastructure (Module 0) | core.audit_query_page_size_max, core.audit_query_rate_window, core.audit_query_rate_reset, core.audit_lookup_rate_window, core.audit_lookup_rate_reset, core.audit_redactable_fields_max, core.audit_redaction_reason_min_chars, core.redaction_dedup_window, core.outbox_dispatch_max_attempts, core.outbox_dispatch_backoff, core.outbox_dispatch_dedup_window, core.outbox_dlq_policy, core.outbox_archive_retention, core.outbox_archive_dedup_window, core.config_change_reason_min_chars, core.config_change_dedup_window, core.flag_change_reason_min_chars, core.flag_change_dedup_window  (all values tunable without deploy; changes audited per §12.4) |
```

**Detailed key registration** (per Board output requirements — key name, category, value type, owner, purpose, mutability; start values bracketed per existing §12.2 convention, tunable by ops):

| Key (`core` domain) | Category | Value type | Owner | Purpose | Mutability |
|---|---|---|---|---|---|
| `core.audit_query_page_size_max` | Audit | integer | Module 0 | Max page size for `core.audit_record_query.v1` pagination *[start: 100]* | POLICY |
| `core.audit_query_rate_window` | Audit | duration | Module 0 | Throughput window for audit-query rate limiting *[start: 60s]* | POLICY |
| `core.audit_query_rate_reset` | Audit | duration | Module 0 | Reset interval for the audit-query rate window *[start: 60s]* | POLICY |
| `core.audit_lookup_rate_window` | Audit | duration | Module 0 | Throughput window for `core.audit_correlation_lookup.v1` rate limiting *[start: 60s]* | POLICY |
| `core.audit_lookup_rate_reset` | Audit | duration | Module 0 | Reset interval for the lookup rate window *[start: 60s]* | POLICY |
| `core.audit_redactable_fields_max` | Audit | integer | Module 0 | Max fields per redaction request in `core.admin_redact_audit_field.v1` *[start: 10]* | POLICY |
| `core.audit_redaction_reason_min_chars` | Audit | integer | Module 0 | Minimum length of the structured redaction reason *[start: 20]* | POLICY |
| `core.redaction_dedup_window` | Audit | duration | Module 0 | Idempotency deduplication window for redaction replays (§14.3) *[start: 24h]* | POLICY |
| `core.outbox_dispatch_max_attempts` | Outbox | integer | Module 0 | Max delivery attempts before park/dead-letter in `core.phase2_dispatch_outbox_events.v1` *[start: 10]* | POLICY |
| `core.outbox_dispatch_backoff` | Outbox | duration / backoff-spec | Module 0 | Retry backoff schedule for outbox dispatch *[start: exponential, base 2s, cap 5m]* | POLICY |
| `core.outbox_dispatch_dedup_window` | Outbox | duration | Module 0 | Idempotency dedup window for dispatch replays *[start: 24h]* | POLICY |
| `core.outbox_dlq_policy` | Outbox | enum | Module 0 | Dead-letter/park behavior on max attempts (e.g., park_and_alert) *[start: park_and_alert]* | POLICY |
| `core.outbox_archive_retention` | Outbox | duration | Module 0 | Retention before archival of `dispatched` rows in `core.phase2_archive_dispatched_events.v1` *[start: 30d]* | POLICY |
| `core.outbox_archive_dedup_window` | Outbox | duration | Module 0 | Idempotency dedup window for archival replays *[start: 24h]* | POLICY |
| `core.config_change_reason_min_chars` | Config Governance | integer | Module 0 | Minimum length of the config-change reason in `core.admin_update_config_value.v1` *[start: 20]* | POLICY |
| `core.config_change_dedup_window` | Config Governance | duration | Module 0 | Idempotency dedup window for config-change replays *[start: 24h]* | POLICY |
| `core.flag_change_reason_min_chars` | Feature Flags | integer | Module 0 | Minimum length of the flag-change reason in `core.admin_set_feature_flag.v1` *[start: 20]* | POLICY |
| `core.flag_change_dedup_window` | Feature Flags | duration | Module 0 | Idempotency dedup window for flag-change replays *[start: 24h]* | POLICY |

**Notes (binding on the registered block):**

- **Full reference form:** `core.system_configuration.core.<key_name>` (Doc-4A §18.2); domain segment = `core`.
- **Mutability:** all 18 keys are **POLICY** — platform-operator tunable without deploy; every change is admin-permissioned and audited (Doc-3 §12.4; Doc-2 §9 "system_configuration change"). None is FIXED; none is ORG.
- **Firewall:** these keys tune Module 0 infrastructure (audit pagination/rate, outbox retry/retention, config/flag validation and dedup windows) only. They **MUST NOT** influence trust, verification, eligibility, routing fairness, matching confidence, or any governance signal (Doc-3 §12.1 FIXED; Doc-4A §18.3, §4B) — and by construction they do not.
- **Start values** are initial operational defaults (Architecture §17.3: "configuration holds the numbers"), tunable by ops within this registration; they introduce no behavioral rule and are bracketed per the existing §12.2 `[start: …]` convention.

---

## §4 — Impact Analysis

| Dimension | Assessment |
|---|---|
| Existing §12.2 keys | Unchanged — none modified, renamed, or removed |
| Validation semantics | Unchanged — no gate, threshold, or rule altered |
| Routing rules | Unchanged — no `routing.*`/`matching.*`/`distribution.*` key touched |
| Trust rules | Unchanged — no trust/verification/score key touched; firewall preserved |
| Procurement logic | Unchanged — no RFQ/quotation/eligibility behavior touched |
| FIXED/POLICY/ORG trichotomy (§12.1/§12.3) | Unchanged — all new keys are POLICY |
| Doc-3 ownership / module boundaries | Unchanged — Doc-3 still owns the POLICY inventory; Module 0 is the consuming/behavioral owner; Module 8 governs change oversight (D-4) |
| Doc-2 / Doc-4A | Unaffected — Doc-4A §18.2 requirement now satisfiable for the 18 keys |
| Doc-4B | Enables the `[PA-E1]` marker clearance (companion `Doc-4B_Freeze_Patch_v1.0.1.md`); no Doc-4B contract behavior changes |
| Backward compatibility | Fully backward compatible — purely additive |

**Self-review:**

| Criterion | Result |
|---|---|
| Only Module 0 `core.*` keys referenced by Doc-4B registered | PASS (18 of 18; verified against `Doc-4B_Content_v1.0_PassB.md`) |
| No new key invented | PASS (every key already referenced by a frozen-candidate contract) |
| No existing key removed or modified | PASS |
| No validation/routing/trust/procurement change | PASS |
| No ownership or module-boundary change | PASS |
| All registered keys are POLICY; firewall preserved | PASS |
| Registration style consistent with existing §12.2 | PASS (domain row + detailed table) |
| Resolves PB-B01 / PA-M3 for Doc-4A §18.2 | PASS |

---

## §5 — Resolution Statement

Upon adoption, the 18 Module 0 `core.system_configuration.core.*` POLICY keys are registered in Doc-3 §12.2. This satisfies the Doc-4A §18.2 registration requirement for the 7 affected Doc-4B contracts (`core.audit_record_query.v1`, `core.audit_correlation_lookup.v1`, `core.admin_redact_audit_field.v1`, `core.phase2_dispatch_outbox_events.v1`, `core.phase2_archive_dispatched_events.v1`, `core.admin_update_config_value.v1`, `core.admin_set_feature_flag.v1`) and resolves the **PB-B01 / PA-M3** freeze blocker. The companion `Doc-4B_Freeze_Patch_v1.0.1.md` clears the `[PA-E1]` markers in Doc-4B by reference to this registration. No Doc-4B contract is redesigned; no new Doc-4B review cycle is triggered.

---

*Doc-3 POLICY Key Registration Patch v1.0 — additive §12.2 registration of 18 Module 0 `core.*` infrastructure keys. Resolves PB-B01 / PA-M3 (Doc-4A §18.2). No semantic, routing, trust, procurement, or ownership change. Status: APPROVED (additive).*
