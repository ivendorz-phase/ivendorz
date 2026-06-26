# Doc-7A — Frontend Realization Metastandard — **Content Pass-3 (§10–§12 + Appendix A)**

| Field | Value |
|---|---|
| Status | **CONTENT PASS-3 (DRAFT)** — realizes §10–§12 + Appendix A check IDs of `Doc-7A_Structure_v1.0_FROZEN`. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7A FROZEN |
| Date | 2026-06-26 |
| Realizes (structure) | `Doc-7A_Structure_v1.0_FROZEN` §10–§12 + Appendix A; R11 (§10) · R12 (§11) · conformance (§12) |
| Carries forward | Pass-1 §3.7 wired-only · Pass-2 §5–§9 (error/pagination/state/non-disclosure/AI) |
| Posture | Reference-never-restate; mechanism only. Coins **nothing** |

> **Scope:** the *baseline & closeout* conventions — accessibility/i18n/currency/performance (§10), out-of-frontend boundary (§11), conformance & carried items (§12) — and the assignment of stable **`CHK-7-xxx`** check IDs to the nine Appendix A bands (the per-surface freeze gate for Doc-7B…7H).

---

## §10 — Accessibility, i18n, Currency & Performance Baseline *(mechanism only)*

### §10.1 Accessibility baseline
Every surface inherits (from Doc-7B) a **WCAG-AA** target: semantic markup, keyboard operability, visible focus order, ARIA where the kit primitive requires it, and color-contrast compliance. Accessibility is a Doc-7B kit property the surfaces consume; the a11y **test** obligation is Doc-8's.

### §10.2 Internationalization / localization readiness
The UI is **i18n / localization-ready** — copy is externalized and translatable, layout tolerates text expansion and RTL where a locale requires it. **The locale set is a product requirement, not fixed by Doc-7** (structure C-4). Localized copy is **presentation** (§6); the authoritative data is module-owned and never duplicated into a translation layer.

### §10.3 Currency display (corpus-grounded)
Monetary values are displayed **per value field with the currency carried by that field, default `BDT`, never assumed** (`Doc-2 §0.4` — "currency captured explicitly on every value field"; Master Architecture line 79). The UI **reads** the currency adjacent to each amount from the contract; it never hardcodes a currency symbol or infers one. Multi-currency display is presentation over contract-provided `{amount, currency}` pairs.

### §10.4 Performance contract (App Router)
Surfaces realize the App Router performance posture: **RSC streaming** with route-segment suspense boundaries (Pass-1 §3.5), image/font optimization, and minimal client-JS (Server-Component default — Pass-1 §3.3). These are realization conventions; the performance **budget/test** is Doc-8's. None of §10 coins a domain element.

---

## §11 — Out-of-Frontend Boundary *(boundary statement — authors no surface)*

### §11.1 The frontend owns no authoritative state (R12)
The frontend holds **only ephemeral view/interaction state**; all truth is fetched via wired Doc-5 contracts (§5.1) and persisted server-side. No UI component is the authoritative owner of business state.

### §11.2 Files, realtime, caches
- **File blobs → Supabase Storage** via the contract-mediated path: the UI holds a **`file_ref`/path**, never authoritative binary (`Doc-2 §9`; CLAUDE.md §2). Upload/download go through the contract surface.
- **Supabase Realtime** is a **transport** for live updates, not a store: a realtime event prompts a re-fetch/reconcile against the authoritative contract (§7.2), never becomes the source of truth.
- **Client data caches** (query-cache libraries) are **disposable projections** (R12) — invalidated/refetched, never authoritative; consistent with the AI-panel disposability (§9.2).

### §11.3 Flag-and-halt
If any UI component is proposed as the **authoritative owner** of business state (a blob store, an offline write log treated as truth, a client cache promoted to source-of-truth), **flag-and-halt** — that is an out-of-frontend artifact and cannot be a Doc-7 authoritative surface.

---

## §12 — Conformance & Carried Items

### §12.1 Per-surface freeze obligation
Each Doc-7B…7H document, before freeze, **(1)** passes **Appendix A** (`CHK-7-xxx`, below) and **(2)** clears every carried `[ESC-7-*]` via its named additive channel (human-approved) — never locally (`Doc-5 Governance Note §8 rules 1, 3`).

