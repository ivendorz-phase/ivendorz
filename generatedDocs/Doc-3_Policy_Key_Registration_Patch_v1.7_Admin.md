# Doc-3 — Policy Key Registration Patch v1.7 (Admin / M8)

| Field | Value |
|---|---|
| Patch | Doc-3 Policy Key Registration Patch v1.7 — Admin |
| Type | **Additive** registration into `Doc-3 §12.2` POLICY key registry. Frozen Doc-3 not edited in place |
| Status | **APPROVED** (additive, non-semantic; same class as Patches v1.1–v1.6) |
| Authority | `Doc-4A §18.2` (POLICY-by-key, never by value); `Doc-3 §12.2` (POLICY configuration layer / key registry) |
| Purpose | Register the 2 `admin.*` API-realization POLICY keys referenced by Doc-5J; clears the Doc-5J `[ESC-ADM-POLICY]` content-freeze gate |
| Scope guard | **No semantic / moderation-policy / enforcement / governance change.** Page-size + idempotency-dedup are wire-realization tunables only |

---

## New namespace

`admin` — added to the `Doc-3 §12.2` POLICY namespace set (alongside `core`, `rfq`, `marketplace`, `trust`, `operations`, `communication`, `billing`). No existing key altered.

## Registered keys

| Key | Type | Meaning | Bound by |
|---|---|---|---|
| `admin.idempotency_dedup_window` | duration | Idempotency-Key dedup window for `admin.*` mutations (`Doc-4A §14` / `Doc-4J §H.8`) | Doc-5J §3.9; every `admin.*` command |
| `admin.list_page_size_max` | integer | Max `page_size` for `admin.*` list reads (`Doc-4A §9.6/§18` / `Doc-5A §8.5`); over-max → `400 VALIDATION` | Doc-5J §3.9; all `admin.*` list contracts |

> Values are configuration (`core.system_configuration`), not fixed on the wire or in this patch (`Doc-4A §18.2`). Doc-5J references these keys by name only.

## Namespace reconciliation (structure content-pass flag)

`Doc-4J §H.8` / Appendix B note **`moderation.*`** as an already-named registered key set (moderation **domain** policy — e.g. thresholds/windows specific to moderation). That set is **distinct** from the **module-wide API-realization wire tunables** registered here: the dedup-window + list-page-size keys are registered under the **`admin.*`** namespace (consistent with the `admin` route prefix and the per-module peer convention `<ns>.idempotency_dedup_window` / `<ns>.list_page_size_max`). No `moderation.*` key is altered; no duplicate created.

## Gate closure

- **`[ESC-ADM-POLICY]` → RESOLVED.** Doc-5J references `admin.list_page_size_max` and `admin.idempotency_dedup_window` by key; the `CHK-5A-121` content-freeze gate is cleared.

---

*Additive Doc-3 §12.2 registration, approved. Mirrors Patches v1.1–v1.6. No semantic change; clears the Doc-5J `[ESC-ADM-POLICY]` gate. Fold into the Doc-3 effective patch set under architecture governance.*
