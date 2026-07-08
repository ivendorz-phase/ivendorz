<!--
Status:     v0.2-draft — Stage-3 design companion to admin_console_planning_and_design.md.
            Holds the prototype-level (visual/interaction/deliverable) guidance intentionally
            kept OUT of the Stage-1 planning document. GATED: this brief takes effect only after
            Stage-2 Board approval of the planning document; it authorizes NO build.
            v0.2 = phase-boundary pass (review round on the brief): visual building blocks stated
            in UX terms (primitive composition → Stage-5); responsive = intended experience, not
            operational capability; conventions + review checklist + legend added. See §9.
Authority:  NON-AUTHORITATIVE design companion. Subordinate to the frozen corpus (CLAUDE.md §7)
            and to the frozen design system (Doc-7B kit/tokens, Doc-7C shell). Coins nothing —
            it prescribes USAGE of the frozen design system for the Admin Console prototype.
Produced:   2026-07-08.  ·  Reading time: ~6 min.
Scope:      Stage-3 hi-fi click-through of the 29 Admin Console surfaces (P-ADM-01…29).
-->

# Admin Console — Stage-3 Prototype Design Brief

> **Status & gate.** NON-AUTHORITATIVE Stage-3 companion to
> `docs/product/requirements/admin_console_planning_and_design.md`. It becomes active **only after
> Stage-2 Board approval** of the planning document, and it **authorizes no build** — the prototype
> is a design artifact under `prototypes/admin-console/`. It **coins nothing**: all composition binds
> the frozen design system (**Doc-7B** kit/tokens, **Doc-7C** shell). Governance authority stays with
> the planning document and the frozen corpus; on any conflict → **Flag-and-Halt** (CLAUDE.md §11).

> **Why this document exists.** Stage-1 planning deliberately excludes visual/layout specification so
> Stage-3 retains design-exploration room and the phase boundary stays clean. This brief holds the
> prototype's visual language, layout, building blocks, interaction model, responsive experience,
> deliverables, and Stage-4 approval criteria. Every governance rule (firewalls, non-disclosure,
> no-active-org, contract/state/slug bindings) is **inherited by pointer** from the planning
> document — this brief never restates or overrides it. **Component/primitive composition is a
> Stage-5 decision** and is out of scope here.

> **Revision history.** v0.1 (2026-07-08) — initial. v0.2 (2026-07-08) — brief review round: MAJOR-01
> building blocks stated in UX terms (primitive mapping removed → Stage-5); MAJOR-02 responsive =
> intended experience, not operational capability; +two dashboard directions, planning-consistency
> criterion, keyboard annotation, Honest-Empty-State term, folder/naming conventions, interaction
> legend, review checklist, shell sketch, flow examples. Dispositions in §9.

---

## 0. Inheritance & non-negotiables (by pointer)

This brief inherits, and must not weaken, from `admin_console_planning_and_design.md`:

- **DP-A1…A11** design/governance principles and the **§4 firewall summary** (no score write · no
  matching/award · no owning-module direct write · no active-org · non-disclosure `NOT_FOUND` ·
  `VendorBanned` sole event).
- The **§6 per-surface governance** (authority/permission/state machine) — the prototype *visualizes*
  these; it changes none of them.
- **DP-A8 / DP-A9 / DP-A11:** no fabricated data (every count binds a frozen read or is a visible
  `[ESC-7-API]` placeholder); no new primitive/color/foundation; WCAG-AA + **Honest Empty States**.

**Dependency:** this brief depends entirely on the planning document (governance) and on Doc-7B/7C
(design system); it owns only the prototype's *visual and interaction* realization.

---

## 1. Visual language & tokens-in-use (frozen tokens — coins no color)

- **Language:** enterprise · clean · data-first · low visual noise · fast scanning · dense desktop.
- **Palette (frozen tokens only):** Navy-dominant (`--iv-navy-*`; navy sidebar `--iv-nav-*`), indigo
  for **interactive** only (`--iv-brand-*`), gold for **premium** (`--iv-amber-*`), and the semantic
  status tokens — **success (green) / warning (amber) / critical (red) / info** — for state chips,
  queue severity, and lifecycle badges. Default light (frozen theme). **No new color** — usage only.
