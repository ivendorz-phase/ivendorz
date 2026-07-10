# iVendorz M9 AI Layer — Model-Routing Planning & Design

**Status:** v0.3 — OWNER-APPROVED (planning approval 2026-07-10; **not** implementation authorization)
**Date:** 2026-07-10
**Lane:** Product / architecture planning (Track: M9 AI Layer readiness)
**Revision v0.3 (2026-07-10):** folded Team-5 Review-B (verdict PASS after fold) — B-1 MINOR
(renumbered §5 policy bullets `A-*` → `AS-*` to end the label collision with Review-A finding
IDs), B-2 OBS (scoped §5 "teams/agents/sub-agents" to M9 product-runtime, not the build-time
dev org). B-3 OBS partially declined: `ESC-M9-*` stay **doc-internal** — `esc_registry.md`
scopes frozen-wired-surface gaps, whereas these are M9 build-time planning handles (same
posture as the Trust Adoption Ladder's doc-internal `ESC-TRUST-*`); §8 now states this
explicitly. B-4/B-5 OBS recorded, no change. Gate 0 · 0 · 0. Recorded in §9.
**Revision v0.2 (2026-07-10):** folded Team-4 Review-A (verdict PASS) — A-1 MINOR
(illustrative capabilities tied to Doc-4K's frozen artifact families; `draft_document` /
`understand_query` flagged as candidates needing a Doc-4K additive patch), A-2 MINOR (Doc-4K
is already frozen, not "defined at build time"), A-3 MINOR (volatile cost/retention figures
moved behind §7), A-5 NIT (anchor row relabeled §2 Search/AI). A-4 OBS recorded, no change.
Gate 0 · 0 · 0. Recorded in §9.
**Authority:** NON-AUTHORITATIVE under the frozen corpus. Every architectural fact is bound
**by pointer** to its frozen owner; nothing is restated as new authority. On any conflict,
the frozen document wins (CLAUDE.md §7). Amendments after any future freeze: additive patch
+ version bump — no in-place edits.

> **What this is:** the planning record for *how M9 should choose which LLM to use, where,
> and by which provider* when it is eventually built (Wave 9+). It records a default
> model-per-capability routing policy, a provider-abstraction rule that preserves the frozen
> "Claude + OpenAI (future)" stance, an automatic tier-selection policy for teams / agents /
> sub-agents, a reserved lane for the top-tier model, and the governance firewall constraints
> that bind every provider equally.
>
> **What this is not:** not an architecture change, not a wave/roadmap re-sequencing, not
> implementation authorization for M9 or any wiring, not a new module, signal, page, or
> contract. It coins no entity, slug, event, state, or POLICY key. It does **not** select a
> provider or freeze a model — model/provider choice is an ADR-class decision reserved to
> M9 build time under human approval (CLAUDE.md §8).

**Frozen anchors (reference, never restate):**

| Anchor | Owner | Pointer |
|---|---|---|
| M9 AI Layer is **reserved**; owns regenerable derived artifacts only | M9 / Doc-4K | CLAUDE.md §3 (M9 row); `generatedDocs/` Doc-4K |
| "AI suggests; modules decide" | Invariant #12 / Golden Rule #6 | CLAUDE.md §5 Inv. 12; §6 Rule 6 |
| Governance signals are firewalled — five independent, no cross-mutation | Invariant #6 / §4 | CLAUDE.md §4; §5 Inv. 6 |
| Scores auto-calculated under the **System actor**, never hand-edited | §4 Firewall (binding) | CLAUDE.md §4 |
| §2 Search/AI stack = "Claude + OpenAI (future)" | Architecture / §2 | CLAUDE.md §2 (stack table, Search/AI row) |
| M9 frozen artifact families — recommendation · prediction · classification · similar-vendor | M9 / Doc-4K | `generatedDocs/Doc-4K_FROZEN_v1.0.md` (mission + artifact set) |
| AI agent rules — MAY generate; MAY NOT change architecture/ownership/invariants; architecture-affecting artifacts require **human** approval | §8 | CLAUDE.md §8 |
| Authority order — Architecture is supreme; ranks 0–1 immutable | §7 | CLAUDE.md §7 |
| Money boundary — platform never handles buyer↔vendor transaction money | Architecture / §1 | CLAUDE.md §1; `generatedDocs/Master_System_Architecture_v1.0_FINAL.md` |
| One module, one owner — references by ID only, contracts importable | Invariant #7 / §3 | CLAUDE.md §5 Inv. 7; §3 |
| Cross-module communication by services, events, public contracts only | §3 | CLAUDE.md §3 |

---

## 0. Governance Frame (binding on every section below)

- **G-1 — Coins nothing.** No new entity, contract slug, event, state, page ID, POLICY key,
  or governance signal is introduced here. Any `ESC-M9-*` handles are escalation-register
  entries (the established ESC mechanism), not contracts.
- **G-2 — Reference, never restate.** Frozen facts appear only as pointers to the anchors
  table above. Model IDs and pricing are **not** frozen here — they are looked up live at
  build time (§7).
- **G-3 — No wave reorder.** M9 stays sequenced by `generatedDocs/Build_Roadmap_v1.0.md`.
  This document sets a default policy to be *ready* when M9 is built; it starts nothing early.
- **G-4 — Implementation authorization is separate.** Nothing here authorizes building M9,
  selecting a provider, or any wiring. No code change rides with this package.
- **G-5 — Model/provider choice is ADR-class.** Committing a default provider or tier per
  capability is architecture-affecting → additive patch + **human** approval (CLAUDE.md §8),
  never a skill or code decision. This note is an *input* to that decision, not the decision.
- **G-6 — Provider-neutral at the boundary.** Everything below is expressed as *capabilities*
  and *tiers*, never as a vendor name in a public contract (§2).

---

## 1. Capability catalogue (what M9 would be asked to do)

M9 outputs are advisory and regenerable — every one is a *suggestion*; the owning business
module makes the authoritative decision (Inv. 12). Planning-level capability list:

| Capability (internal, provider-neutral) | Consuming module (decides) | Shape | Doc-4K family |
|---|---|---|---|
| `suggest_categories` — taxonomy tagging for products / RFQs | M2 / M3 | High-volume classification | classification |
| `explain_match` — human-readable rationale for a routing/match result | M3 | Reasoning / narrative | recommendation |
| `summarize_signal` — narrative summary of a trust/performance/financial signal | M5 (read-only) | Narrative — **never sets a score** | prediction / recommendation |
| `draft_document` — LOI/PO/challan/invoice draft body text | M4 | Structured drafting | **candidate — no Doc-4K family** |
| `understand_query` — query intent / relevance assist for discovery | M2 / M3 | Latency-sensitive per-query | **candidate — no Doc-4K family** |

*(Rightmost column = the frozen Doc-4K M9 artifact family the capability maps to:
recommendation · prediction · classification · similar-vendor.)*

> The catalogue is illustrative planning scope, not a contract surface. M9's real contract
> surface is **already frozen** in Doc-4K; capabilities here bind to it (never to model names),
> and any capability marked **candidate** — `draft_document`, `understand_query` — has **no
> anchor in Doc-4K's frozen artifact set** and would require a **Doc-4K additive patch (human
> approval, §8)** before it exists. Nothing here grants them; they are recorded as candidates,
> not authority (G-1).

