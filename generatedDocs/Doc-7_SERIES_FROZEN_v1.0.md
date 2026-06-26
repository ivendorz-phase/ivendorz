# Doc-7 — Frontend Realization Program — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **PROGRAM FROZEN v1.0** (2026-06-26) — all 8 documents (Doc-7A–7H) FROZEN. Each through the Board loop (Pass → Independent Hard Review → Patch → short closure check → Structure & Content Freeze Audits), 0 open BLOCKER/MAJOR/MINOR |
| Program | **Doc-7 — Frontend Realization** — the presentation sibling of Doc-5 (API) and Doc-6 (Database) |
| Realizes | the frozen **Doc-5 API surface** (`Doc-5A…5K`) + **Doc-4M** state machines + **Doc-2 v1.0.3** §6/§7/§0.4, on **Next.js 15 App Router + React + Tailwind + shadcn/ui** (the fixed Master-Architecture stack) |
| Authority | Conforms to Doc-4M/Doc-2 (upstream, rank-0); **consistent with** the frozen Doc-5 surface (sibling — no Doc-5A conformance authority over Doc-7; `Doc-5 Governance Note §8 rule 5`) |
| Coins | **Nothing** — every screen binds a frozen Doc-5x contract by pointer; every gap is an `[ESC-7-*]` escalated via a named additive channel |
| Manifest role | This document **points**; the per-document `_SERIES_FROZEN` manifests + their effective sets are authoritative |

---

## The 8 frozen documents

