# Doc-8A — Content Pass-2 (§5–§9) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-8A_Content_v1.0_Pass2.md` (§5–§9) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise Architect · DDD Architect · API Governance · Security Architect) |
| Mode | Hard Review → Defect Hunting · Realize-Never-Redecide · Reference-Never-Restate · anchors verified live |
| Severities | BLOCKER / MAJOR / MINOR / OBSERVATION / NITPICK |
| Verdict | **NOT YET APPROVED** — 2 MINOR + 1 NITPICK open; 1 finding REJECTED as false. 0 BLOCKER / 0 MAJOR. Resolve via Content Pass-2 Patch → short closure check → Content Pass-3 |

---

## Anchors verified CORRECT

- `Doc-4A §9.7` **Prohibited Request Fields** — verified (`Doc-4A_Content_v1.0_Pass3 §9.7` line 71; the category list verbatim in `Doc-4A_Content_v1.0_Pass5` **CHK-087** line 899: attribution, audit, tenant-selection, authorization, ownership-change, lifecycle-state, governance signals, soft-delete-as-direct-write, `human_ref`-as-reference, inline tunable limits). §5.5 reproduces the categories correctly.
- `Doc-6A §3` (standard columns), `§5` (integrity/partial-unique/CHECK/no-cross-schema-FK), `§6` (immutability/soft-delete/versioning; `ai.*` TTL exception), `§7` (`core.outbox_events` write-plus-emit; `pending→dispatched→archived`), `§8` (`core.audit_records` `actor_type[User|Admin|System|AI Agent]`; redaction-as-new-event) — all verified against the frozen Doc-6A (lines 72–94).
- `Doc-6A R8/§4` (RLS gate), `R9` (multi-currency `NUMERIC`+currency), `§11` (migration delegation) · `Doc-2 §0.4/§8/§9` · `Doc-4J`/`Doc-4L`/`Doc-4M` · `Doc-5A §5.6/§6.2/§8` · `Doc-3 §12` · CLAUDE.md §2/§4/§5/§10 · Invariants #1–#12 — correctly invoked.

0 BLOCKER, 0 MAJOR. §5–§9 are mechanism-only, oracle-by-pointer, and the §6.4 RLS/byte-equivalence band + the assert-once allocation (§6.4 defines, §9.6 composes) are correctly carried. Findings below: one firewall-attribution defect, one cross-layer-helper overstatement, one cross-link nit.

---

## Findings

### MINOR-1 — §7.1 over-attributes the "non-System write to a score table is rejected" *enforcement* to `core.audit_records actor_type` (Doc-6A §8); audit records the actor, it does not enforce
§7.1 asserts scores are "auto-calculated under the System actor, never hand-edited (**a non-System write to a score table is rejected — bound by the `core.audit_records` `actor_type[…System…]` model, `Doc-6A §8`**)." **Verified:** `Doc-6A §8` realizes the **immutable audit record**, including `actor_type` — it **records** who acted; it does **not** reject a non-System write. The oracle for "scores auto-calc under System, never hand-edited" is **CLAUDE.md §4** (the firewall rule) + the **M5 score-ownership** model (Doc-2); the DB/service-level *enforcement* is the eventual **Doc-6G `trust` schema** (not yet frozen — per-suite oracle-readiness §1.2). Audit `actor_type` is **corroborating evidence** (the suite can assert the recorded actor was System), not the rejection mechanism.
**Required fix:** reword §7.1 — oracle = CLAUDE.md §4 (firewall) + M5 ownership (Doc-2); enforcement realization = M5/Doc-6G (oracle-ready when Doc-6G freezes); `core.audit_records actor_type` (Doc-6A §8) is asserted as corroboration, not as the enforcement. Removes the over-attribution.

### MINOR-2 — §9.6/§6.4 "invokes the canonical assertion **helper**" overstates code-sharing across the data (SQL) ↔ UI layer boundary
§9.6 says the UI suite (Doc-8G) "**invokes the canonical byte-equivalence assertion defined in Doc-8D (§6.4)**." The structure's allocation rule ("composing suites invoke the defining suite's assertion **helper**") is sound *within* a layer, but Doc-8D asserts at the **data/SQL layer** and Doc-8G at the **rendered-UI layer** — a single shared code helper across those layers may not exist. Implying one risks a Doc-8G author either coupling to SQL-layer internals or skipping the UI check believing 8D "covers it."
**Required fix:** reword to *"§9.6 applies the **same canonical equivalence criterion** (excluded-case output ≡ non-matched-case output) defined in §6.4, at the **UI boundary** — the definition is single-sourced (§6.4); the assertion is performed at both layers (data in 8D, presentation in 8G). It is one criterion, two layer-checks — not a duplicated definition."* Preserves assert-once without implying a cross-layer helper.

### NITPICK-1 — §5.2 cursor pagination asserts the contract side but does not cross-link the deterministic-sort-key *index* (Doc-6A §10 / Doc-8D)
§5.2 asserts the `Doc-5A §8` cursor grammar ("stable deterministic sort key") but the **index** that makes that sort persistable is a `Doc-6A §10` (indexing) concern, asserted at the data layer (Doc-8D). §5.4 already cross-links idempotency-dedup persistence to §6; §5.2 should do the same for the sort-key index, so the contract-side and data-side assertions are not orphaned.
**Suggested fix:** add to §5.2 — *"the deterministic-sort-key index that makes the cursor persistable is asserted at the data layer (`Doc-6A §10`, Doc-8D)."*

---

## Finding REJECTED as false

| Claim (raised in review) | Disposition |
|---|---|
| *"§5.5 says contracts must reject 'governance signals' as request fields, but M5 (`Doc-5G`) contracts serve scores/tiers — a contradiction; either M5 violates §9.7 or §5.5 is wrong."* | **REJECTED (false).** No contradiction. `Doc-4A §9.7` prohibits a **client-supplied governance-signal *input*** — a caller cannot *set* a score/tier/signal via the request body (scores are auto-calculated under the System actor — CLAUDE.md §4). M5's contracts **compute and serve** signals as outputs; they do not accept a client-supplied signal value as an input. Prohibited-as-input ≠ prohibited-as-output. §5.5 is correct; reinforces §7.1. No change. |

---

## Disposition summary

| Finding | Sev | Required channel |
|---|---|---|
| MINOR-1 §7.1 firewall enforcement mis-attributed to audit | MINOR | Pass-2 Patch — oracle = CLAUDE.md §4 + M5/Doc-6G; audit = corroboration |
| MINOR-2 §9.6/§6.4 cross-layer "helper" overstatement | MINOR | Pass-2 Patch — one criterion, two layer-checks |
| NITPICK-1 §5.2 missing sort-key-index cross-link | NIT | Pass-2 Patch — add `Doc-6A §10`/Doc-8D pointer |

**Gate (governance §6/§8 rule 1):** approved with no open BLOCKER/MAJOR/MINOR. 2 MINOR open → **Pass-2 Patch required**, then short closure check, then Content Pass-3 (§10–§12 + Appendix A check IDs).

*End of Independent Hard Review (Content Pass-2). Nothing coined; no frozen document edited. Anchors verified against the frozen corpus (Doc-4A §9.7/CHK-087; Doc-6A §3/§5/§6/§7/§8/§10; CLAUDE.md §4 firewall vs Doc-6A §8 audit).*
