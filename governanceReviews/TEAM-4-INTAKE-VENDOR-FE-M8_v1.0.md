<!--
Doc-type:  QCT Review Intake (program org; NON-authoritative). Team 3 → Team 4 handoff.
Subject:   Milestone 8 — Vendor Shared Extraction Pass (zero-behavior refactor).
Prepared:  Team 3 (Vendor Experience), 2026-07-01. For review under TEAM-4-QCT-CHARTER_v1.0 + CLAUDE.md §13.
-->

# Team-4 QCT Intake — Vendor FE Milestone 8 (Shared Extraction Pass) v1.0

**From:** Team 3 (Vendor Experience) · **To:** Team 4 (Quality & Conformance Team) ·
**Charter:** [`TEAM-4-QCT-CHARTER_v1.0.md`](TEAM-4-QCT-CHARTER_v1.0.md) · **Governance:** CLAUDE.md §13.
**Requested action:** independent conformance review → findings with dispositions → **sign-off or block**
(commit/merge gate = **BLOCKER 0 · MAJOR 0 · MINOR 0**). Team 4 raises; the author/presiding authority rules.

> **Status:** NOT committed. This intake covers **M8** (the consolidation refactor) sitting atop the
> already-delivered Vendor presentation set **M1–M7** (each carried its own Team-3 adversarial conformance
> pass; available for QCT milestone sign-off at the team's cadence).

---

## 1. Scope & objective

M8 is a **zero-behavior refactor** authorized by the Board after M7: consolidate the three proven shared
assets into a `vendor/shared/` layer **before** backend wiring. **Binding constraint: byte-identical
render** — no UI, routing, API, or governance change; extraction only.

## 2. Change manifest

**Added — `app/(app)/_components/vendor/shared/`:**
- `workspace-tabs.tsx` — generic `WorkspaceTabs` infrastructure (the sole tab client component).
- `presentation-form-note.tsx`, `description-list.tsx` — moved verbatim from `vendor/company/`.
- `index.ts` — single import point.

**Adapters / retirements:**
- `CompanyProfileTabs`, `MicrositeTabs`, `ProductEditorTabs` → thin **RSC** adapters over `WorkspaceTabs`.
- `quotation-builder.tsx` uses `WorkspaceTabs` directly → **`quotation-builder-steps.tsx` deleted**.
- `EngagementDocuments` uses `WorkspaceTabs` → **dropped its own `"use client"`**.
- **Deleted:** `vendor/company/{presentation-form-note,description-list}.tsx`.

**Import normalization:** ~23 consumers repointed to `"../shared"`; dual-atom importers merged (satisfies
`import/no-duplicates`); `company/index.ts` + `rfq/index.ts` barrels cleaned of moved/retired symbols.

**Net effect:** `"use client"` surface **6 → 2** (`shared/workspace-tabs.tsx` + `leads/lead-pipeline.tsx`).

## 3. How byte-identical render is preserved

`WorkspaceTabs` defaults reproduce the exact pre-extraction markup: Tabs root `w-full` · TabsList
`flex h-auto w-full flex-wrap justify-start gap-1` · each TabsContent `mt-4`. Adapters pass no className
overrides; `defaultValue` falls through to `tabs[0].value` (= each wrapper's original first tab); trigger
label text and tab/content order are unchanged; `aria-label` is omitted from the DOM when not supplied
(standard React behavior; documented in-file). The two extracted atoms are moved verbatim.

## 4. Documented deviation (one — for QCT awareness)

**`LeadPipeline` is a deliberate `WorkspaceTabs` non-adopter.** Its List/Board `TabsList` is interleaved
with the filter/search toolbar in one flex row (`space-y-4` root, `gap-1` list, class-less content).
Routing it through the common `WorkspaceTabs` would alter the DOM, **violating the byte-identical rule
(Rule #1)** — which, per Validate-Findings, outranks the "all wrappers adapt" instruction. It remains a
bespoke client component. (A future `WorkspaceTabs` `toolbar` slot could absorb it, with no UI change —
out of scope here.)

## 5. Verification evidence (Team-3 self-checks — to be independently re-verified by QCT)

| Gate | Result |
|---|---|
| `tsc --noEmit` (whole project) | **exit 0** |
| `eslint` (`vendor/` + `workspace/`, incl. boundaries) | **exit 0** |
| `prettier --check` (vendor + workspace tree) | **clean** ("All matched files use Prettier code style!") |
| Dangling references to deleted files | **none** (grep clean across `app/`) |
| Team-3 adversarial review (3 lenses) | byte-identical-render **PASS** (1 MINOR adjudicated — see §6); zero-behavior/governance **PASS 0**; import-hygiene **PASS 0** |

**Production `next build` — BLOCKED (environment, not code).** Deterministic
`EPERM: scandir 'C:\Users\engra\Application Data'` — webpack's file-walk hitting a protected **Windows
home-directory junction** (pnpm store under the user profile + symlink traversal). Reproduced identically
across runs; fails in the glob phase before any app module; **no vendor file implicated**. Project build
config verified clean (`next.config.ts` minimal; Tailwind `content` globs are project-relative). A
home-dir permission error cannot be caused by adding files under `app/`; it is pre-existing and
environment-bound — consistent with this program's established "static gates + dev render" verification.
**Recommendation:** run the production `next build` in CI / a properly-permissioned environment as part of
the downstream commit gate (these files are not yet committed).

## 6. Open finding disposition (M8)

- **MINOR — `aria-label={undefined}` in `WorkspaceTabs`** (byte-identical-render lens): adjudicated
  **not actioned** — render is already byte-identical (React omits undefined attributes), and the idiom is
  the one the Board approved in `QuotationBuilderSteps` (M5). Editing code in a byte-identical refactor is
  the very risk being guarded against; a clarifying in-file comment was added instead. **Open for QCT to
  confirm or re-raise.**

## 7. Promotion Register (final)

| Component | Owner → | Consumers | Status |
|---|---|---|---|
| `PresentationFormNote` | `vendor/shared` | 6 features | **PROMOTED** |
| `DescriptionList` | `vendor/shared` | 4 features | **PROMOTED** |
| `WorkspaceTabs` | `vendor/shared` | 5 adapters + builder | **PROMOTED** |

**Held feature-local (Board "do NOT extract" — honored):** `CapabilityMatrix`, `TierChip`,
`FinancialTierPanel`, `ProductStatusChip`, `EngagementStatusChip`, the RFQ chips, `LeadStageChip`,
`MoneyBoundaryBanner` (single-consumer; await a second consumer).

## 8. Carried Flag-and-Halt items (NOT M8-introduced; for awareness — owned by the Boards, not QCT)

Five companion↔corpus surplus items remain open across the vendor set, routed to Architecture / API
Governance: profile/capacity fields · branding granular color/font · SEO `og_title`/`og_description` ·
product **SKU** · **PL-1 list value/title vs the minimal `ops.list_engagements`/`list_leads` projection**.
M8 touched no contracts; the count is unchanged.

## 9. Suggested QCT checklist (mapped to charter §Responsibilities)

1. **Component-duplication** — confirm `vendor/shared/` consolidates, coins no kit primitive; the
   interim native controls remain queued as `[ESC-7B-SELECT/TEXTAREA/SWITCH]` (not built into the frozen kit).
2. **Design-system conformance** — `status-chip` tokens still Doc-4M-derived; no token/markup drift from the move.
3. **Accessibility** — tab semantics preserved (roles/focus); `aria-label` behavior on `WorkspaceTabs`.
4. **Governance** — byte-equivalence / firewall / Content≠Presentation untouched; no invented slug/state/audit-action; presentation-only intact.
5. **Architecture** — RSC→client boundary (server adapters rendering the client `WorkspaceTabs`) is valid; `eslint-plugin-boundaries` (app→app) satisfied.
6. **Byte-identical** — spot-render the five adapted surfaces vs. their prior markup; confirm `LeadPipeline` unchanged.
7. **Milestone sign-off** — apply the §13 gate.

---

*Non-authoritative program-org artifact. Conforms upward; coins nothing. Team 3 delivers and self-checks;
Team 4 raises findings; the presiding authority rules (CLAUDE.md §7/§13); architecture-affecting
resolutions require human approval (§8).*