- **Density & type:** compact table-row rhythm; the kit type scale; tabular numerals for aligned
  columns (counts, dates, IDs); monospace treatment for human refs / IDs where scanning matters.
- **Icon system:** **Lucide only** (kit standard) — no bespoke or AI-fabricated icons.
- **Dark mode:** **optional**, token-driven re-skin only — never a second design system.

## 2. Layout grid & shell

- **Grid:** 12-column, **24px gutters**, **1440 baseline**. Data tables are wide and scroll **within
  their own container** — the page body never scrolls horizontally.
- **Shell sketch (IA detail = planning §3):**

  ```
  ┌──────────────────────────────────────────────────────────┐
  │  ▉ brand      [ global search (placeholder) ]   🔔  staff │  ← header
  ├────────────┬─────────────────────────────────────────────┤
  │  navy      │                                              │
  │  sidebar   │   content region (12-col grid, fluid)        │
  │  (grouped  │                                              │
  │   nav →    │   queues · detail panels · dashboard tiles   │
  │   frozen   │                                              │
  │   nodes)   │                                              │
  └────────────┴─────────────────────────────────────────────┘
  ```
- **Sidebar behavior:** **collapsed · expanded · pinned · responsive**; active-node highlight via the
  frozen nav tokens; grouping per the planning §3 IA (frozen nodes only).
- **Header:** staff identity · notification-center entry (Doc-7C delivery display) · a **global search
  placeholder** — a **non-functional** affordance (open/focus/empty states shown) that implies **no
  search API** (none is frozen; a real one would be `[ESC-7-API]`).

## 3. Responsive experience (intended experience — not operational capability)

The console is **desktop-first**. The prototype **demonstrates responsiveness** — it does not
prescribe which actions are available per device (that operational posture is a product decision held
in planning §2 and finalized at Stage-5).

- **Demonstrate** graceful adaptation at representative widths: **1920 / 1600 / 1440** (full console,
  side-by-side detail), **1366** (condensed density, collapsible sidebar), and reflow to smaller
  viewports (single-column, sidebar → drawer).
- **Show** how dense tables, detail panels, and the sidebar reflow — the *experience*, not a rule
  about tablet/mobile capability.

## 4. Visual building blocks (UX-level regions — reuse Doc-7B; composition → Stage-5)

The prototype is assembled from these **visual building blocks**, described as UX regions. **Prototype
compositions must reuse the frozen Doc-7B design system**; the specific primitive composition of each
block is deliberately **left to Stage-5** (this brief names no primitive). Each block carries only its
governance/honesty constraint.

| Building block | What it is | Governance / honesty note |
|---|---|---|
| **KPI Summary** | headline count tiles on the dashboard | each count binds a frozen `list_*` read or shows an `[ESC-7-API]` placeholder (DP-A8) |
| **Queue Summary** | a scannable list/table of queue items | reuse the built queue pattern (anchor below); deep-links, no inline mutation |
| **Activity Timeline** | recent staff activity | composed from `list_*` reads; **no derived metric** |
| **Audit Timeline** | audit history | Doc-2 §9 audit reads; read-only |
| **Trend Visualization** | counts over time | **no** matching/ranking/score-derived series (moat + firewall) — only frozen-read counts |
| **Health Indicator** | status marker | rendered **only** if a real read binds (System health is `[ESC-7-API]`) |
| **Filter Region** | filter/sort controls | filter/sort fields must be Doc-4A §9.6 allowlisted |
| **Bulk-Action Region** | multi-select actions | only frozen-allowed actions; **no coined bulk-transition** (DP-A7) — each action routes to a single-target command |
| **Command Region** | quick navigation palette | navigation affordance only; no new command coined |
| **Notification Region** | staff notifications | M6 delivery display only; no mutation |
| **Detail Panel** | a single record's governance view | shows the frozen fields/state for that surface (planning §6); Honest Empty State when absent |

