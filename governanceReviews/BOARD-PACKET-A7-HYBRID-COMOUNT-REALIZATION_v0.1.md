<!--
Doc-type:  Architecture Board Decision Packet (decision-prep; NON-authoritative input to the human Architecture Board).
Subject:   [ESC-7G-A7] realization — the Hybrid "mount both" co-mounted IA + the (vendor) layout-group / route topology.
Produced:  2026-07-12 (corpus-verified). Raise != Accept: the Board rules; the non-authoritative FE layer is patched to match.
Note:      AI/skill does NOT realize/ratify a rank-0 frozen shell mandate (CLAUDE.md §7/§8/§11). Recommendations here are NOT rulings.
Precedent: This packet supersedes-in-detail the A7 entry in BOARD-PACKET-VENDOR-FE-BLOCKERS_v1.0.md §ESC-7G-A7 (still open),
           adding a corpus-conformant PRESENTATION REFERENCE + the concrete realization sub-decisions the reference surfaced.
-->

# iVendorz — [ESC-7G-A7] Hybrid Co-Mount Realization — Architecture Board Decision Packet

**Escalation:** `ESC-7G-A7` (`esc_registry.md:53`) — **still open.**
**Packet date:** 2026-07-12 · **Prepared for:** the HUMAN Architecture Board (Golden Rule 7 sign-off) · **Prepared by:** FE realization pass (rank ~7–8, non-authoritative).
**Companion carrying the BLOCKER:** `docs/product/requirements/vendor_planning_and_design.md:97` (freeze WITHHELD on this entry).

## Purpose

The frozen shell mandates that a **Hybrid** org (buys **and** sells) **mounts both** the Buyer and Vendor surfaces together. That mandate is **rank-0 and settled** — it is **not** what A7 decides. A7 is the **Golden-Rule-7 realization sign-off**: *how* "mount both" is realized (internal IA) and the design-introduced `(vendor)` route-group device. This packet raises the realization sub-decisions with a **corpus-conformant presentation reference already built** (files listed below), so the Board rules against a concrete artifact rather than prose.

**What is NOT in question (rank-0, do not re-litigate):**
- **"Mount both."** `Doc-7A_Structure_v1.0_FROZEN.md:91` ("Hybrid mounts both workspaces (R6/R7)"); `Doc-7A_Content_v1.0_Pass3.md:76` (CHK-7-012 "mounts Buyer + Vendor surfaces under one org"); `Doc-7C_Structure_v1.0_FROZEN.md:21` ("mounting Buyer + Vendor together for Hybrid"); `Doc-7C_SERIES_FROZEN_v1.0.md:32` (SR3 "Hybrid mounts Buyer+Vendor").
- **A surface is a capability, not an exclusive app** (`Doc-7A §4.2`) → **no toggle / no cross-route swap.** The re-routing segmented control was already rejected via Flag-and-Halt (`vendor_planning_and_design.md:97`); this packet does not revive it.
- **Composition is shell-owned** (`Doc-7C_Structure_v1.0_FROZEN.md:21`); **grouped-not-merged, Trust read-only** is the recorded A7 direction (`esc_registry.md:53`).

## How to use this packet (Raise ≠ Accept)

Per CLAUDE.md §13, **the reviewer raises; the Board rules.** Every recommendation below is a recommendation, not a ruling. The Board evaluates each sub-decision against the four Validate-Findings questions (Valid? Applicable? Best for the product? Consistent with the frozen corpus?), then rules. The AI/skill author applies only the resulting **non-authoritative** FE/companion edits; it does **not** author or apply any corpus patch without explicit human approval (§7/§8).

## Authority-order analysis (§7) — why this is human-only

Ranks in play: **rank 0** (Doc-7A R6, Doc-7C SR2/SR3, Invariants 2 & 6) and **rank ~7–8** (this FE realization). This is **not** a frozen-vs-frozen conflict — Doc-7A and Doc-7C agree. It is a **realization gap**: the frozen mandate is silent on the internal IA and on the `(vendor)` route-group name, and a lower-rank artifact fills the silence. Per §8 an AI/skill MAY generate the realization but MAY NOT **ratify** it as conformant when it touches shell-composition ownership + route topology; per Golden Rule 7 and §11, whether the realization is an acceptable *realization* or an unsanctioned *redesign* is a human call. An AI cannot self-certify that its own gap-fill conforms upward.

