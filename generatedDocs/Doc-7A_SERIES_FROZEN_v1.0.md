# Doc-7A — Frontend Realization Metastandard — **SERIES FROZEN v1.0**

| Field | Value |
|---|---|
| Status | **FROZEN v1.0** (2026-06-26) — structure + content + Appendix A. Independent Hard Reviews + Structure Freeze Audit + Content Freeze Audit all PASS (0 open BLOCKER/MAJOR/MINOR) |
| Document | **Doc-7A** — the Frontend Realization Metastandard (the Doc-5A/Doc-6A analog for the frontend program). Governs Doc-7B…7H via Appendix A (`CHK-7-xxx`) |
| Program | **Doc-7 — Frontend Realization** (presentation sibling of Doc-5 API / Doc-6 Database) |
| Realizes | Frozen **Doc-5 API surface** (`Doc-5A…5K`) + **Doc-4M** state machines + **Doc-2 v1.0.3** §6/§7/§0.4 + **Doc-3** §12 POLICY keys — on Next.js 15 App Router + React + Tailwind + shadcn/ui |
| Authority binding | **Conforms** to Doc-4M/Doc-2 (upstream, rank-0); **consistent with** the frozen Doc-5 surface (sibling — no Doc-5A conformance authority over Doc-7; `Doc-5 Governance Note §8 rule 5`) |
| Coins | **Nothing** — no module, contract, route, field, permission slug, entitlement key, state, edge, event, audit action, or POLICY key |

---

## Effective set (read these)

| Layer | Artifact(s) |
|---|---|
| Structure | `Doc-7A_Structure_v1.0_FROZEN` (= `Doc-7A_Structure_Proposal_v0.1` + `Doc-7A_Structure_Patch_v0.1.1`) |
| Content §0–§4 | `Doc-7A_Content_v1.0_Pass1` + `Doc-7A_Content_Pass1_Patch_v1.0.1` |
| Content §5–§9 | `Doc-7A_Content_v1.0_Pass2` + `Doc-7A_Content_Pass2_Patch_v1.0.1` |
| Content §10–§12 + Appendix A | `Doc-7A_Content_v1.0_Pass3` + `Doc-7A_Content_Pass3_Patch_v1.0.1` |
| Freeze gates | `Doc-7A_Structure_Freeze_Audit_v1.0` · `Doc-7A_Content_Freeze_Audit_v1.0` |
| Provenance | `Doc-7A_Structure_Independent_Hard_Review_v0.1` · `Doc-7A_Content_Pass{1,2,3}_Independent_Hard_Review_v1.0` · `Doc-7A_Content_Pass1_Closure_Check_v1.0` |

---

## What Doc-7A fixes (summary — authoritative text is the effective set)

**Program shape (R1):** metastandard + **surface-partitioned** realizations — Doc-7B Design System + Doc-7C App Shell *(frozen first)*, then Doc-7D Public · 7E Account/Identity · 7F Buyer · 7G Vendor · 7H Admin. Cross-surface embedded components (M5 badge, M6 notification center + thread, M7 billing, M9 AI panel) have a **single defining document**; surfaces compose, never re-implement.

**R-set R1–R12:** realize-never-redecide (R2) · stack = Next.js 15 App Router/React/Tailwind/shadcn (R3) · Doc-5 consistency, wired-only (R4) · Content≠Presentation (R5) · server-resolved active-org, Hybrid mounts both (R6) · app-layer authz, UI gate = UX (R7) · byte-equivalence non-disclosure (R8) · Doc-4M-driven UI (R9) · AI advisory-only (R10) · a11y/i18n/currency/perf baseline (R11) · out-of-frontend boundary (R12).

**Load-bearing conventions:**
- **§3.7 wired-contracts-only** — the frontend (incl. its server layer) consumes only the **caller-facing wired** Doc-5 subset; internal-service/out-of-wire contracts (`check_permission`, `resolve_entitlements`/`enforce_quota`) are never frontend-callable.
- **§5** — error branching on `error.error_class` (`Doc-5A §6.2`, never status alone); cursor-only pagination (`Doc-5A §8`, offset forbidden); POLICY-keyed `page_size`; stable idempotency key per submission.
- **§7** — offerable transitions = a **Doc-8-conformance-tested build-time encoding** of the Doc-4M set, candidate-selected by contract-reported state; **server is final authority**; CONFLICT→refresh+retry, STATE→re-derive (no blind retry).
- **§8** — protected-fact collapse to `NOT_FOUND` rendered identical to absence (`Doc-5A §6.3`); list exclusion-set consistency (`Doc-4A §10.7`); buyer-private CRM never on a vendor surface.
- **§9** — AI advisory non-authoritative/non-gating, regenerable, and §8-non-disclosure-bound.

**Appendix A:** **25 checks / 10 bands (A–J)** — Contract-binding · Composition · Active-org/authz · Content≠Presentation · State-machine · Non-disclosure · AI-advisory · Baseline · Out-of-frontend · Realize-never-redecide. Applicability preamble: surfaces run the full set; Doc-7B/7C run the applicable subset (N/A marked with reason). Every R1–R12 + the embedded-component single-owner rule has ≥1 check. A FAIL blocks freeze.

---

## Carried into Doc-7B…7H (per-document gates)

`DR-7-SHELL` (Doc-7B + Doc-7C freeze before surfaces) · `DR-7-API` (Doc-5 consumability cross-check; `[ESC-7-API]` on an unservable need) · `DR-7-STATE` (Doc-4M drives lifecycle UI) · `[ESC-7-API]` (additive Doc-5x patch — Board, human-approved) · `[ESC-7-POLICY]` (additive `Doc-3 §12.2` patch) · `[ESC-7-DESIGN]` (embedded-component allocation). Resolved only via named channels, never locally.

**Next deliverable:** **Doc-7B — Design System & Component Kit** (frozen first per DR-7-SHELL), through the Board loop, gated by Doc-7A Appendix A (applicable subset).

*End of Doc-7A SERIES FROZEN v1.0. Effective set above is authoritative; this manifest only points. Doc-7A realizes the frozen Doc-5 surface + Doc-4M as Next.js App Router UI; conforms to Doc-4M/Doc-2; consistent with Doc-5 (not conformant — §8 rule 5); coins nothing.*