---

## 2. Provider abstraction (preserves the frozen dual-provider stance)

Owner decision (2026-07-10): **keep the frozen "Claude + OpenAI (future)" stance** — do not
commit the platform to a single provider now.

- **P-1 — Capability contract, not model name.** M9 exposes each capability (`suggest_categories`,
  `explain_match`, …) as a service/contract conforming to the **already-frozen** Doc-4K surface
  (per Doc-4A metastandard; additive patch if extended). The provider and model are an
  *internal, revisable implementation detail* behind that boundary — the frozen stack wording
  is untouched, and Claude↔OpenAI remains swappable per capability without contract churn.
- **P-2 — Default provider = Claude; OpenAI is the documented alternative.** The routing
  policy (§3) defaults to Claude tiers, but the abstraction keeps OpenAI a legitimate
  build-time selection per capability. Neither is frozen by this note (G-5).
- **P-3 — Cross-module rule holds.** M9 is one module, one owner (Inv. 7); other modules reach
  it only via its `contracts/`, never by importing a model client or SDK.

---

## 3. Default model-routing policy (per capability, per tier)

Planning default only — the tier is the durable decision; the exact model **ID** is resolved
live at build time (§7). Tiers map to the Claude default provider; an OpenAI equivalent tier
may substitute per P-2.

| Capability | Default tier | Rationale |
|---|---|---|
| `explain_match` (the M3 moat) | **Flagship** | Highest-stakes, defensible reasoning; advisory to M3's decision |
| `draft_document` | **Mid** | Near-flagship quality at lower cost for structured drafting |
| `summarize_signal` | **Mid** | Narrative only; never computes a score (§5) |
| `suggest_categories` | **Volume** | Per-record at taxonomy scale; flagship is overkill |
| `understand_query` | **Volume** | Latency-sensitive, per-query |
| *(future) autonomous long-horizon agent* | **Reserved top-tier** | See §4 |

