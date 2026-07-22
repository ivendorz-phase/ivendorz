# iVendorz — Parallel Module Agent Plan (Backend)

| Field | Value |
|---|---|
| **Document type** | Living dispatch sheet · non-authoritative under the frozen corpus |
| **Date** | 2026-07-22 |
| **Companion to** | [`backend_build_plan.md`](backend_build_plan.md) (sequence) · [`backend_execution_playbook.md`](backend_execution_playbook.md) (how-to-build) · [`backend_execution_tracker.md`](backend_execution_tracker.md) (per-WP status — ⚠ Wave-3 rows not yet populated there; this sheet carries interim status until the tracker is synced) |
| **Purpose** | One page per question: *which module can which agent build right now, in parallel, without colliding.* |
| **Rule** | Coins nothing. Module ownership, counts, dependencies, and wave gates are corpus-fixed (`Build_Roadmap_v1.0` · `Development_Decomposition_v1.0` §7). On any conflict the frozen corpus + the Build Plan win. |

> **Why not 10 agents at once:** the wave gates are Board-owned ordering, not a suggestion.
> `M0 → M1` unblock everything; `M3` needs M2/M5/M7 outputs; `M4/M8` need M3. Parallelism is
> **within a wave**, one agent = one module = one wave branch. Never build out of sequence.

---

## 1. Module lane sheet (all 10)

Frozen doc letters map uniformly: **Doc-4x = contracts · Doc-5x = API realization · Doc-6x = schema/RLS**, with x = B…K for M0…M9. Test bands = Doc-8B…8G per the Build Plan §5 table.

### M0 `core` — Platform Core / Shared Kernel — ✅ DELIVERED (main)
- **Docs:** Doc-4B · Doc-5B · Doc-6B. **Size:** 5 tables · infra services (no business domain — shape exception).
- **Owns:** audit records (CR4′ immutable), transactional outbox, ID gen + human refs, POLICY config, feature flags.
- **Status:** Wave 2 merged to `main` (`2e42ed5`); 18 `core.*` POLICY keys seeded; outbox dispatch + run-level audit legs closed (W2-CORE-4, RV-0161 0/0/0).
- **Agent lane:** none. Residual Board carries only (`[D-5-LEG1-CREATED]`, `[D-5-LEG4-PARK]` — human-approval channel, not build work).

### M1 `identity` — Identity & Organization — ✅ DELIVERED (main) + small growth addendum
- **Docs:** Doc-4C · Doc-5C (effective + `Doc-5C_GrowthInvitation_Patch_v1.0.1`) · Doc-6C (effective v1.0.4 incl. Growth-Invitation tables). **Size:** 9 tables (+2 growth) · 42 wired contracts (+ growth wire rows 36/37).
- **Owns:** users, orgs, memberships, roles/permissions (45-slug catalog), delegation, `check_permission` (the app-layer authz seam every module calls).
- **Status:** M1 MODULE CLOSE executed 2026-07-10 (`M1-MODULE-CLOSE_v1.0.md`); on `main`.
- **Agent lane:** **one bounded addendum WP** — the Growth-Invitation surface (invite-to-register; resolves `ESC-IDN-INVITE-ACCOUNT`; patches already Board-landed per CORPUS_INDEX). Branch precedent: `growth/integration`. Everything else in M1 is closed — reopening closed surface escalates to the Board.

