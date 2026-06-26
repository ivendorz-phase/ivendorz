# Doc-6A — Database Realization Metastandard — SERIES FROZEN v1.0

| Field | Value |
|---|---|
| Document | Doc-6A Series Freeze Manifest v1.0 |
| Status | **FROZEN** — 2026-06-26 |
| Program | **Doc-6 — Database Realization** (the persistence sibling of the Doc-5 API program). **Doc-6A is the metastandard**; it governs Doc-6B…6K (per-module schema realizations) via Appendix A — the DB-program analog of Doc-5A |
| Realizes | `Doc-2_Domain_Model_And_Database_Blueprint` effective **v1.0.3** (the binding *what*-authority) on PostgreSQL/Supabase + Prisma `multiSchema` |
| Authority | `Doc-5_Program_Governance_Note_v1.0 §1/§8`; the frozen architecture corpus governs. **Doc-5A holds no conformance authority over Doc-6** (governance §8); Doc-6 is consistent-with the frozen Doc-5 surface as a cross-check only |
| Freeze evidence | `Doc-6A_Content_Freeze_Audit_v1.0.md` — APPROVE FOR FREEZE; 0 open BLOCKER/MAJOR/MINOR/NITPICK; 8 audit dimensions PASS |

---

## Effective set (the authoritative Doc-6A)

| Artifact | Role |
|---|---|
| `Doc-6A_Structure_v1.0_FROZEN.md` | Frozen structure — R-set R1–R12, program partition (6A + 6B…6K), section map §0–§13 + Appendix A; R3(b) Board-ratified |
| `Doc-6A_Structure_Freeze_Audit_v1.0.md` | Structure freeze certification (PASS) |
| `Doc-6A_Content_v1.0_Pass1.md` | §0–§4 — control · scope/partition · stack/authority (+ **§2.5 realization-choice attribution**) · schema conventions · tenancy/RLS |
| `Doc-6A_Content_v1.0_Pass2.md` | §5–§9 — integrity/constraints · immutability/soft-delete/versioning · outbox · audit · POLICY/seed |
| `Doc-6A_Content_v1.0_Pass3.md` | §10–§13 + Appendix A (bands A–I, `CHK-6-001…083`) — indexing/pagination · migration/codegen · out-of-DB · conformance/carried |
| `Doc-6A_Content_v1.0_Pass4.md` | **Appendix B (Global Conventions Registry)** + Appendix A Band J (`CHK-6-090…093`) — the "Global Registry" recommendation realized inside Doc-6A |
| `Doc-6A_Content_Freeze_Audit_v1.0.md` | Content freeze certification (PASS) |

*(No `Doc-3`/`Doc-2` patch was required to freeze Doc-6A — it coins nothing; the only per-module additive channel pre-identified is the open M1 `identity` POLICY namespace, carried as `[ESC-6-POLICY]` for Doc-6C.)*

---

## What Doc-6A fixes (binding on Doc-6B…6K)

- **R1 program shape** — Doc-6 = Doc-6A metastandard + Doc-6B…6K per-module schema realizations (letter map B=M0 … K=M9), each staged-freeze, gated by Appendix A. One Module, One Owner at the persistence layer.
- **R2 realize-never-redecide** — Doc-2 is the *what*; Doc-6 realizes the *how*. Nothing coined. Gaps → `[ESC-6-*]`.
- **R3 schema = canonical namespace (a, binding) + one Prisma namespace per module (b, Board-ratified)** — no cross-schema FK; cross-module refs are bare UUID, service-validated, orphan-scan-reconciled.
- **R4 Doc-5 consistency, not conformance** — every Doc-5x surface persistable; `[ESC-6-API]` on a gap.
- **R5–R12** — standard-column contract · outbox transactionality · immutability (+ sole `ai.*` TTL hard-delete exception, Doc-5K R7) · RLS-as-backstop + non-disclosure byte-equivalence · multi-currency · forward-only non-destructive migrations · POLICY config seed (9 namespaces) · out-of-DB boundary.
- **§2.5 realization-choice attribution** — every physical specific not stated by Doc-2 is a Doc-6 *how* choice (binding on modules, no Doc-2 authority), vs. Doc-2 bindings realized verbatim.
- **Appendix A** — 10 bands (A–J) / 37 stable `CHK-6-xxx` checks: the per-module freeze gate.
- **Appendix B** — Global Conventions Registry (base model · Prisma/PG type catalog · cross-cutting shared-enum catalog · naming registry · pointers). Modules realize these conventions; they invent no parallel ones.

## Carried items (per-module gates for Doc-6B…6K — resolved only via named channels)

`DR-6-CORE` (M0 owns outbox/audit/id/config; realized Doc-6B) · `DR-6-API` (Doc-5 persistability cross-check) · `DR-6-STATE` (state machines as columns + enforcement) · `[ESC-6-SCHEMA]` (additive Doc-2 patch) · `[ESC-6-POLICY]` (additive Doc-3 §12.2 patch — incl. the open **M1 `identity`** namespace, a Doc-6C cross-check) · `[ESC-6-API]` (Board → additive Doc-2 patch; never local).

## Provenance (reference only)

Structure: Proposal v0.1 → Independent Hard Review (1 BLOCKER→MAJOR + 2 MAJOR + 3 MINOR + 2 NIT) → v0.2 → Structure Freeze Audit (PASS) → FROZEN; Board ratified R3(b). Content: Pass-1/2/3 each per-pass-reviewed (author → board hard review → fix → short re-review) · Pass-4 additive Global Registry · full cross-pass Content Hard Review (READY) · Content Freeze Audit (APPROVE).

---

*Doc-6A (Database Realization Metastandard) is FROZEN. Realizes Doc-2 on PostgreSQL/Supabase + Prisma `multiSchema`; the DB-program analog of Doc-5A; governs Doc-6B…6K via Appendix A; consistent-with (not conformant-to) the frozen Doc-5 surface; coins nothing. On any conflict with Doc-2 or the frozen corpus, the frozen corpus wins; flag-and-halt. Next: Doc-6B (M0 `core`) — first per-module schema realization.*