Tier legend (Claude default provider, IDs resolved at build time per §7):
**Flagship** → Opus-class · **Mid** → Sonnet-class · **Volume** → Haiku-class ·
**Reserved top-tier** → Fable-class (§4).

---

## 4. Reserved top-tier lane

The most-capable model class (Fable-class) is **reserved, not default**. It is built for the
hardest *long-horizon autonomous agentic* work (multi-minute/overnight self-directed runs) and
carries a **higher cost profile and stricter operational constraints** than the default tiers —
material for a multi-tenant, default-private platform. The concrete figures (price, any
data-retention / residency constraint) are volatile and resolved at build time per §7, not
frozen here.

- **R-1 — Reserved trigger.** Selected only for a genuinely autonomous long-horizon agent
  capability (e.g. an unattended RFQ-routing agent that plans, calls tools across M3/M5, and
  self-verifies over a long run) — not for the request/response capabilities in §1.
- **R-2 — Gated.** Any use is gated on written justification covering cost and an
  operational-constraint review (data-retention / residency implications under
  multi-tenant / default-private), with the then-current figures pulled per §7.
- **R-3 — Firewall still binds.** Even a top-tier autonomous agent only *suggests*; the owning
  module decides (§5, Inv. 12).

---

## 5. Automatic tier selection (teams / agents / sub-agents)

Owner directive (2026-07-10): **teams, agents, and sub-agents select the LLM per requirement
automatically**, per this plan — not by hard-coding a model at each call site.

> **Scope of "teams / agents / sub-agents" (§5).** This means **M9's product-runtime routing
> layer** — the AI actors iVendorz *serves* to buyers/vendors — **not** the platform's
> build-time engineering agent organization that *constructs* iVendorz. §5 authorizes nothing
> for the dev org.

- **AS-1 — Route by capability, not by caller.** A caller invokes a *capability*
  (`suggest_categories`, `explain_match`, …); an M9 routing layer resolves the capability to
  its default tier (§3) and the active provider/model (§7). Callers never name a model.
- **AS-2 — Requirement-driven tier.** The tier is chosen from the task's declared requirement
  profile — e.g. *intelligence-sensitivity*, *latency budget*, *volume/cost sensitivity*,
  *autonomy horizon*. The §3 table is the default mapping; a per-request requirement may
  escalate (e.g. a hard match to flagship) or de-escalate (bulk backfill to volume) within
  the policy.
- **AS-3 — Sub-agents inherit the policy, tier independently.** An orchestrating agent and its
  sub-agents each resolve their own tier from their own sub-task requirement — a flagship
  orchestrator may fan out to volume-tier sub-agents for mechanical work, and vice versa —
  all through the same capability→tier resolver, not ad-hoc model strings.
- **AS-4 — Reserved lane stays gated even under automation.** Automatic selection may pick
  Flagship/Mid/Volume freely; it may **not** auto-escalate to the reserved top-tier (§4)
  without the R-2 justification gate. The router treats top-tier as opt-in, never a default
  fallback.
- **AS-5 — Deterministic and auditable.** Capability→tier→model resolution is
  configuration-driven and logged, so a given requirement profile maps to a predictable tier;
  the mapping is revisable at build time under G-5, not scattered across code.

> Planning intent only — AS-1…AS-5 describe the *policy* the M9 routing layer should implement.
> The mechanism (config schema, resolver, telemetry) is designed and built at M9 time to
> conform to the **already-frozen** Doc-4K contract surface (Doc-4A metastandard; additive
> patch if extended), subject to Review-A/B and the §8 human-approval gate.

---

## 6. Firewall constraints (bind every provider and tier equally)

These are not model choices — they are constraints the M9 build must carry forward regardless
of provider, tier, or automation:

- **F-1 — Signals firewall (Inv. 6 / §4).** An LLM may *narrate or explain* a trust,
  performance, or financial signal but **never sets one**. Scores stay auto-calculated under
  the System actor (`summarize_signal` is read-only over an already-computed score).
- **F-2 — AI suggests; modules decide (Inv. 12).** Every M9 output is advisory and
  regenerable; the owning module (M3 routing, M4 docs, M5 trust) makes the authoritative call.
- **F-3 — No LLM in any money path (§1).** There is no settlement/escrow/wallet path to be in;
  no capability may introduce one.