### M2 `marketplace` — Marketplace & Discovery — 🟡 WAVE 3, IN PROGRESS
- **Docs:** Doc-4D · Doc-5D · Doc-6D. **Size:** 21 tables · 71 contracts (largest Doc-5 surface).
- **Owns:** vendor profiles, microsites, products, projects, categories, ads, favorites, presentation.
- **Must hold:** tri-actor + public/anonymous RLS · capability **matrix** (Inv #1) · score firewall — **reflects M5 bands, never computes** · `vendor_matching_attributes` read-model · Postgres FTS · Content ≠ Presentation.
- **Depends on:** M0 + M1 (✅). **Feeds:** M3 (matching attrs), M7, M9.
- **Status:** slices shipped on `wave/3-marketplace`; remaining Doc-5D surface open.
- **Agent lane:** **OPEN — Agent A.** Scope the remainder as WP slices (profile/product CRUD → public read surface → categories/favorites → FTS/read-model), one PR each, on `wave/3-marketplace`.

### M3 `rfq` — RFQ Procurement Engine (the moat) — ⬜ WAVE 4, GATED
- **Docs:** Doc-4E · Doc-5E · Doc-6E. **Size:** 12 tables · 38 contracts.
- **Owns:** RFQ 13-state machine (§5.4) + Quotation 6-state (§5.5), matching/routing/throttling/sorting as **out-of-wire System workers** (buyers never invite — the engine does), invitations, comparison.
- **Must hold:** dual-sided grant-row RLS · **blacklist-undetectable byte-equivalence** (`CHK-8-024`) · reads M2 attrs / M5 signals / M7 quota / M4 CRM via contracts only, empty-tolerant.
- **Depends on:** W3 M2/M5/M7. **Feeds:** M4, M6, M7.
- **Status:** gated on the Wave-3 exit. **Two carried rulings land at its Definition of Ready:** ① Doc-3 §12.2 policy-profile registration patch (`BOARD-DECISION-RFQ-MATCH-EVOLVE_v1.0`); ② slug-binding flip `staff_super_admin` → `staff_can_manage_routing` (`BOARD-DECISION-RFQ-SLUG_v1.0`).
- **Agent lane:** **single-agent module** (its WP chain — schema → machines → engine workers → wired API — is serial). Do not split M3 across agents.

### M4 `operations` — Business Operations — ⬜ WAVE 5, GATED (one pre-scoped slice exists)
- **Docs:** Doc-4F · Doc-5F · Doc-6F. **Size:** 19 tables · 50 contracts (46 caller-facing + 4 out-of-wire).
- **Owns:** post-award docs (LOI/PO/challan/invoice/payment/WCC), finance records, **private Buyer Vendor CRM** (`buyer_vendor_statuses` — the blacklist's owning side).
- **Must hold:** two-sided party-column RLS · **money-record boundary** (`trade_invoices` ≠ `billing.platform_invoices`; no funds custody) · private exclusion stays private (Inv #11) · CRM never mutates platform-wide scores.
- **Depends on:** M3. **Feeds:** M5, M6.
- **Status:** Wave-5 gated. Exception already Board-scoped: **BC-OPS-6** (buyer-relationship CRM backend slice feeding the shipped GATE-4 FE) — dispatchable when its gate opens.
- **Agent lane:** at W5 — **Agent lane 1 of 2** (parallel with M8).

### M5 `trust` — Trust & Verification — ✅ BUILT (unmerged)
- **Docs:** Doc-4G · Doc-5G · Doc-6G. **Size:** 11 tables · 40 contracts.
- **Owns:** the four platform-wide governance signals (Trust, Performance, Financial Tier, Capacity verification) + verification records + fraud signals — **System-written, firewalled (Inv #6), never hand-edited**.
- **Status:** ★ COMPLETE on `wave/3-trust` (`ade5add`→`a68e997`), **not merged/pushed**.
- **Agent lane:** no build work. Remaining = Wave-3 integration (merge reconcile + Wave Integration Audit).

### M6 `communication` — Communication — 🟡 WAVE 3, IN PROGRESS
- **Docs:** Doc-4H · Doc-5H · Doc-6H. **Size:** 9 tables · 23 contracts (19 caller-facing + 4 out-of-wire).
- **Owns:** chat, RFQ threads, notifications, email/SMS/WhatsApp delivery logs — **delivery only** (no business decisions), append-only logs, participant-grant RLS. Emits nothing.
- **Depends on:** M0 + M1 (✅); RFQ-thread legs tolerate M3's absence (fixtures/empty until W4).
- **Status:** pilot **W3-COMM-1** (support tickets) closed (`301e6b3`) on `wave/3-communication`; remaining contract surface open. Related: `wave/3-communication-growth` + `growth_hub_p2_lane_routing.md` route the growth-hub legs.
- **Agent lane:** **OPEN — Agent B.** Slice the remainder (notifications → chat/threads → delivery logs), one PR each, on `wave/3-communication`. **M6 audited write = write + audit in one txn, NO §8 event** (M6 emits nothing — do not copy the D7 event leg).

### M7 `billing` — Monetization — ✅ BUILT (unmerged; 1 exit item)
- **Docs:** Doc-4I · Doc-5I · Doc-6I. **Size:** 13 tables · 33 contracts (incl. `billing.activate_plan.v1`).
- **Owns:** plans, subscriptions, **entitlements** (bool/numeric/enum — never plan-name checks, Inv #10), quotas, lead credits, platform invoices. Billing firewall: commercial state never touches governance signals.
- **Status:** 🏁 COMPLETE on `wave/3-billing` (`be4c283`), **not pushed**; Wave-3 exit ruled DELIVERED-SLICE 2026-07-11 with **one open item `[W3-EXIT-M7-CORE]`**.
- **Agent lane:** close `[W3-EXIT-M7-CORE]` only — belongs to the integration lane (Agent C), not a new module agent.

### M8 `admin` — Admin Operations — ⬜ WAVE 5, GATED
- **Docs:** Doc-4J · Doc-5J · Doc-6J. **Size:** 10 tables · 34 contracts.
- **Owns:** moderation, bans, category/vendor approval, import, config policy; the authoritative event catalog's Admin leg (`VendorBanned` — the only event M8 emits).
- **Must hold:** **"Admin decides, owning module owns"** — M8 writes no owning-module table, ever; `link_suggestions` never vendor-visible; byte-equivalence on ban effects (#11).
- **Depends on:** M3 (and W3 modules). **Feeds:** M2/M3/M5 via `VendorBanned` + decision authority.
- **Agent lane:** at W5 — **Agent lane 2 of 2** (parallel with M4). Zero shared tables with M4 → clean parallel pair.

### M9 `ai` — AI Layer — ⬜ WAVE 6, GATED
- **Docs:** Doc-4K · Doc-5K · Doc-6K. **Size:** 4 cache tables · 16 contracts.
- **Owns:** regenerable derived artifacts only — **advisory (Inv #12)**: no authoritative data, no §8 events, no score writes; sole TTL hard-delete exception (Doc-6A R7).
- **Depends on:** reads all modules via contracts; emits nothing.
- **Agent lane:** single agent, last; smallest module.

---

## 2. Dependency graph & wave gates (why the lanes are shaped this way)

```
W2  M0 → M1        (serial)      ✅ DELIVERED to main
W3  M2 · M5 · M6 · M7 (parallel) ← CURRENT: M5 ✅, M7 ✅(1 exit item), M2 🟡, M6 🟡
W4  M3             (single lane) ← the moat; gated on W3 M2/M5/M7
W5  M4 · M8        (parallel)    ← gated on M3
W6  M9             (single lane)
```

Frozen graph (Decomposition §7.1): M0→all · M1→all · M2→M3/M7/M9 · M3→M4/M6/M7 · M4→M5/M6 ·
M5→M2/M3/M7 (async, idempotent consumers) · M7→M3 (quota) · M8→M2/M3/M5 (`VendorBanned`) ·
M6 emits nothing · M9 reads all, emits nothing.

---

## 3. Dispatch schedule — who runs now

**Now (up to 4 concurrent agents):**

| Agent | Lane | Branch | First action |
|---|---|---|---|
| **A** | M2 marketplace remainder | `wave/3-marketplace` | Diff built surface vs Doc-5D's 71 contracts → WP-slice the gap |
| **B** | M6 communication remainder | `wave/3-communication` | Diff built surface vs Doc-5H's 23 contracts → WP-slice the gap |
| **C** | Wave-3 integration & exit | `wave/3-integration` | Close `[W3-EXIT-M7-CORE]` · reconcile-merge `wave/3-trust` + `wave/3-billing` · Wave Integration Audit |
| **D** *(optional)* | M1 growth addendum | `growth/integration` | Realize the Growth-Invitation patches (Doc-5C v1.0.1 / Doc-6C v1.0.4) |

**Next (after Wave-3 exit → `main`):** one agent on M3 (serial WP chain, W4 DoR carries first).
**Then:** two agents, M4 ∥ M8. **Last:** one agent, M9.

---

## 4. Parallel-agent coordination protocol (binding, from existing governance)

1. **One agent = one module = one wave branch.** A PR never spans two modules (Build Plan §6). Cross-module needs → the other module's `contracts/` only; a missing contract = Flag-and-Halt, never a reach-across.
2. **Worktree per agent.** Parallel agents on one checkout corrupt `.next`/build state — each agent takes a git worktree (see `.claude/CLAUDE.md` dev-server policy).
3. **Commit by explicit path, never `git add -A`** — parallel sessions share working trees during integration; guard-check `git diff --cached` before every commit. Never push unless the owner asks.
4. **Shared-file collision surface is small but real:** `prisma/schema.prisma` (multiSchema — each agent touches only its module's schema block), the contracts registry (regenerated, never hand-merged), and seed entry points. Integration lane (Agent C) owns reconciliation.
5. **Lifecycle per WP (unchanged):** implement → self-verify → Review-A → Review-B (+ Team-6 when security-surfaced) → Validate-Findings (§13) → close at `BLOCKER = MAJOR = MINOR = 0` with the module's Doc-8 bands green (8C + 8D + 8E + 8F for W3 modules).
6. **Test-DB hygiene on the shared Postgres:** full UUIDs in fixtures (sliced UUIDs collide) · append-only residue fills `list_*` page-1 — scope assertions · **no full suites while a Review-B sabotage run is live** on the same tree/DB.
7. **Non-negotiables in every lane:** D7 audited-write pattern (never invent an audit action) · authz via M1 `check_permission` only (no shadow authz) · forward-only migrations · realize-never-redecide — any corpus gap is an `[ESC-*]` + Flag-and-Halt, never a local fill.

---

## Sources (pointers)

`generatedDocs/Build_Roadmap_v1.0.md` · `generatedDocs/Development_Decomposition_v1.0.md` (§3, §7, §9) ·
`generatedDocs/CORPUS_INDEX.md` · `docs/backend/backend_build_plan.md` (§5 counts table) ·
`governanceReviews/M1-MODULE-CLOSE_v1.0.md` · `governanceReviews/REFERENCE_Audited_Write_Pattern_v1.0.md` ·
`project-management/ai-engineering-organization-plan.md` (Team-7 Module Agents · packet/report templates)
