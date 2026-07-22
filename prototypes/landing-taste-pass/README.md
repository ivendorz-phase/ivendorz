# Landing Taste Pass — Current ⇄ Proposed (Stage-3 prototype)

**NON-AUTHORITATIVE design artifact.** A decision prototype for the 2026-07-22 design-taste audit
of the public landing page (P-PUB-01). It renders the live landing page as its **Current** baseline
and lets the reviewer toggle each raised finding (F1–F8) individually, or flip the whole page with
**All current / All proposed**, so every finding can be ruled on by direct comparison rather than
by description.

## Run

```bash
npm run prototype landing-taste-pass        # → http://localhost:8080
```

## What is being decided

| # | Sev | Finding | Proposed |
|---|-----|---------|----------|
| F1 | MAJOR | 6 consecutive uppercase eyebrows on 9 sections (taste cap: 3, never adjacent) | Keep "Start here" + "How it works" only |
| F2 | MINOR | Trust micro-strip inside the hero (duplicated + odd "Quotes as scheduled" claim) | Remove; claims live in FAQ / CTA band |
| F3 | MINOR | Three labels for one conversion intent (all route to sign-in) | "Post an RFQ" everywhere |
| F4 | MINOR | Logo marquee auto-scrolls six EMPTY placeholder slots | Static row until real permissioned logos exist |
| F5 | NIT | Mono "01"–"04" badges on How-it-works steps | Icon-only |
| F6 | OBS | "HUB" mid-sentence all-caps in the H1 | "Hub" title case (corpus-tagline question noted) |
| F7 | OBS | "Published-only, always current" freshness claim (nothing is fetched yet) | "Published listings only" |
| F8 | MINOR | FAQ promises recurring RFQs / standing shortlists / scheduled reorders (unverified vs Doc-4E) | "Yes. You can post one-off or repeat requests." |

**Not shown as toggles** (already applied to the working tree as the Current baseline of this
prototype): em-dash removal across all visible landing copy, and the two FAQ de-fabrications
(success-fee pricing claim; quote-timing SLA) that conflicted with GI-03 / the frozen M7
monetization posture.

## Governance

- Coins nothing. Copy, seed data (discovery/seed.ts verbatim), tokens (globals.css verbatim), and
  section order mirror the live page. Icons are the production lucide path data, inlined.
- **F1 conflicts with the owner reference** (eyebrow on every section head; reference fidelity is
  binding) — it needs an owner ruling, not a dev fix.
- **F3 leaves "Create RFQ" untouched** — that label is spec-governed (landing_page_spec §2).
- The RFQ demo ticker keeps its "(Demo)" tags and "Demo preview" badge (GI-03) in both states.
- Review chrome (top bar + findings panel) hides under **Preview**; the marquee animations respect
  `prefers-reduced-motion` via the global reduce rule.

## Version linkage

Prototype **v0.1** · Audit: design-taste pass 2026-07-22 (chat session, findings F1–F8) ·
Baseline: landing PR #4 (CI green) + the same session's uncommitted copy fixes.
