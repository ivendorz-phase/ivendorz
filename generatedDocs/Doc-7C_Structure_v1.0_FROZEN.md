# Doc-7C — App Shell & Data Layer — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **STRUCTURE FROZEN v1.0** (2026-06-26). Effective = `Doc-7C_Structure_Proposal_v0.1` + `Doc-7C_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization**; Doc-7C = the **App Shell & Data Layer**, second cross-cutting realization (**frozen second** per `DR-7-SHELL`, after Doc-7B, before surfaces) |
| Realizes | `Doc-7A_SERIES_FROZEN_v1.0` §3/§4/§5/§3.7/§3.5; defines the global notification center (composes Doc-7B primitives) |
| Gated by | `Doc-7A` Appendix A — applicable subset (SR9) |
| Authority | Conforms to `Doc-7A` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5 wired surface |
| Coins | **Nothing** — header/envelope/error/pagination/idempotency bound by pointer; route-group/segment names are routing vocabulary |

**Governing rule:** Doc-7C is the deployable skeleton + data layer every surface mounts into. It owns the App Router topology, the **server-resolved** active-org context, the session/auth boundary, the **server-side typed wired** Doc-5 API-client, and the global notification center. Authors no surface (Doc-7D…7H), no kit (Doc-7B); re-authors no Doc-5 contract. Realizes Doc-7A; re-decides nothing.

---

## Ratified decisions (SR1–SR10)
*(`SRn`, no hyphen = Doc-7C Shell Realization decisions — distinct from any `SR-n` review finding id; `DR-7-*` reserved for carried dependencies.)*

