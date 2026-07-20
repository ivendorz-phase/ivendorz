# Digital Showcase — Sidebar IA Rearrangement

> **Stage-3 clickable prototype — NON-AUTHORITATIVE, coins nothing.** Compares the shipped
> Digital Showcase sidebar group against two rearrangement options. Every href shown is an
> existing production route; labels marked **PROPOSED** await owner approval. On any conflict
> with a frozen document: **Flag-and-Halt** (CLAUDE.md §11).

## Purpose

The shipped "Digital Showcase" nav group is one accordion with 9 flat children. This prototype
shows a restructure that keeps **all 9 entries** (owner constraint: rearrange only, delete
nothing) and changes **only** `vendor-shell-vm.ts` presentation config:

- **Option A (recommended)** — "Digital Showcase" becomes a labeled *section* (like Trust /
  Communication); the 3-step builder journey gets top billing as a flat item (proposed rename
  **"Showcase Builder"**); the 8 destinations split into **Content** (Company Profile, Products,
  Projects, Categories, Spec Library) and **Publish & Promote** (Microsite & Branding,
  Advertising, View Public Page) — mirroring the frozen **Content ≠ Presentation** seam
  (Invariant #9 / Golden Rule 4).
- **Option B (minimal)** — keeps the single accordion, only reorders children into the same
  logical run.

Uses only shell primitives that already exist (`NavSection.label`, one-level
`NavItem.children`) — zero shell-type changes, zero route changes.

## Run

```bash
npm run prototype digital-showcase-nav   # → http://localhost:8080
```

Static file only — no build, no backend. Click group headers to collapse/expand; click a leaf to
preview its active state.
