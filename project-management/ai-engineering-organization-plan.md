# AI Engineering Organization — iVendorz

**Status: v1.0 — RATIFIED EXECUTION GOVERNANCE (owner/Board, 2026-07-08).**
**Non-authoritative under the frozen corpus** — it governs *execution* (who works, how roles
activate, how work flows) and never architecture. Supersedes PROPOSAL v0.3/v0.2/v0.1 (same file,
2026-07-08). It coins no architecture, changes no module ownership, and introduces no business
capability. It conforms upward: on any conflict the frozen corpus wins (CLAUDE.md §7, §11) and this
file is patched to match. **Changes from here forward are additive amendments + version bump only**
(the governance-companion convention) — never in-place edits of ratified content.

> **Ratification record.** Proposed by Claude per CLAUDE.md §8; reviewed (round R1, Appendix B);
> **ratified by the human owner 2026-07-08** ("APPROVED FOR RATIFICATION"). Decision record:
> `governanceReviews/BOARD-DECISION-AI-ENG-ORG_v1.0.md`. This ratification covers Appendix A
> items 1–7 (structure, Module-Agent model, runtime model, concurrency ceiling, model routing,
> packet limits, Performance-lens fold into Team-5); the commissioning work in Appendix A item 5
> (templates + Security charter) is dispatched as follow-up work items, not blocked on.

**What changed from v0.1:** the owner's revised brief fixed the team structure at **9 Core Teams**
whose numbering **matches the live FE-PM numbers exactly** (Team-1/2/3 = FE lanes, Team-4 =
Review-A, Team-5 = Review-B/QA) — so v0.1's §0.1 numbering Flag-and-Halt is **resolved by the brief
itself**; no renumber, no charter churn. Backend is now **one team (Team-7)** containing **10
specialized Module Agents (M0–M9)** instead of independent lanes; Integration folds into Team-7
(wiring is contract consumption, wave-gated); the Performance gate folds into Team-5 QA (bundle/
query lens) with Doc-8 still owning budgets. v0.2 adds the **runtime activation model** and the
**API / token / context efficiency strategy**, which are now first-class design goals.

**What changed from v0.2 (review round R1, all findings owner-directed for integration):** the
long-lived coordination role is unified and renamed — there is exactly **one** persistent AI
session, the **AI Engineering Orchestrator** (MINOR-01 + NIT-01); activation packets get
**measurable size limits** (MINOR-02); **context destruction** on completion is now an explicit
rule (MINOR-03); a **cost-aware model-routing policy** is added (MINOR-04); a **P0–P3 dispatch
priority model** is added (MINOR-05); plus an activation sequence diagram, a lifecycle summary
table, and a boxed cost-principles summary (NIT-02/03/04). Dispositions recorded in Appendix B.

---

## 0. Grounding — what is already frozen, what this plan adds

**Already frozen / live (referenced, never restated, never re-decided):**

- Authority Order (CLAUDE.md §7) · AI Agent Rules (§8) · Review & Findings Governance (§13:
  severity ladder, merge gate **BLOCKER = MAJOR = MINOR = 0**, Raise ≠ Accept, Validate-Findings
  gate) · 10 Golden Rules · 12 Invariants · Red-Flag Checklist.
- The **10 bounded modules** and their single owners (CLAUDE.md §3); **`contracts/`-only**
  cross-module surface; no cross-module DB access / FK / imports.
- The **wave roadmap** (`generatedDocs/Build_Roadmap_v1.0.md`) — backend sequence is wave-gated
  (current: **Wave 2 = M0 → M1**); Definition of Ready/Done and Wave Integration/Exit audits are
  owned there.
- The **FE Program-Management office** (`review-process.md`): pull-based work, twice-reviewed
  (Review-A → Review-B), Board-approved, WP cards, RV-#### ledger, lanes G/L, derivation priority
  chain, stable-target rule, checkpoint-commit boundaries.
- Repo layout & boundaries (`REPOSITORY_STRUCTURE.md`, Structural Constitution v1.1);
  `generated-contracts-registry/` is generated + gitignored, never hand-edited.

**What this plan adds (execution layer only):**

1. The **9-Core-Team organization** and its hierarchy (§1–2).
2. The **Backend Module Agent model** — 10 specialized roles inside Team-7 (§3).
3. The **runtime activation lifecycle** — teams and agents are *logical roles*, not permanent
   sessions; inactive roles consume **zero** API resources (§4).
4. The **backend orchestration workflow** under a long-lived Backend Lead (§5).
5. The **API / token / context efficiency strategy** — a primary design constraint, not an
   afterthought (§6–8).
6. **Activation rules, concurrency ceilings, and worked scenarios** (§9–11).

**Design premise.** API quotas are limited. The organization never assumes unlimited concurrent
agents. Every role is dormant by default; activation is deliberate, scoped, and briefed with the
minimum context that lets the role do its job correctly. The frozen architecture is what makes this
cheap: because module boundaries, contracts, and review gates are already decided, an activated
agent needs a *pointer packet*, not a corpus download.

> **API cost design principles (the whole strategy in five lines):**
> **Activate late** · **Deactivate early** · **Read minimally** ·
> **Reuse repository state** · **Never keep idle sessions alive.**
> Every rule in §4–§10 is an application of one of these five.

---