- **SR1 — Scope: App Shell & Data Layer (cross-cutting, frozen second).** Owns route-group topology + layouts; the server-resolved active-org context boundary + org-switcher + session/auth boundary; the typed wired Doc-5 API-client; the global notification center; shared loading/error/streaming/not-found conventions. Authors no surface, no kit. Freezes after Doc-7B, before surfaces (`DR-7-SHELL`).
- **SR2 — Route-group topology & layouts (`Doc-7A §3.2`).** Areas: **(a) Public-marketplace group** (anonymous — Doc-7D); **(b) auth-entry routes** (login/signup/password-recovery — unauthenticated; Doc-7E authors screens, Doc-7C owns placement); **(c) session-gated authenticated group** (Doc-7E–7G inside the active-org boundary); **(d) Admin group** (no active-org — `Doc-7A §4.4`). The **root layout owns the shell slots** (navigation, org-switcher, notification center). Segment names realized at content; surfaces fill the groups, the shell owns the frame.
- **SR3 — Active-org context boundary & org-switcher (`Doc-7A §4`/R6; `Doc-5C`).** Server-resolved active org via **`Iv-Active-Organization`** — **server-validated, never client-trusted** (`Doc-4A §5.3`; `Doc-5A §7`; CLAUDE.md §5). Resolve via **`get_active_context`**, list via **`list_my_organizations`**, switch via **`switch_active_organization`** (`Doc-5C §C8`). **Seam:** Doc-7C owns the context boundary + switcher mechanism + session; Doc-7E owns the management screens. The shell composes the navigable surface set from the org's platform participation + the user's org role, mounting **Buyer + Vendor together for Hybrid** (`Doc-7A §4.2`; Invariant #2).
- **SR4 — Session & auth boundary (CLAUDE.md §2; `REPOSITORY_STRUCTURE.md src/server/`).** Authenticated session via **Supabase Auth (authentication only)**; app-layer wiring `src/server/auth/` + `src/server/context/` + `src/server/guards/`. **Authentication ≠ authorization:** authorization is app-layer (`src/server/authz/`; `Doc-7A §4.3`); the shell establishes the session and hands the **server-validated** context to surfaces, never trusting a client-supplied identity/org.
- **SR5 — Typed wired Doc-5 API-client (`Doc-7A §5`/§3.7/R4) — server-side-only.** The typed client **executes in the Next.js server layer** (Server Components for reads, server actions / route handlers for writes); the **browser never invokes a Doc-5 contract directly, holds no service credential, and never sets the `Iv-Active-Organization` header itself** — the server attaches the server-validated context (SR3). Client Components trigger server actions only. The client binds **only the caller-facing wired** Doc-5 subset (out-of-wire never callable — `Doc-7A §3.7`), attaches a **stable idempotency key per submission** (`Doc-7A §5.6`), and consumes the envelope (`Doc-5A §5.6`), error taxonomy by `error_class` (`Doc-5A §6.2`), and cursor pagination (`Doc-5A §8`) with the POLICY-keyed `page_size`. Binds no contract Doc-5 did not freeze (`[ESC-7-API]` on a gap).
- **SR6 — Global notification center (Doc-7A allocation; `Doc-5H`).** **Defined here in Doc-7C**, composing Doc-7B presentational primitives (toast/list-item/badge-count). Renders M6 `Doc-5H` notification reads; **non-disclosure-bound** (`Doc-7A §8`; `CHK-7-040` scoped here); mounts in a root shell slot; contract owner = M6. Surfaces consume via the slot; none re-implements (`CHK-7-005`).
- **SR7 — Loading / error / streaming / not-found conventions (`Doc-7A §3.5`).** Route-segment **loading** (suspense) for streamed RSC reads; **error** boundaries mapping `error.error_class` → state (`Doc-7A §5.3`; no protected enrichment — §5.4); **not-found** boundaries **byte-identical to genuine absence** (`Doc-7A §8.2`). Reuse the Doc-7B status primitives, wired at the segment level.
- **SR8 — Out-of-frontend boundary (`Doc-7A R12`).** Shell holds no authoritative state; API-client cache is a disposable projection; **blobs transfer directly to/from Supabase Storage** (signed-URL/equivalent grant the wired contract issues) and the contract carries the **`file_ref` only, never the binary** (`Doc-2 §9`); **Supabase Realtime** is a transport prompting a re-fetch/reconcile (`Doc-7A §7.2`), never a store.
- **SR9 — Applicable Appendix A subset.** **APPLIES:** `CHK-7-001/002/003/004` (typed client realizes contract-binding/pagination/idempotency/error mapping), `CHK-7-005` (composes/defines the notification center), `CHK-7-010/011/012` (owns the active-org/authz boundary), `CHK-7-040` (scoped to the notification center) + `CHK-7-041` (shell not-found boundary), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide). **N/A (reason):** `CHK-7-020/021` (Content≠Presentation — kit/surfaces), `CHK-7-030/031` (no lifecycle screen), `CHK-7-042` (per-surface list non-disclosure — surfaces'), `CHK-7-050/051` (AI — kit/surfaces), `CHK-7-060/061/062/063` (baseline — kit).
- **SR10 — Coins nothing.** Header/envelope/error/pagination/idempotency bound by pointer (Doc-5A/Doc-4A/Doc-5C); route-group/segment names are routing vocabulary. On any gap → flag-and-halt (`[ESC-7-API]`/`[ESC-7-POLICY]`), never invent.

---

## Section spine (authored in content passes)

§0 Control/Precedence/Gating · §1 Scope & the Shell's Place (frozen second) · §2 Route-Group Topology & Layouts (SR2) · §3 Session & Auth Boundary (SR4) · §4 Active-Org Context & Org-Switcher (SR3) · §5 Typed Wired Doc-5 API-Client — server-side (SR5) · §6 Global Notification Center (SR6) · §7 Loading/Error/Streaming/Not-Found (SR7) · §8 Out-of-Frontend Boundary (SR8) · §9 Conformance (applicable Appendix A subset — SR9) & Carried Items · Appendix Shell/Route-Group Skeleton (names at content).

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7C handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Doc-7C frozen after 7B, before surfaces | Doc-7C is the shell owner; surfaces consume by reference | No (ordering) |
| **DR-7-API** | Typed client consumes the frozen Doc-5 wired surface | Consistency cross-check (SR5); `[ESC-7-API]` on an unservable need | Possible |
| **DR-7-STATE** | Lifecycle UI driven by Doc-4M | Shell wires segments; transitions are surfaces' (SR7) | No |
| `[ESC-7-API]` | A shell need references a non-existent contract/header | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-POLICY]` | A shell need references an unregistered POLICY key | Additive `Doc-3 §12.2` patch | Possible |

## Fences / out of scope

Authoring actual route files/layouts/provider/client code (Doc-7C content) · any surface/view/screen (Doc-7D…7H) · the kit/tokens/theme (Doc-7B) · re-authoring or binding a Doc-5 contract beyond the frozen wired surface · calling an out-of-wire/internal-service contract from the client (`Doc-7A §3.7`) · placing the API-client or credentials in the browser (SR5) · trusting a client-supplied org/identity (SR3/SR4) · routing a blob through a Doc-5 contract (SR8) · giving the shell/client cache authoritative state · coining any contract/route-as-API/field/header/permission/state/event/POLICY key · the integration / e2e / auth **test** obligation (Doc-8).

---

*End of Doc-7C Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS. Doc-7C realizes the App Shell & Data Layer over the frozen Doc-5 wired surface; server-side typed client; conforms to the frozen Doc-7A allocation; coins nothing. Next: Doc-7C content passes.*
