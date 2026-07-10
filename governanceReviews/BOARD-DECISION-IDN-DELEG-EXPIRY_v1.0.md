# BOARD DECISION — ESC-IDN-DELEG-EXPIRY · Delegation-Grant Suspended-at-Expiry Boundary

**Status:** ✅ APPROVED — owner/Architecture Board ruling, 2026-07-09
**Channel:** `esc_registry.md` → `ESC-IDN-DELEG-EXPIRY` (CLOSED by this record)
**Instrument:** `generatedDocs/Doc-2_Patch_v1.0.7.md` (PATCH-D2-06, Authority-Map-registered)

## Ruling (owner, verbatim)

When a delegation grant expires while suspended:

- The grant transitions to **EXPIRED** when its validity window lapses.
- **EXPIRED is terminal with respect to that grant instance.**
- `reinstate_delegation_grant` **MUST NOT** revive an expired grant.
- Reinstatement is valid **only** for a currently suspended, non-expired grant.
- Any future delegation requires creation of a **new delegation grant** with a new identity and
  full audit trail.

**Rationale (owner):** preserves immutable audit history, deterministic state machines, temporal
correctness, predictable authorization semantics; avoids hidden resurrection of historical
authorization records; keeps delegation grants append-only. Frozen into Doc-2 §5.10 (via the
additive patch) and contract #25's business boundary.

## Instruments executed (2026-07-09)

1. `generatedDocs/Doc-2_Patch_v1.0.7.md` — §5.10 overlay: `suspended → expired` edge on window
   lapse; reinstate conditioned on non-expired; new-grant-only after terminal states.
2. `generatedDocs/00_AUTHORITY_MAP.md` — Doc-2 series row → v1.0.7.
3. `esc_registry.md` → `ESC-IDN-DELEG-EXPIRY` RESOLVED.
4. `docs/backend/backend_execution_tracker.md` — **W2-IDN-6.5 un-gated for contract #25**, with
   binding carries: (a) add the `suspended → expired` edge to the realized IDN-4 state machine;
   (b) extend the System expiry sweep to cover `suspended` (still System-attributed, idempotent);
   (c) replace the reinstate scaffold with the real command (reject expired per the ruling —
   error surface stays inside the frozen §C9 registers); (d) discriminating tests for
   suspended-at-lapse expiry, reinstate-inside-window success, reinstate-after-lapse rejection,
   and no-resurrection (new grant = new UUID + fresh audit chain).

## Notes

- The IDN-4 build anticipated this cleanly: the machine deliberately omitted the boundary, the
  sweep was active-only, and the scaffold threw a handle-citing error — nothing shipped
  contradicts the ruling; the change is purely additive realization at 6.5.
- The RV-0149 A-review's "suspended-at-lapse untouched" test pins the CURRENT frozen behavior;
  W2-IDN-6.5 updates that test to the patched machine (the packet must call this out so the
  change is read as ruling-realization, not regression).