| Doc | Title | Manifest | Signature |
|---|---|---|---|
| **7A** | Frontend Realization Metastandard | `Doc-7A_SERIES_FROZEN_v1.0` | R1–R12; surface partition; **§3.7 wired-contracts-only**; Appendix A = **25 `CHK-7-xxx` / 10 bands (A–J)** — the per-surface freeze gate |
| **7B** | Design System & Component Kit *(frozen first)* | `Doc-7B_SERIES_FROZEN_v1.0` | BR1–BR12; presentation-only kit (primitives→app components, no content/state/fetch); single-owner shared embedded components; microsite theme-override; non-disclosure primitives |
| **7C** | App Shell & Data Layer *(frozen second)* | `Doc-7C_SERIES_FROZEN_v1.0` | SR1–SR10; App Router topology `(public)/(auth)/(app)/(admin)`; server-resolved active-org + switcher; **server-side-only** typed wired Doc-5 client; defines the notification center |
| **7D** | Public Surface (anonymous) | `Doc-7D_SERIES_FROZEN_v1.0` | PR1–PR10; Public-projection reads only (BC-MKT-6 + published microsite + Doc-5G public badge/reviews); published-only; no buyer-private concept (Inv #11); 3 `[ESC-7-API-*]` |
| **7E** | Account & Identity Shell | `Doc-7E_SERIES_FROZEN_v1.0` | ER1–ER11; `(auth)` + `(app)`; Doc-5C mgmt + Doc-5I account; §C8 switcher = 7C; `activate_plan` ≠ user (→7H); `[ESC-IDN-DELEG-EXPIRY]` |
| **7F** | Buyer Workspace (the moat) | `Doc-7F_SERIES_FROZEN_v1.0` | FR1–FR12; Buyer-leg Doc-5E/5F/5D; **R6 no-auto-decision (incl. AI); buyer never invites; R7 firewall; R8 money-boundary; buyer-private CRM never leaks (Inv #11)** |
| **7G** | Vendor Workspace | `Doc-7G_SERIES_FROZEN_v1.0` | GR1–GR12; Vendor-leg Doc-5E/5D/5F; **load-bearing byte-equivalence (Inv #11) incl. analytics denominator**; score firewall; capability matrix |
| **7H** | Admin Console *(last surface)* | `Doc-7H_SERIES_FROZEN_v1.0` | HR1–HR12; Doc-5J + cross-module Admin legs; **Admin-decides/owning-module-owns; no active-org; Trust firewall (no score write); M8 emits `VendorBanned` only, console drives owning-module events** |

---

## Program-level invariants held across all surfaces

- **Realize-never-redecide / coins nothing.** Every read/write/list binds a **frozen** Doc-5x contract by pointer; no contract, route, field, permission slug, state, event, audit action, or POLICY key was coined. Gaps → `[ESC-7-*]`.
- **§3.7 wired-contracts-only.** The frontend (incl. its Next.js server layer) consumes only the **caller-facing wired** Doc-5 subset; out-of-wire/internal-service contracts (`check_permission`, `resolve_entitlements`, the matching/routing engine, `read_crm_status_for_routing`, System workers) are **never frontend-callable**.
- **Server-side data layer.** The typed Doc-5 API-client runs in the Next.js server layer (RSC reads / server-action writes); the browser never calls Doc-5, holds no credential, never sets `Iv-Active-Organization`.
- **Users-Act / Orgs-Own (Inv #5).** Active org is server-resolved/validated; the client org ID is never trusted (Admin is platform-scoped — no active-org).
- **Content ≠ Presentation (Inv #9).** Draft/published projection split; the kit owns presentation, modules own content; display never re-ranks M3 matching.
- **The moat (R6/R7).** No surface — and no AI panel — auto-recommends/ranks-to-winner/auto-selects; the engine is out-of-wire; payment never influences matching.
- **Private exclusion stays private (Inv #11).** Buyer-private CRM never leaks; a blacklisted vendor's experience is **byte-equivalent** (incl. analytics) to a non-matched vendor's; the public surface has no concept of buyer-private status; ban ≠ blacklist.
- **Governance firewalls.** No frontend writes a trust/performance/financial-tier score (System-computed); Admin decides verification/tier, Trust owns the record; events are emitted by owning modules, never by the console.

---

## Carried into the build phase (resolved only via named additive channels, Board-approved)

| Marker | Scope | Channel |
|---|---|---|
| `[ESC-7-API]` (file-upload grant) | All surfaces with uploads (7C/7D/7F/7G/7H) | no client-facing signed-URL in the frozen Doc-5 surface; blobs via M0/Doc-4B Storage by pointer (`file_ref` only); additive Doc-5x/Doc-4B patch |
| `[ESC-7-API-PRODDETAIL / CATNAV / ADS]` | Doc-7D anonymous reads (`get_product`/`list_categories`/ads are User, not Public) | additive Doc-5D Public-projection patch |
| `[ESC-IDN-DELEG-EXPIRY]` | Doc-7E reinstate-delegation UI deferred | Doc-2 §5.10 change-management (carried from Doc-5C) |
| `[ESC-7-API-SIGNUP]` | RESOLVED (no frontend `create_user`; Supabase Auth + M1 provisioning) | — |

---

## Lifecycle attestation

Every document followed the Board-mandated loop, each step a separate artifact: **Pass → Hard Review as Board → Fix (Patch) → short closure check → next pass**, then **Structure Freeze Audit → Structure FROZEN → Content passes → Content Freeze Audit → SERIES FROZEN**. Across the program, the Board hard reviews caught and closed multiple genuine MAJORs — among them: the AI-recommendation moat boundary (7F), the buyer-never-invites engine boundary (7F), `issue_trade_invoice` actor-leg (7F→7G), byte-equivalence at the analytics vector (7G), the `activate_plan` ownership misbinding (7E→7H), and the full Doc-5G Admin surface + event framing (7H). Each was verified against the frozen corpus, never rubber-stamped.

---

## Status & what's next

- **Doc-7 (Frontend) = COMPLETE / FROZEN** (7A–7H).
- **Sibling programs continue** (per `Program_Status_And_Roadmap.md`): **Doc-6 (Database)** — per-module schema realizations in progress; **Doc-8 (Test & Conformance)** — discipline suites in progress.
- **Then:** Development Decomposition → Build Roadmap → Implementation (code = NOT STARTED).

*End of Doc-7 SERIES FROZEN v1.0. Program-level pointer; the per-document `_SERIES_FROZEN` manifests + effective sets are authoritative. Doc-7 realizes the frozen Doc-5 surface + Doc-4M as Next.js App Router UI across 8 surface documents; conforms to Doc-4M/Doc-2; consistent with Doc-5 (not conformant — §8 rule 5); coins nothing.*
