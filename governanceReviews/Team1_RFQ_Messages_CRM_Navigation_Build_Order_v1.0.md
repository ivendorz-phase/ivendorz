# Team-1 Build Order — RFQ / Messages / CRM Navigation

**Version:** v1.0 · **Date:** 2026-07-19
**Derived from:** `governanceReviews/Cluster_1_2_Governance_Closure_and_Team1_Handoff_v1.0.md`
(the authoritative closure record — read it FIRST; on any divergence between that record and this
order, the record wins, and the frozen corpus wins over both).
**Execution model:** this document is a self-contained implementation prompt for a Team-1 build
session (human or agent). It contains everything needed to execute without access to the
originating governance chat.

```text
AUTHORIZATION: Implementation of PHASE 1 is authorized upon explicit dispatch
               of this order by the owner. Drafting ≠ dispatch.
PHASE 2 (C1–C3): NOT authorized by this order under any circumstances —
               it executes only WITH the unified-inbox implementation,
               which requires its own separate authorization.
```

---

## 0. Read-first list (in order)

1. `governanceReviews/Cluster_1_2_Governance_Closure_and_Team1_Handoff_v1.0.md` — rulings, full
   F1–F7 / C1–C6, acceptance criteria, exclusions.
2. `CLAUDE.md` (root) — governance constitution; §11 working rules; Red-Flag checklist.
3. `.claude/CLAUDE.md` — **dev-server one-per-checkout policy** (binding; see §1 below).
4. `REPOSITORY_STRUCTURE.md` — before touching layout.
5. The touched surfaces (§3/§4 file lists) — read before editing; line refs below are
   **at-draft-time** and may drift.

## 1. Environment ground rules (binding)

- **One dev server per checkout.** `E:\Projects\iVendorz` already serves
  `http://localhost:3000`. NEVER start a second `next dev` here (a fresh port is NOT a fresh
  `.next` — it corrupts the shared build dir and 500s every route). Need isolation → git
  worktree.
- **Parallel-session tree.** The working tree carries uncommitted changes from other
  workstreams. Commit ONLY your own files **by explicit path** (never `git add -A` / `git add
  .`), and guard-check `git diff --cached --name-only` before every commit. Never push. Never
  commit gated/unauthorized surfaces.
- **Route verification** requires `IVENDORZ_DEMO_MODE=1` — without it ~90 authed pages 307 to
  /login and a sweep "passes" without rendering anything.
- **CI is the build oracle** — local Windows `tsc` is a proxy, never grounds for a GREEN claim.
- Design/motion: reuse kit primitives (`src/frontend/`, `@/frontend/*`) — re-implementing one is
  a review finding. Motion per `docs/frontend/design-system/motion_standard.md` (this order needs
  no new animation; do not add any).
- **VX-03 (owner directive):** vendor-console surfaces render wired reads or honest
  placeholder/empty — NEVER fixture/demo rows. Do not introduce any sample data.

## 2. Mission (Phase 1)

Two workstreams, one change-set:

- **WS-A — Leadboard merge (F1–F7):** fold the Leadboard board view into `/sell/rfqs` as an
  Inbox ⇄ Board view toggle; retire `/sell/leads` as a nav destination (board stays reachable);
  de-collide the "RFQ Leads"/"Leadboard" labels; repoint every inbound link; add a 308 redirect.
- **WS-B — Buyer Relationships rename (C4–C6):** user-facing rename of the Buyer CRM surface to
  **"Buyer Relationships"**; internal domain term stays **"Buyer CRM"**; provenance-tier rules
  recorded at documentation level only (nothing is wired to render them yet).

## 3. WS-A — Leadboard merge (F1–F7)

Touched surfaces (at draft time):

- `app/(app)/(workspace)/sell/rfqs/page.tsx` — gains the view toggle
- `app/(app)/(workspace)/sell/leads/page.tsx` — index retires
- `app/(app)/(workspace)/sell/leads/[leadId]/page.tsx` — detail route (see F3 resolution)
- `app/(app)/_components/vendor/leads/` — `LeadPipeline`, `LeadBoard` (~:36, :47),
  `LeadList` (~:44) — reused under the toggle