## Presentation reference (decision-prep evidence — non-authoritative, presentation-only)

A corpus-conformant reference is built so the Board can see the realization running. **It wires nothing** (identity/participation are demo fixtures; the SR3 context layer is PARKED) and asserts **no** final IA — it instantiates a *sensible* co-mount to make the sub-decisions concrete.

- `app/(app)/_components/shell/hybrid-nav.ts` — `composeNav(...segments)`: the **generic** shell composer. Concatenates seam-supplied groups **by position**, clones (never mutates `BUYER_NAV`/`VENDOR_NAV`), and **fails loud** on a duplicate group header (dev throws; prod logs + safe fallback). It **never classifies a leaf or interprets participation** — the shell stays semantics-free.
- `app/(app)/_components/hybrid/hybrid-shell-vm.ts` — the **seam** (stands in for SR3): `resolveMountedNavGroups(participation)` selects + tags + orders the groups; the Hybrid VM + single-surface fixtures + the Hybrid mobile bottom-bar subset.
- `app/(app)/_components/vendor/vendor-shell-vm.ts` — **additive** `VENDOR_NAV` change: Trust ("Profile Performance") extracted from the editable `primary` section into its **own read-only section** (benefits single-surface vendor too).
- `app/(app)/(buyer)/layout.tsx`, `app/(app)/workspace/layout.tsx` — both mount the **same** co-mounted VM (demo of the no-swap property).

Verified: `tsc`/lint/prettier clean; `composeNav` ordering + fail-loud + no-mutation exercised; both `/dashboard` (buyer group) and `/workspace/dashboard` (vendor group) return **200** with an **identical** Buying+Selling+Trust sidebar (no swap on cross-surface navigation).

## The realization sub-decisions the Board must rule

| # | Sub-decision | Recommended disposition (NOT a ruling) |
|---|---|---|
| **A7.1** | **Overall IA:** co-mounted, grouped-not-merged, Trust read-only & terminal — vs a merged flat list, or any per-surface partition. | **Grouped-not-merged, Trust terminal** (the recorded `esc_registry.md:53` direction; faithful to Invariant 2 + Invariant 6). |
| **A7.2** | **`(vendor)` route-group + topology.** Frozen SR2 names only `(public)`/`(auth)`/`(app)`/`(admin)` (`Doc-7C_SERIES_FROZEN_v1.0.md:28`); `(vendor)` is design-introduced. Also: today buyer=`/dashboard`, vendor parked at `/workspace/*` to dodge a `/dashboard` collision. | **Option 1** (below): sanction `(vendor)` as a **non-routing layout group under `(app)`** + a **single shared `(app)` shell layout** so cross-surface navigation never remounts the shell; pick the final vendor URL prefix (resolving the `/dashboard` collision). Golden-Rule-7 sign-off, **no corpus patch** — unless the Board wants A7.2 to bind Doc-7F/7H too (then Option 3). |
| **A7.3** | **Is Trust a separate top-level `NavSection`, and WHO tags it** — the seam (Identity/context) or presentation? (Surfaced by the "shell never interprets" boundary — hoisting Trust requires semantic identification the shell may not do.) | **Yes, discrete section; the SEAM tags/orders it.** The reference extracts Trust in `VENDOR_NAV` and the seam emits it terminal; `composeNav` stays opaque. |
| **A7.4** | **Surface-specific vs shared groups.** A naïve full co-mount duplicates cross-cutting org-level groups (Notifications / Team / Settings / Billing appear in BOTH `BUYER_NAV` and `VENDOR_NAV`). Which are surface-specific (mount per-surface) vs shared (mount once / live in Account Surface E)? | Reference treats org-level groups as **shared** → reached via Account (user menu) + topbar, **not** duplicated per surface. The co-mount shows the two **role** workspaces + terminal Trust. Board to confirm the split. |
| **A7.5** | **Hybrid mobile bottom-bar** — which ≤4 thumb-reach items, from which surfaces. | Reference: Buying / RFQs / Selling / Trust (spans both surfaces). Board to confirm the final subset. |

