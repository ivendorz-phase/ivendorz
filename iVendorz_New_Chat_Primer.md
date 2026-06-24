# iVendorz New Chat Primer

> **Purpose:** Quick-start orientation for new Claude sessions. Read this + `CLAUDE.md` before any work.
> Last updated: 2026-06-24.

---

## Active Program Phase

**Implementation Governance — Doc-5 series (API Realization layer).**

Architecture is COMPLETE/FROZEN. No code exists yet. Current deliverable: authoring Doc-5A…5M (one per module), each realizing Doc-4x caller-facing contracts as concrete HTTP endpoints under Doc-5A standards.

---

## Doc-5 Series Status (as of 2026-06-24)

| Doc | Module | Status |
|---|---|---|
| **Doc-5A** | API Standards | **FROZEN** — `Doc-5A_API_Realization_Standards_v1.0_FROZEN.md` |
| **Doc-5B** | M0 Platform Core | **FROZEN** — `Doc-5B_SERIES_FROZEN_v1.0.md` |
| **Doc-5C** | M1 Identity | **FROZEN** — `Doc-5C_SERIES_FROZEN_v1.0.md` |
| **Doc-5D** | M2 Marketplace | Structure **FROZEN** (`Doc-5D_Structure_v1.0_FROZEN.md`). Content Pass-1 authored (`Doc-5D_Content_v1.0_Pass1.md`, 214 lines, §0–§3 + 64-endpoint inventory) — **Hard Review NOT YET DONE** |
| **Doc-5E** | M3 RFQ Engine | **FROZEN** — `Doc-5E_SERIES_FROZEN_v1.0.md` |
| **Doc-5F** | M4 Business Ops | Structure Proposal v0.1 authored (`Doc-5F_Structure_Proposal_v0.1.md`). Hard Review DONE. Board Review DONE (2026-06-24). **Patch pending → freeze** |
| **Doc-5G** | M5 Trust | Not started |
| **Doc-5H** | M6 Communication | Not started |
| **Doc-5I** | M7 Monetization | Not started |
| **Doc-5J** | M8 Admin | Not started |
| **Doc-5K** | M9 AI Layer | Not started |

---

## Active Work Queue (priority order)

1. **[IMMEDIATE] Apply Doc-5F structure patch** (Board-approved 2026-06-24) → promote to `Doc-5F_Structure_v1.0_FROZEN.md`
   - M-01 [MAJOR]: Fix line 13 sibling note — `is not yet authored` → `is FROZEN (Doc-5E_SERIES_FROZEN_v1.0, 2026-06-24)`
   - m-01 [MINOR]: R9 / §2 / §7 / self-audit — replace `ASYNC_PENDING` HTTP-status notation with `202 Accepted (Doc-5A §10)`; add to R9: "`issue_engagement_document` → `POST …/{id}/issue_engagement_document` `202 Accepted`; response carries `generation_job_id`; polling via `get_generated_document` / `list_generated_documents`"
   - NP-01 [NITPICK]: R3 — add `Doc-5A App B.2` cite after `Doc-4A Appendix B.2`

2. **[NEXT] Doc-5D Content Pass-1 Hard Review** — `Doc-5D_Content_v1.0_Pass1.md` (214 lines). Request was interrupted before execution; not yet done. After: Pass-2 (§4–§6), Pass-3 (§7–§10+App A), Freeze Readiness Audit.
   - DD-6 blocker: `marketplace.*` POLICY keys must register in Doc-3 §12.2 before Freeze Audit (CHK-5A-121)

3. **[AFTER 1] Doc-5F Content passes** (Pass-1: §0–§3+inventory; Pass-2: §4–§5; Pass-3: §6–§10+App A) → Freeze Readiness Audit → `Doc-5F_SERIES_FROZEN_v1.0.md`

4. **[STANDING] Doc-5G…5K** — not started; each needs Structure Proposal → Hard Review → Board Review → Structure FROZEN → content passes → Freeze Audit → SERIES_FROZEN

### Standing Board Item (unactioned)
- **O-01:** Doc-4M M5 delegation-rows additive correction (surfaced in Doc-5C review; offered multiple times; not yet actioned by human owner)

---

## Staged-Freeze Lifecycle (every Doc-5x)

```
Structure Proposal v0.x
  → Independent Hard Review (finding register: BLOCKER / MAJOR / MINOR / NITPICK)
  → Board Review (Virtual CTO presiding; ruling on each finding)
  → Structure Patch → promote to Structure_v1.0_FROZEN.md
  → Content Pass-1 (§0–§3 + inventory)
  → Hard Review (Pass-1)
  → Content Pass-2 (§4–§N/2)
  → Hard Review (Pass-2)
  → Content Pass-3 (§N/2+1–§end + Appendix A)
  → Hard Review (Pass-3)
  → Freeze Readiness Audit (BLOCKER=0 · MAJOR=0 · MINOR=0)
  → SERIES_FROZEN + tracker sync (00_AUTHORITY_MAP.md, CORPUS_INDEX.md)
```

