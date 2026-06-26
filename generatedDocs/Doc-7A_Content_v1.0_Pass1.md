# Doc-7A — Frontend Realization Metastandard — **Content Pass-1 (§0–§4)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-1 (DRAFT)** — realizes §0–§4 of `Doc-7A_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short re-review → Content Pass-2 (§5–§9) |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7A_Structure_v1.0_FROZEN` §0–§4; R-set R1–R12 (R1/R2/R3 framing · R6/R7 in §4) |
| Authority | Frozen corpus governs; `Doc-5_Program_Governance_Note_v1.0 §1/§3/§8 (rule 5)`. Doc-4M/Doc-2 = conform (upstream); frozen Doc-5 surface = consistency (sibling) |
| Posture | Reference-never-restate. Every architectural fact bound by pointer; nothing copied/invented. Mechanism only — **no JSX, no component code, no route files, no screens** |
| Coins | **Nothing.** No module, contract, route, field, permission slug, entitlement key, state, event, audit action, or POLICY key |

> **Scope of this pass:** the cross-cutting *foundation* conventions — document control & precedence (§0), program scope & partition (§1), the realization stack & authority binding (§2), composition/routing conventions (§3), and the active-org/authorization model (§4). §5–§12 (data-binding, Content≠Presentation, state-machine UI, non-disclosure, AI advisory, baseline, out-of-frontend, conformance) land in Pass-2/Pass-3.

---

## §0 — Document Control, Precedence & Consistency Obligation

### §0.1 Precedence chain (binding)
Doc-7A sits in the Implementation Contract layer of the source-of-truth hierarchy (`Doc-5 Governance Note §3`), beside Doc-6, below Doc-4/Doc-5:

```
Master System Architecture (CANONICAL)
  └─ ADR Compendium
       └─ Doc-2 · Doc-3
            └─ Doc-4A (API metastandard) → Doc-4B…4M
                 └─ Doc-5A (API realization) → Doc-5B…5K        (frozen API surface)
                      └─ Doc-7A (this) → Doc-7B…7H              (frontend realization)
                           └─ Code
```

On any conflict, the higher document wins and Doc-7 is corrected — never the reverse (`Doc-5 Governance Note §3` consequence 1). Doc-7 introduces nothing architectural (§Program note, structure).

### §0.2 The realize-never-redecide rule
Doc-5 fixed *what* the API surface is; Doc-4M fixed *what* the lifecycles are; Doc-2 fixed *what* the tenancy/permission/currency rules are — all FROZEN. Doc-7 realizes only *how* those become composed, navigable UI on Next.js App Router (structure R2). The only *new* decisions Doc-7 makes are physical UI choices (component tree, layout, interaction/visual design, optimistic-update strategy); these **MUST NOT** change domain meaning or invent a contract/state/permission.

### §0.3 The consistency obligation (not conformance) — two forces, distinguished
Two upstream inputs bind Doc-7, with **different force** (structure R2, clause C-6):

- **Conformance (upstream / rank-0 frozen architecture):** Doc-7 **conforms to** Doc-4M (authoritative lifecycle/state authority) and Doc-2 (tenancy/permission/currency). These are strictly above Doc-7 in the precedence chain; a Doc-7 surface that contradicts them fails review.
- **Consistency (sibling / Implementation-Contract layer):** Doc-7 must be **consistent with** the frozen Doc-5 API surface — every screen read/write/list is served by a frozen Doc-5x contract — but **Doc-5A holds no conformance authority over Doc-7** (`Doc-5 Governance Note §8 rule 5`). Doc-5 is a peer program; consistency is a cross-check, not a conformance gate.

The distinction is load-bearing: *conform to Doc-4M/Doc-2; stay consistent with the Doc-5 contract surface.*

### §0.4 Flag-and-halt
Where a surface need is not served by the frozen corpus (a missing contract/field, an unregistered POLICY key, an embedded-component allocation), Doc-7 **halts and escalates** via the named channel — never invents, never resolves locally (`Doc-5 Governance Note §7`). Markers: `[ESC-7-API]` (additive Doc-5x patch, Board, human-approved), `[ESC-7-POLICY]` (additive `Doc-3 §12.2` patch), `[ESC-7-DESIGN]` (per-surface allocation).

