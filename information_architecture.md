# iVendorz — Information Architecture

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.2** — Information Architecture (non-authoritative companion to the Doc-7 program)
**Date:** 2026-06-29
**Wave:** 0C — Information Architecture
**Companion to:** [`design_philosophy.md`](design_philosophy.md) (tokens & visual vocabulary)
**Revision v0.2:** added Navigation Philosophy (§1.1), Quick Create (§4.9) and an AI Assistant entry
point (§4.10); elevated the command palette to the **Universal Command Center** (§5.2); renamed
*Mega menu → **Industrial Category Explorer*** and expanded it (§5.3); expanded Global search scope
(§5.1); added a taxonomy-independence rule (§5.3 / §8).

---

## 0. Precedence & Authority (read first)

This document is a **non-authoritative companion**. It describes how the product is *structured and
navigated* — it **coins no architecture, route, contract, permission, state, event, or domain
element**. It sits **below** the frozen Doc-7 program and conforms upward.

```
Master Architecture → ADR → Doc-2/Doc-3 → Doc-4A…4M → Doc-5A…5K → Doc-7A → {Doc-7B, Doc-7C, Doc-7D…7H} → Code
                                                                                          ▲
                                                              this document conforms to everything above
```

- **Doc-7C** (App Shell & Data Layer) owns the **authoritative** shell: route-group topology, the
  root-layout shell slots (navigation, org-switcher, notification center), the server-resolved
  active-org context, the server-side typed Doc-5 data layer, and the notification center. **This IA
  doc realizes the *navigable experience* within that shell; it never re-decides the shell.**
- **Doc-7D…7H** own the actual surfaces and bind every view to a frozen **Doc-5** contract.
- **Doc-7A** is the frontend metastandard; **Doc-7B** + [`design_philosophy.md`](design_philosophy.md)
  own design tokens and component vocabulary — this doc **references tokens by name, never redefines them**.
- **On any conflict, the frozen corpus wins and this document is corrected** (CLAUDE.md §7, §11).
  Frozen facts are bound **by pointer**. Where a needed contract/route/POLICY key is absent, this doc
  **flags `[ESC-7-API-*]` and halts — it never invents** (§10).

> **Scope of Wave 0C:** the navigation/shell/wayfinding **structure** and a **structural sitemap**
> (every page *section* has a defined place). The exhaustive page-by-page inventory (~120–180 pages)
> is **Wave 0F**, not here. This is a **specification, not code.**

---

## 1. Purpose & Scope

**Goal of Wave 0C:** define the complete structure of the product *before* polishing screens — so
that by the end, **every page has a defined place**, and every later wave (UX patterns, page
inventory, templates, screens) snaps onto a stable skeleton.

**Ownership split (no duplication):**

| Concern | Owner |
|---|---|
| Route topology, shell slots, active-org context, data layer, notification center | **Doc-7C** (frozen) — this doc *references* |
| Pages bound to contracts, per-surface views | **Doc-7D…7H** (frozen) — this doc *maps*, never invents |
| Design tokens, breakpoints, layout dimensions, component/template vocabulary | [`design_philosophy.md`](design_philosophy.md) — this doc *references by name* |
| **Navigation model, shell anatomy, wayfinding, responsive shell, surface sitemap** | **This document** |
| Exhaustive page enumeration | **Wave 0F** (deferred) |

**This doc owns:** the *mental model*, the *navigation derivation*, the *shell anatomy*, the
*wayfinding system* (Universal Command Center / search / Industrial Category Explorer / AI assistant /
breadcrumbs / notifications), the *responsive & mobile shell*, and the *surface sitemaps*.

### 1.1 Navigation Philosophy

Three principles guide every navigation decision in this product:

1. **Three-interaction reach** — a user should reach any destination in **≤ 3 interactions**
   (click / type / keystroke). The Universal Command Center (§5.2) is the escape hatch that
   guarantees it.
2. **Optimize the job, not the org chart** — navigation is organized around the procurement job —
   **Discover → Compare → Procure → Manage** — **not** around backend modules. (This binds to
   Doc-7A R1: route groups are partitioned by *actor / surface*, never by module.)
3. **Wayfinding is presentation** — search, explorer, palette, breadcrumbs, and AI are *ways to reach*
   contract-owned content; they never reshape, re-rank, or stand in for it (§8).

---

## 2. The Product Map

### 2.1 Route-group topology (bound to Doc-7C)

iVendorz is **four route-group areas**, partitioned by **actor + auth state** — not by backend module
(Doc-7C §2; Doc-7A R1; `repository_structure.md` §8).

```
app/
├─ (public)/   anonymous · no session · no active-org      → Surface D (Public)
├─ (auth)/     unauthenticated · login/signup/recovery      → Surface E (auth-entry leg)
├─ (app)/      session required · server-resolved active-org → Surfaces E (account) · F (Buyer) · G (Vendor)
└─ (admin)/    Staff session · NO active-org                 → Surface H (Admin)
```

