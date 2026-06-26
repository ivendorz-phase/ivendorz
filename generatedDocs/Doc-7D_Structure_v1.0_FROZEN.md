# Doc-7D — Public Surface — Canonical Structure **v1.0 FROZEN**

| Field | Value |
|---|---|
| Status | **STRUCTURE FROZEN v1.0** (2026-06-26). Effective = `Doc-7D_Structure_Proposal_v0.1` + `Doc-7D_Structure_Patch_v0.1.1`. Independent Hard Review + Structure Freeze Audit PASS (0 open BLOCKER/MAJOR/MINOR) |
| Program | **Doc-7 — Frontend Realization**; Doc-7D = the **Public Surface** (first surface document) |
| Realizes | the frozen **Doc-5D Public-projection** read surface (BC-MKT-6 §8 `search_catalog`/`list_vendor_directory`/`get_public_vendor_profile` + public microsite/profile/catalog/ads, bind-or-ESC) on the Doc-7C `(public)` route group, using the Doc-7B kit |
| Consumes (frozen, by reference) | `Doc-7B_SERIES_FROZEN_v1.0` · `Doc-7C_SERIES_FROZEN_v1.0` (`DR-7-SHELL` satisfied) |
| Gated by | `Doc-7A` Appendix A — full set (PR9 applicability) |
| Authority | Conforms to `Doc-7A`/`Doc-7B`/`Doc-7C` + Doc-4M/Doc-2 (upstream); consistent with the frozen Doc-5D Public surface |
| Coins | **Nothing** — binds frozen Doc-5D Public reads by pointer; view/route names are presentation vocabulary |

**Governing rule:** Doc-7D is the **anonymous** read surface — **Public projection only**, **no active-org**, **no anonymous mutation**, never touching a Controlling-Org/Internal-Service projection or any governance/buyer-private internal. Realizes Doc-7A/7B/7C; coins nothing.

---

## Ratified decisions (PR1–PR10)
*(`PRn` = Doc-7D Public Realization decisions — distinct from `DR-7-*`.)*