### §0.5 The two freeze obligations every per-surface document inherits
1. **Pass Appendix A** (`CHK-7-xxx`) — the per-surface conformance checklist (structure Appendix A; check IDs assigned in Pass-3).
2. **Clear every carried `[ESC-7-*]`** via its named additive channel (human-approved) before freeze — never locally (`Doc-5 Governance Note §8 rules 1, 3`).

---

## §1 — Scope, Audience & the Doc-7 Program Partition

### §1.1 What Doc-7A governs (and does not)
Doc-7A governs the **cross-cutting frontend realization conventions** (§3–§11) and the **per-surface freeze gate** (Appendix A). It **authors no surface**: every actual component, route, layout, and screen is realized in Doc-7B…7H against these conventions (structure §1). Doc-7A is to Doc-7B…7H what Doc-5A is to Doc-5B…5K and Doc-6A is to Doc-6B…6K.

### §1.2 Program partition (surface-based) — carried by pointer
The partition is **by frontend surface/actor**, not by backend module (structure R1): the UI is composed by deployable surface/route-group (mapping to the Doc-5 tri-actor model Public / User / Admin), and a single route renders content from many modules. The surface map and the cross-surface embedded-component allocation table are fixed in `Doc-7A_Structure_v1.0_FROZEN` (Program partition) and **not restated here**; this pass binds them by pointer. Two facts are load-bearing and re-asserted:

- **DR-7-SHELL:** Doc-7B (Design System) and Doc-7C (App Shell & Data Layer) are cross-cutting and **freeze before** the surfaces (Doc-7D…7H) that consume them; surfaces reference the kit/shell by pointer, never re-author them.
- **No module's UI is orphaned:** M5 (trust badge), M6 (notification center + thread), M7 (billing indicator), M9 (AI panel) each have a single **defining document** in the structure's allocation table; surfaces compose, never re-implement; the **contract owner is the module (`Doc-5x`) regardless of where the component renders**.

### §1.3 Dependency boundary
Doc-7A realizes Doc-5/Doc-4M/Doc-2 conventions; each Doc-7x realizes **only its own surface**. A surface document never realizes another surface's screens, never re-authors a shared embedded component, and never invokes a contract outside its declared Doc-5 sources without a cross-check. Cross-surface concerns (notification center, org-switcher, trust badges) live in their single defining document (Doc-7B/7C) and are composed downstream.