## 1. Organization hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│  HUMAN OWNER (holds every approval pen, §7/§8)                       │
│  + ARCHITECTURE BOARD (owner decides · Claude prepares packets)      │
│  Ranks 0–1 immutable · architecture is supreme                       │
└─────────────────────────────────────────────────────────────────────┘
                     │ approves · mints IDs · rules dispositions
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AI ENGINEERING ORCHESTRATOR  (the ONLY long-lived AI session)       │
│  ("Program Manager" in the live FE-PM docs — same role, one session) │
│  tracker + dispatcher — NO approval power                            │
│  owns: execution-board · WBS · queues · priorities · activations     │
│  wears the BACKEND-LEAD hat when coordinating Team-7 (§2, §5)        │
└─────────────────────────────────────────────────────────────────────┘
        │ activates roles on demand (pull-based, minimal packet)
        │
        ├── BUILD TEAMS (author code; one active item per team)
        │     Team-1  Frontend – Public          (live FE lane 1)
        │     Team-2  Frontend – Buyer           (live FE lane 2)
        │     Team-3  Frontend – Vendor/Admin    (live FE lane 3)
        │     Team-7  Backend Development
        │              └─ BACKEND LEAD (coordinator role)
        │                  ├─ Agent M0  Platform Core        ├─ Agent M5  Trust & Verification
        │                  ├─ Agent M1  Identity & Org       ├─ Agent M6  Communication
        │                  ├─ Agent M2  Marketplace          ├─ Agent M7  Monetization
        │                  ├─ Agent M3  RFQ Engine           ├─ Agent M8  Admin
        │                  └─ Agent M4  Business Operations  └─ Agent M9  AI Layer
        │
        ├── REVIEW TEAMS (raise findings; never author production code)
        │     Team-4  Architecture & Code Review   (Review-A — reviews first)
        │     Team-5  QA & Functional Review       (Review-B — same SHA, after A)
        │     Team-6  Security Review              (mandatory gate on security surface)
        │
        └── ENABLING TEAMS (own their surface; consumers of everyone's output)
              Team-8  Documentation & AI Support
              Team-9  DevOps / Release
```

**Reading the chart.** Every box below the Orchestrator is a **logical role, not a session**
(§4). Build teams author code. Review teams raise findings and never author; the Board rules
dispositions (Raise ≠ Accept). Enabling teams own their own surfaces. The Board (human owner) is
the only approval authority; the Orchestrator tracks, dispatches, and activates, but **cannot
approve anything**.

**Single-coordinator rule (binding).** The **AI Engineering Orchestrator is the only long-lived AI
session** in the entire organization. When coordinating backend work it **temporarily assumes the
Backend Lead role** — the Backend Lead is a hat, never a second persistent context. Any design,
prompt, or workflow that would stand up a second permanent session is a violation of this plan, not
an implementation detail. Inside Team-7, the Backend-Lead hat is the only authority that activates
Module Agents; Module Agents never self-activate and never activate each other.

**Numbering is now consistent with the live FE-PM ledger** (frozen at the 2026-07-02 cutover):
Team-1/2/3 remain the FE build lanes, Team-4 remains Review-A, Team-5 remains Review-B. Teams
6/7/8/9 are new numbers with no prior binding. No renumber is required.

---

## 2. Core Team responsibilities

Each team states **Owns · Never · Inputs · Outputs · Active when**. "Never" items are hard stops —
a violation is a Review-A **BLOCKER** (Flag-and-Halt), not a negotiation.

### Team-1 — Frontend: Public (anonymous & marketing surfaces)
- **Owns:** `app/(public)/` surfaces — landing, discovery, category browse, public vendor
  microsites (P-PUB-*), mega-menu/navigation, SEO surfaces (ADR-025 URL law) · Doc-7 kit
  conformance (extend, never duplicate) · WCAG-AA on its pages.
- **Never:** invent a route or API · render data a public contract doesn't expose · disclose any
  private/firewalled signal (Trust display per the Board's display ruling; Performance band-only) ·
  modify the frozen kit foundation · author backend code.
- **Inputs:** WP card · `page_inventory.md` P-IDs · frozen Doc-7 design system · public contracts
  from `generated-contracts-registry/` (consume only).
- **Outputs:** presentation pages (wiring wave-gated) · checkpoint commits · changelog lines.
- **Active when:** a public-surface work item is dispatched. Otherwise dormant.

### Team-2 — Frontend: Buyer (authenticated buyer workspace)
- **Owns:** buyer workspace surfaces (P-BUY-*) — RFQ authoring/comparison UX, Compare Workspace +
  Comparative Statement rendering, buyer vendor directory, buyer document views (LOI/PO/…),
  buyer-private CRM presentation.
- **Never:** leak buyer-private CRM state to any shared surface (Inv #11 — blacklist undetectable) ·
  render a money-settlement affordance (platform never handles transaction money) · invent
  document kinds or states (frozen kinds only) · author backend code.
- **Inputs / Outputs / Active when:** as Team-1, scoped to buyer surfaces.

### Team-3 — Frontend: Vendor/Admin (vendor workspace + admin console)
- **Owns:** vendor workspace surfaces (P-VEN-*, `/workspace`) — company, microsite editor, catalog,
  RFQ/quotation, leads/pipeline, engagements · admin console surfaces (P-ADM-01…29, presentation
  elevation per the Stage-5 plan; wiring = Wave 5).
- **Never:** cross the vendor-private/platform-signal firewall (won/lost stays private) · give
  Admin a rendered path that bypasses an owning module's domain (Red-Flag) · invent moderation
  states or admin capabilities beyond the Board-approved 29-surface universe.
- **Inputs / Outputs / Active when:** as Team-1, scoped to vendor + admin surfaces.

### Team-4 — Architecture & Code Review (Review-A; reviews FIRST)
- **Owns (review only):** architecture & ADR compliance · module-boundary and `contracts/`-only
  enforcement · DDD layer rules (domain owns truth; application owns no state; read-models never
  source-of-truth) · contract grounding / no-invention (routes, slugs, events, audit actions,
  enums) · firewall & non-disclosure lens · scope-vs-WP-card · kit-primitive duplication check ·
  maintainability/complexity.
- **Never:** author production code · rule on its own findings (Raise ≠ Accept) · review a churning
  tree (stable checkpoint SHA only) · share context with the builder or another reviewer.
- **Inputs:** named checkpoint SHA · WP card (scope + out-of-scope) · pointer list into the frozen
  corpus for the touched module(s) only.
- **Outputs:** `PASS | REVISION | BLOCKER` + numbered, severity-laddered findings under a new
  RV-#### in `review-log.md`, with a disposition *proposal* (the Board rules).
- **Active when:** a builder freezes a checkpoint and hands off. One review = one activation.

### Team-5 — QA & Functional Review (Review-B; same SHA, opens only after an A pass-class)
- **Owns (review only):** business-rule & acceptance-criteria conformance · edge cases · regression
  risk (byte-equivalence on untouched surfaces) · UI/UX consistency, responsive D/T/M,
  accessibility · render verification + screenshots · type/lint/format · dead code & duplication
  (quality lens) · **performance lens**: bundle/code-split verification via the isolated prod-build
  harness (RV-0126 precedent), N+1/query smoke on backend items — measured against **Doc-8 budgets
  only, never an invented budget**.
- **Never:** implement features · open before an A pass-class verdict · drop a governance defect it
  spots (route it back to Team-4, never dispose of it) · review a different SHA than A reviewed.
- **Inputs:** the **same** checkpoint SHA Team-4 reviewed · acceptance criteria from the WP card.
- **Outputs:** `PASS | ISSUES | REGRESSION` + findings appended to the same RV-####.
- **Active when:** Team-4 returns a pass-class verdict. One review = one activation.

### Team-6 — Security Review (mandatory gate on security surface)
- **Owns (review only):** authentication · authorization (app-layer authz is the model; **RLS =
  defense-in-depth backstop**, Doc-2) · role dimensions (Inv #2) · **multi-tenant isolation** (org
  boundary, Inv #5 — server-validated active-org context, client org ID never trusted) · input
  validation · secrets handling · OWASP Top-10 · dependency vulnerabilities · privacy &
  non-disclosure (Inv #11) · governance-signal firewall integrity (Inv #6).
- **Never:** implement features · waive a multi-tenant/authz finding (only the Board rules
  dispositions).
- **Trigger (blocking):** any change touching auth, authz, roles, org context, RLS, private data,
  external input, secrets, or a firewalled signal. No security surface in scope → the
  *Orchestrator* records "N/A — no security surface" on the WP card and **Team-6 is never activated**
  (an unfired gate must cost zero tokens).
- **Inputs:** checkpoint SHA · the `/ivendorz-security` checklist · pointers to Doc-2/4B/4C
  security model sections.
- **Outputs:** `PASS | ISSUES | BLOCKER`; a tenant-isolation leak or authz bypass is an automatic
  BLOCKER.
- **Active when:** the trigger fires. One review = one activation.

### Team-7 — Backend Development (Backend Lead + 10 Module Agents)
- **Owns:** all backend implementation across `src/modules/`, `prisma/`, `inngest/` — through its
  Module Agents (§3), coordinated exclusively by the **Backend Lead** · FE↔BE **wiring**
  (contract consumption, session/org-context plumbing) once a wave un-gates it — wiring is
  performed by the *owning module's* agent for its API surface plus the relevant FE team for the
  client side; a needed contract change always routes to the owning module under Doc-4A governance,
  never patched at the wiring layer.
- **Never:** open a module the wave roadmap has not opened (Wave 2 = M0 → M1) · any Red-Flag item ·
  hand-edit `generated-contracts-registry/` · invent an audit action, event, or contract.
- **Backend Lead role (coordinator, not a builder):** decomposes tasks to owner modules · sequences
  cross-module work along contract/event seams · activates exactly one Module Agent per task
  (parallel only under §10) · validates the returned completion report against the WP card ·
  hands checkpoints to Review · maintains the module trackers. The Backend Lead is a *hat worn by
  the AI Engineering Orchestrator* for backend work — never a second permanent session (§1
  single-coordinator rule).
- **Active when:** a backend work item is dispatched; individual Module Agents activate per §4–5.

### Team-8 — Documentation & AI Support
- **Owns:** LIVING docs under `docs/` · append-only changelog · API documentation **derived from**
  module contracts + Doc-4A · developer guides · `IMPLEMENTATION_START_HERE.md` upkeep (never
  overwritten without owner sign-off) · **AI support surface**: role charters, standing prompts
  (§8), skill definitions (`.claude/skills/`), and **activation-packet templates** — keeping every
  agent briefing current, minimal, and pointer-based so activation cost stays low.
- **Never:** edit a FROZEN document · author/alter ADRs (immutable, §7 rank 1) · restate program
  status outside its SSoT (`00_AUTHORITY_MAP.md` + `Program_Status_And_Roadmap.md`) · coin
  architecture in a guide.
- **Inputs:** merged code · module contracts · RV ledger · Board decisions.
- **Outputs:** updated living docs, API reference, changelog entries, refreshed prompts/packets.
- **Active when:** documentation or prompt/skill maintenance is needed — async, never merge-blocking,
  but required before a wave Exit-Gate.

### Team-9 — DevOps / Release
- **Owns:** CI/CD (Vercel) · preview environments · build verification (incl. the isolated
  prod-build harness for bundle changes) · **migration execution ordering** (serialized here even
  when schemas are disjoint) · release preparation & wave tagging · `repo.manifest.json` /
  structure-check gates.
- **Never:** merge past a red gate · change architecture or config policy (M8 *owns* config policy;
  DevOps *operates* it) · bypass hooks/signing without explicit owner request.
- **Inputs:** green PRs · wave Exit-Gate audits · `Build_Roadmap_v1.0.md` sequence.
- **Outputs:** green pipelines · preview URLs · wave-complete tags to `main` · release notes (with
  Team-8).
- **Active when:** a deployment, migration batch, or wave promotion is due.

---

## 3. Backend Module Agents (Team-7)

**What a Module Agent is.** A specialized engineering *role* — a job description plus a standing
charter — **not** an independent permanent AI session. It exists as text (a charter + an
activation-packet template) until the Backend Lead activates it as a fresh, stateless agent context
for exactly one task. It has no memory between activations; everything durable it produced lives in
the repo (code, contracts, tests, tracker lines, completion reports).

**Shared charter (binding on all ten — stated once, never repeated per agent):**

- **Owns, for its single module only:** `contracts/` (services/events/types — the ONLY cross-module
  surface) · `domain/` (aggregates, entities, value objects, policies, state machines) ·
  `application/` (commands, queries, workflows — orchestration, owns NO state) · `infrastructure/`
  (data, read-models, events, search) · `api/` (route handlers / server actions) · that module's
  Prisma schema · that module's Inngest consumers.
- **Never:** touch another module's tables/schema (incl. cross-schema raw SQL) · add a cross-module
  FK · import anything but another module's `contracts/` · modify architecture or an ADR · create a
  module or change ownership · let a workflow own state or a read-model become source of truth ·
  invent an audit action, event slug, or governance signal · hand-edit the generated registry ·
  self-activate or activate a sibling agent.
- **Always:** reuse the canonical audited-write pattern
  (`governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md`) for every audited write · emit
  events per the authoritative catalog by pointer (or record "zero events" where that is the frozen
  truth, e.g. M0/M1) · test on real Postgres · run `/ivendorz-security` self-check before handing
  off · Flag-and-Halt on any corpus conflict.
- **Standard inputs (the activation packet, §8):** the task · the WP card scope · pointers to its
  own contract doc (Doc-4B…4M) + Doc-4A metastandard + the specific Doc-2/4M/4J/4L sections in
  scope · the exact files/contracts it must read. Nothing else.
- **Standard outputs (the completion report, §8):** what was built · files touched · contracts
  added/changed (or "none") · events emitted (or "zero") · migrations (or "none") · test results ·
  open questions/ESC handles · a checkpoint SHA.

**Per-agent specialization** (schema · authority doc · distinct responsibilities and hazards):

| Agent | Module · Schema · Doc | Specialized responsibility | Module-specific hard lines |
|---|---|---|---|
| **M0** | Platform Core / Shared Kernel · `core` · Doc-4B | Audit log, **transactional outbox**, ID generation (UUIDv7 + year-scoped human refs), config, feature-flag *infrastructure* | Infra-only — **no business domain layer**; every other module depends on it, so its contracts freeze early; outbox write model per Doc-2/4B, never reinvented |
| **M1** | Identity & Organization · `identity` · Doc-4C | Users, orgs, memberships, roles, permissions, delegation; **server-validated active-org context** primitives; `check_permission` app-layer authz | Inv #5 is its product — org context is server-derived, never client-trusted; two role dimensions never conflated (Inv #2); notification *prefs* live here (owner ruling) |
| **M2** | Marketplace & Discovery · `marketplace` · Doc-4D | Vendor profiles, microsites, products, projects, categories, ads, favorites, presentation; claim lifecycle + visibility scope (Inv #3) | **Reads** trust scores, never calculates (M5 owns); Content ≠ Presentation (Inv #9); public URLs per ADR-025; consumes vendor-ban reflection as an *event consumer*, never as M8's arm |
| **M3** | RFQ Procurement Engine · `rfq` · Doc-4E | RFQs, routing, matching, sorting, invitations, quotations, comparison — **the moat** | RFQ is a state machine with a control plane (Inv #4) — states by pointer from Doc-4M, never paraphrased; no single signal dominates a matching decision (Inv #6); capability matrix, never labels (Inv #1) |
| **M4** | Business Operations · `operations` · Doc-4F | Post-award docs (LOI/PO/challan/invoice/payment/WCC), finance records, **buyer-private Vendor CRM** | CRM status is private to one buyer and **never mutates platform-wide scores** (Inv #11 — blacklist undetectable); document kinds/states frozen-only; **never** settlement/escrow/wallet (money boundary) |
| **M5** | Trust & Verification · `trust` · Doc-4G | Trust score, performance score, financial tier, verification records, fraud signals; review-system trust lane (submit/moderate/publish/remove) | The **firewall lives here** (Inv #6): five signals never cross-contaminate; scores auto-calculated under the System actor, **never hand-edited**; Admin decides verification, Trust owns the record |
| **M6** | Communication · `communication` · Doc-4H | Chat, RFQ threads, notifications, email/SMS/WhatsApp delivery logs | **Delivery only** — owns no business state and makes no business decisions; consumes outbox events; notification preferences are M1's, not its |
| **M7** | Monetization · `billing` · Doc-4I | Plans, subscriptions, **entitlements** (boolean/numeric/enum), quotas, lead credits, platform invoices | Entitlement checks only — **never plan-name checks** (Inv #10: Financial Tier ≠ Subscription Plan); subscription can never boost matching rank; platform's own revenue only |
| **M8** | Admin Operations · `admin` · Doc-4J | Moderation, bans, category/vendor approval workflows, import, config policy; the authoritative event catalog is its doc | Admin **decides and emits** — it never bypasses an owning module's domain (Red-Flag); vendor moderation ≠ vendor approval (Board ruling E5); effects land in owner modules via events |
| **M9** | AI Layer (reserved) · `ai` · Doc-4K | Regenerable derived artifacts only — matching suggestions, enrichment, drafts | "AI suggests; modules decide" (Inv #12) — owns **no authoritative data**; `domain/` only for regenerable derived-artifact models; dormant until its wave |

**Wave gate.** Only agents whose module the roadmap has opened may be activated for build work
(current: **M0 and M1**). The rest exist as charters and may be activated **read-only** for
contract-consultation questions only if the Backend Lead cannot answer by pointer — which should be
rare, because contracts are documents, not conversations.

---

## 4. Runtime activation lifecycle

Every Team and Module Agent is a **logical role**. A role has four runtime states:

```
                 activate (dispatch + packet)
   DORMANT ────────────────────────────────────► ACTIVE
   (charter only —              ▲                (one fresh agent context,
    zero API cost)              │                 one task, minimal packet)
      ▲                         │ reactivate           │
      │                         │ (new context +       │ suspend
      │ complete                │  handoff note —      ▼ (blocker / gate /
      │ (completion report      │  NOT a resumed    SUSPENDED
      │  → repo, context        │  conversation)    (handoff note written to
      │  discarded)             └────────────────── repo; context discarded;
      └───────────────────────────────────────────  zero API cost while parked)
```

- **DORMANT** — the default state of every role. Nothing exists but the charter text and the
  activation-packet template. **Zero tokens, zero API calls.**
- **ACTIVE** — the Orchestrator (wearing the Backend-Lead hat for Module Agents) spawns a **fresh agent
  context** with the activation packet. The role reads only the files the packet names, does the
  work, and produces its standard output. One activation = one task = one context.
- **SUSPENDED** — the role hits a hard gate (⛔ ESC handle, missing dependency, Flag-and-Halt,
  owner decision pending). It writes a **handoff note** (state of work, checkpoint SHA, exactly
  what it is blocked on, exactly what it needs to resume) to the repo tracker, then its context is
  discarded. A suspended role costs nothing while parked.
- **REACTIVATION** — a *new* fresh context receives the original packet **plus the handoff note**.
  It never resumes an old conversation; the repo is the memory, not the transcript.
- **COMPLETION** — the role returns its completion report; the coordinator validates it against the
  WP card, records it in the tracker, and the context is discarded. The role returns to DORMANT.

**Context-destruction rule (binding, MINOR-03).** Upon completion or suspension, the agent context
is **destroyed — never reused, never resumed, never held warm.** All future work on the same role,
item, or finding starts from a **new activation packet** (plus the handoff note, where one exists).
A "previous conversation" is not an addressable resource in this organization; only the repository
is. This is what *guarantees* stateless execution rather than merely recommending it.

**Lifecycle summary (NIT-03):**

| State | What exists | API cost | Entered by | Exited by |
|---|---|---|---|---|
| **Dormant** | Charter + packet template (text in repo) | Zero | Completion / suspension / default | Activation (dispatch + packet) |
| **Active** | One fresh agent context, one task | The activation | Coordinator dispatch | Completion or suspension |
| **Suspended** | Handoff note in the tracker; **no context** | Zero while parked | Hard blocker (ESC, gate, owner ruling) | Reactivation (new context: packet + note) |
| **Reactivated** | A *new* Active context with the delta briefed | One new activation | Blocker cleared | Completion or re-suspension |
| **Completed** | Completion report + checkpoint SHA in repo; context destroyed | Zero | Report validated by coordinator | — (role is Dormant again) |

**Activation sequence (NIT-02) — one work item end-to-end:**

```
Owner/queue    Orchestrator          Worker role            Review roles         Repo
    │               │                     │                      │                 │
    │ work item     │                     │                      │                 │
    ├──────────────►│ ② owner module?     │                      │                 │
    │               │ ③ gates? ④ packet   │                      │                 │
    │               ├──── activate ──────►│ (fresh context)      │                 │
    │               │                     │ read ONLY packet files ────────────────┤
    │               │                     │ build · test · self-check              │
    │               │                     │ checkpoint commit ─────────────────────►
    │               │◄── completion report┤ (context DESTROYED)  │                 │
    │               │ ⑧ validate vs WP    │                      │                 │
    │               ├──── activate A ────────────────────────────►│ T4 on SHA      │
    │               │◄── PASS + RV ───────────────────────────────┤ (destroyed)    │
    │               ├──── activate B (same SHA) ─────────────────►│ T5 (+T6 if     │
    │               │◄── PASS ────────────────────────────────────┤  triggered)    │
    │               │ B/M/M=0 → close-commit ────────────────────────────────────►│
    │◄── (only if   │ pull next item…     │                      │                 │
    │  BLOCKER/F&H) │                     │                      │                 │
```

**Invariant:** state lives in the **repository** (trackers, WP cards, RV ledger, handoff notes,
checkpoint SHAs), never in a conversation. Any role can be killed at any moment and reconstructed
from the repo at the cost of one packet. This is what makes suspension free and reactivation cheap.

---

## 5. Backend orchestration workflow

The Backend Lead coordinates **all** backend work. Module Agents never self-activate, never
activate each other, and never talk to each other — cross-module needs are met **by contract or
event, resolved through the Lead**.

```
① RECEIVE task (from execution-board / owner)
        │
② DETERMINE owner module  — CLAUDE.md §3 ownership table; exactly one owner
        │                    (spans two modules? → split at the contract/event seam
        │                     into sequential single-owner tasks; never one agent
        │                     touching two modules)
③ CHECK gates             — wave open? ESC handle clear? WP card exists?
        │                    security/perf surface flagged for later gates?
④ ASSEMBLE packet         — task + scope + doc pointers + exact file list (§8)
        │
⑤ ACTIVATE one Module Agent (fresh context)
        │
⑥ AGENT implements        — owner module only · checkpoint commits ·
        │                    tests on real Postgres · self-runs /ivendorz-security
⑦ AGENT returns completion report + checkpoint SHA → context discarded (DORMANT)
        │
⑧ LEAD validates report against WP card
        │     └─ gap/defect in scope → reactivate (new context + handoff note)
⑨ LEAD hands checkpoint SHA to the review chain
        │     Team-4 (A) → Team-5 (B) → Team-6 (if security surface)
        │     any finding → 🟠 → reactivate owning agent to fix in scope → re-enter at A
⑩ ALL gates PASS (B/M/M = 0) → milestone-close commit → next queued task
        │     BLOCKER / Flag-and-Halt / architecture-affecting → 🟣 Board, owner rules
```

**Cross-module sequencing rule.** When a feature needs M3 to emit an event M6 consumes, that is
**two tasks**: (1) M3 agent implements the emit against the catalog pointer; (2) after M3's
contract/event is frozen and reviewed, M6 agent implements the consumer against that contract. The
frozen contract is the synchronization point — never a shared session, never a shared table.

**Single-active default.** Normally **one** Module Agent is active. The Lead may run two in
parallel **only** when the tasks are completely independent — different modules, disjoint file
trees, disjoint schemas, no contract dependency in either direction, and both waves open — and each
runs in its **own git worktree** (§10).

**Dispatch priority (MINOR-05).** When multiple items are waiting, the Orchestrator dispatches by
**business priority, never plain FIFO**. Every queued item carries a priority on its WP card
(assigned at minting; the owner may re-prioritize at any time):

| Priority | Meaning | Examples |
|---|---|---|
| **P0 — Critical** | Stops the line; dispatched before anything else | Security BLOCKER fix · broken wave branch / red CI · owner-ruled Flag-and-Halt resolution |
| **P1 — High** | Unblocks other work or a gate | A frozen-contract dependency another lane waits on · a review whose checkpoint is holding a lane |
| **P2 — Normal** | The default for planned wave work | Ordinary module/lane work items |
| **P3 — Low** | Fill-in; only when nothing higher is unblocked | Cleanup, NIT batches, doc polish |

Rules: the Orchestrator always dispatches the **highest-priority unblocked** item; a blocked P0/P1
never holds the queue (suspend it per §4 and take the next unblocked item — priority governs *order*,
not *waiting*); ties within a priority resolve FIFO; re-reviews inherit the priority of the item
they gate. Priority never overrides a gate — a P0 still clears the same review chain.

---

## 6. API optimization strategy

Goal: minimum number of API calls/sessions for a given unit of shipped, reviewed work.

1. **Zero-cost dormancy.** Roles are text until activated. The org chart never implies running
   sessions; 21 roles (9 teams + Lead hat + 10 agents + Orchestrator) normally means **one or two
   live contexts**.
2. **One long-lived coordinator, everything else ephemeral.** The Orchestrator session (wearing
   the Backend-Lead hat for backend work) is the only durable context. Every other role is a
   spawn-work-report-die agent. This caps standing API burn at exactly one conversation.
3. **Activation is pull-based and batched.** A role activates for a *work item*, not a
   micro-question. Questions that a document answers are answered by **pointing at the document**
   in the next packet, not by activating an agent to ask.
4. **Gates that don't fire cost nothing.** Security review activates only when the trigger fires;
   "N/A — no security surface" is recorded by the Orchestrator on the WP card without activating Team-6.
   Same for the perf lens and Docs.
5. **No polling, no heartbeat agents.** Suspended work is parked in the repo, not kept warm.
   Reviews are event-driven (a frozen checkpoint SHA triggers them), never scheduled loops.
6. **Sequential by default, parallel by exception.** Parallelism multiplies concurrent API usage;
   it is spent only where module boundaries make it conflict-free *and* the queue genuinely has
   independent items (§10). Never parallelize to "feel fast."
7. **Reviews are single-activation.** One reviewer context per gate per checkpoint. The unified
   re-review after fixes is a *new* single activation, not a standing reviewer conversation.
8. **Self-checks before handoff.** Builders run the relevant skill gates (`/fe-checklist`,
   `/ivendorz-security`) inside their own activation, so trivially detectable defects never cost a
   full review round-trip.
9. **Provider-agnostic.** Nothing above assumes a Claude-only feature: charters, packets, handoff
   notes, and completion reports are plain repo text, so the same organization runs on Claude,
   OpenAI, Gemini, or a mix.
10. **Cost-aware model routing (MINOR-04).** Work is routed to the cheapest model class that meets
    its reasoning requirement — the role, not the whole org, picks the model:

    | Work type | Model class | Rationale |
    |---|---|---|
    | Docs/changelog updates, template refresh, tracker upkeep (Team-8 mechanical) | **Lightweight** | Deterministic transformation of existing text |
    | Refactoring, test scaffolding, mechanical migrations, screenshot/render verification | **Medium** | Bounded, pattern-following work |
    | Module implementation (M0–M9), FE feature build, wiring, Team-5 functional review | **Advanced** | Domain reasoning inside hard constraints |
    | Team-4 Review-A, Team-6 Security, Board-packet drafting, cross-module decomposition | **Highest capability** | Adversarial/architectural judgment — a missed finding costs more than the tokens saved |

    Routing rules: **never route a governance-gating review below the highest class** (a cheap
    reviewer that passes a defect is the most expensive model in the org) · when unsure of the
    class, route **up** one · the coordinator stays on a highest-class model (its decomposition
    errors multiply downstream) · the packet/report templates are model-neutral, so routing is a
    per-activation dispatch choice, not a rewrite.

## 7. Token optimization strategy

Goal: minimum tokens per activation.

1. **Pointer packets, never corpus dumps.** An activation packet cites documents by path + section
   (reference-never-restate, CLAUDE.md §11). The agent reads the two or three sections it needs;
   it never receives — or loads — the whole frozen corpus. The corpus is *addressable*, which is
   precisely why it doesn't need to be *in context*.
2. **Read only required files; never scan the repository.** The packet names the exact files and
   contracts in scope. Discovery ("which files matter?") is the coordinator's job, done once,
   not re-done by every agent. Targeted reads (specific line ranges, greps) over whole-file loads.
3. **Never reload known architecture.** The shared charter (§3) encodes the standing rules once;
   a Module Agent is *briefed* that the rules bind it and *pointed* at them — it re-reads a frozen
   doc only when the task actually turns on its content.
4. **Structured, compact I/O.** Completion reports and handoff notes follow fixed short templates
   (§8). Reviewers return numbered findings, not essays. Terse-output mode (the repo's caveman
   convention) is acceptable for agent-to-coordinator traffic; code, commits, and
   security/irreversible confirmations stay in normal prose.
5. **The repo is the memory.** Nothing is repeated across activations that a tracker line, WP
   card, or RV entry already records. A reactivated agent gets the delta (handoff note), not the
   history.
6. **Fresh contexts beat long ones.** Discarding a finished context and re-briefing later is
   cheaper — and less error-prone — than dragging a 200k-token conversation through unrelated
   tasks. Long contexts also degrade instruction-following; statelessness is a quality feature,
   not just a cost feature.
7. **No duplicated work.** Reviewers review; they never rebuild the builder's analysis. Team-5
   opens only after Team-4 passes, on the same SHA, so a doomed checkpoint costs one review, not
   three. Settled RVs are cited, never re-reviewed.
8. **Prompt-caching awareness.** Where the provider supports prompt caching, the stable prefix
   (charter + standing prompt) is identical across activations of the same role by design — packet
   templates put the variable part (task, pointers) last.

## 8. Context management strategy

**Coordinator (long-lived).** The AI Engineering Orchestrator session holds: the execution
board, the current wave gate, in-flight WP cards, and the activation queue. It holds **no module
implementation detail** — that lives in the repo. When its own context grows long, it compacts
against the derivation chain (the trackers are the truth; the conversation is disposable).

**Workers (stateless).** A Module Agent or Team activation receives exactly four things:

```
ACTIVATION PACKET (template — Team-8 maintains)
1. TASK        — the work item, WP-card scope, in/out-of-scope lines, acceptance criteria
2. DOCUMENTS   — pointers only: owning contract doc §s · Doc-4A §s · Doc-2/4M/4J/4L §s in scope
3. CONTRACTS   — the exact contracts/ files (own module + any consumed sibling contracts)
4. CODE        — the exact source files/dirs in scope (+ handoff note, if reactivation)
```

**Packet size limits (MINOR-02) — whichever is reached first:**

| Dimension | Maximum |
|---|---|
| Document pointers (distinct documents; sections counted within them) | **5 documents** |
| Source/contract files named in CONTRACTS + CODE | **15 files** |
| Total input budget for the activation (packet + everything it names) | **~20k tokens** |

A task whose honest packet exceeds any limit is **too big for one activation** — the coordinator
splits it at a natural seam (sub-scope, layer, or contract boundary) into sequential activations
rather than shipping an oversized packet. The limits are a *design alarm with teeth at dispatch*:
a packet authored over them fails coordinator self-review and is split before any agent is
activated; an already-active agent that legitimately needs one unlisted file reads the minimum and
reports the packet gap (hygiene rules below) rather than aborting.

and returns exactly one thing:

```
COMPLETION REPORT (template)
built · files touched · contracts added/changed (or none) · events emitted (or zero)
· migrations (or none) · tests + results · self-check gate results · open questions /
ESC handles raised · checkpoint SHA
```

**Suspension writes a HANDOFF NOTE** (state, SHA, blocked-on, resume-needs) to the module tracker.
**No agent maintains permanent memory.** Durable knowledge flows one way: agent → repo (code,
trackers, RVs, changelog) → future packets. The derivation priority chain (`review-process.md` §9)
governs which record wins when they disagree; lower layers are patched to match higher ones.

**Context hygiene rules for every activation:** read only what the packet names · if the task turns
out to need an unlisted file, read the *minimum* and note the packet gap in the completion report
(so Team-8 fixes the template) · never re-derive what a tracker already states · never paraphrase a
frozen state machine — re-read it verbatim or bind by pointer.

## 9. Agent activation / deactivation rules

| # | Rule |
|---|---|
| 1 | **Only the Orchestrator activates Core Teams; only its Backend-Lead hat activates Module Agents.** No role self-activates; no role activates a peer. |
| 2 | **One activation = one task = one fresh context.** No standing conversations for workers. |
| 3 | **Activate only when a work item is dispatched** — never speculatively, never "to keep warm." |
| 4 | **A Module Agent activates only if its module's wave is open** (build) — read-only consultation activations are allowed but should be rare (answer by pointer first). |
| 5 | **Reviews activate only on a frozen checkpoint SHA** (stable-target rule). Team-5 activates only after a Team-4 pass-class verdict. Team-6 activates only when its trigger fires. |
| 6 | **Destroy the context immediately on completion** — validate the report, record it, destroy the context. A completed context is **never reused or resumed** (§4 context-destruction rule); never hold a finished agent "in case." |
| 7 | **Suspend instead of wait.** Any blocker that needs the owner, a gate, or an upstream dependency → handoff note → context discarded → the coordinator pulls the next unblocked item. |
| 8 | **Reactivation is always a new context** (packet + handoff note), never a resumed transcript. |
| 9 | **Parallel activation requires the §10 checklist** — otherwise strictly sequential. |
| 10 | **Every parallel file-mutating agent gets its own git worktree** (real installs, never junctions — RV-0126 precedent). |
| 11 | **Enabling teams (8, 9) activate async** and never block a merge — but Docs must complete before a wave Exit-Gate, and Release gates every promotion. |
| 12 | **The owner can always interrupt.** A Board ruling suspends affected activations at the next checkpoint; nothing merges past a red gate while a ruling is pending. |
| 13 | **Dispatch by priority, not FIFO.** The next activation is always the highest-priority unblocked item (P0–P3, §5); ties resolve FIFO; priority never bypasses a gate. |
| 14 | **Packets respect the size limits** (§8: ≤5 documents · ≤15 files · ~20k input tokens); an over-limit packet is split at a seam before dispatch, never shipped oversized. |

## 10. Concurrency policy — recommended maxima

| Situation | Active agent contexts (excl. the coordinator) | Notes |
|---|---|---|
| **Normal operation (default)** | **1** | One builder *or* one reviewer. Sequential pipeline. |
| **Review pipeline on one checkpoint** | 1–2 | A first; Security may run alongside B on the same SHA (independent lenses, read-only). |
| **Peak parallel build** | **2 builders** | Only fully independent items: different modules/lanes, disjoint trees + schemas, no contract dependency, both wave-open, own worktrees. E.g. Agent M0 + Team-1. |
| **Absolute ceiling** | **3** | e.g. 2 independent builders + 1 reviewer on a *third*, already-frozen checkpoint. Never exceed without explicit owner opt-in (multi-agent orchestration is billed and must be requested). |

**Rationale.** The queue's true parallelism is bounded by the open wave (currently two backend
modules) and the review chain is intentionally serial per checkpoint (A gates B). Beyond 3
concurrent contexts, coordination overhead + quota risk outweigh wall-clock gains at this program's
size. The org scales *by adding dormant lanes*, which are free — not by raising the live ceiling.

**Pre-parallelization checklist (all must be YES):** different owner modules/lanes? · disjoint file
trees? · disjoint schemas? · zero contract dependency either direction? · both items wave-open and
un-gated? · separate worktrees provisioned? · coordinator has capacity to validate two reports?

## 11. Example execution scenarios

### Scenario A — single-module backend task (the common case)
*Task: "Implement membership listing query in Identity."*

1. Backend Lead receives the item; owner module = **M1** (CLAUDE.md §3). Wave 2 open ✅.
2. Lead assembles the packet: task + WP scope · pointers to Doc-4C §(memberships) + Doc-4A ·
   `src/modules/identity/contracts/` + the two application-layer files in scope.
3. **Activate Agent M1** (context #1). Agent implements query + tests on real Postgres, self-runs
   `/ivendorz-security` (org-context surface → flags security gate), returns completion report +
   SHA. **Deactivate.**
4. **Activate Team-4** (context #2) on the SHA → PASS, RV logged. Deactivate.
5. **Activate Team-5** (context #3) same SHA → PASS. Deactivate. **Activate Team-6** (context #4,
   trigger fired: org context) → PASS. Deactivate.
6. B/M/M = 0 → Lead makes the milestone-close commit. **Total: 4 sequential activations, never
   more than 1 concurrent.** M0, M2–M9, Teams 1–3, 8, 9: zero tokens.

### Scenario B — cross-module feature (contract seam, sequential)
*Task: "RFQ award should notify the vendor."*

1. Lead splits at the seam: (B1) **M3** emits the award event per the catalog pointer; (B2) **M6**
   consumes it for notification delivery. Two tasks, two packets — **never one agent in two
   modules**. (Both are wave-gated today; scenario assumes their waves are open.)
2. Activate **Agent M3** → implements emit + outbox write via the canonical pattern → report →
   deactivate → review chain (A→B, no security surface → Team-6 never activated, "N/A" recorded).
3. Only after M3's event contract is frozen and reviewed: activate **Agent M6** with a packet
   whose CONTRACTS section is M3's frozen `contracts/events.ts` → implements the consumer →
   review chain.
4. The frozen contract was the synchronization point; total concurrency never exceeded 1.

### Scenario C — parallel build (independence proven, ceiling respected)
*Queue: "M0 outbox dispatcher hardening" + "Public category-browse page polish (Team-1)."*

1. Checklist: M0 (`src/modules/core/`, `core` schema) vs `app/(public)/` — disjoint trees ✅,
   disjoint schemas ✅, no contract dependency ✅, both open ✅. Worktrees provisioned ✅.
2. **Activate Agent M0 and Team-1 concurrently** (2 contexts, each in its own worktree).
3. Both return reports; the Orchestrator validates each; the two checkpoints enter the review chain
   **sequentially** (one reviewer context at a time). Peak concurrency: 2.

### Scenario D — suspension and reactivation (blocker mid-task)
*Agent M1 discovers the task needs a permission slug that exists in no frozen contract.*

1. Agent M1 does **not** invent the slug (no-invention). It raises/cites an **ESC handle** in
   `esc_registry.md`, writes a **handoff note** (SHA of partial work committed on the feature
   branch · blocked-on: ESC ruling · resume-needs: the ruled slug), returns a completion report
   marked SUSPENDED. Context discarded — **parked work costs zero.**
2. The Orchestrator parks the item 🅿, drafts the Board packet with neutral options, pulls the next
   unblocked item.
3. Owner rules the handle. Lead **reactivates M1**: original packet + handoff note + the ruling —
   a **new** context, ~a few pages of briefing, not a resumed 100k-token transcript.

### Scenario E — security-triggered escalation
*Team-6, reviewing Scenario A's checkpoint, finds an endpoint reading org ID from the request body.*

1. Team-6 raises **BLOCKER** (Inv #5 — client-supplied org context) on the RV; deactivates. It
   does **not** fix anything (reviewers never author) and does not rule its own finding
   (Raise ≠ Accept).
2. Item → 🟥. Owner rules the disposition (Validate-Findings gate). Fix ordered.
3. Lead reactivates **Agent M1** with the finding as the task delta → fix → new SHA → **unified
   re-review re-enters at Team-4**, full chain on the new SHA. Merge only at B/M/M = 0.

---

## 12. Gates, merge policy, and provenance (carried from v0.1 — condensed, still binding)

- **Two lanes, ceremony scaled to risk:** Lane **G** (invariant/firewall/money/auth/multi-tenant/
  migration/contract-bound → full A→B→Security chain → Board) · Lane **L** (static/cleanup/docs →
  one fresh-context combined review). Ambiguous → G.
- **Merge gate:** every firing gate PASS with **BLOCKER = MAJOR = MINOR = 0** · scope conforms to
  the WP card · CI green (tsc/ESLint/Prettier/structure-check; isolated prod build for bundle
  changes) · **no Red-Flag item** (any one → Flag-and-Halt, never merge) · all findings
  dispositioned via the Validate-Findings gate · backend wiring respects the wave gate ·
  conventional-commit close + RV reference + append-only changelog.
- **Branch model:** `main` (wave-gated, Exit-Gate-GREEN only) ← `wave/<N>-<name>` (integration) ←
  `feat/<lane-or-module>/<item>` (short-lived, one live item per lane); parallel agents in
  worktrees; never force-push shared branches; gated items never land on shared branches.
- **Authority:** owner holds every approval pen (ID minting, BLOCKER/Flag-and-Halt rulings,
  promotions, wave promotion, anything architecture-affecting — human approval mandatory, §8).
  On a *clean* all-gates-PASS with B/M/M = 0, the owning build role makes the close commit — the
  clean gate **is** the signal (`review-process.md` §13 amendment).
- **Provenance:** derivation chain (frozen corpus → ADRs → Board records → RV ledger → trackers →
  boards → pointers); lower layers patched to match higher, never the reverse; closed WP cards and
  RV entries immutable; nothing authoritative overwritten or hard-deleted (Inv #8).
- **Escalation:** corpus conflict or Red-Flag → **Flag-and-Halt**, Board packet citing both
  sources, owner rules · missing capability → ESC handle, never an invented contract · deadlock →
  neutral-options packet, owner picks.

---

## Appendix A — adoption checklist (RATIFIED 2026-07-08 — kept as the record of what was approved)

> All eight items below were closed by the owner's ratification of 2026-07-08. Items 1–4, 6, 7
> are approvals now in force. Item 5 (commission Team-8 to author the packet/report/handoff
> templates + the Team-6 Security standing prompt as `governanceReviews/` charters) is an open
> **follow-up work item** for the Orchestrator's queue (priority P1 — it gates the first
> backend activation under this model). Item 8 was executed at ratification: this file is v1.0,
> referenced from `project-management/README.md`, with the charter amendment carried by
> `governanceReviews/BOARD-DECISION-AI-ENG-ORG_v1.0.md`.

1. **Ratify the 9-team structure** (§1–2) — numbering is live-compatible; no renumber needed.
2. **Ratify the Team-7 Module-Agent model** (§3): Backend Lead as the sole activator, the shared
   charter, and the ten specializations.
3. **Approve the runtime model** (§4, §9): stateless workers, repo-as-memory, suspension via
   handoff notes.
4. **Approve the concurrency ceiling** (§10): default 1, peak 2 builders, absolute 3 without
   explicit owner opt-in.
5. **Commission Team-8 to author the packet/report/handoff templates** and the Team-6 (Security)
   standing prompt as charters in `governanceReviews/`.
6. **Confirm** the Performance lens folds into Team-5 (Doc-8 still owns budgets) rather than
   standing as a separate team — or direct otherwise.
7. **Approve the model-routing policy** (§6.10) and the packet size limits (§8) as operating
   defaults, or adjust the thresholds.
8. On approval, this file bumps to **v1.0** and is referenced from
   `project-management/README.md`; the FE-PM charters get an additive amendment pointing here.

---

## Appendix B — Review round R1: findings & dispositions (§13 Validate-Findings record)

Reviewer raised 5 MINOR + 4 NIT against v0.2; the owner directed integration of all valid and
applicable findings (2026-07-08). Adjudication (Valid? · Applicable? · Best-for-product? ·
Corpus-consistent?):

| Finding | Severity | Disposition | Where integrated |
|---|---|---|---|
| MINOR-01 Clarify the coordinator role (one long-lived session, Backend Lead = temporary hat) | MINOR | **ACCEPTED** (merged with NIT-01) — 4×YES | §1 single-coordinator rule; rename applied document-wide |
| MINOR-02 Define activation-packet size limits (5 docs / 15 files / ~20k tokens) | MINOR | **ACCEPTED** — 4×YES | §8 packet-limits table · §9 rule 14 |
| MINOR-03 Explicit context-destruction rule (contexts never reused/resumed) | MINOR | **ACCEPTED** (was implied by §4/§9-r8; now explicit) — 4×YES | §4 context-destruction rule · §9 rule 6 strengthened |
| MINOR-04 Cost-aware model routing by work type | MINOR | **ACCEPTED**, with the added guard that governance-gating reviews never route below the highest class — 4×YES | §6.10 routing table + rules · Appendix A item 7 |
| MINOR-05 P0–P3 activation priority (never plain FIFO) | MINOR | **ACCEPTED**, with the guards that priority never bypasses a gate and a blocked P0 never holds the queue — 4×YES | §5 dispatch-priority table · §9 rule 13 |
| NIT-01 Rename "Program Manager" → "AI Engineering Orchestrator" | NIT | **ACCEPTED** (merged into MINOR-01); live FE-PM docs' "Program Manager" noted as the same role — no frozen-ledger renumber/rename is implied | §1 chart + alias note |
| NIT-02 Activation sequence diagram | NIT | **ACCEPTED** | §4 sequence diagram |
| NIT-03 Lifecycle summary table | NIT | **ACCEPTED** | §4 lifecycle table |
| NIT-04 Boxed API-cost design principles up front | NIT | **ACCEPTED** | §0 principles box |

No finding conflicted with the frozen corpus; none required a Flag-and-Halt. NITs were integrated
by owner direction (they never gate, §13). Result: **v0.2 → v0.3**.