### §12.2 Carried-items register (by pointer)
`DR-7-SHELL` (Doc-7B + Doc-7C freeze before surfaces) · `DR-7-API` (Doc-5 consumability cross-check; `[ESC-7-API]` on an unservable need) · `DR-7-STATE` (Doc-4M drives lifecycle UI — §7) · `[ESC-7-API]` (additive Doc-5x patch, Board) · `[ESC-7-POLICY]` (additive `Doc-3 §12.2` patch) · `[ESC-7-DESIGN]` (embedded-component allocation). Defined in `Doc-7A_Structure_v1.0_FROZEN`; resolved only via named channels.

### §12.3 Doc-7A coins nothing and authors no surface
Doc-7A is the convention layer; every surface, route, layout, component, and screen is realized in Doc-7B…7H against §0–§12. No domain or API element is introduced.

---

## Appendix A — Doc-7 Frontend Realization Conformance Checklist (`CHK-7-xxx`)

> The per-surface freeze gate for Doc-7B…7H (the FE-program analog of Doc-5A/Doc-6A Appendix A). Binary pass/fail; each check names its authoritative source. Bands from the frozen structure; check IDs assigned here.

### Band A — Contract-binding (R2/R4; Pass-1 §3.7, Pass-2 §5)
| ID | Check | Source |
|---|---|---|
| `CHK-7-001` | Every screen read/write/list maps to a **frozen, caller-facing wired** Doc-5x contract; no out-of-wire/internal-service contract is frontend-called | Pass-1 §3.7; `Doc-5C §C3`, `Doc-5I §10` |
| `CHK-7-002` | Lists consume cursor pagination (`page_size`/`cursor`/opaque `next_cursor`); offset/page-number forbidden; `page_size` via `*.list_page_size_max` POLICY key, never a literal | `Doc-5A §8`; `Doc-4A §9.6`; `Doc-3 §12` |
| `CHK-7-003` | Mutations carry a **stable** idempotency key per logical submission within `*.idempotency_dedup_window` | `Doc-3 §12`; Pass-2 §5.6 |
| `CHK-7-004` | Errors branch on `error.error_class`/`error_code` (never status alone); class→status per `Doc-5A §6.2`; no class/code/status invented; `reference_id` surfaced | `Doc-5A §6.2`; `Doc-4A §12.3` |

### Band B — Active-org / authorization (R6/R7; Pass-1 §4)
| ID | Check | Source |
|---|---|---|
| `CHK-7-010` | Active org resolved **server-side** (`Iv-Active-Organization`); client org ID never trusted | `Doc-4A §5.3`; `Doc-5A §7`; CLAUDE.md §5 |
| `CHK-7-011` | UI permission/entitlement gate is **UX over server re-validation**; enforcement inside each wired contract; entitlement read as boolean/numeric/enum, never plan-/role-name string | Pass-1 §4.3; Invariant #10; `Doc-5I R10` |
| `CHK-7-012` | Hybrid participation mounts Buyer + Vendor surfaces under one org; Admin console carries no active-org | Invariant #2; `Doc-5A §7.3` (via `Doc-5C R2`); `Doc-5J` |

### Band C — Content ≠ Presentation (R5; Pass-2 §6)
| ID | Check | Source |
|---|---|---|
| `CHK-7-020` | Presentation owns no content; content fetched by reference, never reshaped client-side | Invariant #9; `Doc-4A §10.1` |
| `CHK-7-021` | Display sort/filter never re-ranks governed M3 matching; microsite content is M2-owned across surfaces | `Doc-5E`; `Doc-5D`; Pass-2 §6.2/§6.3 |

### Band D — State-machine UI (R9; Pass-2 §7)
| ID | Check | Source |
|---|---|---|
| `CHK-7-030` | Offerable transitions = **Doc-8-conformance-tested build-time encoding** of the Doc-4M set, candidate-selected by contract-reported state; **server is final authority** (STATE/CONFLICT 409 → reconcile); no state/edge/label invented | `Doc-4M`; Pass-2 §7.1 |
| `CHK-7-031` | CONFLICT → refresh + idempotent retry; STATE → re-derive offerable transitions, no blind retry | `Doc-5A §6.2`; Pass-2 §7.2 |