## A7.2 — options (the topology decision, unchanged in spirit from the prior packet)

1. **Ratify "`(vendor)` = non-routing layout group under `(app)`" + single shared `(app)` shell layout; no corpus edit.** Lightest; standard Next.js route-group usage; changes no module ownership, adds no cross-module access, keeps DP9 (no org id in URL). Cost: the topology device gains standing by sign-off, so Doc-7F/7H must be told the precedent out-of-band.
2. **Require a different grouping/naming** (flat under `(app)`, or a differently-named group). Higher rework; ripples into Doc-7F Buyer for symmetry.
3. **Additive Doc-7C clarification** naming the Hybrid surface-set realization + sanctioning the layout-grouping convention in the corpus (rank-0, +version bump, §7). Strongest durability; pre-resolves the same question for Doc-7F/7H. Recommend batching across all surface-sets rather than blocking Doc-7G alone.

**Recommended:** Option 1 with a documented Golden-Rule-7 sign-off; escalate to Option 3 only if the Board wants the convention to bind future surfaces normatively.

## Interim posture (what ships until ruled)

The presentation reference ships **behind A7**: no route-group rename and **no URL change** land before the ruling (the `/workspace` park stays). The reference demonstrates the conformant co-mount + no-swap property and is clearly labeled presentation-fixture-only; production participation + the navigable surface set come from Identity Context (SR3, PARKED). The `[ESC-7G-A7]` marker remains on the carrying companion sections.

## What a ruling unblocks

- The companion §2.1 IA + §2.3 route tree + §2.5 responsive nav + Hybrid dashboard (`vendor_planning_and_design.md:97` and cross-refs); removal of the `[ESC-7G-A7]` marker; promotion toward companion freeze (its last freeze BLOCKER).
- The Phase-2 topology wiring (single shared `(app)` layout; drop the `/workspace` park; resolve `/dashboard`) and the Phase-3 SR3 seam (participation surfaced by `get_active_context` so the co-mount is server-derived, never hardcoded).
- The precedent Doc-7F Buyer / Doc-7H Admin inherit.

## Decision record (Board to complete)

- **A7.1 (IA) — Ruling:** **APPROVED as recommended.** Co-mounted, grouped-not-merged; Trust read-only and terminal.
- **A7.2 (`(vendor)` group / topology / URL) — Ruling:** **APPROVED as recommended — Option 1.** `(vendor)` sanctioned as a non-routing layout group under `(app)` + a single shared `(app)` shell layout, so cross-surface navigation never remounts the shell; no corpus patch, Golden-Rule-7 sign-off only. The final vendor URL prefix (resolving the `/dashboard` collision) and the Phase-2 topology wiring (dropping the `/workspace` park) are unblocked by this ruling but not yet executed — separate implementation step.
- **A7.3 (Trust section + who tags) — Ruling:** **APPROVED as recommended.** Discrete, terminal `NavSection`; the seam (`resolveMountedNavGroups`) tags/orders it — `composeNav` stays semantics-free.
- **A7.4 (surface-specific vs shared groups) — Ruling:** **APPROVED as recommended.** Org-level groups (Notifications / Team / Settings / Billing) are shared — reached via Account (user menu) + topbar, not duplicated per surface.
- **A7.5 (Hybrid mobile bottom-bar) — Ruling:** **APPROVED as recommended.** Buying / RFQs / Selling / Trust.
- **Rationale:** Board approved all five sub-decisions per this packet's recommended dispositions; the presentation reference already demonstrates the ruled IA faithfully (no rework needed to land it).
- **Decided by / date:** Human Architecture Board — 2026-07-12.
- **Resulting additive patch (if any):** None — Golden-Rule-7 sign-off only.
- **Edits to apply (non-authoritative only):** finalize the FE reference to the ruled IA (done — reference already matches A7.1/A7.3/A7.4/A7.5; A7.2's Phase-2 topology wiring remains a separate follow-up); replace `[ESC-7G-A7]` markers in `vendor_planning_and_design.md` (done); update `esc_registry.md:53` to RESOLVED with the ruling reference (done); decrement the companion freeze-gate BLOCKER count (done — BLOCKER = 0).