- **Reuse anchor (pointer):** the built admin queue/table pattern —
  `app/(app)/_components/admin/admin-queue-table.tsx` (`AdminQueueTable`) + `admin-shell-vm.ts` — is
  the reuse anchor for queue/list blocks. Greenfield **re-skins** the pattern; it never duplicates the
  foundation.
- **Missing/deferred building blocks:** where a block needs a Doc-7B primitive not yet vendored (e.g. a
  data table, notifications, selects), the prototype may **mock it visually**; vendoring is a
  Doc-7B/Stage-5 action, **never a local invention**. A genuinely missing embedded component → raise
  **`[ESC-7-DESIGN]`** to the Doc-7B definer.

## 5. Dashboard (P-ADM-01) — two exploration directions

The planning §6 fixes **what information must be represented** and its frozen-read binding; this brief
offers **two acceptable arrangements** to explore at Stage-3 (neither is a mandate — the only hard
constraints are the frozen-read bindings and the no-fabricated-data rule):

- **Direction A — "triage-first" (queues dominant):** a slim KPI strip on top, then large
  side-by-side **Queue Summaries** (moderation · verification · approvals) as the primary content,
  with activity/audit in a right rail. Optimizes for staff who live in the queues.
- **Direction B — "signal-first" (overview dominant):** a prominent **KPI Summary** grid up top,
  then a two-column band of pending-approvals + RFQ-health, with activity/audit and quick-actions
  below. Optimizes for a supervisory at-a-glance read.

In both: the notification region lives in the header drawer; **System health renders as a visible
`[ESC-7-API]` placeholder**, never as real data.

## 6. Interaction & annotation model

- **Annotation types — Interaction Notes** on each surface: **hover · click · keyboard · transition ·
  modal · drawer** — so Stage-4 (and the accessibility review) is unambiguous. **Keyboard** paths are
  annotated for every primary action (queues and detail must be keyboard-navigable — DP-A11).
- **State coverage per surface:** hover · loading · **Honest Empty State** · error · success (+
  disabled System-only actions like `expire_ban` / `process_import_job`, shown disabled).
- **Interaction legend (annotation key used across the prototype):**

  | Marker | Meaning |
  |---|---|
  | ✋ hover | hover/focus affordance |
  | 👆 click | primary click action → destination/command |
  | ⌨ keyboard | keyboard path (tab order / shortcut) |
  | 🚫 disabled | rendered-but-disabled (System-only or unavailable-from-state) |
  | ⏳ loading | skeleton/loading state |
  | 👁 permission-hidden | element hidden when the staff slug is absent (not greyed — hidden) |

- **Sidebar:** collapsed · expanded · pinned · responsive (§2). **Global search:** non-functional
  placeholder only (§2).

## 7. Stage-3 deliverables & conventions

**Deliverables:**
- Global admin **shell** (navy sidebar + header) and **dashboard** (P-ADM-01).
- **All 29 surfaces** at high fidelity, with **clickable navigation** across the full frozen IA
  (planning §3).
- **State coverage** per §6; **responsive experience** per §3; **dark mode** (optional).
- **Design annotations** + interaction legend per §6.

**Prototype folder structure (by IA group):**
```
prototypes/admin-console/
  index.html            # shell + navigation
  dashboard/            # P-ADM-01
  operations/           # moderation 02/03/04 · verification 12/13 · import 14/15
  enforcement/          # bans 05/06
  marketplace/          # vendor 07 · categories 08/09 · ads 10/11 · suggestions 27 · links 28
  rfq-operations/       # routing 19/20 · matching 21
  outreach/             # 16/17/18
  billing/              # plans 22/23 · entitlements 24
  identity/             # orgs 25 · users 26
  support/              # 29
  _assets/              # shared styles/icons (Doc-7B token usage)
```

