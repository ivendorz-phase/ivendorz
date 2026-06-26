# Doc-7C — App Shell & Data Layer — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-7C artifact. Next: Independent Hard Review (Board) → Structure Patch → short closure check → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Program | **Doc-7 — Frontend Realization**; Doc-7C = the **App Shell & Data Layer**, the second cross-cutting realization (**frozen second** per `DR-7-SHELL`, after Doc-7B, before the surfaces) |
| Realizes | `Doc-7A_SERIES_FROZEN_v1.0` — §3 (composition/routing) · §4 (active-org & app-layer authz) · §5 (data-binding & API-client) · §3.7 (wired-contracts-only) · §3.5 (loading/error/streaming); **defines** the global notification center (Doc-7A allocation table) composing Doc-7B primitives |
| Gated by | `Doc-7A` Appendix A — applicable subset (SR9) |
| Authority | Conforms to `Doc-7A` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5 surface (the typed client binds the **wired** Doc-5 subset) |
| Contains | Structure only — scope, R-set (`SR1…SR10`), section spine, the shell/route-group skeleton, carried dependencies. **No route files, no layout code, no client code, no provider code** — those land in Doc-7C content passes |
| Coins | **Nothing** — no module, contract, route-as-API, field, header, permission slug, state, event, audit action, or POLICY key. The `Iv-Active-Organization` header + idempotency are bound by pointer; route-group/segment names are routing vocabulary (the legitimate *how*) |

**Governing rule:** Doc-7C is the **deployable skeleton + data layer** every surface mounts into. It owns the App Router topology, the server-resolved active-org context, the session/auth boundary, the typed **wired** Doc-5 API-client, and the global notification center. It **authors no surface** (Doc-7D…7H) and **no kit** (Doc-7B); it **re-authors no Doc-5 contract**. Realizes Doc-7A; re-decides nothing.

---

## Decisions proposed for ratification at structure freeze (R-set `SR1…SR10`)