- **F-4 — Module boundary (Inv. 7 / §3).** M9 is reached only via its `contracts/`; no other
  module imports a model client. No cross-module DB access or foreign keys via any AI path.
- **F-5 — Data-usage & privacy.** Provider/tier selection must honor the frozen AI data-usage
  and default-private rules (e.g. private RFQ content never trains public models) — bound at
  build time to their frozen owners (ADR-013 and related), not restated here.

---

## 7. Build-time freshness (do not bake into this note)

Model IDs, tier↔model mappings, pricing, and per-model API behavior **change over time** and
are deliberately **not** frozen here. At M9 build time:

- Resolve exact current model IDs live (the AI-tooling skill / provider docs), not from memory.
- Re-baseline pricing and token behavior against then-current models before committing tiers.
- Confirm current API behavior for the chosen family (e.g. thinking/effort parameters, refusal
  handling, data-retention constraints) — these have shifted between model generations.

This keeps the planning policy (tiers, abstraction, firewall) stable while the volatile facts
(IDs, prices, params) are always fresh.

---

## 8. Open items / escalation register

> `ESC-M9-*` handles are **doc-internal** to this planning note (the same posture as the Trust
> Adoption Ladder's `ESC-TRUST-*`). They are **not** registered in `esc_registry.md`, whose
> scope is gaps in the frozen *wired* surface resolved via a named channel — these are M9
> build-time planning decisions, a different class. They migrate into the registry only if and
> when M9 build surfaces an actual frozen-surface gap.

| Handle | Item | Disposition |
|---|---|---|
| ESC-M9-01 | Default provider commitment (Claude vs dual) per capability | **Deferred to M9 build (ADR-class, §8 human approval)** — dual-provider stance preserved for now |
| ESC-M9-02 | Reserved top-tier (§4) justification + retention-review template | Open — author at first autonomous-agent proposal |
| ESC-M9-03 | Requirement-profile schema for auto tier selection (§5 AS-2) | Open — design at M9 time to conform to the frozen Doc-4K surface (Doc-4A; additive patch if extended) |
| ESC-M9-04 | Binding of F-5 to the exact frozen AI-data-usage/privacy anchors | Open — resolve against ADR-013 et al. at build time; Flag-and-Halt on any conflict (§7) |

---

## 9. Approval trail

- **2026-07-10 — Owner planning approval** of this note's direction: future M9 planning;
  **dual-provider stance kept**; teams/agents/sub-agents select the LLM per requirement
  automatically per this plan (§5); reserved top-tier lane recorded (§4). Planning approval
  only — **not** implementation authorization, not a freeze, not a provider/model commitment.
- **2026-07-10 — Team-4 Review-A: PASS** (ready to advance to Review-B). All frozen anchors
  verified against the corpus. 5 findings raised (A-1/A-2/A-3 MINOR, A-4 OBS, A-5 NIT);
  author disposed A-1/A-2/A-3/A-5 **accept** and folded them into v0.2 (Validate-Findings
  four-question test passed on each); A-4 recorded as OBS — the "default provider = Claude"
  (§2 P-2) is a **non-binding** planning default, not a soft provider commitment (Board minutes
  to note). No BLOCKER/MAJOR; no Flag-and-Halt; no frozen conflict.
- **2026-07-10 — Team-5 Review-B: PASS (after B-1 fold)** — ready to advance to Board. All
  frozen anchors independently re-verified against the corpus (Doc-4K L76 mission + four
  artifact families, ADR-013 L623, CLAUDE.md §4); Review-A folds confirmed landed; no Review-A
  disposition overturned. Author disposed B-1 (MINOR) / B-2 / B-3 **accept** → folded into
  v0.3; B-4/B-5 recorded as OBS (Doc-4K-patch-time notes). No BLOCKER/MAJOR; no Flag-and-Halt;
  no frozen conflict.
- **2026-07-10 — BOARD CLOSE (owner): APPROVED** as a planning package (both lanes PASS at
  0·0·0). This approval ratifies the *policy shape* — capability abstraction, default-tier
  mapping, auto-selection policy, reserved-tier lane, and firewall constraints. It **does not**
  make the note authoritative, does not authorize building M9, and is **not** a
  provider/model commitment: `ESC-M9-01` (default-provider commitment) stays ADR-class,
  deferred to M9 build under §8 human approval, and "default = Claude" (§2 P-2) remains
  **non-binding**. `ESC-M9-02/03/04` remain open build-time items. The note stays
  NON-AUTHORITATIVE under the frozen corpus; any post-approval change is an additive patch +
  version bump.
