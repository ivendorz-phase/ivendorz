# BOARD DECISION — [D-5] Outbox Audit Granularity · Option A

**Status:** ✅ APPROVED — owner/Architecture Board ruling, 2026-07-09 (**Option A**)
**Channel:** the `[D-5]` carried-dependency channel (Doc-4B / W2-CORE-2 — mechanics built
2026-07-09 with the audit leg explicitly withheld pending this ruling)

## Ruling (owner, verbatim substance)

Audit the following as **separate immutable events**:

1. Outbox record **created**
2. **Dispatch attempt**
3. **Dispatch success**
4. Dispatch **permanent failure** (dead-letter park)
5. **Archive/retention** action

Do **NOT** generate audit entries for retry scheduling or every internal retry **unless** the
retry results in a state transition or an operationally significant failure.

**Rationale (owner):** complete forensic traceability + reasonable audit volume + deterministic
event history, without excessive audit noise.

## Realization plan (Orchestrator, per the ruling)

- **New WP minted: `W2-CORE-4` (M0 hardening + [D-5] audit leg)** — tracker row added. Scope:
  1. The five audit legs above wired into the CORE-2 workers + the outbox write path, each an
     audited atomic append per the D7 pattern, System-attributed where the actor is the System
     worker. "Dispatch attempt" is realized as the attempt that ADVANCES state or parks the
     record (CAS-winning attempt) — losing CAS racers and pure retry re-scheduling are NOT
     audited (the ruling's noise exclusion).
  2. **Audit-action serialization binds by pointer** to the nearest Doc-2 §9 action family per
     the established `[ESC-*]` channel convention; if any of the five legs has **no §9
     near-pointer**, the builder Flag-and-Halts on the audit channel and a small additive
     serialization patch (the `Doc-4C_BuyerProfileAuditToken_Patch` precedent) is drafted —
     **never an invented token**.
  3. Fold-ins (Board-approved this session): **WI-CAS-FLAKE hardening** (4× observed — poll
     bound/barrier hardening) · RV-0145 NIT-1 comment undercount · RV-0145 OBS-2 fixture-prefix
     cosmetic.
- Sequencing: P3 (hardening) — dispatched at the next M0-adjacent slot; does not preempt the
  W2-IDN chain.

**PACKET CLOSED — [D-5] is no longer a carried dependency; it is scheduled work (W2-CORE-4).**
