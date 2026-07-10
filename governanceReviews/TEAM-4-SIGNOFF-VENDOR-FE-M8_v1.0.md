<!--
Doc-type:  QCT Milestone Sign-off (program org; NON-authoritative). Team 4 → Team 3 response.
Subject:   Milestone 8 — Vendor Shared Extraction Pass (zero-behavior refactor).
Reviewed:  Team 4 (Quality & Conformance), 2026-07-01. Under TEAM-4-QCT-CHARTER_v1.0 + CLAUDE.md §13.
-->

# Team-4 QCT Sign-off — Vendor FE Milestone 8 (Shared Extraction Pass) v1.0

**From:** Team 4 (Quality & Conformance Team) · **To:** Team 3 (Vendor Experience) ·
**Intake:** [`TEAM-4-INTAKE-VENDOR-FE-M8_v1.0.md`](TEAM-4-INTAKE-VENDOR-FE-M8_v1.0.md) ·
**Charter:** [`TEAM-4-QCT-CHARTER_v1.0.md`](TEAM-4-QCT-CHARTER_v1.0.md) · **Governance:** CLAUDE.md §13.

**Review sequence position:** Step 2 of the QCT sequence (Platform → **Vendor Shared Extraction** →
Public Promotion → Full-tree Integration → RC).
**Reviewed target (stable-target rule):** committed **HEAD `2571ca7`** vs pre-extraction baseline
**`7a34932`** (working tree was clean at launch). Uncommitted platform `card.tsx` / charter edits that
appeared mid-review were **excluded** (out of scope; not in the reviewed commit).
**Method:** 6-dimension adversarial verification fan-out (each dimension tasked to *disprove* the
zero-change contract) + board re-run of `tsc`/`eslint`/`prettier` + per-component `git`-diff of
baseline↔HEAD. Independent re-verification of the Team-3 self-checks in §5 of the intake.

---

## Verdict

```
BLOCKER : 0
MAJOR   : 0
MINOR   : 0   (one raised in intake §6 — adjudicated not-actioned, QCT-confirmed; see Dispositions)
NIT     : 1
OBS     : 11

Status:
APPROVED
```

The M8 **byte-identical-render** contract **holds**. The extraction is a clean equivalence-preserving
consolidation: no behavior, UI, routing, API, or governance change was found on any reviewed surface.
Cleared to merge under §13 (BLOCKER 0 · MAJOR 0 · MINOR 0), subject only to the standard downstream
commit gate (production `next build` in CI — see Disposition D-3, environment-bound, not M8-introduced).

---

## Independent verification (re-confirms intake §3 / §5)

- **Moved atoms are verbatim.** `DescriptionList` (R065 rename) and `PresentationFormNote` differ from
  their pre-extraction `vendor/company/` copies **only in the comment header** — non-comment bodies diff
  empty. Props, defaults, JSX, Tailwind classes, and literal copy are byte-identical.
- **`WorkspaceTabs` reproduces pre-extraction markup exactly.** Tabs root `w-full` · TabsList
  `flex h-auto w-full flex-wrap justify-start gap-1` · TabsContent `mt-4` · `defaultValue ?? tabs[0].value`
  · `aria-label` omitted when unsupplied. Verified equivalence on **all five** adopters
  (CompanyProfileTabs, MicrositeTabs, ProductEditorTabs, EngagementDocuments, and the quotation step rail) —
  same tab set / order / labels / default / aria-label; the 96-line `engagement-documents` churn is purely
  imperative→declarative restructure (default tab stays `loi`, `PAYMENT_PANEL` hoisted to a static const).
- **`quotation-builder-steps.tsx` deletion is IN-SCOPE** — it was the prototype `WorkspaceTabs`
  generalizes; the M5 moat 7-step array is byte-untouched (clickable any-order `[M-Q1]` preserved).
- **Composition, not duplication.** `WorkspaceTabs` composes the frozen kit `Tabs` primitive
  (`@/frontend/primitives/tabs`); no Radix re-implementation, no new kit primitive coined (BR2/BR12).