- `app/(app)/_components/vendor/rfq/` — `InvitationInbox` (byte-locked empty ~:92-100),
  `RfqInboxTable`, `RfqStatCards`, `QuotaMeter`, `InboxStateFilter`
- `app/(app)/_components/vendor/vendor-shell-vm.ts` (~:40-41 nav labels)
- `app/(app)/_components/shell/sidebar.tsx` (~:25-34 `isActive`)
- Inbound-link sites: `app/(app)/_components/vendor/documents/documents-hub-view.tsx` (~:528),
  `app/(app)/_components/vendor/dashboard/next-actions-card.tsx` (~:37, :59, :89),
  `app/(app)/(workspace)/sell/dashboard/page.tsx` (~:93)
- `next.config.*` — redirect infrastructure (new)

### Work items

**F1 (MAJOR — link repoint + redirect).**
- Sweep the WHOLE repo for `/sell/leads` references, including template forms
  (`${basePath}/leads`, `${BASE}/leads`) — a leading-slash grep misses the majority. Known sites
  listed above; the sweep is authoritative, the list is not (fix-forward sweeps the class).
- Repoint index-level links → `/sell/rfqs?view=board`; per-lead deep-links → the F3-resolved
  detail path.
- Add redirect infrastructure via `next.config` `redirects()`:
  `/sell/leads` → `/sell/rfqs?view=board`, `permanent: true` (308). Exact-path source only — it
  must NOT swallow `/sell/leads/[leadId]`.

**F2 (params + nav highlight).**
- New allowlisted param on `/sell/rfqs`: `?view=inbox|board` (default `inbox`; anything else ⇒
  default — the documents-hub allowlist convention). URL is the single source of truth; the
  toggle renders as plain `Link`s (navigation-not-state), matching the existing `?state=` chips.
