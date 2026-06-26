# Doc-7B — Content Pass-1 (§0–§4) — **Independent Hard Review (Architecture Board)**

| Field | Value |
|---|---|
| Reviews | `Doc-7B_Content_v1.0_Pass1.md` (§0–§4) |
| Date | 2026-06-26 |
| Reviewer | Independent Architecture Board (Board Chair · Enterprise · DDD · API Governance · Security) |
| Mode | Hard Review → Defect Hunting · conformance to frozen `Doc-7A` + repo constitution |
| Verdict | **NOT YET PASS** — 0 MAJOR + 3 MINOR + 1 NITPICK; 0 BLOCKER. Resolve via Content Patch → short closure check → Content Pass-2 |

---

## Anchors verified CORRECT

- Three-layer kit boundary (primitives → app components → surface composition); no data/state/fetch in kit — conforms to `Doc-7A R5/R12`. CORRECT.
- §2.2 RSC discipline (Server-default; interactive = explicit Client) — `Doc-7A §3.3`. CORRECT.
- §3.3 status→variant keyed on contract value; no status/label coined — `Doc-7A §7.1`. CORRECT.
- §3.4 microsite theming presentation-only, owns no M2 content — `Doc-7A §6.2`. CORRECT.
- §4 props-in / by-reference / no M3 re-rank — `Doc-7A §6/§6.3`, `Doc-4A §10.1`. CORRECT.

0 BLOCKER, 0 MAJOR — the kit foundation is faithful to frozen Doc-7A. Three precision/consistency refinements + one nit.

---

## Findings

### MINOR-1 — §1.4 physical-home pointer is imprecise (no UI folder in the constitution's `src/shared/`)
§1.4 attributes the kit's home to `src/shared/` ("framework-level"). **Verified against `REPOSITORY_STRUCTURE.md` lines 207–212:** the `src/shared/` subtree is enumerated as **`db/ · result/ · ids/ · validation/ · telemetry/`** — there is **no UI / component-kit folder**, and `app/` is "routing & UI composition only." Asserting `src/shared/` as the kit's home implies a folder the repository constitution does not enumerate (a soft coinage against the constitution).
**Required fix:** §1.4 state that the constitution **does not yet enumerate** a presentation/UI-kit location; the kit's placement is **deferred to implementation / an additive constitution update**, not fixed here. Doc-7B fixes **conventions, not the file tree** (keep the hedge; drop the specific `src/shared/` home claim).

### MINOR-2 — §0.1 precedence chain omits the Doc-6 sibling
§0.1 shows `… → Doc-5A…5K → Doc-7A → Doc-7B…7H → Code`, omitting Doc-6 — the same omission corrected in `Doc-7A` (Structure→Content Pass-1 C-4). For consistency, Doc-6 and Doc-7 should appear as **siblings** at the Implementation Contract layer.
**Required fix:** show Doc-6A→6K and Doc-7A→7H as siblings (neither governs the other; both realize upstream).

### MINOR-3 — §4.3 sort/filter must be a new contract request, not a client-side cross-page reorder
§4.3 says kit sort/filter "reorder only within the surface-supplied result set." Under **cursor pagination**, the result set is **per-sort-key** and paginated — a client-side reorder of already-fetched pages is **inconsistent across page boundaries** and could surface an ordering the contract never intended (an inference risk against `Doc-5A §8`/`Doc-4A §10.7`). A sort/filter **change** must trigger a **new contract request** with the contract's sort/filter params (`Doc-4A §9.6`), re-issued by the surface — not a client reshuffle.
**Required fix:** §4.3 distinguish — a kit sort/filter control **signals the surface to re-query** with the contract's `sort`/`filter` params; it **never** reorders/refilters already-paginated results client-side. Local interaction state (which sort is selected) is presentation; the data reorder is the contract's.

### NITPICK-1 — §2.1 "surface composition — NOT Doc-7B" row
The row is correct (boundary clarity) but sits inside a Doc-7B architecture table; tag it explicitly as a **non-normative boundary marker** so it cannot read as Doc-7B specifying surface behavior.
**Required fix:** label the row "*(boundary marker — out of scope; surfaces own this)*".

---

## Disposition summary

| Finding | Sev | Channel |
|---|---|---|
| MINOR-1 §1.4 physical-home imprecise | MINOR | Content Patch — defer placement, drop src/shared claim |
| MINOR-2 §0.1 omits Doc-6 sibling | MINOR | Content Patch — add sibling |
| MINOR-3 §4.3 sort = re-query not client reorder | MINOR | Content Patch — distinguish |
| NITPICK-1 §2.1 boundary-marker tag | NIT | Content Patch — label |

**Gate:** clears only at 0 open BLOCKER/MAJOR/MINOR (governance §8 rule 1). 3 MINOR open → **Content Patch required**, then short closure check, then Content Pass-2 (§5–§9 + Appendix).

*End of Content Pass-1 Independent Hard Review. Nothing coined; no frozen document edited. No MAJOR manufactured — the foundation is sound; the three MINORs are genuine precision/consistency defects (constitution conformance, sibling precedence, cursor-pagination reorder semantics).*
