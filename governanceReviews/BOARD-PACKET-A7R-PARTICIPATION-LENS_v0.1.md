# Board Packet — `[ESC-7G-A7R]` Participation Lens (re-open of `[ESC-7G-A7]`)

**Status:** ✅ **RULED 2026-07-15 — SD-1…SD-7 APPROVED AS RECOMMENDED; SD-8 APPROVED AS AMENDED**
(owner moved the control from the topbar to the top of the sidebar — see SD-8). Mirrors the A7 ruling
form. Implemented and verified; no corpus change was required.
Raised 2026-07-15 · author: AI (Review-A lens)
**Supersedes nothing.** Re-opens ONE reserved question inside `[ESC-7G-A7]` (RESOLVED 2026-07-12);
does not reopen, amend, or contradict any frozen document.
**Prior packet:** `BOARD-PACKET-A7-HYBRID-COMOUNT-REALIZATION_v0.1.md`.

## Why this exists

The owner directed (2026-07-15) that a Hybrid org must have a Selling/Buying control like the
`Vendor Dashboard Overview` design reference: *"Sidebar should change accordingly buying or selling.
During clicking on toggle open buyer dashboard or Vendor Dashboard accordingly."*

Raised as Flag-and-Halt (CLAUDE.md §11) because the literal reading — a **re-routing toggle** that
partitions the workspaces — is rank-0 forbidden. The owner then ruled (2026-07-15) for the **LENS**
shape below, which this packet argues is conformant and therefore rulable **without** any corpus
change. **If the Board disagrees with §3's conformance argument, nothing here ships** and the ask
reverts to a Doc-7A/Doc-7C re-freeze, which the additive-only change model (§11) cannot express.

## 1. What is NOT in question (rank-0, do not re-litigate)

Restated verbatim from the A7 packet — this packet **does not revive the re-routing toggle**:

- **"Mount both."** `Doc-7A_Structure_v1.0_FROZEN.md:91` ("Hybrid mounts both workspaces (R6/R7)");
  `Doc-7A_Content_v1.0_Pass3.md:76` (CHK-7-012); `Doc-7C_Structure_v1.0_FROZEN.md:21`;
  `Doc-7C_SERIES_FROZEN_v1.0.md:32` (SR3 "Hybrid mounts Buyer+Vendor").
- **A surface is a capability, not an exclusive app** (`Doc-7A_Content_v1.0_Pass1.md:144` §4.2 / R6):
  the shell *"does not partition users into mutually exclusive apps."*
- **Composition is shell-owned**; **grouped-not-merged, Trust read-only** (A7 ruling, 2026-07-12).
- **The UI gate is UX, not the model** (`Doc-7A_Content_v1.0_Pass1.md` §4.3 / R7): the server
  re-validates every action; a hidden control is never an authorization boundary.

## 2. The reserved question this re-opens