- **SR1 — Scope: the App Shell & Data Layer (cross-cutting, frozen second).** Owns: the App Router route-group topology + root/segment layouts; the **server-resolved active-org context boundary + org-switcher + session/auth boundary**; the **typed wired Doc-5 API-client**; the **global notification center**; the shared loading/error/streaming/not-found conventions. **Authors no surface** (Doc-7D…7H) and **no kit** (Doc-7B). Freezes **after Doc-7B, before the surfaces** (`DR-7-SHELL`). *(Prefix `SR` = "Shell Realization decisions" — distinct from the carried-dependency prefix `DR-7-*`.)*
- **SR2 — Route-group topology & layouts (`Doc-7A §3.2`).** Realize the App Router route-group tree mapping to the surface partition: an **anonymous (Public) group** (Doc-7D) and an **authenticated group** mounting the tenant surfaces (Doc-7E–7G) **inside the session + active-org boundary** (SR3/SR4), plus the **Admin group** (Doc-7H) **without** active-org (`Doc-7A §4.4`). The **root layout owns the shell slots** (navigation, org-switcher, notification center) every authenticated surface mounts into. Exact segment names realized at content; surfaces fill the groups, the shell owns the frame.
- **SR3 — Active-org context boundary & org-switcher (`Doc-7A §4`/R6; `Doc-5C`).** Realize the **server-resolved active organization** via the **`Iv-Active-Organization`** context header — **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`; CLAUDE.md §5). The shell resolves current context via **`get_active_context`**, lists switchable orgs via **`list_my_organizations`**, and the **org-switcher control** invokes **`switch_active_organization`** (`Doc-5C §C8`). **Seam (Doc-7A C-2):** Doc-7C owns the **context boundary + switcher mechanism + session**; Doc-7E owns the **management screens**. The shell composes the **navigable surface set** from platform participation + org role, mounting **Buyer + Vendor together for Hybrid** (`Doc-7A §4.2`; Invariant #2).
- **SR4 — Session & auth boundary (CLAUDE.md §2; `REPOSITORY_STRUCTURE.md src/server/`).** Realize the authenticated session via **Supabase Auth (authentication only)** and the app-layer wiring `src/server/auth/` + `src/server/context/` (server-validated active-org) + `src/server/guards/` (auth + org context + permissions). **Authentication ≠ authorization:** authorization is app-layer (`src/server/authz/`; `Doc-7A §4.3`); the shell establishes the session and hands the **server-validated** context to surfaces. The shell never trusts a client-supplied identity or org.
- **SR5 — Typed wired Doc-5 API-client (`Doc-7A §5`/§3.7/R4).** Realize the typed client that binds **only the caller-facing wired** Doc-5 subset — **out-of-wire / internal-service contracts are never client-callable** (`Doc-7A §3.7`). Read path = RSC fetch of wired reads/lists; write path = server actions to wired commands. The client attaches the `Iv-Active-Organization` header (SR3) and a **stable idempotency key per submission** (`Doc-7A §5.6`); consumes the envelope (`Doc-5A §5.6`), the error taxonomy by **`error_class`** (`Doc-5A §6.2`, never status alone), and **cursor pagination** (`Doc-5A §8`) with the POLICY-keyed `page_size`. The client realizes Doc-7A §5 conventions; it **binds no contract Doc-5 did not freeze** (`[ESC-7-API]` on a gap).
- **SR6 — Global notification center (Doc-7A allocation table; `Doc-5H`).** Realize the **notification center — defined here in Doc-7C** (the cross-cutting shell slot) — **composing Doc-7B presentational primitives** (toast, list-item, badge-count). It renders M6 `Doc-5H` notification reads, is **non-disclosure-bound** (`Doc-7A §8` — never an excluded/protected signal), mounts in a **root shell slot**, and its **contract owner is M6**. Surfaces consume it via the slot; none re-implements it (`CHK-7-005`).
- **SR7 — Loading / error / streaming / not-found conventions (`Doc-7A §3.5`).** Realize the route-segment conventions every surface inherits: **loading** (suspense) boundaries for streamed RSC reads; **error** boundaries mapping `error.error_class` → state (`Doc-7A §5.3`, no protected enrichment — §5.4); **not-found** boundaries rendering **byte-identical to genuine absence** (`Doc-7A §8.2`). These reuse the Doc-7B status primitives; the shell wires them at the segment level.
- **SR8 — Out-of-frontend boundary (`Doc-7A R12`).** The shell holds **no authoritative state**; the API-client cache is a **disposable projection** (invalidated/refetched, never source of truth); file upload/download go through the **contract-mediated Supabase Storage path** (the client carries a `file_ref`, never authoritative blobs); **Supabase Realtime** is a transport that prompts a re-fetch/reconcile (`Doc-7A §7.2`), never a store.
- **SR9 — Applicable Appendix A subset (`Doc-7A` Appendix A applicability).** Doc-7C runs the applicable `CHK-7-xxx` subset and marks the rest **N/A with reason**: **APPLIES** — `CHK-7-001/002/003/004` (the typed client realizes contract-binding/pagination/idempotency/error mapping), `CHK-7-005` (composes shared embedded components incl. the notification center it defines), `CHK-7-010/011/012` (the shell owns the active-org/authz boundary), `CHK-7-041` (the shell not-found boundary), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide). **N/A (reason):** `CHK-7-020/021` (Content≠Presentation is the kit's/surfaces'), `CHK-7-030/031` (no lifecycle screen here), `CHK-7-040/042` (per-surface non-disclosure — surfaces'), `CHK-7-050/051` (AI panel — kit/surfaces), `CHK-7-060/061/062/063` (baseline — kit's).
- **SR10 — Coins nothing.** The `Iv-Active-Organization` header, idempotency, envelope, error classes, and cursor grammar are **bound by pointer** to Doc-5A/Doc-4A/Doc-5C; route-group/segment names are routing vocabulary (the legitimate *how*). No domain/API element is introduced. On any gap (a shell need referencing a non-existent contract/header/POLICY key) → **flag-and-halt** (`[ESC-7-API]`/`[ESC-7-POLICY]`), never invent.

---

## The Doc-7C section spine (authored in content passes)

| § | Title | Realizes | Detail |
|---|---|---|---|
| §0 | Document Control, Precedence & Gating | governance §3; Doc-7A §0 | conforms to Doc-7A; consistency with Doc-5; flag-and-halt |
| §1 | Scope & the Shell's Place (frozen second) | SR1; `DR-7-SHELL` | authors no surface/kit; deployable skeleton |
| §2 | Route-Group Topology & Layouts | SR2; Doc-7A §3.2 | anon/authenticated/admin groups; root shell slots |
| §3 | Session & Auth Boundary | SR4; CLAUDE.md §2 | Supabase Auth (authn only); server/ wiring; authn ≠ authz |
| §4 | Active-Org Context & Org-Switcher | SR3; Doc-7A §4; Doc-5C | server-resolved context; switcher; Hybrid surface-set; Admin no-org |
| §5 | Typed Wired Doc-5 API-Client | SR5; Doc-7A §5/§3.7 | wired-only; envelope/error/pagination/idempotency; header attach |
| §6 | Global Notification Center | SR6; Doc-7A allocation; Doc-5H | defined here; composes Doc-7B primitives; non-disclosure-bound |
| §7 | Loading / Error / Streaming / Not-Found Conventions | SR7; Doc-7A §3.5/§5.3/§8.2 | segment boundaries; not-found ≡ absence |
| §8 | Out-of-Frontend Boundary | SR8; Doc-7A R12 | no authoritative state; Storage/Realtime/cache |
| §9 | Conformance (applicable Appendix A subset) & Carried Items | SR9/SR10 | applicable `CHK-7-xxx` + N/A reasons; `DR-7-*`/`[ESC-7-*]` |
| Appendix | Shell / Route-Group Skeleton | SR2/SR6 | route-group + shell-slot **names** at content (routing vocabulary) |

*Doc-7C authors no surface. §2–§8 are the shell + data layer; the actual route files/layouts/providers/client are realized in the Doc-7C content passes.*

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7C handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Doc-7C frozen after Doc-7B, before surfaces; surfaces mount into the shell | Doc-7C is the shell owner; surfaces consume by reference | No (ordering) |
| **DR-7-API** | The typed client must consume the frozen Doc-5 wired surface | Consistency cross-check (SR5); `[ESC-7-API]` on an unservable need | Possible |
| **DR-7-STATE** | Lifecycle UI driven by Doc-4M | The shell wires segments; transitions are surfaces' (SR7) | No |
| `[ESC-7-API]` | A shell need references a non-existent contract/header | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-POLICY]` | A shell need references an unregistered POLICY key | Additive `Doc-3 §12.2` patch | Possible |

