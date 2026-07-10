# Review-A (Team-4: Architecture & Governance) — `Doc-5A_Patch_v1.0.1.md`

| Field | Value |
|---|---|
| **Instrument under review** | `generatedDocs/Doc-5A_Patch_v1.0.1.md` — additive frozen-corpus patch (Doc-5A §3.2, v1.0 → v1.0.1) realizing the owner's `ESC-WIRE-FIELD-CASING` **Option B** ruling (2026-07-10) |
| **Reviewer** | Review-A, Team-4 — fresh-context, independent, read-only (Raise ≠ Accept) |
| **Rank / scrutiny** | Doc-5A is the **rank-0** API Realization Metastandard → high-scrutiny; the crux is whether the amendment is a legal realization-convention edit or an illegal architecture override |
| **Method** | Re-read frozen text VERBATIM (`Doc-5A_Content_v1.0_Pass2` §3.1–3.7); re-read the Board packet; grep-confirmed the delivered surfaces in `src/`; git-confirmed no frozen base file edited; cross-checked RV-0153 F1 + esc_registry |
| **VERDICT** | ✅ **PASS — faithful, sound, safe to register + un-gate 6.5.** 0 BLOCKER · 0 MAJOR · 0 MINOR · 0 NIT · 1 OBS |

---

## 1. Faithful to the ruling (Board packet Option B) — CONFIRMED

Re-read `governanceReviews/BOARD-PACKET-WIRE-FIELD-CASING_v1.0.md`. Packet §3 **Option B** =
*"Ratify the deviation (additive Doc-5A §3 patch). An additive patch declaring camelCase as the
ratified result-payload realization (requests/envelope stay snake_case as delivered)."* Owner
**APPROVED Option B** (patch header, 2026-07-10).

The patch realizes exactly this and **does not exceed it**:
- **Ratifies** camelCase for response `result`-payload property names (patch §2). ✔
- **Zero code change** — the delivered surfaces become "conformant by definition" (patch §5).
  It does **NOT** sweep/retrofit code — that was the *rejected* Option A (packet §3 A =
  "envelope-edge serialization + bounded retrofit sweep"). Correctly avoided. ✔
- **Ratifies nothing beyond** result-payload property-name casing (requests, envelope, enum
  values, identifiers, abstract names all explicitly fenced — §3 below). ✔
- The Orchestrator's non-binding recommendation was **Option A** (packet §5); the owner overrode
  to B. The patch tracks the *owner ruling*, not the recommendation — correct authority order (§7). ✔

No contradiction of, and no over-reach beyond, the Option-B ruling.

## 2. The `[realization convention]` argument (the crux) — TRUE

Independently re-read `generatedDocs/Doc-5A_Content_v1.0_Pass2.md` §3.2. **Both** load-bearing
conditions hold verbatim:

**(a) §3.2's snake_case / no-casing rule IS tagged `[realization convention]`** — Pass2 **line 67**,
end of the bullet:
> "…No casing transformation is applied on the wire (no `camelCase`/`PascalCase` aliasing).
> **[realization convention]**"

**(b) The Rationale states Doc-4A is wire-format-neutral** — Pass2 **line 69**:
> "**Rationale [no-casing-transformation = realization convention]:** Doc-4A fixes abstract field
> names as `snake_case` but is **wire-format-neutral**; fixing identical no-transform wire encoding
> eliminates aliasing as a second naming authority and preserves reference-never-restate."

Because BOTH hold, the no-casing-transformation choice is a **Doc-5A realization convention**, not a
Doc-4A architecture rule. The architecture (Doc-4A §3 → Doc-2 §3/§10) fixes the **abstract** field
names as `snake_case`; it does **not** fix the wire-serialization casing. An additive Doc-5A patch
**with human approval (§7/§8)** may therefore amend that convention for one scope **without touching
architecture**. This is precisely why the ruling is Option B (ratify a realization convention), not
an ADR/architecture override.

- The patch §1 quotes the Rationale as *"Doc-4A fixes abstract field names as `snake_case` but is
  wire-format-neutral"* — **verbatim-accurate** against Pass2:69.
