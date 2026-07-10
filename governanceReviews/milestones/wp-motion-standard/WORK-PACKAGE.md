# WORK PACKAGE — WP-MOTION-1 · Enterprise UI Motion Standard + Application

> Owner-directed 2026-07-10 ("Add enterprise-grade UI animations … Use Framer Motion … subtle
> and professional … 150–250ms … respect prefers-reduced-motion … reuse shared variants …
> GPU-friendly"), then owner-routed through the full Dev → Review-A → Review-B pipeline
> ("I want it through the Review-A/B pipeline"). The owner directive is the change
> authorization for the frozen-FE-foundation touches below (visual tuning within each
> primitive's documented contract; no primitive contract, prop, or export changes).

- **Lane:** FE platform/kit (Doc-7B foundation touch + new shared motion module + one new
  root-app composition file). Dev → 🔵A (Team-4) → 🟢B (Team-5) → close. **T6 pre-flag: NO**
  (presentation-only; zero auth/tenancy/data/contract surface).
- **Deliverable standard:** `docs/frontend/design-system/motion_standard.md` v1.0 — a NEW
  living engineering standard (non-authoritative under the frozen corpus; governs *how things
  move* only). Team/agent pointer added to `.claude/CLAUDE.md`; indexed in `docs/INDEX.md`.
- **Reviewed-SHA record:** 🔵A round 1 dispatched 2026-07-10 at the checkpoint SHA recorded in
  the review log (RV-0154). *(updated as legs land)*
- **In scope (the delta, concretely):**
  1. **New dependency:** `framer-motion@12.42.2` (`package.json` + `pnpm-lock.yaml` real
     install + `package-lock.json` synced via `npm install --package-lock-only`).
  2. **New `src/frontend/motion/`** (7 files): `tokens.ts` (MOTION_DURATION 0.15/0.2/0.25 ·
     MOTION_EASE out/inOut · MOTION_TRANSITION) · `variants.ts` (fadeIn/fadeInRise/scaleIn/
     staggerContainer/staggerItem) · `motion-features.ts` (lazy `domAnimation`) ·
     `motion-provider.tsx` (LazyMotion **strict** + MotionConfig `reducedMotion="user"`) ·
     `page-transition.tsx` · `entrance.tsx` (FadeIn/Stagger/StaggerItem) · `index.ts` (own
     barrel; **deliberately absent from the main `src/frontend/index.ts` barrel**).
  3. **`app/layout.tsx`** — body children wrapped in `<MotionProvider>`. **`app/template.tsx`
     (NEW)** — root template rendering `<PageTransition>` (App Router composition only).
  4. **`tailwind.config.ts`** — `transitionDuration["250"]`, `iv-skeleton-pulse` keyframes,
     `iv-skeleton` composite animation (fade-in 200ms then 1.6s gentle pulse).
  5. **`app/globals.css`** — `iv-stagger-rise` / `iv-stagger-fade` parent utilities
     (30ms-step delays, hard cap at nth-child ≥ 8 = 200ms) + `iv-enter-fade`/`iv-enter-rise`
     keyframes + global `@media (prefers-reduced-motion: reduce)` guard (last in cascade).
  6. **Kit primitives (visual tune only, zero API change):** `button.tsx` (tokenized
     150ms transition incl. `filter` — hover brightness no longer snaps — + `active:scale-[0.98]`)
     · `skeleton.tsx` (`animate-pulse` → `animate-iv-skeleton`) · `dialog.tsx` (open 200 /
     close 150, `ease-iv-out`, overlay aligned) · `sheet.tsx` (**300/500ms shadcn default →
     250/200ms**, `ease-in-out` → `ease-iv-out`) · `dropdown-menu.tsx` + `popover.tsx`
     (explicit 150ms + `ease-iv-out` + 8px directional `slide-in-from-*-2`).
  7. **Kit components:** `results-grid.tsx` (grid gains `iv-stagger-rise`) ·
     `data-list-table.tsx` (`<tbody>` gains `iv-stagger-fade`).
  8. **Docs:** the standard itself + `docs/INDEX.md` line + `.claude/CLAUDE.md` section.
- **Out of scope (creep against this list is a Review-A finding):** every in-flight W2-IDN
  backend file dirty in the tree (`prisma/`, `src/modules/identity/`, `src/server/`,
  `src/shared/http/`, `app/api/`, `docs/backend/`, `governanceReviews/milestones/w2-idn-6.1/`)
  — never staged here · mega-menu/navigation-menu animation internals (own reduced-motion
  handling; now additionally covered by the global guard, no file touched) · tooltip/tabs/
  accordion (existing 200ms tokens already conform) · any new page, route content, kit
  primitive, or contract · prototypes/.
- **Dependencies:** none frozen-gated. No `esc_registry.md` handle applies. New-dependency
  addition (framer-motion) is flagged for explicit Review-A attention (supply-chain +
  Doc-7B conformance).
- **Lifecycle ownership:** Builder = Orchestrator session (owner-directed) · Review A =
  Team-4 lane · Review B = Team-5 lane · Board = owner.

## Builder judgment calls (logged, none self-ratified)

1. **Two-layer split (the load-bearing call):** the owner's task list names Framer Motion for
   modal/drawer/dropdown open-close, but those are Radix-mounted kit primitives whose headers
   bind "presentation-only / server-render-friendly" contracts; retrofitting
   `AnimatePresence`+`forceMount` would add client state plumbing to frozen primitives and ship
   framer-motion into every overlay consumer. Realized instead as: **Framer Motion = client
   choreography (page transitions, client entrances); CSS token layer = Radix `data-state` +
   server-rendered surfaces**, both layers pinned to identical numeric tokens. The standard
   §3 makes the split binding.
2. **PageTransition skips the initial SSR paint** (module-level `hasNavigated` flag): an
   `opacity:0` initial wrapper would hide server-rendered content until hydration (LCP
   regression). Only client navigations animate. No invented perf budget (Doc-8 untouched).
3. **Motion barrel excluded from `src/frontend/index.ts`** — RV-0126 barrel-leak lesson;
   import path is `@/frontend/motion` only.
4. **LazyMotion strict + `m.*` + dynamically-imported `domAnimation`** — full `motion` import
   is a thrown error by construction.
5. **Button tap = CSS** (`active:scale-[0.98]`), not `m.button` — preserves the hook-free
   server contract and `asChild`/Slot behavior.
6. **Sheet 300/500ms → 250/200ms** — the inherited shadcn default violated the ratified
   150–250ms band; tuned to the band's upper bound.
7. **Global reduced-motion guard is blanket** (all animations/transitions incl. pre-existing
   shimmer/pulse/tailwindcss-animate collapse to 0.01ms) — deliberate accessibility posture;
   Framer Motion separately guarded via MotionConfig.
8. **Table rows fade only** (`iv-stagger-fade`) — a translate on `<tr>` creates a containing
   block that breaks the sticky first column in `DataListTable`.
9. **Stagger delays hard-capped** at 200ms from the 8th child — long lists must not serialize
   their own visibility.
10. **`--iv-ease-spring` declared legacy** in the standard (token retained in globals.css —
    no token removal; the standard only forbids NEW use).
11. **Dual lockfile sync** — pnpm performed the real install (matches the on-disk `.pnpm`
    layout); `npm install --package-lock-only` kept `package-lock.json` consistent.
12. **`app/template.tsx` minted** — composition-only per REPOSITORY_STRUCTURE §8; remount
    behavior is the animation key; no route, page, or content added.

## Builder verification (pre-review, 2026-07-10)

- `tsc --noEmit` exit 0 · ESLint clean on all touched files · Prettier clean (incl. docs).
- Playwright smoke (headless Chrome, dev server): hard load → first content computed
  `opacity: 1` (static first paint confirmed) · client nav `/` → `/vendors` clean ·
  `iv-stagger-rise` container present on `/vendors` · reduced-motion emulation pass clean ·
  **zero console/page errors across all passes** (LazyMotion strict + hydration verified).

## Review record

*(transcribed by the Orchestrator as legs land — see `project-management/review-log.md`
RV-0154 for the authoritative ledger)*