## Fences / out of scope

Authoring actual route files / layouts / provider code / client code (Doc-7C content) · any surface/view/screen (Doc-7D…7H) · the component kit/tokens/theme (Doc-7B) · re-authoring or binding a Doc-5 contract beyond the frozen wired surface · calling an out-of-wire/internal-service contract from the client (`Doc-7A §3.7`) · trusting a client-supplied org/identity (SR3/SR4) · giving the shell or client cache authoritative state (SR8) · coining any contract/route-as-API/field/header/permission/state/event/POLICY key · the integration / e2e / auth **test** obligation (Doc-8).

---

## Provenance & next steps

- **Provenance:** first Doc-7C artifact. Grounded in `Doc-7A_SERIES_FROZEN_v1.0` (§3/§4/§5/§3.7) + `Doc-5C` (active-org/session contracts) + `Doc-5H` (notification reads) + `Doc-5A §5.6/§6.2/§8` (envelope/error/pagination) + `REPOSITORY_STRUCTURE.md src/server/` + CLAUDE.md §2/§5. No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. R-set `SR1…SR10`; section spine §0–§9 + skeleton appendix.
- **Next (Board-directed loop):** Independent Hard Review → Structure Patch → short closure check → Structure Freeze Audit → `Doc-7C_Structure_v1.0_FROZEN` → Doc-7C content passes → then the surface documents Doc-7D…7H.

*End of Doc-7C Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-7A + the frozen corpus win; flag-and-halt. Doc-7C realizes the App Shell & Data Layer over the frozen Doc-5 wired surface; binds the wired subset only; coins nothing. Next: Independent Hard Review.*