- The patch §1 claim that §3.2 is *"classified in the frozen text itself as a [realization
  convention]"* — **verified** (line-67 tag + the line-69 Rationale tag
  `[no-casing-transformation = realization convention]`).

→ The crux argument is TRUE. This is **NOT** an illegal architecture override. No BLOCKER.

## 3. Scope precision — result-property-names-ONLY; everything else fenced — CONFIRMED

The patch ratifies camelCase for **response `result`-payload property NAMES only** (§2), and §3
explicitly leaves unchanged, each re-verified against the frozen text I re-read:

| Scope | Patch disposition | Frozen anchor re-read | OK |
|---|---|---|---|
| Request bodies + query params | `snake_case` verbatim (unchanged) | §3.2 still governs (Pass2:67) | ✔ |
| Envelope keys `reference_id`/`error_class`/`error_code` | `snake_case` verbatim (unchanged) | §5.6/§6.1; `src/shared/http/index.ts` | ✔ |
| **Enum VALUES (§3.3)** | `snake_case` string token verbatim — *"governs property NAMES, never values"* | Pass2:71–76 (separate section, untouched) | ✔ |
| **Identifier VALUES (§3.4)** | UUID lowercase RFC-9562 / `human_ref` uppercase (unchanged) | Pass2:78–83 (separate section, untouched) | ✔ |
| **Abstract field names (Doc-4A §3 → Doc-2 §3/§10)** | remain `snake_case`, authoritative | the *architecture* — untouched by design | ✔ |

The property-NAME ≠ enum-VALUE distinction is the one that could have silently broadened this patch
into an architecture breach; the patch nails it (§3 bullet 3). I confirmed in code that a camelCase
result property still carries a snake_case enum value — e.g.
`delegation-grant-lifecycle.handler.ts:61` returns `{ delegationGrantId, status }` where `status`'s
value stays the frozen `snake_case` token. **No accidental broadening.**

## 4. Additive-only + coins-nothing — CONFIRMED

- **No frozen base file edited in place.** `git diff --stat HEAD` on
  `Doc-5A_Content_v1.0_Pass2.md` and `Doc-5A_Structure_v1.0.md` → **empty** (clean). The patch is a
  new **untracked** standalone overlay (`?? generatedDocs/Doc-5A_Patch_v1.0.1.md`). ✔
- **Coins nothing.** No new wire token/field/enum is introduced — the patch references the
  already-delivered camelCase keys and the standard deterministic snake↔camel transform. No
  schema/entity/DTO/endpoint/event/contract/state change. ✔
- Red-Flag Checklist swept: no new module, no ownership change, no governance-signal change, no
  cross-module DB/FK/import, no ADR override. The only frozen-doc "modification" is an
  **additive patch with human approval** — the sanctioned path (CLAUDE.md §7/§8/§11). ✔

## 5. Citations accurate — SPOT-CHECKED

| Cited anchor | Verified |
|---|---|
| Pass2:67 (§3.2 tag) · Pass2:69 (Rationale) | ✔ verbatim (see §2) |
| D7 `result.organizationId` | ✔ `get-buyer-profile.query.ts:35`, `buyer-profile.read-model.ts:13` |
| W2-IDN-6.1 `result.userId` / `result.twoFaEnabled` (RV-0152) | ✔ `update-user-2fa-settings.command.ts:165` (`{ userId, twoFaEnabled, updatedAt }`), `get-user.query.ts:26` |
| W2-IDN-6.5 `delegationGrantId` | ✔ `create-delegation-grant.handler.ts:73`, `delegation-grant-lifecycle.handler.ts:23/61` |
| W2-IDN-6.5 `validFrom` / `validTo` / `permissionSet` | ✔ `get-delegation-grant.query.ts:46–48` |
| W2-IDN-6.5 `pageInfo.hasMore` | ✔ `list-delegation-grants.handler.ts:28`, `list-my-organizations.handler.ts:21`, `role.handler.ts` |
| `successResponse` wraps the TS object as-is | ✔ `src/shared/http/index.ts:110–112` — `{ result, reference_id }`, no casing transform; camelCase TS keys serialize verbatim, `reference_id` stays snake_case |
| RV-0153 F1 (`project-management/review-log.md`) | ✔ line 2320 — F1 [MAJOR, Flag-and-Halt, program-level], quotes Pass2:67, "requests + envelope keys CONFORM", "never adjudicated anywhere" |

