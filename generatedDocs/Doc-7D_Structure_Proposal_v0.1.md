# Doc-7D — Public Surface — Canonical Structure **Proposal v0.1**

| Field | Value |
|---|---|
| Status | **PROPOSAL v0.1** — first Doc-7D artifact. Next: Independent Hard Review (Board) → Structure Patch → short closure check → Structure Freeze Audit → Structure FROZEN |
| Date | 2026-06-26 |
| Program | **Doc-7 — Frontend Realization**; Doc-7D = the **Public Surface** — the first **surface** document (anonymous marketplace discovery, vendor microsites, public profiles, public browse, ads read) |
| Realizes | the frozen **Doc-5D** Marketplace **Public-projection** read surface (`search_catalog`, `list_vendor_directory`, `get_public_vendor_profile` — BC-MKT-6 §8 Public Query, anonymous; + public microsite/profile/catalog/ads reads) on the Doc-7C App Shell `(public)` route group, using the Doc-7B kit |
| Consumes (by reference, frozen) | `Doc-7B_SERIES_FROZEN_v1.0` (kit; microsite theming) · `Doc-7C_SERIES_FROZEN_v1.0` (App Shell `(public)` group, server-side wired client) — `DR-7-SHELL` satisfied |
| Gated by | `Doc-7A` Appendix A — **full set** (it is a surface; SR/CHK applicability per PR9) |
| Authority | Conforms to `Doc-7A`/`Doc-7B`/`Doc-7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5D wired Public surface |
| Contains | Structure only — scope, R-set (`PR1…PR10`), section spine, the view-inventory skeleton, carried dependencies. **No JSX, no page code, no route files** — those land in Doc-7D content passes |
| Coins | **Nothing** — binds frozen Doc-5D Public reads by pointer; view/route names are presentation vocabulary |

**Governing rule:** Doc-7D is the **anonymous** read surface. It consumes **only Public-projection** Doc-5D reads (`Doc-5D` per-read projection rule), carries **no active-org** (anonymous), performs **no authenticated mutation**, and never touches a Controlling-Org / Internal-Service projection or any governance/buyer-private internal. Realizes Doc-7A/7B/7C; re-decides nothing; coins nothing.

---

## Decisions proposed for ratification (R-set `PR1…PR10`)
*(`PRn` = Doc-7D Public Realization decisions — distinct from the `DR-7-*` carried-dependency prefix.)*

- **PR1 — Scope: the anonymous Public surface.** Reads only, **Public projection only**; mounts in the Doc-7C **`(public)` route group** (anonymous, no active-org); consumes the Doc-7B kit + Doc-7C shell **by reference**; authors its own views only. Realizes the frozen Doc-5D Public read surface (BC-MKT-6 §8 + public microsite/profile/catalog/ads). *(Alternative: fold public browse into the authenticated app. Rejected — the public surface is anonymous/indexable and must not require a session.)*
- **PR2 — View inventory binds frozen Doc-5D Public reads.** Views: **marketplace discovery/search** (`search_catalog`), **vendor directory** (`list_vendor_directory`), **public vendor profile** (`get_public_vendor_profile`), **vendor microsite** (M2 presentation), **public product/category browse**, **ads display**. Each view binds a **frozen Doc-5D Public-projection read by pointer** (content names them); no contract is invented (`[ESC-7-API]` on a gap).
- **PR3 — Public projection only (non-disclosure; `Doc-5D` per-read projection rule + R5/R9).** The surface consumes **only Public-projection** reads — never Controlling-Org or Internal-Service projections. No governance internal, no buyer-private (M4 CRM), no exclusion signal, no routing/matching internal is reachable. A non-disclosed fact collapses to **`NOT_FOUND`** (`Doc-5A §6.3`); byte-equivalence holds (`Doc-7A §8`; `CHK-7-040/041/042`).
- **PR4 — Microsite & Content ≠ Presentation (`Doc-7A §6`; `Doc-7B` microsite theming).** The **vendor microsite** renders **M2-owned content** with **vendor-branded presentation** (Doc-7B microsite theme override, presentation-only, owns no M2 content). Doc-7D is the **public read/render** surface; M2 owns the content; the **Vendor workspace (Doc-7G) manages it** (same content, two surfaces). Kit sort/filter on browse **re-queries the contract** (`Doc-7B §4.3`), never a client reorder; there is no M3 matching on the public surface to re-rank.
- **PR5 — No active-org, no anonymous mutation; conversion CTAs route to auth-entry.** The surface carries **no `Iv-Active-Organization`** (anonymous) and performs **no authenticated mutation**. Conversion CTAs (sign up to claim a profile, favorite, or start an RFQ) **route to the auth-entry area (Doc-7E)** — the auth action is Doc-7E's, not Doc-7D's. Any **anonymous write** (e.g. a public contact/lead-capture form) **must trace to a frozen Public-actor command or flag `[ESC-7-API]`** — never assumed.
- **PR6 — Data via the Doc-7C server-side wired client.** All reads flow through the **Doc-7C server-side typed wired client** (RSC fetch; `Doc-7C §5`): cursor pagination + POLICY-keyed `page_size` (`Doc-5A §8`), error→state by `error_class` (`Doc-7A §5.3`). **No browser-direct Doc-5 call**; the browser holds no credential (`Doc-7C §5.1`).
- **PR7 — Public render / discoverability (App Router).** Public views are **SSR/SSG-friendly Server Components** (`Doc-7A §3.3`), **indexable**, with public metadata for microsites/profiles/catalog (SEO). This is a Public-surface-specific realization (anonymous discoverability) and coins no domain element; it exposes **only Public-projection** content (PR3).
- **PR8 — Baseline (inherited from Doc-7B §7).** WCAG-AA a11y; i18n/localization-ready; **currency-per-field, default BDT, never assumed** for catalog prices (`Doc-2 §0.4`); responsive. Inherited from the kit (`CHK-7-060/061/062/063`).
- **PR9 — Applicable Appendix A subset (full surface, with reasons).** **APPLIES:** `CHK-7-001/002/003/004` (views bind Doc-5D Public reads; pagination/error; idempotency only if a write exists — else N/A for 003), `CHK-7-005` (composes shared embedded components, e.g. trust badge on profiles), `CHK-7-020/021` (Content≠Presentation, microsite), `CHK-7-040/041/042` (non-disclosure / Public projection), `CHK-7-060/061/062/063` (baseline), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide). **N/A (reason):** `CHK-7-010/012` (anonymous — no active-org; Admin n/a), `CHK-7-030/031` (no lifecycle screen on the public surface), `CHK-7-050/051` (AI is User-read-only per `Doc-5K`; no AI on the anonymous surface); **`CHK-7-011`** applies **only** to conversion-CTA gating (UX), else N/A; **`CHK-7-003`** N/A unless a frozen anonymous write exists (PR5).
- **PR10 — Coins nothing.** Binds frozen Doc-5D Public reads by pointer; view/route names are presentation vocabulary. On any gap (a view needing a non-Public-projection or non-existent read/write) → **flag-and-halt** (`[ESC-7-API]`), never invent.

---

## The Doc-7D section spine (authored in content passes)

| § | Title | Realizes | Detail |
|---|---|---|---|
| §0 | Document Control, Precedence & Gating | governance §3; Doc-7A §0 | conforms to 7A/7B/7C; consistency with Doc-5D; flag-and-halt |
| §1 | Scope & the Public Surface's Place | PR1; `(public)` group | anonymous; consumes kit/shell; authors own views |
| §2 | View Inventory & Contract Binding | PR2; Doc-5D §8 | each view ↔ a frozen Doc-5D Public read |
| §3 | Public Projection & Non-Disclosure | PR3; Doc-5D R5/R9; Doc-7A §8 | Public projection only; NOT_FOUND collapse; byte-equivalence |
| §4 | Microsite & Content ≠ Presentation | PR4; Doc-7A §6; Doc-7B theming | M2 content, vendor-branded presentation; two surfaces one owner |
| §5 | Conversion CTAs & the Auth-Entry Boundary | PR5 | no anonymous mutation; CTAs → Doc-7E auth-entry |
| §6 | Data Access via the Doc-7C Client | PR6; Doc-7C §5 | server-side wired reads; pagination; error→state |
| §7 | Public Render & Discoverability | PR7; Doc-7A §3.3 | SSR/SSG; indexable; public metadata; Public projection only |
| §8 | Baseline (a11y / i18n / currency / responsive) | PR8; Doc-7B §7 | inherited from the kit |
| §9 | Conformance (full Appendix A; N/A reasons) & Carried Items | PR9/PR10 | applicable `CHK-7-xxx` + reasons; `DR-7-*`/`[ESC-7-*]` |
| Appendix | View-Inventory Skeleton | PR2 | view **names** + their bound Doc-5D reads (at content) |

*Doc-7D authors no kit/shell and no other surface. §2–§8 are the public views; the actual pages are realized in the Doc-7D content passes.*

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7D handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes the frozen Doc-7B kit + Doc-7C `(public)` shell | By reference; never re-authored | No |
| **DR-7-API** | Views must bind the frozen Doc-5D **Public** reads | Consistency cross-check (PR2); `[ESC-7-API]` on a gap | Possible |
| `[ESC-7-API]` | A view needs a non-Public-projection or non-existent read/write (incl. an anonymous lead/contact write) | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-DESIGN]` | A shared embedded component composed here needs allocation | Doc-7B is the definer; escalate, never coin | Possible |

