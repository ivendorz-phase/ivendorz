# Doc-3 — Policy Key Registration Patch v1.6 (Billing / M7)

| Field | Value |
|---|---|
| Patch | Doc-3 Policy Key Registration Patch v1.6 — Billing |
| Type | **Additive** registration into `Doc-3 §12.2` POLICY key registry. Frozen Doc-3 not edited in place |
| Status | **APPROVED** (additive, non-semantic; same class as Patches v1.1–v1.5) |
| Authority | `Doc-4A §18.2` (POLICY-by-key, never by value); `Doc-3 §12.2` (POLICY configuration layer / key registry) |
| Purpose | Register the 2 `billing.*` API-realization POLICY keys referenced by Doc-5I; clears the Doc-5I `[ESC-BILL-POLICY]` carried item |
| Scope guard | **No semantic / pricing / subscription / quota / firewall / governance change.** Page-size + idempotency-dedup are wire-realization tunables only |

---

## New namespace

`billing` — added to the `Doc-3 §12.2` POLICY namespace set (alongside `core`, `rfq`, `marketplace`, `trust`, `operations`, `communication`). No existing key altered.

## Registered keys

| Key | Type | Meaning | Bound by |
|---|---|---|---|
| `billing.idempotency_dedup_window` | duration | Idempotency-Key dedup window for `billing.*` mutations (`Doc-4A §14` / `Doc-4I §H.8`) | Doc-5I §3.9 / §7.0; every `billing.*` command |
| `billing.list_page_size_max` | integer | Max `page_size` for `billing.*` list reads (`Doc-4A §9.6/§18` / `Doc-5A §8.5`); over-max → `400 VALIDATION` | Doc-5I §3.9; all `billing.*` list contracts |

> Values are configuration (`core.system_configuration`), not fixed on the wire or in this patch (`Doc-4A §18.2`). Doc-5I references these keys by name only.

## Gate closure

- **`[ESC-BILL-POLICY]` → RESOLVED.** The Doc-5I carried item ("no `billing` POLICY namespace key for page-size / dedup") is cleared by this registration. Doc-5I content references `billing.list_page_size_max` and `billing.idempotency_dedup_window` by key.

---

*Additive Doc-3 §12.2 registration, approved. Mirrors Patches v1.1–v1.5 (RFQ/Marketplace/Trust/Operations/Communication). No semantic change; clears the Doc-5I `[ESC-BILL-POLICY]` gate. Fold into the Doc-3 effective patch set under architecture governance.*