All citations resolve to real, correctly-characterized anchors.

## 6. Trade-off honesty — CONFIRMED (not glossed)

Patch §4 discloses the mixed-casing wire without softening: *"The realized wire is now
**mixed-casing**: `snake_case` requests / envelope / enum-values / identifiers, `camelCase`
result-payload property names. The §3.2 'no aliasing → single naming authority' rationale is
**scoped** … rather than program-wide absolute. Every future wired module inherits this asymmetry."*
This is a faithful restatement of the Board packet §3 Option-B **cost** (permanent program-wide
asymmetry; "no aliasing" rationale weakened). Honest disclosure — no gloss.

## 7. Downstream correctness — CONFIRMED

With Option B, the flagged divergence **becomes** the ratified convention, so RV-0153 F1 does not
merely go "non-gating" — it **dissolves** (patch §5). Review-log line 2329 states the
W2-IDN-6.5 clean-gate close was *"blocked SOLELY on the owner's F1 gating ruling"*, with every review
lens already **B/M/M = 0** (A ✅ delta / B ✅ 0/0/0 / T6 ✅ 0/0/0 at `c9e257f`). Dissolving F1 clears
the sole remaining ledger item → **6.5 close un-gated.** Correct.

---

## Findings (raised only)

- **OBS-1 (non-gating, precision note).** Patch §2 calls the snake↔camel mapping *"bijective over the
  §3.2 field-name grammar."* The **forward** map (abstract `snake_case` → wire `camelCase`) — the only
  one traceability actually depends on — is deterministic and total, and the patch keeps the abstract
  `snake_case` name as the single naming authority (§2/§3), so the load-bearing conclusion
  ("traceability preserved") holds. The word *bijective* is a mild over-statement in the general case
  (reverse camel→snake can be ambiguous at digit boundaries, e.g. `field2`), but nothing in the patch
  relies on reverse-derivation. **No action implied**; recorded for record honesty only.

## Coordinator note (not a finding)

`esc_registry.md` still shows `ESC-WIRE-FIELD-CASING` 🟥 **OPEN**, and `00_AUTHORITY_MAP.md` has no
v1.0.1 row yet. This is **correct** — the patch §6 explicitly scopes the registry flip + Authority-Map
row + 6.5 close as **coordinator follow-up "NOT executed by this file."** The patch does not
self-register (proper separation). Those updates are authorized by this PASS (go/no-go below).

---

## Gate roll-up

| Severity | Count |
|---|---|
| BLOCKER | **0** |
| MAJOR | **0** |
| MINOR | **0** |
| NITPICK | **0** |
| OBS | **1** (OBS-1, non-gating) |

**Freeze/merge gate MET** (BLOCKER = MAJOR = MINOR = 0). OBS never blocks.

### Go / no-go

- **(a) Register the patch in `00_AUTHORITY_MAP.md` (Doc-5A → v1.0.1 + patch row): GO.** Additive,
  human-authorized, edits no frozen base text, coins nothing, faithfully realizes Option B.
- **(b) Close W2-IDN-6.5 on the dissolved F1: GO.** F1 dissolves into the ratified convention; 6.5's
  code is already B/M/M = 0 across A/B/T6 — nothing else gates the close.

**VERDICT: PASS — faithful, sound, safe to register + un-gate 6.5 (0/0/0/0/1 OBS).**

---
*Review-A, Team-4 — read-only, fresh-context. Raises findings; does not decide implementation
(Raise ≠ Accept). Frozen text re-read verbatim; delivered surfaces grep-confirmed; no frozen base
file edited (git-verified). Coins nothing; edits no frozen text.*
