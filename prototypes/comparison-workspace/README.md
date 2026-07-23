# Buyer Comparison Workspace — Fresh Presentation (Prototype v0.1)

**Clickable prototype · NON-AUTHORITATIVE.** Coins nothing. A ground-up, enterprise presentation of
the **un-gated buyer comparison slice** — the frozen routes `/buy/rfqs/[rfqId]/compare` (Compare
Workspace) and `/buy/rfqs/[rfqId]/comparative-statement` (CS document). It holds fixed every frozen
route, contract, privacy rule, terminology, and arithmetic rule; it redesigns only the *presentation*.

```bash
npm run prototype comparison-workspace -- --port 8093     # → http://localhost:8093
```

Traceable to the approved plan `~/.claude/plans/ivendorz-quotation-comparison-warm-parrot.md` and the
committed FE slice (`af2a065`, `fe/account-referral-nav`). This is the **artifact for design review**
(architecture / UI / accessibility / print / responsive) of that slice's presentation direction.

## What this is for

The 20-section "Quotation Comparison Statement" plan mixed an un-gated core (compare 2–5 quotations,
render a printable Comparative Statement) with an ambitious gated layer (approval lifecycle, digital
approval, official `CS-####` series, platform PDF/Excel export, org letterhead/signatory defaults).
This prototype builds **only the un-gated core**, as a fresh workspace, and **never visually implies**
any gated capability exists. It gives the design direction a concrete surface to rule on instead of prose.

## The seven regions (owner's list)

| # | Region | What it shows |
|---|---|---|
| ① | **RFQ context header** | `Supplier comparison` · RFQ ref/title · project · currency · N quotations · a **"Descriptive · not ranked"** badge · a `Compare │ Document preview` mode switch |
| ② | **Quotation tray** | Every **disclosed** quotation in **System order** (never re-ranked); the buyer selects **2–5**. `aria-live` count; below 2 the uncheck is blocked, beyond 5 the check is blocked, each with a reason. |
| ③ | **Comparison matrix** | Sticky attribute rail + selected columns; descriptive attributes + **indicative** line items; lowest quoted total carries a neutral **"Lowest"** tag (arithmetic, with a "not a recommendation" tooltip). |
| ④ | **Commercial terms** | Per-vendor cards (subtotal · VAT · price basis · payment · LD · performance guarantee); the arithmetic-lowest card carries a neutral **"Lowest total"** badge. |
| ⑤ | **Private buyer evaluation** | Buyer **authors** every evaluative field (compliance / notes / recommendation / reasons / risk / remarks / wet-ink signatories). Signatory blocks offer a **"fill from your team" shortcut** (illustrative M1 roster) as an alternative to typing a name — either way it prints for a wet-ink signature. Desktop sticky aside (≥ `xl`); below `xl` a right **Sheet**. **Recommended starts blank and is never set from the lowest.** |
| ⑥ | **Document / Comparative Statement** | The `Document preview` tab and the dedicated **canonical print route** render the assembled A4-landscape statement, paginated **app-side** with a real **"Page N of M"**. Print / Save-as-PDF is the browser's own; Excel is a disabled stub. |
| ⑦ | **Responsive + print** | Two-column at `xl`; single column with the evaluation Sheet below; matrix/tray scroll in their own rails so **the page body never scrolls sideways**; print removes all app chrome via `display:none`. |

## Governance posture (what was deliberately done / not done)

- **Decision-support, never a decision** (Doc-3 §9.1) — the platform computes **arithmetic only** and
  **recommends no winner** (R6). No re-rank / re-sort / best / winner cue; no award affordance.
- **Lowest = arithmetic identification, never a recommendation.** Shown as a neutral tag/badge with an
  explanatory tooltip — never color as the sole signal.
- **"Buyer Evaluation Summary," never "Vendor Ranking."** All evaluative content is **buyer-authored**
  with a `†` provenance mark; the platform authors none of it.
- **Buyer-private stays private** (Inv #11). Evaluation, procurement purpose, and signatory names live in
  memory only — **never serialized to the URL** (only `selectedQuotationIds` mirrors to `?sel=`) and
  **never shown to vendors**. Notes are **not saved** (persistence is Wave-4 backend; no contract coined).
- **Quotation states** are the frozen Doc-4M §5.3 set, verbatim. **Money** is `BDT 745,000` — no
  trailing `.00`, per the platform-wide rule.
- **Sealed cells** render a `Sealed` marker (never a blank, never implying an under-quote).

### Parked / gated — present nowhere, implied nowhere (§2.9)

| Parked capability | Handle |
|---|---|
| Approval lifecycle · CS as a persisted entity · digital approval + hash | `ESC-CS-DOCKIND` |
| Official `CS-YYYY-NNNNNN` series & revision numbering — **"Draft" only, zero `CS-####`** | `ESC-CS-REF` |
| Platform PDF / **Excel** export generation — **disabled stub**; printing is the browser's own | `ESC-CS-EXPORT` |
| Structured line-item schema — line items labeled **indicative** | `ESC-CS-LINEITEMS` |
| Buyer letterhead / branding + org signatory **defaults** — **placeholder block**, wet-ink signatures; the team-member picker fills a name per-document only, never persists an org default | `ESC-CS-LETTERHEAD` (+ M1) |
| Cross-RFQ **Received Quotes** list | `ESC-BUY-QUOTES-LIST` (see the `buyer-quotations` prototype) |

No comparison audit-event, domain event, or `can_*_comparison_statement` permission slug is invented.

## Reviewing it

- **Review notes** toggle (top banner) — dashed annotation cards state each region's governance posture;
  turn off for a production-like read.
- **Tray:** select 2–5; the matrix, terms, and document reflect exactly the selection. Because the demo
  RFQ **rfq-000119 has six disclosed quotations**, this prototype exercises the **max-5 cap** that the
  built slice's fixtures (≤ 3 quotations) could not. The **RFQ switcher** (top banner) also offers
  **rfq-000123 (2 quotations)** to show the **minimum-2** floor (neither card can be deselected).
- **Initializer:** the `?sel=` param is normalized — a bad value falls back to the default; duplicates
  and unknown ids are dropped, System order restored, capped at 5. Two demo links are in the first review
  note.
- **State retention:** type into the evaluation, switch `Compare ⇄ Document preview`, or open the
  printable document — the private edits carry over and are **never** in the URL.
- **Print:** the document tab's "Open printable document →" opens the canonical route; Print / Save-as-PDF
  produces the A4-landscape statement with the deterministic page count and no app chrome.
- Inert chrome (sidebar, topbar, other destinations) explains itself via a toast instead of dead links.

Demo data is illustrative seed per prototype convention, reusing the app's mock `rfq-universe`
(RFQ-2026-000119 transformer servicing · RFQ-2026-000123 boiler feed-water pumps · vendors Dhaka Power /
Eastern Grid / Rupsha / Ashuganj / Titas / Bengal / Meghna / Padma). Per-vendor line totals reconcile
exactly to each quoted total. Demo clock ≈ Jul 5, 2026. Buyer org: Crescent Textile Mills Ltd.
