# iVendorz — ESC Registry (single source)

**Role:** Lead Product Designer + Frontend UI Engineer
**Status:** **DRAFT v0.3** — ESC Registry (non-authoritative companion; the single source for escalation handles)
**Date:** 2026-06-29
**Wave:** 0.3 — Governance Refactor (foundation)
**Companions:** all design-wave docs reference this; see [`shared_conventions.md`](shared_conventions.md)

---

## 0. Purpose & rules

This is the **one place** every escalation (`[ESC-…]`) is defined. Other docs **reference the handle
only** (e.g. "Future: `ESC-7-API/upload`") and **never re-explain** it. The handles are **escalation
pointers, not architecture** — each names a gap in the frozen wired surface that must be resolved via
its **named channel (additive Doc-5x/Doc-3 patch, Board) — never locally** (Doc-7C §0.3; CLAUDE.md §11).
This registry **coins no contract** — it records what is *absent* and the agreed interim presentation.

Precedence: non-authoritative; on conflict the frozen corpus wins.

---

## 1. Registry

| Handle | Scope / gap | Interim presentation | Channel |
|---|---|---|---|
| **`ESC-7-API-CATNAV`** | `list_categories` has **no Public projection** → public Industrial Category Explorer tree blocked | Render `search_catalog` facets only; counts via facet aggregation | Additive Doc-5D public-projection patch (Board) |
| **`ESC-7-API-PRODDETAIL`** | `get_product` is User-only → **no anonymous product detail page** | Products render from `search_catalog` results | Additive Doc-5D patch (Board) |
| **`ESC-7-API-ADS`** | ad reads are User-only → **no anonymous ads** | Ads not rendered on the Public surface | Additive Doc-5D patch (Board) |
| **`ESC-7-API/upload`** | No client-facing **upload-grant** (signed-URL issuance) in the wired surface | Blobs to Supabase Storage; contract carries `file_ref` only | Additive Doc-5x/Doc-4B patch (Board) |
| **`ESC-7-API/export`** | No dedicated **bulk-export** contract | Export only user-readable (exclusion-applied) data; large export via create-then-poll | Additive Doc-5x patch (Board) |
| **`ESC-7-API/related`** | No **related-products / similar-suppliers** recommendation contract | Show same-category facets, labelled "Same category" — never "Recommended" | Additive Doc-5x patch / future M9 (Board) |
| **`ESC-7-API/stats`** | No **public marketplace-statistics** read | Omit, or show only contract-provided facet counts — never fabricated numbers | Additive Doc-5D patch (Board) |
| **`ESC-7-AI`** | A global conversational AI navigator/assistant beyond M9's wired `Doc-5K` advisory is absent | AI entry reserved "Coming Soon"; limited to `Doc-5K` non-recommending advisory | Additive Doc-5K patch / activation (Board) |
| **`ESC-IDN-DELEG-EXPIRY`** | `reinstate_delegation_grant` UI path pending (Doc-2 §5.10 unresolved) | Delegation reinstate action hidden until resolved | Identity channel (Board) |
| **`ESC-RFQ-POLICY`** / **`ESC-OPS-POLICY`** | Some idempotency dedup-window POLICY keys not yet registered | Use the named POLICY key once registered; never a UI literal | Additive Doc-3 §12.2 patch (Board) |

### Known non-ESC gaps (recorded, not escalations)
- **Industry / Brand / Standard / Manufacturer taxonomies** are **not modeled** in the frozen corpus.
  Navigation may *reference* them as wayfinding dimensions but **coins no data model**; introducing any
  is a module-ownership / architecture decision (escalate), not an IA/UX decision. See `IA §5.3`, `GL`.

---

## 2. How docs cite ESC

- A page/section/template names the handle in its `Future:` or a delta line — **no explanation**.
- This registry is the only place gap + interim + channel are described.
- If a new gap is discovered, **add a row here** (record the absence + interim + channel); **do not
  invent a contract** anywhere.

---

*Non-authoritative. Conforms upward; coins nothing. Each handle resolves only via its named channel,
never locally. On any conflict the frozen document wins.*