**Naming conventions:** surface files `P-ADM-nn-<slug>.html` (e.g. `P-ADM-06-ban-detail.html`);
state variants annotated in-page (not separate files); screenshots `P-ADM-nn-<state>.png`
(e.g. `P-ADM-06-empty.png`).

**Example clickable flows (to demonstrate):**
1. Dashboard KPI "open moderation cases" → moderation queue (P-ADM-02) → case detail (P-ADM-03) →
   decide (approve/reject/escalate) → back to queue with updated state chip.
2. Bans queue (P-ADM-05) → ban detail (P-ADM-06) → issue ban (vendor by ID) → confirmation showing
   `VendorBanned` framing (platform-wide, vendor-visible).

## 8. Stage-4 approval criteria (the visual-approval gate)

**Prototype review checklist (run before requesting Stage-4 sign-off):**
- [ ] All 29 surfaces present, reachable via clickable navigation.
- [ ] Every count/tile binds a frozen read or shows an `[ESC-7-API]` placeholder (no fabricated data).
- [ ] All five states covered per surface (incl. Honest Empty State + disabled System-only actions).
- [ ] Keyboard paths annotated; contrast meets WCAG-AA (token-driven).
- [ ] Only frozen Doc-7B tokens/components used; no coined color/primitive.
- [ ] No firewall breach visualized (no score write, no award/eligibility, no staff-internal leak).
- [ ] Each surface traceable to its planning §6 authority/permission/state machine.

**Approval criteria (Stage-4 gate):** navigation clarity · information hierarchy · visual consistency ·
interaction consistency · responsive experience · accessibility (WCAG-AA) · **design-token
compliance** · **consistency with the Stage-1 planning document** (every surface matches its
governance spec) · **no invented workflow** · **no invented data** · **stakeholder visual approval
required before Stage-5**.

> Stage-5 (FE Implementation Plan) begins **only** after Stage-4 visual approval against these
> criteria. This brief authorizes no build.

---

## 9. Disposition Log (brief review round — Validate-Findings gate)

| # | Finding | Severity | Disposition |
|---|---|---|---|
| B-M1 | Widget composition still mapped to primitives (component design) | MAJOR | **ACCEPTED** — §4 restated as UX-level building blocks; "reuse Doc-7B"; primitive composition → Stage-5 |
| B-M2 | Responsive behavior prescribed operational capability | MAJOR | **ACCEPTED** — §3 = intended responsive *experience*; capability posture stays in planning §2 / Stage-5 |
| B-m1 | §5 showed one dashboard layout | MINOR | **ACCEPTED** — two directions (triage-first / signal-first) |
| B-m2 | Approval criteria lacked planning-consistency | MINOR | **ACCEPTED** — added to §8 |
| B-m3 | Annotations lacked keyboard | MINOR | **ACCEPTED** — §6 adds keyboard + legend |
| B-m4 | "Honest Empty State" terminology | MINOR | **ACCEPTED** — used throughout |
| B-m5 | Folder + naming conventions undocumented | MINOR/NIT | **ACCEPTED** — §7 folder structure + naming + screenshot convention |
| B-m6 | Annotation examples / legend | MINOR/NIT | **ACCEPTED** — §6 interaction legend |
| B-m7 | Prototype review checklist | MINOR | **ACCEPTED** — §8 checklist |
| B-n1 | Revision history · reading time · shell diagram · flow examples | NIT | **ACCEPTED** — front-matter history + reading time; §2 shell sketch; §7 flows |
| B-n2 | Section dependency map | NIT | **DECLINED** — §0 already states the dependency; a map adds size to a short doc |

**Gate:** the brief remains gated behind Stage-2 Board approval and authorizes no build.

---

*End of Admin Console — Stage-3 Prototype Design Brief (v0.2-draft). Companion to
`admin_console_planning_and_design.md`. Gated behind Stage-2 Board approval; authorizes no build;
coins nothing (binds Doc-7B/7C); component/primitive composition → Stage-5. On any conflict with a
frozen document: Flag-and-Halt.*
