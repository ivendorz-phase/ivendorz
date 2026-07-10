# Prototype — Public `/vendors` vs Buyer `/discover` (SEO indexing separation)

**Type:** High-fidelity **visual prototype** (presentation only — **no production code**).
**Status:** Approved as the visual reference for implementing the SEO policy once the Wave-4
authentication layer is wired.
**Area:** `prototypes/` (v1.1 P-4 registered area — non-authoritative under the frozen corpus).

Open [`index.html`](./index.html) directly in a browser. It is fully self-contained (all CSS inline,
no external assets, no build step) and theme-aware (light/dark).

---

## The problem it solves

Two routes render the **same vendor catalog** from the same M2 public reads
(`marketplace.list_vendor_directory.v1` / `search_catalog.v1`), yet must have **opposite** SEO
postures:

| Surface | Route group | Audience | Google |
|---|---|---|---|
| **P-PUB-12** Vendor Directory | `app/(public)/vendors` | anonymous, public | **must index** — canonical + sitemap |
| **P-BUY-02** Buyer Discover | `app/(app)/(buyer)/discover` | signed-in buyer | **must never index** — `noindex`, behind auth |

If a crawler reaches both, they read as near-duplicate listings and split ranking signal. The
prototype makes the required separation unmistakable.

## What the prototype shows

1. **Twin browser mockups** — the identical vendor cards rendered in the *public marketing chrome*
   (`/vendors`) vs the *navy AppShell* (`/discover`), each with its URL bar, index/noindex pill, and
   its document `<head>` (`robots`, `canonical`, `openGraph`).
2. **Authentication-boundary diagram** — public-internet → `/vendors` (index/sitemap/canonical) above
   the line; buyer-login → `/discover` (noindex/no-sitemap/internal) below it.
3. **SERP verdict strip** — `/vendors` appears as a rich result; `/discover` is stamped *never indexed*.
4. **Fix tiers** — *safe-now conformance* vs *Wave-4 / ADR-024 gated*.

## Decisions captured

- **Structured data (e.g. `ItemList`) is intentionally OUT OF SCOPE.** Canonical, robots, sitemap,
  and the auth boundary solve the duplicate-indexing problem; structured data is an implementation
  enhancement that deserves its **own Architecture Board decision** under the SEO Authority Matrix.
- Vendor identities mirror the shared discovery seed / `MOCK_VENDORS` (aligned, not a second catalog).
  Jamuna Electrical renders **without** a Verified badge — unverified is absence, never a fabricated
  state.

## Implementation tiers (for when this is built)

**Safe-now — pure conformance, no architecture:**
- `robots: { index: false, follow: false }` on the `(app)` route-group metadata.
- Self-canonical on `/vendors` via the existing URL builder.
- Realizes SEO Authority Matrix rows 8 & 10 — mints no new authority.

**Gated — Wave-4 & ADR-024, human Board:**
- Middleware auth boundary for the `(app)` route group.
- Host-aware `robots.txt` + apex `sitemap-index` (ADR-024 Decision 9 — **not** a flat disallow list).
- `ItemList` / structured data — separate composing decision under ADR-025.

## Authority (reference-never-restate, CLAUDE.md §11)

The SEO policy is **already FROZEN** — this prototype realizes it, it does not coin it.

- **Source of truth:** `governanceReviews/URL-NAMING-SEO-REVIEW-ADJUDICATION_v1.0.md` (FROZEN v1.0,
  2026-07-06) → **SEO Authority Matrix**.
  - Row 8 — private app surfaces (workspace/account/admin): no public URL exists, nothing indexed.
  - Row 9 — apex sitemap-index → canonical hosts; each serves its own platform-generated robots.txt.
  - Row 10 — one resource = one canonical URL; builder-only emission.
- **Grounded in:** ADR-024 (Canonical Vendor Subdomain URLs) · ADR-025 (Marketplace Public URL Law) ·
  Doc-4D CanonicalHost Patch v1.0.2 · Doc-7C auth boundary.

On any divergence from a pointed-to frozen source, **that source wins** and this prototype is the one
patched.

---

*Hosted review copy (Claude Artifact): the repository copy here is the authoritative, permanent record.*
