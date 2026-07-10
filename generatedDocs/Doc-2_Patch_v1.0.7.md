# Doc-2 Additive Patch v1.0.7 (PATCH-D2-06) — §5.10 Suspended-at-Expiry Boundary Resolution

| Field | Value |
|---|---|
| **Patches** | Doc-2 (Domain Model & Database Blueprint) — FROZEN v1.0.6 → **v1.0.7** |
| **Class** | **State-machine boundary resolution — additive.** Adds one transition edge + one guard condition to §5.10. No new state, no table/column change, no event, no ownership change. |
| **Authorized by** | Human owner/Architecture Board ruling, 2026-07-09 — `ESC-IDN-DELEG-EXPIRY` **APPROVED** (decision record: `governanceReviews/BOARD-DECISION-IDN-DELEG-EXPIRY_v1.0.md`) |
| **Raised by** | Doc-2 §5.10's own carried ambiguity (the suspended-at-expiry boundary); held open through W2-IDN-4 (contract #25 scaffold-gated on this handle) |
| **Frozen text** | The Doc-2 base file is NOT edited. This patch is the corrective overlay; on §5.10 boundary questions this patch governs. |

## 1. The resolution (owner ruling, verbatim substance)

**Base §5.10 (unedited, lines 584–588):**
```
draft ──grant [granted_by must hold authority in controlling org]──▶ active
active ──suspend──▶ suspended ──reinstate──▶ active
active|suspended ──revoke──▶ **revoked**
active ──valid_to passes──▶ **expired**
```

**Per this patch, the machine reads:**
```
draft ──grant [granted_by must hold authority in controlling org]──▶ active
active ──suspend──▶ suspended ──reinstate [only while valid_to has NOT passed]──▶ active
active|suspended ──revoke──▶ **revoked**
active|suspended ──valid_to passes──▶ **expired**
```

Binding rules (freeze-level):
1. A grant transitions to **`expired` when its validity window lapses, regardless of whether it
   is `active` or `suspended`** at that moment (the System sweep covers both states).
2. **`expired` is terminal with respect to that grant instance** (as `revoked` already is).
3. **`reinstate_delegation_grant` MUST NOT revive an expired grant** — reinstatement is valid
   only for a currently `suspended`, non-expired grant (window still open at reinstate time).
4. Any future delegation after expiry/revocation requires **a new delegation grant** — new
   identity (new UUID), full independent audit trail. No resurrection of historical
   authorization records; grant instances are append-only history.

## 2. Rationale (Board, recorded)

Preserves immutable audit history, deterministic state machines, temporal correctness, and
predictable authorization semantics; avoids hidden resurrection of historical authorization
records. Consistent with Invariant 8 (nothing authoritative overwritten; IDs never reused).

## 3. What does NOT change

- The five states, the dual-party authority rule, the guards paragraph (§5.10 line 590), and the
  revocation/expiry teardown semantics stand unchanged.
- Doc-4C contract #25 (`reinstate_delegation_grant`) — its **wire shape** is already frozen;
  this patch supplies its business boundary (reject expired). The realization lands at
  W2-IDN-6.5 (see decision record §Instruments).

## 4. Effect

- Contract **#25 is UN-GATED**: W2-IDN-6.5 realizes reinstate with the boundary above.
- The W2-IDN-4 machine/sweep is extended in the same WP: `suspended → expired` edge added to
  the realized transition matrix; the System expiry sweep covers `active` AND `suspended`;
  the reinstate scaffold's `DelegationReinstateGatedError` is replaced by the real command.
- `ESC-IDN-DELEG-EXPIRY` registry row CLOSES on this patch.

---
*Additive patch; the frozen base files are never edited in place. Authorized by the human owner
per CLAUDE.md §7/§8 (ruling 2026-07-09). Registered in `generatedDocs/00_AUTHORITY_MAP.md`.*
