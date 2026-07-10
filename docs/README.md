# docs/ — Living Documentation

**Status:** Living (mutable) · non-authoritative under the frozen corpus
**Registered by:** `REPOSITORY_STRUCTURE.md` Additive Patch v1.1 (Board-approved 2026-07-06)
**Navigation:** [`INDEX.md`](INDEX.md)

---

## 1. Documentation philosophy — frozen vs living

The repository has exactly two kinds of documentation:

- **Frozen** — the architecture corpus in `generatedDocs/`. Authoritative, immutable,
  changed only by additive patch + version bump with human approval (CLAUDE.md §7/§11).
  Start at `generatedDocs/CORPUS_INDEX.md`; authority/status per document lives in
  `generatedDocs/00_AUTHORITY_MAP.md`. **Nothing in `docs/` may restate, override, or
  fork the corpus — bind frozen entities by pointer, never by copy.**
- **Living** — everything in this directory. Engineering and product documentation that
  evolves with the work. On any conflict with a frozen document, the frozen document wins
  and the living document is corrected (Flag-and-Halt if the conflict is frozen-vs-frozen).

`governanceReviews/` is a third, special case: a **pinned, append-only provenance archive**
(audits, Board packets, adjudications). Existing records never relocate and are never edited;
finalized governance records continue to be filed there.

## 2. Documentation Ownership Matrix

| Area | Purpose | Owner | Mutable | AI may edit |
|---|---|---|---|---|
| `generatedDocs/` | Frozen architecture corpus | Architecture authority (CLAUDE.md §7) | ❌ additive patches only, human-approved | ❌ |
| `governanceReviews/` | Audit history, Board records, proposal provenance | Governance (CLAUDE.md §13) | Append-only | New records only |
| `docs/` | Living engineering & product documentation | Engineering | ✅ | ✅ |
| `project-management/` | Execution tracking (FE-PM ledger, boards, WBS) | Delivery | ✅ | ✅ |
| `prompts/` | AI prompt library | Engineering | ✅ | ✅ |
| `design/` | Design **source files** (figma/exports/assets) — engineering docs live in `docs/frontend/` | UX | ✅ | ✅ |
| `templates/` | Recurring document templates | Engineering | ✅ | ✅ |
| `examples/` | Onboarding / AI reference examples | Engineering | ✅ | ✅ |
| `prototypes/` | Quarantined standalone experiments (excluded from root build gates) | Engineering | ✅ | ✅ |

## 3. Reserved-Directory rule

> Reserved directories are part of the approved taxonomy but are created only when they
> receive their first committed artifact — with a README charter or first content, never
> as empty scaffolding.

Currently reserved (registered, not yet materialized): `docs/backend/`, `docs/testing/`,
`docs/governance/`, `docs/adr/`, `tools/`.

**`docs/adr/` note:** reserved ONLY for engineering implementation notes and future RFCs.
The authoritative ADR corpus remains under `generatedDocs/` — nothing is duplicated.

## 4. Naming conventions

- Follow the existing corpus style for new documents: descriptive snake_case or the
  established UPPER_SNAKE spec style; version-suffix documents that freeze (`_v1.0`).
- One document, one owner, one purpose. Point to authority — never restate it.
- New root-level files require Board approval (constitution v1.1 P-5); loose documents
  belong in a registered area, not at root.
