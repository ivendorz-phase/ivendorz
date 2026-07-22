# Public Pages — Signed-in State (Prototype v0.1)

**Stage-3 clickable prototype · NON-AUTHORITATIVE.** Coins nothing. No production code changed.

```bash
npm run prototype public-authed-shell     # → http://localhost:8080
```

## What this is for

The `(public)` shell is anonymous by construction today — `site-header.tsx` reads no session at all,
and every conversion CTA on every public page hard-codes `href="/login"`. This prototype shows what
those surfaces look like **when the visitor is already signed in**, so the question can be ruled on
against an artifact instead of prose.

> **The session-aware public header is a Doc-7D proposal AWAITING AN OWNER RULING**
> (see the `auth-surfaces-subset-and-doc7d-header-proposal` record). This prototype is the artifact
> for that ruling — it is not the ruling, and nothing in it has been built into `app/(public)`.

## Scope (owner-selected, 2026-07-22)

| Axis | Selection |
|---|---|
| Pages | **All public pages** — every `app/(public)` route, 28 entries |
| Delta | **Shell + CTA only** — no personalization, no buyer/vendor role lens |

Page bodies are deliberately skeletal. They are byte-identical between the two states, so rendering
them at full fidelity would add noise rather than signal; the shell and the conversion CTAs are the
entire subject.

## The delta, in full

**Shell — the same three slots on every page, and nothing else:**

| Slot | Anonymous | Signed in |
|---|---|---|
| Row 1 right | `Sign in` · `Get started` | `Go to dashboard` + account menu (name · org · Dashboard / Buying / Selling / Account / Sign out) |
| Row 2 · Sell on iVendorz | → `/login` | → `/sell` *(open question — see below)* |
| Row 2 · Request for Quotation | → `/login` | → `/buy/rfqs/new` |

Search, the Category Explorer, row-2 nav, and the entire footer are **unchanged**. So is the mobile
sheet apart from its auth block.

**Page CTAs** — every `/login` link in `app/(public)` is inventoried in the prototype's route table
and shown in both forms. The load-bearing ones: landing hero + CTA band, `for-buyers` /
`for-vendors` / `about` / `how-it-works` / `pricing` "Get started", product-detail "Request quote",
microsite "Request quote" + "Save", microsite contact "Sign in to view", `/forbidden` recovery,
`/invite/welcome` accept.

## What is deliberately ABSENT

- **No buyer-private signal anywhere.** No "in your vendor directory", no approved/blacklisted
  marker on a microsite. Buyer Vendor Status is M4-private and Invariant 11 makes private exclusion
  undetectable — surfacing it publicly would leak it.
- **No org switcher, no notification center.** Those are authenticated *shell* slots (Doc-7C §4/§6);
  the public shell is not the app shell.
- **No statistics, no counts, no fabricated figures** on any public surface.
- **No role lens.** Public pages do not branch on Buyer/Vendor/Hybrid in this pass.

## Open questions carried to the ruling

Each is surfaced in-prototype on its own page (right-hand panel). Summarized:

1. **Microsite contact** — signing in must **not** unmask phone/email. Contact is platform-mediated
   by design and no contract returns raw vendor contact details to an authenticated buyer. The
   prototype shows a *mediated request*. A true reveal is a new M2 read plus a lead-model change.
2. **Pricing CTA** — "Get started" does not survive a session. Honest authed CTA is
   `Choose plan` / `Manage plan` into billing, but which one depends on an M7 entitlement read this
   pass does not do. Prototype shows the neutral `Choose plan`.
3. **Sell on iVendorz destination** — `/sell` is role-dependent, and role lens is out of scope. Its
   anonymous destination is also already an escalated item in `site-header.tsx`
   (the `/for-vendors` revert). Both should be ruled together.
4. **Save / favourite** — currently `saved={false}` + `href="/login"`. Enabling the action needs an
   M2 favorites read, which is personalization. Recommendation: enable the action, keep the rendered
   state `false` until the read exists.
5. **`/invite/welcome`** — the one public page where the *wrong* identity is likely. Authed CTA
   names who is being continued as and offers "Use a different account", which needs a real
   destination before it ships.
6. **`/forbidden`** — offering "Sign in" to a signed-in user loops them through a step they already
   completed. Authed recovery target is the dashboard, and the copy must say so.
7. **`/maintenance`** — arguably should not render the account menu at all. Flagged, not decided.

## Reviewing it

- **Visitor** toggle (Anonymous ⇄ Signed in) — the whole point; flip it on any page.
- **Page** picker — all 28 routes, grouped.
- **Mark deltas** — dashed markers on exactly what changed. Turn off to read the UI clean.
- **Preview mode** — hides all review chrome for a production-like look.
- In-prototype links navigate where a route exists.

Signed-in identity (`Rezaul Karim` · `Meghna Textile Mills Ltd.`) is illustrative seed data per
prototype convention.