`[ESC-7G-A1]` — *"Participation lens persistence … Confirm **lens is not an authz boundary**."*
Marked **"now subsumed by `[ESC-7G-A7]`"**, and A7 ruled the co-mount IA without separately ruling
the lens. The kit gap `[ESC-7B-SEGMENTED]` ("segmented-control/toggle-group — **participation/role
grouping** — `tabs` is wrong semantics") records the control this would need.

So the lens is **reserved, not rejected**. This packet asks the Board to rule it.

## 3. Conformance argument (the load-bearing claim — rule this first)

A **lens** differs from the rejected **re-routing toggle** on every axis R6 cares about:

| | Rejected toggle (A7) | Proposed lens |
|---|---|---|
| Navigable surface set | one surface; the other is **gone** | **both**, always — unchanged |
| Control | shows the active app | always shows **both** options |
| Unfocused surface | unreachable / re-routed away | **one click away**, never gated |
| Deep link to the other surface | redirect or 404 | **auto-focuses** that lens, always renders |
| Nature | a **mode** that partitions | a **view filter** over a set that never shrinks |
| Authorization | implies exclusivity | **never** an authz boundary (R7) |

**Claim:** because the composed surface set stays *both* and every route stays reachable under every
lens, the shell still "does not partition users into mutually exclusive apps" (R6). The lens changes
only which co-mounted group the sidebar **foregrounds** — the same Invariant-#2 "grouped, not merged"
concern A7 already ruled on, expressed as focus instead of stacking.

**Board must decide:** is foregrounding one co-mounted group, with the other always one click away,
"mounting both"? **If NO → this packet dies here** and the toggle needs a frozen reversal.

## 4. Sub-decisions (Raise ≠ Accept — each is a recommendation, not a ruling)

Per CLAUDE.md §13 the reviewer raises; the Board rules against the four Validate-Findings questions.

| # | Sub-decision | Recommendation |
|---|---|---|
| **SD-1** | Lens vs R6 (§3) | **Conformant** — surface set never shrinks; both stay mounted and reachable. |
| **SD-2** | Lens persistence (`[ESC-7G-A1]`) | **Derive the lens from the ROUTE; store nothing.** `/buy/*` → Buying, `/sell/*` → Selling. No client state, no cookie, no stored mode. Kills the stale-mode class of bug outright, and honours Inv #5 (the client asserts no context). The control becomes a plain **navigation** affordance, not a mode switch. |
| **SD-3** | Lens as authz boundary (`[ESC-7G-A1]`) | **CONFIRMED: it is NOT one, and must never become one.** It gates no route and hides no permitted action; the server re-validates regardless (R7). A future reviewer must treat "lens gates X" as a BLOCKER. |
| **SD-4** | Deep links / cross-surface | **Auto-focus, never redirect, never 404.** Opening `/sell/rfqs` from a Buying context renders normally and focuses Selling. A redirect *is* the A7-rejected cross-route swap. |
| **SD-5** | Unfocused surface reachability | The control **always renders both options**; the unfocused surface is always exactly one click away. It is never removed from the composed nav — only un-foregrounded. |
| **SD-6** | Trust under a lens | **Trust stays a persistent terminal group in BOTH lenses** — never folded into an editable group (A7), and hiding a read-only governance signal behind a lens buys nothing. |
| **SD-7** | Per-surface Communication | **Owner-RULED 2026-07-15 — recorded here, already implemented.** Each surface owns its Communication group. This also fixed a live defect: the seam dropped `standing` wholesale (correctly keeping org-level Billing/Team/Settings in Account) and thereby made `/sell/notifications` unreachable for Hybrid orgs. |
| **SD-8** | Control placement | ~~Topbar, per the reference.~~ **AMENDED by owner 2026-07-15 → TOP OF THE SIDEBAR**, pinned above the nav it filters and outside its scroll area. The recommendation was the topbar (reference fidelity); the owner ruled the sidebar, which is at least as defensible — the control sits with the thing it acts on. **The guard is unchanged and still binding: it must not sit adjacent to the org switcher** — `vendor_planning_and_design.md` §2.1 makes that *"the only org-switch affordance"*, and a role control beside it reads as switching organizations. Consequences: (a) it is EXPANDED-ONLY — the 64px icon-rail cannot hold a two-option segmented control, which is SD-5-safe because the collapsed rail turns the lens OFF and draws every surface in full; (b) the MOBILE DRAWER does not carry it, because IA §7.3 relocates the org switcher into that drawer's header and mounting the lens there would breach this very guard — the drawer applies the lens via its one-click surface headers instead. |

## 5. Blast radius if approved

Presentation only; no contract, no module, no corpus edit.
- `shell/types.ts` — `NavSection.surface` already exists (added 2026-07-15); no new field expected.
- `hybrid/hybrid-shell-vm.ts` (seam) — unchanged composition; both surfaces still mount.
- `shell/sidebar.tsx` / `shell/mobile-nav.tsx` — foreground the active surface's block.
- New kit primitive — closes `[ESC-7B-SEGMENTED]` (segmented control; `tabs` is wrong semantics).
- Single-surface navs (buyer-only / vendor-only / admin / account) — **no lens, no change.**

## 6. Risks the Board should weigh

1. **Slippery slope.** A lens is one product decision away from the rejected toggle ("just hide the
   other one"). SD-3 + SD-5 are the guardrails; without them this becomes the partition by drift.
2. **The reference is not our architecture.** The design reference is a mockup of a *different*
   product model (its toggle genuinely partitions, and it ships ₹/GSTIN/Indian data). Visual fidelity
   to it is not evidence of conformance.
3. **SD-2 makes the control honest.** Route-derived means the toggle cannot lie about where you are.
