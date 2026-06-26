# Doc-7B — Design System & Component Kit — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7B** — the shared Design System & Component Kit; first cross-cutting Doc-7 realization (**frozen first** per `DR-7-SHELL`) |
| Program | **Doc-7 — Frontend Realization** (presentation sibling of Doc-5 API / Doc-6 DB) |
| Realizes | `Doc-7A_SERIES_FROZEN_v1.0` — §3/§6/§9/§10; defines the shared embedded components assigned to Doc-7B |
| Gated by | `Doc-7A` Appendix A — applicable subset (BR11); conforms to the frozen `Doc-7A` allocation table |
| Coins | **Nothing architectural** — token/component names are presentation vocabulary |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7B_Structure_v1.0_FROZEN` (= `Doc-7B_Structure_Proposal_v0.1` + `Doc-7B_Structure_Patch_v0.1.1`) |
| Content §0–§4 | `Doc-7B_Content_v1.0_Pass1` + `Doc-7B_Content_Pass1_Patch_v1.0.1` |
| Content §5–§9 + Appendix | `Doc-7B_Content_v1.0_Pass2` + `Doc-7B_Content_Pass2_Patch_v1.0.1` |
| Freeze gates | `Doc-7B_Structure_Freeze_Audit_v1.0` · `Doc-7B_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7B_Structure_Independent_Hard_Review_v0.1` · `Doc-7B_Content_Pass{1,2}_Independent_Hard_Review_v1.0` |

---

## What Doc-7B fixes (summary — authoritative text is the effective set)

**Presentation only (BR1–BR4/BR10):** a kit component owns no content, fetches no contract, holds no authoritative state, caches nothing as authoritative — it is a pure presentation function of props + ephemeral interaction state. Three-layer boundary: **primitives** (shadcn/ui vendored) → **app components** → (surface composition, out of scope). RSC-compatible (Server-Component-default; interactive = explicit Client).

**Tokens & theming (BR3):** primitive + semantic token tiers (Tailwind + CSS vars); **no token encodes a domain value**; status→variant mapping is a component concern keyed on the contract-reported state; **microsite-level theme overriding** (vendor-branded skinning, presentation-only, owns no M2 content).

**Content ≠ Presentation (BR4):** props-in / by-reference (never reshaped); a kit sort/filter control **re-queries the contract** (it never reorders cursor-paginated results client-side); never re-ranks governed M3 matching.

**Shared embedded component catalog (BR5; `CHK-7-005`):** defined once — **trust badge** (M5 `Doc-5G`), **billing/entitlement indicator** (M7 `Doc-5I`, boolean/numeric/enum not name-string), **AI advisory panel** (M9 `Doc-5K`, regenerable, graceful-absence, §8-non-disclosure-bound), **conversation-thread presentation** (M6 `Doc-5H` via the Doc-7C shell slot). **Notification center = Doc-7C**, not here. Surfaces compose, never re-implement; contract owner stays the module.

**Status primitives (BR9):** loading/skeleton · empty-state · **error-state** · **not-found** — the latter two encode the non-disclosure presentation contract once: **no protected enrichment** (`Doc-7A §5.4`, spanning error-state **and** `form-field`/`field_errors`) and **not-found ≡ genuine absence** (`Doc-7A §8.2`).

**Baseline (BR6/BR7/BR8):** WCAG-AA; i18n/localization-ready (locale set not fixed by Doc-7); **currency-display per value field, default BDT, never assumed** (`Doc-2 §0.4`); responsive; RSC-compatible (image/font optimization is the framework's `next/image`/`next/font`, owned by Doc-7C, consumed by the kit).

**Conformance (BR11):** runs the applicable Appendix A subset (`CHK-7-005/020/021/040–042/050/051/060–063/070/071/080/081`); marks `CHK-7-001–004/010–012/030/031` **N/A with reason** (no screen/contract-binding/active-org/lifecycle in the kit).

---

## Carried into Doc-7C…7H

`DR-7-SHELL` (Doc-7C frozen next, before surfaces) · `DR-7-API` (surfaces bind contracts; the kit renders props) · `DR-7-STATE` · `[ESC-7-API]` · `[ESC-7-POLICY]` · `[ESC-7-DESIGN]`. Resolved only via named channels.

**Next deliverable:** **Doc-7C — App Shell & Data Layer** (frozen second per DR-7-SHELL) — the App Router skeleton, the server-resolved active-org context + org-switcher, the typed Doc-5 API-client, the global notification center (composing Doc-7B primitives). Through the Board loop, gated by Doc-7A Appendix A.

*End of Doc-7B SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7B realizes Doc-7A's presentation conventions as the shared kit; presentation only; conforms to the frozen Doc-7A allocation table; coins nothing.*
