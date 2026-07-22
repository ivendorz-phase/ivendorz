# Doc-7D Additive Patch — Authenticated-Visitor Header Affordance on the Public Surface

**Status:** **OWNER-APPROVED 2026-07-22 — option (A) ruled. AWAITS THE HUMAN CORPUS-FOLD ACTION.** The build
is authorized and implemented (see "Realization" below); the **binding** is not yet in force, because
appending §12 to `Doc-7D_SERIES_FROZEN_v1.0` and bumping v1.2 → v1.3 is a **human record action** that no AI
performs (CLAUDE.md §11; this file's own terms, below). Owner chat approval authorizes the **build**, not the
**fold**.

## Owner ruling — 2026-07-22

| Item | Ruling |
|---|---|
| Flag-and-Halt fork (A/B/C) | **(A) Scoping clarification.** PR1's "anonymous" and PR6's "no browser-direct call" govern the **data/content projection and its indexability**; they do **not** reach a presence-only, content-inert, client-side auth affordance. §12 is therefore a clarifying additive section — **no exception is created**, and §12.4's bounds are what keep it inside PR1/PR6. |
| §12.3 (no identity client-side) | **FIRST ruled UPHELD (neutral glyph), then REVERSED the same day — see §12.3-A.** The account menu now renders the viewer's **own** identity (email + initials avatar), for parity with the dashboard `UserMenu`. **Org-scoped data stays forbidden** (organization, participation, counts, private status — Inv #5/#11 untouched). |
| §12.2 — standalone `Dashboard` CTA | **AMENDED — see §12.2-A below.** The separate `Dashboard` button is **removed**; the canonical workspace entry lives **inside** the account menu. |

### §12.2-A — amendment to the §12.2 table *(owner, 2026-07-22)*

The §12.2 table's "Primary CTAs → **`Dashboard`** … + a non-personal account menu" is amended to **the account
menu alone**:

| Element | Anonymous (unchanged) | Authenticated (as ruled) |
|---|---|---|
| Primary CTAs | `Sign in` · `Get started` | a non-personal account menu **only** — no standalone `Dashboard` button |

The canonical workspace entry (today `/dashboard`) is **not dropped**; §12.2's closing sentence already
requires the menu to link to the workspace entry and the sign-out endpoint, so it remains one click away.
Rationale: a standalone button duplicated a menu item the same cluster already carries, and the anonymous
header holds only two row-1 actions — the authenticated header should not hold more. Nothing else in §12
changes; §12.4's bounds are unaffected.

### §12.3-A — amendment to §12.3 *(owner, 2026-07-22 — reverses the same-day UPHELD ruling above)*

**Directive:** "make the account dropdown on all public pages the **same as the dashboard**." The dashboard
`UserMenu` (`app/(app)/_components/shell/user-menu.tsx`) renders an initials avatar + the user's name/email;
§12.3's "neutral glyph, no identity" therefore blocked the requested parity. The owner was shown the exact
tradeoff, chose **full identity parity**, and this record supersedes the UPHELD row.

§12.3's forbidden list is **narrowed**, not deleted. What flips vs what holds:

| Datum | Before (§12.3 as drafted) | After (§12.3-A) |
|---|---|---|
| Viewer's **own** email | forbidden | **ALLOWED** — rendered in the account menu |
| Viewer's **own** initials avatar | forbidden | **ALLOWED** — derived from the identity above |
| Viewer's **own** name | forbidden | **ALLOWED when present** — see the wiring note |
| **organization**, participation, counts, private/blacklist status | forbidden | **STILL FORBIDDEN** (Inv #5, #11 — unchanged) |

**Five bounds keep this inside the rest of §12 — none of §12.1/§12.4 is touched:**

1. **Own identity only.** The menu renders the *viewer's own* email/name — never a third party's, never an
   org-scoped or cross-party datum. Inv #11 (private exclusion undetectable) and Inv #5 (no client-asserted
   org context) are untouched: neither is about the user's own email.
2. **No new data call (§12.4.1 intact).** The email is read from the **same browser auth-session read §12.1
   already authorizes** — the presence probe's `supabase.auth.getSession()`, whose `session.user.email` is the
   source. No Doc-5 contract call is added; §12.4.1 ("presence-only; no Doc-5 contract call from `(public)`")
   still holds. This is the identity §12.3 forbade, delivered through the read §12.1 already permits.
3. **SSG/indexability intact (§12.4.2, PR7).** The server-rendered HTML still ships the **anonymous** header;
   identity fills in **after hydration**, client-side. Crawlers index the anonymous document; no `(public)`
   route becomes dynamic.
4. **No fabricated name (binding FE directive — no read ⇒ no figure; GI-03).** The canonical display **name**
   is NOT in the auth session — it is DB-resolved (`identity.users`) through the **deferred Doc-7C SR3 layer**,
   which is why the dashboard `UserMenu` it now mirrors is *itself a neutral fixture today* (workspace layout
   note: "Identity/participation are a neutral presentation fixture until … SR3 … is wired"). So until SR3
   lands, the public menu shows the **real email** (+ email-derived initials), and a **name only if the
   session already carries one** (`user_metadata`). No placeholder name is invented. The name populates on
   **both** surfaces together when SR3 wires — building it now would be the deferred identity read, out of
   Wave-3 sequence, and would add the browser data call §12.4.1 forbids.
5. **Gates nothing (§12.4.4 intact).** Presentation only; every destination still re-validates server-side.

---

**Original status (superseded by the ruling above):** PROPOSED (DRAFT) — AWAITS HUMAN /
ARCHITECTURE-REVIEW-BOARD APPROVAL. Doc-7D is part of the
frozen Doc-7 series (`Doc-7D_SERIES_FROZEN_v1.0`). Per CLAUDE.md §11, **a frozen document is never edited in
place**; this is an **additive** patch proposal that **adds one new section (§12)** and **alters no existing
clause of §0–§11**. No AI action folds it into the corpus — on approval a human appends the new section and
bumps the version. Until then this file lives in `governanceReviews/` and is **non-authoritative**.

> ⚠️ **This patch differs from the two already-approved Doc-7D patches (§10 IA, §11 Host Canonicalization).**
> Those authored IA where §4 was **silent**. This one sits **adjacent to clauses that speak** — **PR1**
> ("the **anonymous** Public surface … no active-org") and **PR6** ("reads via the Doc-7C server-side wired
> client — **no browser-direct call**"). It therefore asks the Board to **rule on scope**, not merely to
> append. Per §11 the tension is **flagged, not resolved locally** (see "Flag-and-Halt: the clause tension"
> below). It must not be treated as a settled additive append.

| Field | Value |
|---|---|
| Target document | **Doc-7D — Public Surface** (`Doc-7D_SERIES_FROZEN_v1.0`, FROZEN v1.0) |
| Proposed version | **Doc-7D v1.2 → v1.3** (additive new section §12; **no existing clause changed**) |
| Realizes | Owner directive 2026-07-16 — remove the post-login dead-end on the Public surface **without** making the Public pages dynamic (preserve SSG/SEO) |
| Change type | **Additive + scoping clarification** — adds §12; **bounds** the reach of PR1/PR6 to the data/content model (see rationale). Authors no override. |
| Coins | **Nothing** — no new contract, route-as-API, field, projection, or POLICY key. Reads **no** Doc-5 contract. Reuses the **canonical browser authentication client** (today realized by `createSupabaseBrowserClient`, `src/server/auth/client.ts`, presently dead code — the implementation binds the abstraction, not the frozen text). |
| Authority | CLAUDE.md §5 (Inv #5 Users-Act/Orgs-Own · #9 Content≠Presentation · #11 private-stays-private), §7, §8, §11, §13; Doc-7A §4.3 R7; `[ESC-7G-A7R]` (lens ≠ gate). |

---

## Problem (what this fixes)

On the frozen Public surface, the header CTAs are hardcoded to `/login`
(`app/(public)/_components/site-header.tsx`: `Sign in`, `Get started`, `Request for Quotation`,
`SELL_ON_IVENDORZ_HREF = "/login"`). The surface reads **no** session, so a **signed-in** visitor sees the
**signed-out** header everywhere on `(public)`:

- clicking **"Sign in"** sends an already-authenticated user to a login form (which now bounces them back —
  see the companion non-frozen change — but the affordance is still a dead-end);
- clicking **"Request for Quotation"** sends an authenticated buyer to `/login` instead of the RFQ flow;
- there is **no** visible route from any public page back to the user's workspace.

The owner's constraint is explicit: **do not** make the Public pages dynamic by reading `cookies()`
server-side (that would forfeit SSG/CDN caching and the SEO posture PR7 mandates). The fix must therefore be
**client-only** and **presence-only**.

## Rationale — why this is additive + a scoping clarification, not an override

**Doc-7D's frozen intent is a DATA/CONTENT model, not a chrome-personalization ban.** Reading the effective
manifest:

- **PR1 (Scope):** "the **anonymous** Public surface — Public projection only, no active-org, **no anonymous
  mutation**." The load-bearing objects are the **content projection** (published-only Public reads) and the
  **absence of org-scoped context** in what the surface *reads and renders*. `(public)/layout.tsx` realizes
  this as "no `Iv-Active-Organization`, NO org-switcher, NO notification center." A **presence-only** header
  affordance ("a session cookie exists → show a Dashboard link") introduces **none** of those: it sets no
  active-org header, mounts no org-switcher, fetches no org-scoped data, and changes **no rendered page
  content**. It cannot even distinguish buyer from vendor (that needs a server read — deliberately excluded;
  see §12.3).

- **PR6 (Data):** "reads via the Doc-7C server-side wired client (**no browser-direct call**); cursor
  pagination + POLICY page_size; media as `file_ref`." In context, PR6 governs the **§4.1 Public data reads**
  — catalog/search, vendor profile/microsite, trust badge, reviews — which must be server-rendered so the
  page is **indexable** (PR7). An **auth-session presence check** reads **no §4.1 Public read**, **no Doc-5
  contract**, and produces **no indexable content** — it only toggles a navigation affordance after
  hydration. It is not the "browser-direct **data** call" PR6 forecloses.

- **PR7 (Render):** "SSR/SSG, indexable, published+Public content only in pages/sitemap/metadata." §12 keeps
  this **fully intact**: the server-rendered HTML is unchanged and still ships the anonymous header; the
  account affordance is applied **client-side after load**. Crawlers index the anonymous document; the
  page stays statically cacheable.

Where §10 filled a **silence**, §12 proposes a **bounded reading** of PR1/PR6 written to **not** cross their
data/content intent — hence the Board routing flagged above, not a local assertion.

## Flag-and-Halt: the clause tension (the Board's actual decision)

Per CLAUDE.md §11, the conflict is stated, not resolved here. **The Board must choose one:**

- **(A) Scoping clarification (recommended).** Ratify that PR1's "anonymous" and PR6's "no browser-direct
  call" govern the **data/content projection and its indexability**, and do **not** reach a presence-only,
  content-inert, client-side auth affordance. §12 is then a clarifying additive section, no exception needed.
- **(B) Bounded exception.** If the Board reads PR1/PR6 as reaching header chrome, then §12 is a **narrow,
  enumerated exception** to those clauses, approved as such and recorded with its bounds (§12.4).
- **(C) Reject.** Keep `(public)` strictly anonymous. The companion non-frozen work (real logout, login
  redirect-when-authed, the `/dashboard` entry route) already removes the **post-login** dead-end because
  users no longer *land* on `(public)` after login; (C) leaves only the **Google-entry** and **logo-click**
  dead-ends for a signed-in visitor, which the Board may accept.

## Proposed new section (to append to Doc-7D on approval)

> ### §12 — Authenticated-Visitor Header Affordance *(client-only, presence-only)*
>
> §12 authors a **presentation-only** account affordance in the Public header. It coins no contract, reads no
> §4.1 Public read and no Doc-5 contract, and changes no §0–§11 clause. It is **navigation chrome**, not a
> data surface.
>
> **§12.1 Presence-only, client-only.** The Public header MAY read **auth-session presence** (session present /
> absent) **in the browser only**, via the **canonical browser authentication client** (authentication only,
> CLAUDE.md §2; the implementation binds this to the approved auth adapter). **Session presence** means that
> client considers the visitor **currently authenticated for navigation purposes** — an absent, expired, or
> not-yet-established session counts as **anonymous**; it is never an authorization decision (the server
> re-validates every destination, §12.4.4). The header MUST NOT read presence server-side on any `(public)`
> route, so the route stays SSG/SSR-cacheable and indexable (PR7). The server-rendered HTML ships the
> **anonymous** header; the authenticated affordance is applied after hydration.
>
> **§12.2 Affordance swap (the only change).** When — and only when — a session is present, the header MAY
> replace its **conversion CTAs** with an **account affordance**. Only the two routes this change introduces
> are named here — the **canonical workspace entry** (today `/dashboard`) and the **sign-out endpoint** (today
> `POST /logout`); all other authenticated destinations are **owned by their workspace surface doc** (Doc-7F
> Buyer, Doc-7G Vendor) and bound by pointer, never restated as a literal route here:
>
> | Element | Anonymous (unchanged) | Authenticated |
> |---|---|---|
> | Primary CTAs | `Sign in` · `Get started` | **`Dashboard`** → the canonical workspace entry (today `/dashboard`, server-side) + a non-personal account menu |
> | `Request for Quotation` | → `/login` | → the buyer RFQ-creation entry (owned by Doc-7F) |
> | `Sell on iVendorz` | → `/login` | → the vendor workspace entry (owned by Doc-7G) |
>
> The account menu is **non-personal** — a neutral account glyph, rendering no name, email, or initials (see
> §12.3) — and links to the workspace entry and sign-out endpoint (POST). No org-switcher, no notification
> center, no active-org context is introduced (PR1 holds).
>
> **§12.3 No identity, no participation, no org data client-side (Inv #5, #11).** The affordance is derived
> from **session presence alone**. It MUST NOT fetch or render the user's name, email, **initials**,
> organization, participation, counts, or any org-scoped datum in the browser. **Workspace routing is not
> decided here:** every authenticated CTA points at an entry that **resolves and re-validates server-side**
> (the workspace entry resolves which workspace to open; that mapping is owned by the server routing layer,
> not by Doc-7D). A blacklisted/private status is never surfaced — nothing org-scoped is read (Inv #11 intact).
>
> **§12.4 Bounds (binding on any realization).**
> 1. Presence-only; no Doc-5 contract call from `(public)`.
> 2. Client-side only; no `(public)` route becomes dynamic; sitemap/metadata/SSR output unchanged (PR7).
> 3. Chrome swap only; **no page content** and no §4.1 read changes; Content ≠ Presentation (Inv #9).
> 4. Gates nothing — the affordance hides no permitted action and grants none; the server re-validates every
>    destination (Doc-7A §4.3 R7; consistent with the `[ESC-7G-A7R]` lens-≠-gate posture).
> 5. **Layout stability.** The anonymous and authenticated CTA regions SHOULD occupy **equivalent layout
>    space** (constant CTA-region width) so the post-hydration swap minimizes cumulative layout shift (CLS).
>    Any numeric CLS threshold is owned by the performance-budget authority (Doc-8), not coined here.
> 6. **Non-blocking transition.** The post-load header transition (anonymous → authenticated) is expected and
>    acceptable; it is navigation chrome, so realizations MUST NOT use a **blocking skeleton**, SHOULD render a
>    neutral placeholder to minimize flash, and MUST respect `prefers-reduced-motion`.
>
> **§12.5 PR5 relationship.** PR5 ("conversion CTAs route to the `(auth)` group; CTA gating = UX; no anonymous
> mutation") is **unchanged for anonymous visitors**. §12 governs only the **authenticated** presentation of
> the same header, and introduces **no** anonymous mutation.

## Conformance notes (for the freeze gate)

- **Coins nothing / reference-never-restate (§11):** binds only existing entities — the canonical browser
  auth client (today `createSupabaseBrowserClient`), `/dashboard` + `/logout` (companion non-frozen routes),
  and the buyer/vendor workspace entries owned by Doc-7F/7G (bound by pointer, not restated). No new
  contract/POLICY/route-as-API.
- **Invariants #5 / #9 / #11:** satisfied by §12.3–§12.4 — no client-supplied org id or active-org asserted
  from the browser (#5); page content untouched, only header presentation varies (#9); nothing org-scoped is
  read, so no private status can leak (#11).
- **Doc-7A Appendix A:** the applicable CTA/state checks (`CHK-7-011(CTA)`, state-matrix) extend to the new
  authenticated header state; §12 adds one presentation state, no new data band.
- **Red-Flag Checklist:** no new module, no ownership change, no governance-signal change, no cross-module DB
  access/FK, no ADR override, no frozen-doc in-place edit. (This file is a proposal, not an edit.)

## What ships regardless of this proposal (companion, non-frozen — already implemented)

These touch only `(auth)`/`(app)` (Doc-7E scope) and the app guard — **not** the frozen Public surface — and
are **not** gated on this patch:

- `app/(auth)/logout/route.ts` — real `POST /logout` → Supabase `signOut()` → `303 /login?signed_out=1`.
- `app/(app)/_components/shell/user-menu.tsx` — "Log out" is now a real POST form (was a dead `<Link>`).
- `app/(app)/dashboard/page.tsx` + `src/server/identity/active-org-lens.ts` — the `/dashboard` workspace-entry
  route; server-resolves the default lens (Buy for buyer/hybrid, Sell for vendor-only) via the existing
  `identity.get_organization.v1` participation flags. Never gates (`[ESC-7G-A7R]`).
- `app/(auth)/login/{actions,page}.tsx` — login redirects to `/dashboard`; `/login` bounces
  already-authenticated visitors to `/dashboard` and shows a signed-out confirmation on `?signed_out=1`.
- `app/(app)/(workspace)/buy/page.tsx` — the missing `/buy` index → `/buy/dashboard`.

---

*Non-authoritative until a human/Board approval and a human records action append §12 to Doc-7D and bump
v1.2 → v1.3. Prepared per CLAUDE.md §11 (additive-patch-only, Flag-and-Halt) + §13 (Raise ≠ Accept).*