- Precedence: `view=board` ⇒ `?state=` is ignored (quotation-state is meaningless on the board).
  `view=inbox`/absent ⇒ existing `?state=` behavior unchanged (sidebar "Make Offer"/"Saved
  Offers" and documents-hub "Offers" deep-links keep working).
- Sidebar: the `/sell/rfqs` nav item must highlight across its query variants (today a
  query-bearing URL deliberately fails to match a query-less href). Requirement: parent item
  highlights on pathname `/sell/rfqs` regardless of query; query-bearing child entries keep
  exact-match behavior. Choose the minimal mechanism that preserves both.

**F3 (detail route) — resolved default:** KEEP `/sell/leads/[leadId]` at its current path
(minimal churn; only the index destination retires). Update its breadcrumb: "Leadboard →
/sell/leads" becomes "Pipeline → /sell/rfqs?view=board". If implementation surfaces a conflict
with this default, STOP and escalate rather than improvising a re-home.

**F4 (label retirement).** Remove "Leadboard" and "RFQ Leads" from every user-facing register:
- nav: `RFQ Leads` → **"RFQs & Quotations"**; the separate `Leadboard` nav item is removed
- board tab label: **"Pipeline"**
- docs-hub link label, detail breadcrumb, "Open Leadboard" CTA, `metadata.title` /
  `PageHeader` titles on the retired index
- Sweep for stragglers by grepping the labels themselves, not just the enumerated sites.

**F5 (empty states).** The toggle DELEGATES: Inbox view renders `InvitationInbox`'s byte-locked
canonical empty (`[ESC-7B-EMPTY-LOCK]`); Board/List views render their own component-owned
empties. Coin NO new destination-level empty copy. Byte-identical means byte-identical.

**F6 (aggregates + quota).** When the board view mounts, NO lead-derived count/denominator may
enter the shared `RfqStatCards` band (ND-8 / Doc-7G GR11 — a lead aggregate leaks the
matched-but-excluded universe). The board keeps its non-numeric column links. `QuotaMeter`
(a quotation-submission entitlement, Inv #10 — numeric, never a plan name) renders in the INBOX
context only — it does not decorate the board view.

**F7 (companion patch).** Additive note in the vendor design companion
(`docs/product/requirements/vendor_planning_and_design.md` lane) recording the nav re-home
(PL-1's `(app)/leads` destination superseded by the `/sell/rfqs` view toggle). Additive only —
the companion is non-frozen but never silently contradicted.

## 4. WS-B — Buyer Relationships rename (C4–C6)

Touched surfaces: `app/(app)/(workspace)/sell/buyer-crm/page.tsx`,
`app/(app)/_components/vendor/buyer-crm/buyer-crm-view.tsx`,
`app/(app)/_components/vendor/vendor-shell-vm.ts` (~:47).

- **C4:** user-facing term → **"Buyer Relationships"** in: sidebar nav label, `metadata.title`,
  `PageHeader` title, description copy, disclosure banner, empty-state copy. The route path
  `/sell/buyer-crm` is NOT renamed (D4 listed the five user-facing registers; a path change was
  not ordered and would force churn for zero ruled benefit).
- **C5:** internal identifiers unchanged — `BuyerCrmView`, directory names, any analytics/code
  identifiers. Do NOT mint a `BuyerRelationship` domain concept, type, or entity — this is a
  presentation change only.
- **C6 (this phase = documentation level only):** update the view's governance header comment to
  cite the closure record (D2/D4): five approved seeding channels, the Provenance Ladder
  (`MANUAL_OR_IMPORTED < CONVERSATION < RFQ_PARTICIPATION < ENGAGEMENT < AWARDED_CUSTOMER`,
  tokens indicative until the Doc-4F patch), Provenance ≠ Stage, and the privacy floor. Render
  NOTHING new — no tier UI, no vocabulary in visible copy beyond the ruled labels, tiles stay
  "—" (VX-03). The surface remains unwired and non-implementable beyond this rename.

## 5. Phase 2 — explicitly OUT of this order

C1 (retire `/sell/inquiries` workspace), C2 (308 → `/sell/messages?context=general_inquiry`),
C3 (Messages chips `All · Unread · Inquiries · RFQs · Engagements`). These execute only WITH the
unified-inbox implementation (D4 interim rule) under separate authorization. Until then
`/sell/inquiries` keeps its Concept-Pending shell exactly as-is: no APIs, persistence,
permissions, counters, or domain logic. Also excluded: all M6/M4 wiring, contracts, schemas,
events, POLICY keys, entitlement design (closure record §4.4).

## 6. Acceptance criteria (Phase 1)

1. `/sell/rfqs` hosts the Inbox ⇄ Board toggle; `?view=` allowlisted with `view=board` ⇒
   `?state=` ignored; existing `?state=` deep-links unaffected on the inbox view.
2. Sidebar highlights `/sell/rfqs` across query variants; query-bearing child entries still
   exact-match.
3. Repo-wide grep (covering template-literal forms) finds ZERO remaining links to `/sell/leads`
   as a destination other than the redirect itself and the kept detail route; the 308 redirect
   works; `/sell/leads/[leadId]` still renders with the corrected breadcrumb.
4. Greps for "Leadboard" and "RFQ Leads" find zero user-facing occurrences.
5. Canonical empty states byte-identical to their component owners; no new empty copy.
6. No lead-derived aggregate in the shared stat band; QuotaMeter inbox-scoped.
7. "Buyer Relationships" renders in all five user-facing registers; route path and internal
   identifiers unchanged; no new domain type.
8. Companion additive patch present (F7).
9. `tsc` clean; prettier clean; route sweep under `IVENDORZ_DEMO_MODE=1` renders `/sell/rfqs`
   (both views), `/sell/leads/[leadId]`, `/sell/buyer-crm`, `/sell/dashboard`,
   `/sell/documents`; redirect verified. CI green before any merge claim.

## 7. Verification & delivery protocol

1. Self-check: run `/fe-checklist` before committing.
2. Commits: per-workstream checkpoint commits by EXPLICIT PATH (WS-A and WS-B separable);
   conventional messages; never push.
3. Review pipeline: Dev → Review-A (Team-4) → Review-B (Team-5) → Board. Reviews verify against
   the closure record's F/C specs; the §13 gate (BLOCKER=MAJOR=MINOR=0) applies.
4. **Escalation (Flag-and-Halt):** any apparent conflict with a frozen document, any Red-Flag
   checklist hit, any byte-locked-empty collision, or any surprise contradicting this order →
   STOP, cite both sources, escalate. Never resolve locally, never improvise scope.

```text
ORDER STATUS: ROUTABLE — awaiting explicit owner dispatch
SCOPE: PHASE 1 ONLY (WS-A: F1–F7 · WS-B: C4–C6-doc)
```