> Route-group names are **routing vocabulary** (Doc-7C Pass-2 Appendix), not coined architecture.
> **You cannot hold a session while authenticating** — so `(auth)` is distinct from both `(public)`
> and `(app)` (Doc-7C §2.1).

### 2.2 The five surfaces

| Surface | Doc | Route group(s) | Who | Owns (navigably) |
|---|---|---|---|---|
| **D — Public** | Doc-7D | `(public)` | Anonymous | Marketplace discovery, vendor directory, public profiles/microsites |
| **E — Account & Identity** | Doc-7E | `(auth)` + `(app)` | All users | Login/signup; profile, org, members, roles, delegation, billing |
| **F — Buyer Workspace** | Doc-7F | `(app)` | Buyer / Hybrid | RFQ → quotation → compare → award → post-award; buyer-private CRM |
| **G — Vendor Workspace** | Doc-7G | `(app)` | Vendor / Hybrid | Profile/microsite, catalog, ads, invitations, quotations, leads, post-award |
| **H — Admin Console** | Doc-7H | `(admin)` | Staff | Moderation, bans, approvals, import, verification, outreach |

### 2.3 How the navigable surface set is selected (Doc-7C §4.3)

The shell composes navigation from two server-resolved signals — **never** from a client claim:

1. **Organization platform participation** — Buyer / Vendor / **Hybrid** / Staff (an org property).
2. **User org role** — Owner / Director / Manager / Officer.

