# Doc-8F — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8F_Content_v1.0_Pass2.md` (§4–§7) |
| Against | `Doc-8F_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Freeze Audit |
| Method | Additive content patch — no frozen document edited; nothing coined |

---

## Disposition of findings

### MINOR-1 — §6 firewall-via-events = consumer reaction + fan-out → **FIXED**
§6's firewall-via-events bullet is restated:
> **Firewall-via-events** — the leak surface is the **consumer's reaction** (+ the `Doc-4L` routing), not the payload. Assert **no consumer reacts to a governance-signal event by cross-mutating/dominating a firewalled peer signal**: (a) **`Doc-4L` does not route** a signal-change event to a handler that mutates a peer signal; (b) the consumer's reaction respects **Doc-8E's** firewall criterion (`firewallNonCross`/`firewallNonDom` — invoked, not re-defined). An event carries data; the firewall violation, if any, is in the reaction.

### MINOR-2 — §4 fan-out granularity → **FIXED**
§4's fan-out bullet binds to the oracle's granularity:
> **Fan-out (dispatch-routing layer):** the outbox event routes to **exactly the `Doc-4L`-declared consumers** — at **`Doc-4L`'s granularity** (consuming modules / bounded contexts **as the map declares them**), no more/fewer — observed at the mocked Inngest double. The **handler** is an implementation detail **below** the oracle; the assertion binds to the `Doc-4L` consumer set, not named handlers.

### NITPICK-1 — §7 "A-compose" not a band → **FIXED (applied)**
§7: the "A-compose" row is removed from the Appendix-A band table; composition is noted as a **property** — *8F invokes 8E's firewall + 8D's byte-equivalence at the event layer (§6); it defines neither* — separate from the Band A/F attestation.

### REJECTED finding — upheld
"§6 byte-equivalence composition redundant with 8D" stays **REJECTED as false** — 8D = DB row-visibility leak surface; 8F = event/notification leak surface (a distinguishing event reveals exclusion even with byte-equivalent rows); same single-sourced criterion, different observable (Doc-8D §5.4 "8F" composition). No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER / MAJOR | 0 / 0 | 0 / 0 |
| MINOR | 2 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 firewall-via-events = reaction+fan-out | MINOR | **CLOSED** — assert consumer-reaction + Doc-4L routing; invoke 8E |
| MINOR-2 fan-out Doc-4L granularity | MINOR | **CLOSED** — consumers at Doc-4L granularity, not handlers |
| NITPICK-1 "A-compose" band | NIT | **CLOSED** — composition is a property, not a band |
| REJECTED (byte-equiv redundant) | — | **Upheld false** |

No new defect. Re-verified the consumer-reaction firewall framing + the Doc-4L consumer granularity. **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.** Both content passes (§0–§7) approved → ready for Content Freeze Audit.

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Next: Content Freeze Audit → `Doc-8F_SERIES_FROZEN_v1.0`.*