- **Import hygiene clean.** 24–26 consumers repointed to `"../shared"`; **no** consumer reaches across the
  sibling `company/index.ts` barrel (coupling-smell check passes); old paths fully deleted; barrels
  (`company/index.ts`, `rfq/index.ts`) carry no dangling exports; grep for deleted symbols = none.
- **Ownership / governance.** Shared files import only `react` + the kit (`@/frontend/*`) — **zero
  cross-module imports**, presentation-only, A7-safe; no firewalled governance signal rendered.
- **RSC boundary correct.** Adapters became RSC; the `"use client"` boundary relocated into
  `WorkspaceTabs`; **use-client surface 6 → 2** (`shared/workspace-tabs.tsx` + `leads/lead-pipeline.tsx`) —
  independently confirmed.
- **Static gates GREEN (board re-run):** `tsc --noEmit` exit 0 · `eslint` (shared + 5 adapters) exit 0 ·
  `prettier --check` clean · dangling-reference sweep clean.

## Dispositions (Raise ≠ Accept)

- **D-1 — intake §4 `LeadPipeline` non-adoption → ACCEPTED (verified).** `lead-pipeline.tsx` is
  **byte-unchanged** baseline↔HEAD and remains a bespoke client component. Adopting `WorkspaceTabs` would
  have altered its interleaved-toolbar DOM, breaking byte-identical (Rule #1). Team-3's Validate-Findings
  reasoning is correct; the deviation is sound and well-documented.
- **D-2 — intake §6 MINOR `aria-label={undefined}` → CONFIRMED not-actioned.** Render is already
  byte-identical (React omits undefined attributes); the idiom is the Board-approved M5 `QuotationBuilderSteps`
  pattern; editing code in a byte-identical refactor is the very risk being guarded against. Fails
  Validate-Findings Q3 ("best for the product"). **Not re-raised.** Non-gating.
- **D-3 — intake §5 production `next build` BLOCKED (environment) → OBS, accepted with CI condition.**
  The `EPERM: scandir 'C:\Users\engra\Application Data'` is a Windows home-junction traversal error in
  webpack's file-walk, pre-existing and not implicated by any M8 file (consistent with this program's
  "static gates + dev render" convention). **Condition:** run the production `next build` in CI / a
  properly-permissioned environment as part of the downstream commit gate before release. Not M8-introduced;
  does not block this sign-off.
- **D-4 — NIT: `presentation-form-note.tsx` shows as Delete+Add, not a git rename.** Cosmetic history
  artifact (header changed enough to defeat similarity detection); body byte-identical. No action.

## Promotion watchlist (carried to Step 4 — full-tree gate)

- **`DescriptionList` cross-workspace divergence.** A vendor copy (`vendor/shared/description-list.tsx`)
  and a pre-existing buyer copy (`(buyer)/_components/description-list.tsx`) now coexist as parallel
  implementations across **two workspaces**. Per the promotion ladder this is a **platform-kit
  (`src/frontend/`) promotion candidate** — but a cross-workspace decision owned by the **Step-4 full-tree
  gate** with Board sign-off, **not** M8. Correctly held vendor-local here.
- **Held feature-local (Board "do NOT extract", honored):** `CapabilityMatrix`, `TierChip`,
  `FinancialTierPanel`, `ProductStatusChip`, `EngagementStatusChip`, RFQ chips, `LeadStageChip`,
  `MoneyBoundaryBanner` — single-consumer; await a second consumer. No premature extraction found.

## Scope notes

- **Commit bundling (process, non-gating).** The reviewed window (`5a78f83`, `2745194`) interleaves the
  vendor extraction with **Public-promotion** work (`app/(public)/search/page.tsx`, `src/frontend/components/{filter-sidebar,search-bar}`)
  — that is **Step-3's** target, deferred. Future milestones should land one milestone per commit for cleaner gating.
- **Carried Flag-and-Halt items (intake §8)** — five companion↔corpus surplus items remain open, owned by
  Architecture / API Governance Boards, **not QCT**; M8 touched no contracts, count unchanged.

---

*Non-authoritative program-org artifact. Conforms upward; coins nothing. Team 4 raises and gates; the
presiding authority rules (CLAUDE.md §7/§13); architecture-affecting resolutions require human approval (§8).*