- **Hybrid** participation mounts **Buyer (7F) *and* Vendor (7G) together under one active org** —
  one workspace, two legs (Invariant #2).
- **Staff** routes to **Admin (7H)** and is **not** part of the org-scoped tenant surface set.
- **Admin acts ON targets by ID, never AS an org** — the Admin area has **no active-org context**.

```
                 ┌─────────────────────────────────────────────┐
   sign in  ──▶  │  server resolves: session + active-org +     │
                 │  participation + role  (never client-trusted) │
                 └───────────────┬─────────────────────────────┘
                                 ▼
        participation = Buyer ─────▶ Buyer Workspace (7F)
        participation = Vendor ────▶ Vendor Workspace (7G)
        participation = Hybrid ────▶ Buyer (7F) + Vendor (7G), one org
        participation = Staff ─────▶ Admin Console (7H), no active-org
        (every user, any participation) ─▶ Account & Identity (7E)
```

---

## 3. Layout Hierarchy & App Shell Anatomy

### 3.1 Shell slots (owned by the root layout — Doc-7C §2.2)

> "The root layout owns the shell slots every authenticated surface mounts into: the **navigation**,
> the **org-switcher**, and the **notification center**. Surfaces fill the route-group; the shell owns
> the frame." (Doc-7C §2.2)

This doc designs the **presentation** of those slots; it does not change what the shell owns.

### 3.2 Shell composition by area

| Area | Chrome |
|---|---|
| **Public** | Marketing/top nav + **Industrial Category Explorer** (§5.3) + footer; SEO-first; no org-switcher, no notification center |
| **Auth-entry** | Minimal — centered card, brand mark, no nav (matches `design_philosophy.md` §6 Authentication template) |
| **App (Buyer/Vendor/Account)** | **Dashboard shell** (§3.3): topbar + sidebar + content; org-switcher + notifications present |
| **Admin** | Dashboard shell variant; **no org-switcher** (no active-org); staff identity in user menu |

### 3.3 Dashboard shell anatomy

Uses the layout tokens already defined in [`design_philosophy.md`](design_philosophy.md) §2.9 — this
doc composes them, never redefines them.

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOPBAR  (height --iv-topbar-height = 56px)                            │  z = --iv-z-sticky
│  [org-switcher] [+ Create ▾] [⌘K] [search]  [notifications] [user]      │
├───────────────┬──────────────────────────────────────────────────────┤
│ SIDEBAR       │  PAGE HEADER  (title · ref-mono · status · actions)   │
│ width         │ ──────────────────────────────────────────────────── │
│ --iv-sidebar- │                                                       │
│  width 264px  │  CONTENT  (max --iv-content-max 1440px,               │
│  / collapsed  │           capped at --iv-page-max 1600px on ultrawide)│
│  64px         │                                                       │
│ primary nav   │           [optional right rail — context/detail]      │
│ (grouped)     │                                                       │
├───────────────┴──────────────────────────────────────────────────────┤
│ FOOTER (app: minimal — legal/version; see §4.6)                       │
└──────────────────────────────────────────────────────────────────────┘
```

- **Content max:** `--iv-content-max` (1440px); ultrawide capped at `--iv-page-max` (1600px), extra
  space becomes margin (never over-stretched rows) — `design_philosophy.md` §3.2.
- **Grid:** 12-col default; 24-col for dense dashboards/comparison; 8-col for forms/settings
  (`design_philosophy.md` §2.10).

### 3.4 Server / Client boundary (Doc-7C §2.3, §5)

- **Layouts and the shell frame are Server Components by default.** Interactive shell controls
  (org-switcher trigger, notification dropdown, command palette, search box) are **explicit Client
  Components holding only ephemeral UI state.**
- All data flows through the **server-side typed Doc-5 client** — RSC reads / server-action writes;
  the browser never calls a Doc-5 contract directly and never sets the active-org header (Doc-7C §5).

---

## 4. Global Navigation System

### 4.1 Navigation derivation model

- Navigation items are **derived from the server-resolved participation + role** (§2.3) and gated by
  **permission/entitlement read via wired contracts — never by plan-name or permission-name string
  checks** (Invariant #10; Doc-7C §4.3). The nav gate is **UX over the server boundary**: hiding a
  link is convenience; the server re-validates every action regardless (Invariant #7).
- **Entitlement-gated** items (e.g. a feature a plan unlocks) read entitlements, never a plan name
  (Invariant #10 / M7 entitlement model).
- **Non-disclosure (Invariant #11):** navigation never exposes a link, count, or badge that would
  reveal an excluded/blacklisted/buyer-private signal (§8).

### 4.2 Header / Top nav

SILENT in Doc-7C → designed here. Left-to-right:

| Slot | Content | Binding / owner |
|---|---|---|
| Org-switcher | Active org + switch list | **Doc-7C-owned mechanism** (§4.8) |
| Quick Create | `+ Create ▾` menu of role-scoped actions | §4.9 |
| Universal Command Center | ⌘K trigger | §5.2 |
| Global search | Scoped search input | §5.1 |
| AI assistant | Advisory launcher (future activation) | §4.10 |
| Notifications | Bell + unread count | **Doc-7C slot**, M6 `Doc-5H` (§5.4) |
| User menu | Avatar → account/settings/logout | §4.7 |

- Public header is different: brand + marketplace nav + **Industrial Category Explorer** + sign-in CTA
  (no org-switcher / notifications).

### 4.3 Sidebar / Primary nav

- **Widths:** expanded `--iv-sidebar-width` (264px) · collapsed icon rail `--iv-sidebar-collapsed`
  (64px). Collapse state is a persisted presentation preference.
- **Structure:** grouped sections per surface (see §6 maps). Each item: icon (Lucide, `design_philosophy.md`
  §2.11) + label + optional count badge (count must be non-disclosure-safe).
- **Active state:** derived from the current route segment; one active item per group; visible focus
  ring (`design_philosophy.md` §4.2).
- **Hybrid orgs:** Buyer and Vendor groups both appear, clearly sectioned ("Procurement" / "Selling").

### 4.4 Secondary nav & Tabs

- **Secondary nav** — contextual sub-nav within a section (e.g. Billing → Plans / Usage / Invoices).
- **Tabs** — in-page section switching (presentation only; not routing-critical). Use for detail-page
  facets (e.g. RFQ → Overview / Quotations / Activity).

### 4.5 Breadcrumbs

- Hierarchical context on detail pages: `Section / List / Item`.
- Labels come from contract data (e.g. an RFQ's human ref `RFQ-2026-000123` as the leaf label) —
  **the URL still uses opaque IDs** (§8). Breadcrumbs must be **non-disclosure-safe**: never expose a
  parent the user may not see.

### 4.6 Footer

- **Public:** full marketing footer (categories, company, legal, locale) — SEO-relevant.
- **App/Admin:** minimal — legal links + build/version + support entry; never competes with the
  content area.

### 4.7 User menu

SILENT in Doc-7C → designed here. Distinct from the org-switcher (which changes tenant context).
Contents: account profile, security/2FA, preferences (theme toggle — `design_philosophy.md` §3.1),
help, **logout**. Account/identity management screens themselves live in **Surface E** (§6.2).

### 4.8 Org-switcher

- **Mechanism is Doc-7C-owned and non-trivial:** selecting an org calls `switch_active_organization`
  (`Doc-5C §C8`); the shell **re-resolves `get_active_context`, re-derives the navigable surface set,
  and re-renders** — it is **not** a header swap, and the new context is **server-re-validated before
  any tenant surface renders** (Doc-7C §4.1a, Patch C-2).
- This doc designs only its **presentation** (trigger, list of `list_my_organizations`, current-org
  indicator). Absent in Admin (no active-org).

### 4.9 Quick Create

A `+ Create ▾` affordance in the topbar gives power users one-keystroke access to the most common
create actions — **role-scoped and entitlement/permission-gated** (§4.1). Each item maps to a **wired
command**; it never invents an action:

| Action | Wired command | Surface | Note |
|---|---|---|---|
| New RFQ | `create_rfq` (Doc-5E §4) | Buyer | |
| Add Product | `create_product` (BC-MKT-3) | Vendor | |
| Create Advertisement | `create_advertisement` (BC-MKT-5) | Vendor | |
| Invite Team Member | `invite_member` (Doc-5C §C6) | Account | org members, **not** vendors |
| Upload Catalog | bulk product import | Vendor | ⚠ depends on the file-upload grant — `[ESC-7-API]` (§10) |

> **Not a Quick Action — *inviting a vendor to an RFQ*.** Vendor invitations are produced by the **M3
> matching/routing engine**, never issued directly by a buyer (Doc-7F surface boundary; R6). Quick
> Create never bypasses a governed flow.

### 4.10 AI Assistant entry point

AI is becoming a navigation method, so the shell reserves an **AI assistant** entry point accessible
from every authenticated page (and surfaced inside the Universal Command Center as **Ask AI**, §5.2).
It is the presentation entry to **M9's advisory** (`Doc-5K` — the frozen *non-recommending*
`ai-advisory-panel` embedded component, Doc-7B §5).

**Governance is load-bearing here:**
- **AI suggests; modules decide** (Invariant #12 / Golden Rule #6). The assistant may *draft* (e.g.
  pre-fill an RFQ) or *explain* (a spec, a status), but the **user confirms and the owning module
  commits** — every action routes through the same wired command + gating as Quick Create / the palette.
- **Non-recommending** — it **never** ranks vendors/quotations to a winner, auto-selects, or re-ranks
  governed M3 matching (R6; Doc-7A §6). "Compare vendors" via AI is decision *support* only.
- **Non-disclosure** — it never reveals an excluded / blacklisted / buyer-private signal (Invariant #11).
- **Future activation** — AI is future-activation in the stack (CLAUDE.md §2); this entry point is
  **reserved**. Any capability beyond M9's wired `Doc-5K` advisory (e.g. a global conversational
  navigator) is a contract gap → **`[ESC-7-AI]`**, escalated, never invented (§10).

Stated capabilities (all subject to the above): search · find suppliers · compare (support, not
ranking) · draft an RFQ · explain specifications · navigate · answer procurement questions.

---

## 5. Wayfinding & Discovery

### 5.1 Global search

Search is **context-aware**: the searchable entity set depends on the current surface, and **every
searchable type binds a wired read contract** — search never queries an entity that has no contract.

| Entity type | Wired read | Availability |
|---|---|---|
| Products | `search_catalog` (BC-MKT-6) | All surfaces |
| Vendors / Suppliers | `list_vendor_directory` / `search_catalog` (BC-MKT-6) | All surfaces |
| Categories | `list_categories` (BC-MKT-2) | Authed; **public = facets only** ⚠ `[ESC-7-API-CATNAV]` |
| RFQs | `list_rfqs` (Doc-5E §4) | Buyer |
| Quotations | `list_quotations_for_rfq` (Doc-5E §5, visibility-gated) | Buyer / Vendor |
| Orders / post-award docs | PO · challan · invoice · WCC reads (Doc-5F) | Buyer / Vendor |
| Cases / orgs | Admin reads (Doc-5J / Doc-5C) | Admin (staff scope) |
| Industries · Brands · Standards · Manufacturers | — | ⚠ **not modeled** in the frozen corpus — see §5.3 taxonomy note; support awaits a module-owned taxonomy contract, **never coined here** |

- **Engine:** Postgres FTS now; Meilisearch future (CLAUDE.md §2).
- **Content ≠ Presentation:** search ordering/filtering is **presentation over the contract result
  set** and **never re-ranks governed M3 matching** (Doc-7A §6). Results respect non-disclosure (§8).

### 5.2 Universal Command Center (⌘K)

SILENT in Doc-7C → designed here. The command hub — a keyboard-first launcher for power users
(procurement / SCM staff). It unifies four capabilities behind one shortcut:

- **Search** — delegates to context-aware search (§5.1).
- **Navigate** — jump to any nav-derivable destination (§4.1).
- **Run actions** — execute a wired command the user is entitled to (e.g. "Create RFQ"); shares the
  Quick Create command set (§4.9).
- **Ask AI** — hand off to the AI assistant (§4.10), under its full governance (suggests / decides,
  non-recommending, future activation).
- **Gating mirrors nav derivation** (§4.1) — the Command Center never offers a destination, command,
  or AI action the user isn't entitled to, and never reveals a non-disclosable entity (§8).
- Shortcut `⌘K` / `Ctrl-K`; client component; ephemeral state only.

### 5.3 Industrial Category Explorer — **public marketplace only**

The iVendorz answer to the consumer "mega menu," renamed to reflect industrial positioning. Scoped to
the **Public surface** category / industry navigation (Thomasnet / DirectIndustry class, but denser and
more technical). **Not used in the authenticated app shell** (the dashboard uses the sidebar). A
**competitive differentiator** — the entire taxonomy is explorable at a glance.

**Anatomy (target design):**
- **Four synchronized columns** — `Parent → Child → Child-2 → Child-3` — so the **entire taxonomy is
  visible simultaneously**, drilled by a **single hover** (no click-to-expand churn).
- **Category icons** (industrial glyph set — `design_philosophy.md` §10).
- **In-explorer search** to jump to any node.
- **Featured suppliers** and **product counts** per node; a **"View all"** affordance per column.
- Professional, dense, no consumer gimmicks (`design_philosophy.md` §1.3).

**⚠️ Contract gaps (the full design is partly blocked today):**
- **`[ESC-7-API-CATNAV]`** — `list_categories` has **no Public projection**, so the **full anonymous
  taxonomy tree cannot be built yet**. **Interim:** render **category facets surfaced by
  `search_catalog`** only.
- **Product counts** can use `search_catalog` facet aggregations; **featured suppliers** per node need
  a public vendor-by-category read — where absent, flagged under `[ESC-7-API-CATNAV]`.
- The complete tree depends on an additive **Doc-5D public-projection patch (Board)** — **never coined
  here** (§10).

#### Taxonomy independence (navigation may combine; data models stay separate)

Navigation surfaces several dimensions — **Category, Product, Vendor / Supplier** (corpus-backed:
M2-owned, Admin-governed categories) and potentially **Industry, Brand, Standard, Manufacturer**
(**not modeled** in the frozen corpus today). The IA rule: **navigation may *combine* these dimensions
for wayfinding, but they remain *independent taxonomies / data models* — the UI never couples them into
one model.** Introducing any new taxonomy (Industry / Brand / Standard / Manufacturer as first-class
data) is a **module-ownership / architecture decision, not an IA decision** — escalate (§10), never
coin here.

### 5.4 Notification center

- **Doc-7C-owned shell slot.** Renders **M6 `Doc-5H`** notification reads via the §3.4 server client;
  mark-read/dismiss are server actions to `mark_notification_read` / `archive_notification`.
- **Non-disclosure-bound:** it surfaces only what the wired M6 read discloses — never an
  excluded/protected signal (Doc-7C §6.3; `CHK-7-040`).
- **Realtime = transport:** a Supabase Realtime event prompts a **re-fetch** of the wired read; it is
  **never the source of truth** (Doc-7C §6.4). This doc designs placement/behavior only.

---

## 6. Per-Surface Navigation Maps (structural sitemap)

> **"Every page has a place."** Section-level sitemap; each leaf is **bound to its Doc-5 contract(s)
> by pointer**. Gaps are flagged `[ESC-7-API-*]`. **Exhaustive enumeration is Wave 0F** — these trees
> name *sections / page-groups*, not every individual screen, version, or modal.

### 6.1 Public — Surface D `(public)` (Doc-7D · Doc-5D public projection)

```
Public
├─ Home / Landing                          [marketing]
├─ Marketplace
│  ├─ Catalog Search                        ⇠ search_catalog (BC-MKT-6)
│  ├─ Vendor Directory                      ⇠ list_vendor_directory (BC-MKT-6)
│  └─ Category / Industry browse (explorer) ⚠ [ESC-7-API-CATNAV] — facets only (§5.3)
├─ Vendor Profile / Microsite              ⇠ get_public_vendor_profile (+ trust badge, Doc-5G)
│  └─ Product detail                        ⚠ [ESC-7-API-PRODDETAIL] — no public product page yet
├─ (Ads placements)                         ⚠ [ESC-7-API-ADS] — not rendered anonymously yet
└─ Conversion CTAs (claim · favorite · start RFQ · sign up) ──▶ (auth) / Surface E
```
> Public has **zero concept of buyer-private status** — a vendor blacklisted by one buyer still
> appears publicly (Invariant #11). Published-only; no draft leaks.

### 6.2 Account & Identity — Surface E `(auth)` + `(app)` (Doc-7E · Doc-5C / Doc-5I)

```
Auth-entry  (auth)                          [unauthenticated]
├─ Login                                    ⇠ Supabase Auth
├─ Signup                                   ⇠ Supabase Auth + create_organization (§C5)
├─ Password recovery                        ⇠ Supabase Auth
└─ Invitation join                          ⇠ accept_invitation (§C6)

Account  (app)                              [authenticated, org-scoped]
├─ User profile & security                  ⇠ update_user_profile, update_user_2fa_settings (§C4)
├─ Organization                             ⇠ update_organization_profile, transfer_ownership (§C5)
├─ Members                                  ⇠ invite_member, set_membership_status, remove_member (§C6)
├─ Roles & permissions                      ⇠ create_role, set_role_permissions, list_permissions (§C7)
├─ Delegation grants                        ⇠ create/suspend/revoke_delegation_grant (§C9)
├─ Settings                                 ⇠ upsert_buyer_profile, update_workflow_settings (§C10/11)
└─ Billing
   ├─ Plans                                 ⇠ get_plan, list_plans (BC-BILL-1, read)
   ├─ Subscription                          ⇠ purchase/cancel_subscription, get_subscription (BC-BILL-2)
   ├─ Usage & quota                         ⇠ get_usage
   ├─ Lead credits                          ⇠ get_lead_balance, list_lead_transactions (BC-BILL-4)
   ├─ Platform invoices                     ⇠ get/list_platform_invoice (platform-fee only)
   └─ Rewards                               ⇠ get_reward_balance, list_referrals
```
> Org-switcher is **Doc-7C**, not a page here (§4.8). `activate_plan` is **Admin-only** (Surface H),
> never here.

### 6.3 Buyer Workspace — Surface F `(app)` (Doc-7F · Doc-5E / Doc-5F)

```
Procurement
├─ Discover vendors                         ⇠ search_catalog, list_vendor_directory (Doc-5D)
├─ Favorites                                ⇠ add/remove/list_catalog_favorites (BC-MKT-7)
├─ RFQs
│  ├─ Author / draft                        ⇠ create_rfq, update_rfq (Doc-5E §4)
│  ├─ Internal approval                     ⇠ approve_rfq, reject_internal_rfq (§4)
│  ├─ Submit / lifecycle                    ⇠ submit_rfq, cancel_rfq, reissue_rfq (§4)
│  ├─ RFQ detail (+ versions)               ⇠ get_rfq, get_rfq_version, list_rfqs (§4)
│  └─ Routing observability                 ⇠ get_routing_log, list_invitations (§7 caller read)
├─ Quotations
│  ├─ Received quotations                   ⇠ get_quotation, list_quotations_for_rfq (§5, visibility-gated)
│  ├─ Compare & decide                      ⇠ get_comparison_statement (read-only, System-generated)
│  ├─ Clarifications                        ⇠ manage_clarification (+ M6 thread)
│  ├─ Shortlist                             ⇠ shortlist_quotation (§6)
│  ├─ Award (explicit, unranked)            ⇠ award_rfq (§6 — deliberate buyer choice)
│  └─ Close lost                            ⇠ close_lost_rfq (§6)
├─ Post-award ops                           ⇠ issue_po, record/confirm_payment, get_challan/invoice/wcc,
│                                              approve_trade_invoice (Doc-5F buyer-leg)
└─ Vendor CRM  (buyer-private)              ⇠ get/update_crm_status, add_crm_note, set_approved/blacklist
                                              (BC-OPS-1 — own-org, NEVER leaks · Invariant #11)
```
> **Moat constraints (load-bearing):** no AI/UI/comparison **recommends, ranks-to-winner, or
> auto-selects** (R6); payment/entitlement **never** influences matching/selection display (R7); the
> platform **records** post-award docs, never settles money (R8). The comparison view is decision
> *support*, never a re-rank of M3.

### 6.4 Vendor Workspace — Surface G `(app)` (Doc-7G · Doc-5D / Doc-5E / Doc-5F / Doc-5G)

```
Profile & Presence
├─ Vendor profile                           ⇠ create/claim/update_vendor_profile, upsert_capacity,
│                                              set_declared_financial_tier (BC-MKT-1)
├─ Microsite (draft / published)            ⇠ publish_* / unpublish_* (BC-MKT-4 — no draft leaks)
├─ Catalog & products (versioned)           ⇠ create/update_product, set_product_status, link_spec,
│                                              spec library, spec documents (BC-MKT-3)
├─ Categories                               ⇠ assign/update/remove_category_assignment (BC-MKT-2, Admin-governed)
└─ Advertising                              ⇠ create/submit_advertisement, set_advertisement_state (BC-MKT-5)

Engagement
├─ Invitations inbox  (received-only)       ⇠ get_invitation, list_invitations, respond_to_invitation (§5)
├─ Quotations (versioned)                   ⇠ submit/revise/withdraw_quotation, request_late_extension (§5)
├─ Leads  (System-created on invitation)    ⇠ update_lead_stage, add_lead_activity (BC-OPS-3, received-only)
├─ Post-award                               ⇠ issue_trade_invoice, upload_delivery_challan, record_delivery
└─ Trust & performance  (read-only)         ⇠ get_trust_score, get_performance_score, get_verified_tier (Doc-5G)
```
> **Byte-equivalence (Invariant #11 / `CHK-7-040`, load-bearing):** a blacklisted/excluded vendor's
> experience is byte-identical to a non-matched vendor's. **No surface, view, count, analytic,
> notification, or error reveals exclusion/blacklist.** Win-rate denominator = *received invitations*,
> never all-matchable RFQs. Vendor never sees buyer CRM, exclusion reason, or count of
> RFQs-not-invited-to.

### 6.5 Admin Console — Surface H `(admin)` (Doc-7H · Doc-5J + cross-module Admin legs)

```
Governance
├─ Moderation                               ⇠ create/assign/decide_moderation_case (BC-ADM-1)
├─ Bans & enforcement                       ⇠ issue_ban, lift_ban (BC-ADM-2)
├─ Vendor / category approval               ⇠ set_vendor_profile_status, create/update_category, set_category_status (Doc-5D)
├─ Ad review                                ⇠ review_advertisement (Doc-5D)
└─ Verification workflow                    ⇠ queue/assign/decide_verification_task (BC-ADM-5 → M5)

Operations
├─ Import jobs                              ⇠ submit_import_job (BC-ADM-4; processing is System out-of-wire)
├─ Outreach campaigns                       ⇠ create/run/complete_outreach_campaign (BC-ADM-6)
├─ Routing rules                            ⇠ assist_routing, manage_routing_rule (Doc-5E, Stage-gated)
├─ Plan management                          ⇠ create/update/retire_plan, activate_plan, entitlements (Doc-5I)
└─ Identity ops                             ⇠ suspend/reinstate_organization|user, recover_ownership (Doc-5C)

Staff tools  (non-disclosure)
└─ Suggestion & link triage                 ⇠ decide_category_suggestion, confirm/dismiss_link_suggestion (BC-ADM-3)
```
> **Admin-decides / owning-module-owns (R5):** the console **invokes** wired Admin commands; the
> owning module owns the data/decision/effect. Admin **never** writes Trust/Performance/Tier scores
> (firewall), **never** makes matching/award decisions, and **never** bypasses a module's domain. No
> active-org — acts ON targets by ID.

---

## 7. Responsive Behavior & Mobile Navigation

Uses the **mobile-first** strategy and breakpoints from [`design_philosophy.md`](design_philosophy.md)
§3.2 / §2.8 (`xs` 480 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536 · `3xl` 1920).
Desktop (`xl`) is the **primary usage target** for dashboards; nothing breaks below it.

### 7.1 Shell behavior per tier

| Tier | Sidebar | Topbar | Content |
|---|---|---|---|
| **Mobile** `< sm` | Off-canvas **drawer** (hamburger) | Compact: logo · search icon · ⌘K · bell · avatar | Single column; tables → stacked cards or `--iv-table-min` h-scroll; primary action pinned |
| **Large mobile** `sm–md` | Drawer | Compact | Single/two column |
| **Tablet** `md–lg` | **Icon rail** (`--iv-sidebar-collapsed`), expandable | Full | Two-pane where useful |
| **Laptop** `lg–xl` | Full sidebar (`--iv-sidebar-width`) | Full | Multi-column |
| **Desktop** `xl–2xl` | Full sidebar | Full | **Primary target** — full density, right rail, comparison |
| **Ultrawide** `≥ 3xl` | Full sidebar | Full | Content capped at `--iv-page-max` (1600px); excess → margin |

### 7.2 Sidebar progression

`Full (264px) → Icon rail (64px) → Off-canvas drawer` as viewport narrows; user can also manually
collapse on wide screens (persisted preference).

### 7.3 Mobile navigation

- **Drawer** for primary nav (full section tree); closes on navigate.
- **Topbar** keeps search, ⌘K (where keyboards exist), notifications, user menu.
- **Org-switcher** moves into the drawer header on mobile.
- Touch targets and focus order meet the a11y baseline (`design_philosophy.md` §11; Doc-7B §7.1).

---

## 8. Cross-cutting IA Rules

1. **Active-org is server-resolved, never client-trusted** — carried as `Iv-Active-Organization`;
   the browser never sets it (Invariant #5; Doc-7C §4.1).
2. **Nav/palette/search gating reads wired contracts, not name-strings** — entitlements/permissions
   by reference (Invariant #10); the server re-validates every action (Invariant #7).
3. **Non-disclosure / byte-equivalence everywhere** — no link, count, badge, breadcrumb, search
   result, palette entry, or notification reveals an excluded / blacklisted / buyer-private signal
   (Invariant #11; `CHK-7-040`). Not-found is byte-identical to genuine absence.
4. **Content ≠ Presentation** — search/sort/filter is presentation over the contract result set and
   **never re-ranks governed M3 matching** (Doc-7A §6; Golden Rule #4).
5. **Every page binds a frozen Doc-5 contract** — pages without a binding are gaps, flagged
   `[ESC-7-API-*]` (§10), never invented.
6. **Deep-linking uses opaque IDs** — URLs carry UUIDs, not human refs (`RFQ-2026-000123` is a
   *display* label, not a URL segment); quotation visibility is **server-gated**, never a client 404.
7. **Data layer** — RSC reads / server-action writes; **cursor pagination** (`page_size` from the
   `*.list_page_size_max` POLICY key, opaque `cursor`); **offset / page-number forbidden** (Doc-7C §5).
8. **Shell owns no authoritative state** — only ephemeral view state + a disposable, re-fetchable
   cache (Doc-7C §8).
9. **Taxonomy independence** — Category, Product, Vendor / Supplier (and any future Industry / Brand /
   Standard / Manufacturer) are **independent taxonomies**; navigation composes them for wayfinding but
   never couples them into one data model, and never coins a taxonomy absent from the corpus (§5.3).
10. **AI suggests; modules decide** — every AI navigation / action path only drafts or explains; the
    user confirms and the owning module commits; AI never recommends-to-winner, auto-selects, or
    re-ranks M3 (Invariant #12 / Golden Rule #6; R6) (§4.10).

---

## 9. Handoff to Next Waves

| Wave | Builds on this IA |
|---|---|
| **0D — UX Patterns** | Realizes the flows referenced in §6 (search, filter, sort, pagination, comparison, RFQ/quotation/award, upload, wizard, approval, notifications, error/loading/empty) as reusable patterns over this shell |
| **0E — Marketplace UX** | Buyer/Vendor/Guest/Admin journeys across the §2 surfaces and §6 sitemaps |
| **0F — Page Inventory** | Exhaustive page-by-page enumeration (~120–180), each slotted into a §6 section and bound to a contract |
| **0G — Templates** | Page templates (`design_philosophy.md` §6) instantiated per §6 section type |
| **0H — Screen Design** | Actual screens, consistent because they inherit §3 shell + §4 nav + §6 placement |

---

## 10. Governance Alignment & Precedence

Constraints honored **by pointer** (reference-never-restate):

| Constraint | Source | Where honored |
|---|---|---|
| 4-group route topology (`public/auth/app/admin`) | Doc-7C §2 | §2.1 |
| Root layout owns nav · org-switcher · notification center | Doc-7C §2.2 | §3.1, §4, §5.4 |
| Active-org server-resolved, never client-trusted | Invariant #5 / Doc-7C §4.1 | §2.3, §4.8, §8 |
| Org-switch = full context re-resolution | Doc-7C §4.1a | §4.8 |
| Nav gating via wired contracts, not name-strings | Invariant #10 / Doc-7C §4.3 | §4.1, §5.2, §8 |
| Notification center M6-owned, non-disclosure, Realtime=transport | Doc-7C §6 / `Doc-5H` | §5.4 |
| Byte-equivalence / non-disclosure | Invariant #11 / `CHK-7-040` | §6.3, §6.4, §8 |
| Content ≠ Presentation; no M3 re-rank | Golden Rule #4 / Doc-7A §6 | §5.1, §6.3, §8 |
| Data layer: RSC/server actions, cursor pagination | Doc-7C §5 | §3.4, §8 |
| State-machine-driven UI (Doc-4M transitions only) | Doc-7A §7 / Doc-4M | §6.3 (RFQ lifecycle) |
| Admin-decides / owning-module-owns; score firewall | Golden Rule #2/#3 (R5) | §6.5 |
| Hybrid = Buyer+Vendor one org; Staff→Admin; Admin no active-org | Doc-7C §4 | §2.3, §6.5 |
| AI suggests; modules decide (non-recommending; future activation) | Invariant #12 / Golden Rule #6 / `Doc-5K` | §4.10, §5.2, §8 |
| Taxonomy independence (navigation composes, never couples / coins) | Doc-7A R1 / module ownership | §5.1, §5.3, §8 |

### `[ESC-7-API-*]` register (gaps flagged, never coined)

| Tag | Gap | Interim |
|---|---|---|
| `[ESC-7-API-CATNAV]` | `list_categories` has no Public projection → public Industrial Category Explorer tree (+ featured suppliers / full counts) blocked | Explorer renders `search_catalog` facets only (§5.3) |
| `[ESC-7-AI]` | A global conversational AI navigator beyond M9's wired `Doc-5K` advisory is absent from the frozen surface | AI entry point reserved; limited to `Doc-5K` advisory until an additive patch (Board) (§4.10) |
| `[ESC-7-API-PRODDETAIL]` | `get_product` is User-only → no anonymous product page | Products render from `search_catalog` results (§6.1) |
| `[ESC-7-API-ADS]` | ad reads are User-only → no anonymous ads | Ads not rendered on Public (§6.1) |
| `[ESC-7-API]` (file-upload grant) | No client-facing upload-grant contract in the wired surface | Uploads await an additive Doc-5x/Doc-4B patch (Board) |

Each is an **additive Doc-5x patch (Board) decision** — resolved via the named channel, **never
locally** (Doc-7C §0.3; CLAUDE.md §11).

---

*This document is non-authoritative. It describes the product's information architecture and
navigation structure. It operates under the frozen corpus authority order (CLAUDE.md §7) and the Doc-7
precedence chain (§0); it introduces no architecture change and coins no route, contract, or
permission. On any conflict, the frozen document wins and this file is patched to match.*
