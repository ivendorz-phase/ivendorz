# Doc-8A — Content Pass-2 **Patch v1.0.1** (Hard Review disposition) + Short Closure Check

| Field | Value |
|---|---|
| Patches | `Doc-8A_Content_v1.0_Pass2.md` (§5–§9) |
| Against | `Doc-8A_Content_Pass2_Independent_Hard_Review_v1.0.md` |
| Date | 2026-06-26 |
| Status | **PATCH applied + closure confirmed** — 2 MINOR + 1 NITPICK dispositioned (all FIXED); 1 finding REJECTED-as-false upheld. 0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED; proceed to Content Pass-3 |
| Method | Additive content patch — no frozen document edited; nothing coined. Effective Pass-2 = `Content_v1.0_Pass2` **as amended below** |

---

## Disposition of findings

### MINOR-1 — §7.1 firewall enforcement mis-attributed to `core.audit_records` → **FIXED**
§7.1's final bullet is replaced:
> - Scores are **auto-calculated under the System actor, never hand-edited** — oracle: **CLAUDE.md §4** (firewall rule) + the **M5 score-ownership** model (`Doc-2`). The DB/service-level *enforcement* (a non-System write to a score table is rejected) is realized by **M5 / Doc-6G (`trust` schema)** and becomes oracle-ready when Doc-6G freezes (per-suite oracle-readiness §1.2). The `core.audit_records` `actor_type[…System…]` model (`Doc-6A §8`) is asserted as **corroboration** — the suite confirms the recorded actor was System — **not** as the rejection mechanism.

Enforcement and corroboration are now distinct; audit no longer mis-cast as enforcement.

### MINOR-2 — §9.6/§6.4 cross-layer "helper" overstatement → **FIXED**
§9.6 second sentence is replaced:
> This suite applies the **same canonical equivalence criterion** (excluded-case output ≡ non-matched-case output) **single-sourced in §6.4 (Doc-8D)**, at the **UI boundary**. It is **one criterion, two layer-checks** — the data-layer assertion (Doc-8D) and the presentation-layer assertion (Doc-8G) — **not** a duplicated definition and **not** a shared cross-layer code helper. A Doc-8G author must perform the UI check; "Doc-8D covers it" is not a substitute (the layers observe different surfaces).

Assert-once is preserved as single-source-of-definition; the two layer-checks are explicit.

### NITPICK-1 — §5.2 missing sort-key-index cross-link → **FIXED (applied)**
§5.2 gains a closing sentence:
> The deterministic-sort-key **index** that makes the cursor persistable is asserted at the data layer (`Doc-6A §10`, Doc-8D) — the contract-side grammar (here) and the data-side index (§6) are cross-linked, neither orphaned.

### REJECTED finding — upheld
"§5.5 vs M5 serving scores" stays **REJECTED as false** — `Doc-4A §9.7` prohibits a governance signal as a client *input*, not as a computed *output*; M5 serves outputs. No change.

---

## Post-patch state

| Severity | Open before | Open after |
|---|---|---|
| BLOCKER | 0 | 0 |
| MAJOR | 0 | 0 |
| MINOR | 2 | **0** |
| NITPICK | 1 | 0 (applied) |

---

## Short Closure Check (re-review)

| Finding | Sev | Closed? |
|---|---|---|
| MINOR-1 firewall enforcement attribution | MINOR | **CLOSED** — oracle = CLAUDE.md §4 + M5/Doc-6G; audit = corroboration |
| MINOR-2 cross-layer helper overstatement | MINOR | **CLOSED** — one criterion, two layer-checks; no shared helper implied |
| NITPICK-1 sort-key-index cross-link | NIT | **CLOSED** — `Doc-6A §10`/Doc-8D pointer added |
| REJECTED (§5.5 vs M5) | — | **Upheld false** |

No new defect introduced. Re-verified: CLAUDE.md §4 (firewall) vs `Doc-6A §8` (audit records actor, does not enforce); `Doc-6A §10` (indexing) as the sort-key-index oracle. **0 open BLOCKER/MAJOR/MINOR → Pass-2 APPROVED.**

*End of Content Pass-2 Patch v1.0.1 + Closure Check. Nothing coined; no frozen document edited. Next: Content Pass-3 (§10–§12 + Appendix A `CHK-8-xxx` check-ID assignment) — the final content pass before Content Freeze Audit → SERIES_FROZEN (folds in `ERR-8A-1`).*