### Band E — Non-disclosure / privacy (R8; Pass-2 §8)
| ID | Check | Source |
|---|---|---|
| `CHK-7-040` | Vendor experience **byte-equivalent** (excluded ≡ non-matched); no exclusion signal in any view/count/notification/error | Invariant #11; `Doc-4A §7.5` |
| `CHK-7-041` | Protected-fact collapse renders `NOT_FOUND` identical to genuine absence (copy/layout/timing/telemetry); 403 only where right-to-know established | `Doc-5A §6.3`; `Doc-4A §12.6` |
| `CHK-7-042` | List items/`has_more`/`total_count`/facets apply the same exclusion set identically; cursor reveals no excluded count/existence; buyer-private CRM never on a vendor surface | `Doc-5A §8`; `Doc-4A §10.7`; Pass-2 §8.4 |

### Band F — AI advisory (R10; Pass-2 §9)
| ID | Check | Source |
|---|---|---|
| `CHK-7-050` | AI surfaces labeled advisory, non-authoritative, non-gating; consume only wired `Doc-5K` reads; treated as regenerable/TTL projection | Invariant #12; `Doc-5K R7` |
| `CHK-7-051` | AI advisory obeys §8 non-disclosure — never surfaces a protected/excluded or buyer-private datum, even as a suggestion | Pass-2 §9.1a; §8 |

### Band G — Baseline (R11; §10)
| ID | Check | Source |
|---|---|---|
| `CHK-7-060` | WCAG-AA (semantic/keyboard/focus/contrast) inherited from Doc-7B | §10.1 |
| `CHK-7-061` | i18n/localization-ready; copy externalized; locale set not fixed by Doc-7 | §10.2 |
| `CHK-7-062` | Currency displayed per value field, default BDT, never assumed/hardcoded | `Doc-2 §0.4`; §10.3 |
| `CHK-7-063` | RSC streaming / suspense / Server-Component default performance posture | §10.4; Pass-1 §3.3/§3.5 |

### Band H — Out-of-frontend (R12; §11)
| ID | Check | Source |
|---|---|---|
| `CHK-7-070` | No UI component owns authoritative business state | §11.1 |
| `CHK-7-071` | Blobs via Storage `file_ref` (no binary); Realtime/cache are disposable, re-reconciled, never source of truth | `Doc-2 §9`; CLAUDE.md §2; §11.2 |

### Band I — Realize-never-redecide (R2; all passes)
| ID | Check | Source |
|---|---|---|
| `CHK-7-080` | No contract/route/field/permission slug/entitlement key/state/edge/event/audit action/POLICY key coined; every element traces to a Doc-2/3/4M/5 pointer | R2; `Doc-5 Governance Note §3/§7` |
| `CHK-7-081` | Every gap is an `[ESC-7-*]` escalated via its named additive channel (human-approved), never resolved locally | `Doc-5 Governance Note §7/§8` |

**Total: 25 checks across 9 bands (A–I).** Each Doc-7B…7H freeze runs the full set; a FAIL blocks freeze (governance §8 rule 1).

---

## Pass-3 self-check (pre-review)

- **Mechanism only:** §10–§12 author no surface; Appendix A is a checklist, not a screen.
- **Coins nothing:** 0 new module/contract/route/field/permission/state/event/audit/POLICY key. Currency/i18n/Storage/Realtime all bound by pointer (`Doc-2 §0.4/§9`, CLAUDE.md §2).
- **Check IDs** stable (`CHK-7-001…081`), each naming a source; bands match the frozen structure's Appendix A skeleton (9 bands).
- **Open for review:** confirm band/check coverage is complete vs R1–R12 (every R has ≥1 check); confirm no check restates rather than references; verify the `CHK-7-012` Admin/Hybrid anchor attribution matches Pass-1 C-3 (via `Doc-5C R2`).

*End of Content Pass-3 (§10–§12 + Appendix A) — DRAFT. Realizes `Doc-7A_Structure_v1.0_FROZEN` §10–§12 + Appendix A. Nothing coined; no frozen document edited. Next: Independent Hard Review → Fix → short closure check → Content Freeze Audit → Doc-7A FROZEN.*