---

## Key Doc-5 Disciplines (binding every response)

- **Realize-never-redecide** — Doc-4x fixed *what*; Doc-5A fixed *how*; Doc-5x binds to wire only.
- **Reference-never-restate** — bind frozen slugs/events/audit-actions/POLICY keys by pointer; never copy.
- **Flag-and-halt** — on authority gap, frozen-doc conflict, or out-of-scope architecture question; escalate.
- **Never edit FROZEN doc** — additive patch only; patch file is authoritative at consolidation.
- **Mark transport choices** `[realization convention]` — anything not dictated by a frozen doc.
- **Architecture-touching changes require HUMAN approval** — code review alone is insufficient.

---

## R1 Out-of-Wire Boundary (universal precedent — Doc-5B/C/D/E/F)

Doc-5x realizes **only caller-facing HTTP**. These are always out-of-wire (no endpoint in any protocol):
- System event consumers (21.5)
- Internal-service reads (21.3, non-tenant)
- Async background jobs (enqueued internally)
- Outbox events, Inngest workers, cross-module function calls

**Flag-and-halt if wire is proposed for any of these.**

---

## §3 Cross-Cutting Section Precedent (Doc-5C/D/E/F)

Every Doc-5x has a `§3 — Cross-Cutting … Wire Model` section that is **mechanism-only** (owns no endpoint). It factors out: auth carriage, actor determination, Iv-Active-Organization server-validation, visibility/disclosure-scope model, `check_permission` exclusivity, non-disclosure `NOT_FOUND` collapse, entitlement gating. Content sections (§4+) depend on §3; §3 authors no endpoint body.

---

## Doc-5A Key Anchors (conformance gate)

- **§5.2** method mapping: create→POST/201, partial-update→PATCH/200, soft-delete→DELETE/200, state-command→POST named/200, read→GET/200. No PUT.
- **§5.3** path grammar: `/{module-namespace}/{resource-plural}[/{id}][/{command-name}]`
- **§6.2** error class→HTTP mapping
- **§7** identity/context/authz header carriage
- **§10** async: `202 Accepted`
- **App A** = CHK-5A-xxx conformance checklist = freeze gate
- **App B.1** = route namespace registry (M4=`operations`, M3=`rfq`, M2=`marketplace`, M1=`identity`, M0=`core`)
- **App B.2** (→Doc-4A App B.2) = error-code prefix registry (`ops_` for M4); "may differ" from route prefix

---

## M4 Business Operations (Doc-5F) Key Facts

- **50 contracts** (46 caller-facing + 4 out-of-wire)
- **Route prefix:** `operations` (App B.1); **Contract-ID token:** `ops.` (Doc-4F); **Error prefix:** `ops_`
- **Actor:** two-sided tenant User only (Buyer org scope / Vendor org scope); **no Admin, no Public**
- **BCs:** BC-OPS-1 (§4, CRM, 14) · BC-OPS-2 (§5, Engagements+Docs, 13) · BC-OPS-3 (§6, Leads, 4) · BC-OPS-4 (§7, Templates+GenDocs, 11) · BC-OPS-5 (§8, Finance, 4)
- **Out-of-wire (§9):** `create_engagement_on_award` · `create_lead_on_invitation` · `generate_document` · `read_crm_status_for_routing`
- **Non-disclosure (R5/Invariant #11):** buyer-vendor-status + buyer-private CRM never on tenant wire; `NOT_FOUND` collapse; CRM status egress = out-of-wire only
- **Money boundary (R8):** trade-invoice/payment/finance = records, not rails; no settlement surface
- **Async doc-gen (R9):** `issue_engagement_document` → `202 Accepted` (Doc-5A §10); body carries `generation_job_id`; poll via `get_generated_document`
- **Carried gaps:** `[ESC-OPS-SLUG]` · `[ESC-OPS-AUDIT]` · `[ESC-OPS-POLICY]` — not freeze gates at structure level

---

## Session Conventions

- **CAVEMAN MODE FULL** — active unless user says "stop caveman" / "normal mode"
- **Board reviews:** Virtual CTO presides; findings ruled in order (BLOCKER→MAJOR→MINOR→NITPICK); direction issued per finding
- **Corpus navigation:** start at `generatedDocs/CORPUS_INDEX.md` + `generatedDocs/00_AUTHORITY_MAP.md`
- **Implementation entry:** `IMPLEMENTATION_START_HERE.md` (root)

---

*Read CLAUDE.md for full invariants, module list, tech stack, and golden rules. This primer covers session state only.*