- **PR1 — Scope: the anonymous Public surface.** Reads only, Public projection only; mounts in the Doc-7C `(public)` route group (anonymous, no active-org); consumes the Doc-7B kit + Doc-7C shell by reference; authors its own views only.
- **PR2 — View inventory binds frozen Doc-5D Public reads (bind-or-ESC).** **Verified core:** BC-MKT-6 (`search_catalog`/`list_vendor_directory`/`get_public_vendor_profile`, Public Query §8). **To-be-confirmed at content** (each binds a confirmed Public-projection read, else `[ESC-7-API]`, not rendered by assumption): **vendor microsite** (M2 presentation), **public product/category detail**, **ads display**. No contract invented.
- **PR3 — Public projection only (non-disclosure; `Doc-5D` projection rule + R5/R9; Invariant #11).** Consumes only Public-projection reads — never Controlling-Org/Internal-Service. No governance internal, no buyer-private (M4 CRM), no exclusion signal, no routing/matching internal reachable; non-disclosed facts collapse to `NOT_FOUND` (`Doc-5A §6.3`); byte-equivalence holds. **The public surface reflects only the `public` visibility scope and has no concept of buyer-private status whatsoever** — a vendor blacklisted by one buyer still appears publicly (Invariant #11; the exclusion is invisible everywhere).
- **PR4 — Microsite & Content ≠ Presentation (`Doc-7A §6`; `Doc-7B` microsite theming).** The vendor microsite renders **M2-owned content** with **vendor-branded presentation** (Doc-7B theme override, presentation-only). Doc-7D is the public read/render surface; M2 owns the content; the Vendor workspace (Doc-7G) manages it (two surfaces, one owner). Kit sort/filter **re-queries** (`Doc-7B §4.3`); no M3 matching on the public surface.
- **PR5 — No active-org, no anonymous mutation; CTAs → auth-entry.** No `Iv-Active-Organization` (anonymous); no authenticated mutation. Conversion CTAs (sign up to claim/favorite/start-RFQ) route to the **auth-entry area (Doc-7E)** — the auth action is Doc-7E's. Any anonymous write (e.g. public contact/lead) **must trace to a frozen Public-actor command or `[ESC-7-API]`** — never assumed.
- **PR6 — Data via the Doc-7C server-side wired client.** All reads flow through the Doc-7C server-side typed wired client (RSC fetch; `Doc-7C §5`): cursor pagination + POLICY `page_size` (`Doc-5A §8`), error→state by `error_class` (`Doc-7A §5.3`). No browser-direct Doc-5 call; no credential in the browser (`Doc-7C §5.1`).
- **PR7 — Public render / discoverability.** Public views are SSR/SSG-friendly Server Components (`Doc-7A §3.3`), indexable, with public metadata (SEO) — exposing **only Public-projection** content (PR3). Coins no domain element.
- **PR8 — Baseline (inherited from Doc-7B §7).** WCAG-AA; i18n-ready; **currency-per-field, default BDT, never assumed** for catalog prices (`Doc-2 §0.4`); responsive (`CHK-7-060/061/062/063`).
- **PR9 — Applicable Appendix A subset (full surface; conditional read/write).** **APPLIES:** `CHK-7-001/002/004` (the reads — binding/pagination/error), `CHK-7-005` (embedded components, e.g. a public trust badge binding `Doc-5G`'s **Public-projection** read — confirm at content, else omit/`[ESC-7-API]`), `CHK-7-020/021` (Content≠Presentation, microsite), `CHK-7-040/041/042` (non-disclosure / Public projection), `CHK-7-060/061/062/063` (baseline), `CHK-7-070/071` (out-of-frontend), `CHK-7-080/081` (realize-never-redecide). **Conditional:** `CHK-7-003` (idempotency) **N/A by default** (read-only — PR5); APPLIES only if a frozen anonymous write is added. **`CHK-7-011`** applies only to conversion-CTA gating (UX). **N/A:** `CHK-7-010/012` (anonymous — no active-org/Admin), `CHK-7-030/031` (no lifecycle screen), `CHK-7-050/051` (AI is User-read-only per `Doc-5K`; none anonymous).
- **PR10 — Coins nothing.** Binds frozen Doc-5D Public reads by pointer; view/route names are presentation vocabulary. On any gap → flag-and-halt (`[ESC-7-API]`), never invent.

---

## Section spine (authored in content passes)

§0 Control/Precedence/Gating · §1 Scope & the Public Surface's Place · §2 View Inventory & Contract Binding (PR2) · §3 Public Projection & Non-Disclosure (PR3) · §4 Microsite & Content≠Presentation (PR4) · §5 Conversion CTAs & the Auth-Entry Boundary (PR5) · §6 Data Access via the Doc-7C Client (PR6) · §7 Public Render & Discoverability (PR7) · §8 Baseline (PR8) · §9 Conformance (full Appendix A; reasons) & Carried Items · Appendix View-Inventory Skeleton.

---

## Open carried items (resolved only via named channels)

| ID | Item | Doc-7D handling | Freeze gate? |
|---|---|---|---|
| **DR-7-SHELL** | Consumes frozen Doc-7B kit + Doc-7C `(public)` shell | By reference; never re-authored | No |
| **DR-7-API** | Views bind the frozen Doc-5D **Public** reads | Consistency cross-check (PR2); `[ESC-7-API]` on a gap | Possible |
| `[ESC-7-API]` | A view needs a non-Public-projection or non-existent read/write (microsite/catalog/ads confirmation; anonymous lead write; public trust read) | Flag-and-halt; additive Doc-5x patch (Board) | Possible |
| `[ESC-7-DESIGN]` | A composed embedded component needs allocation | Doc-7B is the definer; escalate | Possible |

## Fences / out of scope

Authoring the kit/shell (Doc-7B/7C) · any other surface (Doc-7E…7H) · any authenticated/User view · accessing a non-Public projection or governance/buyer-private internal (PR3) · any anonymous authenticated mutation · re-authoring or binding a non-Public Doc-5 contract · coining any contract/route-as-API/field/projection/POLICY key · the e2e / a11y / SEO **test** obligation (Doc-8).

---

*End of Doc-7D Canonical Structure **v1.0 FROZEN**. Effective = Proposal v0.1 + Patch v0.1.1; Independent Hard Review + Structure Freeze Audit PASS. Doc-7D realizes the anonymous Public surface over the frozen Doc-5D Public reads; Public projection only; coins nothing. Next: Doc-7D content passes.*