### §1.4 Carried-dependency register (by pointer)
`DR-7-SHELL` · `DR-7-API` (Doc-5 consumability cross-check) · `DR-7-STATE` (Doc-4M drives lifecycle UI) · `[ESC-7-API]` · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]` — defined in `Doc-7A_Structure_v1.0_FROZEN` (Open carried items); resolved only via named channels, never in a content pass.

### §1.5 Audience
Architecture Board · Enterprise/DDD/Security Architect · UX/Design lead · Doc-7 content authors (human + AI) · AI Coding Supervisor · frontend engineering, QA.

---

## §2 — Frontend Realization Stack & Authority Binding

### §2.1 The presentation transport (fixed — not re-decided)
Doc-7 realizes the already-decided Master-Architecture frontend stack (CLAUDE.md §2; structure R3):

| Concern | Realization |
|---|---|
| Framework | **Next.js 15 App Router** |
| View library | **React** (Server Components default; Client Components only where interaction requires) |
| Styling | **Tailwind** (utility-first; tokens/theme in Doc-7B) |
| Component kit | **shadcn/ui** (primitives → app components → surface composition; boundary realized in Doc-7B) |
| Write path | **Server actions / route handlers** to the frozen Doc-5 contracts |
| Async/jobs surfaced | Inngest-driven outbox effects are surfaced as state changes via contracts (never invoked from the client) |

Exact version pins live in `package.json` once code exists (CLAUDE.md §2). Doc-7 **coins or re-decides no stack element**.

### §2.2 Server-Component-default posture
The default rendering unit is a **React Server Component** that fetches frozen Doc-5 read/list contracts server-side. **Client Components** are introduced only where interaction requires (forms, optimistic UI, local interactivity), and they invoke mutations through **server actions** that call the frozen Doc-5 command contracts — never a direct client→database or client→cross-module path. This posture is the realization vehicle for R6 (server-resolved context), R7 (server re-validation), and R12 (no authoritative client state); the per-convention detail is §3–§5.

### §2.3 Authority binding (restated operationally)
- **The *what* (binding, conform):** the frozen Doc-5 contract surface (which reads/writes/lists exist) + Doc-4M (which states/transitions exist) + Doc-2 (tenancy/permission/currency).
- **The *how* (this program):** composition, routing, data-binding, presentation, state-machine UI, non-disclosure, AI-advisory, baseline, out-of-frontend boundary.
- **Consistency cross-check (not conformance):** Doc-5A (`Doc-5 Governance Note §8 rule 5`).

Physical UI choices never change domain meaning (R2). Where a *what* is missing, flag-and-halt (§0.4).

---

## §3 — Cross-Cutting Composition & Routing Conventions *(mechanism only — authors no surface)*

### §3.1 Canonical terminology
To remove ambiguity across Doc-7B…7H (structure C-7):

| Term | Meaning |
|---|---|
| **surface** | a deployable route-group / actor app (e.g. Buyer Workspace) — one per Doc-7D…7H |
| **route** | a Next.js App Router segment (a path) |
| **view** *(= screen)* | a rendered page within a surface ("screen" is an admitted synonym of "view") |
| **component** | a presentation unit from the kit (Doc-7B) |
| **shell slot** | an App-Shell-provided mount point (Doc-7C) into which a surface or shared embedded component renders |

### §3.2 Route-group topology
The App Router route-group topology **maps to the surface partition** (R1): each surface (Doc-7D…7H) is realized as a route-group; the App Shell (Doc-7C) owns the root layout + the shell slots (navigation, org-switcher, notification center) every authenticated surface mounts into. The Public surface (Doc-7D) is the anonymous route-group; the authenticated surfaces (7E–7H) mount inside the App-Shell-resolved session + active-org boundary (§4). **The exact route-group names and segment tree are realized in Doc-7C**, not here.

### §3.3 Server / Client boundary
- **Server Components** are the default and own all data fetching of frozen Doc-5 read/list contracts.
- **Client Components** are the exception, introduced only where interaction requires; they hold ephemeral view/interaction state only (R12) and never fetch authoritative data directly — they invoke server actions.
- A Client Component never receives a secret, a service credential, or an internal-service (out-of-wire) contract; only wired, caller-facing contract results cross to the client.

### §3.4 Write path: server actions / route handlers
Every mutation is a **server action** (or route handler) that calls a frozen Doc-5 command contract. The client triggers the action; the server performs validation, authorization re-check (§4), idempotency, and the contract call. No mutation bypasses a contract; no business write originates client-side (R12; consistency with the frozen Doc-5 command surface — detail in §5).

### §3.5 Loading / error / streaming
Realize the App Router conventions every surface inherits: route-segment **loading** boundaries (suspense) for streamed RSC reads; route-segment **error** boundaries mapping the `Doc-5A §6.2` error taxonomy to user-facing states (no invented error class — detail in §5); **not-found** boundaries for absent or non-disclosed resources (the non-disclosed case renders identically to genuine absence — non-disclosure detail in §8). Streaming/suspense is a performance convention (baseline detail in §10).

### §3.6 What §3 does not do
§3 instantiates **no route and no view** — the route-group tree, layouts, and shell slots are realized in Doc-7C; per-surface views in Doc-7D…7H. §3 is the convention layer they conform to.

---

## §4 — Active-Org Context & App-Layer Authorization Realization *(mechanism only — authors no surface)*

### §4.1 Active-organization context — server-resolved, never client-trusted (R6)
Every **authenticated** surface operates inside a server-resolved **active organization** context. The realization binds to the frozen Doc-5C surface by pointer:

- The active org is carried as the **`Iv-Active-Organization` context header** and is **server-validated, never client-trusted** (`Doc-5C R2`; `Doc-4A §5.3`; `Doc-5A §7`; CLAUDE.md §5). A client-supplied org ID is never authoritative.
- The App Shell (Doc-7C) resolves the current context via **`get_active_context`** and lists switchable orgs via **`list_my_organizations`** (`Doc-5C §C8`); the **org-switcher control** invokes **`switch_active_organization`** (`Doc-5C §C8`).
- **Ownership seam (structure C-2):** the App Shell (Doc-7C) owns the active-org **context boundary + switcher mechanism + session**; the Account/Identity shell (Doc-7E) owns the **management screens** (membership/role/delegation administration via `Doc-5C §C6`; account/subscription/invoice via `Doc-5I`). **No `Doc-5C` contract is realized by both documents.**

### §4.2 Hybrid participation — a surface is a capability, not an exclusive app (R6)
One user, under one active org, may mount **both** the Buyer (Doc-7F) and Vendor (Doc-7G) workspaces simultaneously where the organization's Platform Participation is **Hybrid** (Invariant #2; Master Architecture — one org may be Buyer, Vendor, or Hybrid). The App Shell composes the **navigable surface set** from the org's platform participation + the user's org role — it does not partition users into mutually exclusive apps. Buyer and Vendor are route-groups/capabilities the shell exposes per the participation profile.

### §4.3 Authorization is app-layer; the UI gate is UX, not the model (R7)
- The frontend **gates navigation and actions** on Doc-2 §7 permission slugs (bound by pointer) **for UX only** — it hides or disables what the user may not do, improving the experience.
- **The server re-validates every action.** The UI gate is **never** the authorization boundary; a hidden control is a UX nicety, not a security control. Authorization lives in the app layer (CLAUDE.md §2 — RLS is the DB backstop, the app layer is the model); the canonical authorization root is the internal-service **`check_permission`** (`Doc-5C §C3`, out-of-wire) invoked server-side, never by the client.
- **The UI reads permissions and entitlements via contracts, never via name-string checks.** Permission state comes from the M1 surface (`Doc-5C`); **entitlements come from M7 via contract** (`Doc-5I R10` — the entitlement service is authoritative), as **boolean/numeric/enum entitlements, never a plan-name or role-name string comparison** (Invariant #10). A surface never branches UI on `plan === "pro"` or `role === "owner"`; it branches on the resolved entitlement/permission value.

### §4.4 Admin is not org-scoped (R6 boundary)
The Admin console (Doc-7H) carries **no active-org context** — the Admin governance surface is platform-scoped and carries no `Iv-Active-Organization` header (`Doc-5A §7.3`; `Doc-5C R2` Admin subset; `Doc-5J` Admin-only). §4.1's org-context machinery applies to the tenant surfaces (7E–7G), not to 7H. Admin-decides/owning-module-owns is realized per `Doc-5J`.

### §4.5 Test obligation (by pointer)
The positive/negative/cross-tenant authorization test obligation — that a hidden-in-UI action is still server-rejected, that cross-tenant access is denied, that Hybrid mounts resolve correctly — is **Doc-8's** gate (component/e2e), referenced here, not realized in Doc-7.

### §4.6 What §4 does not do
§4 instantiates **no screen** — the org-switcher control, session boundary, and management screens are realized in Doc-7C/7E. §4 is the convention they conform to.

---

## Pass-1 self-check (pre-review)

- **Reference-never-restate:** every fact bound by pointer — `Doc-5C R2/§C3/§C6/§C8`, `Doc-4A §5.3`, `Doc-5A §7/§7.3/§6.2`, `Doc-2 §6/§7/§0.4`, CLAUDE.md §2/§5, Invariants #2/#10, `Doc-5I R10`, `Doc-5 Governance Note §3/§7/§8 rule 5`. **No contract, header, slug, or entitlement key invented** (`Iv-Active-Organization`, `get_active_context`, `switch_active_organization`, `list_my_organizations`, `check_permission` all trace verbatim to `Doc-5C`).
- **Mechanism only:** no JSX, no route file, no screen authored. §3 instantiates no route; §4 instantiates no screen.
- **Coins nothing:** 0 new module/contract/route/field/permission/state/event/audit/POLICY key.
- **Consistency framing correct:** Doc-4M/Doc-2 conform (upstream); Doc-5A consistency (sibling, §8 rule 5) — stated in §0.3/§2.3.
- **Open for review:** anchor-precision of `Doc-5A §7.3` (Admin no-org) and `Doc-4A §5.3` (context header) to be verified by the Board hard review.

*End of Content Pass-1 (§0–§4) — DRAFT. Realizes `Doc-7A_Structure_v1.0_FROZEN` §0–§4. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short re-review → Content Pass-2 (§5–§9).*