## Fences / out of scope

Authoring the kit/tokens/theme (Doc-7B) or the App Shell/client (Doc-7C) · any other surface (Doc-7E…7H) · any authenticated/User view (account, RFQ, ops — Doc-7E…7G) · accessing a Controlling-Org / Internal-Service projection or any governance/buyer-private internal (PR3) · performing an anonymous authenticated mutation · re-authoring or binding a non-Public Doc-5 contract · coining any contract/route-as-API/field/projection/POLICY key · the e2e / a11y / SEO **test** obligation (Doc-8).

---

## Provenance & next steps

- **Provenance:** first Doc-7D (and first **surface**) artifact. Grounded in `Doc-5D` (Public-projection reads — BC-MKT-6 §8 verified Public/anonymous; per-read projection rule), `Doc-7A`/`Doc-7B`/`Doc-7C` (frozen), `Doc-2 §0.4` (currency). No frozen document edited; nothing coined.
- **Status:** **PROPOSAL v0.1** — structure only. R-set `PR1…PR10`; section spine §0–§9 + view-inventory appendix.
- **Next (Board-directed loop):** Independent Hard Review → Structure Patch → short closure check → Structure Freeze Audit → `Doc-7D_Structure_v1.0_FROZEN` → Doc-7D content passes → then Doc-7E (Account & Identity) and the remaining surfaces.

*End of Doc-7D Canonical Structure **Proposal v0.1** — structure only. On any conflict, Doc-7A/7B/7C + the frozen corpus win; flag-and-halt. Doc-7D realizes the anonymous Public surface over the frozen Doc-5D Public reads; Public projection only; coins nothing. Next: Independent Hard Review.*
