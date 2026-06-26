# Doc-8F — Content Pass-2 (§4–§7) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8F_Content_v1.0_Pass2.md` (§4–§7) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-2 Patch → short closure check → Content Freeze Audit |

---

## Anchors verified CORRECT

- `Doc-4J` (catalog, versioned) · `Doc-4L` (fan-out) · `Doc-6B` (`core.outbox_status` forward-only/DELETE-blocked; `core.outbox_archive_retention`) · Invariant #7 · `Doc-8E` (firewall helpers) · `Doc-8D §5.4` byte-equivalence + `CLAR-8D-1` (buyer-private/Doc-6F) · `Doc-8B §7` (drainer) · the Doc-8A allocation — all correctly invoked.
- Pass-1 fixes consumed: §5 places no-dispatch-on-rollback as a consequence (dispatch layer), atomicity stays §3.

0 BLOCKER, 0 MAJOR. Payload/dispatch/fan-out (§4), consumer-locality (§5), and the compose-not-define discipline (§6) are sound. Two event-semantics precision defects, one band-label nit.

### MINOR-1 — §6 firewall-via-events: the violation is in the **consumer's reaction** + the `Doc-4L` fan-out, not "an event carrying a cross-mutating signal"
§6 asserts "no event **carries** a cross-mutating or dominating signal." But an event **carries data** (e.g. the new Financial Tier); the firewall violation occurs if a **consumer reacts** to that signal-change event by **cross-mutating another signal** (e.g. a Trust-recalc handler raising Trust on a tier change). The risk lives in the **consumer path** (which `Doc-4L` routes the event to) + the consumer's reaction — not in the event payload itself.
**Required fix:** §6 — assert **no consumer reacts to a governance-signal event by cross-mutating/dominating another signal** — i.e. (a) `Doc-4L` does not route a signal-change event to a handler that mutates a firewalled peer signal, and (b) the consumer's reaction respects **Doc-8E's** firewall criterion (invoked, not re-defined). The leak surface is the consumer reaction, not the payload.

### MINOR-2 — §4 fan-out over-specifies "consumer **handlers**"; bind to `Doc-4L`'s actual granularity
§4 asserts routing to "exactly the `Doc-4L`-declared consumer **handlers**." But `Doc-4L` (the cross-module event-flow map) declares the fan-out at its own granularity — typically **consuming modules / bounded contexts**, not named handler functions (an implementation detail). Asserting "handlers" **over-specifies** beyond the frozen oracle (a re-specification — Doc-8A §3.3).
**Required fix:** §4 — assert routing to **exactly the `Doc-4L`-declared consumers** at **`Doc-4L`'s granularity** (consuming modules/bounded contexts as the map declares them), not named handlers; the handler is an impl detail below the oracle.

### NITPICK-1 — §7 "A-compose" is not a real Appendix-A band
§7's attestation table lists a row "**A-compose** — firewall/non-disclosure via events." There is no such Appendix-A band; composition is a **property** (8F invokes 8E/8D defining helpers), not a band.
**Suggested fix:** §7 — remove the "A-compose" band row; note composition as a **property** under the carried/composition note (8F invokes 8E firewall + 8D byte-equivalence at the event layer — §6), distinct from the Appendix-A band attestation.

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§6 composing 8D's byte-equivalence into 8F is redundant — 8D already asserts byte-equivalence; re-asserting via events duplicates it."* | **REJECTED (false).** 8D asserts byte-equivalence at the **DB row-visibility** layer; the **event/notification** layer is a **different leak surface** — an excluded vendor could be revealed by a **distinguishing event** (e.g. a notification fired that a non-matched vendor wouldn't get) **even if the DB rows are byte-equivalent**. The **same criterion** (single-sourced in Doc-8D §5.4), asserted at a **different observable** — exactly Doc-8D §5.4's explicit "**8F: no distinguishing notification/event**" composition. Dropping it leaves the event-layer leak untested. Assert-once-criterion, composed at each leak surface. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §6 firewall-via-events = consumer reaction + fan-out | MINOR | Pass-2 Patch — assert consumer-reaction + Doc-4L routing, invoke 8E |
| MINOR-2 §4 fan-out granularity (Doc-4L consumers, not handlers) | MINOR | Pass-2 Patch — bind to Doc-4L granularity |
| NITPICK-1 §7 "A-compose" not a band | NIT | Pass-2 Patch — composition is a property, not a band |

**Gate:** 2 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Freeze Audit → SERIES_FROZEN.

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited.*
