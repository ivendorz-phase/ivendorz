# Doc-7D Additive Patch — Public Microsite Route Information Architecture

> **✅ APPROVED (Architecture Board, 2026-07-01)** alongside ADR-022. The append of **§10** to Doc-7D and the
> **v1.0 → v1.1** bump are a **human records action** — no AI edits the frozen Doc-7 series in place (CLAUDE.md
> §11). FE realization (WBS M2.7→) proceeds against this ratified section.

**Status:** **PROPOSED (DRAFT) — AWAITS HUMAN / ARCHITECTURE-REVIEW-BOARD APPROVAL.** Doc-7D is part of the
frozen Doc-7 series (`Doc-7D_SERIES_FROZEN_v1.0`). Per CLAUDE.md §11, **a frozen document is never edited in
place**; this is an **additive** patch that **adds one new section** and **alters no existing clause**. No AI
action folds it into the corpus — on approval a human appends the new section and bumps the version. Until then
this file lives in `governanceReviews/` and is non-authoritative.

| Field | Value |
|---|---|
| Target document | **Doc-7D — Public Surface** (`Doc-7D_Content_v1.0` series, FROZEN v1.0) |
| Proposed version | **Doc-7D v1.0 → v1.1** (additive new section; **no existing clause changed**) |
| Realizes | **ADR-022** — *Vendor Public Microsite IA Revision* (the decision; this patch is its authoring realization) |
| Change type | **Additive** — authors the page/route IA that **§4 deliberately left unauthored** ("Mechanism only: §0–§4 author no page/route", Pass-1 self-check). |
| Coins | **Nothing** — no new contract, no route-as-API, no field, no projection, no POLICY key. Binds the **existing** Public reads of §4.1. |
| Authority | CLAUDE.md §7, §8, §11 (reference-never-restate; additive-patch-only), §13. |

---

## Rationale (why this is additive, not an override)

Doc-7D §4 is **mechanism-only** and explicitly **authors no page/route**. It binds the microsite to
`get_public_vendor_profile` + vendor-scoped `search_catalog` (§4.1) and to Content ≠ Presentation (§4.2), but it
mandates **no** route layout. The published-content model (Doc-2 §3.3 `microsites`: `layout_template` +
`profile_sections`, atomic publish) is a **content-composition** model, **not** a routing model. Authoring a
route IA therefore **adds** to Doc-7D where it was silent; it **does not** contradict §4.1/§4.2/§4.3 or Doc-2
§3.3. M2 still owns the content; this section authors only the **public read/render route projection**.

## Proposed new section (to append to Doc-7D)

> ### §10 — Public Microsite Route Information Architecture *(realizes ADR-022)*
>
> §4 authors no page/route. This section authors the **public microsite route IA**. It is presentation routing
> over the §4.1 Public reads; it coins no contract, field, projection, or route-as-API, and changes no §4 clause.
>
> **§10.1 Seven-route composition.** The public vendor microsite is composed as **seven (7) primary routes**
> under `/vendors/[slug]`:
>
> | Route | Page | Renders (from §4.1 Public reads + M2-owned published content) |
> |---|---|---|
> | `/vendors/[slug]` | Home | Hero · Company summary · Capabilities · Featured products · Featured projects · Industries · CTA |
> | `/vendors/[slug]/about` | About | Overview · Mission · Vision · Core values · History · Timeline · Management · Facilities · Statistics |
> | `/vendors/[slug]/products` | Products | Categories · Product grid · Featured products · Product-detail links (`[ESC-7-API-PRODDETAIL]` interim) · RFQ CTA |
> | `/vendors/[slug]/projects` | Projects | Project cards · Gallery · Case studies · Industries served |
> | `/vendors/[slug]/industries` | Industries | Industries served |
> | `/vendors/[slug]/resources` | Resources | Company Profile · Brochure · Datasheet · Certificates · Gallery · Videos |
> | `/vendors/[slug]/contact` | Contact | Address · Phone · Email · Website · Map placeholder · Inquiry CTA · RFQ CTA |
>
> **§10.2 Navigation = exactly seven items** (Home · About · Products · Projects · Industries · Resources ·
> Contact). No top-level navigation item is added without Architecture-Board approval. **Resources** is the
> umbrella for Certifications / Downloads / Gallery / Videos / Brochures / Datasheets — these are **not**
> top-level nav items.
>
> **§10.3 Persistent chrome layout.** The vendor header, navigation, footer, and breadcrumb are rendered by a
> **route-group layout** shared across all seven pages; chrome is not re-authored per page. The microsite still
> renders **inside** the public shell (Doc-7C `SiteHeader` / `SiteFooter`) — the vendor chrome is **branded
> presentation**, never a shell replacement (§4.2; Doc-7A §6.2).
>
> **§10.4 Per-page Public read + 404 parity.** Each page resolves its **own** §4.1 Public read and renders the
> **byte-equivalent 404** (Invariant #11) on an unknown / unpublished / banned vendor. Data fetching is **not**
> centralized in the layout. (FE realization note: a single shared resolver keeps the 404 semantics identical
> across all routes.)
>
> **§10.5 SEO.** Each route emits its own public metadata (the indexability §1 already requires for microsites).
>
> **§10.6 Presentation-only boundary.** This section authors **routing**, not behaviour. Search, filter, the
> contact form, the map, and videos are **unwired presentation placeholders** until the corresponding Public
> reads/services are wired; no route is treated as an API; nothing on these pages mutates (anonymous intents
> route to `(auth)`, per §4 / Doc-7A §4.3).

## Conformance / what is untouched

- **§4.1 / §4.2 / §4.3 unchanged** — same Public reads, same Content ≠ Presentation rule, same display controls.
- **Doc-2 §3.3 `microsites` unchanged** — content model intact; M2 still owns content.
- **No coin** — 0 new module / contract / route-as-API / field / projection / POLICY key. The
  `[ESC-7-API-*]` interims (`PRODDETAIL`, `CATNAV`, `ADS`) are carried forward unchanged, not resolved here.
- **Invariants** — #9 (Content ≠ Presentation) and #11 (byte-equivalent 404) preserved; #1 capability matrix
  unchanged.

---

*Doc-7D additive patch (PROPOSED / DRAFT) — realizes ADR-022; adds §10 (Public Microsite Route IA); alters no
existing clause; coins nothing. Awaits human/Board approval; not folded into the frozen Doc-7 series by any AI
action (CLAUDE.md §11).*
